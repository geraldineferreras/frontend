import React, { useState, useRef, useEffect } from "react";
import { Html5Qrcode } from "html5-qrcode";
import { useParams } from "react-router-dom";
import {
  Card,
  CardBody,
  Button,
  Form,
  FormGroup,
  Label,
  Input,
  Alert,
  Spinner,
  Row,
  Col,
  ButtonGroup,
  Modal,
  ModalHeader,
  ModalBody,
  ModalFooter
} from "reactstrap";
import { FaQrcode, FaKeyboard, FaCamera, FaTimes } from 'react-icons/fa';
import apiService from "../../services/api";

const defaultAvatar = require("../../assets/img/theme/user-default.svg");

export default function StudentJoinClass() {
  const { classCode: urlClassCode } = useParams();
  const [classCode, setClassCode] = useState(urlClassCode || "");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);
  const [joinMode, setJoinMode] = useState(urlClassCode ? "manual" : "manual"); // "manual" or "qr"
  const [showQRScanner, setShowQRScanner] = useState(false);
  const [qrScanning, setQrScanning] = useState(false);
  const [qrError, setQrError] = useState("");
  const inputRef = useRef(null);
  const qrScannerRef = useRef(null);

  // Get user info from localStorage
  let user = null;
  try {
    user = JSON.parse(localStorage.getItem("scms_logged_in_user"));
  } catch (e) {
    user = null;
  }
  const userName = user?.full_name || user?.name || "Student User";
  const userEmail = user?.email || "student@email.com";
  const userAvatar = user?.profile_pic || defaultAvatar;

  React.useEffect(() => {
    if (inputRef.current && joinMode === "manual") inputRef.current.focus();
  }, [joinMode]);

  // Auto-submit if classCode is provided via URL (from QR code)
  React.useEffect(() => {
    if (urlClassCode && validateCode(urlClassCode)) {
      setClassCode(urlClassCode);
      // Auto-submit after a short delay to ensure component is fully loaded
      setTimeout(() => {
        handleSubmit({ preventDefault: () => {} });
      }, 1000);
    }
  }, [urlClassCode]);

  const validateCode = (code) => /^[a-zA-Z0-9]{5,8}$/.test(code);

  const handleInput = (e) => {
    let val = e.target.value.replace(/[^a-zA-Z0-9]/g, "");
    setClassCode(val);
    setError("");
    setSuccess("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    if (!classCode) {
      setError("Class code is required.");
      return;
    }
    if (!validateCode(classCode)) {
      setError("Class code must be 5–8 alphanumeric characters, no spaces or symbols.");
      return;
    }
    setLoading(true);
    
    try {
      const response = await apiService.joinClass(classCode);
      if (response.status) {
        setSuccess(response.message || "Successfully joined the class!");
        setTimeout(() => {
          window.location.href = "/student/index#my-classes";
        }, 2000);
      } else {
        setError(response.message || "Failed to join class. Please try again.");
      }
    } catch (error) {
      console.error('Error joining class:', error);
      setError(error.message || "Failed to join class. Please check the class code and try again.");
    } finally {
      setLoading(false);
    }
  };

  // QR Scanner functions
  const startQRScanner = async () => {
    try {
      setQrError("");
      setQrScanning(true);
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
          // Handle QR code scan result
          handleQRScanResult(decodedText);
        },
        (errorMessage) => {
          // Ignore errors during scanning
          console.log("QR Scanner error:", errorMessage);
        }
      );
    } catch (error) {
      setQrError("Failed to start QR scanner: " + error.message);
      setQrScanning(false);
    }
  };

  const stopQRScanner = async () => {
    if (qrScannerRef.current) {
      try {
        await qrScannerRef.current.stop();
        qrScannerRef.current = null;
      } catch (error) {
        console.log("Error stopping QR scanner:", error);
      }
    }
    setQrScanning(false);
  };

  const handleQRScanResult = async (decodedText) => {
    try {
      // Try to extract class code from QR code
      // QR code might contain: "Join class: ABC123" or just "ABC123"
      let code = decodedText.trim();
      
      // Handle URLs that contain class codes (from teacher QR codes)
      if (code.includes("/student/join/")) {
        const urlParts = code.split("/student/join/");
        if (urlParts.length > 1) {
          code = urlParts[1].split("?")[0]; // Remove query parameters if any
        }
      }
      
      // Remove common prefixes
      if (code.startsWith("Join class:")) {
        code = code.replace("Join class:", "").trim();
      }
      if (code.startsWith("Class code:")) {
        code = code.replace("Class code:", "").trim();
      }
      
      // Validate the extracted code
      if (validateCode(code)) {
        setClassCode(code);
        setQrError("");
        setShowQRScanner(false);
        stopQRScanner();
        
        // Show loading state
        setLoading(true);
        
        try {
          // Automatically join the class
          const response = await apiService.joinClass(code);
          if (response.status) {
            setSuccess(response.message || "Successfully joined the class!");
            // Redirect after showing success message
            setTimeout(() => {
              window.location.href = "/student/index#my-classes";
            }, 2000);
          } else {
            setError(response.message || "Failed to join class. Please try again.");
          }
        } catch (error) {
          console.error('Error joining class:', error);
          setError(error.message || "Failed to join class. Please check the class code and try again.");
        } finally {
          setLoading(false);
        }
      } else {
        setQrError("Invalid class code format in QR code. Expected 5-8 alphanumeric characters.");
      }
    } catch (error) {
      setQrError("Error processing QR code: " + error.message);
    }
  };

  const handleQRScannerToggle = () => {
    if (showQRScanner) {
      setShowQRScanner(false);
      stopQRScanner();
    } else {
      setShowQRScanner(true);
      setTimeout(() => {
        startQRScanner();
      }, 100);
    }
  };

  // Cleanup QR scanner on unmount
  useEffect(() => {
    return () => {
      stopQRScanner();
    };
  }, []);

  return (
    <div className="container mt-5 mb-5" style={{ maxWidth: 480 }}>
      <h3 className="mb-4" style={{ fontWeight: 600, fontSize: 20 }}>Join class</h3>
      


      {/* Join Method Selection */}
      <Card className="mb-4" style={{ borderRadius: 12, border: '1px solid #e0e0e0' }}>
        <CardBody style={{ padding: 24 }}>
          <div style={{ fontWeight: 600, fontSize: 14, marginBottom: 16 }}>Join Method</div>
          <ButtonGroup className="w-100 mb-3">
            <Button
              color={joinMode === "manual" ? "primary" : "light"}
              outline={joinMode !== "manual"}
              onClick={() => setJoinMode("manual")}
              style={{ flex: 1, borderRadius: '8px 0 0 8px' }}
            >
              <FaKeyboard className="me-2" />
              Type Code
            </Button>
            <Button
              color={joinMode === "qr" ? "primary" : "light"}
              outline={joinMode !== "qr"}
              onClick={() => setJoinMode("qr")}
              style={{ flex: 1, borderRadius: '0 8px 8px 0' }}
            >
              <FaQrcode className="me-2" />
              Scan QR
            </Button>
          </ButtonGroup>

          {joinMode === "manual" ? (
            /* Manual Code Entry */
            <div>
              <div style={{ fontWeight: 600, fontSize: 14, marginBottom: 8 }}>Class code</div>
              <div style={{ color: '#666', fontSize: 13, marginBottom: 18 }}>Ask your teacher for the class code, then enter it here.</div>
              {error && <Alert color="danger" fade>{error}</Alert>}
              {success && <Alert color="success" fade>{success}</Alert>}
              <Form onSubmit={handleSubmit} autoComplete="off">
                <FormGroup>
                  <Input
                    id="classCode"
                    name="classCode"
                    type="text"
                    placeholder="Class code"
                    value={classCode}
                    onChange={handleInput}
                    autoFocus
                    innerRef={inputRef}
                    maxLength={8}
                    minLength={5}
                    required
                    style={{ fontSize: 16, padding: '14px 16px', borderRadius: 8, border: '1px solid #bdbdbd', marginBottom: 0 }}
                    className={error ? "is-invalid" : ""}
                  />
                </FormGroup>
                <div className="d-flex justify-content-end mt-3">
                  <Button
                    type="button"
                    color="link"
                    style={{ fontWeight: 500, fontSize: 14, color: '#1976d2', textDecoration: 'none' }}
                    onClick={() => (window.location.href = "/student/index")}
                    disabled={loading}
                  >
                    Cancel
                  </Button>
                  <Button
                    color="primary"
                    type="submit"
                    style={{ fontWeight: 600, fontSize: 14, borderRadius: 8, marginLeft: 8, minWidth: 80 }}
                    disabled={loading}
                  >
                    {loading ? <Spinner size="sm" className="me-2" /> : null}
                    Join
                  </Button>
                </div>
              </Form>
            </div>
          ) : (
            /* QR Scanner */
            <div>
              <div style={{ fontWeight: 600, fontSize: 14, marginBottom: 8 }}>Scan QR Code</div>
              <div style={{ color: '#666', fontSize: 13, marginBottom: 18 }}>Point your camera at the QR code provided by your teacher.</div>
              
              {qrError && <Alert color="danger" fade>{qrError}</Alert>}
              
              <div className="text-center">
                <Button
                  color="primary"
                  size="lg"
                  onClick={handleQRScannerToggle}
                  style={{ borderRadius: 8, padding: '12px 24px' }}
                  disabled={qrScanning}
                >
                  {qrScanning ? (
                    <>
                      <Spinner size="sm" className="me-2" />
                      Scanning...
                    </>
                  ) : showQRScanner ? (
                    <>
                      <FaTimes className="me-2" />
                      Stop Scanner
                    </>
                  ) : (
                    <>
                      <FaCamera className="me-2" />
                      Start Scanner
                    </>
                  )}
                </Button>
              </div>

              {showQRScanner && (
                <div className="mt-3">
                  <div 
                    id="qr-reader" 
                    style={{ 
                      width: '100%', 
                      maxWidth: '400px', 
                      margin: '0 auto',
                      border: '2px solid #e0e0e0',
                      borderRadius: '8px',
                      overflow: 'hidden'
                    }}
                  ></div>
                </div>
              )}
            </div>
          )}
        </CardBody>
      </Card>

      {/* Instructions */}
      <div className="mb-2" style={{ color: '#222', fontWeight: 500, fontSize: 13 }}>To sign in with a class code</div>
      <ul style={{ color: '#444', fontSize: 13, marginBottom: 8, paddingLeft: 22 }}>
        <li>Use an authorized account</li>
        <li>Use a class code with 5-8 letters or numbers, and no spaces or symbols</li>
        {joinMode === "qr" && (
          <li>Make sure your camera has permission to access QR codes</li>
        )}
      </ul>
    </div>
  );
} 