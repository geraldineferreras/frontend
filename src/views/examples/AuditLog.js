import React, { useState, useEffect } from "react";
import {
  Card,
  CardBody,
  Container,
  Row,
  Col,
  Table,
  Badge,
  Button,
  Input,
  InputGroup,
  InputGroupAddon,
  InputGroupText,
  FormGroup,
  Label,
  UncontrolledDropdown,
  DropdownToggle,
  DropdownMenu,
  DropdownItem,
  Pagination,
  PaginationItem,
  PaginationLink,
  Spinner,
  Nav,
  NavItem,
  NavLink,
  Dropdown,
  Alert,
  Modal,
  ModalHeader,
  ModalBody,
  ModalFooter,
} from "reactstrap";
import Header from "components/Headers/Header.js";
import classnames from "classnames";
import api from "services/api.js";

const AuditLog = () => {
  const [auditData, setAuditData] = useState([]);
  const [filteredData, setFilteredData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const [selectedModule, setSelectedModule] = useState("");
  const [dateRange, setDateRange] = useState({ start: "", end: "" });
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [sortKey, setSortKey] = useState("");
  const [sortDirection, setSortDirection] = useState("asc");
  const [activeCourseTab, setActiveCourseTab] = useState("bsit");
  const [moduleDropdownOpen, setModuleDropdownOpen] = useState(false);
  const [availableModules, setAvailableModules] = useState([]);
  const [totalItems, setTotalItems] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [userProfiles, setUserProfiles] = useState({}); // Store user profile data
  const [profileLoading, setProfileLoading] = useState(true); // Track profile loading state
  const [selectedAuditLog, setSelectedAuditLog] = useState(null); // Selected audit log for modal
  const [isModalOpen, setIsModalOpen] = useState(false); // Modal open state
  const [selectedRoleTab, setSelectedRoleTab] = useState("all"); // New state for role-specific tabs

  // Fetch user profile data
  const fetchUserProfile = async (userId, role) => {
    try {
      if (!userId || !role) return null;
      
      console.log(`Fetching profile for user ${userId} with role ${role}`);
      const userData = await api.getUserById(userId, role);
      console.log('User profile data:', userData);
      return userData;
    } catch (error) {
      console.error(`Error fetching user profile for ${userId}:`, error);
      return null;
    }
  };

  // Fetch user profile by username (fallback method)
  const fetchUserProfileByUsername = async (username, role) => {
    try {
      if (!username || !role) return null;
      
      console.log(`Fetching profile for username ${username} with role ${role}`);
      // Try to get all users of this role and find the one with matching username
      const usersResponse = await api.getUsersByRole(role);
      if (usersResponse && usersResponse.data) {
        const users = Array.isArray(usersResponse.data) ? usersResponse.data : [usersResponse.data];
        const user = users.find(u => 
          u.username === username || 
          u.full_name === username || 
          u.name === username ||
          u.email === username
        );
        if (user) {
          console.log('Found user by username:', user);
          return user;
        }
      }
      return null;
    } catch (error) {
      console.error(`Error fetching user profile by username ${username}:`, error);
      return null;
    }
  };

  // Generate user initials for fallback avatar
  const getUserInitials = (userName) => {
    if (!userName) return 'U';
    
    const names = userName.split(' ');
    if (names.length >= 2) {
      return (names[0].charAt(0) + names[names.length - 1].charAt(0)).toUpperCase();
    }
    return userName.charAt(0).toUpperCase();
  };

  // Get profile picture URL for a user
  const getProfilePictureUrl = (user) => {
    console.log('Getting profile picture for user:', user);
    
    if (!user || !user.profile_pic) {
      console.log('No profile picture found, using default');
      // Return default avatar if no profile picture
      return "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face";
    }

    let imageUrl;
    
    // If it's a relative path, construct the full URL
    if (user.profile_pic.startsWith('uploads/')) {
      imageUrl = `${process.env.REACT_APP_API_BASE_URL || 'https://scms-backend.up.railway.app'}/${user.profile_pic}`;
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
      imageUrl = `${process.env.REACT_APP_API_BASE_URL || 'https://scms-backend.up.railway.app'}/uploads/profile/${user.profile_pic}`;
    }
    
    console.log(`Profile picture URL: ${imageUrl}`);
    return imageUrl;
  };

  // Fetch audit logs from API
  const fetchAuditLogs = async (filters = {}) => {
    try {
      setLoading(true);
      setError(null);
      
      const apiFilters = {
        ...filters,
        limit: itemsPerPage,
        offset: (currentPage - 1) * itemsPerPage,
        sortBy: sortKey,
        sortOrder: sortDirection,
      };

      let response;
      switch (selectedRoleTab) {
        case "admin":
          response = await api.getAdminAuditLogs(apiFilters);
          break;
        case "teacher":
          response = await api.getTeacherAuditLogs(apiFilters);
          break;
        case "student":
          response = await api.getStudentAuditLogs(apiFilters);
          break;
        default:
          response = await api.getAuditLogs(apiFilters);
          break;
      }
      
      console.log('API Response:', response); // Debug log
      
      // Handle different response structures
      let dataArray = [];
      let totalCount = 0;
      
      if (response) {
        // Check if response.data is an array
        if (Array.isArray(response.data)) {
          dataArray = response.data;
          totalCount = response.total || response.data.length;
        } 
        // Check if response is directly an array
        else if (Array.isArray(response)) {
          dataArray = response;
          totalCount = response.length;
        }
        // Check if response has a different structure
        else if (response.data && typeof response.data === 'object') {
          // If data is an object with properties, try to find the array
          if (response.data.records && Array.isArray(response.data.records)) {
            dataArray = response.data.records;
            totalCount = response.data.total || response.data.records.length;
          } else if (response.data.items && Array.isArray(response.data.items)) {
            dataArray = response.data.items;
            totalCount = response.data.total || response.data.items.length;
          } else if (response.data.logs && Array.isArray(response.data.logs)) {
            dataArray = response.data.logs;
            totalCount = response.data.total || response.data.logs.length;
          } else {
            // If data is an object but not an array, try to convert it
            console.warn('Response data is not an array:', response.data);
            dataArray = [];
            totalCount = 0;
          }
        }
        // If response is empty or null
        else {
          console.warn('Empty or invalid response:', response);
          dataArray = [];
          totalCount = 0;
        }
      }
      
      if (dataArray.length > 0) {
        // Transform the data to handle object responses
        const transformedData = dataArray.map(item => {
          console.log('Processing audit log item:', item);
          
          // Handle role extraction
          let role = 'Unknown';
          if (item.role) {
            if (typeof item.role === 'object') {
              role = item.role.name || item.role.user_role || item.role.role || 'Unknown';
            } else {
              role = item.role;
            }
          } else if (item.user_role) {
            role = item.user_role;
          } else if (item.user_type) {
            role = item.user_type;
          }

          // Extract user ID for profile fetching - try multiple possible fields
          let userId = null;
          if (item.user_id) {
            userId = item.user_id;
          } else if (item.user && typeof item.user === 'object' && item.user.id) {
            userId = item.user.id;
          } else if (item.user_id_num) {
            userId = item.user_id_num;
          } else if (item.id && item.user) {
            // If we have a user name, we might need to fetch by name instead of ID
            userId = item.id;
          }

          console.log(`Extracted userId: ${userId}, role: ${role}`);

          // Handle details for login/logout actions
          let details = item.details || item.description || item.message || item.log_details || 'No details available';
          if (item.action && (item.action.toLowerCase().includes('logged in') || item.action.toLowerCase().includes('logged out'))) {
            details = item.action.toLowerCase().includes('logged in') ? 'User logged in' : 'User logged out';
          } else if (details && (details.toLowerCase().includes('logged in') || details.toLowerCase().includes('logged out'))) {
            // Remove IP information from details
            if (details.toLowerCase().includes('logged in')) {
              details = 'User logged in';
            } else if (details.toLowerCase().includes('logged out')) {
              details = 'User logged out';
            }
          }

          return {
            id: item.id || item.log_id || Math.random().toString(36).substr(2, 9),
            user: item.user || item.user_name || item.username || item.user_id || 'Unknown User',
            userId: userId,
            role: role,
            action: item.action || item.activity || item.action_type || 'Unknown Action',
            module: typeof item.module === 'object' ? item.module?.name || item.module?.module || 'Unknown Module' : item.module || 'Unknown Module',
            details: details,
            timestamp: item.timestamp || item.created_at || item.date || item.log_date || 'Unknown',
          };
        });
        
        setAuditData(transformedData);
        setFilteredData(transformedData);
        setTotalItems(totalCount);
        setTotalPages(Math.ceil(totalCount / itemsPerPage));

        // Fetch all users first, then match profiles
        const allUsers = await fetchAllUsers();
        
        // Match users from audit log with profile data
        const userProfileMap = {};
        transformedData.forEach(item => {
          if (item.user && item.role && item.role !== 'Unknown') {
            const matchedUser = findUserByUsername(item.user, item.role, allUsers);
            if (matchedUser) {
              userProfileMap[item.user] = matchedUser;
            }
          }
        });

        console.log('User profile map:', userProfileMap);
        setUserProfiles(userProfileMap);
        setProfileLoading(false); // Mark profiles as loaded
      } else {
        setAuditData([]);
        setFilteredData([]);
        setTotalItems(0);
        setTotalPages(0);
      }
    } catch (err) {
      console.error('Error fetching audit logs:', err);
      setError(err.message || 'Failed to fetch audit logs');
      setAuditData([]);
      setFilteredData([]);
    } finally {
      setLoading(false);
    }
  };

  // Fetch available modules and roles
  const fetchFilterOptions = async () => {
    try {
      const modulesResponse = await api.getAuditLogModules();

      console.log('Modules Response:', modulesResponse); // Debug log

      // Transform modules data
      let modules = [];
      if (modulesResponse) {
        let modulesData = [];
        
        // Handle different response structures for modules
        if (Array.isArray(modulesResponse.data)) {
          modulesData = modulesResponse.data;
        } else if (Array.isArray(modulesResponse)) {
          modulesData = modulesResponse;
        } else if (modulesResponse.data && typeof modulesResponse.data === 'object') {
          if (modulesResponse.data.modules && Array.isArray(modulesResponse.data.modules)) {
            modulesData = modulesResponse.data.modules;
          } else if (modulesResponse.data.items && Array.isArray(modulesResponse.data.items)) {
            modulesData = modulesResponse.data.items;
          } else {
            modulesData = [];
          }
        }
        
        modules = modulesData.map(module => 
          typeof module === 'object' ? module.name || module.module || 'Unknown' : module
        );
      }
      
      setAvailableModules(modules.length > 0 ? modules : [
        "User Management",
        "Section Management",
        "Grades Management",
        "Reports & Logs",
        "Authentication",
      ]);
    } catch (err) {
      console.error('Error fetching filter options:', err);
      // Use default values if API fails
      setAvailableModules([
        "User Management",
        "Section Management",
        "Grades Management",
        "Reports & Logs",
        "Authentication",
      ]);
    }
  };

  // Fetch all users for profile matching
  const fetchAllUsers = async () => {
    try {
      const [adminUsers, teacherUsers, studentUsers] = await Promise.all([
        api.getUsersByRole('admin'),
        api.getUsersByRole('teacher'),
        api.getUsersByRole('student')
      ]);

      const allUsers = [];
      
      // Process admin users
      if (adminUsers && adminUsers.data) {
        const admins = Array.isArray(adminUsers.data) ? adminUsers.data : [adminUsers.data];
        allUsers.push(...admins.map(user => ({ ...user, role: 'admin' })));
      }
      
      // Process teacher users
      if (teacherUsers && teacherUsers.data) {
        const teachers = Array.isArray(teacherUsers.data) ? teacherUsers.data : [teacherUsers.data];
        allUsers.push(...teachers.map(user => ({ ...user, role: 'teacher' })));
      }
      
      // Process student users
      if (studentUsers && studentUsers.data) {
        const students = Array.isArray(studentUsers.data) ? studentUsers.data : [studentUsers.data];
        allUsers.push(...students.map(user => ({ ...user, role: 'student' })));
      }

      console.log('All users fetched:', allUsers);
      return allUsers;
    } catch (error) {
      console.error('Error fetching all users:', error);
      return [];
    }
  };

  // Find user by username from all users
  const findUserByUsername = (username, role, allUsers) => {
    if (!username || !allUsers || allUsers.length === 0) return null;
    
    // Try to find exact match first
    let user = allUsers.find(u => 
      (u.username === username || u.full_name === username || u.name === username || u.email === username) &&
      u.role === role
    );
    
    // If no exact match, try partial match
    if (!user) {
      user = allUsers.find(u => 
        (u.username && u.username.toLowerCase().includes(username.toLowerCase())) ||
        (u.full_name && u.full_name.toLowerCase().includes(username.toLowerCase())) ||
        (u.name && u.name.toLowerCase().includes(username.toLowerCase())) ||
        (u.email && u.email.toLowerCase().includes(username.toLowerCase()))
      );
    }
    
    console.log(`Found user for ${username} (${role}):`, user);
    return user;
  };

  // Initial data fetch
  useEffect(() => {
    fetchFilterOptions();
    fetchAuditLogs();
    setProfileLoading(true); // Start with loading state
  }, []);

  // Refetch data when filters change
  useEffect(() => {
    const filters = {};
    if (selectedModule) filters.module = selectedModule;
    if (dateRange.start) filters.dateFrom = dateRange.start;
    if (dateRange.end) filters.dateTo = dateRange.end;
    if (searchTerm) filters.search = searchTerm;

    fetchAuditLogs(filters);
  }, [selectedModule, selectedRoleTab, dateRange, searchTerm, currentPage, itemsPerPage, sortKey, sortDirection]);

  const filterData = () => {
    // This function is now handled by the API, but we keep it for client-side search if needed
    let filtered = auditData;

    // Search filter (client-side fallback)
    if (searchTerm) {
      filtered = filtered.filter(
        (item) =>
          (item.user && item.user.toLowerCase().includes(searchTerm.toLowerCase())) ||
          (item.action && item.action.toLowerCase().includes(searchTerm.toLowerCase())) ||
          (item.module && item.module.toLowerCase().includes(searchTerm.toLowerCase())) ||
          (item.details && item.details.toLowerCase().includes(searchTerm.toLowerCase()))
      );
    }

    setFilteredData(filtered);
  };

  const getActionBadge = (action) => {
    if (!action) return <Badge color="secondary">Unknown</Badge>;
    
    switch (action.toLowerCase()) {
      case "added user":
      case "created section":
      case "create":
        return <Badge color="success">{action}</Badge>;
      case "deleted user":
      case "deleted section":
      case "delete":
        return <Badge color="danger">{action}</Badge>;
      case "updated grades":
      case "modified user":
      case "update":
      case "modify":
        return <Badge color="warning">{action}</Badge>;
      case "logged in":
      case "logged out":
      case "login":
      case "logout":
        return <Badge color="info">{action}</Badge>;
      case "exported report":
      case "accessed logs":
      case "export":
      case "access":
        return <Badge color="primary" style={{ color: '#ffffff' }}>{action}</Badge>;
      default:
        return <Badge color="secondary">{action}</Badge>;
    }
  };

  const getModuleBadge = (module) => {
    if (!module) return <Badge color="light" outline="true">Unknown</Badge>;
    
    switch (module.toLowerCase()) {
      case 'user management':
        return <Badge color="primary" outline="true" style={{ color: '#5e72e4' }}>{module}</Badge>;
      case 'section management':
        return <Badge color="success" outline="true">{module}</Badge>;
      case 'attendance':
        return <Badge color="warning" outline="true">{module}</Badge>;
      case 'grades':
      case 'grades management':
        return <Badge color="info" outline="true">{module}</Badge>;
      case 'announcements':
        return <Badge color="secondary" outline="true">{module}</Badge>;
      default:
        return <Badge color="light" outline="true">{module}</Badge>;
    }
  };

  const formatTimestamp = (timestamp) => {
    if (!timestamp) return 'Unknown';
    const date = new Date(timestamp);
    return date.toLocaleString();
  };

  const handleSort = (key) => {
    if (sortKey === key) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      setSortKey(key);
      setSortDirection("asc");
    }
  };

  const getSortIndicator = (key) => {
    if (sortKey === key) {
      return sortDirection === "asc" ? " ↑" : " ↓";
    }
    return "";
  };

  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  const handleItemsPerPageChange = (e) => {
    setItemsPerPage(parseInt(e.target.value));
    setCurrentPage(1);
  };

  const exportToCSV = async () => {
    try {
      const filters = {};
      if (selectedModule) filters.module = selectedModule;
      if (dateRange.start) filters.dateFrom = dateRange.start;
      if (dateRange.end) filters.dateTo = dateRange.end;
      if (searchTerm) filters.search = searchTerm;

      let response;
      switch (selectedRoleTab) {
        case "admin":
          response = await api.exportAdminAuditLogs(filters);
          break;
        case "teacher":
          response = await api.exportTeacherAuditLogs(filters);
          break;
        case "student":
          response = await api.exportStudentAuditLogs(filters);
          break;
        default:
          response = await api.exportAuditLogs(filters);
          break;
      }
      
      if (response && response.data) {
        // Transform the export data to handle object responses
        const transformedExportData = response.data.map(item => {
          // Handle role extraction
          let role = 'Unknown';
          if (item.role) {
            if (typeof item.role === 'object') {
              role = item.role.name || item.role.user_role || item.role.role || 'Unknown';
            } else {
              role = item.role;
            }
          } else if (item.user_role) {
            role = item.user_role;
          } else if (item.user_type) {
            role = item.user_type;
          }

          // Handle details for login/logout actions
          let details = item.details || item.description || item.message || 'No details available';
          if (item.action && (item.action.toLowerCase().includes('logged in') || item.action.toLowerCase().includes('logged out'))) {
            details = item.action.toLowerCase().includes('logged in') ? 'User logged in' : 'User logged out';
          } else if (details && (details.toLowerCase().includes('logged in') || details.toLowerCase().includes('logged out'))) {
            // Remove IP information from details
            if (details.toLowerCase().includes('logged in')) {
              details = 'User logged in';
            } else if (details.toLowerCase().includes('logged out')) {
              details = 'User logged out';
            }
          }

          return {
            user: item.user || item.user_name || item.username || 'Unknown User',
            role: role,
            action: item.action || item.activity || 'Unknown Action',
            module: typeof item.module === 'object' ? item.module?.name || item.module?.module || 'Unknown Module' : item.module || 'Unknown Module',
            details: details,
            timestamp: item.timestamp || item.created_at || item.date || 'Unknown',
          };
        });

        // Create and download CSV file
        const headers = ["User", "Role", "Action", "Module", "Details", "Timestamp"];
        const csvContent = [
          headers.join(","),
          ...transformedExportData.map((row) =>
            [
              `"${row.user || ''}"`,
              `"${row.role || ''}"`,
              `"${row.action || ''}"`,
              `"${row.module || ''}"`,
              `"${row.details || ''}"`,
              `"${row.timestamp || ''}"`,
            ].join(",")
          ),
        ].join("\n");

        const blob = new Blob([csvContent], { type: "text/csv" });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = "audit_log.csv";
        a.click();
        window.URL.revokeObjectURL(url);
      } else {
        // Fallback to export current filtered data
        const headers = ["User", "Role", "Action", "Module", "Details", "Timestamp"];
        const csvContent = [
          headers.join(","),
          ...filteredData.map((row) =>
            [
              `"${row.user || ''}"`,
              `"${row.role || ''}"`,
              `"${row.action || ''}"`,
              `"${row.module || ''}"`,
              `"${row.details || ''}"`,
              `"${row.timestamp || ''}"`,
            ].join(",")
          ),
        ].join("\n");

        const blob = new Blob([csvContent], { type: "text/csv" });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = "audit_log.csv";
        a.click();
        window.URL.revokeObjectURL(url);
      }
    } catch (err) {
      console.error('Error exporting CSV:', err);
      alert('Failed to export CSV. Please try again.');
    }
  };

  const exportToPDF = () => {
    // Simple PDF export simulation
    alert("PDF export functionality would be implemented here");
  };

  // Handle modal operations
  const openModal = (auditLog) => {
    setSelectedAuditLog(auditLog);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setSelectedAuditLog(null);
    setIsModalOpen(false);
  };

  // Format details for modal display
  const formatDetailsForModal = (details) => {
    if (!details || details === 'No details available') {
      return 'No details available';
    }

    // Try to parse JSON and format it nicely
    try {
      if (details.startsWith('{') && details.includes('}')) {
        const jsonData = JSON.parse(details);
        return JSON.stringify(jsonData, null, 2);
      }
    } catch (error) {
      // If JSON parsing fails, return the original string
      console.log('Failed to parse details JSON for modal:', error);
    }

    return details;
  };

  if (loading && auditData.length === 0) {
    return (
      <div className="text-center py-5">
        <Spinner color="primary" />
        <p className="mt-2">Loading audit data...</p>
      </div>
    );
  }

  return (
    <>
      <style>
        {`
          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
        `}
      </style>
      <Header showStats={false} />
      {/* Header Background */}
      <div className="header pb-8 pt-4 pt-md-7"></div>
      <Container className="mt-4" fluid>
        {error && (
          <Row>
            <Col md="12">
              <Alert color="danger" className="mb-4">
                <strong>Error:</strong> {error}
                <Button 
                  color="link" 
                  className="float-right p-0" 
                  onClick={() => setError(null)}
                >
                  ×
                </Button>
              </Alert>
            </Col>
          </Row>
        )}
        <Row style={{marginTop: '-14rem'}}>
          <Col md="12">
            {/* Filter Section OUTSIDE the table card */}
            <Card className="mb-4" style={{ border: '1px solid #e1e5e9', borderRadius: '8px' }}>
              <CardBody style={{ padding: '1rem 1.5rem' }}>
                <Row>
                  <Col xs={12} sm={12} md={6} lg={4}>
                    <FormGroup>
                      <Label style={{ fontWeight: 600, color: '#32325d', marginBottom: '0.5rem' }}>Module</Label>
                      <Dropdown isOpen={moduleDropdownOpen} toggle={() => setModuleDropdownOpen(!moduleDropdownOpen)} style={{ width: '100%' }}>
                        <DropdownToggle
                          style={{
                            width: '100%',
                            background: '#fff',
                            color: selectedModule ? '#32325d' : '#8898aa',
                            border: '1px solid #e1e5e9',
                            borderRadius: '6px',
                            fontWeight: 400,
                            fontSize: '1rem',
                            height: '48px',
                            padding: '0 16px',
                            boxShadow: 'none',
                            outline: 'none',
                            position: 'relative',
                            textAlign: 'left',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                            margin: 0,
                          }}
                        >
                          <span>{selectedModule || 'All Modules'}</span>
                          <span style={{ position: 'absolute', right: 16, pointerEvents: 'none', display: 'flex', alignItems: 'center', height: '100%' }}>
                            <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                              <path d="M6 8L10 12L14 8" stroke="#b5b5b5" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                            </svg>
                          </span>
                        </DropdownToggle>
                        <DropdownMenu style={{ width: '100%' }}>
                          <DropdownItem
                            onClick={() => setSelectedModule("")}
                            active={!selectedModule}
                            style={{ backgroundColor: !selectedModule ? '#e7f3ff' : '#fff', color: '#525f7f', fontWeight: !selectedModule ? 600 : 400 }}
                            onMouseOver={e => e.currentTarget.style.backgroundColor = '#e7f3ff'}
                            onMouseOut={e => e.currentTarget.style.backgroundColor = !selectedModule ? '#e7f3ff' : '#fff'}
                          >
                            All Modules
                          </DropdownItem>
                          {availableModules.map(module => (
                            <DropdownItem
                              key={module}
                              onClick={() => setSelectedModule(module)}
                              active={selectedModule === module}
                              style={{ backgroundColor: selectedModule === module ? '#e7f3ff' : '#fff', color: '#525f7f', fontWeight: selectedModule === module ? 600 : 400 }}
                              onMouseOver={e => e.currentTarget.style.backgroundColor = '#e7f3ff'}
                              onMouseOut={e => e.currentTarget.style.backgroundColor = selectedModule === module ? '#e7f3ff' : '#fff'}
                            >
                              {module}
                            </DropdownItem>
                          ))}
                        </DropdownMenu>
                      </Dropdown>
                    </FormGroup>
                  </Col>
                  <Col xs={12} sm={6} md={3} lg={4}>
                    <FormGroup>
                      <Label style={{ fontWeight: 600, color: '#32325d', marginBottom: '0.5rem' }}>Date From</Label>
                      <Input
                        type="date"
                        value={dateRange.start}
                        onChange={(e) => setDateRange({ ...dateRange, start: e.target.value })}
                        style={{ borderRadius: '6px', border: '1px solid #e1e5e9' }}
                      />
                    </FormGroup>
                  </Col>
                  <Col xs={12} sm={6} md={3} lg={4}>
                    <FormGroup>
                      <Label style={{ fontWeight: 600, color: '#32325d', marginBottom: '0.5rem' }}>Date To</Label>
                      <Input
                        type="date"
                        value={dateRange.end}
                        onChange={(e) => setDateRange({ ...dateRange, end: e.target.value })}
                        style={{ borderRadius: '6px', border: '1px solid #e1e5e9' }}
                      />
                    </FormGroup>
                  </Col>
                </Row>
                <Row className="mt-3">
                  <Col xs={12} className="d-flex justify-content-center justify-content-sm-end">
                    <Button
                      color="secondary"
                      outline
                      onClick={() => {
                        setSearchTerm("");
                        setSelectedModule("");
                        setDateRange({ start: "", end: "" });
                        setSelectedRoleTab("all");
                      }}
                      style={{ borderRadius: '6px', fontWeight: 600, minWidth: '120px' }}
                    >
                      <i className="ni ni-refresh mr-1 mr-sm-2" />
                      <span className="d-none d-sm-inline">Clear Filters</span>
                      <span className="d-sm-none">Clear</span>
                    </Button>
                  </Col>
                </Row>
              </CardBody>
            </Card>
          </Col>
        </Row>
        {/* Role-specific tabs */}
        <Row>
          <Col md="12">
            <Card className="shadow mb-3">
              <CardBody style={{ padding: '0.75rem 1rem' }}>
                <Nav tabs className="flex-column flex-sm-row">
                  <NavItem className="flex-fill">
                    <NavLink
                      className={classnames({ active: selectedRoleTab === "all" })}
                      onClick={() => setSelectedRoleTab("all")}
                      style={{
                        cursor: 'pointer',
                        color: selectedRoleTab === "all" ? '#ffffff' : '#8898aa',
                        backgroundColor: selectedRoleTab === "all" ? '#5e72e4' : 'transparent',
                        fontWeight: selectedRoleTab === "all" ? 600 : 400,
                        borderBottom: selectedRoleTab === "all" ? '2px solid #5e72e4' : 'none',
                        textAlign: 'center',
                        padding: '0.75rem 0.5rem',
                        fontSize: '0.875rem',
                        borderRadius: selectedRoleTab === "all" ? '6px 6px 0 0' : '0'
                      }}
                    >
                      <i className="ni ni-chart-bar-32 mr-1 mr-sm-2" />
                      <span className="d-none d-sm-inline">All Roles</span>
                      <span className="d-sm-none">All</span>
                    </NavLink>
                  </NavItem>
                  <NavItem className="flex-fill">
                    <NavLink
                      className={classnames({ active: selectedRoleTab === "admin" })}
                      onClick={() => setSelectedRoleTab("admin")}
                      style={{
                        cursor: 'pointer',
                        color: selectedRoleTab === "admin" ? '#ffffff' : '#8898aa',
                        backgroundColor: selectedRoleTab === "admin" ? '#5e72e4' : 'transparent',
                        fontWeight: selectedRoleTab === "admin" ? 600 : 400,
                        borderBottom: selectedRoleTab === "admin" ? '2px solid #5e72e4' : 'none',
                        textAlign: 'center',
                        padding: '0.75rem 0.5rem',
                        fontSize: '0.875rem',
                        borderRadius: selectedRoleTab === "admin" ? '6px 6px 0 0' : '0'
                      }}
                    >
                      <i className="ni ni-single-02 mr-1 mr-sm-2" />
                      <span className="d-none d-sm-inline">Admin</span>
                      <span className="d-sm-none">Admin</span>
                    </NavLink>
                  </NavItem>
                  <NavItem className="flex-fill">
                    <NavLink
                      className={classnames({ active: selectedRoleTab === "teacher" })}
                      onClick={() => setSelectedRoleTab("teacher")}
                      style={{
                        cursor: 'pointer',
                        color: selectedRoleTab === "teacher" ? '#ffffff' : '#8898aa',
                        backgroundColor: selectedRoleTab === "teacher" ? '#5e72e4' : 'transparent',
                        fontWeight: selectedRoleTab === "teacher" ? 600 : 400,
                        borderBottom: selectedRoleTab === "teacher" ? '2px solid #5e72e4' : 'none',
                        textAlign: 'center',
                        padding: '0.75rem 0.5rem',
                        fontSize: '0.875rem',
                        borderRadius: selectedRoleTab === "teacher" ? '6px 6px 0 0' : '0'
                      }}
                    >
                      <i className="ni ni-hat-3 mr-1 mr-sm-2" />
                      <span className="d-none d-sm-inline">Teacher</span>
                      <span className="d-sm-none">Teacher</span>
                    </NavLink>
                  </NavItem>
                  <NavItem className="flex-fill">
                    <NavLink
                      className={classnames({ active: selectedRoleTab === "student" })}
                      onClick={() => setSelectedRoleTab("student")}
                      style={{
                        cursor: 'pointer',
                        color: selectedRoleTab === "student" ? '#ffffff' : '#8898aa',
                        backgroundColor: selectedRoleTab === "student" ? '#5e72e4' : 'transparent',
                        fontWeight: selectedRoleTab === "student" ? 600 : 400,
                        borderBottom: selectedRoleTab === "student" ? '2px solid #5e72e4' : 'none',
                        textAlign: 'center',
                        padding: '0.75rem 0.5rem',
                        fontSize: '0.875rem',
                        borderRadius: selectedRoleTab === "student" ? '6px 6px 0 0' : '0'
                      }}
                    >
                      <i className="ni ni-badge mr-1 mr-sm-2" />
                      <span className="d-none d-sm-inline">Student</span>
                      <span className="d-sm-none">Student</span>
                    </NavLink>
                  </NavItem>
                </Nav>
              </CardBody>
            </Card>
          </Col>
        </Row>
        {/* Card with course tabs, search, filter buttons, and table */}
        <Row>
          <Col md="12">
            <Card className="shadow">
              <CardBody style={{ background: '#fff', borderRadius: '0 0 12px 12px', padding: 0 }}>
                {/* Search bar above the Audit Log title */}
                <Row style={{ marginLeft: 0, marginRight: 0 }}>
                  <Col xs={12} className="px-3">
                    <div className="d-flex align-items-center mb-2" style={{ width: '100%', margin: 0, padding: 0, marginTop: '20px' }}>
                      <InputGroup className={isSearchFocused ? 'focused' : ''} style={{ width: '100%', marginBottom: '6px' }}>
                        <InputGroupAddon addonType="prepend">
                          <InputGroupText>
                            <i className="fas fa-search" />
                          </InputGroupText>
                        </InputGroupAddon>
                        <Input
                          placeholder="Search users, actions, or modules..."
                          value={searchTerm}
                          onChange={(e) => setSearchTerm(e.target.value)}
                          style={{ minWidth: 0 }}
                          onFocus={() => setIsSearchFocused(true)}
                          onBlur={() => setIsSearchFocused(false)}
                        />
                      </InputGroup>
                    </div>
                  </Col>
                </Row>
                {/* Header with count and action buttons */}
                <Row>
                  <Col xs={12} className="px-3">
                    <div className="w-100 d-flex flex-column flex-sm-row justify-content-between align-items-start align-items-sm-center" style={{ marginTop: '20px', marginBottom: '16px', gap: '10px' }}>
                      <div style={{ fontWeight: 600, fontSize: '1rem', color: '#32325d', marginLeft: '10px' }}>
                        <span className="d-none d-sm-inline">Audit Log</span>
                        <span className="d-sm-none">Log</span> ({totalItems})
                        {loading && <Spinner size="sm" className="ml-2" />}
                      </div>
                      <div className="d-flex align-items-center" style={{ gap: 8 }}>
                        <UncontrolledDropdown className="d-inline-block">
                          <DropdownToggle color="info" outline="true" size="sm" style={{ padding: '3px 8px', fontSize: '0.75rem', color: '#5e72e4' }}>
                            <i className="ni ni-archive-2 mr-1 mr-sm-2" />
                            <span className="d-none d-sm-inline">Export</span>
                            <span className="d-sm-none">Export</span>
                          </DropdownToggle>
                          <DropdownMenu>
                            <DropdownItem 
                              onClick={exportToCSV}
                              style={{ backgroundColor: 'white', transition: 'background 0.2s' }}
                              onMouseOver={e => e.currentTarget.style.backgroundColor = '#e7f3ff'}
                              onMouseOut={e => e.currentTarget.style.backgroundColor = 'white'}
                            >
                              <i className="ni ni-single-copy-04 mr-2" />
                              Export to CSV
                            </DropdownItem>
                            <DropdownItem 
                              onClick={exportToPDF}
                              style={{ backgroundColor: 'white', transition: 'background 0.2s' }}
                              onMouseOver={e => e.currentTarget.style.backgroundColor = '#e7f3ff'}
                              onMouseOut={e => e.currentTarget.style.backgroundColor = 'white'}
                            >
                              <i className="ni ni-pdf mr-2" />
                              Export to PDF
                            </DropdownItem>
                          </DropdownMenu>
                        </UncontrolledDropdown>
                      </div>
                    </div>
                  </Col>
                </Row>
                {/* Table View */}
                <div style={{ margin: 0, padding: 0, width: '100%' }}>
                  <Table className="align-items-center table-flush" responsive>
                    <thead className="thead-light">
                      <tr>
                        <th scope="col" onClick={() => handleSort('user')} style={{ cursor: 'pointer', width: '15%' }}>
                          <span className="d-none d-sm-inline">USER</span>
                          <span className="d-sm-none">USER</span>
                          {getSortIndicator('user')}
                        </th>
                        <th scope="col" onClick={() => handleSort('role')} style={{ cursor: 'pointer', width: '10%' }}>
                          <span className="d-none d-sm-inline">ROLE</span>
                          <span className="d-sm-none">ROLE</span>
                          {getSortIndicator('role')}
                        </th>
                        <th scope="col" onClick={() => handleSort('action')} style={{ cursor: 'pointer', width: '15%' }}>
                          <span className="d-none d-sm-inline">ACTION</span>
                          <span className="d-sm-none">ACTION</span>
                          {getSortIndicator('action')}
                        </th>
                        <th scope="col" onClick={() => handleSort('module')} style={{ cursor: 'pointer', width: '15%' }}>
                          <span className="d-none d-sm-inline">MODULE</span>
                          <span className="d-sm-none">MODULE</span>
                          {getSortIndicator('module')}
                        </th>
                        <th scope="col" style={{ width: '20%' }}>
                          <span className="d-none d-sm-inline">DETAILS</span>
                          <span className="d-sm-none">DETAILS</span>
                        </th>
                        <th scope="col" onClick={() => handleSort('timestamp')} style={{ cursor: 'pointer', width: '25%' }}>
                          <span className="d-none d-sm-inline">TIMESTAMP</span>
                          <span className="d-sm-none">TIME</span>
                          {getSortIndicator('timestamp')}
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                                             {filteredData.length > 0 ? (
                         filteredData.map((item) => (
                           <tr 
                             key={item.id}
                             onClick={() => openModal(item)}
                             style={{ 
                               cursor: 'pointer',
                               transition: 'background-color 0.2s ease'
                             }}
                             onMouseEnter={(e) => {
                               e.currentTarget.style.backgroundColor = '#f8f9fa';
                             }}
                             onMouseLeave={(e) => {
                               e.currentTarget.style.backgroundColor = '';
                             }}
                             title="Click to view full details"
                           >
                             <td style={{ width: '15%' }}>
                               <div className="d-flex align-items-center">
                                 <div
                                   className="avatar avatar-sm rounded-circle bg-gradient-primary mr-3"
                                   style={{ width: 32, height: 32, overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'transparent', border: '1px solid #e9ecef', color: '#ffffff' }}
                                 >
                                   {!profileLoading && userProfiles[item.user] && userProfiles[item.user].profile_pic ? (
                                     <img 
                                       src={getProfilePictureUrl(userProfiles[item.user])} 
                                       alt={item.user || 'User'} 
                                       style={{ width: 32, height: 32, objectFit: 'cover' }} 
                                       onError={(e) => {
                                         e.target.style.display = 'none';
                                         e.target.nextSibling.style.display = 'flex';
                                       }}
                                     />
                                   ) : null}
                                   <div 
                                     style={{ 
                                       width: 32, 
                                       height: 32, 
                                       borderRadius: '50%', 
                                       backgroundColor: '#5e72e4', 
                                       color: 'white', 
                                       display: (!profileLoading && userProfiles[item.user] && userProfiles[item.user].profile_pic) ? 'none' : 'flex',
                                       alignItems: 'center', 
                                       justifyContent: 'center', 
                                       fontSize: '12px', 
                                       fontWeight: 'bold' 
                                     }}
                                   >
                                     {getUserInitials(item.user)}
                                   </div>
                                 </div>
                                 <div>
                                   <div className="font-weight-bold" style={{ fontSize: '0.875rem' }}>{item.user || 'Unknown User'}</div>
                                 </div>
                               </div>
                             </td>
                             <td style={{ width: '10%' }}>
                               <div className="font-weight-bold" style={{ fontSize: '0.875rem' }}>{item.role || 'Unknown'}</div>
                             </td>
                             <td style={{ width: '15%' }}>{getActionBadge(item.action)}</td>
                             <td style={{ width: '15%' }}>{getModuleBadge(item.module)}</td>
                             <td style={{ width: '20%' }}>
                               <div 
                                 className="text-muted" 
                                 style={{ 
                                   maxWidth: "200px", 
                                   fontSize: '0.875rem',
                                   lineHeight: '1.2',
                                   whiteSpace: 'nowrap',
                                   overflow: 'hidden',
                                   textOverflow: 'ellipsis',
                                   display: 'block'
                                 }}
                               >
                                 {item.details || 'No details available'}
                               </div>
                             </td>
                             <td style={{ width: '25%' }}>
                               <div className="text-muted" style={{ fontSize: '0.875rem' }}>
                                 {formatTimestamp(item.timestamp)}
                               </div>
                             </td>
                           </tr>
                         ))
                      ) : (
                        <tr>
                          <td colSpan="6" className="text-center py-4">
                            <div className="text-muted">
                              <i className="ni ni-archive-2" style={{ fontSize: "3rem" }} />
                              <p className="mt-2">
                                {loading ? 'Loading audit records...' : 'No audit records found'}
                              </p>
                            </div>
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </Table>
                  {/* Pagination UI */}
                  <div style={{height: '80px', position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'space-between'}}>
                    <div className="d-flex flex-row align-items-center" style={{ marginLeft: '1.5rem' }}>
                      <span className="mr-2 text-muted small">Show</span>
                      <Input
                        className="custom-focus-effect"
                        type="select"
                        value={itemsPerPage}
                        onChange={handleItemsPerPageChange}
                        style={{ width: '80px', fontSize: '0.95rem', marginRight: '8px' }}
                      >
                        <option value={5}>5</option>
                        <option value={10}>10</option>
                        <option value={20}>20</option>
                        <option value={50}>50</option>
                      </Input>
                      <span className="text-muted small" style={{ whiteSpace: 'nowrap' }}>
                        of {totalItems} entries
                      </span>
                    </div>
                    <Pagination size="sm" className="mb-0 justify-content-end" style={{margin: 0, marginRight: '1.5rem'}}>
                      <PaginationItem disabled={currentPage === 1}>
                        <PaginationLink
                          previous
                          onClick={() => handlePageChange(currentPage - 1)}
                          style={{ cursor: currentPage === 1 ? 'default' : 'pointer' }}
                        />
                      </PaginationItem>
                      {currentPage > 1 && (
                        <PaginationItem>
                          <PaginationLink
                            onClick={() => handlePageChange(currentPage - 1)}
                            style={{ cursor: 'pointer', textAlign: 'center', minWidth: '28px', fontSize: '0.875rem' }}
                          >
                            {currentPage - 1}
                          </PaginationLink>
                        </PaginationItem>
                      )}
                      <PaginationItem active>
                        <PaginationLink style={{ textAlign: 'center', minWidth: '28px', fontSize: '0.875rem' }}>
                          {currentPage}
                        </PaginationLink>
                      </PaginationItem>
                      {currentPage < totalPages && (
                        <PaginationItem>
                          <PaginationLink
                            onClick={() => handlePageChange(currentPage + 1)}
                            style={{ cursor: 'pointer', textAlign: 'center', minWidth: '28px', fontSize: '0.875rem' }}
                          >
                            {currentPage + 1}
                          </PaginationLink>
                        </PaginationItem>
                      )}
                      <PaginationItem disabled={currentPage === totalPages}>
                        <PaginationLink
                          next
                          onClick={() => handlePageChange(currentPage + 1)}
                          style={{ cursor: currentPage === totalPages ? 'default' : 'pointer' }}
                        />
                      </PaginationItem>
                    </Pagination>
                  </div>
                </div>
              </CardBody>
            </Card>
          </Col>
                 </Row>
       </Container>

               {/* Audit Log Details Modal */}
                <Modal
          isOpen={isModalOpen}
          toggle={closeModal}
          size="lg"
          centered
          style={{ padding: 0 }}
        >
          {/* Simple Header */}
          <div style={{
            backgroundColor: '#f8f9fa',
            padding: '20px',
            borderBottom: '1px solid #e9ecef',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between'
          }}>
            <div className="d-flex align-items-center">
              <div style={{
                width: '40px',
                height: '40px',
                borderRadius: '8px',
                backgroundColor: '#007bff',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                marginRight: '12px'
              }}>
                <i className="ni ni-archive-2" style={{ fontSize: '16px', color: 'white' }} />
              </div>
              <div>
                <h5 style={{ margin: 0, fontWeight: 600, fontSize: '1.1rem', color: '#333' }}>
                  Audit Log Details
                </h5>
                <small style={{ color: '#6c757d', fontSize: '0.85rem' }}>
                  Activity information
                </small>
              </div>
            </div>
            <button
              onClick={closeModal}
              style={{
                background: 'none',
                border: 'none',
                color: '#6c757d',
                fontSize: '24px',
                cursor: 'pointer',
                padding: '0',
                width: '32px',
                height: '32px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                borderRadius: '4px',
                transition: 'background-color 0.2s'
              }}
              onMouseEnter={(e) => e.target.style.backgroundColor = '#e9ecef'}
              onMouseLeave={(e) => e.target.style.backgroundColor = 'transparent'}
            >
              ×
            </button>
          </div>

          {/* Content Area */}
          <div style={{ padding: '24px', maxHeight: '60vh', overflowY: 'auto' }}>
            {selectedAuditLog && (
              <div>
                {/* User Info */}
                <div style={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  marginBottom: '20px',
                  padding: '16px',
                  backgroundColor: '#f8f9fa',
                  borderRadius: '8px',
                  border: '1px solid #e9ecef'
                }}>
                  <div
                    style={{ 
                      width: '48px', 
                      height: '48px', 
                      borderRadius: '50%', 
                      overflow: 'hidden',
                      marginRight: '16px',
                      border: '2px solid #fff',
                      boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)'
                    }}
                  >
                    {!profileLoading && userProfiles[selectedAuditLog.user] && userProfiles[selectedAuditLog.user].profile_pic ? (
                      <img 
                        src={getProfilePictureUrl(userProfiles[selectedAuditLog.user])} 
                        alt={selectedAuditLog.user || 'User'} 
                        style={{ width: '100%', height: '100%', objectFit: 'cover' }} 
                        onError={(e) => {
                          e.target.style.display = 'none';
                          e.target.nextSibling.style.display = 'flex';
                        }}
                      />
                    ) : null}
                    <div 
                      style={{ 
                        width: '100%', 
                        height: '100%', 
                        borderRadius: '50%', 
                        backgroundColor: '#007bff', 
                        color: 'white', 
                        display: (!profileLoading && userProfiles[selectedAuditLog.user] && userProfiles[selectedAuditLog.user].profile_pic) ? 'none' : 'flex',
                        alignItems: 'center', 
                        justifyContent: 'center', 
                        fontSize: '18px', 
                        fontWeight: 'bold' 
                      }}
                    >
                      {getUserInitials(selectedAuditLog.user)}
                    </div>
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: 600, fontSize: '1.1rem', color: '#333', marginBottom: '4px' }}>
                      {selectedAuditLog.user || 'Unknown User'}
                    </div>
                    <div style={{ 
                      display: 'inline-block',
                      padding: '4px 12px',
                      backgroundColor: '#e3f2fd',
                      color: '#1976d2',
                      borderRadius: '20px',
                      fontSize: '0.8rem',
                      fontWeight: 500,
                      textTransform: 'uppercase'
                    }}>
                      {selectedAuditLog.role || 'Unknown'}
                    </div>
                  </div>
                </div>

                {/* Activity Info */}
                <div style={{ 
                  display: 'grid', 
                  gridTemplateColumns: '1fr 1fr 1fr', 
                  gap: '12px',
                  marginBottom: '20px'
                }}>
                  <div style={{
                    padding: '16px',
                    backgroundColor: '#fff',
                    borderRadius: '8px',
                    border: '1px solid #e9ecef',
                    textAlign: 'center'
                  }}>
                    <div style={{ fontSize: '0.75rem', color: '#6c757d', marginBottom: '6px', textTransform: 'uppercase', fontWeight: 600 }}>
                      Action
                    </div>
                    <div>{getActionBadge(selectedAuditLog.action)}</div>
                  </div>
                  
                  <div style={{
                    padding: '16px',
                    backgroundColor: '#fff',
                    borderRadius: '8px',
                    border: '1px solid #e9ecef',
                    textAlign: 'center'
                  }}>
                    <div style={{ fontSize: '0.75rem', color: '#6c757d', marginBottom: '6px', textTransform: 'uppercase', fontWeight: 600 }}>
                      Module
                    </div>
                    <div>{getModuleBadge(selectedAuditLog.module)}</div>
                  </div>
                  
                  <div style={{
                    padding: '16px',
                    backgroundColor: '#fff',
                    borderRadius: '8px',
                    border: '1px solid #e9ecef',
                    textAlign: 'center'
                  }}>
                    <div style={{ fontSize: '0.75rem', color: '#6c757d', marginBottom: '6px', textTransform: 'uppercase', fontWeight: 600 }}>
                      Timestamp
                    </div>
                    <div style={{ fontSize: '0.9rem', color: '#333', fontWeight: 500 }}>
                      {formatTimestamp(selectedAuditLog.timestamp)}
                    </div>
                  </div>
                </div>

                {/* Details Section */}
                <div style={{ 
                  backgroundColor: '#fff',
                  borderRadius: '8px',
                  border: '1px solid #e9ecef',
                  padding: '20px'
                }}>
                  <div style={{ 
                    fontSize: '0.9rem', 
                    color: '#333', 
                    marginBottom: '12px', 
                    fontWeight: 600,
                    display: 'flex',
                    alignItems: 'center'
                  }}>
                    <i className="ni ni-single-copy-04 mr-2" style={{ fontSize: '14px' }} />
                    Complete Details
                  </div>
                  <div 
                    style={{ 
                      backgroundColor: '#f8f9fa', 
                      borderRadius: '6px', 
                      border: '1px solid #e9ecef',
                      fontFamily: 'monospace',
                      fontSize: '0.875rem',
                      whiteSpace: 'pre-wrap',
                      wordBreak: 'break-word',
                      padding: '16px',
                      lineHeight: '1.5',
                      minHeight: '200px',
                      maxHeight: '300px',
                      overflowY: 'auto'
                    }}
                  >
                    {formatDetailsForModal(selectedAuditLog.details)}
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Footer */}
          <div style={{
            padding: '16px 24px',
            borderTop: '1px solid #e9ecef',
            display: 'flex',
            justifyContent: 'flex-end',
            backgroundColor: '#f8f9fa'
          }}>
            <button
              onClick={closeModal}
              style={{
                padding: '8px 24px',
                backgroundColor: '#6c757d',
                color: 'white',
                border: 'none',
                borderRadius: '6px',
                fontSize: '0.9rem',
                fontWeight: 500,
                cursor: 'pointer',
                transition: 'background-color 0.2s'
              }}
              onMouseEnter={(e) => e.target.style.backgroundColor = '#5a6268'}
              onMouseLeave={(e) => e.target.style.backgroundColor = '#6c757d'}
            >
              Close
            </button>
          </div>
        </Modal>
     </>
   );
 };

export default AuditLog; 