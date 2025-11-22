# Mock API Specification
## RPSFull Tournament Platform - Full CRUD Mock API

**Document Version:** 1.1  
**Last Updated:** November 22, 2025  
**Status:** Planning  
**Repository:** https://github.com/YOLOVibeCode/rpsfull.git  
**Purpose:** Complete mock API for frontend development before backend is ready

---

## 🎯 Mock API First Development Strategy

**CRITICAL:** Frontend development uses Mock API exclusively.

**Development Flow:**
1. **Mock API** → Complete CRUD implementation first
2. **Frontend** → Develop against Mock API
3. **Backend** → Implement real API matching Mock API contracts
4. **Integration** → Replace Mock API with real backend

**Why Mock API First:**
- ✅ Frontend can be developed independently
- ✅ No backend dependencies during frontend development
- ✅ Faster iteration cycles
- ✅ Realistic data for testing
- ✅ Complete API contract definition
- ✅ Frontend team can work in parallel with backend team

---

## 1. Overview

### 1.1 Purpose

The Mock API provides a **fully functional API server** with complete CRUD operations, allowing frontend development to proceed independently while the backend is being built. **This is the PRIMARY API during frontend development.**

### 1.2 Key Features

✅ **Complete CRUD Operations** - Create, Read, Update, Delete for all resources  
✅ **Realistic Data** - Generated seed data that matches production structure  
✅ **WebSocket Simulation** - Mock real-time events  
✅ **Authentication Flow** - Full auth endpoints with mock tokens  
✅ **Validation** - Request/response validation matching real API  
✅ **Pagination** - Proper pagination support  
✅ **Error Handling** - Realistic error responses  
✅ **Stateful** - Maintains state across requests (in-memory database)  

### 1.3 Technology Choice

**Recommended: JSON Server + Custom Middleware**

**Why JSON Server:**
- ✅ Quick setup
- ✅ Automatic CRUD routes
- ✅ File-based database (easy to reset)
- ✅ Custom routes via Express middleware
- ✅ Middleware support for auth, validation

**Alternative: MSW (Mock Service Worker)**
- Better for browser-based mocking
- Can intercept fetch requests
- Good for testing

**Alternative: Custom Express Server**
- Full control
- More realistic
- Can match exact backend structure

**We'll use: Custom Express Server** (most realistic, matches backend structure)

---

## 2. Architecture

### 2.1 Mock API Structure

```
packages/mock-api/
├── src/
│   ├── data/
│   │   ├── seed.ts              # Seed data generator
│   │   ├── users.json           # Persistent data (optional)
│   │   ├── players.json
│   │   ├── matches.json
│   │   ├── tournaments.json
│   │   └── ...
│   ├── routes/
│   │   ├── auth.routes.ts
│   │   ├── users.routes.ts
│   │   ├── players.routes.ts
│   │   ├── matches.routes.ts
│   │   ├── tournaments.routes.ts
│   │   ├── gameTypes.routes.ts
│   │   └── stats.routes.ts
│   ├── middleware/
│   │   ├── auth.middleware.ts
│   │   ├── validation.middleware.ts
│   │   ├── errorHandler.middleware.ts
│   │   └── pagination.middleware.ts
│   ├── services/
│   │   ├── data.service.ts      # In-memory data management
│   │   ├── auth.service.ts      # Mock auth logic
│   │   └── gameLogic.service.ts # Game logic (shared)
│   ├── utils/
│   │   ├── seedGenerator.ts
│   │   ├── validators.ts
│   │   └── helpers.ts
│   ├── websocket/
│   │   └── mockSocket.ts        # WebSocket simulation
│   ├── app.ts
│   └── server.ts
├── package.json
├── tsconfig.json
└── README.md
```

### 2.2 Data Storage

**In-Memory Database:**
```typescript
interface MockDatabase {
  users: IUser[];
  players: IPlayer[];
  matches: IMatch[];
  rounds: IRound[];
  tournaments: ITournament[];
  tournamentEntries: ITournamentEntry[];
  gameTypes: IGameType[];
  playerStatistics: IPlayerStatistics[];
  achievements: IAchievement[];
  invitations: ITournamentInvitation[];
  sessions: ISession[];
}
```

