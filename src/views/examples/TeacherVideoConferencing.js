import React, { useState, useEffect } from "react";
import {
  Card,
  CardHeader,
  CardBody,
  CardTitle,
  Container,
  Row,
  Col,
  Button,
  Table,
  Badge,
  Modal,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Form,
  FormGroup,
  Label,
  Input,
  Nav,
  NavItem,
  NavLink,
  TabContent,
  TabPane,
  Alert,
  Progress,
  CardImg,
  CardText,
  CardSubtitle,
  UncontrolledDropdown,
  DropdownToggle,
  DropdownMenu,
  DropdownItem,
} from "reactstrap";
import classnames from "classnames";
import LiveVideoConference from "./LiveVideoConference";

const TeacherVideoConferencing = () => {
  const [activeTab, setActiveTab] = useState("1");
  const [sessions, setSessions] = useState([]);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isSessionModalOpen, setIsSessionModalOpen] = useState(false);
  const [selectedSession, setSelectedSession] = useState(null);
  const [isLiveConferenceOpen, setIsLiveConferenceOpen] = useState(false);
  const [formData, setFormData] = useState({
    subject: "",
    course: "",
    section: "",
    date: "",
    time: "",
    duration: 60,
    attendanceMethod: "qr", // "qr" or "manual"
    joinApproval: "auto", // "auto" or "manual"
    enableRecording: true,
    enablePolls: true,
    enableBreakoutRooms: false,
    enableSubtitles: false,
  });

  // Mock data for demonstration
  const mockSessions = [
    {
      id: 1,
      subject: "Mathematics 101",
      course: "BS Computer Science",
      section: "A",
      date: "2024-01-15",
      time: "09:00",
      duration: 90,
      status: "scheduled",
      attendanceMethod: "qr",
      joinApproval: "auto",
      enrolledStudents: 25,
      attendees: 0,
    },
    {
      id: 2,
      subject: "Programming Fundamentals",
      course: "BS Computer Science", 
      section: "B",
      date: "2024-01-15",
      time: "14:00",
      duration: 120,
      status: "live",
      attendanceMethod: "manual",
      joinApproval: "manual",
      enrolledStudents: 30,
      attendees: 18,
    },
    {
      id: 3,
      subject: "Database Systems",
      course: "BS Computer Science",
      section: "A", 
      date: "2024-01-14",
      time: "10:00",
      duration: 90,
      status: "completed",
      attendanceMethod: "qr",
      joinApproval: "auto",
      enrolledStudents: 25,
      attendees: 22,
    },
  ];

  useEffect(() => {
    setSessions(mockSessions);
  }, []);

  const toggleTab = (tab) => {
    if (activeTab !== tab) setActiveTab(tab);
  };

  const toggleCreateModal = () => {
    setIsCreateModalOpen(!isCreateModalOpen);
  };

  const toggleSessionModal = () => {
    setIsSessionModalOpen(!isSessionModalOpen);
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleCreateSession = () => {
    const newSession = {
      id: sessions.length + 1,
      ...formData,
      status: "scheduled",
      enrolledStudents: Math.floor(Math.random() * 30) + 20,
      attendees: 0,
    };
    setSessions([...sessions, newSession]);
    setFormData({
      subject: "",
      course: "",
      section: "",
      date: "",
      time: "",
      duration: 60,
      attendanceMethod: "qr",
      joinApproval: "auto",
      enableRecording: true,
      enablePolls: true,
      enableBreakoutRooms: false,
      enableSubtitles: false,
    });
    toggleCreateModal();
  };

  const startSession = (session) => {
    setSelectedSession(session);
    setIsSessionModalOpen(true);
  };

  const launchLiveConference = () => {
    setIsSessionModalOpen(false);
    // Navigate to the video conference page (full screen, no sidebar/header)
    window.location.href = `/video-conference/${selectedSession.id}`;
  };

  const getStatusBadge = (status) => {
    const statusConfig = {
      scheduled: { color: "info", text: "Scheduled" },
      live: { color: "success", text: "Live" },
      completed: { color: "secondary", text: "Completed" },
    };
    const config = statusConfig[status];
    return <Badge color={config.color}>{config.text}</Badge>;
  };

  const getAttendanceMethodText = (method) => {
    return method === "qr" ? "QR Code" : "Manual";
  };

  const getJoinApprovalText = (approval) => {
    return approval === "auto" ? "Auto-approve" : "Manual approval";
  };

  return (
    <>
      <div className="header bg-gradient-info pb-8 pt-5 pt-md-8">
        <Container fluid>
          <div className="header-body">
            <Row>
              <Col lg="6" xl="3">
                <Row className="align-items-center">
                  <Col>
                    <h6 className="text-uppercase text-muted ls-1 mb-1">
                      Video Conferencing
                    </h6>
                    <h2 className="mb-0">Live Sessions</h2>
                  </Col>
                </Row>
              </Col>
              <Col lg="6" xl="3">
                <Row className="align-items-center">
                  <Col>
                    <h6 className="text-uppercase text-muted ls-1 mb-1">
                      Total Sessions
                    </h6>
                    <h2 className="mb-0">{sessions.length}</h2>
                  </Col>
                </Row>
              </Col>
              <Col lg="6" xl="3">
                <Row className="align-items-center">
                  <Col>
                    <h6 className="text-uppercase text-muted ls-1 mb-1">
                      Live Now
                    </h6>
                    <h2 className="mb-0">
                      {sessions.filter(s => s.status === "live").length}
                    </h2>
                  </Col>
                </Row>
              </Col>
              <Col lg="6" xl="3">
                <Row className="align-items-center">
                  <Col>
                    <h6 className="text-uppercase text-muted ls-1 mb-1">
                      Completed Today
                    </h6>
                    <h2 className="mb-0">
                      {sessions.filter(s => s.status === "completed").length}
                    </h2>
                  </Col>
                </Row>
              </Col>
            </Row>
          </div>
        </Container>
      </div>

      <Container className="mt--7" fluid>
        <Row>
          <Col>
            <Card>
              <CardHeader className="border-0">
                <Row className="align-items-center">
                  <div className="col">
                    <h3 className="mb-0">Video Conferencing Sessions</h3>
                  </div>
                  <div className="col text-right">
                    <Button
                      color="primary"
                      onClick={toggleCreateModal}
                      size="sm"
                    >
                      <i className="ni ni-fat-add mr-2"></i>
                      Create New Session
                    </Button>
                  </div>
                </Row>
              </CardHeader>
              <CardBody>
                <Nav tabs>
                  <NavItem>
                    <NavLink
                      className={classnames({ active: activeTab === "1" })}
                      onClick={() => toggleTab("1")}
                    >
                      All Sessions
                    </NavLink>
                  </NavItem>
                  <NavItem>
                    <NavLink
                      className={classnames({ active: activeTab === "2" })}
                      onClick={() => toggleTab("2")}
                    >
                      Live Sessions
                    </NavLink>
                  </NavItem>
                  <NavItem>
                    <NavLink
                      className={classnames({ active: activeTab === "3" })}
                      onClick={() => toggleTab("3")}
                    >
                      Scheduled
                    </NavLink>
                  </NavItem>
                  <NavItem>
                    <NavLink
                      className={classnames({ active: activeTab === "4" })}
                      onClick={() => toggleTab("4")}
                    >
                      Completed
                    </NavLink>
                  </NavItem>
                </Nav>
                <TabContent activeTab={activeTab}>
                  <TabPane tabId="1">
                    <Row>
                      {sessions.map((session) => (
                        <Col key={session.id} lg="4" md="6" className="mb-4">
                          <Card className="card-lift--hover shadow border-0">
                            <CardBody>
                              <Row className="align-items-center">
                                <Col>
                                  <h6 className="text-uppercase text-muted ls-1 mb-1">
                                    {session.subject}
                                  </h6>
                                  <h5 className="h3 mb-0">
                                    {session.course} - Section {session.section}
                                  </h5>
                                  <p className="text-sm text-muted mb-0">
                                    {session.date} at {session.time} ({session.duration} min)
                                  </p>
                                </Col>
                              </Row>
                              <Row className="mt-3">
                                <Col>
                                  <div className="d-flex justify-content-between align-items-center">
                                    {getStatusBadge(session.status)}
                                    <div className="text-right">
                                      <small className="text-muted">
                                        {session.attendees}/{session.enrolledStudents} students
                                      </small>
                                    </div>
                                  </div>
                                  <div className="mt-2">
                                    <small className="text-muted">
                                      Attendance: {getAttendanceMethodText(session.attendanceMethod)}
                                    </small>
                                    <br />
                                    <small className="text-muted">
                                      Join: {getJoinApprovalText(session.joinApproval)}
                                    </small>
                                  </div>
                                  {session.status === "scheduled" && (
                                    <Button
                                      color="success"
                                      size="sm"
                                      className="mt-2"
                                      onClick={() => startSession(session)}
                                    >
                                      <i className="ni ni-camera-compact mr-1"></i>
                                      Start Session
                                    </Button>
                                  )}
                                  {session.status === "live" && (
                                    <Button
                                      color="info"
                                      size="sm"
                                      className="mt-2"
                                      onClick={() => startSession(session)}
                                    >
                                      <i className="ni ni-camera-compact mr-1"></i>
                                      Join Session
                                    </Button>
                                  )}
                                  {session.status === "completed" && (
                                    <Button
                                      color="secondary"
                                      size="sm"
                                      className="mt-2"
                                    >
                                      <i className="ni ni-chart-bar-32 mr-1"></i>
                                      View Report
                                    </Button>
                                  )}
                                </Col>
                              </Row>
                            </CardBody>
                          </Card>
                        </Col>
                      ))}
                    </Row>
                  </TabPane>
                  <TabPane tabId="2">
                    <Row>
                      {sessions
                        .filter((session) => session.status === "live")
                        .map((session) => (
                          <Col key={session.id} lg="4" md="6" className="mb-4">
                            <Card className="card-lift--hover shadow border-0 bg-gradient-success">
                              <CardBody>
                                <Row className="align-items-center">
                                  <Col>
                                    <h6 className="text-uppercase text-white ls-1 mb-1">
                                      LIVE NOW
                                    </h6>
                                    <h5 className="h3 mb-0 text-white">
                                      {session.subject}
                                    </h5>
                                    <p className="text-sm text-white mb-0">
                                      {session.course} - Section {session.section}
                                    </p>
                                  </Col>
                                </Row>
                                <Row className="mt-3">
                                  <Col>
                                    <div className="d-flex justify-content-between align-items-center">
                                      <Badge color="light" className="text-success">
                                        LIVE
                                      </Badge>
                                      <div className="text-right">
                                        <small className="text-white">
                                          {session.attendees}/{session.enrolledStudents} students
                                        </small>
                                      </div>
                                    </div>
                                    <Button
                                      color="light"
                                      size="sm"
                                      className="mt-2"
                                      onClick={() => startSession(session)}
                                    >
                                      <i className="ni ni-camera-compact mr-1"></i>
                                      Join Session
                                    </Button>
                                  </Col>
                                </Row>
                              </CardBody>
                            </Card>
                          </Col>
                        ))}
                    </Row>
                  </TabPane>
                  <TabPane tabId="3">
                    <Row>
                      {sessions
                        .filter((session) => session.status === "scheduled")
                        .map((session) => (
                          <Col key={session.id} lg="4" md="6" className="mb-4">
                            <Card className="card-lift--hover shadow border-0">
                              <CardBody>
                                <Row className="align-items-center">
                                  <Col>
                                    <h6 className="text-uppercase text-muted ls-1 mb-1">
                                      {session.subject}
                                    </h6>
                                    <h5 className="h3 mb-0">
                                      {session.course} - Section {session.section}
                                    </h5>
                                    <p className="text-sm text-muted mb-0">
                                      {session.date} at {session.time} ({session.duration} min)
                                    </p>
                                  </Col>
                                </Row>
                                <Row className="mt-3">
                                  <Col>
                                    <div className="d-flex justify-content-between align-items-center">
                                      {getStatusBadge(session.status)}
                                      <div className="text-right">
                                        <small className="text-muted">
                                          {session.enrolledStudents} enrolled
                                        </small>
                                      </div>
                                    </div>
                                    <Button
                                      color="success"
                                      size="sm"
                                      className="mt-2"
                                      onClick={() => startSession(session)}
                                    >
                                      <i className="ni ni-camera-compact mr-1"></i>
                                      Start Session
                                    </Button>
                                  </Col>
                                </Row>
                              </CardBody>
                            </Card>
                          </Col>
                        ))}
                    </Row>
                  </TabPane>
                  <TabPane tabId="4">
                    <Row>
                      {sessions
                        .filter((session) => session.status === "completed")
                        .map((session) => (
                          <Col key={session.id} lg="4" md="6" className="mb-4">
                            <Card className="card-lift--hover shadow border-0">
                              <CardBody>
                                <Row className="align-items-center">
                                  <Col>
                                    <h6 className="text-uppercase text-muted ls-1 mb-1">
                                      {session.subject}
                                    </h6>
                                    <h5 className="h3 mb-0">
                                      {session.course} - Section {session.section}
                                    </h5>
                                    <p className="text-sm text-muted mb-0">
                                      {session.date} at {session.time} ({session.duration} min)
                                    </p>
                                  </Col>
                                </Row>
                                <Row className="mt-3">
                                  <Col>
                                    <div className="d-flex justify-content-between align-items-center">
                                      {getStatusBadge(session.status)}
                                      <div className="text-right">
                                        <small className="text-muted">
                                          {session.attendees}/{session.enrolledStudents} attended
                                        </small>
                                      </div>
                                    </div>
                                    <div className="mt-2">
                                      <Progress
                                        value={(session.attendees / session.enrolledStudents) * 100}
                                        color="success"
                                        size="sm"
                                      />
                                    </div>
                                    <Button
                                      color="secondary"
                                      size="sm"
                                      className="mt-2"
                                    >
                                      <i className="ni ni-chart-bar-32 mr-1"></i>
                                      View Report
                                    </Button>
                                  </Col>
                                </Row>
                              </CardBody>
                            </Card>
                          </Col>
                        ))}
                    </Row>
                  </TabPane>
                </TabContent>
              </CardBody>
            </Card>
          </Col>
        </Row>
      </Container>

      {/* Create Session Modal */}
      <Modal isOpen={isCreateModalOpen} toggle={toggleCreateModal} size="lg">
        <ModalHeader toggle={toggleCreateModal}>
          Create New Video Conference Session
        </ModalHeader>
        <ModalBody>
          <Form>
            <Row>
              <Col md="6">
                <FormGroup>
                  <Label for="subject">Subject *</Label>
                  <Input
                    id="subject"
                    name="subject"
                    type="text"
                    value={formData.subject}
                    onChange={handleInputChange}
                    required
                  />
                </FormGroup>
              </Col>
              <Col md="6">
                <FormGroup>
                  <Label for="course">Course *</Label>
                  <Input
                    id="course"
                    name="course"
                    type="text"
                    value={formData.course}
                    onChange={handleInputChange}
                    required
                  />
                </FormGroup>
              </Col>
            </Row>
            <Row>
              <Col md="4">
                <FormGroup>
                  <Label for="section">Section *</Label>
                  <Input
                    id="section"
                    name="section"
                    type="text"
                    value={formData.section}
                    onChange={handleInputChange}
                    required
                  />
                </FormGroup>
              </Col>
              <Col md="4">
                <FormGroup>
                  <Label for="date">Date *</Label>
                  <Input
                    id="date"
                    name="date"
                    type="date"
                    value={formData.date}
                    onChange={handleInputChange}
                    required
                  />
                </FormGroup>
              </Col>
              <Col md="4">
                <FormGroup>
                  <Label for="time">Time *</Label>
                  <Input
                    id="time"
                    name="time"
                    type="time"
                    value={formData.time}
                    onChange={handleInputChange}
                    required
                  />
                </FormGroup>
              </Col>
            </Row>
            <Row>
              <Col md="6">
                <FormGroup>
                  <Label for="duration">Duration (minutes) *</Label>
                  <Input
                    id="duration"
                    name="duration"
                    type="select"
                    value={formData.duration}
                    onChange={handleInputChange}
                  >
                    <option value={30}>30 minutes</option>
                    <option value={60}>1 hour</option>
                    <option value={90}>1.5 hours</option>
                    <option value={120}>2 hours</option>
                    <option value={180}>3 hours</option>
                  </Input>
                </FormGroup>
              </Col>
              <Col md="6">
                <FormGroup>
                  <Label for="joinApproval">Join Approval *</Label>
                  <Input
                    id="joinApproval"
                    name="joinApproval"
                    type="select"
                    value={formData.joinApproval}
                    onChange={handleInputChange}
                  >
                    <option value="auto">Auto-approve students</option>
                    <option value="manual">Manual approval required</option>
                  </Input>
                </FormGroup>
              </Col>
            </Row>
            <Row>
              <Col md="6">
                <FormGroup>
                  <Label for="attendanceMethod">Attendance Method *</Label>
                  <Input
                    id="attendanceMethod"
                    name="attendanceMethod"
                    type="select"
                    value={formData.attendanceMethod}
                    onChange={handleInputChange}
                  >
                    <option value="qr">QR Code (Automatic)</option>
                    <option value="manual">Manual Attendance</option>
                  </Input>
                </FormGroup>
              </Col>
            </Row>
            <Row>
              <Col md="12">
                <h6 className="mb-3">Session Features</h6>
                <FormGroup check>
                  <Label check>
                    <Input
                      type="checkbox"
                      name="enableRecording"
                      checked={formData.enableRecording}
                      onChange={handleInputChange}
                    />
                    Enable Session Recording
                  </Label>
                </FormGroup>
                <FormGroup check>
                  <Label check>
                    <Input
                      type="checkbox"
                      name="enablePolls"
                      checked={formData.enablePolls}
                      onChange={handleInputChange}
                    />
                    Enable Live Polls & Quizzes
                  </Label>
                </FormGroup>
                <FormGroup check>
                  <Label check>
                    <Input
                      type="checkbox"
                      name="enableBreakoutRooms"
                      checked={formData.enableBreakoutRooms}
                      onChange={handleInputChange}
                    />
                    Enable Breakout Rooms
                  </Label>
                </FormGroup>
                <FormGroup check>
                  <Label check>
                    <Input
                      type="checkbox"
                      name="enableSubtitles"
                      checked={formData.enableSubtitles}
                      onChange={handleInputChange}
                    />
                    Enable Academic Subtitles & Translation
                  </Label>
                </FormGroup>
              </Col>
            </Row>
          </Form>
        </ModalBody>
        <ModalFooter>
          <Button color="secondary" onClick={toggleCreateModal}>
            Cancel
          </Button>
          <Button color="primary" onClick={handleCreateSession}>
            Create Session
          </Button>
        </ModalFooter>
      </Modal>

      {/* Session Modal */}
      <Modal isOpen={isSessionModalOpen} toggle={toggleSessionModal} size="xl">
        <ModalHeader toggle={toggleSessionModal}>
          {selectedSession?.subject} - Video Conference Session
        </ModalHeader>
        <ModalBody>
          {selectedSession && (
            <div className="text-center">
              <div className="mb-4">
                <i className="ni ni-camera-compact text-primary" style={{ fontSize: "4rem" }}></i>
              </div>
              <h4>Session Details</h4>
              <p>
                <strong>Subject:</strong> {selectedSession.subject}<br />
                <strong>Course:</strong> {selectedSession.course} - Section {selectedSession.section}<br />
                <strong>Date:</strong> {selectedSession.date} at {selectedSession.time}<br />
                <strong>Duration:</strong> {selectedSession.duration} minutes<br />
                <strong>Attendance:</strong> {getAttendanceMethodText(selectedSession.attendanceMethod)}<br />
                <strong>Join Approval:</strong> {getJoinApprovalText(selectedSession.joinApproval)}
              </p>
              <Alert color="info">
                <i className="ni ni-bell-55 mr-2"></i>
                This will open the video conferencing interface with all the features you've configured.
              </Alert>
            </div>
          )}
        </ModalBody>
        <ModalFooter>
          <Button color="secondary" onClick={toggleSessionModal}>
            Cancel
          </Button>
          <Button color="success" onClick={launchLiveConference}>
            <i className="ni ni-camera-compact mr-1"></i>
            Launch Video Conference
          </Button>
        </ModalFooter>
      </Modal>

      {/* Live Video Conference */}
      {isLiveConferenceOpen && selectedSession && (
        <LiveVideoConference 
          session={selectedSession} 
          onClose={() => setIsLiveConferenceOpen(false)} 
        />
      )}
    </>
  );
};

export default TeacherVideoConferencing; 