import React, { useState, useEffect } from 'react';
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
  Row,
  Col,
  Card,
  CardBody,
  CardHeader,
  Badge,
  Spinner,
  Progress
} from 'reactstrap';
import ApiService from '../services/api';

const TwoFactorAuth = ({ isOpen, toggle, onSuccess, onCancel }) => {
  const [currentStep, setCurrentStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  
  // Step 1: QR Code & Manual Entry (generate immediately)
  const [qrCodeData, setQrCodeData] = useState({
    qrCode: '',
    secretKey: '',
    manualEntry: ''
  });
  
  // Store secret key for verification
  const [storedSecret, setStoredSecret] = useState('');
  
  // Step 2: Verification
  const [verificationCode, setVerificationCode] = useState('');
  const [codeExpiry, setCodeExpiry] = useState(null);
  const [timeLeft, setTimeLeft] = useState(0);
  
  // Step 3: Backup Codes
  const [backupCodes, setBackupCodes] = useState([]);
  const [codesConfirmed, setCodesConfirmed] = useState(false);

  useEffect(() => {
    // Generate QR code and backup codes immediately when modal opens
    if (isOpen && currentStep === 1) {
      generate2FASetup();
    }
  }, [isOpen, currentStep]);

  useEffect(() => {
    let timer;
    if (codeExpiry && timeLeft > 0) {
      timer = setTimeout(() => {
        setTimeLeft(timeLeft - 1);
      }, 1000);
    } else if (timeLeft === 0 && codeExpiry) {
      setError('Verification code has expired. Please request a new one.');
    }
    return () => clearTimeout(timer);
  }, [timeLeft, codeExpiry]);

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const generate2FASetup = async () => {
    setLoading(true);
    setError('');

    try {
      const response = await ApiService.enable2FA();
      
      if (response.success) {
        setQrCodeData({
          qrCode: response.data.qr_code || '',
          secretKey: response.data.secret_key || '',
          manualEntry: response.data.manual_entry || ''
        });
        // Store the secret key for verification
        setStoredSecret(response.data.secret_key || '');
        // Use the actual backup codes from backend
        setBackupCodes(response.data.backup_codes || []);
        setSuccess('2FA setup ready! Scan the QR code with your authenticator app.');
      } else {
        setError(response.message || 'Failed to generate 2FA setup');
      }
    } catch (error) {
      console.error('🔐 TwoFactorAuth: Error in generate2FASetup:', error);
      setError(error.message || 'An error occurred while generating 2FA setup');
    } finally {
      setLoading(false);
    }
  };

  const handleVerification = async () => {
    if (!verificationCode.trim()) {
      setError('Please enter the verification code');
      return;
    }

    if (!storedSecret) {
      setError('Secret key not found. Please restart the setup process.');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const response = await ApiService.validate2FACode(verificationCode, storedSecret);
      
      if (response.success) {
        // 2FA is now enabled! Move to backup codes step
        setCurrentStep(3);
        setSuccess('Verification successful! 2FA is now enabled. Please save your backup codes.');
      } else {
        setError(response.message || 'Invalid verification code');
      }
    } catch (error) {
      console.error('🔐 TwoFactorAuth: Error in handleVerification:', error);
      setError(error.message || 'An error occurred while verifying the code');
    } finally {
      setLoading(false);
    }
  };

  const handleComplete = async () => {
    if (!codesConfirmed) {
      setError('Please confirm that you have saved your backup codes');
      return;
    }

    // 2FA is already enabled from the verification step
    // Just show success and close the modal
    setSuccess('Two-Factor Authentication setup completed successfully!');
    
    setTimeout(() => {
      if (onSuccess) {
        onSuccess(); // This will refresh the 2FA status
      }
      toggle();
    }, 2000);
  };

  const handleResendCode = async () => {
    setLoading(true);
    setError('');

    try {
      const response = await ApiService.resend2FACode();
      
      if (response.success) {
        setCodeExpiry(new Date(Date.now() + 5 * 60 * 1000));
        setTimeLeft(300);
        setVerificationCode('');
        setSuccess('New verification code sent successfully!');
      } else {
        setError(response.message || 'Failed to resend verification code');
      }
    } catch (error) {
      setError(error.message || 'An error occurred while resending the code');
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    setCurrentStep(1);
    setQrCodeData({ qrCode: '', secretKey: '', manualEntry: '' });
    setStoredSecret('');
    setVerificationCode('');
    setBackupCodes([]);
    setCodesConfirmed(false);
    setError('');
    setSuccess('');
    setCodeExpiry(null);
    setTimeLeft(0);
    onCancel && onCancel();
    toggle();
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    setSuccess('Copied to clipboard!');
    setTimeout(() => setSuccess(''), 2000);
  };

  const generateQRCode = (otpauthUrl) => {
    if (!otpauthUrl) {
      return '';
    }
    
    try {
      const encodedUrl = encodeURIComponent(otpauthUrl);
      
      // Use QR Server API for reliable QR code generation
      return `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodedUrl}&format=png`;
    } catch (error) {
      console.error('🔐 generateQRCode: Error generating QR code:', error);
      return '';
    }
  };

  const renderStep1 = () => (
    <div>
      <div className="text-center mb-4">
        <i className="ni ni-lock-circle-open text-primary" style={{ fontSize: '4rem' }}></i>
        <h4 className="mt-3">🔐 Enable Two-Factor Authentication</h4>
        <p className="text-muted">
          Add an extra layer of security to your account
        </p>
      </div>
      
      <div className="mb-4">
        <h6>Security Benefits:</h6>
        <ul className="text-muted">
          <li>Protection against unauthorized access</li>
          <li>Secure login even if password is compromised</li>
          <li>Industry-standard security practice</li>
          <li>Peace of mind for your account</li>
        </ul>
      </div>

      {loading ? (
        <div className="text-center py-4">
          <Spinner color="primary" />
          <p className="mt-2 text-muted">Generating 2FA setup...</p>
        </div>
      ) : (
        <div>
          <h5 className="mb-4">📱 Setup Your Authenticator App</h5>
          <p className="text-muted mb-4">
            Scan the QR code with your authenticator app (Google Authenticator, Authy, etc.) 
            or manually enter the secret key.
          </p>
          
          <Row>
            <Col md="6">
              <Card>
                <CardHeader>
                  <h6 className="mb-0">
                    <i className="ni ni-camera-compact mr-2"></i>
                    Scan QR Code
                  </h6>
                </CardHeader>
                <CardBody className="text-center">
                  {qrCodeData.qrCode ? (
                    <div>
                      <img 
                        src={generateQRCode(qrCodeData.qrCode)} 
                        alt="QR Code for 2FA Setup" 
                        className="img-fluid mb-3"
                        style={{ maxWidth: '200px' }}
                        onError={(e) => {
                          console.error('🔐 QR Code image failed to load');
                          // Try fallback Google Charts API
                          const fallbackUrl = `https://chart.googleapis.com/chart?chs=200x200&chld=M|0&cht=qr&chl=${encodeURIComponent(qrCodeData.qrCode)}`;
                          e.target.src = fallbackUrl;
                          e.target.onerror = null; // Prevent infinite loop
                        }}
                      />
                      
                      <Button 
                        color="link" 
                        size="sm"
                        onClick={() => copyToClipboard(qrCodeData.qrCode)}
                      >
                        <i className="ni ni-single-copy-04 mr-1"></i>
                        Copy OTPAuth URL
                      </Button>
                      
                      <div className="mt-2">
                        <small className="text-muted">
                          If QR code doesn't appear, use the manual entry below
                        </small>
                      </div>
                      
                      {/* Continue Button */}
                      <div className="mt-3">
                        <Button 
                          color="primary" 
                          size="lg"
                          onClick={() => setCurrentStep(2)}
                          block
                        >
                          <i className="ni ni-check-bold mr-2"></i>
                          Continue to Verification
                        </Button>
                        <small className="text-muted d-block mt-2">
                          After scanning the QR code with your authenticator app, click here to continue
                        </small>
                      </div>
                    </div>
                  ) : (
                    <div className="text-muted">
                      <i className="ni ni-camera-compact" style={{ fontSize: '3rem' }}></i>
                      <p className="mt-2">QR Code not available</p>
                    </div>
                  )}
                </CardBody>
              </Card>
            </Col>
            
            <Col md="6">
              <Card>
                <CardHeader>
                  <h6 className="mb-0">
                    <i className="ni ni-key-25 mr-2"></i>
                    Manual Entry
                  </h6>
                </CardHeader>
                <CardBody>
                  <FormGroup>
                    <Label>Secret Key</Label>
                    <div className="input-group">
                      <Input
                        type="text"
                        value={qrCodeData.secretKey}
                        readOnly
                        className="font-monospace"
                      />
                      <div className="input-group-append">
                        <Button 
                          color="outline-secondary" 
                          onClick={() => copyToClipboard(qrCodeData.secretKey)}
                        >
                          <i className="ni ni-single-copy-04"></i>
                        </Button>
                      </div>
                    </div>
                    <small className="form-text text-muted">
                      Enter this key manually in your authenticator app if QR scanning doesn't work
                    </small>
                  </FormGroup>
                </CardBody>
              </Card>
            </Col>
          </Row>
          
          <Alert color="warning" className="mt-3">
            <i className="ni ni-bell-55 mr-2"></i>
            <strong>Important:</strong> Keep your authenticator app secure and don't share the secret key with anyone.
          </Alert>
          
          {qrCodeData.instructions && (
            <Card className="mt-3">
              <CardHeader>
                <h6 className="mb-0">
                  <i className="ni ni-bell-55 mr-2"></i>
                  Setup Instructions
                </h6>
              </CardHeader>
              <CardBody>
                <ol className="mb-0">
                  {qrCodeData.instructions.map((instruction, index) => (
                    <li key={index} className="mb-2">{instruction}</li>
                  ))}
                </ol>
              </CardBody>
            </Card>
          )}
        </div>
      )}
    </div>
  );

  const renderStep2 = () => (
    <div>
      <h5 className="mb-4">✅ Verify Your Setup</h5>
      <p className="text-muted mb-4">
        Enter the 6-digit code from your authenticator app to verify the setup.
      </p>
      
      {timeLeft > 0 && (
        <Alert color={timeLeft < 60 ? 'warning' : 'info'} className="mb-3">
          <i className="ni ni-time-alarm mr-2"></i>
          Code expires in: <strong>{formatTime(timeLeft)}</strong>
        </Alert>
      )}
      
      <Row className="justify-content-center">
        <Col md="6">
          <Card>
            <CardBody>
              <FormGroup>
                <Label for="verificationCode">6-Digit Verification Code</Label>
                <Input
                  id="verificationCode"
                  type="text"
                  value={verificationCode}
                  onChange={(e) => setVerificationCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                  placeholder="Enter 6-digit code"
                  maxLength="6"
                  className="text-center font-monospace"
                  style={{ fontSize: '1.5rem', letterSpacing: '0.5rem' }}
                />
                <small className="form-text text-muted">
                  Enter the code from your authenticator app
                </small>
              </FormGroup>
              
              <Button 
                color="primary" 
                onClick={handleVerification}
                disabled={loading || !verificationCode.trim()}
                block
                size="lg"
              >
                {loading ? <Spinner size="sm" /> : 'Verify & Continue'}
              </Button>
              
              <div className="mt-3 text-center">
                <Button 
                  color="link" 
                  onClick={handleResendCode}
                  disabled={loading || timeLeft > 60}
                  size="sm"
                >
                  <i className="ni ni-refresh mr-1"></i>
                  Resend Code
                </Button>
              </div>
            </CardBody>
          </Card>
        </Col>
      </Row>
    </div>
  );

  const renderStep3 = () => (
    <div>
      <h5 className="mb-4">📋 Save Your Backup Codes</h5>
      <p className="text-muted mb-4">
        These backup codes can be used to access your account if you lose your authenticator device. 
        Save them securely - they won't be shown again!
      </p>
      
      <Alert color="warning" className="mb-4">
        <i className="ni ni-bell-55 mr-2"></i>
        <strong>⚠️ Warning:</strong> Save these codes securely - they won't be shown again!
      </Alert>
      
      <Row className="justify-content-center">
        <Col md="8">
          <Card>
            <CardHeader>
              <h6 className="mb-0">
                <i className="ni ni-single-copy-04 mr-2"></i>
                Backup Codes
              </h6>
            </CardHeader>
            <CardBody>
              <div className="row">
                {backupCodes.map((code, index) => (
                  <div key={index} className="col-3 mb-3">
                    <div className="p-3 bg-light rounded text-center font-monospace">
                      <strong>{code}</strong>
                    </div>
                  </div>
                ))}
              </div>
              
              <div className="mt-3 text-center">
                <Button 
                  color="outline-primary" 
                  onClick={() => copyToClipboard(backupCodes.join('\n'))}
                  className="mr-2"
                >
                  <i className="ni ni-single-copy-04 mr-1"></i>
                  Copy All Codes
                </Button>
                <Button 
                  color="outline-secondary"
                  onClick={() => window.print()}
                >
                  <i className="ni ni-printer mr-1"></i>
                  Print Codes
                </Button>
              </div>
            </CardBody>
          </Card>
          
          <div className="mt-4">
            <FormGroup check>
              <Label check>
                <Input
                  type="checkbox"
                  checked={codesConfirmed}
                  onChange={(e) => setCodesConfirmed(e.target.checked)}
                />
                <strong>I have saved my backup codes securely</strong>
              </Label>
            </FormGroup>
          </div>
        </Col>
      </Row>
    </div>
  );

  const renderStepIndicator = () => (
    <div className="mb-4">
      <Progress value={(currentStep / 3) * 100} className="mb-3" />
      <div className="d-flex justify-content-between">
        {[
          { id: 1, title: 'Setup App', icon: 'ni ni-camera-compact' },
          { id: 2, title: 'Verify', icon: 'ni ni-check-bold' },
          { id: 3, title: 'Backup Codes', icon: 'ni ni-single-copy-04' }
        ].map((step) => (
          <div
            key={step.id}
            className={`text-center ${currentStep >= step.id ? 'text-primary' : 'text-muted'}`}
            style={{ flex: 1 }}
          >
            <div className={`rounded-circle d-inline-flex align-items-center justify-content-center ${
              currentStep >= step.id ? 'bg-primary text-white' : 'bg-light text-muted'
            }`}
            style={{ width: '35px', height: '35px', fontSize: '16px' }}>
              <i className={step.icon}></i>
            </div>
            <div className="mt-1" style={{ fontSize: '12px' }}>
              {step.title}
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  return (
    <Modal isOpen={isOpen} toggle={toggle} size="lg">
      <ModalHeader toggle={toggle}>
        <i className="ni ni-lock-circle-open mr-2"></i>
        Two-Factor Authentication Setup
      </ModalHeader>
      <ModalBody>
        {renderStepIndicator()}
        
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
        
        {currentStep === 1 && renderStep1()}
        {currentStep === 2 && renderStep2()}
        {currentStep === 3 && renderStep3()}
      </ModalBody>
      <ModalFooter>
        <Button color="secondary" onClick={handleCancel}>
          Cancel
        </Button>
        {currentStep === 1 && (
          <Button color="primary" onClick={() => setCurrentStep(2)}>
            <i className="ni ni-check-bold mr-2"></i>
            Next: Verify Code
          </Button>
        )}
        {currentStep === 3 && (
          <Button color="success" onClick={handleComplete} disabled={loading || !codesConfirmed}>
            {loading ? <Spinner size="sm" /> : 'Complete Setup'}
          </Button>
        )}
      </ModalFooter>
    </Modal>
  );
};

export default TwoFactorAuth;
