# SVG Icons & Visual Assets Specification
## RPSFull Tournament Platform

**Document Version:** 1.1  
**Last Updated:** November 22, 2025  
**Status:** Draft  
**Repository:** https://github.com/YOLOVibeCode/rpsfull.git  

---

## 1. Icon System Overview

### 1.1 Icon Libraries Stack

**Primary UI Icons:**
- **Lucide React**: Main icon library (1000+ icons)
- **Custom SVGs**: Game symbols (Rock, Paper, Scissors)
- **Framer Motion**: SVG animations
- **SVGO**: SVG optimization

**Package Installation:**
```bash
pnpm add lucide-react framer-motion
pnpm add -D svgo
```

### 1.2 Icon Categories

1. **Game Symbols**: Rock, Paper, Scissors (custom animated)
2. **UI Icons**: Navigation, actions, status (Lucide)
3. **Achievement Badges**: Custom illustrated SVGs
4. **Status Icons**: Win, loss, tie indicators
5. **Brand Icons**: Logo, wordmark

---

## 2. Game Symbol SVGs (Rock, Paper, Scissors)

### 2.1 Design Principles

- **Style**: Modern, playful, with personality
- **Size**: Scalable (works from 24px to 200px)
- **Animation**: Subtle hover/active states
- **Color**: Supports theming (currentColor)
- **Weight**: Bold, clear silhouettes

### 2.2 Rock Icon Component

**File:** `src/components/icons/game/RockIcon.tsx`

```typescript
import { motion, MotionProps } from 'framer-motion';

interface GameIconProps {
  className?: string;
  size?: number;
  animate?: boolean;
  selected?: boolean;
}

export const RockIcon = ({ 
  className = '', 
  size = 64, 
  animate = false,
  selected = false 
}: GameIconProps) => {
  return (
    <motion.svg
      width={size}
      height={size}
      viewBox="0 0 100 100"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      initial={{ scale: 1 }}
      whileHover={animate ? { scale: 1.1, rotate: -5 } : {}}
      whileTap={{ scale: 0.95 }}
      animate={selected ? { 
        scale: [1, 1.2, 1],
        transition: { duration: 0.3 }
      } : {}}
    >
      {/* Fist/Rock Shape */}
      <motion.g
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        {/* Base fist */}
        <path
          d="M30 45 C30 38, 35 33, 42 33 L42 25 C42 20, 45 17, 50 17 C55 17, 58 20, 58 25 L58 33 C65 33, 70 38, 70 45 L70 65 C70 72, 65 77, 58 77 L42 77 C35 77, 30 72, 30 65 Z"
          fill="currentColor"
          className="text-slate-700 dark:text-slate-300"
        />
        
        {/* Thumb */}
        <path
          d="M30 50 C25 50, 22 53, 22 57 C22 61, 25 64, 30 64 L30 50 Z"
          fill="currentColor"
          className="text-slate-600 dark:text-slate-400"
        />
        
        {/* Knuckle highlights */}
        <circle cx="45" cy="40" r="3" fill="white" opacity="0.3" />
        <circle cx="55" cy="40" r="3" fill="white" opacity="0.3" />
        
        {/* Shadow */}
        <ellipse 
          cx="50" 
          cy="82" 
          rx="20" 
          ry="4" 
          fill="black" 
          opacity="0.2" 
        />
      </motion.g>
      
      {/* Selection glow */}
      {selected && (
        <motion.circle
          cx="50"
          cy="50"
          r="45"
          stroke="currentColor"
          strokeWidth="3"
          fill="none"
          className="text-blue-500"
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: [0, 1, 0], scale: [0.8, 1.2, 1.4] }}
          transition={{ duration: 0.6, repeat: Infinity }}
        />
      )}
    </motion.svg>
  );
};
```

### 2.3 Paper Icon Component

**File:** `src/components/icons/game/PaperIcon.tsx`

