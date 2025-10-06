import notificationService from './notificationService';

class MobileNotificationService {
  constructor() {
    this.isSupported = this.checkSupport();
    this.isRegistered = false;
    this.serviceWorkerRegistration = null;
    this.pushSubscription = null;
  }

  // Check if mobile notifications are supported
  checkSupport() {
    return (
      'serviceWorker' in navigator &&
      'PushManager' in window &&
      'Notification' in window
    );
  }

  // Initialize mobile notifications
  async initialize(userId, userRole) {
    if (!this.isSupported) {
      console.log('Mobile notifications not supported');
      return false;
    }

    try {
      // Register service worker
      await this.registerServiceWorker();
      
      // Request notification permission
      const permission = await this.requestNotificationPermission();
      
      if (permission === 'granted') {
        // Subscribe to push notifications
        await this.subscribeToPushNotifications(userId, userRole);
        
        // Register for background sync
        await this.registerBackgroundSync();
        
        this.isRegistered = true;
        console.log('Mobile notifications initialized successfully');
        return true;
      } else {
        console.log('Notification permission denied');
        return false;
      }
    } catch (error) {
      console.error('Failed to initialize mobile notifications:', error);
      return false;
    }
  }

  // Register service worker
  async registerServiceWorker() {
    try {
      this.serviceWorkerRegistration = await navigator.serviceWorker.register('/sw.js');
      console.log('Service Worker registered:', this.serviceWorkerRegistration);
      
      // Wait for service worker to be ready
      await navigator.serviceWorker.ready;
      
      return this.serviceWorkerRegistration;
    } catch (error) {
      console.error('Service Worker registration failed:', error);
      throw error;
    }
  }

  // Request notification permission
  async requestNotificationPermission() {
    if (Notification.permission === 'granted') {
      return 'granted';
    }
    
    if (Notification.permission === 'denied') {
      return 'denied';
    }
    
    const permission = await Notification.requestPermission();
    return permission;
  }

  // Subscribe to push notifications
  async subscribeToPushNotifications(userId, userRole) {
    try {
      // Get VAPID public key from server
      const vapidPublicKey = await this.getVapidPublicKey();
      
      // Subscribe to push notifications
      this.pushSubscription = await this.serviceWorkerRegistration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: this.urlBase64ToUint8Array(vapidPublicKey)
      });
      
      // Send subscription to server
      await this.sendSubscriptionToServer(userId, userRole);
      
