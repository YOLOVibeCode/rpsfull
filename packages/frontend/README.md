# Frontend Application

Next.js 14+ frontend application for RPSFull Tournament Platform built with TypeScript, Tailwind CSS, Zustand, and React Query.

## 🚀 Quick Start

### Prerequisites

- Node.js 20+
- PNPM

### Installation

1. **Install dependencies:**
   ```bash
   pnpm install
   ```

2. **Set up environment variables:**
   Create a `.env.local` file:
   ```env
   NEXT_PUBLIC_API_URL=http://localhost:4444/api/v1
   NEXT_PUBLIC_WS_URL=http://localhost:4444
   ```

3. **Start development server:**
   ```bash
   pnpm dev
   ```

The app will be available at `http://localhost:4445`

## 📁 Project Structure

```
packages/frontend/
├── src/
│   ├── app/                    # Next.js App Router
│   │   ├── layout.tsx          # Root layout
│   │   ├── page.tsx            # Home page
│   │   ├── providers.tsx       # Global providers
│   │   └── globals.css         # Global styles
│   ├── components/             # React components
│   │   └── ui/                 # Base UI components
│   │       ├── Button.tsx
│   │       └── Input.tsx
│   ├── contexts/               # React contexts
│   │   ├── AuthContext.tsx     # Authentication context
│   │   └── SocketContext.tsx    # WebSocket context
│   ├── lib/                    # Utility libraries
│   │   ├── api/                # API client
│   │   │   └── client.ts
│   │   ├── socket/             # Socket.io client
│   │   │   └── client.ts
│   │   └── utils.ts            # Utility functions
│   └── store/                  # Zustand stores
│       └── authStore.ts
├── next.config.js
├── tailwind.config.js
└── tsconfig.json
```

## 🏗️ Architecture

### Technology Stack

- **Next.js 14+**: App Router with React Server Components
- **TypeScript 5+**: Type safety
- **Tailwind CSS**: Utility-first styling
- **Zustand**: Global client state
- **React Query**: Server state & caching
- **Socket.io Client**: Real-time WebSocket communication
- **Framer Motion**: Animations
- **Axios**: HTTP client

### State Management

- **Zustand**: Global authentication state
- **React Query**: Server state (API data)
- **Context API**: Auth & Socket contexts

### API Integration

- **API Client**: Axios-based client with automatic token injection
- **React Query**: Automatic caching, refetching, and error handling
- **Socket.io**: Real-time updates for matches and tournaments

## 🎨 UI Components

### Base Components

- `Button`: Styled button with variants (primary, secondary, outline, ghost, danger)
- `Input`: Form input with label and error handling

### Component Usage

```tsx
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';

<Button variant="primary" size="md" isLoading={loading}>
  Submit
</Button>

<Input
  label="Email"
  type="email"
  error={errors.email}
  {...register('email')}
/>
```

## 🔐 Authentication

### Auth Context

```tsx
import { useAuth } from '@/contexts/AuthContext';

const { user, isAuthenticated, login, logout } = useAuth();
```

### Auth Store (Zustand)

```tsx
import { useAuthStore } from '@/store/authStore';

const { user, accessToken, setUser, clearAuth } = useAuthStore();
```

## 🔌 WebSocket

### Socket Context

```tsx
import { useSocket } from '@/contexts/SocketContext';

const { socket, isConnected } = useSocket();

// Join match room
socket?.emit('match:join', matchId);

// Listen for events
socket?.on('match:updated', (data) => {
  console.log('Match updated:', data);
});
```

## 📦 Scripts

- `pnpm dev` - Start development server
- `pnpm build` - Build for production
- `pnpm start` - Start production server
- `pnpm lint` - Lint code
- `pnpm test` - Run tests
- `pnpm type-check` - Type check without building

## 🔧 Configuration

### Environment Variables

- `NEXT_PUBLIC_API_URL` - Backend API URL (default: `http://localhost:4444/api/v1`)
- `NEXT_PUBLIC_WS_URL` - WebSocket server URL (default: `http://localhost:4444`)

### Tailwind CSS

Custom theme colors and animations configured in `tailwind.config.js`.

## 📚 Documentation

- [Next.js Documentation](https://nextjs.org/docs)
- [React Query Documentation](https://tanstack.com/query/latest)
- [Zustand Documentation](https://zustand-demo.pmnd.rs/)
- [Socket.io Client Documentation](https://socket.io/docs/v4/client-api/)

## 🤝 Contributing

Follow the TDD and ISP principles outlined in the implementation guide.

