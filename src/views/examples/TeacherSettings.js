import React, { useState, useEffect } from 'react';
import {
  Card,
  CardBody,
  CardHeader,
  Form,
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
  Spinner
} from 'reactstrap';
import { useAuth } from '../../contexts/AuthContext';
import ApiService from '../../services/api';
import TwoFactorStatus from '../../components/TwoFactorStatus';

const TeacherSettings = () => {
  const { user, updateProfile } = useAuth();
  const [activeTab, setActiveTab] = useState('1');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });
  
  // Profile data
  const [profileData, setProfileData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    department: '',
    position: ''
  });

  // Notification settings
  const [notificationSettings, setNotificationSettings] = useState({
    emailNotifications: true,
    smsNotifications: false,
    pushNotifications: true,
    taskReminders: true,
    attendanceAlerts: true,
    gradeUpdates: true
  });

  useEffect(() => {
    if (user) {
      setProfileData({
        firstName: user.firstName || '',
        lastName: user.lastName || '',
        email: user.email || '',
        phone: user.phone || '',
        department: user.department || '',
        position: user.position || ''
      });
    }
  }, [user]);

  const handleProfileUpdate = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage({ type: '', text: '' });

    try {
      const response = await ApiService.updateProfile(profileData);
      
      if (response.success) {
        await updateProfile(profileData);
        setMessage({ type: 'success', text: 'Profile updated successfully!' });
      } else {
        setMessage({ type: 'danger', text: response.message || 'Failed to update profile' });
      }
    } catch (error) {
      setMessage({ type: 'danger', text: 'An error occurred while updating profile' });
    } finally {
      setLoading(false);
    }
  };

  const handleNotificationChange = (setting, value) => {
    setNotificationSettings(prev => ({
      ...prev,
      [setting]: value
    }));
  };

  const handleNotificationSave = async () => {
    setLoading(true);
    setMessage({ type: '', text: '' });

    try {
      // Save notification settings
      setMessage({ type: 'success', text: 'Notification settings saved successfully!' });
    } catch (error) {
      setMessage({ type: 'danger', text: 'Failed to save notification settings' });
    } finally {
      setLoading(false);
    }
  };

  const toggleTab = (tab) => {
    if (activeTab !== tab) setActiveTab(tab);
  };

  if (!user) {
    return (
      <div className="text-center py-5">
        <Spinner color="primary" />
        <p className="mt-2">Loading settings...</p>
      </div>
    );
  }

  return (
    <div className="container-fluid">
      <div className="row">
        <div className="col-12">
          <div className="d-flex justify-content-between align-items-center mb-4">
            <div>
              <h1 className="h3 mb-0">Teacher Settings</h1>
              <p className="text-muted">Manage your account preferences and security settings</p>
            </div>
            <Badge color="primary" className="px-3 py-2">
              <i className="ni ni-single-02 mr-2"></i>
              Teacher Account
            </Badge>
          </div>

          {message.text && (
            <Alert color={message.type} className="mb-4">
              <i className={`ni ni-${message.type === 'success' ? 'check-bold' : 'bell-55'} mr-2`}></i>
              {message.text}
            </Alert>
          )}

          <Nav tabs className="mb-4">
            <NavItem>
              <NavLink
                className={activeTab === '1' ? 'active' : ''}
                onClick={() => toggleTab('1')}
              >
                <i className="ni ni-single-02 mr-2"></i>
                Profile
              </NavLink>
            </NavItem>
            <NavItem>
              <NavLink
                className={activeTab === '2' ? 'active' : ''}
                onClick={() => toggleTab('2')}
              >
                <i className="ni ni-lock-circle-open mr-2"></i>
                Security
              </NavLink>
            </NavItem>
            <NavItem>
              <NavLink
                className={activeTab === '3' ? 'active' : ''}
                onClick={() => toggleTab('3')}
              >
                <i className="ni ni-bell-55 mr-2"></i>
                Notifications
              </NavLink>
            </NavItem>
            <NavItem>
              <NavLink
                className={activeTab === '4' ? 'active' : ''}
                onClick={() => toggleTab('4')}
              >
                <i className="ni ni-settings-gear-65 mr-2"></i>
                Preferences
              </NavLink>
            </NavItem>
          </Nav>

          <TabContent activeTab={activeTab}>
            {/* Profile Tab */}
            <TabPane tabId="1">
              <Card>
                <CardHeader>
                  <h5 className="mb-0">
                    <i className="ni ni-single-02 mr-2"></i>
                    Profile Information
                  </h5>
                </CardHeader>
                <CardBody>
                  <Form onSubmit={handleProfileUpdate}>
                    <Row>
                      <Col md="6">
                        <FormGroup>
                          <Label for="firstName">First Name</Label>
                          <Input
                            id="firstName"
                            type="text"
                            value={profileData.firstName}
                            onChange={(e) => setProfileData({...profileData, firstName: e.target.value})}
                            required
                          />
                        </FormGroup>
                      </Col>
                      <Col md="6">
                        <FormGroup>
                          <Label for="lastName">Last Name</Label>
                          <Input
                            id="lastName"
                            type="text"
                            value={profileData.lastName}
                            onChange={(e) => setProfileData({...profileData, lastName: e.target.value})}
                            required
                          />
                        </FormGroup>
                      </Col>
                    </Row>
                    
                    <Row>
                      <Col md="6">
                        <FormGroup>
                          <Label for="email">Email Address</Label>
                          <Input
                            id="email"
                            type="email"
                            value={profileData.email}
                            onChange={(e) => setProfileData({...profileData, email: e.target.value})}
                            required
                          />
                        </FormGroup>
                      </Col>
                      <Col md="6">
                        <FormGroup>
                          <Label for="phone">Phone Number</Label>
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
                      <Col md="6">
                        <FormGroup>
                          <Label for="position">Position</Label>
                          <Input
                            id="position"
                            type="text"
                            value={profileData.position}
                            onChange={(e) => setProfileData({...profileData, position: e.target.value})}
                          />
                        </FormGroup>
                      </Col>
                    </Row>
                    
                    <div className="text-right">
                      <Button color="primary" type="submit" disabled={loading}>
                        {loading ? <Spinner size="sm" /> : 'Update Profile'}
                      </Button>
                    </div>
                  </Form>
                </CardBody>
              </Card>
            </TabPane>

            {/* Security Tab */}
            <TabPane tabId="2">
              <TwoFactorStatus />
              
              <Card className="mt-4">
                <CardHeader>
                  <h5 className="mb-0">
                    <i className="ni ni-key-25 mr-2"></i>
                    Password Management
                  </h5>
                </CardHeader>
                <CardBody>
                  <p className="text-muted mb-3">
                    Keep your password secure and change it regularly for better account protection.
                  </p>
                  <Button color="outline-primary">
                    <i className="ni ni-key-25 mr-2"></i>
                    Change Password
                  </Button>
                </CardBody>
              </Card>
            </TabPane>

            {/* Notifications Tab */}
            <TabPane tabId="3">
              <Card>
                <CardHeader>
                  <h5 className="mb-0">
                    <i className="ni ni-bell-55 mr-2"></i>
                    Notification Preferences
                  </h5>
                </CardHeader>
                <CardBody>
                  <Row>
                    <Col md="6">
                      <FormGroup check>
                        <Label check>
                          <Input
                            type="checkbox"
                            checked={notificationSettings.emailNotifications}
                            onChange={(e) => handleNotificationChange('emailNotifications', e.target.checked)}
                          />
                          Email Notifications
                        </Label>
                      </FormGroup>
                      <FormGroup check>
                        <Label check>
                          <Input
                            type="checkbox"
                            checked={notificationSettings.smsNotifications}
                            onChange={(e) => handleNotificationChange('smsNotifications', e.target.checked)}
                          />
                          SMS Notifications
                        </Label>
                      </FormGroup>
                      <FormGroup check>
                        <Label check>
                          <Input
                            type="checkbox"
                            checked={notificationSettings.pushNotifications}
                            onChange={(e) => handleNotificationChange('pushNotifications', e.target.checked)}
                          />
                          Push Notifications
                        </Label>
                      </FormGroup>
                    </Col>
                    <Col md="6">
                      <FormGroup check>
                        <Label check>
                          <Input
                            type="checkbox"
                            checked={notificationSettings.taskReminders}
                            onChange={(e) => handleNotificationChange('taskReminders', e.target.checked)}
                          />
                          Task Reminders
                        </Label>
                      </FormGroup>
                      <FormGroup check>
                        <Label check>
                          <Input
                            type="checkbox"
                            checked={notificationSettings.attendanceAlerts}
                            onChange={(e) => handleNotificationChange('attendanceAlerts', e.target.checked)}
                          />
                          Attendance Alerts
                        </Label>
                      </FormGroup>
                      <FormGroup check>
                        <Label check>
                          <Input
                            type="checkbox"
                            checked={notificationSettings.gradeUpdates}
                            onChange={(e) => handleNotificationChange('gradeUpdates', e.target.checked)}
                          />
                          Grade Updates
                        </Label>
                      </FormGroup>
                    </Col>
                  </Row>
                  
                  <div className="text-right mt-3">
                    <Button color="primary" onClick={handleNotificationSave} disabled={loading}>
                      {loading ? <Spinner size="sm" /> : 'Save Preferences'}
                    </Button>
                  </div>
                </CardBody>
              </Card>
            </TabPane>

            {/* Preferences Tab */}
            <TabPane tabId="4">
              <Card>
                <CardHeader>
                  <h5 className="mb-0">
                    <i className="ni ni-settings-gear-65 mr-2"></i>
                    General Preferences
                  </h5>
                </CardHeader>
                <CardBody>
                  <p className="text-muted">
                    Additional preference settings will be available here.
                  </p>
                </CardBody>
              </Card>
            </TabPane>
          </TabContent>
        </div>
      </div>
    </div>
  );
};

export default TeacherSettings;
