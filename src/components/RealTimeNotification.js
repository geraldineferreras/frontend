import React, { useState, useEffect, useRef } from 'react';
import { Badge, Dropdown, DropdownToggle, DropdownMenu, DropdownItem, Spinner } from 'reactstrap';
import { Bell, Check, X } from 'react-icons/fa';
import notificationService from '../services/notificationService';

const RealTimeNotification = ({ userId, userRole }) => {
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isOpen, setIsOpen] = useState(false);
  const [isConnected, setIsConnected] = useState(false);
  const [loading, setLoading] = useState(false);
  const audioRef = useRef(null);

  // Initialize notification service
  useEffect(() => {
    if (userId && userRole) {
      // Connect to notification service
      notificationService.connect(userId, userRole);
      
      // Set up notification handler
      const handleNotification = (notification) => {
        console.log('Received real-time notification:', notification);
        
        // Add new notification to the top
        setNotifications(prev => [notification, ...prev]);
        
        // Update unread count
        setUnreadCount(prev => prev + 1);
        
        // Play notification sound
        if (audioRef.current) {
          audioRef.current.play().catch(console.error);
        }
        
        // Show browser notification if permitted
        if (Notification.permission === 'granted') {
          new Notification('SCMS Notification', {
            body: notification.message,
            icon: '/favicon.ico',
            badge: '/favicon.ico'
          });
        }
      };

      notificationService.onNotification(handleNotification);

      // Load existing notifications
      loadNotifications();

      // Request notification permission
      if (Notification.permission === 'default') {
        Notification.requestPermission();
      }

      return () => {
        notificationService.offNotification(handleNotification);
        notificationService.disconnect();
      };
    }
  }, [userId, userRole]);

  // Load existing notifications from API
  const loadNotifications = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/notifications/user/${userId}`);
      if (response.ok) {
        const data = await response.json();
        setNotifications(data);
        setUnreadCount(data.filter(n => !n.is_read).length);
      }
    } catch (error) {
      console.error('Error loading notifications:', error);
    } finally {
      setLoading(false);
    }
  };

  // Mark notification as read
  const markAsRead = async (notificationId) => {
    try {
      await notificationService.markAsRead(notificationId);
      
      // Update local state
      setNotifications(prev => 
        prev.map(n => 
          n.id === notificationId ? { ...n, is_read: true } : n
        )
      );
      
      setUnreadCount(prev => Math.max(0, prev - 1));
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  };

  // Mark all notifications as read
  const markAllAsRead = async () => {
    try {
      await notificationService.markAllAsRead();
      
      // Update local state
      setNotifications(prev => 
        prev.map(n => ({ ...n, is_read: true }))
      );
      
      setUnreadCount(0);
    } catch (error) {
      console.error('Error marking all notifications as read:', error);
    }
  };

  // Get notification icon based on type
  const getNotificationIcon = (type) => {
    switch (type) {
      case 'grade':
        return '📊';
      case 'announcement':
        return '📢';
      case 'assignment':
        return '📝';
      case 'attendance':
        return '✅';
      case 'excuse':
        return '📄';
      default:
        return '🔔';
    }
  };

  // Get notification color based on type
  const getNotificationColor = (type) => {
    switch (type) {
      case 'grade':
        return 'success';
      case 'announcement':
        return 'primary';
      case 'assignment':
        return 'warning';
      case 'attendance':
        return 'info';
      case 'excuse':
        return 'secondary';
      default:
        return 'light';
    }
  };

  // Format timestamp
  const formatTimestamp = (timestamp) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    return date.toLocaleDateString();
  };

  return (
    <>
      {/* Hidden audio element for notification sound */}
      <audio ref={audioRef} preload="auto">
        <source src="/grading-success-female.mp3" type="audio/mpeg" />
      </audio>

      <Dropdown isOpen={isOpen} toggle={() => setIsOpen(!isOpen)}>
        <DropdownToggle
          tag="div"
          className="position-relative"
          style={{ cursor: 'pointer' }}
        >
          <Bell size={20} className="text-white" />
          {unreadCount > 0 && (
            <Badge
              color="danger"
              className="position-absolute"
              style={{
                top: '-8px',
                right: '-8px',
                fontSize: '0.7rem',
                minWidth: '18px',
                height: '18px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}
            >
              {unreadCount > 99 ? '99+' : unreadCount}
            </Badge>
          )}
        </DropdownToggle>

        <DropdownMenu
          right
          className="notification-dropdown"
          style={{
            width: '350px',
            maxHeight: '400px',
            overflowY: 'auto',
            padding: '0'
          }}
        >
          <div className="p-3 border-bottom">
            <div className="d-flex justify-content-between align-items-center">
              <h6 className="mb-0">Notifications</h6>
              {unreadCount > 0 && (
                <button
                  className="btn btn-sm btn-outline-primary"
                  onClick={markAllAsRead}
                >
                  Mark all read
                </button>
              )}
            </div>
          </div>

          <div className="notification-list">
            {loading ? (
              <div className="text-center p-3">
                <Spinner size="sm" />
                <span className="ml-2">Loading...</span>
              </div>
            ) : notifications.length === 0 ? (
              <div className="text-center p-3 text-muted">
                No notifications yet
              </div>
            ) : (
              notifications.map((notification) => (
                <div
                  key={notification.id}
                  className={`notification-item p-3 border-bottom ${
                    !notification.is_read ? 'bg-light' : ''
                  }`}
                  style={{ cursor: 'pointer' }}
                  onClick={() => markAsRead(notification.id)}
                >
                  <div className="d-flex align-items-start">
                    <div className="mr-3" style={{ fontSize: '1.2rem' }}>
                      {getNotificationIcon(notification.type)}
                    </div>
                    <div className="flex-grow-1">
                      <div className="d-flex justify-content-between align-items-start">
                        <p className="mb-1" style={{ fontSize: '0.9rem' }}>
                          {notification.message}
                        </p>
                        {!notification.is_read && (
                          <Badge color="primary" size="sm">
                            New
                          </Badge>
                        )}
                      </div>
                      <div className="d-flex justify-content-between align-items-center">
                        <small className="text-muted">
                          {formatTimestamp(notification.created_at)}
                        </small>
                        <Badge color={getNotificationColor(notification.type)} size="sm">
                          {notification.type}
                        </Badge>
                      </div>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>

          {notifications.length > 0 && (
            <div className="p-2 text-center">
              <small className="text-muted">
                {isConnected ? '🟢 Connected' : '🔴 Disconnected'}
              </small>
            </div>
          )}
        </DropdownMenu>
      </Dropdown>

      <style jsx>{`
        .notification-dropdown {
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
          border: none;
          border-radius: 8px;
        }

        .notification-item:hover {
          background-color: #f8f9fa;
        }

        .notification-item:last-child {
          border-bottom: none !important;
        }

        @media (max-width: 768px) {
          .notification-dropdown {
            width: 300px !important;
            right: 0 !important;
            left: auto !important;
          }
        }
      `}</style>
    </>
  );
};

export default RealTimeNotification; 