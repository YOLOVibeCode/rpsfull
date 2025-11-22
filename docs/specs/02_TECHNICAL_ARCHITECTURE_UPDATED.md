# Updated Technical Architecture - Next.js with Contracts Package
## RPSFull Tournament Platform

**Document Version:** 2.1  
**Last Updated:** November 22, 2025  
**Status:** Draft  
**Repository:** https://github.com/YOLOVibeCode/rpsfull.git  
**Changes:** Updated for Next.js and dedicated contracts package

---

## 1. Updated Architecture Overview

### 1.1 Repository Information

**GitHub Repository:** https://github.com/YOLOVibeCode/rpsfull.git

**Clone Command:**
```bash
git clone https://github.com/YOLOVibeCode/rpsfull.git
cd rpsfull
```

### 1.2 Monorepo Structure with Separated Concerns

```
rpsfull/
├── packages/
│   ├── contracts/              # @rpsfull-platform/contracts
│   │   ├── src/
│   │   │   ├── entities/
│   │   │   ├── dtos/
│   │   │   ├── interfaces/
│   │   │   ├── enums/
│   │   │   ├── validators/
│   │   │   └── index.ts
│   │   ├── package.json
│   │   └── tsconfig.json
│   │
│   ├── frontend/               # Next.js 14+ App
│   │   ├── src/
│   │   │   ├── app/           # Next.js App Router
│   │   │   ├── components/
│   │   │   ├── features/
│   │   │   ├── services/
│   │   │   ├── hooks/
│   │   │   └── lib/
│   │   ├── public/
│   │   ├── package.json
│   │   ├── next.config.js
│   │   └── tsconfig.json
│   │
│   └── backend/                # Backend API (Node.js + Express)
│       ├── src/
│       │   ├── modules/
│       │   ├── repositories/
│       │   ├── services/
│       │   ├── middleware/
│       │   ├── websocket/
│       │   └── server.ts
│       ├── package.json
│       └── tsconfig.json
│
├── package.json                # Root package.json
├── pnpm-workspace.yaml         # PNPM workspace config
├── turbo.json                  # Turborepo config (optional)
└── README.md
```

### 1.2 Architecture Diagram

```
┌─────────────────────────────────────────────────────────────┐
│                      CLIENT TIER                             │
│  ┌──────────────────────────────────────────────────────┐  │
│  │         Next.js 14+ Application                       │  │
│  │  ┌────────────────────────────────────────────────┐  │  │
│  │  │          App Router (RSC)                      │  │  │
│  │  │  - Server Components                           │  │  │
│  │  │  - Client Components                           │  │  │
│  │  │  - API Route Handlers                          │  │  │
│  │  └────────────────────────────────────────────────┘  │  │
│  │  ┌────────────────────────────────────────────────┐  │  │
│  │  │      Client-Side Features                      │  │  │
│  │  │  - React Components                            │  │  │
│  │  │  - State Management (Zustand)                  │  │  │
│  │  │  - WebSocket Client (Socket.io)                │  │  │
│  │  └────────────────────────────────────────────────┘  │  │
│  │                                                       │  │
│  │  Depends on: @rps-platform/contracts                │  │
│  └──────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────┘
                              │
                     HTTPS / WSS
                              │
┌─────────────────────────────────────────────────────────────┐
│           @rps-platform/contracts (Shared)                   │
│  ┌──────────────────────────────────────────────────────┐  │
│  │  - TypeScript Interfaces & Types                     │  │
│  │  - DTOs (Data Transfer Objects)                      │  │
│  │  - Service Contracts (ISP)                           │  │
│  │  - Enums & Constants                                 │  │
│  │  - Validation Schemas (Zod)                          │  │
│  │  - Type Guards & Utilities                           │  │
│  └──────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────┘
                              │
                              │
┌─────────────────────────────────────────────────────────────┐
│                   APPLICATION TIER                           │
│  ┌──────────────────────────────────────────────────────┐  │
│  │              API Gateway / Load Balancer              │  │
│  └──────────────────────────────────────────────────────┘  │
│  ┌──────────────────────────────────────────────────────┐  │
│  │        Backend API Server (Node.js + Express)         │  │
│  │  ┌────────────────────────────────────────────────┐  │  │
│  │  │  Controllers (implement contracts)             │  │  │
│  │  └────────────────────────────────────────────────┘  │  │
│  │  ┌────────────────────────────────────────────────┐  │  │
│  │  │  Services (implement IService interfaces)      │  │  │
│  │  └────────────────────────────────────────────────┘  │  │
│  │  ┌────────────────────────────────────────────────┐  │  │
│  │  │  Repositories (implement IRepository)          │  │  │
│  │  └────────────────────────────────────────────────┘  │  │
│  │                                                       │  │
│  │  Depends on: @rps-platform/contracts                │  │
│  └──────────────────────────────────────────────────────┘  │
│  ┌──────────────────────────────────────────────────────┐  │
│  │          WebSocket Server (Socket.io)                 │  │
│  │  - Match event handlers (IMatchEvents)                │  │
│  │  - Tournament event handlers (ITournamentEvents)      │  │
│  └──────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────┘
                              │
┌─────────────────────────────────────────────────────────────┐
│                      DATA TIER                               │
│  ┌────────────────────┐  ┌────────────────────────────┐    │
│  │  PostgreSQL + Prisma│  │    Redis Cache             │    │
│  └────────────────────┘  └────────────────────────────┘    │
└─────────────────────────────────────────────────────────────┘
```

