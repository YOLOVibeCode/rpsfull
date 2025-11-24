# Port Configuration

This document outlines all port configurations for the RPSFull platform.

## 🚪 Port Assignments

| Service | Port | Description |
|---------|------|-------------|
| **Backend API** | `4444` | Express.js API server |
| **Frontend** | `4445` | Next.js application |
| **PostgreSQL** | `5432` | Database server (Docker) |
| **Redis** | `6379` | Cache server (Docker) |

## 📝 Configuration Files

### Backend Port (4444)

**File:** `packages/backend/src/server.ts`
```typescript
const PORT = process.env.API_PORT || process.env.PORT || 4444;
```

**Environment Variable:**
```bash
API_PORT=4444
# or
PORT=4444
```

### Frontend Port (4445)

**File:** `packages/frontend/package.json`
```json
"dev": "next dev -p 4445"
```

**Environment Variable:**
```bash
PORT=4445
```

### API URLs

**File:** `packages/frontend/next.config.js`
```javascript
NEXT_PUBLIC_API_URL: 'http://localhost:4444/api/v1'
NEXT_PUBLIC_WS_URL: 'http://localhost:4444'
```

## 🔧 Changing Ports

If you need to change ports:

### Change Backend Port

1. Update `packages/backend/src/server.ts`:
   ```typescript
   const PORT = process.env.API_PORT || process.env.PORT || YOUR_PORT;
   ```

2. Update `packages/frontend/next.config.js`:
   ```javascript
   NEXT_PUBLIC_API_URL: `http://localhost:YOUR_PORT/api/v1`
   NEXT_PUBLIC_WS_URL: `http://localhost:YOUR_PORT`
   ```

3. Update all documentation files

### Change Frontend Port

1. Update `packages/frontend/package.json`:
   ```json
   "dev": "next dev -p YOUR_PORT"
   ```

2. Update all documentation files

## 🌐 Access URLs

- **Frontend**: http://localhost:4445
- **Backend API**: http://localhost:4444
- **API Health**: http://localhost:4444/health
- **API Base**: http://localhost:4444/api/v1
- **WebSocket**: ws://localhost:4444/socket.io

## ✅ Verification

Check if ports are in use:
```bash
lsof -ti:4444  # Backend
lsof -ti:4445  # Frontend
```

---

**Last Updated**: Ports changed from 3000/3001 to 4444/4445