```typescript
export const PaperIcon = ({ 
  className = '', 
  size = 64, 
  animate = false,
  selected = false 
}: GameIconProps) => {
  return (
    <motion.svg
      width={size}
      height={size}
      viewBox="0 0 100 100"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      initial={{ scale: 1 }}
      whileHover={animate ? { scale: 1.1, y: -5 } : {}}
      whileTap={{ scale: 0.95 }}
    >
      {/* Open hand/paper shape */}
      <motion.g
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        {/* Palm */}
        <path
          d="M35 55 L35 80 C35 85, 38 88, 43 88 L57 88 C62 88, 65 85, 65 80 L65 55 Z"
          fill="currentColor"
          className="text-amber-600 dark:text-amber-400"
        />
        
        {/* Fingers */}
        <path
          d="M30 15 C30 12, 32 10, 35 10 C38 10, 40 12, 40 15 L40 55 L30 55 Z"
          fill="currentColor"
          className="text-amber-700 dark:text-amber-500"
        />
        <path
          d="M40 12 C40 9, 42 7, 45 7 C48 7, 50 9, 50 12 L50 55 L40 55 Z"
          fill="currentColor"
          className="text-amber-700 dark:text-amber-500"
        />
        <path
          d="M50 12 C50 9, 52 7, 55 7 C58 7, 60 9, 60 12 L60 55 L50 55 Z"
          fill="currentColor"
          className="text-amber-700 dark:text-amber-500"
        />
        <path
          d="M60 15 C60 12, 62 10, 65 10 C68 10, 70 12, 70 15 L70 55 L60 55 Z"
          fill="currentColor"
          className="text-amber-700 dark:text-amber-500"
        />
        
        {/* Palm lines for detail */}
        <path
          d="M40 65 Q50 68, 60 65"
          stroke="white"
          strokeWidth="1.5"
          opacity="0.3"
          fill="none"
        />
        
        {/* Shadow */}
        <ellipse 
          cx="50" 
          cy="92" 
          rx="25" 
          ry="4" 
          fill="black" 
          opacity="0.2" 
        />
      </motion.g>
      
      {selected && (
        <motion.rect
          x="25"
          y="5"
          width="50"
          height="88"
          rx="5"
          stroke="currentColor"
          strokeWidth="3"
          fill="none"
          className="text-amber-500"
          initial={{ opacity: 0 }}
          animate={{ opacity: [0, 1, 0] }}
          transition={{ duration: 0.6, repeat: Infinity }}
        />
      )}
    </motion.svg>
  );
};
```

### 2.4 Scissors Icon Component

**File:** `src/components/icons/game/ScissorsIcon.tsx`

```typescript
export const ScissorsIcon = ({ 
  className = '', 
  size = 64, 
  animate = false,
  selected = false 
}: GameIconProps) => {
  return (
    <motion.svg
      width={size}
      height={size}
      viewBox="0 0 100 100"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      initial={{ scale: 1, rotate: 0 }}
      whileHover={animate ? { 
        scale: 1.1, 
        rotate: 10,
      } : {}}
      whileTap={{ scale: 0.95 }}
    >
      {/* Peace sign/scissors shape */}
      <motion.g
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.3 }}
      >
        {/* Finger 1 */}
        <motion.path
          d="M35 75 L30 30 C29 25, 31 20, 35 19 C39 18, 42 21, 43 25 L45 55 L38 75 Z"
          fill="currentColor"
          className="text-red-600 dark:text-red-400"
          animate={animate ? {
            rotate: [-2, 2, -2],
            transition: { duration: 1, repeat: Infinity }
          } : {}}
          style={{ originX: '40%', originY: '50%' }}
        />
        
        {/* Finger 2 */}
        <motion.path
          d="M65 75 L70 30 C71 25, 69 20, 65 19 C61 18, 58 21, 57 25 L55 55 L62 75 Z"
          fill="currentColor"
          className="text-red-600 dark:text-red-400"
          animate={animate ? {
            rotate: [2, -2, 2],
            transition: { duration: 1, repeat: Infinity }
          } : {}}
          style={{ originX: '60%', originY: '50%' }}
        />
        
        {/* Palm/base */}
        <path
          d="M38 75 L38 85 C38 88, 40 90, 43 90 L57 90 C60 90, 62 88, 62 85 L62 75 Z"
          fill="currentColor"
          className="text-red-700 dark:text-red-500"
        />
        
        {/* Knuckle details */}
        <circle cx="40" cy="60" r="3" fill="white" opacity="0.3" />
        <circle cx="60" cy="60" r="3" fill="white" opacity="0.3" />
        
        {/* Shadow */}
        <ellipse 
          cx="50" 
          cy="94" 
          rx="20" 
          ry="3" 
          fill="black" 
          opacity="0.2" 
        />
      </motion.g>
      
      {selected && (
        <motion.path
          d="M30 20 L35 70 M70 20 L65 70"
          stroke="currentColor"
          strokeWidth="4"
          strokeLinecap="round"
          className="text-red-500"
          initial={{ pathLength: 0 }}
          animate={{ pathLength: 1 }}
          transition={{ duration: 0.5 }}
        />
      )}
    </motion.svg>
  );
};
```

---

## 3. Icon Wrapper Component

**File:** `src/components/icons/GameSymbol.tsx`

