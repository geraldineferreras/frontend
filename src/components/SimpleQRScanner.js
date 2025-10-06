import React, { useRef, useEffect, useState } from 'react';

const SimpleQRScanner = ({ onScan, onError, onClose }) => {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const streamRef = useRef(null);
  const [isScanning, setIsScanning] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    startCamera();
    return () => {
      stopCamera();
    };
  }, []);

  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          width: { ideal: 640 },
          height: { ideal: 480 },
          facingMode: 'environment'
        }
      });

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        streamRef.current = stream;
        setIsScanning(true);
        setError(null);
        
        // Start scanning when video is ready
        videoRef.current.onloadedmetadata = () => {
          startScanning();
        };
      }
    } catch (err) {
      console.error('Camera access failed:', err);
      setError(`Camera access failed: ${err.message}`);
      onError(err);
    }
  };

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    setIsScanning(false);
  };

  const startScanning = () => {
    if (!videoRef.current || !canvasRef.current) return;

    const video = videoRef.current;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');

    const scanFrame = () => {
      if (!isScanning) return;

      try {
        // Set canvas size to match video
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;

        // Draw video frame to canvas
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

        // Get image data for QR detection
        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);

        // Try to detect QR code (simplified - you'd need jsqr here)
        // For now, we'll just simulate detection
        detectQRCode(imageData);

        // Continue scanning
        requestAnimationFrame(scanFrame);
      } catch (err) {
        console.error('Scanning error:', err);
      }
    };

    scanFrame();
  };

  const detectQRCode = (imageData) => {
    // This is a placeholder - in a real implementation, you'd use jsqr
    // For now, we'll just simulate QR detection
    console.log('Scanning frame...');
  };

  const handleClose = () => {
    stopCamera();
    onClose();
  };

  return (
    <div style={{ position: 'relative', width: '100%', height: '100%' }}>
      <video
        ref={videoRef}
        autoPlay
        playsInline
        muted
        style={{ width: '100%', height: '100%', objectFit: 'cover' }}
      />
      <canvas
        ref={canvasRef}
        style={{ display: 'none' }}
      />
      
      {/* Scanning overlay */}
      <div style={{
        position: 'absolute',
        top: '50%',
        left: '50%',
        transform: 'translate(-50%, -50%)',
        width: '200px',
        height: '200px',
        border: '2px solid #17a2b8',
        borderRadius: '10px',
        background: 'transparent'
      }}>
        <div style={{
          position: 'absolute',
          top: '-2px',
          left: '-2px',
          width: '20px',
          height: '20px',
          borderTop: '3px solid #17a2b8',
          borderLeft: '3px solid #17a2b8'
        }} />
        <div style={{
          position: 'absolute',
          top: '-2px',
          right: '-2px',
          width: '20px',
          height: '20px',
          borderTop: '3px solid #17a2b8',
          borderRight: '3px solid #17a2b8'
        }} />
        <div style={{
          position: 'absolute',
          bottom: '-2px',
          left: '-2px',
          width: '20px',
          height: '20px',
          borderBottom: '3px solid #17a2b8',
          borderLeft: '3px solid #17a2b8'
        }} />
        <div style={{
          position: 'absolute',
          bottom: '-2px',
          right: '-2px',
          width: '20px',
          height: '20px',
          borderBottom: '3px solid #17a2b8',
          borderRight: '3px solid #17a2b8'
        }} />
      </div>

      {error && (
        <div style={{
          position: 'absolute',
          top: '10px',
          left: '10px',
          right: '10px',
          background: 'rgba(255,0,0,0.8)',
          color: 'white',
          padding: '10px',
          borderRadius: '5px',
          textAlign: 'center'
        }}>
          {error}
        </div>
      )}

      {isScanning && (
        <div style={{
          position: 'absolute',
          bottom: '10px',
          left: '50%',
          transform: 'translateX(-50%)',
          background: 'rgba(0,0,0,0.7)',
          color: 'white',
          padding: '8px 16px',
          borderRadius: '20px',
          fontSize: '14px'
        }}>
          Scanning...
        </div>
      )}
    </div>
  );
};

export default SimpleQRScanner; 