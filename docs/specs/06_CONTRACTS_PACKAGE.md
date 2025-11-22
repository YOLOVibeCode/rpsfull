# Contracts & Type System Specification
## RPSFull Tournament Platform - Shared Contracts Package

**Document Version:** 1.1  
**Last Updated:** November 22, 2025  
**Status:** Draft  
**Repository:** https://github.com/YOLOVibeCode/rpsfull.git  
**Package Name:** `@rpsfull-platform/contracts`

---

## 1. Overview

### 1.1 Purpose
This document defines the contracts (interfaces, types, DTOs) package that serves as the single source of truth for all type definitions across the RPS Tournament Platform. This package ensures type safety and contract adherence between frontend, backend, and any future services.

### 1.2 Design Principles
1. **Interface Segregation Principle (ISP)**: Small, focused interfaces
2. **Dependency Inversion**: Depend on abstractions, not concretions
3. **Single Source of Truth**: All types defined once, used everywhere
4. **Immutability**: Types are readonly where appropriate
5. **Validation**: Runtime validation schemas alongside types

### 1.3 Package Architecture

```
@rpsfull-platform/contracts
├── src/
│   ├── entities/          # Domain entities
│   ├── dtos/              # Data Transfer Objects
│   ├── interfaces/        # Service contracts
│   ├── enums/             # Enumerations
│   ├── types/             # Type aliases and unions
│   ├── validators/        # Zod schemas for runtime validation
│   ├── constants/         # Shared constants
│   └── index.ts           # Public API
├── package.json
├── tsconfig.json
└── README.md
```

---

## 2. Package Configuration

### 2.1 package.json

```json
{
  "name": "@rpsfull-platform/contracts",
  "version": "1.0.0",
  "description": "Shared contracts and type definitions for RPSFull Tournament Platform",
  "main": "dist/index.js",
  "types": "dist/index.d.ts",
  "files": [
    "dist"
  ],
  "scripts": {
    "build": "tsc",
    "dev": "tsc --watch",
    "lint": "eslint src --ext .ts",
    "test": "jest",
    "prepublishOnly": "npm run build"
  },
  "keywords": [
    "typescript",
    "contracts",
    "types",
    "rpsfull"
  ],
  "author": "RPSFull Platform Team",
  "license": "MIT",
  "devDependencies": {
    "@types/node": "^20.0.0",
    "typescript": "^5.0.0",
    "eslint": "^8.0.0",
    "jest": "^29.0.0"
  },
  "dependencies": {
    "zod": "^3.22.0"
  },
  "peerDependencies": {
    "typescript": ">=5.0.0"
  }
}
```

### 2.2 tsconfig.json

```json
{
  "compilerOptions": {
    "target": "ES2020",
    "module": "commonjs",
    "lib": ["ES2020"],
    "declaration": true,
    "declarationMap": true,
    "outDir": "./dist",
    "rootDir": "./src",
    "strict": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "forceConsistentCasingInFileNames": true,
    "resolveJsonModule": true,
    "moduleResolution": "node"
  },
  "include": ["src/**/*"],
  "exclude": ["node_modules", "dist", "**/*.test.ts"]
}
```

---

## 3. Domain Entities

### 3.1 User Entity

**File:** `src/entities/User.entity.ts`

```typescript
/**
 * User entity representing an authenticated account
 */
export interface IUser {
  readonly id: string;
  readonly email: string;
  readonly role: UserRole;
  readonly isEmailVerified: boolean;
  readonly isActive: boolean;
  readonly createdAt: Date;
  readonly updatedAt: Date;
  readonly lastLogin?: Date;
  readonly deletedAt?: Date;
}

/**
 * User creation data (excludes system-generated fields)
 */
export interface IUserCreate {
  email: string;
  password: string;
  role?: UserRole;
}

/**
 * User update data (partial, all optional)
 */
export interface IUserUpdate {
  email?: string;
  password?: string;
  isActive?: boolean;
}

/**
 * Public user data (safe to expose to frontend)
 */
export interface IUserPublic {
  readonly id: string;
  readonly email: string;
  readonly role: UserRole;
  readonly isEmailVerified: boolean;
  readonly createdAt: Date;
  readonly lastLogin?: Date;
}
```

### 3.2 Player Entity

**File:** `src/entities/Player.entity.ts`

```typescript
/**
 * Player entity representing a game participant
 */
export interface IPlayer {
  readonly id: string;
  readonly name: string;
  readonly displayName?: string;
  readonly userId?: string;
  readonly email?: string;
  readonly avatarUrl?: string;
  readonly level: number;
  readonly experience: number;
  readonly ranking?: number;
  readonly bio?: string;
  readonly isActive: boolean;
  readonly createdAt: Date;
  readonly updatedAt: Date;
  readonly deletedAt?: Date;
}

export interface IPlayerCreate {
  name: string;
  displayName?: string;
  userId?: string;
  email?: string;
  avatarUrl?: string;
  bio?: string;
}

export interface IPlayerUpdate {
  name?: string;
  displayName?: string;
  avatarUrl?: string;
  bio?: string;
}

export interface IPlayerPublic {
  readonly id: string;
  readonly name: string;
  readonly displayName?: string;
  readonly avatarUrl?: string;
  readonly level: number;
  readonly ranking?: number;
  readonly bio?: string;
}

export interface IPlayerWithStats extends IPlayerPublic {
  readonly totalMatches: number;
  readonly winRate: number;
  readonly tournamentsWon: number;
}
```

### 3.3 GameType Entity

**File:** `src/entities/GameType.entity.ts`

