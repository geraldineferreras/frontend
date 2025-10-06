// Service Worker for SCMS Background Notifications
const CACHE_NAME = 'scms-v1.0.0';
const NOTIFICATION_TAG = 'scms-notification';

// Install event - cache important resources
self.addEventListener('install', (event) => {
  console.log('Service Worker installing...');
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        return cache.addAll([
          '/',
          '/index.html',
          '/static/js/bundle.js',
          '/static/css/main.css',
          '/favicon.ico',
          '/grading-success-female.mp3',
          '/grading-success-male.mp3'
        ]);
      })
      .then(() => {
        console.log('Service Worker installed successfully');
        return self.skipWaiting();
      })
  );
});

// Activate event - clean up old caches
self.addEventListener('activate', (event) => {
  console.log('Service Worker activating...');
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME) {
            console.log('Deleting old cache:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    }).then(() => {
      console.log('Service Worker activated');
      return self.clients.claim();
    })
  );
});

// Background sync for notifications
self.addEventListener('sync', (event) => {
  console.log('Background sync triggered:', event.tag);
  
  if (event.tag === 'background-notification-sync') {
    event.waitUntil(
      // Sync notifications when connection is restored
      syncNotifications()
    );
  }
});

// Push notification event
self.addEventListener('push', (event) => {
  console.log('Push notification received:', event);
  
  if (event.data) {
    const notificationData = event.data.json();
    
    const options = {
      body: notificationData.message,
      icon: '/favicon.ico',
      badge: '/favicon.ico',
      tag: NOTIFICATION_TAG,
      data: notificationData,
      actions: [
        {
          action: 'view',
          title: 'View',
          icon: '/favicon.ico'
        },
        {
          action: 'dismiss',
          title: 'Dismiss',
          icon: '/favicon.ico'
        }
      ],
      requireInteraction: notificationData.type === 'grade' || notificationData.type === 'announcement',
      silent: false,
      vibrate: [200, 100, 200],
      sound: '/grading-success-female.mp3'
    };

    event.waitUntil(
      self.registration.showNotification('SCMS Notification', options)
    );
  }
});

// Notification click event
self.addEventListener('notificationclick', (event) => {
  console.log('Notification clicked:', event);
  
  event.notification.close();
  
  if (event.action === 'view') {
    // Open the app and navigate to relevant page
    event.waitUntil(
      clients.matchAll({ type: 'window' }).then((clientList) => {
        if (clientList.length > 0) {
          // App is already open, focus it
          clientList[0].focus();
          clientList[0].postMessage({
            type: 'NOTIFICATION_CLICKED',
            data: event.notification.data
          });
        } else {
          // App is not open, open it
          clients.openWindow('/');
        }
      })
    );
  }
});

// Background sync function
async function syncNotifications() {
  try {
    // Check for pending notifications
    const pendingNotifications = await getPendingNotifications();
    
    for (const notification of pendingNotifications) {
      await sendNotification(notification);
    }
    
    console.log('Background sync completed');
  } catch (error) {
    console.error('Background sync failed:', error);
  }
}

// Get pending notifications from IndexedDB
async function getPendingNotifications() {
  // This would typically read from IndexedDB
  // For now, return empty array
  return [];
}

// Send notification to server
async function sendNotification(notification) {
  try {
    const response = await fetch('/api/notifications', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(notification)
    });
    
    if (!response.ok) {
      throw new Error('Failed to send notification');
    }
    
    console.log('Notification sent successfully');
  } catch (error) {
    console.error('Failed to send notification:', error);
    throw error;
  }
}

// Handle fetch events for offline support
self.addEventListener('fetch', (event) => {
  // Only handle API requests for notifications
  if (event.request.url.includes('/api/notifications')) {
    event.respondWith(
      fetch(event.request)
        .catch(() => {
          // If offline, return cached response or empty response
          return new Response(JSON.stringify({ offline: true }), {
            headers: { 'Content-Type': 'application/json' }
          });
        })
    );
  }
});

// Handle message events from main app
self.addEventListener('message', (event) => {
  console.log('Service Worker received message:', event.data);
  
  if (event.data.type === 'REGISTER_PUSH') {
    // Register for push notifications
    event.waitUntil(
      self.registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(event.data.vapidPublicKey)
      }).then((subscription) => {
        // Send subscription to server
        return fetch('/api/push-subscription', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(subscription)
        });
      }).then(() => {
        event.ports[0].postMessage({ success: true });
      }).catch((error) => {
        console.error('Push subscription failed:', error);
        event.ports[0].postMessage({ success: false, error: error.message });
      })
    );
  }
});

// Convert VAPID public key to Uint8Array
function urlBase64ToUint8Array(base64String) {
  const padding = '='.repeat((4 - base64String.length % 4) % 4);
  const base64 = (base64String + padding)
    .replace(/-/g, '+')
    .replace(/_/g, '/');

  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);

  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
}

// Periodic background sync (if supported)
self.addEventListener('periodicsync', (event) => {
  console.log('Periodic background sync:', event.tag);
  
  if (event.tag === 'notification-sync') {
    event.waitUntil(syncNotifications());
  }
}); 