**Persistence Options:**
1. **In-memory only** (resets on restart) - Good for development
2. **JSON files** (persists data) - Good for testing
3. **LowDB** (file-based database) - Best of both worlds

---

## 3. Complete API Endpoints

### 3.1 Authentication Endpoints

#### POST /api/v1/auth/register/email
```typescript
Request: {
  email: string;
  invitationToken?: string;
}

Response: 200 OK
{
  "success": true,
  "message": "Magic link sent to your email",
  "data": {
    "email": "user@example.com",
    "expiresIn": 900
  }
}

// Mock: Generates token, stores in memory
// Returns mock token immediately (for dev)
```

#### GET /api/v1/auth/verify/email?token={token}
```typescript
Response: 200 OK
{
  "success": true,
  "data": {
    "user": { /* IUser */ },
    "accessToken": "mock_jwt_token",
    "refreshToken": "mock_refresh_token"
  }
}

// Mock: Creates user if doesn't exist
// Returns mock JWT tokens
```

#### POST /api/v1/auth/login
```typescript
Request: {
  email: string;
  password: string;
}

Response: 200 OK
{
  "success": true,
  "data": {
    "user": { /* IUser */ },
    "accessToken": "mock_jwt_token",
    "refreshToken": "mock_refresh_token"
  }
}
```

#### POST /api/v1/auth/refresh
```typescript
Request: {
  refreshToken: string;
}

Response: 200 OK
{
  "success": true,
  "data": {
    "accessToken": "new_mock_jwt_token",
    "refreshToken": "new_mock_refresh_token"
  }
}
```

#### POST /api/v1/auth/logout
```typescript
Headers: Authorization: Bearer {token}

Response: 200 OK
{
  "success": true,
  "message": "Logged out successfully"
}
```

### 3.2 User Endpoints

#### GET /api/v1/users/me
```typescript
Headers: Authorization: Bearer {token}

Response: 200 OK
{
  "success": true,
  "data": {
    "id": "uuid",
    "email": "user@example.com",
    "role": "player",
    "player": { /* IPlayer */ }
  }
}
```

#### PATCH /api/v1/users/me
```typescript
Headers: Authorization: Bearer {token}
Request: {
  displayName?: string;
  bio?: string;
}

Response: 200 OK
{
  "success": true,
  "data": { /* Updated IUser */ }
}
```

### 3.3 Player Endpoints

#### GET /api/v1/players
```typescript
Query: ?search=john&limit=20&page=1

Response: 200 OK
{
  "success": true,
  "data": [ /* IPlayer[] */ ],
  "meta": {
    "pagination": {
      "page": 1,
      "limit": 20,
      "total": 150,
      "totalPages": 8
    }
  }
}
```

#### GET /api/v1/players/{id}
```typescript
Response: 200 OK
{
  "success": true,
  "data": { /* IPlayer */ }
}
```

#### GET /api/v1/players/leaderboard
```typescript
Query: ?gameTypeId={uuid}&limit=100

Response: 200 OK
{
  "success": true,
  "data": [ /* Leaderboard entries */ ]
}
```

### 3.4 Match Endpoints

#### POST /api/v1/matches
```typescript
Headers: Authorization: Bearer {token}
Request: {
  player2Id: string;
  gameTypeId: string;
  bestOfN: number;
  playMode: "digital" | "live_recording";
}

Response: 201 Created
{
  "success": true,
  "data": { /* IMatch */ }
}

// Mock: Creates match, assigns player1Id from token
```

#### GET /api/v1/matches/{id}
```typescript
Response: 200 OK
{
  "success": true,
  "data": { /* IMatchWithDetails */ }
}
```

#### GET /api/v1/matches/my
```typescript
Headers: Authorization: Bearer {token}
Query: ?status=completed&limit=20&page=1

Response: 200 OK
{
  "success": true,
  "data": [ /* IMatch[] */ ],
  "meta": { "pagination": { /* ... */ } }
}
```

