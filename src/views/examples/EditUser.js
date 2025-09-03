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
  Alert,
  Spinner
} from "reactstrap";
import LottieLoader from "components/LottieLoader";
import useMinDelay from "utils/useMinDelay";
import Header from "components/Headers/Header.js";
import { FaCamera, FaTrash } from "react-icons/fa";
import userDefault from "../../assets/img/theme/user-default.svg";
import Cropper from 'react-easy-crop';
import "./CreateUser.css";
import { useNavigate, useParams, useLocation } from "react-router-dom";
import ApiService from "../../services/api";

const defaultCoverPhotoSvg =
  "data:image/svg+xml;utf8,<svg width='600' height='240' viewBox='0 0 600 240' fill='none' xmlns='http://www.w3.org/2000/svg'><rect width='600' height='240' fill='%23f7f7f7'/><path d='M0 180 Q150 120 300 180 T600 180 V240 H0 Z' fill='%23e3eafc'/><path d='M0 200 Q200 140 400 200 T600 200 V240 H0 Z' fill='%23cfd8dc' opacity='0.7'/></svg>";

const EditUser = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const searchParams = new URLSearchParams(location.search);
  const tab = searchParams.get('tab') || 'admin';
  const view = searchParams.get('view') || 'table';
  const role = searchParams.get('role') || 'admin';

  // Add error boundary state
  const [hasError, setHasError] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  // Form state
  const [formRole, setFormRole] = useState("");
  const [fullName, setFullName] = useState("");
  const [address, setAddress] = useState("");
  const [contactNumber, setContactNumber] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [department, setDepartment] = useState("");
  const [studentNumber, setStudentNumber] = useState("");
  const [originalStudentNumber, setOriginalStudentNumber] = useState(""); // Track original value
  const [section, setSection] = useState("");
  const [year, setYear] = useState("");
  const [qrData, setQrData] = useState("");
  const [status, setStatus] = useState("active");

  // Section management state
  const [availableSections, setAvailableSections] = useState([]);
  const [loadingSections, setLoadingSections] = useState(false);

  // Image states
  const [profileImageUrl, setProfileImageUrl] = useState(null);
  const [profileImageName, setProfileImageName] = useState("");
  const [profileImageFile, setProfileImageFile] = useState(null);
  const [coverPhotoUrl, setCoverPhotoUrl] = useState(null);
  const [coverPhotoName, setCoverPhotoName] = useState("");
  const [coverPhotoFile, setCoverPhotoFile] = useState(null);

  // Modal states
  const [cropModal, setCropModal] = useState(false);
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState(null);
  const [tempImage, setTempImage] = useState(null);
  const [coverCropModal, setCoverCropModal] = useState(false);
  const [coverCrop, setCoverCrop] = useState({ x: 0, y: 0 });
  const [coverZoom, setCoverZoom] = useState(1);
  const [coverCroppedAreaPixels, setCoverCroppedAreaPixels] = useState(null);
  const [coverTempImage, setCoverTempImage] = useState(null);

  // Loading and error states
  const [isLoading, setIsLoading] = useState(true);
  const showPageLoader = useMinDelay(isLoading, 1600);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [apiError, setApiError] = useState("");
  const [success, setSuccess] = useState("");
  const [showLoadingModal, setShowLoadingModal] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);

  // Validation states
  const [nameError, setNameError] = useState("");
  const [emailError, setEmailError] = useState("");
  const [studentNumberError, setStudentNumberError] = useState("");

  // Fetch user data on component mount
  useEffect(() => {
    const fetchUserData = async () => {
      try {
        setIsLoading(true);
        setError("");
        
        console.log('EditUser useEffect - Starting to fetch user data');
        console.log('User ID from params:', id);
        console.log('Role from search params:', role);
        console.log('Current location:', location.pathname);
        
        // Check if ID is valid
        if (!id || id === 'undefined') {
          console.error('Invalid user ID:', id);
          setError("Invalid user ID. Please go back and try again.");
          setIsLoading(false);
          return;
        }
        
        // Use the correct endpoint with role and user_id parameters
        console.log('Calling ApiService.getUserById with:', { id, role });
        console.log('User ID type:', typeof id);
        console.log('User ID value:', id);
        console.log('Role type:', typeof role);
        console.log('Role value:', role);
        
        // Enhanced debugging for Google OAuth users
        if (id && id.toString().startsWith('100') && id.toString().length > 15) {
          console.log('🔍 Detected Google OAuth user ID:', id);
          console.log('🔍 This appears to be a Google ID (starts with 100, length > 15)');
        }
        
        const response = await ApiService.getUserById(id, role);
        console.log('API response received:', response);
        
        const user = response.data || response.user || response;
        
        if (!user) {
          console.error('No user data received from API');
          setError("User not found");
          setIsLoading(false);
          return;
        }

        console.log('User data successfully fetched:', user);
        
        // Pre-fill form with user data
        setFormRole(user.role || role);
        setFullName(user.full_name || user.name || "");
        setAddress(user.address || "");
        setContactNumber(user.contact_num || user.contactNumber || "");
        setEmail(user.email || "");
        setPassword(""); // Don't prefill password for security
        setDepartment(user.program || user.department || "");
        setStudentNumber(user.student_num || user.studentNumber || "");
        setOriginalStudentNumber(user.student_num || user.studentNumber || ""); // Set original value
        
        // Debug logging for Google account users
        console.log('User data fetched for editing:', {
          userId: id,
          userRole: role,
          formRole: user.role || role,
          fullName: user.full_name || user.name || "",
          email: user.email || "",
          program: user.program || user.department || "",
          studentNumber: user.student_num || user.studentNumber || "",
          hasGoogleId: !!user.google_id,
          hasProfileImageUrl: !!user.profile_image_url,
          profileImageUrl: user.profile_image_url,
          fullUserObject: user
        });
        
        // Handle section data properly
        if (user.section_name) {
          setSection(user.section_name); // Use section name if available
        } else if (user.section_id) {
          setSection(user.section_id); // Fallback to section ID
        } else {
          setSection(user.section || "");
        }
        
        // Handle year data properly - look for year field in various formats
        let userYear = user.year || user.year_level || "";
        console.log('Raw year data from API:', {
          year: user.year,
          year_level: user.year_level,
          userYear: userYear,
          section_name: user.section_name,
          fullUserObject: user
        });
        
        // If year is still empty but we have a year_level, use it
        if (!userYear && user.year_level) {
          userYear = user.year_level;
        }
        
        // Handle different year formats from API
        if (userYear) {
          const yearStr = userYear.toString().toLowerCase();
          
          // If it's already in proper format (case insensitive), normalize the case
          if (yearStr.includes('year')) {
            // Convert "1st year" to "1st Year", "2nd year" to "2nd Year", etc.
            userYear = yearStr.split(' ').map(word => 
              word.charAt(0).toUpperCase() + word.slice(1)
            ).join(' ');
          } 
          // If it's just a number, convert to proper format
          else if (!isNaN(yearStr)) {
            const yearNumber = yearStr.toString();
            const yearMap = {
              '1': '1st Year',
              '2': '2nd Year', 
              '3': '3rd Year',
              '4': '4th Year',
              '5': '5th Year'
            };
            userYear = yearMap[yearNumber] || `${yearNumber}${yearNumber === '1' ? 'st' : yearNumber === '2' ? 'nd' : yearNumber === '3' ? 'rd' : 'th'} Year`;
          }
        }
        
        console.log('Processed year for display:', userYear);
        setYear(userYear);
        
        setQrData(user.qr_code || user.qrData || "");
        setStatus(user.status || "active");
        
        // Set profile image URL (construct full URL if it's a path)
        // Check for Google OAuth profile image first, then fallback to local profile images
        if (user.profile_image_url || user.profile_pic || user.profileImageUrl) {
          const profileUrl = user.profile_image_url || user.profile_pic || user.profileImageUrl;
          if (profileUrl.startsWith('http')) {
            // Add cache busting parameter to existing URLs
            const cacheBuster = `?t=${Date.now()}`;
            setProfileImageUrl(profileUrl + (profileUrl.includes('?') ? '&' : '?') + `t=${Date.now()}`);
          } else {
            // Construct full URL with cache busting
            setProfileImageUrl(`${process.env.REACT_APP_API_BASE_URL || 'https://scms-backend.up.railway.app'}/${profileUrl}?t=${Date.now()}`);
          }
        }
        
        // Set cover photo URL (construct full URL if it's a path)
        if (user.cover_pic || user.coverPhotoUrl) {
          const coverUrl = user.cover_pic || user.coverPhotoUrl;
          if (coverUrl.startsWith('http')) {
            // Add cache busting parameter to existing URLs
            setCoverPhotoUrl(coverUrl + (coverUrl.includes('?') ? '&' : '?') + `t=${Date.now()}`);
          } else {
            // Construct full URL with cache busting
            setCoverPhotoUrl(`${process.env.REACT_APP_API_BASE_URL || 'https://scms-backend.up.railway.app'}/${coverUrl}?t=${Date.now()}`);
          }
        }
        
        setIsLoading(false);
      } catch (err) {
        console.error("Error fetching user:", err);
        setError("Failed to fetch user data: " + (err.message || "Network error"));
        setIsLoading(false);
      }
    };

    fetchUserData();
  }, [id, role]);

  // Helper function to get course abbreviation from full course name
  const getCourseAbbreviation = (courseName) => {
    if (!courseName) return '';
    
    const course = courseName.toLowerCase();
    if (course.includes('information technology')) return 'BSIT';
    if (course.includes('computer science')) return 'BSCS';
    if (course.includes('information systems')) return 'BSIS';
    if (course.includes('computer technology')) return 'ACT';
    
    // For other courses, try to extract abbreviation from the name
    const words = courseName.split(' ');
    if (words.length >= 2) {
      return words.slice(0, 2).map(word => word.charAt(0).toUpperCase()).join('') + 
             words.slice(2).map(word => word.charAt(0).toUpperCase()).join('');
    }
    
    return courseName.substring(0, 4).toUpperCase();
  };

  // Function to fetch sections based on year and program
  const fetchSectionsByYearAndProgram = async (selectedYear, selectedProgram) => {
    if (!selectedYear || !selectedProgram || formRole !== 'student') {
      setAvailableSections([]);
      return;
    }

    setLoadingSections(true);
    console.log('Fetching sections for:', { selectedYear, selectedProgram });
    
    try {
      // Extract year number from year string (e.g., "1st Year" -> "1")
      const yearNumber = selectedYear.replace(/[^0-9]/g, '');
      console.log('Extracted year number:', yearNumber);
      
      let sections = [];
      
      // Method 1: Try to get sections by program and year (most specific)
      try {
        console.log('Method 1: Trying getSectionsByProgramAndYear...');
        const response = await ApiService.getSectionsByProgramAndYear(selectedProgram, yearNumber);
        console.log('getSectionsByProgramAndYear response:', response);
        
        if (response && response.data && Array.isArray(response.data) && response.data.length > 0) {
          sections = response.data;
          console.log('Method 1 successful, found sections:', sections);
        } else if (Array.isArray(response) && response.length > 0) {
          sections = response;
          console.log('Method 1 successful, found sections:', sections);
        } else {
          throw new Error('No sections returned from program and year API');
        }
      } catch (specificError) {
        console.warn('Method 1 failed:', specificError);
        
        // Method 2: Get all sections and filter by program and year
        try {
          console.log('Method 2: Getting all sections and filtering by program and year...');
          const allSectionsResponse = await ApiService.getSections();
          console.log('All sections response:', allSectionsResponse);
          
          const allSections = allSectionsResponse?.data || allSectionsResponse || [];
          console.log('All sections array:', allSections);
          
          if (Array.isArray(allSections)) {
            // Enhanced filtering: Match exact course name and year level
            sections = allSections.filter(section => {
              const sectionProgram = section.program || '';
              const sectionYear = section.year_level || section.year || '';
              
              // Enhanced program matching for exact course names
              let programMatch = false;
              
              // Check for exact matches first
              if (sectionProgram.toLowerCase() === selectedProgram.toLowerCase()) {
                programMatch = true;
              }
              // Check for course abbreviation matches using helper function
              else {
                const expectedAbbr = getCourseAbbreviation(selectedProgram);
                const sectionAbbr = getCourseAbbreviation(sectionProgram);
                
                if (expectedAbbr === sectionAbbr || 
                    sectionProgram.toLowerCase().includes(expectedAbbr.toLowerCase()) ||
                    sectionProgram.toLowerCase().includes(selectedProgram.toLowerCase())) {
                  programMatch = true;
                }
              }
              
              // Enhanced year matching
              const yearMatch = sectionYear === yearNumber || 
                               sectionYear === selectedYear || 
                               sectionYear.toString() === yearNumber ||
                               (sectionYear && sectionYear.toString().includes(yearNumber));
              
              console.log('Enhanced filtering:', {
                sectionName: section.section_name || section.name,
                sectionProgram: sectionProgram,
                sectionYear: sectionYear,
                selectedProgram: selectedProgram,
                selectedYear: selectedYear,
                yearNumber: yearNumber,
                programMatch: programMatch,
                yearMatch: yearMatch,
                finalMatch: programMatch && yearMatch
              });
              
              return programMatch && yearMatch;
            });
            
            console.log('Method 2 filtered sections:', sections);
            
            // If no sections found with filtering, log the issue but don't show all sections
            if (sections.length === 0) {
              console.warn('No sections found with enhanced filtering for:', { selectedProgram, selectedYear, yearNumber });
              console.log('Available sections that did not match:', allSections.map(s => ({
                name: s.section_name || s.name,
                program: s.program,
                year: s.year_level || s.year
              })));
            }
          } else {
            console.error('All sections is not an array:', allSections);
          }
        } catch (allSectionsError) {
          console.error('Method 2 failed:', allSectionsError);
        }
      }
      
      // If still no sections found, create sample sections based on course and year
      if (sections.length === 0) {
        console.warn('⚠️ No sections found from API methods. Creating sample sections for:', { selectedProgram, selectedYear, yearNumber });
        
        // Use the helper function to get course abbreviation
        const courseAbbr = getCourseAbbreviation(selectedProgram);
        
        // Create sample sections for the specific year and course
        sections = [
          { id: `temp-1`, section_name: `${courseAbbr} ${yearNumber}A`, name: `${courseAbbr} ${yearNumber}A` },
          { id: `temp-2`, section_name: `${courseAbbr} ${yearNumber}B`, name: `${courseAbbr} ${yearNumber}B` },
          { id: `temp-3`, section_name: `${courseAbbr} ${yearNumber}C`, name: `${courseAbbr} ${yearNumber}C` }
        ];
        
        console.log('📝 Created sample sections:', sections);
        console.log('🔧 These are temporary sections. Please ensure your database has proper sections for this course and year.');
      }

      // Sort sections by name for better UX
      sections.sort((a, b) => {
        const nameA = a.section_name || a.name || '';
        const nameB = b.section_name || b.name || '';
        return nameA.localeCompare(nameB);
      });

      console.log('Final sections to display:', sections);
      setAvailableSections(sections);
    } catch (error) {
      console.error('Error fetching sections:', error);
      setAvailableSections([]);
    } finally {
      setLoadingSections(false);
    }
  };

  // Fetch sections when year or program changes
  useEffect(() => {
    if (formRole === 'student' && year && department) {
      console.log('useEffect triggered - fetching sections for:', { year, department, formRole });
      fetchSectionsByYearAndProgram(year, department);
    } else {
      console.log('useEffect skipped:', { year, department, formRole, condition: formRole === 'student' && year && department });
    }
  }, [year, department, formRole]);

  // Also fetch sections when the component mounts and all required data is available
  useEffect(() => {
    if (formRole === 'student' && year && department && !loadingSections && availableSections.length === 0) {
      console.log('Component mounted - fetching sections for student:', { year, department });
      fetchSectionsByYearAndProgram(year, department);
    }
  }, [formRole, year, department, loadingSections, availableSections.length]);

  // Auto-generate QR code for students
  useEffect(() => {
    console.log('QR code generation useEffect triggered:', {
      formRole,
      studentNumber,
      fullName,
      department,
      currentQrData: qrData
    });
    
    if (formRole === 'student' && studentNumber && fullName && department) {
      const generatedQrData = `IDNo: ${studentNumber}\nFull Name: ${fullName}\nProgram: ${department}`;
      setQrData(generatedQrData);
      console.log('QR code auto-generated for student:', {
        studentNumber,
        fullName,
        department,
        generatedQrData
      });
    } else if (formRole === 'student') {
      setQrData("");
      console.log('QR code not generated - missing required fields:', {
        formRole,
        studentNumber,
        fullName,
        department,
        hasStudentNumber: !!studentNumber,
        hasFullName: !!fullName,
        hasDepartment: !!department
      });
    }
  }, [formRole, studentNumber, fullName, department]);

  // Error boundary effect
  useEffect(() => {
    const handleError = (error) => {
      console.error('EditUser component error:', error);
      setHasError(true);
      setErrorMessage(error.message || 'An unexpected error occurred');
    };

    window.addEventListener('error', handleError);
    window.addEventListener('unhandledrejection', handleError);

    return () => {
      window.removeEventListener('error', handleError);
      window.removeEventListener('unhandledrejection', handleError);
    };
  }, []);

  // Image cropping functions (same as CreateUser.js)
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
      
      // Store the file for later use in update
      setProfileImageFile(file);
      setProfileImageUrl(croppedUrl); // Keep base64 for preview
      
      setCropModal(false);
      setTempImage(null);
    } catch (error) {
      console.error('Error processing profile image:', error);
      alert('Failed to process profile image. Please try again.');
      setCropModal(false);
      setTempImage(null);
    }
  };

  // Cover photo functions
  const handleCoverPhotoChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setCoverPhotoName(file.name);
      const url = URL.createObjectURL(file);
      setCoverTempImage(url);
      setCoverCropModal(true);
    }
  };

  const onCoverCropComplete = (croppedArea, croppedAreaPixels) => {
    setCoverCroppedAreaPixels(croppedAreaPixels);
  };

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

  const handleCoverCropSave = async () => {
    try {
      const croppedUrl = await getCroppedCoverImg(coverTempImage, coverCroppedAreaPixels);
      
      // Convert base64 to blob
      const response = await fetch(croppedUrl);
      const blob = await response.blob();
      
      // Create a file from the blob
      const file = new File([blob], coverPhotoName || 'cover.jpg', { type: 'image/jpeg' });
      
      // Store the file for later use in update
      setCoverPhotoFile(file);
      setCoverPhotoUrl(croppedUrl); // Keep base64 for preview
      
      setCoverCropModal(false);
      setCoverTempImage(null);
    } catch (error) {
      console.error('Error processing cover photo:', error);
      alert('Failed to process cover photo. Please try again.');
      setCoverCropModal(false);
      setCoverTempImage(null);
    }
  };

  const handleDeleteCoverPhoto = () => {
    setCoverPhotoUrl(null);
    setCoverPhotoName("");
    setCoverPhotoFile(null);
    setCoverTempImage(null);
    setCoverCropModal(false);
  };

  // Validation functions
  const validateEmail = (email) => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  };

  const checkDuplicateName = (name) => {
    if (!name.trim()) return "";
    if (name.length < 2) {
      return "Name must be at least 2 characters long.";
    }
    return "";
  };

  const checkDuplicateEmail = (email) => {
    if (!email.trim()) return "";
    if (!validateEmail(email)) {
      return "Please enter a valid email address.";
    }
    return "";
  };

  const checkDuplicateStudentNumber = (studentNumber) => {
    if (!studentNumber.trim() || formRole !== 'student') return "";
    if (studentNumber.length < 8) {
      return "Student number must be at least 8 characters long.";
    }
    return "";
  };

  // Handle form submission
  const handleUpdateUser = async (e) => {
    e.preventDefault();
    
    // Clear previous errors
    setNameError("");
    setEmailError("");
    setStudentNumberError("");
    setApiError("");
    
    // Basic validation
    if (!formRole || !fullName || !email) {
      setError("Please fill in all required fields.");
      return;
    }
    
    if (!validateEmail(email)) {
      setEmailError("Please enter a valid email address.");
      return;
    }
    
    // Role-specific validation
    if (formRole === 'admin') {
      if (!address.trim()) {
        setError("Address is required for admins.");
        return;
      }
      if (!contactNumber.trim()) {
        setError("Contact number is required for admins.");
        return;
      }
    }
    
    if (formRole === 'teacher') {
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
    
    if (formRole === 'student') {
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
      
      // Check if student number has changed and validate uniqueness
      if (studentNumber !== originalStudentNumber) {
        try {
          // Check if another user already has this student number
          const existingUsersResponse = await ApiService.getUsersByRole('student');
          const existingUsers = existingUsersResponse?.data || existingUsersResponse || [];
          
          const duplicateUser = existingUsers.find(user => 
            user.student_num === studentNumber && 
            user.user_id !== id && 
            user.role === 'student'
          );
          
          if (duplicateUser) {
            setStudentNumberError(`Student number ${studentNumber} is already taken by ${duplicateUser.full_name || duplicateUser.name}. Please use a different student number.`);
            return;
          }
        } catch (checkError) {
          console.warn('Could not validate student number uniqueness:', checkError);
          // Continue with update if we can't validate uniqueness
        }
      }
    }
    
    // Start loading modal
    setShowLoadingModal(true);
    setSubmitting(true);
    
    try {
      // Resolve section_id when editing a student
      let resolvedSectionId = '';
      if (formRole === 'student' && section && section.trim()) {
        const trimmed = section.trim();
        const isNumeric = /^[0-9]+$/.test(trimmed);
        
        if (isNumeric) {
          // If section is numeric, use it as section_id directly
          resolvedSectionId = String(parseInt(trimmed, 10));
        } else {
          // If section is a name, find the corresponding section_id
          try {
            // First, try to find from the currently loaded sections
            const foundSection = availableSections.find((s) => {
              const name = s.section_name || s.name || '';
              return name.toLowerCase() === trimmed.toLowerCase();
            });
            
            if (foundSection) {
              resolvedSectionId = String(foundSection.id || foundSection.section_id || '');
            } else {
              // Fallback: search all sections
              const sectionsResp = await ApiService.getSections();
              const sectionsArr = sectionsResp?.data || sectionsResp || [];
              const found = (sectionsArr || []).find((s) => {
                const name = s.name || s.section_name || '';
                return name.toLowerCase() === trimmed.toLowerCase();
              });
              
              if (found) {
                resolvedSectionId = String(found.id || found.section_id || '');
              } else {
                // Create a new section if it doesn't exist
                const programToAbbr = {
                  'Associate in Computer Technology': 'ACT',
                  'Bachelor of Science in Information Technology': 'BSIT',
                  'Bachelor of Science in Information Systems': 'BSIS',
                  'Bachelor of Science in Computer Science': 'BSCS',
                };
                const abbr = programToAbbr[department] || (department ? department.substring(0, 4).toUpperCase() : '');
                const yearNum = (year || '').toString().replace(/[^0-9]/g, '') || '';
                
                const payload = {
                  section_name: trimmed,
                  program: department,
                  year_level: yearNum || (year || ''),
                  adviser_id: '',
                  semester: '1st',
                  academic_year: (() => {
                    const now = new Date();
                    const startYear = now.getMonth() >= 5 ? now.getFullYear() : now.getFullYear() - 1;
                    return `${startYear}-${startYear + 1}`;
                  })(),
                  student_ids: [],
                };
                
                try {
                  const createRes = await ApiService.createSection(payload);
                  const createdId = createRes?.data?.id || createRes?.id || createRes?.section_id;
                  if (createdId) {
                    resolvedSectionId = String(createdId);
                  }
                } catch (createErr) {
                  console.warn('Auto-create section (edit) failed; proceeding without section assignment:', createErr);
                }
              }
            }
          } catch (secErr) {
            console.warn('Section resolution (edit) failed; proceeding without section assignment:', secErr);
          }
        }
      }

      // Create FormData to send images with user data
      const formData = new FormData();
      
      try {
        // Add user data fields
        formData.append('user_id', id);
        formData.append('role', formRole);
        formData.append('full_name', fullName);
        formData.append('email', email);
        
        // Check if this is a Google account user by checking if they have a profile_image_url
        // Google OAuth users typically have a profile_image_url field
        const isGoogleUser = profileImageUrl && profileImageUrl.startsWith('http') && 
                            !profileImageUrl.includes('localhost') && 
                            !profileImageUrl.includes('scms_new_backup');
        
        // Only append password if it's not empty and user is not a Google account user
        if (password && password.trim() !== '' && !isGoogleUser) {
          formData.append('password', password);
          console.log('Password field added for non-Google user');
        } else if (isGoogleUser) {
          console.log('Skipping password field for Google account user');
          // For Google account users, we might need to preserve the google_id
          // This will be handled by the backend if the user already exists
        }
        
        formData.append('contact_num', contactNumber);
        formData.append('address', address);
        formData.append('status', status);
        
        // Add role-specific fields
        if (formRole === 'admin') {
          formData.append('program', 'administration');
        } else if (formRole === 'teacher') {
          formData.append('program', department || 'Information Technology');
        } else if (formRole === 'student') {
          formData.append('program', department);
          formData.append('student_num', studentNumber);
          // Use the resolvedSectionId if available (existing or newly created)
          formData.append('section_id', resolvedSectionId || '');
          
          // Ensure QR code is generated for Google account users
          let finalQrData = qrData;
          if (!finalQrData || finalQrData.trim() === '') {
            finalQrData = `IDNo: ${studentNumber}\nFull Name: ${fullName}\nProgram: ${department}`;
            console.log('QR code was empty, generating new one:', finalQrData);
          }
          formData.append('qr_code', finalQrData);
          
          // Debug logging for Google account users
          console.log('Student update data for Google account user:', {
            studentNumber,
            fullName,
            department,
            qrData,
            finalQrData,
            resolvedSectionId,
            formDataEntries: Array.from(formData.entries())
          });
        }
        
        // Add images if they exist
        if (profileImageFile) {
          formData.append('profile_pic', profileImageFile);
        }
        if (coverPhotoFile) {
          formData.append('cover_pic', coverPhotoFile);
        }
        
        // Debug logging for all users
        console.log('FormData contents before sending:', {
          role: formRole,
          hasPassword: !!password,
          hasProfileImage: !!profileImageFile,
          hasCoverPhoto: !!coverPhotoFile,
          isGoogleUser,
          allEntries: Array.from(formData.entries())
        });
        
        // Additional debugging for student updates
        if (formRole === 'student') {
          console.log('Student-specific data being sent:', {
            studentNumber,
            fullName,
            department,
            section: resolvedSectionId,
            qrCode: formData.get('qr_code'),
            program: formData.get('program')
          });
          
          // Validate required fields for students
          const requiredFields = {
            studentNumber: studentNumber && studentNumber.trim() !== '',
            fullName: fullName && fullName.trim() !== '',
            department: department && department.trim() !== '',
            qrCode: formData.get('qr_code') && formData.get('qr_code').trim() !== ''
          };
          
          console.log('Required fields validation:', requiredFields);
          
          const missingFields = Object.entries(requiredFields)
            .filter(([field, isValid]) => !isValid)
            .map(([field]) => field);
          
          if (missingFields.length > 0) {
            console.warn('Missing required fields for student update:', missingFields);
          }
        }
        
        // Final FormData validation and logging
        console.log('Final FormData validation:', {
          totalEntries: Array.from(formData.entries()).length,
          allKeys: Array.from(formData.keys()),
          hasUserId: formData.has('user_id'),
          hasRole: formData.has('role'),
          hasFullName: formData.has('full_name'),
          hasEmail: formData.has('email'),
          hasPassword: formData.has('password'),
          hasContactNum: formData.has('contact_num'),
          hasAddress: formData.has('address'),
          hasStatus: formData.has('status')
        });
        
      } catch (formDataError) {
        console.error('Error constructing FormData:', formDataError);
        throw new Error(`Failed to prepare form data: ${formDataError.message}`);
      }
      
      // Use role-specific update methods (now supports both files and text)
      let response;
      if (formRole === 'admin') {
        response = await ApiService.updateAdminUser(formData);
      } else if (formRole === 'teacher') {
        response = await ApiService.updateTeacherUser(formData);
      } else if (formRole === 'student') {
        response = await ApiService.updateStudentUser(formData);
      }
      
      // Hide loading modal and show success modal
      setShowLoadingModal(false);
      setSubmitting(false);
      setShowSuccessModal(true);
      
      // Refresh user data to get updated profile/cover images
      try {
        const refreshedUserResponse = await ApiService.getUserById(id, role);
        const refreshedUser = refreshedUserResponse.data || refreshedUserResponse.user || refreshedUserResponse;
        
        if (refreshedUser) {
          // Update profile image URL with cache busting
          // Check for Google OAuth profile image first, then fallback to local profile images
          if (refreshedUser.profile_image_url || refreshedUser.profile_pic || refreshedUser.profileImageUrl) {
            const profileUrl = refreshedUser.profile_image_url || refreshedUser.profile_pic || refreshedUser.profileImageUrl;
            if (profileUrl.startsWith('http')) {
              setProfileImageUrl(profileUrl + (profileUrl.includes('?') ? '&' : '?') + `t=${Date.now()}`);
            } else {
              setProfileImageUrl(`${process.env.REACT_APP_API_BASE_URL || 'https://scms-backend.up.railway.app'}/${profileUrl}?t=${Date.now()}`);
            }
          }
          
          // Update cover photo URL with cache busting
          if (refreshedUser.cover_pic || refreshedUser.coverPhotoUrl) {
            const coverUrl = refreshedUser.cover_pic || refreshedUser.coverPhotoUrl;
            if (coverUrl.startsWith('http')) {
              setCoverPhotoUrl(coverUrl + (coverUrl.includes('?') ? '&' : '?') + `t=${Date.now()}`);
            } else {
              setCoverPhotoUrl(`${process.env.REACT_APP_API_BASE_URL || 'https://scms-backend.up.railway.app'}/${coverUrl}?t=${Date.now()}`);
            }
          }
        }
      } catch (refreshError) {
        console.warn('Failed to refresh user data after update:', refreshError);
      }
      
      // Hide success modal after 1.5 seconds and navigate back with preserved tab and view
      setTimeout(() => {
        setShowSuccessModal(false);
        const backTab = tab || 'admin';
        const backView = view || 'table';
        navigate(`/admin/user-management?tab=${backTab}&view=${backView}&refresh=true`);
      }, 1500);
      
    } catch (error) {
      setShowLoadingModal(false);
      setSubmitting(false);
      console.error("Full error details:", error);
      
      // Enhanced error logging for debugging
      if (error.response) {
        console.error('Error response details:', {
          status: error.response.status,
          statusText: error.response.statusText,
          data: error.response.data,
          headers: error.response.headers
        });
        
        // Check if this is a Google account user specific error
        if (error.response.status === 500) {
          console.error('500 Server Error - This might be related to Google account user handling');
          console.error('Check if all required fields are properly set for Google OAuth users');
          
          // Check for specific database constraint violations
          if (error.response.data && typeof error.response.data === 'string') {
            if (error.response.data.includes('Duplicate entry') && error.response.data.includes('student_num')) {
              const errorMessage = 'This student number is already taken by another user. Please use a different student number.';
              setApiError(errorMessage);
              setStudentNumberError(errorMessage);
              console.error('Database constraint violation: Duplicate student number');
              return;
            }
            
            if (error.response.data.includes('Database Error')) {
              console.error('Database error detected. Check the response data for specific details.');
              // Try to extract more specific error information
              if (error.response.data.includes('Error Number: 1062')) {
                setApiError('Database constraint violation: This student number is already taken by another user.');
                setStudentNumberError('This student number is already taken by another user.');
                return;
              }
            }
          }
        }
      } else if (error.request) {
        console.error('Error request details:', error.request);
      } else {
        console.error('Error message:', error.message);
      }
      
      setApiError(error.message || "Failed to update user. Please try again.");
      console.error("Error updating user:", error);
    }
  };

  // Error boundary check - must be after all hooks
  if (hasError) {
    return (
      <div className="container mt-5">
        <div className="alert alert-danger">
          <h4>Error Loading Edit User Form</h4>
          <p>{errorMessage}</p>
          <button 
            className="btn btn-primary" 
            onClick={() => window.location.reload()}
          >
            Reload Page
          </button>
        </div>
      </div>
    );
  }

  // Loading state
  if (showPageLoader) {
    return (
      <>
        <Header compact />
        <Container className="mt-4" fluid>
          <Row className="justify-content-center">
            <Col xl="8" lg="8" md="10">
              <Card className="bg-secondary shadow border-0 mt-5">
                <CardBody className="text-center py-5">
                  <LottieLoader message="Loading user data..." desiredDurationSec={1.4} />
                </CardBody>
              </Card>
            </Col>
          </Row>
        </Container>
      </>
    );
  }

  // Error state
  if (error) {
    return (
      <>
        <Header compact />
        <Container className="mt-4" fluid>
          <Row className="justify-content-center">
            <Col xl="8" lg="8" md="10">
              <Card className="bg-secondary shadow border-0 mt-5">
                <CardBody className="text-center py-5">
                  <Alert color="danger">
                    <h5>Error Loading User</h5>
                    <p>{error}</p>
                    <Button 
                      color="primary" 
                      onClick={() => {
                        const backTab = tab || 'admin';
                        const backView = view || 'table';
                        navigate(`/admin/user-management?tab=${backTab}&view=${backView}`);
                      }}
                    >
                      Back to User Management
                    </Button>
                  </Alert>
                </CardBody>
              </Card>
            </Col>
          </Row>
        </Container>
      </>
    );
  }

  // Debug logging right before render
  console.log('Current year state value:', year);
  console.log('Current formRole:', formRole);
  console.log('Is loading:', isLoading);

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
                    <h3 className="mb-0">Edit User Information</h3>
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
                    {/* Remove Cover Photo Overlay */}
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
                    {/* Avatar Upload Button */}
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
                <Form onSubmit={handleUpdateUser}>
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
                          <Input 
                            type="select" 
                            className="form-control-alternative" 
                            id="role" 
                            value={formRole} 
                            onChange={e => setFormRole(e.target.value)} 
                            required
                          >
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
                              setEmailError(checkDuplicateEmail(e.target.value));
                            }}
                            required
                          />
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
                            onChange={e => setPassword(e.target.value)}
                            placeholder="Leave blank to keep current password"
                          />
                          <small className="text-muted">Leave blank to keep current password</small>
                        </FormGroup>
                      </Col>
                    </Row>
                    {/* Address and Contact Number for Admin - positioned below email/password */}
                    {formRole === 'admin' && (
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
                  {formRole === 'admin' && (
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
                  {formRole === 'teacher' && (
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
                  {formRole === 'student' && (
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
                                onChange={e => {
                                  setDepartment(e.target.value);
                                  setSection(""); // Clear section when course changes
                                }}
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
                              <Input 
                                type="select" 
                                className="form-control-alternative" 
                                id="year" 
                                value={year} 
                                onChange={e => {
                                  setYear(e.target.value);
                                  setSection(""); // Clear section when year changes
                                }}
                              >
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
                              <div className="d-flex">
                                <Input 
                                  type="select" 
                                  className="form-control-alternative" 
                                  id="section" 
                                  value={section} 
                                  onChange={e => setSection(e.target.value)}
                                  disabled={!year || !department || loadingSections}
                                  style={{ marginRight: '8px' }}
                                >
                                  <option value="">
                                    {loadingSections ? "Loading sections..." : 
                                     !year || !department ? "Select year and course first" : 
                                     availableSections.length === 0 ? "No sections found" :
                                     "Select Section"}
                                  </option>
                                  {availableSections.map((sectionOption) => (
                                    <option 
                                      key={sectionOption.id || sectionOption.section_id} 
                                      value={sectionOption.section_name || sectionOption.name}
                                    >
                                      {sectionOption.section_name || sectionOption.name}
                                    </option>
                                  ))}
                                </Input>
                                {year && department && (
                                  <Button
                                    color="light"
                                    size="sm"
                                    onClick={() => fetchSectionsByYearAndProgram(year, department)}
                                    disabled={loadingSections}
                                    style={{ 
                                      minWidth: '40px',
                                      backgroundColor: 'white',
                                      border: '1px solid #ccc',
                                      color: '#666'
                                    }}
                                  >
                                    <i className={`fas ${loadingSections ? 'fa-spinner fa-spin' : 'fa-sync-alt'}`}></i>
                                  </Button>
                                )}
                              </div>
                                                             {year && department && availableSections.length === 0 && !loadingSections && (
                                 <small className="text-muted">
                                   No sections available for {year} in {department}. Try clicking the refresh button.
                                 </small>
                               )}
                                                             {year && department && availableSections.length > 0 && (
                                 <small className="text-success">
                                   Found {availableSections.length} section(s) for {year} in {department}
                                 </small>
                               )}
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
                          {!qrData && (
                            <small className="text-warning d-block mt-1">
                              ⚠️ QR code not generated. Please ensure Student Number, Full Name, and Course are filled in.
                            </small>
                          )}
                        </FormGroup>
                      </div>
                    </>
                  )}
                  <div className="text-center">
                    <Button color="primary" type="submit" disabled={submitting}>
                      {submitting ? (
                        <>
                          <span className="spinner-border spinner-border-sm mr-2" role="status" aria-hidden="true"></span>
                          Updating...
                        </>
                      ) : (
                        'Update User'
                      )}
                    </Button>
                    <Button 
                      color="secondary" 
                      className="ml-2" 
                      onClick={() => {
                        const backTab = tab || 'admin';
                        const backView = view || 'table';
                        navigate(`/admin/user-management?tab=${backTab}&view=${backView}`);
                      }}
                    >
                      Cancel
                    </Button>
                  </div>
                </Form>
              </CardBody>
            </Card>
            
            {/* Loading Modal */}
            <Modal isOpen={showLoadingModal} centered backdrop="static" keyboard={false}>
              <ModalBody className="text-center py-4">
                <LottieLoader message="Updating User..." width={140} height={140} centered minHeight={'40vh'} desiredDurationSec={1.4} />
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
                <h5>User updated successfully!</h5>
              </ModalBody>
            </Modal>

            {/* Profile Image Crop Modal */}
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

            {/* Cover Photo Crop Modal */}
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

export default EditUser; 