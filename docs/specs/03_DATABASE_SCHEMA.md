# Database Schema & Data Model
## RPSFull Tournament Platform

**Document Version:** 1.1  
**Last Updated:** November 22, 2025  
**Status:** Draft  
**Repository:** https://github.com/YOLOVibeCode/rpsfull.git  

---

## 1. Database Overview

### 1.1 Database Platform
**PostgreSQL 15+** with **Prisma ORM**

**Why Prisma:**
- ✅ **Type-safe queries** - Generated TypeScript types for all queries
- ✅ **Migration-based schema** - Version-controlled database changes
- ✅ **Transaction support** - ACID compliance for data integrity
- ✅ **Query optimization** - Prisma optimizes queries automatically
- ✅ **Relationship handling** - Proper foreign keys and constraints
- ✅ **Developer experience** - Excellent tooling and documentation

### 1.2 Data Access Layer Principles

**We use Prisma ORM exclusively for all data access:**

1. **Repository Pattern** - All data access through repositories
2. **Interface-based** - Repositories implement interfaces from contracts package
3. **Type Safety** - Full TypeScript type safety end-to-end
4. **Transaction Safety** - Critical operations use transactions
5. **Error Handling** - Proper error handling and rollback
6. **No Direct Prisma Calls** - Services never call Prisma directly

**Repository Structure:**
```typescript
// Interface from contracts package
interface IUserRepository {
  create(data: IUserCreate): Promise<IUser>;
  findById(id: string): Promise<IUser | null>;
  findByEmail(email: string): Promise<IUser | null>;
  update(id: string, data: IUserUpdate): Promise<IUser>;
  delete(id: string): Promise<void>;
}

// Implementation with Prisma
class UserRepository implements IUserRepository {
  constructor(private prisma: PrismaClient) {}
  
  async create(data: IUserCreate): Promise<IUser> {
    return this.prisma.user.create({ data });
  }
  
  async findById(id: string): Promise<IUser | null> {
    return this.prisma.user.findUnique({ where: { id } });
  }
  
  // ... other methods
}
```

### 1.3 Design Principles
- Normalized schema (Third Normal Form)
- Proper indexing for performance
- Foreign key constraints for referential integrity
- Timestamps on all tables (created_at, updated_at)
- Soft deletes for audit trail
- UUID primary keys for distributed systems
- NOT NULL constraints where appropriate
- **Prisma migrations** for all schema changes
- **Type-safe queries** via Prisma Client

### 1.3 Naming Conventions
- Tables: PascalCase, singular (User, Match, Tournament)
- Columns: snake_case (created_at, user_id)
- Indexes: idx_{table}_{columns}
- Foreign keys: fk_{table}_{referenced_table}
- Unique constraints: uq_{table}_{columns}

---

## 2. Entity Relationship Diagram

```
┌──────────────┐         ┌──────────────┐         ┌──────────────┐
│     User     │1       *│    Player    │*       1│   GameType   │
│──────────────│─────────│──────────────│─────────│──────────────│
│ id (PK)      │         │ id (PK)      │         │ id (PK)      │
│ email        │         │ name         │         │ name         │
│ password_hash│         │ user_id (FK) │         │ symbol_count │
│ role         │         │ email        │         │ symbols      │
│ created_at   │         │ created_at   │         │ win_matrix   │
└──────────────┘         └──────┬───────┘         └──────┬───────┘
                                │                        │
                                │*                       │1
                                │                        │
                         ┌──────┴───────┐        ┌──────┴───────┐
                         │    Match     │*      1│  Tournament  │
                         │──────────────│────────│──────────────│
                         │ id (PK)      │        │ id (PK)      │
                         │ player1_id   │        │ name         │
                         │ player2_id   │        │ game_type_id │
                         │ game_type_id │        │ organizer_id │
                         │ tournament_id│        │ status       │
                         │ match_format │        │ bracket_data │
                         │ winner_id    │        │ created_at   │
                         │ status       │        └──────────────┘
                         │ created_at   │
                         └──────┬───────┘
                                │
                                │1
                                │
                         ┌──────┴───────┐
                         │    Round     │
                         │──────────────│
                         │ id (PK)      │
                         │ match_id (FK)│
                         │ round_number │
                         │ p1_move      │
                         │ p2_move      │
                         │ result       │
                         │ timestamp    │
                         └──────────────┘

┌──────────────────┐         ┌──────────────────┐
│ PlayerStatistics │         │  TournamentEntry │
│──────────────────│         │──────────────────│
│ id (PK)          │         │ id (PK)          │
│ player_id (FK)   │         │ tournament_id    │
│ game_type_id     │         │ player_id        │
│ total_matches    │         │ seed             │
│ wins             │         │ placement        │
│ losses           │         │ status           │
│ win_rate         │         └──────────────────┘
│ move_stats       │
│ updated_at       │
└──────────────────┘

┌──────────────────┐
│   Achievement    │
│──────────────────│
│ id (PK)          │
│ player_id (FK)   │
│ type             │
│ name             │
│ earned_at        │
└──────────────────┘
```

