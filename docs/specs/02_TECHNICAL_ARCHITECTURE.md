# Technical Architecture Specification
## RPSFull Tournament Platform

**Document Version:** 1.1  
**Last Updated:** November 22, 2025  
**Status:** Draft  
**Repository:** https://github.com/YOLOVibeCode/rpsfull.git  

---

## 1. Architecture Overview

### 1.1 System Architecture Pattern
The RPSFull Tournament Platform follows a **three-tier architecture**:

1. **Presentation Layer**: React-based Progressive Web Application
2. **Application Layer**: RESTful API with WebSocket support
3. **Data Layer**: PostgreSQL database with Redis caching

### 1.2 Architecture Diagram

```
┌─────────────────────────────────────────────────────────────┐
│                     CLIENT TIER                              │
│  ┌──────────────────────────────────────────────────────┐  │
│  │         Progressive Web Application (PWA)             │  │
│  │  - React.js Frontend                                  │  │
│  │  - State Management (Redux/Zustand)                   │  │
│  │  - WebSocket Client                                   │  │
│  │  - Service Worker (offline support)                   │  │
│  └──────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────┘
                              │
                     HTTPS / WSS
                              │
┌─────────────────────────────────────────────────────────────┐
│                   APPLICATION TIER                           │
│  ┌──────────────────────────────────────────────────────┐  │
│  │              API Gateway / Load Balancer              │  │
│  └──────────────────────────────────────────────────────┘  │
│  ┌──────────────────────────────────────────────────────┐  │
│  │            RESTful API Server (Node.js)               │  │
│  │  - Express.js                                         │  │
│  │  - Authentication Middleware (JWT)                    │  │
│  │  - Business Logic Layer                               │  │
│  │  - Data Access Layer                                  │  │
│  └──────────────────────────────────────────────────────┘  │
│  ┌──────────────────────────────────────────────────────┐  │
│  │          WebSocket Server (Socket.io)                 │  │
│  │  - Real-time Match Synchronization                    │  │
│  │  - Tournament Updates                                 │  │
│  │  - Live Notifications                                 │  │
│  └──────────────────────────────────────────────────────┘  │
│  ┌──────────────────────────────────────────────────────┐  │
│  │          Background Job Processor (Bull)              │  │
│  │  - Statistics Calculation                             │  │
│  │  - Ranking Updates                                    │  │
│  │  - Email Notifications                                │  │
│  └──────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────┘
                              │
                              │
┌─────────────────────────────────────────────────────────────┐
│                      DATA TIER                               │
│  ┌────────────────────┐  ┌────────────────────────────┐    │
│  │  PostgreSQL DB     │  │    Redis Cache             │    │
│  │  - User Data       │  │    - Session Storage       │    │
│  │  - Match Records   │  │    - Match Queue           │    │
│  │  - Statistics      │  │    - Real-time Data        │    │
│  │  - Tournaments     │  │    - Rate Limiting         │    │
│  └────────────────────┘  └────────────────────────────┘    │
│  ┌────────────────────┐                                     │
│  │  File Storage (S3) │                                     │
│  │  - User Avatars    │                                     │
│  │  - Static Assets   │                                     │
│  └────────────────────┘                                     │
└─────────────────────────────────────────────────────────────┘
```

---

## 2. Frontend Architecture

### 2.1 Technology Stack

**Core Framework:**
- **React 18+**: Component-based UI framework
- **TypeScript**: Type-safe development
- **Vite**: Build tool and dev server

**State Management:**
- **Zustand**: Lightweight state management for global app state
- **React Query**: Server state management and caching
- **Context API**: For theme and authentication context

**Routing:**
- **React Router v6**: Client-side routing

**Styling:**
- **Tailwind CSS**: Utility-first CSS framework
- **Framer Motion**: Animation library
- **React Canvas Confetti**: Confetti animations

**Real-time Communication:**
- **Socket.io Client**: WebSocket communication

**Form Handling:**
- **React Hook Form**: Form state management
- **Zod**: Schema validation

### 2.2 Project Structure

