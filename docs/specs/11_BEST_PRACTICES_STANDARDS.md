# Best Practices & Code Standards
## RPSFull Tournament Platform - Complete Development Standards

**Document Version:** 1.0  
**Last Updated:** November 22, 2025  
**Status:** Mandatory Standards  
**Repository:** https://github.com/YOLOVibeCode/rpsfull.git

---

## 🎯 Core Principles

### 1. Type Safety First
- **Never use `any`** - Use `unknown` if type is truly unknown
- **Strict TypeScript** - All strict mode flags enabled
- **Explicit types** - Always declare function return types
- **No type assertions** - Use type guards instead

### 2. Event-Based Communication
- **Use events over callbacks** - Prefer EventEmitter patterns
- **Local-first** - Keep state as local as possible
- **Minimal effects** - Use React useEffect sparingly
- **Custom hooks** - Extract logic into reusable hooks

### 3. Immutability
- **No mutations** - Always create new objects/arrays
- **Const by default** - Use `const` unless reassignment needed
- **Pure functions** - Functions should not have side effects
- **Immutable state** - Use Zustand with immer

---

## TypeScript Standards

### Strict Configuration

**File: `tsconfig.base.json` (root)**

```json
{
  "compilerOptions": {
    // Type Checking
    "strict": true,
    "noImplicitAny": true,
    "strictNullChecks": true,
    "strictFunctionTypes": true,
    "strictBindCallApply": true,
    "strictPropertyInitialization": true,
    "noImplicitThis": true,
    "alwaysStrict": true,
    
    // Additional Checks
    "noUnusedLocals": true,
    "noUnusedParameters": true,
    "noImplicitReturns": true,
    "noFallthroughCasesInSwitch": true,
    "noUncheckedIndexedAccess": true,
    "noImplicitOverride": true,
    "noPropertyAccessFromIndexSignature": true,
    
    // Module Resolution
    "module": "ESNext",
    "moduleResolution": "bundler",
    "resolveJsonModule": true,
    "esModuleInterop": true,
    "allowSyntheticDefaultImports": true,
    "isolatedModules": true,
    
    // Emit
    "declaration": true,
    "declarationMap": true,
    "sourceMap": true,
    "removeComments": false,
    "importHelpers": true,
    
    // JavaScript Support
    "allowJs": false,
    "checkJs": false,
    
    // Editor Support
    "skipLibCheck": true,
    "forceConsistentCasingInFileNames": true,
    
    // Target
    "target": "ES2022",
    "lib": ["ES2022", "DOM", "DOM.Iterable"]
  }
}
```

### Type Declaration Standards

```typescript
// ❌ BAD
function getData(id) {
  return fetch(`/api/${id}`);
}

// ✅ GOOD
async function getData(id: string): Promise<Data> {
  const response = await fetch(`/api/${id}`);
  return response.json();
}

// ❌ BAD
const user: any = getUser();

// ✅ GOOD
const user: IUser = await getUser();

// ❌ BAD - Type assertion
const element = document.getElementById('root') as HTMLElement;

// ✅ GOOD - Type guard
const element = document.getElementById('root');
if (!element) throw new Error('Root element not found');
// element is now HTMLElement

// ❌ BAD - No return type
function calculate(a: number, b: number) {
  return a + b;
}

// ✅ GOOD - Explicit return type
function calculate(a: number, b: number): number {
  return a + b;
}
```

---

## Naming Conventions

### Files and Directories

```
✅ GOOD:
packages/
├── contracts/
│   └── src/
│       ├── entities/
│       │   └── user.entity.ts         // kebab-case
│       ├── services/
│       │   └── auth.service.ts        // kebab-case
│       └── utils/
│           └── string-helpers.ts      // kebab-case
├── frontend/
│   └── src/
│       ├── components/
│       │   └── Button/
│       │       ├── Button.tsx         // PascalCase (React components)
│       │       ├── Button.test.tsx
│       │       ├── Button.stories.tsx
│       │       └── index.ts
│       └── hooks/
│           └── use-auth.ts            // kebab-case with 'use-' prefix
└── backend/
    └── src/
        ├── repositories/
        │   └── user.repository.ts     // kebab-case
        └── middleware/
            └── error-handler.middleware.ts
```

