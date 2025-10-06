import React, { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";
import { getProfilePictureUrl, getUserInitials, getAvatarColor } from "../../utils/profilePictureUtils";
import ApiService from "../../services/api";
import {
  Navbar,
  Container,
  Form,
  FormGroup,
  InputGroup,
  InputGroupAddon,
  InputGroupText,
  Input,
  Nav,
  UncontrolledDropdown,
  DropdownToggle,
  DropdownMenu,
  DropdownItem,
  Media,
} from "reactstrap";

const TeacherNavbar = (props) => {
  const location = useLocation();
  const { user, logout } = useAuth();
  
  // State for fetched user profile data
  const [userProfile, setUserProfile] = useState(null);
  const [profileLoading, setProfileLoading] = useState(false);

  // Fetch user profile data from backend using the correct endpoint
  useEffect(() => {
    const fetchUserProfile = async () => {
      if (!user) return;
      
      try {
        setProfileLoading(true);
        console.log('Fetching user profile from /user/me endpoint...');
        
        const response = await ApiService.getProfile();
        console.log('Profile response:', response);
        
        if (response && response.status && response.data) {
          setUserProfile(response.data);
          console.log('✅ Profile fetched successfully:', response.data);
          console.log('Profile picture:', response.data.profile_pic);
        } else {
          console.warn('❌ Failed to fetch profile:', response);
        }
      } catch (error) {
        console.error('Error fetching profile:', error);
      } finally {
        setProfileLoading(false);
      }
    };

    fetchUserProfile();
  }, [user]);

  // Use fetched profile data if available, otherwise fall back to auth context user
  const currentUser = userProfile || user;
  
  // Get profile picture URL and fallback data
  const profilePictureUrl = getProfilePictureUrl(currentUser);
  const userInitials = getUserInitials(currentUser);
  const avatarColor = getAvatarColor(currentUser);

  return (
    <>
      <Navbar
        className="navbar-top navbar-dark"
        expand="md"
        id="navbar-main"
        style={{
          position: 'sticky',
          top: 0,
          width: '100%',
          zIndex: 1030,
          background: 'linear-gradient(90deg, #1cb5e0 0%, #2096ff 100%)',
          minHeight: 70,
          boxShadow: '0 2px 8px rgba(44,62,80,0.07)'
        }}
      >
        <Container fluid>
          <Link
            className="h4 mb-0 text-white text-uppercase"
            to="/"
            style={{ display: 'flex', alignItems: 'center', marginLeft: 20 }}
          >
            {props.brandText}
          </Link>
          <Form className="navbar-search navbar-search-dark form-inline mr-3 d-none d-md-flex ml-lg-auto">
            <FormGroup className="mb-0">
              <InputGroup className="input-group-alternative">
                <InputGroupAddon addonType="prepend">
                  <InputGroupText>
                    <i className="fas fa-search" />
                  </InputGroupText>
                </InputGroupAddon>
                <Input placeholder="Search" type="text" />
              </InputGroup>
            </FormGroup>
          </Form>
          <Nav className="align-items-center d-none d-md-flex" navbar>
            <UncontrolledDropdown nav>
              <DropdownToggle className="pr-0" nav>
                <Media className="align-items-center">
                  {/* Profile Picture Circle */}
                  <span 
                    className="avatar avatar-sm rounded-circle mr-2"
                    style={{
                      width: '32px',
                      height: '32px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      backgroundColor: avatarColor,
                      color: 'white',
                      fontSize: '14px',
                      fontWeight: 'bold',
                      border: '2px solid rgba(255,255,255,0.3)'
                    }}
                  >
                    {profilePictureUrl ? (
                      <img
                        alt="Profile"
                        src={profilePictureUrl}
                        style={{
                          width: '100%',
                          height: '100%',
                          borderRadius: '50%',
                          objectFit: 'cover'
                        }}
                        onError={(e) => {
                          console.log('❌ Profile image failed to load, falling back to initials');
                          // Fallback to initials if image fails to load
                          e.target.style.display = 'none';
                          e.target.nextSibling.style.display = 'flex';
                        }}
                        onLoad={(e) => {
                          console.log('✅ Profile image loaded successfully');
                        }}
                      />
                    ) : null}
                    <span 
                      style={{
                        display: profilePictureUrl ? 'none' : 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        width: '100%',
                        height: '100%'
                      }}
                    >
                      {userInitials}
                    </span>
                  </span>
                  <Media className="d-none d-lg-block">
                    <span className="mb-0 text-sm font-weight-bold">
                      {currentUser?.full_name || currentUser?.name || 'Teacher User'}
                    </span>
                  </Media>
                </Media>
              </DropdownToggle>
              <DropdownMenu className="dropdown-menu-arrow" right style={{ position: 'fixed', top: 70, right: 8, zIndex: 2147483646 }}>
                <DropdownItem className="noti-title" header tag="div">
                  <h6 className="text-overflow m-0">Welcome, {currentUser?.full_name || currentUser?.name || 'User'}!</h6>
                </DropdownItem>
                <DropdownItem to="/teacher/user-profile" tag={Link}>
                  <i className="ni ni-single-02" />
                  <span>My profile</span>
                </DropdownItem>
                <DropdownItem to="/teacher/settings" tag={Link}>
                  <i className="ni ni-settings-gear-65" />
                  <span>Settings</span>
                </DropdownItem>
                <DropdownItem divider />
                <DropdownItem href="#logout" onClick={async (e) => { e.preventDefault(); await logout(); }}>
                  <i className="ni ni-user-run" />
                  <span>Logout</span>
                </DropdownItem>
              </DropdownMenu>
            </UncontrolledDropdown>
          </Nav>
        </Container>
      </Navbar>
    </>
  );
};

export default TeacherNavbar; 