```
frontend/
├── public/
│   ├── icons/              # PWA icons
│   ├── sounds/             # Sound effects
│   └── manifest.json       # PWA manifest
├── src/
│   ├── assets/             # Static assets
│   │   ├── images/
│   │   ├── animations/
│   │   └── sounds/
│   ├── components/         # Reusable components
│   │   ├── common/         # Button, Input, Card, etc.
│   │   ├── game/           # Game-specific components
│   │   ├── tournament/     # Tournament components
│   │   └── stats/          # Statistics components
│   ├── features/           # Feature modules
│   │   ├── auth/           # Authentication
│   │   ├── match/          # Match functionality
│   │   ├── tournament/     # Tournament functionality
│   │   ├── stats/          # Statistics
│   │   └── profile/        # User profile
│   ├── hooks/              # Custom React hooks
│   │   ├── useMatch.ts
│   │   ├── useTournament.ts
│   │   ├── useStats.ts
│   │   └── useWebSocket.ts
│   ├── services/           # API services
│   │   ├── api.ts          # Base API configuration
│   │   ├── auth.service.ts
│   │   ├── match.service.ts
│   │   ├── tournament.service.ts
│   │   └── stats.service.ts
│   ├── store/              # Global state
│   │   ├── authStore.ts
│   │   ├── matchStore.ts
│   │   └── uiStore.ts
│   ├── types/              # TypeScript types
│   │   ├── user.types.ts
│   │   ├── match.types.ts
│   │   ├── tournament.types.ts
│   │   └── stats.types.ts
│   ├── utils/              # Utility functions
│   │   ├── gameLogic.ts
│   │   ├── animations.ts
│   │   ├── validators.ts
│   │   └── formatters.ts
│   ├── constants/          # Application constants
│   ├── styles/             # Global styles
│   ├── App.tsx             # Root component
│   └── main.tsx            # Entry point
├── .env.example            # Environment variables template
├── package.json
├── tsconfig.json
├── tailwind.config.js
└── vite.config.ts
```

### 2.3 Component Architecture

**Component Hierarchy:**
```
App
├── Router
│   ├── PublicRoutes
│   │   ├── Home
│   │   ├── Login
│   │   └── Register
│   └── ProtectedRoutes
│       ├── Dashboard
│       ├── QuickMatch
│       │   ├── MatchLobby
│       │   ├── GamePlay
│       │   │   ├── SymbolSelector
│       │   │   ├── Countdown
│       │   │   ├── ResultDisplay
│       │   │   └── RoundHistory
│       │   └── MatchResults
│       ├── Tournament
│       │   ├── TournamentList
│       │   ├── TournamentCreate
│       │   ├── TournamentBracket
│       │   └── TournamentMatch
│       ├── Stats
│       │   ├── PlayerStats
│       │   ├── MatchHistory
│       │   └── Analytics
│       └── Profile
│           ├── ProfileView
│           └── ProfileEdit
```

### 2.4 State Management Strategy

**Global State (Zustand):**
- User authentication state
- Current match state
- UI preferences (theme, sound)
- Notification queue

**Server State (React Query):**
- User data
- Match history
- Tournament data
- Statistics

**Local State (useState):**
- Form inputs
- Modal visibility
- Component-specific UI state

**WebSocket State:**
- Real-time match updates
- Tournament progression
- Live notifications

### 2.5 PWA Features

**Service Worker:**
- Cache-first strategy for static assets
- Network-first for API calls
- Offline fallback pages

**Manifest:**
- App icons (various sizes)
- Theme colors
- Display mode: standalone
- Orientation: portrait

**Features:**
- Add to home screen
- Push notifications (future)
- Background sync (future)

---

## 3. Backend Architecture

### 3.1 Technology Stack

**Runtime & Framework:**
- **Node.js 20+**: JavaScript runtime
- **Express.js**: Web framework
- **TypeScript**: Type-safe development

**Database:**
- **PostgreSQL 15+**: Primary database
- **Prisma**: ORM and database toolkit

**Caching:**
- **Redis**: In-memory data store

**Real-time:**
- **Socket.io**: WebSocket server

**Background Jobs:**
- **Bull**: Job queue system

**Authentication:**
- **JWT**: JSON Web Tokens
- **bcrypt**: Password hashing

**Validation:**
- **Zod**: Schema validation

**Testing:**
- **Jest**: Test framework
- **Supertest**: API testing

