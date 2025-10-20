import React from 'react';

/**
 * Reusable notification count badge component
 * Displays a red circular badge with the count of unread notifications
 */
const NotificationCountBadge = ({ count, className = "" }) => {
  // Don't render if count is 0 or negative
  if (!count || count <= 0) {
    return null;
  }

  return (
    <span 
      className={`notification-count-badge ${className}`}
      style={{
        backgroundColor: '#f44336',
        color: 'white',
        borderRadius: '50%',
        minWidth: '18px',
        height: '18px',
        fontSize: '11px',
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontWeight: 'bold',
        marginLeft: '8px',
        padding: '0 4px',
        lineHeight: '1'
      }}
    >
      {count > 99 ? '99+' : count}
    </span>
  );
};

export default NotificationCountBadge;

