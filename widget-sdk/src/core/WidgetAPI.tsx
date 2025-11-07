/**
 * Core Widget API
 * 
 * This module provides the main API interface for widgets to interact with
 * the Widget Container. It includes:
 * - Storage API for persistent data
 * - Settings API for widget configuration
 * - System API for system information
 * - UI API for window management
 */

import React, { createContext, useMemo } from 'react';
import type { WidgetConfig, SystemMemoryInfo, WidgetAPIBridge } from '../types/window';
import { ErrorBoundary } from '../components/ErrorBoundary';
import { WidgetError, toWidgetError } from '../types/errors';

// ============================================================================
// API Interfaces
// ============================================================================

/**
 * Storage API - Persistent key-value storage for widget data
 */
export interface StorageAPI {
  /**
   * Get a value from storage
   * @param key - Storage key
   * @returns Promise resolving to the stored value or undefined
   */
  get<T = any>(key: string): Promise<T | undefined>;
  
  /**
   * Set a value in storage
   * @param key - Storage key
   * @param value - Value to store (must be JSON-serializable)
   */
  set<T = any>(key: string, value: T): Promise<void>;
  
  /**
   * Remove a value from storage
   * @param key - Storage key
   */
  remove(key: string): Promise<void>;
}

/**
 * Settings API - Read-only access to widget settings
 */
export interface SettingsAPI {
  /**
   * Get a specific setting value
   * @param key - Setting key
   * @returns Promise resolving to the setting value or undefined
   */
  get<T = any>(key: string): Promise<T | undefined>;
  
  /**
   * Get all settings
   * @returns Promise resolving to all settings as a key-value object
   */
  getAll(): Promise<Record<string, any>>;
}

/**
 * System API - Access to system information (requires permissions)
 */
export interface SystemAPI {
  /**
   * Get current CPU usage percentage
   * @returns Promise resolving to CPU usage (0-100)
   * @requires permission: systemInfo.cpu
   */
  getCPU(): Promise<number>;
  
  /**
   * Get current memory information
   * @returns Promise resolving to memory info object
   * @requires permission: systemInfo.memory
   */
  getMemory(): Promise<SystemMemoryInfo>;
}

/**
 * UI API - Control widget window appearance
 */
export interface UIAPI {
  /**
   * Resize the widget window
   * @param width - New width in pixels
   * @param height - New height in pixels
   */
  resize(width: number, height: number): Promise<void>;
  
  /**
   * Set the widget window position
   * @param x - X coordinate in pixels
   * @param y - Y coordinate in pixels
   */
  setPosition(x: number, y: number): Promise<void>;
}

/**
 * Complete Widget API Context
 */
export interface WidgetAPIContext {
  storage: StorageAPI;
  settings: SettingsAPI;
  system: SystemAPI;
  ui: UIAPI;
  widgetId: string;
  config: WidgetConfig;
}

// ============================================================================
// React Context
// ============================================================================

/**
 * React Context for Widget API
 */
export const WidgetContext = createContext<WidgetAPIContext | null>(null);

// ============================================================================
// Mock API for Development Mode
// ============================================================================

/**
 * Create a mock API for development/testing without Electron
 */
export function createMockAPI(): WidgetAPIContext {
  // In-memory storage for mock mode
  const mockStorage = new Map<string, any>();
  const mockSettings = new Map<string, any>([
    ['city', 'Taipei'],
    ['theme', 'dark'],
    ['refreshInterval', 2000],
  ]);

  const mockAPI: WidgetAPIContext = {
    storage: {
      async get<T = any>(key: string): Promise<T | undefined> {
        console.log('[Mock Storage] get:', key);
        return mockStorage.get(key) as T | undefined;
      },
      
      async set<T = any>(key: string, value: T): Promise<void> {
        console.log('[Mock Storage] set:', key, value);
        mockStorage.set(key, value);
      },
      
      async remove(key: string): Promise<void> {
        console.log('[Mock Storage] remove:', key);
        mockStorage.delete(key);
      },
    },

    settings: {
      async get<T = any>(key: string): Promise<T | undefined> {
        console.log('[Mock Settings] get:', key);
        return mockSettings.get(key) as T | undefined;
      },
      
      async getAll(): Promise<Record<string, any>> {
        console.log('[Mock Settings] getAll');
        return Object.fromEntries(mockSettings);
      },
    },

    system: {
      async getCPU(): Promise<number> {
        // Simulate CPU usage between 10-80%
        const usage = Math.floor(Math.random() * 70) + 10;
        console.log('[Mock System] getCPU:', usage);
        return usage;
      },
      
      async getMemory(): Promise<SystemMemoryInfo> {
        // Simulate memory info (8GB total, 60% used)
        const total = 8 * 1024 * 1024 * 1024; // 8GB in bytes
        const usagePercent = Math.floor(Math.random() * 40) + 40; // 40-80%
        const used = Math.floor(total * (usagePercent / 100));
        const free = total - used;
        
        const memoryInfo: SystemMemoryInfo = {
          total,
          used,
          free,
          usagePercent,
        };
        
        console.log('[Mock System] getMemory:', memoryInfo);
        return memoryInfo;
      },
    },

    ui: {
      async resize(width: number, height: number): Promise<void> {
        console.log('[Mock UI] resize:', width, height);
        // In browser mode, we can't actually resize the window
        // but we can log the request
      },
      
      async setPosition(x: number, y: number): Promise<void> {
        console.log('[Mock UI] setPosition:', x, y);
        // In browser mode, we can't actually move the window
        // but we can log the request
      },
    },

    widgetId: 'mock-widget-dev',
    
    config: {
      id: 'mock-widget-dev',
      name: 'mock-widget',
      displayName: 'Mock Widget (Development)',
      version: '1.0.0',
      description: 'Development mode mock widget',
      author: {
        name: 'Developer',
        email: 'dev@example.com',
      },
      permissions: {
        systemInfo: {
          cpu: true,
          memory: true,
        },
        network: {
          enabled: true,
          allowedDomains: ['*'],
        },
      },
      sizes: {
        default: {
          width: 300,
          height: 200,
        },
      },
      entryPoint: 'index.html',
    },
  };

  return mockAPI;
}

