import React, { useState, useEffect } from "react";
import {
  Card,
  CardHeader,
  CardBody,
  Container,
  Row,
  Col,
  Form,
  FormGroup,
  Input,
  Button,
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
  CustomInput,
  Nav,
  NavItem,
  NavLink,
  TabContent,
  TabPane,
} from "reactstrap";
import classnames from "classnames";

// Icons
import { 
  FaDownload, 
  FaSearch, 
  FaFileAlt, 
  FaCheck, 
  FaTimes, 
  FaClock,
  FaEye,
  FaEdit,
  FaSave,
  FaFileArchive,
  FaFilter
} from "react-icons/fa";

const TeacherSubmissions = () => {
  const [activeTab, setActiveTab] = useState("1");
  const [selectedClass, setSelectedClass] = useState("");
  const [selectedAssignment, setSelectedAssignment] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [submissions, setSubmissions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedSubmissions, setSelectedSubmissions] = useState([]);
  const [feedbackModal, setFeedbackModal] = useState(false);
  const [currentSubmission, setCurrentSubmission] = useState(null);
  const [feedbackText, setFeedbackText] = useState("");
  const [saving, setSaving] = useState({});

  // Mock data
  const classes = [
    { id: 1, name: "OOP - 3A", code: "CS301" },
    { id: 2, name: "Data Structures - 2B", code: "CS201" },
    { id: 3, name: "Web Development - 4A", code: "CS401" },
  ];

  const assignments = [
    { id: 1, classId: 1, title: "Midterm Project", dueDate: "2024-01-15" },
    { id: 2, classId: 1, title: "Final Assignment", dueDate: "2024-01-30" },
    { id: 3, classId: 2, title: "Lab Exercise 1", dueDate: "2024-01-20" },
  ];

  const mockSubmissions = [
    {
      id: 1,
      studentId: "2021001",
      studentName: "John Doe",
      fileName: "midterm_project.zip",
      submissionDate: "2024-01-14T10:30:00",
      dueDate: "2024-01-15T23:59:00",
      score: 85,
      feedback: "Good work on the implementation. Consider improving error handling.",
      status: "on_time"
    },
    {
      id: 2,
      studentId: "2021002",
      studentName: "Jane Smith",
      fileName: "project_submission.pdf",
      submissionDate: "2024-01-16T09:15:00",
      dueDate: "2024-01-15T23:59:00",
      score: null,
      feedback: "",
      status: "late"
    },
    {
      id: 3,
      studentId: "2021003",
      studentName: "Mike Johnson",
      fileName: "assignment_code.py",
      submissionDate: "2024-01-13T16:45:00",
      dueDate: "2024-01-15T23:59:00",
      score: 92,
      feedback: "Excellent work! Very clean code structure.",
      status: "on_time"
    },
  ];

  useEffect(() => {
    if (selectedClass && selectedAssignment) {
      loadSubmissions();
    }
  }, [selectedClass, selectedAssignment]);

  const loadSubmissions = async () => {
    setLoading(true);
    // Simulate API call
    setTimeout(() => {
      setSubmissions(mockSubmissions);
      setLoading(false);
    }, 1000);
  };

  const handleScoreChange = (submissionId, newScore) => {
    setSubmissions(prev => 
      prev.map(sub => 
        sub.id === submissionId 
          ? { ...sub, score: newScore === "" ? null : parseInt(newScore) }
          : sub
      )
    );
  };

  const saveGrade = async (submissionId) => {
    setSaving(prev => ({ ...prev, [submissionId]: true }));
    
    // Simulate API call
    setTimeout(() => {
      setSaving(prev => ({ ...prev, [submissionId]: false }));
      // Show success message
    }, 1000);
  };

  const openFeedbackModal = (submission) => {
    setCurrentSubmission(submission);
    setFeedbackText(submission.feedback || "");
    setFeedbackModal(true);
  };

  const saveFeedback = async () => {
    if (!currentSubmission) return;
    
    setSaving(prev => ({ ...prev, [currentSubmission.id]: true }));
    
    // Simulate API call
    setTimeout(() => {
      setSubmissions(prev => 
        prev.map(sub => 
          sub.id === currentSubmission.id 
            ? { ...sub, feedback: feedbackText }
            : sub
        )
      );
      setSaving(prev => ({ ...prev, [currentSubmission.id]: false }));
      setFeedbackModal(false);
    }, 1000);
  };

  const handleSelectAll = (checked) => {
    if (checked) {
      setSelectedSubmissions(submissions.map(sub => sub.id));
    } else {
      setSelectedSubmissions([]);
    }
  };

  const handleSelectSubmission = (submissionId, checked) => {
    if (checked) {
      setSelectedSubmissions(prev => [...prev, submissionId]);
    } else {
      setSelectedSubmissions(prev => prev.filter(id => id !== submissionId));
    }
  };

  const downloadSubmission = (fileName) => {
    // Simulate download
    const link = document.createElement('a');
    link.href = `/uploads/submissions/${fileName}`;
    link.download = fileName;
    link.click();
  };

  const downloadAllSubmissions = () => {
    // Simulate bulk download
    alert("Downloading all selected submissions...");
  };

  const filteredSubmissions = submissions.filter(submission =>
    submission.studentName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    submission.studentId.includes(searchTerm)
  );

  const getStatusBadge = (status) => {
    switch (status) {
      case "on_time":
        return <Badge color="success">On Time</Badge>;
      case "late":
        return <Badge color="danger">Late</Badge>;
      default:
        return <Badge color="secondary">Unknown</Badge>;
    }
  };

  const getFileIcon = (fileName) => {
    const extension = fileName.split('.').pop().toLowerCase();
    switch (extension) {
      case 'pdf':
        return <FaFileAlt className="text-danger" />;
      case 'zip':
      case 'rar':
        return <FaFileArchive className="text-warning" />;
      case 'py':
      case 'js':
      case 'java':
        return <FaFileAlt className="text-info" />;
      default:
        return <FaFileAlt className="text-secondary" />;
    }
  };

  return (
    <>
      <div className="header bg-gradient-info pb-8 pt-5 pt-md-8">
        <Container fluid>
          <div className="header-body">
            <Row>
              <Col>
                <div className="card-stats">
                  <div className="d-flex align-items-center">
                  </div>
                </div>
              </Col>
            </Row>
          </div>
        </Container>
      </div>
      <Container className="mt--7" fluid>
        <Row>
          <Col>
            <Card className="shadow">
              <CardHeader className="bg-transparent">
                <Row className="align-items-center">
                  <Col>
                    <h3 className="mb-0">Assignment Submissions</h3>
                  </Col>
                  <Col className="text-right">
                    <Button
                      color="info"
                      size="sm"
                      disabled={selectedSubmissions.length === 0}
                      onClick={downloadAllSubmissions}
                    >
                      <FaFileArchive className="mr-2" />
                      Download Selected ({selectedSubmissions.length})
                    </Button>
                  </Col>
                </Row>
              </CardHeader>
              <CardBody>
                {/* Filter Controls */}
                <Row className="mb-4 align-items-start g-1">
                  <Col md={3}>
                    <FormGroup>
                      <label className="form-control-label mb-2">Select Class</label>
                      <div style={{ height: '56px', display: 'flex', alignItems: 'center' }}>
                        <UncontrolledDropdown className="w-100">
                          <DropdownToggle
                            caret
                            color="primary"
                            className="w-90 text-left font-weight-bold shadow"
                            style={{ borderRadius: "8px", height: "44px", minWidth: '240px', maxWidth: '100%', display: "flex", alignItems: "center", paddingLeft: '24px', paddingRight: '24px' }}
                          >
                            {selectedClass ? classes.find(c => c.id === parseInt(selectedClass))?.name.split(' (')[0] : "Choose a class..."}
                          </DropdownToggle>
                          <DropdownMenu className="w-100" style={{ minWidth: '220px', maxWidth: '300px' }}>
                            {classes.map((cls) => (
                              <DropdownItem
                                key={cls.id}
                                onClick={() => {
                                  setSelectedClass(cls.id.toString());
                                  setSelectedAssignment("");
                                }}
                                style={{ whiteSpace: 'normal', padding: '12px 16px' }}
                              >
                                {cls.name} ({cls.code})
                              </DropdownItem>
                            ))}
                          </DropdownMenu>
                        </UncontrolledDropdown>
                      </div>
                    </FormGroup>
                  </Col>
                  <Col md={3}>
                    <FormGroup>
                      <label className="form-control-label mb-2">Select Assignment</label>
                      <div style={{ height: '56px', display: 'flex', alignItems: 'center' }}>
                        <UncontrolledDropdown className="w-100">
                          <DropdownToggle
                            caret
                            color="primary"
                            className="w-90 text-left font-weight-bold shadow"
                            style={{ borderRadius: "8px", height: "44px", minWidth: '240px', maxWidth: '100%', display: "flex", alignItems: "center", paddingLeft: '24px', paddingRight: '24px' }}
                            disabled={!selectedClass}
                          >
                            {selectedAssignment ? assignments.find(a => a.id === parseInt(selectedAssignment))?.title : "Choose an assignment..."}
                          </DropdownToggle>
                          <DropdownMenu style={{ minWidth: 'auto', maxWidth: 'none', padding: '8px 12px' }}>
                            {assignments
                              .filter(assignment => assignment.classId === parseInt(selectedClass))
                              .map((assignment) => (
                                <DropdownItem
                                  key={assignment.id}
                                  onClick={() => setSelectedAssignment(assignment.id.toString())}
                                  style={{ whiteSpace: 'normal', padding: '12px 16px' }}
                                >
                                  {assignment.title}
                                </DropdownItem>
                              ))}
                          </DropdownMenu>
                        </UncontrolledDropdown>
                      </div>
                    </FormGroup>
                  </Col>
                  <Col md={6}>
                    <FormGroup>
                      <label className="form-control-label mb-2">Search Students</label>
                      <InputGroup size="lg" style={{ height: "44px" }}>
                        <InputGroupAddon addonType="prepend">
                          <InputGroupText style={{ height: "44px" }}>
                            <FaSearch />
                          </InputGroupText>
                        </InputGroupAddon>
                        <Input
                          style={{ height: "44px" }}
                          placeholder="Search by student name or ID..."
                          value={searchTerm}
                          onChange={(e) => setSearchTerm(e.target.value)}
                        />
                      </InputGroup>
                    </FormGroup>
                  </Col>
                </Row>

                {/* Empty States */}
                {!selectedClass && (
                  <Alert color="info" className="text-center">
                    <FaFilter className="mr-2" />
                    Select a class to begin viewing submissions
                  </Alert>
                )}

                {selectedClass && !selectedAssignment && (
                  <Alert color="info" className="text-center">
                    <FaFileAlt className="mr-2" />
                    Select an assignment to view student submissions
                  </Alert>
                )}

                {selectedClass && selectedAssignment && submissions.length === 0 && !loading && (
                  <Alert color="warning" className="text-center">
                    <FaTimes className="mr-2" />
                    No submissions received yet for this assignment
                  </Alert>
                )}

                {/* Loading State */}
                {loading && (
                  <div className="text-center py-5">
                    <Spinner color="info" />
                    <p className="mt-3">Loading submissions...</p>
                  </div>
                )}

                {/* Submissions Table */}
                {selectedClass && selectedAssignment && submissions.length > 0 && !loading && (
                  <div className="table-responsive">
                    <Table className="align-items-center table-flush">
                      <thead className="thead-light">
                        <tr>
                          <th scope="col" width="50">
                            <CustomInput
                              type="checkbox"
                              id="selectAll"
                              onChange={(e) => handleSelectAll(e.target.checked)}
                              checked={selectedSubmissions.length === submissions.length}
                            />
                          </th>
                          <th scope="col">Student</th>
                          <th scope="col">Submission</th>
                          <th scope="col">Date</th>
                          <th scope="col">Status</th>
                          <th scope="col">Score</th>
                          <th scope="col">Feedback</th>
                          <th scope="col">Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {filteredSubmissions.map((submission) => (
                          <tr key={submission.id}>
                            <td>
                              <CustomInput
                                type="checkbox"
                                id={`submission-${submission.id}`}
                                checked={selectedSubmissions.includes(submission.id)}
                                onChange={(e) => handleSelectSubmission(submission.id, e.target.checked)}
                              />
                            </td>
                            <td>
                              <div>
                                <div className="font-weight-bold">{submission.studentName}</div>
                                <small className="text-muted">ID: {submission.studentId}</small>
                              </div>
                            </td>
                            <td>
                              <Button
                                color="link"
                                size="sm"
                                onClick={() => downloadSubmission(submission.fileName)}
                                className="p-0"
                              >
                                {getFileIcon(submission.fileName)}
                                <span className="ml-2">{submission.fileName}</span>
                              </Button>
                            </td>
                            <td>
                              <div>
                                <div>{new Date(submission.submissionDate).toLocaleDateString()}</div>
                                <small className="text-muted">
                                  {new Date(submission.submissionDate).toLocaleTimeString()}
                                </small>
                              </div>
                            </td>
                            <td>
                              {getStatusBadge(submission.status)}
                            </td>
                            <td>
                              <Input
                                type="number"
                                min="0"
                                max="100"
                                value={submission.score || ""}
                                onChange={(e) => handleScoreChange(submission.id, e.target.value)}
                                className="w-75"
                                placeholder="Score"
                              />
                            </td>
                            <td>
                              <div className="d-flex align-items-center">
                                <span className="text-truncate" style={{ maxWidth: "150px" }}>
                                  {submission.feedback || "No feedback"}
                                </span>
                                <Button
                                  color="link"
                                  size="sm"
                                  onClick={() => openFeedbackModal(submission)}
                                  className="p-0 ml-2"
                                >
                                  <FaEdit />
                                </Button>
                              </div>
                            </td>
                            <td>
                              <div className="d-flex">
                                <Button
                                  color="info"
                                  size="sm"
                                  onClick={() => saveGrade(submission.id)}
                                  disabled={saving[submission.id]}
                                  className="mr-2"
                                >
                                  {saving[submission.id] ? (
                                    <Spinner size="sm" />
                                  ) : (
                                    <>
                                      <FaSave className="mr-1" />
                                      Save
                                    </>
                                  )}
                                </Button>
                                <Button
                                  color="secondary"
                                  size="sm"
                                  onClick={() => downloadSubmission(submission.fileName)}
                                >
                                  <FaDownload />
                                </Button>
                              </div>
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

      {/* Feedback Modal */}
      <Modal isOpen={feedbackModal} toggle={() => setFeedbackModal(false)} size="lg">
        <ModalHeader toggle={() => setFeedbackModal(false)}>
          Provide Feedback - {currentSubmission?.studentName}
        </ModalHeader>
        <ModalBody>
          <FormGroup>
            <label>Feedback</label>
            <Input
              type="textarea"
              rows="6"
              value={feedbackText}
              onChange={(e) => setFeedbackText(e.target.value)}
              placeholder="Enter your feedback for this submission..."
            />
          </FormGroup>
        </ModalBody>
        <ModalFooter>
          <Button color="secondary" onClick={() => setFeedbackModal(false)}>
            Cancel
          </Button>
          <Button 
            color="info" 
            onClick={saveFeedback}
            disabled={saving[currentSubmission?.id]}
          >
            {saving[currentSubmission?.id] ? (
              <>
                <Spinner size="sm" className="mr-2" />
                Saving...
              </>
            ) : (
              "Save Feedback"
            )}
          </Button>
        </ModalFooter>
      </Modal>
    </>
  );
};

export default TeacherSubmissions; 