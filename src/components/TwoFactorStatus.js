import React, { useState, useEffect } from 'react';
import {
  Card,
  CardBody,
  CardHeader,
  Button,
  Badge,
  Alert,
  Row,
  Col,
  Spinner
} from 'reactstrap';
import ApiService from '../services/api';
import TwoFactorAuth from './TwoFactorAuth';
import Disable2FAModal from './Disable2FAModal';

const TwoFactorStatus = () => {
  const [loading, setLoading] = useState(true);
  const [twoFAEnabled, setTwoFAEnabled] = useState(false);
  const [twoFAInfo, setTwoFAInfo] = useState({
    method: '',
    lastUsed: '',
    backupCodesRemaining: 0
  });
  const [error, setError] = useState('');
  const [showEnableModal, setShowEnableModal] = useState(false);
  const [showDisableModal, setShowDisableModal] = useState(false);

  useEffect(() => {
    console.log('🔐 TwoFactorStatus: Component mounted');
    console.log('🔐 TwoFactorStatus: ApiService imported:', ApiService);
    console.log('🔐 TwoFactorStatus: ApiService methods:', Object.getOwnPropertyNames(ApiService));
    console.log('🔐 TwoFactorStatus: ApiService prototype methods:', Object.getOwnPropertyNames(Object.getPrototypeOf(ApiService)));
    
    load2FAStatus();
  }, []);

  const load2FAStatus = async () => {
    console.log('🔐 TwoFactorStatus: load2FAStatus called');
    try {
      setLoading(true);
      console.log('🔐 TwoFactorStatus: About to call ApiService.get2FAStatus()');
      console.log('🔐 TwoFactorStatus: ApiService object:', ApiService);
      console.log('🔐 TwoFactorStatus: get2FAStatus method:', typeof ApiService.get2FAStatus);
      
      // Check if the method exists
      if (typeof ApiService.get2FAStatus !== 'function') {
        throw new Error('get2FAStatus method not found on ApiService');
      }
      
      const response = await ApiService.get2FAStatus();
      console.log('🔐 TwoFactorStatus: Response received:', response);
      
      if (response.success) {
        setTwoFAEnabled(response.data.is_enabled || false);
        setTwoFAInfo({
          method: 'Authenticator App (TOTP)',
          lastUsed: 'Never',
          backupCodesRemaining: 8
        });
      } else {
        setError(response.message || 'Failed to load 2FA status');
      }
    } catch (error) {
      console.error('🔐 TwoFactorStatus: Error in load2FAStatus:', error);
      setError('An error occurred while loading 2FA status');
    } finally {
      setLoading(false);
    }
  };

  const handle2FAEnabled = () => {
    setTwoFAEnabled(true);
    load2FAStatus(); // Refresh status
  };

  const handle2FADisabled = () => {
    setTwoFAEnabled(false);
    load2FAStatus(); // Refresh status
  };

  const getSecurityLevel = () => {
    if (twoFAEnabled) {
      return { level: 'Enhanced', color: 'success', icon: '🔐' };
    }
    return { level: 'Basic', color: 'warning', icon: '⚠️' };
  };

  const getStatusBadge = () => {
    if (twoFAEnabled) {
      return <Badge color="success" className="px-3 py-2">Enabled</Badge>;
    }
    return <Badge color="secondary" className="px-3 py-2">Disabled</Badge>;
  };

  if (loading) {
    return (
      <Card>
        <CardBody className="text-center py-5">
          <Spinner color="primary" />
          <p className="mt-2 text-muted">Loading 2FA status...</p>
        </CardBody>
      </Card>
    );
  }

  const securityLevel = getSecurityLevel();

  return (
    <>
      <Card className="mb-4">
        <CardHeader>
          <h5 className="mb-0">
            <i className="ni ni-lock-circle-open mr-2"></i>
            Two-Factor Authentication Status
          </h5>
        </CardHeader>
        <CardBody>
          {error && (
            <Alert color="danger" className="mb-3">
              <i className="ni ni-bell-55 mr-2"></i>
              {error}
            </Alert>
          )}

          <Row className="align-items-center mb-4">
            <Col md="8">
              <div className="d-flex align-items-center mb-2">
                <span className="mr-2" style={{ fontSize: '1.5rem' }}>
                  {securityLevel.icon}
                </span>
                <div>
                  <h6 className="mb-0">Security Level: {securityLevel.level}</h6>
                  <small className="text-muted">
                    {twoFAEnabled 
                      ? 'Your account is protected with two-factor authentication'
                      : 'Enable 2FA to add an extra layer of security'
                    }
                  </small>
                </div>
              </div>
            </Col>
            <Col md="4" className="text-md-right">
              {getStatusBadge()}
            </Col>
          </Row>

          {twoFAEnabled ? (
            <div>
              <Row className="mb-3">
                <Col md="4">
                  <div className="text-center p-3 bg-light rounded">
                    <i className="ni ni-mobile-button text-primary" style={{ fontSize: '2rem' }}></i>
                    <h6 className="mt-2 mb-1">Method</h6>
                    <p className="mb-0 text-muted">{twoFAInfo.method}</p>
                  </div>
                </Col>
                <Col md="4">
                  <div className="text-center p-3 bg-light rounded">
                    <i className="ni ni-time-alarm text-info" style={{ fontSize: '2rem' }}></i>
                    <h6 className="mt-2 mb-1">Last Used</h6>
                    <p className="mb-0 text-muted">{twoFAInfo.lastUsed}</p>
                  </div>
                </Col>
                <Col md="4">
                  <div className="text-center p-3 bg-light rounded">
                    <i className="ni ni-single-copy-04 text-warning" style={{ fontSize: '2rem' }}></i>
                    <h6 className="mt-2 mb-1">Backup Codes</h6>
                    <p className="mb-0 text-muted">{twoFAInfo.backupCodesRemaining} remaining</p>
                  </div>
                </Col>
              </Row>

              <Alert color="success" className="mb-3">
                <i className="ni ni-check-bold mr-2"></i>
                <strong>2FA is Active!</strong> Your account is now protected with two-factor authentication. 
                You'll need to enter a verification code each time you log in.
              </Alert>

              <div className="d-flex flex-wrap gap-2">
                <Button 
                  color="outline-primary" 
                  onClick={() => setShowDisableModal(true)}
                >
                  <i className="ni ni-lock-circle-open mr-2"></i>
                  Disable 2FA
                </Button>
                <Button 
                  color="outline-info"
                  onClick={() => window.open('/help/2fa', '_blank')}
                >
                  <i className="ni ni-bell-55 mr-2"></i>
                  Get Help
                </Button>
                <Button 
                  color="outline-secondary"
                  onClick={() => window.open('/settings/backup-codes', '_blank')}
                >
                  <i className="ni ni-single-copy-04 mr-2"></i>
                  Manage Backup Codes
                </Button>
              </div>
            </div>
          ) : (
            <div>
              <Alert color="warning" className="mb-3">
                <i className="ni ni-bell-55 mr-2"></i>
                <strong>2FA is Disabled</strong> Your account is currently protected only by your password. 
                Enable two-factor authentication for enhanced security.
              </Alert>

              <div className="text-center">
                <Button 
                  color="primary" 
                  size="lg"
                  onClick={() => setShowEnableModal(true)}
                  className="px-4 py-2"
                >
                  <i className="ni ni-lock-circle-open mr-2"></i>
                  🔐 Enable Two-Factor Authentication
                </Button>
                
                <p className="text-muted mt-3">
                  Add an extra layer of security to your account
                </p>
              </div>

              <div className="mt-4">
                <h6>Security Benefits:</h6>
                <Row>
                  <Col md="6">
                    <ul className="text-muted">
                      <li>Protection against unauthorized access</li>
                      <li>Secure login even if password is compromised</li>
                    </ul>
                  </Col>
                  <Col md="6">
                    <ul className="text-muted">
                      <li>Industry-standard security practice</li>
                      <li>Peace of mind for your account</li>
                    </ul>
                  </Col>
                </Row>
              </div>
            </div>
          )}
        </CardBody>
      </Card>

      {/* 2FA Enable Modal */}
      <TwoFactorAuth
        isOpen={showEnableModal}
        toggle={() => setShowEnableModal(!showEnableModal)}
        onSuccess={handle2FAEnabled}
        onCancel={() => setShowEnableModal(false)}
      />

      {/* 2FA Disable Modal */}
      <Disable2FAModal
        isOpen={showDisableModal}
        toggle={() => setShowDisableModal(!showDisableModal)}
        onSuccess={handle2FADisabled}
        onCancel={() => setShowDisableModal(false)}
      />
    </>
  );
};

export default TwoFactorStatus;
