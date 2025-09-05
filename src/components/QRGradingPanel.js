import React, { useState, useRef, useEffect } from "react";
import { Button, Input, Dropdown, DropdownToggle, DropdownMenu, DropdownItem, Modal, ModalHeader, ModalBody, ModalFooter, Label } from "reactstrap";
import { FaCamera, FaPaperclip } from "react-icons/fa";
import jsQR from "jsqr";

// Helper functions for file type color/label
const getFileTypeColor = (ext) => {
  const colors = {
    'pdf': '#dc3545', 'doc': '#007bff', 'docx': '#007bff', 'xls': '#28a745', 'xlsx': '#28a745',
    'ppt': '#fd7e14', 'pptx': '#fd7e14', 'mp3': '#28a745', 'mp4': '#6f42c1', 'avi': '#6f42c1',
    'mov': '#6f42c1', 'jpg': '#6c757d', 'jpeg': '#6c757d', 'png': '#6c757d', 'gif': '#6c757d',
    'txt': '#6c757d', 'zip': '#fd7e14', 'rar': '#fd7e14', 'exe': '#6c757d',
  };
  return colors[ext] || '#6c757d';
};
const getFileTypeLabel = (ext) => {
  const labels = {
    'pdf': 'PDF', 'doc': 'WORD', 'docx': 'WORD', 'xls': 'EXCEL', 'xlsx': 'EXCEL', 'ppt': 'PPT', 'pptx': 'PPT',
    'mp3': 'MP3', 'mp4': 'MP4', 'avi': 'MP4', 'mov': 'MP4', 'jpg': 'JPG', 'jpeg': 'JPG', 'png': 'PNG', 'gif': 'GIF',
    'txt': 'TXT', 'zip': 'ZIP', 'rar': 'RAR', 'exe': 'FILE',
  };
  return labels[ext] || 'FILE';
};

