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
  ListGroup,
  ListGroupItem,
  UncontrolledDropdown,
  DropdownToggle,
  DropdownMenu,
  DropdownItem,
  InputGroup,
  InputGroupAddon,
  InputGroupText,
} from "reactstrap";
import classnames from "classnames";

const LiveVideoConference = ({ session, onClose }) => {
  const [activeTab, setActiveTab] = useState("1");
  const [isMuted, setIsMuted] = useState(false);
  const [isVideoOn, setIsVideoOn] = useState(true);
  const [isScreenSharing, setIsScreenSharing] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [chatMessage, setChatMessage] = useState("");
  const [chatMessages, setChatMessages] = useState([]);
  const [showAttendanceModal, setShowAttendanceModal] = useState(false);
  const [showPollModal, setShowPollModal] = useState(false);
  const [showBreakoutModal, setShowBreakoutModal] = useState(false);
  const [participants, setParticipants] = useState([]);
  const [attendance, setAttendance] = useState([]);
  const [currentPoll, setCurrentPoll] = useState(null);
  const [breakoutRooms, setBreakoutRooms] = useState([]);

  // Mock data
  const mockParticipants = [
    { id: 1, name: "John Smith", role: "student", status: "present", video: true, audio: true, speaking: false },
    { id: 2, name: "Sarah Johnson", role: "student", status: "present", video: true, audio: false, speaking: true },
    { id: 3, name: "Mike Davis", role: "student", status: "late", video: false, audio: true, speaking: false },
    { id: 4, name: "Emily Wilson", role: "student", status: "present", video: true, audio: true, speaking: false },
    { id: 5, name: "David Brown", role: "student", status: "absent", video: false, audio: false, speaking: false },
  ];

  const mockAttendance = [
    { id: 1, name: "John Smith", status: "present", time: "09:02", method: "QR Code" },
    { id: 2, name: "Sarah Johnson", status: "present", time: "09:01", method: "QR Code" },
    { id: 3, name: "Mike Davis", status: "late", time: "09:15", method: "QR Code" },
    { id: 4, name: "Emily Wilson", status: "present", time: "09:00", method: "QR Code" },
    { id: 5, name: "David Brown", status: "absent", time: "-", method: "-" },
  ];

  const mockChatMessages = [
    { id: 1, sender: "John Smith", message: "Good morning everyone!", time: "09:05", type: "student" },
    { id: 2, sender: "Teacher", message: "Welcome to today's session on Programming Fundamentals!", time: "09:06", type: "teacher" },
    { id: 3, sender: "Sarah Johnson", message: "Excited to learn about loops today!", time: "09:07", type: "student" },
    { id: 4, sender: "Mike Davis", message: "Can we review the previous topic first?", time: "09:08", type: "student" },
  ];

  useEffect(() => {
    setParticipants(mockParticipants);
    setAttendance(mockAttendance);
    setChatMessages(mockChatMessages);
  }, []);

  const toggleTab = (tab) => {
    if (activeTab !== tab) setActiveTab(tab);
  };

  const toggleMute = () => {
    setIsMuted(!isMuted);
  };

  const toggleVideo = () => {
    setIsVideoOn(!isVideoOn);
  };

  const toggleScreenShare = () => {
    setIsScreenSharing(!isScreenSharing);
  };

  const toggleRecording = () => {
    setIsRecording(!isRecording);
  };

  const sendChatMessage = () => {
    if (chatMessage.trim()) {
      const newMessage = {
        id: chatMessages.length + 1,
        sender: "Teacher",
        message: chatMessage,
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        type: "teacher"
      };
      setChatMessages([...chatMessages, newMessage]);
      setChatMessage("");
    }
  };

  const createPoll = () => {
    setCurrentPoll({
      question: "How well do you understand loops?",
      options: ["Very well", "Somewhat", "Not sure", "Need help"],
      responses: [8, 12, 3, 2]
    });
    setShowPollModal(false);
  };

  const createBreakoutRooms = () => {
    const rooms = [
      { id: 1, name: "Group A - Basic Loops", participants: ["John Smith", "Sarah Johnson"] },
      { id: 2, name: "Group B - Advanced Loops", participants: ["Mike Davis", "Emily Wilson"] },
    ];
    setBreakoutRooms(rooms);
    setShowBreakoutModal(false);
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "present": return "success";
      case "late": return "warning";
      case "absent": return "danger";
      default: return "secondary";
    }
  };

  return (
    <div className="live-video-conference" style={{ height: "100vh", backgroundColor: "#1a1a1a" }}>
      {/* Header */}
      <div className="conference-header bg-dark text-white p-3">
        <Row className="align-items-center">
          <Col>
            <h5 className="mb-0">
              <i className="ni ni-camera-compact mr-2"></i>
              {session?.subject} - Live Session
            </h5>
            <small className="text-muted">
              {session?.course} - Section {session?.section} | {session?.date} at {session?.time}
            </small>
          </Col>
          <Col xs="auto">
            <div className="d-flex align-items-center">
              <Badge color="danger" className="mr-3">
                <i className="ni ni-sound-wave mr-1"></i>
                LIVE
              </Badge>
              <span className="text-muted mr-3">
                {participants.filter(p => p.status === "present").length} / {participants.length} students
              </span>
              <Button color="secondary" size="sm" onClick={onClose}>
                <i className="ni ni-fat-remove"></i>
              </Button>
            </div>
          </Col>
        </Row>
      </div>

      <div className="conference-body" style={{ height: "calc(100vh - 140px)" }}>
        <Row className="h-100 m-0">
          {/* Main Video Area */}
          <Col lg="8" className="p-0">
            <div className="video-container h-100 position-relative">
              {/* Main Video Display */}
              <div className="main-video-area" style={{ 
                height: "70%", 
                backgroundColor: "#2a2a2a", 
                display: "flex", 
                alignItems: "center", 
                justifyContent: "center",
                borderBottom: "1px solid #333"
              }}>
                <div className="text-center text-white">
                  <i className="ni ni-camera-compact" style={{ fontSize: "4rem", opacity: 0.5 }}></i>
                  <h5 className="mt-3">Main Video Display</h5>
                  <p className="text-muted">Teacher's video feed would appear here</p>
                </div>
              </div>

              {/* Participant Grid */}
              <div className="participant-grid" style={{ 
                height: "30%", 
                backgroundColor: "#1a1a1a",
                padding: "10px"
              }}>
                <Row className="h-100">
                  {participants.slice(0, 4).map((participant) => (
                    <Col key={participant.id} xs="6" md="3" className="mb-2">
                      <div className="participant-video" style={{
                        height: "100%",
                        backgroundColor: "#333",
                        borderRadius: "8px",
                        position: "relative",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center"
                      }}>
                        <div className="text-center text-white">
                          <i className="ni ni-single-02" style={{ fontSize: "2rem" }}></i>
                          <div className="mt-1">
                            <small>{participant.name}</small>
                          </div>
                        </div>
                        {participant.speaking && (
                          <div className="speaking-indicator" style={{
                            position: "absolute",
                            top: "5px",
                            right: "5px",
                            width: "12px",
                            height: "12px",
                            backgroundColor: "#28a745",
                            borderRadius: "50%"
                          }}></div>
                        )}
                        {!participant.video && (
                          <div className="video-off-indicator" style={{
                            position: "absolute",
                            bottom: "5px",
                            right: "5px",
                            backgroundColor: "#dc3545",
                            borderRadius: "50%",
                            width: "20px",
                            height: "20px",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center"
                          }}>
                            <i className="ni ni-camera-compact text-white" style={{ fontSize: "0.5rem" }}></i>
                          </div>
                        )}
                      </div>
                    </Col>
                  ))}
                </Row>
              </div>
            </div>
          </Col>

          {/* Sidebar */}
          <Col lg="4" className="p-0">
            <div className="conference-sidebar h-100" style={{ backgroundColor: "#2a2a2a" }}>
              <Nav tabs className="nav-tabs-dark">
                <NavItem>
                  <NavLink
                    className={classnames({ active: activeTab === "1" })}
                    onClick={() => toggleTab("1")}
                  >
                    Participants
                  </NavLink>
                </NavItem>
                <NavItem>
                  <NavLink
                    className={classnames({ active: activeTab === "2" })}
                    onClick={() => toggleTab("2")}
                  >
                    Chat
                  </NavLink>
                </NavItem>
                <NavItem>
                  <NavLink
                    className={classnames({ active: activeTab === "3" })}
                    onClick={() => toggleTab("3")}
                  >
                    Attendance
                  </NavLink>
                </NavItem>
              </Nav>

              <TabContent activeTab={activeTab} className="p-3">
                {/* Participants Tab */}
                <TabPane tabId="1">
                  <div className="d-flex justify-content-between align-items-center mb-3">
                    <h6 className="text-white mb-0">Participants ({participants.length})</h6>
                    <Button color="primary" size="sm" onClick={() => setShowAttendanceModal(true)}>
                      <i className="ni ni-check-bold mr-1"></i>
                      Take Attendance
                    </Button>
                  </div>
                  <ListGroup>
                    {participants.map((participant) => (
                      <ListGroupItem key={participant.id} className="bg-dark text-white border-secondary">
                        <div className="d-flex justify-content-between align-items-center">
                          <div>
                            <div className="d-flex align-items-center">
                              <i className="ni ni-single-02 mr-2"></i>
                              <span>{participant.name}</span>
                              {participant.role === "teacher" && (
                                <Badge color="primary" size="sm" className="ml-2">Host</Badge>
                              )}
                            </div>
                            <small className="text-muted">
                              {participant.video ? "📹" : "📹❌"} {participant.audio ? "🎤" : "🎤❌"}
                            </small>
                          </div>
                          <Badge color={getStatusColor(participant.status)} size="sm">
                            {participant.status}
                          </Badge>
                        </div>
                      </ListGroupItem>
                    ))}
                  </ListGroup>
                </TabPane>

                {/* Chat Tab */}
                <TabPane tabId="2">
                  <div className="chat-container" style={{ height: "300px", overflowY: "auto" }}>
                    {chatMessages.map((message) => (
                      <div key={message.id} className={`chat-message mb-2 ${message.type === 'teacher' ? 'text-right' : ''}`}>
                        <div className={`chat-bubble ${message.type === 'teacher' ? 'bg-primary text-white' : 'bg-light text-dark'}`} 
                             style={{ 
                               display: "inline-block", 
                               padding: "8px 12px", 
                               borderRadius: "15px", 
                               maxWidth: "80%" 
                             }}>
                          <small className="font-weight-bold">{message.sender}</small>
                          <div>{message.message}</div>
                          <small className="opacity-75">{message.time}</small>
                        </div>
                      </div>
                    ))}
                  </div>
                  <InputGroup className="mt-3">
                    <Input
                      placeholder="Type a message..."
                      value={chatMessage}
                      onChange={(e) => setChatMessage(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && sendChatMessage()}
                      className="bg-dark text-white border-secondary"
                    />
                    <InputGroupAddon addonType="append">
                      <Button color="primary" onClick={sendChatMessage}>
                        <i className="ni ni-send"></i>
                      </Button>
                    </InputGroupAddon>
                  </InputGroup>
                </TabPane>

                {/* Attendance Tab */}
                <TabPane tabId="3">
                  <div className="d-flex justify-content-between align-items-center mb-3">
                    <h6 className="text-white mb-0">Attendance</h6>
                    <Badge color="success">{attendance.filter(a => a.status === "present").length} Present</Badge>
                  </div>
                  <ListGroup>
                    {attendance.map((student) => (
                      <ListGroupItem key={student.id} className="bg-dark text-white border-secondary">
                        <div className="d-flex justify-content-between align-items-center">
                          <div>
                            <span>{student.name}</span>
                            <br />
                            <small className="text-muted">
                              {student.method} {student.time !== "-" && `at ${student.time}`}
                            </small>
                          </div>
                          <Badge color={getStatusColor(student.status)} size="sm">
                            {student.status}
                          </Badge>
                        </div>
                      </ListGroupItem>
                    ))}
                  </ListGroup>
                </TabPane>
              </TabContent>
            </div>
          </Col>
        </Row>
      </div>

      {/* Control Bar */}
      <div className="conference-controls bg-dark text-white p-3" style={{ position: "fixed", bottom: 0, left: 0, right: 0 }}>
        <Row className="align-items-center">
          <Col>
            <div className="d-flex justify-content-center">
              <Button
                color={isMuted ? "danger" : "secondary"}
                size="lg"
                className="mx-2"
                onClick={toggleMute}
              >
                <i className={`ni ${isMuted ? 'ni-sound-wave' : 'ni-sound-wave'}`}></i>
              </Button>
              <Button
                color={isVideoOn ? "secondary" : "danger"}
                size="lg"
                className="mx-2"
                onClick={toggleVideo}
              >
                <i className="ni ni-camera-compact"></i>
              </Button>
              <Button
                color={isScreenSharing ? "success" : "secondary"}
                size="lg"
                className="mx-2"
                onClick={toggleScreenShare}
              >
                <i className="ni ni-laptop"></i>
              </Button>
              <Button
                color={isRecording ? "danger" : "secondary"}
                size="lg"
                className="mx-2"
                onClick={toggleRecording}
              >
                <i className="ni ni-camera-compact"></i>
              </Button>
            </div>
          </Col>
          <Col xs="auto">
            <div className="d-flex">
              <Button color="warning" size="sm" className="mx-1" onClick={() => setShowPollModal(true)}>
                <i className="ni ni-chart-bar-32 mr-1"></i>
                Poll
              </Button>
              <Button color="info" size="sm" className="mx-1" onClick={() => setShowBreakoutModal(true)}>
                <i className="ni ni-collection mr-1"></i>
                Breakout
              </Button>
              <Button color="danger" size="sm" className="mx-1">
                <i className="ni ni-fat-remove mr-1"></i>
                End
              </Button>
            </div>
          </Col>
        </Row>
      </div>

      {/* Poll Modal */}
      <Modal isOpen={showPollModal} toggle={() => setShowPollModal(false)}>
        <ModalHeader toggle={() => setShowPollModal(false)}>
          Create Live Poll
        </ModalHeader>
        <ModalBody>
          <Form>
            <FormGroup>
              <Label>Question</Label>
              <Input type="text" placeholder="Enter your question..." />
            </FormGroup>
            <FormGroup>
              <Label>Options</Label>
              <Input type="text" placeholder="Option 1" className="mb-2" />
              <Input type="text" placeholder="Option 2" className="mb-2" />
              <Input type="text" placeholder="Option 3" className="mb-2" />
              <Input type="text" placeholder="Option 4" />
            </FormGroup>
          </Form>
        </ModalBody>
        <ModalFooter>
          <Button color="secondary" onClick={() => setShowPollModal(false)}>
            Cancel
          </Button>
          <Button color="primary" onClick={createPoll}>
            Launch Poll
          </Button>
        </ModalFooter>
      </Modal>

      {/* Breakout Rooms Modal */}
      <Modal isOpen={showBreakoutModal} toggle={() => setShowBreakoutModal(false)}>
        <ModalHeader toggle={() => setShowBreakoutModal(false)}>
          Create Breakout Rooms
        </ModalHeader>
        <ModalBody>
          <Form>
            <FormGroup>
              <Label>Number of Rooms</Label>
              <Input type="select">
                <option>2</option>
                <option>3</option>
                <option>4</option>
                <option>5</option>
              </Input>
            </FormGroup>
            <FormGroup>
              <Label>Time Limit (minutes)</Label>
              <Input type="number" placeholder="15" />
            </FormGroup>
          </Form>
        </ModalBody>
        <ModalFooter>
          <Button color="secondary" onClick={() => setShowBreakoutModal(false)}>
            Cancel
          </Button>
          <Button color="primary" onClick={createBreakoutRooms}>
            Create Rooms
          </Button>
        </ModalFooter>
      </Modal>

      {/* Current Poll Display */}
      {currentPoll && (
        <div className="current-poll" style={{
          position: "fixed",
          top: "50%",
          left: "50%",
          transform: "translate(-50%, -50%)",
          backgroundColor: "#fff",
          padding: "20px",
          borderRadius: "10px",
          boxShadow: "0 0 20px rgba(0,0,0,0.5)",
          zIndex: 1000
        }}>
          <h5>{currentPoll.question}</h5>
          <div className="poll-options">
            {currentPoll.options.map((option, index) => (
              <div key={index} className="poll-option mb-2">
                <div className="d-flex justify-content-between">
                  <span>{option}</span>
                  <span className="font-weight-bold">{currentPoll.responses[index]} votes</span>
                </div>
                <Progress value={(currentPoll.responses[index] / currentPoll.responses.reduce((a, b) => a + b, 0)) * 100} />
              </div>
            ))}
          </div>
          <Button color="secondary" size="sm" onClick={() => setCurrentPoll(null)}>
            Close Poll
          </Button>
        </div>
      )}
    </div>
  );
};

export default LiveVideoConference; 