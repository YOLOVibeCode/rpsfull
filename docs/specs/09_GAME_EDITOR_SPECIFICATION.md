# Game Editor & Custom Game Types Specification
## RPSFull Tournament Platform - Custom Game Creator

**Document Version:** 1.1  
**Last Updated:** November 22, 2025  
**Status:** Draft  
**Repository:** https://github.com/YOLOVibeCode/rpsfull.git  

---

## 1. Overview

### 1.1 Purpose

The Game Editor allows users to create custom game variants by:
- Defining custom symbols (beyond rock/paper/scissors)
- Creating win/loss relationships (what beats what)
- Setting game rules and scoring
- Testing and validating game balance
- Publishing and sharing custom games

### 1.2 Use Cases

**Example Custom Games:**
1. **Rock-Paper-Scissors-Lizard-Spock** (5 symbols)
2. **Elemental Battle** (Fire, Water, Earth, Air, Lightning)
3. **Fantasy RPS** (Dragon, Wizard, Knight, Archer)
4. **Tech Wars** (AI, Blockchain, Cloud, Quantum)
5. **Custom branded games** for marketing/events

### 1.3 User Roles

- **Game Creator**: Can create and edit game types
- **Game Moderator**: Can approve games for public use
- **Game Player**: Can play any published game
- **Admin**: Full control over game types

---

## 2. Game Theory Fundamentals

### 2.1 Valid Game Requirements

For a game to be balanced and playable:

1. **Odd Number of Symbols**: Must have odd number (3, 5, 7, etc.)
   - Ensures no ties in win matrix
   - Each symbol should beat exactly (n-1)/2 others

2. **Balanced Win Matrix**: Each symbol must:
   - Beat the same number of other symbols
   - Lose to the same number of other symbols
   - No symbol is universally stronger

3. **Transitive Relationships**: Avoid dominance chains
   - A beats B, B beats C, C beats A (good - circular)
   - A beats B, B beats C, A beats C (bad - linear hierarchy)

4. **No Contradictions**: 
   - If A beats B, then B cannot beat A
   - Each pair must have exactly one winner

### 2.2 Classic Examples

**Rock-Paper-Scissors (3 symbols):**
```
Rock defeats: Scissors
Paper defeats: Rock
Scissors defeats: Paper
```

**Rock-Paper-Scissors-Lizard-Spock (5 symbols):**
```
Rock defeats: Scissors, Lizard
Paper defeats: Rock, Spock
Scissors defeats: Paper, Lizard
Lizard defeats: Paper, Spock
Spock defeats: Rock, Scissors
```

---

## 3. Database Schema for Custom Games

### 3.1 GameType Table (Enhanced)

```sql
CREATE TABLE "GameType" (
    id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name                VARCHAR(100) NOT NULL UNIQUE,
    description         TEXT,
    
    -- Symbol Configuration
    symbol_count        INTEGER NOT NULL,
    symbols             JSONB NOT NULL,  -- Array of symbol definitions
    win_matrix          JSONB NOT NULL,  -- What beats what
    
    -- Game Rules
    tie_rules           VARCHAR(50) DEFAULT 'replay',
    scoring_method      VARCHAR(50) DEFAULT 'best_of_n',
    default_best_of_n   INTEGER DEFAULT 3,
    
    -- Visual Assets
    icon_set            JSONB,  -- URLs to symbol icons
    theme_colors        JSONB,  -- Color scheme for this game
    
    -- Status & Visibility
    is_active           BOOLEAN DEFAULT TRUE,
    is_default          BOOLEAN DEFAULT FALSE,
    is_official         BOOLEAN DEFAULT FALSE,  -- Official vs community
    is_public           BOOLEAN DEFAULT FALSE,  -- Public vs private
    requires_approval   BOOLEAN DEFAULT TRUE,
    
    -- Creator Info
    created_by          UUID REFERENCES "User"(id),
    approved_by         UUID REFERENCES "User"(id),
    approved_at         TIMESTAMP,
    
    -- Validation
    is_validated        BOOLEAN DEFAULT FALSE,
    validation_errors   JSONB,  -- Any balance issues detected
    
    -- Usage Stats
    total_matches       INTEGER DEFAULT 0,
    total_players       INTEGER DEFAULT 0,
    avg_rating          DECIMAL(3,2),
    
    -- Metadata
    tags                TEXT[],  -- e.g., ['fantasy', 'balanced', 'beginner']
    difficulty_level    VARCHAR(20),  -- 'beginner', 'intermediate', 'advanced'
    recommended_players VARCHAR(50),  -- Age rating, skill level
    
    -- Timestamps
    created_at          TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at          TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    published_at        TIMESTAMP,
    deleted_at          TIMESTAMP,
    
    -- Constraints
    CONSTRAINT chk_symbol_count_odd CHECK (symbol_count % 2 = 1),
    CONSTRAINT chk_symbol_count_range CHECK (symbol_count >= 3 AND symbol_count <= 15)
);

-- Indexes
CREATE INDEX idx_gametype_public ON "GameType"(is_public, is_active) WHERE deleted_at IS NULL;
CREATE INDEX idx_gametype_creator ON "GameType"(created_by, created_at DESC);
CREATE INDEX idx_gametype_tags ON "GameType" USING GIN(tags);
CREATE INDEX idx_gametype_popularity ON "GameType"(total_matches DESC) WHERE is_public = TRUE;
```

