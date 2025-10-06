import React, { useState } from "react";
import { Col, Card, CardHeader, CardBody } from "reactstrap";
import { QrReader } from "react-qr-reader";

const QRRegister = () => {
  const [qrData, setQrData] = useState("");
  const handleScan = data => {
    if (data) {
      setQrData(data);
    }
  };
  const handleError = err => {
    console.error(err);
  };
  return (
    <Col lg="5" md="7">
      <Card className="bg-secondary shadow border-0">
        <CardHeader className="bg-transparent pb-4">
          <div className="text-center mt-2 mb-3">
            <h2>QR Code Register</h2>
          </div>
        </CardHeader>
        <CardBody className="px-lg-5 py-lg-5">
          <div className="text-center text-muted mb-4">
            <small>Scan your student ID QR code to register.</small>
          </div>
          <div className="d-flex justify-content-center mb-3">
            <div style={{ width: 320, height: 300 }}>
              <QrReader
                constraints={{ facingMode: "environment" }}
                onError={handleError}
                onResult={(result, error) => {
                  if (!!result) {
                    setQrData(result?.text);
                  }
                }}
                style={{ width: "100%", height: "100%" }}
              />
            </div>
          </div>
          <div className="text-center">
            <strong>Scanned Data:</strong>
            <div>{qrData ? qrData : <span className="text-muted">No QR code detected yet.</span>}</div>
          </div>
        </CardBody>
      </Card>
    </Col>
  );
};

export default QRRegister; 