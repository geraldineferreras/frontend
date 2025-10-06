import React, { useState, useEffect, useRef } from "react";
import {
  Container, Row, Col, Card, CardHeader, CardBody, Button, Nav, NavItem, NavLink, Form, FormGroup, Label, Input, Dropdown, DropdownToggle, DropdownMenu, DropdownItem, Collapse, Table, UncontrolledDropdown, Modal, ModalHeader, ModalBody, ModalFooter
} from "reactstrap";
import { FaPlus, FaEllipsisV, FaEdit, FaTrash, FaPaperclip, FaQrcode, FaCamera, FaEye } from "react-icons/fa";
import ScanPaper from "../../components/ScanPaper";
import CustomQRScanner from "../../components/CustomQRScanner";
import SimpleQRScanner from "../../components/SimpleQRScanner";
import jsQR from "jsqr";

const TABS = [
  { key: "split", label: "Split View" },
  { key: "input", label: "Input Panel" },
  { key: "table", label: "Grade Table" },
];

const gradingTypes = [
  "Assignment", "Activity", "Recitation", "Quiz", "Exam", "Performance Task", "Project"
];

// Mock data for classes and students
const mockStudents = [
  { id: "2021305973", name: "ANJELA SOFIA G. SARMIENTO", avatar: require("../../assets/img/theme/team-1-800x800.jpg"), classId: 1 },
  { id: "2021305974", name: "JUAN DELA CRUZ", avatar: require("../../assets/img/theme/team-2-800x800.jpg"), classId: 1 },
  { id: "2021305975", name: "MARIA CLARA", avatar: require("../../assets/img/theme/team-3-800x800.jpg"), classId: 2 },
];

const initialAssessmentForm = {
  classId: "",
  gradingType: gradingTypes[0],
  title: "",
  points: "",
};

