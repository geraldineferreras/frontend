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

  // Helpers to handle due date logic
  const parseDueDate = () => {
    try {
      const raw = assignment?.due_date;
      if (!raw) return null;
      if (raw instanceof Date) return raw;
      if (typeof raw === 'string') {
        // Normalize common formats: 'YYYY-MM-DD', 'YYYY-MM-DD HH:MM:SS', ISO
        let normalized = raw.trim();
        if (/^\d{4}-\d{2}-\d{2}$/.test(normalized)) {
          // Date only: treat as end of day local time
          normalized = `${normalized}T23:59:59`;
        } else if (/^\d{4}-\d{2}-\d{2}\s+\d{2}:\d{2}(:\d{2})?$/.test(normalized)) {
          // Space-separated date-time: convert space to 'T'
          normalized = normalized.replace(' ', 'T');
        }
        const dt = new Date(normalized);
        if (!isNaN(dt.getTime())) return dt;
      }
    } catch (_) {
      // ignore
    }
    return null;
  };

  const isPastDue = () => {
    const due = parseDueDate();
    if (!due) return false;
    return Date.now() > due.getTime();
  };

  // Fetch assignment details and submission data
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError(null);
      try {
        console.log('Fetching assignment details for ID:', assignmentId);
        // Prefer full task details (includes attachments), fallback to student endpoint if needed
        let response = null;
        try {
          response = await apiService.getTaskDetails(assignmentId);
        } catch (e) {
          console.warn('getTaskDetails failed, falling back to student task details:', e?.message || e);
        }
        if (!response || !response.status) {
          response = await apiService.getStudentTaskDetails(assignmentId);
        }
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

            // If no attachments present, try to fetch full details again (teacher endpoint)
            if ((!cloned.attachments || cloned.attachments.length === 0)) {
              try {
                const alt = await apiService.getTaskDetails(assignmentId);
                if (alt && alt.status && alt.data && Array.isArray(alt.data.attachments) && alt.data.attachments.length > 0) {
                  cloned.attachments = alt.data.attachments;
                } else if (alt && alt.status && alt.data && alt.data.attachment_url) {
                  cloned.attachments = [
                    {
                      attachment_url: alt.data.attachment_url,
                      attachment_type: alt.data.attachment_type || 'file',
                      original_name: alt.data.original_name || (typeof alt.data.attachment_url === 'string' ? alt.data.attachment_url.split('/').pop() : 'Attachment'),
                    }
                  ];
                }
              } catch (_) {
                // ignore if not allowed
              }
            }

            if (tasksToRun.length > 0) {
              await Promise.all(tasksToRun);
            }
            return cloned;
          };

          const enriched = await enrichWithOriginalNames(response.data);
          setAssignment(enriched);

          // Fallback: if attachments are still missing, try fetching student tasks list and merge
          if (!enriched.attachments || enriched.attachments.length === 0) {
            try {
              const cc = classCode || enriched.class_code || (Array.isArray(enriched.class_codes) ? enriched.class_codes[0] : undefined);
              if (cc) {
                const listResp = await apiService.getStudentTasks({ classCode: cc, type: 'assignment' });
                const list = (listResp && listResp.data) ? listResp.data : [];
                if (Array.isArray(list) && list.length > 0) {
                  const found = list.find(t => String(t.task_id || t.id) === String(assignmentId));
                  if (found) {
                    const merged = { ...enriched };
                    if (Array.isArray(found.attachments) && found.attachments.length > 0) {
                      merged.attachments = found.attachments;
                    } else if (found.attachment_url) {
                      merged.attachments = [{
                        attachment_url: found.attachment_url,
                        attachment_type: found.attachment_type || 'file',
                        original_name: found.original_name || (typeof found.attachment_url === 'string' ? found.attachment_url.split('/').pop() : 'Attachment')
                      }];
                    }
                    setAssignment(merged);
                  }
                }
              }
            } catch (_) {
              // ignore if not available for student
            }
          }
          console.log('Assignment details loaded:', response.data);
          
          // Fetch submission data using the correct endpoint
          const finalClassCode = classCode || response.data.class_code || (Array.isArray(response.data.class_codes) ? response.data.class_codes[0] : undefined);
          if (finalClassCode) {
            let submissionFound = false;
            
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
                submissionFound = true;
                console.log('Submission data loaded:', submissionResponse.data);
              }
            } catch (submissionError) {
              console.log('No submission found or error fetching submission:', submissionError);
              // This is normal if no submission exists yet
            }

            // Fallback: If no submission found, try fetching all submissions and pick current student's
            if (!submissionFound) {
              try {
                const allSubsResp = await apiService.getTaskSubmissions(assignmentId);
                const allSubs = allSubsResp?.data?.submissions || allSubsResp?.data || [];
                console.log('All submissions:', allSubs);
                
                // Determine current student's identifiers
                let current = null;
                try {
                  current = JSON.parse(localStorage.getItem('user') || localStorage.getItem('scms_logged_in_user') || '{}');
                } catch (_) { current = {}; }
                
                const candidateIds = [current.student_num, current.student_id, current.id]
                  .filter((v) => v !== undefined && v !== null)
                  .map((v) => String(v));
                
                console.log('Looking for student with IDs:', candidateIds);
                
                // Find current student's submission
                const mine = allSubs.find((s) => {
                  const sidCandidates = [s.student_num, s.student_id, s.id]
                    .filter((v) => v !== undefined && v !== null)
                    .map((v) => String(v));
                  return candidateIds.some((id) => sidCandidates.includes(id));
                });
                
                if (mine) {
                  console.log('Found submission from all submissions:', mine);
                  setSubmission(mine);
                  submissionFound = true;
                }
              } catch (fallbackErr) {
                console.warn('Fallback to all submissions failed:', fallbackErr);
              }
            }

            // CRITICAL FIX: If submission exists but has no attachments, try to get attachments from all submissions
            if (submission && (!submission.attachments || submission.attachments.length === 0)) {
              console.log('Submission exists but has no attachments, trying to get from all submissions...');
              try {
                const allSubsResp = await apiService.getTaskSubmissions(assignmentId);
                const allSubs = allSubsResp?.data?.submissions || allSubsResp?.data || [];
                
                // Find current student's submission with attachments
                let current = null;
                try {
                  current = JSON.parse(localStorage.getItem('user') || localStorage.getItem('scms_logged_in_user') || '{}');
                } catch (_) { current = {}; }
                
                const candidateIds = [current.student_num, current.student_id, current.id]
                  .filter((v) => v !== undefined && v !== null)
                  .map((v) => String(v));
                
                const mineWithAttachments = allSubs.find((s) => {
                  const sidCandidates = [s.student_num, s.student_id, s.id]
                    .filter((v) => v !== undefined && v !== null)
                    .map((v) => String(v));
                  return candidateIds.some((id) => sidCandidates.includes(id)) && 
                         s.attachments && s.attachments.length > 0;
                });
                
                if (mineWithAttachments) {
                  console.log('Found submission with attachments from all submissions:', mineWithAttachments);
                  // Merge the existing submission data with the attachments
                  setSubmission({
                    ...submission,
                    attachments: mineWithAttachments.attachments
                  });
                }
              } catch (error) {
                console.warn('Failed to get attachments from all submissions:', error);
              }
            }

            // Final fallback: use student/assigned endpoint (contains grade/status even without file submissions)
            if (!submissionFound) {
              try {
                const assignedResp = await apiService.getStudentAssignedTasks(finalClassCode);
                const list = assignedResp?.data || [];
                const found = list.find((t) => String(t.task_id || t.id) === String(assignmentId));
                if (found && (found.grade !== undefined || found.submission_status)) {
                  console.log('Found submission from assigned tasks:', found);
                  setSubmission({
                    submission_id: found.submission_id,
                    grade: found.grade !== undefined && found.grade !== null ? Number(found.grade) : null,
                    status: found.submission_status || 'graded',
                    submitted_at: found.submitted_at,
                    feedback: found.feedback,
                    attachments: found.attachments || [],
                  });
                  submissionFound = true;
                }
              } catch (assignedErr) {
                console.warn('Fallback to assigned tasks failed:', assignedErr);
              }
            }
            
            // If still no submission found, set an empty submission object
            if (!submissionFound) {
              console.log('No submission found, setting empty submission');
              setSubmission({
                status: 'not_submitted',
                attachments: [],
                grade: null,
                feedback: null
              });
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
      case 'not_submitted': return '#dc3545';
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
    
    // Use the API service's getFilePreviewUrl function for consistency
    return apiService.getFilePreviewUrl(filePath, false);
  };

  // Helper to get file type, icon, and preview (same as teacher side)
  const getFileTypeIconOrPreview = (att) => {
    // Handle different attachment types
    if (!att) {
      return { preview: <svg width="32" height="40" viewBox="0 0 32 40" fill="none" xmlns="http://www.w3.org/2000/svg"><rect width="32" height="40" rx="6" fill="#fff" stroke="#90A4AE" strokeWidth="2"/><path d="M8 8h16v24H8z" fill="#fff"/><text x="16" y="28" textAnchor="middle" fontSize="10" fill="#90A4AE" fontWeight="bold">FILE</text></svg>, type: 'FILE', color: '#90A4AE' };
    }

    // Handle link attachments
    if (att.type === "Link" && att.url) {
      return { preview: <svg width="32" height="40" viewBox="0 0 32 40" fill="none" xmlns="http://www.w3.org/2000/svg"><rect width="32" height="40" rx="6" fill="#fff" stroke="#1976D2" strokeWidth="2"/><path d="M8 8h16v24H8z" fill="#fff"/><text x="16" y="28" textAnchor="middle" fontSize="10" fill="#1976D2" fontWeight="bold">LINK</text></svg>, type: 'LINK', color: '#1976D2' };
    }

    // Handle YouTube attachments
    if (att.type === "YouTube" && att.url) {
      return { preview: <svg width="32" height="40" viewBox="0 0 32 40" fill="none" xmlns="http://www.w3.org/2000/svg"><rect width="32" height="40" rx="6" fill="#fff" stroke="#FF0000" strokeWidth="2"/><path d="M8 8h16v24H8z" fill="#fff"/><text x="16" y="28" textAnchor="middle" fontSize="10" fill="#FF0000" fontWeight="bold">YT</text></svg>, type: 'YOUTUBE', color: '#FF0000' };
    }

    // Handle Google Drive attachments
    if (att.type === "Google Drive" && att.url) {
      return { preview: <svg width="32" height="40" viewBox="0 0 32 40" fill="none" xmlns="http://www.w3.org/2000/svg"><rect width="32" height="40" rx="6" fill="#fff" stroke="#4285F4" strokeWidth="2"/><path d="M8 8h16v24H8z" fill="#fff"/><text x="16" y="28" textAnchor="middle" fontSize="10" fill="#4285F4" fontWeight="bold">DRIVE</text></svg>, type: 'GOOGLE DRIVE', color: '#4285F4' };
    }

    // Handle alternative type values (case-insensitive and with underscores)
    if (att.type && att.url) {
      const typeLower = att.type.toLowerCase().replace(/_/g, ' ');
      
      if (typeLower === "link") {
        return { preview: <svg width="32" height="40" viewBox="0 0 32 40" fill="none" xmlns="http://www.w3.org/2000/svg"><rect width="32" height="40" rx="6" fill="#fff" stroke="#1976D2" strokeWidth="2"/><path d="M8 8h16v24H8z" fill="#fff"/><text x="16" y="28" textAnchor="middle" fontSize="10" fill="#1976D2" fontWeight="bold">LINK</text></svg>, type: 'LINK', color: '#1976D2' };
      }
      
      if (typeLower === "youtube") {
        return { preview: <svg width="32" height="40" viewBox="0 0 32 40" fill="none" xmlns="http://www.w3.org/2000/svg"><rect width="32" height="40" rx="6" fill="#fff" stroke="#FF0000" strokeWidth="2"/><path d="M8 8h16v24H8z" fill="#fff"/><text x="16" y="28" textAnchor="middle" fontSize="10" fill="#FF0000" fontWeight="bold">YT</text></svg>, type: 'YOUTUBE', color: '#FF0000' };
      }
      
      if (typeLower === "google drive" || typeLower === "googledrive") {
        return { preview: <svg width="32" height="40" viewBox="0 0 32 40" fill="none" xmlns="http://www.w3.org/2000/svg"><rect width="32" height="40" rx="6" fill="#fff" stroke="#4285F4" strokeWidth="2"/><path d="M8 8h16v24H8z" fill="#fff"/><text x="16" y="28" textAnchor="middle" fontSize="10" fill="#4285F4" fontWeight="bold">DRIVE</text></svg>, type: 'GOOGLE DRIVE', color: '#4285F4' };
      }
    }

    // Handle file attachments
    const fileName = att.name || att.original_name || att.file_name || (att.attachment_url ? att.attachment_url.split('/').pop() : '');
    if (!fileName || typeof fileName !== 'string') {
      return { preview: <svg width="32" height="40" viewBox="0 0 32 40" fill="none" xmlns="http://www.w3.org/2000/svg"><rect width="32" height="40" rx="6" fill="#fff" stroke="#90A4AE" strokeWidth="2"/><path d="M8 8h16v24H8z" fill="#fff"/><text x="16" y="28" textAnchor="middle" fontSize="10" fill="#90A4AE" fontWeight="bold">FILE</text></svg>, type: 'FILE', color: '#90A4AE' };
    }

    const ext = fileName.split('.').pop().toLowerCase();
    const imageTypes = ['jpg', 'jpeg', 'png', 'gif', 'webp', 'bmp', 'svg'];

    // Microsoft Word
    const wordExts = ['doc', 'docx', 'dot', 'dotx', 'docm', 'dotm'];
    if (wordExts.includes(ext)) {
      return { preview: <svg width="32" height="40" viewBox="0 0 32 40" fill="none" xmlns="http://www.w3.org/2000/svg"><rect width="32" height="40" rx="6" fill="#fff" stroke="#1976D2" strokeWidth="2"/><path d="M8 8h16v24H8z" fill="#fff"/><text x="16" y="28" textAnchor="middle" fontSize="10" fill="#1976D2" fontWeight="bold">WORD</text></svg>, type: 'WORD', color: '#1976D2' };
    }
    // Microsoft Excel (including CSV)
    const excelExts = ['xls', 'xlsx', 'xlsm', 'xlsb', 'xlt', 'xltx', 'xltm', 'csv'];
    if (excelExts.includes(ext)) {
      return { preview: <svg width="32" height="40" viewBox="0 0 32 40" fill="none" xmlns="http://www.w3.org/2000/svg"><rect width="32" height="40" rx="6" fill="#fff" stroke="#388E3C" strokeWidth="2"/><path d="M8 8h16v24H8z" fill="#fff"/><text x="16" y="28" textAnchor="middle" fontSize="10" fill="#388E3C" fontWeight="bold">EXCEL</text></svg>, type: 'EXCEL', color: '#388E3C' };
    }
    // Microsoft PowerPoint
    const pptExts = ['ppt', 'pptx', 'pps', 'ppsx', 'pptm', 'potx', 'potm', 'ppsm'];
    if (pptExts.includes(ext)) {
      return { preview: <svg width="32" height="40" viewBox="0 0 32 40" fill="none" xmlns="http://www.w3.org/2000/svg"><rect width="32" height="40" rx="6" fill="#fff" stroke="#FF9800" strokeWidth="2"/><path d="M8 8h16v24H8z" fill="#fff"/><text x="16" y="28" textAnchor="middle" fontSize="10" fill="#FF9800" fontWeight="bold">PPT</text></svg>, type: 'PPT', color: '#FF9800' };
    }
    // TXT
    if (ext === 'txt') {
      return { preview: <svg width="32" height="40" viewBox="0 0 32 40" fill="none" xmlns="http://www.w3.org/2000/svg"><rect width="32" height="40" rx="6" fill="#fff" stroke="#607d8b" strokeWidth="2"/><path d="M8 8h16v24H8z" fill="#fff"/><text x="16" y="28" textAnchor="middle" fontSize="10" fill="#607d8b" fontWeight="bold">TXT</text></svg>, type: 'TXT', color: '#607d8b' };
    }

    if (imageTypes.includes(ext) && att.file) {
      const url = URL.createObjectURL(att.file);
      return { preview: <img src={url} alt={fileName} style={{ width: 32, height: 40, objectFit: 'cover', borderRadius: 6, border: '1px solid #e9ecef' }} />, type: ext.toUpperCase(), color: '#90A4AE' };
    }
    if (ext === 'mp4') return { preview: <svg width="32" height="40" viewBox="0 0 32 40" fill="none" xmlns="http://www.w3.org/2000/svg"><rect width="32" height="40" rx="6" fill="#fff" stroke="#8e24aa" strokeWidth="2"/><path d="M8 8h16v24H8z" fill="#fff"/><text x="16" y="28" textAnchor="middle" fontSize="10" fill="#8e24aa" fontWeight="bold">MP4</text></svg>, type: 'MP4', color: '#8e24aa' };
    if (ext === 'mp3') return { preview: <svg width="32" height="40" viewBox="0 0 32 40" fill="none" xmlns="http://www.w3.org/2000/svg"><rect width="32" height="40" rx="6" fill="#fff" stroke="#43a047" strokeWidth="2"/><path d="M8 8h16v24H8z" fill="#fff"/><text x="16" y="28" textAnchor="middle" fontSize="10" fill="#43a047" fontWeight="bold">MP3</text></svg>, type: 'MP3', color: '#43a047' };
    if (ext === 'pdf') return { preview: <svg width="32" height="40" viewBox="0 0 32 40" fill="none" xmlns="http://www.w3.org/2000/svg"><rect width="32" height="40" rx="6" fill="#fff" stroke="#F44336" strokeWidth="2"/><path d="M8 8h16v24H8z" fill="#fff"/><text x="16" y="28" textAnchor="middle" fontSize="10" fill="#F44336" fontWeight="bold">PDF</text></svg>, type: 'PDF', color: '#F44336' };
    return { preview: <svg width="32" height="40" viewBox="0 0 32 40" fill="none" xmlns="http://www.w3.org/2000/svg"><rect width="32" height="40" rx="6" fill="#fff" stroke="#90A4AE" strokeWidth="2"/><path d="M8 8h16v24H8z" fill="#fff"/><text x="16" y="28" textAnchor="middle" fontSize="10" fill="#90A4AE" fontWeight="bold">FILE</text></svg>, type: ext.toUpperCase(), color: '#90A4AE' };
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

  // Icon-only back button with hover effects
  const BackArrowButton = ({ onClick }) => {
    const [hovered, setHovered] = useState(false);
    return (
      <button
        aria-label="Back to Classwork"
        onClick={onClick}
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
        style={{
          width: 46,
          height: 38,
          borderRadius: 12,
          border: '1px solid #d7dbff',
          background: hovered ? '#324cdd' : '#e6e8ff',
          color: hovered ? '#ffffff' : '#324cdd',
          display: 'inline-flex',
          alignItems: 'center',
          justifyContent: 'center',
          boxShadow: hovered ? '0 10px 20px rgba(50, 76, 221, 0.25)' : '0 2px 8px rgba(0,0,0,0.08)',
          cursor: 'pointer',
          transition: 'all 180ms ease',
        }}
      >
        <span
          style={{
            fontSize: 18,
            fontWeight: 800,
            transform: hovered ? 'translateX(-2px)' : 'translateX(0)',
            transition: 'transform 180ms ease',
          }}
        >
          ←
        </span>
      </button>
    );
  };

  const handleSubmitFiles = async () => {
    // Block submission after due date
    if (isPastDue()) {
      setUploadError('Work cannot be turned in after the due date.');
      return;
    }
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
        {/* Back button (icon only) */}
        <div style={{ marginBottom: 12 }}>
          <BackArrowButton onClick={() => {
            const cc = (assignment && (assignment.class_code || (Array.isArray(assignment.class_codes) ? assignment.class_codes[0] : null))) || classCode;
            if (cc) {
              navigate(`/student/classroom/${cc}?tab=classwork`);
            } else {
              navigate(-1);
            }
          }} />
        </div>

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
          <div style={{ fontSize: 14, color: '#6c757d', marginBottom: 8 }}>Your Score</div>
          
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
                  {assignment.due_date ? (parseDueDate()?.toLocaleString?.() || String(assignment.due_date)) : 'No due date set'}
               </div>
                {assignment.due_date && (
                  <Badge style={{
                    background: isPastDue() ? '#fdecea' : '#fff3cd',
                    color: isPastDue() ? '#b71c1c' : '#856404',
                    borderRadius: '20px',
                    padding: '8px 16px',
                    fontSize: '14px',
                    fontWeight: 600,
                    border: `1px solid ${isPastDue() ? '#f5c6cb' : '#ffeaa7'}`
                  }}>
                    {isPastDue() ? '⛔ Past Due' : '⚡ Due Soon'}
                  </Badge>
                )}
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
                     assignment.attachments.map((attachment, index) => {
                       const { preview, type, color } = getFileTypeIconOrPreview(attachment);
                       let url = undefined;
                       if (attachment.file && (attachment.file instanceof File || attachment.file instanceof Blob)) {
                         url = URL.createObjectURL(attachment.file);
                       } else if (attachment.url) {
                         url = attachment.url;
                       } else if (attachment.attachment_url) {
                         // Use the getFileUrl function for consistent URL construction
                         url = getFileUrl(attachment.attachment_url);
                       }
                       const isLink = attachment.type === "Link" || attachment.type === "YouTube" || attachment.type === "Google Drive" || 
                                    attachment.type === "link" || attachment.type === "youtube" || attachment.type === "google_drive" ||
                                    attachment.type === "googledrive" || (attachment.attachment_type && String(attachment.attachment_type).toLowerCase() !== 'file');
                       
                       // Ensure link URLs are absolute external URLs and remove localhost prefixes
                       let linkUrl = attachment.url;
                       if (isLink && linkUrl) {
                         // Remove localhost prefixes if they exist
                         if (linkUrl.includes('localhost/scms_new_backup/')) {
                           linkUrl = linkUrl.replace('http://localhost/scms_new_backup/', '');
                         } else if (linkUrl.includes('localhost/')) {
                           // Handle other localhost variations
                           linkUrl = linkUrl.replace(/^https?:\/\/localhost\/[^\/]*\//, '');
                         }
                         
                         // Ensure it's a valid external URL
                         if (!linkUrl.startsWith('http')) {
                           // If it's a relative URL, try to construct the full URL
                           if (linkUrl.startsWith('/')) {
                             linkUrl = window.location.origin + linkUrl;
                           } else {
                             // If it's just a path, assume it should be an external link
                             linkUrl = null; // Don't open invalid URLs
                           }
                         }
                       }
                       
                       const displayName = isLink ? (linkUrl || attachment.url) : (attachment.original_name || attachment.file_name || (attachment.attachment_url ? attachment.attachment_url.split('/').pop() : 'Assignment File'));
                       
                       return (
                         <div key={index} style={{
                           display: 'flex',
                           alignItems: 'center',
                           background: isLink ? `${color}08` : '#ffffff',
                           borderRadius: '12px',
                           padding: '16px',
                           marginBottom: '12px',
                           border: `2px solid ${isLink ? `${color}20` : '#e2e8f0'}`,
                           cursor: 'pointer',
                           transition: 'all 0.3s ease',
                           boxShadow: isLink ? `0 2px 12px ${color}15` : '0 2px 8px rgba(0,0,0,0.05)'
                         }} onClick={() => {
                           if (isLink && linkUrl) {
                             window.open(linkUrl, '_blank', 'noopener,noreferrer');
                           } else if (attachment.type === "YouTube" || attachment.type === "Google Drive" || attachment.type === "Link") {
                             // For YouTube, Google Drive, and Link types, always open in new tab
                             if (linkUrl) {
                               window.open(linkUrl, '_blank', 'noopener,noreferrer');
                             }
                           } else {
                             openPreview(attachment);
                           }
                         }}>
                           <div style={{
                             width: '50px',
                             height: '60px',
                             borderRadius: '8px',
                             display: 'flex',
                             alignItems: 'center',
                             justifyContent: 'center',
                             marginRight: '16px'
                           }}>
                             {preview}
                           </div>
                           <div style={{ flex: 1 }}>
                             <div style={{
                               fontWeight: 600,
                               fontSize: '16px',
                               color: '#2d3748',
                               marginBottom: '4px'
                             }}>
                                {displayName}
                             </div>
                             <div style={{
                               color: '#718096',
                               fontSize: '14px'
                             }}>
                                 {type}
                                 {url && <>&bull; <a href={url} download={attachment.original_name || attachment.file_name} style={{ color: color, fontWeight: 600, textDecoration: 'none' }} onClick={e => e.stopPropagation()}>Download</a></>}
                                 {isLink && <>&bull; <a href={linkUrl || attachment.url} target="_blank" rel="noopener noreferrer" style={{ color: color, fontWeight: 600, textDecoration: 'none' }} onClick={e => e.stopPropagation()}>View Link</a></>}
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
                       );
                     })
                     ) : assignment.attachment_url ? (
                     // Single attachment
                     (() => {
                       const attachment = { 
                         attachment_url: assignment.attachment_url, 
                         original_name: (assignment.original_name || resolvedAssignmentFileName || (assignment.attachment_url.startsWith('http') ? 'External Link' : assignment.attachment_url.split('/').pop())), 
                         mime_type: inferMimeFromName(assignment.attachment_url),
                         url: assignment.attachment_url.startsWith('http') ? assignment.attachment_url : null
                       };
                       
                       const { preview, type, color } = getFileTypeIconOrPreview(attachment);
                       const isLink = attachment.url && (attachment.url.startsWith('http://') || attachment.url.startsWith('https://'));
                       
                       return (
                         <div style={{
                           display: 'flex',
                           alignItems: 'center',
                           background: isLink ? `${color}08` : '#ffffff',
                           borderRadius: '12px',
                           padding: '16px',
                           border: `2px solid ${isLink ? `${color}20` : '#e2e8f0'}`,
                           cursor: 'pointer',
                           transition: 'all 0.3s ease',
                           boxShadow: isLink ? `0 2px 12px ${color}15` : '0 2px 8px rgba(0,0,0,0.05)'
                         }} onClick={() => {
                           if (isLink && attachment.url) {
                             window.open(attachment.url, '_blank', 'noopener,noreferrer');
                           } else {
                             openPreview(attachment);
                           }
                         }}>
                           <div style={{
                             width: '50px',
                             height: '60px',
                             borderRadius: '8px',
                             display: 'flex',
                             alignItems: 'center',
                             justifyContent: 'center',
                             marginRight: '16px'
                           }}>
                              {preview}
                           </div>
                           <div style={{ flex: 1 }}>
                             <div style={{
                               fontWeight: 600,
                               fontSize: '16px',
                               color: '#2d3748',
                               marginBottom: '4px'
                             }}>
                                {attachment.original_name}
                             </div>
                             <div style={{
                               color: '#718096',
                               fontSize: '14px'
                             }}>
                                 {type}
                                 {isLink && <>&bull; <a href={attachment.url} target="_blank" rel="noopener noreferrer" style={{ color: color, fontWeight: 600, textDecoration: 'none' }} onClick={e => e.stopPropagation()}>View Link</a></>}
                                 {!isLink && <>&bull; Click to preview</>}
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
                       );
                     })()
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
                       
                       // Check if there are actually submitted files
                       const hasSubmittedFiles = submission && submission.attachments && submission.attachments.length > 0;
                       
                       switch(normalizedStatus) {
                         case 'submitted':
                         case 'submit':
                           return hasSubmittedFiles ? 'SUBMITTED' : 'NOT_SUBMITTED';
                         case 'graded':
                         case 'grade':
                           return hasSubmittedFiles ? 'GRADED' : 'NOT_SUBMITTED';
                         case 'pending':
                         case 'pending':
                           return hasSubmittedFiles ? 'PENDING' : 'NOT_SUBMITTED';
                         case 'draft':
                           return hasSubmittedFiles ? 'DRAFT' : 'NOT_SUBMITTED';
                         case 'not_submitted':
                         case 'not submitted':
                           return 'NOT_SUBMITTED';
                         default:
                           return hasSubmittedFiles ? (status ? status.toUpperCase() : 'PENDING') : 'NOT_SUBMITTED';
                       }
                     })()}
                 </Badge>
               </div>

                                {/* Submitted Files */}
                <div style={{ marginBottom: '20px' }}>
                  {(submission && submission.attachments && submission.attachments.length > 0 && 
                    (submission.status === 'submitted' || submission.status === 'graded' || 
                     submission.status === 'SUBMITTED' || submission.status === 'GRADED')) ? (
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
                    onClick={() => { if (!isPastDue()) document.getElementById('file-upload').click(); }}
                   style={{
                     borderRadius: '12px',
                     fontWeight: 600,
                     fontSize: '14px',
                     width: '100%',
                     padding: '12px',
                     cursor: 'pointer'
                   }}
                    disabled={uploading || isPastDue()}
                 >
                   <i className="ni ni-fat-add" style={{ marginRight: '8px' }} />
                   📎 Add Files
                 </Button>
               </div>

                                {selectedFiles.length > 0 || externalLinks.length > 0 ? (
                 <Button
                   color="success"
                   onClick={handleSubmitFiles}
                    disabled={uploading || isPastDue()}
                   style={{
                     borderRadius: '12px',
                     fontWeight: 600,
                     fontSize: '14px',
                     width: '100%',
                     marginBottom: '12px',
                     padding: '12px'
                   }}
                 >
                    {isPastDue() ? (
                      <>
                        <i className="ni ni-fat-remove" style={{ marginRight: '8px' }} />
                        ⛔ Past Due
                      </>
                    ) : uploading ? (
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

                {isPastDue() && (
                  <div style={{
                    color: '#721c24',
                    fontSize: '12px',
                    textAlign: 'center',
                    padding: '8px',
                    background: '#f8d7da',
                    borderRadius: '8px',
                    border: '1px solid #f5c6cb'
                  }}>
                    ⏰ Work cannot be turned in after the due date
                  </div>
                )}

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