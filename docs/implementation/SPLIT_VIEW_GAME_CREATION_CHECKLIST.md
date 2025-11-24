# Split-View Game Creation with QR Code & Shareable Link
## TDD & ISP Analysis & Recommendations

**Document Version:** 1.0  
**Created:** December 2024  
**Status:** Analysis & Recommendations (NOT IMPLEMENTED)

---

## 📋 Executive Summary

This document provides a comprehensive checklist for implementing a **split-view game creation interface** where:
- **Left Side**: Player 1 registration form
- **Right Side**: Player 2 registration form + QR code + shareable link

The feature allows Player 1 to start a game and generate a shareable link/QR code that Player 2 can use to join the game remotely.

---

## 🎯 Core Requirements

### UI/UX Requirements
1. **Split View Layout**
   - Left panel: Player 1 registration (first name, last name, email)
   - Right panel: Player 2 registration + QR code + shareable link
   - Responsive design (stacks on mobile)

2. **Player 1 Flow**
   - Fill in registration form
   - Click "Start Game" or "Create Game Link"
   - Game is created in "pending" status
   - Shareable link and QR code generated

3. **Player 2 Flow**
   - Option A: Fill in registration form directly (same screen)
   - Option B: Use shared link/QR code (separate page)
   - Join game via link/QR code
   - Game status changes to "ready" or "in_progress"

4. **QR Code & Link Features**
   - QR code displays game join link
   - Shareable link is unique per game
   - Link expires after X hours (configurable)
   - Link can be copied to clipboard
   - QR code can be downloaded/shared

### Technical Requirements
1. **Game Invitation System**
   - Unique invitation token per game
   - Token stored in database
   - Token validation on join
   - Token expiration handling

2. **Real-time Updates**
   - Socket.io for live game status
   - Notify when Player 2 joins
   - Update UI when game is ready

3. **Security**
   - Token-based authentication for game join
   - Validate token before allowing join
   - Prevent token reuse after game starts
   - Rate limiting on join attempts

---

## 📊 Current System Analysis

### Current Game Creation Flow

#### 1. Quick Start Service (`packages/backend/src/services/QuickStartService.ts`)
- ✅ Creates both players immediately
- ✅ Creates match immediately
- ❌ No invitation system
- ❌ No pending state for Player 2
- ❌ No shareable link/QR code

#### 2. Match Service (`packages/backend/src/services/MatchService.ts`)
- ✅ `createMatch()` - creates match with both players
- ❌ No `createMatchWithInvitation()` method
- ❌ No invitation token management

#### 3. Match Repository (`packages/backend/src/repositories/MatchRepository.ts`)
- ✅ Basic CRUD operations
- ❌ No invitation token storage
- ❌ No query by invitation token

#### 4. Database Schema (`packages/backend/prisma/schema.prisma`)
- ✅ Match model exists
- ❌ No `invitationToken` field
- ❌ No `invitationExpiresAt` field
- ❌ No `invitedPlayerEmail` field

#### 5. Frontend - Start Game Page (`packages/frontend/src/app/start-game/page.tsx`)
- ✅ Two-player form (side by side)
- ❌ No QR code generation
- ❌ No shareable link
- ❌ No split view with invitation panel

#### 6. API Routes (`packages/backend/src/routes/match.routes.ts`)
- ✅ `POST /matches/quick-start` - immediate game creation
- ❌ No `POST /matches/create-with-invitation` endpoint
- ❌ No `GET /matches/join/:token` endpoint
- ❌ No `GET /matches/:id/invitation` endpoint

---

## ✅ TDD Implementation Checklist

### Phase 1: Contracts & Domain Models (Foundation)

#### 1.1 Database Schema Updates
- [ ] **Test**: Write migration test plan
  - [ ] Test adding `invitationToken` field (nullable, unique)
  - [ ] Test adding `invitationExpiresAt` field (nullable)
  - [ ] Test adding `invitedPlayerEmail` field (nullable)
  - [ ] Test adding `invitationCreatedAt` field (nullable)
  - [ ] Test index on `invitationToken` for fast lookups
