# Quick Start Guide - Real Backend with Test Data

Get the platform running with real backend API and comprehensive test data in minutes.

## 🚀 Quick Setup (5 minutes)

### Step 1: Start Docker Services

```bash
docker-compose up -d
```

This starts:
- PostgreSQL on port `5432`
- Redis on port `6379`

### Step 2: Setup Environment

```bash
# Copy environment file (if not exists)
cp .env.example .env

# The defaults work for local development, no changes needed!
```

### Step 3: Build Contracts

```bash
pnpm contracts:build
```

### Step 4: Setup Database

```bash
cd packages/backend

# Generate Prisma Client
pnpm db:generate

# Run migrations
pnpm db:migrate

# Seed with test data
pnpm db:seed
```

### Step 5: Start Backend

```bash
# From packages/backend directory
pnpm dev
```

Backend will start on `http://localhost:4444`

### Step 6: Start Frontend

```bash
# In a new terminal, from root directory
cd packages/frontend
pnpm dev
```

Frontend will start on `http://localhost:4445`

## 🎮 Test Accounts

After seeding, you can login with these accounts:

| Email | Password | Role | Level | Player Name |
|-------|----------|------|-------|-------------|
| `alice@example.com` | `TestPassword123!` | player | 5 | Rocky Rocker |
| `bob@example.com` | `TestPassword123!` | player | 4 | Penny Paper |
| `organizer@example.com` | `TestPassword123!` | organizer | 10 | Spock Spock |

## 📊 What's Included in Test Data

- **5 Users** with player profiles
- **2 Game Types** (Classic RPS, Extended RPS)
- **13 Matches** (10 completed, 3 pending)
- **3 Tournaments**:
  - Spring Championship (open registration)
  - Quick Match Tournament (in progress with bracket)
  - Winter Classic (completed)
- **Player Statistics** for all players
- **Achievements** for top players

## 🧪 Testing the Platform

### 1. Login
- Go to http://localhost:4445/login
- Login with `alice@example.com` / `TestPassword123!`

### 2. View Dashboard
- See recent matches
- View statistics
- Check leaderboard

### 3. Create a Match
- Go to Play page
- Create a new match with another player
- Play in real-time!

### 4. Join Tournament
- Go to Tournaments page
- Register for "Spring Championship 2024"
- View bracket when tournament starts

### 5. View Statistics
- Check your player statistics
- Compare head-to-head with other players
- View leaderboard

## 🔄 Resetting Test Data

To reset and reseed the database:

```bash
cd packages/backend

# Reset database (WARNING: deletes all data)
pnpm db:migrate reset

# Reseed
pnpm db:seed
```

## 🐛 Troubleshooting

### Backend won't start

```bash
# Check if database is running
docker-compose ps

# Check database logs
docker-compose logs postgres

# Restart services
docker-compose restart
```

### Frontend can't connect to backend

1. Make sure backend is running on port 4444
2. Check `NEXT_PUBLIC_API_URL` in `.env` (should be `http://localhost:4444/api/v1`)
3. Check browser console for errors

### Database connection errors

```bash
# Verify DATABASE_URL in .env matches docker-compose.yml
# Should be: postgresql://rpsfull:dev_password_change_in_production@localhost:5432/rpsfull_dev

# Test connection
cd packages/backend
pnpm db:studio  # Opens Prisma Studio
```

## 📝 Next Steps

1. **Explore the platform** - Try all features with test data
2. **Create your own account** - Register a new user
3. **Create tournaments** - Use organizer account
4. **Play matches** - Challenge other players
5. **View statistics** - Track your progress

## 🎯 Key Features to Test

- ✅ Authentication (login/register)
- ✅ Match creation and gameplay
- ✅ Real-time WebSocket updates
- ✅ Tournament creation and registration
- ✅ Bracket visualization
- ✅ Statistics tracking
- ✅ Leaderboard
- ✅ Player profiles

---

**You're all set! Start exploring the platform! 🚀**

