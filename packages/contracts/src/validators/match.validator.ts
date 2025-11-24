/**
 * Match Validators
 * 
 * Zod schemas for match-related validation
 */

import { z } from 'zod';
import { PlayMode } from '../enums';

/**
 * Create match schema
 */
export const createMatchSchema = z.object({
  player2Id: z.string().min(1, 'Player 2 ID is required'),
  gameTypeId: z.string().min(1, 'Game type ID is required'),
  bestOfN: z
    .number()
    .int('Best of N must be an integer')
    .min(1, 'Best of N must be at least 1')
    .max(21, 'Best of N must be at most 21'),
  playMode: z.nativeEnum(PlayMode, {
    errorMap: () => ({ message: 'Invalid play mode' }),
  }),
  tournamentId: z.string().uuid('Invalid tournament ID format').optional(),
  tiesCount: z.boolean().optional(),
});

/**
 * Submit move schema
 */
export const submitMoveSchema = z.object({
  roundNumber: z
    .number()
    .int('Round number must be an integer')
    .min(1, 'Round number must be at least 1'),
  move: z.string().min(1, 'Move is required'),
  timeTakenMs: z.number().int().min(0, 'Time taken must be non-negative').optional(),
});

/**
 * Record round schema (for live recording mode)
 */
export const recordRoundSchema = z.object({
  roundNumber: z
    .number()
    .int('Round number must be an integer')
    .min(1, 'Round number must be at least 1'),
  player1Move: z.string().min(1, 'Player 1 move is required'),
  player2Move: z.string().min(1, 'Player 2 move is required'),
  winnerId: z.string().uuid('Invalid winner ID format').optional(),
});

/**
 * Create match with invitation schema
 */
export const createMatchWithInvitationSchema = z.object({
  player1: z.object({
    firstName: z.string().min(1, 'First name is required'),
    lastName: z.string().min(1, 'Last name is required'),
    email: z.string().email('Invalid email format'),
  }),
  invitedPlayerEmail: z.string().email('Invalid email format').optional(),
  gameTypeId: z.string().uuid('Invalid game type ID format').optional(),
  bestOfN: z.number().int().min(1).max(21).optional(),
  expirationHours: z.number().int().min(1).max(168).optional(), // Max 7 days
});

/**
 * Join match by token schema
 */
export const joinMatchByTokenSchema = z.object({
  token: z.string().uuid('Invalid invitation token'),
  player2: z.object({
    firstName: z.string().min(1, 'First name is required'),
    lastName: z.string().min(1, 'Last name is required'),
    email: z.string().email('Invalid email format'),
  }),
});

