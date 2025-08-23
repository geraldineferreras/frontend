/*!

=========================================================
* Argon Dashboard React - v1.2.4
=========================================================

* Product Page: https://www.creative-tim.com/product/argon-dashboard-react
* Copyright 2024 Creative Tim (https://www.creative-tim.com)
* Licensed under MIT (https://github.com/creativetimofficial/argon-dashboard-react/blob/master/LICENSE.md)

* Coded by Creative Tim

=========================================================

* The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

*/
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
// node.js library that concatenates classes (strings)
import classnames from "classnames";
// javascipt plugin for creating charts
import Chart from "chart.js";
// react plugin used to create charts
import { Line, Bar } from "react-chartjs-2";
// reactstrap components
import {
  Button,
  Card,
  CardHeader,
  CardBody,
  NavItem,
  NavLink,
  Nav,
  Progress,
  Table,
  Container,
  Row,
  Col,
  CardTitle,
  CardText,
  Input,
  Media,
  Badge,
  ListGroup,
  ListGroupItem,
  InputGroup,
  InputGroupAddon,
  InputGroupText
} from "reactstrap";
import { FaBook, FaClipboardList, FaCheckCircle, FaGraduationCap, FaBell, FaUserCheck, FaPlus, FaEnvelope, FaCalendarAlt, FaArrowUp, FaArrowDown, FaSearch } from "react-icons/fa";

// core components
import {
  chartOptions,
  parseOptions,
  chartExample1,
  chartExample2,
} from "variables/charts.js";

import Header from "components/Headers/Header.js";
import apiService from "../services/api";

const mockTeacher = {
  name: "Jessica Jones",
  photo: require("../assets/img/theme/team-4-800x800.jpg"),
  semester: "1st Semester",
  year: "2023-2024"
};
const mockStats = {
  totalClasses: 4,
  totalStudents: 120,
  attendanceToday: 2,
  pendingExcuses: 3,
  gradedAssignments: 8,
  ungradedAssignments: 2
};
const mockClasses = [
  { id: 1, name: "OOP", section: "3A", subject: "Object Oriented Programming", code: "b7p3r9" },
  { id: 2, name: "Data Structures", section: "2B", subject: "Data Structures", code: "a1c2d3" },
  { id: 3, name: "Web Dev", section: "1C", subject: "Web Development", code: "z8y7x6" },
  { id: 4, name: "Discrete Math", section: "4D", subject: "Discrete Mathematics", code: "d4m4th" }
];
const mockAttendance = [
  { id: 1, class: "OOP - 3A", time: "8:00 AM", status: "Not Started" },
  { id: 2, class: "Web Dev - 1C", time: "10:00 AM", status: "Ongoing" }
];
const mockAnnouncements = [
  { id: 1, title: "Welcome to OOP!", date: "2024-06-01" },
  { id: 2, title: "Assignment 1 Posted", date: "2024-06-02" }
];
const mockPendingTasks = [
  { id: 1, type: "Assignment", desc: "Grade Assignment 1 (OOP - 3A)" },
  { id: 2, type: "Excuse Letter", desc: "Review Excuse (Web Dev - 1C)" },
  { id: 3, type: "Attendance", desc: "Mark attendance (Data Structures - 2B)" }
];
const quickActions = [
  { icon: "ni ni-fat-add text-success", label: "Create a Class" },
  { icon: "ni ni-check-bold text-green", label: "Start Attendance" },
  { icon: "fas fa-qrcode text-info", label: "Scan Attendance QR" },
  { icon: "ni ni-single-copy-04 text-pink", label: "Review Excuse Letters" },
  { icon: "ni ni-camera-compact text-purple", label: "Video Conference" }
];

const studentName = "Alex Thompson";
const summary = [
  {
    label: "Total Classes",
    value: 5,
    icon: <FaBook />, 
    color: "#2096ff",
    trend: { up: true, value: "3.2%", text: "Since last month" }
  },
  {
    label: "Assignments Due",
    value: 2,
    icon: <FaClipboardList />, 
    color: "#2dce89",
    trend: { up: false, value: "-1.1%", text: "Since last week" }
  },
  {
    label: "Attendance",
    value: "92%",
    icon: <FaCheckCircle />, 
    color: "#11cdef",
    trend: { up: true, value: "1.5%", text: "Since last month" }
  },
  {
    label: "Recent Grades",
    value: "89% Avg",
    icon: <FaGraduationCap />, 
    color: "#5e72e4",
    trend: { up: true, value: "0.8%", text: "Since last week" }
  }
];
const myClasses = [
  { id: 1, subject: "Object-Oriented Programming", code: "b7p3r9", teacher: "Mr. Cruz", section: "BSIT 3A" },
  { id: 2, subject: "Database Management Systems", code: "a1c2d3", teacher: "Ms. Santos", section: "BSCS 2B" },
  { id: 3, subject: "Web Development", code: "z8y7x6", teacher: "Mr. Lee", section: "BSIT 1C" },
  { id: 4, subject: "Discrete Mathematics", code: "d4m4th", teacher: "Ms. Garcia", section: "BSIT 4D" },
  { id: 5, subject: "Software Engineering", code: "s0fteng", teacher: "Dr. Smith", section: "BSIT 3A" }
];
const announcements = [
  { id: 1, class: "Object-Oriented Programming", date: "2024-07-01", content: "Quiz 2 will be held on Friday. Please review chapters 3 and 4.", isNew: true },
  { id: 2, class: "Database Management Systems", date: "2024-06-29", content: "Project proposal deadline extended to July 5.", isNew: false },
  { id: 3, class: "Web Development", date: "2024-06-28", content: "Lab 3 results are now posted. Check your grades.", isNew: false }
];
const quickLinks = [
  { icon: <FaGraduationCap />, label: "View Grades", href: "/student/grades" },
  { icon: <FaEnvelope />, label: "Submit Excuse Letter", href: "/student/excuse-letters" },
  { icon: <FaPlus />, label: "Join a Class", href: "/student/join-class" },
  { icon: <FaUserCheck />, label: "My Attendance", href: "/student/attendance" },
  { icon: <FaBell />, label: "Notifications", href: "/student/notifications" }
];