### 3.2 Project Structure

```
backend/
├── src/
│   ├── config/             # Configuration files
│   │   ├── database.ts
│   │   ├── redis.ts
│   │   └── env.ts
│   ├── middleware/         # Express middleware
│   │   ├── auth.ts
│   │   ├── validation.ts
│   │   ├── errorHandler.ts
│   │   └── rateLimiter.ts
│   ├── modules/            # Feature modules
│   │   ├── auth/
│   │   │   ├── auth.controller.ts
│   │   │   ├── auth.service.ts
│   │   │   ├── auth.routes.ts
│   │   │   └── auth.types.ts
│   │   ├── user/
│   │   │   ├── user.controller.ts
│   │   │   ├── user.service.ts
│   │   │   ├── user.routes.ts
│   │   │   └── user.types.ts
│   │   ├── match/
│   │   │   ├── match.controller.ts
│   │   │   ├── match.service.ts
│   │   │   ├── match.routes.ts
│   │   │   └── match.types.ts
│   │   ├── tournament/
│   │   │   ├── tournament.controller.ts
│   │   │   ├── tournament.service.ts
│   │   │   ├── tournament.routes.ts
│   │   │   └── tournament.types.ts
│   │   ├── gameType/
│   │   │   ├── gameType.controller.ts
│   │   │   ├── gameType.service.ts
│   │   │   ├── gameType.routes.ts
│   │   │   └── gameType.types.ts
│   │   └── stats/
│   │       ├── stats.controller.ts
│   │       ├── stats.service.ts
│   │       ├── stats.routes.ts
│   │       └── stats.types.ts
│   ├── websocket/          # WebSocket handlers
│   │   ├── match.handler.ts
│   │   ├── tournament.handler.ts
│   │   └── notification.handler.ts
│   ├── jobs/               # Background jobs
│   │   ├── statsCalculation.job.ts
│   │   ├── rankingUpdate.job.ts
│   │   └── emailNotification.job.ts
│   ├── utils/              # Utility functions
│   │   ├── gameLogic.ts
│   │   ├── bracketGenerator.ts
│   │   ├── validators.ts
│   │   └── helpers.ts
│   ├── types/              # TypeScript types
│   │   └── index.ts
│   ├── prisma/             # Database schema
│   │   ├── schema.prisma
│   │   ├── migrations/
│   │   └── seed.ts
│   ├── app.ts              # Express app setup
│   └── server.ts           # Server entry point
├── tests/
│   ├── unit/
│   ├── integration/
│   └── e2e/
├── .env.example
├── package.json
├── tsconfig.json
└── jest.config.js
```

### 3.3 API Architecture

**API Design Principles:**
- RESTful design
- Resource-based URLs
- Proper HTTP methods and status codes
- Consistent response format
- Versioned API (v1)

**Base URL Structure:**
```
/api/v1/auth          - Authentication endpoints
/api/v1/users         - User management
/api/v1/matches       - Match operations
/api/v1/tournaments   - Tournament management
/api/v1/game-types    - Game type definitions
/api/v1/stats         - Statistics and analytics
```

**Standard Response Format:**
```typescript
{
  success: boolean;
  data?: any;
  error?: {
    code: string;
    message: string;
    details?: any;
  };
  meta?: {
    pagination?: {
      page: number;
      limit: number;
      total: number;
      totalPages: number;
    };
    timestamp: string;
  };
}
```

### 3.4 WebSocket Architecture

**Namespaces:**
```
/matches     - Match-related real-time updates
/tournaments - Tournament progression updates
/global      - System-wide notifications
```

**Event Structure:**
```typescript
// Client to Server
{
  event: string;
  data: any;
  timestamp: number;
}

// Server to Client
{
  event: string;
  data: any;
  timestamp: number;
  userId?: string; // for targeted messages
}
```

**Match Events:**
- `match:join` - Player joins match
- `match:ready` - Player ready
- `match:countdown` - Countdown started
- `match:move` - Player made move
- `match:result` - Round result
- `match:complete` - Match complete
- `match:leave` - Player left match

### 3.5 Authentication & Authorization

**Authentication Flow:**
```
1. User submits credentials
2. Server validates credentials
3. Server generates JWT (access token + refresh token)
4. Client stores tokens securely
5. Client includes access token in API requests
6. Server validates token on each request
7. Token expires → use refresh token to get new access token
```

