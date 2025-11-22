# UI/UX Design Specification
## RPSFull Tournament Platform

**Document Version:** 1.1  
**Last Updated:** November 22, 2025  
**Status:** Draft  
**Repository:** https://github.com/YOLOVibeCode/rpsfull.git  

---

## 1. Design Philosophy

### 1.1 Core Principles
1. **Mobile-First**: Design for mobile screens first, then scale up
2. **Simplicity**: Clear, intuitive interface with minimal learning curve
3. **Delight**: Engaging animations and feedback
4. **Accessibility**: WCAG 2.1 AA compliance
5. **Performance**: Fast, responsive, smooth interactions

### 1.2 Design Goals
- Easy to use for first-time players
- Quick access to core actions (Play, Stats, Tournaments)
- Clear visual feedback for all actions
- Engaging without being overwhelming
- Consistent experience across devices

---

## 2. Visual Design System

### 2.1 Color Palette

**Primary Colors:**
```
Primary Blue:    #3B82F6  // Main brand color
Primary Dark:    #1E40AF  // Hover states
Primary Light:   #93C5FD  // Backgrounds
```

**Secondary Colors:**
```
Success Green:   #10B981  // Wins, positive actions
Warning Yellow:  #F59E0B  // Warnings, cautions
Error Red:       #EF4444  // Losses, errors
Neutral Gray:    #6B7280  // Text, borders
```

**Semantic Colors:**
```
Win:    #10B981  // Celebration, confetti
Loss:   #EF4444  // Explosion, defeat
Tie:    #F59E0B  // Neutral outcome
```

**Background Colors:**
```
BG Primary:   #FFFFFF  // Light mode
BG Secondary: #F9FAFB  // Cards, sections
BG Tertiary:  #F3F4F6  // Subtle backgrounds

BG Dark Primary:   #111827  // Dark mode
BG Dark Secondary: #1F2937  // Dark mode cards
BG Dark Tertiary:  #374151  // Dark mode sections
```

### 2.2 Typography

**Font Family:**
```css
Primary: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif
Monospace: 'JetBrains Mono', monospace (for stats, numbers)
```

**Font Sizes:**
```css
text-xs:   0.75rem   // 12px - Small labels
text-sm:   0.875rem  // 14px - Body text
text-base: 1rem      // 16px - Default
text-lg:   1.125rem  // 18px - Subtitles
text-xl:   1.25rem   // 20px - Section titles
text-2xl:  1.5rem    // 24px - Page titles
text-3xl:  1.875rem  // 30px - Hero text
text-4xl:  2.25rem   // 36px - Large displays
```

**Font Weights:**
```css
Regular:  400
Medium:   500
Semibold: 600
Bold:     700
```

### 2.3 Spacing Scale

```css
space-1:  0.25rem   // 4px
space-2:  0.5rem    // 8px
space-3:  0.75rem   // 12px
space-4:  1rem      // 16px
space-5:  1.25rem   // 20px
space-6:  1.5rem    // 24px
space-8:  2rem      // 32px
space-10: 2.5rem    // 40px
space-12: 3rem      // 48px
space-16: 4rem      // 64px
```

### 2.4 Border Radius

```css
rounded-sm:   0.125rem  // 2px - Subtle
rounded:      0.25rem   // 4px - Default
rounded-md:   0.375rem  // 6px - Cards
rounded-lg:   0.5rem    // 8px - Buttons
rounded-xl:   0.75rem   // 12px - Large cards
rounded-2xl:  1rem      // 16px - Modals
rounded-full: 9999px    // Circles, pills
```

### 2.5 Shadows

```css
shadow-sm:  0 1px 2px rgba(0,0,0,0.05)
shadow:     0 1px 3px rgba(0,0,0,0.1)
shadow-md:  0 4px 6px rgba(0,0,0,0.1)
shadow-lg:  0 10px 15px rgba(0,0,0,0.1)
shadow-xl:  0 20px 25px rgba(0,0,0,0.1)
```

---

## 3. Component Library

