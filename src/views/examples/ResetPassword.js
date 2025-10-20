import React, { useState, useEffect } from "react";
import {
  Button,
  Card,
  CardHeader,
  CardBody,
  FormGroup,
  Form,
  Input,
  InputGroupAddon,
  InputGroupText,
  InputGroup,
  Col,
  Alert,
  Spinner,
} from "reactstrap";
import { useNavigate, useSearchParams } from "react-router-dom";
import ApiService from "../../services/api";

const ResetPassword = () => {
  const [searchParams] = useSearchParams();
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [passwordVisible, setPasswordVisible] = useState({
    newPassword: false,
    confirmPassword: false
  });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [token, setToken] = useState("");
  const navigate = useNavigate();

  const togglePasswordVisibility = (fieldName) => {
    setPasswordVisible(prev => ({
      ...prev,
      [fieldName]: !prev[fieldName]
    }));
  };

  useEffect(() => {
    // Get token from URL query parameter
    const tokenFromUrl = searchParams.get('token');
    if (tokenFromUrl) {
      setToken(tokenFromUrl);
    } else {
      setError("Invalid reset link. Please request a new password reset.");
    }
  }, [searchParams]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Reset states
    setLoading(true);
    setMessage("");
    setError("");

    try {
      // Validate passwords
      if (!newPassword || !confirmPassword) {
        setError("Please fill in all fields");
        setLoading(false);
        return;
      }

      if (newPassword.length < 8) {
        setError("Password must be at least 8 characters long");
        setLoading(false);
        return;
      }

      if (newPassword !== confirmPassword) {
        setError("Passwords do not match");
        setLoading(false);
        return;
      }

      // Call the reset password API
      const response = await ApiService.resetPassword(token, newPassword);
      
      const responseMessage = response?.message || "";
      const isSuccess =
        (response && (response.status === "success" || response.success === true)) ||
        /password has been reset|reset successful/i.test(responseMessage);

      if (isSuccess) {
        setSuccess(true);
        setMessage(responseMessage || "Password has been reset successfully. You can now login with your new password.");
      } else {
        setError(responseMessage || "Failed to reset password. Please try again.");
      }
    } catch (error) {
      console.error("Reset password error:", error);
      setError(error.message || "Failed to reset password. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleBackToLogin = () => {
    navigate("/auth/login");
  };

  const handleRequestNewReset = () => {
    navigate("/auth/forgot-password");
  };

  if (!token) {
    return (
      <Col lg="5" md="7">
        <Card className="bg-secondary shadow border-0">
          <CardBody className="px-lg-5 py-lg-5 text-center">
            <div className="mb-3">
              <i className="ni ni-key-25 text-warning" style={{ fontSize: "3rem" }}></i>
            </div>
            <h5 className="text-warning mb-3">Invalid Reset Link</h5>
            <p className="text-muted mb-4">This password reset link is invalid or has expired.</p>
            <Button 
              color="primary" 
              onClick={handleRequestNewReset}
              className="mb-3"
            >
              Request New Reset
            </Button>
            <div>
              <Button 
                color="link" 
                className="p-0 text-light"
                onClick={handleBackToLogin}
                style={{ textDecoration: "none" }}
              >
                <small>Back to Login</small>
              </Button>
            </div>
          </CardBody>
        </Card>
      </Col>
    );
  }

  return (
    <Col lg="5" md="7">
      <Card className="bg-secondary shadow border-0">
        <CardHeader className="bg-transparent pb-2">
          <div className="text-muted text-center">
            <small>Reset Password</small>
          </div>
          <div className="text-center text-muted">
            <small>Enter your new password below</small>
          </div>
        </CardHeader>
        <CardBody className="px-lg-5 py-lg-5">
          {success ? (
            // Success state
            <div className="text-center">
              <div className="alert alert-success mb-3" role="alert" style={{ backgroundColor: '#62bf45', borderColor: '#62bf45', color: '#fff' }}>
                <i className="ni ni-check-bold mr-2"></i>
                {message}
              </div>
              <div className="mb-3">
                <i className="ni ni-check-bold text-success" style={{ fontSize: "3rem" }}></i>
              </div>
              <h5 className="text-success mb-3">Password Reset Successful!</h5>
              <Button 
                color="primary" 
                onClick={handleBackToLogin}
                className="mb-3"
              >
                Go to Login
              </Button>
            </div>
          ) : (
            // Form state
            <Form role="form" onSubmit={handleSubmit}>
              {error && (
                <Alert color="danger" className="mb-3">
                  <i className="ni ni-notification-70 mr-2"></i>
                  {error}
                </Alert>
              )}
              
              <FormGroup className="mb-3">
                <InputGroup className="input-group-alternative">
                  <InputGroupAddon addonType="prepend">
                    <InputGroupText>
                      <i className="ni ni-lock-circle-open" />
                    </InputGroupText>
                  </InputGroupAddon>
                  <div className="position-relative" style={{ width: '100%' }}>
                    <Input
                      placeholder="New Password"
                      type={passwordVisible.newPassword ? "text" : "password"}
                      autoComplete="new-password"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      disabled={loading}
                      required
                    />
                    <button
                      type="button"
                      className="btn btn-link position-absolute"
                      style={{
                        right: '10px',
                        top: '50%',
                        transform: 'translateY(-50%)',
                        zIndex: 10,
                        border: 'none',
                        background: 'none',
                        padding: '0',
                        color: '#6c757d',
                        cursor: 'pointer',
                        width: '20px',
                        height: '20px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                      }}
                      onClick={() => togglePasswordVisibility('newPassword')}
                      disabled={loading}
                    >
                      {passwordVisible.newPassword ? (
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                          <path d="M12 4.5C7 4.5 2.73 7.61 1 12c1.73 4.39 6 7.5 11 7.5s9.27-3.11 11-7.5c-1.73-4.39-6-7.5-11-7.5zM12 17c-2.76 0-5-2.24-5-5s2.24-5 5-5 5 2.24 5 5-2.24 5-5 5zm0-8c-1.66 0-3 1.34-3 3s1.34 3 3 3 3-1.34 3-3-1.34-3-3-3z"/>
                        </svg>
                      ) : (
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                          <path d="M12 7c2.76 0 5 2.24 5 5 0 .65-.13 1.26-.36 1.83l2.92 2.92c1.51-1.26 2.7-2.89 3.43-4.75-1.73-4.39-6-7.5-11-7.5-1.4 0-2.74.25-3.98.7l2.16 2.16C10.74 7.13 11.35 7 12 7zM2 4.27l2.28 2.28.46.46C3.08 8.3 1.78 10.02 1 12c1.73 4.39 6 7.5 11 7.5 1.55 0 3.03-.3 4.38-.84l.42.42L19.73 22 21 20.73 3.27 3 2 4.27zM7.53 9.8l1.55 1.55c-.05.21-.08.43-.08.65 0 1.66 1.34 3 3 3 .22 0 .44-.03.65-.08l1.55 1.55c-.67.33-1.41.53-2.2.53-2.76 0-5-2.24-5-5 0-.79.2-1.53.53-2.2zm4.31-.78l3.15 3.15.02-.16c0-1.66-1.34-3-3-3l-.17.01z"/>
                        </svg>
                      )}
                    </button>
                  </div>
                </InputGroup>
                <small className="text-muted">Minimum 8 characters</small>
              </FormGroup>

              <FormGroup className="mb-3">
                <InputGroup className="input-group-alternative">
                  <InputGroupAddon addonType="prepend">
                    <InputGroupText>
                      <i className="ni ni-lock-circle-open" />
                    </InputGroupText>
                  </InputGroupAddon>
                  <div className="position-relative" style={{ width: '100%' }}>
                    <Input
                      placeholder="Confirm New Password"
                      type={passwordVisible.confirmPassword ? "text" : "password"}
                      autoComplete="new-password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      disabled={loading}
                      required
                    />
                    <button
                      type="button"
                      className="btn btn-link position-absolute"
                      style={{
                        right: '10px',
                        top: '50%',
                        transform: 'translateY(-50%)',
                        zIndex: 10,
                        border: 'none',
                        background: 'none',
                        padding: '0',
                        color: '#6c757d',
                        cursor: 'pointer',
                        width: '20px',
                        height: '20px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                      }}
                      onClick={() => togglePasswordVisibility('confirmPassword')}
                      disabled={loading}
                    >
                      {passwordVisible.confirmPassword ? (
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                          <path d="M12 4.5C7 4.5 2.73 7.61 1 12c1.73 4.39 6 7.5 11 7.5s9.27-3.11 11-7.5c-1.73-4.39-6-7.5-11-7.5zM12 17c-2.76 0-5-2.24-5-5s2.24-5 5-5 5 2.24 5 5-2.24 5-5 5zm0-8c-1.66 0-3 1.34-3 3s1.34 3 3 3 3-1.34 3-3-1.34-3-3-3z"/>
                        </svg>
                      ) : (
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                          <path d="M12 7c2.76 0 5 2.24 5 5 0 .65-.13 1.26-.36 1.83l2.92 2.92c1.51-1.26 2.7-2.89 3.43-4.75-1.73-4.39-6-7.5-11-7.5-1.4 0-2.74.25-3.98.7l2.16 2.16C10.74 7.13 11.35 7 12 7zM2 4.27l2.28 2.28.46.46C3.08 8.3 1.78 10.02 1 12c1.73 4.39 6 7.5 11 7.5 1.55 0 3.03-.3 4.38-.84l.42.42L19.73 22 21 20.73 3.27 3 2 4.27zM7.53 9.8l1.55 1.55c-.05.21-.08.43-.08.65 0 1.66 1.34 3 3 3 .22 0 .44-.03.65-.08l1.55 1.55c-.67.33-1.41.53-2.2.53-2.76 0-5-2.24-5-5 0-.79.2-1.53.53-2.2zm4.31-.78l3.15 3.15.02-.16c0-1.66-1.34-3-3-3l-.17.01z"/>
                        </svg>
                      )}
                    </button>
                  </div>
                </InputGroup>
              </FormGroup>
              
              <div className="text-center">
                <Button 
                  className="my-4" 
                  color="primary" 
                  type="submit"
                  disabled={loading || !newPassword.trim() || !confirmPassword.trim()}
                  style={{ minWidth: "140px" }}
                >
                  {loading ? (
                    <>
                      <Spinner size="sm" className="mr-2" />
                      Resetting...
                    </>
                  ) : (
                    "Reset Password"
                  )}
                </Button>
              </div>
              
              <div className="text-center">
                <Button 
                  color="link" 
                  className="p-0 text-light"
                  onClick={handleBackToLogin}
                  style={{ textDecoration: "none" }}
                >
                  <small>Back to Login</small>
                </Button>
              </div>
            </Form>
          )}
        </CardBody>
      </Card>
    </Col>
  );
};

export default ResetPassword;
