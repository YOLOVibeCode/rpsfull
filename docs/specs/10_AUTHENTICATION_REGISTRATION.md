# Authentication & User Registration Specification
## RPSFull Tournament Platform - Simple Email-Based Registration

**Document Version:** 1.1  
**Last Updated:** November 22, 2025  
**Status:** Draft  
**Repository:** https://github.com/YOLOVibeCode/rpsfull.git  

---

## 1. Overview

### 1.1 Registration Philosophy

**Keep It Simple:**
- Email-only registration (no complex forms)
- No password requirements initially (magic link/OTP)
- Optional password setup later
- Fast onboarding (< 30 seconds)
- Social login as alternative (Google, Apple)

### 1.2 User Journey Types

1. **Direct Registration**: User signs up on their own
2. **Tournament Invitation**: Organizer invites player via email
3. **Guest Play**: Play without account, register later to save stats
4. **Social Login**: Quick registration via OAuth

---

## 2. Direct Registration Flow

### 2.1 Simple Email Registration

**Step 1: Email Input**
```
┌─────────────────────────────────────────┐
│         Welcome to RPSFull              │
│                                         │
│  Play Rock Paper Scissors tournaments  │
│                                         │
│  Email: [_____________________]         │
│                                         │
│         [Continue with Email]           │
│                                         │
│  ────────── OR ──────────               │
│                                         │
│  [Continue with Google]                 │
│  [Continue with Apple]                  │
│                                         │
│  [Play as Guest] (no registration)      │
│                                         │
└─────────────────────────────────────────┘
```

**Step 2: Magic Link Sent**
```
┌─────────────────────────────────────────┐
│         Check Your Email                │
│                                         │
│  We sent a login link to:              │
│  user@example.com                       │
│                                         │
│  Click the link to continue            │
│                                         │
│  Didn't receive it?                     │
│  [Resend Email]                         │
│                                         │
│  [Use a different email]                │
│                                         │
└─────────────────────────────────────────┘
```

**Step 3: Complete Profile (Optional)**
```
┌─────────────────────────────────────────┐
│         Welcome!                        │
│                                         │
│  Display Name: [_________________]      │
│  (What others will see)                 │
│                                         │
│  [Skip for Now]  [Continue]            │
│                                         │
└─────────────────────────────────────────┘
```

### 2.2 Registration API Endpoints

```typescript
// POST /api/v1/auth/register/email
interface EmailRegistrationRequest {
  email: string;
  referralCode?: string;
  invitationToken?: string;
}

Response: 200 OK
{
  "success": true,
  "message": "Magic link sent to your email",
  "data": {
    "email": "user@example.com",
    "expiresIn": 900  // 15 minutes
  }
}

// GET /api/v1/auth/verify/email?token={token}
// Verifies magic link and creates session
Response: 302 Redirect to /dashboard
Set-Cookie: accessToken, refreshToken

// POST /api/v1/auth/complete-profile
interface CompleteProfileRequest {
  displayName: string;
  avatarUrl?: string;
}
```

---

## 3. Tournament Invitation System

### 3.1 Invitation Flow

**Step 1: Organizer Adds Players**
```
┌─────────────────────────────────────────┐
│  Create Tournament: Add Players         │
│                                         │
│  Player 1:                              │
│  Name: [John Doe________]               │
│  Email: [john@example.com] (optional)   │
│  [×] Remove                             │
│                                         │
│  Player 2:                              │
│  Name: [Jane Smith______]               │
│  Email: [jane@example.com] (optional)   │
│  [×] Remove                             │
│                                         │
│  Player 3:                              │
│  Name: [Bob Wilson______]               │
│  Email: [________________] (optional)   │
│  [×] Remove                             │
│                                         │
│  [+ Add Player]                         │
│                                         │
│  [✓] Send email invitations             │
│                                         │
│  [Save & Continue]                      │
│                                         │
└─────────────────────────────────────────┘
```

**Step 2: System Sends Invitations**

Automatically sends email to all players with email addresses:

```
Subject: You're invited to "Friday Night RPS Championship"

Hi John,

You've been invited by Alex Johnson to join the tournament:

🏆 Friday Night RPS Championship
📅 Starts: Nov 25, 2025 at 6:00 PM
🎮 Game: Classic Rock Paper Scissors
👥 Players: 16

[Accept Invitation & Register]

Or copy this link:
https://rpsfull.com/invite/abc123def456

See you there!
- The RPSFull Team
```

