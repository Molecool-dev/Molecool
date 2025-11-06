/**
 * useSystemInfo Hook
 * 
 * Provides reactive access to system information (CPU and memory).
 * Automatically refreshes at the specified interval.
 * Requires appropriate permissions in widget.config.json.
 */

import { useState, useEffect } from 'react';
import { useWidgetAPI } from './useWidgetAPI';
import { useInterval } from './useInterval';
import type { SystemMemoryInfo } from '../core/WidgetAPI';

/**
 * Hook for accessing CPU usage information
 * 
 * @param refreshInterval - Refresh interval in milliseconds (default: 2000ms)
 * @returns Current CPU usage percentage (0-100) or null if not yet loaded
 * 
 * @example
 * ```tsx
 * function CPUMonitor() {
 *   const cpuUsage = useSystemInfo('cpu', 2000);
 *   
 *   if (cpuUsage === null) {
 *     return <div>Loading...</div>;
 *   }
 *   
 *   return (
 *     <div>
 *       <div>CPU Usage: {cpuUsage.toFixed(1)}%</div>
 *       <ProgressBar value={cpuUsage} />
 *     </div>
 *   );
 * }
 * ```
 */
export function useSystemInfo(
  type: 'cpu',
  refreshInterval?: number
): number | null;

/**
 * Hook for accessing memory information
 * 
 * @param refreshInterval - Refresh interval in milliseconds (default: 2000ms)
 * @returns Current memory information or null if not yet loaded
 * 
 * @example
 * ```tsx
 * function MemoryMonitor() {
 *   const memoryInfo = useSystemInfo('memory', 2000);
 *   
 *   if (!memoryInfo) {
 *     return <div>Loading...</div>;
 *   }
 *   
 *   const usedGB = (memoryInfo.used / 1024 / 1024 / 1024).toFixed(1);
 *   const totalGB = (memoryInfo.total / 1024 / 1024 / 1024).toFixed(1);
 *   
 *   return (
 *     <div>
 *       <div>Memory: {usedGB} GB / {totalGB} GB</div>
 *       <ProgressBar value={memoryInfo.usagePercent} />
 *     </div>
 *   );
 * }
 * ```
 */
export function useSystemInfo(
  type: 'memory',
  refreshInterval?: number
): SystemMemoryInfo | null;

/**
 * Implementation
 */
export function useSystemInfo(
  type: 'cpu' | 'memory',
  refreshInterval: number = 2000
): number | SystemMemoryInfo | null {
  const { system } = useWidgetAPI();
  const [data, setData] = useState<number | SystemMemoryInfo | null>(null);
  const [error, setError] = useState<Error | null>(null);

  // Fetch function
  const fetchSystemInfo = async () => {
    try {
      const result = type === 'cpu' 
        ? await system.getCPU()
        : await system.getMemory();
      
      setData(result);
      setError(null);
    } catch (err) {
      const error = err instanceof Error ? err : new Error(String(err));
      console.error(`[useSystemInfo] Failed to fetch ${type} info:`, error);
      setError(error);
      
      // Don't clear data on error - keep showing last known value
    }
  };

  // Fetch immediately on mount and when type changes
  useEffect(() => {
    fetchSystemInfo();
  }, [type]);

  // Set up interval for periodic updates
  useInterval(() => {
    fetchSystemInfo();
  }, refreshInterval);

  // If there's an error and no data, we could throw or return null
  // For now, we return null and log the error
  if (error && data === null) {
    // Error will be logged in fetchSystemInfo
    return null;
  }

  return data;
}
