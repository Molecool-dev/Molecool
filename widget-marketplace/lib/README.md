# Supabase Client Library

Supabase client configuration with full TypeScript support for the Widget Marketplace.

## Files

- **`supabase.ts`** - Client-side singleton
- **`supabase-server.ts`** - Server-side client factory
- **`database.types.ts`** - Database schema types

## Usage

### Client Components

```typescript
'use client';
import { supabase, type Widget } from '@/lib/supabase';

// Use supabase client directly
const { data } = await supabase.from('widgets').select('*');
```

### Server Components & API Routes

```typescript
import { createServerClient } from '@/lib/supabase-server';

const supabase = createServerClient();
const { data } = await supabase.from('widgets').select('*');
```

## Environment Variables

Required in `.env.local`:

```bash
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
```

## Testing

```bash
# Run integration test
node lib/tests/integration-test.js

# Validate types
npx tsc --noEmit lib/tests/validate-types.ts
```
