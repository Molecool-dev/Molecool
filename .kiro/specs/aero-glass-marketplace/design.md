# Design Document: Aero Glass Marketplace

## Overview

This design document outlines the architecture and implementation strategy for transforming the Molecool Widget Marketplace with a Windows 7 Aero Glass design system. The redesign will replace the current clean interface with a nostalgic aesthetic featuring translucent glass surfaces, glowing edges, vibrant blue gradients, and smooth animations.

The implementation will be built on top of the existing Next.js 15 architecture, extending shadcn/ui components with glass material styling while maintaining full compatibility with the current data layer and routing structure.

## Architecture

### Design System Layers

```
┌─────────────────────────────────────────────────────────┐
│                    Page Components                       │
│  (HomePage, WidgetDetailPage, Hero, Gallery)           │
└─────────────────────────────────────────────────────────┘
                          ↓
┌─────────────────────────────────────────────────────────┐
│              Glass Component Library                     │
│  (GlassCard, GlassButton, GlassBadge, GlassPanel)      │
└─────────────────────────────────────────────────────────┘
                          ↓
┌─────────────────────────────────────────────────────────┐
│                 shadcn/ui Base                          │
│        (Card, Button, Badge, Input, etc.)               │
└─────────────────────────────────────────────────────────┘
                          ↓
┌─────────────────────────────────────────────────────────┐
│              Tailwind CSS + Custom Theme                 │
│    (Aero colors, glass utilities, animations)           │
└─────────────────────────────────────────────────────────┘
```

### File Structure

```
widget-marketplace/
├── app/
│   ├── globals.css                    # Enhanced with Aero Glass CSS variables
│   ├── page.tsx                       # Redesigned homepage with Hero
│   └── widgets/[id]/page.tsx          # Redesigned detail page
├── components/
│   ├── ui/                            # shadcn/ui base components
│   │   ├── card.tsx
│   │   ├── button.tsx
│   │   └── badge.tsx
│   ├── glass/                         # NEW: Glass component library
│   │   ├── GlassCard.tsx
│   │   ├── GlassButton.tsx
│   │   ├── GlassBadge.tsx
│   │   ├── GlassPanel.tsx
│   │   ├── GlassOrb.tsx
│   │   └── GlassMetric.tsx
│   ├── effects/                       # NEW: Visual effects
│   │   ├── LightRays.tsx
│   │   ├── GlowRing.tsx
│   │   └── ReflectionOverlay.tsx
│   ├── Hero.tsx                       # NEW: Hero section
│   ├── WidgetCard.tsx                 # Enhanced with glass styling
│   ├── WidgetGallery.tsx              # Updated layout
│   └── [existing components...]
└── lib/
    └── utils.ts                       # cn() helper for class merging
```

## Components and Interfaces

### 1. CSS Custom Properties (globals.css)

Define the Aero Glass design tokens as CSS custom properties:

```css
:root {
  /* Glass Materials */
  --glass-bg: rgba(255, 255, 255, 0.12);
  --glass-border: rgba(255, 255, 255, 0.3);
  --glass-blur: 20px;
  
  /* Aero Colors */
  --aero-blue: #00D4FF;
  --aero-glow: rgba(0, 212, 255, 0.6);
  
  /* Gradients */
  --bg-main: linear-gradient(180deg, #1e3c72 0%, #2a5298 50%, #7e8ba3 100%);
  --glass-gradient: linear-gradient(
    135deg,
    rgba(255, 255, 255, 0.2) 0%,
    rgba(255, 255, 255, 0.05) 50%,
    rgba(0, 191, 255, 0.1) 100%
  );
  
  /* Shadows */
  --glass-shadow: 
    0 8px 32px rgba(0, 0, 0, 0.25),
    inset 0 1px 0 rgba(255, 255, 255, 0.4),
    inset 0 -1px 0 rgba(0, 0, 0, 0.1);
  
  --glass-shadow-hover:
    0 20px 60px rgba(0, 212, 255, 0.4),
    0 0 0 1px rgba(255, 255, 255, 0.5),
    inset 0 1px 0 rgba(255, 255, 255, 0.6);
}

/* Mobile optimization */
@media (max-width: 768px) {
  :root {
    --glass-blur: 10px;
  }
}
```

### 2. Base Glass Utility Classes

```css
.glass-surface {
  background: var(--glass-bg);
  backdrop-filter: blur(var(--glass-blur)) saturate(180%);
  border: 1px solid var(--glass-border);
  box-shadow: var(--glass-shadow);
}

.glass-reflection {
  position: absolute;
  inset: 0;
  background: linear-gradient(
    135deg,
    rgba(255, 255, 255, 0.3) 0%,
    transparent 40%
  );
  pointer-events: none;
}

.aero-title-bar {
  height: 2rem;
  background: linear-gradient(
    to right,
    rgba(0, 212, 255, 0.8),
    rgba(59, 130, 246, 0.6)
  );
  border-radius: 0.75rem 0.75rem 0 0;
}
```

