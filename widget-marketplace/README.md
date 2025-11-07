# Widget Marketplace

The Molecule Widget Marketplace is a Next.js 15 web application that allows users to discover, browse, and install desktop widgets for the Molecule platform.

## Tech Stack

- **Next.js 15** - React framework with App Router
- **TypeScript** - Type-safe development
- **Tailwind CSS 4** - Utility-first CSS framework
- **Supabase** - Backend as a Service (PostgreSQL database)

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
│   ├── page.tsx           # Home page
│   ├── widgets/[id]/      # Widget detail pages
│   │   └── page.tsx       # Dynamic widget detail page
│   └── globals.css        # Global styles
├── components/            # React components
│   ├── WidgetCard.tsx     # Widget card component for listings
│   ├── PermissionsList.tsx # Permissions display component
│   └── InstallButton.tsx  # Widget installation button
├── lib/                   # Utility libraries
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
- Dynamic page titles with template: `%s | Molecule`
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
    title: `${widget.display_name} - Molecule Widget Marketplace`,
    description: widget.description,
    openGraph: { /* ... */ }
  };
}
```

## Components

### WidgetCard

The `WidgetCard` component displays a widget in a card format with hover effects and metadata.

**Props:**
- `widget: Widget` - Widget data from the database

**Features:**
- Responsive card layout with hover effects
- Widget icon display (or fallback gradient with initial)
- Widget name, description, author, downloads, and version
- Click-through to widget detail page
- Dark mode support
- Accessible SVG icons for metadata

**Usage:**
```tsx
import { WidgetCard } from '@/components/WidgetCard';

<WidgetCard widget={widgetData} />
```

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
- Requires Molecule Widget Container to be installed

## Supabase Client

The `lib/supabase.ts` file exports:

- `supabase` - Configured Supabase client instance
- `Widget` - TypeScript interface for the widgets table (from `lib/database.types.ts`)

### Widget Interface

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
  icon_url?: string;
  download_url: string;
  created_at: string;
  updated_at: string;
}
```

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

Part of the Molecule Desktop Widget Platform project.
