import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Row, Col, Button, Input, Badge, Card, CardBody, Progress, Spinner, Alert, Modal, ModalBody } from "reactstrap";
import { Document, Page, pdfjs } from 'react-pdf';
import apiService from "../../services/api";

// Mock data removed - now using real API data

const AssignmentDetailStudent = () => {
  const { assignmentId, classCode } = useParams();
  const navigate = useNavigate();
  const [assignment, setAssignment] = useState(null);
  const [submission, setSubmission] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [privateComment, setPrivateComment] = useState("");
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState(null);
  const [submissionMethod, setSubmissionMethod] = useState('files'); // 'files', 'links', 'mixed'
  const [externalLinks, setExternalLinks] = useState([]);
  const [showLinkInput, setShowLinkInput] = useState(false);
  const [newLink, setNewLink] = useState({ name: '', url: '', type: 'link' });

  // In-page file preview state
  const [viewerOpen, setViewerOpen] = useState(false);
  const [viewerFile, setViewerFile] = useState(null); // { name, url, mime }
  const [pdfZoom, setPdfZoom] = useState(1);
  const [currentPage, setCurrentPage] = useState(1);
  const [numPages, setNumPages] = useState(null);
  const [resolvedAssignmentFileName, setResolvedAssignmentFileName] = useState(null);

  // Fetch assignment details and submission data
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError(null);
      try {
        console.log('Fetching assignment details for ID:', assignmentId);
        const response = await apiService.getStudentTaskDetails(assignmentId);
        console.log('Raw API response:', response);
        
        if (response.status && response.data) {
          // Enrich assignment with original file names using file-info endpoint
          const enrichWithOriginalNames = async (data) => {
            const cloned = { ...data };
            const tasksToRun = [];

            const isExternal = (p) => typeof p === 'string' && (p.startsWith('http://') || p.startsWith('https://'));
            const extractFilename = (p) => {
              if (!p) return '';
              if (p.startsWith('uploads/')) return p.split('/').pop();
              return p.split('/').pop();
            };

            // Single attachment on task
            if (cloned.attachment_url && !cloned.original_name && !isExternal(cloned.attachment_url)) {
              const filename = extractFilename(cloned.attachment_url);
              if (filename) {
                tasksToRun.push(
                  apiService.getTaskFileInfo(filename).then((info) => {
                    if (info && info.status && info.data) {
                      cloned.original_name = info.data.original_name || info.data.filename || cloned.original_name;
                    }
                  }).catch(() => {})
                );
              }
            }

            // Multiple attachments array
            if (Array.isArray(cloned.attachments) && cloned.attachments.length > 0) {
              cloned.attachments = cloned.attachments.map((att) => ({ ...att }));
              cloned.attachments.forEach((att) => {
                if (!att.original_name && att.attachment_url && !isExternal(att.attachment_url)) {
                  const filename = extractFilename(att.attachment_url);
                  if (filename) {
                    tasksToRun.push(
                      apiService.getTaskFileInfo(filename).then((info) => {
                        if (info && info.status && info.data) {
                          att.original_name = info.data.original_name || info.data.filename || att.original_name;
                          att.mime_type = att.mime_type || info.data.mime_type;
                        }
                      }).catch(() => {})
                    );
                  }
                }
              });
            }

            if (tasksToRun.length > 0) {
              await Promise.all(tasksToRun);
            }
            return cloned;
          };

          const enriched = await enrichWithOriginalNames(response.data);
          setAssignment(enriched);
          console.log('Assignment details loaded:', response.data);
          
          // Fetch submission data using the correct endpoint
          const finalClassCode = classCode || response.data.class_code;
          if (finalClassCode) {
            try {
              const submissionResponse = await apiService.getTaskSubmission(assignmentId, finalClassCode);
              console.log('Submission response:', submissionResponse);
              
              if (submissionResponse.status && submissionResponse.data) {
                // Enrich submission attachments with original names
                const enrichSubmission = async (sub) => {
                  const cloned = { ...sub };
                  const isExternal = (p) => typeof p === 'string' && (p.startsWith('http://') || p.startsWith('https://'));
                  const extractFilename = (p) => {
                    if (!p) return '';
                    if (p.startsWith('uploads/')) return p.split('/').pop();
                    return p.split('/').pop();
                  };
                  if (Array.isArray(cloned.attachments) && cloned.attachments.length > 0) {
                    cloned.attachments = cloned.attachments.map((a) => ({ ...a }));
                    const jobs = [];
                    cloned.attachments.forEach((a) => {
                      if (!a.original_name && a.attachment_url && !isExternal(a.attachment_url)) {
                        const filename = extractFilename(a.attachment_url);
                        if (filename) {
                          jobs.push(
                            apiService.getTaskFileInfo(filename).then((info) => {
                              if (info && info.status && info.data) {
                                a.original_name = info.data.original_name || info.data.filename || a.original_name;
                                a.mime_type = a.mime_type || info.data.mime_type;
                                a.file_size = a.file_size || info.data.file_size;
                              }
                            }).catch(() => {})
                          );
                        }
                      }
                    });
                    if (jobs.length > 0) await Promise.all(jobs);
                  }
                  return cloned;
                };

                const enrichedSubmission = await enrichSubmission(submissionResponse.data);
                setSubmission(enrichedSubmission);
                console.log('Submission data loaded:', submissionResponse.data);
              }
            } catch (submissionError) {
              console.log('No submission found or error fetching submission:', submissionError);
              // This is normal if no submission exists yet
            }
          }
        } else {
          console.error('Invalid response format:', response);
          setError('No assignment data received');
        }
      } catch (error) {
        console.error('Error fetching assignment details:', error);
        setError(error.message || 'Failed to fetch assignment details');
      } finally {
        setLoading(false);
      }
    };

    if (assignmentId) {
      fetchData();
    }
  }, [assignmentId, classCode]);

  // Resolve original_name for single assignment attachment quickly for UI
  useEffect(() => {
    if (!assignment) return;
    setResolvedAssignmentFileName(null);
    const path = assignment.attachment_url || '';
    const isExternal = (p) => typeof p === 'string' && (p.startsWith('http://') || p.startsWith('https://'));
    const extractFilename = (p) => {
      if (!p) return '';
      if (p.startsWith('uploads/')) return p.split('/').pop();
      return p.split('/').pop();
    };
    if (path && !assignment.original_name && !isExternal(path)) {
      const fname = extractFilename(path);
      if (fname) {
        apiService.getTaskFileInfo(fname).then((info) => {
          if (info && info.status && info.data) {
            setResolvedAssignmentFileName(info.data.original_name || info.data.filename || null);
          }
        }).catch(() => {});
      }
    }
  }, [assignment]);

  // Configure pdf.js worker for PDF previews
  try {
    // eslint-disable-next-line no-unsafe-optional-chaining
    if (pdfjs?.GlobalWorkerOptions) {
      // Use the worker copied to public/ by postinstall
      pdfjs.GlobalWorkerOptions.workerSrc = `${process.env.PUBLIC_URL}/pdf.worker.js`;
    }
  } catch (_) {
    // ignore if pdfjs not available
  }

  const getStatusColor = (status) => {
    switch (status.toLowerCase()) {
      case 'graded': return '#28a745';
      case 'submitted': return '#ffc107';
      case 'draft': return '#6c757d';
      default: return '#007bff';
    }
  };

  // File handling functions
  const handleFileSelect = (e) => {
    const files = Array.from(e.target.files);
    setSelectedFiles(prev => [...prev, ...files]);
    setUploadError(null);
  };

  const handleRemoveFile = (index) => {
    setSelectedFiles(prev => prev.filter((_, i) => i !== index));
  };

  const handleAddExternalLink = () => {
    if (newLink.name.trim() && newLink.url.trim()) {
      setExternalLinks(prev => [...prev, { ...newLink, id: Date.now() }]);
      setNewLink({ name: '', url: '', type: 'link' });
      setShowLinkInput(false);
    }
  };

  const handleRemoveExternalLink = (index) => {
    setExternalLinks(prev => prev.filter((_, i) => i !== index));
  };

  const handleLinkTypeChange = (type) => {
    setNewLink(prev => ({ ...prev, type }));
  };

  // Helper: get file URL for attachments
  const getFileUrl = (filePath) => {
    if (!filePath) return null;
    
    if (filePath.startsWith('http://') || filePath.startsWith('https://')) {
      return filePath;
    } else if (filePath.startsWith('uploads/')) {
      return `${process.env.REACT_APP_API_BASE_URL || 'http://localhost/scms_new_backup'}/${filePath}`;
    } else {
      // Bare filenames are considered assignment (task) attachments by default
      return `${process.env.REACT_APP_API_BASE_URL || 'http://localhost/scms_new_backup'}/uploads/tasks/${filePath}`;
    }
  };

  // Determine simple mime from name when backend mime is absent
  const inferMimeFromName = (nameOrPath = '') => {
    const lower = nameOrPath.toLowerCase();
    if (lower.endsWith('.pdf')) return 'application/pdf';
    if (lower.endsWith('.png')) return 'image/png';
    if (lower.endsWith('.jpg') || lower.endsWith('.jpeg')) return 'image/jpeg';
    if (lower.endsWith('.gif')) return 'image/gif';
    if (lower.endsWith('.txt')) return 'text/plain';
    if (lower.endsWith('.mp4')) return 'video/mp4';
    return 'application/octet-stream';
  };

  const openPreview = (fileLike) => {
    if (!fileLike) return;
    const url = getFileUrl(fileLike.attachment_url || fileLike.file_path || fileLike.url);
    if (!url) return;
    const name = fileLike.original_name || fileLike.file_name || fileLike.name || 'File';
    const mime = fileLike.mime_type || inferMimeFromName(fileLike.original_name || fileLike.file_name || fileLike.file_path || fileLike.url);
    setViewerFile({ name, url, mime });
    setPdfZoom(1);
    setCurrentPage(1);
    setNumPages(null);
    setViewerOpen(true);
  };

  const handleSubmitFiles = async () => {
    if (selectedFiles.length === 0 && externalLinks.length === 0) {
      setUploadError('Please select at least one file or add an external link to submit');
      return;
    }

    setUploading(true);
    setUploadError(null);

    try {
      // Use the assignment's actual ID if available, otherwise use URL parameter
      const taskId = assignment.id || assignment.task_id || assignmentId;
      
      // Add class code from URL parameter or assignment data
      const finalClassCode = classCode || assignment.class_code;
      
      // Debug: Log the values we're using for class code
      console.log('=== Class Code Debug ===');
      console.log('URL classCode parameter:', classCode);
      console.log('assignment.class_code:', assignment.class_code);
      console.log('Final classCode value:', finalClassCode);
      console.log('=== End Class Code Debug ===');
      
      if (!finalClassCode) {
        console.error('❌ No class code available!');
        console.error('classCode parameter:', classCode);
        console.error('assignment.class_code:', assignment.class_code);
        console.error('assignment object:', assignment);
        throw new Error('Class code is required for submission');
      }

      // Prepare submission data
      const submissionData = {
        class_code: finalClassCode,
        submission_content: privateComment.trim() || undefined
      };

      let response;

      if (selectedFiles.length > 0 && externalLinks.length > 0) {
        // Mixed submission: files + external links
        console.log('Submitting mixed content (files + external links)');
        
        // Use Method 2 for files (different field names: attachment1, attachment2, etc.)
        response = await apiService.submitTaskWithDifferentFieldNames(taskId, selectedFiles, {
          class_code: finalClassCode,
          submission_content: privateComment.trim() || undefined,
          external_links: externalLinks
        });
        
      } else if (selectedFiles.length > 0) {
        // Files only submission
        console.log('Submitting files only');
        
        // Use Method 2 for files (different field names: attachment1, attachment2, etc.)
        response = await apiService.submitTaskWithDifferentFieldNames(taskId, selectedFiles, {
          class_code: finalClassCode,
          submission_content: privateComment.trim() || undefined
        });
        
      } else if (externalLinks.length > 0) {
        // External links only submission
        console.log('Submitting external links only');
        
        response = await apiService.submitTaskWithExternalLinks(taskId, externalLinks, submissionData);
      }

      // Debug: Log what we're sending
      console.log('Submitting content:', {
        taskId: taskId,
        assignmentId: assignment.id,
        task_id: assignment.task_id,
        fileCount: selectedFiles.length,
        files: selectedFiles.map(f => ({ name: f.name, size: f.size, type: f.type })),
        externalLinks: externalLinks.length,
        hasSubmissionContent: !!privateComment.trim(),
        classCode: finalClassCode,
        submissionMethod: selectedFiles.length > 0 && externalLinks.length > 0 ? 'mixed' : 
                         selectedFiles.length > 0 ? 'files' : 'links'
      });

      if (response.status) {
        console.log('✅ Submission successful! Refreshing assignment data...');
        
        // Wait a moment for backend to process the submission
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        // Refresh assignment data to show updated submission status
        const updatedResponse = await apiService.getStudentTaskDetails(taskId);
        if (updatedResponse.status && updatedResponse.data) {
          console.log('✅ Updated assignment data:', updatedResponse.data);
          
          // Update the assignment state with new data
          setAssignment(updatedResponse.data);
          
          // Clear selected files, external links, and private comment
          setSelectedFiles([]);
          setPrivateComment('');
          setExternalLinks([]);
          
          // Show success message with status details
          const newStatus = updatedResponse.data.submission_status || updatedResponse.data.status;
          const statusMessage = newStatus === 'submitted' 
            ? '✅ Files submitted successfully! Status changed to SUBMITTED.' 
            : newStatus === 'graded'
            ? `✅ Files submitted successfully! Status: ${newStatus.toUpperCase()}`
            : '✅ Files submitted successfully!';
          
          alert(statusMessage);
          
          // Force a re-render to show updated status and files
          setTimeout(() => {
            window.location.reload();
          }, 1500);
          
        } else {
          console.error('❌ Failed to refresh assignment data after submission');
          setUploadError('Files submitted but failed to refresh status. Please refresh the page manually.');
        }
      } else {
        console.error('❌ Submission failed:', response);
        setUploadError('Failed to submit files. Please try again.');
      }
    } catch (error) {
      console.error('Error submitting files:', error);
      setUploadError(error.message || 'Failed to submit files');
    } finally {
      setUploading(false);
    }
  };

  // Show loading state
  if (loading) {
    return (
      <div style={{ 
        background: "#f8f9fa", 
        minHeight: "100vh", 
        padding: "20px 0"
      }}>
        <div style={{ maxWidth: 1600, margin: '0 auto', padding: '0 20px' }}>
          <div style={{ textAlign: 'center', padding: '40px' }}>
            <Spinner color="primary" size="lg" />
            <h4 className="mt-3 text-muted">Loading assignment details...</h4>
          </div>
        </div>
      </div>
    );
  }

  // Show error state
  if (error || !assignment) {
    return (
      <div style={{ 
        background: "#f8f9fa", 
        minHeight: "100vh", 
        padding: "20px 0"
      }}>
        <div style={{ maxWidth: 1600, margin: '0 auto', padding: '0 20px' }}>
          <Alert color="danger">
            <h4>Error loading assignment</h4>
            <p>{error || 'Assignment not found'}</p>
            <Button color="primary" onClick={() => navigate(-1)}>
              Go Back
            </Button>
          </Alert>
        </div>
      </div>
    );
  }

  // Debug: Log the assignment data structure
  console.log('Assignment data structure:', {
    id: assignment.id,
    title: assignment.title,
    task_title: assignment.task_title,
    description: assignment.description,
    instructions: assignment.instructions,
    due_date: assignment.due_date,
    created_at: assignment.created_at,
    teacher_name: assignment.teacher_name,
    created_by: assignment.created_by,
    score: assignment.score,
    points: assignment.points,
    max_points: assignment.max_points,
    total_points: assignment.total_points,
    submission_status: assignment.submission_status,
    status: assignment.status,
    submitted_files: assignment.submitted_files,
    submission: assignment.submission,
    submissions: assignment.submissions,
    attachment_url: assignment.attachment_url,
    attachment_type: assignment.attachment_type,
    attachments: assignment.attachments
  });
  
  // Debug: Log submission details
  if (submission) {
    console.log('Submission found:', submission);
    console.log('Submission details:', {
      submission_id: submission.submission_id,
      status: submission.status,
      grade: submission.grade,
      submitted_at: submission.submitted_at,
      attachment_url: submission.attachment_url,
      submission_content: submission.submission_content,
      attachments: submission.attachments
    });
  } else {
    console.log('No submission found in assignment data');
  }
  
  // Debug: Log submitted files details
  if (submission && submission.attachments && submission.attachments.length > 0) {
    console.log('Submitted files found:', submission.attachments);
    submission.attachments.forEach((file, idx) => {
      console.log(`File ${idx + 1}:`, {
        attachment_id: file.attachment_id,
        file_name: file.file_name,
        original_name: file.original_name,
        file_path: file.file_path,
        file_size: file.file_size,
        mime_type: file.mime_type,
        attachment_type: file.attachment_type,
        attachment_url: file.attachment_url,
        created_at: file.created_at
      });
    });
  } else {
    console.log('No submitted files found in submission data');
  }

  return (
    <div style={{ 
      background: "#f8f9fa", 
      minHeight: "100vh", 
      padding: "20px 0"
    }}>
      <div style={{ maxWidth: 1600, margin: '0 auto', padding: '0 20px' }}>
        
                {/* Top Score Banner - Always show */}
        <div style={{
          background: '#ffffff',
          borderRadius: '16px',
          padding: '20px',
          marginBottom: '24px',
          boxShadow: '0 2px 12px rgba(0,0,0,0.08)',
          textAlign: 'center',
          border: '1px solid #e9ecef'
        }}>
          <div style={{ fontSize: '14px', marginBottom: '6px', color: '#6c757d' }}>Your Score</div>
                     <div style={{ fontSize: '36px', fontWeight: 700, marginBottom: '12px', color: '#212529' }}>
            {(() => {
              // Check for grade in submission first
              let score = 0;
              let maxPoints = assignment.points || assignment.max_points || assignment.total_points || 50;
              
              if (submission) {
                if (submission.grade !== null && submission.grade !== undefined) {
                  score = submission.grade;
                }
              } else if (assignment.score) {
                score = assignment.score;
              }
              
              return `${score}/${maxPoints}`;
            })()}
          </div>
                    <div style={{
            width: '150px',
            height: '6px',
            background: '#e9ecef',
            borderRadius: '3px',
            margin: '0 auto',
            overflow: 'hidden'
          }}>
                         <div style={{
               width: `${(() => {
                 // Calculate percentage based on submission
                 let score = 0;
                 let maxPoints = assignment.points || assignment.max_points || assignment.total_points || 50;
                 
                 if (submission) {
                   if (submission.grade !== null && submission.grade !== undefined) {
                     score = submission.grade;
                   }
                 } else if (assignment.score) {
                   score = assignment.score;
                 }
                 
                 return maxPoints > 0 ? Math.round((score / maxPoints) * 100) : 0;
               })()}%`,
               height: '100%',
               background: '#28a745',
               borderRadius: '3px',
               transition: 'width 1s ease'
             }}></div>
          </div>
       </div>

       {/* Main Content Area - Horizontal Layout */}
       <Row>
         {/* Left Column - Assignment Info */}
         <Col lg={4} md={12} style={{ marginBottom: '24px' }}>
           {/* Assignment Header Card */}
           <Card style={{
             borderRadius: '16px',
             border: '1px solid #e9ecef',
             boxShadow: '0 2px 12px rgba(0,0,0,0.08)',
             marginBottom: '24px',
             background: '#ffffff'
           }}>
             <CardBody style={{ padding: '32px', textAlign: 'center' }}>
               <div style={{
                 width: '80px',
                 height: '80px',
                 borderRadius: '16px',
                 background: '#f8f9fa',
                 display: 'flex',
                 alignItems: 'center',
                 justifyContent: 'center',
                 margin: '0 auto 20px',
                 border: '2px solid #e9ecef'
               }}>
                 <i className="ni ni-single-copy-04" style={{ fontSize: '36px', color: '#6c757d' }} />
               </div>
               <h1 style={{
                 fontWeight: 700,
                 fontSize: '32px',
                 margin: '0 0 8px 0',
                 color: '#212529'
               }}>
                 {assignment.title || assignment.task_title || 'Assignment'}
               </h1>
               <p style={{
                 margin: '0 0 16px 0',
                 fontSize: '16px',
                 color: '#6c757d'
               }}>
                 by {assignment.teacher_name || assignment.created_by || 'Teacher'}
               </p>
               <div style={{
                 background: '#f8f9fa',
                 borderRadius: '12px',
                 padding: '12px',
                 fontSize: '14px',
                 color: '#495057',
                 border: '1px solid #e9ecef'
               }}>
                 Posted {assignment.created_at ? new Date(assignment.created_at).toLocaleDateString() : 'Recently'}
               </div>
             </CardBody>
           </Card>

           {/* Due Date Card */}
           <Card style={{
             borderRadius: '16px',
             border: '1px solid #e9ecef',
             boxShadow: '0 2px 12px rgba(0,0,0,0.08)',
             background: '#ffffff'
           }}>
             <CardBody style={{ padding: '24px', textAlign: 'center' }}>
               <i className="ni ni-time-alarm" style={{ fontSize: '32px', marginBottom: '12px', color: '#6c757d' }} />
               <h4 style={{ margin: '0 0 8px 0', fontWeight: 600, color: '#212529' }}>Due Date</h4>
               <div style={{ fontSize: '18px', marginBottom: '12px', color: '#495057' }}>
                 {assignment.due_date ? new Date(assignment.due_date).toLocaleString() : 'No due date set'}
               </div>
               <Badge style={{
                 background: '#fff3cd',
                 color: '#856404',
                 borderRadius: '20px',
                 padding: '8px 16px',
                 fontSize: '14px',
                 fontWeight: 600,
                 border: '1px solid #ffeaa7'
               }}>
                 ⚡ Due Soon
               </Badge>
             </CardBody>
           </Card>
         </Col>

         {/* Center Column - Assignment Details */}
         <Col lg={5} md={12} style={{ marginBottom: '24px' }}>
           <Card style={{
             borderRadius: '16px',
             border: '1px solid #e9ecef',
             boxShadow: '0 2px 12px rgba(0,0,0,0.08)',
             height: '100%',
             background: '#ffffff'
           }}>
             <CardBody style={{ padding: '32px' }}>
               <h3 style={{
                 fontWeight: 600,
                 fontSize: '24px',
                 marginBottom: '20px',
                 color: '#212529',
                 display: 'flex',
                 alignItems: 'center'
               }}>
                 <span style={{
                   width: '40px',
                   height: '40px',
                   borderRadius: '10px',
                   background: '#f8f9fa',
                   display: 'flex',
                   alignItems: 'center',
                   justifyContent: 'center',
                   marginRight: '16px',
                   border: '2px solid #e9ecef'
                 }}>
                   <i className="ni ni-single-copy-04" style={{ fontSize: '20px', color: '#6c757d' }} />
                 </span>
                 Assignment Details
               </h3>
               <div style={{
                 fontSize: '16px',
                 lineHeight: 1.7,
                 color: '#495057',
                 padding: '24px',
                 background: '#f8f9fa',
                 borderRadius: '12px',
                 border: '1px solid #e9ecef',
                 marginBottom: '20px'
               }}>
                 {assignment.description || assignment.instructions || 'No description available'}
               </div>

               {/* Assignment Attachments */}
               {(assignment.attachment_url || (assignment.attachments && assignment.attachments.length > 0)) && (
                 <div style={{ marginTop: '20px' }}>
                   <h4 style={{
                     fontWeight: 600,
                     fontSize: '18px',
                     marginBottom: '16px',
                     color: '#212529',
                     display: 'flex',
                     alignItems: 'center'
                   }}>
                     <i className="ni ni-single-copy-04" style={{ marginRight: '8px', color: '#6c757d' }} />
                     Assignment Files
                   </h4>
                   
                    {assignment.attachments && assignment.attachments.length > 0 ? (
                     // Multiple attachments
                     assignment.attachments.map((attachment, index) => (
                       <div key={index} style={{
                         display: 'flex',
                         alignItems: 'center',
                         background: '#ffffff',
                         borderRadius: '12px',
                         padding: '16px',
                         marginBottom: '12px',
                         border: '2px solid #e2e8f0',
                          cursor: 'pointer',
                         transition: 'all 0.3s ease',
                         boxShadow: '0 2px 8px rgba(0,0,0,0.05)'
                        }} onClick={() => openPreview(attachment)}>
                         <div style={{
                           width: '50px',
                           height: '60px',
                           background: 'linear-gradient(135deg, #e53e3e 0%, #c53030 100%)',
                           borderRadius: '8px',
                           display: 'flex',
                           alignItems: 'center',
                           justifyContent: 'center',
                           color: '#fff',
                           fontWeight: 'bold',
                           fontSize: '12px',
                           marginRight: '16px',
                           boxShadow: '0 4px 12px rgba(229, 62, 62, 0.3)'
                         }}>
                            PDF
                         </div>
                         <div style={{ flex: 1 }}>
                           <div style={{
                             fontWeight: 600,
                             fontSize: '16px',
                             color: '#2d3748',
                             marginBottom: '4px'
                           }}>
                             {attachment.original_name || attachment.file_name || 'Assignment File'}
                           </div>
                           <div style={{
                             color: '#718096',
                             fontSize: '14px'
                           }}>
                              PDF Document • Click to preview
                           </div>
                         </div>
                         <div style={{
                           width: '40px',
                           height: '40px',
                           background: '#f7fafc',
                           borderRadius: '50%',
                           display: 'flex',
                           alignItems: 'center',
                           justifyContent: 'center',
                           color: '#4a5568'
                         }}>
                           <i className="ni ni-bold-right" style={{ fontSize: '16px' }} />
                         </div>
                       </div>
                     ))
                     ) : assignment.attachment_url ? (
                     // Single attachment
                     <div style={{
                       display: 'flex',
                       alignItems: 'center',
                       background: '#ffffff',
                       borderRadius: '12px',
                       padding: '16px',
                       border: '2px solid #e2e8f0',
                       cursor: 'pointer',
                       transition: 'all 0.3s ease',
                       boxShadow: '0 2px 8px rgba(0,0,0,0.05)'
                       }} onClick={() => openPreview({ attachment_url: assignment.attachment_url, original_name: (assignment.original_name || resolvedAssignmentFileName || (assignment.attachment_url.startsWith('http') ? 'External Link' : assignment.attachment_url.split('/').pop())), mime_type: inferMimeFromName(assignment.attachment_url) })}>
                       <div style={{
                         width: '50px',
                         height: '60px',
                         background: 'linear-gradient(135deg, #e53e3e 0%, #c53030 100%)',
                         borderRadius: '8px',
                         display: 'flex',
                         alignItems: 'center',
                         justifyContent: 'center',
                         color: '#fff',
                         fontWeight: 'bold',
                         fontSize: '12px',
                         marginRight: '16px',
                         boxShadow: '0 4px 12px rgba(229, 62, 62, 0.3)'
                       }}>
                         {assignment.attachment_url.startsWith('http') ? 'LINK' : 'PDF'}
                       </div>
                       <div style={{ flex: 1 }}>
                          <div style={{
                           fontWeight: 600,
                           fontSize: '16px',
                           color: '#2d3748',
                           marginBottom: '4px'
                         }}>
                            {assignment.original_name || resolvedAssignmentFileName || (assignment.attachment_url.startsWith('http') 
                              ? 'External Link' 
                              : assignment.attachment_url.split('/').pop())
                            }
                         </div>
                         <div style={{
                           color: '#718096',
                           fontSize: '14px'
                         }}>
                          {assignment.attachment_url.startsWith('http') ? 'External Link' : 'PDF Document'} • Click to preview
                         </div>
                       </div>
                       <div style={{
                         width: '40px',
                         height: '40px',
                         background: '#f7fafc',
                         borderRadius: '50%',
                         display: 'flex',
                         alignItems: 'center',
                         justifyContent: 'center',
                         color: '#4a5568'
                       }}>
                         <i className="ni ni-bold-right" style={{ fontSize: '16px' }} />
                       </div>
                     </div>
                   ) : null}
                 </div>
               )}
             </CardBody>
           </Card>
         </Col>

         {/* Right Column - Work Section */}
         <Col lg={3} md={12}>
           <Card style={{
             borderRadius: '16px',
             border: '1px solid #e9ecef',
             boxShadow: '0 2px 12px rgba(0,0,0,0.08)',
             marginBottom: '24px',
             background: '#ffffff'
           }}>
             <CardBody style={{ padding: '24px' }}>
               <div style={{
                 display: 'flex',
                 alignItems: 'center',
                 justifyContent: 'space-between',
                 marginBottom: '20px'
               }}>
                 <h4 style={{
                   fontWeight: 600,
                   fontSize: '18px',
                   margin: 0,
                   color: '#212529'
                 }}>
                   📁 Your Work
                 </h4>
                 <Badge 
                   color={getStatusColor(submission ? submission.status : assignment.submission_status || assignment.status)}
                   style={{
                     borderRadius: '20px',
                     padding: '6px 16px',
                     fontSize: '12px',
                     fontWeight: 600
                   }}
                 >
                                    {(() => {
                       // Check if there is a submission first
                       let status = 'PENDING';
                       
                       if (submission) {
                         // Get the submission status
                         status = submission.status || 'submitted';
                         console.log('Submission status:', status);
                       } else if (assignment.submission_status) {
                         status = assignment.submission_status;
                         console.log('Assignment submission status:', status);
                       } else if (assignment.status) {
                         status = assignment.status;
                         console.log('Assignment status:', status);
                       }
                       
                       console.log('Final status determined:', status);
                       
                       // Handle various status formats
                       const normalizedStatus = status ? status.toLowerCase().trim() : 'pending';
                       
                       switch(normalizedStatus) {
                         case 'submitted':
                         case 'submit':
                           return 'SUBMITTED';
                         case 'graded':
                         case 'grade':
                           return 'GRADED';
                         case 'pending':
                         case 'pending':
                           return 'PENDING';
                         case 'draft':
                           return 'DRAFT';
                         default:
                           return status ? status.toUpperCase() : 'PENDING';
                       }
                     })()}
                 </Badge>
               </div>

                                {/* Submitted Files */}
                <div style={{ marginBottom: '20px' }}>
                  {(submission && submission.attachments && submission.attachments.length > 0) ? (
                   <>
                     {/* Show submitted files from submission.attachments array */}
                      {submission.attachments.map((file, idx) => (
                        <div key={`file-${idx}`} style={{
                         display: 'flex',
                         alignItems: 'center',
                         background: '#f8f9fa',
                         borderRadius: '12px',
                         padding: '12px',
                         marginBottom: '8px',
                          border: '1px solid #e9ecef',
                          cursor: 'pointer'
                        }} onClick={() => openPreview(file)}>
                         <div style={{
                           width: '40px',
                           height: '40px',
                           borderRadius: '8px',
                           background: '#ffffff',
                           display: 'flex',
                           alignItems: 'center',
                           justifyContent: 'center',
                           marginRight: '12px',
                           border: '1px solid #e9ecef'
                         }}>
                           <i className="ni ni-single-copy-04" style={{ fontSize: '18px', color: '#6c757d' }} />
                         </div>
                         <div style={{ flex: 1 }}>
                           <div style={{
                             fontWeight: 600,
                             fontSize: '14px',
                             color: '#212529',
                             marginBottom: '2px'
                           }}>
                             {file.original_name || file.file_name || `File ${idx + 1}`}
                           </div>
                           <div style={{
                             color: '#6c757d',
                             fontSize: '12px'
                           }}>
                             {file.mime_type || 'File'} • {(file.file_size / 1024).toFixed(2)} KB
                           </div>
                         </div>
                          <Button
                           color="link"
                           style={{
                             padding: 0,
                             color: '#dc3545',
                             fontSize: '16px'
                            }}
                           title="Remove file"
                         >
                           <i className="ni ni-fat-remove" />
                         </Button>
                       </div>
                     ))}
                   </>
                 ) : (
                   <div style={{
                     textAlign: 'center',
                     padding: '20px',
                     color: '#6c757d',
                     fontSize: '14px',
                     background: '#f8f9fa',
                     borderRadius: '8px',
                     border: '1px solid #e9ecef'
                   }}>
                     No files submitted yet
                   </div>
                 )}
                </div>

               {/* External Links Section */}
               <div style={{ marginBottom: '12px' }}>
                 <Button
                   color="info"
                   onClick={() => setShowLinkInput(!showLinkInput)}
                   style={{
                     borderRadius: '12px',
                     fontWeight: 600,
                     fontSize: '14px',
                     width: '100%',
                     padding: '12px',
                     cursor: 'pointer'
                   }}
                   disabled={uploading}
                 >
                   <i className="ni ni-world" style={{ marginRight: '8px' }} />
                   🔗 Add External Links
                 </Button>
               </div>

               {/* External Link Input */}
               {showLinkInput && (
                 <div style={{
                   background: '#f8f9fa',
                   borderRadius: '12px',
                   padding: '16px',
                   marginBottom: '16px',
                   border: '1px solid #e9ecef'
                 }}>
                   <h6 style={{ fontSize: '14px', marginBottom: '12px', color: '#495057' }}>Add External Link:</h6>
                   
                   <div style={{ marginBottom: '12px' }}>
                     <Input
                       type="text"
                       placeholder="Link name (e.g., Research Paper)"
                       value={newLink.name}
                       onChange={(e) => setNewLink(prev => ({ ...prev, name: e.target.value }))}
                       style={{ marginBottom: '8px' }}
                     />
                     <Input
                       type="url"
                       placeholder="URL (Google Drive, YouTube, etc.)"
                       value={newLink.url}
                       onChange={(e) => setNewLink(prev => ({ ...prev, url: e.target.value }))}
                       style={{ marginBottom: '8px' }}
                     />
                     
                     {/* Link Type Selection */}
                     <div style={{ marginBottom: '12px' }}>
                       <label style={{ fontSize: '12px', color: '#6c757d', marginBottom: '4px', display: 'block' }}>Link Type:</label>
                       <div style={{ display: 'flex', gap: '8px' }}>
                         {['link', 'google_drive', 'youtube'].map(type => (
                           <Button
                             key={type}
                             color={newLink.type === type ? 'primary' : 'outline-primary'}
                             size="sm"
                             onClick={() => handleLinkTypeChange(type)}
                             style={{ fontSize: '11px', padding: '4px 8px' }}
                           >
                             {type === 'link' ? '🔗 Link' : type === 'google_drive' ? '📁 Drive' : '📺 YouTube'}
                           </Button>
                         ))}
                       </div>
                     </div>
                     
                     <Button
                       color="success"
                       size="sm"
                       onClick={handleAddExternalLink}
                       disabled={!newLink.name.trim() || !newLink.url.trim()}
                       style={{ marginRight: '8px' }}
                     >
                       Add Link
                     </Button>
                     <Button
                       color="secondary"
                       size="sm"
                       onClick={() => {
                         setShowLinkInput(false);
                         setNewLink({ name: '', url: '', type: 'link' });
                       }}
                     >
                       Cancel
                     </Button>
                   </div>
                 </div>
               )}

               {/* External Links Display */}
               {externalLinks.length > 0 && (
                 <div style={{ marginBottom: '20px' }}>
                   <h6 style={{ fontSize: '14px', marginBottom: '12px', color: '#495057' }}>External Links:</h6>
                   {externalLinks.map((link, idx) => (
                     <div key={link.id} style={{
                       display: 'flex',
                       alignItems: 'center',
                       background: '#fff3cd',
                       borderRadius: '12px',
                       padding: '12px',
                       marginBottom: '8px',
                       border: '1px solid #ffeaa7'
                     }}>
                       <div style={{
                         width: '40px',
                         height: '40px',
                         borderRadius: '8px',
                         background: '#ffffff',
                         display: 'flex',
                         alignItems: 'center',
                         justifyContent: 'center',
                         marginRight: '12px',
                         border: '1px solid #ffeaa7'
                       }}>
                         <i className={`ni ${link.type === 'youtube' ? 'ni-video-camera-2' : link.type === 'google_drive' ? 'ni-folder-17' : 'ni-world'}`} style={{ fontSize: '18px', color: '#856404' }} />
                       </div>
                       <div style={{ flex: 1 }}>
                         <div style={{
                           fontWeight: 600,
                           fontSize: '14px',
                           color: '#856404',
                           marginBottom: '2px'
                         }}>
                           {link.name}
                         </div>
                         <div style={{
                           color: '#856404',
                           fontSize: '12px',
                           wordBreak: 'break-all'
                         }}>
                           {link.url}
                         </div>
                       </div>
                       <Button
                         color="link"
                         onClick={() => handleRemoveExternalLink(idx)}
                         style={{
                           padding: 0,
                           color: '#f44336',
                           fontSize: '16px'
                         }}
                         title="Remove link"
                       >
                         <i className="ni ni-fat-remove" />
                       </Button>
                     </div>
                   ))}
                 </div>
               )}

               {/* Selected Files for Upload */}
               {selectedFiles.length > 0 && (
                 <div style={{ marginBottom: '20px' }}>
                   <h6 style={{ fontSize: '14px', marginBottom: '12px', color: '#495057' }}>Files to Submit:</h6>
                   {selectedFiles.map((file, idx) => (
                     <div key={idx} style={{
                       display: 'flex',
                       alignItems: 'center',
                       background: '#e3f2fd',
                       borderRadius: '12px',
                       padding: '12px',
                       marginBottom: '8px',
                       border: '1px solid #bbdefb'
                     }}>
                       <div style={{
                         width: '40px',
                         height: '40px',
                         borderRadius: '8px',
                         background: '#ffffff',
                         display: 'flex',
                         alignItems: 'center',
                         justifyContent: 'center',
                         marginRight: '12px',
                         border: '1px solid #bbdefb'
                       }}>
                         <i className="ni ni-single-copy-04" style={{ fontSize: '18px', color: '#1976d2' }} />
                       </div>
                       <div style={{ flex: 1 }}>
                         <div style={{
                           fontWeight: 600,
                           fontSize: '14px',
                           color: '#1976d2',
                           marginBottom: '2px'
                         }}>
                           {file.name}
                         </div>
                         <div style={{
                           color: '#1976d2',
                           fontSize: '12px'
                         }}>
                           {(file.size / 1024 / 1024).toFixed(2)} MB
                         </div>
                       </div>
                       <Button
                         color="link"
                         onClick={() => handleRemoveFile(idx)}
                         style={{
                           padding: 0,
                           color: '#f44336',
                           fontSize: '16px'
                         }}
                         title="Remove file"
                       >
                         <i className="ni ni-fat-remove" />
                       </Button>
                     </div>
                   ))}
                 </div>
               )}

               {/* Upload Error */}
               {uploadError && (
                 <div style={{
                   background: '#ffebee',
                   color: '#c62828',
                   padding: '12px',
                   borderRadius: '8px',
                   marginBottom: '16px',
                   fontSize: '14px',
                   border: '1px solid #ffcdd2'
                 }}>
                   {uploadError}
                 </div>
               )}

               {/* Action Buttons */}
               <div style={{ marginBottom: '12px' }}>
                 <input
                   type="file"
                   multiple
                   onChange={handleFileSelect}
                   style={{ display: 'none' }}
                   id="file-upload"
                   accept=".pdf,.doc,.docx,.txt,.jpg,.jpeg,.png,.gif,.zip,.rar"
                   ref={(input) => {
                     if (input) {
                       input.onclick = () => {
                         input.value = '';
                       };
                     }
                   }}
                 />
                 <Button
                   color="primary"
                   onClick={() => document.getElementById('file-upload').click()}
                   style={{
                     borderRadius: '12px',
                     fontWeight: 600,
                     fontSize: '14px',
                     width: '100%',
                     padding: '12px',
                     cursor: 'pointer'
                   }}
                   disabled={uploading}
                 >
                   <i className="ni ni-fat-add" style={{ marginRight: '8px' }} />
                   📎 Add Files
                 </Button>
               </div>

                                {selectedFiles.length > 0 || externalLinks.length > 0 ? (
                 <Button
                   color="success"
                   onClick={handleSubmitFiles}
                   disabled={uploading}
                   style={{
                     borderRadius: '12px',
                     fontWeight: 600,
                     fontSize: '14px',
                     width: '100%',
                     marginBottom: '12px',
                     padding: '12px'
                   }}
                 >
                   {uploading ? (
                     <>
                       <Spinner size="sm" style={{ marginRight: '8px' }} />
                       {uploading ? 'Submitting...' : 'Refreshing...'}
                     </>
                   ) : (
                     <>
                       <i className="ni ni-send" style={{ marginRight: '8px' }} />
                       📤 Submit {selectedFiles.length > 0 && externalLinks.length > 0 ? 'Files & Links' : 
                                 selectedFiles.length > 0 ? 'Files' : 'Links'}
                     </>
                   )}
                 </Button>
               ) : (
                 <Button
                   color="secondary"
                   disabled
                   style={{
                     borderRadius: '12px',
                     fontWeight: 600,
                     fontSize: '14px',
                     width: '100%',
                     marginBottom: '12px',
                     padding: '12px'
                   }}
                 >
                   📤 Submit Files
                 </Button>
               )}

               <Button
                 color="secondary"
                 disabled
                 style={{
                   borderRadius: '12px',
                   fontWeight: 600,
                   fontSize: '14px',
                   width: '100%',
                   marginBottom: '12px',
                   padding: '12px'
                 }}
               >
                 🔄 Resubmit
               </Button>

                                <div style={{
                 color: '#6c757d',
                 fontSize: '12px',
                 textAlign: 'center',
                 padding: '8px',
                 background: '#fff3cd',
                 borderRadius: '8px',
                 border: '1px solid #ffeaa7'
               }}>
                 ⏰ Work cannot be turned in after the due date
               </div>

                {/* Private Message Section - Inside Your Work Card */}
                <div style={{ marginTop: '24px', paddingTop: '24px', borderTop: '1px solid #e9ecef' }}>
                  <h4 style={{
                    fontWeight: 600,
                    fontSize: '18px',
                    marginBottom: '16px',
                    color: '#212529',
                    display: 'flex',
                    alignItems: 'center'
                  }}>
                    <span style={{
                      width: '32px',
                      height: '32px',
                      borderRadius: '8px',
                      background: '#f8f9fa',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      marginRight: '10px',
                      border: '1px solid #e9ecef'
                    }}>
                      <i className="ni ni-chat-round" style={{ fontSize: '16px', color: '#6c757d' }} />
                    </span>
                    Private Message
                  </h4>

                  <div style={{
                    background: '#ffffff',
                    borderRadius: '12px',
                    border: '2px solid #e9ecef',
                    padding: '16px'
                  }}>
                    <Input
                      type="textarea"
                      placeholder="Send a private message to your teacher..."
                      value={privateComment}
                      onChange={e => setPrivateComment(e.target.value)}
                      style={{
                        border: 'none',
                        fontSize: '14px',
                        resize: 'none',
                        minHeight: '60px',
                        boxShadow: 'none'
                      }}
                    />
                    <div style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      marginTop: '10px'
                    }}>
                      <small style={{ color: '#6c757d' }}>
                        🔒 Only visible to your teacher
                      </small>
                      <Button
                        color="warning"
                        size="sm"
                        style={{
                          borderRadius: '18px',
                          fontWeight: 600,
                          padding: '6px 12px',
                          fontSize: '12px'
                        }}
                        disabled={!privateComment.trim()}
                      >
                        📤 Send
                      </Button>
                    </div>
                  </div>
                </div>
              </CardBody>
            </Card>
          </Col>
        </Row>

        {/* File Preview Modal */}
        <Modal isOpen={viewerOpen} toggle={() => setViewerOpen(false)} size="xl" centered style={{ maxWidth: '95vw', width: '95vw' }} contentClassName="p-0" backdropClassName="modal-backdrop-blur">
          <ModalBody style={{ padding: 0, borderRadius: 16, overflow: 'hidden', minHeight: '92vh', height: '92vh', maxHeight: '95vh', width: '100%' }}>
            <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
              {/* Header */}
              <div style={{ background: '#fff', padding: '12px 20px', borderBottom: '1px solid #e9ecef', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div style={{ fontWeight: 600, color: '#333', fontSize: 16 }}>{viewerFile?.name || 'File preview'}</div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <Button 
                    color="secondary" 
                    onClick={() => setViewerOpen(false)} 
                    title="Close"
                    aria-label="Close preview"
                    style={{ 
                      borderRadius: '50%', 
                      width: 32, 
                      height: 32, 
                      padding: 0, 
                      marginLeft: 8, 
                      display: 'flex', 
                      alignItems: 'center', 
                      justifyContent: 'center', 
                      fontWeight: 700, 
                      fontSize: 18
                    }}
                  >
                    ×
                  </Button>
                </div>
              </div>

              {/* Body */}
              <div style={{ flex: 1, background: '#f8fafc', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16, overflow: 'auto' }}>
                {viewerFile && (
                  (() => {
                    const isPdf = viewerFile.mime === 'application/pdf' || viewerFile.url.toLowerCase().endsWith('.pdf');
                    const isImage = viewerFile.mime.startsWith('image/');
                    if (isPdf) {
                      // Prefer iframe for cross-origin safety; react-pdf if same-origin
                      const useIframe = true;
                      if (useIframe) {
                        return (
                          <iframe title="PDF Preview" src={viewerFile.url} style={{ width: '100%', height: '100%', border: 'none' }} />
                        );
                      }
                      return (
                        <Document file={viewerFile.url} onLoadSuccess={({ numPages }) => setNumPages(numPages)} loading={<Spinner />}> 
                          <Page pageNumber={currentPage} scale={pdfZoom} width={Math.min(900, window.innerWidth * 0.85)} />
                        </Document>
                      );
                    }
                    if (isImage) {
                      return (<img alt={viewerFile.name} src={viewerFile.url} style={{ maxWidth: '100%', maxHeight: '100%', borderRadius: 8, boxShadow: '0 2px 8px #00000022' }} />);
                    }
                    return (
                      <div style={{ textAlign: 'center', color: '#666' }}>
                        <div style={{ marginBottom: 12 }}>Preview not available for this file type.</div>
                        <Button color="primary" onClick={() => window.open(viewerFile.url, '_blank', 'noopener,noreferrer')}>Open in new tab</Button>
                      </div>
                    );
                  })()
                )}
              </div>

              {/* PDF pagination for react-pdf mode (hidden with iframe) */}
              {viewerFile && (viewerFile.mime === 'application/pdf' || viewerFile.url.toLowerCase().endsWith('.pdf')) && false && numPages && (
                <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 12, padding: 12, background: '#fff' }}>
                  <Button color="primary" size="sm" onClick={() => setCurrentPage(p => Math.max(1, p - 1))} disabled={currentPage <= 1}>Prev</Button>
                  <span style={{ fontWeight: 600 }}>Page {currentPage} of {numPages}</span>
                  <Button color="primary" size="sm" onClick={() => setCurrentPage(p => Math.min(numPages || 1, p + 1))} disabled={currentPage >= (numPages || 1)}>Next</Button>
                </div>
              )}
            </div>
          </ModalBody>
        </Modal>

      </div>
    </div>
  );
};

export default AssignmentDetailStudent; 