/**
 * Enumerations for RPSFull Tournament Platform
 * 
 * All enums use string values for better serialization and debugging.
 */

/**
 * User roles in the system
 */
export enum UserRole {
  PLAYER = 'player',
  ORGANIZER = 'organizer',
  ADMIN = 'admin',
}

/**
 * Match statuses
 */
export enum MatchStatus {
  PENDING = 'pending',
  IN_PROGRESS = 'in_progress',
  COMPLETED = 'completed',
  CANCELLED = 'cancelled',
}

/**
 * Play modes for matches
 */
export enum PlayMode {
  DIGITAL = 'digital',
  LIVE_RECORDING = 'live_recording',
}

/**
 * Round results
 */
export enum RoundResult {
  PLAYER1_WIN = 'player1_win',
  PLAYER2_WIN = 'player2_win',
  TIE = 'tie',
}

/**
 * Tournament types
 */
export enum TournamentType {
  SINGLE_ELIMINATION = 'single_elimination',
  DOUBLE_ELIMINATION = 'double_elimination',
  ROUND_ROBIN = 'round_robin',
}

/**
 * Tournament statuses
 */
export enum TournamentStatus {
  DRAFT = 'draft',
  REGISTRATION = 'registration',
  READY = 'ready',
  IN_PROGRESS = 'in_progress',
  COMPLETED = 'completed',
  CANCELLED = 'cancelled',
}

/**
 * Tournament entry statuses
 */
export enum TournamentEntryStatus {
  REGISTERED = 'registered',
  ACTIVE = 'active',
  ELIMINATED = 'eliminated',
  WITHDREW = 'withdrew',
}

/**
 * Tie handling rules
 */
export enum TieRule {
  REPLAY = 'replay',
  COUNT = 'count',
  IGNORE = 'ignore',
}

/**
 * Scoring methods
 */
export enum ScoringMethod {
  BEST_OF_N = 'best_of_n',
  POINTS = 'points',
}

/**
 * Achievement types
 */
export enum AchievementType {
  MATCHES_WON = 'matches_won',
  TOURNAMENTS_WON = 'tournaments_won',
  STREAK = 'streak',
  MILESTONE = 'milestone',
  SPECIAL = 'special',
}

/**
 * Achievement rarity levels
 */
export enum AchievementRarity {
  COMMON = 'common',
  RARE = 'rare',
  EPIC = 'epic',
  LEGENDARY = 'legendary',
}

/**
 * Game visibility levels
 */
export enum GameVisibility {
  PRIVATE = 'private',
  UNLISTED = 'unlisted',
  PUBLIC = 'public',
}

/**
 * Difficulty levels for game types
 */
export enum DifficultyLevel {
  BEGINNER = 'beginner',
  INTERMEDIATE = 'intermediate',
  ADVANCED = 'advanced',
}

/**
 * Validation error types for game type validation
 */
export enum ValidationErrorType {
  INVALID_SYMBOL_COUNT = 'invalid_symbol_count',
  INVALID_WIN_MATRIX = 'invalid_win_matrix',
  UNBALANCED_MATRIX = 'unbalanced_matrix',
  MISSING_SYMBOL = 'missing_symbol',
  DUPLICATE_SYMBOL = 'duplicate_symbol',
}

