// Lightweight SSE client with auto-reconnect and status tracking

const DEFAULT_MAX_RETRIES = 5;
const DEFAULT_MAX_BACKOFF_MS = 30000;
const DEFAULT_BASE_BACKOFF_MS = 1000;
const DEFAULT_HEARTBEAT_TIMEOUT_MS = 60000; // consider stale if no messages within 60s

export default class SseNotificationService {
  constructor() {
    this.eventSource = null;
    this.connectionState = 'idle'; // idle | connecting | connected | reconnecting | failed
    this.listeners = {
      open: new Set(),
      error: new Set(),
      close: new Set(),
      notification: new Set(),
      status: new Set(),
      raw: new Set(), // receives raw EventSource message events
    };
    this.retryAttempt = 0;
    this.maxRetries = DEFAULT_MAX_RETRIES;
    this.baseBackoffMs = DEFAULT_BASE_BACKOFF_MS;
    this.maxBackoffMs = DEFAULT_MAX_BACKOFF_MS;
    this.heartbeatTimer = null;
    this.heartbeatTimeoutMs = DEFAULT_HEARTBEAT_TIMEOUT_MS;
    this.lastMessageAt = null;
    this.currentConfig = null; // { url, token, userId, role }
  }

  on(eventName, handler) {
    if (!this.listeners[eventName]) return () => {};
    this.listeners[eventName].add(handler);
    return () => this.off(eventName, handler);
  }

  off(eventName, handler) {
    if (!this.listeners[eventName]) return;
    this.listeners[eventName].delete(handler);
  }

  emit(eventName, payload) {
    if (!this.listeners[eventName]) return;
    this.listeners[eventName].forEach((cb) => {
      try { cb(payload); } catch (err) { console.error('[SSE] listener error:', err); }
    });
  }

  setState(next) {
    if (this.connectionState !== next) {
      this.connectionState = next;
      this.emit('status', this.getStatus());
    }
  }

  getStatus() {
    return {
      state: this.connectionState,
      retryAttempt: this.retryAttempt,
      lastMessageAt: this.lastMessageAt,
      isConnected: this.connectionState === 'connected',
    };
  }

  buildDefaultSseUrl(params) {
    // Always use the explicit environment variable if set
    const envUrl = process.env.REACT_APP_SSE_URL;
    if (envUrl) {
      console.log('[SSE] Using environment URL:', envUrl);
      return this.appendQuery(envUrl, params);
    }

    // Fallback only if no environment variable is set
    console.warn('[SSE] No REACT_APP_SSE_URL found, using fallback');
    const apiBase = process.env.REACT_APP_API_BASE_URL || '';
    // Strip trailing /index.php/api or /api
    let base = apiBase.replace(/\/?index\.php\/api$/, '').replace(/\/?api$/, '');
    base = base.replace(/\/$/, '');
    // Common SSE endpoints candidates; server should handle one of these
    const candidates = [
      `${base}/sse/notifications`,
      `${base}/notifications/stream`,
      `${base}/api/notifications/stream`,
    ];
    // Pick first candidate
    return this.appendQuery(candidates[0], params);
  }

  appendQuery(url, params) {
    // Try different authentication approaches
    const { token, userId, role } = params || {};
    
    // Approach 1: Query parameters (current)
    const usp = new URLSearchParams();
    if (userId) usp.set('userId', userId);
    if (role) usp.set('role', role);
    
    // Approach 2: Token in path (some backends prefer this)
    let finalUrl = url;
    if (token) {
      // Try putting token in path: /api/notifications/stream/{token}
      if (finalUrl.endsWith('/stream')) {
        finalUrl = `${finalUrl}/${encodeURIComponent(token)}`;
      }
    }
    
    // Add remaining query parameters
    const sep = finalUrl.includes('?') ? '&' : '?';
    return `${finalUrl}${usp.toString() ? sep + usp.toString() : ''}`;
  }

