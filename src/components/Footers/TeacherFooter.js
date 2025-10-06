import React from "react";
import { Container, Row, Col } from "reactstrap";

const TeacherFooter = () => {
  return (
    <footer className="footer">
      <Container fluid>
        <Row className="align-items-center justify-content-lg-between">
          <Col lg="6">
            <div className="copyright text-center text-lg-left text-muted">
              &copy; {new Date().getFullYear()} <a href="#" className="font-weight-bold ml-1">SCMS</a>
            </div>
          </Col>
          <Col lg="6">
            <ul className="nav nav-footer justify-content-center justify-content-lg-end">
              <li className="nav-item">
                <a href="#" className="nav-link">SCMS</a>
              </li>
              <li className="nav-item">
                <a href="#" className="nav-link">About Us</a>
              </li>
              <li className="nav-item">
                <a href="#" className="nav-link">Blog</a>
              </li>
              <li className="nav-item">
                <a href="https://github.com/creativetimofficial/argon-dashboard-react/blob/master/LICENSE.md" className="nav-link" target="_blank" rel="noopener noreferrer">MIT License</a>
              </li>
            </ul>
          </Col>
        </Row>
      </Container>
    </footer>
  );
};

export default TeacherFooter; 