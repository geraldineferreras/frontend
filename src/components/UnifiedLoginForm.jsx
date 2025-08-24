import React, { useState, useEffect } from 'react';
import { Form, FormGroup, Label, Input, Button, Alert, Spinner } from 'reactstrap';
import { useAuth } from '../contexts/AuthContext';
import ApiService from '../services/api';
import GoogleOAuthButton from './GoogleOAuthButton';
import Login2FAModal from './Login2FAModal';

/**
 * Unified Login Form Component
 * 
 * This component implements the unified account system by:
 * 1. Checking account status when email is entered
 * 2. Showing appropriate login options based on account type
 * 3. Handling both local and Google authentication
 * 4. 🔐 NEW: Handling 2FA verification when required
 */
const UnifiedLoginForm = ({ onSuccess, onError, className = "" }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [passwordVisible, setPasswordVisible] = useState(false);
  const [accountStatus, setAccountStatus] = useState(null);
  const [loading, setLoading] = useState(false);
  const [checkingStatus, setCheckingStatus] = useState(false);
  const [error, setError] = useState('');
  const [show2FAModal, setShow2FAModal] = useState(false);
  const [tempUserData, setTempUserData] = useState(null);
  
  const { login, loginWithGoogle, complete2FALogin } = useAuth();

  const togglePasswordVisibility = () => {
    setPasswordVisible(prev => !prev);
  };

  // Check account status when email changes
  useEffect(() => {
    if (email && email.includes('@')) {
      checkAccountStatus(email);
    } else {
      setAccountStatus(null);
    }
  }, [email]);

  /**
   * Check what login options are available for the given email
   */
  const checkAccountStatus = async (emailAddress) => {
    if (!emailAddress || !emailAddress.includes('@')) return;
    
    setCheckingStatus(true);
    setError('');
    
    try {
      const response = await ApiService.checkAccountStatus(emailAddress);
      
      if (response.success) {
        setAccountStatus(response.data);
        console.log('📊 Account status:', response.data);
      } else {
        setError('Failed to check account status: ' + response.message);
        setAccountStatus(null);
      }
    } catch (error) {
      console.error('Account status check failed:', error);
      setError('Failed to check account status. Please try again.');
      setAccountStatus(null);
    } finally {
      setCheckingStatus(false);
    }
  };

  /**
   * Handle local login with email/password
   */
  const handleLocalLogin = async (e) => {
    e.preventDefault();
    if (!email || !password) {
      setError('Please enter both email and password');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const result = await login(email, password);
      console.log('🔐 UnifiedLoginForm: Login result:', result);
      
      if (result.success) {
        if (result.requires2FA) {
          console.log('🔐 UnifiedLoginForm: 2FA required, showing modal');
          // Store temporary user data and show 2FA modal
          setTempUserData(result.tempUser);
          setShow2FAModal(true);
        } else {
          console.log('🔐 UnifiedLoginForm: No 2FA required, login successful');
          // Normal login success
          if (onSuccess) {
            onSuccess(result.data, 'local');
          }
        }
      } else {
        setError(result.message || 'Login failed');
        if (onError) {
          onError(result.message || 'Login failed');
        }
      }
    } catch (error) {
      console.error('Local login error:', error);
      setError(error.message || 'Login failed. Please try again.');
      if (onError) {
        onError(error.message || 'Login failed. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  /**
   * Handle Google OAuth login
   */
  const handleGoogleLogin = async (googleUserData, variant) => {
    setLoading(true);
    setError('');

    try {
      const result = await loginWithGoogle();
      
      if (result.success) {
        if (onSuccess) {
          onSuccess(result.data, 'google');
        }
      } else {
        setError(result.message || 'Google login failed');
        if (onError) {
          onError(result.message || 'Google login failed');
        }
      }
    } catch (error) {
      console.error('Google login error:', error);
      setError(error.message || 'Google login failed. Please try again.');
      if (onError) {
        onError(error.message || 'Google login failed. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  // 🔐 NEW: Handle 2FA verification success
  const handle2FASuccess = async (verificationData) => {
    console.log('🔐 UnifiedLoginForm: 2FA verification successful, completing login');
    try {
      const result = await complete2FALogin(email, verificationData.code || verificationData);
      
      if (result.success) {
        console.log('🔐 UnifiedLoginForm: 2FA login completed successfully');
        setShow2FAModal(false);
        if (onSuccess) {
          onSuccess(result.data, 'local');
        }
      } else {
        console.error('🔐 UnifiedLoginForm: 2FA login completion failed:', result.message);
        setError(result.message || 'Failed to complete 2FA login');
        if (onError) {
          onError(result.message || 'Failed to complete 2FA login');
        }
      }
    } catch (error) {
      console.error('🔐 UnifiedLoginForm: Error completing 2FA login:', error);
      setError(error.message || 'Error completing 2FA verification');
      if (onError) {
        onError(error.message || 'Error completing 2FA verification');
      }
    }
  };

  // 🔐 NEW: Handle 2FA cancellation
  const handle2FACancel = () => {
    console.log('🔐 UnifiedLoginForm: 2FA cancelled, clearing temp data');
    setShow2FAModal(false);
    setTempUserData(null);
    // Clear any temporary data
    localStorage.removeItem('temp_token');
    localStorage.removeItem('temp_user');
  };

  /**
   * Get the appropriate form title based on account status
   */
  const getFormTitle = () => {
    if (!accountStatus) return 'Login';
    
    switch (accountStatus.account_type) {
      case 'local':
        return 'Login with Password';
      case 'google':
        return 'Login with Google';
      case 'unified':
        return 'Login - Choose Method';
      default:
        return 'Login';
    }
  };

  /**
   * Should show password field
   */
  const shouldShowPassword = () => {
    return !accountStatus || 
           accountStatus.account_type === 'local' || 
           accountStatus.account_type === 'unified';
  };

  /**
   * Should show Google button
   */
  const shouldShowGoogle = () => {
    return accountStatus && 
           (accountStatus.account_type === 'google' || 
            accountStatus.account_type === 'unified');
  };

  /**
   * Get account type description
   */
  const getAccountTypeDescription = () => {
    if (!accountStatus) return '';
    
    switch (accountStatus.account_type) {
      case 'local':
        return 'This account uses password authentication only.';
      case 'google':
        return 'This account uses Google authentication only.';
      case 'unified':
        return 'This account supports both password and Google authentication.';
      default:
        return '';
    }
  };

  return (
    <div className={`unified-login-form ${className}`}>
      <h2 className="text-center mb-4">{getFormTitle()}</h2>
      
      {accountStatus && (
        <Alert color="info" className="mb-3">
          <small>{getAccountTypeDescription()}</small>
        </Alert>
      )}

      <Form onSubmit={handleLocalLogin}>
        <FormGroup>
          <Label for="email">Email</Label>
          <Input
            id="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Enter your email"
            disabled={loading}
            required
          />
          {checkingStatus && (
            <small className="text-muted">
              <Spinner size="sm" className="me-2" />
              Checking account status...
            </small>
          )}
        </FormGroup>

        {shouldShowPassword() && (
          <FormGroup>
            <Label for="password">Password</Label>
            <div className="position-relative">
              <Input
                id="password"
                type={passwordVisible ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter your password"
                disabled={loading}
                required
              />
                              <button
                  type="button"
                  className="btn btn-link position-absolute"
                  style={{
                    right: '10px',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    zIndex: 10,
                    border: 'none',
                    background: 'none',
                    padding: '0',
                    color: '#6c757d',
                    cursor: 'pointer',
                    width: '20px',
                    height: '20px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}
                  onClick={togglePasswordVisibility}
                  disabled={loading}
                >
                  {passwordVisible ? (
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M12 4.5C7 4.5 2.73 7.61 1 12c1.73 4.39 6 7.5 11 7.5s9.27-3.11 11-7.5c-1.73-4.39-6-7.5-11-7.5zM12 17c-2.76 0-5-2.24-5-5s2.24-5 5-5 5 2.24 5 5-2.24 5-5 5zm0-8c-1.66 0-3 1.34-3 3s1.34 3 3 3 3-1.34 3-3-1.34-3-3-3z"/>
                    </svg>
                  ) : (
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M12 7c2.76 0 5 2.24 5 5 0 .65-.13 1.26-.36 1.83l2.92 2.92c1.51-1.26 2.7-2.89 3.43-4.75-1.73-4.39-6-7.5-11-7.5-1.4 0-2.74.25-3.98.7l2.16 2.16C10.74 7.13 11.35 7 12 7zM2 4.27l2.28 2.28.46.46C3.08 8.3 1.78 10.02 1 12c1.73 4.39 6 7.5 11 7.5 1.55 0 3.03-.3 4.38-.84l.42.42L19.73 22 21 20.73 3.27 3 2 4.27zM7.53 9.8l1.55 1.55c-.05.21-.08.43-.08.65 0 1.66 1.34 3 3 3 .22 0 .44-.03.65-.08l1.55 1.55c-.67.33-1.41.53-2.2.53-2.76 0-5-2.24-5-5 0-.79.2-1.53.53-2.2zm4.31-.78l3.15 3.15.02-.16c0-1.66-1.34-3-3-3l-.17.01z"/>
                    </svg>
                  )}
                </button>
            </div>
          </FormGroup>
        )}

        {shouldShowPassword() && (
          <Button
            type="submit"
            color="primary"
            block
            className="mb-3"
            disabled={loading || !email || !password}
          >
            {loading ? (
              <>
                <Spinner size="sm" className="me-2" />
                Signing in...
              </>
            ) : (
              'Sign in with Password'
            )}
          </Button>
        )}

        {shouldShowGoogle() && (
          <div className="text-center">
            <div className="mb-2">
              <small className="text-muted">Or</small>
            </div>
            <GoogleOAuthButton
              onSuccess={handleGoogleLogin}
              onError={(error) => {
                setError(error);
                if (onError) onError(error);
              }}
              text="Sign in with Google"
              disabled={loading}
              className="w-100"
            />
          </div>
        )}
      </Form>

      {error && (
        <Alert color="danger" className="mt-3">
          {error}
        </Alert>
      )}

      {/* Account linking options for unified accounts */}
      {accountStatus?.account_type === 'unified' && (
        <div className="mt-3 p-3 border rounded bg-light">
          <small className="text-muted">
            <strong>Unified Account:</strong> You can use either your password or Google account to sign in.
            <br />
            To manage your authentication methods, go to your profile settings after signing in.
          </small>
        </div>
      )}

      {/* 🔐 NEW: 2FA Verification Modal */}
      <Login2FAModal
        isOpen={show2FAModal}
        toggle={() => setShow2FAModal(!show2FAModal)}
        email={email}
        onVerificationSuccess={handle2FASuccess}
        onCancel={handle2FACancel}
      />
    </div>
  );
};

export default UnifiedLoginForm;