### 3.1 Buttons

**Primary Button:**
```
Style:
- Background: Primary Blue (#3B82F6)
- Text: White
- Padding: 12px 24px
- Border Radius: 8px
- Font Weight: 600
- Hover: Primary Dark (#1E40AF)
- Active: Scale 0.95
- Disabled: Opacity 0.5

Usage: Main actions (Play, Create Tournament, Submit)
```

**Secondary Button:**
```
Style:
- Background: Transparent
- Border: 2px solid Primary Blue
- Text: Primary Blue
- Padding: 12px 24px
- Border Radius: 8px
- Hover: Background Primary Light

Usage: Secondary actions (Cancel, View Details)
```

**Ghost Button:**
```
Style:
- Background: Transparent
- No border
- Text: Neutral Gray
- Padding: 8px 16px
- Hover: Background BG Secondary

Usage: Tertiary actions (Edit, Delete)
```

**Icon Button:**
```
Style:
- Square or circular
- Size: 40x40px
- Icon centered
- Hover: Background change

Usage: Navigation, quick actions
```

### 3.2 Input Fields

**Text Input:**
```
Style:
- Height: 48px (mobile), 40px (desktop)
- Padding: 12px 16px
- Border: 1px solid #E5E7EB
- Border Radius: 8px
- Focus: Border Primary Blue, Ring effect
- Error: Border Error Red, Error message below

States: Default, Focus, Error, Disabled
```

**Select Dropdown:**
```
Style:
- Similar to text input
- Chevron icon on right
- Dropdown menu with shadow-lg
- Options highlight on hover

States: Default, Open, Selected
```

**Checkbox/Radio:**
```
Style:
- Size: 20x20px
- Border: 2px solid
- Checked: Primary Blue background with checkmark
- Focus: Ring effect

Usage: Settings, preferences, selections
```

### 3.3 Cards

**Standard Card:**
```
Style:
- Background: White (light) / BG Dark Secondary (dark)
- Padding: 24px
- Border Radius: 12px
- Shadow: shadow-md
- Hover: shadow-lg, slight scale

Usage: Match history, player profiles, tournaments
```

**Stat Card:**
```
Style:
- Compact design
- Large number/value
- Small label below
- Icon on left
- Colorful accent

Usage: Statistics dashboard
```

**Player Card:**
```
Style:
- Avatar on left
- Name and level
- Stats below
- Action buttons on right

Usage: Player lists, leaderboards
```

### 3.4 Modals

**Standard Modal:**
```
Structure:
- Overlay: rgba(0,0,0,0.5)
- Modal: Center screen, max-width 500px
- Header: Title + Close button
- Body: Content with padding
- Footer: Action buttons (right-aligned)
- Border Radius: 16px
- Shadow: shadow-xl

Animation:
- Fade in overlay
- Scale up modal from 0.95 to 1
- Duration: 200ms
```

### 3.5 Navigation

**Bottom Tab Bar (Mobile):**
```
Position: Fixed bottom
Height: 64px
Items: 4-5 items max
Active State: Primary color, filled icon
Inactive State: Gray, outline icon

Items:
- Home
- Play
- Tournaments
- Stats
- Profile
```

**Top Navigation Bar:**
```
Position: Fixed top
Height: 64px
Left: Logo/Title
Right: User menu, notifications
Shadow: shadow-sm

Mobile: Hamburger menu
Desktop: Full menu items
```

### 3.6 Lists

**Match History List:**
```
Item Structure:
- Avatar + opponent name
- Match result (Win/Loss badge)
- Score
- Date/time
- Chevron right

Dividers between items
Infinite scroll or pagination
```

**Leaderboard List:**
```
Item Structure:
- Rank number (large)
- Avatar
- Player name
- Stats (matches, win rate)
- Points/level

Top 3 highlighted with colors:
- 1st: Gold accent
- 2nd: Silver accent
- 3rd: Bronze accent
```

---

## 4. Screen Designs

### 4.1 Home Screen