### 3.2 Symbol Definition Structure

```typescript
interface GameSymbol {
  id: string;              // Unique identifier (e.g., 'rock', 'paper')
  name: string;            // Display name
  description?: string;    // What this symbol represents
  emoji?: string;          // Unicode emoji
  iconUrl?: string;        // Custom SVG/image URL
  color?: string;          // Primary color for this symbol
  soundEffect?: string;    // Sound when selected
  animation?: string;      // Animation preset
  
  // Position in circular arrangement (for UI)
  displayOrder: number;
}

// Example:
const rockSymbol: GameSymbol = {
  id: 'rock',
  name: 'Rock',
  description: 'A solid rock that crushes scissors',
  emoji: '🪨',
  iconUrl: '/icons/rock.svg',
  color: '#6B7280',
  displayOrder: 0
};
```

### 3.3 Win Matrix Structure

```typescript
// Option 1: Adjacency List (what each symbol defeats)
interface WinMatrix {
  [symbolId: string]: string[];  // Array of defeated symbol IDs
}

// Example:
const classicRPSMatrix: WinMatrix = {
  rock: ['scissors'],
  paper: ['rock'],
  scissors: ['paper']
};

const rpslsMatrix: WinMatrix = {
  rock: ['scissors', 'lizard'],
  paper: ['rock', 'spock'],
  scissors: ['paper', 'lizard'],
  lizard: ['paper', 'spock'],
  spock: ['rock', 'scissors']
};

// Option 2: Full Matrix (more explicit, easier to validate)
interface FullWinMatrix {
  [symbolId: string]: {
    [opponentSymbolId: string]: 'win' | 'lose' | 'tie';
  };
}
```

### 3.4 Game Rating & Feedback

```sql
CREATE TABLE "GameTypeRating" (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    game_type_id    UUID NOT NULL REFERENCES "GameType"(id) ON DELETE CASCADE,
    user_id         UUID NOT NULL REFERENCES "User"(id),
    
    -- Rating
    rating          INTEGER NOT NULL,  -- 1-5 stars
    
    -- Feedback
    feedback        TEXT,
    is_balanced     BOOLEAN,  -- Does user think it's balanced?
    is_fun          BOOLEAN,  -- Is it fun to play?
    
    -- Context
    matches_played  INTEGER DEFAULT 0,  -- How many matches before rating
    
    created_at      TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at      TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    UNIQUE(game_type_id, user_id),
    CONSTRAINT chk_valid_rating CHECK (rating >= 1 AND rating <= 5)
);

CREATE INDEX idx_game_rating_game ON "GameTypeRating"(game_type_id, rating DESC);
```

---

## 4. Game Editor UI/UX

### 4.1 Editor Screen Layout

