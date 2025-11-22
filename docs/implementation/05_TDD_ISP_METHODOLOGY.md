# TDD & ISP Implementation Guide
## RPSFull Tournament Platform - Test-Driven Development & Interface Segregation

**Document Version:** 1.0  
**Last Updated:** November 22, 2025  
**Status:** Implementation Guide  
**Purpose:** Complete TDD and ISP methodology for RPSFull development

---

## 1. TDD Methodology

### 1.1 The Red-Green-Refactor Cycle

**Core TDD Workflow:**

```
┌─────────────────────────────────────────┐
│  1. 🔴 RED: Write Failing Test         │
│     - Test describes desired behavior  │
│     - Run test → Should FAIL           │
└───────────────┬─────────────────────────┘
                │
                ▼
┌─────────────────────────────────────────┐
│  2. 🟢 GREEN: Write Minimal Code        │
│     - Implement just enough to pass      │
│     - Run test → Should PASS            │
│     - Don't worry about perfect code    │
└───────────────┬─────────────────────────┘
                │
                ▼
┌─────────────────────────────────────────┐
│  3. 🔵 REFACTOR: Improve Code          │
│     - Clean up, optimize, improve       │
│     - Run tests → Must STILL PASS       │
│     - Repeat cycle                      │
└─────────────────────────────────────────┘
```

### 1.2 TDD Rules

**MUST Follow:**
1. ✅ **Write test FIRST** - Before any implementation
2. ✅ **One test at a time** - Don't write multiple tests at once
3. ✅ **See test fail** - Verify test actually tests something
4. ✅ **Minimal implementation** - Just enough to pass
5. ✅ **Run tests frequently** - After every small change
6. ✅ **Refactor only when green** - Never refactor when tests failing
7. ✅ **Keep tests simple** - One assertion per test when possible

**NEVER Do:**
1. ❌ Write implementation before tests
2. ❌ Skip writing tests
3. ❌ Write tests after implementation
4. ❌ Delete failing tests
5. ❌ Write complex tests that test multiple things

### 1.3 TDD Benefits

- **Confidence**: Know code works because tests prove it
- **Design**: Tests force good design (testability = good design)
- **Documentation**: Tests document how code should work
- **Refactoring**: Safe to refactor with test safety net
- **Regression**: Catch bugs before they reach production

---

## 2. Interface Segregation Principle (ISP)

### 2.1 ISP Definition

**Principle:** Clients should not be forced to depend on interfaces they don't use.

**Translation:** Create small, focused interfaces instead of large "god interfaces."

### 2.2 ISP Rules

**DO:**
- ✅ Create small, focused interfaces
- ✅ One interface per responsibility
- ✅ Prefer composition over inheritance
- ✅ Services implement only what they need
- ✅ Split large interfaces into smaller ones

**DON'T:**
- ❌ Create "god interfaces" with many methods
- ❌ Force implementations to include unused methods
- ❌ Combine unrelated operations in one interface
- ❌ Create interfaces that violate Single Responsibility

### 2.3 ISP Examples

#### ❌ BAD: Large Interface

```typescript
// BAD: Too many responsibilities
interface IGameService {
  // Match operations
  createMatch(): void;
  getMatch(): void;
  updateMatch(): void;
  deleteMatch(): void;
  
  // Tournament operations
  createTournament(): void;
  getTournament(): void;
  updateTournament(): void;
  
  // Statistics operations
  calculateStats(): void;
  getLeaderboard(): void;
  
  // Validation operations
  validateGame(): void;
  validateMatch(): void;
}

// Problem: Any service implementing this must implement ALL methods
// Even if it only needs match operations
```

#### ✅ GOOD: Segregated Interfaces

```typescript
// GOOD: Small, focused interfaces

// Match operations only
interface IMatchService {
  createMatch(): void;
  getMatch(): void;
  updateMatch(): void;
  deleteMatch(): void;
}

// Tournament operations only
interface ITournamentService {
  createTournament(): void;
  getTournament(): void;
  updateTournament(): void;
}

// Statistics operations only
interface IStatisticsService {
  calculateStats(): void;
  getLeaderboard(): void;
}

// Validation operations only
interface IGameValidationService {
  validateGame(): void;
  validateMatch(): void;
}

// Services implement only what they need
class MatchService implements IMatchService {
  // Only match methods
}

class TournamentService implements ITournamentService {
  // Only tournament methods
}
```

