/*!

=========================================================
* Argon Dashboard React - v1.2.4
=========================================================

* Product Page: https://www.creative-tim.com/product/argon-dashboard-react
* Copyright 2024 Creative Tim (https://www.creative-tim.com)
* Licensed under MIT (https://github.com/creativetimofficial/argon-dashboard-react/blob/master/LICENSE.md)

* Coded by Creative Tim

=========================================================

* The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

*/
import React, { useState, useEffect } from "react";
import Header from "components/Headers/Header.js";
import { useNavigate, useLocation } from "react-router-dom";
import ApiService from '../../services/api';
// reactstrap components
import {
  Alert,
  Badge,
  Button,
  Card,
  CardBody,
  Col,
  Container,
  Input,
  InputGroup,
  InputGroupAddon,
  InputGroupText,
  Modal,
  ModalBody,
  ModalFooter,
  ModalHeader,
  Nav,
  NavItem,
  NavLink,
  Pagination,
  PaginationItem,
  PaginationLink,
  Row,
  Table,
  TabContent,
  TabPane,
  UncontrolledDropdown,
  DropdownToggle,
  DropdownMenu,
  DropdownItem,
  UncontrolledTooltip,
} from "reactstrap";
import LottieLoader from "components/LottieLoader";
import classnames from "classnames";
import userDefault from "../../assets/img/theme/user-default.svg";
import scmsLogo from "../../assets/img/brand/logo-scms.png";
import useMinDelay from "utils/useMinDelay";

// Import jsPDF for PDF export
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

const defaultCoverPhotoSvg =
  "data:image/svg+xml;utf8,<svg width='600' height='240' viewBox='0 0 600 240' fill='none' xmlns='http://www.w3.org/2000/svg'><rect width='600' height='240' fill='%23f7f7f7'/><path d='M0 180 Q150 120 300 180 T600 180 V240 H0 Z' fill='%23e3eafc'/><path d='M0 200 Q200 140 400 200 T600 200 V240 H0 Z' fill='%23cfd8dc' opacity='0.7'/></svg>";

// Floating effect for content over header
const userManagementStyles = `
  .section-content-container {
    margin-top: -150px;
    z-index: 2;
    position: relative;
  }
  .section-content-card {
    border-radius: 16px;
    box-shadow: 0 8px 32px 0 rgba(31, 38, 135, 0.10);
  }
  /* Transparent Header Styles */
  .header-section {
    background: transparent;
    border-radius: 16px;
    padding: 2rem;
    margin-bottom: 2rem;
    box-shadow: none;
  }
  .header-section h1 {
    color: #32325d !important;
    text-shadow: none;
    font-weight: 700;
  }
  .header-section p {
    color: #6c757d !important;
  }
  .header-section .badge {
    background: #f7fafc !important;
    color: #32325d !important;
    border: 1px solid #e9ecef;
    font-weight: 500;
  }
  .header-actions .btn {
    background: #5e72e4 !important;
    border: none !important;
    color: #fff !important;
    font-weight: 600;
    transition: all 0.3s ease;
  }
  .header-actions .btn:hover {
    background: #324cdd !important;
    border: none !important;
    color: #fff !important;
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.10);
  }
  @media (max-width: 768px) {
    .header-section {
      padding: 1.5rem;
    }
    .header-section h1 {
      font-size: 1.75rem;
    }
    .header-section .d-flex {
      flex-direction: column;
      text-align: center;
    }
    .header-actions {
      margin-top: 1rem;
    }
  }
`;

