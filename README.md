# RPSFull Tournament Platform

A comprehensive Rock Paper Scissors tournament platform with real-time gameplay, statistics tracking, and custom game type creation.

## 🚀 Quick Start

### Prerequisites

Before you begin, ensure you have the following installed:

- **Node.js** 20+ ([Download](https://nodejs.org/))
- **PNPM** 8+ (Install: `npm install -g pnpm`)
- **Docker Desktop** ([Download](https://www.docker.com/products/docker-desktop/))
- **Git** (for cloning the repository)

### Installation & Setup

#### 1. Clone the Repository

```bash
git clone <repository-url>
cd RPSFull
```

#### 2. Install Dependencies

```bash
pnpm install
```

#### 3. Start Docker Services

Start PostgreSQL and Redis using Docker Compose:

```bash
docker-compose up -d
```

This starts:
- **PostgreSQL** on port `5432`
- **Redis** on port `6379`

Verify services are running:
```bash
docker-compose ps
```

#### 4. Build Contracts Package

```bash
pnpm contracts:build
```

#### 5. Setup Database

```bash
cd packages/backend

# Generate Prisma Client
pnpm db:generate

# Run database migrations
pnpm db:migrate

# Seed database with test data
pnpm db:seed
```

#### 6. Start Development Servers

**Terminal 1 - Backend:**
```bash
cd packages/backend
pnpm dev
```

Backend will start on **http://localhost:4444**

**Terminal 2 - Frontend:**
```bash
cd packages/frontend
pnpm dev
```

Frontend will start on **http://localhost:4445**

#### 7. Access the Application

- **Frontend**: http://localhost:4445
- **Backend API**: http://localhost:4444
- **API Health Check**: http://localhost:4444/health
- **API Base URL**: http://localhost:4444/api/v1

## 🎮 Test Accounts

After seeding the database, you can login with these test accounts:

| Email | Password | Role | Level | Player Name |
|-------|----------|------|-------|-------------|
| `alice@example.com` | `TestPassword123!` | player | 5 | Rocky Rocker |
| `bob@example.com` | `TestPassword123!` | player | 4 | Penny Paper |
| `charlie@example.com` | `TestPassword123!` | player | 3 | Sally Scissor |
| `diana@example.com` | `TestPassword123!` | player | 2 | Lizzie Lizard |
| `organizer@example.com` | `TestPassword123!` | organizer | 10 | Spock Spock |

## 📊 Test Data

The seed script creates:

- **5 Users** with player profiles
- **2 Game Types** (Classic RPS, Extended RPS)
- **13 Matches** (10 completed, 3 pending)
- **3 Tournaments**:
  - Spring Championship (open registration)
  - Quick Match Tournament (in progress with bracket)
  - Winter Classic (completed)
- **Player Statistics** for all players
- **Achievements** for top players

## 🏗️ Project Structure

```
RPSFull/
├── packages/
│   ├── contracts/          # Shared TypeScript types & interfaces
│   ├── frontend/           # Next.js 14 application (Port 4445)
│   ├── backend/           # Express.js API server (Port 4444)
│   └── mock-api/          # Mock API for frontend development
├── docs/                   # Documentation
├── docker-compose.yml      # Docker services (PostgreSQL, Redis)
└── package.json           # Root package.json
```

## 🛠️ Available Scripts

### Root Level Commands

```bash
# Development
pnpm dev                    # Start all services in development mode
pnpm build                  # Build all packages
pnpm test                   # Run all tests
pnpm lint                   # Lint all packages
pnpm type-check            # Type check all packages

# Package-specific
pnpm contracts:build        # Build contracts package
pnpm backend:dev           # Start backend only
pnpm frontend:dev          # Start frontend only
pnpm mock-api:dev          # Start mock API only
```

### Backend Commands

```bash
cd packages/backend

pnpm dev                    # Start backend server (port 4444)
pnpm build                  # Build backend
pnpm test                   # Run tests
pnpm db:generate           # Generate Prisma Client
pnpm db:migrate            # Run database migrations
pnpm db:seed               # Seed database with test data
pnpm db:studio             # Open Prisma Studio (database GUI)
```

### Frontend Commands

```bash
cd packages/frontend

pnpm dev                    # Start Next.js dev server (port 4445)
pnpm build                  # Build for production
pnpm start                  # Start production server
pnpm lint                   # Lint code
```

## 🏗️ Architecture

### Technology Stack

- **Frontend**: Next.js 14, TypeScript, Tailwind CSS, Zustand, React Query, Socket.io Client
- **Backend**: Node.js, Express.js, TypeScript, PostgreSQL (Prisma), Redis, Socket.io
- **Infrastructure**: Docker, Docker Compose

### Port Configuration

- **Backend API**: Port `4444`
- **Frontend**: Port `4445`
- **PostgreSQL**: Port `5432`
- **Redis**: Port `6379`

### Key Features

- ✅ Real-time match gameplay with WebSocket
- ✅ Tournament system with bracket generation
- ✅ Player statistics and leaderboards
- ✅ Custom game type creation
- ✅ Mobile-responsive design
- ✅ Authentication and authorization
- ✅ Match history and analytics

## 📚 Documentation

- [QUICK_START.md](./QUICK_START.md) - Quick setup guide
- [SETUP.md](./SETUP.md) - Detailed setup instructions
- [TESTING.md](./TESTING.md) - Testing guide
- [IMPLEMENTATION_STATUS.md](./IMPLEMENTATION_STATUS.md) - Current progress
- [API Documentation](./docs/specs/04_API_SPECIFICATION.md) - API endpoints
- [Database Schema](./docs/specs/03_DATABASE_SCHEMA.md) - Database design

## 🧪 Testing

```bash
# Run all tests
pnpm test

# Run with coverage
pnpm --filter @rpsfull-platform/backend test:coverage
pnpm --filter @rpsfull-platform/contracts test:coverage
```

## 🔄 Resetting Database

To reset and reseed the database:

```bash
cd packages/backend

# Reset database (WARNING: deletes all data)
pnpm db:migrate reset

# Reseed
pnpm db:seed
```

## 🐛 Troubleshooting

### Docker Services Not Running

```bash
# Check status
docker-compose ps

# View logs
docker-compose logs postgres
docker-compose logs redis

# Restart services
docker-compose restart

# Stop services
docker-compose down
```

### Backend Won't Start

1. Check if port 4444 is available:
   ```bash
   lsof -ti:4444
   ```

2. Check database connection:
   ```bash
   cd packages/backend
   pnpm db:studio  # Opens Prisma Studio
   ```

3. Check environment variables:
   ```bash
   # Ensure DATABASE_URL is set correctly
   # Should be: postgresql://rpsfull:dev_password_change_in_production@localhost:5432/rpsfull_dev
   ```

### Frontend Can't Connect to Backend

1. Verify backend is running on port 4444
2. Check browser console for errors
3. Verify `NEXT_PUBLIC_API_URL` is set to `http://localhost:4444/api/v1`
4. Check CORS settings in backend

### Database Connection Errors

```bash
# Verify DATABASE_URL in .env matches docker-compose.yml
# Test connection
cd packages/backend
pnpm db:studio
```

### Port Already in Use

If ports 4444 or 4445 are already in use:

1. Find process using the port:
   ```bash
   lsof -ti:4444
   lsof -ti:4445
   ```

2. Kill the process or change ports in:
   - Backend: `packages/backend/src/server.ts`
   - Frontend: `packages/frontend/package.json`

## 🚢 Deployment

See [SETUP.md](./SETUP.md) for deployment instructions.

## 📝 Development Principles

This project follows:

- **TDD (Test-Driven Development)**: Write tests first, then implement
- **ISP (Interface Segregation Principle)**: Small, focused interfaces
- **Repository Pattern**: Clean data access layer
- **100% Test Coverage**: All repositories and services tested

## 🤝 Contributing

[Add contributing guidelines here]

## 📝 License

[Add your license here]

---

**Built with ❤️ using TDD and ISP principles**

**Ports**: Backend (4444) | Frontend (4445)
