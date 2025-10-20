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
import BackupCodesModal from '../../components/BackupCodesModal';
import ChangePasswordModal from '../../components/ChangePasswordModal';
import Disable2FAModal from '../../components/Disable2FAModal';
import TwoFactorAuth from '../../components/TwoFactorAuth';

const TeacherSettings = () => {
  const { user, updateProfile } = useAuth();
  const [activeTab, setActiveTab] = useState('1');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });
  const [profileLoading, setProfileLoading] = useState(true);
  const [lastFetched, setLastFetched] = useState(null);
  const [showBackupCodesModal, setShowBackupCodesModal] = useState(false);
  const [showChangePasswordModal, setShowChangePasswordModal] = useState(false);
  const [showDisable2FAModal, setShowDisable2FAModal] = useState(false);
  const [show2FAModal, setShow2FAModal] = useState(false);
  const [backupCodesCount, setBackupCodesCount] = useState(8);


  
  // Profile data
  const [profileData, setProfileData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    department: ''
  });

  // Two-Factor Authentication Status
  const [twoFAEnabled, setTwoFAEnabled] = useState(false);


  // Fetch user profile data from backend
  useEffect(() => {
    const fetchUserProfile = async () => {
      if (!user) return;
      
             try {
         setProfileLoading(true);
         
         const response = await ApiService.getProfile();
         
         if (response && response.status && response.data) {
           const userData = response.data;
           
           // Extract name components from full_name or use separate fields
           let firstName = '';
           let lastName = '';
           
           if (userData.full_name) {
             const nameParts = userData.full_name.split(' ');
             firstName = nameParts[0] || '';
             lastName = nameParts.slice(1).join(' ') || '';
           } else {
             firstName = userData.first_name || userData.firstName || '';
             lastName = userData.last_name || userData.lastName || '';
           }
           
           // Update profile data with fetched information
           const newProfileData = {
             firstName: firstName,
             lastName: lastName,
             email: userData.email || '',
             phone: userData.contact_num || userData.phone || userData.contactNumber || '',
             department: userData.program || userData.department || ''
           };
           
           setProfileData(newProfileData);
           setLastFetched(new Date());
         } else {
           // Fallback to auth context user data
           if (user) {
             const nameParts = (user.full_name || user.name || '').split(' ');
             const fallbackData = {
               firstName: nameParts[0] || '',
               lastName: nameParts.slice(1).join(' ') || '',
               email: user.email || '',
               phone: user.phone || user.contact_num || '',
               department: user.department || user.program || ''
             };
             setProfileData(fallbackData);
           }
         }
       } catch (error) {
         // Fallback to auth context user data
    if (user) {
           const nameParts = (user.full_name || user.name || '').split(' ');
           const fallbackData = {
             firstName: nameParts[0] || '',
             lastName: nameParts.slice(1).join(' ') || '',
        email: user.email || '',
             phone: user.phone || user.contact_num || '',
             department: user.department || user.program || ''
           };
           setProfileData(fallbackData);
         }
       } finally {
         setProfileLoading(false);
       }
    };

    fetchUserProfile();
  }, [user]);

  // Function to load backup codes count
  const loadBackupCodesCount = async () => {
    try {
      console.log('🔄 Loading backup codes count...');
      const response = await ApiService.getBackupCodes();
      console.log('🔄 Backup codes response:', response);
      
      if (response.success) {
        const count = response.data.count || response.data.remaining_codes || 8;
        console.log('🔄 Setting backup codes count to:', count);
        setBackupCodesCount(count);
      } else {
        console.error('Failed to load backup codes count:', response.message);
        console.log('🔄 Using default count: 8');
        setBackupCodesCount(8);
      }
    } catch (error) {
      console.error('Failed to load backup codes count:', error);
      console.log('🔄 Using default count: 8 due to error');
      setBackupCodesCount(8);
    }
  };

  // Function to refresh backup codes count
  const refreshBackupCodesCount = async () => {
    try {
      console.log('🔄 Refreshing backup codes count...');
      const response = await ApiService.getBackupCodes();
      console.log('🔄 Refresh response:', response);
      
      if (response.success) {
        const count = response.data.count || response.data.remaining_codes || 8;
        console.log('🔄 Setting refreshed count to:', count);
        setBackupCodesCount(count);
      }
    } catch (error) {
      console.error('Failed to refresh backup codes count:', error);
    }
  };

  // Load 2FA status and backup codes count on component mount
  useEffect(() => {
    const load2FAStatus = async () => {
      try {
        const response = await ApiService.get2FAStatus();
        if (response.success) {
          setTwoFAEnabled(response.data.is_enabled || false);
        }
      } catch (error) {
        console.error('Failed to load 2FA status:', error);
      }
    };
    
    load2FAStatus();
    loadBackupCodesCount();
  }, []);

  const handleProfileUpdate = async (e) => {
    e.preventDefault();
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
         full_name: `${profileData.firstName} ${profileData.lastName}`.trim(),
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
      } else {
        setMessage({ type: 'danger', text: response.message || 'Failed to update profile' });
      }
    } catch (error) {
      setMessage({ type: 'danger', text: 'An error occurred while updating profile' });
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

  if (profileLoading) {
    return (
      <div className="text-center py-5">
        <Spinner color="primary" />
        <p className="mt-2">Loading profile information...</p>
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


          </Nav>

          <TabContent activeTab={activeTab}>
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
                             const nameParts = (userData.full_name || '').split(' ');
                             setProfileData({
                               firstName: nameParts[0] || '',
                               lastName: nameParts.slice(1).join(' ') || '',
                               email: userData.email || '',
                               phone: userData.contact_num || userData.phone || '',
                               department: userData.program || userData.department || ''
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
                       {profileLoading ? <Spinner size="sm" /> : 'Refresh'}
                     </Button>
                   </div>
                </CardHeader>
                 <CardBody className="p-4">
                  <Form onSubmit={handleProfileUpdate}>
                     <div className="mb-4">
                       <h6 className="text-muted mb-3">
                         <i className="ni ni-single-02 mr-2"></i>
                         Personal Information
                       </h6>
                    <Row>
                      <Col md="6">
                           <div className="mb-3">
                             <Label for="firstName" className="font-weight-bold text-dark">First Name</Label>
                          <Input
                            id="firstName"
                            type="text"
                            value={profileData.firstName}
                            onChange={(e) => setProfileData({...profileData, firstName: e.target.value})}
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
                           <div className="mb-3">
                             <Label for="lastName" className="font-weight-bold text-dark">Last Name</Label>
                          <Input
                            id="lastName"
                            type="text"
                            value={profileData.lastName}
                            onChange={(e) => setProfileData({...profileData, lastName: e.target.value})}
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
                    
                     <div className="mb-4">
                       <h6 className="text-muted mb-3">
                         <i className="ni ni-email-83 mr-2"></i>
                         Contact Information
                       </h6>
                    <Row>
                      <Col md="6">
                           <div className="mb-3">
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
                      <Col md="6">
                           <div className="mb-3">
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
                    
                     <div className="mb-4">
                       <h6 className="text-muted mb-3">
                         <i className="ni ni-building mr-2"></i>
                         Academic Information
                       </h6>
                    <Row>
                      <Col md="6">
                           <div className="mb-3">
                             <Label for="department" className="font-weight-bold text-dark">Department</Label>
                          <Input
                            id="department"
                            type="select"
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
                              >
                                <option value="">Select Department</option>
                                <option value="Information Technology">Information Technology</option>
                                <option value="Computer Science">Computer Science</option>
                                <option value="Information System">Information System</option>
                                <option value="Computer Technology">Computer Technology</option>
                              </Input>
                           </div>
                      </Col>
                    </Row>
                     </div>
                     
                     <div className="text-center pt-4 border-top">
                       <Button 
                         color="primary" 
                         size="lg"
                         type="submit" 
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
                             <Spinner size="sm" className="mr-2" />
                             Updating...
                           </>
                         ) : (
                           <>
                             <i className="ni ni-single-02 mr-2"></i>
                             Update Profile
                           </>
                         )}
                      </Button>
                    </div>
                  </Form>
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
                            <h6 className="mb-1 font-weight-bold">Security Level: {twoFAEnabled ? 'Enhanced' : 'Basic'}</h6>
                            <small className="text-muted">{twoFAEnabled ? 'Your account is protected with two-factor authentication' : 'Your account uses basic password authentication only'}</small>
                          </div>
                        </div>
                        <Badge color={twoFAEnabled ? "success" : "secondary"} className="px-3 py-2">
                          <i className={`ni ni-${twoFAEnabled ? 'check-bold' : 'fat-remove'} mr-1`}></i>
                          {twoFAEnabled ? 'ENABLED' : 'DISABLED'}
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
                    
                    <Alert color={twoFAEnabled ? "success" : "warning"} className="border-0" style={{ 
                      borderRadius: '12px',
                      background: twoFAEnabled ? '#28a745' : '#ffc107',
                      border: twoFAEnabled ? '1px solid #28a745' : '1px solid #ffc107'
                    }}>
                      <i className={`ni ni-${twoFAEnabled ? 'check-bold' : 'fat-remove'} mr-2`}></i>
                      <strong>{twoFAEnabled ? '2FA is Active!' : '2FA is Disabled!'}</strong> {twoFAEnabled ? 'Your account is now protected with two-factor authentication. You\'ll need to enter a verification code each time you log in.' : 'Your account is not protected with two-factor authentication. Enable 2FA for enhanced security.'}
                    </Alert>
                    
                    <div className="d-flex flex-wrap gap-2 mt-3">
                      {twoFAEnabled ? (
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

                      <Button 
                        color="outline-info" 
                        size="sm"
                        className="px-3 py-2"
                        style={{ 
                          borderRadius: '20px',
                          border: '1px solid #17a2b8',
                          color: '#17a2b8',
                          transition: 'all 0.3s ease',
                          cursor: 'pointer'
                        }}
                        onClick={() => {
                          console.log('🧪 Testing backup codes API...');
                          loadBackupCodesCount();
                        }}
                      >
                        <i className="ni ni-chart-bar-32 mr-2"></i>
                        Test API
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
        </div>
      </div>
      
      {/* Backup Codes Management Modal */}
              <BackupCodesModal
          isOpen={showBackupCodesModal}
          toggle={() => setShowBackupCodesModal(!showBackupCodesModal)}
          onSuccess={() => {
            setShowBackupCodesModal(false);
            // Refresh the backup codes count after modal is closed
            setTimeout(() => {
              refreshBackupCodesCount();
            }, 100);
          }}
          onCancel={() => setShowBackupCodesModal(false)}
        />
      
      {/* Change Password Modal */}
      <ChangePasswordModal
        isOpen={showChangePasswordModal}
        toggle={() => setShowChangePasswordModal(!showChangePasswordModal)}
        onSuccess={() => {
          setShowChangePasswordModal(false);
          // Optionally show success message or refresh user data
        }}
        onCancel={() => setShowChangePasswordModal(false)}
      />

      {/* Disable 2FA Modal */}
      <Disable2FAModal
        isOpen={showDisable2FAModal}
        toggle={() => setShowDisable2FAModal(!showDisable2FAModal)}
        onSuccess={() => {
          setShowDisable2FAModal(false);
          setTwoFAEnabled(false);
          setMessage({ type: 'success', text: '2FA has been disabled successfully!' });
        }}
        onCancel={() => setShowDisable2FAModal(false)}
      />

      {/* Enable 2FA Modal */}
      <TwoFactorAuth
        isOpen={show2FAModal}
        toggle={() => setShow2FAModal(!show2FAModal)}
        onSuccess={() => {
          setShow2FAModal(false);
          setTwoFAEnabled(true);
          setMessage({ type: 'success', text: '2FA has been enabled successfully!' });
        }}
        onCancel={() => setShow2FAModal(false)}
      />
    </div>
  );
};

export default TeacherSettings;