```typescript
/**
 * Symbol definition within a game type
 */
export interface IGameSymbol {
  readonly id: string;
  readonly name: string;
  readonly emoji: string;
  readonly iconUrl?: string;
}

/**
 * Win matrix defining what beats what
 * Key is the symbol ID, value is array of symbol IDs it defeats
 */
export type IWinMatrix = Record<string, string[]>;

/**
 * Game type entity defining a variant of the game
 */
export interface IGameType {
  readonly id: string;
  readonly name: string;
  readonly description?: string;
  readonly symbolCount: number;
  readonly symbols: IGameSymbol[];
  readonly winMatrix: IWinMatrix;
  readonly tieRules: TieRule;
  readonly scoringMethod: ScoringMethod;
  readonly iconSet?: Record<string, string>;
  readonly isActive: boolean;
  readonly isDefault: boolean;
  readonly createdBy?: string;
  readonly createdAt: Date;
  readonly updatedAt: Date;
}

export interface IGameTypeCreate {
  name: string;
  description?: string;
  symbols: IGameSymbol[];
  winMatrix: IWinMatrix;
  tieRules?: TieRule;
  scoringMethod?: ScoringMethod;
}

export interface IGameTypePublic {
  readonly id: string;
  readonly name: string;
  readonly description?: string;
  readonly symbolCount: number;
  readonly symbols: IGameSymbol[];
  readonly winMatrix: IWinMatrix;
  readonly isDefault: boolean;
}
```

### 3.4 Match Entity

**File:** `src/entities/Match.entity.ts`

```typescript
/**
 * Match entity representing a game between two players
 */
export interface IMatch {
  readonly id: string;
  readonly player1Id: string;
  readonly player2Id: string;
  readonly gameTypeId: string;
  readonly tournamentId?: string;
  readonly matchFormat: string;
  readonly bestOfN: number;
  readonly tiesCount: boolean;
  readonly playMode: PlayMode;
  readonly status: MatchStatus;
  readonly winnerId?: string;
  readonly player1Score: number;
  readonly player2Score: number;
  readonly totalRounds: number;
  readonly durationSeconds?: number;
  readonly startedAt?: Date;
  readonly completedAt?: Date;
  readonly createdAt: Date;
  readonly updatedAt: Date;
}

export interface IMatchCreate {
  player1Id: string;
  player2Id: string;
  gameTypeId: string;
  tournamentId?: string;
  bestOfN: number;
  tiesCount?: boolean;
  playMode: PlayMode;
}

export interface IMatchUpdate {
  status?: MatchStatus;
  winnerId?: string;
  player1Score?: number;
  player2Score?: number;
  totalRounds?: number;
  durationSeconds?: number;
  startedAt?: Date;
  completedAt?: Date;
}

/**
 * Match with populated player and game type data
 */
export interface IMatchWithDetails extends IMatch {
  readonly player1: IPlayerPublic;
  readonly player2: IPlayerPublic;
  readonly winner?: IPlayerPublic;
  readonly gameType: IGameTypePublic;
  readonly rounds?: IRound[];
}
```

### 3.5 Round Entity

**File:** `src/entities/Round.entity.ts`

```typescript
/**
 * Round entity representing a single round within a match
 */
export interface IRound {
  readonly id: string;
  readonly matchId: string;
  readonly roundNumber: number;
  readonly player1Move?: string;
  readonly player2Move?: string;
  readonly result: RoundResult;
  readonly winnerId?: string;
  readonly player1TimeMs?: number;
  readonly player2TimeMs?: number;
  readonly timestamp: Date;
}

export interface IRoundCreate {
  matchId: string;
  roundNumber: number;
  player1Move?: string;
  player2Move?: string;
  result: RoundResult;
  winnerId?: string;
  player1TimeMs?: number;
  player2TimeMs?: number;
}

export interface IRoundWithDetails extends IRound {
  readonly winner?: IPlayerPublic;
}
```

### 3.6 Tournament Entity

**File:** `src/entities/Tournament.entity.ts`

```typescript
/**
 * Tournament bracket structure
 */
export interface IBracketMatch {
  readonly position: number;
  readonly player1Id?: string;
  readonly player2Id?: string;
  readonly matchId?: string;
  readonly winnerId?: string;
}

export interface IBracketRound {
  readonly round: number;
  readonly name: string;
  readonly matches: IBracketMatch[];
}

export interface IBracketData {
  readonly rounds: IBracketRound[];
}

/**
 * Tournament entity
 */
export interface ITournament {
  readonly id: string;
  readonly name: string;
  readonly description?: string;
  readonly gameTypeId: string;
  readonly organizerId: string;
  readonly tournamentType: TournamentType;
  readonly matchFormat: string;
  readonly bestOfN: number;
  readonly status: TournamentStatus;
  readonly currentRound: number;
  readonly totalRounds?: number;
  readonly maxParticipants?: number;
  readonly participantCount: number;
  readonly bracketData?: IBracketData;
  readonly rules?: string;
  readonly prizeInfo?: string;
  readonly startDate?: Date;
  readonly endDate?: Date;
  readonly registrationDeadline?: Date;
  readonly createdAt: Date;
  readonly updatedAt: Date;
}

export interface ITournamentCreate {
  name: string;
  description?: string;
  gameTypeId: string;
  tournamentType: TournamentType;
  bestOfN: number;
  maxParticipants?: number;
  rules?: string;
  prizeInfo?: string;
  startDate?: Date;
  registrationDeadline?: Date;
}

export interface ITournamentUpdate {
  name?: string;
  description?: string;
  status?: TournamentStatus;
  currentRound?: number;
  bracketData?: IBracketData;
  startDate?: Date;
  endDate?: Date;
}

export interface ITournamentWithDetails extends ITournament {
  readonly gameType: IGameTypePublic;
  readonly organizer: IUserPublic;
  readonly entries?: ITournamentEntry[];
}
```

