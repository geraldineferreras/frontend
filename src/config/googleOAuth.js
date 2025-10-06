/**
 * Google OAuth Configuration
 * Centralized configuration for Google OAuth integration
 */

export const GoogleOAuthConfig = {
  // Client ID from your Google Cloud Console
  CLIENT_ID: process.env.REACT_APP_GOOGLE_CLIENT_ID || 'YOUR_GOOGLE_CLIENT_ID_HERE',
  
  // Demo mode configuration
  DEMO_MODE: {
    // Enable demo mode for development/testing
    enabled: process.env.NODE_ENV === 'development' || window.location.hostname === 'localhost',
    
    // Demo user data
    user: {
      id: 'google_demo_' + Date.now(),
      email: 'demo.user@gmail.com',
      name: 'Demo Google User',
      firstName: 'Demo',
      lastName: 'User',
      imageUrl: 'https://via.placeholder.com/150x150/4285f4/ffffff?text=DU'
    }
  },
  
  // OAuth scope for Google APIs
  SCOPE: 'openid email profile',
  
  // OAuth settings
  OAUTH_SETTINGS: {
    auto_select: false,
    cancel_on_tap_outside: true,
    prompt_parent_id: null,
    nonce: '',
    context: 'signin',
    state_cookie_domain: '',
    ux_mode: 'popup',
    allowed_parent_origin: [window.location.origin],
    intermediate_iframe_close_callback: null
  },
  
  // Backend endpoints
  API: {
    // Your backend Google OAuth endpoint
    AUTH_ENDPOINT: '/auth/google',
    
    // Backend base URL (from environment)
    BASE_URL: process.env.REACT_APP_API_BASE_URL || 'http://localhost/scms_new_backup/index.php/api'
  },
  
  // Feature flags
  FEATURES: {
    // Enable real Google OAuth (set to false for demo-only mode)
    REAL_OAUTH: !process.env.REACT_APP_DEMO_ONLY,
    
    // Enable automatic account linking
    AUTO_LINK_ACCOUNTS: true,
    
    // Default role for new Google users
    DEFAULT_NEW_USER_ROLE: 'student',
    
    // Enable profile image sync from Google
    SYNC_PROFILE_IMAGE: true
  },
  
  // Error messages
  MESSAGES: {
    DEMO_PROMPT: 
      'Demo Google Sign-In\n\n' +
      'This will simulate signing in with Google.\n' +
      'In production, this would open Google\'s OAuth flow.\n\n' +
      'Click OK to continue with demo user, or Cancel to abort.',
    
    POPUP_BLOCKED: 'Popup blocked. Please allow popups for this site and try again.',
    
    TIMEOUT: 'Google sign-in timeout. Please try again.',
    
    CANCELLED: 'User cancelled Google sign-in',
    
    INIT_FAILED: 'Failed to initialize Google Auth',
    
    NETWORK_ERROR: 'Network error occurred during Google authentication'
  }
};

/**
 * Helper functions for Google OAuth configuration
 */
export const GoogleOAuthUtils = {
  /**
   * Check if we're in demo mode
   */
  isDemoMode() {
    return GoogleOAuthConfig.DEMO_MODE.enabled || 
           !GoogleOAuthConfig.FEATURES.REAL_OAUTH ||
           GoogleOAuthConfig.CLIENT_ID.includes('demo');
  },
  
  /**
   * Get the full API endpoint URL
   */
  getAuthEndpoint() {
    return GoogleOAuthConfig.API.BASE_URL + GoogleOAuthConfig.API.AUTH_ENDPOINT;
  },
  
  /**
   * Get demo user data
   */
  getDemoUser() {
    return {
      ...GoogleOAuthConfig.DEMO_MODE.user,
      id: 'google_demo_' + Date.now(),
      provider: 'google'
    };
  },
  
  /**
   * Check if Google OAuth is properly configured
   */
  isConfigured() {
    return GoogleOAuthConfig.CLIENT_ID && 
           GoogleOAuthConfig.CLIENT_ID !== 'your_google_client_id_here.apps.googleusercontent.com' &&
           GoogleOAuthConfig.API.BASE_URL;
  },
  
  /**
   * Get redirect URI for production OAuth
   */
  getRedirectUri() {
    return window.location.origin + '/auth/google/callback';
  }
};

export default GoogleOAuthConfig;
