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

const StudentSettings = () => {
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
    student_number: user?.student_number || '',
    course: user?.course || '',
    year_level: user?.year_level || '',
    section: user?.section || '',
    address: user?.address || ''
  });

  // Academic settings
  const [academicSettings, setAcademicSettings] = useState({
    showGrades: true,
    allowNotifications: true,
    attendanceReminders: true,
    assignmentDeadlineAlerts: true,
    gradeNotifications: true
  });

  // Security settings
  const [securitySettings, setSecuritySettings] = useState({
    twoFAEnabled: false,
    sessionTimeout: 30,
    loginNotifications: true
  });

  // Notification settings
  const [notificationSettings, setNotificationSettings] = useState({
    email: {
      newAssignments: true,
      gradeUpdates: true,
      attendanceAlerts: true,
      announcements: true
    },
    push: {
      urgentAlerts: true,
      dailyDigest: false,
      teacherMessages: true
    }
  });

  // Privacy settings
  const [privacySettings, setPrivacySettings] = useState({
    profileVisibility: 'classmates',
    showOnlineStatus: true,
    allowDirectMessages: true,
    shareProgress: false
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

  const handleAcademicUpdate = async () => {
    setLoading(true);
    setMessage({ type: '', text: '' });
    
    try {
      setMessage({ type: 'success', text: 'Academic settings updated successfully!' });
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

  const handlePrivacyUpdate = async () => {
    setLoading(true);
    setMessage({ type: '', text: '' });
    
    try {
      setMessage({ type: 'success', text: 'Privacy settings updated successfully!' });
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
          <h1 className="h3 mb-4">Student Settings</h1>
          
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
                    <i className="ni ni-hat-3 mr-2" />
                    Academic
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
                    <i className="ni ni-settings-gear-65 mr-2" />
                    Privacy
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
                        <Label for="studentNumber">Student Number</Label>
                        <Input
                          id="studentNumber"
                          type="text"
                          value={profileData.student_number}
                          onChange={(e) => setProfileData({...profileData, student_number: e.target.value})}
                        />
                      </FormGroup>
                    </Col>
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
                  </Row>
                  <Row>
                    <Col md="4">
                      <FormGroup>
                        <Label for="course">Course</Label>
                        <Input
                          id="course"
                          type="select"
                          value={profileData.course}
                          onChange={(e) => setProfileData({...profileData, course: e.target.value})}
                        >
                          <option value="">Select Course</option>
                          <option value="Computer Science">Computer Science</option>
                          <option value="Information Technology">Information Technology</option>
                          <option value="Engineering">Engineering</option>
                          <option value="Business">Business</option>
                        </Input>
                      </FormGroup>
                    </Col>
                    <Col md="4">
                      <FormGroup>
                        <Label for="yearLevel">Year Level</Label>
                        <Input
                          id="yearLevel"
                          type="select"
                          value={profileData.year_level}
                          onChange={(e) => setProfileData({...profileData, year_level: e.target.value})}
                        >
                          <option value="">Select Year</option>
                          <option value="1st Year">1st Year</option>
                          <option value="2nd Year">2nd Year</option>
                          <option value="3rd Year">3rd Year</option>
                          <option value="4th Year">4th Year</option>
                        </Input>
                      </FormGroup>
                    </Col>
                    <Col md="4">
                      <FormGroup>
                        <Label for="section">Section</Label>
                        <Input
                          id="section"
                          type="text"
                          value={profileData.section}
                          onChange={(e) => setProfileData({...profileData, section: e.target.value})}
                        />
                      </FormGroup>
                    </Col>
                  </Row>
                  <Row>
                    <Col md="12">
                      <FormGroup>
                        <Label for="address">Address</Label>
                        <Input
                          id="address"
                          type="textarea"
                          value={profileData.address}
                          onChange={(e) => setProfileData({...profileData, address: e.target.value})}
                        />
                      </FormGroup>
                    </Col>
                  </Row>
                  <Button color="primary" onClick={handleProfileUpdate} disabled={loading}>
                    {loading ? 'Updating...' : 'Update Profile'}
                  </Button>
                </TabPane>

                {/* Academic Tab */}
                <TabPane tabId="2">
                  <Row>
                    <Col md="6">
                      <h6>Academic Preferences</h6>
                      <FormGroup check>
                        <Label check>
                          <Input
                            type="checkbox"
                            checked={academicSettings.showGrades}
                            onChange={(e) => setAcademicSettings({...academicSettings, showGrades: e.target.checked})}
                          />
                          Show My Grades
                        </Label>
                      </FormGroup>
                      <FormGroup check>
                        <Label check>
                          <Input
                            type="checkbox"
                            checked={academicSettings.allowNotifications}
                            onChange={(e) => setAcademicSettings({...academicSettings, allowNotifications: e.target.checked})}
                          />
                          Allow Academic Notifications
                        </Label>
                      </FormGroup>
                      <FormGroup check>
                        <Label check>
                          <Input
                            type="checkbox"
                            checked={academicSettings.attendanceReminders}
                            onChange={(e) => setAcademicSettings({...academicSettings, attendanceReminders: e.target.checked})}
                          />
                          Attendance Reminders
                        </Label>
                      </FormGroup>
                    </Col>
                    <Col md="6">
                      <h6>Assignment Preferences</h6>
                      <FormGroup check>
                        <Label check>
                          <Input
                            type="checkbox"
                            checked={academicSettings.assignmentDeadlineAlerts}
                            onChange={(e) => setAcademicSettings({...academicSettings, assignmentDeadlineAlerts: e.target.checked})}
                          />
                          Assignment Deadline Alerts
                        </Label>
                      </FormGroup>
                      <FormGroup check>
                        <Label check>
                          <Input
                            type="checkbox"
                            checked={academicSettings.gradeNotifications}
                            onChange={(e) => setAcademicSettings({...academicSettings, gradeNotifications: e.target.checked})}
                          />
                          Grade Update Notifications
                        </Label>
                      </FormGroup>
                    </Col>
                  </Row>
                  <Button color="primary" onClick={handleAcademicUpdate} disabled={loading}>
                    {loading ? 'Updating...' : 'Update Academic Settings'}
                  </Button>
                </TabPane>

                {/* Security Tab */}
                <TabPane tabId="3">
                  <Row>
                    <Col md="6">
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
                    </Col>
                    <Col md="6">
                      <FormGroup>
                        <Label for="sessionTimeout">Session Timeout (minutes)</Label>
                        <Input
                          id="sessionTimeout"
                          type="select"
                          value={securitySettings.sessionTimeout}
                          onChange={(e) => setSecuritySettings({...securitySettings, sessionTimeout: parseInt(e.target.value)})}
                        >
                          <option value={15}>15 minutes</option>
                          <option value={30}>30 minutes</option>
                          <option value={60}>1 hour</option>
                          <option value={120}>2 hours</option>
                        </Input>
                      </FormGroup>
                    </Col>
                  </Row>
                  <Row>
                    <Col md="6">
                      <FormGroup>
                        <Label for="loginNotifications">Login Notifications</Label>
                        <div>
                          <Input
                            type="checkbox"
                            checked={securitySettings.loginNotifications}
                            onChange={(e) => setSecuritySettings({...securitySettings, loginNotifications: e.target.checked})}
                          />
                          <span className="ml-2">
                            {securitySettings.loginNotifications ? 'Enabled' : 'Disabled'}
                          </span>
                        </div>
                      </FormGroup>
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
                            checked={notificationSettings.email.newAssignments}
                            onChange={(e) => setNotificationSettings({
                              ...notificationSettings,
                              email: {
                                ...notificationSettings.email,
                                newAssignments: e.target.checked
                              }
                            })}
                          />
                          New Assignments
                        </Label>
                      </FormGroup>
                      <FormGroup check>
                        <Label check>
                          <Input
                            type="checkbox"
                            checked={notificationSettings.email.gradeUpdates}
                            onChange={(e) => setNotificationSettings({
                              ...notificationSettings,
                              email: {
                                ...notificationSettings.email,
                                gradeUpdates: e.target.checked
                              }
                            })}
                          />
                          Grade Updates
                        </Label>
                      </FormGroup>
                      <FormGroup check>
                        <Label check>
                          <Input
                            type="checkbox"
                            checked={notificationSettings.email.attendanceAlerts}
                            onChange={(e) => setNotificationSettings({
                              ...notificationSettings,
                              email: {
                                ...notificationSettings.email,
                                attendanceAlerts: e.target.checked
                              }
                            })}
                          />
                          Attendance Alerts
                        </Label>
                      </FormGroup>
                    </Col>
                    <Col md="6">
                      <h6>Push Notifications</h6>
                      <FormGroup check>
                        <Label check>
                          <Input
                            type="checkbox"
                            checked={notificationSettings.push.urgentAlerts}
                            onChange={(e) => setNotificationSettings({
                              ...notificationSettings,
                              push: {
                                ...notificationSettings.push,
                                urgentAlerts: e.target.checked
                              }
                            })}
                          />
                          Urgent Alerts
                        </Label>
                      </FormGroup>
                      <FormGroup check>
                        <Label check>
                          <Input
                            type="checkbox"
                            checked={notificationSettings.push.teacherMessages}
                            onChange={(e) => setNotificationSettings({
                              ...notificationSettings,
                              push: {
                                ...notificationSettings.push,
                                teacherMessages: e.target.checked
                              }
                            })}
                          />
                          Teacher Messages
                        </Label>
                      </FormGroup>
                    </Col>
                  </Row>
                  <Button color="primary" onClick={handleNotificationUpdate} disabled={loading}>
                    {loading ? 'Updating...' : 'Update Notification Settings'}
                  </Button>
                </TabPane>

                {/* Privacy Tab */}
                <TabPane tabId="5">
                  <Row>
                    <Col md="6">
                      <h6>Profile Visibility</h6>
                      <FormGroup>
                        <Label for="profileVisibility">Who can see my profile?</Label>
                        <Input
                          id="profileVisibility"
                          type="select"
                          value={privacySettings.profileVisibility}
                          onChange={(e) => setPrivacySettings({...privacySettings, profileVisibility: e.target.value})}
                        >
                          <option value="classmates">Classmates Only</option>
                          <option value="teachers">Teachers Only</option>
                          <option value="everyone">Everyone</option>
                          <option value="nobody">Nobody</option>
                        </Input>
                      </FormGroup>
                      <FormGroup check>
                        <Label check>
                          <Input
                            type="checkbox"
                            checked={privacySettings.showOnlineStatus}
                            onChange={(e) => setPrivacySettings({...privacySettings, showOnlineStatus: e.target.checked})}
                          />
                          Show Online Status
                        </Label>
                      </FormGroup>
                    </Col>
                    <Col md="6">
                      <h6>Communication Settings</h6>
                      <FormGroup check>
                        <Label check>
                          <Input
                            type="checkbox"
                            checked={privacySettings.allowDirectMessages}
                            onChange={(e) => setPrivacySettings({...privacySettings, allowDirectMessages: e.target.checked})}
                          />
                          Allow Direct Messages
                        </Label>
                      </FormGroup>
                      <FormGroup check>
                        <Label check>
                          <Input
                            type="checkbox"
                            checked={privacySettings.shareProgress}
                            onChange={(e) => setPrivacySettings({...privacySettings, shareProgress: e.target.checked})}
                          />
                          Share Academic Progress
                        </Label>
                      </FormGroup>
                    </Col>
                  </Row>
                  <Button color="primary" onClick={handlePrivacyUpdate} disabled={loading}>
                    {loading ? 'Updating...' : 'Update Privacy Settings'}
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

export default StudentSettings;