### 3.7 Tournament Entry Entity

**File:** `src/entities/TournamentEntry.entity.ts`

```typescript
export interface ITournamentEntry {
  readonly id: string;
  readonly tournamentId: string;
  readonly playerId: string;
  readonly seed?: number;
  readonly status: TournamentEntryStatus;
  readonly placement?: number;
  readonly matchesWon: number;
  readonly matchesLost: number;
  readonly roundsWon: number;
  readonly roundsLost: number;
  readonly registeredAt: Date;
  readonly eliminatedAt?: Date;
}

export interface ITournamentEntryCreate {
  tournamentId: string;
  playerId: string;
  seed?: number;
}

export interface ITournamentEntryUpdate {
  status?: TournamentEntryStatus;
  placement?: number;
  matchesWon?: number;
  matchesLost?: number;
  roundsWon?: number;
  roundsLost?: number;
  eliminatedAt?: Date;
}

export interface ITournamentEntryWithDetails extends ITournamentEntry {
  readonly player: IPlayerPublic;
}
```

### 3.8 Statistics Entity

**File:** `src/entities/PlayerStatistics.entity.ts`

```typescript
/**
 * Move-specific statistics
 */
export interface IMoveStats {
  readonly used: number;
  readonly won: number;
  readonly lost: number;
  readonly tied: number;
  readonly winRate: number;
}

/**
 * Opponent-specific statistics
 */
export interface IOpponentStats {
  readonly matches: number;
  readonly wins: number;
  readonly losses: number;
  readonly lastPlayed: Date;
}

/**
 * Player statistics entity
 */
export interface IPlayerStatistics {
  readonly id: string;
  readonly playerId: string;
  readonly gameTypeId: string;
  readonly totalMatches: number;
  readonly matchesWon: number;
  readonly matchesLost: number;
  readonly matchesTied: number;
  readonly winRate: number;
  readonly currentWinStreak: number;
  readonly longestWinStreak: number;
  readonly totalRounds: number;
  readonly roundsWon: number;
  readonly roundsLost: number;
  readonly roundsTied: number;
  readonly moveStats: Record<string, IMoveStats>;
  readonly avgMoveTimeMs?: number;
  readonly fastestMoveMs?: number;
  readonly opponentStats: Record<string, IOpponentStats>;
  readonly tournamentsEntered: number;
  readonly tournamentsWon: number;
  readonly lastMatchAt?: Date;
  readonly updatedAt: Date;
}

export interface IPlayerStatisticsPublic {
  readonly playerId: string;
  readonly gameTypeId: string;
  readonly totalMatches: number;
  readonly matchesWon: number;
  readonly winRate: number;
  readonly longestWinStreak: number;
  readonly moveStats: Record<string, IMoveStats>;
  readonly tournamentsWon: number;
}
```

### 3.9 Achievement Entity

**File:** `src/entities/Achievement.entity.ts`

```typescript
export interface IAchievement {
  readonly id: string;
  readonly playerId: string;
  readonly achievementType: AchievementType;
  readonly name: string;
  readonly description?: string;
  readonly iconUrl?: string;
  readonly rarity: AchievementRarity;
  readonly earnedAt: Date;
}

export interface IAchievementDefinition {
  readonly type: AchievementType;
  readonly name: string;
  readonly description: string;
  readonly iconUrl: string;
  readonly rarity: AchievementRarity;
  readonly criteria: Record<string, any>;
}
```

---

## 4. Enumerations

**File:** `src/enums/index.ts`

```typescript
/**
 * User roles
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
 * Play modes
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
  TIME_BASED = 'time_based',
}

/**
 * Achievement types
 */
export enum AchievementType {
  FIRST_WIN = 'first_win',
  WIN_STREAK_5 = 'win_streak_5',
  WIN_STREAK_10 = 'win_streak_10',
  WIN_STREAK_20 = 'win_streak_20',
  CENTURY = 'century',
  MILLENNIUM = 'millennium',
  TOURNAMENT_WINNER = 'tournament_winner',
  PERFECT_GAME = 'perfect_game',
  COMEBACK_KID = 'comeback_kid',
  SPEED_DEMON = 'speed_demon',
  VARIETY_MASTER = 'variety_master',
}

/**
 * Achievement rarities
 */
export enum AchievementRarity {
  COMMON = 'common',
  UNCOMMON = 'uncommon',
  RARE = 'rare',
  EPIC = 'epic',
  LEGENDARY = 'legendary',
}
```

---

## 5. Data Transfer Objects (DTOs)

### 5.1 Authentication DTOs

**File:** `src/dtos/auth.dto.ts`

```typescript
/**
 * Login request DTO
 */
export interface ILoginDto {
  email: string;
  password: string;
}

/**
 * Registration request DTO
 */
export interface IRegisterDto {
  email: string;
  password: string;
  name: string;
  displayName?: string;
}

/**
 * Authentication response DTO
 */
export interface IAuthResponseDto {
  user: IUserPublic;
  accessToken: string;
  refreshToken: string;
}

/**
 * Token refresh request DTO
 */
export interface IRefreshTokenDto {
  refreshToken: string;
}

/**
 * Token refresh response DTO
 */
export interface ITokenResponseDto {
  accessToken: string;
  refreshToken: string;
}

/**
 * Password reset request DTO
 */
export interface IPasswordResetRequestDto {
  email: string;
}

/**
 * Password reset DTO
 */
export interface IPasswordResetDto {
  token: string;
  newPassword: string;
}
```

### 5.2 Match DTOs

**File:** `src/dtos/match.dto.ts`