---

## 3. Table Definitions

### 3.1 User Table

**Purpose:** Stores authenticated user accounts

```sql
CREATE TABLE "User" (
    id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email               VARCHAR(255) UNIQUE NOT NULL,
    password_hash       VARCHAR(255) NOT NULL,
    role                VARCHAR(50) NOT NULL DEFAULT 'player',
    is_email_verified   BOOLEAN DEFAULT FALSE,
    verification_token  VARCHAR(255),
    reset_token         VARCHAR(255),
    reset_token_expiry  TIMESTAMP,
    last_login          TIMESTAMP,
    is_active           BOOLEAN DEFAULT TRUE,
    created_at          TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at          TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    deleted_at          TIMESTAMP NULL
);

CREATE INDEX idx_user_email ON "User"(email) WHERE deleted_at IS NULL;
CREATE INDEX idx_user_role ON "User"(role);
```

**Columns:**
- `id`: Unique identifier (UUID)
- `email`: User's email address (unique, for login)
- `password_hash`: Bcrypt hashed password
- `role`: User role (player, organizer, admin)
- `is_email_verified`: Email verification status
- `verification_token`: Token for email verification
- `reset_token`: Token for password reset
- `reset_token_expiry`: Expiration time for reset token
- `last_login`: Last successful login timestamp
- `is_active`: Account active status
- `created_at`: Account creation timestamp
- `updated_at`: Last update timestamp
- `deleted_at`: Soft delete timestamp

**Constraints:**
- Email must be unique and valid format
- Password hash must be present
- Role must be one of: player, organizer, admin

---

### 3.2 Player Table

**Purpose:** Stores player profiles (can exist with or without User account)

```sql
CREATE TABLE "Player" (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name            VARCHAR(100) NOT NULL,
    display_name    VARCHAR(100),
    user_id         UUID REFERENCES "User"(id) ON DELETE SET NULL,
    email           VARCHAR(255),
    avatar_url      VARCHAR(500),
    level           INTEGER DEFAULT 1,
    experience      INTEGER DEFAULT 0,
    ranking         INTEGER,
    bio             TEXT,
    is_active       BOOLEAN DEFAULT TRUE,
    created_at      TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at      TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    deleted_at      TIMESTAMP NULL
);

CREATE INDEX idx_player_user_id ON "Player"(user_id);
CREATE INDEX idx_player_ranking ON "Player"(ranking) WHERE is_active = TRUE;
CREATE INDEX idx_player_email ON "Player"(email) WHERE deleted_at IS NULL;
```

**Columns:**
- `id`: Unique identifier
- `name`: Player's real name or username
- `display_name`: Public display name (if different from name)
- `user_id`: Link to User account (NULL if unclaimed)
- `email`: Optional email (for unclaimed players)
- `avatar_url`: URL to avatar image
- `level`: Current player level
- `experience`: Total experience points
- `ranking`: Global ranking position
- `bio`: Player biography/description
- `is_active`: Whether player is currently active
- `created_at`: Creation timestamp
- `updated_at`: Last update timestamp
- `deleted_at`: Soft delete timestamp

**Business Rules:**
- Player can exist without user_id (tournament organizer creates players)
- If email provided, can later be claimed by user registration
- Display name defaults to name if not provided

---

### 3.3 GameType Table

**Purpose:** Defines different game variants (RPS, RPS-LS, custom games)

```sql
CREATE TABLE "GameType" (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name            VARCHAR(100) NOT NULL UNIQUE,
    description     TEXT,
    symbol_count    INTEGER NOT NULL,
    symbols         JSONB NOT NULL,
    win_matrix      JSONB NOT NULL,
    tie_rules       VARCHAR(50) DEFAULT 'replay',
    scoring_method  VARCHAR(50) DEFAULT 'best_of_n',
    icon_set        JSONB,
    is_active       BOOLEAN DEFAULT TRUE,
    is_default      BOOLEAN DEFAULT FALSE,
    created_by      UUID REFERENCES "User"(id),
    created_at      TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at      TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_gametype_name ON "GameType"(name);
CREATE INDEX idx_gametype_is_default ON "GameType"(is_default);
```

**Columns:**
- `id`: Unique identifier
- `name`: Game type name (e.g., "Classic RPS", "RPS-LS")
- `description`: Description of the game variant
- `symbol_count`: Number of symbols in the game
- `symbols`: JSON array of symbol definitions
- `win_matrix`: JSON object defining what beats what
- `tie_rules`: How to handle ties (replay, count, ignore)
- `scoring_method`: How to calculate winner (best_of_n, points, etc.)
- `icon_set`: JSON object with icon URLs for each symbol
- `is_active`: Whether this game type is available
- `is_default`: Whether this is the default game type
- `created_by`: User who created custom game type
- `created_at`: Creation timestamp
- `updated_at`: Last update timestamp

**Example symbols JSON:**
```json
[
  {"id": "rock", "name": "Rock", "emoji": "🪨"},
  {"id": "paper", "name": "Paper", "emoji": "📄"},
  {"id": "scissors", "name": "Scissors", "emoji": "✂️"}
]
```