**Step 3: Player Accepts Invitation**
```
┌─────────────────────────────────────────┐
│  Tournament Invitation                  │
│                                         │
│  You've been invited to:                │
│  🏆 Friday Night RPS Championship       │
│                                         │
│  Organized by: Alex Johnson             │
│  Starts: Nov 25 at 6:00 PM             │
│  Players: 16 (12 confirmed)             │
│                                         │
│  ────────────────────────────            │
│                                         │
│  To accept, register with:              │
│  Email: john@example.com ✓              │
│  (This was provided by organizer)       │
│                                         │
│  Display Name: [John Doe_________]      │
│                                         │
│  [Accept & Register]                    │
│                                         │
│  Already have an account?               │
│  [Log in instead]                       │
│                                         │
└─────────────────────────────────────────┘
```

### 3.2 Invitation Database Schema

```sql
CREATE TABLE "TournamentInvitation" (
    id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tournament_id       UUID NOT NULL REFERENCES "Tournament"(id) ON DELETE CASCADE,
    
    -- Invitee Info
    email               VARCHAR(255) NOT NULL,
    player_name         VARCHAR(100) NOT NULL,
    
    -- Invitation Details
    invitation_token    VARCHAR(255) NOT NULL UNIQUE,
    invited_by          UUID NOT NULL REFERENCES "User"(id),
    
    -- Status
    status              VARCHAR(50) DEFAULT 'pending',
    -- 'pending', 'accepted', 'declined', 'expired'
    
    -- Tracking
    sent_at             TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    opened_at           TIMESTAMP,
    accepted_at         TIMESTAMP,
    declined_at         TIMESTAMP,
    expires_at          TIMESTAMP NOT NULL,
    
    -- Created Player (if accepted)
    player_id           UUID REFERENCES "Player"(id),
    
    -- Reminders
    reminder_sent_count INTEGER DEFAULT 0,
    last_reminder_at    TIMESTAMP,
    
    UNIQUE(tournament_id, email)
);

CREATE INDEX idx_invitation_token ON "TournamentInvitation"(invitation_token);
CREATE INDEX idx_invitation_tournament ON "TournamentInvitation"(tournament_id, status);
CREATE INDEX idx_invitation_email ON "TournamentInvitation"(email, status);
CREATE INDEX idx_invitation_expires ON "TournamentInvitation"(expires_at) WHERE status = 'pending';
```

### 3.3 Invitation API Endpoints

```typescript
// POST /api/v1/tournaments/{tournamentId}/invitations
interface SendInvitationsRequest {
  players: Array<{
    name: string;
    email: string;
  }>;
  sendEmail: boolean;
  customMessage?: string;
}

Response: 201 Created
{
  "success": true,
  "data": {
    "invitationsSent": 3,
    "invitations": [
      {
        "id": "uuid",
        "email": "john@example.com",
        "invitationToken": "abc123",
        "status": "pending",
        "expiresAt": "2025-11-25T18:00:00Z"
      }
    ]
  }
}

// GET /api/v1/invitations/{token}
// Retrieve invitation details
Response: 200 OK
{
  "success": true,
  "data": {
    "tournament": {
      "id": "uuid",
      "name": "Friday Night Championship",
      "startDate": "2025-11-25T18:00:00Z",
      "organizerName": "Alex Johnson"
    },
    "invitee": {
      "name": "John Doe",
      "email": "john@example.com"
    },
    "status": "pending",
    "expiresAt": "2025-11-25T18:00:00Z"
  }
}

// POST /api/v1/invitations/{token}/accept
interface AcceptInvitationRequest {
  displayName?: string;  // Can override suggested name
  createAccount: boolean;
}

Response: 200 OK
{
  "success": true,
  "data": {
    "player": {
      "id": "uuid",
      "name": "John Doe"
    },
    "tournament": {
      "id": "uuid",
      "name": "Friday Night Championship"
    },
    "accessToken": "jwt_token",
    "refreshToken": "refresh_token"
  }
}

// POST /api/v1/invitations/{token}/decline
Response: 200 OK

// POST /api/v1/invitations/{token}/resend
// Resend invitation email
```

---

## 4. Email Templates

### 4.1 Tournament Invitation Email

**HTML Email Template:**