- [ ] **Implement**: Create Prisma migration
  - [ ] Add `invitationToken String? @unique` to Match model
  - [ ] Add `invitationExpiresAt DateTime?`
  - [ ] Add `invitedPlayerEmail String?`
  - [ ] Add `invitationCreatedAt DateTime?`
  - [ ] Add `@@index([invitationToken])` for performance
- [ ] **Test**: Run migration and verify schema

#### 1.2 Entity Updates
- [ ] **Test**: Write tests for `IMatch` with invitation fields
  - [ ] Test `invitationToken` is optional
  - [ ] Test `invitationExpiresAt` is optional
  - [ ] Test `invitedPlayerEmail` is optional
- [ ] **Test**: Write tests for `IMatchCreate` with invitation
  - [ ] Test can create match with invitation
  - [ ] Test invitation fields are optional
- [ ] **Implement**: Update `Match.entity.ts`
  - [ ] Add `invitationToken?: string` to `IMatch`
  - [ ] Add `invitationExpiresAt?: Date` to `IMatch`
  - [ ] Add `invitedPlayerEmail?: string` to `IMatch`
  - [ ] Add `invitationCreatedAt?: Date` to `IMatch`
  - [ ] Add optional invitation fields to `IMatchCreate`

#### 1.3 DTO Updates
- [ ] **Test**: Write tests for new DTOs
  - [ ] Test `ICreateMatchWithInvitationDto`
  - [ ] Test `IJoinMatchByTokenDto`
  - [ ] Test `IMatchInvitationResponseDto`
- [ ] **Implement**: Create new DTOs in `match.dto.ts`
  - [ ] `ICreateMatchWithInvitationDto` - includes Player 1 info + invitation settings
  - [ ] `IJoinMatchByTokenDto` - includes token + Player 2 info
  - [ ] `IMatchInvitationResponseDto` - includes matchId, token, link, QR code data

#### 1.4 Validator Updates
- [ ] **Test**: Write tests for invitation validation
  - [ ] Test token format validation (UUID)
  - [ ] Test expiration date validation
  - [ ] Test email validation for invited player
- [ ] **Implement**: Create validators in `match.validator.ts`
  - [ ] `createMatchWithInvitationSchema`
  - [ ] `joinMatchByTokenSchema`

#### 1.5 Repository Interface Updates (ISP)
- [ ] **Test**: Write tests for `IMatchRepository` interface methods
  - [ ] Test `findByInvitationToken(token: string): Promise<IMatch | null>`
  - [ ] Test `updateInvitation(matchId: string, data: IInvitationUpdate): Promise<IMatch>`
- [ ] **Implement**: Add to `IMatchRepository`:
  - [ ] `findByInvitationToken(token: string): Promise<IMatch | null>`
  - [ ] `updateInvitation(matchId: string, data: IInvitationUpdate): Promise<IMatch>`

---

### Phase 2: Service Layer (Business Logic)

#### 2.1 Match Invitation Service (New Service - ISP)
- [ ] **Test**: Write tests for `IMatchInvitationService` interface
  - [ ] Test `createMatchWithInvitation()` method signature
  - [ ] Test `joinMatchByToken()` method signature
  - [ ] Test `getInvitationDetails()` method signature
  - [ ] Test `regenerateInvitationToken()` method signature
- [ ] **Implement**: Create `IMatchInvitationService` interface
  - [ ] `createMatchWithInvitation(data: ICreateMatchWithInvitationDto): Promise<IMatchInvitationResponseDto>`
  - [ ] `joinMatchByToken(data: IJoinMatchByTokenDto): Promise<IMatch>`
  - [ ] `getInvitationDetails(token: string): Promise<IMatchInvitationResponseDto>`
  - [ ] `regenerateInvitationToken(matchId: string): Promise<string>`
  - [ ] `revokeInvitation(matchId: string): Promise<void>`

#### 2.2 Match Invitation Service Implementation
- [ ] **Test**: Write tests for `MatchInvitationService.createMatchWithInvitation()`
  - [ ] Test creates Player 1 if doesn't exist
  - [ ] Test creates match in "pending" status
  - [ ] Test generates unique invitation token (UUID)
  - [ ] Test sets expiration date (default 24 hours)
  - [ ] Test stores invited player email if provided
  - [ ] Test returns invitation link and QR code data
  - [ ] Test handles duplicate token generation (retry logic)