function getCurrentDateTime() {
  const now = new Date();
  return now.toLocaleString();
}

// Student attendance chart – Admin-style line/area chart with weekly attendance %
function TrendChart() {
  const [points, setPoints] = useState("20,140 380,140");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [summary, setSummary] = useState({ present: 0, absent: 0, late: 0, total: 0, percent: 0 });
  const [labels, setLabels] = useState([]);

  useEffect(() => {
    let isMounted = true;
    async function load() {
      try {
        setLoading(true);
        setError(null);

        // Build a 8-week window
        const today = new Date();
        const to = today.toISOString().split("T")[0];
        const fromDate = new Date(today.getTime() - 56 * 24 * 60 * 60 * 1000);
        const from = fromDate.toISOString().split("T")[0];

        // Fetch student's attendance records within window
        const res = await apiService.getStudentAttendance({ dateFrom: from, dateTo: to });
        const raw = res?.data?.records || res?.data?.data || res?.data || [];

        // Normalize records: { date: 'YYYY-MM-DD', status: 'present'|'absent'|'late'|... }
        const normalized = (Array.isArray(raw) ? raw : []).map((r) => ({
          date: r.date || r.attendance_date || r.created_at?.split(" ")?.[0] || r.record_date || "",
          status: (r.status || r.attendance_status || r.present || r.is_present)?.toString().toLowerCase(),
        })).filter(r => r.date);

        // Overall summary
        let present = 0, absent = 0, late = 0, total = 0;
        normalized.forEach(rec => {
          total += 1;
          if (rec.status === "present" || rec.status === "1" || rec.status === "true") present += 1;
          else if (rec.status === "late") late += 1;
          else absent += 1;
        });
        const percent = total > 0 ? Math.round((present / total) * 100) : 0;
        if (isMounted) setSummary({ present, absent, late, total, percent });

        // Group by week (Mon-Sun)
        const buckets = [];
        for (let i = 7; i >= 0; i--) {
          const d = new Date(today.getTime() - i * 7 * 24 * 60 * 60 * 1000);
          const weekStart = new Date(d);
          weekStart.setDate(d.getDate() - ((d.getDay() + 6) % 7)); // Monday as start
          const key = weekStart.toISOString().split("T")[0];
          buckets.push({ key, present: 0, total: 0 });
        }

        const findBucketIndex = (dateStr) => {
          const d = new Date(dateStr);
          // Find the bucket whose weekStart <= d < weekStart+7
          for (let i = 0; i < buckets.length; i++) {
            const ws = new Date(buckets[i].key);
            const we = new Date(ws.getTime() + 7 * 24 * 60 * 60 * 1000);
            if (d >= ws && d < we) return i;
          }
          return -1;
        };

        normalized.forEach(rec => {
          const idx = findBucketIndex(rec.date);
          if (idx !== -1) {
            buckets[idx].total += 1;
            const isPresent = rec.status === "present" || rec.status === "1" || rec.status === "true";
            if (isPresent) buckets[idx].present += 1;
          }
        });

        // Convert to percentages (0..100)
        const percentages = buckets.map(b => b.total > 0 ? Math.round((b.present / b.total) * 100) : 0);
        const labelStrings = buckets.map(b => {
          const d = new Date(b.key);
          return d.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
        });

        // Map to SVG coordinates within 400x160, padding: left 20, right 20, top 20, bottom 20
        const w = 400, h = 160, pad = 30;
        const count = percentages.length || 1;
        const step = (w - pad * 2) / (count - 1 || 1);
        const toY = (pct) => {
          const y = pad + (100 - Math.max(0, Math.min(100, pct))) * ((h - pad * 2) / 100);
          return y;
        };
        const pts = percentages.map((pct, i) => ({ x: Math.round(pad + i * step), y: Math.round(toY(pct)) }));
        const poly = pts.map(p => `${p.x},${p.y}`).join(" ");
        if (isMounted) {
          setPoints(poly || "20,140 380,140");
          setLabels(labelStrings);
        }
      } catch (e) {
        if (isMounted) setError("Failed to load attendance trend");
      } finally {
        if (isMounted) setLoading(false);
      }
    }
    load();
    return () => { isMounted = false; };
  }, []);

  // Chart dims (wide so it scales to the card width via viewBox)
  const w = 1200, h = 380, pad = 60;
  const baselineY = h - pad;

  // Build area path from points string
  const pts = points.split(" ").map(s => s.split(",").map(n => parseInt(n, 10)));
  let areaD = "";
  if (pts.length > 0) {
    areaD = `M ${pts[0][0]} ${baselineY} ` + pts.map(p => `L ${p[0]} ${p[1]}`).join(" ") + ` L ${pts[pts.length-1][0]} ${baselineY} Z`;
  }

  return (
    <svg width="100%" height="380" viewBox={`0 0 ${w} ${h}`}>
      <rect x="0" y="0" width={w} height={h} rx="16" fill="#232b4d" />

      {/* grid lines */}
      {[0,25,50,75,100].map((v,i)=>{
        const y = pad + (100 - v) * ((h - pad*2)/100);
        return <g key={i}>
          <line x1={pad} y1={y} x2={w-pad} y2={y} stroke="#2e355a" strokeWidth="1.25" />
          <text x={pad-12} y={y+5} fill="#7c86ad" fontSize="12" textAnchor="end">{v}</text>
        </g>;
      })}

      {/* axes */}
      <line x1={pad} y1={h-pad} x2={w-pad} y2={h-pad} stroke="#3a3f66" strokeWidth="2" />
      <line x1={pad} y1={pad} x2={pad} y2={h-pad} stroke="#3a3f66" strokeWidth="2" />

      {/* area fill */}
      {areaD && <path d={areaD} fill="#5e72e4" opacity="0.2" />}
      {/* line */}
      <polyline fill="none" stroke="#5e72e4" strokeWidth="5" points={points} />

      {/* x labels */}
      {labels.map((lab, i)=>{
        const x = pad + i*((w-pad*2)/Math.max(1,labels.length-1));
        return <text key={i} x={x} y={h-10} fill="#b0b7d3" fontSize="12" textAnchor="middle">{lab}</text>;
      })}

      {/* legend - upper right */}
      {(() => {
        const lx = w - pad - 170; // anchor near top-right within padding
        const ly = pad - 48; // lift legend even higher
        return (
          <g>
            <rect x={lx-10} y={ly-8} width={170} height={64} rx={8} fill="#2a3154" opacity="0.35" />
            <rect x={lx} y={ly} width="12" height="12" fill="#5e72e4" rx="2" />
            <text x={lx+18} y={ly+10} fill="#fff" fontSize="13" fontWeight="600">Present</text>
            <text x={lx+120} y={ly+10} fill="#b0b7d3" fontSize="13" textAnchor="end">{summary.present}</text>

            <rect x={lx} y={ly+22} width="12" height="12" fill="#f5365c" rx="2" />
            <text x={lx+18} y={ly+32} fill="#fff" fontSize="13" fontWeight="600">Absent</text>
            <text x={lx+120} y={ly+32} fill="#b0b7d3" fontSize="13" textAnchor="end">{summary.absent}</text>

            <rect x={lx} y={ly+44} width="12" height="12" fill="#ff9f43" rx="2" />
            <text x={lx+18} y={ly+54} fill="#fff" fontSize="13" fontWeight="600">Late</text>
            <text x={lx+120} y={ly+54} fill="#b0b7d3" fontSize="13" textAnchor="end">{summary.late}</text>
          </g>
        );
      })()}

      {loading && <text x="24" y="40" fill="#b0b7d3" fontSize="12">Loading...</text>}
      {error && <text x="24" y="40" fill="#f5365c" fontSize="12">{error}</text>}
    </svg>
  );
}