      console.log('Push notification subscription created');
      return this.pushSubscription;
    } catch (error) {
      console.error('Push subscription failed:', error);
      throw error;
    }
  }

  // Get VAPID public key from server
  async getVapidPublicKey() {
    try {
      const response = await fetch('/api/push/vapid-public-key');
      const data = await response.json();
      return data.publicKey;
    } catch (error) {
      console.error('Failed to get VAPID public key:', error);
      throw error;
    }
  }

  // Send subscription to server
  async sendSubscriptionToServer(userId, userRole) {
    try {
      const response = await fetch('/api/push-subscription', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId,
          userRole,
          subscription: this.pushSubscription
        })
      });
      
      if (!response.ok) {
        throw new Error('Failed to send subscription to server');
      }
      
      console.log('Push subscription sent to server');
    } catch (error) {
      console.error('Failed to send subscription to server:', error);
      throw error;
    }
  }

  // Register for background sync
  async registerBackgroundSync() {
    if ('serviceWorker' in navigator && 'sync' in window.ServiceWorkerRegistration.prototype) {
      try {
        await this.serviceWorkerRegistration.sync.register('background-notification-sync');
        console.log('Background sync registered');
      } catch (error) {
        console.error('Background sync registration failed:', error);
      }
    }
  }

  // Register for periodic background sync (if supported)
  async registerPeriodicSync() {
    if ('periodicSync' in window.ServiceWorkerRegistration.prototype) {
      try {
        const status = await navigator.permissions.query({
          name: 'periodic-background-sync'
        });
        
        if (status.state === 'granted') {
          await this.serviceWorkerRegistration.periodicSync.register('notification-sync', {
            minInterval: 24 * 60 * 60 * 1000 // 24 hours
          });
          console.log('Periodic background sync registered');
        }
      } catch (error) {
        console.error('Periodic sync registration failed:', error);
      }
    }
  }

  // Send local notification (when app is in background)
  async sendLocalNotification(notification) {
    if (!this.isRegistered) {
      return;
    }

    try {
      const options = {
        body: notification.message,
        icon: '/favicon.ico',
        badge: '/favicon.ico',
        tag: 'scms-notification',
        data: notification,
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
        requireInteraction: notification.type === 'grade' || notification.type === 'announcement',
        silent: false,
        vibrate: [200, 100, 200]
      };

      // Show notification
      const notificationInstance = new Notification('SCMS Notification', options);
      
      // Handle notification click
      notificationInstance.onclick = (event) => {
        event.preventDefault();
        this.handleNotificationClick(notification);
      };
      
      console.log('Local notification sent');
    } catch (error) {
      console.error('Failed to send local notification:', error);
    }
  }

  // Handle notification click
  handleNotificationClick(notification) {
    // Focus the app if it's open
    if (window.navigator && window.navigator.serviceWorker) {
      window.navigator.serviceWorker.controller.postMessage({
        type: 'NOTIFICATION_CLICKED',
        data: notification
      });
    }
    
    // Navigate to relevant page based on notification type
    this.navigateToNotificationPage(notification);
  }

  // Navigate to relevant page based on notification type
  navigateToNotificationPage(notification) {
    const { type, data } = notification;
    
    switch (type) {
      case 'grade':
        window.location.href = '/student/grades';
        break;
      case 'assignment':
        window.location.href = '/student/assignments';
        break;
      case 'attendance':
        window.location.href = '/student/attendance';
        break;
      case 'announcement':
        window.location.href = '/student/announcements';
        break;
      case 'excuse':
        window.location.href = '/teacher/excuse-letters';
        break;
      default:
        window.location.href = '/notifications';
    }
  }

  // Check if app is in background
  isAppInBackground() {
    return document.hidden || document.visibilityState === 'hidden';
  }

  // Listen for visibility changes
  onVisibilityChange(callback) {
    document.addEventListener('visibilitychange', () => {
      const isHidden = document.hidden;
      callback(isHidden);
    });
  }

  // Update badge count (for mobile home screen)
  updateBadgeCount(count) {
    if ('setAppBadge' in navigator) {
      navigator.setAppBadge(count).catch(console.error);
    }
  }

  // Clear badge count
  clearBadge() {
    if ('clearAppBadge' in navigator) {
      navigator.clearAppBadge().catch(console.error);
    }
  }

  // Install PWA prompt
  async showInstallPrompt() {
    if ('BeforeInstallPromptEvent' in window) {
      window.addEventListener('beforeinstallprompt', (event) => {
        event.preventDefault();
        window.deferredPrompt = event;
        
        // Show install button or prompt
        this.showInstallButton();
      });
    }
  }

  // Show install button
  showInstallButton() {
    const installButton = document.createElement('button');
    installButton.textContent = 'Install SCMS App';
    installButton.className = 'btn btn-primary';
    installButton.onclick = this.installPWA.bind(this);
    
    // Add to page
    document.body.appendChild(installButton);
  }

  // Install PWA
  async installPWA() {
    if (window.deferredPrompt) {
      window.deferredPrompt.prompt();
      
      const { outcome } = await window.deferredPrompt.userChoice;
      
      if (outcome === 'accepted') {
        console.log('PWA installed successfully');
      }
      
      window.deferredPrompt = null;
    }
  }

  // Convert VAPID public key to Uint8Array
  urlBase64ToUint8Array(base64String) {
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

  // Unsubscribe from push notifications
  async unsubscribe() {
    if (this.pushSubscription) {
      try {
        await this.pushSubscription.unsubscribe();
        console.log('Push notification unsubscribed');
      } catch (error) {
        console.error('Failed to unsubscribe:', error);
      }
    }
  }

  // Cleanup
  destroy() {
    this.unsubscribe();
    this.isRegistered = false;
  }
}

// Create singleton instance
const mobileNotificationService = new MobileNotificationService();
export default mobileNotificationService; 