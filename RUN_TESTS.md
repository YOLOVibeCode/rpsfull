# 🧪 Running E2E Tests - Quick Guide

## Prerequisites

### 1. Start Database
```bash
docker-compose up -d
```

### 2. Start Backend Server
```bash
cd packages/backend
pnpm dev
```
**Backend should be running on:** `http://localhost:4444`

### 3. Start Frontend Server
```bash
cd packages/frontend
pnpm dev
```
**Frontend should be running on:** `http://localhost:4445`

---

## Running Tests

### Option 1: Visual UI Mode (Recommended! 🎬)
```bash
npx playwright test --ui
```
**Best for:** Seeing tests run visually, debugging, first-time testing

### Option 2: Headless Mode
```bash
pnpm test:e2e
# or
npx playwright test
```

### Option 3: Run Specific Test Suite
```bash
# Authentication tests
npx playwright test e2e/auth-complete-flow.spec.ts

# Match gameplay
npx playwright test e2e/match-gameplay-complete.spec.ts

# Tournament
npx playwright test e2e/tournament-complete-flow.spec.ts

# Game Editor
npx playwright test e2e/game-editor-flow.spec.ts

# Error Handling
npx playwright test e2e/error-handling.spec.ts

# Offline Detection
npx playwright test e2e/offline-detection.spec.ts
```

### Option 4: Run Single Test
```bash
npx playwright test e2e/auth-complete-flow.spec.ts:11
```

### Option 5: Run on Specific Browser
```bash
npx playwright test --project=chromium
npx playwright test --project=firefox
npx playwright test --project=webkit
```

### Option 6: Run on Mobile
```bash
npx playwright test --project="Mobile Chrome"
npx playwright test --project="Mobile Safari"
```

---

## Test Results

### View HTML Report
After running tests, view the HTML report:
```bash
npx playwright show-report
```

### Debug Failed Tests
```bash
npx playwright test --debug
```

### Run Tests with Trace
```bash
npx playwright test --trace on
```

---

## Troubleshooting

### Issue: "Timed out waiting for server"
**Solution:** Make sure backend and frontend are running:
```bash
# Check if servers are running
lsof -ti:4444  # Backend
lsof -ti:4445  # Frontend

# Start them if not running
cd packages/backend && pnpm dev &
cd packages/frontend && pnpm dev &
```

### Issue: "Database connection error"
**Solution:** Start database:
```bash
docker-compose up -d
```

### Issue: "Tests fail with compilation errors"
**Solution:** Fix TypeScript errors first:
```bash
cd packages/backend
pnpm type-check
```

---

## Quick Test Commands

### Run All Tests
```bash
pnpm test:e2e
```

### Run Tests in UI Mode
```bash
npx playwright test --ui
```

### Run Tests with Retry
```bash
npx playwright test --retries=2
```

### Run Tests in Debug Mode
```bash
npx playwright test --debug
```

---

## Test Execution Tips

1. **Start with UI Mode** - See what's happening visually
2. **Run one suite at a time** - Easier to debug
3. **Check server logs** - See backend errors
4. **Use debug mode** - Step through tests
5. **Check HTML report** - See detailed results

---

**Happy Testing! 🎉**

