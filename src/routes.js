/*!

=========================================================
* SCMS - Student Class Management System - v1.2.4
=========================================================

* A comprehensive student class management system
* Built with React and Bootstrap 4
* Licensed under MIT

=========================================================

* The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

*/
import Index from "views/Index.js";
import Profile from "views/examples/Profile.js";

import Register from "views/examples/Register.js";
import Login from "views/examples/Login.js";
import Tables from "views/examples/Tables.js";
import Icons from "views/examples/Icons.js";
import UserManagement from "views/examples/UserManagement.js";
import ForgotPassword from "views/examples/ForgotPassword.js";
import ResetPassword from "views/examples/ResetPassword.js";
import QRLogin from "views/examples/QRLogin.js";
import QRRegister from "views/examples/QRRegister.js";
import CreateUser from "views/examples/CreateUser.js";
import EditUser from "views/examples/EditUser.js";
import SectionManagement from "views/examples/SectionManagement.js";
import StudentJoinClass from "./views/examples/StudentJoinClass";
import Announcements from "views/examples/Announcements.js";
import Materials from "views/examples/Materials.js";
import Assignments from "views/examples/Assignments.js";
import Submissions from "views/examples/Submissions.js";
import Attendance from "views/examples/Attendance.js";
import Grades from "views/examples/Grades.js";
import ExcuseLetters from "views/examples/ExcuseLetters.js";
import Notifications from "views/examples/Notifications.js";
import Classroom from "views/examples/Classroom.js";
import TeacherAnnouncement from "views/examples/TeacherAnnouncement.js";
import TeacherMaterials from "views/examples/TeacherMaterials.js";
import TeacherAssignments from "views/examples/TeacherAssignments.js";
import TeacherSubmissions from "views/examples/TeacherSubmissions.js";
import TeacherAttendance from "views/examples/TeacherAttendance.js";
import TeacherGrades from "views/examples/TeacherGrades.js";
import TeacherVideoConferencing from "views/examples/TeacherVideoConferencing.js";
import VideoConferencePage from "views/examples/VideoConferencePage.js";
import ExcuseManagement from "views/examples/ExcuseManagement.js";
import ClassroomDetail from "views/examples/ClassroomDetail.js";
import AccessControl from "views/examples/AccessControl.js";
import SubjectManagement from "views/examples/SubjectManagement.js";
import OfferingsManagement from "views/examples/OfferingsManagement.js";
import CreateSection from "views/examples/CreateSection.js";
import EditSection from "views/examples/EditSection.js";
import AttendanceLog from "views/examples/AttendanceLog.js";
import GradesLog from "views/examples/GradesLog.js";
import AuditLog from "views/examples/AuditLog.js";
import StudentClassroom from "views/examples/StudentClassroom.js";
import ToDoStudent from "views/examples/ToDoStudent.js";
import ClassroomDetailStudent from "views/examples/ClassroomDetailStudent.js";
import AssignmentDetailStudent from "views/examples/AssignmentDetailStudent.js";
import StudentAttendance from "views/examples/StudentAttendance.js";
import StudentExcuseLetter from "views/examples/StudentExcuseLetter.js";
import StudentNotifications from "views/examples/StudentNotifications.js";
import TeacherNotifications from "views/examples/TeacherNotifications.js";
import TeacherFastGrade from "views/examples/TeacherFastGrade.js";
import TaskDetail from "views/examples/TaskDetail.js";
import TestUserData from "views/examples/TestUserData.js";
import TestProfilePics from "views/examples/TestProfilePics.js";
import ProfilePictureDebug from "components/ProfilePictureDebug.js";
import SimpleProfileTest from "components/SimpleProfileTest.js";
import GoogleOAuthCallback from "components/GoogleOAuthCallback.jsx";
import Settings from "views/examples/Settings.js";
import TeacherSettings from "views/examples/TeacherSettings.js";
import StudentSettings from "views/examples/StudentSettings.js";
import AdminSettings from "views/examples/AdminSettings.js";

