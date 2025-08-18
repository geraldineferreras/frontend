// npm install react-pdf@latest pdfjs-dist@latest
import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Card, CardBody, Button, Badge, Nav, NavItem, NavLink, TabContent, TabPane, Table, Modal, ModalBody, Input, Alert, Spinner } from "reactstrap";
import classnames from "classnames";
import { Document, Page, pdfjs } from 'react-pdf';
import QRGradingPanel from '../../components/QRGradingPanel';
import apiService from '../../services/api';

// Set the worker source to use the local file
pdfjs.GlobalWorkerOptions.workerSrc = `${process.env.PUBLIC_URL}/pdf.worker.js`;

const TaskDetail = () => {
  const { taskId } = useParams();
  const navigate = useNavigate();
  const [task, setTask] = useState(null);
  const [activeTab, setActiveTab] = useState('instructions');
  const [selectedStudentId, setSelectedStudentId] = useState(null);
  const [acceptingSubmissions, setAcceptingSubmissions] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [modalFile, setModalFile] = useState(null);
  const [modalStudent, setModalStudent] = useState(null);
  const [submissionsState, setSubmissionsState] = useState([]);
  const [gradeInput, setGradeInput] = useState("");
  const [feedbackInput, setFeedbackInput] = useState("");
  const [gradeSaved, setGradeSaved] = useState(false);
  const [pdfZoom, setPdfZoom] = useState(1);
  const [numPages, setNumPages] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [qrGradingMode, setQrGradingMode] = useState(false);
  const [resolvedTaskFileName, setResolvedTaskFileName] = useState(null);
  const [audioPlaying, setAudioPlaying] = useState(false);
  
  // Loading and error states
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [gradingLoading, setGradingLoading] = useState(false);
  
  // Modal states for PDF preview
  const [pdfModalOpen, setPdfModalOpen] = useState(false);
  const [pdfModalFile, setPdfModalFile] = useState(null);

  // Load task details, submissions, and assigned students
  useEffect(() => {
    const loadTaskDetails = async () => {
      if (!taskId) return;
      
      setLoading(true);
      setError(null);
      
      try {
        console.log('Loading task details for taskId:', taskId);
        const response = await apiService.getTaskDetails(taskId);
        
        if (response.status) {
          console.log('Task details loaded:', response.data);

          // Enrich task with original file names via file-info endpoint
          const enrichWithOriginalNames = async (data) => {
            const cloned = { ...data };
            const tasks = [];
            const isExternal = (p) => typeof p === 'string' && (p.startsWith('http://') || p.startsWith('https://'));
            const extractFilename = (p) => {
              if (!p) return '';
              if (p.startsWith('uploads/')) return p.split('/').pop();
              return p.split('/').pop();
            };
            const pickPath = (att) => att?.attachment_url || att?.file_path || att?.url || att?.file_name || '';

            // Task-level attachment
            if (cloned.attachment_url && !cloned.original_name && !isExternal(cloned.attachment_url)) {
              const filename = extractFilename(cloned.attachment_url);
              if (filename) {
                tasks.push(
                  apiService.getTaskFileInfo(filename).then((info) => {
                    if (info && info.status && info.data) {
                      cloned.original_name = info.data.original_name || info.data.filename || cloned.original_name;
                    }
                  }).catch(() => {})
                );
              }
            }

            // Attachments array
            if (Array.isArray(cloned.attachments) && cloned.attachments.length > 0) {
              cloned.attachments = cloned.attachments.map((att) => ({ ...att }));
              cloned.attachments.forEach((att) => {
                const path = pickPath(att);
                if (!att.original_name && path && !isExternal(path)) {
                  const filename = extractFilename(path);
                  if (filename) {
                    tasks.push(
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

            if (tasks.length > 0) {
              await Promise.all(tasks);
            }
            return cloned;
          };

          const enriched = await enrichWithOriginalNames(response.data);
          
          // Apply the same attachment normalization logic as ClassroomDetail.js
          const normalizedTask = await normalizeTaskAttachments(enriched);
          console.log('TaskDetail: Normalized task with attachments:', normalizedTask);
          setTask(normalizedTask);
        }
        
        // Load submissions separately
        console.log('Loading submissions for taskId:', taskId);
        const submissionsResponse = await apiService.getTaskSubmissions(taskId);
        
        if (submissionsResponse.status) {
          console.log('Submissions loaded:', submissionsResponse.data);
          
          // Set submissions from API response
          if (submissionsResponse.data.submissions && Array.isArray(submissionsResponse.data.submissions)) {
            setSubmissionsState(submissionsResponse.data.submissions);
            
            // Set first student as selected if available
            if (submissionsResponse.data.submissions.length > 0 && !selectedStudentId) {
              setSelectedStudentId(submissionsResponse.data.submissions[0].submission_id);
            }
          }
          
          // Load assigned students if task has individual assignment type
          if (response.data.assignment_type === 'individual') {
            try {
              console.log('Loading assigned students for taskId:', taskId);
              const assignedStudentsResponse = await apiService.getAssignedStudents(taskId);
              
              if (assignedStudentsResponse.status) {
                console.log('Assigned students loaded:', assignedStudentsResponse.data);
                
                // Transform assigned students to match submissions format
                const assignedStudents = assignedStudentsResponse.data.map(student => {
                  console.log('Student profile pic data:', {
                    student_id: student.student_id,
                    name: student.full_name,
                    profile_pic: student.profile_pic,
                    profile_pic_type: typeof student.profile_pic
                  });
                  
                  return {
                    submission_id: `assigned_${student.student_id}`,
                    student_id: student.student_id,
                    student_name: student.full_name,
                    student_num: student.student_num,
                    profile_pic: student.profile_pic,
                    status: 'assigned',
                    grade: null,
                    feedback: '',
                    attachments: [],
                    submitted_at: null,
                    dateGraded: null
                  };
                });
                
                // Merge with existing submissions, avoiding duplicates
                setSubmissionsState(prev => {
                  const existingSubmissionIds = new Set(prev.map(s => s.student_id));
                  const newAssignedStudents = assignedStudents.filter(s => !existingSubmissionIds.has(s.student_id));
                  return [...prev, ...newAssignedStudents];
                });
              }
            } catch (assignedError) {
              console.error('Error loading assigned students:', assignedError);
              // Don't fail the entire load if assigned students fail
            }
          }
        } else {
          setError('Failed to load task details');
        }
      } catch (error) {
        console.error('Error loading task details:', error);
        setError('Error loading task details. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    loadTaskDetails();
  }, [taskId]);

  // Normalize task attachments to ensure proper display
  const normalizeTaskAttachments = async (taskData) => {
    if (!taskData) return taskData;
    
    let attachments = Array.isArray(taskData.attachments) ? [...taskData.attachments] : [];

    // Handle different attachment formats from the backend
    if (!attachments || attachments.length === 0) {
      // Check for single attachment fields
      if (taskData.attachment_url) {
        const att = {
          attachment_url: taskData.attachment_url,
          attachment_type: taskData.attachment_type || 'file',
          name: taskData.original_name || (typeof taskData.attachment_url === 'string' ? taskData.attachment_url.split('/').pop() : 'Attachment'),
          file_name: taskData.file_name,
          original_name: taskData.original_name,
          type: taskData.attachment_type || 'file'
        };
        attachments = [att];
      }
      
      // Check for link attachments (YouTube, Google Drive, external links)
      // Check various possible field names for YouTube links
      if (taskData.youtube_url || taskData.youtube_link || taskData.youtube) {
        const youtubeUrl = taskData.youtube_url || taskData.youtube_link || taskData.youtube;
        attachments.push({
          type: 'YouTube',
          url: youtubeUrl,
          name: taskData.youtube_title || taskData.youtube_name || 'YouTube Video',
          attachment_type: 'youtube'
        });
      }
      
      // Check various possible field names for Google Drive links
      if (taskData.gdrive_url || taskData.gdrive_link || taskData.gdrive || taskData.google_drive_url || taskData.google_drive) {
        const gdriveUrl = taskData.gdrive_url || taskData.gdrive_link || taskData.gdrive || taskData.google_drive_url || taskData.google_drive;
        attachments.push({
          type: 'Google Drive',
          url: gdriveUrl,
          name: taskData.gdrive_title || taskData.gdrive_name || taskData.google_drive_title || 'Google Drive Document',
          attachment_type: 'google_drive'
        });
      }
      
      // Check various possible field names for external links
      if (taskData.link_url || taskData.link || taskData.external_link || taskData.external_url) {
        const linkUrl = taskData.link_url || taskData.link || taskData.external_link || taskData.external_url;
        attachments.push({
          type: 'Link',
          url: linkUrl,
          name: taskData.link_title || taskData.link_name || taskData.external_title || 'External Link',
          attachment_type: 'link'
        });
      }
      
      // Check for external_links JSON field
      if (taskData.external_links) {
        try {
          const externalLinks = typeof taskData.external_links === 'string' ? JSON.parse(taskData.external_links) : taskData.external_links;
          if (Array.isArray(externalLinks)) {
            externalLinks.forEach(link => {
              if (link.url && link.type) {
                attachments.push({
                  type: link.type === 'youtube' ? 'YouTube' : 
                         link.type === 'google_drive' ? 'Google Drive' : 
                         link.type === 'link' ? 'Link' : 'Link',
                  url: link.url,
                  name: link.title || link.name || 'External Link',
                  attachment_type: link.type
                });
              }
            });
          }
        } catch (e) {
          console.warn('Failed to parse external_links:', e);
        }
      }
    }

    // Ensure all attachments have proper type and url fields
    attachments = attachments.map(att => {
      // Normalize attachment type for consistent display
      if (!att.type && att.attachment_type) {
        att.type = att.attachment_type === 'youtube' ? 'YouTube' :
                   att.attachment_type === 'google_drive' ? 'Google Drive' :
                   att.attachment_type === 'link' ? 'Link' : 'File';
      }
      
      // Ensure attachment_type is set for proper styling
      if (!att.attachment_type && att.type) {
        att.attachment_type = att.type === 'YouTube' ? 'youtube' :
                             att.type === 'Google Drive' ? 'google_drive' :
                             att.type === 'Link' ? 'link' : 'file';
      }
      
      // Ensure URL is set
      if (!att.url && att.attachment_url) {
        att.url = att.attachment_url;
      }
      
      // Ensure name is set
      if (!att.name && att.original_name) {
        att.name = att.original_name;
      }
      
      return att;
    });

    return { ...taskData, attachments };
  };

  // Resolve top-level task attachment original_name quickly for UI label
  useEffect(() => {
    if (!task) return;
    setResolvedTaskFileName(null);
    const path = task.attachment_url || '';
    const isExternal = (p) => typeof p === 'string' && (p.startsWith('http://') || p.startsWith('https://'));
    const extractFilename = (p) => {
      if (!p) return '';
      if (p.startsWith('uploads/')) return p.split('/').pop();
      return p.split('/').pop();
    };
    if (path && !task.original_name && !isExternal(path)) {
      const fname = extractFilename(path);
      if (fname) {
        apiService.getTaskFileInfo(fname).then((info) => {
          if (info && info.status && info.data) {
            setResolvedTaskFileName(info.data.original_name || info.data.filename || null);
          }
        }).catch(() => {});
      }
    }
  }, [task]);

  // Safety net: if original names are still missing after initial load, resolve them here
  useEffect(() => {
    if (!task) return;
    (async () => {
      const isExternal = (p) => typeof p === 'string' && (p.startsWith('http://') || p.startsWith('https://'));
      const extractFilename = (p) => {
        if (!p) return '';
        if (p.startsWith('uploads/')) return p.split('/').pop();
        return p.split('/').pop();
      };
      const pickPath = (att) => att?.attachment_url || att?.file_path || att?.url || att?.file_name || '';

      const jobs = [];
      // Top-level attachment
      if (task.attachment_url && !task.original_name && !isExternal(task.attachment_url)) {
        const fname = extractFilename(task.attachment_url);
        if (fname) {
          jobs.push(
            apiService.getTaskFileInfo(fname).then((info) => {
              if (info && info.status && info.data) {
                setTask((prev) => ({ ...prev, original_name: info.data.original_name || info.data.filename || prev.original_name }));
              }
            }).catch(() => {})
          );
        }
      }

      // Attachments array
      if (Array.isArray(task.attachments) && task.attachments.length > 0) {
        task.attachments.forEach((att, idx) => {
          const path = pickPath(att);
          if (!att.original_name && path && !isExternal(path)) {
            const fname = extractFilename(path);
            if (fname) {
              jobs.push(
                apiService.getTaskFileInfo(fname).then((info) => {
                  if (info && info.status && info.data) {
                    setTask((prev) => {
                      if (!Array.isArray(prev.attachments)) return prev;
                      const next = prev.attachments.map((a, i) => i === idx ? ({ ...a, original_name: info.data.original_name || info.data.filename || a.original_name, mime_type: a.mime_type || info.data.mime_type }) : a);
                      return { ...prev, attachments: next };
                    });
                  }
                }).catch(() => {})
              );
            }
          }
        });
      }

      if (jobs.length > 0) {
        await Promise.all(jobs);
      }
    })();
  }, [task]);

  // Modern container styles
  const outerStyle = {
    maxWidth: '100vw',
    minHeight: '100vh',
    margin: 0,
    padding: 0,
    background: 'linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%)',
  };
  const innerStyle = {
    maxWidth: 1400,
    margin: '0 auto',
    padding: '32px 24px',
  };

  // Get selected student from submissions
  const selectedStudent = submissionsState.find(s => s.submission_id === selectedStudentId) || submissionsState[0];

  // Helper: get file type icon
  const getFileTypeIcon = (att) => {
    if (!att) {
      return <div style={{ 
        width: 60, 
        height: 80, 
        background: 'linear-gradient(135deg, #90A4AE 0%, #78909C 100%)', 
        borderRadius: 12,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        color: '#fff',
        fontWeight: 'bold',
        fontSize: 14,
        boxShadow: '0 4px 12px rgba(144, 164, 174, 0.3)'
      }}>FILE</div>;
    }

    // Handle link attachments
    if (att.type === "Link" && att.url) {
      return <div style={{ 
        width: 60, 
        height: 80, 
        background: 'linear-gradient(135deg, #1976D2 0%, #1565C0 100%)', 
        borderRadius: 12,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        color: '#fff',
        fontWeight: 'bold',
        fontSize: 14,
        boxShadow: '0 4px 12px rgba(25, 118, 210, 0.3)'
      }}>LINK</div>;
    }

    // Handle YouTube attachments
    if (att.type === "YouTube" && att.url) {
      return <div style={{ 
        width: 60, 
        height: 80, 
        background: 'linear-gradient(135deg, #FF0000 0%, #D32F2F 100%)', 
        borderRadius: 12,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        color: '#fff',
        fontWeight: 'bold',
        fontSize: 14,
        boxShadow: '0 4px 12px rgba(255, 0, 0, 0.3)'
      }}>YT</div>;
    }

    // Handle Google Drive attachments
    if (att.type === "Google Drive" && att.url) {
      return <div style={{ 
        width: 60, 
        height: 80, 
        background: 'linear-gradient(135deg, #4285F4 0%, #3367D6 100%)', 
        borderRadius: 12,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        color: '#fff',
        fontWeight: 'bold',
        fontSize: 14,
        boxShadow: '0 4px 12px rgba(66, 133, 244, 0.3)'
      }}>DRIVE</div>;
    }

    // Handle file attachments
    const fileName = att.name || att.original_name || att.file_name;
    if (!fileName || typeof fileName !== 'string') {
      return <div style={{ 
        width: 60, 
        height: 80, 
        background: 'linear-gradient(135deg, #90A4AE 0%, #78909C 100%)', 
        borderRadius: 12,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        color: '#fff',
        fontWeight: 'bold',
        fontSize: 14,
        boxShadow: '0 4px 12px rgba(144, 164, 174, 0.3)'
      }}>FILE</div>;
    }

    const ext = fileName.split('.').pop().toLowerCase();
    const imageTypes = ['jpg', 'jpeg', 'png', 'gif', 'webp', 'bmp', 'svg'];

    // Microsoft Word
    const wordExts = ['doc', 'docx', 'dot', 'dotx', 'docm', 'dotm'];
    if (wordExts.includes(ext)) {
      return <div style={{ 
        width: 60, 
        height: 80, 
        background: 'linear-gradient(135deg, #1976D2 0%, #1565C0 100%)', 
        borderRadius: 12,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        color: '#fff',
        fontWeight: 'bold',
        fontSize: 14,
        boxShadow: '0 4px 12px rgba(25, 118, 210, 0.3)'
      }}>WORD</div>;
    }
    // Microsoft Excel (including CSV)
    const excelExts = ['xls', 'xlsx', 'xlsm', 'xlsb', 'xlt', 'xltx', 'xltm', 'csv'];
    if (excelExts.includes(ext)) {
      return <div style={{ 
        width: 60, 
        height: 80, 
        background: 'linear-gradient(135deg, #388E3C 0%, #2E7D32 100%)', 
        borderRadius: 12,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        color: '#fff',
        fontWeight: 'bold',
        fontSize: 14,
        boxShadow: '0 4px 12px rgba(56, 142, 60, 0.3)'
      }}>EXCEL</div>;
    }
    // Microsoft PowerPoint
    const pptExts = ['ppt', 'pptx', 'pps', 'ppsx', 'pptm', 'potx', 'potm', 'ppsm'];
    if (pptExts.includes(ext)) {
      return <div style={{ 
        width: 60, 
        height: 80, 
        background: 'linear-gradient(135deg, #FF9800 0%, #F57C00 100%)', 
        borderRadius: 12,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        color: '#fff',
        fontWeight: 'bold',
        fontSize: 14,
        boxShadow: '0 4px 12px rgba(255, 152, 0, 0.3)'
      }}>PPT</div>;
    }
    // TXT
    if (ext === 'txt') {
      return <div style={{ 
        width: 60, 
        height: 80, 
        background: 'linear-gradient(135deg, #607d8b 0%, #455a64 100%)', 
        borderRadius: 12,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        color: '#fff',
        fontWeight: 'bold',
        fontSize: 14,
        boxShadow: '0 4px 12px rgba(96, 125, 139, 0.3)'
      }}>TXT</div>;
    }

    if (imageTypes.includes(ext)) {
      return <div style={{ 
        width: 60, 
        height: 80, 
        background: 'linear-gradient(135deg, #4CAF50 0%, #388E3C 100%)', 
        borderRadius: 12,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        color: '#fff',
        fontWeight: 'bold',
        fontSize: 14,
        boxShadow: '0 4px 12px rgba(76, 175, 80, 0.3)'
      }}>IMG</div>;
    }
    if (ext === 'mp4') {
      return <div style={{ 
        width: 60, 
        height: 80, 
        background: 'linear-gradient(135deg, #8e24aa 0%, #6a1b9a 100%)', 
        borderRadius: 12,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        color: '#fff',
        fontWeight: 'bold',
        fontSize: 14,
        boxShadow: '0 4px 12px rgba(142, 36, 170, 0.3)'
      }}>MP4</div>;
    }
    if (ext === 'mp3') {
      return <div style={{ 
        width: 60, 
        height: 80, 
        background: 'linear-gradient(135deg, #43a047 0%, #388E3C 100%)', 
        borderRadius: 12,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        color: '#fff',
        fontWeight: 'bold',
        fontSize: 14,
        boxShadow: '0 4px 12px rgba(67, 160, 71, 0.3)'
      }}>MP3</div>;
    }
    if (ext === 'pdf') {
      return <div style={{ 
        width: 60, 
        height: 80, 
        background: 'linear-gradient(135deg, #F44336 0%, #D32F2F 100%)', 
        borderRadius: 12,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        color: '#fff',
        fontWeight: 'bold',
        fontSize: 14,
        boxShadow: '0 4px 12px rgba(244, 67, 54, 0.3)'
      }}>PDF</div>;
    }
    return <div style={{ 
      width: 60, 
      height: 80, 
      background: 'linear-gradient(135deg, #90A4AE 0%, #78909C 100%)', 
      borderRadius: 12,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      color: '#fff',
      fontWeight: 'bold',
      fontSize: 14,
      boxShadow: '0 4px 12px rgba(144, 164, 174, 0.3)'
    }}>{ext.toUpperCase()}</div>;
  };

  // Helper: check file type
  const isImage = (file) => file && file.url && (file.url.endsWith('.jpg') || file.url.endsWith('.jpeg') || file.url.endsWith('.png') || file.url.endsWith('.gif') || file.url.endsWith('.webp'));
  const isPDF = (file) => file && file.url && file.url.endsWith('.pdf');

  // Helper: get profile picture URL
  const getProfilePicUrl = (profilePic) => {
    if (!profilePic) return null;
    
    if (profilePic.startsWith('http://') || profilePic.startsWith('https://')) {
      return profilePic;
    } else if (profilePic.startsWith('uploads/')) {
      return `${process.env.REACT_APP_API_BASE_URL || 'http://localhost/scms_new_backup'}/${profilePic}`;
    } else if (profilePic.startsWith('data:')) {
      return profilePic;
    } else {
      return `${process.env.REACT_APP_API_BASE_URL || 'http://localhost/scms_new_backup'}/uploads/profile/${profilePic}`;
    }
  };

  // Helper: get file URL for attachments
  const getFileUrl = (filePath) => {
    if (!filePath) return null;
    
    // Use the API service's getFilePreviewUrl function for consistency
    return apiService.getFilePreviewUrl(filePath, true); // true for submissions
  };

  // Open modal with file and student info
  const handleOpenModal = (file, student) => {
    setModalFile(file);
    setModalStudent(student);
    setGradeInput(student.grade !== null ? student.grade.toString() : "");
    setFeedbackInput(student.feedback || "");
    setGradeSaved(false);
    setPdfZoom(1);
    setCurrentPage(1);
    setModalOpen(true);
  };

  // Save grade for student
  const handleSaveGrade = async () => {
    if (!modalStudent || !gradeInput) return;
    
    setGradingLoading(true);
    
    try {
      const response = await apiService.gradeSubmission(modalStudent.submission_id, {
        grade: parseFloat(gradeInput),
        feedback: feedbackInput
      });
      
      if (response.status) {
        // Update local state
        setSubmissionsState(prev => prev.map(s =>
          s.submission_id === modalStudent.submission_id 
            ? { 
                ...s, 
                grade: parseFloat(gradeInput),
                feedback: feedbackInput,
                status: 'graded'
              } 
            : s
        ));
        
        setGradeSaved(true);
        setTimeout(() => setGradeSaved(false), 1200);
      } else {
        setError('Failed to save grade');
      }
    } catch (error) {
      console.error('Error saving grade:', error);
      setError('Error saving grade. Please try again.');
    } finally {
      setGradingLoading(false);
    }
  };

  // Handle grade submission from QRGradingPanel
  const handleQRGradeSubmit = async ({ studentId, score, feedback, attachments, dateGraded, qrData }) => {
    setGradingLoading(true);

    // Resolve class code from task or local storage
    const resolveClassCode = () => {
      if (task && Array.isArray(task.class_codes) && task.class_codes.length > 0) return task.class_codes[0];
      if (task && task.class_code) return task.class_code;
      try {
        const currentClassroom = localStorage.getItem('currentClassroom');
        if (currentClassroom) return JSON.parse(currentClassroom)?.code;
      } catch (_) {}
      return undefined;
    };

    try {
      const response = await apiService.qrQuickGrade({
        taskId,
        studentId,
        score: parseFloat(score),
        feedback,
        classCode: resolveClassCode(),
        attachments: attachments || [],
        qrData,
      });

      if (response && (response.status || response.success)) {
        // Update local state: match by student_id primarily; fallback to submission_id equals studentId
        setSubmissionsState((prev) =>
          prev.map((s) => {
            const matchesByStudent =
              String(s.student_id || '') === String(studentId) ||
              String(s.student_num || '') === String(studentId);
            const matchesBySubmission = String(s.submission_id || '') === String(studentId);
            if (matchesByStudent || matchesBySubmission) {
              return {
                ...s,
                grade: parseFloat(score),
                feedback,
                attachments: attachments && attachments.length > 0 ? attachments : s.attachments,
                dateGraded: dateGraded || new Date().toISOString(),
                status: 'graded',
              };
            }
            return s;
          })
        );
      } else {
        setError('Failed to save QR grade');
      }
    } catch (error) {
      console.error('Error saving QR grade:', error);
      setError('Error saving QR grade. Please try again.');
    } finally {
      setGradingLoading(false);
    }
  };

  // Preview file from API
  const previewFile = (filename, isSubmission = false) => {
    const fileUrl = apiService.getFilePreviewUrl(filename, isSubmission);
    window.open(fileUrl, '_blank');
  };
  
  // Open file preview modal (PDFs/images inline like student view)
  const openPdfModal = (filename, isSubmission = false, displayName) => {
    let fileUrl;
    let fileName = displayName || filename || 'Document';

    // Build an absolute URL when a bare filename or relative path is provided
    if (!filename) return;
    if (filename.startsWith('http://') || filename.startsWith('https://')) {
      fileUrl = filename;
    } else {
      fileUrl = apiService.getFilePreviewUrl(filename, isSubmission);
    }

    setPdfModalFile({ name: fileName, url: fileUrl });
    setPdfModalOpen(true);
    setPdfZoom(1);
    setCurrentPage(1);
  };

  // Modal content for file preview
  const renderModalContent = () => {
    if (!modalFile || !modalStudent) return null;
    return (
      <div style={{ display: 'flex', minHeight: '90vh', width: '100vw', maxWidth: '100vw' }}>
        {/* File preview */}
        <div style={{ flex: 2, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', background: '#f8fafc', borderRadius: '0', minWidth: 0, minHeight: 0, height: '90vh' }}>
          {isImage(modalFile) ? (
            <img src={modalFile.url} alt={modalFile.name} style={{ maxWidth: '90%', maxHeight: '90%', borderRadius: 12, boxShadow: '0 2px 8px #324cdd22' }} />
          ) : isPDF(modalFile) ? (
            <iframe title="PDF Preview" src={modalFile.url} style={{ width: '100%', height: '100%', border: 'none', background: '#fff', borderRadius: 12 }} />
          ) : (
            <div style={{ color: '#888', fontSize: 18 }}>No preview available</div>
          )}
        </div>
        {/* Sidebar */}
        <div style={{ flex: 1, background: '#fff', borderLeft: '1.5px solid #e9ecef', padding: 48, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minWidth: 320, height: '90vh' }}>
                     <img src={getProfilePicUrl(modalStudent.profile_pic) || `https://ui-avatars.com/api/?name=${modalStudent.student_name}&background=random`} alt={modalStudent.student_name} style={{ width: 70, height: 70, borderRadius: '50%', objectFit: 'cover', border: '2px solid #e9ecef', marginBottom: 18 }} />
          <div style={{ fontWeight: 700, fontSize: 24, marginBottom: 8 }}>{modalStudent.student_name}</div>
          <div style={{ color: '#888', fontWeight: 500, fontSize: 17, marginBottom: 18 }}>{modalStudent.status}</div>
          {/* Grade input */}
          <div style={{ marginBottom: 18, width: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            <div style={{ fontWeight: 700, color: '#27ae60', fontSize: 22, marginBottom: 8 }}>Grading:</div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <Input
                type="number"
                min={0}
                max={100}
                value={gradeInput}
                onChange={e => setGradeInput(e.target.value)}
                style={{ width: 80, fontWeight: 700, fontSize: 20, color: '#27ae60', textAlign: 'center', borderRadius: 8, border: '1.5px solid #e9ecef', background: '#f8fafc' }}
              />
              <Button 
                color="primary" 
                size="sm" 
                style={{ fontWeight: 700, fontSize: 16, borderRadius: 8, padding: '4px 18px' }} 
                onClick={handleSaveGrade} 
                disabled={gradeInput === "" || isNaN(Number(gradeInput)) || gradingLoading}
              >
                {gradingLoading ? <Spinner size="sm" /> : 'Save'}
              </Button>
              {gradeSaved && <span style={{ color: '#27ae60', fontWeight: 700, fontSize: 18, marginLeft: 6 }}>✔</span>}
            </div>
          </div>
          {/* Feedback input */}
          <div style={{ width: '100%', marginBottom: 18 }}>
            <div style={{ fontWeight: 600, fontSize: 16, marginBottom: 8 }}>Feedback:</div>
            <Input
              type="textarea"
              value={feedbackInput}
              onChange={e => setFeedbackInput(e.target.value)}
              placeholder="Optional feedback..."
              style={{ width: '100%', minHeight: 80, borderRadius: 8, border: '1.5px solid #e9ecef' }}
            />
          </div>
          <div style={{ color: '#324cdd', fontWeight: 600, fontSize: 18, marginBottom: 12 }}>{modalFile.name}</div>
          <a href={modalFile.url} target="_blank" rel="noopener noreferrer" style={{ color: '#1976d2', fontWeight: 500, fontSize: 16, textDecoration: 'underline' }}>Open in new tab</a>
        </div>
      </div>
    );
  };

  const turnedIn = submissionsState.filter(s => s.status === 'submitted' || s.status === 'graded').length;
  const assigned = submissionsState.filter(s => s.status === 'assigned' || s.status === 'submitted' || s.status === 'graded').length;

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: '50px 20px' }}>
        <Spinner color="primary" style={{ width: '3rem', height: '3rem' }} />
        <div style={{ marginTop: 20, fontSize: 18, color: '#666' }}>Loading task details...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ textAlign: 'center', padding: '50px 20px' }}>
        <Alert color="danger">
          <h4>Error</h4>
          <p>{error}</p>
          <Button color="primary" onClick={() => window.location.reload()}>Retry</Button>
        </Alert>
      </div>
    );
  }

  if (!task) {
    return (
      <div style={{ textAlign: 'center', color: '#888', fontWeight: 600, fontSize: 22, margin: '32px 0' }}>Task not found</div>
    );
  }

  return (
    <div style={outerStyle}>
      <div style={innerStyle}>
        {/* Modern Header Section */}
        <div style={{
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          borderRadius: 24,
          padding: '40px 48px',
          marginBottom: 32,
          position: 'relative',
          overflow: 'hidden',
          boxShadow: '0 8px 32px rgba(102, 126, 234, 0.2)'
        }}>
          {/* Decorative elements */}
          <div style={{ position: 'absolute', top: 0, right: 0, width: '300px', height: '300px', background: 'rgba(255,255,255,0.1)', borderRadius: '50%', transform: 'translate(50%, -50%)' }} />
          <div style={{ position: 'absolute', bottom: 0, left: '20%', width: '150px', height: '150px', background: 'rgba(255,255,255,0.08)', borderRadius: '50%' }} />
          
          <div style={{ position: 'relative', zIndex: 2 }}>
            {/* Back button */}
            <Button 
              color="link" 
              onClick={() => {
                let classroomCode = null;
                if (task && task.class_codes && Array.isArray(task.class_codes) && task.class_codes.length > 0) {
                  classroomCode = task.class_codes[0];
                } else if (task && task.class_code) {
                  classroomCode = task.class_code;
                } else {
                  const currentClassroom = localStorage.getItem('currentClassroom');
                  if (currentClassroom) {
                    try {
                      const classroomData = JSON.parse(currentClassroom);
                      classroomCode = classroomData.code;
                    } catch (e) {
                      console.error('Error parsing classroom data:', e);
                    }
                  }
                }
                
                if (classroomCode) {
                  navigate(`/teacher/classroom/${classroomCode}?tab=class`);
                } else {
                  navigate(-1);
                }
              }}
              style={{ 
                marginBottom: 24, 
                padding: '12px 24px', 
                color: 'rgba(255,255,255,0.9)', 
                textDecoration: 'none',
                background: 'rgba(255,255,255,0.15)',
                borderRadius: 12,
                border: 'none',
                fontWeight: 600,
                fontSize: 14,
                backdropFilter: 'blur(10px)',
                transition: 'all 0.3s ease'
              }}
            >
              ← Back to Class Tasks
            </Button>
            
            {/* Task title and info */}
            {task && task.title && (
              <div style={{ marginBottom: 24 }}>
                <h1 style={{ 
                  fontWeight: 800, 
                  fontSize: 36, 
                  color: '#fff', 
                  margin: '0 0 12px 0',
                  textShadow: '0 2px 4px rgba(0,0,0,0.1)'
                }}>
                  {task.title}
                </h1>
                <div style={{ display: 'flex', alignItems: 'center', gap: 16, flexWrap: 'wrap' }}>
                  <div style={{
                    background: 'rgba(255,255,255,0.2)',
                    padding: '8px 16px',
                    borderRadius: 20,
                    color: '#fff',
                    fontSize: 14,
                    fontWeight: 600,
                    textTransform: 'uppercase',
                    letterSpacing: 0.5
                  }}>
                    {task.type || 'Assignment'}
                  </div>
                  <div style={{
                    background: 'rgba(255,255,255,0.2)',
                    padding: '8px 16px',
                    borderRadius: 20,
                    color: '#fff',
                    fontSize: 14,
                    fontWeight: 600
                  }}>
                    {task.points || 0} points
                  </div>
                  {task.due_date && (
                    <div style={{
                      background: 'rgba(255,255,255,0.2)',
                      padding: '8px 16px',
                      borderRadius: 20,
                      color: '#fff',
                      fontSize: 14,
                      fontWeight: 600
                    }}>
                      Due {new Date(task.due_date).toLocaleDateString()}
                    </div>
                  )}
                </div>
              </div>
            )}
            
            {/* Quick stats */}
            <div style={{ display: 'flex', gap: 24, marginTop: 32 }}>
              <div style={{
                background: 'rgba(255,255,255,0.15)',
                padding: '20px 24px',
                borderRadius: 16,
                backdropFilter: 'blur(10px)',
                minWidth: 120
              }}>
                <div style={{ color: '#fff', fontWeight: 700, fontSize: 28 }}>{turnedIn}</div>
                <div style={{ color: 'rgba(255,255,255,0.8)', fontSize: 14 }}>Turned In</div>
              </div>
              <div style={{
                background: 'rgba(255,255,255,0.15)',
                padding: '20px 24px',
                borderRadius: 16,
                backdropFilter: 'blur(10px)',
                minWidth: 120
              }}>
                <div style={{ color: '#fff', fontWeight: 700, fontSize: 28 }}>{assigned}</div>
                <div style={{ color: 'rgba(255,255,255,0.8)', fontSize: 14 }}>Assigned</div>
              </div>
              <div style={{
                background: 'rgba(255,255,255,0.15)',
                padding: '20px 24px',
                borderRadius: 16,
                backdropFilter: 'blur(10px)',
                minWidth: 120
              }}>
                <div style={{ color: '#fff', fontWeight: 700, fontSize: 28 }}>
                  {assigned > 0 ? Math.round((turnedIn / assigned) * 100) : 0}%
                </div>
                <div style={{ color: 'rgba(255,255,255,0.8)', fontSize: 14 }}>Completion</div>
              </div>
            </div>
          </div>
        </div>
        
        {/* Modern Navigation Tabs */}
        <div style={{
          background: '#fff',
          borderRadius: 20,
          padding: '8px',
          marginBottom: 32,
          boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
          border: '1px solid #f0f0f0'
        }}>
          <div style={{ display: 'flex', gap: 8 }}>
            <button
              onClick={() => setActiveTab('instructions')}
              style={{
                flex: 1,
                padding: '16px 24px',
                background: activeTab === 'instructions' ? 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' : 'transparent',
                color: activeTab === 'instructions' ? '#fff' : '#4a5568',
                border: 'none',
                borderRadius: 16,
                fontWeight: 600,
                fontSize: 16,
                cursor: 'pointer',
                transition: 'all 0.3s ease',
                boxShadow: activeTab === 'instructions' ? '0 4px 12px rgba(102, 126, 234, 0.3)' : 'none'
              }}
            >
              <i className="ni ni-single-copy-04 mr-2" />
              Instructions
            </button>
            <button
              onClick={() => setActiveTab('studentwork')}
              style={{
                flex: 1,
                padding: '16px 24px',
                background: activeTab === 'studentwork' ? 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' : 'transparent',
                color: activeTab === 'studentwork' ? '#fff' : '#4a5568',
                border: 'none',
                borderRadius: 16,
                fontWeight: 600,
                fontSize: 16,
                cursor: 'pointer',
                transition: 'all 0.3s ease',
                boxShadow: activeTab === 'studentwork' ? '0 4px 12px rgba(102, 126, 234, 0.3)' : 'none'
              }}
            >
              <i className="ni ni-single-02 mr-2" />
              Student Work
            </button>
          </div>
        </div>
        <TabContent activeTab={activeTab}>
          <TabPane tabId="instructions">
            <div style={{
              background: '#fff',
              borderRadius: 24,
              padding: '40px 48px',
              boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
              border: '1px solid #f0f0f0',
              marginBottom: 24
            }}>
              {/* Instructions Header */}
              <div style={{ marginBottom: 32 }}>
                <div style={{ display: 'flex', alignItems: 'center', marginBottom: 20 }}>
                  <div style={{
                    width: 60,
                    height: 60,
                    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                    borderRadius: 16,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    marginRight: 20,
                    boxShadow: '0 4px 12px rgba(102, 126, 234, 0.3)'
                  }}>
                    <i className="ni ni-single-copy-04" style={{ fontSize: 28, color: '#fff' }} />
                  </div>
                  <div>
                    <h2 style={{ 
                      fontWeight: 800, 
                      fontSize: 32, 
                      color: '#2d3748', 
                      margin: '0 0 8px 0' 
                    }}>
                      Instructions
                    </h2>
                    <p style={{ 
                      color: '#718096', 
                      fontSize: 16, 
                      margin: 0 
                    }}>
                      Review the assignment details and requirements
                    </p>
                  </div>
                </div>
              </div>

              {/* Instructions Content */}
              <div style={{ marginBottom: 40 }}>
                <h3 style={{ 
                  fontWeight: 700, 
                  fontSize: 20, 
                  color: '#4a5568', 
                  margin: '0 0 16px 0' 
                }}>
                  Assignment Details
                </h3>
                <div style={{ 
                  fontSize: 16, 
                  color: '#4a5568', 
                  lineHeight: 1.7,
                  background: '#f8fafc',
                  padding: '24px',
                  borderRadius: 16,
                  border: '1px solid #e2e8f0'
                }}>
                  {task.instructions || 'No instructions provided for this assignment.'}
                </div>
              </div>

              {/* Assignment Info Cards */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 20, marginBottom: 40 }}>
                <div style={{
                  background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                  padding: '24px',
                  borderRadius: 16,
                  color: '#fff',
                  textAlign: 'center'
                }}>
                  <div style={{ fontSize: 24, fontWeight: 700, marginBottom: 8 }}>{task.points || 0}</div>
                  <div style={{ fontSize: 14, opacity: 0.9 }}>Total Points</div>
                </div>
                
                <div style={{
                  background: 'linear-gradient(135deg, #48bb78 0%, #38a169 100%)',
                  padding: '24px',
                  borderRadius: 16,
                  color: '#fff',
                  textAlign: 'center'
                }}>
                  <div style={{ fontSize: 24, fontWeight: 700, marginBottom: 8 }}>
                    {task.due_date ? new Date(task.due_date).toLocaleDateString() : 'No Due Date'}
                  </div>
                  <div style={{ fontSize: 14, opacity: 0.9 }}>Due Date</div>
                </div>
                
                <div style={{
                  background: 'linear-gradient(135deg, #ed8936 0%, #dd6b20 100%)',
                  padding: '24px',
                  borderRadius: 16,
                  color: '#fff',
                  textAlign: 'center'
                }}>
                  <div style={{ fontSize: 24, fontWeight: 700, marginBottom: 8 }}>{task.type || 'Assignment'}</div>
                  <div style={{ fontSize: 14, opacity: 0.9 }}>Type</div>
                </div>
              </div>

              {/* File Attachment Section */}
              <div>
                <h3 style={{ 
                  fontWeight: 700, 
                  fontSize: 20, 
                  color: '#4a5568', 
                  margin: '0 0 20px 0' 
                }}>
                  Attachments
                </h3>
                {(task.attachments && task.attachments.length > 0) ? (
                  task.attachments.map((att, idx) => (
                    <div key={att.attachment_id || idx} style={{
                      background: '#fff',
                      border: '2px solid #e2e8f0',
                      borderRadius: 16,
                      padding: '24px',
                      display: 'flex',
                      alignItems: 'center',
                      gap: 20,
                      transition: 'all 0.3s ease',
                      cursor: 'pointer',
                      boxShadow: '0 2px 8px rgba(0,0,0,0.05)',
                      marginBottom: 12
                    }} onClick={() => openPdfModal(att.attachment_url || att.file_path || att.url || '', false, att.original_name || att.file_name)}>
                      <div style={{ 
                        width: 60, 
                        height: 80, 
                        background: 'linear-gradient(135deg, #e53e3e 0%, #c53030 100%)', 
                        borderRadius: 12,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: '#fff',
                        fontWeight: 'bold',
                        fontSize: 14,
                        boxShadow: '0 4px 12px rgba(229, 62, 62, 0.3)'
                      }}>
                        {getFileTypeIcon(att)}
                      </div>
                      <div style={{ flex: 1 }}>
                        <div style={{ fontWeight: 600, color: '#2d3748', fontSize: 16, marginBottom: 4 }}>
                          {att.original_name || att.file_name || (att.attachment_url ? att.attachment_url.split('/').pop() : 'Attachment')}
                        </div>
                        <div style={{ color: '#718096', fontSize: 14 }}>
                          {(att.attachment_url || '').startsWith('http') ? 'External Link' : (att.original_name || att.file_name || att.name || 'File').split('.').pop().toUpperCase() || 'FILE'} • Click to preview
                        </div>
                      </div>
                      <div style={{
                        width: 40,
                        height: 40,
                        background: '#f7fafc',
                        borderRadius: '50%',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: '#4a5568'
                      }}>
                        <i className="ni ni-bold-right" style={{ fontSize: 16 }} />
                      </div>
                    </div>
                  ))
                ) : task.attachment_url ? (
                  <div style={{
                    background: '#fff',
                    border: '2px solid #e2e8f0',
                    borderRadius: 16,
                    padding: '24px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 20,
                    transition: 'all 0.3s ease',
                    cursor: 'pointer',
                    boxShadow: '0 2px 8px rgba(0,0,0,0.05)'
                  }} onClick={() => openPdfModal(task.attachment_url, false, task.original_name || resolvedTaskFileName)}>
                    <div style={{ 
                      width: 60, 
                      height: 80, 
                      background: 'linear-gradient(135deg, #e53e3e 0%, #c53030 100%)', 
                      borderRadius: 12,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: '#fff',
                      fontWeight: 'bold',
                      fontSize: 14,
                      boxShadow: '0 4px 12px rgba(229, 62, 62, 0.3)'
                    }}>
                      {getFileTypeIcon({ name: task.attachment_url.split('/').pop(), type: 'file' })}
                    </div>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontWeight: 600, color: '#2d3748', fontSize: 16, marginBottom: 4 }}>
                        {task.original_name || resolvedTaskFileName || (task.attachment_url.startsWith('http') 
                          ? 'External Link' 
                          : task.attachment_url.split('/').pop())
                        }
                      </div>
                      <div style={{ color: '#718096', fontSize: 14 }}>
                        {task.attachment_url.startsWith('http') ? 'External Link' : (task.attachment_url.split('/').pop().split('.').pop().toUpperCase() || 'FILE')} • Click to preview
                      </div>
                    </div>
                    <div style={{
                      width: 40,
                      height: 40,
                      background: '#f7fafc',
                      borderRadius: '50%',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: '#4a5568'
                    }}>
                      <i className="ni ni-bold-right" style={{ fontSize: 16 }} />
                    </div>
                  </div>
                ) : (
                  <div style={{ 
                    padding: '40px', 
                    background: '#f8fafc', 
                    borderRadius: 16, 
                    border: '2px dashed #cbd5e0',
                    textAlign: 'center',
                    color: '#718096'
                  }}>
                    <div style={{
                      width: 60,
                      height: 60,
                      background: '#e2e8f0',
                      borderRadius: '50%',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      margin: '0 auto 16px auto'
                    }}>
                      <i className="ni ni-folder-17" style={{ fontSize: 24, color: '#a0aec0' }} />
                    </div>
                    <div style={{ fontSize: 16, fontWeight: 600, marginBottom: 8 }}>No attachments</div>
                    <div style={{ fontSize: 14 }}>This assignment doesn't have any attached files</div>
                  </div>
                )}
              </div>
            </div>
          </TabPane>
          <TabPane tabId="studentwork">
            {/* Modern Student Work Header */}
            <div style={{
              background: '#fff',
              borderRadius: 24,
              padding: '32px 40px',
              marginBottom: 32,
              boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
              border: '1px solid #f0f0f0'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 20 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 20 }}>
                  <div style={{
                    width: 60,
                    height: 60,
                    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                    borderRadius: 16,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    boxShadow: '0 4px 12px rgba(102, 126, 234, 0.3)'
                  }}>
                    <i className="ni ni-single-02" style={{ fontSize: 28, color: '#fff' }} />
                  </div>
                  <div>
                    <h2 style={{ 
                      fontWeight: 800, 
                      fontSize: 28, 
                      color: '#2d3748', 
                      margin: '0 0 8px 0' 
                    }}>
                      Student Submissions
                    </h2>
                    <p style={{ 
                      color: '#718096', 
                      fontSize: 16, 
                      margin: 0 
                    }}>
                      Review and grade student work
                    </p>
                  </div>
                </div>
                
                {/* Control Panel */}
                <div style={{ display: 'flex', alignItems: 'center', gap: 24 }}>
                  {/* Submission Stats */}
                  <div style={{ display: 'flex', gap: 16 }}>
                    <div style={{ textAlign: 'center' }}>
                      <div style={{ fontWeight: 700, fontSize: 24, color: '#48bb78' }}>{turnedIn}</div>
                      <div style={{ color: '#718096', fontSize: 12 }}>Turned In</div>
                    </div>
                    <div style={{ textAlign: 'center' }}>
                      <div style={{ fontWeight: 700, fontSize: 24, color: '#667eea' }}>{assigned}</div>
                      <div style={{ color: '#718096', fontSize: 12 }}>Assigned</div>
                    </div>
                  </div>
                  
                  {/* Toggle Switches */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <span style={{ fontSize: 14, color: '#4a5568', fontWeight: 500 }}>Accepting</span>
                      <button
                        onClick={() => setAcceptingSubmissions(v => !v)}
                        style={{
                          width: 48,
                          height: 24,
                          borderRadius: 12,
                          background: acceptingSubmissions ? 'linear-gradient(135deg, #48bb78 0%, #38a169 100%)' : '#e2e8f0',
                          border: 'none',
                          position: 'relative',
                          cursor: 'pointer',
                          transition: 'all 0.3s ease',
                          boxShadow: acceptingSubmissions ? '0 2px 8px rgba(72, 187, 120, 0.3)' : 'none'
                        }}
                      >
                        <div style={{
                          position: 'absolute',
                          left: acceptingSubmissions ? 26 : 2,
                          top: 2,
                          width: 20,
                          height: 20,
                          borderRadius: '50%',
                          background: '#fff',
                          boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
                          transition: 'left 0.3s ease'
                        }} />
                      </button>
                    </div>
                    
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <span style={{ fontSize: 14, color: '#4a5568', fontWeight: 500 }}>QR Grading</span>
                      <button
                        onClick={() => setQrGradingMode(v => !v)}
                        style={{
                          width: 48,
                          height: 24,
                          borderRadius: 12,
                          background: qrGradingMode ? 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' : '#e2e8f0',
                          border: 'none',
                          position: 'relative',
                          cursor: 'pointer',
                          transition: 'all 0.3s ease',
                          boxShadow: qrGradingMode ? '0 2px 8px rgba(102, 126, 234, 0.3)' : 'none'
                        }}
                      >
                        <div style={{
                          position: 'absolute',
                          left: qrGradingMode ? 26 : 2,
                          top: 2,
                          width: 20,
                          height: 20,
                          borderRadius: '50%',
                          background: '#fff',
                          boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
                          transition: 'left 0.3s ease'
                        }} />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Main Content Area */}
            <div style={{ display: 'flex', gap: 32, minHeight: 500 }}>
              {/* Student List */}
              <div style={{ 
                flex: 2, 
                background: '#fff', 
                borderRadius: 24, 
                boxShadow: '0 4px 20px rgba(0,0,0,0.08)', 
                border: '1px solid #f0f0f0',
                overflow: 'hidden'
              }}>
                <div style={{ padding: '24px 32px', borderBottom: '1px solid #f0f0f0' }}>
                  <h3 style={{ fontWeight: 700, fontSize: 20, color: '#2d3748', margin: 0 }}>
                    Student Submissions ({submissionsState.length})
                  </h3>
                </div>
                
                <div style={{ maxHeight: 600, overflowY: 'auto' }}>
                  {submissionsState.length === 0 ? (
                    <div style={{ 
                      padding: '80px 40px', 
                      textAlign: 'center', 
                      color: '#718096' 
                    }}>
                      <div style={{
                        width: 80,
                        height: 80,
                        background: '#f7fafc',
                        borderRadius: '50%',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        margin: '0 auto 24px auto'
                      }}>
                        <i className="ni ni-single-02" style={{ fontSize: 32, color: '#a0aec0' }} />
                      </div>
                      <h3 style={{ fontSize: 20, fontWeight: 600, margin: '0 0 12px 0' }}>
                        {task.assignment_type === 'individual' ? 'No students assigned' : 'No submissions yet'}
                      </h3>
                      <p style={{ fontSize: 16, margin: 0 }}>
                        {task.assignment_type === 'individual' 
                          ? 'No students have been assigned to this task yet.' 
                          : 'Students haven\'t submitted their work yet.'
                        }
                      </p>
                    </div>
                  ) : (
                    submissionsState.map((s) => (
                      <div
                        key={s.submission_id}
                        onClick={!qrGradingMode ? () => setSelectedStudentId(s.submission_id) : undefined}
                        style={{
                          padding: '20px 32px',
                          borderBottom: '1px solid #f0f0f0',
                          cursor: !qrGradingMode ? 'pointer' : 'default',
                          transition: 'all 0.3s ease',
                          background: !qrGradingMode && selectedStudentId === s.submission_id ? '#f8fafc' : '#fff',
                          borderLeft: !qrGradingMode && selectedStudentId === s.submission_id ? '4px solid #667eea' : '4px solid transparent'
                        }}
                      >
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                            <img 
                              src={getProfilePicUrl(s.profile_pic) || `https://ui-avatars.com/api/?name=${s.student_name}&background=random`} 
                              alt="avatar" 
                              style={{ 
                                width: 48, 
                                height: 48, 
                                borderRadius: '50%', 
                                objectFit: 'cover',
                                border: '2px solid #e2e8f0'
                              }} 
                            />
                            <div>
                              <div style={{ fontWeight: 700, fontSize: 16, color: '#2d3748', marginBottom: 4 }}>
                                {s.student_name}
                              </div>
                              <div style={{ fontSize: 14, color: '#718096' }}>
                                {s.student_num}
                                {s.status === 'assigned' && (
                                  <span style={{
                                    background: '#fef5e7',
                                    color: '#d69e2e',
                                    padding: '2px 8px',
                                    borderRadius: 8,
                                    fontSize: 12,
                                    fontWeight: 600,
                                    marginLeft: 8
                                  }}>
                                    Assigned
                                  </span>
                                )}
                              </div>
                            </div>
                          </div>
                          
                          <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                            <div style={{ textAlign: 'center' }}>
                              <div style={{ 
                                fontWeight: 700, 
                                fontSize: 18, 
                                color: s.grade !== null ? '#48bb78' : '#a0aec0'
                              }}>
                                {s.grade !== null ? `${s.grade}/${task.points}` : `--/${task.points}`}
                              </div>
                              <div style={{ fontSize: 12, color: '#718096' }}>Score</div>
                            </div>
                            
                            {s.attachments && s.attachments.length > 0 ? (
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  const firstAttachment = s.attachments[0];
                                  handleOpenModal(
                                    { 
                                      name: firstAttachment.original_name || firstAttachment.file_name, 
                                      url: getFileUrl(firstAttachment.attachment_url || firstAttachment.file_path)
                                    },
                                    s
                                  );
                                }}
                                style={{
                                  padding: '8px 16px',
                                  background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                                  color: '#fff',
                                  border: 'none',
                                  borderRadius: 12,
                                  fontWeight: 600,
                                  fontSize: 14,
                                  cursor: 'pointer',
                                  transition: 'all 0.3s ease',
                                  boxShadow: '0 2px 8px rgba(102, 126, 234, 0.3)'
                                }}
                              >
                                View ({s.attachments.length})
                              </button>
                            ) : s.status === 'assigned' ? (
                              <span style={{ 
                                color: '#a0aec0', 
                                fontSize: 14,
                                fontStyle: 'italic'
                              }}>
                                Waiting
                              </span>
                            ) : (
                              <span style={{ 
                                color: '#a0aec0', 
                                fontSize: 14
                              }}>
                                No file
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
              
              {/* Grading Panel */}
              {qrGradingMode ? (
                <QRGradingPanel student={submissionsState} onGradeSubmit={handleQRGradeSubmit} />
              ) : (
                <div style={{ 
                  width: 380, 
                  background: '#fff', 
                  borderRadius: 24, 
                  boxShadow: '0 4px 20px rgba(0,0,0,0.08)', 
                  border: '1px solid #f0f0f0',
                  padding: '32px',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  minHeight: 500
                }}>
                  {selectedStudent ? (
                    <div style={{ textAlign: 'center', width: '100%' }}>
                      <img 
                        src={getProfilePicUrl(selectedStudent.profile_pic) || `https://ui-avatars.com/api/?name=${selectedStudent.student_name}&background=random`} 
                        alt={selectedStudent.student_name} 
                        style={{ 
                          width: 80, 
                          height: 80, 
                          borderRadius: '50%', 
                          objectFit: 'cover', 
                          border: '3px solid #e2e8f0',
                          marginBottom: 20
                        }} 
                      />
                      <h3 style={{ 
                        fontWeight: 700, 
                        fontSize: 24, 
                        color: '#2d3748', 
                        margin: '0 0 8px 0' 
                      }}>
                        {selectedStudent.student_name}
                      </h3>
                      <div style={{ 
                        color: '#718096', 
                        fontWeight: 500, 
                        fontSize: 16, 
                        marginBottom: 20 
                      }}>
                        {selectedStudent.status}
                      </div>
                      
                      {selectedStudent.grade !== null && (
                        <div style={{ 
                          background: 'linear-gradient(135deg, #48bb78 0%, #38a169 100%)',
                          color: '#fff',
                          padding: '16px 24px',
                          borderRadius: 16,
                          marginBottom: 24,
                          boxShadow: '0 4px 12px rgba(72, 187, 120, 0.3)'
                        }}>
                          <div style={{ fontSize: 14, opacity: 0.9, marginBottom: 4 }}>Current Score</div>
                          <div style={{ fontWeight: 700, fontSize: 24 }}>
                            {selectedStudent.grade}/{task.points}
                          </div>
                        </div>
                      )}
                      
                      {selectedStudent.attachments && selectedStudent.attachments.length > 0 ? (
                        <div style={{ marginBottom: 24 }}>
                          <div style={{ 
                            color: '#667eea', 
                            fontSize: 16, 
                            fontWeight: 600, 
                            marginBottom: 8 
                          }}>
                            Submitted Files ({selectedStudent.attachments.length})
                          </div>
                          {selectedStudent.attachments.map((attachment, index) => (
                            <button
                              key={attachment.attachment_id || index}
                              onClick={() => handleOpenModal(
                                { 
                                  name: attachment.original_name || attachment.file_name, 
                                  url: getFileUrl(attachment.attachment_url || attachment.file_path)
                                },
                                selectedStudent
                              )}
                              style={{
                                padding: '12px 24px',
                                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                                color: '#fff',
                                border: 'none',
                                borderRadius: 12,
                                fontWeight: 600,
                                fontSize: 14,
                                cursor: 'pointer',
                                transition: 'all 0.3s ease',
                                boxShadow: '0 4px 12px rgba(102, 126, 234, 0.3)',
                                width: '100%',
                                marginBottom: index < selectedStudent.attachments.length - 1 ? 8 : 0
                              }}
                            >
                              <i className="ni ni-single-copy-04 mr-2" />
                              View {attachment.original_name || attachment.file_name}
                            </button>
                          ))}
                          <div style={{ 
                            color: '#718096', 
                            fontSize: 14, 
                            marginTop: 8 
                          }}>
                            {selectedStudent.attachments.length} file{selectedStudent.attachments.length > 1 ? 's' : ''} submitted
                          </div>
                        </div>
                      ) : (
                        <div style={{ 
                          padding: '24px', 
                          background: '#f8fafc', 
                          borderRadius: 16, 
                          border: '2px dashed #cbd5e0',
                          color: '#718096',
                          textAlign: 'center'
                        }}>
                          <i className="ni ni-folder-17" style={{ fontSize: 32, color: '#a0aec0', marginBottom: 12 }} />
                          <div style={{ fontSize: 16, fontWeight: 600, marginBottom: 8 }}>No file submitted</div>
                          <div style={{ fontSize: 14 }}>Student hasn't uploaded any files yet</div>
                        </div>
                      )}
                    </div>
                  ) : (
                    <div style={{ textAlign: 'center', color: '#718096' }}>
                      <div style={{
                        width: 80,
                        height: 80,
                        background: '#f7fafc',
                        borderRadius: '50%',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        margin: '0 auto 24px auto'
                      }}>
                        <i className="ni ni-single-02" style={{ fontSize: 32, color: '#a0aec0' }} />
                      </div>
                      <h3 style={{ fontSize: 20, fontWeight: 600, margin: '0 0 12px 0' }}>No student selected</h3>
                      <p style={{ fontSize: 16, margin: 0 }}>Click on a student to view their submission</p>
                    </div>
                  )}
                </div>
              )}
            </div>
            {/* Modal for file preview */}
            <Modal isOpen={modalOpen} toggle={() => setModalOpen(false)} size="xl" centered style={{ maxWidth: '98vw', width: '98vw' }} contentClassName="p-0" backdropClassName="modal-backdrop-blur">
              <ModalBody style={{ padding: 0, borderRadius: 16, overflow: 'hidden', minHeight: '90vh', height: '90vh', maxHeight: '95vh', width: '100vw', maxWidth: '100vw' }}>
                <div style={{ display: 'flex', flexDirection: 'row', height: '100%' }}>
                  {renderModalContent()}
                  <Button color="secondary" onClick={() => setModalOpen(false)} style={{ position: 'absolute', top: 18, right: 24, zIndex: 10, borderRadius: 20, fontWeight: 700, fontSize: 24, padding: '2px 20px', background: '#fff', color: '#222', border: 'none', boxShadow: '0 2px 8px #324cdd22' }}>×</Button>
                </div>
              </ModalBody>
                         </Modal>
           </TabPane>
         </TabContent>
         
         {/* PDF Preview Modal */}
          <Modal isOpen={pdfModalOpen} toggle={() => setPdfModalOpen(false)} size="xl" centered style={{ maxWidth: '95vw', width: '95vw' }} contentClassName="p-0" backdropClassName="modal-backdrop-blur">
            <ModalBody style={{ padding: 0, borderRadius: 16, overflow: 'hidden', minHeight: '90vh', height: '90vh', maxHeight: '95vh', width: '100%' }}>
             <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
               {/* Header */}
               <div style={{ 
                 background: '#fff', 
                 padding: '16px 24px', 
                 borderBottom: '1px solid #e9ecef',
                 display: 'flex',
                 alignItems: 'center',
                 justifyContent: 'space-between'
               }}>
                 <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                   {getFileTypeIcon({ name: pdfModalFile?.name, type: 'file' })}
                   <div>
                     <div style={{ fontWeight: 600, color: '#333', fontSize: 16 }}>
                       {pdfModalFile?.name || 'Document'}
                     </div>
                     <div style={{ color: '#666', fontSize: 12 }}>
                       {(pdfModalFile?.name || '').split('.').pop().toUpperCase() || 'FILE'} Document
                     </div>
                   </div>
                 </div>
                  {/* Zoom controls are hidden when using iframe preview */}
               </div>
               
                {/* File Content */}
                <div style={{ flex: 1, background: '#f8fafc', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px', overflow: 'auto' }}>
                  {pdfModalFile && (() => {
                    const rawUrl = (pdfModalFile.url || '');
                    const url = rawUrl.toLowerCase();
                    const isPdf = url.endsWith('.pdf');
                    const isImage = /\.(png|jpg|jpeg|gif|webp)$/.test(url);
                    const isVideo = /\.(mp4|webm|ogg|mov|mkv|avi)$/.test(url);
                    const isAudio = /\.(mp3|wav|ogg|aac|flac|m4a)$/.test(url);
                    if (isPdf) {
                      return (
                        <iframe title="PDF Preview" src={pdfModalFile.url} style={{ width: '100%', height: '100%', border: 'none', background: '#fff' }} />
                      );
                    }
                    if (isImage) {
                      return (
                        <img alt={pdfModalFile.name} src={pdfModalFile.url} style={{ maxWidth: '100%', maxHeight: '100%', borderRadius: 8, boxShadow: '0 2px 8px #00000022' }} />
                      );
                    }
                    if (isVideo) {
                      return (
                        <video controls style={{ width: '100%', maxHeight: '100%', borderRadius: 8, boxShadow: '0 2px 8px #00000022', background: '#000' }}>
                          <source src={pdfModalFile.url} type="video/mp4" />
                          Your browser does not support the video tag.
                        </video>
                      );
                    }
                    if (isAudio) {
                      return (
                        <div style={{
                          width: '100%',
                          maxWidth: 900,
                          background: 'linear-gradient(135deg, #232526 0%, #414345 100%)',
                          borderRadius: 24,
                          padding: 28,
                          boxShadow: '0 16px 32px rgba(0,0,0,0.35)',
                          display: 'flex',
                          flexDirection: 'column',
                          alignItems: 'center',
                          position: 'relative',
                          overflow: 'hidden'
                        }}>
                          {/* Animated Disk */}
                          <div style={{
                            width: 110,
                            height: 110,
                            borderRadius: '50%',
                            background: 'radial-gradient(circle at 30% 30%, #d9d9d9 0%, #bdbdbd 45%, #9e9e9e 60%, #757575 100%)',
                            boxShadow: audioPlaying ? '0 12px 28px rgba(0,0,0,0.45)' : '0 6px 14px rgba(0,0,0,0.25)',
                            marginBottom: 20,
                            animation: audioPlaying ? 'spin 6s linear infinite' : 'none'
                          }} />

                          {/* Visualizer bars */}
                          <div style={{ display: 'flex', gap: 4, height: 40, marginBottom: 16 }}>
                            {[...Array(24)].map((_, i) => (
                              <div key={i} style={{
                                width: 6,
                                borderRadius: 3,
                                background: 'rgba(255,255,255,0.35)',
                                height: audioPlaying ? (12 + Math.abs(Math.sin((Date.now()/150)+(i*0.7))) * 28) : 14,
                                transition: 'height 120ms linear'
                              }} />
                            ))}
                          </div>

                          {/* Audio element */}
                          <audio
                            controls
                            style={{ width: '100%', maxWidth: 640, borderRadius: 12, background: '#fff', zIndex: 2 }}
                            src={pdfModalFile.url}
                            onPlay={() => setAudioPlaying(true)}
                            onPause={() => setAudioPlaying(false)}
                            onEnded={() => setAudioPlaying(false)}
                          />

                          {/* File info */}
                          <div style={{
                            marginTop: 14,
                            color: '#e0e0e0',
                            fontWeight: 700,
                            letterSpacing: 0.3
                          }}>{pdfModalFile.name || 'Audio'}</div>

                          {/* Floating particles */}
                          {[...Array(18)].map((_, i) => (
                            <div key={i} style={{
                              position: 'absolute',
                              top: `${Math.random()*100}%`,
                              left: `${Math.random()*100}%`,
                              width: 6,
                              height: 6,
                              borderRadius: '50%',
                              background: 'rgba(255,255,255,0.08)',
                              filter: 'blur(1px)',
                              animation: `floatY ${6 + Math.random()*6}s ease-in-out ${Math.random()*2}s infinite`
                            }} />
                          ))}

                          {/* bottom wave */}
                          <div style={{ position: 'absolute', bottom: -1, left: 0, right: 0, opacity: 0.12 }}>
                            <svg height="60" width="100%" preserveAspectRatio="none" viewBox="0 0 1440 80">
                              <path d="M0,40 Q360,80 720,40 T1440,40 V80 H0 Z" fill="#ffffff" />
                            </svg>
                          </div>

                          <style>{`
                            @keyframes spin { from { transform: rotate(0deg);} to { transform: rotate(360deg);} }
                            @keyframes floatY { 0% { transform: translateY(0);} 50% { transform: translateY(-12px);} 100% { transform: translateY(0);} }
                          `}</style>
                        </div>
                      );
                    }
                    return (
                      <div style={{ textAlign: 'center', color: '#666' }}>
                        <div style={{ marginBottom: 12 }}>Preview not available for this file type.</div>
                        <Button color="primary" onClick={() => window.open(pdfModalFile.url, '_blank', 'noopener,noreferrer')}>Open in new tab</Button>
                      </div>
                    );
                  })()}
                </div>
               
               {/* Close button */}
               <Button 
                 color="secondary" 
                 onClick={() => setPdfModalOpen(false)} 
                 style={{ 
                   position: 'absolute', 
                   top: 20, 
                   right: 20, 
                   zIndex: 10, 
                   borderRadius: 20, 
                   fontWeight: 700, 
                   fontSize: 20, 
                   padding: '2px 16px', 
                   background: '#fff', 
                   color: '#222', 
                   border: 'none', 
                   boxShadow: '0 2px 8px #324cdd22' 
                 }}
               >
                 ×
               </Button>
             </div>
           </ModalBody>
         </Modal>
       </div>
     </div>
   );
 };

export default TaskDetail; 