- [ ] **Test**: Write tests for `MatchInvitationService.joinMatchByToken()`
  - [ ] Test finds match by token
  - [ ] Test validates token expiration
  - [ ] Test validates match is still pending
  - [ ] Test creates Player 2 if doesn't exist
  - [ ] Test updates match with Player 2
  - [ ] Test changes match status to "ready" or "in_progress"
  - [ ] Test invalidates token after join
  - [ ] Test throws error if token expired
  - [ ] Test throws error if match already has Player 2
- [ ] **Test**: Write tests for `MatchInvitationService.getInvitationDetails()`
  - [ ] Test returns match details
  - [ ] Test returns invitation link
  - [ ] Test returns QR code data
  - [ ] Test throws error if token invalid
  - [ ] Test throws error if token expired
- [ ] **Test**: Write tests for `MatchInvitationService.regenerateInvitationToken()`
  - [ ] Test generates new token
  - [ ] Test invalidates old token
  - [ ] Test updates expiration date
- [ ] **Test**: Write tests for `MatchInvitationService.revokeInvitation()`
  - [ ] Test removes invitation token
  - [ ] Test clears expiration date
- [ ] **Implement**: Create `MatchInvitationService.ts`
  - [ ] Implement all methods with proper error handling
  - [ ] Use `IMatchRepository`, `IPlayerRepository`, `IUserRepository`
  - [ ] Generate UUID tokens using `uuid` package
  - [ ] Calculate expiration dates
  - [ ] Build invitation URLs

#### 2.3 QR Code Generation Service (New Service - ISP)
- [ ] **Test**: Write tests for `IQrCodeService` interface
  - [ ] Test `generateQRCode(data: string): Promise<string>` (base64 image)
  - [ ] Test `generateQRCodeSVG(data: string): Promise<string>` (SVG string)
- [ ] **Implement**: Create `IQrCodeService` interface
- [ ] **Test**: Write tests for `QrCodeService` implementation
  - [ ] Test generates valid QR code image
  - [ ] Test generates valid QR code SVG
  - [ ] Test handles invalid data gracefully
- [ ] **Implement**: Create `QrCodeService.ts`
  - [ ] Use `qrcode` npm package
  - [ ] Generate base64 PNG images
  - [ ] Generate SVG strings
  - [ ] Configurable size and error correction

---

### Phase 3: API Layer (Routes & Validation)

#### 3.1 Match Routes Updates
- [ ] **Test**: Write integration tests for `POST /matches/create-with-invitation`
  - [ ] Test creates match with Player 1
  - [ ] Test generates invitation token
  - [ ] Test returns invitation link and QR code
  - [ ] Test validates Player 1 data
  - [ ] Test handles duplicate usernames/emails
- [ ] **Test**: Write integration tests for `GET /matches/join/:token`
  - [ ] Test validates token format
  - [ ] Test returns match details for join page
  - [ ] Test throws error if token invalid
  - [ ] Test throws error if token expired
- [ ] **Test**: Write integration tests for `POST /matches/join/:token`
  - [ ] Test joins match with Player 2 data
  - [ ] Test creates Player 2 if doesn't exist
  - [ ] Test updates match status
  - [ ] Test invalidates token after join
  - [ ] Test throws error if match already has Player 2
- [ ] **Test**: Write integration tests for `GET /matches/:id/invitation`
  - [ ] Test returns invitation details
  - [ ] Test requires authentication (Player 1 only)
  - [ ] Test returns QR code data
- [ ] **Test**: Write integration tests for `POST /matches/:id/invitation/regenerate`
  - [ ] Test regenerates token
  - [ ] Test requires authentication (Player 1 only)
  - [ ] Test invalidates old token
- [ ] **Test**: Write integration tests for `DELETE /matches/:id/invitation`
  - [ ] Test revokes invitation
  - [ ] Test requires authentication (Player 1 only)
- [ ] **Implement**: Update `match.routes.ts`
  - [ ] Add `POST /create-with-invitation` endpoint
  - [ ] Add `GET /join/:token` endpoint (public, no auth)
  - [ ] Add `POST /join/:token` endpoint (public, no auth)
  - [ ] Add `GET /:id/invitation` endpoint (protected)
  - [ ] Add `POST /:id/invitation/regenerate` endpoint (protected)
  - [ ] Add `DELETE /:id/invitation` endpoint (protected)
  - [ ] Add validation middleware for all endpoints

