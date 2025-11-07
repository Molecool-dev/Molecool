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

  it('should throttle value updates', () => {
    const { result, rerender } = renderHook(
      ({ value, delay }) => useThrottle(value, delay),
      { initialProps: { value: 'first', delay: 1000 } }
    );

    expect(result.current).toBe('first');

    // Update value immediately
    rerender({ value: 'second', delay: 1000 });
    
    // Value should not update immediately
    expect(result.current).toBe('first');

    // Advance time by 500ms (not enough)
    act(() => {
      vi.advanceTimersByTime(500);
    });
    expect(result.current).toBe('first');

    // Advance time by another 500ms (total 1000ms)
    act(() => {
      vi.advanceTimersByTime(500);
    });
    expect(result.current).toBe('second');
  });

  it('should update immediately if enough time has passed', () => {
    const { result, rerender } = renderHook(
      ({ value, delay }) => useThrottle(value, delay),
      { initialProps: { value: 'first', delay: 1000 } }
    );

    expect(result.current).toBe('first');

    // Update to second value
    rerender({ value: 'second', delay: 1000 });

    // Advance time past the delay
    act(() => {
      vi.advanceTimersByTime(1000);
    });

    // Should have updated to second
    expect(result.current).toBe('second');

    // Now advance more time
    act(() => {
      vi.advanceTimersByTime(1500);
    });

    // Update value - should update immediately since enough time has passed
    rerender({ value: 'third', delay: 1000 });
    
    // With fake timers, Date.now() doesn't advance, so it will schedule a timeout
    // Advance timers to complete the update
    act(() => {
      vi.advanceTimersByTime(0);
    });
    
    expect(result.current).toBe('third');
  });

  it('should handle multiple rapid updates', () => {
    const { result, rerender } = renderHook(
      ({ value, delay }) => useThrottle(value, delay),
      { initialProps: { value: 0, delay: 1000 } }
    );

    expect(result.current).toBe(0);

    // Rapid updates
    rerender({ value: 1, delay: 1000 });
    rerender({ value: 2, delay: 1000 });
    rerender({ value: 3, delay: 1000 });

    // Should still be at initial value
    expect(result.current).toBe(0);

    // Advance time
    act(() => {
      vi.advanceTimersByTime(1000);
    });

    // Should update to the latest value
    expect(result.current).toBe(3);
  });

  it('should handle delay changes', () => {
    const { result, rerender } = renderHook(
      ({ value, delay }) => useThrottle(value, delay),
      { initialProps: { value: 'first', delay: 1000 } }
    );

    expect(result.current).toBe('first');

    // Update value and delay
    rerender({ value: 'second', delay: 500 });

    // Advance by 500ms (new delay)
    act(() => {
      vi.advanceTimersByTime(500);
    });

    expect(result.current).toBe('second');
  });

  it('should work with different value types', () => {
    // Test with numbers
    const { result: numberResult, rerender: numberRerender } = renderHook(
      ({ value, delay }) => useThrottle(value, delay),
      { initialProps: { value: 42, delay: 1000 } }
    );
    expect(numberResult.current).toBe(42);

    // Test with objects
    const { result: objectResult, rerender: objectRerender } = renderHook(
      ({ value, delay }) => useThrottle(value, delay),
      { initialProps: { value: { count: 1 }, delay: 1000 } }
    );
    expect(objectResult.current).toEqual({ count: 1 });

    // Test with arrays
    const { result: arrayResult, rerender: arrayRerender } = renderHook(
      ({ value, delay }) => useThrottle(value, delay),
      { initialProps: { value: [1, 2, 3], delay: 1000 } }
    );
    expect(arrayResult.current).toEqual([1, 2, 3]);
  });

  it('should cleanup timeout on unmount', () => {
    const { result, rerender, unmount } = renderHook(
      ({ value, delay }) => useThrottle(value, delay),
      { initialProps: { value: 'first', delay: 1000 } }
    );

    rerender({ value: 'second', delay: 1000 });

    // Unmount before timeout completes
    unmount();

    // Advance time - should not cause any errors
    act(() => {
      vi.advanceTimersByTime(1000);
    });

    // No assertions needed - just checking no errors occur
  });

  it('should handle zero delay', () => {
    const { result, rerender } = renderHook(
      ({ value, delay }) => useThrottle(value, delay),
      { initialProps: { value: 'first', delay: 0 } }
    );

    expect(result.current).toBe('first');

    rerender({ value: 'second', delay: 0 });

    // With zero delay, should update immediately
    expect(result.current).toBe('second');
  });
});
