# Multiple File Submission Implementation

## Overview

This implementation adds support for multiple file uploads in student task submissions. Students can now submit multiple files and external links using three different methods as specified in your API documentation.

## Changes Made

### 1. API Service Updates (`src/services/api.js`)

#### New Methods Added:

- **`submitTaskWithMultipleFiles(taskId, submissionData)`**: Handles Method 1 (same field name) and Method 2 (different field names)
- **`submitTaskWithDifferentFieldNames(taskId, files, submissionData)`**: Specifically for Method 2
- **`submitTaskWithExternalLinks(taskId, externalLinks, submissionData)`**: Specifically for Method 3 (JSON array)

### 2. Component Updates (`src/views/examples/AssignmentDetailStudent.js`)

#### New State Variables:
```javascript
const [submissionMethod, setSubmissionMethod] = useState('files');
const [externalLinks, setExternalLinks] = useState([]);
const [showLinkInput, setShowLinkInput] = useState(false);
const [newLink, setNewLink] = useState({ name: '', url: '', type: 'link' });
```

#### New Helper Functions:
- `handleAddExternalLink()`: Adds external links to the submission
- `handleRemoveExternalLink(index)`: Removes external links
- `handleLinkTypeChange(type)`: Changes link type (link, google_drive, youtube)

#### Updated `handleSubmitFiles()` Function:
The function now intelligently chooses the appropriate submission method:

1. **Mixed submission** (files + external links): Uses Method 1 for files + JSON for links
2. **Files only**: Uses Method 1 (same field name)
3. **External links only**: Uses Method 3 (JSON array)

### 3. UI Enhancements

#### New UI Elements:
- **"Add External Links" button**: Opens link input form
- **Link input form**: Allows adding external links with name, URL, and type
- **External links display**: Shows added links with remove functionality
- **Dynamic submit button**: Text changes based on content type

## Supported Submission Methods

### Method 1: Multiple Files with Same Field Name (attachment[])

**Frontend Implementation:**
```javascript
const formData = new FormData();
formData.append('class_code', classCode);
formData.append('submission_content', content);

// Add files with same field name
selectedFiles.forEach((file) => {
  formData.append('attachment', file);
});
```

**API Call:**
```javascript
await apiService.submitTaskWithMultipleFiles(taskId, formData);
```

### Method 2: Multiple Files with Different Field Names (attachment1, attachment2, etc.)

**Frontend Implementation:**
```javascript
const formData = new FormData();
formData.append('class_code', classCode);
formData.append('submission_content', content);

// Add files with different field names
files.forEach((file, index) => {
  formData.append(`attachment${index + 1}`, file);
});
```

**API Call:**
```javascript
await apiService.submitTaskWithDifferentFieldNames(taskId, files, submissionData);
```

### Method 3: JSON Array of External Files/URLs

**Frontend Implementation:**
```javascript
const payload = {
  class_code: classCode,
  submission_content: content,
  attachments: externalLinks.map(link => ({
    file_name: link.name,
    original_name: link.name,
    attachment_type: link.type || 'link',
    attachment_url: link.url,
    file_size: link.size || 0,
    mime_type: link.mime_type || 'application/octet-stream'
  }))
};
```

**API Call:**
```javascript
await apiService.submitTaskWithExternalLinks(taskId, externalLinks, submissionData);
```

## User Interface Features

### File Upload
- Multiple file selection with drag-and-drop support
- File type validation (.pdf, .doc, .docx, .txt, .jpg, .jpeg, .png, .gif, .zip, .rar)
- File size display
- Remove individual files

### External Links
- Add external links (Google Drive, YouTube, general links)
- Link type selection (Link, Google Drive, YouTube)
- Link name and URL input
- Remove individual links

### Submission
- Dynamic submit button text based on content
- Progress indication during upload
- Success/error messages
- Automatic form clearing after successful submission

## Testing

