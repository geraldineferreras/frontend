import React, { useEffect, useRef, useState } from 'react';
import io from 'socket.io-client';
import Peer from 'simple-peer';

const SIGNALING_SERVER = 'http://192.168.1.254:5000'; // Use your local IP

export default function RemoteCameraMobile() {
  const videoRef = useRef();
  const [connected, setConnected] = useState(false);
  const [error, setError] = useState(null);
  const [stream, setStream] = useState(null);
  const [permission, setPermission] = useState(false);

  // Get session from URL
  const urlParams = new URLSearchParams(window.location.search);
  const sessionId = urlParams.get('session');

  useEffect(() => {
    if (!sessionId) {
      setError('No session ID provided.');
      return;
    }
    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      setError('Camera access is not supported in this browser. Please use Chrome, Firefox, or Safari. Avoid in-app browsers.');
      return;
    }
    let peer;
    let socket;
    let localStream;
    
    // Request camera permission and get stream
    navigator.mediaDevices.getUserMedia({ video: true, audio: false })
      .then(s => {
        setPermission(true);
        setStream(s);
        if (videoRef.current) {
          videoRef.current.srcObject = s;
        }
        // Connect to signaling server
        socket = io(SIGNALING_SERVER);
        socket.emit('join-session', sessionId);
        // Create peer as non-initiator
        peer = new Peer({ initiator: false, trickle: false, stream: s });
        peer.on('signal', data => {
          socket.emit('signal', { sessionId, data });
        });
        socket.on('signal', ({ data }) => {
          peer.signal(data);
        });
        peer.on('connect', () => {
          setConnected(true);
        });
        peer.on('error', err => {
          setError('Peer connection error: ' + err.message);
        });
      })
      .catch(err => {
        setError('Camera permission denied or not available.');
      });
    return () => {
      if (peer) peer.destroy();
      if (socket) socket.disconnect();
      if (stream) stream.getTracks().forEach(track => track.stop());
    };
    // eslint-disable-next-line
  }, [sessionId]);

  return (
    <div style={{ textAlign: 'center', padding: 24 }}>
      <h2>Remote Camera</h2>
      {error && <div style={{ color: 'red', marginBottom: 12 }}>{error}</div>}
      {!permission && !error && <div>Requesting camera permission...</div>}
      <video ref={videoRef} autoPlay playsInline style={{ width: '100%', maxWidth: 400, borderRadius: 12, margin: '16px 0' }} />
      {connected && <div style={{ color: 'green' }}>Connected to desktop!</div>}
      {!connected && permission && <div>Waiting for connection...</div>}
    </div>
  );
} 