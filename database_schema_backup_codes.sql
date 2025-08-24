-- Database Schema for Backup Codes Management
-- This shows how backup codes should be stored and tracked for one-time use

-- Table to store user backup codes
CREATE TABLE user_backup_codes (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id VARCHAR(50) NOT NULL,
    backup_code VARCHAR(20) NOT NULL,
    is_used BOOLEAN DEFAULT FALSE,
    used_at TIMESTAMP NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    expires_at TIMESTAMP NULL,
    INDEX idx_user_id (user_id),
    INDEX idx_backup_code (backup_code),
    INDEX idx_is_used (is_used)
);

-- Table to track backup code usage history
CREATE TABLE backup_code_usage_log (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id VARCHAR(50) NOT NULL,
    backup_code VARCHAR(20) NOT NULL,
    used_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    ip_address VARCHAR(45),
    user_agent TEXT,
    INDEX idx_user_id (user_id),
    INDEX idx_used_at (used_at)
);

-- Example data insertion
INSERT INTO user_backup_codes (user_id, backup_code) VALUES
('ADM68562F0C627A3935', 'A1B2C3D4'),
('ADM68562F0C627A3935', 'E5F6G7H8'),
('ADM68562F0C627A3935', 'I9J0K1L2'),
('ADM68562F0C627A3935', 'M3N4O5P6'),
('ADM68562F0C627A3935', 'Q7R8S9T0'),
('ADM68562F0C627A3935', 'U1V2W3X4'),
('ADM68562F0C627A3935', 'Y5Z6A7B8'),
('ADM68562F0C627A3935', 'C9D0E1F2');

-- Example of marking a backup code as used
-- This would be called when a user successfully logs in with a backup code
UPDATE user_backup_codes 
SET is_used = TRUE, used_at = CURRENT_TIMESTAMP 
WHERE backup_code = '0E704A55' AND user_id = 'ADM68562F0C627A3935';

-- Example of getting available backup codes for a user
SELECT backup_code 
FROM user_backup_codes 
WHERE user_id = 'ADM68562F0C627A3935' AND is_used = FALSE;

-- Example of getting remaining backup codes count
SELECT COUNT(*) as remaining_codes 
FROM user_backup_codes 
WHERE user_id = 'ADM68562F0C627A3935' AND is_used = FALSE;

-- Example of getting used backup codes
SELECT backup_code, used_at 
FROM user_backup_codes 
WHERE user_id = 'ADM68562F0C627A3935' AND is_used = TRUE;

-- Example of generating new backup codes (replaces all existing ones)
-- First, mark all existing codes as used
UPDATE user_backup_codes 
SET is_used = TRUE, used_at = CURRENT_TIMESTAMP 
WHERE user_id = 'ADM68562F0C627A3935';

-- Then insert new codes
INSERT INTO user_backup_codes (user_id, backup_code) VALUES
('ADM68562F0C627A3935', 'NEW1CODE'),
('ADM68562F0C627A3935', 'NEW2CODE'),
('ADM68562F0C627A3935', 'NEW3CODE'),
('ADM68562F0C627A3935', 'NEW4CODE'),
('ADM68562F0C627A3935', 'NEW5CODE'),
('ADM68562F0C627A3935', 'NEW6CODE'),
('ADM68562F0C627A3935', 'NEW7CODE'),
('ADM68562F0C627A3935', 'NEW8CODE');
