# Enhanced Teacher Stream Post API Implementation

## Overview
This implementation enhances the teacher stream post API to support multiple link attachments including regular links, YouTube videos, and Google Drive documents. The system now handles both multipart/form-data and JSON payloads with comprehensive validation and database storage.

## Features

### Supported Attachment Types
1. **Regular Links** - General web URLs
2. **YouTube Links** - YouTube video URLs with validation
3. **Google Drive Links** - Google Drive document URLs with validation
4. **File Attachments** - Traditional file uploads
5. **Mixed Attachments** - Combination of files and links

### API Endpoints
- **POST** `/api/teacher/classroom/{class_code}/stream` - Create stream post with multiple attachments

## Backend Implementation

### 1. PHP Controller (`backend_teacher_stream_controller.php`)

The enhanced controller handles:
- JWT authentication validation
- Teacher access control to classrooms
- Multiple attachment types processing
- URL validation for YouTube and Google Drive
- Database transaction management

#### Key Functions:
- `validateJWTToken()` - JWT token validation
- `teacherHasAccessToClassroom()` - Access control
- `validateAttachment()` - Attachment validation
- `isValidYouTubeUrl()` - YouTube URL validation
- `isValidGoogleDriveUrl()` - Google Drive URL validation
- `createStreamPost()` - Database insertion

#### URL Validation Patterns:

**YouTube URLs:**
- `https://www.youtube.com/watch?v=VIDEO_ID`
- `https://youtu.be/VIDEO_ID`
- `https://www.youtube.com/embed/VIDEO_ID`

**Google Drive URLs:**
- `https://drive.google.com/file/d/FILE_ID/view`
- `https://drive.google.com/open?id=FILE_ID`
- `https://docs.google.com/document/d/DOC_ID/edit`

### 2. Database Schema (`database_schema_stream_attachments.sql`)

#### New Table: `stream_attachments`
```sql
CREATE TABLE `stream_attachments` (
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
  CONSTRAINT `fk_stream_attachments_stream` FOREIGN KEY (`stream_id`) REFERENCES `classroom_stream` (`id`) ON DELETE CASCADE
);
```

#### Enhanced `classroom_stream` Table
```sql
ALTER TABLE `classroom_stream` 
ADD COLUMN `has_multiple_attachments` tinyint(1) NOT NULL DEFAULT 0 
AFTER `attachment_url`;
```

#### Database Functions and Procedures
- `CreateStreamPostWithAttachments()` - Stored procedure for creating posts with attachments
- `GetStreamAttachmentCount()` - Function to count attachments
- `IsValidYouTubeUrl()` - YouTube URL validation function
- `IsValidGoogleDriveUrl()` - Google Drive URL validation function

#### Triggers
- `tr_stream_attachments_after_insert` - Updates main table when attachments are added
- `tr_stream_attachments_after_delete` - Updates main table when attachments are removed

## Frontend Implementation

### 1. Enhanced API Service (`src/services/api.js`)

#### New Methods:
```javascript
// Multiple link attachments only
async createTeacherStreamPostWithLinks(classCode, baseData = {}, links = [])

// Mixed attachments (files + links)
async createTeacherStreamPostWithMixedAttachments(classCode, baseData = {}, files = [], links = [])

// Existing method for files only
async createTeacherStreamPostWithFiles(classCode, baseData = {}, files = [])
```

#### Form Data Structure:
- **Link attachments**: `link_0`, `link_1`, `link_title_0`, `link_description_0`
- **YouTube attachments**: `youtube_0`, `youtube_1`, `youtube_title_0`, `youtube_description_0`
- **Google Drive attachments**: `gdrive_0`, `gdrive_1`, `gdrive_title_0`, `gdrive_description_0`
- **File attachments**: `attachment_0`, `attachment_1`, etc.

### 2. Enhanced ClassroomDetail Component (`src/views/examples/ClassroomDetail.js`)

#### Updated Attachment Handling:
```javascript
// Collect file and link attachments
const fileAttachments = (attachments || []).filter(att => att && att.file);
const linkAttachments = (attachments || []).filter(att => att && att.url && 
  (att.type === 'Link' || att.type === 'YouTube' || att.type === 'Google Drive'));

// Route to appropriate API method
if (fileAttachments.length > 0 && linkAttachments.length > 0) {
  // Mixed attachments
  response = await apiService.createTeacherStreamPostWithMixedAttachments(code, postData, files, linkAttachments);
} else if (fileAttachments.length > 0) {
  // Files only
  response = await apiService.createTeacherStreamPostWithFiles(code, postData, files);
} else if (linkAttachments.length > 0) {
  // Links only
  response = await apiService.createTeacherStreamPostWithLinks(code, postData, linkAttachments);
} else {
  // No attachments
  response = await apiService.createClassroomStreamPost(code, postData);
}
```

## API Request Formats

### 1. Multipart/Form-Data

