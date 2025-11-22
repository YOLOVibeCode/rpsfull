# Historical Data & Analytics Specification
## RPSFull Tournament Platform - Complete Historical Fidelity

**Document Version:** 1.1  
**Last Updated:** November 22, 2025  
**Status:** Draft  
**Repository:** https://github.com/YOLOVibeCode/rpsfull.git  

---

## 1. Overview

### 1.1 Historical Fidelity Principle

**Core Requirement:** Every action, move, match, and interaction must be permanently recorded with complete historical fidelity. No data deletion (only soft deletes). Full audit trail of all player activities.

### 1.2 Data Retention Goals

1. **Permanent Match Records**: All matches and rounds preserved forever
2. **Player Move History**: Every single move recorded with timestamp
3. **Opponent Tracking**: Complete history of who played against whom
4. **Performance Timeline**: Track player evolution over time
5. **Statistical Analysis**: Enable deep analytics and insights
6. **Audit Trail**: Full accountability and transparency

---

## 2. Historical Data Architecture

### 2.1 Data Granularity Levels

**Level 1: Round-Level Data (Finest Granularity)**
```
Every individual throw is recorded:
- Exact move (rock/paper/scissors)
- Timestamp (millisecond precision)
- Time taken to make move
- Result (win/loss/tie)
- Match context
- Game state at that moment
```

**Level 2: Match-Level Data**
```
Complete match records:
- All rounds within match
- Match metadata
- Players involved
- Final outcome
- Duration
- Tournament context (if applicable)
```

**Level 3: Player-Level Historical Aggregates**
```
Career statistics:
- Lifetime performance
- Opponent-specific history
- Time-series trends
- Achievement milestones
- Ranking changes over time
```

### 2.2 Historical Database Schema Enhancements

#### 2.2.1 Round History (Already Comprehensive)

```sql
CREATE TABLE "Round" (
    id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    match_id            UUID NOT NULL REFERENCES "Match"(id) ON DELETE CASCADE,
    round_number        INTEGER NOT NULL,
    
    -- HISTORICAL FIDELITY: Every move recorded
    player1_move        VARCHAR(50) NOT NULL,  -- Required, never null after completion
    player2_move        VARCHAR(50) NOT NULL,  -- Required, never null after completion
    result              VARCHAR(50) NOT NULL,
    winner_id           UUID REFERENCES "Player"(id),
    
    -- TIMING DATA: Precise timestamps
    player1_move_time   TIMESTAMP,  -- When player 1 submitted move
    player2_move_time   TIMESTAMP,  -- When player 2 submitted move
    player1_time_ms     INTEGER,    -- Time taken to decide (milliseconds)
    player2_time_ms     INTEGER,    -- Time taken to decide (milliseconds)
    
    -- METADATA
    round_completed_at  TIMESTAMP,  -- When round finished
    timestamp           TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    -- GAME STATE SNAPSHOT
    game_state          JSONB,  -- Complete state at time of round
    
    CONSTRAINT chk_positive_round_number CHECK (round_number > 0),
    CONSTRAINT chk_valid_result CHECK (
        result IN ('player1_win', 'player2_win', 'tie')
    ),
    UNIQUE(match_id, round_number)
);

-- Indexes for historical queries
CREATE INDEX idx_round_match ON "Round"(match_id, round_number);
CREATE INDEX idx_round_timestamp ON "Round"(timestamp DESC);
CREATE INDEX idx_round_player_moves ON "Round"(player1_move, player2_move);
CREATE INDEX idx_round_winner ON "Round"(winner_id, timestamp DESC);
```

#### 2.2.2 Match History (Enhanced)

