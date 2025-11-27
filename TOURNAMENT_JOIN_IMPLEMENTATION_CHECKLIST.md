# 🏆 Tournament Registration - Complete Implementation Checklist

## Executive Summary

This document outlines the complete implementation plan for making tournament registration **as easy as possible**. We will implement **ALL three options** to provide maximum flexibility:

| Option | Description | User Friction | Best For |
|--------|-------------|---------------|----------|
| **A** | Public Tournament Page | Medium | Organic discovery |
| **B** | Invitation Token System | Low | Targeted invitations |
| **C** | Magic Link Registration | Very Low | Mass invitations |

---

## 📊 Current State Analysis

### What EXISTS Today

| Component | Status | Notes |
|-----------|--------|-------|
| Tournament detail page | ✅ | `/tournaments/[id]` - requires auth |
| "Register Now" button | ✅ | Only visible when logged in |
| Registration API | ✅ | `POST /api/v1/tournaments/:id/register` - requires auth |
| WebSocket registration | ✅ | `tournament:register` event |
| Tournament DTO | ✅ | `ITournamentInvitationDto` already defined |

### What's MISSING

| Component | Status | Required For |
|-----------|--------|--------------|
| Public tournament view | ❌ | Option A |
| Invitation token fields in DB | ❌ | Option B |
| Token generation service | ❌ | Option B |
| Join tournament page | ❌ | Options B, C |
| QR code for tournaments | ❌ | Option B |
| Share/copy buttons | ❌ | Options A, B |
| Magic link service | ❌ | Option C |
| Email sending | ❌ | Option C |
| Auto-create user on join | ❌ | Options B, C |

---

## 🏗️ Option A: Public Tournament Page (Simple Share Link)

### Overview
Allow anyone to view tournament details without login. Registration still requires account.

### A1. Database Changes
**None required** - tournament data is already public-readable.

### A2. Backend Changes

#### A2.1 Public Tournament Endpoint
```
GET /api/v1/tournaments/:id/public
```
- No authentication required
- Returns limited tournament info (no sensitive data)
- Rate limited to prevent abuse

**File:** `packages/backend/src/routes/tournament.routes.ts`

```typescript
// New endpoint - no authMiddleware
router.get('/:id/public', async (req, res: Response) => {
  try {
    const tournament = await tournamentService.getPublicTournamentById(req.params.id);
    res.json({ success: true, data: tournament });
  } catch (error: any) {
    res.status(404).json({ success: false, error: { message: 'Tournament not found' } });
  }
});
```

#### A2.2 Public Tournament Service Method
**File:** `packages/backend/src/services/TournamentService.ts`

```typescript
async getPublicTournamentById(tournamentId: string): Promise<IPublicTournament> {
  const tournament = await this.tournamentRepository.findById(tournamentId);
  if (!tournament) throw new Error('Tournament not found');
  
  // Return only public fields
  return {
    id: tournament.id,
    name: tournament.name,
    description: tournament.description,
    tournamentType: tournament.tournamentType,
    status: tournament.status,
    currentParticipants: tournament.participantCount,
    maxParticipants: tournament.maxParticipants,
    startDate: tournament.startDate,
    registrationDeadline: tournament.registrationDeadline,
    gameType: { name: gameType.name, description: gameType.description },
  };
}
```

### A3. Frontend Changes

#### A3.1 Public Tournament Page
**New File:** `packages/frontend/src/app/t/[id]/page.tsx`

Short URL: `/t/{tournament-id}` (user-friendly)

```tsx
// Public page - no authentication required
export default function PublicTournamentPage() {
  const { id } = useParams();
  const { data: tournament } = usePublicTournament(id);
  const { user } = useAuth();
  
  return (
    <div>
      <TournamentPublicInfo tournament={tournament} />
      
      {user ? (
        <RegisterButton tournamentId={id} />
      ) : (
        <LoginToRegisterCTA tournamentId={id} />
      )}
    </div>
  );
}
```

#### A3.2 Login Redirect with Return URL
**File:** `packages/frontend/src/app/login/page.tsx`

Modify to accept `?returnTo=/t/{id}` query param.

