/**
 * useWidgetAPI Hook
 * 
 * Provides access to the Widget API context.
 * Must be used within a WidgetProvider.
 */

import { useContext } from 'react';
import { WidgetContext, type WidgetAPIContext } from '../core/WidgetAPI';

/**
 * Hook to access the Widget API
 * 
 * @returns The complete Widget API context
 * @throws Error if used outside of WidgetProvider
 * 
 * @example
 * ```tsx
 * function MyWidget() {
 *   const api = useWidgetAPI();
 *   
 *   const handleSave = async () => {
 *     await api.storage.set('key', 'value');
 *   };
 *   
 *   return <button onClick={handleSave}>Save</button>;
 * }
 * ```
 */
export function useWidgetAPI(): WidgetAPIContext {
  const context = useContext(WidgetContext);
  
  if (!context) {
    throw new Error(
      'useWidgetAPI must be used within a WidgetProvider. ' +
      'Make sure your component is wrapped with <WidgetProvider>.'
    );
  }
  
  return context;
}
