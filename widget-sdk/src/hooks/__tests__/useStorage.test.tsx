/**
 * Tests for useStorage hook
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import React from 'react';
import { useStorage } from '../useStorage';
import { WidgetProvider } from '../../core/WidgetAPI';

describe('useStorage', () => {
  const wrapper = ({ children }: { children: React.ReactNode }) => (
    <WidgetProvider>{children}</WidgetProvider>
  );

  it('should return default value initially', async () => {
    const { result } = renderHook(() => useStorage('test-key', 'default-value'), {
      wrapper,
    });

    await waitFor(() => {
      expect(result.current[0]).toBe('default-value');
    });
  });

  it('should set and get value', async () => {
    const { result } = renderHook(() => useStorage<string>('test-key-2'), {
      wrapper,
    });

    // Initially undefined
    await waitFor(() => {
      expect(result.current[0]).toBeUndefined();
    });

    // Set value
    await result.current[1]('new-value');

    await waitFor(() => {
      expect(result.current[0]).toBe('new-value');
    });
  });

  it('should update value in storage', async () => {
    const key = 'persist-test';
    
    const { result } = renderHook(() => useStorage<string>(key), {
      wrapper,
    });

    // Wait for initial load
    await waitFor(() => {
      expect(result.current[0]).toBeUndefined();
    });

    // Set value
    await result.current[1]('persisted-value');

    // Wait for state to update
    await waitFor(() => {
      expect(result.current[0]).toBe('persisted-value');
    });
  });

  it('should remove value and reset to default', async () => {
    const { result } = renderHook(() => useStorage<string>('remove-test', 'default'), {
      wrapper,
    });

    await waitFor(() => {
      expect(result.current[0]).toBe('default');
    });

    // Set a value
    await result.current[1]('some-value');

    await waitFor(() => {
      expect(result.current[0]).toBe('some-value');
    });

    // Remove value - should reset to default
    await result.current[2]();

    await waitFor(() => {
      expect(result.current[0]).toBe('default');
    });
  });

  it('should handle complex objects', async () => {
    interface TestData {
      name: string;
      count: number;
      items: string[];
    }

    const testData: TestData = {
      name: 'test',
      count: 42,
      items: ['a', 'b', 'c'],
    };

    const { result } = renderHook(() => useStorage<TestData>('object-test'), {
      wrapper,
    });

    await waitFor(() => {
      expect(result.current[0]).toBeUndefined();
    });

    await result.current[1](testData);

    await waitFor(() => {
      expect(result.current[0]).toEqual(testData);
    });
  });

  it('should handle arrays', async () => {
    const testArray = [1, 2, 3, 4, 5];

    const { result } = renderHook(() => useStorage<number[]>('array-test', []), {
      wrapper,
    });

    await waitFor(() => {
      expect(result.current[0]).toEqual([]);
    });

    await result.current[1](testArray);

    await waitFor(() => {
      expect(result.current[0]).toEqual(testArray);
    });
  });

  it('should update state when value is set', async () => {
    const { result } = renderHook(() => useStorage<number>('immediate-test', 0), {
      wrapper,
    });

    await waitFor(() => {
      expect(result.current[0]).toBe(0);
    });

    // Set value
    await result.current[1](42);

    // State should be updated
    await waitFor(() => {
      expect(result.current[0]).toBe(42);
    });
  });
});
