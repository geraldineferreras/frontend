import React, { useEffect } from 'react';

/**
 * Google OAuth Callback Component
 * Handles the redirect from Google OAuth and communicates with the parent window
 */
const GoogleOAuthCallback = () => {
  useEffect(() => {
    // This component should be rendered in the popup window
    // It processes the OAuth callback and communicates with the parent
    
    const urlParams = new URLSearchParams(window.location.search);
    const code = urlParams.get('code');
    const state = urlParams.get('state');
    const error = urlParams.get('error');

    if (error) {
      console.error('Google OAuth Error:', error);
      // Communicate error to parent window
      if (window.opener) {
        window.opener.postMessage({
          type: 'GOOGLE_OAUTH_ERROR',
          error: error
        }, window.location.origin);
      }
      window.close();
      return;
    }

    if (code && state) {
      // Communicate success to parent window
      if (window.opener) {
        window.opener.postMessage({
          type: 'GOOGLE_OAUTH_SUCCESS',
          code: code,
          state: state
        }, window.location.origin);
      }
      window.close();
      return;
    }

    // If no code or error, something went wrong
    if (window.opener) {
      window.opener.postMessage({
        type: 'GOOGLE_OAUTH_ERROR',
        error: 'No authorization code received'
      }, window.location.origin);
    }
    window.close();
  }, []);

  return (
    <div style={{
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      height: '100vh',
      fontFamily: 'Arial, sans-serif'
    }}>
      <div style={{ textAlign: 'center' }}>
        <div style={{ marginBottom: '20px' }}>
          <div style={{
            width: '40px',
            height: '40px',
            border: '4px solid #f3f3f3',
            borderTop: '4px solid #4285f4',
            borderRadius: '50%',
            animation: 'spin 1s linear infinite',
            margin: '0 auto'
          }}></div>
        </div>
        <p style={{ color: '#666', fontSize: '14px' }}>
          Completing Google sign-in...
        </p>
        <style>{`
          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
        `}</style>
      </div>
    </div>
  );
};

export default GoogleOAuthCallback;