**Example win_matrix JSON:**
```json
{
  "rock": ["scissors"],
  "paper": ["rock"],
  "scissors": ["paper"]
}
```

---

### 3.4 Match Table

**Purpose:** Stores individual matches between two players

```sql
CREATE TABLE "Match" (
    id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    player1_id          UUID NOT NULL REFERENCES "Player"(id),
    player2_id          UUID NOT NULL REFERENCES "Player"(id),
    game_type_id        UUID NOT NULL REFERENCES "GameType"(id),
    tournament_id       UUID REFERENCES "Tournament"(id) ON DELETE SET NULL,
    match_format        VARCHAR(50) NOT NULL DEFAULT 'best_of_3',
    best_of_n           INTEGER NOT NULL DEFAULT 3,
    ties_count          BOOLEAN DEFAULT FALSE,
    play_mode           VARCHAR(50) NOT NULL DEFAULT 'digital',
    status              VARCHAR(50) NOT NULL DEFAULT 'pending',
    winner_id           UUID REFERENCES "Player"(id),
    player1_score       INTEGER DEFAULT 0,
    player2_score       INTEGER DEFAULT 0,
    total_rounds        INTEGER DEFAULT 0,
    duration_seconds    INTEGER,
    started_at          TIMESTAMP,
    completed_at        TIMESTAMP,
    created_at          TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at          TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    CONSTRAINT chk_different_players CHECK (player1_id != player2_id),
    CONSTRAINT chk_valid_best_of_n CHECK (best_of_n > 0 AND best_of_n % 2 = 1),
    CONSTRAINT chk_winner_is_player CHECK (
        winner_id IS NULL OR 
        winner_id = player1_id OR 
        winner_id = player2_id
    )
);

CREATE INDEX idx_match_player1 ON "Match"(player1_id);
CREATE INDEX idx_match_player2 ON "Match"(player2_id);
CREATE INDEX idx_match_tournament ON "Match"(tournament_id);
CREATE INDEX idx_match_status ON "Match"(status);
CREATE INDEX idx_match_created_at ON "Match"(created_at DESC);
```

**Columns:**
- `id`: Unique identifier
- `player1_id`: First player
- `player2_id`: Second player
- `game_type_id`: Type of game being played
- `tournament_id`: Associated tournament (NULL for quick matches)
- `match_format`: Format description (e.g., "best_of_3")
- `best_of_n`: Number of rounds to win (must be odd)
- `ties_count`: Whether ties count toward total rounds
- `play_mode`: "digital" or "live_recording"
- `status`: Match status (pending, in_progress, completed, cancelled)
- `winner_id`: Winner of the match (NULL if not completed)
- `player1_score`: Player 1's score
- `player2_score`: Player 2's score
- `total_rounds`: Total rounds played
- `duration_seconds`: Match duration in seconds
- `started_at`: When match actually started
- `completed_at`: When match was completed
- `created_at`: Match creation timestamp
- `updated_at`: Last update timestamp

**Status Values:**
- `pending`: Match created but not started
- `in_progress`: Match currently being played
- `completed`: Match finished
- `cancelled`: Match was cancelled

---

### 3.5 Round Table

**Purpose:** Stores individual rounds within a match

```sql
CREATE TABLE "Round" (
    id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    match_id            UUID NOT NULL REFERENCES "Match"(id) ON DELETE CASCADE,
    round_number        INTEGER NOT NULL,
    player1_move        VARCHAR(50),
    player2_move        VARCHAR(50),
    result              VARCHAR(50) NOT NULL,
    winner_id           UUID REFERENCES "Player"(id),
    player1_time_ms     INTEGER,
    player2_time_ms     INTEGER,
    timestamp           TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    CONSTRAINT chk_positive_round_number CHECK (round_number > 0),
    CONSTRAINT chk_valid_result CHECK (
        result IN ('player1_win', 'player2_win', 'tie')
    ),
    UNIQUE(match_id, round_number)
);

CREATE INDEX idx_round_match ON "Round"(match_id, round_number);
CREATE INDEX idx_round_timestamp ON "Round"(timestamp DESC);
```

**Columns:**
- `id`: Unique identifier
- `match_id`: Associated match
- `round_number`: Round number within match (1, 2, 3, etc.)
- `player1_move`: Symbol chosen by player 1
- `player2_move`: Symbol chosen by player 2
- `result`: Round result (player1_win, player2_win, tie)
- `winner_id`: Winner of this round
- `player1_time_ms`: Time taken by player 1 to make move (milliseconds)
- `player2_time_ms`: Time taken by player 2 to make move (milliseconds)
- `timestamp`: When the round was played

**Business Rules:**
- Round numbers must be sequential
- Moves are recorded only after both players submit
- Time tracking only for digital mode

---

### 3.6 Tournament Table

**Purpose:** Stores tournament information

