import React, { useState } from 'react';
import { Card, CardBody, CardTitle, Button, Alert, Spinner, Badge } from 'reactstrap';
import { useAuth } from '../contexts/AuthContext';
import { ApiService } from '../services/api';
import googleAuthService from '../services/googleAuth';

/**
 * Account Linking Manager Component
 * 
 * This component allows users to:
 * - Link their Google account to their local account
 * - Unlink their Google account from their unified account
 * - See their current account linking status
 */
const AccountLinkingManager = ({ className = "" }) => {
  const { user } = useAuth();
  const [linking, setLinking] = useState(false);
  const [unlinking, setUnlinking] = useState(false);
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState('info');

  if (!user) {
    return null;
  }

  /**
   * Link Google account to existing local account
   */
  const handleLinkGoogle = async () => {
    setLinking(true);
    setMessage('');
    
    try {
      // First, authenticate with Google to get the Google ID
      const googleUser = await googleAuthService.signIn();
      
      // Then link the Google account to the local account
      const response = await ApiService.linkGoogleAccount(user.email, googleUser.id);
      
      if (response.success) {
        setMessage('Google account linked successfully! You can now sign in with either method.');
        setMessageType('success');
        
        // Update the user object to reflect the new account type
        // In a real app, you might want to refresh the user data from the backend
        user.account_type = 'unified';
        user.has_google_account = true;
      } else {
        setMessage('Failed to link Google account: ' + response.message);
        setMessageType('danger');
      }
    } catch (error) {
      console.error('Google account linking failed:', error);
      setMessage('Failed to link Google account: ' + error.message);
      setMessageType('danger');
    } finally {
      setLinking(false);
    }
  };

  /**
   * Unlink Google account from unified account
   */
  const handleUnlinkGoogle = async () => {
    if (!window.confirm('Are you sure you want to unlink your Google account? You will only be able to sign in with your password.')) {
      return;
    }
    
    setUnlinking(true);
    setMessage('');
    
    try {
      const response = await ApiService.unlinkGoogleAccount(user.email);
      
      if (response.success) {
        setMessage('Google account unlinked successfully! You can now only sign in with your password.');
        setMessageType('success');
        
        // Update the user object to reflect the new account type
        user.account_type = 'local';
        user.has_google_account = false;
      } else {
        setMessage('Failed to unlink Google account: ' + response.message);
        setMessageType('danger');
      }
    } catch (error) {
      console.error('Google account unlinking failed:', error);
      setMessage('Failed to unlink Google account: ' + error.message);
      setMessageType('danger');
    } finally {
      setUnlinking(false);
    }
  };

  /**
   * Get current account type display
   */
  const getAccountTypeDisplay = () => {
    if (user.account_type === 'unified') {
      return <Badge color="success">Unified Account</Badge>;
    } else if (user.account_type === 'google') {
      return <Badge color="info">Google Only</Badge>;
    } else {
      return <Badge color="secondary">Local Only</Badge>;
    }
  };

  /**
   * Get authentication methods display
   */
  const getAuthMethodsDisplay = () => {
    const methods = [];
    
    if (user.auth_provider === 'local' || user.account_type === 'local' || user.account_type === 'unified') {
      methods.push('Password');
    }
    
    if (user.auth_provider === 'google' || user.account_type === 'google' || user.account_type === 'unified') {
      methods.push('Google');
    }
    
    return methods.join(' + ');
  };

  return (
    <Card className={`account-linking-manager ${className}`}>
      <CardBody>
        <CardTitle tag="h5" className="d-flex align-items-center justify-content-between">
          Account Authentication
          {getAccountTypeDisplay()}
        </CardTitle>
        
        <div className="mb-3">
          <small className="text-muted">
            <strong>Current Methods:</strong> {getAuthMethodsDisplay()}
          </small>
        </div>

        {message && (
          <Alert color={messageType} className="mb-3">
            {message}
          </Alert>
        )}

        {/* Link Google Account Section */}
        {(!user.has_google_account || user.account_type === 'local') && (
          <div className="mb-3 p-3 border rounded bg-light">
            <h6>Add Google Sign-In</h6>
            <p className="small text-muted mb-2">
              Link your Google account to enable quick sign-in with Google.
            </p>
            <Button
              color="primary"
              size="sm"
              onClick={handleLinkGoogle}
              disabled={linking}
            >
              {linking ? (
                <>
                  <Spinner size="sm" className="me-2" />
                  Linking...
                </>
              ) : (
                'Link Google Account'
              )}
            </Button>
          </div>
        )}

        {/* Unlink Google Account Section */}
        {(user.has_google_account || user.account_type === 'google' || user.account_type === 'unified') && (
          <div className="mb-3 p-3 border rounded bg-light">
            <h6>Remove Google Sign-In</h6>
            <p className="small text-muted mb-2">
              Unlink your Google account. You'll only be able to sign in with your password.
            </p>
            <Button
              color="outline-danger"
              size="sm"
              onClick={handleUnlinkGoogle}
              disabled={unlinking}
            >
              {unlinking ? (
                <>
                  <Spinner size="sm" className="me-2" />
                  Unlinking...
                </>
              ) : (
                'Unlink Google Account'
              )}
            </Button>
          </div>
        )}

        {/* Account Security Info */}
        <div className="mt-3 p-3 border rounded bg-light">
          <h6>Security Information</h6>
          <ul className="small text-muted mb-0">
            <li>Your email address is your unique identifier</li>
            <li>You can have multiple sign-in methods for the same account</li>
            <li>Unlinking Google doesn't delete your account</li>
            <li>You can always relink your Google account later</li>
          </ul>
        </div>
      </CardBody>
    </Card>
  );
};

export default AccountLinkingManager;
