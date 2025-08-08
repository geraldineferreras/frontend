import React, { useState, useEffect } from "react";
import {
  Card,
  CardHeader,
  CardBody,
  Container,
  Row,
  Col,
  Button,
  FormGroup,
  Input,
  Table,
  Badge,
  Modal,
  ModalHeader,
  ModalBody,
  ModalFooter,
  UncontrolledDropdown,
  DropdownToggle,
  DropdownMenu,
  DropdownItem,
  InputGroup,
  InputGroupAddon,
  InputGroupText,
  Alert,
  Spinner,
} from "reactstrap";
import { FaQrcode, FaTable, FaCheckCircle, FaTimesCircle, FaUndo, FaUser, FaDownload, FaCalendarAlt } from "react-icons/fa";
import { QrReader } from "react-qr-reader";
import apiService from "../../services/api";

const TeacherAttendance = () => {
  // State for API data
  const [teacherAssignments, setTeacherAssignments] = useState([]);
  const [students, setStudents] = useState([]);
  const [attendanceRecords, setAttendanceRecords] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // State for form controls
  const [selectedSubject, setSelectedSubject] = useState("");
  const [selectedSection, setSelectedSection] = useState("");
  const [selectedDate, setSelectedDate] = useState("");

  // Function to get current date in Philippine time (UTC+8)
  const getPhilippineDate = () => {
    const now = new Date();
    const philippineTime = new Date(now.getTime() + (8 * 60 * 60 * 1000)); // Add 8 hours for UTC+8
    return philippineTime.toISOString().split('T')[0];
  };

  // Initialize date with Philippine time
  useEffect(() => {
    setSelectedDate(getPhilippineDate());
  }, []);

  // State for modals and UI
  const [qrModal, setQrModal] = useState(false);
  const [manualTable, setManualTable] = useState(false);
  const [scannedData, setScannedData] = useState(null);
  const [noAttendance, setNoAttendance] = useState(false);
  const [successMessage, setSuccessMessage] = useState(null);

  // Clear error and success messages
  const clearMessages = () => {
    setError(null);
    setSuccessMessage(null);
  };

  // Load teacher assignments on component mount
  useEffect(() => {
    loadTeacherAssignments();
  }, []);

  // Load students when subject and section are selected
  useEffect(() => {
    if (selectedSubject && selectedSection) {
      loadStudents();
      loadAttendanceRecords();
    } else {
      // Reset students and attendance records when subject or section is not selected
      setStudents([]);
      setAttendanceRecords([]);
      setNoAttendance(false);
    }
  }, [selectedSubject, selectedSection, selectedDate]);

  const loadTeacherAssignments = async () => {
    try {
      setLoading(true);
      clearMessages();
      
      const response = await apiService.getTeacherAssignments();
      
      if (response.status && response.data) {
        // Store the data array directly since it's now a flat array
        setTeacherAssignments(response.data);
      } else {
        setError("Failed to load teacher assignments");
      }
    } catch (error) {
      console.error("Error loading teacher assignments:", error);
      // If the endpoint doesn't exist, show a helpful message
      if (error.message.includes('404') || error.message.includes('Not Found')) {
        setError("Teacher assignments endpoint not yet implemented. Please contact the administrator.");
      } else {
        setError(error.message || "Failed to load teacher assignments");
      }
    } finally {
      setLoading(false);
    }
  };

  const loadStudents = async () => {
    try {
      setLoading(true);
      clearMessages();
      
      // Find the class that matches the selected subject and section
      const classData = teacherAssignments.find(
        assignment => assignment.subject_id === selectedSubject && 
                     assignment.section_name === selectedSection
      );

      if (!classData) {
        setError("No class found for selected subject and section");
        setStudents([]);
        return;
      }

      // Use the students data directly from the assignment
      if (classData.students && Array.isArray(classData.students)) {
        setStudents(classData.students);
        setError(null); // Clear any previous errors
      } else {
        // Fallback to API calls if students data is not available
        try {
          const response = await apiService.getStudentsBySubjectAndSection(selectedSubject, selectedSection);
          if (response.status && response.data) {
            setStudents(Array.isArray(response.data) ? response.data : []);
          } else {
            setError("No students found for this class");
            setStudents([]);
          }
        } catch (error) {
          console.error("Error loading students from API:", error);
          setError("No students found for this class");
          setStudents([]);
        }
      }
    } catch (error) {
      console.error("Error loading students:", error);
      setError(error.message || "Failed to load students");
      setStudents([]);
    } finally {
      setLoading(false);
    }
  };

  const loadAttendanceRecords = async () => {
    try {
      setLoading(true);
      clearMessages();
      
      // Find the class that matches the selected subject and section
      const classData = teacherAssignments.find(
        assignment => assignment.subject_id === selectedSubject && 
                     assignment.section_name === selectedSection
      );

      if (!classData) {
        setAttendanceRecords([]);
        setNoAttendance(true);
        return;
      }

      // Use the new attendance records endpoint with class_id parameter
      const response = await apiService.getAttendanceRecordsByClassId(classData.class_id);
      
      if (response.status && response.data) {
        // The API returns {attendance_records: [...], pagination: {...}, filters: {...}}
        const attendanceRecords = response.data.attendance_records || [];
        
        // Filter attendance records for the selected date
        const filteredRecords = attendanceRecords.filter(record => 
          record.date === selectedDate
        );
        
        setAttendanceRecords(filteredRecords);
        setNoAttendance(filteredRecords.length === 0);
      } else {
        setAttendanceRecords([]);
        setNoAttendance(true);
      }
    } catch (error) {
      console.error("Error loading attendance records:", error);
      setError(error.message || "Failed to load attendance records");
      setAttendanceRecords([]);
      setNoAttendance(false);
    } finally {
      setLoading(false);
    }
  };

  const handleQrScan = async (result) => {
    if (result) {
      try {
        setScannedData(result);
        
        // Find the class that matches the selected subject and section
        const classData = teacherAssignments.find(
          assignment => assignment.subject_id === selectedSubject && 
                       assignment.section_name === selectedSection
        );

        if (!classData) {
          setError("No class found for selected subject and section");
          return;
        }

                 // Parse the QR code data - extract ID from the scanned text
         let studentId = null;
         
         // Try to extract ID from QR text (format: "IDNo: 2021305973")
         const idMatch = result.text.match(/IDNo:\s*(\d+)/);
         if (idMatch) {
           studentId = idMatch[1];
         } else {
           // Fallback: try to find any number in the text
           const numberMatch = result.text.match(/(\d+)/);
           if (numberMatch) {
             studentId = numberMatch[1];
           }
         }
         
         console.log('Scanned QR text:', result.text);
         console.log('Extracted student ID:', studentId);
         console.log('Available students:', classData.students);
         
         // Check if the scanned student is enrolled in this class
         const enrolledStudent = classData.students.find(
           student => 
             student.user_id === studentId || 
             student.student_num === studentId ||
             student.id === studentId ||
             student.student_id === studentId
         );

                 if (!enrolledStudent) {
           console.log('Student not found. Available student fields:', 
             classData.students.map(s => ({
               name: s.full_name,
               user_id: s.user_id,
               student_num: s.student_num,
               id: s.id,
               student_id: s.student_id
             }))
           );
           setError(`Student with ID ${studentId} not enrolled in this class. Please check the QR code.`);
           return;
         }

        // Function to get current time in Philippine time
        const getPhilippineTime = () => {
          const now = new Date();
          const philippineTime = new Date(now.getTime() + (8 * 60 * 60 * 1000)); // Add 8 hours for UTC+8
          return philippineTime.toISOString().split('T')[1].split('.')[0];
        };

        // Prepare attendance data for database
        const attendanceData = {
          student_id: enrolledStudent.user_id,
          subject_id: selectedSubject,
          section_name: selectedSection,
          class_id: classData.class_id,
          date: selectedDate,
          time_in: getPhilippineTime(),
          status: 'Present',
          notes: 'QR Scan Attendance',
          teacher_id: classData.teacher_id
        };

        // Save to database using the attendance record endpoint
        const response = await apiService.recordAttendance(attendanceData);
        
        if (response.status) {
          // Reload attendance records
          await loadAttendanceRecords();
          setQrModal(false);
          setScannedData(null);
          setSuccessMessage(`Attendance recorded successfully for ${enrolledStudent.full_name}!`);
          setTimeout(() => setSuccessMessage(null), 3000);
        } else {
          setError("Failed to record attendance");
        }
      } catch (error) {
        console.error("Error recording QR attendance:", error);
        setError(error.message || "Failed to record attendance");
      }
    }
  };

  const handleManualAttendanceUpdate = async (studentId, status) => {
    try {
      setLoading(true);
      clearMessages();
      
      // Find the class that matches the selected subject and section
      const classData = teacherAssignments.find(
        assignment => assignment.subject_id === selectedSubject && 
                     assignment.section_name === selectedSection
      );

      if (!classData) {
        setError("No class found for selected subject and section");
        return;
      }
      
      // Find existing attendance record for this student on this date
      const existingRecord = attendanceRecords.find(
        record => record.student_id === studentId && record.date === selectedDate
      );

      if (existingRecord) {
        // Update existing record
        const response = await apiService.updateAttendanceRecord(existingRecord.attendance_id, { 
          status: status,
          notes: 'Manual Attendance Update'
        });
        
        if (response.status) {
          await loadAttendanceRecords();
          // Find the student name for the success message
          const student = students.find(s => s.user_id === studentId);
          const studentName = student ? student.full_name : 'Student';
          setSuccessMessage(`Attendance updated successfully for ${studentName}!`);
          setTimeout(() => setSuccessMessage(null), 3000);
        } else {
          setError("Failed to update attendance");
        }
      } else {
        // Function to get current time in Philippine time
        const getPhilippineTime = () => {
          const now = new Date();
          const philippineTime = new Date(now.getTime() + (8 * 60 * 60 * 1000)); // Add 8 hours for UTC+8
          return philippineTime.toISOString().split('T')[1].split('.')[0];
        };

        // Create new record
        const attendanceData = {
          student_id: studentId,
          subject_id: selectedSubject,
          section_name: selectedSection,
          class_id: classData.class_id,
          date: selectedDate,
          time_in: getPhilippineTime(),
          status: status,
          notes: 'Manual Attendance',
          teacher_id: classData.teacher_id
        };

        const response = await apiService.recordAttendance(attendanceData);
        
        if (response.status) {
          await loadAttendanceRecords();
          // Find the student name for the success message
          const student = students.find(s => s.user_id === studentId);
          const studentName = student ? student.full_name : 'Student';
          setSuccessMessage(`Attendance recorded successfully for ${studentName}!`);
          setTimeout(() => setSuccessMessage(null), 3000);
        } else {
          setError("Failed to record attendance");
        }
      }
    } catch (error) {
      console.error("Error updating attendance:", error);
      setError(error.message || "Failed to update attendance");
    } finally {
      setLoading(false);
    }
  };

  const handleExportAttendance = async () => {
    try {
      setLoading(true);
      clearMessages();
      
      // Find the class that matches the selected subject and section
      const classData = teacherAssignments.find(
        assignment => assignment.subject_id === selectedSubject && 
                     assignment.section_name === selectedSection
      );

      if (!classData) {
        setError("No class found for selected subject and section");
        return;
      }

      // Create CSV content from existing attendance data
      const csvContent = generateCSVContent();
      
      if (csvContent) {
        // Create and download the file
        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `attendance_${selectedDate}_${classData.section_name}.csv`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
        
        setSuccessMessage("Attendance exported successfully!");
        setTimeout(() => setSuccessMessage(null), 3000);
      } else {
        setError("No attendance data to export");
      }
    } catch (error) {
      console.error("Error exporting attendance:", error);
      setError(error.message || "Failed to export attendance");
    } finally {
      setLoading(false);
    }
  };

  // Function to generate CSV content from attendance data
  const generateCSVContent = () => {
    if (!students.length) {
      return null;
    }

    // CSV headers
    const headers = [
      'Student Name',
      'Student ID',
      'Status',
      'Time In',
      'Notes',
      'Subject',
      'Section',
      'Date'
    ];

    // Get subject name
    const subject = getUniqueSubjects().find(s => s.id === selectedSubject);
    const subjectName = subject ? subject.name : 'Unknown Subject';

    // Create CSV rows
    const rows = students.map(student => {
      const attendanceRecord = attendanceRecords.find(record => record.student_id === student.user_id);
      const status = attendanceRecord ? attendanceRecord.status : 'Not Recorded';
      const timeIn = attendanceRecord ? attendanceRecord.time_in : 'N/A';
      const notes = attendanceRecord ? attendanceRecord.notes : '';

      return [
        student.full_name,
        student.student_num || student.user_id,
        status,
        timeIn,
        notes,
        subjectName,
        selectedSection,
        selectedDate
      ];
    });

    // Combine headers and rows
    const csvData = [headers, ...rows];
    
    // Convert to CSV format
    const csvContent = csvData.map(row => 
      row.map(cell => `"${cell}"`).join(',')
    ).join('\n');

    return csvContent;
  };

  // Get unique subjects and sections from teacher assignments
  const getUniqueSubjects = () => {
    if (!Array.isArray(teacherAssignments) || teacherAssignments.length === 0) {
      return [];
    }
    
    const subjects = teacherAssignments.map(assignment => ({
      id: assignment.subject_id,
      name: assignment.subject_name,
      code: assignment.subject_code
    }));
    
    return subjects.filter((subject, index, self) => 
      index === self.findIndex(s => s.id === subject.id)
    );
  };

  const getSectionsForSubject = (subjectId) => {
    if (!Array.isArray(teacherAssignments) || teacherAssignments.length === 0) {
      return [];
    }
    
    return teacherAssignments
      .filter(assignment => assignment.subject_id === subjectId)
      .map(assignment => ({
        name: assignment.section_name,
        student_count: assignment.student_count || 0
      }))
      .filter((section, index, self) => 
        index === self.findIndex(s => s.name === section.name)
      );
  };

  const getAttendanceStatus = (studentId) => {
    const record = attendanceRecords.find(record => record.student_id === studentId);
    return record ? record.status : 'Not Recorded';
  };

  const getStatusBadge = (status) => {
    const statusColors = {
      'Present': 'success',
      'Late': 'warning',
      'Absent': 'danger',
      'Excused': 'info',
      'Not Recorded': 'secondary'
    };
    
    return (
      <Badge color={statusColors[status] || 'secondary'} className="font-weight-bold">
        {status}
      </Badge>
    );
  };

  return (
    <>
             <Container className="mt-4" fluid>
                 {/* Error Alert */}
         {error && (
           <Alert color="danger" className="mb-4">
             <i className="fas fa-exclamation-triangle mr-2" />
             {error}
           </Alert>
         )}

         {/* Success Alert */}
         {successMessage && (
           <Alert color="success" className="mb-4">
             <i className="fas fa-check-circle mr-2" />
             {successMessage}
           </Alert>
         )}

        {/* Loading Spinner */}
        {loading && (
          <div className="text-center mb-4">
            <Spinner color="primary" />
            <span className="ml-2">Loading...</span>
          </div>
        )}

                 {/* Attendance Summary Cards */}
         <Row className="mb-4">
           <Col xs={12} sm={3} className="mb-3">
             <Card className="shadow border-0">
               <CardBody className="py-3">
                 <Row className="align-items-center">
                   <Col>
                     <h6 className="text-uppercase text-muted ls-1 mb-1">Total Students</h6>
                     <h5 className="h3 mb-0 text-info">
                       {students.length}
                     </h5>
                   </Col>
                   <Col className="col-auto">
                     <div className="icon icon-shape bg-gradient-info text-white rounded-circle shadow">
                       <FaUser />
                     </div>
                   </Col>
                 </Row>
               </CardBody>
             </Card>
           </Col>
           <Col xs={12} sm={3} className="mb-3">
             <Card className="shadow border-0">
               <CardBody className="py-3">
                 <Row className="align-items-center">
                   <Col>
                     <h6 className="text-uppercase text-muted ls-1 mb-1">Present</h6>
                     <h5 className="h3 mb-0 text-success">
                       {attendanceRecords.filter(r => r.status === 'Present').length}
                     </h5>
                   </Col>
                   <Col className="col-auto">
                     <div className="icon icon-shape bg-gradient-success text-white rounded-circle shadow">
                       <FaCheckCircle />
                     </div>
                   </Col>
                 </Row>
               </CardBody>
             </Card>
           </Col>
           <Col xs={12} sm={3} className="mb-3">
             <Card className="shadow border-0">
               <CardBody className="py-3">
                 <Row className="align-items-center">
                   <Col>
                     <h6 className="text-uppercase text-muted ls-1 mb-1">Late</h6>
                     <h5 className="h3 mb-0 text-warning">
                       {attendanceRecords.filter(r => r.status === 'Late').length}
                     </h5>
                   </Col>
                   <Col className="col-auto">
                     <div className="icon icon-shape bg-gradient-warning text-white rounded-circle shadow">
                       <FaTimesCircle />
                     </div>
                   </Col>
                 </Row>
               </CardBody>
             </Card>
           </Col>
           <Col xs={12} sm={3} className="mb-3">
             <Card className="shadow border-0">
               <CardBody className="py-3">
                 <Row className="align-items-center">
                   <Col>
                     <h6 className="text-uppercase text-muted ls-1 mb-1">Absent</h6>
                     <h5 className="h3 mb-0 text-danger">
                       {attendanceRecords.filter(r => r.status === 'Absent').length}
                     </h5>
                   </Col>
                   <Col className="col-auto">
                     <div className="icon icon-shape bg-gradient-danger text-white rounded-circle shadow">
                       <FaUser />
                     </div>
                   </Col>
                 </Row>
               </CardBody>
             </Card>
           </Col>
           <Col xs={12} sm={3} className="mb-3">
             <Card className="shadow border-0">
               <CardBody className="py-3">
                 <Row className="align-items-center">
                   <Col>
                     <h6 className="text-uppercase text-muted ls-1 mb-1">Excused</h6>
                     <h5 className="h3 mb-0 text-info">
                       {attendanceRecords.filter(r => r.status === 'Excused').length}
                     </h5>
                   </Col>
                   <Col className="col-auto">
                     <div className="icon icon-shape bg-gradient-info text-white rounded-circle shadow">
                       <FaUndo />
                     </div>
                   </Col>
                 </Row>
               </CardBody>
             </Card>
           </Col>
         </Row>

        {/* Main Controls */}
        <Card className="shadow">
          <CardBody>
                         <Row className="mb-2 align-items-center g-2">
               <Col xs={12} sm={6} md={3} className="d-flex align-items-center mb-3 mb-sm-0">
                 <FormGroup className="w-100">
                   <label className="form-control-label mb-2">Select Subject</label>
                   <UncontrolledDropdown className="w-100">
                                           <DropdownToggle
                        caret
                        color="primary"
                        className="w-100 text-left font-weight-bold shadow"
                        style={{ 
                          borderRadius: "8px", 
                          height: "44px", 
                          display: "flex", 
                          alignItems: "center",
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                          whiteSpace: "nowrap"
                        }}
                      >
                        <span style={{ 
                          overflow: "hidden", 
                          textOverflow: "ellipsis", 
                          whiteSpace: "nowrap",
                          flex: 1
                        }}>
                          {loading ? "Loading..." : selectedSubject ? (() => {
                            const subject = getUniqueSubjects().find(s => s.id === selectedSubject);
                            return subject ? `${subject.name} (${subject.code})` : "Choose a subject...";
                          })() : "Choose a subject..."}
                        </span>
                      </DropdownToggle>
                                           <DropdownMenu className="w-100">
                        {getUniqueSubjects().length > 0 ? (
                          getUniqueSubjects().map((subject) => (
                            <DropdownItem
                              key={subject.id}
                              onClick={() => {
                                setSelectedSubject(subject.id.toString());
                                setSelectedSection("");
                              }}
                              style={{
                                overflow: "hidden",
                                textOverflow: "ellipsis",
                                whiteSpace: "nowrap",
                                padding: "8px 12px"
                              }}
                            >
                              {subject.name} ({subject.code})
                            </DropdownItem>
                          ))
                        ) : (
                          <DropdownItem disabled>
                            No subjects available
                          </DropdownItem>
                        )}
                      </DropdownMenu>
                   </UncontrolledDropdown>
                 </FormGroup>
               </Col>
               <Col xs={12} sm={6} md={2} className="d-flex align-items-center mb-3 mb-sm-0">
                 <FormGroup className="w-100">
                   <label className="form-control-label mb-2">Select Section</label>
                   <UncontrolledDropdown className="w-100">
                                           <DropdownToggle
                        caret
                        color="primary"
                        className="w-100 text-left font-weight-bold shadow"
                        style={{ 
                          borderRadius: "8px", 
                          height: "44px", 
                          display: "flex", 
                          alignItems: "center",
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                          whiteSpace: "nowrap"
                        }}
                        disabled={!selectedSubject}
                      >
                        <span style={{ 
                          overflow: "hidden", 
                          textOverflow: "ellipsis", 
                          whiteSpace: "nowrap",
                          flex: 1
                        }}>
                          {loading ? "Loading..." : selectedSection || "Choose a section..."}
                        </span>
                      </DropdownToggle>
                                           <DropdownMenu className="w-100">
                                                 {selectedSubject && getSectionsForSubject(selectedSubject).length > 0 ? (
                           getSectionsForSubject(selectedSubject).map((section) => (
                             <DropdownItem
                               key={section.name}
                               onClick={() => setSelectedSection(section.name)}
                               style={{
                                 overflow: "hidden",
                                 textOverflow: "ellipsis",
                                 whiteSpace: "nowrap",
                                 padding: "8px 12px"
                               }}
                             >
                               {section.name} ({section.student_count} students)
                             </DropdownItem>
                           ))
                         ) : (
                          <DropdownItem disabled>
                            {selectedSubject ? "No sections available for this subject" : "Please select a subject first"}
                          </DropdownItem>
                        )}
                      </DropdownMenu>
                   </UncontrolledDropdown>
                 </FormGroup>
               </Col>
               <Col xs={12} sm={6} md={2} className="d-flex align-items-center mb-3 mb-sm-0">
                 <FormGroup className="w-100">
                   <label className="form-control-label mb-2">Date</label>
                   <Input
                     type="date"
                     value={selectedDate}
                     onChange={(e) => setSelectedDate(e.target.value)}
                     className="form-control-alternative shadow"
                     style={{ borderRadius: "8px", height: "44px" }}
                   />
                 </FormGroup>
               </Col>
               <Col xs={12} sm={6} md={2} className="d-flex align-items-center mb-3 mb-sm-0">
                 <Button
                   color="success"
                   className="w-100 font-weight-bold shadow"
                   style={{ height: "44px", borderRadius: "8px", whiteSpace: "nowrap", fontSize: "0.875rem" }}
                   onClick={() => setQrModal(true)}
                   disabled={!selectedSubject || !selectedSection}
                 >
                   <FaQrcode className="mr-2" /> Start QR Scan
                 </Button>
               </Col>
               <Col xs={12} sm={6} md={3} className="d-flex align-items-center mb-3 mb-sm-0">
                 <Button
                   color="info"
                   className="w-100 font-weight-bold shadow"
                   style={{ height: "44px", borderRadius: "8px", whiteSpace: "nowrap", fontSize: "0.875rem" }}
                   onClick={() => setManualTable(true)}
                   disabled={!selectedSubject || !selectedSection}
                 >
                   <FaTable className="mr-2" /> View Manual Attendance
                 </Button>
               </Col>
             </Row>
          </CardBody>
        </Card>

        {/* Attendance Log Table */}
        <Card className="shadow mt-4">
                     <CardHeader>
             <Row className="align-items-center">
               <Col xs={12} sm={6}>
                 <h3 className="mb-0">
                   Attendance Log
                   {students.length > 0 && (
                     <span className="text-muted ml-2" style={{ fontSize: '0.9rem' }}>
                       ({students.length} students enrolled)
                     </span>
                   )}
                 </h3>
               </Col>
               <Col xs={12} sm={6} className="text-right mt-2 mt-sm-0">
                 <Button 
                   color="secondary" 
                   bsSize="sm" 
                   onClick={handleExportAttendance}
                   disabled={!selectedSubject || !selectedSection}
                   className="mr-2"
                 >
                   <FaDownload className="mr-2" /> Export Attendance
                 </Button>
                 <Button color="info" bsSize="sm" onClick={() => setManualTable(true)}>
                   <FaTable className="mr-2" /> Manual Edit
                 </Button>
               </Col>
             </Row>
           </CardHeader>
                                <CardBody>
             {noAttendance && students.length === 0 ? (
               <Alert color="info" className="text-center">
                 <i className="fas fa-info-circle mr-2" />
                 No attendance records found for the selected criteria.
               </Alert>
             ) : (
               <>
                 {students.length > 0 && noAttendance && (
                   <Alert color="warning" className="mb-3">
                     <i className="fas fa-exclamation-triangle mr-2" />
                     Students are loaded but no attendance records exist yet. You can record attendance using the buttons below.
                   </Alert>
                 )}
                 <div className="table-responsive">
                <Table className="align-items-center table-flush">
                                     <thead className="thead-light">
                     <tr>
                       <th scope="col">Student</th>
                       <th scope="col">Student ID</th>
                       <th scope="col">Status</th>
                       <th scope="col">Time In</th>
                       <th scope="col">Notes</th>
                       <th scope="col">Actions</th>
                     </tr>
                   </thead>
                  <tbody>
                    {Array.isArray(students) && students.length > 0 ? (
                      students.map((student) => {
                        const status = getAttendanceStatus(student.user_id);
                        return (
                                                     <tr key={student.user_id}>
                             <td>
                               <div className="media align-items-center">
                                 <div className="media-body">
                                   <span className="name mb-0 text-sm">
                                     {student.full_name}
                                   </span>
                                 </div>
                               </div>
                             </td>
                             <td>
                               <span className="text-sm font-weight-bold text-info">
                                 {student.student_num || student.user_id}
                               </span>
                             </td>
                             <td>
                               {getStatusBadge(status)}
                             </td>
                             <td>
                               {status ? (
                                 <span className="text-sm">
                                   {attendanceRecords.find(r => r.student_id === student.user_id)?.time_in || 'N/A'}
                                 </span>
                               ) : (
                                 <span className="text-muted">-</span>
                               )}
                             </td>
                             <td>
                               <Input
                                 type="text"
                                 placeholder="Add notes..."
                                 bsSize="sm"
                                 className="form-control-sm"
                                 style={{ fontSize: '0.875rem' }}
                                 defaultValue={attendanceRecords.find(r => r.student_id === student.user_id)?.notes || ''}
                                 onChange={(e) => {
                                   // Update notes in attendance record
                                   const record = attendanceRecords.find(r => r.student_id === student.user_id);
                                   if (record) {
                                     // Update notes logic here if needed
                                   }
                                 }}
                               />
                             </td>
                             <td>
                               <Button
                                 bsSize="sm"
                                 color="info"
                                 onClick={() => setManualTable(true)}
                                 disabled={loading}
                                 title="Edit attendance"
                               >
                                 <FaTable />
                               </Button>
                             </td>
                           </tr>
                        );
                      })
                    ) : (
                                             <tr>
                         <td colSpan="6" className="text-center text-muted">
                           {!selectedSubject || !selectedSection ? 
                             "Please select a subject and section to view students" : 
                             "No students found for the selected criteria"
                           }
                         </td>
                       </tr>
                    )}
                  </tbody>
                </Table>
                               </div>
               </>
             )}
           </CardBody>
        </Card>
      </Container>

             {/* QR Scanner Modal */}
       <Modal isOpen={qrModal} toggle={() => setQrModal(false)} size="md">
         <ModalHeader toggle={() => setQrModal(false)}>
           <FaQrcode className="mr-2" />
           QR Code Scanner
         </ModalHeader>
         <ModalBody>
           <div className="text-center">
             <QrReader
               onResult={handleQrScan}
               constraints={{ facingMode: "environment" }}
               style={{ width: "400px", height: "300px", margin: "0 auto" }}
             />
             {scannedData && (
               <Alert color="success" className="mt-3">
                 <i className="fas fa-check-circle mr-2" />
                 QR Code scanned successfully!
               </Alert>
             )}
           </div>
         </ModalBody>
         <ModalFooter>
           <Button color="secondary" onClick={() => setQrModal(false)}>
             Close
           </Button>
         </ModalFooter>
       </Modal>

      {/* Manual Attendance Table Modal */}
      <Modal isOpen={manualTable} toggle={() => setManualTable(false)} size="xl">
        <ModalHeader toggle={() => setManualTable(false)}>
          <FaTable className="mr-2" />
          Manual Attendance Table
        </ModalHeader>
        <ModalBody>
          <div className="table-responsive">
            <Table className="align-items-center table-flush">
              <thead className="thead-light">
                <tr>
                  <th scope="col">Student</th>
                  <th scope="col">Present</th>
                  <th scope="col">Late</th>
                  <th scope="col">Absent</th>
                  <th scope="col">Excused</th>
                </tr>
              </thead>
              <tbody>
                {Array.isArray(students) && students.length > 0 ? (
                  students.map((student) => {
                    const status = getAttendanceStatus(student.user_id);
                    return (
                      <tr key={student.user_id}>
                        <td>
                          <div className="media align-items-center">
                            <div className="media-body">
                              <span className="name mb-0 text-sm">
                                {student.full_name}
                              </span>
                            </div>
                          </div>
                        </td>
                        <td>
                          <Button
                            bsSize="sm"
                            color={status === 'Present' ? 'success' : 'outline-success'}
                            onClick={() => handleManualAttendanceUpdate(student.user_id, 'Present')}
                            disabled={loading}
                          >
                            <FaCheckCircle />
                          </Button>
                        </td>
                        <td>
                          <Button
                            bsSize="sm"
                            color={status === 'Late' ? 'warning' : 'outline-warning'}
                            onClick={() => handleManualAttendanceUpdate(student.user_id, 'Late')}
                            disabled={loading}
                          >
                            <FaTimesCircle />
                          </Button>
                        </td>
                        <td>
                          <Button
                            bsSize="sm"
                            color={status === 'Absent' ? 'danger' : 'outline-danger'}
                            onClick={() => handleManualAttendanceUpdate(student.user_id, 'Absent')}
                            disabled={loading}
                          >
                            <FaUser />
                          </Button>
                        </td>
                        <td>
                          <Button
                            bsSize="sm"
                            color={status === 'Excused' ? 'info' : 'outline-info'}
                            onClick={() => handleManualAttendanceUpdate(student.user_id, 'Excused')}
                            disabled={loading}
                          >
                            <FaUndo />
                          </Button>
                        </td>
                      </tr>
                    );
                  })
                ) : (
                  <tr>
                    <td colSpan="5" className="text-center text-muted">
                      {!selectedSubject || !selectedSection ? 
                        "Please select a subject and section to view students" : 
                        "No students found for the selected criteria"
                      }
                    </td>
                  </tr>
                )}
              </tbody>
            </Table>
          </div>
        </ModalBody>
        <ModalFooter>
          <Button color="secondary" onClick={() => setManualTable(false)}>
            Close
          </Button>
        </ModalFooter>
      </Modal>
    </>
  );
};

export default TeacherAttendance;
