/**
 * Google OAuth Service
 * Handles Google authentication for the SCMS application using Google Identity Services
 */
class GoogleAuthService {
  constructor() {
    // Use environment variable or fallback to your actual Client ID
    this.clientId = process.env.REACT_APP_GOOGLE_CLIENT_ID || 'YOUR_GOOGLE_CLIENT_ID_HERE';
    this.isInitialized = false;
    this.pendingCallback = null;
    
    console.log('🔧 Google OAuth Client ID:', this.clientId);
  }

  /**
   * Initialize Google Identity Services for PRODUCTION MODE ONLY
   */
  async initialize() {
    if (this.isInitialized) {
      return true;
    }

    try {
      // Load Google Identity Services script
      await this.loadGoogleIdentityScript();
      
      // Wait for google object to be available
      await this.waitForGoogle();

      // Initialize Google Identity Services for PRODUCTION
      window.google.accounts.id.initialize({
        client_id: this.clientId,
        callback: this.handleCredentialResponse.bind(this),
        auto_select: false,
        cancel_on_tap_outside: true,
        use_fedcm_for_prompt: true,
        prompt_parent_id: null
      });

      this.isInitialized = true;
      console.log('Google OAuth PRODUCTION MODE initialized successfully');
      return true;
    } catch (error) {
      console.error('Failed to initialize Google Auth:', error);
      return false;
    }
  }

  /**
   * Load Google Identity Services script dynamically
   */
  loadGoogleIdentityScript() {
    return new Promise((resolve, reject) => {
      // Check if already loaded
      if (window.google && window.google.accounts) {
        resolve();
        return;
      }

      const script = document.createElement('script');
      script.src = 'https://accounts.google.com/gsi/client';
      script.onload = resolve;
      script.onerror = reject;
      document.head.appendChild(script);
    });
  }

  /**
   * Wait for Google object to be available
   */
  waitForGoogle() {
    return new Promise((resolve) => {
      const checkGoogle = () => {
        if (window.google && window.google.accounts) {
          resolve();
        } else {
          setTimeout(checkGoogle, 100);
        }
      };
      checkGoogle();
    });
  }

  /**
   * Handle credential response from Google
   */
  handleCredentialResponse(response) {
    if (this.pendingCallback) {
      try {
        const userData = this.parseJwtCredential(response.credential);
        this.pendingCallback.resolve(userData);
        this.pendingCallback = null;
      } catch (error) {
        this.pendingCallback.reject(error);
        this.pendingCallback = null;
      }
    }
  }

  /**
   * Sign in with Google - supports both demo and production modes
   */
  async signIn() {
    try {
      if (!this.isInitialized) {
        const initialized = await this.initialize();
        if (!initialized) {
          throw new Error('Failed to initialize Google Auth');
        }
      }

      // Validate Client ID
      if (!this.clientId || this.clientId === 'your_google_client_id_here.apps.googleusercontent.com') {
        throw new Error('Google OAuth Client ID not configured. Please check your environment variables.');
      }
      
      console.log('✅ Google OAuth Client ID validated:', this.clientId.substring(0, 20) + '...');

      // Use real Google OAuth with your configured credentials
      console.log('🚀 Using REAL Google OAuth');
      console.log('📱 Client ID:', this.clientId);
      console.log('🌐 Project ID: scms-469206');
      console.log('🔗 Authorized Origins: http://localhost:3000, http://localhost');
      
      return this.performRealGoogleSignIn();
    } catch (error) {
      console.error('Google sign in failed:', error);
      throw error;
    }
  }

  /**
   * Perform real Google OAuth sign-in using Google Identity Services
   */
  async performRealGoogleSignIn() {
    return new Promise((resolve, reject) => {
      try {
        // Set up the callback for when user completes OAuth
        this.pendingCallback = { resolve, reject };

        // Use Google Identity Services prompt
        window.google.accounts.id.prompt((notification) => {
          console.log('Google Identity prompt notification:', notification);
          
          if (notification.isNotDisplayed()) {
            console.log('❌ Google prompt not displayed - trying button approach');
            // Fallback: Try to create and click a Google Sign-In button
            this.triggerGoogleSignInButton(resolve, reject);
          } else if (notification.isSkippedMoment()) {
            console.log('❌ Google prompt skipped - trying button approach');
            this.triggerGoogleSignInButton(resolve, reject);
          } else {
            console.log('✅ Google prompt displayed successfully');
          }
        });

        // Set a timeout
        setTimeout(() => {
          if (this.pendingCallback) {
            this.pendingCallback = null;
            reject(new Error('Google sign-in timeout'));
          }
        }, 60000);

      } catch (error) {
        console.error('❌ Google Identity Services error:', error);
        reject(new Error('Failed to initialize Google sign-in: ' + error.message));
      }
    });
  }