### 2.4 ISP Benefits

- **Flexibility**: Easy to swap implementations
- **Testability**: Mock only what you need
- **Maintainability**: Changes isolated to specific interfaces
- **Clarity**: Clear what each service does
- **Reusability**: Small interfaces easier to reuse

---

## 3. TDD + ISP Combined Workflow

### 3.1 Complete Development Cycle

**Step-by-Step Process:**

```
1. 🔴 RED: Write Interface Test
   ├─ Define interface (ISP: small, focused)
   ├─ Write test for interface method
   └─ Run test → FAILS (no implementation)

2. 🟢 GREEN: Implement Interface
   ├─ Create service class implementing interface
   ├─ Write minimal code to pass test
   └─ Run test → PASSES

3. 🔵 REFACTOR: Improve Implementation
   ├─ Clean up code
   ├─ Extract helpers if needed
   ├─ Ensure still follows ISP
   └─ Run tests → STILL PASSES

4. 🔄 REPEAT: Next Method
   └─ Go back to step 1 for next method
```

### 3.2 Example: Implementing Match Service with TDD + ISP

**Step 1: Define Interface (ISP)**

```typescript
// File: contracts/src/interfaces/services/IMatchService.ts

/**
 * ISP: Focused only on match lifecycle management
 * Does NOT include gameplay operations (separate interface)
 */
export interface IMatchService {
  createMatch(userId: string, data: ICreateMatchDto): Promise<IMatch>;
  getMatch(matchId: string): Promise<IMatchWithDetails>;
  startMatch(matchId: string, userId: string): Promise<IMatch>;
  cancelMatch(matchId: string, userId: string): Promise<void>;
  getPlayerMatches(playerId: string, filters?: Record<string, any>): Promise<IMatch[]>;
}

/**
 * ISP: Separate interface for gameplay operations
 */
export interface IMatchGameplayService {
  submitMove(matchId: string, playerId: string, data: ISubmitMoveDto): Promise<ISubmitMoveResponseDto>;
  recordRound(matchId: string, data: IRecordRoundDto): Promise<IRecordRoundResponseDto>;
}
```

**Step 2: Write Test (RED)**

```typescript
// File: backend/src/services/__tests__/match.service.test.ts

import { MatchService } from '../match.service';
import { IMatchService } from '@rpsfull-platform/contracts';
import { MatchRepository } from '../../repositories/match.repository';

describe('MatchService', () => {
  let matchService: IMatchService;
  let mockMatchRepository: jest.Mocked<IMatchRepository>;

  beforeEach(() => {
    // Create mock repository (ISP: mock only IMatchRepository)
    mockMatchRepository = {
      create: jest.fn(),
      findById: jest.fn(),
      findByIdWithDetails: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
      findByPlayer: jest.fn(),
    } as any;

    matchService = new MatchService(mockMatchRepository);
  });

  describe('createMatch', () => {
    it('should create a match with correct data', async () => {
      // Arrange
      const userId = 'user-123';
      const createData = {
        player2Id: 'player-456',
        gameTypeId: 'classic-rps',
        bestOfN: 3,
        playMode: 'digital' as const,
      };

      const expectedMatch = {
        id: 'match-789',
        player1Id: 'player-from-user-123',
        player2Id: 'player-456',
        gameTypeId: 'classic-rps',
        status: 'pending',
        // ... other fields
      };

      mockMatchRepository.create.mockResolvedValue(expectedMatch);

      // Act
      const result = await matchService.createMatch(userId, createData);

      // Assert
      expect(result).toEqual(expectedMatch);
      expect(mockMatchRepository.create).toHaveBeenCalledWith(
        expect.objectContaining({
          player2Id: createData.player2Id,
          gameTypeId: createData.gameTypeId,
        })
      );
    });

    it('should throw error if player not found', async () => {
      // Test error case
    });
  });
});
```

**Step 3: Run Test (RED)**
```bash
pnpm test match.service.test.ts
# Expected: FAILS - MatchService doesn't exist yet
```

**Step 4: Implement Service (GREEN)**

