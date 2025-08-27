import React, { useState, useRef, useEffect } from "react";
import {
  Button,
  Card,
  CardHeader,
  CardBody,
  FormGroup,
  Form,
  Input,
  Row,
  Col,
  Container,
  Label,
  Modal,
  ModalBody,
  ModalHeader,
  InputGroup,
  InputGroupAddon,
  InputGroupText
} from "reactstrap";
import Header from "components/Headers/Header.js";
import { useNavigate } from "react-router-dom";
import { FaCheck, FaTimes, FaUser } from "react-icons/fa";
import Select from 'react-select';
import { components } from 'react-select';
import ApiService from "../../services/api";
import { getProfilePictureUrl, getUserInitials, getAvatarColor } from "../../utils/profilePictureUtils";

const courseOptions = [
  { value: "bsit", label: "BSIT" },
  { value: "bscs", label: "BSCS" },
  { value: "bsis", label: "BSIS" },
  { value: "act", label: "ACT" },
];
const semesterOptions = [
  { value: "1st Semester", label: "1st Semester" },
  { value: "2nd Semester", label: "2nd Semester" },
];
const studentNames = [
  "Mike Johnson", "David Brown", "Robert Miller", "Lisa Garcia", "Emily Clark", "James Lee", "Sophia Turner", "Daniel Kim", "Olivia Harris", "William Scott",
  "Ava Martinez", "Benjamin Young", "Mia King", "Elijah Wright", "Charlotte Green", "Alexander Adams", "Amelia Nelson", "Jacob Carter", "Evelyn Mitchell", "Michael Perez",
  "Abigail Roberts", "Matthew Hall", "Harper Lewis", "Jack Walker", "Ella Allen", "Henry Sanchez", "Grace Baker", "Samuel Gonzalez", "Chloe Nelson", "Jackson Rivera",
  "Lily Campbell", "Sebastian Morgan", "Zoe Reed", "Logan Cooper", "Penelope Cox", "Lucas Howard", "Layla Ward", "Mason Torres", "Scarlett Peterson", "Ethan Gray",
  "Victoria Ramirez", "Carter James", "Hannah Watson", "Jayden Brooks", "Aria Kelly", "Gabriel Sanders", "Avery Price", "Julian Bennett", "Sofia Wood", "Levi Barnes",
  "Nora Ross", "David Powell", "Camila Long", "Wyatt Patterson"
];
const avatarImages = [
  require("../../assets/img/theme/team-1-800x800.jpg"),
  require("../../assets/img/theme/team-2-800x800.jpg"),
  require("../../assets/img/theme/team-3-800x800.jpg"),
  require("../../assets/img/theme/team-4-800x800.jpg"),
  require("../../assets/img/theme/angular.jpg"),
  require("../../assets/img/theme/bootstrap.jpg"),
  require("../../assets/img/theme/profile-cover.jpg"),
  require("../../assets/img/theme/react.jpg"),
  require("../../assets/img/theme/sketch.jpg"),
  require("../../assets/img/theme/team-1-800x800.jpg"), // repeat if needed
  require("../../assets/img/theme/team-2-800x800.jpg"),
  require("../../assets/img/theme/team-3-800x800.jpg"),
  require("../../assets/img/theme/team-4-800x800.jpg"),
  require("../../assets/img/theme/team-1-800x800.jpg"),
  require("../../assets/img/theme/team-2-800x800.jpg"),
  require("../../assets/img/theme/team-3-800x800.jpg"),
  require("../../assets/img/theme/team-4-800x800.jpg"),
  require("../../assets/img/theme/vue.jpg")
];
const mockStudents = studentNames.map((name, idx) => {
  const id = idx + 1;
  // Use a unique avatar for each student, cycle if more students than images
  const avatar = avatarImages[idx % avatarImages.length];
  return {
    id,
    name,
    email: `20213059${id.toString().padStart(2, '0')}@dhvsu.edu.ph`,
    avatar
  };
});