const UserManagement = () => {
  const [searchTerm, setSearchTerm] = useState("");
   const [activeTab, setActiveTab] = useState("admin");
  const [entriesToShow, setEntriesToShow] = useState(10);
  const [sortBy, setSortBy] = useState("created_at"); // Default to 'Recently Added'
  const [sortOrder, setSortOrder] = useState("desc"); // Default to most recent first
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [isMobile, setIsMobile] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const searchParams = new URLSearchParams(location.search);
  const [users, setUsers] = useState([]);
  const [admins, setAdmins] = useState([]);
  const [teachers, setTeachers] = useState([]);
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(false);
  const showLoader = useMinDelay(loading, 1600);
  const [error, setError] = useState(null);
  const [deleteUserId, setDeleteUserId] = useState(null);
  const [deleteUserName, setDeleteUserName] = useState("");
  const [isDeleting, setIsDeleting] = useState(false);
  const [showDeleteSuccess, setShowDeleteSuccess] = useState(false);
  const [showExportSuccess, setShowExportSuccess] = useState(false);
  const [exportMessage, setExportMessage] = useState("");
  const [viewMode, setViewMode] = useState("table");
  const [selectedUser, setSelectedUser] = useState(null);
  const [showUserModal, setShowUserModal] = useState(false);
  const [previewImage, setPreviewImage] = useState(null);
  // Add state for sections
  const [sections, setSections] = useState({});

  useEffect(() => {
    const checkScreenSize = () => {
      setIsMobile(window.innerWidth < 768);
    };
    checkScreenSize();
    window.addEventListener('resize', checkScreenSize);
    return () => window.removeEventListener('resize', checkScreenSize);
  }, []);

  // Function to fetch users and sections
  const fetchUsersAndSections = async () => {
    setLoading(true);
    setError(null);
    
    try {
      // Fetch users for the active tab
      const data = await ApiService.getUsersByRole(activeTab);
      
      let usersArr = [];
      if (Array.isArray(data)) {
        usersArr = data;
      } else if (Array.isArray(data.users)) {
        usersArr = data.users;
      } else if (Array.isArray(data.data)) {
        usersArr = data.data;
      }
      
      // Normalize user fields for consistent frontend usage
      usersArr = usersArr.map(user => {
        const normalizedUser = {
          ...user,
          id: user.id || user.user_id || user.userId || '', // Add ID normalization
          full_name: user.full_name || user.name || '',
          program: user.program || (user.role === 'admin' ? 'Administration' : '') || user.department || '',
          course_year_section: user.course_year_section || user.section || '',
          last_login: user.last_login || user.lastLogin || '',
          profile_pic: user.profile_pic || user.profileImageUrl || user.avatar || '',
          cover_pic: user.cover_pic || user.coverPhotoUrl || '',
          student_num: user.student_num || user.studentNumber || '',
        };
        
        // Log image paths for debugging
        if (normalizedUser.profile_pic || normalizedUser.cover_pic) {
          console.log(`User ${normalizedUser.full_name} (${normalizedUser.id}):`, {
            profile_pic: normalizedUser.profile_pic,
            cover_pic: normalizedUser.cover_pic
          });
        }
        
        return normalizedUser;
      });
      
      // Update the appropriate state based on active tab
      if (activeTab === 'admin') {
        setAdmins(usersArr);
      } else if (activeTab === 'teacher') {
        setTeachers(usersArr);
      } else if (activeTab === 'student') {
        setStudents(usersArr);
      }
      
      // If we're fetching students, also fetch section information
      if (activeTab === 'student') {
        const sectionIds = [...new Set(usersArr.map(user => user.section_id).filter(Boolean))];
        const sectionsData = {};
        
        for (const sectionId of sectionIds) {
          try {
            const sectionData = await ApiService.getSectionById(sectionId);
            if (sectionData && sectionData.data) {
              sectionsData[sectionId] = sectionData.data;
            }
          } catch (error) {
            console.error(`Failed to fetch section ${sectionId}:`, error);
            sectionsData[sectionId] = { name: `Section ${sectionId}`, id: sectionId };
          }
        }
        
        setSections(sectionsData);
      }
      
      setUsers(usersArr);
      setLoading(false);
    } catch (err) {
      setUsers([]); // fallback to empty array on error
      setError(err.message);
      setLoading(false);
    }
  };

  // Initial fetch when component mounts or activeTab changes
  useEffect(() => {
    fetchUsersAndSections();
  }, [activeTab]);

  // Refresh data when component receives focus (e.g., when navigating back from CreateUser)
  useEffect(() => {
    const handleFocus = () => {
      fetchUsersAndSections();
    };

    window.addEventListener('focus', handleFocus);
    
    // Also refresh when the component becomes visible
    const handleVisibilityChange = () => {
      if (!document.hidden) {
        fetchUsersAndSections();
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      window.removeEventListener('focus', handleFocus);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [activeTab]);

  // Check for refresh parameter in URL and trigger refresh
  useEffect(() => {
    const refreshParam = searchParams.get('refresh');
    if (refreshParam === 'true') {
      fetchUsersAndSections();
      // Remove the refresh parameter from URL
      const newSearchParams = new URLSearchParams(location.search);
      newSearchParams.delete('refresh');
      navigate(`${location.pathname}?${newSearchParams.toString()}`, { replace: true });
    }
  }, [location.search]);

  // Function to fetch all user types for export
  const fetchAllUsers = async () => {
    try {
      const [adminData, teacherData, studentData] = await Promise.all([
        ApiService.getUsersByRole('admin'),
        ApiService.getUsersByRole('teacher'),
        ApiService.getUsersByRole('student')
      ]);

      // Normalize and set admin users
      let adminUsers = [];
      if (Array.isArray(adminData)) {
        adminUsers = adminData;
      } else if (Array.isArray(adminData.users)) {
        adminUsers = adminData.users;
      } else if (Array.isArray(adminData.data)) {
        adminUsers = adminData.data;
      }
      adminUsers = adminUsers.map(user => ({
        ...user,
        id: user.id || user.user_id || user.userId || '',
        full_name: user.full_name || user.name || '',
        program: user.program || (user.role === 'admin' ? 'Administration' : '') || user.department || '',
        course_year_section: user.course_year_section || user.section || '',
        last_login: user.last_login || user.lastLogin || '',
        profile_pic: user.profile_pic || user.profileImageUrl || user.avatar || '',
        cover_pic: user.cover_pic || user.coverPhotoUrl || '',
        student_num: user.student_num || user.studentNumber || '',
      }));
      setAdmins(adminUsers);

      // Normalize and set teacher users
      let teacherUsers = [];
      if (Array.isArray(teacherData)) {
        teacherUsers = teacherData;
      } else if (Array.isArray(teacherData.users)) {
        teacherUsers = teacherData.users;
      } else if (Array.isArray(teacherData.data)) {
        teacherUsers = teacherData.data;
      }
      teacherUsers = teacherUsers.map(user => ({
        ...user,
        id: user.id || user.user_id || user.userId || '',
        full_name: user.full_name || user.name || '',
        program: user.program || (user.role === 'admin' ? 'Administration' : '') || user.department || '',
        course_year_section: user.course_year_section || user.section || '',
        last_login: user.last_login || user.lastLogin || '',
        profile_pic: user.profile_pic || user.profileImageUrl || user.avatar || '',
        cover_pic: user.cover_pic || user.coverPhotoUrl || '',
        student_num: user.student_num || user.studentNumber || '',
      }));
      setTeachers(teacherUsers);

      // Normalize and set student users
      let studentUsers = [];
      if (Array.isArray(studentData)) {
        studentUsers = studentData;
      } else if (Array.isArray(studentData.users)) {
        studentUsers = studentData.users;
      } else if (Array.isArray(studentData.data)) {
        studentUsers = studentData.data;
      }
      studentUsers = studentUsers.map(user => ({
        ...user,
        id: user.id || user.user_id || user.userId || '',
        full_name: user.full_name || user.name || '',
        program: user.program || (user.role === 'admin' ? 'Administration' : '') || user.department || '',
        course_year_section: user.course_year_section || user.section || '',
        last_login: user.last_login || user.lastLogin || '',
        profile_pic: user.profile_pic || user.profileImageUrl || user.avatar || '',
        cover_pic: user.cover_pic || user.coverPhotoUrl || '',
        student_num: user.student_num || user.studentNumber || '',
      }));
      setStudents(studentUsers);

      return { admins: adminUsers, teachers: teacherUsers, students: studentUsers };

    } catch (error) {
      console.error('Error fetching all users:', error);
      return { admins: [], teachers: [], students: [] };
    }
  };

  // Filter users based on search term
  const filteredUsers = users.filter(user => {
    const matchesSearch = (user.full_name?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
                         (user.email?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
                         ((user.program || user.course_year_section || '').toLowerCase()).includes(searchTerm.toLowerCase());
    return matchesSearch;
  });

  // Sorting
  const sortedUsers = [...filteredUsers].sort((a, b) => {
    let aValue = a[sortBy];
    let bValue = b[sortBy];
    if (sortBy === "last_login" || sortBy === "created_at") {
      aValue = new Date(aValue);
      bValue = new Date(bValue);
    }
    if (sortOrder === "asc") {
      return aValue > bValue ? 1 : aValue < bValue ? -1 : 0;
    } else {
      return aValue < bValue ? 1 : aValue > bValue ? -1 : 0;
    }
  });

  // Pagination
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedUsers = sortedUsers.slice(startIndex, endIndex);

  const getStatusBadge = (status) => {
    return status === "active" ? (
      <Badge color="success" className="badge-dot mr-4">
        Active
      </Badge>
    ) : (
      <Badge color="danger" className="badge-dot mr-4">
        Inactive
      </Badge>
    );
  };

  const getRoleBadge = (role) => {
    const roleColors = {
      admin: "primary",
      teacher: "info",
      student: "warning"
    };
    const roleNames = {
      admin: "Admin",
      teacher: "Teacher",
      student: "Student"
    };
    return (
      <Badge color={roleColors[role] || "secondary"} className="badge-dot mr-4">
        {roleNames[role] || role}
      </Badge>
    );
  };

  const getRoleBadgeForBlock = (role) => {
    const roleColors = {
      admin: "primary",
      teacher: "info",
      student: "warning"
    };
    const roleNames = {
      admin: "Admin",
      teacher: "Teacher",
      student: "Student"
    };
    return (
      <Badge color={roleColors[role] || "secondary"} className="badge-dot mr-4">
        {roleNames[role] || role}
      </Badge>
    );
  };

  const getPaginationInfo = () => {
    const start = startIndex + 1;
    const end = Math.min(endIndex, sortedUsers.length);
    return `Showing ${start} to ${end} of ${sortedUsers.length} entries`;
  };

  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  const handleItemsPerPageChange = (newItemsPerPage) => {
    setItemsPerPage(newItemsPerPage);
    setCurrentPage(1);
  };

  const handleTabChange = (tab) => {
    setActiveTab(tab);
    setCurrentPage(1);
  };

  const handleDeleteUser = (id, name) => {
    setDeleteUserId(id);
    setDeleteUserName(name);
  };

  const cancelDeleteUser = () => {
    setDeleteUserId(null);
    setDeleteUserName("");
  };

  const confirmDeleteUser = async () => {
    if (!deleteUserId) return;

    setIsDeleting(true);
    try {
      // Use role-specific delete methods based on active tab
      let response;
      if (activeTab === 'admin') {
        response = await ApiService.deleteAdminUser(deleteUserId);
      } else if (activeTab === 'teacher') {
        response = await ApiService.deleteTeacherUser(deleteUserId);
      } else if (activeTab === 'student') {
        response = await ApiService.deleteStudentUser(deleteUserId);
      }
      
      setShowDeleteSuccess(true);
      
      // Refresh the users list
      const data = await ApiService.getUsersByRole(activeTab);
      let usersArr = [];
      if (Array.isArray(data)) {
        usersArr = data;
      } else if (Array.isArray(data.users)) {
        usersArr = data.users;
      } else if (Array.isArray(data.data)) {
        usersArr = data.data;
      }
      usersArr = usersArr.map(user => ({
        ...user,
        id: user.id || user.user_id || user.userId || '', // Add ID normalization
        full_name: user.full_name || user.name || '',
        program: user.program || (user.role === 'admin' ? 'Administration' : '') || user.department || '',
        course_year_section: user.course_year_section || user.section || '',
        last_login: user.last_login || user.lastLogin || '',
        profile_pic: user.profile_pic || user.profileImageUrl || user.avatar || '',
        cover_pic: user.cover_pic || user.coverPhotoUrl || '',
        student_num: user.student_num || user.studentNumber || '',
      }));
      setUsers(usersArr);
      
      setTimeout(() => {
        setShowDeleteSuccess(false);
      }, 3000);
    } catch (error) {
      // Error handling without debug log
    } finally {
      setIsDeleting(false);
      setDeleteUserId(null);
      setDeleteUserName("");
    }
  };

  const getInitialsAvatar = (fullName) => {
    // Generate initials from the full name
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
    
    // Generate a consistent color based on the name
    const colors = ['#f093fb', '#f5576c', '#4facfe', '#00f2fe', '#43e97b', '#38f9d7', '#fa709a', '#fee140', '#a8edea', '#fed6e3'];
    const color = colors[fullName.length % colors.length];
    
    return `https://ui-avatars.com/api/?name=${encodeURIComponent(initials)}&background=${color.substring(1)}&color=fff&size=128&bold=true`;
  };

  const getAvatarForUser = (user) => {
    if (user.profile_pic) {
      let imageUrl;
      
      // If it's a relative path, construct the full URL
      if (user.profile_pic.startsWith('uploads/')) {
        imageUrl = `http://localhost/scms_new_backup/${user.profile_pic}`;
      }
      // If it's already a full URL, return as is
      else if (user.profile_pic.startsWith('http://') || user.profile_pic.startsWith('https://')) {
        imageUrl = user.profile_pic;
      }
      // If it's a base64 data URL, return as is
      else if (user.profile_pic.startsWith('data:')) {
        imageUrl = user.profile_pic;
      }
      // For other cases, try to construct the full URL
      else {
        imageUrl = `http://localhost/scms_new_backup/uploads/profile/${user.profile_pic}`;
      }
      
      console.log(`Avatar URL for ${user.full_name}: ${imageUrl}`);
      return imageUrl;
    }
    // Use initials avatar when no profile picture is available
    return getInitialsAvatar(user.full_name || 'User');
  };

  const getCoverPhotoForUser = (user) => {
    if (user.cover_pic) {
      let imageUrl;
      
      // If it's a relative path, construct the full URL
      if (user.cover_pic.startsWith('uploads/')) {
        imageUrl = `http://localhost/scms_new_backup/${user.cover_pic}`;
      }
      // If it's already a full URL, return as is
      else if (user.cover_pic.startsWith('http://') || user.cover_pic.startsWith('https://')) {
        imageUrl = user.cover_pic;
      }
      // If it's a base64 data URL, return as is
      else if (user.cover_pic.startsWith('data:')) {
        imageUrl = user.cover_pic;
      }
      // For other cases, try to construct the full URL
      else {
        imageUrl = `http://localhost/scms_new_backup/uploads/cover/${user.cover_pic}`;
      }
      
      console.log(`Cover URL for ${user.full_name}: ${imageUrl}`);
      return imageUrl;
    }
    return defaultCoverPhotoSvg;
  };

  const handleUserRowClick = (user) => {
    setSelectedUser(user);
    setShowUserModal(true);
  };

  const closeUserModal = () => {
    setShowUserModal(false);
    setSelectedUser(null);
  };

  // Edit user navigation
  const handleEditUser = (user) => {
    // Navigate to EditUser page with user ID and role
    navigate(`/admin/edit-user/${user.id}?role=${user.role}`);
  };

  // Helper to abbreviate course names
  const getCourseAbbreviation = (course) => {
    if (!course) return '';
    const abbreviations = {
      'Bachelor of Science in Information Technology': 'BSIT',
      'Bachelor of Science in Information Systems': 'BSIS',
      'Bachelor of Science in Computer Science': 'BSCS',
      'Associate in Computer Technology': 'ACT',
      'Information Technology': 'IT',
      'Computer Science': 'CS'
    };
    return abbreviations[course] || course;
  };

  // Add helper function to get section name
  const getSectionName = (user) => {
    if (!user) return 'N/A';
    // Use section_name from the API response if available
    if (user.section_name) {
      return user.section_name;
    }
    // Fallback to section_id if section_name is not available
    if (user.section_id) {
      return `Section ${user.section_id}`;
    }
    return 'N/A';
  };

  // Add helper function to format course and section display
  const getCourseAndSectionDisplay = (user) => {
    if (activeTab !== 'student') {
      return user.program || 'N/A';
    }
    
    // For students, use the section_name directly from the API response
    if (user.section_name) {
      return user.section_name;
    }
    
    // Fallback: Get course abbreviation and try to construct section info
    const courseAbbr = getCourseAbbreviation(user.program);
    const sectionName = getSectionName(user);
    
    // Extract year level and section letter from section name
    let yearLevel = '';
    let sectionLetter = '';
    
    if (sectionName) {
      // Look for patterns like "1st Year A", "2nd Year B", etc.
      const yearMatch = sectionName.match(/(\d+)(?:st|nd|rd|th)\s+Year/);
      if (yearMatch) {
        yearLevel = yearMatch[1];
      }
      
      // Look for section letter at the end
      const letterMatch = sectionName.match(/([A-Z])$/);
      if (letterMatch) {
        sectionLetter = letterMatch[1];
      }
    }
    
    // If we couldn't extract from section name, try to get from section_id
    if (!yearLevel && !sectionLetter && user.section_id) {
      // For section_id like "15", assume it's year 1, section 5
      const sectionId = user.section_id;
      if (sectionId.length >= 2) {
        yearLevel = sectionId[0];
        sectionLetter = String.fromCharCode(64 + parseInt(sectionId.slice(1))); // Convert number to letter (1=A, 2=B, etc.)
      }
    }
    
    // Format: "BSIT 1Z"
    if (courseAbbr && yearLevel && sectionLetter) {
      return `${courseAbbr} ${yearLevel}${sectionLetter}`;
    } else if (courseAbbr && yearLevel) {
      return `${courseAbbr} ${yearLevel}`;
    } else if (courseAbbr) {
      return courseAbbr;
    }
    
    return 'N/A';
  };

  const getColumnHeader = () => {
    return activeTab === "student" ? "Course/Year/Section" : "Program";
  };

  // Export functions
  const exportToCSV = (exportType = 'current', allUsersData = null) => {
    let usersToExport = [];
    let fileName = '';
    
    if (exportType === 'all') {
      // Use passed data if available, otherwise fall back to state
      if (allUsersData) {
        usersToExport = [...allUsersData.admins, ...allUsersData.teachers, ...allUsersData.students];
      } else {
        usersToExport = [...admins, ...teachers, ...students];
      }
      fileName = `SCMS_all_users_${new Date().toISOString().split('T')[0]}.csv`;
    } else {
      usersToExport = sortedUsers;
      fileName = `SCMS_${activeTab}_users_${new Date().toISOString().split('T')[0]}.csv`;
    }

    // Add header with SCMS branding
    const csvHeader = [
      'SCMS - Student Course Management System',
      `Generated on: ${new Date().toLocaleDateString()}`,
      `Total Users: ${usersToExport.length}`,
      `Active Users: ${usersToExport.filter(u => u.status === 'active').length}`,
      `Inactive Users: ${usersToExport.filter(u => u.status === 'inactive').length}`,
      '', // Empty line for spacing
      'Name,Email,Role,Course/Year/Section/Program,Status,Last Login,Contact Number,Address'
    ];

    // Define headers for CSV export
    const headers = [
      'Name',
      'Email', 
      'Role',
      'Course/Year/Section/Program',
      'Status',
      'Last Login',
      'Contact Number',
      'Address'
    ];

    const csvData = usersToExport.map(user => [
      user.full_name || '',
      user.email || '',
      user.role || '',
      getCourseAndSectionDisplay(user),
      user.status || '',
      user.last_login ? new Date(user.last_login).toLocaleDateString() : 'Never',
      user.contact_num || '',
      user.address || ''
    ]);

    // Calculate optimal column widths for CSV
    const calculateCSVColumnWidths = () => {
      const maxWidths = headers.map((header, index) => {
        const maxContentLength = Math.max(
          header.length,
          ...csvData.map(row => (row[index] || '').toString().length)
        );
        return Math.max(maxContentLength, 10); // Minimum width of 10
      });
      return maxWidths;
    };

    const columnWidths = calculateCSVColumnWidths();
    
    // Format CSV with proper spacing and column alignment
    const formatCSVRow = (row) => {
      return row.map((cell, index) => {
        const cellStr = (cell || '').toString();
        // Escape quotes and wrap in quotes
        const escapedCell = cellStr.replace(/"/g, '""');
        return `"${escapedCell}"`;
      }).join(',');
    };

    const csvContent = [
      ...csvHeader,
      ...csvData.map(row => formatCSVRow(row))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', fileName);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const exportToPDF = (exportType = 'current', allUsersData = null) => {
    const doc = new jsPDF();
    
    let usersToExport = [];
    let title = '';
    let fileName = '';
    
    if (exportType === 'all') {
      // Use passed data if available, otherwise fall back to state
      if (allUsersData) {
        usersToExport = [...allUsersData.admins, ...allUsersData.teachers, ...allUsersData.students];
      } else {
        usersToExport = [...admins, ...teachers, ...students];
      }
      title = 'All Users Report';
      fileName = `SCMS_all_users_${new Date().toISOString().split('T')[0]}.pdf`;
    } else {
      usersToExport = sortedUsers;
      title = `${activeTab.charAt(0).toUpperCase() + activeTab.slice(1)} Users Report`;
      fileName = `SCMS_${activeTab}_users_${new Date().toISOString().split('T')[0]}.pdf`;
    }
    
    // Add logo to PDF
    try {
      // Try to add the logo directly first
      doc.addImage(scmsLogo, 'PNG', 14, 10, 30, 15);
    } catch (error) {
      console.log('Direct logo addition failed, trying alternative method');
      try {
        // Alternative: Create a simple text-based logo
        doc.setFontSize(16);
        doc.setTextColor(94, 114, 228); // Blue color
        doc.text('SCMS', 14, 20);
        doc.setFontSize(8);
        doc.text('Logo', 14, 25);
      } catch (innerError) {
        console.log('Logo not available, proceeding without logo');
      }
    }
    
    // Add SCMS branding
    doc.setFontSize(20);
    doc.setTextColor(94, 114, 228); // Blue color
    doc.text('SCMS', 50, 20);
    
    // Add subtitle
    doc.setFontSize(12);
    doc.setTextColor(100, 100, 100);
    doc.text('Student Course Management System', 50, 28);
    
    // Reset text color
    doc.setTextColor(0, 0, 0);
    
    // Add title
    doc.setFontSize(16);
    doc.text(title, 14, 45);
    
    // Add date
    doc.setFontSize(10);
    doc.text(`Generated on: ${new Date().toLocaleDateString()}`, 14, 55);
    
    // Add summary
    doc.setFontSize(9);
    doc.text(`Total Users: ${usersToExport.length}`, 14, 65);
    doc.text(`Active Users: ${usersToExport.filter(u => u.status === 'active').length}`, 14, 71);
    doc.text(`Inactive Users: ${usersToExport.filter(u => u.status === 'inactive').length}`, 14, 77);

    // Prepare table data
    const headers = [
      'Name',
      'Email', 
      'Role',
      'Course/Year/Section/Program',
      'Status',
      'Last Login'
    ];

    const tableData = usersToExport.map(user => [
      user.full_name || '',
      user.email || '',
      user.role || '',
      getCourseAndSectionDisplay(user),
      user.status || '',
      user.last_login ? new Date(user.last_login).toLocaleDateString() : 'Never'
    ]);

    // Calculate column widths based on content
    const calculateColumnWidths = () => {
      const pageWidth = doc.internal.pageSize.width - 28; // 14 margin on each side
      const minWidth = 20;
      const maxWidth = 50;
      
      // Calculate content widths
      const contentWidths = headers.map((header, index) => {
        const maxContentLength = Math.max(
          header.length,
          ...tableData.map(row => (row[index] || '').toString().length)
        );
        return Math.min(Math.max(maxContentLength * 2, minWidth), maxWidth);
      });
      
      // Normalize to fit page width
      const totalWidth = contentWidths.reduce((sum, width) => sum + width, 0);
      const scale = pageWidth / totalWidth;
      
      return contentWidths.map(width => width * scale);
    };

    const columnWidths = calculateColumnWidths();

    // Add table using autoTable with automatic column sizing
    autoTable(doc, {
      head: [headers],
      body: tableData,
      startY: 90,
      styles: {
        fontSize: 8,
        cellPadding: 2
      },
      headStyles: {
        fillColor: [94, 114, 228],
        textColor: 255
      },
      alternateRowStyles: {
        fillColor: [245, 245, 245]
      },
      margin: { top: 90 },
      columnStyles: {
        0: { cellWidth: columnWidths[0] }, // Name
        1: { cellWidth: columnWidths[1] }, // Email
        2: { cellWidth: columnWidths[2] }, // Role
        3: { cellWidth: columnWidths[3] }, // Course/Year/Section/Program
        4: { cellWidth: columnWidths[4] }, // Status
        5: { cellWidth: columnWidths[5] }  // Last Login
      }
    });

    // Save the PDF
    doc.save(fileName);
  };

  const handleExport = async (format, exportType = 'current') => {
    try {
      let allUsersData = null;
      
      // If exporting all users, fetch all user types first
      if (exportType === 'all') {
        allUsersData = await fetchAllUsers();
      }
      
      if (format === 'csv') {
        exportToCSV(exportType, allUsersData);
        setExportMessage(`${exportType === 'all' ? 'All users' : 'Current tab users'} CSV file exported successfully!`);
      } else if (format === 'pdf') {
        exportToPDF(exportType, allUsersData);
        setExportMessage(`${exportType === 'all' ? 'All users' : 'Current tab users'} PDF file exported successfully!`);
      }
      setShowExportSuccess(true);
      setTimeout(() => {
        setShowExportSuccess(false);
        setExportMessage("");
      }, 3000);
    } catch (error) {
      console.error('Export failed:', error);
      setExportMessage('Export failed. Please try again.');
      setShowExportSuccess(true);
      setTimeout(() => {
        setShowExportSuccess(false);
        setExportMessage("");
      }, 3000);
    }
  };

  const renderUserTable = (users, title, color) => {
    return (
      <Card className="shadow">
        <CardBody className="px-0 py-0">
          <div className="table-responsive">
            <Table className="table align-items-center table-flush" responsive>
              <thead className="thead-light">
                <tr>
                  <th scope="col">User</th>
                  <th scope="col">Role</th>
                  <th scope="col">Email</th>
                  <th scope="col">{getColumnHeader()}</th>
                  <th scope="col">Status</th>
                  <th scope="col">Last Login</th>
                  <th scope="col">Actions</th>
                </tr>
              </thead>
              <tbody>
                {users.map((user, index) => (
                  <tr key={user.id || index} style={{ cursor: 'pointer' }} onClick={() => handleUserRowClick(user)}>
                    <th scope="row">
                      <div className="media align-items-center">
                        <div className="avatar-group">
                          <a
                            className="avatar avatar-sm rounded-circle"
                            href="#pablo"
                            onClick={(e) => e.preventDefault()}
                          >
                            <img
                              alt="..."
                              src={getAvatarForUser(user)}
                              onError={(e) => {
                                // Try alternative URL patterns if the first one fails
                                const currentSrc = e.target.src;
                                if (currentSrc.includes('uploads/profile/')) {
                                  // Try without the profile subdirectory
                                  e.target.src = currentSrc.replace('/uploads/profile/', '/uploads/');
                                } else if (currentSrc.includes('/uploads/')) {
                                  // Try with profile subdirectory
                                  e.target.src = currentSrc.replace('/uploads/', '/uploads/profile/');
                                } else {
                                  // Fallback to default avatar
                                  e.target.src = userDefault;
                                }
                              }}
                              onLoad={() => {
                                // Image loaded successfully
                              }}
                            />
                          </a>
                        </div>
                        <div className="media-body ml-4">
                          <span className="mb-0 text-sm font-weight-bold">
                            {user.full_name}
                          </span>
                        </div>
                      </div>
                    </th>
                    <td>{getRoleBadge(user.role)}</td>
                    <td>
                      <div className="d-flex align-items-center">
                        <span className="mr-2">{user.email}</span>
                      </div>
                    </td>
                    <td>
                      <div className="d-flex align-items-center">
                        <span className="mr-2">
                          {getCourseAndSectionDisplay(user)}
                        </span>
                      </div>
                    </td>
                    <td>{getStatusBadge(user.status)}</td>
                    <td>
                      <div className="d-flex align-items-center">
                        <span className="mr-2">
                          {user.last_login 
                            ? new Date(user.last_login).toLocaleDateString()
                            : 'Never'
                          }
                        </span>
                      </div>
                    </td>
                    <td>
                      <div className="d-flex align-items-center">
                        <Button
                          color="info"
                          size="sm"
                          className="mr-2"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleEditUser(user);
                          }}
                        >
                          Edit
                        </Button>
                        <Button
                          color="danger"
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDeleteUser(user.id, user.full_name);
                          }}
                        >
                          Delete
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </Table>
          </div>
        </CardBody>
      </Card>
    );
  };

  const renderUserBlocks = (users, title, color) => {
    return (
      <div className="row">
        {users.map((user, index) => (
          <div key={user.id || index} className="col-lg-4 col-md-6 mb-4">
            <Card className="shadow-sm h-100" style={{ cursor: 'pointer' }} onClick={() => handleUserRowClick(user)}>
              <div className="position-relative">
                <img
                  src={getCoverPhotoForUser(user)}
                  className="card-img-top"
                  alt="Cover"
                  style={{ height: '120px', objectFit: 'cover' }}
                  onError={(e) => {
                    // Try alternative URL patterns if the first one fails
                    const currentSrc = e.target.src;
                    if (currentSrc.includes('uploads/cover/')) {
                      // Try without the cover subdirectory
                      e.target.src = currentSrc.replace('/uploads/cover/', '/uploads/');
                    } else if (currentSrc.includes('/uploads/')) {
                      // Try with cover subdirectory
                      e.target.src = currentSrc.replace('/uploads/', '/uploads/cover/');
                    } else {
                      // Fallback to default cover
                      e.target.src = defaultCoverPhotoSvg;
                    }
                  }}
                />
                <div className="position-absolute" style={{ top: '80px', left: '20px' }}>
                  <img
                    src={getAvatarForUser(user)}
                    className="rounded-circle border border-3 border-white"
                    alt="Profile"
                    style={{ width: '60px', height: '60px', objectFit: 'cover' }}
                    onError={(e) => {
                      // Try alternative URL patterns if the first one fails
                      const currentSrc = e.target.src;
                      if (currentSrc.includes('uploads/profile/')) {
                        // Try without the profile subdirectory
                        e.target.src = currentSrc.replace('/uploads/profile/', '/uploads/');
                      } else if (currentSrc.includes('/uploads/')) {
                        // Try with profile subdirectory
                        e.target.src = currentSrc.replace('/uploads/', '/uploads/profile/');
                      } else {
                        // Fallback to default avatar
                        e.target.src = userDefault;
                      }
                    }}
                  />
                </div>
              </div>
              <CardBody className="pt-5">
                <h6 className="card-title mb-1">{user.full_name}</h6>
                <p className="text-muted small mb-2">{user.email}</p>
                <div className="mb-2">
                  {getRoleBadgeForBlock(user.role)}
                  {getStatusBadge(user.status)}
                </div>
                <p className="text-muted small mb-3">
                  {activeTab === "student" 
                    ? `${getCourseAndSectionDisplay(user)}`
                    : user.program || 'N/A'
                  }
                </p>
                <div className="d-flex justify-content-between align-items-center">
                  <small className="text-muted">
                    Last login: {user.last_login 
                      ? new Date(user.last_login).toLocaleDateString()
                      : 'Never'
                    }
                  </small>
                  <UncontrolledDropdown>
                    <DropdownToggle
                      className="btn-icon-only text-light"
                      href="#pablo"
                      role="button"
                      size="sm"
                      color=""
                      onClick={(e) => e.stopPropagation()}
                    >
                      <i className="fas fa-ellipsis-v" />
                    </DropdownToggle>
                    <DropdownMenu right>
                      <DropdownItem
                        onClick={(e) => {
                          e.stopPropagation();
                          handleEditUser(user);
                        }}
                        className="d-flex align-items-center"
                      >
                        <i className="fas fa-edit mr-2" />
                        Edit
                      </DropdownItem>
                      <DropdownItem
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDeleteUser(user.id, user.full_name);
                        }}
                        className="d-flex align-items-center text-danger"
                      >
                        <i className="fas fa-trash mr-2" />
                        Delete
                      </DropdownItem>
                    </DropdownMenu>
                  </UncontrolledDropdown>
                </div>
              </CardBody>
            </Card>
          </div>
        ))}
      </div>
    );
  };

  return (
    <>
      <style>{userManagementStyles}</style>
      <Header />
      
      {/* Page content */}
      <Container className="mt--7" fluid>
        <div className="section-content-container">
          {/* Enhanced Header Section */}
          <div className="header-section mb-4">
            <div className="d-flex justify-content-between align-items-center">
              <div className="header-content">
                <h1 className="display-4 font-weight-bold text-primary mb-2">
                  <i className="fas fa-users mr-3"></i>
                  User Management
                </h1>
                <p className="text-muted mb-0 fs-5">
                  Manage administrators, teachers, and students across the system
                </p>
                <div className="mt-3">
                  <Badge color="info" className="mr-2">
                    <i className="fas fa-users mr-1"></i>
                    Total: {users.length} users
                  </Badge>
                  <Badge color="success" className="mr-2">
                    <i className="fas fa-check-circle mr-1"></i>
                    Active: {users.filter(u => u.status === 'active').length}
                  </Badge>
                  <Badge color="warning">
                    <i className="fas fa-clock mr-1"></i>
                    Inactive: {users.filter(u => u.status === 'inactive').length}
                  </Badge>
                </div>
              </div>
            </div>
          </div>

          <Card className="section-content-card">
            <CardBody className="px-lg-5 py-lg-5">

              {/* Search and Filters */}
              <Row className="mb-4">
                <Col lg="6">
                  <InputGroup className="input-group-alternative">
                    <InputGroupAddon addonType="prepend">
                      <InputGroupText>
                        <i className="fas fa-search" />
                      </InputGroupText>
                    </InputGroupAddon>
                    <Input
                      placeholder="Search users..."
                      type="text"
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                    />
                  </InputGroup>
                </Col>
                <Col lg="3">
                  <Input
                    type="select"
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value)}
                  >
                    <option value="created_at">Recently Added</option>
                    <option value="full_name">Name</option>
                    <option value="email">Email</option>
                    <option value="last_login">Last Login</option>
                  </Input>
                </Col>
                <Col lg="3">
                  <Input
                    type="select"
                    value={sortOrder}
                    onChange={(e) => setSortOrder(e.target.value)}
                  >
                    <option value="desc">Descending</option>
                    <option value="asc">Ascending</option>
                  </Input>
                </Col>
              </Row>

              {/* Action Buttons */}
              <Row className="mb-4">
                <Col lg="12">
                  <div className="d-flex justify-content-end">
                    <Button
                      color="light"
                      size="sm"
                      className="mr-3"
                      onClick={fetchUsersAndSections}
                      disabled={loading}
                      style={{ 
                        backgroundColor: 'white',
                        border: '1px solid #5e72e4', 
                        color: '#5e72e4',
                        borderRadius: '8px',
                        fontWeight: '500',
                        padding: '8px 16px'
                      }}
                    >
                      <i className={`fas ${loading ? 'fa-spinner fa-spin' : 'fa-sync-alt'} mr-2`} />
                      {loading ? 'Refreshing...' : 'Refresh'}
                    </Button>
                                         <UncontrolledDropdown>
                       <DropdownToggle
                         color="light"
                         size="sm"
                         className="mr-3"
                         style={{ 
                           backgroundColor: 'white',
                           border: '1px solid #5e72e4', 
                           color: '#5e72e4',
                           borderRadius: '8px',
                           fontWeight: '500',
                           padding: '8px 16px'
                         }}
                       >
                         <i className="fas fa-download mr-2" />
                         Export
                       </DropdownToggle>
                       <DropdownMenu right>
                         <DropdownItem header style={{ color: 'black' }}>
                           <i className="fas fa-users mr-2" style={{ color: 'black' }} />
                           Current Tab
                         </DropdownItem>
                         <DropdownItem
                           onClick={() => handleExport('pdf', 'current')}
                           className="d-flex align-items-center"
                         >
                           <i className="fas fa-file-pdf mr-2 text-danger" />
                           Export to PDF
                         </DropdownItem>
                         <DropdownItem
                           onClick={() => handleExport('csv', 'current')}
                           className="d-flex align-items-center"
                         >
                           <i className="fas fa-file-csv mr-2 text-success" />
                           Export to CSV
                         </DropdownItem>
                         <DropdownItem divider />
                         <DropdownItem header style={{ color: 'black' }}>
                           <i className="fas fa-globe mr-2" style={{ color: 'black' }} />
                           All Users
                         </DropdownItem>
                         <DropdownItem
                           onClick={() => handleExport('pdf', 'all')}
                           className="d-flex align-items-center"
                         >
                           <i className="fas fa-file-pdf mr-2 text-danger" />
                           Export All to PDF
                         </DropdownItem>
                         <DropdownItem
                           onClick={() => handleExport('csv', 'all')}
                           className="d-flex align-items-center"
                         >
                           <i className="fas fa-file-csv mr-2 text-success" />
                           Export All to CSV
                         </DropdownItem>
                       </DropdownMenu>
                     </UncontrolledDropdown>
                    <Button
                      color="primary"
                      size="sm"
                      onClick={() => navigate('/admin/create-user')}
                      style={{
                        backgroundColor: '#5e72e4',
                        border: '1px solid #5e72e4',
                        color: 'white',
                        borderRadius: '8px',
                        fontWeight: '500',
                        padding: '8px 16px'
                      }}
                    >
                      <i className="fas fa-plus mr-2" />
                      Add New User
                    </Button>
                  </div>
                </Col>
              </Row>

              {/* View Mode Toggle */}
              <div className="d-flex justify-content-between align-items-center mb-3">
                <div>
                  <Button
                    color={viewMode === "table" ? "primary" : "secondary"}
                    size="sm"
                    className="mr-2"
                    onClick={() => setViewMode("table")}
                  >
                    <i className="fas fa-table mr-1" />
                    Table
                  </Button>
                  <Button
                    color={viewMode === "blocks" ? "primary" : "secondary"}
                    size="sm"
                    onClick={() => setViewMode("blocks")}
                  >
                    <i className="fas fa-th-large mr-1" />
                    Cards
                  </Button>
                </div>
                <div className="text-muted small">
                  {getPaginationInfo()}
                </div>
              </div>

              {/* Role Tabs */}
              <Nav tabs className="nav-fill flex-column flex-md-row">
                <NavItem>
                  <NavLink
                    className={classnames("py-2 px-3", {
                      active: activeTab === "admin"
                    })}
                    onClick={() => handleTabChange("admin")}
                    style={{ cursor: "pointer" }}
                  >
                    <i className="fas fa-user-shield mr-2" />
                    Admins
                  </NavLink>
                </NavItem>
                <NavItem>
                  <NavLink
                    className={classnames("py-2 px-3", {
                      active: activeTab === "teacher"
                    })}
                    onClick={() => handleTabChange("teacher")}
                    style={{ cursor: "pointer" }}
                  >
                    <i className="fas fa-chalkboard-teacher mr-2" />
                    Teachers
                  </NavLink>
                </NavItem>
                <NavItem>
                  <NavLink
                    className={classnames("py-2 px-3", {
                      active: activeTab === "student"
                    })}
                    onClick={() => handleTabChange("student")}
                    style={{ cursor: "pointer" }}
                  >
                    <i className="fas fa-user-graduate mr-2" />
                    Students
                  </NavLink>
                </NavItem>
              </Nav>

              {/* Content */}
              <TabContent activeTab={activeTab} className="mt-4">
                <TabPane tabId={activeTab}>
                  {showLoader ? (
                    <div className="py-5" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <LottieLoader message="Loading users..." width={150} height={150} centered minHeight={'60vh'} desiredDurationSec={1.4} />
                    </div>
                  ) : error ? (
                    <Alert color="danger">
                      <i className="fas fa-exclamation-triangle mr-2" />
                      {error}
                    </Alert>
                  ) : paginatedUsers.length === 0 ? (
                    <div className="text-center py-5">
                      <i className="fas fa-users fa-3x text-muted mb-3" />
                      <h5 className="text-muted">No users found</h5>
                      <p className="text-muted">Try adjusting your search or filters</p>
                    </div>
                  ) : (
                    <>
                      {viewMode === "table" 
                        ? renderUserTable(paginatedUsers, `${activeTab.charAt(0).toUpperCase() + activeTab.slice(1)}s`, "primary")
                        : renderUserBlocks(paginatedUsers, `${activeTab.charAt(0).toUpperCase() + activeTab.slice(1)}s`, "primary")
                      }
                      
                      {/* Pagination */}
                      {sortedUsers.length > itemsPerPage && (
                        <div className="d-flex justify-content-center mt-4">
                          <Pagination>
                            <PaginationItem disabled={currentPage === 1}>
                              <PaginationLink
                                first
                                href="#pablo"
                                onClick={(e) => {
                                  e.preventDefault();
                                  handlePageChange(1);
                                }}
                              />
                            </PaginationItem>
                            <PaginationItem disabled={currentPage === 1}>
                              <PaginationLink
                                href="#pablo"
                                onClick={(e) => {
                                  e.preventDefault();
                                  handlePageChange(currentPage - 1);
                                }}
                              >
                                <i className="fa fa-angle-left" />
                                <span className="sr-only">Previous</span>
                              </PaginationLink>
                            </PaginationItem>
                            
                            {Array.from({ length: Math.ceil(sortedUsers.length / itemsPerPage) }, (_, i) => i + 1)
                              .filter(page => page === 1 || page === Math.ceil(sortedUsers.length / itemsPerPage) || 
                                (page >= currentPage - 2 && page <= currentPage + 2))
                              .map((page, index, array) => (
                                <React.Fragment key={page}>
                                  {index > 0 && array[index - 1] !== page - 1 && (
                                    <PaginationItem disabled>
                                      <PaginationLink href="#pablo">...</PaginationLink>
                                    </PaginationItem>
                                  )}
                                  <PaginationItem active={page === currentPage}>
                                    <PaginationLink
                                      href="#pablo"
                                      onClick={(e) => {
                                        e.preventDefault();
                                        handlePageChange(page);
                                      }}
                                    >
                                      {page}
                                    </PaginationLink>
                                  </PaginationItem>
                                </React.Fragment>
                              ))}
                            
                            <PaginationItem disabled={currentPage === Math.ceil(sortedUsers.length / itemsPerPage)}>
                              <PaginationLink
                                href="#pablo"
                                onClick={(e) => {
                                  e.preventDefault();
                                  handlePageChange(currentPage + 1);
                                }}
                              >
                                <i className="fa fa-angle-right" />
                                <span className="sr-only">Next</span>
                              </PaginationLink>
                            </PaginationItem>
                            <PaginationItem disabled={currentPage === Math.ceil(sortedUsers.length / itemsPerPage)}>
                              <PaginationLink
                                last
                                href="#pablo"
                                onClick={(e) => {
                                  e.preventDefault();
                                  handlePageChange(Math.ceil(sortedUsers.length / itemsPerPage));
                                }}
                              />
                            </PaginationItem>
                          </Pagination>
                        </div>
                      )}
                    </>
                  )}
                </TabPane>
              </TabContent>
            </CardBody>
          </Card>
        </div>
      </Container>

      {/* User Detail Modal */}
      <Modal isOpen={showUserModal} toggle={closeUserModal} size="lg" centered>
        <ModalHeader toggle={closeUserModal}>
          <h4 className="mb-0">User Details</h4>
        </ModalHeader>
        <ModalBody className="text-center">
          {selectedUser && (
            <div>
                             <div className="position-relative mb-4">
                 <img
                   src={getCoverPhotoForUser(selectedUser)}
                   alt="Cover"
                   className="img-fluid rounded"
                   style={{ width: '100%', height: '200px', objectFit: 'cover' }}
                   onError={(e) => {
                     // Try alternative URL patterns if the first one fails
                     const currentSrc = e.target.src;
                     if (currentSrc.includes('uploads/cover/')) {
                       // Try without the cover subdirectory
                       e.target.src = currentSrc.replace('/uploads/cover/', '/uploads/');
                     } else if (currentSrc.includes('/uploads/')) {
                       // Try with cover subdirectory
                       e.target.src = currentSrc.replace('/uploads/', '/uploads/cover/');
                     } else {
                       // Fallback to default cover
                       e.target.src = defaultCoverPhotoSvg;
                     }
                   }}
                 />
                 <div className="position-absolute" style={{ top: '150px', left: '50%', transform: 'translateX(-50%)' }}>
                   <img
                     src={getAvatarForUser(selectedUser)}
                     alt="Profile"
                     className="rounded-circle border border-4"
                     style={{ 
                       width: '100px', 
                       height: '100px', 
                       objectFit: 'cover',
                       borderColor: '#343a40'
                     }}
                     onError={(e) => {
                       // Try alternative URL patterns if the first one fails
                       const currentSrc = e.target.src;
                       if (currentSrc.includes('uploads/profile/')) {
                         // Try without the profile subdirectory
                         e.target.src = currentSrc.replace('/uploads/profile/', '/uploads/');
                       } else if (currentSrc.includes('/uploads/')) {
                         // Try with profile subdirectory
                         e.target.src = currentSrc.replace('/uploads/', '/uploads/profile/');
                       } else {
                         // Fallback to default avatar
                         e.target.src = userDefault;
                       }
                     }}
                   />
                 </div>
               </div>
               
               <div style={{ marginTop: '60px' }}>
                 <h3 className="mb-2">{selectedUser.full_name}</h3>
                 <p className="text-muted mb-3">{selectedUser.email}</p>
               </div>
              
              <div className="row text-left">
                <div className="col-md-6">
                  <p><strong>Role:</strong> {getRoleBadge(selectedUser.role)}</p>
                  <p><strong>Status:</strong> {getStatusBadge(selectedUser.status)}</p>
                  <p><strong>Program:</strong> {selectedUser.program || 'N/A'}</p>
                </div>
                <div className="col-md-6">
                  <p><strong>Contact:</strong> {selectedUser.contact_num || 'N/A'}</p>
                  <p><strong>Address:</strong> {selectedUser.address || 'N/A'}</p>
                  <p><strong>Last Login:</strong> {selectedUser.last_login 
                    ? new Date(selectedUser.last_login).toLocaleString()
                    : 'Never'
                  }</p>
                </div>
              </div>
              
              {selectedUser.role === 'student' && (
                <div className="mt-3">
                  <p><strong>Student Number:</strong> {selectedUser.student_num || 'N/A'}</p>
                  <p><strong>Section:</strong> {getSectionName(selectedUser)}</p>
                </div>
              )}
            </div>
          )}
        </ModalBody>
        <ModalFooter>
          <Button color="secondary" onClick={closeUserModal}>
            Close
          </Button>
        </ModalFooter>
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal isOpen={!!deleteUserId} toggle={cancelDeleteUser} centered>
        <ModalHeader toggle={cancelDeleteUser}>
          <h4 className="mb-0">Confirm Delete</h4>
        </ModalHeader>
        <ModalBody className="text-center">
          <i className="fas fa-exclamation-triangle fa-3x text-warning mb-3" />
          <h5>Are you sure you want to delete this user?</h5>
          <p className="text-muted">
            This action cannot be undone. The user "{deleteUserName}" will be permanently removed from the system.
          </p>
        </ModalBody>
        <ModalFooter>
          <Button color="secondary" onClick={cancelDeleteUser} disabled={isDeleting}>
            Cancel
          </Button>
          <Button color="danger" onClick={confirmDeleteUser} disabled={isDeleting}>
            {isDeleting ? (
              <>
                <i className="fa fa-spinner fa-spin mr-2"></i>
                Deleting...
              </>
            ) : (
              'Delete User'
            )}
          </Button>
        </ModalFooter>
      </Modal>

             {/* Delete Success Alert */}
       {showDeleteSuccess && (
         <div className="position-fixed" style={{ top: '20px', right: '20px', zIndex: 9999 }}>
           <Alert color="success" className="mb-0">
             <i className="fas fa-check-circle mr-2" />
             User deleted successfully!
           </Alert>
         </div>
       )}

       {/* Export Success Alert */}
       {showExportSuccess && (
         <div className="position-fixed" style={{ top: '20px', right: '20px', zIndex: 9999 }}>
           <Alert color="success" className="mb-0">
             <i className="fas fa-download mr-2" />
             {exportMessage}
           </Alert>
         </div>
       )}
    </>
  );
};

export default UserManagement;