```
┌─────────────────────────────────────────────────────────┐
│  ← Back to Games    Game Editor                  [Save] │
├─────────────────────────────────────────────────────────┤
│                                                         │
│  Tabs: [Basic Info] [Symbols] [Rules] [Test] [Publish] │
│                                                         │
├─────────────────────────────────────────────────────────┤
│                                                         │
│  BASIC INFO TAB:                                       │
│                                                         │
│  Game Name: [_______________________________]          │
│  Description: [____________________________]           │
│              [____________________________]           │
│                                                         │
│  Number of Symbols: [⊖ 5 ⊕]                          │
│  (Must be odd: 3, 5, 7, 9, 11, 13, 15)              │
│                                                         │
│  Difficulty: ○ Beginner  ○ Intermediate  ○ Advanced   │
│                                                         │
│  Tags: [fantasy] [balanced] [+Add Tag]                │
│                                                         │
└─────────────────────────────────────────────────────────┘
```

### 4.2 Symbol Editor Tab

```
┌─────────────────────────────────────────────────────────┐
│  SYMBOLS TAB:                                          │
│                                                         │
│  ┌─────────────────────────────────────────────────┐   │
│  │  Symbol 1/5                              [×]    │   │
│  │  ┌─────────┐                                    │   │
│  │  │   🪨    │  Name: [Rock____________]         │   │
│  │  └─────────┘  Description: [Strong and solid_] │   │
│  │  [Upload Icon] or [Choose Emoji]               │   │
│  │  Color: [⬛ #6B7280]                          │   │
│  └─────────────────────────────────────────────────┘   │
│                                                         │
│  ┌─────────────────────────────────────────────────┐   │
│  │  Symbol 2/5                              [×]    │   │
│  │  ┌─────────┐                                    │   │
│  │  │   📄    │  Name: [Paper___________]         │   │
│  │  └─────────┘  Description: [Thin but covers__] │   │
│  │  ...                                            │   │
│  └─────────────────────────────────────────────────┘   │
│                                                         │
│  [+ Add Symbol]                                        │
│                                                         │
└─────────────────────────────────────────────────────────┘
```

### 4.3 Rules Editor Tab (Win Matrix)

```
┌─────────────────────────────────────────────────────────┐
│  RULES TAB: Define What Beats What                    │
│                                                         │
│  Visual Matrix Editor:                                 │
│                                                         │
│         🪨    📄    ✂️    🦎    🖖                    │
│  🪨    -     ✗     ✓     ✓     ✗                    │
│  📄    ✓     -     ✗     ✗     ✓                    │
│  ✂️    ✗     ✓     -     ✓     ✗                    │
│  🦎    ✗     ✓     ✗     -     ✓                    │
│  🖖    ✓     ✗     ✓     ✗     -                    │
│                                                         │
│  ✓ = Defeats  ✗ = Loses to  - = Same                 │
│                                                         │
│  OR Relationship Builder:                              │
│                                                         │
│  🪨 Rock defeats:                                      │
│  [×] Scissors  [×] Lizard  [ ] Paper  [ ] Spock       │
│                                                         │
│  Validation Status: ✅ Balanced (each beats 2 others) │
│                                                         │
│  [Auto-Balance] - Let AI suggest balanced matrix      │
│                                                         │
└─────────────────────────────────────────────────────────┘
```

### 4.4 Interactive Circular Designer

```
┌─────────────────────────────────────────────────────────┐
│  VISUAL DESIGNER: Circular Arrangement                │
│                                                         │
│               📄 Paper                                 │
│                 ↓                                      │
│           🪨 ← Center → ✂️                           │
│                 ↑                                      │
│          (Drag to reorder)                            │
│                                                         │
│  Click two symbols to create/remove relationship:     │
│  • Green line = defeats                                │
│  • Red line = defeated by                             │
│                                                         │
│  Current Relationships:                                │
│  🪨 → ✂️  (Rock defeats Scissors)                    │
│  📄 → 🪨  (Paper defeats Rock)                        │
│  ✂️ → 📄  (Scissors defeats Paper)                   │
│                                                         │
└─────────────────────────────────────────────────────────┘
```

### 4.5 Test Mode Tab

