import React, { useState, useEffect } from "react";
import {
  Card, CardHeader, CardBody, Row, Col, Button, FormGroup, Input, Table, Badge, Modal, ModalHeader, ModalBody, ModalFooter, Alert, Spinner
} from "reactstrap";
import { FaCheck, FaTimes, FaEye, FaSearch, FaFileImage, FaUser, FaCheckCircle } from "react-icons/fa";
import apiService from "../../services/api";

const ExcuseManagement = () => {
  const [selectedClass, setSelectedClass] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [search, setSearch] = useState("");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [detailModal, setDetailModal] = useState({ open: false, excuse: null });
  const [confirmModal, setConfirmModal] = useState({ open: false, excuse: null, action: null });
  const [excuses, setExcuses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [teacherNotes, setTeacherNotes] = useState("");

  // Load excuse letters on component mount
  useEffect(() => {
    loadExcuseLetters();
  }, []);

  // Load excuse letters from API
  const loadExcuseLetters = async () => {
    try {
      setLoading(true);
      setError("");
      const response = await apiService.getTeacherExcuseLetters();
      
      console.log('API Response:', response); // Debug log
      
      if (response && response.status) {
        // Handle different possible data structures
        let excusesData = response.data;
        console.log('Excuses Data:', excusesData, 'Type:', typeof excusesData, 'Is Array:', Array.isArray(excusesData)); // Debug log
        
                 // If data is an object, try to find the array inside it
         if (!Array.isArray(excusesData) && typeof excusesData === 'object') {
           console.log('Object keys:', Object.keys(excusesData)); // Debug: see what keys are available
           // Try common property names that might contain the array
           if (excusesData.excuse_letters && Array.isArray(excusesData.excuse_letters)) {
             excusesData = excusesData.excuse_letters;
           } else if (excusesData.excuses && Array.isArray(excusesData.excuses)) {
             excusesData = excusesData.excuses;
           } else if (excusesData.data && Array.isArray(excusesData.data)) {
             excusesData = excusesData.data;
           } else if (excusesData.records && Array.isArray(excusesData.records)) {
             excusesData = excusesData.records;
           } else if (excusesData.items && Array.isArray(excusesData.items)) {
             excusesData = excusesData.items;
           } else if (excusesData.result && Array.isArray(excusesData.result)) {
             excusesData = excusesData.result;
           } else if (excusesData.response && Array.isArray(excusesData.response)) {
             excusesData = excusesData.response;
           } else {
             // If no array found, set empty array instead of converting object values
             excusesData = [];
           }
         }
        
        setExcuses(Array.isArray(excusesData) ? excusesData : []);
        console.log('Final excuses array:', Array.isArray(excusesData) ? excusesData : []); // Debug final result
      } else {
        console.log('API response status is false:', response); // Debug failed response
        setError("Failed to load excuse letters");
      }
    } catch (err) {
      console.error('Error loading excuse letters:', err);
      setError("Failed to load excuse letters. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // Filter logic
  const filteredExcuses = excuses.filter(e => {
    if (selectedClass && e.class_id !== selectedClass) return false;
    if (statusFilter !== "All" && e.status !== statusFilter) return false;
         if (dateFrom && e.date_absent < dateFrom) return false;
     if (dateTo && e.date_absent > dateTo) return false;
    if (search && !(
      e.student_name?.toLowerCase().includes(search.toLowerCase()) ||
      e.student_id?.includes(search)
    )) return false;
    return true;
  });

  // Calculate summary statistics
  const totalLetters = excuses.length;
  const pendingCount = excuses.filter(e => e.status === "pending").length;
  const approvedCount = excuses.filter(e => e.status === "approved").length;
  const rejectedCount = excuses.filter(e => e.status === "rejected").length;

  const statusColors = {
    pending: "warning",
    approved: "success",
    rejected: "danger",
  };

  // Approve/Reject logic
  const handleReview = (excuse, action) => {
    setTeacherNotes("");
    setConfirmModal({ open: true, excuse, action });
  };

  const confirmReview = async () => {
    if (!confirmModal.excuse) return;
    
    try {
      setLoading(true);
      const status = confirmModal.action === "approve" ? "approved" : "rejected";
      
             // Update excuse letter status
       const updateResponse = await apiService.updateExcuseLetterStatus(confirmModal.excuse.letter_id, {
        status: status,
        teacher_notes: teacherNotes || `${status === "approved" ? "Approved" : "Rejected"} - ${new Date().toLocaleDateString()}`
      });

      if (updateResponse && updateResponse.status) {
        // If approved, record attendance as excused
        if (status === "approved") {
          try {
                         await apiService.recordAttendance({
               student_id: confirmModal.excuse.student_id,
               class_id: confirmModal.excuse.class_id,
               date: confirmModal.excuse.date_absent,
               status: "excused"
             });
          } catch (attendanceErr) {
            console.error('Error recording attendance:', attendanceErr);
            // Continue even if attendance recording fails
          }
        } else if (status === "rejected") {
          // If rejected, record attendance as absent
          try {
                         await apiService.recordAttendance({
               student_id: confirmModal.excuse.student_id,
               class_id: confirmModal.excuse.class_id,
               date: confirmModal.excuse.date_absent,
               status: "absent"
             });
          } catch (attendanceErr) {
            console.error('Error recording attendance:', attendanceErr);
            // Continue even if attendance recording fails
          }
        }

                 // Update local state
         setExcuses(excuses.map(e =>
           e.letter_id === confirmModal.excuse.letter_id ? { ...e, status: status } : e
         ));
        
        setConfirmModal({ open: false, excuse: null, action: null });
        setTeacherNotes("");
      } else {
        setError("Failed to update excuse letter status");
      }
    } catch (err) {
      console.error('Error updating excuse letter:', err);
      setError("Failed to update excuse letter status. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // Table row highlight
  const getRowClass = (status) => status === "pending" ? "bg-warning-light" : "";

  // Get unique classes from excuses
  const uniqueClasses = [...new Set(excuses.map(e => e.class_name))].map(name => ({
    id: name,
    name: name
  }));

  return (
    <>
      {/* Transparent Header */}
      <div className="header bg-gradient-info pb-8 pt-5 pt-md-8" style={{ 
        background: 'linear-gradient(87deg, #11cdef 0, #1171ef 100%)',
        position: 'relative',
        overflow: 'hidden',
        minHeight: '200px',
        paddingTop: '3rem',
        paddingBottom: '4rem',
        zIndex: 1000,
        display: 'block',
        width: '100%',
        marginTop: '0',
        marginBottom: '0'
      }}>
        {/* Background Pattern */}
        <div style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'url("data:image/svg+xml,%3Csvg width="60" height="60" viewBox="0 0 60 60" xmlns="http://www.w3.org/2000/svg"%3E%3Cg fill="none" fill-rule="evenodd"%3E%3Cg fill="%23ffffff" fill-opacity="0.1"%3E%3Ccircle cx="30" cy="30" r="2"/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")',
          opacity: 0.3,
          pointerEvents: 'none'
        }}></div>
        
        {/* Header Content */}
        <div className="container-fluid" style={{ position: 'relative', zIndex: 1001 }}>
          <div className="header-body">
            <div className="row align-items-center py-5">
              <div className="col-lg-6 col-7">
                <h1 className="text-white d-inline-block mb-0" style={{ fontSize: '2.5rem', fontWeight: '700', margin: '0' }}>EXCUSE MANAGEMENT</h1>
                <nav aria-label="breadcrumb" className="d-none d-md-inline-block ml-md-4 mt-3">
                  <ol className="breadcrumb breadcrumb-links breadcrumb-dark">
                    <li className="breadcrumb-item">
                      <a href="#pablo" onClick={(e) => e.preventDefault()}>
                        <i className="fas fa-home"></i>
                      </a>
                    </li>
                    <li className="breadcrumb-item">
                      <a href="#pablo" onClick={(e) => e.preventDefault()}>Pages</a>
                    </li>
                    <li className="breadcrumb-item active" aria-current="page">
                      Excuse Management
                    </li>
                  </ol>
                </nav>
              </div>
              <div className="col-lg-6 col-5 text-right">
                <div className="d-flex align-items-center justify-content-end">
                  <div className="search-container mr-4">
                    <div className="input-group input-group-alternative">
                      <div className="input-group-prepend">
                        <span className="input-group-text">
                          <i className="fas fa-search"></i>
                        </span>
                      </div>
                      <input
                        className="form-control"
                        placeholder="Search"
                        type="text"
                        style={{ background: 'rgba(255,255,255,0.1)', border: 'none', color: 'white' }}
                      />
                    </div>
                  </div>
                  <div className="avatar-group">
                                         <div className="avatar avatar-lg rounded-circle bg-white shadow">
                       <div 
                         className="rounded-circle d-flex align-items-center justify-content-center"
                         style={{ 
                           width: '48px', 
                           height: '48px', 
                           background: 'linear-gradient(87deg, #11cdef 0, #1171ef 100%)',
                           color: 'white',
                           fontSize: '18px',
                           fontWeight: 'bold'
                         }}
                       >
                         JQ
                       </div>
                     </div>
                    <span className="text-white ml-3 font-weight-bold" style={{ fontSize: '1.1rem' }}>Joel Quiambao</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      <div className="container mt-4" style={{ position: 'relative', zIndex: 1001 }}>
        {/* Error Alert */}
        {error && (
          <Alert color="danger" className="mb-4">
            {error}
            <Button close onClick={() => setError("")} />
          </Alert>
        )}

        {/* Loading Spinner */}
        {loading && (
          <div className="text-center mb-4">
            <Spinner color="primary" />
            <span className="ml-2">Loading excuse letters...</span>
          </div>
        )}

        {/* Excuse Management Summary Cards */}
        <Row className="mb-4">
          <Col lg={3} md={6} sm={6} xs={12} className="mb-3 px-2">
            <Card className="shadow border-0">
              <CardBody>
                <div className="d-flex align-items-center">
                  <div className="flex-grow-1">
                    <h5 className="card-title text-uppercase text-muted mb-0">Total Letters</h5>
                    <span className="h1 font-weight-bold mb-0" style={{ color: '#11cdef' }}>{totalLetters}</span>
                  </div>
                  <div className="icon icon-shape bg-gradient-info text-white rounded-circle shadow" style={{ width: '60px', height: '60px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <FaFileImage />
                  </div>
                </div>
              </CardBody>
            </Card>
          </Col>
          <Col lg={3} md={6} sm={6} xs={12} className="mb-3 px-2">
            <Card className="shadow border-0">
              <CardBody>
                <div className="d-flex align-items-center">
                  <div className="flex-grow-1">
                    <h5 className="card-title text-uppercase text-muted mb-0">Pending</h5>
                    <span className="h1 font-weight-bold mb-0" style={{ color: '#f6c23e' }}>{pendingCount}</span>
                  </div>
                  <div className="icon icon-shape bg-gradient-warning text-white rounded-circle shadow" style={{ width: '60px', height: '60px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <FaTimes />
                  </div>
                </div>
              </CardBody>
            </Card>
          </Col>
          <Col lg={3} md={6} sm={6} xs={12} className="mb-3 px-2">
            <Card className="shadow border-0">
              <CardBody>
                <div className="d-flex align-items-center">
                  <div className="flex-grow-1">
                    <h5 className="card-title text-uppercase text-muted mb-0">Approved</h5>
                    <span className="h1 font-weight-bold mb-0" style={{ color: '#2dce89' }}>{approvedCount}</span>
                  </div>
                  <div className="icon icon-shape bg-gradient-success text-white rounded-circle shadow" style={{ width: '60px', height: '60px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <FaCheck />
                  </div>
                </div>
              </CardBody>
            </Card>
          </Col>
          <Col lg={3} md={6} sm={6} xs={12} className="mb-3 px-2">
            <Card className="shadow border-0">
              <CardBody>
                <div className="d-flex align-items-center">
                  <div className="flex-grow-1">
                    <h5 className="card-title text-uppercase text-muted mb-0">Rejected</h5>
                    <span className="h1 font-weight-bold mb-0" style={{ color: '#f5365c' }}>{rejectedCount}</span>
                  </div>
                  <div className="icon icon-shape bg-gradient-danger text-white rounded-circle shadow" style={{ width: '60px', height: '60px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <FaTimes />
                  </div>
                </div>
              </CardBody>
            </Card>
          </Col>
        </Row>

        {/* Filters and Actions Card */}
        <Card className="shadow border-0 mb-4">
          <CardBody>
            <Row className="align-items-end">
              <Col lg={3} md={6} sm={12} xs={12} className="mb-3">
                <FormGroup>
                  <label className="form-control-label">Select Class</label>
                  <Input type="select" value={selectedClass} onChange={e => setSelectedClass(e.target.value)} className="form-control-alternative">
                    <option value="">All Classes</option>
                    {uniqueClasses.map(cls => (
                      <option key={cls.id} value={cls.id}>{cls.name}</option>
                    ))}
                  </Input>
                </FormGroup>
              </Col>
              <Col lg={2} md={6} sm={6} xs={12} className="mb-3">
                <FormGroup>
                  <label className="form-control-label">From</label>
                  <Input type="date" value={dateFrom} onChange={e => setDateFrom(e.target.value)} className="form-control-alternative" />
                </FormGroup>
              </Col>
              <Col lg={2} md={6} sm={6} xs={12} className="mb-3">
                <FormGroup>
                  <label className="form-control-label">To</label>
                  <Input type="date" value={dateTo} onChange={e => setDateTo(e.target.value)} className="form-control-alternative" />
                </FormGroup>
              </Col>
              <Col lg={2} md={6} sm={6} xs={12} className="mb-3">
                <FormGroup>
                  <label className="form-control-label">Status</label>
                  <Input type="select" value={statusFilter} onChange={e => setStatusFilter(e.target.value)} className="form-control-alternative">
                    <option>All</option>
                    <option>pending</option>
                    <option>approved</option>
                    <option>rejected</option>
                  </Input>
                </FormGroup>
              </Col>
              <Col lg={3} md={6} sm={6} xs={12} className="mb-3">
                <FormGroup>
                  <label className="form-control-label">Search</label>
                  <Input
                    type="text"
                    value={search}
                    onChange={e => setSearch(e.target.value)}
                    placeholder="Search by name or ID..."
                    className="form-control-alternative"
                  />
                </FormGroup>
              </Col>
            </Row>
          </CardBody>
        </Card>

        {/* Excuse Letters Table Card */}
        <Card className="shadow border-0">
          <CardBody>
            <div className="d-flex justify-content-between align-items-center mb-4">
              <h3 className="mb-0 text-dark font-weight-bold">Excuse Letters</h3>
              <div className="d-flex flex-column flex-sm-row gap-2">
                <Button color="secondary" size="sm" className="mb-2 mb-sm-0" onClick={loadExcuseLetters}>
                  <i className="fas fa-sync-alt mr-1"></i>
                  <span className="d-none d-sm-inline">Refresh</span>
                </Button>
                <Button color="info" size="sm">
                  <i className="fas fa-download mr-1"></i>
                  <span className="d-none d-sm-inline">Export Data</span>
                </Button>
              </div>
            </div>
            
            <Table className="align-items-center table-flush" style={{ width: '100%', minWidth: 'auto' }}>
              <thead className="thead-light">
                <tr>
                  <th scope="col" className="text-uppercase text-muted" style={{ width: '35%' }}>Student</th>
                  <th scope="col" className="text-uppercase text-muted d-none d-sm-table-cell" style={{ width: '12%' }}>Date</th>
                  <th scope="col" className="text-uppercase text-muted d-none d-md-table-cell" style={{ width: '18%' }}>Reason</th>
                  <th scope="col" className="text-uppercase text-muted d-none d-lg-table-cell" style={{ width: '10%' }}>Attachment</th>
                  <th scope="col" className="text-uppercase text-muted" style={{ width: '10%' }}>Status</th>
                  <th scope="col" className="text-uppercase text-muted" style={{ width: '15%' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredExcuses.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="text-center text-muted py-4">
                      <i className="fas fa-inbox fa-2x mb-3 d-block"></i>
                      {loading ? "Loading excuse letters..." : "No excuse letters found."}
                    </td>
                  </tr>
                ) : (
                  filteredExcuses.map(e => (
                                         <tr key={e.letter_id} className={getRowClass(e.status)}>
                      <td style={{ maxWidth: '0', width: '35%' }}>
                        <div className="media align-items-center">
                          <div 
                            className="bg-gradient-primary mr-3" 
                            style={{ 
                              width: '40px', 
                              height: '40px', 
                              borderRadius: '50%',
                              display: 'flex', 
                              alignItems: 'center', 
                              justifyContent: 'center',
                              flexShrink: 0
                            }}
                          >
                            <i className="fas fa-user text-white" style={{ fontSize: '16px' }}></i>
                          </div>
                          <div className="media-body" style={{ minWidth: '0', overflow: 'hidden' }}>
                            <span className="font-weight-bold text-dark d-block" style={{ wordBreak: 'break-word', lineHeight: '1.2' }}>{e.student_name}</span>
                            <div className="text-muted small">ID: {e.student_id}</div>
                            <div className="text-muted small">Section: {e.section_name}</div>
                                                         {/* Mobile-only info */}
                             <div className="d-sm-none mt-2">
                               <small className="text-muted d-block">Date: {e.date_absent}</small>
                               <small className="text-muted d-block">Reason: {e.reason?.length > 20 ? e.reason.slice(0, 20) + "..." : e.reason}</small>
                             </div>
                          </div>
                        </div>
                      </td>
                                             <td className="d-none d-sm-table-cell" style={{ width: '12%' }}>
                         <span className="text-dark">{e.date_absent}</span>
                       </td>
                      <td className="d-none d-md-table-cell" style={{ width: '18%' }}>
                        <span style={{ cursor: "pointer", color: "#007bff" }} onClick={() => setDetailModal({ open: true, excuse: e })} className="text-truncate d-block">
                          {e.reason?.length > 18 ? e.reason.slice(0, 18) + "..." : e.reason}
                        </span>
                      </td>
                      <td className="d-none d-lg-table-cell text-center" style={{ width: '10%' }}>
                        {e.attachment && (
                          <Button color="link" className="p-0" onClick={() => setDetailModal({ open: true, excuse: e })}>
                            <i className="fas fa-file-image text-primary"></i>
                          </Button>
                        )}
                      </td>
                      <td style={{ width: '10%' }}>
                        <Badge color={statusColors[e.status]} className="badge-pill">{e.status}</Badge>
                      </td>
                      <td style={{ width: '15%' }}>
                        <div className="d-flex flex-column flex-sm-row gap-1">
                          {e.status === "pending" && (
                            <>
                              <Button color="success" size="sm" className="mb-1 mb-sm-0 mr-sm-1" onClick={() => handleReview(e, "approve")}>
                                <i className="fas fa-check mr-1"></i>
                                <span className="d-none d-sm-inline">Approve</span>
                              </Button>
                              <Button color="danger" size="sm" className="mb-1 mb-sm-0" onClick={() => handleReview(e, "reject")}>
                                <i className="fas fa-times mr-1"></i>
                                <span className="d-none d-sm-inline">Reject</span>
                              </Button>
                            </>
                          )}
                          <Button color="info" outline size="sm" onClick={() => setDetailModal({ open: true, excuse: e })}>
                            <i className="fas fa-eye mr-1"></i>
                            <span className="d-none d-sm-inline">View</span>
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </Table>
          </CardBody>
        </Card>

        {/* Excuse Detail Modal */}
        <Modal isOpen={detailModal.open} toggle={() => setDetailModal({ open: false, excuse: null })} size="md" centered>
          <ModalHeader toggle={() => setDetailModal({ open: false, excuse: null })}>Excuse Details</ModalHeader>
          <ModalBody>
            {detailModal.excuse && (
              <>
                <Row className="mb-2">
                  <Col md={6}><b>Name:</b> {detailModal.excuse.student_name}</Col>
                  <Col md={6}><b>ID:</b> {detailModal.excuse.student_id}</Col>
                </Row>
                <Row className="mb-2">
                  <Col md={6}><b>Section:</b> {detailModal.excuse.section_name}</Col>
                  <Col md={6}><b>Class:</b> {detailModal.excuse.class_name}</Col>
                                     <Col md={6}><b>Date:</b> {detailModal.excuse.date_absent}</Col>
                </Row>
                <Row className="mb-2">
                  <Col md={12}><b>Reason:</b><br />{detailModal.excuse.reason}</Col>
                </Row>
                {detailModal.excuse.attachment && (
                  <Row className="mb-2">
                    <Col md={12} className="text-center">
                      <img
                        src={detailModal.excuse.attachment}
                        alt="Attachment"
                        style={{ maxWidth: "100%", maxHeight: 250, cursor: "zoom-in", borderRadius: 8 }}
                        onClick={e => window.open(detailModal.excuse.attachment, "_blank")}
                      />
                    </Col>
                  </Row>
                )}
                {detailModal.excuse.status === "pending" && (
                  <Row className="mt-3">
                    <Col className="text-center">
                      <Button color="success" className="mr-2" onClick={() => handleReview(detailModal.excuse, "approve")}>Approve</Button>
                      <Button color="danger" onClick={() => handleReview(detailModal.excuse, "reject")}>Reject</Button>
                    </Col>
                  </Row>
                )}
              </>
            )}
          </ModalBody>
        </Modal>

        {/* Approve/Reject Confirmation Modal */}
        <Modal isOpen={confirmModal.open} toggle={() => setConfirmModal({ open: false, excuse: null, action: null })} centered>
          <ModalHeader toggle={() => setConfirmModal({ open: false, excuse: null, action: null })}>
            {confirmModal.action === "approve" ? "Approve Excuse" : "Reject Excuse"}
          </ModalHeader>
          <ModalBody>
            <p>Are you sure you want to {confirmModal.action} this excuse letter?</p>
            <FormGroup>
              <label><b>Teacher Notes (Optional):</b></label>
              <Input
                type="textarea"
                value={teacherNotes}
                onChange={e => setTeacherNotes(e.target.value)}
                placeholder={`Add notes for ${confirmModal.action === "approve" ? "approval" : "rejection"}...`}
                rows="3"
              />
            </FormGroup>
            <small className="text-muted">
              {confirmModal.action === "approve" 
                ? "Approving will mark the student as excused for this date."
                : "Rejecting will mark the student as absent for this date."
              }
            </small>
          </ModalBody>
          <ModalFooter>
            <Button color={confirmModal.action === "approve" ? "success" : "danger"} onClick={confirmReview}>
              Yes, {confirmModal.action === "approve" ? "Approve" : "Reject"}
            </Button>
            <Button color="secondary" onClick={() => setConfirmModal({ open: false, excuse: null, action: null })}>Cancel</Button>
          </ModalFooter>
        </Modal>
      </div>
    </>
  );
};

export default ExcuseManagement; 