#### A3.3 Share Button on Tournament Page
**File:** `packages/frontend/src/app/(dashboard)/tournaments/[id]/page.tsx`

```tsx
<ShareButton 
  url={`${window.location.origin}/t/${tournamentId}`}
  title={`Join ${tournament.name}`}
/>
```

### A4. New Components

| Component | File | Purpose |
|-----------|------|---------|
| `TournamentPublicInfo` | `components/tournament/TournamentPublicInfo.tsx` | Display public info |
| `LoginToRegisterCTA` | `components/tournament/LoginToRegisterCTA.tsx` | Prompt login |
| `ShareButton` | `components/ui/ShareButton.tsx` | Copy/share link |

### A5. Contracts Changes

**File:** `packages/contracts/src/dtos/tournament.dto.ts`

```typescript
export interface IPublicTournamentDto {
  id: string;
  name: string;
  description?: string;
  tournamentType: TournamentType;
  status: TournamentStatus;
  currentParticipants: number;
  maxParticipants?: number;
  startDate?: Date;
  registrationDeadline?: Date;
  gameType: {
    name: string;
    description?: string;
  };
}
```

---

## 🎫 Option B: Tournament Invitation Token System

### Overview
Full invitation system like match invitations. Generate unique tokens, QR codes, and allow unauthenticated users to join.

### B1. Database Changes

#### B1.1 Add Invitation Fields to Tournament
**File:** `packages/backend/prisma/schema.prisma`

```prisma
model Tournament {
  // ... existing fields ...
  
  // New invitation fields
  invitationToken      String?   @unique @map("invitation_token")
  invitationExpiresAt  DateTime? @map("invitation_expires_at")
  invitationCreatedAt  DateTime? @map("invitation_created_at")
  invitationEnabled    Boolean   @default(false) @map("invitation_enabled")
  
  // ... rest of model ...
  @@index([invitationToken])
}
```

#### B1.2 Migration
```bash
npx prisma migrate dev --name add_tournament_invitation_fields
```

### B2. Backend Changes

#### B2.1 TournamentInvitationService
**New File:** `packages/backend/src/services/TournamentInvitationService.ts`

```typescript
export class TournamentInvitationService {
  constructor(
    private tournamentRepository: ITournamentRepository,
    private userRepository: IUserRepository,
    private playerRepository: IPlayerRepository,
    private tournamentRegistrationService: TournamentRegistrationService,
    private qrCodeService: IQrCodeService
  ) {}

  // Generate invitation for tournament
  async createInvitation(tournamentId: string, organizerId: string): Promise<ITournamentInvitationResponse> {
    const tournament = await this.tournamentRepository.findById(tournamentId);
    if (!tournament) throw new Error('Tournament not found');
    if (tournament.organizerId !== organizerId) throw new Error('Not authorized');
    
    const token = uuidv4();
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7); // 7 days expiry
    
    await this.tournamentRepository.update(tournamentId, {
      invitationToken: token,
      invitationExpiresAt: expiresAt,
      invitationCreatedAt: new Date(),
      invitationEnabled: true,
    });
    
    const baseUrl = process.env.FRONTEND_URL || 'http://localhost:4445';
    const invitationLink = `${baseUrl}/join-tournament/${token}`;
    const qrCodeDataUrl = await this.qrCodeService.generateQRCode(invitationLink);
    
    return {
      tournamentId,
      invitationToken: token,
      invitationLink,
      qrCodeDataUrl,
      expiresAt,
      tournamentName: tournament.name,
    };
  }

  // Get invitation details by token
  async getInvitationDetails(token: string): Promise<ITournamentInvitationDetails> {
    const tournament = await this.tournamentRepository.findByInvitationToken(token);
    if (!tournament) throw new Error('Invalid invitation token');
    if (tournament.invitationExpiresAt < new Date()) throw new Error('Invitation expired');
    
    return {
      tournamentId: tournament.id,
      name: tournament.name,
      description: tournament.description,
      tournamentType: tournament.tournamentType,
      currentParticipants: tournament.participantCount,
      maxParticipants: tournament.maxParticipants,
      startDate: tournament.startDate,
      organizerName: organizer.displayName,
    };
  }

  // Join tournament via token (creates user if needed)
  async joinByToken(token: string, playerInfo: IPlayerInfo): Promise<IJoinResult> {
    const tournament = await this.tournamentRepository.findByInvitationToken(token);
    if (!tournament) throw new Error('Invalid invitation token');
    if (tournament.invitationExpiresAt < new Date()) throw new Error('Invitation expired');
    if (tournament.status !== 'registration') throw new Error('Registration closed');
    
    // Get or create player (reuse logic from MatchInvitationService)
    const player = await this.getOrCreatePlayer(playerInfo);
    
    // Register player
    await this.tournamentRegistrationService.registerPlayer(tournament.id, player.id);
    
    // Generate tokens for auto-login
    const accessToken = this.generateAccessToken(player.userId);
    
    return {
      tournamentId: tournament.id,
      playerId: player.id,
      accessToken,
    };
  }

  // Revoke invitation
  async revokeInvitation(tournamentId: string, organizerId: string): Promise<void> {
    // ... validation and update
  }

  // Regenerate token
  async regenerateToken(tournamentId: string, organizerId: string): Promise<string> {
    // ... generate new token
  }
}
```