```typescript
// File: backend/src/services/match.service.ts

import { IMatchService, ICreateMatchDto, IMatch, IMatchWithDetails } from '@rpsfull-platform/contracts';
import { IMatchRepository } from '@rpsfull-platform/contracts';

/**
 * MatchService implements IMatchService (ISP: only match lifecycle)
 * Does NOT implement IMatchGameplayService
 */
export class MatchService implements IMatchService {
  constructor(private matchRepository: IMatchRepository) {}

  async createMatch(userId: string, data: ICreateMatchDto): Promise<IMatch> {
    // Minimal implementation to pass test
    return this.matchRepository.create({
      ...data,
      player1Id: 'player-from-user', // TODO: Get from userId
    });
  }

  // Implement other methods...
}
```

**Step 5: Run Test (GREEN)**
```bash
pnpm test match.service.test.ts
# Expected: PASSES
```

**Step 6: Refactor (REFACTOR)**
```typescript
// Improve implementation while keeping tests green
export class MatchService implements IMatchService {
  constructor(
    private matchRepository: IMatchRepository,
    private playerRepository: IPlayerRepository  // Added dependency
  ) {}

  async createMatch(userId: string, data: ICreateMatchDto): Promise<IMatch> {
    // Get player for user
    const player = await this.playerRepository.findByUserId(userId);
    if (!player) {
      throw new Error('Player not found for user');
    }

    return this.matchRepository.create({
      ...data,
      player1Id: player.id,
    });
  }
}
```

**Step 7: Run Tests Again**
```bash
pnpm test match.service.test.ts
# Expected: STILL PASSES
```

---

## 4. TDD File Structure

### 4.1 Test File Organization

```
src/
├── services/
│   ├── auth.service.ts
│   ├── __tests__/
│   │   ├── auth.service.test.ts
│   │   └── match.service.test.ts
│   └── match.service.ts
├── repositories/
│   ├── user.repository.ts
│   └── __tests__/
│       └── user.repository.test.ts
├── utils/
│   ├── gameLogic.ts
│   └── __tests__/
│       └── gameLogic.test.ts
└── __tests__/
    └── integration/
        └── api.test.ts
```

### 4.2 Test Naming Convention

```
{filename}.test.ts        # Unit tests
{filename}.spec.ts        # Alternative naming
integration/{name}.test.ts # Integration tests
e2e/{name}.test.ts        # E2E tests
```

---

## 5. ISP Interface Design Patterns

### 5.1 Repository Pattern with ISP

**❌ BAD: Large Repository**

```typescript
interface IRepository {
  create(): void;
  read(): void;
  update(): void;
  delete(): void;
  search(): void;
  filter(): void;
  aggregate(): void;
  export(): void;
}
```

**✅ GOOD: Segregated Repositories**

```typescript
// Basic CRUD operations
interface IReadRepository<T> {
  findById(id: string): Promise<T | null>;
  findAll(filters?: Record<string, any>): Promise<T[]>;
}

interface IWriteRepository<T> {
  create(data: Partial<T>): Promise<T>;
  update(id: string, data: Partial<T>): Promise<T>;
  delete(id: string): Promise<void>;
}

// Combine for full repository
interface IRepository<T> extends IReadRepository<T>, IWriteRepository<T> {}

// Specialized interfaces
interface ISearchableRepository<T> {
  search(query: string): Promise<T[]>;
}

interface IAggregatableRepository<T> {
  aggregate(field: string): Promise<any>;
}
```

### 5.2 Service Pattern with ISP

**Example: Tournament Services**

```typescript
// ISP: Tournament CRUD only
interface ITournamentService {
  createTournament(userId: string, data: ICreateTournamentDto): Promise<ITournament>;
  getTournament(tournamentId: string): Promise<ITournamentWithDetails>;
  updateTournament(tournamentId: string, userId: string, data: IUpdateTournamentDto): Promise<ITournament>;
  deleteTournament(tournamentId: string, userId: string): Promise<void>;
}

// ISP: Tournament participation only
interface ITournamentParticipationService {
  registerPlayer(tournamentId: string, playerId: string): Promise<void>;
  addPlayer(tournamentId: string, userId: string, data: IAddPlayerToTournamentDto): Promise<void>;
  removePlayer(tournamentId: string, playerId: string): Promise<void>;
  getStandings(tournamentId: string): Promise<ITournamentStandingsDto>;
}

// ISP: Tournament progression only
interface ITournamentProgressionService {
  startTournament(tournamentId: string, userId: string): Promise<ITournament>;
  getBracket(tournamentId: string): Promise<IBracketData>;
  advanceTournament(tournamentId: string): Promise<void>;
  completeTournament(tournamentId: string): Promise<ITournament>;
}

// Implementation: Service can implement multiple interfaces
class TournamentService implements 
  ITournamentService,
  ITournamentParticipationService,
  ITournamentProgressionService {
  // Implement all methods
}
```