#### Multiple Link Types:
```
Key: title
Value: Test Post with Multiple Links

Key: content  
Value: This post contains various types of links for testing

Key: link_0
Value: https://www.example.com

Key: link_title_0
Value: Example Website

Key: youtube_0
Value: https://www.youtube.com/watch?v=dQw4w9WgXcQ

Key: youtube_title_0
Value: Rick Roll Video

Key: gdrive_0
Value: https://drive.google.com/file/d/1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs74OgvE2upms/view

Key: gdrive_title_0
Value: Google Drive Document
```

#### Mixed Attachments:
```
Key: title
Value: Test Post with Files and Links

Key: content
Value: This post contains both files and links

Key: file_0
Type: File
Value: [Select a PDF or image file]

Key: link_0
Value: https://www.example.com

Key: youtube_0
Value: https://www.youtube.com/watch?v=dQw4w9WgXcQ
```

### 2. JSON Body

#### Multiple Link Types:
```json
{
  "title": "Test JSON Post with Multiple Links",
  "content": "This post contains various types of links for testing",
  "attachments": [
    {
      "type": "link",
      "url": "https://www.example.com",
      "title": "Example Website"
    },
    {
      "type": "youtube",
      "url": "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
      "title": "Rick Roll Video"
    },
    {
      "type": "google_drive",
      "url": "https://drive.google.com/file/d/1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs74OgvE2upms/view",
      "title": "Google Drive Document"
    }
  ]
}
```

## Response Format

### Success Response (200 OK):
```json
{
  "status": "success",
  "message": "Stream post created successfully",
  "data": {
    "stream_id": 123,
    "title": "Test Post with Multiple Links",
    "content": "This post contains various types of links for testing",
    "attachment_type": "multiple",
    "attachment_url": null,
    "created_at": "2024-01-15 10:30:00"
  }
}
```

### Error Response (400 Bad Request):
```json
{
  "status": "error",
  "message": "Invalid YouTube URL format",
  "data": null
}
```

## Testing

### Test File: `test_enhanced_teacher_stream_post.html`

The comprehensive test file includes:

1. **Multipart/Form-Data Testing**
   - Multiple link types
   - File attachments
   - Mixed attachments

2. **JSON Body Testing**
   - Multiple link types
   - Rich metadata

3. **Validation Testing**
   - Invalid URLs
   - Empty attachments
   - Single attachment
   - Authentication

4. **Edge Case Testing**
   - URL format validation
   - Error handling
   - Response verification

## Installation and Setup

### 1. Backend Setup
1. Copy `backend_teacher_stream_controller.php` to your backend directory
2. Run the SQL schema from `database_schema_stream_attachments.sql`
3. Configure database connection in the controller
4. Set up JWT validation logic

### 2. Frontend Setup
1. Update `src/services/api.js` with new methods
2. Update `src/views/examples/ClassroomDetail.js` with enhanced attachment handling
3. Test with the provided test file

### 3. Configuration
1. Set database connection parameters
2. Configure JWT secret
3. Set up CORS headers if needed
4. Configure file upload limits

## Security Considerations

### 1. Authentication
- JWT token validation required
- Teacher role verification
- Classroom access control

### 2. Input Validation
- URL format validation for YouTube and Google Drive
- File type and size restrictions
- SQL injection prevention with prepared statements

### 3. Access Control
- Teachers can only post to their assigned classrooms
- Student access is restricted to viewing only

## Performance Optimizations

### 1. Database
- Indexes on frequently queried fields
- Foreign key constraints for data integrity
- Efficient queries with JOINs

### 2. File Handling
- Asynchronous file processing
- File size validation
- MIME type detection

### 3. Caching
- Stream post caching for frequently accessed content
- Attachment metadata caching

## Troubleshooting

### Common Issues:

1. **401 Unauthorized**
   - Check JWT token validity
   - Verify teacher role
   - Check classroom access permissions

2. **400 Bad Request**
   - Validate URL formats
   - Check required fields
   - Verify attachment types

3. **500 Internal Server Error**
   - Check database connection
   - Verify table structure
   - Check server logs

### Debug Steps:
1. Enable error logging in PHP
2. Check database connection
3. Verify JWT token format
4. Test with simple URLs first
5. Check file permissions

## Future Enhancements

### 1. Additional Link Types
- Vimeo videos
- Dropbox links
- OneDrive links
- GitHub repositories

### 2. Enhanced Validation
- Link preview generation
- Content type detection
- Malware scanning

### 3. Advanced Features
- Link expiration dates
- Access control per attachment
- Analytics tracking
- Bulk link import

## Conclusion

This enhanced teacher stream post API provides a robust foundation for handling multiple types of attachments in educational content. The implementation supports both traditional file uploads and modern link-based content, making it easier for teachers to share diverse educational resources with their students.

The system is designed to be scalable, secure, and maintainable, with comprehensive validation and error handling. The provided test file ensures thorough testing of all functionality before deployment.
