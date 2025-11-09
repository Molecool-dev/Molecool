# Widget Marketplace

The Molecool Widget Marketplace is a Next.js 15 web application that allows users to discover, browse, and install desktop widgets for the Molecool platform.

## Tech Stack

- **Next.js 15** - React framework with App Router
- **TypeScript** - Type-safe development
- **Tailwind CSS 4** - Utility-first CSS framework with Aero Glass design system
- **shadcn/ui** - Accessible component primitives
- **Supabase** - Backend as a Service (PostgreSQL database)

## Design System

The marketplace features a **Windows 7 Aero Glass** inspired design system with:

- **Glass Material System**: Semi-transparent surfaces with backdrop blur effects
- **Vibrant Gradients**: Blue gradients (#1e3c72 → #2a5298 → #7e8ba3)
- **Glowing Effects**: Cyan glow rings and shadows on interactive elements
- **Smooth Animations**: Floating, shimmer, and ripple effects with cubic-bezier easing
- **Responsive Performance**: Optimized blur and animations for mobile devices

### CSS Custom Properties

The design system is built on CSS custom properties defined in `app/globals.css`:

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
  --glass-gradient: linear-gradient(135deg, ...);
  
  /* Shadows */
  --glass-shadow: 0 8px 32px rgba(0, 0, 0, 0.25), ...;
  --glass-shadow-hover: 0 20px 60px rgba(0, 212, 255, 0.4), ...;
}
```

### Utility Classes

- `.glass-surface` - Base glass material with backdrop blur
- `.glass-reflection` - Top-left reflection gradient overlay
- `.aero-title-bar` - Cyan-to-blue gradient title bar
- `.animate-float` - Floating animation (6s ease-in-out infinite)

### Animations

- `float` - Vertical floating with subtle rotation
- `shimmer` - Highlight gradient sweep
- `ripple` - Click ripple effect
- `rotate-glow` - Continuous glow ring rotation
- `ray-pulse` - Light ray opacity pulsing

### Mobile Optimizations

On viewports < 768px:
- Blur reduced from 20px to 10px for performance
- Continuous animations disabled
- Simplified shadow layers

### Accessibility

- Respects `prefers-reduced-motion` media query
- Maintains 4.5:1 contrast ratio on glass surfaces
- Text shadows applied where needed for readability
- Fallback for browsers without backdrop-filter support

## Getting Started

### Prerequisites

- Node.js 18+ installed
- A Supabase account and project

### Installation

1. Install dependencies:
```bash
npm install
```

2. Set up the database:

Follow the complete setup guide in [SUPABASE_SETUP.md](./SUPABASE_SETUP.md) to:
- Create a Supabase project
- Run database migrations
- Configure environment variables

Quick setup:
```bash
# Copy environment template
cp .env.local.example .env.local

