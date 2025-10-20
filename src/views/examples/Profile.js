import React, { useState, useEffect } from "react";
import {
  Button,
  Card,
  CardHeader,
  CardBody,
  FormGroup,
  Form,
  Input,
  Container,
  Row,
  Col,
  Alert,
  Badge,
} from "reactstrap";
import { useAuth } from "../../contexts/AuthContext";

import ApiService from "../../services/api";


const Profile = () => {
  const { user } = useAuth();
  const [formData, setFormData] = useState({});
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState("");
  const [error, setError] = useState("");
  const [userProfile, setUserProfile] = useState(null);
  const [sections, setSections] = useState([]);
  const [filteredSections, setFilteredSections] = useState([]);

  // Fetch user profile data and sections on component mount
  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const response = await ApiService.getProfile();
        if (response && response.status && response.data) {
          setUserProfile(response.data);
          // Parse address into atomic fields (assuming format: "street, barangay, city, zip")
          const addressParts = (response.data.address || "").split(',').map(part => part.trim());
          // Parse contact number (remove +63 prefix)
          const contactNumber = (response.data.contact_number || "").replace(/^\+63/, "");
          const parsedData = {
            ...response.data,
            address: addressParts[0] || "",
            barangay: addressParts[1] || "",
            cityMunicipality: addressParts[2] || "",
            zipCode: addressParts[3] || "",
            contact_number: contactNumber
          };
          setFormData(parsedData); // Initialize form with parsed data
        }
      } catch (error) {
        console.error('Error fetching profile:', error);
      }
    };

    const fetchSections = async () => {
      try {
        console.log('📡 Fetching sections from API...');
        const response = await ApiService.getAllSections();
        console.log('📡 Sections API response:', response);
        
        if (response && response.status && response.data) {
          console.log('✅ Sections data received:', response.data.length, 'sections');
          setSections(response.data);
        } else {
          console.log('❌ No sections data in response:', response);
        }
      } catch (error) {
        console.error('❌ Error fetching sections:', error);
      }
    };

    if (user) {
      fetchProfile();
      fetchSections();
    }
  }, [user]);

  // Filter sections based on selected program and year level
  useEffect(() => {
    if (formData.course && formData.year_level) {
      console.log('🔍 Filtering sections...');
      console.log('Selected course:', formData.course);
      console.log('Selected year_level:', formData.year_level);
      console.log('Total sections:', sections.length);
      
      const filtered = sections.filter(section => {
        // Handle program matching with more flexible logic
        let programMatch = false;
        
        if (formData.course === "Bachelor of Science in Information Technology") {
          programMatch = section.program === "Bachelor of Science in Information Technology" || 
                        section.program === "BSIT" ||
                        section.course === "Bachelor of Science in Information Technology" ||
                        section.course === "BSIT";
        } else if (formData.course === "Bachelor of Science in Computer Science") {
          programMatch = section.program === "Bachelor of Science in Computer Science" || 
                        section.program === "BSCS" ||
                        section.course === "Bachelor of Science in Computer Science" ||
                        section.course === "BSCS";
        } else if (formData.course === "Bachelor of Science in Information Systems") {
          programMatch = section.program === "Bachelor of Science in Information Systems" || 
                        section.program === "BSIS" ||
                        section.course === "Bachelor of Science in Information Systems" ||
                        section.course === "BSIS";
        } else if (formData.course === "Associate in Computer Technology") {
          programMatch = section.program === "Associate in Computer Technology" || 
                        section.program === "ACT" ||
                        section.course === "Associate in Computer Technology" ||
                        section.course === "ACT";
        } else {
          // Fallback to exact match
          programMatch = section.program === formData.course || section.course === formData.course;
        }
        
        // Handle year level matching (convert both to strings for comparison)
        const yearMatch = String(section.year_level) === String(formData.year_level) || 
                         String(section.year) === String(formData.year_level);
        
        console.log(`Section: ${section.section_name}, Program: ${section.program}, Year: ${section.year_level}, Match: ${programMatch && yearMatch}`);
        
        return programMatch && yearMatch;
      });
      
      console.log('Filtered sections:', filtered.length);
      setFilteredSections(filtered);
    } else {
      setFilteredSections([]);
    }
  }, [formData.course, formData.year_level, sections]);

  // Use fetched profile or fallback to auth context user
  const currentUser = userProfile || user;

  // Debug profile picture data
  console.log('🖼️ Profile Picture Debug:');
  console.log('Current user:', currentUser);
  console.log('profile_image_url:', currentUser?.profile_image_url);
  console.log('profile_pic:', currentUser?.profile_pic);
  console.log('imageUrl:', currentUser?.imageUrl);
  console.log('profileImageUrl:', currentUser?.profileImageUrl);



  // Handle form input changes
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSuccess("");

    try {
      // Combine atomic address fields into single address field for backend
      const combinedFormData = {
        ...formData,
        address: `${formData.address || ""}, ${formData.barangay || ""}, ${formData.cityMunicipality || ""}, ${formData.zipCode || ""}`.trim(),
        contact_number: `+63${formData.contact_number || ""}`
      };
      
      const response = await ApiService.updateProfile(combinedFormData);
      
      if (response && response.status) {
        setSuccess("Profile updated successfully!");
        setUserProfile(response.data || formData);
        setTimeout(() => setSuccess(""), 3000);
      } else {
        setError(response?.message || "Failed to update profile");
      }
    } catch (error) {
      setError(error.message || "Failed to update profile");
    } finally {
      setLoading(false);
    }
  };

  // Render Student-specific form fields
  const renderStudentFields = () => (
    <>
      <h6 className="heading-small text-muted mb-4">
        Student Information
      </h6>
      <div className="pl-lg-4">
        <Row>
          <Col lg="6">
            <FormGroup>
              <label className="form-control-label" htmlFor="student_number">
                Student Number *
              </label>
              <Input
                className="form-control-alternative"
                id="student_number"
                name="student_number"
                placeholder="Enter student number (min. 8 characters)"
                type="text"
                value={formData.student_number || ""}
                onChange={handleInputChange}
                required
              />
            </FormGroup>
          </Col>
          <Col lg="6">
            <FormGroup>
              <label className="form-control-label" htmlFor="contact_number">
                Contact Number *
              </label>
              <Input
                className="form-control-alternative"
                id="contact_number"
                name="contact_number"
                placeholder="Enter contact number"
                type="text"
                value={formData.contact_number || ""}
                onChange={handleInputChange}
                required
              />
            </FormGroup>
          </Col>
        </Row>
        <Row>
          <Col lg="6">
            <FormGroup>
              <label className="form-control-label" htmlFor="course">
                Program *
              </label>
              <Input
                className="form-control-alternative"
                id="course"
                name="course"
                type="select"
                value={formData.course || ""}
                onChange={handleInputChange}
                required
              >
                <option value="">Select Program</option>
                <option value="Associate in Computer Technology">Associate in Computer Technology</option>
                <option value="Bachelor of Science in Computer Science">Bachelor of Science in Computer Science</option>
                <option value="Bachelor of Science in Information Systems">Bachelor of Science in Information Systems</option>
                <option value="Bachelor of Science in Information Technology">Bachelor of Science in Information Technology</option>
              </Input>
            </FormGroup>
          </Col>
          <Col lg="6">
            <FormGroup>
              <label className="form-control-label" htmlFor="year_level">
                Year Level
              </label>
              <Input
                className="form-control-alternative"
                id="year_level"
                name="year_level"
                type="select"
                value={formData.year_level || ""}
                onChange={handleInputChange}
              >
                <option value="">Select Year Level</option>
                <option value="1">1st Year</option>
                <option value="2">2nd Year</option>
                {formData.course !== "Associate in Computer Technology" && (
                  <>
                    <option value="3">3rd Year</option>
                    <option value="4">4th Year</option>
                  </>
                )}
              </Input>
            </FormGroup>
          </Col>
        </Row>
        <Row>
          <Col lg="12">
            <FormGroup>
              <label className="form-control-label" htmlFor="section">
                Section
              </label>
              <Input
                className="form-control-alternative"
                id="section"
                name="section"
                type="select"
                value={formData.section || ""}
                onChange={handleInputChange}
                disabled={!formData.course || !formData.year_level}
              >
                <option value="">
                  {!formData.course || !formData.year_level ? 
                    "Select program and year level first" : 
                    "Select Section"
                  }
                </option>
                {filteredSections.map(section => (
                  <option key={section.id} value={section.section_name}>
                    {section.section_name}
                    {section.adviser_details && section.adviser_details.name && 
                      ` - ${section.adviser_details.name}`
                    }
                  </option>
                ))}
                {filteredSections.length === 0 && formData.course && formData.year_level && (
                  <option value="" disabled>No sections available for this program/year</option>
                )}
              </Input>
            </FormGroup>
          </Col>
        </Row>
      </div>
    </>
  );

  // Render Teacher-specific form fields
  const renderTeacherFields = () => (
    <>
      <h6 className="heading-small text-muted mb-4">
        Teacher Information
      </h6>
      <div className="pl-lg-4">
        <Row>
          <Col lg="6">
            <FormGroup>
              <label className="form-control-label" htmlFor="contact_number">
                Contact Number *
              </label>
              <Input
                className="form-control-alternative"
                id="contact_number"
                name="contact_number"
                placeholder="Enter contact number"
                type="text"
                value={formData.contact_number || ""}
                onChange={handleInputChange}
                required
              />
            </FormGroup>
          </Col>
          <Col lg="6">
            <FormGroup>
              <label className="form-control-label" htmlFor="department">
                Department *
              </label>
              <Input
                className="form-control-alternative"
                id="department"
                name="department"
                type="select"
                value={formData.department || ""}
                onChange={handleInputChange}
                required
              >
                <option value="">Select Department</option>
                <option value="Information Technology">Information Technology</option>
                <option value="Computer Science">Computer Science</option>
                <option value="Information System">Information System</option>
                <option value="Computer Technology">Computer Technology</option>
              </Input>
            </FormGroup>
          </Col>
        </Row>
      </div>
    </>
  );

  return (
    <>
      {/* Header */}
      <div
        className="header pb-6 pt-4 pt-lg-6 d-flex align-items-center"
        style={{
          minHeight: "280px",
          background: "linear-gradient(135deg, #f8f9fa 0%, #e9ecef 50%, #74a9d8 100%)",
          position: "relative",
          overflow: "hidden"
        }}
      >
        {/* Wavy Background SVG */}
        <div 
          style={{
            position: "absolute",
            bottom: 0,
            left: 0,
            width: "100%",
            height: "100%",
            backgroundImage: `url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' version='1.1' xmlns:xlink='http://www.w3.org/1999/xlink' xmlns:svgjs='http://svgjs.dev/svgjs' width='1440' height='280' preserveAspectRatio='none' viewBox='0 0 1440 280'%3e%3cg mask='url(%23SvgjsMask1000)' fill='none'%3e%3cpath d='M 0%2c60 C 96%2c70 288%2c100 480%2c95 C 672%2c90 768%2c45 960%2c44 C 1152%2c43 1344%2c80 1440%2c90L1440 280L0 280z' fill='rgba(255%2c 255%2c 255%2c 0.3)'%3e%3c/path%3e%3cpath d='M 0%2c160 C 120%2c150 360%2c120 600%2c118 C 840%2c116 960%2c140 1200%2c140 C 1320%2c140 1380%2c135 1440%2c133L1440 280L0 280z' fill='rgba(255%2c 255%2c 255%2c 0.4)'%3e%3c/path%3e%3cpath d='M 0%2c210 C 144%2c205 432%2c190 720%2c186 C 1008%2c182 1296%2c200 1440%2c202L1440 280L0 280z' fill='rgba(255%2c 255%2c 255%2c 0.5)'%3e%3c/path%3e%3c/g%3e%3cdefs%3e%3cmask id='SvgjsMask1000'%3e%3crect width='1440' height='280' fill='white'%3e%3c/rect%3e%3c/mask%3e%3c/defs%3e%3c/svg%3e")`,
            backgroundSize: "cover",
            backgroundPosition: "bottom",
            backgroundRepeat: "no-repeat"
          }}
        />
        
        <Container className="d-flex align-items-center" fluid style={{ position: "relative", zIndex: 1 }}>
          <Row>
            <Col lg="7" md="10">
              <h1 className="display-2" style={{ color: "#495057" }}>
                Hello {currentUser?.first_name || currentUser?.full_name?.split(' ')[0] || 'User'}
              </h1>
              <p style={{ color: "#6c757d" }} className="mt-0 mb-5">
                This is your profile page. You can view and edit your personal information.
              </p>
            </Col>
          </Row>
        </Container>
      </div>

      {/* Page content */}
      <Container className="mt--7" fluid>
        <Row>
          {/* Profile Card */}
          <Col className="order-xl-2 mb-5 mb-xl-0" xl="4">
            <Card className="card-profile shadow">

              <CardBody className="pt-5 pt-md-7">
                <div className="text-center">
                  <h3>
                    {currentUser?.full_name || 'User Name'}
                  </h3>
                  <div className="h5 font-weight-300">
                    <Badge color={currentUser?.role === 'student' ? 'success' : 'info'}>
                      {currentUser?.role?.toUpperCase() || 'USER'}
                    </Badge>
                  </div>
                  <div className="h6 mt-2">
                    <i className="ni ni-email-83 mr-2" />
                    {currentUser?.email || 'No email'}
                  </div>
                  {currentUser?.auth_provider === 'google' && (
                    <div className="h6 mt-2">
                      <i className="fab fa-google mr-2" />
                      <Badge color="warning" pill>Google Account</Badge>
                  </div>
                  )}
                </div>
              </CardBody>
            </Card>
          </Col>

          {/* Edit Form */}
          <Col className="order-xl-1" xl="8">
            <Card className="bg-secondary shadow">
              <CardHeader className="bg-white border-0">
                <Row className="align-items-center">
                  <Col xs="8">
                    <h3 className="mb-0">My Profile</h3>
                  </Col>
                  <Col className="text-right" xs="4">
                    <Button
                      color="primary"
                      onClick={handleSubmit}
                      disabled={loading}
                      size="sm"
                    >
                      {loading ? 'Updating...' : 'Update Profile'}
                    </Button>
                  </Col>
                </Row>
              </CardHeader>
              <CardBody>
                {success && <Alert color="success">{success}</Alert>}
                {error && <Alert color="danger">{error}</Alert>}

                <Form onSubmit={handleSubmit}>
                  {/* User Information */}
                  <h6 className="heading-small text-muted mb-4">
                    User Information
                  </h6>
                  <div className="pl-lg-4">
                    <Row>
                      <Col lg="6">
                        <FormGroup>
                          <label className="form-control-label" htmlFor="full_name">
                            Full Name *
                          </label>
                          <Input
                            className="form-control-alternative"
                            id="full_name"
                            name="full_name"
                            placeholder="Enter full name"
                            type="text"
                            value={formData.full_name || ""}
                            onChange={handleInputChange}
                            required
                          />
                        </FormGroup>
                      </Col>
                      <Col lg="6">
                        <FormGroup>
                          <label className="form-control-label" htmlFor="email">
                            Email Address
                          </label>
                          <Input
                            className="form-control-alternative"
                            id="email"
                            name="email"
                            type="email"
                            value={formData.email || ""}
                            disabled={currentUser?.auth_provider === 'google'}
                            onChange={handleInputChange}
                          />
                          {currentUser?.auth_provider === 'google' && (
                            <small className="text-muted">Google OAuth email cannot be changed</small>
                          )}
                        </FormGroup>
                      </Col>
                    </Row>
                    <Row>
                      <Col lg="6">
                        <FormGroup>
                          <label className="form-control-label" htmlFor="role">
                            Role
                          </label>
                          <Input
                            className="form-control-alternative"
                            id="role"
                            name="role"
                            type="select"
                            value={formData.role || ""}
                            onChange={handleInputChange}
                          >
                            <option value="">Select Role</option>
                            <option value="student">Student</option>
                            <option value="teacher">Teacher</option>
                            <option value="admin">Admin</option>
                          </Input>
                        </FormGroup>
                      </Col>
                    </Row>
                    <Row>
                      <Col lg="6">
                        <FormGroup>
                          <label className="form-control-label" htmlFor="password">
                            Password
                          </label>
                          <Input
                            className="form-control-alternative"
                            id="password"
                            name="password"
                            placeholder="Leave blank to keep current password"
                            type="password"
                            value={formData.password || ""}
                            onChange={handleInputChange}
                          />
                        </FormGroup>
                      </Col>
                      <Col lg="6">
                        <FormGroup>
                          <label className="form-control-label" htmlFor="confirm_password">
                            Confirm Password
                          </label>
                          <Input
                            className="form-control-alternative"
                            id="confirm_password"
                            name="confirm_password"
                            placeholder="Leave blank to keep current password"
                            type="password"
                            value={formData.confirm_password || ""}
                            onChange={handleInputChange}
                          />
                        </FormGroup>
                      </Col>
                    </Row>
                  </div>

                  <hr className="my-4" />

                  {/* Role-specific fields */}
                  {formData.role === 'student' && renderStudentFields()}
                  {formData.role === 'teacher' && renderTeacherFields()}

                  <hr className="my-4" />

                  {/* Address Information */}
                  <h6 className="heading-small text-muted mb-4">
                    Contact Information
                  </h6>
                  <div className="pl-lg-4">
                    <Row>
                      <Col lg="6">
                        <FormGroup>
                          <label className="form-control-label" htmlFor="address">
                            Address *
                          </label>
                          <Input
                            className="form-control-alternative"
                            id="address"
                            name="address"
                            placeholder="Enter your address"
                            type="text"
                            value={formData.address || ""}
                            onChange={handleInputChange}
                            required
                            autoComplete="street-address"
                            autoCapitalize="words"
                          />
                        </FormGroup>
                      </Col>
                      <Col lg="6">
                        <FormGroup>
                          <label className="form-control-label" htmlFor="cityMunicipality">
                            City/Municipality *
                          </label>
                          <Input
                            className="form-control-alternative"
                            id="cityMunicipality"
                            name="cityMunicipality"
                            placeholder="Enter city or municipality"
                            type="text"
                            value={formData.cityMunicipality || ""}
                            onChange={handleInputChange}
                            required
                            pattern="^[A-Za-zÑñ\s\-\.]+$"
                            title="Letters, spaces, hyphens and periods only"
                            autoComplete="address-level2"
                          />
                        </FormGroup>
                      </Col>
                    </Row>
                    <Row>
                      <Col lg="6">
                        <FormGroup>
                          <label className="form-control-label" htmlFor="barangay">
                            Barangay *
                          </label>
                          <Input
                            className="form-control-alternative"
                            id="barangay"
                            name="barangay"
                            placeholder="Enter barangay"
                            type="text"
                            value={formData.barangay || ""}
                            onChange={handleInputChange}
                            required
                            pattern="^[A-Za-zÑñ\s\-\.]+$"
                            title="Letters, spaces, hyphens and periods only"
                            autoComplete="address-line2"
                          />
                        </FormGroup>
                      </Col>
                      <Col lg="6">
                        <FormGroup>
                          <label className="form-control-label" htmlFor="zipCode">
                            ZIP Code *
                          </label>
                          <Input
                            className="form-control-alternative"
                            id="zipCode"
                            name="zipCode"
                            placeholder="Enter ZIP code"
                            type="text"
                            value={formData.zipCode || ""}
                            onChange={handleInputChange}
                            onInput={e => e.target.value = e.target.value.replace(/[^\d]/g, '')}
                            required
                            inputMode="numeric"
                            pattern="^\d{4}$"
                            maxLength={4}
                            title="4-digit ZIP code"
                          />
                        </FormGroup>
                      </Col>
                    </Row>
                    <Row>
                      <Col lg="6">
                        <FormGroup>
                          <label className="form-control-label" htmlFor="contact_number">
                            Contact Number *
                          </label>
                          <Input
                            className="form-control-alternative"
                            id="contact_number"
                            name="contact_number"
                            placeholder="Enter 10-digit contact number"
                            type="tel"
                            value={formData.contact_number || ""}
                            onChange={handleInputChange}
                            onInput={e => e.target.value = e.target.value.replace(/[^\d]/g, '')}
                            required
                            inputMode="numeric"
                            pattern="^\d{10}$"
                            maxLength={10}
                            title="Format: 9XXXXXXXXX"
                          />
                          <small className="text-muted">Starts with 9 and 10 digits (e.g., 9123456789)</small>
                        </FormGroup>
                      </Col>
                    </Row>
                  </div>

                  <hr className="my-4" />

                  {/* Account Status Section */}
                  <h6 className="heading-small text-muted mb-4">
                    ACCOUNT STATUS
                  </h6>
                  <div className="pl-lg-4">
                    <Row>
                      <Col lg="6">
                        <FormGroup>
                          <label className="form-control-label" htmlFor="status">
                            Status
                          </label>
                          <Input
                            className="form-control-alternative"
                            id="status"
                            name="status"
                            type="select"
                            value={formData.status || ""}
                            onChange={handleInputChange}
                          >
                            <option value="active">Active</option>
                            <option value="inactive">Inactive</option>
                          </Input>
                        </FormGroup>
                      </Col>
                    </Row>
                  </div>

                  {/* Admin Information Section */}
                  {formData.role === 'admin' && (
                    <>
                      <hr className="my-4" />
                      <h6 className="heading-small text-muted mb-4">
                        ADMIN INFORMATION
                      </h6>
                      <div className="pl-lg-4">
                        <Row>
                          <Col lg="6">
                            <FormGroup>
                              <label className="form-control-label" htmlFor="department">
                                Department
                              </label>
                              <Input
                                className="form-control-alternative"
                                id="department"
                                name="department"
                                type="text"
                                value={formData.department || "Program Chairperson"}
                                onChange={handleInputChange}
                                readOnly
                              />
                            </FormGroup>
                          </Col>
                        </Row>
                      </div>
                    </>
                  )}
                </Form>
              </CardBody>
            </Card>
          </Col>
        </Row>
      </Container>
    </>
  );
};

export default Profile;