A test file has been created (`test_multiple_file_submission.html`) that allows testing all three methods:

1. **Method 1 Test**: Upload multiple files with same field name
2. **Method 2 Test**: Upload multiple files with different field names
3. **Method 3 Test**: Submit external links as JSON array

## Usage Instructions

### For Students:

1. **Upload Files:**
   - Click "📎 Add Files" button
   - Select multiple files
   - Files will appear in the "Files to Submit" section

2. **Add External Links:**
   - Click "🔗 Add External Links" button
   - Enter link name and URL
   - Select link type (Link, Google Drive, YouTube)
   - Click "Add Link"

3. **Submit:**
   - Add private message (optional)
   - Click submit button
   - Wait for confirmation

### For Developers:

The implementation automatically chooses the best submission method:

- **Files only**: Uses Method 1 (same field name)
- **External links only**: Uses Method 3 (JSON array)
- **Mixed content**: Uses Method 1 for files + JSON for links

## API Endpoints

All submissions go to: `POST {{base_url}}/api/tasks/{taskId}/submit`

### Headers:
- `Authorization: Bearer YOUR_TOKEN_HERE`
- `Content-Type: multipart/form-data` (for file uploads)
- `Content-Type: application/json` (for external links)

### Request Body Examples:

#### Method 1 (Files):
```
FormData:
- class_code: "J56NHD"
- submission_content: "This is my submission"
- attachment: [File 1]
- attachment: [File 2]
- attachment: [File 3]
```

#### Method 2 (Different Field Names):
```
FormData:
- class_code: "J56NHD"
- submission_content: "This is my submission"
- attachment1: [File 1]
- attachment2: [File 2]
- attachment3: [File 3]
```

#### Method 3 (External Links):
```json
{
  "class_code": "J56NHD",
  "submission_content": "This is my submission with external file links",
  "attachments": [
    {
      "file_name": "research_paper.pdf",
      "original_name": "research_paper.pdf",
      "attachment_type": "google_drive",
      "attachment_url": "https://drive.google.com/file/d/1234567890/view",
      "file_size": 2048576,
      "mime_type": "application/pdf"
    }
  ]
}
```

## Error Handling

The implementation includes comprehensive error handling:

- **File validation**: Checks file types and sizes
- **Network errors**: Handles upload failures gracefully
- **API errors**: Displays meaningful error messages
- **Form validation**: Ensures required fields are filled

## Browser Compatibility

- **Modern browsers**: Full support for all features
- **File API**: Uses native browser file handling
- **FormData**: Leverages browser's FormData API
- **Progress tracking**: Shows upload progress

## Security Considerations

- **File type validation**: Only allows specified file types
- **Token authentication**: Uses Bearer token for API calls
- **CSRF protection**: Relies on token-based authentication
- **File size limits**: Can be configured on backend

## Future Enhancements

Potential improvements that could be added:

1. **Drag and drop file upload**
2. **File preview before upload**
3. **Upload progress bar**
4. **Batch file operations**
5. **File compression**
6. **Cloud storage integration**
7. **Version control for submissions**

## Troubleshooting

### Common Issues:

1. **Files not uploading**: Check file size and type restrictions
2. **External links not working**: Verify URL format and accessibility
3. **Submission fails**: Check network connection and authentication
4. **Form not clearing**: Refresh page or check for JavaScript errors

### Debug Information:

The implementation includes extensive console logging for debugging:

```javascript
console.log('Submitting content:', {
  taskId: taskId,
  fileCount: selectedFiles.length,
  externalLinks: externalLinks.length,
  submissionMethod: 'files|links|mixed'
});
```

## Conclusion

This implementation provides a comprehensive solution for multiple file submissions in student task assignments. It supports all three methods specified in your API documentation and provides a user-friendly interface for students to submit their work.

The solution is backward compatible and will work with existing single-file submissions while adding the new multiple file capabilities.
