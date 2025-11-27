# 🧪 Testing Guide - RPSFull Platform
## Comprehensive Testing Instructions

**Date:** December 2024  
**Status:** Ready for Testing!

---

## 🚀 Quick Start Testing

### 1. Start the Application

**Terminal 1 - Backend:**
```bash
cd packages/backend
pnpm dev
```
Backend should start on `http://localhost:4444`

**Terminal 2 - Frontend:**
```bash
cd packages/frontend
pnpm dev
```
Frontend should start on `http://localhost:4445`

**Terminal 3 - Database (if not running):**
```bash
docker-compose up -d
```

---

## ✅ Automated E2E Tests

### Run All E2E Tests
```bash
pnpm test:e2e
# or
npx playwright test
```

### Run Specific Test Suite
```bash
# Authentication tests
npx playwright test e2e/auth-flow.spec.ts

# Match flow tests
npx playwright test e2e/match-flow.spec.ts

# Tournament tests
npx playwright test e2e/tournament-flow.spec.ts

# Game library tests
npx playwright test e2e/game-library-flow.spec.ts
```

### Run Tests in UI Mode (Recommended for First Time)
```bash
npx playwright test --ui
```
This opens a visual interface where you can see tests running and debug issues.

### Run Tests in Debug Mode
```bash
npx playwright test --debug
```

---

## 🎮 Manual Testing Checklist

### 1. Authentication Flow ✅

#### Registration
- [ ] Navigate to `/register`
- [ ] Fill in username, email, password
- [ ] Submit form
- [ ] Verify redirect to dashboard or login
- [ ] Check for success message

#### Login
- [ ] Navigate to `/login`
- [ ] Enter valid credentials
- [ ] Submit form
- [ ] Verify redirect to dashboard
- [ ] Check user info displays correctly

#### Logout
- [ ] Click logout button
- [ ] Verify redirect to login
- [ ] Verify tokens cleared

#### Error Handling
- [ ] Try login with invalid credentials
- [ ] Verify error message displays
- [ ] Try register with duplicate email
- [ ] Verify error handling

---

### 2. Match Creation & Gameplay ✅

#### Create Match
- [ ] Navigate to `/play`
- [ ] Fill in opponent ID
- [ ] Select game type from dropdown
- [ ] Set best of N (e.g., 3)
- [ ] Submit match creation
- [ ] Verify match appears in match list

#### Match Gameplay
- [ ] Open a match
- [ ] Click "Start Match" (if pending)
- [ ] Select a move (Rock/Paper/Scissors)
- [ ] Submit move
- [ ] Verify "waiting for opponent" state
- [ ] **Watch for round result animation!** 🎉
- [ ] Verify score updates
- [ ] Complete match
- [ ] **Watch for confetti on win!** 🎊

#### Match Animations
- [ ] Win a round → See win animation
- [ ] Lose a round → See loss animation
- [ ] Tie a round → See tie animation
- [ ] Win match → See confetti!

---

### 3. Tournament System ✅

#### Create Tournament
- [ ] Navigate to `/tournaments`
- [ ] Click "Create Tournament"
- [ ] Fill tournament form
- [ ] Add players
- [ ] Submit
- [ ] Verify tournament created

#### Tournament Bracket
- [ ] View tournament bracket
- [ ] Verify bracket visualization
- [ ] Check match progression

---

### 4. Game Library ✅

#### Browse Games
- [ ] Navigate to `/games`
- [ ] Verify games display in grid
- [ ] Check game cards show:
  - Game name
  - Description
  - Symbol count
  - Symbol preview

#### Search Games
- [ ] Type in search box
- [ ] Verify results filter in real-time
- [ ] Check debounce works (300ms delay)

#### Filter Games
- [ ] Click "All" filter
- [ ] Click "Official" filter
- [ ] Click "Community" filter
- [ ] Verify filtering works

#### Sort Games
- [ ] Change sort dropdown
- [ ] Verify games reorder
- [ ] Test: Name, Newest, Oldest, Symbols

#### Game Detail Page
- [ ] Click "Details" on a game
- [ ] Verify game info displays
- [ ] Check symbols grid
- [ ] Verify win matrix visualization
- [ ] Click "Play Now" button

---

### 5. Game Editor ✅

#### Create Game
- [ ] Navigate to `/game-editor`
- [ ] Click "Create New Game"
- [ ] Fill Basic Info tab
- [ ] Add symbols in Symbols tab
- [ ] Define win matrix in Rules tab
- [ ] Test game in Test tab
- [ ] Publish in Publish tab
- [ ] Verify game appears in library

