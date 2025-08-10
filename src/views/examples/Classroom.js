import React, { useState, useEffect } from "react";
import {
  Card,
  CardBody,
  Button,
  Row,
  Col,
  Modal,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Form,
  FormGroup,
  Label,
  Input,
  Badge,
  Toast,
  ToastHeader,
  ToastBody,
  Spinner,
  Alert
} from "reactstrap";
import "./Classroom.css";
import { useNavigate, useLocation } from "react-router-dom";
import apiService from "../../services/api";
import { QRCodeSVG } from "qrcode.react";

function generateCode() {
  // Generate a more readable 6-character code
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let result = '';
  for (let i = 0; i < 6; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

// Enhanced initial classes with more realistic data
const initialClasses = [
  {
    id: 1,
    name: "Object Oriented Programming",
    section: "BSIT 3A",
    subject: "Object Oriented Programming",
    code: "B7P3R9",
    semester: "1st Semester",
    schoolYear: "2024-2025",
    studentCount: 35,
    theme: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)"
  },
  {
    id: 2,
    name: "Data Structures and Algorithms",
    section: "BSIT 2B", 
    subject: "Data Structures and Algorithms",
    code: "A1C2D3",
    semester: "1st Semester",
    schoolYear: "2024-2025",
    studentCount: 42,
    theme: "linear-gradient(135deg, #f093fb 0%, #f5576c 100%)"
  },
  {
    id: 3,
    name: "Database Management Systems",
    section: "BSIT 3C",
    subject: "Database Management Systems", 
    code: "X9Y8Z7",
    semester: "1st Semester",
    schoolYear: "2024-2025",
    studentCount: 28,
    theme: "linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)"
  }
];

const Classroom = () => {
  const [classes, setClasses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [modal, setModal] = useState(false);
  const [form, setForm] = useState({ 
    name: "", 
    section: "", 
    subject: "", 
    semester: "",
    schoolYear: ""
  });
  const [showToast, setShowToast] = useState(false);
  const [newlyCreatedClass, setNewlyCreatedClass] = useState(null);
  const navigate = useNavigate();
  const [refreshKey, setRefreshKey] = useState(0);

  // New state for assigned subjects and available sections
  const [assignedSubjects, setAssignedSubjects] = useState([]);
  const [availableSections, setAvailableSections] = useState([]);
  const [loadingSubjects, setLoadingSubjects] = useState(false);
  const [loadingSections, setLoadingSections] = useState(false);
  const [submittingForm, setSubmittingForm] = useState(false);
  const [successModal, setSuccessModal] = useState(false);
  const [createdClassData, setCreatedClassData] = useState(null);
  const [showCopyToast, setShowCopyToast] = useState(false);
  const location = useLocation();

  // Fetch classrooms from API
  useEffect(() => {
    const fetchClassrooms = async () => {
      try {
        setLoading(true);
        setError(null);
        const response = await apiService.getTeacherClassrooms();
        
        console.log('Teacher classrooms API response:', response);
        
        if (response.status && response.data) {
          // Transform API data to match component structure
          const transformedClasses = response.data.map((classroom, index) => ({
            id: index + 1,
            name: classroom.subject_name,
            section: classroom.section_name,
            subject: classroom.subject_name,
            code: classroom.class_code,
            semester: classroom.semester,
            schoolYear: classroom.school_year,
            studentCount: 0, // Will be updated with real count from enrolled students
            theme: getRandomTheme()
          }));
          
          setClasses(transformedClasses);
          
          // Fetch real student counts for each classroom
          const updatedClasses = await Promise.all(
            transformedClasses.map(async (cls) => {
              const realStudentCount = await fetchStudentCount(cls.code);
              return {
                ...cls,
                studentCount: realStudentCount
              };
            })
          );
          
          setClasses(updatedClasses);
          // Save to localStorage for ClassroomDetail.js to access
          localStorage.setItem("teacherClasses", JSON.stringify(updatedClasses));
        } else if (response.status && (!response.data || response.data.length === 0)) {
          // No classrooms found - this is not an error
          setClasses([]);
          localStorage.setItem("teacherClasses", JSON.stringify([]));
        } else {
          setError('Failed to load classrooms');
        }
      } catch (err) {
        console.error('Error fetching classrooms:', err);
        setError(err.message || 'Failed to load classrooms');
      } finally {
        setLoading(false);
      }
    };

    fetchClassrooms();
  }, []);

  // Open create modal if navigated with ?create=1
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    if (params.get('create') === '1') {
      handleModalOpen();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [location.search]);

  // Function to fetch real student count for a classroom
  const fetchStudentCount = async (classCode) => {
    try {
      const response = await apiService.makeRequest(`/teacher/classroom/${classCode}/students`, {
        method: 'GET',
        requireAuth: true,
      });
      
      if (response.status && response.data && response.data.students) {
        return response.data.students.length;
      }
      return 0;
    } catch (error) {
      console.error('Error fetching student count for classroom:', classCode, error);
      return 0;
    }
  };

  // Function to refresh classrooms data
  const refreshClassrooms = async () => {
    const fetchClassrooms = async () => {
      try {
        setLoading(true);
        setError(null);
        const response = await apiService.getTeacherClassrooms();
        
        console.log('Teacher classrooms API response:', response);
        
        if (response.status && response.data) {
          // Transform API data to match component structure
          const transformedClasses = response.data.map((classroom, index) => ({
            id: index + 1,
            name: classroom.subject_name,
            section: classroom.section_name,
            subject: classroom.subject_name,
            code: classroom.class_code,
            semester: classroom.semester,
            schoolYear: classroom.school_year,
            studentCount: 0, // Will be updated with real count from enrolled students
            theme: getRandomTheme()
          }));
          
          setClasses(transformedClasses);
          
          // Fetch real student counts for each classroom
          const updatedClasses = await Promise.all(
            transformedClasses.map(async (cls) => {
              const realStudentCount = await fetchStudentCount(cls.code);
              return {
                ...cls,
                studentCount: realStudentCount
              };
            })
          );
          
          setClasses(updatedClasses);
          // Save to localStorage for ClassroomDetail.js to access
          localStorage.setItem("teacherClasses", JSON.stringify(updatedClasses));
        } else if (response.status && (!response.data || response.data.length === 0)) {
          // No classrooms found - this is not an error
          setClasses([]);
        } else {
          setError('Failed to load classrooms');
        }
      } catch (err) {
        console.error('Error fetching classrooms:', err);
        setError(err.message || 'Failed to load classrooms');
      } finally {
        setLoading(false);
      }
    };

    fetchClassrooms();
  };

  // Force re-render on window focus to update themes
  useEffect(() => {
    const handleFocus = () => {
      setRefreshKey(prev => prev + 1);
    };
    window.addEventListener('focus', handleFocus);
    return () => window.removeEventListener('focus', handleFocus);
  }, []);

  const toggleModal = () => setModal(!modal);

  // Fetch assigned subjects when modal opens
  const handleModalOpen = async () => {
    setModal(true);
    setForm({ name: "", section: "", subject: "", semester: "", schoolYear: "" });
    setAvailableSections([]);
    await fetchAssignedSubjects();
  };

  // Fetch assigned subjects
  const fetchAssignedSubjects = async () => {
    try {
      setLoadingSubjects(true);
      console.log('Fetching assigned subjects...');
      
      const response = await apiService.getTeacherAssignedSubjects();
      
      console.log('Assigned subjects API response:', response);
      console.log('Response status:', response?.status);
      console.log('Response data:', response?.data);
      console.log('Response data.subjects:', response?.data?.subjects);
      
      if (response.status && response.data && response.data.subjects) {
        console.log('Setting assigned subjects:', response.data.subjects);
        setAssignedSubjects(response.data.subjects);
      } else {
        console.log('No subjects found or invalid response structure');
        console.log('Response structure:', {
          status: response?.status,
          hasData: !!response?.data,
          hasSubjects: !!response?.data?.subjects,
          subjectsLength: response?.data?.subjects?.length
        });
        setAssignedSubjects([]);
      }
    } catch (err) {
      console.error('Error fetching assigned subjects:', err);
      console.error('Error details:', {
        message: err.message,
        status: err.response?.status,
        data: err.response?.data
      });
      setAssignedSubjects([]);
    } finally {
      setLoadingSubjects(false);
    }
  };

  // Fetch available sections for selected subject
  const fetchAvailableSections = async (subjectId) => {
    if (!subjectId) {
      setAvailableSections([]);
      return;
    }

    try {
      setLoadingSections(true);
      console.log('Fetching sections for subject ID:', subjectId);
      
      const response = await apiService.getTeacherAvailableSections(subjectId);
      
      console.log('Available sections API response:', response);
      console.log('Response status:', response?.status);
      console.log('Response data:', response?.data);
      
      if (response.status && response.data) {
        console.log('Setting available sections:', response.data);
        setAvailableSections(response.data);
      } else {
        console.log('No sections found or invalid response structure');
        console.log('Response structure:', {
          status: response?.status,
          hasData: !!response?.data,
          dataType: typeof response?.data,
          dataLength: Array.isArray(response?.data) ? response?.data.length : 'not array'
        });
        setAvailableSections([]);
      }
    } catch (err) {
      console.error('Error fetching available sections:', err);
      console.error('Error details:', {
        message: err.message,
        status: err.response?.status,
        data: err.response?.data
      });
      setAvailableSections([]);
    } finally {
      setLoadingSections(false);
    }
  };

  // Handle subject change
  const handleSubjectChange = (e) => {
    const subjectId = e.target.value;
    setForm({ ...form, subject: subjectId, section: "" });
    setAvailableSections([]);
    
    if (subjectId) {
      // First try to get sections from the assigned subjects data
      const selectedSubject = assignedSubjects.find(subject => subject.id === subjectId);
      if (selectedSubject && selectedSubject.sections) {
        console.log('Using sections from assigned subjects data:', selectedSubject.sections);
        setAvailableSections(selectedSubject.sections);
      } else {
        // Fallback to API call
        console.log('No sections in assigned subjects, fetching from API...');
        fetchAvailableSections(subjectId);
      }
    }
  };

  const handleChange = e => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleAddClass = async e => {
    e.preventDefault();
    if (form.subject && form.section && form.semester && form.schoolYear) {
      setSubmittingForm(true);
      try {
        const response = await apiService.createClassroom({
          subject_id: parseInt(form.subject),
          section_id: parseInt(form.section),
          semester: form.semester,
          school_year: form.schoolYear,
          custom_title: form.name || undefined // Send as custom_title if provided
        });

        if (response.status && response.data) {
          const newClass = {
            id: classes.length + 1, // Simple ID generation
            name: form.name || assignedSubjects.find(s => s.id === form.subject)?.name,
            section: availableSections.find(s => s.id === form.section)?.name,
            subject: assignedSubjects.find(s => s.id === form.subject)?.name,
            code: response.data.class_code,
            semester: form.semester,
            schoolYear: form.schoolYear,
            studentCount: 0, // Will be updated by API
            theme: getRandomTheme()
          };
          setClasses(prev => {
            const updatedClasses = [...prev, newClass];
            // Save to localStorage for ClassroomDetail.js to access
            localStorage.setItem("teacherClasses", JSON.stringify(updatedClasses));
            return updatedClasses;
          });
          setNewlyCreatedClass(newClass);
          setCreatedClassData({
            classCode: response.data.class_code,
            className: form.name || assignedSubjects.find(s => s.id === form.subject)?.name,
            section: availableSections.find(s => s.id === form.section)?.name
          });
          setSuccessModal(true);
          setModal(false);
          setForm({ name: "", section: "", subject: "", semester: "", schoolYear: "" });
          setAvailableSections([]);
          await refreshClassrooms(); // Refresh to update student count
        } else {
          throw new Error('Failed to create classroom');
        }
      } catch (err) {
        console.error('Error creating classroom:', err);
        setError(err.message || 'Failed to create classroom');
      } finally {
        setSubmittingForm(false);
      }
    }
  };

  const handleCardClick = (code) => {
    navigate(`/teacher/classroom/${code}`);
  };

  const getRandomTheme = () => {
    const themes = [
      "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
      "linear-gradient(135deg, #f093fb 0%, #f5576c 100%)", 
      "linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)",
      "linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)",
      "linear-gradient(135deg, #fa709a 0%, #fee140 100%)",
      "linear-gradient(135deg, #a8edea 0%, #fed6e3 100%)",
      "linear-gradient(135deg, #ff9a9e 0%, #fecfef 100%)",
      "linear-gradient(135deg, #ffecd2 0%, #fcb69f 100%)"
    ];
    return themes[Math.floor(Math.random() * themes.length)];
  };

  return (
    <div>
      {/* <Header compact /> */}
      
      {/* Main Container */}
      <div className="container mt-4">
        
        {/* Header Section with Blue Gradient */}
        <div className="p-4 rounded mb-4 text-dark position-relative" 
             style={{
               background: `#f5f7fa url("data:image/svg+xml,%3Csvg width='600' height='200' viewBox='0 0 600 200' fill='none' xmlns='http://www.w3.org/2000/svg'%3E%3Crect x='120' y='30' width='300' height='70' rx='4' fill='%23343c43' stroke='%23444b5a' stroke-width='4'/%3E%3Crect x='180' y='110' width='60' height='20' rx='3' fill='%23586a75'/%3E%3Crect x='140' y='140' width='50' height='16' rx='3' fill='%23b0bec5'/%3E%3Crect x='250' y='140' width='50' height='16' rx='3' fill='%23b0bec5'/%3E%3Crect x='360' y='140' width='50' height='16' rx='3' fill='%23b0bec5'/%3E%3Crect x='150' y='150' width='30' height='8' rx='2' fill='%238ecae6'/%3E%3Crect x='260' y='150' width='30' height='8' rx='2' fill='%238ecae6'/%3E%3Crect x='370' y='150' width='30' height='8' rx='2' fill='%238ecae6'/%3E%3Crect x='200' y='120' width='10' height='20' rx='2' fill='%23b0bec5'/%3E%3Crect x='310' y='120' width='10' height='20' rx='2' fill='%23b0bec5'/%3E%3Crect x='420' y='120' width='10' height='20' rx='2' fill='%23b0bec5'/%3E%3Cellipse cx='175' cy='158' rx='10' ry='12' fill='%238ecae6'/%3E%3Crect x='170' y='155' width='10' height='10' rx='2' fill='%238ecae6'/%3E%3Crect x='380' y='145' width='15' height='5' rx='1' fill='%23444b5a'/%3E%3Crect x='390' y='145' width='10' height='5' rx='1' fill='%238ecae6'/%3E%3Crect x='390' y='135' width='10' height='5' rx='1' fill='%23b0bec5'/%3E%3Crect x='110' y='60' width='40' height='6' rx='2' fill='%23b0bec5'/%3E%3Crect x='450' y='60' width='40' height='6' rx='2' fill='%23b0bec5'/%3E%3Ccircle cx='100' cy='40' r='16' fill='%23fff' stroke='%23b0bec5' stroke-width='2'/%3E%3Cpath d='M100 40 L100 48' stroke='%23444b5a' stroke-width='2'/%3E%3Cpath d='M100 40 L108 40' stroke='%23444b5a' stroke-width='2'/%3E%3Crect x='80' y='80' width='30' height='6' rx='2' fill='%23b0bec5'/%3E%3Crect x='490' y='80' width='30' height='6' rx='2' fill='%23b0bec5'/%3E%3Crect x='500' y='100' width='40' height='30' rx='3' fill='%23ececec' stroke='%23b0bec5' stroke-width='2'/%3E%3Crect x='510' y='110' width='20' height='5' rx='1' fill='%238ecae6'/%3E%3Crect x='510' y='120' width='20' height='5' rx='1' fill='%23b0bec5'/%3E%3Cellipse cx='540' cy='170' rx='18' ry='10' fill='%238ecae6'/%3E%3Crect x='530' y='160' width='10' height='20' rx='3' fill='%23444b5a'/%3E%3Crect x='540' y='160' width='10' height='20' rx='3' fill='%234caf50'/%3E%3Crect x='550' y='160' width='10' height='20' rx='3' fill='%238ecae6'/%3E%3Cpath d='M140 50 L200 50' stroke='%23b0bec5' stroke-width='2'/%3E%3Cpath d='M200 50 L200 80' stroke='%23b0bec5' stroke-width='2'/%3E%3Crect x='320' y='110' width='60' height='20' rx='3' fill='%23586a75'/%3E%3Crect x='340' y='120' width='20' height='10' rx='2' fill='%23b0bec5'/%3E%3Crect x='350' y='130' width='10' height='5' rx='1' fill='%238ecae6'/%3E%3C!-- Left corner books --%3E%3Crect x='20' y='170' width='18' height='8' rx='2' fill='%23b0bec5'/%3E%3Crect x='40' y='172' width='14' height='6' rx='2' fill='%238ecae6'/%3E%3Crect x='58' y='168' width='10' height='10' rx='2' fill='%23f9dc5c'/%3E%3C!-- Left corner plant --%3E%3Cellipse cx='35' cy='192' rx='12' ry='5' fill='%238ecae6'/%3E%3Crect x='30' y='180' width='10' height='15' rx='2' fill='%234caf50'/%3E%3C/svg%3E") no-repeat right center / 540px auto`,
               borderRadius: "16px",
               boxShadow: "0 8px 32px rgba(173, 181, 189, 0.3)"
             }}>
          {/* Overlay for focus */}
          <div style={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            background: 'rgba(255,255,255,0.5)',
            borderRadius: '16px',
            zIndex: 1
          }} />
          <div style={{ position: 'relative', zIndex: 2 }}>
            <div className="d-flex justify-content-between align-items-center">
              <div>
                <h1 className="mb-2" style={{ fontWeight: 700, fontSize: "2.5rem", textShadow: "2px 2px 4px rgba(0,0,0,0.1)" }}>
                  My Classrooms
                </h1>
                <p className="mb-0" style={{ fontSize: "1.1rem", opacity: 0.9 }}>
                  Manage your classes, materials, students, and activities in one place.
                </p>
              </div>
              <div className="d-flex gap-2">
                <Button 
                  color="secondary" 
                  size="lg" 
                  onClick={refreshClassrooms}
                  disabled={loading}
                  style={{ 
                    borderRadius: "12px", 
                    fontWeight: 600, 
                    fontSize: "1rem",
                    padding: "12px 16px",
                    boxShadow: "0 4px 16px rgba(0,0,0,0.1)"
                  }}
                >
                  <i className="ni ni-refresh mr-2"></i>
                  Refresh
                </Button>
                <Button 
                  color="primary" 
                  size="lg" 
                  onClick={handleModalOpen}
                  disabled={loading}
                  style={{ 
                    borderRadius: "12px", 
                    fontWeight: 600, 
                    fontSize: "1rem",
                    padding: "12px 24px",
                    boxShadow: "0 4px 16px rgba(0,0,0,0.1)"
                  }}
                >
                  <i className="ni ni-fat-add mr-2"></i>
                  Create Class
                </Button>
              </div>
            </div>
          </div>
        </div>

        {/* Loading State */}
        {loading && (
          <div className="text-center py-5">
            <Spinner color="primary" size="lg" />
            <p className="mt-3 text-muted">Loading your classrooms...</p>
          </div>
        )}

        {/* Error State */}
        {error && !loading && (
          <Alert color="danger" className="mb-4">
            <h5 className="alert-heading">Error Loading Classrooms</h5>
            <p className="mb-0">{error}</p>
            <Button 
              color="primary" 
              size="sm" 
              className="mt-2"
              onClick={refreshClassrooms}
            >
              Try Again
            </Button>
          </Alert>
        )}

        {/* Class Cards Grid */}
        {!loading && !error && (
          <Row className="g-4" key={refreshKey}>
            {classes.map((cls, idx) => {
            // Get theme from localStorage if available
            let themeKey = `classroom_theme_${cls.code}`;
            let theme = localStorage.getItem(themeKey) || cls.theme;
            if (theme && theme.startsWith('data:image')) {
              theme = `url('${theme}')`;
            }
            // Debug logging
            if (!localStorage.getItem(themeKey)) {
              console.log(`No theme found for key: ${themeKey}, cls.code: ${cls.code}`);
              Object.keys(localStorage).filter(k => k.startsWith('classroom_theme_')).forEach(k => {
                console.log('Theme key in localStorage:', k, 'value:', localStorage.getItem(k));
              });
            }
            return (
              <Col lg="4" md="6" sm="12" key={cls.id} className="mb-4">
                <Card 
                  className={`shadow-sm h-100 ${newlyCreatedClass?.id === cls.id ? 'border-primary border-3' : ''}`}
                  style={{ 
                    borderRadius: "16px", 
                    cursor: "pointer", 
                    transition: "all 0.3s ease",
                    transform: newlyCreatedClass?.id === cls.id ? "scale(1.02)" : "scale(1)",
                    border: newlyCreatedClass?.id === cls.id ? "3px solid #007bff" : "1px solid #e9ecef",
                    background: `linear-gradient(rgba(255,255,255,0.85), rgba(255,255,255,0.85)), ${theme}`,
                  }}
                  onClick={() => handleCardClick(cls.code)}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.transform = "translateY(-4px)";
                    e.currentTarget.style.boxShadow = "0 12px 40px rgba(0,0,0,0.15)";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = newlyCreatedClass?.id === cls.id ? "scale(1.02)" : "scale(1)";
                    e.currentTarget.style.boxShadow = "0 4px 16px rgba(0,0,0,0.1)";
                  }}
                >
                <div 
                  className="card-img-top" 
                  style={{
                    height: "120px",
                    background: theme,
                    borderRadius: "16px 16px 0 0",
                    position: "relative",
                    overflow: "hidden",
                    backgroundSize: "cover",
                    backgroundPosition: "center",
                    backgroundRepeat: "no-repeat"
                  }}
                >
                  <div className="position-absolute w-100 h-100 d-flex align-items-center justify-content-center">
                    <i className="ni ni-books text-white" style={{ fontSize: "3rem", opacity: 0.8 }}></i>
                  </div>
                  <div className="position-absolute top-0 end-0 m-3">
                    <Badge color="light" className="text-dark">
                      {cls.studentCount || 0} students
                    </Badge>
                  </div>
                </div>
                
                <CardBody className="p-4" style={{ background: '#fff', borderRadius: '12px' }}>
                  <h5 className="card-title font-weight-bold mb-2" style={{ color: "#2d3748" }}>
                    {cls.name}
                  </h5>
                  <p className="text-muted mb-2" style={{ fontSize: "0.9rem" }}>
                    {cls.section}
                  </p>
                  <div className="mb-3">
                    <Badge color="primary" style={{ marginRight: 8 }}>
                      {cls.semester}
                    </Badge>
                    <Badge color="info">
                      {cls.schoolYear}
                    </Badge>
                  </div>
                  <div className="d-flex align-items-center justify-content-between">
                    <small className="text-muted">
                      Class Code: <strong>{cls.code}</strong>
                    </small>
                    <Button 
                      color="primary" 
                      size="sm" 
                      style={{ borderRadius: "8px" }}
                    >
                      View Class
                    </Button>
                  </div>
                </CardBody>
              </Card>
            </Col>
          );
        })}
        </Row>
        )}

        {/* Empty State */}
        {!loading && !error && classes.length === 0 && (
          <div className="text-center py-5">
            <i className="ni ni-books text-muted" style={{ fontSize: "4rem" }}></i>
            <h4 className="mt-3 text-muted">No classes yet</h4>
            <p className="text-muted">Create your first class to get started</p>
            <Button color="primary" size="lg" onClick={handleModalOpen}>
              <i className="ni ni-fat-add mr-2"></i>
              Create Your First Class
            </Button>
          </div>
        )}
      </div>

      {/* Create Class Modal */}
      <Modal isOpen={modal} toggle={toggleModal} size="lg" centered>
        <ModalHeader toggle={toggleModal} style={{ border: "none", paddingBottom: "0" }}>
          <h4 className="mb-0">Create New Class</h4>
        </ModalHeader>
        <Form onSubmit={handleAddClass}>
          <ModalBody>
            <Row>
              <Col md="6">
                <FormGroup>
                  <Label for="subject" className="font-weight-bold">Subject *</Label>
                  <Input
                    type="select"
                    name="subject"
                    id="subject"
                    value={form.subject}
                    onChange={handleSubjectChange}
                    required
                    disabled={loadingSubjects}
                    style={{ borderRadius: "8px" }}
                  >
                    <option value="">{loadingSubjects ? "Loading subjects..." : "Select subject"}</option>
                    {assignedSubjects.map(subject => (
                      <option key={subject.id} value={subject.id}>{subject.name}</option>
                    ))}
                  </Input>
                  <small className="text-muted">
                    Select the subject for this class
                  </small>
                </FormGroup>
              </Col>
              <Col md="6">
                <FormGroup>
                  <Label for="section" className="font-weight-bold">Section *</Label>
                  <Input
                    type="select"
                    name="section"
                    id="section"
                    value={form.section}
                    onChange={handleChange}
                    required
                    disabled={loadingSections || !form.subject}
                    style={{ borderRadius: "8px" }}
                  >
                    <option value="">{loadingSections ? "Loading sections..." : !form.subject ? "Select a subject first" : "Select section"}</option>
                    {availableSections.map(section => (
                      <option key={section.id} value={section.id}>{section.name}</option>
                    ))}
                  </Input>
                  <small className="text-muted">
                    Select the section (e.g., BSIT 3A, BSCS 2B)
                  </small>
                </FormGroup>
              </Col>
            </Row>
            <Row>
              <Col md="6">
                <FormGroup>
                  <Label for="semester" className="font-weight-bold">Semester *</Label>
                  <Input
                    type="select"
                    name="semester"
                    id="semester"
                    value={form.semester}
                    onChange={handleChange}
                    required
                    style={{ borderRadius: "8px" }}
                  >
                    <option value="">Select semester</option>
                    <option>1st Semester</option>
                    <option>2nd Semester</option>
                    <option>Summer</option>
                  </Input>
                  <small className="text-muted">
                    Select the semester
                  </small>
                </FormGroup>
              </Col>
              <Col md="6">
                <FormGroup>
                  <Label for="schoolYear" className="font-weight-bold">School Year *</Label>
                  <Input
                    type="select"
                    name="schoolYear"
                    id="schoolYear"
                    value={form.schoolYear}
                    onChange={handleChange}
                    required
                    style={{ borderRadius: "8px" }}
                  >
                    <option value="">Select school year</option>
                    <option>2023-2024</option>
                    <option>2024-2025</option>
                    <option>2025-2026</option>
                  </Input>
                  <small className="text-muted">
                    Select the school year
                  </small>
                </FormGroup>
              </Col>
            </Row>
            <FormGroup>
              <Label for="name" className="font-weight-bold">Custom Class Title (Optional)</Label>
              <Input
                name="name"
                id="name"
                value={form.name}
                onChange={handleChange}
                placeholder="Leave blank to use subject name"
                style={{ borderRadius: "8px" }}
              />
              <small className="text-muted">
                If left blank, the subject name will be used as the class title
              </small>
            </FormGroup>
          </ModalBody>
          <ModalFooter style={{ border: "none", paddingTop: "0" }}>
            <Button color="secondary" onClick={toggleModal} style={{ borderRadius: "8px" }}>
              Cancel
            </Button>
            <Button 
              color="primary" 
              type="submit" 
              style={{ borderRadius: "8px" }}
              disabled={!form.subject || !form.section || !form.semester || !form.schoolYear || submittingForm}
            >
              {submittingForm ? <Spinner size="sm" /> : "Create Class"}
            </Button>
          </ModalFooter>
        </Form>
      </Modal>

      {/* Success Modal with QR Code */}
      <Modal isOpen={successModal} toggle={() => setSuccessModal(false)} size="md" centered>
        <ModalHeader toggle={() => setSuccessModal(false)} style={{ border: "none", paddingBottom: "0" }}>
          <h4 className="mb-0 text-success">
            <i className="ni ni-check-bold mr-2"></i>
            Class Created Successfully!
          </h4>
        </ModalHeader>
        <ModalBody className="text-center">
          {createdClassData && (
            <>
              <div className="mb-4">
                <h5 className="text-dark mb-2">{createdClassData.className}</h5>
                <p className="text-muted mb-3">{createdClassData.section}</p>
                
                {/* QR Code */}
                <div className="mb-4 p-3 bg-light rounded" style={{ display: 'inline-block' }}>
                  <div className="qr-code-container">
                    {/* Generate QR code for the class code */}
                    <div 
                      className="qr-code"
                      style={{
                        width: '200px',
                        height: '200px',
                        background: '#fff',
                        border: '2px solid #e9ecef',
                        borderRadius: '8px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        margin: '0 auto',
                        padding: '10px'
                      }}
                    >
                      <QRCodeSVG 
                        value={`${window.location.origin}/student/join/${createdClassData.classCode}`}
                        size={180}
                        level="M"
                        includeMargin={true}
                      />
                    </div>
                    <div className="text-center mt-2">
                      <small className="text-muted">Scan to join class</small>
                    </div>
                  </div>
                </div>
                
                {/* Class Code Display */}
                <div className="mb-3">
                  <h6 className="text-dark mb-2">Class Code:</h6>
                  <div className="d-flex align-items-center justify-content-center">
                    <div className="p-3 bg-primary text-white rounded font-weight-bold mr-2" style={{ fontSize: '1.5rem', letterSpacing: '2px' }}>
                      {createdClassData.classCode}
                    </div>
                    <Button 
                      color="outline-primary" 
                      size="sm"
                      onClick={() => {
                        navigator.clipboard.writeText(createdClassData.classCode);
                        setShowCopyToast(true);
                        setTimeout(() => setShowCopyToast(false), 3000); // Hide toast after 3 seconds
                      }}
                      title="Copy class code"
                    >
                      <i className="ni ni-single-copy-04"></i>
                    </Button>
                  </div>
                </div>
                
                <div className="alert alert-info">
                  <i className="ni ni-bell-55 mr-2"></i>
                  Share this QR code or class code with your students so they can join the class.
                </div>
              </div>
            </>
          )}
        </ModalBody>
        <ModalFooter style={{ border: "none", paddingTop: "0" }}>
          <Button 
            color="primary" 
            onClick={() => setSuccessModal(false)}
            style={{ borderRadius: "8px" }}
          >
            Got it!
          </Button>
        </ModalFooter>
      </Modal>

      {/* Success Toast */}
      <div style={{ position: "fixed", top: "20px", right: "20px", zIndex: 9999 }}>
        <Toast isOpen={showToast} style={{ borderRadius: "12px" }}>
          <ToastHeader 
            icon="success" 
            toggle={() => setShowToast(false)}
            style={{ border: "none", background: "#d4edda", color: "#155724" }}
          >
            Success!
          </ToastHeader>
          <ToastBody style={{ background: "#d4edda", color: "#155724" }}>
            Classroom created successfully!
          </ToastBody>
        </Toast>
      </div>

      {/* Copy Toast */}
      <div style={{ position: "fixed", top: "20px", right: "20px", zIndex: 9999 }}>
        <Toast isOpen={showCopyToast} style={{ borderRadius: "12px" }}>
          <ToastHeader 
            icon="success" 
            toggle={() => setShowCopyToast(false)}
            style={{ border: "none", background: "#d4edda", color: "#155724" }}
          >
            Copied!
          </ToastHeader>
          <ToastBody style={{ background: "#d4edda", color: "#155724" }}>
            Class code copied to clipboard!
          </ToastBody>
        </Toast>
      </div>
    </div>
  );
};

export default Classroom;
