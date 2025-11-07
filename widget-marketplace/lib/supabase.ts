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

// Create a single supabase client for interacting with your database
// In Next.js 13+ App Router, this is safe as each request gets its own module scope
export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: false, // Disable session persistence for server-side usage
  },
});

// Re-export types for convenience
export type { Database, WidgetPermissions, WidgetSizes } from './database.types';

// Widget type alias for easier usage
export type Widget = Database['public']['Tables']['widgets']['Row'];
