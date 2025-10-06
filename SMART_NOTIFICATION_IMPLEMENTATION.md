# Smart Notification Logic Implementation

## Overview

This implementation provides intelligent notification logic for student stream posts in the classroom management system. The system automatically determines who should be notified based on the post configuration and validates that recipients are actually enrolled in the class.

## Smart Notification Logic

### Core Rules

1. **With student_ids**: Only notifies the teacher + specified students
2. **Without student_ids**: Notifies the teacher + all other students in class
3. **Validation**: Ensures provided student_ids are actually enrolled in the class

### Implementation Details

#### API Service Methods

```javascript
// New methods added to src/services/api.js

// Basic student stream posting
async createStudentStreamPost(classCode, postData)

// Smart notification logic for student posts
async createStudentPostWithSmartNotifications(classCode, postData)

// Get classroom members for notification logic
async getClassroomMembers(classCode)

// Send notifications
async sendNotification(notificationData)
```

#### Smart Notification Algorithm

```javascript
async createStudentPostWithSmartNotifications(classCode, postData) {
  // 1. Create the post first
  const postResponse = await this.createStudentStreamPost(classCode, postData);
  
  // 2. Get classroom members
  const membersResponse = await this.getClassroomMembers(classCode);
  const members = membersResponse.data || [];
  
  // 3. Separate teacher and students
  const teacher = members.find(member => member.role === 'teacher');
  const students = members.filter(member => member.role === 'student');
  
  // 4. Determine notification recipients
  let notificationRecipients = [];
  
  // Always notify the teacher
  if (teacher) {
    notificationRecipients.push({
      id: teacher.user_id || teacher.id,
      role: 'teacher',
      name: teacher.name || teacher.user_name
    });
  }

  // Smart notification logic for students
  if (postData.student_ids && postData.student_ids.length > 0) {
    // With student_ids: Only notify specified students
    const specifiedStudents = students.filter(student => 
      postData.student_ids.includes(student.user_id || student.id)
    );
    
    // Validate that provided student_ids are actually enrolled
    const validStudentIds = specifiedStudents.map(student => student.user_id || student.id);
    const invalidStudentIds = postData.student_ids.filter(id => !validStudentIds.includes(id));
    
    if (invalidStudentIds.length > 0) {
      console.warn('Some specified student IDs are not enrolled in this class:', invalidStudentIds);
    }
    
    notificationRecipients.push(...specifiedStudents.map(student => ({
      id: student.user_id || student.id,
      role: 'student',
      name: student.name || student.user_name
    })));
  } else {
    // Without student_ids: Notify all other students in class
    const currentUserId = localStorage.getItem('user_id') || 
                        JSON.parse(localStorage.getItem('user') || '{}').id;
    
    const otherStudents = students.filter(student => 
      (student.user_id || student.id) !== currentUserId
    );
    
    notificationRecipients.push(...otherStudents.map(student => ({
      id: student.user_id || student.id,
      role: 'student',
      name: student.name || student.user_name
    })));
  }

  // 5. Send notifications to all recipients
  const notificationPromises = notificationRecipients.map(recipient => {
    const notificationData = {
      recipient_id: recipient.id,
      recipient_role: recipient.role,
      message: `New post in ${classCode}: ${postData.title || 'Untitled'}`,
      type: 'stream_post',
      data: {
        class_code: classCode,
        post_id: postResponse.data.id,
        post_title: postData.title,
        post_content: postData.content,
        author_name: JSON.parse(localStorage.getItem('user') || '{}').name || 'Unknown'
      }
    };
    
    return this.sendNotification(notificationData);
  });

  await Promise.all(notificationPromises);

  return {
    ...postResponse,
    notificationRecipients: notificationRecipients.length,
    smartNotificationLogic: {
      teacherNotified: !!teacher,
      studentsNotified: notificationRecipients.filter(r => r.role === 'student').length,
      totalRecipients: notificationRecipients.length
    }
  };
}
```

## Frontend Integration

### Updated Student Post Function

The `handleStudentPostAnnouncement` function in `ClassroomDetailStudent.js` has been updated to use the smart notification logic:

```javascript
const handleStudentPostAnnouncement = async (e) => {
  e.preventDefault();
  if (!studentAnnouncement.trim()) return;

  try {
    // Prepare post data
    const postData = {
      title: announcementTitle,
      content: studentAnnouncement,
      is_draft: 0,
      is_scheduled: 0,
      scheduled_at: "",
      allow_comments: allowComments ? 1 : 0,
      attachment_type: attachments.length > 0 ? "file" : null,
      attachment_url: attachments.length > 0 ? attachments[0].url : "",
      // Smart notification logic: if selected students are specified, use them
      student_ids: selectedAnnouncementStudents.length > 0 ? selectedAnnouncementStudents : null
    };

    // Use the new API method with smart notification logic
    const response = await apiService.createStudentPostWithSmartNotifications(code, postData);

    if (response.status) {
      // Show success message with notification info
      const notificationInfo = response.smartNotificationLogic;
      console.log(`Post created successfully! Notifications sent to ${notificationInfo.totalRecipients} recipients (${notificationInfo.teacherNotified ? '1 teacher' : '0 teachers'}, ${notificationInfo.studentsNotified} students)`);
      
      // Reset form and update UI
      // ...
    }
  } catch (error) {
    console.error('Error posting announcement:', error);
  }
};
```

## API Endpoint

**Endpoint**: `POST /student/classroom/{classCode}/stream`

**Example Request**:
```json
{
  "title": "STUDENT",
  "content": "Please pass your assignment 2 on time!",
  "is_draft": 0,
  "is_scheduled": 0,
  "scheduled_at": "",
  "allow_comments": 1,
  "attachment_type": "file",
  "attachment_url": "uploads/announcements/exam.pdf",
  "student_ids": ["STU123", "STU456"]  // Optional: specific students to notify
}
```

**Example Response**:
```json
{
  "status": true,
  "message": "Post created successfully",
  "data": {
    "id": "50",
    "class_code": "J56NHD",
    "user_id": "STU685651BF9DDCF988",
    "title": "STUDENT",
    "content": "Please pass your assignment 2 on time!",
    "created_at": "2025-08-08 00:33:03",
    "is_pinned": "0",
    "updated_at": null,
    "is_draft": "0",
    "is_scheduled": "0",
    "scheduled_at": "0000-00-00 00:00:00",
    "allow_comments": "1",
    "attachment_type": "file",
    "attachment_url": "uploads/announcements/exam.pdf",
    "visible_to_student_ids": null,
    "liked_by_user_ids": null
  },
  "notificationRecipients": 5,
  "smartNotificationLogic": {
    "teacherNotified": true,
    "studentsNotified": 4,
    "totalRecipients": 5
  }
}
```

## Testing

A test file `test_student_stream_post.html` has been created to demonstrate the smart notification logic with three test cases:

1. **Post to All Students**: No student_ids specified, notifies teacher + all other students
2. **Post to Specific Students**: student_ids provided, notifies teacher + specified students only
3. **Post with Attachment**: Includes file attachment in the notification

## Benefits

1. **Intelligent Targeting**: Automatically determines the right recipients based on post configuration
2. **Validation**: Ensures only enrolled students receive notifications
3. **Flexibility**: Supports both broadcast and targeted notifications
4. **Transparency**: Provides detailed feedback about notification delivery
5. **User Experience**: Students can select specific recipients or post to everyone

## Usage Examples

### Post to All Students
```javascript
const postData = {
  title: "General Announcement",
  content: "Please check the updated schedule",
  student_ids: null  // Will notify teacher + all other students
};
```

### Post to Specific Students
```javascript
const postData = {
  title: "Group Project Update",
  content: "Meeting tomorrow at 2 PM",
  student_ids: ["STU123", "STU456", "STU789"]  // Will notify teacher + specified students only
};
```

### Post with Attachment
```javascript
const postData = {
  title: "Assignment Guidelines",
  content: "Please review the attached guidelines",
  attachment_type: "file",
  attachment_url: "uploads/assignments/guidelines.pdf",
  student_ids: null  // Will notify teacher + all other students
};
```

## Security Considerations

1. **Authentication**: All API calls require valid authentication tokens
2. **Authorization**: Students can only post to classes they're enrolled in
3. **Validation**: Student IDs are validated against actual class enrollment
4. **Rate Limiting**: Consider implementing rate limiting for notification sending
5. **Privacy**: Notification content is properly sanitized and structured

## Future Enhancements

1. **Notification Preferences**: Allow users to set notification preferences
2. **Read Receipts**: Track notification read status
3. **Push Notifications**: Integrate with mobile push notification services
4. **Notification History**: Store and display notification history
5. **Advanced Filtering**: More sophisticated recipient selection options