```
┌─────────────────────────────────────────────────────────┐
│  TEST TAB: Try Your Game                               │
│                                                         │
│  Play against AI to test balance:                     │
│                                                         │
│  ┌─────────────────────────────────────────────────┐   │
│  │         YOU: 2  vs  AI: 1                      │   │
│  │                                                 │   │
│  │  Select your move:                             │   │
│  │  [🪨]  [📄]  [✂️]  [🦎]  [🖖]              │   │
│  │                                                 │   │
│  │  Previous Rounds:                              │   │
│  │  Round 1: 🪨 vs 📄 → AI Won                  │   │
│  │  Round 2: ✂️ vs 🦎 → You Won                 │   │
│  │  Round 3: 🖖 vs 🪨 → You Won                 │   │
│  └─────────────────────────────────────────────────┘   │
│                                                         │
│  Test Statistics:                                      │
│  • Win Rate: 55% (11 AI wins seem strong)             │
│  • Most Used: Rock (8 times)                          │
│  • Least Used: Lizard (2 times)                       │
│                                                         │
│  ⚠️ Warning: AI is winning 65% - game may be unbalanced│
│                                                         │
└─────────────────────────────────────────────────────────┘
```

### 4.6 Publish Tab

```
┌─────────────────────────────────────────────────────────┐
│  PUBLISH TAB: Share Your Game                          │
│                                                         │
│  Publishing Options:                                    │
│  ○ Private (only you can use)                         │
│  ○ Unlisted (anyone with link)                        │
│  ● Public (appears in game library)                   │
│                                                         │
│  Preview Card:                                         │
│  ┌─────────────────────────────────────────────────┐   │
│  │  🎮 Rock Paper Scissors Lizard Spock            │   │
│  │  ⭐⭐⭐⭐⭐ (234 ratings)                        │   │
│  │                                                 │   │
│  │  5 symbols • Balanced • Beginner               │   │
│  │  #fantasy #classic #beginner                    │   │
│  │                                                 │   │
│  │  The classic RPSLS variant with 5 choices...  │   │
│  │                                                 │   │
│  │  [Play Now]  [View Rules]                      │   │
│  └─────────────────────────────────────────────────┘   │
│                                                         │
│  ✅ All validation checks passed                       │
│  ✅ Tested 20+ times                                   │
│  ✅ Balance score: 95/100                              │
│                                                         │
│  [Submit for Review]  (Moderator approval required)    │
│                                                         │
└─────────────────────────────────────────────────────────┘
```

---

## 5. Game Validation System

### 5.1 Validation Rules