var routes = [
  {
    path: "/index",
    name: "Dashboard",
    icon: "ni ni-tv-2 text-primary",
    component: <Index />,
    layout: "/admin",
  },
  {
    path: "/user-management",
    name: "User Management",
    icon: "ni ni-settings-gear-65 text-blue",
    component: <UserManagement />,
    layout: "/admin",
  },
  {
    path: "/subject-management",
    name: "Subject Management",
    icon: "ni ni-books text-info",
    component: <SubjectManagement />,
    layout: "/admin",
  },
  {
    path: "/section-management",
    name: "Section Management",
    icon: "ni ni-books text-green",
    component: <SectionManagement />,
    layout: "/admin",
  },

  {
    path: "/user-profile",
    name: "User Profile",
    icon: "ni ni-single-02 text-yellow",
    component: <Profile />,
    layout: "/admin",
  },
  {
    path: "/tables",
    name: "Tables",
    icon: "ni ni-bullet-list-67 text-red",
    component: <Tables />,
    layout: "/admin",
  },
  {
    path: "/login",
    name: "Login",
    icon: "ni ni-key-25 text-info",
    component: <Login />,
    layout: "/auth",
  },
  {
    path: "/register",
    name: "Register",
    icon: "ni ni-circle-08 text-pink",
    component: <Register />,
    layout: "/auth",
  },
  {
    path: "/",
    name: "Register",
    icon: "ni ni-circle-08 text-pink",
    component: <Register />,
    layout: "/auth",
  },
  {
    path: "/forgot-password",
    name: "Forgot Password",
    icon: "ni ni-key-25 text-info",
    component: <ForgotPassword />,
    layout: "/auth",
  },
  {
    path: "/reset-password",
    name: "Reset Password",
    icon: "ni ni-key-25 text-info",
    component: <ResetPassword />,
    layout: "/auth",
    hideInSidebar: true,
  },
  {
    path: "/qr-login",
    name: "QR Login",
    icon: "ni ni-camera-compact text-info",
    component: <QRLogin />,
    layout: "/auth",
  },
  {
    path: "/qr-register",
    name: "QR Register",
    icon: "ni ni-camera-compact text-info",
    component: <QRRegister />,
    layout: "/auth",
  },
  {
    path: "/google/callback",
    name: "Google OAuth Callback",
    component: <GoogleOAuthCallback />,
    layout: "/auth",
    hideInSidebar: true,
  },
  {
    path: "/create-user",
    name: "Create User",
    icon: "ni ni-fat-add text-primary",
    component: <CreateUser />,
    layout: "/admin",
  },
  {
    path: "/edit-user/:id",
    name: "Edit User",
    icon: "ni ni-single-02 text-primary",
    component: <EditUser />,
    layout: "/admin",
  },
  {
    path: "/test-user-data",
    name: "Test User Data",
    icon: "ni ni-chart-bar-32 text-info",
    component: <TestUserData />,
    layout: "/admin",
  },
  {
    path: "/test-profile-pics",
    name: "Test Profile Pics",
    icon: "ni ni-image text-info",
    component: <TestProfilePics />,
    layout: "/admin",
  },
  {
    path: "/profile-picture-debug",
    name: "Profile Picture Debug",
    icon: "ni ni-bug text-warning",
    component: <ProfilePictureDebug />,
    layout: "/admin",
  },
  {
    path: "/simple-profile-test",
    name: "Simple Profile Test",
    icon: "ni ni-chart-bar-32 text-info",
    component: <SimpleProfileTest />,
    layout: "/admin",
  },
  {
    path: "/settings",
    name: "Settings",
    icon: "ni ni-settings-gear-65 text-info",
    component: <AdminSettings />,
    layout: "/admin",
  },
  {
    path: "/index",
    name: "Dashboard",
    icon: "ni ni-tv-2 text-primary",
    component: <Index />,
    layout: "/student",
  },
  {
    path: "/user-management",
    name: "User Management",
    icon: "ni ni-settings-gear-65 text-blue",
    component: <UserManagement />,
    layout: "/student",
  },
  {
    path: "/section-management",
    name: "Section Management",
    icon: "ni ni-books text-green",
    component: <SectionManagement />,
    layout: "/student",
  },

  {
    path: "/user-profile",
    name: "User Profile",
    icon: "ni ni-single-02 text-yellow",
    component: <Profile />,
    layout: "/student",
  },
  {
    path: "/tables",
    name: "Tables",
    icon: "ni ni-bullet-list-67 text-red",
    component: <Tables />,
    layout: "/student",
  },
  {
    path: "/create-user",
    name: "Create User",
    icon: "ni ni-fat-add text-primary",
    component: <CreateUser />,
    layout: "/student",
  },
  {
    path: "/edit-user/:id",
    name: "Edit User",
    icon: "ni ni-single-02 text-primary",
    component: <EditUser />,
    layout: "/student",
  },
  {
    path: "/settings",
    name: "Settings",
    icon: "ni ni-settings-gear-65 text-info",
    component: <StudentSettings />,
    layout: "/student",
  },
  {
    path: "/index",
    name: "Dashboard",
    icon: "ni ni-tv-2 text-primary",
    component: <Index />,
    layout: "/teacher",
  },
  {
    path: "/classroom",
    name: "Classroom",
    icon: "ni ni-building text-success",
    component: <Classroom />,
    layout: "/teacher",
  },
  {
    path: "/video-conferencing",
    name: "Video Conferencing",
    icon: "ni ni-camera-compact text-purple",
    component: <TeacherVideoConferencing />,
    layout: "/teacher",
  },
  {
    path: "/fast-grade",
    name: "Fast Grade",
    icon: "fas fa-qrcode text-info fa-lg fa-fw",
    component: <TeacherFastGrade />,
    layout: "/teacher",
  },
  {
    path: "/classroom",
    name: "Classroom",
    icon: "ni ni-hat-3 text-info",
    component: <StudentClassroom />,
    layout: "/student",
  },
  {
    path: "/video-conferencing",
    name: "Video Conferencing",
    icon: "ni ni-camera-compact text-purple",
    component: <TeacherVideoConferencing />,
    layout: "/teacher",
  },
  {
    path: "/video-conference/:sessionId",
    name: "Live Video Conference",
    component: <VideoConferencePage />,
    layout: "/video-conference",
  },
  {
    path: "/video-conference/:sessionId",
    name: "Live Video Conference",
    component: <VideoConferencePage />,
    layout: "/video-conference",
  },
  {
    path: "/announcement",
    name: "Announcement",
    icon: "ni ni-bell-55 text-info",
    component: <TeacherAnnouncement />,
    layout: "/teacher",
  },
  {
    path: "/materials",
    name: "Materials",
    icon: "ni ni-archive-2 text-orange",
    component: <TeacherMaterials />,
    layout: "/teacher",
  },
  {
    path: "/assignments/*",
    name: "Assignments",
    icon: "ni ni-bullet-list-67 text-red",
    component: <TeacherAssignments />,
    layout: "/teacher",
  },
  {
    path: "/submissions",
    name: "Submissions",
    icon: "ni ni-send text-primary",
    component: <TeacherSubmissions />,
    layout: "/teacher",
  },
  {
    path: "/attendance",
    name: "Attendance",
    icon: "ni ni-check-bold text-green",
    component: <TeacherAttendance />,
    layout: "/teacher",
  },
  {
    path: "/attendance",
    name: "Attendance",
    icon: "ni ni-check-bold text-green",
    component: <StudentAttendance />,
    layout: "/student",
  },
  {
    path: "/grades",
    name: "Recitation & Grades",
    icon: "ni ni-chart-bar-32 text-yellow",
    component: <TeacherGrades />,
    layout: "/teacher",
  },
  {
    path: "/excuse-management",
    name: "Excuse Management",
    icon: "ni ni-single-copy-04 text-pink",
    component: <ExcuseManagement />,
    layout: "/teacher",
  },
  {
    path: "/notifications",
    name: "Notifications",
    icon: "ni ni-notification-70 text-info",
    component: <TeacherNotifications />,
    layout: "/teacher",
  },
  {
    path: "/classroom/:code",
    name: "Classroom Detail",
    component: <ClassroomDetail />,
    layout: "/teacher",
  },
  {
    path: "/classroom/:code",
    name: "Student Classroom Detail",
    component: <ClassroomDetailStudent />,
    layout: "/student",
  },
  {
    path: "/access-control",
    name: "Access Control",
    icon: "ni ni-lock-circle-open text-info",
    component: <AccessControl />,
    layout: "/admin",
  },
  {
    path: "/offerings-management",
    name: "Offerings Management",
    icon: "ni ni-collection text-orange",
    component: <OfferingsManagement />,
    layout: "/admin",
  },
  {
    path: "/join-class",
    name: "Join Class",
    icon: "ni ni-fat-add text-success",
    component: <StudentJoinClass />,
    layout: "/student"
  },
  {
    path: "/join/:classCode",
    name: "Join Class with Code",
    component: <StudentJoinClass />,
    layout: "/student"
  },
  {
    path: "/create-section",
    name: "Create Section",
    icon: "ni ni-fat-add text-primary",
    component: <CreateSection />,
    layout: "/admin",
  },
  {
    path: "/edit-section",
    name: "Edit Section",
    icon: "ni ni-settings-gear-65 text-blue",
    component: <EditSection />,
    layout: "/admin",
  },
  {
    path: "/reports-logs/attendance",
    name: "Attendance Log",
    component: <AttendanceLog />,
    layout: "/admin",
  },
  {
    path: "/reports-logs/grades",
    name: "Grades Log",
    component: <GradesLog />,
    layout: "/admin",
  },
  {
    path: "/reports-logs/audit",
    name: "Audit Log",
    component: <AuditLog />,
    layout: "/admin",
  },
  {
    path: "/assigned/:classCode",
    name: "To-Do Assigned",
    component: <ToDoStudent />,
    layout: "/student",
  },
  {
    path: "/assigned",
    name: "To-Do Assigned",
    component: <ToDoStudent />,
    layout: "/student",
  },
  {
    path: "/missing/:classCode",
    name: "To-Do Missing",
    component: <ToDoStudent />,
    layout: "/student",
  },
  {
    path: "/missing",
    name: "To-Do Missing",
    component: <ToDoStudent />,
    layout: "/student",
  },
  {
    path: "/done/:classCode",
    name: "To-Do Done",
    component: <ToDoStudent />,
    layout: "/student",
  },
  {
    path: "/done",
    name: "To-Do Done",
    component: <ToDoStudent />,
    layout: "/student",
  },
  {
    path: "/classroom/:classCode/assignment/:assignmentId",
    name: "Student Assignment Detail",
    component: <AssignmentDetailStudent />,
    layout: "/student",
  },
  {
    path: "/excuse-letters",
    name: "Excuse Letters",
    icon: "ni ni-single-copy-04 text-pink",
    component: <StudentExcuseLetter />,
    layout: "/student",
  },
  {
    path: "/notifications",
    name: "Notifications",
    icon: "ni ni-notification-70 text-info",
    component: <StudentNotifications />,
    layout: "/student",
  },
  {
    path: "/settings",
    name: "Settings",
    icon: "ni ni-settings-gear-65 text-info",
    component: <TeacherSettings />,
    layout: "/teacher",
  },
  {
    path: "/task/:taskId",
    name: "Task Detail",
    component: <TaskDetail />,
    layout: "/teacher",
  },
];
export default routes;
