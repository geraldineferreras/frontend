import React, { useRef, useState, useEffect } from 'react';
// import opencv.js dynamically
// import react-easy-crop for cropping UI
// import jsPDF for optional PDF export (future)

/**
 * ScanPaper Component
 * - Opens camera, captures image
 * - Runs edge detection (opencv.js)
 * - Allows manual corner adjustment
 * - Applies perspective correction
 * - Shows filter options with live preview
 * - Allows retake/use scan, returns enhanced image
 */
const FILTERS = [
  { key: 'original', label: 'Original' },
  { key: 'magic', label: 'Magic Color' },
  { key: 'lighten', label: 'Lighten' },
  { key: 'noshadow', label: 'No Shadow' },
  { key: 'bw', label: 'B&W' },
  { key: 'eco', label: 'Eco' },
  { key: 'gray', label: 'Gray Scale' },
];

const ScanPaper = ({ onScan, onCancel, batchMode }) => {
  // Step 1: Camera
  const videoRef = useRef();
  const [cameraReady, setCameraReady] = useState(false);
  const [capturedImage, setCapturedImage] = useState(null);
  const [error, setError] = useState('');

  // Step 2: Edge Detection & Crop
  const [corners, setCorners] = useState(null); // [{x, y}, ...]
  const [adjusting, setAdjusting] = useState(false);

  // Step 3: Perspective Correction
  const [croppedImage, setCroppedImage] = useState(null);

  // Step 4: Filters
  const [selectedFilter, setSelectedFilter] = useState('original');
  const [filteredImage, setFilteredImage] = useState(null);

  // Step 5: Batch Mode (future)
  const [batch, setBatch] = useState([]);

  // Load opencv.js dynamically
  useEffect(() => {
    if (!window.cv) {
      const script = document.createElement('script');
      script.src = 'https://docs.opencv.org/4.x/opencv.js';
      script.async = true;
      script.onload = () => {
        // cv is now available
      };
      document.body.appendChild(script);
    }
  }, []);

  // Camera logic
  useEffect(() => {
    const startCamera = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: {
            width: { ideal: 1280 },
            height: { ideal: 720 },
            facingMode: 'environment' // Use back camera on mobile
          }
        });
        
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          videoRef.current.onloadedmetadata = () => {
            setCameraReady(true);
          };
        }
      } catch (err) {
        setError(`Camera access failed: ${err.message}`);
      }
    };

    if (!capturedImage) {
      startCamera();
    }

    return () => {
      if (videoRef.current && videoRef.current.srcObject) {
        videoRef.current.srcObject.getTracks().forEach(track => track.stop());
      }
    };
  }, [capturedImage]);

  // Capture image from video
  const captureImage = () => {
    if (videoRef.current && cameraReady) {
      const canvas = document.createElement('canvas');
      const video = videoRef.current;
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      
      const ctx = canvas.getContext('2d');
      ctx.drawImage(video, 0, 0);
      
      const dataUrl = canvas.toDataURL('image/jpeg', 0.9);
      setCapturedImage(dataUrl);
      
      // Stop camera after capture
      if (video.srcObject) {
        video.srcObject.getTracks().forEach(track => track.stop());
      }
    }
  };

  // Edge detection logic using OpenCV.js
  const detectEdges = () => {
    if (!window.cv || !capturedImage) {
      setError('OpenCV.js not loaded or no image captured');
      return;
    }

    const img = new Image();
    img.onload = () => {
      try {
        // Create canvas and draw image
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        canvas.width = img.width;
        canvas.height = img.height;
        ctx.drawImage(img, 0, 0);
        
        // Get image data for OpenCV
        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        const src = window.cv.matFromImageData(imageData);
        
        // Convert to grayscale
        const gray = new window.cv.Mat();
        window.cv.cvtColor(src, gray, window.cv.COLOR_RGBA2GRAY);
        
        // Apply Gaussian blur
        const blurred = new window.cv.Mat();
        window.cv.GaussianBlur(gray, blurred, new window.cv.Size(5, 5), 0);
        
        // Apply Canny edge detection
        const edges = new window.cv.Mat();
        window.cv.Canny(blurred, edges, 50, 150);
        
        // Find contours
        const contours = new window.cv.MatVector();
        const hierarchy = new window.cv.Mat();
        window.cv.findContours(edges, contours, hierarchy, window.cv.RETR_EXTERNAL, window.cv.CHAIN_APPROX_SIMPLE);
        
        // Find the largest contour (likely the document)
        let maxArea = 0;
        let documentContour = null;
        
        for (let i = 0; i < contours.size(); i++) {
          const contour = contours.get(i);
          const area = window.cv.contourArea(contour);
          
          if (area > maxArea && area > 1000) { // Minimum area threshold
            maxArea = area;
            documentContour = contour;
          }
        }
        
        if (documentContour) {
          // Approximate the contour to get corners
          const epsilon = 0.02 * window.cv.arcLength(documentContour, true);
          const approx = new window.cv.Mat();
          window.cv.approxPolyDP(documentContour, approx, epsilon, true);
          
          // If we have 4 points, we found a rectangle
          if (approx.rows === 4) {
            const points = [];
            for (let i = 0; i < 4; i++) {
              const point = approx.data32S.subarray(i * 2, i * 2 + 2);
              points.push({ x: point[0], y: point[1] });
            }
            
            // Sort corners: top-left, top-right, bottom-right, bottom-left
            const sortedPoints = sortCorners(points);
            setCorners(sortedPoints);
          } else {
            // Fallback: use image corners
            setCorners([
              { x: 0, y: 0 },
              { x: img.width, y: 0 },
              { x: img.width, y: img.height },
              { x: 0, y: img.height }
            ]);
          }
          
          approx.delete();
        } else {
          // Fallback: use image corners
          setCorners([
            { x: 0, y: 0 },
            { x: img.width, y: 0 },
            { x: img.width, y: img.height },
            { x: 0, y: img.height }
          ]);
        }
        
        // Clean up OpenCV objects
        src.delete();
        gray.delete();
        blurred.delete();
        edges.delete();
        contours.delete();
        hierarchy.delete();
        
      } catch (err) {
        setError(`Edge detection failed: ${err.message}`);
        // Fallback: use image corners
        setCorners([
          { x: 0, y: 0 },
          { x: img.width, y: 0 },
          { x: img.width, y: img.height },
          { x: 0, y: img.height }
        ]);
      }
    };
    
    img.src = capturedImage;
  };

  // Sort corners in order: top-left, top-right, bottom-right, bottom-left
  const sortCorners = (points) => {
    // Find center point
    const center = {
      x: points.reduce((sum, p) => sum + p.x, 0) / points.length,
      y: points.reduce((sum, p) => sum + p.y, 0) / points.length
    };
    
    // Sort by angle from center
    return points.sort((a, b) => {
      const angleA = Math.atan2(a.y - center.y, a.x - center.x);
      const angleB = Math.atan2(b.y - center.y, b.x - center.x);
      return angleA - angleB;
    });
  };

  // Manual corner adjustment logic
  const handleCornerDrag = (idx, newPos) => {
    if (corners) {
      const newCorners = [...corners];
      newCorners[idx] = newPos;
      setCorners(newCorners);
    }
  };

  // Corner overlay component
  const CornerOverlay = ({ corners, onCornerDrag }) => {
    if (!corners) return null;

    return (
      <div style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', pointerEvents: 'none' }}>
        {/* Draw lines between corners */}
        <svg width="100%" height="100%" style={{ position: 'absolute', top: 0, left: 0 }}>
          <polygon
            points={corners.map(c => `${c.x},${c.y}`).join(' ')}
            fill="none"
            stroke="#17a2b8"
            strokeWidth="3"
            strokeDasharray="5,5"
          />
        </svg>
        
        {/* Corner handles */}
        {corners.map((corner, idx) => (
          <div
            key={idx}
            style={{
              position: 'absolute',
              left: corner.x - 10,
              top: corner.y - 10,
              width: 20,
              height: 20,
              background: '#17a2b8',
              border: '2px solid white',
              borderRadius: '50%',
              cursor: 'move',
              pointerEvents: 'auto'
            }}
            onMouseDown={(e) => {
              e.preventDefault();
              const startX = e.clientX;
              const startY = e.clientY;
              const startCorner = { ...corner };
              
              const handleMouseMove = (e) => {
                const deltaX = e.clientX - startX;
                const deltaY = e.clientY - startY;
                const newPos = {
                  x: Math.max(0, Math.min(360, startCorner.x + deltaX)),
                  y: Math.max(0, Math.min(480, startCorner.y + deltaY))
                };
                onCornerDrag(idx, newPos);
              };
              
              const handleMouseUp = () => {
                document.removeEventListener('mousemove', handleMouseMove);
                document.removeEventListener('mouseup', handleMouseUp);
              };
              
              document.addEventListener('mousemove', handleMouseMove);
              document.addEventListener('mouseup', handleMouseUp);
            }}
          />
        ))}
      </div>
    );
  };

  // Perspective correction logic using OpenCV.js
  const applyPerspectiveCorrection = () => {
    if (!window.cv || !capturedImage || !corners) {
      setError('OpenCV.js not loaded or missing image/corners');
      return;
    }

    const img = new Image();
    img.onload = () => {
      try {
        // Create canvas and draw image
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        canvas.width = img.width;
        canvas.height = img.height;
        ctx.drawImage(img, 0, 0);
        
        // Get image data for OpenCV
        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        const src = window.cv.matFromImageData(imageData);
        
        // Calculate the width and height of the output image
        const width = Math.max(
          Math.sqrt(Math.pow(corners[1].x - corners[0].x, 2) + Math.pow(corners[1].y - corners[0].y, 2)),
          Math.sqrt(Math.pow(corners[2].x - corners[3].x, 2) + Math.pow(corners[2].y - corners[3].y, 2))
        );
        const height = Math.max(
          Math.sqrt(Math.pow(corners[3].x - corners[0].x, 2) + Math.pow(corners[3].y - corners[0].y, 2)),
          Math.sqrt(Math.pow(corners[2].x - corners[1].x, 2) + Math.pow(corners[2].y - corners[1].y, 2))
        );
        
        // Create source and destination points for perspective transform
        const srcPoints = window.cv.matFromArray(4, 1, window.cv.CV_32FC2, [
          corners[0].x, corners[0].y,
          corners[1].x, corners[1].y,
          corners[2].x, corners[2].y,
          corners[3].x, corners[3].y
        ]);
        
        const dstPoints = window.cv.matFromArray(4, 1, window.cv.CV_32FC2, [
          0, 0,
          width, 0,
          width, height,
          0, height
        ]);
        
        // Calculate perspective transform matrix
        const transformMatrix = window.cv.getPerspectiveTransform(srcPoints, dstPoints);
        
        // Apply perspective transform
        const warped = new window.cv.Mat();
        window.cv.warpPerspective(src, warped, transformMatrix, new window.cv.Size(width, height));
        
        // Convert back to canvas
        const outputCanvas = document.createElement('canvas');
        outputCanvas.width = width;
        outputCanvas.height = height;
        const outputCtx = outputCanvas.getContext('2d');
        
        // Convert OpenCV Mat to ImageData
        const outputImageData = new ImageData(
          new Uint8ClampedArray(warped.data),
          warped.cols,
          warped.rows
        );
        
        outputCtx.putImageData(outputImageData, 0, 0);
        
        // Convert to data URL
        const dataUrl = outputCanvas.toDataURL('image/jpeg', 0.9);
        setCroppedImage(dataUrl);
        
        // Clean up OpenCV objects
        src.delete();
        srcPoints.delete();
        dstPoints.delete();
        transformMatrix.delete();
        warped.delete();
        
      } catch (err) {
        setError(`Perspective correction failed: ${err.message}`);
      }
    };
    
    img.src = capturedImage;
  };

  // Filter application logic using OpenCV.js
  const applyFilter = (filterKey) => {
    if (!window.cv || !croppedImage) {
      setError('OpenCV.js not loaded or no cropped image');
      return;
    }

    if (filterKey === 'original') {
      setFilteredImage(null);
      return;
    }

    const img = new Image();
    img.onload = () => {
      try {
        // Create canvas and draw image
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        canvas.width = img.width;
        canvas.height = img.height;
        ctx.drawImage(img, 0, 0);
        
        // Get image data for OpenCV
        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        const src = window.cv.matFromImageData(imageData);
        
        let processed = new window.cv.Mat();
        
        switch (filterKey) {
          case 'magic':
            // Magic Color: vivid colors, sharp text, clean background
            processed = applyMagicColorFilter(src);
            break;
          case 'lighten':
            // Lighten: increase brightness
            processed = applyLightenFilter(src);
            break;
          case 'noshadow':
            // No Shadow: reduce shadows
            processed = applyNoShadowFilter(src);
            break;
          case 'bw':
            // B&W: pure black and white
            processed = applyBWFilter(src);
            break;
          case 'eco':
            // Eco: lower contrast, lighter colors
            processed = applyEcoFilter(src);
            break;
          case 'gray':
            // Gray Scale: traditional grayscale
            processed = applyGrayFilter(src);
            break;
          default:
            processed = src.clone();
        }
        
        // Convert back to canvas
        const outputCanvas = document.createElement('canvas');
        outputCanvas.width = processed.cols;
        outputCanvas.height = processed.rows;
        const outputCtx = outputCanvas.getContext('2d');
        
        // Convert OpenCV Mat to ImageData
        const outputImageData = new ImageData(
          new Uint8ClampedArray(processed.data),
          processed.cols,
          processed.rows
        );
        
        outputCtx.putImageData(outputImageData, 0, 0);
        
        // Convert to data URL
        const dataUrl = outputCanvas.toDataURL('image/jpeg', 0.9);
        setFilteredImage(dataUrl);
        
        // Clean up OpenCV objects
        src.delete();
        processed.delete();
        
      } catch (err) {
        setError(`Filter application failed: ${err.message}`);
      }
    };
    
    img.src = croppedImage;
  };

  // Filter implementations
  const applyMagicColorFilter = (src) => {
    const result = new window.cv.Mat();
    
    // Convert to LAB color space for better color manipulation
    const lab = new window.cv.Mat();
    window.cv.cvtColor(src, lab, window.cv.COLOR_RGBA2RGB);
    window.cv.cvtColor(lab, lab, window.cv.COLOR_RGB2Lab);
    
    // Split channels
    const channels = new window.cv.MatVector();
    window.cv.split(lab, channels);
    
    // Enhance contrast in L channel
    const l = channels.get(0);
    window.cv.convertScaleAbs(l, l, 1.2, 10);
    
    // Enhance saturation in a and b channels
    const a = channels.get(1);
    const b = channels.get(2);
    window.cv.convertScaleAbs(a, a, 1.3, 0);
    window.cv.convertScaleAbs(b, b, 1.3, 0);
    
    // Merge channels back
    window.cv.merge(channels, lab);
    
    // Convert back to RGB
    window.cv.cvtColor(lab, result, window.cv.COLOR_Lab2RGB);
    window.cv.cvtColor(result, result, window.cv.COLOR_RGB2RGBA);
    
    // Clean up
    lab.delete();
    channels.delete();
    
    return result;
  };

  const applyLightenFilter = (src) => {
    const result = new window.cv.Mat();
    window.cv.convertScaleAbs(src, result, 1.0, 30); // Increase brightness
    return result;
  };

  const applyNoShadowFilter = (src) => {
    const result = new window.cv.Mat();
    
    // Convert to grayscale
    const gray = new window.cv.Mat();
    window.cv.cvtColor(src, gray, window.cv.COLOR_RGBA2GRAY);
    
    // Apply adaptive histogram equalization to reduce shadows
    const clahe = new window.cv.CLAHE(2.0, new window.cv.Size(8, 8));
    clahe.apply(gray, gray);
    
    // Convert back to RGBA
    window.cv.cvtColor(gray, result, window.cv.COLOR_GRAY2RGBA);
    
    // Clean up
    gray.delete();
    
    return result;
  };

  const applyBWFilter = (src) => {
    const result = new window.cv.Mat();
    
    // Convert to grayscale
    const gray = new window.cv.Mat();
    window.cv.cvtColor(src, gray, window.cv.COLOR_RGBA2GRAY);
    
    // Apply binary threshold for pure black and white
    window.cv.threshold(gray, gray, 127, 255, window.cv.THRESH_BINARY);
    
    // Convert back to RGBA
    window.cv.cvtColor(gray, result, window.cv.COLOR_GRAY2RGBA);
    
    // Clean up
    gray.delete();
    
    return result;
  };

  const applyEcoFilter = (src) => {
    const result = new window.cv.Mat();
    
    // Reduce contrast and brightness for ink saving
    window.cv.convertScaleAbs(src, result, 0.8, 20);
    
    return result;
  };

  const applyGrayFilter = (src) => {
    const result = new window.cv.Mat();
    
    // Convert to grayscale (preserves gray tones)
    window.cv.cvtColor(src, result, window.cv.COLOR_RGBA2GRAY);
    window.cv.cvtColor(result, result, window.cv.COLOR_GRAY2RGBA);
    
    return result;
  };

  // UI
  return (
    <div style={{ width: 400, maxWidth: '100%', margin: '0 auto' }}>
      <h4>Scan Paper</h4>
      {error && <div style={{ color: 'red' }}>{error}</div>}
      {!capturedImage ? (
        <div>
          {/* Camera preview and capture button */}
          <video ref={videoRef} width={360} height={480} autoPlay playsInline style={{ borderRadius: 8, background: '#222' }} />
          <div style={{ marginTop: 16, textAlign: 'center' }}>
            <button 
              onClick={captureImage}
              disabled={!cameraReady}
              style={{
                padding: '12px 24px',
                fontSize: 16,
                fontWeight: 600,
                borderRadius: 8,
                border: 'none',
                background: cameraReady ? '#17a2b8' : '#ccc',
                color: 'white',
                cursor: cameraReady ? 'pointer' : 'not-allowed'
              }}
            >
              {cameraReady ? '📷 Capture Document' : 'Loading Camera...'}
            </button>
          </div>
        </div>
              ) : !corners ? (
          <div>
            {/* Show captured image, run edge detection */}
            <img src={capturedImage} alt="Captured" style={{ width: 360, borderRadius: 8 }} />
            <div style={{ marginTop: 16, textAlign: 'center' }}>
              <button 
                onClick={detectEdges}
                style={{
                  padding: '12px 24px',
                  fontSize: 16,
                  fontWeight: 600,
                  borderRadius: 8,
                  border: 'none',
                  background: '#28a745',
                  color: 'white',
                  marginRight: 8
                }}
              >
                🔍 Detect Document Edges
              </button>
              <button 
                onClick={() => setCapturedImage(null)}
                style={{
                  padding: '12px 24px',
                  fontSize: 16,
                  fontWeight: 600,
                  borderRadius: 8,
                  border: '2px solid #dc3545',
                  background: 'white',
                  color: '#dc3545'
                }}
              >
                📷 Retake
              </button>
            </div>
          </div>
        ) : !croppedImage ? (
          <div>
            {/* Show image with corners overlay, allow manual adjustment */}
            <div style={{ position: 'relative', display: 'inline-block' }}>
              <img src={capturedImage} alt="To Crop" style={{ width: 360, borderRadius: 8 }} />
              <CornerOverlay corners={corners} onCornerDrag={handleCornerDrag} />
            </div>
            <div style={{ marginTop: 16, textAlign: 'center' }}>
              <p style={{ fontSize: 14, color: '#666', marginBottom: 12 }}>
                Drag the blue corners to adjust the document boundaries
              </p>
              <button 
                onClick={applyPerspectiveCorrection}
                style={{
                  padding: '12px 24px',
                  fontSize: 16,
                  fontWeight: 600,
                  borderRadius: 8,
                  border: 'none',
                  background: '#17a2b8',
                  color: 'white',
                  marginRight: 8
                }}
              >
                ✂️ Crop & Flatten
              </button>
              <button 
                onClick={() => setCorners(null)}
                style={{
                  padding: '12px 24px',
                  fontSize: 16,
                  fontWeight: 600,
                  borderRadius: 8,
                  border: '2px solid #6c757d',
                  background: 'white',
                  color: '#6c757d'
                }}
              >
                ← Back
              </button>
            </div>
          </div>
              ) : (
          <div>
            {/* Show cropped image, filter options, preview */}
            <img src={filteredImage || croppedImage} alt="Preview" style={{ width: 360, borderRadius: 8, marginBottom: 16 }} />
            
            {/* Filter options */}
            <div style={{ marginBottom: 16 }}>
              <h6 style={{ marginBottom: 8, color: '#333' }}>🎨 Choose Enhancement Filter:</h6>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                {FILTERS.map(f => (
                  <button 
                    key={f.key} 
                    onClick={() => { 
                      setSelectedFilter(f.key); 
                      applyFilter(f.key); 
                    }} 
                    style={{ 
                      padding: '6px 12px',
                      fontSize: 12,
                      fontWeight: selectedFilter === f.key ? 600 : 400,
                      borderRadius: 6,
                      border: selectedFilter === f.key ? '2px solid #17a2b8' : '1px solid #ddd',
                      background: selectedFilter === f.key ? '#17a2b8' : 'white',
                      color: selectedFilter === f.key ? 'white' : '#333',
                      cursor: 'pointer'
                    }}
                  >
                    {f.label}
                  </button>
                ))}
              </div>
            </div>
            
            {/* Action buttons */}
            <div style={{ textAlign: 'center' }}>
              <button 
                onClick={() => setCapturedImage(null)}
                style={{
                  padding: '12px 24px',
                  fontSize: 16,
                  fontWeight: 600,
                  borderRadius: 8,
                  border: '2px solid #dc3545',
                  background: 'white',
                  color: '#dc3545',
                  marginRight: 8
                }}
              >
                📷 Retake
              </button>
              <button 
                onClick={() => onScan(filteredImage || croppedImage)}
                style={{
                  padding: '12px 24px',
                  fontSize: 16,
                  fontWeight: 600,
                  borderRadius: 8,
                  border: 'none',
                  background: '#28a745',
                  color: 'white'
                }}
              >
                ✅ Use Scan
              </button>
            </div>
          </div>
        )}
    </div>
  );
};

export default ScanPaper; 