# Task Attachments Display Fix

## Issue Description

When teachers create class tasks with attachments (files, YouTube links, or Google Drive links), the attachments were not being displayed in the task view. The attachments section showed "No attachments" even after successful upload.

## Root Cause

The problem was in the task normalization logic in the `fetchTasks` function. When tasks were fetched from the backend, the attachments array was not being properly populated because:

1. **Backend Response Format Mismatch**: The backend was saving attachments in different formats (single fields vs. arrays, different field names)
2. **Frontend Normalization Logic**: The frontend was not properly handling all the different attachment formats returned by the backend
3. **Task Creation Response**: When tasks were created, the new task object was not properly including the attachments in the state

## Files Modified

### 1. `src/views/examples/ClassroomDetail.js`

#### Task Normalization Fix (`fetchTasks` function)
- Enhanced the `normalizeTasks` function to handle multiple attachment formats
- Added support for:
  - Single attachment fields (`attachment_url`, `attachment_type`)
  - Link attachments (`youtube_url`, `gdrive_url`, `link_url`)
  - External links JSON field (`external_links`)
- Ensured all attachments have proper `type` and `url` fields

#### Task Creation Fix
- Fixed the `newTask` object creation to properly combine all attachment types
- Added proper mapping for file, link, and external link attachments
- Ensured attachments are immediately visible after task creation

#### Task Editing Fix
- Enhanced `handleEditTask` to properly load existing attachments
- Fixed `handleUpdateTask` to handle different attachment types during updates
- Ensured attachments are properly maintained when editing tasks

## Key Changes Made

### 1. Enhanced Attachment Normalization
```javascript
// Handle different attachment formats from the backend
if (!attachments || attachments.length === 0) {
  // Check for single attachment fields
  if (t.attachment_url) {
    // Handle file attachments
  }
  
  // Check for link attachments (YouTube, Google Drive, external links)
  if (t.youtube_url) {
    // Handle YouTube links
  }
  
  if (t.gdrive_url) {
    // Handle Google Drive links
  }
  
  if (t.link_url) {
    // Handle external links
  }
  
  // Check for external_links JSON field
  if (t.external_links) {
    // Parse and handle external links array
  }
}
```

### 2. Proper Attachment Type Mapping
```javascript
// Ensure all attachments have proper type and url fields
attachments = attachments.map(att => {
  if (!att.type && att.attachment_type) {
    att.type = att.attachment_type === 'youtube' ? 'YouTube' :
               att.attachment_type === 'google_drive' ? 'Google Drive' :
               att.attachment_type === 'link' ? 'Link' : 'File';
  }
  
  if (!att.url && att.attachment_url) {
    att.url = att.attachment_url;
  }
  
  return att;
});
```

### 3. Task Creation with Attachments
```javascript
// Combine all attachments for the new task
const allAttachments = [
  ...fileAttachments.map(att => ({
    type: 'File',
    name: att.name,
    file: att.file,
    attachment_type: 'file',
    attachment_url: att.file ? URL.createObjectURL(att.file) : null
  })),
  ...linkAttachments.map(att => ({
    type: att.type,
    name: att.name,
    url: att.url,
    attachment_type: att.type === 'Link' ? 'link' : 
                     att.type === 'YouTube' ? 'youtube' : 
                     att.type === 'Google Drive' ? 'google_drive' : 'link'
  })),
  ...taskExternalLinks.map(link => ({
    type: link.type === 'youtube' ? 'YouTube' : 
          link.type === 'google_drive' ? 'Google Drive' : 
          link.type === 'link' ? 'Link' : 'Link',
    name: link.title || link.name || 'External Link',
    url: link.url,
    attachment_type: link.type
  }))
];
```

## Testing

A test file `test_task_attachments_fix.html` has been created to verify the fix:

1. **Task Creation Test**: Create tasks with files, YouTube links, Google Drive links, and external links
2. **Normalization Test**: Test the attachment normalization logic with mock data
3. **Rendering Test**: Test how attachments are rendered in the UI

## Expected Behavior After Fix

1. **File Attachments**: Should display with file icons and download links
2. **YouTube Links**: Should display with YouTube branding and open in new tab when clicked
3. **Google Drive Links**: Should display with Google Drive branding and open in new tab when clicked
4. **External Links**: Should display with link icons and open in new tab when clicked
5. **Mixed Attachments**: Tasks with multiple types of attachments should display all of them correctly

## Backend Requirements

The backend should return task data in one of these formats:

### Option 1: Attachments Array
```json
{
  "task_id": 1,
  "title": "Task with Attachments",
  "attachments": [
    {
      "type": "file",
      "attachment_url": "uploads/tasks/document.pdf",
      "original_name": "document.pdf"
    },
    {
      "type": "youtube",
      "url": "https://youtube.com/watch?v=...",
      "title": "Video Title"
    }
  ]
}
```

### Option 2: Individual Fields
```json
{
  "task_id": 1,
  "title": "Task with Attachments",
  "attachment_url": "uploads/tasks/document.pdf",
  "attachment_type": "file",
  "youtube_url": "https://youtube.com/watch?v=...",
  "youtube_title": "Video Title",
  "gdrive_url": "https://drive.google.com/file/d/...",
  "gdrive_title": "Document Title"
}
```

### Option 3: External Links JSON
```json
{
  "task_id": 1,
  "title": "Task with Attachments",
  "external_links": "[{\"type\":\"youtube\",\"url\":\"...\",\"title\":\"...\"}]"
}
```

## Debugging

Added console logging to help debug attachment issues:

1. **Task Fetching**: Logs normalized tasks with attachments
2. **Task Rendering**: Logs attachments being rendered for each task
3. **Task Creation**: Logs the combined attachments being added to new tasks

## Notes

- The fix maintains backward compatibility with existing task data
- All attachment types (files, YouTube, Google Drive, external links) are now properly supported
- The UI will automatically detect and display the appropriate attachment type
- Attachments are immediately visible after task creation without requiring a page refresh