```typescript
import { RockIcon } from './game/RockIcon';
import { PaperIcon } from './game/PaperIcon';
import { ScissorsIcon } from './game/ScissorsIcon';

type SymbolType = 'rock' | 'paper' | 'scissors';

interface GameSymbolProps {
  symbol: SymbolType;
  size?: number;
  className?: string;
  animate?: boolean;
  selected?: boolean;
}

export const GameSymbol = ({ 
  symbol, 
  size = 64, 
  className = '',
  animate = false,
  selected = false 
}: GameSymbolProps) => {
  const icons = {
    rock: RockIcon,
    paper: PaperIcon,
    scissors: ScissorsIcon,
  };
  
  const Icon = icons[symbol];
  
  return (
    <Icon 
      size={size} 
      className={className}
      animate={animate}
      selected={selected}
    />
  );
};

// Usage:
// <GameSymbol symbol="rock" size={80} animate selected />
```

---

## 4. UI Icons (Lucide React)

### 4.1 Common UI Icons

**File:** `src/components/icons/ui/index.ts`

```typescript
// Export commonly used icons with consistent names
export {
  Trophy as TrophyIcon,
  User as UserIcon,
  Users as UsersIcon,
  Settings as SettingsIcon,
  LogOut as LogOutIcon,
  Menu as MenuIcon,
  X as CloseIcon,
  ChevronRight,
  ChevronLeft,
  ChevronDown,
  Search as SearchIcon,
  Filter as FilterIcon,
  Calendar as CalendarIcon,
  Clock as ClockIcon,
  Zap as BoltIcon,
  Star as StarIcon,
  Award as AwardIcon,
  Target as TargetIcon,
  TrendingUp,
  Activity as ActivityIcon,
  BarChart3 as ChartIcon,
  Plus as PlusIcon,
  Edit as EditIcon,
  Trash2 as DeleteIcon,
  Eye as ViewIcon,
  Play as PlayIcon,
  Pause as PauseIcon,
  Check as CheckIcon,
  AlertCircle,
  Info,
  Crown as CrownIcon,
  Flame as FireIcon,
  Sparkles as SparklesIcon,
} from 'lucide-react';
```

### 4.2 Icon Usage Examples

```typescript
// In components
import { TrophyIcon, UserIcon, PlayIcon } from '@/components/icons/ui';

// Basic usage
<TrophyIcon className="w-6 h-6 text-yellow-500" />

// With Framer Motion
<motion.div
  whileHover={{ scale: 1.1 }}
  whileTap={{ scale: 0.9 }}
>
  <PlayIcon className="w-8 h-8 text-blue-500" />
</motion.div>

// Responsive sizes
<TrophyIcon className="w-4 h-4 sm:w-6 sm:h-6 lg:w-8 lg:8" />
```

---

## 5. Achievement Badge SVGs

### 5.1 Badge Component System

**File:** `src/components/icons/badges/Badge.tsx`

```typescript
import { motion } from 'framer-motion';

interface BadgeProps {
  type: 'common' | 'rare' | 'epic' | 'legendary';
  icon: React.ReactNode;
  size?: number;
  glow?: boolean;
}

export const AchievementBadge = ({ 
  type, 
  icon, 
  size = 64,
  glow = true 
}: BadgeProps) => {
  const colors = {
    common: 'text-gray-400',
    rare: 'text-blue-500',
    epic: 'text-purple-500',
    legendary: 'text-yellow-500',
  };
  
  const glowColors = {
    common: '#9CA3AF',
    rare: '#3B82F6',
    epic: '#A855F7',
    legendary: '#EAB308',
  };
  
  return (
    <motion.div
      className="relative inline-flex items-center justify-center"
      whileHover={{ scale: 1.1, rotate: 5 }}
      whileTap={{ scale: 0.95 }}
    >
      {/* Glow effect */}
      {glow && (
        <motion.div
          className="absolute inset-0 rounded-full blur-xl"
          style={{ backgroundColor: glowColors[type] }}
          animate={{
            opacity: [0.3, 0.6, 0.3],
            scale: [1, 1.1, 1],
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
          }}
        />
      )}
      
      {/* Badge background */}
      <svg
        width={size}
        height={size}
        viewBox="0 0 100 100"
        className={colors[type]}
      >
        {/* Star shape badge */}
        <path
          d="M50 10 L61 38 L90 43 L70 63 L75 92 L50 78 L25 92 L30 63 L10 43 L39 38 Z"
          fill="currentColor"
          stroke="white"
          strokeWidth="2"
        />
        
        {/* Inner circle for icon */}
        <circle
          cx="50"
          cy="50"
          r="25"
          fill="white"
          opacity="0.9"
        />
      </svg>
      
      {/* Icon overlay */}
      <div className="absolute inset-0 flex items-center justify-center">
        {icon}
      </div>
    </motion.div>
  );
};

// Usage:
// <AchievementBadge 
//   type="legendary" 
//   icon={<TrophyIcon className="w-8 h-8 text-yellow-600" />}
// />
```