#### B2.2 New Routes
**File:** `packages/backend/src/routes/tournament.routes.ts`

```typescript
// Create invitation (organizer only)
router.post('/:id/invitation', authMiddleware, async (req, res) => {
  const invitation = await tournamentInvitationService.createInvitation(
    req.params.id,
    req.user.id
  );
  res.json({ success: true, data: invitation });
});

// Get invitation details (public)
router.get('/join/:token', async (req, res) => {
  const details = await tournamentInvitationService.getInvitationDetails(req.params.token);
  res.json({ success: true, data: details });
});

// Join via token (public)
router.post('/join/:token', async (req, res) => {
  const result = await tournamentInvitationService.joinByToken(
    req.params.token,
    req.body.player
  );
  res.json({ success: true, data: result });
});

// Revoke invitation (organizer only)
router.delete('/:id/invitation', authMiddleware, async (req, res) => {
  await tournamentInvitationService.revokeInvitation(req.params.id, req.user.id);
  res.json({ success: true });
});
```

#### B2.3 Repository Updates
**File:** `packages/backend/src/repositories/TournamentRepository.ts`

```typescript
async findByInvitationToken(token: string): Promise<ITournament | null> {
  const result = await this.prisma.tournament.findUnique({
    where: { invitationToken: token },
  });
  return result ? this.mapToEntity(result) : null;
}
```

### B3. Frontend Changes

#### B3.1 Join Tournament Page
**New File:** `packages/frontend/src/app/join-tournament/[token]/page.tsx`

```tsx
// Similar to /join-game/[token]/page.tsx
export default function JoinTournamentPage() {
  const { token } = useParams();
  const [invitationDetails, setInvitationDetails] = useState(null);
  const [playerData, setPlayerData] = useState({ firstName: '', lastName: '', email: '' });
  
  // Fetch invitation details on mount
  // Display tournament info
  // Form to enter player details
  // Submit to join
  // Auto-login and redirect to tournament page
}
```

#### B3.2 Tournament Share Card
**New File:** `packages/frontend/src/components/tournament/TournamentShareCard.tsx`

```tsx
// Reuse QRCodeDisplay component
export function TournamentShareCard({ tournamentId, isOrganizer }) {
  const { data: invitation } = useTournamentInvitation(tournamentId);
  
  return (
    <div>
      <h3>Share Tournament</h3>
      <QRCodeDisplay 
        qrCodeDataUrl={invitation.qrCodeDataUrl}
        invitationLink={invitation.invitationLink}
        expiresAt={new Date(invitation.expiresAt)}
      />
      <CopyLinkButton link={invitation.invitationLink} />
      <ShareButton url={invitation.invitationLink} title={`Join ${tournamentName}`} />
      {isOrganizer && <RegenerateTokenButton />}
    </div>
  );
}
```

#### B3.3 Add to Tournament Detail Page
**File:** `packages/frontend/src/app/(dashboard)/tournaments/[id]/page.tsx`