### 3. Animation Keyframes

```css
@keyframes float {
  0%, 100% {
    transform: translateY(0px) rotate(0deg);
  }
  50% {
    transform: translateY(-20px) rotate(1deg);
  }
}

@keyframes shimmer {
  0% {
    background-position: -1000px 0;
  }
  100% {
    background-position: 1000px 0;
  }
}

@keyframes ripple {
  from {
    transform: scale(0);
    opacity: 1;
  }
  to {
    transform: scale(4);
    opacity: 0;
  }
}

@keyframes rotate-glow {
  to {
    transform: rotate(360deg);
  }
}

@keyframes ray-pulse {
  0%, 100% {
    opacity: 0.3;
  }
  50% {
    opacity: 0.8;
  }
}
```

### 4. GlassCard Component

**Interface:**
```typescript
interface GlassCardProps extends React.ComponentPropsWithoutRef<typeof Card> {
  children: React.ReactNode;
  className?: string;
  variant?: 'default' | 'warning';
}
```

**Implementation Strategy:**
- Extend shadcn/ui Card component
- Apply glass-surface base styling
- Add reflection overlay as ::before pseudo-element
- Support warning variant with yellow border for permissions
- Maintain hover state with enhanced shadow and border

**Key Features:**
- Multi-layered shadows (outer + inner + glow on hover)
- Top-left reflection gradient overlay
- Smooth transitions (300ms)
- Responsive blur reduction on mobile

### 5. GlassButton Component

**Interface:**
```typescript
interface GlassButtonProps extends React.ComponentPropsWithoutRef<typeof Button> {
  variant?: 'primary' | 'secondary';
  children: React.ReactNode;
  className?: string;
}
```

**Implementation Strategy:**
- Extend shadcn/ui Button component
- Primary variant: cyan-to-blue gradient with glow shadow
- Secondary variant: subtle white/10 background
- Add ripple effect on click using ::after pseudo-element
- Top highlight line using ::before pseudo-element

**Variants:**
- **Primary**: Cyan gradient background, strong glow, lift on hover
- **Secondary**: Transparent with subtle white tint, minimal glow

### 6. GlassBadge Component

**Interface:**
```typescript
interface GlassBadgeProps extends React.ComponentPropsWithoutRef<typeof Badge> {
  icon?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
}
```

**Implementation Strategy:**
- Extend shadcn/ui Badge component
- Apply glass material with reduced opacity
- Support optional icon prefix
- Inset highlight for depth

### 7. Hero Section Component

**Interface:**
```typescript
interface HeroProps {
  widgetCount: number;
  downloadCount: number;
  developerCount: number;
}
```

**Structure:**
```tsx
<section className="hero-section">
  {/* Animated gradient background */}
  <div className="gradient-bg">
    <LightRays opacity={0.3} />
  </div>
  
  {/* Main floating panel */}
  <GlassPanel className="animate-float">
    <h1>Molecool</h1>
    <p>Desktop Widgets Reimagined</p>
    <div className="button-group">
      <GlassButton variant="primary">Download Molecool</GlassButton>
      <GlassButton variant="secondary">Browse Widgets</GlassButton>
    </div>
  </GlassPanel>
  
  {/* Stats cards */}
  <div className="stats-grid">
    <GlassMetric value={widgetCount} label="Widgets" />
    <GlassMetric value={downloadCount} label="Downloads" />
    <GlassMetric value={developerCount} label="Developers" />
  </div>
</section>
```

**Key Features:**
- Full viewport height (100vh)
- Animated blue gradient background
- Floating animation on main panel (6s ease-in-out infinite)
- Light rays effect with pulsing animation
- Three floating stats cards with glass material

### 8. Enhanced WidgetCard Component

**Modifications to Existing Component:**
- Replace border/shadow with glass-surface styling
- Add Aero title bar at top (8px height, cyan gradient)
- Wrap icon in glass orb with reflection
- Add glow ring for hover state
- Implement lift animation on hover (-12px translateY, 1.02 scale)
- Add rotating glow effect (3s linear infinite)

**Hover State Behavior:**
```css
.widget-card {
  transition: all 0.4s cubic-bezier(0.34, 1.56, 0.64, 1);
}

.widget-card:hover {
  transform: translateY(-12px) scale(1.02);
  box-shadow: var(--glass-shadow-hover);
}

.widget-card:hover .glow-ring {
  opacity: 1;
  animation: rotate-glow 3s linear infinite;
}
```

