/**
 * Tests for useSettings hook
 */

import { describe, it, expect } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import React from 'react';
import { useSettings, useAllSettings } from '../useSettings';
import { WidgetProvider } from '../../core/WidgetAPI';

describe('useSettings', () => {
  const wrapper = ({ children }: { children: React.ReactNode }) => (
    <WidgetProvider>{children}</WidgetProvider>
  );

  it('should return default value when setting does not exist', async () => {
    const { result } = renderHook(
      () => useSettings('nonexistent-key', 'default-value'),
      { wrapper }
    );

    await waitFor(() => {
      expect(result.current).toBe('default-value');
    });
  });

  it('should return mock setting value', async () => {
    // Mock API provides 'city' setting with value 'Taipei'
    const { result } = renderHook(() => useSettings<string>('city'), {
      wrapper,
    });

    await waitFor(() => {
      expect(result.current).toBe('Taipei');
    });
  });

  it('should return theme setting', async () => {
    // Mock API provides 'theme' setting with value 'dark'
    const { result } = renderHook(() => useSettings<string>('theme'), {
      wrapper,
    });

    await waitFor(() => {
      expect(result.current).toBe('dark');
    });
  });

  it('should return refreshInterval setting', async () => {
    // Mock API provides 'refreshInterval' setting with value 2000
    const { result } = renderHook(() => useSettings<number>('refreshInterval'), {
      wrapper,
    });

    await waitFor(() => {
      expect(result.current).toBe(2000);
    });
  });

  it('should handle undefined for missing keys', async () => {
    const { result } = renderHook(() => useSettings('missing-key'), {
      wrapper,
    });

    await waitFor(() => {
      expect(result.current).toBeUndefined();
    });
  });
});

describe('useAllSettings', () => {
  const wrapper = ({ children }: { children: React.ReactNode }) => (
    <WidgetProvider>{children}</WidgetProvider>
  );

  it('should return all settings', async () => {
    const { result } = renderHook(() => useAllSettings(), {
      wrapper,
    });

    await waitFor(() => {
      expect(result.current).toBeDefined();
      expect(result.current.city).toBe('Taipei');
      expect(result.current.theme).toBe('dark');
      expect(result.current.refreshInterval).toBe(2000);
    });
  });

  it('should return object with all mock settings', async () => {
    const { result } = renderHook(() => useAllSettings(), {
      wrapper,
    });

    await waitFor(() => {
      const settings = result.current;
      expect(Object.keys(settings).length).toBeGreaterThan(0);
      expect(settings).toHaveProperty('city');
      expect(settings).toHaveProperty('theme');
      expect(settings).toHaveProperty('refreshInterval');
    });
  });
});