const QRGradingPanel = ({ student, onGradeSubmit }) => {
  // State and refs
  const [audioType, setAudioType] = useState("female");
  const [cameraDevices, setCameraDevices] = useState([]);
  const [selectedQRCamera, setSelectedQRCamera] = useState("");
  const [cameraDropdownOpen, setCameraDropdownOpen] = useState(false);
  const [scannerOn, setScannerOn] = useState(false);
  const [scannerMessage, setScannerMessage] = useState("");
  const [scannerStatus, setScannerStatus] = useState(null);
  const qrVideoRef = useRef();
  const qrCanvasRef = useRef();
  const scanLoopRef = useRef();
  const [score, setScore] = useState("");
  const [feedback, setFeedback] = useState("");
  const [attachmentDropdownOpen, setAttachmentDropdownOpen] = useState(false);
  const [attachmentFiles, setAttachmentFiles] = useState([]);
  const fileInputRef = useRef();
  const [scannedInfo, setScannedInfo] = useState(null);

  // Camera enumeration
  useEffect(() => {
    const enumerateCameras = async () => {
      try {
        const devices = await navigator.mediaDevices.enumerateDevices();
        const videoDevices = devices.filter(device => device.kind === 'videoinput');
        setCameraDevices(videoDevices);
        if (videoDevices.length > 0) setSelectedQRCamera(videoDevices[0].deviceId);
      } catch (e) {}
    };
    enumerateCameras();
  }, []);

  // QR scanning loop with jsQR
  useEffect(() => {
    if (scannerOn && qrVideoRef.current && qrCanvasRef.current) {
      const video = qrVideoRef.current;
      const canvas = qrCanvasRef.current;
      const ctx = canvas.getContext('2d', { willReadFrequently: true });
      let stopped = false;
      const scanFrame = () => {
        if (stopped) return;
        if (video.readyState === video.HAVE_ENOUGH_DATA && video.videoWidth > 0) {
          canvas.width = video.videoWidth;
          canvas.height = video.videoHeight;
          ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
          const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
          const code = jsQR(imageData.data, imageData.width, imageData.height, { inversionAttempts: "dontInvert" });
            if (code && code.data) {
              // Parse student ID from QR code (expects: IDNo: 2021305973)
            const idMatch = code.data.match(/IDNo:\s*(\d{1,})/);
            if (idMatch) {
              const info = {};
              // Try to extract more info from the QR code if available
              code.data.split('\n').forEach(line => {
                const [key, ...rest] = line.split(':');
                if (key && rest.length) info[key.trim()] = rest.join(':').trim();
              });
              info.IDNo = idMatch[1];
              setScannedInfo(info);
                const numericScore = parseFloat(score);
                // Always show success UI for a valid scan; submit only if score is present
                setScannerStatus("success");
                if (!Number.isFinite(numericScore)) {
                  setScannerMessage("Scan OK. Enter a score, then rescan to save.");
                } else {
                  setScannerMessage("Student found: " + idMatch[1]);
                  onGradeSubmit({
                    studentId: idMatch[1],
                    score: numericScore,
                    feedback,
                    attachments: attachmentFiles,
                    dateGraded: new Date().toLocaleString(),
                    qrData: code.data,
                  });
                  // After submitting, briefly flash a saved message
                  setScannerMessage("Saved ✓");
                }
              // Reset form fields for next scan
              setScore("");
              setFeedback("");
              setAttachmentFiles([]);
              // Removed setTimeout(() => setScannerStatus(null), 2000);
            } else {
              setScannerStatus("error");
              setScannerMessage("Invalid QR code format. Expected: IDNo: 2021305973");
            }
            stopped = true;
            // Do not auto-turn off the scanner after a scan; let the user control it
            return;
          }
        }
        scanLoopRef.current = requestAnimationFrame(scanFrame);
      };
      scanFrame();
      return () => {
        stopped = true;
        if (scanLoopRef.current) cancelAnimationFrame(scanLoopRef.current);
      };
    }
  }, [scannerOn, score, feedback, attachmentFiles, onGradeSubmit]);

  // When a QR is scanned, parse and set scannedInfo
  const handleQRScan = (qrData) => {
    let info = null;
    try {
      // Try JSON first
      info = JSON.parse(qrData);
    } catch {
      // Fallback: parse as key-value lines
      info = {};
      qrData.split('\n').forEach(line => {
        const [key, ...rest] = line.split(':');
        if (key && rest.length) info[key.trim()] = rest.join(':').trim();
      });
    }
    setScannedInfo(info);
    // Optionally: auto-fill score if present
    if (info.score) setScore(info.score);
  };

  // Camera stream management
  const handleToggleScanner = async () => {
    if (scannerOn) {
      setScannerOn(false);
      setScannerMessage("");
      if (qrVideoRef.current && qrVideoRef.current.srcObject) {
        qrVideoRef.current.srcObject.getTracks().forEach(track => track.stop());
        qrVideoRef.current.srcObject = null;
      }
    } else {
      setScannerOn(true);
      setScannerMessage("Initializing camera...");
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: selectedQRCamera ? { deviceId: { exact: selectedQRCamera } } : true
        });
        if (qrVideoRef.current) {
          qrVideoRef.current.srcObject = stream;
          setScannerMessage("Camera active! Point at QR code.");
        }
      } catch (err) {
        setScannerOn(false);
        setScannerMessage("Camera error: " + (err.message || "Unknown error"));
      }
    }
  };

  // File attachment
  const handleAttachmentChange = (files) => {
    setAttachmentFiles(files);
  };

  // Render attachments
  const renderAttachments = () => (
    attachmentFiles.length > 0 && (
      <div style={{ marginTop: 8, display: 'flex', flexWrap: 'nowrap', gap: 8, overflowX: 'auto', paddingBottom: 4 }}>
        {attachmentFiles.map((att, idx) => {
          const url = att.file ? URL.createObjectURL(att.file) : undefined;
          const ext = att.name.split('.').pop().toLowerCase();
          const isImage = att.file && att.file.type.startsWith('image/');
          const fileColor = getFileTypeColor(ext);
          const fileLabel = getFileTypeLabel(ext);
          return (
            <div key={idx} style={{ background: '#fff', borderRadius: 6, boxShadow: '0 1px 4px #e9ecef', padding: '0.35rem 0.75rem', display: 'flex', alignItems: 'center', gap: 8, minWidth: 140, maxWidth: 240, fontSize: 13, flexShrink: 0 }}>
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginRight: 6 }}>
                {isImage ? (
                  <img src={url} alt={att.name} style={{ width: 24, height: 30, objectFit: 'cover', borderRadius: 3 }} />
                ) : (
                  <svg width="24" height="30" viewBox="0 0 24 30" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <rect width="24" height="30" rx="4" fill="#fff" stroke={fileColor} strokeWidth="1.5"/>
                    <path d="M6 6h12v18H6z" fill="#fff"/>
                    <text x="12" y="20" textAnchor="middle" fontSize="9" fill={fileColor} fontWeight="bold">{fileLabel}</text>
                  </svg>
                )}
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontWeight: 600, fontSize: 12, color: '#232b3b', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: 100 }} title={att.name}>{att.name}</div>
                <div style={{ fontSize: 11, color: '#90A4AE', marginTop: 1, display: 'flex', alignItems: 'center', gap: 4 }}>
                  {fileLabel}
                  {url && (
                    <>
                      <span style={{ color: '#6c757d', fontSize: 8 }}>•</span>
                      <a href={url} download={att.name} style={{ color: fileColor, fontWeight: 600, textDecoration: 'none', fontSize: 11 }}>Download</a>
                    </>
                  )}
                </div>
              </div>
              <Button close onClick={() => setAttachmentFiles(attachmentFiles.filter((_, i) => i !== idx))} style={{ fontSize: 16, marginLeft: 3, padding: 0 }} />
            </div>
          );
        })}
      </div>
    )
  );

  return (
    <div style={{ width: '100%', maxWidth: 400 }}>
      <div className="mb-2">
        <Label className="font-weight-bold" style={{ fontSize: 15 }}>Audio Notification</Label>
        <Input type="select" value={audioType} onChange={e => setAudioType(e.target.value)} bsSize="md" style={{ fontSize: 15 }}>
          <option value="female">Female</option>
          <option value="male">Male</option>
        </Input>
        <Button 
          color="info" 
          size="sm" 
          onClick={() => {
            console.log('Testing audio notification:', audioType);
            const audioSrc = audioType === 'female'
              ? '/grading-success-female.mp3'
              : '/grading-success-male.mp3';
            
            console.log('Audio file path:', audioSrc);
            console.log('Current URL:', window.location.href);
            console.log('Full audio URL:', window.location.origin + audioSrc);
            
            const tryPlayAudio = (src, attempt = 1) => {
              console.log(`Attempt ${attempt}: Trying audio source:`, src);
              
              const audio = new Audio(src);
              audio.addEventListener('loadstart', () => console.log(`Test audio load started (attempt ${attempt})`));
              audio.addEventListener('canplay', () => console.log(`Test audio can play (attempt ${attempt})`));
              audio.addEventListener('error', (e) => {
                console.error(`Test audio error (attempt ${attempt}):`, e);
                if (attempt === 1) {
                  // Try alternative path
                  const altSrc = attempt === 1 ? `./grading-success-${audioType}.mp3` : `grading-success-${audioType}.mp3`;
                  console.log('Trying alternative path:', altSrc);
                  tryPlayAudio(altSrc, 2);
                } else {
                  alert('Audio file not found. Please check if the audio files are properly deployed.\n\nExpected files:\n- /grading-success-female.mp3\n- /grading-success-male.mp3');
                }
              });
              
              audio.volume = 0.8;
              const playPromise = audio.play();
              
              if (playPromise !== undefined) {
                playPromise
                  .then(() => console.log(`Test audio played successfully (attempt ${attempt})`))
                  .catch((error) => {
                    console.error(`Test audio play failed (attempt ${attempt}):`, error);
                    if (attempt === 1) {
                      // Try alternative path
                      const altSrc = `./grading-success-${audioType}.mp3`;
                      console.log('Trying alternative path due to play error:', altSrc);
                      tryPlayAudio(altSrc, 2);
                    } else {
                      alert('Audio play failed: ' + error.message + '\n\nThis might be due to browser autoplay policy. Try clicking somewhere on the page first, then test again.');
                    }
                  });
              }
            };
            
            tryPlayAudio(audioSrc);
          }}
          style={{ marginTop: 8, fontSize: 12 }}
        >
          🔊 Test Audio
        </Button>
      </div>
      <div className="mb-2">
        <Label className="font-weight-bold" style={{ fontSize: 15 }}>QR Scanner Camera</Label>
        <Dropdown isOpen={cameraDropdownOpen} toggle={() => setCameraDropdownOpen(o => !o)} style={{ display: 'inline-block', width: '100%' }}>
          <DropdownToggle color="secondary" outline block style={{ borderRadius: 10, fontWeight: 600, fontSize: 15, padding: '8px 0', textAlign: 'left' }}>
            <FaCamera className="mr-2" style={{ fontSize: 16 }} />
            {cameraDevices.find(d => d.deviceId === selectedQRCamera)?.label || 'Select Camera'}
          </DropdownToggle>
          <DropdownMenu style={{ width: '100%', maxHeight: 200, overflowY: 'auto' }}>
            {cameraDevices.map(device => (
              <DropdownItem 
                key={device.deviceId} 
                onClick={() => setSelectedQRCamera(device.deviceId)}
                active={selectedQRCamera === device.deviceId}
              >
                <div style={{ fontSize: 14 }}>
                  <div style={{ fontWeight: 600 }}>{device.label}</div>
                  {(device.label.toLowerCase().includes('droidcam') || device.label.toLowerCase().includes('virtual')) && (
                    <div style={{ fontSize: 12, color: '#17a2b8' }}>Virtual Camera</div>
                  )}
                </div>
              </DropdownItem>
            ))}
            <DropdownItem divider />
            <DropdownItem onClick={() => navigator.mediaDevices.enumerateDevices().then(devices => setCameraDevices(devices.filter(d => d.kind === 'videoinput')))}>
              <FaCamera className="mr-2" />Refresh Cameras
            </DropdownItem>
          </DropdownMenu>
        </Dropdown>
      </div>
      <Button color="primary" size="sm" style={{ fontWeight: 700, borderRadius: 16, padding: '2px 18px', background: '#6366f1', border: 'none', marginBottom: 12 }} onClick={handleToggleScanner}>
        {scannerOn ? "Turn Off QR Scanner" : "Turn On QR Scanner"}
      </Button>
      {scannerOn && (
        <div style={{ position: 'relative', width: 240, height: 240, margin: '0 auto' }}>
          <video
            ref={qrVideoRef}
            autoPlay
            playsInline
            muted
            style={{ width: 240, height: 240, border: '2px solid #17a2b8', borderRadius: 8, objectFit: 'cover', display: 'block' }}
          />
          <canvas ref={qrCanvasRef} style={{ display: 'none' }} />
          <div style={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: 240,
            height: 240,
            border: scannerStatus === 'success' ? '3px solid #28a745' : scannerStatus === 'error' ? '3px solid #dc3545' : '3px solid #17a2b8',
            borderRadius: 8,
            pointerEvents: 'none',
            background: 'none',
            boxSizing: 'border-box',
          }} />
        </div>
      )}
      {/* Student Found or Not Found Message */}
      {scannerStatus === 'success' && scannedInfo && (
        (() => {
          let studentList = Array.isArray(student) ? student : (student ? [student] : []);
          // Normalize scanned ID and name
          const scannedId = (scannedInfo.IDNo || scannedInfo.id || '').toString().trim();
          const scannedName = (scannedInfo["Full Name"] || scannedInfo.name || '').toLowerCase().trim();
          // Robust match: check id (string/number) and name (case-insensitive, trimmed)
          const found = studentList.some(s => {
            const sidCandidates = [s.student_num, s.student_id, s.id]
              .map(v => (v === undefined || v === null) ? '' : String(v).trim());
            const sname = (s.student_name || s.name || '').toLowerCase().trim();
            return (scannedId && sidCandidates.includes(scannedId)) || (scannedName && sname === scannedName);
          });
          if (found) {
            const audioSrc = audioType === 'female'
              ? '/grading-success-female.mp3'
              : '/grading-success-male.mp3';
            
            if (!window.__qrGradingLastPlayed || window.__qrGradingLastPlayed !== scannedId) {
              console.log('Playing QR grading audio:', { audioType, audioSrc, scannedId });
              
              const audio = new window.Audio(audioSrc);
              
              // Add event listeners for debugging
              audio.addEventListener('loadstart', () => console.log('QR Audio load started'));
              audio.addEventListener('canplay', () => console.log('QR Audio can play'));
              audio.addEventListener('error', (e) => console.error('QR Audio error:', e));
              
              audio.volume = 0.8;
              const playPromise = audio.play();
              
              if (playPromise !== undefined) {
                playPromise
                  .then(() => {
                    console.log('QR grading audio played successfully');
                    window.__qrGradingLastPlayed = scannedId;
                  })
                  .catch((error) => {
                    console.error('QR grading audio play failed:', error);
                    // Try fallback beep sound
                    try {
                      const audioContext = new (window.AudioContext || window.webkitAudioContext)();
                      const oscillator = audioContext.createOscillator();
                      const gainNode = audioContext.createGain();
                      
                      oscillator.connect(gainNode);
                      gainNode.connect(audioContext.destination);
                      
                      oscillator.frequency.value = 800;
                      oscillator.type = 'sine';
                      
                      gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
                      gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.5);
                      
                      oscillator.start(audioContext.currentTime);
                      oscillator.stop(audioContext.currentTime + 0.5);
                      
                      console.log('Played fallback beep for QR grading');
                      window.__qrGradingLastPlayed = scannedId;
                    } catch (fallbackError) {
                      console.error('Fallback audio also failed:', fallbackError);
                    }
                  });
              }
            }
          }
          if (!found) {
            return (
              <div style={{
                background: '#fdeaea',
                border: '2px solid #dc3545',
                borderRadius: 8,
                boxShadow: '0 1px 4px #dc354522',
                padding: '8px 10px',
                margin: '8px 0',
                color: '#dc3545',
                minWidth: 160,
                maxWidth: 260,
                fontWeight: 700,
                fontSize: 13
              }}>
                {Number.isFinite(parseFloat(score)) ? 'Student Not Found ✗' : 'Scan OK'}
                <div style={{ color: '#dc3545', fontWeight: 400, fontSize: 11, marginTop: 2 }}>
                  {Number.isFinite(parseFloat(score))
                    ? 'Please scan another student.'
                    : (scannerMessage || 'Enter a score, then rescan to save.')}
                </div>
              </div>
            );
          }
          // If found, show the green box
          const matchedStudent = studentList.find(s => {
            const sidCandidates = [s.student_num, s.student_id, s.id]
              .map(v => (v === undefined || v === null) ? '' : String(v).trim());
            const sname = (s.student_name || s.name || '').toLowerCase().trim();
            return (scannedId && sidCandidates.includes(scannedId)) || (scannedName && sname === scannedName);
          });
          return (
            <div style={{
              background: '#eafbe7',
              border: '2px solid #27ae60',
              borderRadius: 8,
              boxShadow: '0 1px 4px #27ae6022',
              padding: '8px 10px',
              margin: '8px 0',
              color: '#232b3b',
              minWidth: 160,
              maxWidth: 260,
            }}>
              <div style={{ fontWeight: 700, color: '#27ae60', fontSize: 13, marginBottom: 4 }}>
                Student Found ✓
              </div>
              <div style={{ display: 'flex', alignItems: 'center', marginBottom: 4 }}>
                <img src={matchedStudent?.profile_image_url || matchedStudent?.avatar || student?.profile_image_url || student?.avatar || 'https://randomuser.me/api/portraits/lego/1.jpg'} alt={scannedInfo["Full Name"] || scannedInfo.name || ''} style={{ width: 28, height: 28, borderRadius: '50%', objectFit: 'cover', border: '1.5px solid #e9ecef', marginRight: 8 }} />
                <div>
                  <div style={{ fontWeight: 700, fontSize: 13, color: '#232b3b' }}>{scannedInfo["Full Name"] || scannedInfo.name || ''}</div>
                  <div style={{ color: '#888', fontWeight: 500, fontSize: 11 }}>ID: {scannedInfo.IDNo || scannedInfo.id || ''}</div>
                  <div style={{ color: '#888', fontWeight: 500, fontSize: 11 }}>Program: {scannedInfo.Program || scannedInfo.program || ''}</div>
                </div>
              </div>
              {!Number.isFinite(parseFloat(score)) && (
                <div style={{ color: '#27ae60', fontWeight: 600, fontSize: 12 }}>
                  {scannerMessage || 'Enter a score, then rescan to save.'}
                </div>
              )}
            </div>
          );
        })()
      )}
      {scannerStatus === 'error' && (
        <div style={{
          background: '#fdeaea',
          border: '2px solid #dc3545',
          borderRadius: 8,
          padding: '18px 24px',
          margin: '16px 0',
          color: '#232b3b',
          display: 'flex',
          alignItems: 'center',
          gap: 18,
          minHeight: 80,
        }}>
          <div style={{ fontWeight: 700, color: '#dc3545', fontSize: 18, marginRight: 18 }}>
            Student Not Found ✗
          </div>
          <div style={{ color: '#dc3545', fontWeight: 600, fontSize: 16 }}>{scannerMessage}</div>
        </div>
      )}
      {/* End Student Found/Not Found Message */}
      <div className="mb-2">
        <Label className="font-weight-bold" style={{ fontSize: 15 }}>Score</Label>
        <Input
          type="number"
          min="0"
          max="100"
          value={score}
          onChange={e => setScore(e.target.value)}
          placeholder={`Enter score (out of 100)`}
          bsSize="md"
          style={{ fontSize: 15, borderColor: Number(score) > 100 ? '#dc3545' : undefined }}
        />
        {Number(score) > 100 && (
          <div style={{ color: '#dc3545', fontSize: 12, marginTop: 4 }}>
            Score cannot be greater than total points.
          </div>
        )}
      </div>
      <div className="mb-2">
        <Label className="font-weight-bold" style={{ fontSize: 15 }}>Attachment</Label>
        <Dropdown isOpen={attachmentDropdownOpen} toggle={() => setAttachmentDropdownOpen(o => !o)} style={{ display: 'inline-block' }}>
          <DropdownToggle color="secondary" size="md" style={{ borderRadius: 10, fontWeight: 600, fontSize: 15, padding: '2px 8px' }}>
            <FaPaperclip className="mr-1" style={{ fontSize: 15 }} />
          </DropdownToggle>
          <DropdownMenu>
            <DropdownItem onClick={() => fileInputRef.current.click()}>File</DropdownItem>
          </DropdownMenu>
        </Dropdown>
        <input
          type="file"
          ref={fileInputRef}
          style={{ display: 'none' }}
          onChange={e => {
            const files = Array.from(e.target.files).map(file => ({ name: file.name, file }));
            handleAttachmentChange([...attachmentFiles, ...files]);
            e.target.value = "";
          }}
        />
        {renderAttachments()}
      </div>
      <div className="mb-2">
        <Label className="font-weight-bold" style={{ fontSize: 15 }}>Feedback</Label>
        <Input
          type="textarea"
          rows={2}
          value={feedback}
          onChange={e => setFeedback(e.target.value)}
          placeholder="Optional feedback..."
          bsSize="md"
          style={{ fontSize: 15 }}
        />
        <Button color="info" outline size="md" className="mt-2" style={{ borderRadius: 10, fontWeight: 600, fontSize: 15, padding: '2px 8px' }}>
          Audio Feedback
        </Button>
      </div>
      <Button
        color="secondary"
        outline
        size="md"
        onClick={() => {
          setScore("");
          setFeedback("");
          setAttachmentFiles([]);
          setScannerMessage('Form cleared. Ready for next scan.');
        }}
        style={{ borderRadius: 10, fontWeight: 600, fontSize: 15, padding: '4px 12px' }}
      >
        Clear Form
      </Button>
    </div>
  );
};

export default QRGradingPanel; 