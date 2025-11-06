import { contextBridge, ipcRenderer } from 'electron';

/**
 * Preload script for Widget windows
 * Provides a secure API bridge for widgets to interact with the main process
 */

/**
 * Helper function to handle IPC responses
 * Extracts data from success responses or throws errors
 */
async function handleIPCResponse<T>(promise: Promise<any>): Promise<T> {
  const response = await promise;
  
  if (response.success === false && response.error) {
    const error = new Error(response.error.message);
    (error as any).type = response.error.type;
    throw error;
  }
  
  return response.data !== undefined ? response.data : response;
}

// Expose protected methods for widgets
contextBridge.exposeInMainWorld('widgetAPI', {
  // Storage API
  storage: {
    get: async (key: string) => {
      return handleIPCResponse(ipcRenderer.invoke('storage:get', key));
    },
    set: async (key: string, value: any) => {
      return handleIPCResponse(ipcRenderer.invoke('storage:set', key, value));
    },
    remove: async (key: string) => {
      return handleIPCResponse(ipcRenderer.invoke('storage:remove', key));
    }
  },

  // Settings API (read-only)
  settings: {
    get: async (key: string) => {
      return handleIPCResponse(ipcRenderer.invoke('settings:get', key));
    },
    getAll: async () => {
      return handleIPCResponse(ipcRenderer.invoke('settings:getAll'));
    }
  },

  // System API
  system: {
    getCPU: async () => {
      return handleIPCResponse(ipcRenderer.invoke('system:getCPU'));
    },
    getMemory: async () => {
      return handleIPCResponse(ipcRenderer.invoke('system:getMemory'));
    }
  },

  // UI API
  ui: {
    resize: async (width: number, height: number) => {
      return handleIPCResponse(ipcRenderer.invoke('ui:resize', width, height));
    },
    setPosition: async (x: number, y: number) => {
      return handleIPCResponse(ipcRenderer.invoke('ui:setPosition', x, y));
    },
    savePosition: async () => {
      return handleIPCResponse(ipcRenderer.invoke('ui:savePosition'));
    }
  },

  // Get current window bounds (for dragging)
  getCurrentBounds: async () => {
    return handleIPCResponse(ipcRenderer.invoke('ui:getBounds'));
  },

  // Widget metadata (will be injected by main process)
  widgetId: '',
  widgetConfig: {}
});

// Type definitions for TypeScript support
export interface WidgetAPI {
  storage: {
    get: <T = any>(key: string) => Promise<T | undefined>;
    set: <T = any>(key: string, value: T) => Promise<void>;
    remove: (key: string) => Promise<void>;
  };
  settings: {
    get: <T = any>(key: string) => Promise<T | undefined>;
    getAll: () => Promise<Record<string, any>>;
  };
  system: {
    getCPU: () => Promise<number>;
    getMemory: () => Promise<{
      total: number;
      used: number;
      free: number;
      usagePercent: number;
    }>;
  };
  ui: {
    resize: (width: number, height: number) => Promise<void>;
    setPosition: (x: number, y: number) => Promise<void>;
    savePosition: () => Promise<void>;
  };
  getCurrentBounds: () => Promise<{ x: number; y: number; width: number; height: number }>;
  widgetId: string;
  widgetConfig: any;
}

declare global {
  interface Window {
    widgetAPI: WidgetAPI;
  }
}