```tsx
// Add share section for organizers
{isOrganizer && tournament.status === 'registration' && (
  <TournamentShareCard tournamentId={tournamentId} isOrganizer={true} />
)}
```

### B4. New API Hooks
**File:** `packages/frontend/src/hooks/api/useTournaments.ts`

```typescript
export function useCreateTournamentInvitation() {
  return useMutation({
    mutationFn: async (tournamentId: string) => {
      return apiClient.post(`/tournaments/${tournamentId}/invitation`);
    },
  });
}

export function useTournamentInvitation(tournamentId: string) {
  return useQuery({
    queryKey: ['tournament-invitation', tournamentId],
    queryFn: async () => apiClient.get(`/tournaments/${tournamentId}/invitation`),
  });
}

export function useJoinTournamentByToken() {
  return useMutation({
    mutationFn: async (data: { token: string; player: IPlayerInfo }) => {
      return apiClient.post(`/tournaments/join/${data.token}`, { player: data.player });
    },
  });
}
```

### B5. Contracts Changes

**File:** `packages/contracts/src/dtos/tournament.dto.ts`

```typescript
export interface ITournamentInvitationResponseDto {
  tournamentId: string;
  invitationToken: string;
  invitationLink: string;
  qrCodeDataUrl: string;
  expiresAt: Date;
  tournamentName: string;
}

export interface ITournamentInvitationDetailsDto {
  tournamentId: string;
  name: string;
  description?: string;
  tournamentType: TournamentType;
  currentParticipants: number;
  maxParticipants?: number;
  startDate?: Date;
  organizerName: string;
}

export interface IJoinTournamentByTokenDto {
  token: string;
  player: {
    firstName: string;
    lastName: string;
    email: string;
  };
}

export interface IJoinTournamentResultDto {
  tournamentId: string;
  playerId: string;
  accessToken: string;
  refreshToken?: string;
}
```

---

## ✉️ Option C: Magic Link Registration

### Overview
Email-based registration. User enters email, receives magic link, clicks to confirm and join.

### C1. Database Changes

#### C1.1 Tournament Registration Tokens Table
**File:** `packages/backend/prisma/schema.prisma`

```prisma
model TournamentRegistrationToken {
  id            String    @id @default(uuid())
  tournamentId  String    @map("tournament_id")
  email         String
  token         String    @unique
  firstName     String?   @map("first_name")
  lastName      String?   @map("last_name")
  expiresAt     DateTime  @map("expires_at")
  usedAt        DateTime? @map("used_at")
  createdAt     DateTime  @default(now()) @map("created_at")
  
  tournament    Tournament @relation(fields: [tournamentId], references: [id], onDelete: Cascade)
  
  @@index([token])
  @@index([email, tournamentId])
  @@map("TournamentRegistrationToken")
}
```

#### C1.2 Migration
```bash
npx prisma migrate dev --name add_tournament_registration_tokens
```

### C2. Backend Changes

#### C2.1 Magic Link Service
**New File:** `packages/backend/src/services/TournamentMagicLinkService.ts`