### Variables and Functions

```typescript
// ❌ BAD
const MYVAR = 'value';
const my_var = 'value';
const MyVar = 'value';

// ✅ GOOD
const myVar = 'value';              // camelCase for variables
const MY_CONSTANT = 'value';        // UPPER_SNAKE_CASE for constants

// ❌ BAD
function GetUser() {}
function get_user() {}

// ✅ GOOD
function getUser() {}               // camelCase for functions
async function fetchUserData() {}  // camelCase for async functions

// ❌ BAD
const handleclick = () => {};

// ✅ GOOD
const handleClick = () => {};       // camelCase for event handlers
const onClick = () => {};           // Event handler naming
```

### Types and Interfaces

```typescript
// ❌ BAD
type user = { };
interface player { }

// ✅ GOOD
type User = { };                    // PascalCase for types
interface IUser { }                 // PascalCase with 'I' prefix for interfaces
interface IUserRepository { }       // ISP: focused interfaces

// ❌ BAD
enum status { }

// ✅ GOOD
enum Status { }                     // PascalCase for enums
enum UserRole {                     // PascalCase for enum members
  PLAYER = 'player',
  ADMIN = 'admin',
}

// ❌ BAD
class userService { }

// ✅ GOOD
class UserService { }               // PascalCase for classes
```

### React Components

```typescript
// ❌ BAD
export function button() {}
export const myComponent = () => {};

// ✅ GOOD
export function Button() {}         // PascalCase
export const UserProfile = () => {}; // PascalCase

// ❌ BAD
const buttonprops = { };

// ✅ GOOD
interface ButtonProps {             // Props interface with 'Props' suffix
  variant: 'primary' | 'secondary';
  onClick?: () => void;
}

export function Button({ variant, onClick }: ButtonProps) {}
```

---

## Next.js Best Practices

### App Router Structure

```
src/
├── app/                          # Next.js App Router
│   ├── (auth)/                   # Route groups
│   │   ├── login/
│   │   │   └── page.tsx          # Login page
│   │   └── register/
│   │       └── page.tsx
│   ├── (dashboard)/
│   │   ├── layout.tsx            # Dashboard layout
│   │   ├── page.tsx              # Dashboard home
│   │   └── tournaments/
│   │       ├── page.tsx          # Tournaments list
│   │       └── [id]/
│   │           └── page.tsx      # Tournament detail
│   ├── api/                      # API routes
│   │   └── auth/
│   │       └── route.ts          # API route handler
│   ├── layout.tsx                # Root layout
│   ├── page.tsx                  # Home page
│   └── error.tsx                 # Error boundary
├── components/                   # React components
│   ├── ui/                       # UI components
│   │   ├── Button/
│   │   └── Input/
│   └── features/                 # Feature components
│       ├── auth/
│       └── match/
├── hooks/                        # Custom hooks
│   ├── use-auth.ts
│   └── use-match.ts
├── lib/                          # Utilities
│   ├── api-client.ts
│   └── event-emitter.ts
└── store/                        # State management
    └── auth-store.ts
```

### Server Components by Default

```typescript
// ✅ GOOD - Server Component (default)
// app/tournaments/page.tsx
import { getTournaments } from '@/lib/api';

export default async function TournamentsPage() {
  const tournaments = await getTournaments();
  
  return (
    <div>
      {tournaments.map(t => (
        <TournamentCard key={t.id} tournament={t} />
      ))}
    </div>
  );
}

// ✅ GOOD - Client Component (when needed)
// components/match/GamePlay.tsx
'use client';

import { useEffect, useState } from 'react';
import { useGameEvents } from '@/hooks/use-game-events';

export function GamePlay({ matchId }: { matchId: string }) {
  // Only use client components when you need:
  // - Event listeners
  // - Browser APIs
  // - State management
  const { emitMove } = useGameEvents(matchId);
  
  return <div>...</div>;
}
```