---

## 2. Next.js Frontend Architecture

### 2.1 Technology Stack

**Core:**
- **Next.js 14+**: App Router with React Server Components
- **TypeScript 5+**: Type safety
- **@rpsfull-platform/contracts**: Shared type definitions

**State Management:**
- **Zustand**: Global client state
- **React Query (TanStack Query)**: Server state & caching
- **Context API**: Theme, auth context

**Styling:**
- **Tailwind CSS 3+**: Utility-first styling
- **Framer Motion**: Animations
- **canvas-confetti**: Confetti effect

**Real-time:**
- **Socket.io Client**: WebSocket communication

**Forms & Validation:**
- **React Hook Form**: Form management
- **Zod**: Validation (from contracts package)

### 2.2 Next.js Project Structure

```
frontend/
├── src/
│   ├── app/                    # Next.js App Router
│   │   ├── (auth)/            # Auth route group
│   │   │   ├── login/
│   │   │   │   └── page.tsx
│   │   │   └── register/
│   │   │       └── page.tsx
│   │   ├── (dashboard)/       # Dashboard route group
│   │   │   ├── layout.tsx
│   │   │   ├── page.tsx       # Home/Dashboard
│   │   │   ├── play/
│   │   │   │   ├── page.tsx   # Quick match
│   │   │   │   └── [matchId]/
│   │   │   │       └── page.tsx
│   │   │   ├── tournaments/
│   │   │   │   ├── page.tsx
│   │   │   │   ├── create/
│   │   │   │   │   └── page.tsx
│   │   │   │   └── [id]/
│   │   │   │       ├── page.tsx
│   │   │   │       └── bracket/
│   │   │   │           └── page.tsx
│   │   │   ├── stats/
│   │   │   │   └── page.tsx
│   │   │   └── profile/
│   │   │       └── page.tsx
│   │   ├── api/               # API route handlers (optional)
│   │   │   └── webhook/
│   │   │       └── route.ts
│   │   ├── layout.tsx         # Root layout
│   │   ├── page.tsx           # Landing page
│   │   ├── globals.css
│   │   └── providers.tsx      # Client providers
│   │
│   ├── components/            # React components
│   │   ├── ui/               # Reusable UI components
│   │   │   ├── Button.tsx
│   │   │   ├── Card.tsx
│   │   │   ├── Input.tsx
│   │   │   ├── Modal.tsx
│   │   │   └── ...
│   │   ├── game/             # Game-specific components
│   │   │   ├── SymbolSelector.tsx
│   │   │   ├── Countdown.tsx
│   │   │   ├── ResultDisplay.tsx
│   │   │   └── RoundHistory.tsx
│   │   ├── tournament/
│   │   │   ├── TournamentCard.tsx
│   │   │   ├── BracketView.tsx
│   │   │   └── StandingsTable.tsx
│   │   └── stats/
│   │       ├── StatsCard.tsx
│   │       ├── MoveChart.tsx
│   │       └── WinRateGraph.tsx
│   │
│   ├── features/             # Feature modules
│   │   ├── auth/
│   │   │   ├── components/
│   │   │   ├── hooks/
│   │   │   └── api.ts
│   │   ├── match/
│   │   │   ├── components/
│   │   │   ├── hooks/
│   │   │   └── api.ts
│   │   ├── tournament/
│   │   └── stats/
│   │
│   ├── lib/                  # Utilities & configs
│   │   ├── api-client.ts    # Axios/fetch wrapper
│   │   ├── websocket.ts     # Socket.io client
│   │   ├── utils.ts
│   │   └── constants.ts
│   │
│   ├── hooks/                # Custom React hooks
│   │   ├── useAuth.ts
│   │   ├── useMatch.ts
│   │   ├── useTournament.ts
│   │   ├── useWebSocket.ts
│   │   └── useStats.ts
│   │
│   ├── store/                # Zustand stores
│   │   ├── authStore.ts
│   │   ├── matchStore.ts
│   │   ├── uiStore.ts
│   │   └── index.ts
│   │
│   ├── services/             # API service layer
│   │   ├── api/
│   │   │   ├── auth.service.ts
│   │   │   ├── match.service.ts
│   │   │   ├── tournament.service.ts
│   │   │   └── stats.service.ts
│   │   └── websocket/
│   │       ├── match-socket.service.ts
│   │       └── tournament-socket.service.ts
│   │
│   ├── animations/           # Animation utilities
│   │   ├── confetti.ts
│   │   ├── explosion.ts
│   │   └── transitions.ts
│   │
│   └── types/                # Frontend-specific types
│       └── index.ts
│
├── public/
│   ├── icons/
│   ├── sounds/
│   └── images/
│
├── .env.local
├── .env.example
├── next.config.js
├── tailwind.config.ts
├── tsconfig.json
└── package.json
```

