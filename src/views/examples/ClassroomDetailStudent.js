import React, { useState, useRef, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Row, Col, Badge, Button, Input, Modal, ModalHeader, ModalBody, ModalFooter, Tooltip, Alert } from "reactstrap";
import LottieLoader from "components/LottieLoader";


import { useAuth } from '../../contexts/AuthContext';
import apiService from '../../services/api';
import axios from "axios";
import { getProfilePictureUrl, getUserInitials, getAvatarColor } from '../../utils/profilePictureUtils';
import useMinDelay from "utils/useMinDelay";
import { useNotifications } from "../../contexts/NotificationContext";

// Mock data removed - now using real API data

const mockPosts = [
  {
    id: 1,
    author: {
      name: "Prof. Smith",
      avatar: "https://randomuser.me/api/portraits/men/32.jpg"
    },
    date: "2024-01-15",
    title: "Welcome to the new semester!",
    content: "I'm excited to start this journey with all of you. Let's make this semester productive and engaging.",
    comments: []
  },
  {
    id: 2,
    author: {
      name: "Prof. Smith",
      avatar: "https://randomuser.me/api/portraits/men/32.jpg"
    },
    date: "2024-01-14",
    title: "Classroom rules",
    content: "Please be respectful and participate actively in class discussions.",
    comments: []
  }
];

const mockAssignments = [
  {
    id: 7,
    title: "Text Encryption Model Analysis",
    due: "Nov 29, 2024, 5:00 PM",
    posted: "Nov 11, 2024",
    status: "Graded",
    description: "Create a comprehensive analysis of text encryption models. You will need to research and document four different levels of encryption, explaining the processes and conditions for each level. Include diagrams and practical examples.",
    instructions: "1. Research four different text encryption methods\n2. Create detailed diagrams for each level\n3. Explain the mathematical processes involved\n4. Provide real-world examples\n5. Submit as PDF with diagrams and explanations",
    expanded: true
  },
  {
    id: 5,
    title: "Database Design Project",
    due: "Nov 29, 2024, 5:00 PM",
    posted: "Nov 8, 2024",
    status: "Assigned",
    description: "Design a complete database system for a library management system. Include entity relationship diagrams, normalization analysis, and SQL queries for common operations.",
    instructions: "Use any database design tool (MySQL Workbench, Lucidchart, etc.) to create ERD. Include at least 5 entities with proper relationships. Submit both the diagram and SQL scripts.",
    expanded: false
  },
  {
    id: 6,
    title: "Algorithm Implementation",
    due: "Nov 16, 2024",
    posted: "Nov 5, 2024",
    status: "Assigned",
    description: "Implement and compare three sorting algorithms: Bubble Sort, Quick Sort, and Merge Sort. Analyze their time complexity and performance characteristics.",
    instructions: "Code in any programming language. Include performance analysis with different input sizes. Submit source code and analysis report.",
    expanded: false
  },
  {
    id: 8,
    title: "Final Capstone Project",
    due: "Dec 13, 2024, 5:00 PM",
    posted: "Nov 1, 2024",
    status: "Assigned",
    description: "Develop a complete web application using the technologies learned throughout the semester. This is your opportunity to showcase all your skills in a real-world project.",
    instructions: "Choose your own project idea. Must include frontend, backend, and database. Present your project to the class. Submit code, documentation, and presentation slides.",
    expanded: false
  },
  {
    id: 4,
    title: "Object-Oriented Programming Lab",
    due: "Oct 30, 2024, 5:00 PM",
    posted: "Oct 15, 2024",
    status: "Graded",
    description: "Practice object-oriented programming concepts by creating a simple banking system with classes for accounts, transactions, and customers.",
    instructions: "Implement inheritance, polymorphism, and encapsulation. Include unit tests. Submit Java source files and test results.",
    expanded: false
  },
  {
    id: 2,
    title: "Data Structures Quiz",
    due: "Sep 30, 2024, 5:00 PM",
    posted: "Sep 20, 2024",
    status: "Graded",
    description: "Online quiz covering arrays, linked lists, stacks, and queues. Multiple choice and coding questions included.",
    instructions: "Complete the quiz on the learning management system. You have 60 minutes to complete 25 questions.",
    expanded: false
  },
  {
    id: 3,
    title: "Programming Fundamentals Review",
    due: "Sep 24, 2024, 5:00 PM",
    posted: "Sep 15, 2024",
    status: "Graded",
    description: "Review assignment covering basic programming concepts including variables, loops, functions, and basic algorithms.",
    instructions: "Complete the programming exercises in the provided template. Submit your solution files.",
    expanded: false
  },
  {
    id: 1,
    title: "Course Introduction Survey",
    due: "Sep 17, 2024, 5:00 PM",
    posted: "Sep 10, 2024",
    status: "Graded",
    description: "Complete the course introduction survey to help us understand your background and learning goals.",
    instructions: "Fill out the online survey with your programming experience and course expectations.",
    expanded: false
  }
];

// Mock data for People tab
const teachers = [
  { name: "Christian S. Mallari", avatar: "https://randomuser.me/api/portraits/men/75.jpg" }
];

// Classroom members will be fetched from API

const tabList = [
  { key: "stream", label: "Stream", icon: "ni ni-chat-round" },
  { key: "classwork", label: "Classwork", icon: "ni ni-briefcase-24" },
  { key: "people", label: "People", icon: "ni ni-single-02" },
  { key: "grades", label: "Grades", icon: "ni ni-chart-bar-32" }
];

const gradeFilters = ["All", "Assigned", "Returned", "Missing"];

// Add mock announcements for student stream tab (similar to teacher)
// const mockAnnouncements = [ ... ];

// Helper to get file type, icon, and preview
const getFileTypeIconOrPreview = (att) => {
  // Debug: Log what we're receiving
  console.log('getFileTypeIconOrPreview called with:', att);
  
  // Handle different attachment types
  if (!att) {
    console.log('No attachment data, returning FILE');
    return { preview: <svg width="32" height="40" viewBox="0 0 32 40" fill="none" xmlns="http://www.w3.org/2000/svg"><rect width="32" height="40" rx="6" fill="#fff" stroke="#90A4AE" strokeWidth="2"/><path d="M8 8h16v24H8z" fill="#fff"/><text x="16" y="28" textAnchor="middle" fontSize="10" fill="#90A4AE" fontWeight="bold">FILE</text></svg>, type: 'FILE', color: '#90A4AE' };
  }

  // Handle link attachments
  if (att.type === "Link" && att.url) {
    console.log('Detected Link type');
    return { preview: <svg width="32" height="40" viewBox="0 0 32 40" fill="none" xmlns="http://www.w3.org/2000/svg"><rect width="32" height="40" rx="6" fill="#fff" stroke="#1976D2" strokeWidth="2"/><path d="M8 8h16v24H8z" fill="#fff"/><text x="16" y="28" textAnchor="middle" fontSize="10" fill="#1976D2" fontWeight="bold">LINK</text></svg>, type: 'LINK', color: '#1976D2' };
  }

  // Handle YouTube attachments
  if (att.type === "YouTube" && att.url) {
    console.log('Detected YouTube type');
    return { preview: <svg width="32" height="40" viewBox="0 0 32 40" fill="none" xmlns="http://www.w3.org/2000/svg"><rect width="32" height="40" rx="6" fill="#fff" stroke="#FF0000" strokeWidth="2"/><path d="M8 8h16v24H8z" fill="#fff"/><text x="16" y="28" textAnchor="middle" fontSize="10" fill="#FF0000" fontWeight="bold">YT</text></svg>, type: 'YOUTUBE', color: '#FF0000' };
  }

  // Handle Google Drive attachments
  if (att.type === "Google Drive" && att.url) {
    console.log('Detected Google Drive type');
    return { preview: <svg width="32" height="40" viewBox="0 0 32 40" fill="none" xmlns="http://www.w3.org/2000/svg"><rect width="32" height="40" rx="6" fill="#fff" stroke="#4285F4" strokeWidth="2"/><path d="M8 8h16v24H8z" fill="#fff"/><text x="16" y="28" textAnchor="middle" fontSize="10" fill="#4285F4" fontWeight="bold">DRIVE</text></svg>, type: 'GOOGLE DRIVE', color: '#4285F4' };
  }

  // Handle alternative type values (case-insensitive and with underscores)
  if (att.type && att.url) {
    const typeLower = att.type.toLowerCase().replace(/_/g, ' ');
    console.log('Checking alternative type:', typeLower);
    
    if (typeLower === "link") {
      console.log('Detected Link type (alternative)');
      return { preview: <svg width="32" height="40" viewBox="0 0 32 40" fill="none" xmlns="http://www.w3.org/2000/svg"><rect width="32" height="40" rx="6" fill="#fff" stroke="#1976D2" strokeWidth="2"/><path d="M8 8h16v24H8z" fill="#fff"/><text x="16" y="28" textAnchor="middle" fontSize="10" fill="#1976D2" fontWeight="bold">LINK</text></svg>, type: 'LINK', color: '#1976D2' };
    }
    
    if (typeLower === "youtube") {
      console.log('Detected YouTube type (alternative)');
      return { preview: <svg width="32" height="40" viewBox="0 0 32 40" fill="none" xmlns="http://www.w3.org/2000/svg"><rect width="32" height="40" rx="6" fill="#fff" stroke="#FF0000" strokeWidth="2"/><path d="M8 8h16v24H8z" fill="#fff"/><text x="16" y="28" textAnchor="middle" fontSize="10" fill="#FF0000" fontWeight="bold">YT</text></svg>, type: 'YOUTUBE', color: '#FF0000' };
    }
    
    if (typeLower === "google drive" || typeLower === "googledrive") {
      console.log('Detected Google Drive type (alternative)');
      return { preview: <svg width="32" height="40" viewBox="0 0 32 40" fill="none" xmlns="http://www.w3.org/2000/svg"><rect width="32" height="40" rx="6" fill="#fff" stroke="#4285F4" strokeWidth="2"/><path d="M8 8h16v24H8z" fill="#fff"/><text x="16" y="28" textAnchor="middle" fontSize="10" fill="#4285F4" fontWeight="bold">DRIVE</text></svg>, type: 'GOOGLE DRIVE', color: '#4285F4' };
    }
  }

  // Handle file attachments
  const fileName = att.name;
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
  if (ext === 'mp3') return { preview: <svg width="32" height="40" viewBox="0 0 32 40" fill="none" xmlns="http://www.w3.org/2000/svg"><rect width="32" height="40" rx="6" fill="#fff" stroke="#43a047" strokeWidth="2"/><circle cx="16" cy="20" r="7" fill="#43a047"/><rect x="22" y="13" width="3" height="14" rx="1.5" fill="#43a047"/><text x="16" y="36" textAnchor="middle" fontSize="10" fill="#43a047" fontWeight="bold">MP3</text></svg>, type: 'MP3', color: '#43a047' };
  if (ext === 'pdf') return { preview: <svg width="32" height="40" viewBox="0 0 32 40" fill="none" xmlns="http://www.w3.org/2000/svg"><rect width="32" height="40" rx="6" fill="#fff" stroke="#F44336" strokeWidth="2"/><path d="M8 8h16v24H8z" fill="#fff"/><text x="16" y="28" textAnchor="middle" fontSize="10" fill="#F44336" fontWeight="bold">PDF</text></svg>, type: 'PDF', color: '#F44336' };
  return { preview: <svg width="32" height="40" viewBox="0 0 32 40" fill="none" xmlns="http://www.w3.org/2000/svg"><rect width="32" height="40" rx="6" fill="#fff" stroke="#90A4AE" strokeWidth="2"/><path d="M8 8h16v24H8z" fill="#fff"/><text x="16" y="28" textAnchor="middle" fontSize="10" fill="#90A4AE" fontWeight="bold">FILE</text></svg>, type: ext.toUpperCase(), color: '#90A4AE' };
};

// Helper to format relative time
function formatRelativeTime(dateString) {
  if (!dateString) return '';
  const now = new Date();
  const date = new Date(dateString);
  const diff = (now - date) / 1000;
  if (isNaN(diff)) return '';
  if (diff < 60) return 'Just now';
  if (diff < 3600) {
    const mins = Math.floor(diff / 60);
    return `${mins} min${mins > 1 ? 's' : ''} ago`;
  }
  if (diff < 86400) {
    const hours = Math.floor(diff / 3600);
    return `${hours} hour${hours > 1 ? 's' : ''} ago`;
  }
  if (diff < 604800) {
    const days = Math.floor(diff / 86400);
    return `${days} day${days > 1 ? 's' : ''} ago`;
  }
  return date.toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' });
}



