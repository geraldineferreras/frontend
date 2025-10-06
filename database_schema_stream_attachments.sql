-- Database Schema for Enhanced Teacher Stream Post with Multiple Link Attachments
-- This table stores multiple attachments (files, links, YouTube, Google Drive) for stream posts

-- Create stream_attachments table
CREATE TABLE IF NOT EXISTS `stream_attachments` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `stream_id` int(11) NOT NULL,
  `attachment_type` enum('file','link','youtube','google_drive') NOT NULL,
  `attachment_url` text NOT NULL,
  `file_name` varchar(255) DEFAULT NULL,
  `original_name` varchar(255) DEFAULT NULL,
  `file_size` bigint(20) DEFAULT 0,
  `mime_type` varchar(100) DEFAULT NULL,
  `title` varchar(255) DEFAULT NULL,
  `description` text DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `stream_id` (`stream_id`),
  KEY `attachment_type` (`attachment_type`),
  KEY `created_at` (`created_at`),
  CONSTRAINT `fk_stream_attachments_stream` FOREIGN KEY (`stream_id`) REFERENCES `classroom_stream` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Add indexes for better performance
CREATE INDEX `idx_stream_attachments_stream_type` ON `stream_attachments` (`stream_id`, `attachment_type`);
CREATE INDEX `idx_stream_attachments_type_url` ON `stream_attachments` (`attachment_type`, `attachment_url`(255));

-- Update classroom_stream table to support multiple attachments
-- Add column to track if post has multiple attachments
ALTER TABLE `classroom_stream` 
ADD COLUMN `has_multiple_attachments` tinyint(1) NOT NULL DEFAULT 0 
AFTER `attachment_url`;

-- Add index for multiple attachments
CREATE INDEX `idx_classroom_stream_multiple_attachments` ON `classroom_stream` (`has_multiple_attachments`);

-- Sample data for testing (optional)
-- INSERT INTO `stream_attachments` (`stream_id`, `attachment_type`, `attachment_url`, `file_name`, `original_name`, `file_size`, `mime_type`, `title`, `description`) VALUES
-- (1, 'link', 'https://www.example.com', 'example_com_1234567890.html', 'Example Website', 0, 'text/html', 'Example Website', 'A sample external link'),
-- (1, 'youtube', 'https://www.youtube.com/watch?v=dQw4w9WgXcQ', 'youtube_video_1234567890.mp4', 'Rick Roll Video', 0, 'video/mp4', 'Rick Roll Video', 'Classic Rick Astley song'),
-- (1, 'google_drive', 'https://drive.google.com/file/d/1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs74OgvE2upms/view', 'gdrive_document_1234567890.pdf', 'Google Drive Document', 0, 'application/pdf', 'Google Drive Document', 'Shared document from Google Drive');

-- View to get stream posts with all attachments
CREATE OR REPLACE VIEW `stream_posts_with_attachments` AS
SELECT 
    cs.*,
    GROUP_CONCAT(
        JSON_OBJECT(
            'id', sa.id,
            'type', sa.attachment_type,
            'url', sa.attachment_url,
            'file_name', sa.file_name,
            'original_name', sa.original_name,
            'file_size', sa.file_size,
            'mime_type', sa.mime_type,
            'title', sa.title,
            'description', sa.description
        ) SEPARATOR '||'
    ) as attachments_json
FROM `classroom_stream` cs
LEFT JOIN `stream_attachments` sa ON cs.id = sa.stream_id
GROUP BY cs.id;

-- Stored procedure to create stream post with multiple attachments
DELIMITER //
CREATE PROCEDURE `CreateStreamPostWithAttachments`(
    IN p_class_code VARCHAR(6),
    IN p_user_id VARCHAR(50),
    IN p_title TEXT,
    IN p_content TEXT,
    IN p_is_draft TINYINT(1),
    IN p_is_scheduled TINYINT(1),
    IN p_scheduled_at DATETIME,
    IN p_allow_comments TINYINT(1),
    IN p_assignment_type VARCHAR(20),
    IN p_student_ids JSON,
    IN p_attachments JSON
)
BEGIN
    DECLARE v_stream_id INT;
    DECLARE v_attachment_count INT DEFAULT 0;
    DECLARE v_attachment_type VARCHAR(20) DEFAULT 'none';
    DECLARE v_attachment_url TEXT DEFAULT NULL;
    DECLARE v_has_multiple TINYINT(1) DEFAULT 0;
    
    DECLARE EXIT HANDLER FOR SQLEXCEPTION
    BEGIN
        ROLLBACK;
        RESIGNAL;
    END;
    
    START TRANSACTION;
    
    -- Count attachments and determine type
    IF p_attachments IS NOT NULL AND JSON_LENGTH(p_attachments) > 0 THEN
        SET v_attachment_count = JSON_LENGTH(p_attachments);
        
        IF v_attachment_count = 1 THEN
            -- Single attachment
            SET v_attachment_type = JSON_UNQUOTE(JSON_EXTRACT(p_attachments, '$[0].type'));
            SET v_attachment_url = JSON_UNQUOTE(JSON_EXTRACT(p_attachments, '$[0].url'));
        ELSE
            -- Multiple attachments
            SET v_attachment_type = 'multiple';
            SET v_has_multiple = 1;
        END IF;
    END IF;
    
    -- Insert main stream post
    INSERT INTO `classroom_stream` (
        `class_code`, `user_id`, `title`, `content`, `is_draft`, `is_scheduled`,
        `scheduled_at`, `allow_comments`, `assignment_type`, `student_ids`,
        `attachment_type`, `attachment_url`, `has_multiple_attachments`, `created_at`
    ) VALUES (
        p_class_code, p_user_id, p_title, p_content, p_is_draft, p_is_scheduled,
        p_scheduled_at, p_allow_comments, p_assignment_type, p_student_ids,
        v_attachment_type, v_attachment_url, v_has_multiple, NOW()
    );
    
    SET v_stream_id = LAST_INSERT_ID();
    
    -- Insert attachments if any
    IF v_attachment_count > 0 THEN
        INSERT INTO `stream_attachments` (
            `stream_id`, `attachment_type`, `attachment_url`, `file_name`,
            `original_name`, `file_size`, `mime_type`, `title`, `description`
        )
        SELECT 
            v_stream_id,
            JSON_UNQUOTE(JSON_EXTRACT(att.value, '$.type')),
            JSON_UNQUOTE(JSON_EXTRACT(att.value, '$.url')),
            JSON_UNQUOTE(JSON_EXTRACT(att.value, '$.file_name')),
            JSON_UNQUOTE(JSON_EXTRACT(att.value, '$.original_name')),
            JSON_EXTRACT(att.value, '$.file_size'),
            JSON_UNQUOTE(JSON_EXTRACT(att.value, '$.mime_type')),
            JSON_UNQUOTE(JSON_EXTRACT(att.value, '$.title')),
            JSON_UNQUOTE(JSON_EXTRACT(att.value, '$.description'))
        FROM JSON_TABLE(p_attachments, '$[*]' COLUMNS (
            value JSON PATH '$'
        )) AS att;
    END IF;
    
    COMMIT;
    
    -- Return the created stream ID
    SELECT v_stream_id as stream_id;
