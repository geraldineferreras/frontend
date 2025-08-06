# Mobile Background Notifications Guide

## 📱 Overview

Yes! Your SCMS can send notifications to mobile phones even when the app is in the background. Here are the different approaches:

## ✅ **What's Already Implemented**

### **1. Progressive Web App (PWA)**
- ✅ Service Worker (`public/sw.js`) - Handles background tasks
- ✅ PWA Manifest (`public/manifest.json`) - Makes app installable
- ✅ Mobile Notification Service (`src/services/mobileNotificationService.js`)
- ✅ Push Notifications - Server-side support

### **2. Background Notification Types**
- **Push Notifications** - Server sends notifications to mobile
- **Background Sync** - Syncs when connection is restored
- **Local Notifications** - Shows when app is in background
- **Badge Count** - Shows unread count on app icon

## 🚀 **How It Works**

### **When App is Active (Foreground)**
```javascript
// Real-time Socket.IO notifications
notificationService.sendNotification(userId, 'student', 'Grade posted!', 'grade');
```

### **When App is in Background**
```javascript
// Push notifications via service worker
webpush.sendNotification(subscription, {
  title: 'SCMS Notification',
  body: 'Your grade has been posted!',
  icon: '/favicon.ico'
});
```

## 📋 **Database Setup**

### **Create Push Subscriptions Table**
```sql
CREATE TABLE push_subscriptions (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  user_role VARCHAR(50) NOT NULL,
  subscription_data JSON NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_user (user_id, user_role)
);
```

## 🔧 **Installation Steps**

### **1. Install Dependencies**
```bash
npm install web-push
```

### **2. Update package.json**
```json
{
  "dependencies": {
    "web-push": "^3.6.6"
  }
}
```

### **3. Initialize Mobile Notifications**
```javascript
import mobileNotificationService from './services/mobileNotificationService';

// In your app initialization
const initializeMobileNotifications = async () => {
  const user = JSON.parse(localStorage.getItem('user'));
  
  if (user) {
    const success = await mobileNotificationService.initialize(
      user.id, 
      user.role
    );
    
    if (success) {
      console.log('Mobile notifications enabled');
    }
  }
};
```

## 📱 **Mobile Features**

### **1. Install as App**
```javascript
// Show install prompt
mobileNotificationService.showInstallPrompt();

// Install PWA
mobileNotificationService.installPWA();
```

### **2. Background Notifications**
```javascript
// Send notification when app is in background
if (mobileNotificationService.isAppInBackground()) {
  await mobileNotificationService.sendLocalNotification({
    message: 'New grade posted!',
    type: 'grade',
    data: { assignmentId: 123, grade: 95 }
  });
}
```

### **3. Badge Count**
```javascript
// Update app icon badge
mobileNotificationService.updateBadgeCount(unreadCount);

// Clear badge
mobileNotificationService.clearBadge();
```

## 🔄 **Notification Flow**

### **Teacher Posts Grade**
```javascript
// 1. Teacher posts grade
await api.post('/grades', gradeData);

// 2. Send notification to student
await notificationService.sendNotification(
  studentId, 'student',
  'Your grade for Assignment #3 has been posted.',
  'grade',
  { assignmentId: 123, grade: 95 }
);

// 3. If student's app is in background, send push notification
if (mobileNotificationService.isAppInBackground()) {
  await fetch('/api/push/send', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      userId: studentId,
      message: 'Your grade for Assignment #3 has been posted.',
      type: 'grade',
      data: { assignmentId: 123, grade: 95 }
    })
  });
}
```

### **Student Submits Assignment**
```javascript
// 1. Student submits assignment
await api.post('/assignments/submit', assignmentData);

// 2. Send notification to teacher
await notificationService.sendNotification(
  teacherId, 'teacher',
  'New assignment submitted by John Doe.',
  'assignment',
  { assignmentId: 456, studentId: 789 }
);

// 3. Send push notification if teacher's app is in background
if (mobileNotificationService.isAppInBackground()) {
  await fetch('/api/push/send', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      userId: teacherId,
      message: 'New assignment submitted by John Doe.',
      type: 'assignment',
      data: { assignmentId: 456, studentId: 789 }
    })
  });
}
```

## 🛡️ **Security & Privacy**

