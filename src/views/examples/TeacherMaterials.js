import React, { useState, useRef, useEffect } from "react";
import {
  Card, CardBody, CardHeader, Button, Input, Row, Col, Badge, ListGroup, ListGroupItem, Form, FormGroup, Label, Modal, ModalHeader, ModalBody, ModalFooter, Nav, NavItem, NavLink, Container, Tooltip
} from "reactstrap";
import { FaPlus, FaPaperclip, FaRegCommentDots, FaRegThumbsUp, FaDownload, FaTrash, FaEye, FaTag, FaLink, FaCheck, FaTimes, FaCircle, FaBookOpen } from "react-icons/fa";
import Select from "react-select";
import Header from "../../components/Headers/Header";
import { useLocation } from "react-router-dom";
import classnames from "classnames";

const mockClasses = [
  { id: 1, name: "Object Oriented Programming", section: "3A" },
  { id: 2, name: "Data Structures", section: "2B" },
  { id: 3, name: "Web Development", section: "1C" }
];
const initialMaterials = [
  {
    id: 1,
    classId: 1,
    title: "Week 1: Introduction to OOP",
    description: "Slides and reading for the first week.",
    tags: ["Week 1", "Introduction"],
    files: [{ name: "OOP_Intro.pdf", url: "#" }],
    links: [{ url: "https://youtu.be/xyz", label: "Intro Video" }],
    date: "2024-06-10",
    status: "active",
    comments: [
      { id: 1, author: "Alice Smith", content: "Thank you!", time: "2024-06-10 10:00" }
    ],
    reactions: { like: 2 }
  },
  {
    id: 2,
    classId: null,
    title: "General Reference",
    description: "A reference for all students.",
    tags: [],
    files: [{ name: "Reference.pdf", url: "#" }],
    links: [],
    date: "2024-06-12",
    status: "active",
    comments: [],
    reactions: { like: 0 }
  }
];

const tagOptions = [
  { value: "Week 1", label: "Week 1" },
  { value: "Week 2", label: "Week 2" },
  { value: "Week 3", label: "Week 3" },
  { value: "Introduction", label: "Introduction" },
  { value: "Project", label: "Project" }
];

const statusDot = (status) => (
  <FaCircle style={{ color: status === "active" ? "#2dce89" : "#adb5bd", fontSize: 10, marginRight: 6, verticalAlign: "middle" }} />
);