---

## 6. TDD Test Structure

### 6.1 Standard Test Template

```typescript
import { ServiceClass } from '../service';
import { Interface } from '@rpsfull-platform/contracts';

describe('ServiceClass', () => {
  let service: Interface;
  let mockDependency: jest.Mocked<IDependency>;

  beforeEach(() => {
    // Setup mocks (ISP: mock only needed interfaces)
    mockDependency = createMock();
    service = new ServiceClass(mockDependency);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('methodName', () => {
    it('should do something when condition is met', async () => {
      // Arrange
      const input = { /* test data */ };
      const expected = { /* expected result */ };
      mockDependency.method.mockResolvedValue(expected);

      // Act
      const result = await service.methodName(input);

      // Assert
      expect(result).toEqual(expected);
      expect(mockDependency.method).toHaveBeenCalledWith(input);
    });

    it('should throw error when invalid input', async () => {
      // Arrange
      const invalidInput = { /* invalid data */ };

      // Act & Assert
      await expect(service.methodName(invalidInput)).rejects.toThrow('Error message');
    });
  });
});
```

### 6.2 Test Categories

**Unit Tests:**
- Test single function/class in isolation
- Mock all dependencies
- Fast execution
- High coverage

**Integration Tests:**
- Test multiple components together
- Use real database (test DB)
- Test API endpoints
- Slower execution

**E2E Tests:**
- Test complete user flows
- Use real browser
- Test full stack
- Slowest execution

---

## 7. ISP Implementation Checklist

### 7.1 Interface Design Checklist

Before creating an interface, ask:
- [ ] Does this interface have a single responsibility?
- [ ] Would a client need ALL methods in this interface?
- [ ] Can this be split into smaller interfaces?
- [ ] Are methods logically related?
- [ ] Is the interface name specific and clear?

### 7.2 Service Implementation Checklist

Before implementing a service:
- [ ] Does it implement only one interface (or related interfaces)?
- [ ] Are all interface methods actually needed?
- [ ] Can unused methods be moved to separate interface?
- [ ] Is the service focused on one domain?

---

## 8. TDD Implementation Checklist

### 8.1 Before Writing Code

- [ ] Interface defined (ISP compliant)?
- [ ] Test written first?
- [ ] Test fails as expected?
- [ ] Test is simple and focused?

### 8.2 During Implementation

- [ ] Minimal code to pass test?
- [ ] Tests run frequently?
- [ ] All tests passing?
- [ ] Code follows ISP?

### 8.3 After Implementation

- [ ] All tests passing?
- [ ] Code refactored if needed?
- [ ] Tests still pass after refactor?
- [ ] Coverage meets threshold (80%+)?
- [ ] Code reviewed?

---

## 9. Complete Example: Match Service with TDD + ISP

### 9.1 Step-by-Step Implementation

**Step 1: Define Interface (ISP)**

```typescript
// contracts/src/interfaces/services/IMatchService.ts
export interface IMatchService {
  createMatch(userId: string, data: ICreateMatchDto): Promise<IMatch>;
  getMatch(matchId: string): Promise<IMatchWithDetails>;
  cancelMatch(matchId: string, userId: string): Promise<void>;
}
```

**Step 2: Write Test (RED)**

```typescript
// backend/src/services/__tests__/match.service.test.ts
describe('MatchService', () => {
  describe('createMatch', () => {
    it('should create match', async () => {
      // Test implementation
    });
  });
});
```

**Step 3: Implement (GREEN)**

```typescript
// backend/src/services/match.service.ts
export class MatchService implements IMatchService {
  async createMatch(userId: string, data: ICreateMatchDto): Promise<IMatch> {
    // Implementation
  }
}
```

**Step 4: Refactor**

```typescript
// Improve while keeping tests green
```