**Layout:**
```
┌─────────────────────────────────────┐
│  Header: Logo + Notifications       │
├─────────────────────────────────────┤
│                                     │
│  Large "PLAY" Button (Prominent)    │
│  Subtitle: "Find a quick match"     │
│                                     │
├─────────────────────────────────────┤
│  Quick Stats Card:                  │
│  - Level, Wins, Win Rate           │
│  - Current Streak                   │
├─────────────────────────────────────┤
│  Active Tournaments (Carousel)      │
│  - Card 1  Card 2  Card 3          │
├─────────────────────────────────────┤
│  Recent Matches (List)              │
│  - Match 1                          │
│  - Match 2                          │
│  - Match 3                          │
│  View All →                         │
│                                     │
└─────────────────────────────────────┘
│  Bottom Nav: Home Play Tour Stats   │
└─────────────────────────────────────┘
```

**Key Features:**
- Immediate access to Play button
- At-a-glance stats
- Quick tournament access
- Recent activity visibility

### 4.2 Quick Match Screen

**Match Setup:**
```
┌─────────────────────────────────────┐
│  ← Back    Quick Match               │
├─────────────────────────────────────┤
│                                     │
│  Select Game Type:                  │
│  ○ Classic RPS   ○ RPS-LS          │
│                                     │
│  Match Format:                      │
│  Dropdown: "Best of 3" ▼           │
│                                     │
│  Play Mode:                         │
│  ○ Digital   ○ Live Recording      │
│                                     │
│  Find Opponent:                     │
│  Search box or "Random Match"       │
│                                     │
│                                     │
│       [Start Match]                 │
│                                     │
└─────────────────────────────────────┘
```

**Match Lobby (Waiting):**
```
┌─────────────────────────────────────┐
│  ← Leave    Match Lobby              │
├─────────────────────────────────────┤
│                                     │
│     [Your Avatar]                   │
│     Your Name                       │
│     Level 15                        │
│                                     │
│         VS                          │
│                                     │
│     Loading...                      │
│     Waiting for opponent            │
│                                     │
│                                     │
│  Match Details:                     │
│  Classic RPS - Best of 3            │
│                                     │
└─────────────────────────────────────┘
```

**Gameplay Screen:**
```
┌─────────────────────────────────────┐
│  Round History: [🪨-✂️] [📄-🪨]      │
│                                     │
│  Score:  YOU  2 - 1  OPPONENT       │
│                                     │
│  ┌─────────────────────────────┐   │
│  │                             │   │
│  │   Opponent's Screen         │   │
│  │   (Hidden until reveal)     │   │
│  │                             │   │
│  └─────────────────────────────┘   │
│                                     │
│         ROCK, PAPER,                │
│         SCISSORS, SHOOT!            │
│         (Countdown: 2)              │
│                                     │
│  ┌─────────────────────────────┐   │
│  │  Choose Your Move:          │   │
│  │                             │   │
│  │  [🪨]   [📄]   [✂️]         │   │
│  │  Rock   Paper  Scissors     │   │
│  │                             │   │
│  └─────────────────────────────┘   │
│                                     │
└─────────────────────────────────────┘
```

**Result Screen (Win):**
```
┌─────────────────────────────────────┐
│         🎊 CONFETTI FALLING 🎊      │
│                                     │
│            YOU WON!                 │
│                                     │
│  [🪨 Your Rock]                     │
│         defeats                     │
│  [✂️ Opponent's Scissors]          │
│                                     │
│  Score:  YOU  2 - 1  OPPONENT       │
│                                     │
│  (Confetti animation continues)     │
│                                     │
│  Round ends in 3 seconds...         │
│  [Continue]                         │
│                                     │
└─────────────────────────────────────┘
```

**Result Screen (Loss):**
```
┌─────────────────────────────────────┐
│                                     │
│           YOU LOST                  │
│                                     │
│  [💥 Your Rock Explodes 💥]        │
│         defeated by                 │
│  [📄 Opponent's Paper]             │
│                                     │
│  Score:  YOU  1 - 2  OPPONENT       │
│                                     │
│  (Explosion animation)              │
│                                     │
│  Round ends in 3 seconds...         │
│  [Continue]                         │
│                                     │
└─────────────────────────────────────┘
```

