

import React, { useState, useEffect } from "react";
import { Card, CardBody, Button, Row, Col, Badge, Input, Alert } from "reactstrap";
import LottieLoader from "components/LottieLoader";
import { useNavigate } from "react-router-dom";
import apiService from "../../services/api";
import useMinDelay from "utils/useMinDelay";

// Color themes for classroom cards
const colorThemes = [
  "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
  "linear-gradient(135deg, #f093fb 0%, #f5576c 100%)",
  "linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)",
  "linear-gradient(135deg, #f7971e 0%, #ffd200 100%)",
  "linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)",
  "linear-gradient(135deg, #ff9a9e 0%, #fecfef 100%)",
  "linear-gradient(135deg, #a8edea 0%, #fed6e3 100%)",
  "linear-gradient(135deg, #ffecd2 0%, #fcb69f 100%)"
];

const bookIcon = (
  <svg width="48" height="48" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
    <rect width="48" height="48" rx="12" fill="none" />
    <path d="M14 16C14 14.8954 14.8954 14 16 14H32C33.1046 14 34 14.8954 34 16V34C34 35.1046 33.1046 36 32 36H16C14.8954 36 14 35.1046 14 34V16Z" fill="#fff" fillOpacity="0.15"/>
    <rect x="18" y="20" width="12" height="2.5" rx="1.25" fill="#fff" fillOpacity="0.7"/>
    <rect x="18" y="25" width="12" height="2.5" rx="1.25" fill="#fff" fillOpacity="0.7"/>
  </svg>
);

const StudentClassroom = () => {
  const navigate = useNavigate();
  const [enrolledClasses, setEnrolledClasses] = useState([]);
  const [loading, setLoading] = useState(true);
  const showLoader = useMinDelay(loading, 1600);
  const [error, setError] = useState(null);

  // Function to fetch student classes
  const fetchStudentClasses = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await apiService.getStudentClasses();
      const raw = (response && response.data) ? response.data : response; // support either shape
      if (Array.isArray(raw)) {
        console.log('Student classes fetched:', raw);
        // Determine enrollment inclusively
        const enrolledOnly = raw.filter(cls => {
          const flagTrue = cls.is_enrolled === true || cls.isEnrolled === true || cls.enrolled === true;
          const statusEnrolled = (cls.enrollment_status || cls.status || '').toString().toLowerCase() === 'enrolled'
            || (cls.enrollment_status || cls.status || '').toString().toLowerCase() === 'active';
          // If no explicit flag/status is present, include by default (student endpoint should already be scoped)
          const hasAnyFlag = ('is_enrolled' in cls) || ('isEnrolled' in cls) || ('enrolled' in cls) || ('enrollment_status' in cls) || ('status' in cls);
          return flagTrue || statusEnrolled || !hasAnyFlag;
        });
        console.log('Enrolled classes only:', enrolledOnly);
        // Transform API data to match our expected format
        const transformedClasses = enrolledOnly.map((cls, index) => ({
          id: cls.class_id || index + 1,
          name: cls.subject_name,
          section: cls.section_name,
          subject: cls.subject_name,
          code: cls.class_code || cls.code || cls.class_id, // include more fallbacks
          semester: cls.semester,
          schoolYear: cls.school_year,
          teacherName: cls.teacher_name,
          enrolledAt: cls.date_created,
          studentCount: 0, // API doesn't provide student count for students
          theme: colorThemes[index % colorThemes.length]
        }));
        setEnrolledClasses(transformedClasses);
      } else {
        setError('No data received from server');
        setEnrolledClasses([]);
      }
    } catch (error) {
      console.error('Error fetching student classes:', error);
      setError(error.message || 'Failed to fetch student classes');
      setEnrolledClasses([]);
    } finally {
      setLoading(false);
    }
  };

  // Fetch classes when component mounts
  useEffect(() => {
    fetchStudentClasses();
  }, []);

  if (showLoader) {
    return (
      <div style={{ background: "#f7fafd", minHeight: "100vh" }}>
        <div className="container py-4">
          <div className="py-5" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <LottieLoader message="Loading your classes..." width={160} height={160} centered minHeight={'70vh'} desiredDurationSec={1.4} />
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ background: "#f7fafd", minHeight: "100vh" }}>
        <div className="container py-4">
          <Alert color="danger">
            <h4>Error loading classes</h4>
            <p>{error}</p>
            <Button color="primary" onClick={fetchStudentClasses}>
              Try Again
            </Button>
          </Alert>
        </div>
      </div>
    );
  }

  return (
    <div style={{ background: "#f7fafd", minHeight: "100vh" }}>
      <div className="container py-4">
        {enrolledClasses.length === 0 ? (
          <div className="text-center py-5">
            <i className="ni ni-books text-muted" style={{ fontSize: "4rem" }}></i>
            <h4 className="mt-3 text-muted">No enrolled classes</h4>
            <p className="text-muted">You haven't enrolled in any classes yet. Join a class to get started!</p>
            <Button color="primary" size="lg" onClick={() => navigate('/student/join-class')}>
              <i className="ni ni-fat-add mr-2"></i>
              Join a Class
            </Button>
          </div>
        ) : (
          <Row>
            {enrolledClasses.map((cls, idx) => (
              <Col key={cls.id} xl={4} md={6} sm={12} className="mb-4">
                <Card
                  style={{ borderRadius: 20, boxShadow: '0 2px 16px 0 rgba(44,62,80,.08)', border: 'none', overflow: 'hidden', cursor: 'pointer' }}
                  onClick={() => navigate(`/student/classroom/${cls.code}`)}
                >
                  <div style={{ background: cls.theme || colorThemes[idx % colorThemes.length], height: 90, borderTopLeftRadius: 20, borderTopRightRadius: 20, position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <Badge color="light" style={{ position: 'absolute', top: 14, left: 18, fontWeight: 600, fontSize: 13, color: '#555', borderRadius: 8, padding: '4px 12px' }}>ENROLLED</Badge>
                    <div style={{ opacity: 0.7 }}>{bookIcon}</div>
                  </div>
                  <CardBody style={{ background: '#fff', borderBottomLeftRadius: 20, borderBottomRightRadius: 20 }}>
                    <div style={{ fontWeight: 700, fontSize: 18, marginBottom: 2 }}>{cls.subject}</div>
                    <div style={{ color: '#888', fontSize: 15, marginBottom: 8 }}>{cls.section}</div>
                    <div className="mb-2">
                      <Badge color="primary" style={{ marginRight: 6, fontWeight: 500, fontSize: 13, background: '#e6e8ff', color: '#5e72e4' }}>{cls.semester}</Badge>
                      <Badge color="info" style={{ fontWeight: 500, fontSize: 13, background: '#e0f7fa', color: '#2096ff' }}>{cls.schoolYear}</Badge>
                    </div>
                    <div style={{ color: '#666', fontSize: 13, marginBottom: 5 }}>Teacher: <span style={{ fontWeight: 600 }}>{cls.teacherName}</span></div>
                    <div style={{ color: '#666', fontSize: 15, marginBottom: 10 }}>Class Code: <span style={{ fontWeight: 700, letterSpacing: 1 }}>{cls.code}</span></div>
                    <Button color="primary" style={{ borderRadius: 8, fontWeight: 600, fontSize: 15, minWidth: 110 }} onClick={e => { e.stopPropagation(); navigate(`/student/classroom/${cls.code}`); }}>View Class</Button>
                  </CardBody>
                </Card>
              </Col>
            ))}
          </Row>
        )}
      </div>
    </div>
  );
};

export default StudentClassroom; 