# Edit .env.local with your Supabase credentials
# Get them from: https://app.supabase.com/project/_/settings/api
```

3. Verify database setup:
```bash
npm run verify-db
```

This will check your database connection, schema, and sample data.

4. Run the development server:
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## Project Structure

```
widget-marketplace/
├── app/                    # Next.js App Router pages
│   ├── layout.tsx         # Root layout with metadata & fonts
│   ├── page.tsx           # Home page with Hero section
│   ├── widgets/[id]/      # Widget detail pages
│   │   └── page.tsx       # Dynamic widget detail page
│   └── globals.css        # Global styles with Aero Glass design tokens
├── components/            # React components
│   ├── ui/                # shadcn/ui base components
│   │   ├── card.tsx       # Card component primitives
│   │   ├── button.tsx     # Button component with variants
│   │   └── badge.tsx      # Badge component
│   ├── glass/             # Aero Glass component library
│   │   ├── GlassCard.tsx  # Glass material card
│   │   ├── GlassButton.tsx # Glass button with ripple effect
│   │   ├── GlassBadge.tsx # Glass badge
│   │   ├── GlassPanel.tsx # Glass panel container
│   │   ├── GlassOrb.tsx   # Circular glass container
│   │   └── GlassMetric.tsx # Glass metric display
│   ├── effects/           # Visual effects components
│   │   ├── LightRays.tsx  # Animated light rays background effect
│   │   ├── GlowRing.tsx   # Rotating glow ring
│   │   └── ReflectionOverlay.tsx # Glass reflection overlay
│   ├── Hero.tsx           # Hero section with stats and CTAs
│   ├── WidgetCard.tsx     # Widget card component for listings
│   ├── WidgetGallery.tsx  # Widget gallery with search
│   ├── PermissionsList.tsx # Permissions display component
│   └── InstallButton.tsx  # Widget installation button
├── lib/                   # Utility libraries
│   ├── utils.ts           # cn() utility for class merging
│   ├── supabase.ts        # Supabase client configuration & types
│   ├── supabase-server.ts # Server-side Supabase client
│   └── database.types.ts  # Database type definitions
├── public/                # Static assets
└── .env.local            # Environment variables (not committed)
```

## Root Layout Configuration

The `app/layout.tsx` file provides the application's root layout with:

### Typography
- **Geist Sans** - Primary font for UI text
- **Geist Mono** - Monospace font for code snippets
- Font optimization with `display: "swap"` for better performance

### Metadata & SEO
- Dynamic page titles with template: `%s | Molecool`
- SEO-optimized description and keywords
- Open Graph tags for social media sharing
- Responsive viewport configuration

### Theme Support
- Adaptive theme colors for light/dark mode
- Light mode: `#ffffff`
- Dark mode: `#000000`

## Pages

### Widget Detail Page (`app/widgets/[id]/page.tsx`)

Dynamic page that displays comprehensive information about a specific widget.

**Features:**
- **SEO Optimization**: Dynamic metadata generation with Open Graph tags for social sharing
- **Error Handling**: Graceful error handling with try-catch wrapper and 404 page for missing widgets
- **Null Safety**: Safe handling of optional fields (sizes.default, display_name, etc.)
- **Responsive Layout**: Two-column layout with widget details and sidebar
- **Rich Information Display**:
  - Widget icon with fallback gradient
  - Full description and about section
  - Permissions list with detailed breakdown
  - Version, author, downloads, and last updated info
  - Default widget size display
- **Installation**: Install button with widget:// protocol support
- **Navigation**: Back to marketplace link

**Implementation Details:**
```typescript
// Server-side data fetching with error handling
async function getWidget(widgetId: string): Promise<Widget | null> {
  try {
    const supabase = createServerClient();
    const { data, error } = await supabase
      .from('widgets')
      .select('*')
      .eq('widget_id', widgetId)
      .single();
    
    if (error) return null;
    return data;
  } catch (error) {
    console.error('Unexpected error:', error);
    return null;
  }
}

// SEO metadata generation
export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const widget = await getWidget(id);
  return {
    title: `${widget.display_name} - Molecool Widget Marketplace`,
    description: widget.description,
    openGraph: { /* ... */ }
  };
}
```

## Pages

### Home Page (`app/page.tsx`)

The home page features a full-screen hero section with dynamic statistics and the widget gallery.

**Features:**
- **Hero Section**: Full viewport height hero with gradient background and floating animations
- **Dynamic Statistics**: Calculates and displays real-time metrics:
  - Widget count from database
  - Total downloads (sum of all widget downloads)
  - Unique developer count (distinct authors)
