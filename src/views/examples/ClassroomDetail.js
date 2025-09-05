import React, { useRef, useState, useEffect } from "react"; // Force rebuild
import { useNotifications } from "../../contexts/NotificationContext";
import Select, { components } from 'react-select';
import { useParams, useNavigate, useLocation } from "react-router-dom";
import { Html5Qrcode } from "html5-qrcode";
import { QRCodeSVG } from "qrcode.react";
import {
  Card,
  CardBody,
  Row,
  Col,
  Nav,
  NavItem,
  NavLink,
  TabContent,
  TabPane,
  Modal,
  ModalHeader,
  ModalBody,
  Button,
  Tooltip,
  Badge,
  Table,
  Input,
  Form,
  FormGroup,
  Label,
  ListGroup,
  ListGroupItem,
  Alert,
  ModalFooter,
  Dropdown,
  DropdownToggle,
  DropdownMenu,
  DropdownItem,
  UncontrolledDropdown,
  InputGroup,
  InputGroupText,
  ButtonGroup,
  Collapse,
  Toast,
  ToastHeader,
  ToastBody
} from "reactstrap";
import classnames from "classnames";
import Header from "../../components/Headers/Header";
import "./Classroom.css";
import apiService from "../../services/api";
import { FaEllipsisV, FaClipboardList, FaQuestionCircle, FaBook, FaRedo, FaFolder, FaPlus, FaPaperclip, FaSmile, FaRegThumbsUp, FaThumbsUp, FaUserPlus, FaRegFileAlt, FaCheck, FaTimes, FaSearch, FaRegCalendarAlt, FaTrash, FaCamera } from 'react-icons/fa';
import userDefault from '../../assets/img/theme/user-default.svg';

import axios from 'axios';
import * as XLSX from 'xlsx';
import { getProfilePictureUrl, getUserInitials, getAvatarColor } from '../../utils/profilePictureUtils';

//stream new



const themes = [
  { name: "Blue Gradient", value: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)", type: "Color Theme" },
  { name: "Purple Gradient", value: "linear-gradient(135deg, #f093fb 0%, #f5576c 100%)", type: "Color Theme" },
  { name: "Green Gradient", value: "linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)", type: "Color Theme" },
  { name: "Orange Gradient", value: "linear-gradient(135deg, #fa709a 0%, #fee140 100%)", type: "Color Theme" },
  { name: "Pink Gradient", value: "linear-gradient(135deg, #ff9a9e 0%, #fecfef 100%)", type: "Color Theme" },
  { name: "Aqua Gradient", value: "linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)", type: "Color Theme" },
  { name: "Sunset", value: "linear-gradient(135deg, #ffecd2 0%, #fcb69f 100%)", type: "Color Theme" },
  { name: "Deep Blue", value: "linear-gradient(135deg, #232526 0%, #414345 100%)", type: "Color Theme" },
  // SVG Themes
  { name: "Classroom SVG", value: "url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAwIiBoZWlnaHQ9IjEyMCIgdmlld0JveD0iMCAwIDQwMCAxMjAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PHJlY3QgeD0iMzAiIHk9IjMwIiB3aWR0aD0iMTIwIiBoZWlnaHQ9IjUwIiByeD0iOCIgZmlsbD0iIzQ0NGI1YSIvPjxyZWN0IHg9IjUwIiB5PSI4MCIgd2lkdGg9IjgwIiBoZWlnaHQ9IjEyIiByeD0iMyIgZmlsbD0iI2U5NzZkMiIvPjxyZWN0IHg9IjE3MCIgeT0iNjAiIHdpZHRoPSI0MCIgaGVpZ2h0PSIyMCIgcng9IjQiIGZpbGw9IiMzOWY5ZjEiLz48cmVjdCB4PSIyMzAiIHk9IjgwIiB3aWR0aD0iNTAiIGhlaWdodD0iMTAiIHJ4PSIyIiBmaWxsPSIjMTk3NmQyIi8+PHJlY3QgeD0iMjQwIiB5PSI2MCIgd2lkdGg9IjMwIiBoZWlnaHQ9IjE1IiByeD0iMiIgZmlsbD0iI2Y5ZGM1YyIvPjxyZWN0IHg9IjMyMCIgeT0iNDAiIHdpZHRoPSI1MCIgaGVpZ2h0PSIzNSIgcng9IjUiIGZpbGw9IiM0NDRiNWEiLz48cmVjdCB4PSIzMzAiIHk9IjcwIiB3aWR0aD0iMzAiIGhlaWdodD0iNyIgcng9IjIiIGZpbGw9IiMxOTc2ZDIiLz48cmVjdCB4PSIzNDAiIHk9IjUwIiB3aWR0aD0iMjAiIGhlaWdodD0iMTAiIHJ4PSIyIiBmaWxsPSIjZjlkYzVjIi8+PC9zdmc+')", type: "SVG Theme" },
  { name: "Books SVG", value: "url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAwIiBoZWlnaHQ9IjEyMCIgdmlld0JveD0iMCAwIDQwMCAxMjAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PHJlY3QgeD0iNjAiIHk9IjYwIiB3aWR0aD0iMzAiIGhlaWdodD0iNDAiIHJ4PSI2IiBmaWxsPSIjNGNhZjUwIi8+PHJlY3QgeD0iMTAwIiB5PSI3MCIgd2lkdGg9IjIwIiBoZWlnaHQ9IjMwIiByeD0iNCIgZmlsbD0iI2Y5ZGM1YyIvPjxyZWN0IHg9IjE0MCIgeT0iODAiIHdpZHRoPSI0MCIgaGVpZ2h0PSIyMCIgcng9IjQiIGZpbGw9IiMxOTc2ZDIiLz48L3N2Zz4=')", type: "SVG Theme" },
  // Existing image/photo themes
  { name: "Night Sky", value: "url('https://images.unsplash.com/photo-1465101046530-73398c7f28ca?auto=format&fit=crop&w=600&q=80')", type: "Photo" },
  { name: "Books Image", value: "url('https://images.unsplash.com/photo-1519681393784-d120267933ba?auto=format&fit=crop&w=600&q=80')", type: "Photo" },
  { name: "Mountains", value: "url('https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=600&q=80')", type: "Photo" },
  { name: "Classroom", value: "url('https://images.unsplash.com/photo-1513258496099-48168024aec0?auto=format&fit=crop&w=600&q=80')", type: "Photo" },
  { name: "Abstract", value: "url('https://images.unsplash.com/photo-1465101178521-c1a9136a3b99?auto=format&fit=crop&w=600&q=80')", type: "Photo" },
  { name: "Notebook", value: "url('https://images.unsplash.com/photo-1515378791036-0648a3ef77b2?auto=format&fit=crop&w=600&q=80')", type: "Photo" }
];

// Sample data for tabs
const sampleAnnouncements = [
  {
    id: 1,
    title: "Welcome to the new semester!",
    content: "I'm excited to start this journey with all of you. Let's make this semester productive and engaging.",
    author: "Prof. Smith",
    date: "2024-01-15",
    isPinned: true,
    reactions: { like: 2, likedBy: ["Prof. Smith", "John Doe"] },
    comments: [
      { text: "Looking forward to this semester!", author: "Prof. Smith", date: "2024-01-15T10:30:00.000Z" },
      { text: "Thank you for the warm welcome!", author: "John Doe", date: "2024-01-15T11:15:00.000Z" }
    ]
  },
  {
    id: 2,
    title: "Assignment #1 Due Date Extended",
    content: "Due to technical difficulties, the deadline for Assignment #1 has been extended to Friday, January 20th.",
    author: "Prof. Smith",
    date: "2024-01-14",
    isPinned: false,
    reactions: { like: 0, likedBy: [] },
    comments: [
      { text: "Great news! I was having trouble with the submission system.", author: "Jane Smith", date: "2024-01-14T14:20:00.000Z" }
    ]
  },
  {
    id: 3,
    title: "Class Schedule Update",
    content: "Starting next week, we'll have an additional lab session every Wednesday from 2-4 PM.",
    author: "Prof. Smith",
    date: "2024-01-13",
    isPinned: false,
    reactions: { like: 1, likedBy: ["Jane Smith"] },
    comments: [
      { text: "This is perfect for getting extra practice!", author: "Prof. Smith", date: "2024-01-13T16:45:00.000Z" }
    ]
  }
];

const sampleAssignments = [
  {
    id: 1,
    title: "Assignment #1: Basic Concepts",
    type: "Assignment",
    dueDate: "2024-01-20",
    points: 100,
    status: "active",
    comments: [
      { text: "Can you clarify question 3?", author: "John Doe", date: "2024-01-12T15:30:00.000Z" },
      { text: "Sure! Question 3 is about applying the concepts we discussed in class.", author: "Prof. Smith", date: "2024-01-12T16:00:00.000Z" }
    ],
    date: "2024-01-10T09:00:00.000Z",
    details: "Complete the basic concepts worksheet and upload your answers."
  },
  {
    id: 2,
    title: "Quiz #1: Introduction",
    type: "Quiz",
    dueDate: "2024-01-25",
    points: 50,
    status: "active",
    comments: [
      { text: "How long will the quiz take?", author: "Jane Smith", date: "2024-01-16T12:15:00.000Z" }
    ],
    date: "2024-01-15T10:00:00.000Z",
    details: "Short quiz covering the introduction chapter."
  },
  {
    id: 3,
    title: "Project Proposal",
    type: "Project",
    dueDate: "2024-02-01",
    points: 200,
    status: "active",
    comments: [
      { text: "I have an idea for my project. Can I discuss it with you?", author: "Mike Johnson", date: "2024-01-19T14:20:00.000Z" },
      { text: "Absolutely! Let's schedule a meeting.", author: "Prof. Smith", date: "2024-01-19T15:00:00.000Z" }
    ],
    date: "2024-01-18T11:00:00.000Z",
    details: "Submit your project proposal for review."
  }
];

const sampleStudents = [
  { id: "2021304995", name: "GERALDINE P. FERRERAS", email: "2021304995@student.edu", role: "Student", joinedDate: "2024-01-10", program: "Bachelor of Science in Information Technology" },
  { id: "2021305973", name: "ANJELA SOFIA G. SARMIENTO", email: "anjela.sarmiento@student.edu", role: "Student", joinedDate: "2024-01-10", program: "Bachelor of Science in Information Technology" },
  { id: "2021305974", name: "JOHN MICHAEL A. DELA CRUZ", email: "john.delacruz@student.edu", role: "Student", joinedDate: "2024-01-10", program: "Bachelor of Science in Computer Science" },
  { id: "2021305975", name: "MARIA ISABEL B. SANTOS", email: "maria.santos@student.edu", role: "Student", joinedDate: "2024-01-11", program: "Bachelor of Science in Information Technology" },
  { id: "2021305976", name: "CARLOS ANTONIO C. REYES", email: "carlos.reyes@student.edu", role: "Student", joinedDate: "2024-01-12", program: "Bachelor of Science in Computer Science" },
  { id: "2021305977", name: "ANA LUCIA D. GONZALES", email: "ana.gonzales@student.edu", role: "Student", joinedDate: "2024-01-13", program: "Bachelor of Science in Information Technology" },
  { id: "2021305978", name: "ROBERTO JOSE E. TORRES", email: "roberto.torres@student.edu", role: "Student", joinedDate: "2024-01-14", program: "Bachelor of Science in Computer Science" },
  { id: "2021305979", name: "ISABEL CRISTINA F. MORALES", email: "isabel.morales@student.edu", role: "Student", joinedDate: "2024-01-15", program: "Bachelor of Science in Information Technology" },
  { id: "2021305980", name: "MIGUEL ANGEL G. HERRERA", email: "miguel.herrera@student.edu", role: "Student", joinedDate: "2024-01-16", program: "Bachelor of Science in Computer Science" },
  { id: "2021305981", name: "SOFIA ELENA H. VARGAS", email: "sofia.vargas@student.edu", role: "Student", joinedDate: "2024-01-17", program: "Bachelor of Science in Information Technology" },
  { id: "2021305982", name: "ALEJANDRO RAFAEL I. JIMENEZ", email: "alejandro.jimenez@student.edu", role: "Student", joinedDate: "2024-01-18", program: "Bachelor of Science in Computer Science" },
  { id: "2021305983", name: "VALENTINA MARIA J. RODRIGUEZ", email: "valentina.rodriguez@student.edu", role: "Student", joinedDate: "2024-01-19", program: "Bachelor of Science in Information Technology" },
  { id: "2021305984", name: "DIEGO SEBASTIAN K. LOPEZ", email: "diego.lopez@student.edu", role: "Student", joinedDate: "2024-01-20", program: "Bachelor of Science in Computer Science" },
  { id: "2021305985", name: "CAMILA ALEJANDRA L. MARTINEZ", email: "camila.martinez@student.edu", role: "Student", joinedDate: "2024-01-21", program: "Bachelor of Science in Information Technology" },
  { id: "2021305986", name: "FERNANDO LUIS M. GARCIA", email: "fernando.garcia@student.edu", role: "Student", joinedDate: "2024-01-22", program: "Bachelor of Science in Computer Science" },
  { id: "2021305987", name: "GABRIELA PAULA N. PEREZ", email: "gabriela.perez@student.edu", role: "Student", joinedDate: "2024-01-23", program: "Bachelor of Science in Information Technology" },
  { id: "2021305988", name: "ADRIAN CARLOS O. GONZALEZ", email: "adrian.gonzalez@student.edu", role: "Student", joinedDate: "2024-01-24", program: "Bachelor of Science in Computer Science" },
  { id: "2021305989", name: "NATALIA ANA P. RAMIREZ", email: "natalia.ramirez@student.edu", role: "Student", joinedDate: "2024-01-25", program: "Bachelor of Science in Information Technology" },
  { id: "2021305990", name: "JAVIER EDUARDO Q. FLORES", email: "javier.flores@student.edu", role: "Student", joinedDate: "2024-01-26", program: "Bachelor of Science in Computer Science" },
  { id: "2021305991", name: "DANIELA MARIA R. CRUZ", email: "daniela.cruz@student.edu", role: "Student", joinedDate: "2024-01-27", program: "Bachelor of Science in Information Technology" },
  { id: "2021305992", name: "LUIS FERNANDO S. ORTIZ", email: "luis.ortiz@student.edu", role: "Student", joinedDate: "2024-01-28", program: "Bachelor of Science in Computer Science" },
  { id: "2021305993", name: "PAULA ANDREA T. SILVA", email: "paula.silva@student.edu", role: "Student", joinedDate: "2024-01-29", program: "Bachelor of Science in Information Technology" },
  { id: "2021305994", name: "RICARDO MANUEL U. VEGA", email: "ricardo.vega@student.edu", role: "Student", joinedDate: "2024-01-30", program: "Bachelor of Science in Computer Science" },
  { id: "2024000002", name: "STUDENT NAME", email: "student@student.edu", role: "Student", joinedDate: "2024-01-31", program: "Bachelor of Science in Information Technology" }
];

const sampleGrades = [
  { studentId: 1, studentName: "John Doe", assignment1: 85, quiz1: 90, project1: 88, average: 87.7 },
  { studentId: 2, studentName: "Jane Smith", assignment1: 92, quiz1: 88, project1: 95, average: 91.7 },
  { studentId: 3, studentName: "Mike Johnson", assignment1: 78, quiz1: 85, project1: 82, average: 81.7 },
  { studentId: 4, studentName: "Sarah Wilson", assignment1: 95, quiz1: 92, project1: 90, average: 92.3 },
  { studentId: 5, studentName: "David Brown", assignment1: 88, quiz1: 90, project1: 87, average: 88.3 }
];

const avatarUrls = [
  "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face",
  "https://images.unsplash.com/photo-1494790108755-2616b612b786?w=150&h=150&fit=crop&crop=face",
  "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&h=150&fit=crop&crop=face",
  "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face",
  "https://images.unsplash.com/photo-1519345182560-3f2917c472ef?w=150&h=150&fit=crop&crop=face",
  "https://images.unsplash.com/photo-1552058544-f2b08422138a?w=150&h=150&fit=crop&crop=face"
];

const getRandomAvatar = (userId) => {
  if (userId === undefined || userId === null) return userDefault;
  const idString = typeof userId === 'string' || typeof userId === 'number' ? userId.toString() : '0';
  const index = Math.abs(idString.split('').reduce((a, b) => a + b.charCodeAt(0), 0)) % avatarUrls.length;
  return avatarUrls[index];
};

const getAvatarForUser = (user) => {
  if (!user) return userDefault;
  
  // Check for profile picture and construct full URL
  if (user.profile_pic && user.profile_pic !== userDefault) {
    // If it's already a full URL, return as is
    if (user.profile_pic.startsWith('http')) {
      return user.profile_pic;
    }
    // Construct full URL for profile picture - use the correct path structure
    return `${process.env.REACT_APP_API_BASE_URL || 'https://scms-backend.up.railway.app'}/${user.profile_pic}`;
  }
  
  // Check for profile_image as alternative field name
  if (user.profile_image && user.profile_image !== userDefault) {
    if (user.profile_image.startsWith('http')) {
      return user.profile_image;
    }
    return `${process.env.REACT_APP_API_BASE_URL || 'https://scms-backend.up.railway.app'}/${user.profile_image}`;
  }
  
  if (user.id) {
    return getRandomAvatar(user.id);
  }
  // If no ID but we have a name, use the name to generate a consistent avatar
  if (user.name) {
    return getRandomAvatar(user.name);
  }
  return userDefault;
};

// Helper function to generate Student ID (same as People tab)
const generateStudentId = (student) => {
  const year = student.joinedDate ? new Date(student.joinedDate).getFullYear() : '0000';
  const idNum = typeof student.id === 'number' ? student.id : parseInt(student.id, 10);
  const randomPart = idNum ? String(idNum).padStart(6, '0') : '000000';
  return `${year}${randomPart}`;
};

const findUserByName = (name) => {
  if (!name) return null;
  const allUsers = [...sampleStudents, { id: 'teacher', name: 'Prof. Smith', role: 'teacher' }];
  return allUsers.find(u => u.name?.toLowerCase() === name.toLowerCase() || u.full_name?.toLowerCase() === name.toLowerCase());
};

// Helper to get file type, icon, and preview
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
  if (ext === 'mp4') return { preview: <svg width="32" height="40" viewBox="0 0 32 40" fill="none" xmlns="http://www.w3.org/2000/svg"><rect width="32" height="40" rx="6" fill="#fff" stroke="#8e24aa" strokeWidth="2"/><polygon points="13,14 25,20 13,26" fill="#8e24aa"/><text x="16" y="36" textAnchor="middle" fontSize="10" fill="#8e24aa" fontWeight="bold">MP4</text></svg>, type: 'MP4', color: '#8e24aa' };
  if (ext === 'mp3') return { preview: <svg width="32" height="40" viewBox="0 0 32 40" fill="none" xmlns="http://www.w3.org/2000/svg"><rect width="32" height="40" rx="6" fill="#fff" stroke="#43a047" strokeWidth="2"/><circle cx="16" cy="20" r="7" fill="#43a047"/><rect x="22" y="13" width="3" height="14" rx="1.5" fill="#43a047"/><text x="16" y="36" textAnchor="middle" fontSize="10" fill="#43a047" fontWeight="bold">MP3</text></svg>, type: 'MP3', color: '#43a047' };
  if (ext === 'pdf') return { preview: <svg width="32" height="40" viewBox="0 0 32 40" fill="none" xmlns="http://www.w3.org/2000/svg"><rect width="32" height="40" rx="6" fill="#fff" stroke="#F44336" strokeWidth="2"/><path d="M8 8h16v24H8z" fill="#fff"/><text x="16" y="28" textAnchor="middle" fontSize="10" fill="#F44336" fontWeight="bold">PDF</text></svg>, type: 'PDF', color: '#F44336' };
  return { preview: <svg width="32" height="40" viewBox="0 0 32 40" fill="none" xmlns="http://www.w3.org/2000/svg"><rect width="32" height="40" rx="6" fill="#fff" stroke="#90A4AE" strokeWidth="2"/><path d="M8 8h16v24H8z" fill="#fff"/><text x="16" y="28" textAnchor="middle" fontSize="10" fill="#90A4AE" fontWeight="bold">FILE</text></svg>, type: ext.toUpperCase(), color: '#90A4AE' };
};

// Add this above the ClassroomDetail component definition
const useClickOutside = (ref, handler, when) => {
  useEffect(() => {
    if (!when) return;
    const listener = (event) => {
      if (!ref.current || ref.current.contains(event.target)) return;
      handler(event);
    };
    document.addEventListener('mousedown', listener);
    return () => document.removeEventListener('mousedown', listener);
  }, [ref, handler, when]);
};

// Utility: Format date as relative time (like Facebook)
function formatRelativeTime(dateString) {
  if (!dateString) return '';
  const now = new Date();
  const date = new Date(dateString);
  const diff = (now - date) / 1000; // seconds
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
  // Otherwise, show full date (e.g., June 24, 2025)
  return date.toLocaleDateString(undefined, {
    year: 'numeric', month: 'long', day: 'numeric'
  });
}

// Microsoft Office file detection and preview helpers
const isMicrosoftFile = (fileName) => {
  if (!fileName) return false;
  const ext = fileName.split('.').pop().toLowerCase();
  const microsoftExts = [
    // Word
    'doc', 'docx', 'dot', 'dotx', 'docm', 'dotm',
    // Excel
    'xls', 'xlsx', 'xlsm', 'xlsb', 'xlt', 'xltx', 'xltm', 'csv',
    // PowerPoint
    'ppt', 'pptx', 'pps', 'ppsx', 'pptm', 'potx', 'potm', 'ppsm'
  ];
  return microsoftExts.includes(ext);
};

const getMicrosoftFileType = (fileName) => {
  if (!fileName) return 'Office';
  const ext = fileName.split('.').pop().toLowerCase();
  
  // Word files
  if (['doc', 'docx', 'dot', 'dotx', 'docm', 'dotm'].includes(ext)) {
    return 'Word';
  }
  // Excel files
  if (['xls', 'xlsx', 'xlsm', 'xlsb', 'xlt', 'xltx', 'xltm', 'csv'].includes(ext)) {
    return 'Excel';
  }
  // PowerPoint files
  if (['ppt', 'pptx', 'pps', 'ppsx', 'pptm', 'potx', 'potm', 'ppsm'].includes(ext)) {
    return 'PowerPoint';
  }
  
  return 'Office';
};

const openMicrosoftOnline = async (file) => {
  try {
    // Convert file to base64 for Office Online
    const base64 = await fileToBase64(file);
    
    // Create Office Online URL
    const officeOnlineUrl = `https://view.officeapps.live.com/op/embed.aspx?src=${encodeURIComponent(base64)}`;
    
    // Open in new tab
    window.open(officeOnlineUrl, '_blank', 'noopener,noreferrer');
  } catch (error) {
    console.error('Error opening file in Office Online:', error);
    // Fallback to download
    const url = URL.createObjectURL(file);
    const a = document.createElement('a');
    a.href = url;
    a.download = file.name;
    a.click();
    URL.revokeObjectURL(url);
  }
};

const fileToBase64 = (file) => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result);
    reader.onerror = error => reject(error);
  });
};
// Add this function for truncating text
const truncate = (str, n) => (str && str.length > n ? str.substr(0, n - 1) + '...' : str);

const ClassroomDetail = () => {
  const { addNotification } = useNotifications();
  const [currentUserProfile, setCurrentUserProfile] = useState(null);

  // Build absolute URL for profile_pic regardless of API base format
  const buildImageUrlFromProfilePic = (profilePic) => {
    if (!profilePic) return null;
    const apiBase = process.env.REACT_APP_API_BASE_URL || 'https://scms-backend.up.railway.app';
    let siteBase = apiBase.replace('/index.php/api', '').replace('/api', '').replace(/\/$/, '');
    const pic = String(profilePic).replace(/\\\\/g, '/').replace(/\\/g, '/');
    if (pic.startsWith('http://') || pic.startsWith('https://')) return pic;
    if (pic.startsWith('data:')) return pic;
    if (pic.startsWith('/uploads/')) return `${siteBase}${pic}`;
    if (pic.startsWith('uploads/')) return `${siteBase}/${pic}`;
    return `${siteBase}/uploads/profile/${pic}`;
  };

  // Map frontend task type display values to backend API values
  const mapTaskTypeToBackend = (frontendType) => {
    const typeMapping = {
      'Assignment': 'assignment',
      'Quiz': 'quiz',
      'Activity': 'activity',
      'Project': 'project',
      'Exam': 'exam',
      'Midterm Exam': 'midterm_exam',
      'Final Exam': 'final_exam'
    };
    return typeMapping[frontendType] || frontendType.toLowerCase();
  };

  // Map backend task type values to frontend display values
  const mapTaskTypeToFrontend = (backendType) => {
    const typeMapping = {
      'assignment': 'Assignment',
      'quiz': 'Quiz',
      'activity': 'Activity',
      'project': 'Project',
      'exam': 'Exam',
      'midterm_exam': 'Midterm Exam',
      'final_exam': 'Final Exam'
    };
    return typeMapping[backendType] || backendType.charAt(0).toUpperCase() + backendType.slice(1);
  };

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
  const [expandedAnnouncementComments, setExpandedAnnouncementComments] = useState({});
  const [openCommentMenu, setOpenCommentMenu] = useState({});
  const formExpandedRef = useRef(); // <-- This must be the first hook!
  const navigate = useNavigate();
  const { code } = useParams();
  const location = useLocation();

  
  // Read tab from query parameter on mount
  const getInitialTab = () => {
    const params = new URLSearchParams(location.search);
    return params.get('tab') || "stream";
  };
  const [activeTab, setActiveTab] = useState(getInitialTab());
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const tab = params.get('tab');
    if (tab && tab !== activeTab) setActiveTab(tab);
    // eslint-disable-next-line
  }, [location.search]);
  const [showCodeModal, setShowCodeModal] = useState(false);
  const [copied, setCopied] = useState(false);
  const [tooltipHover, setTooltipHover] = useState(false);
  const [showThemeModal, setShowThemeModal] = useState(false);
  const [showQRCodeModal, setShowQRCodeModal] = useState(false);
  const [showCopyToast, setShowCopyToast] = useState(false);
  const [selectedTheme, setSelectedTheme] = useState(() => {
    const key = `classroom_theme_${code}`;
    return localStorage.getItem(key) || themes[0].value;
  });
  const [newAnnouncement, setNewAnnouncement] = useState("");
  const [announcements, setAnnouncements] = useState([]);
  const [streamLoading, setStreamLoading] = useState(true);
  const [streamError, setStreamError] = useState(null);
  const fileInputRef = useRef();
  const [customTheme, setCustomTheme] = useState(() => {
    const key = `classroom_custom_theme_${code}`;
    return localStorage.getItem(key) || null;
  });
  const [uploadStatus, setUploadStatus] = useState('');

  const MAX_IMAGE_WIDTH = 800;
  const MAX_IMAGE_HEIGHT = 600;
  const MAX_IMAGE_SIZE = 1.5 * 1024 * 1024; // 1.5MB

  // Get class info from localStorage (set by Classroom.js)
  const [classInfo, setClassInfo] = useState(null);

  // Add state to track if user is a student
  const [isStudent, setIsStudent] = useState(false);
  // Add state to track user role
  const [userRole, setUserRole] = useState('teacher');

  // Add new state for modals and forms
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [showAddGradeModal, setShowAddGradeModal] = useState(false);
  const [assignments, setAssignments] = useState(sampleAssignments);
  const [students, setStudents] = useState([]);
  const [loadingStudents, setLoadingStudents] = useState(false);
  const [grades, setGrades] = useState(sampleGrades);
  
  // Grades tab state for real data
  const [gradesData, setGradesData] = useState(null);
  const [loadingGrades, setLoadingGrades] = useState(false);
  const [gradesError, setGradesError] = useState(null);
  
  // Drafts and scheduled tasks loading states
  const [loadingDrafts, setLoadingDrafts] = useState(false);
  const [loadingScheduled, setLoadingScheduled] = useState(false);
  
  // Export functionality state
  const [exportLoading, setExportLoading] = useState(false);
  const [showWeightsModal, setShowWeightsModal] = useState(false);
  const [gradingBreakdown, setGradingBreakdown] = useState({
    attendance: 10,
    activity: 30,
    assignment: 0,
    midtermExam: 40,
    finalExam: 20
  });
  const [maxAttendanceScore, setMaxAttendanceScore] = useState(6);
  const [maxMidtermScore, setMaxMidtermScore] = useState(68);
  const [maxFinalExamScore, setMaxFinalExamScore] = useState(100);

  // Compute attendance metrics based on weights:
  // Present = 1, Excused = 1, Late = 0.7, Absent = 0
  // Maximum possible score is customizable by teacher
  const computeAttendanceMetrics = (attendance) => {
    if (!attendance) {
      return { rawScore: 0, maxPossibleScore: maxAttendanceScore, percentage: 0, weighted: 0 };
    }
    const presentSessions = Number(attendance.present_sessions || 0);
    const excusedSessions = Number(attendance.excused_sessions || 0);
    const lateSessions = Number(attendance.late_sessions || 0);
    const absentSessions = Number(attendance.absent_sessions || 0);

    const rawScore = presentSessions + excusedSessions + (lateSessions * 0.7);
    const percentage = maxAttendanceScore > 0 ? (rawScore / maxAttendanceScore) * 100 : 0;
    const weighted = (percentage * (gradingBreakdown.attendance || 0)) / 100;

    return { rawScore, maxPossibleScore: maxAttendanceScore, percentage, weighted };
  };

  // Compute assignment metrics (RS, PS, WS) for all assignments combined
  // Excludes midterm and final exams which are calculated separately
  const computeAssignmentMetrics = (student) => {
    if (!student.assignments || !gradesData.tasks) {
      return { rawScore: 0, maxPossibleScore: 0, percentage: 0, weighted: 0 };
    }

    let totalRawScore = 0;
    let totalMaxScore = 0;

    // Sum up all assignment scores and max scores, excluding midterm and final exams
    gradesData.tasks.forEach(task => {
      // Skip midterm and final exams - they have their own separate calculations
      if (task.type === 'midterm_exam' || 
          task.type === 'final_exam' || 
          task.title.toLowerCase().includes('midterm') ||
          task.title.toLowerCase().includes('final')) {
        return; // Skip this task
      }

      const assignment = student.assignments.find(a => a.task_id === task.task_id);
      if (assignment) {
        totalRawScore += parseFloat(assignment.grade || 0);
        totalMaxScore += parseFloat(assignment.points || 0);
      } else {
        // If no assignment found, assume 0 score but still count the max points
        totalMaxScore += parseFloat(task.points || 0);
      }
    });

    const percentage = totalMaxScore > 0 ? (totalRawScore / totalMaxScore) * 100 : 0;
    const weighted = (percentage * (gradingBreakdown.activity || 0)) / 100;

    return { rawScore: totalRawScore, maxPossibleScore: totalMaxScore, percentage, weighted };
  };

  // Compute midterm exam metrics (RS, PS, WS) based on customizable highest possible score
  const computeMidtermMetrics = (student) => {
    if (!student.assignments || !gradesData.tasks) {
      console.log('No assignments or tasks data available');
      return { rawScore: 0, maxPossibleScore: 0, percentage: 0, weighted: 0 };
    }
    
    console.log('Grades Data Tasks:', gradesData.tasks);
    console.log('Student Assignments:', student.assignments);
    console.log('Current maxMidtermScore state:', maxMidtermScore);
    console.log('Current maxFinalExamScore state:', maxFinalExamScore);

    // Find midterm exam task - check multiple criteria
    const midtermTask = gradesData.tasks.find(task => 
      task.type === 'midterm_exam' || 
      task.type === 'midterm' ||
      task.title.toLowerCase().includes('midterm') ||
      task.title.toLowerCase().includes('mid term') ||
      task.title.toLowerCase().includes('mid-term')
    );

    console.log('Found Midterm Task:', midtermTask);
    console.log('All tasks:', gradesData.tasks.map(t => ({ 
      id: t.task_id, 
      type: t.type, 
      title: t.title, 
      points: t.points,
      max_points: t.max_points,
      total_points: t.total_points,
      max_score: t.max_score
    })));

    if (!midtermTask) {
      console.log('No midterm task found, using state variable as fallback');
      // If no midterm task found, use the state variable as fallback
      return { 
        rawScore: 0, 
        maxPossibleScore: maxMidtermScore, 
        percentage: 0, 
        weighted: 0,
        hasTask: false,
        hasSubmission: false
      };
    }

    // Find student's midterm assignment
    const midtermAssignment = student.assignments.find(a => a.task_id === midtermTask.task_id);
    
    // Try different possible field names for the grade
    const rawScore = midtermAssignment ? parseFloat(
      midtermAssignment.grade || 
      midtermAssignment.score || 
      midtermAssignment.raw_score || 
      0
    ) : 0;
    
    console.log('Midterm Assignment:', midtermAssignment);
    console.log('Raw Score from assignment:', rawScore);
    
    // Use the state variable as primary source, then check task points as fallback
    // This ensures the modal input values are always used first
    let maxPossibleScore = maxMidtermScore;
    
    // Only use task points if they are explicitly set and different from defaults
    const taskPoints = parseFloat(
      midtermTask.points || 
      midtermTask.max_points || 
      midtermTask.total_points || 
      midtermTask.max_score || 
      0
    );
    
    // If task has specific points set (and it's not a default value), use those instead
    if (taskPoints > 0 && taskPoints !== 100 && taskPoints !== maxMidtermScore) {
      console.log('Using task-specific points:', taskPoints);
      maxPossibleScore = taskPoints;
    } else {
      console.log('Using state variable from modal:', maxMidtermScore);
    }
    
    // Debug logging to verify the values
    console.log('Midterm Task:', midtermTask);
    console.log('Raw Score:', rawScore);
    console.log('Max Possible Score:', maxPossibleScore);
    console.log('Grading Breakdown Midterm:', gradingBreakdown.midtermExam);
    console.log('Task points field:', midtermTask.points);
    console.log('Task max_points field:', midtermTask.max_points);
    console.log('Task total_points field:', midtermTask.total_points);
    
    // PS = (Midterm_RS / Highest_Possible_Score) * 100
    // Example: (51 / 68) * 100 = 75.00
    const percentage = maxPossibleScore > 0 ? (rawScore / maxPossibleScore) * 100 : 0;
    
    // WS = PS * Weight (in decimal form)
    // Example: 75.00 * 0.40 = 30.00
    const weighted = (percentage * (gradingBreakdown.midtermExam || 0)) / 100;
    
    console.log('Calculated Percentage:', percentage);
    console.log('Calculated Weighted Score:', weighted);
    
        // If maxPossibleScore is 0, fall back to a default or show error
    if (maxPossibleScore === 0) {
      console.warn('Warning: Max possible score is 0 for midterm task. Using fallback value.');
      // You can set a default value here if needed
      // const fallbackMaxScore = 100; // or any other default
    }
    
    // Final verification of the calculation
    console.log('Final Calculation Summary:');
    console.log(`Raw Score: ${rawScore}`);
    console.log(`Max Possible Score: ${maxPossibleScore}`);
    console.log(`Percentage: (${rawScore} / ${maxPossibleScore}) * 100 = ${percentage}%`);
    console.log(`Weight: ${gradingBreakdown.midtermExam}%`);
    console.log(`Weighted Score: ${percentage}% * ${gradingBreakdown.midtermExam}% = ${weighted}`);
    
    return { 
      rawScore, 
      maxPossibleScore, 
      percentage, 
      weighted,
      hasTask: !!midtermTask,
      hasSubmission: !!midtermAssignment
    };
  };

  // Compute quarterly grade by summing weighted scores (Attendance + Activity + Midterm only)
  const computeQuarterlyGrade = (student) => {
    const attendanceMetrics = computeAttendanceMetrics(student.attendance);
    const assignmentMetrics = computeAssignmentMetrics(student);
    const midtermMetrics = computeMidtermMetrics(student);

    // Debug logging
    console.log(`Student: ${student.full_name}`);
    console.log(`Attendance WS: ${attendanceMetrics.weighted}`);
    console.log(`Assignment/Activity WS: ${assignmentMetrics.weighted}`);
    console.log(`Midterm WS: ${midtermMetrics.weighted}`);

    // Sum weighted scores (exclude Final Exam for quarterly grade)
    // Ensure we're working with numbers and handle any potential null/undefined values
    const attendanceWS = Number(attendanceMetrics.weighted) || 0;
    const activityWS = Number(assignmentMetrics.weighted) || 0;
    const midtermWS = Number(midtermMetrics.weighted) || 0;
    
    const totalWeightedScore = attendanceWS + activityWS + midtermWS;

    console.log(`Total: ${attendanceWS} + ${activityWS} + ${midtermWS} = ${totalWeightedScore}`);

    const roundedGrade = Math.round(totalWeightedScore);

    return {
      exact: totalWeightedScore,
      rounded: roundedGrade
    };
  };

  // Compute final exam metrics (RS, PS, WS) based on customizable highest possible score
  const computeFinalExamMetrics = (student) => {
    if (!student.assignments || !gradesData.tasks) {
      return { rawScore: 0, maxPossibleScore: 0, percentage: 0, weighted: 0 };
    }

    // Find final exam task - check multiple criteria
    const finalExamTask = gradesData.tasks.find(task => 
      task.type === 'final_exam' || 
      task.type === 'final' ||
      task.title.toLowerCase().includes('final') ||
      task.title.toLowerCase().includes('final exam') ||
      task.title.toLowerCase().includes('final-exam')
    );

    if (!finalExamTask) {
      // If no final exam task found, use the state variable as fallback
      return { 
        rawScore: 0, 
        maxPossibleScore: maxFinalExamScore, 
        percentage: 0, 
        weighted: 0,
        hasTask: false,
        hasSubmission: false
      };
    }

    // Find student's final exam assignment
    const finalExamAssignment = student.assignments.find(a => a.task_id === finalExamTask.task_id);
    
    const rawScore = finalExamAssignment ? parseFloat(finalExamAssignment.grade || 0) : 0;
    
    // Use the state variable as primary source, then check task points as fallback
    // This ensures the modal input values are always used first
    let maxPossibleScore = maxFinalExamScore;
    
    // Only use task points if they are explicitly set and different from defaults
    const taskPoints = parseFloat(finalExamTask.points || 0);
    
    // If task has specific points set (and it's not a default value), use those instead
    if (taskPoints > 0 && taskPoints !== 100 && taskPoints !== maxFinalExamScore) {
      console.log('Using final exam task-specific points:', taskPoints);
      maxPossibleScore = taskPoints;
    } else {
      console.log('Using final exam state variable from modal:', maxFinalExamScore);
    }
    
    // PS = (FinalExam_RS / Highest_Possible_Score) * 100
    // Example: (51 / 68) * 100 = 75.00
    const percentage = maxPossibleScore > 0 ? (rawScore / maxPossibleScore) * 100 : 0;
    
    // WS = PS * Weight (in decimal form)
    // Example: 75.00 * 0.40 = 30.00
    const weighted = (percentage * (gradingBreakdown.finalExam || 0)) / 100;

    return { 
      rawScore, 
      maxPossibleScore, 
      percentage, 
      weighted,
      hasTask: !!finalExamTask,
      hasSubmission: !!finalExamAssignment
    };
  };

  // Save students to localStorage whenever they change
  useEffect(() => {
    console.log('Students state changed:', students);
    if (code && students && students.length > 0) {
      localStorage.setItem(`classroom_students_${code}`, JSON.stringify(students));
    }
  }, [students, code]);

  // Function to fetch enrolled students from API
  const fetchEnrolledStudents = async () => {
    if (!code) {
      console.log('No code available, skipping fetch');
      return;
    }
    
    // Check if user is authenticated
    const token = localStorage.getItem('token');
    const user = localStorage.getItem('user');
    console.log('Authentication check - Token exists:', !!token);
    console.log('Authentication check - User exists:', !!user);
    console.log('User data:', user ? JSON.parse(user) : 'No user data');
    
    if (!token) {
      console.error('No authentication token found. User needs to login.');
      setStudents([]);
      setLoadingStudents(false);
      return;
    }
    
    console.log('Starting fetchEnrolledStudents for code:', code);
    setLoadingStudents(true);
    try {
      console.log('Making API call using apiService');
      
      // First, let's test if the getClassroomByCode endpoint works
      console.log('Testing getClassroomByCode endpoint...');
      try {
        const classroomResponse = await apiService.getClassroomByCode(code);
        console.log('Classroom response:', classroomResponse);
      } catch (classroomError) {
        console.log('Classroom endpoint error:', classroomError.message);
      }
      
      // Now try the students endpoint with different possible paths
      console.log('Testing students endpoint...');
      
      let response;
      try {
        // Use the new API method
        response = await apiService.getClassroomStudents(code);
        console.log('API Response received:', response);
      } catch (error1) {
        console.log('getClassroomStudents failed, trying fallback...');
        try {
          // Try fallback with direct makeRequest
          response = await apiService.makeRequest(`/teacher/classroom/${code}/students`, {
            method: 'GET',
            requireAuth: true
          });
          console.log('Fallback API Response received:', response);
        } catch (error2) {
          console.log('Alternative path also failed, trying section students...');
          try {
            // Try getting all students and filtering
            const allStudentsResponse = await apiService.getStudents();
            console.log('All students response:', allStudentsResponse);
            
            if (allStudentsResponse && allStudentsResponse.status && allStudentsResponse.data) {
              // Transform the all students data to match our expected format
              const allStudents = allStudentsResponse.data.map(student => ({
                id: student.id || student.user_id,
                name: student.full_name || student.name,
                email: student.email,
                student_num: student.student_num,
                contact_num: student.contact_num,
                program: student.program,
                section_name: student.section_name,
                joinedDate: student.created_at || student.enrolled_at,
                enrollment_status: student.status || 'active',
                profile_pic: student.profile_pic || student.profile_image,
                role: "Student"
              }));
              
              console.log('Transformed all students:', allStudents);
              // Use the all students data instead of empty response
              response = { status: true, data: { students: allStudents } };
            } else {
              console.log('All students response has invalid structure, using empty response');
              response = { status: true, data: { students: [] } };
            }
          } catch (error3) {
            console.log('All approaches failed, no students available');
            // No students available - return empty response
            response = { status: true, data: { students: [] } };
          }
        }
      }
      
      if (response && response.status && response.data && response.data.students) {
        console.log('Response has valid structure, processing students...');
        // Transform the API data to match our expected format
        const enrolledStudents = response.data.students.map(student => ({
          id: student.user_id,
          name: student.full_name,
          email: student.email,
          student_num: student.student_num,
          contact_num: student.contact_num,
          program: student.program,
          section_name: student.section_name,
          joinedDate: student.enrolled_at,
          enrollment_status: student.enrollment_status,
          profile_pic: student.profile_pic || student.profile_image,
          role: "Student"
        }));
        
        console.log('Transformed students:', enrolledStudents);
        console.log('Setting students state with', enrolledStudents.length, 'students');
        setStudents(enrolledStudents);
      } else {
        console.error('Invalid response format from API. Response structure:', {
          hasData: !!response,
          hasStatus: !!(response && response.status),
          hasDataField: !!(response && response.data),
          hasStudents: !!(response && response.data && response.data.students)
        });
        setStudents([]);
      }
    } catch (error) {
      console.error('Error fetching enrolled students:', error);
      console.error('Error details:', error.message);
      console.error('Full error object:', error);
      console.error('Error response data:', error.response?.data);
      console.error('Error response status:', error.response?.status);
      console.error('Error response headers:', error.response?.headers);
      setStudents([]);
    } finally {
      console.log('Setting loadingStudents to false');
      setLoadingStudents(false);
    }
  };

  const [createForm, setCreateForm] = useState({
    type: '',
    title: '',
    dueDate: '',
    points: '',
    details: '',
    attachments: [],
    assignedStudents: []
  });
  const [inviteForm, setInviteForm] = useState({
    name: '',
    email: ''
  });
  const [gradeForm, setGradeForm] = useState({
    studentId: '',
    work: '',
    grade: ''
  });

  const [yearDropdownOpen, setYearDropdownOpen] = useState(false);
  const [audienceDropdownOpen, setAudienceDropdownOpen] = useState(false);
  const [addDropdownOpen, setAddDropdownOpen] = useState(false);
  const [selectedYear, setSelectedYear] = useState('2024-2025');
  const [selectedAudience, setSelectedAudience] = useState('All students');
  const years = ['2023-2024', '2024-2025', '2025-2026'];
  const audiences = ['All students'];

  const [attachments, setAttachments] = useState([]);
  const [showLinkModal, setShowLinkModal] = useState(false);
  const [showYouTubeModal, setShowYouTubeModal] = useState(false);
  const [showDriveModal, setShowDriveModal] = useState(false);
  const [linkInput, setLinkInput] = useState("");
  const [youtubeInput, setYouTubeInput] = useState("");
  const [driveInput, setDriveInput] = useState("");
  const [linkError, setLinkError] = useState("");
  const [showScheduleModal, setShowScheduleModal] = useState(false);
  const [scheduleDate, setScheduleDate] = useState("");
  const [scheduleTime, setScheduleTime] = useState("");
  const [drafts, setDrafts] = useState([]);
  const [scheduledPosts, setScheduledPosts] = useState([]);

  // Topic management state
  const [topics, setTopics] = useState([{ id: 1, name: 'Misc' }]);
  const [selectedTopic, setSelectedTopic] = useState(null);
  const [topicMenuOpen, setTopicMenuOpen] = useState(null);
  const [showTopicModal, setShowTopicModal] = useState(false);
  const [topicInput, setTopicInput] = useState("");
  const [topicEditId, setTopicEditId] = useState(null);
  const [topicEditInput, setTopicEditInput] = useState("");
  const [classwork, setClasswork] = useState([]);
  // Modal state for each create type
  const [showAssignmentModal, setShowAssignmentModal] = useState(false);
  const [showQuizModal, setShowQuizModal] = useState(false);
  const [showQuestionModal, setShowQuestionModal] = useState(false);
  const [showMaterialModal, setShowMaterialModal] = useState(false);
  const [showReuseModal, setShowReuseModal] = useState(false);
  // Form state for each create type
  const [assignmentForm, setAssignmentForm] = useState({ title: '', instructions: '', points: 100, dueDate: '', topic: '', attachments: [] });
  const assignmentFileInputRef = useRef();
  const [quizForm, setQuizForm] = useState({ title: '', instructions: '', points: 10, dueDate: '', topic: '', attachments: [] });
  const quizFileInputRef = useRef();
  const [questionForm, setQuestionForm] = useState({ question: '', options: ['', ''], dueDate: '', topic: '', attachments: [] });
  const questionFileInputRef = useRef();
  const [materialForm, setMaterialForm] = useState({ title: '', description: '', topic: '', attachments: [] });
  const materialFileInputRef = useRef();

  const [announcementDropdowns, setAnnouncementDropdowns] = useState({});
  const [editingAnnouncementId, setEditingAnnouncementId] = useState(null);
  const [editAnnouncementData, setEditAnnouncementData] = useState({ title: '', content: '' });

  const [formExpanded, setFormExpanded] = useState(false);

  const [attachmentDropdownOpen, setAttachmentDropdownOpen] = useState(false);
  const [emojiPickerOpen, setEmojiPickerOpen] = useState(false);
  const [postDropdownOpen, setPostDropdownOpen] = useState(false);
  const [scheduledActionMenu, setScheduledActionMenu] = useState(null);
  const [draftActionMenu, setDraftActionMenu] = useState(null);
  const emojiPickerRef = useRef();
  const postFormRef = useRef();

  // 1. Add state for preview modal and attachment
  const [previewModalOpen, setPreviewModalOpen] = useState(false);
  const [previewAttachment, setPreviewAttachment] = useState(null);
  const [previewText, setPreviewText] = useState("");

  // Add state for mp3 playing
  const [mp3Playing, setMp3Playing] = useState(false);

  // Add refs for visualizer
  const visualizerIntervalRef = useRef(null);



  // Visualizer functions
  const startVisualizer = () => {
    const bars = document.querySelectorAll('.visualizer-bar');
    visualizerIntervalRef.current = setInterval(() => {
      bars.forEach((bar, index) => {
        const height = Math.random() * 50 + 10;
        bar.style.height = height + 'px';
        bar.style.animationDelay = (index * 0.1) + 's';
      });
    }, 100);
  };

  const stopVisualizer = () => {
    if (visualizerIntervalRef.current) {
      clearInterval(visualizerIntervalRef.current);
      visualizerIntervalRef.current = null;
      const bars = document.querySelectorAll('.visualizer-bar');
      bars.forEach(bar => {
        bar.style.height = '10px';
      });
    }
  };

  // 1. Add state for the new announcement title
  const [newAnnouncementTitle, setNewAnnouncementTitle] = useState("");



  // 2. Add state for modal and selected students
  const [showStudentSelectModal, setShowStudentSelectModal] = useState(false);
  const [selectedAnnouncementStudents, setSelectedAnnouncementStudents] = useState([]);

  // Add at the top of ClassroomDetail component:
  const [tempSelectedStudents, setTempSelectedStudents] = useState([]);
  
  // Add Users Modal state
  const [showAddUsersModal, setShowAddUsersModal] = useState(false);
  const [selectedUsers, setSelectedUsers] = useState([]);
  const [userSearch, setUserSearch] = useState('');
  const [availableUsers, setAvailableUsers] = useState([]);
  const [loadingUsers, setLoadingUsers] = useState(false);
  
  // Add classrooms state to load actual classrooms
  const [classrooms, setClassrooms] = useState([]);
  
  // Current user - derive from stored auth user
  let currentUser = 'You';
  try {
    const stored = localStorage.getItem('user') || localStorage.getItem('scms_logged_in_user');
    if (stored) {
      const u = JSON.parse(stored);
      currentUser = u.full_name || u.name || u.user_name || 'You';
    }
  } catch (_) {}

  // Add state for student classes
  const [studentClasses, setStudentClasses] = useState([]);
  const [loadingStudentClasses, setLoadingStudentClasses] = useState(false);
  const [studentClassesError, setStudentClassesError] = useState(null);

  // Add at the top of ClassroomDetail component:
  const [commentDropdownOpen, setCommentDropdownOpen] = useState(null);

  // At the top of ClassroomDetail component:
  const [showMoreMenu, setShowMoreMenu] = useState(false);
  const [showDraftsCollapse, setShowDraftsCollapse] = useState(false);
  const [showScheduledCollapse, setShowScheduledCollapse] = useState(false);
  const [taskFormExpanded, setTaskFormExpanded] = useState(false);

  // Add this state at the top of ClassroomDetail component:
  const [classworkDropdownOpen, setClassworkDropdownOpen] = useState(null);

  // Add state for expanded classwork card
  const [expandedClassworkId, setExpandedClassworkId] = useState(null);

  // Add separate state for attachment dropdown in edit form
  const [editAttachmentDropdownOpen, setEditAttachmentDropdownOpen] = useState(false);

  // Add state for expanded classwork
  const [expandedClasswork, setExpandedClasswork] = useState(null);
  
  // Add state for collapsible comments
  const [collapsedComments, setCollapsedComments] = useState({});

  // Add state for current classroom
  const currentClassroom = classrooms.find(cls => cls.code === code) || { name: 'Current Classroom', code };

  // Add CSS for pulse animation
  useEffect(() => {
    const style = document.createElement('style');
    style.textContent = `
      @keyframes pulse {
        0% { opacity: 1; }
        50% { opacity: 0.5; }
        100% { opacity: 1; }
      }
    `;
    document.head.appendChild(style);
    return () => document.head.removeChild(style);
  }, []);

  // Load classrooms from localStorage
  useEffect(() => {
    const saved = localStorage.getItem("teacherClasses");
    if (saved) {
      setClassrooms(JSON.parse(saved));
    } else {
      setClassrooms([]);
    }
  }, []);
  
  // Fetch available users when Add Users modal is opened or when students data changes
  useEffect(() => {
    if (showAddUsersModal) {
      fetchAvailableUsers();
    }
  }, [showAddUsersModal, students]);
  
  // Function to fetch available users for the Add Users modal
  const fetchAvailableUsers = async () => {
    if (!code) return;
    
    setLoadingUsers(true);
    try {
      const users = [];
      
      // For teacher role: only show students, don't include the teacher themselves
      // Add students from the existing students state
      if (students && Array.isArray(students) && students.length > 0) {
        students.forEach(student => {
          users.push({
            ...student,
            name: student.name || student.full_name,
            role: 'student',
            type: 'student'
          });
        });
      }
      
      // No students available - keep users array empty
      console.log('Available users for Add Users modal (students only):', users);
      
      console.log('Available users for Add Users modal (students only):', users);
      setAvailableUsers(users);
      
    } catch (error) {
      console.error('Error setting up available users:', error);
      // No students available - set empty array
      setAvailableUsers([]);
    } finally {
      setLoadingUsers(false);
    }
  };
  // Load tasks from API for current classroom
  const [loadingTasks, setLoadingTasks] = useState(false);
  const [taskError, setTaskError] = useState(null);

  const fetchTasks = async () => {
    if (!code) return;
    
    setLoadingTasks(true);
    setTaskError(null);
    
    try {
      const response = await apiService.getTeacherTasks({
        classCode: code,
        isDraft: 0, // Get published tasks by default
        status: 'active'
      });
      
      if (response.status) {
        console.log('API Response:', response);
        console.log('Tasks data:', response.data);
        console.log('Raw task data from backend:', response.data);

        // Normalize tasks to always include an attachments array
        const normalizeTasks = async (rawTasks = []) => {
          const tasks = Array.isArray(rawTasks) ? rawTasks : [];
          const enriched = await Promise.all(tasks.map(async (t) => {
            let attachments = Array.isArray(t.attachments) ? [...t.attachments] : [];

            // Handle different attachment formats from the backend
            if (!attachments || attachments.length === 0) {
              // Check for single attachment fields
              if (t.attachment_url) {
                const att = {
                  attachment_url: t.attachment_url,
                  attachment_type: t.attachment_type || 'file',
                  name: t.original_name || (typeof t.attachment_url === 'string' ? t.attachment_url.split('/').pop() : 'Attachment'),
                  file_name: t.file_name,
                  original_name: t.original_name,
                  type: t.attachment_type || 'file'
                };
                attachments = [att];
              }
              
              // Check for link attachments (YouTube, Google Drive, external links)
              // Check various possible field names for YouTube links
              if (t.youtube_url || t.youtube_link || t.youtube) {
                const youtubeUrl = t.youtube_url || t.youtube_link || t.youtube;
                attachments.push({
                  type: 'YouTube',
                  url: youtubeUrl,
                  name: t.youtube_title || t.youtube_name || 'YouTube Video',
                  attachment_type: 'youtube'
                });
              }
              
              // Check various possible field names for Google Drive links
              if (t.gdrive_url || t.gdrive_link || t.gdrive || t.google_drive_url || t.google_drive) {
                const gdriveUrl = t.gdrive_url || t.gdrive_link || t.gdrive || t.google_drive_url || t.google_drive;
                attachments.push({
                  type: 'Google Drive',
                  url: gdriveUrl,
                  name: t.gdrive_title || t.gdrive_name || t.google_drive_title || 'Google Drive Document',
                  attachment_type: 'google_drive'
                });
              }
              
              // Check various possible field names for external links
              if (t.link_url || t.link || t.external_link || t.external_url) {
                const linkUrl = t.link_url || t.link || t.external_link || t.external_url;
                attachments.push({
                  type: 'Link',
                  url: linkUrl,
                  name: t.link_title || t.link_name || t.external_title || 'External Link',
                  attachment_type: 'link'
                });
              }
              
              // Check for external_links JSON field
              if (t.external_links) {
                try {
                  const externalLinks = typeof t.external_links === 'string' ? JSON.parse(t.external_links) : t.external_links;
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

            return { ...t, attachments };
          }));
          return enriched;
        };

        const normalized = await normalizeTasks(response.data || []);
        console.log('Normalized tasks with attachments:', normalized);
        console.log('Task attachments after normalization:', normalized.map(t => ({ 
          id: t.task_id || t.id, 
          title: t.title, 
          attachments: t.attachments,
          attachment_url: t.attachment_url,
          youtube_url: t.youtube_url,
          gdrive_url: t.gdrive_url,
          link_url: t.link_url
        })));
        setTasks(normalized);
      } else {
        setTaskError(response.message || 'Failed to load tasks');
      }
    } catch (error) {
      console.error('Error fetching tasks:', error);
      setTaskError(error.message || 'Failed to load tasks');
    } finally {
      setLoadingTasks(false);
    }
  };

  // Collapsed state for Class Tasks list (default collapsed)
  const [collapsedTasks, setCollapsedTasks] = useState({});

  const loadTaskComments = async (taskId) => {
    console.log('Loading comments for taskId:', taskId);
    try {
      const response = await apiService.getTaskComments(taskId);
      if (response.status) {
        setTasks(prev => prev.map(task => 
          (task.task_id || task.id || task._id || task.taskId) === taskId 
            ? { ...task, comments: response.data || [] }
            : task
        ));
      }
    } catch (error) {
      console.error('Error loading task comments:', error);
    }
  };

  useEffect(() => {
    fetchTasks();
  }, [code]);
  
  // Add state for assignment dropdowns
  const [assignmentDropdowns, setAssignmentDropdowns] = useState({});
  const [editClassworkData, setEditClassworkData] = useState({ title: '', details: '', dueDate: '', points: '', type: 'Assignment' });
  
  // Add state for quick grade form
  const [quickGradeForm, setQuickGradeForm] = useState({ type: 'Assignment', title: '', points: '' });
  const [quickGradeAssessments, setQuickGradeAssessments] = useState([]);
  const handleQuickGradeFormChange = e => {
    const { name, value } = e.target;
    setQuickGradeForm(f => ({ ...f, [name]: value }));
  };
  const handleQuickGradeCreate = e => {
    e.preventDefault();
    if (!quickGradeForm.title.trim() || !quickGradeForm.points) return;
    const newAssessmentId = Date.now();
    // Only save to quickGradeAssessments as a Live Setup (no online fields)
    setQuickGradeAssessments(a => [
      ...a,
      { ...quickGradeForm, id: newAssessmentId, createdAt: new Date().toISOString(), isOnline: false }
    ]);
    // Initialize empty grading data for this assessment
    setGradingRows(prev => ({
      ...prev,
      [newAssessmentId]: []
    }));
    // Only reset Live Setup form fields
    setQuickGradeForm({ type: 'Assignment', title: '', points: '' });
    // Do NOT reset onlineAssignedStudents or onlineAttachments here
  };
  // Add state for edit assessment form
  const [quickGradeEditId, setQuickGradeEditId] = useState(null);
  const [quickGradeEditForm, setQuickGradeEditForm] = useState({ title: '', points: '' });
  const [voiceType, setVoiceType] = useState('female'); // or 'male' as default
  const [showQRGrading, setShowQRGrading] = useState(false);
  const [showManualGrading, setShowManualGrading] = useState(false);
  
  // Class Tasks state
  const [tasks, setTasks] = useState([]);
  const [taskForm, setTaskForm] = useState({
    type: 'Assignment',
    title: '',
    text: '',
    dueDate: '',
    points: '',

    attachments: [],
    visibleTo: [],
    postToClassrooms: ['current'],
    assignedStudents: [],
    submitted: false
  });
  const [taskAttachments, setTaskAttachments] = useState([]);
  const [taskExternalLinks, setTaskExternalLinks] = useState([]);
  const [showTaskLinkInput, setShowTaskLinkInput] = useState(false);
  const [newTaskLink, setNewTaskLink] = useState({ name: '', url: '', type: 'link' });
  const [taskAssignedStudents, setTaskAssignedStudents] = useState([]);
  const [taskDrafts, setTaskDrafts] = useState([]);
  const [taskScheduled, setTaskScheduled] = useState([]);
  const [showTaskDraftsCollapse, setShowTaskDraftsCollapse] = useState(false);
  const [showTaskScheduledCollapse, setShowTaskScheduledCollapse] = useState(false);

  const [showTaskLinkModal, setShowTaskLinkModal] = useState(false);
  const [showTaskYouTubeModal, setShowTaskYouTubeModal] = useState(false);
  const [showTaskDriveModal, setShowTaskDriveModal] = useState(false);
  const [taskLinkInput, setTaskLinkInput] = useState('');
  const [taskYouTubeInput, setTaskYouTubeInput] = useState('');
  const [taskDriveInput, setTaskDriveInput] = useState('');
  const [taskLinkError, setTaskLinkError] = useState('');
  const [showTaskScheduleModal, setShowTaskScheduleModal] = useState(false);
  const [showTaskOptionsModal, setShowTaskOptionsModal] = useState(false);
  const [taskScheduleDate, setTaskScheduleDate] = useState('');
  const [taskScheduleTime, setTaskScheduleTime] = useState('');
  const [taskCommentsOpen, setTaskCommentsOpen] = useState({});
  const [taskCommentInputs, setTaskCommentInputs] = useState({});
  const taskFileInputRef = useRef();
  const [qrScore, setQRScore] = useState('');
  const qrScoreRef = useRef('');
  const qrNotesRef = useRef();
  const qrAttachmentRef = useRef();
  const [qrNotes, setQRNotes] = useState('');
  const [qrAttachment, setQRAttachment] = useState(null);
  const [manualStudent, setManualStudent] = useState('');
  
  // Task attachment and emoji picker state
  const [taskAttachmentDropdownOpen, setTaskAttachmentDropdownOpen] = useState(false);
  const [taskEmojiPickerOpen, setTaskEmojiPickerOpen] = useState(false);
  const taskEmojiPickerRef = useRef();
  const [manualScore, setManualScore] = useState('');
  const [manualNotes, setManualNotes] = useState('');
  const [manualAttachment, setManualAttachment] = useState(null);
  const [gradingRows, setGradingRows] = useState({}); // {assessmentId: [{studentId, name, avatar, score, attachment, notes, dateGraded}]}

  // Add state for editing grading rows 
  const [editingGradeIdx, setEditingGradeIdx] = useState(null);
  const [editScore, setEditScore] = useState('');
  const [editNotes, setEditNotes] = useState('');
  const [editAttachment, setEditAttachment] = useState(null);
  
  // QR and Manual Grading attachment dropdown states
  const [qrAttachmentDropdownOpen, setQRAttachmentDropdownOpen] = useState(false);
  const [manualAttachmentDropdownOpen, setManualAttachmentDropdownOpen] = useState(false);
  const qrFileInputRef = useRef();
  const manualFileInputRef = useRef();
  
  // QR Scanner state variables
  const [isQrScannerOpen, setIsQrScannerOpen] = useState(false);
  const [qrScanResult, setQrScanResult] = useState(null);
  const [qrScanError, setQrScanError] = useState(null);
  const [scannedPhoto, setScannedPhoto] = useState(null);
  const [scannedStudent, setScannedStudent] = useState(null);
  const qrScannerRef = useRef(null);

  // Camera functionality states
  const [showCameraModal, setShowCameraModal] = useState(false);
  const [cameraStream, setCameraStream] = useState(null);
  const [capturedImage, setCapturedImage] = useState(null);
  const [isRecording, setIsRecording] = useState(false);
  const [recordedVideo, setRecordedVideo] = useState(null);
  const [cameraMode, setCameraMode] = useState('photo'); // 'photo' or 'video'
  const [cameraType, setCameraType] = useState('qr'); // 'qr' or 'manual'
  const [facingMode, setFacingMode] = useState('user'); // 'user' or 'environment'
  const [cameraError, setCameraError] = useState('');
  const videoRef = useRef();
  const canvasRef = useRef();
  const mediaRecorderRef = useRef();
  const recordedChunksRef = useRef([]);

  // Add refs for last scanned student and time
  const lastScannedStudentIdRef = useRef(null);
  const lastScanTimeRef = useRef(0);

// Play grading success audio
  const playGradingSuccessAudio = () => {
    try {
      const audioFile = voiceType === 'male'
        ? '/grading-success-male.mp3'
        : '/grading-success-female.mp3';
      
      const audio = new Audio(audioFile);
      audio.volume = 0.8;
      
      const playPromise = audio.play();
      
      if (playPromise !== undefined) {
        playPromise
          .then(() => {
            // Audio played successfully
          })
          .catch((error) => {
            console.error('QR grading audio play failed:', error);
            // Try fallback - create a simple beep sound
            try {
              const audioContext = new (window.AudioContext || window.webkitAudioContext)();
              const oscillator = audioContext.createOscillator();
              const gainNode = audioContext.createGain();
              
              oscillator.connect(gainNode);
              gainNode.connect(audioContext.destination);
              
              oscillator.frequency.value = 800; // 800Hz tone
              oscillator.type = 'sine';
              
              gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
              gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.5);
              
              oscillator.start(audioContext.currentTime);
              oscillator.stop(audioContext.currentTime + 0.5);
            } catch (fallbackError) {
              console.error('Fallback audio also failed:', fallbackError);
            }
          });
      }
    } catch (error) {
      console.error('Error in playGradingSuccessAudio:', error);
    }
  };

// Handler for QR Grading submission (simulate QR scan)
const handleQRSubmit = () => {
  // Simulate finding student by QR (replace with real QR logic)
  const student = students[0]; // Replace with actual lookup
  if (!student) return alert("Student not found!");
  
  // Get the currently selected assessment
  const currentAssessment = quickGradeAssessments.find(a => a.id === selectedQuickGradeId);
  if (!currentAssessment) {
    alert("Please select an assessment first!");
    return;
  }
  
  setGradingRows(prev => ({
    ...prev,
    [selectedQuickGradeId]: [
      ...(prev[selectedQuickGradeId] || []),
      {
        studentId: student.id,
        name: student.name,
        avatar: student.avatar,
        score: qrScore,
        attachment: qrAttachment,
        notes: qrNotes,
        dateGraded: new Date().toLocaleString()
      }
    ]
  }));
  setQRScore('');
  setQRNotes('');
  setQRAttachment(null);
  setShowQRGrading(false);
};

// Handler for Manual Grading submission
const handleManualSubmit = () => {
  const student = students.find(s => String(s.id) === String(manualStudent));
  if (!student) return alert("Select a student!");
  
  // Get the currently selected assessment
  const currentAssessment = quickGradeAssessments.find(a => a.id === selectedQuickGradeId);
  if (!currentAssessment) {
    alert("Please select an assessment first!");
    return;
  }
  
  const points = currentAssessment.points; // Use the assessment's points
  const newGrade = {
    studentId: student.id,
    name: student.name,
    avatar: getAvatarForUser(student),
    score: manualScore,
    points,
    attachment: manualAttachment,
    notes: manualNotes,
    dateGraded: new Date().toLocaleString()
  };
  setGradingRows(prev => {
    const currentRows = prev[selectedQuickGradeId] || [];
    const filteredRows = currentRows.filter(r => String(r.studentId) !== String(student.id));
    return {
      ...prev,
      [selectedQuickGradeId]: [...filteredRows, newGrade]
    };
  });
  setManualStudent('');
  setManualScore('');
  setManualNotes('');
  setManualAttachment(null);
  // Do not close manual grading form
  // setShowManualGrading(false);
};

// File input handlers
const handleQRAttachment = e => setQRAttachment(e.target.files[0]);
const handleManualAttachment = e => setManualAttachment(e.target.files[0]);

// Camera functionality handlers
const startCamera = async () => {
  try {
    setCameraError('');
    // First check if getUserMedia is supported
    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      throw new Error('getUserMedia is not supported in this browser');
    }
    // Try to get camera stream with selected facingMode
    const constraints = {
      video: {
        facingMode: { ideal: facingMode },
        width: { ideal: 640, min: 320 },
        height: { ideal: 480, min: 240 }
      },
      audio: cameraMode === 'video'
    };
    const stream = await navigator.mediaDevices.getUserMedia(constraints);
    setCameraStream(stream);
    if (videoRef.current) {
      videoRef.current.srcObject = stream;
      videoRef.current.load();
      videoRef.current.onloadedmetadata = () => {
        videoRef.current.play().catch(e => setCameraError('Error playing video: ' + e.message));
      };
      videoRef.current.onerror = (e) => {
        setCameraError('Video element error: ' + e.message);
      };
    }
  } catch (error) {
    setCameraError(error.message);
    // Fallback
    try {
      const fallbackStream = await navigator.mediaDevices.getUserMedia({ video: true, audio: false });
      setCameraStream(fallbackStream);
      if (videoRef.current) {
        videoRef.current.srcObject = fallbackStream;
        videoRef.current.load();
        videoRef.current.onloadedmetadata = () => {
          videoRef.current.play().catch(e => setCameraError('Error playing fallback video: ' + e.message));
        };
      }
    } catch (fallbackError) {
      setCameraError('Camera error: ' + fallbackError.message);
    }
  }
};

const stopCamera = () => {
  if (cameraStream) {
    cameraStream.getTracks().forEach(track => track.stop());
    setCameraStream(null);
  }
  setCapturedImage(null);
  setRecordedVideo(null);
  setIsRecording(false);
  recordedChunksRef.current = [];
};

const capturePhoto = () => {
  if (videoRef.current && canvasRef.current) {
    const video = videoRef.current;
    const canvas = canvasRef.current;
    const context = canvas.getContext('2d');
    
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    context.drawImage(video, 0, 0);
    
    canvas.toBlob((blob) => {
      const file = new File([blob], `photo_${Date.now()}.jpg`, { type: 'image/jpeg' });
      setCapturedImage(file);
    }, 'image/jpeg', 0.8);
  }
};

const startRecording = () => {
  if (cameraStream && videoRef.current) {
    recordedChunksRef.current = [];
    const mediaRecorder = new MediaRecorder(cameraStream);
    mediaRecorderRef.current = mediaRecorder;
    
    mediaRecorder.ondataavailable = (event) => {
      if (event.data.size > 0) {
        recordedChunksRef.current.push(event.data);
      }
    };
    
    mediaRecorder.onstop = () => {
      const blob = new Blob(recordedChunksRef.current, { type: 'video/webm' });
      const file = new File([blob], `video_${Date.now()}.webm`, { type: 'video/webm' });
      setRecordedVideo(file);
    };
    
    mediaRecorder.start();
    setIsRecording(true);
  }
};

const stopRecording = () => {
  if (mediaRecorderRef.current && isRecording) {
    mediaRecorderRef.current.stop();
    setIsRecording(false);
  }
};

const useCapturedMedia = () => {
  const file = capturedImage || recordedVideo;
  if (file) {
    if (cameraType === 'qr') {
      setQRAttachment(file);
    } else {
      setManualAttachment(file);
    }
    setShowCameraModal(false);
    stopCamera();
  }
};
  
// QR and Manual Grading attachment handlers
const handleQRAttachmentType = (type) => {
  if (type === "File") {
    qrFileInputRef.current.click();
  } else if (type === "Camera") {
    setCameraType('qr');
    setCameraMode('photo');
    setShowCameraModal(true);
  }
  setQRAttachmentDropdownOpen(false);
};

const handleManualAttachmentType = (type) => {
  if (type === "File") {
    manualFileInputRef.current.click();
  } else if (type === "Camera") {
    setCameraType('manual');
    setCameraMode('photo');
    setShowCameraModal(true);
  }
  setManualAttachmentDropdownOpen(false);
};
const startQrScanner = async () => {
  try {
    setQrScanError(null);
    const html5QrCode = new Html5Qrcode("qr-reader");
    qrScannerRef.current = html5QrCode;

    await html5QrCode.start(
      { facingMode: "environment" },
      {
        fps: 10,
        qrbox: { width: 250, height: 250 },
        aspectRatio: 1.0
      },
      (decodedText, decodedResult) => {
        // Parse QR code with the format:
        // IDNo: 2021305973
        // Full Name: ANJELA SOFIA G. SARMIENTO
        // Program: Bachelor of Science in Information Technology

        try {
          const lines = decodedText.split('\n');
          let id = '';
          let name = '';
          let program = '';

          lines.forEach(line => {
            const trimmedLine = line.trim();
            if (trimmedLine.startsWith('IDNo:')) {
              id = trimmedLine.replace('IDNo:', '').trim();
            } else if (trimmedLine.startsWith('Full Name:')) {
              name = trimmedLine.replace('Full Name:', '').trim();
            } else if (trimmedLine.startsWith('Program:')) {
              program = trimmedLine.replace('Program:', '').trim();
            }
          });

          if (id && name && program) {
            const scanResult = {
              id: id,
              name: name,
              program: program
            };
            setQrScanResult(scanResult);

            // Look up student by ID directly (10-digit student ID)
            const student = students.find(s => s.id === scanResult.id);

            if (student) {
              // Debounce: Only play audio if new student or enough time has passed (using refs)
              const now = Date.now();
              if (lastScannedStudentIdRef.current !== student.id || now - lastScanTimeRef.current > 2000) {
                playGradingSuccessAudio();
                lastScannedStudentIdRef.current = student.id;
                lastScanTimeRef.current = now;
              }
              // Set the scanned student to show the "Student Found" div
              setScannedStudent({ ...student, program: scanResult.program }); // Attach program
              setQrScanResult(scanResult);
              
              const score = qrScoreRef.current;
              const notes = qrNotes;
              const attachment = qrAttachment;
              
              if (!score) {
                setQrScanError("Please enter a score before scanning.");
                return;
              }
              
              // Get the currently selected assessment
              const currentAssessment = quickGradeAssessments.find(a => a.id === selectedQuickGradeId);
              if (!currentAssessment) {
                setQrScanError("Please select an assessment first!");
                return;
              }
              
              // Check if already graded for this assessment
              const currentRows = gradingRows[selectedQuickGradeId] || [];
              const alreadyGraded = currentRows.some(row => row.studentId === student.id);
              if (alreadyGraded) {
                setQrScanError("This student has already been recorded for this assessment");
                return;
              }
              
              // Add to grading rows for this assessment
              const points = currentAssessment.points;
              setGradingRows(prev => {
                const currentAssessmentRows = prev[selectedQuickGradeId] || [];
                const filteredRows = currentAssessmentRows.filter(r => String(r.studentId) !== String(student.id));
                return {
                  ...prev,
                  [selectedQuickGradeId]: [...filteredRows, {
                    studentId: student.id,
                    name: student.name,
                    avatar: getAvatarForUser(student),
                    score: score,
                    points,
                    attachment: attachment,
                    notes: notes,
                    dateGraded: new Date().toLocaleString(),
                    scannedPhoto: "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg=="
                  }]
                };
              });
              
              // Reset form
              setQRScore('');
              setQRNotes('');
              setQRAttachment(null);
              setQrScanResult(null);
              // setScannedStudent(null); // <-- Do not clear scannedStudent here
              setScannedPhoto(null);
              setQrScanError(null);
            } else {
              setQrScanError("Student not found with ID: " + scanResult.id);
              setScannedStudent(null);
            }
          } else {
            setQrScanError("Invalid QR code format. Expected: IDNo, Full Name, and Program");
            setScannedStudent(null);
          }
        } catch (error) {
          setQrScanError("Error parsing QR code: " + error.message);
          setScannedStudent(null);
        }

        // Keep scanner open for continuous scanning
        // stopQrScanner(); // Removed to keep scanner open
      },
      (errorMessage) => {
        // Ignore errors during scanning
        console.log("QR Scanner error:", errorMessage);
      }
    );
  } catch (error) {
    setQrScanError("Failed to start QR scanner: " + error.message);
  }
};
const stopQrScanner = async () => {
  if (qrScannerRef.current) {
    try {
      await qrScannerRef.current.stop();
      qrScannerRef.current = null;
    } catch (error) {
      console.log("Error stopping QR scanner:", error);
    }
  }
};

const captureQrPhoto = () => {
  // This would capture a photo from the video stream
  // For now, we'll use a placeholder
  setScannedPhoto("data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==");
};

 // Grading rows state
 const handleEditGrade = idx => {
  const currentRows = gradingRows[selectedQuickGradeId] || [];
  setEditingGradeIdx(idx);
  setEditScore(currentRows[idx].score);
  setEditNotes(currentRows[idx].notes || '');
  setEditAttachment(currentRows[idx].attachment || null);
};

const handleCancelEditGrade = () => {
  setEditingGradeIdx(null);
  setEditScore('');
  setEditNotes('');
  setEditAttachment(null);
};

const handleSaveEditGrade = idx => {
  const currentRows = gradingRows[selectedQuickGradeId] || [];
  setGradingRows(prev => ({
    ...prev,
    [selectedQuickGradeId]: currentRows.map((row, i) =>
      i === idx
        ? {
            ...row,
            score: editScore,
            notes: editNotes,
            attachment: editAttachment
          }
        : row
    )
  }));
  handleCancelEditGrade();
};

const handleDeleteGrade = idx => {
  const currentRows = gradingRows[selectedQuickGradeId] || [];
  setGradingRows(prev => ({
    ...prev,
    [selectedQuickGradeId]: currentRows.filter((_, i) => i !== idx)
  }));
};

const handleQrScanSubmit = () => {
  console.log("handleQrScanSubmit called");
  console.log("scannedStudent:", scannedStudent);
  console.log("qrScore:", qrScore);
  console.log("qrNotes:", qrNotes);
  console.log("qrAttachment:", qrAttachment);
  
  if (!scannedStudent || !qrScore) {
    alert("Please scan a valid student QR code and enter a score!");
    return;
  }
  
  // Get the currently selected assessment
  const currentAssessment = quickGradeAssessments.find(a => a.id === selectedQuickGradeId);
  if (!currentAssessment) {
    alert("Please select an assessment first!");
    return;
  }
  
  const newGrade = {
    studentId: scannedStudent.id,
    name: scannedStudent.name,
    avatar: getAvatarForUser(scannedStudent),
    score: qrScore,
    points: currentAssessment.points,
    attachment: qrAttachment,
    notes: qrNotes,
    dateGraded: new Date().toLocaleString(),
    scannedPhoto: scannedPhoto
  };
  
  console.log("Adding new grade:", newGrade);
  
  setGradingRows(prev => {
    const currentRows = prev[selectedQuickGradeId] || [];
    const filteredRows = currentRows.filter(r => String(r.studentId) !== String(newGrade.studentId));
    return {
      ...prev,
      [selectedQuickGradeId]: [...filteredRows, newGrade]
    };
  });
  
  // Reset form
  setQRScore('');
  setQRNotes('');
  setQRAttachment(null);
  setQrScanResult(null);
  // setScannedStudent(null); // <-- Do not clear scannedStudent here
  setScannedPhoto(null);
  setQrScanError(null);
  //setIsQrScannerOpen(false);
};

useEffect(() => {
  if (showCameraModal && cameraStream && videoRef.current) {
    videoRef.current.srcObject = cameraStream;
    videoRef.current.load();
    videoRef.current.onloadedmetadata = () => {
      videoRef.current.play().catch(e => setCameraError('Error playing video: ' + e.message));
    };
  }
}, [showCameraModal, cameraStream]);

  
  // Classwork creation attachment states
  const [createAttachmentDropdownOpen, setCreateAttachmentDropdownOpen] = useState(false);
  const [showCreateLinkModal, setShowCreateLinkModal] = useState(false);
  const [showCreateYouTubeModal, setShowCreateYouTubeModal] = useState(false);
  const [showCreateDriveModal, setShowCreateDriveModal] = useState(false);
  const [showCreateStudentSelectModal, setShowCreateStudentSelectModal] = useState(false);
  const [createLinkInput, setCreateLinkInput] = useState("");
  const [createYouTubeInput, setCreateYouTubeInput] = useState("");
  const [createDriveInput, setCreateDriveInput] = useState("");
  const createFileInputRef = useRef();

  // Add state for edit attachment modals
  const [showEditLinkModal, setShowEditLinkModal] = useState(false);
  const [showEditYouTubeModal, setShowEditYouTubeModal] = useState(false);
  const [showEditDriveModal, setShowEditDriveModal] = useState(false);
  const [editLinkInput, setEditLinkInput] = useState("");
  const [editYouTubeInput, setEditYouTubeInput] = useState("");
  const [editDriveInput, setEditDriveInput] = useState("");
  const [editLinkError, setEditLinkError] = useState("");
  const editFileInputRef = useRef();

  // Add state for edit announcement student selection
  // Removed showEditStudentSelectModal state - no longer needed
  // Removed editSelectedStudents state - no longer needed
  
  // Track current draft being edited
  const [currentDraftId, setCurrentDraftId] = useState(null);

  // 3. In handlePostAnnouncement, save both title and content
  const [postLoading, setPostLoading] = useState(false);
  const handlePostAnnouncement = async (e) => {
    e.preventDefault();

    // Build the data object that matches backend expectations
    const postData = {
      title: newAnnouncementTitle,
      content: newAnnouncement,
      is_draft: 0,
      is_scheduled: 0,
      scheduled_at: '',
      allow_comments: 1,
      // TODO: student_ids support will be added when new backend endpoints are ready
      // student_ids: (selectedAnnouncementStudents && selectedAnnouncementStudents.length > 0)
      //   ? selectedAnnouncementStudents
      //   : null,
    };

    console.log("Posting announcement with data:", postData);
    console.log("Attachments:", attachments);
    
    // Check if any required fields are missing or invalid
    if (!newAnnouncement.trim()) {
      alert('Please enter announcement content');
      return;
    }

    try {
      setPostLoading(true);
      let response;

      // Collect any file attachments and link attachments
      const fileAttachments = (attachments || []).filter(att => att && att.file);
      const linkAttachments = (attachments || []).filter(att => att && att.url && (att.type === 'Link' || att.type === 'YouTube' || att.type === 'Google Drive'));

      if (fileAttachments.length > 0 && linkAttachments.length > 0) {
        // Mixed attachments: files + links
        const files = fileAttachments.map(att => att.file);
        response = await apiService.createTeacherStreamPostWithMixedAttachments(code, postData, files, linkAttachments);
      } else if (fileAttachments.length > 0) {
        // Files only: backend expects keys: attachment_0, attachment_1, ...
        const files = fileAttachments.map(att => att.file);
        response = await apiService.createTeacherStreamPostWithFiles(code, postData, files);
      } else if (linkAttachments.length > 0) {
        // Links only: use new API method for multiple link attachments
        response = await apiService.createTeacherStreamPostWithLinks(code, postData, linkAttachments);
      } else {
        // No attachments - use the existing working endpoint
        response = await apiService.createClassroomStreamPost(code, postData);
      }
      console.log("Success response:", response?.data || response);
      
      // Debug: Log current draft tracking
      console.log("Current draft ID before removal:", currentDraftId);
      console.log("Current drafts before removal:", drafts);
      
      // Note: Draft removal is now handled in the backend update section below
      
      setNewAnnouncement("");
      setNewAnnouncementTitle("");
      setAttachments([]);
      setSelectedAnnouncementStudents([]);
      setPostDropdownOpen(false);
      
      // If this was posted from a draft, update the backend to mark it as posted
      if (currentDraftId) {
        try {
          console.log("Updating backend draft status for ID:", currentDraftId);
          // Update the draft status in the backend to mark it as posted
          const updateResponse = await apiService.updateClassroomStreamDraft(code, currentDraftId, {
            is_draft: 0,
            is_scheduled: 0,
            scheduled_at: ''
          });
          console.log("Backend draft update response:", updateResponse);
          
          // If backend update succeeds, also remove from frontend state immediately
          if (updateResponse?.status) {
            console.log("Backend draft status updated successfully, removing from frontend state");
            setDrafts(prev => prev.filter(d => d.id !== currentDraftId));
          }
        } catch (updateErr) {
          console.error("Error updating backend draft status:", updateErr);
          // If backend update fails, still remove from frontend state
          // The refresh will sync the state
          console.log("Backend update failed, removing from frontend state anyway");
          setDrafts(prev => prev.filter(d => d.id !== currentDraftId));
        }
        
        // Clear the current draft tracking
        setCurrentDraftId(null);
        console.log("Draft tracking cleared");
      }
      
      // Refresh both streams and drafts to ensure consistency
      fetchStreamPosts();
      fetchStreamDraftsAndScheduled();
    } catch (err) {
      console.error("Error posting announcement:", err);
      console.error("Error response:", err.response?.data);
      alert('Failed to post announcement: ' + (err.response?.data?.message || err.message || err));
    } finally {
      setPostLoading(false);
    }
  };

  // Handle creating a draft post
  const handleCreateDraft = async (e) => {
    if (e && e.preventDefault) {
      e.preventDefault();
    }

    const postData = {
      title: newAnnouncementTitle || 'Untitled Draft',
      content: newAnnouncement,
      is_draft: 1,
      is_scheduled: 0,
      scheduled_at: '',
      allow_comments: 1,
      // TODO: student_ids support will be added when new backend endpoints are ready
      // student_ids: (selectedAnnouncementStudents && selectedAnnouncementStudents.length > 0)
      //   ? selectedAnnouncementStudents
      //   : null,
    };

    if (!newAnnouncement.trim()) {
      alert('Please enter draft content');
      return;
    }

    try {
      setPostLoading(true);
      let response;

      // Use the new unified endpoint for creating drafts with student targeting
      if (attachments && attachments.length > 0) {
        // Handle attachments if any
        const fileAttachments = attachments.filter(att => att && att.file);
        const linkAttachments = attachments.filter(att => att && att.url && (att.type === 'Link' || att.type === 'YouTube' || att.type === 'Google Drive'));

        if (fileAttachments.length > 0 && linkAttachments.length > 0) {
          const files = fileAttachments.map(att => att.file);
          response = await apiService.createTeacherStreamPostWithMixedAttachments(code, postData, files, linkAttachments);
        } else if (fileAttachments.length > 0) {
          const files = fileAttachments.map(att => att.file);
          response = await apiService.createTeacherStreamPostWithFiles(code, postData, files);
        } else if (linkAttachments.length > 0) {
          response = await apiService.createTeacherStreamPostWithLinks(code, postData, linkAttachments);
        } else {
          response = await apiService.createClassroomStreamPost(code, postData);
        }
      } else {
        // No attachments - use the existing working endpoint
        response = await apiService.createClassroomStreamPost(code, postData);
      }

      if (response?.status) {
        setNewAnnouncement("");
        setNewAnnouncementTitle("");
        setAttachments([]);
        setSelectedAnnouncementStudents([]);
        setPostDropdownOpen(false);
        setFormExpanded(false);
        fetchStreamDraftsAndScheduled();
        alert('Draft saved successfully!');
      }
    } catch (err) {
      console.error("Error saving draft:", err);
      alert('Failed to save draft: ' + (err.response?.data?.message || err.message || err));
    } finally {
      setPostLoading(false);
    }
  };

  // Handle creating a scheduled post
  const handleCreateScheduled = async (e) => {
    if (e && e.preventDefault) {
      e.preventDefault();
    }

    if (!scheduleDate || !scheduleTime) {
      alert('Please select both date and time for scheduling');
      return;
    }

    const scheduledDateTime = `${scheduleDate} ${scheduleTime}:00`;

    const postData = {
      title: newAnnouncementTitle || 'Untitled Scheduled Post',
      content: newAnnouncement,
      is_draft: 0,
      is_scheduled: 1,
      scheduled_at: scheduledDateTime,
      allow_comments: 1,
      // TODO: student_ids support will be added when new backend endpoints are ready
      // student_ids: (selectedAnnouncementStudents && selectedAnnouncementStudents.length > 0)
      //   ? selectedAnnouncementStudents
      //   : null,
    };

    if (!newAnnouncement.trim()) {
      alert('Please enter scheduled post content');
      return;
    }

    try {
      setPostLoading(true);
      let response;

      // Collect any file attachments and link attachments
      const fileAttachments = (attachments || []).filter(att => att && att.file);
      const linkAttachments = (attachments || []).filter(att => att && att.url && (att.type === 'Link' || att.type === 'YouTube' || att.type === 'Google Drive'));

      if (fileAttachments.length > 0 && linkAttachments.length > 0) {
        const files = fileAttachments.map(att => att.file);
        response = await apiService.createTeacherStreamPostWithMixedAttachments(code, postData, files, linkAttachments);
      } else if (fileAttachments.length > 0) {
        const files = fileAttachments.map(att => att.file);
        response = await apiService.createTeacherStreamPostWithFiles(code, postData, files);
      } else if (linkAttachments.length > 0) {
        response = await apiService.createTeacherStreamPostWithLinks(code, postData, linkAttachments);
      } else {
        // No attachments - use the existing working endpoint
        response = await apiService.createClassroomStreamPost(code, postData);
      }

      if (response?.status) {
        setNewAnnouncement("");
        setNewAnnouncementTitle("");
        setAttachments([]);
        setSelectedAnnouncementStudents([]);
        setPostDropdownOpen(false);
        setFormExpanded(false);
        setScheduleDate("");
        setScheduleTime("");
        setShowScheduleModal(false);
        fetchStreamDraftsAndScheduled();
        alert('Post scheduled successfully!');
      }
    } catch (err) {
      console.error("Error scheduling post:", err);
      alert('Failed to schedule post: ' + (err.response?.data?.message || err.message || err));
    } finally {
      setPostLoading(false);
    }
  };

  // Handle updating a draft post (publish, keep as draft, or schedule)
  const handleUpdateDraft = async (draftId, action, scheduledDateTime = null) => {
    try {
      setPostLoading(true);
      
      const draft = drafts.find(d => d.id === draftId);
      if (!draft) {
        alert('Draft not found');
        return;
      }
      
      let postData = {
        title: draft.title || 'Untitled Post',
        content: draft.content || draft.text || '',
        allow_comments: draft.allowComments ? 1 : 0,
        // TODO: student_ids support will be added when new backend endpoints are ready
        // student_ids: draft.studentIds || draft.visible_to_student_ids || null,
      };

      if (action === 'publish') {
        postData.is_draft = 0;
        postData.is_scheduled = 0;
        postData.scheduled_at = '';
      } else if (action === 'schedule' && scheduledDateTime) {
        postData.is_draft = 0;
        postData.is_scheduled = 1;
        postData.scheduled_at = scheduledDateTime;
      } else {
        // Keep as draft
        postData.is_draft = 1;
        postData.is_scheduled = 0;
        postData.scheduled_at = '';
      }

      // Use the existing working endpoint for updating drafts
      const response = await apiService.updateClassroomStreamDraft(code, draftId, postData);
      
      if (response?.status) {
        // Remove the draft from local state immediately
        if (action === 'publish' || action === 'schedule') {
          setDrafts(prev => prev.filter(d => d.id !== draftId));
        }
        
        // Refresh both streams and drafts/scheduled
        fetchStreamPosts();
        fetchStreamDraftsAndScheduled();
        
        if (action === 'publish') {
          alert('Draft published successfully!');
        } else if (action === 'schedule') {
          alert('Draft scheduled successfully!');
        } else {
          alert('Draft updated successfully!');
        }
      }
    } catch (err) {
      console.error("Error updating draft:", err);
      alert('Failed to update draft: ' + (err.response?.data?.message || err.message || err));
    } finally {
      setPostLoading(false);
    }
  };

    // Handle editing a draft post
  const handleEditDraft = (draftId) => {
    const draft = drafts.find(d => d.id === draftId);
    if (draft) {
      // Populate the form with draft data
      setNewAnnouncementTitle(draft.title || '');
      setNewAnnouncement(draft.content || draft.text || '');

      setAttachments(draft.attachments || []);
      
      // TODO: Student targeting - will be re-enabled when backend supports student_ids
      // Handle student targeting - support both old and new field names
      // const studentIds = draft.studentIds || draft.visible_to_student_ids || [];
      // setSelectedAnnouncementStudents(Array.isArray(studentIds) ? studentIds : []);
      
      // Track this draft as being edited (don't remove it yet)
      console.log("Setting current draft ID:", draftId);
      setCurrentDraftId(draftId);
      
      // Expand the form
      setFormExpanded(true);
      
      // Scroll to the form
      if (formExpandedRef.current) {
        formExpandedRef.current.scrollIntoView({ behavior: 'smooth' });
      }
    }
  };

  // Handle scheduling a draft post
  const handleScheduleDraft = (draftId) => {
    const draft = drafts.find(d => d.id === draftId);
    if (draft) {
      // Populate the form with draft data
      setNewAnnouncementTitle(draft.title || '');
      setNewAnnouncement(draft.content || draft.text || '');

      setAttachments(draft.attachments || []);
      
      // TODO: Student targeting - will be re-enabled when backend supports student_ids
      // Handle student targeting - support both old and new field names
      // const studentIds = draft.studentIds || draft.visible_to_student_ids || [];
      // setSelectedAnnouncementStudents(Array.isArray(studentIds) ? studentIds : []);
      
      // Remove the draft from the drafts list since it's now being scheduled
      setDrafts(prev => prev.filter(d => d.id !== draftId));
      
      // Show the schedule modal
      setShowScheduleModal(true);
      
      // Close the action menu
      setDraftActionMenu(null);
    }
  };

  // Handle publishing a scheduled post now
  const handlePublishScheduledNow = async (scheduledId) => {
    try {
      setPostLoading(true);
      
      const scheduledPost = scheduledPosts.find(s => s.id === scheduledId);
      if (!scheduledPost) {
        alert('Scheduled post not found');
        return;
      }

      const postData = {
        title: scheduledPost.title,
        content: scheduledPost.content,
        is_draft: 0,
        is_scheduled: 0,
        scheduled_at: '',
        allow_comments: scheduledPost.allowComments ? 1 : 0,
        // TODO: student_ids support will be added when new backend endpoints are ready
        // student_ids: scheduledPost.studentIds || scheduledPost.visible_to_student_ids || null,
      };

      // Use the existing working endpoint for updating scheduled posts
      const response = await apiService.updateClassroomStreamDraft(code, scheduledId, postData);
      
      if (response?.status) {
        // Refresh both streams and drafts/scheduled
        fetchStreamPosts();
        fetchStreamDraftsAndScheduled();
        alert('Scheduled post published now!');
      }
    } catch (err) {
      console.error("Error publishing scheduled post:", err);
      alert('Failed to publish scheduled post: ' + (err.response?.data?.message || err.message || err));
    } finally {
      setPostLoading(false);
    }
  };

  // 3. Add handler to post a comment (teacher endpoint)
  const handlePostComment = async (announcementId) => {
    const comment = commentInputs[announcementId]?.trim();
    if (!comment) return;
    try {
      // Post to teacher stream comment endpoint
      const apiResp = await apiService.addTeacherStreamComment(code, announcementId, comment);
      // Resolve the created comment's id and fields from API response when available
      const createdId = apiResp?.data?.id || apiResp?.data?.comment_id || apiResp?.comment_id || apiResp?.id || null;
      const createdText = apiResp?.data?.comment || apiResp?.data?.text || apiResp?.comment || apiResp?.text || comment;
      const createdDate = apiResp?.data?.created_at || apiResp?.created_at || new Date().toISOString();

      // Current user info for author and avatar
      const me = currentUserProfile || (() => {
        try {
          const stored = localStorage.getItem('user') || localStorage.getItem('scms_logged_in_user');
          return stored ? JSON.parse(stored) : null;
        } catch (_) { return null; }
      })();
      const meName = me?.full_name || me?.name || me?.user_name || currentUser || 'You';
      const mePic = me?.profile_pic || me?.profile_picture || me?.avatar || null;
      setAnnouncements(prev => prev.map(a =>
        a.id === announcementId
          ? { ...a, comments: (a.comments || []).concat({ id: createdId, text: createdText, author: meName, date: createdDate, profile_pic: mePic }) }
          : a
      ));
      setCommentInputs(inputs => ({ ...inputs, [announcementId]: "" }));
    } catch (error) {
      console.error('Failed to post comment:', error);
      alert(error.message || 'Failed to post comment');
    }
  };

  // 2. Add a function to handle preview open
  const handlePreviewAttachment = async (att) => {
    console.log('handlePreviewAttachment called with:', att);
    setPreviewAttachment(att);
    setPreviewText("");
    setPreviewModalOpen(true);
    
    // Get file extension
    const ext = att.name ? att.name.split('.').pop().toLowerCase() : '';
    const fileName = att.name || '';
    console.log('File extension:', ext, 'File name:', fileName);
    
    // Handle different file types
    if (ext === 'txt' || ext === 'csv' || ext === 'md') {
      // Text files - read as text
      if (att.file) {
        try {
          const text = await att.file.text();
          setPreviewText(text);
        } catch (error) {
          console.error('Error reading text file from file object:', error);
          setPreviewText('Error reading file content');
        }
      } else if (att.url) {
        try {
          const response = await fetch(att.url);
          if (!response.ok) {
            throw new Error(`HTTP ${response.status}: ${response.statusText}`);
          }
          const text = await response.text();
          setPreviewText(text);
        } catch (error) {
          console.error('Error reading text file from URL:', error);
          setPreviewText('Error reading file content');
        }
      }
    } else if (['jpg', 'jpeg', 'png', 'gif', 'webp', 'bmp', 'svg'].includes(ext)) {
      // Image files - can be previewed directly
      setPreviewText(null);
    } else if (ext === 'pdf') {
      // PDF files - can be embedded in iframe
      setPreviewText(null);
    } else if (['mp3', 'wav', 'ogg', 'aac', 'flac'].includes(ext)) {
      // Audio files - handled by the audio player
      setPreviewText(null);
    } else {
      // Other file types - no preview available
      setPreviewText(null);
    }
  };

  // Fetch stream posts from API
  const fetchStreamPosts = async () => {
    if (!code) return;
    setStreamLoading(true);
    setStreamError(null);
    try {
      // Choose endpoint based on role; student should use the student stream API
      let isStudent = false;
      try {
        const storedUser = localStorage.getItem('user');
        if (storedUser) {
          const parsed = JSON.parse(storedUser);
          isStudent = (parsed.role || '').toLowerCase() === 'student';
        }
      } catch (_) {}

      const response = isStudent
        ? await apiService.getStudentStreamPosts(code)
        : await apiService.getClassroomStream(code);
      if (response?.status && response?.data) {
        // Derive a clean site base for serving uploaded files
        // Strip both "/index.php/api" and "/api" if present, and any trailing slash
        const rawBase = (process.env.REACT_APP_API_BASE_URL || 'https://scms-backend.up.railway.app');
        const base = rawBase
          .replace('/index.php/api', '')
          .replace('/api', '')
          .replace(/\/$/, '');

        const transformedPosts = response.data.map(post => {
          // Normalize multiple attachments from either `attachments` array or JSON string in `attachment_url`
          let normalizedAttachments = [];

          if (Array.isArray(post.attachments) && post.attachments.length > 0) {
            normalizedAttachments = post.attachments.map(att => {
              let attachmentType = att.attachment_type || att.file_type || 'file';
              let attachmentUrl = att.file_path ? `${base}/${att.file_path}` : (att.serving_url || '');
              
              // Detect YouTube and Google Drive links to set proper type
              if (attachmentUrl.includes('youtube.com') || attachmentUrl.includes('youtu.be')) {
                attachmentType = 'YouTube';
              } else if (attachmentUrl.includes('drive.google.com')) {
                attachmentType = 'Google Drive';
              } else if (attachmentUrl.startsWith('http') && attachmentType === 'link') {
                attachmentType = 'Link';
              }
              
              return {
                name: att.original_name || att.file_name || (att.file_path || '').split('/').pop(),
                // Prefer direct uploaded path to avoid redirect links
                url: attachmentUrl,
                type: attachmentType,
              };
            }).filter(a => a.url);
          } else if (
            (post.attachment_type === 'multiple' || (typeof post.attachment_url === 'string' && post.attachment_url.trim().startsWith('['))) &&
            typeof post.attachment_url === 'string'
          ) {
            try {
              const parsed = JSON.parse(post.attachment_url);
              const arr = Array.isArray(parsed) ? parsed : [parsed];
              normalizedAttachments = arr.map(att => {
                let attachmentType = att.attachment_type || att.file_type || 'file';
                let attachmentUrl = att.file_path ? `${base}/${att.file_path}` : (att.serving_url || '');
                
                // Detect YouTube and Google Drive links to set proper type
                if (attachmentUrl.includes('youtube.com') || attachmentUrl.includes('youtu.be')) {
                  attachmentType = 'YouTube';
                } else if (attachmentUrl.includes('drive.google.com')) {
                  attachmentType = 'Google Drive';
                } else if (attachmentUrl.startsWith('http') && attachmentType === 'link') {
                  attachmentType = 'Link';
                }
                
                return {
                  name: att.original_name || att.file_name || (att.file_path || '').split('/').pop(),
                  url: attachmentUrl,
                  type: attachmentType,
                };
              }).filter(a => a.url);
            } catch (e) {
              // Fall back to single attachment logic below
            }
          }

          // If still empty, check single file fields
          if (normalizedAttachments.length === 0 && (post.attachment_url || post.attachment_serving_url)) {
            const attachmentUrl = post.attachment_url || post.attachment_serving_url || '';
            let attachmentType = post.attachment_type || post.attachment_file_type || 'file';
            
            // Detect YouTube and Google Drive links to set proper type
            if (attachmentUrl.includes('youtube.com') || attachmentUrl.includes('youtu.be')) {
              attachmentType = 'YouTube';
            } else if (attachmentUrl.includes('drive.google.com')) {
              attachmentType = 'Google Drive';
            } else if (attachmentUrl.startsWith('http') && attachmentType === 'link') {
              attachmentType = 'Link';
            }
            
            normalizedAttachments = [{
              name: (post.original_name || attachmentUrl.split('/').pop()),
              // Prefer direct uploads path if provided
              url: (attachmentUrl && !attachmentUrl.startsWith('http'))
                ? `${base}/${attachmentUrl}`
                : attachmentUrl,
              type: attachmentType,
            }].filter(a => a.url);
          }

          return {
            id: post.id,
            title: post.title,
            content: post.content,
            author: post.user_name,
            date: post.created_at,
            isPinned: post.is_pinned === '1',
            reactions: { like: post.like_count || 0, likedBy: [] },
            comments: [],
            user_avatar: post.user_avatar,
            attachments: normalizedAttachments,
          };
        });

        // Set initial posts quickly
        setAnnouncements(transformedPosts);

        // Fetch comments for each post to get accurate counts upfront
        try {
          const commentsArrays = await Promise.all(
            transformedPosts.map(async (p) => {
              try {
                const res = await apiService.getTeacherStreamComments(code, p.id);
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
            setAnnouncements(prev => prev.map(a => {
              const found = commentsArrays.find(x => x.id === a.id);
              return found ? { ...a, comments: found.comments } : a;
            }));
          }
        } catch (_e) {
          // ignore count hydration failures
        }
      } else {
        setStreamError('No data received from server');
      }
    } catch (error) {
      console.error('Error fetching stream posts:', error);
      setStreamError(error.message || 'Failed to fetch stream posts');
      // Fallback to sample data if API fails
      setAnnouncements(sampleAnnouncements);
    } finally {
      setStreamLoading(false);
    }
  };

  useEffect(() => {
    fetchStreamPosts();
    fetchStreamDraftsAndScheduled();
    // eslint-disable-next-line
  }, [code]);

  // Fetch stream drafts and scheduled posts from API
  const fetchStreamDraftsAndScheduled = async () => {
    if (!code) return;
    
    try {
      // Fetch drafts
      const draftsResponse = await apiService.getClassroomStreamDrafts(code);
      if (draftsResponse?.status && draftsResponse?.data) {
        const transformedDrafts = draftsResponse.data.map(draft => ({
          id: draft.id,
          title: draft.title || 'Untitled Draft',
          content: draft.content || draft.text || '',
          lastEdited: draft.created_at || draft.updated_at || new Date().toISOString(),
          attachments: draft.attachments || [],

          studentIds: draft.student_ids ? JSON.parse(draft.student_ids) : [],
          api_response: draft
        }));
        setDrafts(transformedDrafts);
      }

      // Fetch scheduled posts
      const scheduledResponse = await apiService.getClassroomStreamScheduled(code);
      if (scheduledResponse?.status && scheduledResponse?.data) {
        const transformedScheduled = scheduledResponse.data.map(scheduled => ({
          id: scheduled.id,
          title: scheduled.title || 'Untitled Scheduled Post',
          content: scheduled.content || scheduled.text || '',
          scheduledFor: {
            date: scheduled.scheduled_at ? scheduled.scheduled_at.split(' ')[0] : '',
            time: scheduled.scheduled_at ? scheduled.scheduled_at.split(' ')[1] : '',
            fullDateTime: scheduled.scheduled_at
          },
          lastEdited: scheduled.created_at || scheduled.updated_at || new Date().toISOString(),
          attachments: scheduled.attachments || [],

          studentIds: scheduled.student_ids ? JSON.parse(scheduled.student_ids) : [],
          api_response: scheduled
        }));
        setScheduledPosts(transformedScheduled);
      }
    } catch (error) {
      console.error('Error fetching stream drafts and scheduled posts:', error);
      // Keep existing local state if API fails
    }
  };

  useEffect(() => {
    // Check if user is a student
    const user = localStorage.getItem('user');
    let userRole = 'teacher';
    if (user) {
      try {
        const userData = JSON.parse(user);
        userRole = userData.role || 'teacher';
      } catch (error) {
        console.error('Error parsing user data:', error);
      }
    }
    
    // Set the user role state
    setUserRole(userRole);

    if (userRole === 'student') {
      // For students, try to find the class in their enrolled classes
      const foundClass = studentClasses.find(cls => cls.code === code);
      if (foundClass) {
        const classroomData = {
          id: foundClass.id,
          name: foundClass.name,
          section: foundClass.section,
          subject: foundClass.subject,
          code: foundClass.code,
          semester: foundClass.semester,
          schoolYear: foundClass.schoolYear,
          teacherName: foundClass.teacherName,
          studentCount: 0, // Students don't see student count
          theme: foundClass.theme
        };
        setClassInfo(classroomData);
      } else {
        // If not found in student classes, try to fetch from API
        const fetchClassroomFromAPI = async () => {
          try {
            const response = await apiService.getClassroomByCode(code);
            if (response.status && response.data) {
              const classroomData = {
                id: 1,
                name: response.data.subject_name,
                section: response.data.section_name,
                subject: response.data.subject_name,
                code: response.data.class_code,
                semester: response.data.semester,
                schoolYear: response.data.school_year,
                teacherName: response.data.teacher_name,
                studentCount: 0,
                theme: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)"
              };
              setClassInfo(classroomData);
            } else {
              setClassInfo(null);
            }
          } catch (error) {
            console.error('Error fetching classroom from API:', error);
            setClassInfo(null);
          }
        };
        
        fetchClassroomFromAPI();
      }
    } else {
      // For teachers, use the existing logic
      const classes = JSON.parse(localStorage.getItem("teacherClasses")) || [];
      const foundClass = classes.find(cls => cls.code === code);
      
      if (foundClass) {
        setClassInfo(foundClass);
      } else {
        // If not found in localStorage, try to fetch from API
        const fetchClassroomFromAPI = async () => {
          try {
            const response = await apiService.getClassroomByCode(code);
            if (response.status && response.data) {
              const classroomData = {
                id: 1,
                name: response.data.subject_name,
                section: response.data.section_name,
                subject: response.data.subject_name,
                code: response.data.class_code,
                semester: response.data.semester,
                schoolYear: response.data.school_year,
                studentCount: response.data.student_count || 0,
                theme: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)"
              };
              setClassInfo(classroomData);
            } else {
              // If API also fails, show error
              setClassInfo(null);
            }
          } catch (error) {
            console.error('Error fetching classroom from API:', error);
            setClassInfo(null);
          }
        };
        
        fetchClassroomFromAPI();
      }
    }
  }, [code, studentClasses]);

  // Function to fetch student classes
  const fetchStudentClasses = async () => {
    setLoadingStudentClasses(true);
    setStudentClassesError(null);
    try {
      const response = await apiService.getStudentClasses();
      if (response.status && response.data) {
        console.log('Student classes fetched:', response.data);
        setStudentClasses(response.data);
      } else {
        setStudentClassesError('No data received from server');
        setStudentClasses([]);
      }
    } catch (error) {
      console.error('Error fetching student classes:', error);
      setStudentClassesError(error.message || 'Failed to fetch student classes');
      setStudentClasses([]);
    } finally {
      setLoadingStudentClasses(false);
    }
  };

  // Fetch enrolled students when component mounts
  useEffect(() => {
    console.log('useEffect triggered with code:', code);
    console.log('Current localStorage token:', localStorage.getItem('token'));
    console.log('Current localStorage user:', localStorage.getItem('user'));
    
    if (code) {
      console.log('Calling fetchEnrolledStudents for code:', code);
      fetchEnrolledStudents();
    }
  }, [code]);

  // Fetch student classes when component mounts (for student role)
  useEffect(() => {
    // Check if user is a student
    const user = localStorage.getItem('user');
    if (user) {
      try {
        const userData = JSON.parse(user);
        if (userData.role === 'student') {
          console.log('User is a student, fetching classes...');
          setIsStudent(true);
          fetchStudentClasses();
        }
      } catch (error) {
        console.error('Error parsing user data:', error);
      }
    }
  }, []);

  // Ensure all announcements have reactions property
  useEffect(() => {
    setAnnouncements(prev => prev.map(announcement => {
      if (!announcement.reactions) {
        return { ...announcement, reactions: { like: 0, likedBy: [] } };
      }
      if (!announcement.reactions.likedBy) {
        return { ...announcement, reactions: { ...announcement.reactions, likedBy: [] } };
      }
      return announcement;
    }));
  }, []);

  useEffect(() => {
    if (!emojiPickerOpen) return;
    function handleClickOutside(event) {
      if (emojiPickerRef.current && !emojiPickerRef.current.contains(event.target)) {
        setEmojiPickerOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [emojiPickerOpen]);

  // Post dropdown click outside handler
  useEffect(() => {
    if (!postDropdownOpen) return;
    function handlePostDropdownClickOutside(event) {
      // Check if click is outside the post dropdown and form area
      const postDropdown = event.target.closest('.post-dropdown-container');
      const postForm = event.target.closest('.post-form-container');
      if (!postDropdown && !postForm) {
        setPostDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handlePostDropdownClickOutside);
    return () => document.removeEventListener("mousedown", handlePostDropdownClickOutside);
  }, [postDropdownOpen]);

  // Scheduled action menu click outside handler
  useEffect(() => {
    if (scheduledActionMenu === null) return;
    function handleScheduledActionMenuClickOutside(event) {
      // Check if click is outside the scheduled action menu
      const actionMenu = event.target.closest('.scheduled-action-menu-container');
      if (!actionMenu) {
        setScheduledActionMenu(null);
      }
    }
    document.addEventListener("mousedown", handleScheduledActionMenuClickOutside);
    return () => document.removeEventListener("mousedown", handleScheduledActionMenuClickOutside);
  }, [scheduledActionMenu]);

  // Draft action menu click outside handler
  useEffect(() => {
    if (draftActionMenu === null) return;
    function handleDraftActionMenuClickOutside(event) {
      // Check if click is outside the draft action menu
      const actionMenu = event.target.closest('.draft-action-menu-container');
      if (!actionMenu) {
        setDraftActionMenu(null);
      }
    }
    document.addEventListener("mousedown", handleDraftActionMenuClickOutside);
    return () => document.removeEventListener("mousedown", handleDraftActionMenuClickOutside);
  }, [draftActionMenu]);

  // Task emoji picker click outside handler
  useEffect(() => {
    if (!taskEmojiPickerOpen) return;
    function handleTaskEmojiClickOutside(event) {
      if (taskEmojiPickerRef.current && !taskEmojiPickerRef.current.contains(event.target)) {
        setTaskEmojiPickerOpen(false);
      }
    }
    document.addEventListener("mousedown", handleTaskEmojiClickOutside);
    return () => document.removeEventListener("mousedown", handleTaskEmojiClickOutside);
  }, [taskEmojiPickerOpen]);

  // Cleanup visualizer on unmount
  useEffect(() => {
    return () => {
      if (visualizerIntervalRef.current) {
        clearInterval(visualizerIntervalRef.current);
      }
    };
  }, []);

  // Start camera when modal opens
  useEffect(() => {
    if (showCameraModal && !cameraStream) {
      startCamera();
    }
  }, [showCameraModal]);

  // Restart camera when mode changes
  useEffect(() => {
    if (showCameraModal && cameraStream) {
      stopCamera();
      setTimeout(() => startCamera(), 100);
    }
  }, [cameraMode]);

  // Cleanup camera on unmount
  useEffect(() => {
    return () => {
      stopCamera();
    };
  }, []);

  // Fetch grades data for Grades tab
  useEffect(() => {
    if (activeTab === 'grades' && code) {
      console.log('Grades tab is active, fetching grades data for class:', code);
      setLoadingGrades(true);
      setGradesError(null);
      
      apiService.get(`/api/teacher/classroom/${code}/grades`)
        .then(response => {
          console.log('Grades API Response:', response);
          if (response.status && response.data) {
            setGradesData(response.data);
          } else {
            setGradesError('Failed to load grades data');
          }
        })
        .catch(err => {
          console.error('Error fetching grades data:', err);
          setGradesError('Failed to load grades data');
        })
        .finally(() => setLoadingGrades(false));
    }
  }, [activeTab, code]);

  // Fetch drafts and scheduled tasks when component mounts
  useEffect(() => {
    if (code) {
      console.log('Fetching drafts and scheduled tasks for class:', code);
      
      // Fetch drafts
      setLoadingDrafts(true);
      apiService.getTaskDrafts(code)
        .then(response => {
          console.log('Drafts API Response:', response);
          if (response.status && response.data) {
            const drafts = response.data.map(draft => ({
              id: draft.task_id,
              title: draft.title,
              text: draft.instructions,
              type: draft.type,
              points: draft.points,
              dueDate: draft.due_date,

              lastEdited: draft.created_at,
              attachments: draft.attachment_url ? [{ 
                url: draft.attachment_url, 
                name: draft.attachment_url.split('/').pop(),
                type: 'file'
              }] : [],
              visibleTo: draft.assigned_students || [],
              status: 'draft',
              api_response: draft
            }));
            setTaskDrafts(drafts);
          }
        })
        .catch(err => {
          console.error('Error fetching drafts:', err);
          // If endpoint doesn't exist, keep existing drafts in local state
          console.log('Drafts endpoint not available, using local state');
        })
        .finally(() => setLoadingDrafts(false));

      // Fetch scheduled tasks
      setLoadingScheduled(true);
      apiService.getScheduledTasks(code)
        .then(response => {
          console.log('Scheduled Tasks API Response:', response);
          if (response.status && response.data) {
            const scheduled = response.data.map(task => ({
              id: task.task_id,
              title: task.title,
              text: task.instructions,
              type: task.type,
              points: task.points,
              dueDate: task.due_date,

              scheduledFor: task.scheduled_at,
              lastEdited: task.created_at,
              attachments: task.attachment_url ? [{ 
                url: task.attachment_url, 
                name: task.attachment_url.split('/').pop(),
                type: 'file'
              }] : [],
              visibleTo: task.assigned_students || [],
              status: 'scheduled',
              api_response: task
            }));
            setTaskScheduled(scheduled);
          }
        })
        .catch(err => {
          console.error('Error fetching scheduled tasks:', err);
          // If endpoint doesn't exist, keep existing scheduled tasks in local state
          console.log('Scheduled tasks endpoint not available, using local state');
        })
        .finally(() => setLoadingScheduled(false));
    }
  }, [code]);

  // QR Scanner useEffect
  useEffect(() => {
    if (isQrScannerOpen) {
      startQrScanner();
    } else {
      stopQrScanner();
    }
    return () => {
      stopQrScanner();
    };
  }, [isQrScannerOpen]);

  const handleCopyCode = () => {
    if (classInfo) {
      navigator.clipboard.writeText(classInfo.code);
      setCopied(true);
      setTooltipHover(true);
      setTimeout(() => {
        setCopied(false);
        setTooltipHover(false);
      }, 1200);
    }
  };

  const handleSelectTheme = (themeValue) => {
    setSelectedTheme(themeValue);
    localStorage.setItem(`classroom_theme_${code}`, themeValue);
    setShowThemeModal(false);
  };





  const handleAddAttachment = (type) => {
    if (type === "Google Drive") {
      setShowDriveModal(true);
    } else if (type === "Link") {
      setShowLinkModal(true);
    } else if (type === "File") {
      fileInputRef.current.click();
    } else if (type === "YouTube") {
      setShowYouTubeModal(true);
    }
  };

  const handleFileChange = (e) => {
    const files = Array.from(e.target.files);
    if (files.length > 0) {
      setAttachments(prev => [...prev, ...files.map(file => ({ name: file.name, file }))]);
    }
    e.target.value = "";
  };

  const handleAddLink = () => {
    let url = linkInput.trim();
    setLinkError("");
    if (!url) {
      setLinkError("Please enter a link URL");
      return;
    }
    let formatted = url;
    let valid = false;
    try {
      const urlObj = new URL(formatted);
      if (urlObj.protocol && urlObj.hostname) valid = true;
    } catch {}
    if (!valid) {
      if (/[^a-zA-Z0-9.-]/.test(url)) {
        setLinkError("Please enter a valid URL or word (no spaces or special characters)");
        return;
      }
      formatted = `https://${url}.com`;
      try {
        const urlObj = new URL(formatted);
        if (urlObj.protocol && urlObj.hostname) valid = true;
      } catch {}
    }
    if (!valid) {
      setLinkError("Could not autoformat to a valid link. Please check your input.");
      return;
    }
    if (editingClassworkId) {
      setEditClassworkAttachments(prev => [...prev, { type: "Link", url: formatted }]);
    } else {
      setAttachments(prev => [...prev, { type: "Link", url: formatted }]);
    }
    setLinkInput("");
    setLinkError("");
    setShowLinkModal(false);
  };

  const handleAddYouTube = () => {
    if (youtubeInput.trim()) {
      setAttachments([...attachments, { type: "YouTube", url: youtubeInput }]);
      setYouTubeInput("");
      setShowYouTubeModal(false);
    }
  };

  const handleAddDrive = () => {
    const url = (driveInput || '').trim();
    if (!url) return;
    // Basic formatting: ensure it looks like a URL
    let formatted = url;
    if (!/^https?:\/\//i.test(formatted)) {
      formatted = `https://${formatted}`;
    }
    setAttachments(prev => [...prev, { type: 'Google Drive', url: formatted }]);
    setDriveInput('');
    setShowDriveModal(false);
  };
  const handleRemoveAttachment = (idx) => {
    setAttachments(attachments.filter((_, i) => i !== idx));
  };
  const handleSchedule = (e) => {
    e.preventDefault();
    if (newAnnouncement.trim() && scheduleDate && scheduleTime) {
      setScheduledPosts([
        ...scheduledPosts,
        {
          text: newAnnouncement,
          attachments,
          year: selectedYear,
          audience: selectedAudience,
          schedule: `${scheduleDate} ${scheduleTime}`
        }
      ]);
      setShowScheduleModal(false);
      setNewAnnouncement("");
      setAttachments([]);
      setScheduleDate("");
      setScheduleTime("");
      alert("Post scheduled!");
    }
  };

  const handleSaveDraft = () => {
    if (newAnnouncement.trim() || newAnnouncementTitle.trim() || attachments.length > 0) {
      setDrafts([
        ...drafts,
        {
          text: newAnnouncement,
          title: newAnnouncementTitle,
          attachments,
          year: selectedYear,
          audience: selectedAudience,
          visibleTo: selectedAnnouncementStudents,
          lastEdited: new Date().toISOString()
        }
      ]);
      setNewAnnouncement("");
      setNewAnnouncementTitle("");
      setAttachments([]);
      setSelectedAnnouncementStudents([]);
      alert("Draft saved!");
    }
  };

  const handleScheduleStreamPost = () => {
    if (newAnnouncement.trim() || newAnnouncementTitle.trim() || attachments.length > 0) {
      if (scheduleDate && scheduleTime) {
        // Get current logged-in user information
        let currentUserName = 'You';
        let currentUserProfilePic = null;
        try {
          const stored = localStorage.getItem('user') || localStorage.getItem('scms_logged_in_user');
          if (stored) {
            const u = JSON.parse(stored);
            currentUserName = u.full_name || u.name || u.user_name || 'You';
            currentUserProfilePic = u.profile_pic || u.profile_picture || u.avatar || null;
          }
        } catch (_) {}

        setScheduled([
          ...scheduled,
          {
            id: Date.now() + Math.random(),
            title: newAnnouncementTitle || 'Untitled Announcement',
            content: newAnnouncement,
            author: currentUserName,
            authorProfilePic: currentUserProfilePic,
            attachments: attachments || [],
            year: selectedYear,
            audience: selectedAudience,
            visibleTo: selectedAnnouncementStudents,

            scheduledFor: {
              date: scheduleDate,
              time: scheduleTime
            },
            lastEdited: new Date().toISOString(),
            // Store metadata for future reference
            metadata: {
              originalFormData: {
                title: newAnnouncementTitle,
                content: newAnnouncement,
    
                attachments: attachments,
                selectedStudents: selectedAnnouncementStudents
              }
            }
          }
        ]);
        
        // Clear form and close modal
        setNewAnnouncement("");
        setNewAnnouncementTitle("");
        setAttachments([]);
        setSelectedAnnouncementStudents([]);
        setScheduleDate("");
        setScheduleTime("");
        setShowScheduleModal(false);
        setPostDropdownOpen(false);
        
        alert("Post scheduled successfully!");
      }
    }
  };

  const handlePublishNow = (idx) => {
    const scheduledPost = scheduled[idx];
    if (scheduledPost) {
      // Get current logged-in user information
      let currentUserName = 'You';
      let currentUserProfilePic = null;
      try {
        const stored = localStorage.getItem('user') || localStorage.getItem('scms_logged_in_user');
        if (stored) {
          const u = JSON.parse(stored);
          currentUserName = u.full_name || u.name || u.user_name || 'You';
          currentUserProfilePic = u.profile_pic || u.profile_picture || u.avatar || null;
        }
      } catch (_) {}

      // Create new announcement from scheduled post with all details
      const newAnnouncement = {
        id: Date.now() + Math.random(),
        title: scheduledPost.title || scheduledPost.content || 'Scheduled Announcement',
        content: scheduledPost.content || scheduledPost.text || '',
        author: currentUserName,
        authorProfilePic: currentUserProfilePic,
        date: new Date().toISOString(),
        isPinned: false,
        reactions: { like: 0, likedBy: [] },
        comments: [],
        attachments: scheduledPost.attachments || [],
        year: scheduledPost.year,
        audience: scheduledPost.audience,
        visibleTo: scheduledPost.visibleTo || [],
     // Default to allowing comments
        // Include any additional metadata from the scheduled post
        ...(scheduledPost.metadata && { metadata: scheduledPost.metadata })
      };
      
      // Add to announcements and remove from scheduled
      setAnnouncements(prev => [newAnnouncement, ...prev]);
      setScheduled(prev => prev.filter((_, i) => i !== idx));
      setScheduledActionMenu(null);
      
      alert("Post published now!");
    }
  };

  const handleEditScheduled = (idx) => {
    const scheduledPost = scheduledPosts[idx];
    if (scheduledPost) {
      // Load scheduled post into form for editing with all details
      setNewAnnouncementTitle(scheduledPost.title || '');
      setNewAnnouncement(scheduledPost.content || scheduledPost.text || '');
      setAttachments(scheduledPost.attachments || []);
      
      // TODO: Student targeting - will be re-enabled when backend supports student_ids
      // Handle student targeting - support both old and new field names
      // const studentIds = scheduledPost.studentIds || scheduledPost.visible_to_student_ids || scheduledPost.visibleTo || [];
      // setSelectedAnnouncementStudents(Array.isArray(studentIds) ? studentIds : []);
      

      
      // Remove from scheduled posts and open form
      setScheduledPosts(prev => prev.filter((_, i) => i !== idx));
      setFormExpanded(true);
      setShowScheduledCollapse(false);
      setScheduledActionMenu(null);
      
      alert("Scheduled post loaded for editing. Update and schedule again.");
    }
  };

  const handleDeleteScheduled = async (idx) => {
    if (window.confirm("Are you sure you want to delete this scheduled post?")) {
      const scheduledPost = scheduledPosts[idx];
      if (scheduledPost && scheduledPost.id) {
        try {
          // Call the backend delete endpoint using the API service method
          const response = await apiService.deleteClassroomStreamPost(code, scheduledPost.id);
          
          if (response?.status) {
            // Remove from local state on successful deletion
            setScheduledPosts(prev => prev.filter((_, i) => i !== idx));
            setScheduledActionMenu(null);
            alert("Scheduled post deleted successfully!");
          } else {
            alert('Failed to delete scheduled post: ' + (response?.message || 'Unknown error'));
          }
        } catch (err) {
          console.error("Error deleting scheduled post:", err);
          if (err.response?.status === 404) {
            alert('Scheduled post not found or already deleted.');
          } else if (err.response?.status === 403) {
            alert('You do not have permission to delete this scheduled post.');
          } else {
            alert('Failed to delete scheduled post: ' + (err.response?.data?.message || err.message || err));
          }
        }
      } else {
        // If no valid ID, just remove from local state
        setScheduledPosts(prev => prev.filter((_, i) => i !== idx));
        setScheduledActionMenu(null);
        alert("Scheduled post removed from view. Note: Backend delete functionality will be available soon.");
      }
    }
  };

  const handleLoadDraft = (idx) => {
    const draft = drafts[idx];
    if (draft) {
      // Load draft into form for editing
      setNewAnnouncementTitle(draft.title || '');
      setNewAnnouncement(draft.content || draft.text || '');
      setAttachments(draft.attachments || []);
      
      // TODO: Student targeting - will be re-enabled when backend supports student_ids
      // Handle student targeting - support both old and new field names
      // const studentIds = draft.studentIds || draft.visible_to_student_ids || draft.visibleTo || [];
      // setSelectedAnnouncementStudents(Array.isArray(studentIds) ? studentIds : []);
      
      // Remove from drafts and open form
      setDrafts(prev => prev.filter((_, i) => i !== idx));
      setFormExpanded(true);
      setShowDraftsCollapse(false);
      
      alert("Draft loaded for editing!");
    }
  };

  const handleDeleteDraft = async (idx) => {
    if (window.confirm("Are you sure you want to delete this draft?")) {
      const draft = drafts[idx];
      if (draft && draft.id) {
        try {
          // Call the backend delete endpoint using the API service method
          const response = await apiService.deleteClassroomStreamPost(code, draft.id);
          
          if (response?.status) {
            // Remove from local state on successful deletion
            setDrafts(prev => prev.filter((_, i) => i !== idx));
            alert("Draft deleted successfully!");
          } else {
            alert('Failed to delete draft: ' + (response?.message || 'Unknown error'));
          }
        } catch (err) {
          console.error("Error deleting draft:", err);
          if (err.response?.status === 404) {
            alert('Draft not found or already deleted.');
          } else if (err.response?.status === 403) {
            alert('You do not have permission to delete this draft.');
          } else {
            alert('Failed to delete draft: ' + (err.response?.data?.message || err.message || err));
        }
        }
      } else {
        // If no valid ID, just remove from local state
        setDrafts(prev => prev.filter((_, i) => i !== idx));
        alert("Draft removed from view. Note: Backend delete functionality will be available soon.");
      }
    }
  };

  const handleCreateChange = e => setCreateForm({ ...createForm, [e.target.name]: e.target.value });
  const handleInviteChange = e => setInviteForm({ ...inviteForm, [e.target.name]: e.target.value });
  const handleGradeChange = e => setGradeForm({ ...gradeForm, [e.target.name]: e.target.value });

  const handleCreateSubmit = e => {
    e.preventDefault();
    if (createForm.type && createForm.title) {
      const newClasswork = {
        id: Date.now(),
        ...createForm,
        author: "Prof. Smith",
        date: new Date().toISOString(),
        comments: [],
        // Only include dueDate and points if they have values
        ...(createForm.dueDate && { dueDate: createForm.dueDate }),
        ...(createForm.points && { points: createForm.points })
      };
      
      setAssignments([...assignments, newClasswork]);
      setShowCreateModal(false);
      setCreateForm({ type: '', title: '', dueDate: '', points: '', details: '', attachments: [], assignedStudents: [] });
      setCreateType('');
    }
  };
  const handleInviteSubmit = e => {
    e.preventDefault();
    if (inviteForm.name && inviteForm.email) {
      setStudents([
        ...students,
        {
          id: Date.now(),
          name: inviteForm.name,
          email: inviteForm.email,
          role: 'Student',
          joinedDate: new Date().toISOString().split('T')[0]
        }
      ]);
      setShowInviteModal(false);
      setInviteForm({ name: '', email: '' });
    }
  };
  const handleAddGradeSubmit = e => {
    e.preventDefault();
    if (gradeForm.studentId && gradeForm.work && gradeForm.grade) {
      const student = students.find(s => String(s.id) === gradeForm.studentId);
      const workKey = gradeForm.work;
      let updated = false;
      const newGrades = grades.map(g => {
        if (String(g.studentId) === gradeForm.studentId) {
          updated = true;
          const updatedGrade = { ...g, [workKey]: Number(gradeForm.grade) };
          // Recalculate average
          const works = ['assignment1', 'quiz1', 'project1'];
          const sum = works.reduce((acc, key) => acc + (updatedGrade[key] || 0), 0);
          updatedGrade.average = sum / works.length;
          return updatedGrade;
        }
        return g;
      });
      if (!updated && student) {
        // New grade entry for student
        const newGrade = {
          studentId: student.id,
          studentName: student.name,
          assignment1: 0,
          quiz1: 0,
          project1: 0,
          [workKey]: Number(gradeForm.grade)
        };
        const works = ['assignment1', 'quiz1', 'project1'];
        const sum = works.reduce((acc, key) => acc + (newGrade[key] || 0), 0);
        newGrade.average = sum / works.length;
        newGrades.push(newGrade);
      }
      setGrades(newGrades);
      setShowAddGradeModal(false);
      setGradeForm({ studentId: '', work: '', grade: '' });
    }
  };

  // Topic handlers
  const handleAddTopic = () => {
    if (topicInput.trim()) {
      setTopics([{ id: Date.now(), name: topicInput }, ...topics]);
      setTopicInput("");
      setShowTopicModal(false);
    }
  };
  const handleDeleteTopic = (id) => {
    setTopics(topics.filter(t => t.id !== id));
    if (selectedTopic === id) setSelectedTopic(null);
  };
  const handleRenameTopic = (id) => {
    setTopics(topics.map(t => t.id === id ? { ...t, name: topicEditInput } : t));
    setTopicEditId(null);
    setTopicEditInput("");
  };
  const handleMoveTopic = (id, dir) => {
    const idx = topics.findIndex(t => t.id === id);
    if (idx < 0) return;
    const newTopics = [...topics];
    if (dir === 'up' && idx > 0) {
      [newTopics[idx - 1], newTopics[idx]] = [newTopics[idx], newTopics[idx - 1]];
    } else if (dir === 'down' && idx < newTopics.length - 1) {
      [newTopics[idx + 1], newTopics[idx]] = [newTopics[idx], newTopics[idx + 1]];
    }
    setTopics(newTopics);
  };
  // Assignment modal handlers
  const handleAssignmentChange = e => setAssignmentForm({ ...assignmentForm, [e.target.name]: e.target.value });
  const handleAssignmentFile = e => {
    const file = e.target.files[0];
    if (file) setAssignmentForm({ ...assignmentForm, attachments: [...assignmentForm.attachments, { name: file.name, file }] });
    e.target.value = "";
  };
  const handleRemoveAssignmentAttachment = idx => setAssignmentForm({ ...assignmentForm, attachments: assignmentForm.attachments.filter((_, i) => i !== idx) });
  const handleAssignmentSubmit = e => {
    e.preventDefault();
    setClasswork([...classwork, { id: Date.now(), type: 'Assignment', ...assignmentForm }]);
    setShowAssignmentModal(false);
    setAssignmentForm({ title: '', instructions: '', points: 100, dueDate: '', topic: '', attachments: [] });
  };

  // Quiz handlers
  const handleQuizChange = e => setQuizForm({ ...quizForm, [e.target.name]: e.target.value });
  const handleQuizFile = e => {
    const file = e.target.files[0];
    if (file) setQuizForm({ ...quizForm, attachments: [...quizForm.attachments, { name: file.name, file }] });
    e.target.value = "";
  };
  const handleRemoveQuizAttachment = idx => setQuizForm({ ...quizForm, attachments: quizForm.attachments.filter((_, i) => i !== idx) });
  const handleQuizSubmit = e => {
    e.preventDefault();
    setClasswork([...classwork, { id: Date.now(), type: 'Quiz', ...quizForm }]);
    setShowQuizModal(false);
    setQuizForm({ title: '', instructions: '', points: 10, dueDate: '', topic: '', attachments: [] });
  };

  // Question handlers
  const handleQuestionChange = e => setQuestionForm({ ...questionForm, [e.target.name]: e.target.value });
  const handleQuestionOptionChange = (idx, val) => setQuestionForm({ ...questionForm, options: questionForm.options.map((o, i) => i === idx ? val : o) });
  const handleAddQuestionOption = () => setQuestionForm({ ...questionForm, options: [...questionForm.options, ''] });
  const handleRemoveQuestionOption = idx => setQuestionForm({ ...questionForm, options: questionForm.options.filter((_, i) => i !== idx) });
  const handleQuestionFile = e => {
    const file = e.target.files[0];
    if (file) setQuestionForm({ ...questionForm, attachments: [...questionForm.attachments, { name: file.name, file }] });
    e.target.value = "";
  };
  const handleRemoveQuestionAttachment = idx => setQuestionForm({ ...questionForm, attachments: questionForm.attachments.filter((_, i) => i !== idx) });
  const handleQuestionSubmit = e => {
    e.preventDefault();
    setClasswork([...classwork, { id: Date.now(), type: 'Question', ...questionForm }]);
    setShowQuestionModal(false);
    setQuestionForm({ question: '', options: ['', ''], dueDate: '', topic: '', attachments: [] });
  };

  // Material handlers
  const handleMaterialChange = e => setMaterialForm({ ...materialForm, [e.target.name]: e.target.value });
  const handleMaterialFile = e => {
    const file = e.target.files[0];
    if (file) setMaterialForm({ ...materialForm, attachments: [...materialForm.attachments, { name: file.name, file }] });
    e.target.value = "";
  };
  const handleRemoveMaterialAttachment = idx => setMaterialForm({ ...materialForm, attachments: materialForm.attachments.filter((_, i) => i !== idx) });
  const handleMaterialSubmit = e => {
    e.preventDefault();
    setClasswork([...classwork, { id: Date.now(), type: 'Material', ...materialForm }]);
    setShowMaterialModal(false);
    setMaterialForm({ title: '', description: '', topic: '', attachments: [] });
  };

  // Reuse post handler
  const handleReusePost = item => {
    setClasswork([...classwork, { ...item, id: Date.now() }]);
    setShowReuseModal(false);
  };

  // Modal header style helper
  const modalHeaderStyle = (color) => ({
    background: color,
    color: '#fff',
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    padding: '1.5rem 1.5rem 1rem',
    display: 'flex',
    alignItems: 'center',
    gap: 12
  });
  const modalBodyStyle = {
    background: 'linear-gradient(135deg, #f8fafc 0%, #e9ecef 100%)',
    borderBottomLeftRadius: 16,
    borderBottomRightRadius: 16,
    padding: '1.5rem',
  };
  const iconStyle = {
    fontSize: 28,
    marginRight: 8,
    opacity: 0.85
  };

  const handleDropdownToggle = (id) => {
    setAnnouncementDropdowns((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const handleClassworkDropdownToggle = (id) => {
    setAssignmentDropdowns((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const handleEditAnnouncement = (id) => {
    const ann = announcements.find(a => a.id === id);
    setEditingAnnouncementId(id);
    setEditAnnouncementData({ 
      title: ann.title, 
      content: ann.content, 
      attachments: ann.attachments ? [...ann.attachments] : [],
      
    });
    // No longer setting selected students - functionality removed
  };

  const handleEditAnnouncementChange = (e) => {
    const { name, value } = e.target;
    setEditAnnouncementData(prev => ({ ...prev, [name]: value }));
  };

  const handleSaveEditAnnouncement = async (id) => {
    try {
      // Prepare update data
      const updateData = {
        title: editAnnouncementData.title,
        content: editAnnouncementData.content,
        allow_comments: 1
      };

      // Call the API to update the stream post
      const response = await apiService.updateClassroomStreamPost(code, id, updateData);
      
      if (response && response.status === true) {
        // Success! Update local state with the response data
        setAnnouncements(prev => prev.map(a => a.id === id ? { 
          ...a, 
          title: response.data.title, 
          content: response.data.content,

          updated_at: response.data.updated_at
        } : a));
        
        // Show success message
        alert('Announcement updated successfully!');
        
        // Reset edit state
        setEditingAnnouncementId(null);
        setEditAnnouncementData({ title: '', content: '', attachments: [] });
        // No longer resetting selected students
      } else {
        // Show error message
        alert('Failed to update announcement: ' + (response?.message || 'Unknown error'));
      }
    } catch (error) {
      console.error('Error updating announcement:', error);
      alert('Failed to update announcement: ' + error.message);
    }
  };

  const handleCancelEditAnnouncement = () => {
    setEditingAnnouncementId(null);
    setEditAnnouncementData({ title: '', content: '', attachments: [] });
    // No longer resetting selected students
  };

  const handleDeleteAnnouncement = async (id) => {
    if (window.confirm("Are you sure you want to delete this announcement? This action cannot be undone.")) {
              try {
          // Call the backend delete endpoint using the API service method
          const response = await apiService.deleteClassroomStreamPost(code, id);
        
        if (response?.status) {
          // Remove from local state on successful deletion
          setAnnouncements(prev => prev.filter(a => a.id !== id));
          alert('Announcement deleted successfully!');
        } else {
          alert('Failed to delete announcement: ' + (response?.message || 'Unknown error'));
        }
      } catch (err) {
        console.error("Error deleting announcement:", err);
        if (err.response?.status === 404) {
          alert('Announcement not found or already deleted.');
        } else if (err.response?.status === 403) {
          alert('You do not have permission to delete this announcement.');
        } else {
          alert('Failed to delete announcement: ' + (err.response?.data?.message || err.message || err));
        }
      }
    }
  };

  const handleCancelPost = (e) => {
    if (e) e.preventDefault();
    setNewAnnouncement("");
    setAttachments([]);
  };

  // Add handler to pin/unpin an announcement
  const handlePinAnnouncement = (id) => {
    setAnnouncements(prev => {
      // Add originalIndex to any missing (for legacy announcements)
      let withIndex = prev.map((a, i) => a.originalIndex === undefined ? { ...a, originalIndex: i } : a);
      const updated = withIndex.map(a => a.id === id ? { ...a, isPinned: !a.isPinned } : a);
      const pinned = updated.filter(a => a.isPinned);
      const unpinned = updated.filter(a => !a.isPinned).sort((a, b) => a.originalIndex - b.originalIndex);
      return [...pinned, ...unpinned];
    });
  };

  // 1. Add state for comment input (per announcement)
  const [commentInputs, setCommentInputs] = useState({});

  // 1. Add state for editing comments
  const [editingComment, setEditingComment] = useState({}); // { [announcementId]: commentIdx }
  const [editingCommentText, setEditingCommentText] = useState({}); // { [itemId-idx]: text }
  const [showEmojiPicker, setShowEmojiPicker] = useState({}); // { [announcementId]: bool }
  const [showEditEmojiPicker, setShowEditEmojiPicker] = useState({}); // { [announcementId-commentIdx]: bool }
  const emojiList = [
    "😀", "😁", "😂", "🤣", "😃", "😄", "😅", "😆", "😉", "😊", "😋", "😎", "😍", "😘", "🥰", "😗", "😙", "😚", "🙂", "🤗", "🤩", "🤔", "🤨", "😐", "😑", "😶", "🙄", "😏", "😣", "😥", "😮", "🤐", "😯", "😪", "😫", "🥱", "😴", "😌", "😛", "😜", "😝", "🤤", "😒", "😓", "😔", "😕", "🙃", "🤑", "😲", "☹️", "🙁", "😖", "😞", "😟", "😤", "😢", "😭", "😦", "😧", "😨", "😩", "🤯", "😬", "😰", "😱", "🥵", "🥶", "😳", "🤪", "😵", "😡", "😠", "🤬", "😷", "🤒", "🤕", "🤢", "🤮", "🤧", "😇", "🥳", "🥺", "🤠", "🥸", "😈", "👿", "👹", "👺", "💀", "👻", "👽", "🤖", "💩", "😺", "😸", "😹", "😻", "😼", "😽", "🙀", "😿", "😾",
    // Heart emojis
    "❤️", "🧡", "💛", "💚", "💙", "💜", "🖤", "🤍", "🤎", "💔", "❣️", "💕", "💞", "💓", "💗", "💖", "💘", "💝", "💟"
  ];

  // 2. Edit comment handler
  const handleEditComment = (itemId, idx, text) => {
    console.log('handleEditComment called with:', { itemId, idx, text });
    setEditingComment({ [itemId]: idx });
    setEditingCommentText(prev => ({ ...prev, [`${itemId}-${idx}`]: text || '' }));
    console.log('Edit state should be set for:', { itemId, idx });
  };

  // Update handleSaveEditComment to work with both announcements and classwork and call API
  const handleSaveEditComment = async (itemId, idx) => {
    const text = editingCommentText[`${itemId}-${idx}`] || "";
    
    // Try to resolve commentId from current list if API needs it later
    let commentId = null;
    const ann = announcements.find(a => a.id === itemId);
    if (ann && Array.isArray(ann.comments) && ann.comments[idx]) {
      commentId = ann.comments[idx].id || ann.comments[idx].comment_id || ann.comments[idx].id_comment || null;
    }

    // Call backend edit endpoint (best-effort; keep UI responsive)
    try {
      if (commentId) {
        const resp = await apiService.editTeacherStreamComment(code, itemId, commentId, text);
        // If API returns updated comment, sync it to ensure UI matches backend
        const updatedText = (resp && (resp.data?.comment || resp.data?.text || resp.comment || resp.text)) || text;
        setAnnouncements(prevAnnouncements => prevAnnouncements.map(a => {
          if (a.id !== itemId) return a;
          const newComments = (a.comments || []).map((c, i) => i === idx ? { ...c, text: updatedText } : c);
          return { ...a, comments: newComments };
        }));
      }
    } catch (e) {
      console.warn('Edit comment API failed; keeping optimistic UI:', e?.message || e);
    }

    // Force a complete state update with a new array reference
    const isAnnouncement = announcements.some(a => a.id === itemId);
    if (isAnnouncement) {
      setAnnouncements(prevAnnouncements => {
        const newAnnouncements = prevAnnouncements.map(announcement => {
          if (announcement.id === itemId) {
            const newComments = announcement.comments.map((comment, commentIdx) => {
              if (commentIdx === idx) {
                return { ...comment, text: text };
              }
              return comment;
            });
            return { ...announcement, comments: newComments };
          }
          return announcement;
        });
        return newAnnouncements;
      });
    } else {
      // Handle classwork comments
      setAssignments(prevAssignments => {
        const newAssignments = prevAssignments.map(assignment => {
          if (assignment.id === itemId) {
            const newComments = assignment.comments.map((comment, commentIdx) => {
              if (commentIdx === idx) {
                return { ...comment, text: text };
              }
              return comment;
            });
            return { ...assignment, comments: newComments };
          }
          return assignment;
        });
        return newAssignments;
      });
    }
    
    // Clear edit state
    setEditingComment({});
    setEditingCommentText(prev => {
      const newObj = { ...prev };
      delete newObj[`${itemId}-${idx}`];
      return newObj;
    });
    

  };

  const handleCancelEditComment = (itemId, idx) => {
    setEditingComment({});
    setEditingCommentText(prev => {
      const newObj = { ...prev };
      delete newObj[`${itemId}-${idx}`];
      return newObj;
    });
  };

  // 3. Delete comment handler with API call
  const handleDeleteComment = async (announcementId, idx) => {
    // Resolve commentId for API
    const ann = announcements.find(a => a.id === announcementId);
    const comment = ann && Array.isArray(ann.comments) ? ann.comments[idx] : null;
    const commentId = comment?.id || comment?.comment_id || comment?.id_comment || null;

    // Optimistic UI remove
    setAnnouncements(prev => prev.map(a =>
      a.id === announcementId
        ? { ...a, comments: (a.comments || []).filter((_, i) => i !== idx) }
        : a
    ));

    // Fire and forget API
    try {
      if (commentId) {
        await apiService.deleteTeacherStreamComment(code, announcementId, commentId);
      }
    } catch (e) {
      console.warn('Delete comment API failed:', e?.message || e);
    }
  };

  const handleLikeAnnouncement = (announcementId) => {
    setAnnouncements(prev => prev.map(a => {
      if (a.id === announcementId) {
        const reactions = a.reactions || { like: 0, likedBy: [] };
        const likedBy = reactions.likedBy || [];
        const hasLiked = likedBy.includes(currentUser);
        
        if (hasLiked) {
          // Unlike: remove user from likedBy and decrease count
          const newLikedBy = likedBy.filter(user => user !== currentUser);
          return {
            ...a,
            reactions: {
              ...reactions,
              like: reactions.like - 1,
              likedBy: newLikedBy
            }
          };
        } else {
          // Like: add user to likedBy and increase count
          return {
            ...a,
            reactions: {
              ...reactions,
              like: reactions.like + 1,
              likedBy: [...likedBy, currentUser]
            }
          };
        }
      }
      return a;
    }));
  };
  // 4. Emoji picker for comment input
  const handleAddEmojiToInput = (announcementId, emoji) => {
    setCommentInputs(inputs => ({ ...inputs, [announcementId]: (inputs[announcementId] || "") + emoji }));
    setShowEmojiPicker(picker => ({ ...picker, [announcementId]: false }));
  };

  // Add handlers for edit attachments
  const handleEditFileChange = (e) => {
    const files = Array.from(e.target.files);
    if (files.length > 0) {
      setEditAnnouncementData(prev => ({
        ...prev,
        attachments: [...(prev.attachments || []), ...files.map(file => ({ name: file.name, file }))]
      }));
    }
    e.target.value = "";
  };
  const handleRemoveEditAttachment = (idx) => {
    setEditAnnouncementData(prev => ({
      ...prev,
      attachments: prev.attachments.filter((_, i) => i !== idx)
    }));
  };

  // Edit attachment handlers
  const handleEditAddAttachment = (type) => {
    if (type === "Google Drive") {
      alert("Google Drive integration coming soon!");
    } else if (type === "Link") {
      setShowEditLinkModal(true);
    } else if (type === "File") {
      editFileInputRef.current.click();
    } else if (type === "YouTube") {
      setShowEditYouTubeModal(true);
    }
  };

  const handleEditAddLink = () => {
    let url = editLinkInput.trim();
    setEditLinkError("");
    if (!url) {
      setEditLinkError("Please enter a link URL");
      return;
    }
    let formatted = url;
    let valid = false;
    try {
      const urlObj = new URL(formatted);
      if (urlObj.protocol && urlObj.hostname) valid = true;
    } catch {}
    if (!valid) {
      if (/[^a-zA-Z0-9.-]/.test(url)) {
        setEditLinkError("Please enter a valid URL or word (no spaces or special characters)");
        return;
      }
      formatted = `https://${url}.com`;
      try {
        const urlObj = new URL(formatted);
        if (urlObj.protocol && urlObj.hostname) valid = true;
      } catch {}
    }
    if (!valid) {
      setEditLinkError("Could not autoformat to a valid link. Please check your input.");
      return;
    }
    setEditAnnouncementData(prev => ({
      ...prev,
      attachments: [...(prev.attachments || []), { type: "Link", url: formatted }]
    }));
    setEditLinkInput("");
    setEditLinkError("");
    setShowEditLinkModal(false);
  };

  const handleEditAddYouTube = () => {
    if (editYouTubeInput.trim()) {
      setEditAnnouncementData(prev => ({
        ...prev,
        attachments: [...(prev.attachments || []), { type: "YouTube", url: editYouTubeInput }]
      }));
      setEditYouTubeInput("");
      setShowEditYouTubeModal(false);
    }
  };

  // 1. Add state for student search
  const [studentSearch, setStudentSearch] = useState("");

  // Inside ClassroomDetail component, before return
  const emojiDropdownRefs = useRef({});

  const [openEmojiPickerId, setOpenEmojiPickerId] = useState(null);

  // After emojiDropdownRefs and openEmojiPickerId, add this useEffect:
  useEffect(() => {
    if (openEmojiPickerId === null) return;
    const handleClick = (event) => {
      const ref = emojiDropdownRefs.current[openEmojiPickerId];
      if (ref && !ref.contains(event.target)) {
        setOpenEmojiPickerId(null);
      }
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, [openEmojiPickerId]);

  // Add click outside handler for comment dropdown
  useEffect(() => {
    if (commentDropdownOpen === null) return;
    const handleClick = (event) => {
      setCommentDropdownOpen(null);
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, [commentDropdownOpen]);

  // Add after showEditEmojiPicker definition
  const editEmojiDropdownRefs = useRef({});
  useEffect(() => {
    function handleClickOutsideEditEmoji(event) {
      Object.keys(showEditEmojiPicker).forEach(key => {
        if (showEditEmojiPicker[key]) {
          const ref = editEmojiDropdownRefs.current[key];
          if (ref && !ref.contains(event.target)) {
            setShowEditEmojiPicker(picker => ({ ...picker, [key]: false }));
          }
        }
      });
    }
    if (Object.values(showEditEmojiPicker).some(Boolean)) {
      document.addEventListener('mousedown', handleClickOutsideEditEmoji);
      return () => document.removeEventListener('mousedown', handleClickOutsideEditEmoji);
    }
  }, [showEditEmojiPicker]);

  // Add state for createTypeSelector
  const [showTypeDropdown, setShowTypeDropdown] = useState(false);
  const [createType, setCreateType] = useState('');
  const typeDropdownRef = useRef();

  // Close dropdown on outside click
  useEffect(() => {
    if (!showTypeDropdown) return;
    function handleClick(e) {
      if (typeDropdownRef.current && !typeDropdownRef.current.contains(e.target)) {
        setShowTypeDropdown(false);
      }
    }
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, [showTypeDropdown]);

  // Add state for editing classwork
  const [editingClassworkId, setEditingClassworkId] = useState(null);
  const [editForm, setEditForm] = useState({ type: '', title: '', dueDate: '', points: '', details: '' });

  // Add state for edit classwork attachments
  const [editClassworkAttachments, setEditClassworkAttachments] = useState([]);
  const editClassworkFileInputRef = useRef();

  // Add state and handler for classwork comments at the top of the component
  const handlePostClassworkComment = (id) => {
    const comment = commentInputs[id]?.trim();
    if (!comment) return;
    setAssignments(prev => prev.map(a =>
      a.id === id
        ? { ...a, comments: (a.comments || []).concat({ text: comment, author: "Prof. Smith", date: new Date().toISOString() }) }
        : a
    ));
    setCommentInputs(inputs => ({ ...inputs, [id]: "" }));
  };

  // Add handlers for editing classwork
  const handleEditClasswork = (id) => {
    const assignment = assignments.find(a => a.id === id);
    setEditingClassworkId(id);
    setEditClassworkData({ 
      title: assignment.title, 
      details: assignment.details || '', 
      dueDate: assignment.dueDate || '',
      points: assignment.points || '',
      type: assignment.type || 'Assignment'
    });
  };

  const handleEditClassworkChange = (e) => {
    const { name, value } = e.target;
    setEditClassworkData(prev => ({ ...prev, [name]: value }));
  };

  const handleSaveEditClasswork = (id) => {
    setAssignments(prev => prev.map(a => a.id === id ? { 
      ...a, 
      title: editClassworkData.title, 
      details: editClassworkData.details,
      dueDate: editClassworkData.dueDate,
      points: editClassworkData.points,
      type: editClassworkData.type
    } : a));
    setEditingClassworkId(null);
    setEditClassworkData({ title: '', details: '', dueDate: '', points: '', type: 'Assignment' });
  };

  const handleCancelEditClasswork = () => {
    setEditingClassworkId(null);
    setEditClassworkData({ title: '', details: '', dueDate: '', points: '', type: 'Assignment' });
  };

  const handleDeleteClasswork = (id) => {
    setAssignments(prev => prev.filter(a => a.id !== id));
  };
  // Classwork creation attachment handlers
  const handleCreateFileChange = (e) => {
    const files = Array.from(e.target.files);
    if (files.length > 0) {
      setCreateForm(prev => ({
        ...prev,
        attachments: [...(prev.attachments || []), ...files.map(file => ({ name: file.name, file }))]
      }));
    }
    e.target.value = "";
  };

  const handleRemoveCreateAttachment = (idx) => {
    setCreateForm(prev => ({
      ...prev,
      attachments: prev.attachments.filter((_, i) => i !== idx)
    }));
  };

  const handleCreateAddLink = () => {
    let url = createLinkInput.trim();
    if (!url) return;
    
    let formatted = url;
    if (!url.startsWith('http://') && !url.startsWith('https://')) {
      formatted = 'https://' + url;
    }
    
    setCreateForm(prev => ({
      ...prev,
      attachments: [...(prev.attachments || []), { name: url, url: formatted, type: "Link" }]
    }));
    setCreateLinkInput("");
    setShowCreateLinkModal(false);
  };

  const handleCreateAddYouTube = () => {
    let url = createYouTubeInput.trim();
    if (!url) return;
    
    // Extract video ID from YouTube URL
    let videoId = '';
    const youtubeRegex = /(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/;
    const match = url.match(youtubeRegex);
    if (match) {
      videoId = match[1];
    } else {
      videoId = url;
    }
    
    const formattedUrl = `https://www.youtube.com/watch?v=${videoId}`;
    
    setCreateForm(prev => ({
      ...prev,
      attachments: [...(prev.attachments || []), { name: `YouTube: ${videoId}`, url: formattedUrl, type: "YouTube" }]
    }));
    setCreateYouTubeInput("");
    setShowCreateYouTubeModal(false);
  };

  const handleCreateAddDrive = () => {
    let url = createDriveInput.trim();
    if (!url) return;
    
    setCreateForm(prev => ({
      ...prev,
      attachments: [...(prev.attachments || []), { name: `Google Drive: ${url}`, url: url, type: "Google Drive" }]
    }));
    setCreateDriveInput("");
    setShowCreateDriveModal(false);
  };

  const handleAddAssignedStudent = (studentId) => {
    setCreateForm(prev => ({
      ...prev,
      assignedStudents: [...(prev.assignedStudents || []), studentId]
    }));
  };

  const handleRemoveAssignedStudent = (studentId) => {
    setCreateForm(prev => ({
      ...prev,
      assignedStudents: prev.assignedStudents.filter(id => id !== studentId)
    }));
  };

  // Load available students for task assignment
  const loadAvailableStudents = async (classCodes) => {
    try {
      console.log('Loading available students for class codes:', classCodes);
      setLoadingUsers(true);
      const response = await apiService.getAvailableStudents(classCodes);
      console.log('Available students API response:', response);
      
      if (response.status && response.data && response.data.length > 0) {
        // Transform the API response to match the expected format
        const availableStudents = response.data.map(student => ({
          id: student.student_id,
          name: student.full_name,
          email: student.email,
          profile_pic: student.profile_pic,
          student_num: student.student_num,
          class_code: student.class_code
        }));
        console.log('Transformed available students:', availableStudents);
        setAvailableUsers(availableStudents);
      } else {
        console.log('No students from API, using current classroom students as fallback');
        // Fallback to current classroom students
        const fallbackStudents = students.map(student => ({
          id: student.id,
          name: student.name || student.full_name,
          email: student.email,
          profile_pic: student.profile_pic,
          student_num: student.student_num,
          class_code: code // Current classroom code
        }));
        console.log('Fallback students:', fallbackStudents);
        setAvailableUsers(fallbackStudents);
      }
    } catch (error) {
      console.error('Error loading available students:', error);
      console.log('Using current classroom students as fallback due to error');
      // Fallback to current classroom students
      const fallbackStudents = students.map(student => ({
        id: student.id,
        name: student.name || student.full_name,
        email: student.email,
        profile_pic: student.profile_pic,
        student_num: student.student_num,
        class_code: code // Current classroom code
      }));
      setAvailableUsers(fallbackStudents);
    } finally {
      setLoadingUsers(false);
    }
  };




  const [pillRemoveHoverId, setPillRemoveHoverId] = useState(null);

  const [scheduled, setScheduled] = useState([]);

  const handleScheduleAnnouncement = () => {
    if (scheduleDate && scheduleTime) {
      // Check if we're in the task context (Class Tasks tab)
      if (activeTab === "class") {
        setTaskScheduled([
          ...taskScheduled,
          {
            id: Date.now() + Math.random(),
            type: taskForm.type,
            title: taskForm.title || 'Untitled Task',
            text: taskForm.text || '',
            dueDate: taskForm.dueDate || '',
            points: taskForm.points || '',

            attachments: taskAttachments,
            assignedStudents: taskAssignedStudents,
            scheduledFor: {
              date: scheduleDate,
              time: scheduleTime
            }
          }
        ]);
        // Clear task form
        setTaskForm({
          type: 'Assignment',
          title: '',
          text: '',
          dueDate: '',
          points: '',
      
          attachments: [],
          visibleTo: [],
          submitted: false
        });
        setTaskAttachments([]);
        setTaskAssignedStudents([]);
        setScheduleDate('');
        setScheduleTime('');
        setShowScheduleModal(false);
        alert("Task scheduled!");
      } else {
        // Handle announcement scheduling
        if (newAnnouncement.trim()) {
      setScheduled([
        ...scheduled,
        {
          text: newAnnouncement,
          title: newAnnouncementTitle,
          attachments,
          year: selectedYear,
          audience: selectedAudience,
          visibleTo: selectedAnnouncementStudents,
          scheduledFor: {
            date: scheduleDate,
            time: scheduleTime
          }
        }
      ]);
      setNewAnnouncement("");
      setNewAnnouncementTitle("");
      setAttachments([]);
      setSelectedAnnouncementStudents([]);
      setScheduleDate('');
      setScheduleTime('');
      setShowScheduleModal(false);
      alert("Announcement scheduled!");
        }
      }
    }
  };

  // Auto-post scheduled announcements when time is reached
  useEffect(() => {
    const checkScheduledAnnouncements = () => {
      const now = new Date();
      const currentTime = now.getTime();
      
      setScheduled(prevScheduled => {
        const newScheduled = [];
        const toPost = [];
        
        prevScheduled.forEach(item => {
          const scheduledDateTime = new Date(`${item.scheduledFor.date}T${item.scheduledFor.time}`);
          const scheduledTime = scheduledDateTime.getTime();
          
          if (currentTime >= scheduledTime) {
            toPost.push(item);
          } else {
            newScheduled.push(item);
          }
        });
        
        toPost.forEach(item => {
          // Get current logged-in user information
          let currentUserName = 'You';
          let currentUserProfilePic = null;
          try {
            const stored = localStorage.getItem('user') || localStorage.getItem('scms_logged_in_user');
            if (stored) {
              const u = JSON.parse(stored);
              currentUserName = u.full_name || u.name || u.user_name || 'You';
              currentUserProfilePic = u.profile_pic || u.profile_picture || u.avatar || null;
            }
          } catch (_) {}

          const newAnnouncement = {
            id: Date.now() + Math.random(),
            title: item.title || item.content || 'Scheduled Announcement',
            content: item.content || item.text || '',
            author: item.author || currentUserName,
            authorProfilePic: item.authorProfilePic || currentUserProfilePic,
            date: new Date().toISOString(),
            isPinned: false,
            reactions: { like: 0, likedBy: [] },
            comments: [],
            attachments: item.attachments || [],
            year: item.year,
            audience: item.audience,
            visibleTo: item.visibleTo || [],

          };
          setAnnouncements(prev => [newAnnouncement, ...prev]);
        });
        
        return newScheduled;
      });
    };
    
    const interval = setInterval(checkScheduledAnnouncements, 60000);
    checkScheduledAnnouncements();
    return () => clearInterval(interval);
  }, []);

  // Auto-post scheduled tasks when time is reached
  useEffect(() => {
    const checkScheduledTasks = () => {
      const now = new Date();
      const currentTime = now.getTime();
      
      setTaskScheduled(prevTaskScheduled => {
        const newTaskScheduled = [];
        const toPost = [];
        
        prevTaskScheduled.forEach(item => {
          const scheduledDateTime = new Date(`${item.scheduledFor.date}T${item.scheduledFor.time}`);
          const scheduledTime = scheduledDateTime.getTime();
          
          if (currentTime >= scheduledTime) {
            toPost.push(item);
          } else {
            newTaskScheduled.push(item);
          }
        });
        
        toPost.forEach(item => {
          // Get current logged-in user information
          let currentUserName = 'You';
          let currentUserProfilePic = null;
          try {
            const stored = localStorage.getItem('user') || localStorage.getItem('scms_logged_in_user');
            if (stored) {
              const u = JSON.parse(stored);
              currentUserName = u.full_name || u.name || u.user_name || 'You';
              currentUserProfilePic = u.profile_pic || u.profile_picture || u.avatar || null;
            }
          } catch (_) {}

          const newTask = {
            id: Date.now() + Math.random(),
            type: item.type,
            title: item.title,
            text: item.text,
            dueDate: item.dueDate,
            points: item.points,

            attachments: item.attachments || [],
            assignedStudents: item.assignedStudents || [],
            author: item.author || currentUserName,
            authorProfilePic: item.authorProfilePic || currentUserProfilePic,
            date: new Date().toISOString(),
            isPinned: false,
            isLiked: false,
            likes: 0,
            comments: []
          };
          setTasks(prev => [newTask, ...prev]);
        });
        
        return newTaskScheduled;
      });
    };
    
    const interval = setInterval(checkScheduledTasks, 60000);
    checkScheduledTasks();
    return () => clearInterval(interval);
  }, []);

  // Background gradients for mp3-container
  const mp3Backgrounds = [
    'linear-gradient(135deg, #232526 0%, #414345 100%)', // dark gray to charcoal
    'linear-gradient(135deg, #141e30 0%, #243b55 100%)', // deep navy to blue
    'linear-gradient(135deg, #283e51 0%, #485563 100%)', // slate blue to blue-gray
    'linear-gradient(135deg, #434343 0%, #262626 100%)', // dark gray to black
    'linear-gradient(135deg, #373b44 0%, #4286f4 100%)', // night blue to indigo
    'linear-gradient(135deg, #1a2980 0%, #26d0ce 100%)', // midnight blue to soft teal
    'linear-gradient(135deg, #0f2027 0%, #2c5364 100%)', // deep blue to blue-gray
  ];
  const [mp3BgIndex, setMp3BgIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setMp3BgIndex(idx => (idx + 1) % mp3Backgrounds.length);
    }, 30000); // 30 seconds
    return () => clearInterval(interval);
  }, []);

  const audioRef = useRef(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  function formatTime(sec) {
    if (!sec || isNaN(sec)) return '0:00';
    const m = Math.floor(sec / 60);
    const s = Math.floor(sec % 60);
    return `${m}:${s.toString().padStart(2, '0')}`;
  }

  // Add this to the ClassroomDetail component:
  const [audioUrl, setAudioUrl] = useState(null);
  useEffect(() => {
    console.log('audioUrl useEffect triggered with previewAttachment:', previewAttachment);
    if (previewAttachment) {
      // Handle file objects
      if (previewAttachment.file && previewAttachment.file.type.startsWith('audio/')) {
        const url = URL.createObjectURL(previewAttachment.file);
        console.log('Setting audioUrl for file object:', url);
        setAudioUrl(url);
        return () => URL.revokeObjectURL(url);
      }
      // Handle URLs for audio files
      else if (previewAttachment.url && ['mp3', 'wav', 'ogg', 'aac', 'flac'].includes(previewAttachment.name?.split('.').pop()?.toLowerCase())) {
        console.log('Setting audioUrl for URL:', previewAttachment.url);
        setAudioUrl(previewAttachment.url);
      }
      // Clear audio URL for non-audio files
      else {
        console.log('Clearing audioUrl for non-audio file');
        setAudioUrl(null);
      }
    } else {
      console.log('Clearing audioUrl - no previewAttachment');
      setAudioUrl(null);
    }
  }, [previewAttachment]);

  // Add these to the ClassroomDetail component:
  const [volume, setVolume] = useState(1);
  const [playbackRate, setPlaybackRate] = useState(1);

  // In a useEffect, sync volume and playbackRate with the audio element:
  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = volume;
      audioRef.current.playbackRate = playbackRate;
    }
  }, [volume, playbackRate]);

  // Audio event listeners for play/pause state management
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) {
      return;
    }

    const handlePlay = () => {
      setIsPlaying(true);
      startVisualizer();
    };

    const handlePause = () => {
      setIsPlaying(false);
      stopVisualizer();
    };

    const handleEnded = () => {
      setIsPlaying(false);
      stopVisualizer();
    };

    audio.addEventListener('play', handlePlay);
    audio.addEventListener('pause', handlePause);
    audio.addEventListener('ended', handleEnded);

    return () => {
      audio.removeEventListener('play', handlePlay);
      audio.removeEventListener('pause', handlePause);
      audio.removeEventListener('ended', handleEnded);
    };
  }, [audioRef.current, audioUrl]); // Re-run when audio element or URL changes

  // At the top of the component:
  const wavePathRef = useRef(null);

  // Subtle wave animation
  useEffect(() => {
    const wave = wavePathRef.current;
    if (!wave) return;
    let t = 0;
    let running = true;
    let frameId;
    function animateWave() {
      if (!running) return;
      t += 0.02;
      const amp = 10;
      const y1 = 40 + Math.sin(t) * amp;
      const y2 = 40 + Math.cos(t/2) * amp;
      wave.setAttribute('d', `M0,${y1} Q360,${80-amp} 720,${y2} T1440,${y1} V80 H0 Z`);
      frameId = requestAnimationFrame(animateWave);
    }
    if (isPlaying) {
      running = true;
      animateWave();
    } else {
      running = false;
      if (frameId) cancelAnimationFrame(frameId);
    }
    return () => {
      running = false;
      if (frameId) cancelAnimationFrame(frameId);
    };
  }, [isPlaying]);



  // Add state for toggling Online Setup in Quick Grade
  const [showOnlineSetup, setShowOnlineSetup] = useState(false);

  // Add state for Online Setup assigned students
  const [onlineAssignedStudents, setOnlineAssignedStudents] = useState([]);

  // === Quick Grade Online Setup Attachments State and Handlers ===
  const [onlineAttachments, setOnlineAttachments] = useState([]);
  const [showOnlineLinkModal, setShowOnlineLinkModal] = useState(false);
  const [showOnlineYouTubeModal, setShowOnlineYouTubeModal] = useState(false);
  const [showOnlineDriveModal, setShowOnlineDriveModal] = useState(false);
  const [onlineLinkInput, setOnlineLinkInput] = useState("");
  const [onlineYouTubeInput, setOnlineYouTubeInput] = useState("");
  const [onlineDriveInput, setOnlineDriveInput] = useState("");
  const onlineFileInputRef = useRef();

  const handleOnlineFileChange = (e) => {
    const files = Array.from(e.target.files || []);
    if (files.length) {
      setOnlineAttachments((prev) => [
        ...prev,
        ...files.map((file) => ({ type: "File", file, name: file.name }))
      ]);
    }
    if (onlineFileInputRef.current) onlineFileInputRef.current.value = "";
  };

  const handleOnlineAddLink = () => {
    if (onlineLinkInput.trim()) {
      setOnlineAttachments((prev) => [
        ...prev,
        { type: "Link", url: onlineLinkInput.trim() }
      ]);
      setOnlineLinkInput("");
      setShowOnlineLinkModal(false);
    }
  };

  const handleOnlineAddYouTube = () => {
    if (onlineYouTubeInput.trim()) {
      setOnlineAttachments((prev) => [
        ...prev,
        { type: "YouTube", url: onlineYouTubeInput.trim() }
      ]);
      setOnlineYouTubeInput("");
      setShowOnlineYouTubeModal(false);
    }
  };

  const handleOnlineAddDrive = () => {
    if (onlineDriveInput.trim()) {
      setOnlineAttachments((prev) => [
        ...prev,
        { type: "Google Drive", url: onlineDriveInput.trim() }
      ]);
      setOnlineDriveInput("");
      setShowOnlineDriveModal(false);
    }
  };

  const handleRemoveOnlineAttachment = (idx) => {
    setOnlineAttachments((prev) => prev.filter((_, i) => i !== idx));
  };

  // Export grades function
  const handleExportGrades = async () => {
    if (!gradesData || !gradesData.students) {
      alert('No grades data available to export');
      return;
    }

    setExportLoading(true);
    try {
      // Create workbook and worksheet
      const wb = XLSX.utils.book_new();
      
      // Prepare data for export
      const exportData = [];
      
      // Add header information
      exportData.push(['SCMS - Student Course Management System']);
      exportData.push(['Class Record']);
      exportData.push(['']);
      exportData.push(['Class Information:']);
      exportData.push(['Class Code:', gradesData.classroom?.class_code || 'N/A']);
      exportData.push(['Title:', gradesData.classroom?.title || 'N/A']);
      exportData.push(['Semester:', gradesData.classroom?.semester || 'N/A']);
      exportData.push(['School Year:', gradesData.classroom?.school_year || 'N/A']);
      exportData.push(['']);
      exportData.push(['Grading Breakdown:']);
      exportData.push(['Attendance:', `${gradingBreakdown.attendance}%`]);
      exportData.push(['Activity:', `${gradingBreakdown.activity}%`]);
      exportData.push(['Assignment/Quiz:', `${gradingBreakdown.assignment}%`]);
      exportData.push(['Midterm Exam:', `${gradingBreakdown.midtermExam}%`]);
      exportData.push(['Final Exam:', `${gradingBreakdown.finalExam}%`]);
      exportData.push(['Total:', '100%']);
      exportData.push(['']);
      
      // Create headers for the table
      const headers = ['Student Name', 'Student ID', 'Attendance', 'RS', 'PS', 'WS'];
      
      // Collect assignment tasks once to know column counts
      const assignmentTasks = gradesData.tasks?.filter(task => 
        task.type !== 'midterm_exam' && 
        task.type !== 'final_exam' && 
        !task.title.toLowerCase().includes('midterm') &&
        !task.title.toLowerCase().includes('final')
      ) || [];
      
      // Add assignment headers (exclude midterm and final exams)
      assignmentTasks.forEach(task => {
        headers.push(task.title);
      });
      
      headers.push('Total Score', 'RS', 'PS', 'WS', 'Midterm', 'PS', 'WS', 'Final Exam', 'PS', 'WS', 'Quarterly Grade', 'Rounded Grade');
      
      exportData.push(headers);
      // Keep track of the header row index (1-based in Excel)
      const headerRowNumber = exportData.length; 
      
      // Highest Possible Score row (inserted after headers)
      const getPoints = (t) => parseFloat(t?.points || t?.max_points || t?.total_points || t?.max_score || 0) || 0;
      const assignmentMaxPoints = assignmentTasks.map(getPoints);
      const totalAssignmentMax = assignmentMaxPoints.reduce((acc, v) => acc + v, 0);

      const allTasks = gradesData.tasks || [];
      const midtermTask = allTasks.find(t => t.type === 'midterm_exam' || t.type === 'midterm' || (t.title||'').toLowerCase().includes('midterm') || (t.title||'').toLowerCase().includes('mid term') || (t.title||'').toLowerCase().includes('mid-term'));
      const finalTask = allTasks.find(t => t.type === 'final_exam' || t.type === 'final' || (t.title||'').toLowerCase().includes('final exam') || (t.title||'').toLowerCase().includes('final-exam') || (t.title||'').toLowerCase().includes('final'));
      const midtermMax = (() => { const p = getPoints(midtermTask); return p > 0 ? p : maxMidtermScore; })();
      const finalMax = (() => { const p = getPoints(finalTask); return p > 0 ? p : maxFinalExamScore; })();
      const majorWeight = (Number(gradingBreakdown.midtermExam)||0) + (Number(gradingBreakdown.finalExam)||0);

      const highestRow = [];
      highestRow.push('Highest Possible Score'); // Student Name
      highestRow.push(''); // Student ID
      highestRow.push(`${maxAttendanceScore}/${maxAttendanceScore}`); // Attendance display
      highestRow.push(maxAttendanceScore); // RS (attendance)
      highestRow.push(''); // PS (formula later)
      highestRow.push(''); // WS (formula later)
      // Per-assignment columns: show each max
      assignmentTasks.forEach(task => { highestRow.push(getPoints(task)); });
      // Totals & activity columns
      highestRow.push(totalAssignmentMax); // Total Score
      highestRow.push(totalAssignmentMax); // RS equals total
      highestRow.push(''); // PS formula
      highestRow.push(''); // WS formula
      // Midterm
      highestRow.push(midtermMax); // display
      highestRow.push(''); // PS
      highestRow.push(''); // WS
      // Final
      highestRow.push(finalMax); // display
      highestRow.push(''); // PS
      highestRow.push(''); // WS
      // Quarterly + Rounded
      highestRow.push('');
      highestRow.push('');

      exportData.push(highestRow);
      
      // Add student data
      gradesData.students?.forEach(student => {
        const row = [
          student.student_name,
          student.student_num,
          student.attendance ? `${computeAttendanceMetrics(student.attendance).rawScore.toFixed(1)}/${maxAttendanceScore} (${computeAttendanceMetrics(student.attendance).percentage.toFixed(1)}%)` : 'N/A'
        ];
        // Compute RS/PS/WS for export
        const m = computeAttendanceMetrics(student.attendance);
        row.push(m.rawScore.toFixed(2));
        row.push(`${m.percentage.toFixed(2)}%`);
        row.push(m.weighted.toFixed(2));
        
        // Add assignment scores (exclude midterm and final exams)
        assignmentTasks.forEach(task => {
          const assignment = student.assignments?.find(a => a.task_id === task.task_id);
          if (assignment) {
            row.push(`${assignment.grade}/${assignment.points} (${assignment.grade_percentage}%)`);
          } else {
            row.push('N/A');
          }
        });
        
        // Add Total Score/RS/PS/WS for export
        const assignmentMetrics = computeAssignmentMetrics(student);
        row.push(assignmentMetrics.maxPossibleScore);
        row.push(assignmentMetrics.rawScore.toFixed(2));
        row.push(`${assignmentMetrics.percentage.toFixed(2)}%`);
        row.push(assignmentMetrics.weighted.toFixed(2));
        
        // Add Midterm RS/PS/WS for export
        const midtermMetrics = computeMidtermMetrics(student);
        if (midtermMetrics.hasTask) {
          row.push(`${midtermMetrics.rawScore.toFixed(1)} (${midtermMetrics.percentage.toFixed(1)}%)`);
          row.push(`${midtermMetrics.percentage.toFixed(2)}%`);
          row.push(midtermMetrics.weighted.toFixed(2));
        } else {
          row.push('No Midterm Task');
          row.push('-');
          row.push('-');
        }
        
        // Add Final Exam RS/PS/WS for export
        const finalExamMetrics = computeFinalExamMetrics(student);
        if (finalExamMetrics.hasTask) {
          row.push(`${finalExamMetrics.rawScore.toFixed(1)}/${finalExamMetrics.maxPossibleScore} (${finalExamMetrics.percentage.toFixed(1)}%)`);
          row.push(`${finalExamMetrics.percentage.toFixed(2)}%`);
          row.push(finalExamMetrics.weighted.toFixed(2));
        } else {
          row.push('No Final Exam Task');
          row.push('-');
          row.push('-');
        }
        
        // Add Quarterly Grade (exact and rounded)
        const quarterlyGrade = computeQuarterlyGrade(student);
        row.push(quarterlyGrade.exact.toFixed(2));
        row.push(quarterlyGrade.rounded);
        
        exportData.push(row);
      });
      
      // Create worksheet
      const ws = XLSX.utils.aoa_to_sheet(exportData);
      
      // Set column widths
      const colWidths = [
        { wch: 25 }, // Student Name
        { wch: 15 }, // Student ID
        { wch: 20 }, // Attendance
        { wch: 10 }, // RS
        { wch: 10 }, // PS
        { wch: 10 }, // WS
      ];
      
      // Add widths for assignments (exclude midterm and final exams)
      gradesData.tasks?.filter(task => 
        task.type !== 'midterm_exam' && 
        task.type !== 'final_exam' && 
        !task.title.toLowerCase().includes('midterm') &&
        !task.title.toLowerCase().includes('final')
      ).forEach(() => {
        colWidths.push({ wch: 18 });
      });
      
      colWidths.push({ wch: 12 }, { wch: 12 }, { wch: 12 }, { wch: 12 }, { wch: 20 }, { wch: 10 }, { wch: 10 }, { wch: 20 }, { wch: 10 }, { wch: 10 }, { wch: 18 }, { wch: 12 }); // Total Score, RS, PS, WS, Midterm RS, PS, WS, Final Exam RS, PS, WS, Quarterly Grade, Rounded Grade
      
      ws['!cols'] = colWidths;

      // Inject formulas into PS/WS and Quarterly Grade columns
      const toCell = (r1, c0) => XLSX.utils.encode_cell({ r: r1 - 1, c: c0 });
      const highestRowNumber = headerRowNumber + 1; // row with Highest Possible Score
      const firstDataRow = headerRowNumber + 2; // first student row (1-based)
      const numStudents = gradesData.students ? gradesData.students.length : 0;
      const assignCount = assignmentTasks.length;
      
      // Column indices (0-based)
      const COL_ATT_RS = 3;
      const COL_ATT_PS = 4;
      const COL_ATT_WS = 5;
      const COL_AFTER_ASSIGN = 6 + assignCount;
      const COL_AS_TOTAL = COL_AFTER_ASSIGN + 0;
      const COL_AS_RS = COL_AFTER_ASSIGN + 1;
      const COL_AS_PS = COL_AFTER_ASSIGN + 2;
      const COL_AS_WS = COL_AFTER_ASSIGN + 3;
      const COL_MID_DISPLAY = COL_AFTER_ASSIGN + 4;
      const COL_MID_PS = COL_AFTER_ASSIGN + 5;
      const COL_MID_WS = COL_AFTER_ASSIGN + 6;
      const COL_FINAL_DISPLAY = COL_AFTER_ASSIGN + 7;
      const COL_FINAL_PS = COL_AFTER_ASSIGN + 8;
      const COL_FINAL_WS = COL_AFTER_ASSIGN + 9;
      const COL_QUARTERLY = COL_AFTER_ASSIGN + 10;
      const COL_ROUNDED = COL_AFTER_ASSIGN + 11;

      // Inject formulas for Highest Possible Score row
      // Attendance PS and WS
      ws[toCell(highestRowNumber, COL_ATT_PS)] = { f: `ROUND((${toCell(highestRowNumber, COL_ATT_RS)}/${maxAttendanceScore})*100,2)` };
      ws[toCell(highestRowNumber, COL_ATT_WS)] = { f: `ROUND(${toCell(highestRowNumber, COL_ATT_PS)}*${gradingBreakdown.attendance}/100,2)` };
      // Assignments PS and WS
      ws[toCell(highestRowNumber, COL_AS_PS)] = { f: `IFERROR(ROUND((${toCell(highestRowNumber, COL_AS_RS)}/${toCell(highestRowNumber, COL_AS_TOTAL)})*100,2),0)` };
      ws[toCell(highestRowNumber, COL_AS_WS)] = { f: `ROUND(${toCell(highestRowNumber, COL_AS_PS)}*${gradingBreakdown.activity}/100,2)` };
      // Midterm PS/WS
      ws[toCell(highestRowNumber, COL_MID_PS)] = { f: `ROUND((${toCell(highestRowNumber, COL_MID_DISPLAY)}/${midtermMax})*100,2)` };
      ws[toCell(highestRowNumber, COL_MID_WS)] = { f: `ROUND(${toCell(highestRowNumber, COL_MID_PS)}*${majorWeight}/100,2)` };
      // Final PS/WS
      ws[toCell(highestRowNumber, COL_FINAL_PS)] = { f: `ROUND((${toCell(highestRowNumber, COL_FINAL_DISPLAY)}/${finalMax})*100,2)` };
      ws[toCell(highestRowNumber, COL_FINAL_WS)] = { f: `ROUND(${toCell(highestRowNumber, COL_FINAL_PS)}*${majorWeight}/100,2)` };
      // Quarterly and Rounded
      ws[toCell(highestRowNumber, COL_QUARTERLY)] = { f: `ROUND(${toCell(highestRowNumber, COL_ATT_WS)}+${toCell(highestRowNumber, COL_AS_WS)}+${toCell(highestRowNumber, COL_MID_WS)},2)` };
      ws[toCell(highestRowNumber, COL_ROUNDED)] = { f: `ROUND(${toCell(highestRowNumber, COL_QUARTERLY)},0)` };

      for (let i = 0; i < numStudents; i++) {
        const r = firstDataRow + i;
        // Attendance PS = (RS / maxAttendanceScore) * 100
        ws[toCell(r, COL_ATT_PS)] = { f: `ROUND((${toCell(r, COL_ATT_RS)}/${maxAttendanceScore})*100,2)` };
        // Attendance WS = PS * weight
        ws[toCell(r, COL_ATT_WS)] = { f: `ROUND(${toCell(r, COL_ATT_PS)}*${gradingBreakdown.attendance}/100,2)` };

        // Assignments PS = (RS / Total) * 100
        ws[toCell(r, COL_AS_PS)] = { f: `IFERROR(ROUND((${toCell(r, COL_AS_RS)}/${toCell(r, COL_AS_TOTAL)})*100,2),0)` };
        // Assignments WS = PS * weight
        ws[toCell(r, COL_AS_WS)] = { f: `ROUND(${toCell(r, COL_AS_PS)}*${gradingBreakdown.activity}/100,2)` };

        // Midterm PS from display cell text: "<RS> (<%>)"
        ws[toCell(r, COL_MID_PS)] = { f: `IFERROR(ROUND(VALUE(LEFT(${toCell(r, COL_MID_DISPLAY)},FIND(" ",${toCell(r, COL_MID_DISPLAY)})-1))/${maxMidtermScore}*100,2),0)` };
        // Midterm WS
        ws[toCell(r, COL_MID_WS)] = { f: `ROUND(${toCell(r, COL_MID_PS)}*${gradingBreakdown.midtermExam}/100,2)` };

        // Final Exam PS from display cell text
        ws[toCell(r, COL_FINAL_PS)] = { f: `IFERROR(ROUND(VALUE(LEFT(${toCell(r, COL_FINAL_DISPLAY)},FIND("/",${toCell(r, COL_FINAL_DISPLAY)})-1))/${maxFinalExamScore}*100,2),0)` };
        // Final Exam WS
        ws[toCell(r, COL_FINAL_WS)] = { f: `ROUND(${toCell(r, COL_FINAL_PS)}*${gradingBreakdown.finalExam}/100,2)` };

        // Quarterly Grade = Attendance WS + Assignments WS + Midterm WS
        ws[toCell(r, COL_QUARTERLY)] = { f: `ROUND(${toCell(r, COL_ATT_WS)}+${toCell(r, COL_AS_WS)}+${toCell(r, COL_MID_WS)},2)` };
        // Rounded Grade
        ws[toCell(r, COL_ROUNDED)] = { f: `ROUND(${toCell(r, COL_QUARTERLY)},0)` };
      }
      
      // Add worksheet to workbook
      XLSX.utils.book_append_sheet(wb, ws, 'Grades');
      
      // Generate filename
      const fileName = `SCMS_Grades_${gradesData.classroom?.class_code || 'Class'}_${new Date().toISOString().split('T')[0]}.xlsx`;
      
      // Save file
      XLSX.writeFile(wb, fileName);
      alert('Grades exported successfully!');
      
    } catch (error) {
      console.error('Error exporting grades:', error);
      alert('Error exporting grades. Please try again.');
    } finally {
      setExportLoading(false);
    }
  };

  const handleOnlineSetupCreate = (e) => {
    e.preventDefault();
    if (!quickGradeForm.type || !quickGradeForm.points) return;
    
    const newAssessmentId = Date.now();
    const newAssessment = {
      ...quickGradeForm,
      id: newAssessmentId,
      createdAt: new Date().toISOString(),
      assignedStudents: onlineAssignedStudents,
      attachments: onlineAttachments,
      isOnline: true
    };
    
    setQuickGradeAssessments(a => [...a, newAssessment]);
    
    // Initialize empty grading data for this assessment
    setGradingRows(prev => ({
      ...prev,
      [newAssessmentId]: []
    }));
    
    // Only reset Online Setup form fields
    setQuickGradeForm({ type: 'Assignment', title: '', points: '' });
    setOnlineAssignedStudents([]);
    setOnlineAttachments([]);
    setShowOnlineSetup(false);
    // Do NOT reset any Live Setup state here
  };

  // === Quick Grade State Variables ===
  const [selectedQuickGradeId, setSelectedQuickGradeId] = useState(null);




  // Class Tasks handlers
  // Loading state for posting/creating a task
  const [taskPostLoading, setTaskPostLoading] = useState(false);
  const handleTaskFormChange = (e) => {
    const { name, value } = e.target;
    setTaskForm(prev => ({ ...prev, [name]: value }));
  };

  const handleEditTaskFormChange = (e) => {
    const { name, value } = e.target;
    setEditTaskForm(prev => ({ ...prev, [name]: value }));
  };

  const handlePostTask = async (e) => {
    e.preventDefault();
    
    // Set submitted flag to true to show validation errors
    setTaskForm(prev => ({ ...prev, submitted: true }));
    
    // Check required fields
    if (!taskForm.title.trim() || !taskForm.points || !taskForm.text.trim()) {
      return;
    }
    
    try {
      setTaskPostLoading(true);
      // Convert postToClassrooms to actual class codes
      // 'current' should be replaced with the current classroom code
      const classCodes = (taskForm.postToClassrooms || []).map(classroom => {
        if (classroom === 'current') {
          return code; // Current classroom code
        }
        return classroom; // Other selected classroom codes
      });
      
      console.log('Selected classrooms:', taskForm.postToClassrooms);
      console.log('Class codes to send:', classCodes);
      console.log('Assigned students:', taskAssignedStudents);
      console.log('Students data:', students);
      
      // Prepare task data with student assignment fields - matching the endpoint format
      const taskData = {
        title: taskForm.title.trim(),
        type: mapTaskTypeToBackend(taskForm.type),
        points: parseInt(taskForm.points),
        instructions: taskForm.text.trim(),
        class_codes: classCodes, // Array of classroom codes
        assignment_type: taskAssignedStudents.length > 0 ? 'individual' : 'classroom',
        assigned_students: taskAssignedStudents.length > 0 ? taskAssignedStudents.map(studentId => {
          // Find the student to get their details
          const student = students.find(s => s.id === studentId);
          // For each student, we need to assign them to the appropriate class_code
          // If they're in multiple selected classrooms, we need to create entries for each
          return classCodes.map(classCode => ({
            student_id: studentId,
            class_code: classCode
          }));
        }).flat() : [], // Flatten the array since we're creating multiple entries per student
        allow_comments: true,
        is_draft: false,
        is_scheduled: false,
        scheduled_at: null,
        due_date: formatDueDate(taskForm.dueDate),
        attachment_type: taskAttachments.length > 0 ? 'file' : null,
        attachment_url: taskAttachments.length > 0 ? taskAttachments[0].name : null
      };
      
      console.log('🐛 DEBUG - Creating task with data:', taskData);
      console.log('🐛 DEBUG - Original taskForm.type:', taskForm.type);
      console.log('🐛 DEBUG - Mapped type:', mapTaskTypeToBackend(taskForm.type));
      
      // Enhanced task creation with multiple files, link attachments, and external links
      let response;
      
      // Separate file attachments from link attachments
      const fileAttachments = taskAttachments.filter(att => att.file);
      const linkAttachments = taskAttachments.filter(att => att.url && (att.type === 'Link' || att.type === 'YouTube' || att.type === 'Google Drive'));
      
      if (fileAttachments.length > 0 || linkAttachments.length > 0 || taskExternalLinks.length > 0) {
        if (fileAttachments.length > 0 && linkAttachments.length > 0 && taskExternalLinks.length > 0) {
          // All three types - use FormData with mixed attachments
          const formData = new FormData();
          
          // Add all task data fields - ensure arrays are properly serialized
          Object.keys(taskData).forEach(key => {
            if (key === 'class_codes' || key === 'assigned_students') {
              formData.append(key, JSON.stringify(taskData[key]));
            } else if (typeof taskData[key] === 'boolean') {
              formData.append(key, taskData[key] ? '1' : '0');
            } else if (taskData[key] === null || taskData[key] === undefined) {
              formData.append(key, '');
            } else {
              formData.append(key, taskData[key]);
            }
          });
          
          // Add external links as JSON string
          formData.append('external_links', JSON.stringify(taskExternalLinks));
          
          // Add link attachments
          linkAttachments.forEach((attachment, index) => {
            if (attachment.type === 'Link') {
              formData.append(`link_${index}`, attachment.url);
              formData.append(`link_title_${index}`, attachment.name || '');
            } else if (attachment.type === 'YouTube') {
              formData.append(`youtube_${index}`, attachment.url);
              formData.append(`youtube_title_${index}`, attachment.name || '');
            } else if (attachment.type === 'Google Drive') {
              formData.append(`gdrive_${index}`, attachment.url);
              formData.append(`gdrive_title_${index}`, attachment.name || '');
            }
          });
          
          // Add all file attachments using backend-compatible keys
          fileAttachments.forEach((attachment, index) => {
            const key = index === 0 ? 'attachment' : `attachment${index + 1}`;
            formData.append(key, attachment.file);
          });
          
          console.log('Sending FormData with files, links, and external links:', { fileAttachments, linkAttachments, taskExternalLinks });
          response = await apiService.createTask(formData);
        } else if (fileAttachments.length > 0 && linkAttachments.length > 0) {
          // Files and links only
          const formData = new FormData();
          
          // Add all task data fields - ensure arrays are properly serialized
          Object.keys(taskData).forEach(key => {
            if (key === 'class_codes' || key === 'assigned_students') {
              formData.append(key, JSON.stringify(taskData[key]));
            } else if (typeof taskData[key] === 'boolean') {
              formData.append(key, taskData[key] ? '1' : '0');
            } else if (taskData[key] === null || taskData[key] === undefined) {
              formData.append(key, '');
            } else {
              formData.append(key, taskData[key]);
            }
          });
          
          // Add link attachments
          linkAttachments.forEach((attachment, index) => {
            if (attachment.type === 'Link') {
              formData.append(`link_${index}`, attachment.url);
              formData.append(`link_title_${index}`, attachment.name || '');
            } else if (attachment.type === 'YouTube') {
              formData.append(`youtube_${index}`, attachment.url);
              formData.append(`youtube_title_${index}`, attachment.name || '');
            } else if (attachment.type === 'Google Drive') {
              formData.append(`gdrive_${index}`, attachment.url);
              formData.append(`gdrive_title_${index}`, attachment.name || '');
            }
          });
          
          // Add all file attachments
          fileAttachments.forEach((attachment, index) => {
            const key = index === 0 ? 'attachment' : `attachment${index + 1}`;
            formData.append(key, attachment.file);
          });
          
          console.log('Sending FormData with files and links:', { fileAttachments, linkAttachments });
          response = await apiService.createTask(formData);
        } else if (fileAttachments.length > 0 && taskExternalLinks.length > 0) {
          // Files and external links only
          const formData = new FormData();
          
          // Add all task data fields - ensure arrays are properly serialized
          Object.keys(taskData).forEach(key => {
            if (key === 'class_codes' || key === 'assigned_students') {
              formData.append(key, JSON.stringify(taskData[key]));
            } else if (typeof taskData[key] === 'boolean') {
              formData.append(key, taskData[key] ? '1' : '0');
            } else if (taskData[key] === null || taskData[key] === undefined) {
              formData.append(key, '');
            } else {
              formData.append(key, taskData[key]);
            }
          });
          
          // Add external links as JSON string
          formData.append('external_links', JSON.stringify(taskExternalLinks));
          
          // Add all file attachments using backend-compatible keys
          fileAttachments.forEach((attachment, index) => {
            const key = index === 0 ? 'attachment' : `attachment${index + 1}`;
            formData.append(key, attachment.file);
          });
          
          console.log('Sending FormData with files and external links:', { fileAttachments, taskExternalLinks });
          response = await apiService.createTask(formData);
        } else if (linkAttachments.length > 0 && taskExternalLinks.length > 0) {
          // Links and external links only
          const formData = new FormData();
          
          // Add all task data fields - ensure arrays are properly serialized
          Object.keys(taskData).forEach(key => {
            if (key === 'class_codes' || key === 'assigned_students') {
              formData.append(key, JSON.stringify(taskData[key]));
            } else if (typeof taskData[key] === 'boolean') {
              formData.append(key, taskData[key] ? '1' : '0');
            } else if (taskData[key] === null || taskData[key] === undefined) {
              formData.append(key, '');
            } else {
              formData.append(key, taskData[key]);
            }
          });
          
          // Add external links as JSON string
          formData.append('external_links', JSON.stringify(taskExternalLinks));
          
          // Add link attachments
          linkAttachments.forEach((attachment, index) => {
            if (attachment.type === 'Link') {
              formData.append(`link_${index}`, attachment.url);
              formData.append(`link_title_${index}`, attachment.name || '');
            } else if (attachment.type === 'YouTube') {
              formData.append(`youtube_${index}`, attachment.url);
              formData.append(`youtube_title_${index}`, attachment.name || '');
            } else if (attachment.type === 'Google Drive') {
              formData.append(`gdrive_${index}`, attachment.url);
              formData.append(`gdrive_title_${index}`, attachment.name || '');
            }
          });
          
          console.log('Sending FormData with links and external links:', { linkAttachments, taskExternalLinks });
          response = await apiService.createTask(formData);
        } else if (fileAttachments.length > 0) {
          // Files only - use multiple files method
          const files = fileAttachments.map(att => att.file).filter(Boolean);
          response = await apiService.createTaskWithMultipleFiles(taskData, files);
        } else if (linkAttachments.length > 0) {
          // Links only - use FormData with link attachments
          const formData = new FormData();
          
          // Add all task data fields - ensure arrays are properly serialized
          Object.keys(taskData).forEach(key => {
            if (key === 'class_codes' || key === 'assigned_students') {
              formData.append(key, JSON.stringify(taskData[key]));
            } else if (typeof taskData[key] === 'boolean') {
              formData.append(key, taskData[key] ? '1' : '0');
            } else if (taskData[key] === null || taskData[key] === undefined) {
              formData.append(key, '');
            } else {
              formData.append(key, taskData[key]);
            }
          });
          
          // Add link attachments
          linkAttachments.forEach((attachment, index) => {
            if (attachment.type === 'Link') {
              formData.append(`link_${index}`, attachment.url);
              formData.append(`link_title_${index}`, attachment.name || '');
            } else if (attachment.type === 'YouTube') {
              formData.append(`youtube_${index}`, attachment.url);
              formData.append(`youtube_title_${index}`, attachment.name || '');
            } else if (attachment.type === 'Google Drive') {
              formData.append(`gdrive_${index}`, attachment.url);
              formData.append(`gdrive_title_${index}`, attachment.name || '');
            }
          });
          
          console.log('Sending FormData with links only:', { linkAttachments });
          response = await apiService.createTask(formData);
        } else {
          // External links only - use external links method
          response = await apiService.createTaskWithExternalLinks(taskData, taskExternalLinks);
        }
      } else {
        // No attachments, send as JSON - ensure proper format for endpoint
        console.log('Sending JSON data:', taskData);
        console.log('Class codes being sent:', taskData.class_codes);
        console.log('Assigned students being sent:', taskData.assigned_students);
        response = await apiService.createTask(taskData);
      }
      
      if (response.status) {
        // Add the new task to the state
        // Combine all attachments for the new task
        const allAttachments = [
          ...fileAttachments.map(att => ({
            type: 'File',
            name: att.name,
            file: att.file,
            attachment_type: 'file',
            attachment_url: att.file ? URL.createObjectURL(att.file) : null
          })),
          ...linkAttachments.map(att => ({
            type: att.type,
            name: att.name,
            url: att.url,
            attachment_type: att.type === 'Link' ? 'link' : 
                             att.type === 'YouTube' ? 'youtube' : 
                             att.type === 'Google Drive' ? 'google_drive' : 'link'
          })),
          ...taskExternalLinks.map(link => ({
            type: link.type === 'youtube' ? 'YouTube' : 
                  link.type === 'google_drive' ? 'Google Drive' : 
                  link.type === 'link' ? 'Link' : 'Link',
            name: link.title || link.name || 'External Link',
            url: link.url,
            attachment_type: link.type
          }))
        ];

        const newTask = {
          ...response.data,
          id: response.data.task_id,
          author: 'Teacher',
          date: response.data.created_at,
          likes: 0,
          isLiked: false,
          isPinned: false,
          comments: [],
          attachments: allAttachments,
          assignedStudents: taskAssignedStudents
        };
        
        setTasks(prev => [newTask, ...prev]);
        
        // Remove the draft from drafts if we're editing one
        if (currentDraftId) {
          setTaskDrafts(prev => prev.filter(draft => draft.id !== currentDraftId));
        }
        
        // Reset form
        setTaskForm({
          type: 'Assignment',
          title: '',
          text: '',
          dueDate: '',
          points: '',
      
          attachments: [],
          visibleTo: [],
          postToClassrooms: ['current'],
          assignedStudents: [],
          submitted: false
        });
        setTaskAttachments([]);
        setTaskExternalLinks([]);
        setTaskAssignedStudents([]);
        setCurrentDraftId(null);
        
        // Show success message
        alert('Task created successfully!');
      } else {
        alert(response.message || 'Failed to create task');
      }
    } catch (error) {
      console.error('Error creating task:', error);
      alert(error.message || 'Failed to create task');
    } finally {
      setTaskPostLoading(false);
    }
  };
  const handleSaveTaskDraft = async () => {
    setTaskForm(prev => ({ ...prev, submitted: true }));
    if (!taskForm.title.trim() || !taskForm.points || !taskForm.text.trim()) {
      return;
    }

    try {
      // Prepare the API payload
      const taskData = {
        title: taskForm.title.trim(),
        type: mapTaskTypeToBackend(taskForm.type),
        points: parseInt(taskForm.points),
        instructions: taskForm.text.trim(),
        class_codes: taskForm.postToClassrooms && taskForm.postToClassrooms.length > 0 
          ? taskForm.postToClassrooms.map(cls => cls === 'current' ? code : cls)
          : [code],
        assignment_type: taskAssignedStudents.length > 0 ? 'individual' : 'classroom',
        assigned_students: taskAssignedStudents.length > 0 ? taskAssignedStudents.map(studentId => {
          const student = students.find(s => s.id === studentId);
          return {
            student_id: studentId,
            class_code: code // Current classroom code
          };
        }) : [],
        allow_comments: 1,
        is_draft: true, // This is a draft
        is_scheduled: false,
        scheduled_at: null,
        attachment_type: taskAttachments.length > 0 ? 'file' : null,
        attachment_url: taskAttachments.length > 0 ? taskAttachments[0].name : null,
        due_date: formatDueDate(taskForm.dueDate)
      };

      console.log('🐛 DEBUG - Creating draft task with data:', taskData);
      console.log('🐛 DEBUG - Original taskForm.type:', taskForm.type);
      console.log('🐛 DEBUG - Mapped type:', mapTaskTypeToBackend(taskForm.type));
      
      // Validate required data
      if (!code) {
        alert('Error: Classroom code is missing. Please refresh the page and try again.');
        return;
      }

      // If there are file attachments, use FormData
      let response;
      if (taskAttachments.length > 0) {
        const formData = new FormData();
        
        // Add each task field individually to FormData
        formData.append('title', taskData.title);
        formData.append('type', taskData.type);
        formData.append('points', taskData.points);
        formData.append('instructions', taskData.instructions);
        formData.append('class_codes', JSON.stringify(taskData.class_codes));
        formData.append('allow_comments', taskData.allow_comments ? '1' : '0');
        formData.append('is_draft', taskData.is_draft ? '1' : '0');
        formData.append('is_scheduled', taskData.is_scheduled ? '1' : '0');
        formData.append('scheduled_at', taskData.scheduled_at || '');
        formData.append('due_date', taskData.due_date || '');
        formData.append('attachment_type', taskData.attachment_type || '');
        formData.append('attachment_url', taskData.attachment_url || '');
        formData.append('assignment_type', taskData.assignment_type);
        formData.append('assigned_students', JSON.stringify(taskData.assigned_students));
        
        // Add the first file attachment (backend expects single file)
        if (taskAttachments.length > 0 && taskAttachments[0].file) {
          formData.append('attachment', taskAttachments[0].file);
        }
        
        console.log('Sending FormData with files for draft:', taskAttachments);
        response = await apiService.createTask(formData);
      } else {
        // No files, send as JSON
        console.log('Sending JSON data for draft:', taskData);
        response = await apiService.post('/tasks/create', taskData);
      }
      
      if (response.status && response.data) {
        console.log('Task draft saved successfully:', response.data);
        
        // Add to local state for immediate display
        const draft = {
          id: response.data.task_id || Date.now(),
          ...taskForm,
          lastEdited: new Date().toISOString(),
          attachments: [...taskAttachments],
          visibleTo: [...taskAssignedStudents],
          api_response: response.data
        };
        
        setTaskDrafts(prev => {
          if (currentDraftId) {
            // Update existing draft
            return prev.map(d => d.id === currentDraftId ? draft : d);
          } else {
            // Add new draft
            return [draft, ...prev];
          }
        });

        // Reset form
        setTaskForm({
          type: 'Assignment',
          title: '',
          text: '',
          dueDate: '',
          points: '',
      
          attachments: [],
          visibleTo: [],
          postToClassrooms: ['current'],
          submitted: false
        });
        setTaskAttachments([]);
        setTaskAssignedStudents([]);
        setCurrentDraftId(null);
        setTaskFormExpanded(false);
        
        // Show drafts tab after saving
        setShowTaskDraftsCollapse(true);
        setShowTaskScheduledCollapse(false);
        
        alert("Task draft saved successfully!");
      } else {
        throw new Error('Failed to save task draft');
      }
    } catch (error) {
      console.error('Error saving task draft:', error);
      console.error('Error response:', error.response);
      console.error('Error status:', error.response?.status);
      console.error('Error data:', error.response?.data);
      
      let errorMessage = 'Error saving task draft';
      if (error.response?.data?.message) {
        errorMessage += `: ${error.response.data.message}`;
      } else if (error.message) {
        errorMessage += `: ${error.message}`;
      } else {
        errorMessage += ': Unknown error occurred';
      }
      
      alert(errorMessage);
    }
  };

  const handleScheduleTask = async () => {
    if (!taskScheduleDate || !taskScheduleTime) {
      alert("Please select both date and time for scheduling.");
      return;
    }

    if (!taskForm.title.trim() || !taskForm.points || !taskForm.text.trim()) {
      alert("Please fill in all required fields (title, points, and description).");
      return;
    }

    try {
      const scheduledDateTime = `${taskScheduleDate}T${taskScheduleTime}`;
      
      // Prepare the API payload
      const taskData = {
        title: taskForm.title.trim(),
        type: mapTaskTypeToBackend(taskForm.type),
        points: parseInt(taskForm.points),
        instructions: taskForm.text.trim(),
        class_codes: taskForm.postToClassrooms && taskForm.postToClassrooms.length > 0 
          ? taskForm.postToClassrooms.map(cls => cls === 'current' ? code : cls)
          : [code],
        assignment_type: taskAssignedStudents.length > 0 ? 'individual' : 'classroom',
        assigned_students: taskAssignedStudents.length > 0 ? taskAssignedStudents.map(studentId => {
          const student = students.find(s => s.id === studentId);
          return {
            student_id: studentId,
            class_code: code // Current classroom code
          };
        }) : [],
        allow_comments: 1,
        is_draft: false, // This is scheduled, not a draft
        is_scheduled: true, // This is scheduled
        scheduled_at: scheduledDateTime,
        attachment_type: taskAttachments.length > 0 ? 'file' : null,
        attachment_url: taskAttachments.length > 0 ? taskAttachments[0].name : null,
        due_date: formatDueDate(taskForm.dueDate)
      };

      console.log('Scheduling task with data:', taskData);
      
      // Validate required data
      if (!code) {
        alert('Error: Classroom code is missing. Please refresh the page and try again.');
        return;
      }

      // If there are file attachments, use FormData
      let response;
      if (taskAttachments.length > 0) {
        const formData = new FormData();
        
        // Add each task field individually to FormData
        formData.append('title', taskData.title);
        formData.append('type', taskData.type);
        formData.append('points', taskData.points);
        formData.append('instructions', taskData.instructions);
        formData.append('class_codes', JSON.stringify(taskData.class_codes));
        formData.append('allow_comments', taskData.allow_comments ? '1' : '0');
        formData.append('is_draft', taskData.is_draft ? '1' : '0');
        formData.append('is_scheduled', taskData.is_scheduled ? '1' : '0');
        formData.append('scheduled_at', taskData.scheduled_at || '');
        formData.append('due_date', taskData.due_date || '');
        formData.append('attachment_type', taskData.attachment_type || '');
        formData.append('attachment_url', taskData.attachment_url || '');
        formData.append('assignment_type', taskData.assignment_type);
        formData.append('assigned_students', JSON.stringify(taskData.assigned_students));
        
        // Add the first file attachment (backend expects single file)
        if (taskAttachments.length > 0 && taskAttachments[0].file) {
          formData.append('attachment', taskAttachments[0].file);
        }
        
        console.log('Sending FormData with files for scheduled task:', taskAttachments);
        response = await apiService.createTask(formData);
      } else {
        // No files, send as JSON
        console.log('Sending JSON data for scheduled task:', taskData);
        response = await apiService.post('/tasks/create', taskData);
      }
      
      if (response.status && response.data) {
        console.log('Task scheduled successfully:', response.data);
        
        // Add to local state for immediate display
        const scheduledTask = {
          id: response.data.task_id || Date.now(),
          ...taskForm,
          scheduledFor: scheduledDateTime,
          lastEdited: new Date().toISOString(),
          attachments: [...taskAttachments],
          visibleTo: [...taskAssignedStudents],
          status: 'scheduled',
          api_response: response.data
        };

        setTaskScheduled(prev => [scheduledTask, ...prev]);
        
        // Reset form
        setTaskForm({
          type: 'Assignment',
          title: '',
          text: '',
          dueDate: '',
          points: '',
      
          attachments: [],
          visibleTo: [],
          postToClassrooms: ['current'],
          submitted: false
        });
        setTaskAttachments([]);
        setTaskAssignedStudents([]);
        setTaskScheduleDate('');
        setTaskScheduleTime('');
        setShowTaskScheduleModal(false);
        setTaskFormExpanded(false);
        
        alert(`Task scheduled successfully for ${new Date(scheduledDateTime).toLocaleString()}`);
      } else {
        throw new Error('Failed to schedule task');
      }
    } catch (error) {
      console.error('Error scheduling task:', error);
      console.error('Error response:', error.response);
      console.error('Error status:', error.response?.status);
      console.error('Error data:', error.response?.data);
      
      let errorMessage = 'Error scheduling task';
      if (error.response?.data?.message) {
        errorMessage += `: ${error.response.data.message}`;
      } else if (error.message) {
        errorMessage += `: ${error.message}`;
      } else {
        errorMessage += ': Unknown error occurred';
      }
      
      alert(errorMessage);
    }
  };

  const handleCancelTaskPost = () => {
    setTaskForm({
      type: 'Assignment',
      title: '',
      text: '',
      dueDate: '',
      points: '',
  
      attachments: [],
      visibleTo: [],
      postToClassrooms: ['current'],
      submitted: false
    });
            setTaskAttachments([]);
        setTaskExternalLinks([]);
        setTaskAssignedStudents([]);
        setCurrentDraftId(null); // <-- reset after cancel
  };

  const handleTaskFileChange = (e) => {
    const files = Array.from(e.target.files);
    const newAttachments = files.map(file => ({
      file,
      name: file.name,
      type: 'File',
      size: file.size
    }));
    setTaskAttachments(prev => [...prev, ...newAttachments]);
  };

  const handleEditTaskFileChange = (e) => {
    const files = Array.from(e.target.files);
    const newAttachments = files.map(file => ({
      file,
      name: file.name,
      type: 'File',
      size: file.size
    }));
    setEditTaskAttachments(prev => [...prev, ...newAttachments]);
  };

  const handleRemoveTaskAttachment = (idx) => {
    setTaskAttachments(prev => prev.filter((_, i) => i !== idx));
  };

  const handleRemoveEditTaskAttachment = (idx) => {
    setEditTaskAttachments(prev => prev.filter((_, i) => i !== idx));
  };

  // Task attachment handlers
  const handleAddTaskLink = () => {
    let url = taskLinkInput.trim();
    setTaskLinkError("");
    if (!url) {
      setTaskLinkError("Please enter a link URL");
      return;
    }
    let formatted = url;
    let valid = false;
    try {
      const urlObj = new URL(formatted);
      if (urlObj.protocol && urlObj.hostname) valid = true;
    } catch {}
    if (!valid) {
      if (/[^a-zA-Z0-9.-]/.test(url)) {
        setTaskLinkError("Please enter a valid URL or word (no spaces or special characters)");
        return;
      }
      formatted = `https://${url}.com`;
      try {
        const urlObj = new URL(formatted);
        if (urlObj.protocol && urlObj.hostname) valid = true;
      } catch {}
    }
    if (!valid) {
      setTaskLinkError("Could not autoformat to a valid link. Please check your input.");
      return;
    }
    setTaskAttachments(prev => [...prev, { type: "Link", url: formatted, name: formatted }]);
    setTaskLinkInput("");
    setTaskLinkError("");
    setShowTaskLinkModal(false);
  };

  const handleAddTaskYouTube = () => {
    if (taskYouTubeInput.trim()) {
      setTaskAttachments(prev => [...prev, { type: "YouTube", url: taskYouTubeInput, name: taskYouTubeInput }]);
      setTaskYouTubeInput("");
      setShowTaskYouTubeModal(false);
    }
  };

  const handleAddTaskDrive = () => {
    const url = (taskDriveInput || '').trim();
    if (!url) return;
    // Basic formatting: ensure it looks like a URL
    let formatted = url;
    if (!/^https?:\/\//i.test(formatted)) {
      formatted = `https://${formatted}`;
    }
    setTaskAttachments(prev => [...prev, { type: 'Google Drive', url: formatted, name: formatted }]);
    setTaskDriveInput('');
    setShowTaskDriveModal(false);
  };

  // External link handlers for task creation
  const handleAddTaskExternalLink = () => {
    if (newTaskLink.name && newTaskLink.url) {
      setTaskExternalLinks(prev => [...prev, { ...newTaskLink }]);
      setNewTaskLink({ name: '', url: '', type: 'link' });
      setShowTaskLinkInput(false);
    }
  };

  const handleRemoveTaskExternalLink = (index) => {
    setTaskExternalLinks(prev => prev.filter((_, i) => i !== index));
  };

  const handleTaskLinkTypeChange = (type) => {
    setNewTaskLink(prev => ({ ...prev, type }));
  };

  // Helper function to format due date correctly in local timezone
  const formatDueDate = (dateString) => {
    if (!dateString) return null;
    
    // Parse the date string and ensure it's treated as local time
    const [datePart, timePart] = dateString.split('T');
    const [year, month, day] = datePart.split('-').map(Number);
    const [hours, minutes] = timePart ? timePart.split(':').map(Number) : [23, 59];
    
    // Create date in local timezone
    const localDate = new Date(year, month - 1, day, hours, minutes);
    
    // Format as YYYY-MM-DD HH:MM:SS in local timezone
    const yearStr = localDate.getFullYear();
    const monthStr = String(localDate.getMonth() + 1).padStart(2, '0');
    const dayStr = String(localDate.getDate()).padStart(2, '0');
    const hoursStr = String(localDate.getHours()).padStart(2, '0');
    const minutesStr = String(localDate.getMinutes()).padStart(2, '0');
    
    return `${yearStr}-${monthStr}-${dayStr} ${hoursStr}:${minutesStr}:00`;
  };
  const handleLikeTask = (taskId) => {
    setTasks(prev => prev.map(task => 
      task.id === taskId 
        ? { ...task, isLiked: !task.isLiked, likes: task.isLiked ? task.likes - 1 : task.likes + 1 }
        : task
    ));
  };

  const handlePinTask = (taskId) => {
    setTasks(prev => prev.map(task => 
      task.id === taskId 
        ? { ...task, isPinned: !task.isPinned }
        : task
    ));
  };

  const [editingTaskId, setEditingTaskId] = useState(null);
  const [showEditTaskModal, setShowEditTaskModal] = useState(false);
  const [editTaskForm, setEditTaskForm] = useState({
    type: 'Assignment',
    title: '',
    text: '',
    dueDate: '',
    points: '',

    attachments: [],
    visibleTo: [],
    postToClassrooms: ['current'],
    submitted: false
  });
  const [editTaskAttachments, setEditTaskAttachments] = useState([]);

  const handleEditTask = (taskId) => {
    console.log('Editing task with ID:', taskId);
    console.log('Available tasks:', tasks);
    
    // Find the task using the prioritized ID field
    const task = tasks.find(t => (t.task_id || t.id || t._id || t.taskId) === taskId);
    
    if (task) {
      console.log('Found task to edit:', task);
      
      // Set editing state
      setEditingTaskId(taskId);
      
      // Format due date for datetime-local input
      let formattedDueDate = '';
      if (task.due_date) {
        const dueDate = new Date(task.due_date);
        formattedDueDate = dueDate.toISOString().slice(0, 16); // Format: YYYY-MM-DDTHH:MM
      }
      
      // Handle class_codes - it might be a string, array, or undefined
      let classCodes = ['current'];
      if (task.class_codes) {
        if (Array.isArray(task.class_codes)) {
          classCodes = task.class_codes;
        } else if (typeof task.class_codes === 'string') {
          try {
            // Try to parse as JSON if it's a string
            const parsed = JSON.parse(task.class_codes);
            classCodes = Array.isArray(parsed) ? parsed : ['current'];
          } catch (e) {
            // If parsing fails, treat as single code
            classCodes = [task.class_codes];
          }
        } else {
          classCodes = [task.class_codes];
        }
      }
      
      // Populate the edit form with task data
      setEditTaskForm({
        type: mapTaskTypeToFrontend(task.type) || 'Assignment',
        title: task.title || '',
        text: task.instructions || task.text || '',
        dueDate: formattedDueDate,
        points: task.points || '',

        attachments: [],
        visibleTo: [],
        postToClassrooms: classCodes,
        submitted: false
      });
      
      // Set attachments if any - handle both single attachment and attachments array
      if (task.attachments && Array.isArray(task.attachments) && task.attachments.length > 0) {
        // Handle attachments array
        const editAttachments = task.attachments.map(att => ({
          name: att.name || att.original_name || 'Attachment',
          type: att.type || att.attachment_type || 'file',
          url: att.url || att.attachment_url,
          file: att.file,
          attachment_type: att.attachment_type || 'file'
        }));
        setEditTaskAttachments(editAttachments);
      } else if (task.attachment_url) {
        // Handle single attachment (legacy format)
        setEditTaskAttachments([{
          name: task.attachment_url,
          type: task.attachment_type || 'file',
          url: task.attachment_url,
          attachment_type: task.attachment_type || 'file'
        }]);
      } else {
        setEditTaskAttachments([]);
      }
      
      // Open the edit modal
      setShowEditTaskModal(true);
      
      console.log('Edit form populated with task data:', {
        type: task.type,
        title: task.title,
        text: task.instructions,
        dueDate: formattedDueDate,
        points: task.points,

      });
    } else {
      console.error('Task not found for editing:', taskId);
      alert('Task not found for editing');
    }
  };

  const handleUpdateTask = async (e) => {
    if (e && e.preventDefault) {
      e.preventDefault();
    }
    
    if (!editingTaskId) return;
    
    console.log('Updating task with ID:', editingTaskId);
    console.log('Edit form data:', editTaskForm);
    
    setEditTaskForm(prev => ({ ...prev, submitted: true }));
    
    if (!editTaskForm.title.trim() || !editTaskForm.points || !editTaskForm.text.trim()) {
      return;
    }
    
    try {
      // Process class codes
      const classCodes = (editTaskForm.postToClassrooms || []).map(classroom => {
        if (classroom === 'current') {
          return code; // Current classroom code
        }
        return classroom; // Other selected classroom codes
      });

      // Format due date if available
      const formattedDueDate = editTaskForm.dueDate ? new Date(editTaskForm.dueDate).toISOString().slice(0, 19).replace('T', ' ') : null;

      const taskData = {
        title: editTaskForm.title.trim(),
        type: mapTaskTypeToBackend(editTaskForm.type),
        points: parseInt(editTaskForm.points),
        instructions: editTaskForm.text.trim(),
        class_codes: classCodes,
        allow_comments: 1,
        due_date: formattedDueDate,
        attachment_type: editTaskAttachments.length > 0 ? 'file' : null,
        attachment_url: editTaskAttachments.length > 0 ? editTaskAttachments[0].name : null
      };

      // Separate attachments by type
      const fileAttachments = editTaskAttachments.filter(att => att.file);
      const linkAttachments = editTaskAttachments.filter(att => !att.file && (att.type === 'Link' || att.type === 'YouTube' || att.type === 'Google Drive'));
      
      console.log('Sending update data:', taskData);
      
      let response;
      if (editTaskAttachments.length > 0 && editTaskAttachments[0].file) {
        // Handle file upload with FormData
        const formData = new FormData();
        formData.append('title', taskData.title);
        formData.append('type', taskData.type);
        formData.append('points', taskData.points);
        formData.append('instructions', taskData.instructions);
        formData.append('class_codes', JSON.stringify(taskData.class_codes));
        formData.append('allow_comments', taskData.allow_comments ? '1' : '0');
        formData.append('due_date', taskData.due_date || '');
        formData.append('attachment_type', taskData.attachment_type || '');
        formData.append('attachment_url', taskData.attachment_url || '');

        editTaskAttachments.forEach((attachment, index) => {
          if (attachment.file) {
            formData.append(`attachment_${index}`, attachment.file);
          }
        });
        
        // Use the createTask method for FormData (it handles both create and update)
        response = await apiService.createTask(formData);
      } else {
        // Use JSON for update without files
        response = await apiService.updateTask(editingTaskId, taskData);
      }
      
      if (response.status) {
        console.log('Task updated successfully:', response);
        
        // Update the task in state using the prioritized ID field
        // Combine all attachments for the updated task
        const allAttachments = [
          ...fileAttachments.map(att => ({
            type: 'File',
            name: att.name,
            file: att.file,
            attachment_type: 'file',
            attachment_url: att.file ? URL.createObjectURL(att.file) : null
          })),
          ...linkAttachments.map(att => ({
            type: att.type,
            name: att.name,
            url: att.url,
            attachment_type: att.type === 'Link' ? 'link' : 
                             att.type === 'YouTube' ? 'youtube' : 
                             att.type === 'Google Drive' ? 'google_drive' : 'link'
          }))
        ];

        setTasks(prev => prev.map(task => 
          (task.task_id || task.id || task._id || task.taskId) === editingTaskId 
            ? { 
                ...task, 
                title: response.data.title,
                type: response.data.type,
                points: response.data.points,
                attachments: allAttachments,
                instructions: response.data.instructions,
                allow_comments: response.data.allow_comments,
                due_date: response.data.due_date,
                class_codes: response.data.class_codes,
                attachment_type: response.data.attachment_type,
                attachment_url: response.data.attachment_url,
                updated_at: response.data.updated_at
              }
            : task
        ));
        
        // Reset form and close modal
        setEditTaskForm({
          type: 'Assignment',
          title: '',
          text: '',
          dueDate: '',
          points: '',
      
          attachments: [],
          visibleTo: [],
          postToClassrooms: ['current'],
          submitted: false
        });
        setEditTaskAttachments([]);
        setEditingTaskId(null);
        setShowEditTaskModal(false);
        
        alert('Task updated successfully!');
      } else {
        alert(response.message || 'Failed to update task');
      }
    } catch (error) {
      console.error('Error updating task:', error);
      alert(error.message || 'Failed to update task');
    }
  };

  const handleCancelEditTask = () => {
    console.log('Canceling task edit');
    setEditingTaskId(null);
    setEditTaskForm({
      type: 'Assignment',
      title: '',
      text: '',
      dueDate: '',
      points: '',
  
      attachments: [],
      visibleTo: [],
      postToClassrooms: ['current'],
      submitted: false
    });
    setEditTaskAttachments([]);
    setShowEditTaskModal(false);
  };

  const handlePublishTask = async (taskId) => {
    try {
      const response = await apiService.publishTask(taskId);
      
      if (response.status) {
        setTasks(prev => prev.map(task => 
          task.id === taskId 
            ? { ...task, is_draft: false, status: 'active' }
            : task
        ));
        alert('Task published successfully!');
      } else {
        alert(response.message || 'Failed to publish task');
      }
    } catch (error) {
      console.error('Error publishing task:', error);
      alert(error.message || 'Failed to publish task');
    }
  };

  const handleArchiveTask = async (taskId) => {
    // eslint-disable-next-line no-restricted-globals
    if (!confirm('Are you sure you want to archive this task?')) {
      return;
    }
    
    try {
      const response = await apiService.archiveTask(taskId);
      
      if (response.status) {
        setTasks(prev => prev.filter(task => (task.task_id || task.id || task._id || task.taskId) !== taskId));
        alert('Task archived successfully!');
      } else {
        alert(response.message || 'Failed to archive task');
      }
    } catch (error) {
      console.error('Error archiving task:', error);
      alert(error.message || 'Failed to archive task');
    }
  };

  const handleDeleteTask = async (taskId) => {
    console.log('Attempting to delete task with ID:', taskId);
    console.log('Task ID type:', typeof taskId);
    
    // eslint-disable-next-line no-restricted-globals
    if (!confirm('Are you sure you want to delete this task?')) {
      return;
    }
    
    try {
      console.log('Making API call to delete task:', taskId);
      const response = await apiService.deleteTask(taskId);
      console.log('Delete API response:', response);
      
      if (response.status) {
        console.log('Task deleted successfully from API');
        setTasks(prev => prev.filter(task => (task.task_id || task.id || task._id || task.taskId) !== taskId));
        alert('Task deleted successfully!');
        
        // Check if we're currently on the task detail page for this task
        const currentPath = window.location.pathname;
        if (currentPath.includes(`/task/${taskId}`)) {
          // Get classroom code from localStorage or current URL
          let classroomCode = null;
          const currentClassroom = localStorage.getItem('currentClassroom');
          if (currentClassroom) {
            try {
              const classroomData = JSON.parse(currentClassroom);
              classroomCode = classroomData.code;
            } catch (e) {
              console.error('Error parsing classroom data:', e);
            }
          }
          
          if (classroomCode) {
            // Navigate back to classroom detail with "class" tab active
            window.location.href = `/teacher/classroom/${classroomCode}?tab=class`;
          } else {
            // Fallback to previous page
            window.history.back();
          }
        }
      } else {
        console.error('API returned error status:', response);
        alert(response.message || 'Failed to delete task');
      }
    } catch (error) {
      console.error('Error deleting task:', error);
      console.error('Error details:', {
        message: error.message,
        response: error.response,
        status: error.response?.status,
        data: error.response?.data
      });
      alert(error.message || 'Failed to delete task');
    }
  };

  const handlePostTaskComment = async (taskId) => {
    const commentText = taskCommentInputs[taskId];
    if (!commentText?.trim()) return;
    
    try {
      const response = await apiService.addTaskComment(taskId, {
        comment: commentText.trim()
      });
      
      if (response.status) {
        // Refresh the task to get updated comments
        const taskResponse = await apiService.getTaskDetails(taskId);
        if (taskResponse.status) {
          setTasks(prev => prev.map(task => 
            (task.task_id || task.id || task._id || task.taskId) === taskId 
              ? { ...task, comments: taskResponse.data.comments || [] }
              : task
          ));
        }
        
        setTaskCommentInputs(prev => ({ ...prev, [taskId]: '' }));
      } else {
        alert(response.message || 'Failed to add comment');
      }
    } catch (error) {
      console.error('Error adding comment:', error);
      alert(error.message || 'Failed to add comment');
    }
  };

  const handleEditTaskComment = (taskId, commentIdx, text) => {
    setTasks(prev => prev.map(task => 
      task.id === taskId 
        ? { 
            ...task, 
            comments: task.comments.map((comment, idx) => 
              idx === commentIdx ? { ...comment, text } : comment
            )
          }
        : task
    ));
  };

  const handleDeleteTaskComment = (taskId, commentIdx) => {
    setTasks(prev => prev.map(task => 
      task.id === taskId 
        ? { 
            ...task, 
            comments: task.comments.filter((_, idx) => idx !== commentIdx)
          }
        : task
    ));
  };

  if (!classInfo) {
    return (
      <div>
        <Header compact />
        <div className="container mt-4">
          <Alert color="warning">
            <h4>Class Not Found</h4>
            <p>The class with code "{code}" could not be found.</p>
          </Alert>
        </div>
      </div>
    );
  }

  // Add this at the top of the ClassroomDetail component, before the return statement
  console.log('Top-level editingComment state:', editingComment);
  return (
    <div>
      <Header compact />
      <div className="container mt-4">
        <div style={{
          borderRadius: 18,
          background: selectedTheme && selectedTheme.startsWith('data:image') ? `url('${selectedTheme}')` : selectedTheme,
          color: "#fff",
          minHeight: 170,
          boxShadow: "0 4px 24px rgba(44,62,80,0.13)",
          marginBottom: 32,
          position: 'relative',
          overflow: 'hidden',
          padding: '32px 40px',
          display: 'flex',
          alignItems: 'flex-start',
          justifyContent: 'space-between',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundRepeat: 'no-repeat',
        }}>
          {/* Overlay for image themes and custom photo */}
          {selectedTheme && (selectedTheme.startsWith('url(') || selectedTheme.startsWith('data:image')) && (
            <div style={{
              position: 'absolute',
              top: 0,
              left: 0,
              width: '100%',
              height: '100%',
              background: 'rgba(0,0,0,0.38)',
              zIndex: 1
            }} />
          )}
          <div style={{ position: 'relative', zIndex: 2 }}>
            <h1 style={{ 
              fontWeight: 800, 
              letterSpacing: 1, 
              color: '#fff', 
              textShadow: '0 2px 8px rgba(0,0,0,0.7), 0 1px 0 #000' 
            }}>
              {classInfo.name} <span style={{ fontWeight: 400, fontSize: 22, opacity: 0.92, color: '#fff', textShadow: '0 2px 8px rgba(0,0,0,0.7), 0 1px 0 #000' }}>({classInfo.section})</span>
            </h1>
            <div style={{ fontSize: 20, opacity: 0.95, fontWeight: 500 }}>{classInfo.subject}</div>
            <div className="mt-3 d-flex align-items-center flex-wrap">
              <span style={{ fontWeight: 600, fontSize: 18 }}>Class Code:</span>
              <span 
                style={{ 
                  background: '#fff', 
                  color: '#007bff', 
                  borderRadius: 10, 
                  padding: '4px 16px', 
                  fontWeight: 800, 
                  fontSize: 20, 
                  marginLeft: 14, 
                  letterSpacing: 2, 
                  boxShadow: '0 2px 8px rgba(44,62,80,0.10)',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease'
                }}
                onClick={() => setShowQRCodeModal(true)}
                onMouseEnter={(e) => {
                  e.target.style.transform = 'scale(1.05)';
                  e.target.style.boxShadow = '0 4px 12px rgba(44,62,80,0.20)';
                }}
                onMouseLeave={(e) => {
                  e.target.style.transform = 'scale(1)';
                  e.target.style.boxShadow = '0 2px 8px rgba(44,62,80,0.10)';
                }}
                title="Click to view QR code and copy class code"
              >
                {classInfo.code}
              </span>
              <Button 
                color="link" 
                size="sm" 
                id={`copyCodeBtn-${classInfo.code}`} 
                style={{ color: '#007bff', marginLeft: 4, fontSize: 18, padding: 0, cursor: 'pointer' }} 
                onClick={handleCopyCode} 
                aria-label="Copy class code"
              >
                <i className="ni ni-single-copy-04" />
              </Button>
              <Tooltip 
                placement="top" 
                isOpen={tooltipHover || copied} 
                target={`copyCodeBtn-${classInfo.code}`} 
                toggle={() => setTooltipHover(!tooltipHover)}
              >
                {copied ? "Copied!" : "Copy code"}
              </Tooltip>
              <Button 
                color="link" 
                size="sm" 
                style={{ color: '#fff', marginLeft: 8, fontSize: 20 }} 
                onClick={() => setShowCodeModal(true)} 
                title="Display"
              >
                <i className="ni ni-fullscreen-2" />
              </Button>
            </div>
            <div className="mt-2">
              <Badge color="light" className="text-dark me-2">{classInfo.semester}</Badge>
              <Badge color="light" className="text-dark" style={{ marginLeft: 8 }}>{classInfo.schoolYear}</Badge>
            </div>
          </div>
          <div className="d-flex flex-column align-items-end" style={{ minWidth: 160, position: 'relative', zIndex: 2 }}>
            <Button 
              color="link" 
              style={{ color: '#fff', fontWeight: 400, fontSize: 13, padding: 0, marginBottom: 4, textDecoration: 'none' }} 
              onClick={() => setShowThemeModal(true)}
            >
              Select theme
            </Button>

          </div>
          <svg viewBox="0 0 1440 60" style={{ position: 'absolute', bottom: 0, left: 0, width: '100%', height: 60 }} xmlns="http://www.w3.org/2000/svg">
            <path fill="#fff" fillOpacity="1" d="M0,32L48,37.3C96,43,192,53,288,49.3C384,45,480,27,576,21.3C672,16,768,32,864,37.3C960,43,1056,27,1152,21.3C1248,16,1344,32,1392,40.7L1440,48L1440,160L1392,160C1344,160,1248,160,1152,160C1056,160,960,160,864,160C768,160,672,160,576,160C480,160,384,160,288,160C192,160,96,160,48,160L0,160Z"></path>
          </svg>
        </div>

        {/* Code Display Modal */}
        <Modal isOpen={showCodeModal} toggle={() => setShowCodeModal(false)} centered>
          <ModalHeader toggle={() => setShowCodeModal(false)} style={{ border: 'none' }} />
          <ModalBody className="text-center">
            <div style={{ fontSize: 64, fontWeight: 800, color: '#1976d2', letterSpacing: 2, marginBottom: 16 }}>{classInfo.code}</div>
            <div style={{ fontSize: 20, color: '#222', fontWeight: 600 }}>{classInfo.name}</div>
          </ModalBody>
        </Modal>

        {/* QR Code Modal */}
        <Modal isOpen={showQRCodeModal} toggle={() => setShowQRCodeModal(false)} size="md" centered>
          <ModalHeader toggle={() => setShowQRCodeModal(false)} style={{ border: "none", paddingBottom: "0" }}>
            <h4 className="mb-0 text-primary">
              <i className="ni ni-bell-55 mr-2"></i>
              Class Join Information
            </h4>
          </ModalHeader>
          <ModalBody className="text-center">
            {classInfo && (
              <>
                <div className="mb-4">
                  <h5 className="text-dark mb-2">{classInfo.name}</h5>
                  <p className="text-muted mb-3">{classInfo.section}</p>
                  
                  {/* QR Code */}
                  <div className="mb-4 p-3 bg-light rounded" style={{ display: 'inline-block' }}>
                    <div className="qr-code-container">
                      {/* Generate QR code for the class code */}
                      <div 
                        className="qr-code"
                        style={{
                          width: '200px',
                          height: '200px',
                          background: '#fff',
                          border: '2px solid #e9ecef',
                          borderRadius: '8px',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          margin: '0 auto',
                          padding: '10px'
                        }}
                      >
                        <QRCodeSVG 
                          value={`${window.location.origin}/student/join/${classInfo.code}`}
                          size={180}
                          level="M"
                          includeMargin={true}
                        />
                      </div>
                      <div className="text-center mt-2">
                        <small className="text-muted">Scan to join class</small>
                      </div>
                    </div>
                  </div>
                  
                  {/* Class Code Display */}
                  <div className="mb-3">
                    <h6 className="text-dark mb-2">Class Code:</h6>
                    <div className="d-flex align-items-center justify-content-center">
                      <div className="p-3 bg-primary text-white rounded font-weight-bold mr-2" style={{ fontSize: '1.5rem', letterSpacing: '2px' }}>
                        {classInfo.code}
                      </div>
                      <Button 
                        color="outline-primary" 
                        size="sm"
                        onClick={() => {
                          navigator.clipboard.writeText(classInfo.code);
                          setShowCopyToast(true);
                          setTimeout(() => setShowCopyToast(false), 3000); // Hide toast after 3 seconds
                        }}
                        title="Copy class code"
                      >
                        <i className="ni ni-single-copy-04"></i>
                      </Button>
                    </div>
                  </div>
                  
                  <div className="alert alert-info">
                    <i className="ni ni-bell-55 mr-2"></i>
                    Share this QR code or class code with your students so they can join the class.
                  </div>
                </div>
              </>
            )}
          </ModalBody>
          <ModalFooter style={{ border: "none", paddingTop: "0" }}>
            <Button 
              color="primary" 
              onClick={() => setShowQRCodeModal(false)}
              style={{ borderRadius: "8px" }}
            >
              Got it!
            </Button>
          </ModalFooter>
        </Modal>

        {/* Theme Selection Modal */}
        <Modal isOpen={showThemeModal} toggle={() => setShowThemeModal(false)} centered size="lg">
          <ModalHeader toggle={() => setShowThemeModal(false)} style={{ border: 'none' }}>Select a Theme</ModalHeader>
          <ModalBody>
            {customTheme && (
              <div
                key="custom-photo"
                onClick={() => handleSelectTheme(customTheme)}
                style={{
                  width: '100%',
                  height: 120,
                  borderRadius: 14,
                  cursor: 'pointer',
                  border: selectedTheme === customTheme ? '3px solid #007bff' : '2px solid #eee',
                  backgroundImage: `url('${customTheme}')`,
                  backgroundSize: 'cover',
                  backgroundPosition: 'center',
                  position: 'relative',
                  boxShadow: selectedTheme === customTheme ? '0 2px 12px rgba(44,62,80,0.15)' : 'none',
                  transition: 'border 0.2s, box-shadow 0.2s',
                  display: 'flex',
                  alignItems: 'flex-end',
                  justifyContent: 'center',
                  overflow: 'hidden',
                  marginBottom: 24
                }}
                title="Custom Photo"
              >
                <span style={{
                  background: 'rgba(0,0,0,0.32)',
                  borderRadius: 8,
                  padding: '2px 10px',
                  margin: 8,
                  marginBottom: 10,
                  color: '#fff',
                  fontWeight: 600,
                  fontSize: 14,
                  position: 'absolute',
                  left: 8,
                  bottom: 8,
                  maxWidth: '90%',
                  whiteSpace: 'nowrap',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  boxShadow: '0 1px 4px rgba(0,0,0,0.10)'
                }}>Custom Photo</span>
              </div>
            )}
            {(() => {
              const groupedThemes = themes.reduce((acc, theme) => {
                if (!acc[theme.type]) {
                  acc[theme.type] = [];
                }
                acc[theme.type].push(theme);
                return acc;
              }, {});

              return Object.entries(groupedThemes).map(([type, themeList]) => (
                <div key={type} style={{ marginBottom: 32 }}>
                  <h6 style={{
                    color: '#8a98a8',
                    fontWeight: 700,
                    fontSize: 13,
                    marginBottom: 12,
                    marginTop: 18,
                    paddingBottom: 0,
                    textTransform: 'uppercase',
                    letterSpacing: 1.2,
                    background: 'none',
                    border: 'none',
                    boxShadow: 'none',
                    fontFamily: 'inherit',
                    lineHeight: 1.2
                  }}>
                    {type}
                  </h6>
                  <div style={{ display: 'flex', flexDirection: 'row', gap: 12, overflowX: 'auto', paddingBottom: 4 }}>
                    {themeList.map((theme) => {
                      const isGradient = theme.value.startsWith('linear-gradient');
                      const isImage = theme.value.startsWith('url');
                      return (
                        <div
                          key={theme.name}
                          onClick={() => handleSelectTheme(theme.value)}
                          style={{
                            minWidth: 180,
                            maxWidth: 220,
                            height: 70,
                            borderRadius: 14,
                            cursor: 'pointer',
                            border: selectedTheme === theme.value ? '3px solid #007bff' : '2px solid #eee',
                            ...(isGradient ? { background: theme.value } : {}),
                            ...(isImage ? { backgroundImage: theme.value } : {}),
                            backgroundSize: '110%',
                            backgroundPosition: 'center',
                            position: 'relative',
                            boxShadow: selectedTheme === theme.value ? '0 2px 12px rgba(44,62,80,0.15)' : 'none',
                            transition: 'border 0.2s, box-shadow 0.2s',
                            display: 'flex',
                            alignItems: 'flex-end',
                            justifyContent: 'center',
                            overflow: 'hidden',
                            marginBottom: 0
                          }}
                          title={theme.name}
                        >
                          <span style={{
                            background: 'rgba(0,0,0,0.32)',
                            borderRadius: 8,
                            padding: '2px 10px',
                            margin: 8,
                            marginBottom: 10,
                            color: '#fff',
                            fontWeight: 600,
                            fontSize: 14,
                            position: 'absolute',
                            left: 8,
                            bottom: 8,
                            maxWidth: '90%',
                            whiteSpace: 'nowrap',
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                            boxShadow: '0 1px 4px rgba(0,0,0,0.10)'
                          }}>{theme.name}</span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              ));
            })()}
          </ModalBody>
        </Modal>

        {/* Navigation Tabs */}
        <Nav tabs className="mb-4" style={{ background: '#fff', borderRadius: 12, boxShadow: '0 2px 8px rgba(44,62,80,0.07)' }}>
          <NavItem>
            <NavLink
              className={classnames({ active: activeTab === "stream" })}
              onClick={() => setActiveTab("stream")}
              style={{ cursor: "pointer", fontWeight: 600, fontSize: 16 }}
            >
              <i className="ni ni-chat-round mr-2 text-info"></i> Stream
            </NavLink>
          </NavItem>
          <NavItem>
            <NavLink
              className={classnames({ active: activeTab === "class" })}
              onClick={() => setActiveTab("class")}
              style={{ cursor: "pointer", fontWeight: 600, fontSize: 16 }}
            >
              <i className="ni ni-tag mr-2 text-warning"></i> Class Tasks
            </NavLink>
          </NavItem>
          <NavItem>
            <NavLink
              className={classnames({ active: activeTab === "grades" })}
              onClick={() => setActiveTab("grades")}
              style={{ cursor: "pointer", fontWeight: 600, fontSize: 16 }}
            >
              <i className="ni ni-hat-3 mr-2 text-primary"></i> Grades
            </NavLink>
          </NavItem>
          <NavItem>
            <NavLink
              className={classnames({ active: activeTab === "people" })}
              onClick={() => setActiveTab("people")}
              style={{ cursor: "pointer", fontWeight: 600, fontSize: 16 }}
            >
              <i className="ni ni-single-02 mr-2 text-success"></i> People
            </NavLink>
          </NavItem>
        </Nav>
        {/* Tab Content */}
        <TabContent activeTab={activeTab}>

          {/* Stream Tab */}
          <TabPane tabId="stream">
            {activeTab === "stream" && (
              <div style={{ maxWidth: 1100, margin: '24px auto 0', fontSize: '12px' }}>
                <div style={{ background: '#fff', borderRadius: 16, boxShadow: '0 8px 32px rgba(50,76,221,0.10)', border: '1.5px solid #e9ecef', padding: 32, marginBottom: 24 }}>
                  {/* Stream Header */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 10 }}>
                    <i className="ni ni-chat-round" style={{ fontSize: 16, color: '#2096ff', marginRight: 2 }} />
                    <span style={{ fontWeight: 700, color: '#2096ff', fontSize: 13, letterSpacing: 0.2 }}>Stream</span>
                  </div>
                  {/* Scheduled/Drafts toggles */}
                  <div style={{ display: 'flex', gap: 10, marginBottom: 10 }}>
                    <button
                      type="button"
                      onClick={() => { 
                        setShowScheduledCollapse(!showScheduledCollapse); 
                        setScheduledActionMenu(null); 
                      }}
                      style={{
                        borderRadius: 6,
                        border: '1.2px solid #222',
                        background: showScheduledCollapse ? '#1976d2' : '#fff',
                        color: showScheduledCollapse ? '#fff' : '#222',
                        fontWeight: 500,
                        fontSize: 11,
                        padding: '4px 10px',
                        minWidth: 70,
                        display: 'flex',
                        alignItems: 'center',
                        gap: 4,
                        boxShadow: showScheduledCollapse ? '0 2px 8px #324cdd22' : 'none',
                        transition: 'all 0.15s',
                        outline: 'none',
                        cursor: 'pointer',
                        borderColor: showScheduledCollapse ? '#1976d2' : '#222',
                      }}
                    >
                      <i className="fa fa-calendar" style={{ fontSize: 13, marginRight: 3, color: showScheduledCollapse ? '#fff' : '#222' }}></i> Scheduled
                    </button>
                    <button
                      type="button"
                      onClick={() => setShowDraftsCollapse(!showDraftsCollapse)}
                      style={{
                        borderRadius: 6,
                        border: '1.2px solid #222',
                        background: showDraftsCollapse ? '#1976d2' : '#fff',
                        color: showDraftsCollapse ? '#fff' : '#222',
                        fontWeight: 500,
                        fontSize: 11,
                        padding: '4px 10px',
                        minWidth: 70,
                        display: 'flex',
                        alignItems: 'center',
                        gap: 4,
                        boxShadow: showDraftsCollapse ? '0 2px 8px #324cdd22' : 'none',
                        transition: 'all 0.15s',
                        outline: 'none',
                        cursor: 'pointer',
                        borderColor: showDraftsCollapse ? '#1976d2' : '#222',
                      }}
                    >
                      <i className="fa fa-file-alt" style={{ fontSize: 13, marginRight: 3, color: showDraftsCollapse ? '#fff' : '#222' }}></i> Drafts
                    </button>
                  </div>
                  {/* Scheduled Announcements Collapse */}
                  <Collapse isOpen={showScheduledCollapse}>
                    <div style={{ background: '#fff', borderRadius: 16, boxShadow: '0 2px 12px #324cdd11', border: 'none', marginBottom: 24, marginTop: 0, padding: '2rem 2rem 1.5rem', maxWidth: '100%' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                        <div style={{ fontWeight: 700, color: '#2d3559' }}>Scheduled Announcements</div>
                        <button
                          type="button"
                          onClick={fetchStreamDraftsAndScheduled}
                          style={{
                            background: 'none',
                            border: 'none',
                            color: '#324cdd',
                            cursor: 'pointer',
                            padding: '4px 8px',
                            borderRadius: '4px',
                            fontSize: '12px'
                          }}
                          title="Refresh scheduled posts"
                        >
                          <i className="fa fa-refresh"></i>
                        </button>
                      </div>
                      {scheduledPosts.length === 0 ? (
                        <div style={{ color: '#888' }}>No scheduled announcements.</div>
                      ) : (
                        scheduledPosts.map((announcement, idx) => (
                          <div key={idx} style={{ background: '#f8fafd', borderRadius: 12, boxShadow: '0 2px 8px #324cdd11', marginBottom: 18, padding: '18px 24px', position: 'relative' }}>
                            <div style={{ fontWeight: 700, fontSize: 17, marginBottom: 6 }}>{announcement.title}</div>
                            <div style={{ color: '#444', fontSize: 15, marginBottom: 12 }}>{announcement.content || announcement.text}</div>
                            <div style={{ fontSize: 13, color: '#888', marginBottom: 8 }}>Scheduled for: {announcement.scheduledFor ? `${announcement.scheduledFor.date} ${announcement.scheduledFor.time}` : ''}</div>
                            
                            {/* TODO: Student targeting information - will be re-enabled when backend supports student_ids */}
                            {/* Show student targeting information */}
                            {/* {(announcement.studentIds || announcement.visible_to_student_ids) && (
                              <div style={{ fontSize: 13, color: '#324cdd', marginBottom: 8, display: 'flex', alignItems: 'center', gap: 6 }}>
                                <i className="fa fa-users" style={{ fontSize: 12 }}></i>
                                <span>Targeted to specific students</span>
                              </div>
                            )}
                            {!(announcement.studentIds || announcement.visible_to_student_ids) && (
                              <div style={{ fontSize: 13, color: '#28a745', marginBottom: 8, display: 'flex', alignItems: 'center', gap: 6 }}>
                                <span>Visible to all students</span>
                              </div>
                            )} */}
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
                                  const isLink = att.type === "Link" || att.type === "YouTube" || att.type === "Google Drive";
                                  // Ensure link URLs are absolute external URLs and remove localhost prefixes
                                  let linkUrl = att.url;
                                  
                                  if (isLink && linkUrl) {
                                    // Remove localhost prefixes if they exist
                                    if (linkUrl.includes('localhost/scms_new_backup/')) {
                                      linkUrl = linkUrl.replace('https://scms-backend.up.railway.app/', '');
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
                            
                            {/* Action menu for scheduled posts */}
                            <div className="scheduled-action-menu-container" style={{ position: 'absolute', top: 16, right: 16, marginTop: 0 }}>
                              <button
                                type="button"
                                onClick={() => setScheduledActionMenu(idx === scheduledActionMenu ? null : idx)}
                                style={{
                                  background: 'none',
                                  border: 'none',
                                  color: '#666',
                                  fontSize: 18,
                                  cursor: 'pointer',
                                  padding: '4px 8px',
                                  borderRadius: 4,
                                  transition: 'background 0.15s'
                                }}
                                onMouseOver={e => e.currentTarget.style.background = '#f0f0f0'}
                                onMouseOut={e => e.currentTarget.style.background = 'transparent'}
                              >
                                <i className="fa fa-ellipsis-v"></i>
                              </button>
                              
                              {/* Dropdown menu */}
                              {scheduledActionMenu === idx && (
                                <div
                                  style={{
                                    position: 'absolute',
                                    top: '100%',
                                    right: 0,
                                    minWidth: 140,
                                    background: '#fff',
                                    borderRadius: '8px',
                                    boxShadow: '0 4px 16px rgba(50,76,221,0.13)',
                                    zIndex: 50,
                                    padding: '8px 0',
                                    border: '1px solid #e9ecef',
                                    marginTop: '4px'
                                  }}
                                >
                                  <div
                                    style={{ 
                                      display: 'flex', 
                                      alignItems: 'center', 
                                      gap: 8, 
                                      padding: '10px 16px', 
                                      cursor: 'pointer', 
                                      fontSize: 13, 
                                      color: '#525F7F',
                                      transition: 'background 0.15s'
                                    }}
                                    onClick={() => { 
                                      setScheduledActionMenu(null); 
                                      handlePublishScheduledNow(announcement.id); 
                                    }}
                                    onMouseOver={e => e.currentTarget.style.background = '#f7fafd'}
                                    onMouseOut={e => e.currentTarget.style.background = 'transparent'}
                                  >
                                    <i className="fa fa-play" style={{ fontSize: 13, color: '#28a745' }}></i>
                                    Publish Now
                                  </div>
                                  <div
                                    style={{ 
                                      display: 'flex', 
                                      alignItems: 'center', 
                                      gap: 8, 
                                      padding: '10px 16px', 
                                      cursor: 'pointer', 
                                      fontSize: 13, 
                                      color: '#525F7F',
                                      transition: 'background 0.15s'
                                    }}
                                    onClick={() => { 
                                      setScheduledActionMenu(null); 
                                      handleEditScheduled(idx); 
                                    }}
                                    onMouseOver={e => e.currentTarget.style.background = '#f7fafd'}
                                    onMouseOut={e => e.currentTarget.style.background = 'transparent'}
                                  >
                                    <i className="fa fa-edit" style={{ fontSize: 13, color: '#17a2b8' }}></i>
                                    Edit
                                  </div>
                                  <div
                                    style={{ 
                                      display: 'flex', 
                                      alignItems: 'center', 
                                      gap: 8, 
                                      padding: '10px 16px', 
                                      cursor: 'pointer', 
                                      fontSize: 13, 
                                      color: '#525F7F',
                                      transition: 'background 0.15s'
                                    }}
                                    onClick={() => { 
                                      setScheduledActionMenu(null); 
                                      handleDeleteScheduled(idx); 
                                    }}
                                    onMouseOver={e => e.currentTarget.style.background = '#f7fafd'}
                                    onMouseOut={e => e.currentTarget.style.background = 'transparent'}
                                  >
                                    <i className="fa fa-trash" style={{ fontSize: 13, color: '#dc3545' }}></i>
                                    Delete
                                  </div>
                                </div>
                              )}
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  </Collapse>
                  {/* Drafts Announcements Collapse */}
                  <Collapse isOpen={showDraftsCollapse}>
                    <div style={{ background: '#fff', borderRadius: 16, boxShadow: '0 2px 12px #324cdd11', border: 'none', marginBottom: 24, marginTop: 0, padding: '2rem 2rem 1.5rem', maxWidth: '100%' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                        <div style={{ fontWeight: 700, color: '#2d3559' }}>Draft Announcements</div>
                        <button
                          type="button"
                          onClick={fetchStreamDraftsAndScheduled}
                          style={{
                            background: 'none',
                            border: 'none',
                            color: '#324cdd',
                            cursor: 'pointer',
                            padding: '4px 8px',
                            borderRadius: '4px',
                            fontSize: '12px'
                          }}
                          title="Refresh drafts"
                        >
                          <i className="fa fa-refresh"></i>
                        </button>
                      </div>
                      
                      {/* Debug: Show draft tracking info */}

                      {drafts.length === 0 ? (
                        <div style={{ color: '#888' }}>No drafts saved.</div>
                      ) : (
                        drafts.map((draft, idx) => (
                          <div key={idx} style={{ background: '#f8fafd', borderRadius: 12, boxShadow: '0 2px 8px #324cdd11', marginBottom: 18, padding: '18px 24px', position: 'relative' }}>
                            <div style={{ fontWeight: 700, fontSize: 17, marginBottom: 6 }}>{draft.title}</div>
                            <div style={{ color: '#444', fontSize: 15, marginBottom: 12 }}>{draft.content || draft.text}</div>
                            <div style={{ fontSize: 13, color: '#888', marginBottom: 8 }}>Saved as draft: {draft.lastEdited ? formatRelativeTime(draft.lastEdited) : ''}</div>
                            
                            {/* TODO: Student targeting information - will be re-enabled when backend supports student_ids */}
                            {/* Show student targeting information */}
                            {/* {(draft.studentIds || draft.visible_to_student_ids) && (
                              <div style={{ fontSize: 13, color: '#324cdd', marginBottom: 8, display: 'flex', alignItems: 'center', gap: 6 }}>
                                <i className="fa fa-users" style={{ fontSize: 12 }}></i>
                                <span>Targeted to specific students</span>
                              </div>
                            )}
                            {!(draft.studentIds || draft.visible_to_student_ids) && (
                              <div style={{ fontSize: 13, color: '#28a745', marginBottom: 8, display: 'flex', alignItems: 'center', gap: 6 }}>
                                <i className="fa fa-globe" style={{ fontSize: 12 }}></i>
                                <span>Visible to all students</span>
                              </div>
                            )} */}
                            {draft.attachments && draft.attachments.length > 0 && (
                              <div style={{ margin: '10px 0 16px 0', display: 'flex', flexDirection: 'column', gap: 10 }}>
                                {draft.attachments.map((att, idx2) => (
                                  <div key={idx2} style={{ background: '#fff', borderRadius: 12, boxShadow: '0 1px 4px #e9ecef', padding: '10px 18px', minWidth: 220, maxWidth: 340 }}>
                                    <span style={{ fontWeight: 600 }}>{att.name || att.url || 'Attachment'}</span>
                                  </div>
                                ))}
                              </div>
                            )}
                            
                            {/* Action menu for drafts */}
                            <div className="draft-action-menu-container" style={{ position: 'absolute', top: 16, right: 16, marginTop: 0 }}>
                              <button
                                type="button"
                                onClick={() => setDraftActionMenu(idx === draftActionMenu ? null : idx)}
                                style={{
                                  background: 'none',
                                  border: 'none',
                                  color: '#666',
                                  fontSize: 18,
                                  cursor: 'pointer',
                                  padding: '4px 8px',
                                  borderRadius: 4,
                                  transition: 'background 0.15s'
                                }}
                                onMouseOver={e => e.currentTarget.style.background = '#f0f0f0'}
                                onMouseOut={e => e.currentTarget.style.background = 'transparent'}
                              >
                                <i className="fa fa-ellipsis-v"></i>
                              </button>
                              
                              {/* Dropdown menu */}
                              {draftActionMenu === idx && (
                                <div
                                  style={{
                                    position: 'absolute',
                                    top: '100%',
                                    right: 0,
                                    minWidth: 140,
                                    background: '#fff',
                                    borderRadius: '8px',
                                    boxShadow: '0 4px 16px rgba(50,76,221,0.13)',
                                    zIndex: 50,
                                    padding: '8px 0',
                                    border: '1px solid #e9ecef',
                                    marginTop: '4px'
                                  }}
                                >
                                  <div
                                    style={{ 
                                      display: 'flex', 
                                      alignItems: 'center', 
                                      gap: 8, 
                                      padding: '10px 16px', 
                                      cursor: 'pointer', 
                                      fontSize: 13, 
                                      color: '#525F7F',
                                      transition: 'background 0.15s'
                                    }}
                                    onClick={() => { 
                                      setDraftActionMenu(null); 
                                      handleEditDraft(draft.id); 
                                    }}
                                    onMouseOver={e => e.currentTarget.style.background = '#f7fafd'}
                                    onMouseOut={e => e.currentTarget.style.background = 'transparent'}
                                  >
                                    <i className="fa fa-edit" style={{ fontSize: 13, color: '#17a2b8' }}></i>
                                    Load Draft
                                  </div>
                                  <div
                                    style={{ 
                                      display: 'flex', 
                                      alignItems: 'center', 
                                      gap: 8, 
                                      padding: '10px 16px', 
                                      cursor: 'pointer', 
                                      fontSize: 13, 
                                      color: '#525F7F',
                                      transition: 'background 0.15s'
                                    }}
                                    onClick={() => { 
                                      setDraftActionMenu(null); 
                                      handleDeleteDraft(idx); 
                                    }}
                                    onMouseOver={e => e.currentTarget.style.background = '#f7fafd'}
                                    onMouseOut={e => e.currentTarget.style.background = 'transparent'}
                                  >
                                    <i className="fa fa-trash" style={{ fontSize: 13, color: '#dc3545' }}></i>
                                    Delete
                                  </div>
                                </div>
                              )}
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  </Collapse>
                  {/* Only show main stream input/announcements if neither collapse is open and not expanded */}
                  {!(formExpanded) && (
                    <div
                      style={{ background: '#f7fafd', borderRadius: 14, padding: '22px 18px', minHeight: 56, color: '#444', fontSize: 16, border: 'none', boxShadow: 'none', marginBottom: 0, width: '100%', cursor: 'pointer', transition: 'box-shadow 0.2s, background 0.2s' }}
                      onClick={() => { 
                        setFormExpanded(true); 
                        setPostDropdownOpen(false); 
                      }}
                      onMouseOver={e => e.currentTarget.style.boxShadow = '0 2px 8px #324cdd22'}
                      onMouseOut={e => e.currentTarget.style.boxShadow = 'none'}
                    >
                      <span style={{ color: '#7d8fa9' }}>Share an announcement with your class...</span>
                    </div>
                  )}
                  {/* Expanded announcement form */}
                  {formExpanded && (
                    <div ref={formExpandedRef} className="post-form-container" style={{ background: '#fff', borderRadius: 16, boxShadow: '0 2px 12px #324cdd22', padding: 24, marginBottom: 0, width: '100%', zIndex: 10, minHeight: 220 }}>
                      <form ref={postFormRef} onSubmit={handlePostAnnouncement} style={{ position: 'relative' }}>
                        {/* Create announcement header */}
                        <div style={{ marginBottom: 12, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <label style={{ fontWeight: 600, fontSize: 16, color: '#222', margin: 0 }}>Create announcement</label>
                          <button
                            type="button"
                            onClick={() => {
                              console.log('Opening Add Students modal');
                              console.log('Current students state:', students);
                              console.log('Current availableUsers state:', availableUsers);
                              setShowAddUsersModal(true);
                            }}
                            style={{
                              background: '#f7fafd',
                              border: 'none',
                              borderRadius: 10,
                              width: 54,
                              height: 32,
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              boxShadow: '0 1px 4px #e9ecef',
                              cursor: 'pointer',
                              padding: 0,
                              gap: 6
                            }}
                            aria-label="Add Students"
                          >
                            {selectedUsers.length > 0 && (
                              <span style={{
                                display: 'inline-flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                width: 26,
                                height: 26,
                                borderRadius: '50%',
                                background: '#e3eafe',
                                color: '#324cdd',
                                fontWeight: 600,
                                fontSize: 15,
                                marginRight: 2
                              }}>{selectedUsers.length}</span>
                            )}
                            <i className="fa fa-user-plus" style={{ fontSize: 20, color: '#111' }}></i>
                          </button>
                        </div>
                        {/* Debug: Show current draft ID */}
                        {process.env.NODE_ENV === 'development' && currentDraftId && (
                          <div style={{ 
                            background: '#fff3cd', 
                            border: '1px solid #ffeaa7', 
                            borderRadius: '4px', 
                            padding: '8px 12px', 
                            marginBottom: '12px', 
                            fontSize: '12px', 
                            color: '#856404',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '8px'
                          }}>
                            <i className="fa fa-bug" style={{ fontSize: '12px' }}></i>
                            <strong>Debug:</strong> Editing draft ID: {currentDraftId}
                          </div>
                        )}
                        

                        {/* Title input */}
                        <input
                          type="text"
                          placeholder="Announcement title (optional)"
                          value={newAnnouncementTitle}
                          onChange={e => setNewAnnouncementTitle(e.target.value)}
                          style={{ width: '100%', marginBottom: 10, borderRadius: 7, border: '1px solid #e9ecef', padding: '8px 12px', fontSize: 14, background: '#f7fafd', height: 36 }}
                        />
                        {/* Content textarea */}
                        <textarea
                          placeholder="Share an announcement with your class..."
                          value={newAnnouncement}
                          onChange={e => setNewAnnouncement(e.target.value)}
                          style={{ width: '100%', minHeight: 48, borderRadius: 7, border: '1px solid #e9ecef', padding: '8px 12px', fontSize: 14, marginBottom: 14, background: '#f7fafd', height: 38 }}
                        />
                        {/* Hidden file input for attachments */}
                        <input
                          type="file"
                          ref={fileInputRef}
                          style={{ display: 'none' }}
                          multiple
                          onChange={handleFileChange}
                        />
                        {/* Attachment and Emoji buttons */}
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 0, position: 'relative' }}>
                          <button
                            type="button"
                            onClick={() => setAttachmentDropdownOpen(!attachmentDropdownOpen)}
                            style={{
                              display: 'flex',
                              alignItems: 'center',
                              gap: 7,
                              background: '#fff',
                              border: 'none',
                              borderRadius: 9,
                              fontWeight: 700,
                              fontSize: 14,
                              boxShadow: '0 1px 4px #e9ecef',
                              padding: '6px 12px',
                              cursor: 'pointer',
                              transition: 'box-shadow 0.15s',
                              height: 32,
                              minWidth: 0,
                            }}
                          >
                            <i className="fa fa-paperclip" style={{ fontSize: 14, display: 'flex', alignItems: 'center' }}></i>
                            Add Attachment
                          </button>
                          {/* Dropdown menu for Add Attachment */}
                          {attachmentDropdownOpen && (
                            <div
                              style={{
                                position: 'absolute',
                                top: 36,
                                left: 0,
                                minWidth: 120,
                                background: '#fff',
                                borderRadius: 9,
                                boxShadow: '0 4px 16px rgba(50,76,221,0.13)',
                                zIndex: 30,
                                padding: '4px 0',
                                border: '1px solid #e9ecef',
                              }}
                            >
                              <div
                                style={{ display: 'flex', alignItems: 'center', gap: 7, padding: '7px 12px', cursor: 'pointer', fontSize: 13, color: '#525F7F' }}
                                onClick={() => { setAttachmentDropdownOpen(false); handleAddAttachment('File'); }}
                              >
                                <i className="fa fa-file" style={{ fontSize: 13, color: '#525F7F' }}></i>
                                File
                              </div>
                              <div
                                style={{ display: 'flex', alignItems: 'center', gap: 7, padding: '7px 12px', cursor: 'pointer', fontSize: 13, color: '#525F7F' }}
                                onClick={() => { setAttachmentDropdownOpen(false); handleAddAttachment('Link'); }}
                              >
                                <i className="fa fa-globe" style={{ fontSize: 13, color: '#525F7F' }}></i>
                                Link
                              </div>
                              <div
                                style={{ display: 'flex', alignItems: 'center', gap: 7, padding: '7px 12px', cursor: 'pointer', fontSize: 13, color: '#525F7F' }}
                                onClick={() => { setAttachmentDropdownOpen(false); handleAddAttachment('YouTube'); }}
                              >
                                <i className="fa fa-youtube-play" style={{ fontSize: 13, color: '#525F7F' }}></i>
                                YouTube
                              </div>
                              <div
                                style={{ display: 'flex', alignItems: 'center', gap: 7, padding: '7px 12px', cursor: 'pointer', fontSize: 13, color: '#525F7F' }}
                                onClick={() => { setAttachmentDropdownOpen(false); handleAddAttachment('Google Drive'); }}
                              >
                                <i className="fa fa-cloud-upload" style={{ fontSize: 13, color: '#525F7F' }}></i>
                                Google Drive
                              </div>
                            </div>
                          )}
                          <button
                            type="button"
                            onClick={() => setEmojiPickerOpen(!emojiPickerOpen)}
                            style={{
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              background: '#fff',
                              border: 'none',
                              borderRadius: 9,
                              boxShadow: '0 1px 4px #e9ecef',
                              width: 32,
                              height: 32,
                              cursor: 'pointer',
                              fontSize: 14,
                              marginLeft: 0,
                              padding: 0,
                              position: 'relative',
                            }}
                          >
                            <i className="fa fa-smile" style={{ fontSize: 14, display: 'flex', alignItems: 'center', justifyContent: 'center', width: '100%', height: '100%' }}></i>
                            {/* Emoji Picker Dropdown */}
                            {emojiPickerOpen && (
                              <div
                                ref={emojiPickerRef}
                                style={{
                                  position: 'absolute',
                                  left: 0,
                                  top: '100%',
                                  background: '#fff',
                                  borderRadius: 9,
                                  boxShadow: '0 4px 16px rgba(50,76,221,0.13)',
                                  zIndex: 40,
                                  padding: 6,
                                  minWidth: 130,
                                  maxWidth: 180,
                                  width: 180,
                                  maxHeight: 200,
                                  overflowY: 'auto',
                                  display: 'grid',
                                  gridTemplateColumns: 'repeat(6, 1fr)',
                                  gap: 5,
                                }}
                              >
                                {emojiList.map((emoji, idx) => (
                                  <span
                                    key={emoji + idx}
                                    style={{
                                      fontSize: 16,
                                      cursor: 'pointer',
                                      borderRadius: 5,
                                      display: 'flex',
                                      alignItems: 'center',
                                      justifyContent: 'center',
                                      transition: 'background 0.12s',
                                      padding: 0,
                                      userSelect: 'none',
                                    }}
                                    onClick={() => {
                                      setNewAnnouncement(newAnnouncement + emoji);
                                      setEmojiPickerOpen(false);
                                    }}
                                    onMouseOver={e => e.currentTarget.style.background = '#f7fafd'}
                                    onMouseOut={e => e.currentTarget.style.background = 'transparent'}
                                  >
                                    {emoji}
                                  </span>
                                ))}
                              </div>
                            )}
                          </button>
                        </div>
                        {attachments && attachments.length > 0 && (
                              <div style={{ margin: '10px 0 16px 0', display: 'flex', flexDirection: 'column', gap: 10 }}>
                                {attachments.map((att, idx) => {
                                  const { preview, type, color } = getFileTypeIconOrPreview(att);
                                  let url = undefined;
                                  if (att.file && (att.file instanceof File || att.file instanceof Blob)) {
                                    url = URL.createObjectURL(att.file);
                                  } else if (att.url) {
                                    url = att.url;
                                  }
                                  const typeStr = String(att.type || att.attachment_type || '').toLowerCase();
                                  const isLink = (!!url && (!att.file || typeStr !== 'file')) && (
                                    typeStr === 'link' || typeStr === 'youtube' || typeStr === 'google drive' || typeStr === 'google_drive' || typeStr === 'drive' || typeStr === '' // treat empty type with URL as link in composer
                                  );
                                  const displayName = isLink ? url : att.name;
                                  return (
                                    <div
                                      key={idx}
                                      style={{ background: '#fff', borderRadius: 12, boxShadow: '0 1px 4px #e9ecef', padding: '10px 18px', minWidth: 220, maxWidth: 340, display: 'flex', alignItems: 'center', gap: 12, cursor: isLink ? 'pointer' : 'default', position: 'relative' }}
                                      onClick={() => { if (isLink && url) { window.open(url, '_blank', 'noopener,noreferrer'); } }}
                                    >
                                      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginRight: 8 }}>{preview}</div>
                                      <div style={{ flex: 1, minWidth: 0 }}>
                                        <div style={{ fontWeight: 600, fontSize: 16, color: '#232b3b', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: 140 }} title={displayName}>{displayName}</div>
                                        <div style={{ fontSize: 13, color: '#90A4AE', marginTop: 2 }}>
                                          {type}
                                          {url && (<>
                                            <span style={{ margin: '0 6px', color: '#b0b0b0' }}>•</span>
                                            <a href={url} download={att.name} style={{ color: color, fontWeight: 600, textDecoration: 'none' }} onClick={e => e.stopPropagation()}>Download</a>
                                          </>)}
                                          {isLink && url && (<>
                                            <span style={{ margin: '0 6px', color: '#b0b0b0' }}>•</span>
                                            <a href={url} target="_blank" rel="noopener noreferrer" style={{ color: color, fontWeight: 600, textDecoration: 'none' }} onClick={e => e.stopPropagation()}>View Link</a>
                                          </>)}
                                        </div>
                                      </div>
                                      <button
                                        type="button"
                                        onClick={e => { e.stopPropagation(); handleRemoveAttachment(idx); }}
                                        style={{ position: 'absolute', right: 16, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', color: '#888', fontWeight: 700, fontSize: 22, cursor: 'pointer', borderRadius: '50%', width: 32, height: 32, display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'background 0.2s' }}
                                        title="Remove attachment"
                                        aria-label="Remove attachment"
                                        tabIndex={0}
                                        onKeyDown={e => { if (e.key === 'Enter' || e.key === ' ') { e.stopPropagation(); handleRemoveAttachment(idx); } }}
                                      >
                                        &times;
                                      </button>
                                    </div>
                                  );
                                })}
                              </div>
                            )}
                        {/* Action buttons */}
                        <div style={{ display: 'flex', gap: 8, marginTop: 18, position: 'absolute', bottom: 0, right: 0, marginLeft: 'auto' }}>
                          <button
                            type="button"
                            onClick={() => { 
                              setFormExpanded(false); 
                              setPostDropdownOpen(false); 
                              // If canceling a draft edit, clear the draft tracking
                              if (currentDraftId) {
                                setCurrentDraftId(null);
                              }
                            }}
                            style={{
                              background: 'none',
                              border: 'none',
                              color: '#888',
                              fontWeight: 500,
                              fontSize: 13,
                              marginRight: 6,
                              cursor: 'pointer',
                              padding: 0
                            }}
                          >
                            Cancel
                          </button>
                          
                          {/* Split Button - Post with Dropdown */}
                          <div className="post-dropdown-container" style={{ position: 'relative', display: 'flex' }}>
                            {/* Main Post Button */}
                            <button
                              type="submit"
                              style={{
                                background: (newAnnouncement.trim().length > 0 || attachments.length > 0) ? '#7B8CFF' : '#e6e6fa',
                                border: 'none',
                                color: (newAnnouncement.trim().length > 0 || attachments.length > 0) ? '#fff' : '#888',
                                fontWeight: 700,
                                fontSize: 13,
                                borderRadius: '7px 0 0 7px',
                                padding: '6px 18px',
                                cursor: (newAnnouncement.trim().length > 0 || attachments.length > 0) ? 'pointer' : 'not-allowed',
                                transition: 'background 0.15s',
                                opacity: (newAnnouncement.trim().length > 0 || attachments.length > 0) ? 1 : 0.6,
                                display: 'flex',
                                alignItems: 'center',
                                gap: 6,
                                minWidth: 88,
                                borderRight: '1px solid rgba(255,255,255,0.3)'
                              }}
                              disabled={!(newAnnouncement.trim().length > 0 || attachments.length > 0) || postLoading}
                            >
                              {postLoading ? (
                                <>
                                  <i className="fa fa-spinner fa-spin" style={{ marginRight: 6 }}></i>
                                  Posting...
                                </>
                              ) : (
                                <>
                                  <i className="fa fa-paper-plane" style={{ marginRight: 4, color: (newAnnouncement.trim().length > 0 || attachments.length > 0) ? '#fff' : '#888' }}></i>
                                  Post
                                </>
                              )}
                            </button>
                            
                            {/* Dropdown Arrow Button */}
                            <button
                              type="button"
                              onClick={() => setPostDropdownOpen(!postDropdownOpen)}
                              style={{
                                background: (newAnnouncement.trim().length > 0 || attachments.length > 0) ? '#7B8CFF' : '#e6e6fa',
                                border: 'none',
                                color: (newAnnouncement.trim().length > 0 || attachments.length > 0) ? '#fff' : '#888',
                                fontWeight: 700,
                                fontSize: 13,
                                borderRadius: '0 7px 7px 0',
                                padding: '6px 12px',
                                cursor: (newAnnouncement.trim().length > 0 || attachments.length > 0) ? 'pointer' : 'not-allowed',
                                transition: 'background 0.15s',
                                opacity: (newAnnouncement.trim().length > 0 || attachments.length > 0) ? 1 : 0.6,
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                minWidth: 32
                              }}
                              disabled={!(newAnnouncement.trim().length > 0 || attachments.length > 0) || postLoading}
                            >
                              <i className="fa fa-chevron-down" style={{ fontSize: 12 }}></i>
                            </button>
                            
                            {/* Dropdown Menu */}
                            {postDropdownOpen && (
                              <div
                                style={{
                                  position: 'absolute',
                                  top: '100%',
                                  right: 0,
                                  minWidth: 160,
                                  background: '#fff',
                                  borderRadius: '8px',
                                  boxShadow: '0 4px 16px rgba(50,76,221,0.13)',
                                  zIndex: 50,
                                  padding: '8px 0',
                                  border: '1px solid #e9ecef',
                                  marginTop: '4px'
                                }}
                              >
                                <div
                                  style={{ 
                                    display: 'flex', 
                                    alignItems: 'center', 
                                    gap: 8, 
                                    padding: '10px 16px', 
                                    cursor: 'pointer', 
                                    fontSize: 13, 
                                    color: '#525F7F',
                                    transition: 'background 0.15s'
                                  }}
                                  onClick={() => { 
                                    setPostDropdownOpen(false); 
                                    handleCreateDraft(); 
                                  }}
                                  onMouseOver={e => e.currentTarget.style.background = '#f7fafd'}
                                  onMouseOut={e => e.currentTarget.style.background = 'transparent'}
                                >
                                  <i className="fa fa-save" style={{ fontSize: 13, color: '#525F7F' }}></i>
                                  Save as Draft
                                </div>
                                <div
                                  style={{ 
                                    display: 'flex', 
                                    alignItems: 'center', 
                                    gap: 8, 
                                    padding: '10px 16px', 
                                    cursor: 'pointer', 
                                    fontSize: 13, 
                                    color: '#525F7F',
                                    transition: 'background 0.15s'
                                  }}
                                  onClick={() => { 
                                    setPostDropdownOpen(false); 
                                    setShowScheduleModal(true); 
                                  }}
                                  onMouseOver={e => e.currentTarget.style.background = '#f7fafd'}
                                  onMouseOut={e => e.currentTarget.style.background = 'transparent'}
                                >
                                  <i className="fa fa-calendar" style={{ fontSize: 13, color: '#525F7F' }}></i>
                                  Schedule Post
                                </div>
                              </div>
                            )}
                          </div>
                        </div>
                      </form>
                    </div>
                  )}
                  {/* Main Announcements List */}
                  <div style={{ marginTop: 32 }}>
                    {/* Loading State */}
                    {streamLoading && (
                      <div style={{ 
                        display: 'flex', 
                        justifyContent: 'center', 
                        alignItems: 'center', 
                        padding: '40px 20px',
                        color: '#666',
                        fontSize: '14px'
                      }}>
                        <i className="fa fa-spinner fa-spin" style={{ marginRight: '8px' }}></i>
                        Loading stream posts...
                      </div>
                    )}
                    
                    {/* Error State */}
                    {streamError && !streamLoading && (
                      <div style={{ 
                        background: '#fff3cd', 
                        border: '1px solid #ffeaa7', 
                        borderRadius: '8px', 
                        padding: '16px', 
                        marginBottom: '20px',
                        color: '#856404'
                      }}>
                        <i className="fa fa-exclamation-triangle" style={{ marginRight: '8px' }}></i>
                        {streamError}
                      </div>
                    )}
                    
                    {/* Announcements List */}
                    {!streamLoading && announcements.map((announcement) => (
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
                          {/* Like and menu group in upper right */}
                          <div style={{ position: 'absolute', top: 16, right: 18, display: 'flex', alignItems: 'center', gap: 12 }}>
                            {/* Only show like button for students */}
                            {userRole === 'student' && (
                              <div
                                style={{ display: 'flex', alignItems: 'center', gap: 4, color: (announcement.reactions?.likedBy?.includes('Prof. Smith') ? '#324cdd' : '#b0b0b0'), fontWeight: 600, fontSize: 16, cursor: 'pointer' }}
                                onClick={() => handleLikeAnnouncement(announcement.id)}
                                title={'Like'}
                              >
                                <i className="fa fa-thumbs-up" style={{ color: (announcement.reactions?.likedBy?.includes('Prof. Smith') ? '#324cdd' : '#b0b0b0'), fontSize: 18 }} />
                                <span style={{ color: (announcement.reactions?.likedBy?.includes('Prof. Smith') ? '#324cdd' : '#b0b0b0') }}>{announcement.reactions?.like || 0}</span>
                              </div>
                            )}
                            {/* Only show 3-dot menu if current user is the author */}
                            {currentUserProfile && (
                              (currentUserProfile.full_name === announcement.author || 
                               currentUserProfile.name === announcement.author || 
                               currentUserProfile.user_name === announcement.author) && (
                              <div style={{ position: 'relative' }}>
                                <i
                                  className="fa fa-ellipsis-v"
                                  style={{ cursor: 'pointer' }}
                                  onClick={e => {
                                    e.stopPropagation();
                                    setAnnouncementDropdowns(prev => ({ ...prev, [announcement.id]: !prev[announcement.id] }));
                                  }}
                                  aria-label="Open announcement menu"
                                />
                                {announcementDropdowns[announcement.id] && (
                                <div
                                  style={{
                                    position: 'absolute',
                                    top: 28,
                                    right: 0,
                                    background: '#fff',
                                    borderRadius: 10,
                                    boxShadow: '0 4px 16px rgba(44,62,80,0.13)',
                                    zIndex: 100,
                                    minWidth: 120,
                                    padding: '8px 0',
                                    border: '1px solid #e9ecef',
                                    display: 'flex',
                                    flexDirection: 'column',
                                    gap: 0
                                  }}
                                >
                                  <button
                                    style={{ background: 'none', border: 'none', color: '#525F7F', fontWeight: 500, fontSize: 15, padding: '8px 18px', textAlign: 'left', cursor: 'pointer', borderRadius: 0 }}
                                    onClick={e => {
                                      e.stopPropagation();
                                      setEditingAnnouncementId(announcement.id);
                                      setEditAnnouncementData({
                                        title: announcement.title,
                                        content: announcement.content,
                                        attachments: announcement.attachments ? [...announcement.attachments] : [],

                                      });
                                      // No longer setting selected students
                                      setAnnouncementDropdowns({});
                                    }}
                                  >Edit</button>
                                  <button
                                    style={{ background: 'none', border: 'none', color: '#e74c3c', fontWeight: 500, fontSize: 15, padding: '8px 18px', textAlign: 'left', cursor: 'pointer', borderRadius: 0 }}
                                    onClick={e => {
                                      e.stopPropagation();
                                      handleDeleteAnnouncement(announcement.id);
                                      setAnnouncementDropdowns({});
                                    }}
                                  >Delete</button>
                                  {announcement.isPinned ? (
                                    <button
                                      style={{ background: 'none', border: 'none', color: '#525F7F', fontWeight: 500, fontSize: 15, padding: '8px 18px', textAlign: 'left', cursor: 'pointer', borderRadius: 0 }}
                                      onClick={e => {
                                        e.stopPropagation();
                                        handlePinAnnouncement(announcement.id);
                                        setAnnouncementDropdowns({});
                                      }}
                                    >Unpin</button>
                                  ) : (
                                    <button
                                      style={{ background: 'none', border: 'none', color: '#525F7F', fontWeight: 500, fontSize: 15, padding: '8px 18px', textAlign: 'left', cursor: 'pointer', borderRadius: 0 }}
                                      onClick={e => {
                                        e.stopPropagation();
                                        handlePinAnnouncement(announcement.id);
                                        setAnnouncementDropdowns({});
                                      }}
                                    >Pin</button>
                                  )}
                                </div>
                              )}
                            </div>
                              )
                            )}
                          </div>
                          {/* Author info, date, and pinned badge */}
                          <div style={{ display: 'flex', alignItems: 'center', marginBottom: 8, justifyContent: 'space-between' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                              {(() => {
                                const authorUser = {
                                  profile_pic: announcement.user_avatar || announcement.user_profile_pic || announcement.profile_pic,
                                  profile_picture: announcement.profile_picture,
                                  name: announcement.author,
                                  full_name: announcement.author,
                                };
                                const avatarUrl = getProfilePictureUrl(authorUser);
                                const bgColor = getAvatarColor(authorUser);
                                const initials = getUserInitials(authorUser);
                                return (
                                  <div style={{ width: 32, height: 32, borderRadius: '50%', background: avatarUrl ? '#e9ecef' : bgColor, display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden', marginTop: -4, color: '#fff', fontWeight: 600 }}>
                                    {avatarUrl ? (
                                      <img
                                        src={avatarUrl}
                                        alt="avatar"
                                        style={{ width: 32, height: 32, borderRadius: '50%', objectFit: 'cover', display: 'block' }}
                                        onError={(e) => {
                                          e.target.style.display = 'none';
                                          if (e.target.nextSibling) {
                                            e.target.nextSibling.style.display = 'flex';
                                          }
                                        }}
                                      />
                                    ) : null}
                                    <span style={{ display: avatarUrl ? 'none' : 'flex', alignItems: 'center', justifyContent: 'center', width: '100%', height: '100%' }}>
                                      {initials}
                                    </span>
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
                          {editingAnnouncementId === announcement.id ? (
                            <form
                              onSubmit={e => {
                                e.preventDefault();
                                handleSaveEditAnnouncement(announcement.id);
                              }}
                              style={{ marginBottom: 16 }}
                            >

                              <input
                                type="text"
                                value={editAnnouncementData.title}
                                onChange={e => setEditAnnouncementData(prev => ({ ...prev, title: e.target.value }))}
                                placeholder="Announcement title (optional)"
                                style={{
                                  width: '100%',
                                  fontWeight: 700,
                                  fontSize: 17,
                                  marginBottom: 6,
                                  borderRadius: 8,
                                  border: '1px solid #e9ecef',
                                  padding: '8px 12px',
                                  color: '#232b3b',
                                  background: '#f7fafd',
                                  boxSizing: 'border-box',
                                }}
                                autoFocus
                              />
                              <textarea
                                value={editAnnouncementData.content}
                                onChange={e => setEditAnnouncementData(prev => ({ ...prev, content: e.target.value }))}
                                placeholder="Share an announcement with your class..."
                                style={{
                                  width: '100%',
                                  fontSize: 15,
                                  borderRadius: 8,
                                  border: '1px solid #e9ecef',
                                  padding: '8px 12px',
                                  color: '#232b3b',
                                  background: '#f7fafd',
                                  boxSizing: 'border-box',
                                  minHeight: 60,
                                  marginBottom: 8
                                }}
                              />

                              <div style={{ display: 'flex', gap: 10, marginTop: 10, alignItems: 'center' }}>
                                <button
                                  type="button"
                                  onClick={handleCancelEditAnnouncement}
                                  style={{
                                    background: 'none',
                                    border: 'none',
                                    color: '#525F7F',
                                    fontWeight: 500,
                                    fontSize: 14,
                                    cursor: 'pointer',
                                    padding: '4px 10px',
                                    height: 32,
                                    borderRadius: 6
                                  }}
                                >
                                  Cancel
                                </button>
                                <button
                                  type="submit"
                                  style={{
                                    background: '#22c55e',
                                    color: '#fff',
                                    border: 'none',
                                    borderRadius: 6,
                                    fontWeight: 700,
                                    fontSize: 14,
                                    padding: '4px 18px',
                                    cursor: 'pointer',
                                    boxShadow: '0 2px 8px #22c55e22',
                                    transition: 'background 0.15s',
                                    height: 32
                                  }}
                                >
                                  Save
                                </button>
                              </div>
                            </form>
                          ) : (
                            <>
                              <div style={{ fontWeight: 700, fontSize: 17, marginBottom: 6 }}>{announcement.title}</div>
                              <div style={{ color: '#444', fontSize: 15, marginBottom: 12 }}>{announcement.content}</div>
                            </>
                          )}
                          {/* Attachments preview for announcement post */}
                          {announcement.attachments && announcement.attachments.length > 0 && (
                            <div style={{ marginTop: 8, marginBottom: 8, display: 'grid', gridTemplateColumns: '1fr', gap: 12 }}>
                              {announcement.attachments.map((att, idx) => {
                                const { preview, type, color } = getFileTypeIconOrPreview(att);
                                let url = undefined;
                                if (att.file && (att.file instanceof File || att.file instanceof Blob)) {
                                  url = URL.createObjectURL(att.file);
                                } else if (att.url) {
                                  url = att.url;
                                }
                                const isLink = att.type === "Link" || att.type === "YouTube" || att.type === "Google Drive";
                                // Ensure link URLs are absolute external URLs and remove localhost prefixes
                                let linkUrl = att.url;
                                console.log('Processing attachment:', { type: att.type, url: att.url, isLink });
                                
                                if (isLink && linkUrl) {
                                  // Remove localhost prefixes if they exist
                                  if (linkUrl.includes('localhost/scms_new_backup/')) {
                                    linkUrl = linkUrl.replace('https://scms-backend.up.railway.app/', '');
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
                                      console.log('Converted relative URL to:', linkUrl);
                                    } else {
                                      // If it's just a path, assume it should be an external link
                                      console.warn('Link attachment has relative URL:', linkUrl);
                                      linkUrl = null; // Don't open invalid URLs
                                    }
                                  }
                                }
                                console.log('Final linkUrl:', linkUrl);
                                // Show just the filename (e.g., assignment1.pdf) as display name, but keep full path in database
                                const displayName = isLink ? (linkUrl || att.url) : att.name;
                                return (
                                  <div
                                    key={idx}
                                    style={{ 
                                      background: isLink ? `${color}08` : '#fff', 
                                      border: `1px solid ${isLink ? `${color}20` : '#e9ecef'}`,
                                      borderRadius: 8, 
                                      boxShadow: isLink ? `0 2px 12px ${color}15` : '0 2px 8px #e9ecef', 
                                      padding: '0.5rem 1.25rem', 
                                      display: 'flex', 
                                      alignItems: 'center', 
                                      gap: 12, 
                                      minWidth: 180, 
                                      maxWidth: 320, 
                                      width: '100%', 
                                      cursor: isLink ? 'pointer' : 'pointer',
                                      transition: 'all 0.2s ease'
                                    }}
                                    onClick={(e) => {
                                      e.stopPropagation();
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
                                                                              <div style={{ fontSize: 13, color: color || '#90A4AE', marginTop: 2 }}>
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
                          {/* Comments preview toggle and section */}
                          <div style={{ background: '#f7fafd', borderRadius: 10, padding: '12px 18px', marginTop: 10 }}>
                            <div
                              style={{ fontWeight: 600, fontSize: 15, marginBottom: 8, cursor: 'pointer', userSelect: 'none', display: 'flex', alignItems: 'center' }}
                              onClick={() =>
                                setExpandedAnnouncementComments(prev => ({
                                  ...prev,
                                  [announcement.id]: !prev[announcement.id]
                                }))
                              }
                            >
                              Comments ({announcement.comments?.length || 0})
                              <i
                                className={`fa fa-chevron-${expandedAnnouncementComments[announcement.id] ? 'up' : 'down'}`}
                                style={{ marginLeft: 8, fontSize: 13, color: '#888' }}
                              />
                            </div>
                            {expandedAnnouncementComments[announcement.id] && (
                              <div>
                                {/* Fetch comments when expanding */}
                                {(() => {
                                  if (!announcement.__loadedComments) {
                                    // Mark as loading to avoid repeated fetches
                                    announcement.__loadedComments = true;
                                    apiService
                                      .getTeacherStreamComments(code, announcement.id)
                                      .then(res => {
                                        // Normalize API response into UI-friendly shape
                                        const raw = Array.isArray(res?.data) ? res.data : (res?.comments || []);
                                        const comments = raw.map(c => ({
                                          id: c.id || c.comment_id || c.id_comment,
                                          author: c.author || c.user_name || c.full_name || c.name || c.user || 'Unknown',
                                          text: c.text || c.comment || c.content || '',
                                          date: c.date || c.created_at || c.createdAt || c.timestamp || null,
                                          profile_pic: c.user_avatar || c.user_profile_pic || c.profile_pic || c.avatar || c.profile_picture || null,
                                        }));
                                        setAnnouncements(prev => prev.map(a => a.id === announcement.id ? { ...a, comments } : a));
                                      })
                                      .catch(err => {
                                        console.warn('Failed to fetch comments:', err?.message || err);
                                      });
                                  }
                                  return null;
                                })()}
                                {/* Render all comments here */}
                                {announcement.comments && announcement.comments.length > 0 ? (
                                  announcement.comments.map((comment, idx) => {
                                    const isEditing = editingComment[announcement.id] === idx;
                                    return (
            <div key={idx} style={{ display: 'flex', alignItems: 'flex-start', marginBottom: 10, position: 'relative' }}>
              {(() => {
                const authorUser = { profile_pic: comment.profile_pic, name: comment.author, full_name: comment.author };
                const avatarUrl = getProfilePictureUrl(authorUser);
                const bgColor = getAvatarColor(authorUser);
                const initials = getUserInitials(authorUser);
                return (
                  <div style={{ width: 32, height: 32, borderRadius: '50%', marginRight: 10, overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center', background: avatarUrl ? '#e9ecef' : bgColor, color: '#fff', fontWeight: 700 }}>
                    {avatarUrl ? (
                      <img
                        src={avatarUrl}
                        alt={comment.author}
                        style={{ width: 32, height: 32, borderRadius: '50%', objectFit: 'cover', display: 'block' }}
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
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <div>
                                          <div style={{ fontWeight: 600, fontSize: 14, color: '#232b3b' }}>{comment.author}</div>
                    <div style={{ fontSize: 12, color: '#8898AA' }}>
                      {(() => {
                        const d = comment?.date ? new Date(comment.date) : null;
                        return (d && !isNaN(d)) ? d.toLocaleString() : (comment?.created_at || comment?.date || '');
                      })()}
                    </div>
                  </div>
                  {/* 3-dots menu - Only show for comment authors and announcement authors */}
                  {(() => {
                    // Check if current user can manage this comment
                    const currentUser = currentUserProfile || (() => {
                      try {
                        const stored = localStorage.getItem('user') || localStorage.getItem('scms_logged_in_user');
                        return stored ? JSON.parse(stored) : null;
                      } catch (_) { return null; }
                    })();
                    
                    const isCommentAuthor = currentUser && (
                      currentUser.full_name === comment.author ||
                      currentUser.name === comment.author ||
                      currentUser.user_name === comment.author
                    );
                    
                    const isAnnouncementAuthor = currentUser && (
                      currentUser.full_name === announcement.author ||
                      currentUser.name === announcement.author ||
                      currentUser.user_name === announcement.author
                    );
                    
                    // Show menu if user is comment author (can edit/delete) or announcement author (can delete any comment)
                    if (isCommentAuthor || isAnnouncementAuthor) {
                      // Debug logging for comment authorization
                      console.log('Comment authorization:', {
                        commentAuthor: comment.author,
                        announcementAuthor: announcement.author,
                        currentUser: currentUser?.full_name || currentUser?.name || currentUser?.user_name,
                        isCommentAuthor,
                        isAnnouncementAuthor,
                        canEdit: isCommentAuthor,
                        canDelete: true
                      });
                      
                      return (
                        <div style={{ position: 'relative', marginLeft: 8 }}>
                          <button
                            style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 2, borderRadius: 4, width: 24, height: 24, display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                            onClick={e => {
                              e.stopPropagation();
                              setOpenCommentMenu(prev => ({ ...prev, [`${announcement.id}-${idx}`]: !prev[`${announcement.id}-${idx}`] }));
                            }}
                            aria-label="Open comment menu"
                          >
                            <span style={{ display: 'inline-block', fontSize: 18, color: '#6c7a89', lineHeight: 1 }}>
                              <i className="fa fa-ellipsis-v" />
                            </span>
                          </button>
                          {openCommentMenu[`${announcement.id}-${idx}`] && (
                            <div
                              style={{
                                position: 'absolute',
                                top: 24,
                                right: 0,
                                background: '#fff',
                                borderRadius: 10,
                                boxShadow: '0 4px 16px rgba(44,62,80,0.13)',
                                zIndex: 100,
                                minWidth: 120,
                                padding: '8px 0',
                                border: '1px solid #e9ecef',
                                display: 'flex',
                                flexDirection: 'column',
                                gap: 0
                              }}
                            >
                              {/* Only show Edit button for comment authors */}
                              {isCommentAuthor && (
                                <button
                                  style={{ background: 'none', border: 'none', color: '#525F7F', fontWeight: 500, fontSize: 15, padding: '8px 18px', textAlign: 'left', cursor: 'pointer', borderRadius: 0 }}
                                  onClick={e => {
                                    e.stopPropagation();
                                    setEditingComment({ [announcement.id]: idx });
                                    setEditingCommentText(prev => ({ ...prev, [`${announcement.id}-${idx}`]: comment.text || '' }));
                                    setOpenCommentMenu({});
                                  }}
                                >Edit</button>
                              )}
                              {/* Show Delete button for both comment authors and announcement authors */}
                              <button
                                style={{ background: 'none', border: 'none', color: '#e74c3c', fontWeight: 500, fontSize: 15, padding: '8px 18px', textAlign: 'left', cursor: 'pointer', borderRadius: 0 }}
                                onClick={e => {
                                  e.stopPropagation();
                                  handleDeleteComment(announcement.id, idx);
                                  setOpenCommentMenu({});
                                }}
                              >Delete</button>
                            </div>
                          )}
                        </div>
                      );
                    }
                    // Don't show menu for others
                    return null;
                  })()}
                                        </div>
                                        {isEditing ? (
                  <div style={{ width: '100%' }}>
                                            <input
                                              type="text"
                      value={editingCommentText[`${announcement.id}-${idx}`] || ''}
                      onChange={e => setEditingCommentText(prev => ({ ...prev, [`${announcement.id}-${idx}`]: e.target.value }))}
                      style={{
                        width: '100%',
                        fontSize: 15,
                        borderRadius: 8,
                        border: '1px solid #e9ecef',
                        padding: '6px 12px',
                        margin: '6px 0 0 0',
                        fontWeight: 500,
                        color: '#232b3b',
                        background: '#fff',
                        boxSizing: 'border-box',
                        minHeight: 32,
                        height: 36
                      }}
                      autoFocus
                    />
                    <div style={{ display: 'flex', gap: 10, marginTop: 10, alignItems: 'center' }}>
                                            <button
                                              type="button"
                        onClick={() => handleCancelEditComment(announcement.id, idx)}
                        style={{
                          background: 'none',
                          border: 'none',
                          color: '#525F7F',
                          fontWeight: 500,
                          fontSize: 14,
                          cursor: 'pointer',
                          padding: '4px 10px',
                          height: 32,
                          borderRadius: 6
                        }}
                      >
                        Cancel
                      </button>
                      <button
                        type="button"
                        onClick={() => handleSaveEditComment(announcement.id, idx)}
                        style={{
                          background: '#22c55e',
                          color: '#fff',
                          border: 'none',
                          borderRadius: 6,
                          fontWeight: 700,
                          fontSize: 14,
                          padding: '4px 18px',
                          cursor: 'pointer',
                          boxShadow: '0 2px 8px #22c55e22',
                          transition: 'background 0.15s',
                          height: 32
                        }}
                                            >
                                              Save
                                            </button>
                    </div>
                                          </div>
                                        ) : (
                  <div style={{ fontSize: 15, color: '#232b3b', marginTop: 2 }}>{comment.text}</div>
                                        )}
              </div>
                                      </div>
                                    );
                                  })
                                ) : (
        <div style={{ color: '#888', fontSize: 14, marginBottom: 8 }}>No comments yet.</div>
                                )}
                                {/* Comment input */}
                                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 10 }}>
          {/* Current user avatar next to input */}
          {(() => {
            const me = currentUserProfile || (() => {
              try {
                const stored = localStorage.getItem('user') || localStorage.getItem('scms_logged_in_user');
                return stored ? JSON.parse(stored) : null;
              } catch (_) { return null; }
            })();
            const pic = me?.profile_pic || me?.profile_picture || me?.avatar;
            const avatarUrl = buildImageUrlFromProfilePic(pic);
            const displayName = me?.full_name || me?.name || me?.user_name;
            const bgColor = getAvatarColor({ name: displayName, full_name: displayName });
            const initials = getUserInitials({ name: displayName, full_name: displayName });
            return (
              <div style={{ width: 28, height: 28, borderRadius: '50%', overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center', background: avatarUrl ? '#e9ecef' : bgColor, color: '#fff', fontWeight: 700 }}>
                {avatarUrl ? (
                  <img src={avatarUrl} alt="me" style={{ width: 28, height: 28, borderRadius: '50%', objectFit: 'cover', display: 'block' }} onError={(e) => { e.target.style.display = 'none'; if (e.target.nextSibling) e.target.nextSibling.style.display = 'flex'; }} />
                ) : null}
                <span style={{ display: avatarUrl ? 'none' : 'flex', alignItems: 'center', justifyContent: 'center', width: '100%', height: '100%' }}>{initials}</span>
              </div>
            );
          })()}
        <Input
                                    type="text"
          placeholder="Add a comment..."
          value={commentInputs[announcement.id] || ""}
          onChange={e => setCommentInputs(inputs => ({ ...inputs, [announcement.id]: e.target.value }))}
          onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handlePostComment(announcement.id); } }}
          style={{ flex: 1, borderRadius: 8, border: '1px solid #e9ecef' }}
        />
        <Button
          color="primary"
          size="sm"
          onClick={() => handlePostComment(announcement.id)}
          style={{ borderRadius: 8, padding: '8px 16px' }}
        >
          <i className="fa fa-paper-plane" />
        </Button>
      </div>
    </div>
  )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
            {/* Add Students Modal */}
            {showStudentSelectModal && (
              <div style={{ position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', background: 'rgba(0,0,0,0.15)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <div style={{ background: '#fff', borderRadius: 20, boxShadow: '0 8px 32px rgba(44,62,80,.12)', width: 600, height: 490, padding: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'flex-start' }}>
                  <div style={{ borderRadius: 20, background: '#fff', padding: 0, width: '100%', height: '100%', display: 'flex', flexDirection: 'column' }}>
                    <div style={{ border: 'none', padding: '24px 24px 0 24px', fontWeight: 700, fontSize: 20, background: 'transparent', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                      <span>Add Students</span>
                      <button onClick={() => setShowStudentSelectModal(false)} style={{ background: 'none', border: 'none', fontSize: 22, color: '#888', cursor: 'pointer' }}>&times;</button>
                    </div>
                    <div style={{ padding: '0 24px 24px 24px' }}>

                      <div style={{ position: 'relative', width: '100%', marginBottom: 18 }}>
                        <i className="fa fa-search" style={{ position: 'absolute', left: 16, top: '50%', transform: 'translateY(-50%)', color: '#b0b7c3', fontSize: 16, pointerEvents: 'none' }} />
                        <input
                          placeholder="Search students..."
                          value={studentSearch}
                          onChange={e => setStudentSearch(e.target.value)}
                          style={{ background: '#f7f8fa', borderRadius: 8, border: '1px solid #e9ecef', fontSize: 14, color: '#232b3b', padding: '8px 14px 8px 40px', boxShadow: '0 1px 2px rgba(44,62,80,0.03)', minWidth: 0, width: '100%' }}
                        />
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
                        <span style={{ fontWeight: 600, color: '#222', fontSize: 12 }}>Students ({tempSelectedStudents.length}) - Total: {students.length}</span>
                        {(() => {
                          const filtered = students.filter(s => !studentSearch || s.name.toLowerCase().includes(studentSearch.toLowerCase()));
                          const allSelected = filtered.length > 0 && filtered.every(s => tempSelectedStudents.includes(s.id));
                          return (
                                  <button
                                    type="button"
                              style={{ background: 'none', border: 'none', color: '#5e72e4', fontWeight: 500, fontSize: 12, cursor: 'pointer', padding: '1px 6px', margin: 0 }}
                              onClick={() => {
                                if (allSelected) {
                                  setTempSelectedStudents(prev => prev.filter(id => !filtered.map(s => s.id).includes(id)));
                                } else {
                                  setTempSelectedStudents(prev => Array.from(new Set([...prev, ...filtered.map(s => s.id)])));
                                }
                              }}
                            >
                              {allSelected ? 'Unselect All' : 'Select All'}
                                  </button>
                          );
                        })()}
                                </div>
                      <div style={{ flex: 1, maxHeight: 180, overflowY: 'auto', border: 'none', borderRadius: 12, background: '#f9fafd', padding: '0 8px 0 0', marginBottom: 8 }}>
                        {students.filter(s => !studentSearch || s.name.toLowerCase().includes(studentSearch.toLowerCase())).length === 0 ? (
                          <div className="text-center text-muted py-5">No students found</div>
                        ) : (
                          students.filter(s => !studentSearch || s.name.toLowerCase().includes(studentSearch.toLowerCase())).map((s) => {
                            const isSelected = tempSelectedStudents.includes(s.id);
                            return (
                              <div
                                key={s.id}
                                style={{ display: 'flex', alignItems: 'center', padding: '6px 10px', borderRadius: 8, marginBottom: 2, cursor: 'pointer', background: isSelected ? '#eaf4fb' : 'transparent' }}
                                onClick={e => {
                                  if (e.target.type === 'checkbox') return;
                                  if (isSelected) {
                                    setTempSelectedStudents(prev => prev.filter(id => id !== s.id));
                                  } else {
                                    setTempSelectedStudents(prev => [...prev, s.id]);
                                  }
                                }}
                              >
                                {(() => {
                                  const avatarUrl = getProfilePictureUrl(s);
                                  const bgColor = getAvatarColor(s);
                                  const initials = getUserInitials(s);
                                  return (
                                    <div style={{ width: 28, height: 28, borderRadius: '50%', marginRight: 10, overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center', background: avatarUrl ? '#e9ecef' : bgColor, color: '#fff', fontWeight: 700, fontSize: 12 }}>
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
                                      <span style={{ display: avatarUrl ? 'none' : 'flex', width: '100%', height: '100%', alignItems: 'center', justifyContent: 'center' }}>{initials}</span>
                                    </div>
                                  );
                                })()}
                                <div style={{ flex: 1 }}>
                                  <div style={{ fontWeight: 600, fontSize: 14, color: '#2d3748', textTransform: 'none' }}>{s.name}</div>
                                  <div style={{ fontSize: 12, color: '#7b8a9b', fontWeight: 400 }}>{s.email || ''}</div>
                              </div>
                                <input
                                  type="checkbox"
                                  checked={isSelected}
                                  onChange={e => {
                                    if (e.target.checked) {
                                      setTempSelectedStudents(prev => [...prev, s.id]);
                                    } else {
                                      setTempSelectedStudents(prev => prev.filter(id => id !== s.id));
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
                      <div style={{ minHeight: 40, maxHeight: 80, overflowY: 'auto', display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 8, alignItems: tempSelectedStudents.length === 0 ? 'center' : 'flex-start', justifyContent: 'flex-start', background: '#f7f8fa', borderRadius: 10, padding: 10, border: '1.5px solid #e9ecef', marginTop: 10, marginBottom: 0 }}>
                            {tempSelectedStudents.length === 0 ? (
                              <div style={{ gridColumn: '1 / -1', width: '100%', height: '100%', minHeight: 40, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', color: '#b0b7c3', fontSize: 15, textAlign: 'center' }}>
                                <i className="fa fa-user-plus" style={{ marginBottom: 8, fontSize: 28, display: 'block' }} />
                                <div style={{ fontSize: 16, fontWeight: 500 }}>No students selected</div>
                        </div>
                            ) : (
                              tempSelectedStudents.map(id => {
                                const s = students.find(stu => stu.id === id);
                                return s ? (
                                  <span key={id} style={{ display: 'inline-flex', alignItems: 'center', background: '#e9ecef', borderRadius: 12, padding: '6px 10px', fontSize: 11, fontWeight: 600, color: '#2d3748', minHeight: 32, minWidth: 140, maxWidth: 200, marginRight: 6, overflow: 'hidden', textOverflow: 'ellipsis' }}>
                                    {(() => {
                                      const avatarUrl = getProfilePictureUrl(s);
                                      const bgColor = getAvatarColor(s);
                                      const initials = getUserInitials(s);
                                      return (
                                        <div style={{ width: 24, height: 24, borderRadius: '50%', marginRight: 8, overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center', background: avatarUrl ? '#e9ecef' : bgColor, color: '#fff', fontWeight: 700, fontSize: 10, flexShrink: 0 }}>
                                          {avatarUrl ? (
                                            <img
                                              src={avatarUrl}
                                              alt={s.name}
                                              style={{ width: 24, height: 24, borderRadius: '50%', objectFit: 'cover', display: 'block' }}
                                              onError={(e) => {
                                                e.target.style.display = 'none';
                                                if (e.target.nextSibling) e.target.nextSibling.style.display = 'flex';
                                              }}
                                            />
                                          ) : null}
                                          <span style={{ display: avatarUrl ? 'none' : 'flex', width: '100%', height: '100%', alignItems: 'center', justifyContent: 'center' }}>{initials}</span>
                                        </div>
                                      );
                                    })()}
                                    <span style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start', marginRight: 6, lineHeight: 1.1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: 120 }}>
                                      <span style={{ fontWeight: 600, fontSize: 11, color: '#2d3748', textTransform: 'none', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{s.name}</span>
                                      <span style={{ color: '#7b8a9b', fontWeight: 400, fontSize: 10, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{s.email || ''}</span>
                                    </span>
                                    <span style={{ flex: 1 }} />
                                    <i
                                      className="fa fa-times-circle"
                                      style={{ marginLeft: 3, cursor: 'pointer', color: '#7b8a9b', fontSize: 13 }}
                                      onClick={e => { e.stopPropagation(); setTempSelectedStudents(prev => prev.filter(n => n !== id)); }}
                                    />
                                  </span>
                                ) : null;
                              })
                            )}
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 12, marginTop: 18 }}>
                        <button onClick={() => setShowStudentSelectModal(false)} style={{ background: '#f7fafd', color: '#222', border: 'none', borderRadius: 8, padding: '10px 24px', fontWeight: 500, cursor: 'pointer' }}>Cancel</button>
                        <button onClick={() => { setSelectedAnnouncementStudents(tempSelectedStudents); setShowStudentSelectModal(false); }} style={{ background: '#6366f1', color: '#fff', border: 'none', borderRadius: 8, padding: '10px 24px', fontWeight: 600, cursor: 'pointer' }}>Confirm</button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </TabPane>

          {/* Class Tasks Tab */}
          <TabPane tabId="class">
            <Card className="mb-4" style={{ borderRadius: 18, boxShadow: '0 8px 32px rgba(50,76,221,0.10)', background: 'linear-gradient(135deg, #f8fafc 0%, #e9ecef 100%)', border: '1.5px solid #e9ecef' }}>
              <CardBody>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                  <h4 style={{ fontWeight: 800, color: '#324cdd', letterSpacing: 1, margin: 0 }}>
                    Class Tasks <i className="ni ni-tag text-warning ml-2" />
                  </h4>
                  <Button
                    color="light"
                    size="sm"
                    onClick={fetchTasks}
                    disabled={loadingTasks}
                    style={{ 
                      borderRadius: 8, 
                      padding: '6px 12px', 
                      fontSize: 12, 
                      fontWeight: 600,
                      display: 'flex',
                      alignItems: 'center',
                      gap: 6
                    }}
                  >
                    {loadingTasks ? (
                      <>
                        <div className="spinner-border spinner-border-sm" role="status">
                          <span className="sr-only">Loading...</span>
                        </div>
                        Loading...
                      </>
                    ) : (
                      <>
                        <i className="ni ni-refresh" />
                        Refresh
                      </>
                    )}
                  </Button>
                </div>
                {activeTab === "class" && (
                  <div style={{ display: 'flex', justifyContent: 'flex-start', marginBottom: 8, gap: 2 }}>
                    <Button
                      onClick={() => { setShowTaskScheduledCollapse(!showTaskScheduledCollapse); setShowTaskDraftsCollapse(false); }}
                      style={{
                        borderRadius: 6,
                        fontWeight: 500,
                        fontSize: 13,
                        padding: '4px 12px',
                        minHeight: 'auto',
                        lineHeight: 1.2,
                        display: 'flex',
                        alignItems: 'center',
                        gap: 6,
                        background: showTaskScheduledCollapse ? '#5E72E4' : '#fff',
                        color: showTaskScheduledCollapse ? '#fff' : '#222',
                        border: showTaskScheduledCollapse ? '1.5px solid #5E72E4' : '1.5px solid #222',
                        boxShadow: showTaskScheduledCollapse ? '0 2px 8px #324cdd22' : 'none',
                        transition: 'all 0.15s'
                      }}
                    >
                      <FaRegCalendarAlt style={{ fontSize: 15, marginRight: 4 }} /> Scheduled
                    </Button>
                    <Button
                      onClick={() => { setShowTaskDraftsCollapse(!showTaskDraftsCollapse); setShowTaskScheduledCollapse(false); }}
                      style={{
                        borderRadius: 6,
                        fontWeight: 500,
                        fontSize: 13,
                        padding: '4px 12px',
                        minHeight: 'auto',
                        lineHeight: 1.2,
                        display: 'flex',
                        alignItems: 'center',
                        gap: 6,
                        background: showTaskDraftsCollapse ? '#5E72E4' : '#fff',
                        color: showTaskDraftsCollapse ? '#fff' : '#222',
                        border: showTaskDraftsCollapse ? '1.5px solid #5E72E4' : '1.5px solid #222',
                        boxShadow: showTaskDraftsCollapse ? '0 2px 8px #324cdd22' : 'none',
                        transition: 'all 0.15s'
                      }}
                    >
                      <FaRegFileAlt style={{ fontSize: 15, marginRight: 4 }} /> Drafts
                    </Button>
                  </div>
                )}
                {activeTab === "class" && showTaskScheduledCollapse && (
                  <Collapse isOpen={showTaskScheduledCollapse}>
                    <Card style={{ marginBottom: 16, borderRadius: 12, boxShadow: '0 2px 8px #324cdd11' }}>
                      <CardBody style={{ maxHeight: 320, overflowY: 'auto' }}>
                        <h5>Scheduled Tasks</h5>
                        {taskScheduled.length === 0 ? (
                        <div style={{ color: '#888' }}>No scheduled tasks.</div>
                      ) : (
                          [...taskScheduled].sort((a, b) => {
                            const aDate = new Date(a.scheduledFor);
                            const bDate = new Date(b.scheduledFor);
                            return aDate - bDate;
                          }).map((item, idx) => (
                            <div key={idx} 
                              style={{ 
                                display: 'flex', 
                                alignItems: 'center', 
                                justifyContent: 'space-between', 
                                padding: '8px 12px',
                                borderBottom: '1px solid #e9ecef', 
                                background: '#fff',
                                borderRadius: 8,
                                marginBottom: 6,
                                boxShadow: '0 1px 4px #324cdd08',
                                cursor: 'default',
                                transition: 'background 0.13s',
                                fontFamily: 'inherit',
                                fontSize: 14,
                                color: '#232b3b',
                                fontWeight: 600
                              }}
                            >
                                      <div style={{ flex: 1, minWidth: 0 }}>
                                <div style={{ fontWeight: 700, fontSize: 15, color: '#232b3b', marginBottom: 2, fontFamily: 'inherit', letterSpacing: 0.5 }}>{item.title || '(No Title)'}</div>
                                <div style={{ fontWeight: 500, fontSize: 13, color: '#232b3b', opacity: 0.85, fontFamily: 'inherit', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: 220 }}>
                                  {truncate(item.text, 60)}
                                        </div>
                                <div style={{ fontSize: 11, color: '#8898AA', marginTop: 2 }}>
                                  Scheduled for {formatRelativeTime(item.scheduledFor)}
                                      </div>
                                <div style={{ fontSize: 11, color: '#888', display: 'flex', alignItems: 'center', gap: 8 }}>
                                  <span style={{ color: '#7D8FA9', fontWeight: 700, fontSize: 12 }}>
                                    <i className="fa fa-paperclip" style={{ marginRight: 3, fontSize: 12 }} />
                                    {item.attachments && item.attachments.length ? `${item.attachments.length} attachment${item.attachments.length !== 1 ? 's' : ''}` : 'No attachments'}
                                  </span>
                                  <span style={{ color: '#7D8FA9', fontWeight: 700, fontSize: 12, display: 'flex', alignItems: 'center' }}>
                                    <i className="fa fa-users" style={{ marginRight: 3, fontSize: 12 }} />
                                    {item.visibleTo && item.visibleTo.length > 0
                                      ? `${item.visibleTo.length} student${item.visibleTo.length !== 1 ? 's' : ''} selected`
                                      : '0 students selected'}
                                  </span>
                                    </div>
                              </div>
                          </div>
                        ))
                      )}
                      </CardBody>
                    </Card>
                  </Collapse>
                )}
                                {activeTab === "class" && (
                  <>
                    <Collapse isOpen={showTaskDraftsCollapse}>
                      <Card style={{ marginBottom: 16, borderRadius: 12, boxShadow: '0 2px 8px #324cdd11' }}>
                        <CardBody style={{ maxHeight: 320, overflowY: 'auto' }}>
                                                  <h5>Draft Tasks</h5>
                          {taskDrafts.length === 0 ? (
                            <div style={{ color: '#888' }}>No drafts saved.</div>
                          ) : (
                            [...taskDrafts].sort((a, b) => {
                              const aDate = new Date(a.lastEdited);
                              const bDate = new Date(b.lastEdited);
                              return bDate - aDate;
                            }).map((draft, idx) => (
                              <div key={idx} 
                                style={{ 
                                  display: 'flex', 
                                  alignItems: 'flex-start', 
                                  justifyContent: 'space-between', 
                                  padding: '8px 12px',
                                  borderBottom: '1px solid #e9ecef', 
                                  background: currentDraftId === draft.id ? '#f8faff' : '#fff',
                                  borderRadius: 8,
                                  marginBottom: 6,
                                  boxShadow: currentDraftId === draft.id ? '0 2px 8px #324cdd15' : '0 1px 4px #324cdd08',
                                  cursor: 'pointer',
                                  transition: 'background 0.13s',
                                  fontFamily: 'inherit',
                                  fontSize: 14,
                                  color: '#232b3b',
                                  fontWeight: 600,
                                  border: currentDraftId === draft.id ? '1px solid #bfcfff' : 'none'
                                }}
                                onClick={() => {
                                  setTaskForm({
                                    type: draft.type || 'Assignment',
                                    title: draft.title || '',
                                    text: draft.text || '',
                                    dueDate: draft.dueDate || '',
                                    points: draft.points || '',

                                    attachments: draft.attachments || [],
                                    visibleTo: draft.visibleTo || [],
                                    postToClassrooms: draft.postToClassrooms || ['current'],
                                    submitted: false
                                  });
                                  setTaskAttachments(draft.attachments || []);
                                  setTaskAssignedStudents(draft.visibleTo || []);
                                  setTaskFormExpanded(true);
                                  setCurrentDraftId(draft.id); 
                                }}
                              >
                                <div style={{ flex: 1, minWidth: 0 }}>
                                  <div style={{ fontWeight: 700, fontSize: 15, color: '#232b3b', marginBottom: 2, fontFamily: 'inherit', letterSpacing: 0.5 }}>{draft.title || '(No Title)'}</div>
                                  <div style={{ fontWeight: 500, fontSize: 13, color: '#232b3b', opacity: 0.85, fontFamily: 'inherit', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: 220 }}>
                                    {truncate(draft.text, 60)}
                                    </div>
                                  <div style={{ fontSize: 12, color: '#7D8FA9', marginTop: 2, display: 'flex', gap: 12, alignItems: 'center' }}>
                                    <span><b>Type:</b> {draft.type || 'Assignment'}</span>
                                    <span><b>Points:</b> {draft.points || '-'}</span>
                                    <span><b>Due:</b> {draft.dueDate || '-'}</span>
                                </div>
                                  <div style={{ fontSize: 11, color: '#888', display: 'flex', alignItems: 'center', gap: 8, marginTop: 2 }}>
                                    <span style={{ color: '#7D8FA9', fontWeight: 700, fontSize: 12 }}>
                                      <i className="fa fa-paperclip" style={{ marginRight: 3, fontSize: 12 }} />
                                      {draft.attachments && draft.attachments.length ? `${draft.attachments.length} attachment${draft.attachments.length !== 1 ? 's' : ''}` : 'No attachments'}
                                    </span>
                                    <span style={{ color: '#7D8FA9', fontWeight: 700, fontSize: 12, display: 'flex', alignItems: 'center' }}>
                                      <i className="fa fa-users" style={{ marginRight: 3, fontSize: 12 }} />
                                      {draft.visibleTo && draft.visibleTo.length > 0
                                        ? `${draft.visibleTo.length} student${draft.visibleTo.length !== 1 ? 's' : ''} selected`
                                        : '0 students selected'}
                                  </span>
                                </div>
                              </div>
                              <div style={{ fontSize: 11, color: '#8898AA', marginLeft: 12, textAlign: 'right', whiteSpace: 'nowrap' }}>
                                Last edited<br />
                                {formatRelativeTime(draft.lastEdited)}
                              </div>
                          </div>
                        ))
                      )}
                      </CardBody>
                    </Card>
                  </Collapse>
                  </>
                )}
                {activeTab === "class" && (
                  <div style={{ background: '#fff', borderRadius: 16, boxShadow: '0 2px 12px #324cdd11', border: '1.5px solid #e9ecef', padding: '1.5rem 1.5rem 1rem', marginBottom: 32, width: '100%', maxWidth: '100%', position: 'relative' }}>
                                          <div style={{ fontWeight: 700, fontSize: 14, letterSpacing: 0.5, color: '#111', marginBottom: 20, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                          <i className="ni ni-tag" style={{ fontSize: 20, color: '#f39c12' }} />
                          {currentDraftId ? 'Edit Draft Task' : 'Create New Task'}
                          {currentDraftId && (
                            <span style={{ 
                              background: '#e3eafe', 
                              color: '#324cdd', 
                              padding: '2px 8px', 
                              borderRadius: 12, 
                              fontSize: 11, 
                              fontWeight: 600,
                              marginLeft: 8
                            }}>
                              Editing Draft
                            </span>
                          )}
                    </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                          {taskFormExpanded && (
                            <>
                              {taskAssignedStudents.length > 0 && (
                                <span style={{ background: '#e3eafe', color: '#324cdd', borderRadius: '50%', padding: '1px 6px', fontWeight: 600, fontSize: 11, minWidth: 18, minHeight: 18, textAlign: 'center', boxShadow: '0 2px 8px #324cdd11', display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}>
                                  {taskAssignedStudents.length}
                                </span>
                              )}
                      <button
                        type="button"
                                className="btn"
                        style={{
                          borderRadius: 8,
                                  fontWeight: 600,
                                  width: 'auto',
                                  textAlign: 'center',
                          padding: '8px 12px',
                          border: '1px solid #e9ecef',
                          background: '#f8f9fa',
                          color: '#495057',
                                  fontSize: 14,
                                  display: 'inline-flex',
                          alignItems: 'center',
                          gap: 6,
                          boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
                          transition: 'all 0.15s ease',
                          cursor: 'pointer',
                          position: 'relative',
                          zIndex: 1
                        }}
                        onMouseEnter={(e) => {
                          e.target.style.background = '#e9ecef';
                          e.target.style.borderColor = '#dee2e6';
                          e.target.style.transform = 'translateY(-1px)';
                        }}
                        onMouseLeave={(e) => {
                          e.target.style.background = '#f8f9fa';
                          e.target.style.borderColor = '#e9ecef';
                          e.target.style.transform = 'translateY(0)';
                        }}
                                                onClick={async (e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          console.log('Add student button clicked');
                          
                          // Visual feedback
                          e.target.style.background = '#28a745';
                          e.target.style.color = '#fff';
                          setTimeout(() => {
                            e.target.style.background = '#f8f9fa';
                            e.target.style.color = '#495057';
                          }, 200);
                          
                          try {
                            // Reset search and selected users
                            setUserSearch('');
                            setSelectedUsers([]);
                            
                            // Load available students when opening the modal
                            const classCodes = (taskForm.postToClassrooms || []).map(classroom => {
                              if (classroom === 'current') {
                                return code; // Current classroom code
                              }
                              return classroom; // Other selected classroom codes
                            });
                            console.log('Loading students for class codes:', classCodes);
                            await loadAvailableStudents(classCodes);
                            setShowCreateStudentSelectModal(true);
                            console.log('Student select modal opened successfully');
                          } catch (error) {
                            console.error('Error opening student select modal:', error);
                            // Show error feedback
                            e.target.style.background = '#dc3545';
                            e.target.style.color = '#fff';
                            setTimeout(() => {
                              e.target.style.background = '#f8f9fa';
                              e.target.style.color = '#495057';
                            }, 1000);
                          }
                        }}
                                aria-label="Add students"
                              >
                                <i className="fa fa-user-plus" style={{ fontSize: 16 }} />
                              </button>
                            </>
                          )}
                        {!taskFormExpanded ? (
                          <button
                            type="button"
                            className="btn btn-primary"
                            style={{
                              borderRadius: 8,
                              fontWeight: 700,
                              fontSize: 14,
                              padding: '8px 16px',
                              border: 'none',
                              background: 'linear-gradient(135deg, #667eea 0%, #324cdd 100%)',
                              color: '#fff',
                              boxShadow: '0 2px 8px #667eea33',
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: 6,
                              transition: 'all 0.15s',
                            }}
                            onClick={() => setTaskFormExpanded(true)}
                            aria-label="Create task"
                          >
                            <i className="ni ni-tag" style={{ fontSize: 16 }} />
                            Create Task
                          </button>
                        ) : null}

                              </div>
                              </div>
                    <Collapse isOpen={taskFormExpanded}>
                      <Form onSubmit={editingTaskId ? handleUpdateTask : handlePostTask}>
                      <div className="d-flex flex-wrap" style={{ gap: 16, marginBottom: 16, width: '100%' }}>
<div style={{ flex: 1, minWidth: 200 }}>
  <label style={{ fontWeight: 600, fontSize: 14, color: '#222' }}>Post to Classrooms</label>
  <Select
    isMulti
    options={[
      { value: 'current', label: currentClassroom.name || currentClassroom.title || 'Current Classroom', avatar: currentClassroom.avatar || null, code: code, isDisabled: true },
      ...classrooms.map(cls => ({
        value: cls.code,
        label: cls.name || cls.title || 'Untitled',
        avatar: cls.avatar || null,
        code: cls.code,
        section: cls.section || ''
      }))
    ]}
    value={[
      { value: 'current', label: currentClassroom.name || currentClassroom.title || 'Current Classroom', avatar: currentClassroom.avatar || null, code: code, isDisabled: true },
      ...((taskForm.postToClassrooms || []).filter(val => val !== 'current').map(val => {
        const cls = classrooms.find(c => c.code === val);
        return cls ? {
          value: cls.code,
          label: cls.name || cls.title || 'Untitled',
          avatar: cls.avatar || null,
          code: cls.code,
          section: cls.section || ''
        } : null;
      }).filter(Boolean))
    ]}
    onChange={selected => {
      setTaskForm(prev => ({
        ...prev,
        postToClassrooms: ['current', ...selected.filter(opt => opt.value !== 'current').map(opt => opt.value)]
      }));
    }}
    classNamePrefix="classroom-select"
    styles={{
      control: base => ({ ...base, borderRadius: 8, fontSize: 13, background: '#f8fafc', border: '1px solid #bfcfff', minHeight: 48 }),
      menu: base => ({ ...base, zIndex: 9999 }),
      option: (base, state) => ({
        ...base,
                              display: 'flex',
                              alignItems: 'center',
        padding: '8px 12px',
        background: state.isSelected ? '#e6f0ff' : state.isFocused ? '#f0f4fa' : '#fff',
        color: state.isDisabled ? '#aaa' : '#222',
        cursor: state.isDisabled ? 'not-allowed' : 'pointer',
        opacity: state.isDisabled ? 0.7 : 1,
      }),
      multiValue: base => ({ ...base,     ...base,
        minWidth: 0,
        maxWidth: 400,
        flex: 1, background: '#e6f0ff', borderRadius: 16, padding: '2px 8px' }),
      multiValueLabel: base => ({ ...base,  minWidth: 0,  
        maxWidth: 370,
        width: '100%',
        whiteSpace: 'nowrap',
        overflow: 'hidden',
        textOverflow: 'ellipsis',
        display: 'block',
        fontSize: 12,
        fontWeight: 500,
        flex: 1, fontSize: 12, color: '#222', fontWeight: 500 }),
      multiValueRemove: (base, state) => {
        if (state.data.value === 'current') {
          return { display: 'none' };
        }
        return { ...base, color: '#888', ':hover': { background: '#bfcfff', color: '#222' } };
      },
    }}
    placeholder="Select classrooms..."
    components={{
      Option: props => {
        const { data } = props;
        return (
          <div {...props.innerProps} style={{
            display: 'flex',
            alignItems: 'center',
            padding: 6,
            background: props.isFocused ? '#f0f4fa' : '#fff',
            opacity: data.isDisabled ? 0.7 : 1
          }}>
            {data.avatar ? (
              <img
                src={data.avatar}
                alt="avatar"
                style={{
                              width: 32,
                              height: 32,
                  minWidth: 32,
                  minHeight: 32,
                  borderRadius: '50%',
                  flexShrink: 0,
                  objectFit: 'cover',
                  marginRight: 10
                }}
              />
            ) : (
              <div
                                style={{
                  width: 32,
                  height: 32,
                  minWidth: 32,
                  minHeight: 32,
                  borderRadius: '50%',
                  flexShrink: 0,
                  background: '#bfcfff',
                  color: '#222',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontWeight: 700,
                  fontSize: 12,
                  marginRight: 10
                }}
              >
                {data.label ? data.label.split(' ').map(w => w[0]).join('').slice(0,2).toUpperCase() : '?'}
              </div>
            )}
            <div style={{ display: 'flex', flexDirection: 'column', minWidth: 0, flex: 1 }}>
                                  <span
                                    style={{
                  fontWeight: 600,
                  fontSize: 12,
                  maxWidth: 120,
                  width: 120,
                  whiteSpace: 'nowrap',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  display: 'block'
                }}
              >
                {data.label}
              </span>
              <span style={{ fontSize: 12, color: '#666', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', width: '100%', display: 'block' }}>
                {data.section ? data.section + ' • ' : ''}{data.code}
              </span>
            </div>
          </div>
        );
      },
      MultiValueLabel: props => {
        const { data } = props;
        return (
          <div style={{
            display: 'flex',
            alignItems: 'center',
            minWidth: 0,
            flex: 1,
            maxWidth: 90
          }}>
            {data.avatar ? (
              <img src={data.avatar} alt="avatar" style={{ width: 20, height: 20, borderRadius: '50%', marginRight: 6, flexShrink: 0 }} />
            ) : (
              <div style={{
                width: 20,
                height: 20,
                minWidth: 20,
                minHeight: 20,
                borderRadius: '50%',
                background: '#bfcfff',
                color: '#222',
                                      display: 'flex',
                                      alignItems: 'center',
                                      justifyContent: 'center',
                fontWeight: 700,
                fontSize: 12,
                marginRight: 6,
                flexShrink: 0
              }}>
                {data.label ? data.label.split(' ').map(w => w[0]).join('').slice(0,2).toUpperCase() : '?'}
              </div>
            )}
            <span style={{
              minWidth: 0,
              maxWidth: 70,
              width: '100%',
              whiteSpace: 'nowrap',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              display: 'block',
              fontSize: 12,
              fontWeight: 500,
              flex: 1
            }}>
              {data.label}
            </span>
          </div>
        );
      },
      MultiValueRemove: (props) => {
        if (props.data.value === 'current') return null;
        // Avoid relying on imported components; render a simple remove control
        return (
          <div
            {...props.innerProps}
            style={{
              display: 'flex',
              alignItems: 'center',
              paddingLeft: 6,
              paddingRight: 6,
              cursor: 'pointer'
            }}
            aria-hidden
          >
            ×
          </div>
        );
      }
    }}
    menuPlacement="auto"
    menuPosition="fixed"
    isClearable={false}
    maxMenuHeight={200}
  />
  <small style={{ fontSize: 12, color: '#666', marginTop: 4 }}>
    Hold Ctrl/Cmd to select multiple classrooms
  </small>
                        </div>

                        <div style={{ flex: 2, minWidth: 260 }}>
                          <label style={{ fontWeight: 600, fontSize: 14, color: '#222' }}>Title *</label>
                          <input 
                            name="title" 
                            value={taskForm.title} 
                            onChange={handleTaskFormChange} 
                            className="form-control" 
                            style={{ 
                              borderRadius: 8, 
                              fontSize: 14, 
                              background: '#f8fafc',
                              border: taskForm.submitted && !taskForm.title.trim() ? '1px solid #dc3545' : '1px solid #bfcfff'
                            }} 
                            placeholder="Enter task title..." 
                            required
                          />
                          {taskForm.submitted && !taskForm.title.trim() && (
                            <small className="text-danger" style={{ fontSize: 12, marginTop: 4 }}>
                              Task title is required
                            </small>
                          )}
                        </div>

                        {/* Type Dropdown */}
                        <div style={{ flex: 1, minWidth: 120, maxWidth: 150 }}>
                          <label style={{ fontWeight: 600, fontSize: 14, color: '#222' }}>Type</label>
                          <select
                            name="type"
                            value={taskForm.type}
                            onChange={handleTaskFormChange}
                            className="form-control"
                            style={{ borderRadius: 8, fontSize: 14, background: '#f8fafc', border: '1px solid #bfcfff' }}
                            required
                          >
                            <option value="Assignment">Assignment</option>
                            <option value="Quiz">Quiz</option>
                            <option value="Activity">Activity</option>
                            <option value="Project">Project</option>
                            <option value="Exam">Exam</option>
                            <option value="Midterm Exam">Midterm Exam</option>
                            <option value="Final Exam">Final Exam</option>
                          </select>
                        </div>

                        <div style={{ flex: 1, minWidth: 120, maxWidth: 150 }}>
                          <label style={{ fontWeight: 600, fontSize: 14, color: '#222' }}>Points *</label>
                          <input
                            name="points"
                            type="number"
                            min="1"
                            value={taskForm.points}
                            onChange={handleTaskFormChange}
                            className="form-control"
                            style={{ borderRadius: 8, fontSize: 14, background: '#f8fafc', border: '1px solid #bfcfff' }}
                            placeholder="Enter points..."
                            required
                          />
                          {taskForm.submitted && !taskForm.points && (
                            <small className="text-danger" style={{ fontSize: 12, marginTop: 4 }}>
                              Points are required
                            </small>
                          )}
                        </div>

                        <div style={{ flex: 1, minWidth: 150, maxWidth: 200 }}>
                          <label style={{ fontWeight: 600, fontSize: 14, color: '#222' }}>Due Date</label>
                          <input
                            name="dueDate"
                            type="datetime-local"
                            value={taskForm.dueDate}
                            onChange={handleTaskFormChange}
                            className="form-control"
                            style={{ borderRadius: 8, fontSize: 14, background: '#f8fafc', border: '1px solid #bfcfff' }}
                            placeholder="Select due date..."
                          />
                        </div>

                      </div>
                      <FormGroup className="mb-3">
                        <Input
                          type="textarea"
                          name="text"
                          value={taskForm.text}
                          onChange={handleTaskFormChange}
                          placeholder="What would you like to share with your class?"
                          style={{ fontSize: 14, minHeight: 80, padding: 10, borderRadius: 8, border: '1px solid #bfcfff', background: '#fff' }}
                          required
                        />
                      </FormGroup>

                      {/* Selected Students Display */}
                      {taskAssignedStudents.length > 0 && (
                        <div style={{ marginBottom: 16 }}>
                          <label style={{ fontWeight: 600, fontSize: 14, color: '#222', marginBottom: 8, display: 'block' }}>
                            Assigned Students ({taskAssignedStudents.length})
                          </label>
                          <div style={{ 
                            background: '#f8f9fa', 
                            borderRadius: 8, 
                            border: '1px solid #e9ecef',
                            padding: 12,
                            maxHeight: 120,
                            overflowY: 'auto'
                          }}>
                            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                              {taskAssignedStudents.map(studentId => {
                                const student = students.find(s => s.id === studentId);
                                return student ? (
                                  <div
                                    key={studentId}
                                    style={{
                                      display: 'flex',
                                      alignItems: 'center',
                                      background: '#fff',
                                      borderRadius: 16,
                                      padding: '4px 8px',
                                      border: '1px solid #e9ecef',
                                      fontSize: 12
                                    }}
                                  >
                                    <div style={{ 
                                      width: 20, 
                                      height: 20, 
                                      borderRadius: '50%', 
                                      background: student.profile_pic ? 'transparent' : 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                                      display: 'flex',
                                      alignItems: 'center',
                                      justifyContent: 'center',
                                      color: '#fff',
                                      fontWeight: 600,
                                      fontSize: 10,
                                      marginRight: 6,
                                      overflow: 'hidden'
                                    }}>
                                      {(() => {
                                        const profilePictureUrl = getProfilePictureUrl(student);
                                        const userInitials = getUserInitials(student);
                                        const avatarColor = getAvatarColor(student);
                                        
                                        return (
                                          <>
                                            {profilePictureUrl ? (
                                              <img
                                                src={profilePictureUrl}
                                                alt={student.name}
                                                style={{
                                                  width: '100%',
                                                  height: '100%',
                                                  objectFit: 'cover'
                                                }}
                                                onError={(e) => {
                                                  e.target.style.display = 'none';
                                                  if (e.target.nextSibling) e.target.nextSibling.style.display = 'flex';
                                                }}
                                              />
                                            ) : null}
                                            <span style={{
                                              display: profilePictureUrl ? 'none' : 'flex',
                                              alignItems: 'center',
                                              justifyContent: 'center',
                                              width: '100%',
                                              height: '100%',
                                              color: '#fff',
                                              fontWeight: 'bold',
                                              fontSize: '10px'
                                            }}>
                                              {userInitials}
                                            </span>
                                          </>
                                        );
                                      })()}
                                    </div>
                                    <span style={{ fontWeight: 500, color: '#333' }}>
                                      {student.name}
                                    </span>
                                    <button
                                      type="button"
                                      onClick={() => {
                                        setTaskAssignedStudents(prev => prev.filter(id => id !== studentId));
                                      }}
                                      style={{
                                        background: 'none',
                                        border: 'none',
                                        color: '#dc3545',
                                        cursor: 'pointer',
                                        marginLeft: 6,
                                        fontSize: 14,
                                        fontWeight: 'bold'
                                      }}
                                    >
                                      ×
                                    </button>
                                  </div>
                                ) : null;
                              })}
                            </div>
                          </div>
                        </div>
                      )}
                      <div className="d-flex flex-row flex-wrap" style={{ gap: 24, marginBottom: 0, width: '100%' }}>
                        <div style={{ display: 'flex', gap: 8, marginTop: 2, justifyContent: 'flex-start' }}>
                          <input type="file" style={{ display: 'none' }} ref={taskFileInputRef} onChange={handleTaskFileChange} multiple />
                          <Dropdown isOpen={taskAttachmentDropdownOpen} toggle={() => setTaskAttachmentDropdownOpen(!taskAttachmentDropdownOpen)}>
                            <DropdownToggle color="secondary" style={{ fontSize: 18, padding: '4px 14px', borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                              <FaPaperclip />
                            </DropdownToggle>
                            <DropdownMenu>
                              <DropdownItem onClick={() => { setTaskAttachmentDropdownOpen(false); taskFileInputRef.current.click(); }}>File</DropdownItem>
                              <DropdownItem onClick={() => { setTaskAttachmentDropdownOpen(false); setShowTaskLinkModal(true); }}>Link</DropdownItem>
                              <DropdownItem onClick={() => { setTaskAttachmentDropdownOpen(false); setShowTaskYouTubeModal(true); }}>YouTube</DropdownItem>
                              <DropdownItem onClick={() => { setTaskAttachmentDropdownOpen(false); setShowTaskDriveModal(true); }}>Google Drive</DropdownItem>
                            </DropdownMenu>
                          </Dropdown>
                          <div style={{ position: 'relative' }}>
                            <Button color="secondary" style={{ fontSize: 18, padding: '4px 14px', borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center' }} onClick={() => setTaskEmojiPickerOpen(!taskEmojiPickerOpen)}>
                              <FaSmile />
                            </Button>
                            {taskEmojiPickerOpen && (
                              <div ref={taskEmojiPickerRef} className="task-emoji-dropdown" style={{ position: 'absolute', top: 40, left: 0, background: '#fff', border: '1px solid #e9ecef', borderRadius: 8, boxShadow: '0 2px 8px #324cdd22', padding: 8, zIndex: 10, minWidth: 280, maxWidth: 280, width: 280, maxHeight: 200, overflowY: 'auto' }}>
                                {emojiList.map(emoji => (
                                  <span key={emoji} style={{ fontSize: 22, cursor: 'pointer', margin: 4 }} onClick={() => {
                                    setTaskForm(prev => ({ ...prev, text: prev.text + emoji }));
                                    setTaskEmojiPickerOpen(false);
                                  }}>{emoji}</span>
                                ))}
                                <style>{`
                                  @media (max-width: 600px) {
                                    .task-emoji-dropdown {
                                      min-width: 180px !important;
                                      max-width: 180px !important;
                                      width: 180px !important;
                                    }
                                  }
                                `}</style>
                              </div>
                            )}
                        </div>
                        </div>
                      </div>
                      {taskAttachments.length > 0 && (
                        <div style={{ marginTop: 16, display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 16 }}>
                                {taskAttachments.map((att, idx) => {
                                  const { preview, type, color } = getFileTypeIconOrPreview(att);
                                  let url = undefined;
                                  if (att.file && (att.file instanceof File || att.file instanceof Blob)) {
                                    url = URL.createObjectURL(att.file);
                                  } else if (att.url) {
                                    url = att.url;
                                  }
                                  const isLink = att.type === "Link" || att.type === "YouTube" || att.type === "Google Drive";
                                  // Ensure link URLs are absolute external URLs and remove localhost prefixes
                                  let linkUrl = att.url;
                                  
                                  if (isLink && linkUrl) {
                                    // Remove localhost prefixes if they exist
                                    if (linkUrl.includes('localhost/scms_new_backup/')) {
                                      linkUrl = linkUrl.replace('https://scms-backend.up.railway.app/', '');
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
                                      key={idx}
                                style={{ 
                                  background: isLink ? `${color}08` : '#fff', 
                                  border: `1px solid ${isLink ? `${color}20` : '#e9ecef'}`,
                                  borderRadius: 8, 
                                  boxShadow: isLink ? `0 2px 12px ${color}15` : '0 2px 8px #e9ecef', 
                                  padding: '0.5rem 1.25rem', 
                                  display: 'flex', 
                                  alignItems: 'center', 
                                  gap: 12, 
                                  minWidth: 180, 
                                  maxWidth: 320,
                                  width: '100%', 
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
                                <button onClick={() => handleRemoveTaskAttachment(idx)} style={{ fontSize: 18, marginLeft: 4, background: 'none', border: 'none', color: '#e74c3c', cursor: 'pointer' }}>×</button>
                                    </div>
                                  );
                                })}
                              </div>
                            )}
                      <div style={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'center', marginTop: 16 }}>

                        <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                          <button
                            type="button"
                            className="btn btn-secondary"
                            style={{ borderRadius: 8, padding: '8px 16px', fontSize: 14, fontWeight: 600 }}
                            onClick={() => {
                              if (editingTaskId) {
                                handleCancelEditTask();
                              } else {
                                handleCancelTaskPost();
                              }
                              setTaskFormExpanded(false);
                            }}
                          >
                            {editingTaskId ? 'Cancel Edit' : 'Cancel'}
                          </button>
                          <button
                            type="submit"
                            className="btn btn-primary"
                            style={{
                              borderRadius: 8, 
                              padding: '8px 12px', 
                              fontSize: 18, 
                              fontWeight: 700, 
                              background: (taskForm.title.trim() && taskForm.points) 
                                ? 'linear-gradient(135deg, #667eea 0%, #324cdd 100%)' 
                                : '#ccc',
                              border: 'none',
                              cursor: (taskForm.title.trim() && taskForm.points) 
                                ? 'pointer' 
                                : 'not-allowed',
                              opacity: (taskForm.title.trim() && taskForm.points) ? 1 : 0.6,
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              width: 40,
                              height: 40
                            }}
                            disabled={!(taskForm.title.trim() && taskForm.points) || taskPostLoading}
                          >
                            {taskPostLoading ? (
                              <span className="spinner-border spinner-border-sm" role="status" aria-hidden="true" />
                            ) : (
                              <i className="ni ni-send" />
                            )}
                          </button>
                          <UncontrolledDropdown>
                            <DropdownToggle
                              tag="button"
                              type="button"
                              className="btn btn-light"
                              style={{ 
                                borderRadius: 8, 
                                padding: '8px 8px', 
                                fontSize: 18, 
                                color: (taskForm.title.trim() && taskForm.points) ? '#666' : '#ccc',
                                cursor: (taskForm.title.trim() && taskForm.points) ? 'pointer' : 'not-allowed',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                width: 32,
                                height: 40,
                                border: 'none',
                                background: '#fff',
                                opacity: (taskForm.title.trim() && taskForm.points) ? 1 : 0.5
                              }}
                              disabled={!(taskForm.title.trim() && taskForm.points) || taskPostLoading}
                            >
                              <div style={{ display: 'flex', flexDirection: 'column', gap: '2px', alignItems: 'center' }}>
                                <div style={{ width: '3px', height: '3px', borderRadius: '50%', backgroundColor: 'currentColor' }}></div>
                                <div style={{ width: '3px', height: '3px', borderRadius: '50%', backgroundColor: 'currentColor' }}></div>
                                <div style={{ width: '3px', height: '3px', borderRadius: '50%', backgroundColor: 'currentColor' }}></div>
                        </div>
                            </DropdownToggle>
                            <DropdownMenu style={{ borderRadius: 8, border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.15)', padding: '8px 0' }}>
                              <DropdownItem 
                                onClick={handleSaveTaskDraft}
                                style={{ 
                                  padding: '8px 16px', 
                                  fontSize: 14, 
                                  color: (taskForm.title.trim() && taskForm.points) ? '#333' : '#ccc',
                                  cursor: (taskForm.title.trim() && taskForm.points) ? 'pointer' : 'not-allowed'
                                }}
                                disabled={!(taskForm.title.trim() && taskForm.points) || taskPostLoading}
                              >
                                Save as Draft
                              </DropdownItem>
                              <DropdownItem 
                                onClick={() => {
                                  setShowTaskScheduleModal(true);
                                }}
                                style={{ 
                                  padding: '8px 16px', 
                                  fontSize: 14, 
                                  color: (taskForm.title.trim() && taskForm.points && taskForm.text.trim()) ? '#333' : '#ccc',
                                  cursor: (taskForm.title.trim() && taskForm.points && taskForm.text.trim()) ? 'pointer' : 'not-allowed'
                                }}
                                disabled={!(taskForm.title.trim() && taskForm.points && taskForm.text.trim()) || taskPostLoading}
                              >
                                Schedule
                              </DropdownItem>
                            </DropdownMenu>
                          </UncontrolledDropdown>
                        </div>
                      </div>
                    </Form>
                    </Collapse>
                    </div>
                  )}
                {activeTab === "class" && (
                  <div style={{ width: '100%' }}>
                    {loadingTasks && (
                      <div style={{ textAlign: 'center', padding: '2rem', color: '#666' }}>
                        <div className="spinner-border text-primary" role="status">
                          <span className="sr-only">Loading...</span>
                        </div>
                        <div style={{ marginTop: '1rem', fontSize: '14px' }}>Loading tasks...</div>
                      </div>
                    )}
                    
                    {taskError && (
                      <Alert color="danger" style={{ marginBottom: '1rem' }}>
                        <strong>Error loading tasks:</strong> {taskError}
                        <Button 
                          color="link" 
                          size="sm" 
                          onClick={fetchTasks}
                          style={{ padding: 0, marginLeft: '0.5rem' }}
                        >
                          Retry
                        </Button>
                      </Alert>
                    )}
                    
                    {!loadingTasks && !taskError && tasks.length === 0 && (
                      <div style={{ textAlign: 'center', padding: '2rem', color: '#666' }}>
                        <i className="ni ni-collection" style={{ fontSize: '3rem', marginBottom: '1rem', opacity: 0.5 }} />
                        <div style={{ fontSize: '16px', fontWeight: 600, marginBottom: '0.5rem' }}>No tasks yet</div>
                        <div style={{ fontSize: '14px' }}>Create your first task to get started</div>
                      </div>
                    )}
                    
                    {!loadingTasks && !taskError && tasks.map((task) => (
                                              <Card key={task.task_id || task.id || task._id || task.taskId} className="mb-4" style={{ borderRadius: 16, boxShadow: '0 2px 8px #324cdd11', border: '1.5px solid #e9ecef', background: '#fff', cursor: 'pointer' }}
                        onClick={() => {
                          console.log('Task object:', task);
                          
                          // Try different possible ID field names - prioritize task_id since that's what the API returns
                          const taskId = task.task_id || task.id || task._id || task.taskId;
                          
                          console.log('Selected Task ID:', taskId);
                          console.log('Task ID alternatives:', {
                            id: task.id,
                            task_id: task.task_id,
                            _id: task._id,
                            taskId: task.taskId
                          });
                          
                          if (taskId && taskId !== 'undefined') {
                            console.log('Navigating to task detail with ID:', taskId);
                            navigate(`/teacher/task/${taskId}`);
                          } else {
                            console.error('Task ID is undefined or invalid:', task);
                            console.error('Available task fields:', Object.keys(task));
                            alert('Task ID is missing. Cannot navigate to task detail.');
                          }
                        }}
                      >
                        <CardBody style={{ padding: '1.5rem' }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 16 }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                              <div style={{ width: 40, height: 40, borderRadius: '50%', background: 'linear-gradient(135deg, #f39c12 0%, #e67e22 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontWeight: 700, fontSize: 16 }}>
                                {(task.teacher_name || task.author || 'Teacher').charAt(0).toUpperCase()}
                              </div>
                              <div>
                                <div style={{ fontWeight: 700, fontSize: 16, color: '#232b3b' }}>
                                  {task.teacher_name || task.author || 'Teacher'}
                                </div>
                                <div style={{ fontSize: 13, color: '#8898AA' }}>
                                  {formatRelativeTime(task.created_at || task.date)}
                                </div>
                              </div>
                            </div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                              {task.isPinned && (
                                <Badge color="warning" style={{ fontSize: 12, padding: '4px 8px' }}>
                                  <i className="ni ni-pin-3" style={{ marginRight: 4 }} /> Pinned
                                </Badge>
                              )}
                              <UncontrolledDropdown>
                                <DropdownToggle tag="button" style={{ background: 'none', border: 'none', fontSize: 16, color: '#666', cursor: 'pointer', padding: '4px 8px', display: 'flex', flexDirection: 'column', gap: '2px', alignItems: 'center' }} onClick={(e) => e.stopPropagation()}>
                                  <div style={{ width: '3px', height: '3px', borderRadius: '50%', backgroundColor: '#666' }}></div>
                                  <div style={{ width: '3px', height: '3px', borderRadius: '50%', backgroundColor: '#666' }}></div>
                                  <div style={{ width: '3px', height: '3px', borderRadius: '50%', backgroundColor: '#666' }}></div>
                                </DropdownToggle>
                                <DropdownMenu>
                                  <DropdownItem onClick={(e) => {
                                    e.stopPropagation();
                                    handleEditTask(task.task_id || task.id || task._id || task.taskId);
                                  }}>
                                    <i className="ni ni-ruler-pencil" style={{ marginRight: 8 }} />
                                    Edit
                                  </DropdownItem>
                                  <DropdownItem onClick={(e) => {
                                    e.stopPropagation();
                                    console.log('Task object being deleted:', task);
                                    console.log('Available task ID fields:', {
                                      task_id: task.task_id,
                                      id: task.id,
                                      _id: task._id,
                                      taskId: task.taskId
                                    });
                                    handleDeleteTask(task.task_id || task.id || task._id || task.taskId);
                                  }}>
                                    <i className="ni ni-fat-remove" style={{ marginRight: 8 }} />
                                    Delete
                                  </DropdownItem>
                                </DropdownMenu>
                              </UncontrolledDropdown>
                              {/* Expand/Collapse toggle under 3-dots */}
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  const key = task.id || task.task_id || task._id || task.taskId;
                                  setCollapsedTasks(prev => ({ ...prev, [key]: (prev[key] === false) ? true : false }));
                                }}
                                aria-label="Toggle details"
                                title="Toggle details"
                                style={{
                                  background: '#f7fafc',
                                  border: '1px solid #e9ecef',
                                  borderRadius: 8,
                                  width: 28,
                                  height: 28,
                                  display: 'flex',
                                  alignItems: 'center',
                                  justifyContent: 'center',
                                  color: '#4a5568',
                                  cursor: 'pointer'
                                }}
                              >
                                {(collapsedTasks[task.id || task.task_id || task._id || task.taskId] !== false) ? '˅' : '^'}
                              </button>
                            </div>
                          </div>
                          {/* Task title */}
                          <div style={{ marginBottom: 12 }}>
                            <h5 style={{ fontWeight: 700, fontSize: 18, color: '#232b3b', margin: 0 }}>
                              {task.title || 'Untitled Task'}
                            </h5>
                          </div>

                          {/* Collapsible details */}
                          {(collapsedTasks[task.id || task.task_id || task._id || task.taskId] === false) && (
                            <>
                              <div style={{ fontSize: 15, color: '#232b3b', lineHeight: 1.6, marginBottom: 16 }}>
                                {task.instructions || task.text}
                              </div>
                            </>
                          )}
                          {(collapsedTasks[task.id || task.task_id || task._id || task.taskId] === false) && task.points && (
                            <div style={{ marginBottom: 16 }}>
                              <Badge color="info" style={{ fontSize: 12, padding: '4px 8px' }}>
                                <i className="ni ni-chart-bar-32" style={{ marginRight: 4 }} />
                                {task.points} points
                              </Badge>
                            </div>
                          )}
                          {(collapsedTasks[task.id || task.task_id || task._id || task.taskId] === false) && task.attachments && task.attachments.length > 0 && (
                            <div style={{ marginBottom: 16, display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 16 }}>
                              {console.log('Rendering task attachments:', task.attachments)}
                              {task.attachments.map((att, idx) => {
                                const { preview, type, color } = getFileTypeIconOrPreview(att);
                                let url = undefined;
                                if (att.file && (att.file instanceof File || att.file instanceof Blob)) {
                                  url = URL.createObjectURL(att.file);
                                } else if (att.url) {
                                  url = att.url;
                                } else if (att.attachment_url) {
                                  const p = att.attachment_url;
                                  if (typeof p === 'string' && (p.startsWith('http://') || p.startsWith('https://'))) {
                                    url = p;
                                  } else if (typeof p === 'string') {
                                    const base = (process.env.REACT_APP_API_BASE_URL || 'https://scms-backend.up.railway.app').replace(/\/$/, '');
                                    url = p.startsWith('uploads/') ? `${base}/${p}` : `${base}/uploads/tasks/${p}`;
                                  }
                                }
                                const isLink = att.type === "Link" || att.type === "YouTube" || att.type === "Google Drive" || (att.attachment_type && String(att.attachment_type).toLowerCase() !== 'file');
                                const displayName = isLink
                                  ? (att.name || att.url)
                                  : (att.original_name || att.file_name || att.name || (att.attachment_url ? att.attachment_url.split('/').pop() : 'Attachment'));
                                return (
                                  <div
                                    key={idx}
                                    style={{ 
                                      background: isLink ? `${color}08` : '#fff', 
                                      border: `1px solid ${isLink ? `${color}20` : '#e9ecef'}`,
                                      borderRadius: 8, 
                                      boxShadow: isLink ? `0 2px 12px ${color}15` : '0 2px 8px #e9ecef', 
                                      padding: '0.5rem 1.25rem', 
                                      display: 'flex', 
                                      alignItems: 'center', 
                                      gap: 12, 
                                      minWidth: 180, 
                                      maxWidth: 320, 
                                      width: '100%', 
                                      cursor: 'pointer',
                                      transition: 'all 0.2s ease'
                                    }}
                                    onClick={() => {
                                      if (isLink && att.url) {
                                        window.open(att.url, '_blank', 'noopener,noreferrer');
                                      } else if (att.type === "YouTube" || att.type === "Google Drive" || att.type === "Link") {
                                        // For YouTube, Google Drive, and Link types, always open in new tab
                                        window.open(att.url, '_blank', 'noopener,noreferrer');
                                      } else {
                                        handlePreviewAttachment(att);
                                      }
                                    }}
                                  >
                                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginRight: 8 }}>{preview}</div>
                                    <div style={{ flex: 1, minWidth: 0 }}>
                                      <div style={{ fontWeight: 600, fontSize: 16, color: '#232b3b', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: 180 }} title={displayName}>{displayName}</div>
                                      <div style={{ fontSize: 13, color: '#90A4AE', marginTop: 2 }}>
                                        {type}
                                        {url && <>&bull; <a href={url} download={(att.original_name || att.file_name || att.name)} style={{ color: color, fontWeight: 600, textDecoration: 'none' }} onClick={e => e.stopPropagation()}>Download</a></>}
                                        {isLink && <>&bull; <a href={att.url} target="_blank" rel="noopener noreferrer" style={{ color: color, fontWeight: 600, textDecoration: 'none' }} onClick={e => e.stopPropagation()}>View Link</a></>}
                                </div>
                                    </div>
                                  </div>
                                );
                              })}
                            </div>
                          )}
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                              {/* Only show like button for students */}
                              {userRole === 'student' && (
                                <button
                                onClick={() => handleLikeTask(task.id)}
                                  style={{ background: 'none', border: 'none', display: 'flex', alignItems: 'center', gap: 6, color: task.isLiked ? '#e74c3c' : '#666', cursor: 'pointer', fontSize: 14, fontWeight: 600 }}
                                >
                                  <i className={`ni ${task.isLiked ? 'ni-favourite-28' : 'ni-like-2'}`} />
                                  {task.likes > 0 && task.likes}
                                </button>
                              )}

                            </div>
                            <div style={{ fontSize: 13, color: '#8898AA' }}>
                              {mapTaskTypeToFrontend(task.type)} • {task.points} pts • Due {task.due_date ? formatRelativeTime(task.due_date) : 'No due date'}
                            </div>
                          </div>
                          {taskCommentsOpen[task.id] && (
                            <div style={{ borderTop: '1px solid #e9ecef', paddingTop: 16 }}>
                              {task.comments && task.comments.map((comment, idx) => {
                                const isEditing = editingComment[task.id] === idx;
                                return (
                                  <div key={idx} style={{ display: 'flex', alignItems: 'flex-start', marginBottom: 10, position: 'relative' }}>
                                    <img
                                      src={getAvatarForUser(findUserByName(comment.author))}
                                      alt={comment.author}
                                      style={{
                                        width: 32,
                                        height: 32,
                                        borderRadius: '50%',
                                        objectFit: 'cover',
                                        marginRight: 10,
                                        border: '1px solid #e9ecef'
                                      }}
                                    />
                                    <div style={{ flex: 1 }}>
                                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                                      <div>
                                        <div style={{ fontWeight: 600, fontSize: 14, color: '#232b3b' }}>{comment.author}</div>
                                          <div style={{ fontSize: 12, color: '#8898AA' }}>
                                            {formatRelativeTime(comment.date)}
                                      </div>
                                    </div>
                                        {/* 3-dots menu - Only show for comment authors and task authors */}
                                        {(() => {
                                          // Check if current user can manage this comment
                                          const currentUser = currentUserProfile || (() => {
                                            try {
                                              const stored = localStorage.getItem('user') || localStorage.getItem('scms_logged_in_user');
                                              return stored ? JSON.parse(stored) : null;
                                            } catch (_) { return null; }
                                          })();
                                          
                                          const isCommentAuthor = currentUser && (
                                            currentUser.full_name === comment.author ||
                                            currentUser.name === comment.author ||
                                            currentUser.user_name === comment.author
                                          );
                                          
                                          const isTaskAuthor = currentUser && (
                                            currentUser.full_name === task.author ||
                                            currentUser.name === task.author ||
                                            currentUser.user_name === task.author
                                          );
                                          
                                          // Show menu if user is comment author (can edit/delete) or task author (can delete any comment)
                                          if (isCommentAuthor || isTaskAuthor) {
                                            // Debug logging for task comment authorization
                                            console.log('Task comment authorization:', {
                                              commentAuthor: comment.author,
                                              taskAuthor: task.author,
                                              currentUser: currentUser?.full_name || currentUser?.name || currentUser?.user_name,
                                              isCommentAuthor,
                                              isTaskAuthor,
                                              canEdit: isCommentAuthor,
                                              canDelete: true
                                            });
                                            
                                            return (
                                              <div style={{ position: 'relative', marginLeft: 8 }}>
                                                <button
                                                  style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 2, borderRadius: 4, width: 24, height: 24, display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                                                  onClick={e => {
                                                    e.stopPropagation();
                                                    setOpenCommentMenu(prev => ({ ...prev, [`${task.id}-${idx}`]: !prev[`${task.id}-${idx}`] }));
                                                  }}
                                                  aria-label="Open comment menu"
                                                >
                                                  <span style={{ display: 'inline-block', fontSize: 18, color: '#6c7a89', lineHeight: 1 }}>
                                                    <i className="fa fa-ellipsis-v" />
                                                  </span>
                                                </button>
                                                {openCommentMenu[`${task.id}-${idx}`] && (
                                                  <div
                                                    style={{
                                                      position: 'absolute',
                                                      top: 24,
                                                      right: 0,
                                                      background: '#fff',
                                                      borderRadius: 10,
                                                      boxShadow: '0 4px 16px rgba(44,62,80,0.13)',
                                                      zIndex: 100,
                                                      minWidth: 120,
                                                      padding: '8px 0',
                                                      border: '1px solid #e9ecef',
                                                      display: 'flex',
                                                      flexDirection: 'column',
                                                      gap: 0
                                                    }}
                                                  >
                                                    {/* Only show Edit button for comment authors */}
                                                    {isCommentAuthor && (
                                                      <button
                                                        style={{ background: 'none', border: 'none', color: '#525F7F', fontWeight: 500, fontSize: 15, padding: '8px 18px', textAlign: 'left', cursor: 'pointer', borderRadius: 0 }}
                                                        onClick={e => {
                                                          e.stopPropagation();
                                                          setEditingComment({ [task.id]: idx });
                                                          setEditingCommentText(prev => ({ ...prev, [`${task.id}-${idx}`]: comment.text || '' }));
                                                          setOpenCommentMenu({});
                                                        }}
                                                      >Edit</button>
                                                    )}
                                                    {/* Show Delete button for both comment authors and task authors */}
                                                    <button
                                                      style={{ background: 'none', border: 'none', color: '#e74c3c', fontWeight: 500, fontSize: 15, padding: '8px 18px', textAlign: 'left', cursor: 'pointer', borderRadius: 0 }}
                                                      onClick={e => {
                                                        e.stopPropagation();
                                                        handleDeleteComment(task.id, idx);
                                                        setOpenCommentMenu({});
                                                      }}
                                                    >Delete</button>
                                                  </div>
                                                )}
                                              </div>
                                            );
                                          }
                                          // Don't show menu for others
                                          return null;
                                        })()}
                                      </div>
                                      {isEditing ? (
                                        <div style={{ width: '100%' }}>
                                          <input
                                            type="text"
                                            value={editingCommentText[`${task.id}-${idx}`] || ''}
                                            onChange={e => setEditingCommentText(prev => ({ ...prev, [`${task.id}-${idx}`]: e.target.value }))}
                                            style={{
                                              width: '100%',
                                              fontSize: 15,
                                              borderRadius: 8,
                                              border: '1px solid #e9ecef',
                                              padding: '6px 12px',
                                              margin: '6px 0 0 0',
                                              fontWeight: 500,
                                              color: '#232b3b',
                                              background: '#fff',
                                              boxSizing: 'border-box',
                                              minHeight: 32,
                                              height: 36
                                            }}
                                            autoFocus
                                          />
                                          <div style={{ display: 'flex', gap: 10, marginTop: 10, alignItems: 'center' }}>
                                    <button
                                              type="button"
                                              onClick={() => handleCancelEditComment(task.id, idx)}
                                              style={{
                                                background: 'none',
                                                border: 'none',
                                                color: '#525F7F',
                                                fontWeight: 500,
                                                fontSize: 14,
                                                cursor: 'pointer',
                                                padding: '4px 10px',
                                                height: 32,
                                                borderRadius: 6
                                              }}
                                            >
                                              Cancel
                                            </button>
                                    <button
                                              type="button"
                                              onClick={() => handleSaveEditComment(task.id, idx)}
                                              style={{
                                                background: '#22c55e',
                                                color: '#fff',
                                                border: 'none',
                                                borderRadius: 6,
                                                fontWeight: 700,
                                                fontSize: 14,
                                                padding: '4px 18px',
                                                cursor: 'pointer',
                                                boxShadow: '0 2px 8px #22c55e22',
                                                transition: 'background 0.15s',
                                                height: 32
                                              }}
                                            >
                                              Save
                                      </button>
                                    </div>
                                  </div>
                                      ) : (
                                        <div style={{ fontSize: 15, color: '#232b3b', marginTop: 2 }}>{comment.text}</div>
                                      )}
                                  </div>
                                </div>
                                );
                              })}
                              <div style={{ marginTop: 12 }}>
                                <div style={{ display: 'flex', gap: 8, alignItems: 'flex-end' }}>
                                  <Input
                                    type="text"
                                    placeholder="Write a comment..."
                                    value={taskCommentInputs[task.id] || ''}
                                    onChange={(e) => setTaskCommentInputs(prev => ({ ...prev, [task.id]: e.target.value }))}
                                    style={{ flex: 1, borderRadius: 8, border: '1px solid #e9ecef' }}
                                  />
                                  <Button
                                    color="primary"
                                    size="sm"
                                    onClick={() => handlePostTaskComment(task.id)}
                                    style={{ borderRadius: 8, padding: '8px 16px' }}
                                  >
                                    Post
                                  </Button>
                                </div>
                              </div>
                                </div>
                              )}
                        </CardBody>
                      </Card>
                    ))}
                            </div>
                )}
              </CardBody>
            </Card>
          </TabPane>

          {/* People Tab */}
          <TabPane tabId="people">
            <Card className="mb-4" style={{ borderRadius: 18, boxShadow: '0 8px 32px rgba(50,76,221,0.10)', background: 'linear-gradient(135deg, #f8fafc 0%, #e9ecef 100%)', border: '1.5px solid #e9ecef' }}>
              <CardBody>
                <div className="d-flex justify-content-between align-items-center mb-3">
                  <div>
                    <h4 className="mb-0" style={{ fontWeight: 800, color: '#111111', letterSpacing: 1 }}>People <i className="ni ni-single-02 text-success ml-2" /></h4>
                    {!loadingStudents && (
                      <small className="text-muted">
                        {students.length} {students.length === 1 ? 'student' : 'students'} enrolled
                      </small>
                    )}
                  </div>
                  <div>
                    <Button 
                      size="sm" 
                      style={{ borderRadius: "8px", backgroundColor: "#28a745", borderColor: "#28a745", color: "white", marginRight: "8px" }} 
                      onClick={fetchEnrolledStudents}
                      disabled={loadingStudents}
                    >
                      <i className={`fa fa-refresh mr-1 ${loadingStudents ? 'fa-spin' : ''}`} style={{ color: "white" }}></i> 
                      {loadingStudents ? 'Loading...' : 'Refresh'}
                    </Button>
                    <Button size="sm" style={{ borderRadius: "8px", backgroundColor: "#7B8CFF", borderColor: "#7B8CFF", color: "white" }} onClick={() => setShowInviteModal(true)}>
                      <i className="fa fa-user-plus mr-1" style={{ color: "white" }}></i> Invite
                    </Button>
                  </div>
                </div>
                
                {console.log('Current students state:', students)}
                {loadingStudents ? (
                  <div className="text-center py-4">
                    <div className="spinner-border text-primary" role="status">
                      <span className="sr-only">Loading...</span>
                    </div>
                    <p className="mt-2 text-muted">Loading enrolled students...</p>
                  </div>
                ) : (
                  <Table responsive>
                    <thead>
                      <tr>
                        <th style={{ fontWeight: 700, color: '#111111', fontSize: '14px' }}>Name</th>
                        <th style={{ fontWeight: 700, color: '#111111', fontSize: '14px' }}>Email</th>
                        <th style={{ fontWeight: 700, color: '#111111', fontSize: '14px' }}>Student ID</th>
                        <th style={{ fontWeight: 700, color: '#111111', fontSize: '14px' }}>Joined</th>
                        {/* Actions column removed */}
                      </tr>
                    </thead>
                    <tbody>
                      {students.length === 0 ? (
                        <tr>
                          <td colSpan="4" className="text-center py-4 text-muted">
                            No students enrolled in this class yet.
                          </td>
                        </tr>
                      ) : (
                        students.map((student) => (
                          <tr key={student.id} style={{ minHeight: '32px', height: '36px' }}>
                            <td style={{ paddingTop: '6px', paddingBottom: '6px' }}>
                              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                {(() => {
                                  const displayName = student.name || student.full_name || 'User';
                                  const avatarUrl = getProfilePictureUrl(student);
                                  const initials = getUserInitials({ name: displayName, full_name: displayName });
                                  const bgColor = getAvatarColor({ name: displayName, full_name: displayName });
                                  return (
                                    <div
                                      style={{
                                        width: 40,
                                        height: 40,
                                        borderRadius: '50%',
                                        overflow: 'hidden',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        background: avatarUrl ? '#e9ecef' : bgColor,
                                        border: '2px solid #e9ecef',
                                        boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
                                      }}
                                    >
                                      {avatarUrl && (
                                        <img
                                          src={avatarUrl}
                                          alt={displayName}
                                          style={{ width: 40, height: 40, borderRadius: '50%', objectFit: 'cover', display: 'block' }}
                                          onError={(e) => {
                                            e.target.style.display = 'none';
                                            if (e.target.nextSibling) {
                                              e.target.nextSibling.style.display = 'flex';
                                            }
                                          }}
                                        />
                                      )}
                                      <span style={{ display: avatarUrl ? 'none' : 'flex', width: '100%', height: '100%', alignItems: 'center', justifyContent: 'center', color: '#fff', fontWeight: 700 }}>
                                        {initials}
                                      </span>
                                    </div>
                                  );
                                })()}
                                <span style={{ fontWeight: 600, color: '#232b3b', fontSize: '14px' }}>{student.name}</span>
                              </div>
                            </td>
                            <td style={{ fontWeight: 500, color: '#232b3b', fontSize: '14px', verticalAlign: 'middle', paddingTop: '6px', paddingBottom: '6px' }}>{student.email}</td>
                            <td style={{ fontWeight: 500, color: '#232b3b', fontSize: '14px', verticalAlign: 'middle', paddingTop: '6px', paddingBottom: '6px' }}>
                              {student.student_num || student.id}
                            </td>
                            <td style={{ fontWeight: 500, color: '#232b3b', fontSize: '14px', verticalAlign: 'middle', paddingTop: '6px', paddingBottom: '6px' }}>
                              {student.joinedDate ? formatRelativeTime(student.joinedDate) : ''}
                            </td>
                            {/* Actions column removed */}
                          </tr>
                        ))
                      )}
                    </tbody>  
                  </Table>
                )}
              </CardBody>
            </Card>
          </TabPane>

          {/* Grades Tab */}
          <TabPane tabId="grades">
            <Card className="mb-4" style={{ borderRadius: 14, boxShadow: '0 2px 8px rgba(44,62,80,0.07)' }}>
              <CardBody>
                {loadingGrades ? (
                  <div className="text-center py-5">
                    <div className="spinner-border text-primary" role="status">
                      <span className="sr-only">Loading...</span>
                    </div>
                    <p className="mt-3 text-muted">Loading grades...</p>
                  </div>
                ) : gradesError ? (
                  <Alert color="danger">
                    <h4>Error Loading Grades</h4>
                    <p>{gradesError}</p>
                  </Alert>
                ) : gradesData ? (
                  <>
                    {/* Statistics Banner */}
                    <div className="row mb-4">
                      <div className="col-md-3">
                        <div className="text-center p-3 bg-light rounded">
                          <h5 className="text-muted mb-1">Total Students</h5>
                          <h3 className="mb-0 text-primary">{gradesData.statistics?.total_students || 0}</h3>
                        </div>
                      </div>
                      <div className="col-md-3">
                        <div className="text-center p-3 bg-light rounded">
                          <h5 className="text-muted mb-1">Total Assignments</h5>
                          <h3 className="mb-0 text-success">{gradesData.statistics?.total_assignments || 0}</h3>
                        </div>
                      </div>
                      <div className="col-md-3">
                        <div className="text-center p-3 bg-light rounded">
                          <h5 className="text-muted mb-1">Submissions</h5>
                          <h3 className="mb-0 text-info">{gradesData.statistics?.total_submissions || 0}</h3>
                        </div>
                      </div>
                      <div className="col-md-3">
                        <div className="text-center p-3 bg-light rounded">
                          <h5 className="text-muted mb-1">Class Average</h5>
                          <h3 className="mb-0 text-warning">{gradesData.statistics?.average_class_grade || 0}%</h3>
                        </div>
                      </div>
                    </div>

                    {/* Students Grades Table */}
                    <div className="d-flex justify-content-between align-items-center mb-3">
                      <h4 className="mb-0">Student Grades</h4>
                      <div>
                        <Button 
                          color="secondary" 
                          size="sm" 
                          style={{ borderRadius: "8px", marginRight: 8 }} 
                          onClick={() => setShowWeightsModal(true)}
                        >
                          <i className="ni ni-settings-gear-65 mr-1"></i> Edit Grading %
                        </Button>
                        <Button 
                          color="success" 
                          size="sm" 
                          style={{ borderRadius: "8px" }} 
                          onClick={handleExportGrades}
                          disabled={exportLoading}
                        >
                          <i className="ni ni-chart-bar-32 mr-1"></i> Export Grades
                        </Button>
                      </div>
                    </div>
                    
                    <Table responsive>
                      <thead>
                        <tr>
                          <th>Student</th>
                          <th>Attendance</th>
                          <th>RS</th>
                          <th>PS</th>
                          <th>WS</th>
                          {gradesData.tasks?.filter(task => 
                            task.type !== 'midterm_exam' && 
                            task.type !== 'final_exam' && 
                            !task.title.toLowerCase().includes('midterm') &&
                            !task.title.toLowerCase().includes('final')
                          ).map(task => (
                            <th key={task.task_id}>{task.title}</th>
                          ))}
                          <th>Total Score</th>
                          <th>RS</th>
                          <th>PS</th>
                          <th>WS</th>
                          <th>Midterm</th>
                          <th>PS</th>
                          <th>WS</th>
                          <th>Final Exam</th>
                          <th>PS</th>
                          <th>WS</th>
                          <th>Quarterly Grade</th>
                          <th>Rounded</th>
                          <th>Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {(() => {
                          const tasks = gradesData.tasks || [];
                          const nonExamTasks = tasks.filter(task => 
                            task.type !== 'midterm_exam' && 
                            task.type !== 'final_exam' && 
                            !(task.title || '').toLowerCase().includes('midterm') &&
                            !(task.title || '').toLowerCase().includes('final')
                          );

                          const getPoints = (t) => parseFloat(t?.points || t?.max_points || t?.total_points || t?.max_score || 0) || 0;
                          const assignmentMaxPoints = nonExamTasks.map(getPoints);
                          const totalAssignmentMax = assignmentMaxPoints.reduce((acc, v) => acc + v, 0);

                          const midtermTask = tasks.find(task => 
                            task.type === 'midterm_exam' || 
                            task.type === 'midterm' ||
                            (task.title || '').toLowerCase().includes('midterm') ||
                            (task.title || '').toLowerCase().includes('mid term') ||
                            (task.title || '').toLowerCase().includes('mid-term')
                          );
                          const finalTask = tasks.find(task => 
                            task.type === 'final_exam' || 
                            task.type === 'final' ||
                            (task.title || '').toLowerCase().includes('final exam') ||
                            (task.title || '').toLowerCase().includes('final-exam') ||
                            (task.title || '').toLowerCase().includes('final')
                          );

                          const midtermMax = (() => { const p = getPoints(midtermTask); return p > 0 ? p : maxMidtermScore; })();
                          const finalMax = (() => { const p = getPoints(finalTask); return p > 0 ? p : maxFinalExamScore; })();

                          const majorWeight = (Number(gradingBreakdown.midtermExam)||0) + (Number(gradingBreakdown.finalExam)||0);
                          const quarterlyMaxExact = (Number(gradingBreakdown.attendance)||0) + (Number(gradingBreakdown.activity)||0) + majorWeight;
                          const quarterlyMaxRounded = Math.round(quarterlyMaxExact);

                          return (
                            <tr key="highest-possible" style={{ background: '#fffbea' }}>
                              <td className="font-weight-bold">Highest Possible Score</td>
                              <td>
                                <div>
                                  <div className="font-weight-bold">{maxAttendanceScore}/{maxAttendanceScore}</div>
                                  <small className="text-muted">100%</small>
                                </div>
                              </td>
                              <td>{Number(maxAttendanceScore).toFixed(2)}</td>
                              <td>100.00%</td>
                              <td>{Number(gradingBreakdown.attendance || 0).toFixed(2)}</td>
                              {nonExamTasks.map(task => {
                                const pts = getPoints(task);
                                return (
                                  <td key={`max-${task.task_id}`}>
                                    <div className="font-weight-bold">{pts}/{pts}</div>
                                  </td>
                                );
                              })}
                              <td className="font-weight-bold text-primary">{totalAssignmentMax}</td>
                              <td className="font-weight-bold text-success">{totalAssignmentMax.toFixed(2)}</td>
                              <td className="font-weight-bold text-info">100.00%</td>
                              <td className="font-weight-bold text-warning">{Number(gradingBreakdown.activity || 0).toFixed(2)}</td>
                              <td className="font-weight-bold">{midtermMax}</td>
                              <td className="text-info">100.00%</td>
                              <td className="text-warning">{majorWeight.toFixed(2)}</td>
                              <td className="font-weight-bold">{finalMax}</td>
                              <td className="text-info">100.00%</td>
                              <td className="text-warning">{majorWeight.toFixed(2)}</td>
                              <td className="font-weight-bold text-success">{quarterlyMaxExact.toFixed(2)}</td>
                              <td className="font-weight-bold text-success">{quarterlyMaxRounded}</td>
                              <td></td>
                            </tr>
                          );
                        })()}
                        {gradesData.students?.map((student) => (
                          <tr key={student.student_id}>
                            <td>
                              <div className="d-flex align-items-center">
                                {(() => {
                                  const profilePictureUrl = getProfilePictureUrl(student);
                                  const userInitials = getUserInitials(student);
                                  const avatarColor = getAvatarColor(student);
                                  
                                  return (
                                    <div style={{
                                      width: '32px',
                                      height: '32px',
                                      borderRadius: '50%',
                                      background: profilePictureUrl ? '#e9ecef' : avatarColor,
                                      display: 'flex',
                                      alignItems: 'center',
                                      justifyContent: 'center',
                                      marginRight: '8px',
                                      overflow: 'hidden'
                                    }}>
                                      {profilePictureUrl ? (
                                        <img
                                          src={profilePictureUrl}
                                          alt={student.student_name}
                                          style={{
                                            width: '100%',
                                            height: '100%',
                                            objectFit: 'cover'
                                          }}
                                          onError={(e) => {
                                            e.target.style.display = 'none';
                                            if (e.target.nextSibling) e.target.nextSibling.style.display = 'flex';
                                          }}
                                        />
                                      ) : null}
                                      <span style={{
                                        display: profilePictureUrl ? 'none' : 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        width: '100%',
                                        height: '100%',
                                        color: '#fff',
                                        fontWeight: 'bold',
                                        fontSize: '12px'
                                      }}>
                                        {userInitials}
                                      </span>
                                    </div>
                                  );
                                })()}
                                <div>
                                  <div className="font-weight-bold">{student.student_name}</div>
                                  <small className="text-muted">{student.student_num}</small>
                                </div>
                              </div>
                            </td>
                            <td>
                              {student.attendance ? (
                                <div>
                                  <div className="font-weight-bold">
                                    {computeAttendanceMetrics(student.attendance).rawScore.toFixed(1)}/{maxAttendanceScore}
                                  </div>
                                  <small className="text-muted">
                                    {computeAttendanceMetrics(student.attendance).percentage.toFixed(1)}%
                                  </small>
                                  <div className="mt-1">
                                    <small className="text-muted">
                                      P: {student.attendance.present_sessions} | 
                                      L: {student.attendance.late_sessions} | 
                                      A: {student.attendance.absent_sessions} | 
                                      E: {student.attendance.excused_sessions}
                                    </small>
                                  </div>
                                </div>
                              ) : (
                                <span className="text-muted">-</span>
                              )}
                            </td>
                            {/* RS / PS / WS */}
                            {(() => {
                              const m = computeAttendanceMetrics(student.attendance);
                              return (
                                <>
                                  <td>{m.rawScore.toFixed(2)}</td>
                                  <td>{m.percentage.toFixed(2)}%</td>
                                  <td>{m.weighted.toFixed(2)}</td>
                                </>
                              );
                            })()}
                            {gradesData.tasks?.filter(task => 
                              task.type !== 'midterm_exam' && 
                              task.type !== 'final_exam' && 
                              !task.title.toLowerCase().includes('midterm') &&
                              !task.title.toLowerCase().includes('final')
                            ).map(task => {
                              const assignment = student.assignments?.find(a => a.task_id === task.task_id);
                              return (
                                <td key={task.task_id}>
                                  {assignment ? (
                                    <div>
                                      <div className="font-weight-bold">
                                        {assignment.grade}/{assignment.points}
                                      </div>
                                      <small className={`badge badge-${assignment.status === 'graded' ? 'success' : assignment.status === 'submitted' ? 'info' : 'warning'}`}>
                                        {assignment.status}
                                      </small>
                                    </div>
                                  ) : (
                                    <span className="text-muted">-</span>
                                  )}
                                </td>
                              );
                            })}
                            {/* Total Score / RS / PS / WS */}
                            {(() => {
                              const assignmentMetrics = computeAssignmentMetrics(student);
                              return (
                                <>
                                  <td className="font-weight-bold text-primary">{assignmentMetrics.maxPossibleScore}</td>
                                  <td className="font-weight-bold text-success">{assignmentMetrics.rawScore.toFixed(2)}</td>
                                  <td className="font-weight-bold text-info">{assignmentMetrics.percentage.toFixed(2)}%</td>
                                  <td className="font-weight-bold text-warning">{assignmentMetrics.weighted.toFixed(2)}</td>
                                </>
                              );
                            })()}
                            {/* Midterm / PS / WS */}
                            {(() => {
                              const midtermMetrics = computeMidtermMetrics(student);
                              return (
                                <>
                                  <td className={`${midtermMetrics.hasTask ? 'font-weight-bold' : 'text-muted'}`}>
                                    {midtermMetrics.hasTask ? (
                                      midtermMetrics.hasSubmission ? (
                                        <div>
                                          <div>{midtermMetrics.rawScore.toFixed(1)}</div>
                                          <small className="text-muted">
                                            {midtermMetrics.percentage.toFixed(1)}%
                                          </small>
                                        </div>
                                      ) : (
                                        <div>
                                          <div>0</div>
                                          <small className="text-warning">No submission</small>
                                        </div>
                                      )
                                    ) : (
                                      <small className="text-muted">No midterm</small>
                                    )}
                                  </td>
                                  <td className={midtermMetrics.hasTask ? 'text-info' : 'text-muted'}>
                                    {midtermMetrics.hasTask ? `${midtermMetrics.percentage.toFixed(2)}%` : '-'}
                                  </td>
                                  <td className={midtermMetrics.hasTask ? 'text-warning' : 'text-muted'}>
                                    {midtermMetrics.hasTask ? midtermMetrics.weighted.toFixed(2) : '-'}
                                  </td>
                                </>
                              );
                            })()}
                            {/* Final Exam / PS / WS */}
                            {(() => {
                              const finalExamMetrics = computeFinalExamMetrics(student);
                              return (
                                <>
                                  <td className={`${finalExamMetrics.hasTask ? 'font-weight-bold' : 'text-muted'}`}>
                                    {finalExamMetrics.hasTask ? (
                                      finalExamMetrics.hasSubmission ? (
                                        <div>
                                          <div>{finalExamMetrics.rawScore.toFixed(1)}/{finalExamMetrics.maxPossibleScore}</div>
                                          <small className="text-muted">
                                            {finalExamMetrics.percentage.toFixed(1)}%
                                          </small>
                                        </div>
                                      ) : (
                                        <div>
                                          <div>0/{finalExamMetrics.maxPossibleScore}</div>
                                          <small className="text-warning">No submission</small>
                                        </div>
                                      )
                                    ) : (
                                      <small className="text-muted">No final exam</small>
                                    )}
                                  </td>
                                  <td className={finalExamMetrics.hasTask ? 'text-info' : 'text-muted'}>
                                    {finalExamMetrics.hasTask ? `${finalExamMetrics.percentage.toFixed(2)}%` : '-'}
                                  </td>
                                  <td className={finalExamMetrics.hasTask ? 'text-warning' : 'text-muted'}>
                                    {finalExamMetrics.hasTask ? finalExamMetrics.weighted.toFixed(2) : '-'}
                                  </td>
                                </>
                              );
                            })()}
                            {/* Quarterly Grade */}
                            {(() => {
                              const quarterlyGrade = computeQuarterlyGrade(student);
                              return (
                                <>
                                  <td className="font-weight-bold text-success">
                                    {quarterlyGrade.exact.toFixed(2)}
                                  </td>
                                  <td className="font-weight-bold text-success">
                                    {quarterlyGrade.rounded}
                                  </td>
                                </>
                              );
                            })()}
                            <td>
                              <Button color="link" size="sm" className="p-0 mr-2">
                                <i className="ni ni-ruler-pencil"></i>
                              </Button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </Table>
                  </>
                ) : (
                  <div className="text-center py-5">
                    <i className="ni ni-chart-bar-32 text-muted" style={{ fontSize: '4rem' }}></i>
                    <h4 className="mt-3 text-muted">No grades data available</h4>
                  </div>
                )}
              </CardBody>
            </Card>
          </TabPane>
        </TabContent>
      </div>

      {/* Weights Modal for editing grading percentages */}
      <Modal isOpen={showWeightsModal} toggle={() => setShowWeightsModal(false)} size="lg">
        <ModalHeader toggle={() => setShowWeightsModal(false)}>
          <i className="ni ni-settings-gear-65 mr-2"></i>
          Edit Grading Percentages
        </ModalHeader>
        <ModalBody>
          <p className="text-muted">Customize the percentage weights for each category and attendance settings.</p>
          <Form>
            <div className="row">
              <div className="col-md-4">
                <h6 className="mb-3">Exam Settings</h6>
                <FormGroup>
                  <Label for="max_attendance_score">Maximum Attendance Score</Label>
                  <Input 
                    id="max_attendance_score" 
                    type="number" 
                    min="1" 
                    max="50"
                    value={maxAttendanceScore}
                    onChange={(e) => setMaxAttendanceScore(parseInt(e.target.value) || 1)} 
                  />
                  <small className="text-muted">Total number of classes/sessions</small>
                </FormGroup>
                <FormGroup>
                  <Label for="max_midterm_score">Highest Possible Score Midterm</Label>
                  <Input 
                    id="max_midterm_score" 
                    type="number" 
                    min="1" 
                    max="200"
                    value={maxMidtermScore}
                    onChange={(e) => setMaxMidtermScore(parseInt(e.target.value) || 100)} 
                  />
                  <small className="text-muted">Highest possible score for midterm exam (used in PS calculation)</small>
                </FormGroup>
                <FormGroup>
                  <Label for="max_final_exam_score">Highest Possible Score Final</Label>
                  <Input 
                    id="max_final_exam_score" 
                    type="number" 
                    min="1" 
                    max="200"
                    value={maxFinalExamScore}
                    onChange={(e) => setMaxFinalExamScore(parseInt(e.target.value) || 100)} 
                  />
                  <small className="text-muted">Highest possible score for final exam (used in PS calculation)</small>
                </FormGroup>
              </div>

              <div className="col-md-8">
                <h6 className="mb-3">Grading Weights (Total should be 100%)</h6>
                <div className="row">
                  <div className="col-md-6">
                    <FormGroup>
                      <Label for="weights_attendance">Attendance (%)</Label>
                      <Input id="weights_attendance" type="number" min="0" max="100"
                             value={gradingBreakdown.attendance}
                             onChange={(e)=>setGradingBreakdown({...gradingBreakdown, attendance: parseInt(e.target.value)||0})} />
                    </FormGroup>
                  </div>
                  <div className="col-md-6">
                    <FormGroup>
                      <Label for="weights_activity">Activities/Assignment/Quiz (%)</Label>
                      <Input id="weights_activity" type="number" min="0" max="100"
                             value={gradingBreakdown.activity}
                             onChange={(e)=>setGradingBreakdown({...gradingBreakdown, activity: parseInt(e.target.value)||0})} />
                    </FormGroup>
                  </div>
                </div>
                <div className="row">
                  <div className="col-md-6">
                    <FormGroup>
                      <Label for="weights_major_exams">Major Exams (Midterm and Final) (%)</Label>
                      <Input id="weights_major_exams" type="number" min="0" max="100"
                             value={gradingBreakdown.midtermExam + gradingBreakdown.finalExam}
                             onChange={(e)=>{
                               const totalMajorExams = parseInt(e.target.value) || 0;
                               const halfValue = Math.floor(totalMajorExams / 2);
                               const remainder = totalMajorExams % 2;
                               setGradingBreakdown({
                                 ...gradingBreakdown, 
                                 midtermExam: halfValue + remainder, 
                                 finalExam: halfValue
                               });
                             }} />
                      <small className="text-muted">Will be split equally between midterm and final exam</small>
                    </FormGroup>
                  </div>
                </div>
              </div>
            </div>
          </Form>
          
          <div className="mt-3 p-3 bg-light rounded">
            <div className="row">
              <div className="col-md-6">
                <strong>Grading Total: {gradingBreakdown.attendance + gradingBreakdown.activity + gradingBreakdown.assignment + gradingBreakdown.midtermExam + gradingBreakdown.finalExam}%</strong>
                {gradingBreakdown.attendance + gradingBreakdown.activity + gradingBreakdown.assignment + gradingBreakdown.midtermExam + gradingBreakdown.finalExam !== 100 && (
                  <div className="text-warning mt-1">
                    <small>⚠️ Should equal 100%</small>
                  </div>
                )}
              </div>
              <div className="col-md-6">
                <strong>Max Scores:</strong>
                <div className="text-muted mt-1">
                  <small>Attendance: {maxAttendanceScore} pts | Midterm: {maxMidtermScore} pts | Final: {maxFinalExamScore} pts</small>
                </div>
                <div className="text-muted">
                  <small>Present/Excused = 1pt, Late = 0.7pt, Absent = 0pt</small>
                </div>
                <div className="text-muted mt-2">
                  <small><strong>Note:</strong> Midterm and Final Exam scores are now customizable per task. Set the points when creating each exam task.</small>
                </div>
                <div className="text-muted mt-2">
                  <small><strong>Formula:</strong> PS = (Raw Score / Max Possible Score) × 100. Example: (51 / 68) × 100 = 75.00%</small>
                </div>
              </div>
            </div>
          </div>
        </ModalBody>
        <ModalFooter>
          <Button color="secondary" onClick={()=>setShowWeightsModal(false)}>Close</Button>
          <Button color="primary" onClick={()=>setShowWeightsModal(false)}>Save</Button>
        </ModalFooter>
      </Modal>
      {/* Link Modal */}
      <Modal isOpen={showLinkModal} toggle={() => setShowLinkModal(false)} centered>
        <ModalHeader toggle={() => setShowLinkModal(false)}>Attach Link</ModalHeader>
        <ModalBody>
          <Input
            placeholder="https://example.com"
            value={linkInput}
            onChange={(e) => setLinkInput(e.target.value)}
          />
          {linkError && <div style={{ color: '#e74c3c', marginTop: 8, fontSize: 13 }}>{linkError}</div>}
        </ModalBody>
        <ModalFooter>
          <Button color="secondary" onClick={() => setShowLinkModal(false)}>Cancel</Button>
          <Button color="primary" onClick={handleAddLink}>Add</Button>
        </ModalFooter>
      </Modal>

      {/* YouTube Modal */}
      <Modal isOpen={showYouTubeModal} toggle={() => setShowYouTubeModal(false)} centered>
        <ModalHeader toggle={() => setShowYouTubeModal(false)}>Attach YouTube</ModalHeader>
        <ModalBody>
          <Input
            placeholder="Paste YouTube URL"
            value={youtubeInput}
            onChange={(e) => setYouTubeInput(e.target.value)}
          />
        </ModalBody>
        <ModalFooter>
          <Button color="secondary" onClick={() => setShowYouTubeModal(false)}>Cancel</Button>
          <Button color="primary" onClick={handleAddYouTube}>Add</Button>
        </ModalFooter>
      </Modal>

      {/* Google Drive Modal */}
      <Modal isOpen={showDriveModal} toggle={() => setShowDriveModal(false)} centered>
        <ModalHeader toggle={() => setShowDriveModal(false)}>Attach Google Drive</ModalHeader>
        <ModalBody>
          <Input
            placeholder="Paste Google Drive link"
            value={driveInput}
            onChange={(e) => setDriveInput(e.target.value)}
          />
        </ModalBody>
        <ModalFooter>
          <Button color="secondary" onClick={() => setShowDriveModal(false)}>Cancel</Button>
          <Button color="primary" onClick={handleAddDrive}>Add</Button>
        </ModalFooter>
      </Modal>
      {/* Attachment Preview Modal */}
      <Modal
        isOpen={previewModalOpen}
        toggle={() => setPreviewModalOpen(false)}
        centered
        size="xl"
        style={{ maxWidth: '98vw', width: '98vw' }}
        contentClassName="p-0"
      >
        <ModalHeader toggle={() => setPreviewModalOpen(false)}>
          {previewAttachment ? (previewAttachment.name || 'File Preview') : 'Preview'}
        </ModalHeader>
        <ModalBody>
          {previewAttachment && (
            <div>
              {(((previewAttachment.file && previewAttachment.file.type.startsWith('image/')) ||
                 (previewAttachment.url && ['jpg', 'jpeg', 'png', 'gif', 'webp', 'bmp', 'svg'].includes(previewAttachment.name?.split('.').pop()?.toLowerCase())))) ? (
                <img
                  src={previewAttachment.file ? URL.createObjectURL(previewAttachment.file) : previewAttachment.url}
                  alt={previewAttachment.name}
                  style={{ maxWidth: '100%', maxHeight: '500px', objectFit: 'contain' }}
                />
              ) : (((previewAttachment.file && previewAttachment.file.type === 'application/pdf') ||
                 (previewAttachment.url && previewAttachment.name?.toLowerCase().endsWith('.pdf')))) ? (
                <div style={{ width: '100%', height: '600px', border: '1px solid #e9ecef', borderRadius: '8px' }}>
                  <iframe
                    src={previewAttachment.file ? `${URL.createObjectURL(previewAttachment.file)}#toolbar=1&navpanes=1&scrollbar=1` : `${previewAttachment.url}#toolbar=1&navpanes=1&scrollbar=1`}
                    style={{ width: '100%', height: '100%', border: 'none', borderRadius: '8px' }}
                    title={previewAttachment.name}
                  />
                </div>
              ) : (((previewAttachment.file && previewAttachment.file.type.startsWith('video/')) ||
                 (previewAttachment.url && ['mp4', 'avi', 'mov', 'wmv', 'flv', 'webm'].includes(previewAttachment.name?.split('.').pop()?.toLowerCase())))) ? (
                <video
                  controls
                  style={{ width: '100%', maxHeight: '600px', borderRadius: '8px' }}
                >
                  <source
                    src={previewAttachment.file ? URL.createObjectURL(previewAttachment.file) : previewAttachment.url}
                    type={
                      previewAttachment.file?.type ||
                      (previewAttachment.name?.toLowerCase().endsWith('.mp4') ? 'video/mp4' :
                       previewAttachment.name?.toLowerCase().endsWith('.avi') ? 'video/x-msvideo' :
                       previewAttachment.name?.toLowerCase().endsWith('.mov') ? 'video/quicktime' :
                       previewAttachment.name?.toLowerCase().endsWith('.wmv') ? 'video/x-ms-wmv' :
                       previewAttachment.name?.toLowerCase().endsWith('.flv') ? 'video/x-flv' :
                       previewAttachment.name?.toLowerCase().endsWith('.webm') ? 'video/webm' :
                       'video/mp4')
                    }
                  />
                  Your browser does not support the video tag.
                </video>
              ) : (((previewAttachment.file && previewAttachment.file.type.startsWith('audio/')) ||
                 (previewAttachment.url && ['mp3', 'wav', 'ogg', 'aac', 'flac'].includes(previewAttachment.name?.split('.').pop()?.toLowerCase())))) ? (
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
              ) : previewAttachment.file && previewAttachment.file.type === 'application/pdf' ? (
                <div style={{ width: '100%', height: '600px', border: '1px solid #e9ecef', borderRadius: '8px' }}>
                  <iframe
                    src={`${URL.createObjectURL(previewAttachment.file)}#toolbar=1&navpanes=1&scrollbar=1`}
                    style={{ width: '100%', height: '100%', border: 'none', borderRadius: '8px' }}
                    title={previewAttachment.name}
                  />
                </div>
              ) : previewText ? (
                <div style={{ 
                  background: '#f8f9fa', 
                  padding: '20px', 
                  borderRadius: '8px', 
                  fontFamily: 'monospace', 
                  fontSize: '14px', 
                  whiteSpace: 'pre-wrap',
                  maxHeight: '500px',
                  overflowY: 'auto'
                }}>
                  {previewText}
                </div>
              ) : previewAttachment.file && isMicrosoftFile(previewAttachment.file.name) ? (
                <div style={{ textAlign: 'center', padding: '40px' }}>
                  <div style={{ marginBottom: '20px' }}>
                    <i className="ni ni-single-copy-04" style={{ fontSize: '48px', color: '#007bff', marginBottom: '16px' }} />
                    <h5 style={{ color: '#333', marginBottom: '8px' }}>Microsoft Office File</h5>
                    <p style={{ color: '#666', marginBottom: '20px' }}>
                      {getMicrosoftFileType(previewAttachment.file.name)} files can be previewed using Microsoft Office Online or downloaded to view locally.
                    </p>
                  </div>
                  <div style={{ display: 'flex', gap: '12px', justifyContent: 'center', flexWrap: 'wrap' }}>
                    <Button 
                      color="primary" 
                      onClick={() => openMicrosoftOnline(previewAttachment.file)}
                      style={{ borderRadius: '8px' }}
                    >
                      <i className="ni ni-world-2" style={{ marginRight: '6px' }} />
                      Open in Office Online
                          </Button>
                    <Button 
                      color="secondary" 
                      onClick={() => {
                        const url = URL.createObjectURL(previewAttachment.file);
                        const a = document.createElement('a');
                        a.href = url;
                        a.download = previewAttachment.name;
                        a.click();
                        URL.revokeObjectURL(url);
                      }}
                      style={{ borderRadius: '8px' }}
                    >
                      <i className="ni ni-single-copy-04" style={{ marginRight: '6px' }} />
                      Download File
                  </Button>
                </div>
              </div>
                            ) : (
                <div style={{ textAlign: 'center', padding: '40px' }}>
                  <i className="ni ni-single-copy-04" style={{ fontSize: '48px', color: '#ccc', marginBottom: '16px' }} />
                  <p style={{ color: '#666' }}>Preview not available for this file type.</p>
                  <Button 
                    color="primary" 
                    onClick={() => {
                      if (previewAttachment.file) {
                        const url = URL.createObjectURL(previewAttachment.file);
                        const a = document.createElement('a');
                        a.href = url;
                        a.download = previewAttachment.name;
                        a.click();
                        URL.revokeObjectURL(url);
                      } else if (previewAttachment.url) {
                        const a = document.createElement('a');
                        a.href = previewAttachment.url;
                        a.download = previewAttachment.name;
                        a.click();
                      }
                    }}
                  >
                    Download File
                  </Button>
                </div>
              )}
                                </div>
          )}
        </ModalBody>
      </Modal>
      {/* Camera Modal */}
      <Modal isOpen={showCameraModal} toggle={() => { setShowCameraModal(false); stopCamera(); }} centered size="lg" contentClassName="border-0">
        <div style={{ borderRadius: 20, background: '#fff', padding: 0, boxShadow: '0 8px 32px rgba(44,62,80,.12)' }}>
          <ModalHeader toggle={() => { setShowCameraModal(false); stopCamera(); }} style={{ border: 'none', paddingBottom: 0, fontWeight: 700, fontSize: 18, background: 'transparent' }}>
            Camera Capture
          </ModalHeader>
          <ModalBody style={{ padding: 24 }}>
            <div style={{ marginBottom: 16 }}>
              <div style={{ display: 'flex', gap: 8, marginBottom: 16 }}>
                <Button 
                  color={cameraMode === 'photo' ? 'primary' : 'secondary'} 
                  size="sm"
                  onClick={() => setCameraMode('photo')}
                  style={{ borderRadius: 8, fontWeight: 600 }}
                >
                  <i className="ni ni-camera-compact mr-1" /> Photo
                </Button>
                <Button 
                  color={cameraMode === 'video' ? 'primary' : 'secondary'} 
                  size="sm"
                  onClick={() => setCameraMode('video')}
                  style={{ borderRadius: 8, fontWeight: 600 }}
                >
                  <i className="ni ni-video-camera-2 mr-1" /> Video
                </Button>
                <Button
                  color="info"
                  size="sm"
                  onClick={() => setFacingMode(facingMode === 'user' ? 'environment' : 'user')}
                  style={{ borderRadius: 8, fontWeight: 600 }}
                >
                  Switch Camera
                </Button>
                              </div>
              {cameraError && (
                <div style={{ color: 'red', marginBottom: 8, fontWeight: 600 }}>{cameraError}</div>
              )}
              <div style={{ position: 'relative', width: '100%', height: 400, background: '#000', borderRadius: 12, overflow: 'hidden', marginBottom: 16 }}>
                {!cameraStream ? (
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', color: '#fff' }}>
                    <div style={{ textAlign: 'center' }}>
                      <i className="ni ni-camera-compact" style={{ fontSize: 48, marginBottom: 16 }} />
                      <div>Camera not started</div>
                      <div style={{ fontSize: 12, marginTop: 8, color: '#ccc' }}>
                        Click "Start Camera" to begin
                            </div>
                          </div>
                  </div>
                ) : (
                  <>
                    <video
                      ref={videoRef}
                      autoPlay
                      playsInline
                      muted
                      style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                      onLoadedData={() => console.log('Video data loaded')}
                      onCanPlay={() => console.log('Video can play')}
                      onError={(e) => console.error('Video element error:', e)}
                    />
                    <canvas ref={canvasRef} style={{ display: 'none' }} />
                  </>
                )}
                
                {capturedImage && (
                  <div style={{ position: 'absolute', top: 16, right: 16, background: '#fff', borderRadius: 8, padding: 8, boxShadow: '0 4px 12px rgba(0,0,0,0.3)' }}>
                    <img 
                      src={URL.createObjectURL(capturedImage)} 
                      alt="Captured" 
                      style={{ width: 80, height: 60, objectFit: 'cover', borderRadius: 4 }} 
                    />
                  </div>
                )}
                
                {recordedVideo && (
                  <div style={{ position: 'absolute', top: 16, right: 16, background: '#fff', borderRadius: 8, padding: 8, boxShadow: '0 4px 12px rgba(0,0,0,0.3)' }}>
                    <video 
                      src={URL.createObjectURL(recordedVideo)} 
                      style={{ width: 80, height: 60, objectFit: 'cover', borderRadius: 4 }} 
                      controls
                    />
                  </div>
                )}
              </div>
              
              <div style={{ display: 'flex', gap: 12, justifyContent: 'center' }}>
                {!cameraStream ? (
                  <Button color="primary" onClick={startCamera} style={{ borderRadius: 8, fontWeight: 600 }}>
                    <i className="ni ni-camera-compact mr-2" /> Start Camera
                  </Button>
                ) : (
                  <>
                    {cameraMode === 'photo' ? (
                      <Button color="success" onClick={capturePhoto} style={{ borderRadius: 8, fontWeight: 600 }}>
                        <i className="ni ni-camera-compact mr-2" /> Capture Photo
                      </Button>
                    ) : (
                      <>
                        {!isRecording ? (
                          <Button color="danger" onClick={startRecording} style={{ borderRadius: 8, fontWeight: 600 }}>
                            <i className="ni ni-video-camera-2 mr-2" /> Start Recording
                          </Button>
                        ) : (
                          <Button color="warning" onClick={stopRecording} style={{ borderRadius: 8, fontWeight: 600 }}>
                            <i className="ni ni-button-pause mr-2" /> Stop Recording
                          </Button>
                        )}
                      </>
                    )}
                    
                    {(capturedImage || recordedVideo) && (
                      <Button color="primary" onClick={useCapturedMedia} style={{ borderRadius: 8, fontWeight: 600 }}>
                        <i className="ni ni-check-bold mr-2" /> Use {cameraMode === 'photo' ? 'Photo' : 'Video'}
                      </Button>
                    )}
                    
                    <Button color="secondary" onClick={stopCamera} style={{ borderRadius: 8, fontWeight: 600 }}>
                      <i className="ni ni-button-power mr-2" /> Stop Camera
                    </Button>
                  </>
                )}
              </div>
            </div>
          </ModalBody>
        </div>
              </Modal>

        {/* Add Users Modal */}
        <Modal isOpen={showCreateStudentSelectModal} toggle={() => setShowCreateStudentSelectModal(false)} centered size="lg">
          <ModalHeader toggle={() => setShowCreateStudentSelectModal(false)}>
            <div style={{ fontWeight: 600, fontSize: 18, color: '#333' }}>Add Students to Task</div>
          </ModalHeader>
          <ModalBody>
            <div style={{ marginBottom: 16 }}>
              <Input
                type="text"
                placeholder="Search students..."
                value={userSearch}
                style={{
                  borderRadius: 8,
                  border: '1px solid #e9ecef',
                  padding: '12px 16px',
                  fontSize: 14,
                  background: '#fff'
                }}
                onChange={(e) => setUserSearch(e.target.value)}
              />
            </div>
            

            <div style={{ marginBottom: 16 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                <span style={{ fontWeight: 600, fontSize: 14, color: '#333' }}>
                  Students ({taskAssignedStudents.length}) - Total: {availableUsers.length}
                </span>
                {(() => {
                  const filtered = availableUsers.filter(u => (!userSearch || u.name.toLowerCase().includes(userSearch.toLowerCase())));
                  const allSelected = filtered.length > 0 && filtered.every(u => taskAssignedStudents.includes(u.id));
                  return (
                <button
                  type="button"
                  style={{
                    background: 'none',
                    border: 'none',
                    color: '#5E72E4',
                    fontSize: 14,
                    fontWeight: 600,
                    cursor: 'pointer',
                    textDecoration: 'underline'
                  }}
                  onClick={() => {
                        if (allSelected) {
                          // Deselect all filtered students
                          const filteredIds = filtered.map(u => u.id);
                          setTaskAssignedStudents(prev => prev.filter(id => !filteredIds.includes(id)));
                    } else {
                          // Select all filtered students
                          const filteredIds = filtered.map(u => u.id);
                          setTaskAssignedStudents(prev => [...new Set([...prev, ...filteredIds])]);
                    }
                  }}
                >
                      {allSelected ? 'Deselect All' : 'Select All'}
                </button>
                  );
                })()}
              </div>
              
              <div style={{ 
                maxHeight: 300, 
                overflowY: 'auto', 
                border: '1px solid #e9ecef', 
                borderRadius: 8,
                background: '#fff'
              }}>
                {loadingUsers ? (
                  <div className="text-center text-muted py-5">Loading students...</div>
                ) : availableUsers.length === 0 ? (
                  <div className="text-center text-muted py-5">
                    No students available to add to this task
                  </div>
                ) : availableUsers.filter(u => (!userSearch || u.name.toLowerCase().includes(userSearch.toLowerCase()))).length === 0 ? (
                  <div className="text-center text-muted py-5">No students match your search</div>
                ) : (
                  availableUsers.filter(u => (!userSearch || u.name.toLowerCase().includes(userSearch.toLowerCase()))).map((student) => (
                  <div
                    key={student.id}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      padding: '12px 16px',
                      borderBottom: '1px solid #f8f9fa',
                      cursor: 'pointer',
                      transition: 'background 0.2s'
                    }}
                    onClick={() => {
                      if (taskAssignedStudents.includes(student.id)) {
                        setTaskAssignedStudents(prev => prev.filter(id => id !== student.id));
                      } else {
                        setTaskAssignedStudents(prev => [...prev, student.id]);
                      }
                    }}
                    onMouseOver={e => e.currentTarget.style.background = '#f8f9fa'}
                    onMouseOut={e => e.currentTarget.style.background = '#fff'}
                  >
                    {(() => {
                      const avatarUrl = getProfilePictureUrl(student);
                      const bgColor = getAvatarColor(student);
                      const initials = getUserInitials(student);
                      return (
                        <div style={{ 
                          width: 32, 
                          height: 32, 
                          borderRadius: '50%', 
                          background: avatarUrl ? '#e9ecef' : bgColor,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          color: '#fff',
                          fontWeight: 600,
                          fontSize: 14,
                          marginRight: 12,
                          overflow: 'hidden'
                        }}>
                          {avatarUrl ? (
                            <img
                              src={avatarUrl}
                              alt={student.name}
                              style={{
                                width: '100%',
                                height: '100%',
                                objectFit: 'cover'
                              }}
                              onError={(e) => {
                                e.target.style.display = 'none';
                                if (e.target.nextSibling) e.target.nextSibling.style.display = 'flex';
                              }}
                            />
                          ) : null}
                          <span style={{
                            display: avatarUrl ? 'none' : 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            width: '100%',
                            height: '100%'
                          }}>
                            {initials}
                          </span>
                        </div>
                      );
                    })()}
                    <div style={{ flex: 1 }}>
                      <div style={{ fontWeight: 600, fontSize: 14, color: '#333' }}>
                        {student.name}
                      </div>
                      <div style={{ fontSize: 12, color: '#666' }}>
                        {student.email}
                      </div>
                    </div>
                    <input
                      type="checkbox"
                      checked={taskAssignedStudents.includes(student.id)}
                      onChange={() => {}} // Handled by onClick
                      style={{
                        width: 18,
                        height: 18,
                        cursor: 'pointer'
                      }}
                    />
                  </div>
                  ))
                )}
              </div>
            </div>
            
            <div style={{ 
              background: '#f8f9fa', 
              padding: '16px', 
              borderRadius: 8,
              border: '1px solid #e9ecef'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
                <div style={{ 
                  width: 24, 
                  height: 24, 
                  borderRadius: '50%', 
                  background: '#ddd',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: 12,
                  color: '#666'
                }}>
                  <i className="fa fa-user-plus" />
                </div>
                <span style={{ fontSize: 14, color: '#666' }}>
                  {taskAssignedStudents.length === 0 
                    ? 'No students selected' 
                    : `${taskAssignedStudents.length} student${taskAssignedStudents.length !== 1 ? 's' : ''} selected`
                  }
                </span>
              </div>
            </div>
          </ModalBody>
          <ModalFooter>
            <Button
              color="secondary"
              onClick={() => setShowCreateStudentSelectModal(false)}
              style={{ borderRadius: 8, fontWeight: 600 }}
            >
              Cancel
            </Button>
            <Button
              color="primary"
              onClick={() => {
                // Save selected students to task form
                setTaskForm(prev => ({
                  ...prev,
                  assignedStudents: taskAssignedStudents
                }));
                setShowCreateStudentSelectModal(false);
              }}
              style={{ 
                borderRadius: 8, 
                fontWeight: 600,
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                border: 'none'
              }}
            >
              Confirm
            </Button>
          </ModalFooter>
        </Modal>

        {/* Add Users Modal */}
        {showAddUsersModal && (
          <div style={{ position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', background: 'rgba(0,0,0,0.15)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <div style={{ background: '#fff', borderRadius: 20, boxShadow: '0 8px 32px rgba(44,62,80,.12)', minWidth: 400, maxWidth: 600, width: '90%', padding: 0 }}>
              <div style={{ borderRadius: 20, background: '#fff', padding: 0 }}>
                <div style={{ border: 'none', padding: '24px 24px 0 24px', fontWeight: 700, fontSize: 18, background: 'transparent', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <span>Add Students</span>
                  <button onClick={() => setShowAddUsersModal(false)} style={{ background: 'none', border: 'none', fontSize: 22, color: '#888', cursor: 'pointer' }}>&times;</button>
                </div>
                <div style={{ padding: '0 24px 24px 24px' }}>

                  <div style={{ position: 'relative', width: '100%', marginBottom: 18 }}>
                    <i className="fa fa-search" style={{ position: 'absolute', left: 16, top: '50%', transform: 'translateY(-50%)', color: '#b0b7c3', fontSize: 16, pointerEvents: 'none' }} />
                    <input
                      placeholder="Search students..."
                      value={userSearch}
                      onChange={e => setUserSearch(e.target.value)}
                      style={{ background: '#f7f8fa', borderRadius: 8, border: '1px solid #e9ecef', fontSize: 15, color: '#232b3b', padding: '8px 14px 8px 40px', boxShadow: '0 1px 2px rgba(44,62,80,0.03)', minWidth: 0, width: '100%' }}
                    />
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
                    <span style={{ fontWeight: 600, color: '#222', fontSize: 12 }}>
                      Students ({selectedUsers.length}) - Total: {availableUsers.length}
                    </span>
                    {(() => {
                      const filtered = availableUsers.filter(u => (!userSearch || u.name.toLowerCase().includes(userSearch.toLowerCase())));
                      const allSelected = filtered.length > 0 && filtered.every(u => selectedUsers.includes(u.id));
                      return (
                        <button
                          type="button"
                          style={{ background: 'none', border: 'none', color: '#5e72e4', fontWeight: 500, fontSize: 12, cursor: 'pointer', padding: '1px 6px', margin: 0 }}
                          onClick={() => {
                            if (allSelected) {
                              setSelectedUsers(prev => prev.filter(id => !filtered.map(u => u.id).includes(id)));
                            } else {
                              setSelectedUsers(prev => Array.from(new Set([...prev, ...filtered.map(u => u.id)])));
                            }
                          }}
                        >
                          {allSelected ? 'Unselect All' : 'Select All'}
                        </button>
                      );
                    })()}
                  </div>
                  <div style={{ maxHeight: 220, overflowY: 'auto', border: 'none', borderRadius: 12, background: '#f9fafd', padding: '0 8px 0 0', marginBottom: 8 }}>
                    {loadingUsers ? (
                      <div className="text-center text-muted py-5">Loading class members...</div>
                    ) : availableUsers.length === 0 ? (
                      <div className="text-center text-muted py-5">
                        No students available to add to this classroom
                      </div>
                    ) : availableUsers.filter(u => (!userSearch || u.name.toLowerCase().includes(userSearch.toLowerCase()))).length === 0 ? (
                      <div className="text-center text-muted py-5">No students match your search</div>
                    ) : (
                      availableUsers.filter(u => (!userSearch || u.name.toLowerCase().includes(userSearch.toLowerCase()))).map((u) => {
                        const isSelected = selectedUsers.includes(u.id);
                        return (
                          <div
                            key={u.id}
                            style={{ display: 'flex', alignItems: 'center', padding: '6px 10px', borderRadius: 8, marginBottom: 2, cursor: 'pointer', background: isSelected ? '#eaf4fb' : 'transparent' }}
                            onClick={e => {
                              if (e.target.type === 'checkbox') return;
                              if (isSelected) {
                                setSelectedUsers(prev => prev.filter(id => id !== u.id));
                              } else {
                                setSelectedUsers(prev => [...prev, u.id]);
                              }
                            }}
                          >
                            {(() => {
                              const avatarUrl = getProfilePictureUrl(u);
                              const bgColor = getAvatarColor(u);
                              const initials = getUserInitials(u);
                              return (
                                <div style={{ 
                                  width: 28, 
                                  height: 28, 
                                  borderRadius: '50%', 
                                  marginRight: 10, 
                                  overflow: 'hidden', 
                                  display: 'flex', 
                                  alignItems: 'center', 
                                  justifyContent: 'center', 
                                  background: avatarUrl ? '#e9ecef' : bgColor, 
                                  color: '#fff', 
                                  fontWeight: 700, 
                                  border: '1px solid #e9ecef' 
                                }}>
                                  {avatarUrl ? (
                                    <img
                                      src={avatarUrl}
                                      alt={u.name}
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
                              <div style={{ fontWeight: 600, fontSize: 14, color: '#2d3748', textTransform: 'none' }}>{u.name}</div>
                              <div style={{ fontSize: 12, color: '#7b8a9b', fontWeight: 400 }}>
                                {u.email || ''} {u.role === 'teacher' && <span style={{ color: '#6366f1', fontWeight: 600 }}>(Teacher)</span>}
                              </div>
                            </div>
                            <input
                              type="checkbox"
                              checked={isSelected}
                              onChange={e => {
                                if (e.target.checked) {
                                  setSelectedUsers(prev => [...prev, u.id]);
                                } else {
                                  setSelectedUsers(prev => prev.filter(id => id !== u.id));
                                }
                              }}
                              style={{ marginLeft: 10, cursor: 'pointer' }}
                              aria-label={`Select ${u.name}`}
                              onClick={e => e.stopPropagation()}
                            />
                          </div>
                        );
                      })
                    )}
                  </div>
                  {/* Selected users pills in modal */}
                  <div style={{ minHeight: 50, display: 'grid', gridTemplateColumns: 'repeat(3, minmax(0, 1fr))', gap: 8, alignItems: selectedUsers.length === 0 ? 'center' : 'flex-start', justifyContent: 'center', background: '#f7f8fa', borderRadius: 8, padding: 8, border: '1px solid #e9ecef', marginTop: 12 }}>
                    {selectedUsers.length === 0 ? (
                      <div style={{ width: '100%', height: 50, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', color: '#b0b7c3', fontSize: 11, minHeight: 30, textAlign: 'center', gridColumn: '1 / -1', margin: '0 auto' }}>
                        <i className="fa fa-user-plus" style={{ marginBottom: 2 }} />
                        <div style={{ fontSize: 11, fontWeight: 500 }}>No students selected</div>
                      </div>
                    ) : (
                      selectedUsers.map(id => {
                        const u = availableUsers.find(user => user.id === id);
                        return u ? (
                          <span key={id} style={{ display: 'flex', alignItems: 'center', background: '#e9ecef', borderRadius: 10, padding: '4px 8px', fontSize: 10, fontWeight: 600, color: '#2d3748', minHeight: 28 }}>
                            {(() => {
                              const avatarUrl = getProfilePictureUrl(u);
                              const bgColor = getAvatarColor(u);
                              const initials = getUserInitials(u);
                              return (
                                <div style={{ width: 20, height: 20, borderRadius: '50%', marginRight: 6, overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center', background: avatarUrl ? '#e9ecef' : bgColor, color: '#fff', fontWeight: 700, border: '1px solid #fff', fontSize: 9, flexShrink: 0 }}>
                                  {avatarUrl ? (
                                    <img
                                      src={avatarUrl}
                                      alt={u.name}
                                      style={{ width: 20, height: 20, borderRadius: '50%', objectFit: 'cover', display: 'block' }}
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
                              <span style={{ fontWeight: 600, fontSize: 10, color: '#2d3748', textTransform: 'none' }}>{u.name}</span>
                              <span style={{ color: '#7b8a9b', fontWeight: 400, fontSize: 9 }}>
                                {u.email || ''} {u.role === 'teacher' && <span style={{ color: '#6366f1', fontWeight: 600, fontSize: 8 }}>(Teacher)</span>}
                              </span>
                            </span>
                            <span style={{ flex: 1 }} />
                            <i
                              className="fa fa-times-circle"
                              style={{ marginLeft: 2, cursor: 'pointer', color: '#7b8a9b', fontSize: 11 }}
                              onClick={e => { e.stopPropagation(); setSelectedUsers(prev => prev.filter(id => id !== id)); }}
                            />
                          </span>
                        ) : null;
                      })
                    )}
                  </div>
                </div>
                <div style={{ padding: '0 24px 24px 24px', display: 'flex', gap: 12, justifyContent: 'flex-end' }}>
                  <button
                    onClick={() => setShowAddUsersModal(false)}
                    style={{ background: '#f7fafd', color: '#222', border: 'none', borderRadius: 8, padding: '10px 24px', fontWeight: 500, cursor: 'pointer' }}
                  >
                    Cancel
                  </button>
                  <button
                    onClick={() => {
                      // Handle selected students - you can customize this based on your needs
                      console.log('Selected students:', selectedUsers);
                      setShowAddUsersModal(false);
                    }}
                    style={{ background: '#6366f1', color: '#fff', border: 'none', borderRadius: 8, padding: '10px 24px', fontWeight: 600, cursor: 'pointer' }}
                  >
                    Confirm
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Task Options Modal */}
        <Modal isOpen={showTaskOptionsModal} toggle={() => setShowTaskOptionsModal(false)} centered>
          <ModalHeader toggle={() => setShowTaskOptionsModal(false)}>
            Task Options
          </ModalHeader>
          <ModalBody>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              <button
                type="button"
                className="btn btn-light"
                style={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  gap: 12, 
                  padding: '12px 16px', 
                  borderRadius: 8,
                  border: '1px solid #e9ecef',
                  background: '#fff',
                  color: '#333',
                  fontSize: 14,
                  fontWeight: 600,
                  cursor: 'pointer',
                  transition: 'background 0.2s'
                }}
                onClick={() => {
                  handleSaveTaskDraft();
                  setShowTaskOptionsModal(false);
                }}
                onMouseOver={e => e.currentTarget.style.background = '#f8f9fa'}
                onMouseOut={e => e.currentTarget.style.background = '#fff'}
              >
                <FaRegFileAlt style={{ fontSize: 16, color: '#666' }} />
                Save Draft
              </button>
              <button
                type="button"
                className="btn btn-light"
                style={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  gap: 12, 
                  padding: '12px 16px', 
                  borderRadius: 8,
                  border: '1px solid #e9ecef',
                  background: '#fff',
                  color: '#333',
                  fontSize: 14,
                  fontWeight: 600,
                  cursor: 'pointer',
                  transition: 'background 0.2s'
                }}
                onClick={() => {
                  setShowTaskScheduleModal(true);
                  setShowTaskOptionsModal(false);
                }}
                onMouseOver={e => e.currentTarget.style.background = '#f8f9fa'}
                onMouseOut={e => e.currentTarget.style.background = '#fff'}
              >
                <FaRegCalendarAlt style={{ fontSize: 16, color: '#666' }} />
                Schedule Task
              </button>
            </div>
          </ModalBody>
      </Modal>

      {/* Edit Task Modal */}
      <Modal isOpen={showEditTaskModal} toggle={() => setShowEditTaskModal(false)} size="lg" centered>
        <ModalHeader toggle={() => setShowEditTaskModal(false)} style={{ fontWeight: 700, fontSize: 20 }}>
          Edit Task
        </ModalHeader>
        <ModalBody style={{ padding: '24px' }}>
          <Form onSubmit={handleUpdateTask}>
            <div className="d-flex flex-wrap" style={{ gap: 16, marginBottom: 16, width: '100%' }}>
              <div style={{ flex: 1, minWidth: 200 }}>
                <label style={{ fontWeight: 600, fontSize: 14, color: '#222' }}>Post to Classrooms</label>
                <Select
                  isMulti
                  options={[
                    { value: 'current', label: currentClassroom.name || currentClassroom.title || 'Current Classroom', avatar: currentClassroom.avatar || null, code: code, isDisabled: true },
                    ...classrooms.map(cls => ({
                      value: cls.code,
                      label: cls.name || cls.title || 'Untitled',
                      avatar: cls.avatar || null,
                      code: cls.code,
                      isDisabled: false
                    }))
                  ]}
                  value={editTaskForm.postToClassrooms ? editTaskForm.postToClassrooms.map(code => {
                    if (code === 'current') {
                      return { value: 'current', label: currentClassroom.name || currentClassroom.title || 'Current Classroom', avatar: currentClassroom.avatar || null, code: code, isDisabled: true };
                    }
                    const classroom = classrooms.find(cls => cls.code === code);
                    return {
                      value: classroom?.code,
                      label: classroom?.name || classroom?.title || 'Untitled',
                      avatar: classroom?.avatar || null,
                      code: classroom?.code,
                      isDisabled: false
                    };
                  }) : []}
                  onChange={(selectedOptions) => {
                    const values = selectedOptions ? selectedOptions.map(option => option.value) : [];
                    setEditTaskForm(prev => ({ ...prev, postToClassrooms: values }));
                  }}
                  styles={{
                    control: (provided) => ({
                      ...provided,
                      borderRadius: 8,
                      fontSize: 14,
                      background: '#f8fafc',
                      border: '1px solid #bfcfff',
                      minHeight: 40
                    }),
                    option: (provided, state) => ({
                      ...provided,
                      background: state.isSelected ? '#324cdd' : state.isFocused ? '#e3eafe' : '#fff',
                      color: state.isSelected ? '#fff' : '#333',
                      padding: '8px 12px'
                    })
                  }}
                  placeholder="Select classrooms..."
                />
              </div>
            </div>
            
            <div className="d-flex flex-wrap" style={{ gap: 16, marginBottom: 16, width: '100%' }}>
              <div style={{ flex: 1, minWidth: 200 }}>
                <label style={{ fontWeight: 600, fontSize: 14, color: '#222' }}>Task Type *</label>
                <select
                  name="type"
                  value={editTaskForm.type}
                  onChange={handleEditTaskFormChange}
                  className="form-control"
                  style={{ borderRadius: 8, fontSize: 14, background: '#f8fafc', border: '1px solid #bfcfff' }}
                  required
                >
                  <option value="Assignment">Assignment</option>
                  <option value="Quiz">Quiz</option>
                  <option value="Activity">Activity</option>
                  <option value="Project">Project</option>
                  <option value="Exam">Exam</option>
                  <option value="Midterm Exam">Midterm Exam</option>
                  <option value="Final Exam">Final Exam</option>
                </select>
                {editTaskForm.submitted && !editTaskForm.type && (
                  <small className="text-danger" style={{ fontSize: 12, marginTop: 4 }}>Task type is required.</small>
                )}
              </div>
              <div style={{ flex: 1, minWidth: 200 }}>
                <label style={{ fontWeight: 600, fontSize: 14, color: '#222' }}>Title *</label>
                <input
                  name="title"
                  type="text"
                  value={editTaskForm.title}
                  onChange={handleEditTaskFormChange}
                  className="form-control"
                  style={{ borderRadius: 8, fontSize: 14, background: '#f8fafc', border: '1px solid #bfcfff' }}
                  placeholder="Enter task title..."
                  required
                />
                {editTaskForm.submitted && !editTaskForm.title && (
                  <small className="text-danger" style={{ fontSize: 12, marginTop: 4 }}>Title is required.</small>
                )}
              </div>
            </div>
            
            <div className="d-flex flex-wrap" style={{ gap: 16, marginBottom: 16, width: '100%' }}>
              <div style={{ flex: 1, minWidth: 120, maxWidth: 150 }}>
                <label style={{ fontWeight: 600, fontSize: 14, color: '#222' }}>Points *</label>
                <input
                  name="points"
                  type="number"
                  min="1"
                  value={editTaskForm.points}
                  onChange={handleEditTaskFormChange}
                  className="form-control"
                  style={{ borderRadius: 8, fontSize: 14, background: '#f8fafc', border: '1px solid #bfcfff' }}
                  placeholder="Enter points..."
                  required
                />
                {editTaskForm.submitted && !editTaskForm.points && (
                  <small className="text-danger" style={{ fontSize: 12, marginTop: 4 }}>Points are required.</small>
                )}
              </div>
              <div style={{ flex: 1, minWidth: 200 }}>
                <label style={{ fontWeight: 600, fontSize: 14, color: '#222' }}>Due Date</label>
                <input
                  name="dueDate"
                  type="datetime-local"
                  value={editTaskForm.dueDate}
                  onChange={handleEditTaskFormChange}
                  className="form-control"
                  style={{ borderRadius: 8, fontSize: 14, background: '#f8fafc', border: '1px solid #bfcfff' }}
                />
              </div>
            </div>
            
            <div style={{ marginBottom: 16 }}>
              <label style={{ fontWeight: 600, fontSize: 14, color: '#222' }}>Instructions *</label>
              <textarea
                name="text"
                value={editTaskForm.text}
                onChange={handleEditTaskFormChange}
                className="form-control"
                style={{ 
                  borderRadius: 8, 
                  fontSize: 14, 
                  background: '#f8fafc', 
                  border: '1px solid #bfcfff',
                  minHeight: 120,
                  resize: 'vertical'
                }}
                placeholder="Enter task instructions..."
                required
              />
              {editTaskForm.submitted && !editTaskForm.text && (
                <small className="text-danger" style={{ fontSize: 12, marginTop: 4 }}>Instructions are required.</small>
              )}
            </div>
            
            <div style={{ marginBottom: 16 }}>
              <label style={{ fontWeight: 600, fontSize: 14, color: '#222' }}>Attachments</label>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 8 }}>
                <input
                  type="file"
                  onChange={handleEditTaskFileChange}
                  style={{ display: 'none' }}
                  id="edit-task-file-input"
                  multiple
                />
                <label
                  htmlFor="edit-task-file-input"
                  className="btn btn-outline-primary"
                  style={{ 
                    borderRadius: 8, 
                    fontSize: 14, 
                    fontWeight: 600,
                    cursor: 'pointer',
                    margin: 0
                  }}
                >
                  <i className="ni ni-cloud-upload-96" style={{ marginRight: 8 }} />
                  Choose Files
                </label>
                <span style={{ fontSize: 12, color: '#666' }}>
                  {editTaskAttachments.length} file(s) selected
                </span>
              </div>
              {editTaskAttachments.length > 0 && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                  {editTaskAttachments.map((attachment, index) => (
                    <div key={index} style={{ 
                      display: 'flex', 
                      alignItems: 'center', 
                      gap: 8, 
                      padding: '8px 12px',
                      background: '#f8fafc',
                      borderRadius: 6,
                      border: '1px solid #e9ecef'
                    }}>
                      <i className="ni ni-single-copy-04" style={{ color: '#666' }} />
                      <span style={{ fontSize: 14, flex: 1 }}>{attachment.name}</span>
                      <button
                        type="button"
                        onClick={() => handleRemoveEditTaskAttachment(index)}
                        style={{ 
                          background: 'none', 
                          border: 'none', 
                          color: '#dc3545', 
                          cursor: 'pointer',
                          padding: '4px 8px'
                        }}
                      >
                        <i className="ni ni-fat-remove" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
            

          </Form>
        </ModalBody>
        <ModalFooter>
          <Button
            color="secondary"
            onClick={handleCancelEditTask}
            style={{ 
              borderRadius: 8, 
              fontWeight: 600,
              border: '1px solid #e9ecef'
            }}
          >
            Cancel
          </Button>
          <Button
            color="primary"
            onClick={handleUpdateTask}
            style={{ 
              borderRadius: 8, 
              fontWeight: 600,
              background: 'linear-gradient(135deg, #667eea 0%, #324cdd 100%)',
              border: 'none'
            }}
          >
            Update Task
          </Button>
        </ModalFooter>
      </Modal>

      {/* Task Schedule Modal */}
      <Modal isOpen={showTaskScheduleModal} toggle={() => setShowTaskScheduleModal(false)} centered>
        <ModalHeader toggle={() => setShowTaskScheduleModal(false)} style={{ fontWeight: 700, fontSize: 20 }}>
          <i className="ni ni-time-alarm" style={{ marginRight: 8, color: '#f39c12' }} />
          Schedule Task
        </ModalHeader>
        <ModalBody style={{ padding: '24px' }}>
          <div style={{ marginBottom: 20 }}>
            <p style={{ color: '#666', fontSize: 14, marginBottom: 16 }}>
              Choose when you want this task to be published automatically.
            </p>
            
            <div className="row">
              <div className="col-md-6">
                <label style={{ fontWeight: 600, fontSize: 14, color: '#222', marginBottom: 8, display: 'block' }}>
                  Schedule Date *
                </label>
                <input
                  type="date"
                  value={taskScheduleDate}
                  onChange={(e) => setTaskScheduleDate(e.target.value)}
                  className="form-control"
                  style={{ borderRadius: 8, fontSize: 14, background: '#f8fafc', border: '1px solid #bfcfff' }}
                  min={new Date().toISOString().split('T')[0]}
                  required
                />
              </div>
              <div className="col-md-6">
                <label style={{ fontWeight: 600, fontSize: 14, color: '#222', marginBottom: 8, display: 'block' }}>
                  Schedule Time *
                </label>
                <input
                  type="time"
                  value={taskScheduleTime}
                  onChange={(e) => setTaskScheduleTime(e.target.value)}
                  className="form-control"
                  style={{ borderRadius: 8, fontSize: 14, background: '#f8fafc', border: '1px solid #bfcfff' }}
                  required
                />
              </div>
            </div>
            
            {taskScheduleDate && taskScheduleTime && (
              <div style={{ 
                marginTop: 16, 
                padding: '12px 16px', 
                background: '#e3eafe', 
                borderRadius: 8, 
                border: '1px solid #bfcfff' 
              }}>
                <div style={{ fontSize: 14, color: '#324cdd', fontWeight: 600 }}>
                  <i className="ni ni-time-alarm" style={{ marginRight: 6 }} />
                  Task will be published on:
                </div>
                <div style={{ fontSize: 16, color: '#324cdd', marginTop: 4 }}>
                  {formatRelativeTime(`${taskScheduleDate}T${taskScheduleTime}`)}
                </div>
              </div>
            )}
          </div>
        </ModalBody>
        <ModalFooter>
          <Button
            color="secondary"
            onClick={() => setShowTaskScheduleModal(false)}
            style={{ 
              borderRadius: 8, 
              fontWeight: 600,
              border: '1px solid #e9ecef'
            }}
          >
            Cancel
          </Button>
          <Button
            color="primary"
            onClick={handleScheduleTask}
            disabled={!taskScheduleDate || !taskScheduleTime}
            style={{ 
              borderRadius: 8, 
              fontWeight: 600,
              background: 'linear-gradient(135deg, #667eea 0%, #324cdd 100%)',
              border: 'none'
            }}
          >
            <i className="ni ni-time-alarm" style={{ marginRight: 6 }} />
            Schedule Task
          </Button>
        </ModalFooter>
      </Modal>
      {/* Export modal removed - export uses current grading settings directly */}

      {/* Task Link Modal */}
      <Modal isOpen={showTaskLinkModal} toggle={() => setShowTaskLinkModal(false)} centered>
        <ModalHeader toggle={() => setShowTaskLinkModal(false)}>Attach Link to Task</ModalHeader>
        <ModalBody>
          <Input
            placeholder="https://example.com"
            value={taskLinkInput}
            onChange={(e) => setTaskLinkInput(e.target.value)}
          />
          {taskLinkError && <div style={{ color: '#e74c3c', marginTop: 8, fontSize: 13 }}>{taskLinkError}</div>}
        </ModalBody>
        <ModalFooter>
          <Button color="secondary" onClick={() => setShowTaskLinkModal(false)}>Cancel</Button>
          <Button color="primary" onClick={handleAddTaskLink}>Add</Button>
        </ModalFooter>
      </Modal>

      {/* Task YouTube Modal */}
      <Modal isOpen={showTaskYouTubeModal} toggle={() => setShowTaskYouTubeModal(false)} centered>
        <ModalHeader toggle={() => setShowTaskYouTubeModal(false)}>Attach YouTube to Task</ModalHeader>
        <ModalBody>
          <Input
            placeholder="Paste YouTube URL"
            value={taskYouTubeInput}
            onChange={(e) => setTaskYouTubeInput(e.target.value)}
          />
        </ModalBody>
        <ModalFooter>
          <Button color="secondary" onClick={() => setShowTaskYouTubeModal(false)}>Cancel</Button>
          <Button color="primary" onClick={handleAddTaskYouTube}>Add</Button>
        </ModalFooter>
      </Modal>

      {/* Task Google Drive Modal */}
      <Modal isOpen={showTaskDriveModal} toggle={() => setShowTaskDriveModal(false)} centered>
        <ModalHeader toggle={() => setShowTaskDriveModal(false)}>Attach Google Drive to Task</ModalHeader>
        <ModalBody>
          <Input
            placeholder="Paste Google Drive link"
            value={taskDriveInput}
            onChange={(e) => setTaskDriveInput(e.target.value)}
        />
        </ModalBody>
        <ModalFooter>
          <Button color="secondary" onClick={() => setShowTaskDriveModal(false)}>Cancel</Button>
          <Button color="primary" onClick={handleAddTaskDrive}>Add</Button>
        </ModalFooter>
      </Modal>

      {/* Stream Post Schedule Modal */}
      <Modal isOpen={showScheduleModal} toggle={() => setShowScheduleModal(false)} centered>
        <ModalHeader toggle={() => setShowScheduleModal(false)} style={{ fontWeight: 700, fontSize: 20 }}>
          <i className="ni ni-time-alarm" style={{ marginRight: 8, color: '#f39c12' }} />
          Schedule Stream Post
        </ModalHeader>
        <ModalBody style={{ padding: '24px' }}>
          <div style={{ marginBottom: 20 }}>
            <p style={{ color: '#666', fontSize: 14, marginBottom: 16 }}>
              Choose when you want this announcement to be published automatically.
            </p>
            
            <div className="row">
              <div className="col-md-6">
                <label style={{ fontWeight: 600, fontSize: 14, color: '#222', marginBottom: 8, display: 'block' }}>
                  Schedule Date *
                </label>
                <input
                  type="date"
                  value={scheduleDate}
                  onChange={(e) => setScheduleDate(e.target.value)}
                  className="form-control"
                  style={{ borderRadius: 8, fontSize: 14, background: '#f8fafc', border: '1px solid #bfcfff' }}
                  min={new Date().toISOString().split('T')[0]}
                  required
                />
              </div>
              <div className="col-md-6">
                <label style={{ fontWeight: 600, fontSize: 14, color: '#222', marginBottom: 8, display: 'block' }}>
                  Schedule Time *
                </label>
                <input
                  type="time"
                  value={scheduleTime}
                  onChange={(e) => setScheduleTime(e.target.value)}
                  className="form-control"
                  style={{ borderRadius: 8, fontSize: 14, background: '#f8fafc', border: '1px solid #bfcfff' }}
                  required
                />
              </div>
            </div>
            
            {scheduleDate && scheduleTime && (
              <div style={{ 
                marginTop: 16, 
                padding: '12px 16px', 
                background: '#e3eafe', 
                borderRadius: 8, 
                border: '1px solid #bfcfff' 
              }}>
                <div style={{ fontSize: 14, color: '#324cdd', fontWeight: 600 }}>
                  <i className="ni ni-time-alarm" style={{ marginRight: 6 }} />
                  Announcement will be published on:
                </div>
                <div style={{ fontSize: 16, color: '#324cdd', marginTop: 4 }}>
                  {formatRelativeTime(`${scheduleDate}T${scheduleTime}`)}
                </div>
              </div>
            )}
          </div>
        </ModalBody>
        <ModalFooter>
          <Button
            color="secondary"
            onClick={() => setShowScheduleModal(false)}
            style={{ 
              borderRadius: 8, 
              fontWeight: 600,
              border: '1px solid #e9ecef'
            }}
          >
            Cancel
          </Button>
          <Button
            color="primary"
            onClick={handleCreateScheduled}
            disabled={!scheduleDate || !scheduleTime}
            style={{ 
              borderRadius: 8, 
              fontWeight: 600,
              background: 'linear-gradient(135deg, #667eea 0%, #324cdd 100%)',
              border: 'none'
            }}
          >
            <i className="ni ni-time-alarm" style={{ marginRight: 6 }} />
            Schedule Post
          </Button>
        </ModalFooter>
      </Modal>

      {/* Copy Toast */}
      <div style={{ position: "fixed", top: "20px", right: "20px", zIndex: 9999 }}>
        <Toast isOpen={showCopyToast} style={{ borderRadius: "12px" }}>
          <ToastHeader 
            icon="success" 
            toggle={() => setShowCopyToast(false)}
            style={{ border: "none", background: "#d4edda", color: "#155724" }}
          >
            Copied!
          </ToastHeader>
          <ToastBody style={{ background: "#d4edda", color: "#155724" }}>
            Class code copied to clipboard!
          </ToastBody>
        </Toast>
      </div>
    </div>
  );
};

export default ClassroomDetail; 