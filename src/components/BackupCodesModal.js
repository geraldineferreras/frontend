import React, { useState, useEffect } from 'react';
import {
  Modal,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Button,
  Alert,
  Row,
  Col,
  Card,
  CardBody,
  CardHeader,
  Spinner,
  FormGroup,
  Label,
  Input
} from 'reactstrap';
import ApiService from '../services/api';

const BackupCodesModal = ({ isOpen, toggle, onSuccess, onCancel }) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [backupCodes, setBackupCodes] = useState([]);
  const [showGenerateForm, setShowGenerateForm] = useState(false);
  const [verificationCode, setVerificationCode] = useState('');

  useEffect(() => {
    if (isOpen) {
      loadBackupCodes();
    }
  }, [isOpen]);

  const loadBackupCodes = async () => {
    setLoading(true);
    setError('');
    
    try {
      const response = await ApiService.getBackupCodes();
      if (response.success) {
        setBackupCodes(response.data.backup_codes || response.data || []);
        setError(''); // Clear any previous errors
      } else {
        setError(response.message || 'Failed to load backup codes');
        setBackupCodes([]);
      }
    } catch (error) {
      setError('Failed to load backup codes');
      setBackupCodes([]);
      console.error('Error loading backup codes:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleGenerateNewCodes = async () => {
    if (!verificationCode.trim()) {
      setError('Please enter your verification code');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const response = await ApiService.generateNewBackupCodes();
      if (response.success) {
        setBackupCodes(response.data.backup_codes || response.data || []);
        setSuccess('New backup codes generated successfully!');
        setShowGenerateForm(false);
        setVerificationCode('');
        setTimeout(() => setSuccess(''), 3000);
      } else {
        setError(response.message || 'Failed to generate new backup codes');
      }
    } catch (error) {
      setError('Failed to generate new backup codes');
      console.error('Error generating backup codes:', error);
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text).then(() => {
      setSuccess('Backup codes copied to clipboard!');
      setTimeout(() => setSuccess(''), 2000);
    }).catch(() => {
      setError('Failed to copy to clipboard');
    });
  };

  const handleCancel = () => {
    setError('');
    setSuccess('');
    setVerificationCode('');
    setShowGenerateForm(false);
    onCancel && onCancel();
    toggle();
  };

  return (
    <Modal isOpen={isOpen} toggle={toggle} size="lg">
      <ModalHeader toggle={toggle}>
        <i className="ni ni-single-copy-04 mr-2"></i>
        Manage Backup Codes
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
          <h6 className="text-muted mb-3">
            <i className="ni ni-bell-55 mr-2"></i>
            About Backup Codes
          </h6>
          <p className="text-muted">
            Backup codes are used to access your account if you lose your authenticator device. 
            Keep them secure and don't share them with anyone.
          </p>
        </div>

        {loading ? (
          <div className="text-center py-4">
            <Spinner size="lg" color="primary" />
            <p className="mt-2 text-muted">Loading backup codes...</p>
          </div>
        ) : (
          <>
            <Card className="mb-4">
              <CardHeader>
                <div className="d-flex justify-content-between align-items-center">
                  <h6 className="mb-0">
                    <i className="ni ni-single-copy-04 mr-2"></i>
                    Current Backup Codes ({backupCodes.length} remaining)
                  </h6>
                  <Button 
                    color="outline-primary" 
                    size="sm"
                    onClick={() => copyToClipboard(backupCodes.join('\n'))}
                  >
                    <i className="ni ni-single-copy-04 mr-1"></i>
                    Copy All
                  </Button>
                </div>
              </CardHeader>
              <CardBody>
                <Row>
                  {backupCodes.map((code, index) => (
                    <Col key={index} md="3" className="mb-3">
                                         <div className="p-3 rounded text-center font-monospace border" style={{ backgroundColor: 'rgb(248, 249, 250)' }}>
                     <strong>{code}</strong>
                   </div>
                    </Col>
                  ))}
                </Row>
                
                <div className="mt-3 text-center">
                  <Button 
                    color="outline-secondary"
                    onClick={() => window.print()}
                    className="mr-2"
                  >
                    <i className="ni ni-printer mr-1"></i>
                    Print Codes
                  </Button>
                  <Button 
                    color="outline-warning"
                    onClick={() => setShowGenerateForm(true)}
                  >
                    <i className="ni ni-refresh mr-1"></i>
                    Generate New Codes
                  </Button>
                </div>
              </CardBody>
            </Card>

            {showGenerateForm && (
              <Card className="border-warning">
                <CardHeader className="bg-warning text-white">
                  <h6 className="mb-0">
                    <i className="ni ni-bell-55 mr-2"></i>
                    Generate New Backup Codes
                  </h6>
                </CardHeader>
                <CardBody>
                  <Alert color="warning" className="mb-3">
                    <i className="ni ni-bell-55 mr-2"></i>
                    <strong>Warning:</strong> Generating new backup codes will invalidate all existing codes. 
                    Make sure you have access to your authenticator app before proceeding.
                  </Alert>
                  
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
                </CardBody>
              </Card>
            )}
          </>
        )}
      </ModalBody>
      
      <ModalFooter>
        <Button color="secondary" onClick={handleCancel}>
          Close
        </Button>
        {showGenerateForm && (
          <Button 
            color="warning" 
            onClick={handleGenerateNewCodes}
            disabled={loading || !verificationCode.trim()}
          >
            {loading ? <Spinner size="sm" /> : 'Generate New Codes'}
          </Button>
        )}
      </ModalFooter>
    </Modal>
  );
};

export default BackupCodesModal;