### 5.2 Specific Achievement Badges

```typescript
// src/components/icons/badges/achievements.tsx
import { TrophyIcon, BoltIcon, CrownIcon, FireIcon } from '@/components/icons/ui';

export const FirstWinBadge = () => (
  <AchievementBadge 
    type="common" 
    icon={<CheckIcon className="w-6 h-6 text-green-600" />}
  />
);

export const WinStreakBadge = () => (
  <AchievementBadge 
    type="rare" 
    icon={<FireIcon className="w-6 h-6 text-orange-600" />}
  />
);

export const ChampionBadge = () => (
  <AchievementBadge 
    type="legendary" 
    icon={<CrownIcon className="w-8 h-8 text-yellow-600" />}
  />
);
```

---

## 6. Animated Status Icons

### 6.1 Win/Loss/Tie Indicators

**File:** `src/components/icons/status/ResultIcon.tsx`

```typescript
import { motion } from 'framer-motion';
import { Check, X, Minus } from 'lucide-react';

type ResultType = 'win' | 'loss' | 'tie';

interface ResultIconProps {
  result: ResultType;
  size?: number;
  animate?: boolean;
}

export const ResultIcon = ({ 
  result, 
  size = 32,
  animate = true 
}: ResultIconProps) => {
  const config = {
    win: {
      Icon: Check,
      color: 'text-green-500',
      bgColor: 'bg-green-100 dark:bg-green-900',
      animation: { scale: [0, 1.2, 1], rotate: [0, 15, 0] }
    },
    loss: {
      Icon: X,
      color: 'text-red-500',
      bgColor: 'bg-red-100 dark:bg-red-900',
      animation: { scale: [0, 1.2, 1], rotate: [0, -15, 0] }
    },
    tie: {
      Icon: Minus,
      color: 'text-yellow-500',
      bgColor: 'bg-yellow-100 dark:bg-yellow-900',
      animation: { scale: [0, 1.1, 1] }
    },
  };
  
  const { Icon, color, bgColor, animation } = config[result];
  
  return (
    <motion.div
      className={`${bgColor} rounded-full p-1 inline-flex`}
      initial={{ scale: 0 }}
      animate={animate ? animation : { scale: 1 }}
      transition={{ duration: 0.3, type: 'spring' }}
    >
      <Icon className={`${color} w-${size/4} h-${size/4}`} />
    </motion.div>
  );
};
```

---

## 7. Logo & Brand Icons

### 7.1 RPSFull Logo

**File:** `src/components/icons/brand/Logo.tsx`

```typescript
export const RPSFullLogo = ({ 
  size = 120, 
  showText = true 
}: { size?: number; showText?: boolean }) => {
  return (
    <motion.svg
      width={size}
      height={size}
      viewBox="0 0 120 120"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.5 }}
    >
      {/* Circular badge */}
      <circle
        cx="60"
        cy="60"
        r="55"
        fill="url(#gradient)"
        stroke="currentColor"
        strokeWidth="3"
        className="text-blue-600"
      />
      
      {/* Gradient definition */}
      <defs>
        <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#3B82F6" />
          <stop offset="100%" stopColor="#1E40AF" />
        </linearGradient>
      </defs>
      
      {/* Three symbols intertwined */}
      <g transform="translate(60, 60)">
        {/* Stylized RPS representation */}
        <path
          d="M-20,-15 L-20,15 L-10,15 L-10,-15 Z"
          fill="white"
          opacity="0.9"
        />
        <circle
          cx="0"
          cy="0"
          r="12"
          fill="white"
          opacity="0.9"
        />
        <path
          d="M10,-10 L25,5 L10,5 Z"
          fill="white"
          opacity="0.9"
        />
      </g>
      
      {/* Brand name (if showText) */}
      {showText && (
        <text
          x="60"
          y="100"
          textAnchor="middle"
          className="text-xs font-bold"
          fill="currentColor"
        >
          RPSFULL
        </text>
      )}
    </motion.svg>
  );
};
```

### 7.2 Wordmark

**File:** `src/components/icons/brand/Wordmark.tsx`

