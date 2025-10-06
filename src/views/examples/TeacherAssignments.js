import React, { useState, useRef } from "react";
import {
  Card, CardBody, CardHeader, Button, Input, Row, Col, Badge, Form, FormGroup, Label, Modal, ModalHeader, ModalBody, Table
} from "reactstrap";
import { FaPlus, FaRegEdit, FaTrash, FaEye, FaBook, FaCalendarAlt, FaArchive, FaDownload } from "react-icons/fa";
import { useNavigate, useLocation } from "react-router-dom";

const mockClasses = [
  { id: 1, name: "OOP – BSIT 3A" },
  { id: 2, name: "Data Structures – BSCS 2B" },
  { id: 3, name: "Web Development – BSIT 1C" }
];
const initialAssignments = [
  {
    id: 1,
    classId: 1,
    title: "Assignment 1: OOP Basics",
    description: "Implement basic OOP concepts in Java.",
    dueDate: "2024-06-20",
    datePosted: "2024-06-10",
    file: { name: "OOP_Assignment.pdf", url: "#" },
    status: "Active",
    submissions: 12
  },
  {
    id: 2,
    classId: 2,
    title: "Data Structures Challenge",
    description: "Solve the provided algorithm problems.",
    dueDate: "2024-06-25",
    datePosted: "2024-06-12",
    file: null,
    status: "Archived",
    submissions: 8
  }
];

// Mock students per class
const mockStudents = [
  { id: "2021305973", name: "ANJELA SOFIA G. SARMIENTO", classId: 1 },
  { id: "2021002", name: "Jane Smith", classId: 1 },
  { id: "2021003", name: "Mike Johnson", classId: 2 },
];
// Mock submissions per assignment
const mockSubmissions = [
  { assignmentId: 1, studentId: "2021305973", date: "2024-06-18", file: { name: "OOP_Sarmiento.pdf", url: "#" } },
  { assignmentId: 1, studentId: "2021002", date: "2024-06-19", file: { name: "OOP_Smith.pdf", url: "#" } },
  { assignmentId: 2, studentId: "2021003", date: "2024-06-24", file: { name: "DS_Johnson.pdf", url: "#" } },
];

const statusColors = {
  Active: "success",
  Archived: "secondary"
};

// Assignment Form Page
export function AssignmentFormPage({ onPost, editAssignment }) {
  const [selectedClass, setSelectedClass] = useState("");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [dueDate, setDueDate] = useState("");
  const [file, setFile] = useState(null);
  const fileInputRef = useRef();
  const navigate = useNavigate();

  const handlePostAssignment = () => {
    if (!selectedClass || !title.trim() || !dueDate) return;
    const now = new Date();
    const datePosted = now.toISOString().slice(0, 10);
    const newAssignment = {
      id: editAssignment ? editAssignment.id : Date.now(),
      classId: Number(selectedClass),
      title,
      description,
      dueDate,
      datePosted,
      file: file ? { name: file.name, url: URL.createObjectURL(file) } : null,
      status: "Active",
      submissions: Math.floor(Math.random() * 20) + 1
    };
    onPost(newAssignment);
    navigate("/teacher/assignments");
  };

  return (
    <>
      <div className="header bg-gradient-info pb-8 pt-5 pt-md-8"></div>
      <div className="container mt--7">
        <Row className="justify-content-center mb-5">
          <Col md={8} lg={6}>
            <Card className="shadow-lg border-0" style={{ borderRadius: 18 }}>
              <CardBody className="p-5">
                <h3 className="mb-4 font-weight-bold text-center" style={{ letterSpacing: 1 }}>Post Assignment</h3>
                <Form>
                  <Row>
                    <Col md={6} className="mb-3">
                      <Label className="font-weight-bold">Select Class</Label>
                      <Input
                        type="select"
                        value={selectedClass}
                        onChange={e => setSelectedClass(e.target.value)}
                        className="rounded-pill"
                      >
                        <option value="">Choose class...</option>
                        {mockClasses.map(cls => (
                          <option key={cls.id} value={cls.id}>{cls.name}</option>
                        ))}
                      </Input>
                    </Col>
                    <Col md={6} className="mb-3">
                      <Label className="font-weight-bold">Assignment Title</Label>
                      <Input
                        value={title}
                        onChange={e => setTitle(e.target.value)}
                        placeholder="Assignment title..."
                        className="rounded-pill"
                      />
                    </Col>
                  </Row>
                  <Row>
                    <Col md={12} className="mb-3">
                      <Label className="font-weight-bold">Instructions / Description</Label>
                      <Input
                        type="textarea"
                        value={description}
                        onChange={e => setDescription(e.target.value)}
                        rows={3}
                        placeholder="Instructions or description..."
                        style={{ borderRadius: 14 }}
                      />
                    </Col>
                  </Row>
                  <Row>
                    <Col md={6} className="mb-3">
                      <Label className="font-weight-bold">Due Date</Label>
                      <Input
                        type="date"
                        value={dueDate}
                        onChange={e => setDueDate(e.target.value)}
                        className="rounded-pill"
                      />
                    </Col>
                    <Col md={6} className="mb-3">
                      <Label className="font-weight-bold">Attachment</Label>
                      <div className="custom-file">
                        <Input
                          type="file"
                          className="custom-file-input"
                          id="assignmentFile"
                          onChange={e => setFile(e.target.files[0] || null)}
                          accept=".pdf,.doc,.docx,.zip,.rar,.txt"
                        />
                        <label className="custom-file-label" htmlFor="assignmentFile">
                          {file ? file.name : "Choose file..."}
                        </label>
                      </div>
                    </Col>
                  </Row>
                  <Button
                    color="primary"
                    size="lg"
                    block
                    className="rounded-pill font-weight-bold mt-3"
                    onClick={handlePostAssignment}
                  >
                    <FaPlus className="mr-2" /> {editAssignment ? "Update Assignment" : "Post Assignment"}
                  </Button>
                </Form>
              </CardBody>
            </Card>
          </Col>
        </Row>
      </div>
    </>
  );
}

