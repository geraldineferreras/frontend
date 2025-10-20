import React, { useState, useEffect, useCallback } from 'react';
import { useNotifications } from '../contexts/NotificationContext';
import NotificationModal from './NotificationModal';
import api from '../services/api';
import { getCurrentUserId } from '../utils/userUtils';

const NotificationManager = () => {
  const [notifications, setNotifications] = useState([]);
  const [displayedNotifications, setDisplayedNotifications] = useState([]);
  const { decrementUnreadCount } = useNotifications();

  // Fetch notifications
  const fetchNotifications = useCallback(async () => {
    try {
      const userId = getCurrentUserId();
      if (!userId) return;

      const response = await api.getNotifications(userId);
      if (response.success && response.data && Array.isArray(response.data)) {
        setNotifications(response.data);
      }
    } catch (error) {
      console.error('Error fetching notifications for modal:', error);
    }
  }, []);

  // Check for new notifications
  useEffect(() => {
    fetchNotifications();
    
    // Poll for new notifications every 30 seconds
    const interval = setInterval(fetchNotifications, 30000);
    
    return () => clearInterval(interval);
  }, [fetchNotifications]);

  // Show new notifications as modals
  useEffect(() => {
    const unreadNotifications = notifications.filter(n => !n.is_read);
    const newNotifications = unreadNotifications.filter(n => 
      !displayedNotifications.some(dn => dn.id === n.id)
    );

    if (newNotifications.length > 0) {
      // Show notifications with a delay to stack them properly
      newNotifications.forEach((notification, index) => {
        setTimeout(() => {
          setDisplayedNotifications(prev => [...prev, notification]);
        }, index * 200); // 200ms delay between each notification
      });
    }
  }, [notifications, displayedNotifications]);

  // Handle modal close
  const handleModalClose = useCallback((notificationId) => {
    setDisplayedNotifications(prev => 
      prev.filter(n => n.id !== notificationId)
    );
  }, []);

  // Handle mark as read
  const handleMarkAsRead = useCallback(async (notificationId) => {
    try {
      const response = await api.markNotificationAsRead(notificationId);
      if (response.success) {
        // Update local state
        setNotifications(prev => 
          prev.map(n => n.id === notificationId ? { ...n, is_read: true } : n)
        );
        
        // Update global count
        decrementUnreadCount();
        
        console.log('✅ Notification marked as read via modal');
      }
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  }, [decrementUnreadCount]);

  return (
    <div
      className="notification-manager"
      style={{
        position: 'fixed',
        top: '90px', // Position below navbar
        right: '20px',
        zIndex: 1000,
        maxHeight: 'calc(100vh - 120px)',
        overflowY: 'auto',
        display: 'flex',
        flexDirection: 'column',
        gap: '12px'
      }}
    >
      {displayedNotifications.map((notification) => (
        <NotificationModal
          key={notification.id}
          notification={notification}
          onClose={() => handleModalClose(notification.id)}
          onMarkAsRead={handleMarkAsRead}
        />
      ))}
    </div>
  );
};

export default NotificationManager;
