import React, { createContext, useContext, useEffect, useMemo, useRef, useState } from 'react';
import SseNotificationService from '../services/sseNotificationService';
import notificationService from '../services/notificationService';
import { useAuth } from './AuthContext';

const NotificationContext = createContext(null);

export const useNotifications = () => {
  const ctx = useContext(NotificationContext);
  if (!ctx) throw new Error('useNotifications must be used within NotificationProvider');
  return ctx;
};

const defaultPreferences = {
  soundEnabled: true,
  desktopEnabled: true,
  durations: {
    success: 5000,
    info: 6000,
    warning: 8000,
    error: 0, // require manual close
  },
  maxStack: 4,
};

export const NotificationProvider = ({ children }) => {
  console.log('[Notifications] NotificationProvider rendering with children:', children);
  const { user, token } = useAuth();
  console.log('[Notifications] useAuth returned:', { user, token, hasUser: !!user, hasToken: !!token });
  
  // Add component mount effect
  useEffect(() => {
    console.log('[Notifications] NotificationProvider mounted!');
    
    // Quick debug: Check all localStorage keys
    console.log('[Notifications] All localStorage keys:', Object.keys(localStorage));
    console.log('[Notifications] localStorage user raw:', localStorage.getItem('user'));
    console.log('[Notifications] localStorage token raw:', localStorage.getItem('token'));
    
    return () => console.log('[Notifications] NotificationProvider unmounting');
  }, []);
  const [connectionStatus, setConnectionStatus] = useState({ state: 'idle', isConnected: false, retryAttempt: 0, lastMessageAt: null });
  const [activeToasts, setActiveToasts] = useState([]); // { id, type, title, message, timestamp, duration, data }
  const [queue, setQueue] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const soundRefs = useRef({});
  const [preferences, setPreferences] = useState(() => {
    try {
      const saved = localStorage.getItem('notification_preferences');
      return saved ? { ...defaultPreferences, ...JSON.parse(saved) } : defaultPreferences;
    } catch (_) {
      return defaultPreferences;
    }
  });

  const sseRef = useRef(null);

  const persistPreferences = (next) => {
    setPreferences(next);
    try { localStorage.setItem('notification_preferences', JSON.stringify(next)); } catch (_) {}
  };

  const addToastInternal = (toast) => {
    setActiveToasts((prev) => {
      const next = [...prev, toast];
      const overflow = Math.max(0, next.length - (preferences.maxStack || 4));
      return overflow > 0 ? next.slice(overflow) : next;
    });
    setUnreadCount((c) => c + 1);
  };

  const addNotification = (payload) => {
    // Normalize payload
    const now = Date.now();
    const id = payload.id || `${now}-${Math.random().toString(36).slice(2)}`;
    const type = payload.type || 'info';
    const duration = payload.duration ?? (preferences.durations[type] ?? 6000);
    const normalized = {
      id,
      type,
      title: payload.title || mapTitle(type),
      message: payload.message || '',
      timestamp: payload.timestamp || now,
      duration,
      priority: payload.priority || 'normal',
      data: payload.data || null,
      action: payload.action || null,
      link: payload.link || null,
    };

    setQueue((q) => [...q, normalized]);
  };

  // Drain queue into stack with stacking rules
  useEffect(() => {
    if (queue.length === 0) return;
    const next = queue[0];
    setQueue((q) => q.slice(1));
    addToastInternal(next);
  }, [queue]);

  // Auto-dismiss logic per toast
  useEffect(() => {
    const timers = activeToasts.map((t) => {
      if (!t || !t.duration || t.duration <= 0) return null; // manual close
      const timer = setTimeout(() => dismiss(t.id, true), t.duration);
      return timer;
    });
    return () => timers.forEach((tmr) => tmr && clearTimeout(tmr));
  }, [activeToasts]);

  const dismiss = (id, fromAuto = false) => {
    setActiveToasts((prev) => prev.filter((t) => t.id !== id));
    setUnreadCount((c) => Math.max(0, c - 1));
  };

  const clearAll = () => {
    setActiveToasts([]);
    setUnreadCount(0);
  };

  const maybeDesktopNotify = async (toast) => {
    if (!preferences.desktopEnabled || !('Notification' in window)) return;
    if (Notification.permission === 'granted') {
      new Notification(toast.title || 'New Notification', {
        body: toast.message,
        icon: '/icon-192.png',
        tag: toast.id,
      });
    } else if (Notification.permission === 'default') {
      const permission = await Notification.requestPermission();
      if (permission === 'granted') {
        maybeDesktopNotify(toast);
      }
    }
  };

  const maybePlaySound = (type) => {
    if (!preferences.soundEnabled) return;
    const soundKey = type === 'error' ? 'error' : 'notification';
    const audio = soundRefs.current[soundKey];
    if (!audio) {
      // eslint-disable-next-line no-console
      console.warn('[Notifications] Audio element missing for key:', soundKey);
      return;
    }
    try {
      audio.volume = 1.0;
      audio.currentTime = 0;
      audio.play()
        // eslint-disable-next-line no-console
        .then(() => console.debug('[Notifications] Played sound for type:', type))
        // eslint-disable-next-line no-console
        .catch((err) => console.warn('[Notifications] Audio play blocked or failed:', err));
    } catch (_) {
      // ignore
    }
  };

  // Proactively unlock audio on first user interaction (required by browsers)
  const audioUnlockedRef = useRef(false);
  useEffect(() => {
    const unlock = async () => {
      if (audioUnlockedRef.current) return;
      const notif = soundRefs.current.notification;
      const err = soundRefs.current.error;
      try {
        if (notif) {
          notif.muted = true;
          await notif.play();
          notif.pause();
          notif.currentTime = 0;
          notif.muted = false;
        }
        if (err) {
          err.muted = true;
          await err.play();
          err.pause();
          err.currentTime = 0;
          err.muted = false;
        }
        audioUnlockedRef.current = true;
        // eslint-disable-next-line no-console
        console.debug('[Notifications] Audio unlocked');
      } catch (e) {
        // eslint-disable-next-line no-console
        console.debug('[Notifications] Audio unlock attempt failed (will retry on next interaction):', e?.message || e);
      }
    };
    window.addEventListener('pointerdown', unlock);
    window.addEventListener('keydown', unlock);
    window.addEventListener('touchstart', unlock, { passive: true });
    return () => {
      window.removeEventListener('pointerdown', unlock);
      window.removeEventListener('keydown', unlock);
      window.removeEventListener('touchstart', unlock);
    };
  }, []);

  // Dev helper for manual testing from console: window._testNotifSound()
  useEffect(() => {
    // expose only in non-production or when debugging
    // eslint-disable-next-line no-underscore-dangle
    window._testNotifSound = () => {
      maybePlaySound('info');
      maybePlaySound('error');
    };
    return () => {
      // eslint-disable-next-line no-underscore-dangle
      delete window._testNotifSound;
    };
  }, [preferences.soundEnabled]);

  // SSE connection management
  useEffect(() => {
    console.log('[Notifications] useEffect triggered with:', { user, token, hasUser: !!user, hasToken: !!token });
    
    // Debug: Check localStorage for user data
    console.log('[Notifications] localStorage user:', localStorage.getItem('user'));
    console.log('[Notifications] localStorage token:', localStorage.getItem('token'));
    
              // Check for user ID in different possible fields
     const userId = user?.id || user?.user_id || user?.userId || user?.uid || user?._id;
     
     // Add a test notification to verify the component is working
     addNotification({ 
       type: 'info', 
       title: 'SSE Debug', 
       message: 'NotificationProvider is working! User: ' + (userId || 'undefined') 
     });
     
     if (!user || !token) {
       console.log('[Notifications] Missing user or token, skipping SSE connection');
       return;
     }
     
     if (!userId) {
       console.error('[Notifications] User object missing ID field. Available fields:', Object.keys(user || {}));
       return;
     }
     
     console.log('[Notifications] Found user ID:', userId);

    const svc = new SseNotificationService();
    sseRef.current = svc;

    // Fallback polling service
    let pollingInterval = null;
    const teardownPolling = () => {
      if (pollingInterval) {
        clearInterval(pollingInterval);
        pollingInterval = null;
      }
    };

    const startPolling = async () => {
      try {
        const data = await notificationService.getRecentNotifications();
        data.forEach((item) => {
          const scheduledAtCandidate = (
            item?.data?.scheduled_at ||
            item?.scheduled_at ||
            item?.data?.post?.scheduled_at ||
            item?.post?.scheduled_at ||
            null
          );

          const notifyNow = () => {
            addNotification({
              id: item.id,
              type: item.type || 'info',
              title: item.title,
              message: item.message,
              timestamp: item.created_at || Date.now(),
              data: item.data,
              link: item.data?.link,
            });
            maybeDesktopNotify(item);
            maybePlaySound(item.type || 'info');
          };

          if (scheduledAtCandidate) {
            const parseSqlLocal = (dateTimeStr) => {
              try {
                const [d, t] = String(dateTimeStr).split(' ');
                if (!d || !t) return new Date(dateTimeStr);
                const [y, m, day] = d.split('-').map(n => parseInt(n, 10));
                const [hh, mm, ss] = t.split(':').map(n => parseInt(n, 10));
                return new Date(y, (m - 1), day, hh, mm, ss || 0);
              } catch (_) {
                return new Date(dateTimeStr);
              }
            };
            const publishTime = parseSqlLocal(scheduledAtCandidate);
            const now = new Date();
            if (publishTime instanceof Date && !isNaN(publishTime) && publishTime > now) {
              const delayMs = Math.min(24 * 60 * 60 * 1000, publishTime.getTime() - now.getTime());
              console.log('[Notifications][Polling] Deferring notification until scheduled time:', publishTime.toString());
              setTimeout(notifyNow, Math.max(0, delayMs));
              return; // skip immediate
            }
          }
          notifyNow();
        });
      } catch (_) {
        // ignore
      }
    };

    const unsubStatus = svc.on('status', (st) => {
      setConnectionStatus(st);
      if (st.state === 'failed') {
        // Fallback to polling
        startPolling();
      } else if (st.state === 'connected') {
        // Stop polling once SSE is back
        teardownPolling();
      }
    });
    const unsubOpen = svc.on('open', () => {
      // optionally push a small status toast
      // addNotification({ type: 'success', message: 'Connected to notifications' });
    });
    const unsubErr = svc.on('error', () => {
      // addNotification({ type: 'warning', message: 'Reconnecting to notifications...' });
    });
    const unsubClose = svc.on('close', () => {
      // addNotification({ type: 'error', message: 'Notification stream closed' });
    });
    const unsubNotification = svc.on('notification', async (data) => {
      try {
        // Defer or suppress ANY stream/announcement notification for scheduled posts
        // Probe common fields in payload
        const scheduledAtCandidate = (
          data?.data?.scheduled_at ||
          data?.scheduled_at ||
          data?.data?.post?.scheduled_at ||
          data?.post?.scheduled_at ||
          null
        );
        const isScheduledFlag = (
          data?.data?.is_scheduled === 1 || data?.data?.is_scheduled === '1' ||
          data?.is_scheduled === 1 || data?.is_scheduled === '1' ||
          data?.data?.post?.is_scheduled === 1 || data?.data?.post?.is_scheduled === '1' ||
          data?.post?.is_scheduled === 1 || data?.post?.is_scheduled === '1'
        );

        if (scheduledAtCandidate) {
          const parseSqlLocal = (dateTimeStr) => {
            try {
              const [d, t] = String(dateTimeStr).split(' ');
              if (!d || !t) return new Date(dateTimeStr);
              const [y, m, day] = d.split('-').map(n => parseInt(n, 10));
              const [hh, mm, ss] = t.split(':').map(n => parseInt(n, 10));
              return new Date(y, (m - 1), day, hh, mm, ss || 0);
            } catch (_) {
              return new Date(dateTimeStr);
            }
          };
          const publishTime = parseSqlLocal(scheduledAtCandidate);
          const now = new Date();
          if (publishTime instanceof Date && !isNaN(publishTime) && publishTime > now) {
            const delayMs = Math.min(24 * 60 * 60 * 1000, publishTime.getTime() - now.getTime());
            console.log('[Notifications] Deferring notification until scheduled time:', publishTime.toString());
            setTimeout(() => {
              addNotification(data);
              maybeDesktopNotify(data);
              maybePlaySound(data.type || 'info');
            }, Math.max(0, delayMs));
            return; // skip immediate notify
          }
        }
        // If marked as scheduled but no scheduled_at present, suppress immediate notification
        if (isScheduledFlag && !scheduledAtCandidate) {
          console.log('[Notifications] Suppressing immediate notification for scheduled post without scheduled_at');
          return;
        }
      } catch (e) {
        console.warn('[Notifications] Scheduled notification handling failed, showing immediately:', e?.message || e);
      }
      addNotification(data);
      maybeDesktopNotify(data);
      maybePlaySound(data.type || 'info');
    });

    console.log('[Notifications] Connecting SSE with:', { 
      user: user,
      userId: userId, 
      role: user?.role, 
      tokenLength: token?.length || 0,
      envUrl: process.env.REACT_APP_SSE_URL 
    });
    
    // Debug: Log the full user object structure
    console.log('[Notifications] Full user object:', JSON.stringify(user, null, 2));
    console.log('[Notifications] User object keys:', Object.keys(user || {}));
    console.log('[Notifications] User ID field candidates:', {
      id: user?.id,
      user_id: user?.user_id,
      userId: user?.userId,
      uid: user?.uid,
      _id: user?._id
    });
    
    // Explicitly use the environment variable URL
    const sseUrl = process.env.REACT_APP_SSE_URL;
    console.log('[Notifications] Environment variable value:', sseUrl);
    
    if (!sseUrl) {
      console.error('[Notifications] REACT_APP_SSE_URL not found! Please check your .env.local file');
      // Temporary fallback for testing
      const fallbackUrl = 'http://localhost/scms_new_backup/index.php/api/notifications/stream';
      console.log('[Notifications] Using fallback URL:', fallbackUrl);
             svc.connect({ 
         url: fallbackUrl, 
         token, 
         userId: userId, 
         role: user.role 
       });
    } else {
             svc.connect({ 
         url: sseUrl, 
         token, 
         userId: userId, 
         role: user.role 
       });
    }

    return () => {
      unsubStatus();
      unsubOpen();
      unsubErr();
      unsubClose();
      unsubNotification();
      svc.disconnect();
      sseRef.current = null;
      teardownPolling();
    };
  }, [user, token]);

  // Title mapping
  const mapTitle = (type) => {
    switch (type) {
      case 'success': return 'Success';
      case 'warning': return 'Warning';
      case 'error': return 'Error';
      case 'info': return 'Information';
      case 'grade': return 'Grade';
      case 'attendance': return 'Attendance';
      case 'excuse': return 'Excuse Letter';
      case 'announcement': return 'Announcement';
      case 'task': return 'Task';
      case 'stream_post': return 'Class Stream';
      default: return 'Notification';
    }
  };

  const value = useMemo(() => ({
    connectionStatus,
    activeToasts,
    queue,
    unreadCount,
    preferences,
    setPreferences: persistPreferences,
    addNotification,
    dismiss,
    clearAll,
  }), [connectionStatus, activeToasts, queue, unreadCount, preferences]);

  return (
    <NotificationContext.Provider value={value}>
      {children}
      {/* Hidden audio elements for notification sounds. Place files in public/sounds/. */}
      <audio
        ref={(el) => { if (el) soundRefs.current.notification = el; }}
        src={`${process.env.PUBLIC_URL || ''}/sounds/notification.mp3`}
        preload="auto"
        style={{ display: 'none' }}
        onCanPlay={() => console.debug('[Notifications] notification.mp3 ready')}
        onError={(e) => console.warn('[Notifications] Failed to load notification.mp3', e)}
      />
      <audio
        ref={(el) => { if (el) soundRefs.current.error = el; }}
        src={`${process.env.PUBLIC_URL || ''}/sounds/error.mp3`}
        preload="auto"
        style={{ display: 'none' }}
        onCanPlay={() => console.debug('[Notifications] error.mp3 ready')}
        onError={(e) => console.warn('[Notifications] Failed to load error.mp3', e)}
      />
    </NotificationContext.Provider>
  );
};

export default NotificationContext;
