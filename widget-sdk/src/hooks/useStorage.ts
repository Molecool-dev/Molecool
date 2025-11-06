/**
 * useStorage Hook
 * 
 * Provides reactive access to widget storage with automatic state synchronization.
 */

import { useState, useEffect, useCallback } from 'react';
import { useWidgetAPI } from './useWidgetAPI';

/**
 * Hook for reactive storage access
 * 
 * @param key - Storage key
 * @param defaultValue - Default value if key doesn't exist
 * @returns Tuple of [value, setValue, removeValue]
 * 
 * @example
 * ```tsx
 * function Counter() {
 *   const [count, setCount, removeCount] = useStorage<number>('count', 0);
 *   
 *   return (
 *     <div>
 *       <div>Count: {count}</div>
 *       <button onClick={() => setCount((count || 0) + 1)}>
 *         Increment
 *       </button>
 *       <button onClick={removeCount}>
 *         Reset
 *       </button>
 *     </div>
 *   );
 * }
 * ```
 * 
 * @example
 * ```tsx
 * function TodoList() {
 *   const [todos, setTodos] = useStorage<string[]>('todos', []);
 *   
 *   const addTodo = (text: string) => {
 *     setTodos([...(todos || []), text]);
 *   };
 *   
 *   return (
 *     <div>
 *       {todos?.map((todo, i) => <div key={i}>{todo}</div>)}
 *     </div>
 *   );
 * }
 * ```
 */
export function useStorage<T = any>(
  key: string,
  defaultValue?: T
): [T | undefined, (value: T) => Promise<void>, () => Promise<void>] {
  const { storage } = useWidgetAPI();
  const [value, setValue] = useState<T | undefined>(defaultValue);

  // Load initial value from storage
  useEffect(() => {
    let isMounted = true;

    const loadValue = async () => {
      try {
        const storedValue = await storage.get<T>(key);
        
        if (isMounted) {
          // Use stored value if it exists, otherwise use default
          setValue(storedValue !== undefined ? storedValue : defaultValue);
        }
      } catch (error) {
        console.error(`[useStorage] Failed to load value for key "${key}":`, error);
        
        if (isMounted) {
          setValue(defaultValue);
        }
      }
    };

    loadValue();

    return () => {
      isMounted = false;
    };
  }, [key]); // Only re-run if key changes

  /**
   * Update the value in both state and storage
   */
  const updateValue = useCallback(
    async (newValue: T) => {
      try {
        // Update local state immediately for responsive UI
        setValue(newValue);
        
        // Persist to storage
        await storage.set(key, newValue);
      } catch (error) {
        console.error(`[useStorage] Failed to set value for key "${key}":`, error);
        throw error;
      }
    },
    [key, storage]
  );

  /**
   * Remove the value from both state and storage
   */
  const removeValue = useCallback(async () => {
    try {
      // Update local state immediately
      setValue(defaultValue);
      
      // Remove from storage
      await storage.remove(key);
    } catch (error) {
      console.error(`[useStorage] Failed to remove value for key "${key}":`, error);
      throw error;
    }
  }, [key, storage, defaultValue]);

  return [value, updateValue, removeValue];
}
