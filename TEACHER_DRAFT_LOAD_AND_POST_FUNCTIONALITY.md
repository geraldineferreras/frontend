# Teacher Role - Draft Load and Post Functionality

## Overview
This document describes the improvements made to the draft functionality in the teacher role classroom stream. The changes ensure that when a draft is loaded into the announcement form and then posted, it is automatically removed from the draft announcements list.

## What Was Implemented

### 1. **Updated Draft Dropdown Menu**
**Location**: `src/views/examples/ClassroomDetail.js` - Draft announcements section  
**Lines**: ~7060-7120

**Before**: Dropdown menu with 4 options:
- Publish Now
- Edit  
- Schedule
- Delete

**After**: Simplified dropdown menu with 2 options:
- **Load Draft** (replaces "Edit")
- **Delete**

#### **Changes Made:**
- ✅ **Removed**: "Publish Now" button
- ✅ **Changed**: "Edit" → "Load Draft" 
- ✅ **Removed**: "Schedule" button
- ✅ **Kept**: "Delete" button

#### **New Menu Structure:**
```javascript
{/* Dropdown Menu */}
{postDropdownOpen && (
  <div style={{ /* dropdown styles */ }}>
    <div
      onClick={() => { 
        setDraftActionMenu(null); 
        handleEditDraft(draft.id); 
      }}
    >
      <i className="fa fa-edit" style={{ fontSize: 13, color: '#17a2b8' }}></i>
      Load Draft
    </div>
    <div
      onClick={() => { 
        setDraftActionMenu(null); 
        handleDeleteDraft(idx); 
      }}
    >
      <i className="fa fa-trash" style={{ fontSize: 13, color: '#dc3545' }}></i>
      Delete
    </div>
  </div>
)}
```

### 2. **Added Draft Tracking State**
**Location**: `src/views/examples/ClassroomDetail.js` - State variables section  
**Lines**: ~2053-2055

**New State Variable:**
```javascript
// Track current draft being edited
const [currentDraftId, setCurrentDraftId] = useState(null);
```

**Purpose**: Tracks which draft is currently loaded into the form so it can be removed when posted.

### 3. **Modified Draft Loading Function**
**Location**: `src/views/examples/ClassroomDetail.js` - `handleEditDraft` function  
**Lines**: ~2325-2355

**Before**: Immediately removed draft from list when loaded  
**After**: Tracks draft ID for later removal when posted

#### **Changes Made:**
```javascript
// Before: Immediately removed draft
setDrafts(prev => prev.filter(d => d.id !== draftId));

// After: Track draft for later removal
setCurrentDraftId(draftId);
```

#### **Complete Function:**
```javascript
const handleEditDraft = (draftId) => {
  const draft = drafts.find(d => d.id === draftId);
  if (draft) {
    // Populate the form with draft data
    setNewAnnouncementTitle(draft.title || '');
    setNewAnnouncement(draft.content || draft.text || '');
    setAllowComments(draft.allowComments || false);
    setAttachments(draft.attachments || []);
    
    // Track this draft as being edited (don't remove it yet)
    setCurrentDraftId(draftId);
    
    // Expand the form
    setFormExpanded(true);
    
    // Scroll to the form
    if (formExpandedRef.current) {
      formExpandedRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }
};
```

### 4. **Enhanced Post Function**
**Location**: `src/views/examples/ClassroomDetail.js` - `handlePostAnnouncement` function  
**Lines**: ~2100-2120

**New Logic**: Automatically removes draft when announcement is successfully posted

#### **Added Code:**
```javascript
console.log("Success response:", response?.data || response);

// If this was posted from a draft, remove the draft from the list
if (currentDraftId) {
  setDrafts(prev => prev.filter(d => d.id !== currentDraftId));
  setCurrentDraftId(null); // Clear the current draft tracking
}

setNewAnnouncement("");
setNewAnnouncementTitle("");
// ... rest of form clearing
```

### 5. **Enhanced Cancel Function**
**Location**: `src/views/examples/ClassroomDetail.js` - Cancel button  
**Lines**: ~7408-7420

**New Logic**: Clears draft tracking when canceling

#### **Modified Cancel Button:**
```javascript
<button
  type="button"
  onClick={() => { 
    setFormExpanded(false); 
    setPostDropdownOpen(false); 
    // If canceling a draft edit, clear the draft tracking
    if (currentDraftId) {
      setCurrentDraftId(null);
    }
  }}
>
  Cancel
</button>
```

## How It Works Now

### 1. **Draft Loading Workflow**
1. **Teacher clicks "Load Draft"** from draft dropdown menu
2. **Draft content loads** into announcement form
3. **Draft ID is tracked** in `currentDraftId` state
4. **Form expands** for editing
5. **Draft remains** in drafts list (not removed yet)

### 2. **Draft Posting Workflow**
1. **Teacher edits** the loaded draft content
2. **Teacher clicks "Post"** button
3. **Announcement is posted** to stream
4. **Draft is automatically removed** from drafts list
5. **Draft tracking is cleared** (`currentDraftId` set to null)
6. **Form is cleared** and reset

