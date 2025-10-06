console.log('Starting signaling server...');
const express = require('express');
const http = require('http');
const { Server } = require('socket.io');

const app = express();
const server = http.createServer(app);
const io = new Server(server, { cors: { origin: '*' } });

io.on('connection', (socket) => {
  socket.on('join-session', (sessionId) => {
    socket.join(sessionId);
    socket.sessionId = sessionId;
    io.to(sessionId).emit('user-joined', socket.id);
  });

  socket.on('signal', ({ sessionId, data }) => {
    socket.to(sessionId).emit('signal', { from: socket.id, data });
  });

  socket.on('disconnect', () => {
    if (socket.sessionId) {
      io.to(socket.sessionId).emit('user-left', socket.id);
    }
  });
});

server.listen(4000, () => {
  console.log('Signaling server running on http://localhost:4000');
});