### 2.3 Next.js Configuration

**next.config.js:**

```javascript
/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  
  // For monorepo setup
  transpilePackages: ['@rpsfull-platform/contracts'],
  
  // Environment variables exposed to browser
  env: {
    NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL,
    NEXT_PUBLIC_WS_URL: process.env.NEXT_PUBLIC_WS_URL,
  },
  
  // Image optimization
  images: {
    domains: ['your-cdn-domain.com'],
    formats: ['image/avif', 'image/webp'],
  },
  
  // Headers for security
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          {
            key: 'X-Frame-Options',
            value: 'DENY',
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          {
            key: 'Referrer-Policy',
            value: 'strict-origin-when-cross-origin',
          },
        ],
      },
    ];
  },
  
  // PWA support (optional)
  // pwa: {
  //   dest: 'public',
  //   register: true,
  //   skipWaiting: true,
  // },
};

module.exports = nextConfig;
```

### 2.4 Example: Using Contracts in Frontend

**Service Layer:**

```typescript
// src/services/api/match.service.ts
import { 
  ICreateMatchDto, 
  IMatch, 
  IMatchWithDetails,
  ISubmitMoveDto,
  ISubmitMoveResponseDto,
  IApiResponse,
  createMatchSchema,
} from '@rpsfull-platform/contracts';
import { apiClient } from '@/lib/api-client';

export class MatchService {
  async createMatch(data: ICreateMatchDto): Promise<IMatch> {
    // Validate using Zod schema from contracts
    const validated = createMatchSchema.parse(data);
    
    const response = await apiClient.post<IApiResponse<IMatch>>(
      '/matches',
      validated
    );
    
    if (!response.data.success) {
      throw new Error(response.data.error?.message);
    }
    
    return response.data.data!;
  }
  
  async getMatch(matchId: string): Promise<IMatchWithDetails> {
    const response = await apiClient.get<IApiResponse<IMatchWithDetails>>(
      `/matches/${matchId}`
    );
    
    if (!response.data.success) {
      throw new Error(response.data.error?.message);
    }
    
    return response.data.data!;
  }
  
  async submitMove(
    matchId: string, 
    data: ISubmitMoveDto
  ): Promise<ISubmitMoveResponseDto> {
    const response = await apiClient.post<IApiResponse<ISubmitMoveResponseDto>>(
      `/matches/${matchId}/rounds`,
      data
    );
    
    if (!response.data.success) {
      throw new Error(response.data.error?.message);
    }
    
    return response.data.data!;
  }
}

export const matchService = new MatchService();
```

