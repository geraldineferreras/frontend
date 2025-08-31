# Stream Post Editing Implementation

## Overview

This document describes the complete implementation of stream post editing functionality for the SCMS (School Classroom Management System). The implementation allows teachers to edit both draft and published stream posts with full attachment management capabilities.

## Features

### ✅ **Complete Post Management**
- Create new stream posts with multiple attachments
- Edit existing posts (both draft and published)
- Full attachment replacement strategy
- Support for both files and external links

### ✅ **Attachment Support**
- **File Attachments**: Up to 5 files per post
- **Link Attachments**: Up to 3 external links per post
- **File Types**: PDF, DOC, Images, and other common formats
- **Link Types**: Regular URLs, YouTube, Google Drive, etc.

### ✅ **Flexible Input Methods**
- **Multipart/Form-Data**: For posts with file attachments
- **Application/JSON**: For text-only updates
- **Hybrid Support**: Mix of both methods

### ✅ **Security & Authorization**
- JWT token authentication
- Teacher-only access
- Classroom ownership verification
- Secure file upload handling

## API Endpoints

### 1. Create Stream Post
```
POST /api/teacher/classroom/{class_code}/stream
```

**Request Headers:**
```
Authorization: Bearer {jwt_token}
Content-Type: multipart/form-data
```

**Form Fields:**
- `title` (required): Post title
- `content` (required): Post content
- `is_draft`: 0 = published, 1 = draft
- `is_scheduled`: 0 = immediate, 1 = scheduled
- `scheduled_at`: ISO datetime string (if scheduled)
- `allow_comments`: 0 = disabled, 1 = enabled
- `assignment_type`: classroom, assignment, announcement
- `student_ids`: Comma-separated student IDs (optional)

**File Attachments:**
- `attachment_0` to `attachment_4`: File uploads (up to 5)

**Link Attachments:**
- `link_0` to `link_2`: URL strings (up to 3)

**Response:**
```json
{
  "status": "success",
  "message": "Stream post created successfully",
  "data": {
    "stream_id": 123,
    "class_code": "ABC123",
    "attachments_count": 3
  }
}
```

### 2. Edit Stream Post
```
PUT /api/teacher/classroom/{class_code}/stream/{stream_id}
```

**Request Headers:**
```
Authorization: Bearer {jwt_token}
Content-Type: multipart/form-data
```

**Form Fields:**
- `title`: New title (optional - keeps current if empty)
- `content`: New content (optional - keeps current if empty)
- `is_draft`: New draft status (optional - keeps current if empty)
- `is_scheduled`: New scheduling status (optional)
- `scheduled_at`: New schedule datetime (optional)
- `allow_comments`: New comment setting (optional)
- `assignment_type`: New assignment type (optional)
- `student_ids`: New student IDs (optional)

**File Attachments:**
- `attachment_0` to `attachment_4`: New files (optional - replaces all existing if provided)

**Link Attachments:**
- `link_0` to `link_2`: New links (optional - replaces all existing if provided)

**Response:**
```json
{
  "status": "success",
  "message": "Stream post updated successfully",
  "data": {
    "stream_id": 123,
    "class_code": "ABC123",
    "attachments_updated": true,
    "new_attachments_count": 2
  }
}
```

## Database Schema

### Stream Posts Table
```sql
CREATE TABLE classroom_stream_posts (
    id INT PRIMARY KEY AUTO_INCREMENT,
    teacher_id INT NOT NULL,
    classroom_id INT NOT NULL,
    title VARCHAR(255) NOT NULL,
    content TEXT NOT NULL,
    is_draft TINYINT(1) DEFAULT 0,
    is_scheduled TINYINT(1) DEFAULT 0,
    scheduled_at DATETIME NULL,
    allow_comments TINYINT(1) DEFAULT 1,
    assignment_type ENUM('classroom', 'assignment', 'announcement') DEFAULT 'classroom',
    student_ids TEXT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    INDEX idx_teacher (teacher_id),
    INDEX idx_classroom (classroom_id),
    INDEX idx_draft (is_draft),
    INDEX idx_scheduled (is_scheduled, scheduled_at)
);
```