END //
DELIMITER ;

-- Function to get attachment count for a stream post
DELIMITER //
CREATE FUNCTION `GetStreamAttachmentCount`(p_stream_id INT) 
RETURNS INT
READS SQL DATA
DETERMINISTIC
BEGIN
    DECLARE v_count INT DEFAULT 0;
    
    SELECT COUNT(*) INTO v_count
    FROM `stream_attachments`
    WHERE `stream_id` = p_stream_id;
    
    RETURN v_count;
END //
DELIMITER ;

-- Function to validate YouTube URL
DELIMITER //
CREATE FUNCTION `IsValidYouTubeUrl`(p_url TEXT) 
RETURNS TINYINT(1)
READS SQL DATA
DETERMINISTIC
BEGIN
    DECLARE v_is_valid TINYINT(1) DEFAULT 0;
    
    IF p_url REGEXP '^https://(www\\.)?youtube\\.com/watch\\?v=[a-zA-Z0-9_-]+$' OR
       p_url REGEXP '^https://youtu\\.be/[a-zA-Z0-9_-]+$' OR
       p_url REGEXP '^https://(www\\.)?youtube\\.com/embed/[a-zA-Z0-9_-]+$' THEN
        SET v_is_valid = 1;
    END IF;
    
    RETURN v_is_valid;
END //
DELIMITER ;

-- Function to validate Google Drive URL
DELIMITER //
CREATE FUNCTION `IsValidGoogleDriveUrl`(p_url TEXT) 
RETURNS TINYINT(1)
READS SQL DATA
DETERMINISTIC
BEGIN
    DECLARE v_is_valid TINYINT(1) DEFAULT 0;
    
    IF p_url REGEXP '^https://drive\\.google\\.com/file/d/[a-zA-Z0-9_-]+/view$' OR
       p_url REGEXP '^https://drive\\.google\\.com/open\\?id=[a-zA-Z0-9_-]+$' OR
       p_url REGEXP '^https://docs\\.google\\.com/document/d/[a-zA-Z0-9_-]+/edit$' THEN
        SET v_is_valid = 1;
    END IF;
    
    RETURN v_is_valid;
END //
DELIMITER ;

-- Trigger to update has_multiple_attachments when attachments change
DELIMITER //
CREATE TRIGGER `tr_stream_attachments_after_insert`
AFTER INSERT ON `stream_attachments`
FOR EACH ROW
BEGIN
    DECLARE v_count INT DEFAULT 0;
    
    SELECT COUNT(*) INTO v_count
    FROM `stream_attachments`
    WHERE `stream_id` = NEW.stream_id;
    
    IF v_count > 1 THEN
        UPDATE `classroom_stream` 
        SET `has_multiple_attachments` = 1,
            `attachment_type` = 'multiple'
        WHERE `id` = NEW.stream_id;
    END IF;
END //
DELIMITER ;

DELIMITER //
CREATE TRIGGER `tr_stream_attachments_after_delete`
AFTER DELETE ON `stream_attachments`
FOR EACH ROW
BEGIN
    DECLARE v_count INT DEFAULT 0;
    
    SELECT COUNT(*) INTO v_count
    FROM `stream_attachments`
    WHERE `stream_id` = OLD.stream_id;
    
    IF v_count = 0 THEN
        UPDATE `classroom_stream` 
        SET `has_multiple_attachments` = 0,
            `attachment_type` = 'none',
            `attachment_url` = NULL
        WHERE `id` = OLD.stream_id;
    ELSEIF v_count = 1 THEN
        -- Get the remaining attachment info
        SELECT `attachment_type`, `attachment_url` INTO @v_type, @v_url
        FROM `stream_attachments`
        WHERE `stream_id` = OLD.stream_id
        LIMIT 1;
        
        UPDATE `classroom_stream` 
        SET `has_multiple_attachments` = 0,
            `attachment_type` = @v_type,
            `attachment_url` = @v_url
        WHERE `id` = OLD.stream_id;
    END IF;
END //
DELIMITER ;
