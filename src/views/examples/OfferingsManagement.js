import React, { useState, useEffect } from "react";
import {
  Card, CardBody, CardHeader, Table, Input, Row, Col, Button, Badge, Modal, ModalHeader, ModalBody, ModalFooter, FormGroup, Label, InputGroup, InputGroupAddon, InputGroupText, Alert, Pagination, PaginationItem, PaginationLink, Spinner
} from "reactstrap";
import { FaEdit, FaTrash, FaSearch } from "react-icons/fa";
import Header from "components/Headers/Header.js";
import apiService from "../../services/api.js";

// Floating effect for content over header
const offeringsManagementStyles = `
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

const getToday = () => new Date().toISOString().slice(0, 10);

export default function OfferingsManagement() {
  const [offerings, setOfferings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Dropdown data states
  const [subjects, setSubjects] = useState([]);
  const [teachers, setTeachers] = useState([]);
  const [sections, setSections] = useState([]);
  const [loadingDropdowns, setLoadingDropdowns] = useState({
    subjects: false,
    teachers: false,
    sections: false
  });
  
  const [subject, setSubject] = useState("");
  const [teacher, setTeacher] = useState("");
  const [section, setSection] = useState("");
  const [semester, setSemester] = useState("");
  const [schoolYear, setSchoolYear] = useState("2024-2025");
  const [formError, setFormError] = useState("");
  const [showToast, setShowToast] = useState("");
  const [search, setSearch] = useState("");
  const [editModal, setEditModal] = useState(false);
  const [editOffering, setEditOffering] = useState(null);
  const [editFields, setEditFields] = useState({ subject: "", teacher: "", section: "", semester: "", schoolYear: "" });
  const [editError, setEditError] = useState("");
  const [deleteModal, setDeleteModal] = useState(false);
  const [deleteOffering, setDeleteOffering] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [addingOffering, setAddingOffering] = useState(false);
  const [updatingOffering, setUpdatingOffering] = useState(false);
  const [deletingOffering, setDeletingOffering] = useState(false);
  const itemsPerPage = 10;

  // Load classes and dropdown data on component mount
  useEffect(() => {
    loadClasses();
    loadDropdownData();
  }, []);

  const loadClasses = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await apiService.getClasses();
      console.log('Classes response:', response);
      
      // Handle different response formats
      const classesData = response.data || response || [];
      setOfferings(classesData);
    } catch (error) {
      console.error('Error loading classes:', error);
      setError('Failed to load classes. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const loadDropdownData = async () => {
    // Load subjects
    try {
      setLoadingDropdowns(prev => ({ ...prev, subjects: true }));
      const subjectsResponse = await apiService.getSubjects();
      console.log('Subjects response:', subjectsResponse);
      const subjectsData = subjectsResponse.data || subjectsResponse || [];
      setSubjects(subjectsData);
    } catch (error) {
      console.error('Error loading subjects:', error);
    } finally {
      setLoadingDropdowns(prev => ({ ...prev, subjects: false }));
    }

    // Load teachers
    try {
      setLoadingDropdowns(prev => ({ ...prev, teachers: true }));
      const teachersResponse = await apiService.getUsersByRole('teacher');
      console.log('Teachers response:', teachersResponse);
      const teachersData = teachersResponse.data || teachersResponse || [];
      setTeachers(teachersData);
    } catch (error) {
      console.error('Error loading teachers:', error);
    } finally {
      setLoadingDropdowns(prev => ({ ...prev, teachers: false }));
    }

    // Load sections
    try {
      setLoadingDropdowns(prev => ({ ...prev, sections: true }));
      const sectionsResponse = await apiService.makeRequest('/admin/sections', {
        method: 'GET',
        requireAuth: true,
      });
      console.log('Sections response:', sectionsResponse);
      const sectionsData = sectionsResponse.data || sectionsResponse || [];
      setSections(sectionsData);
    } catch (error) {
      console.error('Error loading sections:', error);
    } finally {
      setLoadingDropdowns(prev => ({ ...prev, sections: false }));
    }
  };

  // Filtered and paginated offerings
  const filteredOfferings = offerings.filter(o => {
    const subjectName = o.subject_name || '';
    const teacherName = o.teacher_name || '';
    const sectionName = o.section_name || '';
    const searchTerm = search.toLowerCase();
    
    return subjectName.toLowerCase().includes(searchTerm) ||
           teacherName.toLowerCase().includes(searchTerm) ||
           sectionName.toLowerCase().includes(searchTerm);
  });

  // Group offerings by subject, teacher, semester, and school year
  const groupedOfferings = filteredOfferings.reduce((groups, offering) => {
    const key = `${offering.subject_id}_${offering.teacher_id}_${offering.semester}_${offering.school_year}`;
    
    if (!groups[key]) {
      groups[key] = {
        subject_id: offering.subject_id,
        subject_name: offering.subject_name,
        teacher_id: offering.teacher_id,
        teacher_name: offering.teacher_name,
        semester: offering.semester,
        school_year: offering.school_year,
        date_created: offering.date_created,
        sections: []
      };
    }
    
    // Add section to the group
    groups[key].sections.push({
      section_id: offering.section_id,
      section_name: offering.section_name,
      class_id: offering.class_id
    });
    
    return groups;
  }, {});

  // Convert grouped offerings back to array and sort by date created
  const groupedOfferingsArray = Object.values(groupedOfferings).sort((a, b) => {
    return new Date(b.date_created) - new Date(a.date_created);
  });

  const totalPages = Math.ceil(groupedOfferingsArray.length / itemsPerPage);
  const paginatedOfferings = groupedOfferingsArray.slice((currentPage-1)*itemsPerPage, currentPage*itemsPerPage);

  // Add offering
  const handleAdd = async () => {
    setFormError("");
    if (!subject || !teacher || !section || !semester || !schoolYear) {
      setFormError("All fields are required.");
      return;
    }
    
    // Prevent duplicate assignment
    if (offerings.some(o => o.subject_id === Number(subject) && o.section_id === Number(section) && o.semester === semester && o.school_year === schoolYear)) {
      setFormError("This subject is already assigned to this section for the selected term.");
      return;
    }

    try {
      setAddingOffering(true);
      setFormError("");

      const classData = {
        subject_id: Number(subject),
        teacher_id: teacher,
        section_id: Number(section),
        semester: semester.toUpperCase(),
        school_year: schoolYear
      };

      console.log('Creating class with data:', classData);
      
      const response = await apiService.createClass(classData);
      console.log('Create class response:', response);

      // Reload the classes to get the updated list
      await loadClasses();

      // Reset form
      setSubject(""); 
      setTeacher(""); 
      setSection(""); 
      setSemester(""); 
      setSchoolYear("2024-2025");
      
      setShowToast("Subject offering successfully created.");
      setTimeout(() => setShowToast(""), 2000);
    } catch (error) {
      console.error('Error creating class:', error);
      setFormError(error.message || "Failed to create offering. Please try again.");
    } finally {
      setAddingOffering(false);
    }
  };

  // Helper function to normalize semester value for dropdown
  const normalizeSemesterForDropdown = (semesterValue) => {
    if (!semesterValue) return "";
    
    const normalized = semesterValue.toLowerCase();
    if (normalized.includes('1st') || normalized.includes('first')) {
      return "1st";
    } else if (normalized.includes('2nd') || normalized.includes('second')) {
      return "2nd";
    }
    
    // If it's already in the correct format, return as is
    return semesterValue;
  };

  // Edit offering
  const openEdit = (group) => {
    console.log('Opening edit for group:', group); // Debug log to see actual data
    setEditOffering(group);
    setEditFields({
      subject: group.subject_id?.toString() || "",
      teacher: group.teacher_id || "",
      section: "", // We'll handle sections differently for grouped data
      semester: normalizeSemesterForDropdown(group.semester) || "",
      schoolYear: group.school_year || ""
    });
    setEditError("");
    setEditModal(true);
  };

  const handleEditSave = async () => {
    if (!editFields.subject || !editFields.teacher || !editFields.semester || !editFields.schoolYear) {
      setEditError("All fields are required.");
      return;
    }

    try {
      setUpdatingOffering(true);
      setEditError("");

      // For grouped offerings, we need to update all sections in the group
      const updatePromises = editOffering.sections.map(section => {
        // Check for potential duplicates for each section (excluding the current offering)
        const isDuplicate = offerings.some(o => 
          o.class_id !== section.class_id && 
          o.subject_id === Number(editFields.subject) && 
          o.section_id === section.section_id && 
          o.semester === editFields.semester.toUpperCase() && 
          o.school_year === editFields.schoolYear
        );

        if (isDuplicate) {
          throw new Error(`Subject is already assigned to section ${section.section_name} for the selected term.`);
        }

        const classData = {
          subject_id: Number(editFields.subject),
          teacher_id: editFields.teacher,
          section_id: section.section_id,
          semester: editFields.semester.toUpperCase(),
          school_year: editFields.schoolYear
        };

        console.log(`Updating class ${section.class_id} with data:`, classData);
        return apiService.updateClass(section.class_id, classData);
      });

      // Wait for all updates to complete
      const responses = await Promise.all(updatePromises);
      console.log('Update responses:', responses);

      // Reload the classes to get the updated list
      await loadClasses();

      setEditModal(false);
      setShowToast("Subject offering successfully updated for all sections.");
      setTimeout(() => setShowToast(""), 3000);
    } catch (error) {
      console.error('Error updating grouped offering:', error);
      setEditError(error.message || "Failed to update offering. Please try again.");
    } finally {
      setUpdatingOffering(false);
    }
  };

  // Delete offering
  const openDelete = (group) => {
    setDeleteOffering(group);
    setDeleteModal(true);
  };

  const handleDelete = async () => {
    if (!deleteOffering) return;

    try {
      setDeletingOffering(true);

      // Delete all sections in the group
      for (const section of deleteOffering.sections) {
        await apiService.deleteClass(section.class_id);
      }

      // Reload the classes to get the updated list
      await loadClasses();

      setDeleteModal(false);
      setShowToast("Subject offering successfully deleted.");
      setTimeout(() => setShowToast(""), 2000);
    } catch (error) {
      console.error('Error deleting class:', error);
      setShowToast("Failed to delete offering. Please try again.");
      setTimeout(() => setShowToast(""), 2000);
    } finally {
      setDeletingOffering(false);
    }
  };

  // Pagination
  const handlePageChange = (page) => setCurrentPage(page);

  return (
    <>
      <style>{offeringsManagementStyles}</style>
      <Header showStats={false} />
      {/* Header Background */}
      <div className="header pb-6 pt-4 pt-md-7"></div>
      <div className="section-content-container">
        <Card className="shadow-sm rounded mb-4 section-content-card">
          <CardBody>
            {/* Assignment Form */}
            <Row className="align-items-end mb-4">
              <Col md={3} xs={12} className="mb-2 mb-md-0">
                <Label>Subject</Label>
                <Input type="select" value={subject} onChange={e => setSubject(e.target.value)} disabled={loadingDropdowns.subjects}>
                  <option value="">{loadingDropdowns.subjects ? "Loading..." : "Select Subject"}</option>
                  {subjects.map(s => (
                    <option key={s.id} value={s.id}>{s.subject_code || s.code} – {s.subject_name || s.name}</option>
                  ))}
                </Input>
              </Col>
              <Col md={3} xs={12} className="mb-2 mb-md-0">
                <Label>Teacher</Label>
                <Input type="select" value={teacher} onChange={e => setTeacher(e.target.value)} disabled={loadingDropdowns.teachers}>
                  <option value="">{loadingDropdowns.teachers ? "Loading..." : "Select Teacher"}</option>
                  {teachers.map(t => (
                    <option key={t.user_id} value={t.user_id}>{t.full_name}</option>
                  ))}
                </Input>
              </Col>
              <Col md={2} xs={12} className="mb-2 mb-md-0">
                <Label>Section</Label>
                <Input type="select" value={section} onChange={e => setSection(e.target.value)} disabled={loadingDropdowns.sections}>
                  <option value="">{loadingDropdowns.sections ? "Loading..." : "Select Section"}</option>
                  {sections.map(s => (
                    <option key={s.id} value={s.id}>{s.name}</option>
                  ))}
                </Input>
              </Col>
              <Col md={2} xs={6} className="mb-2 mb-md-0">
                <Label>Semester</Label>
                <Input type="select" value={semester} onChange={e => setSemester(e.target.value)}>
                  <option value="">Select Semester</option>
                  <option value="1st">1st</option>
                  <option value="2nd">2nd</option>
                </Input>
              </Col>
              <Col md={2} xs={6} className="mb-2 mb-md-0">
                <Label>School Year</Label>
                <Input
                  placeholder="2024-2025"
                  value={schoolYear}
                  onChange={e => setSchoolYear(e.target.value)}
                  maxLength={9}
                />
              </Col>
              <Col md={12} className="text-md-right mt-3 mt-md-0">
                <Button color="primary" onClick={handleAdd} style={{ borderRadius: 8, fontWeight: 600, minWidth: 180 }} disabled={addingOffering}>
                  {addingOffering ? <Spinner size="sm" /> : "Assign Offering"}
                </Button>
              </Col>
            </Row>
            {formError && <Alert color="danger" className="py-2 mb-3">{formError}</Alert>}
            {showToast && <Alert color="success" className="py-2 mb-3">{showToast}</Alert>}
            {error && <Alert color="danger" className="py-2 mb-3">{error}</Alert>}
            {/* Search Bar */}
            <Row className="mb-3 align-items-center">
              <Col md={6} xs={12} className="mb-2 mb-md-0">
                <InputGroup>
                  <InputGroupAddon addonType="prepend">
                    <InputGroupText><FaSearch /></InputGroupText>
                  </InputGroupAddon>
                  <Input
                    placeholder="Search by subject, teacher, or section"
                    value={search}
                    onChange={e => setSearch(e.target.value)}
                  />
                </InputGroup>
              </Col>
              <Col md={6} xs={12} className="text-md-right mt-2 mt-md-0">
                <span className="text-muted" style={{ fontSize: 15 }}>
                  Total Offerings: <b>{groupedOfferingsArray.length}</b>
                </span>
              </Col>
            </Row>
            {/* Offerings Table */}
            <div className="table-responsive">
              {loading ? (
                <div className="text-center py-5">
                  <Spinner color="primary" />
                  <p className="mt-3 text-muted">Loading offerings...</p>
                </div>
              ) : (
                <Table className="align-items-center table-striped table-hover" bordered style={{ color: '#525F7F' }}>
                  <thead className="thead-light">
                    <tr>
                      <th style={{ color: '#525F7F', fontWeight: '600' }}>#</th>
                      <th style={{ color: '#525F7F', fontWeight: '600' }}>Subject</th>
                      <th style={{ color: '#525F7F', fontWeight: '600' }}>Teacher</th>
                      <th style={{ color: '#525F7F', fontWeight: '600' }}>Semester</th>
                      <th style={{ color: '#525F7F', fontWeight: '600' }}>School Year</th>
                      <th style={{ color: '#525F7F', fontWeight: '600' }}>Sections</th>
                      <th style={{ color: '#525F7F', fontWeight: '600' }}>Date Created</th>
                      <th style={{ color: '#525F7F', fontWeight: '600' }}>Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {paginatedOfferings.length === 0 ? (
                      <tr><td colSpan={8} className="text-center text-muted">
                        {search ? 'No offerings found matching your search.' : 'No offerings added yet.'}
                      </td></tr>
                    ) : paginatedOfferings.map((group, idx) => (
                      <tr key={group.subject_id + group.teacher_id + group.semester + group.school_year}>
                        <td style={{ color: '#525F7F', fontWeight: '500' }}>{(currentPage-1)*itemsPerPage + idx + 1}</td>
                        <td style={{ color: '#525F7F', fontWeight: '500' }}>{group.subject_name || ""}</td>
                        <td style={{ color: '#525F7F', fontWeight: '500' }}>{group.teacher_name || ""}</td>
                        <td><Badge color="primary" pill>{group.semester || ""}</Badge></td>
                        <td><Badge color="info" pill>{group.school_year || ""}</Badge></td>
                        <td>
                          {group.sections.map(s => (
                            <Badge key={s.section_id} color="secondary" className="mr-1" style={{ color: '#000000', fontWeight: '500' }}>{s.section_name}</Badge>
                          ))}
                        </td>
                        <td style={{ color: '#525F7F', fontWeight: '500' }}>{group.date_created ? new Date(group.date_created).toLocaleDateString() : 'N/A'}</td>
                        <td>
                          <Button 
                            size="sm" 
                            color="outline-primary" 
                            className="mr-2" 
                            onClick={() => openEdit(group)}
                            disabled={updatingOffering}
                          >
                            <FaEdit />
                          </Button>
                          <Button 
                            size="sm" 
                            color="outline-danger" 
                            onClick={() => openDelete(group)}
                            disabled={deletingOffering}
                          >
                            <FaTrash />
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </Table>
              )}
            </div>
            {/* Pagination */}
            {totalPages > 1 && (
              <Pagination className="justify-content-center mt-3">
                {[...Array(totalPages)].map((_, i) => (
                  <PaginationItem key={i} active={i+1 === currentPage}>
                    <PaginationLink onClick={() => handlePageChange(i+1)}>{i+1}</PaginationLink>
                  </PaginationItem>
                ))}
              </Pagination>
            )}
          </CardBody>
        </Card>
        {/* Edit Modal */}
        <Modal isOpen={editModal} toggle={() => setEditModal(false)} centered>
          <ModalHeader toggle={() => setEditModal(false)} style={{ fontWeight: 700, fontSize: 20 }}>Edit Offering</ModalHeader>
          <ModalBody>
            <FormGroup>
              <Label>Subject</Label>
              <Input type="select" value={editFields.subject} onChange={e => setEditFields(f => ({ ...f, subject: e.target.value }))} disabled={loadingDropdowns.subjects}>
                <option value="">{loadingDropdowns.subjects ? "Loading..." : "Select Subject"}</option>
                {subjects.map(s => (
                  <option key={s.id} value={s.id}>{s.subject_code || s.code} – {s.subject_name || s.name}</option>
                ))}
              </Input>
            </FormGroup>
            <FormGroup>
              <Label>Teacher</Label>
              <Input type="select" value={editFields.teacher} onChange={e => setEditFields(f => ({ ...f, teacher: e.target.value }))} disabled={loadingDropdowns.teachers}>
                <option value="">{loadingDropdowns.teachers ? "Loading..." : "Select Teacher"}</option>
                {teachers.map(t => (
                  <option key={t.user_id} value={t.user_id}>{t.full_name}</option>
                ))}
              </Input>
            </FormGroup>
            <FormGroup>
              <Label>Sections</Label>
              <div className="p-2 border rounded bg-light">
                {editOffering?.sections?.map(section => (
                  <Badge key={section.section_id} color="secondary" className="mr-1 mb-1">{section.section_name}</Badge>
                ))}
              </div>
              <small className="text-info">
                <i className="fa fa-info-circle mr-1"></i>
                Changes will be applied to all sections listed above.
              </small>
            </FormGroup>
            <FormGroup>
              <Label>Semester</Label>
              <Input type="select" value={editFields.semester} onChange={e => setEditFields(f => ({ ...f, semester: e.target.value }))}>
                <option value="">Select Semester</option>
                <option value="1st">1st</option>
                <option value="2nd">2nd</option>
              </Input>
            </FormGroup>
            <FormGroup>
              <Label>School Year</Label>
              <Input value={editFields.schoolYear} onChange={e => setEditFields(f => ({ ...f, schoolYear: e.target.value }))} placeholder="2024-2025" maxLength={9} />
            </FormGroup>
            {editError && <Alert color="danger" className="py-2">{editError}</Alert>}
          </ModalBody>
          <ModalFooter>
            <Button color="primary" onClick={handleEditSave} disabled={updatingOffering}>
              {updatingOffering ? <Spinner size="sm" /> : "Save Changes"}
            </Button>
            <Button color="secondary" onClick={() => setEditModal(false)} disabled={updatingOffering}>Cancel</Button>
          </ModalFooter>
        </Modal>
        {/* Delete Modal */}
        <Modal isOpen={deleteModal} toggle={() => setDeleteModal(false)} centered>
          <ModalHeader toggle={() => setDeleteModal(false)} style={{ fontWeight: 700, fontSize: 20 }}>Delete Offering</ModalHeader>
          <ModalBody>
            <p>Are you sure you want to delete this subject offering?</p>
            <p><strong>Subject:</strong> {deleteOffering?.subject_name}</p>
            <p><strong>Teacher:</strong> {deleteOffering?.teacher_name}</p>
            <p><strong>Sections:</strong></p>
            <div className="mb-2">
              {deleteOffering?.sections?.map(section => (
                <Badge key={section.section_id} color="secondary" className="mr-1">{section.section_name}</Badge>
              ))}
            </div>
            <p className="text-danger"><small>This will delete ALL sections for this subject offering.</small></p>
          </ModalBody>
          <ModalFooter>
            <Button color="danger" onClick={handleDelete} disabled={deletingOffering}>
              {deletingOffering ? <Spinner size="sm" /> : "Delete"}
            </Button>
            <Button color="secondary" onClick={() => setDeleteModal(false)} disabled={deletingOffering}>Cancel</Button>
          </ModalFooter>
        </Modal>
      </div>
    </>
  );
} 