#### Edit Game
- [ ] Go to `/game-editor`
- [ ] Click "Edit" on a game
- [ ] Modify game details
- [ ] Save changes
- [ ] Verify updates reflected

#### Preview Game
- [ ] Click "Preview" on a game
- [ ] Verify full game display
- [ ] Check all information shown

---

### 6. Error Handling & Offline Detection ✅

#### Offline Detection
- [ ] Open DevTools → Network tab
- [ ] Set to "Offline"
- [ ] **Watch for offline banner!** 📡
- [ ] Verify toast notification
- [ ] Set back to "Online"
- [ ] **Watch for "Back online" message!** ✅

#### Error Boundaries
- [ ] Intentionally break something (in dev mode)
- [ ] Verify error boundary catches it
- [ ] Check "Try Again" button works
- [ ] Verify error details in dev mode

#### Network Errors
- [ ] Stop backend server
- [ ] Try to create a match
- [ ] Verify error message displays
- [ ] Verify retry mechanism (if applicable)

---

### 7. Animations & Visual Polish ✅

#### Match Animations
- [ ] Play a match
- [ ] Watch round result animations
- [ ] Verify smooth transitions
- [ ] Check confetti on win

#### Page Transitions
- [ ] Navigate between pages
- [ ] Verify smooth transitions
- [ ] Check loading states

#### Loading States
- [ ] Navigate to pages with data
- [ ] Verify skeleton loaders appear
- [ ] Check spinners for quick loads

---

### 8. Mobile Responsiveness ✅

#### Mobile View
- [ ] Open DevTools → Toggle device toolbar
- [ ] Test on iPhone 12
- [ ] Test on Pixel 5
- [ ] Verify:
  - Navigation works
  - Forms are usable
  - Buttons are tappable
  - Text is readable
  - Layout adapts

#### Touch Interactions
- [ ] Test on actual mobile device
- [ ] Verify touch targets are large enough
- [ ] Check swipe gestures (if any)

---

## 🐛 Common Issues & Solutions

### Issue: Tests fail with "Server not running"
**Solution:** Make sure backend and frontend are running on correct ports

### Issue: Database connection errors
**Solution:** 
```bash
docker-compose up -d
cd packages/backend
pnpm db:migrate
```

### Issue: WebSocket connection fails
**Solution:** Check backend socket.io is running and CORS is configured

### Issue: Authentication tokens expire
**Solution:** Check token refresh logic in AuthContext

---

## 📊 Test Coverage Goals

### Critical Paths (Must Work)
- ✅ User registration and login
- ✅ Match creation
- ✅ Match gameplay
- ✅ Tournament creation
- ✅ Game library browsing

### Important Features (Should Work)
- ✅ Game editor
- ✅ Statistics display
- ✅ Offline detection
- ✅ Error handling
- ✅ Animations

### Nice-to-Have (Can Have Issues)
- Advanced filters
- Complex tournament brackets
- Performance optimizations

---

## 🎯 Testing Priorities

### Priority 1: Core Gameplay
1. User can register/login
2. User can create a match
3. User can play a match
4. Match results are correct
5. Statistics update correctly

### Priority 2: User Experience
1. Animations work smoothly
2. Error messages are clear
3. Offline detection works
4. Loading states are good
5. Mobile works well

### Priority 3: Advanced Features
1. Tournament system works
2. Game editor works
3. Game library works
4. Search/filter works

---

## 📝 Reporting Issues

When you find issues, note:
1. **What** you were trying to do
2. **What** happened instead
3. **Steps** to reproduce
4. **Browser/Device** you're using
5. **Console errors** (if any)
6. **Screenshots** (if helpful)

---

## 🎉 Success Criteria

The platform is ready if:
- ✅ All E2E tests pass
- ✅ Core gameplay works end-to-end
- ✅ No critical errors in console
- ✅ Animations are smooth
- ✅ Mobile experience is good
- ✅ Error handling works
- ✅ Offline detection works

---

## 🚀 Ready to Test!

Everything is set up and ready. Have fun testing! 🎮

**Pro Tip:** Start with the E2E tests in UI mode to see everything visually:
```bash
npx playwright test --ui
```

This will show you exactly what's happening and make debugging easier!

---

**Happy Testing! 🎊**