**React Hook:**

```typescript
// src/hooks/useMatch.ts
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { 
  ICreateMatchDto, 
  IMatch, 
  IMatchWithDetails 
} from '@rpsfull-platform/contracts';
import { matchService } from '@/services/api/match.service';

export function useMatch(matchId: string) {
  return useQuery({
    queryKey: ['match', matchId],
    queryFn: () => matchService.getMatch(matchId),
    enabled: !!matchId,
  });
}

export function useCreateMatch() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (data: ICreateMatchDto) => matchService.createMatch(data),
    onSuccess: (match) => {
      queryClient.invalidateQueries({ queryKey: ['matches'] });
    },
  });
}
```

**React Component:**

```typescript
// src/features/match/components/CreateMatch.tsx
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ICreateMatchDto, PlayMode } from '@rpsfull-platform/contracts';
import { useCreateMatch } from '@/hooks/useMatch';
import { Button } from '@/components/ui/Button';

export function CreateMatchForm() {
  const router = useRouter();
  const createMatch = useCreateMatch();
  
  const [formData, setFormData] = useState<ICreateMatchDto>({
    player2Id: '',
    gameTypeId: 'default-rps-id',
    bestOfN: 3,
    playMode: PlayMode.DIGITAL,
  });
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const match = await createMatch.mutateAsync(formData);
      router.push(`/play/${match.id}`);
    } catch (error) {
      console.error('Failed to create match:', error);
    }
  };
  
  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {/* Form fields */}
      <Button type="submit" loading={createMatch.isPending}>
        Create Match
      </Button>
    </form>
  );
}
```

---

## 3. Backend Architecture with Contracts

### 3.1 Backend Project Structure