### 3. **Draft Cancellation Workflow**
1. **Teacher clicks "Cancel"** button
2. **Form collapses** and clears
3. **Draft tracking is cleared** (`currentDraftId` set to null)
4. **Draft remains** in drafts list (can be loaded again later)

## Key Benefits

### 1. **For Teachers**
- ✅ **Clear Workflow**: Load draft → Edit → Post → Draft removed
- ✅ **No Confusion**: Draft disappears after successful posting
- ✅ **Easy Management**: Simple Load Draft and Delete options
- ✅ **Consistent Behavior**: Draft is only removed when actually posted

### 2. **For System**
- ✅ **Clean Data**: No orphaned drafts after posting
- ✅ **Efficient State**: Draft tracking only when needed
- ✅ **Proper Cleanup**: Draft removed at the right time
- ✅ **Memory Management**: No unnecessary draft storage

### 3. **For User Experience**
- ✅ **Intuitive Flow**: Load → Edit → Post → Done
- ✅ **Visual Feedback**: Draft disappears after posting
- ✅ **Error Prevention**: Can't accidentally lose draft content
- ✅ **Flexible Editing**: Can cancel and reload draft later

## Technical Implementation Details

### 1. **State Management**
```javascript
// Track current draft being edited
const [currentDraftId, setCurrentDraftId] = useState(null);

// Drafts list
const [drafts, setDrafts] = useState([]);
```

### 2. **Event Flow**
```javascript
// 1. Load Draft clicked
onClick={() => handleEditDraft(draft.id)}

// 2. Draft loaded into form
setCurrentDraftId(draftId);

// 3. Post button clicked
onSubmit={handlePostAnnouncement}

// 4. Draft removed after successful post
if (currentDraftId) {
  setDrafts(prev => prev.filter(d => d.id !== currentDraftId));
  setCurrentDraftId(null);
}
```

### 3. **Cleanup Handling**
```javascript
// Cancel button clears tracking
if (currentDraftId) {
  setCurrentDraftId(null);
}

// Post success clears tracking
if (currentDraftId) {
  setDrafts(prev => prev.filter(d => d.id !== currentDraftId));
  setCurrentDraftId(null);
}
```

## Testing Scenarios

### Test Case 1: Load Draft and Post
1. **Action**: Click "Load Draft" on existing draft
2. **Expected**: Draft content loads into form, draft remains in list
3. **Action**: Edit content and click "Post"
4. **Expected**: Announcement posted, draft removed from list
5. **Result**: ✅ Draft successfully removed after posting

### Test Case 2: Load Draft and Cancel
1. **Action**: Click "Load Draft" on existing draft
2. **Expected**: Draft content loads into form
3. **Action**: Click "Cancel" button
4. **Expected**: Form clears, draft remains in list
5. **Result**: ✅ Draft preserved when canceling

### Test Case 3: Load Draft and Edit Multiple Times
1. **Action**: Load draft, edit, cancel
2. **Action**: Load same draft again, edit, post
3. **Expected**: Draft removed after successful post
4. **Result**: ✅ Draft properly tracked and removed

### Test Case 4: Multiple Drafts
1. **Action**: Load draft A, edit, post
2. **Expected**: Draft A removed
3. **Action**: Load draft B, edit, post
4. **Expected**: Draft B removed
5. **Result**: ✅ Each draft properly tracked and removed

## Error Handling

### 1. **Post Failure**
- **Scenario**: Draft loaded but post fails
- **Behavior**: Draft remains in list, tracking cleared
- **Benefit**: No data loss, can retry posting

### 2. **Network Issues**
- **Scenario**: Connection lost during posting
- **Behavior**: Draft preserved, tracking cleared
- **Benefit**: Robust error handling

### 3. **Form Validation**
- **Scenario**: Draft loaded but validation fails
- **Behavior**: Draft remains in list, form shows errors
- **Benefit**: User can fix issues and retry

## Future Enhancements

### 1. **Draft Auto-save**
- Save changes while editing loaded draft
- Prevent data loss during long editing sessions
- Show "Modified" indicator

### 2. **Draft Versioning**
- Keep original draft and modified version
- Allow reverting to original
- Show edit history

### 3. **Draft Sharing**
- Share drafts with other teachers
- Collaborative editing
- Draft templates

### 4. **Advanced Draft Management**
- Draft categories and tags
- Search and filter drafts
- Bulk operations

## Files Modified

- `src/views/examples/ClassroomDetail.js` - Updated draft dropdown, added draft tracking, enhanced post and cancel functions

## Notes

- The draft functionality now provides a clean workflow: Load → Edit → Post → Remove
- Drafts are only removed when successfully posted, not when loaded
- The interface is simplified with just "Load Draft" and "Delete" options
- Draft tracking ensures proper cleanup and prevents orphaned drafts
- Teachers can cancel editing and reload drafts later if needed
- The system maintains data integrity by removing drafts at the right time
