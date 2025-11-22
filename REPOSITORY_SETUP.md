# RPSFull Platform - Repository Setup Guide

**Repository:** https://github.com/YOLOVibeCode/rpsfull.git  
**Last Updated:** November 22, 2025

---

## Quick Start

### Clone Repository
```bash
git clone https://github.com/YOLOVibeCode/rpsfull.git
cd rpsfull
```

### Initial Setup
```bash
# Install dependencies
pnpm install

# Start Docker services (PostgreSQL, Redis)
docker-compose up -d

# Build contracts package
pnpm contracts:build

# Setup database (when backend is ready)
cd packages/backend
pnpm db:migrate
pnpm db:seed
```

### Development
```bash
# Start mock API (for frontend development)
pnpm mock-api:dev

# Start frontend
cd packages/frontend
pnpm dev

# Start backend (when ready)
cd packages/backend
pnpm dev
```

---

## Repository Structure

```
rpsfull/
├── packages/
│   ├── contracts/          # Shared types (@rpsfull-platform/contracts)
│   ├── frontend/           # Next.js application
│   ├── backend/            # Express API server
│   └── mock-api/           # Mock API for development
├── docs/
│   ├── specs/              # Complete specifications
│   └── implementation/     # Implementation guides
├── docker-compose.yml      # Local development services
├── package.json            # Root package.json
├── pnpm-workspace.yaml     # PNPM workspace config
└── README.md               # Project overview
```

---

## Git Workflow

### Branch Strategy
- `main` - Production-ready code
- `develop` - Integration branch
- `feature/*` - Feature branches
- `fix/*` - Bug fixes
- `docs/*` - Documentation updates

### Commit Messages
Follow conventional commits:
- `feat:` - New feature
- `fix:` - Bug fix
- `docs:` - Documentation
- `refactor:` - Code refactoring
- `test:` - Tests
- `chore:` - Maintenance

### Example
```bash
git checkout -b feature/match-system
# Make changes
git add .
git commit -m "feat: implement match creation with TDD"
git push origin feature/match-system
```

---

## Contributing

1. Clone repository
2. Create feature branch
3. Make changes following TDD + ISP
4. Write tests first
5. Implement to pass tests
6. Refactor if needed
7. Submit pull request

---

## Documentation

- **Specifications**: `docs/specs/`
- **Implementation Guides**: `docs/implementation/`
- **Quick Reference**: `docs/implementation/00_QUICK_REFERENCE.md`
- **TDD + ISP Guide**: `docs/implementation/05_TDD_ISP_METHODOLOGY.md`

---

**Repository:** https://github.com/YOLOVibeCode/rpsfull.git

