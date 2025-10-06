import React, { useState } from "react";
import {
  Card, CardHeader, CardBody, Container, Row, Col, Button, FormGroup, Input, Table, Badge, Modal, ModalHeader, ModalBody, ModalFooter, Alert
} from "reactstrap";
import { FaSave, FaEdit, FaTrash, FaCheck, FaTimes, FaPlus, FaArchive, FaEye, FaCommentDots } from "react-icons/fa";

// Mock data for demonstration
const mockClasses = [
  { id: 1, name: "OOP - 3A" },
  { id: 2, name: "Data Structures - 2B" },
];
const mockStudents = [
  { id: "2021305973", name: "ANJELA SOFIA G. SARMIENTO" },
  { id: "2021002", name: "Jane Smith" },
  { id: "2021003", name: "Mike Johnson" },
];
const activityTypes = ["Recitation", "Quiz", "Exam", "Project"];

const TeacherGrades = () => {
  // Filters & state
  const [selectedClass, setSelectedClass] = useState("");
  const [activityType, setActivityType] = useState("");
  const [activityDate, setActivityDate] = useState("");
  const [totalScore, setTotalScore] = useState("");
  const [activityCreated, setActivityCreated] = useState(false);
  const [scores, setScores] = useState([]);
  const [feedbackModal, setFeedbackModal] = useState({ open: false, studentId: null, feedback: "" });
  const [activityList, setActivityList] = useState([
    // Example past activities
    { id: 1, classId: 1, type: "Quiz", date: "2024-06-01", total: 100 },
    { id: 2, classId: 1, type: "Recitation", date: "2024-06-02", total: 10 },
  ]);
  const [selectedActivity, setSelectedActivity] = useState(null);

  // Create activity handler
  const handleCreateActivity = () => {
    if (!selectedClass || !activityType || !activityDate || !totalScore) {
      alert("Please fill all fields.");
      return;
    }
    // Check for duplicate
    if (activityList.some(a => a.classId === Number(selectedClass) && a.type === activityType && a.date === activityDate)) {
      alert("Grade session already created.");
      return;
    }
    setActivityCreated(true);
    setScores(mockStudents.map(s => ({
      ...s, score: "", status: "", feedback: ""
    })));
    setActivityList([
      ...activityList,
      { id: Date.now(), classId: Number(selectedClass), type: activityType, date: activityDate, total: totalScore }
    ]);
  };

  // Score input handler
  const handleScoreChange = (studentId, value) => {
    setScores(scores.map(s =>
      s.id === studentId
        ? { ...s, score: value, status: value !== "" ? "Graded" : "" }
        : s
    ));
  };

  // Feedback modal handlers
  const openFeedbackModal = (studentId, feedback) => setFeedbackModal({ open: true, studentId, feedback });
  const closeFeedbackModal = () => setFeedbackModal({ open: false, studentId: null, feedback: "" });
  const saveFeedback = () => {
    setScores(scores.map(s =>
      s.id === feedbackModal.studentId ? { ...s, feedback: feedbackModal.feedback } : s
    ));
    closeFeedbackModal();
  };

  // Save all handler (simulate API call)
  const handleSaveAll = () => {
    // Here you would POST to /api/teacher/submitStudentScore for each student
    alert("Scores saved!");
  };

  // Activity view/edit
  const handleViewActivity = (activity) => {
    setSelectedActivity(activity);
    setActivityCreated(true);
    // Fetch scores for this activity (simulate)
    setScores(mockStudents.map(s => ({
      ...s, score: Math.floor(Math.random() * activity.total), status: "Graded", feedback: ""
    })));
    setTotalScore(activity.total);
    setActivityDate(activity.date);
    setActivityType(activity.type);
    setSelectedClass(activity.classId.toString());
  };

  // Color for pass/fail (example: pass >= 60%)
  const getScoreColor = (score) => {
    if (score === "") return "";
    return Number(score) >= 0.6 * Number(totalScore) ? "success" : "danger";
  };

  return (
    <>
      <div style={{
        width: '100%',
        height: '120px',
        background: 'linear-gradient(90deg, #1cb5e0 0%, #2096ff 100%)',
        boxShadow: '0 2px 8px rgba(44,62,80,0.07)',
        marginBottom: 24
      }} />
      <Container className="mt--7" fluid style={{ paddingTop: '50px' }}>
        <Row>
          {/* Activity List Sidebar */}
          <Col md={3}>
            <Card className="shadow mb-4">
              <CardHeader>
                <h4 className="mb-0">Past Activities</h4>
              </CardHeader>
              <CardBody style={{ maxHeight: 400, overflowY: "auto" }}>
                {activityList.length === 0 ? (
                  <Alert color="info">No grade entries yet. Select class and activity type to begin.</Alert>
                ) : (
                  activityList.map(a => (
                    <div key={a.id} className="d-flex justify-content-between align-items-center mb-2 p-2" style={{ borderBottom: "1px solid #f0f1f6" }}>
                      <div>
                        <b>{activityTypes.includes(a.type) ? a.type : "Activity"}</b> <br />
                        <span className="text-muted small">{a.date}</span>
                      </div>
                      <div>
                        <Button color="info" size="sm" onClick={() => handleViewActivity(a)}><FaEye /></Button>{" "}
                        <Button color="danger" size="sm"><FaTrash /></Button>
                      </div>
                    </div>
                  ))
                )}
              </CardBody>
            </Card>
          </Col>

          {/* Main Grading Section */}
          <Col md={9}>
            {/* Top Filters */}
            <Card className="shadow mb-4">
              <CardBody>
                <Row className="align-items-end">
                  <Col md={3}>
                    <FormGroup>
                      <label>Select Class</label>
                      <Input type="select" value={selectedClass} onChange={e => setSelectedClass(e.target.value)}>
                        <option value="">Choose...</option>
                        {mockClasses.map(cls => (
                          <option key={cls.id} value={cls.id}>{cls.name}</option>
                        ))}
                      </Input>
                    </FormGroup>
                  </Col>
                  <Col md={3}>
                    <FormGroup>
                      <label>Activity Type</label>
                      <Input type="select" value={activityType} onChange={e => setActivityType(e.target.value)}>
                        <option value="">Choose...</option>
                        {activityTypes.map(type => (
                          <option key={type} value={type}>{type}</option>
                        ))}
                      </Input>
                    </FormGroup>
                  </Col>
                  <Col md={2}>
                    <FormGroup>
                      <label>Date</label>
                      <Input type="date" value={activityDate} onChange={e => setActivityDate(e.target.value)} />
                    </FormGroup>
                  </Col>
                  <Col md={2}>
                    <FormGroup>
                      <label>Total Score</label>
                      <Input type="number" min={1} value={totalScore} onChange={e => setTotalScore(e.target.value)} />
                    </FormGroup>
                  </Col>
                  <Col md={2}>
                    <Button color="primary" block onClick={handleCreateActivity}><FaPlus className="mr-1" />Create Activity</Button>
                  </Col>
                </Row>
              </CardBody>
            </Card>

            {/* Grading Table */}
            {activityCreated && (
              <Card className="shadow">
                <CardHeader>
                  <Row>
                    <Col>
                      <h4 className="mb-0">{activityType} – {activityDate} <Badge color="info">{totalScore} pts</Badge></h4>
                    </Col>
                    <Col className="text-right">
                      <Button color="success" onClick={handleSaveAll}><FaSave className="mr-1" />Save All</Button>
                    </Col>
                  </Row>
                </CardHeader>
                <CardBody>
                  <div className="table-responsive">
                    <Table className="align-items-center table-flush">
                      <thead className="thead-light">
                        <tr>
                          <th>Student</th>
                          <th>Score</th>
                          <th>Status</th>
                          <th>Feedback</th>
                          <th>Save</th>
                        </tr>
                      </thead>
                      <tbody>
                        {scores.map(s => (
                          <tr key={s.id} className={s.score === "" ? "bg-warning-light" : ""}>
                            <td>
                              <b>{s.name}</b><br />
                              <small className="text-muted">ID: {s.id}</small>
                            </td>
                            <td>
                              <Input
                                type="number"
                                min={0}
                                max={totalScore}
                                value={s.score}
                                onChange={e => handleScoreChange(s.id, e.target.value)}
                                style={{ width: 80, textAlign: "center" }}
                                className={`border-${getScoreColor(s.score)}`}
                              />
                            </td>
                            <td>
                              {s.status === "Graded" ? (
                                <Badge color={getScoreColor(s.score)}>Graded</Badge>
                              ) : (
                                <Badge color="secondary">Not Graded</Badge>
                              )}
                            </td>
                            <td>
                              <Button color="info" size="sm" onClick={() => openFeedbackModal(s.id, s.feedback)}>
                                <FaCommentDots />
                              </Button>
                            </td>
                            <td>
                              <Button color="success" size="sm"><FaSave /></Button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </Table>
                  </div>
                </CardBody>
              </Card>
            )}

            {/* Empty State */}
            {!activityCreated && (
              <Alert color="info" className="text-center mt-4">
                No grade entries yet. Select class and activity type to begin.
              </Alert>
            )}
          </Col>
        </Row>

        {/* Feedback Modal */}
        <Modal isOpen={feedbackModal.open} toggle={closeFeedbackModal}>
          <ModalHeader toggle={closeFeedbackModal}>Feedback for Student</ModalHeader>
          <ModalBody>
            <Input
              type="textarea"
              value={feedbackModal.feedback}
              onChange={e => setFeedbackModal({ ...feedbackModal, feedback: e.target.value })}
              placeholder="Enter feedback..."
            />
          </ModalBody>
          <ModalFooter>
            <Button color="primary" onClick={saveFeedback}>Save</Button>
            <Button color="secondary" onClick={closeFeedbackModal}>Cancel</Button>
          </ModalFooter>
        </Modal>
      </Container>
    </>
  );
};

export default TeacherGrades; 