import React, { useState, useEffect } from 'react';
import { Button } from 'reactstrap';
import { useAuth } from '../contexts/AuthContext';
import googleAuthService from '../services/googleAuth';

/**
 * Google OAuth Button Component
 * Handles Google sign-in/sign-up functionality
 */
const GoogleOAuthButton = ({ 
  onSuccess, 
  onError, 
  text = "Continue with Google",
  variant = "sign-in", // "sign-in" or "sign-up"
  disabled = false,
  className = "",
  size = "md"
}) => {
  const [loading, setLoading] = useState(false);
  const [isGoogleReady, setIsGoogleReady] = useState(false);
  const { loginWithGoogle } = useAuth();

  useEffect(() => {
    // Initialize Google Auth when component mounts
    const initGoogle = async () => {
      try {
        const initialized = await googleAuthService.initialize();
        setIsGoogleReady(initialized);
      } catch (error) {
        console.error('Failed to initialize Google Auth:', error);
        setIsGoogleReady(false);
      }
    };

    initGoogle();
  }, []);

  const handleGoogleAuth = async () => {
    if (disabled || loading || !isGoogleReady) return;

    setLoading(true);
    
    try {
      const result = await loginWithGoogle();
      
      if (result.success) {
        if (onSuccess) {
          onSuccess(result.data, variant);
        }
      } else {
        if (onError) {
          onError(result.message || 'Google authentication failed');
        }
      }
    } catch (error) {
      console.error('Google OAuth error:', error);
      if (onError) {
        onError(error.message || 'Google authentication failed. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  if (!isGoogleReady) {
    return (
      <Button
        className={`btn-neutral btn-icon ${className}`}
        color="default"
        disabled={true}
        size={size}
        style={{ 
          fontSize: size === 'sm' ? '0.8rem' : '0.875rem',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '8px'
        }}
      >
        <span className="btn-inner--icon">
          <div 
            className="spinner-border spinner-border-sm" 
            role="status"
            style={{ width: '16px', height: '16px' }}
          >
            <span className="sr-only">Loading...</span>
          </div>
        </span>
        <span className="btn-inner--text">Initializing...</span>
      </Button>
    );
  }

  return (
    <Button
      className={`btn-neutral btn-icon ${className}`}
      color="default"
      onClick={handleGoogleAuth}
      disabled={disabled || loading}
      size={size}
      style={{ 
        fontSize: size === 'sm' ? '0.8rem' : '0.875rem',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '8px'
      }}
    >
      <span className="btn-inner--icon">
        {loading ? (
          <div 
            className="spinner-border spinner-border-sm" 
            role="status"
            style={{ width: '16px', height: '16px' }}
          >
            <span className="sr-only">Loading...</span>
          </div>
        ) : (
          <img
            alt="Google"
            src={require("../assets/img/icons/common/google.svg").default}
            style={{ width: '16px', height: '16px' }}
          />
        )}
      </span>
      <span className="btn-inner--text">
        {loading ? 'Signing in...' : text}
      </span>
    </Button>
  );
};

export default GoogleOAuthButton;