```sql
CREATE TABLE "Tournament" (
    id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name                VARCHAR(200) NOT NULL,
    description         TEXT,
    game_type_id        UUID NOT NULL REFERENCES "GameType"(id),
    organizer_id        UUID NOT NULL REFERENCES "User"(id),
    tournament_type     VARCHAR(50) NOT NULL DEFAULT 'single_elimination',
    match_format        VARCHAR(50) NOT NULL DEFAULT 'best_of_3',
    best_of_n           INTEGER NOT NULL DEFAULT 3,
    status              VARCHAR(50) NOT NULL DEFAULT 'draft',
    current_round       INTEGER DEFAULT 0,
    total_rounds        INTEGER,
    max_participants    INTEGER,
    participant_count   INTEGER DEFAULT 0,
    bracket_data        JSONB,
    rules               TEXT,
    prize_info          TEXT,
    start_date          TIMESTAMP,
    end_date            TIMESTAMP,
    registration_deadline TIMESTAMP,
    created_at          TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at          TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    CONSTRAINT chk_valid_best_of_n CHECK (best_of_n > 0 AND best_of_n % 2 = 1)
);

CREATE INDEX idx_tournament_organizer ON "Tournament"(organizer_id);
CREATE INDEX idx_tournament_status ON "Tournament"(status);
CREATE INDEX idx_tournament_start_date ON "Tournament"(start_date);
```

**Columns:**
- `id`: Unique identifier
- `name`: Tournament name
- `description`: Tournament description
- `game_type_id`: Game type for all matches
- `organizer_id`: User who created the tournament
- `tournament_type`: Type (single_elimination, double_elimination, round_robin)
- `match_format`: Format for all matches
- `best_of_n`: Best of N for all matches
- `status`: Tournament status (draft, registration, in_progress, completed, cancelled)
- `current_round`: Current tournament round
- `total_rounds`: Total number of rounds
- `max_participants`: Maximum number of participants
- `participant_count`: Current number of participants
- `bracket_data`: JSON structure of tournament bracket
- `rules`: Tournament-specific rules
- `prize_info`: Prize information
- `start_date`: Scheduled start date
- `end_date`: Scheduled or actual end date
- `registration_deadline`: Last date to register
- `created_at`: Creation timestamp
- `updated_at`: Last update timestamp

**Status Values:**
- `draft`: Tournament being created
- `registration`: Open for player registration
- `ready`: Registration closed, ready to start
- `in_progress`: Tournament in progress
- `completed`: Tournament finished
- `cancelled`: Tournament cancelled

**Example bracket_data JSON:**
```json
{
  "rounds": [
    {
      "round": 1,
      "matches": [
        {"position": 1, "player1_id": "uuid1", "player2_id": "uuid2", "match_id": "uuid_m1"},
        {"position": 2, "player1_id": "uuid3", "player2_id": "uuid4", "match_id": "uuid_m2"}
      ]
    },
    {
      "round": 2,
      "matches": [
        {"position": 1, "player1_id": null, "player2_id": null, "match_id": null}
      ]
    }
  ]
}
```

---

### 3.7 TournamentEntry Table

**Purpose:** Links players to tournaments with their placement

```sql
CREATE TABLE "TournamentEntry" (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tournament_id   UUID NOT NULL REFERENCES "Tournament"(id) ON DELETE CASCADE,
    player_id       UUID NOT NULL REFERENCES "Player"(id),
    seed            INTEGER,
    status          VARCHAR(50) DEFAULT 'registered',
    placement       INTEGER,
    matches_won     INTEGER DEFAULT 0,
    matches_lost    INTEGER DEFAULT 0,
    rounds_won      INTEGER DEFAULT 0,
    rounds_lost     INTEGER DEFAULT 0,
    registered_at   TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    eliminated_at   TIMESTAMP,
    
    UNIQUE(tournament_id, player_id),
    UNIQUE(tournament_id, seed)
);

CREATE INDEX idx_tournament_entry_tournament ON "TournamentEntry"(tournament_id);
CREATE INDEX idx_tournament_entry_player ON "TournamentEntry"(player_id);
CREATE INDEX idx_tournament_entry_placement ON "TournamentEntry"(tournament_id, placement);
```

**Columns:**
- `id`: Unique identifier
- `tournament_id`: Associated tournament
- `player_id`: Participating player
- `seed`: Player's seed/ranking in tournament
- `status`: Entry status (registered, active, eliminated, withdrew)
- `placement`: Final placement (1st, 2nd, 3rd, etc.)
- `matches_won`: Number of matches won
- `matches_lost`: Number of matches lost
- `rounds_won`: Total rounds won across all matches
- `rounds_lost`: Total rounds lost across all matches
- `registered_at`: Registration timestamp
- `eliminated_at`: Elimination timestamp

---

### 3.8 PlayerStatistics Table

**Purpose:** Aggregated statistics for each player per game type