```sql
CREATE TABLE "Match" (
    id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    player1_id          UUID NOT NULL REFERENCES "Player"(id),
    player2_id          UUID NOT NULL REFERENCES "Player"(id),
    game_type_id        UUID NOT NULL REFERENCES "GameType"(id),
    tournament_id       UUID REFERENCES "Tournament"(id),
    
    -- MATCH CONFIGURATION (Historical record of settings)
    match_format        VARCHAR(50) NOT NULL DEFAULT 'best_of_3',
    best_of_n           INTEGER NOT NULL DEFAULT 3,
    ties_count          BOOLEAN DEFAULT FALSE,
    play_mode           VARCHAR(50) NOT NULL DEFAULT 'digital',
    
    -- MATCH OUTCOME
    status              VARCHAR(50) NOT NULL DEFAULT 'pending',
    winner_id           UUID REFERENCES "Player"(id),
    player1_score       INTEGER DEFAULT 0,
    player2_score       INTEGER DEFAULT 0,
    total_rounds        INTEGER DEFAULT 0,
    
    -- TIMING DATA
    duration_seconds    INTEGER,
    started_at          TIMESTAMP,
    completed_at        TIMESTAMP,
    created_at          TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at          TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    -- LOCATION DATA (Optional)
    ip_address          VARCHAR(45),
    user_agent          TEXT,
    location_data       JSONB,  -- Geolocation if available
    
    -- NEVER DELETE - Soft delete only
    deleted_at          TIMESTAMP NULL,
    
    CONSTRAINT chk_different_players CHECK (player1_id != player2_id),
    CONSTRAINT chk_valid_best_of_n CHECK (best_of_n > 0 AND best_of_n % 2 = 1)
);

-- Comprehensive historical indexes
CREATE INDEX idx_match_player1_history ON "Match"(player1_id, created_at DESC) WHERE deleted_at IS NULL;
CREATE INDEX idx_match_player2_history ON "Match"(player2_id, created_at DESC) WHERE deleted_at IS NULL;
CREATE INDEX idx_match_completed ON "Match"(completed_at DESC) WHERE status = 'completed' AND deleted_at IS NULL;
CREATE INDEX idx_match_players_pair ON "Match"(player1_id, player2_id) WHERE deleted_at IS NULL;
```

#### 2.2.3 Player Historical Statistics (Time-Series)

```sql
CREATE TABLE "PlayerStatisticsSnapshot" (
    id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    player_id           UUID NOT NULL REFERENCES "Player"(id),
    game_type_id        UUID NOT NULL REFERENCES "GameType"(id),
    
    -- SNAPSHOT DATE
    snapshot_date       DATE NOT NULL,
    snapshot_type       VARCHAR(50) NOT NULL,  -- 'daily', 'weekly', 'monthly', 'milestone'
    
    -- STATS AT THIS POINT IN TIME
    total_matches       INTEGER NOT NULL,
    matches_won         INTEGER NOT NULL,
    matches_lost        INTEGER NOT NULL,
    win_rate            DECIMAL(5,2),
    ranking             INTEGER,
    level               INTEGER,
    
    -- MOVE STATISTICS
    move_stats          JSONB NOT NULL,
    
    -- TRENDS
    matches_this_period INTEGER,
    win_rate_change     DECIMAL(5,2),
    ranking_change      INTEGER,
    
    created_at          TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    UNIQUE(player_id, game_type_id, snapshot_date, snapshot_type)
);

CREATE INDEX idx_player_stats_history ON "PlayerStatisticsSnapshot"(player_id, snapshot_date DESC);
CREATE INDEX idx_player_stats_period ON "PlayerStatisticsSnapshot"(snapshot_type, snapshot_date DESC);
```

#### 2.2.4 Player Match History (Denormalized for Fast Queries)

