# Step-by-Step Implementation Guide
## RPSFull Tournament Platform - Complete Implementation Details

**Document Version:** 2.0  
**Last Updated:** November 22, 2025  
**Status:** Implementation Guide  
**Purpose:** Detailed step-by-step instructions for implementing every specification

**Development Methodology:** Test-Driven Development (TDD) + Interface Segregation Principle (ISP)

---

## 🎯 Core Development Principles

### Test-Driven Development (TDD) Workflow

**Red-Green-Refactor Cycle:**
1. **🔴 RED**: Write a failing test
2. **🟢 GREEN**: Write minimal code to make test pass
3. **🔵 REFACTOR**: Improve code while keeping tests green

**TDD Rules:**
- ✅ Write tests BEFORE implementation
- ✅ One test at a time
- ✅ Run tests frequently
- ✅ Keep tests simple and focused
- ✅ Refactor only when tests are green
- ✅ Maintain high test coverage (80%+)

### Interface Segregation Principle (ISP)

**Core Principle:** Clients should not be forced to depend on interfaces they don't use.

**ISP Rules:**
- ✅ Create small, focused interfaces
- ✅ One interface per responsibility
- ✅ Prefer composition over large interfaces
- ✅ Services implement only what they need
- ✅ No "god interfaces" with many methods

**Example:**
```typescript
// ❌ BAD: Large interface
interface IGameService {
  createMatch(): void;
  createTournament(): void;
  calculateStats(): void;
  validateGame(): void;
}

// ✅ GOOD: Segregated interfaces
interface IMatchService {
  createMatch(): void;
  getMatch(): void;
}

interface ITournamentService {
  createTournament(): void;
  getTournament(): void;
}

interface IStatisticsService {
  calculateStats(): void;
}

interface IGameValidationService {
  validateGame(): void;
}
```

---

## Table of Contents

