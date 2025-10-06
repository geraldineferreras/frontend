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

import { Line, Bar, Doughnut } from "react-chartjs-2";

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

    trend: { up: false, value: "-1.1%", text: "Since last month" }
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

    trend: { up: true, value: "0.8%", text: "Since last month" }
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

  { icon: <FaEnvelope />, label: "Submit Excuse Letter", href: "/student/excuse-letters" },

  { icon: <FaPlus />, label: "Join a Class", href: "/student/join-class" },

  { icon: <FaUserCheck />, label: "My Attendance", href: "/student/attendance" },

  { icon: <FaBell />, label: "Notifications", href: "/student/notifications" }

];



function getCurrentDateTime() {

  const now = new Date();

  return now.toLocaleString();

}



// Student attendance chart – Simple bar chart showing attendance counts
function TrendChart() {

  const [loading, setLoading] = useState(true);

  const [error, setError] = useState(null);

  const [summary, setSummary] = useState({ present: 0, absent: 0, late: 0, total: 0, percent: 0 });

  const [tooltip, setTooltip] = useState({ show: false, x: 0, y: 0, text: '', value: 0 });


  useEffect(() => {

    let isMounted = true;

    async function load() {

      try {

        setLoading(true);

        setError(null);



        // Fetch all attendance records for the summary (no date restrictions)
        const allRecordsRes = await apiService.getStudentAttendance({});
        
        // Overall summary - use all records response for summary
        let present = 0, absent = 0, late = 0, total = 0;

        
        if (allRecordsRes?.data?.summary) {
          // Use the summary from all records (no date restrictions)
          present = allRecordsRes.data.summary.present || 0;
          absent = allRecordsRes.data.summary.absent || 0;
          late = allRecordsRes.data.summary.late || 0;
          total = allRecordsRes.data.summary.total || 0;
          console.log('🔍 TrendChart using all records summary:', { present, absent, late, total });
        } else if (allRecordsRes?.data?.attendance_records) {
          // Calculate from records if no summary
          const records = allRecordsRes.data.attendance_records;
          records.forEach(rec => {
          total += 1;

            const status = (rec.status || rec.attendance_status || rec.present || rec.is_present)?.toString().toLowerCase();
            if (status === "present" || status === "1" || status === "true") present += 1;
            else if (status === "late") late += 1;
          else absent += 1;

        });

          console.log('🔍 TrendChart calculated from records:', { present, absent, late, total });
        }
        
        const percent = total > 0 ? Math.round((present / total) * 100) : 0;

        if (isMounted) setSummary({ present, absent, late, total, percent });



      } catch (e) {

        if (isMounted) setError("Failed to load attendance data");
      } finally {

        if (isMounted) setLoading(false);

      }

    }

    load();

    return () => { isMounted = false; };

  }, []);



  // Chart dimensions - use full width and height
  const w = 1200, h = 500, pad = 60;
  const chartWidth = w - (pad * 2);
  const chartHeight = h - (pad * 2);
  const barWidth = chartWidth / 3 - 20; // 3 bars with minimal spacing to use more space

  // Calculate bar heights (scale to fit chart height)
  const maxValue = Math.max(summary.present, summary.absent, summary.late, 1);
  const scale = chartHeight / maxValue;
  
  const presentHeight = summary.present * scale;
  const absentHeight = summary.absent * scale;
  const lateHeight = summary.late * scale;

  // Bar positions - spread bars across full width
  const presentX = pad + 40;
  const absentX = pad + chartWidth / 3 + 20;
  const lateX = pad + (chartWidth / 3) * 2;

  const handleMouseEnter = (event, label, value) => {
    const rect = event.currentTarget.getBoundingClientRect();
    setTooltip({
      show: true,
      x: rect.left + rect.width / 2,
      y: rect.top - 10,
      text: label,
      value: value
    });
  };

  const handleMouseLeave = () => {
    setTooltip({ show: false, x: 0, y: 0, text: '', value: 0 });
  };


  return (

    <div style={{ position: 'relative' }}>
      <svg width="100%" height="500" viewBox={`0 0 ${w} ${h}`}>
      <rect x="0" y="0" width={w} height={h} rx="16" fill="#232b4d" />



        {/* Y-axis labels */}
        {[0, Math.ceil(maxValue/4), Math.ceil(maxValue/2), Math.ceil(maxValue*3/4), maxValue].map((value, i) => {
          const y = h - pad - (value * scale);
          return (
            <g key={i}>
              <line x1={pad-5} y1={y} x2={pad} y2={y} stroke="#3a3f66" strokeWidth="1" />
              <text x={pad-15} y={y+5} fill="#7c86ad" fontSize="12" textAnchor="end">{value}</text>
            </g>
          );
        })}

        {/* X-axis */}
      <line x1={pad} y1={h-pad} x2={w-pad} y2={h-pad} stroke="#3a3f66" strokeWidth="2" />

      <line x1={pad} y1={pad} x2={pad} y2={h-pad} stroke="#3a3f66" strokeWidth="2" />



        {/* Bars */}
        {/* Present Bar */}
        <rect 
          x={presentX} 
          y={h-pad-presentHeight} 
          width={barWidth} 
          height={presentHeight} 
          fill="#5e72e4" 
          rx="4"
          style={{ cursor: 'pointer' }}
          onMouseEnter={(e) => handleMouseEnter(e, 'Present', summary.present)}
          onMouseLeave={handleMouseLeave}
        />
        <text x={presentX + barWidth/2} y={h-pad+20} fill="#fff" fontSize="14" fontWeight="600" textAnchor="middle">
          Present
        </text>
        <text x={presentX + barWidth/2} y={h-pad+40} fill="#b0b7d3" fontSize="12" textAnchor="middle">
          {summary.present}
        </text>

        {/* Absent Bar */}
        <rect 
          x={absentX} 
          y={h-pad-absentHeight} 
          width={barWidth} 
          height={absentHeight} 
          fill="#f5365c" 
          rx="4"
          style={{ cursor: 'pointer' }}
          onMouseEnter={(e) => handleMouseEnter(e, 'Absent', summary.absent)}
          onMouseLeave={handleMouseLeave}
        />
        <text x={absentX + barWidth/2} y={h-pad+20} fill="#fff" fontSize="14" fontWeight="600" textAnchor="middle">
          Absent
        </text>
        <text x={absentX + barWidth/2} y={h-pad+40} fill="#b0b7d3" fontSize="12" textAnchor="middle">
          {summary.absent}
        </text>

        {/* Late Bar */}
        <rect 
          x={lateX} 
          y={h-pad-lateHeight} 
          width={barWidth} 
          height={lateHeight} 
          fill="#ff9f43" 
          rx="4"
          style={{ cursor: 'pointer' }}
          onMouseEnter={(e) => handleMouseEnter(e, 'Late', summary.late)}
          onMouseLeave={handleMouseLeave}
        />
        <text x={lateX + barWidth/2} y={h-pad+20} fill="#fff" fontSize="14" fontWeight="600" textAnchor="middle">
          Late
        </text>
        <text x={lateX + barWidth/2} y={h-pad+40} fill="#b0b7d3" fontSize="12" textAnchor="middle">
          {summary.late}
        </text>

        {/* Legend - upper right */}
      {(() => {

          const lx = w - pad - 200;
          const ly = pad - 20;


        return (

          <g>

              <rect x={lx-10} y={ly-8} width={200} height={64} rx={8} fill="#2a3154" opacity="0.35" />
            <rect x={lx} y={ly} width="12" height="12" fill="#5e72e4" rx="2" />

              <text x={lx+18} y={ly+10} fill="#fff" fontSize="14" fontWeight="600">Present</text>
              <text x={lx+150} y={ly+10} fill="#b0b7d3" fontSize="14" textAnchor="end">{summary.present}</text>


            <rect x={lx} y={ly+22} width="12" height="12" fill="#f5365c" rx="2" />

              <text x={lx+18} y={ly+32} fill="#fff" fontSize="14" fontWeight="600">Absent</text>
              <text x={lx+150} y={ly+32} fill="#b0b7d3" fontSize="14" textAnchor="end">{summary.absent}</text>


            <rect x={lx} y={ly+44} width="12" height="12" fill="#ff9f43" rx="2" />

              <text x={lx+18} y={ly+54} fill="#fff" fontSize="14" fontWeight="600">Late</text>
              <text x={lx+150} y={ly+54} fill="#b0b7d3" fontSize="14" textAnchor="end">{summary.late}</text>
          </g>

        );

      })()}



      {loading && <text x="24" y="40" fill="#b0b7d3" fontSize="12">Loading...</text>}

      {error && <text x="24" y="40" fill="#f5365c" fontSize="12">{error}</text>}

    </svg>


      {/* Tooltip */}
      {tooltip.show && (
        <div
          style={{
            position: 'fixed',
            left: tooltip.x - 50,
            top: tooltip.y - 60,
            backgroundColor: '#2a3154',
            color: '#fff',
            padding: '8px 12px',
            borderRadius: '6px',
            fontSize: '14px',
            fontWeight: '600',
            zIndex: 1000,
            pointerEvents: 'none',
            boxShadow: '0 4px 12px rgba(0,0,0,0.3)',
            border: '1px solid #3a3f66'
          }}
        >
          <div style={{ textAlign: 'center' }}>
            <div>{tooltip.text}</div>
            <div style={{ fontSize: '18px', marginTop: '2px' }}>{tooltip.value}</div>
          </div>
          {/* Tooltip arrow */}
          <div
            style={{
              position: 'absolute',
              bottom: '-6px',
              left: '50%',
              transform: 'translateX(-50%)',
              width: 0,
              height: 0,
              borderLeft: '6px solid transparent',
              borderRight: '6px solid transparent',
              borderTop: '6px solid #2a3154'
            }}
          />
        </div>
      )}
    </div>
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

  // Admin dashboard statistics state
  const [adminDashboardStats, setAdminDashboardStats] = useState({
    user_statistics: {
      total_users: 0,
      students: 0,
      teachers: 0,
      admins: 0
    },
    section_statistics: {
      total_sections: 0,
      sections_with_advisers: 0,
      sections_without_advisers: 0,
      total_enrolled_students: 0
    },
    program_distribution: [],
    year_level_distribution: [],
    semester_distribution: [],
    academic_year_distribution: []
  });
  const [adminDashboardLoading, setAdminDashboardLoading] = useState(false);

    // Student dashboard state (moved to top level)

  const [studentClasses, setStudentClasses] = useState(myClasses);

  const [studentClassesLoading, setStudentClassesLoading] = useState(false);

  const [studentClassesError, setStudentClassesError] = useState(null);

   

  // Student announcements state

  const [studentAnnouncements, setStudentAnnouncements] = useState(announcements);

  const [studentAnnouncementsLoading, setStudentAnnouncementsLoading] = useState(false);

  const [studentAnnouncementsError, setStudentAnnouncementsError] = useState(null);



  // Student dashboard summary cards state

  const [dashboardSummary, setDashboardSummary] = useState({

    totalClasses: 0,

    assignmentsDue: 0,

    attendance: 0,

    recentTasks: 0

  });

  const [summaryLoading, setSummaryLoading] = useState(false);

  const [summaryError, setSummaryError] = useState(null);



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

      loadAdminDashboardData();

    }

    // eslint-disable-next-line react-hooks/exhaustive-deps

  }, [user?.role]);



  // Fetch student classes data (moved to top level)

  useEffect(() => {

    if (user && user.role === "student") {

      const fetchStudentClasses = async () => {

        try {

          setStudentClassesLoading(true);

          setStudentClassesError(null);

          

          const response = await apiService.getStudentClasses();

          console.log('🔍 Student classes API response:', response);

          

          if (response && response.status && response.data) {

            // Transform the API response to match our expected format

            const transformedClasses = response.data.map((cls, index) => ({

              id: cls.id || cls.class_id || index + 1,

              subject: cls.subject_name || cls.subject || cls.name || 'Unknown Subject',

              code: cls.class_code || cls.code || cls.classCode || 'N/A',

              teacher: cls.teacher_name || cls.teacher || cls.instructor || 'Unknown Teacher',

              section: cls.section_name || cls.section || cls.sectionName || 'N/A'

            }));

            

            console.log('🔍 Transformed classes:', transformedClasses);

            setStudentClasses(transformedClasses);

          } else {

            console.warn('⚠️ No classes data in response, using default data');

            setStudentClasses(myClasses);

          }

        } catch (error) {

          console.error('❌ Error fetching student classes:', error);

          setStudentClassesError(error.message || 'Failed to load classes');

          setStudentClasses(myClasses); // Fallback to default data

        } finally {

          setStudentClassesLoading(false);

        }

      };



      fetchStudentClasses();

    }

  }, [user?.role]);



  // Fetch student dashboard summary data (moved to top level)

  useEffect(() => {

    if (user && user.role === "student") {

      const fetchDashboardSummary = async () => {

        try {

          setSummaryLoading(true);

          setSummaryError(null);



          // 1. Get total classes count

          const classesResponse = await apiService.getStudentClasses();

          console.log('🔍 Classes response:', classesResponse);

          const totalClasses = classesResponse?.data?.length || 0;



          // 2. Get assignments due (due within 7 days) - fetch for each class

          const today = new Date();

          const nextWeek = new Date(today.getTime() + 7 * 24 * 60 * 60 * 1000);

          console.log('🔍 Fetching assignments due before:', nextWeek.toISOString().split('T')[0]);

          

          let assignmentsDue = 0;

          if (classesResponse?.data?.length > 0) {

            const assignmentPromises = classesResponse.data.map(async (classItem) => {

              try {

                const classCode = classItem.class_code || classItem.code || classItem.classroom_code;

                if (classCode) {

                  const response = await apiService.getStudentTasks({ 

                    classCode: classCode,

                    status: 'assigned'

                  });

                  return response?.data || [];

                }

                return [];

              } catch (error) {

                console.error('Error fetching tasks for class:', classItem, error);

                return [];

              }

            });

            

            const allAssignments = await Promise.all(assignmentPromises);

            const flatAssignments = allAssignments.flat();

            

            // Filter assignments due within 7 days

            const dueSoonAssignments = flatAssignments.filter(assignment => {

              const dueDate = assignment.due_date || assignment.deadline || assignment.due_at;

              if (dueDate) {

                const due = new Date(dueDate);

                return due <= nextWeek && due >= today;

              }

              return false;

            });

            

            assignmentsDue = dueSoonAssignments.length;

            console.log('🔍 Assignments response - total classes:', classesResponse.data.length, 'assignments due:', assignmentsDue);

          }



          // 3. Get attendance present count (all records - no date restrictions)
          console.log('🔍 Fetching all attendance records (no date restrictions)');
          
          let attendancePresentCount = 0;
          try {
            const attendanceResponse = await apiService.getStudentAttendance({});
          console.log('🔍 Attendance response:', attendanceResponse);

          

            // Use the summary.present field directly from the API response
            if (attendanceResponse?.data?.summary?.present !== undefined) {
              attendancePresentCount = attendanceResponse.data.summary.present;
              console.log('🔍 Using summary.present (all records):', attendancePresentCount);
            } else if (attendanceResponse?.data?.attendance_records) {
              // Fallback: count present records manually
              const records = attendanceResponse.data.attendance_records;
              attendancePresentCount = records.filter(r => 
                (r.status || r.attendance_status || r.present || r.is_present)?.toString().toLowerCase() === 'present'
            ).length;

              console.log('🔍 Manual count from records:', attendancePresentCount);
            } else {
              console.log('🔍 No attendance data found in response');
            }
            
            console.log('🔍 Final attendance count:', attendancePresentCount);
          } catch (attendanceError) {
            console.error('❌ Error fetching attendance:', attendanceError);
                         // Try without date filters as fallback (this is now the primary method)
             try {
               console.log('🔍 Primary attendance fetch failed, trying again...');
               const fallbackResponse = await apiService.getStudentAttendance({});
              console.log('🔍 Fallback attendance response:', fallbackResponse);
              
              if (fallbackResponse?.data?.summary?.present !== undefined) {
                attendancePresentCount = fallbackResponse.data.summary.present;
                console.log('🔍 Fallback using summary.present:', attendancePresentCount);
              } else if (fallbackResponse?.data?.attendance_records) {
                const fallbackRecords = fallbackResponse.data.attendance_records;
                attendancePresentCount = fallbackRecords.filter(r => 
                  (r.status || r.attendance_status || r.present || r.is_present)?.toString().toLowerCase() === 'present'
                ).length;
                console.log('🔍 Fallback manual count:', attendancePresentCount);
              }
            } catch (fallbackError) {
              console.error('❌ Fallback attendance fetch also failed:', fallbackError);
            }
          }



          // 4. Get recent tasks (all tasks from last 30 days) - fetch for each class

           const thirtyDaysAgo = new Date(today.getTime() - 30 * 24 * 60 * 60 * 1000);
          console.log('🔍 Fetching recent tasks since:', thirtyDaysAgo.toISOString().split('T')[0]);

          

          let recentTasks = 0;

          if (classesResponse?.data?.length > 0) {

            const tasksPromises = classesResponse.data.map(async (classItem) => {

              try {

                const classCode = classItem.class_code || classItem.code || classItem.classroom_code;

                if (classCode) {

                  // Fetch all tasks for this class (assigned, graded, completed, etc.)

                  const response = await apiService.getStudentTasks({ 

                    classCode: classCode

                  });

                  return response?.data || [];

                }

                return [];

              } catch (error) {

                console.error('Error fetching tasks for class:', classItem, error);

                return [];

              }

            });

            

            const allTasks = await Promise.all(tasksPromises);

            const flatTasks = allTasks.flat();

            

            // Filter tasks created/updated in last 30 days

            const recentTasksList = flatTasks.filter(task => {

              const taskDate = task.created_at || task.updated_at || task.assigned_date || task.date_created;

              if (taskDate) {

                const created = new Date(taskDate);

                return created >= thirtyDaysAgo;

              }

              return false;

            });

            

            recentTasks = recentTasksList.length;

            console.log('🔍 Tasks response - total tasks:', flatTasks.length, 'recent tasks:', recentTasks);

          }



          const finalSummary = {

            totalClasses,

            assignmentsDue,

            attendance: attendancePresentCount,
            recentTasks

          };

          console.log('🔍 Final dashboard summary:', finalSummary);

          setDashboardSummary(finalSummary);



        } catch (error) {

          console.error('❌ Error fetching dashboard summary:', error);

          setSummaryError(error.message || 'Failed to load dashboard summary');

          // Fallback to default values

          setDashboardSummary({

            totalClasses: 5,

            assignmentsDue: 2,

            attendance: 8,
            recentTasks: 8

          });

        } finally {

          setSummaryLoading(false);

        }

      };



      fetchDashboardSummary();

    }

  }, [user?.role]);



  // Fetch student announcements data (moved to top level)

  useEffect(() => {

    if (user && user.role === "student") {

      const fetchStudentAnnouncements = async () => {

        try {

          setStudentAnnouncementsLoading(true);

          setStudentAnnouncementsError(null);

          

          // First get the student's classes

          const classesResponse = await apiService.getStudentClasses();

          if (!classesResponse || !classesResponse.status || !classesResponse.data) {

            console.warn('⚠️ No classes found, cannot fetch announcements');

            setStudentAnnouncements(announcements); // Fallback to default data

            return;

          }

          

          const classes = classesResponse.data;

          console.log('🔍 Fetching announcements for classes:', classes);

          

          // Fetch announcements from each class

          const announcementsPromises = classes.map(async (cls) => {

            try {

              const classCode = cls.class_code || cls.code || cls.classCode;

              if (!classCode) {

                console.warn('⚠️ No class code found for class:', cls);

                return [];

              }

              

              const streamResponse = await apiService.getStudentStreamPosts(classCode);

              console.log(`🔍 Stream posts for ${classCode}:`, streamResponse);

              

              if (streamResponse && streamResponse.status && streamResponse.data) {

                // Transform stream posts to announcements format

                return (Array.isArray(streamResponse.data) ? streamResponse.data : []).map((post, index) => ({

                  id: `${classCode}-${post.id || index}`,

                  class: cls.subject_name || cls.subject || cls.name || 'Unknown Class',

                  date: post.created_at || post.date || post.updated_at || new Date().toISOString().split('T')[0],

                  content: post.title || post.content || post.message || 'No content available',

                  isNew: post.is_new || post.isNew || false,

                  classCode: classCode,

                  postId: post.id

                }));

              }

              return [];

            } catch (error) {

              console.warn(`⚠️ Failed to fetch announcements for class ${cls.class_code || cls.code}:`, error);

              return [];

            }

          });

          

          // Wait for all announcements to be fetched

          const allAnnouncements = await Promise.all(announcementsPromises);

          const flatAnnouncements = allAnnouncements.flat();

          

          // Sort by date (newest first) and limit to 10

          const sortedAnnouncements = flatAnnouncements

            .sort((a, b) => new Date(b.date) - new Date(a.date))

            .slice(0, 10);

          

          console.log('🔍 Final transformed announcements:', sortedAnnouncements);

          setStudentAnnouncements(sortedAnnouncements);

          

        } catch (error) {

          console.error('❌ Error fetching student announcements:', error);

          setStudentAnnouncementsError(error.message || 'Failed to load announcements');

          setStudentAnnouncements(announcements); // Fallback to default data

        } finally {

          setStudentAnnouncementsLoading(false);

        }

      };



      fetchStudentAnnouncements();

    }

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

  // Load admin dashboard statistics
  const loadAdminDashboardData = async () => {
    try {
      // For admin users, don't show loading indicators
      if (user?.role === "admin") {
        setAdminDashboardLoading(false);
      } else {
      setAdminDashboardLoading(true);
      }
      console.log('Loading admin dashboard statistics...');

      // Fetch dashboard stats from the API
      const [dashboardStatsRes, userCountRes, sectionCountRes] = await Promise.all([
        apiService.getAdminDashboardStats(),
        apiService.getAdminUserCount(),
        apiService.getAdminSectionCount()
      ]);

      console.log('Admin Dashboard API Responses:', {
        dashboardStats: dashboardStatsRes,
        userCount: userCountRes,
        sectionCount: sectionCountRes
      });

      // Update dashboard stats with the main endpoint data
      if (dashboardStatsRes?.status && dashboardStatsRes?.data) {
        setAdminDashboardStats(dashboardStatsRes.data);
        console.log('✅ Dashboard stats loaded successfully:', dashboardStatsRes.data);
      } else {
        console.warn('❌ Dashboard stats failed, using fallback data');
        // Set fallback data if API fails
        setAdminDashboardStats({
          user_statistics: {
            total_users: 150,
            students: 120,
            teachers: 25,
            admins: 5
          },
          section_statistics: {
            total_sections: 20,
            sections_with_advisers: 18,
            sections_without_advisers: 2,
            total_enrolled_students: 1200
          },
          program_distribution: [
            { program: "BSIT", count: 8 },
            { program: "BSCS", count: 6 },
            { program: "BSIS", count: 6 }
          ],
          year_level_distribution: [
            { year_level: "1st Year", count: 5 },
            { year_level: "2nd Year", count: 5 },
            { year_level: "3rd Year", count: 5 },
            { year_level: "4th Year", count: 5 }
          ],
          semester_distribution: [
            { semester: "1st", count: 10 },
            { semester: "2nd", count: 10 }
          ],
          academic_year_distribution: [
            { academic_year: "2024-2025", count: 20 }
          ]
        });
      }

    } catch (error) {
      console.error('Error loading admin dashboard data:', error);
      // Set fallback data on error
      setAdminDashboardStats({
        user_statistics: {
          total_users: 150,
          students: 120,
          teachers: 25,
          admins: 5
        },
        section_statistics: {
          total_sections: 20,
          sections_with_advisers: 18,
          sections_without_advisers: 2,
          total_enrolled_students: 1200
        },
        program_distribution: [
          { program: "BSIT", count: 8 },
          { program: "BSCS", count: 6 },
          { program: "BSIS", count: 6 }
        ],
        year_level_distribution: [
          { year_level: "1st Year", count: 5 },
          { year_level: "2nd Year", count: 5 },
          { year_level: "3rd Year", count: 5 },
          { year_level: "4th Year", count: 5 }
        ],
        semester_distribution: [
          { semester: "1st", count: 10 },
          { semester: "2nd", count: 10 }
        ],
        academic_year_distribution: [
          { academic_year: "2024-2025", count: 20 }
        ]
      });
    } finally {
      // For admin users, keep loading state as false
      if (user?.role !== "admin") {
      setAdminDashboardLoading(false);
      }
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
          {/* Statistics Cards */}
          
                     {/* Statistics Cards */}
           <Row className="mb-5">
             {[
               { 
                 label: "TOTAL USERS", 
                 value: adminDashboardStats?.user_statistics?.total_users || 0, 
                 icon: "ni ni-single-02 text-primary",
                 bgColor: "bg-gradient-primary",
                 trend: "↑+0 Since last month",
                 trendColor: "text-success"
               },
               { 
                 label: "TOTAL SECTIONS", 
                 value: adminDashboardStats?.section_statistics?.total_sections || 0, 
                 icon: "ni ni-badge text-success",
                 bgColor: "bg-gradient-success", 
                 trend: "↑+0 Since last month",
                 trendColor: "text-success"
               },
               { 
                 label: "ENROLLED STUDENTS", 
                 value: adminDashboardStats?.section_statistics?.total_enrolled_students || 0, 
                 icon: "ni ni-hat-3 text-info",
                 bgColor: "bg-gradient-info",
                 trend: "↑+0 Since last month", 
                 trendColor: "text-success"
               },
               { 
                 label: "ACTIVE PROGRAMS", 
                 value: adminDashboardStats?.program_distribution?.length || 0, 
                 icon: "ni ni-badge text-warning",
                 bgColor: "bg-gradient-warning",
                 trend: "↑+0 Since last month",
                 trendColor: "text-success"
               }
             ].map((stat, idx) => (
               <Col lg="3" md="6" sm="6" xs="12" className="mb-4" key={idx}>
                 <Card className="shadow bg-white h-100">
                   <CardBody className="p-3">
                     <Row className="align-items-center">
                       <div className="col">
                         <div className="text-uppercase text-muted font-weight-bold small mb-1">
                           {stat.label}
                         </div>
                         {adminDashboardLoading && user?.role !== "admin" ? (
                           <div className="d-flex align-items-center">
                             <div className="spinner-border spinner-border-sm text-muted me-2" role="status">
                               <span className="visually-hidden">Loading...</span>
                             </div>
                             <span className="text-muted">Loading...</span>
                           </div>
                         ) : (
                           <>
                             <h2 className="mb-1 text-dark">{stat.value}</h2>
                             <div className={`small ${stat.trendColor}`}>
                               {stat.trend}
                             </div>
                           </>
                         )}
                       </div>
                       <div className="col-auto">
                         <div className="bg-light rounded p-3">
                           <i className={stat.icon} style={{ fontSize: 24 }}></i>
                         </div>
                       </div>
                     </Row>
                   </CardBody>
                 </Card>
               </Col>
             ))}
           </Row>

                     {/* Additional Statistics Cards */}
           <Row className="mb-5">
             {[
               { 
                 label: "STUDENTS", 
                 value: adminDashboardStats?.user_statistics?.students || 0, 
                 icon: "ni ni-hat-3 text-info",
                 bgColor: "bg-gradient-info",
                 trend: "↑+0 Since last month",
                 trendColor: "text-success"
               },
               { 
                 label: "TEACHERS", 
                 value: adminDashboardStats?.user_statistics?.teachers || 0, 
                 icon: "ni ni-single-02 text-warning",
                 bgColor: "bg-gradient-warning", 
                 trend: "↑+0 Since last month",
                 trendColor: "text-success"
               },
               { 
                 label: "SECTIONS WITH ADVISERS", 
                 value: adminDashboardStats?.section_statistics?.sections_with_advisers || 0, 
                 icon: "ni ni-badge text-success",
                 bgColor: "bg-gradient-success",
                 trend: "↑+0 Since last month", 
                 trendColor: "text-success"
               },
               { 
                 label: "ACADEMIC YEARS", 
                 value: adminDashboardStats?.academic_year_distribution?.length || 0, 
                 icon: "ni ni-calendar-grid-58 text-primary",
                 bgColor: "bg-gradient-primary",
                 trend: "↑+0 Since last month",
                 trendColor: "text-success"
               }
             ].map((stat, idx) => (
                                <Col lg="3" md="6" sm="6" xs="12" className="mb-4" key={idx}>
                 <Card className="shadow bg-white h-100">
                   <CardBody className="p-3">
                     <Row className="align-items-center">
                       <div className="col">
                         <div className="text-uppercase text-muted font-weight-bold small mb-1">
                           {stat.label}
                         </div>
                         {adminDashboardLoading && user?.role !== "admin" ? (
                           <div className="d-flex align-items-center">
                             <div className="spinner-border spinner-border-sm text-muted me-2" role="status">
                               <span className="visually-hidden">Loading...</span>
                             </div>
                             <span className="text-muted">Loading...</span>
                           </div>
                         ) : (
                           <>
                             <h2 className="mb-1 text-dark">{stat.value}</h2>
                             <div className={`small ${stat.trendColor}`}>
                               {stat.trend}
                             </div>
                           </>
                         )}
                       </div>
                       <div className="col-auto">
                         <div className="bg-light rounded p-3">
                           <i className={stat.icon} style={{ fontSize: 24 }}></i>
                         </div>
                       </div>
                     </Row>
                   </CardBody>
                 </Card>
               </Col>
             ))}
           </Row>



          {/* Distribution Charts Row */}
          <Row className="mb-5">
            {/* Program Distribution Chart */}
            <Col lg="6" className="mb-4">
              <Card className="shadow">
                <CardHeader className="bg-transparent">
                  <h6 className="text-uppercase text-muted ls-1 mb-1">Program Distribution</h6>
                  <h2 className="mb-0">Students by Program</h2>
                </CardHeader>
                <CardBody>
                  {adminDashboardLoading && user?.role !== "admin" ? (
                    <div className="text-center py-4">
                      <div className="spinner-border text-primary" role="status">
                        <span className="visually-hidden">Loading...</span>
                      </div>
                    </div>
                  ) : adminDashboardStats?.program_distribution?.length > 0 ? (
                    <div className="chart">
                      <Doughnut
                        data={{
                          labels: adminDashboardStats.program_distribution.map(p => p.program),
                          datasets: [{
                            data: adminDashboardStats.program_distribution.map(p => parseInt(p.count)),
                            backgroundColor: [
                              '#5e72e4', '#f5365c', '#fb6340', '#11cdef', '#2dce89',
                              '#f7fafc', '#8898aa', '#172b4d', '#5e72e4', '#f5365c'
                            ],
                            borderWidth: 0,
                          }]
                        }}
                        options={{
                          responsive: true,
                          maintainAspectRatio: false,
                          legend: {
                            position: 'bottom',
                            labels: {
                              padding: 20,
                              usePointStyle: true
                            }
                          },
                          tooltips: {
                            callbacks: {
                              label: function(tooltipItem, data) {
                                const dataset = data.datasets[tooltipItem.datasetIndex];
                                const total = dataset.data.reduce((a, b) => a + b, 0);
                                const percentage = ((dataset.data[tooltipItem.index] / total) * 100).toFixed(1);
                                return `${data.labels[tooltipItem.index]}: ${dataset.data[tooltipItem.index]} (${percentage}%)`;
                              }
                            }
                          }
                        }}
                      />
                    </div>
                  ) : (
                    <div className="text-center text-muted py-4">
                      <i className="ni ni-chart-pie-35 text-muted" style={{ fontSize: 48 }}></i>
                      <p className="mt-2">No program data available</p>
                    </div>
                  )}
                </CardBody>
              </Card>
            </Col>

            {/* Year Level Distribution Chart */}
            <Col lg="6" className="mb-4">
              <Card className="shadow">
                <CardHeader className="bg-transparent">
                  <h6 className="text-uppercase text-muted ls-1 mb-1">Year Level Distribution</h6>
                  <h2 className="mb-0">Students by Year Level</h2>
                </CardHeader>
                <CardBody>
                  {adminDashboardLoading && user?.role !== "admin" ? (
                    <div className="text-center py-4">
                      <div className="spinner-border text-primary" role="status">
                        <span className="visually-hidden">Loading...</span>
                      </div>
                    </div>
                  ) : adminDashboardStats?.year_level_distribution?.length > 0 ? (
                    <div className="chart">
                      <Doughnut
                        data={{
                          labels: adminDashboardStats.year_level_distribution.map(y => `Year ${y.year_level}`),
                          datasets: [{
                            data: adminDashboardStats.year_level_distribution.map(y => parseInt(y.count)),
                            backgroundColor: [
                              '#11cdef', '#2dce89', '#fb6340', '#f5365c', '#5e72e4',
                              '#f7fafc', '#8898aa', '#172b4d', '#5e72e4', '#f5365c'
                            ],
                            borderWidth: 0,
                          }]
                        }}
                        options={{
                          responsive: true,
                          maintainAspectRatio: false,
                          legend: {
                            position: 'bottom',
                            labels: {
                              padding: 20,
                              usePointStyle: true
                            }
                          },
                          tooltips: {
                            callbacks: {
                              label: function(tooltipItem, data) {
                                const dataset = data.datasets[tooltipItem.datasetIndex];
                                const total = dataset.data.reduce((a, b) => a + b, 0);
                                const percentage = ((dataset.data[tooltipItem.index] / total) * 100).toFixed(1);
                                return `${data.labels[tooltipItem.index]}: ${dataset.data[tooltipItem.index]} (${percentage}%)`;
                              }
                            }
                          }
                        }}
                      />
                    </div>
                  ) : (
                    <div className="text-center text-muted py-4">
                      <i className="ni ni-chart-pie-35 text-muted" style={{ fontSize: 48 }}></i>
                      <p className="mt-2">No year level data available</p>
                    </div>
                  )}
                </CardBody>
              </Card>
            </Col>
          </Row>

          {/* Additional Distribution Charts Row */}
          <Row className="mb-5">
            {/* Semester Distribution Chart */}
            <Col lg="6" className="mb-4">
              <Card className="shadow">
                <CardHeader className="bg-transparent">
                  <h6 className="text-uppercase text-muted ls-1 mb-1">Semester Distribution</h6>
                  <h2 className="mb-0">Sections by Semester</h2>
                </CardHeader>
                <CardBody>
                  {adminDashboardLoading && user?.role !== "admin" ? (
                    <div className="text-center py-4">
                      <div className="spinner-border text-primary" role="status">
                        <span className="visually-hidden">Loading...</span>
                      </div>
                    </div>
                  ) : adminDashboardStats?.semester_distribution?.length > 0 ? (
                    <div className="chart">
                      <Doughnut
                        data={{
                          labels: adminDashboardStats.semester_distribution.map(s => `${s.semester} Semester`),
                          datasets: [{
                            data: adminDashboardStats.semester_distribution.map(s => parseInt(s.count)),
                            backgroundColor: [
                              '#2dce89', '#fb6340', '#f5365c', '#5e72e4', '#11cdef',
                              '#f7fafc', '#8898aa', '#172b4d', '#5e72e4', '#f5365c'
                            ],
                            borderWidth: 0,
                          }]
                        }}
                        options={{
                          responsive: true,
                          maintainAspectRatio: false,
                          legend: {
                            position: 'bottom',
                            labels: {
                              padding: 20,
                              usePointStyle: true
                            }
                          },
                          tooltips: {
                            callbacks: {
                              label: function(tooltipItem, data) {
                                const dataset = data.datasets[tooltipItem.datasetIndex];
                                const total = dataset.data.reduce((a, b) => a + b, 0);
                                const percentage = ((dataset.data[tooltipItem.index] / total) * 100).toFixed(1);
                                return `${data.labels[tooltipItem.index]}: ${dataset.data[tooltipItem.index]} (${percentage}%)`;
                              }
                            }
                          }
                        }}
                      />
                    </div>
                  ) : (
                    <div className="text-center text-muted py-4">
                      <i className="ni ni-chart-pie-35 text-muted" style={{ fontSize: 48 }}></i>
                      <p className="mt-2">No semester data available</p>
                    </div>
                  )}
                </CardBody>
              </Card>
            </Col>

            {/* Academic Year Distribution Chart */}
            <Col lg="6" className="mb-4">
              <Card className="shadow">
                <CardHeader className="bg-transparent">
                  <h6 className="text-uppercase text-muted ls-1 mb-1">Academic Year Distribution</h6>
                  <h2 className="mb-0">Sections by Academic Year</h2>
                </CardHeader>
                <CardBody>
                  {adminDashboardLoading && user?.role !== "admin" ? (
                    <div className="text-center py-4">
                      <div className="spinner-border text-primary" role="status">
                        <span className="visually-hidden">Loading...</span>
                      </div>
                    </div>
                  ) : adminDashboardStats?.academic_year_distribution?.length > 0 ? (
                    <div className="chart">
                      <Doughnut
                        data={{
                          labels: adminDashboardStats.academic_year_distribution.map(a => a.academic_year),
                          datasets: [{
                            data: adminDashboardStats.academic_year_distribution.map(a => parseInt(a.count)),
                            backgroundColor: [
                              '#5e72e4', '#f5365c', '#fb6340', '#11cdef', '#2dce89',
                              '#f7fafc', '#8898aa', '#172b4d', '#5e72e4', '#f5365c'
                            ],
                            borderWidth: 0,
                          }]
                        }}
                        options={{
                          responsive: true,
                          maintainAspectRatio: false,
                          legend: {
                            position: 'bottom',
                            labels: {
                              padding: 20,
                              usePointStyle: true
                            }
                          },
                          tooltips: {
                            callbacks: {
                              label: function(tooltipItem, data) {
                                const dataset = data.datasets[tooltipItem.datasetIndex];
                                const total = dataset.data.reduce((a, b) => a + b, 0);
                                const percentage = ((dataset.data[tooltipItem.index] / total) * 100).toFixed(1);
                                return `${data.labels[tooltipItem.index]}: ${dataset.data[tooltipItem.index]} (${percentage}%)`;
                              }
                            }
                          }
                        }}
                      />
                    </div>
                  ) : (
                    <div className="text-center text-muted py-4">
                      <i className="ni ni-chart-pie-35 text-muted" style={{ fontSize: 48 }}></i>
                      <p className="mt-2">No academic year data available</p>
                    </div>
                  )}
                </CardBody>
              </Card>
            </Col>
          </Row>

          {/* Recent Activity and Summary Row */}
          <Row className="mb-5">
            {/* Recent User Registrations */}
            <Col lg="8" className="mb-4">
              <Card className="shadow">
                <CardHeader className="bg-transparent">
                  <h6 className="text-uppercase text-muted ls-1 mb-1">Recent Activity</h6>
                  <h2 className="mb-0">User Registration Summary</h2>
                </CardHeader>
                <CardBody>
                  {adminDashboardLoading && user?.role !== "admin" ? (
                    <div className="text-center py-4">
                      <div className="spinner-border text-primary" role="status">
                        <span className="visually-hidden">Loading...</span>
                      </div>
                    </div>
                  ) : (
                    <div>
                      <div className="row text-center">
                        <div className="col-6">
                          <div className="text-center">
                            <h3 className="text-primary mb-1">
                              {adminDashboardStats?.user_statistics?.students || 0}
                            </h3>
                            <p className="text-muted mb-0">Total Students</p>
                          </div>
                        </div>
                        <div className="col-6">
                          <div className="text-center">
                            <h3 className="text-success mb-1">
                              {adminDashboardStats?.user_statistics?.teachers || 0}
                            </h3>
                            <p className="text-muted mb-0">Total Teachers</p>
                          </div>
                        </div>
                      </div>
                      <hr />
                      <div className="row text-center">
                        <div className="col-6">
                          <div className="text-center">
                            <h3 className="text-primary mb-1">
                              {adminDashboardStats?.user_statistics?.admins || 0}
                            </h3>
                            <p className="text-muted mb-0">Total Admins</p>
                          </div>
                        </div>
                        <div className="col-6">
                          <div className="text-center">
                            <h3 className="text-warning mb-1">
                              {adminDashboardStats?.section_statistics?.sections_with_advisers || 0}
                            </h3>
                            <p className="text-muted mb-0">Sections with Advisers</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </CardBody>
              </Card>
            </Col>

            {/* Quick Stats Summary */}
            <Col lg="4" className="mb-4">
              <Card className="shadow">
                <CardHeader className="bg-transparent">
                  <h6 className="text-uppercase text-muted ls-1 mb-1">Quick Stats</h6>
                  <h2 className="mb-0">System Overview</h2>
                </CardHeader>
                <CardBody>
                  <div className="mb-3">
                    <div className="d-flex justify-content-between align-items-center mb-2">
                      <span className="text-muted">Programs</span>
                      <span className="font-weight-bold">{adminDashboardStats?.program_distribution?.length || 0}</span>
                    </div>
                    <Progress 
                      value={(adminDashboardStats?.program_distribution?.length || 0) / 10 * 100} 
                      color="primary" 
                      className="mb-3"
                    />
                  </div>
                  <div className="mb-3">
                    <div className="d-flex justify-content-between align-items-center mb-2">
                      <span className="text-muted">Year Levels</span>
                      <span className="font-weight-bold">{adminDashboardStats?.year_level_distribution?.length || 0}</span>
                    </div>
                    <Progress 
                      value={(adminDashboardStats?.year_level_distribution?.length || 0) / 5 * 100} 
                      color="success" 
                      className="mb-3"
                    />
                  </div>
                  <div className="mb-3">
                    <div className="d-flex justify-content-between align-items-center mb-2">
                      <span className="text-muted">Semesters</span>
                      <span className="font-weight-bold">{adminDashboardStats?.year_level_distribution?.length || 0}</span>
                    </div>
                    <Progress 
                      value={(adminDashboardStats?.year_level_distribution?.length || 0) / 3 * 100} 
                      color="info" 
                      className="mb-3"
                    />
                  </div>
                  <div className="mb-3">
                    <div className="d-flex justify-content-between align-items-center mb-2">
                      <span className="text-muted">Academic Years</span>
                      <span className="font-weight-bold">{adminDashboardStats?.academic_year_distribution?.length || 0}</span>
                    </div>
                    <Progress 
                      value={(adminDashboardStats?.academic_year_distribution?.length || 0) / 5 * 100} 
                      color="warning" 
                      className="mb-3"
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

      <div className="container-fluid p-0" style={{ position: 'relative', overflowX: 'hidden' }}>

        {/* Blue Gradient Header Background */}

        <div style={{

          position: 'absolute',

          left: 0,

          top: 0,

          width: '100%',

          height: 180,

          background: 'linear-gradient(90deg, #1cb5e0 0%, #2096ff 100%)',

          zIndex: 1

        }} />

        {/* Spacer to push content below header */}

        <div style={{ height: 180, width: '100%' }} />

                 {/* Dashboard Content */}

         <div style={{ position: 'relative', zIndex: 2, marginTop: -110, padding: '0 15px', maxWidth: '100%', overflowX: 'hidden' }}>

           <style>

             {`

               .skeleton-text {

                 animation: pulse 1.5s ease-in-out infinite;

               }

               @keyframes pulse {

                 0%, 100% { opacity: 1; }

                 50% { opacity: 0.5; }

               }

             `}

           </style>

           {/* Summary Cards Header */}

           <Row className="mb-3 no-gutters">

             <Col xs="12">

               <div className="d-flex justify-content-between align-items-center">

                 <h4 className="text-white mb-0" style={{ fontWeight: 700 }}>Dashboard Overview</h4>

                                                                       <div className="d-flex">
                 <Button 

                   color="light" 

                   size="sm" 

                   outline

                   onClick={() => {

                     if (user && user.role === "student") {

                       setSummaryLoading(true);

                       setSummaryError(null);

                       // Re-fetch summary data

                       const fetchDashboardSummary = async () => {

                         try {

                           // 1. Get total classes count

                           const classesResponse = await apiService.getStudentClasses();

                           console.log('🔍 Refresh - Classes response:', classesResponse);

                           const totalClasses = classesResponse?.data?.length || 0;



                           // 2. Get assignments due (due within 7 days) - fetch for each class

                           const today = new Date();

                           const nextWeek = new Date(today.getTime() + 7 * 24 * 60 * 60 * 1000);

                           

                           let assignmentsDue = 0;

                           if (classesResponse?.data?.length > 0) {

                             const assignmentPromises = classesResponse.data.map(async (classItem) => {

                               try {

                                 const classCode = classItem.class_code || classItem.code || classItem.classroom_code;

                                 if (classCode) {

                                   const response = await apiService.getStudentTasks({ 

                                     classCode: classCode,

                                     status: 'assigned'

                                   });

                                   return response?.data || [];

                                 }

                                 return [];

                               } catch (error) {

                                 console.error('Error fetching tasks for class:', classItem, error);

                                 return [];

                               }

                             });

                             

                             const allAssignments = await Promise.all(assignmentPromises);

                             const flatAssignments = allAssignments.flat();

                             

                             // Filter assignments due within 7 days

                             const dueSoonAssignments = flatAssignments.filter(assignment => {

                               const dueDate = assignment.due_date || assignment.deadline || assignment.due_at;

                               if (dueDate) {

                                 const due = new Date(dueDate);

                                 return due <= nextWeek && due >= today;

                               }

                               return false;

                             });

                             

                             assignmentsDue = dueSoonAssignments.length;

                           }



                                                                                    // 3. Get attendance present count (all records - no date restrictions)
                             
                             let attendancePresentCount = 0;
                             try {
                               const attendanceResponse = await apiService.getStudentAttendance({});
                              
                              // Use the summary.present field directly from the API response
                              if (attendanceResponse?.data?.summary?.present !== undefined) {
                                attendancePresentCount = attendanceResponse.data.summary.present;
                                                                 console.log('🔍 Refresh - Using summary.present (all records):', attendancePresentCount);
                              } else if (attendanceResponse?.data?.attendance_records) {
                                // Fallback: count present records manually
                                const records = attendanceResponse.data.attendance_records;
                                attendancePresentCount = records.filter(r => 
                                  (r.status || r.attendance_status || r.present || r.is_present)?.toString().toLowerCase() === 'present'
                             ).length;

                                console.log('🔍 Refresh - Manual count from records:', attendancePresentCount);
                              }
                            } catch (attendanceError) {
                              console.error('❌ Error fetching attendance in refresh:', attendanceError);
                                                             // This is now the primary method, so no fallback needed
                               console.log('🔍 Primary attendance fetch completed');
                           }



                           // 4. Get recent tasks (all tasks from last 30 days) - fetch for each class

                            const thirtyDaysAgo = new Date(today.getTime() - 30 * 24 * 60 * 60 * 1000);
                           let recentTasks = 0;

                           if (classesResponse?.data?.length > 0) {

                             const tasksPromises = classesResponse.data.map(async (classItem) => {

                               try {

                                 const classCode = classItem.class_code || classItem.code || classItem.classroom_code;

                                 if (classCode) {

                                   // Fetch all tasks for this class (assigned, graded, completed, etc.)

                                   const response = await apiService.getStudentTasks({ 

                                     classCode: classCode

                                   });

                                   return response?.data || [];

                                 }

                                 return [];

                               } catch (error) {

                                 console.error('Error fetching tasks for class:', classItem, error);

                                 return [];

                               }

                             });

                             

                             const allTasks = await Promise.all(tasksPromises);

                             const flatTasks = allTasks.flat();

                             

                             // Filter tasks created/updated in last 30 days

                             const recentTasksList = flatTasks.filter(task => {

                               const taskDate = task.created_at || task.updated_at || task.assigned_date || task.date_created;

                               if (taskDate) {

                                 const created = new Date(taskDate);

                                 return created >= thirtyDaysAgo;

                               }

                               return false;

                             });

                             

                             recentTasks = recentTasksList.length;

                           }



                           setDashboardSummary({

                             totalClasses,

                             assignmentsDue,

                             attendance: attendancePresentCount,
                             recentTasks

                           });

                         } catch (error) {

                           console.error('❌ Error refreshing dashboard summary:', error);

                           setSummaryError(error.message || 'Failed to refresh dashboard summary');

                         } finally {

                           setSummaryLoading(false);

                         }

                       };

                       fetchDashboardSummary();

                     }

                   }}

                   disabled={summaryLoading}

                   style={{ borderRadius: 20, fontWeight: 600 }}

                 >

                   <i className={`ni ni-refresh ${summaryLoading ? 'fa-spin' : ''}`} />

                   {summaryLoading ? ' Refreshing...' : ' Refresh Data'}

                 </Button>

                   </div>
               </div>

             </Col>

           </Row>

           

           {/* Summary Cards */}

           <Row className="mb-4 no-gutters">

             {summaryLoading ? (

               // Loading state for all cards

               Array.from({ length: 4 }).map((_, idx) => (

                 <Col key={idx} xl={3} md={6} xs={12} className="mb-4" style={{ paddingLeft: '8px', paddingRight: '8px' }}>

                   <Card className="shadow-sm rounded-lg h-100" style={{ border: 'none' }}>

                     <CardBody className="d-flex align-items-center justify-content-between" style={{ minHeight: 110 }}>

                       <div className="w-100">

                         <div className="text-uppercase text-muted mb-1" style={{ fontSize: 13, fontWeight: 700 }}>

                           <div className="skeleton-text" style={{ height: '12px', width: '80px', background: '#e9ecef', borderRadius: '4px' }}></div>

                         </div>

                         <div style={{ height: '32px', width: '60px', background: '#e9ecef', borderRadius: '4px', marginBottom: '8px' }}></div>

                         <div style={{ height: '12px', width: '120px', background: '#e9ecef', borderRadius: '4px' }}></div>

                       </div>

                       <div style={{ fontSize: 38, background: '#e9ecef', color: '#e9ecef', borderRadius: 12, padding: 12, width: '62px', height: '62px' }}></div>

                     </CardBody>

                   </Card>

                 </Col>

               ))

             ) : summaryError ? (

               // Error state - show error message and default data

               <>

                 <Col xs="12" className="mb-3">

                   <div className="alert alert-warning" style={{ borderRadius: 10, border: 'none' }}>

                     <i className="ni ni-alert-circle mr-2" />

                     <strong>Warning:</strong> {summaryError} - Showing default data

                   </div>

                 </Col>

                                  {summary.map((card, idx) => (

                   <Col key={idx} xl={3} md={6} xs={12} className="mb-4" style={{ paddingLeft: '8px', paddingRight: '8px' }}>

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

               </>

             ) : (

               // Real data from backend

               [

                 {

                   label: "Total Classes",

                   value: dashboardSummary.totalClasses,

                   icon: <FaBook />, 

                   color: "#2096ff",

                   trend: { up: true, value: "+" + Math.max(0, dashboardSummary.totalClasses - 3), text: "Since last month" }

                 },

                 {

                   label: "Assignments Due",

                   value: dashboardSummary.assignmentsDue,

                   icon: <FaClipboardList />, 

                   color: "#2dce89",

                    trend: { up: false, value: dashboardSummary.assignmentsDue > 0 ? "-" + Math.max(1, Math.floor(dashboardSummary.assignmentsDue * 0.3)) : "0", text: "Since last month" }
                 },

                 {

                   label: "Attendance",

                    value: dashboardSummary.attendance,
                   icon: <FaCheckCircle />, 

                   color: "#11cdef",

                    trend: { up: true, value: "+" + Math.max(0, Math.floor(dashboardSummary.attendance * 0.1)), text: "Since last month" }
                 },

                 {

                   label: "Recent Tasks",

                   value: dashboardSummary.recentTasks,

                   icon: <FaGraduationCap />, 

                   color: "#5e72e4",

                    trend: { up: true, value: "+" + Math.max(0, Math.floor(dashboardSummary.recentTasks * 0.2)), text: "Since last month" }
                 }

               ].map((card, idx) => (

                 <Col key={idx} xl={3} md={6} xs={12} className="mb-4" style={{ paddingLeft: '8px', paddingRight: '8px' }}>

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

               ))

             )}

           </Row>

          {/* Chart + Announcements/Quick Access */}

          <Row className="mb-4">

                         <Col xl={8} md={7} xs={12} className="mb-4" style={{ paddingLeft: '8px', paddingRight: '8px' }}>

               <Card className="shadow-sm rounded-lg h-100" style={{ border: 'none', background: '#232b4d' }}>

                <CardBody>

                  <div className="text-white text-uppercase mb-2" style={{ fontWeight: 700, fontSize: 15 }}>Overview</div>

                  <div className="text-white mb-3" style={{ fontWeight: 700, fontSize: 22 }}>Attendance Trend</div>

                  <TrendChart />

                </CardBody>

              </Card>

            </Col>

            <Col xl={4} md={5} xs={12} className="mb-4" style={{ paddingLeft: '8px', paddingRight: '8px' }}>

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

            <Col xl={7} md={6} xs={12} className="mb-4" style={{ paddingLeft: '8px', paddingRight: '8px' }}>

              <Card className="shadow-sm rounded-lg h-100" style={{ border: 'none' }}>

                <CardHeader className="bg-white border-0 d-flex justify-content-between align-items-center" style={{ fontWeight: 700, fontSize: 18 }}>

                  My Classes {!studentClassesLoading && studentClasses.length > 0 && (

                    <span className="text-muted" style={{ fontSize: '0.8em', fontWeight: 400 }}>

                      ({studentClasses.length} {studentClasses.length === 1 ? 'class' : 'classes'})

                    </span>

                  )}

                  <div>

                    <Button 

                      color="link" 

                      size="sm" 

                      style={{ color: '#2096ff', fontWeight: 600, marginRight: '10px' }}

                      onClick={() => {

                        setStudentClassesLoading(true);

                        setStudentClassesError(null);

                        // Re-fetch data

                        apiService.getStudentClasses().then(response => {

                          if (response && response.status && response.data) {

                            const transformedClasses = response.data.map((cls, index) => ({

                              id: cls.id || cls.class_id || index + 1,

                              subject: cls.subject_name || cls.subject || cls.name || 'Unknown Subject',

                              code: cls.class_code || cls.code || cls.classCode || 'N/A',

                              teacher: cls.teacher_name || cls.teacher || cls.instructor || 'Unknown Teacher',

                              section: cls.section_name || cls.section || cls.sectionName || 'N/A'

                            }));

                            setStudentClasses(transformedClasses);

                          }

                        }).catch(error => {

                          setStudentClassesError(error.message || 'Failed to refresh classes');

                        }).finally(() => {

                          setStudentClassesLoading(false);

                        });

                      }}

                      disabled={studentClassesLoading}

                    >

                      <i className={`ni ni-refresh ${studentClassesLoading ? 'fa-spin' : ''}`} />

                      {studentClassesLoading ? ' Refreshing...' : ' Refresh'}

                    </Button>

                    <Button color="link" size="sm" style={{ color: '#2096ff', fontWeight: 600 }} href="#">See all</Button>

                  </div>

                </CardHeader>

                <CardBody style={{ paddingTop: 0 }}>

                  {studentClassesLoading ? (

                    <div className="text-center text-muted py-4">

                      <div className="spinner-border spinner-border-sm text-primary mr-2" role="status">

                        <span className="sr-only">Loading...</span>

                      </div>

                      Loading your classes...

                    </div>

                  ) : studentClassesError ? (

                    <div className="text-center text-danger py-4">

                      <i className="ni ni-alert-circle text-danger mr-2" />

                      {studentClassesError}

                      <br />

                      <small className="text-muted">Showing default data</small>

                    </div>

                  ) : studentClasses.length === 0 ? (

                    <div className="text-center text-muted py-4">

                      <i className="ni ni-books text-muted mr-2" />

                      You haven't joined any classes yet

                      <br />

                      <small>Use the "Join Class" button to get started</small>

                    </div>

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

                        {studentClasses.map(cls => (

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

                         <Col xl={5} md={6} xs={12} className="mb-4" style={{ paddingLeft: '8px', paddingRight: '8px' }}>

               <Card className="shadow-sm rounded-lg h-100" style={{ border: 'none' }}>

                 <CardHeader className="bg-white border-0 d-flex justify-content-between align-items-center" style={{ fontWeight: 700, fontSize: 18 }}>

                   Latest Announcements {!studentAnnouncementsLoading && studentAnnouncements.length > 0 && (

                     <span className="text-muted" style={{ fontSize: '0.8em', fontWeight: 400 }}>

                       ({studentAnnouncements.length} {studentAnnouncements.length === 1 ? 'announcement' : 'announcements'})

                     </span>

                   )}

                   <div>

                     <Button 

                       color="link" 

                       size="sm" 

                       style={{ color: '#2096ff', fontWeight: 600, marginRight: '10px' }}

                       onClick={() => {

                         setStudentAnnouncementsLoading(true);

                         setStudentAnnouncementsError(null);

                         // Re-fetch announcements

                         const fetchAnnouncements = async () => {

                           try {

                             const classesResponse = await apiService.getStudentClasses();

                             if (!classesResponse || !classesResponse.status || !classesResponse.data) {

                               setStudentAnnouncements(announcements);

                               return;

                             }

                             

                             const classes = classesResponse.data;

                             const announcementsPromises = classes.map(async (cls) => {

                               try {

                                 const classCode = cls.class_code || cls.code || cls.classCode;

                                 if (!classCode) return [];

                                 

                                 const streamResponse = await apiService.getStudentStreamPosts(classCode);

                                 if (streamResponse && streamResponse.status && streamResponse.data) {

                                   return (Array.isArray(streamResponse.data) ? streamResponse.data : []).map((post, index) => ({

                                     id: `${classCode}-${post.id || index}`,

                                     class: cls.subject_name || cls.subject || cls.name || 'Unknown Class',

                                     date: post.created_at || post.date || post.updated_at || new Date().toISOString().split('T')[0],

                                     content: post.title || post.content || post.message || 'No content available',

                                     isNew: post.is_new || post.isNew || false,

                                     classCode: classCode,

                                     postId: post.id

                                   }));

                                 }

                                 return [];

                               } catch (error) {

                                 console.warn(`Failed to fetch announcements for class ${cls.class_code || cls.code}:`, error);

                                 return [];

                               }

                             });

                             

                             const allAnnouncements = await Promise.all(announcementsPromises);

                             const flatAnnouncements = allAnnouncements.flat();

                             const sortedAnnouncements = flatAnnouncements

                               .sort((a, b) => new Date(b.date) - new Date(a.date))

                               .slice(0, 10);

                             

                             setStudentAnnouncements(sortedAnnouncements);

                           } catch (error) {

                             setStudentAnnouncementsError(error.message || 'Failed to refresh announcements');

                           } finally {

                             setStudentAnnouncementsLoading(false);

                           }

                         };

                         fetchAnnouncements();

                       }}

                       disabled={studentAnnouncementsLoading}

                     >

                       <i className={`ni ni-refresh ${studentAnnouncementsLoading ? 'fa-spin' : ''}`} />

                       {studentAnnouncementsLoading ? ' Refreshing...' : ' Refresh'}

                     </Button>

                     <Button color="link" size="sm" style={{ color: '#2096ff', fontWeight: 600 }} href="#">See all</Button>

                   </div>

                 </CardHeader>

                 <CardBody style={{ maxHeight: 320, overflowY: 'auto', paddingTop: 0 }}>

                   {studentAnnouncementsLoading ? (

                     <div className="text-center text-muted py-4">

                       <div className="spinner-border spinner-border-sm text-primary mr-2" role="status">

                         <span className="sr-only">Loading...</span>

                       </div>

                       Loading announcements...

                     </div>

                   ) : studentAnnouncementsError ? (

                     <div className="text-center text-danger py-4">

                       <i className="ni ni-alert-circle text-danger mr-2" />

                       {studentAnnouncementsError}

                       <br />

                       <small className="text-muted">Showing default data</small>

                     </div>

                   ) : studentAnnouncements.length === 0 ? (

                     <div className="text-center text-muted py-4">

                       <i className="ni ni-bell text-muted mr-2" />

                       No announcements yet

                       <br />

                       <small>Check back later for updates from your teachers</small>

                     </div>

                   ) : (

                     <ListGroup flush>

                       {studentAnnouncements.map(a => (

                         <ListGroupItem key={a.id} className="d-flex align-items-start justify-content-between" style={{ borderLeft: a.isNew ? '4px solid #2096ff' : '4px solid #e9ecef', background: a.isNew ? '#f3f8ff' : '#fff' }}>

                           <div>

                             <div className="font-weight-bold text-primary" style={{ fontSize: 16 }}>{a.class}</div>

                             <div className="text-muted small mb-1"><FaCalendarAlt className="mr-1" /> {a.date}</div>

                             <div style={{ fontSize: 15 }}>{a.content.length > 80 ? a.content.slice(0, 80) + '...' : a.content}</div>

                           </div>

                           <div className="ml-3 d-flex flex-column align-items-end">

                             {a.isNew && <Badge color="info" pill className="mb-2">NEW</Badge>}

                             <Button 

                               color="link" 

                               size="sm" 

                               style={{ color: '#2096ff', fontWeight: 600 }} 

                               href={a.classCode ? `/student/classroom?code=${a.classCode}` : '#'}

                             >

                               View

                             </Button>

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

