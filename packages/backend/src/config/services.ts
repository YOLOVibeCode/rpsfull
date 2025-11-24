/**
 * Services Configuration
 * 
 * Initialize all services with dependencies
 */

import { prisma } from './database';
import {
  UserRepository,
  PlayerRepository,
  MatchRepository,
  TournamentRepository,
  GameTypeRepository,
  RoundRepository,
  TournamentEntryRepository,
  PlayerStatisticsRepository,
} from '../repositories';
import {
  AuthService,
  MatchService,
  MatchGameplayService,
  TournamentService,
  TournamentRegistrationService,
  TournamentBracketService,
  StatisticsService,
  StatisticsCalculationService,
  GameValidationService,
  QuickStartService,
} from '../services';

// Initialize repositories
export const userRepository = new UserRepository(prisma);
export const playerRepository = new PlayerRepository(prisma);
export const matchRepository = new MatchRepository(prisma);
export const tournamentRepository = new TournamentRepository(prisma);
export const gameTypeRepository = new GameTypeRepository(prisma);
export const roundRepository = new RoundRepository(prisma);
export const tournamentEntryRepository = new TournamentEntryRepository(prisma);
export const playerStatisticsRepository = new PlayerStatisticsRepository(prisma);

// Initialize services
export const authService = new AuthService(userRepository, playerRepository);
export const matchService = new MatchService(
  matchRepository,
  playerRepository,
  gameTypeRepository
);
export const matchGameplayService = new MatchGameplayService(
  matchRepository,
  roundRepository
);
export const tournamentService = new TournamentService(
  tournamentRepository,
  gameTypeRepository
);
export const tournamentRegistrationService = new TournamentRegistrationService(
  tournamentRepository,
  tournamentEntryRepository
);
export const tournamentBracketService = new TournamentBracketService(
  tournamentRepository,
  tournamentEntryRepository
);
export const statisticsService = new StatisticsService(playerStatisticsRepository);
export const statisticsCalculationService = new StatisticsCalculationService(
  playerStatisticsRepository,
  matchRepository,
  roundRepository
);
export const gameValidationService = new GameValidationService();
export const quickStartService = new QuickStartService(
  userRepository,
  playerRepository,
  matchRepository,
  gameTypeRepository
);

export const qrCodeService = new QrCodeService();

export const matchInvitationService = new MatchInvitationService(
  userRepository,
  playerRepository,
  matchRepository,
  gameTypeRepository,
  qrCodeService
);

