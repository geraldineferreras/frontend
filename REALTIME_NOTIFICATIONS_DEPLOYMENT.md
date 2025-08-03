# Real-Time Notifications Deployment Guide

## Overview
This guide explains how to deploy and configure real-time notifications between teachers and students in your SCMS system when deployed online.

## ✅ What's Already Implemented

### Frontend Components
- ✅ `RealTimeNotification.js` - Dropdown notification component
- ✅ `notificationService.js` - Socket.IO client service
- ✅ `StudentNotifications.js` - Student notification page
- ✅ Socket.IO dependencies already installed

### Backend Infrastructure
- ✅ `notification-server.js` - Complete Socket.IO server
- ✅ Database integration for persistent notifications
- ✅ Video conferencing compatibility
- ✅ Role-based notification rooms

## 🚀 Deployment Options

### Option 1: Vercel + Railway (Recommended)

#### Frontend (Vercel)
```bash
# Deploy your React app to Vercel
vercel --prod
```

#### Backend (Railway)
```bash
# Deploy notification server to Railway
railway login
railway init
railway up
```

#### Environment Variables for Railway
```env
DB_HOST=your-mysql-host
DB_USER=your-mysql-user
DB_PASSWORD=your-mysql-password
DB_NAME=scms_db
ALLOWED_ORIGINS=https://your-vercel-app.vercel.app
PORT=4000
```

### Option 2: Heroku

#### Frontend
```bash
# Build and deploy to Heroku
npm run build
git add .
git commit -m "Add real-time notifications"
git push heroku main
```

#### Backend
```bash
# Deploy notification server to Heroku
heroku create your-notification-server
heroku addons:create heroku-postgresql
git push heroku main
```

### Option 3: DigitalOcean Droplet

#### Complete Setup
```bash
# Install Node.js, MySQL, PM2
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs mysql-server

# Install PM2 for process management
npm install -g pm2

# Clone and setup notification server
git clone your-repo
cd your-repo
npm install
pm2 start notification-server.js --name "scms-notifications"
pm2 startup
pm2 save
```

## 📋 Database Setup

### Create Notifications Table
```sql
CREATE TABLE notifications (
  id INT AUTO_INCREMENT PRIMARY KEY,
  recipient_id INT NOT NULL,
  recipient_role VARCHAR(50) NOT NULL,
  message TEXT NOT NULL,
  type VARCHAR(50) DEFAULT 'general',
  data JSON,
  is_read BOOLEAN DEFAULT FALSE,
  is_broadcast BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  read_at TIMESTAMP NULL,
  INDEX idx_recipient (recipient_id, recipient_role),
  INDEX idx_created_at (created_at),
  INDEX idx_is_read (is_read)
);
```

## 🔧 Configuration

### 1. Update Frontend Environment Variables
Create `.env.production`:
```env
REACT_APP_NOTIFICATION_SERVER=https://your-notification-server.com
REACT_APP_API_BASE_URL=https://your-api-server.com/api
```

### 2. Update API Service
In `src/services/api.js`, add notification endpoints:
```javascript
// Add these methods to your ApiService class
async getNotifications(userId) {
  return this.get(`/notifications/user/${userId}`);
}

async markNotificationAsRead(notificationId) {
  return this.put(`/notifications/${notificationId}/read`);
}

async markAllNotificationsAsRead() {
  return this.put('/notifications/read-all');
}

async sendNotification(notificationData) {
  return this.post('/notifications', notificationData);
}
```

### 3. Integrate Notification Component
Add to your navbar/header:
```javascript
import RealTimeNotification from 'components/RealTimeNotification';

// In your header component
<RealTimeNotification userId={user.id} userRole={user.role} />
```

## 🔄 Notification Types & Examples

### Teacher → Student Notifications
```javascript
// Grade posted
await notificationService.sendNotification(
  studentId, 'student', 
  'Your grade for Assignment #3 has been posted.', 
  'grade',
  { assignmentId: 123, grade: 95 }
);

// New assignment
await notificationService.sendNotification(
  studentId, 'student',
  'New assignment: Project Proposal due next week.',
  'assignment',
  { assignmentId: 456, dueDate: '2024-01-15' }
);

// Attendance marked
await notificationService.sendNotification(
  studentId, 'student',
  'Your attendance has been marked as present.',
  'attendance',
  { date: '2024-01-10', status: 'present' }
);
```