#### PATCH /api/v1/matches/{id}/start
```typescript
Headers: Authorization: Bearer {token}

Response: 200 OK
{
  "success": true,
  "data": {
    "id": "match_uuid",
    "status": "in_progress",
    "startedAt": "2025-11-22T10:30:00Z"
  }
}
```

#### POST /api/v1/matches/{id}/rounds
```typescript
Headers: Authorization: Bearer {token}
Request: {
  roundNumber: number;
  move: string;
  timeTakenMs?: number;
}

Response: 201 Created
{
  "success": true,
  "data": {
    "roundNumber": 1,
    "yourMove": "rock",
    "opponentMove": null,  // or actual move if both submitted
    "result": null,
    "waiting": true,
    "matchComplete": false
  }
}

// Mock: Simulates opponent move after delay (or immediately)
```

#### POST /api/v1/matches/{id}/record-round
```typescript
Headers: Authorization: Bearer {token}
Request: {
  roundNumber: number;
  player1Move: string;
  player2Move: string;
  winnerId?: string;
}

Response: 201 Created
{
  "success": true,
  "data": {
    "roundNumber": 1,
    "result": "player1_win",
    "currentScore": { "player1": 1, "player2": 0 },
    "matchComplete": false
  }
}
```

#### DELETE /api/v1/matches/{id}
```typescript
Headers: Authorization: Bearer {token}

Response: 200 OK
{
  "success": true,
  "message": "Match cancelled successfully"
}
```

### 3.5 Tournament Endpoints

#### POST /api/v1/tournaments
```typescript
Headers: Authorization: Bearer {token}
Request: {
  name: string;
  description?: string;
  gameTypeId: string;
  tournamentType: "single_elimination" | "double_elimination" | "round_robin";
  bestOfN: number;
  maxParticipants?: number;
  startDate?: string;
  registrationDeadline?: string;
}

Response: 201 Created
{
  "success": true,
  "data": { /* ITournament */ }
}
```

#### GET /api/v1/tournaments
```typescript
Query: ?status=registration&limit=20&page=1

Response: 200 OK
{
  "success": true,
  "data": [ /* ITournament[] */ ],
  "meta": { "pagination": { /* ... */ } }
}
```

#### GET /api/v1/tournaments/{id}
```typescript
Response: 200 OK
{
  "success": true,
  "data": { /* ITournamentWithDetails */ }
}
```

#### POST /api/v1/tournaments/{id}/register
```typescript
Headers: Authorization: Bearer {token}

Response: 201 Created
{
  "success": true,
  "data": {
    "tournamentId": "uuid",
    "playerId": "uuid",
    "status": "registered"
  }
}
```

#### POST /api/v1/tournaments/{id}/players
```typescript
Headers: Authorization: Bearer {token}
Request: {
  playerId: string;
  seed?: number;
}

Response: 201 Created
{
  "success": true,
  "data": { /* ITournamentEntry */ }
}
```

#### POST /api/v1/tournaments/{id}/invitations
```typescript
Headers: Authorization: Bearer {token}
Request: {
  players: Array<{ name: string; email: string }>;
  sendEmail: boolean;
  customMessage?: string;
}

Response: 201 Created
{
  "success": true,
  "data": {
    "invitationsSent": 3,
    "invitations": [ /* ITournamentInvitation[] */ ]
  }
}

// Mock: Creates invitations, doesn't actually send email
```

#### GET /api/v1/tournaments/{id}/bracket
```typescript
Response: 200 OK
{
  "success": true,
  "data": {
    "tournamentId": "uuid",
    "currentRound": 2,
    "rounds": [ /* IBracketRound[] */ ]
  }
}
```

#### GET /api/v1/tournaments/{id}/standings
```typescript
Response: 200 OK
{
  "success": true,
  "data": {
    "tournamentId": "uuid",
    "standings": [ /* Standings entries */ ]
  }
}
```

