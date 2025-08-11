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
  Row,
  Col,
  Label,
  Modal,
  ModalBody,
  Container,
  Alert
} from "reactstrap";
import LottieLoader from "components/LottieLoader";
import { QrReader } from "react-qr-reader";
import Header from "components/Headers/Header.js";
import { FaCamera, FaTrash } from "react-icons/fa";
import userDefault from "../../assets/img/theme/user-default.svg";
import Cropper from 'react-easy-crop';
import "./CreateUser.css";
import { useNavigate, useParams, useLocation } from "react-router-dom";
import apiService from "../../services/api";
import useMinDelay from "utils/useMinDelay";

const defaultCoverPhotoSvg =
  "data:image/svg+xml;utf8,<svg width='600' height='240' viewBox='0 0 600 240' fill='none' xmlns='http://www.w3.org/2000/svg'><rect width='600' height='240' fill='%23f7f7f7'/><path d='M0 180 Q150 120 300 180 T600 180 V240 H0 Z' fill='%23e3eafc'/><path d='M0 200 Q200 140 400 200 T600 200 V240 H0 Z' fill='%23cfd8dc' opacity='0.7'/></svg>";

const CreateUser = ({ editUser, editMode, onEditDone }) => {
  const [role, setRole] = useState("");
  const [fullName, setFullName] = useState("");
  const [address, setAddress] = useState("");
  const [contactNumber, setContactNumber] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [department, setDepartment] = useState("");
  const [studentNumber, setStudentNumber] = useState("");
  const [section, setSection] = useState("");
  const [year, setYear] = useState("");
  const [qrData, setQrData] = useState("");
  const [qrModal, setQrModal] = useState(false);
  const [profileImage, setProfileImage] = useState(null);
  const [profileImageUrl, setProfileImageUrl] = useState(null);
  const [cropModal, setCropModal] = useState(false);
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState(null);
  const [tempImage, setTempImage] = useState(null);
  const [profileImageName, setProfileImageName] = useState("");
  const [passwordStrength, setPasswordStrength] = useState("");
  const [emailValid, setEmailValid] = useState(true);
  const [status, setStatus] = useState("active");
  const [isLoading, setIsLoading] = useState(false);
  const showBtnLoader = useMinDelay(isLoading, 1600);
  const [showSuccess, setShowSuccess] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  const [showLoadingModal, setShowLoadingModal] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [nameError, setNameError] = useState("");
  const [emailError, setEmailError] = useState("");
  const [studentNumberError, setStudentNumberError] = useState("");
  const [coverPhoto, setCoverPhoto] = useState(null);
  const [coverPhotoUrl, setCoverPhotoUrl] = useState(null);
  const [coverPhotoName, setCoverPhotoName] = useState("");
  const [coverCropModal, setCoverCropModal] = useState(false);
  const [coverCrop, setCoverCrop] = useState({ x: 0, y: 0 });
  const [coverZoom, setCoverZoom] = useState(1);
  const [coverCroppedAreaPixels, setCoverCroppedAreaPixels] = useState(null);
  const [coverTempImage, setCoverTempImage] = useState(null);
  const [profileImageFile, setProfileImageFile] = useState(null);
  const [coverPhotoFile, setCoverPhotoFile] = useState(null);
  const [error, setError] = useState("");
  const [apiError, setApiError] = useState("");

  const navigate = useNavigate();
  const location = useLocation();
  const searchParams = new URLSearchParams(location.search);
  const tab = searchParams.get('tab') || 'admin';
  const view = searchParams.get('view') || 'table';

  useEffect(() => {
    if (editMode && editUser) {
      setRole(editUser.role || "");
      setFullName(editUser.name || "");
      setAddress(editUser.address || "");
      setContactNumber(editUser.contactNumber || "");
      setEmail(editUser.email || "");
      setPassword(editUser.password || "");
      setDepartment(editUser.department || "");
      setStudentNumber(editUser.studentNumber || "");
      setSection(editUser.section || "");
      setYear(editUser.year || "");
      setQrData(editUser.qrData || "");
      setProfileImageUrl(editUser.profileImageUrl || "");
      setProfileImageName("");
      setStatus(editUser.status || "active");
      setCoverPhotoUrl(editUser.coverPhotoUrl || "");
      setCoverPhotoName("");
    }
  }, [editMode, editUser]);

  // Remove QR scanner and manual generate button, and auto-generate QR code for students
  useEffect(() => {
    if (role === 'student' && studentNumber && fullName && department) {
      setQrData(`IDNo: ${studentNumber}\nFull Name: ${fullName}\nProgram: ${department}`);
    } else if (role === 'student') {
      setQrData("");
    }
    // For other roles, do not set qrData
  }, [role, studentNumber, fullName, department]);

  const handleQrScan = (result, error) => {
    if (!!result) {
      setQrData(result?.text);
      setQrModal(false);
    }
  };

  const onCropComplete = (croppedArea, croppedAreaPixels) => {
    setCroppedAreaPixels(croppedAreaPixels);
  };

  const handleProfileImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setProfileImageName(file.name);
      const url = URL.createObjectURL(file);
      setTempImage(url);
      setCropModal(true);
    }
  };

  const handleDeleteAvatar = () => {
    setProfileImage(null);
    setProfileImageUrl(null);
    setProfileImageName("");
    setProfileImageFile(null);
  };

  const getCroppedImg = async (imageSrc, crop) => {
    const image = await createImage(imageSrc);
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    canvas.width = crop.width;
    canvas.height = crop.height;
    ctx.drawImage(
      image,
      crop.x,
      crop.y,
      crop.width,
      crop.height,
      0,
      0,
      crop.width,
      crop.height
    );
    return new Promise((resolve) => {
      resolve(canvas.toDataURL('image/jpeg'));
    });
  };

  function createImage(url) {
    return new Promise((resolve, reject) => {
      const image = new window.Image();
      image.addEventListener('load', () => resolve(image));
      image.addEventListener('error', (error) => reject(error));
      image.setAttribute('crossOrigin', 'anonymous');
      image.src = url;
    });
  }

  const handleCropSave = async () => {
    try {
      const croppedUrl = await getCroppedImg(tempImage, croppedAreaPixels);
      
      // Convert base64 to blob
      const response = await fetch(croppedUrl);
      const blob = await response.blob();
      
      // Create a file from the blob
      const file = new File([blob], profileImageName || 'profile.jpg', { type: 'image/jpeg' });
      
      // Store the file for later use in registration
      setProfileImageFile(file);
      setProfileImageUrl(croppedUrl); // Keep base64 for preview
      
      setProfileImage(null);
      setCropModal(false);
      setTempImage(null);
    } catch (error) {
      console.error('Error processing profile image:', error);
      alert('Failed to process profile image. Please try again.');
      setProfileImage(null);
      setCropModal(false);
      setTempImage(null);
    }
  };

  // Password strength checker
  function checkPasswordStrength(pw) {
    if (!pw) return "";
    const strong = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]).{8,}$/;
    if (strong.test(pw)) return "strong";
    if (pw.length >= 6) return "medium";
    return "weak";
  }

  // Email format checker
  function validateEmail(email) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  }

  // Check for duplicate name
  const checkDuplicateName = (name) => {
    if (!name.trim()) return "";
    
    // Basic validation for name format
    if (name.length < 2) {
      return "Name must be at least 2 characters long.";
    }
    
    // In edit mode, allow unchanged name
    if (editMode && editUser && name.toLowerCase() === editUser.name?.toLowerCase()) return "";
    
    // Note: Duplicate checking will be handled by the backend API
    return "";
  };

  // Check for duplicate email
  const checkDuplicateEmail = (email) => {
    if (!email.trim()) return "";
    
    // Basic validation for email format
    if (!validateEmail(email)) {
      return "Please enter a valid email address.";
    }
    
    // In edit mode, allow unchanged email
    if (editMode && editUser && email.toLowerCase() === editUser.email?.toLowerCase()) return "";
    
    // Note: Duplicate checking will be handled by the backend API
    return "";
  };

  // Check for duplicate student number
  const checkDuplicateStudentNumber = (studentNumber) => {
    if (!studentNumber.trim() || role !== 'student') return "";
    
    // Basic validation for student number format
    if (studentNumber.length < 8) {
      return "Student number must be at least 8 characters long.";
    }
    
    // In edit mode, allow unchanged student number
    if (editMode && editUser && studentNumber === editUser.studentNumber) return "";
    
    // Note: Duplicate checking will be handled by the backend API
    return "";
  };

  const handleCreateUser = async (e) => {
    e.preventDefault();
    
    // Clear previous errors
    setNameError("");
    setEmailError("");
    setStudentNumberError("");
    setApiError("");
    
    // Basic validation
    if (!role || !fullName || !email || !password) {
      setError("Please fill in all required fields.");
      return;
    }
    
    if (!validateEmail(email)) {
      setEmailError("Please enter a valid email address.");
      return;
    }
    
    // Admin-specific validation
    if (role === 'admin') {
      if (!address.trim()) {
        setError("Address is required for admins.");
        return;
      }
      if (!contactNumber.trim()) {
        setError("Contact number is required for admins.");
        return;
      }
    }
    
    // Teacher-specific validation
    if (role === 'teacher') {
      if (!address.trim()) {
        setError("Address is required for teachers.");
        return;
      }
      if (!contactNumber.trim()) {
        setError("Contact number is required for teachers.");
        return;
      }
      if (!department.trim()) {
        setError("Department is required for teachers.");
        return;
      }
    }
    
    // Student-specific validation
    if (role === 'student') {
      if (!studentNumber.trim()) {
        setStudentNumberError("Student number is required for students.");
        return;
      }
      if (!department) {
        setError("Please select a course for the student.");
        return;
      }
      if (!address.trim()) {
        setError("Address is required for students.");
        return;
      }
      if (!contactNumber.trim()) {
        setError("Contact number is required for students.");
        return;
      }
      if (studentNumber.length < 8) {
        setStudentNumberError("Student number must be at least 8 characters long.");
        return;
      }
    }
    
    // Start loading modal
    setShowLoadingModal(true);
    setIsLoading(true);
    
    try {
      // Resolve section_id if role is student and section is provided
      let resolvedSectionId = '';
      if (role === 'student' && section && section.trim()) {
        const trimmed = section.trim();
        const isNumeric = /^[0-9]+$/.test(trimmed);
        if (isNumeric) {
          resolvedSectionId = String(parseInt(trimmed, 10));
        } else {
          try {
            // Build intended section_name like "BSIT 1Z"
            const programToAbbr = {
              'Associate in Computer Technology': 'ACT',
              'Bachelor of Science in Information Technology': 'BSIT',
              'Bachelor of Science in Information Systems': 'BSIS',
              'Bachelor of Science in Computer Science': 'BSCS',
            };
            const abbr = programToAbbr[department] || (department ? department.substring(0, 4).toUpperCase() : '');
            const yearNum = (year || '').toString().replace(/[^0-9]/g, '') || '';
            const letter = trimmed.toUpperCase().slice(0, 1);
            const desiredSectionName = yearNum ? `${abbr} ${yearNum}${letter}` : `${abbr} ${letter}`;

            // Look up existing sections
            const sectionsResp = await apiService.getSections();
            const sectionsArr = sectionsResp?.data || sectionsResp || [];
            const found = (sectionsArr || []).find((s) => {
              const name = s.name || s.section_name || '';
              return name.toLowerCase() === desiredSectionName.toLowerCase();
            });

            if (found) {
              resolvedSectionId = String(found.id || found.section_id || '');
            } else {
              // Create the section automatically with sensible defaults
              const payload = {
                section_name: desiredSectionName,
                program: department,
                year_level: yearNum || (year || ''),
                adviser_id: '',
                semester: '1st',
                academic_year: (() => {
                  const now = new Date();
                  const startYear = now.getMonth() >= 5 ? now.getFullYear() : now.getFullYear() - 1; // AY starts around June
                  return `${startYear}-${startYear + 1}`;
                })(),
                student_ids: [],
              };
              try {
                const createRes = await apiService.createSection(payload);
                const createdId = createRes?.data?.id || createRes?.id || createRes?.section_id;
                if (createdId) {
                  resolvedSectionId = String(createdId);
                }
              } catch (createErr) {
                console.warn('Auto-create section failed; proceeding without section assignment:', createErr);
              }
            }
          } catch (secErr) {
            console.warn('Section resolution failed; proceeding without section assignment:', secErr);
          }
        }
      }

      // Create FormData to send images with user data
      const formData = new FormData();
      
      // Add user data fields
      formData.append('role', role);
      formData.append('full_name', fullName);
      formData.append('email', email);
      formData.append('password', password);
      formData.append('contact_num', contactNumber);
      formData.append('address', address);
      
      // Add role-specific fields
      if (role === 'admin') {
        formData.append('program', 'administration');
      } else if (role === 'teacher') {
        formData.append('program', department || 'Information Technology');
      } else if (role === 'student') {
        formData.append('program', department);
        formData.append('student_num', studentNumber);
        // Use the resolvedSectionId if available (existing or newly created)
        formData.append('section_id', resolvedSectionId || '');
        formData.append('qr_code', qrData || `IDNo: ${studentNumber}\nFull Name: ${fullName}\nProgram: ${department}`);
      }
      
      // Add images if they exist
      if (profileImageFile) {
        formData.append('profile_pic', profileImageFile);
      }
      if (coverPhotoFile) {
        formData.append('cover_pic', coverPhotoFile);
      }
      
      // Debug: Log what we're sending
      
      
      // Call API to create or update user
      let response;
      if (editMode && editUser) {
        response = await apiService.updateUserWithImages(editUser.id, formData);
        setSuccessMessage(`User ${fullName} has been updated successfully!`);
      } else {
        response = await apiService.registerWithImages(formData);
        setSuccessMessage(`User ${fullName} has been created successfully!`);
      }
      
      // Hide loading modal and show success modal
      setShowLoadingModal(false);
      setIsLoading(false);
      setShowSuccessModal(true);
      
      // Hide success modal after 1.5 seconds and navigate (faster response)
              setTimeout(() => {
          setShowSuccessModal(false);
          if (editMode && onEditDone) {
            onEditDone();
          } else {
            navigate(`/admin/user-management?tab=${tab}&view=${view}&refresh=true`);
          }
        }, 1500);
      
    } catch (error) {
      setShowLoadingModal(false);
      setIsLoading(false);
      setApiError(error.message || "Failed to create user. Please try again.");
      console.error("Error creating user:", error);
    }
  };

  // Handle cover photo change (open crop modal)
  const handleCoverPhotoChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setCoverPhotoName(file.name);
      const url = URL.createObjectURL(file);
      setCoverTempImage(url);
      setCoverCropModal(true);
    }
  };

  // Cover photo crop complete
  const onCoverCropComplete = (croppedArea, croppedAreaPixels) => {
    setCoverCroppedAreaPixels(croppedAreaPixels);
  };

  // Get cropped cover photo
  const getCroppedCoverImg = async (imageSrc, crop) => {
    const image = await createImage(imageSrc);
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    canvas.width = crop.width;
    canvas.height = crop.height;
    ctx.drawImage(
      image,
      crop.x,
      crop.y,
      crop.width,
      crop.height,
      0,
      0,
      crop.width,
      crop.height
    );
    return new Promise((resolve) => {
      resolve(canvas.toDataURL('image/jpeg'));
    });
  };

  // Save cropped cover photo
  const handleCoverCropSave = async () => {
    try {
      const croppedUrl = await getCroppedCoverImg(coverTempImage, coverCroppedAreaPixels);
      
      // Convert base64 to blob
      const response = await fetch(croppedUrl);
      const blob = await response.blob();
      
      // Create a file from the blob
      const file = new File([blob], coverPhotoName || 'cover.jpg', { type: 'image/jpeg' });
      
      // Store the file for later use in registration
      setCoverPhotoFile(file);
      setCoverPhotoUrl(croppedUrl); // Keep base64 for preview
      
      setCoverPhoto(null);
      setCoverCropModal(false);
      setCoverTempImage(null);
    } catch (error) {
      console.error('Error processing cover photo:', error);
      alert('Failed to process cover photo. Please try again.');
      setCoverPhoto(null);
      setCoverCropModal(false);
      setCoverTempImage(null);
    }
  };

  // Handle cover photo delete
  const handleDeleteCoverPhoto = () => {
    setCoverPhoto(null);
    setCoverPhotoUrl(null);
    setCoverPhotoName("");
    setCoverPhotoFile(null);
    setCoverTempImage(null);
    setCoverCropModal(false);
  };

  return (
    <>
      <Header compact />
      <Container className="mt-4" fluid>
        <Row>
          <Col className="order-xl-1 mx-auto" xl="8" lg="8" md="10">
            <Card className="bg-secondary shadow border-0 mt-5">
              <CardHeader className="bg-white border-0">
                <Row className="align-items-center">
                  <Col xs="8">
                    <h3 className="mb-0">{editMode ? 'Update User Information' : 'Create New User'}</h3>
                  </Col>
                </Row>
              </CardHeader>
              <CardBody>
                <div className="cover-photo-container mb-4">
                  {/* Cover Photo */}
                  <div className={`cover-photo-img-wrapper${coverPhotoUrl ? ' has-image' : ''}`}>
                    <img
                      alt="Cover Preview"
                      src={coverPhotoUrl || defaultCoverPhotoSvg}
                      className="cover-photo-img"
                    />
                    {/* Fade effect at bottom of cover photo */}
                    <div className="cover-photo-fade" />
                    {/* Add Photo Button for Cover Photo */}
                    <label
                      htmlFor="coverPhotoInput"
                      className="add-image-btn"
                      style={{
                        position: 'absolute',
                        bottom: 16,
                        right: 16,
                        cursor: 'pointer',
                        background: '#fff',
                        borderRadius: '50%',
                        width: 40,
                        height: 40,
                        boxShadow: '0 2px 6px rgba(0,0,0,0.1)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        padding: 0,
                        zIndex: 16
                      }}
                    >
                      <FaCamera color="#324cdd" size={18} />
                      <input
                        id="coverPhotoInput"
                        type="file"
                        accept="image/*"
                        style={{ display: 'none' }}
                        onChange={handleCoverPhotoChange}
                      />
                    </label>
                    {/* Remove Cover Photo Overlay (full overlay with centered bin icon, only on hover) */}
                    {coverPhotoUrl && (
                      <div
                        className="cover-photo-hover-overlay"
                        onClick={handleDeleteCoverPhoto}
                        title="Delete cover photo"
                      >
                        <FaTrash color="#fff" size={28} />
                      </div>
                    )}
                  </div>
                  {/* Avatar centered and overlapping cover photo */}
                  <div className={`avatar-container${profileImageUrl && profileImageUrl !== userDefault ? ' has-image' : ''}`}>
                    <img
                      alt="Profile Preview"
                      className="avatar-img"
                      src={profileImageUrl || userDefault}
                    />
                    {/* Bin overlay centered, only on hover */}
                    {profileImageUrl && profileImageUrl !== userDefault && (
                      <div
                        className="avatar-hover-overlay"
                        onClick={handleDeleteAvatar}
                        title="Delete avatar"
                      >
                        <FaTrash color="#fff" size={28} />
                      </div>
                    )}
                    {/* Avatar Upload Button (bottom-right, always visible) */}
                    <label
                      htmlFor="profileImageInput"
                      className="avatar-action-btn"
                      style={{
                        position: 'absolute',
                        bottom: 0,
                        right: 0,
                        cursor: 'pointer',
                        background: '#fff',
                        borderRadius: '50%',
                        width: 36,
                        height: 36,
                        boxShadow: '0 2px 6px rgba(0,0,0,0.1)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        padding: 0,
                        zIndex: 2
                      }}
                    >
                      <FaCamera color="#324cdd" size={18} />
                      <input
                        id="profileImageInput"
                        type="file"
                        accept="image/*"
                        style={{ display: 'none' }}
                        onChange={handleProfileImageChange}
                      />
                    </label>
                  </div>
                  {/* Spacer below avatar for visual gap */}
                  <div style={{ height: '2.5rem' }} />
                </div>
                <Form onSubmit={handleCreateUser}>
                  {/* Error Alert */}
                  {error && (
                    <Alert color="danger" className="mb-4">
                      {error}
                    </Alert>
                  )}
                  {apiError && (
                    <Alert color="danger" className="mb-4">
                      {apiError}
                    </Alert>
                  )}
                  <h6 className="heading-small text-muted mb-4">User information</h6>
                  <div className="pl-lg-4">
                    <Row>
                      <Col lg="6">
                        <FormGroup>
                          <label className="form-control-label" htmlFor="role">Role</label>
                          <Input type="select" className="form-control-alternative" id="role" value={role} onChange={e => setRole(e.target.value)} required>
                            <option value="">Select Role</option>
                            <option value="admin">Admin</option>
                            <option value="teacher">Teacher</option>
                            <option value="student">Student</option>
                          </Input>
                        </FormGroup>
                      </Col>
                      <Col lg="6">
                        <FormGroup>
                          <label className="form-control-label" htmlFor="fullName">Full Name</label>
                          <Input 
                            className={`form-control-alternative ${nameError ? 'is-invalid' : ''}`}
                            type="text" 
                            id="fullName" 
                            value={fullName} 
                            onChange={e => {
                              setFullName(e.target.value);
                              setNameError(checkDuplicateName(e.target.value));
                            }}
                            required 
                          />
                          {nameError && (
                            <small className="text-danger">{nameError}</small>
                          )}
                        </FormGroup>
                      </Col>
                    </Row>
                    <Row>
                      <Col lg="6">
                        <FormGroup>
                          <label className="form-control-label" htmlFor="email">Email</label>
                          <Input
                            className={`form-control-alternative ${emailError ? 'is-invalid' : ''}`}
                            type="email"
                            id="email"
                            value={email}
                            onChange={e => {
                              setEmail(e.target.value);
                              setEmailValid(validateEmail(e.target.value));
                              setEmailError(checkDuplicateEmail(e.target.value));
                            }}
                            required
                          />
                          {!emailValid && (
                            <small className="text-danger">Please enter a valid email address.</small>
                          )}
                          {emailError && (
                            <small className="text-danger">{emailError}</small>
                          )}
                        </FormGroup>
                      </Col>
                      <Col lg="6">
                        <FormGroup>
                          <label className="form-control-label" htmlFor="password">Password</label>
                          <Input
                            className="form-control-alternative"
                            type="password"
                            id="password"
                            value={password}
                            onChange={e => {
                              setPassword(e.target.value);
                              setPasswordStrength(checkPasswordStrength(e.target.value));
                            }}
                            required
                          />
                          {password && (
                            <small className={
                              passwordStrength === 'strong' ? 'text-success' :
                              passwordStrength === 'medium' ? 'text-warning' :
                              'text-danger'
                            }>
                              Password strength: {passwordStrength}
                            </small>
                          )}
                        </FormGroup>
                      </Col>
                    </Row>
                    {/* Address and Contact Number for Admin - positioned below email/password */}
                    {role === 'admin' && (
                      <Row>
                        <Col lg="6">
                          <FormGroup>
                            <label className="form-control-label" htmlFor="address">Address *</label>
                            <Input 
                              className="form-control-alternative" 
                              type="text" 
                              id="address" 
                              value={address} 
                              onChange={e => setAddress(e.target.value)} 
                              required
                              placeholder="Enter admin's address"
                            />
                          </FormGroup>
                        </Col>
                        <Col lg="6">
                          <FormGroup>
                            <label className="form-control-label" htmlFor="contactNumber">Contact Number *</label>
                            <Input 
                              className="form-control-alternative" 
                              type="text" 
                              id="contactNumber" 
                              value={contactNumber} 
                              onChange={e => setContactNumber(e.target.value)} 
                              required
                              placeholder="Enter contact number"
                            />
                          </FormGroup>
                        </Col>
                      </Row>
                    )}
                  </div>
                  <hr className="my-4" />
                  <h6 className="heading-small text-muted mb-4">Account Status</h6>
                  <div className="pl-lg-4">
                    <Row>
                      <Col lg="6">
                        <FormGroup>
                          <label className="form-control-label" htmlFor="status">Status</label>
                          <Input type="select" className="form-control-alternative" id="status" value={status} onChange={e => setStatus(e.target.value)} required>
                            <option value="active">Active</option>
                            <option value="inactive">Inactive</option>
                          </Input>
                        </FormGroup>
                      </Col>
                    </Row>
                  </div>
                  {/* Conditionally render details based on role */}
                  {role === 'admin' && (
                    <>
                      <hr className="my-4" />
                      <h6 className="heading-small text-muted mb-4">Admin Information</h6>
                      <div className="pl-lg-4">
                        <Row>
                          <Col lg="12">
                            <FormGroup>
                              <label className="form-control-label" htmlFor="department">Department</label>
                              <Input
                                className="form-control-alternative"
                                type="text"
                                id="department"
                                value="Administration"
                                readOnly
                                disabled
                              />
                            </FormGroup>
                          </Col>
                        </Row>
                      </div>
                    </>
                  )}
                  {role === 'teacher' && (
                    <>
                      <hr className="my-4" />
                      <h6 className="heading-small text-muted mb-4">Teacher Information</h6>
                      <div className="pl-lg-4">
                        <Row>
                          <Col lg="12">
                            <FormGroup>
                              <label className="form-control-label" htmlFor="address">Address *</label>
                              <Input 
                                className="form-control-alternative" 
                                type="text" 
                                id="address" 
                                value={address} 
                                onChange={e => setAddress(e.target.value)} 
                                required
                                placeholder="Enter teacher's address"
                              />
                            </FormGroup>
                          </Col>
                        </Row>
                        <Row>
                          <Col lg="6">
                            <FormGroup>
                              <label className="form-control-label" htmlFor="contactNumber">Contact Number *</label>
                              <Input 
                                className="form-control-alternative" 
                                type="text" 
                                id="contactNumber" 
                                value={contactNumber} 
                                onChange={e => setContactNumber(e.target.value)} 
                                required
                                placeholder="Enter contact number"
                              />
                            </FormGroup>
                          </Col>
                          <Col lg="6">
                            <FormGroup>
                              <label className="form-control-label" htmlFor="department">Department *</label>
                              <Input 
                                className="form-control-alternative" 
                                type="text" 
                                id="department" 
                                value={department} 
                                onChange={e => setDepartment(e.target.value)} 
                                required
                                placeholder="Enter department"
                              />
                            </FormGroup>
                          </Col>
                        </Row>
                      </div>
                    </>
                  )}
                  {role === 'student' && (
                    <>
                      <hr className="my-4" />
                      <h6 className="heading-small text-muted mb-4">Student Information</h6>
                      <div className="pl-lg-4">
                        <Row>
                          <Col lg="12">
                            <FormGroup>
                              <label className="form-control-label" htmlFor="address">Address *</label>
                              <Input 
                                className="form-control-alternative" 
                                type="text" 
                                id="address" 
                                value={address} 
                                onChange={e => setAddress(e.target.value)} 
                                required
                                placeholder="Enter student's address"
                              />
                            </FormGroup>
                          </Col>
                        </Row>
                        <Row>
                          <Col lg="6">
                            <FormGroup>
                              <label className="form-control-label" htmlFor="contactNumber">Contact Number *</label>
                              <Input 
                                className="form-control-alternative" 
                                type="text" 
                                id="contactNumber" 
                                value={contactNumber} 
                                onChange={e => setContactNumber(e.target.value)} 
                                required
                                placeholder="Enter contact number"
                              />
                            </FormGroup>
                          </Col>
                          <Col lg="6">
                            <FormGroup>
                              <label className="form-control-label" htmlFor="studentNumber">Student Number *</label>
                              <Input 
                                className={`form-control-alternative ${studentNumberError ? 'is-invalid' : ''}`}
                                type="text" 
                                id="studentNumber" 
                                value={studentNumber} 
                                onChange={e => {
                                  setStudentNumber(e.target.value);
                                  setStudentNumberError(checkDuplicateStudentNumber(e.target.value));
                                }}
                                required
                                placeholder="Enter student number (min. 8 characters)"
                              />
                              {studentNumberError && (
                                <small className="text-danger">{studentNumberError}</small>
                              )}
                            </FormGroup>
                          </Col>
                        </Row>
                        <Row>
                          <Col lg="12">
                            <FormGroup>
                              <label className="form-control-label" htmlFor="course">Course *</label>
                              <Input 
                                className="form-control-alternative" 
                                type="select" 
                                id="course" 
                                value={department} 
                                onChange={e => setDepartment(e.target.value)}
                                required
                              >
                                <option value="">Select Course</option>
                                <option value="Associate in Computer Technology">Associate in Computer Technology</option>
                                <option value="Bachelor of Science in Information Technology">Bachelor of Science in Information Technology</option>
                                <option value="Bachelor of Science in Information Systems">Bachelor of Science in Information Systems</option>
                                <option value="Bachelor of Science in Computer Science">Bachelor of Science in Computer Science</option>
                              </Input>
                            </FormGroup>
                          </Col>
                        </Row>
                        <Row>
                          <Col lg="6">
                            <FormGroup>
                              <label className="form-control-label" htmlFor="year">Year</label>
                              <Input type="select" className="form-control-alternative" id="year" value={year} onChange={e => setYear(e.target.value)}>
                                <option value="">Select Year</option>
                                <option value="1st Year">1st Year</option>
                                <option value="2nd Year">2nd Year</option>
                                <option value="3rd Year">3rd Year</option>
                                <option value="4th Year">4th Year</option>
                                <option value="5th Year">5th Year</option>
                              </Input>
                            </FormGroup>
                          </Col>
                          <Col lg="6">
                            <FormGroup>
                              <label className="form-control-label" htmlFor="section">Section</label>
                              <Input className="form-control-alternative" type="text" id="section" value={section} onChange={e => setSection(e.target.value)} />
                            </FormGroup>
                          </Col>
                        </Row>
                      </div>
                      <hr className="my-4" />
                      <h6 className="heading-small text-muted mb-4">QR Code</h6>
                      <div className="pl-lg-4">
                        <FormGroup>
                          <label className="form-control-label">QR Code Data</label>
                          <Input
                            className="form-control-alternative"
                            type="text"
                            value={qrData}
                            readOnly
                            placeholder="QR code will be generated automatically..."
                          />
                          <small className="text-muted">
                            This will be generated automatically from Student Number, Full Name, and Course.
                          </small>
                        </FormGroup>
                      </div>
                    </>
                  )}
                  <div className="text-center">
                    <Button color="primary" type="submit" disabled={isLoading}>
                      {showBtnLoader ? (
                        <>
                          <span className="spinner-border spinner-border-sm mr-2" role="status" aria-hidden="true"></span>
                          {editMode ? 'Updating...' : 'Creating...'}
                        </>
                      ) : (
                        editMode ? 'Update User' : 'Create User'
                      )}
                    </Button>
                  </div>
                </Form>
              </CardBody>
            </Card>
            
            {/* Loading Modal */}
            <Modal isOpen={showLoadingModal} centered backdrop="static" keyboard={false}>
              <ModalBody className="text-center py-4">
                <LottieLoader message={editMode ? 'Updating User...' : 'Creating User...'} width={140} height={140} centered minHeight={'40vh'} desiredDurationSec={1.4} />
                <p className="text-muted mb-0">Please wait while we process your request.</p>
              </ModalBody>
            </Modal>

            {/* Success Modal */}
            <Modal isOpen={showSuccessModal} centered backdrop="static" keyboard={false}>
              <ModalBody className="text-center">
                <div className="mb-3">
                  <div className="bg-success rounded-circle d-inline-flex align-items-center justify-content-center" style={{ width: '4rem', height: '4rem' }}>
                    <i className="ni ni-check-bold text-white" style={{ fontSize: '2rem' }}></i>
                  </div>
                </div>
                <h5>
                  {successMessage}
                </h5>
              </ModalBody>
            </Modal>

            <Modal isOpen={cropModal} toggle={() => setCropModal(false)} centered size="lg">
              <ModalBody>
                <div style={{ position: 'relative', width: '100%', height: 300, background: '#333' }}>
                  {tempImage && (
                    <Cropper
                      image={tempImage}
                      crop={crop}
                      zoom={zoom}
                      aspect={1}
                      onCropChange={setCrop}
                      onZoomChange={setZoom}
                      onCropComplete={onCropComplete}
                    />
                  )}
                </div>
                <div className="d-flex align-items-center mt-3">
                  <span className="mr-2">Zoom</span>
                  <input
                    type="range"
                    min={1}
                    max={3}
                    step={0.1}
                    value={zoom}
                    onChange={e => setZoom(Number(e.target.value))}
                    style={{ width: 200 }}
                  />
                </div>
                <div className="text-center mt-3">
                  <Button color="primary" onClick={handleCropSave} className="mr-2">Save</Button>
                  <Button color="secondary" outline onClick={() => setCropModal(false)}>Cancel</Button>
                </div>
              </ModalBody>
            </Modal>
            <Modal isOpen={coverCropModal} toggle={() => setCoverCropModal(false)} centered size="lg">
              <ModalBody>
                <div style={{ position: 'relative', width: '100%', height: 300, background: '#333' }}>
                  {coverTempImage && (
                    <Cropper
                      image={coverTempImage}
                      crop={coverCrop}
                      zoom={coverZoom}
                      aspect={600/190}
                      onCropChange={setCoverCrop}
                      onZoomChange={setCoverZoom}
                      onCropComplete={onCoverCropComplete}
                    />
                  )}
                </div>
                <div className="d-flex align-items-center mt-3">
                  <span className="mr-2">Zoom</span>
                  <input
                    type="range"
                    min={1}
                    max={3}
                    step={0.1}
                    value={coverZoom}
                    onChange={e => setCoverZoom(Number(e.target.value))}
                    style={{ width: 200 }}
                  />
                </div>
                <div className="text-center mt-3">
                  <Button color="primary" onClick={handleCoverCropSave} className="mr-2">Save</Button>
                  <Button color="secondary" outline onClick={() => setCoverCropModal(false)}>Cancel</Button>
                </div>
              </ModalBody>
            </Modal>
          </Col>
        </Row>
      </Container>
    </>
  );
};

export default CreateUser; 