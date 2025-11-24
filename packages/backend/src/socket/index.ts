/**
 * Socket.io Handlers
 * 
 * Main entry point for all Socket.io event handlers
 */

import { Server as HttpServer } from 'http';
import { createSocketServer, SocketServer } from '../config/socket';
import { setupMatchHandlers } from './match.handlers';
import { setupTournamentHandlers } from './tournament.handlers';

let io: SocketServer | null = null;

/**
 * Initialize Socket.io server
 */
export function initializeSocket(httpServer: HttpServer): SocketServer {
  io = createSocketServer(httpServer);
  setupMatchHandlers(io);
  setupTournamentHandlers(io);
  return io;
}

/**
 * Get Socket.io server instance
 */
export function getSocketServer(): SocketServer | null {
  return io;
}

/**
 * Emit event to specific room
 */
export function emitToRoom(room: string, event: string, data: any): void {
  if (io) {
    io.to(room).emit(event, data);
  }
}

/**
 * Emit event to specific user
 */
export function emitToUser(userId: string, event: string, data: any): void {
  if (io) {
    io.to(`user:${userId}`).emit(event, data);
  }
}

