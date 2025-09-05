import api from './api';

class NotificationService {
  constructor() {
    this.listeners = new Set();
    this.pollingInterval = null;
    this.lastNotificationId = null;
    this.isConnected = false;
  }

  // Connect to notification service
  async connect(userId, userRole) {
    try {
      this.userId = userId;
      this.userRole = userRole;
      this.isConnected = true;
      
      // Start polling for new notifications
      this.startPolling();
      
      // Request browser notification permission
      if (Notification.permission === 'default') {
        await Notification.requestPermission();
      }
      
      console.log('Notification service connected');
      return true;
    } catch (error) {
      console.error('Failed to connect to notification service:', error);
      this.isConnected = false;
      return false;
    }
  }

  // Disconnect from notification service
  disconnect() {
    this.isConnected = false;
    this.stopPolling();
    this.listeners.clear();
    console.log('Notification service disconnected');
  }

  // Start polling for new notifications
  startPolling() {
    if (this.pollingInterval) {
      clearInterval(this.pollingInterval);
    }
    
    // Poll every 30 seconds for new notifications
    this.pollingInterval = setInterval(async () => {
      if (this.isConnected) {
        await this.checkForNewNotifications();
      }
    }, 30000);
  }

  // Stop polling
  stopPolling() {
    if (this.pollingInterval) {
      clearInterval(this.pollingInterval);
      this.pollingInterval = null;
    }
  }

  // Check for new notifications
  async checkForNewNotifications() {
    try {
      const response = await api.get('/api/notifications/recent');
      if (response.success && response.data && response.data.notifications) {
        const notifications = response.data.notifications;
        
        // Check for new notifications
        if (this.lastNotificationId && notifications.length > 0) {
          const newNotifications = notifications.filter(n => 
            n.id > this.lastNotificationId && !n.is_read
          );
          
          if (newNotifications.length > 0) {
            // Update last notification ID
            this.lastNotificationId = Math.max(...notifications.map(n => n.id));
            
            // Notify listeners of new notifications
            newNotifications.forEach(notification => {
              this.notifyListeners(notification);
              
              // Show browser notification if permitted
              if (Notification.permission === 'granted') {
                this.showBrowserNotification(notification);
              }
            });
          }
        } else if (notifications.length > 0) {
          // First time loading, set the last notification ID
          this.lastNotificationId = Math.max(...notifications.map(n => n.id));
        }
      }
    } catch (error) {
      console.error('Error checking for new notifications:', error);
    }
  }

  // Show browser notification
  showBrowserNotification(notification) {
    try {
      const notificationType = this.getNotificationTypeTitle(notification.type);
      
      new Notification(`SCMS - ${notificationType}`, {
        body: notification.message,
        icon: '/favicon.ico',
        badge: '/favicon.ico',
        tag: `notification-${notification.id}`,
        requireInteraction: false,
        silent: false
      });
    } catch (error) {
      console.error('Error showing browser notification:', error);
    }
  }

  // Get notification type title
  getNotificationTypeTitle(type) {
    const typeMap = {
      excuse: 'Excuse Letter',
      attendance: 'Attendance',
      submission: 'Submission',
      grade: 'Grade',
      announcement: 'Announcement',
      classroom: 'Classroom',
      general: 'Notification',
      task: 'Task',
      stream_post: 'Stream Post'
    };
    return typeMap[type] || 'Notification';
  }

  // Add notification listener
  onNotification(callback) {
    this.listeners.add(callback);
    return () => this.listeners.delete(callback); // Return unsubscribe function
  }

  // Remove notification listener
  offNotification(callback) {
    this.listeners.delete(callback);
  }

  // Notify all listeners
  notifyListeners(notification) {
    this.listeners.forEach(callback => {
      try {
        callback(notification);
      } catch (error) {
        console.error('Error in notification listener:', error);
      }
    });
  }

  // Get all notifications
  async getNotifications() {
    try {
      const response = await api.get('/api/notifications');
      if (response.success && response.data) {
        return response.data.notifications || [];
      }
      return [];
    } catch (error) {
      console.error('Error fetching notifications:', error);
      return [];
    }
  }

  // Get recent notifications
  async getRecentNotifications(limit = 10) {
    try {
      const response = await api.get('/api/notifications/recent');
      if (response.success && response.data) {
        return response.data.notifications || [];
      }
      return [];
    } catch (error) {
      console.error('Error fetching recent notifications:', error);
      return [];
    }
  }

  // Get unread count
  async getUnreadCount() {
    try {
      const response = await api.get('/api/notifications/unread-count');
      if (response.success && response.data) {
        return response.data.count || 0;
      }
      return 0;
    } catch (error) {
      console.error('Error fetching unread count:', error);
      return 0;
    }
  }

  // Mark notification as read
  async markAsRead(notificationId) {
    try {
      const response = await api.put(`/api/notifications/${notificationId}/read`);
      return response.success;
    } catch (error) {
      console.error('Error marking notification as read:', error);
      return false;
    }
  }

  // Mark all notifications as read
  async markAllAsRead() {
    try {
      const response = await api.put('/api/notifications/mark-all-read');
      return response.success;
    } catch (error) {
      console.error('Error marking all notifications as read:', error);
      return false;
    }
  }

  // Delete notification
  async deleteNotification(notificationId) {
    try {
      const response = await api.delete(`/api/notifications/${notificationId}`);
      return response.success;
    } catch (error) {
      console.error('Error deleting notification:', error);
      return false;
    }
  }

  // Get notification settings
  async getNotificationSettings() {
    try {
      const response = await api.get('/api/notifications/settings');
      if (response.success && response.data) {
        return response.data.settings || {};
      }
      return {};
    } catch (error) {
      console.error('Error fetching notification settings:', error);
      return {};
    }
  }

  // Update notification settings
  async updateNotificationSettings(settings) {
    try {
      const response = await api.put('/api/notifications/settings', settings);
      return response.success;
    } catch (error) {
      console.error('Error updating notification settings:', error);
      return false;
    }
  }

  // Get urgent notifications
  async getUrgentNotifications() {
    try {
      const response = await api.get('/api/notifications/urgent');
      if (response.success && response.data) {
        return response.data.notifications || [];
      }
      return [];
    } catch (error) {
      console.error('Error fetching urgent notifications:', error);
      return [];
    }
  }

  // Check connection status
  getConnectionStatus() {
    return {
      isConnected: this.isConnected,
      userId: this.userId,
      userRole: this.userRole,
      lastNotificationId: this.lastNotificationId
    };
  }

  // Manual refresh
  async refresh() {
    if (this.isConnected) {
      await this.checkForNewNotifications();
    }
  }
}

// Create singleton instance
const notificationService = new NotificationService();

export default notificationService; 