```sql
CREATE TABLE "PlayerMatchHistory" (
    id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    player_id           UUID NOT NULL REFERENCES "Player"(id),
    opponent_id         UUID NOT NULL REFERENCES "Player"(id),
    match_id            UUID NOT NULL REFERENCES "Match"(id),
    
    -- MATCH SUMMARY
    result              VARCHAR(10) NOT NULL,  -- 'win', 'loss', 'tie'
    player_score        INTEGER NOT NULL,
    opponent_score      INTEGER NOT NULL,
    total_rounds        INTEGER NOT NULL,
    
    -- MOVE BREAKDOWN
    moves_used          JSONB NOT NULL,  -- {"rock": 3, "paper": 2, "scissors": 1}
    moves_won           JSONB NOT NULL,  -- {"rock": 2, "paper": 1, "scissors": 0}
    
    -- PERFORMANCE METRICS
    avg_move_time_ms    INTEGER,
    fastest_move_ms     INTEGER,
    
    -- CONTEXT
    game_type_id        UUID NOT NULL,
    tournament_id       UUID,
    played_at           TIMESTAMP NOT NULL,
    
    -- NEVER DELETE
    created_at          TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    CONSTRAINT chk_valid_result CHECK (result IN ('win', 'loss', 'tie'))
);

CREATE INDEX idx_player_history_player ON "PlayerMatchHistory"(player_id, played_at DESC);
CREATE INDEX idx_player_history_opponent ON "PlayerMatchHistory"(player_id, opponent_id, played_at DESC);
CREATE INDEX idx_player_history_game_type ON "PlayerMatchHistory"(player_id, game_type_id, played_at DESC);
```

#### 2.2.5 Opponent Head-to-Head History

```sql
CREATE TABLE "OpponentHistory" (
    id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    player_id           UUID NOT NULL REFERENCES "Player"(id),
    opponent_id         UUID NOT NULL REFERENCES "Player"(id),
    game_type_id        UUID NOT NULL REFERENCES "GameType"(id),
    
    -- AGGREGATED STATS
    total_matches       INTEGER DEFAULT 0,
    wins                INTEGER DEFAULT 0,
    losses              INTEGER DEFAULT 0,
    ties                INTEGER DEFAULT 0,
    
    -- MOVE BREAKDOWN AGAINST THIS OPPONENT
    move_stats          JSONB DEFAULT '{}',
    -- Example: {"rock": {"used": 10, "won": 6}, "paper": {...}}
    
    -- OPPONENT'S TENDENCIES
    opponent_move_freq  JSONB DEFAULT '{}',
    -- Example: {"rock": 15, "paper": 12, "scissors": 13}
    
    -- TIMELINE
    first_match_date    TIMESTAMP,
    last_match_date     TIMESTAMP,
    longest_win_streak  INTEGER DEFAULT 0,
    current_streak      INTEGER DEFAULT 0,  -- Positive = winning, Negative = losing
    
    -- PERFORMANCE TRENDS
    recent_win_rate     DECIMAL(5,2),  -- Last 10 matches
    overall_win_rate    DECIMAL(5,2),
    
    updated_at          TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    UNIQUE(player_id, opponent_id, game_type_id)
);

CREATE INDEX idx_opponent_history_player ON "OpponentHistory"(player_id, last_match_date DESC);
CREATE INDEX idx_opponent_history_matchup ON "OpponentHistory"(player_id, opponent_id);
```

#### 2.2.6 Player Action Audit Log

```sql
CREATE TABLE "PlayerAuditLog" (
    id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    player_id           UUID REFERENCES "Player"(id),
    user_id             UUID REFERENCES "User"(id),
    
    -- ACTION DETAILS
    action_type         VARCHAR(100) NOT NULL,  -- 'match_created', 'move_made', 'tournament_joined', etc.
    action_data         JSONB NOT NULL,
    
    -- CONTEXT
    match_id            UUID REFERENCES "Match"(id),
    tournament_id       UUID REFERENCES "Tournament"(id),
    round_id            UUID REFERENCES "Round"(id),
    
    -- METADATA
    ip_address          VARCHAR(45),
    user_agent          TEXT,
    session_id          VARCHAR(255),
    
    -- NEVER DELETE OR MODIFY
    created_at          TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    -- Prevent updates
    CONSTRAINT no_updates CHECK (created_at IS NOT NULL)
);

CREATE INDEX idx_audit_player ON "PlayerAuditLog"(player_id, created_at DESC);
CREATE INDEX idx_audit_action ON "PlayerAuditLog"(action_type, created_at DESC);
CREATE INDEX idx_audit_match ON "PlayerAuditLog"(match_id) WHERE match_id IS NOT NULL;
```

