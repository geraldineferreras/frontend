import React, { useState, useRef, useEffect } from "react";
import {
  Card, CardBody, CardHeader, Button, Input, Row, Col, Dropdown, DropdownToggle, DropdownMenu, DropdownItem, Badge, ListGroup, ListGroupItem, Form, FormGroup, Label, Modal, ModalHeader, ModalBody, ModalFooter
} from "reactstrap";
import { FaPaperclip, FaSmile, FaRegCommentDots, FaRegThumbsUp, FaPlus } from "react-icons/fa";
import TeacherNavbar from "components/Navbars/TeacherNavbar.js";
import Header from "components/Headers/Header.js";
import Select from "react-select";
import { useLocation } from "react-router-dom";

const mockClasses = [
  { id: 1, name: "Object Oriented Programming", section: "3A", code: "b7p3r9" },
  { id: 2, name: "Data Structures", section: "2B", code: "a1c2d3" },
  { id: 3, name: "Web Development", section: "1C", code: "z8y7x6" }
];
const mockStudents = [
  { id: 1, name: "Alice Smith", classId: 1 },
  { id: 2, name: "Bob Johnson", classId: 1 },
  { id: 3, name: "Charlie Lee", classId: 2 },
  { id: 4, name: "Diana Prince", classId: 2 },
  { id: 5, name: "Ethan Hunt", classId: 3 }
];
const mockAnnouncements = [
  {
    id: 1,
    author: "Jessica Jones",
    time: "2024-06-10 09:30",
    content: "Welcome to the new semester! Please check the syllabus.",
    attachments: [],
    target: "Class",
    comments: [
      { id: 1, author: "Alice Smith", content: "Thank you!", time: "2024-06-10 10:00" }
    ],
    reactions: { like: 2 }
  },
  {
    id: 2,
    author: "Jessica Jones",
    time: "2024-06-11 14:00",
    content: "@Bob Johnson Please see me after class.",
    attachments: [],
    target: "Bob Johnson",
    comments: [],
    reactions: { like: 0 }
  }
];

