import { useEffect, useCallback } from 'react';
import { getCurrentUserId } from '../utils/userUtils';
import api from '../services/api';
import { useNotifications } from '../contexts/NotificationContext';

/**
 * Custom hook to manage notification count state
 * Provides real-time unread notification count with automatic updates
 * Now uses the global NotificationContext for consistent state management
 */
export const useNotificationCount = () => {
  const { unreadCount, refreshUnreadCount, decrementUnreadCount, resetUnreadCount } = useNotifications();

  // Fetch unread count from API
  const fetchUnreadCount = useCallback(async () => {
    try {
      const userId = getCurrentUserId();
      if (!userId) {
        return;
      }

      const response = await api.getUnreadNotificationCount(userId);
      if (response.success && response.data) {
        // Update the global context instead of local state
        await refreshUnreadCount();
      }
    } catch (error) {
      console.error('Error fetching unread notification count:', error);
    }
  }, [refreshUnreadCount]);

  // Initial fetch and periodic updates
  useEffect(() => {
    fetchUnreadCount();
    
    // Poll for updates every 30 seconds
    const interval = setInterval(fetchUnreadCount, 30000);
    
    return () => clearInterval(interval);
  }, [fetchUnreadCount]);

  // Function to manually refresh count (useful after marking notifications as read)
  const refreshCount = useCallback(() => {
    fetchUnreadCount();
  }, [fetchUnreadCount]);

  // Function to decrement count (useful when marking individual notifications as read)
  const decrementCount = useCallback(() => {
    decrementUnreadCount();
  }, [decrementUnreadCount]);

  return {
    unreadCount,
    loading: false, // Loading is handled by the context
    error: null, // Error handling is done in the context
    refreshCount,
    decrementCount,
    resetUnreadCount
  };
};
