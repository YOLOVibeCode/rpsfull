# RPSFull Platform - Setup Guide

Complete setup instructions for local development.

## Prerequisites

- **Node.js** 20+ ([Download](https://nodejs.org/))
- **PNPM** 8+ (`npm install -g pnpm`)
- **Docker** & **Docker Compose** ([Download](https://www.docker.com/products/docker-desktop))
- **PostgreSQL** 15+ (via Docker) or local installation
- **Redis** 7+ (via Docker) or local installation

## Quick Start

### 1. Clone Repository

```bash
git clone https://github.com/YOLOVibeCode/rpsfull.git
cd rpsfull
```

### 2. Install Dependencies

```bash
pnpm install
```

### 3. Environment Setup

```bash
# Copy environment template
cp .env.example .env

# Edit .env with your configuration (optional - defaults work for local dev)
# nano .env
```

### 4. Start Docker Services

```bash
# Start PostgreSQL and Redis
docker-compose up -d

# Verify services are running
docker-compose ps
```

### 5. Build Contracts Package

```bash
# Build shared contracts package
pnpm contracts:build
```

### 6. Setup Database

```bash
cd packages/backend

# Generate Prisma Client
pnpm db:generate

# Run migrations
pnpm db:migrate

# Seed database (optional)
pnpm db:seed
```

### 7. Start Development Servers

**Option A: Start All Services (Recommended)**

```bash
# From root directory
pnpm dev
```

**Option B: Start Individually**

```bash
# Terminal 1: Mock API (for frontend development)
pnpm mock-api:dev

# Terminal 2: Backend API
cd packages/backend
pnpm dev

# Terminal 3: Frontend
cd packages/frontend
pnpm dev
```

### 8. Access Applications

- **Frontend:** http://localhost:4445
- **Backend API:** http://localhost:4444
- **Mock API:** http://localhost:3001 (if running separately)
- **API Health Check:** http://localhost:4444/health
- **Prisma Studio:** `cd packages/backend && pnpm db:studio`

## Development Workflow

### Running Tests

```bash
# Run all tests
pnpm test

# Run tests for specific package
pnpm --filter @rpsfull-platform/backend test
pnpm --filter @rpsfull-platform/contracts test

# Run tests with coverage
pnpm --filter @rpsfull-platform/backend test:coverage
```

### Building for Production

```bash
# Build all packages
pnpm build

# Build specific package
pnpm --filter @rpsfull-platform/frontend build
pnpm --filter @rpsfull-platform/backend build
```

### Database Management

```bash
cd packages/backend

# Create new migration
pnpm db:migrate

# Reset database (WARNING: deletes all data)
pnpm db:migrate reset

# View database in Prisma Studio
pnpm db:studio

# Seed database
pnpm db:seed
```

## Project Structure

```
rpsfull-platform/
├── packages/
│   ├── contracts/          # Shared TypeScript types
│   ├── frontend/           # Next.js application
│   ├── backend/            # Express API server
│   └── mock-api/           # Mock API for frontend dev
├── docs/                   # Documentation
├── docker-compose.yml      # Docker services
└── package.json           # Root package.json
```

## Environment Variables

### Required Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `DATABASE_URL` | PostgreSQL connection string | `postgresql://rpsfull:dev_password_change_in_production@localhost:5432/rpsfull_dev` |
| `JWT_SECRET` | Secret for JWT tokens | Must be set (min 32 chars) |
| `JWT_REFRESH_SECRET` | Secret for refresh tokens | Must be set (min 32 chars) |
| `NEXT_PUBLIC_API_URL` | Backend API URL for frontend | `http://localhost:4444/api/v1` |
| `NEXT_PUBLIC_WS_URL` | WebSocket URL for frontend | `http://localhost:4444` |

### Optional Variables

- `REDIS_URL` - Redis connection (for caching)
- `CORS_ORIGIN` - Allowed CORS origin
- `FRONTEND_URL` - Frontend URL (for redirects)
- Email configuration (SMTP_*)

## Troubleshooting

### Database Connection Issues

```bash
# Check if PostgreSQL is running
docker-compose ps

# Check database logs
docker-compose logs postgres

# Restart database
docker-compose restart postgres
```

### Port Already in Use

```bash
# Find process using port
lsof -i :4444
lsof -i :4445

# Kill process (replace PID)
kill -9 <PID>
```

### Prisma Client Not Generated

```bash
cd packages/backend
pnpm db:generate
```

### Module Not Found Errors

```bash
# Rebuild contracts package
pnpm contracts:build

# Reinstall dependencies
pnpm install
```

### Migration Issues

```bash
cd packages/backend

# Reset database (WARNING: deletes data)
pnpm db:migrate reset

# Or manually fix migration
# Edit prisma/migrations/.../migration.sql
pnpm db:migrate
```

## Next Steps

1. **Create an account** at http://localhost:4445/register
2. **Create a match** from the Play page
3. **Create a tournament** from the Tournaments page
4. **View statistics** on the Stats page

## Development Tips

- Use **Mock API** for frontend development (faster iteration)
- Use **Backend API** for full-stack testing
- Use **Prisma Studio** to inspect database: `cd packages/backend && pnpm db:studio`
- Check **browser console** and **server logs** for debugging
- Use **React Query DevTools** (included in frontend) for API debugging

## Getting Help

- Check documentation in `docs/` directory
- Review implementation status in `IMPLEMENTATION_STATUS.md`
- Check GitHub issues
- Review code comments and TypeScript types

## Production Deployment

See `docs/implementation/` for production deployment guides.

---

**Happy Coding! 🚀**