**JWT Payload:**
```typescript
{
  userId: string;
  email: string;
  role: 'player' | 'organizer' | 'admin';
  iat: number; // issued at
  exp: number; // expiration
}
```

**Token Configuration:**
- Access Token: 15 minutes expiration
- Refresh Token: 7 days expiration
- Store refresh token in httpOnly cookie

**Authorization Levels:**
- Public: Anyone
- Authenticated: Logged-in users
- Organizer: Tournament organizers
- Admin: System administrators

---

## 4. Database Architecture

### 4.1 Database Selection Rationale

**PostgreSQL** chosen for:
- ACID compliance
- Complex query support
- JSON data type support
- Excellent performance
- Strong indexing capabilities
- Mature ecosystem

### 4.2 Database Design Principles

- Normalized schema (3NF) for transactional data
- Denormalized views for analytics
- Proper indexing for query performance
- Constraints for data integrity
- Timestamps on all tables
- Soft deletes where appropriate

### 4.3 Schema Overview

**Core Entities:**
- Users
- Players
- GameTypes
- Matches
- Rounds
- Tournaments
- TournamentParticipants
- Brackets
- Statistics
- Achievements

*Detailed schema in separate document: 03_DATABASE_SCHEMA.md*

### 4.4 Caching Strategy

**Redis Cache Usage:**

**Session Storage:**
- User sessions (15-minute TTL)
- JWT blacklist (for logout)

**Rate Limiting:**
- API request counts
- Sliding window implementation

**Match Queue:**
- Active match rooms
- Player matchmaking queue

**Temporary Data:**
- Real-time match state
- WebSocket connection mapping

**Cache Invalidation:**
- Time-based (TTL)
- Event-based (on data updates)
- Manual (admin tools)

---

## 5. Security Architecture

### 5.1 Security Layers

**Transport Security:**
- HTTPS/TLS 1.3 only
- HSTS headers
- Secure WebSocket (WSS)

**Authentication Security:**
- bcrypt password hashing (12 rounds)
- JWT with short expiration
- Refresh token rotation
- Account lockout after failed attempts

**API Security:**
- Rate limiting (100 req/15min per IP)
- Input validation (Zod schemas)
- SQL injection protection (Prisma ORM)
- XSS protection (sanitization)
- CSRF protection (tokens)
- CORS configuration

**Data Security:**
- Encrypted sensitive data at rest
- PII data minimization
- Secure session management
- Database access controls

### 5.2 Security Headers

```javascript
{
  'Strict-Transport-Security': 'max-age=31536000; includeSubDomains',
  'X-Frame-Options': 'DENY',
  'X-Content-Type-Options': 'nosniff',
  'X-XSS-Protection': '1; mode=block',
  'Content-Security-Policy': "default-src 'self'",
  'Referrer-Policy': 'strict-origin-when-cross-origin'
}
```

### 5.3 Data Privacy

**GDPR Compliance:**
- User consent management
- Data export functionality
- Right to deletion
- Privacy policy
- Cookie consent

**Data Collection:**
- Minimal PII collection
- Anonymized analytics
- User-controlled data sharing

---

## 6. Scalability & Performance

### 6.1 Horizontal Scaling

**Application Tier:**
- Stateless API servers
- Load balancer (Nginx/AWS ALB)
- Auto-scaling based on CPU/memory

**WebSocket Tier:**
- Redis adapter for Socket.io
- Sticky sessions
- Multiple WebSocket servers

**Database Tier:**
- Read replicas for queries
- Connection pooling
- Query optimization

### 6.2 Performance Optimization

**Frontend:**
- Code splitting
- Lazy loading
- Image optimization
- Memoization
- Virtual scrolling for lists

**Backend:**
- Database query optimization
- N+1 query prevention
- Efficient indexing
- Response caching
- Gzip compression

**Network:**
- CDN for static assets
- HTTP/2
- Resource hints (preload, prefetch)

### 6.3 Monitoring & Observability

**Application Monitoring:**
- Error tracking (Sentry)
- Performance monitoring (New Relic/DataDog)
- Log aggregation (ELK stack)
- Uptime monitoring

