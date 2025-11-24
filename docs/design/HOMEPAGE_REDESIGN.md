# Homepage Redesign - Design Specification

## 🎯 Design Goal

Create an intuitive, action-focused landing page that immediately allows users to start playing or creating tournaments, with minimal friction.

## 📐 Layout Structure

### Visual Hierarchy (Top to Bottom)

```
┌─────────────────────────────────────────┐
│                                         │
│         [Logo/Brand Name]               │
│         RPSFull                         │
│                                         │
│    [Tagline/Value Proposition]          │
│    "Play. Compete. Win."                │
│                                         │
│  ┌───────────────────────────────┐     │
│  │                               │     │
│  │    🎮 START A GAME            │     │
│  │                               │     │
│  │    Challenge a player         │     │
│  │    Quick match                │     │
│  │                               │     │
│  └───────────────────────────────┘     │
│                                         │
│  ┌───────────────────────────────┐     │
│  │                               │     │
│  │    🏆 START A TOURNAMENT      │     │
│  │                               │     │
│  │    Create or join             │     │
│  │    Competitive bracket        │     │
│  │                               │     │
│  └───────────────────────────────┘     │
│                                         │
│         [Secondary Actions]             │
│    ┌──────────┐    ┌──────────┐        │
│    │  Login   │    │ Register │        │
│    └──────────┘    └──────────┘        │
│                                         │
└─────────────────────────────────────────┘
```

## 🎨 Design Specifications

### 1. Header Section
- **Logo/Brand**: "RPSFull" - Large, bold, centered
- **Tagline**: "Play. Compete. Win." - Medium size, centered
- **Spacing**: Generous padding (py-16 to py-24)

### 2. Primary Action Buttons

#### "Start a Game" Button
- **Size**: Large, prominent (min-height: 120px, full width on mobile, max-width: 400px on desktop)
- **Style**: 
  - Primary color (blue gradient)
  - Large icon: 🎮 or game controller icon
  - Bold text: "START A GAME"
  - Subtitle: "Challenge a player • Quick match"
- **Hover**: Scale effect, shadow elevation
- **Click Action**: Navigate to `/play` or show quick match modal

#### "Start a Tournament" Button
- **Size**: Same as "Start a Game" button
- **Style**:
  - Secondary color (purple gradient)
  - Large icon: 🏆 or trophy icon
  - Bold text: "START A TOURNAMENT"
  - Subtitle: "Create or join • Competitive bracket"
- **Hover**: Scale effect, shadow elevation
- **Click Action**: Navigate to `/tournaments/create` or show tournament options

### 3. Button Layout
- **Mobile**: Stacked vertically, full width, with spacing
- **Desktop**: Side-by-side, centered, max-width container
- **Spacing**: 24px gap between buttons

### 4. Secondary Actions (Bottom)
- **Login Link**: Text link, subtle styling
- **Register Link**: Text link, subtle styling
- **Layout**: Centered, horizontal, with separator (|)
- **Position**: Bottom of page or below primary buttons

## 🎨 Visual Design

### Color Scheme
- **Primary Button**: Blue gradient (primary-500 to primary-600)
- **Secondary Button**: Purple gradient (secondary-500 to secondary-600)
- **Background**: Light gradient (primary-50 to secondary-50)
- **Text**: Dark gray for readability

### Typography
- **Brand Name**: 4xl to 6xl, bold, primary-700
- **Tagline**: xl to 2xl, medium weight, gray-700
- **Button Text**: 2xl, bold, white
- **Button Subtitle**: base, medium weight, white/90% opacity
- **Links**: base, underline on hover

### Spacing & Layout
- **Container**: max-width: 1200px, centered, padding: 16px
- **Vertical Spacing**: 
  - Top padding: 64px (mobile) to 96px (desktop)
  - Between sections: 48px
  - Bottom padding: 32px

### Interactive Elements
- **Button Hover**: 
  - Scale: 1.02
  - Shadow: elevation increase
  - Transition: 200ms ease
- **Button Active**: 
  - Scale: 0.98
  - Slight press effect

## 📱 Responsive Design

### Mobile (< 640px)
- Full-width buttons
- Stacked layout
- Larger touch targets (min 48px height)
- Reduced padding (py-12)

### Tablet (640px - 1024px)
- Buttons side-by-side
- Max-width: 600px per button
- Medium padding (py-16)

### Desktop (> 1024px)
- Buttons side-by-side
- Max-width: 400px per button
- Generous padding (py-24)
- Centered layout

## 🎯 User Flow

### Unauthenticated User
1. Lands on homepage
2. Sees two large action buttons
3. Clicks "Start a Game" → Redirected to login/register
4. Clicks "Start a Tournament" → Redirected to login/register
5. Can also use bottom links to login/register first

### Authenticated User
1. Lands on homepage
2. Sees two large action buttons
3. Clicks "Start a Game" → Navigate to `/play` (match creation)
4. Clicks "Start a Tournament" → Navigate to `/tournaments/create`
5. Can also access dashboard via navigation

## 🔄 Alternative Layout (Option B)

### Card-Based Design
```
┌─────────────────────────────────────────┐
│         [Logo] RPSFull                  │
│         "Play. Compete. Win."            │
│                                         │
│  ┌──────────────┐  ┌──────────────┐    │
│  │              │  │              │    │
│  │   🎮         │  │   🏆         │    │
│  │              │  │              │    │
│  │ START A GAME │  │START TOURNAMENT│  │
│  │              │  │              │    │
│  │ Quick match  │  │ Create/Join  │    │
│  │              │  │              │    │
│  └──────────────┘  └──────────────┘    │
│                                         │
│         Login | Register                │
└─────────────────────────────────────────┘
```

## ✅ Design Principles Applied

1. **Clarity**: Clear, unambiguous actions
2. **Hierarchy**: Primary actions are most prominent
3. **Accessibility**: Large touch targets, high contrast
4. **Simplicity**: Minimal distractions, focus on actions
5. **Mobile-First**: Touch-friendly, responsive design

## 🎨 Component Structure

```tsx
<HomePage>
  <Header>
    <Logo>RPSFull</Logo>
    <Tagline>Play. Compete. Win.</Tagline>
  </Header>
  
  <PrimaryActions>
    <ActionButton 
      icon="🎮"
      title="START A GAME"
      subtitle="Challenge a player • Quick match"
      href="/play"
      variant="primary"
    />
    <ActionButton 
      icon="🏆"
      title="START A TOURNAMENT"
      subtitle="Create or join • Competitive bracket"
      href="/tournaments/create"
      variant="secondary"
    />
  </PrimaryActions>
  
  <SecondaryActions>
    <Link href="/login">Login</Link>
    <Separator>|</Separator>
    <Link href="/register">Register</Link>
  </SecondaryActions>
</HomePage>
```

## 📝 Implementation Notes

1. **Icons**: Use Lucide React icons (Gamepad2, Trophy)
2. **Gradients**: Use Tailwind gradient utilities
3. **Animations**: Framer Motion for button interactions
4. **Routing**: Next.js Link components for navigation
5. **Auth Check**: Conditional rendering based on auth state

---

**Next Step**: Review and approve design, then implement.