### 9. LightRays Effect Component

**Interface:**
```typescript
interface LightRaysProps {
  opacity?: number;
  rayCount?: number;
}
```

**Implementation:**
- Render 8 light ray elements by default
- Each ray rotated at 45-degree intervals (i * 45deg)
- Cyan gradient from transparent → cyan/30 → transparent
- Pulse animation with staggered delays
- Absolute positioning with overflow hidden
- Non-interactive (pointer-events: none)

### 10. GlassOrb Component

**Interface:**
```typescript
interface GlassOrbProps {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  children: React.ReactNode;
  className?: string;
}
```

**Purpose:**
- Circular glass container for icons
- Used in widget cards and detail page
- Includes reflection overlay
- Sizes: sm (48px), md (80px), lg (192px), xl (256px)

### 11. Widget Detail Page Layout

**Structure:**
```tsx
<div className="detail-page">
  {/* Gradient background */}
  <div className="gradient-bg" />
  
  <div className="container">
    <div className="grid lg:grid-cols-3">
      {/* Sidebar */}
      <aside className="lg:col-span-1">
        <GlassPanel className="sticky top-6">
          <GlassOrb size="xl">{icon}</GlassOrb>
          <GlassButton variant="primary" size="lg">
            🚀 Install Widget
          </GlassButton>
          <div className="stats-grid">
            {stats.map(stat => <GlassMetric {...stat} />)}
          </div>
        </GlassPanel>
      </aside>
      
      {/* Main content */}
      <main className="lg:col-span-2">
        <h1>{name}</h1>
        
        {/* Permissions card with warning variant */}
        <GlassCard variant="warning">
          <CardHeader>
            <div className="warning-icon">⚠️</div>
            <h3>Required Permissions</h3>
          </CardHeader>
          <CardContent>
            <PermissionsList permissions={permissions} />
          </CardContent>
        </GlassCard>
        
        {/* Features card */}
        <GlassCard>
          <CardHeader><h3>Features</h3></CardHeader>
          <CardContent>{/* features */}</CardContent>
        </GlassCard>
      </main>
    </div>
  </div>
</div>
```

## Data Models

No changes to existing data models. The design system is purely presentational and works with the existing Widget interface:

```typescript
interface Widget {
  id: string;
  widget_id: string;
  name: string;
  display_name: string;
  description: string;
  author_name: string;
  author_email: string;
  version: string;
  downloads: number;
  permissions: {
    systemInfo?: {
      cpu?: boolean;
      memory?: boolean;
    };
    network?: {
      enabled?: boolean;
      allowedDomains?: string[];
    };
  };
  sizes: {
    default: { width: number; height: number };
    min?: { width: number; height: number };
    max?: { width: number; height: number };
  };
  icon_url?: string;
  download_url: string;
  created_at: string;
  updated_at: string;
}
```

## Error Handling

### Glass Material Fallbacks

**Backdrop Filter Support:**
- Check for backdrop-filter support using @supports
- Fallback to solid background with reduced opacity
- Maintain border and shadow for visual consistency

```css
.glass-surface {
  background: var(--glass-bg);
  backdrop-filter: blur(var(--glass-blur)) saturate(180%);
}

@supports not (backdrop-filter: blur(20px)) {
  .glass-surface {
    background: rgba(255, 255, 255, 0.25);
  }
}
```

### Animation Performance

**Reduced Motion:**
- Respect prefers-reduced-motion media query
- Disable floating, shimmer, and rotation animations
- Maintain instant transitions for accessibility

```css
@media (prefers-reduced-motion: reduce) {
  *,
  *::before,
  *::after {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
  }
}
```

### Mobile Performance

**Automatic Optimizations:**
- Reduce blur from 20px to 10px on viewports < 768px
- Disable continuous rotation animations
- Simplify shadow layers to single outer shadow
- Use will-change: transform sparingly

## Testing Strategy

### Visual Regression Testing

**Key Scenarios:**
1. Hero section renders with gradient background and floating panel
2. Widget cards display glass material with Aero title bar
3. Hover states trigger lift animation and glow ring
4. Detail page shows glass sidebar and content cards
5. Mobile view reduces blur and simplifies effects

### Component Testing

**GlassCard:**
- Renders children correctly
- Applies glass-surface styling
- Shows reflection overlay
- Supports warning variant with yellow border
- Merges custom className prop

**GlassButton:**
- Renders primary variant with cyan gradient
- Renders secondary variant with subtle background
- Triggers ripple effect on click
- Applies hover lift animation
- Supports disabled state

**Hero:**
- Displays widget count, download count, developer count
- Renders light rays with correct rotation
- Applies floating animation to main panel
- Shows primary and secondary CTA buttons

