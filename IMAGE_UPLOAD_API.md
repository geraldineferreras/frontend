# Image Upload API Documentation

This document outlines the API endpoints needed for handling profile picture and cover photo uploads in the SCMS application.

## Base URL
```
http://localhost/scms_new/index.php/api
```

## Authentication
All endpoints require a valid JWT token in the Authorization header:
```
Authorization: Bearer {token}
```

## Endpoints

### 1. Upload Profile Image
**POST** `/upload/profile`

**Headers:**
- `Content-Type: multipart/form-data`
- `Authorization: Bearer {token}`

**Form Data:**
- `profile_image` (file): The image file to upload

**Response (Success - 200):**
```json
{
  "success": true,
  "message": "Profile image uploaded successfully",
  "file_path": "uploads/profile/user_123_profile.jpg",
  "path": "uploads/profile/user_123_profile.jpg"
}
```

**Response (Error - 400/500):**
```json
{
  "success": false,
  "message": "Error message here"
}
```

### 2. Upload Cover Photo
**POST** `/upload/cover`

**Headers:**
- `Content-Type: multipart/form-data`
- `Authorization: Bearer {token}`

**Form Data:**
- `cover_photo` (file): The image file to upload

**Response (Success - 200):**
```json
{
  "success": true,
  "message": "Cover photo uploaded successfully",
  "file_path": "uploads/cover/user_123_cover.jpg",
  "path": "uploads/cover/user_123_cover.jpg"
}
```

**Response (Error - 400/500):**
```json
{
  "success": false,
  "message": "Error message here"
}
```

## File Storage Structure

### Directory Structure
```
scms_new/
├── uploads/
│   ├── profile/
│   │   ├── user_1_profile.jpg
│   │   ├── user_2_profile.jpg
│   │   └── default.jpg
│   └── cover/
│       ├── user_1_cover.jpg
│       ├── user_2_cover.jpg
│       └── default_cover.jpg
```

### File Naming Convention
- Profile images: `user_{user_id}_profile.{extension}`
- Cover photos: `user_{user_id}_cover.{extension}`

### Supported Formats
- JPEG (.jpg, .jpeg)
- PNG (.png)
- GIF (.gif)

### File Size Limits
- Maximum file size: 5MB
- Recommended dimensions:
  - Profile images: 300x300 pixels
  - Cover photos: 1200x400 pixels

## Implementation Notes

### PHP Example (CodeIgniter)
```php
public function uploadProfileImage() {
    $config['upload_path'] = './uploads/profile/';
    $config['allowed_types'] = 'gif|jpg|jpeg|png';
    $config['max_size'] = 5120; // 5MB
    $config['file_name'] = 'user_' . $this->session->userdata('user_id') . '_profile';
    
    $this->load->library('upload', $config);
    
    if ($this->upload->do_upload('profile_image')) {
        $upload_data = $this->upload->data();
        $file_path = 'uploads/profile/' . $upload_data['file_name'];
        
        // Update user record in database
        $this->db->where('id', $this->session->userdata('user_id'));
        $this->db->update('users', ['profile_pic' => $file_path]);
        
        $this->output
            ->set_content_type('application/json')
            ->set_output(json_encode([
                'success' => true,
                'message' => 'Profile image uploaded successfully',
                'file_path' => $file_path,
                'path' => $file_path
            ]));
    } else {
        $this->output
            ->set_status_header(400)
            ->set_content_type('application/json')
            ->set_output(json_encode([
                'success' => false,
                'message' => $this->upload->display_errors('', '')
            ]));
    }
}
```

### Security Considerations
1. **File Type Validation**: Only allow image files
2. **File Size Limits**: Prevent large file uploads
3. **Authentication**: Ensure only authenticated users can upload
4. **File Permissions**: Set proper file permissions on upload directory
5. **Virus Scanning**: Consider implementing virus scanning for uploaded files

### Error Handling
- Handle file upload errors gracefully
- Return meaningful error messages
- Log upload attempts for security monitoring
- Implement rate limiting to prevent abuse

## Frontend Integration

The frontend is already configured to:
1. Upload images when users crop and save them
2. Display uploaded images from server paths
3. Fall back to base64 if upload fails
4. Handle both server paths and base64 data URLs

## Testing

Test the endpoints with:
1. Valid image files
2. Invalid file types
3. Files exceeding size limits
4. Missing authentication tokens
5. Network errors

## Database Updates

Ensure your users table has the following columns:
- `profile_pic` (VARCHAR): Path to profile image
- `cover_pic` (VARCHAR): Path to cover photo

Example:
```sql
ALTER TABLE users 
ADD COLUMN profile_pic VARCHAR(255) DEFAULT 'uploads/profile/default.jpg',
ADD COLUMN cover_pic VARCHAR(255) DEFAULT 'uploads/cover/default_cover.jpg';
``` 