```
backend/
├── src/
│   ├── modules/              # Feature modules
│   │   ├── auth/
│   │   │   ├── auth.controller.ts
│   │   │   ├── auth.service.ts
│   │   │   ├── auth.routes.ts
│   │   │   └── index.ts
│   │   ├── match/
│   │   │   ├── match.controller.ts
│   │   │   ├── match.service.ts
│   │   │   ├── match.routes.ts
│   │   │   └── index.ts
│   │   ├── tournament/
│   │   └── stats/
│   │
│   ├── repositories/         # Data access layer
│   │   ├── user.repository.ts      # Implements IUserRepository
│   │   ├── player.repository.ts    # Implements IPlayerRepository
│   │   ├── match.repository.ts     # Implements IMatchRepository
│   │   ├── tournament.repository.ts
│   │   └── index.ts
│   │
│   ├── services/            # Business logic
│   │   ├── auth.service.ts         # Implements IAuthService
│   │   ├── match.service.ts        # Implements IMatchService
│   │   ├── tournament.service.ts   # Implements ITournamentService
│   │   ├── statistics.service.ts   # Implements IStatisticsService
│   │   └── index.ts
│   │
│   ├── middleware/
│   │   ├── auth.middleware.ts
│   │   ├── validation.middleware.ts
│   │   ├── error-handler.middleware.ts
│   │   └── rate-limiter.middleware.ts
│   │
│   ├── websocket/
│   │   ├── match.handler.ts
│   │   ├── tournament.handler.ts
│   │   └── index.ts
│   │
│   ├── utils/
│   │   ├── game-logic.ts
│   │   ├── bracket-generator.ts
│   │   └── helpers.ts
│   │
│   ├── config/
│   │   ├── database.ts
│   │   ├── redis.ts
│   │   └── env.ts
│   │
│   ├── prisma/
│   │   ├── schema.prisma
│   │   ├── migrations/
│   │   └── seed.ts
│   │
│   ├── app.ts               # Express app setup
│   └── server.ts            # Server entry point
│
├── tests/
│   ├── unit/
│   ├── integration/
│   └── e2e/
│
├── .env.example
├── package.json
└── tsconfig.json
```

### 3.2 Example: Implementing Contracts in Backend

**Service Implementation:**

```typescript
// backend/src/services/match.service.ts
import {
  IMatchService,
  ICreateMatchDto,
  IMatch,
  IMatchWithDetails,
  ISubmitMoveDto,
  ISubmitMoveResponseDto,
  IMatchRepository,
  IPlayerRepository,
  MatchStatus,
  RoundResult,
} from '@rpsfull-platform/contracts';
import { MatchRepository } from '../repositories/match.repository';
import { PlayerRepository } from '../repositories/player.repository';

export class MatchService implements IMatchService {
  constructor(
    private matchRepository: IMatchRepository = new MatchRepository(),
    private playerRepository: IPlayerRepository = new PlayerRepository()
  ) {}
  
  async createMatch(userId: string, data: ICreateMatchDto): Promise<IMatch> {
    // Get player for this user
    const player = await this.playerRepository.findByUserId(userId);
    if (!player) {
      throw new Error('Player not found for user');
    }
    
    // Create match
    const match = await this.matchRepository.create({
      ...data,
      player1Id: player.id,
    });
    
    return match;
  }
  
  async getMatch(matchId: string): Promise<IMatchWithDetails> {
    const match = await this.matchRepository.findByIdWithDetails(matchId);
    if (!match) {
      throw new Error('Match not found');
    }
    return match;
  }
  
  async submitMove(
    matchId: string,
    playerId: string,
    data: ISubmitMoveDto
  ): Promise<ISubmitMoveResponseDto> {
    // Implementation here...
    // Use contracts for type safety throughout
  }
  
  // ... other methods implementing IMatchService
}
```

**Controller:**

```typescript
// backend/src/modules/match/match.controller.ts
import { Request, Response, NextFunction } from 'express';
import { 
  IMatchService,
  ICreateMatchDto,
  createMatchSchema,
  IApiResponse,
} from '@rpsfull-platform/contracts';
import { MatchService } from '../../services/match.service';

export class MatchController {
  constructor(private matchService: IMatchService = new MatchService()) {}
  
  async createMatch(req: Request, res: Response, next: NextFunction) {
    try {
      // Validate using Zod schema from contracts
      const validated = createMatchSchema.parse(req.body) as ICreateMatchDto;
      
      // Get user ID from authenticated request
      const userId = req.user!.id;
      
      // Create match
      const match = await this.matchService.createMatch(userId, validated);
      
      // Return standardized API response from contracts
      const response: IApiResponse = {
        success: true,
        data: match,
        meta: {
          timestamp: new Date().toISOString(),
        },
      };
      
      res.status(201).json(response);
    } catch (error) {
      next(error);
    }
  }
  
  async getMatch(req: Request, res: Response, next: NextFunction) {
    try {
      const { matchId } = req.params;
      const match = await this.matchService.getMatch(matchId);
      
      const response: IApiResponse = {
        success: true,
        data: match,
        meta: {
          timestamp: new Date().toISOString(),
        },
      };
      
      res.json(response);
    } catch (error) {
      next(error);
    }
  }
}
```