const TeacherAnnouncement = () => {
  const [announcements, setAnnouncements] = useState(mockAnnouncements);
  const [showModal, setShowModal] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [targetType, setTargetType] = useState("Class");
  const [selectedStudents, setSelectedStudents] = useState([]);
  const [content, setContent] = useState("");
  const [attachment, setAttachment] = useState(null);
  const [commentInputs, setCommentInputs] = useState({});
  const fileInputRef = useRef();
  const [selectedClass, setSelectedClass] = useState(null);
  const location = useLocation();

  // For react-select
  const classOptions = mockClasses.map(cls => ({ value: cls.id, label: `${cls.name} (${cls.section})` }));
  const filteredStudents = selectedClass ? mockStudents.filter(s => s.classId === selectedClass.value) : [];
  const studentOptions = filteredStudents.map(s => ({ value: s.id, label: s.name }));

  const handlePost = () => {
    if (!content.trim() || (targetType === "Class" && !selectedClass) || (targetType === "Student" && selectedStudents.length === 0)) return;
    const newAnnouncement = {
      id: announcements.length + 1,
      author: "Jessica Jones",
      time: new Date().toISOString().slice(0, 16).replace("T", " "),
      content,
      attachments: attachment ? [attachment] : [],
      class: targetType === "Class" ? selectedClass?.label : null,
      target: targetType === "Class" ? "Class" : selectedStudents.map(s => s.label).join(", "),
      comments: [],
      reactions: { like: 0 }
    };
    setAnnouncements([newAnnouncement, ...announcements]);
    setShowModal(false);
    setContent("");
    setAttachment(null);
    setSelectedStudents([]);
    setTargetType("Class");
    setSelectedClass(null);
  };

  // Auto-open modal when redirected with ?new=1
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    if (params.get('new') === '1') {
      setShowModal(true);
    }
  }, [location.search]);

  const handleAddComment = (announcementId) => {
    const comment = commentInputs[announcementId];
    if (!comment || !comment.trim()) return;
    setAnnouncements(anns => anns.map(a =>
      a.id === announcementId
        ? { ...a, comments: [...a.comments, { id: Date.now(), author: "You", content: comment, time: new Date().toISOString().slice(0, 16).replace("T", " ") }] }
        : a
    ));
    setCommentInputs(inputs => ({ ...inputs, [announcementId]: "" }));
  };

  const handleReact = (announcementId) => {
    setAnnouncements(anns => anns.map(a =>
      a.id === announcementId
        ? { ...a, reactions: { ...a.reactions, like: (a.reactions.like || 0) + 1 } }
        : a
    ));
  };

  const handleAttachment = (e) => {
    const file = e.target.files[0];
    if (file) setAttachment(file);
  };

  return (
    <>
      <Header compact />
      <div style={{ maxWidth: 700, margin: "0 auto", padding: 24 }}>
        <div className="d-flex justify-content-end mb-4">
          <Button color="primary" onClick={() => setShowModal(true)} style={{ borderRadius: 20, fontWeight: 600, fontSize: 15, padding: '7px 20px' }}>
            <FaPlus className="mr-2" /> New Announcement
          </Button>
        </div>
        <Modal isOpen={showModal} toggle={() => setShowModal(false)} centered contentClassName="border-0 shadow-lg" style={{ borderRadius: 20 }}>
          <ModalHeader toggle={() => setShowModal(false)} className="border-0 pb-0" style={{ fontWeight: 700, fontSize: 20 }}>
            Post Announcement
          </ModalHeader>
          <ModalBody style={{ paddingTop: 0 }}>
            <Form>
              <FormGroup className="mb-4">
                <Label className="font-weight-bold mb-2">Target</Label>
                <div className="d-flex align-items-center mb-2">
                  <Button
                    color={targetType === "Class" ? "primary" : "secondary"}
                    outline={targetType !== "Class"}
                    onClick={() => { setTargetType("Class"); setSelectedStudents([]); setSelectedClass(null); }}
                    style={{ borderRadius: '20px 0 0 20px', fontWeight: 600, minWidth: 100 }}
                  >
                    Class
                  </Button>
                  <Button
                    color={targetType === "Student" ? "primary" : "secondary"}
                    outline={targetType !== "Student"}
                    onClick={() => { setTargetType("Student"); setSelectedClass(null); }}
                    style={{ borderRadius: '0 20px 20px 0', fontWeight: 600, minWidth: 100 }}
                  >
                    Student(s)
                  </Button>
                </div>
                {targetType === "Class" && (
                  <div className="mb-2">
                    <Select
                      options={classOptions}
                      value={selectedClass}
                      onChange={option => setSelectedClass(option)}
                      placeholder="Select class..."
                      classNamePrefix="react-select"
                      styles={{
                        control: base => ({ ...base, borderRadius: 12, minHeight: 38 }),
                        menu: base => ({ ...base, zIndex: 9999 })
                      }}
                    />
                  </div>
                )}
                {targetType === "Student" && (
                  <div className="mb-2">
                    <Select
                      isMulti
                      options={mockStudents.map(s => ({ value: s.id, label: s.name }))}
                      value={selectedStudents}
                      onChange={setSelectedStudents}
                      placeholder="Select student(s)..."
                      classNamePrefix="react-select"
                      styles={{
                        control: base => ({ ...base, borderRadius: 12, minHeight: 38 }),
                        menu: base => ({ ...base, zIndex: 9999 })
                      }}
                    />
                  </div>
                )}
                <small className="text-muted">Choose the class or specific students to send the announcement to.</small>
              </FormGroup>
              <FormGroup className="mb-4">
                <Label className="font-weight-bold mb-2">Announcement</Label>
                <Input type="textarea" value={content} onChange={e => setContent(e.target.value)} rows={3} placeholder="Write your announcement..." style={{ borderRadius: 12 }} />
              </FormGroup>
              <FormGroup className="mb-4">
                <Label className="font-weight-bold mb-2">Attachment</Label>
                <div className="d-flex align-items-center">
                  <Button color="info" outline size="sm" onClick={() => fileInputRef.current && fileInputRef.current.click()} style={{ borderRadius: 12, fontWeight: 600 }}>
                    <FaPaperclip className="mr-1" />Attach
                  </Button>
                  <input type="file" ref={fileInputRef} style={{ display: 'none' }} onChange={handleAttachment} />
                  {attachment && (
                    <span className="ml-3 text-muted small d-flex align-items-center">
                      {attachment.name}
                      <Button close className="ml-2 p-0" style={{ fontSize: 16 }} onClick={() => setAttachment(null)} />
                    </span>
                  )}
                </div>
                <small className="text-muted">Optional: Add a file for your announcement.</small>
              </FormGroup>
            </Form>
          </ModalBody>
          <ModalFooter className="border-0 pt-0 d-flex justify-content-end">
            <Button color="secondary" onClick={() => setShowModal(false)} style={{ borderRadius: 12, fontWeight: 600, minWidth: 90 }}>Cancel</Button>
            <Button color="primary" onClick={handlePost} style={{ borderRadius: 12, fontWeight: 700, minWidth: 90, marginLeft: 8 }}>Post</Button>
          </ModalFooter>
        </Modal>
        <div>
          {announcements.map(a => (
            <Card className="mb-4 shadow-sm" key={a.id} style={{ borderRadius: 16 }}>
              <CardHeader className="d-flex justify-content-between align-items-center" style={{ background: 'transparent', borderBottom: 'none' }}>
                <div>
                  <span className="font-weight-bold text-primary">{a.author}</span>
                  <span className="text-muted small ml-2">{a.time}</span>
                  <Badge color={a.target === "Class" ? "info" : "warning"} className="ml-3" pill>{a.target}</Badge>
                </div>
                {/* Like button removed for teacher view */}
              </CardHeader>
              <CardBody>
                <div style={{ fontSize: 17, marginBottom: 8 }}>{a.content}</div>
                {a.attachments.length > 0 && (
                  <div className="mb-2">
                    {a.attachments.map((att, idx) => (
                      <Badge color="secondary" key={idx} className="mr-2"><FaPaperclip className="mr-1" />{att.name || "Attachment"}</Badge>
                    ))}
                  </div>
                )}
                <div className="mt-3">
                  <ListGroup>
                    {a.comments.map(c => (
                      <ListGroupItem key={c.id} className="py-2 px-3" style={{ borderRadius: 8, background: '#f8fafd', marginBottom: 4 }}>
                        <span className="font-weight-bold text-info mr-2">{c.author}</span>
                        <span className="text-muted small">{c.time}</span>
                        <div>{c.content}</div>
                      </ListGroupItem>
                    ))}
                    <ListGroupItem className="py-2 px-3" style={{ borderRadius: 8, background: '#f8fafd' }}>
                      <Input
                        type="text"
                        value={commentInputs[a.id] || ""}
                        onChange={e => setCommentInputs(inputs => ({ ...inputs, [a.id]: e.target.value }))}
                        placeholder="Write a comment..."
                        size="sm"
                        style={{ borderRadius: 8, background: '#fff' }}
                      />
                      <Button color="link" size="sm" style={{ color: '#5e72e4', fontWeight: 600 }} onClick={() => handleAddComment(a.id)}><FaRegCommentDots className="mr-1" />Comment</Button>
                    </ListGroupItem>
                  </ListGroup>
                </div>
              </CardBody>
            </Card>
          ))}
        </div>
      </div>
    </>
  );
};

export default TeacherAnnouncement; 