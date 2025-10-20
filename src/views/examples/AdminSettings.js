import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import ApiService from '../../services/api';
import {
  Card,
  CardHeader,
  CardBody,
  FormGroup,
  Label,
  Input,
  Button,
  Row,
  Col,
  Alert,
  Nav,
  NavItem,
  NavLink,
  TabContent,
  TabPane,
  Badge,
  CustomInput
} from 'reactstrap';
import classnames from 'classnames';
import TwoFactorAuth from '../../components/TwoFactorAuth';
import Disable2FAModal from '../../components/Disable2FAModal';
import BackupCodesModal from '../../components/BackupCodesModal';
import ChangePasswordModal from '../../components/ChangePasswordModal';

const AdminSettings = () => {
  const { user, updateProfile } = useAuth();
  const [activeTab, setActiveTab] = useState('1');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });
  const [profileLoading, setProfileLoading] = useState(true);
  const [lastFetched, setLastFetched] = useState(null);
  
  // 2FA Modal states
  const [show2FAModal, setShow2FAModal] = useState(false);
  const [showDisable2FAModal, setShowDisable2FAModal] = useState(false);
  const [showBackupCodesModal, setShowBackupCodesModal] = useState(false);
  const [backupCodesCount, setBackupCodesCount] = useState(8);
  const [showChangePasswordModal, setShowChangePasswordModal] = useState(false);
  
  // Profile settings
  const [profileData, setProfileData] = useState({
    full_name: '',
    email: '',
    phone: '',
    department: '',
    role: 'admin'
  });

  // Security settings
  const [securitySettings, setSecuritySettings] = useState({
    twoFAEnabled: false,
    require2FAForAdmins: true,
    loginAttempts: 5,
    lockoutDuration: 15,
    passwordPolicy: {
      minLength: 8,
      requireUppercase: true,
      requireLowercase: true,
      requireNumbers: true,
      requireSpecialChars: true
    }
  });



  // Load 2FA status and backup codes count on component mount
  useEffect(() => {
    const load2FAStatus = async () => {
      try {
        const response = await ApiService.get2FAStatus();
        if (response.success) {
          setSecuritySettings(prev => ({
            ...prev,
            twoFAEnabled: response.data.is_enabled || false
          }));
        }
      } catch (error) {
        console.error('Failed to load 2FA status:', error);
      }
    };

    const loadBackupCodesCount = async () => {
      try {
        const response = await ApiService.getBackupCodes();
        if (response.success) {
          const count = response.data.count || response.data.remaining_codes || 8;
          setBackupCodesCount(count);
        }
      } catch (error) {
        console.error('Failed to load backup codes count:', error);
        setBackupCodesCount(8);
      }
    };

    const fetchUserProfile = async () => {
      if (!user) return;
      
      try {
        setProfileLoading(true);
        
        const response = await ApiService.getProfile();
        
        if (response && response.status && response.data) {
          const userData = response.data;
          
          // Update profile data with fetched information
          const newProfileData = {
            full_name: userData.full_name || '',
            email: userData.email || '',
            phone: userData.contact_num || userData.phone || userData.contactNumber || '',
            department: userData.program || userData.department || '',
            role: userData.role || 'admin'
          };
          
          setProfileData(newProfileData);
          setLastFetched(new Date());
        } else {
          // Fallback to auth context user data
          if (user) {
            const fallbackData = {
              full_name: user.full_name || user.name || '',
              email: user.email || '',
              phone: user.phone || user.contact_num || '',
              department: user.department || user.program || '',
              role: user.role || 'admin'
            };
            setProfileData(fallbackData);
          }
        }
      } catch (error) {
        // Fallback to auth context user data
        if (user) {
          const fallbackData = {
            full_name: user.full_name || user.name || '',
            email: user.email || '',
            phone: user.phone || user.contact_num || '',
            department: user.department || user.program || '',
            role: user.role || 'admin'
          };
          setProfileData(fallbackData);
        }
      } finally {
        setProfileLoading(false);
      }
    };
    
    fetchUserProfile();
    load2FAStatus();
    loadBackupCodesCount();
  }, [user]);

  const handle2FAToggle = (enabled) => {
    if (enabled) {
      setShow2FAModal(true);
    } else {
      setShowDisable2FAModal(true);
    }
  };

  const handle2FASuccess = () => {
    setSecuritySettings(prev => ({
      ...prev,
      twoFAEnabled: true
    }));
    setMessage({ type: 'success', text: 'Two-Factor Authentication enabled successfully!' });
  };

  const handle2FADisableSuccess = () => {
    setSecuritySettings(prev => ({
      ...prev,
      twoFAEnabled: false
    }));
    setMessage({ type: 'success', text: 'Two-Factor Authentication disabled successfully!' });
  };

  const toggleTab = (tab) => {
    if (activeTab !== tab) setActiveTab(tab);
  };

  const handleProfileUpdate = async () => {
    setLoading(true);
    setMessage({ type: '', text: '' });
    
    try {
      // Validate required user data
      if (!user.role) {
        throw new Error('User role is required but not available');
      }
      
      const userId = user.id || user.user_id || user.userId;
      if (!userId) {
        throw new Error('User ID is required but not available');
      }

      // Prepare data for backend update
      const updateData = {
        full_name: profileData.full_name,
        email: profileData.email,
        contact_num: profileData.phone,
        program: profileData.department,
        role: user.role,
        user_id: userId
      };

      const response = await ApiService.updateProfile(updateData);
      
      if (response.status) {
        await updateProfile(updateData);
        setMessage({ type: 'success', text: 'Profile updated successfully!' });
        setLastFetched(new Date());
      } else {
        setMessage({ type: 'danger', text: response.message || 'Failed to update profile' });
      }
    } catch (error) {
      setMessage({ type: 'danger', text: 'An error occurred while updating profile' });
    } finally {
      setLoading(false);
    }
  };

  const handleSecurityUpdate = async () => {
    setLoading(true);
    setMessage({ type: '', text: '' });
    
    try {
      setMessage({ type: 'success', text: 'Security settings updated successfully!' });
    } catch (error) {
      setMessage({ type: 'danger', text: error.message || 'An error occurred' });
    } finally {
      setLoading(false);
    }
  };



  if (!user) {
    return (
      <div className="text-center py-5">
        <div className="spinner-border text-primary" role="status">
          <span className="sr-only">Loading...</span>
        </div>
        <p className="mt-2">Loading settings...</p>
      </div>
    );
  }

  if (profileLoading) {
    return (
      <div className="text-center py-5">
        <div className="spinner-border text-primary" role="status">
          <span className="sr-only">Loading...</span>
        </div>
        <p className="mt-2">Loading profile information...</p>
      </div>
    );
  }

  return (
    <div className="px-4 py-5">
      <div className="row">
        <div className="col-12">
          <h1 className="h3 mb-4">Program Chairperson Settings</h1>
          
          {message.text && (
            <Alert color={message.type} className="mb-4">
              {message.text}
            </Alert>
          )}

          <Card>
            <CardBody>
              <Nav tabs>
                <NavItem>
                  <NavLink
                    className={classnames({ active: activeTab === '1' })}
                    onClick={() => toggleTab('1')}
                  >
                    <i className="ni ni-single-02 mr-2" />
                    Profile
                  </NavLink>
                </NavItem>
                <NavItem>
                  <NavLink
                    className={classnames({ active: activeTab === '2' })}
                    onClick={() => toggleTab('2')}
                  >
                    <i className="ni ni-lock-circle-open mr-2" />
                    Security
                  </NavLink>
                </NavItem>
              </Nav>

              <TabContent activeTab={activeTab} className="mt-4">
                {/* Profile Tab */}
                <TabPane tabId="1">
                  <Card className="shadow-lg border-0" style={{ borderRadius: '16px', overflow: 'hidden' }}>
                    <CardHeader className="bg-gradient-primary text-white border-0" style={{ background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' }}>
                      <div className="d-flex justify-content-between align-items-center">
                        <div>
                          <h5 className="mb-0 text-white font-weight-bold">
                            <i className="ni ni-single-02 mr-2"></i>
                            Profile Information
                          </h5>
                          <small className="text-white-50">
                            {user?.email && `Logged in as: ${user.email}`}
                            {lastFetched && (
                              <span className="ml-2">
                                • Last updated: {lastFetched.toLocaleTimeString()}
                              </span>
                            )}
                          </small>
                        </div>
                        <Button 
                          color="outline-light" 
                          size="sm"
                          className="border-white text-white"
                          style={{ 
                            borderRadius: '20px',
                            border: '1px solid rgba(255,255,255,0.3)',
                            background: 'rgba(255,255,255,0.1)',
                            backdropFilter: 'blur(10px)'
                          }}
                          onClick={async () => {
                            setProfileLoading(true);
                            try {
                              const response = await ApiService.getProfile();
                              if (response && response.status && response.data) {
                                const userData = response.data;
                                setProfileData({
                                  full_name: userData.full_name || '',
                                  email: userData.email || '',
                                  phone: userData.contact_num || userData.phone || userData.contactNumber || '',
                                  department: userData.program || userData.department || '',
                                  role: userData.role || 'admin'
                                });
                                setLastFetched(new Date());
                                setMessage({ type: 'success', text: 'Profile refreshed successfully!' });
                              }
                            } catch (error) {
                              setMessage({ type: 'danger', text: 'Failed to refresh profile' });
                            } finally {
                              setProfileLoading(false);
                            }
                          }}
                          disabled={profileLoading}
                        >
                          <i className="ni ni-refresh mr-1"></i>
                          {profileLoading ? <div className="spinner-border spinner-border-sm" role="status"><span className="sr-only">Loading...</span></div> : 'Refresh'}
                        </Button>
                      </div>
                    </CardHeader>
                    <CardBody className="p-4">
                      <div className="mb-3">
                        <h6 className="text-muted mb-2">
                          <i className="ni ni-single-02 mr-2"></i>
                          Personal Information
                        </h6>
                        <Row>
                          <Col md="6">
                            <div className="mb-2">
                              <Label for="fullName" className="font-weight-bold text-dark">Full Name</Label>
                              <Input
                                id="fullName"
                                type="text"
                                value={profileData.full_name}
                                onChange={(e) => setProfileData({...profileData, full_name: e.target.value})}
                                required
                                className="border-0"
                                style={{ 
                                  borderRadius: '12px',
                                  padding: '12px 16px',
                                  fontSize: '14px',
                                  border: '1px solid #e9ecef',
                                  color: '#333',
                                  backgroundColor: '#f8f9fa'
                                }}
                              />
                            </div>
                          </Col>
                          <Col md="6">
                            <div className="mb-2">
                              <Label for="email" className="font-weight-bold text-dark">Email Address</Label>
                              <Input
                                id="email"
                                type="email"
                                value={profileData.email}
                                onChange={(e) => setProfileData({...profileData, email: e.target.value})}
                                required
                                className="border-0"
                                style={{ 
                                  borderRadius: '12px',
                                  padding: '12px 16px',
                                  fontSize: '14px',
                                  border: '1px solid #e9ecef',
                                  color: '#333',
                                  backgroundColor: '#f8f9fa'
                                }}
                              />
                            </div>
                          </Col>
                        </Row>
                      </div>
                      
                      <div className="mb-3">
                        <h6 className="text-muted mb-2">
                          <i className="ni ni-email-83 mr-2"></i>
                          Contact Information
                        </h6>
                        <Row>
                          <Col md="6">
                            <div className="mb-2">
                              <Label for="phone" className="font-weight-bold text-dark">Phone Number</Label>
                              <Input
                                id="phone"
                                type="tel"
                                value={profileData.phone}
                                onChange={(e) => setProfileData({...profileData, phone: e.target.value})}
                                className="border-0"
                                style={{ 
                                  borderRadius: '12px',
                                  padding: '12px 16px',
                                  fontSize: '14px',
                                  border: '1px solid #e9ecef',
                                  color: '#333',
                                  backgroundColor: '#f8f9fa'
                                }}
                              />
                            </div>
                          </Col>
                          <Col md="6">
                            <div className="mb-2">
                              <Label for="department" className="font-weight-bold text-dark">Department</Label>
                              <Input
                                id="department"
                                type="text"
                                value={profileData.department}
                                onChange={(e) => setProfileData({...profileData, department: e.target.value})}
                                className="border-0"
                                style={{ 
                                  borderRadius: '12px',
                                  padding: '12px 16px',
                                  fontSize: '14px',
                                  border: '1px solid #e9ecef',
                                  color: '#333',
                                  backgroundColor: '#f8f9fa'
                                }}
                              />
                            </div>
                          </Col>
                        </Row>
                      </div>
                      
                      <div className="mb-3">
                        <h6 className="text-muted mb-2">
                          <i className="ni ni-badge mr-2"></i>
                          Role Information
                        </h6>
                        <Row>
                          <Col md="6">
                            <div className="mb-2">
                              <Label for="role" className="font-weight-bold text-dark">Role</Label>
                              <Input
                                id="role"
                                type="text"
                                value={profileData.role}
                                disabled
                                className="border-0"
                                style={{ 
                                  borderRadius: '12px',
                                  padding: '12px 16px',
                                  fontSize: '14px',
                                  border: '1px solid #e9ecef',
                                  color: '#6c757d',
                                  backgroundColor: '#e9ecef'
                                }}
                              />
                              <small className="form-text text-muted">
                                Program Chairperson role cannot be changed
                              </small>
                            </div>
                          </Col>
                        </Row>
                      </div>
                      
                      <div className="text-center pt-4 border-top">
                        <Button 
                          color="primary" 
                          size="lg"
                          onClick={handleProfileUpdate}
                          disabled={loading}
                          className="px-5 py-3"
                          style={{ 
                            borderRadius: '25px',
                            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                            border: 'none',
                            boxShadow: '0 4px 15px rgba(102, 126, 234, 0.4)'
                          }}
                        >
                          {loading ? (
                            <>
                              <div className="spinner-border spinner-border-sm mr-2" role="status">
                                <span className="sr-only">Loading...</span>
                              </div>
                              Updating...
                            </>
                          ) : (
                            <>
                              <i className="ni ni-check-bold mr-2"></i>
                              Update Profile
                            </>
                          )}
                        </Button>
                      </div>
                    </CardBody>
                  </Card>
                </TabPane>

                {/* Security Tab */}
                <TabPane tabId="2">
                  <Card className="shadow-lg border-0" style={{ borderRadius: '16px', overflow: 'hidden' }}>
                    <CardHeader className="bg-gradient-primary text-white border-0" style={{ background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' }}>
                      <h5 className="mb-0 text-white font-weight-bold">
                        <i className="ni ni-lock-circle-open mr-2"></i>
                        Security Settings
                      </h5>
                      <small className="text-white-50">Manage your account security and authentication</small>
                    </CardHeader>
                    <CardBody className="p-4">
                      <div className="mb-4">
                        <h6 className="text-muted mb-3">
                          <i className="ni ni-shield-check mr-2"></i>
                          Two-Factor Authentication
                        </h6>
                        <div className="p-3 border rounded-lg mb-3" style={{ backgroundColor: 'rgb(248, 249, 250)' }}>
                          <div className="d-flex align-items-center justify-content-between">
                            <div className="d-flex align-items-center">
                              <i className="ni ni-lock-circle-open text-success mr-3" style={{ fontSize: '1.5rem' }}></i>
                              <div>
                                <h6 className="mb-1 font-weight-bold">Security Level: {securitySettings.twoFAEnabled ? 'Enhanced' : 'Basic'}</h6>
                                <small className="text-muted">{securitySettings.twoFAEnabled ? 'Your account is protected with two-factor authentication' : 'Your account uses basic password authentication only'}</small>
                              </div>
                            </div>
                            <Badge color={securitySettings.twoFAEnabled ? "success" : "secondary"} className="px-3 py-2">
                              <i className={`ni ni-${securitySettings.twoFAEnabled ? 'check-bold' : 'fat-remove'} mr-1`}></i>
                              {securitySettings.twoFAEnabled ? 'ENABLED' : 'DISABLED'}
                            </Badge>
                          </div>
                        </div>
                        
                        <Row className="mb-3">
                          <Col md="4">
                            <div className="p-3 border rounded-lg text-center" style={{ backgroundColor: 'rgb(248, 249, 250)' }}>
                              <i className="ni ni-mobile-button text-primary mb-2" style={{ fontSize: '2rem' }}></i>
                              <div>
                                <small className="text-muted d-block">Method</small>
                                <strong>Authenticator App (TOTP)</strong>
                              </div>
                            </div>
                          </Col>
                          <Col md="4">
                            <div className="p-3 border rounded-lg text-center" style={{ backgroundColor: 'rgb(248, 249, 250)' }}>
                              <i className="ni ni-time-alarm text-warning mb-2" style={{ fontSize: '2rem' }}></i>
                              <div>
                                <small className="text-muted d-block">Last Used</small>
                                <strong>Never</strong>
                              </div>
                            </div>
                          </Col>
                          <Col md="4">
                            <div className="p-3 border rounded-lg text-center" style={{ backgroundColor: 'rgb(248, 249, 250)' }}>
                              <i className="ni ni-collection text-info mb-2" style={{ fontSize: '2rem' }}></i>
                              <div>
                                <small className="text-muted d-block">Backup Codes</small>
                                <strong>{backupCodesCount} remaining</strong>
                              </div>
                            </div>
                          </Col>
                        </Row>
                        
                        <Alert color={securitySettings.twoFAEnabled ? "success" : "warning"} className="border-0" style={{ 
                          borderRadius: '12px',
                          background: securitySettings.twoFAEnabled ? '#28a745' : '#ffc107',
                          border: securitySettings.twoFAEnabled ? '1px solid #28a745' : '1px solid #ffc107'
                        }}>
                          <i className={`ni ni-${securitySettings.twoFAEnabled ? 'check-bold' : 'fat-remove'} mr-2`}></i>
                          <strong>{securitySettings.twoFAEnabled ? '2FA is Active!' : '2FA is Disabled!'}</strong> {securitySettings.twoFAEnabled ? 'Your account is now protected with two-factor authentication. You\'ll need to enter a verification code each time you log in.' : 'Your account is not protected with two-factor authentication. Enable 2FA for enhanced security.'}
                        </Alert>
                        
                        <div className="d-flex flex-wrap gap-2 mt-3">
                          {securitySettings.twoFAEnabled ? (
                            <Button 
                              color="outline-danger" 
                              size="sm"
                              className="px-3 py-2"
                              style={{ 
                                borderRadius: '20px',
                                border: '1px solid #dc3545',
                                color: '#dc3545',
                                transition: 'all 0.3s ease',
                                cursor: 'pointer'
                              }}
                              onMouseEnter={(e) => {
                                e.target.style.backgroundColor = '#dc3545';
                                e.target.style.color = '#ffffff';
                                e.target.style.borderColor = '#dc3545';
                                e.target.style.boxShadow = '0 4px 12px rgba(220, 53, 69, 0.4)';
                              }}
                              onMouseLeave={(e) => {
                                e.target.style.backgroundColor = 'transparent';
                                e.target.style.color = '#dc3545';
                                e.target.style.borderColor = '#dc3545';
                                e.target.style.boxShadow = 'none';
                              }}
                              onClick={() => setShowDisable2FAModal(true)}
                            >
                              <i className="ni ni-lock-circle-open mr-2"></i>
                              Disable 2FA
                            </Button>
                          ) : (
                            <Button 
                              color="outline-success" 
                              size="sm"
                              className="px-3 py-2"
                              style={{ 
                                borderRadius: '20px',
                                border: '1px solid #28a745',
                                color: '#28a745',
                                transition: 'all 0.3s ease',
                                cursor: 'pointer'
                              }}
                              onMouseEnter={(e) => {
                                e.target.style.backgroundColor = '#28a745';
                                e.target.style.color = '#ffffff';
                                e.target.style.borderColor = '#28a745';
                                e.target.style.boxShadow = '0 4px 12px rgba(40, 167, 69, 0.4)';
                              }}
                              onMouseLeave={(e) => {
                                e.target.style.backgroundColor = 'transparent';
                                e.target.style.color = '#28a745';
                                e.target.style.borderColor = '#28a745';
                                e.target.style.boxShadow = 'none';
                              }}
                              onClick={() => setShow2FAModal(true)}
                            >
                              <i className="ni ni-lock-circle-open mr-2"></i>
                              Enable 2FA
                            </Button>
                          )}

                          <Button 
                            color="outline-warning" 
                            size="sm"
                            className="px-3 py-2"
                            style={{ 
                              borderRadius: '20px',
                              border: '1px solid #ffc107',
                              color: '#ffc107',
                              transition: 'all 0.3s ease',
                              cursor: 'pointer'
                            }}
                            onMouseEnter={(e) => {
                              e.target.style.backgroundColor = '#ffc107';
                              e.target.style.color = '#ffffff';
                              e.target.style.borderColor = '#ffc107';
                              e.target.style.boxShadow = '0 4px 12px rgba(255, 193, 7, 0.4)';
                            }}
                            onMouseLeave={(e) => {
                              e.target.style.backgroundColor = 'transparent';
                              e.target.style.color = '#ffc107';
                              e.target.style.borderColor = '#ffc107';
                              e.target.style.boxShadow = 'none';
                            }}
                            onClick={() => setShowBackupCodesModal(true)}
                          >
                            <i className="ni ni-collection mr-2"></i>
                            Manage Backup Codes
                          </Button>
                        </div>
                      </div>
                      
                      <div className="pt-4 border-top">
                        <h6 className="text-muted mb-3">
                          <i className="ni ni-key-25 mr-2"></i>
                          Password Management
                        </h6>
                        <div className="p-3 border rounded-lg mb-3" style={{ backgroundColor: 'rgb(248, 249, 250)' }}>
                          <p className="text-muted mb-3">
                            Keep your password secure and change it regularly for better account protection.
                          </p>
                          <Button 
                            color="primary" 
                            size="sm"
                            className="px-4 py-2"
                            style={{ 
                              borderRadius: '20px',
                              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                              border: 'none',
                              boxShadow: '0 2px 8px rgba(102, 126, 234, 0.3)'
                            }}
                            onClick={() => setShowChangePasswordModal(true)}
                          >
                            <i className="ni ni-key-25 mr-2"></i>
                            Change Password
                          </Button>
                        </div>
                      </div>
                    </CardBody>
                  </Card>
                </TabPane>
              </TabContent>
            </CardBody>
          </Card>
        </div>
      </div>
      
      {/* 2FA Setup Modal */}
      <TwoFactorAuth
        isOpen={show2FAModal}
        toggle={() => setShow2FAModal(!show2FAModal)}
        onSuccess={handle2FASuccess}
        onCancel={() => setShow2FAModal(false)}
      />
      
      {/* 2FA Disable Confirmation Modal */}
      <Disable2FAModal
        isOpen={showDisable2FAModal}
        toggle={() => setShowDisable2FAModal(!showDisable2FAModal)}
        onSuccess={handle2FADisableSuccess}
        onCancel={() => setShowDisable2FAModal(false)}
      />

      {/* Backup Codes Modal */}
      <BackupCodesModal
        isOpen={showBackupCodesModal}
        toggle={() => setShowBackupCodesModal(!showBackupCodesModal)}
        onSuccess={() => {
          setMessage({ type: 'success', text: 'Backup codes regenerated successfully!' });
          setShowBackupCodesModal(false);
        }}
        onCancel={() => setShowBackupCodesModal(false)}
      />

      {/* Change Password Modal */}
      <ChangePasswordModal
        isOpen={showChangePasswordModal}
        toggle={() => setShowChangePasswordModal(!showChangePasswordModal)}
        onSuccess={() => {
          setMessage({ type: 'success', text: 'Password changed successfully!' });
          setShowChangePasswordModal(false);
        }}
        onCancel={() => setShowChangePasswordModal(false)}
      />
    </div>
  );
};

export default AdminSettings;
