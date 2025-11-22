# RPSFull Tournament Platform

**Repository:** https://github.com/YOLOVibeCode/rpsfull.git  
**Version:** 1.0.0  
**Status:** Development

---

## 🎯 Project Overview

RPSFull is a mobile-responsive web application for managing and playing tournament-based Rock-Paper-Scissors games. The platform supports multiple game variants, detailed statistics tracking, and both live and digital gameplay modes.

---

## 🏗️ Core Development Principles

### 1. Test-Driven Development (TDD)

**We strictly follow TDD methodology:**

- ✅ **Write tests FIRST** - Before any implementation code
- ✅ **Red-Green-Refactor cycle** - See test fail, make it pass, improve code
- ✅ **Test coverage** - Maintain 80%+ coverage across all packages
- ✅ **Test-first mindset** - Every feature starts with a failing test

**TDD Workflow:**
```
1. 🔴 RED: Write failing test
2. 🟢 GREEN: Write minimal code to pass
3. 🔵 REFACTOR: Improve while tests stay green
```

**See:** `docs/implementation/05_TDD_ISP_METHODOLOGY.md` for complete TDD guide

### 2. Interface Segregation Principle (ISP)

**We strictly follow ISP:**

- ✅ **Small, focused interfaces** - One responsibility per interface
- ✅ **No "god interfaces"** - Split large interfaces into smaller ones
- ✅ **Services implement only what they need** - No forced dependencies
- ✅ **Composition over inheritance** - Prefer combining small interfaces

**ISP Example:**
```typescript
// ✅ GOOD: Segregated interfaces
interface IMatchService {
  createMatch(): void;
  getMatch(): void;
}

interface IMatchGameplayService {
  submitMove(): void;
  recordRound(): void;
}

// ❌ BAD: Large interface
interface IGameService {
  createMatch(): void;
  createTournament(): void;
  calculateStats(): void;
  validateGame(): void;
}
```

**See:** `docs/implementation/05_TDD_ISP_METHODOLOGY.md` for complete ISP guide

### 3. Mock API First Development

**We develop frontend against Mock API:**

- ✅ **Mock API is primary** - Frontend development uses mock API exclusively
- ✅ **Full CRUD operations** - Mock API implements all endpoints
- ✅ **Realistic data** - Mock API provides realistic seed data
- ✅ **Backend follows later** - Backend implementation happens after frontend is functional

**Development Flow:**
```
1. Mock API → Complete CRUD implementation
2. Frontend → Develop against Mock API
3. Backend → Implement real API matching Mock API contracts
4. Integration → Replace Mock API with real backend
```

**See:** `docs/implementation/02_MOCK_API_SPECIFICATION.md` for complete mock API design

### 4. Data Access Layer Excellence

**We use Prisma ORM for all data access:**

- ✅ **Type-safe queries** - Prisma generates TypeScript types
- ✅ **Migration-based schema** - Version-controlled database changes
- ✅ **Transaction support** - ACID compliance for data integrity
- ✅ **Query optimization** - Prisma optimizes queries automatically
- ✅ **Relationship handling** - Proper foreign keys and constraints

**Data Access Principles:**

1. **Repository Pattern** - All data access through repositories
2. **Interface-based** - Repositories implement interfaces from contracts package
3. **Transaction safety** - Critical operations use transactions
4. **Error handling** - Proper error handling and rollback
5. **Type safety** - Full TypeScript type safety end-to-end

**Repository Structure:**
```typescript
// Repository implements interface from contracts
class UserRepository implements IUserRepository {
  constructor(private prisma: PrismaClient) {}
  
  async create(data: IUserCreate): Promise<IUser> {
    return this.prisma.user.create({ data });
  }
  
  async findById(id: string): Promise<IUser | null> {
    return this.prisma.user.findUnique({ where: { id } });
  }
}
```

**See:** `docs/specs/03_DATABASE_SCHEMA.md` for complete database design

---

## 📁 Project Structure

