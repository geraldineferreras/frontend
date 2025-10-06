import React, { useState, useEffect } from "react";
import {
  Card,
  CardHeader,
  CardBody,
  Container,
  Row,
  Col,
  FormGroup,
  Input,
  Table,
  Badge,
  Alert,
  Spinner,
  UncontrolledDropdown,
  DropdownToggle,
  DropdownMenu,
  DropdownItem,
} from "reactstrap";
import Dropdown from 'react-bootstrap/Dropdown';
import { FaCalendarAlt, FaCheckCircle, FaTimesCircle, FaExclamationTriangle, FaUser } from "react-icons/fa";
import apiService from "../../services/api";

const StudentAttendance = () => {
  // State for API data
  const [attendanceRecords, setAttendanceRecords] = useState([]);
  const [summary, setSummary] = useState({ present: 0, late: 0, absent: 0, excused: 0, total: 0 });
  const [availableSubjects, setAvailableSubjects] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // State for filters
  const [selectedSubject, setSelectedSubject] = useState("");
  const [dateRange, setDateRange] = useState({ from: "", to: "" });

  // Clear error messages
  const clearMessages = () => {
    setError(null);
  };

  // Load student attendance data on component mount
  useEffect(() => {
    loadStudentAttendance();
  }, [selectedSubject, dateRange]);

  const loadStudentAttendance = async () => {
    try {
      setLoading(true);
      clearMessages();

      const filters = {};
      if (selectedSubject) filters.subjectId = selectedSubject;
      if (dateRange.from) filters.dateFrom = dateRange.from;
      if (dateRange.to) filters.dateTo = dateRange.to;

      const response = await apiService.getStudentAttendance(filters);

      if (response.status && response.data) {
        setAttendanceRecords(response.data.attendance_records || []);
        setSummary(response.data.summary || { present: 0, late: 0, absent: 0, excused: 0, total: 0 });
        setAvailableSubjects(response.data.available_subjects || []);
      } else {
        setError("Failed to load attendance records");
      }
    } catch (error) {
      console.error("Error loading student attendance:", error);
      setError(error.message || "Failed to load attendance records");
    } finally {
      setLoading(false);
    }
  };

  // Function to get status badge
  const getStatusBadge = (status) => {
    const statusColors = {
      'Present': 'success',
      'Late': 'warning',
      'Absent': 'danger',
      'Excused': 'info'
    };
    
    const statusIcons = {
      'Present': <FaCheckCircle />,
      'Late': <FaExclamationTriangle />,
      'Absent': <FaTimesCircle />,
      'Excused': <FaUser />
    };
    
  return (
      <Badge color={statusColors[status] || 'secondary'} className="font-weight-bold">
        {statusIcons[status]} {status}
      </Badge>
    );
  };

  // Function to format time
  const formatTime = (timeString) => {
    if (!timeString || timeString === 'N/A') return '—';
    
    try {
      const [hours, minutes, seconds] = timeString.split(':');
      const date = new Date();
      date.setHours(parseInt(hours), parseInt(minutes), parseInt(seconds));
      
      return date.toLocaleTimeString('en-US', {
        hour: '2-digit',
        minute: '2-digit',
        hour12: true
      });
    } catch (error) {
      return timeString;
    }
  };

  // Calculate attendance percentage for the donut chart
  const calculateAttendancePercentage = () => {
    const total = summary.total || 1;
    
    // Calculate percentages
    const presentPercent = total > 0 ? (summary.present / total) * 100 : 0;
    const latePercent = total > 0 ? (summary.late / total) * 100 : 0;
    const absentPercent = total > 0 ? (summary.absent / total) * 100 : 0;
    
    // Ensure percentages don't exceed 100%
    const totalPercent = presentPercent + latePercent + absentPercent;
    if (totalPercent > 100) {
      const scale = 100 / totalPercent;
      return {
        presentPercent: presentPercent * scale,
        latePercent: latePercent * scale,
        absentPercent: absentPercent * scale
      };
    }
    
    return { presentPercent, latePercent, absentPercent };
  };

  const { presentPercent, latePercent, absentPercent } = calculateAttendancePercentage();

  return (
    <Container className="mt-4" fluid>
      {/* Error Alert */}
      {error && (
        <Alert color="danger" className="mb-4">
          <i className="fas fa-exclamation-triangle mr-2" />
          {error}
        </Alert>
      )}

      {/* Loading Spinner */}
      {loading && (
        <div className="text-center mb-4">
          <Spinner color="primary" />
          <span className="ml-2">Loading attendance records...</span>
        </div>
      )}

      

      {/* Attendance Summary */}
      <Row className="mb-4">
        <Col>
          <Card className="shadow border-0">
            <CardBody>
              <Row className="align-items-center">
                <Col xs={12} md={4} className="text-center mb-3 mb-md-0">
                  {/* Donut Chart */}
                  <div className="position-relative" style={{ width: '120px', height: '120px', margin: '0 auto' }}>
                    <svg width="120" height="120" viewBox="0 0 36 36">
                      {/* Background circle */}
                      <circle cx="18" cy="18" r="16" fill="#f8f9fa" />
                      
                      {/* Present segment */}
                      <circle 
                        cx="18" cy="18" r="16" 
                        fill="none" 
                        stroke="#28a745" 
                        strokeWidth="3" 
                        strokeDasharray={`${presentPercent} 100`} 
                        strokeDashoffset="0"
                        transform="rotate(-90 18 18)"
                      />
                      
                      {/* Late segment */}
                      <circle 
                        cx="18" cy="18" r="16" 
                        fill="none" 
                        stroke="#ffc107" 
                        strokeWidth="3" 
                        strokeDasharray={`${latePercent} 100`} 
                        strokeDashoffset={`-${presentPercent}`}
                        transform="rotate(-90 18 18)"
                      />
                      
                      {/* Absent segment */}
                      <circle 
                        cx="18" cy="18" r="16" 
                        fill="none" 
                        stroke="#dc3545" 
                        strokeWidth="3" 
                        strokeDasharray={`${absentPercent} 100`} 
                        strokeDashoffset={`-${presentPercent + latePercent}`}
                        transform="rotate(-90 18 18)"
                      />
                    </svg>
                    <div className="position-absolute" style={{ top: '50%', left: '50%', transform: 'translate(-50%, -50%)', textAlign: 'center' }}>
                      <h4 className="mb-0 font-weight-bold text-dark">{summary.total}</h4>
                      <small className="text-muted">Total</small>
                    </div>
                  </div>
                </Col>
                <Col xs={12} md={8}>
                  <h5 className="mb-3">Total Attendance: {summary.total} sessions</h5>
                  <Row>
                    <Col xs={4} className="text-center">
                      <div className="d-flex align-items-center justify-content-center mb-2">
                        <div className="bg-success rounded-circle mr-2" style={{ width: '12px', height: '12px' }}></div>
                        <span className="font-weight-bold">{summary.present}</span>
                      </div>
                      <small className="text-muted">Present</small>
                    </Col>
                    <Col xs={4} className="text-center">
                      <div className="d-flex align-items-center justify-content-center mb-2">
                        <div className="bg-warning rounded-circle mr-2" style={{ width: '12px', height: '12px' }}></div>
                        <span className="font-weight-bold">{summary.late}</span>
      </div>
                      <small className="text-muted">Late</small>
                    </Col>
                    <Col xs={4} className="text-center">
                      <div className="d-flex align-items-center justify-content-center mb-2">
                        <div className="bg-danger rounded-circle mr-2" style={{ width: '12px', height: '12px' }}></div>
                        <span className="font-weight-bold">{summary.absent}</span>
      </div>
                      <small className="text-muted">Absent</small>
                    </Col>
                  </Row>
                </Col>
              </Row>
            </CardBody>
          </Card>
        </Col>
      </Row>

      {/* Filters */}
      <Row className="mb-4">
        <Col>
          <Card className="shadow border-0">
            <CardBody>
                                                           <Row className="align-items-end">
                                     <Col xs={12} md={4} className="mb-3 mb-md-0">
                     <FormGroup>
                       <label className="form-control-label mb-2"></label>
                                               <Dropdown>
                          <Dropdown.Toggle 
                            variant="secondary" 
                            id="dropdown-basic"
                            style={{ minWidth: "350px", width: "350px", textAlign: "left" }}
                          >
                           {selectedSubject ? 
                             availableSubjects.find(s => s.id === selectedSubject)?.subject_name || "All Subjects" 
                             : "All Subjects"}
                         </Dropdown.Toggle>

                         <Dropdown.Menu>
                           <Dropdown.Item 
                             href="#" 
                             onClick={(e) => { e.preventDefault(); setSelectedSubject(""); }}
                           >
                             All Subjects
                           </Dropdown.Item>
                           {availableSubjects.map((subject) => (
                             <Dropdown.Item 
                               key={subject.id}
                               href="#" 
                               onClick={(e) => { 
                                 e.preventDefault(); 
                                 setSelectedSubject(subject.id); 
                               }}
                             >
                               {subject.subject_name} ({subject.subject_code})
                             </Dropdown.Item>
                           ))}
                         </Dropdown.Menu>
                       </Dropdown>
                     </FormGroup>
                   </Col>
                  <Col xs={12} md={4} className="mb-3 mb-md-0">
                    <FormGroup>
                      <label className="form-control-label mb-2">Date From</label>
                      <Input
                        type="date"
                        value={dateRange.from}
                        onChange={(e) => setDateRange({ ...dateRange, from: e.target.value })}
                        className="form-control-alternative"
                      />
                    </FormGroup>
                  </Col>
                  <Col xs={12} md={4} className="mb-3 mb-md-0">
                    <FormGroup>
                      <label className="form-control-label mb-2">Date To</label>
                      <Input
                        type="date"
                        value={dateRange.to}
                        onChange={(e) => setDateRange({ ...dateRange, to: e.target.value })}
                        className="form-control-alternative"
                      />
                    </FormGroup>
                  </Col>
                </Row>
            </CardBody>
          </Card>
        </Col>
      </Row>

      {/* Attendance Records Table */}
      <Row>
        <Col>
          <Card className="shadow border-0">
            <CardHeader>
              <h3 className="mb-0">Attendance Records</h3>
            </CardHeader>
            <CardBody>
              {attendanceRecords.length === 0 ? (
                <Alert color="info" className="text-center">
                  <i className="fas fa-info-circle mr-2" />
                  No attendance records found for the selected criteria.
                </Alert>
              ) : (
                <div className="table-responsive">
                  <Table className="align-items-center table-flush">
                    <thead className="thead-light">
                      <tr>
                        <th scope="col">Date</th>
                        <th scope="col">Subject</th>
                        <th scope="col">Section</th>
                        <th scope="col">Time In</th>
                        <th scope="col">Status</th>
                        <th scope="col">Teacher</th>
                        <th scope="col">Notes</th>
            </tr>
          </thead>
          <tbody>
                      {attendanceRecords.map((record) => (
                        <tr key={record.attendance_id}>
                          <td>
                            <span className="text-sm font-weight-bold">
                              {new Date(record.date).toLocaleDateString()}
                            </span>
                          </td>
                          <td>
                            <div>
                              <span className="font-weight-bold text-sm">
                                {record.subject_name}
                              </span>
                              <br />
                              <small className="text-muted">
                                {record.subject_code}
                              </small>
                            </div>
                          </td>
                          <td>
                            <span className="text-sm">
                              {record.section_name}
                            </span>
                          </td>
                          <td>
                            <span className="text-sm">
                              {formatTime(record.time_in)}
                            </span>
                          </td>
                          <td>
                            {getStatusBadge(record.status)}
                          </td>
                          <td>
                            <span className="text-sm">
                              {record.teacher_name}
                            </span>
                          </td>
                          <td>
                            <span className="text-sm text-muted">
                              {record.notes || '—'}
                            </span>
                          </td>
              </tr>
            ))}
          </tbody>
                  </Table>
      </div>
              )}
            </CardBody>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

export default StudentAttendance; 