**Metrics:**
- Request rate
- Response time
- Error rate
- Database query time
- WebSocket connection count
- Active user count

**Alerting:**
- High error rate
- Slow response time
- Database issues
- Server downtime

---

## 7. Development & Deployment

### 7.1 Development Environment

**Required Tools:**
- Node.js 20+
- Docker & Docker Compose
- PostgreSQL 15+
- Redis 7+
- Git

**Local Development:**
```bash
# Start all services
docker-compose up -d

# Run migrations
npm run db:migrate

# Start frontend dev server
cd frontend && npm run dev

# Start backend dev server
cd backend && npm run dev
```

### 7.2 CI/CD Pipeline

**Continuous Integration (GitHub Actions):**
```
1. Code commit/PR
2. Lint code
3. Run type checking
4. Run tests
5. Build application
6. Security scan
7. Generate artifacts
```

**Continuous Deployment:**
```
1. Merge to main branch
2. Build Docker images
3. Push to container registry
4. Run database migrations
5. Deploy to staging
6. Run smoke tests
7. Deploy to production (manual approval)
```

### 7.3 Infrastructure

**Cloud Provider:** AWS (recommended)

**Services:**
- EC2/ECS: Application hosting
- RDS: PostgreSQL database
- ElastiCache: Redis
- S3: Static file storage
- CloudFront: CDN
- Route 53: DNS
- ALB: Load balancing
- CloudWatch: Monitoring
- Secrets Manager: Secret storage

**Environments:**
- Development (local)
- Staging (cloud)
- Production (cloud)

### 7.4 Deployment Architecture

```
┌─────────────────────────────────────────────────────────┐
│                    Route 53 (DNS)                        │
└──────────────────────┬──────────────────────────────────┘
                       │
┌──────────────────────┴──────────────────────────────────┐
│              CloudFront (CDN)                            │
│  - Static assets caching                                 │
│  - SSL/TLS termination                                   │
└──────────────────────┬──────────────────────────────────┘
                       │
┌──────────────────────┴──────────────────────────────────┐
│       Application Load Balancer (ALB)                    │
│  - HTTPS termination                                     │
│  - Traffic distribution                                  │
│  - Health checks                                         │
└──────────┬───────────────────────────────┬──────────────┘
           │                               │
┌──────────┴──────────┐      ┌────────────┴──────────────┐
│   API Servers       │      │  WebSocket Servers         │
│   (ECS/Fargate)     │      │  (ECS/Fargate)             │
│   - Auto-scaling    │      │  - Sticky sessions         │
│   - Multiple AZs    │      │  - Redis adapter           │
└──────────┬──────────┘      └────────────┬───────────────┘
           │                               │
           └───────────┬───────────────────┘
                       │
        ┌──────────────┴────────────────┐
        │                               │
┌───────┴────────┐           ┌──────────┴─────────┐
│  RDS Postgres  │           │  ElastiCache Redis │
│  - Multi-AZ    │           │  - Cluster mode    │
│  - Read replica│           │  - Auto-failover   │
└────────────────┘           └────────────────────┘
```

---

## 8. Technology Justification

### 8.1 React (Frontend)
**Pros:**
- Large ecosystem
- Component reusability
- Strong TypeScript support
- Excellent developer experience
- Rich animation libraries

**Alternatives Considered:**
- Vue.js: Similar capabilities, smaller ecosystem
- Svelte: Great performance, smaller ecosystem

### 8.2 Node.js + Express (Backend)
**Pros:**
- JavaScript/TypeScript across stack
- Excellent WebSocket support
- Fast development
- Large package ecosystem
- Good scaling characteristics

**Alternatives Considered:**
- Python/FastAPI: Great for data processing, slower real-time
- Go: Excellent performance, steeper learning curve

### 8.3 PostgreSQL (Database)
**Pros:**
- ACID compliance
- Complex query support
- JSON support
- Excellent performance
- Proven at scale

**Alternatives Considered:**
- MongoDB: NoSQL flexibility, weaker consistency
- MySQL: Similar features, less advanced

### 8.4 Redis (Cache)
**Pros:**
- In-memory speed
- Pub/sub support
- Multiple data structures
- Simple to use