#### PATCH /api/v1/tournaments/{id}/start
```typescript
Headers: Authorization: Bearer {token}

Response: 200 OK
{
  "success": true,
  "data": {
    "id": "uuid",
    "status": "in_progress",
    "bracketGenerated": true
  }
}
```

### 3.6 Game Type Endpoints

#### GET /api/v1/game-types
```typescript
Query: ?active=true

Response: 200 OK
{
  "success": true,
  "data": [ /* IGameType[] */ ]
}
```

#### GET /api/v1/game-types/{id}
```typescript
Response: 200 OK
{
  "success": true,
  "data": { /* IGameType */ }
}
```

#### POST /api/v1/game-types
```typescript
Headers: Authorization: Bearer {token}
Request: {
  name: string;
  description?: string;
  symbols: IGameSymbol[];
  winMatrix: IWinMatrix;
  tags?: string[];
}

Response: 201 Created
{
  "success": true,
  "data": { /* IGameType */ }
}
```

#### POST /api/v1/game-types/{id}/validate
```typescript
Response: 200 OK
{
  "success": true,
  "data": {
    "isValid": true,
    "errors": [],
    "warnings": [],
    "balanceScore": 95
  }
}
```

### 3.7 Statistics Endpoints

#### GET /api/v1/users/me/stats
```typescript
Headers: Authorization: Bearer {token}
Query: ?gameTypeId={uuid}

Response: 200 OK
{
  "success": true,
  "data": { /* IPlayerStatistics */ }
}
```

#### GET /api/v1/stats/head-to-head
```typescript
Query: ?player1Id={uuid}&player2Id={uuid}

Response: 200 OK
{
  "success": true,
  "data": { /* IHeadToHeadStatsDto */ }
}
```

#### GET /api/v1/stats/global
```typescript
Query: ?gameTypeId={uuid}

Response: 200 OK
{
  "success": true,
  "data": { /* IGlobalStatsDto */ }
}
```

### 3.8 Invitation Endpoints

#### GET /api/v1/invitations/{token}
```typescript
Response: 200 OK
{
  "success": true,
  "data": {
    "tournament": { /* ITournament */ },
    "invitee": { name: string; email: string },
    "status": "pending",
    "expiresAt": "2025-11-25T18:00:00Z"
  }
}
```

#### POST /api/v1/invitations/{token}/accept
```typescript
Request: {
  displayName?: string;
  createAccount: boolean;
}

Response: 200 OK
{
  "success": true,
  "data": {
    "player": { /* IPlayer */ },
    "tournament": { /* ITournament */ },
    "accessToken": "jwt_token",
    "refreshToken": "refresh_token"
  }
}
```

---

## 4. Implementation Details

### 4.1 Mock API Server Setup

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
    "lowdb": "^6.1.0",
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

**server.ts:**
```typescript
import express from 'express';
import cors from 'cors';
import { setupRoutes } from './routes';
import { setupMiddleware } from './middleware';
import { initializeDatabase } from './data/seed';

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());

// Initialize database
const db = initializeDatabase();

// Setup routes
setupRoutes(app, db);

// Setup error handling
setupMiddleware(app);

app.listen(PORT, () => {
  console.log(`🚀 Mock API running on http://localhost:${PORT}`);
  console.log(`📚 API docs: http://localhost:${PORT}/api-docs`);
});
```

### 4.2 Data Service (In-Memory Database)

**data.service.ts:**
```typescript
import { v4 as uuidv4 } from 'uuid';
import { IUser, IPlayer, IMatch, ITournament } from '@rpsfull-platform/contracts';

export class MockDataService {
  private data: {
    users: Map<string, IUser>;
    players: Map<string, IPlayer>;
    matches: Map<string, IMatch>;
    tournaments: Map<string, ITournament>;
    // ... other collections
  };

  constructor(seedData: any) {
    this.data = this.initializeFromSeed(seedData);
  }