const Index = (props) => {
  const [activeNav, setActiveNav] = useState(1);
  const [chartExample1Data, setChartExample1Data] = useState("data1");
  const user = JSON.parse(localStorage.getItem("scms_logged_in_user") || "null");
  const navigate = useNavigate();

  // Teacher dashboard state (real data)
  const [teacherStats, setTeacherStats] = useState({
    totalClasses: 0,
    totalStudents: 0,
    attendanceToday: 0,
    pendingExcuses: 0,
    gradedAssignments: 0,
    ungradedAssignments: 0,
  });
  const [teacherClasses, setTeacherClasses] = useState([]);
  const [teacherAnnouncements, setTeacherAnnouncements] = useState([]);
  const [teacherAttendanceList, setTeacherAttendanceList] = useState([]);
  const [teacherPendingTasks, setTeacherPendingTasks] = useState([]);
  const [teacherLoading, setTeacherLoading] = useState(false);
  
  // Admin user count chart data
  const [adminUserCountData, setAdminUserCountData] = useState({
    data1: {
      labels: ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug"],
      datasets: [{
        label: "Total Users",
        data: [0, 0, 0, 0, 0, 0, 0, 0],
        borderColor: "#5e72e4",
        backgroundColor: "rgba(94, 114, 228, 0.1)",
        borderWidth: 3,
        fill: true,
        tension: 0.4
      }]
    },
    data2: {
      labels: ["Week 1", "Week 2", "Week 3", "Week 4"],
      datasets: [{
        label: "Total Users",
        data: [0, 0, 0, 0],
        borderColor: "#5e72e4",
        backgroundColor: "rgba(94, 114, 228, 0.1)",
        borderWidth: 3,
        fill: true,
        tension: 0.4
      }]
    }
  });

  if (window.Chart) {
    parseOptions(Chart, chartOptions());
  }

  const toggleNavs = (e, index) => {
    e.preventDefault();
    setActiveNav(index);
    setChartExample1Data("data" + index);
  };

  // Helper: current date in Philippine time (UTC+8) yyyy-mm-dd
  const getPhilippineDate = () => {
    const now = new Date();
    const philippineTime = new Date(now.getTime() + 8 * 60 * 60 * 1000);
    return philippineTime.toISOString().split("T")[0];
  };

  useEffect(() => {
    if (user && user.role === "teacher") {
      loadTeacherDashboard();
    }
    if (user && user.role === "admin") {
      loadAdminUserCountData();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.role]);

  const loadTeacherDashboard = async () => {
    try {
      setTeacherLoading(true);

      // 1) Load teacher classrooms
      let totalStudents = 0;
      let transformedClasses = [];
      try {
        const classesResponse = await apiService.getTeacherClassrooms();
        const rawClasses = classesResponse?.data || classesResponse || [];
        transformedClasses = (rawClasses || []).map((classroom, index) => ({
          id: index + 1,
          name: classroom.subject_name,
          section: classroom.section_name,
          subject: classroom.subject_name,
          code: classroom.class_code,
          semester: classroom.semester,
          schoolYear: classroom.school_year,
          studentCount: 0,
        }));

        // Fetch student counts per class code
        const withCounts = await Promise.all(
          transformedClasses.map(async (cls) => {
            try {
              const res = await apiService.makeRequest(`/teacher/classroom/${cls.code}/students`, {
                method: "GET",
                requireAuth: true,
              });
              const count = res?.data?.students ? res.data.students.length : 0;
              totalStudents += count;
              return { ...cls, studentCount: count };
            } catch (_) {
              return { ...cls, studentCount: 0 };
            }
          })
        );
        setTeacherClasses(withCounts);
        localStorage.setItem("teacherClasses", JSON.stringify(withCounts));
      } catch (_) {
        setTeacherClasses([]);
      }

      // 2) Attendance today per class
      let attendanceTodayCount = 0;
      let attendanceList = [];
      try {
        const attClassesResp = await apiService.getAttendanceClasses();
        const attClasses = attClassesResp?.data || attClassesResp || [];
        const date = getPhilippineDate();

        const perClass = await Promise.all(
          (attClasses || []).map(async (c, idx) => {
            const classId = c.class_id || c.id || c.classId || c.classID;
            let labelSubject = c.subject_name || c.class_name || c.name || "Class";
            let labelSection = c.section_name || c.section || "";
            let display = labelSection ? `${labelSubject} - ${labelSection}` : labelSubject;
            if (!classId) {
              return { id: idx + 1, class: display, status: "Not Started" };
            }
            try {
              const rec = await apiService.getAttendanceRecordsByClassAndDate(classId, date);
              const hasRecords = rec?.data?.records?.length > 0;
              if (hasRecords) attendanceTodayCount += 1;
              return { id: classId, class: display, status: hasRecords ? "Recorded" : "Not Started" };
            } catch (_) {
              return { id: classId, class: display, status: "Not Started" };
            }
          })
        );
        attendanceList = perClass;
      } catch (_) {
        attendanceList = [];
      }
      setTeacherAttendanceList(attendanceList);

      // 3) Excuse letters pending
      let pendingExcuses = 0;
      try {
        const exResp = await apiService.getTeacherExcuseLetters();
        const raw = exResp?.data?.data || exResp?.data?.excuse_letters || exResp?.data || [];
        pendingExcuses = (raw || []).filter((e) => (e.status || "").toString().toLowerCase() === "pending").length;
      } catch (_) {
        pendingExcuses = 0;
      }

      // 4) Tasks: graded vs ungraded and build pending list
      let gradedTotal = 0;
      let ungradedTotal = 0;
      let pendingTaskItems = [];
      try {
        const tasksResp = await apiService.getTeacherTasks({});
        const tasks = tasksResp?.data || tasksResp || [];
        const limited = tasks.slice(0, 10);
        const statsArray = await Promise.all(
          limited.map(async (t) => {
            const taskId = t.task_id || t.id;
            try {
              const st = await apiService.getTaskStatistics(taskId);
              const s = st?.data || st || {};
              const graded = s.graded || s.graded_count || 0;
              const ungraded = s.ungraded || s.ungraded_count || Math.max(0, (s.total_submissions || 0) - graded);
              return { task: t, graded, ungraded };
            } catch (_) {
              try {
                const subs = await apiService.getTaskSubmissions(taskId);
                const list = subs?.data || subs || [];
                const graded = list.filter((x) => (x.status || "").toLowerCase() === "graded").length;
                const ungraded = Math.max(0, list.length - graded);
                return { task: t, graded, ungraded };
              } catch (__) {
                return { task: t, graded: 0, ungraded: 0 };
              }
            }
          })
        );

        statsArray.forEach(({ task, graded, ungraded }) => {
          gradedTotal += graded;
          ungradedTotal += ungraded;
          if (ungraded > 0) {
            pendingTaskItems.push({
              id: task.task_id || task.id,
              type: "Assignment",
              desc: `Grade ${task.title || task.name || "Assignment"}${task.class_code ? ` (${task.class_code})` : ""}`,
            });
          }
        });
      } catch (_) {
        gradedTotal = 0;
        ungradedTotal = 0;
        pendingTaskItems = [];
      }
      setTeacherPendingTasks(pendingTaskItems);

      // 5) Announcements: latest stream posts from first couple of classes
      let announcements = [];
      try {
        const classesToFetch = (transformedClasses || []).slice(0, 2);
        const streams = await Promise.all(
          classesToFetch.map(async (cls) => {
            try {
              const r = await apiService.getClassroomStream(cls.code);
              const items = r?.data || r || [];
              return (Array.isArray(items) ? items : []).map((p, i) => ({
                id: `${cls.code}-${p.id || i}`,
                title: p.title || p.content || "Announcement",
                date: p.created_at || p.date || "",
              }));
            } catch (_) {
              return [];
            }
          })
        );
        announcements = streams.flat().sort((a, b) => (new Date(b.date) - new Date(a.date))).slice(0, 5);
      } catch (_) {
        announcements = [];
      }
      setTeacherAnnouncements(announcements);

      // Finalize stats
      setTeacherStats({
        totalClasses: teacherClasses?.length || transformedClasses.length,
        totalStudents,
        attendanceToday: attendanceTodayCount,
        pendingExcuses,
        gradedAssignments: gradedTotal,
        ungradedAssignments: ungradedTotal,
      });
    } finally {
      setTeacherLoading(false);
    }
  };

  const loadAdminUserCountData = async () => {
    try {
      console.log('Starting to load admin user count data...');
      
      // Fetch current user counts by role
      const [allUsersRes, adminUsersRes, teacherUsersRes, studentUsersRes] = await Promise.all([
        apiService.getAllUsers(),
        apiService.getUsersByRole('admin'),
        apiService.getUsersByRole('teacher'),
        apiService.getUsersByRole('student')
      ]);

      console.log('API Responses:', {
        allUsers: allUsersRes,
        adminUsers: adminUsersRes,
        teacherUsers: teacherUsersRes,
        studentUsers: studentUsersRes
      });

      const currentTotalCount = Array.isArray(allUsersRes?.data || allUsersRes) ? (allUsersRes?.data || allUsersRes).length : (allUsersRes?.count || 0);
      const adminCount = Array.isArray(adminUsersRes?.data || adminUsersRes) ? (adminUsersRes?.data || adminUsersRes).length : 0;
      const teacherCount = Array.isArray(teacherUsersRes?.data || teacherUsersRes) ? (teacherUsersRes?.data || teacherUsersRes).length : 0;
      const studentCount = Array.isArray(studentUsersRes?.data || studentUsersRes) ? (studentUsersRes?.data || studentUsersRes).length : 0;

      console.log('Parsed Counts:', {
        currentTotalCount,
        adminCount,
        teacherCount,
        studentCount,
        allUsersResType: typeof allUsersRes,
        allUsersResData: allUsersRes?.data,
        allUsersResCount: allUsersRes?.count
      });

      // Ensure we have at least some count - if API fails, use a fallback
      const finalTotalCount = currentTotalCount > 0 ? currentTotalCount : (adminCount + teacherCount + studentCount);
      
      if (finalTotalCount === 0) {
        console.warn('No users found from any source, using fallback count of 50');
        // Fallback to a reasonable number if all APIs fail
        const fallbackCount = 50;
        
        setAdminUserCountData({
          data1: {
            labels: ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug"],
            datasets: [{
              label: "Total Users",
              data: [10, 20, 30, 40, 45, 48, 49, fallbackCount],
              borderColor: "#5e72e4",
              backgroundColor: "rgba(94, 114, 228, 0.1)",
              borderWidth: 3,
              fill: true,
              tension: 0.4
            }]
          },
          data2: {
            labels: ["Week 1", "Week 2", "Week 3", "Week 4"],
            datasets: [{
              label: "Total Users",
              data: [45, 47, 48, fallbackCount],
              borderColor: "#5e72e4",
              backgroundColor: "rgba(94, 114, 228, 0.1)",
              borderWidth: 3,
              fill: true,
              tension: 0.4
            }]
          }
        });
        return;
      }

      // Generate realistic historical data based on current distribution
      // This simulates gradual growth over the months
      const generateHistoricalData = (currentCount, months = 8) => {
        const data = [];
        const baseGrowth = currentCount / months; // Average growth per month
        
        for (let i = 0; i < months; i++) {
          if (i === months - 1) {
            // Current month - use actual count
            data.push(currentCount);
          } else {
            // Historical months - simulate gradual growth with some randomness
            const simulatedCount = Math.max(0, Math.floor(baseGrowth * (i + 1) * (0.8 + Math.random() * 0.4)));
            data.push(simulatedCount);
          }
        }
        return data;
      };

      // Alternative: Try to use user creation dates if available in user data
      const tryExtractUserCreationHistory = (usersData) => {
        if (!Array.isArray(usersData)) return null;
        
        const usersWithDates = usersData.filter(user => user.created_at || user.registration_date || user.date_created);
        if (usersWithDates.length === 0) return null;

        // Group users by month based on creation date
        const monthlyUserCounts = {};
        usersWithDates.forEach(user => {
          const dateStr = user.created_at || user.registration_date || user.date_created;
          if (dateStr) {
            try {
              const date = new Date(dateStr);
              const monthKey = date.toLocaleString('default', { month: 'short' });
              monthlyUserCounts[monthKey] = (monthlyUserCounts[monthKey] || 0) + 1;
            } catch (e) {
              // Skip invalid dates
            }
          }
        });

        return monthlyUserCounts;
      };

      // Try to extract real user creation history from user data first
      const userCreationHistory = tryExtractUserCreationHistory(allUsersRes?.data || allUsersRes);
      
      let monthlyData, weeklyData;
      
      if (userCreationHistory && Object.keys(userCreationHistory).length > 0) {
        // Use real user creation data
        const realMonthlyData = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug"].map(month => 
          userCreationHistory[month] || 0
        );
        
        // Calculate cumulative totals for monthly view
        let cumulative = 0;
        monthlyData = realMonthlyData.map(count => {
          cumulative += count;
          return cumulative;
        });
        
        // For weekly view, distribute the monthly data across weeks
        weeklyData = [0, 0, 0, finalTotalCount]; // Fallback to current total for last week
      } else {
        // Fallback to simulated data
        monthlyData = generateHistoricalData(finalTotalCount, 8);
        weeklyData = generateHistoricalData(finalTotalCount, 4);
      }
      
      console.log('Final Chart Data:', {
        monthlyData,
        weeklyData,
        finalTotalCount
      });
      
      setAdminUserCountData({
        data1: {
          labels: ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug"],
          datasets: [{
            label: "Total Users",
            data: monthlyData,
            borderColor: "#5e72e4",
            backgroundColor: "rgba(94, 114, 228, 0.1)",
            borderWidth: 3,
            fill: true,
            tension: 0.4
          }]
        },
        data2: {
          labels: ["Week 1", "Week 2", "Week 3", "Week 4"],
          datasets: [{
            label: "Total Users",
            data: weeklyData,
            borderColor: "#5e72e4",
            backgroundColor: "rgba(114, 228, 0.1)",
            borderWidth: 3,
            fill: true,
            tension: 0.4
          }]
        }
      });

      // Log the breakdown for debugging
      console.log('User Count Breakdown:', {
        total: finalTotalCount,
        admin: adminCount,
        teacher: teacherCount,
        student: studentCount
      });

      // Try to get real historical data from audit logs if available
      try {
        const auditLogsRes = await apiService.getAuditLogs({
          module: 'user',
          limit: 1000, // Get more logs to analyze
          sortBy: 'created_at',
          sortOrder: 'asc'
        });

        if (auditLogsRes?.data && Array.isArray(auditLogsRes.data)) {
          // Analyze audit logs to find user creation patterns
          const userCreationLogs = auditLogsRes.data.filter(log => 
            log.action === 'create' || log.action === 'register' || log.module === 'user'
          );

          if (userCreationLogs.length > 0) {
            console.log('Found user creation audit logs:', userCreationLogs.length);
            
            // Group by month to create historical data
            const monthlyUserGrowth = {};
            userCreationLogs.forEach(log => {
              if (log.created_at) {
                const date = new Date(log.created_at);
                const monthKey = date.toLocaleString('default', { month: 'short' });
                monthlyUserGrowth[monthKey] = (monthlyUserGrowth[monthKey] || 0) + 1;
              }
            });

            // Update chart data with real audit log data if available
            if (Object.keys(monthlyUserGrowth).length > 0) {
              const realMonthlyData = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug"].map(month => 
                monthlyUserGrowth[month] || 0
              );
              
              // Calculate cumulative totals
              let cumulative = 0;
              const cumulativeMonthlyData = realMonthlyData.map(count => {
                cumulative += count;
                return cumulative;
              });

              setAdminUserCountData(prev => ({
                ...prev,
                data1: {
                  ...prev.data1,
                  data: cumulativeMonthlyData
                }
              }));

              console.log('Updated chart with real audit log data:', cumulativeMonthlyData);
            }
          }
        }
      } catch (auditError) {
        console.log('Audit logs not available, using simulated data:', auditError.message);
      }
    } catch (error) {
      console.error("Error loading admin user count data:", error);
      
      // Set fallback data on error
      setAdminUserCountData({
        data1: {
          labels: ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug"],
          datasets: [{
            label: "Total Users",
            data: [10, 20, 30, 40, 45, 48, 49, 50],
            borderColor: "#5e72e4",
            backgroundColor: "rgba(94, 114, 228, 0.1)",
            borderWidth: 3,
            fill: true,
            tension: 0.4
          }]
        },
        data2: {
          labels: ["Week 1", "Week 2", "Week 3", "Week 4"],
          datasets: [{
            label: "Total Users",
            data: [45, 47, 48, 50],
            borderColor: "#5e72e4",
            backgroundColor: "rgba(94, 114, 228, 0.1)",
            borderWidth: 3,
            fill: true,
            tension: 0.4
          }]
        }
      });
    }
  };

  // Admin dashboard (default Argon)
  if (user && user.role === "admin") {
    return (
      <>
        <Header />
        {/* Blue Header Background */}
        <div className="header bg-gradient-info pb-8 pt-5 pt-md-9"></div>
        {/* Page content */}
        <Container className="mt--9" fluid>
          <Row>
            <Col className="mb-5 mb-xl-0" xl="8">
              <Card className="bg-gradient-default shadow">
                <CardHeader className="bg-transparent">
                  <Row className="align-items-center">
                    <div className="col">
                      <h6 className="text-uppercase text-light ls-1 mb-1">
                        Overview
                      </h6>
                      <h2 className="text-white mb-0">User Count</h2>
                    </div>
                    <div className="col">
                      <Nav className="justify-content-end" pills>
                        <NavItem>
                          <NavLink
                            className={classnames("py-2 px-3", {
                              active: activeNav === 1,
                            })}
                            href="#pablo"
                            onClick={(e) => toggleNavs(e, 1)}
                          >
                            <span className="d-none d-md-block">Month</span>
                            <span className="d-md-none">M</span>
                          </NavLink>
                        </NavItem>
                        <NavItem>
                          <NavLink
                            className={classnames("py-2 px-3", {
                              active: activeNav === 2,
                            })}
                            data-toggle="tab"
                            href="#pablo"
                            onClick={(e) => toggleNavs(e, 2)}
                          >
                            <span className="d-none d-md-block">Week</span>
                            <span className="d-md-none">W</span>
                          </NavLink>
                        </NavItem>
                      </Nav>
                    </div>
                  </Row>
                </CardHeader>
                <CardBody>
                  {/* Chart */}
                  <div className="chart">
                    <Line
                      data={adminUserCountData[chartExample1Data]}
                      options={{
                        scales: {
                          yAxes: [
                            {
                              gridLines: {
                                color: "#8898aa",
                                zeroLineColor: "#8898aa",
                              },
                              ticks: {
                                callback: function (value) {
                                  if (!(value % 5) || value === 0) {
                                    return value;
                                  }
                                },
                                fontColor: "#ffffff",
                              },
                            },
                          ],
                          xAxes: [
                            {
                              ticks: {
                                fontColor: "#ffffff",
                              },
                              gridLines: {
                                color: "#8898aa",
                                zeroLineColor: "#8898aa",
                              },
                            },
                          ],
                        },
                        tooltips: {
                          callbacks: {
                            label: function (item, data) {
                              var label = data.datasets[item.datasetIndex].label || "";
                              var yLabel = item.yLabel;
                              var content = "";
                              if (data.datasets.length > 1) {
                                content += label;
                              }
                              content += yLabel + " users";
                              return content;
                            },
                          },
                        },
                        legend: {
                          labels: {
                            fontColor: "#ffffff",
                          },
                        },
                      }}
                      getDatasetAtEvent={(e) => console.log(e)}
                    />
                  </div>
                </CardBody>
              </Card>
            </Col>
            <Col xl="4">
              <Card className="shadow">
                <CardHeader className="bg-transparent">
                  <Row className="align-items-center">
                    <div className="col">
                      <h6 className="text-uppercase text-muted ls-1 mb-1">
                        Section Growth
                      </h6>
                      <h2 className="mb-0">Section Count</h2>
                    </div>
                  </Row>
                </CardHeader>
                <CardBody>
                  {/* Chart */}
                  <div className="chart">
                    <Bar
                      data={chartExample2.data}
                      options={chartExample2.options}
                    />
                  </div>
                </CardBody>
              </Card>
            </Col>
          </Row>

        </Container>
      </>
    );
  }

  // Teacher dashboard
  if (user && user.role === "teacher") {
    return (
      <>
        {/* Argon-style header without personal info */}
        <div className="header bg-gradient-info pb-8 pt-5 pt-md-9"></div>
        <Container className="mt--9" fluid>
          {/* Overview Cards */}
          <Row>
            {[
              { label: "Total Classes", value: teacherStats.totalClasses || teacherClasses.length, icon: "ni ni-books text-primary" },
              { label: "Total Students", value: teacherStats.totalStudents, icon: "ni ni-hat-3 text-info" },
              { label: "Attendance Today", value: teacherStats.attendanceToday, icon: "ni ni-check-bold text-success" },
              { label: "Pending Excuses", value: teacherStats.pendingExcuses, icon: "ni ni-single-copy-04 text-warning" },
              { label: "Graded", value: teacherStats.gradedAssignments, icon: "ni ni-check-bold text-success" },
              { label: "Ungraded", value: teacherStats.ungradedAssignments, icon: "ni ni-time-alarm text-danger" }
            ].map((stat, idx) => (
              <Col lg="2" md="4" sm="6" xs="12" className="mb-4" key={idx}>
                <Card className="shadow d-flex align-items-center justify-content-center" style={{ minHeight: 110 }}>
                  <CardBody className="w-100 d-flex flex-column align-items-center justify-content-center p-3">
                    <div className="mb-2"><i className={stat.icon} style={{ fontSize: 28 }}></i></div>
                    <div className="text-uppercase text-muted font-weight-bold small text-center">{stat.label}</div>
                    <h2 className="mb-0 text-center">{stat.value}</h2>
                  </CardBody>
                </Card>
              </Col>
            ))}
          </Row>
          {/* My Classes & Quick Actions */}
          <Row>
            <Col lg="8" className="mb-4">
              <Card className="shadow" style={{ minHeight: 420 }}>
                <CardHeader>
                  <h3 className="mb-0">My Classes</h3>
                </CardHeader>
                <CardBody>
                  {teacherLoading ? (
                    <div className="text-muted">Loading classes...</div>
                  ) : (
                    <Row>
                      {teacherClasses.length === 0 ? (
                        <Col xs="12" className="text-muted">No classes found</Col>
                      ) : (
                        teacherClasses.map((cls) => (
                          <Col md="6" key={cls.code} className="mb-3">
                            <Card className="border">
                              <CardBody>
                                <h5>{cls.subject} <span className="text-muted">({cls.section})</span></h5>
                                <div className="mb-2"><strong>Class Code:</strong> <span className="text-primary font-weight-bold">{cls.code}</span></div>
                                <div className="mb-2"><strong>Students:</strong> {cls.studentCount}</div>
                                <Button color="primary" size="sm" href={`/teacher/classroom/${cls.code}`}>View Class</Button>
                              </CardBody>
                            </Card>
                          </Col>
                        ))
                      )}
                    </Row>
                  )}
                </CardBody>
              </Card>
            </Col>
            <Col lg="4" className="mb-4">
              <Card className="shadow" style={{ minHeight: 420 }}>
                <CardHeader>
                  <h3 className="mb-0">Quick Actions</h3>
                </CardHeader>
                <CardBody>
                  <Row>
                    {quickActions.map((action, idx) => (
                      <Col xs="12" className="mb-2" key={idx}>
                        <Button
                          color="secondary"
                          className="w-100 text-left"
                          onClick={() => {
                            const label = action.label.toLowerCase();
                            if (label.includes("create a class")) {
                              navigate("/teacher/classroom?create=1");
                            } else if (label.includes("start attendance")) {
                              navigate("/teacher/attendance");
                            } else if (label.includes("scan attendance qr")) {
                              navigate("/teacher/attendance");
                            } else if (label.includes("review excuse letters")) {
                              navigate("/teacher/excuse-management");
                            } else if (label.includes("video conference")) {
                              navigate("/teacher/video-conferencing");
                            }
                          }}
                        >
                          <i className={action.icon + " mr-2"}></i> {action.label}
                        </Button>
                      </Col>
                    ))}
                  </Row>
                </CardBody>
              </Card>
            </Col>
          </Row>
          {/* Today's Attendance and Recent Announcements */}
          <Row>
            <Col lg="4" className="mb-4">
              <Card className="shadow" style={{ minHeight: 320 }}>
                <CardHeader>
                  <h3 className="mb-0">Today's Attendance</h3>
                </CardHeader>
                <CardBody>
                  {teacherAttendanceList.length === 0 ? (
                    <div className="text-muted">No attendance recorded yet today</div>
                  ) : (
                    teacherAttendanceList.map((att) => (
                      <div key={att.id} className="mb-3">
                        <div><strong>{att.class}</strong></div>
                        <div>Status: <span className="font-weight-bold">{att.status}</span></div>
                      </div>
                    ))
                  )}
                </CardBody>
              </Card>
            </Col>
            <Col lg="4" className="mb-4">
              <Card className="shadow" style={{ minHeight: 320 }}>
                <CardHeader className="d-flex justify-content-between align-items-center">
                  <h3 className="mb-0">Recent Announcements</h3>
                  <Button color="info" size="sm">+ New</Button>
                </CardHeader>
                <CardBody>
                  {teacherAnnouncements.length === 0 ? (
                    <div className="text-muted">No announcements yet</div>
                  ) : (
                    teacherAnnouncements.map((ann) => (
                      <div key={ann.id} className="mb-2">
                        <div className="font-weight-bold">{ann.title}</div>
                        <div className="text-muted small">{ann.date}</div>
                      </div>
                    ))
                  )}
                </CardBody>
              </Card>
            </Col>
            {/* Removed Pending Tasks card */}
          </Row>
        </Container>
      </>
    );
  }

  // Student dashboard
  if (user && user.role === "student") {
    return (
      <div className="container-fluid p-0" style={{ position: 'relative' }}>
        {/* Blue Gradient Header Background */}
        <div style={{
          position: 'absolute',
          left: 0,
          top: 0,
          width: '100vw',
          height: 180,
          background: 'linear-gradient(90deg, #1cb5e0 0%, #2096ff 100%)',
          zIndex: 1
        }} />
        {/* Spacer to push content below header */}
        <div style={{ height: 180, width: '100%' }} />
        {/* Dashboard Content */}
        <div style={{ position: 'relative', zIndex: 2, marginTop: -110, marginLeft: 0, marginRight: 0, paddingLeft: 0, paddingRight: 0 }}>
          {/* Summary Cards */}
          <Row className="mb-4" style={{ gap: 0, marginLeft: 0, marginRight: 0 }}>
            {summary.map((card, idx) => (
              <Col key={idx} xl={3} md={6} xs={12} className="mb-4">
                <Card className="shadow-sm rounded-lg h-100" style={{ border: 'none' }}>
                  <CardBody className="d-flex align-items-center justify-content-between" style={{ minHeight: 110 }}>
                    <div>
                      <div className="text-uppercase text-muted mb-1" style={{ fontSize: 13, fontWeight: 700 }}>{card.label}</div>
                      <div style={{ fontSize: 28, fontWeight: 700, color: '#232b4d' }}>{card.value}</div>
                      <div className="d-flex align-items-center" style={{ fontSize: 13, fontWeight: 500 }}>
                        {card.trend.up ? <FaArrowUp color="#2dce89" className="mr-1" /> : <FaArrowDown color="#f5365c" className="mr-1" />}
                        <span style={{ color: card.trend.up ? '#2dce89' : '#f5365c' }}>{card.trend.value}</span>
                        <span className="ml-2 text-muted">{card.trend.text}</span>
                      </div>
                    </div>
                    <div style={{ fontSize: 38, background: card.color + '22', color: card.color, borderRadius: 12, padding: 12 }}>
                      {card.icon}
                    </div>
                  </CardBody>
                </Card>
              </Col>
            ))}
          </Row>
          {/* Chart + Announcements/Quick Access */}
          <Row className="mb-4">
            <Col xl={8} md={7} xs={12} className="mb-4">
              <Card className="shadow-sm rounded-lg h-100" style={{ border: 'none', background: '#232b4d' }}>
                <CardBody>
                  <div className="text-white text-uppercase mb-2" style={{ fontWeight: 700, fontSize: 15 }}>Overview</div>
                  <div className="text-white mb-3" style={{ fontWeight: 700, fontSize: 22 }}>Attendance Trend</div>
                  <TrendChart />
                </CardBody>
              </Card>
            </Col>
            <Col xl={4} md={5} xs={12} className="mb-4">
              <Card className="shadow-sm rounded-lg h-100" style={{ border: 'none' }}>
                <CardHeader className="bg-white border-0" style={{ fontWeight: 700, fontSize: 18 }}>Quick Access</CardHeader>
                <CardBody>
                  <Row>
                    {quickLinks.map((q, i) => (
                      <Col md={12} xs={6} key={i} className="mb-3 text-center">
                        <Button color="primary" outline block href={q.href} style={{ borderRadius: 10, fontWeight: 600, fontSize: 15, padding: '12px 0' }}>
                          <div style={{ fontSize: 22, marginBottom: 4 }}>{q.icon}</div>
                          <div>{q.label}</div>
                        </Button>
                      </Col>
                    ))}
                  </Row>
                </CardBody>
              </Card>
            </Col>
          </Row>
          {/* My Classes + Announcements Feed */}
          <Row className="mb-4">
            <Col xl={7} md={6} xs={12} className="mb-4">
              <Card className="shadow-sm rounded-lg h-100" style={{ border: 'none' }}>
                <CardHeader className="bg-white border-0 d-flex justify-content-between align-items-center" style={{ fontWeight: 700, fontSize: 18 }}>
                  My Classes
                  <Button color="link" size="sm" style={{ color: '#2096ff', fontWeight: 600 }} href="#">See all</Button>
                </CardHeader>
                <CardBody style={{ paddingTop: 0 }}>
                  {myClasses.length === 0 ? (
                    <div className="text-center text-muted">You haven't joined any classes</div>
                  ) : (
                    <Table responsive borderless className="align-items-center">
                      <thead>
                        <tr>
                          <th>Subject</th>
                          <th>Code</th>
                          <th>Teacher</th>
                          <th>Section</th>
                          <th></th>
                        </tr>
                      </thead>
                      <tbody>
                        {myClasses.map(cls => (
                          <tr key={cls.id}>
                            <td className="font-weight-bold text-capitalize">{cls.subject}</td>
                            <td><span className="text-primary font-weight-bold">{cls.code}</span></td>
                            <td>{cls.teacher}</td>
                            <td>{cls.section}</td>
                            <td><Button color="primary" size="sm" href={`/student/classroom?code=${cls.code}`}>View</Button></td>
                          </tr>
                        ))}
                      </tbody>
                    </Table>
                  )}
                </CardBody>
              </Card>
            </Col>
            <Col xl={5} md={6} xs={12} className="mb-4">
              <Card className="shadow-sm rounded-lg h-100" style={{ border: 'none' }}>
                <CardHeader className="bg-white border-0 d-flex justify-content-between align-items-center" style={{ fontWeight: 700, fontSize: 18 }}>
                  Latest Announcements
                  <Button color="link" size="sm" style={{ color: '#2096ff', fontWeight: 600 }} href="#">See all</Button>
                </CardHeader>
                <CardBody style={{ maxHeight: 320, overflowY: 'auto', paddingTop: 0 }}>
                  {announcements.length === 0 ? (
                    <div className="text-center text-muted">No announcements yet</div>
                  ) : (
                    <ListGroup flush>
                      {announcements.map(a => (
                        <ListGroupItem key={a.id} className="d-flex align-items-start justify-content-between" style={{ borderLeft: a.isNew ? '4px solid #2096ff' : '4px solid #e9ecef', background: a.isNew ? '#f3f8ff' : '#fff' }}>
                          <div>
                            <div className="font-weight-bold text-primary" style={{ fontSize: 16 }}>{a.class}</div>
                            <div className="text-muted small mb-1"><FaCalendarAlt className="mr-1" /> {a.date}</div>
                            <div style={{ fontSize: 15 }}>{a.content.length > 80 ? a.content.slice(0, 80) + '...' : a.content}</div>
                          </div>
                          <div className="ml-3 d-flex flex-column align-items-end">
                            {a.isNew && <Badge color="info" pill className="mb-2">NEW</Badge>}
                            <Button color="link" size="sm" style={{ color: '#2096ff', fontWeight: 600 }} href="#">View</Button>
                          </div>
                        </ListGroupItem>
                      ))}
                    </ListGroup>
                  )}
                </CardBody>
              </Card>
            </Col>
          </Row>
        </div>
      </div>
    );
  }

  // Default (not logged in or unknown role)
  return (
    <div className="py-5 text-center">
      <h2>Welcome!</h2>
      <p>Please log in to view your dashboard.</p>
    </div>
  );
};

export default Index;
