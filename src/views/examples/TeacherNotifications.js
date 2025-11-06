import React, { useEffect, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import api from "../../services/api";
import { getCurrentUserId } from "../../utils/userUtils";
import { timeAgo } from "../../utils/timeUtils";
import { useNotifications } from "../../contexts/NotificationContext";

// Notification type mapping for teachers
const typeMap = {
  excuse: { icon: "📄", color: "#e91e63", title: "New Excuse Letter" },
  attendance: { icon: "✅", color: "#4caf50", title: "Attendance Alert" },
  submission: { icon: "📝", color: "#ff9800", title: "New Submission" },
  grade: { icon: "📊", color: "#2196f3", title: "Grade Posted" },
  announcement: { icon: "📢", color: "#9c27b0", title: "Announcement" },
  classroom: { icon: "🏫", color: "#607d8b", title: "Classroom Update" },
  general: { icon: "❗", color: "#888", title: "Notification" },
  task: { icon: "📋", color: "#795548", title: "Task Update" },
  stream_post: { icon: "💬", color: "#00bcd4", title: "New Stream Post" },
};


function NotificationCard({ notification, onMarkRead, onClick, isActive }) {
  const { type, message, is_read, created_at, id } = notification;
  const meta = typeMap[type] || typeMap.general;
  
  // Debug logging to see what data we're getting
  console.log('🔍 [TeacherNotifications] NotificationCard rendering:', {
    id,
    is_read,
    type,
    message: message?.substring(0, 50) + '...'
  });
  
  return (
    <div
      style={{
        background: (!is_read || isActive) ? "#e3f0ff" : "#fff",
        border: `1.5px solid ${meta.color}22`,
        borderRadius: 12,
        boxShadow: (!is_read || isActive) ? `0 2px 8px ${meta.color}22` : "none",
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
        <div style={{ fontWeight: (!is_read || isActive) ? 700 : 600, fontSize: 16, color: meta.color, marginBottom: 2 }}>
          {meta.title}
        </div>
        <div style={{ fontWeight: (!is_read || isActive) ? 600 : 400, fontSize: 15, color: (!is_read || isActive) ? "#222" : "#444" }}>{message}</div>
        <div style={{ fontSize: 13, color: "#888", marginTop: 4 }}>{timeAgo(created_at)}</div>
        {/* Internal debug/status line removed for clean UI */}
      </div>
      {/* Always show button - temporary fix for deployed version */}
      <button
        onClick={e => { 
          console.log('🔘 [TeacherNotifications] Mark as read button clicked for notification:', notification.id);
          e.stopPropagation(); 
          e.preventDefault();
          onMarkRead(notification.id); 
        }}
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

// Real API calls for teacher notifications using new API methods
const fetchTeacherNotifications = async () => {
  try {
    const userId = getCurrentUserId();
    console.log('🔍 [TeacherNotifications] getCurrentUserId returned:', userId);
    
    if (!userId) {
      console.log('❌ [TeacherNotifications] No user ID found, returning empty array');
      return [];
    }
    
    console.log('📡 [TeacherNotifications] Making API call to getNotifications with userId:', userId);
    const response = await api.getNotifications(userId);
    console.log('📡 [TeacherNotifications] API response:', response);
    
    if (response.success && response.data) {
      // The new backend returns data directly as an array, not wrapped in notifications
      const notifications = Array.isArray(response.data) ? response.data : [];
      console.log('✅ [TeacherNotifications] Successfully fetched notifications:', notifications.length, 'notifications');
      return notifications;
    }
    console.log('❌ [TeacherNotifications] API call failed or returned no data');
    return [];
  } catch (error) {
    console.error('❌ [TeacherNotifications] Error fetching teacher notifications:', error);
    return [];
  }
};

const markAsRead = async (notificationId) => {
  try {
    console.log('📡 [TeacherNotifications] API call - markNotificationAsRead:', notificationId);
    const response = await api.markNotificationAsRead(notificationId);
    console.log('📡 [TeacherNotifications] API response:', response);
    return response.success || false;
  } catch (error) {
    console.error('❌ [TeacherNotifications] Error marking notification as read:', error);
    return false;
  }
};

const markAllAsRead = async () => {
  try {
    const userId = getCurrentUserId();
    if (!userId) {
      console.warn('⚠️ [TeacherNotifications] No user ID found for markAllAsRead');
      return false;
    }
    
    console.log('📡 [TeacherNotifications] API call - markAllNotificationsAsRead:', userId);
    const response = await api.markAllNotificationsAsRead(userId);
    console.log('📡 [TeacherNotifications] API response:', response);
    return response.success || false;
  } catch (error) {
    console.error('❌ [TeacherNotifications] Error marking all notifications as read:', error);
    return false;
  }
};

const TeacherNotifications = () => {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);
  const { decrementUnreadCount, resetUnreadCount } = useNotifications();
  const [activeId, setActiveId] = useState(null);
  const navigate = useNavigate();

  const loadNotifications = useCallback(async () => {
    try {
      console.log('🔄 [TeacherNotifications] loadNotifications called');
      setRefreshing(true);
      setError(null);
      const data = await fetchTeacherNotifications();
      console.log('📊 [TeacherNotifications] fetchTeacherNotifications returned:', data);
      console.log('📊 [TeacherNotifications] Data length:', data.length);
      
      // Debug each notification's is_read status
      data.forEach((notification, index) => {
        console.log(`🔍 [TeacherNotifications] Notification ${index}:`, {
          id: notification.id,
          is_read: notification.is_read,
          type: typeof notification.is_read,
          message: notification.message?.substring(0, 30) + '...'
        });
      });
      
      // Sort: unread first, then by creation date (newest first)
      data.sort((a, b) => {
        if (a.is_read !== b.is_read) {
          return a.is_read ? 1 : -1;
        }
        return new Date(b.created_at) - new Date(a.created_at);
      });
      
      // Calculate and log unread count
      const unreadCount = data.filter(n => !n.is_read).length;
      console.log('🔍 [TeacherNotifications] Total notifications:', data.length);
      console.log('🔍 [TeacherNotifications] Unread notifications:', unreadCount);
      
      console.log('📊 [TeacherNotifications] Setting notifications state with:', data.length, 'notifications');
      setNotifications(data);
    } catch (error) {
      console.error('❌ [TeacherNotifications] Failed to load notifications:', error);
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

  // Mark all notifications as read when component mounts (user opened notifications page)
  useEffect(() => {
    const markAllAsReadOnOpen = async () => {
      const unreadNotifications = notifications.filter(n => !n.is_read);
      if (unreadNotifications.length > 0) {
        console.log('🔔 [TeacherNotifications] Auto-marking all notifications as read on page open');
        try {
          const success = await markAllAsRead();
          if (success) {
            setNotifications(notifications => 
              notifications.map(n => ({ ...n, is_read: true }))
            );
            resetUnreadCount();
            console.log('✅ [TeacherNotifications] All notifications auto-marked as read');
          }
        } catch (error) {
          console.error('❌ [TeacherNotifications] Failed to auto-mark notifications as read:', error);
        }
      }
    };

    if (notifications.length > 0) {
      markAllAsReadOnOpen();
    }
  }, [notifications.length]); // Only run when notifications are loaded

  const handleMarkRead = async (id) => {
    try {
      console.log('🔄 [TeacherNotifications] Marking notification as read:', id);
      const success = await markAsRead(id);
      console.log('📊 [TeacherNotifications] Mark as read result:', success);
      
      if (success) {
        setNotifications(notifications => 
          notifications.map(n => n.id === id ? { ...n, is_read: true } : n)
        );
        // Update the global notification count
        decrementUnreadCount();
        console.log('✅ [TeacherNotifications] Notification marked as read successfully');
      } else {
        console.warn('⚠️ [TeacherNotifications] Failed to mark notification as read - API returned false');
      }
    } catch (error) {
      console.error('❌ [TeacherNotifications] Failed to mark notification as read:', error);
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
      setTimeout(() => setActiveId(null), 3000);
    } catch (e) {
      console.error('Failed to open notification', e);
    }
  };

  const handleMarkAllRead = async () => {
    try {
      console.log('🔄 [TeacherNotifications] Marking all notifications as read');
      const success = await markAllAsRead();
      console.log('📊 [TeacherNotifications] Mark all as read result:', success);
      
      if (success) {
        setNotifications(notifications => 
          notifications.map(n => ({ ...n, is_read: true }))
        );
        // Reset the global notification count to 0
        resetUnreadCount();
        console.log('✅ [TeacherNotifications] All notifications marked as read successfully');
      } else {
        console.warn('⚠️ [TeacherNotifications] Failed to mark all notifications as read - API returned false');
      }
    } catch (error) {
      console.error('❌ [TeacherNotifications] Failed to mark all notifications as read:', error);
    }
  };

  const unreadCount = notifications.filter(n => !n.is_read).length;
  
  // Debug the unread count calculation
  console.log('🔍 [TeacherNotifications] Current notifications state:', notifications.length);
  console.log('🔍 [TeacherNotifications] Unread count calculation:', unreadCount);
  notifications.forEach((n, index) => {
    console.log(`🔍 [TeacherNotifications] Notification ${index} is_read:`, n.is_read, typeof n.is_read);
  });

  return (
    <div style={{ maxWidth: 800, margin: '0 auto', padding: 24 }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 18, flexWrap: 'wrap', gap: 12 }}>
        <div>
          <div style={{ fontWeight: 700, fontSize: 22, display: 'flex', alignItems: 'center', gap: 8 }}>
            <span role="img" aria-label="bell">🔔</span> Teacher Notifications
            {unreadCount > 0 && <span style={{ background: '#f44336', color: '#fff', borderRadius: 12, fontSize: 13, fontWeight: 700, padding: '2px 10px', marginLeft: 8 }}>{unreadCount}</span>}
          </div>
          <div style={{ color: '#666', fontSize: 14, marginTop: 2 }}>Stay updated on student submissions, excuse letters, attendance alerts, and classroom updates.</div>
        </div>
        <button
          onClick={(e) => {
            console.log('🔘 [TeacherNotifications] Mark all as read button clicked');
            console.log('🔘 [TeacherNotifications] Unread count:', unreadCount);
            console.log('🔘 [TeacherNotifications] Refreshing state:', refreshing);
            e.preventDefault();
            e.stopPropagation();
            
            // Add a small delay to ensure the click is registered
            setTimeout(() => {
              handleMarkAllRead();
            }, 10);
          }}
          onMouseDown={e => console.log('🔘 [TeacherNotifications] Mark all button mousedown')}
          onMouseUp={e => console.log('🔘 [TeacherNotifications] Mark all button mouseup')}
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

export default TeacherNotifications; 