```sql
CREATE TABLE "PlayerStatistics" (
    id                      UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    player_id               UUID NOT NULL REFERENCES "Player"(id) ON DELETE CASCADE,
    game_type_id            UUID NOT NULL REFERENCES "GameType"(id),
    
    -- Match statistics
    total_matches           INTEGER DEFAULT 0,
    matches_won             INTEGER DEFAULT 0,
    matches_lost            INTEGER DEFAULT 0,
    matches_tied            INTEGER DEFAULT 0,
    win_rate                DECIMAL(5,2),
    current_win_streak      INTEGER DEFAULT 0,
    longest_win_streak      INTEGER DEFAULT 0,
    
    -- Round statistics
    total_rounds            INTEGER DEFAULT 0,
    rounds_won              INTEGER DEFAULT 0,
    rounds_lost             INTEGER DEFAULT 0,
    rounds_tied             INTEGER DEFAULT 0,
    
    -- Move statistics (JSONB for flexibility)
    move_stats              JSONB DEFAULT '{}',
    
    -- Timing statistics
    avg_move_time_ms        INTEGER,
    fastest_move_ms         INTEGER,
    
    -- Opponent statistics
    opponent_stats          JSONB DEFAULT '{}',
    
    -- Tournament statistics
    tournaments_entered     INTEGER DEFAULT 0,
    tournaments_won         INTEGER DEFAULT 0,
    
    last_match_at           TIMESTAMP,
    updated_at              TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    UNIQUE(player_id, game_type_id)
);

CREATE INDEX idx_player_stats_player ON "PlayerStatistics"(player_id);
CREATE INDEX idx_player_stats_win_rate ON "PlayerStatistics"(win_rate DESC);
```

**Columns:**
- `id`: Unique identifier
- `player_id`: Associated player
- `game_type_id`: Game type these stats are for
- Match-level statistics (total, won, lost, tied, rates, streaks)
- Round-level statistics
- `move_stats`: JSON with per-move statistics
- Timing statistics
- `opponent_stats`: JSON with per-opponent performance
- Tournament statistics
- `last_match_at`: Last match played
- `updated_at`: Last statistics update

**Example move_stats JSON:**
```json
{
  "rock": {
    "used": 45,
    "won": 30,
    "lost": 10,
    "tied": 5,
    "win_rate": 66.67
  },
  "paper": {
    "used": 40,
    "won": 25,
    "lost": 12,
    "tied": 3,
    "win_rate": 62.50
  },
  "scissors": {
    "used": 35,
    "won": 20,
    "lost": 13,
    "tied": 2,
    "win_rate": 57.14
  }
}
```

**Example opponent_stats JSON:**
```json
{
  "uuid_opponent1": {
    "matches": 5,
    "wins": 3,
    "losses": 2,
    "last_played": "2025-11-20T10:00:00Z"
  },
  "uuid_opponent2": {
    "matches": 3,
    "wins": 1,
    "losses": 2,
    "last_played": "2025-11-21T14:30:00Z"
  }
}
```

---

### 3.9 Achievement Table

**Purpose:** Tracks player achievements and badges

```sql
CREATE TABLE "Achievement" (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    player_id       UUID NOT NULL REFERENCES "Player"(id) ON DELETE CASCADE,
    achievement_type VARCHAR(100) NOT NULL,
    name            VARCHAR(200) NOT NULL,
    description     TEXT,
    icon_url        VARCHAR(500),
    rarity          VARCHAR(50) DEFAULT 'common',
    earned_at       TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    UNIQUE(player_id, achievement_type)
);

CREATE INDEX idx_achievement_player ON "Achievement"(player_id);
CREATE INDEX idx_achievement_type ON "Achievement"(achievement_type);
CREATE INDEX idx_achievement_rarity ON "Achievement"(rarity);
```

**Columns:**
- `id`: Unique identifier
- `player_id`: Player who earned the achievement
- `achievement_type`: Type/identifier of achievement
- `name`: Achievement name
- `description`: Achievement description
- `icon_url`: Badge/icon URL
- `rarity`: Rarity level (common, uncommon, rare, epic, legendary)
- `earned_at`: When achievement was earned

**Achievement Types:**
- `first_win`: First match won
- `win_streak_5`: 5-match win streak
- `win_streak_10`: 10-match win streak
- `century`: 100 matches played
- `millennium`: 1000 matches played
- `tournament_winner`: Won a tournament
- `perfect_game`: Won match without losing a round
- `comeback_kid`: Won from 0-2 down in best of 5
- `variety_master`: Won with all moves equally
- `speed_demon`: Average move time under 1 second

---

### 3.10 Session Table

**Purpose:** Tracks active user sessions (for refresh tokens)

```sql
CREATE TABLE "Session" (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id         UUID NOT NULL REFERENCES "User"(id) ON DELETE CASCADE,
    refresh_token   VARCHAR(500) NOT NULL UNIQUE,
    device_info     JSONB,
    ip_address      VARCHAR(45),
    user_agent      TEXT,
    is_active       BOOLEAN DEFAULT TRUE,
    expires_at      TIMESTAMP NOT NULL,
    last_used_at    TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    created_at      TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    CONSTRAINT chk_valid_expiry CHECK (expires_at > created_at)
);

CREATE INDEX idx_session_user ON "Session"(user_id);
CREATE INDEX idx_session_refresh_token ON "Session"(refresh_token);
CREATE INDEX idx_session_expires_at ON "Session"(expires_at);
```

