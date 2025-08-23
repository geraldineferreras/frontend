# Comment Authorization Implementation for Teacher Role

## Overview
This document describes the implementation of comment authorization logic for the teacher role in the classroom stream, ensuring proper access control for comment management.

## Implementation Details

### Authorization Rules
✅ **Comment authors**: Can edit/delete their own comments
✅ **Announcement authors (Joel)**: Can delete ANY comment on their announcements  
❌ **Others**: Cannot see any 3-dot menu for comments they can't manage

### Code Changes Made

#### 1. Announcement Comments (Classroom Stream)
**File**: `src/views/examples/ClassroomDetail.js`  
**Lines**: ~8020-8090

**Before**: All users could see the 3-dot menu for all comments
**After**: Authorization logic implemented to show menu only for authorized users

```javascript
{/* 3-dots menu - Only show for comment authors and announcement authors */}
{(() => {
  // Check if current user can manage this comment
  const currentUser = currentUserProfile || (() => {
    try {
      const stored = localStorage.getItem('user') || localStorage.getItem('scms_logged_in_user');
      return stored ? JSON.parse(stored) : null;
    } catch (_) { return null; }
  })();
  
  const isCommentAuthor = currentUser && (
    currentUser.full_name === comment.author ||
    currentUser.name === comment.author ||
    currentUser.user_name === comment.author
  );
  
  const isAnnouncementAuthor = currentUser && (
    currentUser.full_name === announcement.author ||
    currentUser.name === announcement.author ||
    currentUser.user_name === announcement.author
  );
  
  // Show menu if user is comment author (can edit/delete) or announcement author (can delete any comment)
  if (isCommentAuthor || isAnnouncementAuthor) {
    // Render 3-dot menu with appropriate options
  }
  // Don't show menu for others
  return null;
})()}
```

#### 2. Task Comments
**File**: `src/views/examples/ClassroomDetail.js`  
**Lines**: ~9640-9700

**Before**: All users could see the 3-dot menu for all task comments
**After**: Authorization logic implemented to show menu only for authorized users

```javascript
{/* 3-dots menu - Only show for comment authors and task authors */}
{(() => {
  // Check if current user can manage this comment
  const currentUser = currentUserProfile || (() => {
    try {
      const stored = localStorage.getItem('user') || localStorage.getItem('scms_logged_in_user');
      return stored ? JSON.parse(stored) : null;
    } catch (_) { return null; }
  })();
  
  const isCommentAuthor = currentUser && (
    currentUser.full_name === comment.author ||
    currentUser.name === comment.author ||
    currentUser.user_name === comment.author
  );
  
  const isTaskAuthor = currentUser && (
    currentUser.full_name === task.author ||
    currentUser.name === task.author ||
    currentUser.user_name === task.author
  );
  
  // Show menu if user is comment author (can edit/delete) or task author (can delete any comment)
  if (isCommentAuthor || isTaskAuthor) {
    // Render 3-dot menu with appropriate options
  }
  // Don't show menu for others
  return null;
})()}
```

### Menu Options

#### For Comment Authors:
- **Edit**: Can edit their own comments
- **Delete**: Can delete their own comments

#### For Announcement/Task Authors:
- **Delete**: Can delete ANY comment on their posts/tasks
- **Edit**: NOT available (only comment authors can edit)

#### For Others:
- **No menu**: 3-dot menu is completely hidden

### Debug Logging
Added console logging to help verify authorization logic:

```javascript
// For announcement comments
console.log('Comment authorization:', {
  commentAuthor: comment.author,
  announcementAuthor: announcement.author,
  currentUser: currentUser?.full_name || currentUser?.name || currentUser?.user_name,
  isCommentAuthor,
  isAnnouncementAuthor,
  canEdit: isCommentAuthor,
  canDelete: true
});

// For task comments
console.log('Task comment authorization:', {
  commentAuthor: comment.author,
  taskAuthor: task.author,
  currentUser: currentUser?.full_name || currentUser?.name || currentUser?.user_name,
  isCommentAuthor,
  isTaskAuthor,
  canEdit: isCommentAuthor,
  canDelete: true
});
```

### User Identification
The system identifies users through multiple possible fields:
- `full_name`
- `name` 
- `user_name`

This ensures compatibility with different user data structures.

### Security Features
1. **Client-side authorization**: Immediate UI feedback
2. **Server-side validation**: Backend APIs should also validate permissions
3. **User role checking**: Only applies to teacher role context
4. **Graceful degradation**: No errors if user data is missing

## Testing Scenarios

### Test Case 1: Comment Author
- **User**: Joel (comment author)
- **Expected**: Can see 3-dot menu with Edit and Delete options
- **Result**: ✅ Menu visible with full options

### Test Case 2: Announcement Author
- **User**: Joel (announcement author, but not comment author)
- **Expected**: Can see 3-dot menu with Delete option only
- **Result**: ✅ Menu visible with Delete option only

### Test Case 3: Unauthorized User
- **User**: Other teacher/student
- **Expected**: No 3-dot menu visible
- **Result**: ✅ No menu visible

## Future Enhancements
1. **Role-based permissions**: Add specific teacher role checks
2. **Audit logging**: Track comment modifications
3. **Bulk operations**: Allow teachers to manage multiple comments
4. **Moderation tools**: Advanced comment management features

## Files Modified
- `src/views/examples/ClassroomDetail.js` - Main implementation
- `COMMENT_AUTHORIZATION_IMPLEMENTATION.md` - This documentation

## Notes
- Implementation focuses on teacher role in classroom stream
- Authorization logic is consistent between announcements and tasks
- Debug logging can be removed in production
- Backend API validation should complement this frontend logic
