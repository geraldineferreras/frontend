import io from 'socket.io-client';
import api from './api.js';

class NotificationService {
  constructor() {
    this.socket = null;
    this.isConnected = false;
    this.notificationHandlers = [];
    this.reconnectAttempts = 0;
    this.maxReconnectAttempts = 5;
  }

  // Initialize connection
  connect(userId, userRole) {
    if (this.socket) {
      this.disconnect();
    }

    // Connect to your deployed server
    const serverUrl = process.env.REACT_APP_NOTIFICATION_SERVER || 'https://your-domain.com';
    this.socket = io(serverUrl, {
      transports: ['websocket', 'polling'],
      timeout: 20000,
      reconnection: true,
      reconnectionAttempts: this.maxReconnectAttempts,
      reconnectionDelay: 1000
    });

    // Connection events
    this.socket.on('connect', () => {
      console.log('Connected to notification server');
      this.isConnected = true;
      this.reconnectAttempts = 0;
      
      // Join user-specific room
      this.socket.emit('join-room', userId, userRole);
    });

    this.socket.on('disconnect', () => {
      console.log('Disconnected from notification server');
      this.isConnected = false;
    });

    this.socket.on('connect_error', (error) => {
      console.error('Connection error:', error);
      this.reconnectAttempts++;
      
      if (this.reconnectAttempts >= this.maxReconnectAttempts) {
        console.error('Max reconnection attempts reached');
      }
    });

    // Handle incoming notifications
    this.socket.on('new-notification', (notification) => {
      console.log('Received notification:', notification);
      this.handleNotification(notification);
    });

    // Handle notification updates
    this.socket.on('notification-updated', (data) => {
      console.log('Notification updated:', data);
      this.handleNotificationUpdate(data);
    });
  }

  // Disconnect from server
  disconnect() {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
      this.isConnected = false;
    }
  }

  // Send notification to specific user
  async sendNotification(recipientId, recipientRole, message, type = 'general', data = {}) {
    if (!this.isConnected) {
      throw new Error('Not connected to notification server');
    }

    try {
      // First save to database via API
      const notificationData = {
        recipient_id: recipientId,
        recipient_role: recipientRole,
        message,
        type,
        data: JSON.stringify(data),
        created_at: new Date().toISOString()
      };

      const savedNotification = await api.post('/notifications', notificationData);
      
      // Then emit via socket for real-time delivery
      this.socket.emit('send-notification', {
        recipientId,
        recipientRole,
        message,
        type,
        data,
        notificationId: savedNotification.id
      });

      return savedNotification;
    } catch (error) {
      console.error('Error sending notification:', error);
      throw error;
    }
  }

  // Send notification to multiple users
  async sendBulkNotification(recipients, message, type = 'general', data = {}) {
    const promises = recipients.map(recipient => 
      this.sendNotification(recipient.id, recipient.role, message, type, data)
    );
    return Promise.all(promises);
  }

  // Send notification to all users of a specific role
  async sendRoleNotification(role, message, type = 'general', data = {}) {
    if (!this.isConnected) {
      throw new Error('Not connected to notification server');
    }

    try {
      // Save to database
      const notificationData = {
        recipient_role: role,
        message,
        type,
        data: JSON.stringify(data),
        is_broadcast: true,
        created_at: new Date().toISOString()
      };

      const savedNotification = await api.post('/notifications/broadcast', notificationData);
      
      // Emit to all users of that role
      this.socket.emit('send-role-notification', {
        role,
        message,
        type,
        data,
        notificationId: savedNotification.id
      });

      return savedNotification;
    } catch (error) {
      console.error('Error sending role notification:', error);
      throw error;
    }
  }

  // Mark notification as read
  async markAsRead(notificationId) {
    try {
      await api.put(`/notifications/${notificationId}/read`);
      this.socket.emit('mark-notification-read', notificationId);
    } catch (error) {
      console.error('Error marking notification as read:', error);
      throw error;
    }
  }

  // Mark all notifications as read
  async markAllAsRead() {
    try {
      await api.put('/notifications/read-all');
      this.socket.emit('mark-all-notifications-read');
    } catch (error) {
      console.error('Error marking all notifications as read:', error);
      throw error;
    }
  }

  // Add notification handler
  onNotification(handler) {
    this.notificationHandlers.push(handler);
  }

  // Remove notification handler
  offNotification(handler) {
    const index = this.notificationHandlers.indexOf(handler);
    if (index > -1) {
      this.notificationHandlers.splice(index, 1);
    }
  }

  // Handle incoming notification
  handleNotification(notification) {
    this.notificationHandlers.forEach(handler => {
      try {
        handler(notification);
      } catch (error) {
        console.error('Error in notification handler:', error);
      }
    });
  }

  // Handle notification updates
  handleNotificationUpdate(data) {
    this.notificationHandlers.forEach(handler => {
      try {
        handler({ type: 'update', ...data });
      } catch (error) {
        console.error('Error in notification update handler:', error);
      }
    });
  }

  // Get connection status
  getConnectionStatus() {
    return {
      isConnected: this.isConnected,
      reconnectAttempts: this.reconnectAttempts
    };
  }
}

// Create singleton instance
const notificationService = new NotificationService();
export default notificationService; 