  /**
   * Trigger Google Sign-In using a rendered button
   */
  triggerGoogleSignInButton(resolve, reject) {
    try {
      // Create a temporary div for the Google Sign-In button
      const tempDiv = document.createElement('div');
      tempDiv.id = 'temp-google-signin-' + Date.now();
      tempDiv.style.position = 'fixed';
      tempDiv.style.top = '-1000px';
      tempDiv.style.left = '-1000px';
      tempDiv.style.visibility = 'hidden';
      document.body.appendChild(tempDiv);

      // Store resolve/reject for the button callback
      this.pendingCallback = { resolve, reject };

      // Render Google Sign-In button
      window.google.accounts.id.renderButton(tempDiv, {
        theme: 'outline',
        size: 'large',
        type: 'standard',
        text: 'signin_with',
        width: 200
      });

      // Try to trigger the button automatically
      setTimeout(() => {
        const button = tempDiv.querySelector('div[role="button"]');
        if (button) {
          console.log('🖱️ Auto-clicking Google Sign-In button');
          button.click();
        } else {
          console.log('❌ Could not find Google Sign-In button');
          if (this.pendingCallback) {
            this.pendingCallback.reject(new Error('Could not create Google Sign-In button'));
            this.pendingCallback = null;
          }
        }

        // Cleanup the temporary div
        setTimeout(() => {
          if (document.body.contains(tempDiv)) {
            document.body.removeChild(tempDiv);
          }
        }, 5000);
      }, 1000);

    } catch (error) {
      console.error('❌ Error creating Google Sign-In button:', error);
      if (this.pendingCallback) {
        this.pendingCallback.reject(error);
        this.pendingCallback = null;
      }
    }
  }

  /**
   * Create realistic Google OAuth demo that simulates the actual flow
   */
  async createRealisticGoogleDemo() {
    return new Promise((resolve, reject) => {
      // Show a realistic OAuth-style dialog
      const confirmed = window.confirm(
        '🔐 Google OAuth Authentication\n\n' +
        '✅ Client ID: ' + this.clientId.substring(0, 20) + '...\n' +
        '✅ Scope: openid email profile\n' +
        '✅ Redirect URI: ' + window.location.origin + '/auth/google/callback\n\n' +
        '⚠️ Note: This is a working demo until Google Cloud Console redirect URIs are properly configured.\n\n' +
        'Click OK to continue with realistic demo user, or Cancel to abort.'
      );

      if (confirmed) {
        // Simulate realistic OAuth loading time
        setTimeout(() => {
          const realisticUserData = {
            id: 'google_oauth_' + Date.now(),
            email: 'oauth.user@gmail.com',
            name: 'OAuth Demo User',
            firstName: 'OAuth',
            lastName: 'User',
            imageUrl: 'https://via.placeholder.com/150x150/4285f4/ffffff?text=OU',
            idToken: 'eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9.demo_token_' + Math.random().toString(36),
            provider: 'google',
            verified_email: true,
            locale: 'en'
          };
          
          console.log('✅ Google OAuth Demo Successful');
          console.log('📧 Email:', realisticUserData.email);
          console.log('👤 Name:', realisticUserData.name);
          console.log('🔑 ID Token:', realisticUserData.idToken.substring(0, 50) + '...');
          
          resolve(realisticUserData);
        }, 1500); // Realistic loading time
      } else {
        reject(new Error('User cancelled Google OAuth'));
      }
    });
  }

  /**
   * Simulate Google sign-in for demo purposes (legacy)
   */
  async simulateGoogleSignIn() {
    return this.createRealisticGoogleDemo();
  }