```typescript
interface GameValidation {
  isValid: boolean;
  errors: ValidationError[];
  warnings: ValidationWarning[];
  balanceScore: number;  // 0-100
}

interface ValidationError {
  type: string;
  message: string;
  severity: 'error' | 'warning';
}

// Validation checks
class GameValidator {
  validate(gameType: GameTypeCreate): GameValidation {
    const errors: ValidationError[] = [];
    
    // 1. Symbol count is odd
    if (gameType.symbolCount % 2 === 0) {
      errors.push({
        type: 'EVEN_SYMBOL_COUNT',
        message: 'Symbol count must be odd (3, 5, 7, etc.)',
        severity: 'error'
      });
    }
    
    // 2. Each symbol has unique ID
    const symbolIds = gameType.symbols.map(s => s.id);
    if (new Set(symbolIds).size !== symbolIds.length) {
      errors.push({
        type: 'DUPLICATE_SYMBOL_IDS',
        message: 'Each symbol must have a unique ID',
        severity: 'error'
      });
    }
    
    // 3. Win matrix is complete
    for (const symbol of gameType.symbols) {
      if (!gameType.winMatrix[symbol.id]) {
        errors.push({
          type: 'INCOMPLETE_WIN_MATRIX',
          message: `Missing win rules for ${symbol.name}`,
          severity: 'error'
        });
      }
    }
    
    // 4. Each symbol beats exactly (n-1)/2 others
    const expectedBeats = (gameType.symbolCount - 1) / 2;
    for (const [symbolId, defeats] of Object.entries(gameType.winMatrix)) {
      if (defeats.length !== expectedBeats) {
        errors.push({
          type: 'UNBALANCED_WINS',
          message: `${symbolId} should defeat exactly ${expectedBeats} symbols, but defeats ${defeats.length}`,
          severity: 'error'
        });
      }
    }
    
    // 5. No contradictions (A beats B means B doesn't beat A)
    for (const [symbolId, defeats] of Object.entries(gameType.winMatrix)) {
      for (const defeatedId of defeats) {
        if (gameType.winMatrix[defeatedId]?.includes(symbolId)) {
          errors.push({
            type: 'CONTRADICTION',
            message: `${symbolId} and ${defeatedId} both defeat each other`,
            severity: 'error'
          });
        }
      }
    }
    
    // 6. No self-references
    for (const [symbolId, defeats] of Object.entries(gameType.winMatrix)) {
      if (defeats.includes(symbolId)) {
        errors.push({
          type: 'SELF_DEFEAT',
          message: `${symbolId} cannot defeat itself`,
          severity: 'error'
        });
      }
    }
    
    // Calculate balance score
    const balanceScore = this.calculateBalanceScore(gameType, errors);
    
    return {
      isValid: errors.filter(e => e.severity === 'error').length === 0,
      errors,
      warnings: errors.filter(e => e.severity === 'warning'),
      balanceScore
    };
  }
  
  calculateBalanceScore(gameType: GameTypeCreate, errors: ValidationError[]): number {
    let score = 100;
    
    // Deduct for errors
    score -= errors.filter(e => e.severity === 'error').length * 20;
    score -= errors.filter(e => e.severity === 'warning').length * 5;
    
    // Check for circular relationships (good)
    const circularScore = this.checkCircularity(gameType.winMatrix);
    score = (score + circularScore) / 2;
    
    return Math.max(0, Math.min(100, score));
  }
  
  checkCircularity(winMatrix: WinMatrix): number {
    // Algorithm to detect circular dependencies vs linear hierarchies
    // Circular is better (no dominant symbol)
    // Returns 0-100
  }
}
```

### 5.2 Auto-Balance Feature

```typescript
class GameBalancer {
  /**
   * Generate balanced win matrix for n symbols
   * Uses circular arrangement algorithm
   */
  generateBalancedMatrix(symbolIds: string[]): WinMatrix {
    const n = symbolIds.length;
    if (n % 2 === 0) {
      throw new Error('Symbol count must be odd');
    }
    
    const matrix: WinMatrix = {};
    const halfN = Math.floor(n / 2);
    
    // For each symbol, it defeats the next halfN symbols in circular order
    for (let i = 0; i < n; i++) {
      const defeats: string[] = [];
      for (let j = 1; j <= halfN; j++) {
        defeats.push(symbolIds[(i + j) % n]);
      }
      matrix[symbolIds[i]] = defeats;
    }
    
    return matrix;
  }
  
  /**
   * Suggest fixes for unbalanced game
   */
  suggestFixes(gameType: GameTypeCreate): BalanceSuggestion[] {
    const suggestions: BalanceSuggestion[] = [];
    
    // Analyze current matrix
    // Suggest which relationships to add/remove for balance
    
    return suggestions;
  }
}
```

---

## 6. Game Library & Discovery

### 6.1 Game Library UI

```
┌─────────────────────────────────────────────────────────┐
│  Game Library                           [+ Create Game] │
├─────────────────────────────────────────────────────────┤
│                                                         │
│  Filters: [All] [Official] [Community] [My Games]      │
│  Sort by: [Most Popular ▼]                             │
│  Tags: [Fantasy] [Classic] [Beginner] [+More]          │
│                                                         │
├─────────────────────────────────────────────────────────┤
│                                                         │
│  OFFICIAL GAMES:                                        │
│  ┌────────────┐ ┌────────────┐ ┌────────────┐         │
│  │   🎮       │ │   🎮       │ │   🎮       │         │
│  │  Classic   │ │   RPSLS    │ │ Elemental  │         │
│  │    RPS     │ │  5 symbols │ │  5 symbols │         │
│  │ ⭐⭐⭐⭐⭐│ │ ⭐⭐⭐⭐⭐│ │ ⭐⭐⭐⭐  │         │
│  │ 10.5K plays│ │  8.2K plays│ │  5.1K plays│         │
│  │ [Play]     │ │ [Play]     │ │ [Play]     │         │
│  └────────────┘ └────────────┘ └────────────┘         │
│                                                         │
│  COMMUNITY GAMES:                                       │
│  ┌────────────┐ ┌────────────┐ ┌────────────┐         │
│  │   🎨       │ │   🎨       │ │   🎨       │         │
│  │ Fantasy    │ │ Tech Wars  │ │  Animals   │         │
│  │  7 symbols │ │  5 symbols │ │  5 symbols │         │
│  │ ⭐⭐⭐⭐  │ │ ⭐⭐⭐     │ │ ⭐⭐⭐⭐  │         │
│  │  234 plays │ │  156 plays │ │  423 plays │         │
│  │ by @user   │ │ by @dev    │ │ by @maker  │         │
│  │ [Play]     │ │ [Play]     │ │ [Play]     │         │
│  └────────────┘ └────────────┘ └────────────┘         │
│                                                         │
└─────────────────────────────────────────────────────────┘
```

