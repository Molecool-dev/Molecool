/**
 * Tests for Supabase client configuration
 * These tests verify type safety and client creation
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';

describe('Supabase Client', () => {
  const originalEnv = process.env;

  beforeEach(() => {
    // Reset modules to ensure fresh imports
    vi.resetModules();
    process.env = { ...originalEnv };
  });

  afterEach(() => {
    process.env = originalEnv;
  });

  it('should throw error when environment variables are missing', async () => {
    delete process.env.NEXT_PUBLIC_SUPABASE_URL;
    delete process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

    await expect(async () => {
      await import('@/lib/supabase');
    }).rejects.toThrow('Missing Supabase environment variables');
  });

  it('should throw error when only URL is missing', async () => {
    delete process.env.NEXT_PUBLIC_SUPABASE_URL;
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = 'test-key';

    await expect(async () => {
      await import('@/lib/supabase');
    }).rejects.toThrow('Missing Supabase environment variables');
  });

  it('should throw error when only key is missing', async () => {
    process.env.NEXT_PUBLIC_SUPABASE_URL = 'https://test.supabase.co';
    delete process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

    await expect(async () => {
      await import('@/lib/supabase');
    }).rejects.toThrow('Missing Supabase environment variables');
  });

  it('should create client when environment variables are set', async () => {
    process.env.NEXT_PUBLIC_SUPABASE_URL = 'https://test.supabase.co';
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = 'test-key';

    const { supabase } = await import('@/lib/supabase');
    expect(supabase).toBeDefined();
    expect(typeof supabase.from).toBe('function');
  });

  it('should export Widget type', async () => {
    process.env.NEXT_PUBLIC_SUPABASE_URL = 'https://test.supabase.co';
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = 'test-key';

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