  /**
   * Open Google OAuth popup window
   */
  openGoogleOAuthPopup() {
    return new Promise((resolve, reject) => {
      // Generate a random state parameter for security
      const state = Math.random().toString(36).substring(2, 15);
      
      // Store state for validation
      this.currentState = state;
      
      // OAuth 2.0 authorization URL
      const authUrl = `https://accounts.google.com/oauth/authorize?` +
        `client_id=${encodeURIComponent(this.clientId)}&` +
        `response_type=code&` +
        `scope=${encodeURIComponent('openid email profile')}&` +
        `redirect_uri=${encodeURIComponent(window.location.origin + '/auth/google/callback')}&` +
        `state=${encodeURIComponent(state)}&` +
        `access_type=offline&` +
        `prompt=select_account`;

      // Open popup window
      const popup = window.open(
        authUrl,
        'googleOAuth',
        'width=500,height=600,scrollbars=yes,resizable=yes,top=50,left=50'
      );

      if (!popup) {
        reject(new Error('Popup blocked. Please allow popups for this site and try again.'));
        return;
      }

      // Listen for messages from the popup
      const messageListener = (event) => {
        // Make sure the message is from our popup
        if (event.origin !== window.location.origin) {
          return;
        }

        if (event.data.type === 'GOOGLE_OAUTH_SUCCESS') {
          cleanup();
          if (event.data.state === state) {
            this.exchangeCodeForTokens(event.data.code)
              .then(resolve)
              .catch(reject);
          } else {
            reject(new Error('Invalid state parameter'));
          }
        } else if (event.data.type === 'GOOGLE_OAUTH_ERROR') {
          cleanup();
          reject(new Error(`Google OAuth error: ${event.data.error}`));
        }
      };

      // Check if popup is closed manually
      const checkClosed = setInterval(() => {
        if (popup.closed) {
          cleanup();
          reject(new Error('User cancelled Google sign-in'));
        }
      }, 1000);

      // Cleanup function
      const cleanup = () => {
        window.removeEventListener('message', messageListener);
        clearInterval(checkClosed);
        clearTimeout(timeout);
        if (!popup.closed) {
          popup.close();
        }
      };

      // Listen for messages
      window.addEventListener('message', messageListener);

      // Timeout after 5 minutes
      const timeout = setTimeout(() => {
        cleanup();
        reject(new Error('Google sign-in timeout. Please try again.'));
      }, 300000);
    });
  }

  /**
   * Exchange authorization code for tokens
   * Note: In production, this should be done on the backend for security
   */
  async exchangeCodeForTokens(code) {
    try {
      // For demonstration, we'll create mock user data
      // In production, you would send the code to your backend
      // and let the backend exchange it for tokens and user info
      
      const mockUserData = {
        id: 'google_' + Date.now(),
        email: 'user@gmail.com',
        name: 'Google User',
        firstName: 'Google',
        lastName: 'User',
        imageUrl: 'https://via.placeholder.com/150x150/4285f4/ffffff?text=G',
        idToken: 'mock_id_token_' + code.substring(0, 10),
        provider: 'google',
        authCode: code
      };

      return mockUserData;
    } catch (error) {
      throw new Error('Failed to exchange authorization code for tokens');
    }
  }

  /**
   * Render Google sign-in button
   */
  renderSignInButton(containerId, callback) {
    if (!this.isInitialized) {
      console.error('Google Auth not initialized');
      return;
    }

    // Set up callback for button
    this.buttonCallback = callback;

    window.google.accounts.id.renderButton(
      document.getElementById(containerId),
      {
        theme: 'outline',
        size: 'large',
        text: 'signin_with',
        shape: 'rectangular',
        logo_alignment: 'left'
      }
    );
  }

  /**
   * Parse JWT credential from Google Identity Services
   */
  parseJwtCredential(credential) {
    try {
      const payload = JSON.parse(atob(credential.split('.')[1]));
      
      return {
        id: payload.sub,
        email: payload.email,
        name: payload.name,
        firstName: payload.given_name,
        lastName: payload.family_name,
        imageUrl: payload.picture,
        idToken: credential,
        provider: 'google'
      };
    } catch (error) {
      console.error('Failed to parse JWT credential:', error);
      throw new Error('Invalid Google credential');
    }
  }

  /**
   * Sign up with Google (same as sign in, but for registration flow)
   */
  async signUp() {
    return this.signIn();
  }

  /**
   * Sign out from Google
   */
  async signOut() {
    try {
      if (window.google && window.google.accounts) {
        window.google.accounts.id.disableAutoSelect();
        console.log('Google sign out successful');
      }
    } catch (error) {
      console.error('Google sign out failed:', error);
      throw error;
    }
  }

  /**
   * Check if user is currently signed in to Google
   */
  isSignedIn() {
    // For Google Identity Services, we don't maintain persistent sign-in state
    // Authentication state is managed by our application
    return false;
  }
}

// Export singleton instance
const googleAuthService = new GoogleAuthService();
export default googleAuthService;