#### 2.2.7 System Events Log

```sql
CREATE TABLE "SystemEventLog" (
    id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    event_type          VARCHAR(100) NOT NULL,
    event_category      VARCHAR(50) NOT NULL,  -- 'match', 'tournament', 'user', 'system'
    
    -- EVENT DATA
    event_data          JSONB NOT NULL,
    severity            VARCHAR(20) DEFAULT 'info',  -- 'info', 'warning', 'error', 'critical'
    
    -- RELATIONSHIPS
    user_id             UUID REFERENCES "User"(id),
    player_id           UUID REFERENCES "Player"(id),
    match_id            UUID REFERENCES "Match"(id),
    tournament_id       UUID REFERENCES "Tournament"(id),
    
    -- IMMUTABLE TIMESTAMP
    created_at          TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    CONSTRAINT no_updates CHECK (created_at IS NOT NULL)
);

CREATE INDEX idx_system_events_type ON "SystemEventLog"(event_type, created_at DESC);
CREATE INDEX idx_system_events_category ON "SystemEventLog"(event_category, created_at DESC);
CREATE INDEX idx_system_events_severity ON "SystemEventLog"(severity, created_at DESC);
```

---

## 3. Historical Data Capture

### 3.1 Round-Level Data Capture

**Every Single Move Recorded:**

```typescript
// When a move is made
interface RoundDataCapture {
  matchId: string;
  roundNumber: number;
  playerId: string;
  move: string;
  moveTimestamp: Date;
  timeTakenMs: number;
  
  // Context at time of move
  matchState: {
    currentScore: { player1: number; player2: number };
    roundsPlayed: number;
    gameType: string;
  };
  
  // Client metadata
  clientTimestamp: Date;
  userAgent: string;
  ipAddress: string;
}
```

### 3.2 Match Lifecycle Events

**Track Complete Match History:**

```typescript
// Match lifecycle events to log
enum MatchEvent {
  CREATED = 'match_created',
  PLAYER_JOINED = 'player_joined',
  STARTED = 'match_started',
  ROUND_STARTED = 'round_started',
  MOVE_SUBMITTED = 'move_submitted',
  ROUND_COMPLETED = 'round_completed',
  MATCH_COMPLETED = 'match_completed',
  MATCH_CANCELLED = 'match_cancelled',
}

// Event logging
interface MatchEventLog {
  eventType: MatchEvent;
  matchId: string;
  timestamp: Date;
  data: Record<string, any>;
}
```

### 3.3 Player Activity Tracking

**Complete Player Action History:**

```typescript
// All player actions logged
enum PlayerAction {
  // Account
  REGISTERED = 'player_registered',
  LOGIN = 'player_login',
  LOGOUT = 'player_logout',
  PROFILE_UPDATED = 'profile_updated',
  
  // Matches
  MATCH_CREATED = 'match_created',
  MATCH_JOINED = 'match_joined',
  MOVE_MADE = 'move_made',
  MATCH_COMPLETED = 'match_completed',
  MATCH_ABANDONED = 'match_abandoned',
  
  // Tournaments
  TOURNAMENT_REGISTERED = 'tournament_registered',
  TOURNAMENT_MATCH_PLAYED = 'tournament_match_played',
  TOURNAMENT_COMPLETED = 'tournament_completed',
  
  // Social
  ACHIEVEMENT_EARNED = 'achievement_earned',
  RANK_CHANGED = 'rank_changed',
  LEVEL_UP = 'level_up',
}
```

---

## 4. Historical Query Patterns

### 4.1 Player Complete History