### 6.2 Game Detail Page

```
┌─────────────────────────────────────────────────────────┐
│  ← Back                                   [⋮ Options]   │
│                                                         │
│  🎮 Rock Paper Scissors Lizard Spock                   │
│  ⭐⭐⭐⭐⭐ 4.8 (234 ratings)  •  Official           │
│                                                         │
│  5 symbols  •  Balanced  •  Beginner                   │
│  #classic #spock #lizard #bigbangtheory               │
│                                                         │
│  Created by: Sheldon Cooper (@sheldon)                │
│  8,234 matches played  •  Published: Jan 15, 2025     │
│                                                         │
├─────────────────────────────────────────────────────────┤
│  DESCRIPTION:                                          │
│  The classic Rock Paper Scissors Lizard Spock game     │
│  popularized by The Big Bang Theory. Each symbol       │
│  defeats two others in a balanced arrangement.         │
│                                                         │
│  SYMBOLS:                                              │
│  🪨 Rock - Crushes scissors and lizard                │
│  📄 Paper - Covers rock and disproves Spock           │
│  ✂️ Scissors - Cuts paper and decapitates lizard      │
│  🦎 Lizard - Eats paper and poisons Spock             │
│  🖖 Spock - Vaporizes rock and smashes scissors       │
│                                                         │
│  [▶ Play Now]  [View Rules]  [Fork & Edit]           │
│                                                         │
├─────────────────────────────────────────────────────────┤
│  STATISTICS:                                           │
│  • Most used: Rock (22%)                              │
│  • Highest win rate: Paper (21.2%)                    │
│  • Average match duration: 1m 45s                     │
│  • Balance score: 98/100 ✅                           │
│                                                         │
│  REVIEWS: (Show all 234 →)                            │
│  ⭐⭐⭐⭐⭐ "Perfect balance!" - @player1           │
│  ⭐⭐⭐⭐⭐ "Love the Spock option" - @fan         │
│  ⭐⭐⭐⭐   "Great for beginners" - @noob          │
│                                                         │
└─────────────────────────────────────────────────────────┘
```

---

## 7. API Endpoints for Game Editor

### 7.1 Game Type CRUD

```typescript
// Create new game type (draft)
POST /api/v1/game-types
Authorization: Bearer {token}
{
  "name": "My Custom Game",
  "description": "A unique variant",
  "symbols": [
    {"id": "fire", "name": "Fire", "emoji": "🔥"},
    {"id": "water", "name": "Water", "emoji": "💧"},
    {"id": "earth", "name": "Earth", "emoji": "🌍"}
  ],
  "winMatrix": {
    "fire": ["earth"],
    "water": ["fire"],
    "earth": ["water"]
  }
}

Response: 201 Created
{
  "success": true,
  "data": {
    "id": "uuid",
    "name": "My Custom Game",
    "status": "draft",
    "isValidated": false
  }
}

// Validate game type
POST /api/v1/game-types/{id}/validate
Response: {
  "isValid": true,
  "errors": [],
  "balanceScore": 95
}

// Publish game type
POST /api/v1/game-types/{id}/publish
{
  "visibility": "public",
  "tags": ["custom", "fantasy"]
}

// Fork existing game
POST /api/v1/game-types/{id}/fork
Response: Creates copy as draft for editing

// Get game type details
GET /api/v1/game-types/{id}

// List public games
GET /api/v1/game-types?public=true&sort=popular

// Search games
GET /api/v1/game-types/search?q=fantasy&tags=beginner

// Rate game
POST /api/v1/game-types/{id}/rate
{
  "rating": 5,
  "feedback": "Great game!",
  "isBalanced": true,
  "isFun": true
}
```

