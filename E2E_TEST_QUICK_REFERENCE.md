# 🚀 E2E Test Quick Reference Guide

## Quick Start

### Prerequisites
```bash
# 1. Start backend server
cd packages/backend && pnpm dev

# 2. Start frontend server (in another terminal)
cd packages/frontend && pnpm dev

# 3. Ensure database is seeded
cd packages/backend && pnpm db:seed
```

### Run All Tests
```bash
pnpm test:e2e
```

### Run Specific Test Suite
```bash
# Match gameplay tests
npx playwright test e2e/match-gameplay-integration.spec.ts

# Tournament simulation tests
npx playwright test e2e/tournament-simulation.spec.ts

# WebSocket tests
npx playwright test e2e/websocket-realtime.spec.ts

# Authentication tests
npx playwright test e2e/auth-complete-flow.spec.ts
```

### Debug Mode
```bash
# Interactive UI mode (recommended)
npx playwright test --ui

# Debug mode with step-through
npx playwright test --debug

# Debug specific test
npx playwright test --debug e2e/match-gameplay-integration.spec.ts -g "Two players complete"
```

---

## Test Files Overview

### New Test Files (Just Created)
- ✅ `e2e/match-gameplay-integration.spec.ts` - Real match gameplay tests
- ✅ `e2e/tournament-simulation.spec.ts` - Tournament simulation tests
- ✅ `e2e/websocket-realtime.spec.ts` - WebSocket real-time tests

### Helper Files (Just Created)
- ✅ `e2e/helpers/auth.ts` - Authentication helpers
- ✅ `e2e/helpers/match.ts` - Match gameplay helpers
- ✅ `e2e/helpers/tournament.ts` - Tournament helpers
- ✅ `e2e/helpers/gameTypes.ts` - Game type helpers
- ✅ `e2e/helpers/players.ts` - Player helpers

### Existing Test Files
- `e2e/auth-complete-flow.spec.ts` - Complete auth flow
- `e2e/match-invitation.spec.ts` - Match invitation flow
- `e2e/match-gameplay-complete.spec.ts` - Match UI checks
- `e2e/tournament-complete-flow.spec.ts` - Tournament UI checks
- `e2e/game-editor-flow.spec.ts` - Game editor tests
- `e2e/error-handling.spec.ts` - Error handling tests
- `e2e/offline-detection.spec.ts` - Offline detection tests

---

## Helper Functions Quick Reference

### Authentication Helpers
```typescript
import { registerUser, loginUser, createTestUser } from './helpers/auth';

// Create unique test user
const user = createTestUser('prefix');

// Register user
await registerUser(page, user);

// Login user
await loginUser(page, user.email, user.password);
```

### Match Helpers
```typescript
import { createMatch, selectMove, submitMove, waitForRoundResult } from './helpers/match';

// Create match
const matchId = await createMatch(page, {
  player2Id: 'player-id',
  gameTypeId: 'game-type-id',
  bestOfN: 3,
});

// Select and submit move
await selectMove(page, 'Rock');
await submitMove(page);

// Wait for round result
await waitForRoundResult(page);
```

### Tournament Helpers
```typescript
import { createTournament, registerForTournament, startTournament } from './helpers/tournament';

// Create tournament
const tournamentId = await createTournament(page, {
  name: 'Tournament Name',
  gameTypeId: 'game-type-id',
  maxParticipants: 8,
});

// Register for tournament
await registerForTournament(page, tournamentId);

// Start tournament
await startTournament(page, tournamentId);
```

---

## Common Test Patterns

### Two-Player Match Test
```typescript
test('Two players play match', async ({ browser }) => {
  const player1 = createTestUser('p1');
  const player2 = createTestUser('p2');
  
  const ctx1 = await browser.newContext();
  const ctx2 = await browser.newContext();
  const page1 = await ctx1.newPage();
  const page2 = await ctx2.newPage();
  
  try {
    await registerUser(page1, player1);
    await registerUser(page2, player2);
    await loginUser(page1, player1.email, player1.password);
    await loginUser(page2, player2.email, player2.password);
    
    // ... test logic ...
  } finally {
    await ctx1.close();
    await ctx2.close();
  }
});
```

### Multi-Player Tournament Test
```typescript
test('Tournament with multiple players', async ({ browser }) => {
  const organizer = createTestUser('org');
  const players = [
    createTestUser('p1'),
    createTestUser('p2'),
    createTestUser('p3'),
    createTestUser('p4'),
  ];
  
  // Create contexts for all players
  const contexts = await Promise.all([
    browser.newContext(),
    ...players.map(() => browser.newContext()),
  ]);
  
  // ... test logic ...
  
  // Cleanup
  await Promise.all(contexts.map(ctx => ctx.close()));
});
```

---

## Troubleshooting

### Tests Fail to Connect
- ✅ Verify backend is running on `http://localhost:4444`
- ✅ Verify frontend is running on `http://localhost:4445`
- ✅ Check `playwright.config.ts` baseURL matches frontend port

### WebSocket Tests Fail
- ✅ Verify WebSocket server is running
- ✅ Check WebSocket URL in frontend config
- ✅ Verify authentication tokens are valid

### Match Creation Fails
- ✅ Verify game types exist in database
- ✅ Verify player IDs are valid
- ✅ Check API endpoints are working

### Tournament Tests Fail
- ✅ Verify tournament creation API works
- ✅ Check participant registration limits
- ✅ Verify bracket generation logic

---

## Test Execution Tips

### 1. Run Tests in UI Mode First
```bash
npx playwright test --ui
```
This helps visualize what's happening and debug issues.

### 2. Run Tests One at a Time
```bash
npx playwright test e2e/match-gameplay-integration.spec.ts -g "Two players"
```
Focus on specific tests when debugging.

### 3. Use Headed Mode
Add to `playwright.config.ts`:
```typescript
use: {
  headless: false, // See browser
}
```

### 4. Increase Timeouts for Slow Tests
```typescript
test('Slow test', async ({ page }) => {
  test.setTimeout(60000); // 60 seconds
  // ... test code ...
});
```

---

## Next Steps

1. ✅ **Run the tests** - Verify everything works
2. ✅ **Fix any issues** - Address failures
3. ✅ **Add more tests** - Expand coverage
4. ✅ **CI/CD Integration** - Automate test runs

---

**Last Updated:** November 2024  
**Status:** Ready for execution ✅