---

### Phase 4: Frontend Implementation

#### 4.1 Split View Component
- [ ] **Test**: Write component tests for `SplitViewGameCreation`
  - [ ] Test renders Player 1 form on left
  - [ ] Test renders Player 2 form + QR code on right
  - [ ] Test responsive layout (stacks on mobile)
  - [ ] Test form validation
  - [ ] Test submission flow
- [ ] **Implement**: Create `SplitViewGameCreation.tsx`
  - [ ] Two-column layout (flex/grid)
  - [ ] Left: Player 1 registration form
  - [ ] Right: Player 2 registration form + QR code + shareable link
  - [ ] Responsive design (stacks on mobile)
  - [ ] Form validation
  - [ ] Loading states

#### 4.2 QR Code Component
- [ ] **Test**: Write component tests for `QRCodeDisplay`
  - [ ] Test renders QR code image
  - [ ] Test displays shareable link
  - [ ] Test copy to clipboard functionality
  - [ ] Test download QR code functionality
  - [ ] Test loading state
  - [ ] Test error state
- [ ] **Implement**: Create `QRCodeDisplay.tsx`
  - [ ] Display QR code image (from API or generated client-side)
  - [ ] Display shareable link
  - [ ] Copy to clipboard button
  - [ ] Download QR code button
  - [ ] Share via native share API (if available)

#### 4.3 Game Join Page
- [ ] **Test**: Write component tests for `JoinGamePage`
  - [ ] Test extracts token from URL
  - [ ] Test fetches match details
  - [ ] Test displays Player 1 info
  - [ ] Test renders Player 2 registration form
  - [ ] Test handles expired token
  - [ ] Test handles invalid token
  - [ ] Test submission flow
- [ ] **Implement**: Create `app/join-game/[token]/page.tsx`
  - [ ] Extract token from URL params
  - [ ] Fetch match details via API
  - [ ] Display Player 1 information
  - [ ] Render Player 2 registration form
  - [ ] Handle form submission
  - [ ] Redirect to game page on success
  - [ ] Error handling (expired/invalid token)

#### 4.4 API Hooks
- [ ] **Test**: Write tests for new hooks
  - [ ] Test `useCreateMatchWithInvitation()`
  - [ ] Test `useJoinMatchByToken()`
  - [ ] Test `useGetInvitationDetails()`
- [ ] **Implement**: Update `useMatches.ts`
  - [ ] Add `useCreateMatchWithInvitation()` hook
  - [ ] Add `useJoinMatchByToken()` hook
  - [ ] Add `useGetInvitationDetails()` hook
  - [ ] Add `useRegenerateInvitationToken()` hook
  - [ ] Add `useRevokeInvitation()` hook

#### 4.5 Real-time Updates
- [ ] **Test**: Write tests for Socket.io integration
  - [ ] Test listens for `match:player2-joined` event
  - [ ] Test updates UI when Player 2 joins
  - [ ] Test handles connection errors
- [ ] **Implement**: Update Socket handlers
  - [ ] Add `match:player2-joined` event emission (backend)
  - [ ] Add `match:player2-joined` event listener (frontend)
  - [ ] Update UI when Player 2 joins
  - [ ] Show notification/alert

---

### Phase 5: QR Code Generation

#### 5.1 Client-Side QR Code (Optional)
- [ ] **Test**: Write tests for client-side QR generation
  - [ ] Test generates QR code from URL
  - [ ] Test handles errors gracefully
- [ ] **Implement**: Add QR code library
  - [ ] Install `qrcode.react` or `react-qr-code`
  - [ ] Generate QR code component
  - [ ] Fallback if API fails

#### 5.2 Server-Side QR Code
- [ ] **Test**: Write tests for server-side QR generation
  - [ ] Test generates base64 image
  - [ ] Test generates SVG string
  - [ ] Test configurable size
- [ ] **Implement**: Add QR code service
  - [ ] Install `qrcode` npm package (backend)
  - [ ] Implement `QrCodeService`
  - [ ] Generate QR codes in API responses