```html
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <style>
    body { font-family: -apple-system, system-ui, sans-serif; }
    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
    .header { text-align: center; padding: 20px; }
    .tournament-card { 
      background: #f3f4f6; 
      border-radius: 12px; 
      padding: 24px; 
      margin: 20px 0; 
    }
    .button { 
      display: inline-block; 
      background: #3b82f6; 
      color: white; 
      padding: 12px 32px; 
      border-radius: 8px; 
      text-decoration: none;
      font-weight: 600;
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>🎮 RPSFull</h1>
      <h2>You're Invited to a Tournament!</h2>
    </div>
    
    <p>Hi {{player_name}},</p>
    
    <p>{{organizer_name}} has invited you to join:</p>
    
    <div class="tournament-card">
      <h3>🏆 {{tournament_name}}</h3>
      <p><strong>Starts:</strong> {{start_date}}</p>
      <p><strong>Game:</strong> {{game_type}}</p>
      <p><strong>Players:</strong> {{participant_count}}/{{max_participants}}</p>
      {{#if custom_message}}
      <p><em>"{{custom_message}}"</em></p>
      {{/if}}
    </div>
    
    <div style="text-align: center; margin: 32px 0;">
      <a href="{{invitation_link}}" class="button">
        Accept Invitation & Register
      </a>
    </div>
    
    <p style="color: #6b7280; font-size: 14px;">
      Or copy this link:<br>
      <a href="{{invitation_link}}">{{invitation_link}}</a>
    </p>
    
    <p style="color: #6b7280; font-size: 14px;">
      This invitation expires on {{expiry_date}}.
    </p>
    
    <hr style="margin: 32px 0; border: none; border-top: 1px solid #e5e7eb;">
    
    <p style="color: #9ca3af; font-size: 12px; text-align: center;">
      You received this email because {{organizer_name}} invited you to RPSFull.<br>
      Don't want to participate? You can ignore this email.
    </p>
  </div>
</body>
</html>
```

### 4.2 Magic Link Email

```html
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <style>
    /* Similar styling */
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>🎮 RPSFull</h1>
      <h2>Your Login Link</h2>
    </div>
    
    <p>Hi there,</p>
    
    <p>Click the button below to log in to your RPSFull account:</p>
    
    <div style="text-align: center; margin: 32px 0;">
      <a href="{{magic_link}}" class="button">
        Log In to RPSFull
      </a>
    </div>
    
    <p style="color: #6b7280; font-size: 14px;">
      Or copy this link:<br>
      <a href="{{magic_link}}">{{magic_link}}</a>
    </p>
    
    <p style="color: #6b7280; font-size: 14px;">
      This link expires in 15 minutes for security.
    </p>
    
    <p style="color: #ef4444; font-size: 14px;">
      <strong>Didn't request this?</strong> You can safely ignore this email.
    </p>
  </div>
</body>
</html>
```

### 4.3 Welcome Email (After Registration)

```html
<!DOCTYPE html>
<html>
<body>
  <div class="container">
    <div class="header">
      <h1>🎮 Welcome to RPSFull!</h1>
    </div>
    
    <p>Hi {{display_name}},</p>
    
    <p>Thanks for joining RPSFull! You're all set to play.</p>
    
    <h3>🚀 Get Started:</h3>
    <ul>
      <li><a href="{{app_url}}/play">Play a Quick Match</a></li>
      <li><a href="{{app_url}}/tournaments">Browse Tournaments</a></li>
      <li><a href="{{app_url}}/profile">Complete Your Profile</a></li>
    </ul>
    
    <h3>📊 Track Your Stats:</h3>
    <p>Every match you play is recorded. View your performance, analyze your moves, and climb the leaderboard!</p>
    
    <div style="text-align: center; margin: 32px 0;">
      <a href="{{app_url}}" class="button">
        Start Playing
      </a>
    </div>
    
    <p>Have questions? Reply to this email anytime.</p>
    
    <p>See you in the arena!</p>
    <p>- The RPSFull Team</p>
  </div>
</body>
</html>
```

### 4.4 Reminder Email (Tournament Starting Soon)

```html
<!DOCTYPE html>
<html>
<body>
  <div class="container">
    <h2>⏰ Tournament Starting Soon!</h2>
    
    <p>Hi {{player_name}},</p>
    
    <p>Just a reminder that your tournament is starting soon:</p>
    
    <div class="tournament-card">
      <h3>🏆 {{tournament_name}}</h3>
      <p><strong>Starts in:</strong> {{time_until_start}}</p>
      <p><strong>Time:</strong> {{start_time}}</p>
    </div>
    
    <div style="text-align: center; margin: 32px 0;">
      <a href="{{tournament_link}}" class="button">
        View Tournament
      </a>
    </div>
    
    <p>Make sure you're ready to play!</p>
  </div>
</body>
</html>
```

