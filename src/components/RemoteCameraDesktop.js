import React, { useState, useRef, useEffect } from 'react';
import { QRCodeCanvas } from 'qrcode.react';
import io from 'socket.io-client';
import Peer from 'simple-peer';
// Add jsQR for QR code scanning
import jsQR from 'jsqr';

const SIGNALING_SERVER = 'http://192.168.1.254:5000'; // Change to your signaling server URL

export default function RemoteCameraDesktop() {
    const [sessionId] = useState(() => Math.random().toString(36).substr(2, 9));
    const [connected, setConnected] = useState(false);
    const [stream, setStream] = useState(null);
    const [qrResult, setQrResult] = useState(null);
    const videoRef = useRef();
    const canvasRef = useRef();
    const peerRef = useRef();
    const socketRef = useRef();
    const scanIntervalRef = useRef();

    // Setup WebRTC and signaling
    useEffect(() => {
        socketRef.current = io(SIGNALING_SERVER);
        socketRef.current.emit('join-session', sessionId);
        socketRef.current.on('signal', ({ data }) => {
            peerRef.current.signal(data);
        });
        socketRef.current.on('user-joined', () => {
            peerRef.current = new Peer({ initiator: true, trickle: false });
            peerRef.current.on('signal', data => {
                socketRef.current.emit('signal', { sessionId, data });
            });
            peerRef.current.on('stream', remoteStream => {
                setStream(remoteStream);
                setConnected(true);
                if (videoRef.current) {
                    videoRef.current.srcObject = remoteStream;
                }
            });
        });
        return () => {
            if (peerRef.current) peerRef.current.destroy();
            if (socketRef.current) socketRef.current.disconnect();
        };
    }, [sessionId]);

    // QR code scanning from video stream
    useEffect(() => {
        if (!stream || !videoRef.current) return;
        const video = videoRef.current;
        const canvas = canvasRef.current;
        const ctx = canvas.getContext('2d');
        let scanning = true;
        function scan() {
            if (!scanning) return;
            if (video.readyState === video.HAVE_ENOUGH_DATA) {
                canvas.width = video.videoWidth;
                canvas.height = video.videoHeight;
                ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
                const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
                const code = jsQR(imageData.data, imageData.width, imageData.height);
                if (code) {
                    setQrResult(code.data);
                }
            }
            scanIntervalRef.current = requestAnimationFrame(scan);
        }
        scanIntervalRef.current = requestAnimationFrame(scan);
        return () => {
            scanning = false;
            if (scanIntervalRef.current) cancelAnimationFrame(scanIntervalRef.current);
        };
    }, [stream]);

    return (
        <div style={{ textAlign: 'center', padding: 24 }}>
            <h3>Scan this QR code with your phone:</h3>
            <QRCodeCanvas value={`http://192.168.1.254:3000/remote-camera?session=${sessionId}`} size={256} />
            <div style={{ marginTop: 20 }}>
                <p>Waiting for camera connection...</p>
                {connected && <div style={{ color: 'green' }}>Remote camera connected!</div>}
            </div>
            <div style={{ marginTop: 24 }}>
                <video ref={videoRef} autoPlay playsInline style={{ width: 320, height: 240, borderRadius: 12, background: '#000' }} />
                <canvas ref={canvasRef} style={{ display: 'none' }} />
                {qrResult && (
                    <div style={{ marginTop: 16, color: '#28a745', fontWeight: 600 }}>
                        QR Code Detected: {qrResult}
                    </div>
                )}
            </div>
        </div>
    );
}