/**
 * useInterval Hook
 * 
 * A declarative interval hook that handles cleanup automatically.
 * Based on Dan Abramov's blog post: https://overreacted.io/making-setinterval-declarative-with-react-hooks/
 */

import { useEffect, useRef } from 'react';

/**
 * Hook to run a callback function at a specified interval
 * 
 * @param callback - Function to call at each interval
 * @param delay - Delay in milliseconds, or null to pause the interval
 * 
 * @example
 * ```tsx
 * function Clock() {
 *   const [time, setTime] = useState(new Date());
 *   
 *   // Update time every second
 *   useInterval(() => {
 *     setTime(new Date());
 *   }, 1000);
 *   
 *   return <div>{time.toLocaleTimeString()}</div>;
 * }
 * ```
 * 
 * @example
 * ```tsx
 * function PausableTimer() {
 *   const [count, setCount] = useState(0);
 *   const [isPaused, setIsPaused] = useState(false);
 *   
 *   // Pass null to pause the interval
 *   useInterval(() => {
 *     setCount(c => c + 1);
 *   }, isPaused ? null : 1000);
 *   
 *   return (
 *     <div>
 *       <div>Count: {count}</div>
 *       <button onClick={() => setIsPaused(!isPaused)}>
 *         {isPaused ? 'Resume' : 'Pause'}
 *       </button>
 *     </div>
 *   );
 * }
 * ```
 */
export function useInterval(callback: () => void, delay: number | null): void {
  const savedCallback = useRef(callback);

  // Remember the latest callback if it changes
  useEffect(() => {
    savedCallback.current = callback;
  }, [callback]);

  // Set up the interval
  useEffect(() => {
    // Don't schedule if delay is null
    if (delay === null) {
      return;
    }

    const id = setInterval(() => {
      savedCallback.current();
    }, delay);

    // Clean up on unmount or when delay changes
    return () => clearInterval(id);
  }, [delay]);
}
