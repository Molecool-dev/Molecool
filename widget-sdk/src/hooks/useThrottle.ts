/**
 * useThrottle Hook
 * 
 * A hook that throttles a value, only updating it at most once per specified delay.
 * Useful for performance optimization when dealing with frequently changing values.
 */

import { useState, useEffect, useRef } from 'react';

/**
 * Hook to throttle a value
 * 
 * @param value - The value to throttle
 * @param delay - Minimum delay in milliseconds between updates
 * @returns The throttled value
 * 
 * @example
 * ```tsx
 * function SearchInput() {
 *   const [searchTerm, setSearchTerm] = useState('');
 *   const throttledSearchTerm = useThrottle(searchTerm, 500);
 *   
 *   useEffect(() => {
 *     // This will only run at most once every 500ms
 *     performSearch(throttledSearchTerm);
 *   }, [throttledSearchTerm]);
 *   
 *   return (
 *     <input
 *       value={searchTerm}
 *       onChange={(e) => setSearchTerm(e.target.value)}
 *     />
 *   );
 * }
 * ```
 * 
 * @example
 * ```tsx
 * function SystemMonitor() {
 *   const cpuUsage = useSystemInfo('cpu', 100); // Updates every 100ms
 *   const throttledCPU = useThrottle(cpuUsage, 1000); // Display updates every 1s
 *   
 *   return <div>CPU: {throttledCPU}%</div>;
 * }
 * ```
 */
export function useThrottle<T>(value: T, delay: number): T {
  const [throttledValue, setThrottledValue] = useState<T>(value);
  const lastRan = useRef<number>(Date.now());
  const timeoutRef = useRef<number | null>(null);

  useEffect(() => {
    // Clear any existing timeout
    if (timeoutRef.current !== null) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }

    // Calculate time since last update
    const timeSinceLastRan = Date.now() - lastRan.current;

    if (timeSinceLastRan >= delay) {
      // Enough time has passed, update immediately
      setThrottledValue(value);
      lastRan.current = Date.now();
    } else {
      // Not enough time has passed, schedule update
      timeoutRef.current = window.setTimeout(() => {
        setThrottledValue(value);
        lastRan.current = Date.now();
        timeoutRef.current = null;
      }, delay - timeSinceLastRan) as unknown as number;
    }

    return () => {
      if (timeoutRef.current !== null) {
        clearTimeout(timeoutRef.current);
        timeoutRef.current = null;
      }
    };
  }, [value, delay]);

  return throttledValue;
}