```typescript
/**
 * Create match request DTO
 */
export interface ICreateMatchDto {
  player2Id: string;
  gameTypeId: string;
  bestOfN: number;
  tiesCount?: boolean;
  playMode: PlayMode;
  tournamentId?: string;
}

/**
 * Submit move DTO (for digital mode)
 */
export interface ISubmitMoveDto {
  roundNumber: number;
  move: string;
  timeTakenMs?: number;
}

/**
 * Submit move response DTO
 */
export interface ISubmitMoveResponseDto {
  roundNumber: number;
  yourMove: string;
  opponentMove?: string;
  result?: 'win' | 'loss' | 'tie';
  winnerId?: string;
  waiting: boolean;
  matchComplete: boolean;
  currentScore?: {
    player1: number;
    player2: number;
  };
}

/**
 * Record round DTO (for live recording mode)
 */
export interface IRecordRoundDto {
  roundNumber: number;
  player1Move: string;
  player2Move: string;
  winnerId?: string;
}

/**
 * Record round response DTO
 */
export interface IRecordRoundResponseDto {
  roundNumber: number;
  result: RoundResult;
  currentScore: {
    player1: number;
    player2: number;
  };
  matchComplete: boolean;
  winnerId?: string;
}

/**
 * Match list query DTO
 */
export interface IMatchListQueryDto {
  status?: MatchStatus;
  gameTypeId?: string;
  playerId?: string;
  tournamentId?: string;
  startDate?: string;
  endDate?: string;
  page?: number;
  limit?: number;
}
```

### 5.3 Tournament DTOs

**File:** `src/dtos/tournament.dto.ts`

```typescript
/**
 * Create tournament request DTO
 */
export interface ICreateTournamentDto {
  name: string;
  description?: string;
  gameTypeId: string;
  tournamentType: TournamentType;
  bestOfN: number;
  maxParticipants?: number;
  rules?: string;
  prizeInfo?: string;
  startDate?: string;
  registrationDeadline?: string;
}

/**
 * Update tournament request DTO
 */
export interface IUpdateTournamentDto {
  name?: string;
  description?: string;
  rules?: string;
  prizeInfo?: string;
  startDate?: string;
  registrationDeadline?: string;
}

/**
 * Add player to tournament DTO
 */
export interface IAddPlayerToTournamentDto {
  playerId: string;
  seed?: number;
}

/**
 * Tournament list query DTO
 */
export interface ITournamentListQueryDto {
  status?: TournamentStatus;
  gameTypeId?: string;
  organizerId?: string;
  search?: string;
  page?: number;
  limit?: number;
}

/**
 * Tournament standings response DTO
 */
export interface ITournamentStandingsDto {
  tournamentId: string;
  standings: Array<{
    placement: number;
    player: IPlayerPublic;
    seed?: number;
    matchesWon: number;
    matchesLost: number;
    roundsWon: number;
    roundsLost: number;
    status: TournamentEntryStatus;
  }>;
}
```

### 5.4 Statistics DTOs

**File:** `src/dtos/statistics.dto.ts`

```typescript
/**
 * Get statistics query DTO
 */
export interface IGetStatisticsQueryDto {
  gameTypeId?: string;
}

/**
 * Head-to-head statistics query DTO
 */
export interface IHeadToHeadQueryDto {
  player1Id: string;
  player2Id: string;
  gameTypeId?: string;
}

/**
 * Head-to-head statistics response DTO
 */
export interface IHeadToHeadStatsDto {
  player1: IPlayerPublic;
  player2: IPlayerPublic;
  totalMatches: number;
  player1Wins: number;
  player2Wins: number;
  ties: number;
  player1WinRate: number;
  lastMatchDate?: Date;
  moveBreakdown: {
    player1: Record<string, { used: number; won: number }>;
    player2: Record<string, { used: number; won: number }>;
  };
}

/**
 * Global statistics response DTO
 */
export interface IGlobalStatsDto {
  totalPlayers: number;
  totalMatches: number;
  totalRounds: number;
  avgMatchDuration: number;
  mostUsedMove: string;
  moveDistribution: Record<string, number>;
  avgWinRate: number;
}
```

---

## 6. Service Interfaces

### 6.1 Repository Interfaces

**File:** `src/interfaces/repositories/IUserRepository.ts`

```typescript
import { IUser, IUserCreate, IUserUpdate, IUserPublic } from '../../entities';

/**
 * User repository interface
 */
export interface IUserRepository {
  create(data: IUserCreate): Promise<IUser>;
  findById(id: string): Promise<IUser | null>;
  findByEmail(email: string): Promise<IUser | null>;
  update(id: string, data: IUserUpdate): Promise<IUser>;
  delete(id: string): Promise<void>;
  findAll(filters?: Record<string, any>): Promise<IUser[]>;
}
```

**File:** `src/interfaces/repositories/IPlayerRepository.ts`

```typescript
import { IPlayer, IPlayerCreate, IPlayerUpdate, IPlayerPublic } from '../../entities';

export interface IPlayerRepository {
  create(data: IPlayerCreate): Promise<IPlayer>;
  findById(id: string): Promise<IPlayer | null>;
  findByUserId(userId: string): Promise<IPlayer | null>;
  findByEmail(email: string): Promise<IPlayer | null>;
  update(id: string, data: IPlayerUpdate): Promise<IPlayer>;
  delete(id: string): Promise<void>;
  findAll(filters?: Record<string, any>): Promise<IPlayer[]>;
  search(query: string): Promise<IPlayer[]>;
  getLeaderboard(gameTypeId: string, limit: number): Promise<IPlayer[]>;
}
```

**File:** `src/interfaces/repositories/IMatchRepository.ts`

