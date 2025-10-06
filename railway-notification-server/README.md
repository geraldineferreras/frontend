# SCMS Notification Server

Real-time notification server for SCMS deployed on Railway.

## Deployment

This server is configured to run on Railway with the following environment variables:

- `DB_HOST` - MySQL host (use `${{ MySQL.MYSQLHOST }}`)
- `DB_USER` - MySQL user (use `${{ MySQL.MYSQLUSER }}`)
- `DB_PASSWORD` - MySQL password (use `${{ MySQL.MYSQLPASSWORD }}`)
- `DB_NAME` - MySQL database name (use `${{ MySQL.MYSQLDATABASE }}`)
- `ALLOWED_ORIGINS` - Allowed CORS origins (set to your Vercel URL)
- `PORT` - Server port (Railway will set this automatically)

## Endpoints

- `GET /health` - Health check
- `GET /api/notifications/status` - Connection status
- `GET /api/notifications/user/:userId` - User notifications
- `POST /api/push-subscription` - Push subscription
- `POST /api/push/send` - Send push notification

## WebSocket Events

- `join-room` - Join user room
- `send-notification` - Send notification
- `send-role-notification` - Send role-based notification
- `mark-notification-read` - Mark as read
- `mark-all-notifications-read` - Mark all as read
