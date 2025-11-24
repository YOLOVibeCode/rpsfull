/**
 * Match Socket Handlers
 * 
 * Real-time event handlers for match-related WebSocket events
 */

import { Server as SocketServer } from 'socket.io';
import { AuthenticatedSocket, SocketEvents } from '../config/socket';
import { matchService, matchGameplayService } from '../config/services';

/**
 * Setup match socket handlers
 */
export function setupMatchHandlers(io: SocketServer): void {
  io.on('connection', (socket: AuthenticatedSocket) => {
    // Join match room
    socket.on('match:join', async (matchId: string) => {
      try {
        const match = await matchService.getMatchById(matchId);

        if (!match) {
          socket.emit(SocketEvents.ERROR, { message: 'Match not found' });
          return;
        }

        // Verify user is a participant
        if (socket.userId && match.player1Id !== socket.userId && match.player2Id !== socket.userId) {
          socket.emit(SocketEvents.ERROR, { message: 'Not authorized to join this match' });
          return;
        }

        socket.join(`match:${matchId}`);
        socket.emit(SocketEvents.MATCH_STATE, { match });

        console.log(`👤 User ${socket.userId} joined match ${matchId}`);
      } catch (error: any) {
        socket.emit(SocketEvents.ERROR, { message: error.message });
      }
    });

    // Leave match room
    socket.on('match:leave', (matchId: string) => {
      socket.leave(`match:${matchId}`);
      console.log(`👤 User ${socket.userId} left match ${matchId}`);
    });

    // Submit move
    socket.on('match:move', async (data: { matchId: string; move: string }) => {
      try {
        if (!socket.userId) {
          socket.emit(SocketEvents.ERROR, { message: 'Not authenticated' });
          return;
        }

        const { matchId, move, roundNumber } = data;
        const result = await matchGameplayService.submitMove(matchId, socket.userId, {
          move,
          roundNumber: roundNumber || 1,
        });

        // Emit to all users in the match room
        io.to(`match:${matchId}`).emit(SocketEvents.MOVE_SUBMITTED, {
          matchId,
          playerId: socket.userId,
          move,
          result,
        });

        // If match is complete, emit match completion
        if (result.matchComplete) {
          const updatedMatch = await matchService.getMatchById(matchId);
          io.to(`match:${matchId}`).emit(SocketEvents.MATCH_COMPLETED, {
            matchId,
            match: updatedMatch,
          });
        }
      } catch (error: any) {
        socket.emit(SocketEvents.ERROR, { message: error.message });
      }
    });

    // Request match state
    socket.on('match:state:request', async (matchId: string) => {
      try {
        const match = await matchService.getMatchById(matchId);
        socket.emit(SocketEvents.MATCH_STATE, { match });
      } catch (error: any) {
        socket.emit(SocketEvents.ERROR, { message: error.message });
      }
    });
  });
}

