/**
 * Tournament Socket Handlers
 * 
 * Real-time event handlers for tournament-related WebSocket events
 */

import { Server as SocketServer } from 'socket.io';
import { AuthenticatedSocket, SocketEvents } from '../config/socket';
import {
  tournamentService,
  tournamentBracketService,
  tournamentRegistrationService,
} from '../config/services';

/**
 * Setup tournament socket handlers
 */
export function setupTournamentHandlers(io: SocketServer): void {
  io.on('connection', (socket: AuthenticatedSocket) => {
    // Join tournament room
    socket.on('tournament:join', async (tournamentId: string) => {
      try {
        const tournament = await tournamentService.getTournamentById(tournamentId);

        if (!tournament) {
          socket.emit(SocketEvents.ERROR, { message: 'Tournament not found' });
          return;
        }

        socket.join(`tournament:${tournamentId}`);
        socket.emit(SocketEvents.TOURNAMENT_UPDATED, { tournament });

        console.log(`👤 User ${socket.userId} joined tournament ${tournamentId}`);
      } catch (error: any) {
        socket.emit(SocketEvents.ERROR, { message: error.message });
      }
    });

    // Leave tournament room
    socket.on('tournament:leave', (tournamentId: string) => {
      socket.leave(`tournament:${tournamentId}`);
      console.log(`👤 User ${socket.userId} left tournament ${tournamentId}`);
    });

    // Request tournament bracket
    socket.on('tournament:bracket:request', async (tournamentId: string) => {
      try {
        const bracket = await tournamentBracketService.getBracket(tournamentId);
        socket.emit(SocketEvents.BRACKET_UPDATED, {
          tournamentId,
          bracket,
        });
      } catch (error: any) {
        socket.emit(SocketEvents.ERROR, { message: error.message });
      }
    });

    // Register for tournament (via socket)
    socket.on('tournament:register', async (data: { tournamentId: string }) => {
      try {
        if (!socket.userId) {
          socket.emit(SocketEvents.ERROR, { message: 'Not authenticated' });
          return;
        }

        const { tournamentId } = data;

        // Get player ID from user
        const { playerRepository } = require('../config/services');
        const player = await playerRepository.findByUserId(socket.userId);

        if (!player) {
          socket.emit(SocketEvents.ERROR, { message: 'Player profile not found' });
          return;
        }

        await tournamentRegistrationService.registerPlayer(tournamentId, player.id, {});

        // Emit to all users in tournament room
        const tournament = await tournamentService.getTournamentById(tournamentId);
        io.to(`tournament:${tournamentId}`).emit(SocketEvents.TOURNAMENT_UPDATED, {
          tournament,
        });

        socket.emit(SocketEvents.CONNECTED, {
          message: 'Successfully registered for tournament',
        });
      } catch (error: any) {
        socket.emit(SocketEvents.ERROR, { message: error.message });
      }
    });
  });
}