```typescript
export class TournamentMagicLinkService {
  constructor(
    private tournamentRepository: ITournamentRepository,
    private registrationTokenRepository: IRegistrationTokenRepository,
    private userRepository: IUserRepository,
    private playerRepository: IPlayerRepository,
    private emailService: IEmailService
  ) {}

  // Request registration via email
  async requestRegistration(
    tournamentId: string,
    email: string,
    firstName?: string,
    lastName?: string
  ): Promise<void> {
    const tournament = await this.tournamentRepository.findById(tournamentId);
    if (!tournament) throw new Error('Tournament not found');
    if (tournament.status !== 'registration') throw new Error('Registration closed');
    
    // Check if already registered
    const existingPlayer = await this.playerRepository.findByEmail(email);
    if (existingPlayer) {
      const entry = await this.entryRepository.findByTournamentAndPlayer(
        tournamentId, 
        existingPlayer.id
      );
      if (entry) throw new Error('Already registered');
    }
    
    // Generate token
    const token = uuidv4();
    const expiresAt = new Date();
    expiresAt.setHours(expiresAt.getHours() + 24); // 24 hour expiry
    
    await this.registrationTokenRepository.create({
      tournamentId,
      email: email.toLowerCase(),
      token,
      firstName,
      lastName,
      expiresAt,
    });
    
    // Send email
    const baseUrl = process.env.FRONTEND_URL;
    const confirmLink = `${baseUrl}/confirm-tournament/${token}`;
    
    await this.emailService.sendTournamentRegistrationEmail({
      to: email,
      tournamentName: tournament.name,
      confirmLink,
      expiresAt,
    });
  }

  // Confirm registration via token
  async confirmRegistration(token: string): Promise<IConfirmResult> {
    const regToken = await this.registrationTokenRepository.findByToken(token);
    if (!regToken) throw new Error('Invalid token');
    if (regToken.expiresAt < new Date()) throw new Error('Token expired');
    if (regToken.usedAt) throw new Error('Token already used');
    
    // Get or create player
    const player = await this.getOrCreatePlayer({
      email: regToken.email,
      firstName: regToken.firstName || '',
      lastName: regToken.lastName || '',
    });
    
    // Register for tournament
    await this.tournamentRegistrationService.registerPlayer(
      regToken.tournamentId,
      player.id
    );
    
    // Mark token as used
    await this.registrationTokenRepository.markUsed(token);
    
    // Generate auth tokens
    const accessToken = this.generateAccessToken(player.userId);
    
    return {
      tournamentId: regToken.tournamentId,
      playerId: player.id,
      accessToken,
    };
  }
}
```

#### C2.2 Email Templates
**New File:** `packages/backend/src/templates/tournament-registration.html`

```html
<!DOCTYPE html>
<html>
<head>
  <style>
    /* Email styles */
  </style>
</head>
<body>
  <h1>Join {{tournamentName}}</h1>
  <p>You've been invited to join a tournament!</p>
  <p>Click the button below to confirm your registration:</p>
  <a href="{{confirmLink}}" class="button">Confirm Registration</a>
  <p>This link expires in 24 hours.</p>
</body>
</html>
```

#### C2.3 New Routes
**File:** `packages/backend/src/routes/tournament.routes.ts`

```typescript
// Request magic link registration (public)
router.post('/:id/register-email', async (req, res) => {
  await tournamentMagicLinkService.requestRegistration(
    req.params.id,
    req.body.email,
    req.body.firstName,
    req.body.lastName
  );
  res.json({ success: true, message: 'Check your email for confirmation link' });
});

// Confirm magic link registration (public)
router.post('/confirm-registration/:token', async (req, res) => {
  const result = await tournamentMagicLinkService.confirmRegistration(req.params.token);
  res.json({ success: true, data: result });
});
```

### C3. Frontend Changes

#### C3.1 Email Registration Form
**New File:** `packages/frontend/src/components/tournament/EmailRegistrationForm.tsx`

```tsx
export function EmailRegistrationForm({ tournamentId }) {
  const [email, setEmail] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [sent, setSent] = useState(false);
  
  const requestRegistration = useRequestTournamentRegistration();
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    await requestRegistration.mutateAsync({ 
      tournamentId, 
      email, 
      firstName, 
      lastName 
    });
    setSent(true);
  };
  
  if (sent) {
    return (
      <div className="success-message">
        ✅ Check your email for a confirmation link!
      </div>
    );
  }
  
  return (
    <form onSubmit={handleSubmit}>
      <Input name="email" type="email" required placeholder="your@email.com" />
      <Input name="firstName" placeholder="First Name (optional)" />
      <Input name="lastName" placeholder="Last Name (optional)" />
      <Button type="submit">Register via Email</Button>
    </form>
  );
}
```

#### C3.2 Confirmation Page
**New File:** `packages/frontend/src/app/confirm-tournament/[token]/page.tsx`

