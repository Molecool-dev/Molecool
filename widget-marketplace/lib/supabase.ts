import { createClient } from '@supabase/supabase-js';
import type { Database } from './database.types';

// Supabase client configuration
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error(
    'Missing Supabase environment variables. ' +
    'Please configure NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY in .env.local'
  );
}

// Create a single supabase client for client-side usage
// For server-side usage (Server Components, API Routes), use createServerClient() instead
// @deprecated Use createServerClient() for server-side code
export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: false,
  },
});

// Re-export types for convenience
export type { Database, Widget, WidgetInsert, WidgetUpdate, WidgetPermissions, WidgetSizes } from './database.types';
