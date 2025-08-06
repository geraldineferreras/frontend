const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');
const mysql = require('mysql2/promise');
const webpush = require('web-push');

const app = express();
const server = http.createServer(app);

// CORS configuration
app.use(cors({
  origin: process.env.ALLOWED_ORIGINS?.split(',') || ['http://localhost:3000', 'https://your-domain.com'],
  credentials: true
}));

// Socket.IO server with CORS
const io = new Server(server, {
  cors: {
    origin: process.env.ALLOWED_ORIGINS?.split(',') || ['http://localhost:3000', 'https://your-domain.com'],
    credentials: true,
    methods: ['GET', 'POST']
  },
  transports: ['websocket', 'polling']
});

// Database connection
const dbConfig = {
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'scms_db',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
};

// VAPID keys for push notifications
const vapidKeys = webpush.generateVAPIDKeys();
webpush.setVapidDetails(
  'mailto:your-email@example.com',
  vapidKeys.publicKey,
  vapidKeys.privateKey
);

let dbPool;

// Initialize database connection
async function initializeDatabase() {
  try {
    dbPool = mysql.createPool(dbConfig);
    console.log('Database connected successfully');
  } catch (error) {
    console.error('Database connection failed:', error);
  }
}

// Store active connections
const activeConnections = new Map(); // userId -> socket
const roleRooms = new Map(); // role -> Set of userIds

// Socket.IO connection handling
io.on('connection', (socket) => {
  console.log('User connected:', socket.id);

  // Join user to their specific room
  socket.on('join-room', (userId, userRole) => {
    console.log(`User ${userId} (${userRole}) joining room`);
    
    // Store connection
    activeConnections.set(userId, socket);
    socket.userId = userId;
    socket.userRole = userRole;
    
    // Join user-specific room
    socket.join(`user-${userId}`);
    
    // Join role-specific room
    socket.join(`role-${userRole}`);
    
    // Add to role tracking
    if (!roleRooms.has(userRole)) {
      roleRooms.set(userRole, new Set());
    }
    roleRooms.get(userRole).add(userId);
    
    console.log(`User ${userId} joined rooms: user-${userId}, role-${userRole}`);
  });

  // Handle notification sending
  socket.on('send-notification', async (data) => {
    try {
      const { recipientId, recipientRole, message, type, data: notificationData, notificationId } = data;
      
      console.log(`Sending notification to ${recipientId} (${recipientRole}): ${message}`);
      
      // Save to database
      if (dbPool) {
        const [result] = await dbPool.execute(
          'INSERT INTO notifications (recipient_id, recipient_role, message, type, data, created_at) VALUES (?, ?, ?, ?, ?, NOW())',
          [recipientId, recipientRole, message, type, JSON.stringify(notificationData)]
        );
        
        // Emit to specific user
        io.to(`user-${recipientId}`).emit('new-notification', {
          id: result.insertId,
          message,
          type,
          data: notificationData,
          created_at: new Date().toISOString(),
          is_read: false
        });
        
        console.log(`Notification sent to user ${recipientId}`);
      }
    } catch (error) {
      console.error('Error sending notification:', error);
      socket.emit('notification-error', { message: 'Failed to send notification' });
    }
  });

  // Handle role-based notifications
  socket.on('send-role-notification', async (data) => {
    try {
      const { role, message, type, data: notificationData, notificationId } = data;
      
      console.log(`Sending role notification to ${role}: ${message}`);
      
      // Save to database
      if (dbPool) {
        const [result] = await dbPool.execute(
          'INSERT INTO notifications (recipient_role, message, type, data, is_broadcast, created_at) VALUES (?, ?, ?, ?, true, NOW())',
          [role, message, type, JSON.stringify(notificationData)]
        );
        
        // Emit to all users of that role
        io.to(`role-${role}`).emit('new-notification', {
          id: result.insertId,
          message,
          type,
          data: notificationData,
          created_at: new Date().toISOString(),
          is_read: false,
          is_broadcast: true
        });
        
        console.log(`Role notification sent to ${role}`);
      }
    } catch (error) {
      console.error('Error sending role notification:', error);
      socket.emit('notification-error', { message: 'Failed to send role notification' });
    }
  });

  // Handle marking notifications as read
  socket.on('mark-notification-read', async (notificationId) => {
    try {
      if (dbPool) {
        await dbPool.execute(
          'UPDATE notifications SET is_read = true, read_at = NOW() WHERE id = ?',
          [notificationId]
        );
        
        // Broadcast to all connected clients
        io.emit('notification-updated', {
          notificationId,
          is_read: true,
          read_at: new Date().toISOString()
        });
      }
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  });

  // Handle marking all notifications as read
  socket.on('mark-all-notifications-read', async () => {
    try {
      if (dbPool && socket.userId) {
        await dbPool.execute(
          'UPDATE notifications SET is_read = true, read_at = NOW() WHERE recipient_id = ?',
          [socket.userId]
        );
        
        // Broadcast to user
        socket.emit('all-notifications-read');
      }
    } catch (error) {
      console.error('Error marking all notifications as read:', error);
    }
  });

  // Video conferencing events (existing functionality)
  socket.on('join-session', (sessionId) => {
    socket.join(sessionId);
    socket.sessionId = sessionId;
    io.to(sessionId).emit('user-joined', socket.id);
  });

  socket.on('signal', ({ sessionId, data }) => {
    socket.to(sessionId).emit('signal', { from: socket.id, data });
  });

  // Disconnect handling
  socket.on('disconnect', () => {
    console.log('User disconnected:', socket.id);
    
    if (socket.userId) {
      // Remove from active connections
      activeConnections.delete(socket.userId);
      
      // Remove from role tracking
      if (socket.userRole && roleRooms.has(socket.userRole)) {
        roleRooms.get(socket.userRole).delete(socket.userId);
      }
      
      // Emit user left event for video sessions
      if (socket.sessionId) {
        io.to(socket.sessionId).emit('user-left', socket.id);
      }
    }
  });
});

// API endpoints for notifications
app.get('/api/notifications/status', (req, res) => {
  res.json({
    connected: activeConnections.size,
    roles: Object.fromEntries(
      Array.from(roleRooms.entries()).map(([role, users]) => [role, users.size])
    )
  });
});

app.get('/api/notifications/user/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    
    if (dbPool) {
      const [notifications] = await dbPool.execute(
        'SELECT * FROM notifications WHERE recipient_id = ? ORDER BY created_at DESC LIMIT 50',
        [userId]
      );
      
      res.json(notifications);
    } else {
      res.status(500).json({ error: 'Database not connected' });
    }
  } catch (error) {
    console.error('Error fetching notifications:', error);
    res.status(500).json({ error: 'Failed to fetch notifications' });
  }
});

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    connections: activeConnections.size,
    uptime: process.uptime()
  });
});

