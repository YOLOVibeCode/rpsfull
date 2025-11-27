# 🚀 Quick Test Start Guide

## Fixed Issues ✅
- ✅ QrCodeService import added
- ✅ SocketServer export fixed  
- ✅ roundNumber type definition fixed
- ✅ TypeScript config updated

## Start Tests in 3 Steps

### Step 1: Start Database (if not running)
```bash
docker-compose up -d
```

### Step 2: Start Backend Server
```bash
cd packages/backend
pnpm dev
```
**Wait for:** `Server running on port 4444` ✅

### Step 3: Start Frontend Server (new terminal)
```bash
cd packages/frontend  
pnpm dev
```
**Wait for:** `Ready on http://localhost:4445` ✅

### Step 4: Run Tests (new terminal)
```bash
# Visual UI Mode (Recommended!)
npx playwright test --ui

# Or headless mode
pnpm test:e2e
```

---

## Quick Test Commands

### Run All Tests
```bash
npx playwright test
```

### Run Specific Suite
```bash
npx playwright test e2e/auth-complete-flow.spec.ts
npx playwright test e2e/match-gameplay-complete.spec.ts
npx playwright test e2e/tournament-complete-flow.spec.ts
npx playwright test e2e/game-editor-flow.spec.ts
npx playwright test e2e/error-handling.spec.ts
npx playwright test e2e/offline-detection.spec.ts
```

### View Test Report
```bash
npx playwright show-report
```

---

## Troubleshooting

### Backend won't start?
- Check: `cd packages/backend && pnpm type-check`
- Fix any remaining TypeScript errors

### Frontend won't start?
- Check: `cd packages/frontend && pnpm build`
- Ensure backend is running first

### Tests timeout?
- Verify both servers are running:
  - Backend: http://localhost:4444
  - Frontend: http://localhost:4445
- Check server logs for errors

---

**Ready to test! 🎉**

