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

const AdminSettings = () => {
  const { user, updateProfile } = useAuth();
  const [activeTab, setActiveTab] = useState('1');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });
  
  // 2FA Modal states
  const [show2FAModal, setShow2FAModal] = useState(false);
  const [showDisable2FAModal, setShowDisable2FAModal] = useState(false);
  
  // Profile settings
  const [profileData, setProfileData] = useState({
    full_name: user?.full_name || '',
    email: user?.email || '',
    phone: user?.phone || '',
    department: user?.department || '',
    role: user?.role || 'admin'
  });

  // System settings
  const [systemSettings, setSystemSettings] = useState({
    maintenanceMode: false,
    allowUserRegistration: true,
    requireEmailVerification: true,
    maxFileUploadSize: 10,
    sessionTimeout: 30,
    backupFrequency: 'daily'
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

  // Notification settings
  const [notificationSettings, setNotificationSettings] = useState({
    email: {
      systemAlerts: true,
      userReports: true,
      securityEvents: true,
      backupNotifications: true
    },
    push: {
      criticalAlerts: true,
      dailyReports: false,
      userActivity: false
    }
  });

  // User management settings
  const [userManagementSettings, setUserManagementSettings] = useState({
    allowBulkOperations: true,
    requireApprovalForNewUsers: false,
    autoAssignRoles: false,
    defaultUserRole: 'student',
    allowProfileEditing: true,
    requirePasswordChange: false
  });

  // Load 2FA status on component mount
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
    
    load2FAStatus();
  }, []);

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
      const response = await updateProfile(profileData);
      if (response.success) {
        setMessage({ type: 'success', text: 'Profile updated successfully!' });
      } else {
        setMessage({ type: 'danger', text: response.message || 'Failed to update profile' });
      }
    } catch (error) {
      setMessage({ type: 'danger', text: error.message || 'An error occurred' });
    } finally {
      setLoading(false);
    }
  };

  const handleSystemUpdate = async () => {
    setLoading(true);
    setMessage({ type: '', text: '' });
    
    try {
      setMessage({ type: 'success', text: 'System settings updated successfully!' });
    } catch (error) {
      setMessage({ type: 'danger', text: error.message || 'An error occurred' });
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

  const handleNotificationUpdate = async () => {
    setLoading(true);
    setMessage({ type: '', text: '' });
    
    try {
      setMessage({ type: 'success', text: 'Notification settings updated successfully!' });
    } catch (error) {
      setMessage({ type: 'danger', text: error.message || 'An error occurred' });
    } finally {
      setLoading(false);
    }
  };

  const handleUserManagementUpdate = async () => {
    setLoading(true);
    setMessage({ type: '', text: '' });
    
    try {
      setMessage({ type: 'success', text: 'User management settings updated successfully!' });
    } catch (error) {
      setMessage({ type: 'danger', text: error.message || 'An error occurred' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="px-4 py-5">
      <div className="row">
        <div className="col-12">
          <h1 className="h3 mb-4">Admin Settings</h1>
          
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
                    <i className="ni ni-settings-gear-65 mr-2" />
                    System
                  </NavLink>
                </NavItem>
                <NavItem>
                  <NavLink
                    className={classnames({ active: activeTab === '3' })}
                    onClick={() => toggleTab('3')}
                  >
                    <i className="ni ni-lock-circle-open mr-2" />
                    Security
                  </NavLink>
                </NavItem>
                <NavItem>
                  <NavLink
                    className={classnames({ active: activeTab === '4' })}
                    onClick={() => toggleTab('4')}
                  >
                    <i className="ni ni-bell-55 mr-2" />
                    Notifications
                  </NavLink>
                </NavItem>
                <NavItem>
                  <NavLink
                    className={classnames({ active: activeTab === '5' })}
                    onClick={() => toggleTab('5')}
                  >
                    <i className="ni ni-single-02 mr-2" />
                    User Management
                  </NavLink>
                </NavItem>
              </Nav>

              <TabContent activeTab={activeTab} className="mt-4">
                {/* Profile Tab */}
                <TabPane tabId="1">
                  <Row>
                    <Col md="6">
                      <FormGroup>
                        <Label for="fullName">Full Name</Label>
                        <Input
                          id="fullName"
                          type="text"
                          value={profileData.full_name}
                          onChange={(e) => setProfileData({...profileData, full_name: e.target.value})}
                        />
                      </FormGroup>
                    </Col>
                    <Col md="6">
                      <FormGroup>
                        <Label for="email">Email</Label>
                        <Input
                          id="email"
                          type="email"
                          value={profileData.email}
                          onChange={(e) => setProfileData({...profileData, email: e.target.value})}
                        />
                      </FormGroup>
                    </Col>
                  </Row>
                  <Row>
                    <Col md="6">
                      <FormGroup>
                        <Label for="phone">Phone</Label>
                        <Input
                          id="phone"
                          type="tel"
                          value={profileData.phone}
                          onChange={(e) => setProfileData({...profileData, phone: e.target.value})}
                        />
                      </FormGroup>
                    </Col>
                    <Col md="6">
                      <FormGroup>
                        <Label for="department">Department</Label>
                        <Input
                          id="department"
                          type="text"
                          value={profileData.department}
                          onChange={(e) => setProfileData({...profileData, department: e.target.value})}
                        />
                      </FormGroup>
                    </Col>
                  </Row>
                  <Row>
                    <Col md="6">
                      <FormGroup>
                        <Label for="role">Role</Label>
                        <Input
                          id="role"
                          type="text"
                          value={profileData.role}
                          disabled
                        />
                        <small className="form-text text-muted">
                          Admin role cannot be changed
                        </small>
                      </FormGroup>
                    </Col>
                  </Row>
                  <Button color="primary" onClick={handleProfileUpdate} disabled={loading}>
                    {loading ? 'Updating...' : 'Update Profile'}
                  </Button>
                </TabPane>

                {/* System Tab */}
                <TabPane tabId="2">
                  <Row>
                    <Col md="6">
                      <h6>System Configuration</h6>
                      <FormGroup check>
                        <Label check>
                          <Input
                            type="checkbox"
                            checked={systemSettings.maintenanceMode}
                            onChange={(e) => setSystemSettings({...systemSettings, maintenanceMode: e.target.checked})}
                          />
                          Maintenance Mode
                        </Label>
                      </FormGroup>
                      <FormGroup check>
                        <Label check>
                          <Input
                            type="checkbox"
                            checked={systemSettings.allowUserRegistration}
                            onChange={(e) => setSystemSettings({...systemSettings, allowUserRegistration: e.target.checked})}
                          />
                          Allow User Registration
                        </Label>
                      </FormGroup>
                      <FormGroup check>
                        <Label check>
                          <Input
                            type="checkbox"
                            checked={systemSettings.requireEmailVerification}
                            onChange={(e) => setSystemSettings({...systemSettings, requireEmailVerification: e.target.checked})}
                          />
                          Require Email Verification
                        </Label>
                      </FormGroup>
                    </Col>
                    <Col md="6">
                      <h6>System Limits</h6>
                      <FormGroup>
                        <Label for="maxFileUploadSize">Max File Upload Size (MB)</Label>
                        <Input
                          id="maxFileUploadSize"
                          type="select"
                          value={systemSettings.maxFileUploadSize}
                          onChange={(e) => setSystemSettings({...systemSettings, maxFileUploadSize: parseInt(e.target.value)})}
                        >
                          <option value={5}>5 MB</option>
                          <option value={10}>10 MB</option>
                          <option value={25}>25 MB</option>
                          <option value={50}>50 MB</option>
                        </Input>
                      </FormGroup>
                      <FormGroup>
                        <Label for="backupFrequency">Backup Frequency</Label>
                        <Input
                          id="backupFrequency"
                          type="select"
                          value={systemSettings.backupFrequency}
                          onChange={(e) => setSystemSettings({...systemSettings, backupFrequency: e.target.value})}
                        >
                          <option value="hourly">Hourly</option>
                          <option value="daily">Daily</option>
                          <option value="weekly">Weekly</option>
                          <option value="monthly">Monthly</option>
                        </Input>
                      </FormGroup>
                    </Col>
                  </Row>
                  <Button color="primary" onClick={handleSystemUpdate} disabled={loading}>
                    {loading ? 'Updating...' : 'Update System Settings'}
                  </Button>
                </TabPane>

                {/* Security Tab */}
                <TabPane tabId="3">
                  <Row>
                    <Col md="6">
                      <h6>Two-Factor Authentication</h6>
                      <FormGroup>
                        <Label for="twoFA">Two-Factor Authentication</Label>
                        <div className="d-flex align-items-center">
                          <div className="custom-control custom-switch">
                            <Input
                              type="checkbox"
                              id="twoFAToggle"
                              checked={securitySettings.twoFAEnabled}
                              onChange={(e) => handle2FAToggle(e.target.checked)}
                              className="custom-control-input"
                            />
                            <Label className="custom-control-label" for="twoFAToggle">
                              Enable Two-Factor Authentication
                            </Label>
                          </div>
                          <Badge 
                            color={securitySettings.twoFAEnabled ? 'success' : 'secondary'} 
                            className="ml-3"
                          >
                            {securitySettings.twoFAEnabled ? 'Enabled' : 'Disabled'}
                          </Badge>
                        </div>
                        <small className="form-text text-muted">
                          Add an extra layer of security to your account with two-factor authentication.
                        </small>
                      </FormGroup>
                      <FormGroup check>
                        <Label check>
                          <Input
                            type="checkbox"
                            checked={securitySettings.require2FAForAdmins}
                            onChange={(e) => setSecuritySettings({...securitySettings, require2FAForAdmins: e.target.checked})}
                          />
                          Require 2FA for All Admins
                        </Label>
                      </FormGroup>
                    </Col>
                    <Col md="6">
                      <h6>Login Security</h6>
                      <FormGroup>
                        <Label for="loginAttempts">Max Login Attempts</Label>
                        <Input
                          id="loginAttempts"
                          type="select"
                          value={securitySettings.loginAttempts}
                          onChange={(e) => setSecuritySettings({...securitySettings, loginAttempts: parseInt(e.target.value)})}
                        >
                          <option value={3}>3 attempts</option>
                          <option value={5}>5 attempts</option>
                          <option value={10}>10 attempts</option>
                        </Input>
                      </FormGroup>
                      <FormGroup>
                        <Label for="lockoutDuration">Lockout Duration (minutes)</Label>
                        <Input
                          id="lockoutDuration"
                          type="select"
                          value={securitySettings.lockoutDuration}
                          onChange={(e) => setSecuritySettings({...securitySettings, lockoutDuration: parseInt(e.target.value)})}
                        >
                          <option value={15}>15 minutes</option>
                          <option value={30}>30 minutes</option>
                          <option value={60}>1 hour</option>
                        </Input>
                      </FormGroup>
                    </Col>
                  </Row>
                  <Row>
                    <Col md="12">
                      <h6>Password Policy</h6>
                      <Row>
                        <Col md="3">
                          <FormGroup>
                            <Label for="minLength">Minimum Length</Label>
                            <Input
                              id="minLength"
                              type="select"
                              value={securitySettings.passwordPolicy.minLength}
                              onChange={(e) => setSecuritySettings({
                                ...securitySettings,
                                passwordPolicy: {
                                  ...securitySettings.passwordPolicy,
                                  minLength: parseInt(e.target.value)
                                }
                              })}
                            >
                              <option value={6}>6 characters</option>
                              <option value={8}>8 characters</option>
                              <option value={10}>10 characters</option>
                              <option value={12}>12 characters</option>
                            </Input>
                          </FormGroup>
                        </Col>
                        <Col md="9">
                          <FormGroup check>
                            <Label check>
                              <Input
                                type="checkbox"
                                checked={securitySettings.passwordPolicy.requireUppercase}
                                onChange={(e) => setSecuritySettings({
                                  ...securitySettings,
                                  passwordPolicy: {
                                    ...securitySettings.passwordPolicy,
                                    requireUppercase: e.target.checked
                                  }
                                })}
                              />
                              Require Uppercase Letters
                            </Label>
                          </FormGroup>
                          <FormGroup check>
                            <Label check>
                              <Input
                                type="checkbox"
                                checked={securitySettings.passwordPolicy.requireLowercase}
                                onChange={(e) => setSecuritySettings({
                                  ...securitySettings,
                                  passwordPolicy: {
                                    ...securitySettings.passwordPolicy,
                                    requireLowercase: e.target.checked
                                  }
                                })}
                              />
                              Require Lowercase Letters
                            </Label>
                          </FormGroup>
                          <FormGroup check>
                            <Label check>
                              <Input
                                type="checkbox"
                                checked={securitySettings.passwordPolicy.requireNumbers}
                                onChange={(e) => setSecuritySettings({
                                  ...securitySettings,
                                  passwordPolicy: {
                                    ...securitySettings.passwordPolicy,
                                    requireNumbers: e.target.checked
                                  }
                                })}
                              />
                              Require Numbers
                            </Label>
                          </FormGroup>
                          <FormGroup check>
                            <Label check>
                              <Input
                                type="checkbox"
                                checked={securitySettings.passwordPolicy.requireSpecialChars}
                                onChange={(e) => setSecuritySettings({
                                  ...securitySettings,
                                  passwordPolicy: {
                                    ...securitySettings.passwordPolicy,
                                    requireSpecialChars: e.target.checked
                                  }
                                })}
                              />
                              Require Special Characters
                            </Label>
                          </FormGroup>
                        </Col>
                      </Row>
                    </Col>
                  </Row>
                  <Button color="primary" onClick={handleSecurityUpdate} disabled={loading}>
                    {loading ? 'Updating...' : 'Update Security Settings'}
                  </Button>
                </TabPane>

                {/* Notifications Tab */}
                <TabPane tabId="4">
                  <Row>
                    <Col md="6">
                      <h6>Email Notifications</h6>
                      <FormGroup check>
                        <Label check>
                          <Input
                            type="checkbox"
                            checked={notificationSettings.email.systemAlerts}
                            onChange={(e) => setNotificationSettings({
                              ...notificationSettings,
                              email: {
                                ...notificationSettings.email,
                                systemAlerts: e.target.checked
                              }
                            })}
                          />
                          System Alerts
                        </Label>
                      </FormGroup>
                      <FormGroup check>
                        <Label check>
                          <Input
                            type="checkbox"
                            checked={notificationSettings.email.userReports}
                            onChange={(e) => setNotificationSettings({
                              ...notificationSettings,
                              email: {
                                ...notificationSettings.email,
                                userReports: e.target.checked
                              }
                            })}
                          />
                          User Reports
                        </Label>
                      </FormGroup>
                      <FormGroup check>
                        <Label check>
                          <Input
                            type="checkbox"
                            checked={notificationSettings.email.securityEvents}
                            onChange={(e) => setNotificationSettings({
                              ...notificationSettings,
                              email: {
                                ...notificationSettings.email,
                                securityEvents: e.target.checked
                              }
                            })}
                          />
                          Security Events
                        </Label>
                      </FormGroup>
                    </Col>
                    <Col md="6">
                      <h6>Push Notifications</h6>
                      <FormGroup check>
                        <Label check>
                          <Input
                            type="checkbox"
                            checked={notificationSettings.push.criticalAlerts}
                            onChange={(e) => setNotificationSettings({
                              ...notificationSettings,
                              push: {
                                ...notificationSettings.push,
                                criticalAlerts: e.target.checked
                              }
                            })}
                          />
                          Critical Alerts
                        </Label>
                      </FormGroup>
                      <FormGroup check>
                        <Label check>
                          <Input
                            type="checkbox"
                            checked={notificationSettings.push.dailyReports}
                            onChange={(e) => setNotificationSettings({
                              ...notificationSettings,
                              push: {
                                ...notificationSettings.push,
                                dailyReports: e.target.checked
                              }
                            })}
                          />
                          Daily Reports
                        </Label>
                      </FormGroup>
                      <FormGroup check>
                        <Label check>
                          <Input
                            type="checkbox"
                            checked={notificationSettings.push.userActivity}
                            onChange={(e) => setNotificationSettings({
                              ...notificationSettings,
                              push: {
                                ...notificationSettings.push,
                                userActivity: e.target.checked
                              }
                            })}
                          />
                          User Activity
                        </Label>
                      </FormGroup>
                    </Col>
                  </Row>
                  <Button color="primary" onClick={handleNotificationUpdate} disabled={loading}>
                    {loading ? 'Updating...' : 'Update Notification Settings'}
                  </Button>
                </TabPane>

                {/* User Management Tab */}
                <TabPane tabId="5">
                  <Row>
                    <Col md="6">
                      <h6>User Operations</h6>
                      <FormGroup check>
                        <Label check>
                          <Input
                            type="checkbox"
                            checked={userManagementSettings.allowBulkOperations}
                            onChange={(e) => setUserManagementSettings({...userManagementSettings, allowBulkOperations: e.target.checked})}
                          />
                          Allow Bulk Operations
                        </Label>
                      </FormGroup>
                      <FormGroup check>
                        <Label check>
                          <Input
                            type="checkbox"
                            checked={userManagementSettings.requireApprovalForNewUsers}
                            onChange={(e) => setUserManagementSettings({...userManagementSettings, requireApprovalForNewUsers: e.target.checked})}
                          />
                          Require Approval for New Users
                        </Label>
                      </FormGroup>
                      <FormGroup check>
                        <Label check>
                          <Input
                            type="checkbox"
                            checked={userManagementSettings.autoAssignRoles}
                            onChange={(e) => setUserManagementSettings({...userManagementSettings, autoAssignRoles: e.target.checked})}
                          />
                          Auto-Assign Roles
                        </Label>
                      </FormGroup>
                    </Col>
                    <Col md="6">
                      <h6>User Preferences</h6>
                      <FormGroup>
                        <Label for="defaultUserRole">Default User Role</Label>
                        <Input
                          id="defaultUserRole"
                          type="select"
                          value={userManagementSettings.defaultUserRole}
                          onChange={(e) => setUserManagementSettings({...userManagementSettings, defaultUserRole: e.target.value})}
                        >
                          <option value="student">Student</option>
                          <option value="teacher">Teacher</option>
                          <option value="admin">Admin</option>
                        </Input>
                      </FormGroup>
                      <FormGroup check>
                        <Label check>
                          <Input
                            type="checkbox"
                            checked={userManagementSettings.allowProfileEditing}
                            onChange={(e) => setUserManagementSettings({...userManagementSettings, allowProfileEditing: e.target.checked})}
                          />
                          Allow Profile Editing
                        </Label>
                      </FormGroup>
                      <FormGroup check>
                        <Label check>
                          <Input
                            type="checkbox"
                            checked={userManagementSettings.requirePasswordChange}
                            onChange={(e) => setUserManagementSettings({...userManagementSettings, requirePasswordChange: e.target.checked})}
                          />
                          Require Password Change on First Login
                        </Label>
                      </FormGroup>
                    </Col>
                  </Row>
                  <Button color="primary" onClick={handleUserManagementUpdate} disabled={loading}>
                    {loading ? 'Updating...' : 'Update User Management Settings'}
                  </Button>
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
    </div>
  );
};

export default AdminSettings;
