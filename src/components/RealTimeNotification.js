import React, { useEffect, useState, useCallback } from "react";
import api from "../services/api";
import { getCurrentUserId } from "../utils/userUtils";
import { timeAgo } from "../utils/timeUtils";

// Notification type mapping
const typeMap = {
  excuse: { icon: "📄", color: "#e91e63", title: "Excuse Letter" },
  attendance: { icon: "✅", color: "#4caf50", title: "Attendance" },
  submission: { icon: "📝", color: "#ff9800", title: "Submission" },
  grade: { icon: "📊", color: "#2196f3", title: "Grade" },
  announcement: { icon: "📢", color: "#9c27b0", title: "Announcement" },
  classroom: { icon: "🏫", color: "#607d8b", title: "Classroom" },
  general: { icon: "❗", color: "#888", title: "General" },
  task: { icon: "📋", color: "#795548", title: "Task" },
  stream_post: { icon: "💬", color: "#00bcd4", title: "Stream Post" },
};


const RealTimeNotification = ({ onNotificationClick, showUnreadCount = true, maxNotifications = 5 }) => {
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isOpen, setIsOpen] = useState(false);

  // Fetch notifications from API using new methods
  const fetchNotifications = useCallback(async () => {
    try {
      const userId = getCurrentUserId();
      if (!userId) {
        setLoading(false);
        return;
      }
      
      const response = await api.getRecentNotifications(userId, 5);
      if (response.success && response.data) {
        // The new backend returns data directly as an array
        const recentNotifications = Array.isArray(response.data) ? response.data : [];
        setNotifications(recentNotifications);
        
        // Get unread count
        const unreadResponse = await api.getUnreadNotificationCount(userId);
        if (unreadResponse.success && unreadResponse.data) {
          setUnreadCount(unreadResponse.data.count || 0);
        }
      }
    } catch (error) {
      console.error('Error fetching notifications:', error);
      setError('Failed to load notifications');
    } finally {
      setLoading(false);
    }
  }, []);

  // Mark notification as read
  const markAsRead = async (notificationId) => {
    try {
      const response = await api.markNotificationAsRead(notificationId);
      if (response.success) {
        setNotifications(prev => 
          prev.map(n => n.id === notificationId ? { ...n, is_read: true } : n)
        );
        setUnreadCount(prev => Math.max(0, prev - 1));
      }
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  };

  // Mark all notifications as read
  const markAllAsRead = async () => {
    try {
      const userId = getCurrentUserId();
      if (!userId) return;
      
      const response = await api.markAllNotificationsAsRead(userId);
      if (response.success) {
        setNotifications(prev => prev.map(n => ({ ...n, is_read: true })));
        setUnreadCount(0);
      }
    } catch (error) {
      console.error('Error marking all notifications as read:', error);
    }
  };

  // Load notifications on mount and set up polling
  useEffect(() => {
    fetchNotifications();
    
    // Poll for new notifications every 30 seconds
    const interval = setInterval(fetchNotifications, 30000);
    
    return () => clearInterval(interval);
  }, [fetchNotifications]);

  // Handle notification click
  const handleNotificationClick = (notification) => {
    if (!notification.is_read) {
      markAsRead(notification.id);
    }
    if (onNotificationClick) {
      onNotificationClick(notification);
    }
    setIsOpen(false);
  };

  const displayNotifications = notifications.slice(0, maxNotifications);

  return (
    <div style={{ position: 'relative' }}>
      {/* Notification Bell */}
      <div 
        style={{ 
          position: 'relative', 
          cursor: 'pointer',
          padding: '8px',
          borderRadius: '50%',
          transition: 'background-color 0.2s'
        }}
        onClick={() => setIsOpen(!isOpen)}
        onMouseEnter={(e) => e.target.style.backgroundColor = '#f5f5f5'}
        onMouseLeave={(e) => e.target.style.backgroundColor = 'transparent'}
      >
        <span role="img" aria-label="notifications" style={{ fontSize: '20px' }}>
          🔔
        </span>
        
        {/* Unread Badge */}
        {showUnreadCount && unreadCount > 0 && (
          <span style={{
            position: 'absolute',
            top: '0',
            right: '0',
            background: '#f44336',
            color: 'white',
            borderRadius: '50%',
            width: '18px',
            height: '18px',
            fontSize: '11px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontWeight: 'bold'
          }}>
            {unreadCount > 99 ? '99+' : unreadCount}
          </span>
        )}
      </div>

      {/* Notification Dropdown */}
      {isOpen && (
        <div style={{
          position: 'absolute',
          top: '100%',
          right: '0',
          width: '400px',
          maxHeight: '500px',
          background: 'white',
          border: '1px solid #ddd',
          borderRadius: '8px',
          boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
          zIndex: 1000,
          overflow: 'hidden'
        }}>
          {/* Header */}
          <div style={{
            padding: '16px',
            borderBottom: '1px solid #eee',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center'
          }}>
            <span style={{ fontWeight: 'bold', fontSize: '16px' }}>Notifications</span>
            {unreadCount > 0 && (
              <button
                onClick={markAllAsRead}
                style={{
                  background: '#1976d2',
                  color: 'white',
                  border: 'none',
                  borderRadius: '4px',
                  padding: '4px 8px',
                  fontSize: '12px',
                  cursor: 'pointer'
                }}
              >
                Mark all read
              </button>
            )}
          </div>

          {/* Notifications List */}
          <div style={{ maxHeight: '400px', overflowY: 'auto' }}>
            {loading ? (
              <div style={{ padding: '20px', textAlign: 'center', color: '#666' }}>
                Loading...
              </div>
            ) : error ? (
              <div style={{ padding: '20px', textAlign: 'center', color: '#f44336' }}>
                {error}
                <button 
                  onClick={fetchNotifications}
                  style={{ 
                    background: 'none', 
                    border: 'none', 
                    color: '#f44336', 
                    textDecoration: 'underline', 
                    cursor: 'pointer', 
                    marginLeft: '8px' 
                  }}
                >
                  Retry
                </button>
              </div>
            ) : displayNotifications.length === 0 ? (
              <div style={{ padding: '20px', textAlign: 'center', color: '#666' }}>
                No notifications
              </div>
            ) : (
              displayNotifications.map(notification => {
                const meta = typeMap[notification.type] || typeMap.general;
                return (
                  <div
                    key={notification.id}
                    onClick={() => handleNotificationClick(notification)}
                    style={{
                      padding: '12px 16px',
                      borderBottom: '1px solid #eee',
                      cursor: 'pointer',
                      background: notification.is_read ? 'white' : '#f8f9fa',
                      transition: 'background-color 0.2s'
                    }}
                    onMouseEnter={(e) => e.target.style.backgroundColor = '#f5f5f5'}
                    onMouseLeave={(e) => e.target.style.backgroundColor = notification.is_read ? 'white' : '#f8f9fa'}
                  >
                    <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px' }}>
                      <span style={{ fontSize: '20px', color: meta.color }}>{meta.icon}</span>
                      <div style={{ flex: 1 }}>
                        <div style={{ 
                          fontWeight: notification.is_read ? 'normal' : 'bold',
                          fontSize: '14px',
                          color: meta.color,
                          marginBottom: '4px'
                        }}>
                          {meta.title}
                        </div>
                        <div style={{ 
                          fontSize: '13px',
                          color: '#333',
                          marginBottom: '4px',
                          lineHeight: '1.4'
                        }}>
                          {notification.message}
                        </div>
                        <div style={{ fontSize: '11px', color: '#666' }}>
                          {timeAgo(notification.created_at)}
                        </div>
                      </div>
                      {!notification.is_read && (
                        <div style={{
                          width: '8px',
                          height: '8px',
                          background: '#1976d2',
                          borderRadius: '50%',
                          flexShrink: 0
                        }} />
                      )}
                    </div>
                  </div>
                );
              })
            )}
          </div>

          {/* Footer */}
          {displayNotifications.length > 0 && (
            <div style={{
              padding: '12px 16px',
              borderTop: '1px solid #eee',
              textAlign: 'center'
            }}>
              <button
                onClick={() => {
                  // Navigate to full notifications page
                  window.location.href = '/notifications';
                }}
                style={{
                  background: 'none',
                  border: 'none',
                  color: '#1976d2',
                  cursor: 'pointer',
                  fontSize: '13px',
                  textDecoration: 'underline'
                }}
              >
                View all notifications
              </button>
            </div>
          )}
        </div>
      )}

      {/* Click outside to close */}
      {isOpen && (
        <div
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            zIndex: 999
          }}
          onClick={() => setIsOpen(false)}
        />
      )}
    </div>
  );
};

export default RealTimeNotification; 