```typescript
import { IMatch, IMatchCreate, IMatchUpdate, IMatchWithDetails } from '../../entities';

export interface IMatchRepository {
  create(data: IMatchCreate): Promise<IMatch>;
  findById(id: string): Promise<IMatch | null>;
  findByIdWithDetails(id: string): Promise<IMatchWithDetails | null>;
  update(id: string, data: IMatchUpdate): Promise<IMatch>;
  delete(id: string): Promise<void>;
  findByPlayer(playerId: string, filters?: Record<string, any>): Promise<IMatch[]>;
  findByTournament(tournamentId: string): Promise<IMatch[]>;
  countByPlayer(playerId: string): Promise<number>;
}
```

**File:** `src/interfaces/repositories/ITournamentRepository.ts`

```typescript
import { 
  ITournament, 
  ITournamentCreate, 
  ITournamentUpdate, 
  ITournamentWithDetails 
} from '../../entities';

export interface ITournamentRepository {
  create(data: ITournamentCreate): Promise<ITournament>;
  findById(id: string): Promise<ITournament | null>;
  findByIdWithDetails(id: string): Promise<ITournamentWithDetails | null>;
  update(id: string, data: ITournamentUpdate): Promise<ITournament>;
  delete(id: string): Promise<void>;
  findAll(filters?: Record<string, any>): Promise<ITournament[]>;
  findByOrganizer(organizerId: string): Promise<ITournament[]>;
}
```

### 6.2 Service Interfaces

**File:** `src/interfaces/services/IAuthService.ts`

```typescript
import { 
  ILoginDto, 
  IRegisterDto, 
  IAuthResponseDto, 
  IRefreshTokenDto,
  ITokenResponseDto 
} from '../../dtos';

export interface IAuthService {
  register(data: IRegisterDto): Promise<IAuthResponseDto>;
  login(data: ILoginDto): Promise<IAuthResponseDto>;
  logout(userId: string, refreshToken: string): Promise<void>;
  refreshToken(data: IRefreshTokenDto): Promise<ITokenResponseDto>;
  verifyEmail(token: string): Promise<void>;
  requestPasswordReset(email: string): Promise<void>;
  resetPassword(token: string, newPassword: string): Promise<void>;
}
```

**File:** `src/interfaces/services/IMatchService.ts`

```typescript
import { 
  ICreateMatchDto, 
  ISubmitMoveDto, 
  ISubmitMoveResponseDto,
  IRecordRoundDto,
  IRecordRoundResponseDto 
} from '../../dtos';
import { IMatch, IMatchWithDetails } from '../../entities';

export interface IMatchService {
  createMatch(userId: string, data: ICreateMatchDto): Promise<IMatch>;
  getMatch(matchId: string): Promise<IMatchWithDetails>;
  startMatch(matchId: string, userId: string): Promise<IMatch>;
  submitMove(matchId: string, playerId: string, data: ISubmitMoveDto): Promise<ISubmitMoveResponseDto>;
  recordRound(matchId: string, data: IRecordRoundDto): Promise<IRecordRoundResponseDto>;
  cancelMatch(matchId: string, userId: string): Promise<void>;
  getPlayerMatches(playerId: string, filters?: Record<string, any>): Promise<IMatch[]>;
}
```

**File:** `src/interfaces/services/ITournamentService.ts`

```typescript
import { 
  ICreateTournamentDto, 
  IUpdateTournamentDto,
  IAddPlayerToTournamentDto,
  ITournamentStandingsDto 
} from '../../dtos';
import { ITournament, ITournamentWithDetails } from '../../entities';

export interface ITournamentService {
  createTournament(userId: string, data: ICreateTournamentDto): Promise<ITournament>;
  getTournament(tournamentId: string): Promise<ITournamentWithDetails>;
  updateTournament(tournamentId: string, userId: string, data: IUpdateTournamentDto): Promise<ITournament>;
  deleteTournament(tournamentId: string, userId: string): Promise<void>;
  registerPlayer(tournamentId: string, playerId: string): Promise<void>;
  addPlayer(tournamentId: string, userId: string, data: IAddPlayerToTournamentDto): Promise<void>;
  startTournament(tournamentId: string, userId: string): Promise<ITournament>;
  getBracket(tournamentId: string): Promise<any>;
  getStandings(tournamentId: string): Promise<ITournamentStandingsDto>;
  listTournaments(filters?: Record<string, any>): Promise<ITournament[]>;
}
```

**File:** `src/interfaces/services/IStatisticsService.ts`

```typescript
import { 
  IPlayerStatistics, 
  IHeadToHeadStatsDto,
  IGlobalStatsDto 
} from '../../entities';

export interface IStatisticsService {
  getPlayerStatistics(playerId: string, gameTypeId?: string): Promise<IPlayerStatistics>;
  updateStatistics(matchId: string): Promise<void>;
  getHeadToHead(player1Id: string, player2Id: string): Promise<IHeadToHeadStatsDto>;
  getGlobalStatistics(gameTypeId?: string): Promise<IGlobalStatsDto>;
  calculateRankings(gameTypeId: string): Promise<void>;
}
```

### 6.3 WebSocket Event Interfaces

**File:** `src/interfaces/websocket/IMatchEvents.ts`

```typescript
/**
 * Client-to-server match events
 */
export interface IMatchEventsClient {
  'match:join': (data: { matchId: string }) => void;
  'match:ready': (data: { matchId: string }) => void;
  'match:move': (data: { 
    matchId: string; 
    roundNumber: number; 
    move: string; 
    timeTakenMs?: number;
  }) => void;
  'match:leave': (data: { matchId: string }) => void;
}

/**
 * Server-to-client match events
 */
export interface IMatchEventsServer {
  'match:opponent-joined': (data: { 
    playerId: string; 
    playerName: string;
  }) => void;
  'match:countdown': (data: { secondsRemaining: number }) => void;
  'match:round-complete': (data: {
    roundNumber: number;
    player1Move: string;
    player2Move: string;
    result: string;
    winnerId: string;
    currentScore: { player1: number; player2: number };
  }) => void;
  'match:complete': (data: {
    matchId: string;
    winnerId: string;
    finalScore: { player1: number; player2: number };
    durationSeconds: number;
  }) => void;
  'match:error': (error: { code: string; message: string }) => void;
}
```

