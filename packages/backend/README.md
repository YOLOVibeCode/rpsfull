# Backend API Server

Backend API server for RPSFull Tournament Platform built with Express.js, TypeScript, Prisma, and Socket.io.

## 🏗️ Architecture

The backend follows a clean architecture pattern with clear separation of concerns:

```
┌─────────────────────────────────────┐
│         API Routes Layer            │
│  (Express routes + middleware)      │
└──────────────┬──────────────────────┘
               │
┌──────────────▼──────────────────────┐
│         Service Layer               │
│  (Business logic - ISP compliant)  │
└──────────────┬──────────────────────┘
               │
┌──────────────▼──────────────────────┐
│      Repository Layer               │
│  (Data access - Prisma)            │
└──────────────┬──────────────────────┘
               │
┌──────────────▼──────────────────────┐
│         Database                    │
│      (PostgreSQL)                   │
└─────────────────────────────────────┘
```

## 🚀 Quick Start

### Prerequisites

- Node.js 20+
- PostgreSQL 15+
- Redis 7+ (optional, for caching)
- Docker & Docker Compose (recommended)

### Installation

1. **Install dependencies:**
   ```bash
   pnpm install
   ```

2. **Set up environment variables:**
   ```bash
   cp .env.example .env
   # Edit .env with your configuration
   ```

3. **Start Docker services:**
   ```bash
   docker-compose up -d
   ```

4. **Run database migrations:**
   ```bash
   pnpm db:migrate
   ```

5. **Generate Prisma client:**
   ```bash
   pnpm db:generate
   ```

6. **Seed database (optional):**
   ```bash
   pnpm db:seed
   ```

7. **Start development server:**
   ```bash
   pnpm dev
   ```

The API will be available at `http://localhost:4444`

## 📁 Project Structure

```
packages/backend/
├── prisma/
│   ├── schema.prisma          # Database schema
│   └── seed.ts                 # Database seed script
├── src/
│   ├── config/                 # Configuration files
│   │   ├── database.ts         # Prisma client
│   │   ├── services.ts         # Service initialization
│   │   └── socket.ts           # Socket.io setup
│   ├── middleware/            # Express middleware
│   │   ├── auth.middleware.ts  # JWT authentication
│   │   ├── errorHandler.middleware.ts
│   │   └── validation.middleware.ts
│   ├── repositories/           # Data access layer
│   │   ├── UserRepository.ts
│   │   ├── PlayerRepository.ts
│   │   ├── MatchRepository.ts
│   │   └── ...
│   ├── services/               # Business logic layer
│   │   ├── AuthService.ts
│   │   ├── MatchService.ts
│   │   ├── MatchGameplayService.ts
│   │   └── ...
│   ├── routes/                 # API routes
│   │   ├── auth.routes.ts
│   │   ├── match.routes.ts
│   │   ├── tournament.routes.ts
│   │   └── ...
│   ├── socket/                 # Socket.io handlers
│   │   ├── match.handlers.ts
│   │   ├── tournament.handlers.ts
│   │   └── index.ts
│   ├── app.ts                  # Express app setup
│   └── server.ts               # Server entry point
└── package.json
```

## 🔌 API Endpoints

### Authentication
- `POST /api/v1/auth/register` - Register with email/password
- `POST /api/v1/auth/register/email` - Register with email only
- `GET /api/v1/auth/verify/email` - Verify email token
- `POST /api/v1/auth/login` - Login
- `POST /api/v1/auth/refresh` - Refresh token
- `POST /api/v1/auth/logout` - Logout

### Users
- `GET /api/v1/users/me` - Get current user

### Players
- `GET /api/v1/players` - List players
- `GET /api/v1/players/:id` - Get player by ID
- `GET /api/v1/players/leaderboard` - Get leaderboard

### Matches
- `POST /api/v1/matches` - Create match
- `GET /api/v1/matches/:id` - Get match by ID
- `GET /api/v1/matches/my` - Get user's matches
- `PATCH /api/v1/matches/:id/start` - Start match
- `POST /api/v1/matches/:id/rounds` - Submit move
- `POST /api/v1/matches/:id/record-round` - Record round
- `DELETE /api/v1/matches/:id` - Cancel match

### Tournaments
- `POST /api/v1/tournaments` - Create tournament
- `GET /api/v1/tournaments` - List tournaments
- `GET /api/v1/tournaments/:id` - Get tournament by ID
- `POST /api/v1/tournaments/:id/register` - Register for tournament
- `PATCH /api/v1/tournaments/:id/start` - Start tournament
- `GET /api/v1/tournaments/:id/bracket` - Get tournament bracket

### Game Types
- `GET /api/v1/game-types` - List game types
- `GET /api/v1/game-types/:id` - Get game type by ID

### Statistics
- `GET /api/v1/stats/users/me/stats` - Get current user's stats
- `GET /api/v1/stats/head-to-head` - Get head-to-head stats
- `GET /api/v1/stats/global` - Get global statistics

## 🔌 WebSocket Events

### Match Events
- `match:join` - Join match room
- `match:leave` - Leave match room
- `match:move` - Submit move
- `match:state:request` - Request match state
- `match:created` - Match created event
- `match:updated` - Match updated event
- `match:started` - Match started event
- `match:completed` - Match completed event
- `move:submitted` - Move submitted event

### Tournament Events
- `tournament:join` - Join tournament room
- `tournament:leave` - Leave tournament room
- `tournament:register` - Register for tournament
- `tournament:bracket:request` - Request tournament bracket
- `tournament:created` - Tournament created event
- `tournament:updated` - Tournament updated event
- `tournament:started` - Tournament started event
- `bracket:updated` - Bracket updated event

## 🧪 Testing

Run tests:
```bash
pnpm test
```

Run tests with coverage:
```bash
pnpm test:coverage
```

Watch mode:
```bash
pnpm test:watch
```

## 🏗️ Development Principles

### Test-Driven Development (TDD)
- Write tests BEFORE implementation
- Maintain high test coverage (100% target)
- Follow Red-Green-Refactor cycle

### Interface Segregation Principle (ISP)
- Small, focused interfaces
- One interface per responsibility
- Services implement only what they need

### Repository Pattern
- All database access through repositories
- No direct Prisma calls from services
- Type-safe data access

## 📦 Scripts

- `pnpm dev` - Start development server with hot reload
- `pnpm build` - Build for production
- `pnpm start` - Start production server
- `pnpm test` - Run tests
- `pnpm lint` - Lint code
- `pnpm db:migrate` - Run database migrations
- `pnpm db:generate` - Generate Prisma client
- `pnpm db:seed` - Seed database
- `pnpm db:studio` - Open Prisma Studio

## 🔐 Environment Variables

See `.env.example` for all required environment variables.

Key variables:
- `DATABASE_URL` - PostgreSQL connection string
- `JWT_SECRET` - Secret for JWT tokens
- `JWT_REFRESH_SECRET` - Secret for refresh tokens
- `REDIS_URL` - Redis connection string (optional)
- `CORS_ORIGIN` - Allowed CORS origin
- `PORT` - Server port (default: 4444)

## 📚 Documentation

- [API Documentation](../docs/api/)
- [Architecture Documentation](../docs/specs/)
- [Implementation Guide](../docs/implementation/)

## 🤝 Contributing

Follow the TDD and ISP principles outlined in the implementation guide.