---

## 8. Contracts Package Updates

### 8.1 Game Type Interfaces

```typescript
// @rpsfull-platform/contracts

// In src/entities/GameType.entity.ts

export interface IGameTypeCreate {
  name: string;
  description?: string;
  symbols: IGameSymbol[];
  winMatrix: IWinMatrix;
  tieRules?: TieRule;
  scoringMethod?: ScoringMethod;
  tags?: string[];
  difficultyLevel?: DifficultyLevel;
  visibility?: GameVisibility;
}

export interface IGameTypeUpdate {
  name?: string;
  description?: string;
  symbols?: IGameSymbol[];
  winMatrix?: IWinMatrix;
  tags?: string[];
  isActive?: boolean;
}

export enum GameVisibility {
  PRIVATE = 'private',
  UNLISTED = 'unlisted',
  PUBLIC = 'public',
}

export enum DifficultyLevel {
  BEGINNER = 'beginner',
  INTERMEDIATE = 'intermediate',
  ADVANCED = 'advanced',
}

export interface IGameValidationResult {
  isValid: boolean;
  errors: IValidationError[];
  warnings: IValidationWarning[];
  balanceScore: number;
}

export interface IValidationError {
  type: ValidationErrorType;
  message: string;
  severity: 'error' | 'warning';
  symbolId?: string;
}

export enum ValidationErrorType {
  EVEN_SYMBOL_COUNT = 'EVEN_SYMBOL_COUNT',
  DUPLICATE_SYMBOL_IDS = 'DUPLICATE_SYMBOL_IDS',
  INCOMPLETE_WIN_MATRIX = 'INCOMPLETE_WIN_MATRIX',
  UNBALANCED_WINS = 'UNBALANCED_WINS',
  CONTRADICTION = 'CONTRADICTION',
  SELF_DEFEAT = 'SELF_DEFEAT',
  MISSING_ICONS = 'MISSING_ICONS',
}
```

### 8.2 Validation Schemas

```typescript
// In src/validators/gameType.validator.ts
import { z } from 'zod';

export const gameSymbolSchema = z.object({
  id: z.string().min(1).max(50).regex(/^[a-z0-9_-]+$/),
  name: z.string().min(1).max(100),
  description: z.string().max(500).optional(),
  emoji: z.string().max(10).optional(),
  iconUrl: z.string().url().optional(),
  color: z.string().regex(/^#[0-9A-Fa-f]{6}$/).optional(),
  displayOrder: z.number().int().min(0),
});

export const winMatrixSchema = z.record(
  z.string(),
  z.array(z.string())
);

export const createGameTypeSchema = z.object({
  name: z.string().min(3).max(100),
  description: z.string().max(1000).optional(),
  symbols: z.array(gameSymbolSchema)
    .min(3)
    .max(15)
    .refine(symbols => symbols.length % 2 === 1, {
      message: 'Symbol count must be odd'
    }),
  winMatrix: winMatrixSchema,
  tags: z.array(z.string()).max(10).optional(),
  difficultyLevel: z.enum(['beginner', 'intermediate', 'advanced']).optional(),
  visibility: z.enum(['private', 'unlisted', 'public']).optional(),
});
```

---

## 9. Advanced Features

### 9.1 AI-Assisted Game Creation

```typescript
// AI suggestions for game creation
interface AIGameSuggestion {
  theme: string;
  suggestedSymbols: IGameSymbol[];
  suggestedMatrix: IWinMatrix;
  reasoning: string;
}

// Example: "Create a game about elements"
// AI generates: Fire, Water, Earth, Air, Lightning
// With balanced win matrix
```

### 9.2 Game Templates