### Student → Teacher Notifications
```javascript
// Excuse letter submitted
await notificationService.sendNotification(
  teacherId, 'teacher',
  'New excuse letter submitted by John Doe.',
  'excuse',
  { studentId: 123, reason: 'Medical appointment' }
);

// Assignment submitted
await notificationService.sendNotification(
  teacherId, 'teacher',
  'Assignment submitted by Jane Smith.',
  'assignment',
  { assignmentId: 456, studentId: 789 }
);
```

### Broadcast Notifications
```javascript
// Announcement to all students
await notificationService.sendRoleNotification(
  'student',
  'Class is suspended tomorrow due to maintenance.',
  'announcement',
  { priority: 'high' }
);

// System maintenance to all users
await notificationService.sendRoleNotification(
  'all',
  'System maintenance scheduled for tonight.',
  'system',
  { maintenanceTime: '2024-01-10 22:00' }
);
```

## 🛡️ Security Considerations

### 1. Authentication
```javascript
// Add JWT verification to notification server
const jwt = require('jsonwebtoken');

io.use((socket, next) => {
  const token = socket.handshake.auth.token;
  if (!token) {
    return next(new Error('Authentication error'));
  }
  
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    socket.userId = decoded.userId;
    socket.userRole = decoded.role;
    next();
  } catch (err) {
    next(new Error('Authentication error'));
  }
});
```

### 2. Rate Limiting
```javascript
const rateLimit = require('express-rate-limit');

const notificationLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: 'Too many notification requests'
});

app.use('/api/notifications', notificationLimiter);
```

### 3. CORS Configuration
```javascript
// In notification-server.js
app.use(cors({
  origin: process.env.ALLOWED_ORIGINS?.split(',') || [
    'https://your-frontend-domain.com',
    'https://your-admin-domain.com'
  ],
  credentials: true
}));
```

## 📊 Monitoring & Analytics

### Health Check Endpoints
```bash
# Check server status
curl https://your-notification-server.com/health

# Check active connections
curl https://your-notification-server.com/api/notifications/status
```

### Logging
```javascript
// Add comprehensive logging
const winston = require('winston');

const logger = winston.createLogger({
  level: 'info',
  format: winston.format.json(),
  transports: [
    new winston.transports.File({ filename: 'error.log', level: 'error' }),
    new winston.transports.File({ filename: 'combined.log' })
  ]
});
```

## 🧪 Testing

### Manual Testing
```javascript
// Test notification sending
const testNotification = async () => {
  try {
    await notificationService.sendNotification(
      1, 'student',
      'Test notification from teacher',
      'test',
      { test: true }
    );
    console.log('Test notification sent successfully');
  } catch (error) {
    console.error('Test notification failed:', error);
  }
};
```

### Automated Testing
```javascript
// Add to your test suite
describe('Notification Service', () => {
  test('should connect to notification server', async () => {
    const service = new NotificationService();
    await service.connect(1, 'student');
    expect(service.isConnected).toBe(true);
  });
});
```

## 🚨 Troubleshooting

### Common Issues

1. **Connection Failed**
   - Check server URL in environment variables
   - Verify CORS settings
   - Check firewall/network settings

2. **Notifications Not Received**
   - Verify user is connected to correct room
   - Check database connection
   - Verify notification permissions

3. **Performance Issues**
   - Monitor server resources
   - Implement connection pooling
   - Add rate limiting

### Debug Commands
```bash
# Check server logs
pm2 logs scms-notifications

# Monitor connections
pm2 monit

# Restart service
pm2 restart scms-notifications
```

## 📱 Mobile Considerations

### Progressive Web App (PWA)
```javascript
// Add to your React app
// public/manifest.json
{
  "name": "SCMS Notifications",
  "short_name": "SCMS",
  "start_url": "/",
  "display": "standalone",
  "background_color": "#ffffff",
  "theme_color": "#000000"
}
```

### Push Notifications
```javascript
// Request push notification permission
if ('serviceWorker' in navigator && 'PushManager' in window) {
  navigator.serviceWorker.register('/sw.js')
    .then(registration => {
      return registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(process.env.VAPID_PUBLIC_KEY)
      });
    });
}
```

## 🎯 Next Steps

1. **Deploy notification server** to your chosen platform
2. **Update environment variables** in your frontend
3. **Test notifications** between different user roles
4. **Monitor performance** and adjust as needed
5. **Add more notification types** as your system grows

## 📞 Support

For deployment issues:
- Check server logs for errors
- Verify database connectivity
- Test with simple notification first
- Monitor network connectivity

This setup provides a robust, scalable real-time notification system that will work seamlessly when deployed online! 🚀 