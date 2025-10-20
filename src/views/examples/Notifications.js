import React, { useEffect, useState, useCallback } from "react";
import api from "../../services/api";
import { getCurrentUserId } from "../../utils/userUtils";
import { timeAgo } from "../../utils/timeUtils";
import { useNotifications } from "../../contexts/NotificationContext";

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


function NotificationCard({ notification, onMarkRead, onClick }) {
  const { type, message, is_read, created_at } = notification;
  const meta = typeMap[type] || typeMap.general;
  
  return (
    <div
      style={{
        background: is_read ? "#fff" : "#e3f0ff",
        border: `1.5px solid ${meta.color}22`,
        borderRadius: 12,
        boxShadow: is_read ? "none" : `0 2px 8px ${meta.color}22`,
        padding: 18,
        marginBottom: 16,
        display: "flex",
        alignItems: "flex-start",
        gap: 16,
        cursor: onClick ? "pointer" : "default",
        transition: "background 0.2s"
      }}
      onClick={onClick}
    >
      <div style={{ fontSize: 28, color: meta.color, flexShrink: 0 }}>{meta.icon}</div>
      <div style={{ flex: 1 }}>
        <div style={{ fontWeight: is_read ? 600 : 700, fontSize: 16, color: meta.color, marginBottom: 2 }}>
          {meta.title}
        </div>
        <div style={{ fontWeight: is_read ? 400 : 600, fontSize: 15, color: is_read ? "#444" : "#222" }}>{message}</div>
        <div style={{ fontSize: 13, color: "#888", marginTop: 4 }}>{timeAgo(created_at)}</div>
        <div style={{ fontSize: 11, color: "#999", marginTop: 2 }}>
          Status: {is_read ? 'READ' : 'UNREAD'} | ID: {notification.id} | Type: {typeof is_read}
        </div>
      </div>
      {/* Always show button - temporary fix for deployed version */}
      <button
        onClick={e => { 
          console.log('🔘 [Notifications] Mark as read button clicked for notification:', notification.id);
          e.stopPropagation(); 
          e.preventDefault();
          onMarkRead(notification.id); 
        }}
        onMouseDown={e => console.log('🔘 [Notifications] Button mousedown event')}
        onMouseUp={e => console.log('🔘 [Notifications] Button mouseup event')}
        style={{ 
          background: is_read ? "#666" : meta.color, 
          color: "#fff", 
          border: "none", 
          borderRadius: 8, 
          padding: "6px 12px", 
          fontWeight: 600, 
          fontSize: 13, 
          cursor: "pointer", 
          marginLeft: 8,
          position: "relative",
          zIndex: 10,
          minWidth: "90px",
          minHeight: "36px",
          boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
          transition: 'all 0.2s ease'
        }}
      >
        {is_read ? 'Mark Again' : 'Mark as read'}
      </button>
    </div>
  );
}

// Real API calls for notifications using the new API methods
const fetchNotifications = async () => {
  try {
    const userId = getCurrentUserId();
    console.log('🔍 [Notifications] getCurrentUserId returned:', userId);
    
    if (!userId) {
      console.log('❌ [Notifications] No user ID found, returning empty array');
      return [];
    }
    
    console.log('📡 [Notifications] Making API call to getNotifications with userId:', userId);
    const response = await api.getNotifications(userId);
    console.log('📡 [Notifications] API response:', response);
    
    if (response.success && response.data) {
      // The new backend returns data directly as an array, not wrapped in notifications
      const notifications = Array.isArray(response.data) ? response.data : [];
      console.log('✅ [Notifications] Successfully fetched notifications:', notifications.length, 'notifications');
      return notifications;
    }
    console.log('❌ [Notifications] API call failed or returned no data');
    return [];
  } catch (error) {
    console.error('❌ [Notifications] Error fetching notifications:', error);
    return [];
  }
};

const markAsRead = async (notificationId) => {
  try {
    console.log('📡 [Notifications] API call - markNotificationAsRead:', notificationId);
    const response = await api.markNotificationAsRead(notificationId);
    console.log('📡 [Notifications] API response:', response);
    return response.success || false;
  } catch (error) {
    console.error('❌ [Notifications] Error marking notification as read:', error);
    return false;
  }
};