```typescript
// Pre-built templates for quick start
enum GameTemplate {
  CLASSIC_3 = 'classic_3',  // Rock Paper Scissors
  EXTENDED_5 = 'extended_5',  // RPSLS
  EXTENDED_7 = 'extended_7',  // 7-symbol variant
  FANTASY = 'fantasy',
  ELEMENTAL = 'elemental',
  CUSTOM = 'custom',
}

// Load template and customize
function loadTemplate(template: GameTemplate): IGameTypeCreate {
  // Returns pre-configured game type
}
```

### 9.3 Community Features

```typescript
// Fork other games
POST /api/v1/game-types/{id}/fork

// Import from JSON
POST /api/v1/game-types/import
Content-Type: application/json
{
  "gameType": { /* full game definition */ }
}

// Export to JSON
GET /api/v1/game-types/{id}/export

// Share link
GET /api/v1/game-types/{id}/share
Response: {
  "shareUrl": "https://rpsfull.com/games/abc123",
  "embedCode": "<iframe>...</iframe>"
}
```

### 9.4 Tournament Support

```typescript
// Create tournament with custom game
POST /api/v1/tournaments
{
  "name": "Fantasy RPS Tournament",
  "gameTypeId": "custom-game-uuid",
  // ... other tournament settings
}
```

---

## 10. Moderation & Quality Control

### 10.1 Approval Workflow

```
1. User creates game → Status: DRAFT
2. User submits for review → Status: PENDING_REVIEW
3. Moderator reviews → Status: APPROVED or REJECTED
4. If approved → Status: PUBLISHED (appears in library)
5. Users can report → Status: UNDER_REVIEW
```

### 10.2 Moderator Dashboard

```
┌─────────────────────────────────────────────────────────┐
│  Moderation Queue                            [Filters]  │
├─────────────────────────────────────────────────────────┤
│                                                         │
│  Pending Review (5):                                   │
│  ┌─────────────────────────────────────────────────┐   │
│  │  Fantasy Warriors                               │   │
│  │  By @creator • 7 symbols • Balance: 92/100     │   │
│  │  Submitted: 2 hours ago                        │   │
│  │  [✓ Approve] [✗ Reject] [View Details]        │   │
│  └─────────────────────────────────────────────────┘   │
│                                                         │
│  Flagged Games (2):                                    │
│  ┌─────────────────────────────────────────────────┐   │
│  │  Controversial Game                             │   │
│  │  3 reports: "Unbalanced", "Offensive"          │   │
│  │  [Review Reports] [Take Action]                │   │
│  └─────────────────────────────────────────────────┘   │
│                                                         │
└─────────────────────────────────────────────────────────┘
```

### 10.3 Auto-Moderation Rules

```typescript
// Automatic rejection criteria
interface AutoModerationRules {
  rejectIfBalanceScoreBelow: 60;
  rejectIfInappropriateContent: true;
  rejectIfTooSimilarToExisting: true;
  requireMinimumTestPlays: 10;
}
```

---

## 11. Implementation Phases

### Phase 1: Core Editor (MVP)
- [ ] Basic game type creation
- [ ] Symbol editor
- [ ] Simple matrix editor (grid view)
- [ ] Basic validation
- [ ] Save as draft
- [ ] Play custom games privately

### Phase 2: Enhanced Editor
- [ ] Visual circular designer
- [ ] Auto-balance feature
- [ ] Test mode with AI
- [ ] Balance score calculator
- [ ] Icon upload system

### Phase 3: Publishing & Discovery
- [ ] Publish workflow
- [ ] Game library
- [ ] Search and filters
- [ ] Rating system
- [ ] Moderation queue

### Phase 4: Community Features
- [ ] Fork games
- [ ] Game templates
- [ ] Share links
- [ ] Leaderboards per game type
- [ ] Creator profiles

### Phase 5: Advanced
- [ ] AI-assisted creation
- [ ] Advanced analytics per game
- [ ] Seasonal featured games
- [ ] Creator monetization (future)

---

**Document Approval:**
- [ ] Product Owner
- [ ] UX Designer
- [ ] Game Designer
- [ ] Technical Lead

---

END OF DOCUMENT

