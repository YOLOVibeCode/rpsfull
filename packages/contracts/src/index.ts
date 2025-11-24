/**
 * RPSFull Platform Contracts Package
 * 
 * Public API - Barrel exports for all contracts
 * 
 * This package serves as the single source of truth for all type definitions
 * across the RPSFull Tournament Platform.
 */

// Enumerations
export * from './enums';

// Entities
export * from './entities/User.entity';
export * from './entities/Player.entity';
export * from './entities/GameType.entity';
export * from './entities/Match.entity';
export * from './entities/Round.entity';
export * from './entities/Tournament.entity';
export * from './entities/TournamentEntry.entity';
export * from './entities/PlayerStatistics.entity';
export * from './entities/Achievement.entity';

// DTOs
export * from './dtos/auth.dto';
export * from './dtos/match.dto';
export * from './dtos/tournament.dto';
export * from './dtos/statistics.dto';

// Interfaces - Services (ISP)
export * from './interfaces/services';

// Interfaces - Repositories (ISP)
export * from './interfaces/repositories';

// Validators
export * from './validators/auth.validator';
export * from './validators/match.validator';
export * from './validators/tournament.validator';

