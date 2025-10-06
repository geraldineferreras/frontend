# SCMS Notification Server

This is the real-time notification server for the SCMS (School Classroom Management System).

## Setup

1. Install dependencies:
```bash
npm install
```

2. Set environment variables:
```env
DB_HOST=your-mysql-host
DB_USER=your-mysql-user
DB_PASSWORD=your-mysql-password
DB_NAME=scms_db
ALLOWED_ORIGINS=https://scmsupdatedbackup.vercel.app
PORT=4000
```

3. Start the server:
```bash
npm start
```

## Endpoints

- `GET /health` - Health check
- `GET /api/notifications/status` - Get connection status
- `GET /api/notifications/user/:userId` - Get user notifications
- `POST /api/push-subscription` - Subscribe to push notifications
- `POST /api/push/send` - Send push notification

## WebSocket Events

- `join-room` - Join user-specific room
- `send-notification` - Send notification to specific user
- `send-role-notification` - Send notification to all users of a role
- `mark-notification-read` - Mark notification as read
- `mark-all-notifications-read` - Mark all notifications as read

## Deployment

This server is designed to be deployed on Railway alongside the main SCMS backend.
