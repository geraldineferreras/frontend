# Student Attachment 404 Error Fix

## Issue Description

When students try to view attachments in the classwork section, they encounter a "404 Page Not Found" error instead of seeing a file preview. This prevents students from accessing assignment materials, PDFs, images, and other file attachments.

## Root Cause Analysis

The problem was in the file URL construction logic in the frontend components:

1. **Incorrect URL Construction**: The frontend was trying to construct file URLs using the API base URL (`http://localhost/scms_new_backup/index.php/api`) instead of the proper file serving endpoint.

2. **Inconsistent Logic**: Different components had different implementations of the `getFileUrl` function, leading to inconsistent behavior.

3. **Missing API Service Integration**: The components weren't using the centralized file URL construction logic from the API service.

## Files Modified

### 1. `src/views/examples/AssignmentDetailStudent.js`
- **Function**: `getFileUrl()`
- **Change**: Updated to use `apiService.getFilePreviewUrl()` instead of custom URL construction
- **Impact**: Fixes student assignment attachment viewing

### 2. `src/views/examples/TaskDetail.js`
- **Function**: `getFileUrl()`
- **Change**: Updated to use `apiService.getFilePreviewUrl()` with proper submission flag
- **Impact**: Ensures consistency across teacher and student views

## Technical Solution

### Before (Broken):
```javascript
const getFileUrl = (filePath) => {
  if (!filePath) return null;
  
  if (filePath.startsWith('http://') || filePath.startsWith('https://')) {
    return filePath;
  } else if (filePath.startsWith('uploads/')) {
    return `${process.env.REACT_APP_API_BASE_URL || 'http://localhost/scms_new_backup'}/${filePath}`;
  } else {
    return `${process.env.REACT_APP_API_BASE_URL || 'http://localhost/scms_new_backup'}/uploads/tasks/${filePath}`;
  }
};
```

### After (Fixed):
```javascript
const getFileUrl = (filePath) => {
  if (!filePath) return null;
  
  // Use the API service's getFilePreviewUrl function for consistency
  return apiService.getFilePreviewUrl(filePath, false); // false for tasks
};
```

## How the Fix Works

The API service's `getFilePreviewUrl` function properly handles different file path formats:

1. **Full URLs**: Passed through unchanged (e.g., `https://example.com/file.pdf`)
2. **Uploads paths**: Properly appended to server root (e.g., `uploads/tasks/document.pdf` → `http://localhost/scms_new_backup/uploads/tasks/document.pdf`)
3. **Bare filenames**: Routed to appropriate directory based on context:
   - Tasks: `document.pdf` → `http://localhost/scms_new_backup/uploads/tasks/document.pdf`
   - Submissions: `submission.pdf` → `http://localhost/scms_new_backup/uploads/submissions/submission.pdf`

## Benefits of the Fix

1. **✅ Eliminates 404 Errors**: Students can now view all attachment types
2. **✅ Consistent Behavior**: All components use the same file URL logic
3. **✅ Centralized Logic**: File serving logic is maintained in one place
4. **✅ Proper File Routing**: Files are served from correct directories
5. **✅ Environment Flexibility**: Works with different API base URLs

## Testing the Fix

### Test Cases:
1. **Full URL**: `https://example.com/file.pdf` → Should pass through unchanged
2. **Uploads path**: `uploads/tasks/document.pdf` → Should construct proper server URL
3. **Bare filename**: `document.pdf` → Should route to tasks directory
4. **Submissions**: `submission.pdf` → Should route to submissions directory

### Steps to Test:
1. Navigate to student classwork section
2. Click on an assignment with attachments
3. Try to view different file types (PDF, images, etc.)
4. Verify that files load without 404 errors
5. Check that file previews work correctly

## Expected Results

After applying this fix:

- **Students can view PDF attachments** directly in the browser
- **Image attachments display properly** with previews
- **File downloads work correctly** for all supported formats
- **No more 404 errors** when accessing attachments
- **Consistent behavior** across all attachment types

## Related Components

This fix also improves:
- **Teacher Task View**: Consistent file handling for task attachments
- **Student Submission View**: Proper file access for submitted work
- **General File Management**: Centralized file serving logic

## Future Improvements

Consider implementing:
1. **File Type Validation**: Ensure only safe file types can be uploaded
2. **File Size Limits**: Prevent extremely large files from being uploaded
3. **Caching**: Implement file caching for better performance
4. **CDN Integration**: Use CDN for file serving in production

## Conclusion

This fix resolves the critical issue preventing students from accessing assignment materials. By centralizing the file URL construction logic and using the proper API service functions, students can now view all attachment types without encountering 404 errors.

The solution is robust, maintainable, and provides a consistent user experience across all components that handle file attachments.
