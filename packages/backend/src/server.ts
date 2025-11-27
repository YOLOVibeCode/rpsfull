/**
 * Backend Server
 * 
 * Entry point for backend API server
 */

import { createServer } from 'http';
import { createApp } from './app';
import { initializeSocket } from './socket';

const PORT = process.env['API_PORT'] || process.env['PORT'] || 4444;

// Create Express app
const app = createApp();

// Create HTTP server
const server = createServer(app);

// Initialize Socket.io
initializeSocket(server);

// Start server
server.listen(PORT, () => {
  console.log(`🚀 Backend API running on http://localhost:${PORT}`);
  console.log(`📚 Health check: http://localhost:${PORT}/health`);
  console.log(`📊 API base: http://localhost:${PORT}/api/v1`);
  console.log(`🔌 WebSocket: ws://localhost:${PORT}/socket.io`);
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM received, shutting down gracefully...');
  server.close(() => {
    console.log('Backend API server closed');
    process.exit(0);
  });
});