---

### Phase 6: Security & Validation

#### 6.1 Token Security
- [ ] **Test**: Write security tests
  - [ ] Test token is UUID format
  - [ ] Test token is unique per match
  - [ ] Test token cannot be guessed
  - [ ] Test token expires after set time
  - [ ] Test token invalidated after use
- [ ] **Implement**: Security measures
  - [ ] Use UUID v4 for tokens
  - [ ] Set expiration (24 hours default)
  - [ ] Invalidate token after join
  - [ ] Rate limiting on join attempts
  - [ ] Log join attempts

#### 6.2 Validation
- [ ] **Test**: Write validation tests
  - [ ] Test token format validation
  - [ ] Test expiration validation
  - [ ] Test match status validation
  - [ ] Test Player 2 data validation
- [ ] **Implement**: Validation
  - [ ] Validate token format (UUID)
  - [ ] Check expiration before allowing join
  - [ ] Verify match is in "pending" status
  - [ ] Validate Player 2 registration data

---

## 🔍 ISP Compliance Analysis

### Current ISP Status: ✅ GOOD
- Services are well-segregated
- `IMatchService` is focused on match CRUD
- `IMatchGameplayService` is focused on gameplay

### Recommendations for ISP Compliance

#### 1. Create New Service Interface
- ✅ **DO**: Create `IMatchInvitationService` (separate from `IMatchService`)
- ✅ **DO**: Create `IQrCodeService` (separate utility service)
- ❌ **DON'T**: Add invitation methods to `IMatchService` (violates ISP)

#### 2. Separate Concerns
- ✅ **DO**: Keep invitation logic in `MatchInvitationService`
- ✅ **DO**: Keep QR code generation in `QrCodeService`
- ✅ **DO**: Keep match CRUD in `MatchService`
- ✅ **DO**: Keep gameplay logic in `MatchGameplayService`

#### 3. Interface Segregation
- ✅ **Current**: `IMatchService` has only match CRUD methods
- ✅ **Current**: `IMatchGameplayService` has only gameplay methods
- ✅ **Recommendation**: Create `IMatchInvitationService` for invitation methods
- ✅ **Recommendation**: Create `IQrCodeService` for QR code generation

---

## 🚨 Critical Considerations

### 1. Token Management
- **Issue**: Tokens must be unique and secure
- **Solution**:
  - Use UUID v4 for tokens
  - Store in database with unique constraint
  - Implement retry logic for collisions (unlikely but possible)
  - Set expiration dates (24 hours default, configurable)

### 2. Token Expiration
- **Issue**: Tokens should expire to prevent abuse
- **Solution**:
  - Store `invitationExpiresAt` in database
  - Check expiration before allowing join
  - Allow regeneration of expired tokens
  - Show expiration time in UI

### 3. Match Status Flow
- **Issue**: Match status must transition correctly
- **Solution**:
  - Create match in "pending" status
  - Change to "ready" when Player 2 joins
  - Change to "in_progress" when game starts
  - Prevent joining if match already started

### 4. Real-time Updates
- **Issue**: Player 1 should know when Player 2 joins
- **Solution**:
  - Use Socket.io to emit `match:player2-joined` event
  - Update UI in real-time
  - Show notification/alert
  - Redirect to game page automatically

### 5. QR Code Generation
- **Issue**: QR codes can be generated client-side or server-side
- **Solution**:
  - **Option A**: Generate on server (more secure, consistent)
  - **Option B**: Generate on client (faster, less server load)
  - **Recommendation**: Generate on server, cache if needed

### 6. Shareable Link Format
- **Issue**: Link must be user-friendly and secure
- **Solution**:
  - Format: `https://rpsfull.com/join-game/{token}`
  - Token is UUID (not guessable)
  - Link is shareable via any method (email, SMS, etc.)
  - Link works on mobile and desktop

### 7. Mobile Responsiveness
- **Issue**: Split view must work on mobile
- **Solution**:
  - Use responsive grid/flexbox
  - Stack panels vertically on mobile
  - QR code should be visible and scannable
  - Touch-friendly buttons and inputs

---

## 📝 Implementation Order (TDD)