**File:** `src/interfaces/websocket/ITournamentEvents.ts`

```typescript
export interface ITournamentEventsClient {
  'tournament:join': (data: { tournamentId: string }) => void;
  'tournament:leave': (data: { tournamentId: string }) => void;
}

export interface ITournamentEventsServer {
  'tournament:started': (data: { tournamentId: string }) => void;
  'tournament:match-complete': (data: {
    matchId: string;
    winnerId: string;
    nextRound: number;
  }) => void;
  'tournament:round-complete': (data: {
    round: number;
    nextRoundMatches: any[];
  }) => void;
  'tournament:complete': (data: {
    winnerId: string;
    finalStandings: any[];
  }) => void;
}
```

---

## 7. Validation Schemas (Zod)

**File:** `src/validators/auth.validator.ts`

```typescript
import { z } from 'zod';

export const loginSchema = z.object({
  email: z.string().email('Invalid email format'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
});

export const registerSchema = z.object({
  email: z.string().email('Invalid email format'),
  password: z.string()
    .min(8, 'Password must be at least 8 characters')
    .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
    .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
    .regex(/[0-9]/, 'Password must contain at least one number'),
  name: z.string().min(2, 'Name must be at least 2 characters').max(100),
  displayName: z.string().max(100).optional(),
});

export const refreshTokenSchema = z.object({
  refreshToken: z.string().min(1, 'Refresh token is required'),
});
```

**File:** `src/validators/match.validator.ts`

```typescript
import { z } from 'zod';
import { PlayMode } from '../enums';

export const createMatchSchema = z.object({
  player2Id: z.string().uuid('Invalid player ID'),
  gameTypeId: z.string().uuid('Invalid game type ID'),
  bestOfN: z.number()
    .int()
    .positive()
    .refine(n => n % 2 === 1, 'Best of N must be odd number'),
  tiesCount: z.boolean().optional().default(false),
  playMode: z.nativeEnum(PlayMode),
  tournamentId: z.string().uuid().optional(),
});

export const submitMoveSchema = z.object({
  roundNumber: z.number().int().positive(),
  move: z.string().min(1),
  timeTakenMs: z.number().int().positive().optional(),
});

export const recordRoundSchema = z.object({
  roundNumber: z.number().int().positive(),
  player1Move: z.string().min(1),
  player2Move: z.string().min(1),
  winnerId: z.string().uuid().optional(),
});
```

**File:** `src/validators/tournament.validator.ts`

```typescript
import { z } from 'zod';
import { TournamentType } from '../enums';

export const createTournamentSchema = z.object({
  name: z.string().min(3).max(200),
  description: z.string().max(1000).optional(),
  gameTypeId: z.string().uuid(),
  tournamentType: z.nativeEnum(TournamentType),
  bestOfN: z.number().int().positive().refine(n => n % 2 === 1),
  maxParticipants: z.number().int().positive().max(256).optional(),
  rules: z.string().max(5000).optional(),
  prizeInfo: z.string().max(1000).optional(),
  startDate: z.string().datetime().optional(),
  registrationDeadline: z.string().datetime().optional(),
}).refine(
  data => {
    if (data.startDate && data.registrationDeadline) {
      return new Date(data.registrationDeadline) < new Date(data.startDate);
    }
    return true;
  },
  { message: 'Registration deadline must be before start date' }
);
```

---

## 8. Constants

**File:** `src/constants/limits.ts`

```typescript
/**
 * System-wide limits and constraints
 */
export const LIMITS = {
  // Match limits
  MAX_BEST_OF_N: 31,
  MIN_BEST_OF_N: 1,
  MAX_MATCH_DURATION_SECONDS: 7200, // 2 hours
  
  // Tournament limits
  MAX_TOURNAMENT_PARTICIPANTS: 256,
  MIN_TOURNAMENT_PARTICIPANTS: 2,
  MAX_TOURNAMENT_NAME_LENGTH: 200,
  MAX_TOURNAMENT_DESCRIPTION_LENGTH: 1000,
  
  // Player limits
  MAX_PLAYER_NAME_LENGTH: 100,
  MAX_PLAYER_BIO_LENGTH: 500,
  
  // Rate limits
  API_RATE_LIMIT_ANONYMOUS: 20, // per minute
  API_RATE_LIMIT_AUTHENTICATED: 100, // per minute
  WEBSOCKET_MAX_CONNECTIONS_PER_USER: 5,
  
  // Pagination
  DEFAULT_PAGE_SIZE: 20,
  MAX_PAGE_SIZE: 100,
} as const;
```

**File:** `src/constants/errors.ts`