---

## 5. Guest Play & Conversion

### 5.1 Guest Play Flow

**Allow Playing Without Account:**
```
┌─────────────────────────────────────────┐
│  Quick Match                            │
│                                         │
│  You're playing as Guest                │
│  Guest_7428                             │
│                                         │
│  [Play Another Match]                   │
│                                         │
│  ────────────────────────────            │
│                                         │
│  💾 Save your stats?                    │
│  Register to track your progress        │
│                                         │
│  [Register with Email]                  │
│  [Continue as Guest]                    │
│                                         │
└─────────────────────────────────────────┘
```

### 5.2 Guest Conversion Triggers

**Trigger registration prompts after:**
- 3 matches played
- First tournament win
- Reaching level 3
- Getting on leaderboard

**Conversion API:**
```typescript
// POST /api/v1/auth/convert-guest
interface ConvertGuestRequest {
  guestId: string;
  email: string;
  displayName?: string;
}

Response: 200 OK
{
  "success": true,
  "data": {
    "userId": "new_uuid",
    "playerId": "existing_player_uuid",
    "matchesPreserved": 15,
    "message": "Your stats have been saved!"
  }
}
```

---

## 6. Social Login Integration

### 6.1 OAuth Providers

**Supported Providers:**
- Google
- Apple
- GitHub (optional)
- Discord (optional)

### 6.2 OAuth Flow

```typescript
// GET /api/v1/auth/oauth/google
// Redirects to Google OAuth

// GET /api/v1/auth/oauth/callback/google?code=...
// Handles OAuth callback
Response: 302 Redirect to /dashboard
Set-Cookie: accessToken, refreshToken

// Creates user account automatically if new
// Links to existing account if email matches
```

### 6.3 Account Linking

```typescript
// POST /api/v1/auth/link-provider
interface LinkProviderRequest {
  provider: 'google' | 'apple' | 'github';
  accessToken: string;
}

// Allows linking multiple login methods to one account
```

---

## 7. Security Features

### 7.1 Magic Link Security

**Token Generation:**
```typescript
// Generate cryptographically secure token
const token = crypto.randomBytes(32).toString('hex');

// Store with expiration
await db.magicLink.create({
  email: 'user@example.com',
  token: await hash(token),
  expiresAt: new Date(Date.now() + 15 * 60 * 1000), // 15 min
  used: false
});
```

**Token Validation:**
```typescript
// One-time use only
// Expires in 15 minutes
// Must match email
// Rate limited (5 attempts per hour per email)
```

### 7.2 Rate Limiting

```typescript
interface RateLimits {
  emailRegistration: '5 per hour per IP',
  magicLinkRequest: '5 per hour per email',
  invitationAccept: '10 per hour per email',
  passwordReset: '3 per hour per email',
}
```

### 7.3 Email Verification

**Optional but recommended:**
```typescript
// After registration via magic link, email is auto-verified
// For OAuth, email is verified by provider
// For password registration, send verification email
```

---

## 8. Notification Preferences

### 8.1 Email Preferences

**User can control:**
- Tournament invitations (on/off)
- Tournament reminders (on/off)
- Match notifications (on/off)
- Weekly digest (on/off)
- Marketing emails (on/off)

```typescript
interface EmailPreferences {
  tournamentInvitations: boolean;
  tournamentReminders: boolean;
  matchNotifications: boolean;
  weeklyDigest: boolean;
  marketingEmails: boolean;
}
```

### 8.2 Preferences UI

```
┌─────────────────────────────────────────┐
│  Email Preferences                      │
│                                         │
│  [✓] Tournament invitations             │
│  [✓] Tournament reminders (24h before)  │
│  [✓] Match notifications                │
│  [✓] Weekly stats digest                │
│  [ ] Marketing and updates              │
│                                         │
│  [Save Preferences]                     │
│                                         │
└─────────────────────────────────────────┘
```

---

## 9. Admin & Organizer Tools

### 9.1 Bulk Invitations

**CSV Import:**
```
Name,Email
John Doe,john@example.com
Jane Smith,jane@example.com
Bob Wilson,bob@example.com
```