**Alternatives Considered:**
- Memcached: Simpler, less features

---

## 9. API Gateway & Rate Limiting

### 9.1 Rate Limiting Strategy

**Rate Limits:**
- Anonymous users: 20 req/min
- Authenticated users: 100 req/min
- WebSocket connections: 5 concurrent per user
- Match creation: 10/hour per user

**Implementation:**
- Redis-based sliding window
- Per-user and per-IP tracking
- 429 status code on limit exceeded

### 9.2 API Versioning

**Strategy:** URL-based versioning
```
/api/v1/matches
/api/v2/matches (future)
```

**Version Support:**
- Current version: Full support
- Previous version: 6 months support
- Deprecated versions: Clear migration path

---

## 10. Error Handling

### 10.1 Error Types

**Client Errors (4xx):**
- 400: Bad Request
- 401: Unauthorized
- 403: Forbidden
- 404: Not Found
- 422: Validation Error
- 429: Too Many Requests

**Server Errors (5xx):**
- 500: Internal Server Error
- 502: Bad Gateway
- 503: Service Unavailable

### 10.2 Error Response Format

```typescript
{
  success: false,
  error: {
    code: 'VALIDATION_ERROR',
    message: 'Invalid input data',
    details: {
      field: 'email',
      issue: 'Invalid email format'
    }
  },
  meta: {
    timestamp: '2025-11-22T10:30:00Z',
    requestId: 'req_abc123'
  }
}
```

---

## 11. Testing Strategy

### 11.1 Testing Levels

**Unit Tests:**
- Individual functions
- Business logic
- Utilities
- 80% coverage goal

**Integration Tests:**
- API endpoints
- Database operations
- Service interactions

**E2E Tests:**
- Critical user flows
- Match gameplay
- Tournament creation

**Performance Tests:**
- Load testing
- Stress testing
- API response times

### 11.2 Testing Tools

- Jest: Unit and integration tests
- Supertest: API testing
- Playwright: E2E testing
- K6: Load testing

---

## 12. Future Technical Considerations

### 12.1 Potential Enhancements

**Mobile Native Apps:**
- React Native implementation
- Native animations
- Push notifications

**Advanced Real-time:**
- Video streaming integration
- Live commentary support
- Spectator mode

**AI/ML Features:**
- Play pattern analysis
- Opponent prediction
- Fraud detection

**Blockchain Integration:**
- NFT achievements
- Tournament tokens
- Immutable match records

---

## 13. Technical Debt Management

### 13.1 Code Quality

**Standards:**
- ESLint configuration
- Prettier formatting
- TypeScript strict mode
- Code reviews required

**Documentation:**
- Code comments for complex logic
- API documentation (OpenAPI/Swagger)
- Architecture decision records (ADRs)
- README files

### 13.2 Refactoring Strategy

- Regular code reviews
- Quarterly technical debt sprints
- Continuous improvement mindset
- Balance features vs. refactoring

---

## 14. Disaster Recovery

### 14.1 Backup Strategy

**Database Backups:**
- Daily automated backups
- Point-in-time recovery (PITR)
- 30-day retention
- Cross-region replication

**File Backups:**
- S3 versioning enabled
- Cross-region replication

### 14.2 Recovery Procedures

**RTO (Recovery Time Objective):** 1 hour
**RPO (Recovery Point Objective):** 15 minutes

**Incident Response:**
1. Detect issue
2. Assess impact
3. Execute recovery plan
4. Verify system health
5. Post-mortem analysis

---

## 15. Appendix

### 15.1 Technology Versions

| Technology | Version | Notes |
|------------|---------|-------|
| Node.js | 20.x LTS | |
| React | 18.x | |
| TypeScript | 5.x | |
| Express | 4.x | |
| PostgreSQL | 15.x | |
| Redis | 7.x | |
| Socket.io | 4.x | |

### 15.2 Useful Links

- React Documentation: https://react.dev
- Express Documentation: https://expressjs.com
- PostgreSQL Documentation: https://postgresql.org
- Socket.io Documentation: https://socket.io

---

**Document Approval:**
- [ ] Technical Lead
- [ ] Backend Lead
- [ ] Frontend Lead
- [ ] DevOps Engineer

---

END OF DOCUMENT

