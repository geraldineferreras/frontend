import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useNotifications } from '../contexts/NotificationContext';

const NotificationModal = ({ notification, onClose, onMarkAsRead }) => {
  const navigate = useNavigate();
  const [isVisible, setIsVisible] = useState(false);
  const [isClosing, setIsClosing] = useState(false);

  useEffect(() => {
    // Show modal with animation
    const showTimer = setTimeout(() => {
      setIsVisible(true);
    }, 100);

    // Auto-close after 5 seconds
    const autoCloseTimer = setTimeout(() => {
      handleClose();
    }, 5000);

    return () => {
      clearTimeout(showTimer);
      clearTimeout(autoCloseTimer);
    };
  }, []);

  const handleClose = useCallback(() => {
    setIsClosing(true);
    setTimeout(() => {
      onClose();
    }, 300); // Match animation duration
  }, [onClose]);

  const handleClick = () => {
    // Mark as read when clicked
    if (onMarkAsRead) {
      onMarkAsRead(notification.id);
    }
    
    // Navigate to notifications page
    const userRole = localStorage.getItem('userRole') || 'student';
    navigate(`/${userRole}/notifications`);
    
    // Close modal
    handleClose();
  };

  const getNotificationIcon = (type) => {
    const iconMap = {
      general: '📢',
      announcement: '📢',
      grade: '📝',
      attendance: '✅',
      assignment: '📋',
      stream_post: '💬',
      enrollment: '👨‍🎓',
      task: '📋'
    };
    return iconMap[type] || '📢';
  };

  const getNotificationColor = (type) => {
    const colorMap = {
      general: '#1976d2',
      announcement: '#1976d2',
      grade: '#ff9800',
      attendance: '#4caf50',
      assignment: '#9c27b0',
      stream_post: '#00bcd4',
      enrollment: '#4caf50',
      task: '#795548'
    };
    return colorMap[type] || '#1976d2';
  };

  const formatTimeAgo = (dateString) => {
    const now = new Date();
    const date = new Date(dateString);
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);
    
    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    return `${diffDays}d ago`;
  };

  const icon = getNotificationIcon(notification.type);
  const color = getNotificationColor(notification.type);

  return (
    <div
      className={`notification-modal ${isVisible ? 'visible' : ''} ${isClosing ? 'closing' : ''}`}
      onClick={handleClick}
      style={{
        background: '#ffffff',
        border: `2px solid ${color}`,
        borderRadius: '12px',
        boxShadow: '0 8px 32px rgba(0, 0, 0, 0.12)',
        padding: '16px',
        marginBottom: '12px',
        cursor: 'pointer',
        position: 'relative',
        minWidth: '320px',
        maxWidth: '400px',
        transform: isVisible ? 'translateX(0)' : 'translateX(100%)',
        opacity: isVisible ? 1 : 0,
        transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
        backdropFilter: 'blur(10px)',
        zIndex: 1000
      }}
    >
      {/* Close button */}
      <button
        onClick={(e) => {
          e.stopPropagation();
          handleClose();
        }}
        style={{
          position: 'absolute',
          top: '8px',
          right: '8px',
          background: 'rgba(0, 0, 0, 0.1)',
          border: 'none',
          borderRadius: '50%',
          width: '24px',
          height: '24px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          cursor: 'pointer',
          fontSize: '14px',
          color: '#666',
          transition: 'all 0.2s ease'
        }}
        onMouseEnter={(e) => {
          e.target.style.background = 'rgba(0, 0, 0, 0.2)';
          e.target.style.color = '#333';
        }}
        onMouseLeave={(e) => {
          e.target.style.background = 'rgba(0, 0, 0, 0.1)';
          e.target.style.color = '#666';
        }}
      >
        ×
      </button>

      {/* Notification content */}
      <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px' }}>
        {/* Icon */}
        <div
          style={{
            fontSize: '24px',
            color: color,
            flexShrink: 0,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: '32px',
            height: '32px',
            background: `${color}15`,
            borderRadius: '8px'
          }}
        >
          {icon}
        </div>

        {/* Content */}
        <div style={{ flex: 1, minWidth: 0 }}>
          {/* Title */}
          <div
            style={{
              fontWeight: '600',
              fontSize: '14px',
              color: color,
              marginBottom: '4px',
              lineHeight: '1.4'
            }}
          >
            {notification.type === 'general' ? 'Notification' : 
             notification.type === 'announcement' ? 'Announcement' :
             notification.type === 'grade' ? 'Grade Update' :
             notification.type === 'attendance' ? 'Attendance Update' :
             notification.type === 'assignment' ? 'Assignment' :
             notification.type === 'stream_post' ? 'New Stream Post' :
             notification.type === 'enrollment' ? 'Student Enrollment' :
             notification.type === 'task' ? 'Task Update' : 'Notification'}
          </div>

          {/* Message */}
          <div
            style={{
              fontSize: '13px',
              color: '#333',
              lineHeight: '1.4',
              marginBottom: '6px',
              display: '-webkit-box',
              WebkitLineClamp: 2,
              WebkitBoxOrient: 'vertical',
              overflow: 'hidden',
              textOverflow: 'ellipsis'
            }}
          >
            {notification.message}
          </div>

          {/* Time */}
          <div
            style={{
              fontSize: '11px',
              color: '#888',
              display: 'flex',
              alignItems: 'center',
              gap: '4px'
            }}
          >
            <span>🕒</span>
            <span>{formatTimeAgo(notification.created_at)}</span>
          </div>
        </div>
      </div>

      {/* Progress bar for auto-close */}
      <div
        style={{
          position: 'absolute',
          bottom: '0',
          left: '0',
          right: '0',
          height: '3px',
          background: `${color}30`,
          borderRadius: '0 0 10px 10px',
          overflow: 'hidden'
        }}
      >
        <div
          className="progress-bar"
          style={{
            height: '100%',
            background: color,
            width: '100%',
            animation: 'shrink 5s linear forwards',
            transformOrigin: 'left'
          }}
        />
      </div>
    </div>
  );
};

export default NotificationModal;