```typescript
export const RPSFullWordmark = ({ className = '' }: { className?: string }) => {
  return (
    <svg
      viewBox="0 0 200 40"
      className={className}
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <text
        x="10"
        y="30"
        className="text-2xl font-bold"
        fill="currentColor"
        fontFamily="Inter, system-ui"
      >
        RPSFull
      </text>
    </svg>
  );
};
```

---

## 8. Icon Optimization

### 8.1 SVG Optimization Configuration

**File:** `svgo.config.js`

```javascript
module.exports = {
  plugins: [
    {
      name: 'preset-default',
      params: {
        overrides: {
          removeViewBox: false,
          cleanupIDs: false,
        },
      },
    },
    'removeDimensions',
    'removeXMLNS',
  ],
};
```

### 8.2 Build-time Optimization

```json
// package.json scripts
{
  "scripts": {
    "optimize-icons": "svgo -f src/components/icons/game -r",
    "build:icons": "npm run optimize-icons && npm run build"
  }
}
```

---

## 9. Icon Documentation Component

**File:** `src/app/design-system/icons/page.tsx`

```typescript
// Internal design system page showing all icons
export default function IconsPage() {
  return (
    <div className="p-8 space-y-8">
      <h1 className="text-3xl font-bold">Icon System</h1>
      
      {/* Game Symbols */}
      <section>
        <h2 className="text-2xl font-semibold mb-4">Game Symbols</h2>
        <div className="flex gap-8">
          <GameSymbol symbol="rock" size={80} animate />
          <GameSymbol symbol="paper" size={80} animate />
          <GameSymbol symbol="scissors" size={80} animate />
        </div>
      </section>
      
      {/* UI Icons */}
      <section>
        <h2 className="text-2xl font-semibold mb-4">UI Icons</h2>
        <div className="grid grid-cols-8 gap-4">
          <TrophyIcon className="w-8 h-8" />
          <UserIcon className="w-8 h-8" />
          <PlayIcon className="w-8 h-8" />
          {/* ... more icons */}
        </div>
      </section>
      
      {/* Achievement Badges */}
      <section>
        <h2 className="text-2xl font-semibold mb-4">Achievement Badges</h2>
        <div className="flex gap-4">
          <FirstWinBadge />
          <WinStreakBadge />
          <ChampionBadge />
        </div>
      </section>
    </div>
  );
}
```

---

## 10. Performance Considerations

### 10.1 Icon Loading Strategy

```typescript
// Lazy load icon components
const HeavyBadgeComponent = dynamic(
  () => import('@/components/icons/badges/ChampionBadge'),
  { ssr: false }
);

// Preload critical icons
<link 
  rel="preload" 
  href="/icons/rock.svg" 
  as="image" 
  type="image/svg+xml" 
/>
```

### 10.2 Icon Sprite System (Optional)

```typescript
// For many small icons, use sprite sheet
export const IconSprite = () => (
  <svg style={{ display: 'none' }}>
    <defs>
      <symbol id="icon-rock" viewBox="0 0 100 100">
        {/* Rock icon paths */}
      </symbol>
      <symbol id="icon-paper" viewBox="0 0 100 100">
        {/* Paper icon paths */}
      </symbol>
    </defs>
  </svg>
);

// Usage
<svg className="w-8 h-8">
  <use href="#icon-rock" />
</svg>
```

---

## 11. Accessibility

### 11.1 Icon Accessibility

```typescript
// Always include aria-label or aria-hidden
<GameSymbol 
  symbol="rock" 
  aria-label="Rock symbol"
  role="img"
/>

// For decorative icons
<TrophyIcon aria-hidden="true" />

// With text alternative
<button>
  <PlayIcon aria-hidden="true" />
  <span>Start Match</span>
</button>
```

---

## 12. Package Dependencies

```json
{
  "dependencies": {
    "lucide-react": "^0.294.0",
    "framer-motion": "^10.16.0"
  },
  "devDependencies": {
    "svgo": "^3.0.0",
    "@svgr/webpack": "^8.1.0"
  }
}
```

---

## 13. Icon Asset Export

### 13.1 Export Formats

For external designers:
- **Source**: Adobe Illustrator (.ai) or Figma
- **Export**: SVG (optimized)
- **Specs**: 100x100 viewBox, clean paths, no transforms

### 13.2 File Naming Convention

```
rock-icon.svg
paper-icon.svg
scissors-icon.svg
badge-common.svg
badge-rare.svg
badge-epic.svg
badge-legendary.svg
logo-full.svg
logo-icon.svg
wordmark.svg
```

---

**Document Approval:**
- [ ] UI/UX Designer
- [ ] Brand Designer
- [ ] Frontend Lead
- [ ] Accessibility Specialist

---

END OF DOCUMENT

