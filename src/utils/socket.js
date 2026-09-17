import { io } from 'socket.io-client';

const SOCKET_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:5000';

let socket = null;

export function getSocket() {
  if (!socket) {
    socket = io(SOCKET_URL, {
      transports: ['websocket', 'polling'],
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
    });

    socket.on('connect', () => {
      console.log('⚡ [Socket.IO] Connected to Sip & Savor Real-Time Bus:', socket.id);
    });

    socket.on('disconnect', () => {
      console.log('⚡ [Socket.IO] Disconnected from server');
    });

    socket.on('connect_error', (err) => {
      console.warn('⚡ [Socket.IO] Connection error:', err.message);
    });
  }

  return socket;
}

export function joinRoom(roomName) {
  const s = getSocket();
  if (s && roomName) {
    s.emit('join:room', roomName);
  }
}

export function leaveRoom(roomName) {
  const s = getSocket();
  if (s && roomName) {
    s.emit('leave:room', roomName);
  }
}

export default getSocket;
