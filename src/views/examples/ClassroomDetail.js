import React, { useRef, useState, useEffect } from "react"; // Force rebuild
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
import Cropper from 'react-easy-crop';
import getCroppedImg from './utils/cropImage'; // We'll add this helper next
import axios from 'axios';

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
  if (user.profile_pic && user.profile_pic !== userDefault) {
    return user.profile_pic;
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

  // Add new state for modals and forms
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [showAddGradeModal, setShowAddGradeModal] = useState(false);
  const [assignments, setAssignments] = useState(sampleAssignments);
  const [students, setStudents] = useState([]);
  const [loadingStudents, setLoadingStudents] = useState(false);
  const [grades, setGrades] = useState(sampleGrades);

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
        // Try the original path
        response = await apiService.makeRequest(`/teacher/classroom/${code}/students`, {
          method: 'GET',
          requireAuth: true
        });
        console.log('API Response received:', response);
      } catch (error1) {
        console.log('First path failed, trying alternative...');
        try {
          // Try alternative path
          response = await apiService.makeRequest(`/teacher/classrooms/${code}/students`, {
            method: 'GET',
            requireAuth: true
          });
          console.log('Alternative path API Response received:', response);
        } catch (error2) {
          console.log('Alternative path also failed, trying section students...');
          try {
            // Try getting all students and filtering
            const allStudentsResponse = await apiService.getStudents();
            console.log('All students response:', allStudentsResponse);
            // For now, let's use sample data until we figure out the correct endpoint
            response = { status: true, data: { students: [] } };
          } catch (error3) {
            console.log('All approaches failed, using empty response');
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
  const [postDropdownOpen, setPostDropdownOpen] = useState(false);
  const [selectedYear, setSelectedYear] = useState('2024-2025');
  const [selectedAudience, setSelectedAudience] = useState('All students');
  const years = ['2023-2024', '2024-2025', '2025-2026'];
  const audiences = ['All students'];

  const [attachments, setAttachments] = useState([]);
  const [showLinkModal, setShowLinkModal] = useState(false);
  const [showYouTubeModal, setShowYouTubeModal] = useState(false);
  const [linkInput, setLinkInput] = useState("");
  const [youtubeInput, setYouTubeInput] = useState("");
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
  const emojiPickerRef = useRef();

  // 1. Add state for preview modal and attachment
  const [previewModalOpen, setPreviewModalOpen] = useState(false);
  const [previewAttachment, setPreviewAttachment] = useState(null);
  const [previewText, setPreviewText] = useState("");

  // Add state for mp3 playing
  const [mp3Playing, setMp3Playing] = useState(false);

  // Add refs for visualizer
  const visualizerIntervalRef = useRef(null);

  //
  const [currentDraftId, setCurrentDraftId] = useState(null);

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

  // 1. Add state for allowComments in the creation form
  const [allowComments, setAllowComments] = useState(true);

  // 2. Add state for modal and selected students
  const [showStudentSelectModal, setShowStudentSelectModal] = useState(false);
  const [selectedAnnouncementStudents, setSelectedAnnouncementStudents] = useState([]);

  // Add at the top of ClassroomDetail component:
  const [tempSelectedStudents, setTempSelectedStudents] = useState([]);
  
  // Add classrooms state to load actual classrooms
  const [classrooms, setClassrooms] = useState([]);
  
  // Current user - in a real app, this would come from user context
  const currentUser = "Prof. Smith";

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

  // Load tasks from localStorage for current classroom
  useEffect(() => {
    const classroomKey = `classroom_tasks_${code}`;
    const savedTasks = localStorage.getItem(classroomKey);
    if (savedTasks) {
      const parsedTasks = JSON.parse(savedTasks);
      setTasks(parsedTasks);
    }
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
    allowComments: true,
    attachments: [],
    visibleTo: [],
    postToClassrooms: ['current'],
    submitted: false
  });
  const [taskAttachments, setTaskAttachments] = useState([]);
  const [taskAssignedStudents, setTaskAssignedStudents] = useState([]);
  const [taskDrafts, setTaskDrafts] = useState([]);
  const [taskScheduled, setTaskScheduled] = useState([]);
  const [showTaskDraftsCollapse, setShowTaskDraftsCollapse] = useState(false);
  const [showTaskScheduledCollapse, setShowTaskScheduledCollapse] = useState(false);

  const [showTaskLinkModal, setShowTaskLinkModal] = useState(false);
  const [showTaskYouTubeModal, setShowTaskYouTubeModal] = useState(false);
  const [showTaskDriveModal, setShowTaskDriveModal] = useState(false);
  const [showTaskScheduleModal, setShowTaskScheduleModal] = useState(false);
  const [showTaskOptionsModal, setShowTaskOptionsModal] = useState(false);
  const [taskLinkInput, setTaskLinkInput] = useState('');
  const [taskYouTubeInput, setTaskYouTubeInput] = useState('');
  const [taskDriveInput, setTaskDriveInput] = useState('');
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
    const audioFile = voiceType === 'male'
      ? process.env.PUBLIC_URL + '/grading-success-male.mp3'
      : process.env.PUBLIC_URL + '/grading-success-female.mp3';
    const audio = new Audio(audioFile);
    audio.play();
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
  const [showEditStudentSelectModal, setShowEditStudentSelectModal] = useState(false);
  const [editSelectedStudents, setEditSelectedStudents] = useState([]);

  // 3. In handlePostAnnouncement, save both title and content
  const handlePostAnnouncement = async (e) => {
    e.preventDefault();

    // Build the JSON data (do NOT include attachment_url)
    const postData = {
      title: newAnnouncementTitle,
      content: newAnnouncement,
      is_draft: 0,
      is_scheduled: 0,
      scheduled_at: '',
      allow_comments: allowComments ? 1 : 0,
      student_ids: selectedAnnouncementStudents,
    };

    // Prepare FormData
    const formData = new FormData();
    if (attachments.length > 0 && attachments[0].file) {
      formData.append('attachment', attachments[0].file); // attachments[0].file should be a File object
    }
    formData.append('data', JSON.stringify(postData));

    try {
      await axios.post(
        `http://localhost/scms_new_backup/index.php/api/teacher/classroom/${code}/stream`,
        formData,
        {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`,
            'Content-Type': 'multipart/form-data',
          },
        }
      );
      setNewAnnouncement("");
      setNewAnnouncementTitle("");
      setAttachments([]);
      setSelectedAnnouncementStudents([]);
      fetchStreamPosts();
    } catch (err) {
      alert('Failed to post announcement: ' + (err.message || err));
    }
  };

  // 3. Add handler to post a comment
  const handlePostComment = (announcementId) => {
    const comment = commentInputs[announcementId]?.trim();
    if (!comment) return;
    setAnnouncements(prev => prev.map(a =>
      a.id === announcementId
        ? { ...a, comments: (a.comments || []).concat({ text: comment, author: "Prof. Smith", date: new Date().toISOString() }) }
        : a
    ));
    setCommentInputs(inputs => ({ ...inputs, [announcementId]: "" }));
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
      const response = await apiService.getClassroomStream(code);
      if (response.status && response.data) {
        // Transform API data to match the expected format
        const transformedPosts = response.data.map(post => ({
          id: post.id,
          title: post.title,
          content: post.content,
          author: post.user_name,
          date: post.created_at,
          isPinned: post.is_pinned === "1",
          reactions: { 
            like: post.like_count || 0, 
            likedBy: [] 
          },
          comments: [],
          user_avatar: post.user_avatar,
          attachments: post.attachment_url
            ? [{
                name: post.attachment_url.split('/').pop(),
                url: post.attachment_url.startsWith('http') ? post.attachment_url : `http://localhost/scms_new/${post.attachment_url}`,
                type: post.attachment_type || ''
              }]
            : []
        }));
        setAnnouncements(transformedPosts);
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
    // eslint-disable-next-line
  }, [code]);

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

  const handleUploadPhoto = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        const img = new window.Image();
        img.onload = () => {
          // Resize if too large
          const maxDim = 2000;
          let { width, height } = img;
          if (width > maxDim || height > maxDim) {
            const scale = Math.min(maxDim / width, maxDim / height);
            width = Math.round(width * scale);
            height = Math.round(height * scale);
          }
          const canvas = document.createElement('canvas');
          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext('2d');
          ctx.drawImage(img, 0, 0, width, height);
          const safeDataUrl = canvas.toDataURL('image/png');
          setCropImage(safeDataUrl);
          setCropModalOpen(true);
        };
        img.onerror = () => {
          alert('Failed to load image for re-encoding.');
        };
        img.src = reader.result;
      };
      reader.readAsDataURL(file);
    }
  };

  const onCropComplete = (croppedArea, croppedAreaPixels) => {
    setCroppedAreaPixels(croppedAreaPixels);
  };

  const handleCropSave = async () => {
    if (!croppedAreaPixels) {
      alert('Crop area not set. Please move or resize the crop box.');
      return;
    }
    try {
      console.log('Cropping with:', { cropImage, croppedAreaPixels });
      const croppedImg = await getCroppedImg(cropImage, croppedAreaPixels);
      // Save croppedImg as custom photo (base64)
      setShowThemeModal(false);
      setCropModalOpen(false);
      setCropImage(null);
      // Set as selected theme (simulate upload)
      handleSelectTheme(croppedImg);
    } catch (e) {
      alert('Failed to crop image');
    }
  };

  const handleAddAttachment = (type) => {
    if (type === "Google Drive") {
      alert("Google Drive integration coming soon!");
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
      allowComments: ann.allowComments,
    });
    // Set the current selected students for editing
    setEditSelectedStudents(ann.visibleTo || []);
  };

  const handleEditAnnouncementChange = (e) => {
    const { name, value } = e.target;
    setEditAnnouncementData(prev => ({ ...prev, [name]: value }));
  };

  const handleSaveEditAnnouncement = (id) => {
    setAnnouncements(prev => prev.map(a => a.id === id ? { 
      ...a, 
      title: editAnnouncementData.title, 
      content: editAnnouncementData.content,
      attachments: editAnnouncementData.attachments || [],
      allowComments: editAnnouncementData.allowComments !== false,
      visibleTo: editSelectedStudents
    } : a));
    setEditingAnnouncementId(null);
    setEditAnnouncementData({ title: '', content: '', attachments: [], allowComments: true });
    setEditSelectedStudents([]);
  };

  const handleCancelEditAnnouncement = () => {
    setEditingAnnouncementId(null);
    setEditAnnouncementData({ title: '', content: '', attachments: [], allowComments: true });
    setEditSelectedStudents([]);
  };

  const handleDeleteAnnouncement = (id) => {
    setAnnouncements(prev => prev.filter(a => a.id !== id));
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

  // Update handleSaveEditComment to work with both announcements and classwork
  const handleSaveEditComment = (itemId, idx) => {
    const text = editingCommentText[`${itemId}-${idx}`] || "";
    
    // Force a complete state update with a new array reference
    if (itemId >= 1 && itemId <= 3) { // These are announcement IDs
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

  // 3. Delete comment handler
  const handleDeleteComment = (announcementId, idx) => {
      setAnnouncements(prev => prev.map(a =>
      a.id === announcementId
          ? { ...a, comments: (a.comments || []).filter((_, i) => i !== idx) }
          : a
      ));
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

  // Add state for cropping modal
  const [cropModalOpen, setCropModalOpen] = useState(false);
  const [cropImage, setCropImage] = useState(null);
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState(null);
  const [minZoom, setMinZoom] = useState(1);

  useEffect(() => {
    if (!cropImage) return;
    const img = new window.Image();
    img.onload = () => {
      // Calculate the minimum zoom so the crop area never exceeds the image
      const aspect = 3.5 / 1; // or your aspect ratio
      const imgAspect = img.width / img.height;
      let minZoomValue = 1;
      if (imgAspect > aspect) {
        minZoomValue = aspect / imgAspect;
      } else {
        minZoomValue = imgAspect / aspect;
      }
      setMinZoom(Math.max(1, minZoomValue));
    };
    img.src = cropImage;
  }, [cropImage]);

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
            allowComments: taskForm.allowComments,
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
          allowComments: true,
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
          const newAnnouncement = {
            id: Date.now() + Math.random(),
            title: item.title || 'Scheduled Announcement',
            content: item.text,
            author: "Prof. Smith",
            date: new Date().toISOString(),
            isPinned: false,
            reactions: { like: 0, likedBy: [] },
            attachments: item.attachments || [],
            year: item.year,
            audience: item.audience,
            visibleTo: item.visibleTo || []
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
          const newTask = {
            id: Date.now() + Math.random(),
            type: item.type,
            title: item.title,
            text: item.text,
            dueDate: item.dueDate,
            points: item.points,
            allowComments: item.allowComments,
            attachments: item.attachments || [],
            assignedStudents: item.assignedStudents || [],
            author: "Prof. Smith",
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
  const handleTaskFormChange = (e) => {
    const { name, value } = e.target;
    setTaskForm(prev => ({ ...prev, [name]: value }));
  };

  const handlePostTask = (e) => {
    e.preventDefault();
    
    // Set submitted flag to true to show validation errors
    setTaskForm(prev => ({ ...prev, submitted: true }));
    
    // Check required fields
    if (!taskForm.title.trim() || !taskForm.points || !taskForm.text.trim()) {
      return;
    }
    
    const newTask = {
      id: Date.now(),
      ...taskForm,
      author: 'Teacher',
      date: new Date().toISOString(),
      likes: 0,
      isLiked: false,
      isPinned: false,
      comments: [],
      attachments: [...taskAttachments],
      assignedStudents: taskAssignedStudents // <-- Add this line
    };
    
    // Save task to selected classrooms
    const selectedClassrooms = taskForm.postToClassrooms || ['current'];
    
    selectedClassrooms.forEach(classroomId => {
      if (classroomId === 'current') {
        // Save to current classroom's localStorage and update state
        const classroomKey = `classroom_tasks_${code}`;
        const existingTasks = JSON.parse(localStorage.getItem(classroomKey) || '[]');
        const updatedTasks = [newTask, ...existingTasks];
        localStorage.setItem(classroomKey, JSON.stringify(updatedTasks));
        setTasks(prev => [newTask, ...prev]);
      } else {
        // Save to other classrooms using their code
        const classroomKey = `classroom_tasks_${classroomId}`;
        const existingTasks = JSON.parse(localStorage.getItem(classroomKey) || '[]');
        const updatedTasks = [newTask, ...existingTasks];
        localStorage.setItem(classroomKey, JSON.stringify(updatedTasks));
      }
    });
    
    // Remove the draft from drafts if we're editing one
    if (currentDraftId) {
      setTaskDrafts(prev => prev.filter(draft => draft.id !== currentDraftId));
    }
    
    setTaskForm({
      type: 'Assignment',
      title: '',
      text: '',
      dueDate: '',
      points: '',
      allowComments: true,
      attachments: [],
      visibleTo: [],
      postToClassrooms: ['current'],
      submitted: false
    });
    setTaskAttachments([]);
    setTaskAssignedStudents([]);
    setCurrentDraftId(null); // Reset the current draft ID
  };

  const handleSaveTaskDraft = () => {
    setTaskForm(prev => ({ ...prev, submitted: true }));
    if (!taskForm.title.trim() || !taskForm.points || !taskForm.text.trim()) {
      return;
    }
    const draft = {
      id: currentDraftId || Date.now(),
      ...taskForm,
      lastEdited: new Date().toISOString(),
      attachments: [...taskAttachments],
      visibleTo: [...taskAssignedStudents]
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
    setTaskForm({
      type: 'Assignment',
      title: '',
      text: '',
      dueDate: '',
      points: '',
      allowComments: true,
      attachments: [],
      visibleTo: [],
      postToClassrooms: ['current'],
      submitted: false
    });
    setTaskAttachments([]);
    setTaskAssignedStudents([]);
    setCurrentDraftId(null); // <-- reset after save
  };

  const handleCancelTaskPost = () => {
    setTaskForm({
      type: 'Assignment',
      title: '',
      text: '',
      dueDate: '',
      points: '',
      allowComments: true,
      attachments: [],
      visibleTo: [],
      postToClassrooms: ['current'],
      submitted: false
    });
    setTaskAttachments([]);
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

  const handleRemoveTaskAttachment = (idx) => {
    setTaskAttachments(prev => prev.filter((_, i) => i !== idx));
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

  const handleEditTask = (taskId) => {
    const task = tasks.find(t => t.id === taskId);
    if (task) {
      setTaskForm({
        type: task.type,
        title: task.title,
        text: task.text,
        dueDate: task.dueDate,
        points: task.points,
        allowComments: task.allowComments,
        attachments: [],
        visibleTo: []
      });
      setTaskAttachments(task.attachments || []);
      setTasks(prev => prev.filter(t => t.id !== taskId));
    }
  };

  const handleDeleteTask = (taskId) => {
    setTasks(prev => prev.filter(task => task.id !== taskId));
  };

  const handlePostTaskComment = (taskId) => {
    const commentText = taskCommentInputs[taskId];
    if (!commentText?.trim()) return;
    
    const newComment = {
      id: Date.now(),
      text: commentText,
      author: 'Student',
      date: new Date().toISOString()
    };
    
    setTasks(prev => prev.map(task => 
      task.id === taskId 
        ? { ...task, comments: [...(task.comments || []), newComment] }
        : task
    ));
    
    setTaskCommentInputs(prev => ({ ...prev, [taskId]: '' }));
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
              <Badge color="light" className="text-dark">{classInfo.schoolYear}</Badge>
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
            <Button 
              color="link" 
              style={{ color: '#fff', fontWeight: 400, fontSize: 13, padding: 0, textDecoration: 'none' }} 
              onClick={() => fileInputRef.current && fileInputRef.current.click()}
            >
              Upload photo
            </Button>
            <input type="file" accept="image/*" ref={fileInputRef} style={{ display: 'none' }} onChange={handleUploadPhoto} />
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
                      onClick={() => setShowScheduledCollapse(!showScheduledCollapse)}
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
                      <div style={{ fontWeight: 700, color: '#2d3559', marginBottom: 8 }}>Scheduled Announcements</div>
                      {scheduled.length === 0 ? (
                        <div style={{ color: '#888' }}>No scheduled announcements.</div>
                      ) : (
                        scheduled.map((announcement, idx) => (
                          <div key={idx} style={{ background: '#f8fafd', borderRadius: 12, boxShadow: '0 2px 8px #324cdd11', marginBottom: 18, padding: '18px 24px' }}>
                            <div style={{ fontWeight: 700, fontSize: 17, marginBottom: 6 }}>{announcement.title}</div>
                            <div style={{ color: '#444', fontSize: 15, marginBottom: 12 }}>{announcement.content || announcement.text}</div>
                            <div style={{ fontSize: 13, color: '#888', marginBottom: 8 }}>Scheduled for: {announcement.scheduledFor ? `${announcement.scheduledFor.date} ${announcement.scheduledFor.time}` : ''}</div>
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
                                  const displayName = isLink ? att.url : att.name;
                                  return (
                                    <div
                                      key={idx2}
                                      style={{ background: '#fff', borderRadius: 12, boxShadow: '0 1px 4px #e9ecef', padding: '10px 18px', minWidth: 220, maxWidth: 340, display: 'flex', alignItems: 'center', gap: 12, cursor: 'pointer' }}
                                      onClick={() => {
                                        if (isLink && att.url) {
                                          window.open(att.url, '_blank', 'noopener,noreferrer');
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
                                          {isLink && <>&bull; <a href={att.url} target="_blank" rel="noopener noreferrer" style={{ color: color, fontWeight: 600, textDecoration: 'none' }} onClick={e => e.stopPropagation()}>View Link</a></>}
                                        </div>
                                      </div>
                                    </div>
                                  );
                                })}
                              </div>
                            )}
                          </div>
                        ))
                      )}
                    </div>
                  </Collapse>
                  {/* Drafts Announcements Collapse */}
                  <Collapse isOpen={showDraftsCollapse}>
                    <div style={{ background: '#fff', borderRadius: 16, boxShadow: '0 2px 12px #324cdd11', border: 'none', marginBottom: 24, marginTop: 0, padding: '2rem 2rem 1.5rem', maxWidth: '100%' }}>
                      <div style={{ fontWeight: 700, color: '#2d3559', marginBottom: 8 }}>Draft Announcements</div>
                      {drafts.length === 0 ? (
                        <div style={{ color: '#888' }}>No drafts saved.</div>
                      ) : (
                        drafts.map((draft, idx) => (
                          <div key={idx} style={{ background: '#f8fafd', borderRadius: 12, boxShadow: '0 2px 8px #324cdd11', marginBottom: 18, padding: '18px 24px' }}>
                            <div style={{ fontWeight: 700, fontSize: 17, marginBottom: 6 }}>{draft.title}</div>
                            <div style={{ color: '#444', fontSize: 15, marginBottom: 12 }}>{draft.content || draft.text}</div>
                            <div style={{ fontSize: 13, color: '#888', marginBottom: 8 }}>Saved as draft: {draft.lastEdited ? new Date(draft.lastEdited).toLocaleString() : ''}</div>
                            {draft.attachments && draft.attachments.length > 0 && (
                              <div style={{ margin: '10px 0 16px 0', display: 'flex', flexDirection: 'column', gap: 10 }}>
                                {draft.attachments.map((att, idx2) => (
                                  <div key={idx2} style={{ background: '#fff', borderRadius: 12, boxShadow: '0 1px 4px #e9ecef', padding: '10px 18px', minWidth: 220, maxWidth: 340 }}>
                                    <span style={{ fontWeight: 600 }}>{att.name || att.url || 'Attachment'}</span>
                                  </div>
                                ))}
                              </div>
                            )}
                          </div>
                        ))
                      )}
                    </div>
                  </Collapse>
                  {/* Only show main stream input/announcements if neither collapse is open and not expanded */}
                  {!(formExpanded) && (
                    <div
                      style={{ background: '#f7fafd', borderRadius: 14, padding: '22px 18px', minHeight: 56, color: '#444', fontSize: 16, border: 'none', boxShadow: 'none', marginBottom: 0, width: '100%', cursor: 'pointer', transition: 'box-shadow 0.2s, background 0.2s' }}
                      onClick={() => setFormExpanded(true)}
                      onMouseOver={e => e.currentTarget.style.boxShadow = '0 2px 8px #324cdd22'}
                      onMouseOut={e => e.currentTarget.style.boxShadow = 'none'}
                    >
                      <span style={{ color: '#7d8fa9' }}>Share an announcement with your class...</span>
                    </div>
                  )}
                  {/* Expanded announcement form */}
                  {formExpanded && (
                    <div ref={formExpandedRef} style={{ background: '#fff', borderRadius: 16, boxShadow: '0 2px 12px #324cdd22', padding: 24, marginBottom: 0, width: '100%', position: 'relative', zIndex: 10, minHeight: 220 }}>
                      {/* Add Student button floating in upper right of the card */}
                      <button
                        type="button"
                        onClick={() => setShowStudentSelectModal(true)}
                        style={{
                          position: 'absolute',
                          top: 12,
                          right: 12,
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
                          zIndex: 20,
                          gap: 6
                        }}
                        aria-label="Add Students"
                      >
                        {selectedAnnouncementStudents.length > 0 && (
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
                          }}>{selectedAnnouncementStudents.length}</span>
                        )}
                        <i className="fa fa-user-plus" style={{ fontSize: 20, color: '#111' }}></i>
                      </button>
                      <form onSubmit={handlePostAnnouncement} style={{ position: 'relative' }}>
                        {/* Allow comments checkbox */}
                        <div style={{ display: 'flex', alignItems: 'center', marginBottom: 10 }}>
                          <input
                            type="checkbox"
                            checked={allowComments}
                            onChange={e => setAllowComments(e.target.checked)}
                            style={{ marginRight: 8 }}
                          />
                          <span style={{ fontSize: 15, color: '#444', fontWeight: 500 }}>Allow comments</span>
                        </div>
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
                                  const isLink = att.type === "Link" || att.type === "YouTube" || att.type === "Google Drive";
                                  const displayName = isLink ? att.url : att.name;
                                  return (
                                    <div
                                      key={idx}
                                      style={{ background: '#fff', borderRadius: 12, boxShadow: '0 1px 4px #e9ecef', padding: '10px 18px', minWidth: 220, maxWidth: 340, display: 'flex', alignItems: 'center', gap: 12 }}
                                    >
                                      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginRight: 8 }}>{preview}</div>
                                      <div style={{ flex: 1, minWidth: 0 }}>
                                        <div style={{ fontWeight: 600, fontSize: 16, color: '#232b3b', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: 140 }} title={displayName}>{displayName}</div>
                                        <div style={{ fontSize: 13, color: '#90A4AE', marginTop: 2 }}>
                                          {type}
                                          {url && <>&bull; <a href={url} download={att.name} style={{ color: color, fontWeight: 600, textDecoration: 'none' }} onClick={e => e.stopPropagation()}>Download</a></>}
                                        </div>
                                      </div>
                                      <button
                                      type="button"
                                      onClick={e => { e.stopPropagation(); handleRemoveAttachment(idx); }}
                                      style={{
                                        position: 'absolute',
                                        right: 16, // or 18, to match your card padding
                                        top: '50%',
                                        transform: 'translateY(-50%)',
                                        background: 'none',
                                        border: 'none',
                                        color: '#888',
                                        fontWeight: 700,
                                        fontSize: 22,
                                        cursor: 'pointer',
                                        borderRadius: '50%',
                                        width: 32,
                                        height: 32,
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        transition: 'background 0.2s'
                                      }}
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
                        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8, marginTop: 18 }}>
                          <button
                            type="button"
                            onClick={() => setFormExpanded(false)}
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
                          <button
                            type="submit"
                            style={{
                              background: (newAnnouncement.trim().length > 0 || attachments.length > 0) ? '#7B8CFF' : '#e6e6fa',
                              border: 'none',
                              color: (newAnnouncement.trim().length > 0 || attachments.length > 0) ? '#fff' : '#888',
                              fontWeight: 700,
                              fontSize: 13,
                              borderRadius: 7,
                              padding: '6px 18px',
                              cursor: (newAnnouncement.trim().length > 0 || attachments.length > 0) ? 'pointer' : 'not-allowed',
                              transition: 'background 0.15s',
                              opacity: (newAnnouncement.trim().length > 0 || attachments.length > 0) ? 1 : 0.6,
                              display: 'flex',
                              alignItems: 'center',
                              gap: 4
                            }}
                            disabled={!(newAnnouncement.trim().length > 0 || attachments.length > 0)}
                          >
                            <i className="fa fa-paper-plane" style={{ marginRight: 4, color: (newAnnouncement.trim().length > 0 || attachments.length > 0) ? '#fff' : '#888' }}></i> Post
                          </button>
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
                            <div
                              style={{ display: 'flex', alignItems: 'center', gap: 4, color: (announcement.reactions?.likedBy?.includes('Prof. Smith') ? '#324cdd' : '#b0b0b0'), fontWeight: 600, fontSize: 16, cursor: 'pointer' }}
                              onClick={() => handleLikeAnnouncement(announcement.id)}
                              title={'Like'}
                            >
                              <i className="fa fa-thumbs-up" style={{ color: (announcement.reactions?.likedBy?.includes('Prof. Smith') ? '#324cdd' : '#b0b0b0'), fontSize: 18 }} />
                              <span style={{ color: (announcement.reactions?.likedBy?.includes('Prof. Smith') ? '#324cdd' : '#b0b0b0') }}>{announcement.reactions?.like || 0}</span>
                            </div>
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
                                        allowComments: announcement.allowComments,
                                      });
                                      setEditSelectedStudents(announcement.visibleTo || []);
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
                          </div>
                          {/* Author info, date, and pinned badge */}
                          <div style={{ display: 'flex', alignItems: 'center', marginBottom: 8, justifyContent: 'space-between' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                              <div style={{ width: 32, height: 32, borderRadius: '50%', background: '#e9ecef', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden', marginTop: -4 }}>
                                <img 
                                  src={announcement.user_avatar ? `http://localhost/scms_new/${announcement.user_avatar}` : userDefault} 
                                  alt="avatar" 
                                  style={{ width: 32, height: 32, borderRadius: '50%', objectFit: 'cover', display: 'block' }} 
                                  onError={(e) => {
                                    e.target.src = userDefault;
                                  }}
                                />
                              </div>
                              <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                                  <div style={{ fontWeight: 600, color: '#111', fontSize: 14 }}>{announcement.author}</div>
                                  {announcement.isPinned && (
                                    <Badge color="warning" className="ml-2">Pinned</Badge>
                                  )}
                                </div>
                                <small className="text-muted" style={{ fontSize: 11 }}>{new Date(announcement.date).toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' })}</small>
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
                              {/* Allow comments at the top */}
                              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 14 }}>
                                <input
                                  type="checkbox"
                                  id="editAllowComments"
                                  checked={editAnnouncementData.allowComments}
                                  onChange={e => setEditAnnouncementData(prev => ({ ...prev, allowComments: e.target.checked }))}
                                  style={{ margin: 0 }}
                                />
                                <label htmlFor="editAllowComments" style={{ margin: 0, fontSize: 15, fontWeight: 500, color: '#444' }}>
                                  Allow comments
                                </label>
                              </div>
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
                              <div style={{ margin: '16px 0 0 0' }}>
                                <button
                                  type="button"
                                  style={{
                                    display: 'flex', alignItems: 'center', gap: 10, background: '#fff', border: 'none', borderRadius: 12, boxShadow: '0 2px 8px #e9ecef', padding: '12px 18px', fontWeight: 600, fontSize: 17, marginBottom: 12, cursor: 'pointer', marginRight: 0
                                  }}
                                  onClick={() => fileInputRef.current && fileInputRef.current.click()}
                                >
                                  <i className="fa fa-paperclip" style={{ fontSize: 22, marginRight: 8 }} /> Add Attachment
                                </button>
                                <input
                                  type="file"
                                  ref={fileInputRef}
                                  style={{ display: 'none' }}
                                  multiple
                                  onChange={handleEditFileChange}
                                />
                                <div style={{ marginBottom: 10 }}>
                                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 15, fontWeight: 500, color: '#222', marginBottom: 6 }}>
                                    <i className="fa fa-user" style={{ fontSize: 18 }} />
                                    Who can view this announcement?
                                  </div>
                                  <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                                    <button
                                      type="button"
                                      style={{ background: editSelectedStudents.length > 0 ? '#232b3b' : '#bfc0c2', color: '#fff', border: 'none', borderRadius: 8, padding: '10px 18px', fontWeight: 600, fontSize: 15, cursor: 'pointer', marginTop: 4, minWidth: 180, opacity: 1, display: 'flex', alignItems: 'center', gap: 8 }}
                                      onClick={() => setShowStudentSelectModal(true)}
                                    >
                                      + Select students
                                    </button>
                                    {editSelectedStudents.length > 0 && (
                                      <span style={{ background: '#324cdd', color: '#fff', borderRadius: '50%', padding: '2px 10px', fontWeight: 700, fontSize: 15, marginLeft: 2, minWidth: 28, textAlign: 'center', display: 'inline-block' }}>
                                        {editSelectedStudents.length}
                                      </span>
                                    )}
                                  </div>
                                </div>
                              </div>
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
                                // Show just the filename (e.g., assignment1.pdf) as display name, but keep full path in database
                                const displayName = isLink ? att.url : att.name;
                                return (
                                  <div
                                    key={idx}
                                    style={{ background: '#fff', borderRadius: 8, boxShadow: '0 2px 8px #e9ecef', padding: '0.5rem 1.25rem', display: 'flex', alignItems: 'center', gap: 12, minWidth: 180, maxWidth: 320, width: '100%', cursor: isLink ? 'pointer' : 'pointer' }}
                                    onClick={() => {
                                      if (isLink && att.url) {
                                        window.open(att.url, '_blank', 'noopener,noreferrer');
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
                                        {isLink && <>&bull; <a href={att.url} target="_blank" rel="noopener noreferrer" style={{ color: color, fontWeight: 600, textDecoration: 'none' }} onClick={e => e.stopPropagation()}>View Link</a></>}
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
                                {/* Render all comments here */}
                                {announcement.comments && announcement.comments.length > 0 ? (
                                  announcement.comments.map((comment, idx) => {
                                    const isEditing = editingComment[announcement.id] === idx;
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
                      {new Date(comment.date).toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' })}
                                            </div>
                  </div>
                  {/* 3-dots menu */}
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
                                                  <button
                                                    style={{ background: 'none', border: 'none', color: '#525F7F', fontWeight: 500, fontSize: 15, padding: '8px 18px', textAlign: 'left', cursor: 'pointer', borderRadius: 0 }}
                                                    onClick={e => {
                                                      e.stopPropagation();
                            setEditingComment({ [announcement.id]: idx });
                            setEditingCommentText(prev => ({ ...prev, [`${announcement.id}-${idx}`]: comment.text || '' }));
                            setOpenCommentMenu({});
                                                    }}
                                                  >Edit</button>
                                                  <button
                          style={{ background: 'none', border: 'none', color: '#525F7F', fontWeight: 500, fontSize: 15, padding: '8px 18px', textAlign: 'left', cursor: 'pointer', borderRadius: 0 }}
                                                    onClick={e => {
                                                      e.stopPropagation();
                                                      handleDeleteComment(announcement.id, idx);
                            setOpenCommentMenu({});
                                                    }}
                                                  >Delete</button>
                                                </div>
                                              )}
                                          </div>
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
        <Input
                                    type="text"
          placeholder="Add a comment..."
          value={commentInputs[announcement.id] || ""}
          onChange={e => setCommentInputs(inputs => ({ ...inputs, [announcement.id]: e.target.value }))}
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
                        <span style={{ fontWeight: 600, color: '#222', fontSize: 12 }}>Students ({tempSelectedStudents.length})</span>
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
                                <img src={s.avatar || 'https://randomuser.me/api/portraits/men/75.jpg'} alt={s.name} style={{ width: 28, height: 28, borderRadius: '50%', marginRight: 10, objectFit: 'cover', border: '1px solid #e9ecef' }} />
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
                                  <span key={id} style={{ display: 'inline-flex', alignItems: 'center', background: '#e9ecef', borderRadius: 10, padding: '2px 8px', fontSize: 11, fontWeight: 600, color: '#2d3748', minHeight: 22, minWidth: 120, maxWidth: 180, marginRight: 6, overflow: 'hidden', textOverflow: 'ellipsis' }}>
                                    <img src={s.avatar || 'https://randomuser.me/api/portraits/men/75.jpg'} alt={s.name} style={{ width: 16, height: 16, borderRadius: '50%', marginRight: 5, objectFit: 'cover', border: '1px solid #fff' }} />
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
                <h4 className="mb-4" style={{ fontWeight: 800, color: '#324cdd', letterSpacing: 1 }}>Class Tasks <i className="ni ni-tag text-warning ml-2" /></h4>
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
                            const aDate = new Date(a.scheduledFor?.date + ' ' + a.scheduledFor?.time);
                            const bDate = new Date(b.scheduledFor?.date + ' ' + b.scheduledFor?.time);
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
                                  Scheduled for {item.scheduledFor.date} at {item.scheduledFor.time}
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
                                  allowComments: draft.allowComments !== undefined ? draft.allowComments : true,
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
                                  borderRadius: 6,
                                  fontWeight: 600,
                                  width: 'auto',
                                  textAlign: 'center',
                                  padding: '6px 12px',
                          border: 'none',
                                  background: 'none',
                                  color: '#444',
                                  fontSize: 14,
                                  display: 'inline-flex',
                          alignItems: 'center',
                                  gap: 4,
                                  boxShadow: 'none',
                                  transition: 'background 0.15s, color 0.15s',
                                }}
                                onClick={() => setShowCreateStudentSelectModal(true)}
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
                      <Form onSubmit={handlePostTask}>
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
      MultiValueRemove: props => {
        if (props.data.value === 'current') return null;
        return <components.MultiValueRemove {...props} />;
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
                      <div className="d-flex flex-row flex-wrap" style={{ gap: 24, marginBottom: 0, width: '100%' }}>
                        <div style={{ display: 'flex', gap: 8, marginTop: 2, justifyContent: 'flex-start' }}>
                          <input type="file" style={{ display: 'none' }} ref={taskFileInputRef} onChange={handleTaskFileChange} />
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
                                  const displayName = isLink ? att.url : att.name;
                                  return (
                                    <div
                                      key={idx}
                                style={{ background: '#fff', borderRadius: 8, boxShadow: '0 2px 8px #e9ecef', padding: '0.5rem 1.25rem', display: 'flex', alignItems: 'center', gap: 12, minWidth: 180, maxWidth: 320, width: '100%', cursor: 'pointer' }}
                                onClick={() => {
                                  if (isLink && att.url) {
                                    window.open(att.url, '_blank', 'noopener,noreferrer');
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
                                    {isLink && <>&bull; <a href={att.url} target="_blank" rel="noopener noreferrer" style={{ color: color, fontWeight: 600, textDecoration: 'none' }} onClick={e => e.stopPropagation()}>View Link</a></>}
                                        </div>
                                      </div>
                                <button onClick={() => handleRemoveTaskAttachment(idx)} style={{ fontSize: 18, marginLeft: 4, background: 'none', border: 'none', color: '#e74c3c', cursor: 'pointer' }}>×</button>
                                    </div>
                                  );
                                })}
                              </div>
                            )}
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 16 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                          <input
                            type="checkbox"
                            id="allowTaskComments"
                            checked={taskForm.allowComments}
                            onChange={(e) => setTaskForm(prev => ({ ...prev, allowComments: e.target.checked }))}
                            style={{ margin: 0 }}
                          />
                          <label htmlFor="allowTaskComments" style={{ margin: 0, fontSize: 14, fontWeight: 600, color: '#666' }}>
                            Allow comments
                          </label>
                        </div>
                        <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                          <button
                            type="button"
                            className="btn btn-secondary"
                            style={{ borderRadius: 8, padding: '8px 16px', fontSize: 14, fontWeight: 600 }}
                            onClick={() => {
                              handleCancelTaskPost();
                              setTaskFormExpanded(false);
                            }}
                          >
                            Cancel
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
                            disabled={!(taskForm.title.trim() && taskForm.points)}
                          >
                            <i className="ni ni-send" />
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
                              disabled={!(taskForm.title.trim() && taskForm.points)}
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
                                disabled={!(taskForm.title.trim() && taskForm.points)}
                              >
                                Save as Draft
                              </DropdownItem>
                              <DropdownItem 
                                onClick={() => {
                                  setShowScheduleModal(true);
                                }}
                                style={{ 
                                  padding: '8px 16px', 
                                  fontSize: 14, 
                                  color: '#333',
                            cursor: 'pointer'
                          }}
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
                    {tasks.map((task) => (
                      <Card key={task.id} className="mb-4" style={{ borderRadius: 16, boxShadow: '0 2px 8px #324cdd11', border: '1.5px solid #e9ecef', background: '#fff', cursor: 'pointer' }}
                        onClick={() => navigate(`/teacher/task/${task.id}`)}
                      >
                        <CardBody style={{ padding: '1.5rem' }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 16 }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                              <div style={{ width: 40, height: 40, borderRadius: '50%', background: 'linear-gradient(135deg, #f39c12 0%, #e67e22 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontWeight: 700, fontSize: 16 }}>
                                {task.author.charAt(0).toUpperCase()}
                              </div>
                              <div>
                                <div style={{ fontWeight: 700, fontSize: 16, color: '#232b3b' }}>{task.author}</div>
                                <div style={{ fontSize: 13, color: '#8898AA' }}>{formatRelativeTime(task.date)}</div>
                              </div>
                            </div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                              {task.isPinned && (
                                <Badge color="warning" style={{ fontSize: 12, padding: '4px 8px' }}>
                                  <i className="ni ni-pin-3" style={{ marginRight: 4 }} /> Pinned
                                </Badge>
                              )}
                              <UncontrolledDropdown>
                                <DropdownToggle tag="button" style={{ background: 'none', border: 'none', fontSize: 18, color: '#666', cursor: 'pointer' }}>
                                  <i className="ni ni-bold-down" />
                                </DropdownToggle>
                                <DropdownMenu>
                                  <DropdownItem onClick={() => handlePinTask(task.id)}>
                                    <i className="ni ni-pin-3" style={{ marginRight: 8 }} />
                                    {task.isPinned ? 'Unpin' : 'Pin'} Task
                                  </DropdownItem>
                                  <DropdownItem onClick={() => handleEditTask(task.id)}>
                                    <i className="ni ni-ruler-pencil" style={{ marginRight: 8 }} />
                                    Edit
                                  </DropdownItem>
                                  <DropdownItem onClick={() => handleDeleteTask(task.id)}>
                                    <i className="ni ni-fat-remove" style={{ marginRight: 8 }} />
                                    Delete
                                  </DropdownItem>
                                </DropdownMenu>
                              </UncontrolledDropdown>
                            </div>
                          </div>
                          {task.title && (
                            <h5 style={{ fontWeight: 700, fontSize: 18, color: '#232b3b', marginBottom: 12 }}>
                              {task.title}
                            </h5>
                          )}
                          <div style={{ fontSize: 15, color: '#232b3b', lineHeight: 1.6, marginBottom: 16 }}>
                            {task.text}
                          </div>
                          {task.attachments && task.attachments.length > 0 && (
                            <div style={{ marginBottom: 16, display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 16 }}>
                              {task.attachments.map((att, idx) => {
                                const { preview, type, color } = getFileTypeIconOrPreview(att);
                                let url = undefined;
                                if (att.file && (att.file instanceof File || att.file instanceof Blob)) {
                                  url = URL.createObjectURL(att.file);
                                } else if (att.url) {
                                  url = att.url;
                                }
                                const isLink = att.type === "Link" || att.type === "YouTube" || att.type === "Google Drive";
                                const displayName = isLink ? att.url : att.name;
                                return (
                                  <div
                                    key={idx}
                                    style={{ background: '#fff', borderRadius: 8, boxShadow: '0 2px 8px #e9ecef', padding: '0.5rem 1.25rem', display: 'flex', alignItems: 'center', gap: 12, minWidth: 180, maxWidth: 320, width: '100%', cursor: 'pointer' }}
                                    onClick={() => {
                                      if (isLink && att.url) {
                                        window.open(att.url, '_blank', 'noopener,noreferrer');
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
                              <button
                              onClick={() => handleLikeTask(task.id)}
                                style={{ background: 'none', border: 'none', display: 'flex', alignItems: 'center', gap: 6, color: task.isLiked ? '#e74c3c' : '#666', cursor: 'pointer', fontSize: 14, fontWeight: 600 }}
                              >
                                <i className={`ni ${task.isLiked ? 'ni-favourite-28' : 'ni-like-2'}`} />
                                {task.likes > 0 && task.likes}
                              </button>
                              {task.allowComments && (
                                <button
                                  onClick={() => setTaskCommentsOpen(prev => ({ ...prev, [task.id]: !prev[task.id] }))}
                                  style={{ background: 'none', border: 'none', display: 'flex', alignItems: 'center', gap: 6, color: '#666', cursor: 'pointer', fontSize: 14, fontWeight: 600 }}
                                >
                                  <i className="ni ni-chat-round" />
                                  {task.comments ? task.comments.length : 0} Comments
                                </button>
                              )}
                            </div>
                            <div style={{ fontSize: 13, color: '#8898AA' }}>
                              {task.type} • {task.points} pts • Due {task.dueDate}
                            </div>
                          </div>
                          {task.allowComments && taskCommentsOpen[task.id] && (
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
                                            {new Date(comment.date).toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' })}
                                      </div>
                                    </div>
                                        {/* 3-dots menu */}
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
                                  <button
                                    style={{ background: 'none', border: 'none', color: '#525F7F', fontWeight: 500, fontSize: 15, padding: '8px 18px', textAlign: 'left', cursor: 'pointer', borderRadius: 0 }}
                                    onClick={e => {
                                      e.stopPropagation();
                                                  setEditingComment({ [task.id]: idx });
                                                  setEditingCommentText(prev => ({ ...prev, [`${task.id}-${idx}`]: comment.text || '' }));
                                                  setOpenCommentMenu({});
                                    }}
                                  >Edit</button>
                                  <button
                                                style={{ background: 'none', border: 'none', color: '#525F7F', fontWeight: 500, fontSize: 15, padding: '8px 18px', textAlign: 'left', cursor: 'pointer', borderRadius: 0 }}
                                    onClick={e => {
                                      e.stopPropagation();
                                                  handleDeleteComment(task.id, idx);
                                                  setOpenCommentMenu({});
                                    }}
                                  >Delete</button>
                                            </div>
                                          )}
                                        </div>
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
                        <th style={{ fontWeight: 700, color: '#111111', fontSize: '14px' }}>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {students.length === 0 ? (
                        <tr>
                          <td colSpan="5" className="text-center py-4 text-muted">
                            No students enrolled in this class yet.
                          </td>
                        </tr>
                      ) : (
                        students.map((student) => (
                          <tr key={student.id} style={{ minHeight: '32px', height: '36px' }}>
                            <td style={{ paddingTop: '6px', paddingBottom: '6px' }}>
                              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                <img 
                                  src={getAvatarForUser(student)} 
                                  alt={student.name}
                                  style={{ 
                                    width: '40px', 
                                    height: '40px', 
                                    borderRadius: '50%', 
                                    objectFit: 'cover',
                                    border: '2px solid #e9ecef',
                                    boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
                                  }}
                                />
                                <span style={{ fontWeight: 600, color: '#232b3b', fontSize: '14px' }}>{student.name}</span>
                              </div>
                            </td>
                            <td style={{ fontWeight: 500, color: '#232b3b', fontSize: '14px', verticalAlign: 'middle', paddingTop: '6px', paddingBottom: '6px' }}>{student.email}</td>
                            <td style={{ fontWeight: 500, color: '#232b3b', fontSize: '14px', verticalAlign: 'middle', paddingTop: '6px', paddingBottom: '6px' }}>
                              {student.student_num || student.id}
                            </td>
                            <td style={{ fontWeight: 500, color: '#232b3b', fontSize: '14px', verticalAlign: 'middle', paddingTop: '6px', paddingBottom: '6px' }}>
                              {student.joinedDate ? new Date(student.joinedDate).toLocaleString() : ''}
                            </td>
                            <td style={{ verticalAlign: 'middle', paddingTop: '6px', paddingBottom: '6px' }}>
                              <Button color="link" size="sm" className="p-0 mr-2">
                                <i className="ni ni-single-02"></i>
                              </Button>
                              <Button color="link" size="sm" className="p-0 text-danger">
                                <i className="ni ni-fat-remove"></i>
                              </Button>
                            </td>
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
                <div className="d-flex justify-content-between align-items-center mb-3">
                  <h4 className="mb-0">Grades</h4>
                  <Button color="primary" size="sm" style={{ borderRadius: "8px" }} onClick={() => setShowAddGradeModal(true)}>
                    <i className="ni ni-fat-add mr-1"></i> Add Grade
                  </Button>
                </div>
                <Table responsive>
                  <thead>
                    <tr>
                      <th>Student</th>
                      <th>Assignment #1</th>
                      <th>Quiz #1</th>
                      <th>Project #1</th>
                      <th>Average</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {grades.map((grade) => (
                      <tr key={grade.studentId}>
                        <td>{grade.studentName}</td>
                        <td>{grade.assignment1}</td>
                        <td>{grade.quiz1}</td>
                        <td>{grade.project1}</td>
                        <td>
                          <Badge color={grade.average >= 90 ? "success" : grade.average >= 80 ? "primary" : "warning"}>
                            {grade.average.toFixed(1)}
                          </Badge>
                        </td>
                        <td>
                          <Button color="link" size="sm" className="p-0 mr-2">
                            <i className="ni ni-ruler-pencil"></i>
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </Table>
              </CardBody>
            </Card>
          </TabPane>
        </TabContent>
      </div>
      {/* Attachment Preview Modal */}
      <Modal isOpen={previewModalOpen} toggle={() => setPreviewModalOpen(false)} centered size="lg">
        <ModalHeader toggle={() => setPreviewModalOpen(false)}>
          {previewAttachment ? (previewAttachment.name || 'File Preview') : 'Preview'}
        </ModalHeader>
        <ModalBody>
          {previewAttachment && (
            <div>
              {/* Handle images - both from file objects and URLs */}
              {(previewAttachment.file && previewAttachment.file.type.startsWith('image/')) || 
               (previewAttachment.url && ['jpg', 'jpeg', 'png', 'gif', 'webp', 'bmp', 'svg'].includes(previewAttachment.name?.split('.').pop()?.toLowerCase())) ? (
                <img 
                  src={previewAttachment.file ? URL.createObjectURL(previewAttachment.file) : previewAttachment.url} 
                  alt={previewAttachment.name}
                  style={{ maxWidth: '100%', maxHeight: '500px', objectFit: 'contain' }}
                />
              ) : 
              {/* Handle PDFs - both from file objects and URLs */}
              (previewAttachment.file && previewAttachment.file.type === 'application/pdf') || 
              (previewAttachment.url && previewAttachment.name?.toLowerCase().endsWith('.pdf')) ? (
                <div style={{ width: '100%', height: '600px', border: '1px solid #e9ecef', borderRadius: '8px' }}>
                  <iframe
                    src={previewAttachment.file ? `${URL.createObjectURL(previewAttachment.file)}#toolbar=1&navpanes=1&scrollbar=1` : `${previewAttachment.url}#toolbar=1&navpanes=1&scrollbar=1`}
                    style={{ width: '100%', height: '100%', border: 'none', borderRadius: '8px' }}
                    title={previewAttachment.name}
                  />
                </div>
              ) : 
              {/* Handle videos - both from file objects and URLs */}
              (previewAttachment.file && previewAttachment.file.type.startsWith('video/')) || 
              (previewAttachment.url && ['mp4', 'avi', 'mov', 'wmv', 'flv', 'webm'].includes(previewAttachment.name?.split('.').pop()?.toLowerCase())) ? (
                <video 
                  controls 
                  style={{ width: '100%', maxHeight: '600px', borderRadius: '8px' }}
                >
                  <source src={previewAttachment.file ? URL.createObjectURL(previewAttachment.file) : previewAttachment.url} type={
                    previewAttachment.file?.type || 
                    (previewAttachment.name?.toLowerCase().endsWith('.mp4') ? 'video/mp4' :
                     previewAttachment.name?.toLowerCase().endsWith('.avi') ? 'video/x-msvideo' :
                     previewAttachment.name?.toLowerCase().endsWith('.mov') ? 'video/quicktime' :
                     previewAttachment.name?.toLowerCase().endsWith('.wmv') ? 'video/x-ms-wmv' :
                     previewAttachment.name?.toLowerCase().endsWith('.flv') ? 'video/x-flv' :
                     previewAttachment.name?.toLowerCase().endsWith('.webm') ? 'video/webm' :
                     'video/mp4')
                  } />
                  Your browser does not support the video tag.
                </video>
              ) : 
              {/* Handle audio - both from file objects and URLs */}
              (previewAttachment.file && previewAttachment.file.type.startsWith('audio/')) || 
              (previewAttachment.url && ['mp3', 'wav', 'ogg', 'aac', 'flac'].includes(previewAttachment.name?.split('.').pop()?.toLowerCase())) ? (
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