/**
 * Tournament Validators
 * 
 * Zod schemas for tournament-related validation
 */

import { z } from 'zod';
import { TournamentType } from '../enums';

/**
 * Create tournament schema
 */
export const createTournamentSchema = z.object({
  name: z
    .string()
    .min(2, 'Tournament name must be at least 2 characters')
    .max(200, 'Tournament name must be less than 200 characters'),
  description: z.string().max(1000, 'Description must be less than 1000 characters').optional(),
  gameTypeId: z.string().uuid('Invalid game type ID format'),
  tournamentType: z.nativeEnum(TournamentType, {
    errorMap: () => ({ message: 'Invalid tournament type' }),
  }),
  bestOfN: z
    .number()
    .int('Best of N must be an integer')
    .min(1, 'Best of N must be at least 1')
    .max(21, 'Best of N must be at most 21'),
  maxParticipants: z
    .number()
    .int('Max participants must be an integer')
    .min(2, 'Max participants must be at least 2')
    .max(256, 'Max participants must be at most 256')
    .optional(),
  rules: z.string().max(5000, 'Rules must be less than 5000 characters').optional(),
  prizeInfo: z.string().max(1000, 'Prize info must be less than 1000 characters').optional(),
  startDate: z.date().optional(),
  registrationDeadline: z.date().optional(),
});

/**
 * Register for tournament schema
 */
export const registerTournamentSchema = z.object({
  seed: z.number().int('Seed must be an integer').min(1, 'Seed must be at least 1').optional(),
});