  connect({ url, token, userId, role, maxRetries, baseBackoffMs, maxBackoffMs, heartbeatTimeoutMs } = {}) {
    if (this.eventSource) this.disconnect();

    this.maxRetries = maxRetries ?? this.maxRetries;
    this.baseBackoffMs = baseBackoffMs ?? this.baseBackoffMs;
    this.maxBackoffMs = maxBackoffMs ?? this.maxBackoffMs;
    this.heartbeatTimeoutMs = heartbeatTimeoutMs ?? this.heartbeatTimeoutMs;

    const params = { token, userId, role };
    
    console.log('[SSE] Connect called with:', { url, token: token ? '***' : 'undefined', userId, role });
    console.log('[SSE] Environment variable value:', process.env.REACT_APP_SSE_URL);
    
    const finalUrl = url ? this.appendQuery(url, params) : this.buildDefaultSseUrl(params);
    
    console.log('[SSE] Final URL being used:', finalUrl);
    console.log('[SSE] URL source:', url ? 'explicit parameter' : 'fallback method');
    console.log('[SSE] Authentication method: Token in path + userId/role in query');
    
    this.currentConfig = { url: finalUrl, token, userId, role };

    this.retryAttempt = 0;
    this.openEventSource(finalUrl);
  }

  openEventSource(finalUrl) {
    try {
      this.setState(this.retryAttempt === 0 ? 'connecting' : 'reconnecting');
      // Remove withCredentials since we're passing token in URL
      this.eventSource = new EventSource(finalUrl);

      this.eventSource.addEventListener('open', () => {
        this.retryAttempt = 0;
        this.lastMessageAt = Date.now();
        this.setState('connected');
        this.startHeartbeat();
        this.emit('open');
      });

      // Server may send named events like `notification`
      this.eventSource.addEventListener('notification', (evt) => {
        this.lastMessageAt = Date.now();
        this.emit('raw', evt);
        this.handleIncoming(evt);
      });

      // Default message handler
      this.eventSource.addEventListener('message', (evt) => {
        this.lastMessageAt = Date.now();
        this.emit('raw', evt);
        this.handleIncoming(evt);
      });

      this.eventSource.addEventListener('error', (err) => {
        console.warn('[SSE] error event:', err);
        this.emit('error', err);
        this.scheduleReconnect();
      });
    } catch (err) {
      console.error('[SSE] failed to open:', err);
      this.emit('error', err);
      this.scheduleReconnect();
    }
  }

  handleIncoming(evt) {
    try {
      const data = evt?.data ? JSON.parse(evt.data) : null;
      if (!data) return;
      // Expect structure: { type, title?, message, data?, timestamp?, duration?, priority? }
      this.emit('notification', data);
    } catch (err) {
      console.warn('[SSE] parse error:', err, evt?.data);
    }
  }

  startHeartbeat() {
    this.stopHeartbeat();
    this.heartbeatTimer = setInterval(() => {
      if (!this.lastMessageAt) return;
      const idleMs = Date.now() - this.lastMessageAt;
      if (idleMs > this.heartbeatTimeoutMs) {
        console.warn('[SSE] heartbeat timeout, reconnecting');
        this.scheduleReconnect(true);
      }
    }, Math.min(15000, this.heartbeatTimeoutMs / 2));
  }

  stopHeartbeat() {
    if (this.heartbeatTimer) {
      clearInterval(this.heartbeatTimer);
      this.heartbeatTimer = null;
    }
  }

  scheduleReconnect(force = false) {
    // Close existing connection first
    this.cleanupEventSource();

    if (!this.currentConfig) return;

    if (!force && this.retryAttempt >= this.maxRetries) {
      this.setState('failed');
      this.emit('close');
      return;
    }

    this.retryAttempt += 1;
    const backoff = Math.min(
      this.maxBackoffMs,
      this.baseBackoffMs * Math.pow(2, this.retryAttempt - 1)
    );
    const jitter = Math.floor(Math.random() * 250);
    const delay = backoff + jitter;

    this.setState(this.retryAttempt === 0 ? 'connecting' : 'reconnecting');
    setTimeout(() => {
      if (!this.currentConfig) return;
      this.openEventSource(this.currentConfig.url);
    }, delay);
  }

  disconnect() {
    this.currentConfig = null;
    this.stopHeartbeat();
    this.cleanupEventSource();
    this.retryAttempt = 0;
    this.setState('idle');
  }

  cleanupEventSource() {
    if (this.eventSource) {
      try { this.eventSource.close(); } catch (_) {}
      this.eventSource = null;
    }
  }
}
