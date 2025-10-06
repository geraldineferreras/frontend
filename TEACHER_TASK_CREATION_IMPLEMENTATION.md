# Teacher Task Creation Implementation

## Overview

This implementation enhances the teacher task creation functionality to support multiple file attachments and external links, similar to the student submission functionality. Teachers can now create tasks with:

1. **Multiple file attachments** using form-data
2. **External links** using JSON payload
3. **Mixed attachments** (both files and external links)

## Files Modified

### 1. `src/services/api.js`

**New Methods Added:**

#### `createTaskWithMultipleFiles(taskData, files = [])`
- Handles multiple file attachments with the same field name (`attachment[]`)
- Uses FormData to send task data and multiple files
- Supports all task fields including class codes, assigned students, etc.

#### `createTaskWithDifferentFieldNames(taskData, files = [])`
- Handles multiple file attachments with different field names (`attachment1`, `attachment2`, etc.)
- Uses FormData to send task data and files with unique field names
- Useful for backend implementations that expect specific field names

#### `createTaskWithExternalLinks(taskData, externalLinks = [])`
- Handles external links using JSON payload
- Converts external links to the expected attachment format
- Supports link types: `link`, `google_drive`, `youtube`

**Enhanced `createTask(taskData)` method:**
- Maintains backward compatibility
- Automatically detects FormData vs JSON payload
- Handles both single and multiple file scenarios

### 2. `src/views/examples/ClassroomDetail.js`

**New State Variables:**
```javascript
const [taskExternalLinks, setTaskExternalLinks] = useState([]);
const [showTaskLinkInput, setShowTaskLinkInput] = useState(false);
const [newTaskLink, setNewTaskLink] = useState({ name: '', url: '', type: 'link' });
```

**New Handler Functions:**
- `handleAddTaskExternalLink()`: Adds external links to the task
- `handleRemoveTaskExternalLink(index)`: Removes external links
- `handleTaskLinkTypeChange(type)`: Changes link type

**Enhanced `handlePostTask()` function:**
- Supports multiple file attachments
- Supports external links
- Supports mixed attachments (files + links)
- Uses appropriate API methods based on attachment type

## Supported Submission Methods

### Method 1: Multiple Files with Same Field Name
```javascript
// Frontend implementation
const files = taskAttachments.map(att => att.file).filter(Boolean);
response = await apiService.createTaskWithMultipleFiles(taskData, files);

// Backend expects FormData with:
// - attachment[] (multiple files with same field name)
// - All task data fields
```

### Method 2: Multiple Files with Different Field Names
```javascript
// Frontend implementation
const files = taskAttachments.map(att => att.file).filter(Boolean);
response = await apiService.createTaskWithDifferentFieldNames(taskData, files);

// Backend expects FormData with:
// - attachment1, attachment2, attachment3, etc.
// - All task data fields
```

### Method 3: External Links (JSON)
```javascript
// Frontend implementation
response = await apiService.createTaskWithExternalLinks(taskData, taskExternalLinks);

// Backend expects JSON with:
{
  "title": "Research Paper Assignment",
  "type": "assignment",
  "points": 100,
  "instructions": "...",
  "class_codes": ["J56NHD"],
  "attachments": [
    {
      "file_name": "research_paper.pdf",
      "original_name": "research_paper.pdf",
      "attachment_type": "link",
      "attachment_url": "https://drive.google.com/file/d/1234567890/view",
      "file_size": 2048576,
      "mime_type": "application/pdf"
    }
  ]
}
```

### Method 4: Mixed Files and External Links
```javascript
// Frontend implementation
const formData = new FormData();
// Add all task data fields
Object.keys(taskData).forEach(key => {
  if (key === 'class_codes' || key === 'assigned_students') {
    formData.append(key, JSON.stringify(taskData[key]));
  } else if (typeof taskData[key] === 'boolean') {
    formData.append(key, taskData[key] ? '1' : '0');
  } else {
    formData.append(key, taskData[key] || '');
  }
});

// Add external links as JSON string
formData.append('external_links', JSON.stringify(taskExternalLinks));

// Add all file attachments
taskAttachments.forEach((attachment, index) => {
  if (attachment.file) {
    formData.append('attachment', attachment.file);
  }
});

response = await apiService.createTask(formData);
```