```sql
-- Get complete history for a player
SELECT 
    m.id as match_id,
    m.created_at,
    m.completed_at,
    CASE 
        WHEN m.player1_id = $1 THEN p2.name
        ELSE p1.name
    END as opponent_name,
    CASE
        WHEN m.winner_id = $1 THEN 'WIN'
        WHEN m.winner_id IS NULL THEN 'TIE'
        ELSE 'LOSS'
    END as result,
    m.player1_score,
    m.player2_score,
    array_agg(
        json_build_object(
            'round', r.round_number,
            'my_move', CASE WHEN m.player1_id = $1 THEN r.player1_move ELSE r.player2_move END,
            'opponent_move', CASE WHEN m.player1_id = $1 THEN r.player2_move ELSE r.player1_move END,
            'result', r.result,
            'timestamp', r.timestamp
        ) ORDER BY r.round_number
    ) as rounds
FROM "Match" m
JOIN "Player" p1 ON m.player1_id = p1.id
JOIN "Player" p2 ON m.player2_id = p2.id
LEFT JOIN "Round" r ON r.match_id = m.id
WHERE (m.player1_id = $1 OR m.player2_id = $1)
  AND m.deleted_at IS NULL
  AND m.status = 'completed'
GROUP BY m.id, p1.name, p2.name
ORDER BY m.completed_at DESC;
```

### 4.2 Move Pattern Analysis

```sql
-- Analyze player's move patterns over time
SELECT 
    DATE_TRUNC('week', r.timestamp) as week,
    CASE 
        WHEN m.player1_id = $1 THEN r.player1_move 
        ELSE r.player2_move 
    END as move_used,
    COUNT(*) as times_used,
    SUM(CASE 
        WHEN (m.player1_id = $1 AND r.result = 'player1_win') OR
             (m.player2_id = $1 AND r.result = 'player2_win')
        THEN 1 ELSE 0 
    END) as times_won,
    ROUND(
        100.0 * SUM(CASE 
            WHEN (m.player1_id = $1 AND r.result = 'player1_win') OR
                 (m.player2_id = $1 AND r.result = 'player2_win')
            THEN 1 ELSE 0 
        END) / COUNT(*),
        2
    ) as win_rate
FROM "Round" r
JOIN "Match" m ON r.match_id = m.id
WHERE (m.player1_id = $1 OR m.player2_id = $1)
  AND m.deleted_at IS NULL
GROUP BY week, move_used
ORDER BY week DESC, move_used;
```

### 4.3 Opponent-Specific History

```sql
-- Complete history against specific opponent
SELECT 
    m.created_at,
    m.completed_at,
    CASE 
        WHEN m.winner_id = $1 THEN 'WIN'
        WHEN m.winner_id = $2 THEN 'LOSS'
        ELSE 'TIE'
    END as result,
    json_agg(
        json_build_object(
            'round', r.round_number,
            'player_move', CASE WHEN m.player1_id = $1 THEN r.player1_move ELSE r.player2_move END,
            'opponent_move', CASE WHEN m.player1_id = $1 THEN r.player2_move ELSE r.player1_move END,
            'winner', CASE 
                WHEN (m.player1_id = $1 AND r.result = 'player1_win') OR
                     (m.player2_id = $1 AND r.result = 'player2_win')
                THEN 'player'
                WHEN r.result = 'tie' THEN 'tie'
                ELSE 'opponent'
            END
        ) ORDER BY r.round_number
    ) as round_details
FROM "Match" m
JOIN "Round" r ON r.match_id = m.id
WHERE ((m.player1_id = $1 AND m.player2_id = $2) OR 
       (m.player1_id = $2 AND m.player2_id = $1))
  AND m.deleted_at IS NULL
  AND m.status = 'completed'
GROUP BY m.id
ORDER BY m.completed_at DESC;
```

### 4.4 Performance Timeline

```sql
-- Player performance over time
SELECT 
    DATE_TRUNC('month', m.completed_at) as month,
    COUNT(*) as total_matches,
    SUM(CASE WHEN m.winner_id = $1 THEN 1 ELSE 0 END) as wins,
    ROUND(
        100.0 * SUM(CASE WHEN m.winner_id = $1 THEN 1 ELSE 0 END) / COUNT(*),
        2
    ) as win_rate,
    AVG(m.duration_seconds) as avg_duration,
    AVG(CASE 
        WHEN m.player1_id = $1 THEN m.player1_score 
        ELSE m.player2_score 
    END) as avg_score
FROM "Match" m
WHERE (m.player1_id = $1 OR m.player2_id = $1)
  AND m.deleted_at IS NULL
  AND m.status = 'completed'
GROUP BY month
ORDER BY month DESC;
```