---

## 4. Views & Materialized Views

### 4.1 Player Leaderboard View

```sql
CREATE VIEW player_leaderboard AS
SELECT 
    p.id,
    p.name,
    p.display_name,
    p.level,
    p.ranking,
    ps.total_matches,
    ps.matches_won,
    ps.win_rate,
    ps.longest_win_streak,
    ps.tournaments_won
FROM "Player" p
LEFT JOIN "PlayerStatistics" ps ON p.id = ps.player_id
WHERE p.is_active = TRUE
  AND ps.game_type_id = (SELECT id FROM "GameType" WHERE is_default = TRUE)
ORDER BY p.ranking ASC NULLS LAST;
```

### 4.2 Recent Matches View

```sql
CREATE VIEW recent_matches AS
SELECT 
    m.id,
    m.created_at,
    m.completed_at,
    p1.name as player1_name,
    p2.name as player2_name,
    pw.name as winner_name,
    m.player1_score,
    m.player2_score,
    gt.name as game_type_name,
    m.status
FROM "Match" m
JOIN "Player" p1 ON m.player1_id = p1.id
JOIN "Player" p2 ON m.player2_id = p2.id
LEFT JOIN "Player" pw ON m.winner_id = pw.id
JOIN "GameType" gt ON m.game_type_id = gt.id
ORDER BY m.created_at DESC;
```

### 4.3 Tournament Standings View

```sql
CREATE VIEW tournament_standings AS
SELECT 
    te.tournament_id,
    t.name as tournament_name,
    p.id as player_id,
    p.name as player_name,
    te.seed,
    te.placement,
    te.matches_won,
    te.matches_lost,
    te.rounds_won,
    te.rounds_lost,
    te.status
FROM "TournamentEntry" te
JOIN "Tournament" t ON te.tournament_id = t.id
JOIN "Player" p ON te.player_id = p.id
ORDER BY te.tournament_id, te.placement NULLS LAST, te.seed;
```

---

## 5. Indexes Strategy

### 5.1 Primary Indexes (Already Covered)
- Primary key indexes on all tables
- Unique indexes on email, tokens, etc.

### 5.2 Performance Indexes

**For Match Queries:**
```sql
CREATE INDEX idx_match_completed_winner 
ON "Match"(completed_at DESC, winner_id) 
WHERE status = 'completed';

CREATE INDEX idx_match_player_status 
ON "Match"(player1_id, status) 
WHERE deleted_at IS NULL;
```

**For Statistics Queries:**
```sql
CREATE INDEX idx_round_player_moves 
ON "Round"(match_id, player1_move, player2_move);

CREATE INDEX idx_stats_winrate 
ON "PlayerStatistics"(game_type_id, win_rate DESC);
```

**For Tournament Queries:**
```sql
CREATE INDEX idx_tournament_active 
ON "Tournament"(status, start_date) 
WHERE status IN ('registration', 'in_progress');
```

### 5.3 Partial Indexes

```sql
-- Only index active players
CREATE INDEX idx_active_players 
ON "Player"(ranking) 
WHERE is_active = TRUE AND deleted_at IS NULL;

-- Only index open tournaments
CREATE INDEX idx_open_tournaments 
ON "Tournament"(start_date) 
WHERE status = 'registration';
```

---

## 6. Constraints & Validations

### 6.1 Check Constraints

```sql
-- Ensure best_of_n is odd and positive
ALTER TABLE "Match" 
ADD CONSTRAINT chk_best_of_n_odd 
CHECK (best_of_n > 0 AND best_of_n % 2 = 1);

-- Ensure players are different
ALTER TABLE "Match" 
ADD CONSTRAINT chk_different_players 
CHECK (player1_id != player2_id);

-- Ensure valid email format
ALTER TABLE "User" 
ADD CONSTRAINT chk_valid_email 
CHECK (email ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$');

-- Ensure positive scores
ALTER TABLE "Match" 
ADD CONSTRAINT chk_positive_scores 
CHECK (player1_score >= 0 AND player2_score >= 0);

-- Ensure level is positive
ALTER TABLE "Player" 
ADD CONSTRAINT chk_positive_level 
CHECK (level > 0);
```

### 6.2 Foreign Key Constraints

All foreign keys have appropriate CASCADE or SET NULL behavior:
- ON DELETE CASCADE: For dependent data (rounds, statistics)
- ON DELETE SET NULL: For optional references (match winner)
- ON DELETE RESTRICT: For critical references (prevent deletion)

---

## 7. Triggers & Functions

### 7.1 Update Timestamp Trigger

```sql
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Apply to all tables with updated_at
CREATE TRIGGER update_user_updated_at 
BEFORE UPDATE ON "User" 
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Repeat for other tables...
```

### 7.2 Statistics Update Trigger