**Match Complete:**
```
┌─────────────────────────────────────┐
│         MATCH COMPLETE              │
├─────────────────────────────────────┤
│                                     │
│         🏆 VICTORY! 🏆             │
│                                     │
│  Final Score:  3 - 2                │
│                                     │
│  ┌───────────────────────────┐     │
│  │ Match Statistics:         │     │
│  │ Duration: 1m 45s          │     │
│  │ Total Rounds: 5           │     │
│  │ Your Moves:               │     │
│  │   Rock: 2 (1W, 1L)       │     │
│  │   Paper: 2 (1W, 1L)      │     │
│  │   Scissors: 1 (1W)       │     │
│  └───────────────────────────┘     │
│                                     │
│  [Play Again]  [View Details]      │
│                                     │
└─────────────────────────────────────┘
```

### 4.3 Tournament Screen

**Tournament List:**
```
┌─────────────────────────────────────┐
│  Tournaments  [+ Create]            │
├─────────────────────────────────────┤
│  Filters: ○ All ○ Open ○ Active    │
├─────────────────────────────────────┤
│                                     │
│  ┌───────────────────────────────┐ │
│  │ Weekly Championship 🏆        │ │
│  │ Status: Registration Open     │ │
│  │ Players: 12/16               │ │
│  │ Starts: Nov 25, 6:00 PM      │ │
│  │ Format: Best of 3            │ │
│  │ [Register] →                 │ │
│  └───────────────────────────────┘ │
│                                     │
│  ┌───────────────────────────────┐ │
│  │ Friday Night RPS              │ │
│  │ Status: In Progress           │ │
│  │ Round: Quarter Finals         │ │
│  │ [Watch] →                    │ │
│  └───────────────────────────────┘ │
│                                     │
└─────────────────────────────────────┘
```

**Tournament Details:**
```
┌─────────────────────────────────────┐
│  ← Back  Weekly Championship        │
├─────────────────────────────────────┤
│                                     │
│  Status: In Progress 🔴            │
│  Current Round: Quarter Finals      │
│                                     │
│  ┌───────────────────────────────┐ │
│  │ Tournament Info:              │ │
│  │ • Format: Single Elimination  │ │
│  │ • Match: Best of 3           │ │
│  │ • Players: 16                │ │
│  │ • Prize: Trophy + Bragging   │ │
│  └───────────────────────────────┘ │
│                                     │
│  Tabs: [Bracket] [Standings] [Info]│
│                                     │
└─────────────────────────────────────┘
```

**Tournament Bracket:**
```
┌─────────────────────────────────────┐
│  Bracket View                       │
│  (Horizontal scroll enabled)        │
├─────────────────────────────────────┤
│                                     │
│  Round 1    Round 2    Finals       │
│  ┌───────┐                          │
│  │ P1✓  │──┐                       │
│  │ P2    │  │ ┌───────┐            │
│  └───────┘  └─│ P1    │──┐         │
│  ┌───────┐    │ P3    │  │         │
│  │ P3✓  │──┐ └───────┘  │         │
│  │ P4    │  │            │ ┌─────┐ │
│  └───────┘  │            └─│ ?   │ │
│             │              │ ?   │ │
│  ┌───────┐  │              └─────┘ │
│  │ P5    │──┘                       │
│  │ P6    │                          │
│  └───────┘                          │
│                                     │
│  Tap match for details              │
│                                     │
└─────────────────────────────────────┘
```

### 4.4 Statistics Screen

