import React from "react";
import { Card, CardBody, CardTitle, CardText, Button, Row, Col } from "reactstrap";

const mockOfferings = [
  {
    id: 1,
    subject: "Object Oriented Programming",
    section: "3A",
    code: "b7p3r9"
  },
  {
    id: 2,
    subject: "Data Structures",
    section: "2B",
    code: "a1c2d3"
  },
  {
    id: 3,
    subject: "Web Development",
    section: "1C",
    code: "z8y7x6"
  }
];

const Index = () => {
  // Check if user is teacher
  const user = JSON.parse(localStorage.getItem("scms_logged_in_user") || "null");
  if (!user || user.role !== "teacher") {
    return (
      <div className="py-5 text-center">
        <h2>Welcome!</h2>
        <p>This dashboard is for teachers. Please log in as a teacher to view your subject offerings.</p>
      </div>
    );
  }

  return (
    <div className="py-4">
      <h2 className="mb-4">Assigned Subject Offerings</h2>
      <Row>
        {mockOfferings.map(offering => (
          <Col md="4" key={offering.id} className="mb-4">
            <Card className="shadow h-100">
              <CardBody>
                <CardTitle tag="h4">{offering.subject}</CardTitle>
                <CardText>
                  <strong>Section:</strong> {offering.section}<br />
                  <strong>Class Code:</strong> <span className="text-primary font-weight-bold">{offering.code}</span>
                </CardText>
                <Button color="primary" href={`/teacher/classroom?code=${offering.code}`}>Go to Classroom</Button>
              </CardBody>
            </Card>
          </Col>
        ))}
      </Row>
    </div>
  );
};

export default Index; 