### Minimize useEffect Usage

```typescript
// ❌ BAD - Unnecessary useEffect
'use client';

export function UserProfile({ userId }: { userId: string }) {
  const [user, setUser] = useState<IUser | null>(null);
  
  useEffect(() => {
    fetch(`/api/users/${userId}`)
      .then(res => res.json())
      .then(setUser);
  }, [userId]);
  
  return <div>{user?.name}</div>;
}

// ✅ GOOD - Server Component (no useEffect needed)
import { getUser } from '@/lib/api';

export default async function UserProfile({ userId }: { userId: string }) {
  const user = await getUser(userId);
  return <div>{user.name}</div>;
}

// ✅ GOOD - Use React Query for client-side data fetching
'use client';

import { useQuery } from '@tanstack/react-query';

export function UserProfile({ userId }: { userId: string }) {
  const { data: user } = useQuery({
    queryKey: ['user', userId],
    queryFn: () => fetchUser(userId),
  });
  
  return <div>{user?.name}</div>;
}
```

### Event-Based Communication

```typescript
// ✅ GOOD - Custom hook with event emitter
// hooks/use-game-events.ts
import { useEffect, useCallback } from 'react';
import { gameEventEmitter } from '@/lib/event-emitter';

export function useGameEvents(matchId: string) {
  // Emit events instead of direct state updates
  const emitMove = useCallback((move: string) => {
    gameEventEmitter.emit('move:submit', { matchId, move });
  }, [matchId]);
  
  useEffect(() => {
    const handleMoveResult = (data: MoveResult) => {
      // Handle result
    };
    
    gameEventEmitter.on('move:result', handleMoveResult);
    
    return () => {
      gameEventEmitter.off('move:result', handleMoveResult);
    };
  }, [matchId]);
  
  return { emitMove };
}

// lib/event-emitter.ts
import { EventEmitter } from 'events';

export const gameEventEmitter = new EventEmitter();
```

---

## Express Best Practices

### Router Structure

```typescript
// ❌ BAD - All routes in one file
app.get('/users', ...);
app.post('/users', ...);
app.get('/matches', ...);

// ✅ GOOD - Modular routers
// src/app.ts
import { userRouter } from './routes/user.routes';
import { matchRouter } from './routes/match.routes';

app.use('/api/v1/users', userRouter);
app.use('/api/v1/matches', matchRouter);

// src/routes/user.routes.ts
import { Router } from 'express';
import { UserController } from '../controllers/user.controller';

const router = Router();
const controller = new UserController();

router.get('/', controller.getAll);
router.get('/:id', controller.getById);
router.post('/', validateRequest(createUserSchema), controller.create);
router.put('/:id', validateRequest(updateUserSchema), controller.update);
router.delete('/:id', controller.delete);

export { router as userRouter };
```

### Middleware Ordering

```typescript
// ✅ GOOD - Correct middleware order
import express from 'express';
import helmet from 'helmet';
import cors from 'cors';
import rateLimit from 'express-rate-limit';

const app = express();

// 1. Security headers (first)
app.use(helmet());

// 2. CORS
app.use(cors({
  origin: process.env.FRONTEND_URL,
  credentials: true,
}));

// 3. Rate limiting
app.use(rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
}));

// 4. Body parsing
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// 5. Request logging
app.use(requestLogger);

// 6. Routes
app.use('/api/v1', routes);

// 7. Error handling (last)
app.use(errorHandler);
```

### Error Handling