### Stream Attachments Table
```sql
CREATE TABLE stream_attachments (
    id INT PRIMARY KEY AUTO_INCREMENT,
    stream_id INT NOT NULL,
    file_name VARCHAR(255) NULL,
    original_name VARCHAR(255) NULL,
    file_path VARCHAR(500) NULL,
    file_size INT NULL,
    file_type VARCHAR(100) NULL,
    link_url VARCHAR(500) NULL,
    attachment_order INT DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    INDEX idx_stream (stream_id),
    INDEX idx_order (attachment_order),
    
    FOREIGN KEY (stream_id) REFERENCES classroom_stream_posts(id) ON DELETE CASCADE
);
```

## Implementation Details

### File Structure
```
backend_teacher_stream_controller_enhanced.php  # Main controller
test_stream_post_editing.html                 # Testing interface
STREAM_POST_EDITING_IMPLEMENTATION.md         # This documentation
```

### Key Functions

#### 1. **handleCreateStreamPost()**
- Processes new post creation
- Handles both multipart and JSON input
- Manages file and link attachments
- Creates database records

#### 2. **handleEditStreamPost()**
- Processes post updates
- Verifies teacher ownership
- Implements attachment replacement strategy
- Updates database records

#### 3. **processAttachments()**
- Handles file uploads and link processing
- Generates unique filenames
- Saves to database with proper indexing

#### 4. **deleteStreamAttachments()**
- Removes old attachments when updating
- Deletes physical files
- Cleans up database records

### Attachment Replacement Strategy

When editing a post with new attachments:

1. **If new attachments provided**: All existing attachments are deleted and replaced
2. **If no new attachments**: Existing attachments remain unchanged
3. **File cleanup**: Old physical files are removed from server
4. **Database consistency**: Attachment records are properly updated

## Usage Examples

### Example 1: Create Post with Files
```bash
curl -X POST \
  -H "Authorization: Bearer your-jwt-token" \
  -F "title=Weekly Assignment" \
  -F "content=Please complete the attached worksheet" \
  -F "is_draft=0" \
  -F "attachment_0=@worksheet.pdf" \
  -F "attachment_1=@instructions.docx" \
  -F "link_0=https://youtube.com/watch?v=example" \
  http://localhost/api/teacher/classroom/ABC123/stream
```

### Example 2: Edit Post Content Only
```bash
curl -X PUT \
  -H "Authorization: Bearer your-jwt-token" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Updated Weekly Assignment",
    "content": "Updated instructions for the worksheet"
  }' \
  http://localhost/api/teacher/classroom/ABC123/stream/123
```

### Example 3: Replace All Attachments
```bash
curl -X PUT \
  -H "Authorization: Bearer your-jwt-token" \
  -F "title=Updated Assignment" \
  -F "attachment_0=@new_worksheet.pdf" \
  -F "link_0=https://drive.google.com/file/d/new-link" \
  http://localhost/api/teacher/classroom/ABC123/stream/123
```

## Testing

### Test Interface
Open `test_stream_post_editing.html` in your browser to test:

1. **Create Tab**: Test post creation with attachments
2. **Edit Tab**: Test post editing and attachment replacement
3. **View Tab**: Verify posts and attachments
4. **Stats Tab**: Track testing progress

### Test Scenarios

#### 1. **Basic Post Creation**
- Create post with title and content only
- Verify database record creation
- Check response format

#### 2. **File Attachment Upload**
- Upload single file (PDF, DOC, Image)
- Upload multiple files (up to 5)
- Verify file storage and database records
- Check file size and type validation

#### 3. **Link Attachment Addition**
- Add single external link
- Add multiple links (up to 3)
- Verify link storage in database
- Test various URL formats

#### 4. **Post Editing**
- Edit title and content only
- Change draft status
- Update scheduling information
- Verify partial updates work