```tsx
export default function ConfirmTournamentPage() {
  const { token } = useParams();
  const router = useRouter();
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  
  useEffect(() => {
    const confirm = async () => {
      try {
        const result = await apiClient.post(`/tournaments/confirm-registration/${token}`);
        // Store auth token
        localStorage.setItem('accessToken', result.accessToken);
        setStatus('success');
        // Redirect to tournament page
        setTimeout(() => {
          router.push(`/tournaments/${result.tournamentId}`);
        }, 2000);
      } catch (error) {
        setStatus('error');
      }
    };
    confirm();
  }, [token]);
  
  return (
    <div>
      {status === 'loading' && <Spinner />}
      {status === 'success' && <SuccessMessage />}
      {status === 'error' && <ErrorMessage />}
    </div>
  );
}
```

#### C3.3 Add to Public Tournament Page
**File:** `packages/frontend/src/app/t/[id]/page.tsx`

```tsx
{!user && (
  <div>
    <h3>Quick Registration</h3>
    <EmailRegistrationForm tournamentId={id} />
    <Divider text="or" />
    <LoginToRegisterCTA tournamentId={id} />
  </div>
)}
```

### C4. Email Service Integration

#### C4.1 Email Service Interface
**File:** `packages/contracts/src/interfaces/services/IEmailService.ts`

```typescript
export interface IEmailService {
  sendTournamentRegistrationEmail(data: {
    to: string;
    tournamentName: string;
    confirmLink: string;
    expiresAt: Date;
  }): Promise<void>;
  
  sendTournamentInvitationEmail(data: {
    to: string;
    tournamentName: string;
    inviterName: string;
    joinLink: string;
  }): Promise<void>;
}
```

#### C4.2 Email Service Implementation
**New File:** `packages/backend/src/services/EmailService.ts`

```typescript
import nodemailer from 'nodemailer';
import { compile } from 'handlebars';

export class EmailService implements IEmailService {
  private transporter: nodemailer.Transporter;
  
  constructor() {
    this.transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: parseInt(process.env.SMTP_PORT || '587'),
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });
  }
  
  async sendTournamentRegistrationEmail(data) {
    const template = await this.loadTemplate('tournament-registration');
    const html = template(data);
    
    await this.transporter.sendMail({
      from: process.env.EMAIL_FROM,
      to: data.to,
      subject: `Confirm Registration: ${data.tournamentName}`,
      html,
    });
  }
}
```

---

## 📋 Complete Implementation Checklist

### Phase 1: Foundation (All Options)
- [ ] **1.1** Create shared utility functions for getOrCreatePlayer
- [ ] **1.2** Create ShareButton UI component
- [ ] **1.3** Create CopyLinkButton UI component
- [ ] **1.4** Update contracts with new DTOs

### Phase 2: Option A - Public Tournament Page
- [ ] **A.1** Create public tournament endpoint (no auth)
- [ ] **A.2** Create `IPublicTournamentDto`
- [ ] **A.3** Create `/t/[id]` public page
- [ ] **A.4** Create `TournamentPublicInfo` component
- [ ] **A.5** Create `LoginToRegisterCTA` component
- [ ] **A.6** Add returnTo URL handling to login page
- [ ] **A.7** Add share button to tournament detail page
- [ ] **A.8** Write E2E tests for public view

### Phase 3: Option B - Invitation Token System
- [ ] **B.1** Add invitation fields to Tournament model (Prisma)
- [ ] **B.2** Run database migration
- [ ] **B.3** Update TournamentRepository with findByInvitationToken
- [ ] **B.4** Create `TournamentInvitationService`
- [ ] **B.5** Add invitation routes to tournament.routes.ts
- [ ] **B.6** Create `/join-tournament/[token]` page
- [ ] **B.7** Create `TournamentShareCard` component
- [ ] **B.8** Add invitation UI to tournament detail page
- [ ] **B.9** Create API hooks for invitations
- [ ] **B.10** Write E2E tests for invitation flow

### Phase 4: Option C - Magic Link Registration
- [ ] **C.1** Create TournamentRegistrationToken model (Prisma)
- [ ] **C.2** Run database migration
- [ ] **C.3** Create `TournamentMagicLinkService`
- [ ] **C.4** Create email templates
- [ ] **C.5** Configure email service (nodemailer or similar)
- [ ] **C.6** Add magic link routes
- [ ] **C.7** Create `EmailRegistrationForm` component
- [ ] **C.8** Create `/confirm-tournament/[token]` page
- [ ] **C.9** Add email registration to public tournament page
- [ ] **C.10** Write E2E tests for magic link flow

