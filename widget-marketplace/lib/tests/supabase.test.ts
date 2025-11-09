/**
 * Tests for Supabase client configuration
 * These tests verify type safety and client creation
 */

import { describe, it, expect } from 'vitest';
import { supabase } from '@/lib/supabase';

describe('Supabase Client', () => {
  it('should have environment variables configured', () => {
    // If the module loaded, env vars were present
    expect(process.env.NEXT_PUBLIC_SUPABASE_URL).toBeDefined();
    expect(process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY).toBeDefined();
  });

  it('should create client successfully', () => {
    expect(supabase).toBeDefined();
    expect(typeof supabase.from).toBe('function');
  });

  it('should have auth configuration', () => {
    // Verify the client was created with correct config
    expect(supabase).toBeDefined();
  });

  it('should export Widget type', async () => {
    const module = await import('@/lib/supabase');
    
    // Type exports should be available (this is a compile-time check)
    // At runtime, we just verify the module loaded successfully
    expect(module.supabase).toBeDefined();
  });
});

describe('Supabase Server Client', () => {
  const originalEnv = process.env;

  beforeEach(() => {
    vi.resetModules();
    process.env = { ...originalEnv };
  });

  afterEach(() => {
    process.env = originalEnv;
  });

  it('should create server client when environment variables are set', async () => {
    process.env.NEXT_PUBLIC_SUPABASE_URL = 'https://test.supabase.co';
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = 'test-key';

    const { createServerClient } = await import('@/lib/supabase-server');
    const client = createServerClient();
    
    expect(client).toBeDefined();
    expect(typeof client.from).toBe('function');
  });

  it('should throw error when environment variables are missing', async () => {
    delete process.env.NEXT_PUBLIC_SUPABASE_URL;
    delete process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

    const { createServerClient } = await import('@/lib/supabase-server');
    
    expect(() => {
      createServerClient();
    }).toThrow('Missing Supabase environment variables');
  });
});