#### 5. **Attachment Replacement**
- Edit post with new files
- Edit post with new links
- Verify old attachments are removed
- Check file cleanup

#### 6. **Error Handling**
- Test with invalid class codes
- Test with non-existent post IDs
- Test with unauthorized access
- Test with missing required fields

## Security Considerations

### 1. **Authentication**
- JWT token validation required
- Token expiration handling
- Secure token storage

### 2. **Authorization**
- Teacher role verification
- Classroom ownership validation
- Post ownership verification

### 3. **File Security**
- File type validation
- File size limits
- Secure file storage paths
- Unique filename generation

### 4. **Input Validation**
- SQL injection prevention
- XSS protection
- File upload security
- URL validation

## Performance Considerations

### 1. **File Handling**
- Efficient file upload processing
- Proper cleanup of old files
- Optimized database queries

### 2. **Database Optimization**
- Proper indexing on frequently queried fields
- Efficient attachment queries
- Transaction handling for consistency

### 3. **Memory Management**
- Stream processing for large files
- Proper resource cleanup
- Memory-efficient attachment handling

## Error Handling

### Common Error Responses

#### 1. **Authentication Errors**
```json
{
  "status": "error",
  "message": "Invalid or expired token",
  "data": null
}
```

#### 2. **Authorization Errors**
```json
{
  "status": "error",
  "message": "Access denied to this classroom",
  "data": null
}
```

#### 3. **Validation Errors**
```json
{
  "status": "error",
  "message": "Title and content are required",
  "data": null
}
```

#### 4. **Not Found Errors**
```json
{
  "status": "error",
  "message": "Stream post not found or access denied",
  "data": null
}
```

## Deployment

### 1. **File Uploads**
- Ensure `uploads/stream_attachments/` directory exists
- Set proper permissions (755)
- Configure web server for file uploads

### 2. **Database Setup**
- Run the provided SQL schema
- Ensure proper indexes are created
- Test foreign key constraints

### 3. **JWT Configuration**
- Implement proper JWT validation
- Configure secret keys
- Set appropriate expiration times

### 4. **Server Configuration**
- Enable file uploads in PHP
- Set appropriate upload limits
- Configure CORS if needed

## Monitoring and Maintenance

### 1. **File Storage**
- Monitor disk space usage
- Implement file cleanup policies
- Regular backup of uploads directory

### 2. **Database Performance**
- Monitor query performance
- Check index usage
- Regular database maintenance

### 3. **Error Logging**
- Log authentication failures
- Track file upload errors
- Monitor API usage patterns

## Future Enhancements

### 1. **Advanced Features**
- Bulk post operations
- Post templates
- Advanced scheduling options
- Rich text editor support

### 2. **Performance Improvements**
- File compression
- CDN integration
- Caching strategies
- Async processing

### 3. **Security Enhancements**
- File virus scanning
- Advanced file validation
- Rate limiting
- Audit logging

## Troubleshooting

### Common Issues

#### 1. **File Upload Failures**
- Check file permissions
- Verify upload directory exists
- Check PHP upload limits
- Validate file types

#### 2. **Database Errors**
- Verify database connection
- Check table structure
- Validate foreign key constraints
- Review SQL queries

#### 3. **Authentication Issues**
- Verify JWT token format
- Check token expiration
- Validate user role
- Confirm classroom access

#### 4. **Performance Issues**
- Review database indexes
- Check file storage efficiency
- Monitor server resources
- Optimize queries

## Support

For technical support or questions about this implementation:

1. Review the error logs
2. Check the test interface
3. Verify database connectivity
4. Test with sample data
5. Review security configuration

## Conclusion

This implementation provides a complete, secure, and efficient solution for stream post editing with attachments. The system handles both creation and editing scenarios, supports multiple attachment types, and maintains data consistency throughout the process.

The modular design allows for easy maintenance and future enhancements, while the comprehensive testing interface ensures reliable operation in production environments.
