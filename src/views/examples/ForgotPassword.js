import React, { useState } from "react";
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
  Row,
  Col,
  Alert,
  Spinner,
} from "reactstrap";
import { useNavigate } from "react-router-dom";
import ApiService from "../../services/api";

const ForgotPassword = () => {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Reset states
    setLoading(true);
    setMessage("");
    setError("");
    setSuccess(false);

    try {
      // Validate email
      if (!email || !email.trim()) {
        setError("Please enter your email address");
        setLoading(false);
        return;
      }

      // Basic email validation
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        setError("Please enter a valid email address");
        setLoading(false);
        return;
      }

      // Call the forgot password API (backend expects snake_case endpoint)
      const response = await ApiService.forgotPassword(email.trim());
      
      const responseMessage = response?.message || "";
      const isSuccess =
        (response && (response.status === "success" || response.success === true)) ||
        /reset (password )?link has been sent|check your email/i.test(responseMessage);

      if (isSuccess) {
        setSuccess(true);
        setMessage(responseMessage || "If an account with that email exists, a password reset link has been sent.");
        setEmail(""); // Clear the form
      } else {
        setError(responseMessage || "Something went wrong. Please try again.");
      }
    } catch (error) {
      console.error("Forgot password error:", error);
      setError(error.message || "Failed to send reset email. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleBackToLogin = () => {
    navigate("/auth/login");
  };

  return (
    <>
      <Col lg="5" md="7">
        <Card className="bg-secondary shadow border-0">
          <CardHeader className="bg-transparent pb-2">
            <div className="text-muted text-center">
              <small>Forgot Password</small>
            </div>
            <div className="text-center text-muted">
              <small>Enter your email address and we'll send you a link to reset your password.</small>
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
                <h5 className="text-success mb-3">Check Your Email</h5>
                <Button 
                  color="primary" 
                  onClick={handleBackToLogin}
                  className="mb-3"
                >
                  Back to Login
                </Button>
                <div className="text-muted">
                  <small>
                    Didn't receive the email? Check your spam folder or{" "}
                    <button 
                      type="button" 
                      className="btn btn-link p-0 text-primary"
                      onClick={() => setSuccess(false)}
                      style={{ textDecoration: "none" }}
                    >
                      try again
                    </button>
                  </small>
                </div>
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
                        <i className="ni ni-email-83" />
                      </InputGroupText>
                    </InputGroupAddon>
                    <Input
                      placeholder="Email"
                      type="email"
                      autoComplete="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
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
                    disabled={loading || !email.trim()}
                    style={{ minWidth: "140px" }}
                  >
                    {loading ? (
                      <>
                        <Spinner size="sm" className="mr-2" />
                        Sending...
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
    </>
  );
};

export default ForgotPassword; 