// Add avatar URLs to userManagementUsers
const teacherAvatars = [
  require("../../assets/img/theme/team-1-800x800.jpg"),
  require("../../assets/img/theme/team-2-800x800.jpg"),
  require("../../assets/img/theme/team-3-800x800.jpg"),
  require("../../assets/img/theme/team-4-800x800.jpg"),
  require("../../assets/img/theme/angular.jpg"),
  require("../../assets/img/theme/bootstrap.jpg"),
  require("../../assets/img/theme/profile-cover.jpg"),
  require("../../assets/img/theme/react.jpg"),
  require("../../assets/img/theme/sketch.jpg"),
  require("../../assets/img/theme/team-1-800x800.jpg"),
  require("../../assets/img/theme/team-2-800x800.jpg"),
  require("../../assets/img/theme/team-3-800x800.jpg"),
  require("../../assets/img/theme/team-4-800x800.jpg"),
  require("../../assets/img/theme/team-1-800x800.jpg"),
  require("../../assets/img/theme/team-2-800x800.jpg"),
  require("../../assets/img/theme/team-3-800x800.jpg"),
  require("../../assets/img/theme/team-4-800x800.jpg"),
];
const studentAvatars = [
  require("../../assets/img/theme/team-1-800x800.jpg"),
  require("../../assets/img/theme/team-2-800x800.jpg"),
  require("../../assets/img/theme/team-3-800x800.jpg"),
  require("../../assets/img/theme/team-4-800x800.jpg"),
  require("../../assets/img/theme/angular.jpg"),
  require("../../assets/img/theme/bootstrap.jpg"),
  require("../../assets/img/theme/profile-cover.jpg"),
  require("../../assets/img/theme/react.jpg"),
  require("../../assets/img/theme/sketch.jpg"),
  require("../../assets/img/theme/team-1-800x800.jpg"),
  require("../../assets/img/theme/team-2-800x800.jpg"),
  require("../../assets/img/theme/team-3-800x800.jpg"),
  require("../../assets/img/theme/team-4-800x800.jpg"),
  require("../../assets/img/theme/team-1-800x800.jpg"),
  require("../../assets/img/theme/team-2-800x800.jpg"),
  require("../../assets/img/theme/team-3-800x800.jpg"),
  require("../../assets/img/theme/team-4-800x800.jpg"),
  require("../../assets/img/theme/vue.jpg")
];
const userManagementUsers = [
  // Admin users
  { id: 1, name: "Dr. Sarah Johnson", email: "sarah.johnson@school.com", role: "admin" },
  { id: 2, name: "Mr. David Smith", email: "david.smith@school.com", role: "admin" },
  { id: 3, name: "Ms. Lisa Brown", email: "lisa.brown@school.com", role: "admin" },
  // Teacher users
  { id: 4, name: "Dr. Emily Johnson", email: "emily.johnson@school.com", role: "teacher", avatar: teacherAvatars[0] },
  { id: 5, name: "Prof. David Smith", email: "david.smith@school.com", role: "teacher", avatar: teacherAvatars[1] },
  { id: 6, name: "Ms. Lisa Brown", email: "lisa.brown@school.com", role: "teacher", avatar: teacherAvatars[2] },
  { id: 7, name: "Mr. Robert Wilson", email: "robert.wilson@school.com", role: "teacher", avatar: teacherAvatars[3] },
  { id: 8, name: "Dr. Maria Garcia", email: "maria.garcia@school.com", role: "teacher", avatar: teacherAvatars[4] },
  { id: 9, name: "Mrs. Jennifer Lee", email: "jennifer.lee@school.com", role: "teacher", avatar: teacherAvatars[5] },
  { id: 10, name: "Mr. Thomas Anderson", email: "thomas.anderson@school.com", role: "teacher", avatar: teacherAvatars[6] },
  { id: 11, name: "Ms. Amanda White", email: "amanda.white@school.com", role: "teacher", avatar: teacherAvatars[7] },
  { id: 12, name: "Dr. Christopher Martinez", email: "christopher.martinez@school.com", role: "teacher", avatar: teacherAvatars[8] },
  { id: 13, name: "Mrs. Patricia Taylor", email: "patricia.taylor@school.com", role: "teacher", avatar: teacherAvatars[9] },
  { id: 14, name: "Mr. Daniel Clark", email: "daniel.clark@school.com", role: "teacher", avatar: teacherAvatars[10] },
  { id: 15, name: "Ms. Rebecca Hall", email: "rebecca.hall@school.com", role: "teacher", avatar: teacherAvatars[11] },
  { id: 16, name: "Dr. Kevin Rodriguez", email: "kevin.rodriguez@school.com", role: "teacher", avatar: teacherAvatars[12] },
  { id: 17, name: "Mrs. Stephanie Lewis", email: "stephanie.lewis@school.com", role: "teacher", avatar: teacherAvatars[13] },
  { id: 18, name: "Mr. Jason Walker", email: "jason.walker@school.com", role: "teacher", avatar: teacherAvatars[14] },
  // Student users
  ...[...Array(28)].map((_, i) => ({
    id: 19 + i,
    name: [
      "Alex Thompson", "Emma Davis", "James Wilson", "Sophia Lee", "Michael Chen", "Olivia Taylor", "William Brown", "Ava Johnson", "Ethan Miller", "Isabella Garcia",
      "Mason Rodriguez", "Mia Martinez", "Noah Anderson", "Charlotte White", "Liam Clark", "Harper Hall", "Evelyn Lewis", "Benjamin Walker", "Abigail Young", "Sebastian King",
      "Emily Wright", "Daniel Lopez", "Sofia Hill", "Matthew Scott", "Avery Green", "Ella Adams", "Jackson Baker", "Madison Nelson"
    ][i],
    email: [
      "alex.thompson@student.school.com", "emma.davis@student.school.com", "james.wilson@student.school.com", "sophia.lee@student.school.com", "michael.chen@student.school.com", "olivia.taylor@student.school.com", "william.brown@student.school.com", "ava.johnson@student.school.com", "ethan.miller@student.school.com", "isabella.garcia@student.school.com",
      "mason.rodriguez@student.school.com", "mia.martinez@student.school.com", "noah.anderson@student.school.com", "charlotte.white@student.school.com", "liam.clark@student.school.com", "harper.hall@student.school.com", "evelyn.lewis@student.school.com", "benjamin.walker@student.school.com", "abigail.young@student.school.com", "sebastian.king@student.school.com",
      "emily.wright@student.school.com", "daniel.lopez@student.school.com", "sofia.hill@student.school.com", "matthew.scott@student.school.com", "avery.green@student.school.com", "ella.adams@student.school.com", "jackson.baker@student.school.com", "madison.nelson@student.school.com"
    ][i],
    role: "student",
    avatar: studentAvatars[i % studentAvatars.length]
  }))
];

