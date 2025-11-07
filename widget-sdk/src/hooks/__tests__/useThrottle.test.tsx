/**
 * Tests for useThrottle hook
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useThrottle } from '../useThrottle';

describe('useThrottle', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('should return initial value immediately', () => {
    const { result } = renderHook(() => useThrottle('initial', 1000));
    expect(result.current).toBe('initial');
  });

  it('should throttle rapid value changes', () => {
    const { result, rerender } = renderHook(
      ({ value }) => useThrottle(value, 1000),
      { initialProps: { value: 'value1' } }
    );

    expect(result.current).toBe('value1');

    // Change value immediately
    rerender({ value: 'value2' });
    expect(result.current).toBe('value1'); // Still old value

    // Fast-forward 500ms (not enough time)
    act(() => {
      vi.advanceTimersByTime(500);
    });
    expect(result.current).toBe('value1'); // Still old value

    // Fast-forward another 500ms (total 1000ms)
    act(() => {
      vi.advanceTimersByTime(500);
    });
    expect(result.current).toBe('value2'); // Now updated
  });



  it('should handle multiple rapid changes correctly', () => {
    const { result, rerender } = renderHook(
      ({ value }) => useThrottle(value, 1000),
      { initialProps: { value: 1 } }
    );

    expect(result.current).toBe(1);

    // Rapid changes
    rerender({ value: 2 });
    rerender({ value: 3 });
    rerender({ value: 4 });
    expect(result.current).toBe(1); // Still initial value

    // Fast-forward to trigger throttle
    act(() => {
      vi.advanceTimersByTime(1000);
    });
    expect(result.current).toBe(4); // Updated to latest value
  });

  it('should cancel pending updates on unmount', () => {
    const { result, rerender, unmount } = renderHook(
      ({ value }) => useThrottle(value, 1000),
      { initialProps: { value: 'value1' } }
    );

    rerender({ value: 'value2' });
    expect(result.current).toBe('value1');

    // Unmount before throttle completes
    unmount();

    // Fast-forward time
    act(() => {
      vi.advanceTimersByTime(1000);
    });
    // No error should occur (cleanup worked)
  });

  it('should handle delay changes', () => {
    const { result, rerender } = renderHook(
      ({ value, delay }) => useThrottle(value, delay),
      { initialProps: { value: 'value1', delay: 1000 } }
    );

    expect(result.current).toBe('value1');

    // Change value
    rerender({ value: 'value2', delay: 1000 });
    expect(result.current).toBe('value1');

    // Change delay to shorter
    rerender({ value: 'value2', delay: 500 });

    // Fast-forward 500ms
    act(() => {
      vi.advanceTimersByTime(500);
    });
    expect(result.current).toBe('value2');
  });

  it('should work with different data types', () => {
    // Test with objects
    const { result: objResult, rerender: objRerender } = renderHook(
      ({ value }) => useThrottle(value, 1000),
      { initialProps: { value: { count: 1 } } }
    );

    expect(objResult.current).toEqual({ count: 1 });
    objRerender({ value: { count: 2 } });
    act(() => {
      vi.advanceTimersByTime(1000);
    });
    expect(objResult.current).toEqual({ count: 2 });

    // Test with arrays
    const { result: arrResult, rerender: arrRerender } = renderHook(
      ({ value }) => useThrottle(value, 1000),
      { initialProps: { value: [1, 2, 3] } }
    );

    expect(arrResult.current).toEqual([1, 2, 3]);
    arrRerender({ value: [4, 5, 6] });
    act(() => {
      vi.advanceTimersByTime(1000);
    });
    expect(arrResult.current).toEqual([4, 5, 6]);
  });

  it('should clear previous timeout when value changes rapidly', () => {
    const { result, rerender } = renderHook(
      ({ value }) => useThrottle(value, 1000),
      { initialProps: { value: 'value1' } }
    );

    // First change
    rerender({ value: 'value2' });
    act(() => {
      vi.advanceTimersByTime(500);
    });

    // Second change before first completes
    rerender({ value: 'value3' });
    act(() => {
      vi.advanceTimersByTime(500);
    });

    // Should have value3, not value2
    expect(result.current).toBe('value3');
  });

  it('should handle zero delay', () => {
    const { result, rerender } = renderHook(
      ({ value }) => useThrottle(value, 0),
      { initialProps: { value: 'value1' } }
    );

    expect(result.current).toBe('value1');

    rerender({ value: 'value2' });
    expect(result.current).toBe('value2'); // Updates immediately with 0 delay
  });

  it('should maintain throttle timing across multiple updates', () => {
    const { result, rerender } = renderHook(
      ({ value }) => useThrottle(value, 1000),
      { initialProps: { value: 1 } }
    );

    expect(result.current).toBe(1);

    // First update - should throttle
    rerender({ value: 2 });
    expect(result.current).toBe(1); // Still old value

    // Wait for throttle
    act(() => {
      vi.advanceTimersByTime(1000);
    });
    expect(result.current).toBe(2); // Now updated

    // Second update immediately after first completes (should throttle again)
    rerender({ value: 3 });
    expect(result.current).toBe(2); // Still previous value

    // Wait for throttle again
    act(() => {
      vi.advanceTimersByTime(1000);
    });
    expect(result.current).toBe(3); // Now updated to latest
  });
});