```sql
CREATE OR REPLACE FUNCTION update_player_statistics()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.status = 'completed' AND OLD.status != 'completed' THEN
        -- Update player 1 statistics
        INSERT INTO "PlayerStatistics" (player_id, game_type_id, total_matches, matches_won)
        VALUES (NEW.player1_id, NEW.game_type_id, 1, CASE WHEN NEW.winner_id = NEW.player1_id THEN 1 ELSE 0 END)
        ON CONFLICT (player_id, game_type_id) DO UPDATE SET
            total_matches = "PlayerStatistics".total_matches + 1,
            matches_won = "PlayerStatistics".matches_won + 
                CASE WHEN NEW.winner_id = NEW.player1_id THEN 1 ELSE 0 END,
            matches_lost = "PlayerStatistics".matches_lost + 
                CASE WHEN NEW.winner_id = NEW.player2_id THEN 1 ELSE 0 END,
            last_match_at = NEW.completed_at;
        
        -- Similar for player 2...
    END IF;
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER trigger_update_statistics
AFTER UPDATE ON "Match"
FOR EACH ROW EXECUTE FUNCTION update_player_statistics();
```

### 7.3 Tournament Participant Counter

```sql
CREATE OR REPLACE FUNCTION update_tournament_count()
RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'INSERT' THEN
        UPDATE "Tournament" 
        SET participant_count = participant_count + 1 
        WHERE id = NEW.tournament_id;
    ELSIF TG_OP = 'DELETE' THEN
        UPDATE "Tournament" 
        SET participant_count = participant_count - 1 
        WHERE id = OLD.tournament_id;
    END IF;
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER trigger_tournament_participant_count
AFTER INSERT OR DELETE ON "TournamentEntry"
FOR EACH ROW EXECUTE FUNCTION update_tournament_count();
```

---

## 8. Prisma Schema

**File:** `prisma/schema.prisma`

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
  passwordHash      String    @map("password_hash")
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
}

model GameType {
  id             String    @id @default(uuid())
  name           String    @unique
  description    String?
  symbolCount    Int       @map("symbol_count")
  symbols        Json
  winMatrix      Json      @map("win_matrix")
  tieRules       String    @default("replay") @map("tie_rules")
  scoringMethod  String    @default("best_of_n") @map("scoring_method")
  iconSet        Json?     @map("icon_set")
  isActive       Boolean   @default(true) @map("is_active")
  isDefault      Boolean   @default(false) @map("is_default")
  createdBy      String?   @map("created_by")
  createdAt      DateTime  @default(now()) @map("created_at")
  updatedAt      DateTime  @updatedAt @map("updated_at")
  
  creator      User?              @relation("CreatedGameTypes", fields: [createdBy], references: [id])
  matches      Match[]
  tournaments  Tournament[]
  statistics   PlayerStatistics[]
  
  @@map("GameType")
}

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
}

model Round {
  id            String   @id @default(uuid())
  matchId       String   @map("match_id")
  roundNumber   Int      @map("round_number")
  player1Move   String?  @map("player1_move")
  player2Move   String?  @map("player2_move")
  result        String
  winnerId      String?  @map("winner_id")
  player1TimeMs Int?     @map("player1_time_ms")
  player2TimeMs Int?     @map("player2_time_ms")
  timestamp     DateTime @default(now())
  
  match  Match   @relation(fields: [matchId], references: [id], onDelete: Cascade)
  winner Player? @relation(fields: [winnerId], references: [id])
  
  @@unique([matchId, roundNumber])
  @@map("Round")
}

model Tournament {
  id                    String    @id @default(uuid())
  name                  String
  description           String?
  gameTypeId            String    @map("game_type_id")
  organizerId           String    @map("organizer_id")
  tournamentType        String    @default("single_elimination") @map("tournament_type")
  matchFormat           String    @default("best_of_3") @map("match_format")
  bestOfN               Int       @default(3) @map("best_of_n")
  status                String    @default("draft")
  currentRound          Int       @default(0) @map("current_round")
  totalRounds           Int?      @map("total_rounds")
  maxParticipants       Int?      @map("max_participants")
  participantCount      Int       @default(0) @map("participant_count")
  bracketData           Json?     @map("bracket_data")
  rules                 String?
  prizeInfo             String?   @map("prize_info")
  startDate             DateTime? @map("start_date")
  endDate               DateTime? @map("end_date")
  registrationDeadline  DateTime? @map("registration_deadline")
  createdAt             DateTime  @default(now()) @map("created_at")
  updatedAt             DateTime  @updatedAt @map("updated_at")
  
  gameType    GameType          @relation(fields: [gameTypeId], references: [id])
  organizer   User              @relation(fields: [organizerId], references: [id])
  matches     Match[]
  entries     TournamentEntry[]
  
  @@map("Tournament")
}

model TournamentEntry {
  id            String    @id @default(uuid())
  tournamentId  String    @map("tournament_id")
  playerId      String    @map("player_id")
  seed          Int?
  status        String    @default("registered")
  placement     Int?
  matchesWon    Int       @default(0) @map("matches_won")
  matchesLost   Int       @default(0) @map("matches_lost")
  roundsWon     Int       @default(0) @map("rounds_won")
  roundsLost    Int       @default(0) @map("rounds_lost")
  registeredAt  DateTime  @default(now()) @map("registered_at")
  eliminatedAt  DateTime? @map("eliminated_at")
  
  tournament Tournament @relation(fields: [tournamentId], references: [id], onDelete: Cascade)
  player     Player     @relation(fields: [playerId], references: [id])
  
  @@unique([tournamentId, playerId])
  @@unique([tournamentId, seed])
  @@map("TournamentEntry")
}

