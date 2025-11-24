/**
 * Socket.io Configuration
 * 
 * Real-time WebSocket server setup
 */

import { Server as HttpServer } from 'http';
import { Server as SocketServer, Socket } from 'socket.io';
import { authMiddleware } from '../middleware/auth.middleware';
import { AuthenticatedRequest } from '../middleware/auth.middleware';

export interface AuthenticatedSocket extends Socket {
  userId?: string;
  user?: {
    id: string;
    email: string;
    role: string;
  };
}

/**
 * Create Socket.io server
 */
export function createSocketServer(httpServer: HttpServer): SocketServer {
  const io = new SocketServer(httpServer, {
    cors: {
      origin: process.env.CORS_ORIGIN || '*',
      credentials: true,
    },
    path: '/socket.io',
  });

  // Authentication middleware for Socket.io
  io.use(async (socket: AuthenticatedSocket, next) => {
    try {
      const token = socket.handshake.auth?.token || socket.handshake.headers?.authorization?.replace('Bearer ', '');

      if (!token) {
        return next(new Error('Authentication error: No token provided'));
      }

      // Verify JWT token (simplified - in production, use proper JWT verification)
      const jwt = require('jsonwebtoken');
      const decoded = jwt.verify(token, process.env.JWT_SECRET || 'secret') as {
        userId: string;
        email?: string;
        role?: string;
      };

      socket.userId = decoded.userId;
      socket.user = {
        id: decoded.userId,
        email: decoded.email || '',
        role: decoded.role || 'player',
      };

      next();
    } catch (error) {
      next(new Error('Authentication error: Invalid token'));
    }
  });

  // Connection handler
  io.on('connection', (socket: AuthenticatedSocket) => {
    console.log(`🔌 Socket connected: ${socket.id} (User: ${socket.userId})`);

    // Join user's personal room
    if (socket.userId) {
      socket.join(`user:${socket.userId}`);
    }

    // Handle disconnection
    socket.on('disconnect', () => {
      console.log(`🔌 Socket disconnected: ${socket.id}`);
    });

    // Handle errors
    socket.on('error', (error) => {
      console.error(`❌ Socket error (${socket.id}):`, error);
    });
  });

  return io;
}

/**
 * Socket.io event names
 */
export const SocketEvents = {
  // Match events
  MATCH_CREATED: 'match:created',
  MATCH_UPDATED: 'match:updated',
  MATCH_STARTED: 'match:started',
  MATCH_COMPLETED: 'match:completed',
  MATCH_CANCELLED: 'match:cancelled',
  ROUND_STARTED: 'round:started',
  ROUND_COMPLETED: 'round:completed',
  MOVE_SUBMITTED: 'move:submitted',
  MATCH_STATE: 'match:state',

  // Tournament events
  TOURNAMENT_CREATED: 'tournament:created',
  TOURNAMENT_UPDATED: 'tournament:updated',
  TOURNAMENT_STARTED: 'tournament:started',
  TOURNAMENT_COMPLETED: 'tournament:completed',
  BRACKET_UPDATED: 'bracket:updated',
  MATCH_ADVANCED: 'match:advanced',

  // Player events
  PLAYER_JOINED: 'player:joined',
  PLAYER_LEFT: 'player:left',
  PLAYER_STATS_UPDATED: 'player:stats:updated',

  // General events
  ERROR: 'error',
  CONNECTED: 'connected',
  DISCONNECTED: 'disconnected',
} as const;

