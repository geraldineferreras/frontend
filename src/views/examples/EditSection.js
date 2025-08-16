import React, { useState, useEffect, useRef } from "react";
import {
  Button,
  Card,
  CardHeader,
  CardBody,
  Container,
  Row,
  Col,
  Form,
  FormGroup,
  Input,
  Alert,
  Modal,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Badge,
  Spinner,
} from "reactstrap";
import { useNavigate, useLocation } from "react-router-dom";
import Header from "components/Headers/Header.js";
import ApiService from "../../services/api.js";
import userDefault from "../../assets/img/theme/user-default.svg";
import { FaUser, FaTimes } from "react-icons/fa";

// Course options for dropdown
const courseOptions = [
  { value: "bsit", label: "BSIT" },
  { value: "bscs", label: "BSCS" },
  { value: "bsis", label: "BSIS" },
  { value: "act", label: "ACT" },
];

// Helper function to normalize course value
const normalizeCourse = (courseValue) => {
  if (!courseValue) return 'bsit';
  
  const normalized = courseValue.toLowerCase();
  if (normalized.includes('bsit')) return 'bsit';
  if (normalized.includes('bscs')) return 'bscs';
  if (normalized.includes('bsis')) return 'bsis';
  if (normalized.includes('act')) return 'act';
  
  return 'bsit'; // default
};

// Helper function to normalize year level
const normalizeYearLevel = (yearValue) => {
  if (!yearValue) return '1';
  
  const normalized = yearValue.toLowerCase();
  if (normalized.includes('1st') || normalized.includes('1')) return '1';
  if (normalized.includes('2nd') || normalized.includes('2')) return '2';
  if (normalized.includes('3rd') || normalized.includes('3')) return '3';
  if (normalized.includes('4th') || normalized.includes('4')) return '4';
  
  return '1'; // default
};

// Helper function to normalize semester
const normalizeSemester = (semesterValue) => {
  if (!semesterValue) return '1st Semester';
  
  const normalized = semesterValue.toLowerCase();
  if (normalized.includes('1st') || normalized.includes('1')) return '1st Semester';
  if (normalized.includes('2nd') || normalized.includes('2')) return '2nd Semester';
  if (normalized.includes('summer')) return 'Summer';
  
  return '1st Semester'; // default
};

// Helper function to format semester for API
const formatSemesterForAPI = (semesterValue) => {
  if (!semesterValue) return '1st';
  
  const normalized = semesterValue.toLowerCase();
  if (normalized.includes('1st') || normalized.includes('1')) return '1st';
  if (normalized.includes('2nd') || normalized.includes('2')) return '2nd';
  if (normalized.includes('summer')) return 'Summer';
  
  return '1st'; // default
};

// Helper function to get initials from a name
const getInitials = (fullName) => {
  if (!fullName) return 'U';
  const names = fullName.trim().split(' ');
  let initials = '';
  
  if (names.length >= 2) {
    // Take first letter of first name and first letter of last name
    initials = (names[0].charAt(0) + names[names.length - 1].charAt(0)).toUpperCase();
  } else if (names.length === 1) {
    // If only one name, take first two letters
    initials = names[0].substring(0, 2).toUpperCase();
  } else {
    initials = 'U';
  }
  
  return initials;
};

// Helper function to generate initials avatar URL
const getInitialsAvatar = (fullName) => {
  const initials = getInitials(fullName);
  
  // Generate a consistent color based on the name
  const colors = ['f093fb', 'f5576c', '4facfe', '00f2fe', '43e97b', '38f9d7', 'fa709a', 'fee140', 'a8edea', 'fed6e3'];
  const color = colors[fullName.length % colors.length];
  
  return `https://ui-avatars.com/api/?name=${encodeURIComponent(initials)}&background=${color}&color=fff&size=128&bold=true`;
};