---

## 5. Analytics & Insights

### 5.1 Advanced Analytics Queries

#### 5.1.1 Move Predictability Analysis

```sql
-- Analyze if player has predictable patterns
WITH player_sequences AS (
    SELECT 
        m.id,
        r.round_number,
        CASE WHEN m.player1_id = $1 THEN r.player1_move ELSE r.player2_move END as move,
        LAG(CASE WHEN m.player1_id = $1 THEN r.player1_move ELSE r.player2_move END, 1) 
            OVER (PARTITION BY m.id ORDER BY r.round_number) as prev_move,
        LAG(CASE WHEN m.player1_id = $1 THEN r.player1_move ELSE r.player2_move END, 2) 
            OVER (PARTITION BY m.id ORDER BY r.round_number) as prev_move_2
    FROM "Round" r
    JOIN "Match" m ON r.match_id = m.id
    WHERE (m.player1_id = $1 OR m.player2_id = $1)
      AND m.deleted_at IS NULL
)
SELECT 
    prev_move,
    prev_move_2,
    move as next_move,
    COUNT(*) as occurrences,
    ROUND(100.0 * COUNT(*) / SUM(COUNT(*)) OVER (PARTITION BY prev_move, prev_move_2), 2) as probability
FROM player_sequences
WHERE prev_move IS NOT NULL AND prev_move_2 IS NOT NULL
GROUP BY prev_move, prev_move_2, move
ORDER BY prev_move, prev_move_2, occurrences DESC;
```

#### 5.1.2 Clutch Performance

```sql
-- Analyze performance in critical moments (close matches)
SELECT 
    CASE 
        WHEN ABS(m.player1_score - m.player2_score) <= 1 THEN 'Close Match'
        ELSE 'Decisive Match'
    END as match_type,
    COUNT(*) as matches,
    SUM(CASE WHEN m.winner_id = $1 THEN 1 ELSE 0 END) as wins,
    ROUND(
        100.0 * SUM(CASE WHEN m.winner_id = $1 THEN 1 ELSE 0 END) / COUNT(*),
        2
    ) as win_rate
FROM "Match" m
WHERE (m.player1_id = $1 OR m.player2_id = $1)
  AND m.deleted_at IS NULL
  AND m.status = 'completed'
GROUP BY match_type;
```

#### 5.1.3 Peak Performance Times

```sql
-- When does player perform best?
SELECT 
    EXTRACT(HOUR FROM m.created_at) as hour_of_day,
    EXTRACT(DOW FROM m.created_at) as day_of_week,
    COUNT(*) as matches,
    ROUND(
        100.0 * SUM(CASE WHEN m.winner_id = $1 THEN 1 ELSE 0 END) / COUNT(*),
        2
    ) as win_rate
FROM "Match" m
WHERE (m.player1_id = $1 OR m.player2_id = $1)
  AND m.deleted_at IS NULL
  AND m.status = 'completed'
GROUP BY hour_of_day, day_of_week
HAVING COUNT(*) >= 5  -- Minimum matches for statistical relevance
ORDER BY win_rate DESC;
```

### 5.2 Historical Trend Analysis

```typescript
// Service to analyze trends
interface TrendAnalysis {
  player_id: string;
  period: 'daily' | 'weekly' | 'monthly';
  metrics: {
    win_rate_trend: number[];  // Array of win rates over time
    ranking_trend: number[];
    activity_trend: number[];  // Matches per period
    move_preference_evolution: {
      period: Date;
      preferences: Record<string, number>;
    }[];
  };
}
```

---

## 6. Data Export & Reporting

### 6.1 Player Data Export

**Complete Historical Export:**

