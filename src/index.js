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
import React, { useState, useEffect } from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter, Route, Routes, Navigate } from "react-router-dom";
import { Modal, ModalHeader, ModalBody, ModalFooter, Button } from "reactstrap";

import "assets/plugins/nucleo/css/nucleo.css";
import "@fortawesome/fontawesome-free/css/all.min.css";
import "assets/scss/argon-dashboard-react.scss";
import "assets/css/react-select-mobile-fix.css";

import AdminLayout from "layouts/Admin.js";
import AuthLayout from "layouts/Auth.js";
import StudentLayout from "layouts/Student.js";
import TeacherLayout from "layouts/Teacher.js";
import VideoConferenceLayout from "layouts/VideoConference.js";
import RemoteCameraMobile from './components/RemoteCameraMobile';
import { AuthProvider } from "contexts/AuthContext.js";
import { NotificationProvider } from "contexts/NotificationContext.js";
import GlobalRouteLoader from "components/GlobalRouteLoader";
import NotificationToaster from "components/NotificationToaster";
import NotificationManager from "components/NotificationManager";

function SessionTimeoutModal() {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const handleTimeout = () => setOpen(true);
    window.addEventListener('sessionTimeout', handleTimeout);
    return () => window.removeEventListener('sessionTimeout', handleTimeout);
  }, []);

  const handleOk = () => {
    setOpen(false);
    window.location.href = '/auth/login';
  };

  return (
    <Modal isOpen={open} centered backdrop="static">
      <ModalHeader className="pb-0" style={{ fontWeight: 700, fontSize: 22, borderBottom: 'none', letterSpacing: 0.5 }}>Session Timed Out</ModalHeader>
      <ModalBody className="text-center" style={{ fontSize: 16, paddingTop: 0, background: '#f8fafc', borderRadius: '0 0 20px 20px' }}>
        Your session has timed out. Please log in again to continue.
      </ModalBody>
      <ModalFooter className="border-0 pt-0 d-flex justify-content-end" style={{ background: '#f8fafc', borderRadius: '0 0 20px 20px' }}>
        <Button color="primary" onClick={handleOk} style={{ borderRadius: 10, fontWeight: 600, minWidth: 90, fontSize: 15, padding: '8px 0' }}>OK</Button>
      </ModalFooter>
    </Modal>
  );
}

const root = ReactDOM.createRoot(document.getElementById("root"));

root.render(
  <AuthProvider>
    <BrowserRouter>
      <NotificationProvider>
        <SessionTimeoutModal />
        <GlobalRouteLoader minVisibleMs={1600} />
        <Routes>
          <Route path="/admin/*" element={<AdminLayout />} />
          <Route path="/student/*" element={<StudentLayout />} />
          <Route path="/teacher/*" element={<TeacherLayout />} />
          <Route path="/video-conference/*" element={<VideoConferenceLayout />} />
          <Route path="/auth/*" element={<AuthLayout />} />
          <Route path="/remote-camera" element={<RemoteCameraMobile />} />
          <Route path="*" element={<Navigate to="/auth/login" replace />} />
        </Routes>
        <NotificationToaster />
        <NotificationManager />
      </NotificationProvider>
    </BrowserRouter>
  </AuthProvider>
);