**Step 5: Repeat for Next Method**

---

## 10. TDD Best Practices

### 10.1 Test Quality

**Good Tests:**
- ✅ Fast (run in milliseconds)
- ✅ Independent (no test order dependency)
- ✅ Repeatable (same result every time)
- ✅ Self-validating (pass/fail is clear)
- ✅ Timely (written before code)

**Bad Tests:**
- ❌ Slow (depend on external services)
- ❌ Interdependent (rely on other tests)
- ❌ Flaky (sometimes pass, sometimes fail)
- ❌ Complex (hard to understand)
- ❌ Written after code

### 10.2 Test Organization

**AAA Pattern:**
```typescript
it('should do something', async () => {
  // Arrange: Set up test data and mocks
  const input = { /* ... */ };
  const expected = { /* ... */ };
  
  // Act: Execute the code being tested
  const result = await service.method(input);
  
  // Assert: Verify the result
  expect(result).toEqual(expected);
});
```

### 10.3 Mocking Strategy

**What to Mock:**
- ✅ External dependencies (database, APIs)
- ✅ Slow operations (file I/O, network)
- ✅ Non-deterministic (random, time)
- ✅ Complex dependencies

**What NOT to Mock:**
- ❌ Code being tested
- ❌ Simple value objects
- ❌ Pure functions (unless testing integration)

---

## 11. ISP Best Practices

### 11.1 Interface Size Guidelines

**Good Interface:**
- 3-7 methods (sweet spot)
- Related functionality
- Single responsibility
- Clear purpose

**Too Small:**
- 1 method (might be too granular)
- Consider if it needs to be separate

**Too Large:**
- 10+ methods (likely needs splitting)
- Multiple responsibilities
- Clients forced to implement unused methods

### 11.2 Interface Naming

**Good Names:**
- `IMatchService` - Clear, specific
- `ITournamentParticipationService` - Descriptive
- `IEmailAuthService` - Focused

**Bad Names:**
- `IService` - Too generic
- `IManager` - Vague
- `IHandler` - Unclear purpose

### 11.3 Interface Composition

**Compose Small Interfaces:**

```typescript
// Small, focused interfaces
interface IReadable<T> {
  findById(id: string): Promise<T | null>;
}

interface IWritable<T> {
  create(data: Partial<T>): Promise<T>;
}

interface IDeletable {
  delete(id: string): Promise<void>;
}

// Compose for full repository
interface IRepository<T> extends IReadable<T>, IWritable<T>, IDeletable {}

// Services can use only what they need
class ReadOnlyService {
  constructor(private repo: IReadable<Entity>) {}
  // Only uses findById
}
```

---

## 12. TDD Workflow Integration

### 12.1 Daily TDD Workflow

**Morning:**
1. Pull latest code
2. Run all tests (should pass)
3. Pick next task

**Development:**
1. Write test (RED)
2. Implement (GREEN)
3. Refactor if needed
4. Commit with test

**Before Committing:**
1. Run all tests
2. Check coverage
3. Review code
4. Commit

### 12.2 TDD in Code Reviews

**Review Checklist:**
- [ ] Tests written before implementation?
- [ ] Tests cover happy path?
- [ ] Tests cover error cases?
- [ ] Tests are readable?
- [ ] Code follows ISP?
- [ ] Interfaces are focused?

---

## 13. Common TDD Mistakes

### 13.1 Mistakes to Avoid

**Mistake 1: Writing tests after code**
- ❌ Write implementation first
- ✅ Write test first

**Mistake 2: Testing implementation details**
- ❌ Test private methods
- ✅ Test public interface

**Mistake 3: One giant test**
- ❌ Test everything in one test
- ✅ One assertion per test when possible

**Mistake 4: Skipping refactor step**
- ❌ Leave code messy after green
- ✅ Refactor to clean code

**Mistake 5: Not seeing test fail**
- ❌ Assume test works
- ✅ Verify test fails first

---

## 14. Common ISP Mistakes

### 14.1 Mistakes to Avoid

**Mistake 1: God Interface**
- ❌ One interface with 20 methods
- ✅ Split into focused interfaces

**Mistake 2: Empty implementations**
- ❌ Implement interface but leave methods empty
- ✅ Split interface instead

**Mistake 3: Forcing dependencies**
- ❌ Service depends on interface it doesn't use
- ✅ Use only needed interfaces

