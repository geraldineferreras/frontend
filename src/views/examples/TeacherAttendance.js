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
import { FaQrcode, FaTable, FaCheckCircle, FaTimesCircle, FaUndo, FaUser, FaDownload, FaCalendarAlt, FaClock } from "react-icons/fa";
import LottieLoader from "components/LottieLoader";
import { QrReader } from "react-qr-reader";
import apiService from "../../services/api";
import useMinDelay from "utils/useMinDelay";

const TeacherAttendance = () => {
  // State for API data
  const [classes, setClasses] = useState([]);
  const [attendanceData, setAttendanceData] = useState(null);
  const [loading, setLoading] = useState(false);
  const showLoader = useMinDelay(loading, 1600);
  const [error, setError] = useState(null);

  // State for form controls
  const [selectedClass, setSelectedClass] = useState("");
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
  const [successMessage, setSuccessMessage] = useState(null);
  const [showEndSessionConfirm, setShowEndSessionConfirm] = useState(false);

  // State for QR attendance session management
  const [qrSessionStartTime, setQrSessionStartTime] = useState(null);
  const [sessionStartedAt, setSessionStartedAt] = useState(null); // ISO string
  const [isQrSessionActive, setIsQrSessionActive] = useState(false);
  const gracePeriodMinutes = 15; // 15 minutes grace period
  const [scanLock, setScanLock] = useState(false);
  const [lastScan, setLastScan] = useState({ studentId: null, at: 0 });
  const SCAN_COOLDOWN_MS = 1800; // avoid rapid duplicate requests
  const [timerTick, setTimerTick] = useState(0); // force re-render for countdown
  const [lateMode, setLateMode] = useState(false);
  const [graceExpired, setGraceExpired] = useState(false);

  // Clear error and success messages
  const clearMessages = () => {
    setError(null);
    setSuccessMessage(null);
  };

  // Function to start QR attendance session
  const startQrAttendanceSession = () => {
    if (isQrSessionActive) {
      setError("A QR attendance session is already active. Please end the current session first.");
      return;
    }
    
    const now = new Date();
    setQrSessionStartTime(now);
    setSessionStartedAt(now.toISOString());
    try {
      localStorage.setItem('qrSessionStartedAt', now.toISOString());
    } catch (_) {}
    setIsQrSessionActive(true);
    setQrModal(true);
    setGraceExpired(false);
    setSuccessMessage("QR attendance session started! Students have 15 minutes to scan.");
    setTimeout(() => setSuccessMessage(null), 3000);
  };

  // Function to resume existing QR session (when modal is reopened)
  const resumeQrSession = () => {
    if (!isQrSessionActive) {
      setError("No active QR session to resume. Please start a new session first.");
      return;
    }
    
    // Check if session has expired
    if (!isWithinGracePeriod()) {
      setError("The current QR session has expired. Please start a new session.");
      // Auto-end expired session
      endQrAttendanceSession();
      return;
    }
    
    // hydrate from localStorage if needed
    try {
      const stored = localStorage.getItem('qrSessionStartedAt');
      if (stored) setSessionStartedAt(stored);
    } catch (_) {}
    setQrModal(true);
    setSuccessMessage(`Resumed QR session with ${formatMsToMMSS(getRemainingGraceMs())} remaining.`);
    setTimeout(() => setSuccessMessage(null), 3000);
  };

  // Function to end QR attendance session
  const endQrAttendanceSession = () => {
    setIsQrSessionActive(false);
    setQrSessionStartTime(null);
    setQrModal(false);
    setShowEndSessionConfirm(false);
    setSessionStartedAt(null);
    try { localStorage.removeItem('qrSessionStartedAt'); } catch (_) {}
    setLateMode(false);
    setGraceExpired(false);
    setSuccessMessage("QR attendance session ended.");
    setTimeout(() => setSuccessMessage(null), 3000);
  };

  // Function to confirm ending session
  const confirmEndSession = () => {
    setShowEndSessionConfirm(true);
  };

  // Function to check if current time is within grace period
  const isWithinGracePeriod = () => {
    if (!isQrSessionActive) return false;
    const baseIso = sessionStartedAt || (typeof localStorage !== 'undefined' && localStorage.getItem('qrSessionStartedAt')) || null;
    const baseTime = baseIso ? new Date(baseIso) : qrSessionStartTime;
    if (!baseTime) return false;
    const now = new Date();
    const minutesDiff = (now.getTime() - baseTime.getTime()) / (1000 * 60);
    return minutesDiff <= gracePeriodMinutes;
  };

  // Function to get remaining grace period time (minutes)
  const getRemainingGraceTime = () => {
    if (!isQrSessionActive) return 0;
    const baseIso = sessionStartedAt || (typeof localStorage !== 'undefined' && localStorage.getItem('qrSessionStartedAt')) || null;
    const base = baseIso ? new Date(baseIso) : qrSessionStartTime;
    if (!base) return 0;
    const remainingMs = Math.max(0, (gracePeriodMinutes * 60 * 1000) - (Date.now() - base.getTime()));
    return Math.ceil(remainingMs / 60000);
  };

  // Remaining ms for mm:ss display
  const getRemainingGraceMs = () => {
    if (!isQrSessionActive) return 0;
    const baseIso = sessionStartedAt || (typeof localStorage !== 'undefined' && localStorage.getItem('qrSessionStartedAt')) || null;
    const base = baseIso ? new Date(baseIso) : qrSessionStartTime;
    if (!base) return 0;
    return Math.max(0, (gracePeriodMinutes * 60 * 1000) - (Date.now() - base.getTime()));
  };

  const formatMsToMMSS = (ms) => {
    const total = Math.ceil(ms / 1000);
    const m = Math.floor(total / 60);
    const s = total % 60;
    return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
  };

  // Load classes on component mount
  useEffect(() => {
    loadClasses();
  }, []);

  // Load attendance records when class and date are selected
  useEffect(() => {
    if (selectedClass && selectedDate) {
      loadAttendanceRecords();
    } else {
      // Reset attendance data when class or date is not selected
      setAttendanceData(null);
    }
  }, [selectedClass, selectedDate]);

  // Timer effect for QR session countdown (update every second)
  useEffect(() => {
    let interval;
    if (isQrSessionActive && qrSessionStartTime) {
      interval = setInterval(() => {
        setTimerTick((t) => (t + 1) % 1_000_000);
        // When grace period ends, fully end timed session and mark graceExpired
        if (!isWithinGracePeriod()) {
          setIsQrSessionActive(false);
          setQrSessionStartTime(null);
          setSessionStartedAt(null);
          try { localStorage.removeItem('qrSessionStartedAt'); } catch (_) {}
          if (qrModal) setQrModal(false);
          setGraceExpired(true);
          setLateMode(false);
          setSuccessMessage("Grace period ended. Enable Late Mode to scan late students.");
          setTimeout(() => setSuccessMessage(null), 4000);
        }
      }, 1000);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isQrSessionActive, qrSessionStartTime, sessionStartedAt]);

  const loadClasses = async () => {
    try {
      setLoading(true);
      clearMessages();
      
      const response = await apiService.getAttendanceClasses();
      
      if (response.status && response.data) {
        setClasses(response.data);
      } else {
        setError("Failed to load classes");
      }
    } catch (error) {
      console.error("Error loading classes:", error);
      setError(error.message || "Failed to load classes");
    } finally {
      setLoading(false);
    }
  };

  const loadAttendanceRecords = async () => {
    try {
      setLoading(true);
      clearMessages();
      
      const response = await apiService.getAttendanceRecordsByClassAndDate(selectedClass, selectedDate);
      
      if (response.status && response.data) {
        setAttendanceData(response.data);
      } else {
        setAttendanceData(null);
      }
    } catch (error) {
      console.error("Error loading attendance records:", error);
      setError(error.message || "Failed to load attendance records");
      setAttendanceData(null);
    } finally {
      setLoading(false);
    }
  };

  const handleQrScan = async (result) => {
    if (result) {
      if (scanLock) return;
      try {
        setScanLock(true);
        setScannedData(result);
        
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
        
        if (!studentId) {
          setError("Could not extract student ID from QR code");
          return;
        }

        // Throttle duplicate scan of the same student within 4s
        if (studentId && lastScan.studentId === studentId && (Date.now() - lastScan.at) < 4000) {
          return; // ignore duplicate
        }

        // Check if the scanned student is enrolled in this class
        const enrolledStudent = attendanceData?.records?.find(
          record => 
            record.student_id === studentId || 
            record.student_num === studentId
        );

        if (!enrolledStudent) {
          setError(`Student with ID ${studentId} not enrolled in this class. Please check the QR code.`);
          return;
        }

        // Check if QR session is active
        if (!isQrSessionActive) {
          setError("QR attendance session is not active. Please start the session first.");
          return;
        }

        // Check if the session is outside grace; allow if Late Mode is enabled
        if (!isWithinGracePeriod() && !lateMode) {
          setError("QR attendance grace period ended. Enable Late Mode to continue scanning.");
          return;
        }

        // Function to get current time in Philippine time
        const getPhilippineTime = () => {
          const now = new Date();
          const philippineTime = new Date(now.getTime() + (8 * 60 * 60 * 1000)); // Add 8 hours for UTC+8
          return philippineTime.toISOString().split('T')[1].split('.')[0];
        };

        // Determine attendance status based on grace period and Late Mode
        let attendanceStatus = 'Present';
        let notes = 'QR Scan Attendance';
        if (lateMode || !isWithinGracePeriod()) {
          attendanceStatus = 'Late';
          notes = lateMode ? 'QR Scan Attendance - Late Mode' : 'QR Scan Attendance - Scanned after grace period';
        }

        // Prepare attendance data for database
        const newAttendanceRecord = {
          student_id: enrolledStudent.student_id,
          subject_id: attendanceData.classroom.subject_id,
          section_name: attendanceData.classroom.section_name,
          class_id: selectedClass,
          date: selectedDate,
          // compute on frontend; Late Mode forces 'Late'
          status: (lateMode || !isWithinGracePeriod()) ? 'Late' : 'Present',
          session_started_at: (sessionStartedAt || (typeof localStorage !== 'undefined' && localStorage.getItem('qrSessionStartedAt'))) || new Date().toISOString(),
          time_in: getPhilippineTime(),
          notes: notes,
          teacher_id: attendanceData.classroom.teacher_id
        };

        // Save to database using the attendance record endpoint
        const response = await apiService.recordAttendance(newAttendanceRecord);
        
        if (response.status) {
          // Reload attendance records
          await loadAttendanceRecords();
          
          // Show success message with status
          const statusMessage = attendanceStatus === 'Present' 
            ? `Attendance recorded successfully for ${enrolledStudent.student_name}! (Present)`
            : `Attendance recorded for ${enrolledStudent.student_name}! (Late - scanned after grace period)`;
          
          setSuccessMessage(statusMessage);
          setTimeout(() => setSuccessMessage(null), 3000);
          
          // Don't close modal automatically - let teacher continue scanning
          setScannedData(null);
          setLastScan({ studentId, at: Date.now() });
        } else {
          setError("Failed to record attendance");
        }
      } catch (error) {
        console.error("Error recording QR attendance:", error);
        setError(error.message || "Failed to record attendance");
      } finally {
        setTimeout(() => setScanLock(false), SCAN_COOLDOWN_MS);
      }
    }
  };

  const handleManualAttendanceUpdate = async (studentId, status) => {
    try {
      setLoading(true);
      clearMessages();
      
      // Find existing attendance record for this student on this date
      const existingRecord = attendanceData?.records?.find(
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
          const student = attendanceData.records.find(s => s.student_id === studentId);
          const studentName = student ? student.student_name : 'Student';
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
        const newAttendanceRecord = {
          student_id: studentId,
          subject_id: attendanceData.classroom.subject_id,
          section_name: attendanceData.classroom.section_name,
          class_id: selectedClass,
          date: selectedDate,
          time_in: getPhilippineTime(),
          status: status,
          notes: 'Manual Attendance',
          teacher_id: attendanceData.classroom.teacher_id
        };

        const response = await apiService.recordAttendance(newAttendanceRecord);
        
        if (response.status) {
          await loadAttendanceRecords();
          // Find the student name for the success message
          const student = attendanceData.records.find(s => s.student_id === studentId);
          const studentName = student ? student.student_name : 'Student';
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
      
      if (!attendanceData) {
        setError("No attendance data to export");
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
        a.download = `attendance_${selectedDate}_${attendanceData.classroom?.title || 'class'}.csv`;
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
    if (!attendanceData?.records?.length) {
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

    // Create CSV rows
    const rows = attendanceData.records.map(record => {
      return [
        record.student_name,
        record.student_num,
        record.status,
        record.time_in,
        record.notes,
        attendanceData.classroom?.subject_name || 'Unknown Subject',
        attendanceData.classroom?.section_name || 'Unknown Section',
        record.date
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

  const getAttendanceStatus = (studentId) => {
    const record = attendanceData?.records?.find(record => record.student_id === studentId);
    return record ? record.status : 'Not Recorded';
  };

  const getStatusBadge = (status) => {
    const normalized = (status || '').toString().toLowerCase();
    const statusColorsByNormalized = {
      present: 'success',
      late: 'warning',
      absent: 'danger', // ensure red for any "ABSENT"/"absent" variant
      excused: 'info',
      'not recorded': 'secondary',
      'not_recorded': 'secondary'
    };

    const color = statusColorsByNormalized[normalized] || 'secondary';

    return (
      <Badge color={color} className="font-weight-bold">
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

        {/* QR Session Status */}
        {isQrSessionActive && (
          <Row className="mb-4">
            <Col xs={12}>
              <Alert color={qrModal ? "success" : "warning"} className="mb-0">
                <div className="d-flex justify-content-between align-items-center">
                  <div>
                    <i className="fas fa-qrcode mr-2" />
                    <strong>QR Attendance Session Active</strong>
                    <span className="ml-3 text-muted">
                      Started at {qrSessionStartTime?.toLocaleTimeString()}
                    </span>
                    {!qrModal && (
                      <span className="ml-3 text-warning">
                        <i className="fas fa-exclamation-triangle mr-1" />
                        Scanner closed - Click 'Resume QR Scan' to continue
                      </span>
                    )}
                  </div>
                  <div className="text-right">
                    <div className={`h4 mb-0 ${qrModal ? 'text-success' : 'text-warning'}`}>
                      {formatMsToMMSS(getRemainingGraceMs())}
                    </div>
                    <small className="text-muted">remaining</small>
                  </div>
                </div>
              </Alert>
            </Col>
          </Row>
        )}

        {/* Attendance Summary Cards - Always Visible */}
        <Row className="mb-4">
          <Col xs={12} sm={3} className="mb-3">
            <Card className="shadow border-0">
              <CardBody className="py-3">
                <Row className="align-items-center">
                  <Col>
                    <h6 className="text-uppercase text-muted ls-1 mb-1">Total Students</h6>
                    <h5 className="h3 mb-0 text-info">
                      {attendanceData?.summary?.total || 0}
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
                      {attendanceData?.summary?.present || 0}
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
                      {attendanceData?.summary?.late || 0}
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
                      {attendanceData?.summary?.absent || 0}
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
                      {attendanceData?.summary?.excused || 0}
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
              <Col xs={12} sm={6} md={4} className="d-flex align-items-center mb-3 mb-sm-0">
                <FormGroup className="w-100">
                  <label className="form-control-label mb-2">Select Class</label>
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
                        {loading ? "Loading..." : selectedClass ? (() => {
                          const selectedClassData = classes.find(c => c.class_id === selectedClass);
                          return selectedClassData ? `${selectedClassData.subject_name} - ${selectedClassData.section_name}` : "Choose a class...";
                        })() : "Choose a class..."}
                      </span>
                    </DropdownToggle>
                    <DropdownMenu className="w-100">
                      {classes.length > 0 ? (
                        classes.map((classItem) => (
                          <DropdownItem
                            key={classItem.class_id}
                            onClick={() => setSelectedClass(classItem.class_id)}
                            style={{
                              overflow: "hidden",
                              textOverflow: "ellipsis",
                              whiteSpace: "nowrap",
                              padding: "8px 12px"
                            }}
                          >
                            {classItem.subject_name} - {classItem.section_name}
                          </DropdownItem>
                        ))
                      ) : (
                        <DropdownItem disabled>
                          No classes available
                        </DropdownItem>
                      )}
                    </DropdownMenu>
                  </UncontrolledDropdown>
                </FormGroup>
              </Col>
              {/* Late Mode toggle appears after timeout (timed session finished) */}
              {graceExpired && (
                <Col xs={12} sm={6} md={2} className="d-flex align-items-center mb-3 mb-sm-0">
                  <Button
                    color={lateMode ? "warning" : "secondary"}
                    className="w-100 font-weight-bold shadow"
                    style={{ height: "44px", borderRadius: "8px", whiteSpace: "nowrap", fontSize: "0.875rem" }}
                    onClick={() => {
                      const next = !lateMode;
                      setLateMode(next);
                      if (next) {
                        setQrModal(true);
                        setSuccessMessage("Late Mode enabled. Scanner reopened for late students.");
                        setTimeout(() => setSuccessMessage(null), 2500);
                      }
                    }}
                    disabled={!selectedClass}
                  >
                    <FaClock className="mr-2" /> {lateMode ? 'Disable Late Mode' : 'Enable Late Mode'}
                  </Button>
                </Col>
              )}
              <Col xs={12} sm={6} md={3} className="d-flex align-items-center mb-3 mb-sm-0">
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
                    onClick={() => {
                      if (isQrSessionActive) {
                        if (qrModal) {
                          confirmEndSession();
                        } else {
                          resumeQrSession();
                        }
                      } else {
                        if (graceExpired && lateMode) {
                          // Late-only scanning: reopen scanner without starting a timed session
                          setQrModal(true);
                        } else {
                          startQrAttendanceSession();
                        }
                      }
                    }}
                    disabled={!selectedClass || (graceExpired && !lateMode)}
                  >
                    <FaQrcode className="mr-2" /> 
                    {isQrSessionActive ? (qrModal ? 'End QR Scan' : 'Resume QR Scan') : (graceExpired && lateMode ? 'Start QR Scan' : 'Start QR Scan')}
                  </Button>
              </Col>
              <Col xs={12} sm={6} md={3} className="d-flex align-items-center mb-3 mb-sm-0">
                <Button
                  color="info"
                  className="w-100 font-weight-bold shadow"
                  style={{ height: "44px", borderRadius: "8px", whiteSpace: "nowrap", fontSize: "0.875rem" }}
                  onClick={() => setManualTable(true)}
                  disabled={!selectedClass}
                >
                  <FaTable className="mr-2" /> View Manual Attendance
                </Button>
              </Col>
            </Row>
          </CardBody>
        </Card>

        {/* Loading Spinner - moved below main controls */}
        {showLoader && (
          <div className="mb-4" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <LottieLoader message="Loading..." width={150} height={150} centered minHeight={'40vh'} desiredDurationSec={1.4} />
          </div>
        )}

        {/* Attendance Log Table */}
        <Card className="shadow mt-4">
          <CardHeader>
            <Row className="align-items-center">
              <Col xs={12} sm={6}>
                <h3 className="mb-0">
                  Attendance Log
                  {attendanceData?.records?.length > 0 && (
                    <span className="text-muted ml-2" style={{ fontSize: '0.9rem' }}>
                      ({attendanceData.records.length} students)
                    </span>
                  )}
                </h3>
              </Col>
              <Col xs={12} sm={6} className="text-right mt-2 mt-sm-0">
                <Button 
                  color="secondary" 
                  bsSize="sm" 
                  onClick={handleExportAttendance}
                  disabled={!selectedClass || !attendanceData?.records?.length}
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
            {!selectedClass ? (
              <Alert color="info" className="text-center">
                <i className="fas fa-info-circle mr-2" />
                Please select a class to view attendance records.
              </Alert>
            ) : !attendanceData?.records?.length ? (
              <Alert color="warning" className="text-center">
                <i className="fas fa-exclamation-triangle mr-2" />
                No attendance records found for the selected date. You can record attendance using the buttons above.
              </Alert>
            ) : (
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
                    {attendanceData.records.map((record, idx) => (
                      <tr key={`${record.attendance_id || record.id || record.student_id || record.student_num || 'row'}_${record.date || idx}`}>
                        <td>
                          <div className="media align-items-center">
                            <div className="media-body">
                              <span className="name mb-0 text-sm">
                                {record.student_name}
                              </span>
                            </div>
                          </div>
                        </td>
                        <td>
                          <span className="text-sm font-weight-bold text-info">
                            {record.student_num}
                          </span>
                        </td>
                        <td>
                          {getStatusBadge(record.status)}
                        </td>
                        <td>
                          <span className="text-sm">
                            {record.time_in || 'N/A'}
                          </span>
                        </td>
                        <td>
                          <Input
                            type="text"
                            placeholder="Add notes..."
                            bsSize="sm"
                            className="form-control-sm"
                            style={{ fontSize: '0.875rem' }}
                            defaultValue={record.notes || ''}
                            onChange={(e) => {
                              // Update notes in attendance record
                              // This could be implemented to save notes
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
                    ))}
                  </tbody>
                </Table>
              </div>
            )}
          </CardBody>
        </Card>
      </Container>

      {/* QR Scanner Modal */}
      <Modal isOpen={qrModal} toggle={() => {
        if (isQrSessionActive) {
          setSuccessMessage("QR modal closed. Session is still active. Click 'Resume QR Scan' to continue scanning.");
          setTimeout(() => setSuccessMessage(null), 5000);
        }
        setQrModal(false);
      }} size="md">
        <ModalHeader toggle={() => setQrModal(false)}>
          <FaQrcode className="mr-2" />
          QR Code Scanner
        </ModalHeader>
        <ModalBody>
          <div className="text-center">
            {/* Session Status and Timer */}
            {isQrSessionActive && (
              <div className="mb-3">
                <Alert color="info">
                  <div className="d-flex justify-content-between align-items-center">
                    <span>
                      <i className="fas fa-clock mr-2" />
                      QR Attendance Session Active
                    </span>
                    <span className="font-weight-bold">
                      {formatMsToMMSS(getRemainingGraceMs())} remaining
                    </span>
                  </div>
                  <div className="mt-2 text-muted">
                    <small>
                      Students who scan within {gracePeriodMinutes} minutes will be marked as Present.
                      <br />
                      Students who scan after {gracePeriodMinutes} minutes will be marked as Late.
                    </small>
                  </div>
                </Alert>
              </div>
            )}
            
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
          {isQrSessionActive && (
            <Button color="warning" onClick={endQrAttendanceSession} className="mr-auto">
              <i className="fas fa-stop mr-2" />
              End Session
            </Button>
          )}
          <Button color="secondary" onClick={() => setQrModal(false)}>
            Close
          </Button>
        </ModalFooter>
      </Modal>

      {/* End Session Confirmation Modal */}
      <Modal isOpen={showEndSessionConfirm} toggle={() => setShowEndSessionConfirm(false)} size="sm">
        <ModalHeader toggle={() => setShowEndSessionConfirm(false)}>
          <i className="fas fa-exclamation-triangle text-warning mr-2" />
          Confirm End Session
        </ModalHeader>
        <ModalBody>
          <p>Are you sure you want to end the current QR attendance session?</p>
          <p className="text-muted mb-0">
            <small>
              This will close the session and prevent any further QR scans. 
              Students who haven't scanned yet will need to be marked manually.
            </small>
          </p>
        </ModalBody>
        <ModalFooter>
          <Button color="secondary" onClick={() => setShowEndSessionConfirm(false)}>
            Cancel
          </Button>
          <Button color="warning" onClick={endQrAttendanceSession}>
            <i className="fas fa-stop mr-2" />
            End Session
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
                {attendanceData?.records?.length > 0 ? (
                  attendanceData.records.map((record) => {
                    const status = record.status;
                    return (
                      <tr key={record.attendance_id}>
                        <td>
                          <div className="media align-items-center">
                            <div className="media-body">
                              <span className="name mb-0 text-sm">
                                {record.student_name}
                              </span>
                            </div>
                          </div>
                        </td>
                        <td>
                          <Button
                            bsSize="sm"
                            color={status === 'Present' ? 'success' : 'outline-success'}
                            onClick={() => handleManualAttendanceUpdate(record.student_id, 'Present')}
                            disabled={loading}
                          >
                            <FaCheckCircle />
                          </Button>
                        </td>
                        <td>
                          <Button
                            bsSize="sm"
                            color={status === 'Late' ? 'warning' : 'outline-warning'}
                            onClick={() => handleManualAttendanceUpdate(record.student_id, 'Late')}
                            disabled={loading}
                          >
                            <FaTimesCircle />
                          </Button>
                        </td>
                        <td>
                          <Button
                            bsSize="sm"
                            color={status === 'Absent' ? 'danger' : 'outline-danger'}
                            onClick={() => handleManualAttendanceUpdate(record.student_id, 'Absent')}
                            disabled={loading}
                          >
                            <FaUser />
                          </Button>
                        </td>
                        <td>
                          <Button
                            bsSize="sm"
                            color={status === 'Excused' ? 'info' : 'outline-info'}
                            onClick={() => handleManualAttendanceUpdate(record.student_id, 'Excused')}
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
                      {!selectedClass ? 
                        "Please select a class to view students" : 
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