const TeacherFastGrade = () => {
  const [activeTab, setActiveTab] = useState("split");
  const [assessmentForm, setAssessmentForm] = useState(initialAssessmentForm);
  const [assessments, setAssessments] = useState([]);
  const [activeAssessment, setActiveAssessment] = useState(null);
  const [editAssessmentId, setEditAssessmentId] = useState(null);
  const [editAssessmentForm, setEditAssessmentForm] = useState(initialAssessmentForm);
  const [dropdownOpen, setDropdownOpen] = useState({});
  const [collapseOpen, setCollapseOpen] = useState({});
  const [classrooms, setClassrooms] = useState([]);
  const qrVideoRef = useRef(null);
  const [scannerOn, setScannerOn] = useState(false);
  const [scannerMessage, setScannerMessage] = useState("");
  const [scannerResult, setScannerResult] = useState(null);
  const [scannerStatus, setScannerStatus] = useState(null); // 'success' | 'error' | null
  const [audioType, setAudioType] = useState("female");
  const audioRef = useRef();
  const [attachmentDropdownOpen, setAttachmentDropdownOpen] = useState(false);
  const [attachmentFiles, setAttachmentFiles] = useState([]);
  const [showScanModal, setShowScanModal] = useState(false);
  const [scannedImage, setScannedImage] = useState(null);
  const videoRef = useRef();
  const [videoReady, setVideoReady] = useState(false);
  const canvasRef = useRef();
  const fileInputRef = useRef();
  const [scanPreview, setScanPreview] = useState(null);
  const [scanCameraError, setScanCameraError] = useState("");
  const [scanStream, setScanStream] = useState(null);
  const [scanDebugLog, setScanDebugLog] = useState("");
  const [cameraTestMode, setCameraTestMode] = useState(false);
  
  // Camera device management
  const [cameraDevices, setCameraDevices] = useState([]);
  const [selectedQRCamera, setSelectedQRCamera] = useState("");
  const [selectedScanCamera, setSelectedScanCamera] = useState("");
  const [cameraDropdownOpen, setCameraDropdownOpen] = useState(false);
  const [scanCameraDropdownOpen, setScanCameraDropdownOpen] = useState(false);
  const [showAdvancedScanModal, setShowAdvancedScanModal] = useState(false);
  const [useSimpleScanner, setUseSimpleScanner] = useState(false);
  const [videoElementReady, setVideoElementReady] = useState(false);

  // Add state at the top of the component:
  const [highlightedStudentId, setHighlightedStudentId] = useState(null);
  const scanLoopRef = useRef();
  const qrCanvasRef = useRef();
  // Add a new state for the update prompt
  const [updatePrompt, setUpdatePrompt] = useState(null);

  // Add refs at the top of the component
  const scoreRefs = useRef({}); // { [assessmentId]: value }
  const feedbackRef = useRef("");
  const attachmentRef = useRef([]);

  // Modal-specific state
  const [modalScores, setModalScores] = useState({}); // { [assessmentId]: value }
  const [modalFeedback, setModalFeedback] = useState("");
  const modalAttachmentRef = useRef([]);
  const modalFileInputRef = useRef();
  const [modalAttachmentFiles, setModalAttachmentFiles] = useState([]);
  const [modalAttachmentDropdownOpen, setModalAttachmentDropdownOpen] = useState(false);
  
  // View grade modal state
  const [showViewGradeModal, setShowViewGradeModal] = useState(false);
  const [viewGradeData, setViewGradeData] = useState(null);

  // Add state at the top of the component
  const [previewModalOpen, setPreviewModalOpen] = useState(false);
  const [previewFile, setPreviewFile] = useState(null);
  const [previewType, setPreviewType] = useState('');

  // Update refs on input change
  const handleScoreChange = (assessmentId, value) => {
    scoreRefs.current[assessmentId] = value;
    setCurrentScores(scores => ({ ...scores, [assessmentId]: value }));
  };
  const handleFeedbackChange = (value) => {
    feedbackRef.current = value;
    setCurrentFeedback(value);
  };
  const handleAttachmentChange = (files) => {
    attachmentRef.current = files;
    setAttachmentFiles(files);
  };

  useEffect(() => {
    // Load classrooms from localStorage
    const saved = localStorage.getItem("teacherClasses");
    if (saved) {
      setClassrooms(JSON.parse(saved));
    } else {
      setClassrooms([]);
    }
    
    // Initialize camera devices
    enumerateCameras();
  }, []);

  // QR Scanning loop effect
  useEffect(() => {
    if (scannerOn && qrVideoRef.current && qrCanvasRef.current) {
      const video = qrVideoRef.current;
      const canvas = qrCanvasRef.current;
      const ctx = canvas.getContext('2d');
      let stopped = false;

      const scanFrame = () => {
        if (stopped) return;
        if (video.readyState === video.HAVE_ENOUGH_DATA && video.videoWidth > 0) {
          canvas.width = video.videoWidth;
          canvas.height = video.videoHeight;
          ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
          const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
          const code = jsQR(imageData.data, imageData.width, imageData.height, {
            inversionAttempts: "dontInvert",
          });
          if (code) {
            console.log('QR Code detected:', code.data);
            handleScan(code.data);
            // Wait 1.5 seconds before scanning again
            setTimeout(() => {
              if (!stopped) scanLoopRef.current = requestAnimationFrame(scanFrame);
            }, 1500);
            return;
          }
        }
        scanLoopRef.current = requestAnimationFrame(scanFrame);
      };
      scanFrame();
      return () => {
        stopped = true;
        if (scanLoopRef.current) {
          cancelAnimationFrame(scanLoopRef.current);
        }
      };
    }
  }, [scannerOn]);

  // Enumerate available camera devices
  const enumerateCameras = async () => {
    try {
      const devices = await navigator.mediaDevices.enumerateDevices();
      const videoDevices = devices.filter(device => device.kind === 'videoinput');
      
      // Sort devices to prioritize DroidCam and virtual cameras
      const sortedDevices = videoDevices.sort((a, b) => {
        const aIsDroidCam = a.label.toLowerCase().includes('droidcam') || a.label.toLowerCase().includes('virtual');
        const bIsDroidCam = b.label.toLowerCase().includes('droidcam') || b.label.toLowerCase().includes('virtual');
        
        if (aIsDroidCam && !bIsDroidCam) return -1;
        if (!aIsDroidCam && bIsDroidCam) return 1;
        return a.label.localeCompare(b.label);
      });
      
      setCameraDevices(sortedDevices);
      
      // Auto-select first DroidCam device if available
      const droidCamDevice = sortedDevices.find(device => 
        device.label.toLowerCase().includes('droidcam') || 
        device.label.toLowerCase().includes('virtual')
      );
      
      if (droidCamDevice) {
        setSelectedQRCamera(droidCamDevice.deviceId);
        setSelectedScanCamera(droidCamDevice.deviceId);
      } else if (sortedDevices.length > 0) {
        setSelectedQRCamera(sortedDevices[0].deviceId);
        setSelectedScanCamera(sortedDevices[0].deviceId);
      }
      
      setScanDebugLog(log => log + `Found ${sortedDevices.length} camera devices:\n${sortedDevices.map(d => `- ${d.label}`).join('\n')}\n`);
    } catch (error) {
      setScanDebugLog(log => log + `Error enumerating cameras: ${error.message}\n`);
    }
  };

  // Refresh camera list
  const refreshCameras = () => {
    enumerateCameras();
  };

  // Test QR code data for debugging
  const generateTestQRData = () => {
    const testStudents = [
      { id: "2021305973", name: "ANJELA SOFIA G. SARMIENTO" },
      { id: "2021305974", name: "JUAN DELA CRUZ" },
      { id: "2021305975", name: "MARIA CLARA" }
    ];
    
    const randomStudent = testStudents[Math.floor(Math.random() * testStudents.length)];
    const qrData = `IDNo: ${randomStudent.id}\nFull Name: ${randomStudent.name}\nProgram: BS Computer Science`;
    
    console.log('Test QR Data:', qrData);
    alert(`Test QR Code Data:\n\n${qrData}\n\nUse this data to generate a QR code for testing.`);
    
    return qrData;
  };

  // Manual test function to simulate QR scan
  const testQRScan = () => {
    const testData = "IDNo: 2021305973\nFull Name: ANJELA SOFIA G. SARMIENTO\nProgram: BS Computer Science";
    console.log('Testing QR scan with data:', testData);
    handleScan(testData);
  };

  // Try different camera settings
  const tryDifferentCameraSettings = async () => {
    console.log('Trying different camera settings...');
    setScannerMessage("Trying different camera settings...");
    
    const settings = [
      { facingMode: 'environment' },
      { facingMode: 'user' },
      { width: { ideal: 1280 }, height: { ideal: 720 } },
      { width: { ideal: 640 }, height: { ideal: 480 } },
      { width: { min: 320 }, height: { min: 240 } }
    ];
    
    for (let i = 0; i < settings.length; i++) {
      try {
        console.log(`Trying setting ${i + 1}:`, settings[i]);
        const stream = await navigator.mediaDevices.getUserMedia({
          video: settings[i]
        });
        
        console.log(`Setting ${i + 1} worked!`);
        setScannerMessage(`Camera working with setting ${i + 1}`);
        
        // Stop the test stream
        stream.getTracks().forEach(track => track.stop());
        
        setTimeout(() => setScannerMessage(""), 3000);
        return true;
      } catch (err) {
        console.log(`Setting ${i + 1} failed:`, err.name);
      }
    }
    
    setScannerMessage("All camera settings failed");
    return false;
  };

  // Check camera access before enabling scanner
  const checkCameraAccess = async () => {
    try {
      console.log('Checking camera access...');
      setScannerMessage("Testing camera access...");
      
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          width: { ideal: 640, min: 320 },
          height: { ideal: 480, min: 240 },
          facingMode: 'environment'
        }
      });
      
      console.log('Camera access successful, stream:', stream);
      console.log('Available tracks:', stream.getTracks());
      
      // Stop the test stream immediately
      stream.getTracks().forEach(track => {
        console.log('Stopping test track:', track.kind);
        track.stop();
      });
      
      setScannerMessage("Camera access test successful!");
      setTimeout(() => setScannerMessage(""), 2000);
      
      console.log('Camera access successful');
      return true;
    } catch (err) {
      console.error('Camera access failed:', err);
      setScannerStatus("error");
      
      let errorMessage = 'Camera test failed: ';
      if (err.name === 'NotAllowedError') {
        errorMessage += 'Permission denied. Please allow camera access.';
      } else if (err.name === 'NotFoundError') {
        errorMessage += 'No camera found.';
      } else if (err.name === 'NotSupportedError') {
        errorMessage += 'Camera not supported.';
      } else if (err.name === 'NotReadableError') {
        errorMessage += 'Camera in use by another app.';
      } else {
        errorMessage += err.message || 'Unknown error';
      }
      
      setScannerMessage(errorMessage);
      return false;
    }
  };

  // Grade table state
  const [grades, setGrades] = useState({}); // { assessmentId: [ { studentId, score, attachment, feedback, dateGraded } ] }
  // Replace currentScore with currentScores
  const [currentScores, setCurrentScores] = useState({});
  const [currentFeedback, setCurrentFeedback] = useState("");
  const [scannedStudent, setScannedStudent] = useState(null);
  const [showUpdateModal, setShowUpdateModal] = useState(false);
  const [existingGrade, setExistingGrade] = useState(null);
  const [activeAssessmentId, setActiveAssessmentId] = useState(null);

  // Assessment creation handlers
  const handleAssessmentFormChange = e => {
    const { name, value } = e.target;
    setAssessmentForm(f => ({ ...f, [name]: value }));
  };
  const handleCreateAssessment = () => {
    if (!assessmentForm.classId || !assessmentForm.title || !assessmentForm.points) return;
    const newAssessment = {
      ...assessmentForm,
      id: Date.now(),
      created: new Date(),
    };
    setAssessments(a => [newAssessment, ...a]);
    setAssessmentForm(initialAssessmentForm);
    setCollapseOpen(c => ({ ...c, [newAssessment.id]: true }));
  };
  // Edit/delete assessment
  const handleEditAssessment = (id) => {
    const assessment = assessments.find(a => a.id === id);
    setEditAssessmentId(id);
    setEditAssessmentForm({ ...assessment });
  };
  const handleSaveEditAssessment = () => {
    setAssessments(a => a.map(ass => ass.id === editAssessmentId ? { ...editAssessmentForm } : ass));
    setEditAssessmentId(null);
  };
  const handleCancelEditAssessment = () => setEditAssessmentId(null);
  const handleDeleteAssessment = (id) => {
    setAssessments(a => a.filter(ass => ass.id !== id));
    setEditAssessmentId(null);
  };
  // Collapse toggle
  const handleToggleCollapse = (id) => {
    setCollapseOpen(c => ({ ...c, [id]: !c[id] }));
    if (!collapseOpen[id]) {
      setActiveAssessmentId(id);
    } else {
      setActiveAssessmentId(null);
    }
    setActiveAssessment(id);
  };
  // Dropdown toggle
  const handleDropdownToggle = (id) => {
    setDropdownOpen(d => ({ ...d, [id]: !d[id] }));
  };

  // Play audio notification
  const playAudio = (type) => {
    if (audioRef.current) {
      audioRef.current.src = type === "male" ? "/grading-success-male.mp3" : "/grading-success-female.mp3";
      audioRef.current.play();
    }
  };

  // Handle QR scan
  const handleScan = (data) => {
    if (!data) return;
    setUpdatePrompt(null); // Clear any previous prompt
    const idMatch = data.match(/IDNo:\s*(\d{10})/);
    if (!idMatch) {
      setScannerStatus("error");
      setScannerMessage("Invalid QR code format. Expected: IDNo: 2021305973");
      setScannerResult(null);
      return;
    }
    const studentId = idMatch[1];
    const assessment = assessments.find(a => collapseOpen[a.id]);
    if (!assessment) {
      setScannerStatus("error");
      setScannerMessage("No active assessment selected.");
      setScannerResult(null);
      return;
    }
    const student = mockStudents.find(s => s.id === studentId && s.classId === Number(assessment.classId));
    if (!student) {
      setScannerStatus("error");
      setScannerMessage("This student is not enrolled in this class.");
      setScannerResult(null);
      return;
    }
    const assessmentGrades = grades[assessment.id] || [];
    const existingGrade = assessmentGrades.find(g => g.studentId === studentId);
    if (existingGrade) {
      setExistingGrade(existingGrade);
      setScannedStudent(student);
      setShowUpdateModal(false); // Don't open modal immediately
      setScannerStatus("error");
      setScannerMessage("This student has already been graded.");
      setUpdatePrompt({
        studentId: student.id,
        onClick: () => {
          const row = document.getElementById(`grade-row-${student.id}`);
          if (row) {
            row.scrollIntoView({ behavior: 'smooth', block: 'center' });
            row.classList.add('highlight-row');
            setTimeout(() => row.classList.remove('highlight-row'), 3000);
          }
          setHighlightedStudentId(student.id);
          setTimeout(() => setHighlightedStudentId(null), 3000);
          setShowUpdateModal(true);
        }
      });
      return; // DO NOT add a new grade
    }
    // Always use the latest values at the moment of scan
    const score = scoreRefs.current[assessment.id];
    const feedback = feedbackRef.current;
    const attachments = attachmentRef.current;
    console.log('DEBUG: score for assessment', assessment.id, '=', score, 'currentScores:', currentScores);
    if (score === undefined || score === null || score === "" || isNaN(Number(score))) {
      setScannerStatus("error");
      setScannerMessage("Please enter a valid score before scanning.");
      setScannerResult(null);
      return;
    }
    if (Number(score) > Number(assessment.points)) {
      setScannerStatus("error");
      setScannerMessage("Score cannot be greater than total points.");
      setScannerResult(null);
      return;
    }
    setScannerStatus("success");
    setScannedStudent(student);
    setScannerMessage("Student found: " + student.name);
    setScannerResult(student);
    const newGrade = {
      studentId: student.id,
      studentName: student.name,
      studentAvatar: student.avatar,
      score,
      attachment: attachments,
      feedback: feedback || '',
      dateGraded: new Date().toLocaleString()
    };
    // Deduplicate: remove any existing grade for this student before adding
    setGrades(prev => ({
      ...prev,
      [assessment.id]: [
        ...(prev[assessment.id] ? prev[assessment.id].filter(g => g.studentId !== student.id) : []),
        newGrade
      ]
    }));
    playAudio(audioType);
    // Clear all fields for the next scan
    scoreRefs.current[assessment.id] = '';
    feedbackRef.current = '';
    attachmentRef.current = [];
    setCurrentScores(scores => ({ ...scores, [assessment.id]: '' }));
    setCurrentFeedback('');
    setAttachmentFiles([]);
    setScannerMessage(`Grade added successfully: ${student.name} - ${score}/${assessment.points}`);
    setScannedStudent(null);
    setTimeout(() => {
      const row = document.getElementById(`grade-row-${student.id}`);
      if (row) {
        row.scrollIntoView({ behavior: 'smooth', block: 'center' });
        row.classList.add('highlight-row');
        setTimeout(() => row.classList.remove('highlight-row'), 2000);
      }
    }, 300);
    setHighlightedStudentId(student.id);
    setTimeout(() => setHighlightedStudentId(null), 2000);
    setTimeout(() => {
      setScannerStatus(null);
      setScannerMessage('Camera ready! Point at QR code.');
    }, 2000);
  };
  
  const handleError = (err) => {
    console.error('QR Scanner error:', err); // Debug log
    setScannerStatus("error");
    
    // Provide more specific error messages
    let errorMessage = 'QR scanner error: ';
    if (err.name === 'NotAllowedError') {
      errorMessage += 'Camera access denied. Please allow camera permissions.';
    } else if (err.name === 'NotFoundError') {
      errorMessage += 'No camera found. Please check your camera connection.';
    } else if (err.name === 'NotSupportedError') {
      errorMessage += 'Camera not supported. Please try a different browser.';
    } else if (err.name === 'NotReadableError') {
      errorMessage += 'Camera is in use by another application.';
    } else if (err.message) {
      errorMessage += err.message;
    } else {
      errorMessage += 'Unknown error occurred.';
    }
    
    setScannerMessage(errorMessage);
  };

  // Handle file attachment
  const handleFileChange = (e) => {
    const files = Array.from(e.target.files).map(file => ({ name: file.name, file }));
    if (files.length > 0) {
      handleAttachmentChange([...attachmentRef.current, ...files]);
    }
    e.target.value = "";
  };

  // Handle scan paper modal
  useEffect(() => {
    if (showScanModal && cameraTestMode) {
      testCamera();
    }
    return () => {
      if (videoRef.current && videoRef.current.srcObject) {
        videoRef.current.srcObject.getTracks().forEach(track => track.stop());
      }
      if (scanStream) {
        scanStream.getTracks().forEach(track => track.stop());
        setScanStream(null);
      }
      setVideoReady(false);
      setScanDebugLog("");
      setCameraTestMode(false);
    };
  }, [showScanModal, cameraTestMode]);

  const handleOpenScanModal = () => {
    setShowScanModal(true);
    setScanPreview(null);
    setScanCameraError("");
    setScanDebugLog("");
    setCameraTestMode(true);
  };

  const handleOpenAdvancedScanModal = () => {
    setShowAdvancedScanModal(true);
  };

  const handleAdvancedScanComplete = (enhancedImage) => {
    const response = fetch(enhancedImage);
    response.then(res => res.blob()).then(blob => {
      const file = new File([blob], `scanned-document-${Date.now()}.jpg`, { type: 'image/jpeg' });
      // Check if we're in modal context
      if (showUpdateModal) {
        setModalAttachmentFiles(prev => {
          const newFiles = [...prev, { name: file.name, file }];
          modalAttachmentRef.current = newFiles;
          return newFiles;
        });
      } else {
        handleAttachmentChange([...attachmentRef.current, { name: file.name, file }]);
      }
      setShowAdvancedScanModal(false);
    });
  };

  const handleAdvancedScanCancel = () => {
    setShowAdvancedScanModal(false);
  };

  const handleVideoLoaded = () => {
    setScanDebugLog(log => log + "Video metadata loaded successfully.\n");
    setVideoReady(true);
  };

  const handleVideoError = (e) => {
    setScanDebugLog(log => log + `Video error: ${e.target.error}\n`);
    setScanCameraError("Video playback error. Please check your camera.");
  };

  const testCamera = () => {
    setScanDebugLog("Testing camera access...\n");
    
    const constraints = {
      video: {
        width: { ideal: 320 },
        height: { ideal: 240 }
      }
    };
    
    // Use selected camera device if available
    if (selectedScanCamera) {
      constraints.video.deviceId = { exact: selectedScanCamera };
      setScanDebugLog(log => log + `Using camera: ${cameraDevices.find(d => d.deviceId === selectedScanCamera)?.label || 'Unknown'}\n`);
    }
    
    navigator.mediaDevices.getUserMedia(constraints)
    .then(stream => {
      setScanDebugLog(log => log + "Camera stream received successfully.\n");
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        setScanStream(stream);
        setScanDebugLog(log => log + "Stream set on video element.\n");
      } else {
        setScanDebugLog(log => log + "Video element not found!\n");
      }
    })
    .catch(err => {
      setScanDebugLog(log => log + `Camera error: ${err.message}\n`);
      setScanCameraError(`Camera access denied: ${err.message}`);
      
      // If device-specific access failed, try without device constraint
      if (selectedScanCamera && err.name === 'OverconstrainedError') {
        setScanDebugLog(log => log + "Trying fallback to default camera...\n");
        navigator.mediaDevices.getUserMedia({ 
          video: { 
            width: { ideal: 320 },
            height: { ideal: 240 }
          } 
        })
        .then(fallbackStream => {
          if (videoRef.current) {
            videoRef.current.srcObject = fallbackStream;
            setScanStream(fallbackStream);
            setScanDebugLog(log => log + "Fallback camera stream successful.\n");
          }
        })
        .catch(fallbackErr => {
          setScanDebugLog(log => log + `Fallback camera also failed: ${fallbackErr.message}\n`);
        });
      }
    });
  };

  const handleSaveScan = () => {
    if (scanPreview && scanPreview.blob) {
      const file = new File([scanPreview.blob], `scanned-${Date.now()}.png`, { type: 'image/png' });
      // Check if we're in modal context
      if (showUpdateModal) {
        setModalAttachmentFiles(prev => {
          const newFiles = [...prev, { name: file.name, file }];
          modalAttachmentRef.current = newFiles;
          return newFiles;
        });
      } else {
        handleAttachmentChange([...attachmentRef.current, { name: file.name, file }]);
      }
      setScanPreview(null);
      setShowScanModal(false);
      if (videoRef.current && videoRef.current.srcObject) {
        videoRef.current.srcObject.getTracks().forEach(track => track.stop());
      }
    }
  };
  const handleCloseScanModal = () => {
    setShowScanModal(false);
    setScanPreview(null);
    setScanCameraError("");
    // Clean up camera streams
    if (videoRef.current && videoRef.current.srcObject) {
      videoRef.current.srcObject.getTracks().forEach(track => track.stop());
    }
    if (scanStream) {
      scanStream.getTracks().forEach(track => track.stop());
      setScanStream(null);
    }
    setVideoReady(false);
    setScanDebugLog("");
  };
  // Rename scan paper modal handler to handleScanPaper
  const handleScanPaper = () => {
    if (videoRef.current && canvasRef.current) {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      const ctx = canvas.getContext('2d');
      
      // Set canvas size to match video dimensions
      canvas.width = video.videoWidth || 320;
      canvas.height = video.videoHeight || 240;
      
      // Draw the video frame to canvas
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
      
      // Get image data for CamScanner-like processing
      const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
      const data = imageData.data;
      
      // Step 1: Auto-adjust brightness and contrast (like CamScanner)
      let min = 255, max = 0;
      for (let i = 0; i < data.length; i += 4) {
        const gray = data[i] * 0.299 + data[i + 1] * 0.587 + data[i + 2] * 0.114;
        if (gray < min) min = gray;
        if (gray > max) max = gray;
      }
      
      // Step 2: Apply CamScanner-like enhancement
      for (let i = 0; i < data.length; i += 4) {
        // Convert to grayscale
        const gray = data[i] * 0.299 + data[i + 1] * 0.587 + data[i + 2] * 0.114;
        
        // Auto-level adjustment (like CamScanner's auto-enhancement)
        let enhanced = 0;
        if (max > min) {
          enhanced = ((gray - min) / (max - min)) * 255;
        }
        
        // Apply gentle contrast enhancement (not harsh thresholding)
        enhanced = Math.max(0, Math.min(255, enhanced * 1.3 - 40));
        
        // Apply slight gamma correction for better readability
        enhanced = Math.pow(enhanced / 255, 0.9) * 255;
        
        // Ensure values are in valid range
        enhanced = Math.max(0, Math.min(255, enhanced));
        
        data[i] = enhanced;     // Red
        data[i + 1] = enhanced; // Green
        data[i + 2] = enhanced; // Blue
        // Alpha remains unchanged
      }
      
      // Put the processed image data back to canvas
      ctx.putImageData(imageData, 0, 0);
      
      // Step 3: Apply CamScanner-like filters for final enhancement
      const enhancedCanvas = document.createElement('canvas');
      enhancedCanvas.width = canvas.width;
      enhancedCanvas.height = canvas.height;
      const enhancedCtx = enhancedCanvas.getContext('2d');
      
      // Apply gentle filters similar to CamScanner's "Document" mode
      enhancedCtx.filter = 'contrast(1.4) brightness(1.1) saturate(0.1)';
      enhancedCtx.drawImage(canvas, 0, 0);
      
      // Step 4: Apply subtle sharpening for text clarity
      const sharpenedCanvas = document.createElement('canvas');
      sharpenedCanvas.width = enhancedCanvas.width;
      sharpenedCanvas.height = enhancedCanvas.height;
      const sharpenedCtx = sharpenedCanvas.getContext('2d');
      
      // Draw with slight sharpening effect
      sharpenedCtx.filter = 'brightness(1.05) contrast(1.1)';
      sharpenedCtx.drawImage(enhancedCanvas, 0, 0);
      
      // Convert to blob with high quality
      sharpenedCanvas.toBlob(blob => {
        setScanPreview({
          url: URL.createObjectURL(blob),
          blob,
        });
      }, 'image/jpeg', 0.9);
    }
  };

  // Remove attachment
  const handleRemoveAttachment = (idx) => {
    const newFiles = attachmentRef.current.filter((_, i) => i !== idx);
    handleAttachmentChange(newFiles);
  };

  // Handle grade update
  const handleUpdateGrade = () => {
    if (!existingGrade || !scannedStudent) return;
    
    const assessment = assessments.find(a => collapseOpen[a.id]);
    if (!assessment) return;
    
    const updatedGrade = {
      ...existingGrade,
      score: modalScores[assessment.id] || existingGrade.score,
      attachment: modalAttachmentRef.current,
      feedback: modalFeedback || existingGrade.feedback,
      dateGraded: new Date().toLocaleString()
    };
    
    setGrades(prev => ({
      ...prev,
      [assessment.id]: prev[assessment.id].map(g => 
        g.studentId === scannedStudent.id ? updatedGrade : g
      )
    }));
    
    // Reset modal form
    setModalScores(scores => ({ ...scores, [assessment.id]: '' }));
    setModalFeedback('');
    modalAttachmentRef.current = [];
    setScannedStudent(null);
    setExistingGrade(null);
    setShowUpdateModal(false);
    setModalAttachmentFiles([]);
  };

  // Handle grade deletion
  const handleDeleteGrade = (assessmentId, studentId) => {
    setGrades(prev => ({
      ...prev,
      [assessmentId]: prev[assessmentId].filter(g => g.studentId !== studentId)
    }));
  };

  // Handle grade editing
  const handleEditGrade = (assessmentId, studentId) => {
    const assessmentGrades = grades[assessmentId] || [];
    const gradeToEdit = assessmentGrades.find(g => g.studentId === studentId);
    
    if (gradeToEdit) {
      // Set modal-specific values only
      setModalScores(scores => ({ ...scores, [assessmentId]: gradeToEdit.score }));
      setModalFeedback(gradeToEdit.feedback);
      modalAttachmentRef.current = gradeToEdit.attachment || [];
      setModalAttachmentFiles(gradeToEdit.attachment || []);
      setScannedStudent({
        id: gradeToEdit.studentId,
        name: gradeToEdit.studentName,
        avatar: gradeToEdit.studentAvatar
      });
      setExistingGrade(gradeToEdit);
      setShowUpdateModal(true);
    }
  };

  // Handle viewing grade details
  const handleViewGrade = (assessmentId, studentId) => {
    const assessmentGrades = grades[assessmentId] || [];
    const gradeToView = assessmentGrades.find(g => g.studentId === studentId);
    
    if (gradeToView) {
      setViewGradeData({
        grade: gradeToView,
        assessment: assessments.find(a => a.id === assessmentId)
      });
      setShowViewGradeModal(true);
    }
  };

  // Get color for file type (stream style)
  const getFileTypeColor = (ext) => {
    const colors = {
      'pdf': '#dc3545',    // Red
      'doc': '#007bff',    // Blue
      'docx': '#007bff',   // Blue
      'xls': '#28a745',    // Green
      'xlsx': '#28a745',   // Green
      'ppt': '#fd7e14',    // Orange
      'pptx': '#fd7e14',   // Orange
      'mp3': '#28a745',    // Green
      'mp4': '#6f42c1',    // Purple
      'avi': '#6f42c1',    // Purple
      'mov': '#6f42c1',    // Purple
      'jpg': '#6c757d',    // Gray
      'jpeg': '#6c757d',   // Gray
      'png': '#6c757d',    // Gray
      'gif': '#6c757d',    // Gray
      'txt': '#6c757d',    // Gray
      'zip': '#fd7e14',    // Orange
      'rar': '#fd7e14',    // Orange
      'exe': '#6c757d',    // Gray
    };
    return colors[ext] || '#6c757d'; // Default gray for unknown types
  };

  // Get file type label
  const getFileTypeLabel = (ext) => {
    const labels = {
      'pdf': 'PDF',
      'doc': 'WORD',
      'docx': 'WORD',
      'xls': 'EXCEL',
      'xlsx': 'EXCEL',
      'ppt': 'PPT',
      'pptx': 'PPT',
      'mp3': 'MP3',
      'mp4': 'MP4',
      'avi': 'MP4',
      'mov': 'MP4',
      'jpg': 'JPG',
      'jpeg': 'JPG',
      'png': 'PNG',
      'gif': 'GIF',
      'txt': 'TXT',
      'zip': 'ZIP',
      'rar': 'RAR',
      'exe': 'FILE',
    };
    return labels[ext] || 'FILE';
  };



  // Render attached files/images (stream style)
  const renderAttachments = () => (
    attachmentFiles.length > 0 && (
      <div style={{ marginTop: 8, display: 'flex', flexWrap: 'nowrap', gap: 8, overflowX: 'auto', paddingBottom: 4 }}>
        {attachmentFiles.map((att, idx) => {
          const url = att.file ? URL.createObjectURL(att.file) : undefined;
          const ext = att.name.split('.').pop().toLowerCase();
          const isImage = att.file && att.file.type.startsWith('image/');
          const fileColor = getFileTypeColor(ext);
          const fileLabel = getFileTypeLabel(ext);
          
          return (
            <div key={idx} style={{ background: '#fff', borderRadius: 6, boxShadow: '0 1px 4px #e9ecef', padding: '0.35rem 0.75rem', display: 'flex', alignItems: 'center', gap: 8, minWidth: 140, maxWidth: 240, fontSize: 13, flexShrink: 0 }}>
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginRight: 6 }}>
                {isImage ? (
                  <img src={url} alt={att.name} style={{ width: 24, height: 30, objectFit: 'cover', borderRadius: 3 }} />
                ) : (
                  <svg width="24" height="30" viewBox="0 0 24 30" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <rect width="24" height="30" rx="4" fill="#fff" stroke={fileColor} strokeWidth="1.5"/>
                    <path d="M6 6h12v18H6z" fill="#fff"/>
                    <text x="12" y="20" textAnchor="middle" fontSize="9" fill={fileColor} fontWeight="bold">{fileLabel}</text>
                  </svg>
                )}
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontWeight: 600, fontSize: 12, color: '#232b3b', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: 100 }} title={att.name}>{att.name}</div>
                <div style={{ fontSize: 11, color: '#90A4AE', marginTop: 1, display: 'flex', alignItems: 'center', gap: 4 }}>
                  {fileLabel}
                  {url && (
                    <>
                      <span style={{ color: '#6c757d', fontSize: 8 }}>•</span>
                      <a href={url} download={att.name} style={{ color: fileColor, fontWeight: 600, textDecoration: 'none', fontSize: 11 }}>Download</a>
                    </>
                  )}
                </div>
              </div>
              <Button close onClick={() => handleRemoveAttachment(idx)} style={{ fontSize: 16, marginLeft: 3, padding: 0 }} />
            </div>
          );
        })}
      </div>
    )
  );

  // Render assessment card header
  const renderAssessmentHeader = (assessment) => (
    <div className="d-flex align-items-center justify-content-between w-100">
      <div className="d-flex align-items-center">
        <FaQrcode style={{ fontSize: 28, color: '#17a2b8', marginRight: 12 }} />
        <div>
          <div style={{ fontWeight: 700, fontSize: 14 }}>{assessment.title}</div>
          <div style={{ fontSize: 12, color: '#888' }}>{assessment.gradingType} &bull; {assessment.points} pts</div>
        </div>
      </div>
      <div>
        <UncontrolledDropdown>
          <DropdownToggle tag="span" style={{ cursor: 'pointer' }}>
            <FaEllipsisV />
          </DropdownToggle>
          <DropdownMenu right>
            <DropdownItem onClick={() => handleEditAssessment(assessment.id)}><FaEdit className="mr-2" />Edit</DropdownItem>
            <DropdownItem onClick={() => handleDeleteAssessment(assessment.id)}><FaTrash className="mr-2" />Delete</DropdownItem>
          </DropdownMenu>
        </UncontrolledDropdown>
      </div>
    </div>
  );

  // Render assessment card body (split view)
  const renderAssessmentBody = (assessment) => (
    <Row>
      {/* Left Partition: Input Panel */}
      <Col md="5" style={{ minWidth: 320, maxWidth: 400 }}>
        <Card className="mb-3" style={{ minHeight: 320, background: '#f8fafd', borderRadius: 12, boxShadow: '0 2px 8px #e9ecef' }}>
          <CardBody style={{ fontSize: 15 }}>
            <div className="mb-2">
              <Label className="font-weight-bold" style={{ fontSize: 15 }}>Audio Notification</Label>
              <Input type="select" value={audioType} onChange={e => setAudioType(e.target.value)} bsSize="md" style={{ fontSize: 15 }}>
                <option value="female">Female</option>
                <option value="male">Male</option>
              </Input>
            </div>
            <div className="mb-2">
              <div className="mb-2">
                <Label className="font-weight-bold" style={{ fontSize: 15 }}>QR Scanner Camera</Label>
                <Dropdown isOpen={cameraDropdownOpen} toggle={() => setCameraDropdownOpen(o => !o)} style={{ display: 'inline-block', width: '100%' }}>
                  <DropdownToggle color="secondary" outline block style={{ borderRadius: 10, fontWeight: 600, fontSize: 15, padding: '8px 0', textAlign: 'left' }}>
                    <FaCamera className="mr-2" style={{ fontSize: 16 }} />
                    {cameraDevices.find(d => d.deviceId === selectedQRCamera)?.label || 'Select Camera'}
                  </DropdownToggle>
                  <DropdownMenu style={{ width: '100%', maxHeight: 200, overflowY: 'auto' }}>
                    {cameraDevices.map(device => (
                      <DropdownItem 
                        key={device.deviceId} 
                        onClick={() => setSelectedQRCamera(device.deviceId)}
                        active={selectedQRCamera === device.deviceId}
                      >
                        <div style={{ fontSize: 14 }}>
                          <div style={{ fontWeight: 600 }}>{device.label}</div>
                          {(device.label.toLowerCase().includes('droidcam') || device.label.toLowerCase().includes('virtual')) && (
                            <div style={{ fontSize: 12, color: '#17a2b8' }}>Virtual Camera</div>
                          )}
                        </div>
                      </DropdownItem>
                    ))}
                    <DropdownItem divider />
                    <DropdownItem onClick={refreshCameras}>
                      <FaCamera className="mr-2" />Refresh Cameras
                    </DropdownItem>
                  </DropdownMenu>
                </Dropdown>
              </div>
              {/* Button to toggle camera */}
              <Button
                onClick={async () => {
                  if (scannerOn) {
                    setScannerOn(false);
                    setScannerMessage("");
                    if (qrVideoRef.current && qrVideoRef.current.srcObject) {
                      qrVideoRef.current.srcObject.getTracks().forEach(track => track.stop());
                      qrVideoRef.current.srcObject = null;
                    }
                  } else {
                    setScannerOn(true);
                    setScannerMessage("Initializing camera...");
                    
                    try {
                      // Camera initialization with selected device
                      const timeoutPromise = new Promise((_, reject) => {
                        setTimeout(() => reject(new Error('Camera timeout')), 10000); // 10 second timeout
                      });
                      
                      // Use selected camera device if available
                      const videoConstraints = {
                        width: { ideal: 640 },
                        height: { ideal: 480 }
                      };
                      
                      if (selectedQRCamera) {
                        videoConstraints.deviceId = { exact: selectedQRCamera };
                        console.log('Using selected camera:', cameraDevices.find(d => d.deviceId === selectedQRCamera)?.label);
                      }
                      
                      const streamPromise = navigator.mediaDevices.getUserMedia({ 
                        video: videoConstraints
                      });
                      
                      const stream = await Promise.race([streamPromise, timeoutPromise]);
                      
                      if (qrVideoRef.current) {
                        qrVideoRef.current.srcObject = stream;
                        setScannerMessage("Camera active! Point at QR code.");
                        
                        qrVideoRef.current.onloadedmetadata = () => {
                          console.log('Video ready:', qrVideoRef.current.videoWidth, 'x', qrVideoRef.current.videoHeight);
                          setScannerMessage("Camera ready! Point at QR code.");
                        };
                      } else {
                        stream.getTracks().forEach(track => track.stop());
                        throw new Error('Video element not found');
                      }
                    } catch (err) {
                      console.error('Camera error:', err);
                      setScannerOn(false);
                      
                      let errorMessage = 'Camera error: ';
                      if (err.message === 'Camera timeout') {
                        errorMessage += 'Camera took too long to start. Please check your camera connection.';
                      } else if (err.name === 'NotAllowedError') {
                        errorMessage += 'Permission denied. Please allow camera access.';
                      } else if (err.name === 'NotFoundError') {
                        errorMessage += 'No camera found. Please check your camera connection.';
                      } else if (err.name === 'NotSupportedError') {
                        errorMessage += 'Camera not supported. Please try a different browser.';
                      } else if (err.name === 'NotReadableError') {
                        errorMessage += 'Camera is in use by another application.';
                      } else if (err.name === 'OverconstrainedError') {
                        errorMessage += 'Selected camera not available. Try refreshing cameras or selecting a different one.';
                        console.log('Camera constraint error - trying fallback...');
                        // Try fallback to default camera
                        try {
                          const fallbackStream = await navigator.mediaDevices.getUserMedia({ 
                            video: { 
                              width: { ideal: 640 },
                              height: { ideal: 480 }
                            } 
                          });
                          if (qrVideoRef.current) {
                            qrVideoRef.current.srcObject = fallbackStream;
                            setScannerOn(true);
                            setScannerMessage("Using fallback camera. Point at QR code.");
                            return;
                          }
                        } catch (fallbackErr) {
                          console.error('Fallback camera also failed:', fallbackErr);
                        }
                      } else {
                        errorMessage += err.message || 'Unknown error occurred.';
                      }
                      setScannerMessage(errorMessage);
                    }
                  }
                }}
              >
                {scannerOn ? "Turn Off QR Scanner" : "Turn On QR Scanner"}
              </Button>
              {scannerOn && (
                <div style={{ position: 'relative', width: 240, height: 240, margin: '0 auto' }}>
                  <video
                    ref={qrVideoRef}
                    autoPlay
                    playsInline
                    muted
                    style={{ width: 240, height: 240, border: '2px solid #17a2b8', borderRadius: 8, objectFit: 'cover', display: 'block' }}
                    onError={e => {
                      setScannerMessage('Video element error: ' + (e?.message || 'Unknown video error'));
                      console.error('Video element error:', e);
                    }}
                  />
                  {/* Hidden canvas for QR scanning */}
                  <canvas 
                    ref={qrCanvasRef} 
                    style={{ display: 'none' }}
                  />
                  {/* Scanning overlay */}
                  <div style={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    width: 240,
                    height: 240,
                    border: scannerStatus === 'success' ? '3px solid #28a745' : scannerStatus === 'error' ? '3px solid #dc3545' : '3px solid #17a2b8',
                    borderRadius: 8,
                    pointerEvents: 'none',
                    background: 'none',
                    boxSizing: 'border-box',
                  }}>
                    {/* Brackets (corners) */}
                    <div style={{ position: 'absolute', top: -3, left: -3, width: 16, height: 16, borderTop: scannerStatus === 'success' ? '3px solid #28a745' : scannerStatus === 'error' ? '3px solid #dc3545' : '3px solid #17a2b8', borderLeft: scannerStatus === 'success' ? '3px solid #28a745' : scannerStatus === 'error' ? '3px solid #dc3545' : '3px solid #17a2b8' }} />
                    <div style={{ position: 'absolute', top: -3, right: -3, width: 16, height: 16, borderTop: scannerStatus === 'success' ? '3px solid #28a745' : scannerStatus === 'error' ? '3px solid #dc3545' : '3px solid #17a2b8', borderRight: scannerStatus === 'success' ? '3px solid #28a745' : scannerStatus === 'error' ? '3px solid #dc3545' : '3px solid #17a2b8' }} />
                    <div style={{ position: 'absolute', bottom: -3, left: -3, width: 16, height: 16, borderBottom: scannerStatus === 'success' ? '3px solid #28a745' : scannerStatus === 'error' ? '3px solid #dc3545' : '3px solid #17a2b8', borderLeft: scannerStatus === 'success' ? '3px solid #28a745' : scannerStatus === 'error' ? '3px solid #dc3545' : '3px solid #17a2b8' }} />
                    <div style={{ position: 'absolute', bottom: -3, right: -3, width: 16, height: 16, borderBottom: scannerStatus === 'success' ? '3px solid #28a745' : scannerStatus === 'error' ? '3px solid #dc3545' : '3px solid #17a2b8', borderRight: scannerStatus === 'success' ? '3px solid #28a745' : scannerStatus === 'error' ? '3px solid #dc3545' : '3px solid #17a2b8' }} />
                  </div>
                </div>
              )}
              <div>
                {scannerMessage}
                {updatePrompt && (
                  <div className="mt-2">
                    <span>This student has already been graded. Do you want to </span>
                    <Button size="sm" color="link" style={{ color: '#17a2b8', textDecoration: 'underline', padding: 0 }} onClick={updatePrompt.onClick}>
                      update it
                    </Button>
                    ?
                  </div>
                )}
              </div>
              <div className="mt-2">
                <Button 
                  size="sm" 
                  color="info" 
                  outline 
                  onClick={() => {
                    console.log('Available cameras:', cameraDevices);
                    console.log('Selected QR camera:', selectedQRCamera);
                    console.log('Camera dropdown open:', cameraDropdownOpen);
                    console.log('Scanner on:', scannerOn);
                    console.log('QR video ref:', qrVideoRef.current);
                    if (qrVideoRef.current) {
                      console.log('Video srcObject:', qrVideoRef.current.srcObject);
                      console.log('Video readyState:', qrVideoRef.current.readyState);
                      console.log('Video videoWidth:', qrVideoRef.current.videoWidth);
                      console.log('Video videoHeight:', qrVideoRef.current.videoHeight);
                    }
                  }}
                >
                  Debug Camera
                </Button>
              </div>
            </div>
            <div className="mb-2">
              <Label className="font-weight-bold" style={{ fontSize: 15 }}>Score</Label>
              <Input 
                type="number" 
                min="0" 
                max={assessment.points} 
                value={scoreRefs.current[assessment.id] || ""}
                onChange={e => handleScoreChange(assessment.id, e.target.value)}
                placeholder={`Enter score (out of ${assessment.points})`} 
                bsSize="md" 
                style={{ 
                  fontSize: 15,
                  borderColor: Number(scoreRefs.current[assessment.id]) > assessment.points ? '#dc3545' : undefined
                }} 
              />
              {Number(scoreRefs.current[assessment.id]) > assessment.points && (
                <div style={{ color: '#dc3545', fontSize: 12, marginTop: 4 }}>
                  Score cannot be greater than total points.
                </div>
              )}
            </div>
            <div className="mb-2">
              <Label className="font-weight-bold" style={{ fontSize: 15 }}>Attachment</Label>
              <Dropdown isOpen={attachmentDropdownOpen} toggle={() => setAttachmentDropdownOpen(o => !o)} style={{ display: 'inline-block' }}>
                <DropdownToggle color="secondary" size="md" style={{ borderRadius: 10, fontWeight: 600, fontSize: 15, padding: '2px 8px' }}>
                  <FaPaperclip className="mr-1" style={{ fontSize: 15 }} />
                </DropdownToggle>
                <DropdownMenu>
                  <DropdownItem onClick={() => fileInputRef.current.click()}>File</DropdownItem>
                  <DropdownItem onClick={handleOpenScanModal}>Basic Scan</DropdownItem>
                  <DropdownItem onClick={handleOpenAdvancedScanModal}>Advanced Scan (CamScanner-like)</DropdownItem>
                </DropdownMenu>
              </Dropdown>
              <input
                type="file"
                ref={fileInputRef}
                style={{ display: 'none' }}
                onChange={e => {
                  const files = Array.from(e.target.files).map(file => ({ name: file.name, file }));
                  handleAttachmentChange([...attachmentRef.current, ...files]);
                  e.target.value = "";
                }}
              />
              {renderAttachments()}
              {/* Scan Paper Modal */}
              <Modal isOpen={showScanModal} toggle={handleCloseScanModal} centered>
                <ModalHeader toggle={handleCloseScanModal} style={{ fontWeight: 700, fontSize: 18 }}>Scan Paper</ModalHeader>
                <ModalBody style={{ textAlign: 'center' }}>
                  {scanCameraError ? (
                    <div style={{ color: '#dc3545', fontWeight: 600, fontSize: 16, padding: 40 }}>{scanCameraError}</div>
                  ) : !scanPreview ? (
                    <>
                      <div className="mb-3">
                        <Label className="font-weight-bold" style={{ fontSize: 15 }}>Scan Camera</Label>
                        <Dropdown isOpen={scanCameraDropdownOpen} toggle={() => setScanCameraDropdownOpen(o => !o)} style={{ display: 'inline-block', width: '100%' }}>
                          <DropdownToggle color="secondary" outline block style={{ borderRadius: 10, fontWeight: 600, fontSize: 15, padding: '8px 0', textAlign: 'left' }}>
                            <FaCamera className="mr-2" style={{ fontSize: 16 }} />
                            {cameraDevices.find(d => d.deviceId === selectedScanCamera)?.label || 'Select Camera'}
                          </DropdownToggle>
                          <DropdownMenu style={{ width: '100%', maxHeight: 200, overflowY: 'auto' }}>
                            {cameraDevices.map(device => (
                              <DropdownItem 
                                key={device.deviceId} 
                                onClick={() => {
                                  setSelectedScanCamera(device.deviceId);
                                  // Restart camera with new device
                                  if (videoRef.current && videoRef.current.srcObject) {
                                    videoRef.current.srcObject.getTracks().forEach(track => track.stop());
                                  }
                                  setTimeout(() => testCamera(), 100);
                                }}
                                active={selectedScanCamera === device.deviceId}
                              >
                                <div style={{ fontSize: 14 }}>
                                  <div style={{ fontWeight: 600 }}>{device.label}</div>
                                  {(device.label.toLowerCase().includes('droidcam') || device.label.toLowerCase().includes('virtual')) && (
                                    <div style={{ fontSize: 12, color: '#17a2b8' }}>Virtual Camera</div>
                                  )}
                                </div>
                              </DropdownItem>
                            ))}
                            <DropdownItem divider />
                            <DropdownItem onClick={refreshCameras}>
                              <FaCamera className="mr-2" />Refresh Cameras
                            </DropdownItem>
                          </DropdownMenu>
                        </Dropdown>
                      </div>
                      <video
                        ref={videoRef}
                        width={320}
                        height={240}
                        style={{ borderRadius: 8, background: '#222', display: 'block' }}
                        playsInline
                        autoPlay
                        muted
                        onLoadedMetadata={handleVideoLoaded}
                        onError={handleVideoError}
                      />
                      {!videoReady && <div style={{ color: '#888', fontWeight: 600, fontSize: 14, marginTop: 16 }}>Initializing camera...</div>}
                      <Button 
                        color="secondary" 
                        size="sm" 
                        onClick={testCamera}
                        style={{ marginTop: 8 }}
                      >
                        Retry Camera
                      </Button>
                      <Button 
                        color="info" 
                        size="sm" 
                        onClick={() => {
                          console.log('Video dimensions:', qrVideoRef.current?.videoWidth, 'x', qrVideoRef.current?.videoHeight);
                          console.log('Canvas dimensions:', qrCanvasRef.current?.width, 'x', qrCanvasRef.current?.height);
                        }}
                        style={{ marginTop: 8 }}
                      >
                        Debug Info
                      </Button>
                      <pre style={{ textAlign: 'left', fontSize: 12, color: '#666', marginTop: 8, background: '#f8fafd', borderRadius: 6, padding: 8, maxWidth: 320, overflowX: 'auto' }}>{scanDebugLog}</pre>
                    </>
                  ) : (
                    <img src={scanPreview.url} alt="Scanned Preview" width={320} height={240} style={{ borderRadius: 8, objectFit: 'contain', background: '#222' }} />
                  )}
                  <canvas ref={canvasRef} width={320} height={240} style={{ display: 'none' }} />
                </ModalBody>
                <ModalFooter>
                  {!scanPreview ? (
                    <Button color="primary" onClick={handleScanPaper} style={{ borderRadius: 10, fontWeight: 700, minWidth: 90, fontSize: 15, padding: '4px 12px', background: '#2DCE89', color: '#fff', border: 'none' }}>Scan</Button>
                  ) : (
                    <Button color="primary" onClick={handleSaveScan} style={{ borderRadius: 10, fontWeight: 700, minWidth: 90, fontSize: 15, padding: '4px 12px', background: '#2DCE89', color: '#fff', border: 'none' }}>Save</Button>
                  )}
                </ModalFooter>
              </Modal>
            </div>
            <div className="mb-2">
              <Label className="font-weight-bold" style={{ fontSize: 15 }}>Feedback</Label>
              <Input 
                type="textarea" 
                rows={2} 
                value={feedbackRef.current}
                onChange={e => handleFeedbackChange(e.target.value)}
                placeholder="Optional feedback..." 
                bsSize="md" 
                style={{ fontSize: 15 }} 
              />
              <Button color="info" outline size="md" className="mt-2" style={{ borderRadius: 10, fontWeight: 600, fontSize: 15, padding: '2px 8px' }}>
                Audio Feedback
              </Button>
            </div>
            <div className="mt-3">
              <Button 
                color="secondary" 
                outline 
                size="md" 
                onClick={() => {
                  scoreRefs.current[assessment.id] = '';
                  feedbackRef.current = '';
                  attachmentRef.current = [];
                  setCurrentScores(scores => ({ ...scores, [assessment.id]: '' }));
                  setCurrentFeedback('');
                  setAttachmentFiles([]);
                  setScannerMessage('Form cleared. Ready for next scan.');
                }}
                style={{ borderRadius: 10, fontWeight: 600, fontSize: 15, padding: '4px 12px' }}
              >
                Clear Form
              </Button>
            </div>
          </CardBody>
        </Card>
      </Col>
      {/* Right Partition: Grade Table (decrease width) */}
      <Col md="7">
        {/* Grade Table Placeholder */}
        <Card className="mb-3" style={{ borderRadius: 12, boxShadow: '0 2px 8px #e9ecef' }}>
          <CardBody style={{ fontSize: 15 }}>
            <Table responsive hover style={{ background: '#fff', borderRadius: 8, fontSize: 15 }}>
              <thead>
                <tr>
                  <th>Student</th>
                  <th>Score</th>
                  <th>Attachment</th>
                  <th>Feedback</th>
                  <th>Date Graded</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {/* Show graded students first, then ungraded students */}
                {(() => {
                  const assessmentGrades = grades[assessment.id] || [];
                  const gradedStudents = assessmentGrades.map(grade => ({
                    ...grade,
                    isGraded: true
                  }));
                  
                  const ungradedStudents = mockStudents
                    .filter(s => s.classId === Number(assessment.classId))
                    .filter(s => !assessmentGrades.find(g => g.studentId === s.id))
                    .map(student => ({
                      studentId: student.id,
                      studentName: student.name,
                      studentAvatar: student.avatar,
                      score: '',
                      attachment: [],
                      feedback: '',
                      dateGraded: '',
                      isGraded: false
                    }));
                  
                  return [...gradedStudents, ...ungradedStudents].map(student => (
                    <tr 
                      key={student.studentId} 
                      id={`grade-row-${student.studentId}`} 
                      className={highlightedStudentId === student.studentId ? 'highlight-row' : ''}
                      onClick={() => student.isGraded && handleViewGrade(assessment.id, student.studentId)}
                      style={{ 
                        cursor: student.isGraded ? 'pointer' : 'default',
                        transition: 'background-color 0.2s ease'
                      }}
                      onMouseEnter={(e) => {
                        if (student.isGraded) {
                          e.currentTarget.style.backgroundColor = '#f8f9fa';
                        }
                      }}
                      onMouseLeave={(e) => {
                        if (student.isGraded) {
                          e.currentTarget.style.backgroundColor = '';
                        }
                      }}
                    >
                      <td>
                        <div className="d-flex align-items-center">
                          <img src={student.studentAvatar} alt="avatar" style={{ width: 32, height: 32, borderRadius: '50%', marginRight: 8 }} />
                          <div>
                            <div style={{ fontWeight: 600, fontSize: 15 }}>{student.studentName}</div>
                            <div style={{ fontSize: 13, color: '#888' }}>{student.studentId}</div>
                          </div>
                        </div>
                      </td>
                      <td>
                        {student.isGraded ? `${student.score}/${assessment.points}` : '--/--'}
                      </td>
                      <td>
                        {student.isGraded && student.attachment && student.attachment.length > 0 ? (
                          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4 }}>
                            {student.attachment.map((att, idx) => (
                              <div key={idx} style={{ fontSize: 12, color: '#17a2b8', fontWeight: 600 }}>
                                {att.name}
                              </div>
                            ))}
                          </div>
                        ) : ''}
                      </td>
                      <td>
                        {student.isGraded && student.feedback ? (
                          <div style={{ fontSize: 13, maxWidth: 150, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }} title={student.feedback}>
                            {student.feedback}
                          </div>
                        ) : ''}
                      </td>
                      <td>
                        {student.isGraded ? student.dateGraded : ''}
                      </td>
                                              <td>
                         {student.isGraded ? (
                           <>
                              <Button 
                                color="link" 
                                size="md" 
                                style={{ fontSize: 15, padding: '2px 6px' }}
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleEditGrade(assessment.id, student.studentId);
                                }}
                              >
                                <FaEdit />
                              </Button>
                             <Button 
                               color="link" 
                               size="md" 
                               style={{ fontSize: 15, padding: '2px 6px' }}
                               onClick={(e) => {
                                 e.stopPropagation();
                                 handleDeleteGrade(assessment.id, student.studentId);
                               }}
                             >
                               <FaTrash />
                             </Button>
                           </>
                         ) : ''}
                        </td>
                    </tr>
                  ));
                })()}
              </tbody>
            </Table>
          </CardBody>
        </Card>
      </Col>
    </Row>
  );

  // Main render
  return (
    <>
      <style>
        {`
          .highlight-row {
            background-color: #fff3cd !important;
            border-left: 4px solid #ffc107 !important;
            animation: highlightPulse 2s ease-in-out;
          }
          
          @keyframes highlightPulse {
            0%, 100% { background-color: #fff3cd; }
            50% { background-color: #ffeaa7; }
          }
        `}
      </style>
      <Container fluid className="pt-4">
      {/* Assessment creation form */}
      <Card className="mb-4" style={{ borderRadius: 12, boxShadow: '0 2px 8px #e9ecef' }}>
        <CardBody>
          <Form inline className="d-flex flex-wrap align-items-end" style={{ gap: 10, fontSize: 13 }}>
            <FormGroup className="mb-2">
              <Label for="classId" className="mr-2 font-weight-bold" style={{ fontSize: 13 }}>Class</Label>
              <Input
                type="select"
                name="classId"
                id="classId"
                value={assessmentForm.classId}
                onChange={handleAssessmentFormChange}
                style={{ minWidth: 120, fontSize: 13 }}
                bsSize="sm"
              >
                <option value="">Select Class</option>
                {classrooms.map(cls => (
                  <option key={cls.id} value={cls.id}>{cls.subject ? `${cls.subject} (${cls.section})` : cls.name}</option>
                ))}
              </Input>
            </FormGroup>
            <FormGroup className="mb-2">
              <Label for="gradingType" className="mr-2 font-weight-bold" style={{ fontSize: 13 }}>Type</Label>
              <Input
                type="select"
                name="gradingType"
                id="gradingType"
                value={assessmentForm.gradingType}
                onChange={handleAssessmentFormChange}
                style={{ minWidth: 120, fontSize: 13 }}
                bsSize="sm"
              >
                {gradingTypes.map(type => (
                  <option key={type} value={type}>{type}</option>
                ))}
              </Input>
            </FormGroup>
            <FormGroup className="mb-2">
              <Label for="title" className="mr-2 font-weight-bold" style={{ fontSize: 13 }}>Title</Label>
              <Input
                type="text"
                name="title"
                id="title"
                value={assessmentForm.title}
                onChange={handleAssessmentFormChange}
                placeholder="Assessment Title"
                style={{ minWidth: 140, fontSize: 13 }}
                bsSize="sm"
              />
            </FormGroup>
            <FormGroup className="mb-2">
              <Label for="points" className="mr-2 font-weight-bold" style={{ fontSize: 13 }}>Total Points</Label>
              <Input
                type="number"
                name="points"
                id="points"
                value={assessmentForm.points}
                onChange={handleAssessmentFormChange}
                placeholder="Points"
                min="1"
                style={{ width: 80, fontSize: 13 }}
                bsSize="sm"
              />
            </FormGroup>
            <Button color="primary" className="mb-2" onClick={handleCreateAssessment} style={{ borderRadius: 10, fontWeight: 700, minWidth: 90, fontSize: 13, padding: '4px 12px' }} size="sm">
              <FaPlus className="mr-2" style={{ fontSize: 13 }} />Create
            </Button>
          </Form>
        </CardBody>
      </Card>

      {/* Assessment cards */}
      {assessments.map(assessment => (
        <Card key={assessment.id} className="mb-3" style={{ borderRadius: 12, boxShadow: '0 2px 8px #e9ecef' }}>
          <CardHeader style={{ cursor: 'pointer', background: '#f7fafd', fontSize: 13 }} onClick={() => handleToggleCollapse(assessment.id)}>
            {editAssessmentId === assessment.id ? (
              <Form inline className="d-flex flex-wrap align-items-end" style={{ gap: 10, fontSize: 13 }}>
                <FormGroup className="mb-2">
                  <Input
                    type="text"
                    name="title"
                    value={editAssessmentForm.title}
                    onChange={e => setEditAssessmentForm(f => ({ ...f, title: e.target.value }))}
                    placeholder="Assessment Title"
                    style={{ minWidth: 140, fontSize: 13 }}
                    bsSize="sm"
                  />
                </FormGroup>
                <FormGroup className="mb-2">
                  <Input
                    type="number"
                    name="points"
                    value={editAssessmentForm.points}
                    onChange={e => setEditAssessmentForm(f => ({ ...f, points: e.target.value }))}
                    placeholder="Points"
                    min="1"
                    style={{ width: 80, fontSize: 13 }}
                    bsSize="sm"
                  />
                </FormGroup>
                <Button
                  className="mb-2"
                  onClick={handleSaveEditAssessment}
                  style={{
                    borderRadius: 10,
                    fontWeight: 700,
                    minWidth: 70,
                    fontSize: 15,
                    padding: '4px 10px',
                    background: '#2DCE89',
                    color: '#fff',
                    border: 'none',
                    boxShadow: '0 2px 8px #e9ecef',
                  }}
                  size="md"
                >
                  Save
                </Button>
                <Button color="secondary" className="mb-2" onClick={handleCancelEditAssessment} style={{ borderRadius: 10, fontWeight: 700, minWidth: 70, fontSize: 13, padding: '4px 10px' }} size="sm">Cancel</Button>
              </Form>
            ) : (
              renderAssessmentHeader(assessment)
            )}
          </CardHeader>
          <Collapse isOpen={!!collapseOpen[assessment.id]}>
            <CardBody style={{ background: '#fafdff', fontSize: 13 }}>
              {/* Tab Navigation */}
              <Nav tabs className="mb-3">
                {TABS.map(tab => (
                  <NavItem key={tab.key}>
                    <NavLink
                      className={activeTab === tab.key ? "active" : ""}
                      onClick={() => setActiveTab(tab.key)}
                      style={{ 
                        cursor: 'pointer', 
                        fontSize: 14, 
                        fontWeight: 600,
                        color: activeTab === tab.key ? '#17a2b8' : '#6c757d',
                        borderBottom: activeTab === tab.key ? '2px solid #17a2b8' : 'none'
                      }}
                    >
                      {tab.label}
                    </NavLink>
                  </NavItem>
                ))}
              </Nav>
              
              {/* Tab system logic */}
              {activeTab === "split" && renderAssessmentBody(assessment)}
              {activeTab === "input" && (
                <Row>
                  <Col md="12">{renderAssessmentBody(assessment).props.children[0]}</Col>
                </Row>
              )}
              {activeTab === "table" && (
                <Row>
                  <Col md="12">{renderAssessmentBody(assessment).props.children[1]}</Col>
                </Row>
              )}
            </CardBody>
          </Collapse>
        </Card>
      ))}

      {/* Update Grade Modal */}
      <Modal isOpen={showUpdateModal} toggle={() => setShowUpdateModal(false)} size="lg" centered>
        <ModalHeader toggle={() => setShowUpdateModal(false)} style={{ fontWeight: 700, fontSize: 18 }}>
          Update Existing Grade
        </ModalHeader>
        <ModalBody>
          <Row>
            {/* Left Partition: Student Profile and Current Grade */}
            <Col md="4">
              {scannedStudent && (
                <div className="text-center mb-3">
                  <img src={scannedStudent.avatar} alt="avatar" style={{ width: 64, height: 64, borderRadius: '50%', marginBottom: 16 }} />
                  <h5 style={{ fontWeight: 600, marginBottom: 8 }}>{scannedStudent.name}</h5>
                  <p style={{ color: '#666', marginBottom: 16 }}>Student ID: {scannedStudent.id}</p>
                  <div style={{ background: '#f8f9fa', padding: 12, borderRadius: 8, marginBottom: 16 }}>
                    <p style={{ margin: 0, fontWeight: 600 }}>Current Grade:</p>
                    <p style={{ margin: 0, color: '#666' }}>
                      Score: {existingGrade?.score || 'Not set'} / {assessments.find(a => collapseOpen[a.id])?.points || 'N/A'}
                    </p>
                    {existingGrade?.feedback && (
                      <p style={{ margin: 0, color: '#666' }}>Feedback: {existingGrade.feedback}</p>
                    )}
                  </div>
                </div>
              )}
            </Col>
            
            {/* Right Partition: Input Fields */}
            <Col md="8">
              <div className="mb-3">
                <Label className="font-weight-bold">New Score</Label>
                <Input 
                  type="number" 
                  min="0" 
                  max={assessments.find(a => collapseOpen[a.id])?.points || 100}
                  value={modalScores[assessments.find(a => collapseOpen[a.id])?.id] || ""}
                  onChange={e => {
                    setModalScores(scores => ({ ...scores, [assessments.find(a => collapseOpen[a.id])?.id]: e.target.value }));
                  }}
                  placeholder="Enter new score"
                />
              </div>
              <div className="mb-3">
                <Label className="font-weight-bold">New Feedback</Label>
                <Input 
                  type="textarea" 
                  rows={3}
                  value={modalFeedback}
                  onChange={e => {
                    setModalFeedback(e.target.value);
                  }}
                  placeholder="Enter new feedback (optional)"
                />
              </div>
              <div className="mb-3">
                <Label className="font-weight-bold">New Attachments</Label>
                <Dropdown isOpen={modalAttachmentDropdownOpen} toggle={() => setModalAttachmentDropdownOpen(o => !o)} style={{ display: 'inline-block' }}>
                  <DropdownToggle color="secondary" size="md" style={{ borderRadius: 10, fontWeight: 600, fontSize: 15, padding: '2px 8px' }}>
                    <FaPaperclip className="mr-1" style={{ fontSize: 15 }} />
                  </DropdownToggle>
                  <DropdownMenu>
                    <DropdownItem onClick={() => modalFileInputRef.current.click()}>File</DropdownItem>
                    <DropdownItem onClick={handleOpenScanModal}>Basic Scan</DropdownItem>
                    <DropdownItem onClick={handleOpenAdvancedScanModal}>Advanced Scan (CamScanner-like)</DropdownItem>
                  </DropdownMenu>
                </Dropdown>
                <input
                  type="file"
                  ref={modalFileInputRef}
                  style={{ display: 'none' }}
                  onChange={e => {
                    const files = Array.from(e.target.files).map(file => ({ name: file.name, file }));
                    setModalAttachmentFiles([...modalAttachmentFiles, ...files]);
                    modalAttachmentRef.current = [...modalAttachmentFiles, ...files];
                    e.target.value = "";
                  }}
                />
                {modalAttachmentFiles.length > 0 && (
                  <div style={{ 
                    marginTop: 8, 
                    display: 'flex', 
                    gap: 8, 
                    overflowX: 'auto',
                    overflowY: 'hidden',
                    paddingBottom: 8,
                    scrollbarWidth: 'thin',
                    scrollbarColor: '#cbd5e0 #f1f5f9'
                  }}>
                    {modalAttachmentFiles.map((att, idx) => {
                      const url = att.file ? URL.createObjectURL(att.file) : undefined;
                      const ext = att.name.split('.').pop().toLowerCase();
                      const isImage = att.file && att.file.type.startsWith('image/');
                      const fileColor = getFileTypeColor(ext);
                      const fileLabel = getFileTypeLabel(ext);
                                              return (
                          <div key={idx} style={{ 
                            background: '#fff', 
                            borderRadius: 6, 
                            boxShadow: '0 1px 4px #e9ecef', 
                            padding: '0.35rem 0.75rem', 
                            display: 'flex', 
                            alignItems: 'center', 
                            gap: 8, 
                            minWidth: 140, 
                            maxWidth: 240, 
                            fontSize: 13, 
                            flexShrink: 0 
                          }}>
                            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginRight: 6 }}>
                              {isImage ? (
                                <img src={url} alt={att.name} style={{ width: 24, height: 30, objectFit: 'cover', borderRadius: 3 }} />
                              ) : (
                                <svg width="24" height="30" viewBox="0 0 24 30" fill="none" xmlns="http://www.w3.org/2000/svg">
                                  <rect width="24" height="30" rx="4" fill="#fff" stroke={fileColor} strokeWidth="1.5"/>
                                  <path d="M6 6h12v18H6z" fill="#fff"/>
                                  <text x="12" y="20" textAnchor="middle" fontSize="9" fill={fileColor} fontWeight="bold">{fileLabel}</text>
                                </svg>
                              )}
                            </div>
                          <div style={{ flex: 1, minWidth: 0 }}>
                            <div style={{ fontWeight: 600, fontSize: 12, color: '#232b3b', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: 100 }} title={att.name}>{att.name}</div>
                            <div style={{ fontSize: 11, color: '#90A4AE', marginTop: 1, display: 'flex', alignItems: 'center', gap: 4 }}>
                              {fileLabel}
                              {url && (
                                <>
                                  <span style={{ color: '#6c757d', fontSize: 8 }}>•</span>
                                  <a href={url} download={att.name} style={{ color: fileColor, fontWeight: 600, textDecoration: 'none', fontSize: 11 }}>Download</a>
                                </>
                              )}
                            </div>
                          </div>
                          <Button close onClick={() => {
                            const newFiles = modalAttachmentRef.current.filter((_, i) => i !== idx);
                            setModalAttachmentFiles(newFiles);
                            modalAttachmentRef.current = newFiles;
                          }} style={{ fontSize: 16, marginLeft: 3, padding: 0 }} />
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </Col>
          </Row>
        </ModalBody>
        <ModalFooter>
          <Button color="secondary" onClick={() => setShowUpdateModal(false)}>
            Cancel
          </Button>
          <Button 
            color="primary" 
            onClick={handleUpdateGrade}
            disabled={!modalScores[assessments.find(a => collapseOpen[a.id])?.id] || Number(modalScores[assessments.find(a => collapseOpen[a.id])?.id]) > (assessments.find(a => collapseOpen[a.id])?.points || 0)}
          >
            Update Grade
          </Button>
        </ModalFooter>
      </Modal>

      {/* View Grade Modal */}
      <Modal isOpen={showViewGradeModal} toggle={() => setShowViewGradeModal(false)} size="lg" centered>
        <ModalHeader toggle={() => setShowViewGradeModal(false)} style={{ fontWeight: 700, fontSize: 18 }}>
          View Grade Details
        </ModalHeader>
        <ModalBody>
          {viewGradeData && (
            <Row>
              {/* Left Partition: Student Profile and Current Grade */}
              <Col md="4">
                <div className="text-center mb-3">
                  <img src={viewGradeData.grade.studentAvatar} alt="avatar" style={{ width: 64, height: 64, borderRadius: '50%', marginBottom: 16 }} />
                  <h5 style={{ fontWeight: 600, marginBottom: 8 }}>{viewGradeData.grade.studentName}</h5>
                  <p style={{ color: '#666', marginBottom: 16 }}>Student ID: {viewGradeData.grade.studentId}</p>
                  <div style={{ background: '#f8f9fa', padding: 12, borderRadius: 8, marginBottom: 16 }}>
                    <p style={{ margin: 0, fontWeight: 600 }}>Assessment:</p>
                    <p style={{ margin: 0, color: '#666' }}>{viewGradeData.assessment?.title}</p>
                    <p style={{ margin: 0, color: '#666' }}>{viewGradeData.assessment?.gradingType} • {viewGradeData.assessment?.points} pts</p>
                  </div>
                </div>
              </Col>
              {/* Right Partition: Grade Details */}
              <Col md="8">
                <div className="mb-3">
                  <Label className="font-weight-bold">Score</Label>
                  <div style={{ padding: '8px 12px', background: '#f8f9fa', borderRadius: 6, fontSize: 16, fontWeight: 600, color: '#232b3b' }}>
                    {viewGradeData.grade.score} / {viewGradeData.assessment?.points}
                  </div>
                </div>
                {viewGradeData.grade.feedback && (
                  <div className="mb-3">
                    <Label className="font-weight-bold">Feedback</Label>
                    <div style={{ padding: '8px 12px', background: '#f8f9fa', borderRadius: 6, fontSize: 15, color: '#232b3b', minHeight: 40 }}>
                      {viewGradeData.grade.feedback}
                    </div>
                  </div>
                )}
                {viewGradeData.grade.attachment && viewGradeData.grade.attachment.length > 0 && (
                  <div className="mb-3">
                    <Label className="font-weight-bold">Attachments</Label>
                    <div style={{ 
                      marginTop: 8, 
                      display: 'flex', 
                      gap: 8, 
                      overflowX: 'auto',
                      overflowY: 'hidden',
                      paddingBottom: 8,
                      scrollbarWidth: 'thin',
                      scrollbarColor: '#cbd5e0 #f1f5f9'
                    }}>
                      {viewGradeData.grade.attachment.map((att, idx) => {
                        const url = att.file ? URL.createObjectURL(att.file) : att.url;
                        const ext = att.name.split('.').pop().toLowerCase();
                        const isImage = att.file && att.file.type.startsWith('image/');
                        const isVideo = att.file && att.file.type.startsWith('video/');
                        const isPDF = ext === 'pdf';
                        const fileColor = getFileTypeColor(ext);
                        const fileLabel = getFileTypeLabel(ext);
                        return (
                          <div key={idx} 
                            style={{ 
                              background: '#fff', 
                              borderRadius: 6, 
                              boxShadow: '0 1px 4px #e9ecef', 
                              padding: '0.35rem 0.75rem', 
                              display: 'flex', 
                              alignItems: 'center', 
                              gap: 8, 
                              minWidth: 240, 
                              maxWidth: 400, 
                              fontSize: 13, 
                              flexShrink: 0, 
                              cursor: 'pointer',
                              transition: 'box-shadow 0.2s',
                            }}
                            onClick={() => {
                              setPreviewFile(url);
                              if (isImage) setPreviewType('image');
                              else if (isVideo) setPreviewType('video');
                              else if (isPDF) setPreviewType('pdf');
                              else setPreviewType('other');
                              setPreviewModalOpen(true);
                            }}
                            title="Click to preview"
                          >
                            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginRight: 6 }}>
                              {isImage ? (
                                <svg width="24" height="30" viewBox="0 0 24 30" fill="none" xmlns="http://www.w3.org/2000/svg">
                                  <rect width="24" height="30" rx="4" fill="#fff" stroke={fileColor} strokeWidth="1.5"/>
                                  <path d="M6 6h12v18H6z" fill="#fff"/>
                                  <text x="12" y="20" textAnchor="middle" fontSize="9" fill={fileColor} fontWeight="bold">{fileLabel}</text>
                                </svg>
                              ) : isVideo ? (
                                <svg width="24" height="30" viewBox="0 0 24 30" fill="none" xmlns="http://www.w3.org/2000/svg">
                                  <rect width="24" height="30" rx="4" fill="#fff" stroke={fileColor} strokeWidth="1.5"/>
                                  <polygon points="9,8 19,15 9,22" fill={fileColor} />
                                </svg>
                              ) : (
                                <svg width="24" height="30" viewBox="0 0 24 30" fill="none" xmlns="http://www.w3.org/2000/svg">
                                  <rect width="24" height="30" rx="4" fill="#fff" stroke={fileColor} strokeWidth="1.5"/>
                                  <path d="M6 6h12v18H6z" fill="#fff"/>
                                  <text x="12" y="20" textAnchor="middle" fontSize="9" fill={fileColor} fontWeight="bold">{fileLabel}</text>
                                </svg>
                              )}
                            </div>
                            <div style={{ flex: 1, minWidth: 0 }}>
                              <div style={{ fontWeight: 600, fontSize: 14, color: '#232b3b', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: 200 }} title={att.name}>{att.name}</div>
                              <div style={{ fontSize: 11, color: '#90A4AE', marginTop: 1, display: 'flex', alignItems: 'center', gap: 4 }}>
                                {fileLabel}
                                <span style={{ color: '#6c757d', fontSize: 8 }}>•</span>
                                <a href={url} download={att.name} style={{ color: fileColor, fontWeight: 600, textDecoration: 'none', fontSize: 11 }} onClick={e => e.stopPropagation()}>Download</a>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}
                <div className="mb-3">
                  <Label className="font-weight-bold">Date Graded</Label>
                  <div style={{ padding: '8px 12px', background: '#f8f9fa', borderRadius: 6, fontSize: 15, color: '#666' }}>
                    {viewGradeData.grade.dateGraded}
                  </div>
                </div>
              </Col>
            </Row>
          )}
        </ModalBody>
        <ModalFooter>
          <Button color="secondary" onClick={() => setShowViewGradeModal(false)}>
            Close
          </Button>
        </ModalFooter>
      </Modal>

      {/* Advanced Scan Paper Modal */}
      <Modal isOpen={showAdvancedScanModal} toggle={handleAdvancedScanCancel} size="lg" centered>
        <ModalHeader toggle={handleAdvancedScanCancel} style={{ fontWeight: 700, fontSize: 18 }}>
          Advanced Document Scanner
        </ModalHeader>
        <ModalBody style={{ padding: 0 }}>
          <ScanPaper 
            onScan={handleAdvancedScanComplete}
            onCancel={handleAdvancedScanCancel}
            batchMode={false}
          />
        </ModalBody>
      </Modal>

      {/* Preview Modal */}
      <Modal isOpen={previewModalOpen} toggle={() => setPreviewModalOpen(false)} size="xl" centered>
        <ModalHeader toggle={() => setPreviewModalOpen(false)}>
          File Preview
        </ModalHeader>
        <ModalBody style={{ textAlign: 'center' }}>
          {previewType === 'image' && previewFile && (
            <img src={previewFile} alt="Preview" style={{ maxWidth: '100%', maxHeight: '70vh', borderRadius: 8 }} />
          )}
          {previewType === 'video' && previewFile && (
            <video src={previewFile} controls style={{ maxWidth: '100%', maxHeight: '70vh', borderRadius: 8, background: '#000' }} />
          )}
          {previewType === 'pdf' && previewFile && (
            <iframe src={previewFile} title="PDF Preview" style={{ width: '100%', height: '70vh', border: 'none', borderRadius: 8 }} />
          )}
          {previewType === 'other' && previewFile && (
            <div style={{ padding: 32, color: '#888' }}>No preview available. <a href={previewFile} download style={{ color: '#1976d2', fontWeight: 600 }}>Download file</a></div>
          )}
        </ModalBody>
      </Modal>
    </Container>
    </>
  );
};

export default TeacherFastGrade; 