```typescript
// ✅ GOOD - Centralized error handling
// middleware/error-handler.middleware.ts
import { Request, Response, NextFunction } from 'express';

export class AppError extends Error {
  constructor(
    public statusCode: number,
    public message: string,
    public isOperational = true
  ) {
    super(message);
    Object.setPrototypeOf(this, AppError.prototype);
  }
}

export function errorHandler(
  err: Error,
  req: Request,
  res: Response,
  next: NextFunction
) {
  if (err instanceof AppError) {
    return res.status(err.statusCode).json({
      success: false,
      error: {
        message: err.message,
        code: err.statusCode,
      },
    });
  }
  
  // Unexpected errors
  console.error('Unexpected error:', err);
  return res.status(500).json({
    success: false,
    error: {
      message: 'Internal server error',
      code: 500,
    },
  });
}

// Usage in controllers
export class UserController {
  async getById(req: Request, res: Response, next: NextFunction) {
    try {
      const user = await this.userService.findById(req.params.id);
      if (!user) {
        throw new AppError(404, 'User not found');
      }
      res.json({ success: true, data: user });
    } catch (error) {
      next(error);
    }
  }
}
```

### Async Error Handling

```typescript
// ✅ GOOD - Async wrapper
// utils/async-handler.ts
import { Request, Response, NextFunction } from 'express';

export function asyncHandler(
  fn: (req: Request, res: Response, next: NextFunction) => Promise<any>
) {
  return (req: Request, res: Response, next: NextFunction) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
}

// Usage
router.get(
  '/:id',
  asyncHandler(async (req, res) => {
    const user = await userService.findById(req.params.id);
    res.json({ success: true, data: user });
  })
);
```

---

## State Management Best Practices

### Zustand with Immer

```typescript
// ✅ GOOD - Zustand store with immer
// store/match-store.ts
import { create } from 'zustand';
import { immer } from 'zustand/middleware/immer';
import { IMatch } from '@rpsfull-platform/contracts';

interface MatchState {
  matches: Map<string, IMatch>;
  currentMatch: IMatch | null;
  
  // Actions
  setMatch: (match: IMatch) => void;
  updateMatch: (id: string, updates: Partial<IMatch>) => void;
  clearCurrentMatch: () => void;
}

export const useMatchStore = create<MatchState>()(
  immer((set) => ({
    matches: new Map(),
    currentMatch: null,
    
    setMatch: (match) =>
      set((state) => {
        state.matches.set(match.id, match);
        state.currentMatch = match;
      }),
      
    updateMatch: (id, updates) =>
      set((state) => {
        const match = state.matches.get(id);
        if (match) {
          state.matches.set(id, { ...match, ...updates });
          if (state.currentMatch?.id === id) {
            state.currentMatch = { ...match, ...updates };
          }
        }
      }),
      
    clearCurrentMatch: () =>
      set((state) => {
        state.currentMatch = null;
      }),
  }))
);
```

### Local State First

```typescript
// ❌ BAD - Global state for local concerns
const useGlobalStore = create((set) => ({
  buttonColor: 'blue',
  setButtonColor: (color) => set({ buttonColor: color }),
}));

// ✅ GOOD - Local state for local concerns
function Button() {
  const [color, setColor] = useState('blue');
  return <button style={{ color }}>{children}</button>;
}

// ✅ GOOD - Global state for global concerns
const useAuthStore = create((set) => ({
  user: null,
  login: async (credentials) => {
    const user = await authService.login(credentials);
    set({ user });
  },
}));
```

---

## Variable Declaration Standards

```typescript
// ❌ BAD
var count = 0;                    // Never use 'var'
let data = getData();             // Use 'const' unless reassignment needed

// ✅ GOOD
const count = 0;                  // Use 'const' by default
let counter = 0;                  // Use 'let' only when reassigning

// ❌ BAD - Multiple declarations
const a = 1, b = 2, c = 3;

// ✅ GOOD - One declaration per line
const a = 1;
const b = 2;
const c = 3;

// ❌ BAD - Implicit any
const data = JSON.parse(str);

// ✅ GOOD - Explicit type
const data: IUser = JSON.parse(str);

// ✅ GOOD - Type assertion with validation
const data = JSON.parse(str);
if (!isUser(data)) {
  throw new Error('Invalid user data');
}
// data is now IUser
```

---

## Function Standards

### Pure Functions

