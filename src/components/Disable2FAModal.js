import React, { useState } from 'react';
import {
  Modal,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Button,
  Alert,
  Spinner,
  FormGroup,
  Label,
  Input
} from 'reactstrap';
import ApiService from '../services/api';

const Disable2FAModal = ({ isOpen, toggle, onSuccess, onCancel }) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [verificationCode, setVerificationCode] = useState('');

  const handleDisable2FA = async () => {
    if (!verificationCode.trim()) {
      setError('Please enter your verification code');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const response = await ApiService.disable2FA(verificationCode);
      
      if (response.success) {
        setSuccess('Two-Factor Authentication has been disabled successfully.');
        setTimeout(() => {
          onSuccess && onSuccess();
          toggle();
        }, 2000);
      } else {
        setError(response.message || 'Failed to disable 2FA');
      }
    } catch (error) {
      setError(error.message || 'An error occurred while disabling 2FA');
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    setError('');
    setSuccess('');
    setVerificationCode('');
    onCancel && onCancel();
    toggle();
  };

  return (
    <Modal isOpen={isOpen} toggle={toggle} size="md">
      <ModalHeader toggle={toggle}>
        <i className="ni ni-lock-circle-open mr-2"></i>
        Disable Two-Factor Authentication
      </ModalHeader>
      <ModalBody>
        {error && (
          <Alert color="danger" className="mb-3">
            <i className="ni ni-bell-55 mr-2"></i>
            {error}
          </Alert>
        )}
        
        {success && (
          <Alert color="success" className="mb-3">
            <i className="ni ni-check-bold mr-2"></i>
            {success}
          </Alert>
        )}
        
        <div className="text-center mb-4">
          <i className="ni ni-lock-circle-open text-warning" style={{ fontSize: '4rem' }}></i>
          <h5 className="mt-3">Are you sure you want to disable 2FA?</h5>
          <p className="text-muted">
            Disabling Two-Factor Authentication will remove the additional security layer from your account. 
            You will no longer receive verification codes when logging in.
          </p>
          <Alert color="warning">
            <i className="ni ni-bell-55 mr-2"></i>
            <strong>Security Warning:</strong> This action will make your account less secure.
          </Alert>
        </div>

        <FormGroup>
          <Label for="verificationCode">
            <i className="ni ni-key-25 mr-2"></i>
            Enter your 6-digit verification code
          </Label>
          <Input
            id="verificationCode"
            type="text"
            placeholder="123456"
            value={verificationCode}
            onChange={(e) => setVerificationCode(e.target.value)}
            maxLength={6}
            disabled={loading}
          />
          <small className="text-muted">
            Enter the 6-digit code from your authenticator app to confirm this action.
          </small>
        </FormGroup>
      </ModalBody>
      <ModalFooter>
        <Button color="secondary" onClick={handleCancel} disabled={loading}>
          Cancel
        </Button>
        <Button 
          color="danger" 
          onClick={handleDisable2FA} 
          disabled={loading || !verificationCode.trim()}
        >
          {loading ? <Spinner size="sm" /> : 'Disable 2FA'}
        </Button>
      </ModalFooter>
    </Modal>
  );
};

export default Disable2FAModal;