**Stats Overview:**
```
┌─────────────────────────────────────┐
│  Your Statistics                    │
├─────────────────────────────────────┤
│  Game Type: Classic RPS ▼           │
├─────────────────────────────────────┤
│                                     │
│  Overall Stats:                     │
│  ┌──────┐ ┌──────┐ ┌──────┐       │
│  │ 150  │ │ 95   │ │ 63.3%│       │
│  │Matches│ │ Wins │ │ WR   │       │
│  └──────┘ └──────┘ └──────┘       │
│                                     │
│  ┌───────────────────────────────┐ │
│  │ Win Rate Trend (Chart)        │ │
│  │      ╱─╲                      │ │
│  │    ╱     ╲  ╱╲               │ │
│  │  ╱         ╲╱  ╲             │ │
│  └───────────────────────────────┘ │
│                                     │
│  Move Performance:                  │
│  🪨 Rock:     150 (63% WR)         │
│  📄 Paper:    145 (62% WR)         │
│  ✂️ Scissors: 155 (61% WR)         │
│                                     │
│  [View Detailed Stats] →            │
│                                     │
└─────────────────────────────────────┘
```

**Detailed Stats:**
```
┌─────────────────────────────────────┐
│  ← Back  Detailed Statistics        │
├─────────────────────────────────────┤
│  Tabs: [Overview] [Moves] [Opponents]│
├─────────────────────────────────────┤
│                                     │
│  Move Statistics:                   │
│                                     │
│  🪨 ROCK                            │
│  Used: 150 times (33.3%)           │
│  Win Rate: 63.3% (95W-50L-5T)      │
│  Best Against: Scissors            │
│  ────────────────── 63% ▓▓▓▓░░    │
│                                     │
│  📄 PAPER                          │
│  Used: 145 times (32.2%)           │
│  Win Rate: 62.1% (90W-48L-7T)      │
│  Best Against: Rock                │
│  ────────────────── 62% ▓▓▓▓░░    │
│                                     │
│  ✂️ SCISSORS                       │
│  Used: 155 times (34.4%)           │
│  Win Rate: 61.3% (95W-52L-8T)      │
│  Best Against: Paper               │
│  ────────────────── 61% ▓▓▓▓░░    │
│                                     │
└─────────────────────────────────────┘
```

### 4.5 Profile Screen

**User Profile:**
```
┌─────────────────────────────────────┐
│  ← Back  Profile       [⚙️ Settings]│
├─────────────────────────────────────┤
│                                     │
│         [Avatar Image]              │
│      Display Name                   │
│      Level 15 ⭐                    │
│      Rank: #42 🏆                   │
│                                     │
│  Bio: Rock Paper Scissors expert    │
│                                     │
│  ┌───────────────────────────────┐ │
│  │ Quick Stats:                  │ │
│  │ Matches: 150  Wins: 95       │ │
│  │ Tournaments Won: 3            │ │
│  │ Member Since: Jan 2025        │ │
│  └───────────────────────────────┘ │
│                                     │
│  ┌───────────────────────────────┐ │
│  │ Achievements (3/20):          │ │
│  │ 🏆 🎯 ⚡                      │ │
│  │ [View All] →                 │ │
│  └───────────────────────────────┘ │
│                                     │
│  Recent Activity:                   │
│  • Won tournament (2 days ago)      │
│  • 10-win streak (1 week ago)       │
│                                     │
│  [Edit Profile]                     │
│                                     │
└─────────────────────────────────────┘
```

---

## 5. Animations & Interactions

### 5.1 Confetti Animation (Win)

**Specifications:**
```javascript
{
  particles: 100,
  colors: ['#10B981', '#3B82F6', '#F59E0B', '#EF4444', '#8B5CF6'],
  origin: { y: 0 },  // Top of screen
  spread: 90,  // Wide spread
  velocity: 45,  // Fast fall
  gravity: 1.2,  // Natural gravity
  decay: 0.94,  // Fade rate
  duration: 3000  // 3 seconds
}
```

**Trigger:**
- On round win
- On match win
- On tournament win (more intense)

**Behavior:**
- Particles fall from top
- Random colors and rotations
- Fade out near bottom
- Non-blocking (can interact during animation)

### 5.2 Explosion Animation (Loss)