- **Widget Gallery**: Searchable grid of all available widgets
- **Gradient Background**: Consistent blue gradient (#1e3c72 → #2a5298 → #7e8ba3) across entire page
- **Glass Footer**: Semi-transparent footer with white text and shadow for readability

**Implementation Details:**
```typescript
// Calculate statistics from widget data
const widgetCount = widgets.length;
const downloadCount = widgets.reduce((sum, widget) => sum + (widget.downloads || 0), 0);
const developerCount = new Set(widgets.map(widget => widget.author_name)).size;

// Pass to Hero component
<Hero 
  widgetCount={widgetCount}
  downloadCount={downloadCount}
  developerCount={developerCount}
/>
```

**Layout Structure:**
- Gradient background layer (absolute positioned)
- Hero section (full viewport height)
- Main content with widget gallery (relative z-10)
- Footer with glass styling (relative z-10)

## Components

### Hero

The `Hero` component creates an immersive full-screen landing section with animated statistics and call-to-action buttons.

**Props:**
- `widgetCount: number` - Total number of available widgets
- `downloadCount: number` - Total downloads across all widgets
- `developerCount: number` - Number of unique widget developers

**Features:**
- **Full Viewport Height**: min-h-screen ensures hero fills the screen
- **Gradient Background**: Blue gradient (#1e3c72 → #2a5298 → #7e8ba3) with light rays effect
- **Animated Light Rays**: `LightRays` component with 30% opacity creates dynamic background
- **Floating Main Panel**: `GlassPanel` with 6-second floating animation
- **Large Typography**: 
  - "Molecool" heading at text-7xl with font-light
  - "Desktop Widgets Reimagined" tagline at text-2xl in cyan-300
- **Call-to-Action Buttons**:
  - Primary: "Download Molecool" with rocket emoji
  - Secondary: "Browse Widgets"
- **Statistics Grid**: Three `GlassMetric` components displaying:
  - Widget count with formatted numbers (e.g., "1,234")
  - Total downloads with formatted numbers
  - Developer count with formatted numbers
- **Responsive Layout**: Flexbox centering with proper spacing

**Usage:**
```tsx
import { Hero } from '@/components/Hero';

// In page component
<Hero 
  widgetCount={42}
  downloadCount={15000}
  developerCount={8}
/>
```

**Implementation Details:**
- Uses `GlassPanel` for main content container with `animate-float` class
- Integrates `LightRays` effect for dynamic background animation
- Uses `GlassButton` components for CTAs with primary/secondary variants
- Uses `GlassMetric` components for statistics display
- Numbers formatted with `toLocaleString()` for readability (e.g., 1000 → "1,000")
- Gradient background matches overall page theme for visual consistency
- Content centered with flexbox: `flex items-center justify-center`

### GlassButton

The `GlassButton` component is an Aero Glass styled button with ripple effects and hover animations.

**Props:**
- `variant?: 'primary' | 'secondary'` - Button style variant (default: 'primary')
- `size?: 'default' | 'sm' | 'lg' | 'icon'` - Button size (inherited from shadcn/ui Button)
- `children: React.ReactNode` - Button content
- `disabled?: boolean` - Disabled state
- `asChild?: boolean` - Render as child element (Radix UI pattern)
- All standard HTML button attributes

**Features:**
- **Primary Variant**: Cyan-to-blue gradient background with strong glow shadow
- **Secondary Variant**: Transparent with subtle white tint and minimal glow
- **Ripple Effect**: Animated ripple on click that expands from click point (600ms duration)
- **Hover Animation**: Lifts button (-0.5px translateY) and scales (1.05x) with enhanced glow
- **Top Highlight**: Subtle white gradient line at top edge for depth
- **Text Readability**: Text shadow (0 1px 3px rgba(0,0,0,0.3)) ensures legibility on glass backgrounds
- **Performance Optimization**: Uses will-change-transform for smooth animations
- **Accessibility**: Respects disabled state, prevents ripple when disabled
- **Memory Management**: Cleans up ripple timeouts on unmount to prevent memory leaks

**Usage:**
```tsx
import { GlassButton } from '@/components/glass/GlassButton';

// Primary button with glow
<GlassButton variant="primary" onClick={handleClick}>
  Download Molecool
</GlassButton>

// Secondary button with subtle styling
<GlassButton variant="secondary" size="lg">
  Browse Widgets
</GlassButton>

// Disabled state
<GlassButton disabled>
  Coming Soon
</GlassButton>
```

**Implementation Details:**
- Extends shadcn/ui `Button` component for accessibility and base functionality
- Uses React state to manage ripple animations with unique IDs
- Ripples are positioned absolutely at click coordinates
- Automatic cleanup of ripple elements after animation completes
- Uses CSS custom properties from globals.css for consistent styling

### GlassBadge

The `GlassBadge` component is an Aero Glass styled badge for displaying tags, labels, and metadata.

**Props:**
- `icon?: React.ReactNode` - Optional icon to display before the badge text
- `children: React.ReactNode` - Badge content (text or elements)
- `className?: string` - Additional CSS classes to merge
- All standard HTML div attributes

**Features:**
- **Glass Material**: Semi-transparent background (white/10) with backdrop blur
- **Depth Effect**: Inset highlight shadow creates subtle 3D appearance
- **Icon Support**: Optional icon prefix with proper spacing
- **Hover State**: Brightens to white/20 on hover with smooth transition
- **Accessibility**: Icons marked with aria-hidden="true" for screen readers
- **Flexible Styling**: Supports className merging for custom variants

**Usage:**
```tsx
import { GlassBadge } from '@/components/glass/GlassBadge';

// Simple text badge
<GlassBadge>New</GlassBadge>

// Badge with icon
<GlassBadge icon={<StarIcon />}>
  Featured
</GlassBadge>

// Custom styling
<GlassBadge className="text-cyan-300">
  v2.0.0
</GlassBadge>
```

**Implementation Details:**
- Extends shadcn/ui `Badge` component for base functionality
- Uses glass material system with backdrop-blur-sm
- Inset shadow: `inset 0 1px 0 rgba(255,255,255,0.4)` for top highlight
- Outer shadow: `0 2px 8px rgba(0,0,0,0.2)` for depth
- 200ms transition for smooth hover effects
- Icon wrapper uses inline-flex for proper alignment

### GlassPanel

The `GlassPanel` component is a versatile container with Aero Glass styling for grouping content sections.

**Props:**
- `children: React.ReactNode` - Panel content
- `className?: string` - Additional CSS classes to merge
- All standard HTML div attributes

**Features:**
- **Glass Surface**: Uses the `.glass-surface` utility class for consistent glass material
- **Reflection Overlay**: Built-in top-left reflection gradient for depth
- **Rounded Corners**: Default rounded-xl border radius
- **Default Padding**: 24px (p-6) padding with customizable override
- **Content Layering**: Content automatically positioned above reflection overlay (z-10)
- **Flexible Styling**: Supports className merging for custom layouts

**Usage:**
```tsx
import { GlassPanel } from '@/components/glass/GlassPanel';

// Basic panel
<GlassPanel>
  <h2>Panel Title</h2>
  <p>Panel content goes here</p>
</GlassPanel>

// Custom padding
<GlassPanel className="p-8">
  <div>More spacious content</div>
</GlassPanel>

// Sticky sidebar panel
<GlassPanel className="sticky top-6">
  <nav>Navigation items</nav>
</GlassPanel>
```

**Implementation Details:**
- Uses `glass-surface` utility class for backdrop blur and glass material
- Includes `.glass-reflection` overlay with aria-hidden="true" for accessibility
- Content wrapper with relative z-10 positioning ensures proper layering
- Overflow hidden to contain reflection overlay within rounded corners
- Supports React.forwardRef for ref forwarding to underlying div

### LightRays

The `LightRays` component creates an animated background effect with rotating light rays emanating from the center.

**Props:**
- `opacity?: number` - Ray opacity (default: 0.3, range: 0-1)
- `rayCount?: number` - Number of rays to render (default: 8)

**Features:**
- **Dynamic Ray Generation**: Renders configurable number of rays with even rotation distribution
- **Cyan Gradient**: Each ray uses a vertical gradient from transparent → cyan → transparent
- **Staggered Animation**: Each ray pulses with a 0.3s delay offset for wave effect
- **Performance Optimized**: Uses React.memo to prevent unnecessary re-renders
- **Non-Interactive**: pointer-events: none allows interaction with underlying content
- **Accessible**: Marked with aria-hidden="true" as purely decorative element

**Usage:**
```tsx
import { LightRays } from '@/components/effects/LightRays';

// Default configuration (8 rays, 30% opacity)
<div className="relative">
  <LightRays />
  <div>Your content here</div>
</div>

// Custom configuration
<LightRays opacity={0.5} rayCount={12} />

// Hero section example
<section className="relative min-h-screen">
  <div className="absolute inset-0 bg-gradient-to-b from-[#1e3c72] to-[#7e8ba3]" />
  <LightRays opacity={0.3} rayCount={8} />
  <div className="relative z-10">
    {/* Hero content */}
  </div>
</section>
```

**Implementation Details:**
- Rotation calculated as `360 / rayCount` degrees per ray
- Animation: `ray-pulse 4s ease-in-out infinite` with staggered delays
- Gradient: `linear-gradient(to bottom, transparent 0%, rgba(0, 212, 255, opacity) 50%, transparent 100%)`
- Each ray is absolutely positioned with `inset-0` and rotated via inline styles
- Container uses `overflow-hidden` to clip rays at viewport edges
- Memoized to prevent re-renders when parent components update

### WidgetCard

The `WidgetCard` component displays a widget in an Aero Glass styled card with advanced hover effects and metadata.

**Props:**
- `widget: Widget` - Widget data from the database

**Features:**
- **Glass Material**: Uses `GlassCard` component with backdrop blur and semi-transparent background
- **Aero Title Bar**: 8px cyan-to-blue gradient bar at the top edge
- **Glass Orb Icon**: Widget icon wrapped in `GlassOrb` component with reflection overlay
- **Hover Effects**: 
  - Lifts card -12px with 1.02x scale
  - Cyan glow shadow appears
  - Rotating `GlowRing` effect becomes visible
  - Title text transitions to cyan-300
- **Smooth Animations**: 400ms transitions with cubic-bezier(0.34, 1.56, 0.64, 1) easing
- **Metadata Display**: Author, downloads, and version with accessible icons
- **Responsive Layout**: Flexbox layout with proper text truncation
- **Accessibility**: 
  - Semantic link wrapper with aria-label
  - Screen reader text for icon meanings
  - Decorative elements marked with aria-hidden

**Usage:**
```tsx
import { WidgetCard } from '@/components/WidgetCard';

// Display widget in gallery
<WidgetCard widget={widgetData} />

// In a grid layout
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
  {widgets.map(widget => (
    <WidgetCard key={widget.widget_id} widget={widget} />
  ))}
</div>
```

**Implementation Details:**
- Extends `GlassCard` component for consistent glass material system
- Uses `GlassOrb` with 'sm' size (48px) for icon container
- Includes `GlowRing` effect that activates on hover via group classes
- `ReflectionOverlay` adds depth to the icon orb
- Memoized with `React.memo` to prevent unnecessary re-renders
- Fallback gradient icon uses first letter of widget name when no icon_url provided

### PermissionsList

Displays the permissions required by a widget in a user-friendly format.

**Props:**
- `permissions: Widget['permissions']` - Permissions object from widget config

**Features:**
- Categorized permission display (System Info, Network)
- Visual indicators for each permission type
- Handles empty/undefined permissions gracefully

### InstallButton

Button component that triggers widget installation via the widget:// protocol.

**Props:**
- `widgetId: string` - Unique identifier of the widget to install

**Features:**
- Opens widget://install/{widgetId} URL
- Styled with primary action button design
- Requires Molecool Widget Container to be installed

## Supabase Client

The `lib/supabase.ts` file exports:

- `supabase` - Configured Supabase client instance
- `Widget` - TypeScript interface for the widgets table (from `lib/database.types.ts`)

### Widget Types

The `lib/database.types.ts` file provides TypeScript types for database operations:

```typescript
// Full widget row from database
type Widget = Database['public']['Tables']['widgets']['Row'];

// Type for inserting new widgets (id, created_at, updated_at are optional)
type WidgetInsert = Database['public']['Tables']['widgets']['Insert'];

// Type for updating widgets (excludes id and created_at - immutable fields)
type WidgetUpdate = Database['public']['Tables']['widgets']['Update'];
```

**Widget Interface:**

```typescript
interface Widget {
  id: string;                    // UUID primary key
  widget_id: string;             // Unique widget identifier
  name: string;                  // Internal name
  display_name: string;          // User-facing name
  description: string;           // Widget description
  author_name: string;           // Author name
  author_email: string;          // Author email
  version: string;               // Semantic version
  downloads: number;             // Download count
  permissions: {                 // Required permissions
    systemInfo?: {
      cpu?: boolean;
      memory?: boolean;
    };
    network?: {
      enabled?: boolean;
      allowedDomains?: string[];
    };
  };
  sizes: {                       // Widget dimensions
    default: {
      width: number;
      height: number;
    };
    min?: {
      width: number;
      height: number;
    };
    max?: {
      width: number;
      height: number;
    };
  };
  icon_url?: string;             // Widget icon URL
  download_url: string;          // Download package URL
  created_at: string;            // Creation timestamp (immutable)
  updated_at: string;            // Last update timestamp
}
```

**Type Safety Notes:**
- `WidgetInsert` makes `id`, `created_at`, `updated_at`, and `icon_url` optional for new records
- `WidgetUpdate` excludes `id` and `created_at` to prevent modification of immutable fields
- All types are derived from the database schema for consistency

### Usage Example

```typescript
import { supabase, Widget } from '@/lib/supabase';

// Fetch all widgets
const { data, error } = await supabase
  .from('widgets')
  .select('*');

// Type-safe widget data
const widgets: Widget[] = data || [];
```

## Database Schema

The marketplace uses a `widgets` table in Supabase with the following schema:

```sql
CREATE TABLE widgets (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  widget_id VARCHAR(255) UNIQUE NOT NULL,
  name VARCHAR(255) NOT NULL,
  display_name VARCHAR(255) NOT NULL,
  description TEXT,
  author_name VARCHAR(255),
  author_email VARCHAR(255),
  version VARCHAR(50) NOT NULL,
  downloads INTEGER DEFAULT 0,
  permissions JSONB,
  sizes JSONB,
  icon_url TEXT,
  download_url TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

## Testing

The marketplace uses **Vitest** with React Testing Library for unit and integration tests.

### Test Configuration

**Test Environment:**
- **Vitest** - Fast unit test framework
- **happy-dom** - Lightweight DOM implementation for testing
- **@testing-library/react** - React component testing utilities
- **@testing-library/jest-dom** - Custom matchers for DOM assertions

**Configuration Files:**
- `vitest.config.ts` - Vitest configuration with React plugin and path aliases
- `vitest.setup.ts` - Global test setup (imports jest-dom matchers)

### Running Tests

```bash
# Run all tests once
npm test

# Run tests in watch mode (development)
npm test -- --watch

# Run tests with coverage
npm test -- --coverage

# Run specific test file
npm test -- WidgetCard.test.tsx
```

### Writing Tests

Tests are located in the `__tests__/` directory. Example test structure:

```typescript
import { render, screen } from '@testing-library/react';
import { WidgetCard } from '@/components/WidgetCard';

describe('WidgetCard', () => {
  it('renders widget information', () => {
    const widget = {
      widget_id: 'clock',
      display_name: 'Clock Widget',
      description: 'A simple clock',
      // ... other fields
    };
    
    render(<WidgetCard widget={widget} />);
    
    expect(screen.getByText('Clock Widget')).toBeInTheDocument();
  });
});
```

**Path Aliases:**
- Use `@/` to import from the project root (configured in `vitest.config.ts`)
- Example: `import { supabase } from '@/lib/supabase'`

## Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm start` - Start production server
- `npm run lint` - Run ESLint
- `npm test` - Run tests with Vitest
- `npm run verify-db` - Verify Supabase database setup

## Deployment

The marketplace is designed to be deployed on Vercel:

1. Push your code to GitHub
2. Import the project in Vercel
3. Configure environment variables in Vercel dashboard
4. Deploy

## License

Part of the Molecool Desktop Widget Platform project.
