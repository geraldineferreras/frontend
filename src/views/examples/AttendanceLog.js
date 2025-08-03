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
  Modal,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Nav,
  NavItem,
  NavLink,
  Spinner,
} from "reactstrap";
import Header from "components/Headers/Header.js";
import classnames from "classnames";
import api from "services/api.js";

const AttendanceLog = () => {
  // State management
  const [attendanceData, setAttendanceData] = useState([]);
  const [filteredData, setFilteredData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [sortKey, setSortKey] = useState("date");
  const [sortDirection, setSortDirection] = useState("desc");
  const [isMobile, setIsMobile] = useState(false);
  
  // Filter states
  const [activeCourseTab, setActiveCourseTab] = useState("all");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [selectedSubject, setSelectedSubject] = useState("");
  const [selectedSection, setSelectedSection] = useState("");
  const [selectedTeacher, setSelectedTeacher] = useState("");
  const [selectedAttendanceStatus, setSelectedAttendanceStatus] = useState("");
  const [selectedExcuseStatus, setSelectedExcuseStatus] = useState("");
  
  // Modal states
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedRecord, setSelectedRecord] = useState(null);

  // Available options for filters
  const courses = [
    { id: "bsit", abbr: "BSIT", name: "Info Tech" },
    { id: "bscs", abbr: "BSCS", name: "Computer Science" },
    { id: "bsis", abbr: "BSIS", name: "Info Systems" },
    { id: "act", abbr: "ACT", name: "Computer Technology" },
  ];
  const subjects = ["Programming 1", "Programming 2", "Data Structures", "Database Management", "Web Development", "Software Engineering", "Computer Networks", "Operating Systems", "Information Security", "Mobile Development", "Artificial Intelligence", "Machine Learning", "Computer Architecture", "Software Testing", "Project Management", "IT Ethics"];
  const sections = ["BSIT 1A", "BSIT 1B", "BSIT 2A", "BSIT 2B", "BSIT 3A", "BSIT 3B", "BSIT 4A", "BSIT 4B", "BSCS 1A", "BSCS 1B", "BSCS 2A", "BSCS 2B", "BSCS 3A", "BSCS 3B", "BSCS 4A", "BSCS 4B", "BSIS 1A", "BSIS 1B", "BSIS 2A", "BSIS 2B", "BSIS 3A", "BSIS 3B", "BSIS 4A", "BSIS 4B", "ACT 1A", "ACT 1B", "ACT 2A", "ACT 2B", "ACT 3A", "ACT 3B"];
  const teachers = ["Mr. Cruz", "Ms. Reyes", "Mr. Garcia", "Mrs. David", "Ms. Santos", "Mr. Lee", "Ms. Tan", "Mr. Ramos", "Ms. Lim", "Mr. Dela Cruz", "Ms. Torres", "Mr. Mendoza", "Ms. Navarro", "Mr. Villanueva", "Ms. Bautista", "Mr. Hernandez"];
  const attendanceStatuses = ["Present", "Absent", "Late", "Excused"];
  const excuseStatuses = ["N/A", "Pending", "Approved", "Rejected"];

  // Helper functions
  const getRandomAvatar = (userId) => {
    const avatarUrls = [
      "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face",
      "https://images.unsplash.com/photo-1494790108755-2616b612b786?w=150&h=150&fit=crop&crop=face",
      "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&h=150&fit=crop&crop=face",
      "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face",
      "https://images.unsplash.com/photo-1519345182560-3f2917c472ef?w=150&h=150&fit=crop&crop=face",
    ];
    const index = Math.abs(userId.toString().split('').reduce((a, b) => a + b.charCodeAt(0), 0)) % avatarUrls.length;
    return avatarUrls[index];
  };

  // Get attendance status badge
  const getAttendanceStatusBadge = (status) => {
    console.log("getAttendanceStatusBadge called with status:", status);
    
    // Normalize status to handle case variations
    const normalizedStatus = status ? status.toString().toLowerCase() : '';
    console.log("Normalized status:", normalizedStatus);
    
    // Define colors with hex values
    const colors = {
      present: "#28a745", // green
      absent: "#dc3545",   // red
      late: "#ffc107",     // orange
      excused: "#17a2b8"   // blue
    };
    
    // Get the color for the normalized status
    const backgroundColor = colors[normalizedStatus] || "#6c757d"; // gray default
    const textColor = normalizedStatus === "late" ? "#212529" : "#ffffff";
    
    console.log("Selected background color:", backgroundColor);
    console.log("Selected text color:", textColor);
    
    const badgeStyle = {
      backgroundColor: backgroundColor,
      color: textColor,
      padding: "0.375rem 0.75rem",
      borderRadius: "0.375rem",
      fontSize: "0.875rem",
      fontWeight: "500",
      display: "inline-block"
    };
    
    return <Badge style={badgeStyle}>{status}</Badge>;
  };

  // Get excuse status badge
  const getExcuseStatusBadge = (status) => {
    console.log("getExcuseStatusBadge called with status:", status);
    
    // Normalize status to handle case variations
    const normalizedStatus = status ? status.toString().toLowerCase() : '';
    console.log("Normalized excuse status:", normalizedStatus);
    
    // Define colors with hex values
    const colors = {
      "n/a": "#6c757d",     // gray
      pending: "#ffc107",    // orange
      approved: "#28a745",   // green
      rejected: "#dc3545"    // red
    };
    
    // Get the color for the normalized status
    const backgroundColor = colors[normalizedStatus] || "#6c757d"; // gray default
    const textColor = normalizedStatus === "pending" ? "#212529" : "#ffffff";
    
    console.log("Selected excuse background color:", backgroundColor);
    console.log("Selected excuse text color:", textColor);
    
    const badgeStyle = {
      backgroundColor: backgroundColor,
      color: textColor,
      padding: "0.375rem 0.75rem",
      borderRadius: "0.375rem",
      fontSize: "0.875rem",
      fontWeight: "500",
      display: "inline-block"
    };
    
    return <Badge style={badgeStyle}>{status}</Badge>;
  };

     // Filter data based on all filters
   const filterData = (data) => {
     console.log("Filtering data with:", {
       activeCourseTab,
       dataLength: data.length,
       sampleData: data.slice(0, 2)
     });
     
     let filtered = data.filter(item => {
       // Search filter
       const searchMatch = !searchTerm || 
         item.studentName.toLowerCase().includes(searchTerm.toLowerCase()) ||
         item.studentId.toLowerCase().includes(searchTerm.toLowerCase());
       
       // Date range filter
       const dateMatch = (!dateFrom || item.date >= dateFrom) && 
                        (!dateTo || item.date <= dateTo);
       
       // Course filter - check if section contains the program abbreviation
       const courseMatch = activeCourseTab === "all" || 
         (activeCourseTab === "bsit" && item.section.toUpperCase().includes("BSIT")) ||
         (activeCourseTab === "bscs" && item.section.toUpperCase().includes("BSCS")) ||
         (activeCourseTab === "bsis" && item.section.toUpperCase().includes("BSIS")) ||
         (activeCourseTab === "act" && item.section.toUpperCase().includes("ACT"));
       
       // Debug course filtering
       if (activeCourseTab !== "all") {
         console.log(`Item section: "${item.section}", Active tab: "${activeCourseTab}", Course match: ${courseMatch}`);
       }
       
       // Other filters
       const subjectMatch = !selectedSubject || item.subject === selectedSubject;
       const sectionMatch = !selectedSection || item.section === selectedSection;
       const teacherMatch = !selectedTeacher || item.teacherName === selectedTeacher;
       const attendanceMatch = !selectedAttendanceStatus || item.attendanceStatus === selectedAttendanceStatus;
       const excuseMatch = !selectedExcuseStatus || item.excuseLetterStatus === selectedExcuseStatus;
       return searchMatch && dateMatch && courseMatch && subjectMatch && sectionMatch && 
              teacherMatch && attendanceMatch && excuseMatch;
     });

    // Sort data
    filtered.sort((a, b) => {
      let aVal = a[sortKey];
      let bVal = b[sortKey];
      
      if (sortKey === 'date') {
        aVal = new Date(aVal);
        bVal = new Date(bVal);
      } else if (typeof aVal === 'string') {
        aVal = aVal.toLowerCase();
        bVal = bVal.toLowerCase();
      }
      
      if (sortDirection === 'asc') {
        return aVal > bVal ? 1 : -1;
      } else {
        return aVal < bVal ? 1 : -1;
      }
    });

    setFilteredData(filtered);
  };

  // Handle sort
  const handleSort = (key) => {
    if (sortKey === key) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortKey(key);
      setSortDirection('asc');
    }
  };

  // Get sort indicator
  const getSortIndicator = (key) => {
    if (sortKey !== key) return '';
    return sortDirection === 'asc' ? ' ↑' : ' ↓';
  };

  // Handle page change
  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  // Clear all filters
  const clearFilters = () => {
    setSearchTerm("");
    setActiveCourseTab("all");
    setDateFrom("");
    setDateTo("");
    setSelectedSubject("");
    setSelectedSection("");
    setSelectedTeacher("");
    setSelectedAttendanceStatus("");
    setSelectedExcuseStatus("");
    setSortKey("date");
    setSortDirection("desc");
  };

  // Export to CSV
  const exportToCSV = () => {
    const headers = [
      'Student Name', 'Student ID', 'Section', 'Subject', 'Teacher Name',
      'Date', 'Attendance Status', 'Excuse Letter Status', 'Reason', 'Attachment'
    ];
    
    const csvContent = [
      headers.join(','),
      ...filteredData.map(item => [
        item.studentName,
        item.studentId,
        item.section,
        item.subject,
        item.teacherName,
        item.date,
        item.attendanceStatus,
        item.excuseLetterStatus,
        item.reason,
        item.attachment || 'N/A'
      ].join(','))
    ].join('\n');
    
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'attendance_log.csv';
    a.click();
    window.URL.revokeObjectURL(url);
  };

  // Export to PDF
  const exportToPDF = () => {
    alert('PDF export functionality would be implemented here');
  };

  // Open modal for viewing excuse letter
  const openExcuseModal = (record) => {
    setSelectedRecord(record);
    setModalOpen(true);
  };

  // Close modal
  const closeModal = () => {
    setModalOpen(false);
    setSelectedRecord(null);
  };

  // Check screen size
  useEffect(() => {
    const checkScreenSize = () => {
      setIsMobile(window.innerWidth < 768);
    };
    
    checkScreenSize();
    window.addEventListener('resize', checkScreenSize);
    
    return () => window.removeEventListener('resize', checkScreenSize);
  }, []);

  // Fetch attendance data
  const fetchData = async () => {
    try {
      setLoading(true);
      
      // Test if API is accessible
      console.log("Testing API accessibility...");
      try {
        const testResponse = await fetch('http://localhost/scms_new_backup/index.php/api/attendance-logs/logs', {
          method: 'GET',
          headers: {
            'Accept': 'application/json'
          }
        });
        console.log("API test response status:", testResponse.status);
        console.log("API test response ok:", testResponse.ok);
      } catch (testError) {
        console.log("API test failed:", testError);
      }
      
      // Build query parameters
      const params = new URLSearchParams();
      
             // Add program filter based on active course tab
       if (activeCourseTab !== "all") {
         const programMap = {
           "bsit": "BSIT",
           "bscs": "BSCS", 
           "bsis": "BSIS",
           "act": "ACT"
         };
         const program = programMap[activeCourseTab];
         if (program) {
           params.append('program', program);
           console.log("Adding program filter:", program);
         }
       }
      
      // Add date filters
      if (dateFrom) {
        params.append('date_from', dateFrom);
      }
      if (dateTo) {
        params.append('date_to', dateTo);
      }
      
      // Add attendance status filter
      if (selectedAttendanceStatus) {
        params.append('status', selectedAttendanceStatus.toLowerCase());
      }
      
             // First, let's test if there's any data at all without filters
       console.log("Testing if there's any data available...");
       try {
         const testAllDataUrl = `http://localhost/scms_new_backup/index.php/api/attendance-logs/logs`;
         const testAllDataResponse = await fetch(testAllDataUrl, {
           method: 'GET',
           headers: {
             'Content-Type': 'application/json',
             'Authorization': `Bearer ${localStorage.getItem('token')}`,
             'Accept': 'application/json'
           },
           mode: 'cors'
         });
         
         if (testAllDataResponse.ok) {
           const testAllData = await testAllDataResponse.json();
           console.log("All data test response:", testAllData);
           
           if (testAllData?.data?.logs && testAllData.data.logs.length > 0) {
             console.log("Found data without any filters:", testAllData.data.logs.length, "records");
           } else {
             console.log("No data found without filters");
           }
         }
       } catch (testError) {
         console.log("Test for all data failed:", testError);
       }
       
       // Fetch attendance data from your specific endpoint
       let attendanceResponse;
       try {
         console.log("Attempting to fetch attendance data...");
         const url = `http://localhost/scms_new_backup/index.php/api/attendance-logs/logs?${params.toString()}`;
                  console.log("Fetching from:", url);
          console.log("Full URL with params:", url);
         
         const response = await fetch(url, {
           method: 'GET',
           headers: {
             'Content-Type': 'application/json',
             'Authorization': `Bearer ${localStorage.getItem('token')}`,
             'Accept': 'application/json'
           },
           mode: 'cors'
         });
         
         console.log("Response status:", response.status);
         console.log("Response headers:", Object.fromEntries(response.headers.entries()));
         console.log("Response URL:", response.url);
         
         if (!response.ok) {
           const errorText = await response.text();
           console.error("Response error text:", errorText);
           throw new Error(`HTTP error! status: ${response.status} - ${errorText}`);
         }
         
         attendanceResponse = await response.json();
         console.log("Attendance data fetched successfully:", attendanceResponse);
                   console.log("Response structure:", {
            hasData: !!attendanceResponse?.data,
            hasLogs: !!attendanceResponse?.data?.logs,
            dataType: typeof attendanceResponse?.data,
            logsType: typeof attendanceResponse?.data?.logs,
            logsLength: attendanceResponse?.data?.logs?.length || 0,
            fullResponse: attendanceResponse
          });
          
          // Log the actual response structure to understand the data format
          console.log("Full API Response:", JSON.stringify(attendanceResponse, null, 2));
             } catch (error) {
         console.log("Attendance endpoint failed", error);
         
                // Try without program filter as fallback
       if (activeCourseTab !== "all") {
         console.log("Trying without program filter as fallback...");
         try {
           const fallbackUrl = `http://localhost/scms_new_backup/index.php/api/attendance-logs/logs`;
           console.log("Fallback URL:", fallbackUrl);
           
           const fallbackResponse = await fetch(fallbackUrl, {
             method: 'GET',
             headers: {
               'Content-Type': 'application/json',
               'Authorization': `Bearer ${localStorage.getItem('token')}`,
               'Accept': 'application/json'
             },
             mode: 'cors'
           });
           
           if (fallbackResponse.ok) {
             const fallbackData = await fallbackResponse.json();
             console.log("Fallback data:", fallbackData);
             
             // Process the fallback data
             let fallbackAttendanceData = [];
             if (fallbackData?.data?.logs) {
               fallbackAttendanceData = fallbackData.data.logs;
             } else if (fallbackData?.logs) {
               fallbackAttendanceData = fallbackData.logs;
             } else if (Array.isArray(fallbackData?.data)) {
               fallbackAttendanceData = fallbackData.data;
             } else if (Array.isArray(fallbackData)) {
               fallbackAttendanceData = fallbackData;
             }
             
             console.log("Fallback attendance data:", fallbackAttendanceData);
             
             // If we have data without program filter, we'll filter it on the frontend
             if (fallbackAttendanceData.length > 0) {
               console.log("Found data without program filter, will filter on frontend");
               setAttendanceData(Array.isArray(fallbackAttendanceData) ? fallbackAttendanceData : []);
               setLoading(false);
               return;
             }
           }
         } catch (fallbackError) {
           console.log("Fallback also failed:", fallbackError);
         }
       }
         
         // Try without authentication as last resort
         console.log("Trying without authentication...");
         try {
           const noAuthUrl = `http://localhost/scms_new_backup/index.php/api/attendance-logs/logs`;
           console.log("No auth URL:", noAuthUrl);
           
           const noAuthResponse = await fetch(noAuthUrl, {
             method: 'GET',
             headers: {
               'Content-Type': 'application/json',
               'Accept': 'application/json'
             },
             mode: 'cors'
           });
           
           if (noAuthResponse.ok) {
             const noAuthData = await noAuthResponse.json();
             console.log("No auth data:", noAuthData);
             
             // Process the no auth data
             let noAuthAttendanceData = [];
             if (noAuthData?.data?.logs) {
               noAuthAttendanceData = noAuthData.data.logs;
             } else if (noAuthData?.logs) {
               noAuthAttendanceData = noAuthData.logs;
             } else if (Array.isArray(noAuthData?.data)) {
               noAuthAttendanceData = noAuthData.data;
             } else if (Array.isArray(noAuthData)) {
               noAuthAttendanceData = noAuthData;
             }
             
             console.log("No auth attendance data:", noAuthAttendanceData);
             setAttendanceData(Array.isArray(noAuthAttendanceData) ? noAuthAttendanceData : []);
             setLoading(false);
             return;
           }
         } catch (noAuthError) {
           console.log("No auth also failed:", noAuthError);
         }
         
         setAttendanceData([]);
         setLoading(false);
         return;
       }
      
             // Set attendance data - handle the nested structure from your API
       let attendanceData = [];
       console.log("Processing attendance response:", attendanceResponse);
       
       if (attendanceResponse?.data?.logs) {
         // API returns { data: { logs: [...] } }
         attendanceData = attendanceResponse.data.logs;
         console.log("Using data.logs structure");
       } else if (attendanceResponse?.logs) {
         // API returns { logs: [...] }
         attendanceData = attendanceResponse.logs;
         console.log("Using logs structure");
       } else if (Array.isArray(attendanceResponse?.data)) {
         // API returns { data: [...] }
         attendanceData = attendanceResponse.data;
         console.log("Using data array structure");
       } else if (Array.isArray(attendanceResponse)) {
         // API returns [...] directly
         attendanceData = attendanceResponse;
         console.log("Using direct array structure");
       } else if (attendanceResponse?.data && typeof attendanceResponse.data === 'object') {
         // API might return { data: { ... } } with different structure
         attendanceData = [attendanceResponse.data];
         console.log("Using data object structure");
       } else if (attendanceResponse && typeof attendanceResponse === 'object') {
         // API might return a single object
         attendanceData = [attendanceResponse];
         console.log("Using single object structure");
       }
       
       console.log("Processed attendance data:", attendanceData);
       console.log("Attendance data length:", attendanceData.length);
       
       // Check if we got empty data with a program filter - this means backend filtering failed
       if (attendanceData.length === 0 && activeCourseTab !== "all") {
         console.log("Empty data with program filter detected, trying fallback...");
         
         // Try without program filter as fallback
         try {
           const fallbackUrl = `http://localhost/scms_new_backup/index.php/api/attendance-logs/logs`;
           console.log("Fallback URL:", fallbackUrl);
           
           const fallbackResponse = await fetch(fallbackUrl, {
             method: 'GET',
             headers: {
               'Content-Type': 'application/json',
               'Authorization': `Bearer ${localStorage.getItem('token')}`,
               'Accept': 'application/json'
             },
             mode: 'cors'
           });
           
           if (fallbackResponse.ok) {
             const fallbackData = await fallbackResponse.json();
             console.log("Fallback data:", fallbackData);
             
             // Process the fallback data
             let fallbackAttendanceData = [];
             if (fallbackData?.data?.logs) {
               fallbackAttendanceData = fallbackData.data.logs;
             } else if (fallbackData?.logs) {
               fallbackAttendanceData = fallbackData.logs;
             } else if (Array.isArray(fallbackData?.data)) {
               fallbackAttendanceData = fallbackData.data;
             } else if (Array.isArray(fallbackData)) {
               fallbackAttendanceData = fallbackData;
             }
             
             console.log("Fallback attendance data:", fallbackAttendanceData);
             
             // If we have data without program filter, we'll filter it on the frontend
             if (fallbackAttendanceData.length > 0) {
               console.log("Found data without program filter, will filter on frontend");
               setAttendanceData(Array.isArray(fallbackAttendanceData) ? fallbackAttendanceData : []);
               setLoading(false);
               return;
             }
           }
         } catch (fallbackError) {
           console.log("Fallback also failed:", fallbackError);
         }
       }
       
       setAttendanceData(Array.isArray(attendanceData) ? attendanceData : []);
      
    } catch (error) {
      console.error("Error fetching data:", error);
      setAttendanceData([]);
    } finally {
      setLoading(false);
    }
  };

     // Process attendance data
   const processData = () => {
     const processed = [];
     
     console.log("Processing attendance data:", attendanceData);
     
     // Process attendance records
     if (Array.isArray(attendanceData)) {
       attendanceData.forEach((record, index) => {
         console.log(`Processing record ${index}:`, record);
         
         const processedRecord = {
           id: record.log_id || record.id || Math.random().toString(36).substr(2, 9),
           studentName: record.student_name || record.studentName || 'Unknown',
           studentId: record.student_id_number || record.student_id || record.studentId || 'N/A',
           section: record.section_name || record.section || 'N/A',
           subject: record.subject_name || record.subject || 'N/A',
           teacherName: record.teacher_name || record.teacherName || 'N/A',
           date: record.date || record.created_at || record.timestamp || 'N/A',
           attendanceStatus: record.attendance_status || record.attendanceStatus || 'Unknown',
           excuseLetterStatus: record.excuse_status || record.excuseLetterStatus || 'N/A',
           reason: record.reason || record.remarks || '',
           attachment: record.attachment || record.attachments || null,
           type: 'attendance',
           source: 'attendance_record'
         };
         
         console.log(`Processed record ${index}:`, processedRecord);
         processed.push(processedRecord);
       });
     }
     
     console.log("Final processed data:", processed);
     return processed;
   };

  useEffect(() => {
    fetchData();
  }, [dateFrom, dateTo, activeCourseTab, selectedAttendanceStatus]);

  useEffect(() => {
    try {
      const processedData = processData();
      filterData(processedData);
    } catch (error) {
      console.error("Error processing data:", error);
      // Fallback to just attendance data
      filterData(Array.isArray(attendanceData) ? attendanceData : []);
    }
  }, [attendanceData, searchTerm, selectedSubject, selectedSection, selectedTeacher, selectedExcuseStatus]);

  // Calculate pagination
  const totalItems = filteredData.length;
  const totalPages = Math.ceil(totalItems / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedData = filteredData.slice(startIndex, endIndex);

  // Inject mobile-only margin for attendance-details-header
  const attendanceDetailsHeaderStyle = `
    @media (max-width: 767.98px) {
      .attendance-details-header {
        margin-top: 1.25rem !important;
      }
    }
  `;

  if (loading) {
    return (
      <>
        <Header showStats={false} />
        <Container className="floating-content" fluid>
          <div className="text-center py-5">
            <div className="spinner-border text-primary" role="status">
              <span className="sr-only">Loading...</span>
            </div>
          </div>
        </Container>
      </>
    );
  }

  return (
    <>
      <style>{attendanceDetailsHeaderStyle}</style>
      <Header showStats={false} />
      {/* Header Background */}
      <div className="header pb-8 pt-4 pt-md-7"></div>
      <Container className="mt-4" fluid>
        <Row style={{marginTop: '-14rem'}}>
          <Col md="12">
            {/* Filter Section with Course Tabs at the very top edge INSIDE the card */}
            <Card className="mb-4" style={{ border: '1px solid #e1e5e9', borderTopLeftRadius: 0, borderRadius: '8px', marginTop: 0 }}>
              <CardBody style={{ padding: 0 }}>
                <div className="d-flex align-items-end" style={{marginTop: 0, paddingTop: 0, paddingLeft: 0, marginLeft: 0, marginBottom: '0.75rem'}}>
                  <Nav tabs style={{marginLeft: 0, paddingLeft: 0}}>
                    <NavItem style={{marginLeft: 0, paddingLeft: 0}}>
                      <NavLink
                        className={classnames({ active: activeCourseTab === "all" })}
                        onClick={() => setActiveCourseTab("all")}
                        style={{
                          cursor: "pointer",
                          borderBottom: activeCourseTab === "all" ? "3px solid #5e72e4" : "none",
                          marginLeft: 0
                        }}
                      >
                        All
                      </NavLink>
                    </NavItem>
                    {courses.map(course => (
                      <NavItem key={course.id}>
                        <NavLink
                          className={classnames({ active: activeCourseTab === course.id })}
                          onClick={() => setActiveCourseTab(course.id)}
                          style={{
                            cursor: "pointer",
                            borderBottom: activeCourseTab === course.id ? "3px solid #5e72e4" : "none"
                          }}
                        >
                          {course.abbr}
                        </NavLink>
                      </NavItem>
                    ))}
                  </Nav>
                </div>
                {/* Filter controls below tabs */}
                <div style={{paddingLeft: '1.5rem', paddingRight: '1.5rem'}}>
                  <Row>
                    <Col md={3}>
                      <FormGroup>
                        <Label style={{ fontWeight: 600, color: '#32325d', marginBottom: '0.5rem' }}>Date From</Label>
                        <Input
                          type="date"
                          value={dateFrom}
                          onChange={(e) => setDateFrom(e.target.value)}
                          style={{
                            width: '100%',
                            background: '#fff',
                            color: dateFrom ? '#32325d' : '#8898aa',
                            border: '1px solid #e1e5e9',
                            borderRadius: '6px',
                            fontWeight: 400,
                            fontSize: '1rem',
                            height: '48px',
                            padding: '0 16px',
                            boxShadow: 'none',
                            outline: 'none',
                          }}
                        />
                      </FormGroup>
                    </Col>
                    <Col md={3}>
                      <FormGroup>
                        <Label style={{ fontWeight: 600, color: '#32325d', marginBottom: '0.5rem' }}>Date To</Label>
                        <Input
                          type="date"
                          value={dateTo}
                          onChange={(e) => setDateTo(e.target.value)}
                          style={{
                            width: '100%',
                            background: '#fff',
                            color: dateTo ? '#32325d' : '#8898aa',
                            border: '1px solid #e1e5e9',
                            borderRadius: '6px',
                            fontWeight: 400,
                            fontSize: '1rem',
                            height: '48px',
                            padding: '0 16px',
                            boxShadow: 'none',
                            outline: 'none',
                          }}
                        />
                      </FormGroup>
                    </Col>
                    <Col md={3}>
                      <FormGroup>
                        <Label style={{ fontWeight: 600, color: '#32325d', marginBottom: '0.5rem' }}>Subject</Label>
                        <Input
                          type="select"
                          value={selectedSubject}
                          onChange={(e) => setSelectedSubject(e.target.value)}
                          style={{
                            width: '100%',
                            background: '#fff',
                            color: selectedSubject ? '#32325d' : '#8898aa',
                            border: '1px solid #e1e5e9',
                            borderRadius: '6px',
                            fontWeight: 400,
                            fontSize: '1rem',
                            height: '48px',
                            padding: '0 16px',
                            boxShadow: 'none',
                            outline: 'none',
                          }}
                        >
                          <option value="">All Subjects</option>
                          {subjects.map(subject => (
                            <option key={subject} value={subject}>{subject}</option>
                          ))}
                        </Input>
                      </FormGroup>
                    </Col>
                    <Col md={3}>
                      <FormGroup>
                        <Label style={{ fontWeight: 600, color: '#32325d', marginBottom: '0.5rem' }}>Section</Label>
                        <Input
                          type="select"
                          value={selectedSection}
                          onChange={(e) => setSelectedSection(e.target.value)}
                          style={{
                            width: '100%',
                            background: '#fff',
                            color: selectedSection ? '#32325d' : '#8898aa',
                            border: '1px solid #e1e5e9',
                            borderRadius: '6px',
                            fontWeight: 400,
                            fontSize: '1rem',
                            height: '48px',
                            padding: '0 16px',
                            boxShadow: 'none',
                            outline: 'none',
                          }}
                        >
                          <option value="">All Sections</option>
                          {sections.map(section => (
                            <option key={section} value={section}>{section}</option>
                          ))}
                        </Input>
                      </FormGroup>
                    </Col>
                  </Row>
                  <Row>
                    <Col md={3}>
                      <FormGroup>
                        <Label style={{ fontWeight: 600, color: '#32325d', marginBottom: '0.5rem' }}>Teacher</Label>
                        <Input
                          type="select"
                          value={selectedTeacher}
                          onChange={(e) => setSelectedTeacher(e.target.value)}
                          style={{
                            width: '100%',
                            background: '#fff',
                            color: selectedTeacher ? '#32325d' : '#8898aa',
                            border: '1px solid #e1e5e9',
                            borderRadius: '6px',
                            fontWeight: 400,
                            fontSize: '1rem',
                            height: '48px',
                            padding: '0 16px',
                            boxShadow: 'none',
                            outline: 'none',
                          }}
                        >
                          <option value="">All Teachers</option>
                          {teachers.map(teacher => (
                            <option key={teacher} value={teacher}>{teacher}</option>
                          ))}
                        </Input>
                      </FormGroup>
                    </Col>
                    <Col md={3}>
                      <FormGroup>
                        <Label style={{ fontWeight: 600, color: '#32325d', marginBottom: '0.5rem' }}>Attendance Status</Label>
                        <Input
                          type="select"
                          value={selectedAttendanceStatus}
                          onChange={(e) => setSelectedAttendanceStatus(e.target.value)}
                          style={{
                            width: '100%',
                            background: '#fff',
                            color: selectedAttendanceStatus ? '#32325d' : '#8898aa',
                            border: '1px solid #e1e5e9',
                            borderRadius: '6px',
                            fontWeight: 400,
                            fontSize: '1rem',
                            height: '48px',
                            padding: '0 16px',
                            boxShadow: 'none',
                            outline: 'none',
                          }}
                        >
                          <option value="">All Status</option>
                          {attendanceStatuses.map(status => (
                            <option key={status} value={status}>{status}</option>
                          ))}
                        </Input>
                      </FormGroup>
                    </Col>
                    <Col md={3}>
                      <FormGroup>
                        <Label style={{ fontWeight: 600, color: '#32325d', marginBottom: '0.5rem' }}>Excuse Status</Label>
                        <Input
                          type="select"
                          value={selectedExcuseStatus}
                          onChange={(e) => setSelectedExcuseStatus(e.target.value)}
                          style={{
                            width: '100%',
                            background: '#fff',
                            color: selectedExcuseStatus ? '#32325d' : '#8898aa',
                            border: '1px solid #e1e5e9',
                            borderRadius: '6px',
                            fontWeight: 400,
                            fontSize: '1rem',
                            height: '48px',
                            padding: '0 16px',
                            boxShadow: 'none',
                            outline: 'none',
                          }}
                        >
                          <option value="">All Status</option>
                          {excuseStatuses.map(status => (
                            <option key={status} value={status}>{status}</option>
                          ))}
                        </Input>
                      </FormGroup>
                    </Col>
                    <Col md={3} className="d-flex justify-content-end align-items-end">
                      <Button
                        color="secondary"
                        outline
                        size="sm"
                        onClick={clearFilters}
                        style={{ borderRadius: '6px', fontWeight: 600, fontSize: '0.8rem', padding: '0.375rem 0.75rem', marginBottom: '1.5rem' }}
                      >
                        <i className="ni ni-refresh mr-1" />
                        Clear Filters
                      </Button>
                    </Col>
                  </Row>
                </div>
              </CardBody>
            </Card>
          </Col>
        </Row>
        {/* Card with search, filter buttons, and table */}
        <Row>
          <Col md="12">
            <Card className="shadow">
                            <CardBody style={{ background: '#fff', borderRadius: '0 0 12px 12px', padding: 0 }}>
                {/* Search and Filter Row */}
                <Row style={{ marginLeft: 0, marginRight: 0 }}>
                  <Col md="12" className="pl-3 pr-3">
                    {/* Search bar in a single row with space to the right */}
                    <div className="d-flex align-items-center mb-2" style={{ width: '100%', margin: 0, padding: 0, marginTop: '20px' }}>
                      <InputGroup style={{ width: '100%', marginBottom: '6px' }}>
                        <InputGroupAddon addonType="prepend">
                          <InputGroupText>
                            <i className="fas fa-search" />
                          </InputGroupText>
                        </InputGroupAddon>
                        <Input
                          placeholder="Search by student name or ID..."
                          value={searchTerm}
                          onChange={(e) => setSearchTerm(e.target.value)}
                          style={{ minWidth: 0 }}
                        />
                      </InputGroup>
                    </div>
                    {/* Header with count and action buttons */}
                    <div className="w-100 d-flex justify-content-between align-items-center" style={{ marginTop: '20px', marginBottom: '16px' }}>
                        {/* Summary badges */}
                        <div className="d-flex align-items-center" style={{ gap: '8px', marginBottom: '8px' }}>
                          <Badge color="primary" style={{ fontSize: '0.7rem' }}>
                            {attendanceData.length} Attendance Records
                          </Badge>
                        </div>
                      <div style={{ fontWeight: 600, fontSize: '1.1rem', color: '#32325d' }}>
                        {activeCourseTab === "all" ? "Attendance log" : courses.find(c => c.id === activeCourseTab)?.name || "Admin Attendance Log"} ({filteredData.length})
                        {loading && <Spinner size="sm" className="ml-2" />}
                      </div>
                      <div className="d-flex align-items-center" style={{ gap: 12 }}>
                         <Button
                           color="secondary"
                           outline
                           size="sm"
                           onClick={fetchData}
                           style={{ padding: '3px 10px', fontSize: '0.75rem', margin: 0 }}
                         >
                           <i className="ni ni-refresh mr-2" />
                           Refresh
                         </Button>
                         <UncontrolledDropdown className="d-inline-block">
                           <DropdownToggle color="info" outline size="sm" style={{ padding: '3px 10px', fontSize: '0.75rem', margin: 0 }}>
                             <i className="ni ni-archive-2 mr-2" /> Export
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

                {/* Table */}
                <Table className="align-items-center table-flush" responsive style={{ margin: 0, padding: 0, width: '100%' }}>
                  <thead className="thead-light">
                    <tr>
                      <th scope="col" onClick={() => handleSort('studentName')} style={{ cursor: 'pointer' }}>
                        STUDENT NAME{getSortIndicator('studentName')}
                      </th>
                      <th scope="col" onClick={() => handleSort('studentId')} style={{ cursor: 'pointer' }}>
                        STUDENT ID{getSortIndicator('studentId')}
                      </th>
                      <th scope="col" onClick={() => handleSort('section')} style={{ cursor: 'pointer' }}>
                        SECTION{getSortIndicator('section')}
                      </th>
                      <th scope="col" onClick={() => handleSort('subject')} style={{ cursor: 'pointer' }}>
                        SUBJECT{getSortIndicator('subject')}
                      </th>
                      <th scope="col" onClick={() => handleSort('teacherName')} style={{ cursor: 'pointer' }}>
                        TEACHER NAME{getSortIndicator('teacherName')}
                      </th>
                      <th scope="col" onClick={() => handleSort('date')} style={{ cursor: 'pointer' }}>
                        DATE{getSortIndicator('date')}
                      </th>
                      <th scope="col" onClick={() => handleSort('attendanceStatus')} style={{ cursor: 'pointer' }}>
                        ATTENDANCE STATUS{getSortIndicator('attendanceStatus')}
                      </th>
                      <th scope="col" onClick={() => handleSort('excuseLetterStatus')} style={{ cursor: 'pointer' }}>
                        EXCUSE STATUS{getSortIndicator('excuseLetterStatus')}
                      </th>
                      <th scope="col">REASON / REMARKS</th>
                      <th scope="col">ATTACHMENT</th>
                    </tr>
                  </thead>
                  <tbody>
                    {paginatedData.length > 0 ? (
                                             paginatedData.map((item) => (
                         <tr key={item.id}>
                           <td>
                             <div className="d-flex align-items-center">
                               <div
                                 className="avatar avatar-sm rounded-circle bg-gradient-primary mr-3"
                                 style={{ width: 32, height: 32, overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'transparent', border: '1px solid #e9ecef' }}
                               >
                                 <img 
                                   src={getRandomAvatar(item.id)} 
                                   alt={item.studentName} 
                                   style={{ width: 32, height: 32, objectFit: 'cover' }} 
                                 />
                               </div>
                               <div>
                                 <div className="font-weight-bold">{item.studentName}</div>
                               </div>
                             </div>
                           </td>
                          <td>
                            <div className="font-weight-bold">{item.studentId}</div>
                          </td>
                          <td>
                            <div className="font-weight-bold">{item.section}</div>
                          </td>
                          <td>
                            <div className="font-weight-bold">{item.subject}</div>
                          </td>
                          <td>
                            <div className="font-weight-bold">{item.teacherName}</div>
                          </td>
                          <td>{new Date(item.date).toLocaleDateString()}</td>
                          <td>{getAttendanceStatusBadge(item.attendanceStatus)}</td>
                          <td>{getExcuseStatusBadge(item.excuseLetterStatus)}</td>
                          <td>
                            <div className="text-muted" style={{ maxWidth: "200px" }}>
                              {item.reason || "-"}
                            </div>
                          </td>
                          <td>
                            {item.attachment ? (
                              <Button
                                color="info"
                                size="sm"
                                outline
                                onClick={() => openExcuseModal(item)}
                                style={{ borderRadius: '6px', fontSize: '0.75rem', padding: '0.25rem 0.5rem' }}
                              >
                                <i className="ni ni-single-copy-04 mr-1" />
                                View
                              </Button>
                            ) : (
                              <span className="text-muted">-</span>
                            )}
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan="10" className="text-center py-4">
                          <div className="text-muted">
                            <i className="ni ni-chart-bar-32" style={{ fontSize: "3rem" }} />
                            <p className="mt-2">No attendance records found</p>
                          </div>
                        </td>
                      </tr>
                    )}
                  </tbody>
                </Table>

                {/* Pagination */}
                <div style={{height: '80px', position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'space-between'}}>
                  <div className="d-flex flex-row align-items-center" style={{ marginLeft: '1.5rem' }}>
                    <span className="mr-2 text-muted small">Show</span>
                    <UncontrolledDropdown direction="down">
                      <DropdownToggle
                        caret
                        color="white"
                        style={{
                          width: '80px',
                          fontSize: '0.85rem',
                          borderRadius: '6px',
                          border: '1px solid #e1e5e9',
                          background: '#fff',
                          boxShadow: '0 2px 12px rgba(0,0,0,0.04)',
                          padding: '0.375rem 0.75rem',
                          height: '32px',
                          color: '#32325d',
                          outline: 'none',
                          transition: 'all 0.2s ease',
                          textAlign: 'left',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                        }}
                      >
                        {itemsPerPage}
                      </DropdownToggle>
                      <DropdownMenu style={{
                        borderRadius: '8px',
                        boxShadow: '0 2px 12px rgba(0,0,0,0.08), 0 1px 3px rgba(0,0,0,0.1)',
                        padding: '4px 0',
                        border: '1px solid #e1e5e9',
                        marginTop: 4,
                        minWidth: '80px',
                      }}>
                        {[5, 10, 20, 50].map(size => (
                          <DropdownItem
                            key={size}
                            onClick={() => setItemsPerPage(size)}
                            style={{
                              backgroundColor: itemsPerPage === size ? '#e7f3ff' : '#fff',
                              color: '#525f7f',
                              fontWeight: itemsPerPage === size ? 600 : 400,
                              fontSize: '0.85rem',
                              padding: '0.5rem 0.75rem',
                              transition: 'background 0.2s',
                            }}
                            onMouseOver={e => e.currentTarget.style.backgroundColor = '#e7f3ff'}
                            onMouseOut={e => e.currentTarget.style.backgroundColor = itemsPerPage === size ? '#e7f3ff' : '#fff'}
                          >
                            {size}
                          </DropdownItem>
                        ))}
                      </DropdownMenu>
                    </UncontrolledDropdown>
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
              </CardBody>
            </Card>
          </Col>
        </Row>

        {/* Modal for viewing excuse letter */}
        <Modal isOpen={modalOpen} toggle={closeModal} size="lg">
          <ModalHeader toggle={closeModal} style={{ borderBottom: 'none', fontWeight: 700, fontSize: '1.35rem', color: '#32325d' }}>
            <div className="d-flex align-items-center">
              <i className="ni ni-single-copy-04 mr-2" style={{ fontSize: 24, color: '#5e72e4' }} />
              Excuse Letter Details
            </div>
          </ModalHeader>
          <ModalBody style={{ background: '#f8f9fe', borderRadius: 16, boxShadow: '0 2px 16px rgba(50,50,93,0.07)', padding: '2rem' }}>
            {selectedRecord && (
              <div>
                <Row>
                  <Col md={6}>
                    <h6 style={{ fontSize: '1.25rem' }}><i className="ni ni-hat-3 mr-2" style={{ color: '#5e72e4', fontSize: 18 }} />Student Information</h6>
                    <p style={{ marginBottom: '0.25rem', color: '#111' }}><strong>Name:</strong> {selectedRecord.studentName}</p>
                    <p style={{ marginBottom: '0.25rem', color: '#111' }}><strong>ID:</strong> {selectedRecord.studentId}</p>
                    <p style={{ marginBottom: '0.25rem', color: '#111' }}><strong>Section:</strong> {selectedRecord.section}</p>
                  </Col>
                  <Col md={6}>
                    <h6 className="attendance-details-header" style={{ fontSize: '1.25rem' }}><i className="ni ni-calendar-grid-58 mr-2" style={{ color: '#5e72e4', fontSize: 18 }} />Attendance Details</h6>
                    <p style={{ marginBottom: '0.25rem', color: '#111' }}><strong>Date:</strong> {new Date(selectedRecord.date).toLocaleDateString()}</p>
                    <p style={{ marginBottom: '0.25rem', color: '#111' }}><strong>Subject:</strong> {selectedRecord.subject}</p>
                    <p style={{ marginBottom: '0.25rem', color: '#111' }}><strong>Teacher:</strong> {selectedRecord.teacherName}</p>
                  </Col>
                </Row>
                <hr />
                <Row>
                  <Col md={12}>
                    <h6 style={{ fontSize: '1.25rem' }}><i className="ni ni-chat-round mr-2" style={{ color: '#fb6340', fontSize: 18 }} />Reason for Absence</h6>
                    <p style={{ color: '#111' }}>{selectedRecord.reason || "No reason provided"}</p>
                  </Col>
                </Row>
                <Row>
                  <Col md={12}>
                    <h6 style={{ marginTop: '1.5rem', fontSize: '1.25rem' }}><i className="ni ni-archive-2 mr-2" style={{ color: '#5e72e4', fontSize: 18 }} />Attachment</h6>
                    {selectedRecord.attachment && (
                      <div style={{ marginTop: '1rem' }}>
                        {(() => {
                          const isImage = /\.(jpg|jpeg|png|gif|webp)$/i.test(selectedRecord.attachment);
                          const isPDF = /\.(pdf)$/i.test(selectedRecord.attachment);
                          const fileUrl = `/attachments/${selectedRecord.attachment}`; // Adjust as needed
                          if (isImage) {
                            return (
                              <div style={{ border: '1px solid #e1e5e9', borderRadius: 8, padding: 8, display: 'inline-block', background: '#f8f9fe' }}>
                                <img
                                  src={fileUrl}
                                  alt="Excuse Attachment"
                                  style={{ maxWidth: '350px', maxHeight: '350px', display: 'block', margin: '0 auto' }}
                                />
                              </div>
                            );
                          } else if (isPDF) {
                            return (
                              <div style={{ display: 'flex', alignItems: 'center', border: '1px solid #e1e5e9', borderRadius: 8, padding: '12px 16px', background: '#f8f9fe', maxWidth: 350 }}>
                                <img src="https://upload.wikimedia.org/wikipedia/commons/8/87/PDF_file_icon.svg" alt="PDF" style={{ width: 40, height: 40, marginRight: 16 }} />
                                <div style={{ flex: 1 }}>
                                  <div style={{ fontWeight: 600, color: '#32325d' }}>{selectedRecord.attachment}</div>
                                  <div style={{ fontSize: 14, color: '#8898aa' }}>PDF &bull; <a href={fileUrl} download style={{ color: '#11cdef', fontWeight: 600, textDecoration: 'none' }}>Download</a></div>
                                </div>
                              </div>
                            );
                          } else {
                            return (
                              <div style={{ display: 'flex', alignItems: 'center', border: '1px solid #e1e5e9', borderRadius: 8, padding: '12px 16px', background: '#f8f9fe', maxWidth: 350 }}>
                                <i className="ni ni-single-copy-04" style={{ fontSize: 32, color: '#5e72e4', marginRight: 16 }} />
                                <div style={{ flex: 1 }}>
                                  <div style={{ fontWeight: 600, color: '#32325d' }}>{selectedRecord.attachment}</div>
                                  <div style={{ fontSize: 14, color: '#8898aa' }}>File &bull; <a href={fileUrl} download style={{ color: '#11cdef', fontWeight: 600, textDecoration: 'none' }}>Download</a></div>
                                </div>
                              </div>
                            );
                          }
                        })()}
                      </div>
                    )}
                  </Col>
                </Row>
              </div>
            )}
          </ModalBody>
          <ModalFooter>
            <Button color="secondary" onClick={closeModal}>
              Close
            </Button>
          </ModalFooter>
        </Modal>
      </Container>
    </>
  );
};

export default AttendanceLog; 