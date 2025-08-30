# Student Submission Display Fix

## Issue Description
Students cannot see the files they submitted in tasks/assignments. The "Your Work" section shows "No files submitted yet" even when files have been submitted.

## Root Cause Analysis
The problem is in the `AssignmentDetailStudent.js` component's data fetching logic. The current implementation has several issues:

1. **Fallback Logic Problem**: The fallback logic checks `if (!submission || submission?.grade === undefined || submission?.grade === null)` before the submission state has been set, causing the fallback to never execute.

2. **State Dependency Issue**: The component tries to check the `submission` state variable in the same useEffect where it's being set, creating a race condition.

3. **API Response Structure Mismatch**: The frontend expects a specific data structure, but the API might be returning data in a different format.

## Current Implementation Issues

### Problematic Code in AssignmentDetailStudent.js
```javascript
// This logic is flawed because it checks the submission state before it's set
try {
  if (!submission || submission?.grade === undefined || submission?.grade === null) {
    // This will never execute because submission is initially null
    const allSubsResp = await apiService.getTaskSubmissions(assignmentId);
    // ... rest of fallback logic
  }
} catch (fallbackErr) {
  console.warn('Fallback to all submissions failed:', fallbackErr);
}
```

### Why It Fails
1. **Initial State**: `submission` starts as `null`
2. **Race Condition**: The fallback logic runs before the first submission fetch completes
3. **State Check**: `if (!submission)` is always true initially, but the logic inside doesn't execute properly

## Solution

### 1. Restructure the Data Fetching Logic
Replace the problematic fallback logic with a sequential approach:

```javascript
// Fetch submission data using the correct endpoint
const finalClassCode = classCode || response.data.class_code || (Array.isArray(response.data.class_codes) ? response.data.class_codes[0] : undefined);
if (finalClassCode) {
  let submissionFound = false;
  
  // First attempt: Get student's specific submission
  try {
    const submissionResponse = await apiService.getTaskSubmission(assignmentId, finalClassCode);
    if (submissionResponse.status && submissionResponse.data) {
      const enrichedSubmission = await enrichSubmission(submissionResponse.data);
      setSubmission(enrichedSubmission);
      submissionFound = true;
    }
  } catch (error) {
    console.log('No submission found or error fetching submission:', error);
  }

  // Second attempt: Get from all submissions if first attempt failed
  if (!submissionFound) {
    try {
      const allSubsResp = await apiService.getTaskSubmissions(assignmentId);
      const allSubs = allSubsResp?.data?.submissions || allSubsResp?.data || [];
      
      // Find current student's submission
      const current = JSON.parse(localStorage.getItem('user') || '{}');
      const candidateIds = [current.student_num, current.student_id, current.id]
        .filter(v => v !== undefined && v !== null)
        .map(v => String(v));
      
      const mine = allSubs.find(s => {
        const sidCandidates = [s.student_num, s.student_id, s.id]
          .filter(v => v !== undefined && v !== null)
          .map(v => String(v));
        return candidateIds.some(id => sidCandidates.includes(id));
      });
      
      if (mine) {
        setSubmission(mine);
        submissionFound = true;
      }
    } catch (error) {
      console.warn('Fallback to all submissions failed:', error);
    }
  }

  // Third attempt: Check assigned tasks for grade/status
  if (!submissionFound) {
    try {
      const assignedResp = await apiService.getStudentAssignedTasks(finalClassCode);
      const list = assignedResp?.data || [];
      const found = list.find(t => String(t.task_id || t.id) === String(assignmentId));
      
      if (found && (found.grade !== undefined || found.submission_status)) {
        setSubmission({
          submission_id: found.submission_id,
          grade: found.grade !== undefined && found.grade !== null ? Number(found.grade) : null,
          status: found.submission_status || 'graded',
          submitted_at: found.submitted_at,
          feedback: found.feedback,
          attachments: found.attachments || [],
        });
        submissionFound = true;
      }
    } catch (error) {
      console.warn('Fallback to assigned tasks failed:', error);
    }
  }

  // Final fallback: Set empty submission object
  if (!submissionFound) {
    setSubmission({
      status: 'pending',
      attachments: [],
      grade: null,
      feedback: null
    });
  }
}
```

### 2. Add Debug Information
Add a debug section to help troubleshoot:

```javascript
{/* Debug info - remove in production */}
{process.env.NODE_ENV === 'development' && (
  <div style={{ 
    background: '#e3f2fd', 
    padding: '8px', 
    borderRadius: '4px', 
    marginBottom: '8px',
    fontSize: '12px',
    color: '#1976d2'
  }}>
    <strong>Debug:</strong> Submission: {submission ? 'Yes' : 'No'}, 
    Attachments: {submission?.attachments ? submission.attachments.length : 0},
    Status: {submission?.status || 'Unknown'}
  </div>
)}
```

### 3. Improve Loading States
Better loading state management:

```javascript
{loading ? 'Loading submission data...' : (submission ? 'No files submitted yet' : 'No submission data available')}
```

## Testing and Debugging

### 1. Use the Debug Tool
I've created `test_student_submission_debug.html` to help troubleshoot:

- Test authentication
- Get task details
- Get student submission
- Get all submissions
- Analyze submission data

### 2. Check Console Logs
Look for these console messages:
- "Submission response: [data]"
- "All submissions: [data]"
- "Looking for student with IDs: [ids]"
- "Found submission from all submissions: [data]"

### 3. Verify API Responses
Ensure the API endpoints return the expected data structure:

```json
{
  "status": true,
  "data": {
    "submission_id": "22",
    "status": "submitted",
    "attachments": [
      {
        "attachment_id": "1",
        "file_name": "filename.pdf",
        "original_name": "Original Name.pdf",
        "file_path": "uploads/submissions/filename.pdf",
        "mime_type": "application/pdf",
        "file_size": 1024
      }
    ]
  }
}
```

## Expected Behavior After Fix

### For Students with Submissions
- **Files Displayed**: Submitted files appear in the "Your Work" section
- **File Information**: Shows original filename, type, and size
- **Clickable Files**: Files can be clicked to preview/download
- **Status Updates**: Submission status is correctly displayed

### For Students without Submissions
- **Clear Message**: Shows "No files submitted yet"
- **Upload Options**: File upload and external link options remain available

## Files Modified

1. **`src/views/examples/AssignmentDetailStudent.js`**
   - Fixed submission data fetching logic
   - Added proper fallback handling
   - Improved error handling and logging

2. **`test_student_submission_debug.html`** (New)
   - Debug tool for troubleshooting API endpoints
   - Comprehensive analysis of submission data

## Next Steps

1. **Test the Fix**: Use the debug tool to verify API responses
2. **Check Console Logs**: Ensure proper data flow
3. **Verify File Display**: Confirm submitted files appear correctly
4. **Remove Debug Code**: Clean up debug sections before production

## Common Issues to Check

1. **Authentication**: Ensure JWT token is valid
2. **API Endpoints**: Verify backend endpoints are working
3. **Data Structure**: Check if API response matches expected format
4. **File Permissions**: Ensure uploaded files are accessible
5. **Database**: Verify submission data is properly stored

## Related Documentation

- `SUBMISSION_DISPLAY_FIX_SUMMARY.md` - Teacher-side submission display fix
- `TASK_ATTACHMENTS_DISPLAY_FIX_SUMMARY.md` - Task attachment display issues
- `MULTIPLE_FILE_SUBMISSION_IMPLEMENTATION.md` - Multiple file submission handling