1. [Phase 0: Project Setup & Foundation](#phase-0-project-setup--foundation)
2. [Phase 1: Contracts Package Implementation](#phase-1-contracts-package-implementation)
3. [Phase 2: Database Setup](#phase-2-database-setup)
4. [Phase 3: Mock API Implementation](#phase-3-mock-api-implementation)
5. [Phase 4: Authentication System](#phase-4-authentication-system)
6. [Phase 5: Backend API Foundation](#phase-5-backend-api-foundation)
7. [Phase 6: Match System](#phase-6-match-system)
8. [Phase 7: Real-Time WebSocket](#phase-7-real-time-websocket)
9. [Phase 8: Tournament System](#phase-8-tournament-system)
10. [Phase 9: Statistics Engine](#phase-9-statistics-engine)
11. [Phase 10: Game Editor](#phase-10-game-editor)
12. [Phase 11: Frontend Foundation](#phase-11-frontend-foundation)
13. [Phase 12: Frontend Features](#phase-12-frontend-features)
14. [Phase 13: UI/UX Implementation](#phase-13-uiux-implementation)
15. [Phase 14: Testing & QA](#phase-14-testing--qa)
16. [Phase 15: Deployment](#phase-15-deployment)

---

## Phase 0: Project Setup & Foundation

### Step 0.1: Initialize Monorepo Structure

**Objective:** Set up the complete monorepo structure with all packages.

**Commands:**
```bash
# Clone repository (if starting fresh)
git clone https://github.com/YOLOVibeCode/rpsfull.git
cd rpsfull

# OR if repository already exists locally
cd rpsfull

# Initialize root package.json (if not already done)
pnpm init

# Create workspace structure
mkdir -p packages/{contracts,frontend,backend,mock-api}
mkdir -p docs/{specs,implementation}
mkdir -p .github/workflows
```

**Root package.json:**
```json
{
  "name": "rpsfull-platform",
  "version": "1.0.0",
  "private": true,
  "description": "RPSFull Tournament Platform - Monorepo",
  "scripts": {
    "dev": "turbo run dev",
    "build": "turbo run build",
    "test": "turbo run test",
    "lint": "turbo run lint",
    "clean": "turbo run clean && rm -rf node_modules",
    "contracts:build": "pnpm --filter @rpsfull-platform/contracts build",
    "mock-api:dev": "pnpm --filter @rpsfull-platform/mock-api dev"
  },
  "devDependencies": {
    "turbo": "^1.10.0",
    "typescript": "^5.0.0"
  },
  "engines": {
    "node": ">=20.0.0",
    "pnpm": ">=8.0.0"
  }
}
```

**pnpm-workspace.yaml:**
```yaml
packages:
  - 'packages/*'
```

**turbo.json:**
```json
{
  "$schema": "https://turbo.build/schema.json",
  "pipeline": {
    "build": {
      "dependsOn": ["^build"],
      "outputs": ["dist/**", ".next/**"]
    },
    "dev": {
      "cache": false,
      "persistent": true
    },
    "test": {
      "dependsOn": ["build"]
    },
    "lint": {
      "outputs": []
    }
  }
}
```

**Verification:**
```bash
pnpm install
pnpm --filter @rpsfull-platform/contracts --version
```

### Step 0.2: Set Up Docker Compose

**Objective:** Configure local development environment with PostgreSQL and Redis.

**Create docker-compose.yml:**
```yaml
version: '3.8'

services:
  postgres:
    image: postgres:15-alpine
    container_name: rpsfull-postgres
    environment:
      POSTGRES_DB: rpsfull_dev
      POSTGRES_USER: rpsfull
      POSTGRES_PASSWORD: dev_password_change_in_production
      POSTGRES_HOST_AUTH_METHOD: trust
    ports:
      - "5432:5432"
    volumes:
      - postgres_data:/var/lib/postgresql/data
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U rpsfull"]
      interval: 10s
      timeout: 5s
      retries: 5

  redis:
    image: redis:7-alpine
    container_name: rpsfull-redis
    ports:
      - "6379:6379"
    volumes:
      - redis_data:/data
    healthcheck:
      test: ["CMD", "redis-cli", "ping"]
      interval: 10s
      timeout: 3s
      retries: 5

volumes:
  postgres_data:
  redis_data:
```

**Start services:**
```bash
docker-compose up -d
docker-compose ps  # Verify services are running
docker-compose logs postgres  # Check logs
```

**Verify connection:**
```bash
# Test PostgreSQL
docker exec -it rpsfull-postgres psql -U rpsfull -d rpsfull_dev -c "SELECT version();"

# Test Redis
docker exec -it rpsfull-redis redis-cli ping
```

### Step 0.3: Configure Development Tools

**Objective:** Set up ESLint, Prettier, and Git hooks.

**Root .eslintrc.js:**
```javascript
module.exports = {
  root: true,
  extends: [
    'eslint:recommended',
    'plugin:@typescript-eslint/recommended',
  ],
  parser: '@typescript-eslint/parser',
  plugins: ['@typescript-eslint'],
  rules: {
    '@typescript-eslint/no-explicit-any': 'warn',
    '@typescript-eslint/explicit-module-boundary-types': 'off',
  },
};
```

**Root .prettierrc:**
```json
{
  "semi": true,
  "trailingComma": "es5",
  "singleQuote": true,
  "printWidth": 100,
  "tabWidth": 2,
  "useTabs": false
}
```

**Root .gitignore:**
```
# Dependencies
node_modules/
.pnp
.pnp.js

# Testing
coverage/
.nyc_output

# Production
dist/
build/
.next/
out/

# Environment
.env
.env.local
.env*.local

# IDE
.vscode/
.idea/
*.swp
*.swo
*~

# OS
.DS_Store
Thumbs.db

# Logs
logs/
*.log
npm-debug.log*
yarn-debug.log*
yarn-error.log*

# Database
*.db
*.sqlite

# Docker
docker-compose.override.yml
```

**Set up Husky (Git hooks):**
```bash
pnpm add -D -w husky lint-staged
npx husky install
npx husky add .husky/pre-commit "pnpm lint-staged"
```

**package.json (add lint-staged):**
```json
{
  "lint-staged": {
    "*.{ts,tsx}": ["eslint --fix", "prettier --write"],
    "*.{json,md}": ["prettier --write"]
  }
}
```

---

## Phase 1: Contracts Package Implementation

### TDD Approach for Contracts

**Testing Strategy:**
- Test type guards and validators
- Test interface compliance
- Test validation schemas
- No implementation code to test (types only)

### Step 1.1: Initialize Contracts Package

**Objective:** Set up the contracts package structure with TDD setup.

**Commands:**
```bash
cd packages/contracts
pnpm init
```

**package.json:**
```json
{
  "name": "@rpsfull-platform/contracts",
  "version": "1.0.0",
  "description": "Shared contracts and type definitions for RPSFull",
  "main": "dist/index.js",
  "types": "dist/index.d.ts",
  "files": ["dist"],
  "scripts": {
    "build": "tsc",
    "dev": "tsc --watch",
    "clean": "rm -rf dist",
    "lint": "eslint src --ext .ts",
    "test": "jest"
  },
  "dependencies": {
    "zod": "^3.22.0"
  },
  "devDependencies": {
    "@types/node": "^20.0.0",
    "typescript": "^5.0.0",
    "eslint": "^8.0.0",
    "@typescript-eslint/eslint-plugin": "^6.0.0",
    "@typescript-eslint/parser": "^6.0.0"
  },
  "peerDependencies": {
    "typescript": ">=5.0.0"
  }
}
```

**tsconfig.json:**
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

**Create directory structure:**
```bash
mkdir -p src/{entities,dtos,interfaces,enums,validators,types,constants}
touch src/index.ts
```

### Step 1.2: Implement Enums

**File: `src/enums/index.ts`**

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

/**
 * Game visibility
 */
export enum GameVisibility {
  PRIVATE = 'private',
  UNLISTED = 'unlisted',
  PUBLIC = 'public',
}

/**
 * Difficulty levels
 */
export enum DifficultyLevel {
  BEGINNER = 'beginner',
  INTERMEDIATE = 'intermediate',
  ADVANCED = 'advanced',
}

/**
 * Invitation statuses
 */
export enum InvitationStatus {
  PENDING = 'pending',
  ACCEPTED = 'accepted',
  DECLINED = 'declined',
  EXPIRED = 'expired',
}
```

**Verification:**
```bash
cd packages/contracts
pnpm build
# Should create dist/ directory with compiled files
```

### Step 1.3: Implement Entity Interfaces

**File: `src/entities/User.entity.ts`**

```typescript
import { UserRole } from '../enums';

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
  password?: string;
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

**File: `src/entities/Player.entity.ts`**

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

**Continue with all other entities following the same pattern...**

**File: `src/entities/GameType.entity.ts`**

```typescript
import { TieRule, ScoringMethod } from '../enums';

/**
 * Symbol definition within a game type
 */
export interface IGameSymbol {
  readonly id: string;
  readonly name: string;
  readonly emoji: string;
  readonly iconUrl?: string;
  readonly color?: string;
  readonly displayOrder: number;
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
  tags?: string[];
  difficultyLevel?: string;
  visibility?: string;
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

**File: `src/entities/Match.entity.ts`**

```typescript
import { MatchStatus, PlayMode } from '../enums';

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

**File: `src/entities/Round.entity.ts`**

```typescript
import { RoundResult } from '../enums';

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

**Continue implementing all entities from Database Schema spec...**

### Step 1.4: Implement DTOs

**File: `src/dtos/auth.dto.ts`**

```typescript
import { IUserPublic } from '../entities';

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
 * Email registration DTO
 */
export interface IRegisterEmailDto {
  email: string;
  referralCode?: string;
  invitationToken?: string;
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
```

**File: `src/dtos/match.dto.ts`**

```typescript
import { PlayMode, RoundResult } from '../enums';

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
```

**Continue with all DTOs from API spec...**

### Step 1.5: Implement Validation Schemas (TDD)

**TDD Approach:** Write tests first, then implement validators.

**File: `src/validators/__tests__/auth.validator.test.ts`**

```typescript
import { loginSchema, registerSchema, registerEmailSchema } from '../auth.validator';

describe('Auth Validators', () => {
  describe('loginSchema', () => {
    it('should validate correct login data', () => {
      const validData = {
        email: 'user@example.com',
        password: 'Password123',
      };
      
      const result = loginSchema.safeParse(validData);
      expect(result.success).toBe(true);
    });

    it('should reject invalid email', () => {
      const invalidData = {
        email: 'not-an-email',
        password: 'Password123',
      };
      
      const result = loginSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].path).toContain('email');
      }
    });

    it('should reject short password', () => {
      const invalidData = {
        email: 'user@example.com',
        password: 'short',
      };
      
      const result = loginSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
    });
  });

  describe('registerSchema', () => {
    it('should validate correct registration data', () => {
      const validData = {
        email: 'user@example.com',
        password: 'SecurePass123',
        name: 'John Doe',
      };
      
      const result = registerSchema.safeParse(validData);
      expect(result.success).toBe(true);
    });

    it('should reject password without uppercase', () => {
      const invalidData = {
        email: 'user@example.com',
        password: 'lowercase123',
        name: 'John Doe',
      };
      
      const result = registerSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
    });

    it('should reject password without number', () => {
      const invalidData = {
        email: 'user@example.com',
        password: 'NoNumbers',
        name: 'John Doe',
      };
      
      const result = registerSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
    });
  });
});
```

**Run tests (should fail - RED):**
```bash
pnpm test
# Tests fail because validators don't exist yet
```

**Now implement validators (GREEN):**

**File: `src/validators/auth.validator.ts`**

```typescript
import { z } from 'zod';

export const loginSchema = z.object({
  email: z.string().email('Invalid email format'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
});

export const registerSchema = z.object({
  email: z.string().email('Invalid email format'),
  password: z
    .string()
    .min(8, 'Password must be at least 8 characters')
    .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
    .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
    .regex(/[0-9]/, 'Password must contain at least one number'),
  name: z.string().min(2, 'Name must be at least 2 characters').max(100),
  displayName: z.string().max(100).optional(),
});

export const registerEmailSchema = z.object({
  email: z.string().email('Invalid email format'),
  referralCode: z.string().optional(),
  invitationToken: z.string().uuid().optional(),
});

export const refreshTokenSchema = z.object({
  refreshToken: z.string().min(1, 'Refresh token is required'),
});
```

**File: `src/validators/match.validator.ts`**

```typescript
import { z } from 'zod';
import { PlayMode } from '../enums';

export const createMatchSchema = z.object({
  player2Id: z.string().uuid('Invalid player ID'),
  gameTypeId: z.string().uuid('Invalid game type ID'),
  bestOfN: z
    .number()
    .int()
    .positive()
    .refine((n) => n % 2 === 1, 'Best of N must be odd number'),
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

**Continue with all validators...**

### Step 1.6: Implement Service Interfaces (ISP)

**ISP Principle:** Create small, focused interfaces. Split large interfaces into smaller ones.

**File: `src/interfaces/services/IAuthService.ts`**

```typescript
import {
  ILoginDto,
  IRegisterDto,
  IRegisterEmailDto,
  IAuthResponseDto,
  IRefreshTokenDto,
  ITokenResponseDto,
} from '../../dtos';

/**
 * Core authentication operations
 * ISP: Focused only on authentication, not user management
 */
export interface IAuthService {
  register(data: IRegisterDto): Promise<IAuthResponseDto>;
  login(data: ILoginDto): Promise<IAuthResponseDto>;
  logout(userId: string, refreshToken: string): Promise<void>;
  refreshToken(data: IRefreshTokenDto): Promise<ITokenResponseDto>;
}

/**
 * Email-based authentication (magic links)
 * ISP: Separated from password auth
 */
export interface IEmailAuthService {
  registerEmail(data: IRegisterEmailDto): Promise<{ email: string; expiresIn: number }>;
  verifyEmail(token: string): Promise<IAuthResponseDto>;
}

/**
 * Password management
 * ISP: Separated from authentication
 */
export interface IPasswordService {
  requestPasswordReset(email: string): Promise<void>;
  resetPassword(token: string, newPassword: string): Promise<void>;
  verifyEmailToken(token: string): Promise<void>;
}
```

**File: `src/interfaces/services/IMatchService.ts`**

```typescript
import {
  ICreateMatchDto,
  ISubmitMoveDto,
  ISubmitMoveResponseDto,
  IRecordRoundDto,
  IRecordRoundResponseDto,
} from '../../dtos';
import { IMatch, IMatchWithDetails } from '../../entities';

/**
 * Match lifecycle management
 * ISP: Focused only on match operations
 */
export interface IMatchService {
  createMatch(userId: string, data: ICreateMatchDto): Promise<IMatch>;
  getMatch(matchId: string): Promise<IMatchWithDetails>;
  startMatch(matchId: string, userId: string): Promise<IMatch>;
  cancelMatch(matchId: string, userId: string): Promise<void>;
  getPlayerMatches(playerId: string, filters?: Record<string, any>): Promise<IMatch[]>;
}

/**
 * Match gameplay operations
 * ISP: Separated from match management
 */
export interface IMatchGameplayService {
  submitMove(
    matchId: string,
    playerId: string,
    data: ISubmitMoveDto
  ): Promise<ISubmitMoveResponseDto>;
  recordRound(matchId: string, data: IRecordRoundDto): Promise<IRecordRoundResponseDto>;
}
```

**File: `src/interfaces/services/ITournamentService.ts`**

```typescript
import {
  ICreateTournamentDto,
  IUpdateTournamentDto,
  IAddPlayerToTournamentDto,
  ITournamentStandingsDto,
} from '../../dtos';
import { ITournament, ITournamentWithDetails } from '../../entities';

/**
 * Tournament CRUD operations
 * ISP: Focused on tournament management
 */
export interface ITournamentService {
  createTournament(userId: string, data: ICreateTournamentDto): Promise<ITournament>;
  getTournament(tournamentId: string): Promise<ITournamentWithDetails>;
  updateTournament(
    tournamentId: string,
    userId: string,
    data: IUpdateTournamentDto
  ): Promise<ITournament>;
  deleteTournament(tournamentId: string, userId: string): Promise<void>;
  listTournaments(filters?: Record<string, any>): Promise<ITournament[]>;
}

/**
 * Tournament participation
 * ISP: Separated from tournament management
 */
export interface ITournamentParticipationService {
  registerPlayer(tournamentId: string, playerId: string): Promise<void>;
  addPlayer(
    tournamentId: string,
    userId: string,
    data: IAddPlayerToTournamentDto
  ): Promise<void>;
  getStandings(tournamentId: string): Promise<ITournamentStandingsDto>;
}

/**
 * Tournament progression
 * ISP: Separated from tournament management
 */
export interface ITournamentProgressionService {
  startTournament(tournamentId: string, userId: string): Promise<ITournament>;
  getBracket(tournamentId: string): Promise<any>;
  advanceTournament(tournamentId: string): Promise<void>;
}
```

**File: `src/interfaces/services/IStatisticsService.ts`**

```typescript
import { IPlayerStatistics, IHeadToHeadStatsDto, IGlobalStatsDto } from '../../entities';

/**
 * Player statistics
 * ISP: Focused on player stats only
 */
export interface IPlayerStatisticsService {
  getPlayerStatistics(playerId: string, gameTypeId?: string): Promise<IPlayerStatistics>;
  updateStatistics(matchId: string): Promise<void>;
}

/**
 * Head-to-head analysis
 * ISP: Separated from general statistics
 */
export interface IHeadToHeadService {
  getHeadToHead(player1Id: string, player2Id: string): Promise<IHeadToHeadStatsDto>;
}

/**
 * Global statistics
 * ISP: Separated from player-specific stats
 */
export interface IGlobalStatisticsService {
  getGlobalStatistics(gameTypeId?: string): Promise<IGlobalStatsDto>;
}

/**
 * Ranking calculations
 * ISP: Separated from statistics retrieval
 */
export interface IRankingService {
  calculateRankings(gameTypeId: string): Promise<void>;
  getLeaderboard(gameTypeId: string, limit: number): Promise<any[]>;
}
```

**File: `src/interfaces/services/IMatchService.ts`**

```typescript
import {
  ICreateMatchDto,
  ISubmitMoveDto,
  ISubmitMoveResponseDto,
  IRecordRoundDto,
  IRecordRoundResponseDto,
} from '../../dtos';
import { IMatch, IMatchWithDetails } from '../../entities';

export interface IMatchService {
  createMatch(userId: string, data: ICreateMatchDto): Promise<IMatch>;
  getMatch(matchId: string): Promise<IMatchWithDetails>;
  startMatch(matchId: string, userId: string): Promise<IMatch>;
  submitMove(
    matchId: string,
    playerId: string,
    data: ISubmitMoveDto
  ): Promise<ISubmitMoveResponseDto>;
  recordRound(matchId: string, data: IRecordRoundDto): Promise<IRecordRoundResponseDto>;
  cancelMatch(matchId: string, userId: string): Promise<void>;
  getPlayerMatches(playerId: string, filters?: Record<string, any>): Promise<IMatch[]>;
}
```

**Continue with all service interfaces...**

### Step 1.7: Create Barrel Exports

**File: `src/index.ts`**

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
export * from './entities/TournamentInvitation.entity';

// Enumerations
export * from './enums';

// DTOs
export * from './dtos/auth.dto';
export * from './dtos/match.dto';
export * from './dtos/tournament.dto';
export * from './dtos/statistics.dto';
export * from './dtos/invitation.dto';

// Interfaces
export * from './interfaces/repositories/IUserRepository';
export * from './interfaces/repositories/IPlayerRepository';
export * from './interfaces/repositories/IMatchRepository';
export * from './interfaces/repositories/ITournamentRepository';
export * from './interfaces/services/IAuthService';
export * from './interfaces/services/IMatchService';
export * from './interfaces/services/ITournamentService';
export * from './interfaces/services/IStatisticsService';

// Validators
export * from './validators/auth.validator';
export * from './validators/match.validator';
export * from './validators/tournament.validator';
export * from './validators/gameType.validator';

// Constants
export * from './constants/limits';
export * from './constants/errors';
export * from './constants/defaults';

// Types & Utilities
export * from './types/guards';
export * from './types/helpers';
```

**Build and verify:**
```bash
cd packages/contracts
pnpm build
# Check dist/ directory created
ls -la dist/
```

---

## Phase 2: Database Setup

### TDD Approach for Database

**Test-First Strategy:**
- Write repository tests first
- Implement repositories to pass tests
- Use Prisma for all data access
- Follow repository pattern strictly

### Step 2.1: Initialize Prisma

**Objective:** Set up Prisma ORM with PostgreSQL for type-safe, accurate data access.

**Why Prisma:**
- ✅ **Type Safety** - Generated TypeScript types
- ✅ **Migration-based** - Version-controlled schema changes
- ✅ **Transaction Support** - ACID compliance
- ✅ **Query Optimization** - Automatic query optimization
- ✅ **Relationship Handling** - Type-safe relationships

**Commands:**
```bash
cd packages/backend
pnpm add -D prisma
pnpm add @prisma/client
npx prisma init
```

**Configure .env:**
```env
DATABASE_URL="postgresql://rpsfull:dev_password_change_in_production@localhost:5432/rpsfull_dev?schema=public"
```

**File: `prisma/schema.prisma`**

```prisma
// RPSFull Tournament Platform - Prisma Schema

generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

model User {
  id                String    @id @default(uuid())
  email             String    @unique
  passwordHash      String?   @map("password_hash")
  role              String    @default("player")
  isEmailVerified   Boolean   @default(false) @map("is_email_verified")
  verificationToken String?   @map("verification_token")
  resetToken        String?   @map("reset_token")
  resetTokenExpiry  DateTime? @map("reset_token_expiry")
  lastLogin         DateTime? @map("last_login")
  isActive          Boolean   @default(true) @map("is_active")
  createdAt         DateTime  @default(now()) @map("created_at")
  updatedAt         DateTime  @updatedAt @map("updated_at")
  deletedAt         DateTime? @map("deleted_at")
  
  players       Player[]
  tournaments   Tournament[]
  sessions      Session[]
  createdGames  GameType[]   @relation("CreatedGameTypes")
  
  @@map("User")
  @@index([email])
  @@index([role])
}

model Player {
  id           String    @id @default(uuid())
  name         String
  displayName  String?   @map("display_name")
  userId       String?   @map("user_id")
  email        String?
  avatarUrl    String?   @map("avatar_url")
  level        Int       @default(1)
  experience   Int       @default(0)
  ranking      Int?
  bio          String?
  isActive     Boolean   @default(true) @map("is_active")
  createdAt    DateTime  @default(now()) @map("created_at")
  updatedAt    DateTime  @updatedAt @map("updated_at")
  deletedAt    DateTime? @map("deleted_at")
  
  user                User?              @relation(fields: [userId], references: [id], onDelete: SetNull)
  matchesAsPlayer1    Match[]            @relation("Player1Matches")
  matchesAsPlayer2    Match[]            @relation("Player2Matches")
  matchesWon          Match[]            @relation("WonMatches")
  roundsWon           Round[]
  tournamentEntries   TournamentEntry[]
  statistics          PlayerStatistics[]
  achievements        Achievement[]
  
  @@map("Player")
  @@index([userId])
  @@index([ranking])
  @@index([email])
}

// Continue with all models from Database Schema spec...
// (See 03_DATABASE_SCHEMA.md for complete schema)

model Match {
  id              String    @id @default(uuid())
  player1Id       String    @map("player1_id")
  player2Id       String    @map("player2_id")
  gameTypeId      String    @map("game_type_id")
  tournamentId    String?   @map("tournament_id")
  matchFormat     String    @default("best_of_3") @map("match_format")
  bestOfN         Int       @default(3) @map("best_of_n")
  tiesCount       Boolean   @default(false) @map("ties_count")
  playMode        String    @default("digital") @map("play_mode")
  status          String    @default("pending")
  winnerId        String?   @map("winner_id")
  player1Score    Int       @default(0) @map("player1_score")
  player2Score    Int       @default(0) @map("player2_score")
  totalRounds     Int       @default(0) @map("total_rounds")
  durationSeconds Int?      @map("duration_seconds")
  startedAt       DateTime? @map("started_at")
  completedAt     DateTime? @map("completed_at")
  createdAt       DateTime  @default(now()) @map("created_at")
  updatedAt       DateTime  @updatedAt @map("updated_at")
  
  player1    Player     @relation("Player1Matches", fields: [player1Id], references: [id])
  player2    Player     @relation("Player2Matches", fields: [player2Id], references: [id])
  winner     Player?    @relation("WonMatches", fields: [winnerId], references: [id])
  gameType   GameType   @relation(fields: [gameTypeId], references: [id])
  tournament Tournament? @relation(fields: [tournamentId], references: [id])
  rounds     Round[]
  
  @@map("Match")
  @@index([player1Id])
  @@index([player2Id])
  @@index([tournamentId])
  @@index([status])
  @@index([createdAt(sort: Desc)])
}
```

**Create migration:**
```bash
npx prisma migrate dev --name init
```

**Generate Prisma Client:**
```bash
npx prisma generate
```

**Verify connection:**
```bash
npx prisma studio
# Opens Prisma Studio in browser
```

### Step 2.2: Create Seed Script

**File: `prisma/seed.ts`**

```typescript
import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding database...');

  // Create default game type
  const classicRPS = await prisma.gameType.create({
    data: {
      name: 'Classic RPS',
      description: 'Traditional Rock, Paper, Scissors',
      symbolCount: 3,
      isDefault: true,
      symbols: [
        { id: 'rock', name: 'Rock', emoji: '🪨', displayOrder: 0 },
        { id: 'paper', name: 'Paper', emoji: '📄', displayOrder: 1 },
        { id: 'scissors', name: 'Scissors', emoji: '✂️', displayOrder: 2 },
      ],
      winMatrix: {
        rock: ['scissors'],
        paper: ['rock'],
        scissors: ['paper'],
      },
      tieRules: 'replay',
      scoringMethod: 'best_of_n',
    },
  });

  console.log('✅ Created default game type:', classicRPS.name);

  // Create test users
  const users = [];
  for (let i = 0; i < 10; i++) {
    const user = await prisma.user.create({
      data: {
        email: `user${i}@example.com`,
        passwordHash: 'hashed_password_here',
        role: i === 0 ? 'admin' : 'player',
        isEmailVerified: true,
      },
    });
    users.push(user);
  }

  console.log(`✅ Created ${users.length} users`);

  // Create players
  const players = [];
  for (let i = 0; i < users.length; i++) {
    const player = await prisma.player.create({
      data: {
        name: `Player ${i + 1}`,
        displayName: `Player${i + 1}`,
        userId: users[i].id,
        email: users[i].email,
        level: Math.floor(Math.random() * 50) + 1,
        experience: Math.floor(Math.random() * 10000),
        ranking: i + 1,
      },
    });
    players.push(player);
  }

  console.log(`✅ Created ${players.length} players`);

  console.log('🎉 Seeding completed!');
}

main()
  .catch((e) => {
    console.error('❌ Seeding failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
```

**Add to package.json:**
```json
{
  "prisma": {
    "seed": "tsx prisma/seed.ts"
  }
}
```

**Run seed:**
```bash
pnpm add -D tsx
npx prisma db seed
```

---

## Phase 3: Mock API Implementation

### Step 3.1: Initialize Mock API Package

**Commands:**
```bash
cd packages/mock-api
pnpm init
```

**package.json:**
```json
{
  "name": "@rpsfull-platform/mock-api",
  "version": "1.0.0",
  "scripts": {
    "dev": "tsx watch src/server.ts",
    "build": "tsc",
    "start": "node dist/server.js",
    "seed": "tsx src/data/seed.ts"
  },
  "dependencies": {
    "express": "^4.18.2",
    "cors": "^2.8.5",
    "uuid": "^9.0.0",
    "@rpsfull-platform/contracts": "workspace:*"
  },
  "devDependencies": {
    "@types/express": "^4.17.17",
    "@types/cors": "^2.8.13",
    "@types/uuid": "^9.0.0",
    "tsx": "^4.0.0",
    "typescript": "^5.0.0"
  }
}
```

**Create structure:**
```bash
mkdir -p src/{data,routes,middleware,services,utils,websocket}
touch src/{app.ts,server.ts}
```

### Step 3.2: Implement Data Service

**File: `src/services/data.service.ts`**

```typescript
import { v4 as uuidv4 } from 'uuid';
import {
  IUser,
  IPlayer,
  IMatch,
  ITournament,
  IGameType,
  IRound,
  IUserCreate,
  IPlayerCreate,
  IMatchCreate,
} from '@rpsfull-platform/contracts';

export class MockDataService {
  private data: {
    users: Map<string, IUser>;
    players: Map<string, IPlayer>;
    matches: Map<string, IMatch>;
    tournaments: Map<string, ITournament>;
    gameTypes: Map<string, IGameType>;
    rounds: Map<string, IRound>;
  };

  constructor(seedData?: any) {
    this.data = {
      users: new Map(),
      players: new Map(),
      matches: new Map(),
      tournaments: new Map(),
      gameTypes: new Map(),
      rounds: new Map(),
    };

    if (seedData) {
      this.initializeFromSeed(seedData);
    }
  }

  private initializeFromSeed(seedData: any) {
    // Initialize from seed data
    seedData.users?.forEach((user: IUser) => {
      this.data.users.set(user.id, user);
    });
    seedData.players?.forEach((player: IPlayer) => {
      this.data.players.set(player.id, player);
    });
    // ... etc
  }

  // User methods
  createUser(data: IUserCreate): IUser {
    const user: IUser = {
      id: uuidv4(),
      email: data.email,
      role: data.role || 'player',
      isEmailVerified: false,
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    this.data.users.set(user.id, user);
    return user;
  }

  getUserById(id: string): IUser | undefined {
    return this.data.users.get(id);
  }

  getUserByEmail(email: string): IUser | undefined {
    return Array.from(this.data.users.values()).find((u) => u.email === email);
  }

  updateUser(id: string, updates: Partial<IUser>): IUser | undefined {
    const user = this.data.users.get(id);
    if (!user) return undefined;
    const updated = { ...user, ...updates, updatedAt: new Date() };
    this.data.users.set(id, updated);
    return updated;
  }

  // Player methods
  createPlayer(data: IPlayerCreate): IPlayer {
    const player: IPlayer = {
      id: uuidv4(),
      name: data.name,
      displayName: data.displayName,
      userId: data.userId,
      email: data.email,
      avatarUrl: data.avatarUrl,
      level: 1,
      experience: 0,
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date(),
      ...data,
    };
    this.data.players.set(player.id, player);
    return player;
  }

  getPlayerById(id: string): IPlayer | undefined {
    return this.data.players.get(id);
  }

  searchPlayers(query: string, limit: number = 20): IPlayer[] {
    const searchLower = query.toLowerCase();
    return Array.from(this.data.players.values())
      .filter(
        (p) =>
          p.name.toLowerCase().includes(searchLower) ||
          p.displayName?.toLowerCase().includes(searchLower)
      )
      .slice(0, limit);
  }

  // Match methods
  createMatch(data: IMatchCreate): IMatch {
    const match: IMatch = {
      id: uuidv4(),
      player1Id: data.player1Id,
      player2Id: data.player2Id,
      gameTypeId: data.gameTypeId,
      tournamentId: data.tournamentId,
      matchFormat: 'best_of_3',
      bestOfN: data.bestOfN || 3,
      tiesCount: data.tiesCount || false,
      playMode: data.playMode,
      status: 'pending',
      player1Score: 0,
      player2Score: 0,
      totalRounds: 0,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    this.data.matches.set(match.id, match);
    return match;
  }

  getMatchById(id: string): IMatch | undefined {
    return this.data.matches.get(id);
  }

  getMatchesByPlayer(playerId: string, filters?: any): IMatch[] {
    return Array.from(this.data.matches.values()).filter(
      (m) =>
        (m.player1Id === playerId || m.player2Id === playerId) &&
        (!filters?.status || m.status === filters.status)
    );
  }

  updateMatch(id: string, updates: Partial<IMatch>): IMatch | undefined {
    const match = this.data.matches.get(id);
    if (!match) return undefined;
    const updated = { ...match, ...updates, updatedAt: new Date() };
    this.data.matches.set(id, updated);
    return updated;
  }

  // Continue with all other entities...
}
```

**Continue implementing all CRUD operations for all entities...**

### Step 3.3: Implement Routes

**File: `src/routes/matches.routes.ts`**

```typescript
import { Router, Request, Response } from 'express';
import { MockDataService } from '../services/data.service';
import { mockAuthMiddleware, AuthenticatedRequest } from '../middleware/auth.middleware';
import { createMatchSchema, submitMoveSchema } from '@rpsfull-platform/contracts';

export function setupMatchRoutes(router: Router, db: MockDataService) {
  // Create match
  router.post('/matches', mockAuthMiddleware, (req: AuthenticatedRequest, res: Response) => {
    try {
      const validated = createMatchSchema.parse(req.body);
      const match = db.createMatch({
        ...validated,
        player1Id: req.user!.id,
      });

      res.status(201).json({
        success: true,
        data: match,
        meta: {
          timestamp: new Date().toISOString(),
        },
      });
    } catch (error: any) {
      res.status(422).json({
        success: false,
        error: {
          code: 'VAL_003',
          message: error.message || 'Validation error',
        },
      });
    }
  });

  // Get match
  router.get('/matches/:id', (req: Request, res: Response) => {
    const match = db.getMatchById(req.params.id);
    if (!match) {
      return res.status(404).json({
        success: false,
        error: {
          code: 'RES_001',
          message: 'Match not found',
        },
      });
    }

    const player1 = db.getPlayerById(match.player1Id);
    const player2 = db.getPlayerById(match.player2Id);
    const rounds = db.getRoundsByMatchId(match.id);

    res.json({
      success: true,
      data: {
        ...match,
        player1,
        player2,
        rounds,
      },
    });
  });

  // Get my matches
  router.get('/matches/my', mockAuthMiddleware, (req: AuthenticatedRequest, res: Response) => {
    const { status, limit = 20, page = 1 } = req.query;
    const matches = db.getMatchesByPlayer(req.user!.id, { status });

    const start = (Number(page) - 1) * Number(limit);
    const end = start + Number(limit);
    const paginated = matches.slice(start, end);

    res.json({
      success: true,
      data: paginated,
      meta: {
        pagination: {
          page: Number(page),
          limit: Number(limit),
          total: matches.length,
          totalPages: Math.ceil(matches.length / Number(limit)),
        },
      },
    });
  });

  // Submit move
  router.post(
    '/matches/:id/rounds',
    mockAuthMiddleware,
    (req: AuthenticatedRequest, res: Response) => {
      try {
        const validated = submitMoveSchema.parse(req.body);
        const match = db.getMatchById(req.params.id);

        if (!match) {
          return res.status(404).json({
            success: false,
            error: { code: 'MATCH_001', message: 'Match not found' },
          });
        }

        // Mock: Simulate opponent move
        const opponentMove = ['rock', 'paper', 'scissors'][Math.floor(Math.random() * 3)];

        res.status(201).json({
          success: true,
          data: {
            roundNumber: validated.roundNumber,
            yourMove: validated.move,
            opponentMove,
            result: 'win', // Simplified for mock
            waiting: false,
            matchComplete: false,
            currentScore: { player1: 1, player2: 0 },
          },
        });
      } catch (error: any) {
        res.status(422).json({
          success: false,
          error: {
            code: 'VAL_003',
            message: error.message,
          },
        });
      }
    }
  );

  // Continue with all other match endpoints...
}
```

**File: `src/app.ts`**

```typescript
import express from 'express';
import cors from 'cors';
import { setupRoutes } from './routes';
import { setupMiddleware } from './middleware';
import { initializeDatabase } from './data/seed';

export function createApp() {
  const app = express();

  // Middleware
  app.use(cors());
  app.use(express.json());

  // Initialize database
  const db = initializeDatabase();

  // Setup routes
  setupRoutes(app, db);

  // Setup error handling
  setupMiddleware(app);

  return { app, db };
}
```

**File: `src/server.ts`**

```typescript
import { createApp } from './app';

const PORT = process.env.PORT || 3001;

const { app } = createApp();

app.listen(PORT, () => {
  console.log(`🚀 Mock API running on http://localhost:${PORT}`);
  console.log(`📚 API docs: http://localhost:${PORT}/api-docs`);
});
```

**Test the mock API:**
```bash
cd packages/mock-api
pnpm dev
# Should start on http://localhost:3001

# Test endpoint
curl http://localhost:3001/api/v1/game-types
```

---

## Phase 4: Authentication System

### TDD Approach for Authentication

**Test-First Strategy:**
1. Write test for each method
2. See test fail (RED)
3. Implement minimal code (GREEN)
4. Refactor if needed

### Step 4.1: Implement Authentication Service (TDD + ISP)

**Step 4.1.1: Write Tests First (RED)**

**File: `packages/backend/src/services/__tests__/auth.service.test.ts`**

```typescript
import { AuthService } from '../auth.service';
import { UserRepository } from '../../repositories/user.repository';
import { IRegisterDto, ILoginDto } from '@rpsfull-platform/contracts';
import { PrismaClient } from '@prisma/client';

describe('AuthService', () => {
  let authService: AuthService;
  let userRepository: UserRepository;
  let prisma: PrismaClient;

  beforeEach(() => {
    prisma = new PrismaClient();
    userRepository = new UserRepository(prisma);
    authService = new AuthService(userRepository);
  });

  afterEach(async () => {
    await prisma.$disconnect();
  });

  describe('register', () => {
    it('should create a new user and return auth response', async () => {
      const registerData: IRegisterDto = {
        email: 'newuser@example.com',
        password: 'SecurePass123',
        name: 'New User',
      };

      const result = await authService.register(registerData);

      expect(result).toHaveProperty('user');
      expect(result).toHaveProperty('accessToken');
      expect(result).toHaveProperty('refreshToken');
      expect(result.user.email).toBe(registerData.email);
      expect(result.user.role).toBe('player');
    });

    it('should throw error if user already exists', async () => {
      const registerData: IRegisterDto = {
        email: 'existing@example.com',
        password: 'SecurePass123',
        name: 'Existing User',
      };

      // Create user first
      await authService.register(registerData);

      // Try to register again
      await expect(authService.register(registerData)).rejects.toThrow(
        'User already exists'
      );
    });

    it('should hash password before storing', async () => {
      const registerData: IRegisterDto = {
        email: 'test@example.com',
        password: 'SecurePass123',
        name: 'Test User',
      };

      await authService.register(registerData);

      const user = await userRepository.findByEmail(registerData.email);
      expect(user?.passwordHash).toBeDefined();
      expect(user?.passwordHash).not.toBe(registerData.password);
    });
  });

  describe('login', () => {
    it('should return auth response for valid credentials', async () => {
      // First register
      const registerData: IRegisterDto = {
        email: 'login@example.com',
        password: 'SecurePass123',
        name: 'Login User',
      };
      await authService.register(registerData);

      // Then login
      const loginData: ILoginDto = {
        email: 'login@example.com',
        password: 'SecurePass123',
      };

      const result = await authService.login(loginData);

      expect(result).toHaveProperty('user');
      expect(result).toHaveProperty('accessToken');
      expect(result.user.email).toBe(loginData.email);
    });

    it('should throw error for invalid email', async () => {
      const loginData: ILoginDto = {
        email: 'nonexistent@example.com',
        password: 'Password123',
      };

      await expect(authService.login(loginData)).rejects.toThrow('Invalid credentials');
    });

    it('should throw error for invalid password', async () => {
      const registerData: IRegisterDto = {
        email: 'wrongpass@example.com',
        password: 'SecurePass123',
        name: 'Wrong Pass User',
      };
      await authService.register(registerData);

      const loginData: ILoginDto = {
        email: 'wrongpass@example.com',
        password: 'WrongPassword',
      };

      await expect(authService.login(loginData)).rejects.toThrow('Invalid credentials');
    });
  });

  describe('refreshToken', () => {
    it('should generate new tokens from valid refresh token', async () => {
      // Implementation test
    });
  });
});
```

**Run tests (should fail - RED):**
```bash
cd packages/backend
pnpm test auth.service.test.ts
# Tests fail because AuthService doesn't exist yet
```

**Step 4.1.2: Implement Service (GREEN) - Following ISP**

**File: `packages/backend/src/services/auth.service.ts`**

```typescript
import {
  IAuthService,
  IRegisterDto,
  ILoginDto,
  IAuthResponseDto,
  IRefreshTokenDto,
  ITokenResponseDto,
} from '@rpsfull-platform/contracts';
import { IUserRepository } from '@rpsfull-platform/contracts';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';

/**
 * AuthService implements IAuthService (ISP: focused interface)
 * Does NOT implement IEmailAuthService or IPasswordService
 */
export class AuthService implements IAuthService {
  constructor(private userRepository: IUserRepository) {}

  async register(data: IRegisterDto): Promise<IAuthResponseDto> {
    // Check if user exists
    const existing = await this.userRepository.findByEmail(data.email);
    if (existing) {
      throw new Error('User already exists');
    }

    // Hash password
    const passwordHash = await bcrypt.hash(data.password, 12);

    // Create user
    const user = await this.userRepository.create({
      email: data.email,
      passwordHash,
      role: 'player',
    });

    // Create player
    // ... (implement player creation)

    // Generate tokens
    const tokens = this.generateTokens(user.id, user.email, user.role);

    return {
      user: {
        id: user.id,
        email: user.email,
        role: user.role,
        isEmailVerified: user.isEmailVerified,
        createdAt: user.createdAt,
      },
      ...tokens,
    };
  }

  async login(data: ILoginDto): Promise<IAuthResponseDto> {
    const user = await this.userRepository.findByEmail(data.email);
    if (!user || !user.passwordHash) {
      throw new Error('Invalid credentials');
    }

    const isValid = await bcrypt.compare(data.password, user.passwordHash);
    if (!isValid) {
      throw new Error('Invalid credentials');
    }

    const tokens = this.generateTokens(user.id, user.email, user.role);

    // Update last login
    await this.userRepository.update(user.id, { lastLogin: new Date() });

    return {
      user: {
        id: user.id,
        email: user.email,
        role: user.role,
        isEmailVerified: user.isEmailVerified,
        createdAt: user.createdAt,
      },
      ...tokens,
    };
  }

  private generateTokens(userId: string, email: string, role: string) {
    const accessToken = jwt.sign(
      { userId, email, role },
      process.env.JWT_SECRET!,
      { expiresIn: '15m' }
    );

    const refreshToken = jwt.sign(
      { userId, email, role },
      process.env.JWT_REFRESH_SECRET!,
      { expiresIn: '7d' }
    );

    return { accessToken, refreshToken };
  }

  // Continue implementing all methods...
}
```

**Continue with complete implementation following the same detailed pattern...**

**TDD Verification:**
```bash
# Run tests after each method implementation
pnpm test auth.service.test.ts
# Should see tests pass
```

---

## Phase 5: Backend API Foundation

### TDD Approach for Backend

**Test-First Strategy:**
- Write repository tests first
- Write service tests first
- Write controller tests first
- Implement to make tests pass

### Step 5.1: Initialize Backend Package

**Objective:** Set up Express.js backend with TypeScript and TDD setup.

### Step 5.1: Initialize Backend Package

**Objective:** Set up Express.js backend with TypeScript.

**Commands:**
```bash
cd packages/backend
pnpm init
```

**package.json:**
```json
{
  "name": "@rpsfull-platform/backend",
  "version": "1.0.0",
  "scripts": {
    "dev": "tsx watch src/server.ts",
    "build": "tsc",
    "start": "node dist/server.js",
    "db:migrate": "prisma migrate dev",
    "db:generate": "prisma generate",
    "db:seed": "tsx prisma/seed.ts",
    "db:studio": "prisma studio"
  },
  "dependencies": {
    "express": "^4.18.2",
    "cors": "^2.8.5",
    "helmet": "^7.0.0",
    "express-rate-limit": "^6.10.0",
    "bcrypt": "^5.1.1",
    "jsonwebtoken": "^9.0.2",
    "zod": "^3.22.0",
    "@prisma/client": "^5.7.0",
    "socket.io": "^4.5.4",
    "redis": "^4.6.0",
    "@rpsfull-platform/contracts": "workspace:*"
  },
  "devDependencies": {
    "@types/express": "^4.17.17",
    "@types/cors": "^2.8.13",
    "@types/bcrypt": "^5.0.0",
    "@types/jsonwebtoken": "^9.0.2",
    "prisma": "^5.7.0",
    "tsx": "^4.0.0",
    "typescript": "^5.0.0"
  }
}
```

**Create structure:**
```bash
mkdir -p src/{modules,middleware,services,repositories,utils,websocket,config}
mkdir -p src/{services,repositories,utils}/__tests__
touch src/{app.ts,server.ts}
```

**Set up TDD environment:**
```bash
pnpm add -D jest @types/jest ts-jest supertest @types/supertest
```

**File: `jest.config.js`**
```javascript
module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  roots: ['<rootDir>/src'],
  testMatch: ['**/__tests__/**/*.ts', '**/?(*.)+(spec|test).ts'],
  collectCoverageFrom: [
    'src/**/*.ts',
    '!src/**/*.d.ts',
    '!src/**/*.test.ts',
    '!src/server.ts',
  ],
  coverageThreshold: {
    global: {
      branches: 80,
      functions: 80,
      lines: 80,
      statements: 80,
    },
  },
};
```

### Step 5.2: Set Up Express Application

**File: `src/app.ts`**

```typescript
import express, { Express } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import { errorHandler } from './middleware/errorHandler.middleware';
import { setupRoutes } from './routes';

export function createApp(): Express {
  const app = express();

  // Security middleware
  app.use(helmet());
  app.use(cors({
    origin: process.env.FRONTEND_URL || 'http://localhost:3000',
    credentials: true,
  }));

  // Rate limiting
  const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // Limit each IP to 100 requests per windowMs
    message: 'Too many requests from this IP, please try again later.',
  });
  app.use('/api/', limiter);

  // Body parsing
  app.use(express.json({ limit: '10mb' }));
  app.use(express.urlencoded({ extended: true }));

  // Health check
  app.get('/health', (req, res) => {
    res.json({ status: 'ok', timestamp: new Date().toISOString() });
  });

  // API routes
  app.use('/api/v1', setupRoutes());

  // Error handling (must be last)
  app.use(errorHandler);

  return app;
}
```

**File: `src/server.ts`**

```typescript
import { createApp } from './app';
import { createServer } from 'http';
import { setupWebSocket } from './websocket';

const PORT = process.env.PORT || 3000;
const app = createApp();
const httpServer = createServer(app);

// Setup WebSocket
setupWebSocket(httpServer);

httpServer.listen(PORT, () => {
  console.log(`🚀 Backend server running on http://localhost:${PORT}`);
  console.log(`📡 WebSocket server ready`);
});
```

### Step 5.3: Implement Repository Pattern (TDD + ISP)

**ISP Note:** Repository implements IUserRepository only (focused interface).

**Step 5.3.1: Write Tests First (RED)**

**File: `src/repositories/__tests__/user.repository.test.ts`**

```typescript
import { UserRepository } from '../user.repository';
import { PrismaClient } from '@prisma/client';
import { IUserRepository, IUserCreate } from '@rpsfull-platform/contracts';

describe('UserRepository', () => {
  let repository: IUserRepository;
  let prisma: PrismaClient;

  beforeEach(() => {
    prisma = new PrismaClient();
    repository = new UserRepository(prisma);
  });

  afterEach(async () => {
    await prisma.$disconnect();
  });

  describe('create', () => {
    it('should create a new user', async () => {
      const userData: IUserCreate = {
        email: 'test@example.com',
        passwordHash: 'hashed_password',
      };

      const user = await repository.create(userData);

      expect(user).toHaveProperty('id');
      expect(user.email).toBe(userData.email);
      expect(user.role).toBe('player');
    });

    it('should throw error if email already exists', async () => {
      const userData: IUserCreate = {
        email: 'duplicate@example.com',
        passwordHash: 'hashed_password',
      };

      await repository.create(userData);
      
      await expect(repository.create(userData)).rejects.toThrow();
    });
  });

  describe('findByEmail', () => {
    it('should find user by email', async () => {
      // Create user first
      const userData: IUserCreate = {
        email: 'find@example.com',
        passwordHash: 'hashed_password',
      };
      await repository.create(userData);

      // Find user
      const found = await repository.findByEmail('find@example.com');

      expect(found).not.toBeNull();
      expect(found?.email).toBe('find@example.com');
    });

    it('should return null if user not found', async () => {
      const found = await repository.findByEmail('nonexistent@example.com');
      expect(found).toBeNull();
    });
  });
});
```

**Run tests (should fail - RED):**
```bash
pnpm test user.repository.test.ts
```

**Step 5.3.2: Implement Repository (GREEN)**

**File: `src/repositories/user.repository.ts`**

```typescript
import { PrismaClient } from '@prisma/client';
import { IUserRepository, IUser, IUserCreate, IUserUpdate } from '@rpsfull-platform/contracts';

/**
 * UserRepository implements IUserRepository (ISP: focused on user data access)
 */
export class UserRepository implements IUserRepository {
  constructor(private prisma: PrismaClient) {}

  async create(data: IUserCreate): Promise<IUser> {
    const user = await this.prisma.user.create({
      data: {
        email: data.email,
        passwordHash: data.passwordHash,
        role: data.role || 'player',
      },
    });
    return this.mapToEntity(user);
  }

  async findById(id: string): Promise<IUser | null> {
    const user = await this.prisma.user.findUnique({
      where: { id, deletedAt: null },
    });
    return user ? this.mapToEntity(user) : null;
  }

  async findByEmail(email: string): Promise<IUser | null> {
    const user = await this.prisma.user.findFirst({
      where: { email, deletedAt: null },
    });
    return user ? this.mapToEntity(user) : null;
  }

  async update(id: string, data: IUserUpdate): Promise<IUser> {
    const user = await this.prisma.user.update({
      where: { id },
      data: {
        ...data,
        updatedAt: new Date(),
      },
    });
    return this.mapToEntity(user);
  }

  async delete(id: string): Promise<void> {
    await this.prisma.user.update({
      where: { id },
      data: { deletedAt: new Date() },
    });
  }

  async findAll(filters?: Record<string, any>): Promise<IUser[]> {
    const users = await this.prisma.user.findMany({
      where: {
        deletedAt: null,
        ...filters,
      },
    });
    return users.map(this.mapToEntity);
  }

  private mapToEntity(user: any): IUser {
    return {
      id: user.id,
      email: user.email,
      role: user.role,
      isEmailVerified: user.isEmailVerified,
      isActive: user.isActive,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
      lastLogin: user.lastLogin,
      deletedAt: user.deletedAt,
    };
  }
}
```

**Continue with all repositories following the same TDD + ISP pattern...**

**TDD Workflow for Each Repository:**
1. Write test (RED)
2. Implement repository with Prisma (GREEN)
3. Refactor if needed
4. Move to next repository

**Data Access Layer Requirements:**
- ✅ **Always use Prisma** - Never raw SQL or query builders
- ✅ **Repository Pattern** - All data access through repositories
- ✅ **Interface-based** - Repositories implement contracts interfaces
- ✅ **Type Safety** - Full TypeScript type safety
- ✅ **Transaction Safety** - Use transactions for multi-step operations
- ✅ **Error Handling** - Proper error handling and rollback
- ✅ **No Direct Prisma Calls** - Services never call Prisma directly

**Example Repository Implementation:**
```typescript
// File: backend/src/repositories/user.repository.ts
import { PrismaClient } from '@prisma/client';
import { IUserRepository, IUser, IUserCreate } from '@rpsfull-platform/contracts';

export class UserRepository implements IUserRepository {
  constructor(private prisma: PrismaClient) {}
  
  async create(data: IUserCreate): Promise<IUser> {
    // Prisma handles type safety and validation
    return this.prisma.user.create({ data });
  }
  
  async findById(id: string): Promise<IUser | null> {
    // Prisma ensures type-safe queries
    return this.prisma.user.findUnique({ 
      where: { id },
      // Prisma handles soft deletes automatically
    });
  }
  
  // All methods use Prisma for type-safe, accurate data access
}
```

---

## Phase 6: Match System

### TDD Approach for Match System

**Test-First Strategy:**
1. Write tests for game logic (pure functions - easy to test)
2. Write tests for match service
3. Implement to make tests pass
4. Refactor

### Step 6.1: Implement Game Logic Service (TDD)

**Step 6.1.1: Write Tests First (RED)**

**File: `src/utils/__tests__/gameLogic.test.ts`**

```typescript
import {
  determineRoundWinner,
  isMatchComplete,
  determineMatchWinner,
  isValidMove,
} from '../gameLogic';
import { RoundResult, IWinMatrix } from '@rpsfull-platform/contracts';

describe('Game Logic', () => {
  const classicRPSMatrix: IWinMatrix = {
    rock: ['scissors'],
    paper: ['rock'],
    scissors: ['paper'],
  };

  describe('determineRoundWinner', () => {
    it('should return TIE when moves are the same', () => {
      const result = determineRoundWinner('rock', 'rock', classicRPSMatrix);
      expect(result).toBe(RoundResult.TIE);
    });

    it('should return PLAYER1_WIN when player1 defeats player2', () => {
      const result = determineRoundWinner('rock', 'scissors', classicRPSMatrix);
      expect(result).toBe(RoundResult.PLAYER1_WIN);
    });

    it('should return PLAYER2_WIN when player2 defeats player1', () => {
      const result = determineRoundWinner('scissors', 'rock', classicRPSMatrix);
      expect(result).toBe(RoundResult.PLAYER2_WIN);
    });

    it('should handle paper beats rock', () => {
      const result = determineRoundWinner('paper', 'rock', classicRPSMatrix);
      expect(result).toBe(RoundResult.PLAYER1_WIN);
    });

    it('should handle scissors beats paper', () => {
      const result = determineRoundWinner('scissors', 'paper', classicRPSMatrix);
      expect(result).toBe(RoundResult.PLAYER1_WIN);
    });
  });

  describe('isMatchComplete', () => {
    it('should return true when player1 reaches required wins', () => {
      const result = isMatchComplete(2, 0, 3);
      expect(result).toBe(true);
    });

    it('should return true when player2 reaches required wins', () => {
      const result = isMatchComplete(0, 2, 3);
      expect(result).toBe(true);
    });

    it('should return false when neither player has enough wins', () => {
      const result = isMatchComplete(1, 1, 3);
      expect(result).toBe(false);
    });

    it('should handle best of 5 correctly', () => {
      expect(isMatchComplete(3, 1, 5)).toBe(true);
      expect(isMatchComplete(2, 2, 5)).toBe(false);
    });
  });

  describe('determineMatchWinner', () => {
    it('should return player1 when player1 has higher score', () => {
      const result = determineMatchWinner(2, 1);
      expect(result).toBe('player1');
    });

    it('should return player2 when player2 has higher score', () => {
      const result = determineMatchWinner(1, 2);
      expect(result).toBe('player2');
    });

    it('should return null when scores are equal', () => {
      const result = determineMatchWinner(2, 2);
      expect(result).toBe(null);
    });
  });

  describe('isValidMove', () => {
    it('should return true for valid move', () => {
      const symbols = ['rock', 'paper', 'scissors'];
      expect(isValidMove('rock', symbols)).toBe(true);
    });

    it('should return false for invalid move', () => {
      const symbols = ['rock', 'paper', 'scissors'];
      expect(isValidMove('invalid', symbols)).toBe(false);
    });
  });
});
```

**Run tests (should fail - RED):**
```bash
pnpm test gameLogic.test.ts
# Tests fail because functions don't exist yet
```

**Step 6.1.2: Implement Game Logic (GREEN)**

**File: `src/utils/gameLogic.ts`**

```typescript
import { IWinMatrix, RoundResult } from '@rpsfull-platform/contracts';

/**
 * Determine winner of a round based on moves and win matrix
 */
export function determineRoundWinner(
  player1Move: string,
  player2Move: string,
  winMatrix: IWinMatrix
): RoundResult {
  // Same move = tie
  if (player1Move === player2Move) {
    return RoundResult.TIE;
  }

  // Check if player1's move defeats player2's move
  const player1Defeats = winMatrix[player1Move] || [];
  if (player1Defeats.includes(player2Move)) {
    return RoundResult.PLAYER1_WIN;
  }

  // Otherwise player2 wins
  return RoundResult.PLAYER2_WIN;
}

/**
 * Check if match is complete based on best-of-N rules
 */
export function isMatchComplete(
  player1Score: number,
  player2Score: number,
  bestOfN: number
): boolean {
  const requiredWins = Math.ceil(bestOfN / 2);
  return player1Score >= requiredWins || player2Score >= requiredWins;
}

/**
 * Determine match winner
 */
export function determineMatchWinner(
  player1Score: number,
  player2Score: number
): 'player1' | 'player2' | null {
  if (player1Score > player2Score) return 'player1';
  if (player2Score > player1Score) return 'player2';
  return null;
}

/**
 * Validate move against game type symbols
 */
export function isValidMove(move: string, symbols: string[]): boolean {
  return symbols.includes(move);
}
```

**Run tests (should pass - GREEN):**
```bash
pnpm test gameLogic.test.ts
# All tests should pass
```

**Step 6.1.3: Refactor if needed (REFACTOR)**
- Review code for improvements
- Ensure tests still pass
- Add edge case tests if needed

/**
 * Check if match is complete based on best-of-N rules
 */
export function isMatchComplete(
  player1Score: number,
  player2Score: number,
  bestOfN: number
): boolean {
  const requiredWins = Math.ceil(bestOfN / 2);
  return player1Score >= requiredWins || player2Score >= requiredWins;
}

/**
 * Determine match winner
 */
export function determineMatchWinner(
  player1Score: number,
  player2Score: number
): 'player1' | 'player2' | null {
  if (player1Score > player2Score) return 'player1';
  if (player2Score > player1Score) return 'player2';
  return null;
}

/**
 * Validate move against game type symbols
 */
export function isValidMove(move: string, symbols: string[]): boolean {
  return symbols.includes(move);
}
```

### Step 6.2: Implement Match Service (TDD + ISP)

**ISP Note:** MatchService implements IMatchService only.
MatchGameplayService (for submitMove) is separate.

**Step 6.2.1: Write Tests First (RED)**

**File: `src/services/__tests__/match.service.test.ts`**

```typescript
import { MatchService } from '../match.service';
import { MatchRepository } from '../../repositories/match.repository';
import { PlayerRepository } from '../../repositories/player.repository';
import { GameTypeRepository } from '../../repositories/gameType.repository';
import { ICreateMatchDto } from '@rpsfull-platform/contracts';

describe('MatchService', () => {
  let matchService: MatchService;
  let matchRepository: MatchRepository;
  let playerRepository: PlayerRepository;
  let gameTypeRepository: GameTypeRepository;

  beforeEach(() => {
    // Setup mocks or real repositories
    matchRepository = new MatchRepository(prisma);
    playerRepository = new PlayerRepository(prisma);
    gameTypeRepository = new GameTypeRepository(prisma);
    matchService = new MatchService(
      matchRepository,
      playerRepository,
      gameTypeRepository
    );
  });

  describe('createMatch', () => {
    it('should create a match with correct player assignments', async () => {
      const userId = 'user-123';
      const createData: ICreateMatchDto = {
        player2Id: 'player-456',
        gameTypeId: 'classic-rps',
        bestOfN: 3,
        playMode: 'digital',
      };

      const match = await matchService.createMatch(userId, createData);

      expect(match).toHaveProperty('id');
      expect(match.player1Id).toBeDefined();
      expect(match.player2Id).toBe(createData.player2Id);
      expect(match.gameTypeId).toBe(createData.gameTypeId);
      expect(match.bestOfN).toBe(createData.bestOfN);
      expect(match.status).toBe('pending');
    });

    it('should throw error if player not found', async () => {
      const userId = 'nonexistent-user';
      const createData: ICreateMatchDto = {
        player2Id: 'player-456',
        gameTypeId: 'classic-rps',
        bestOfN: 3,
        playMode: 'digital',
      };

      await expect(matchService.createMatch(userId, createData)).rejects.toThrow(
        'Player not found for user'
      );
    });
  });

  describe('getMatch', () => {
    it('should return match with details', async () => {
      const matchId = 'match-123';
      const match = await matchService.getMatch(matchId);

      expect(match).toHaveProperty('player1');
      expect(match).toHaveProperty('player2');
      expect(match).toHaveProperty('gameType');
      expect(match).toHaveProperty('rounds');
    });

    it('should throw error if match not found', async () => {
      await expect(matchService.getMatch('nonexistent')).rejects.toThrow(
        'Match not found'
      );
    });
  });
});
```

**Run tests (should fail - RED):**
```bash
pnpm test match.service.test.ts
```

**Step 6.2.2: Implement Service (GREEN) - Following ISP**

**File: `src/services/match.service.ts`**

```typescript
import {
  IMatchService,  // ISP: Only implements IMatchService
  ICreateMatchDto,
  IMatch,
  IMatchWithDetails,
} from '@rpsfull-platform/contracts';
import { IMatchRepository, IPlayerRepository, IGameTypeRepository } from '@rpsfull-platform/contracts';

/**
 * MatchService implements IMatchService (ISP: focused on match lifecycle)
 * Does NOT implement IMatchGameplayService (separate interface)
 */
export class MatchService implements IMatchService {
  constructor(
    private matchRepository: IMatchRepository,
    private playerRepository: IPlayerRepository,
    private gameTypeRepository: IGameTypeRepository
  ) {}

  async createMatch(userId: string, data: ICreateMatchDto): Promise<IMatch> {
    // Get player for user
    const player = await this.playerRepository.findByUserId(userId);
    if (!player) {
      throw new Error('Player not found for user');
    }

    // Create match
    const match = await this.matchRepository.create({
      ...data,
      player1Id: player.id,
    });

    return match;
  }

  async getMatch(matchId: string): Promise<IMatchWithDetails> {
    const match = await this.matchRepository.findByIdWithDetails(matchId);
    if (!match) {
      throw new Error('Match not found');
    }
    return match;
  }

  async submitMove(
    matchId: string,
    playerId: string,
    data: ISubmitMoveDto
  ): Promise<ISubmitMoveResponseDto> {
    const match = await this.matchRepository.findById(matchId);
    if (!match) {
      throw new Error('Match not found');
    }

    // Get game type for validation
    const gameType = await this.gameTypeRepository.findById(match.gameTypeId);
    if (!gameType) {
      throw new Error('Game type not found');
    }

    // Validate move
    const validMoves = gameType.symbols.map(s => s.id);
    if (!validMoves.includes(data.move)) {
      throw new Error('Invalid move');
    }

    // Determine if this is player1 or player2
    const isPlayer1 = match.player1Id === playerId;
    const moveKey = isPlayer1 ? 'player1Move' : 'player2Move';

    // Create or update round
    // ... (implement round creation/update logic)

    // Check if both players have moved
    // If yes, calculate result and update match
    // If no, return waiting response

    // This is simplified - full implementation would handle:
    // - Round creation
    // - Waiting for opponent
    // - Result calculation
    // - Score updates
    // - Match completion check

    return {
      roundNumber: data.roundNumber,
      yourMove: data.move,
      opponentMove: undefined,
      waiting: true,
      matchComplete: false,
    };
  }

  // Continue implementing all methods...
}
```

**Continue with complete match service implementation...**

---

## Phase 7: Real-Time WebSocket

### Step 7.1: Set Up Socket.io Server

**File: `src/websocket/index.ts`**

```typescript
import { Server as HTTPServer } from 'http';
import { Server as SocketIOServer } from 'socket.io';
import { setupMatchHandlers } from './match.handler';
import { setupTournamentHandlers } from './tournament.handler';

export function setupWebSocket(httpServer: HTTPServer) {
  const io = new SocketIOServer(httpServer, {
    cors: {
      origin: process.env.FRONTEND_URL || 'http://localhost:3000',
      methods: ['GET', 'POST'],
      credentials: true,
    },
    path: '/socket.io',
  });

  // Authentication middleware
  io.use(async (socket, next) => {
    const token = socket.handshake.auth.token;
    if (!token) {
      return next(new Error('Authentication error'));
    }
    
    // Verify JWT token
    // Extract user info
    // Attach to socket.data
    socket.data.userId = 'user-id-from-token';
    next();
  });

  io.on('connection', (socket) => {
    console.log('Client connected:', socket.id);

    // Setup handlers
    setupMatchHandlers(io, socket);
    setupTournamentHandlers(io, socket);

    socket.on('disconnect', () => {
      console.log('Client disconnected:', socket.id);
    });
  });

  return io;
}
```

### Step 7.2: Implement Match WebSocket Handlers

**File: `src/websocket/match.handler.ts`**

```typescript
import { Server as SocketIOServer, Socket } from 'socket.io';

export function setupMatchHandlers(io: SocketIOServer, socket: Socket) {
  // Join match room
  socket.on('match:join', async (data: { matchId: string }) => {
    const { matchId } = data;
    const room = `match:${matchId}`;
    
    await socket.join(room);
    
    // Notify other players
    socket.to(room).emit('match:opponent-joined', {
      playerId: socket.data.userId,
      playerName: 'Player Name', // Get from database
    });
  });

  // Player ready
  socket.on('match:ready', async (data: { matchId: string }) => {
    const { matchId } = data;
    const room = `match:${matchId}`;
    
    // Check if both players ready
    // If yes, start countdown
    let countdown = 3;
    const interval = setInterval(() => {
      io.to(room).emit('match:countdown', { secondsRemaining: countdown });
      countdown--;
      
      if (countdown < 0) {
        clearInterval(interval);
        io.to(room).emit('match:countdown-complete');
      }
    }, 1000);
  });

  // Submit move
  socket.on('match:move', async (data: {
    matchId: string;
    roundNumber: number;
    move: string;
    timeTakenMs?: number;
  }) => {
    const { matchId, roundNumber, move } = data;
    const room = `match:${matchId}`;
    
    // Store move temporarily
    // Check if opponent has moved
    // If both moved, calculate result and broadcast
    // If not, wait for opponent
    
    socket.to(room).emit('match:move-received', {
      roundNumber,
      playerId: socket.data.userId,
    });
  });

  // Leave match
  socket.on('match:leave', async (data: { matchId: string }) => {
    const { matchId } = data;
    await socket.leave(`match:${matchId}`);
  });
}
```

**Continue with complete WebSocket implementation...**

---

## Phase 8: Tournament System

### Step 8.1: Implement Bracket Generator

**File: `src/utils/bracketGenerator.ts`**

```typescript
import { TournamentType, IBracketData, IBracketRound, IBracketMatch } from '@rpsfull-platform/contracts';

/**
 * Generate single elimination bracket
 */
export function generateSingleEliminationBracket(
  playerIds: string[],
  seeds?: number[]
): IBracketData {
  const numPlayers = playerIds.length;
  const numRounds = Math.ceil(Math.log2(numPlayers));
  
  // Calculate bracket size (next power of 2)
  const bracketSize = Math.pow(2, numRounds);
  
  // Create first round matches
  const firstRound: IBracketMatch[] = [];
  for (let i = 0; i < bracketSize / 2; i++) {
    firstRound.push({
      position: i + 1,
      player1Id: playerIds[i * 2] || undefined,
      player2Id: playerIds[i * 2 + 1] || undefined,
    });
  }
  
  const rounds: IBracketRound[] = [
    {
      round: 1,
      name: `Round of ${bracketSize}`,
      matches: firstRound,
    },
  ];
  
  // Generate subsequent rounds
  for (let round = 2; round <= numRounds; round++) {
    const prevRound = rounds[round - 2];
    const matchesInRound = prevRound.matches.length / 2;
    const roundName = round === numRounds ? 'Finals' : `Round ${round}`;
    
    const matches: IBracketMatch[] = [];
    for (let i = 0; i < matchesInRound; i++) {
      matches.push({
        position: i + 1,
        // Winners will be filled in as matches complete
      });
    }
    
    rounds.push({
      round,
      name: roundName,
      matches,
    });
  }
  
  return { rounds };
}

/**
 * Generate double elimination bracket
 */
export function generateDoubleEliminationBracket(
  playerIds: string[],
  seeds?: number[]
): IBracketData {
  // More complex - generates winners bracket and losers bracket
  // Implementation details...
  return { rounds: [] };
}

/**
 * Generate round-robin schedule
 */
export function generateRoundRobinSchedule(
  playerIds: string[]
): IBracketData {
  // Each player plays every other player
  // Implementation details...
  return { rounds: [] };
}
```

### Step 8.2: Implement Tournament Service

**File: `src/services/tournament.service.ts`**

```typescript
import {
  ITournamentService,
  ICreateTournamentDto,
  ITournament,
  ITournamentWithDetails,
} from '@rpsfull-platform/contracts';
import { ITournamentRepository } from '@rpsfull-platform/contracts';
import { generateSingleEliminationBracket } from '../utils/bracketGenerator';

export class TournamentService implements ITournamentService {
  constructor(private tournamentRepository: ITournamentRepository) {}

  async createTournament(
    userId: string,
    data: ICreateTournamentDto
  ): Promise<ITournament> {
    const tournament = await this.tournamentRepository.create({
      ...data,
      organizerId: userId,
      status: 'draft',
    });

    return tournament;
  }

  async startTournament(
    tournamentId: string,
    userId: string
  ): Promise<ITournament> {
    const tournament = await this.tournamentRepository.findById(tournamentId);
    if (!tournament) {
      throw new Error('Tournament not found');
    }

    if (tournament.organizerId !== userId) {
      throw new Error('Not authorized');
    }

    // Get all participants
    const entries = await this.tournamentRepository.getEntries(tournamentId);
    const playerIds = entries.map(e => e.playerId);

    // Generate bracket
    const bracketData = generateSingleEliminationBracket(playerIds);

    // Update tournament
    const updated = await this.tournamentRepository.update(tournamentId, {
      status: 'in_progress',
      currentRound: 1,
      bracketData,
    });

    return updated;
  }

  // Continue implementing all methods...
}
```

**Continue with complete tournament implementation...**

---

## Phase 9: Statistics Engine

### Step 9.1: Implement Statistics Calculation

**File: `src/services/statistics.service.ts`**

```typescript
import {
  IStatisticsService,
  IPlayerStatistics,
  IHeadToHeadStatsDto,
} from '@rpsfull-platform/contracts';
import { IMatchRepository, IRoundRepository } from '@rpsfull-platform/contracts';

export class StatisticsService implements IStatisticsService {
  constructor(
    private matchRepository: IMatchRepository,
    private roundRepository: IRoundRepository
  ) {}

  async calculatePlayerStatistics(
    playerId: string,
    gameTypeId: string
  ): Promise<IPlayerStatistics> {
    // Get all matches for player
    const matches = await this.matchRepository.findByPlayer(playerId, {
      gameTypeId,
      status: 'completed',
    });

    // Calculate aggregate statistics
    const totalMatches = matches.length;
    const matchesWon = matches.filter(m => m.winnerId === playerId).length;
    const matchesLost = totalMatches - matchesWon;
    const winRate = totalMatches > 0 ? (matchesWon / totalMatches) * 100 : 0;

    // Get all rounds
    const rounds = await this.roundRepository.findByPlayer(playerId);

    // Calculate move statistics
    const moveStats: Record<string, any> = {};
    // ... aggregate move data

    return {
      id: 'stat-id',
      playerId,
      gameTypeId,
      totalMatches,
      matchesWon,
      matchesLost,
      matchesTied: 0,
      winRate,
      currentWinStreak: 0,
      longestWinStreak: 0,
      totalRounds: rounds.length,
      roundsWon: 0,
      roundsLost: 0,
      roundsTied: 0,
      moveStats,
      tournamentsEntered: 0,
      tournamentsWon: 0,
      updatedAt: new Date(),
    };
  }

  // Continue implementing all methods...
}
```

**Continue with complete statistics implementation...**

---

## Phase 10: Game Editor

### Step 10.1: Implement Game Validation

**File: `src/services/gameValidation.service.ts`**

```typescript
import { IGameTypeCreate, IWinMatrix, IGameValidationResult } from '@rpsfull-platform/contracts';

export class GameValidationService {
  validate(gameType: IGameTypeCreate): IGameValidationResult {
    const errors: any[] = [];
    const warnings: any[] = [];
    let balanceScore = 100;

    // Check symbol count is odd
    if (gameType.symbols.length % 2 === 0) {
      errors.push({
        type: 'EVEN_SYMBOL_COUNT',
        message: 'Symbol count must be odd (3, 5, 7, etc.)',
        severity: 'error',
      });
      balanceScore -= 20;
    }

    // Check each symbol beats exactly (n-1)/2 others
    const expectedBeats = (gameType.symbols.length - 1) / 2;
    for (const symbol of gameType.symbols) {
      const defeats = gameType.winMatrix[symbol.id] || [];
      if (defeats.length !== expectedBeats) {
        errors.push({
          type: 'UNBALANCED_WINS',
          message: `${symbol.name} should defeat exactly ${expectedBeats} symbols, but defeats ${defeats.length}`,
          severity: 'error',
          symbolId: symbol.id,
        });
        balanceScore -= 10;
      }
    }

    // Check for contradictions
    for (const [symbolId, defeats] of Object.entries(gameType.winMatrix)) {
      for (const defeatedId of defeats) {
        if (gameType.winMatrix[defeatedId]?.includes(symbolId)) {
          errors.push({
            type: 'CONTRADICTION',
            message: `${symbolId} and ${defeatedId} both defeat each other`,
            severity: 'error',
          });
          balanceScore -= 15;
        }
      }
    }

    return {
      isValid: errors.filter(e => e.severity === 'error').length === 0,
      errors,
      warnings,
      balanceScore: Math.max(0, Math.min(100, balanceScore)),
    };
  }

  generateBalancedMatrix(symbolIds: string[]): IWinMatrix {
    const n = symbolIds.length;
    if (n % 2 === 0) {
      throw new Error('Symbol count must be odd');
    }

    const matrix: IWinMatrix = {};
    const halfN = Math.floor(n / 2);

    // Circular arrangement: each symbol defeats the next halfN symbols
    for (let i = 0; i < n; i++) {
      const defeats: string[] = [];
      for (let j = 1; j <= halfN; j++) {
        defeats.push(symbolIds[(i + j) % n]);
      }
      matrix[symbolIds[i]] = defeats;
    }

    return matrix;
  }
}
```

**Continue with complete game editor implementation...**

---

## Phase 11: Frontend Foundation

### Step 11.1: Initialize Next.js Frontend

**Objective:** Set up Next.js 14+ with App Router.

**Commands:**
```bash
cd packages/frontend
pnpm create next-app@latest . --typescript --tailwind --app --no-src-dir --import-alias "@/*"
```

**package.json (update):**
```json
{
  "name": "@rpsfull-platform/frontend",
  "version": "1.0.0",
  "scripts": {
    "dev": "next dev",
    "build": "next build",
    "start": "next start",
    "lint": "next lint"
  },
  "dependencies": {
    "next": "^14.0.0",
    "react": "^18.2.0",
    "react-dom": "^18.2.0",
    "@rpsfull-platform/contracts": "workspace:*",
    "zustand": "^4.4.0",
    "@tanstack/react-query": "^5.0.0",
    "socket.io-client": "^4.5.4",
    "framer-motion": "^10.16.0",
    "canvas-confetti": "^1.6.0",
    "lucide-react": "^0.294.0",
    "zod": "^3.22.0",
    "axios": "^1.6.0"
  },
  "devDependencies": {
    "@types/node": "^20.0.0",
    "@types/react": "^18.2.0",
    "@types/react-dom": "^18.2.0",
    "typescript": "^5.0.0",
    "tailwindcss": "^3.3.0",
    "autoprefixer": "^10.4.16",
    "postcss": "^8.4.31"
  }
}
```

### Step 11.2: Set Up Project Structure

**Create directories:**
```bash
mkdir -p src/{app,components,features,hooks,lib,store,services,types,animations}
mkdir -p src/components/{ui,game,tournament,stats}
mkdir -p src/features/{auth,match,tournament,stats,game-editor}
mkdir -p public/{icons,sounds,images}
```

**File: `src/lib/api-client.ts`**

```typescript
import axios from 'axios';
import { IApiResponse } from '@rpsfull-platform/contracts';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api/v1';

export const apiClient = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor for auth token
apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem('accessToken');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Response interceptor for error handling
apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401) {
      // Handle token refresh
      // Redirect to login
    }
    return Promise.reject(error);
  }
);

export async function apiRequest<T>(
  method: 'get' | 'post' | 'put' | 'patch' | 'delete',
  url: string,
  data?: any
): Promise<T> {
  const response = await apiClient.request<IApiResponse<T>>({
    method,
    url,
    data,
  });

  if (!response.data.success) {
    throw new Error(response.data.error?.message || 'API request failed');
  }

  return response.data.data!;
}
```

### Step 11.3: Set Up State Management

**File: `src/store/authStore.ts`**

```typescript
import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { IUserPublic } from '@rpsfull-platform/contracts';

interface AuthState {
  user: IUserPublic | null;
  accessToken: string | null;
  refreshToken: string | null;
  setAuth: (user: IUserPublic, accessToken: string, refreshToken: string) => void;
  logout: () => void;
  isAuthenticated: () => boolean;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      accessToken: null,
      refreshToken: null,
      
      setAuth: (user, accessToken, refreshToken) => {
        set({ user, accessToken, refreshToken });
        localStorage.setItem('accessToken', accessToken);
        localStorage.setItem('refreshToken', refreshToken);
      },
      
      logout: () => {
        set({ user: null, accessToken: null, refreshToken: null });
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
      },
      
      isAuthenticated: () => {
        return get().user !== null && get().accessToken !== null;
      },
    }),
    {
      name: 'auth-storage',
    }
  )
);
```

**Continue with frontend implementation...**

---

## Phase 12: Frontend Features

### Step 12.1: Create Match Components

**File: `src/components/game/MatchLobby.tsx`**

```typescript
'use client';

import { useEffect, useState } from 'react';
import { useMatch } from '@/hooks/useMatch';
import { IPlayerPublic } from '@rpsfull-platform/contracts';

interface MatchLobbyProps {
  matchId: string;
}

export function MatchLobby({ matchId }: MatchLobbyProps) {
  const { data: match, isLoading } = useMatch(matchId);
  const [opponent, setOpponent] = useState<IPlayerPublic | null>(null);

  if (isLoading) {
    return <div>Loading match...</div>;
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-4">
      <h1 className="text-2xl font-bold mb-8">Match Lobby</h1>
      
      <div className="w-full max-w-md space-y-4">
        {/* Your info */}
        <div className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow">
          <h2 className="font-semibold">You</h2>
          <p>{match?.player1.name}</p>
        </div>

        <div className="text-center text-xl font-bold">VS</div>

        {/* Opponent info */}
        <div className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow">
          <h2 className="font-semibold">
            {opponent ? 'Opponent' : 'Waiting for opponent...'}
          </h2>
          {opponent && <p>{opponent.name}</p>}
        </div>

        {/* Match details */}
        <div className="bg-gray-100 dark:bg-gray-700 rounded-lg p-4">
          <p>Game: {match?.gameType.name}</p>
          <p>Format: Best of {match?.bestOfN}</p>
        </div>
      </div>
    </div>
  );
}
```

**File: `src/components/game/GamePlay.tsx`**

```typescript
'use client';

import { useState, useEffect } from 'react';
import { GameSymbol } from '@/components/icons/GameSymbol';
import { Countdown } from './Countdown';
import { ResultDisplay } from './ResultDisplay';
import { RoundHistory } from './RoundHistory';
import { useWebSocket } from '@/hooks/useWebSocket';

interface GamePlayProps {
  matchId: string;
}

export function GamePlay({ matchId }: GamePlayProps) {
  const [selectedMove, setSelectedMove] = useState<string | null>(null);
  const [countdown, setCountdown] = useState<number | null>(null);
  const [roundHistory, setRoundHistory] = useState<any[]>([]);
  const { socket, isConnected } = useWebSocket();

  useEffect(() => {
    if (!socket) return;

    socket.emit('match:join', { matchId });

    socket.on('match:countdown', (data: { secondsRemaining: number }) => {
      setCountdown(data.secondsRemaining);
    });

    socket.on('match:round-complete', (data: any) => {
      setRoundHistory(prev => [...prev, data]);
      setSelectedMove(null);
      setCountdown(null);
    });

    return () => {
      socket.off('match:countdown');
      socket.off('match:round-complete');
    };
  }, [socket, matchId]);

  const handleMoveSelect = (move: string) => {
    setSelectedMove(move);
    socket?.emit('match:move', {
      matchId,
      roundNumber: roundHistory.length + 1,
      move,
    });
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-4">
      {/* Round history */}
      <RoundHistory rounds={roundHistory} />

      {/* Countdown */}
      {countdown !== null && <Countdown seconds={countdown} />}

      {/* Symbol selector */}
      {!selectedMove && countdown === null && (
        <div className="flex gap-4 mt-8">
          <button
            onClick={() => handleMoveSelect('rock')}
            className="p-4 rounded-lg hover:scale-110 transition"
          >
            <GameSymbol symbol="rock" size={80} animate />
          </button>
          <button
            onClick={() => handleMoveSelect('paper')}
            className="p-4 rounded-lg hover:scale-110 transition"
          >
            <GameSymbol symbol="paper" size={80} animate />
          </button>
          <button
            onClick={() => handleMoveSelect('scissors')}
            className="p-4 rounded-lg hover:scale-110 transition"
          >
            <GameSymbol symbol="scissors" size={80} animate />
          </button>
        </div>
      )}

      {/* Result display */}
      {selectedMove && <ResultDisplay move={selectedMove} />}
    </div>
  );
}
```

**Continue with all frontend components...**

---

## Phase 13: UI/UX Implementation

### Step 13.1: Implement Animations

**File: `src/animations/confetti.ts`**

```typescript
import confetti from 'canvas-confetti';

export function triggerConfetti() {
  const duration = 3000;
  const animationEnd = Date.now() + duration;
  const defaults = { startVelocity: 30, spread: 360, ticks: 60, zIndex: 0 };

  function randomInRange(min: number, max: number) {
    return Math.random() * (max - min) + min;
  }

  const interval: any = setInterval(function() {
    const timeLeft = animationEnd - Date.now();

    if (timeLeft <= 0) {
      return clearInterval(interval);
    }

    const particleCount = 50 * (timeLeft / duration);
    
    confetti({
      ...defaults,
      particleCount,
      origin: { x: randomInRange(0.1, 0.3), y: Math.random() - 0.2 }
    });
    confetti({
      ...defaults,
      particleCount,
      origin: { x: randomInRange(0.7, 0.9), y: Math.random() - 0.2 }
    });
  }, 250);
}
```

**File: `src/animations/explosion.ts`**

```typescript
import { motion } from 'framer-motion';

export function ExplosionAnimation({ children }: { children: React.ReactNode }) {
  return (
    <motion.div
      initial={{ scale: 1, opacity: 1 }}
      animate={{
        scale: [1, 1.5, 0],
        opacity: [1, 0.8, 0],
        rotate: [0, 180, 360],
      }}
      transition={{
        duration: 1.5,
        ease: 'easeOut',
      }}
    >
      {children}
    </motion.div>
  );
}
```

**Continue with all UI/UX implementations...**

---

## Phase 14: Testing & QA

### Step 14.1: Set Up Testing Framework

**Backend testing:**
```bash
cd packages/backend
pnpm add -D jest @types/jest ts-jest supertest @types/supertest
```

**File: `jest.config.js`**
```javascript
module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  roots: ['<rootDir>/src'],
  testMatch: ['**/__tests__/**/*.ts', '**/?(*.)+(spec|test).ts'],
  collectCoverageFrom: [
    'src/**/*.ts',
    '!src/**/*.d.ts',
    '!src/**/*.test.ts',
  ],
};
```

**Frontend testing:**
```bash
cd packages/frontend
pnpm add -D jest @testing-library/react @testing-library/jest-dom jest-environment-jsdom
```

**Continue with complete testing setup...**

---

## Phase 15: Deployment

### Step 15.1: Production Configuration

**Backend .env.production:**
```env
NODE_ENV=production
PORT=3000
DATABASE_URL=postgresql://...
REDIS_URL=redis://...
JWT_SECRET=...
JWT_REFRESH_SECRET=...
FRONTEND_URL=https://app.rpsfull.com
```

**Frontend .env.production:**
```env
NEXT_PUBLIC_API_URL=https://api.rpsfull.com/api/v1
NEXT_PUBLIC_WS_URL=wss://api.rpsfull.com
```

**Continue with deployment configuration...**

---

## Implementation Checklist

### Phase 0: Foundation ✅
- [ ] Monorepo setup
- [ ] Docker Compose
- [ ] Development tools
- [ ] CI/CD pipeline

### Phase 1: Contracts ✅
- [ ] All entities
- [ ] All DTOs
- [ ] All interfaces
- [ ] All validators
- [ ] Build and publish

### Phase 2: Database ✅
- [ ] Prisma schema
- [ ] Migrations
- [ ] Seed data
- [ ] Views and triggers

### Phase 3: Mock API ✅
- [ ] All CRUD endpoints
- [ ] WebSocket simulation
- [ ] Seed data generator
- [ ] Documentation

### Phase 4: Authentication ✅
- [ ] Email registration
- [ ] Magic links
- [ ] JWT tokens
- [ ] OAuth (optional)

### Phase 5: Backend Foundation ✅
- [ ] Express setup
- [ ] Middleware
- [ ] Error handling
- [ ] Repository pattern

### Phase 6: Match System ✅
- [ ] Game logic
- [ ] Match service
- [ ] Match controllers
- [ ] Round management

### Phase 7: WebSocket ✅
- [ ] Socket.io setup
- [ ] Match handlers
- [ ] Tournament handlers
- [ ] Reconnection logic

### Phase 8: Tournament ✅
- [ ] Bracket generation
- [ ] Tournament service
- [ ] Invitation system
- [ ] Progression logic

### Phase 9: Statistics ✅
- [ ] Statistics service
- [ ] Historical tracking
- [ ] Analytics queries
- [ ] Leaderboards

### Phase 10: Game Editor ✅
- [ ] Validation service
- [ ] CRUD operations
- [ ] Publishing workflow
- [ ] Game library

### Phase 11: Frontend Foundation ✅
- [ ] Next.js setup
- [ ] State management
- [ ] API client
- [ ] WebSocket client

### Phase 12: Frontend Features ✅
- [ ] Match components
- [ ] Tournament components
- [ ] Statistics components
- [ ] Game editor UI

### Phase 13: UI/UX ✅
- [ ] Animations
- [ ] Dark mode
- [ ] Responsive design
- [ ] Accessibility

### Phase 14: Testing ✅
- [ ] Unit tests
- [ ] Integration tests
- [ ] E2E tests
- [ ] Load tests

### Phase 15: Deployment ✅
- [ ] Production config
- [ ] Database migration
- [ ] Monitoring
- [ ] Launch

---

## Quick Start Guide

**For New Developers:**

1. **Clone repository**
   ```bash
   git clone <repo-url>
   cd rpsfull-platform
   ```

2. **Install dependencies**
   ```bash
   pnpm install
   ```

3. **Start Docker services**
   ```bash
   docker-compose up -d
   ```

4. **Set up database**
   ```bash
   cd packages/backend
   pnpm db:migrate
   pnpm db:seed
   ```

5. **Start mock API**
   ```bash
   pnpm mock-api:dev
   ```

6. **Start frontend**
   ```bash
   cd packages/frontend
   pnpm dev
   ```

7. **Start backend** (when ready)
   ```bash
   cd packages/backend
   pnpm dev
   ```

---

## Troubleshooting

### Common Issues

**Issue: Contracts package not found**
```bash
# Solution: Build contracts first
cd packages/contracts
pnpm build
```

**Issue: Database connection failed**
```bash
# Solution: Check Docker is running
docker-compose ps
# Restart if needed
docker-compose restart postgres
```

**Issue: Port already in use**
```bash
# Solution: Change port in .env or kill process
lsof -ti:3000 | xargs kill -9
```

---

**Document Status:** Complete implementation guide with step-by-step instructions for all 15 phases.

**Next Steps:** Begin implementation starting with Phase 0.

---

END OF DOCUMENT

