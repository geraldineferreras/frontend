import React, { useState } from "react";
import {
  Card, CardBody, CardHeader, Table, Input, Row, Col, Button, Badge, Modal, ModalHeader, ModalBody, ModalFooter, FormGroup, Label, InputGroup, InputGroupAddon, InputGroupText, Dropdown, DropdownToggle, DropdownMenu, DropdownItem, Alert
} from "reactstrap";
import { FaSearch, FaLock, FaCheckCircle, FaTimesCircle } from "react-icons/fa";
import Header from "components/Headers/Header.js";
import ProfilePicture from "../../components/ProfilePicture";

// Mock users
const mockUsers = [
  {
    id: 1,
    name: "Juan Dela Cruz",
    email: "juan.delacruz@school.com",
    role: "teacher",
    status: "active",
    avatar: require("../../assets/img/theme/team-1-800x800.jpg"),
    allowedModules: ["Dashboard", "Classroom", "Materials", "Assignments", "Attendance"]
  },
  {
    id: 2,
    name: "Maria Santos",
    email: "maria.santos@school.com",
    role: "student",
    status: "active",
    avatar: require("../../assets/img/theme/team-2-800x800.jpg"),
    allowedModules: ["Dashboard", "Materials", "Assignments", "Grades"]
  },
  {
    id: 3,
    name: "Admin User",
    email: "admin@school.com",
    role: "admin",
    status: "active",
    avatar: require("../../assets/img/theme/team-3-800x800.jpg"),
    allowedModules: [
      "Dashboard", "User Management", "Section Management", "Subject Management", "Offerings Management", "Reports & Logs", "Access Control"
    ]
  },
  {
    id: 4,
    name: "Inactive Teacher",
    email: "inactive.teacher@school.com",
    role: "teacher",
    status: "inactive",
    avatar: require("../../assets/img/theme/team-4-800x800.jpg"),
    allowedModules: ["Dashboard"]
  }
];

// System modules
const systemModules = [
  { key: "Dashboard", desc: "Access to dashboard and overview widgets." },
  { key: "User Management", desc: "Manage user accounts and permissions." },
  { key: "Section Management", desc: "Manage sections." },
  { key: "Subject Management", desc: "Manage subjects." },
  { key: "Offerings Management", desc: "Manage offerings." },
  { key: "Reports & Logs", desc: "View reports and audit logs." },
  { key: "Access Control", desc: "Manage access control." },
  { key: "Classroom", desc: "View and manage classroom details." },
  { key: "Announcements", desc: "Post and view announcements." },
  { key: "Materials", desc: "Upload and access learning materials." },
  { key: "Assignments", desc: "Create and submit assignments." },
  { key: "Attendance", desc: "Record and view attendance." },
  { key: "Recitation & Grades", desc: "Manage and view grades." },
  { key: "Excuse Management", desc: "Submit and review excuse letters." },
  { key: "Notifications", desc: "Receive system notifications." }
];

// Define allowed modules per role
const roleModules = {
  admin: [
    "Dashboard",
    "User Management",
    "Section Management",
    "Subject Management",
    "Offerings Management",
    "Reports & Logs",
    "Access Control"
  ],
  teacher: [
    "Dashboard",
    "Classroom",
    "Announcements",
    "Materials",
    "Assignments",
    "Submissions",
    "Attendance",
    "Recitation & Grades",
    "Excuse Management"
  ],
  student: [
    "Dashboard",
    "Join Class",
    "Announcements",
    "Materials",
    "Assignments",
    "Submissions",
    "Attendance",
    "Grades",
    "Excuse Letters",
    "Notifications"
  ]
};

const roleBadge = (role) => {
  if (role === "admin") return <Badge color="primary">Admin</Badge>;
  if (role === "teacher") return <Badge color="success">Teacher</Badge>;
  if (role === "student") return <Badge color="warning">Student</Badge>;
  return <Badge color="secondary">Unknown</Badge>;
};
const statusBadge = (status) => (
  status === "active"
    ? <Badge color="success">Active</Badge>
    : <Badge color="secondary">Inactive</Badge>
);

