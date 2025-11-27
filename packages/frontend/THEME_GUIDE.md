# Tournament Theme Guide

This project uses a custom tournament-themed design system built on **shadcn/ui** and **Tailwind CSS** with full dark mode support.

## Theme Overview

The theme is designed specifically for a competitive tournament platform with:
- **Energetic blue-purple primary colors** for competitive energy
- **Warm orange accents** for highlights and victories
- **Full dark mode support** with tasteful color schemes
- **Mobile-first responsive design**

## Color Palette

### Light Mode
- **Primary**: Vibrant purple-blue (`262 83% 58%`) - Used for main actions and branding
- **Secondary**: Softer purple (`262 52% 47%`) - Used for secondary elements
- **Accent**: Warm orange (`25 95% 53%`) - Used for highlights, victories, and important actions
- **Background**: Pure white (`0 0% 100%`)
- **Foreground**: Deep dark blue (`222 47% 11%`)

### Dark Mode
- **Primary**: Brighter purple-blue (`262 83% 65%`) - Enhanced visibility in dark mode
- **Secondary**: Softer purple (`262 52% 55%`)
- **Accent**: Bright orange (`25 95% 60%`) - Stands out in dark backgrounds
- **Background**: Deep dark blue (`222 47% 11%`)
- **Foreground**: Light gray-blue (`213 31% 91%`)

## Using the Theme

### Theme Toggle Component

The theme toggle is available in the navigation bar and mobile menu. Users can switch between:
- **Light mode**
- **Dark mode**
- **System** (follows OS preference)

```tsx
import { ThemeToggle } from '@/components/ui/theme-toggle';

<ThemeToggle />
```

### Using Theme Colors

Use Tailwind's semantic color classes that automatically adapt to light/dark mode:

```tsx
// Background colors
<div className="bg-background">...</div>
<div className="bg-card">...</div>
<div className="bg-popover">...</div>

// Text colors
<p className="text-foreground">...</p>
<p className="text-muted-foreground">...</p>

// Primary colors
<button className="bg-primary text-primary-foreground">...</button>

// Accent colors (for highlights, victories)
<div className="bg-accent text-accent-foreground">...</div>
```

### Custom Components

All shadcn/ui components are available and automatically support dark mode:

```tsx
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
// ... etc
```

## Adding New Components

When creating new components, follow these guidelines:

1. **Use semantic color classes** instead of hardcoded colors
2. **Test in both light and dark modes**
3. **Ensure mobile responsiveness** using Tailwind's responsive utilities
4. **Use the theme toggle** to verify appearance

### Example Component

```tsx
'use client';

import { cn } from '@/lib/utils';

export function TournamentCard({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={cn(
      'rounded-lg border bg-card p-6 shadow-sm',
      'hover:shadow-md transition-shadow',
      className
    )}>
      {children}
    </div>
  );
}
```

## Customization

### Changing Colors

Edit `src/app/globals.css` to modify the color palette:

```css
:root {
  --primary: 262 83% 58%; /* Change these HSL values */
  --accent: 25 95% 53%;
  /* ... */
}

.dark {
  --primary: 262 83% 65%;
  /* ... */
}
```

### Adding New Color Tokens

1. Add the CSS variable in `globals.css`
2. Add it to `tailwind.config.js` in the `extend.colors` section
3. Use it throughout your components

## Mobile Responsiveness

The theme is mobile-first and includes:
- Touch-friendly button sizes (minimum 44x44px)
- Responsive typography
- Mobile-optimized navigation
- Proper viewport settings

Use Tailwind's responsive breakpoints:
- `sm:` - 640px and up
- `md:` - 768px and up
- `lg:` - 1024px and up
- `xl:` - 1280px and up

## Best Practices

1. **Always use theme variables** - Don't hardcode colors
2. **Test dark mode** - Ensure readability in both modes
3. **Mobile first** - Design for mobile, enhance for desktop
4. **Consistent spacing** - Use Tailwind's spacing scale
5. **Accessible contrast** - Ensure WCAG AA compliance

## Resources

- [shadcn/ui Documentation](https://ui.shadcn.com)
- [Tailwind CSS Documentation](https://tailwindcss.com)
- [next-themes Documentation](https://github.com/pacocoursey/next-themes)