```typescript
/**
 * Error codes
 */
export const ERROR_CODES = {
  // Authentication errors
  AUTH_INVALID_CREDENTIALS: 'AUTH_001',
  AUTH_TOKEN_EXPIRED: 'AUTH_002',
  AUTH_TOKEN_INVALID: 'AUTH_003',
  AUTH_EMAIL_NOT_VERIFIED: 'AUTH_004',
  AUTH_ACCOUNT_SUSPENDED: 'AUTH_005',
  
  // Validation errors
  VAL_INVALID_EMAIL: 'VAL_001',
  VAL_PASSWORD_WEAK: 'VAL_002',
  VAL_REQUIRED_FIELD: 'VAL_003',
  VAL_INVALID_ENUM: 'VAL_004',
  VAL_OUT_OF_RANGE: 'VAL_005',
  
  // Resource errors
  RES_NOT_FOUND: 'RES_001',
  RES_ALREADY_EXISTS: 'RES_002',
  RES_CANNOT_DELETE: 'RES_003',
  RES_CONFLICT: 'RES_004',
  
  // Match errors
  MATCH_NOT_FOUND: 'MATCH_001',
  MATCH_ALREADY_STARTED: 'MATCH_002',
  MATCH_ALREADY_COMPLETED: 'MATCH_003',
  MATCH_NOT_PARTICIPANT: 'MATCH_004',
  MATCH_INVALID_MOVE: 'MATCH_005',
  MATCH_MOVE_ALREADY_SUBMITTED: 'MATCH_006',
  
  // Tournament errors
  TOUR_NOT_FOUND: 'TOUR_001',
  TOUR_FULL: 'TOUR_002',
  TOUR_REGISTRATION_CLOSED: 'TOUR_003',
  TOUR_ALREADY_REGISTERED: 'TOUR_004',
  TOUR_NOT_ORGANIZER: 'TOUR_005',
  TOUR_CANNOT_START: 'TOUR_006',
} as const;
```

**File:** `src/constants/defaults.ts`

```typescript
/**
 * Default values
 */
export const DEFAULTS = {
  GAME_TYPE: 'classic-rps',
  MATCH_FORMAT: 'best_of_3',
  BEST_OF_N: 3,
  TIE_RULE: 'replay',
  SCORING_METHOD: 'best_of_n',
  TOURNAMENT_TYPE: 'single_elimination',
  USER_ROLE: 'player',
  PLAYER_LEVEL: 1,
  PLAYER_EXPERIENCE: 0,
} as const;
```

---

## 9. Type Guards & Utilities

**File:** `src/types/guards.ts`

```typescript
import { IUser, IPlayer, IMatch } from '../entities';
import { UserRole, MatchStatus } from '../enums';

/**
 * Type guard for User
 */
export function isUser(obj: any): obj is IUser {
  return (
    typeof obj === 'object' &&
    obj !== null &&
    typeof obj.id === 'string' &&
    typeof obj.email === 'string' &&
    typeof obj.role === 'string'
  );
}

/**
 * Type guard for Player
 */
export function isPlayer(obj: any): obj is IPlayer {
  return (
    typeof obj === 'object' &&
    obj !== null &&
    typeof obj.id === 'string' &&
    typeof obj.name === 'string'
  );
}

/**
 * Check if user has admin role
 */
export function isAdmin(user: IUser): boolean {
  return user.role === UserRole.ADMIN;
}

/**
 * Check if user is organizer or admin
 */
export function canOrganizeTournament(user: IUser): boolean {
  return user.role === UserRole.ORGANIZER || user.role === UserRole.ADMIN;
}

/**
 * Check if match is in progress
 */
export function isMatchInProgress(match: IMatch): boolean {
  return match.status === MatchStatus.IN_PROGRESS;
}

/**
 * Check if match is completed
 */
export function isMatchCompleted(match: IMatch): boolean {
  return match.status === MatchStatus.COMPLETED;
}
```

**File:** `src/types/helpers.ts`

```typescript
/**
 * Make all properties optional recursively
 */
export type DeepPartial<T> = {
  [P in keyof T]?: T[P] extends object ? DeepPartial<T[P]> : T[P];
};

/**
 * Make specific properties required
 */
export type RequireFields<T, K extends keyof T> = T & Required<Pick<T, K>>;

/**
 * Omit multiple properties
 */
export type OmitMultiple<T, K extends keyof T> = Pick<T, Exclude<keyof T, K>>;

/**
 * Extract keys of specific type
 */
export type KeysOfType<T, U> = {
  [K in keyof T]: T[K] extends U ? K : never;
}[keyof T];

/**
 * API Response wrapper
 */
export interface IApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: {
    code: string;
    message: string;
    details?: any;
  };
  meta?: {
    timestamp: string;
    version?: string;
    requestId?: string;
    pagination?: IPaginationMeta;
  };
}

/**
 * Pagination metadata
 */
export interface IPaginationMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasNext: boolean;
  hasPrev: boolean;
}

/**
 * Query parameters for list endpoints
 */
export interface IListQuery {
  page?: number;
  limit?: number;
  sort?: string;
  order?: 'asc' | 'desc';
  search?: string;
}
```

---

## 10. Public API (Barrel Export)

**File:** `src/index.ts`

```typescript
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

// Enumerations
export * from './enums';

// DTOs
export * from './dtos/auth.dto';
export * from './dtos/match.dto';
export * from './dtos/tournament.dto';
export * from './dtos/statistics.dto';

// Interfaces
export * from './interfaces/repositories/IUserRepository';
export * from './interfaces/repositories/IPlayerRepository';
export * from './interfaces/repositories/IMatchRepository';
export * from './interfaces/repositories/ITournamentRepository';
export * from './interfaces/services/IAuthService';
export * from './interfaces/services/IMatchService';
export * from './interfaces/services/ITournamentService';
export * from './interfaces/services/IStatisticsService';
export * from './interfaces/websocket/IMatchEvents';
export * from './interfaces/websocket/ITournamentEvents';

// Validators
export * from './validators/auth.validator';
export * from './validators/match.validator';
export * from './validators/tournament.validator';

// Constants
export * from './constants/limits';
export * from './constants/errors';
export * from './constants/defaults';

// Types & Utilities
export * from './types/guards';
export * from './types/helpers';
```

---

## 11. Usage Examples

### 11.1 In Backend (Next.js API Routes or Node.js)