```typescript
interface PlayerHistoricalExport {
  player: {
    id: string;
    name: string;
    registeredAt: Date;
  };
  
  summary: {
    totalMatches: number;
    totalRounds: number;
    totalMoves: number;
    winRate: number;
    favoriteMove: string;
  };
  
  matches: Array<{
    matchId: string;
    date: Date;
    opponent: string;
    result: 'win' | 'loss' | 'tie';
    score: string;
    rounds: Array<{
      roundNumber: number;
      myMove: string;
      opponentMove: string;
      result: string;
      timestamp: Date;
    }>;
  }>;
  
  statistics: {
    byMove: Record<string, MoveStats>;
    byOpponent: Record<string, OpponentStats>;
    timeline: TimelineStats[];
  };
  
  exportedAt: Date;
  dataVersion: string;
}
```

### 6.2 Export Formats

```typescript
// Export service
class HistoricalDataExportService {
  async exportPlayerHistory(
    playerId: string, 
    format: 'json' | 'csv' | 'pdf'
  ): Promise<Buffer> {
    // Generate export in requested format
  }
  
  async exportMatchDetails(
    matchId: string,
    includeRoundDetails: boolean = true
  ): Promise<MatchExport> {
    // Export complete match data
  }
  
  async exportTournamentHistory(
    tournamentId: string
  ): Promise<TournamentExport> {
    // Export all tournament data
  }
}
```

---

## 7. Data Retention & Archival

### 7.1 Data Retention Policy

**Retention Rules:**

1. **Active Data (Hot Storage)**
   - Last 12 months of matches
   - Current statistics
   - Active tournaments
   - Storage: Primary PostgreSQL

2. **Archived Data (Warm Storage)**
   - 1-5 years old matches
   - Historical statistics
   - Completed tournaments
   - Storage: Compressed PostgreSQL or TimescaleDB

3. **Long-term Archive (Cold Storage)**
   - 5+ years old
   - Compressed and encrypted
   - Storage: S3 Glacier or similar
   - Still queryable but slower

**No Deletion Policy:**
- Matches: NEVER deleted (soft delete only)
- Rounds: NEVER deleted
- Player data: Soft delete only (GDPR compliance)
- Audit logs: NEVER deleted or modified

### 7.2 Archival Strategy

```sql
-- Archive old matches to separate partition
CREATE TABLE "Match_Archive" (
    LIKE "Match" INCLUDING ALL
) PARTITION BY RANGE (completed_at);

-- Create partitions by year
CREATE TABLE "Match_Archive_2025" 
    PARTITION OF "Match_Archive" 
    FOR VALUES FROM ('2025-01-01') TO ('2026-01-01');

-- Move old data to archive
INSERT INTO "Match_Archive" 
SELECT * FROM "Match" 
WHERE completed_at < NOW() - INTERVAL '1 year'
  AND status = 'completed';
```

---

## 8. Privacy & Compliance

### 8.1 GDPR Compliance

**Right to Access:**
```typescript
// User can request all their data
async function generateGDPRExport(userId: string): Promise<GDPRExport> {
  return {
    personalData: await getUserPersonalData(userId),
    matchHistory: await getUserMatchHistory(userId),
    statistics: await getUserStatistics(userId),
    auditLog: await getUserAuditLog(userId),
    exportDate: new Date(),
  };
}
```

**Right to Erasure:**
```typescript
// Soft delete with anonymization
async function anonymizeUserData(userId: string): Promise<void> {
  // Replace personal data with anonymized values
  await db.user.update({
    where: { id: userId },
    data: {
      email: `deleted_${userId}@anonymized.local`,
      name: 'Deleted User',
      deletedAt: new Date(),
    },
  });
  
  // Keep match history but anonymize
  await db.player.update({
    where: { userId },
    data: {
      name: 'Anonymous Player',
      email: null,
      avatarUrl: null,
      bio: null,
      deletedAt: new Date(),
    },
  });
  
  // Match and round history preserved for opponent's records
}
```

### 8.2 Data Access Controls

