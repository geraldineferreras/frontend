import React, { useState, useEffect } from "react";
import {
  Card,
  CardHeader,
  CardBody,
  Container,
  Row,
  Col,
  FormGroup,
  Input,
  Label,
  Button,
  Table,
  Badge,
  Alert,
  Spinner,
  Modal,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Form,
  FormText,
} from "reactstrap";
import Dropdown from 'react-bootstrap/Dropdown';
import { FaPlus, FaTrash, FaEye, FaFileUpload, FaCalendarAlt } from "react-icons/fa";
import apiService from "../../services/api";

const StudentExcuseLetter = () => {
  // State for excuse letters data
  const [excuseLetters, setExcuseLetters] = useState([]);
  const [summary, setSummary] = useState({ pending: 0, approved: 0, rejected: 0, total: 0 });
  const [availableClasses, setAvailableClasses] = useState([]);
  const [loading, setLoading] = useState(false);
  const [loadingClasses, setLoadingClasses] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  // State for submit form
  const [submitForm, setSubmitForm] = useState({
    class_id: "",
    date_absent: "",
    reason: "",
    attachment: null
  });
  const [submitLoading, setSubmitLoading] = useState(false);

  // State for delete confirmation
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [letterToDelete, setLetterToDelete] = useState(null);

  // Clear messages
  const clearMessages = () => {
    setError(null);
    setSuccess(null);
  };

  // Load excuse letters data on component mount
  useEffect(() => {
    loadExcuseLetters();
    loadStudentClasses();
  }, []);

  const loadStudentClasses = async () => {
    try {
      setLoadingClasses(true);
      const response = await apiService.getStudentClasses();
      if (response.status && response.data) {
        console.log('Student classes fetched:', response.data);
        // Transform API data to match our expected format
        const transformedClasses = response.data.map((cls, index) => ({
          class_id: cls.class_id || cls.id,
          subject_name: cls.subject_name,
          subject_code: cls.subject_code,
          section_name: cls.section_name,
          teacher_name: cls.teacher_name,
          class_code: cls.class_code
        }));
        setAvailableClasses(transformedClasses);
      } else {
        console.log('No classes data received from server');
        setAvailableClasses([]);
      }
    } catch (error) {
      console.error("Error loading student classes:", error);
      setAvailableClasses([]);
    } finally {
      setLoadingClasses(false);
    }
  };

  const loadExcuseLetters = async () => {
    try {
      setLoading(true);
      clearMessages();

      const response = await apiService.getStudentExcuseLetters({});

      if (response.status && response.data) {
        setExcuseLetters(response.data.excuse_letters || []);
        setSummary(response.data.summary || { pending: 0, approved: 0, rejected: 0, total: 0 });
      } else {
        setError("Failed to load excuse letters");
      }
    } catch (error) {
      console.error("Error loading excuse letters:", error);
      setError(error.message || "Failed to load excuse letters");
    } finally {
      setLoading(false);
    }
  };

  // Function to get status badge
  const getStatusBadge = (status) => {
    const statusColors = {
      'pending': 'warning',
      'approved': 'success',
      'rejected': 'danger'
    };
    
    const statusText = {
      'pending': 'Pending',
      'approved': 'Approved',
      'rejected': 'Rejected'
    };
    
    return (
      <Badge color={statusColors[status] || 'secondary'} className="font-weight-bold">
        {statusText[status] || status}
      </Badge>
    );
  };

  // Handle file input change
  const handleFileChange = (e) => {
    const file = e.target.files[0];
    setSubmitForm({ ...submitForm, attachment: file });
  };

  // Handle form input changes
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setSubmitForm({ ...submitForm, [name]: value });
  };

  // Submit excuse letter
  const handleSubmitExcuseLetter = async (e) => {
    e.preventDefault();
    try {
      setSubmitLoading(true);
      clearMessages();

      if (!submitForm.class_id || !submitForm.date_absent || !submitForm.reason) {
        setError("Please fill in all required fields");
        return;
      }

      let response;
      if (submitForm.attachment) {
        // Submit with attachment using FormData
        const formData = new FormData();
        formData.append('class_id', submitForm.class_id);
        formData.append('date_absent', submitForm.date_absent);
        formData.append('reason', submitForm.reason);
        formData.append('attachment', submitForm.attachment);

        response = await apiService.submitExcuseLetterWithAttachment(formData);
      } else {
        // Submit without attachment using JSON
        response = await apiService.submitExcuseLetter({
          class_id: submitForm.class_id,
          date_absent: submitForm.date_absent,
          reason: submitForm.reason
        });
      }

      if (response.status) {
        setSuccess("Excuse letter submitted successfully!");
        setSubmitForm({
          class_id: "",
          date_absent: "",
          reason: "",
          attachment: null
        });
        loadExcuseLetters(); // Reload the list
      } else {
        setError(response.message || "Failed to submit excuse letter");
      }
    } catch (error) {
      console.error("Error submitting excuse letter:", error);
      setError(error.message || "Failed to submit excuse letter");
    } finally {
      setSubmitLoading(false);
    }
  };

  // Delete excuse letter
  const handleDeleteExcuseLetter = async () => {
    try {
      setLoading(true);
      clearMessages();

      const response = await apiService.deleteExcuseLetter(letterToDelete.letter_id);

      if (response.status) {
        setSuccess("Excuse letter deleted successfully!");
        setDeleteModalOpen(false);
        setLetterToDelete(null);
        loadExcuseLetters(); // Reload the list
      } else {
        setError(response.message || "Failed to delete excuse letter");
      }
    } catch (error) {
      console.error("Error deleting excuse letter:", error);
      setError(error.message || "Failed to delete excuse letter");
    } finally {
      setLoading(false);
    }
  };

  // Open delete confirmation modal
  const openDeleteModal = (letter) => {
    setLetterToDelete(letter);
    setDeleteModalOpen(true);
  };

  return (
    <div style={{ maxWidth: 1200, margin: '0 auto', padding: 24 }}>
      {/* Header */}
      <div style={{ marginBottom: 18 }}>
        <div style={{ fontWeight: 700, fontSize: 22, display: 'flex', alignItems: 'center', gap: 8 }}>
          <span role="img" aria-label="note">📝</span> Submit Excuse Letter
        </div>
        <div style={{ color: '#666', fontSize: 14, marginTop: 2 }}>
          If you were absent, you may upload a valid excuse here for teacher review.
        </div>
      </div>

      {/* Error Alert */}
      {error && (
        <Alert color="danger" className="mb-4">
          <i className="fas fa-exclamation-triangle mr-2" />
          {error}
        </Alert>
      )}

      {/* Success Alert */}
      {success && (
        <Alert color="success" className="mb-4">
          <i className="fas fa-check-circle mr-2" />
          {success}
        </Alert>
      )}

      {/* Summary Cards */}
      <div style={{ display: 'flex', gap: 16, marginBottom: 24, flexWrap: 'wrap' }}>
        <div style={{ 
          background: '#fff', 
          borderRadius: 8, 
          padding: '16px 20px', 
          boxShadow: '0 2px 4px rgba(0,0,0,0.1)', 
          flex: 1, 
          minWidth: 120,
          textAlign: 'center'
        }}>
          <div style={{ fontSize: 24, fontWeight: 700, color: '#007bff', marginBottom: 4 }}>
            {summary.total}
          </div>
          <div style={{ fontSize: 12, color: '#666' }}>Total Letters</div>
        </div>
        
        <div style={{ 
          background: '#fff', 
          borderRadius: 8, 
          padding: '16px 20px', 
          boxShadow: '0 2px 4px rgba(0,0,0,0.1)', 
          flex: 1, 
          minWidth: 120,
          textAlign: 'center'
        }}>
          <div style={{ fontSize: 24, fontWeight: 700, color: '#ff9800', marginBottom: 4 }}>
            {summary.pending}
          </div>
          <div style={{ fontSize: 12, color: '#666' }}>Pending</div>
        </div>
        
        <div style={{ 
          background: '#fff', 
          borderRadius: 8, 
          padding: '16px 20px', 
          boxShadow: '0 2px 4px rgba(0,0,0,0.1)', 
          flex: 1, 
          minWidth: 120,
          textAlign: 'center'
        }}>
          <div style={{ fontSize: 24, fontWeight: 700, color: '#4caf50', marginBottom: 4 }}>
            {summary.approved}
          </div>
          <div style={{ fontSize: 12, color: '#666' }}>Approved</div>
        </div>
        
        <div style={{ 
          background: '#fff', 
          borderRadius: 8, 
          padding: '16px 20px', 
          boxShadow: '0 2px 4px rgba(0,0,0,0.1)', 
          flex: 1, 
          minWidth: 120,
          textAlign: 'center'
        }}>
          <div style={{ fontSize: 24, fontWeight: 700, color: '#f44336', marginBottom: 4 }}>
            {summary.rejected}
          </div>
          <div style={{ fontSize: 12, color: '#666' }}>Rejected</div>
        </div>
      </div>

      {/* Loading Spinner */}
      {loading && (
        <div className="text-center mb-4">
          <Spinner color="primary" />
          <span className="ml-2">Loading excuse letters...</span>
        </div>
      )}

      {/* Landscape Flex Layout */}
      <div style={{ display: 'flex', gap: 32, alignItems: 'flex-start', flexWrap: 'wrap' }} className="excuse-landscape-flex">
        {/* Excuse Letter Form */}
                 <form onSubmit={handleSubmitExcuseLetter} style={{ background: '#fff', borderRadius: 12, boxShadow: '0 2px 8px #0001', padding: 20, marginBottom: 32, flex: 1, minWidth: 320, maxWidth: 480 }}>
           <div style={{ marginBottom: 14 }}>
             <label style={{ fontWeight: 600, fontSize: 14, marginBottom: 8, display: 'block' }}>Class</label>
                           <Dropdown>
                <Dropdown.Toggle 
                  variant="secondary" 
                  id="dropdown-basic"
                  disabled={loadingClasses}
                  style={{ 
                    width: "215%", 
                    maxWidth: "300%",
                    textAlign: "left",
                    padding: '8px 12px',
                    borderRadius: 8,
                    border: '1px solid #bbb',
                    fontSize: 14,
                    background: '#fff',
                    color: '#333'
                  }}
                >
                 {submitForm.class_id ? 
                   availableClasses.find(cls => cls.class_id === submitForm.class_id)?.subject_name + 
                   ' (' + availableClasses.find(cls => cls.class_id === submitForm.class_id)?.subject_code + ') - ' +
                   availableClasses.find(cls => cls.class_id === submitForm.class_id)?.section_name
                   : loadingClasses ? 'Loading classes...' : 'Select class'}
               </Dropdown.Toggle>

                               <Dropdown.Menu style={{ width: '190%', maxWidth: '222%', maxHeight: '200px', overflowY: 'auto' }}>
                 {availableClasses.map((cls) => (
                   <Dropdown.Item 
                     key={cls.class_id}
                     href="#" 
                     onClick={(e) => { 
                       e.preventDefault(); 
                       setSubmitForm({ ...submitForm, class_id: cls.class_id }); 
                     }}
                   >
                     {cls.subject_name} ({cls.subject_code}) - {cls.section_name}
                   </Dropdown.Item>
                 ))}
               </Dropdown.Menu>
             </Dropdown>
           </div>
          <div style={{ marginBottom: 14 }}>
            <label style={{ fontWeight: 600, fontSize: 14 }}>Absent Date</label><br />
            <input 
              type="date" 
              value={submitForm.date_absent} 
              onChange={handleInputChange}
              name="date_absent"
              required 
              style={{ width: '100%', padding: '8px 12px', borderRadius: 8, border: '1px solid #bbb', fontSize: 14 }} 
            />
          </div>
          <div style={{ marginBottom: 14 }}>
            <label style={{ fontWeight: 600, fontSize: 14 }}>Reason</label><br />
            <textarea 
              value={submitForm.reason} 
              onChange={handleInputChange}
              name="reason"
              required 
              maxLength={300} 
              rows={3} 
              style={{ width: '100%', padding: '8px 12px', borderRadius: 8, border: '1px solid #bbb', fontSize: 14, resize: 'vertical' }} 
              placeholder="State your reason (max 300 characters)" 
            />
            <div style={{ textAlign: 'right', fontSize: 12, color: '#888' }}>{submitForm.reason.length}/300</div>
          </div>
          <div style={{ marginBottom: 14 }}>
            <label style={{ fontWeight: 600, fontSize: 14 }}>Supporting Photo</label><br />
            <input 
              type="file" 
              accept="image/jpeg,image/png,application/pdf" 
              onChange={handleFileChange} 
              style={{ fontSize: 14 }} 
            />
          </div>
          <button 
            type="submit" 
            disabled={submitLoading} 
            style={{ 
              width: '100%', 
              background: submitLoading ? '#bbb' : '#1976d2', 
              color: '#fff', 
              fontWeight: 700, 
              fontSize: 15, 
              border: 'none', 
              borderRadius: 8, 
              padding: '10px 0', 
              cursor: submitLoading ? 'not-allowed' : 'pointer', 
              marginTop: 8 
            }}
          >
            {submitLoading ? 'Submitting...' : 'Submit Excuse Letter'}
          </button>
        </form>

        {/* Submitted Excuses */}
                 <div style={{ background: '#fff', borderRadius: 12, boxShadow: '0 2px 8px #0001', padding: 18, flex: 1, minWidth: 320, maxWidth: 700 }}>
          <div style={{ fontWeight: 700, fontSize: 16, marginBottom: 12 }}>Submitted Excuses</div>
          
          {loading && (
            <div style={{ textAlign: 'center', padding: '20px' }}>
              <Spinner color="primary" />
              <span style={{ marginLeft: 8 }}>Loading excuse letters...</span>
            </div>
          )}

          {!loading && excuseLetters.length === 0 && (
            <div style={{ textAlign: 'center', padding: '20px', color: '#666' }}>
              No excuse letters found.
            </div>
          )}

          {!loading && excuseLetters.length > 0 && (
                         <div style={{ width: '100%' }}>
               <table style={{ width: '100%', borderCollapse: 'collapse', tableLayout: 'fixed' }}>
                <thead>
                  <tr style={{ background: '#f7fafd' }}>
                                         <th style={{ textAlign: 'left', padding: '10px 8px', fontSize: 13, color: '#888', fontWeight: 700, width: '12%' }}>Date</th>
                     <th style={{ textAlign: 'left', padding: '10px 8px', fontSize: 13, color: '#888', fontWeight: 700, width: '20%' }}>Class</th>
                     <th style={{ textAlign: 'left', padding: '10px 8px', fontSize: 13, color: '#888', fontWeight: 700, width: '43%' }}>Reason</th>
                     <th style={{ textAlign: 'left', padding: '10px 8px', fontSize: 13, color: '#888', fontWeight: 700, width: '15%' }}>Status</th>
                     <th style={{ textAlign: 'left', padding: '10px 8px', fontSize: 13, color: '#888', fontWeight: 700, width: '10%' }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {excuseLetters.map((letter) => (
                    <tr key={letter.letter_id} style={{ borderBottom: '1px solid #f0f0f0' }}>
                      <td style={{ padding: '8px 8px', fontSize: 14 }}>
                        {new Date(letter.date_absent).toLocaleDateString()}
                      </td>
                      <td style={{ padding: '8px 8px', fontSize: 14 }}>
                        {letter.subject_name}
                      </td>
                                             <td style={{ padding: '8px 8px', fontSize: 14, wordWrap: 'break-word', wordBreak: 'break-word' }}>
                         {letter.reason}
                       </td>
                      <td style={{ padding: '8px 8px', fontSize: 14 }}>
                        {getStatusBadge(letter.status)}
                      </td>
                      <td style={{ padding: '8px 8px', fontSize: 14 }}>
                        <div style={{ display: 'flex', gap: 8 }}>
                          {letter.image_path && (
                            <button
                              onClick={() => window.open(letter.image_path, '_blank')}
                              style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#007bff' }}
                              title="View attachment"
                            >
                              👁️
                            </button>
                          )}
                          {letter.status === 'pending' && (
                            <button
                              onClick={() => openDeleteModal(letter)}
                              style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#dc3545' }}
                              title="Delete"
                            >
                              🗑️
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      <Modal isOpen={deleteModalOpen} toggle={() => setDeleteModalOpen(!deleteModalOpen)}>
        <ModalHeader toggle={() => setDeleteModalOpen(!deleteModalOpen)}>
          Confirm Delete
        </ModalHeader>
        <ModalBody>
          Are you sure you want to delete this excuse letter? This action cannot be undone.
          <br />
          <strong>Date Absent:</strong> {letterToDelete && new Date(letterToDelete.date_absent).toLocaleDateString()}
          <br />
          <strong>Subject:</strong> {letterToDelete && letterToDelete.subject_name}
        </ModalBody>
        <ModalFooter>
          <Button color="secondary" onClick={() => setDeleteModalOpen(false)}>
            Cancel
          </Button>
          <Button 
            color="danger" 
            onClick={handleDeleteExcuseLetter}
            disabled={loading}
          >
            {loading ? (
              <>
                <Spinner size="sm" className="mr-2" />
                Deleting...
              </>
            ) : (
              <>
                <FaTrash className="mr-2" />
                Delete
              </>
            )}
          </Button>
        </ModalFooter>
      </Modal>

      <style>{`
        @media (max-width: 900px) {
          .excuse-landscape-flex { flex-direction: column !important; gap: 18px !important; }
          form, .excuse-mobile-list, .excuse-landscape-flex > div { max-width: 100% !important; }
        }
                 @media (max-width: 600px) {
           table { font-size: 11px; }
           form, .excuse-mobile-list { padding: 8px !important; }
           
           /* Center the form exactly in mobile */
           .excuse-landscape-flex {
             justify-content: center !important;
             align-items: center !important;
           }
           
           .excuse-landscape-flex form {
             margin: 0 auto !important;
             max-width: 98% !important;
             min-width: auto !important;
           }
           
           .excuse-landscape-flex > div:last-child {
             margin: 0 auto !important;
             max-width: 98% !important;
             min-width: auto !important;
           }
           
           /* Mobile table adjustments */
           table th, table td {
             padding: 6px 4px !important;
             font-size: 11px !important;
           }
           
           /* Adjust column widths for mobile */
           table th:nth-child(1) { width: 15% !important; } /* Date */
           table th:nth-child(2) { width: 18% !important; } /* Class */
           table th:nth-child(3) { width: 42% !important; } /* Reason */
           table th:nth-child(4) { width: 15% !important; } /* Status */
           table th:nth-child(5) { width: 10% !important; } /* Actions */
           
           /* Ensure text wrapping in mobile */
           table td {
             word-wrap: break-word !important;
             word-break: break-word !important;
             white-space: normal !important;
           }
         }
         
         @media (max-width: 480px) {
           table { font-size: 10px; }
           
           table th, table td {
             padding: 4px 2px !important;
             font-size: 10px !important;
           }
           
           /* Even smaller column widths for very small screens */
           table th:nth-child(1) { width: 18% !important; } /* Date */
           table th:nth-child(2) { width: 20% !important; } /* Class */
           table th:nth-child(3) { width: 37% !important; } /* Reason */
           table th:nth-child(4) { width: 15% !important; } /* Status */
           table th:nth-child(5) { width: 10% !important; } /* Actions */
         }
      `}</style>
    </div>
  );
};

export default StudentExcuseLetter; 