// Floating effect for content over header
const accessControlStyles = `
  .section-content-container {
    margin-top: -150px;
    z-index: 2;
    position: relative;
    margin-left: 32px;
    margin-right: 32px;
  }
  @media (max-width: 767.98px) {
    .section-content-container {
      margin-left: 8px;
      margin-right: 8px;
    }
  }
  .section-content-card {
    border-radius: 16px;
    box-shadow: 0 8px 32px 0 rgba(31, 38, 135, 0.10);
  }
`;

export default function AccessControl() {
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("");
  const [modal, setModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [moduleToggles, setModuleToggles] = useState([]);
  const [saveStatus, setSaveStatus] = useState(null); // { type: 'success'|'error', msg: string }
  const [modifiedUsers, setModifiedUsers] = useState([]);

  // Filter users
  const filteredUsers = mockUsers.filter(u =>
    (roleFilter === "" || u.role === roleFilter) &&
    (u.name.toLowerCase().includes(search.toLowerCase()) || u.email.toLowerCase().includes(search.toLowerCase()))
  );

  // Open modal and set toggles
  const handleManageAccess = (user) => {
    setSelectedUser(user);
    // Initialize toggles based on user's allowed modules for their role
    const userRoleModules = roleModules[user.role] || [];
    setModuleToggles(userRoleModules.map(moduleKey => user.allowedModules.includes(moduleKey)));
    setModal(true);
    setSaveStatus(null);
  };

  // Toggle module access
  const handleToggle = (idx) => {
    setModuleToggles(toggles => toggles.map((t, i) => i === idx ? !t : t));
  };

  // Toggle all modules
  const handleToggleAll = (enable) => {
    setModuleToggles(Array(roleModules[selectedUser?.role]?.length || 0).fill(enable));
  };

  // Save changes
  const handleSave = () => {
    if (selectedUser.role === "admin") {
      setSaveStatus({ type: "error", msg: "Admin access is system-wide and cannot be changed." });
      return;
    }
    if (!moduleToggles.some(Boolean)) {
      setSaveStatus({ type: "error", msg: "This user will lose access to all modules. Please enable at least one module." });
      return;
    }
    
    // Check if this is a significant change (more than 50% of modules affected)
    const currentEnabled = selectedUser.allowedModules.length;
    const newEnabled = moduleToggles.filter(Boolean).length;
    const changePercentage = Math.abs(newEnabled - currentEnabled) / currentEnabled;
    
    if (changePercentage > 0.5) {
      setSaveStatus({ type: "warning", msg: "This is a significant change to user permissions. Please review carefully." });
      setTimeout(() => setSaveStatus(null), 3000);
      return;
    }
    
    // Simulate save
    setSaveStatus({ type: "success", msg: `Access permissions updated for ${selectedUser.name}. ${newEnabled} modules enabled.` });
    if (!modifiedUsers.includes(selectedUser.id)) {
      setModifiedUsers([...modifiedUsers, selectedUser.id]);
    }
    setTimeout(() => setModal(false), 2000);
  };

  // Cancel changes
  const handleCancel = () => {
    setModal(false);
    setSaveStatus(null);
  };

  // Export access control data
  const handleExport = () => {
    const csvContent = [
      ["Name", "Email", "Role", "Status", "Modules Access", "Allowed Modules"].join(","),
      ...filteredUsers.map(user => [
        user.name,
        user.email,
        user.role,
        user.status,
        user.allowedModules.length,
        user.allowedModules.join(";")
      ].join(","))
    ].join("\n");
    
    const blob = new Blob([csvContent], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "access_control_report.csv";
    a.click();
    window.URL.revokeObjectURL(url);
  };

  // Count enabled modules
  const enabledCount = moduleToggles.filter(Boolean).length;

  return (
    <>
      <style>{accessControlStyles}</style>
      <Header showStats={false} />
      {/* Header Background */}
      <div className="header pb-6 pt-4 pt-md-7"></div>
      <div className="section-content-container">
        <Card className="shadow-sm rounded-lg section-content-card">
          <CardHeader style={{ background: "#fff", color: "#22336b", fontWeight: 700, fontSize: 22, letterSpacing: 1, borderRadius: "0.5rem 0.5rem 0 0" }}>
            Access Control
            <span className="float-right" style={{ fontSize: 16, fontWeight: 400 }}>
              {modifiedUsers.length > 0 && <Badge color="info">{modifiedUsers.length} user(s) with modified permissions</Badge>}
              <Button 
                color="secondary" 
                size="sm" 
                className="ml-3"
                onClick={handleExport}
                title="Export access control data to CSV"
              >
                📊 Export
              </Button>
            </span>
          </CardHeader>
          <CardBody>
            <Row className="mb-3 align-items-center">
              <Col md={6} className="mb-2 mb-md-0">
                <InputGroup>
                  <InputGroupAddon addonType="prepend">
                    <InputGroupText><FaSearch /></InputGroupText>
                  </InputGroupAddon>
                  <Input
                    placeholder="Search by name or email..."
                    value={search}
                    onChange={e => setSearch(e.target.value)}
                  />
                </InputGroup>
              </Col>
              <Col md={3} className="mb-2 mb-md-0">
                <Input type="select" value={roleFilter} onChange={e => setRoleFilter(e.target.value)}>
                  <option value="">All Roles</option>
                  <option value="admin">Admin</option>
                  <option value="teacher">Teacher</option>
                  <option value="student">Student</option>
                </Input>
              </Col>
              <Col md={3} className="text-md-right">
                <span className="text-muted" style={{ fontSize: 15 }}>
                  Total Users: <b>{filteredUsers.length}</b>
                </span>
              </Col>
            </Row>
            <div className="table-responsive">
              <Table className="align-items-center table-flush table-hover" bordered>
                <thead className="thead-light">
                  <tr>
                    <th>Profile</th>
                    <th>Email</th>
                    <th>Role</th>
                    <th>Status</th>
                    <th>Modules Access</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredUsers.length === 0 ? (
                    <tr><td colSpan={6} className="text-center text-muted">No users found.</td></tr>
                  ) : filteredUsers.map(user => (
                    <tr key={user.id}>
                      <td className="d-flex align-items-center">
                        <ProfilePicture 
                          user={user}
                          size={38}
                          style={{ marginRight: 12 }}
                          showFallback={true}
                        />
                        <span style={{ fontWeight: 600 }}>{user.name}</span>
                      </td>
                      <td>{user.email}</td>
                      <td>{roleBadge(user.role)}</td>
                      <td>{statusBadge(user.status)}</td>
                      <td>
                        <Badge color="info" style={{ fontSize: 12 }} title={user.allowedModules.join(", ")}>
                          {user.allowedModules.length} modules
                        </Badge>
                      </td>
                      <td>
                        <Button color="info" size="sm" onClick={() => handleManageAccess(user)}>
                          <FaLock className="mr-1" /> Manage Access
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </Table>
            </div>
          </CardBody>
        </Card>
      </div>
      {/* Manage Access Modal */}
      <Modal isOpen={modal} toggle={handleCancel} size="md" centered scrollable>
        <ModalHeader toggle={handleCancel} style={{ fontWeight: 700, fontSize: 20 }}>
          Manage Access
        </ModalHeader>
        <ModalBody style={{ paddingTop: 0 }}>
          {selectedUser && (
            <>
              <div className="mb-3">
                <div className="d-flex align-items-center mb-2">
                  <ProfilePicture 
                    user={selectedUser}
                    size={48}
                    style={{ marginRight: 16 }}
                    showFallback={true}
                  />
                  <div>
                    <div style={{ fontWeight: 700, fontSize: 18 }}>{selectedUser.name}</div>
                    <div className="text-muted" style={{ fontSize: 15 }}>{selectedUser.email}</div>
                    <div className="mt-1">{roleBadge(selectedUser.role)}</div>
                  </div>
                </div>
              </div>
              <div className="mb-2" style={{ fontWeight: 600, fontSize: 16 }}>Module Access</div>
              <div className="mb-3 p-2" style={{ background: "#e3f2fd", borderRadius: 8, border: "1px solid #bbdefb" }}>
                <span className="text-info" style={{ fontSize: 14 }}>
                  <strong>{enabledCount}</strong> of <strong>{roleModules[selectedUser.role]?.length || 0}</strong> modules enabled for this role
                </span>
                {selectedUser && selectedUser.role !== "admin" && (
                  <div className="mt-2">
                    <Button 
                      color="success" 
                      size="sm" 
                      className="mr-2"
                      onClick={() => handleToggleAll(true)}
                      disabled={enabledCount === roleModules[selectedUser.role]?.length}
                    >
                      <FaCheckCircle className="mr-1" /> Enable All
                    </Button>
                    <Button 
                      color="warning" 
                      size="sm"
                      onClick={() => handleToggleAll(false)}
                      disabled={enabledCount === 0}
                    >
                      <FaTimesCircle className="mr-1" /> Disable All
                    </Button>
                  </div>
                )}
              </div>
              <div style={{ maxHeight: 320, overflowY: "auto" }}>
                {(selectedUser ? roleModules[selectedUser.role] || [] : []).map((moduleKey, idx) => {
                  const module = systemModules.find(m => m.key === moduleKey);
                  if (!module) return null;
                  
                  return (
                    <div key={moduleKey} className="d-flex align-items-center justify-content-between mb-2 p-2" style={{ background: idx % 2 === 0 ? "#f8fafd" : "#fff", borderRadius: 8 }}>
                      <div>
                        <span style={{ fontWeight: 500 }}>{module.key}</span>
                        <span className="text-muted ml-2" style={{ fontSize: 13 }}>{module.desc}</span>
                      </div>
                      <div>
                        <label className="switch mb-0">
                          <input
                            type="checkbox"
                            checked={moduleToggles[idx] || false}
                            onChange={() => handleToggle(idx)}
                            disabled={selectedUser.role === "admin"}
                          />
                          <span className="slider round" style={{ background: moduleToggles[idx] ? "#2dce89" : "#adb5bd" }}></span>
                        </label>
                      </div>
                    </div>
                  );
                })}
              </div>
              {saveStatus && (
                <Alert color={saveStatus.type === "success" ? "success" : "danger"} className="text-center py-2">
                  {saveStatus.msg}
                </Alert>
              )}
            </>
          )}
        </ModalBody>
        <ModalFooter>
          <Button color="primary" onClick={handleSave} disabled={selectedUser && selectedUser.role === "admin"}>
            Save Changes
          </Button>
          <Button color="secondary" onClick={handleCancel}>
            Cancel
          </Button>
        </ModalFooter>
      </Modal>

      {/* Toggle Switch Styles */}
      <style>{`
        .switch {
          position: relative;
          display: inline-block;
          width: 44px;
          height: 24px;
        }
        .switch input { display: none; }
        .slider {
          position: absolute;
          cursor: pointer;
          top: 0; left: 0; right: 0; bottom: 0;
          background: #adb5bd;
          transition: .4s;
          border-radius: 24px;
        }
        .slider:before {
          position: absolute;
          content: "";
          height: 18px;
          width: 18px;
          left: 3px;
          bottom: 3px;
          background-color: white;
          transition: .4s;
          border-radius: 50%;
        }
        input:checked + .slider {
          background: #2dce89;
        }
        input:checked + .slider:before {
          transform: translateX(20px);
        }
      `}</style>
    </>
  );
} 