**Specifications:**
```javascript
{
  origin: 'center',  // From selected symbol
  particles: 30,
  colors: ['#EF4444', '#F97316', '#FBBF24'],  // Red, orange, yellow
  spread: 360,  // Full circle
  velocity: 25,  // Outward burst
  duration: 1500  // 1.5 seconds
}
```

**Trigger:**
- On round loss
- On match loss

**Behavior:**
- Radial burst from hand symbol
- Particles fade quickly
- Symbol disappears during animation
- Quick recovery to next round

### 5.3 Card Fly Animation (Round History)

**Specifications:**
```css
@keyframes flyToCorner {
  0% {
    transform: translate(0, 0) scale(1);
    opacity: 1;
  }
  100% {
    transform: translate(-200px, -300px) scale(0.25);
    opacity: 1;
  }
}

duration: 600ms
easing: cubic-bezier(0.4, 0, 0.2, 1)
```

**Trigger:**
- After result display (2 seconds)
- Both player cards animate simultaneously

**Behavior:**
- Cards slide and scale to top-left
- Stack chronologically
- Remain visible for match history
- Clickable to review round details

### 5.4 Button Interactions

**Tap/Click Feedback:**
```css
active: {
  transform: scale(0.95);
  transition: 100ms;
}
```

**Hover State (Desktop):**
```css
hover: {
  transform: translateY(-2px);
  shadow: shadow-lg;
  transition: 200ms;
}
```

### 5.5 Page Transitions

**Screen Change:**
```
Fade Out (200ms) → Route Change → Fade In (200ms)
```

**Modal Open:**
```
Overlay Fade In (150ms)
Modal Scale Up (0.95 → 1, 200ms)
```

**Drawer Slide (Mobile Menu):**
```
Slide from left/right (250ms)
Overlay fade in (150ms)
```

### 5.6 Loading States

**Spinner:**
```
Size: 40px
Color: Primary Blue
Animation: Rotate 360deg, 1s linear infinite
```

**Skeleton Screens:**
```
Background: Shimmer animation
Color: Gray gradient
Mimics content layout
```

**Progress Indicators:**
```
Linear bar for known durations
Circular for indeterminate
Percentage display when available
```

---

## 6. Responsive Breakpoints

### 6.1 Breakpoints

```css
mobile:  < 640px   (default)
tablet:  640px - 1024px
desktop: > 1024px
```

### 6.2 Layout Adjustments

**Mobile (< 640px):**
- Single column layout
- Bottom tab navigation
- Full-width cards
- Stacked elements
- Touch-optimized (44px min touch target)

**Tablet (640px - 1024px):**
- Two column layouts where appropriate
- Side navigation option
- Cards in grid (2 columns)
- Larger touch targets maintained

**Desktop (> 1024px):**
- Three column layouts
- Persistent side navigation
- Hover states active
- Cards in grid (3-4 columns)
- Larger typography and spacing

---

## 7. Accessibility

### 7.1 WCAG 2.1 AA Compliance

**Color Contrast:**
- Text on background: minimum 4.5:1
- Large text: minimum 3:1
- UI components: minimum 3:1

**Focus Indicators:**
- Visible focus ring on all interactive elements
- 2px solid Primary Blue
- 2px offset from element

**Keyboard Navigation:**
- Tab order follows visual flow
- All interactive elements keyboard accessible
- Escape closes modals/dropups
- Enter/Space activates buttons

**Screen Reader Support:**
- Semantic HTML elements
- ARIA labels where needed
- Alt text for images
- Announcements for dynamic content

### 7.2 Accessibility Features

**Text Sizing:**
- Respect user's font size preferences
- Support up to 200% zoom
- Reflow content appropriately

**Motion:**
- Respect `prefers-reduced-motion`
- Disable animations if requested
- Provide alternative feedback

**Color Blindness:**
- Don't rely solely on color
- Use icons + text labels
- Patterns in addition to colors

---

## 8. Dark Mode

### 8.1 Color Adjustments

**Background:**
```
Light: #FFFFFF → Dark: #111827
Cards: #F9FAFB → Dark: #1F2937
Borders: #E5E7EB → Dark: #374151
```