const TeacherMaterials = () => {
  const [materials, setMaterials] = useState(initialMaterials);
  const [showModal, setShowModal] = useState(false);
  const [selectedClass, setSelectedClass] = useState(null);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [tags, setTags] = useState([]);
  const [files, setFiles] = useState([]);
  const [links, setLinks] = useState([{ url: "", label: "" }]);
  const [status, setStatus] = useState("active");
  const [commentInputs, setCommentInputs] = useState({});
  const [expanded, setExpanded] = useState({});
  const [activeTab, setActiveTab] = useState("all");
  const fileInputRef = useRef();
  const [tooltipOpen, setTooltipOpen] = useState({});
  const [previewMaterial, setPreviewMaterial] = useState(null);
  const location = useLocation();

  const handleAddMaterial = () => {
    if (!title.trim()) return;
    const newMaterial = {
      id: Date.now(),
      classId: selectedClass ? selectedClass.value : null,
      title,
      description,
      tags: tags.map(t => t.value),
      files: files.map(f => ({ name: f.name, url: URL.createObjectURL(f) })),
      links: links.filter(l => l.url.trim()),
      date: new Date().toISOString().slice(0, 10),
      status,
      comments: [],
      reactions: { like: 0 }
    };
    setMaterials([newMaterial, ...materials]);
    setShowModal(false);
    setSelectedClass(null);
    setTitle("");
    setDescription("");
    setTags([]);
    setFiles([]);
    setLinks([{ url: "", label: "" }]);
    setStatus("active");
  };

  // Auto-open Add Material when redirected with ?new=1
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    if (params.get('new') === '1') {
      setShowModal(true);
    }
  }, [location.search]);

  const handleFileChange = (e) => {
    setFiles(Array.from(e.target.files));
  };

  const handleAddLink = () => {
    setLinks([...links, { url: "", label: "" }]);
  };
  const handleLinkChange = (idx, field, value) => {
    setLinks(links.map((l, i) => i === idx ? { ...l, [field]: value } : l));
  };
  const handleRemoveLink = (idx) => {
    setLinks(links.filter((_, i) => i !== idx));
  };

  const handleReact = (id) => {
    setMaterials(mats => mats.map(m => m.id === id ? { ...m, reactions: { ...m.reactions, like: (m.reactions.like || 0) + 1 } } : m));
  };
  const handleAddComment = (id) => {
    const comment = commentInputs[id];
    if (!comment || !comment.trim()) return;
    setMaterials(mats => mats.map(m => m.id === id ? { ...m, comments: [...m.comments, { id: Date.now(), author: "You", content: comment, time: new Date().toISOString().slice(0, 16).replace("T", " ") }] } : m));
    setCommentInputs(inputs => ({ ...inputs, [id]: "" }));
  };
  const handleDeactivate = (id) => {
    setMaterials(mats => mats.map(m => m.id === id ? { ...m, status: m.status === "active" ? "inactive" : "active" } : m));
  };
  const handleDelete = (id) => {
    setMaterials(mats => mats.filter(m => m.id !== id));
  };
  const handleExpand = (id) => {
    setExpanded(exp => ({ ...exp, [id]: !exp[id] }));
  };
  const handleAssignClass = (materialId, classOption) => {
    setMaterials(mats => mats.map(m => m.id === materialId ? { ...m, classId: classOption.value } : m));
  };

  // Split materials
  const unassigned = materials.filter(m => !m.classId);
  const assigned = materials.filter(m => m.classId);

  // Helper for tooltips
  const toggleTooltip = id => setTooltipOpen(t => ({ ...t, [id]: !t[id] }));

  return (
    <div style={{ minHeight: '100vh', background: '#f7faff' }}>
      <Header compact />
      <Container style={{ maxWidth: 1100, margin: "0 auto", padding: 32, position: 'relative' }}>
        <div className="mb-4" style={{ fontSize: 18, color: '#4f5d75' }}>
          Browse and download your class materials. Use the tabs to see all or unassigned materials. Click <b>Add Material</b> to upload new resources.
        </div>
        <div className="d-flex justify-content-end mb-3">
          <Button
            color="primary"
            style={{ borderRadius: 10, fontWeight: 700, fontSize: 16, padding: '7px 20px', boxShadow: '0 2px 8px rgba(44,62,80,0.10)' }}
            onClick={() => setShowModal(true)}
            aria-label="Add Material"
          >
            <FaPlus className="mr-2" /> Add Material
          </Button>
        </div>
        <Nav tabs className="mb-4" style={{ background: '#fff', borderRadius: 12, boxShadow: '0 2px 8px rgba(44,62,80,0.07)' }}>
          <NavItem>
            <NavLink
              className={classnames({ active: activeTab === "all" })}
              onClick={() => setActiveTab("all")}
              style={{ cursor: "pointer", fontWeight: 600, fontSize: 16 }}
            >
              <FaBookOpen className="mr-2 text-info" /> All Materials
            </NavLink>
          </NavItem>
          <NavItem>
            <NavLink
              className={classnames({ active: activeTab === "unassigned" })}
              onClick={() => setActiveTab("unassigned")}
              style={{ cursor: "pointer", fontWeight: 600, fontSize: 16 }}
            >
              <FaTag className="mr-2 text-warning" /> Unassigned
            </NavLink>
          </NavItem>
        </Nav>
        {activeTab === "all" && (
          <>
            <Row>
              {assigned.length === 0 && <Col className="text-center text-muted mt-5">No materials yet.</Col>}
              {assigned.map(m => (
                <Col md="4" sm="6" xs="12" key={m.id} className="mb-4">
                  <Card
                    className="shadow-sm h-100 d-flex flex-column justify-content-between"
                    style={{ borderRadius: 18, background: '#fff', border: 'none', minHeight: 180, padding: 0, cursor: 'pointer', transition: 'box-shadow 0.18s, transform 0.18s' }}
                    onClick={() => setPreviewMaterial(m)}
                    onMouseOver={e => { e.currentTarget.style.boxShadow = '0 8px 32px rgba(44,62,80,0.13)'; e.currentTarget.style.transform = 'translateY(-2px)'; }}
                    onMouseOut={e => { e.currentTarget.style.boxShadow = '0 2px 12px rgba(44,62,80,0.07)'; e.currentTarget.style.transform = 'none'; }}
                    aria-label={`Preview material: ${m.title}`}
                  >
                    <CardBody style={{ padding: 28, display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                      <div className="d-flex align-items-center mb-2">
                        <FaPaperclip style={{ fontSize: 28, color: '#5e72e4', marginRight: 10 }} />
                        <span className="font-weight-bold text-primary" style={{ fontSize: 18, marginRight: 8 }}>{m.title}</span>
                        <span style={{ fontSize: 13, background: '#f3f6fa', color: '#1976d2', borderRadius: 8, padding: '2px 10px', fontWeight: 600 }}>{mockClasses.find(c => c.id === m.classId)?.name || "Unknown"}</span>
                        <span style={{ marginLeft: 8 }}>{statusDot(m.status)}</span>
                      </div>
                      <div style={{ fontSize: 15, color: '#444', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: '100%' }}>{m.description}</div>
                    </CardBody>
                  </Card>
                </Col>
              ))}
            </Row>
          </>
        )}
        {/* Unassigned Tab */}
        {activeTab === "unassigned" && (
          <Card className="mb-5 shadow-sm" style={{ borderRadius: 18, background: '#fffbe6', border: '1px solid #ffe082' }}>
            <CardHeader style={{ background: 'rgba(255,224,130,0.18)', borderRadius: '18px 18px 0 0', borderBottom: 'none', display: 'flex', alignItems: 'center' }}>
              <FaTag className="mr-2 text-warning" />
              <span className="font-weight-bold mr-2" style={{ color: '#b28704' }}>Unassigned Materials</span>
            </CardHeader>
            <CardBody style={{ padding: 24 }}>
              <div className="mb-3 text-warning" style={{ fontWeight: 500, fontSize: 16 }}>
                These materials are not yet assigned to a class. Please assign them below so students can access them.
              </div>
              <Row>
                {unassigned.length === 0 && <Col className="text-center text-muted mt-5">No unassigned materials.</Col>}
                {unassigned.map(m => (
                  <Col md="6" key={m.id} className="mb-4">
                    <Card className="shadow-sm h-100" style={{ borderRadius: 16, border: '1px solid #ffe082', background: '#fffde7' }}>
                      <CardBody style={{ padding: 18 }}>
                        <div className="d-flex align-items-center mb-2">
                          <FaPaperclip className="mr-2 text-info" />
                          <span className="font-weight-bold text-primary" style={{ fontSize: 18 }}>{m.title}</span>
                        </div>
                        <div style={{ fontSize: 15, marginBottom: 8 }}>{m.description}</div>
                        <div className="mb-2">
                          <Select
                            options={mockClasses.map(cls => ({ value: cls.id, label: `${cls.name} (${cls.section})` }))}
                            placeholder="Assign to class..."
                            onChange={option => handleAssignClass(m.id, option)}
                            classNamePrefix="react-select"
                            styles={{ control: base => ({ ...base, borderRadius: 12, minHeight: 38 }) }}
                            aria-label="Assign to class"
                          />
                        </div>
                        {m.files.length > 0 && (
                          <div className="mb-2">
                            {m.files.map((f, idx) => (
                              <Badge color="secondary" key={idx} className="mr-2"><FaPaperclip className="mr-1" />{f.name}</Badge>
                            ))}
                          </div>
                        )}
                        {m.links.length > 0 && (
                          <div className="mb-2">
                            {m.links.map((l, idx) => (
                              <a key={idx} href={l.url} target="_blank" rel="noopener noreferrer" className="mr-3"><FaLink className="mr-1" />{l.label || l.url}</a>
                            ))}
                          </div>
                        )}
                      </CardBody>
                    </Card>
                  </Col>
                ))}
              </Row>
            </CardBody>
          </Card>
        )}
        <Modal isOpen={showModal} toggle={() => setShowModal(false)} centered size="md" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <Card className="shadow border-0" style={{ borderRadius: 20, background: '#f8fafc', boxShadow: '0 8px 32px rgba(44,62,80,0.13)', maxWidth: 500, width: '100%', margin: '0 auto' }}>
            <ModalHeader toggle={() => setShowModal(false)} className="pb-0" style={{ fontWeight: 800, fontSize: 20, borderBottom: 'none', letterSpacing: 0.5 }}>Add Material</ModalHeader>
            <ModalBody style={{ paddingTop: 0, background: '#f8fafc', borderRadius: '0 0 20px 20px', border: 'none', padding: 18, maxHeight: 480, overflowY: 'auto', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
              <Form>
                <FormGroup className="mb-3">
                  <Label className="font-weight-bold mb-2" style={{ fontSize: 15, color: '#344767' }}>Class</Label>
                  <Select
                    options={mockClasses.map(cls => ({ value: cls.id, label: `${cls.name} (${cls.section})` }))}
                    value={selectedClass}
                    onChange={setSelectedClass}
                    placeholder="Select class..."
                    classNamePrefix="react-select"
                    styles={{ control: base => ({ ...base, borderRadius: 12, minHeight: 36, fontSize: 15, boxShadow: 'none', borderColor: '#e3e6ed', background: '#fff' }) }}
                    aria-label="Select class"
                  />
                </FormGroup>
                <FormGroup className="mb-3">
                  <Label className="font-weight-bold mb-2" style={{ fontSize: 15, color: '#344767' }}>Title</Label>
                  <Input value={title} onChange={e => setTitle(e.target.value)} placeholder="Material title..." aria-label="Material title" style={{ borderRadius: 12, minHeight: 36, fontSize: 15, borderColor: '#e3e6ed', background: '#fff', boxShadow: 'none' }} />
                </FormGroup>
                <FormGroup className="mb-3">
                  <Label className="font-weight-bold mb-2" style={{ fontSize: 15, color: '#344767' }}>Description</Label>
                  <Input type="textarea" value={description} onChange={e => setDescription(e.target.value)} rows={2} placeholder="Description..." aria-label="Description" style={{ borderRadius: 12, fontSize: 15, borderColor: '#e3e6ed', background: '#fff', boxShadow: 'none' }} />
                </FormGroup>
                <hr style={{ borderTop: '1.2px solid #e3e6ed', margin: '24px 0 18px 0' }} />
                <FormGroup className="mb-3">
                  <Label className="font-weight-bold mb-2" style={{ fontSize: 15, color: '#344767' }}>Tags (Week/Topic)</Label>
                  <Select
                    isMulti
                    options={tagOptions}
                    value={tags}
                    onChange={setTags}
                    placeholder="Add tags..."
                    classNamePrefix="react-select"
                    styles={{ control: base => ({ ...base, borderRadius: 12, minHeight: 36, fontSize: 15, boxShadow: 'none', borderColor: '#e3e6ed', background: '#fff' }) }}
                    aria-label="Tags"
                  />
                </FormGroup>
                <FormGroup className="mb-3">
                  <Label className="font-weight-bold mb-2" style={{ fontSize: 15, color: '#344767' }}>Files</Label>
                  <div style={{ display: 'flex', alignItems: 'center' }}>
                    <label htmlFor="file-upload" style={{ background: '#5e72e4', color: '#fff', borderRadius: 8, padding: '7px 14px', fontWeight: 600, fontSize: 14, cursor: 'pointer', marginRight: 12, boxShadow: '0 2px 8px rgba(44,62,80,0.07)' }}>Choose Files</label>
                    <input id="file-upload" type="file" multiple ref={fileInputRef} onChange={handleFileChange} aria-label="Upload files" style={{ display: 'none' }} />
                    <span style={{ color: '#888', fontSize: 14 }}>{files.length > 0 ? files.map(f => f.name).join(', ') : 'No file chosen'}</span>
                  </div>
                </FormGroup>
                <FormGroup className="mb-3">
                  <Label className="font-weight-bold mb-2" style={{ fontSize: 15, color: '#344767' }}>Links</Label>
                  {links.map((l, idx) => (
                    <div key={idx} className="d-flex align-items-center mb-2">
                      <Input
                        value={l.url}
                        onChange={e => handleLinkChange(idx, "url", e.target.value)}
                        placeholder="Paste link..."
                        style={{ marginRight: 8, borderRadius: 8, fontSize: 14, borderColor: '#e3e6ed', background: '#fff', boxShadow: 'none' }}
                        aria-label="Paste link"
                      />
                      <Input
                        value={l.label}
                        onChange={e => handleLinkChange(idx, "label", e.target.value)}
                        placeholder="Label (optional)"
                        style={{ marginRight: 8, borderRadius: 8, fontSize: 14, borderColor: '#e3e6ed', background: '#fff', boxShadow: 'none' }}
                        aria-label="Link label"
                      />
                      <Button color="danger" size="sm" onClick={() => handleRemoveLink(idx)} aria-label="Remove link" style={{ borderRadius: 7, fontWeight: 700, fontSize: 14, padding: '5px 8px' }}><FaTimes /></Button>
                    </div>
                  ))}
                  <div className="d-flex justify-content-end">
                    <Button color="info" outline size="sm" onClick={handleAddLink} aria-label="Add link" style={{ borderRadius: 7, fontWeight: 700, fontSize: 14, padding: '6px 14px', marginTop: 2 }}><FaLink className="mr-1" />Add Link</Button>
                  </div>
                </FormGroup>
              </Form>
            </ModalBody>
            <ModalFooter className="border-0 pt-0 d-flex justify-content-end" style={{ background: '#f8fafc', borderRadius: '0 0 20px 20px' }}>
              <Button color="secondary" onClick={() => setShowModal(false)} style={{ borderRadius: 10, fontWeight: 600, minWidth: 90, fontSize: 15, padding: '8px 0' }}>Cancel</Button>
              <Button color="primary" onClick={handleAddMaterial} style={{ borderRadius: 10, fontWeight: 800, minWidth: 100, fontSize: 16, marginLeft: 8, padding: '8px 0', boxShadow: '0 2px 8px rgba(44,62,80,0.10)' }}>Add</Button>
            </ModalFooter>
          </Card>
        </Modal>
        {/* Material Preview Modal */}
        {previewMaterial && (
          <Modal isOpen={!!previewMaterial} toggle={() => setPreviewMaterial(null)} centered size="lg" backdrop="static">
            <Card className="shadow border-0" style={{ borderRadius: 18 }}>
              <ModalHeader toggle={() => setPreviewMaterial(null)} className="pb-0" style={{ fontWeight: 700, fontSize: 22, borderBottom: 'none' }}>
                <div className="d-flex align-items-center">
                  <FaPaperclip style={{ fontSize: 28, color: '#5e72e4', marginRight: 12 }} />
                  <span className="font-weight-bold text-primary" style={{ fontSize: 22 }}>{previewMaterial.title}</span>
                  <span style={{ marginLeft: 12, fontSize: 15, background: '#f3f6fa', color: '#1976d2', borderRadius: 8, padding: '2px 12px', fontWeight: 600 }}>{mockClasses.find(c => c.id === previewMaterial.classId)?.name || "Unknown"}</span>
                  <span style={{ marginLeft: 10 }}>{statusDot(previewMaterial.status)}</span>
                </div>
              </ModalHeader>
              <ModalBody style={{ paddingTop: 0 }}>
                <div style={{ fontSize: 16, color: '#444', marginBottom: 12 }}>{previewMaterial.description}</div>
                {previewMaterial.tags && previewMaterial.tags.length > 0 && (
                  <div className="mb-2">
                    {previewMaterial.tags.map((tag, idx) => (
                      <Badge color="primary" key={idx} className="mr-2" style={{ background: '#e3f0ff', color: '#1976d2', fontWeight: 600 }}>{tag}</Badge>
                    ))}
                  </div>
                )}
                {previewMaterial.files && previewMaterial.files.length > 0 && (
                  <div className="mb-3">
                    <div className="font-weight-bold mb-2">Files</div>
                    {previewMaterial.files.map((f, idx) => (
                      <Button key={idx} color="link" style={{ color: '#11cdef', fontWeight: 600, fontSize: 16 }} onClick={() => window.open(f.url, '_blank')}><FaDownload className="mr-1" />{f.name}</Button>
                    ))}
                  </div>
                )}
                {previewMaterial.links && previewMaterial.links.length > 0 && (
                  <div className="mb-3">
                    <div className="font-weight-bold mb-2">Links</div>
                    {previewMaterial.links.map((l, idx) => (
                      <a key={idx} href={l.url} target="_blank" rel="noopener noreferrer" className="mr-3" style={{ color: '#5e72e4', fontWeight: 600, fontSize: 16 }}><FaLink className="mr-1" />{l.label || l.url}</a>
                    ))}
                  </div>
                )}
                <div className="d-flex align-items-center mb-3">
                  {/* Like button removed for teacher view */}
                  <Button color="link" style={{ color: '#fb6340', fontSize: 22, padding: 8 }} aria-label={previewMaterial.status === "active" ? "Deactivate" : "Activate"} onClick={() => handleDeactivate(previewMaterial.id)}>{previewMaterial.status === "active" ? <FaTimes /> : <FaCheck />}</Button>
                  <Button color="link" style={{ color: '#d9534f', fontSize: 22, padding: 8 }} aria-label="Delete" onClick={() => { handleDelete(previewMaterial.id); setPreviewMaterial(null); }}><FaTrash /></Button>
                </div>
                <div className="mt-3" style={{ background: '#f8fafd', borderRadius: 12, padding: 14 }}>
                  <div className="mb-2 font-weight-bold text-info">Comments ({previewMaterial.comments.length})</div>
                  <ListGroup>
                    {previewMaterial.comments.map(c => (
                      <ListGroupItem key={c.id} className="py-2 px-3" style={{ borderRadius: 8, background: '#fff', marginBottom: 4, border: 'none' }}>
                        <span className="font-weight-bold text-info mr-2">{c.author}</span>
                        <span className="text-muted small">{c.time}</span>
                        <div>{c.content}</div>
                      </ListGroupItem>
                    ))}
                    <ListGroupItem className="py-2 px-3" style={{ borderRadius: 8, background: '#fff', border: 'none' }}>
                      <Input
                        type="text"
                        value={commentInputs[previewMaterial.id] || ""}
                        onChange={e => setCommentInputs(inputs => ({ ...inputs, [previewMaterial.id]: e.target.value }))}
                        placeholder="Write a comment..."
                        size="sm"
                        style={{ borderRadius: 8, background: '#f8fafd' }}
                        aria-label="Write a comment"
                      />
                      <Button color="link" size="sm" style={{ color: '#5e72e4', fontWeight: 600 }} onClick={() => { handleAddComment(previewMaterial.id); }} aria-label="Add comment"><FaRegCommentDots className="mr-1" />Comment</Button>
                    </ListGroupItem>
                  </ListGroup>
                </div>
              </ModalBody>
            </Card>
          </Modal>
        )}
      </Container>
    </div>
  );
};

export default TeacherMaterials; 