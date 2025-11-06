import React, { useEffect, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import api from "../../services/api";
import { getCurrentUserId } from "../../utils/userUtils";
import { timeAgo } from "../../utils/timeUtils";
import { useNotifications } from "../../contexts/NotificationContext";

// Notification type mapping
const typeMap = {
  announcement: { icon: "📢", color: "#1976d2", title: "Announcement" },
  grade: { icon: "✅", color: "#43a047", title: "New Grade Posted" },
  assignment: { icon: "📝", color: "#ffc107", title: "Assignment" },
  general: { icon: "❗", color: "#888", title: "Notification" },
  task: { icon: "📋", color: "#795548", title: "Task Update" },
  stream_post: { icon: "💬", color: "#00bcd4", title: "New Stream Post" },
  excuse: { icon: "📄", color: "#e91e63", title: "Excuse Letter Update" },
  attendance: { icon: "✅", color: "#4caf50", title: "Attendance Update" },
};


function NotificationCard({ notification, onMarkRead, onClick, isActive, isUnread }) {
  const { type, message, created_at } = notification;
  const meta = typeMap[type] || typeMap.general;
  return (
    <div
      style={{
        background: (isUnread || isActive) ? "#e3f0ff" : "#fff",
        border: `1.5px solid ${meta.color}22`,
        borderRadius: 12,
        boxShadow: (isUnread || isActive) ? `0 2px 8px ${meta.color}22` : "none",
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
        <div style={{ fontWeight: (isUnread || isActive) ? 700 : 600, fontSize: 16, color: meta.color, marginBottom: 2 }}>
          {meta.title}
        </div>
        <div style={{ fontWeight: (isUnread || isActive) ? 600 : 400, fontSize: 15, color: (isUnread || isActive) ? "#222" : "#444" }}>{message}</div>
        <div style={{ fontSize: 13, color: "#888", marginTop: 4 }}>{timeAgo(created_at)}</div>
        {/* Internal debug/status line removed for clean UI */}
      </div>
      {/* Always show button - temporary fix for deployed version */}
      <button
        onClick={e => { 
          console.log('🔘 [StudentNotifications] Mark as read button clicked for notification:', notification.id);
          e.stopPropagation(); 
          e.preventDefault();
          onMarkRead(notification.id); 
        }}
        style={{ 
          background: isUnread ? meta.color : "#666", 
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
        {isUnread ? 'Mark as read' : 'Marked'}
      </button>
    </div>
  );
}

// Real API calls for student notifications using new API methods
const fetchNotifications = async () => {
  try {
    const userId = getCurrentUserId();
    if (!userId) {
      return [];
    }
    
    const response = await api.getNotifications(userId);
    if (response.success && response.data) {
      // The new backend returns data directly as an array, not wrapped in notifications
      return Array.isArray(response.data) ? response.data : [];
    }
    return [];
  } catch (error) {
    console.error('Error fetching student notifications:', error);
    return [];
  }
};

const markAsRead = async (notificationId) => {
  try {
    console.log('📡 [StudentNotifications] API call - markNotificationAsRead:', notificationId);
    const response = await api.markNotificationAsRead(notificationId);
    console.log('📡 [StudentNotifications] API response:', response);
    return response.success || false;
  } catch (error) {
    console.error('❌ [StudentNotifications] Error marking notification as read:', error);
    return false;
  }
};

const markAllAsRead = async () => {
  try {
    const userId = getCurrentUserId();
    if (!userId) {
      console.warn('⚠️ [StudentNotifications] No user ID found for markAllAsRead');
      return false;
    }
    
    console.log('📡 [StudentNotifications] API call - markAllNotificationsAsRead:', userId);
    const response = await api.markAllNotificationsAsRead(userId);
    console.log('📡 [StudentNotifications] API response:', response);
    return response.success || false;
  } catch (error) {
    console.error('❌ [StudentNotifications] Error marking all notifications as read:', error);
    return false;
  }
};

const StudentNotifications = () => {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);
  const { decrementUnreadCount, resetUnreadCount } = useNotifications();
  const [activeId, setActiveId] = useState(null);
  const navigate = useNavigate();

  const loadNotifications = useCallback(async () => {
    try {
      setRefreshing(true);
      setError(null);
      const data = await fetchNotifications();
      
      // Sort: unread first, then by creation date (newest first)
      data.sort((a, b) => {
        if (a.is_read !== b.is_read) {
          return a.is_read ? 1 : -1;
        }
        return new Date(b.created_at) - new Date(a.created_at);
      });
      
      setNotifications(data);
    } catch (error) {
      console.error('Failed to load notifications:', error);
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

  // Removed auto-mark-as-read on open to preserve unread highlight

  const handleMarkRead = async (id) => {
    try {
      console.log('🔄 [StudentNotifications] Marking notification as read:', id);
      const success = await markAsRead(id);
      console.log('📊 [StudentNotifications] Mark as read result:', success);
      
      if (success) {
        setNotifications(notifications => 
          notifications.map(n => n.id === id ? { ...n, is_read: true } : n)
        );
        // Update the global notification count
        decrementUnreadCount();
        console.log('✅ [StudentNotifications] Notification marked as read successfully');
      } else {
        console.warn('⚠️ [StudentNotifications] Failed to mark notification as read - API returned false');
      }
    } catch (error) {
      console.error('❌ [StudentNotifications] Failed to mark notification as read:', error);
    }
  };

  const resolveLink = (n) => {
    return n.link || n.url || n.target_url || null;
  };

  const handleOpen = async (n) => {
    try {
      setActiveId(n.id);
      const link = resolveLink(n);
      if (!n.is_read) {
        await markAsRead(n.id);
        setNotifications(list => list.map(x => x.id === n.id ? { ...x, is_read: true } : x));
        decrementUnreadCount();
      }
      if (link) {
        if (link.startsWith('http')) {
          window.location.href = link;
        } else {
          navigate(link);
        }
      }
      // Keep highlight briefly even after marking as read
      setTimeout(() => setActiveId(null), 3000);
    } catch (e) {
      console.error('Failed to open notification', e);
    }
  };

  const handleMarkAllRead = async () => {
    try {
      console.log('🔄 [StudentNotifications] Marking all notifications as read');
      const success = await markAllAsRead();
      console.log('📊 [StudentNotifications] Mark all as read result:', success);
      
      if (success) {
        setNotifications(notifications => 
          notifications.map(n => ({ ...n, is_read: true }))
        );
        // Reset the global notification count to 0
        resetUnreadCount();
        console.log('✅ [StudentNotifications] All notifications marked as read successfully');
      } else {
        console.warn('⚠️ [StudentNotifications] Failed to mark all notifications as read - API returned false');
      }
    } catch (error) {
      console.error('❌ [StudentNotifications] Failed to mark all notifications as read:', error);
    }
  };

  const isReadNormalized = (n) => {
    const v = n.is_read;
    if (v === true) return true;
    if (v === false) return false;
    if (v === 1 || v === '1' || v === 'true') return true;
    if (v === 0 || v === '0' || v === 'false' || v == null) return false;
    return !!v;
  };

  const unreadCount = notifications.filter(n => !isReadNormalized(n)).length;

  return (
    <div style={{ maxWidth: 700, margin: '0 auto', padding: 24 }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 18, flexWrap: 'wrap', gap: 12 }}>
        <div>
          <div style={{ fontWeight: 700, fontSize: 22, display: 'flex', alignItems: 'center', gap: 8 }}>
            <span role="img" aria-label="bell">🔔</span> Notifications
            {unreadCount > 0 && <span style={{ background: '#f44336', color: '#fff', borderRadius: 12, fontSize: 13, fontWeight: 700, padding: '2px 10px', marginLeft: 8 }}>{unreadCount}</span>}
          </div>
          <div style={{ color: '#666', fontSize: 14, marginTop: 2 }}>Stay updated on new announcements, grades, and class updates.</div>
        </div>
        <button
          onClick={(e) => {
            console.log('🔘 [StudentNotifications] Mark all as read button clicked');
            console.log('🔘 [StudentNotifications] Unread count:', unreadCount);
            console.log('🔘 [StudentNotifications] Refreshing state:', refreshing);
            e.preventDefault();
            e.stopPropagation();
            
            // Add a small delay to ensure the click is registered
            setTimeout(() => {
              handleMarkAllRead();
            }, 10);
          }}
          onMouseDown={e => console.log('🔘 [StudentNotifications] Mark all button mousedown')}
          onMouseUp={e => console.log('🔘 [StudentNotifications] Mark all button mouseup')}
          disabled={false}
          style={{ 
            background: unreadCount === 0 || refreshing ? '#bbb' : '#1976d2', 
            color: '#fff', 
            border: 'none', 
            borderRadius: 8, 
            padding: '8px 18px', 
            fontWeight: 700, 
            fontSize: 14, 
            cursor: unreadCount === 0 || refreshing ? 'not-allowed' : 'pointer', 
            transition: 'background 0.2s',
            position: 'relative',
            zIndex: 10,
            minWidth: '120px',
            minHeight: '36px',
            boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
          }}
        >
          {refreshing ? 'Updating...' : 'Mark all as read'}
        </button>
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
        ) : notifications.length === 0 ? (
          <div style={{ color: '#888', textAlign: 'center', marginTop: 40 }}>
            <div style={{ fontSize: 24, marginBottom: 8 }}>🔔</div>
            No notifications yet.
          </div>
          ) : (
          notifications.map(n => (
            <NotificationCard
              key={n.id}
              notification={n}
              onMarkRead={handleMarkRead}
              onClick={() => handleOpen(n)}
              isActive={activeId === n.id}
              isUnread={!isReadNormalized(n)}
            />
          ))
        )}
      </div>
      <style>{`
        @media (max-width: 600px) {
          .notification-card { flex-direction: column !important; gap: 8px !important; }
        }
      `}</style>
    </div>
  );
};

export default StudentNotifications; 