```
rpsfull/
├── packages/
│   ├── contracts/          # @rpsfull-platform/contracts
│   │   └── src/
│   │       ├── entities/   # Domain entities
│   │       ├── dtos/       # Data Transfer Objects
│   │       ├── interfaces/ # Service contracts (ISP)
│   │       ├── enums/      # Enumerations
│   │       └── validators/ # Zod validation schemas
│   │
│   ├── frontend/           # Next.js 14+ application
│   │   └── src/
│   │       ├── app/        # Next.js App Router
│   │       ├── components/ # React components
│   │       ├── features/   # Feature modules
│   │       └── services/   # API clients
│   │
│   ├── backend/            # Express API server
│   │   └── src/
│   │       ├── repositories/ # Prisma repositories (TDD + ISP)
│   │       ├── services/     # Business logic (TDD + ISP)
│   │       ├── modules/      # Feature modules
│   │       └── websocket/    # Real-time handlers
│   │
│   └── mock-api/           # Mock API server
│       └── src/
│           ├── data/        # In-memory data store
│           ├── routes/      # Express routes
│           └── services/    # Mock services
│
├── docs/
│   ├── specs/              # Complete specifications
│   └── implementation/     # Implementation guides
│
├── docker-compose.yml      # PostgreSQL, Redis
├── package.json            # Root package.json
├── pnpm-workspace.yaml     # PNPM workspaces
└── README.md               # This file
```

---

## 🚀 Quick Start

### Prerequisites

- **Node.js** 20+ 
- **PNPM** 8+
- **Docker** & Docker Compose
- **Git**

### Initial Setup

```bash
# Clone repository
git clone https://github.com/YOLOVibeCode/rpsfull.git
cd rpsfull

# Install dependencies
pnpm install

# Start Docker services (PostgreSQL, Redis)
docker-compose up -d

# Build contracts package
pnpm contracts:build
```

### Development Workflow

**1. Start Mock API (Primary for Frontend Development)**
```bash
pnpm mock-api:dev
# Mock API runs on http://localhost:3001
```

**2. Start Frontend (Develops Against Mock API)**
```bash
cd packages/frontend
pnpm dev
# Frontend runs on http://localhost:3000
```

**3. Backend Development (When Ready)**
```bash
cd packages/backend

# Setup database
pnpm db:migrate
pnpm db:seed

# Start backend
pnpm dev
# Backend runs on http://localhost:3000 (API routes)
```

---

## 🧪 Testing

### TDD Workflow

**Every feature follows this cycle:**

1. **Write Test (RED)**
   ```typescript
   describe('Feature', () => {
     it('should do something', async () => {
       // Test implementation
     });
   });
   ```

2. **Run Test (Should Fail)**
   ```bash
   pnpm test
   ```

3. **Implement (GREEN)**
   ```typescript
   class Feature implements IFeature {
     // Minimal implementation
   }
   ```

4. **Run Test (Should Pass)**
   ```bash
   pnpm test
   ```

5. **Refactor (If Needed)**
   - Improve code while keeping tests green

### Test Commands

```bash
# Run all tests
pnpm test

# Run tests with coverage
pnpm test:coverage

# Run tests in watch mode
pnpm test:watch

# Run specific package tests
pnpm --filter @rpsfull-platform/backend test
```

### Test Coverage Requirements

- **Minimum Coverage:** 100% (not 80%)
- **Branches:** 100%
- **Functions:** 100%
- **Lines:** 100%
- **Statements:** 100%

**No exceptions. Build will fail if coverage < 100%.**

---

## 📊 Data Access Layer

### Prisma ORM

**We use Prisma for all database operations:**

- **Type Safety** - Generated TypeScript types
- **Migrations** - Version-controlled schema changes
- **Relations** - Type-safe relationships
- **Transactions** - ACID compliance
- **Query Builder** - Optimized queries

### Repository Pattern

**All data access follows repository pattern:**

