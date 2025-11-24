# Mock API Server

Mock API server for RPSFull Tournament Platform frontend development.

## Purpose

This Mock API provides a fully functional API server with complete CRUD operations, allowing frontend development to proceed independently while the backend is being built.

## Features

- ✅ Complete CRUD operations for all resources
- ✅ Realistic seed data
- ✅ Authentication flow (mock tokens)
- ✅ In-memory database
- ✅ All endpoints from API specification
- ✅ Error handling
- ✅ Request validation

## Quick Start

```bash
# Install dependencies (from root)
pnpm install

# Start Mock API
pnpm mock-api:dev

# Or from package directory
cd packages/mock-api
pnpm dev
```

Mock API will be available at: `http://localhost:3001`

## API Endpoints

### Authentication
- `POST /api/v1/auth/register/email` - Register with email
- `GET /api/v1/auth/verify/email?token={token}` - Verify email
- `POST /api/v1/auth/login` - Login
- `POST /api/v1/auth/refresh` - Refresh token
- `POST /api/v1/auth/logout` - Logout

### Users
- `GET /api/v1/users/me` - Get current user
- `PATCH /api/v1/users/me` - Update current user

### Players
- `GET /api/v1/players` - Get players list
- `GET /api/v1/players/:id` - Get player by ID
- `GET /api/v1/players/leaderboard` - Get leaderboard

### Matches
- `POST /api/v1/matches` - Create match
- `GET /api/v1/matches/:id` - Get match by ID
- `GET /api/v1/matches/my` - Get my matches
- `PATCH /api/v1/matches/:id/start` - Start match
- `POST /api/v1/matches/:id/rounds` - Submit move
- `POST /api/v1/matches/:id/record-round` - Record round (live mode)
- `DELETE /api/v1/matches/:id` - Cancel match

### Tournaments
- `POST /api/v1/tournaments` - Create tournament
- `GET /api/v1/tournaments` - Get tournaments list
- `GET /api/v1/tournaments/:id` - Get tournament by ID
- `POST /api/v1/tournaments/:id/register` - Register for tournament
- `PATCH /api/v1/tournaments/:id/start` - Start tournament
- `GET /api/v1/tournaments/:id/bracket` - Get bracket

### Game Types
- `GET /api/v1/game-types` - Get game types list
- `GET /api/v1/game-types/:id` - Get game type by ID

### Statistics
- `GET /api/v1/users/me/stats` - Get my statistics
- `GET /api/v1/stats/head-to-head` - Get head-to-head stats
- `GET /api/v1/stats/global` - Get global statistics

## Authentication

For protected routes, include the Authorization header:

```
Authorization: Bearer user-0
```

Mock tokens are accepted in the format: `user-{id}`

## Seed Data

The Mock API automatically seeds the database with:
- 20 users (1 admin, 4 organizers, 15 players)
- 20 players
- 2 game types (Classic RPS, RPS-LS)

## Development

```bash
# Watch mode
pnpm dev

# Build
pnpm build

# Start production
pnpm start
```

## Notes

- Data is stored in-memory and resets on server restart
- All IDs are UUIDs
- Mock authentication accepts any token format
- Perfect for frontend development and testing

