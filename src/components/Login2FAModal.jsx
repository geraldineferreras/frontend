import React, { useState, useEffect } from 'react';
import { Modal, ModalHeader, ModalBody, ModalFooter, Button, FormGroup, Label, Input, Alert, Spinner } from 'reactstrap';
import ApiService from '../services/api';

const Login2FAModal = ({ isOpen, toggle, email, onVerificationSuccess, onCancel }) => {
  const [verificationCode, setVerificationCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [timeLeft, setTimeLeft] = useState(30);
  const [canResend, setCanResend] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setVerificationCode('');
      setError('');
      setTimeLeft(30);
      setCanResend(false);
    }
  }, [isOpen]);

  useEffect(() => {
    let timer;
    if (timeLeft > 0 && isOpen) {
      timer = setTimeout(() => setTimeLeft(timeLeft - 1), 1000);
    } else if (timeLeft === 0) {
      setCanResend(true);
    }
    return () => clearTimeout(timer);
  }, [timeLeft, isOpen]);

  const handleVerification = async () => {
    if (!verificationCode.trim()) {
      setError('Please enter the 6-digit verification code');
      return;
    }

    setLoading(true);
    setError('');

    try {
      console.log('🔐 Login2FAModal: Calling verify2FALogin with:', { email, code: verificationCode });
      const response = await ApiService.verify2FALogin(email, verificationCode);
      console.log('🔐 Login2FAModal: verify2FALogin response:', response);

      if (response.success) {
        console.log('🔐 Login2FAModal: 2FA verification successful');
        console.log('🔐 Login2FAModal: Calling onVerificationSuccess with:', response.data);
        onVerificationSuccess(response.data);
      } else {
        console.log('🔐 Login2FAModal: 2FA verification failed:', response.message);
        setError(response.message || 'Invalid verification code');
      }
    } catch (error) {
      console.error('🔐 Login2FAModal: Error in handleVerification:', error);
      setError(error.message || 'An error occurred during verification');
    } finally {
      setLoading(false);
    }
  };

  const handleResendCode = () => {
    // For TOTP-based 2FA, we don't actually resend codes
    // The user just needs to wait for the next 30-second window
    setTimeLeft(30);
    setCanResend(false);
    setError('');
  };

  const handleCancel = () => {
    setVerificationCode('');
    setError('');
    onCancel && onCancel();
    toggle();
  };

  return (
    <Modal isOpen={isOpen} toggle={toggle} size="md" backdrop="static" keyboard={false}>
      <ModalHeader toggle={toggle}>
        <i className="ni ni-lock-circle mr-2"></i>
        Two-Factor Authentication Required
      </ModalHeader>
      
      <ModalBody>
        <div className="text-center mb-4">
          <i className="ni ni-lock-circle text-primary" style={{ fontSize: '3rem' }}></i>
          <h5 className="mt-3">Enter Verification Code</h5>
          <p className="text-muted">
            Please enter the 6-digit code from your authenticator app to complete the login.
          </p>
        </div>

        {error && (
          <Alert color="danger" className="mb-3">
            <i className="ni ni-bell-55 mr-2"></i>
            {error}
          </Alert>
        )}

        <FormGroup>
          <Label for="verificationCode">
            <strong>6-Digit Verification Code</strong>
          </Label>
          <Input
            id="verificationCode"
            type="text"
            placeholder="Enter 6-digit code"
            value={verificationCode}
            onChange={(e) => setVerificationCode(e.target.value)}
            maxLength={6}
            pattern="[0-9]{6}"
            className="text-center"
            style={{ fontSize: '1.2rem', letterSpacing: '0.5rem' }}
            autoFocus
          />
          <small className="text-muted">
            Code refreshes every 30 seconds
          </small>
        </FormGroup>

        <div className="text-center">
          <div className="mb-2">
            <small className="text-muted">
              Time remaining: <span className="font-weight-bold">{timeLeft}s</span>
            </small>
          </div>
          
          {canResend && (
            <Button 
              color="link" 
              size="sm" 
              onClick={handleResendCode}
              className="p-0"
            >
              <i className="ni ni-refresh mr-1"></i>
              New code available
            </Button>
          )}
        </div>

        <Alert color="info" className="mt-3">
          <i className="ni ni-bell-55 mr-2"></i>
          <strong>Need help?</strong> If you can't access your authenticator app, 
          you can use one of your backup codes to recover your account.
        </Alert>
      </ModalBody>

      <ModalFooter>
        <Button color="secondary" onClick={handleCancel} disabled={loading}>
          Cancel Login
        </Button>
        <Button 
          color="primary" 
          onClick={handleVerification}
          disabled={loading || !verificationCode.trim()}
        >
          {loading ? (
            <>
              <Spinner size="sm" className="mr-2" />
              Verifying...
            </>
          ) : (
            <>
              <i className="ni ni-check-bold mr-2"></i>
              Verify & Login
            </>
          )}
        </Button>
      </ModalFooter>
    </Modal>
  );
};

export default Login2FAModal;