**Mistake 4: Interface inheritance abuse**
- ❌ Deep inheritance hierarchies
- ✅ Prefer composition

---

## 15. TDD + ISP Integration Examples

### 15.1 Complete Example: Tournament Service

**Step 1: Define Interfaces (ISP)**

```typescript
// Small, focused interfaces
interface ITournamentService {
  createTournament(userId: string, data: ICreateTournamentDto): Promise<ITournament>;
  getTournament(tournamentId: string): Promise<ITournamentWithDetails>;
}

interface ITournamentParticipationService {
  registerPlayer(tournamentId: string, playerId: string): Promise<void>;
  getStandings(tournamentId: string): Promise<ITournamentStandingsDto>;
}
```

**Step 2: Write Tests (RED)**

```typescript
describe('TournamentService', () => {
  describe('createTournament', () => {
    it('should create tournament', async () => {
      // Test
    });
  });
});

describe('TournamentParticipationService', () => {
  describe('registerPlayer', () => {
    it('should register player', async () => {
      // Test
    });
  });
});
```

**Step 3: Implement (GREEN)**

```typescript
class TournamentService implements ITournamentService {
  // Implementation
}

class TournamentParticipationService implements ITournamentParticipationService {
  // Implementation
}
```

---

## 16. Testing Tools & Setup

### 16.1 Backend Testing Setup

**Jest Configuration:**
```javascript
// jest.config.js
module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  coverageThreshold: {
    global: {
      branches: 80,
      functions: 80,
      lines: 80,
      statements: 80,
    },
  },
};
```

### 16.2 Frontend Testing Setup

**Jest + React Testing Library:**
```javascript
// jest.config.js
module.exports = {
  testEnvironment: 'jsdom',
  setupFilesAfterEnv: ['<rootDir>/jest.setup.js'],
};
```

---

## 17. TDD Metrics

### 17.1 Key Metrics

- **Test Coverage**: Target 80%+
- **Test Execution Time**: < 5 minutes for full suite
- **Test-to-Code Ratio**: ~1:1 (equal lines of test and code)
- **Red-Green-Refactor Cycles**: Track completion

### 17.2 Coverage Goals

```
Statements: 80%+
Branches:   80%+
Functions:  80%+
Lines:      80%+
```

---

## 18. ISP Metrics

### 18.1 Interface Quality Metrics

- **Average Methods per Interface**: 3-7 (ideal)
- **Largest Interface**: < 10 methods
- **Interface Dependencies**: Minimal
- **Interface Reusability**: High

---

## 19. Checklist: Starting New Feature

### 19.1 TDD Checklist

- [ ] Interface defined (ISP compliant)?
- [ ] Test file created?
- [ ] First test written?
- [ ] Test fails (RED)?
- [ ] Implementation started?
- [ ] Test passes (GREEN)?
- [ ] Code refactored?
- [ ] All tests still pass?

### 19.2 ISP Checklist

- [ ] Interface is focused?
- [ ] Interface has single responsibility?
- [ ] Interface name is clear?
- [ ] Can be split further?
- [ ] Service implements only needed interfaces?

---

## 20. Example: Complete TDD + ISP Workflow

### 20.1 Feature: User Registration

**Step 1: Define Interface (ISP)**
```typescript
interface IAuthService {
  register(data: IRegisterDto): Promise<IAuthResponseDto>;
}
```

**Step 2: Write Test (RED)**
```typescript
describe('AuthService.register', () => {
  it('should create user and return tokens', async () => {
    // Test
  });
});
```

**Step 3: Run Test (RED)**
```bash
pnpm test
# FAILS - no implementation
```

**Step 4: Implement (GREEN)**
```typescript
class AuthService implements IAuthService {
  async register(data: IRegisterDto): Promise<IAuthResponseDto> {
    // Minimal implementation
  }
}
```

**Step 5: Run Test (GREEN)**
```bash
pnpm test
# PASSES
```

**Step 6: Refactor**
```typescript
// Improve code, add error handling, etc.
```

**Step 7: Verify**
```bash
pnpm test
# STILL PASSES
```

---

**Document Status:** Complete TDD + ISP methodology guide

**Next Steps:** Apply this methodology to all implementation phases

---

END OF DOCUMENT