  // Users
  createUser(data: Partial<IUser>): IUser {
    const user: IUser = {
      id: uuidv4(),
      email: data.email!,
      role: data.role || 'player',
      isEmailVerified: true,
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date(),
      ...data,
    };
    this.data.users.set(user.id, user);
    return user;
  }

  getUserById(id: string): IUser | undefined {
    return this.data.users.get(id);
  }

  getUserByEmail(email: string): IUser | undefined {
    return Array.from(this.data.users.values()).find(u => u.email === email);
  }

  updateUser(id: string, updates: Partial<IUser>): IUser | undefined {
    const user = this.data.users.get(id);
    if (!user) return undefined;
    
    const updated = { ...user, ...updates, updatedAt: new Date() };
    this.data.users.set(id, updated);
    return updated;
  }

  // Players
  createPlayer(data: Partial<IPlayer>): IPlayer {
    const player: IPlayer = {
      id: uuidv4(),
      name: data.name!,
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
      .filter(p => 
        p.name.toLowerCase().includes(searchLower) ||
        p.displayName?.toLowerCase().includes(searchLower)
      )
      .slice(0, limit);
  }

  // Matches
  createMatch(data: Partial<IMatch>): IMatch {
    const match: IMatch = {
      id: uuidv4(),
      player1Id: data.player1Id!,
      player2Id: data.player2Id!,
      gameTypeId: data.gameTypeId!,
      matchFormat: data.matchFormat || 'best_of_3',
      bestOfN: data.bestOfN || 3,
      tiesCount: false,
      playMode: data.playMode || 'digital',
      status: 'pending',
      player1Score: 0,
      player2Score: 0,
      totalRounds: 0,
      createdAt: new Date(),
      updatedAt: new Date(),
      ...data,
    };
    this.data.matches.set(match.id, match);
    return match;
  }

  getMatchById(id: string): IMatch | undefined {
    return this.data.matches.get(id);
  }

  getMatchesByPlayer(playerId: string, filters?: any): IMatch[] {
    return Array.from(this.data.matches.values())
      .filter(m => 
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

  // Tournaments
  createTournament(data: Partial<ITournament>): ITournament {
    const tournament: ITournament = {
      id: uuidv4(),
      name: data.name!,
      gameTypeId: data.gameTypeId!,
      organizerId: data.organizerId!,
      tournamentType: data.tournamentType || 'single_elimination',
      matchFormat: data.matchFormat || 'best_of_3',
      bestOfN: data.bestOfN || 3,
      status: 'draft',
      currentRound: 0,
      participantCount: 0,
      createdAt: new Date(),
      updatedAt: new Date(),
      ...data,
    };
    this.data.tournaments.set(tournament.id, tournament);
    return tournament;
  }

  // ... similar methods for all entities
}
```

### 4.3 Seed Data Generator

**seed.ts:**
```typescript
import { MockDataService } from '../services/data.service';
import { IUser, IPlayer, IGameType, IMatch } from '@rpsfull-platform/contracts';

export function generateSeedData() {
  // Generate users
  const users: IUser[] = Array.from({ length: 50 }, (_, i) => ({
    id: `user-${i}`,
    email: `user${i}@example.com`,
    role: i === 0 ? 'admin' : 'player',
    isEmailVerified: true,
    isActive: true,
    createdAt: new Date(Date.now() - i * 86400000), // Staggered dates
    updatedAt: new Date(),
  }));

  // Generate players
  const players: IPlayer[] = users.map((user, i) => ({
    id: `player-${i}`,
    name: `Player ${i + 1}`,
    displayName: `Player${i + 1}`,
    userId: user.id,
    email: user.email,
    level: Math.floor(Math.random() * 50) + 1,
    experience: Math.floor(Math.random() * 10000),
    ranking: i + 1,
    isActive: true,
    createdAt: user.createdAt,
    updatedAt: new Date(),
  }));

  // Generate game types
  const gameTypes: IGameType[] = [
    {
      id: 'classic-rps',
      name: 'Classic RPS',
      description: 'Traditional Rock, Paper, Scissors',
      symbolCount: 3,
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
      isActive: true,
      isDefault: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    // Add more game types...
  ];

  // Generate matches
  const matches: IMatch[] = [];
  for (let i = 0; i < 200; i++) {
    const player1Index = Math.floor(Math.random() * players.length);
    const player2Index = Math.floor(Math.random() * players.length);
    if (player1Index === player2Index) continue;

    matches.push({
      id: `match-${i}`,
      player1Id: players[player1Index].id,
      player2Id: players[player2Index].id,
      gameTypeId: gameTypes[0].id,
      matchFormat: 'best_of_3',
      bestOfN: 3,
      tiesCount: false,
      playMode: 'digital',
      status: Math.random() > 0.3 ? 'completed' : 'pending',
      winnerId: Math.random() > 0.5 ? players[player1Index].id : players[player2Index].id,
      player1Score: Math.floor(Math.random() * 3),
      player2Score: Math.floor(Math.random() * 3),
      totalRounds: Math.floor(Math.random() * 5) + 1,
      durationSeconds: Math.floor(Math.random() * 300) + 30,
      startedAt: new Date(Date.now() - i * 3600000),
      completedAt: new Date(Date.now() - i * 3600000 + 60000),
      createdAt: new Date(Date.now() - i * 3600000),
      updatedAt: new Date(),
    });
  }

  return {
    users,
    players,
    gameTypes,
    matches,
    // ... other entities
  };
}

export function initializeDatabase() {
  const seedData = generateSeedData();
  return new MockDataService(seedData);
}
```

### 4.4 Authentication Middleware

**auth.middleware.ts:**
```typescript
import { Request, Response, NextFunction } from 'express';

export interface AuthenticatedRequest extends Request {
  user?: {
    id: string;
    email: string;
    role: string;
  };
}

export function mockAuthMiddleware(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) {
  const authHeader = req.headers.authorization;
  
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({
      success: false,
      error: {
        code: 'AUTH_001',
        message: 'Missing or invalid authorization header',
      },
    });
  }

  const token = authHeader.substring(7);
  
  // Mock token validation
  // In real implementation, decode JWT and verify
  // For mock, just extract user ID from token format
  
  // Simple mock: token format "user-{id}"
  if (token.startsWith('user-')) {
    const userId = token.replace('user-', '');
    req.user = {
      id: userId,
      email: `user${userId}@example.com`,
      role: 'player',
    };
    return next();
  }

  // Default user for development
  req.user = {
    id: 'user-0',
    email: 'user0@example.com',
    role: 'admin',
  };
  
  next();
}
```

### 4.5 Route Implementation Example

**matches.routes.ts:**
```typescript
import { Router } from 'express';
import { mockAuthMiddleware, AuthenticatedRequest } from '../middleware/auth.middleware';
import { MockDataService } from '../services/data.service';

export function setupMatchRoutes(router: Router, db: MockDataService) {
  // Create match
  router.post('/matches', mockAuthMiddleware, (req: AuthenticatedRequest, res) => {
    const { player2Id, gameTypeId, bestOfN, playMode } = req.body;
    
    if (!player2Id || !gameTypeId) {
      return res.status(422).json({
        success: false,
        error: {
          code: 'VAL_003',
          message: 'Required fields missing',
        },
      });
    }

    const match = db.createMatch({
      player1Id: req.user!.id,
      player2Id,
      gameTypeId,
      bestOfN: bestOfN || 3,
      playMode: playMode || 'digital',
    });

    res.status(201).json({
      success: true,
      data: match,
      meta: {
        timestamp: new Date().toISOString(),
      },
    });
  });

  // Get match
  router.get('/matches/:id', (req, res) => {
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

    // Get related data
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
  router.get('/matches/my', mockAuthMiddleware, (req: AuthenticatedRequest, res) => {
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
  router.post('/matches/:id/rounds', mockAuthMiddleware, async (req: AuthenticatedRequest, res) => {
    const { roundNumber, move, timeTakenMs } = req.body;
    const match = db.getMatchById(req.params.id);
    
    if (!match) {
      return res.status(404).json({
        success: false,
        error: { code: 'MATCH_001', message: 'Match not found' },
      });
    }

    // Mock: Simulate opponent move after 1 second
    setTimeout(() => {
      const opponentMove = ['rock', 'paper', 'scissors'][Math.floor(Math.random() * 3)];
      // Calculate result and update match
      // ... game logic
    }, 1000);

    res.status(201).json({
      success: true,
      data: {
        roundNumber,
        yourMove: move,
        opponentMove: null,
        waiting: true,
      },
    });
  });

  // ... other routes
}
```

---

## 5. WebSocket Simulation

### 5.1 Mock WebSocket Server

**websocket/mockSocket.ts:**
```typescript
import { Server as HTTPServer } from 'http';
import { Server as SocketIOServer } from 'socket.io';

export function setupMockWebSocket(httpServer: HTTPServer) {
  const io = new SocketIOServer(httpServer, {
    cors: {
      origin: '*',
      methods: ['GET', 'POST'],
    },
  });

  io.on('connection', (socket) => {
    console.log('Client connected:', socket.id);

    // Match events
    socket.on('match:join', (data: { matchId: string }) => {
      socket.join(`match:${data.matchId}`);
      
      // Simulate opponent joining
      setTimeout(() => {
        socket.emit('match:opponent-joined', {
          playerId: 'opponent-123',
          playerName: 'Opponent Player',
        });
      }, 1000);
    });

    socket.on('match:ready', (data: { matchId: string }) => {
      // Simulate countdown
      let countdown = 3;
      const interval = setInterval(() => {
        socket.emit('match:countdown', { secondsRemaining: countdown });
        countdown--;
        
        if (countdown < 0) {
          clearInterval(interval);
        }
      }, 1000);
    });

    socket.on('match:move', (data: { matchId: string; move: string }) => {
      // Simulate opponent move
      setTimeout(() => {
        const opponentMove = ['rock', 'paper', 'scissors'][Math.floor(Math.random() * 3)];
        
        socket.emit('match:round-complete', {
          roundNumber: 1,
          player1Move: data.move,
          player2Move: opponentMove,
          result: calculateResult(data.move, opponentMove),
          winnerId: 'player-1',
          currentScore: { player1: 1, player2: 0 },
        });
      }, 1500);
    });

    socket.on('disconnect', () => {
      console.log('Client disconnected:', socket.id);
    });
  });

  return io;
}

function calculateResult(move1: string, move2: string): string {
  // Simple RPS logic
  if (move1 === move2) return 'tie';
  if (
    (move1 === 'rock' && move2 === 'scissors') ||
    (move1 === 'paper' && move2 === 'rock') ||
    (move1 === 'scissors' && move2 === 'paper')
  ) {
    return 'player1_win';
  }
  return 'player2_win';
}
```

---

## 6. Usage Instructions

### 6.1 Starting Mock API

```bash
cd packages/mock-api
pnpm install
pnpm dev
```

**API will be available at:** `http://localhost:3001`

### 6.2 Frontend Configuration

**frontend/.env.local:**
```env
NEXT_PUBLIC_API_URL=http://localhost:3001/api/v1
NEXT_PUBLIC_WS_URL=http://localhost:3001
```

### 6.3 Testing Endpoints

**Using curl:**
```bash
# Register
curl -X POST http://localhost:3001/api/v1/auth/register/email \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com"}'

# Get matches
curl http://localhost:3001/api/v1/matches/my \
  -H "Authorization: Bearer user-0"
```

**Using Postman:**
- Import collection from `mock-api/postman-collection.json`
- All endpoints pre-configured

---

## 7. Data Persistence

### 7.1 Option 1: In-Memory (Default)

**Pros:**
- Fast
- Easy to reset
- No file management

**Cons:**
- Data lost on restart
- Not suitable for testing persistence

### 7.2 Option 2: JSON Files

**Implementation:**
```typescript
import fs from 'fs';
import path from 'path';

const DATA_DIR = path.join(__dirname, '../data');

export function saveToFile(db: MockDataService) {
  const data = {
    users: Array.from(db.data.users.values()),
    players: Array.from(db.data.players.values()),
    // ...
  };
  
  fs.writeFileSync(
    path.join(DATA_DIR, 'database.json'),
    JSON.stringify(data, null, 2)
  );
}

export function loadFromFile(): any {
  const filePath = path.join(DATA_DIR, 'database.json');
  if (fs.existsSync(filePath)) {
    return JSON.parse(fs.readFileSync(filePath, 'utf-8'));
  }
  return generateSeedData();
}
```

### 7.3 Option 3: LowDB

**Best option for persistence:**
```typescript
import { Low } from 'lowdb';
import { JSONFile } from 'lowdb/node';

const adapter = new JSONFile('database.json');
const db = new Low(adapter, {
  users: [],
  players: [],
  matches: [],
  // ...
});

await db.read();
// Use db.data for operations
await db.write();
```

---

## 8. API Documentation

### 8.1 Auto-Generated Docs

**Using Swagger/OpenAPI:**
```typescript
import swaggerUi from 'swagger-ui-express';
import swaggerDocument from './swagger.json';

app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));
```

**Access at:** `http://localhost:3001/api-docs`

### 8.2 Postman Collection

**Export complete collection:**
- All endpoints
- Example requests
- Environment variables
- Test scripts

---

## 9. Testing the Mock API

### 9.1 Manual Testing

**Test all CRUD operations:**
```bash
# Create
POST /api/v1/matches

# Read
GET /api/v1/matches/{id}

# Update
PATCH /api/v1/matches/{id}

# Delete
DELETE /api/v1/matches/{id}
```

### 9.2 Automated Tests

**Write tests for mock API:**
```typescript
import request from 'supertest';
import { app } from '../server';

describe('Match API', () => {
  it('should create a match', async () => {
    const res = await request(app)
      .post('/api/v1/matches')
      .set('Authorization', 'Bearer user-0')
      .send({
        player2Id: 'player-1',
        gameTypeId: 'classic-rps',
        bestOfN: 3,
      });
    
    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.data).toHaveProperty('id');
  });
});
```

---

## 10. Migration to Real API

### 10.1 Gradual Migration

**Phase 1:** Mock API handles all requests  
**Phase 2:** Real API handles some endpoints, mock handles rest  
**Phase 3:** Real API handles all, mock API deprecated  

**Configuration:**
```typescript
// frontend/src/config/api.ts
const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api/v1';
const USE_MOCK_API = process.env.NEXT_PUBLIC_USE_MOCK_API === 'true';

export const apiClient = USE_MOCK_API 
  ? new MockApiClient(API_URL)
  : new RealApiClient(API_URL);
```

---

## 11. Checklist

### Setup
- [ ] Initialize mock-api package
- [ ] Install dependencies
- [ ] Set up Express server
- [ ] Configure CORS
- [ ] Set up routing structure

### Implementation
- [ ] Implement all auth endpoints
- [ ] Implement all user endpoints
- [ ] Implement all player endpoints
- [ ] Implement all match endpoints
- [ ] Implement all tournament endpoints
- [ ] Implement all game type endpoints
- [ ] Implement all statistics endpoints
- [ ] Implement all invitation endpoints

### Features
- [ ] Seed data generator
- [ ] In-memory database
- [ ] Authentication middleware
- [ ] Validation middleware
- [ ] Error handling
- [ ] Pagination
- [ ] WebSocket simulation

### Documentation
- [ ] API documentation (Swagger)
- [ ] Postman collection
- [ ] README with usage instructions
- [ ] Example requests

### Testing
- [ ] Test all CRUD operations
- [ ] Test authentication flow
- [ ] Test error cases
- [ ] Test pagination
- [ ] Test WebSocket events

---

**Document Approval:**
- [ ] Technical Lead
- [ ] Backend Lead
- [ ] Frontend Lead

---

END OF DOCUMENT