```typescript
// ❌ BAD - Mutates input
function addItem(array: string[], item: string) {
  array.push(item);
  return array;
}

// ✅ GOOD - Pure function
function addItem(array: readonly string[], item: string): string[] {
  return [...array, item];
}

// ❌ BAD - Side effects
let total = 0;
function calculate(value: number) {
  total += value;
  return total;
}

// ✅ GOOD - Pure function
function calculate(current: number, value: number): number {
  return current + value;
}
```

### Function Declarations

```typescript
// ❌ BAD - No return type
function getData(id: string) {
  return fetch(`/api/${id}`);
}

// ✅ GOOD - Explicit return type
async function getData(id: string): Promise<Data> {
  const response = await fetch(`/api/${id}`);
  return response.json();
}

// ✅ GOOD - Arrow function for simple operations
const add = (a: number, b: number): number => a + b;

// ✅ GOOD - Named function for complex operations
async function processUserData(userId: string): Promise<ProcessedData> {
  const user = await getUser(userId);
  const stats = await getStats(userId);
  return processData(user, stats);
}
```

---

## Import/Export Standards

```typescript
// ❌ BAD - Default exports
export default function UserService() {}
export default UserRepository;

// ✅ GOOD - Named exports
export function UserService() {}
export class UserRepository {}

// ❌ BAD - Import *
import * as utils from './utils';

// ✅ GOOD - Explicit imports
import { formatDate, formatNumber } from './utils';

// ✅ GOOD - Barrel exports
// index.ts
export { Button } from './Button';
export { Input } from './Input';
export type { ButtonProps, InputProps } from './types';

// ❌ BAD - Circular dependencies
// a.ts
import { B } from './b';
export class A { b: B; }

// b.ts
import { A } from './a';
export class B { a: A; }

// ✅ GOOD - Break circular dependencies
// types.ts
export interface IA {}
export interface IB {}

// a.ts
import { IB } from './types';
export class A { b: IB; }

// b.ts
import { IA } from './types';
export class B { a: IA; }
```

---

## ESLint Configuration

**File: `.eslintrc.js` (root)**

```javascript
module.exports = {
  root: true,
  extends: [
    'eslint:recommended',
    'plugin:@typescript-eslint/recommended',
    'plugin:@typescript-eslint/recommended-requiring-type-checking',
    'plugin:react/recommended',
    'plugin:react-hooks/recommended',
    'plugin:jsx-a11y/recommended',
    'next/core-web-vitals',
    'prettier',
  ],
  parser: '@typescript-eslint/parser',
  parserOptions: {
    ecmaVersion: 2022,
    sourceType: 'module',
    project: ['./tsconfig.json', './packages/*/tsconfig.json'],
  },
  plugins: ['@typescript-eslint', 'react', 'react-hooks', 'jsx-a11y'],
  rules: {
    // TypeScript
    '@typescript-eslint/no-explicit-any': 'error',
    '@typescript-eslint/explicit-function-return-type': 'warn',
    '@typescript-eslint/explicit-module-boundary-types': 'warn',
    '@typescript-eslint/no-unused-vars': ['error', {
      argsIgnorePattern: '^_',
      varsIgnorePattern: '^_',
    }],
    '@typescript-eslint/no-floating-promises': 'error',
    '@typescript-eslint/await-thenable': 'error',
    '@typescript-eslint/no-misused-promises': 'error',
    
    // React
    'react/react-in-jsx-scope': 'off', // Not needed in Next.js
    'react/prop-types': 'off', // TypeScript handles this
    'react-hooks/rules-of-hooks': 'error',
    'react-hooks/exhaustive-deps': 'warn',
    
    // General
    'no-console': ['warn', { allow: ['warn', 'error'] }],
    'prefer-const': 'error',
    'no-var': 'error',
    'eqeqeq': ['error', 'always'],
    'curly': ['error', 'all'],
    
    // Naming conventions
    '@typescript-eslint/naming-convention': [
      'error',
      {
        selector: 'variable',
        format: ['camelCase', 'UPPER_CASE'],
      },
      {
        selector: 'function',
        format: ['camelCase'],
      },
      {
        selector: 'typeLike',
        format: ['PascalCase'],
      },
      {
        selector: 'interface',
        format: ['PascalCase'],
        prefix: ['I'],
      },
    ],
  },
  settings: {
    react: {
      version: 'detect',
    },
  },
};
```