```typescript
// backend/src/services/match.service.ts
import { 
  IMatchService, 
  ICreateMatchDto, 
  IMatch,
  IMatchRepository,
  MatchStatus,
  PlayMode
} from '@rpsfull-platform/contracts';

export class MatchService implements IMatchService {
  constructor(private matchRepository: IMatchRepository) {}
  
  async createMatch(userId: string, data: ICreateMatchDto): Promise<IMatch> {
    // Validation is already done via Zod schema
    const match = await this.matchRepository.create({
      ...data,
      player1Id: userId, // Get from authenticated user
    });
    
    return match;
  }
  
  // ... other methods
}
```

### 11.2 In Frontend (Next.js)

```typescript
// frontend/src/services/api/match.service.ts
import { 
  ICreateMatchDto, 
  IMatch, 
  IMatchWithDetails,
  IApiResponse 
} from '@rpsfull-platform/contracts';

export class MatchApiService {
  async createMatch(data: ICreateMatchDto): Promise<IMatch> {
    const response = await fetch('/api/v1/matches', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    
    const result: IApiResponse<IMatch> = await response.json();
    
    if (!result.success) {
      throw new Error(result.error?.message);
    }
    
    return result.data!;
  }
  
  async getMatch(matchId: string): Promise<IMatchWithDetails> {
    const response = await fetch(`/api/v1/matches/${matchId}`);
    const result: IApiResponse<IMatchWithDetails> = await response.json();
    
    if (!result.success) {
      throw new Error(result.error?.message);
    }
    
    return result.data!;
  }
}
```

### 11.3 In Frontend Components

```typescript
// frontend/src/components/CreateMatch.tsx
import { useState } from 'react';
import { ICreateMatchDto, PlayMode } from '@rpsfull-platform/contracts';
import { MatchApiService } from '@/services/api/match.service';

export function CreateMatch() {
  const [formData, setFormData] = useState<ICreateMatchDto>({
    player2Id: '',
    gameTypeId: '',
    bestOfN: 3,
    playMode: PlayMode.DIGITAL,
  });
  
  const handleSubmit = async () => {
    const service = new MatchApiService();
    const match = await service.createMatch(formData);
    console.log('Match created:', match);
  };
  
  return (
    <form onSubmit={handleSubmit}>
      {/* Form fields */}
    </form>
  );
}
```

---

## 12. Testing Strategy

### 12.1 Unit Tests

```typescript
// contracts/src/__tests__/validators/match.validator.test.ts
import { createMatchSchema } from '../../validators/match.validator';
import { PlayMode } from '../../enums';

describe('Match Validator', () => {
  it('should validate valid match data', () => {
    const validData = {
      player2Id: '123e4567-e89b-12d3-a456-426614174000',
      gameTypeId: '123e4567-e89b-12d3-a456-426614174001',
      bestOfN: 3,
      playMode: PlayMode.DIGITAL,
    };
    
    const result = createMatchSchema.safeParse(validData);
    expect(result.success).toBe(true);
  });
  
  it('should reject even bestOfN', () => {
    const invalidData = {
      player2Id: '123e4567-e89b-12d3-a456-426614174000',
      gameTypeId: '123e4567-e89b-12d3-a456-426614174001',
      bestOfN: 4, // Even number - invalid
      playMode: PlayMode.DIGITAL,
    };
    
    const result = createMatchSchema.safeParse(invalidData);
    expect(result.success).toBe(false);
  });
});
```

---

## 13. Versioning & Publishing

### 13.1 Semantic Versioning

```
MAJOR.MINOR.PATCH

MAJOR: Breaking changes
MINOR: New features (backward compatible)
PATCH: Bug fixes
```

### 13.2 Publishing Workflow

```bash
# Update version
npm version patch  # or minor, major

# Build
npm run build

# Publish to NPM (if public)
npm publish --access public

# Or publish to private registry
npm publish --registry=https://your-private-registry
```

### 13.3 Changelog

Maintain CHANGELOG.md:
```markdown
# Changelog

## [1.1.0] - 2025-11-25
### Added
- ITournamentService interface
- Tournament DTOs

### Changed
- Updated IMatch entity with new fields

### Fixed
- Type error in IPlayerStatistics
```

---

## 14. Integration with Projects

### 14.1 In Backend

```json
// backend/package.json
{
  "dependencies": {
    "@rpsfull-platform/contracts": "^1.0.0"
  }
}
```

### 14.2 In Frontend

```json
// frontend/package.json
{
  "dependencies": {
    "@rpsfull-platform/contracts": "^1.0.0"
  }
}
```

### 14.3 Monorepo Structure

```
rpsfull-platform/
├── packages/
│   ├── contracts/         # @rpsfull-platform/contracts
│   ├── backend/           # Backend service
│   ├── frontend/          # Next.js frontend
│   └── mobile/            # React Native (future)
├── package.json           # Root package.json
├── turbo.json             # Turborepo config (optional)
└── pnpm-workspace.yaml    # PNPM workspaces
```

---

## 15. Benefits of This Approach

### 15.1 Type Safety
- Single source of truth for all types
- Frontend and backend always in sync
- Catch type errors at compile time

### 15.2 Maintainability
- Changes to contracts propagate automatically
- Clear separation of concerns
- Easy to understand interfaces

### 15.3 Testability
- Contracts can be tested independently
- Easy to mock interfaces
- Clear expectations

### 15.4 Scalability
- Easy to add new services
- Reusable across projects
- Versioned independently

### 15.5 Developer Experience
- TypeScript autocomplete works perfectly
- Clear documentation via types
- Easier onboarding for new developers

---

**Document Approval:**
- [ ] Technical Lead
- [ ] Backend Lead
- [ ] Frontend Lead
- [ ] TypeScript Architect

---

END OF DOCUMENT

