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

const StudentSettings = () => {
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
    student_number: '',
    course: '',
    year_level: '',
    section: '',
    address: ''
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



  // Privacy settings
  const [privacySettings, setPrivacySettings] = useState({
    profileVisibility: 'classmates',
    showOnlineStatus: true,
    allowDirectMessages: true,
    shareProgress: false
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
    
    fetchUserProfile();
    load2FAStatus();
    loadBackupCodesCount();
  }, [user]);

  // Debug effect to log profile data changes
  useEffect(() => {
    console.log('🔍 Profile data updated:', profileData);
    console.log('🔍 Current field values:');
    console.log('  - student_number:', profileData.student_number);
    console.log('  - course:', profileData.course);
    console.log('  - year_level:', profileData.year_level);
    console.log('  - section:', profileData.section);
  }, [profileData]);

  // Function to fetch user profile data from backend
  const fetchUserProfile = async () => {
    if (!user) return;
    
    try {
      setProfileLoading(true);
      
      console.log('🔍 Starting profile fetch for user:', user);
      const response = await ApiService.getProfile();
      console.log('🔍 Raw API response:', response);
      
      if (response && response.status && response.data) {
        const userData = response.data;
        console.log('🔍 Fetched user data:', userData);
        console.log('🔍 Available fields:', Object.keys(userData));
        
        // Update profile data with fetched information - comprehensive mapping
        const newProfileData = {
          full_name: userData.full_name || userData.name || userData.first_name + ' ' + userData.last_name || userData.student_name || '',
          email: userData.email || userData.email_address || userData.student_email || '',
          phone: userData.contact_num || userData.phone || userData.contactNumber || userData.mobile || userData.telephone || userData.student_phone || userData.phone_number || '',
          student_number: userData.student_num || userData.student_number || userData.studentNumber || userData.student_id || userData.id_number || userData.student_id_number || userData.enrollment_number || userData.registration_number || userData.student_code || '',
          course: userData.program || userData.course || userData.major || userData.degree || userData.course_name || userData.study_program || userData.academic_program || userData.study_major || userData.student_course || '',
          year_level: userData.year_level || userData.yearLevel || userData.year || userData.academic_year || userData.level || userData.study_year || userData.current_year || userData.student_year || userData.academic_level || '',
          section: userData.section_name || userData.section || userData.section_name || userData.class_section || userData.group || userData.class_group || userData.student_section || userData.class_name || userData.study_group || '',
          address: userData.address || userData.full_address || userData.street_address || userData.location || userData.home_address || userData.student_address || userData.permanent_address || ''
        };
        
        // Clean up any undefined values and log the mapping
        Object.keys(newProfileData).forEach(key => {
          if (newProfileData[key] === undefined) {
            newProfileData[key] = '';
          }
          console.log(`🔍 Field mapping - ${key}:`, {
            original: userData[key],
            mapped: newProfileData[key],
            fallbacks: [
              userData.student_number || userData.studentNumber || userData.student_id || userData.id_number || userData.student_id_number,
              userData.course || userData.program || userData.major || userData.degree || userData.course_name || userData.study_program,
              userData.year_level || userData.yearLevel || userData.year || userData.academic_year || userData.level || userData.study_year
            ]
          });
        });
        
        console.log('🔍 Final processed profile data:', newProfileData);
        console.log('🔍 Key field values:');
        console.log('  - student_number:', newProfileData.student_number);
        console.log('  - course:', newProfileData.course);
        console.log('  - year_level:', newProfileData.year_level);
        console.log('  - section:', newProfileData.section);
        setProfileData(newProfileData);
        setLastFetched(new Date());
      } else {
        console.log('❌ No profile data in response, using fallback');
        // Fallback to auth context user data
        if (user) {
          const fallbackData = {
            full_name: user.full_name || user.name || user.first_name + ' ' + user.last_name || user.student_name || '',
            email: user.email || user.email_address || user.student_email || '',
            phone: user.contact_num || user.phone || user.contactNumber || user.mobile || user.student_phone || user.phone_number || '',
            student_number: user.student_num || user.student_number || user.studentNumber || user.student_id || user.id_number || user.student_id_number || user.enrollment_number || user.registration_number || user.student_code || '',
            course: user.program || user.course || user.major || user.degree || user.study_program || user.academic_program || user.study_major || user.student_course || '',
            year_level: user.year_level || user.yearLevel || user.year || user.academic_year || user.level || user.study_year || user.current_year || user.student_year || user.academic_level || '',
            section: user.section_name || user.section || user.section_name || user.class_section || user.group || user.class_group || user.student_section || user.class_name || user.study_group || '',
            address: user.address || user.full_address || user.street_address || user.student_address || user.permanent_address || ''
          };
          
          // Clean up any undefined values
          Object.keys(fallbackData).forEach(key => {
            if (fallbackData[key] === undefined) {
              fallbackData[key] = '';
            }
          });
          
          console.log('🔍 Using fallback profile data:', fallbackData);
          setProfileData(fallbackData);
        }
      }
    } catch (error) {
      console.error('❌ Error fetching student profile:', error);
      // Fallback to auth context user data
      if (user) {
        const fallbackData = {
          full_name: user.full_name || user.name || user.first_name + ' ' + user.last_name || user.student_name || '',
          email: user.email || user.email_address || user.student_email || '',
          phone: user.contact_num || user.phone || user.contactNumber || user.mobile || user.student_phone || user.phone_number || '',
          student_number: user.student_num || user.student_number || user.studentNumber || user.student_id || user.id_number || user.student_id_number || user.enrollment_number || user.registration_number || user.student_code || '',
          course: user.program || user.course || user.major || user.degree || user.study_program || user.academic_program || user.study_major || user.student_course || '',
          year_level: user.year_level || user.yearLevel || user.year || user.academic_year || user.level || user.study_year || user.current_year || user.student_year || user.academic_level || '',
          section: user.section_name || user.section || user.section_name || user.class_section || user.group || user.class_group || user.student_section || user.class_name || user.study_group || '',
          address: user.address || user.full_address || user.street_address || user.student_address || user.permanent_address || ''
        };
        
        // Clean up any undefined values
        Object.keys(fallbackData).forEach(key => {
          if (fallbackData[key] === undefined) {
            fallbackData[key] = '';
          }
        });
        
        console.log('🔍 Using error fallback profile data:', fallbackData);
        setProfileData(fallbackData);
      }
    } finally {
      setProfileLoading(false);
    }
  };

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

      // Validate required profile fields
      if (!profileData.full_name || !profileData.email) {
        throw new Error('Full name and email are required fields');
      }

      console.log('Updating student profile with data:', profileData);

      // Prepare data for backend update - comprehensive mapping
      const updateData = {
        full_name: profileData.full_name.trim(),
        email: profileData.email.trim(),
        contact_num: profileData.phone || '',
        student_number: profileData.student_number || '',
        course: profileData.course || '',
        year_level: profileData.year_level || '',
        section: profileData.section || '',
        address: profileData.address || '',
        role: user.role,
        user_id: userId
      };

      console.log('Sending update data to backend:', updateData);

      const response = await ApiService.updateProfile(updateData);
      console.log('Backend update response:', response);
      
      if (response.status) {
        // Update local auth context
        await updateProfile(updateData);
        setMessage({ type: 'success', text: 'Profile updated successfully!' });
        setLastFetched(new Date());
        
        // Refresh profile data to ensure consistency
        setTimeout(() => {
          fetchUserProfile();
        }, 1000);
      } else {
        setMessage({ type: 'danger', text: response.message || 'Failed to update profile' });
      }
    } catch (error) {
      console.error('Error updating student profile:', error);
      setMessage({ type: 'danger', text: error.message || 'An error occurred while updating profile' });
    } finally {
      setLoading(false);
    }
  };

  // Function to manually refresh profile data
  const handleProfileRefresh = async () => {
    try {
      setMessage({ type: 'info', text: 'Refreshing profile data...' });
      await fetchUserProfile();
      setMessage({ type: 'success', text: 'Profile refreshed successfully!' });
    } catch (error) {
      console.error('Error refreshing profile:', error);
      setMessage({ type: 'danger', text: 'Failed to refresh profile data' });
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
                    className={classnames({ active: activeTab === '3' })}
                    onClick={() => toggleTab('3')}
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
                          onClick={handleProfileRefresh}
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
                          <i className="ni ni-badge mr-2"></i>
                          Student Information
                        </h6>
                        <Row>
                          <Col md="6">
                            <div className="mb-2">
                              <Label for="studentNumber" className="font-weight-bold text-dark">Student Number</Label>
                              <Input
                                id="studentNumber"
                                type="text"
                                value={profileData.student_number}
                                onChange={(e) => setProfileData({...profileData, student_number: e.target.value})}
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
                        </Row>
                      </div>
                      
                      <div className="mb-3">
                        <h6 className="text-muted mb-2">
                          <i className="ni ni-building mr-2"></i>
                          Academic Information
                        </h6>
                        <Row>
                          <Col md="4">
                            <div className="mb-2">
                              <Label for="course" className="font-weight-bold text-dark">Course</Label>
                              <Input
                                id="course"
                                type="select"
                                value={profileData.course}
                                onChange={(e) => setProfileData({...profileData, course: e.target.value})}
                                className="border-0"
                                style={{ 
                                  borderRadius: '12px',
                                  padding: '12px 16px',
                                  fontSize: '14px',
                                  border: '1px solid #e9ecef',
                                  color: '#333',
                                  backgroundColor: '#f8f9fa'
                                }}
                              >
                                <option value="">Select Course</option>
                                <option value="Bachelor of Science in Information Technology">Bachelor of Science in Information Technology</option>
                                <option value="Bachelor of Science in Computer Science">Bachelor of Science in Computer Science</option>
                                <option value="Bachelor of Science in Engineering">Bachelor of Science in Engineering</option>
                                <option value="Bachelor of Science in Business">Bachelor of Science in Business</option>
                                <option value="Information Technology">Information Technology</option>
                                <option value="Computer Science">Computer Science</option>
                                <option value="Engineering">Engineering</option>
                                <option value="Business">Business</option>
                              </Input>
                            </div>
                          </Col>
                          <Col md="4">
                            <div className="mb-2">
                              <Label for="yearLevel" className="font-weight-bold text-dark">Year Level</Label>
                              <Input
                                id="yearLevel"
                                type="select"
                                value={profileData.year_level}
                                onChange={(e) => setProfileData({...profileData, year_level: e.target.value})}
                                className="border-0"
                                style={{ 
                                  borderRadius: '12px',
                                  padding: '12px 16px',
                                  fontSize: '14px',
                                  border: '1px solid #e9ecef',
                                  color: '#333',
                                  backgroundColor: '#f8f9fa'
                                }}
                              >
                                <option value="">Select Year</option>
                                <option value="1">1st Year</option>
                                <option value="2">2nd Year</option>
                                <option value="3">3rd Year</option>
                                <option value="4">4th Year</option>
                                <option value="1st Year">1st Year</option>
                                <option value="2nd Year">2nd Year</option>
                                <option value="3rd Year">3rd Year</option>
                                <option value="4th Year">4th Year</option>
                              </Input>
                            </div>
                          </Col>
                          <Col md="4">
                            <div className="mb-2">
                              <Label for="section" className="font-weight-bold text-dark">Section</Label>
                              <Input
                                id="section"
                                type="text"
                                value={profileData.section}
                                onChange={(e) => setProfileData({...profileData, section: e.target.value})}
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
                          <i className="ni ni-pin-3 mr-2"></i>
                          Address Information
                        </h6>
                        <Row>
                          <Col md="12">
                            <div className="mb-2">
                              <Label for="address" className="font-weight-bold text-dark">Address</Label>
                              <Input
                                id="address"
                                type="textarea"
                                value={profileData.address}
                                onChange={(e) => setProfileData({...profileData, address: e.target.value})}
                                className="border-0"
                                style={{ 
                                  borderRadius: '12px',
                                  padding: '12px 16px',
                                  fontSize: '14px',
                                  border: '1px solid #e9ecef',
                                  color: '#333',
                                  backgroundColor: '#f8f9fa',
                                  minHeight: '80px'
                                }}
                              />
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



                {/* Privacy Tab */}
                <TabPane tabId="4">
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

      {/* Manage Backup Codes Modal */}
      <BackupCodesModal
        isOpen={showBackupCodesModal}
        toggle={() => setShowBackupCodesModal(!showBackupCodesModal)}
        onSuccess={() => {
          setMessage({ type: 'success', text: 'Backup codes updated successfully!' });
          setShowBackupCodesModal(false);
        }}
        onCancel={() => setShowBackupCodesModal(false)}
      />

      {/* Change Password Modal */}
      <ChangePasswordModal
        isOpen={showChangePasswordModal}
        toggle={() => setShowChangePasswordModal(!showChangePasswordModal)}
        onSuccess={() => {
          setMessage({ type: 'success', text: 'Password updated successfully!' });
          setShowChangePasswordModal(false);
        }}
        onCancel={() => setShowChangePasswordModal(false)}
      />
    </div>
  );
};

export default StudentSettings;
