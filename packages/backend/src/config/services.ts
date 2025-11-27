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
import { TournamentRegistrationTokenRepository } from '../repositories/TournamentRegistrationTokenRepository';
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
  QrCodeService,
  MatchInvitationService,
  TournamentInvitationService,
  TournamentMagicLinkService,
  EmailService,
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
// Use the actual repository directly - services that need organizerId will handle it
// The interface mismatch is handled in TournamentService by calling repo.create directly
export const tournamentService = new TournamentService(
  tournamentRepository as any, // Type assertion needed due to interface mismatch
  gameTypeRepository
);
export const tournamentRegistrationService = new TournamentRegistrationService(
  tournamentRepository as any,
  tournamentEntryRepository
);
export const tournamentBracketService = new TournamentBracketService(
  tournamentRepository as any,
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

export const tournamentInvitationService = new TournamentInvitationService(
  tournamentRepository as any,
  userRepository,
  playerRepository,
  tournamentRegistrationService,
  qrCodeService
);

export const tournamentRegistrationTokenRepository = new TournamentRegistrationTokenRepository(prisma);
export const emailService = new EmailService();

export const tournamentMagicLinkService = new TournamentMagicLinkService(
  tournamentRepository as any,
  tournamentRegistrationTokenRepository,
  tournamentRegistrationService,
  emailService
);