// ============================================================================
// Bridge to Electron API
// ============================================================================

/**
 * Create the real API that bridges to window.widgetAPI (Electron)
 * Wraps all API calls with proper error handling
 */
function createElectronAPI(bridge: WidgetAPIBridge): WidgetAPIContext {
  const widgetId = bridge.widgetId;
  
  return {
    storage: {
      async get<T = any>(key: string): Promise<T | undefined> {
        try {
          return await bridge.storage.get(key);
        } catch (error) {
          throw toWidgetError(error, widgetId);
        }
      },
      
      async set<T = any>(key: string, value: T): Promise<void> {
        try {
          return await bridge.storage.set(key, value);
        } catch (error) {
          throw toWidgetError(error, widgetId);
        }
      },
      
      async remove(key: string): Promise<void> {
        try {
          return await bridge.storage.remove(key);
        } catch (error) {
          throw toWidgetError(error, widgetId);
        }
      },
    },

    settings: {
      async get<T = any>(key: string): Promise<T | undefined> {
        try {
          return await bridge.settings.get(key);
        } catch (error) {
          throw toWidgetError(error, widgetId);
        }
      },
      
      async getAll(): Promise<Record<string, any>> {
        try {
          return await bridge.settings.getAll();
        } catch (error) {
          throw toWidgetError(error, widgetId);
        }
      },
    },

    system: {
      async getCPU(): Promise<number> {
        try {
          return await bridge.system.getCPU();
        } catch (error) {
          throw toWidgetError(error, widgetId);
        }
      },
      
      async getMemory(): Promise<SystemMemoryInfo> {
        try {
          return await bridge.system.getMemory();
        } catch (error) {
          throw toWidgetError(error, widgetId);
        }
      },
    },

    ui: {
      async resize(width: number, height: number): Promise<void> {
        try {
          return await bridge.ui.resize(width, height);
        } catch (error) {
          throw toWidgetError(error, widgetId);
        }
      },
      
      async setPosition(x: number, y: number): Promise<void> {
        try {
          return await bridge.ui.setPosition(x, y);
        } catch (error) {
          throw toWidgetError(error, widgetId);
        }
      },
    },

    widgetId: bridge.widgetId,
    config: bridge.widgetConfig,
  };
}

// ============================================================================
// Widget Provider Component
// ============================================================================

export interface WidgetProviderProps {
  children: React.ReactNode;
}

/**
 * WidgetProvider - Provides the Widget API to all child components
 * 
 * This component automatically detects whether it's running in:
 * - Electron environment (uses window.widgetAPI)
 * - Development/browser environment (uses mock API)
 * 
 * Includes an ErrorBoundary to catch and handle React errors gracefully.
 * 
 * @example
 * ```tsx
 * import { WidgetProvider } from '@molecule/widget-sdk';
 * 
 * function App() {
 *   return (
 *     <WidgetProvider>
 *       <MyWidget />
 *     </WidgetProvider>
 *   );
 * }
 * ```
 * 
 * @example With custom error handler
 * ```tsx
 * <WidgetProvider
 *   onError={(error) => {
 *     console.error('Widget error:', error);
 *     // Send to error tracking service
 *   }}
 * >
 *   <MyWidget />
 * </WidgetProvider>
 * ```
 */
export const WidgetProvider: React.FC<WidgetProviderProps & {
  onError?: (error: WidgetError) => void;
}> = ({ children, onError }) => {
  const api = useMemo(() => {
    // Check if we're running in Electron with the widget API bridge
    if (typeof window !== 'undefined' && window.widgetAPI) {
      console.log('[WidgetProvider] Using Electron API bridge');
      return createElectronAPI(window.widgetAPI);
    }
    
    // Development mode: use mock API
    console.log('[WidgetProvider] Using mock API (development mode)');
    return createMockAPI();
  }, []);

  return (
    <ErrorBoundary
      onError={(error, errorInfo) => {
        // Log error with component stack
        console.error('[WidgetProvider] Error caught by boundary:', {
          error: error.toJSON(),
          componentStack: errorInfo.componentStack
        });
        
        // Call custom error handler if provided
        if (onError) {
          onError(error);
        }
      }}
    >
      <WidgetContext.Provider value={api}>
        {children}
      </WidgetContext.Provider>
    </ErrorBoundary>
  );
};

// ============================================================================
// Exports
// ============================================================================

export type {
  WidgetConfig,
  SystemMemoryInfo,
  WidgetAPIBridge,
} from '../types/window';