const ClassroomDetailStudent = () => {
  const { code } = useParams();
  const navigate = useNavigate();
  const { addNotification } = useNotifications();
  const [activeTab, setActiveTab] = useState("stream");
  // Initialize active tab from URL query (?tab=class)
  useEffect(() => {
    try {
      const params = new URLSearchParams(window.location.search);
      const tab = params.get('tab');
      if (tab && ['stream','classwork','people','grades'].includes(tab)) {
        setActiveTab(tab);
      }
    } catch (_) {}
  }, []);

  const [announcement, setAnnouncement] = useState("");
  const [expandedId, setExpandedId] = useState(7);
  const [gradeFilter, setGradeFilter] = useState("All");
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [expandedGradeId, setExpandedGradeId] = useState(7);
  const [currentClass, setCurrentClass] = useState(null);
  const [loadingClass, setLoadingClass] = useState(true);
  const showClassLoader = useMinDelay(loadingClass, 1600);
  const [studentAnnouncement, setStudentAnnouncement] = useState("");
  const [studentAnnouncements, setStudentAnnouncements] = useState([]);
  const [formExpanded, setFormExpanded] = useState(false);
  const [allowComments, setAllowComments] = useState(true);
  const [announcementTitle, setAnnouncementTitle] = useState("");
  // Likes disabled on student stream
  // const [likedAnnouncements, setLikedAnnouncements] = useState({});
  const [openMenuId, setOpenMenuId] = useState(null);
  const menuRef = useRef();
  const [editingAnnouncementId, setEditingAnnouncementId] = useState(null);
  const [editAnnouncementTitle, setEditAnnouncementTitle] = useState("");
  const [editAnnouncementContent, setEditAnnouncementContent] = useState("");
  const [attachmentDropdownOpenId, setAttachmentDropdownOpenId] = useState(null); // id of announcement or 'new' for new post
  const attachmentMenuRef = useRef();
  const [showYouTubeModal, setShowYouTubeModal] = useState(false);
  
  // Add current user profile state for conditional menu rendering
  const [currentUserProfile, setCurrentUserProfile] = useState(null);

  const notifyUnderDevelopment = () => {
    try {
      addNotification({
        type: 'info',
        title: 'Feature Under Development',
        message: 'This section is currently under development.',
        duration: 4000,
      });
    } catch (e) {
      // eslint-disable-next-line no-alert
      alert('Feature Under Development');
    }
  };
  const [showDriveModal, setShowDriveModal] = useState(false);
  const [showLinkModal, setShowLinkModal] = useState(false);
  const [modalUrl, setModalUrl] = useState("");
  const [attachments, setAttachments] = useState([]); // for new post
  const [editAttachments, setEditAttachments] = useState({}); // { [id]: [attachments] }
  const fileInputRef = useRef();
  const [openCommentMenu, setOpenCommentMenu] = useState({}); // { [announcementId]: commentIdx }
  const commentMenuRef = useRef();
  const [editingComment, setEditingComment] = useState({}); // { announcementId, idx }
  const [editCommentValue, setEditCommentValue] = useState("");
  const [collapsedComments, setCollapsedComments] = useState({}); // { [announcementId]: boolean }
  // Add emoji picker state and emoji list
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const emojiPickerRef = useRef();
  
  // Student post functionality state





  const emojiList = [
    "😀", "😁", "😂", "🤣", "😃", "😄", "😅", "😆", "😉", "😊", "😋", "😎", "😍", "😘", "🥰", "😗", "😙", "😚", "🙂", "🤗", "🤩", "🤔", "🤨", "😐", "😑", "😶", "🙄", "😏", "😣", "😥", "😮", "🤐", "😯", "😪", "😫", "🥱", "😴", "😌", "😛", "😜", "😝", "🤤", "😒", "😓", "😔", "😕", "🙃", "🤑", "😲", "☹️", "🙁", "😖", "😞", "😟", "😤", "😢", "😭", "😦", "😧", "😨", "😩", "🤯", "😬", "😰", "😱", "🥵", "🥶", "😳", "🤪", "😵", "😡", "😠", "🤬", "😷", "🤒", "🤕", "🤢", "🤮", "🤧", "😇", "🥳", "🥺", "🤠", "🥸", "😈", "👿", "👹", "👺", "💀", "👻", "👽", "🤖", "💩", "😺", "😸", "😹", "😻", "😼", "😽", "🙀", "😿", "😾",
    // Heart emojis
    "❤️", "🧡", "💛", "💚", "💙", "💜", "🖤", "🤍", "🤎", "💔", "❣️", "💕", "💞", "💓", "💗", "💖", "💘", "💝", "💟"
  ];



  const [copied, setCopied] = useState(false);
  const [tooltipHover, setTooltipHover] = useState(false);
  // Add preview modal state and handler at the top of the component
  const [previewModalOpen, setPreviewModalOpen] = useState(false);
  const [previewAttachment, setPreviewAttachment] = useState(null);
  const [previewText, setPreviewText] = useState("");
  // MP3 preview design state and logic
  const mp3Backgrounds = [
    'linear-gradient(135deg, #232526 0%, #414345 100%)',
    'linear-gradient(135deg, #141e30 0%, #243b55 100%)',
    'linear-gradient(135deg, #283e51 0%, #485563 100%)',
    'linear-gradient(135deg, #434343 0%, #262626 100%)',
    'linear-gradient(135deg, #373b44 0%, #4286f4 100%)',
    'linear-gradient(135deg, #1a2980 0%, #26d0ce 100%)',
    'linear-gradient(135deg, #0f2027 0%, #2c5364 100%)',
  ];
  const [mp3BgIndex, setMp3BgIndex] = useState(0);
  const audioRef = useRef(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [audioUrl, setAudioUrl] = useState(null);
  const visualizerIntervalRef = useRef(null);
  const wavePathRef = useRef(null);
  
  useEffect(() => {
    const interval = setInterval(() => {
      setMp3BgIndex(idx => (idx + 1) % mp3Backgrounds.length);
    }, 30000);
    return () => clearInterval(interval);
  }, []);
  
  useEffect(() => {
    if (previewAttachment && previewAttachment.file && previewAttachment.file.type && previewAttachment.file.type.startsWith('audio/')) {
      const url = typeof previewAttachment.file === 'string' ? previewAttachment.file : URL.createObjectURL(previewAttachment.file);
      setAudioUrl(url);
      return () => { if (typeof previewAttachment.file !== 'string') URL.revokeObjectURL(url); };
    }
  }, [previewAttachment]);

  // Fetch current user profile for conditional menu rendering
  useEffect(() => {
    let isMounted = true;
    (async () => {
      try {
        const res = await apiService.getCurrentUser();
        if (isMounted && res && (res.status === true || res.success === true) && (res.data || res.user)) {
          const data = res.data || res.user;
          setCurrentUserProfile(data);
        }
      } catch (_) {}
    })();
    return () => { isMounted = false; };
  }, []);
  
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;
    const handlePlay = () => {
      setIsPlaying(true);
      // Start visualizer
      const bars = document.querySelectorAll('.visualizer-bar');
      visualizerIntervalRef.current = setInterval(() => {
        bars.forEach((bar, index) => {
          const height = Math.random() * 50 + 10;
          bar.style.height = height + 'px';
          bar.style.animationDelay = (index * 0.1) + 's';
        });
      }, 100);
    };
    const handlePause = () => {
      setIsPlaying(false);
      // Stop visualizer
      if (visualizerIntervalRef.current) {
        clearInterval(visualizerIntervalRef.current);
        visualizerIntervalRef.current = null;
        const bars = document.querySelectorAll('.visualizer-bar');
        bars.forEach(bar => {
          bar.style.height = '10px';
        });
      }
    };
    audio.addEventListener('play', handlePlay);
    audio.addEventListener('pause', handlePause);
    audio.addEventListener('ended', handlePause);
    return () => {
      audio.removeEventListener('play', handlePlay);
      audio.removeEventListener('pause', handlePause);
      audio.removeEventListener('ended', handlePause);
      if (visualizerIntervalRef.current) {
        clearInterval(visualizerIntervalRef.current);
        visualizerIntervalRef.current = null;
      }
    };
  }, [audioUrl]);

  const auth = useAuth();
  const user = auth?.user;
  // Fallback for environments where useAuth is not available
  let loggedInName = user?.full_name || user?.name;
  if (!loggedInName) {
    try {
      const localUser = JSON.parse(localStorage.getItem('scms_logged_in_user'));
      loggedInName = localUser?.full_name || localUser?.name;
    } catch {}
  }
  if (!loggedInName) loggedInName = 'You';









  // Close emoji picker on outside click
  useEffect(() => {
    function handleClick(e) {
      if (showEmojiPicker && emojiPickerRef.current && !emojiPickerRef.current.contains(e.target)) {
        setShowEmojiPicker(false);
      }
    }
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, [showEmojiPicker]);

  // Helper to insert emoji at cursor position
  function insertEmojiAtCursor(emoji) {
    const textarea = document.getElementById('student-announcement-textarea');
    if (textarea) {
      const start = textarea.selectionStart;
      const end = textarea.selectionEnd;
      const before = studentAnnouncement.substring(0, start);
      const after = studentAnnouncement.substring(end);
      setStudentAnnouncement(before + emoji + after);
      setTimeout(() => {
        textarea.focus();
        textarea.selectionStart = textarea.selectionEnd = start + emoji.length;
      }, 0);
    } else {
      setStudentAnnouncement(studentAnnouncement + emoji);
    }
    setShowEmojiPicker(false);
  }

  // Close menu on outside click
  useEffect(() => {
    function handleClick(e) {
      if (openMenuId !== null && menuRef.current && !menuRef.current.contains(e.target)) {
        setOpenMenuId(null);
      }
    }
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, [openMenuId]);

  // Close attachment dropdown on outside click
  useEffect(() => {
    function handleClick(e) {
      if (attachmentDropdownOpenId && attachmentMenuRef.current && !attachmentMenuRef.current.contains(e.target)) {
        setAttachmentDropdownOpenId(null);
      }
    }
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, [attachmentDropdownOpenId]);

  // Close comment menu on outside click
  useEffect(() => {
    function handleClick(e) {
      if (Object.keys(openCommentMenu).length && commentMenuRef.current && !commentMenuRef.current.contains(e.target)) {
        setOpenCommentMenu({});
      }
    }
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, [openCommentMenu]);

  // function handleLike(announcement) {}

  function handleEditClick(announcement) {
    setEditingAnnouncementId(announcement.id);
    setEditAnnouncementTitle(announcement.title);
    setEditAnnouncementContent(announcement.content);
    setOpenMenuId(null);
  }

  function handleEditSave(announcement) {
    // Update in studentAnnouncements if it's a student post, else in mockAnnouncements
    if (studentAnnouncements.some(a => a.id === announcement.id)) {
      setStudentAnnouncements(prev => prev.map(a => a.id === announcement.id ? { ...a, title: editAnnouncementTitle, content: editAnnouncementContent } : a));
    } else {
      announcement.title = editAnnouncementTitle;
      announcement.content = editAnnouncementContent;
    }
    setEditingAnnouncementId(null);
  }

  function handleEditCancel() {
    setEditingAnnouncementId(null);
  }

  function handleUnpin(announcement) {
    announcement.isPinned = false;
    setOpenMenuId(null);
    // Force re-render for mockAnnouncements (if needed)
    setStudentAnnouncements(prev => [...prev]);
  }

  function handlePin(announcement) {
    announcement.isPinned = true;
    setOpenMenuId(null);
    setStudentAnnouncements(prev => [...prev]);
  }

  function handleAttachmentOption(option) {
    setAttachmentDropdownOpenId(null);
    if (option === 'youtube') {
      setShowYouTubeModal(true);
      setModalUrl("");
    } else if (option === 'drive') {
      setShowDriveModal(true);
      setModalUrl("");
    } else if (option === 'link') {
      setShowLinkModal(true);
      setModalUrl("");
    } else if (option === 'file') {
      if (fileInputRef.current) fileInputRef.current.click();
    }
  }
  function handleAddModalAttachment(type, forEditId) {
    const att = { type, url: modalUrl };
    if (forEditId) {
      setEditAttachments(prev => ({ ...prev, [forEditId]: [...(prev[forEditId] || []), att] }));
    } else {
      setAttachments(prev => [...prev, att]);
    }
    setShowYouTubeModal(false);
    setShowDriveModal(false);
    setShowLinkModal(false);
    setModalUrl("");
  }
  function handleFileChange(e, forEditId) {
    const file = e.target.files[0];
    if (!file) return;
    const att = { type: 'file', file, name: file.name };
    if (forEditId) {
      setEditAttachments(prev => ({ ...prev, [forEditId]: [...(prev[forEditId] || []), att] }));
    } else {
      setAttachments(prev => [...prev, att]);
    }
    e.target.value = "";
  }

  function handleCommentMenu(announcementId, idx) {
    setOpenCommentMenu(openCommentMenu.announcementId === announcementId && openCommentMenu.idx === idx ? {} : { announcementId, idx });
  }
  function handleCommentEdit(announcementId, idx) {
    setOpenCommentMenu({});
    setEditingComment({ announcementId, idx });
    const ann = [...studentAnnouncements, ...apiAnnouncements].find(a => a.id === announcementId);
    setEditCommentValue(ann.comments[idx].text);
  }
  async function handleCommentEditSave(announcementId, idx) {
    const ann = [...studentAnnouncements, ...apiAnnouncements].find(a => a.id === announcementId);
    if (!ann) return;
    const existing = ann.comments[idx];
    const commentId = existing?.id;
    const newText = editCommentValue.trim();
    if (!newText) return;

    try {
      const res = await apiService.editStudentStreamComment(code, announcementId, commentId, newText);
      const raw = Array.isArray(res?.data) ? res.data : (res?.comments || []);
      const comments = raw.map(c => ({
        id: c.id || c.comment_id || c.id_comment,
        author: c.user_name || c.author || c.name || 'Unknown',
        text: c.comment || c.text || '',
        date: c.created_at || c.date || null,
        profile_pic: c.user_avatar || c.profile_pic || c.user_profile_pic || null,
      }));
      if (studentAnnouncements.some(a => a.id === announcementId)) {
        setStudentAnnouncements(prev => prev.map(a => a.id === announcementId ? { ...a, comments } : a));
      } else {
        setApiAnnouncements(prev => prev.map(a => a.id === announcementId ? { ...a, comments } : a));
      }
    } catch (err) {
      console.warn('Failed to edit comment:', err?.message || err);
      // optimistic local update
      if (studentAnnouncements.some(a => a.id === announcementId)) {
        setStudentAnnouncements(prev => prev.map(a => a.id === announcementId ? { ...a, comments: a.comments.map((c, i) => i === idx ? { ...c, text: newText } : c) } : a));
      } else {
        setApiAnnouncements(prev => prev.map(a => a.id === announcementId ? { ...a, comments: a.comments.map((c, i) => i === idx ? { ...c, text: newText } : c) } : a));
      }
    } finally {
      setEditingComment({});
      setEditCommentValue("");
    }
  }
  function handleCommentEditCancel() {
    setEditingComment({});
    setEditCommentValue("");
  }
  async function handleCommentDelete(announcementId, idx) {
    setOpenCommentMenu({});
    const ann = [...studentAnnouncements, ...apiAnnouncements].find(a => a.id === announcementId);
    const commentId = ann?.comments?.[idx]?.id;
    try {
      await apiService.deleteStudentStreamComment(code, announcementId, commentId);
      // After deletion, re-fetch comments for accurate list or remove locally
      const res = await apiService.getStudentStreamComments(code, announcementId);
      const raw = Array.isArray(res?.data) ? res.data : (res?.comments || []);
      const comments = raw.map(c => ({
        id: c.id || c.comment_id || c.id_comment,
        author: c.user_name || c.author || c.name || 'Unknown',
        text: c.comment || c.text || '',
        date: c.created_at || c.date || null,
        profile_pic: c.user_avatar || c.profile_pic || c.user_profile_pic || null,
      }));
      if (studentAnnouncements.some(a => a.id === announcementId)) {
        setStudentAnnouncements(prev => prev.map(a => a.id === announcementId ? { ...a, comments } : a));
      } else {
        setApiAnnouncements(prev => prev.map(a => a.id === announcementId ? { ...a, comments } : a));
      }
    } catch (err) {
      console.warn('Failed to delete comment:', err?.message || err);
      // fallback to local removal
      if (studentAnnouncements.some(a => a.id === announcementId)) {
        setStudentAnnouncements(prev => prev.map(a => a.id === announcementId ? { ...a, comments: a.comments.filter((_, i) => i !== idx) } : a));
      } else {
        setApiAnnouncements(prev => prev.map(a => a.id === announcementId ? { ...a, comments: a.comments.filter((_, i) => i !== idx) } : a));
      }
    }
  }

  // Helper to post a new announcement as student with smart notifications
  const handleStudentPostAnnouncement = async (e) => {
    e.preventDefault();
    if (!studentAnnouncement.trim()) return;

    try {
      // Prepare post data
      const postData = {
        title: announcementTitle,
        content: studentAnnouncement,
        is_draft: 0,
        is_scheduled: 0,
        scheduled_at: "",
        allow_comments: allowComments ? 1 : 0,
        attachment_type: attachments.length > 0 ? "file" : null,
        attachment_url: attachments.length > 0 ? attachments[0].url : "",
        // Smart notification logic: if selected students are specified, use them
        student_ids: selectedAnnouncementStudents.length > 0 ? selectedAnnouncementStudents : null
      };

      console.log('Posting student announcement with smart notifications:', postData);
      console.log('Selected students:', selectedAnnouncementStudents);
      console.log('Class code:', code);

      // Use the new API method with smart notification logic
      const response = await apiService.createStudentPostWithSmartNotifications(code, postData);

      console.log('Post response with notifications:', response);

      if (response.status) {
        // Create local announcement object for UI
        const newAnn = {
          id: response.data.id,
          title: announcementTitle,
          content: studentAnnouncement,
          author: loggedInName,
          date: response.data.created_at,
          isPinned: false,
          reactions: { like: 0, likedBy: [] },
          comments: [],
          allowComments: allowComments,
          attachments: attachments
        };

        // Add to local state
        setStudentAnnouncements([newAnn, ...studentAnnouncements]);
        
        // Show success message with notification info
        const notificationInfo = response.smartNotificationLogic;
        console.log(`Post created successfully! Notifications sent to ${notificationInfo.totalRecipients} recipients (${notificationInfo.teacherNotified ? '1 teacher' : '0 teachers'}, ${notificationInfo.studentsNotified} students)`);
        
        // Reset form
        setStudentAnnouncement("");
        setAnnouncementTitle("");
        setAllowComments(true);
        setFormExpanded(false);
        setAttachments([]);
        setEditingDraftId(null);
        setSelectedAnnouncementStudents([]); // Reset selected students
      } else {
        console.error('Failed to create post:', response.message);
      }
    } catch (error) {
      console.error('Error posting announcement:', error);
      // You could add a toast notification here
    }
  };



  



  // Add state for comment input and emoji picker per announcement
  const [commentInputs, setCommentInputs] = useState({}); // { [announcementId]: value }
  const [showCommentEmojiPicker, setShowCommentEmojiPicker] = useState({}); // { [announcementId]: bool }
  const commentEmojiPickerRefs = useRef({});

  // Close comment emoji picker on outside click
  useEffect(() => {
    function handleClick(e) {
      Object.keys(showCommentEmojiPicker).forEach(id => {
        if (showCommentEmojiPicker[id] && commentEmojiPickerRefs.current[id] && !commentEmojiPickerRefs.current[id].contains(e.target)) {
          setShowCommentEmojiPicker(prev => ({ ...prev, [id]: false }));
        }
      });
    }
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, [showCommentEmojiPicker]);







  function handleCommentInputChange(announcementId, value) {
    setCommentInputs(inputs => ({ ...inputs, [announcementId]: value }));
  }
  function handleAddEmojiToComment(announcementId, emoji) {
    setCommentInputs(inputs => ({ ...inputs, [announcementId]: (inputs[announcementId] || "") + emoji }));
    setShowCommentEmojiPicker(prev => ({ ...prev, [announcementId]: false }));
  }
  async function handlePostComment(announcementId) {
    const value = (commentInputs[announcementId] || "").trim();
    if (!value) return;

    try {
      const res = await apiService.addStudentStreamComment(code, announcementId, value);
      // API returns full, normalized list of comments; rebuild into our UI shape
      const raw = Array.isArray(res?.data) ? res.data : (res?.comments || []);
      const comments = raw.map(c => ({
        id: c.id || c.comment_id || c.id_comment,
        author: c.user_name || c.author || c.name || 'Unknown',
        text: c.comment || c.text || '',
        date: c.created_at || c.date || null,
        profile_pic: c.user_avatar || c.profile_pic || c.user_profile_pic || null,
      }));

      // Update the correct announcements array
      if (studentAnnouncements.some(a => a.id === announcementId)) {
        setStudentAnnouncements(prev => prev.map(a => a.id === announcementId ? { ...a, comments } : a));
      } else {
        setApiAnnouncements(prev => prev.map(a => a.id === announcementId ? { ...a, comments } : a));
      }
    } catch (err) {
      console.warn('Failed to add comment:', err?.message || err);
      // Optimistic fallback if API fails
      if (studentAnnouncements.some(a => a.id === announcementId)) {
        setStudentAnnouncements(prev => prev.map(a => a.id === announcementId ? { ...a, comments: [...a.comments, { text: value, author: loggedInName, date: new Date().toISOString() }] } : a));
      } else {
        const ann = apiAnnouncements.find(a => a.id === announcementId);
        if (ann) ann.comments.push({ text: value, author: loggedInName, date: new Date().toISOString() });
      }
    } finally {
      setCommentInputs(inputs => ({ ...inputs, [announcementId]: "" }));
    }
  }

  // Before rendering the announcements list:
  const [apiAnnouncements, setApiAnnouncements] = useState([]);
  const [loadingAnnouncements, setLoadingAnnouncements] = useState(true);
  const [errorAnnouncements, setErrorAnnouncements] = useState(null);

  useEffect(() => {
    async function fetchAnnouncements() {
      setLoadingAnnouncements(true);
      setErrorAnnouncements(null);
      console.log("Fetching announcements for class:", code);
      
      const token = localStorage.getItem('token');
      if (!token) {
        console.error("No authentication token found");
        setErrorAnnouncements("Authentication required. Please login.");
        setLoadingAnnouncements(false);
        return;
      }
      
      try {
        const res = await axios.get(
          `http://localhost/scms_new_backup/index.php/api/student/classroom/${code}/stream`,
          {
            headers: {
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'application/json',
            },
          }
        );
        console.log("API response:", res.data);
        if (res.data.status && Array.isArray(res.data.data)) {
          // Build a clean base URL for serving uploads (strip /index.php/api and /api)
          const rawBase = (process.env.REACT_APP_API_BASE_URL || 'http://localhost/scms_new_backup/index.php/api');
          const base = rawBase
            .replace('/index.php/api', '')
            .replace('/api', '')
            .replace(/\/$/, '');

          // Helper: parse "YYYY-MM-DD HH:mm:ss" as local date
          const parseSqlLocal = (dateTimeStr) => {
            if (!dateTimeStr || typeof dateTimeStr !== 'string') return null;
            try {
              const [d, t] = dateTimeStr.split(' ');
              if (!d || !t) return null;
              const [y, m, day] = d.split('-').map(n => parseInt(n, 10));
              const [hh, mm, ss] = t.split(':').map(n => parseInt(n, 10));
              return new Date(y, (m - 1), day, hh, mm, ss || 0);
            } catch (_) {
              return new Date(dateTimeStr);
            }
          };

          // Fetch scheduled posts and include only those due and visible to current student
          let combinedData = res.data.data;
          try {
            const scheduledRes = await apiService.getClassroomStreamScheduled(code);
            if (scheduledRes?.status && Array.isArray(scheduledRes.data)) {
              let currentStudentId = null;
              try {
                const storedUser = localStorage.getItem('user');
                if (storedUser) {
                  const parsedUser = JSON.parse(storedUser);
                  currentStudentId = parsedUser.id || parsedUser.user_id || parsedUser.userId || parsedUser.uid || parsedUser._id || null;
                }
              } catch (_) {}

              const now = new Date();
              const dueScheduled = scheduledRes.data.filter((item) => {
                if (!item || !item.scheduled_at) return false;
                const scheduleTime = parseSqlLocal(item.scheduled_at);
                if (!scheduleTime || scheduleTime > now) return false; // only include posts due now or earlier

                // Visibility: if no student_ids, visible to all; otherwise must include current student
                const sid = item.student_ids;
                if (!sid || sid === 'null' || sid === '[]') return true;
                try {
                  const arr = Array.isArray(sid) ? sid : JSON.parse(sid);
                  return Array.isArray(arr) && arr.map(String).includes(String(currentStudentId));
                } catch (_) {
                  return false;
                }
              });

              if (Array.isArray(dueScheduled) && dueScheduled.length > 0) {
                combinedData = [...combinedData, ...dueScheduled];
              }
            }
          } catch (e) {
            console.warn('Failed to fetch scheduled posts for student stream:', e?.message || e);
          }

          // Map API data to UI structure
          const mapped = combinedData.map((item) => {
            let attachments = [];

            // 1) Prefer explicit attachments array from API
            if (Array.isArray(item.attachments) && item.attachments.length > 0) {
              attachments = item.attachments
                .map((att) => ({
                  type: att.attachment_type || att.file_type || 'file',
                  name: att.original_name || att.file_name || (att.file_path || '').split('/').pop(),
                  url: att.file_path ? `${base}/${att.file_path.replace(/\\/g, '/')}` : (att.serving_url || ''),
                  fileType: att.file_type,
                  size: att.file_size,
                }))
                .filter((a) => a.url);
            } else if (
              item.attachment_type === 'multiple' && typeof item.attachment_url === 'string'
            ) {
              // 2) Handle multiple attachments when backend returns JSON string in attachment_url
              try {
                const parsed = JSON.parse(item.attachment_url);
                const arr = Array.isArray(parsed) ? parsed : [parsed];
                attachments = arr
                  .map((f) => ({
                    type: f.attachment_type || f.file_type || 'file',
                    name: f.original_name || f.file_name || (f.file_path || '').split('/').pop(),
                    url: f.file_path ? `${base}/${f.file_path.replace(/\\/g, '/')}` : (f.serving_url || ''),
                    fileType: f.file_type,
                    size: f.file_size,
                  }))
                  .filter((a) => a.url);
              } catch (e) {
                // Fall back to single attachment logic below
              }
            }

            // 3) Single attachment fields fallback
            if (attachments.length === 0 && (item.attachment_url || item.attachment_serving_url)) {
              const directUrl = (item.attachment_url && !String(item.attachment_url).startsWith('http'))
                ? `${base}/${String(item.attachment_url).replace(/\\/g, '/')}`
                : (item.attachment_url || item.attachment_serving_url);
              if (directUrl) {
                attachments = [
                  {
                    type: item.attachment_type || item.attachment_file_type || 'file',
                    name: (item.original_name || String(item.attachment_url || item.attachment_serving_url).split('/').pop()),
                    url: directUrl,
                    fileType: item.attachment_file_type,
                  },
                ];
              }
            }

            // Prefer scheduled_at as the visible date if present (so scheduled posts sort by publish time)
            const effectiveDate = item.scheduled_at || item.created_at;

            return {
              id: item.id,
              title: item.title || '',
              content: item.content || '',
              author: item.user_name || 'Unknown',
              avatar: item.user_avatar ? `${base}/${String(item.user_avatar).replace(/\\/g, '/')}` : undefined,
              date: effectiveDate,
              isPinned: item.is_pinned === '1' || item.is_pinned === 1,
              reactions: { like: item.like_count || 0, likedBy: [] },
              comments: [],
              attachments,
              allowComments: true,
            };
          });
          console.log("Mapped announcements:", mapped);
          setApiAnnouncements(mapped);
          // Collapse comments by default for all loaded announcements
          setCollapsedComments(prev => {
            const next = { ...prev };
            mapped.forEach(p => {
              if (typeof next[p.id] === 'undefined') next[p.id] = true;
            });
            return next;
          });

          // Hydrate each announcement with real comment counts upfront
          try {
            const commentsArrays = await Promise.all(
              mapped.map(async (p) => {
                try {
                  const res = await apiService.getStudentStreamComments(code, p.id);
                  const raw = Array.isArray(res?.data) ? res.data : (res?.comments || []);
                  const normalized = raw.map(c => ({
                    id: c.id || c.comment_id || c.id_comment,
                    author: c.author || c.user_name || c.full_name || c.name || c.user || 'Unknown',
                    text: c.text || c.comment || c.content || '',
                    date: c.date || c.created_at || c.createdAt || c.timestamp || null,
                    profile_pic: c.user_avatar || c.user_profile_pic || c.profile_pic || c.avatar || c.profile_picture || null,
                  }));
                  return { id: p.id, comments: normalized };
                } catch (_err) {
                  return { id: p.id, comments: [] };
                }
              })
            );
            if (commentsArrays && commentsArrays.length > 0) {
              setApiAnnouncements(prev => prev.map(a => {
                const found = commentsArrays.find(x => x.id === a.id);
                return found ? { ...a, comments: found.comments } : a;
              }));
            }
          } catch (_e) {
            // Ignore hydration errors; counts will still load on expand
          }
        } else {
          console.log("No data or invalid response structure:", res.data);
          setApiAnnouncements([]);
        }
      } catch (err) {
        console.error("Error fetching announcements:", err);
        console.error("Error response:", err.response);
        setErrorAnnouncements("Failed to load announcements");
        setApiAnnouncements([]);
      } finally {
        setLoadingAnnouncements(false);
      }
    }
    fetchAnnouncements();
    // Auto-refresh student stream every 60s to pick up newly-published scheduled posts
    const refreshId = setInterval(fetchAnnouncements, 60000);
    return () => clearInterval(refreshId);
  }, []);

  const sortedAnnouncements = [
    ...studentAnnouncements,
    ...apiAnnouncements
  ].sort((a, b) => {
    if (a.isPinned && !b.isPinned) return -1;
    if (!a.isPinned && b.isPinned) return 1;
    return new Date(b.date) - new Date(a.date);
  });

  // Add state for student selection modal and selected students for the post
  const [showStudentSelectModal, setShowStudentSelectModal] = useState(false);
  const [studentSearch, setStudentSearch] = useState("");
  const [tempSelectedStudents, setTempSelectedStudents] = useState([]); // array of student names or ids
  const [selectedAnnouncementStudents, setSelectedAnnouncementStudents] = useState([]); // for the post
  
  // Add state for classroom members (replacing hardcoded classmates)
  const [classroomMembers, setClassroomMembers] = useState([]);
  const [loadingClassroomMembers, setLoadingClassroomMembers] = useState(false);
  const [classroomMembersError, setClassroomMembersError] = useState(null);
  
  const getAvatarForUser = (user) => {
    if (!user) return null;
    
    // Use the imported getProfilePictureUrl utility for proper URL handling
    const profilePictureUrl = getProfilePictureUrl(user);
    if (profilePictureUrl) {
      return profilePictureUrl;
    }
    
    // Fallback to default avatar if no profile picture
    return null;
  };

  // Find a classroom member (teacher or student) by name for avatar resolution
  const findMemberByName = (name) => {
    if (!name) return null;
    const normalized = String(name).toLowerCase();
    // Search teacher
    if (peopleData?.teacher) {
      const t = peopleData.teacher;
      const tName = (t.full_name || t.name || '').toLowerCase();
      if (tName === normalized) return t;
    }
    // Search students
    if (Array.isArray(peopleData?.students)) {
      const found = peopleData.students.find(s => (s.full_name || s.name || '').toLowerCase() === normalized);
      if (found) return found;
    }
    return null;
  };

  // Add state for 3-dots dropdown
  const [showPostOptionsDropdown, setShowPostOptionsDropdown] = useState(false);
  const postOptionsDropdownRef = useRef();

  // Close 3-dots dropdown on outside click
  useEffect(() => {
    function handleClick(e) {
      if (showPostOptionsDropdown && postOptionsDropdownRef.current && !postOptionsDropdownRef.current.contains(e.target)) {
        setShowPostOptionsDropdown(false);
      }
    }
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, [showPostOptionsDropdown]);

  // Add state for scheduled modal and scheduled announcements
  const [showScheduleModal, setShowScheduleModal] = useState(false);
  const [scheduleDate, setScheduleDate] = useState("");
  const [scheduleTime, setScheduleTime] = useState("");
  const [scheduledAnnouncements, setScheduledAnnouncements] = useState([]);

  // After scheduledAnnouncements state:
  useEffect(() => {
    const interval = setInterval(() => {
      const now = new Date();
      setScheduledAnnouncements(prev => {
        const due = prev.filter(a => new Date(a.date) <= now);
        if (due.length > 0) {
          setStudentAnnouncements(current => [...due, ...current]);
        }
        return prev.filter(a => new Date(a.date) > now);
      });
    }, 30000); // check every 30 seconds
    return () => clearInterval(interval);
  }, []);

  // Add state for drafts
  const [draftAnnouncements, setDraftAnnouncements] = useState([]);
  // Add state to track if editing a draft
  const [editingDraftId, setEditingDraftId] = useState(null);

  const handleCopyCode = () => {
    if (currentClass) {
      navigator.clipboard.writeText(currentClass.code);
      setCopied(true);
      setTooltipHover(true);
      setTimeout(() => {
        setCopied(false);
        setTooltipHover(false);
      }, 1200);
    }
  };

  const handlePreviewAttachment = async (att) => {
    try {
      setPreviewText("");
      // If we only have a URL from the API, fetch it and create a Blob for preview
      if (!att.file && att.url) {
        const res = await fetch(att.url);
        if (!res.ok) throw new Error(`Failed to fetch file: ${res.status}`);
        const contentType = res.headers.get('Content-Type') || '';
        const blob = await res.blob();
        // Infer name/type from extension if needed
        const name = att.name || (att.url.split('/').pop());
        const ext = name?.split('.').pop()?.toLowerCase() || '';
        let mime = contentType;
        if (!mime) {
          if (ext === 'pdf') mime = 'application/pdf';
          else if (['jpg','jpeg','png','gif','webp','bmp','svg'].includes(ext)) mime = `image/${ext === 'jpg' ? 'jpeg' : ext}`;
          else if (['mp3','mpeg'].includes(ext)) mime = 'audio/mpeg';
          else if (ext === 'mp4') mime = 'video/mp4';
        }
        const fileLike = new File([blob], name || 'file', { type: mime || blob.type || 'application/octet-stream' });
        setPreviewAttachment({ ...att, file: fileLike, name: name });
      } else {
        setPreviewAttachment(att);
        // Load text preview if applicable
        const ext = att.name ? att.name.split('.').pop().toLowerCase() : '';
        if ((ext === 'txt' || ext === 'csv') && att.file) {
          const text = await att.file.text();
          setPreviewText(text);
        }
      }
      setPreviewModalOpen(true);
    } catch (e) {
      setPreviewAttachment(att);
      setPreviewModalOpen(true);
    }
  };

  // Helper to get file type icon for attachments
  function getFileTypeIcon(att) {
    if (!att) return null;
    const fileName = att.name || '';
    const ext = fileName.split('.').pop().toLowerCase();
    const imageTypes = ['jpg', 'jpeg', 'png', 'gif', 'webp', 'bmp', 'svg'];
    const wordExts = ['doc', 'docx', 'dot', 'dotx', 'docm', 'dotm'];
    const excelExts = ['xls', 'xlsx', 'xlsm', 'xlsb', 'xlt', 'xltx', 'xltm', 'csv'];
    const pptExts = ['ppt', 'pptx', 'pps', 'ppsx', 'pptm', 'potx', 'potm', 'ppsm'];
    
    if (att.type === 'link') {
      return <svg width="32" height="40" viewBox="0 0 32 40" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ marginRight: 14 }}><rect width="32" height="40" rx="6" fill="#fff" stroke="#1976D2" strokeWidth="2"/><path d="M8 8h16v24H8z" fill="#fff"/><text x="16" y="28" textAnchor="middle" fontSize="10" fill="#1976D2" fontWeight="bold">LINK</text></svg>;
    }
    if (att.type === 'youtube') {
      return <svg width="32" height="40" viewBox="0 0 32 40" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ marginRight: 14 }}><rect width="32" height="40" rx="6" fill="#fff" stroke="#FF0000" strokeWidth="2"/><path d="M8 8h16v24H8z" fill="#fff"/><text x="16" y="28" textAnchor="middle" fontSize="10" fill="#FF0000" fontWeight="bold">YT</text></svg>;
    }
    if (att.type === 'drive' || att.type === 'Google Drive') {
      return <svg width="32" height="40" viewBox="0 0 32 40" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ marginRight: 14 }}><rect width="32" height="40" rx="6" fill="#fff" stroke="#4285F4" strokeWidth="2"/><path d="M8 8h16v24H8z" fill="#fff"/><text x="16" y="28" textAnchor="middle" fontSize="10" fill="#4285F4" fontWeight="bold">DRIVE</text></svg>;
    }
    if (att.type === 'file' && att.file && att.file.type && att.file.type.startsWith('image')) {
      return <img src={typeof att.file === 'string' ? att.file : URL.createObjectURL(att.file)} alt={att.name} style={{ width: 38, height: 38, borderRadius: 6, objectFit: 'cover', marginRight: 14 }} />;
    }
    
    // Enhanced MP3 icon matching teacher role design
    if (att.type === 'file' && att.file && att.file.type && att.file.type.startsWith('audio')) {
      return <svg width="32" height="40" viewBox="0 0 32 40" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ marginRight: 14 }}><rect width="32" height="40" rx="6" fill="#fff" stroke="#43a047" strokeWidth="2"/><circle cx="16" cy="20" r="7" fill="#43a047"/><rect x="22" y="13" width="3" height="14" rx="1.5" fill="#43a047"/><text x="16" y="36" textAnchor="middle" fontSize="10" fill="#43a047" fontWeight="bold">MP3</text></svg>;
    }
    
    // Enhanced MP4 icon matching teacher role design
    if (att.type === 'file' && att.file && att.file.type && att.file.type.startsWith('video')) {
      return <svg width="32" height="40" viewBox="0 0 32 40" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ marginRight: 14 }}><rect width="32" height="40" rx="6" fill="#fff" stroke="#8e24aa" strokeWidth="2"/><polygon points="13,14 25,20 13,26" fill="#8e24aa"/><text x="16" y="36" textAnchor="middle" fontSize="10" fill="#8e24aa" fontWeight="bold">MP4</text></svg>;
    }
    
    if (att.type === 'file' && ext === 'pdf') {
      return <svg width="32" height="40" viewBox="0 0 32 40" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ marginRight: 14 }}><rect width="32" height="40" rx="6" fill="#fff" stroke="#F44336" strokeWidth="2"/><path d="M8 8h16v24H8z" fill="#fff"/><text x="16" y="28" textAnchor="middle" fontSize="10" fill="#F44336" fontWeight="bold">PDF</text></svg>;
    }
    if (att.type === 'file' && wordExts.includes(ext)) {
      return <svg width="32" height="40" viewBox="0 0 32 40" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ marginRight: 14 }}><rect width="32" height="40" rx="6" fill="#fff" stroke="#1976D2" strokeWidth="2"/><path d="M8 8h16v24H8z" fill="#fff"/><text x="16" y="28" textAnchor="middle" fontSize="10" fill="#1976D2" fontWeight="bold">WORD</text></svg>;
    }
    if (att.type === 'file' && excelExts.includes(ext)) {
      return <svg width="32" height="40" viewBox="0 0 32 40" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ marginRight: 14 }}><rect width="32" height="40" rx="6" fill="#fff" stroke="#388E3C" strokeWidth="2"/><path d="M8 8h16v24H8z" fill="#fff"/><text x="16" y="28" textAnchor="middle" fontSize="10" fill="#388E3C" fontWeight="bold">EXCEL</text></svg>;
    }
    if (att.type === 'file' && pptExts.includes(ext)) {
      return <svg width="32" height="40" viewBox="0 0 32 40" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ marginRight: 14 }}><rect width="32" height="40" rx="6" fill="#fff" stroke="#FF9800" strokeWidth="2"/><path d="M8 8h16v24H8z" fill="#fff"/><text x="16" y="28" textAnchor="middle" fontSize="10" fill="#FF9800" fontWeight="bold">PPT</text></svg>;
    }
    if (att.type === 'file' && ext === 'txt') {
      return <svg width="32" height="40" viewBox="0 0 32 40" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ marginRight: 14 }}><rect width="32" height="40" rx="6" fill="#fff" stroke="#607d8b" strokeWidth="2"/><path d="M8 8h16v24H8z" fill="#fff"/><text x="16" y="28" textAnchor="middle" fontSize="10" fill="#607d8b" fontWeight="bold">TXT</text></svg>;
    }
    if (att.type === 'file') {
      return <svg width="32" height="40" viewBox="0 0 32 40" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ marginRight: 14 }}><rect width="32" height="40" rx="6" fill="#bbb" /><path d="M8 8h16v24H8z" fill="#fff"/><text x="16" y="28" textAnchor="middle" fontSize="10" fill="#fff" fontWeight="bold">FILE</text></svg>;
    }
    return null;
  }

  // Animate the wave at the bottom
  useEffect(() => {
    let t = 0;
    let running = true;
    let frameId;
    function animateWave() {
      if (!running) return;
      t += 0.02;
      const amp = 10;
      const y1 = 40 + Math.sin(t) * amp;
      const y2 = 40 + Math.cos(t/2) * amp;
      if (wavePathRef.current) {
        wavePathRef.current.setAttribute('d', `M0,${y1} Q360,${80-amp} 720,${y2} T1440,${y1} V80 H0 Z`);
      }
      frameId = requestAnimationFrame(animateWave);
    }
    animateWave();
    return () => { running = false; if (frameId) cancelAnimationFrame(frameId); };
  }, [previewModalOpen]);

  // Add this function near other handlers, e.g., after handleFileChange
  function handleRemoveAttachment(idx) {
    setAttachments(prev => prev.filter((_, i) => i !== idx));
  }

  const [realAssignments, setRealAssignments] = useState([]);
  const [loadingAssignments, setLoadingAssignments] = useState(false);
  const [assignmentsError, setAssignmentsError] = useState(null);
  const [enrolledClasses, setEnrolledClasses] = useState([]);
  
  // People tab state
  const [peopleData, setPeopleData] = useState(null);
  // Helper: find class member by name (used for fetching real profile pictures)
  // Note: defined above as well near avatar utilities; keep only the earlier definition to avoid redeclaration.
  const [loadingPeople, setLoadingPeople] = useState(false);
  const [peopleError, setPeopleError] = useState(null);
  
  // Grades tab state
  const [gradesData, setGradesData] = useState(null);
  const [loadingGrades, setLoadingGrades] = useState(false);
  const [gradesError, setGradesError] = useState(null);

  // Helper: derive a grade value even if the grades endpoint leaves it null
  const getDisplayGrade = (item) => {
    // Prefer explicit fields from grades API
    let gradeValue = (item && (item.score ?? item.grade));
    let maxPoints = item && (item.points || item.max_points || item.total_points || 100);

    // Fallback: try to find matching assignment in loaded classwork
    if ((gradeValue === null || gradeValue === undefined) && Array.isArray(realAssignments)) {
      const match = realAssignments.find(a =>
        (item.task_id && (a.id == item.task_id || a.task_id == item.task_id)) ||
        (item.title && a.title === item.title)
      );
      if (match) {
        const sub = match.submission || {};
        const inferred = (sub.grade !== undefined && sub.grade !== null)
          ? sub.grade
          : (match.grade !== undefined ? match.grade : undefined);
        if (inferred !== undefined) {
          gradeValue = inferred;
          maxPoints = match.points || match.max_points || match.total_points || maxPoints;
        }
      }
    }

    return { gradeValue, maxPoints };
  };

  // Fetch the current class data based on the URL parameter
  useEffect(() => {
    const fetchCurrentClass = async () => {
      setLoadingClass(true);
      try {
        const response = await apiService.getStudentClasses();
        const raw = (response && response.data) ? response.data : response;
        if (Array.isArray(raw)) {
          // Be permissive about enrollment flags
          const enrolled = raw.filter(cls => {
            const flagTrue = cls.is_enrolled === true || cls.isEnrolled === true || cls.enrolled === true;
            const statusEnrolled = (cls.enrollment_status || cls.status || '').toString().toLowerCase() === 'enrolled'
              || (cls.enrollment_status || cls.status || '').toString().toLowerCase() === 'active';
            const hasAnyFlag = ('is_enrolled' in cls) || ('isEnrolled' in cls) || ('enrolled' in cls) || ('enrollment_status' in cls) || ('status' in cls);
            return flagTrue || statusEnrolled || !hasAnyFlag;
          });
          // Find the class that matches the URL parameter (code)
          let targetClass = null;
          // Try multiple keys for match
          targetClass = enrolled.find(cls => (cls.class_code || cls.code) === code);
          // If not found by class_code, try to find by class_id (if code is numeric)
          if (!targetClass && /^\d+$/.test(code)) {
            targetClass = enrolled.find(cls => cls.class_id == code);
          }
          // If still not found, use the first enrolled class
          if (!targetClass && enrolled.length > 0) {
            targetClass = enrolled[0];
          }
          if (targetClass) {
            const classData = {
              id: targetClass.class_id,
              name: `${targetClass.subject_name} (${targetClass.section_name})`,
              section: targetClass.section_name,
              subject: targetClass.subject_name,
              code: targetClass.class_code || targetClass.code || targetClass.class_id,
              semester: targetClass.semester,
              schoolYear: targetClass.school_year,
              teacherName: targetClass.teacher_name
            };
            setCurrentClass(classData);
            console.log('Current class loaded:', classData);
          } else {
            console.error('No matching class found for code:', code);
            setCurrentClass(null);
          }
        } else {
          console.error('Invalid response format for enrolled classes');
          setCurrentClass(null);
        }
      } catch (error) {
        console.error('Error fetching current class:', error);
        setCurrentClass(null);
      } finally {
        setLoadingClass(false);
      }
    };
    
    fetchCurrentClass();
  }, [code]);

  // Fetch classroom members when current class is loaded
  useEffect(() => {
    const fetchClassroomMembers = async () => {
      if (!currentClass || !currentClass.code) return;
      
      setLoadingClassroomMembers(true);
      setClassroomMembersError(null);
      
      try {
        const response = await apiService.getClassroomMembers(currentClass.code);
        console.log('Classroom members response:', response);
        
        if (response.status && response.data) {
          // Transform the API response to match the expected format
          const members = [];
          
          // Add teacher if present
          if (response.data.teacher) {
            members.push({
              ...response.data.teacher,
              name: response.data.teacher.full_name,
              role: 'teacher'
            });
          }
          
          // Add students if present
          if (response.data.students && Array.isArray(response.data.students)) {
            response.data.students.forEach(student => {
              members.push({
                ...student,
                name: student.full_name,
                role: 'student'
              });
            });
          }
          
          setClassroomMembers(members);
          console.log('Classroom members loaded:', members);
        } else {
          console.error('Invalid response format for classroom members');
          setClassroomMembers([]);
        }
      } catch (error) {
        console.error('Error fetching classroom members:', error);
        setClassroomMembersError('Failed to load classroom members');
        setClassroomMembers([]);
      } finally {
        setLoadingClassroomMembers(false);
      }
    };
    
    fetchClassroomMembers();
  }, [currentClass]);

  // Fetch real assignments for Classwork tab
  useEffect(() => {
    console.log('useEffect triggered - activeTab:', activeTab, 'code:', code, 'currentClass.code:', currentClass?.code);
    console.log('Current URL:', window.location.href);
    
    if (activeTab === 'classwork') {
      console.log('Classwork tab is active');
      setLoadingAssignments(true);
      setAssignmentsError(null);
      
      // First, fetch the student's enrolled classes to get the correct class codes
      let selectedClassCode = null;
      apiService.getStudentClasses()
        .then(response => {
          console.log('Enrolled Classes Response:', response);
          if (response.status && response.data && Array.isArray(response.data)) {
            const enrolled = response.data.filter(cls => cls.is_enrolled === true);
            setEnrolledClasses(enrolled);
            console.log('Enrolled classes:', enrolled);
            
            // Use the current class code from the URL parameter
            const classCode = currentClass ? currentClass.code : code;
            selectedClassCode = classCode;
            console.log('Using class code:', classCode, 'from current class:', currentClass);
            
            // Now fetch assignments for this class using dedicated API service that includes grades
            return apiService.getStudentAssignedTasks(classCode);
          } else {
            throw new Error('Invalid response format for enrolled classes');
          }
        })
        .then(async (response) => {
          console.log('Assignments API Response:', response);
          // Handle the nested data structure from your API
          if (response.status && response.data && Array.isArray(response.data)) {
            console.log('Setting assignments from response.data:', response.data);
            let base = response.data;
            // Response already contains grade, submission_status, submission_id per task
            // Normalize to include a submission-like object for uniform rendering
            const normalized = (base || []).map((a) => {
              if (a.grade !== undefined || a.submission_status) {
                return {
                  ...a,
                  submission: {
                    submission_id: a.submission_id,
                    grade: a.grade !== undefined && a.grade !== null ? Number(a.grade) : null,
                    status: a.submission_status,
                    submitted_at: a.submitted_at,
                    feedback: a.feedback,
                  },
                };
              }
              return a;
            });
            setRealAssignments(normalized);
          } else if (Array.isArray(response)) {
            console.log('Setting assignments from response array:', response);
            const base = response;
            setRealAssignments(base);
          } else {
            console.log('No valid assignments data found, setting empty array');
            setRealAssignments([]);
          }
        })
        .catch(err => {
          console.error('Error fetching data:', err);
          setAssignmentsError('Failed to fetch assignments');
          setRealAssignments([]);
        })
        .finally(() => setLoadingAssignments(false));
    }
  }, [activeTab, code, currentClass]);

  // Fetch people data for People tab
  useEffect(() => {
    if (activeTab === 'people' && currentClass) {
      console.log('People tab is active, fetching people data for class:', currentClass.code);
      setLoadingPeople(true);
      setPeopleError(null);

      apiService.getClassroomMembers(currentClass.code)
        .then(response => {
          console.log('People API Response:', response);
          // Support multiple shapes: {status, data}, array, or object with teacher/students
          if (Array.isArray(response)) {
            setPeopleData({ students: response });
            return;
          }
          const ok = response?.status === true || response?.status === 'success' || !!response?.data;
          if (ok) {
            setPeopleData(response.data || response);
          } else {
            setPeopleError(response?.message || 'Failed to load people data');
          }
        })
        .catch(err => {
          console.error('Error fetching people data:', err);
          const msg = err?.response?.data?.message || err?.message || 'Failed to load people data';
          setPeopleError(msg);
        })
        .finally(() => setLoadingPeople(false));
    }
  }, [activeTab, currentClass]);

  // Fetch grades data for Grades tab
  useEffect(() => {
    if (activeTab === 'grades' && currentClass) {
      console.log('Grades tab is active, fetching grades data for class:', currentClass.code);
      setLoadingGrades(true);
      setGradesError(null);
      
      // Use confirmed endpoint
      apiService.get(`/student/grades?class_code=${currentClass.code}`)
        .then(response => {
          console.log('Grades API Response:', response);
          const ok = response?.status === true || response?.status === 'success' || !!response?.data;
          if (ok) {
            setGradesData(response.data || response);
          } else {
            setGradesError(response?.message || 'Failed to load grades data');
          }
        })
        .catch(err => {
          console.error('Error fetching grades data:', err);
          const msg = err?.response?.data?.message || err?.message || 'Failed to load grades data';
          setGradesError(msg);
        })
        .finally(() => setLoadingGrades(false));
    }
  }, [activeTab, currentClass]);

  // Show loading state while fetching class data
  if (showClassLoader) {
    return (
      <div style={{ background: "#f7fafd", minHeight: "100vh" }}>
        <div className="container py-4">
          <div className="py-5" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <LottieLoader message="Loading class details..." width={160} height={160} centered minHeight={'70vh'} desiredDurationSec={1.4} />
          </div>
        </div>
      </div>
    );
  }

  // Show error state if no class found
  if (!currentClass) {
    return (
      <div style={{ background: "#f7fafd", minHeight: "100vh" }}>
        <div className="container py-4">
          <div className="text-center py-5">
            <i className="ni ni-books text-muted" style={{ fontSize: "4rem" }}></i>
            <h4 className="mt-3 text-muted">Class not found</h4>
            <p className="text-muted">The class you're looking for doesn't exist or you're not enrolled.</p>
            <Button color="primary" size="lg" onClick={() => navigate('/student/classroom')}>
              <i className="ni ni-fat-add mr-2"></i>
              Back to Classes
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div style={{ background: "#f7fafd", minHeight: "100vh" }}>
      {/* Banner */}
      <div style={{
        borderRadius: 18,
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        color: "#fff",
        minHeight: 170,
        boxShadow: "0 4px 24px rgba(44,62,80,0.13)",
        margin: '24px auto 32px',
        position: 'relative',
        overflow: 'hidden',
        padding: '32px 40px',
        display: 'flex',
        alignItems: 'flex-start',
        justifyContent: 'space-between',
        maxWidth: 1100,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat',
      }}>
        <div style={{ position: 'relative', zIndex: 2 }}>
          <h1 style={{
            fontWeight: 800,
            letterSpacing: 1,
            color: '#fff',
            textShadow: '0 2px 8px rgba(0,0,0,0.7), 0 1px 0 #000'
          }}>
            {currentClass.name} <span style={{ fontWeight: 400, fontSize: 22, opacity: 0.92, color: '#fff', textShadow: '0 2px 8px rgba(0,0,0,0.7), 0 1px 0 #000' }}>({currentClass.section})</span>
          </h1>
          <div style={{ fontSize: 20, opacity: 0.95, fontWeight: 500 }}>{currentClass.subject}</div>
          <div className="mt-3 d-flex align-items-center flex-wrap">
            <span style={{ fontWeight: 600, fontSize: 18 }}>Class Code:</span>
            <span style={{
              background: '#fff',
              color: '#007bff',
              borderRadius: 10,
              padding: '4px 16px',
              fontWeight: 800,
              fontSize: 20,
              marginLeft: 14,
              letterSpacing: 2,
              boxShadow: '0 2px 8px rgba(44,62,80,0.10)'
            }}>
              {currentClass.code}
            </span>
            <Button 
              color="link" 
              size="sm" 
              id={`copyCodeBtn-${currentClass.code}`} 
              style={{ color: '#007bff', marginLeft: 4, fontSize: 18, padding: 0, cursor: 'pointer' }} 
              onClick={handleCopyCode} 
              aria-label="Copy class code"
            >
              <i className="ni ni-single-copy-04" />
            </Button>
            <Tooltip 
              placement="top" 
              isOpen={tooltipHover || copied} 
              target={`copyCodeBtn-${currentClass.code}`} 
              toggle={() => setTooltipHover(!tooltipHover)}
            >
              {copied ? "Copied!" : "Copy code"}
            </Tooltip>
          </div>
          <div className="mt-2">
            <Badge color="light" className="text-dark me-2">{currentClass.semester}</Badge>
            <Badge color="light" className="text-dark" style={{ marginLeft: 8 }}>{currentClass.schoolYear}</Badge>
          </div>
        </div>

        <svg viewBox="0 0 1440 60" style={{ position: 'absolute', bottom: 0, left: 0, width: '100%', height: 60 }} xmlns="http://www.w3.org/2000/svg">
          <path fill="#fff" fillOpacity="1" d="M0,32L48,37.3C96,43,192,53,288,49.3C384,45,480,27,576,21.3C672,16,768,32,864,37.3C960,43,1056,27,1152,21.3C1248,16,1344,32,1392,40.7L1440,48L1440,160L1392,160C1344,160,1248,160,1152,160C1056,160,960,160,864,160C768,160,672,160,576,160C480,160,384,160,288,160C192,160,96,160,48,160L0,160Z"></path>
        </svg>
      </div>


      {/* Tabs */}
      <div style={{ maxWidth: 1100, margin: '0 auto', marginTop: 24 }}>
        <div style={{ display: 'flex', alignItems: 'center', background: '#fff', borderRadius: 16, boxShadow: '0 2px 8px 0 rgba(44,62,80,.06)', padding: '0 24px', height: 56 }}>
          {tabList.map(tab => (
            <div
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              style={{
                display: 'flex',
                alignItems: 'center',
                fontWeight: 600,
                fontSize: 15,
                color: activeTab === tab.key ? '#2096ff' : '#888',
                background: activeTab === tab.key ? '#e6e8ff' : 'none',
                borderRadius: 12,
                padding: '8px 22px',
                marginRight: 12,
                cursor: 'pointer',
                transition: 'all 0.15s'
              }}
            >
              <i className={tab.icon} style={{ fontSize: 20, marginRight: 8, color: activeTab === tab.key ? '#2096ff' : '#bbb' }} />
              {tab.label}
            </div>
          ))}
        </div>
      </div>
      {/* Stream Section */}
      {activeTab === "stream" && (
        <div style={{ maxWidth: 1100, margin: '24px auto 0', fontSize: '12px' }}>
          <div style={{ background: '#fff', borderRadius: 16, boxShadow: '0 8px 32px rgba(50,76,221,0.10)', border: '1.5px solid #e9ecef', padding: 32, marginBottom: 24 }}>
            <div style={{ fontWeight: 800, color: '#324cdd', letterSpacing: 1, marginBottom: 10, display: 'flex', alignItems: 'center', fontSize: '13px' }}>
              <i className="ni ni-chat-round" style={{ fontSize: 18, marginRight: 6, color: '#2096ff' }} /> Stream
                      </div>
                      
            
            
            {/* Student Announcement Post Form */}
            {!formExpanded ? (
              <div style={{ marginBottom: 24 }}>
                <textarea
                  id="student-announcement-textarea"
                  value={studentAnnouncement}
                  onFocus={() => setFormExpanded(true)}
                  onChange={e => setStudentAnnouncement(e.target.value)}
                  placeholder="Share an announcement with your class..."
                  style={{ width: '100%', fontSize: 16, minHeight: 56, borderRadius: 12, padding: '16px 18px', border: 'none', background: '#f7fafd', boxShadow: 'none', resize: 'none', outline: 'none', color: '#888' }}
                />
              </div>
            ) : (
              <form onSubmit={handleStudentPostAnnouncement} style={{ marginBottom: 24, background: '#fff', borderRadius: 16, boxShadow: '0 2px 12px #324cdd11', padding: '1.5rem 1.5rem 1rem', border: '1.5px solid #e9ecef', maxWidth: '100%', position: 'relative' }}>
                <button
                  type="button"
                  style={{ position: 'absolute', top: 18, right: 18, background: '#f7fafd', border: 'none', borderRadius: 8, padding: '8px 14px', fontSize: 22, cursor: 'pointer', boxShadow: '0 1px 4px #e9ecef', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}
                  title="Add people"
                  onClick={() => { setTempSelectedStudents(selectedAnnouncementStudents); setShowStudentSelectModal(true); }}
                >
                  {selectedAnnouncementStudents.length > 0 && (
                    <span style={{ background: '#e3eafe', color: '#324cdd', borderRadius: '50%', padding: '2px 8px', fontWeight: 700, fontSize: 13, minWidth: 18, minHeight: 18, textAlign: 'center', boxShadow: '0 2px 8px #324cdd11', display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}>{selectedAnnouncementStudents.length}</span>
                  )}
                  <i className="fa fa-user-plus" />
                </button>
                <div style={{ marginBottom: 10, display: 'flex', alignItems: 'center' }}>
                  <input type="checkbox" id="allowComments" checked={allowComments} onChange={e => setAllowComments(e.target.checked)} style={{ marginRight: 8 }} />
                  <label htmlFor="allowComments" style={{ fontWeight: 500, fontSize: 16, color: '#222', margin: 0 }}>Allow comments</label>
                </div>
                <input
                  type="text"
                  value={announcementTitle}
                  onChange={e => setAnnouncementTitle(e.target.value)}
                  placeholder="Announcement title (optional)"
                  style={{ width: '100%', fontSize: 15, borderRadius: 8, border: '1px solid #bfcfff', background: '#fff', marginBottom: 10, padding: '10px 14px', height: 34 }}
                />
                <textarea
                  id="student-announcement-textarea"
                  value={studentAnnouncement}
                  onChange={e => setStudentAnnouncement(e.target.value)}
                  placeholder="Share an announcement with your class..."
                  style={{ width: '100%', fontSize: 15, minHeight: 44, borderRadius: 8, padding: '10px 14px', border: 'none', background: '#f7fafd', boxShadow: 'none', resize: 'vertical', outline: 'none', color: '#222', marginBottom: 10, height: 34 }}
                />
              
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 14 }}>
                  <div style={{ marginBottom: 10, position: 'relative', display: 'inline-block' }}>
                    <button
                      style={{ display: 'flex', alignItems: 'center', gap: 8, background: '#fff', border: 'none', borderRadius: 8, boxShadow: '0 2px 8px #e9ecef', padding: '8px 14px', fontWeight: 600, fontSize: 15, cursor: 'pointer', height: 32 }}
                      onClick={() => setAttachmentDropdownOpenId('new')}
                      type="button"
                    >
                      <i className="fa fa-paperclip" style={{ fontSize: 15 }} /> Add Attachment
                    </button>
                    {attachmentDropdownOpenId === 'new' && (
                      <div ref={attachmentMenuRef} style={{ position: 'absolute', top: 36, left: 0, background: '#fff', borderRadius: 8, boxShadow: '0 2px 8px #324cdd22', padding: '8px 0', minWidth: 130, zIndex: 20 }}>
                        <div style={{ padding: '10px 16px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 8, fontSize: 15 }} onClick={() => handleAttachmentOption('file')}>
                          <i className="fa fa-file" style={{ fontSize: 15 }} /> File
                        </div>
                        <div style={{ padding: '10px 16px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 8, fontSize: 15 }} onClick={() => handleAttachmentOption('link')}>
                          <i className="fa fa-globe" style={{ fontSize: 15 }} /> Link
                        </div>
                        <div style={{ padding: '10px 16px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 8, fontSize: 15 }} onClick={() => handleAttachmentOption('youtube')}>
                          <i className="fa fa-youtube-play" style={{ fontSize: 15, color: '#f00' }} /> YouTube
                        </div>
                        <div style={{ padding: '10px 16px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 8, fontSize: 15 }} onClick={() => handleAttachmentOption('drive')}>
                          <i className="fa fa-cloud-upload" style={{ fontSize: 15 }} /> Google Drive
                        </div>
                      </div>
                    )}
                  </div>
                  <div style={{ position: 'relative' }}>
                    <button
                      type="button"
                      style={{ border: 'none', background: '#f7fafd', borderRadius: 8, padding: '8px 14px', fontSize: 15, cursor: 'pointer', height: 32, width: 32, display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                      onClick={e => { e.preventDefault(); setShowEmojiPicker(v => !v); }}
                    >
                      <i className="fa fa-smile" style={{ fontSize: 15 }} />
                    </button>
                    {showEmojiPicker && (
                      <div ref={emojiPickerRef} style={{ position: 'absolute', top: 36, left: 0, background: '#fff', border: '1px solid #e9ecef', borderRadius: 8, boxShadow: '0 2px 8px #324cdd22', padding: 8, zIndex: 30, minWidth: 140, maxWidth: 200, width: 200, maxHeight: 140, overflowY: 'auto', display: 'grid', gridTemplateColumns: 'repeat(6, 1fr)', gap: 6 }}>
                        {emojiList.map(emoji => (
                          <span key={emoji} style={{ fontSize: 19, cursor: 'pointer', margin: 4, borderRadius: 5, display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'background 0.12s', padding: 0, userSelect: 'none' }} onClick={() => insertEmojiAtCursor(emoji)}>{emoji}</span>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
                {/* Attachments preview below the buttons */}
                {attachments && attachments.length > 0 && (
                  <div style={{ margin: '10px 0 16px 0', display: 'flex', flexDirection: 'column', gap: 10 }}>
                    {attachments.map((att, idx) => {
                      const isMp3 = att.type === 'file' && att.file && (att.file.type === 'audio/mp3' || att.file.type === 'audio/mpeg' || (att.name && att.name.toLowerCase().endsWith('.mp3')));
                      const isPdf = att.type === 'file' && att.file && (att.file.type === 'application/pdf' || (att.name && att.name.toLowerCase().endsWith('.pdf')));
                      const isMp4 = att.type === 'file' && att.file && (att.file.type === 'video/mp4' || (att.name && att.name.toLowerCase().endsWith('.mp4')));
                      const isWord = att.type === 'file' && att.file && (att.file.type === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' || (att.name && /\.docx?$/i.test(att.name)));
                      const fileType = isMp3 ? 'MP3' : isPdf ? 'PDF' : isMp4 ? 'MP4' : isWord ? 'WORD' : (att.file && att.file.type ? att.file.type.split('/')[1]?.toUpperCase() : att.type.charAt(0).toUpperCase() + att.type.slice(1));
                      const typeColor = isMp3 ? '#43a047' : isPdf ? '#F44336' : isMp4 ? '#7B1FA2' : isWord ? '#1976D2' : '#888';
                      const linkColor = typeColor;
                      const isFile = att.type === 'file' && att.file;
                      let url = undefined;
                      if (!isFile && att.url) url = att.url;
                      const typeStr = String(att.type || att.attachment_type || '').toLowerCase();
                      const isLink = (!!url && (!att.file || typeStr !== 'file')) && (
                        typeStr === 'link' || typeStr === 'youtube' || typeStr === 'google drive' || typeStr === 'google_drive' || typeStr === 'drive' || typeStr === ''
                      );
                      // Truncate file name and type string
                      const displayNameRaw = isLink ? url : (att.name || att.url || 'Attachment');
                      const displayName = displayNameRaw.length > 22 ? displayNameRaw.slice(0, 19) + '...' : displayNameRaw;
                      let typeString = '';
                      if (isFile && att.file && att.file.type && !isMp3 && !isPdf && !isMp4 && !isWord) {
                        typeString = att.file.type.toUpperCase();
                        if (typeString.length > 28) typeString = typeString.slice(0, 25) + '...';
                      } else {
                        typeString = fileType;
                      }
                      return (
                        <div
                          key={idx}
                          style={{ 
                            display: 'flex', 
                            alignItems: 'center', 
                            background: isLink ? `${typeColor}08` : '#fff', 
                            border: `1px solid ${isLink ? `${typeColor}20` : '#e9ecef'}`,
                            borderRadius: 12, 
                            boxShadow: isLink ? `0 2px 12px ${typeColor}15` : '0 1px 4px #e9ecef', 
                            padding: '10px 18px', 
                            minWidth: 220, 
                            maxWidth: 340, 
                            cursor: isLink ? 'pointer' : (isFile ? 'pointer' : 'default'),
                            transition: 'all 0.2s ease'
                          }}
                          onClick={() => { 
                            if (isLink && url) { 
                              window.open(url, '_blank', 'noopener,noreferrer'); 
                            } else if (att.type === "YouTube" || att.type === "Google Drive" || att.type === "Link") {
                              // For YouTube, Google Drive, and Link types, always open in new tab
                              window.open(url, '_blank', 'noopener,noreferrer');
                            } else if (isFile) { 
                              handlePreviewAttachment(att); 
                            } 
                          }}
                        >
                          {/* File icon */}
                          {isMp3 ? (
                            <svg width="32" height="40" viewBox="0 0 32 40" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ marginRight: 14 }}>
                              <rect width="32" height="40" rx="6" fill="#fff" stroke="#43a047" strokeWidth="2"/>
                              <circle cx="16" cy="20" r="7" fill="#43a047"/>
                              <rect x="22" y="13" width="3" height="14" rx="1.5" fill="#43a047"/>
                              <text x="16" y="36" textAnchor="middle" fontSize="10" fill="#43a047" fontWeight="bold">MP3</text>
                            </svg>
                          ) : isPdf ? (
                            <svg width="32" height="40" viewBox="0 0 32 40" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ marginRight: 14 }}>
                              <rect width="32" height="40" rx="6" fill="#fff" stroke="#F44336" strokeWidth="2"/>
                              <path d="M8 8h16v24H8z" fill="#fff"/>
                              <text x="16" y="28" textAnchor="middle" fontSize="10" fill="#F44336" fontWeight="bold">PDF</text>
                            </svg>
                          ) : isMp4 ? (
                            <svg width="32" height="40" viewBox="0 0 32 40" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ marginRight: 14 }}>
                              <rect width="32" height="40" rx="6" fill="#fff" stroke="#7B1FA2" strokeWidth="2"/>
                              <polygon points="13,14 25,20 13,26" fill="#7B1FA2"/>
                              <text x="16" y="36" textAnchor="middle" fontSize="10" fill="#7B1FA2" fontWeight="bold">MP4</text>
                            </svg>
                          ) : isWord ? (
                            <svg width="32" height="40" viewBox="0 0 32 40" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ marginRight: 14 }}>
                              <rect width="32" height="40" rx="6" fill="#fff" stroke="#1976D2" strokeWidth="2"/>
                              <path d="M8 8h16v24H8z" fill="#fff"/>
                              <text x="16" y="28" textAnchor="middle" fontSize="10" fill="#1976D2" fontWeight="bold">WORD</text>
                            </svg>
                          ) : null}
                          {/* File info */}
                          <div style={{ flex: 1, minWidth: 0 }}>
                            <div style={{ fontWeight: 600, fontSize: 15, color: '#232b3b', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: 140 }}>{displayName}</div>
                            <div style={{ fontSize: 13, fontWeight: 500, marginTop: 2, display: 'flex', alignItems: 'center', gap: 6, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: 180 }}>
                              <span style={{ color: typeColor }}>{typeString}</span>
                              {isFile && <span style={{ color: '#b0b0b0', fontWeight: 700, fontSize: 15, margin: '0 2px' }}>•</span>}
                              {isFile ? (
                                <a
                                  href={typeof att.file === 'string' ? att.file : URL.createObjectURL(att.file)}
                                  download={att.name}
                                  style={{ fontSize: 13, color: linkColor, fontWeight: 600, textDecoration: 'underline', whiteSpace: 'nowrap' }}
                                  onClick={e => { e.stopPropagation(); }}
                                >
                                  Download
                                </a>
                              ) : null}
                              {isLink && url && (
                                <>
                                  <span style={{ color: '#b0b0b0', fontWeight: 700, fontSize: 15, margin: '0 2px' }}>•</span>
                                  <a href={url} target="_blank" rel="noopener noreferrer" style={{ fontSize: 13, color: linkColor, fontWeight: 600, textDecoration: 'underline', whiteSpace: 'nowrap' }} onClick={e => e.stopPropagation()}>View Link</a>
                                </>
                              )}
                                  </div>
                                </div>
                        </div>
                      );
                    })}
                  </div>
                )}
                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10 }}>
                  <button type="button" style={{ fontWeight: 500, borderRadius: 8, minWidth: 80, fontSize: 14, background: '#f7fafd', color: '#222', border: 'none', padding: '8px 14px', cursor: 'pointer', height: 32 }} onClick={() => { setFormExpanded(false); setStudentAnnouncement(""); setAnnouncementTitle(""); setAllowComments(true); setAttachments([]); }}>
                    Cancel
                  </button>
                  
                  {/* Simple Post Button */}
                    <button
                      type="submit"
                      style={{
                        background: studentAnnouncement.trim() ? '#7b8cff' : '#e6e6fa',
                        border: 'none',
                        color: studentAnnouncement.trim() ? '#fff' : '#888',
                        fontWeight: 600,
                        fontSize: 14,
                      borderRadius: '8px',
                      padding: '8px 18px',
                        cursor: studentAnnouncement.trim() ? 'pointer' : 'not-allowed',
                        transition: 'background 0.15s',
                        opacity: studentAnnouncement.trim() ? 1 : 0.6,
                        display: 'flex',
                        alignItems: 'center',
                        gap: 6,
                        minWidth: 90,
                      height: 32
                      }}
                      disabled={!studentAnnouncement.trim()}
                    >
                      <i className="ni ni-send" style={{ fontSize: 14, marginRight: 4 }} />
                      Post
                    </button>
                </div>
              </form>
            )}
            {/* Announcements List */}
            <div style={{ marginTop: 32 }}>
              {sortedAnnouncements.map((announcement) => (
                <div
                  key={announcement.id}
                  style={{
                    background: '#fff',
                    borderRadius: 12,
                    boxShadow: '0 2px 8px #324cdd11',
                    borderLeft: announcement.isPinned ? '4px solid #f7b731' : 'none',
                    marginBottom: 24,
                    padding: 0,
                    position: 'relative'
                  }}
                >
                  <div style={{ padding: '0.75rem 1rem', position: 'relative' }}>
                    {/* Menu group in upper right (likes removed) */}
                    <div style={{ position: 'absolute', top: 16, right: 18, display: 'flex', alignItems: 'center', gap: 12 }}>
                      {/* Only show 3-dot menu if current user is the author */}
                      {currentUserProfile && (
                        (currentUserProfile.full_name === announcement.author || 
                         currentUserProfile.name === announcement.author || 
                         currentUserProfile.user_name === announcement.author) && (
                        <div style={{ color: '#5e6e8c', fontSize: 20, cursor: 'pointer', paddingLeft: 4, position: 'relative' }}>
                          <i className="fa fa-ellipsis-v" onClick={() => setOpenMenuId(openMenuId === announcement.id ? null : announcement.id)} />
                          {openMenuId === announcement.id && (
                            <div ref={menuRef} style={{ position: 'absolute', top: 28, right: 0, background: '#fff', borderRadius: 12, boxShadow: '0 4px 24px #324cdd22', padding: '18px 0', minWidth: 160, zIndex: 10 }}>
                              <div style={{ padding: '8px 20px', cursor: 'pointer', fontWeight: 400, color: '#222', fontSize: 16 }} onClick={() => handleEditClick(announcement)}>Edit</div>
                              <div style={{ padding: '8px 20px', cursor: 'pointer', fontWeight: 400, color: '#222', fontSize: 16 }} onClick={() => { setOpenMenuId(null); /* handle delete here */ }}>Delete</div>
                              {announcement.isPinned ? (
                                <div style={{ padding: '8px 20px', cursor: 'pointer', fontWeight: 400, color: '#222', fontSize: 16 }} onClick={() => handleUnpin(announcement)}>Unpin</div>
                              ) : (
                                <div style={{ padding: '8px 20px', cursor: 'pointer', fontWeight: 400, color: '#222', fontSize: 16 }} onClick={() => handlePin(announcement)}>Pin this announcement</div>
                              )}
                            </div>
                          )}
                        </div>
                        )
                      )}
                    </div>
                        {/* Inline edit form if editing */}
                    {editingAnnouncementId === announcement.id ? (
                      <>
                        {/* Author info, date, and pinned badge (always visible) */}
                        <div style={{ display: 'flex', alignItems: 'center', marginBottom: 8, justifyContent: 'space-between' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                                {(() => {
                                  // Prefer real profile from classroom members (teacher or student)
                                  let authorUser = findMemberByName(announcement.author);
                                  if (!authorUser) {
                                    authorUser = {
                                      profile_pic: announcement.avatar || announcement.user_avatar || announcement.user_profile_pic || announcement.profile_pic,
                                      name: announcement.author,
                                      full_name: announcement.author,
                                    };
                                  }
                                  const avatarUrl = getProfilePictureUrl(authorUser);
                                  const bgColor = getAvatarColor(authorUser);
                                  const initials = getUserInitials(authorUser);
                                  return (
                                    <div style={{ width: 40, height: 40, borderRadius: '50%', background: avatarUrl ? '#e9ecef' : bgColor, display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden', marginTop: -4, color: '#fff', fontWeight: 600 }}>
                                      {avatarUrl ? (
                                        <img
                                          src={avatarUrl}
                                          alt="avatar"
                                          style={{ width: 40, height: 40, borderRadius: '50%', objectFit: 'cover', display: 'block' }}
                                          onError={(e) => {
                                            e.target.style.display = 'none';
                                            if (e.target.nextSibling) e.target.nextSibling.style.display = 'flex';
                                          }}
                                        />
                                      ) : null}
                                      <span style={{ display: avatarUrl ? 'none' : 'flex', alignItems: 'center', justifyContent: 'center', width: '100%', height: '100%' }}>{initials}</span>
                                    </div>
                                  );
                                })()}
                            <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                              <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                                <div style={{ fontWeight: 600, color: '#111' }}>{announcement.author}</div>
                                {announcement.isPinned && (
                                  <Badge color="warning" className="ml-2">Pinned</Badge>
                                )}
                              </div>
                              <small className="text-muted">{formatRelativeTime(announcement.date)}</small>
                            </div>
                          </div>
                        </div>
                        {/* Edit form for title/content only */}
                        <div style={{ marginTop: 8 }}>
                          <input
                            type="text"
                            value={editAnnouncementTitle}
                            onChange={e => setEditAnnouncementTitle(e.target.value)}
                            style={{ width: '100%', fontWeight: 700, fontSize: 18, marginBottom: 8, borderRadius: 8, border: '1px solid #e0e0e0', padding: '8px 12px' }}
                          />
                          <textarea
                            value={editAnnouncementContent}
                            onChange={e => setEditAnnouncementContent(e.target.value)}
                            style={{ width: '100%', fontSize: 15, borderRadius: 8, border: '1px solid #e0e0e0', padding: '12px', minHeight: 60, marginBottom: 12 }}
                          />
                          {/* Add Attachment button */}
                          <div style={{ marginBottom: 12, position: 'relative', display: 'inline-block' }}>
                            <button
                              style={{ display: 'flex', alignItems: 'center', gap: 8, background: '#fff', border: 'none', borderRadius: 8, boxShadow: '0 2px 8px #e9ecef', padding: '10px 18px', fontWeight: 600, fontSize: 16, cursor: 'pointer' }}
                              onClick={() => setAttachmentDropdownOpenId(announcement.id)}
                              type="button"
                            >
                              <i className="fa fa-paperclip" style={{ fontSize: 18 }} /> Add Attachment
                            </button>
                            {attachmentDropdownOpenId === announcement.id && (
                              <div ref={attachmentMenuRef} style={{ position: 'absolute', top: 48, left: 0, background: '#fff', borderRadius: 12, boxShadow: '0 4px 24px #324cdd22', padding: '10px 0', minWidth: 180, zIndex: 20 }}>
                                <div style={{ padding: '10px 20px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 10 }} onClick={() => handleAttachmentOption('file')}>
                                  <i className="fa fa-file" style={{ fontSize: 18 }} /> File
                                </div>
                                <div style={{ padding: '10px 20px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 10 }} onClick={() => handleAttachmentOption('link')}>
                                  <i className="fa fa-globe" style={{ fontSize: 18 }} /> Link
                                </div>
                                <div style={{ padding: '10px 20px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 10 }} onClick={() => handleAttachmentOption('youtube')}>
                                  <i className="fa fa-youtube-play" style={{ fontSize: 18, color: '#f00' }} /> YouTube
                                </div>
                                <div style={{ padding: '10px 20px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 10 }} onClick={() => handleAttachmentOption('drive')}>
                                  <i className="fa fa-cloud-upload" style={{ fontSize: 18 }} /> Google Drive
                                </div>
                              </div>
                            )}
                          </div>
                          {/* Allow comments checkbox */}
                          <div style={{ marginBottom: 12, display: 'flex', alignItems: 'center' }}>
                            <input type="checkbox" id={`allowComments-edit-${announcement.id}`} checked={allowComments} onChange={e => setAllowComments(e.target.checked)} style={{ marginRight: 8 }} />
                            <label htmlFor={`allowComments-edit-${announcement.id}`} style={{ fontWeight: 500, color: '#222', margin: 0 }}>Allow comments</label>
                          </div>
                          {/* Who can view this announcement */}
                          <div style={{ marginBottom: 18 }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontWeight: 600, color: '#222', marginBottom: 6 }}>
                              <i className="fa fa-user" style={{ fontSize: 18 }} /> Who can view this announcement?
                            </div>
                            <button style={{ background: '#bfc5cc', color: '#fff', border: 'none', borderRadius: 6, padding: '7px 18px', fontWeight: 600, fontSize: 15, cursor: 'pointer', opacity: 0.8 }}>
                              + Select students
                            </button>
                          </div>
                          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8 }}>
                            <button onClick={handleEditCancel} style={{ background: '#f7fafd', color: '#222', border: 'none', borderRadius: 8, padding: '8px 20px', fontWeight: 500, cursor: 'pointer' }}>Cancel</button>
                            <button onClick={() => handleEditSave(announcement)} style={{ background: '#2ecc71', color: '#fff', border: 'none', borderRadius: 8, padding: '8px 20px', fontWeight: 600, cursor: 'pointer' }}>Save</button>
                          </div>
                        </div>
                      </>
                    ) : (
                      <>
                        <div style={{ display: 'flex', alignItems: 'center', marginBottom: 8, justifyContent: 'space-between' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                            {(() => {
                              let authorUser = findMemberByName(announcement.author);
                              if (!authorUser) {
                                authorUser = {
                                  profile_pic: announcement.avatar || announcement.user_avatar || announcement.user_profile_pic || announcement.profile_pic,
                                  name: announcement.author,
                                  full_name: announcement.author,
                                };
                              }
                              const avatarUrl = getProfilePictureUrl(authorUser);
                              const bgColor = getAvatarColor(authorUser);
                              const initials = getUserInitials(authorUser);
                              return (
                                <div style={{ width: 40, height: 40, borderRadius: '50%', background: avatarUrl ? '#e9ecef' : bgColor, display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden', marginTop: -4, color: '#fff', fontWeight: 600 }}>
                                  {avatarUrl ? (
                                    <img
                                      src={avatarUrl}
                                      alt="avatar"
                                      style={{ width: 40, height: 40, borderRadius: '50%', objectFit: 'cover', display: 'block' }}
                                      onError={(e) => {
                                        e.target.style.display = 'none';
                                        if (e.target.nextSibling) e.target.nextSibling.style.display = 'flex';
                                      }}
                                    />
                                  ) : null}
                                  <span style={{ display: avatarUrl ? 'none' : 'flex', alignItems: 'center', justifyContent: 'center', width: '100%', height: '100%' }}>{initials}</span>
                                </div>
                              );
                            })()}
                            <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                              <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                                <div style={{ fontWeight: 600, color: '#111', fontSize: 14 }}>{announcement.author}</div>
                                {announcement.isPinned && (
                                  <Badge color="warning" className="ml-2">Pinned</Badge>
                                )}
                              </div>
                              <small className="text-muted" style={{ fontSize: 11 }}>{formatRelativeTime(announcement.date)}</small>
                            </div>
                          </div>
                        </div>
                        <div style={{ fontWeight: 700, fontSize: 17, marginBottom: 6 }}>{announcement.title}</div>
                        <div style={{ color: '#444', fontSize: 15, marginBottom: 12 }}>{announcement.content}</div>
                                                {announcement.attachments && announcement.attachments.length > 0 && (
                          <div style={{ margin: '10px 0 16px 0', display: 'flex', flexDirection: 'column', gap: 10 }}>
                            {announcement.attachments.map((att, idx2) => {
                              const { preview, type, color } = getFileTypeIconOrPreview(att);
                              let url = undefined;
                              if (att.file && (att.file instanceof File || att.file instanceof Blob)) {
                                url = URL.createObjectURL(att.file);
                              } else if (att.url) {
                                url = att.url;
                              }
                              const isLink = att.type === "Link" || att.type === "YouTube" || att.type === "Google Drive" || 
                                           att.type === "link" || att.type === "youtube" || att.type === "google_drive" ||
                                           att.type === "googledrive";
                              // Ensure link URLs are absolute external URLs and remove localhost prefixes
                              let linkUrl = att.url;
                              
                              if (isLink && linkUrl) {
                                // Remove localhost prefixes if they exist
                                if (linkUrl.includes('localhost/scms_new_backup/')) {
                                  linkUrl = linkUrl.replace('http://localhost/scms_new_backup/', '');
                                  console.log('Removed localhost prefix, new URL:', linkUrl);
                                } else if (linkUrl.includes('localhost/')) {
                                  // Handle other localhost variations
                                  linkUrl = linkUrl.replace(/^https?:\/\/localhost\/[^\/]*\//, '');
                                  console.log('Removed localhost prefix, new URL:', linkUrl);
                                }
                                
                                // Ensure it's a valid external URL
                                if (!linkUrl.startsWith('http')) {
                                  // If it's a relative URL, try to construct the full URL
                                  if (linkUrl.startsWith('/')) {
                                    linkUrl = window.location.origin + linkUrl;
                                  } else {
                                    // If it's just a path, assume it should be an external link
                                    console.warn('Link attachment has relative URL:', linkUrl);
                                    linkUrl = null; // Don't open invalid URLs
                                  }
                                }
                              }
                              const displayName = isLink ? (linkUrl || att.url) : att.name;
                              return (
                                <div
                                  key={idx2}
                                  style={{ 
                                    background: isLink ? `${color}08` : '#fff', 
                                    border: `1px solid ${isLink ? `${color}20` : '#e9ecef'}`,
                                    borderRadius: 12, 
                                    boxShadow: isLink ? `0 2px 12px ${color}15` : '0 1px 4px #e9ecef', 
                                    padding: '10px 18px', 
                                    minWidth: 220, 
                                    maxWidth: 340, 
                                    display: 'flex', 
                                    alignItems: 'center', 
                                    gap: 12, 
                                    cursor: 'pointer',
                                    transition: 'all 0.2s ease'
                                  }}
                                  onClick={() => {
                                    if (isLink && linkUrl) {
                                      window.open(linkUrl, '_blank', 'noopener,noreferrer');
                                    } else if (att.type === "YouTube" || att.type === "Google Drive" || att.type === "Link") {
                                      // For YouTube, Google Drive, and Link types, always open in new tab
                                      if (linkUrl) {
                                        window.open(linkUrl, '_blank', 'noopener,noreferrer');
                                      } else {
                                        console.warn('Cannot open link: invalid URL');
                                      }
                                    } else {
                                      handlePreviewAttachment(att);
                                    }
                                  }}
                                >
                                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginRight: 8 }}>{preview}</div>
                                  <div style={{ flex: 1, minWidth: 0 }}>
                                    <div style={{ fontWeight: 600, fontSize: 16, color: '#232b3b', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: 140 }} title={displayName}>{displayName}</div>
                                    <div style={{ fontSize: 13, color: '#90A4AE', marginTop: 2 }}>
                                      {type}
                                      {url && <>&bull; <a href={url} download={att.name} style={{ color: color, fontWeight: 600, textDecoration: 'none' }} onClick={e => e.stopPropagation()}>Download</a></>}
                                      {isLink && <>&bull; <a href={linkUrl || att.url} target="_blank" rel="noopener noreferrer" style={{ color: color, fontWeight: 600, textDecoration: 'none' }} onClick={e => e.stopPropagation()}>View Link</a></>}
                                    </div>
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        )}
                        {/* Comments Section */}
                        {announcement.allowComments !== false ? (
                          <div style={{ background: '#f7fafd', borderRadius: 10, padding: '12px 18px', marginTop: 10 }}>
                            <div
                              style={{ fontWeight: 600, fontSize: 15, marginBottom: 8, cursor: 'pointer', userSelect: 'none' }}
                              onClick={async () => {
                                // Toggle collapse
                                setCollapsedComments(prev => ({ ...prev, [announcement.id]: !prev[announcement.id] }));
                                // Lazy-fetch comments from student endpoint if not loaded
                                if (!announcement.__loadedComments) {
                                  try {
                                    announcement.__loadedComments = true;
                                    const res = await apiService.getStudentStreamComments(code, announcement.id);
                                    const raw = Array.isArray(res?.data) ? res.data : [];
                                    const comments = raw.map(c => ({
                                      id: c.id,
                                      author: c.user_name,
                                      text: c.comment,
                                      date: c.created_at,
                                      profile_pic: c.user_avatar || null,
                                    }));
                                    // Update the appropriate announcements array in state
                                    if (studentAnnouncements.some(a => a.id === announcement.id)) {
                                      setStudentAnnouncements(prev => prev.map(a => a.id === announcement.id ? { ...a, comments } : a));
                                    } else {
                                      setApiAnnouncements(prev => prev.map(a => a.id === announcement.id ? { ...a, comments } : a));
                                    }
                                  } catch (e) {
                                    console.warn('Failed to load student comments:', e?.message || e);
                                  }
                                }
                              }}
                            >
                              Comments ({announcement.comments.length})
                              <i className={`fa fa-chevron-${collapsedComments[announcement.id] ? 'down' : 'up'}`} style={{ marginLeft: 8 }} />
                            </div>
                            {!collapsedComments[announcement.id] && announcement.comments.map((comment, idx) => (
                              <div key={idx} style={{ display: 'flex', alignItems: 'flex-start', marginBottom: 10, position: 'relative' }}>
                                {(() => {
                                  // Prefer the logged-in user's data for their own comments
                                  let authorUser = (comment.author === loggedInName && user) ? { ...user, name: loggedInName, full_name: loggedInName } : null;
                                  if (!authorUser) {
                                    const found = findMemberByName(comment.author);
                                    if (found) authorUser = { ...found, name: found.full_name || found.name };
                                  }
                                  if (!authorUser) authorUser = { name: comment.author, full_name: comment.author, profile_pic: comment.profile_pic || comment.user_avatar || null };

                                  const avatarUrl = getProfilePictureUrl(authorUser);
                                  const bgColor = getAvatarColor(authorUser);
                                  const initials = getUserInitials(authorUser);
                                  return (
                                    <div style={{ width: 40, height: 40, borderRadius: '50%', background: avatarUrl ? '#e9ecef' : bgColor, display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden', marginRight: 12, color: '#fff', fontWeight: 600 }}>
                                      {avatarUrl ? (
                                        <img
                                          src={avatarUrl}
                                          alt="avatar"
                                          style={{ width: 40, height: 40, borderRadius: '50%', objectFit: 'cover', display: 'block' }}
                                          onError={(e) => {
                                            e.target.style.display = 'none';
                                            if (e.target.nextSibling) e.target.nextSibling.style.display = 'flex';
                                          }}
                                        />
                                      ) : null}
                                      <span style={{ display: avatarUrl ? 'none' : 'flex', alignItems: 'center', justifyContent: 'center', width: '100%', height: '100%' }}>{initials}</span>
                                    </div>
                                  );
                                })()}
                                <div style={{ flex: 1 }}>
                                  <div style={{ fontWeight: 600, fontSize: 12 }}>{comment.author} <span style={{ color: '#888', fontWeight: 400, fontSize: 10, marginLeft: 5 }}>{formatRelativeTime(comment.date)}</span></div>
                                  {editingComment.announcementId === announcement.id && editingComment.idx === idx ? (
                                    <>
                                      <input
                                        type="text"
                                        value={editCommentValue}
                                        onChange={e => setEditCommentValue(e.target.value)}
                                        style={{ width: '100%', fontSize: 15, borderRadius: 6, border: '1px solid #e0e0e0', padding: '6px 10px', marginBottom: 6 }}
                                      />
                                      <div style={{ display: 'flex', gap: 8 }}>
                                        <button onClick={handleCommentEditCancel} style={{ background: '#f7fafd', color: '#222', border: 'none', borderRadius: 6, padding: '6px 16px', fontWeight: 500, cursor: 'pointer' }}>Cancel</button>
                                        <button onClick={() => handleCommentEditSave(announcement.id, idx)} style={{ background: '#2ecc71', color: '#fff', border: 'none', borderRadius: 6, padding: '6px 16px', fontWeight: 600, cursor: 'pointer' }}>Save</button>
                                      </div>
                                    </>
                                  ) : (
                                    <div style={{ fontSize: 12, color: '#444' }}>{comment.text}</div>
                                  )}
                                </div>
                                {/* 3-dots menu - Only show for comment authors and announcement authors */}
                                {(() => {
                                  // Check if current user can manage this comment
                                  const currentUser = currentUserProfile || user || (() => {
                                    try {
                                      const stored = localStorage.getItem('user') || localStorage.getItem('scms_logged_in_user');
                                      return stored ? JSON.parse(stored) : null;
                                    } catch (_) { return null; }
                                  })();
                                  
                                  const isCommentAuthor = currentUser && (
                                    currentUser.full_name === comment.author ||
                                    currentUser.name === comment.author ||
                                    currentUser.user_name === comment.author ||
                                    loggedInName === comment.author
                                  );
                                  
                                  const isAnnouncementAuthor = currentUser && (
                                    currentUser.full_name === announcement.author ||
                                    currentUser.name === announcement.author ||
                                    currentUser.user_name === announcement.author ||
                                    loggedInName === announcement.author
                                  );
                                  
                                  // Show menu if user is comment author (can edit/delete) or announcement author (can delete any comment)
                                  if (isCommentAuthor || isAnnouncementAuthor) {
                                    // Debug logging for comment authorization
                                    console.log('Student comment authorization:', {
                                      commentAuthor: comment.author,
                                      announcementAuthor: announcement.author,
                                      currentUser: currentUser?.full_name || currentUser?.name || currentUser?.user_name || loggedInName,
                                      loggedInName,
                                      isCommentAuthor,
                                      isAnnouncementAuthor,
                                      canEdit: isCommentAuthor,
                                      canDelete: true
                                    });
                                    
                                    return (
                                      <div style={{ position: 'relative', marginLeft: 8 }}>
                                        <i className="fa fa-ellipsis-v" style={{ color: '#5e6e8c', fontSize: 18, cursor: 'pointer' }} onClick={() => handleCommentMenu(announcement.id, idx)} />
                                        {openCommentMenu.announcementId === announcement.id && openCommentMenu.idx === idx && (
                                          <div ref={commentMenuRef} style={{ position: 'absolute', top: 22, right: 0, background: '#fff', borderRadius: 12, boxShadow: '0 4px 24px #324cdd22', padding: '10px 0', minWidth: 120, zIndex: 20 }}>
                                            {/* Only show Edit button for comment authors */}
                                            {isCommentAuthor && (
                                              <div style={{ padding: '10px 20px', cursor: 'pointer' }} onClick={() => handleCommentEdit(announcement.id, idx)}>Edit</div>
                                            )}
                                            {/* Show Delete button for both comment authors and announcement authors */}
                                            <div style={{ padding: '10px 20px', cursor: 'pointer' }} onClick={() => handleCommentDelete(announcement.id, idx)}>Delete</div>
                                          </div>
                                        )}
                                      </div>
                                    );
                                  }
                                  // Don't show menu for others
                                  return null;
                                })()}
                              </div>
                            ))}
                            {/* Comment input box */}
                            {!collapsedComments[announcement.id] && (
                              <div style={{ display: 'flex', alignItems: 'center', marginTop: 12, gap: 8 }}>
                                <input
                                  type="text"
                                  placeholder="Add a comment..."
                                  value={commentInputs[announcement.id] || ""}
                                  onChange={e => handleCommentInputChange(announcement.id, e.target.value)}
                                  style={{ flex: 1, borderRadius: 8, border: '2px solid #bfcfff', padding: '10px 12px', fontSize: 13, outline: 'none', background: '#fff', transition: 'border 0.2s', height: 36 }}
                                  onKeyDown={e => { if (e.key === 'Enter') handlePostComment(announcement.id); }}
                                />
                                <div style={{ position: 'relative' }}>
                                  <button
                                    type="button"
                                    style={{ background: '#fff', border: 'none', borderRadius: 6, padding: 3, width: 22, height: 22, display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 1px 4px #e9ecef' }}
                                    onClick={() => setShowCommentEmojiPicker(prev => ({ ...prev, [announcement.id]: !prev[announcement.id] }))}
                                  >
                                    <i className="fa fa-smile" style={{ fontSize: 12 }} />
                                  </button>
                                  {showCommentEmojiPicker[announcement.id] && (
                                    <div ref={el => { if (el) commentEmojiPickerRefs.current[announcement.id] = el; }} style={{ position: 'absolute', top: 40, left: 0, background: '#fff', border: '1px solid #e9ecef', borderRadius: 8, boxShadow: '0 2px 8px #324cdd22', padding: 8, zIndex: 30, minWidth: 220, maxWidth: 220, width: 220, maxHeight: 180, overflowY: 'auto' }}>
                                      {emojiList.map(emoji => (
                                        <span key={emoji} style={{ fontSize: 20, cursor: 'pointer', margin: 4 }} onClick={() => handleAddEmojiToComment(announcement.id, emoji)}>{emoji}</span>
                                      ))}
                                    </div>
                                  )}
                                </div>
                                <button
                                  type="button"
                                  style={{ background: '#7b8cff', border: 'none', borderRadius: 6, padding: 0, width: 22, height: 22, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontSize: 12, boxShadow: '0 1px 4px #e9ecef' }}
                                  onClick={() => handlePostComment(announcement.id)}
                                  disabled={!(commentInputs[announcement.id] || '').trim()}
                                >
                                  <i className="ni ni-send" />
                                </button>
                              </div>
                            )}
                          </div>
                        ) : (
                          <div style={{ background: '#f7fafd', borderRadius: 10, padding: '12px 18px', marginTop: 10, color: '#888', fontWeight: 500 }}>
                            Comments are disabled for this post.
                          </div>
                        )}
                      </>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
      {/* Classwork Section */}
      {activeTab === "classwork" && (
        <div style={{ maxWidth: 900, margin: '32px auto 0' }}>
          {/* Stats Cards */}
          <div style={{ 
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', 
            borderRadius: 20, 
            padding: '32px 40px', 
            position: 'relative',
            overflow: 'hidden',
            marginBottom: '32px'
          }}>
            <div style={{ position: 'absolute', top: 0, right: 0, width: '200px', height: '200px', background: 'rgba(255,255,255,0.1)', borderRadius: '50%', transform: 'translate(50%, -50%)' }} />
            <div style={{ position: 'absolute', bottom: 0, left: '20%', width: '100px', height: '100px', background: 'rgba(255,255,255,0.08)', borderRadius: '50%' }} />
            <div style={{ position: 'relative', zIndex: 2, display: 'flex', gap: 24, justifyContent: 'center' }}>
              <div style={{ 
                background: 'rgba(255,255,255,0.15)', 
                padding: '16px 24px', 
                borderRadius: 12,
                backdropFilter: 'blur(10px)'
              }}>
                <div style={{ color: '#fff', fontWeight: 700, fontSize: 24 }}>{loadingAssignments ? '...' : realAssignments.length}</div>
                <div style={{ color: 'rgba(255,255,255,0.8)', fontSize: 14 }}>Total Assignments</div>
              </div>
              <div style={{ 
                background: 'rgba(255,255,255,0.15)', 
                padding: '16px 24px', 
                borderRadius: 12,
                backdropFilter: 'blur(10px)'
              }}>
                <div style={{ color: '#fff', fontWeight: 700, fontSize: 24 }}>
                  {loadingAssignments ? '...' : realAssignments.filter(a => {
                    // Check for submission status first
                    let status = 'pending';
                    if (a.submission) {
                      status = a.submission.status || 'submitted';
                    } else if (a.submission_status) {
                      status = a.submission_status;
                    }
                    
                    const normalizedStatus = status.toLowerCase().trim();
                    return normalizedStatus === 'submitted' || normalizedStatus === 'graded';
                  }).length}
                </div>
                <div style={{ color: 'rgba(255,255,255,0.8)', fontSize: 14 }}>Completed</div>
              </div>
              <div style={{ 
                background: 'rgba(255,255,255,0.15)', 
                padding: '16px 24px', 
                borderRadius: 12,
                backdropFilter: 'blur(10px)'
              }}>
                <div style={{ color: '#fff', fontWeight: 700, fontSize: 24 }}>
                  {loadingAssignments ? '...' : realAssignments.filter(a => {
                    // Check for submission status first
                    let status = 'pending';
                    if (a.submission) {
                      status = a.submission.status || 'submitted';
                    } else if (a.submission_status) {
                      status = a.submission_status;
                    }
                    
                    const normalizedStatus = status.toLowerCase().trim();
                    return normalizedStatus !== 'submitted' && normalizedStatus !== 'graded';
                  }).length}
                </div>
                <div style={{ color: 'rgba(255,255,255,0.8)', fontSize: 14 }}>Pending</div>
              </div>
            </div>
            {assignmentsError && <div style={{ color: '#fff', marginTop: 16, textAlign: 'center', fontWeight: 500 }}>{assignmentsError}</div>}
          </div>

          {/* Assignments List */}
          {loadingAssignments ? (
            <div style={{ textAlign: 'center', padding: '40px' }}>
              <LottieLoader message="Loading assignments..." width={140} height={140} centered desiredDurationSec={1.4} />
            </div>
          ) : realAssignments.length > 0 ? (
            <div>
              <h3 style={{ 
                fontWeight: 600, 
                fontSize: '24px', 
                marginBottom: '24px', 
                color: '#212529',
                display: 'flex',
                alignItems: 'center'
              }}>
                <i className="ni ni-single-copy-04" style={{ marginRight: '12px', color: '#6c757d' }} />
                Your Assignments
              </h3>
              <div style={{ display: 'grid', gap: '16px' }}>
                {realAssignments.map((assignment, index) => {
                  // Debug: Log the assignment object structure
                  console.log(`Assignment ${index + 1}:`, assignment);
                  
                  return (
                  <div key={assignment.id || index} style={{
                    background: '#ffffff',
                    borderRadius: '16px',
                    padding: '24px',
                    border: '1px solid #e9ecef',
                    boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
                    cursor: 'pointer',
                    transition: 'all 0.2s ease',
                    ':hover': {
                      boxShadow: '0 4px 16px rgba(0,0,0,0.1)',
                      transform: 'translateY(-2px)'
                    }
                  }}>
                    <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
                      <div style={{ flex: 1 }}>
                        <div style={{ display: 'flex', alignItems: 'center', marginBottom: '12px' }}>
                          <div style={{
                            width: '40px',
                            height: '40px',
                            borderRadius: '10px',
                            background: '#f8f9fa',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            marginRight: '12px',
                            border: '2px solid #e9ecef'
                          }}>
                            <i className="ni ni-single-copy-04" style={{ fontSize: '20px', color: '#6c757d' }} />
                          </div>
                          <div>
                            <h4 style={{
                              fontWeight: 600,
                              fontSize: '18px',
                              margin: '0 0 4px 0',
                              color: '#212529'
                            }}>
                              {assignment.title || assignment.task_title || `Assignment ${index + 1}`}
                            </h4>
                            <div style={{ fontSize: '14px', color: '#6c757d' }}>
                              Posted {assignment.created_at ? new Date(assignment.created_at).toLocaleDateString() : 'Recently'}
                            </div>
                          </div>
                        </div>
                        
                        {assignment.description && (
                          <div style={{
                            fontSize: '14px',
                            color: '#495057',
                            lineHeight: 1.5,
                            marginBottom: '16px',
                            padding: '12px',
                            background: '#f8f9fa',
                            borderRadius: '8px',
                            border: '1px solid #e9ecef'
                          }}>
                            {assignment.description}
                          </div>
                        )}

                        <div style={{ display: 'flex', alignItems: 'center', gap: '16px', flexWrap: 'wrap' }}>
                          {assignment.due_date && (
                            <div style={{ display: 'flex', alignItems: 'center', fontSize: '13px', color: '#6c757d' }}>
                              <i className="ni ni-time-alarm" style={{ marginRight: '6px' }} />
                              Due {new Date(assignment.due_date).toLocaleDateString()}
                            </div>
                          )}
                          
                          <Badge style={{
                            background: (() => {
                              // Determine status with QR-graded awareness
                              let status = 'pending';
                              let grade = null;
                              if (assignment.submission) {
                                status = assignment.submission.status || 'submitted';
                                grade = assignment.submission.grade;
                              } else if (assignment.submission_status) {
                                status = assignment.submission_status;
                              }
                              const normalizedStatus = (status || '').toLowerCase().trim();
                              if (grade !== null && grade !== undefined) return '#d4edda';
                              if (normalizedStatus === 'graded') return '#d4edda'; // Green for graded
                              if (normalizedStatus === 'submitted') return '#d4edda'; // Green for submitted
                              return '#fff3cd'; // Yellow for pending
                            })(),
                            color: (() => {
                              let status = 'pending';
                              let grade = null;
                              if (assignment.submission) {
                                status = assignment.submission.status || 'submitted';
                                grade = assignment.submission.grade;
                              } else if (assignment.submission_status) {
                                status = assignment.submission_status;
                              }
                              const normalizedStatus = (status || '').toLowerCase().trim();
                              if (grade !== null && grade !== undefined) return '#155724';
                              if (normalizedStatus === 'graded') return '#155724'; // Dark green for graded
                              if (normalizedStatus === 'submitted') return '#155724'; // Dark green for submitted
                              return '#856404'; // Dark yellow for pending
                            })(),
                            borderRadius: '20px',
                            padding: '6px 12px',
                            fontSize: '12px',
                            fontWeight: 600
                          }}>
                            {(() => {
                              let status = 'pending';
                              let grade = null;
                              if (assignment.submission) {
                                status = assignment.submission.status || 'submitted';
                                grade = assignment.submission.grade;
                              } else if (assignment.submission_status) {
                                status = assignment.submission_status;
                              }
                              const normalizedStatus = (status || '').toLowerCase().trim();
                              if (grade !== null && grade !== undefined) return `🏆 Graded • ${grade}/${assignment.points || assignment.max_points || assignment.total_points || 100}`;
                              if (normalizedStatus === 'graded') return '🏆 Graded';
                              if (normalizedStatus === 'submitted') return '✅ Submitted';
                              return '⏳ Pending';
                            })()}
                          </Badge>
                        </div>
                      </div>
                      
                      <Button
                        color="primary"
                        size="sm"
                        style={{
                          borderRadius: '8px',
                          fontWeight: 600,
                          padding: '8px 16px',
                          fontSize: '13px'
                        }}
                        onClick={() => {
                          console.log('Clicking View Details for assignment:', assignment);
                          console.log('Assignment ID field:', assignment.id);
                          console.log('Assignment task_id field:', assignment.task_id);
                          console.log('All assignment fields:', Object.keys(assignment));
                          
                          // Try to use the task_id if available, otherwise use id
                          const taskId = assignment.task_id || assignment.id;
                          if (taskId && taskId !== 'unknown') {
                            navigate(`/student/classroom/${code}/assignment/${taskId}`);
                          } else {
                            console.error('No valid task ID found for assignment:', assignment);
                            alert('Unable to load assignment details. Please try again.');
                          }
                        }}
                      >
                        View Details
                      </Button>
                    </div>
                  </div>
                );
                })}
              </div>
            </div>
          ) : (
            <div style={{ 
              textAlign: 'center', 
              padding: '40px',
              background: '#ffffff',
              borderRadius: '16px',
              border: '1px solid #e9ecef'
            }}>
              <i className="ni ni-single-copy-04" style={{ fontSize: '4rem', color: '#dee2e6', marginBottom: '16px' }} />
              <h4 style={{ color: '#6c757d', marginBottom: '8px' }}>No assignments yet</h4>
              <p style={{ color: '#6c757d', fontSize: '14px' }}>Your teacher hasn't posted any assignments for this class.</p>
            </div>
          )}
        </div>
      )}
      {/* People Section */}
      {activeTab === "people" && (
        <div style={{ maxWidth: 1100, margin: '32px auto 0' }}>
          {loadingPeople ? (
            <div style={{ textAlign: 'center', padding: '60px' }}>
              <LottieLoader message="Loading people..." width={140} height={140} centered desiredDurationSec={1.4} />
            </div>
          ) : peopleError ? (
            <Alert color="danger" style={{ margin: '32px auto', maxWidth: 1100 }}>
              <h4>Error Loading People</h4>
              <p>{peopleError}</p>
            </Alert>
          ) : peopleData ? (
            <>
              {/* Top Stats Banner */}
              <div style={{
                background: '#f8f9fa',
                borderRadius: '20px',
                padding: '24px 32px',
                marginBottom: '32px',
                border: '1px solid #dee2e6',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '24px' }}>
                  <div style={{
                    background: '#ffffff',
                    borderRadius: '16px',
                    padding: '16px',
                    boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
                    border: '1px solid #e9ecef'
                  }}>
                    <i className="ni ni-single-02" style={{ fontSize: '28px', color: '#6c757d' }} />
                  </div>
                  <div>
                    <div style={{ fontSize: '14px', color: '#6c757d', fontWeight: 500, marginBottom: '4px' }}>
                      Total Class Members
                    </div>
                    <div style={{ fontSize: '32px', fontWeight: 700, color: '#212529' }}>
                      {peopleData.statistics?.total_members || 0}
                    </div>
                  </div>
                </div>
                <div style={{ display: 'flex', gap: '32px' }}>
                  <div style={{ textAlign: 'center' }}>
                    <div style={{ fontSize: '24px', fontWeight: 700, color: '#495057', marginBottom: '4px' }}>
                      {peopleData.statistics?.total_teachers || 0}
                    </div>
                    <div style={{ fontSize: '14px', color: '#6c757d', fontWeight: 500 }}>
                      Teachers
                    </div>
                  </div>
                  <div style={{ textAlign: 'center' }}>
                    <div style={{ fontSize: '24px', fontWeight: 700, color: '#495057', marginBottom: '4px' }}>
                      {peopleData.statistics?.total_students || 0}
                    </div>
                    <div style={{ fontSize: '14px', color: '#6c757d', fontWeight: 500 }}>
                      Students
                    </div>
                  </div>
                </div>
              </div>

              {/* Main Content Grid */}
              <Row>
                {/* Teachers Column */}
                <Col lg={4}>
                  <div style={{
                    background: '#ffffff',
                    borderRadius: '20px',
                    border: '1px solid #e9ecef',
                    boxShadow: '0 2px 12px rgba(0,0,0,0.04)',
                    padding: '28px',
                    height: 'fit-content'
                  }}>
                    <div style={{
                      display: 'flex',
                      alignItems: 'center',
                      marginBottom: '24px',
                      paddingBottom: '16px',
                      borderBottom: '2px solid #f8f9fa'
                    }}>
                      <div style={{
                        width: '44px',
                        height: '44px',
                        borderRadius: '12px',
                        background: '#e9ecef',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        marginRight: '16px'
                      }}>
                        <i className="ni ni-single-02" style={{ fontSize: '20px', color: '#6c757d' }} />
                      </div>
                      <div>
                        <h3 style={{
                          fontWeight: 700,
                          fontSize: '20px',
                          margin: 0,
                          color: '#212529'
                        }}>
                          Teaching Staff
                        </h3>
                        <div style={{ fontSize: '13px', color: '#6c757d', fontWeight: 500 }}>
                          Course Instructors
                        </div>
                      </div>
                    </div>
                    {peopleData.teacher && (
                      <div style={{
                        display: 'flex',
                        alignItems: 'center',
                        padding: '16px',
                        background: '#f8f9fa',
                        borderRadius: '16px',
                        marginBottom: '12px',
                        border: '1px solid #e9ecef',
                        transition: 'all 0.2s ease',
                        position: 'relative',
                        overflow: 'hidden'
                      }}>
                        <div style={{
                          position: 'absolute',
                          top: 0,
                          left: 0,
                          width: '4px',
                          height: '100%',
                          background: '#dee2e6'
                        }} />
                        {(() => {
                          const avatarUrl = getProfilePictureUrl(peopleData.teacher);
                          const bgColor = getAvatarColor(peopleData.teacher);
                          const initials = getUserInitials(peopleData.teacher);
                          return (
                            <div style={{
                              width: '52px',
                              height: '52px',
                              borderRadius: '14px',
                              background: avatarUrl ? '#e9ecef' : bgColor,
                              color: '#fff',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              fontWeight: 700,
                              fontSize: '18px',
                              marginRight: '16px',
                              marginLeft: '8px',
                              overflow: 'hidden'
                            }}>
                              {avatarUrl ? (
                                <img
                                  src={avatarUrl}
                                  alt={peopleData.teacher.full_name}
                                  style={{
                                    width: '52px',
                                    height: '52px',
                                    borderRadius: '14px',
                                    objectFit: 'cover',
                                    display: 'block'
                                  }}
                                  onError={(e) => {
                                    e.target.style.display = 'none';
                                    if (e.target.nextSibling) e.target.nextSibling.style.display = 'flex';
                                  }}
                                />
                              ) : null}
                              <span style={{ display: avatarUrl ? 'none' : 'flex', alignItems: 'center', justifyContent: 'center', width: '100%', height: '100%' }}>{initials}</span>
                            </div>
                          );
                        })()}
                        <div style={{ flex: 1 }}>
                          <div style={{
                            fontSize: '16px',
                            fontWeight: 600,
                            color: '#212529',
                            marginBottom: '4px'
                          }}>
                            {peopleData.teacher.full_name}
                          </div>
                          <div style={{
                            fontSize: '13px',
                            color: '#6c757d',
                            fontWeight: 500
                          }}>
                            {peopleData.teacher.role}
                          </div>
                        </div>
                        <div style={{
                          background: '#d4edda',
                          color: '#155724',
                          padding: '4px 12px',
                          borderRadius: '20px',
                          fontSize: '12px',
                          fontWeight: 600
                        }}>
                          {peopleData.teacher.status}
                        </div>
                      </div>
                    )}
                  </div>
                </Col>

                {/* Students Column */}
                <Col lg={8}>
                  <div style={{
                    background: '#ffffff',
                    borderRadius: '20px',
                    border: '1px solid #e9ecef',
                    boxShadow: '0 2px 12px rgba(0,0,0,0.04)',
                    padding: '28px'
                  }}>
                    <div style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      marginBottom: '24px',
                      paddingBottom: '16px',
                      borderBottom: '2px solid #f8f9fa'
                    }}>
                      <div style={{ display: 'flex', alignItems: 'center' }}>
                        <div style={{
                          width: '44px',
                          height: '44px',
                          borderRadius: '12px',
                          background: '#e9ecef',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          marginRight: '16px'
                        }}>
                          <i className="ni ni-single-02" style={{ fontSize: '20px', color: '#6c757d' }} />
                        </div>
                        <div>
                          <h3 style={{
                            fontWeight: 700,
                            fontSize: '20px',
                            margin: 0,
                            color: '#212529'
                          }}>
                            Class Members
                          </h3>
                          <div style={{ fontSize: '13px', color: '#6c757d', fontWeight: 500 }}>
                            Enrolled Students
                          </div>
                        </div>
                      </div>
                      <div style={{
                        background: '#f1f3f4',
                        color: '#6c757d',
                        fontWeight: 600,
                        fontSize: '14px',
                        padding: '8px 16px',
                        borderRadius: '20px',
                        border: 'none'
                      }}>
                        {peopleData.students?.length || 0} Students
                      </div>
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '16px' }}>
                      {peopleData.students?.map((student, idx) => (
                        <div key={student.user_id} style={{
                          display: 'flex',
                          alignItems: 'center',
                          padding: '16px',
                          background: '#f8f9fa',
                          borderRadius: '16px',
                          border: '1px solid #e9ecef',
                          transition: 'all 0.2s ease',
                          position: 'relative',
                          overflow: 'hidden'
                        }}>
                          <div style={{
                            position: 'absolute',
                            top: 0,
                            left: 0,
                            width: '4px',
                            height: '100%',
                            background: '#dee2e6'
                          }} />
                          {(() => {
                            const avatarUrl = getProfilePictureUrl(student);
                            const bgColor = getAvatarColor(student);
                            const initials = getUserInitials(student);
                            return (
                              <div style={{
                                width: '48px',
                                height: '48px',
                                borderRadius: '12px',
                                background: avatarUrl ? '#e9ecef' : bgColor,
                                color: '#fff',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                fontWeight: 700,
                                fontSize: '16px',
                                marginRight: '16px',
                                marginLeft: '8px',
                                overflow: 'hidden'
                              }}>
                                {avatarUrl ? (
                                  <img
                                    src={avatarUrl}
                                    alt={student.full_name}
                                    style={{
                                      width: '48px',
                                      height: '48px',
                                      borderRadius: '12px',
                                      objectFit: 'cover',
                                      display: 'block'
                                    }}
                                    onError={(e) => {
                                      e.target.style.display = 'none';
                                      if (e.target.nextSibling) e.target.nextSibling.style.display = 'flex';
                                    }}
                                  />
                                ) : null}
                                <span style={{ display: avatarUrl ? 'none' : 'flex', alignItems: 'center', justifyContent: 'center', width: '100%', height: '100%' }}>{initials}</span>
                              </div>
                            );
                          })()}
                          <div style={{ flex: 1 }}>
                            <div style={{
                              fontSize: '15px',
                              fontWeight: 600,
                              color: '#212529',
                              marginBottom: '2px'
                            }}>
                              {student.full_name}
                            </div>
                            <div style={{
                              fontSize: '12px',
                              color: '#6c757d',
                              fontWeight: 500
                            }}>
                              {student.role}
                            </div>
                          </div>
                          <div style={{
                            background: student.enrollment_status === 'active' ? '#d4edda' : '#f8d7da',
                            color: student.enrollment_status === 'active' ? '#155724' : '#721c24',
                            padding: '3px 10px',
                            borderRadius: '16px',
                            fontSize: '11px',
                            fontWeight: 600
                          }}>
                            {student.status}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </Col>
              </Row>
            </>
          ) : (
            <div style={{ textAlign: 'center', padding: '40px', color: '#6c757d' }}>
              <i className="ni ni-single-02" style={{ fontSize: '4rem', marginBottom: '16px' }} />
              <h4>No people data available</h4>
            </div>
          )}
        </div>
      )}
      {/* Grades Section */}
      {activeTab === "grades" && (
        <div style={{ maxWidth: 1100, margin: '32px auto 0' }}>
          {loadingGrades ? (
            <div style={{ textAlign: 'center', padding: '60px' }}>
              <LottieLoader message="Loading grades..." width={140} height={140} centered desiredDurationSec={1.4} />
            </div>
          ) : gradesError ? (
            <Alert color="danger" style={{ margin: '32px auto', maxWidth: 1100 }}>
              <h4>Error Loading Grades</h4>
              <p>{gradesError}</p>
            </Alert>
          ) : gradesData ? (
            <>
              {/* Top Stats Banner */}
              <div style={{
                background: 'linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%)',
                borderRadius: '20px',
                padding: '24px 32px',
                marginBottom: '32px',
                border: '1px solid #dee2e6',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '24px' }}>
                  <div style={{
                    background: '#ffffff',
                    borderRadius: '16px',
                    padding: '16px',
                    boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
                    border: '1px solid #e9ecef'
                  }}>
                    <i className="ni ni-chart-bar-32" style={{ fontSize: '28px', color: '#495057' }} />
                  </div>
                  <div>
                    <div style={{ fontSize: '14px', color: '#6c757d', fontWeight: 500, marginBottom: '4px' }}>
                      Academic Performance
                    </div>
                    <div style={{ fontSize: '32px', fontWeight: 700, color: '#212529' }}>
                      {(gradesData.student && (gradesData.student.full_name || gradesData.student.name)) || 'Student'}
                    </div>
                  </div>
                </div>
                <div style={{ display: 'flex', gap: '32px' }}>
                  <div style={{ textAlign: 'center' }}>
                    <div style={{ fontSize: '24px', fontWeight: 700, color: '#495057', marginBottom: '4px' }}>
                      {(gradesData.summary && (gradesData.summary.average_percent ?? gradesData.summary.average_grade)) || 0}%
                    </div>
                    <div style={{ fontSize: '14px', color: '#6c757d', fontWeight: 500 }}>
                      Average Grade
                    </div>
                  </div>
                  <div style={{ textAlign: 'center' }}>
                    <div style={{ fontSize: '24px', fontWeight: 700, color: '#495057', marginBottom: '4px' }}>
                      {(gradesData.summary && gradesData.summary.tasks_total) || 0}
                    </div>
                    <div style={{ fontSize: '14px', color: '#6c757d', fontWeight: 500 }}>
                      Total Assignments
                    </div>
                  </div>
                </div>
              </div>

          {/* Main Content Grid */}
          <Row>
            {/* Filter Column */}
            <Col lg={3}>
              <div style={{
                background: '#ffffff',
                borderRadius: '20px',
                border: '1px solid #e9ecef',
                boxShadow: '0 2px 12px rgba(0,0,0,0.08)',
                padding: '28px',
                height: 'fit-content'
              }}>
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  marginBottom: '24px',
                  paddingBottom: '16px',
                  borderBottom: '2px solid #f8f9fa'
                }}>
                  <div style={{
                    width: '44px',
                    height: '44px',
                    borderRadius: '12px',
                    background: '#e9ecef',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    marginRight: '16px'
                  }}>
                    <i className="ni ni-settings" style={{ fontSize: '20px', color: '#6c757d' }} />
                  </div>
                  <div>
                    <h3 style={{
                      fontWeight: 700,
                      fontSize: '20px',
                      margin: 0,
                      color: '#212529'
                    }}>
                      Grade Filters
                    </h3>
                    <div style={{ fontSize: '13px', color: '#6c757d', fontWeight: 500 }}>
                      Filter by Status
                    </div>
                  </div>
                </div>

                <div style={{ position: 'relative' }}>
                  <div
                    style={{
                      border: '2px solid #e9ecef',
                      borderRadius: '12px',
                      padding: '16px 20px',
                      fontSize: '16px',
                      fontWeight: 500,
                      color: '#495057',
                      background: '#ffffff',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      userSelect: 'none',
                      transition: 'all 0.2s ease'
                    }}
                    onClick={() => setDropdownOpen(v => !v)}
                  >
                    <span>{gradeFilter}</span>
                    <i className="ni ni-bold-down" style={{ 
                      fontSize: '16px', 
                      color: '#6c757d', 
                      transition: 'transform 0.2s', 
                      transform: dropdownOpen ? 'rotate(180deg)' : 'rotate(0deg)' 
                    }} />
                  </div>
                  {dropdownOpen && (
                    <div style={{
                      position: 'absolute',
                      top: '110%',
                      left: 0,
                      width: '100%',
                      background: '#ffffff',
                      border: '2px solid #e9ecef',
                      borderRadius: '12px',
                      boxShadow: '0 4px 20px rgba(0,0,0,0.12)',
                      zIndex: 10,
                      marginTop: '4px',
                      overflow: 'hidden'
                    }}>
                      {gradeFilters.map(option => (
                        <div
                          key={option}
                          style={{
                            padding: '16px 20px',
                            fontSize: '16px',
                            fontWeight: 500,
                            color: '#495057',
                            background: gradeFilter === option ? '#f8f9fa' : '#ffffff',
                            cursor: 'pointer',
                            borderBottom: '1px solid #f8f9fa',
                            transition: 'all 0.2s ease'
                          }}
                          onClick={() => { setGradeFilter(option); setDropdownOpen(false); }}
                        >
                          {option}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </Col>

            {/* Assignments Column */}
            <Col lg={9}>
              <div style={{
                background: '#ffffff',
                borderRadius: '20px',
                border: '1px solid #e9ecef',
                boxShadow: '0 2px 12px rgba(0,0,0,0.08)',
                padding: '28px'
              }}>
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  marginBottom: '24px',
                  paddingBottom: '16px',
                  borderBottom: '2px solid #f8f9fa'
                }}>
                  <div style={{ display: 'flex', alignItems: 'center' }}>
                    <div style={{
                      width: '44px',
                      height: '44px',
                      borderRadius: '12px',
                      background: '#e9ecef',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      marginRight: '16px'
                    }}>
                      <i className="ni ni-paper-diploma" style={{ fontSize: '20px', color: '#6c757d' }} />
                    </div>
                    <div>
                      <h3 style={{
                        fontWeight: 700,
                        fontSize: '20px',
                        margin: 0,
                        color: '#212529'
                      }}>
                        Assignment Grades
                      </h3>
                      <div style={{ fontSize: '13px', color: '#6c757d', fontWeight: 500 }}>
                        Your Academic Progress
                      </div>
                    </div>
                  </div>
                  <div style={{
                    background: '#f1f3f4',
                    color: '#6c757d',
                    fontWeight: 600,
                    fontSize: '14px',
                    padding: '8px 16px',
                    borderRadius: '20px',
                    border: 'none'
                  }}>
                    {(Array.isArray(gradesData.items) ? gradesData.items.length : (gradesData.grades?.length || 0))} Items
                  </div>
                </div>

                <div>
                  {(Array.isArray(gradesData.items) ? gradesData.items : (gradesData.grades || [])).map(a => (
                    <div key={a.id}>
                      {expandedGradeId === a.id ? (
                        <div style={{ 
                          border: '2px solid #e9ecef', 
                          borderRadius: '16px', 
                          marginBottom: '16px', 
                          background: '#f8f9fa',
                          overflow: 'hidden'
                        }}>
                          <div style={{ 
                            display: 'flex', 
                            alignItems: 'center', 
                            justifyContent: 'space-between', 
                            padding: '20px 24px', 
                            cursor: 'pointer',
                            background: '#ffffff',
                            borderBottom: '1px solid #e9ecef'
                          }} onClick={() => setExpandedGradeId(null)}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                              <div>
                                <div style={{ fontWeight: 700, fontSize: '18px', color: '#212529', marginBottom: '4px' }}>
                                  {a.title}
                                </div>
                                <div style={{ fontSize: '14px', color: '#6c757d', display: 'flex', alignItems: 'center', gap: '8px' }}>
                                  <i className="ni ni-paper-clip" style={{ fontSize: '14px' }} />
                                  <span>{a.attachment_count || 0} attachments</span>
                                  <span style={{ margin: '0 8px' }}>•</span>
                                  <span>Due {new Date(a.due_date).toLocaleDateString('en-US', { 
                                    year: 'numeric', 
                                    month: 'short', 
                                    day: 'numeric',
                                    hour: '2-digit',
                                    minute: '2-digit'
                                  })}</span>
                                </div>
                              </div>
                            </div>
                            <div style={{ 
                              fontWeight: 700, 
                              fontSize: '20px',
                              color: '#495057'
                            }}>
                              {(() => {
                                const { gradeValue, maxPoints } = getDisplayGrade(a);
                                if (gradeValue !== undefined && gradeValue !== null) {
                                  return `${gradeValue}/${maxPoints}`;
                                }
                                return a.status === 'submitted' ? 'Turned in' : a.status === 'graded' ? 'Graded' : 'Pending';
                              })()}
                            </div>
                          </div>
                          {/* Expanded content for assignments with attachments */}
                          {a.attachment_url && (
                            <>
                              <div style={{ padding: '24px', background: '#ffffff' }}>
                                <div style={{ 
                                  fontSize: '16px', 
                                  fontWeight: 600, 
                                  color: '#212529', 
                                  marginBottom: '16px' 
                                }}>
                                  Submitted Files
                                </div>
                                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '16px' }}>
                                  <div style={{ 
                                    background: '#f8f9fa', 
                                    border: '1px solid #e9ecef', 
                                    borderRadius: '12px', 
                                    padding: '16px', 
                                    display: 'flex', 
                                    alignItems: 'center', 
                                    gap: '12px' 
                                  }}>
                                    <div style={{
                                      width: '40px',
                                      height: '40px',
                                      borderRadius: '8px',
                                      background: '#e9ecef',
                                      display: 'flex',
                                      alignItems: 'center',
                                      justifyContent: 'center',
                                      color: '#6c757d',
                                      fontWeight: 700,
                                      fontSize: '14px'
                                    }}>
                                      {a.attachment_type === 'file' ? 'FILE' : 'IMG'}
                                    </div>
                                    <div style={{ flex: 1 }}>
                                      <div style={{ fontWeight: 600, fontSize: '14px', color: '#212529', marginBottom: '2px' }}>
                                        {a.attachment_url.split('/').pop()}
                                      </div>
                                      <div style={{ fontSize: '12px', color: '#6c757d' }}>
                                        {a.attachment_type === 'file' ? 'File' : 'Image File'}
                                      </div>
                                    </div>
                                  </div>
                                </div>
                                <div style={{ marginTop: '20px' }}>
                                  <a
                                    href="#"
                                    style={{ 
                                      color: '#495057', 
                                      fontWeight: 600, 
                                      fontSize: '16px', 
                                      textDecoration: 'none',
                                      display: 'inline-flex',
                                      alignItems: 'center',
                                      gap: '8px'
                                    }}
                                    onClick={e => {
                                      e.preventDefault();
                                      navigate(`/student/classroom/${currentClass?.code || code}/assignment/${a.task_id || a.id}`);
                                    }}
                                  >
                                    <i className="ni ni-single-02" style={{ fontSize: '16px' }} />
                                    View Assignment Details
                                  </a>
                                </div>
                              </div>
                            </>
                          )}
                        </div>
                      ) : (
                        <div style={{ 
                          borderBottom: '1px solid #f8f9fa', 
                          padding: '20px 0', 
                          display: 'flex', 
                          alignItems: 'center', 
                          justifyContent: 'space-between', 
                          cursor: 'pointer',
                          transition: 'all 0.2s ease'
                        }} onClick={() => setExpandedGradeId(a.id)}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                            <div>
                              <div style={{ fontWeight: 700, fontSize: '16px', color: '#212529', marginBottom: '4px' }}>
                                {a.title}
                              </div>
                              <div style={{ fontSize: '13px', color: '#6c757d', display: 'flex', alignItems: 'center', gap: '8px' }}>
                                <i className="ni ni-paper-clip" style={{ fontSize: '12px' }} />
                                <span>{a.attachment_count || 0} attachments</span>
                                <span style={{ margin: '0 8px' }}>•</span>
                                <span>Due {a.due_date ? new Date(a.due_date).toLocaleDateString('en-US', { 
                                  year: 'numeric', 
                                  month: 'short', 
                                  day: 'numeric',
                                  hour: '2-digit',
                                  minute: '2-digit'
                                }) : 'N/A'}</span>
                              </div>
                            </div>
                          </div>
                          <div style={{ 
                            fontWeight: 700, 
                            fontSize: '18px',
                            color: '#495057'
                          }}>
                            {(() => {
                              const { gradeValue, maxPoints } = getDisplayGrade(a);
                              if (gradeValue !== undefined && gradeValue !== null) {
                                return `${gradeValue}/${maxPoints}`;
                              }
                              return a.status === 'submitted' ? 'Turned in' : a.status === 'graded' ? 'Graded' : 'Pending';
                            })()}
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </Col>
          </Row>
            </>
          ) : (
            <div style={{ textAlign: 'center', padding: '40px', color: '#6c757d' }}>
              <i className="ni ni-chart-bar-32" style={{ fontSize: '4rem', marginBottom: '16px' }} />
              <h4>No grades data available</h4>
            </div>
          )}
        </div>
      )}
      {/* TODO: Add content for other tabs */}
      {showYouTubeModal && (
        <div style={{ position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', background: 'rgba(0,0,0,0.15)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div style={{ background: '#fff', borderRadius: 18, boxShadow: '0 4px 32px #324cdd22', padding: '2rem', minWidth: 340, maxWidth: 400 }}>
            <div style={{ fontWeight: 700, fontSize: 18, marginBottom: 18 }}>Add YouTube Video</div>
            <div style={{ fontWeight: 600, marginBottom: 8 }}>YouTube URL</div>
            <input type="text" value={modalUrl} onChange={e => setModalUrl(e.target.value)} placeholder="Paste YouTube URL here" style={{ width: '100%', borderRadius: 8, border: '1px solid #e0e0e0', padding: '12px', marginBottom: 24 }} />
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 12 }}>
              <button onClick={() => { setShowYouTubeModal(false); setModalUrl(""); }} style={{ background: '#f7fafd', color: '#222', border: 'none', borderRadius: 8, padding: '10px 24px', fontWeight: 500, cursor: 'pointer' }}>Cancel</button>
              <button onClick={() => handleAddModalAttachment('youtube', editingAnnouncementId === announcement.id ? announcement.id : null)} style={{ background: '#6366f1', color: '#fff', border: 'none', borderRadius: 8, padding: '10px 24px', fontWeight: 600, cursor: 'pointer' }}>Add Video</button>
            </div>
          </div>
        </div>
      )}
      {showDriveModal && (
        <div style={{ position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', background: 'rgba(0,0,0,0.15)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div style={{ background: '#fff', borderRadius: 18, boxShadow: '0 4px 32px #324cdd22', padding: '2rem', minWidth: 340, maxWidth: 400 }}>
            <div style={{ fontWeight: 700, fontSize: 18, marginBottom: 18 }}>Add Google Drive File</div>
            <div style={{ fontWeight: 600, marginBottom: 8 }}>Google Drive URL</div>
            <input type="text" value={modalUrl} onChange={e => setModalUrl(e.target.value)} placeholder="Paste Google Drive URL here" style={{ width: '100%', borderRadius: 8, border: '1px solid #e0e0e0', padding: '12px', marginBottom: 24 }} />
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 12 }}>
              <button onClick={() => { setShowDriveModal(false); setModalUrl(""); }} style={{ background: '#f7fafd', color: '#222', border: 'none', borderRadius: 8, padding: '10px 24px', fontWeight: 500, cursor: 'pointer' }}>Cancel</button>
              <button onClick={() => handleAddModalAttachment('drive', editingAnnouncementId === announcement.id ? announcement.id : null)} style={{ background: '#6366f1', color: '#fff', border: 'none', borderRadius: 8, padding: '10px 24px', fontWeight: 600, cursor: 'pointer' }}>Add File</button>
            </div>
          </div>
        </div>
      )}
      {showLinkModal && (
        <div style={{ position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', background: 'rgba(0,0,0,0.15)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div style={{ background: '#fff', borderRadius: 18, boxShadow: '0 4px 32px #324cdd22', padding: '2rem', minWidth: 340, maxWidth: 400 }}>
            <div style={{ fontWeight: 700, fontSize: 18, marginBottom: 18 }}>Add Link</div>
            <div style={{ fontWeight: 600, marginBottom: 8 }}>Link URL</div>
            <input type="text" value={modalUrl} onChange={e => setModalUrl(e.target.value)} placeholder="Paste link URL here" style={{ width: '100%', borderRadius: 8, border: '1px solid #e0e0e0', padding: '12px', marginBottom: 24 }} />
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 12 }}>
              <button onClick={() => { setShowLinkModal(false); setModalUrl(""); }} style={{ background: '#f7fafd', color: '#222', border: 'none', borderRadius: 8, padding: '10px 24px', fontWeight: 500, cursor: 'pointer' }}>Cancel</button>
              <button onClick={() => handleAddModalAttachment('link', editingAnnouncementId === announcement.id ? announcement.id : null)} style={{ background: '#6366f1', color: '#fff', border: 'none', borderRadius: 8, padding: '10px 24px', fontWeight: 600, cursor: 'pointer' }}>Add Link</button>
            </div>
          </div>
        </div>
      )}
      <input ref={fileInputRef} type="file" style={{ display: 'none' }} onChange={e => handleFileChange(e, editingAnnouncementId ? editingAnnouncementId : null)} />
      {showStudentSelectModal && (
        <div style={{ position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', background: 'rgba(0,0,0,0.15)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div style={{ background: '#fff', borderRadius: 20, boxShadow: '0 8px 32px rgba(44,62,80,.12)', minWidth: 400, maxWidth: 600, width: '90%', padding: 0 }}>
            <div style={{ borderRadius: 20, background: '#fff', padding: 0 }}>
              <div style={{ border: 'none', padding: '24px 24px 0 24px', fontWeight: 700, fontSize: 18, background: 'transparent', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <span>Add Users</span>
                <button onClick={() => setShowStudentSelectModal(false)} style={{ background: 'none', border: 'none', fontSize: 22, color: '#888', cursor: 'pointer' }}>&times;</button>
              </div>
              <div style={{ padding: '0 24px 24px 24px' }}>
                <div style={{ position: 'relative', width: '100%', marginBottom: 18 }}>
                  <i className="fa fa-search" style={{ position: 'absolute', left: 16, top: '50%', transform: 'translateY(-50%)', color: '#b0b7c3', fontSize: 16, pointerEvents: 'none' }} />
                  <input
                    placeholder="Search class members..."
                    value={studentSearch}
                    onChange={e => setStudentSearch(e.target.value)}
                    style={{ background: '#f7f8fa', borderRadius: 8, border: '1px solid #e9ecef', fontSize: 15, color: '#232b3b', padding: '8px 14px 8px 40px', boxShadow: '0 1px 2px rgba(44,62,80,0.03)', minWidth: 0, width: '100%' }}
                  />
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
                  <span style={{ fontWeight: 600, color: '#222', fontSize: 12 }}>Class Members ({tempSelectedStudents.length})</span>
                  {(() => {
                    const filtered = classroomMembers.filter(s => (!studentSearch || s.name.toLowerCase().includes(studentSearch.toLowerCase())));
                    const allSelected = filtered.length > 0 && filtered.every(s => tempSelectedStudents.includes(s.name));
                    return (
                      <button
                        type="button"
                        style={{ background: 'none', border: 'none', color: '#5e72e4', fontWeight: 500, fontSize: 12, cursor: 'pointer', padding: '1px 6px', margin: 0 }}
                        onClick={() => {
                          if (allSelected) {
                            setTempSelectedStudents(prev => prev.filter(n => !filtered.map(s => s.name).includes(n)));
                          } else {
                            setTempSelectedStudents(prev => Array.from(new Set([...prev, ...filtered.map(s => s.name)])));
                          }
                        }}
                      >
                        {allSelected ? 'Unselect All' : 'Select All'}
                      </button>
                    );
                  })()}
                </div>
                <div style={{ maxHeight: 220, overflowY: 'auto', border: 'none', borderRadius: 12, background: '#f9fafd', padding: '0 8px 0 0', marginBottom: 8 }}>
                  {loadingClassroomMembers ? (
                    <div className="text-center text-muted py-5">Loading class members...</div>
                  ) : classroomMembers.filter(s => (!studentSearch || s.name.toLowerCase().includes(studentSearch.toLowerCase()))).length === 0 ? (
                    <div className="text-center text-muted py-5">No class members found</div>
                  ) : (
                    classroomMembers.filter(s => (!studentSearch || s.name.toLowerCase().includes(studentSearch.toLowerCase()))).map((s) => {
                      const isSelected = tempSelectedStudents.includes(s.name);
                      return (
                        <div
                          key={s.name}
                          style={{ display: 'flex', alignItems: 'center', padding: '6px 10px', borderRadius: 8, marginBottom: 2, cursor: 'pointer', background: isSelected ? '#eaf4fb' : 'transparent' }}
                          onClick={e => {
                            if (e.target.type === 'checkbox') return;
                            if (isSelected) {
                              setTempSelectedStudents(prev => prev.filter(n => n !== s.name));
                            } else {
                              setTempSelectedStudents(prev => [...prev, s.name]);
                            }
                          }}
                        >
                          {(() => {
                            const avatarUrl = getAvatarForUser(s);
                            const bgColor = getAvatarColor(s);
                            const initials = getUserInitials(s);
                            return (
                              <div style={{ width: 28, height: 28, borderRadius: '50%', marginRight: 10, overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center', background: avatarUrl ? '#e9ecef' : bgColor, color: '#fff', fontWeight: 700, border: '1px solid #e9ecef' }}>
                                {avatarUrl ? (
                                  <img
                                    src={avatarUrl}
                                    alt={s.name}
                                    style={{ width: 28, height: 28, borderRadius: '50%', objectFit: 'cover', display: 'block' }}
                                    onError={(e) => {
                                      e.target.style.display = 'none';
                                      if (e.target.nextSibling) e.target.nextSibling.style.display = 'flex';
                                    }}
                                  />
                                ) : null}
                                <span style={{ display: avatarUrl ? 'none' : 'flex', alignItems: 'center', justifyContent: 'center', width: '100%', height: '100%' }}>{initials}</span>
                              </div>
                            );
                          })()}
                          <div style={{ flex: 1 }}>
                            <div style={{ fontWeight: 600, fontSize: 14, color: '#2d3748', textTransform: 'none' }}>{s.name}</div>
                            <div style={{ fontSize: 12, color: '#7b8a9b', fontWeight: 400 }}>
                              {s.email || ''} {s.role === 'teacher' && <span style={{ color: '#6366f1', fontWeight: 600 }}>(Teacher)</span>}
                            </div>
                          </div>
                          <input
                            type="checkbox"
                            checked={isSelected}
                            onChange={e => {
                              if (e.target.checked) {
                                setTempSelectedStudents(prev => [...prev, s.name]);
                              } else {
                                setTempSelectedStudents(prev => prev.filter(n => n !== s.name));
                              }
                            }}
                            style={{ marginLeft: 10, cursor: 'pointer' }}
                            aria-label={`Select ${s.name}`}
                            onClick={e => e.stopPropagation()}
                          />
                        </div>
                      );
                    })
                  )}
                </div>
                {/* Selected students pills in modal */}
                <div style={{ minHeight: 50, display: 'grid', gridTemplateColumns: 'repeat(3, minmax(0, 1fr))', gap: 8, alignItems: tempSelectedStudents.length === 0 ? 'center' : 'flex-start', justifyContent: 'center', background: '#f7f8fa', borderRadius: 8, padding: 8, border: '1px solid #e9ecef', marginTop: 12 }}>
                  {tempSelectedStudents.length === 0 ? (
                    <div style={{ width: '100%', height: 50, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', color: '#b0b7c3', fontSize: 11, minHeight: 30, textAlign: 'center', gridColumn: '1 / -1', margin: '0 auto' }}>
                      <i className="fa fa-user-plus" style={{ marginBottom: 2 }} />
                      <div style={{ fontSize: 11, fontWeight: 500 }}>No students selected</div>
                    </div>
                  ) : (
                    tempSelectedStudents.map(name => {
                      const s = classroomMembers.find(stu => stu.name === name);
                      return s ? (
                        <span key={name} style={{ display: 'flex', alignItems: 'center', background: '#e9ecef', borderRadius: 9, padding: '1px 6px', fontSize: 10, fontWeight: 600, color: '#2d3748', minHeight: 22 }}>
                          {(() => {
                            const avatarUrl = getAvatarForUser(s);
                            const bgColor = getAvatarColor(s);
                            const initials = getUserInitials(s);
                            return (
                              <div style={{ width: 14, height: 14, borderRadius: '50%', marginRight: 4, overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center', background: avatarUrl ? '#e9ecef' : bgColor, color: '#fff', fontWeight: 700, border: '1px solid #fff', fontSize: 8 }}>
                                {avatarUrl ? (
                                  <img
                                    src={avatarUrl}
                                    alt={s.name}
                                    style={{ width: 14, height: 14, borderRadius: '50%', objectFit: 'cover', display: 'block' }}
                                    onError={(e) => {
                                      e.target.style.display = 'none';
                                      if (e.target.nextSibling) e.target.nextSibling.style.display = 'flex';
                                    }}
                                  />
                                ) : null}
                                <span style={{ display: avatarUrl ? 'none' : 'flex', alignItems: 'center', justifyContent: 'center', width: '100%', height: '100%' }}>{initials}</span>
                              </div>
                            );
                          })()}
                          <span style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start', marginRight: 5, lineHeight: 1.1 }}>
                            <span style={{ fontWeight: 600, fontSize: 10, color: '#2d3748', textTransform: 'none' }}>{s.name}</span>
                            <span style={{ color: '#7b8a9b', fontWeight: 400, fontSize: 9 }}>
                              {s.email || ''} {s.role === 'teacher' && <span style={{ color: '#6366f1', fontWeight: 600, fontSize: 8 }}>(Teacher)</span>}
                            </span>
                          </span>
                          <span style={{ flex: 1 }} />
                          <i
                            className="fa fa-times-circle"
                            style={{ marginLeft: 2, cursor: 'pointer', color: '#7b8a9b', fontSize: 11 }}
                            onClick={e => { e.stopPropagation(); setTempSelectedStudents(prev => prev.filter(n => n !== name)); }}
                          />
                        </span>
                      ) : null;
                    })
                  )}
                </div>
                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8, marginTop: 18 }}>
                  <button onClick={() => setShowStudentSelectModal(false)} style={{ background: '#f7fafd', color: '#222', border: 'none', borderRadius: 8, padding: '10px 24px', fontWeight: 500, cursor: 'pointer' }}>Cancel</button>
                  <button onClick={() => { setSelectedAnnouncementStudents(tempSelectedStudents); setShowStudentSelectModal(false); }} style={{ background: '#6366f1', color: '#fff', border: 'none', borderRadius: 8, padding: '10px 24px', fontWeight: 600, cursor: 'pointer' }}>Confirm</button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
      {showScheduleModal && (
        <div style={{ position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', background: 'rgba(0,0,0,0.15)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div style={{ background: '#fff', borderRadius: 18, boxShadow: '0 4px 32px #324cdd22', padding: '2rem', minWidth: 340, maxWidth: 400 }}>
            <div style={{ fontWeight: 700, fontSize: 18, marginBottom: 18 }}>Schedule Announcement</div>
            <div style={{ fontWeight: 600, marginBottom: 8 }}>Select date and time</div>
            <input type="date" value={scheduleDate} onChange={e => setScheduleDate(e.target.value)} style={{ width: '100%', borderRadius: 8, border: '1px solid #e0e0e0', padding: '12px', marginBottom: 12 }} />
            <input type="time" value={scheduleTime} onChange={e => setScheduleTime(e.target.value)} style={{ width: '100%', borderRadius: 8, border: '1px solid #e0e0e0', padding: '12px', marginBottom: 24 }} />
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 12 }}>
              <button onClick={() => setShowScheduleModal(false)} style={{ background: '#f7fafd', color: '#222', border: 'none', borderRadius: 8, padding: '10px 24px', fontWeight: 500, cursor: 'pointer' }}>Cancel</button>
              <button
                onClick={() => {
                  if (!studentAnnouncement.trim()) return;
                  if (!scheduleDate || !scheduleTime) return;
                  const dateTime = new Date(`${scheduleDate}T${scheduleTime}`);
                  const newAnn = {
                    id: Date.now(),
                    title: announcementTitle,
                    content: studentAnnouncement,
                    author: loggedInName,
                    date: dateTime.toISOString(),
                    isPinned: false,
                    reactions: { like: 0, likedBy: [] },
                    comments: [],
                    allowComments: allowComments,
                    attachments: attachments
                  };
                  setScheduledAnnouncements([newAnn, ...scheduledAnnouncements]);
                  setStudentAnnouncement("");
                  setAnnouncementTitle("");
                  setAllowComments(true);
                  setFormExpanded(false);
                  setAttachments([]);
                  setShowScheduleModal(false);
                  setScheduleDate("");
                  setScheduleTime("");
                }}
                style={{ background: '#6366f1', color: '#fff', border: 'none', borderRadius: 8, padding: '10px 24px', fontWeight: 600, cursor: 'pointer' }}
              >
                Schedule
              </button>
            </div>
          </div>
        </div>
      )}
      {/* Attachment Preview Modal */}
      <style>{`
        /* Widen preview modal */
        .modal-dialog.preview-modal-xl { max-width: 95vw; }
        @media (min-width: 576px) { .modal-dialog.preview-modal-xl { max-width: 90vw; } }
      `}</style>
      <Modal isOpen={previewModalOpen} toggle={() => setPreviewModalOpen(false)} centered size="xl" modalClassName="preview-modal-xl">
        <ModalHeader toggle={() => setPreviewModalOpen(false)}>
          {previewAttachment ? (previewAttachment.name || 'File Preview') : 'Preview'}
        </ModalHeader>
      <ModalBody>
        {previewAttachment ? (
          <div>
            {(() => {
              const file = previewAttachment.file;
              const hasFile = !!file;
              const fileType = (file && file.type) || '';
              const name = previewAttachment.name || previewAttachment.url || '';
              const lower = name.toLowerCase();
              const urlFromFile = hasFile ? (typeof file === 'string' ? file : URL.createObjectURL(file)) : '';
              const url = hasFile ? urlFromFile : (previewAttachment.url || '');

              if (fileType.startsWith('image/') || /(\.png|\.jpe?g|\.gif|\.webp|\.bmp|\.svg)(\?.*)?$/.test(lower)) {
                return <img src={url} alt={name} style={{ maxWidth: '100%', maxHeight: '500px', objectFit: 'contain' }} />;
              }
              if (fileType.startsWith('video/') || /(\.mp4)(\?.*)?$/.test(lower)) {
                return (
                  <video controls style={{ width: '100%', maxHeight: '600px', borderRadius: '8px' }}>
                    <source src={url} type={fileType || 'video/mp4'} />
                    Your browser does not support the video tag.
                  </video>
                );
              }
              if (fileType.startsWith('audio/') || /(\.mp3|\.mpeg)(\?.*)?$/.test(lower)) {
                return (
                  <div 
                    id="mp3-container"
                    style={{ 
                      display: 'flex', 
                      flexDirection: 'column', 
                      alignItems: 'center', 
                      padding: '30px 15px',
                      background: mp3Backgrounds[mp3BgIndex],
                      borderRadius: '16px',
                      color: 'white',
                      position: 'relative',
                      overflow: 'hidden',
                      transition: 'all 2s cubic-bezier(0.4,0,0.2,1)',
                      boxShadow: isPlaying 
                        ? '0 20px 60px rgba(0,0,0,0.4), 0 0 30px rgba(255,255,255,0.1)' 
                        : '0 8px 32px rgba(0,0,0,0.2)',
                      maxHeight: '600px'
                    }}
                  >
                    {/* Enhanced Animated Disk - scales up and rotates faster when playing */}
                    <div 
                      id="mp3-disk"
                      style={{
                        width: '120px',
                        height: '120px',
                        borderRadius: '50%',
                        background: 'conic-gradient(from 0deg, #333 0deg, #666 90deg, #333 180deg, #666 270deg, #333 360deg)',
                        border: '6px solid #fff',
                        boxShadow: isPlaying 
                          ? '0 8px 32px rgba(0,0,0,0.5), 0 0 15px rgba(255,255,255,0.2)' 
                          : '0 6px 24px rgba(0,0,0,0.3)',
                        marginBottom: '20px',
                        position: 'relative',
                        transition: 'all 0.3s ease',
                        zIndex: 2,
                        transform: isPlaying ? 'scale(1.1)' : 'scale(1)',
                        animation: isPlaying ? 'rotate 2s linear infinite' : 'none'
                      }}
                    >
                      {/* Disk Center */}
                      <div style={{
                        position: 'absolute',
                        top: '50%',
                        left: '50%',
                        transform: 'translate(-50%, -50%)',
                        width: '24px',
                        height: '24px',
                        borderRadius: '50%',
                        background: '#fff',
                        border: '2px solid #333',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                      }}>
                        <div style={{
                          width: '8px',
                          height: '8px',
                          borderRadius: '50%',
                          background: '#333'
                        }} />
                      </div>
                      {/* Disk Grooves */}
                      <div style={{
                        position: 'absolute',
                        top: '50%',
                        left: '50%',
                        transform: 'translate(-50%, -50%)',
                        width: '96px',
                        height: '96px',
                        borderRadius: '50%',
                        background: 'repeating-conic-gradient(from 0deg, transparent 0deg, transparent 2deg, rgba(255,255,255,0.1) 2deg, rgba(255,255,255,0.1) 4deg)'
                      }} />
                    </div>

                    {/* Audio Visualizer - 20 animated bars that respond to music playback */}
                    <div id="audio-visualizer" style={{
                      display: 'flex',
                      alignItems: 'flex-end',
                      gap: '2px',
                      height: '40px',
                      marginBottom: '15px',
                      opacity: isPlaying ? 1 : 0,
                      transition: 'opacity 0.3s ease',
                      zIndex: 2
                    }}>
                      {[...Array(20)].map((_, i) => (
                        <div
                          key={i}
                          className="visualizer-bar"
                          style={{
                            width: '3px',
                            background: 'rgba(255, 255, 255, 0.8)',
                            borderRadius: '1.5px',
                            height: '8px',
                            transition: 'height 0.1s ease',
                            boxShadow: '0 0 6px 1px rgba(255,255,255,0.3)'
                          }}
                        />
                      ))}
                    </div>

                    {/* Audio Player */}
                    <div style={{ width: '100%', maxWidth: '500px', zIndex: 2, position: 'relative' }}>
                      <audio 
                        ref={audioRef}
                        id="mp3-player"
                        controls 
                        src={audioUrl || ''}
                        style={{ 
                          width: '100%',
                          borderRadius: '20px'
                        }}
                      >
                        <source src={audioUrl || ''} type={
                          previewAttachment?.file?.type || 
                          (previewAttachment?.name?.toLowerCase().endsWith('.mp3') ? 'audio/mp3' :
                           previewAttachment?.name?.toLowerCase().endsWith('.wav') ? 'audio/wav' :
                           previewAttachment?.name?.toLowerCase().endsWith('.ogg') ? 'audio/ogg' :
                           previewAttachment?.name?.toLowerCase().endsWith('.aac') ? 'audio/aac' :
                           previewAttachment?.name?.toLowerCase().endsWith('.flac') ? 'audio/flac' :
                           'audio/mp3')
                        } />
                        Your browser does not support the audio tag.
                      </audio>
                    </div>

                    {/* File Info */}
                    <div style={{ 
                      marginTop: '6px',
                      textAlign: 'center',
                      background: 'rgba(255, 255, 255, 0.7)',
                      backdropFilter: 'blur(10px)',
                      padding: '8px 12px',
                      borderRadius: '12px',
                      boxShadow: '0 6px 24px rgba(0,0,0,0.1)',
                      width: '100%',
                      maxWidth: '500px',
                      fontWeight: 500,
                      position: 'relative',
                      zIndex: 2,
                      transition: 'all 0.3s ease'
                    }}>
                      {/* Enhanced Music Note SVG */}
                      <div style={{ margin: 0, padding: 0, height: '24px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <svg width="24" height="24" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ transition: 'all 2s cubic-bezier(0.4,0,0.2,1)' }}>
                          <circle cx="24" cy="24" r="24" fill={`url(#music-gradient-${mp3BgIndex})`} style={{ transition: 'fill 2s cubic-bezier(0.4,0,0.2,1)' }} />
                          <defs>
                            {mp3Backgrounds.map((gradient, idx) => (
                              <linearGradient id={`music-gradient-${idx}`} key={idx} x1="0" y1="0" x2="48" y2="48" gradientUnits="userSpaceOnUse">
                                {/* Parse the gradient string to extract colors */}
                                {(() => {
                                  // Extract color stops from the gradient string
                                  const stops = gradient.match(/#([0-9a-fA-F]{6,8})/g);
                                  if (!stops) return null;
                                  return stops.map((color, i) => (
                                    <stop key={i} offset={i / (stops.length - 1)} stopColor={color} />
                                  ));
                                })()}
                              </linearGradient>
                            ))}
                          </defs>
                          <path d="M32 12V30.5C32 33.5376 29.5376 36 26.5 36C23.4624 36 21 33.5376 21 30.5C21 27.4624 23.4624 25 26.5 25C27.8807 25 29.0784 25.3358 29.5858 25.8787C29.8358 26.1287 30 26.4886 30 26.8787V16H18V30.5C18 33.5376 15.5376 36 12.5 36C9.46243 36 7 33.5376 7 30.5C7 27.4624 9.46243 25 12.5 25C13.8807 25 15.0784 25.3358 15.5858 25.8787C15.8358 26.1287 16 26.4886 16 26.8787V12C16 11.4477 16.4477 11 17 11H31C31.5523 11 32 11.4477 32 12Z" fill="white"/>
                        </svg>
                      </div>
                      <div style={{ fontWeight: '600', fontSize: '16px', marginBottom: '3px', color: '#2c3e50' }}>
                        {previewAttachment.name}
                      </div>
                      <div style={{ fontSize: '13px', opacity: '0.8', color: '#7f8c8d' }}>
                        MP3 Audio File
                      </div>
                    </div>

                    {/* Enhanced CSS Animations */}
                    <style>
                      {`
                        @keyframes rotate {
                          from { transform: rotate(0deg); }
                          to { transform: rotate(360deg); }
                        }
                        
                        @keyframes float {
                          0%, 100% { transform: translateY(0px) rotate(0deg); opacity: 0.6; }
                          50% { transform: translateY(-20px) rotate(180deg); opacity: 1; }
                        }
                        
                        @keyframes pulse {
                          0%, 100% { transform: scale(1); }
                          50% { transform: scale(1.05); }
                        }
                        
                        #mp3-disk:hover {
                          transform: scale(1.1);
                          box-shadow: 0 12px 48px rgba(0,0,0,0.4);
                        }
                        
                        .particle {
                          animation-delay: calc(var(--i) * -0.5s);
                        }
                        
                        .visualizer-bar {
                          animation: visualizerPulse 0.5s ease-in-out infinite alternate;
                        }
                        
                        @keyframes visualizerPulse {
                          from { height: 10px; }
                          to { height: 40px; }
                        }
                        
                        /* Enhanced hover effects */
                        #mp3-disk:hover {
                          transform: scale(1.1);
                          box-shadow: 0 12px 48px rgba(0,0,0,0.4);
                        }
                        
                        /* Smooth transitions for all interactive elements */
                        * {
                          transition: all 0.3s ease;
                        }
                      `}
                    </style>

                    {/* Animated Floating Particles - 20 particles that appear when music plays */}
                    <div id="particles-container" style={{
                      position: 'absolute',
                      top: 0,
                      left: 0,
                      width: '100%',
                      height: '100%',
                      pointerEvents: 'none',
                      zIndex: 1,
                      opacity: isPlaying ? 1 : 0,
                      transition: 'opacity 0.5s ease',
                    }}>
                      {[...Array(20)].map((_, i) => (
                        <div
                          key={i}
                          className="particle"
                          style={{
                            position: 'absolute',
                            width: `${Math.random() * 8 + 4}px`,
                            height: `${Math.random() * 8 + 4}px`,
                            background: 'rgba(255, 255, 255, 0.7)',
                            borderRadius: '50%',
                            left: `${Math.random() * 90 + 5}%`,
                            top: `${Math.random() * 80 + 10}%`,
                            boxShadow: '0 0 12px 2px rgba(255,255,255,0.3)',
                            animation: isPlaying ? `float ${3 + Math.random() * 4}s ease-in-out infinite` : 'none',
                            animationDelay: `${Math.random() * 2}s`,
                            transform: `rotate(${Math.random() * 360}deg)`,
                          }}
                        />
                      ))}
                    </div>

                    {/* Subtle Animated Wave at Bottom */}
                    <div style={{
                      position: 'absolute',
                      left: 0,
                      bottom: 0,
                      width: '100%',
                      height: '80px',
                      zIndex: 1,
                      pointerEvents: 'none',
                      overflow: 'hidden',
                    }}>
                      <svg width="100%" height="100%" viewBox="0 0 1440 80" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ display: 'block' }}>
                        <path ref={wavePathRef} d="M0,40 Q360,80 720,40 T1440,40 V80 H0 Z" fill="rgba(255,255,255,0.10)" />
                      </svg>
                    </div>
                  </div>
                );
              }
              if (fileType === 'application/pdf' || /(\.pdf)(\?.*)?$/.test(lower)) {
                return <iframe src={url} style={{ width: '100%', height: '600px', border: 'none', borderRadius: '8px' }} title={name || 'PDF'} />;
              }
              if (previewText) {
                return <div style={{ background: '#f8f9fa', padding: '20px', borderRadius: '8px', fontFamily: 'monospace', fontSize: '14px', whiteSpace: 'pre-wrap', maxHeight: '500px', overflowY: 'auto' }}>{previewText}</div>;
              }
              return (
                <div style={{ textAlign: 'center', padding: '40px' }}>
                  <i className="ni ni-single-copy-04" style={{ fontSize: '48px', color: '#ccc', marginBottom: '16px' }} />
                  <p style={{ color: '#666' }}>Preview not available for this file type.</p>
                  {hasFile && (
                    <Button color="primary" onClick={() => {
                      const a = document.createElement('a');
                      a.href = url;
                      a.download = name;
                      a.click();
                    }}>
                      Download File
                    </Button>
                  )}
                </div>
              );
            })()}
          </div>
        ) : null}
              </ModalBody>
      </Modal>

      {/* Student Stream Post Schedule Modal */}

    </div>
  );
};

export default ClassroomDetailStudent; 