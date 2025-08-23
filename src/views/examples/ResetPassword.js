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
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [token, setToken] = useState("");
  const navigate = useNavigate();

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
      
      if (response && response.status === "success") {
        setSuccess(true);
        setMessage(response.message || "Password has been reset successfully. You can now login with your new password.");
      } else {
        setError(response?.message || "Failed to reset password. Please try again.");
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
              <Alert color="success" className="mb-3">
                <i className="ni ni-check-bold mr-2"></i>
                {message}
              </Alert>
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
                  <Input
                    placeholder="New Password"
                    type="password"
                    autoComplete="new-password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    disabled={loading}
                    required
                  />
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
                  <Input
                    placeholder="Confirm New Password"
                    type="password"
                    autoComplete="new-password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    disabled={loading}
                    required
                  />
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