model PlayerStatistics {
  id                   String   @id @default(uuid())
  playerId             String   @map("player_id")
  gameTypeId           String   @map("game_type_id")
  totalMatches         Int      @default(0) @map("total_matches")
  matchesWon           Int      @default(0) @map("matches_won")
  matchesLost          Int      @default(0) @map("matches_lost")
  matchesTied          Int      @default(0) @map("matches_tied")
  winRate              Decimal? @map("win_rate") @db.Decimal(5, 2)
  currentWinStreak     Int      @default(0) @map("current_win_streak")
  longestWinStreak     Int      @default(0) @map("longest_win_streak")
  totalRounds          Int      @default(0) @map("total_rounds")
  roundsWon            Int      @default(0) @map("rounds_won")
  roundsLost           Int      @default(0) @map("rounds_lost")
  roundsTied           Int      @default(0) @map("rounds_tied")
  moveStats            Json     @default("{}") @map("move_stats")
  avgMoveTimeMs        Int?     @map("avg_move_time_ms")
  fastestMoveMs        Int?     @map("fastest_move_ms")
  opponentStats        Json     @default("{}") @map("opponent_stats")
  tournamentsEntered   Int      @default(0) @map("tournaments_entered")
  tournamentsWon       Int      @default(0) @map("tournaments_won")
  lastMatchAt          DateTime? @map("last_match_at")
  updatedAt            DateTime @updatedAt @map("updated_at")
  
  player   Player   @relation(fields: [playerId], references: [id], onDelete: Cascade)
  gameType GameType @relation(fields: [gameTypeId], references: [id])
  
  @@unique([playerId, gameTypeId])
  @@map("PlayerStatistics")
}

model Achievement {
  id              String   @id @default(uuid())
  playerId        String   @map("player_id")
  achievementType String   @map("achievement_type")
  name            String
  description     String?
  iconUrl         String?  @map("icon_url")
  rarity          String   @default("common")
  earnedAt        DateTime @default(now()) @map("earned_at")
  
  player Player @relation(fields: [playerId], references: [id], onDelete: Cascade)
  
  @@unique([playerId, achievementType])
  @@map("Achievement")
}

model Session {
  id           String   @id @default(uuid())
  userId       String   @map("user_id")
  refreshToken String   @unique @map("refresh_token")
  deviceInfo   Json?    @map("device_info")
  ipAddress    String?  @map("ip_address")
  userAgent    String?  @map("user_agent")
  isActive     Boolean  @default(true) @map("is_active")
  expiresAt    DateTime @map("expires_at")
  lastUsedAt   DateTime @default(now()) @map("last_used_at")
  createdAt    DateTime @default(now()) @map("created_at")
  
  user User @relation(fields: [userId], references: [id], onDelete: Cascade)
  
  @@map("Session")
}
```

---

## 9. Data Migration Strategy

### 9.1 Initial Migration
```bash
# Create initial migration
npx prisma migrate dev --name init

# Generate Prisma client
npx prisma generate
```

### 9.2 Seed Data
```typescript
// prisma/seed.ts
import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
  // Create default game type
  const classicRPS = await prisma.gameType.create({
    data: {
      name: 'Classic RPS',
      description: 'Traditional Rock, Paper, Scissors',
      symbolCount: 3,
      isDefault: true,
      symbols: [
        { id: 'rock', name: 'Rock', emoji: '🪨' },
        { id: 'paper', name: 'Paper', emoji: '📄' },
        { id: 'scissors', name: 'Scissors', emoji: '✂️' }
      ],
      winMatrix: {
        rock: ['scissors'],
        paper: ['rock'],
        scissors: ['paper']
      }
    }
  });
  
  console.log('Seeded default game type:', classicRPS);
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
```

---

## 10. Backup & Recovery

### 10.1 Backup Strategy
- **Full backups**: Daily at 2 AM UTC
- **Incremental backups**: Every 6 hours
- **Retention**: 30 days
- **Storage**: S3 with cross-region replication

### 10.2 Recovery Procedures
```bash
# Restore from backup
pg_restore -h localhost -p 5432 -U postgres -d rps_db backup_file.dump

# Point-in-time recovery
pg_restore --before="2025-11-22 10:00:00"
```

---

## 11. Performance Considerations

### 11.1 Query Optimization
- Use EXPLAIN ANALYZE for slow queries
- Add indexes based on query patterns
- Use connection pooling (100 connections)
- Implement query result caching

### 11.2 Data Archiving
- Archive completed tournaments older than 1 year
- Move inactive players to archive table
- Maintain statistics in separate analytics database

---

**Document Approval:**
- [ ] Database Administrator
- [ ] Backend Lead
- [ ] Technical Lead

---

END OF DOCUMENT