const markAllAsRead = async () => {
  try {
    const userId = getCurrentUserId();
    if (!userId) {
      console.warn('⚠️ [Notifications] No user ID found for markAllAsRead');
      return false;
    }
    
    console.log('📡 [Notifications] API call - markAllNotificationsAsRead:', userId);
    const response = await api.markAllNotificationsAsRead(userId);
    console.log('📡 [Notifications] API response:', response);
    return response.success || false;
  } catch (error) {
    console.error('❌ [Notifications] Error marking all notifications as read:', error);
    return false;
  }
};

const deleteNotification = async (notificationId) => {
  try {
    await api.delete(`/api/notifications/${notificationId}`);
    return true;
  } catch (error) {
    console.error('Error deleting notification:', error);
    return false;
  }
};

const Notifications = () => {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);
  const [filter, setFilter] = useState('all'); // all, unread, read
  const { decrementUnreadCount, resetUnreadCount } = useNotifications();

  const loadNotifications = useCallback(async () => {
    try {
      console.log('🔄 [Notifications] loadNotifications called');
      setRefreshing(true);
      setError(null);
      const data = await fetchNotifications();
      console.log('📊 [Notifications] fetchNotifications returned:', data);
      
      // Sort: unread first, then by creation date (newest first)
      data.sort((a, b) => {
        if (a.is_read !== b.is_read) {
          return a.is_read ? 1 : -1;
        }
        return new Date(b.created_at) - new Date(a.created_at);
      });
      
      console.log('📊 [Notifications] Setting notifications state with:', data.length, 'notifications');
      setNotifications(data);
    } catch (error) {
      console.error('❌ [Notifications] Failed to load notifications:', error);
      setError('Failed to load notifications. Please try again.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    loadNotifications();
    const interval = setInterval(loadNotifications, 60000); // auto-refresh every 60s
    return () => clearInterval(interval);
  }, [loadNotifications]);

  const handleMarkRead = async (id) => {
    try {
      console.log('🔄 [Notifications] Marking notification as read:', id);
      const success = await markAsRead(id);
      console.log('📊 [Notifications] Mark as read result:', success);
      
      if (success) {
        setNotifications(notifications => 
          notifications.map(n => n.id === id ? { ...n, is_read: true } : n)
        );
        // Update the global notification count
        decrementUnreadCount();
        console.log('✅ [Notifications] Notification marked as read successfully');
      } else {
        console.warn('⚠️ [Notifications] Failed to mark notification as read - API returned false');
      }
    } catch (error) {
      console.error('❌ [Notifications] Failed to mark notification as read:', error);
    }
  };

  const handleMarkAllRead = async () => {
    try {
      console.log('🔄 [Notifications] Marking all notifications as read');
      const success = await markAllAsRead();
      console.log('📊 [Notifications] Mark all as read result:', success);
      
      if (success) {
        setNotifications(notifications => 
          notifications.map(n => ({ ...n, is_read: true }))
        );
        // Reset the global notification count to 0
        resetUnreadCount();
        console.log('✅ [Notifications] All notifications marked as read successfully');
      } else {
        console.warn('⚠️ [Notifications] Failed to mark all notifications as read - API returned false');
      }
    } catch (error) {
      console.error('❌ [Notifications] Failed to mark all notifications as read:', error);
    }
  };

  const handleDelete = async (id) => {
    try {
      const success = await deleteNotification(id);
      if (success) {
        setNotifications(notifications => 
          notifications.filter(n => n.id !== id)
        );
      }
    } catch (error) {
      console.error('Failed to delete notification:', error);
    }
  };

  const filteredNotifications = notifications.filter(n => {
    if (filter === 'unread') return !n.is_read;
    if (filter === 'read') return n.is_read;
    return true;
  });

  const unreadCount = notifications.filter(n => !n.is_read).length;

  return (
    <div style={{ maxWidth: 800, margin: '0 auto', padding: 24 }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24, flexWrap: 'wrap', gap: 16 }}>
        <div>
          <div style={{ fontWeight: 700, fontSize: 24, display: 'flex', alignItems: 'center', gap: 8 }}>
            <span role="img" aria-label="bell">🔔</span> Notifications
            {unreadCount > 0 && <span style={{ background: '#f44336', color: '#fff', borderRadius: 12, fontSize: 14, fontWeight: 700, padding: '2px 12px', marginLeft: 8 }}>{unreadCount}</span>}
          </div>
          <div style={{ color: '#666', fontSize: 14, marginTop: 4 }}>Manage all your system notifications</div>
        </div>
        <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            style={{ 
              padding: '8px 12px', 
              borderRadius: 8, 
              border: '1px solid #ddd', 
              background: '#fff',
              fontSize: 14
            }}
          >
            <option value="all">All ({notifications.length})</option>
            <option value="unread">Unread ({unreadCount})</option>
            <option value="read">Read ({notifications.length - unreadCount})</option>
          </select>
          <button
            onClick={(e) => {
              console.log('🔘 [Notifications] Mark all as read button clicked');
              console.log('🔘 [Notifications] Unread count:', unreadCount);
              console.log('🔘 [Notifications] Refreshing:', refreshing);
              e.preventDefault();
              e.stopPropagation();
              handleMarkAllRead();
            }}
            onMouseDown={e => console.log('🔘 [Notifications] Mark all button mousedown')}
            onMouseUp={e => console.log('🔘 [Notifications] Mark all button mouseup')}
            disabled={false}
            style={{ 
              background: unreadCount === 0 || refreshing ? '#bbb' : '#1976d2', 
              color: '#fff', 
              border: 'none', 
              borderRadius: 8, 
              padding: '8px 18px', 
              fontWeight: 600, 
              fontSize: 14, 
              cursor: unreadCount === 0 || refreshing ? 'not-allowed' : 'pointer', 
              transition: 'background 0.2s',
              position: 'relative',
              zIndex: 10,
              minWidth: '120px',
              minHeight: '36px'
            }}
          >
            {refreshing ? 'Updating...' : 'Mark all as read'}
          </button>
        </div>
      </div>
      
      {/* Error Message */}
      {error && (
        <div style={{ 
          background: '#ffebee', 
          color: '#c62828', 
          padding: '12px 16px', 
          borderRadius: 8, 
          marginBottom: 16,
          border: '1px solid #ffcdd2'
        }}>
          {error}
          <button 
            onClick={loadNotifications}
            style={{ 
              background: 'none', 
              border: 'none', 
              color: '#c62828', 
              textDecoration: 'underline', 
              cursor: 'pointer', 
              marginLeft: 8 
            }}
          >
            Retry
          </button>
        </div>
      )}
      
      {/* Notification Feed */}
      <div style={{ marginTop: 8 }}>
        {loading ? (
          <div style={{ color: '#888', textAlign: 'center', marginTop: 40 }}>
            <div style={{ fontSize: 24, marginBottom: 8 }}>⏳</div>
            Loading notifications...
          </div>
        ) : filteredNotifications.length === 0 ? (
          <div style={{ color: '#888', textAlign: 'center', marginTop: 40 }}>
            <div style={{ fontSize: 24, marginBottom: 8 }}>🔔</div>
            {filter === 'all' ? 'No notifications yet.' : `No ${filter} notifications.`}
          </div>
        ) : (
          filteredNotifications.map(n => (
            <NotificationCard
              key={n.id}
              notification={n}
              onMarkRead={handleMarkRead}
              onClick={() => { /* Optionally navigate to detail */ }}
            />
          ))
        )}
      </div>
      
      {/* Delete All Button for Read Notifications */}
      {filter === 'read' && notifications.filter(n => n.is_read).length > 0 && (
        <div style={{ marginTop: 24, textAlign: 'center' }}>
          <button
            onClick={() => {
              if (window.confirm('Are you sure you want to delete all read notifications? This action cannot be undone.')) {
                notifications.filter(n => n.is_read).forEach(n => handleDelete(n.id));
              }
            }}
            style={{ 
              background: '#f44336', 
              color: '#fff', 
              border: 'none', 
              borderRadius: 8, 
              padding: '10px 20px', 
              fontWeight: 600, 
              fontSize: 14, 
              cursor: 'pointer',
              transition: 'background 0.2s'
            }}
          >
            Delete All Read Notifications
          </button>
        </div>
      )}
      
      <style>{`
        @media (max-width: 600px) {
          .notification-card { flex-direction: column !important; gap: 8px !important; }
        }
      `}</style>
    </div>
  );
};

export default Notifications; 