### Phase 5: Integration & Testing
- [ ] **5.1** Test all three flows work together
- [ ] **5.2** Test mobile UX (especially QR scanning)
- [ ] **5.3** Test email delivery
- [ ] **5.4** Load testing for public endpoints
- [ ] **5.5** Security review (rate limiting, token expiry)

---

## 📁 Files to Create

| File | Purpose |
|------|---------|
| `packages/backend/src/services/TournamentInvitationService.ts` | Token-based invitations |
| `packages/backend/src/services/TournamentMagicLinkService.ts` | Magic link registration |
| `packages/backend/src/services/EmailService.ts` | Email sending |
| `packages/backend/src/templates/tournament-registration.html` | Email template |
| `packages/frontend/src/app/t/[id]/page.tsx` | Public tournament page |
| `packages/frontend/src/app/join-tournament/[token]/page.tsx` | Token join page |
| `packages/frontend/src/app/confirm-tournament/[token]/page.tsx` | Magic link confirm |
| `packages/frontend/src/components/tournament/TournamentPublicInfo.tsx` | Public info display |
| `packages/frontend/src/components/tournament/TournamentShareCard.tsx` | QR/share UI |
| `packages/frontend/src/components/tournament/EmailRegistrationForm.tsx` | Magic link form |
| `packages/frontend/src/components/tournament/LoginToRegisterCTA.tsx` | Login prompt |
| `packages/frontend/src/components/ui/ShareButton.tsx` | Share button |
| `packages/frontend/src/components/ui/CopyLinkButton.tsx` | Copy button |
| `e2e/tournament-join-public.spec.ts` | E2E tests Option A |
| `e2e/tournament-join-token.spec.ts` | E2E tests Option B |
| `e2e/tournament-join-magic-link.spec.ts` | E2E tests Option C |

---

## 📁 Files to Modify

| File | Changes |
|------|---------|
| `packages/backend/prisma/schema.prisma` | Add invitation fields, registration tokens |
| `packages/backend/src/routes/tournament.routes.ts` | Add new endpoints |
| `packages/backend/src/repositories/TournamentRepository.ts` | Add findByInvitationToken |
| `packages/backend/src/config/services.ts` | Register new services |
| `packages/contracts/src/dtos/tournament.dto.ts` | Add new DTOs |
| `packages/contracts/src/interfaces/services/index.ts` | Export new interfaces |
| `packages/frontend/src/app/(dashboard)/tournaments/[id]/page.tsx` | Add share UI |
| `packages/frontend/src/app/login/page.tsx` | Handle returnTo param |
| `packages/frontend/src/hooks/api/useTournaments.ts` | Add new hooks |

---

## ⏱️ Estimated Effort

| Phase | Time | Priority |
|-------|------|----------|
| Phase 1: Foundation | 2-3 hours | High |
| Phase 2: Option A | 3-4 hours | High |
| Phase 3: Option B | 6-8 hours | High |
| Phase 4: Option C | 4-6 hours | Medium |
| Phase 5: Testing | 3-4 hours | High |
| **Total** | **18-25 hours** | |

---

## 🎯 Success Criteria

1. ✅ Users can view tournament info without logging in
2. ✅ Organizers can generate shareable links and QR codes
3. ✅ Users can join via link without existing account
4. ✅ Users can register via email magic link
5. ✅ All flows automatically create user/player if needed
6. ✅ Mobile-friendly (QR scanning works)
7. ✅ All flows have proper error handling
8. ✅ E2E tests cover all registration methods

---

## 🔒 Security Considerations

1. **Rate limiting** on all public endpoints
2. **Token expiration** (24h magic links, 7d invitation tokens)
3. **Email validation** before sending magic links
4. **CAPTCHA** consideration for public forms
5. **Audit logging** for registration events

---

**Ready to implement? Start with Phase 1 (Foundation) and Phase 2 (Option A) for quick wins, then proceed to Phase 3 (Option B) for the full experience.**

