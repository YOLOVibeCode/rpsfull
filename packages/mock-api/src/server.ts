/**
 * Mock API Server
 * 
 * Entry point for Mock API server
 */

import { createServer } from 'http';
import { createApp } from './app';
import { initializeDatabase } from './services/data.service';

const PORT = process.env.PORT || 3001;

// Initialize database
const db = initializeDatabase();

// Create Express app
const app = createApp(db);

// Create HTTP server
const server = createServer(app);

// Start server
server.listen(PORT, () => {
  console.log(`🚀 Mock API running on http://localhost:${PORT}`);
  console.log(`📚 Health check: http://localhost:${PORT}/health`);
  console.log(`📊 API base: http://localhost:${PORT}/api/v1`);
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM received, shutting down gracefully...');
  server.close(() => {
    console.log('Mock API server closed');
    process.exit(0);
  });
});

