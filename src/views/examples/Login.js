/*!

=========================================================
* Argon Dashboard React - v1.2.4
=========================================================

* Product Page: https://www.creative-tim.com/product/argon-dashboard-react
* Copyright 2024 Creative Tim (https://www.creative-tim.com)
* Licensed under MIT (https://github.com/creativetimofficial/argon-dashboard-react/blob/master/LICENSE.md)

* Coded by Creative Tim

=========================================================

* The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

*/

import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";
import {
  Card,
  CardBody,
  CardHeader,
  Form,
  FormGroup,
  Input,
  InputGroup,
  InputGroupAddon,
  InputGroupText,
  Button,
  Alert,
  Spinner,
  Row,
  Col,
} from "reactstrap";
import UnifiedLoginForm from "../../components/UnifiedLoginForm";
import Login2FAModal from "../../components/Login2FAModal";
import GoogleOAuthButton from "../../components/GoogleOAuthButton";

const Login = () => {
  const [rememberMe, setRememberMe] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [show2FAModal, setShow2FAModal] = useState(false);
  const [tempUserData, setTempUserData] = useState(null);
  const navigate = useNavigate();
  const { login: authLogin, complete2FALogin } = useAuth();

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      // Use the auth context login method
      const result = await authLogin(email, password);
      console.log('🔐 Login.js: Login result:', result);
      
      if (result.success) {
        if (result.requires2FA) {
          console.log('🔐 Login.js: 2FA required, showing modal');
          // Store temporary user data and show 2FA modal
          setTempUserData(result.tempUser);
          setShow2FAModal(true);
        } else {
          console.log('🔐 Login.js: No 2FA required, login successful');
          // Normal login success - navigate based on role
          const role = result.data.role || (result.data.user && result.data.user.role);
          if (role === "student") {
            navigate("/student/index");
          } else if (role === "admin") {
            navigate("/admin/index");
          } else if (role === "teacher") {
            navigate("/teacher/index");
          } else {
            navigate("/");
          }
        }
      } else {
        setError(result.message || 'Login failed');
      }
    } catch (error) {
      setError('Login failed. Please check your credentials.');
      console.error('Login error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSuccess = (userData, variant) => {
    console.log('Google authentication successful:', userData);
    // Navigate based on user role
    const role = userData.role || (userData.user && userData.user.role);
    if (role === "student") {
      navigate("/student/index");
    } else if (role === "admin") {
      navigate("/admin/index");
    } else if (role === "teacher") {
      navigate("/teacher/index");
    } else {
      navigate("/");
    }
  };

  const handleGoogleError = (errorMessage) => {
    setError(errorMessage);
  };

  // 🔐 NEW: Handle 2FA verification success
  const handle2FASuccess = async (verificationData) => {
    console.log('🔐 Login.js: handle2FASuccess called with:', verificationData);
    try {
      console.log('🔐 Login.js: Calling complete2FALogin...');
      const result = await complete2FALogin(email, verificationData.code || verificationData);
      console.log('🔐 Login.js: complete2FALogin result:', result);
      
      if (result.success) {
        console.log('🔐 Login.js: 2FA login completed successfully');
        console.log('🔐 Login.js: User data:', result.data);
        console.log('🔐 Login.js: About to close modal and navigate...');
        
        setShow2FAModal(false);
        
        // Navigate based on user role
        const role = result.data.role || (result.data.user && result.data.user.role);
        console.log('🔐 Login.js: User role:', role);
        console.log('🔐 Login.js: Navigating to role-specific page...');
        
        if (role === "student") {
          navigate("/student/index");
        } else if (role === "admin") {
          navigate("/admin/index");
        } else if (role === "teacher") {
          navigate("/teacher/index");
        } else {
          navigate("/");
        }
        
        console.log('🔐 Login.js: Navigation completed');
      } else {
        console.error('🔐 Login.js: 2FA login completion failed:', result.message);
        setError(result.message || 'Failed to complete 2FA login');
      }
    } catch (error) {
      console.error('🔐 Login.js: Error completing 2FA login:', error);
      setError(error.message || 'Error completing 2FA verification');
    }
  };

  // 🔐 NEW: Handle 2FA cancellation
  const handle2FACancel = () => {
    console.log('🔐 Login.js: 2FA cancelled, clearing temp data');
    setShow2FAModal(false);
    setTempUserData(null);
    // Clear any temporary data
    localStorage.removeItem('temp_token');
    localStorage.removeItem('temp_user');
  };


  return (
    <>
      <Col lg="4" md="6" sm="8" xs="10">
        <Card className="bg-secondary shadow border-0">
          <CardHeader className="pb-2 border-0">
            <div className="text-center">
              <h1 className="display-5 text-dark mb-0" style={{ fontWeight: 700, fontSize: '1.8rem' }}>Login</h1>
            </div>
          </CardHeader>
          <CardBody className="px-lg-4 py-lg-4 px-3 py-3">
            <Form role="form" onSubmit={handleLogin}>
              <FormGroup className="mb-3">
                <InputGroup className="input-group-alternative">
                  <InputGroupAddon addonType="prepend">
                    <InputGroupText>
                      <i className="ni ni-email-83" />
                    </InputGroupText>
                  </InputGroupAddon>
                  <Input
                    placeholder="Email"
                    type="email"
                    autoComplete="new-email"
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    style={{ fontSize: '0.9rem' }}
                  />
                </InputGroup>
              </FormGroup>
              <FormGroup className="mb-3">
                <InputGroup className="input-group-alternative">
                  <InputGroupAddon addonType="prepend">
                    <InputGroupText>
                      <i className="ni ni-lock-circle-open" />
                    </InputGroupText>
                  </InputGroupAddon>
                  <Input
                    placeholder="Password"
                    type="password"
                    autoComplete="new-password"
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    style={{ fontSize: '0.9rem' }}
                  />
                </InputGroup>
              </FormGroup>
              {error && <div className="text-danger text-center mb-3" style={{ fontSize: '0.8rem' }}>{error}</div>}
              <div className="custom-control custom-control-alternative custom-checkbox mb-3">
                <input
                  className="custom-control-input"
                  id="customCheckLogin"
                  type="checkbox"
                  checked={rememberMe}
                  onChange={() => setRememberMe(!rememberMe)}
                />
                <label
                  className="custom-control-label"
                  htmlFor="customCheckLogin"
                  style={{ fontSize: '0.85rem' }}
                >
                  <span className="text-muted">Remember me</span>
                </label>
              </div>
              <Button className="my-4 w-100" color="primary" type="submit" disabled={loading}>
                {loading ? 'Signing in...' : 'Sign in'}
              </Button>
              <hr style={{ border: 'none', height: '1px', background: '#e9ecef', margin: '1.5rem 0 1rem 0' }} />
              <div className="text-center text-muted mb-2">
                <small style={{ fontSize: '0.75rem' }}>Or sign in with</small>
              </div>
              <div className="btn-wrapper text-center">
                <GoogleOAuthButton
                  text="Sign in with Google"
                  variant="sign-in"
                  onSuccess={handleGoogleSuccess}
                  onError={handleGoogleError}
                  disabled={loading}
                  className="w-100"
                />
              </div>
              

            </Form>
          </CardBody>
        </Card>
        <Row className="mt-3">
          <Col xs="6">
            <Link
              className="text-light"
              to="/auth/forgot-password"
            >
              <small style={{ fontSize: '0.75rem' }}>Forgot password?</small>
            </Link>
          </Col>
          <Col className="text-right" xs="6">
            <Link
              className="text-light"
              to="/auth/register"
            >
              <small style={{ fontSize: '0.75rem' }}>Create new account</small>
            </Link>
          </Col>
        </Row>
      </Col>

      {/* 🔐 NEW: 2FA Verification Modal */}
      <Login2FAModal
        isOpen={show2FAModal}
        toggle={() => setShow2FAModal(!show2FAModal)}
        email={email}
        onVerificationSuccess={handle2FASuccess}
        onCancel={handle2FACancel}
      />
    </>
  );
};

export default Login;