### Accessibility Testing

**Contrast Ratios:**
- Verify text on glass surfaces meets WCAG AA (4.5:1)
- Add text-shadow where needed for readability
- Test with dark mode and light backgrounds

**Keyboard Navigation:**
- All interactive elements focusable
- Focus indicators visible on glass surfaces
- Tab order follows logical flow

**Screen Readers:**
- Decorative elements (light rays, glow rings) have aria-hidden
- Icon-only buttons have aria-label
- Stats cards have proper semantic markup

### Performance Testing

**Metrics to Monitor:**
1. First Contentful Paint (FCP) - Target: < 1.5s
2. Largest Contentful Paint (LCP) - Target: < 2.5s
3. Cumulative Layout Shift (CLS) - Target: < 0.1
4. Animation frame rate - Target: 60fps

**Optimization Techniques:**
- Use will-change: transform on animated elements
- Lazy load light rays effect
- Debounce hover state changes
- Use CSS containment for isolated components

## Implementation Phases

### Phase 1: Foundation (Glass Material System)
- Set up CSS custom properties in globals.css
- Create base utility classes (glass-surface, glass-reflection)
- Define animation keyframes
- Install required shadcn/ui components (card, button, badge)

### Phase 2: Glass Component Library
- Implement GlassCard component
- Implement GlassButton component
- Implement GlassBadge component
- Implement GlassPanel component
- Implement GlassOrb component
- Implement GlassMetric component

### Phase 3: Visual Effects
- Create LightRays component
- Create GlowRing component
- Create ReflectionOverlay component
- Add ripple effect to buttons

### Phase 4: Hero Section
- Build Hero component structure
- Integrate LightRays effect
- Add floating animation
- Create stats cards with GlassMetric

### Phase 5: Widget Cards
- Enhance WidgetCard with glass styling
- Add Aero title bar
- Wrap icon in GlassOrb
- Implement hover lift and glow ring

### Phase 6: Detail Page
- Redesign layout with gradient background
- Create glass sidebar with sticky positioning
- Convert content sections to GlassCard
- Add warning variant for permissions

### Phase 7: Polish & Optimization
- Add mobile optimizations
- Implement reduced motion support
- Add backdrop-filter fallbacks
- Performance audit and optimization
- Accessibility audit and fixes

## Design Decisions and Rationales

### Why Extend shadcn/ui Instead of Custom Components?

**Rationale:**
- Maintains consistency with existing component API
- Leverages battle-tested accessibility features
- Easier to upgrade and maintain
- Familiar patterns for developers

### Why CSS Custom Properties Over Tailwind Config?

**Rationale:**
- Dynamic values can be changed at runtime
- Better browser DevTools support for debugging
- Easier to create theme variants
- More flexible for complex gradients and shadows

### Why Separate Glass Component Library?

**Rationale:**
- Clear separation of concerns
- Reusable across multiple pages
- Easier to test in isolation
- Can be extracted to shared package later

### Why Cubic-Bezier Easing for Animations?

**Rationale:**
- cubic-bezier(0.34, 1.56, 0.64, 1) creates bouncy, playful feel
- Matches Windows 7 Aero animation style
- More engaging than linear or ease-in-out
- Adds personality to interactions

### Why Reduce Blur on Mobile?

**Rationale:**
- Backdrop-filter is expensive on mobile GPUs
- 10px blur maintains visual effect with better performance
- Prevents janky scrolling and animations
- Improves battery life on mobile devices

### Why Sticky Sidebar on Detail Page?

**Rationale:**
- Keeps install button visible while scrolling
- Maintains context of widget being viewed
- Common pattern in e-commerce and app stores
- Improves conversion rate for installations

## Quality Checklist

- [ ] All glass surfaces use 20px blur (10px on mobile)
- [ ] All glass surfaces have rgba(255, 255, 255, 0.3) borders
- [ ] Hover states lift elements -12px with cyan glow
- [ ] Buttons have ripple effect on click
- [ ] Cards have top-left reflection gradient
- [ ] All transitions use cubic-bezier(0.34, 1.56, 0.64, 1)
- [ ] Text maintains 4.5:1 contrast ratio minimum
- [ ] Text-shadow applied where needed for readability
- [ ] Decorative elements have pointer-events: none
- [ ] Decorative elements have aria-hidden="true"
- [ ] Animations respect prefers-reduced-motion
- [ ] Mobile view reduces blur to 10px
- [ ] Mobile view disables continuous animations
- [ ] will-change: transform on animated elements
- [ ] Focus indicators visible on all interactive elements
- [ ] Keyboard navigation works correctly
- [ ] Screen reader announcements are appropriate