// Assignment Table Page
export function AssignmentTablePage({ assignments, onEdit, onArchive, onDelete, onNew }) {
  const [previewAssignment, setPreviewAssignment] = useState(null);
  const [filterClass, setFilterClass] = useState("");
  const [search, setSearch] = useState("");
  const filteredAssignments = assignments
    .filter(a => !filterClass || a.classId === Number(filterClass))
    .filter(a => !search || a.title.toLowerCase().includes(search.toLowerCase()));

  return (
    <>
      <div className="header bg-gradient-info pb-8 pt-5 pt-md-8"></div>
      <div className="container mt--7">
        <Row className="mb-4 justify-content-between align-items-center">
          <Col md={4} className="mb-2">
            <Input
              type="select"
              value={filterClass}
              onChange={e => setFilterClass(e.target.value)}
              className="rounded-pill"
            >
              <option value="">All Classes</option>
              {mockClasses.map(cls => (
                <option key={cls.id} value={cls.id}>{cls.name}</option>
              ))}
            </Input>
          </Col>
          <Col md={5} className="mb-2">
            <Input
              type="text"
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search assignments..."
              className="rounded-pill"
            />
          </Col>
          <Col md={3} className="mb-2 text-right">
            <Button color="primary" className="rounded-pill font-weight-bold" onClick={onNew}>
              <FaPlus className="mr-2" /> New Assignment
            </Button>
          </Col>
        </Row>
        <Card className="shadow border-0" style={{ borderRadius: 18, maxWidth: 1000, margin: "0 auto" }}>
          <CardHeader className="bg-white border-0 pb-2">
            <h3 className="mb-0 font-weight-bold">Posted Assignments</h3>
          </CardHeader>
          <CardBody>
            <div className="table-responsive">
              <Table className="table-striped table-bordered align-items-center" style={{ borderRadius: 12, overflow: 'hidden' }}>
                <thead className="thead-light">
                  <tr>
                    <th><FaBook className="mr-1" />Title</th>
                    <th>Class</th>
                    <th><FaCalendarAlt className="mr-1" />Due Date</th>
                    <th>Date Posted</th>
                    <th>Status</th>
                    <th>Submissions</th>
                    <th>Attachment</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredAssignments.length === 0 ? (
                    <tr>
                      <td colSpan={8} className="text-center text-muted">
                        {filterClass === "" ? "No assignments posted for this class yet." : "No assignments posted for this class yet."}
                      </td>
                    </tr>
                  ) : (
                    filteredAssignments.map(a => (
                      <tr key={a.id} style={{ cursor: 'pointer' }}>
                        <td>{a.title}</td>
                        <td>{mockClasses.find(c => c.id === a.classId)?.name || "-"}</td>
                        <td>{a.dueDate}</td>
                        <td>{a.datePosted}</td>
                        <td>
                          <Badge pill color={statusColors[a.status]} style={{ fontSize: 14 }}>
                            {a.status}
                          </Badge>
                        </td>
                        <td>{a.submissions}</td>
                        <td>
                          {a.file ? (
                            <Button color="link" onClick={() => window.open(a.file.url, '_blank')}>
                              <FaDownload className="mr-1" />{a.file.name}
                            </Button>
                          ) : (
                            <span className="text-muted">None</span>
                          )}
                        </td>
                        <td>
                          <Button color="info" size="sm" className="mr-1" onClick={() => setPreviewAssignment(a)}><FaEye /></Button>
                          <Button color="warning" size="sm" className="mr-1" onClick={() => onEdit(a)}><FaRegEdit /></Button>
                          {a.status === "Active" && <Button color="secondary" size="sm" className="mr-1" onClick={() => onArchive(a.id)}><FaArchive /></Button>}
                          <Button color="danger" size="sm" onClick={() => onDelete(a.id)}><FaTrash /></Button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </Table>
            </div>
          </CardBody>
        </Card>
        {/* Assignment Details Modal */}
        {previewAssignment && (
          <Modal isOpen={!!previewAssignment} toggle={() => setPreviewAssignment(null)} centered size="lg" backdrop="static" style={{ maxWidth: '900px', borderRadius: 18, margin: '0 auto' }}>
            <ModalHeader toggle={() => setPreviewAssignment(null)} className="pb-0" style={{ fontWeight: 700, fontSize: 22, borderBottom: 'none' }}>
              <div className="d-flex align-items-center">
                <FaBook style={{ fontSize: 28, color: '#5e72e4', marginRight: 12 }} />
                <span className="font-weight-bold text-primary" style={{ fontSize: 22 }}>{previewAssignment.title}</span>
                <span style={{ marginLeft: 12, fontSize: 15, background: '#e3f0ff', color: '#1976d2', borderRadius: 8, padding: '2px 12px', fontWeight: 600 }}>{mockClasses.find(c => c.id === previewAssignment.classId)?.name || "-"}</span>
              </div>
            </ModalHeader>
            <ModalBody style={{ paddingTop: 0, maxHeight: '70vh', overflowY: 'auto' }}>
              <div className="mb-2"><b>Posted:</b> {previewAssignment.datePosted}</div>
              <div className="mb-2"><b>Due:</b> {previewAssignment.dueDate}</div>
              <div className="mb-3"><b>Description:</b><br />{previewAssignment.description}</div>
              {previewAssignment.file && (
                <div className="mb-3">
                  <div className="font-weight-bold mb-2">Attachment</div>
                  <Button color="link" onClick={() => window.open(previewAssignment.file.url, '_blank')}><FaDownload className="mr-1" />{previewAssignment.file.name}</Button>
                </div>
              )}
              <div className="mb-2"><Badge color={statusColors[previewAssignment.status]}>{previewAssignment.status}</Badge></div>
              <div className="mb-2"><b>Submissions:</b> {previewAssignment.submissions}</div>
              {/* Student Submission List */}
              <div className="mt-4">
                <h5 className="mb-3 font-weight-bold">Student Submissions</h5>
                <Table className="table-striped table-bordered">
                  <thead>
                    <tr>
                      <th>Student</th>
                      <th>Status</th>
                      <th>Submission Date</th>
                      <th>File</th>
                    </tr>
                  </thead>
                  <tbody>
                    {mockStudents.filter(s => s.classId === previewAssignment.classId).map(student => {
                      const submission = mockSubmissions.find(s => s.assignmentId === previewAssignment.id && s.studentId === student.id);
                      return (
                        <tr key={student.id}>
                          <td>
                            <b>{student.name}</b><br />
                            <small className="text-muted">ID: {student.id}</small>
                          </td>
                          <td>
                            {submission
                              ? <Badge color="success">Submitted</Badge>
                              : <Badge color="danger">Not Submitted</Badge>
                            }
                          </td>
                          <td>{submission ? submission.date : "-"}</td>
                          <td>
                            {submission
                              ? <Button color="link" size="sm" onClick={() => window.open(submission.file.url, '_blank')}>{submission.file.name}</Button>
                              : <span className="text-muted">-</span>
                            }
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </Table>
              </div>
              <div className="d-flex justify-content-end mt-3">
                <Button color="warning" className="mr-2" onClick={() => onEdit(previewAssignment)}><FaRegEdit className="mr-1" />Edit</Button>
                {previewAssignment.status === "Active" && <Button color="secondary" className="mr-2" onClick={() => onArchive(previewAssignment.id)}><FaArchive className="mr-1" />Archive</Button>}
                <Button color="danger" onClick={() => onDelete(previewAssignment.id)}><FaTrash className="mr-1" />Delete</Button>
              </div>
            </ModalBody>
          </Modal>
        )}
      </div>
    </>
  );
}

// Main Router Component
const TeacherAssignments = () => {
  const [assignments, setAssignments] = useState(initialAssignments);
  const [editAssignment, setEditAssignment] = useState(null);
  const navigate = useNavigate();
  const location = useLocation();

  // Handlers for table page
  const handleEdit = (assignment) => {
    setEditAssignment(assignment);
    navigate("/teacher/assignments/new");
  };
  const handleArchive = (id) => {
    setAssignments(asgs => asgs.map(a => a.id === id ? { ...a, status: "Archived" } : a));
  };
  const handleDelete = (id) => {
    setAssignments(asgs => asgs.filter(a => a.id !== id));
  };
  const handleNew = () => {
    setEditAssignment(null);
    navigate("/teacher/assignments/new");
  };
  // Handler for form page
  const handlePost = (assignment) => {
    if (editAssignment) {
      setAssignments(asgs => asgs.map(a => a.id === editAssignment.id ? assignment : a));
    } else {
      setAssignments([assignment, ...assignments]);
    }
    setEditAssignment(null);
  };

  // Routing logic (simple manual switch based on location)
  if (location.pathname === "/teacher/assignments/new") {
    return <AssignmentFormPage onPost={handlePost} editAssignment={editAssignment} />;
  }
  // Default: table page
  return <AssignmentTablePage assignments={assignments} onEdit={handleEdit} onArchive={handleArchive} onDelete={handleDelete} onNew={handleNew} />;
};

export default TeacherAssignments; 