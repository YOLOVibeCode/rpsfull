# Testing Guide - RPSFull Platform

Complete guide for testing with real backend API and test data.

## Overview

The platform uses **real backend API** by default (not mock API). Test data is seeded into the database using Docker containers for isolation.

## Test Environment Setup

### 1. Docker Test Environment

We use a separate Docker Compose file for testing to avoid conflicts with development:

```bash
# Start test services (PostgreSQL + Redis)
docker-compose -f docker-compose.test.yml up -d

# Check status
docker-compose -f docker-compose.test.yml ps

# Stop test services
docker-compose -f docker-compose.test.yml down
```

### 2. Test Database Configuration

Test database uses different ports to avoid conflicts:
- **PostgreSQL:** Port `5433` (dev uses `5432`)
- **Redis:** Port `6380` (dev uses `6379`)
- **Database:** `rpsfull_test`

### 3. Setup Test Environment

```bash
cd packages/backend

# Copy test environment file
cp .env.test.example .env.test

# Run test setup script
chmod +x scripts/test-setup.sh
./scripts/test-setup.sh
```

## Test Data

### Seed Script

The seed script (`packages/backend/prisma/seed.ts`) creates comprehensive test data:

**Users:**
- `alice@example.com` - Level 5 player
- `bob@example.com` - Level 4 player
- `charlie@example.com` - Level 3 player
- `diana@example.com` - Level 2 player
- `organizer@example.com` - Tournament organizer

**Password for all test accounts:** `TestPassword123!`

**Test Data Includes:**
- 5 users with player profiles
- 2 game types (Classic RPS, Extended RPS)
- 13 matches (10 completed, 3 pending)
- 3 tournaments (1 open registration, 1 in progress, 1 completed)
- Tournament entries and brackets
- Player statistics
- Achievements

### Seeding Test Data

```bash
cd packages/backend

# Seed development database
pnpm db:seed

# Seed test database (set DATABASE_URL first)
DATABASE_URL="postgresql://rpsfull_test:test_password_change_in_production@localhost:5433/rpsfull_test" pnpm db:seed
```

## Running Tests

### Unit Tests

```bash
# Run all unit tests
pnpm --filter @rpsfull-platform/backend test

# Run with coverage
pnpm --filter @rpsfull-platform/backend test:coverage

# Run specific test file
pnpm --filter @rpsfull-platform/backend test auth.service.test.ts
```

### Integration Tests

```bash
# Ensure test database is running
docker-compose -f docker-compose.test.yml up -d

# Set test environment
export DATABASE_URL="postgresql://rpsfull_test:test_password_change_in_production@localhost:5433/rpsfull_test"

# Run integration tests
pnpm --filter @rpsfull-platform/backend test integration
```

## Frontend Configuration

### Using Real Backend (Default)

The frontend uses the real backend API by default. No configuration needed.

**Environment Variables:**
```env
NEXT_PUBLIC_API_URL=http://localhost:4444/api/v1
NEXT_PUBLIC_WS_URL=http://localhost:4444
NEXT_PUBLIC_USE_MOCK_API=false
```

### Using Mock API (Optional)

To use mock API instead (for frontend-only development):

```env
NEXT_PUBLIC_USE_MOCK_API=true
NEXT_PUBLIC_MOCK_API_URL=http://localhost:3001/api/v1
```

## Test Workflow

### 1. Development Testing

```bash
# Terminal 1: Start Docker services
docker-compose up -d

# Terminal 2: Start backend
cd packages/backend
pnpm dev

# Terminal 3: Start frontend
cd packages/frontend
pnpm dev

# Terminal 4: Seed database (first time)
cd packages/backend
pnpm db:seed
```

### 2. Integration Testing

```bash
# Start test Docker services
docker-compose -f docker-compose.test.yml up -d

# Setup test environment
cd packages/backend
./scripts/test-setup.sh

# Run integration tests
pnpm test integration
```

### 3. End-to-End Testing

```bash
# Start all services
docker-compose up -d
cd packages/backend && pnpm dev &
cd packages/frontend && pnpm dev &

# Seed database
cd packages/backend
pnpm db:seed

# Test manually:
# 1. Open http://localhost:4445
# 2. Login with: alice@example.com / TestPassword123!
# 3. Create matches, tournaments, etc.
```

## Test Accounts

| Email | Password | Role | Level | Description |
|-------|----------|------|-------|-------------|
| `alice@example.com` | `TestPassword123!` | player | 5 | Top ranked player |
| `bob@example.com` | `TestPassword123!` | player | 4 | Competitive player |
| `charlie@example.com` | `TestPassword123!` | player | 3 | Casual player |
| `diana@example.com` | `TestPassword123!` | player | 2 | New player |
| `organizer@example.com` | `TestPassword123!` | organizer | 10 | Tournament organizer |

## Database Management

### Reset Test Database

```bash
# Stop and remove test containers
docker-compose -f docker-compose.test.yml down -v

# Start fresh
docker-compose -f docker-compose.test.yml up -d

# Run migrations
cd packages/backend
DATABASE_URL="postgresql://rpsfull_test:test_password_change_in_production@localhost:5433/rpsfull_test" pnpm db:migrate

# Seed data
DATABASE_URL="postgresql://rpsfull_test:test_password_change_in_production@localhost:5433/rpsfull_test" pnpm db:seed
```

### View Test Database

```bash
# Using Prisma Studio
cd packages/backend
DATABASE_URL="postgresql://rpsfull_test:test_password_change_in_production@localhost:5433/rpsfull_test" pnpm db:studio
```

## Troubleshooting

### Test Database Connection Issues

```bash
# Check if test services are running
docker-compose -f docker-compose.test.yml ps

# Check logs
docker-compose -f docker-compose.test.yml logs postgres-test

# Restart services
docker-compose -f docker-compose.test.yml restart
```

### Port Conflicts

If ports 5433 or 6380 are in use:

1. Edit `docker-compose.test.yml` to use different ports
2. Update `.env.test` with new ports
3. Restart services

### Migration Issues

```bash
# Reset test database
docker-compose -f docker-compose.test.yml down -v
docker-compose -f docker-compose.test.yml up -d

# Run migrations
cd packages/backend
DATABASE_URL="postgresql://rpsfull_test:test_password_change_in_production@localhost:5433/rpsfull_test" pnpm db:migrate
```

## Best Practices

1. **Always use test database for tests** - Never run tests against development database
2. **Clean up after tests** - Use `beforeEach`/`afterEach` to clean test data
3. **Isolate test data** - Each test should be independent
4. **Use transactions when possible** - Rollback after each test
5. **Seed fresh data** - Don't rely on existing data in tests

## CI/CD Integration

For CI/CD pipelines:

```yaml
# Example GitHub Actions
- name: Start test services
  run: docker-compose -f docker-compose.test.yml up -d

- name: Run migrations
  run: |
    cd packages/backend
    DATABASE_URL=${{ secrets.TEST_DATABASE_URL }} pnpm db:migrate

- name: Run tests
  run: |
    cd packages/backend
    DATABASE_URL=${{ secrets.TEST_DATABASE_URL }} pnpm test
```

---

**Happy Testing! 🧪**