// VAPID public key endpoint
app.get('/api/push/vapid-public-key', (req, res) => {
  res.json({
    publicKey: vapidKeys.publicKey
  });
});

// Push subscription endpoint
app.post('/api/push-subscription', async (req, res) => {
  try {
    const { userId, userRole, subscription } = req.body;
    
    if (dbPool) {
      await dbPool.execute(
        'INSERT INTO push_subscriptions (user_id, user_role, subscription_data, created_at) VALUES (?, ?, ?, NOW()) ON DUPLICATE KEY UPDATE subscription_data = VALUES(subscription_data), updated_at = NOW()',
        [userId, userRole, JSON.stringify(subscription)]
      );
    }
    
    res.json({ success: true });
  } catch (error) {
    console.error('Error saving push subscription:', error);
    res.status(500).json({ error: 'Failed to save subscription' });
  }
});

// Send push notification endpoint
app.post('/api/push/send', async (req, res) => {
  try {
    const { userId, message, type, data } = req.body;
    
    if (dbPool) {
      // Get user's push subscription
      const [subscriptions] = await dbPool.execute(
        'SELECT subscription_data FROM push_subscriptions WHERE user_id = ?',
        [userId]
      );
      
      if (subscriptions.length > 0) {
        const subscription = JSON.parse(subscriptions[0].subscription_data);
        
        const payload = JSON.stringify({
          title: 'SCMS Notification',
          body: message,
          type,
          data,
          icon: '/favicon.ico',
          badge: '/favicon.ico'
        });
        
        await webpush.sendNotification(subscription, payload);
        console.log(`Push notification sent to user ${userId}`);
      }
    }
    
    res.json({ success: true });
  } catch (error) {
    console.error('Error sending push notification:', error);
    res.status(500).json({ error: 'Failed to send push notification' });
  }
});

// Start server
const PORT = process.env.PORT || 4000;

async function startServer() {
  await initializeDatabase();
  
  server.listen(PORT, () => {
    console.log(`Notification server running on port ${PORT}`);
    console.log(`Health check: http://localhost:${PORT}/health`);
    console.log(`Status endpoint: http://localhost:${PORT}/api/notifications/status`);
  });
}

startServer().catch(console.error);

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM received, shutting down gracefully');
  server.close(() => {
    console.log('Server closed');
    if (dbPool) {
      dbPool.end();
    }
    process.exit(0);
  });
});

process.on('SIGINT', () => {
  console.log('SIGINT received, shutting down gracefully');
  server.close(() => {
    console.log('Server closed');
    if (dbPool) {
      dbPool.end();
    }
    process.exit(0);
  });
}); 