```typescript
// Who can access historical data
enum DataAccessLevel {
  OWN_DATA = 'own_data',           // Player's own history
  OPPONENT_SUMMARY = 'opponent_summary',  // Limited opponent data
  PUBLIC_STATS = 'public_stats',   // Leaderboards, aggregates
  ADMIN_FULL = 'admin_full',       // Admin access
}
```

---

## 9. Performance Optimization

### 9.1 Indexing Strategy

```sql
-- Composite indexes for common queries
CREATE INDEX idx_match_player_date 
ON "Match"(player1_id, completed_at DESC) 
WHERE status = 'completed' AND deleted_at IS NULL;

CREATE INDEX idx_match_player2_date 
ON "Match"(player2_id, completed_at DESC) 
WHERE status = 'completed' AND deleted_at IS NULL;

-- Partial indexes for active data
CREATE INDEX idx_match_recent 
ON "Match"(completed_at DESC) 
WHERE completed_at > NOW() - INTERVAL '6 months';

-- Covering index for common queries
CREATE INDEX idx_match_history_covering 
ON "Match"(player1_id, player2_id, completed_at, winner_id, player1_score, player2_score)
WHERE status = 'completed' AND deleted_at IS NULL;
```

### 9.2 Query Optimization

```typescript
// Use materialized views for expensive aggregations
CREATE MATERIALIZED VIEW player_monthly_stats AS
SELECT 
    player_id,
    DATE_TRUNC('month', completed_at) as month,
    COUNT(*) as matches,
    SUM(CASE WHEN winner_id = player_id THEN 1 ELSE 0 END) as wins,
    AVG(duration_seconds) as avg_duration
FROM (
    SELECT player1_id as player_id, winner_id, duration_seconds, completed_at 
    FROM "Match" WHERE status = 'completed'
    UNION ALL
    SELECT player2_id as player_id, winner_id, duration_seconds, completed_at 
    FROM "Match" WHERE status = 'completed'
) matches
GROUP BY player_id, month;

-- Refresh periodically
CREATE INDEX ON player_monthly_stats(player_id, month DESC);
REFRESH MATERIALIZED VIEW CONCURRENTLY player_monthly_stats;
```

---

## 10. API Endpoints for Historical Data

### 10.1 Player History Endpoints

```typescript
// GET /api/v1/players/{playerId}/history
interface PlayerHistoryQuery {
  startDate?: string;
  endDate?: string;
  opponent?: string;
  gameType?: string;
  limit?: number;
  page?: number;
}

// GET /api/v1/players/{playerId}/statistics/timeline
interface TimelineQuery {
  period: 'daily' | 'weekly' | 'monthly';
  startDate: string;
  endDate: string;
  metric: 'win_rate' | 'matches' | 'ranking';
}

// GET /api/v1/players/{playerId}/opponents/{opponentId}/history
// Complete head-to-head history

// GET /api/v1/players/{playerId}/moves/analysis
// Move pattern analysis

// GET /api/v1/players/{playerId}/export
// Full data export
```

---

## 11. Real-time Historical Updates

### 11.1 WebSocket Events for History

```typescript
// Subscribe to player history updates
socket.on('player:history-updated', (data: {
  playerId: string;
  matchId: string;
  newStats: PlayerStatistics;
}) => {
  // Update UI with new historical data
});

// Subscribe to achievement unlocks
socket.on('player:achievement-earned', (data: {
  playerId: string;
  achievement: Achievement;
  earnedAt: Date;
}) => {
  // Show achievement notification
});
```

---

## 12. Monitoring & Alerts

### 12.1 Data Integrity Monitoring

```typescript
// Regular checks for data consistency
interface DataIntegrityCheck {
  check_name: string;
  last_run: Date;
  status: 'passed' | 'failed';
  issues_found: number;
}

// Examples:
// - Orphaned rounds (rounds without matches)
// - Inconsistent scores
// - Missing timestamps
// - Duplicate records
```

---

**Document Approval:**
- [ ] Technical Lead
- [ ] Database Architect
- [ ] Data Privacy Officer
- [ ] Backend Lead

---

END OF DOCUMENT