**API Endpoint:**
```typescript
// POST /api/v1/tournaments/{id}/invitations/bulk
Content-Type: multipart/form-data
{
  file: CSV file,
  sendEmails: true
}

Response: 201 Created
{
  "success": true,
  "data": {
    "totalInvitations": 50,
    "sent": 48,
    "failed": 2,
    "errors": [
      {"email": "invalid@", "reason": "Invalid email format"}
    ]
  }
}
```

### 9.2 Invitation Management Dashboard

```
┌─────────────────────────────────────────┐
│  Tournament: Friday Night RPS           │
│  Invitations (16 sent)                  │
│                                         │
│  Status:                                │
│  ✓ Accepted: 12                         │
│  ⏳ Pending: 3                          │
│  ✗ Declined: 1                          │
│                                         │
│  Name          Email            Status  │
│  John Doe      john@...         ✓ Ready│
│  Jane Smith    jane@...         ⏳ Sent │
│  Bob Wilson    bob@...          ✓ Ready│
│  ...                                    │
│                                         │
│  [Send Reminders to Pending]            │
│  [Add More Players]                     │
│  [Export List]                          │
│                                         │
└─────────────────────────────────────────┘
```

---

## 10. Contracts Package Updates

### 10.1 New Interfaces

```typescript
// @rpsfull-platform/contracts

// In src/dtos/auth.dto.ts

export interface IRegisterEmailDto {
  email: string;
  referralCode?: string;
  invitationToken?: string;
}

export interface IMagicLinkVerifyDto {
  token: string;
}

export interface ICompleteProfileDto {
  displayName: string;
  avatarUrl?: string;
}

// In src/dtos/invitation.dto.ts

export interface ISendInvitationsDto {
  players: Array<{
    name: string;
    email: string;
  }>;
  sendEmail: boolean;
  customMessage?: string;
}

export interface IAcceptInvitationDto {
  displayName?: string;
  createAccount: boolean;
}

// In src/entities/Invitation.entity.ts

export interface ITournamentInvitation {
  readonly id: string;
  readonly tournamentId: string;
  readonly email: string;
  readonly playerName: string;
  readonly invitationToken: string;
  readonly invitedBy: string;
  readonly status: InvitationStatus;
  readonly sentAt: Date;
  readonly openedAt?: Date;
  readonly acceptedAt?: Date;
  readonly expiresAt: Date;
  readonly playerId?: string;
}

export enum InvitationStatus {
  PENDING = 'pending',
  ACCEPTED = 'accepted',
  DECLINED = 'declined',
  EXPIRED = 'expired',
}
```

---

## 11. Implementation Checklist

### Phase 1: Basic Registration
- [ ] Email-only registration
- [ ] Magic link generation
- [ ] Magic link verification
- [ ] Email service integration (SendGrid/AWS SES)
- [ ] Basic email templates
- [ ] Profile completion

### Phase 2: Tournament Invitations
- [ ] Invitation database schema
- [ ] Send invitations API
- [ ] Invitation acceptance flow
- [ ] Invitation email templates
- [ ] Invitation management dashboard

### Phase 3: Enhanced Features
- [ ] Guest play
- [ ] Guest conversion
- [ ] Social login (Google/Apple)
- [ ] Bulk invitations (CSV)
- [ ] Email preferences
- [ ] Reminder emails

### Phase 4: Polish
- [ ] Rate limiting
- [ ] Security hardening
- [ ] Email deliverability optimization
- [ ] Analytics tracking
- [ ] A/B testing email templates

---

## 12. Email Service Configuration

### 12.1 Provider Choice

**Recommended: SendGrid**
- Reliable delivery
- Good free tier (100 emails/day)
- Template management
- Analytics

**Alternative: AWS SES**
- Lower cost at scale
- Good for high volume
- Requires more setup

### 12.2 Email Configuration

```typescript
// Email service config
interface EmailConfig {
  provider: 'sendgrid' | 'aws-ses';
  apiKey: string;
  fromEmail: 'noreply@rpsfull.com';
  fromName: 'RPSFull';
  replyTo: 'support@rpsfull.com';
  
  templates: {
    magicLink: 'd-abc123',
    tournamentInvitation: 'd-def456',
    welcome: 'd-ghi789',
    reminder: 'd-jkl012',
  };
}
```

---

**Document Approval:**
- [ ] Product Owner
- [ ] Security Lead
- [ ] Backend Lead
- [ ] UX Designer

---

END OF DOCUMENT