// Use only students for the popup
const userManagementStudents = userManagementUsers.filter(u => u.role === "student");

// Helper to get student avatar URL or initials fallback
const getStudentAvatar = (student) => {
  if (!student) return null;
  
  // Use the profile picture utilities to get proper URL
  return getProfilePictureUrl(student);
};

const CreateSection = () => {
  const [course, setCourse] = useState("");
  const [sectionName, setSectionName] = useState("");
  const [yearLevel, setYearLevel] = useState("");
  const [academicYear, setAcademicYear] = useState("");
  const [semester, setSemester] = useState("");
  const [adviser, setAdviser] = useState("");
  const [selectedStudents, setSelectedStudents] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [studentModal, setStudentModal] = useState(false);
  const [studentSearch, setStudentSearch] = useState("");
  const [isStudentSearchFocused, setIsStudentSearchFocused] = useState(false);
  const [teachers, setTeachers] = useState([]);
  const [isLoadingTeachers, setIsLoadingTeachers] = useState(true);
  const [students, setStudents] = useState([]);
  const [isLoadingStudents, setIsLoadingStudents] = useState(true);
  const navigate = useNavigate();
  const adviserInputRef = useRef();

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
      const courseLabel = courseOptions.find(opt => opt.value === course)?.label || course.toUpperCase();
      const yearNum = yearLevel.replace(/[^0-9]/g, '');
      const sectionLetter = sectionName.trim().toUpperCase();
      const generatedName = `${courseLabel} ${yearNum}${sectionLetter}`;
      setSectionName(generatedName);
    }
  }, [course, yearLevel]);

  // Handle section name input - extract just the letter and regenerate full name
  const handleSectionNameChange = (e) => {
    const input = e.target.value;
    
    // If user is typing and we have course and year level, generate full name
    if (course && yearLevel && input.trim()) {
      const courseLabel = courseOptions.find(opt => opt.value === course)?.label || course.toUpperCase();
      const yearNum = yearLevel.replace(/[^0-9]/g, '');
      const sectionLetter = input.trim().toUpperCase();
      const generatedName = `${courseLabel} ${yearNum}${sectionLetter}`;
      setSectionName(generatedName);
    } else {
      // If we don't have course or year level, just set the input as is
      setSectionName(input);
    }
  };

  // Fetch teachers for advisers
  useEffect(() => {
    const fetchTeachers = async () => {
      try {
        setIsLoadingTeachers(true);
        const response = await ApiService.getTeachers();
        console.log('=== Teachers API Response ===');
        console.log('Full response:', response);
        console.log('Response type:', typeof response);
        console.log('Response is array:', Array.isArray(response));
        console.log('Response.data:', response.data);
        console.log('Response.data.data:', response.data?.data);
        console.log('Direct response:', response);
        
        // Handle different response structures
        const teachersData = response.data || response.data?.data || response || [];
        console.log('Final teachers data:', teachersData);
        
        // Additional debugging for response structure
        console.log('=== Response Structure Debug ===');
        console.log('Response type:', typeof response);
        console.log('Response keys:', Object.keys(response));
        console.log('Response.data type:', typeof response.data);
        console.log('Response.data keys:', response.data ? Object.keys(response.data) : 'No data');
        if (response.data && Array.isArray(response.data)) {
          console.log('Response.data is array with length:', response.data.length);
        }
        console.log('===============================');
        
        // Normalize teacher data (same as UserManagement)
        const normalizedTeachers = teachersData.map(teacher => {
          console.log('=== Teacher Data Debug ===');
          console.log('Original teacher object:', teacher);
          console.log('Available fields:', Object.keys(teacher));
          console.log('ID field:', teacher.id || teacher.user_id || teacher.userId);
          console.log('Profile pic field:', teacher.profile_pic || teacher.profileImageUrl || teacher.avatar);
          console.log('========================');
          
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
        // Fallback to mock data if API fails
        setTeachers(userManagementUsers.filter(u => u.role === 'teacher'));
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
        console.log('=== Students API Response ===');
        console.log('Full response:', response);
        console.log('Response type:', typeof response);
        console.log('Response is array:', Array.isArray(response));
        console.log('Response.data:', response.data);
        console.log('Response.data.data:', response.data?.data);
        console.log('Direct response:', response);
        
        // Handle different response structures
        const studentsData = response.data || response.data?.data || response || [];
        console.log('Final students data:', studentsData);
        
        // Additional debugging for response structure
        console.log('=== Students Response Structure Debug ===');
        console.log('Response type:', typeof response);
        console.log('Response keys:', Object.keys(response));
        console.log('Response.data type:', typeof response.data);
        console.log('Response.data keys:', response.data ? Object.keys(response.data) : 'No data');
        if (response.data && Array.isArray(response.data)) {
          console.log('Response.data is array with length:', response.data.length);
        }
        console.log('========================================');
        
        // Normalize student data (same pattern as teachers)
        const normalizedStudents = studentsData.map(student => {
          console.log('=== Student Data Debug ===');
          console.log('Original student object:', student);
          console.log('Available fields:', Object.keys(student));
          console.log('ID field:', student.id || student.user_id || student.userId);
          console.log('Profile pic field:', student.profile_pic || student.profileImageUrl || student.avatar);
          console.log('========================');
          
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
        // Fallback to mock data if API fails
        setStudents(userManagementStudents);
      } finally {
        setIsLoadingStudents(false);
      }
    };

    fetchStudents();
  }, []);

  const handleStudentCheck = (id) => {
    setSelectedStudents((prev) =>
      prev.includes(id) ? prev.filter((sid) => sid !== id) : [...prev, id]
    );
  };

  const removeStudent = (id) => setSelectedStudents(selectedStudents.filter(sid => sid !== id));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    // Map course short code to full name
    const courseMap = {
      bsit: "Bachelor of Science in Information Technology",
      bscs: "Bachelor of Science in Computer Science",
      bsis: "Bachelor of Science in Information Systems",
      act: "Associate in Computer Technology"
    };

    // Get adviser object (should have .user_id or .id)
    const selectedAdviser = teachers.find(t => String(t.id) === String(adviser));
    const adviser_id = selectedAdviser?.user_id || selectedAdviser?.id || "";

    // Get student IDs (should be the unique student code, not just numeric)
    const student_ids = selectedStudents.map(id => {
      const stu = students.find(s => s.id === id);
      return stu?.student_id || stu?.user_id || stu?.id || "";
    }).filter(Boolean);

    const payload = {
      section_name: sectionName,
      program: courseMap[course] || course,
      year_level: yearLevel.replace(/[^0-9]/g, '') || yearLevel, // e.g. "1st"
      adviser_id,
      semester: semester.replace(' Semester', ''), // Convert "1st Semester" to "1st"
      academic_year: academicYear,
      student_ids,
    };

    try {
      // Create the section
      const response = await ApiService.createSection(payload);
      console.log('Section created:', response);
      
      // Get the created section ID from the response
      const createdSectionId = response.data?.id || response.id || response.section_id;
      
      if (createdSectionId && student_ids.length > 0) {
        console.log(`Updating section_id for ${student_ids.length} students to ${createdSectionId}`);
        
        // Update section_id for all selected students
        for (const studentId of student_ids) {
          try {
            await ApiService.updateUserSectionId(studentId, createdSectionId);
            console.log(`Updated section_id for student ${studentId} to ${createdSectionId}`);
          } catch (error) {
            console.error(`Failed to update section_id for student ${studentId}:`, error);
          }
        }
      }
      
      setShowSuccess(true);
      setTimeout(() => {
        setShowSuccess(false);
        // Add a small delay to ensure backend has processed the student assignments
        setTimeout(() => {
          navigate("/admin/section-management");
        }, 500);
      }, 2000);
    } catch (err) {
      alert("Failed to create section: " + (err.response?.data?.message || err.message));
    } finally {
      setIsSubmitting(false);
    }
  };

  const filteredStudents = students.filter(
    (s) =>
      (s.full_name && s.full_name.toLowerCase().includes(studentSearch.toLowerCase())) ||
      (s.email && s.email.toLowerCase().includes(studentSearch.toLowerCase()))
  );

  // Adviser select custom option rendering
  const adviserOptions = teachers.map(t => {
    console.log('=== Processing Teacher for Adviser Options ===');
    console.log('Teacher object:', t);
    console.log('Profile pic value:', t.profile_pic);
    console.log('Profile pic type:', typeof t.profile_pic);
    console.log('Profile pic length:', t.profile_pic ? t.profile_pic.length : 0);
    
    // Use the profile picture utilities to get proper URL
    const profilePicUrl = getProfilePictureUrl(t);
    const initials = getUserInitials(t);
    const avatarColor = getAvatarColor(t);
    
    console.log(`Creating adviser option for ${t.full_name}:`, {
      original_profile_pic: t.profile_pic,
      final_profile_pic_url: profilePicUrl,
      initials: initials,
      avatar_color: avatarColor
    });
    console.log('===============================================');
    
    return {
      value: t.id || t.user_id, 
      label: t.full_name + ' (' + t.email + ')', 
      profile_pic_url: profilePicUrl,
      initials: initials,
      avatar_color: avatarColor,
      name: t.full_name, 
      email: t.email 
    };
  });
  const AdviserOption = (props) => (
    <div {...props.innerProps} style={{ display: 'flex', alignItems: 'center', padding: 8, background: props.isFocused ? '#f6f9fc' : 'white' }}>
      {props.data.profile_pic_url ? (
        <img 
          src={props.data.profile_pic_url} 
          alt={props.data.name} 
          style={{ width: 28, height: 28, borderRadius: '50%', marginRight: 10, objectFit: 'cover' }}
          onError={(e) => {
            // Hide the image and show initials when it fails to load
            e.target.style.display = 'none';
            const initialsDiv = e.target.nextSibling;
            if (initialsDiv) {
              initialsDiv.style.display = 'flex';
            }
          }}
        />
      ) : null}
      <div 
        style={{ 
          width: 28, 
          height: 28, 
          borderRadius: '50%', 
          marginRight: 10, 
          background: props.data.avatar_color,
          color: 'white',
          display: props.data.profile_pic_url ? 'none' : 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: '12px',
          fontWeight: 'bold'
        }}
      >
        {props.data.initials}
      </div>
      <div style={{ display: 'flex', flexDirection: 'column' }}>
        <span style={{ fontWeight: 700, color: '#525F7F', fontSize: '0.74rem', lineHeight: 1 }}>{props.data.name}</span>
        <span style={{ color: '#7b8a9b', fontSize: '0.63rem', fontWeight: 400, marginTop: 1 }}>{props.data.email}</span>
      </div>
    </div>
  );
  const AdviserSingleValue = (props) => (
    <div style={{
      display: 'flex',
      alignItems: 'center',
      borderRadius: 16,
      padding: '6px 0',
      margin: '2px 0',
    }}>
      {props.data.profile_pic_url ? (
        <img 
          src={props.data.profile_pic_url} 
          alt={props.data.name} 
          style={{ width: 24, height: 24, borderRadius: '50%', marginRight: 8, objectFit: 'cover' }}
          onError={(e) => {
            // Hide the image and show initials when it fails to load
            e.target.style.display = 'none';
            const initialsDiv = e.target.nextSibling;
            if (initialsDiv) {
              initialsDiv.style.display = 'flex';
            }
          }}
        />
      ) : null}
      <div 
        style={{ 
          width: 24, 
          height: 24, 
          borderRadius: '50%', 
          marginRight: 8, 
          background: props.data.avatar_color,
          color: 'white',
          display: props.data.profile_pic_url ? 'none' : 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: '10px',
          fontWeight: 'bold'
        }}
      >
        {props.data.initials}
      </div>
      <div style={{ display: 'flex', flexDirection: 'column' }}>
        <span style={{ fontWeight: 700, color: '#525F7F', fontSize: '0.74rem', lineHeight: 1 }}>{props.data.name}</span>
        <span style={{ color: '#7b8a9b', fontSize: '0.63rem', fontWeight: 400, marginTop: 1 }}>{props.data.email}</span>
      </div>
    </div>
  );

  // Custom dropdown indicator to match native select
  const CustomDropdownIndicator = (props) => (
    <components.DropdownIndicator {...props}>
      <svg width="12" height="12" viewBox="0 0 12 12" style={{ display: 'block' }}>
        <polyline points="2.5 4.5 6 8.5 9.5 4.5" stroke="#b5b5c3" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    </components.DropdownIndicator>
  );

  // Floating effect for content over header
  const createSectionStyles = `
    .section-content-container {
      margin-top: -150px;
      z-index: 2;
      position: relative;
    }
    .section-content-card {
      border-radius: 16px;
      box-shadow: 0 8px 32px 0 rgba(31, 38, 135, 0.10);
    }
  `;

  return (
    <>
      <style>{createSectionStyles}</style>
      <style>{`
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
                    <h3 className="mb-0">Create New Section</h3>
                  </Col>
                </Row>
              </CardHeader>
              <CardBody>
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
                            <option value="1st Year">1st Year</option>
                            <option value="2nd Year">2nd Year</option>
                            <option value="3rd Year">3rd Year</option>
                            <option value="4th Year">4th Year</option>
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
                            placeholder="e.g. A, B, C, G"
                            maxLength="1"
                            required
                          />
                          <small className="form-text text-muted">
                            Just enter the section letter (A, B, C, G, etc.)
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
                      <div className="section-preview">
                        <h6>Generated Section Name:</h6>
                        <div className="section-name">{sectionName}</div>
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
                            title="Select Semester"
                          >
                            <option value="">Select Semester</option>
                            {semesterOptions.map(opt => (
                              <option key={opt.value} value={opt.value}>{opt.label}</option>
                            ))}
                          </Input>
                        </FormGroup>
                      </Col>
                      <Col lg="6">
                        <FormGroup>
                          <label className="form-control-label" htmlFor="adviser">Adviser</label>
                          <div
                            title="Select Adviser"
                          >
                            {isLoadingTeachers ? (
                              <div style={{ 
                                height: 44, 
                                display: 'flex', 
                                alignItems: 'center', 
                                padding: '0 16px',
                                background: '#f8f9fa',
                                border: '1px solid #e9ecef',
                                borderRadius: 8,
                                color: '#6c757d'
                              }}>
                                <i className="fas fa-spinner fa-spin mr-2"></i>
                                Loading advisers...
                              </div>
                            ) : (
                              <Select
                                id="adviser"
                                classNamePrefix="react-select"
                                options={adviserOptions}
                                value={adviserOptions.find(opt => String(opt.value) === String(adviser)) || null}
                                onChange={opt => {
                                  setAdviser(opt ? opt.value : '');
                                  // Blur the select after choosing an option
                                  if (adviserInputRef.current) {
                                    adviserInputRef.current.blur();
                                  }
                                }}
                                isClearable
                                isSearchable={false}
                                placeholder="Select Adviser..."
                                styles={{
                                  control: (base, state) => ({
                                    ...base,
                                    minHeight: 44,
                                    height: 44,
                                    borderRadius: 8,
                                    border: state.isFocused
                                      ? '1.5px solid #8ecaff'
                                      : '1.5px solid #e9ecef',
                                    boxShadow: state.isFocused
                                      ? '0 0 10px 3px rgba(142, 202, 255, 0.28)'
                                      : '0 2px 6px rgba(50,50,93,.11), 0 1.5px 0 rgba(0,0,0,.04)',
                                    backgroundColor: '#fff',
                                    fontSize: '1rem',
                                    fontWeight: 400,
                                    color: '#8898aa',
                                    paddingLeft: 16,
                                    paddingRight: 56,
                                    fontFamily: 'inherit',
                                    transition: 'border-color .15s ease-in-out,box-shadow .15s ease-in-out,background 0.18s',
                                    outline: 'none',
                                    appearance: 'none',
                                    position: 'relative',
                                    display: 'flex',
                                    alignItems: 'center',
                                  }),
                                  valueContainer: (base) => ({
                                    ...base,
                                    padding: 0,
                                    paddingLeft: 0,
                                    height: '100%',
                                    display: 'flex',
                                    alignItems: 'center',
                                  }),
                                  input: (base) => ({
                                    ...base,
                                    margin: 0,
                                    padding: 0,
                                  }),
                                  menu: (base) => ({ ...base, zIndex: 9999, borderRadius: 8, marginTop: 2 }),
                                  menuList: (base) => ({ ...base, maxHeight: 160, paddingTop: 0, paddingBottom: 0 }),
                                  option: (base, state) => ({
                                    ...base,
                                    backgroundColor: state.isSelected ? '#eaf4fb' : state.isFocused ? '#f6f9fc' : '#fff',
                                    color: '#222',
                                    fontWeight: 400,
                                    fontSize: '0.89rem',
                                    padding: '8px 12px',
                                    display: 'flex',
                                    alignItems: 'center',
                                  }),
                                  singleValue: (base) => ({
                                    ...base,
                                    display: 'flex',
                                    alignItems: 'center',
                                    color: '#8898aa',
                                    height: '100%',
                                  }),
                                  placeholder: (base) => ({ ...base, color: '#8898aa', fontSize: '0.90rem', fontWeight: 400 }),
                                  indicatorSeparator: () => ({ display: 'none' }),
                                  dropdownIndicator: (base) => ({
                                    ...base,
                                    color: '#b5b5c3',
                                    padding: 0,
                                    width: 12,
                                    height: 44,
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    display: 'flex',
                                    position: 'absolute',
                                    right: 20,
                                    top: '50%',
                                    transform: 'translateY(-50%)',
                                  }),
                                  clearIndicator: (base, state) => ({
                                    ...base,
                                    color: state.isFocused ? '#e74c3c' : '#b0b7c3',
                                    transition: 'color 0.15s',
                                  }),
                                }}
                                components={{
                                  Option: AdviserOption,
                                  SingleValue: AdviserSingleValue,
                                  DropdownIndicator: CustomDropdownIndicator,
                                }}
                                title="Select Adviser"
                              />
                            )}
                          </div>
                        </FormGroup>
                      </Col>
                    </Row>
                    {/* Students Row */}
                    <Row className="align-items-center mb-3">
                      <Col xs="8">
                        <h6 className="heading-small text-muted mb-0">Students ({selectedStudents.length})</h6>
                      </Col>
                      <Col xs="4" className="text-right">
                        <Button color="primary" size="sm" onClick={() => setStudentModal(true)}>
                          Add Students
                        </Button>
                      </Col>
                    </Row>
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
                                  {(() => {
                                    const avatarUrl = getStudentAvatar(s);
                                    const bgColor = getAvatarColor(s);
                                    const initials = getUserInitials(s);
                                    return (
                                      <div style={{ width: 13, height: 13, borderRadius: '50%', marginRight: 3, overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center', background: avatarUrl ? '#e9ecef' : bgColor, color: '#fff', fontWeight: 700, fontSize: 6, border: '1px solid #fff' }}>
                                        {avatarUrl ? (
                                          <img
                                            src={avatarUrl}
                                            alt={s.full_name}
                                            style={{ width: 13, height: 13, borderRadius: '50%', objectFit: 'cover', display: 'block' }}
                                            onError={(e) => {
                                              e.target.style.display = 'none';
                                              if (e.target.nextSibling) e.target.nextSibling.style.display = 'flex';
                                            }}
                                          />
                                        ) : null}
                                        <span style={{ display: avatarUrl ? 'none' : 'flex', width: '100%', height: '100%', alignItems: 'center', justifyContent: 'center' }}>{initials}</span>
                                      </div>
                                    );
                                  })()}
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
                  <div style={{ display: 'flex', justifyContent: 'center', marginTop: 20 }}>
                    <Button color="primary" type="submit" disabled={isSubmitting}>
                      {isSubmitting ? "Saving..." : "Create Section"}
                    </Button>
                  </div>
                  {showSuccess && (
                    <div className="alert alert-success mt-3 mb-0 text-center">
                      Section created successfully!
                    </div>
                  )}
                </Form>
                {/* Student Modal */}
                <Modal isOpen={studentModal} toggle={() => setStudentModal(false)} size="md" centered style={{ borderRadius: 20 }} contentClassName="border-0">
                  <div style={{ borderRadius: 20, background: '#fff', padding: 0, boxShadow: '0 8px 32px rgba(44,62,80,.12)' }}>
                    <ModalHeader toggle={() => setStudentModal(false)} style={{ border: 'none', paddingBottom: 0, fontWeight: 700, fontSize: 18, background: 'transparent' }}>
                      Add Students to Section
                    </ModalHeader>
                    <ModalBody style={{ padding: 0 }}>
                      <div style={{ padding: 24, paddingTop: 12 }}>
                        <InputGroup className={isStudentSearchFocused ? 'focused' : ''} style={{ width: '100%', marginBottom: 18 }}>
                          <InputGroupAddon addonType="prepend">
                            <InputGroupText>
                              <i className="fas fa-search" />
                            </InputGroupText>
                          </InputGroupAddon>
                          <Input
                            className="custom-focus-effect"
                            placeholder="Search students..."
                            value={studentSearch}
                            onChange={e => setStudentSearch(e.target.value)}
                            style={{ minWidth: 0 }}
                            onFocus={() => setIsStudentSearchFocused(true)}
                            onBlur={() => setIsStudentSearchFocused(false)}
                          />
                        </InputGroup>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
                          <span style={{ fontWeight: 600, color: '#222', fontSize: 12 }}>
                            Students ({selectedStudents.length})
                          </span>
                          {(() => {
                            const filtered = filteredStudents;
                            const allSelected = filtered.length > 0 && filtered.every(s => selectedStudents.includes(s.id));
                            return (
                              <button
                                type="button"
                                onClick={() => {
                                  if (allSelected) {
                                    setSelectedStudents([]);
                                  } else {
                                    const allStudentIds = filtered.map(s => s.id);
                                    setSelectedStudents(allStudentIds);
                                  }
                                }}
                                style={{
                                  background: allSelected ? '#f8f9fa' : '#5e72e4',
                                  color: allSelected ? '#6c757d' : 'white',
                                  border: allSelected ? '1px solid #dee2e6' : 'none',
                                  borderRadius: 6,
                                  padding: '6px 12px',
                                  fontSize: 11,
                                  fontWeight: 600,
                                  cursor: 'pointer',
                                  transition: 'all 0.2s ease',
                                  display: 'flex',
                                  alignItems: 'center',
                                  gap: 4
                                }}
                                onMouseEnter={(e) => {
                                  if (allSelected) {
                                    e.target.style.background = '#e9ecef';
                                    e.target.style.borderColor = '#adb5bd';
                                  } else {
                                    e.target.style.background = '#4a5fd1';
                                    e.target.style.transform = 'translateY(-1px)';
                                  }
                                }}
                                onMouseLeave={(e) => {
                                  if (allSelected) {
                                    e.target.style.background = '#f8f9fa';
                                    e.target.style.borderColor = '#dee2e6';
                                  } else {
                                    e.target.style.background = '#5e72e4';
                                    e.target.style.transform = 'translateY(0)';
                                  }
                                }}
                              >
                                {allSelected ? (
                                  <>
                                    <FaTimes size={10} />
                                    Unselect All
                                  </>
                                ) : (
                                  <>
                                    <FaCheck size={10} />
                                    Select All
                                  </>
                                )}
                              </button>
                            );
                          })()}
                        </div>
                        <div style={{ maxHeight: 320, overflowY: 'auto', border: 'none', borderRadius: 12, background: '#f9fafd', padding: '0 16px 0 0', marginBottom: 8 }}>
                          {filteredStudents.length === 0 ? (
                            <div className="text-center text-muted py-5">No students found</div>
                          ) : (
                            filteredStudents.map((s) => (
                              <div
                                key={s.id}
                                className={`student-list-row${selectedStudents.includes(s.id) ? ' selected' : ''}`}
                                onClick={() => handleStudentCheck(s.id)}
                                style={{ display: 'flex', alignItems: 'center', padding: '6px 10px' }}
                              >
                                {(() => {
                                  const avatarUrl = getStudentAvatar(s);
                                  const bgColor = getAvatarColor(s);
                                  const initials = getUserInitials(s);
                                  return (
                                    <div style={{ width: 28, height: 28, borderRadius: '50%', marginRight: 10, overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center', background: avatarUrl ? '#e9ecef' : bgColor, color: '#fff', fontWeight: 700, fontSize: 12, border: '1px solid #e9ecef' }}>
                                      {avatarUrl ? (
                                        <img
                                          src={avatarUrl}
                                          alt={s.full_name}
                                          style={{ width: 28, height: 28, borderRadius: '50%', objectFit: 'cover', display: 'block' }}
                                          onError={(e) => {
                                            e.target.style.display = 'none';
                                            if (e.target.nextSibling) e.target.nextSibling.style.display = 'flex';
                                          }}
                                        />
                                      ) : null}
                                      <span style={{ display: avatarUrl ? 'none' : 'flex', width: '100%', height: '100%', alignItems: 'center', justifyContent: 'center' }}>{initials}</span>
                                    </div>
                                  );
                                })()}
                                <div style={{ flex: 1 }}>
                                  <div style={{ fontWeight: 500, fontSize: '0.97rem', color: '#425466' }}>{s.full_name}</div>
                                  <div style={{ fontSize: '0.85rem', color: '#7b8a9b' }}>{s.email}</div>
                                </div>
                                <div>
                                  {selectedStudents.includes(s.id) ? (
                                    <FaCheck color="#5e72e4" size={16} />
                                  ) : null}
                                </div>
                              </div>
                            ))
                          )}
                        </div>
                        {/* Selected students pills in modal */}
                        <div style={{ minHeight: 50, display: 'flex', flexWrap: 'wrap', gap: 8, alignItems: selectedStudents.length === 0 ? 'center' : 'flex-start', justifyContent: 'center', background: '#f7f8fa', borderRadius: 8, padding: 8, border: '1px solid #e9ecef', marginTop: 12 }}>
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
                                  {(() => {
                                    const avatarUrl = getStudentAvatar(s);
                                    const bgColor = getAvatarColor(s);
                                    const initials = getUserInitials(s);
                                    return (
                                      <div style={{ width: 13, height: 13, borderRadius: '50%', marginRight: 3, overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center', background: avatarUrl ? '#e9ecef' : bgColor, color: '#fff', fontWeight: 700, fontSize: 6, border: '1px solid #fff' }}>
                                        {avatarUrl ? (
                                          <img
                                            src={avatarUrl}
                                            alt={s.full_name}
                                            style={{ width: 13, height: 13, borderRadius: '50%', objectFit: 'cover', display: 'block' }}
                                            onError={(e) => {
                                              e.target.style.display = 'none';
                                              if (e.target.nextSibling) e.target.nextSibling.style.display = 'flex';
                                            }}
                                          />
                                        ) : null}
                                        <span style={{ display: avatarUrl ? 'none' : 'flex', width: '100%', height: '100%', alignItems: 'center', justifyContent: 'center' }}>{initials}</span>
                                      </div>
                                    );
                                  })()}
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
                  </div>
                </Modal>
              </CardBody>
            </Card>
          </Col>
        </Row>
      </Container>
    </>
  );
};

export default CreateSection; 