### **1. VAPID Keys**
```javascript
// Generate VAPID keys for push notifications
const vapidKeys = webpush.generateVAPIDKeys();

// Store securely
process.env.VAPID_PUBLIC_KEY = vapidKeys.publicKey;
process.env.VAPID_PRIVATE_KEY = vapidKeys.privateKey;
```

### **2. Permission Handling**
```javascript
// Request notification permission
const permission = await Notification.requestPermission();

if (permission === 'granted') {
  // Enable notifications
} else if (permission === 'denied') {
  // Show manual enable instructions
}
```

### **3. Subscription Management**
```javascript
// Subscribe to push notifications
const subscription = await serviceWorker.pushManager.subscribe({
  userVisibleOnly: true,
  applicationServerKey: vapidPublicKey
});

// Send to server
await fetch('/api/push-subscription', {
  method: 'POST',
  body: JSON.stringify({ userId, userRole, subscription })
});
```

## 📊 **Testing Mobile Notifications**

### **1. Test on Real Device**
```bash
# Build for production
npm run build

# Serve with HTTPS (required for service workers)
npx serve -s build --ssl-cert
```

### **2. Test Background Notifications**
```javascript
// Test function
const testBackgroundNotification = async () => {
  // 1. Put app in background
  document.hidden = true;
  
  // 2. Send notification
  await mobileNotificationService.sendLocalNotification({
    message: 'Test background notification',
    type: 'test'
  });
  
  // 3. Check if notification appears
  console.log('Notification should appear on mobile');
};
```

### **3. Test Push Notifications**
```javascript
// Test push notification
const testPushNotification = async () => {
  await fetch('/api/push/send', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      userId: 1,
      message: 'Test push notification',
      type: 'test'
    })
  });
};
```

## 📱 **Mobile-Specific Features**

### **1. App Icon Badge**
```javascript
// Update badge count
if ('setAppBadge' in navigator) {
  navigator.setAppBadge(unreadCount);
}

// Clear badge
if ('clearAppBadge' in navigator) {
  navigator.clearAppBadge();
}
```

### **2. Vibration**
```javascript
// Vibrate on notification
if ('vibrate' in navigator) {
  navigator.vibrate([200, 100, 200]);
}
```

### **3. Sound**
```javascript
// Play notification sound
const audio = new Audio('/grading-success-female.mp3');
audio.play();
```

## 🚨 **Troubleshooting**

### **Common Issues**

1. **Notifications Not Working**
   ```bash
   # Check service worker registration
   chrome://serviceworker-internals/
   
   # Check notification permissions
   chrome://settings/content/notifications
   ```

2. **Push Notifications Not Received**
   ```javascript
   // Check subscription
   const subscription = await serviceWorker.pushManager.getSubscription();
   console.log('Current subscription:', subscription);
   ```

3. **App Not Installing**
   ```javascript
   // Check PWA criteria
   // - HTTPS required
   // - Valid manifest.json
   // - Service worker registered
   ```

### **Debug Commands**
```bash
# Check service worker status
navigator.serviceWorker.getRegistrations().then(console.log);

# Check push subscription
navigator.serviceWorker.ready.then(sw => 
  sw.pushManager.getSubscription().then(console.log)
);
```

## 📱 **Mobile Browser Support**

### **Supported Features**
- ✅ **Chrome/Edge** - Full PWA + Push support
- ✅ **Firefox** - Full PWA + Push support
- ✅ **Safari** - Limited PWA support
- ⚠️ **Safari** - No push notifications (iOS limitation)

### **iOS Limitations**
```javascript
// iOS Safari doesn't support push notifications
// Use local notifications instead
if (navigator.userAgent.includes('iPhone') || navigator.userAgent.includes('iPad')) {
  // Use local notifications only
  mobileNotificationService.sendLocalNotification(notification);
} else {
  // Use push notifications
  fetch('/api/push/send', { /* ... */ });
}
```

## 🎯 **Best Practices**

### **1. User Experience**
- Request permission at appropriate time
- Provide clear value proposition
- Allow easy opt-out

### **2. Performance**
- Minimize background processing
- Use efficient caching strategies
- Handle offline scenarios

### **3. Privacy**
- Only send relevant notifications
- Respect user preferences
- Secure data transmission

## 📞 **Support**

For mobile notification issues:
- Test on real devices (not just emulators)
- Check browser console for errors
- Verify HTTPS is enabled
- Test with different browsers

Your SCMS now supports full mobile background notifications! 🚀📱 