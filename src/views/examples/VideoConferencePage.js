import React, { useState, useEffect, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
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
  Toast,
  ToastHeader,
  ToastBody,
} from "reactstrap";
import classnames from "classnames";

const VideoConferencePage = () => {
  const { sessionId } = useParams();
  const navigate = useNavigate();
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
  const [showSettingsModal, setShowSettingsModal] = useState(false);
  const [participants, setParticipants] = useState([]);
  const [attendance, setAttendance] = useState([]);
  const [currentPoll, setCurrentPoll] = useState(null);
  const [breakoutRooms, setBreakoutRooms] = useState([]);
  const [session, setSession] = useState(null);
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState("");
  const [toastType, setToastType] = useState("success");
  const [pollData, setPollData] = useState({
    question: "",
    options: ["", "", "", ""]
  });
  const videoRef = useRef(null);
  const streamRef = useRef(null);

  // Mock session data
  const mockSessions = {
    1: {
      id: 1,
      subject: "Mathematics 101",
      course: "BS Computer Science",
      section: "A",
      date: "2024-01-15",
      time: "09:00",
      duration: 90,
      status: "live",
      attendanceMethod: "qr",
      joinApproval: "auto",
      enrolledStudents: 25,
      attendees: 18,
    },
    2: {
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
      attendees: 22,
    },
  };

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
    // Load session data
    const currentSession = mockSessions[sessionId];
    if (currentSession) {
      setSession(currentSession);
      setParticipants(mockParticipants);
      setAttendance(mockAttendance);
      setChatMessages(mockChatMessages);
    } else {
      showToastMessage("Session not found", "danger");
      setTimeout(() => window.close() || window.history.back(), 2000);
    }
  }, [sessionId, navigate]);

  useEffect(() => {
    if (isVideoOn || !isMuted) {
      // Request camera/mic only if needed
      navigator.mediaDevices.getUserMedia({ video: isVideoOn, audio: true })
        .then((stream) => {
          streamRef.current = stream;
          if (videoRef.current && isVideoOn) {
            videoRef.current.srcObject = stream;
          }
          // Set initial audio state
          stream.getAudioTracks().forEach(track => {
            track.enabled = !isMuted;
          });
          // Set initial video state
          stream.getVideoTracks().forEach(track => {
            track.enabled = isVideoOn;
          });
        })
        .catch((err) => {
          showToastMessage("Could not access camera/mic: " + err.message, "danger");
        });
    } else {
      // Stop all tracks if both are off
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
        streamRef.current = null;
      }
    }
    // Cleanup on unmount
    return () => {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
        streamRef.current = null;
      }
    };
  }, [isVideoOn, isMuted]);

  const toggleTab = (tab) => {
    if (activeTab !== tab) setActiveTab(tab);
  };

  const toggleMute = () => {
    setIsMuted((prev) => {
      const newMuted = !prev;
      if (streamRef.current) {
        streamRef.current.getAudioTracks().forEach(track => {
          track.enabled = !newMuted;
        });
      }
      showToastMessage(`Microphone ${newMuted ? 'muted' : 'unmuted'}`, "info");
      return newMuted;
    });
  };

  const toggleVideo = () => {
    setIsVideoOn((prev) => {
      const newVideoOn = !prev;
      if (streamRef.current) {
        streamRef.current.getVideoTracks().forEach(track => {
          track.enabled = newVideoOn;
        });
      }
      showToastMessage(`Camera ${newVideoOn ? 'turned on' : 'turned off'}`, "info");
      return newVideoOn;
    });
  };

  const toggleScreenShare = () => {
    setIsScreenSharing(!isScreenSharing);
    showToastMessage(`Screen sharing ${!isScreenSharing ? 'started' : 'stopped'}`, "info");
  };

  const toggleRecording = () => {
    setIsRecording(!isRecording);
    showToastMessage(`Recording ${!isRecording ? 'started' : 'stopped'}`, isRecording ? "warning" : "success");
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
      showToastMessage("Message sent", "success");
    }
  };

  const createPoll = () => {
    if (pollData.question.trim() && pollData.options.some(opt => opt.trim())) {
      const newPoll = {
        question: pollData.question,
        options: pollData.options.filter(opt => opt.trim()),
        responses: pollData.options.filter(opt => opt.trim()).map(() => Math.floor(Math.random() * 10) + 1)
      };
      setCurrentPoll(newPoll);
      setShowPollModal(false);
      setPollData({ question: "", options: ["", "", "", ""] });
      showToastMessage("Poll launched successfully!", "success");
    } else {
      showToastMessage("Please fill in the question and at least one option", "warning");
    }
  };

  const createBreakoutRooms = () => {
    const rooms = [
      { id: 1, name: "Group A - Basic Loops", participants: ["John Smith", "Sarah Johnson"] },
      { id: 2, name: "Group B - Advanced Loops", participants: ["Mike Davis", "Emily Wilson"] },
    ];
    setBreakoutRooms(rooms);
    setShowBreakoutModal(false);
    showToastMessage("Breakout rooms created!", "success");
  };

  const takeAttendance = () => {
    showToastMessage("Attendance taken successfully!", "success");
    setShowAttendanceModal(false);
  };

  const endSession = () => {
    if (window.confirm("Are you sure you want to end this session?")) {
      showToastMessage("Session ended", "info");
      setTimeout(() => window.close() || window.history.back(), 2000);
    }
  };

  const showToastMessage = (message, type = "success") => {
    setToastMessage(message);
    setToastType(type);
    setShowToast(true);
    setTimeout(() => setShowToast(false), 3000);
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "present": return "success";
      case "late": return "warning";
      case "absent": return "danger";
      default: return "secondary";
    }
  };

  if (!session) {
    return (
      <div className="d-flex justify-content-center align-items-center" style={{ height: "100vh" }}>
        <div className="text-center">
          <div className="spinner-border text-primary" role="status">
            <span className="sr-only">Loading...</span>
          </div>
          <p className="mt-3">Loading session...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="live-video-conference" style={{ height: "100vh", backgroundColor: "#181A20", display: "flex", flexDirection: "column" }}>
      {/* Header */}
      <div className="conference-header bg-dark text-white px-3 py-2 d-flex align-items-center justify-content-between" style={{ minHeight: 40, borderBottom: "1px solid #23242a" }}>
        <div>
          <span style={{ fontWeight: 600, fontSize: 15 }}>{session.subject} - {session.course} - Section {session.section}</span>
          <span style={{ fontSize: 12, color: "#aaa", marginLeft: 12 }}>{session.date} at {session.time}</span>
        </div>
        <div className="d-flex align-items-center">
          <Badge color="danger" className="mr-2" style={{ fontSize: 11, padding: "3px 10px" }}>
            <i className="ni ni-sound-wave mr-1" style={{ fontSize: 12 }}></i>
            LIVE
          </Badge>
          <span className="text-muted mr-2" style={{ fontSize: 13 }}>
            {participants.filter(p => p.status === "present").length} / {participants.length} students
          </span>
          <Button color="secondary" size="sm" style={{ width: 28, height: 28, borderRadius: 8, padding: 0 }} onClick={() => window.close() || window.history.back()}>
            <i className="ni ni-fat-remove" style={{ fontSize: 15 }}></i>
          </Button>
        </div>
      </div>

      {/* Main Content Area */}
      <div style={{ flex: 1, display: "flex", flexDirection: "row", minHeight: 0 }}>
        {/* Left: Video and Participants */}
        <div style={{ flex: 2, display: "flex", flexDirection: "column", minWidth: 0 }}>
          {/* Participant Strip */}
          <div style={{
            background: "#23242a",
            padding: "8px 0 8px 0",
            display: "flex",
            flexDirection: "row",
            alignItems: "center",
            overflowX: "auto",
            borderBottom: "1px solid #23242a",
            minHeight: 70,
            maxHeight: 70,
            gap: 12
          }}>
            {participants.map((participant) => (
              <div key={participant.id} style={{
                width: 100,
                minWidth: 100,
                maxWidth: 100,
                height: 85,
                backgroundColor: "#333",
                borderRadius: 12,
                position: "relative",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                margin: "0 8px",
                boxShadow: "0 2px 8px rgba(0,0,0,0.10)"
              }}>
                <div className="text-center text-white">
                  <i className="ni ni-single-02" style={{ fontSize: "1.7rem" }}></i>
                  <div className="mt-1" style={{ fontSize: 12, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis", width: 90 }}>
                    <small>{participant.name}</small>
                  </div>
                </div>
                {participant.speaking && (
                  <div className="speaking-indicator" style={{
                    position: "absolute",
                    top: "5px",
                    right: "5px",
                    width: "8px",
                    height: "8px",
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
                    width: "13px",
                    height: "13px",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center"
                  }}>
                    <i className="ni ni-camera-compact text-white" style={{ fontSize: "0.6rem" }}></i>
                  </div>
                )}
              </div>
            ))}
          </div>
          {/* Main Video Area */}
          <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", background: "#23242a", borderRadius: 18, width: '100%', height: '100%', maxWidth: 900, maxHeight: 400, overflow: 'hidden' }}>
            <div className="text-center text-white" style={{ width: "100%", height: "100%", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" }}>
              {isVideoOn ? (
                <video
                  ref={videoRef}
                  autoPlay
                  muted
                  playsInline
                  style={{ width: '100%', height: '100%', borderRadius: 18, background: '#111', objectFit: 'cover', display: 'block' }}
                />
              ) : (
                <>
                  <i className="ni ni-camera-compact" style={{ fontSize: "4rem", opacity: 0.5 }}></i>
                  <h5 className="mt-3">Main Video Display</h5>
                  <p className="text-muted">Teacher's video feed would appear here</p>
                  <Alert color="warning" className="mt-3">
                    <i className="ni ni-camera-compact mr-2"></i>
                    Camera is turned off
                  </Alert>
                </>
              )}
              {/* Name overlay */}
              <div style={{
                position: "absolute",
                bottom: 18,
                left: 18,
                background: "rgba(0,0,0,0.5)",
                color: "#fff",
                borderRadius: 8,
                padding: "2px 10px",
                fontSize: 14,
                fontWeight: 500
              }}>{participants[0]?.name || "Teacher"}</div>
            </div>
          </div>
        </div>
        {/* Right: Chat Panel */}
        <div style={{ flex: 1, minWidth: 320, maxWidth: 400, background: "#20222b", borderLeft: "1px solid #23242a", display: "flex", flexDirection: "column" }}>
          {/* Chat panel logic restored */}
          <div style={{ flex: 1, display: "flex", flexDirection: "column", height: "100%" }}>
            <Nav tabs style={{ background: "#23242a", borderRadius: 8, margin: 12 }}>
              <NavItem>
                <NavLink
                  className={classnames({ active: activeTab === "1" })}
                  onClick={() => setActiveTab("1")}
                  style={{ cursor: "pointer" }}
                >
                  Group
                </NavLink>
              </NavItem>
              <NavItem>
                <NavLink
                  className={classnames({ active: activeTab === "2" })}
                  onClick={() => setActiveTab("2")}
                  style={{ cursor: "pointer" }}
                >
                  Personal
                </NavLink>
              </NavItem>
            </Nav>
            <TabContent activeTab={activeTab} style={{ flex: 1, overflowY: "auto", margin: 12 }}>
              <TabPane tabId="1">
                <div style={{ height: 320, overflowY: "auto" }}>
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
              </TabPane>
              <TabPane tabId="2">
                <div style={{ color: "#aaa", textAlign: "center", marginTop: 40 }}>No personal messages yet.</div>
              </TabPane>
            </TabContent>
            <InputGroup className="mt-2" style={{ margin: 12 }}>
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
          </div>
        </div>
      </div>
      {/* Control Bar (restored) */}
      <div className="conference-controls bg-dark text-white p-2" style={{ position: "fixed", bottom: 0, left: 0, right: 0, minHeight: 60, zIndex: 10 }}>
        <Row className="align-items-center">
          <Col>
            <div className="d-flex justify-content-center">
              <Button
                color={isMuted ? "danger" : "secondary"}
                size="md"
                className={"mx-2" + (isMuted ? " active" : "")}
                onClick={toggleMute}
                style={{ borderRadius: "50%", width: 44, height: 44, display: "flex", alignItems: "center", justifyContent: "center", padding: 0 }}
              >
                <i className={`ni ni-sound-wave${isMuted ? " text-danger" : ""}`} style={{ fontSize: 18 }}></i>
              </Button>
              <Button
                color={isVideoOn ? "secondary" : "danger"}
                size="md"
                className={"mx-2" + (!isVideoOn ? " active" : "")}
                onClick={toggleVideo}
                style={{ borderRadius: "50%", width: 44, height: 44, display: "flex", alignItems: "center", justifyContent: "center", padding: 0 }}
              >
                <i className={`ni ni-camera-compact${!isVideoOn ? " text-danger" : ""}`} style={{ fontSize: 18 }}></i>
              </Button>
              <Button
                color={isScreenSharing ? "success" : "secondary"}
                size="md"
                className={"mx-2" + (isScreenSharing ? " active" : "")}
                onClick={toggleScreenShare}
                style={{ borderRadius: "50%", width: 44, height: 44, display: "flex", alignItems: "center", justifyContent: "center", padding: 0 }}
              >
                <i className="ni ni-laptop" style={{ fontSize: 18 }}></i>
              </Button>
              <Button
                color={isRecording ? "danger" : "secondary"}
                size="md"
                className={"mx-2" + (isRecording ? " active" : "")}
                onClick={toggleRecording}
                style={{ borderRadius: "50%", width: 44, height: 44, display: "flex", alignItems: "center", justifyContent: "center", padding: 0 }}
              >
                <i className={`ni ni-camera-compact${isRecording ? " text-danger" : ""}`} style={{ fontSize: 18 }}></i>
              </Button>
            </div>
          </Col>
          <Col xs="auto">
            <div className="d-flex">
              <Button color="warning" size="sm" className="mx-1" style={{ fontSize: 14, padding: "6px 14px" }} onClick={() => setShowPollModal(true)}>
                <i className="ni ni-chart-bar-32 mr-1"></i>
                Poll
              </Button>
              <Button color="info" size="sm" className="mx-1" style={{ fontSize: 14, padding: "6px 14px" }} onClick={() => setShowBreakoutModal(true)}>
                <i className="ni ni-collection mr-1"></i>
                Breakout
              </Button>
              <Button color="danger" size="sm" className="mx-1" style={{ fontSize: 14, padding: "6px 14px" }} onClick={endSession}>
                <i className="ni ni-fat-remove mr-1"></i>
                End
              </Button>
            </div>
          </Col>
        </Row>
      </div>
      {/* Modals and Toasts (restored) */}
      <Modal isOpen={showAttendanceModal} toggle={() => setShowAttendanceModal(false)} size="lg">
        <ModalHeader toggle={() => setShowAttendanceModal(false)}>
          Take Attendance
        </ModalHeader>
        <ModalBody>
          <Alert color="info">
            <i className="ni ni-camera-compact mr-2"></i>
            Students can scan their QR codes or you can mark attendance manually.
          </Alert>
          <ListGroup>
            {attendance.map((student) => (
              <ListGroupItem key={student.id}>
                <div className="d-flex justify-content-between align-items-center">
                  <span>{student.name}</span>
                  <UncontrolledDropdown>
                    <DropdownToggle caret size="sm">
                      {student.status}
                    </DropdownToggle>
                    <DropdownMenu>
                      <DropdownItem onClick={() => {
                        const newAttendance = attendance.map(s =>
                          s.id === student.id ? { ...s, status: "present" } : s
                        );
                        setAttendance(newAttendance);
                      }}>
                        Present
                      </DropdownItem>
                      <DropdownItem onClick={() => {
                        const newAttendance = attendance.map(s =>
                          s.id === student.id ? { ...s, status: "late" } : s
                        );
                        setAttendance(newAttendance);
                      }}>
                        Late
                      </DropdownItem>
                      <DropdownItem onClick={() => {
                        const newAttendance = attendance.map(s =>
                          s.id === student.id ? { ...s, status: "absent" } : s
                        );
                        setAttendance(newAttendance);
                      }}>
                        Absent
                      </DropdownItem>
                    </DropdownMenu>
                  </UncontrolledDropdown>
                </div>
              </ListGroupItem>
            ))}
          </ListGroup>
        </ModalBody>
        <ModalFooter>
          <Button color="secondary" onClick={() => setShowAttendanceModal(false)}>
            Cancel
          </Button>
          <Button color="primary" onClick={takeAttendance}>
            Save Attendance
          </Button>
        </ModalFooter>
      </Modal>
      <Modal isOpen={showPollModal} toggle={() => setShowPollModal(false)}>
        <ModalHeader toggle={() => setShowPollModal(false)}>
          Create Live Poll
        </ModalHeader>
        <ModalBody>
          <Form>
            <FormGroup>
              <Label>Question</Label>
              <Input
                type="text"
                placeholder="Enter your question..."
                value={pollData.question}
                onChange={(e) => setPollData({ ...pollData, question: e.target.value })}
              />
            </FormGroup>
            <FormGroup>
              <Label>Options</Label>
              {pollData.options.map((option, index) => (
                <Input
                  key={index}
                  type="text"
                  placeholder={`Option ${index + 1}`}
                  className="mb-2"
                  value={option}
                  onChange={(e) => {
                    const newOptions = [...pollData.options];
                    newOptions[index] = e.target.value;
                    setPollData({ ...pollData, options: newOptions });
                  }}
                />
              ))}
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
      {/* Toast Notifications */}
      <div style={{
        position: "fixed",
        top: "20px",
        right: "20px",
        zIndex: 2000
      }}>
        <Toast isOpen={showToast}>
          <ToastHeader icon={toastType === "success" ? "✓" : toastType === "warning" ? "⚠" : "ℹ"}>
            {toastType === "success" ? "Success" : toastType === "warning" ? "Warning" : "Info"}
          </ToastHeader>
          <ToastBody>
            {toastMessage}
          </ToastBody>
        </Toast>
      </div>
    </div>
  );
};

export default VideoConferencePage; 