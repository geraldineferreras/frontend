import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import ApiService from '../../services/api';
import {
  Card,
  CardHeader,
  CardBody,
  FormGroup,
  Label,
  Input,
  Button,
  Row,
  Col,
  Alert,
  Nav,
  NavItem,
  NavLink,
  TabContent,
  TabPane,
  Badge,
  CustomInput
} from 'reactstrap';
import classnames from 'classnames';
import TwoFactorAuth from '../../components/TwoFactorAuth';
import Disable2FAModal from '../../components/Disable2FAModal';
import BackupCodesModal from '../../components/BackupCodesModal';
import ChangePasswordModal from '../../components/ChangePasswordModal';

const StudentSettings = () => {
  const { user, updateProfile } = useAuth();
  const [activeTab, setActiveTab] = useState('1');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });
  const [profileLoading, setProfileLoading] = useState(true);
  const [lastFetched, setLastFetched] = useState(null);
  
  // Helper function to map course names
  const mapCourseName = (shortName) => {
    const courseMapping = {
      'Info Tech': 'Bachelor of Science in Information Technology',
      'Computer Science': 'Bachelor of Science in Computer Science',
      'Info Systems': 'Bachelor of Science in Information Systems',
      'Computer Technology': 'Associate in Computer Technology'
    };
    return courseMapping[shortName] || shortName;
  };

  // Helper function to map full course name to short name
  const mapToShortName = (fullName) => {
    const courseMapping = {
      'Bachelor of Science in Information Technology': 'Info Tech',
      'Bachelor of Science in Computer Science': 'Computer Science',
      'Bachelor of Science in Information Systems': 'Info Systems',
      'Associate in Computer Technology': 'Computer Technology'
    };
    return courseMapping[fullName] || fullName;
  };



  // Add custom styles for modern dropdowns
  useEffect(() => {
    const style = document.createElement('style');
    style.textContent = `
      .modern-dropdown {
        appearance: none !important;
        -webkit-appearance: none !important;
        -moz-appearance: none !important;
        background-image: url("data:image/svg+xml;charset=UTF-8,%3csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='currentColor' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3e%3cpolyline points='6,9 12,15 18,9'%3e%3c/polyline%3e%3c/svg%3e");
        background-repeat: no-repeat;
        background-position: right 12px center;
        background-size: 16px;
        padding-right: 40px !important;
      }
      
      .modern-dropdown:hover {
        border-color: #007bff !important;
        box-shadow: 0 2px 6px rgba(0,0,0,0.15) !important;
      }
      
      .modern-dropdown:disabled {
        background-color: #f8f9fa !important;
        color: #6c757d !important;
        cursor: not-allowed !important;
        opacity: 0.6;
      }
      
      .modern-dropdown option {
        padding: 8px 12px;
        font-size: 14px;
      }
      
      .modern-dropdown option:hover {
        background-color: #f8f9fa;
      }
    `;
    document.head.appendChild(style);
    
    return () => {
      document.head.removeChild(style);
    };
  }, []);
  
  // 2FA Modal states
  const [show2FAModal, setShow2FAModal] = useState(false);
  const [showDisable2FAModal, setShowDisable2FAModal] = useState(false);
  const [showBackupCodesModal, setShowBackupCodesModal] = useState(false);
  const [backupCodesCount, setBackupCodesCount] = useState(8);
  const [showChangePasswordModal, setShowChangePasswordModal] = useState(false);
  
  // Profile settings
  const [profileData, setProfileData] = useState({
    full_name: '',
    email: '',
    phone: '',
    student_number: '',
    course: '',
    year_level: '',
    section: '',
    address: '',
    qr_code: ''
  });

  // Academic settings
  const [academicSettings, setAcademicSettings] = useState({
    showGrades: true,
    allowNotifications: true,
    attendanceReminders: true,
    assignmentDeadlineAlerts: true,
    gradeNotifications: true
  });

  // Security settings
  const [securitySettings, setSecuritySettings] = useState({
    twoFAEnabled: false,
    sessionTimeout: 30,
    loginNotifications: true
  });

  // Privacy settings
  const [privacySettings, setPrivacySettings] = useState({
    profileVisibility: 'classmates',
    showOnlineStatus: true,
    allowDirectMessages: true,
    shareProgress: false
  });

  // New state for available options
  const [availableCourses, setAvailableCourses] = useState([]);
  const [availableYearLevels, setAvailableYearLevels] = useState([]);
  const [availableSections, setAvailableSections] = useState([]);
  const [loadingCourses, setLoadingCourses] = useState(false);
  const [loadingYearLevels, setLoadingYearLevels] = useState(false);
  const [loadingSections, setLoadingSections] = useState(false);

  // Load 2FA status and backup codes count on component mount
  useEffect(() => {
    const load2FAStatus = async () => {
      try {
        const response = await ApiService.get2FAStatus();
        if (response.success) {
          setSecuritySettings(prev => ({
            ...prev,
            twoFAEnabled: response.data.is_enabled || false
          }));
        }
      } catch (error) {
        console.error('Failed to load 2FA status:', error);
      }
    };

    const loadBackupCodesCount = async () => {
      try {
        const response = await ApiService.getBackupCodes();
        if (response.success) {
          const count = response.data.count || response.data.remaining_codes || 8;
          setBackupCodesCount(count);
        }
      } catch (error) {
        console.error('Failed to load backup codes count:', error);
        setBackupCodesCount(8);
      }
    };
    
    // Load available options first, then fetch user profile
    const initializeData = async () => {
      await loadAvailableCourses();
      await fetchUserProfile();
    };
    
    initializeData();
    load2FAStatus();
    loadBackupCodesCount();
  }, [user]);

  // Load available courses
  const loadAvailableCourses = async () => {
    try {
      setLoadingCourses(true);
      const response = await ApiService.getCourses();
      if (response.success && response.data) {
        setAvailableCourses(response.data);
        return response.data;
      }
    } catch (error) {
      console.error('Failed to load courses:', error);
      // Fallback to static courses
      const fallbackCourses = [
        { id: "bsit", abbr: "BSIT", name: "Info Tech" },
        { id: "bscs", abbr: "BSCS", name: "Computer Science" },
        { id: "bsis", abbr: "BSIS", name: "Info Systems" },
        { id: "act", abbr: "ACT", name: "Computer Technology" }
      ];
      setAvailableCourses(fallbackCourses);
      return fallbackCourses;
    } finally {
      setLoadingCourses(false);
    }
  };

  // Load available year levels for selected course
  const loadAvailableYearLevels = async (course) => {
    if (!course) {
      setAvailableYearLevels([]);
      return [];
    }

    try {
      setLoadingYearLevels(true);
      // For now, we'll use static year levels based on course
      let years = [];
      if (course.includes('Associate') || course.includes('ACT')) {
        years = ['1st Year', '2nd Year'];
      } else {
        years = ['1st Year', '2nd Year', '3rd Year', '4th Year'];
      }
      setAvailableYearLevels(years);
      return years;
    } catch (error) {
      console.error('Failed to load year levels:', error);
      // Fallback to static year levels
      const fallbackYears = ['1st Year', '2nd Year', '3rd Year', '4th Year'];
      setAvailableYearLevels(fallbackYears);
      return fallbackYears;
    } finally {
      setLoadingYearLevels(false);
    }
  };

  // Load available sections for selected course and year level
  const loadAvailableSections = async (course, yearLevel) => {
    if (!course || !yearLevel) {
      setAvailableSections([]);
      return [];
    }

    try {
      setLoadingSections(true);
      
      // Extract program abbreviation and year number from the course and year level
      let programAbbr = '';
      let yearNumber = '';
      
      // Map course names to program abbreviations
      if (course.includes('BSIT') || course.includes('Info Tech') || course.includes('Bachelor of Science in Information Technology')) {
        programAbbr = 'BSIT';
      } else if (course.includes('BSCS') || course.includes('Computer Science') || course.includes('Bachelor of Science in Computer Science')) {
        programAbbr = 'BSCS';
      } else if (course.includes('BSIS') || course.includes('Info Systems') || course.includes('Bachelor of Science in Information Systems')) {
        programAbbr = 'BSIS';
      } else if (course.includes('ACT') || course.includes('Computer Technology') || course.includes('Associate in Computer Technology')) {
        programAbbr = 'ACT';
      }
      
      // Extract year number from year level (e.g., "4th Year" -> "4")
      if (yearLevel) {
        // Handle different year formats
        if (yearLevel.includes('1st')) {
          yearNumber = '1';
        } else if (yearLevel.includes('2nd')) {
          yearNumber = '2';
        } else if (yearLevel.includes('3rd')) {
          yearNumber = '3';
        } else if (yearLevel.includes('4th')) {
          yearNumber = '4';
        } else if (yearLevel.includes('5th')) {
          yearNumber = '5';
        } else {
          // Fallback: extract any number
          yearNumber = yearLevel.replace(/\D/g, '');
        }
      }
      

      
      if (programAbbr && yearNumber) {
        // Use the new endpoint to get sections
        const endpoint = `/student/programs/${programAbbr}/years/${yearNumber}/sections`;

        
        try {
          const response = await ApiService.get(endpoint);
          
          if (response && response.status && response.data) {

            
            // Ensure we're setting the sections in state
            setAvailableSections(response.data);
            
            return response.data;
          } else {

            throw new Error('No sections data in response');
          }
        } catch (newEndpointError) {

          
          // Fallback to old method
          try {
            const response = await ApiService.getSectionsByProgramAndYear(course, yearLevel);
            if (response.success && response.data) {
              setAvailableSections(response.data);
              return response.data;
            } else {
              // Fallback: try to get sections by program only
              const programResponse = await ApiService.getSectionsByProgram(course);
              if (programResponse.success && programResponse.data) {
                // Filter sections by year level if available
                const sections = programResponse.data.filter(section => {
                  // If section has year_level field, filter by it
                  if (section.year_level) {
                    return section.year_level.toString() === yearLevel.toString() || 
                           section.year_level.toString() === yearLevel.replace(/\D/g, '');
                  }
                  // Otherwise, include all sections for the new endpoint
                  return true;
                });
                setAvailableSections(sections);
                return sections;
              } else {
                setAvailableSections([]);
                return [];
              }
            }
          } catch (fallbackError) {

            setAvailableSections([]);
            return [];
          }
        }
      } else {

        setAvailableSections([]);
        return [];
      }
    } catch (error) {

      setAvailableSections([]);
      return [];
    } finally {
      setLoadingSections(false);
    }
  };

  // Handle course change
  const handleCourseChange = (course) => {
    setProfileData(prev => ({ ...prev, course, year_level: '', section: '' }));
    
    // Map the shorter course name back to full name for API calls
    const fullCourseName = mapCourseName(course);
    loadAvailableYearLevels(fullCourseName);
    setAvailableSections([]);
    

  };

  // Handle year level change
  const handleYearLevelChange = (yearLevel) => {
    setProfileData(prev => ({ ...prev, year_level: yearLevel, section: '' }));
    
    // Map the shorter course name back to full name for API calls
    const fullCourseName = mapCourseName(profileData.course);

    loadAvailableSections(fullCourseName, yearLevel);
  };



  // Function to fetch user profile data from backend
  const fetchUserProfile = async () => {
    if (!user) return;
    
    try {
      setProfileLoading(true);
      
      const response = await ApiService.getStudentProfile();
      
      if (response && response.status && response.data) {
        const userData = response.data;

        
        // Update profile data with fetched information from the new endpoint
        const newProfileData = {
          full_name: userData.full_name || '',
          email: userData.email || '',
          phone: userData.contact_num || '',
          student_number: userData.student_num || '',
          course: userData.program || '',
          year_level: userData.year_level ? `${userData.year_level}${userData.year_level === '1' ? 'st' : userData.year_level === '2' ? 'nd' : userData.year_level === '3' ? 'rd' : 'th'} Year` : '',
          section: userData.section_name || '',
          address: userData.address || '',
          qr_code: userData.qr_code || ''
        };
        
        // Map the full course name to the shorter display name for the dropdown
        if (userData.program && userData.program.trim() !== '') {
          const mappedCourseName = mapToShortName(userData.program);
          
          // Find the matching course in available courses or add it
          const existingCourse = availableCourses.find(c => c.name === mappedCourseName);
          
          if (!existingCourse) {
            // Add the mapped course to available courses
            const newCourse = { 
              id: 'fetched', 
              name: mappedCourseName, 
              abbr: userData.program.includes('BSIT') ? 'BSIT' : 
                    userData.program.includes('BSCS') ? 'BSCS' : 
                    userData.program.includes('BSIS') ? 'BSIS' : 
                    userData.program.includes('ACT') ? 'ACT' : 'OTHER'
            };
            setAvailableCourses(prev => [...prev, newCourse]);
          }
          
          // Update the course value to use the shorter name
          newProfileData.course = mappedCourseName;
        } else {
          // If program is empty, try to get it from the user's email domain or other sources
          // For now, set a default course and let user select
          newProfileData.course = '';
        }
        
        // Clean up any undefined values
        Object.keys(newProfileData).forEach(key => {
          if (newProfileData[key] === undefined) {
            newProfileData[key] = '';
          }
        });
        
        // Populate available options arrays with the fetched data
        // This ensures the dropdowns can display the correct selected values
        if (userData.program) {
          // Add the fetched course to available courses if not already present
          const courseExists = availableCourses.find(c => c.name === userData.program);
          if (!courseExists) {
            const newCourse = { id: 'fetched', name: userData.program, abbr: userData.program.split(' ').map(word => word[0]).join('') };

            setAvailableCourses(prev => [...prev, newCourse]);
          }
        }
        
        if (userData.year_level) {
          // Add the fetched year level to available year levels if not already present
          const yearExists = availableYearLevels.find(y => y === userData.year_level);
          if (!yearExists) {

            setAvailableYearLevels(prev => [...prev, userData.year_level]);
          }
        }
        
        if (userData.section_name) {
          // Add the fetched section to available sections if not already present
          const sectionExists = availableSections.find(s => s.name === userData.section_name || s.section_name === userData.section_name);
          if (!sectionExists) {
            const newSection = { id: 'fetched', name: userData.section_name, section_name: userData.section_name };

            setAvailableSections(prev => [...prev, newSection]);
          }
        }
        
        setProfileData(newProfileData);
        setLastFetched(new Date());
        
        // After setting profile data, load the corresponding year levels and sections
        if (newProfileData.course) {
          // Map the shorter course name back to full name for API calls
          const fullCourseName = mapCourseName(newProfileData.course);
          loadAvailableYearLevels(fullCourseName);
        }
        if (newProfileData.course && newProfileData.year_level) {
          // Map the shorter course name back to full name for API calls
          const fullCourseName = mapCourseName(newProfileData.course);
          loadAvailableSections(fullCourseName, newProfileData.year_level);
        }
        
        // If course or year level is missing, still try to load available options
        if (!newProfileData.course) {
          // Load available courses so user can select
          loadAvailableCourses();
        }
        if (!newProfileData.year_level) {
          // Load available year levels so user can select
          loadAvailableYearLevels();
        }
      } else {

        // Fallback to auth context user data
        if (user) {
          const fallbackData = {
            full_name: user.full_name || user.name || user.first_name + ' ' + user.last_name || user.student_name || '',
            email: user.email || user.email_address || user.student_email || '',
            phone: user.contact_num || user.phone || user.contactNumber || user.mobile || user.student_phone || user.phone_number || '',
            student_number: user.student_num || user.student_number || user.studentNumber || user.student_id || user.id_number || user.student_id_number || user.enrollment_number || user.registration_number || user.student_code || '',
            course: user.program || user.course || user.major || user.degree || user.study_program || user.academic_program || user.study_major || user.student_course || '',
            year_level: (user.year_level || user.yearLevel || user.year || user.academic_year || user.level || user.study_year || user.current_year || user.student_year || user.academic_level) ? 
              `${user.year_level || user.yearLevel || user.year || user.academic_year || user.level || user.study_year || user.current_year || user.student_year || user.academic_level}${(user.year_level || user.yearLevel || user.year || user.academic_year || user.level || user.study_year || user.current_year || user.student_year || user.academic_level) === '1' ? 'st' : (user.year_level || user.yearLevel || user.year || user.academic_year || user.level || user.study_year || user.current_year || user.student_year || user.academic_level) === '2' ? 'nd' : (user.year_level || user.yearLevel || user.year || user.academic_year || user.level || user.study_year || user.current_year || user.student_year || user.academic_level) === '3' ? 'rd' : 'th'} Year` : '',
            section: user.section_name || user.section || user.section_name || user.class_section || user.group || user.class_group || user.student_section || user.class_name || user.study_group || '',
            address: user.address || user.full_address || user.street_address || user.student_address || user.permanent_address || '',
            qr_code: ''
          };
          
          // Clean up any undefined values
          Object.keys(fallbackData).forEach(key => {
            if (fallbackData[key] === undefined) {
              fallbackData[key] = '';
            }
          });
          
          console.log('🔍 Using fallback profile data:', fallbackData);
          
          // Also populate available options for fallback data
          if (fallbackData.course) {
            const mappedCourseName = mapToShortName(fallbackData.course);
            const courseExists = availableCourses.find(c => c.name === mappedCourseName);
            if (!courseExists) {
              setAvailableCourses(prev => [
                ...prev,
                { 
                  id: 'fallback', 
                  name: mappedCourseName, 
                  abbr: fallbackData.course.includes('BSIT') ? 'BSIT' : 
                        fallbackData.course.includes('BSCS') ? 'BSCS' : 
                        fallbackData.course.includes('BSIS') ? 'BSIS' : 
                        fallbackData.course.includes('ACT') ? 'ACT' : 'OTHER'
                }
              ]);
            }
            
            // Update the fallback data to use the shorter name
            fallbackData.course = mappedCourseName;
          }
          
          if (fallbackData.year_level) {
            const yearExists = availableYearLevels.find(y => y === fallbackData.year_level);
            if (!yearExists) {
              setAvailableYearLevels(prev => [...prev, fallbackData.year_level]);
            }
          }
          
          if (fallbackData.section) {
            const sectionExists = availableSections.find(s => s.name === fallbackData.section || s.section_name === fallbackData.section);
            if (!sectionExists) {
              setAvailableSections(prev => [
                ...prev,
                { id: 'fallback', name: fallbackData.section, section_name: fallbackData.section }
              ]);
            }
          }
          
          setProfileData(fallbackData);
          
          // After setting fallback profile data, load the corresponding year levels and sections
          if (fallbackData.course) {
            // Map the shorter course name back to full name for API calls
            const fullCourseName = mapCourseName(fallbackData.course);
            loadAvailableYearLevels(fullCourseName);
          }
          if (fallbackData.course && fallbackData.year_level) {
            // Map the shorter course name back to full name for API calls
            const fullCourseName = mapCourseName(fallbackData.course);
            loadAvailableSections(fullCourseName, fallbackData.year_level);
          }
        }
      }
    } catch (error) {
      console.error('❌ Error fetching student profile:', error);
      // Fallback to auth context user data
      if (user) {
        const fallbackData = {
          full_name: user.full_name || user.name || user.first_name + ' ' + user.last_name || user.student_name || '',
          email: user.email || user.email_address || user.student_email || '',
          phone: user.contact_num || user.phone || user.contactNumber || user.mobile || user.student_phone || user.phone_number || '',
          student_number: user.student_num || user.student_number || user.studentNumber || user.student_id || user.id_number || user.student_id_number || user.enrollment_number || user.registration_number || user.student_code || '',
          course: user.program || user.course || user.major || user.degree || user.study_program || user.academic_program || user.study_major || user.student_course || '',
          year_level: (user.year_level || user.yearLevel || user.year || user.academic_year || user.level || user.study_year || user.current_year || user.student_year || user.academic_level) ? 
            `${user.year_level || user.yearLevel || user.year || user.academic_year || user.level || user.study_year || user.current_year || user.student_year || user.academic_level}${(user.year_level || user.yearLevel || user.year || user.academic_year || user.level || user.study_year || user.current_year || user.student_year || user.academic_level) === '1' ? 'st' : (user.year_level || user.yearLevel || user.year || user.academic_year || user.level || user.study_year || user.current_year || user.student_year || user.academic_level) === '2' ? 'nd' : (user.year_level || user.yearLevel || user.year || user.academic_year || user.level || user.study_year || user.current_year || user.student_year || user.academic_level) === '3' ? 'rd' : 'th'} Year` : '',
          section: user.section_name || user.section || user.section_name || user.class_section || user.group || user.class_group || user.student_section || user.class_name || user.study_group || '',
          address: user.address || user.full_address || user.street_address || user.student_address || user.permanent_address || '',
          qr_code: ''
        };
        
        // Clean up any undefined values
        Object.keys(fallbackData).forEach(key => {
          if (fallbackData[key] === undefined) {
            fallbackData[key] = '';
          }
        });
        
        console.log('🔍 Using error fallback profile data:', fallbackData);
        
        // Also populate available options for error fallback data
        if (fallbackData.course) {
          const mappedCourseName = mapToShortName(fallbackData.course);
          const courseExists = availableCourses.find(c => c.name === mappedCourseName);
          if (!courseExists) {
            setAvailableCourses(prev => [
              ...prev,
              { 
                id: 'error-fallback', 
                name: mappedCourseName, 
                abbr: fallbackData.course.includes('BSIT') ? 'BSIT' : 
                      fallbackData.course.includes('BSCS') ? 'BSCS' : 
                      fallbackData.course.includes('BSIS') ? 'BSIS' : 
                      fallbackData.course.includes('ACT') ? 'ACT' : 'OTHER'
              }
            ]);
          }
          
          // Update the error fallback data to use the shorter name
          fallbackData.course = mappedCourseName;
        }
        
        if (fallbackData.year_level) {
          const yearExists = availableYearLevels.find(y => y === fallbackData.year_level);
          if (!yearExists) {
            setAvailableYearLevels(prev => [...prev, fallbackData.year_level]);
          }
        }
        
        if (fallbackData.section) {
          const sectionExists = availableSections.find(s => s.name === fallbackData.section || s.section_name === fallbackData.section);
          if (!sectionExists) {
            setAvailableSections(prev => [
              ...prev,
              { id: 'error-fallback', name: fallbackData.section, section_name: fallbackData.section }
            ]);
          }
        }
        
        setProfileData(fallbackData);
        
        // After setting error fallback profile data, load the corresponding year levels and sections
        if (fallbackData.course) {
          // Map the shorter course name back to full name for API calls
          const fullCourseName = mapCourseName(fallbackData.course);
          loadAvailableYearLevels(fullCourseName);
        }
        if (fallbackData.course && fallbackData.year_level) {
          // Map the shorter course name back to full name for API calls
          const fullCourseName = mapCourseName(fallbackData.course);
          loadAvailableSections(fullCourseName, fallbackData.year_level);
        }
      }
    } finally {
      setProfileLoading(false);
    }
  };

  const handle2FAToggle = (enabled) => {
    if (enabled) {
      setShow2FAModal(true);
    } else {
      setShowDisable2FAModal(true);
    }
  };

  const handle2FASuccess = () => {
    setSecuritySettings(prev => ({
      ...prev,
      twoFAEnabled: true
    }));
    setMessage({ type: 'success', text: 'Two-Factor Authentication enabled successfully!' });
  };

  const handle2FADisableSuccess = () => {
    setSecuritySettings(prev => ({
      ...prev,
      twoFAEnabled: false
    }));
    setMessage({ type: 'success', text: 'Two-Factor Authentication disabled successfully!' });
  };

  const toggleTab = (tab) => {
    if (activeTab !== tab) setActiveTab(tab);
  };

  const handleProfileUpdate = async () => {
    setLoading(true);
    setMessage({ type: '', text: '' });
    
    try {
      // Validate required user data
      if (!user.role) {
        throw new Error('User role is required but not available');
      }
      
      const userId = user.id || user.user_id || user.userId;
      if (!userId) {
        throw new Error('User ID is required but not available');
      }

      // Validate required profile fields
      if (!profileData.full_name || !profileData.email) {
        throw new Error('Full name and email are required fields');
      }

      console.log('Updating student profile with data:', profileData);

      // Validate that course, year, and section are selected
      if (!profileData.course || !profileData.year_level || !profileData.section) {
        throw new Error('Please select Course, Year, and Section before updating profile');
      }

      // Find the section ID for the selected section
      const selectedSection = availableSections.find(section => 
        section.section_name === profileData.section || section.name === profileData.section
      );
      
      if (!selectedSection) {
        throw new Error('Please select a valid section');
      }

      // Map the short course name back to full program name for the API
      const fullProgramName = mapCourseName(profileData.course);
      
      // Extract year number from year level (e.g., "4th Year" -> "4")
      const yearNumber = profileData.year_level ? profileData.year_level.replace(/\D/g, '') : '';
      
      if (!yearNumber) {
        throw new Error('Please select a valid year level');
      }

      // Prepare data for the new student profile update endpoint
      const updateData = {
        full_name: profileData.full_name.trim(),
        email: profileData.email.trim(),
        address: profileData.address.trim(),
        contact_num: profileData.phone.trim(),
        student_num: profileData.student_number,
        program: fullProgramName,
        year_level: yearNumber,
        section_id: parseInt(selectedSection.section_id || selectedSection.id)
      };

      console.log('Sending update data to new endpoint:', updateData);

      // Use the new student profile update endpoint
      const response = await fetch('http://localhost/scms_new_backup/index.php/api/student/profile/update', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify(updateData)
      });
      
      console.log('Backend update response status:', response.status);
      
      if (response.ok) {
        const responseData = await response.json();
        console.log('Backend update response data:', responseData);
        
        if (responseData.status) {
          setMessage({ type: 'success', text: 'Profile updated successfully! QR code has been auto-generated.' });
          setLastFetched(new Date());
          
          // Update the QR code in local state with the auto-generated one
          if (responseData.data && responseData.data.qr_code) {
            setProfileData(prev => ({
              ...prev,
              qr_code: responseData.data.qr_code
            }));
          }
          
          // Refresh profile data to ensure consistency
          setTimeout(() => {
            fetchUserProfile();
          }, 1000);
        } else {
          setMessage({ type: 'danger', text: responseData.message || 'Failed to update profile' });
        }
      } else {
        const errorData = await response.json().catch(() => ({}));
        console.error('API Error:', errorData);
        setMessage({ type: 'danger', text: `Server Error: ${response.status} - ${errorData.message || response.statusText}` });
      }
    } catch (error) {
      console.error('Error updating student profile:', error);
      setMessage({ type: 'danger', text: error.message || 'An error occurred while updating profile' });
    } finally {
      setLoading(false);
    }
  };

  // Function to manually refresh profile data
  const handleProfileRefresh = async () => {
    try {
      setMessage({ type: 'info', text: 'Refreshing profile data...' });
      await fetchUserProfile();
      setMessage({ type: 'success', text: 'Profile refreshed successfully!' });
    } catch (error) {
      console.error('Error refreshing profile:', error);
      setMessage({ type: 'danger', text: 'Failed to refresh profile data' });
    }
  };

  const handleAcademicUpdate = async () => {
    setLoading(true);
    setMessage({ type: '', text: '' });
    
    try {
      setMessage({ type: 'success', text: 'Academic settings updated successfully!' });
    } catch (error) {
      setMessage({ type: 'danger', text: error.message || 'An error occurred' });
    } finally {
      setLoading(false);
    }
  };

  const handleSecurityUpdate = async () => {
    setLoading(true);
    setMessage({ type: '', text: '' });
    
    try {
      setMessage({ type: 'success', text: 'Security settings updated successfully!' });
    } catch (error) {
      setMessage({ type: 'danger', text: error.message || 'An error occurred' });
    } finally {
      setLoading(false);
    }
  };



  const handlePrivacyUpdate = async () => {
    setLoading(true);
    setMessage({ type: '', text: '' });
    
    try {
      setMessage({ type: 'success', text: 'Privacy settings updated successfully!' });
    } catch (error) {
      setMessage({ type: 'danger', text: error.message || 'An error occurred' });
    } finally {
      setLoading(false);
    }
  };

  if (!user) {
    return (
      <div className="text-center py-5">
        <div className="spinner-border text-primary" role="status">
          <span className="sr-only">Loading...</span>
        </div>
        <p className="mt-2">Loading settings...</p>
      </div>
    );
  }

  if (profileLoading) {
    return (
      <div className="text-center py-5">
        <div className="spinner-border text-primary" role="status">
          <span className="sr-only">Loading...</span>
        </div>
        <p className="mt-2">Loading profile information...</p>
      </div>
    );
  }

  return (
    <div className="px-4 py-5">
      <div className="row">
        <div className="col-12">
          <h1 className="h3 mb-4">Student Settings</h1>
          
          {message.text && (
            <Alert color={message.type} className="mb-4">
              {message.text}
            </Alert>
          )}

          <Card>
            <CardBody>
              <Nav tabs>
                <NavItem>
                  <NavLink
                    className={classnames({ active: activeTab === '1' })}
                    onClick={() => toggleTab('1')}
                  >
                    <i className="ni ni-single-02 mr-2" />
                    Profile
                  </NavLink>
                </NavItem>

                <NavItem>
                  <NavLink
                    className={classnames({ active: activeTab === '2' })}
                    onClick={() => toggleTab('2')}
                  >
                    <i className="ni ni-lock-circle-open mr-2" />
                    Security
                  </NavLink>
                </NavItem>


              </Nav>

              <TabContent activeTab={activeTab} className="mt-4">
                {/* Profile Tab */}
                <TabPane tabId="1">
                  <Card className="shadow-lg border-0" style={{ borderRadius: '16px', overflow: 'hidden' }}>
                    <CardHeader className="bg-gradient-primary text-white border-0" style={{ background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' }}>
                      <div className="d-flex justify-content-between align-items-center">
                        <div>
                          <h5 className="mb-0 text-white font-weight-bold">
                            <i className="ni ni-single-02 mr-2"></i>
                            Profile Information
                          </h5>
                          <small className="text-white-50">
                            {user?.email && `Logged in as: ${user.email}`}
                            {lastFetched && (
                              <span className="ml-2">
                                • Last updated: {lastFetched.toLocaleTimeString()}
                              </span>
                            )}
                          </small>
                        </div>
                        <Button 
                          color="outline-light" 
                          size="sm"
                          className="border-white text-white"
                          style={{ 
                            borderRadius: '20px',
                            border: '1px solid rgba(255,255,255,0.3)',
                            background: 'rgba(255,255,255,0.1)',
                            backdropFilter: 'blur(10px)'
                          }}
                          onClick={handleProfileRefresh}
                          disabled={profileLoading}
                        >
                          <i className="ni ni-refresh mr-1"></i>
                          {profileLoading ? <div className="spinner-border spinner-border-sm" role="status"><span className="sr-only">Loading...</span></div> : 'Refresh'}
                        </Button>

                      </div>
                    </CardHeader>
                    <CardBody className="p-4">
                      {/* Profile Picture Section */}
                      <div className="mb-4 text-center">
                        <div className="position-relative d-inline-block">
                          <div 
                            className="rounded-circle d-flex align-items-center justify-content-center"
                            style={{
                              width: '120px',
                              height: '120px',
                              background: '#f8f9fa',
                              border: '3px solid #e9ecef',
                              position: 'relative'
                            }}
                          >
                            {user?.profile_pic ? (
                              <img 
                                src={user.profile_pic} 
                                alt="Profile" 
                                className="rounded-circle"
                                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                              />
                            ) : (
                              <i className="ni ni-single-02" style={{ fontSize: '3rem', color: '#6c757d' }}></i>
                            )}
                            <div 
                              className="position-absolute"
                              style={{
                                bottom: '0',
                                right: '0',
                                background: '#2096ff',
                                borderRadius: '50%',
                                width: '32px',
                                height: '32px',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                cursor: 'pointer',
                                border: '2px solid white'
                              }}
                            >
                              <i className="ni ni-camera text-white" style={{ fontSize: '14px' }}></i>
                            </div>
                          </div>
                        </div>
                      </div>

                      <div className="mb-3">
                        <h6 className="text-muted mb-2">
                          <i className="ni ni-single-02 mr-2"></i>
                          User Information
                        </h6>
                        <Row>
                          <Col md="6">
                            <div className="mb-2">
                              <Label for="role" className="font-weight-bold text-dark">Role</Label>
                              <Input
                                id="role"
                                type="text"
                                value="Student"
                                disabled
                                className="border-0"
                                style={{ 
                                  borderRadius: '12px',
                                  padding: '12px 16px',
                                  fontSize: '14px',
                                  border: '1px solid #e9ecef',
                                  color: '#6c757d',
                                  backgroundColor: '#f8f9fa'
                                }}
                              />
                            </div>
                          </Col>
                          <Col md="6">
                            <div className="mb-2">
                              <Label for="fullName" className="font-weight-bold text-dark">Full Name</Label>
                              <Input
                                id="fullName"
                                type="text"
                                value={profileData.full_name}
                                onChange={(e) => setProfileData({...profileData, full_name: e.target.value})}
                                required
                                className="border-0"
                                style={{ 
                                  borderRadius: '12px',
                                  padding: '12px 16px',
                                  fontSize: '14px',
                                  border: '1px solid #e9ecef',
                                  color: '#333',
                                  backgroundColor: '#f8f9fa'
                                }}
                              />
                            </div>
                          </Col>
                        </Row>
                        <Row>
                          <Col md="6">
                            <div className="mb-2">
                              <Label for="email" className="font-weight-bold text-dark">Email</Label>
                              <Input
                                id="email"
                                type="email"
                                value={profileData.email}
                                onChange={(e) => setProfileData({...profileData, email: e.target.value})}
                                required
                                className="border-0"
                                style={{ 
                                  borderRadius: '12px',
                                  padding: '12px 16px',
                                  fontSize: '14px',
                                  border: '1px solid #e9ecef',
                                  color: '#333',
                                  backgroundColor: '#f8f9fa'
                                }}
                              />
                            </div>
                          </Col>
                          <Col md="6">
                            <div className="mb-2">
                              <Label for="password" className="font-weight-bold text-dark">Password</Label>
                              <div className="d-flex gap-2">
                                <Input
                                  type="password"
                                  placeholder="Leave blank to keep current password"
                                  className="border-0"
                                  style={{ 
                                    borderRadius: '12px',
                                    padding: '12px 16px',
                                    fontSize: '14px',
                                    border: '1px solid #e9ecef',
                                    color: '#333',
                                    backgroundColor: '#f8f9fa'
                                  }}
                                />
                                <Input
                                  type="password"
                                  placeholder="Leave blank to keep current password"
                                  className="border-0"
                                  style={{ 
                                    borderRadius: '12px',
                                    padding: '12px 16px',
                                    fontSize: '14px',
                                    border: '1px solid #e9ecef',
                                    color: '#333',
                                    backgroundColor: '#f8f9fa'
                                  }}
                                />
                              </div>
                            </div>
                          </Col>
                        </Row>
                      </div>


                      
                      <div className="mb-4">
                        <h6 className="text-muted mb-3" style={{ 
                          fontSize: '16px', 
                          fontWeight: '600',
                          color: '#495057',
                          borderBottom: '2px solid #e9ecef',
                          paddingBottom: '8px'
                        }}>
                          <i className="ni ni-badge mr-2" style={{ color: '#007bff' }}></i>
                          Student Information <span className="text-danger">*</span>
                        </h6>
                        <Row>
                          <Col md="6">
                            <div className="mb-3">
                              <Label for="address" className="font-weight-bold" style={{ 
                                color: '#495057', 
                                fontSize: '14px',
                                marginBottom: '8px',
                                display: 'block'
                              }}>Address <span className="text-danger">*</span></Label>
                              <Input
                                id="address"
                                type="text"
                                value={profileData.address}
                                onChange={(e) => setProfileData({...profileData, address: e.target.value})}
                                placeholder="Enter student's address"
                                required
                                className="border-0"
                                style={{ 
                                  borderRadius: '12px',
                                  padding: '12px 16px',
                                  fontSize: '14px',
                                  border: '1px solid #e9ecef',
                                  color: '#333',
                                  backgroundColor: '#f8f9fa'
                                }}
                              />
                            </div>
                          </Col>
                          <Col md="6">
                            <div className="mb-3">
                              <Label for="studentNumber" className="font-weight-bold" style={{ 
                                color: '#495057', 
                                fontSize: '14px',
                                marginBottom: '8px',
                                display: 'block'
                              }}>Student Number <span className="text-danger">*</span></Label>
                              <Input
                                id="studentNumber"
                                type="text"
                                value={profileData.student_number}
                                onChange={(e) => setProfileData({...profileData, student_number: e.target.value})}
                                placeholder="Enter student number (min. 8 characters)"
                                required
                                className="border-0"
                                style={{ 
                                  borderRadius: '12px',
                                  padding: '12px 16px',
                                  fontSize: '14px',
                                  border: '1px solid #e9ecef',
                                  color: '#333',
                                  backgroundColor: '#f8f9fa'
                                }}
                              />
                            </div>
                          </Col>
                        </Row>
                        <Row>
                          <Col md="6">
                            <div className="mb-3">
                              <Label for="phone" className="font-weight-bold" style={{ 
                                color: '#495057', 
                                fontSize: '14px',
                                marginBottom: '8px',
                                display: 'block'
                              }}>Contact Number <span className="text-danger">*</span></Label>
                              <Input
                                id="phone"
                                type="tel"
                                value={profileData.phone}
                                onChange={(e) => setProfileData({...profileData, phone: e.target.value})}
                                placeholder="Enter contact number"
                                required
                                className="border-0"
                                style={{ 
                                  borderRadius: '12px',
                                  padding: '12px 16px',
                                  fontSize: '14px',
                                  border: '1px solid #e9ecef',
                                  color: '#333',
                                  backgroundColor: '#f8f9fa'
                                }}
                              />
                            </div>
                          </Col>
                          <Col md="6">
                            <div className="mb-3">
                              <Label for="course" className="font-weight-bold" style={{ 
                                color: '#495057', 
                                fontSize: '14px',
                                marginBottom: '8px',
                                display: 'block'
                              }}>Course <span className="text-danger">*</span></Label>
                              <Input
                                id="course"
                                type="select"
                                value={profileData.course}
                                onChange={(e) => handleCourseChange(e.target.value)}
                                className="border-0 modern-dropdown"
                                style={{ 
                                  borderRadius: '8px',
                                  padding: '12px 16px',
                                  fontSize: '14px',
                                  border: '1px solid #e3e3e3',
                                  color: '#333',
                                  backgroundColor: '#ffffff',
                                  boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
                                  transition: 'all 0.2s ease',
                                  cursor: 'pointer',
                                  minHeight: '48px'
                                }}
                                disabled={loadingCourses}
                                onFocus={(e) => {
                                  e.target.style.borderColor = '#007bff';
                                  e.target.style.boxShadow = '0 0 0 0.2rem rgba(0,123,255,0.25)';
                                }}
                                onBlur={(e) => {
                                  e.target.style.borderColor = '#e3e3e3';
                                  e.target.style.boxShadow = '0 1px 3px rgba(0,0,0,0.1)';
                                }}
                              >
                                <option value="" style={{ color: '#6c757d' }}>{loadingCourses ? 'Loading...' : 'Select Course'}</option>
                                {availableCourses.map((course) => (
                                  <option key={course.id} value={course.name} style={{ color: '#333' }}>
                                    {course.abbr ? `${course.abbr} - ${course.name}` : course.name}
                                  </option>
                                ))}
                              </Input>
                            </div>
                          </Col>
                        </Row>
                        <Row>
                          <Col md="6">
                            <div className="mb-3">
                              <Label for="yearLevel" className="font-weight-bold" style={{ 
                                color: '#495057', 
                                fontSize: '14px',
                                marginBottom: '8px',
                                display: 'block'
                              }}>Year</Label>
                              <Input
                                id="yearLevel"
                                type="select"
                                value={profileData.year_level}
                                onChange={(e) => handleYearLevelChange(e.target.value)}
                                className="border-0 modern-dropdown"
                                style={{ 
                                  borderRadius: '8px',
                                  padding: '12px 16px',
                                  fontSize: '14px',
                                  border: '1px solid #e3e3e3',
                                  color: '#333',
                                  backgroundColor: '#ffffff',
                                  boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
                                  transition: 'all 0.2s ease',
                                  cursor: 'pointer',
                                  minHeight: '48px'
                                }}
                                disabled={!profileData.course || loadingYearLevels}
                                onFocus={(e) => {
                                  e.target.style.borderColor = '#007bff';
                                  e.target.style.boxShadow = '0 0 0 0.2rem rgba(0,123,255,0.25)';
                                }}
                                onBlur={(e) => {
                                  e.target.style.borderColor = '#e3e3e3';
                                  e.target.style.boxShadow = '0 1px 3px rgba(0,0,0,0.1)';
                                }}
                              >
                                <option value="" style={{ color: '#6c757d' }}>{loadingYearLevels ? 'Loading...' : 'Select Year'}</option>
                                {availableYearLevels.map((year) => (
                                  <option key={year} value={year} style={{ color: '#333' }}>
                                    {year}
                                  </option>
                                ))}
                              </Input>
                            </div>
                          </Col>
                          <Col md="6">
                            <div className="mb-3">
                              <Label for="section" className="font-weight-bold" style={{ 
                                color: '#495057', 
                                fontSize: '14px',
                                marginBottom: '8px',
                                display: 'block'
                              }}>Section</Label>
                              
                              {/* Debug info - remove after fixing */}

                              <Input
                                id="section"
                                type="select"
                                value={profileData.section}
                                onChange={(e) => setProfileData({...profileData, section: e.target.value})}
                                className="border-0 modern-dropdown"
                                style={{ 
                                  borderRadius: '8px',
                                  padding: '12px 16px',
                                  fontSize: '14px',
                                  border: '1px solid #e3e3e3',
                                  color: '#333',
                                  backgroundColor: '#ffffff',
                                  boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
                                  transition: '0.2s ease',
                                  cursor: 'pointer',
                                  minHeight: '48px'
                                }}
                                disabled={!profileData.course || !profileData.year_level || loadingSections}
                                onFocus={(e) => {
                                  e.target.style.borderColor = '#007bff';
                                  e.target.style.boxShadow = '0 0 0 0.2rem rgba(0,123,255,0.25)';
                                }}
                                onBlur={(e) => {
                                  e.target.style.borderColor = '#e3e3e3';
                                  e.target.style.boxShadow = '0 1px 3px rgba(0,0,0,0.1)';
                                }}
                              >

                                <option value="" style={{ color: '#6c757d' }}>
                                  {loadingSections ? 'Loading sections...' : 
                                   !profileData.course ? 'Select course first' :
                                   !profileData.year_level ? 'Select year first' :
                                   availableSections.length === 0 ? 'No sections available' :
                                   'Select a section'}
                                </option>
                                {availableSections.map((section) => (
                                  <option key={section.section_id || section.id} value={section.section_name || section.name} style={{ color: '#333' }}>
                                    {section.section_name || section.name}
                                    {section.adviser_name && ` - ${section.adviser_name}`}
                                    {section.enrolled_count && ` (${section.enrolled_count} students)`}
                                  </option>
                                ))}
                              </Input>
                              {availableSections.length > 0 && (
                                <small className="text-success mt-2 d-block">
                                  <i className="ni ni-check-bold mr-1"></i>
                                  Found {availableSections.length} section(s) for {profileData.year_level} in {profileData.course}
                                </small>
                              )}
                              {availableSections.length === 0 && !loadingSections && profileData.course && profileData.year_level && (
                                <small className="text-warning mt-2 d-block">
                                  <i className="ni ni-alert-circle mr-1"></i>
                                  No sections available for {profileData.year_level} in {profileData.course}
                                </small>
                              )}
                              

                            </div>
                          </Col>
                        </Row>
                      </div>
                      
                      <div className="mb-3">
                        <h6 className="text-muted mb-2">
                          <i className="ni ni-qr-code mr-2"></i>
                          QR Code
                        </h6>
                        <Row>
                          <Col md="12">
                            <div className="mb-2">
                              <Label for="qrCodeData" className="font-weight-bold text-dark">QR Code Data</Label>
                              <Input
                                id="qrCodeData"
                                type="textarea"
                                value={profileData.qr_code || "QR code will be generated automatically..."}
                                disabled
                                className="border-0"
                                style={{ 
                                  borderRadius: '12px',
                                  padding: '12px 16px',
                                  fontSize: '14px',
                                  border: '1px solid #e9ecef',
                                  color: '#6c757d',
                                  backgroundColor: '#f8f9fa',
                                  minHeight: '80px'
                                }}
                              />
                              <small className="text-muted">
                                <i className="ni ni-info mr-1"></i>
                                QR code is automatically generated when you update your profile with Course, Year, and Section.
                              </small>
                              {profileData.qr_code && (
                                <div className="text-success mt-2">
                                  <i className="ni ni-check-bold mr-1"></i>
                                  QR code is ready and up-to-date
                                </div>
                              )}
                              {!profileData.qr_code && (
                                <div className="text-info mt-2">
                                  <i className="ni ni-time-alarm mr-1"></i>
                                  QR code will be generated after you select Course, Year, Section and update your profile
                                </div>
                              )}
                            </div>
                          </Col>
                        </Row>
                      </div>
                      

                      
                      <div className="text-center pt-4 border-top">
                        <Button 
                          color="primary" 
                          size="lg"
                          onClick={handleProfileUpdate}
                          disabled={loading}
                          className="px-5 py-3"
                          style={{ 
                            borderRadius: '25px',
                            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                            border: 'none',
                            boxShadow: '0 4px 15px rgba(102, 126, 234, 0.4)'
                          }}
                        >
                          {loading ? (
                            <>
                              <div className="spinner-border spinner-border-sm mr-2" role="status">
                                <span className="sr-only">Loading...</span>
                              </div>
                              Updating...
                            </>
                          ) : (
                            <>
                              <i className="ni ni-check-bold mr-2"></i>
                              Update Profile
                            </>
                          )}
                        </Button>
                      </div>
                    </CardBody>
                  </Card>
                </TabPane>

                

                {/* Security Tab */}
                <TabPane tabId="2">
                  <Card className="shadow-lg border-0" style={{ borderRadius: '16px', overflow: 'hidden' }}>
                    <CardHeader className="bg-gradient-primary text-white border-0" style={{ background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' }}>
                      <h5 className="mb-0 text-white font-weight-bold">
                        <i className="ni ni-lock-circle-open mr-2"></i>
                        Security Settings
                      </h5>
                      <small className="text-white-50">Manage your account security and authentication</small>
                    </CardHeader>
                    <CardBody className="p-4">
                      <div className="mb-4">
                        <h6 className="text-muted mb-3">
                          <i className="ni ni-shield-check mr-2"></i>
                          Two-Factor Authentication
                        </h6>
                        <div className="p-3 border rounded-lg mb-3" style={{ backgroundColor: 'rgb(248, 249, 250)' }}>
                          <div className="d-flex align-items-center justify-content-between">
                            <div className="d-flex align-items-center">
                              <i className="ni ni-lock-circle-open text-success mr-3" style={{ fontSize: '1.5rem' }}></i>
                              <div>
                                <h6 className="mb-1 font-weight-bold">Security Level: {securitySettings.twoFAEnabled ? 'Enhanced' : 'Basic'}</h6>
                                <small className="text-muted">{securitySettings.twoFAEnabled ? 'Your account is protected with two-factor authentication' : 'Your account uses basic password authentication only'}</small>
                              </div>
                            </div>
                            <Badge color={securitySettings.twoFAEnabled ? "success" : "secondary"} className="px-3 py-2">
                              <i className={`ni ni-${securitySettings.twoFAEnabled ? 'check-bold' : 'fat-remove'} mr-1`}></i>
                              {securitySettings.twoFAEnabled ? 'ENABLED' : 'DISABLED'}
                            </Badge>
                          </div>
                        </div>
                        
                        <Row className="mb-3">
                          <Col md="4">
                            <div className="p-3 border rounded-lg text-center" style={{ backgroundColor: 'rgb(248, 249, 250)' }}>
                              <i className="ni ni-mobile-button text-primary mb-2" style={{ fontSize: '2rem' }}></i>
                              <div>
                                <small className="text-muted d-block">Method</small>
                                <strong>Authenticator App (TOTP)</strong>
                              </div>
                            </div>
                          </Col>
                          <Col md="4">
                            <div className="p-3 border rounded-lg text-center" style={{ backgroundColor: 'rgb(248, 249, 250)' }}>
                              <i className="ni ni-time-alarm text-warning mb-2" style={{ fontSize: '2rem' }}></i>
                              <div>
                                <small className="text-muted d-block">Last Used</small>
                                <strong>Never</strong>
                              </div>
                            </div>
                          </Col>
                          <Col md="4">
                            <div className="p-3 border rounded-lg text-center" style={{ backgroundColor: 'rgb(248, 249, 250)' }}>
                              <i className="ni ni-collection text-info mb-2" style={{ fontSize: '2rem' }}></i>
                              <div>
                                <small className="text-muted d-block">Backup Codes</small>
                                <strong>{backupCodesCount} remaining</strong>
                              </div>
                            </div>
                          </Col>
                        </Row>
                        
                        <Alert color={securitySettings.twoFAEnabled ? "success" : "warning"} className="border-0" style={{ 
                          borderRadius: '12px',
                          background: securitySettings.twoFAEnabled ? '#28a745' : '#ffc107',
                          border: securitySettings.twoFAEnabled ? '1px solid #28a745' : '1px solid #ffc107'
                        }}>
                          <i className={`ni ni-${securitySettings.twoFAEnabled ? 'check-bold' : 'fat-remove'} mr-2`}></i>
                          <strong>{securitySettings.twoFAEnabled ? '2FA is Active!' : '2FA is Disabled!'}</strong> {securitySettings.twoFAEnabled ? 'Your account is now protected with two-factor authentication. You\'ll need to enter a verification code each time you log in.' : 'Your account is not protected with two-factor authentication. Enable 2FA for enhanced security.'}
                        </Alert>
                        
                        <div className="d-flex flex-wrap gap-2 mt-3">
                          {securitySettings.twoFAEnabled ? (
                            <Button 
                              color="outline-danger" 
                              size="sm"
                              className="px-3 py-2"
                              style={{ 
                                borderRadius: '20px',
                                border: '1px solid #dc3545',
                                color: '#dc3545',
                                transition: 'all 0.3s ease',
                                cursor: 'pointer'
                              }}
                              onMouseEnter={(e) => {
                                e.target.style.backgroundColor = '#dc3545';
                                e.target.style.color = '#ffffff';
                                e.target.style.borderColor = '#dc3545';
                                e.target.style.boxShadow = '0 4px 12px rgba(220, 53, 69, 0.4)';
                              }}
                              onMouseLeave={(e) => {
                                e.target.style.backgroundColor = 'transparent';
                                e.target.style.color = '#dc3545';
                                e.target.style.borderColor = '#dc3545';
                                e.target.style.boxShadow = 'none';
                              }}
                              onClick={() => setShowDisable2FAModal(true)}
                            >
                              <i className="ni ni-lock-circle-open mr-2"></i>
                              Disable 2FA
                            </Button>
                          ) : (
                            <Button 
                              color="outline-success" 
                              size="sm"
                              className="px-3 py-2"
                              style={{ 
                                borderRadius: '20px',
                                border: '1px solid #28a745',
                                color: '#28a745',
                                transition: 'all 0.3s ease',
                                cursor: 'pointer'
                              }}
                              onMouseEnter={(e) => {
                                e.target.style.backgroundColor = '#28a745';
                                e.target.style.color = '#ffffff';
                                e.target.style.borderColor = '#28a745';
                                e.target.style.boxShadow = '0 4px 12px rgba(40, 167, 69, 0.4)';
                              }}
                              onMouseLeave={(e) => {
                                e.target.style.backgroundColor = 'transparent';
                                e.target.style.color = '#28a745';
                                e.target.style.borderColor = '#28a745';
                                e.target.style.boxShadow = 'none';
                              }}
                              onClick={() => setShow2FAModal(true)}
                            >
                              <i className="ni ni-lock-circle-open mr-2"></i>
                              Enable 2FA
                            </Button>
                          )}

                          <Button 
                            color="outline-warning" 
                            size="sm"
                            className="px-3 py-2"
                            style={{ 
                              borderRadius: '20px',
                              border: '1px solid #ffc107',
                              color: '#ffc107',
                              transition: 'all 0.3s ease',
                              cursor: 'pointer'
                            }}
                            onMouseEnter={(e) => {
                              e.target.style.backgroundColor = '#ffc107';
                              e.target.style.color = '#ffffff';
                              e.target.style.borderColor = '#ffc107';
                              e.target.style.boxShadow = '0 4px 12px rgba(255, 193, 7, 0.4)';
                            }}
                            onMouseLeave={(e) => {
                              e.target.style.backgroundColor = 'transparent';
                              e.target.style.color = '#ffc107';
                              e.target.style.borderColor = '#ffc107';
                              e.target.style.boxShadow = 'none';
                            }}
                            onClick={() => setShowBackupCodesModal(true)}
                          >
                            <i className="ni ni-collection mr-2"></i>
                            Manage Backup Codes
                          </Button>
                        </div>
                      </div>
                      
                      <div className="pt-4 border-top">
                        <h6 className="text-muted mb-3">
                          <i className="ni ni-key-25 mr-2"></i>
                          Password Management
                        </h6>
                        <div className="p-3 border rounded-lg mb-3" style={{ backgroundColor: 'rgb(248, 249, 250)' }}>
                          <p className="text-muted mb-3">
                            Keep your password secure and change it regularly for better account protection.
                          </p>
                          <Button 
                            color="primary" 
                            size="sm"
                            className="px-4 py-2"
                            style={{ 
                              borderRadius: '20px',
                              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                              border: 'none',
                              boxShadow: '0 2px 8px rgba(102, 126, 234, 0.3)'
                            }}
                            onClick={() => setShowChangePasswordModal(true)}
                          >
                            <i className="ni ni-key-25 mr-2"></i>
                            Change Password
                          </Button>
                        </div>
                      </div>
                    </CardBody>
                  </Card>
                </TabPane>



                {/* Privacy Tab */}
                <TabPane tabId="4">
                  <Row>
                    <Col md="6">
                      <h6>Profile Visibility</h6>
                      <FormGroup>
                        <Label for="profileVisibility">Who can see my profile?</Label>
                        <Input
                          id="profileVisibility"
                          type="select"
                          value={privacySettings.profileVisibility}
                          onChange={(e) => setPrivacySettings({...privacySettings, profileVisibility: e.target.value})}
                        >
                          <option value="classmates">Classmates Only</option>
                          <option value="teachers">Teachers Only</option>
                          <option value="everyone">Everyone</option>
                          <option value="nobody">Nobody</option>
                        </Input>
                      </FormGroup>
                      <FormGroup check>
                        <Label check>
                          <Input
                            type="checkbox"
                            checked={privacySettings.showOnlineStatus}
                            onChange={(e) => setPrivacySettings({...privacySettings, showOnlineStatus: e.target.checked})}
                          />
                          Show Online Status
                        </Label>
                      </FormGroup>
                    </Col>
                    <Col md="6">
                      <h6>Communication Settings</h6>
                      <FormGroup check>
                        <Label check>
                          <Input
                            type="checkbox"
                            checked={privacySettings.allowDirectMessages}
                            onChange={(e) => setPrivacySettings({...privacySettings, allowDirectMessages: e.target.checked})}
                          />
                          Allow Direct Messages
                        </Label>
                      </FormGroup>
                      <FormGroup check>
                        <Label check>
                          <Input
                            type="checkbox"
                            checked={privacySettings.shareProgress}
                            onChange={(e) => setPrivacySettings({...privacySettings, shareProgress: e.target.checked})}
                          />
                          Share Academic Progress
                        </Label>
                      </FormGroup>
                    </Col>
                  </Row>
                  <Button color="primary" onClick={handlePrivacyUpdate} disabled={loading}>
                    {loading ? 'Updating...' : 'Update Privacy Settings'}
                  </Button>
                </TabPane>
              </TabContent>
            </CardBody>
          </Card>
        </div>
      </div>
      
      {/* 2FA Setup Modal */}
      <TwoFactorAuth
        isOpen={show2FAModal}
        toggle={() => setShow2FAModal(!show2FAModal)}
        onSuccess={handle2FASuccess}
        onCancel={() => setShow2FAModal(false)}
      />
      
      {/* 2FA Disable Confirmation Modal */}
      <Disable2FAModal
        isOpen={showDisable2FAModal}
        toggle={() => setShowDisable2FAModal(!showDisable2FAModal)}
        onSuccess={handle2FADisableSuccess}
        onCancel={() => setShowDisable2FAModal(false)}
      />

      {/* Manage Backup Codes Modal */}
      <BackupCodesModal
        isOpen={showBackupCodesModal}
        toggle={() => setShowBackupCodesModal(!showBackupCodesModal)}
        onSuccess={() => {
          setMessage({ type: 'success', text: 'Backup codes updated successfully!' });
          setShowBackupCodesModal(false);
        }}
        onCancel={() => setShowBackupCodesModal(false)}
      />

      {/* Change Password Modal */}
      <ChangePasswordModal
        isOpen={showChangePasswordModal}
        toggle={() => setShowChangePasswordModal(!showChangePasswordModal)}
        onSuccess={() => {
          setMessage({ type: 'success', text: 'Password updated successfully!' });
          setShowChangePasswordModal(false);
        }}
        onCancel={() => setShowChangePasswordModal(false)}
      />
    </div>
  );
};

export default StudentSettings;