```typescript
// Interface from contracts package
interface IUserRepository {
  create(data: IUserCreate): Promise<IUser>;
  findById(id: string): Promise<IUser | null>;
  findByEmail(email: string): Promise<IUser | null>;
  update(id: string, data: IUserUpdate): Promise<IUser>;
  delete(id: string): Promise<void>;
}

// Implementation with Prisma
class UserRepository implements IUserRepository {
  constructor(private prisma: PrismaClient) {}
  
  async create(data: IUserCreate): Promise<IUser> {
    return this.prisma.user.create({ data });
  }
  
  // ... other methods
}
```

### Data Access Principles

1. **Always use repositories** - Never direct Prisma calls in services
2. **Interface-based** - Repositories implement contracts interfaces
3. **Transaction safety** - Use transactions for multi-step operations
4. **Error handling** - Proper error handling and rollback
5. **Type safety** - Full TypeScript type safety

### Database Setup

```bash
cd packages/backend

# Generate Prisma Client
pnpm db:generate

# Create migration
pnpm db:migrate

# Seed database
pnpm db:seed

# Open Prisma Studio
pnpm db:studio
```

**See:** `docs/specs/03_DATABASE_SCHEMA.md` for complete schema

---

## 📚 Documentation

### Specifications (`docs/specs/`)

- **01_PROJECT_OVERVIEW.md** - Project vision and goals
- **02_TECHNICAL_ARCHITECTURE_UPDATED.md** - Next.js + Contracts architecture
- **03_DATABASE_SCHEMA.md** - Complete database design with Prisma
- **04_API_SPECIFICATION.md** - All API endpoints
- **05_UI_UX_DESIGN.md** - Design system and UI specs
- **06_CONTRACTS_PACKAGE.md** - Type definitions and interfaces (ISP)
- **07_SVG_ICONS_SPECIFICATION.md** - Icon system and assets
- **08_HISTORICAL_DATA_ANALYTICS.md** - Historical tracking system
- **09_GAME_EDITOR_SPECIFICATION.md** - Custom game creation
- **10_AUTHENTICATION_REGISTRATION.md** - Auth and registration flow

### Implementation Guides (`docs/implementation/`)

- **00_QUICK_REFERENCE.md** - Developer quick start
- **01_IMPLEMENTATION_PLAN.md** - High-level roadmap
- **02_MOCK_API_SPECIFICATION.md** - Complete mock API design
- **03_SPRINT_PLANNING.md** - Detailed sprint breakdown
- **04_STEP_BY_STEP_IMPLEMENTATION.md** - Complete step-by-step guide (TDD + ISP)
- **05_TDD_ISP_METHODOLOGY.md** - Complete TDD + ISP methodology
- **06_COMPONENT_FIRST_BUILD_ORDER.md** - Component-first build order with 100% test coverage

---

## 🔧 Technology Stack

| Component | Technology | Version |
|-----------|-----------|---------|
| Frontend | Next.js | 14+ |
| Backend | Express.js | 4.18+ |
| Database | PostgreSQL | 15+ |
| ORM | Prisma | 5.7+ |
| Cache | Redis | 7+ |
| Real-time | Socket.io | 4.5+ |
| Language | TypeScript | 5+ |
| Package Manager | PNPM | 8+ |
| Styling | Tailwind CSS | 3+ |
| State | Zustand | 4+ |
| Data Fetching | React Query | 5+ |
| Animations | Framer Motion | 10+ |
| Testing | Jest | 29+ |
| Validation | Zod | 3.22+ |

---

## 🎯 Development Priorities

### Component-First Build Strategy

```
Phase 1: Base Contract Library (Weeks 1-2)
    ↓ (100% test coverage required)
Phase 2: Data Access Library (Weeks 3-4)
    ↓ (100% test coverage required)
Phase 3: UI Components (Weeks 5-6)
    ↓ (100% test coverage required)
Phase 4: Integration & Features (Weeks 7+)
```

**CRITICAL:** Each phase must be 100% complete with full test coverage before moving to next phase.

**See:** `docs/implementation/06_COMPONENT_FIRST_BUILD_ORDER.md` for complete build order