**Text:**
```
Primary: #111827 → Dark: #F9FAFB
Secondary: #6B7280 → Dark: #9CA3AF
```

**Colors:**
- Primary, Success, Warning, Error colors remain similar
- Reduced opacity in dark mode for subtlety

### 8.2 Implementation

```javascript
// Auto-detect system preference
const prefersDark = window.matchMedia('(prefers-color-scheme: dark)');

// User toggle overrides system preference
// Store preference in localStorage
```

---

## 9. Micro-interactions

### 9.1 Symbol Selection

**Hover (Desktop):**
- Scale up slightly (1.1x)
- Glow effect
- Cursor: pointer

**Tap (Mobile):**
- Scale down (0.95x)
- Haptic feedback (if supported)
- Color change

**Selected:**
- Border highlight
- Pulse animation
- Check icon overlay

### 9.2 Score Updates

**Number Change:**
- Animate from old to new value
- Duration: 500ms
- Ease out function
- Flash highlight color

### 9.3 Notifications

**Toast Notifications:**
```
Position: Top center (mobile), Top right (desktop)
Duration: 4 seconds
Animation: Slide down + fade in
Dismissible: X button or swipe up
Types: Success, Error, Warning, Info
```

---

## 10. Error States

### 10.1 Form Errors

**Display:**
- Red border on input
- Error icon in input
- Error message below in red text
- Focus on first error field

### 10.2 Empty States

**No Data:**
```
┌───────────────────────────────┐
│                               │
│        [Illustration]         │
│                               │
│     No matches yet            │
│  Play your first game!        │
│                               │
│      [Start Playing]          │
│                               │
└───────────────────────────────┘
```

### 10.3 Error Pages

**404 Not Found:**
```
Large illustration
"Page not found"
Brief explanation
[Go Home] button
```

**500 Server Error:**
```
Friendly illustration
"Something went wrong"
"We're working on it"
[Try Again] button
```

### 10.4 Network Errors

**Offline:**
```
Banner at top: "You're offline"
Cached content still visible
Actions disabled with explanation
Auto-retry when back online
```

**Slow Connection:**
```
Loading indicators
Timeout after 30 seconds
Option to retry
Fallback to cached data
```

---

## 11. Performance Considerations

### 11.1 Image Optimization

- WebP format with fallbacks
- Responsive images (srcset)
- Lazy loading below fold
- Placeholder blur effect

### 11.2 Animation Performance

- Use transform and opacity (GPU accelerated)
- Avoid layout thrashing
- Request Animation Frame for JS animations
- CSS animations where possible

### 11.3 Rendering Optimization

- Virtual scrolling for long lists
- Code splitting by route
- Lazy load components
- Memoization for expensive renders

---

## 12. Design Deliverables

### 12.1 Required Assets

**Icons:**
- Rock, Paper, Scissors symbols (multiple sizes)
- Navigation icons
- Action icons (edit, delete, etc.)
- Status icons (win, loss, tie)
- Achievement badges

**Illustrations:**
- Empty states
- Error states
- Onboarding screens
- Celebration graphics

**Animations:**
- Confetti particles
- Explosion effects
- Loading spinners
- Transition effects

### 12.2 Design Files

- Figma/Sketch source files
- Component library
- Icon set (SVG)
- Style guide
- Interaction prototypes

---

## 13. User Testing Plan

### 13.1 Usability Testing

**Test Scenarios:**
1. First-time user creates account and plays match
2. User creates tournament
3. User views statistics
4. User navigates between sections
5. User plays match on mobile vs desktop

**Metrics:**
- Task completion rate
- Time to complete tasks
- Error rate
- User satisfaction (SUS score)

### 13.2 A/B Testing

**Test Variations:**
- Button placement
- Color schemes
- Animation intensity
- Copy/messaging
- Layout options

---

**Document Approval:**
- [ ] UX Designer
- [ ] UI Designer
- [ ] Frontend Lead
- [ ] Accessibility Specialist

---

END OF DOCUMENT