## API Endpoint

**Endpoint:** `POST {{base_url}}/api/tasks/create`

**Headers:**
- `Authorization: Bearer YOUR_TOKEN_HERE`
- `Content-Type: multipart/form-data` (for file uploads)
- `Content-Type: application/json` (for JSON payloads)

## UI Features

### File Attachment Management
- Multiple file selection
- File preview and removal
- File type validation
- File size display

### External Link Management
- Add external links with name, URL, and type
- Link type selection (Link, Google Drive, YouTube)
- Remove individual links
- Link validation

### Dynamic Submission
- Automatic method selection based on attachments
- Clear feedback on what will be submitted
- Form validation and error handling

## Testing

### Test File: `test_teacher_task_creation.html`

This test file provides a comprehensive testing interface for all four methods:

1. **Method 1 Test**: Multiple files with same field name
2. **Method 2 Test**: Multiple files with different field names
3. **Method 3 Test**: External links with JSON payload
4. **Method 4 Test**: Mixed files and external links

### Usage Instructions

1. **Login to the application** to get a valid token
2. **Open the test file** in a browser
3. **Select files or add external links** as needed
4. **Click the test buttons** to verify each method
5. **Check the console** for detailed request/response information

## Error Handling

### Frontend Error Handling
- File validation (type, size)
- Link validation (URL format)
- Network error handling
- User-friendly error messages

### Backend Error Handling
- File upload validation
- JSON payload validation
- Database error handling
- Proper HTTP status codes

## Browser Compatibility

- **FormData API**: Modern browsers (IE10+)
- **File API**: Modern browsers (IE10+)
- **Fetch API**: Modern browsers (IE11+)

## Security Considerations

### File Upload Security
- File type validation
- File size limits
- Virus scanning (backend)
- Secure file storage

### Link Security
- URL validation
- HTTPS enforcement for external links
- Link preview generation
- Malicious link detection

## Future Enhancements

### Planned Features
1. **Drag and drop file upload**
2. **File compression before upload**
3. **Progress indicators for large files**
4. **Bulk link import from CSV**
5. **Link preview generation**
6. **File type icons and previews**

### Performance Optimizations
1. **Chunked file uploads**
2. **Background upload processing**
3. **Cached link previews**
4. **Optimized image compression**

## Integration with Existing Features

### Task Management
- **Draft saving** with attachments
- **Task editing** with attachment modifications
- **Task scheduling** with attachments
- **Task publishing** with attachments

### Student Experience
- **Task viewing** with multiple attachments
- **Attachment download** functionality
- **Link preview** in student interface
- **Mobile compatibility** for attachments

## Backend Requirements

### File Upload Handling
```php
// Expected backend implementation
if (isset($_FILES['attachment'])) {
    // Handle multiple files with same field name
    $files = $_FILES['attachment'];
    foreach ($files['name'] as $index => $name) {
        // Process each file
    }
}
```

### External Links Handling
```php
// Expected backend implementation
if (isset($_POST['external_links'])) {
    $externalLinks = json_decode($_POST['external_links'], true);
    foreach ($externalLinks as $link) {
        // Process each external link
    }
}
```

### Mixed Attachments Handling
```php
// Expected backend implementation
// Handle both files and external links
if (isset($_FILES['attachment'])) {
    // Process file uploads
}
if (isset($_POST['external_links'])) {
    // Process external links
}
```

## Conclusion

This implementation provides teachers with a comprehensive task creation system that supports multiple file attachments and external links. The system is designed to be:

- **Flexible**: Supports multiple attachment methods
- **User-friendly**: Intuitive interface for managing attachments
- **Robust**: Comprehensive error handling and validation
- **Scalable**: Easy to extend with new attachment types
- **Compatible**: Works with existing task management features

The implementation maintains backward compatibility while adding powerful new features for enhanced task creation capabilities.