### Recommended Sequence:
1. **Contracts First** (Phase 1)
   - Update database schema
   - Update entities, DTOs, validators, interfaces
   - Write tests first, then implement
   
2. **Services** (Phase 2)
   - Implement `MatchInvitationService` with tests
   - Implement `QrCodeService` with tests
   
3. **API** (Phase 3)
   - Update routes with integration tests
   
4. **Frontend** (Phase 4)
   - Update UI with component tests
   
5. **Real-time** (Phase 4.5)
   - Add Socket.io events
   
6. **Security** (Phase 6)
   - Add security measures and validation

---

## 🎯 Success Criteria

### Functional Requirements
- [ ] Player 1 can create match with invitation
- [ ] QR code is generated and displayed
- [ ] Shareable link is generated and copyable
- [ ] Player 2 can join via link/QR code
- [ ] Token expires after set time
- [ ] Real-time updates when Player 2 joins
- [ ] Match status transitions correctly
- [ ] Mobile-responsive design

### Non-Functional Requirements
- [ ] 100% test coverage maintained
- [ ] ISP compliance maintained
- [ ] Security: Tokens are secure and unique
- [ ] Performance: QR code generation < 100ms
- [ ] UX: Smooth, intuitive flow
- [ ] Accessibility: Screen reader friendly

---

## 📚 Additional Notes

### QR Code Library Options
```typescript
// Option 1: Server-side (Node.js)
import QRCode from 'qrcode';
const qrCodeDataUrl = await QRCode.toDataURL(invitationUrl);

// Option 2: Client-side (React)
import { QRCodeSVG } from 'qrcode.react';
<QRCodeSVG value={invitationUrl} />
```

### Invitation URL Format
```
https://rpsfull.com/join-game/{token}
Example: https://rpsfull.com/join-game/550e8400-e29b-41d4-a716-446655440000
```

### Match Status Flow
```
pending (Player 1 created, waiting for Player 2)
  ↓
ready (Player 2 joined, ready to start)
  ↓
in_progress (Game started)
  ↓
completed (Game finished)
```

### Token Expiration
```typescript
// Default: 24 hours
const expirationDate = new Date();
expirationDate.setHours(expirationDate.getHours() + 24);

// Configurable via environment variable
const expirationHours = parseInt(process.env.MATCH_INVITATION_EXPIRATION_HOURS || '24');
```

---

## 🔄 User Flows

### Flow 1: Player 1 Creates Game with Invitation
1. Player 1 fills in registration form (left side)
2. Clicks "Create Game & Generate Link"
3. System creates Player 1 account (if new)
4. System creates match in "pending" status
5. System generates invitation token
6. System generates QR code and shareable link
7. UI displays QR code and link (right side)
8. Player 1 can copy link or share QR code

### Flow 2: Player 2 Joins via Link
1. Player 2 clicks shared link
2. System validates token
3. System checks expiration
4. System displays match details and Player 1 info
5. Player 2 fills in registration form
6. Player 2 clicks "Join Game"
7. System creates Player 2 account (if new)
8. System updates match with Player 2
9. System changes match status to "ready"
10. System emits Socket.io event
11. Both players redirected to game page

### Flow 3: Player 2 Joins via QR Code
1. Player 2 scans QR code with phone
2. Phone opens link in browser
3. Continue from Flow 2, step 2

---

## ✅ Final Checklist Before Implementation

- [ ] Review all test cases
- [ ] Review ISP compliance
- [ ] Review database migration plan
- [ ] Review security considerations
- [ ] Review UX/UI design
- [ ] Review real-time update strategy
- [ ] Get stakeholder approval
- [ ] Create feature branch
- [ ] Begin Phase 1 (Contracts & Tests)

---

## 📦 Dependencies to Add

### Backend
```json
{
  "dependencies": {
    "qrcode": "^1.5.3",
    "uuid": "^9.0.0" // Already installed
  }
}
```

### Frontend
```json
{
  "dependencies": {
    "qrcode.react": "^3.1.0", // Optional: client-side generation
    "react-qr-code": "^2.0.0" // Alternative option
  }
}
```

---

**Status**: ✅ Analysis Complete - Ready for Implementation Review

**Next Steps**: 
1. Review this checklist with team
2. Approve implementation approach
3. Begin Phase 1 with TDD

