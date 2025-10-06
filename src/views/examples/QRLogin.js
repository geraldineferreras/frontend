import React from "react";
import { Col, Card, CardHeader, CardBody } from "reactstrap";

const QRLogin = () => (
  <Col lg="5" md="7">
    <Card className="bg-secondary shadow border-0">
      <CardHeader className="bg-transparent pb-4">
        <div className="text-center mt-2 mb-3">
          <h2>QR Code Login</h2>
        </div>
      </CardHeader>
      <CardBody className="px-lg-5 py-lg-5">
        <div className="text-center text-muted mb-4">
          <small>This is where QR code login will be implemented.</small>
        </div>
      </CardBody>
    </Card>
  </Col>
);

export default QRLogin; 