---

## Prettier Configuration

**File: `.prettierrc` (root)**

```json
{
  "semi": true,
  "trailingComma": "es5",
  "singleQuote": true,
  "printWidth": 100,
  "tabWidth": 2,
  "useTabs": false,
  "arrowParens": "always",
  "endOfLine": "lf",
  "bracketSpacing": true,
  "jsxSingleQuote": false,
  "quoteProps": "as-needed"
}
```

---

## Commit Standards

### Conventional Commits

```bash
# Format: <type>(<scope>): <subject>

✅ GOOD:
feat(auth): add magic link authentication
fix(match): resolve round scoring calculation
docs(api): update authentication endpoints
refactor(repository): extract user repository interface
test(match): add game logic unit tests
chore(deps): update dependencies

❌ BAD:
fixed bug
update
changes
wip
```

---

## Documentation Standards

```typescript
/**
 * Authenticates a user with email and password
 * 
 * @param credentials - User login credentials
 * @returns Authentication response with tokens
 * @throws {AppError} If credentials are invalid
 * 
 * @example
 * ```typescript
 * const response = await login({
 *   email: 'user@example.com',
 *   password: 'SecurePass123'
 * });
 * ```
 */
async function login(credentials: ILoginDto): Promise<IAuthResponseDto> {
  // Implementation
}
```

---

## Performance Guidelines

### React Performance

```typescript
// ✅ GOOD - Memoize expensive computations
const expensiveValue = useMemo(() => {
  return computeExpensiveValue(data);
}, [data]);

// ✅ GOOD - Memoize callbacks
const handleClick = useCallback(() => {
  doSomething(value);
}, [value]);

// ✅ GOOD - Use React.memo for expensive components
export const ExpensiveComponent = React.memo(function ExpensiveComponent({ data }) {
  // Expensive rendering logic
});
```

### Database Performance

```typescript
// ❌ BAD - N+1 query problem
const users = await prisma.user.findMany();
for (const user of users) {
  const stats = await prisma.playerStatistics.findMany({
    where: { playerId: user.id }
  });
}

// ✅ GOOD - Use includes/select
const users = await prisma.user.findMany({
  include: {
    playerStatistics: true,
  },
});

// ✅ GOOD - Use pagination
const users = await prisma.user.findMany({
  take: 20,
  skip: (page - 1) * 20,
});
```

---

## Security Guidelines

```typescript
// ✅ GOOD - Input validation
import { z } from 'zod';

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
});

// Validate before use
const data = loginSchema.parse(req.body);

// ✅ GOOD - SQL injection prevention (Prisma handles this)
const user = await prisma.user.findUnique({
  where: { email: data.email }
});

// ✅ GOOD - XSS prevention
import DOMPurify from 'isomorphic-dompurify';

const clean = DOMPurify.sanitize(dirtyInput);

// ✅ GOOD - Password hashing
import bcrypt from 'bcrypt';

const hashedPassword = await bcrypt.hash(password, 12);
```

---

## Checklist for Every PR

- [ ] TypeScript strict mode passes
- [ ] ESLint passes with no warnings
- [ ] Prettier formatting applied
- [ ] All tests pass (100% coverage)
- [ ] No `any` types used
- [ ] All functions have return types
- [ ] All async functions properly handled
- [ ] Event-based communication used where appropriate
- [ ] useEffect used minimally
- [ ] Pure functions used where possible
- [ ] Naming conventions followed
- [ ] Documentation added
- [ ] Performance considered
- [ ] Security reviewed
- [ ] Conventional commits used

---

**These standards are MANDATORY. Code that doesn't follow these standards will be rejected.**

---

END OF DOCUMENT

