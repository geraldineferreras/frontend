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

  // Clear error and success messages
  const clearMessages = () => {
    setError(null);
    setSuccessMessage(null);
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
      try {
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

        // Function to get current time in Philippine time
        const getPhilippineTime = () => {
          const now = new Date();
          const philippineTime = new Date(now.getTime() + (8 * 60 * 60 * 1000)); // Add 8 hours for UTC+8
          return philippineTime.toISOString().split('T')[1].split('.')[0];
        };

        // Prepare attendance data for database
        const newAttendanceRecord = {
          student_id: enrolledStudent.student_id,
          subject_id: attendanceData.classroom.subject_id,
          section_name: attendanceData.classroom.section_name,
          class_id: selectedClass,
          date: selectedDate,
          time_in: getPhilippineTime(),
          status: 'Present',
          notes: 'QR Scan Attendance',
          teacher_id: attendanceData.classroom.teacher_id
        };

        // Save to database using the attendance record endpoint
        const response = await apiService.recordAttendance(newAttendanceRecord);
        
        if (response.status) {
          // Reload attendance records
          await loadAttendanceRecords();
          setQrModal(false);
          setScannedData(null);
          setSuccessMessage(`Attendance recorded successfully for ${enrolledStudent.student_name}!`);
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
                  onClick={() => setQrModal(true)}
                  disabled={!selectedClass}
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
                    {attendanceData.records.map((record) => (
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