---

## 4. Monorepo Setup

### 4.1 Root package.json

```json
{
  "name": "rpsfull-platform",
  "version": "1.0.0",
  "private": true,
  "workspaces": [
    "packages/*"
  ],
  "scripts": {
    "dev": "turbo run dev",
    "build": "turbo run build",
    "test": "turbo run test",
    "lint": "turbo run lint",
    "clean": "turbo run clean && rm -rf node_modules",
    "contracts:build": "pnpm --filter @rpsfull-platform/contracts build"
  },
  "devDependencies": {
    "turbo": "^1.10.0",
    "typescript": "^5.0.0"
  },
  "engines": {
    "node": ">=20.0.0",
    "pnpm": ">=8.0.0"
  }
}
```

### 4.2 pnpm-workspace.yaml

```yaml
packages:
  - 'packages/*'
```

### 4.3 turbo.json (Turborepo Config)

```json
{
  "$schema": "https://turbo.build/schema.json",
  "pipeline": {
    "build": {
      "dependsOn": ["^build"],
      "outputs": ["dist/**", ".next/**"]
    },
    "dev": {
      "cache": false,
      "persistent": true
    },
    "test": {
      "dependsOn": ["build"]
    },
    "lint": {
      "outputs": []
    },
    "clean": {
      "cache": false
    }
  }
}
```

---

## 5. Deployment Strategy

### 5.1 Separate Deployment

**Frontend (Next.js):**
- **Platform**: Vercel (optimal for Next.js)
- **Environment Variables**: API_URL, WS_URL
- **CDN**: Automatic via Vercel
- **Domains**: app.rpsfull.com

**Backend:**
- **Platform**: Railway, Render, or AWS
- **Environment Variables**: DATABASE_URL, REDIS_URL, JWT_SECRET
- **Domains**: api.rpsfull.com

**Contracts Package:**
- Published to NPM (public or private)
- Or consumed directly from monorepo

### 5.2 Build Process

```bash
# Build contracts first
cd packages/contracts
pnpm build

# Build backend
cd ../backend
pnpm build

# Build frontend
cd ../frontend
pnpm build
```

---

## 6. Benefits of This Architecture

### 6.1 True Separation of Concerns (ISP)
✅ Contracts package defines all interfaces  
✅ Frontend depends only on contracts  
✅ Backend implements contracts  
✅ No direct coupling between frontend/backend  

### 6.2 Type Safety Everywhere
✅ Shared types across entire stack  
✅ Compile-time error detection  
✅ Autocomplete in IDE  
✅ Refactoring safety  

### 6.3 Maintainability
✅ Single source of truth for types  
✅ Changes propagate automatically  
✅ Clear interfaces and responsibilities  
✅ Easy to test in isolation  

### 6.4 Scalability
✅ Easy to add new services  
✅ Can extract microservices later  
✅ Reusable contracts across projects  
✅ Independent versioning  

---

## 7. Brand Identity

### 7.1 Platform Naming
- **Full Name**: RPSFull Tournament Platform
- **Short Name**: RPSFull
- **Package Namespace**: `@rpsfull-platform`
- **Domain**: rpsfull.com
- **API Domain**: api.rpsfull.com
- **App Domain**: app.rpsfull.com

---

**Document Approval:**
- [ ] Technical Lead
- [ ] Frontend Architect
- [ ] Backend Architect
- [ ] DevOps Lead

---

END OF DOCUMENT