// Helper function to get student avatar URL or initials
const getStudentAvatar = (student) => {
  if (!student) return getInitialsAvatar('User');
  
  // Check for profile picture in various formats
  if (student.profile_pic) {
    let imageUrl;
    
    // If it's a relative path, construct the full URL
    if (student.profile_pic.startsWith('uploads/')) {
      imageUrl = `http://localhost/scms_new_backup/${student.profile_pic}`;
    }
    // If it's already a full URL, use as is
    else if (student.profile_pic.startsWith('http://') || student.profile_pic.startsWith('https://')) {
      imageUrl = student.profile_pic;
    }
    // If it's a base64 data URL, return as is
    else if (student.profile_pic.startsWith('data:')) {
      return student.profile_pic;
    }
    // For other cases, try to construct the full URL
    else {
      imageUrl = `http://localhost/scms_new_backup/uploads/profile/${student.profile_pic}`;
    }
    
    return imageUrl;
  }
  
  // Fallback to initials avatar
  return getInitialsAvatar(student.full_name || student.name || 'User');
};

const EditSection = () => {
  const [course, setCourse] = useState("");
  const [sectionName, setSectionName] = useState("");
  const [yearLevel, setYearLevel] = useState("");
  const [academicYear, setAcademicYear] = useState("");
  const [semester, setSemester] = useState("");
  const [adviser, setAdviser] = useState("");
  const [selectedStudents, setSelectedStudents] = useState([]);
  const [originalStudents, setOriginalStudents] = useState([]); // Track original students
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [studentModal, setStudentModal] = useState(false);
  const [studentSearch, setStudentSearch] = useState("");
  const [isStudentSearchFocused, setIsStudentSearchFocused] = useState(false);
  const [teachers, setTeachers] = useState([]);
  const [isLoadingTeachers, setIsLoadingTeachers] = useState(true);
  const [students, setStudents] = useState([]);
  const [isLoadingStudents, setIsLoadingStudents] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();
  const location = useLocation();
  const adviserInputRef = useRef();

  // Get section data from navigation state
  const sectionData = location.state?.section;

  // Debug: Log the received section data
  useEffect(() => {
    console.log('Section data received:', sectionData);
    console.log('Location state:', location.state);
  }, [sectionData, location.state]);

  // Load enrolled students for the section
  const loadEnrolledStudents = async (sectionId) => {
    if (!sectionId) return;
    
    try {
      console.log('Loading enrolled students for section:', sectionId);
      const response = await ApiService.getSectionStudents(sectionId);
      console.log('Students API response:', response);
      
      // Handle different response formats
      let studentsData = [];
      if (Array.isArray(response)) {
        studentsData = response;
      } else if (response && Array.isArray(response.data)) {
        studentsData = response.data;
      } else if (response && response.data && typeof response.data === 'object') {
        // If response.data is an object, try to extract students from it
        studentsData = response.data.students || response.data.enrolled_students || [];
      } else {
        console.log('No students data found in response');
        return;
      }
      
      // Extract student IDs from the response
      const studentIds = studentsData.map(student => {
        if (typeof student === 'object') {
          return student.id || student.user_id || student.student_id || student.userId;
        }
        return student; // If it's already an ID
      }).filter(id => id); // Remove any null/undefined values
      
      console.log('Enrolled students loaded:', studentIds);
      setSelectedStudents(studentIds);
      setOriginalStudents(studentIds); // Track original students for comparison
    } catch (error) {
      console.error('Error loading enrolled students:', error);
      // If API fails, we'll use the students from section data
      console.log('Falling back to section data students');
    }
  };

  // Populate form with section data if available
  useEffect(() => {
    if (sectionData) {
      console.log('Loading section data for editing:', sectionData);
      
      // Extract course from section name or use course field
      const sectionCourse = normalizeCourse(sectionData.course || 
        (sectionData.name && sectionData.name.toLowerCase().includes('bsit') ? 'bsit' :
         sectionData.name && sectionData.name.toLowerCase().includes('bscs') ? 'bscs' :
         sectionData.name && sectionData.name.toLowerCase().includes('bsis') ? 'bsis' :
         sectionData.name && sectionData.name.toLowerCase().includes('act') ? 'act' : 'bsit'));
      
      // Extract year level - handle both formatted and original formats
      const sectionYear = normalizeYearLevel(sectionData.year || sectionData.originalYear || sectionData.yearFormatted || '1st Year');
      
      // Extract section name (just the letter part) from the full name
      let sectionLetter = '';
      if (sectionData.name) {
        console.log('Extracting section letter from name:', sectionData.name);
        // Try to extract the letter from the end of the name (e.g., "BSIT 1A" -> "A")
        const match = sectionData.name.match(/[A-Z]$/);
        if (match) {
          sectionLetter = match[0];
          console.log('Found section letter at end:', sectionLetter);
        } else {
          // If no letter at end, try to extract from the original name
          const originalMatch = sectionData.originalName?.match(/[A-Z]$/);
          if (originalMatch) {
            sectionLetter = originalMatch[0];
            console.log('Found section letter from original name:', sectionLetter);
          } else {
            console.log('No section letter found in name or original name');
          }
        }
      }
      
      // Extract academic year and semester
      const sectionAY = sectionData.ay || sectionData.academic_year || '2024-2025';
      const sectionSemester = normalizeSemester(sectionData.semester || '1st Semester');
      
      // Extract adviser
      const sectionAdviser = sectionData.adviserId || sectionData.adviser_id || '';
      
      // Extract enrolled students from section data
      const enrolledStudents = sectionData.enrolled_students || sectionData.students || [];
      const studentIds = enrolledStudents.map(student => 
        typeof student === 'object' ? student.id || student.user_id : student
      );
      
      console.log('Setting form values:', {
        course: sectionCourse,
        yearLevel: sectionYear,
        sectionName: sectionLetter,
        academicYear: sectionAY,
        semester: sectionSemester,
        adviser: sectionAdviser,
        enrolledStudents: studentIds
      });
      
      setCourse(sectionCourse);
      setYearLevel(sectionYear);
      setSectionName(sectionLetter);
      setAcademicYear(sectionAY);
      setSemester(sectionSemester);
      setAdviser(sectionAdviser);
      setSelectedStudents(studentIds);
      
      // Load enrolled students from API if we have a section ID
      if (sectionData.id) {
        loadEnrolledStudents(sectionData.id);
      }
    }
  }, [sectionData]);

  // Helper function to get ordinal suffix
  const getOrdinalSuffix = (num) => {
    const j = num % 10;
    const k = num % 100;
    if (j === 1 && k !== 11) {
      return num + "st";
    }
    if (j === 2 && k !== 12) {
      return num + "nd";
    }
    if (j === 3 && k !== 13) {
      return num + "rd";
    }
    return num + "th";
  };

  // Helper function to format year level with ordinal suffix
  const formatYearLevel = (year) => {
    if (!year) return "";
    const yearNum = year.replace(/[^0-9]/g, '');
    if (yearNum) {
      return getOrdinalSuffix(parseInt(yearNum));
    }
    return year;
  };

  // Auto-generate section name when course, year level, or section name changes
  useEffect(() => {
    if (course && yearLevel && sectionName) {
      const courseLabel = course.toUpperCase();
      const yearNum = yearLevel; // Already a number
      const sectionLetter = sectionName.trim().toUpperCase();
      const generatedName = `${courseLabel} ${yearNum}${sectionLetter}`;
      // Don't update sectionName here as it would create an infinite loop
    }
  }, [course, yearLevel]);

  // Handle section name input - extract just the letter and regenerate full name
  const handleSectionNameChange = (e) => {
    const input = e.target.value;
    
    // Just set the section letter (A, B, C, etc.)
    setSectionName(input.trim().toUpperCase());
  };

  // Fetch teachers for advisers
  useEffect(() => {
    const fetchTeachers = async () => {
      try {
        setIsLoadingTeachers(true);
        const response = await ApiService.getTeachers();
        
        // Handle different response structures
        const teachersData = response.data || response.data?.data || response || [];
        
        // Normalize teacher data
        const normalizedTeachers = teachersData.map(teacher => {
          return {
            ...teacher,
            id: teacher.id || teacher.user_id || teacher.userId || '',
            full_name: teacher.full_name || teacher.name || '',
            email: teacher.email || '',
            profile_pic: teacher.profile_pic || teacher.profileImageUrl || teacher.avatar || '',
          };
        });
        
        setTeachers(normalizedTeachers);
      } catch (error) {
        console.error('Failed to fetch teachers:', error);
      } finally {
        setIsLoadingTeachers(false);
      }
    };

    fetchTeachers();
  }, []);

  // Fetch students for selection
  useEffect(() => {
    const fetchStudents = async () => {
      try {
        setIsLoadingStudents(true);
        const response = await ApiService.getStudents();
        
        // Handle different response structures
        const studentsData = response.data || response.data?.data || response || [];
        
        // Normalize student data
        const normalizedStudents = studentsData.map(student => {
          return {
            ...student,
            id: student.id || student.user_id || student.userId || '',
            full_name: student.full_name || student.name || '',
            email: student.email || '',
            profile_pic: student.profile_pic || student.profileImageUrl || student.avatar || '',
            student_id: student.student_id || student.student_number || student.id || '',
          };
        });
        
        setStudents(normalizedStudents);
      } catch (error) {
        console.error('Failed to fetch students:', error);
      } finally {
        setIsLoadingStudents(false);
      }
    };

    fetchStudents();
  }, []);

  const handleStudentCheck = (id) => {
    setSelectedStudents(prev => 
      prev.includes(id) 
        ? prev.filter(sid => sid !== id)
        : [...prev, id]
    );
  };

  const removeStudent = (id) => setSelectedStudents(selectedStudents.filter(sid => sid !== id));

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!sectionData?.id) {
      setError('No section data found for editing. Please go back and try again.');
      return;
    }
    
    try {
      setIsSubmitting(true);
      setError(null);

      // Generate the full section name
      const courseLabel = course.toUpperCase();
      const yearNum = yearLevel; // Already a number
      const sectionLetter = sectionName.trim().toUpperCase();
      const fullSectionName = `${courseLabel} ${yearNum}${sectionLetter}`;

      // Prepare the updated section data in the format expected by the API
      const updatedSectionData = {
        section_name: fullSectionName,
        program: courseOptions.find(opt => opt.value === course)?.label || course.toUpperCase(),
        year_level: yearLevel, // Already a number (1, 2, 3, 4)
        semester: formatSemesterForAPI(semester),
        academic_year: academicYear,
        adviser_id: adviser,
        student_ids: selectedStudents
      };

      console.log('Updating section with data:', updatedSectionData);

      // Call the API to update the section
      await ApiService.updateSection(sectionData.id, updatedSectionData);

      // Update user section_id for students that were added or removed
      const addedStudents = selectedStudents.filter(id => !originalStudents.includes(id));
      const removedStudents = originalStudents.filter(id => !selectedStudents.includes(id));

      console.log('Students added:', addedStudents);
      console.log('Students removed:', removedStudents);

      // Update section_id for added students
      for (const studentId of addedStudents) {
        try {
          await ApiService.updateUserSectionId(studentId, sectionData.id);
          console.log(`Updated section_id for student ${studentId} to ${sectionData.id}`);
        } catch (error) {
          console.error(`Failed to update section_id for student ${studentId}:`, error);
        }
      }

      // Remove section_id for removed students (set to null or 0)
      for (const studentId of removedStudents) {
        try {
          await ApiService.updateUserSectionId(studentId, null);
          console.log(`Removed section_id for student ${studentId}`);
        } catch (error) {
          console.error(`Failed to remove section_id for student ${studentId}:`, error);
        }
      }

      // Show success message
      setShowSuccess(true);
      setTimeout(() => {
        navigate('/admin/section-management');
      }, 2000);
      
    } catch (error) {
      console.error('Error updating section:', error);
      setError('Failed to update section. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const AdviserOption = (props) => (
    <div className="d-flex align-items-center">
      <img
        src={getStudentAvatar(props.data)}
        alt="Profile"
        className="rounded-circle mr-2"
        style={{ width: '24px', height: '24px' }}
      />
      <div>
        <div className="font-weight-bold">{props.data.full_name}</div>
        <small className="text-muted">{props.data.email}</small>
      </div>
    </div>
  );

  const AdviserSingleValue = (props) => (
    <div className="d-flex align-items-center">
      <img
        src={getStudentAvatar(props.data)}
        alt="Profile"
        className="rounded-circle mr-2"
        style={{ width: '24px', height: '24px' }}
      />
      <div>
        <div className="font-weight-bold">{props.data.full_name}</div>
        <small className="text-muted">{props.data.email}</small>
      </div>
    </div>
  );

  const CustomDropdownIndicator = (props) => (
    <div {...props.innerProps}>
      <i className="fas fa-chevron-down" />
    </div>
  );



  return (
    <>
      <style>{`
        .section-content-container {
          margin-top: -150px;
          z-index: 2;
          position: relative;
        }
        .section-content-card {
          border-radius: 16px;
          box-shadow: 0 8px 32px 0 rgba(31, 38, 135, 0.10);
        }
        .transparent-header-section {
          background: transparent;
          border-radius: 16px;
          padding: 6rem 2rem 5rem 2rem;
          margin-bottom: 2rem;
          box-shadow: none;
        }
        .transparent-header-section h1 {
          color: #32325d;
          font-weight: 700;
          margin-bottom: 0.5rem;
        }
        .transparent-header-section p {
          color: #6c757d;
          margin-bottom: 0;
        }
        .section-preview {
          background: #f8f9fa;
          border: 1px solid #e3eaf3;
          border-radius: 8px;
          padding: 1rem;
          margin-top: 1rem;
          text-align: center;
        }
        .section-preview h6 {
          color: #525f7f;
          margin-bottom: 0.5rem;
        }
        .section-preview .section-name {
          font-size: 1.5rem;
          font-weight: 700;
          color: #5e72e4;
        }
        @media (max-width: 768px) {
          .transparent-header-section {
            padding: 1.25rem 1rem 1rem 1rem;
            text-align: center;
          }
          .transparent-header-section h1 {
            font-size: 1.5rem;
          }
        }
      `}</style>
      <Header showStats={false} />
      {/* Transparent Page Header */}
      <div className="transparent-header-section">
       
      </div>
      <Container className="section-content-container" fluid>
        <Row>
          <Col className="order-xl-1 mx-auto" xl="8" lg="8" md="10">
            <Card className="bg-secondary shadow border-0 section-content-card">
              <CardHeader className="bg-white border-0">
                <Row className="align-items-center">
                  <Col xs="8">
                    <h3 className="mb-0">Edit Section</h3>
                  </Col>
                </Row>
              </CardHeader>
              <CardBody>
                {!sectionData ? (
                  <Alert color="warning" className="text-center">
                    <h4>No Section Data Found</h4>
                    <p>No section data was provided for editing. Please go back to the section management page and try again.</p>
                    <Button color="primary" onClick={() => navigate('/admin/section-management')}>
                      Back to Section Management
                    </Button>
                  </Alert>
                ) : (
                  <>
                    {error && (
                      <Alert color="danger" className="mb-4">
                        {error}
                      </Alert>
                    )}
                    
                    {showSuccess && (
                      <Alert color="success" className="mb-4">
                        Section updated successfully! Redirecting...
                      </Alert>
                    )}

                    <Form onSubmit={handleSubmit}>
                      <h6 className="heading-small text-muted mb-4">Section Information</h6>
                      <div className="pl-lg-4">
                        <Row>
                          <Col lg="6">
                            <FormGroup>
                              <label className="form-control-label" htmlFor="course">Course</label>
                              <Input
                                type="select"
                                className="form-control-alternative"
                                id="course"
                                value={course}
                                onChange={e => setCourse(e.target.value)}
                                required
                              >
                                <option value="">Select Course</option>
                                {courseOptions.map(opt => (
                                  <option key={opt.value} value={opt.value}>{opt.label}</option>
                                ))}
                              </Input>
                            </FormGroup>
                          </Col>
                          <Col lg="6">
                            <FormGroup>
                              <label className="form-control-label" htmlFor="yearLevel">Year Level</label>
                              <Input
                                type="select"
                                className="form-control-alternative"
                                id="yearLevel"
                                value={yearLevel}
                                onChange={e => setYearLevel(e.target.value)}
                                required
                              >
                                <option value="">Select Year Level</option>
                                <option value="1">1</option>
                                <option value="2">2</option>
                                <option value="3">3</option>
                                <option value="4">4</option>
                              </Input>
                            </FormGroup>
                          </Col>
                        </Row>
                        <Row>
                          <Col lg="6">
                            <FormGroup>
                              <label className="form-control-label" htmlFor="sectionName">Section Letter</label>
                              <Input
                                className="form-control-alternative"
                                type="text"
                                id="sectionName"
                                value={sectionName}
                                onChange={handleSectionNameChange}
                                placeholder="e.g. A, B, C"
                                maxLength="1"
                                required
                              />
                              <small className="form-text text-muted">
                                Just enter the section letter (A, B, C, etc.)
                              </small>
                            </FormGroup>
                          </Col>
                          <Col lg="6">
                            <FormGroup>
                              <label className="form-control-label" htmlFor="academicYear">Academic Year</label>
                              <Input
                                className="form-control-alternative"
                                type="text"
                                id="academicYear"
                                value={academicYear}
                                onChange={e => setAcademicYear(e.target.value)}
                                placeholder="e.g. 2024-2025"
                                required
                              />
                            </FormGroup>
                          </Col>
                        </Row>
                        
                        {/* Section Name Preview */}
                        {sectionName && course && yearLevel && (
                          <div className="section-preview mb-3">
                            <h6 className="text-muted">Generated Section Name:</h6>
                            <div className="section-name p-2 bg-light rounded">
                              <strong>{course.toUpperCase()} {yearLevel}{sectionName}</strong>
                            </div>
                          </div>
                        )}
                        
                        <Row>
                          <Col lg="6">
                            <FormGroup>
                              <label className="form-control-label" htmlFor="semester">Semester</label>
                              <Input
                                type="select"
                                className="form-control-alternative"
                                id="semester"
                                value={semester}
                                onChange={e => setSemester(e.target.value)}
                                required
                              >
                                <option value="">Select Semester</option>
                                <option value="1st Semester">1st Semester</option>
                                <option value="2nd Semester">2nd Semester</option>
                                <option value="Summer">Summer</option>
                              </Input>
                            </FormGroup>
                          </Col>
                          <Col lg="6">
                            <FormGroup>
                              <label className="form-control-label" htmlFor="adviser">Adviser</label>
                              <Input
                                type="select"
                                className="form-control-alternative"
                                id="adviser"
                                value={adviser}
                                onChange={e => setAdviser(e.target.value)}
                                required
                              >
                                <option value="">Select Adviser...</option>
                                {teachers.map(teacher => (
                                  <option key={teacher.id} value={teacher.id}>
                                    {teacher.full_name} - {teacher.email}
                                  </option>
                                ))}
                              </Input>
                            </FormGroup>
                          </Col>
                        </Row>
                      </div>

                      <div className="pl-lg-4">
                        <div className="d-flex justify-content-between align-items-center mb-4">
                          <h6 className="heading-small text-muted mb-0">STUDENTS ({selectedStudents.length})</h6>
                          <Button
                            color="primary"
                            type="button"
                            onClick={() => setStudentModal(true)}
                            size="sm"
                          >
                            {selectedStudents.length > 0 ? 'Manage Students' : 'Add Students'}
                          </Button>
                        </div>
                        <div className="pl-lg-4">
                          {/* Show selected students as pills */}
                          <Row className="mb-3">
                            <Col>
                              <div style={{ minHeight: 70, display: 'flex', flexWrap: 'wrap', gap: 8, alignItems: selectedStudents.length === 0 ? 'center' : 'flex-start', justifyContent: 'center', background: '#f7f8fa', borderRadius: 8, padding: 8, border: '1px solid #e9ecef' }}>
                                {selectedStudents.length === 0 ? (
                                  <div style={{ width: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', color: '#b0b7c3', fontSize: 11, minHeight: 30 }}>
                                    <FaUser size={14} style={{ marginBottom: 2 }} />
                                    <div style={{ fontSize: 11, fontWeight: 500 }}>No students selected</div>
                                  </div>
                                ) : (
                                  selectedStudents.map(id => {
                                    const s = students.find(stu => stu.id === id);
                                    return s ? (
                                      <span key={id} className="student-pill" style={{ display: 'flex', alignItems: 'center', background: '#e0e3ea', borderRadius: 10, padding: '0 4px 0 1px', fontSize: 9, fontWeight: 500 }}>
                                        <img 
                                          src={getStudentAvatar(s)} 
                                          alt={s.full_name} 
                                          style={{ width: 13, height: 13, borderRadius: '50%', marginRight: 3, objectFit: 'cover', border: '1px solid #fff' }}
                                          onError={(e) => {
                                            // Fallback to initials avatar if image fails to load
                                            e.target.src = getInitialsAvatar(s.full_name || s.name || 'User');
                                          }}
                                        />
                                        <span style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start', lineHeight: 1.1 }}>
                                          <span style={{ fontWeight: 700, fontSize: 9 }}>{s.full_name}</span>
                                          <span style={{ color: '#888', fontWeight: 400, fontSize: 8 }}>{s.email}</span>
                                        </span>
                                        <FaTimes className="student-pill-x" style={{ marginLeft: 8, cursor: 'pointer', color: '#5e72e4', fontSize: 10 }} onClick={() => removeStudent(id)} />
                                      </span>
                                    ) : null;
                                  })
                                )}
                              </div>
                            </Col>
                          </Row>
                        </div>
                      </div>

                      {/* Student Selection Modal */}
                      <Modal isOpen={studentModal} toggle={() => setStudentModal(!studentModal)} size="md">
                        <ModalHeader toggle={() => setStudentModal(!studentModal)}>
                          Add Students to Section
                        </ModalHeader>
                        <ModalBody>
                          <div className="mb-3">
                            <div className="input-group">
                              <div className="input-group-prepend">
                                <span className="input-group-text">
                                  <i className="ni ni-zoom-split-in" />
                                </span>
                              </div>
                              <Input
                                placeholder="Search students..."
                                value={studentSearch}
                                onChange={(e) => setStudentSearch(e.target.value)}
                              />
                            </div>
                          </div>
                          
                          <div className="mb-3">
                            <div className="d-flex justify-content-between align-items-center">
                              <h6 className="mb-0">Students ({students.filter(student => 
                                student.full_name.toLowerCase().includes(studentSearch.toLowerCase()) ||
                                student.email.toLowerCase().includes(studentSearch.toLowerCase())
                              ).length})</h6>
                              <Button
                                color="link"
                                size="sm"
                                onClick={() => setSelectedStudents([])}
                              >
                                Unselect All
                              </Button>
                            </div>
                          </div>

                          <div className="student-list mb-4" style={{ maxHeight: '200px', overflowY: 'auto' }}>
                            {students
                              .filter(student => 
                                student.full_name.toLowerCase().includes(studentSearch.toLowerCase()) ||
                                student.email.toLowerCase().includes(studentSearch.toLowerCase())
                              )
                              .map(student => (
                                <div
                                  key={student.id}
                                  className="d-flex align-items-center p-2 border-bottom"
                                  style={{ cursor: 'pointer' }}
                                  onClick={() => handleStudentCheck(student.id)}
                                >
                                  <img
                                    src={getStudentAvatar(student)}
                                    alt="Profile"
                                    className="rounded-circle mr-3"
                                    style={{ width: '35px', height: '35px', objectFit: 'cover' }}
                                    onError={(e) => {
                                      // Fallback to initials avatar if image fails to load
                                      e.target.src = getInitialsAvatar(student.full_name || student.name || 'User');
                                    }}
                                  />
                                  <div className="flex-grow-1">
                                    <div className="font-weight-bold">{student.full_name}</div>
                                    <small className="text-muted">{student.email}</small>
                                  </div>
                                  {selectedStudents.includes(student.id) && (
                                    <i className="ni ni-check-bold text-primary" style={{ fontSize: '1.2rem' }} />
                                  )}
                                </div>
                              ))}
                          </div>

                          {/* Selected Students Display */}
                          <div className="border-top pt-3">
                            <h6 className="mb-3">Selected Students</h6>
                            <div style={{ minHeight: 60, display: 'flex', flexWrap: 'wrap', gap: 8, alignItems: selectedStudents.length === 0 ? 'center' : 'flex-start', justifyContent: 'center', background: '#f7f8fa', borderRadius: 8, padding: 8, border: '1px solid #e9ecef' }}>
                              {selectedStudents.length === 0 ? (
                                <div style={{ width: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', color: '#b0b7c3', fontSize: 11, minHeight: 30 }}>
                                  <FaUser size={14} style={{ marginBottom: 2 }} />
                                  <div style={{ fontSize: 11, fontWeight: 500 }}>No students selected</div>
                                </div>
                              ) : (
                                selectedStudents.map(id => {
                                  const s = students.find(stu => stu.id === id);
                                  return s ? (
                                    <span key={id} className="student-pill" style={{ display: 'flex', alignItems: 'center', background: '#e0e3ea', borderRadius: 10, padding: '0 4px 0 1px', fontSize: 9, fontWeight: 500 }}>
                                      <img 
                                        src={getStudentAvatar(s)} 
                                        alt={s.full_name} 
                                        style={{ width: 13, height: 13, borderRadius: '50%', marginRight: 3, objectFit: 'cover', border: '1px solid #fff' }}
                                        onError={(e) => {
                                          // Fallback to initials avatar if image fails to load
                                          e.target.src = getInitialsAvatar(s.full_name || s.name || 'User');
                                        }}
                                      />
                                      <span style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start', lineHeight: 1.1 }}>
                                        <span style={{ fontWeight: 700, fontSize: 9 }}>{s.full_name}</span>
                                        <span style={{ color: '#888', fontWeight: 400, fontSize: 8 }}>{s.email}</span>
                                      </span>
                                      <FaTimes className="student-pill-x" style={{ marginLeft: 8, cursor: 'pointer', color: '#5e72e4', fontSize: 10 }} onClick={() => removeStudent(id)} />
                                    </span>
                                  ) : null;
                                })
                              )}
                            </div>
                          </div>
                        </ModalBody>
                        <ModalFooter>
                          <Button color="secondary" onClick={() => setStudentModal(!studentModal)}>
                            Done
                          </Button>
                        </ModalFooter>
                      </Modal>

                      <div style={{ display: 'flex', justifyContent: 'center', gap: '12px', marginTop: 20 }}>
                        <Button color="primary" type="submit" disabled={isSubmitting}>
                          {isSubmitting ? "Updating..." : "Update Section"}
                        </Button>
                        <Button 
                          color="secondary" 
                          type="button" 
                          onClick={() => navigate('/admin/section-management')}
                          disabled={isSubmitting}
                        >
                          Cancel
                        </Button>
                      </div>
                      {showSuccess && (
                        <div className="alert alert-success mt-3 mb-0 text-center">
                          Section updated successfully!
                        </div>
                      )}
                    </Form>
                  </>
                )}
              </CardBody>
            </Card>
          </Col>
        </Row>
      </Container>
    </>
  );
};

export default EditSection;