### Phase 1: Foundation (Current)
- ✅ Contracts package (100% validator test coverage)
- ✅ Mock API (Full CRUD)
- ✅ Database schema (Prisma)
- ✅ Repository interfaces (ISP)

### Phase 2: Data Access Library
- Repository implementations (100% test coverage)
- All CRUD operations tested
- Transaction handling tested
- Error handling tested
- Performance benchmarks met

### Phase 3: UI Components
- Component library (100% test coverage)
- All variants tested
- All interactions tested
- Accessibility tested
- Visual regression tested

### Phase 4: Integration & Features
- Match system (TDD + ISP)
- Tournament system (TDD + ISP)
- Authentication (TDD + ISP)
- Statistics engine (TDD + ISP)

---

## 📝 Code Standards

### TypeScript
- Strict mode enabled
- No `any` types (use `unknown` if needed)
- All functions typed
- Interfaces over types for objects

### Naming Conventions
- **Files**: kebab-case (`user-service.ts`)
- **Components**: PascalCase (`UserProfile.tsx`)
- **Functions**: camelCase (`getUserById`)
- **Constants**: UPPER_SNAKE_CASE (`MAX_BEST_OF_N`)
- **Types/Interfaces**: PascalCase with `I` prefix (`IUser`)

### Git Workflow
- **Branch Strategy**: `main`, `develop`, `feature/*`, `fix/*`
- **Commit Messages**: Conventional commits (`feat:`, `fix:`, `docs:`)
- **Pull Requests**: Required for all changes
- **Code Review**: Required before merge

---

## ✅ Pre-Commit Checklist

Before committing code:
- [ ] Code compiles without errors
- [ ] All tests pass
- [ ] **Test coverage = 100%** (not 80%)
- [ ] Linting passes (`pnpm lint`)
- [ ] Type checking passes (`pnpm type-check`)
- [ ] No console.logs in production code
- [ ] TDD workflow followed (tests written first)
- [ ] ISP principles followed (small, focused interfaces)
- [ ] Data access through repositories only
- [ ] Changes documented in code comments
- [ ] Quality gate passed

---

## 🚢 Deployment

### Production Checklist
- [ ] All tests passing
- [ ] Security audit completed
- [ ] Performance benchmarks met
- [ ] Database migrations tested
- [ ] Environment variables configured
- [ ] SSL certificates installed
- [ ] Monitoring configured
- [ ] Backup strategy in place

---

## 🤝 Contributing

1. **Clone repository**
   ```bash
   git clone https://github.com/YOLOVibeCode/rpsfull.git
   ```

2. **Create feature branch**
   ```bash
   git checkout -b feature/your-feature-name
   ```

3. **Follow TDD + ISP**
   - Write test first (RED)
   - Implement to pass (GREEN)
   - Refactor if needed
   - Use small, focused interfaces

4. **Use Mock API for Frontend**
   - Develop frontend against mock API
   - Mock API provides full CRUD operations

5. **Data Access Through Repositories**
   - Use Prisma repositories only
   - Implement contracts interfaces
   - Follow transaction safety

6. **Submit Pull Request**
   - Include tests
   - Update documentation
   - Follow code standards

---

## 📞 Support & Resources

- **Repository:** https://github.com/YOLOVibeCode/rpsfull.git
- **Documentation:** `docs/` directory
- **Issues:** GitHub Issues
- **Discussions:** GitHub Discussions

---

## 📄 License

[License information to be added]

---

## 📖 Best Practices

This project follows strict coding standards and best practices. **See:** `docs/specs/11_BEST_PRACTICES_STANDARDS.md`

**Key Standards:**
- ✅ TypeScript strict mode (no `any` types)
- ✅ Event-based communication patterns
- ✅ Minimal React useEffect usage
- ✅ Server Components by default
- ✅ Pure functions and immutability
- ✅ Named exports only
- ✅ 100% test coverage
- ✅ Conventional commits

---

**Last Updated:** November 22, 2025  
**Maintained By:** Development Team

---

END OF README

