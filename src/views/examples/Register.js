/*!

=========================================================
* Argon Dashboard React - v1.2.4
=========================================================

=========================================================

*/

// reactstrap components
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
} from "reactstrap";
import { Link, useNavigate } from "react-router-dom";
import { useState } from "react";
import GoogleOAuthButton from "../../components/GoogleOAuthButton";
import apiService from "../../services/api";

const Register = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    role: "",
    full_name: "",
    email: "",
    student_num: "",
    program: "",
    section_id: "",
    contact_num: "",
    address: "",
    password: "",
    confirmPassword: ""
  });
  const [passwordVisible, setPasswordVisible] = useState({
    password: false,
    confirmPassword: false
  });
  const [termsAgreed, setTermsAgreed] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [autoDetectedRole, setAutoDetectedRole] = useState("");

  // Function to detect role from email
  const detectRoleFromEmail = (email) => {
    if (!email || !email.includes('@pampangastateu.edu.ph')) {
      return null;
    }
    
    const localPart = email.replace('@pampangastateu.edu.ph', '');
    
    // Check if it's a student number (10 digits starting with year)
    if (/^\d{10}$/.test(localPart)) {
      return 'student';
    }
    
    // Check if it's initials (e.g., a.ferrer)
    if (/^[a-z]\.[a-z]+$/i.test(localPart)) {
      return 'teacher';
    }
    
    return null;
  };

  // Auto-detect role when email changes
  const handleEmailChange = (e) => {
    const { value } = e.target;
    setFormData(prev => ({
      ...prev,
      email: value
    }));
    
    const detectedRole = detectRoleFromEmail(value);
    setAutoDetectedRole(detectedRole);
    
    // Auto-select role if detected
    if (detectedRole && !formData.role) {
      setFormData(prev => ({
        ...prev,
        role: detectedRole
      }));
    }
  };

  const handleGoogleSuccess = (userData, variant) => {
    console.log('Google registration successful:', userData);
    setSuccess("Registration successful! Redirecting...");
    setTimeout(() => {
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
    }, 1500);
  };

  const handleGoogleError = (errorMessage) => {
    setError(errorMessage);
  };

  // Password strength checker
  const checkPasswordStrength = (password) => {
    if (!password) return "";
    
    let score = 0;
    let feedback = [];
    
    // Length check
    if (password.length >= 8) {
      score += 1;
    } else {
      feedback.push("At least 8 characters");
    }
    
    // Lowercase check
    if (/[a-z]/.test(password)) {
      score += 1;
    } else {
      feedback.push("One lowercase letter");
    }
    
    // Uppercase check
    if (/[A-Z]/.test(password)) {
      score += 1;
    } else {
      feedback.push("One uppercase letter");
    }
    
    // Number check
    if (/\d/.test(password)) {
      score += 1;
    } else {
      feedback.push("One number");
    }
    
    // Special character check
    if (/[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]/.test(password)) {
      score += 1;
    } else {
      feedback.push("One special character");
    }
    
    if (score === 5) return { strength: "strong", score, feedback: [] };
    if (score >= 3) return { strength: "medium", score, feedback };
    return { strength: "weak", score, feedback };
  };

  const [passwordStrength, setPasswordStrength] = useState({ strength: "", score: 0, feedback: [] });

  const handlePasswordChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    if (name === "password") {
      setPasswordStrength(checkPasswordStrength(value));
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // If role is manually changed, clear auto-detected role
    if (name === 'role') {
      setAutoDetectedRole("");
    }
  };

  const togglePasswordVisibility = (fieldName) => {
    setPasswordVisible(prev => ({
      ...prev,
      [fieldName]: !prev[fieldName]
    }));
  };

  const validateForm = () => {
    if (!formData.role) {
      setError("Please select a role");
      return false;
    }
    
    // Check if selected role matches email pattern
    if (autoDetectedRole && formData.role !== autoDetectedRole) {
      setError(`Email pattern indicates this should be a ${autoDetectedRole} account. Please select the correct role.`);
      return false;
    }
    
    if (!formData.full_name.trim()) {
      setError("Full name is required");
      return false;
    }
    if (!formData.email.trim()) {
      setError("Email is required");
      return false;
    }
    
    // Validate email format and domain
    if (!formData.email.includes('@pampangastateu.edu.ph')) {
      setError("Please use your Pampanga State University email address (@pampangastateu.edu.ph)");
      return false;
    }
    
    if (formData.role === "student" && !formData.student_num.trim()) {
      setError("Student number is required for students");
      return false;
    }
    
    if (formData.role === "student" && !formData.program.trim()) {
      setError("Program/Course is required for students");
      return false;
    }
    
    if (formData.role === "teacher" && !formData.program.trim()) {
      setError("Department/Program is required for teachers");
      return false;
    }
    
    if (!formData.contact_num.trim()) {
      setError("Contact number is required");
      return false;
    }
    
    if (!formData.address.trim()) {
      setError("Address is required");
      return false;
    }
    
    if (!formData.password) {
      setError("Password is required");
      return false;
    }
    if (passwordStrength.strength === "weak") {
      setError("Password is too weak. Please ensure your password meets all requirements: at least 8 characters, includes uppercase, lowercase, numbers, and special characters.");
      return false;
    }
    if (formData.password !== formData.confirmPassword) {
      setError("Passwords do not match");
      return false;
    }
    if (!termsAgreed) {
      setError("You must agree to the terms and conditions");
      return false;
    }
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (!validateForm()) {
      return;
    }

    setLoading(true);

    try {
      // Prepare registration data based on role
      const registrationData = {
        role: formData.role,
        full_name: formData.full_name,
        email: formData.email,
        contact_num: formData.contact_num,
        address: formData.address,
        password: formData.password
      };

      // Add role-specific fields
      if (formData.role === "student") {
        registrationData.student_num = formData.student_num;
        registrationData.program = formData.program;
        if (formData.section_id) {
          registrationData.section_id = formData.section_id;
        }
        // QR code will be auto-generated by the backend
        registrationData.qr_code = `IDNo: ${formData.student_num}\nFull Name: ${formData.full_name}\nProgram: ${formData.program}`;
      } else if (formData.role === "teacher") {
        registrationData.program = formData.program;
      }

      const response = await apiService.register(registrationData);
      
      setSuccess("Registration successful! Redirecting to login...");
      setTimeout(() => {
        navigate("/auth/login");
      }, 2000);
      
    } catch (error) {
      setError(error.message || "Registration failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const renderRoleSpecificFields = () => {
    if (formData.role === "student") {
      return (
        <>
          <FormGroup>
            <InputGroup className="input-group-alternative mb-2">
              <InputGroupAddon addonType="prepend">
                <InputGroupText>
                  <i className="ni ni-badge" />
                </InputGroupText>
              </InputGroupAddon>
              <Input
                placeholder="Student Number (e.g., 2021304995)"
                type="text"
                name="student_num"
                value={formData.student_num}
                onChange={handleInputChange}
                required
                pattern="\d{10}"
                title="Student number must be exactly 10 digits"
              />
            </InputGroup>
            <small className="text-muted">Enter your 10-digit student number</small>
          </FormGroup>
          <FormGroup>
            <InputGroup className="input-group-alternative mb-2">
              <InputGroupAddon addonType="prepend">
                <InputGroupText>
                  <i className="ni ni-books" />
                </InputGroupText>
              </InputGroupAddon>
              <Input
                type="select"
                name="program"
                value={formData.program}
                onChange={handleInputChange}
                required
              >
                <option value="">Select Program/Course</option>
                <option value="Bachelor of Science in Information Technology">BSIT - Bachelor of Science in Information Technology</option>
                <option value="Bachelor of Science in Computer Science">BSCS - Bachelor of Science in Computer Science</option>
                <option value="Bachelor of Science in Information Systems">BSIS - Bachelor of Science in Information Systems</option>
                <option value="Associate in Computer Technology">ACT - Associate in Computer Technology</option>
              </Input>
            </InputGroup>
          </FormGroup>
          <FormGroup>
            <InputGroup className="input-group-alternative mb-2">
              <InputGroupAddon addonType="prepend">
                <InputGroupText>
                  <i className="ni ni-building" />
                </InputGroupText>
              </InputGroupAddon>
              <Input
                placeholder="Section ID (Optional)"
                type="text"
                name="section_id"
                value={formData.section_id}
                onChange={handleInputChange}
              />
            </InputGroup>
          </FormGroup>
        </>
      );
    } else if (formData.role === "teacher") {
      return (
        <FormGroup>
          <InputGroup className="input-group-alternative mb-3">
            <InputGroupAddon addonType="prepend">
              <InputGroupText>
                <i className="ni ni-books" />
              </InputGroupText>
            </InputGroupAddon>
            <Input
              type="select"
              name="program"
              value={formData.program}
              onChange={handleInputChange}
              required
            >
              <option value="">Select Department/Program</option>
              <option value="Computer Studies Department">Computer Studies Department</option>
              <option value="Information Technology">Information Technology</option>
              <option value="Computer Science">Computer Science</option>
              <option value="Information Systems">Information Systems</option>
              <option value="Computer Technology">Computer Technology</option>
            </Input>
          </InputGroup>
        </FormGroup>
      );
    }
    return null;
  };

  return (
    <>
      <Col lg="6" md="8">
        <Card className="bg-secondary shadow border-0">
          <CardHeader className="bg-transparent pb-3">
            <div className="text-center mt-2 mb-2">
              <h2>Register</h2>
            </div>
            <div className="text-muted text-center mb-2">
              <small>Sign up with</small>
            </div>
            <div className="btn-wrapper text-center">
              <GoogleOAuthButton
                text="Sign up with Google"
                variant="sign-up"
                onSuccess={handleGoogleSuccess}
                onError={handleGoogleError}
                disabled={loading}
                className="w-100"
              />
            </div>
          </CardHeader>
          <CardBody className="px-lg-5 py-lg-4">
            <div className="text-center text-muted mb-3">
              <small>Or sign up with credentials</small>
            </div>
            
            {error && <Alert color="danger">{error}</Alert>}
            {success && <Alert color="success">{success}</Alert>}
            
            <Form role="form" onSubmit={handleSubmit}>
              {/* Role Selection Dropdown */}
              <FormGroup>
                <InputGroup className="input-group-alternative mb-2">
                  <InputGroupAddon addonType="prepend">
                    <InputGroupText>
                      <i className="ni ni-circle-08" />
                    </InputGroupText>
                  </InputGroupAddon>
                  <Input
                    type="select"
                    name="role"
                    value={formData.role}
                    onChange={handleInputChange}
                    required
                  >
                    <option value="">Select Role</option>
                    <option value="student">Student</option>
                    <option value="teacher">Teacher</option>
                  </Input>
                </InputGroup>
                {autoDetectedRole && (
                  <small className="text-info">
                    <i className="ni ni-bell-55"></i> 
                    Email pattern detected: This appears to be a {autoDetectedRole} account
                  </small>
                )}
              </FormGroup>

              {/* Full Name */}
              <FormGroup>
                <InputGroup className="input-group-alternative mb-2">
                  <InputGroupAddon addonType="prepend">
                    <InputGroupText>
                      <i className="ni ni-hat-3" />
                    </InputGroupText>
                  </InputGroupAddon>
                  <Input
                    placeholder="Full Name"
                    type="text"
                    name="full_name"
                    value={formData.full_name}
                    onChange={handleInputChange}
                    required
                  />
                </InputGroup>
              </FormGroup>

              {/* Email */}
              <FormGroup>
                <InputGroup className="input-group-alternative mb-2">
                  <InputGroupAddon addonType="prepend">
                    <InputGroupText>
                      <i className="ni ni-email-83" />
                    </InputGroupText>
                  </InputGroupAddon>
                  <Input
                    placeholder="Email (@pampangastateu.edu.ph)"
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleEmailChange}
                    required
                  />
                </InputGroup>
                <small className="text-muted">
                  Use your Pampanga State University email address
                </small>
              </FormGroup>

              {/* Role-specific fields */}
              {renderRoleSpecificFields()}

              {/* Contact Number */}
              <FormGroup>
                <InputGroup className="input-group-alternative mb-2">
                  <InputGroupAddon addonType="prepend">
                    <InputGroupText>
                      <i className="ni ni-mobile-button" />
                    </InputGroupText>
                  </InputGroupAddon>
                  <Input
                    placeholder="Contact Number"
                    type="tel"
                    name="contact_num"
                    value={formData.contact_num}
                    onChange={handleInputChange}
                    required
                  />
                </InputGroup>
              </FormGroup>

              {/* Address */}
              <FormGroup>
                <InputGroup className="input-group-alternative mb-2">
                  <InputGroupAddon addonType="prepend">
                    <InputGroupText>
                      <i className="ni ni-pin-3" />
                    </InputGroupText>
                  </InputGroupAddon>
                  <Input
                    placeholder="Address"
                    type="text"
                    name="address"
                    value={formData.address}
                    onChange={handleInputChange}
                    required
                  />
                </InputGroup>
              </FormGroup>

              {/* Password */}
              <FormGroup>
                <InputGroup className="input-group-alternative mb-2">
                  <InputGroupAddon addonType="prepend">
                    <InputGroupText>
                      <i className="ni ni-lock-circle-open" />
                    </InputGroupText>
                  </InputGroupAddon>
                  <Input
                    placeholder="Enter your password"
                    type={passwordVisible.password ? "text" : "password"}
                    name="password"
                    value={formData.password}
                    onChange={handlePasswordChange}
                    required
                  />
                  <InputGroupAddon addonType="append">
                    <InputGroupText>
                      <i
                        className={`ni ${passwordVisible.password ? "ni-eye" : "ni-eye-slash"}`}
                        onClick={() => togglePasswordVisibility("password")}
                        style={{ cursor: "pointer" }}
                      />
                    </InputGroupText>
                  </InputGroupAddon>
                </InputGroup>
                {passwordStrength.strength && (
                  <div className="mt-1">
                    <small className={`text-${passwordStrength.strength === 'strong' ? 'success' : passwordStrength.strength === 'medium' ? 'warning' : 'danger'}`}>
                      Password strength: {passwordStrength.strength}
                    </small>
                    {passwordStrength.feedback.length > 0 && (
                      <ul className="mt-1 mb-0">
                        {passwordStrength.feedback.map((feedback, index) => (
                          <li key={index} className="text-muted small">{feedback}</li>
                        ))}
                      </ul>
                    )}
                  </div>
                )}
              </FormGroup>

              {/* Confirm Password */}
              <FormGroup>
                <InputGroup className="input-group-alternative mb-2">
                  <InputGroupAddon addonType="prepend">
                    <InputGroupText>
                      <i className="ni ni-lock-circle-open" />
                    </InputGroupText>
                  </InputGroupAddon>
                  <Input
                    placeholder="Confirm your password"
                    type={passwordVisible.confirmPassword ? "text" : "password"}
                    name="confirmPassword"
                    value={formData.confirmPassword}
                    onChange={handleInputChange}
                    required
                  />
                  <InputGroupAddon addonType="append">
                    <InputGroupText>
                      <i
                        className={`ni ${passwordVisible.confirmPassword ? "ni-eye" : "ni-eye-slash"}`}
                        onClick={() => togglePasswordVisibility("confirmPassword")}
                        style={{ cursor: "pointer" }}
                      />
                    </InputGroupText>
                  </InputGroupAddon>
                </InputGroup>
              </FormGroup>

              {/* Password Requirements Summary */}
              <div className="mb-4 p-3 bg-light rounded border">
                <small className="text-muted font-weight-bold d-block mb-2">
                  <i className="ni ni-info-77 mr-1"></i>
                  Password Requirements:
                </small>
                <div className="row">
                  <div className="col-6">
                    <small className="text-muted d-flex align-items-center mb-1">
                      <i className="ni ni-check-bold text-success mr-2" style={{ fontSize: '0.8rem' }}></i>
                      At least 8 characters
                    </small>
                    <small className="text-muted d-flex align-items-center mb-1">
                      <i className="ni ni-check-bold text-success mr-2" style={{ fontSize: '0.8rem' }}></i>
                      One uppercase letter
                    </small>
                  </div>
                  <div className="col-6">
                    <small className="text-muted d-flex align-items-center mb-1">
                      <i className="ni ni-check-bold text-success mr-2" style={{ fontSize: '0.8rem' }}></i>
                      One lowercase letter
                    </small>
                    <small className="text-muted d-flex align-items-center mb-1">
                      <i className="ni ni-check-bold text-success mr-2" style={{ fontSize: '0.8rem' }}></i>
                      One number & special character
                    </small>
                  </div>
                </div>
              </div>

              <Row className="my-4">
                <Col xs="12">
                  <div className="custom-control custom-control-alternative custom-checkbox">
                    <input
                      className="custom-control-input"
                      id="customCheckRegister"
                      type="checkbox"
                      checked={termsAgreed}
                      onChange={(e) => setTermsAgreed(e.target.checked)}
                    />
                    <label
                      className="custom-control-label"
                      htmlFor="customCheckRegister"
                    >
                      <span className="text-muted">
                        I agree with the{" "}
                        <a href="#pablo" onClick={(e) => e.preventDefault()}>
                          Privacy Policy
                        </a>
                      </span>
                    </label>
                  </div>
                </Col>
              </Row>
              <div className="text-center">
                <Button 
                  className="mt-4" 
                  color="primary" 
                  type="submit"
                  disabled={loading}
                >
                  {loading ? "Creating account..." : "Create account"}
                </Button>
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
              <small>Forgot password?</small>
            </Link>
          </Col>
          <Col className="text-right" xs="6">
            <Link
              className="text-light"
              to="/auth/login"
            >
              <small>Already have an account?</small>
            </Link>
          </Col>
        </Row>
      </Col>
    </>
  );
};

export default Register;
