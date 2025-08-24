import React, { useState } from 'react';
import {
  Modal,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Button,
  Form,
  FormGroup,
  Label,
  Input,
  Alert,
  Spinner
} from 'reactstrap';
import ApiService from '../services/api';

const ChangePasswordModal = ({ isOpen, toggle, onSuccess, onCancel }) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [formData, setFormData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  
  const [passwordVisibility, setPasswordVisibility] = useState({
    currentPassword: false,
    newPassword: false,
    confirmPassword: false
  });

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const togglePasswordVisibility = (fieldName) => {
    setPasswordVisibility(prev => ({
      ...prev,
      [fieldName]: !prev[fieldName]
    }));
  };

  const validateForm = () => {
    // Clear any previous errors
    setError('');
    
    if (!formData.currentPassword.trim()) {
      setError('❌ Current password is required');
      return false;
    }
    if (!formData.newPassword.trim()) {
      setError('❌ New password is required');
      return false;
    }
    if (formData.newPassword.length < 8) {
      setError('❌ New password must be at least 8 characters long');
      return false;
    }
    if (formData.newPassword !== formData.confirmPassword) {
      setError('❌ New passwords do not match');
      return false;
    }
    if (formData.currentPassword === formData.newPassword) {
      setError('❌ New password must be different from current password');
      return false;
    }
    
    // Additional password strength validation
    const hasLetter = /[a-zA-Z]/.test(formData.newPassword);
    const hasNumber = /\d/.test(formData.newPassword);
    const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(formData.newPassword);
    
    if (!hasLetter || !hasNumber) {
      setError('❌ New password must contain both letters and numbers');
      return false;
    }
    
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setLoading(true);
    setError('');

    try {
      // Call the real API to change password
      const response = await ApiService.changePassword(formData.currentPassword, formData.newPassword, formData.confirmPassword);
      
      if (response.success) {
        setSuccess(response.message || 'Password changed successfully!');
        
        // Clear form
        setFormData({
          currentPassword: '',
          newPassword: '',
          confirmPassword: ''
        });
        
        // Close modal after 2 seconds
        setTimeout(() => {
          onSuccess && onSuccess();
          toggle();
        }, 2000);
      } else {
        // Handle specific error cases
        if (response.message === 'Current password is incorrect') {
          setError('❌ Current password is incorrect. Please try again.');
        } else {
          setError(response.message || 'Failed to change password. Please try again.');
        }
      }
      
    } catch (error) {
      setError('Failed to change password. Please try again.');
      console.error('Error changing password:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    setError('');
    setSuccess('');
    setFormData({
      currentPassword: '',
      newPassword: '',
      confirmPassword: ''
    });
    setPasswordVisibility({
      currentPassword: false,
      newPassword: false,
      confirmPassword: false
    });
    onCancel && onCancel();
    toggle();
  };

  return (
    <Modal isOpen={isOpen} toggle={toggle} size="md">
      <ModalHeader toggle={toggle}>
        <i className="ni ni-key-25 mr-2"></i>
        Change Password
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

        <div className="mb-4">
          <p className="text-muted">
            To change your password, please enter your current password and choose a new one.
          </p>
        </div>

        <Form onSubmit={handleSubmit}>
                     <FormGroup>
             <Label for="currentPassword">
               <i className="ni ni-lock-circle mr-2"></i>
               Current Password
             </Label>
             <div className="position-relative">
               <Input
                 id="currentPassword"
                 name="currentPassword"
                 type={passwordVisibility.currentPassword ? "text" : "password"}
                 placeholder="Enter your current password"
                 value={formData.currentPassword}
                 onChange={handleInputChange}
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
                    onClick={() => togglePasswordVisibility('currentPassword')}
                    disabled={loading}
                  >
                    {passwordVisibility.currentPassword ? (
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

                     <FormGroup>
             <Label for="newPassword">
               <i className="ni ni-key-25 mr-2"></i>
               New Password
             </Label>
             <div className="position-relative">
               <Input
                 id="newPassword"
                 name="newPassword"
                 type={passwordVisibility.newPassword ? "text" : "password"}
                 placeholder="Enter your new password"
                 value={formData.newPassword}
                 onChange={handleInputChange}
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
                    onClick={() => togglePasswordVisibility('newPassword')}
                    disabled={loading}
                  >
                    {passwordVisibility.newPassword ? (
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
             <small className="text-muted">
               Password must be at least 8 characters long
             </small>
           </FormGroup>

                     <FormGroup>
             <Label for="confirmPassword">
               <i className="ni ni-check-bold mr-2"></i>
               Confirm New Password
             </Label>
             <div className="position-relative">
               <Input
                 id="confirmPassword"
                 name="confirmPassword"
                 type={passwordVisibility.confirmPassword ? "text" : "password"}
                 placeholder="Confirm your new password"
                 value={formData.confirmPassword}
                 onChange={handleInputChange}
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
                    onClick={() => togglePasswordVisibility('confirmPassword')}
                    disabled={loading}
                  >
                    {passwordVisibility.confirmPassword ? (
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

          <Alert color="info" className="mt-3">
            <i className="ni ni-bell-55 mr-2"></i>
            <strong>Password Requirements:</strong>
            <ul className="mb-0 mt-2">
              <li>At least 8 characters long</li>
              <li>Must contain both letters and numbers</li>
              <li>Must be different from current password</li>
              <li>Consider using special characters for extra security</li>
            </ul>
          </Alert>
        </Form>
      </ModalBody>
      
      <ModalFooter>
        <Button color="secondary" onClick={handleCancel} disabled={loading}>
          Cancel
        </Button>
        <Button 
          color="primary" 
          onClick={handleSubmit}
          disabled={loading}
        >
          {loading ? (
            <>
              <Spinner size="sm" className="mr-2" />
              Changing Password...
            </>
          ) : (
            <>
              <i className="ni ni-key-25 mr-2"></i>
              Change Password
            </>
          )}
        </Button>
      </ModalFooter>
    </Modal>
  );
};

export default ChangePasswordModal;
