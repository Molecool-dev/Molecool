import { contextBridge, ipcRenderer } from 'electron';

/**
 * Preload script for the Widget Manager window
 * Provides a secure bridge between the renderer process and main process
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

// Expose protected methods that allow the renderer process to use
// ipcRenderer without exposing the entire object
contextBridge.exposeInMainWorld('managerAPI', {
  // Widget management APIs will be implemented in later tasks
  widgets: {
    getInstalled: async () => {
      return handleIPCResponse(ipcRenderer.invoke('widgets:getInstalled'));
    },
    getRunning: async () => {
      return handleIPCResponse(ipcRenderer.invoke('widgets:getRunning'));
    },
    create: async (widgetId: string) => {
      return handleIPCResponse(ipcRenderer.invoke('widgets:create', widgetId));
    },
    close: async (instanceId: string) => {
      return handleIPCResponse(ipcRenderer.invoke('widgets:close', instanceId));
    }
  },

  // Event listeners
  onWidgetStateChange: (callback: (state: any) => void) => {
    ipcRenderer.on('widget:stateChanged', (_event, state) => callback(state));
  }
});

// Type definitions for TypeScript support in renderer
export interface ManagerAPI {
  widgets: {
    getInstalled: () => Promise<any[]>;
    getRunning: () => Promise<any[]>;
    create: (widgetId: string) => Promise<string>;
    close: (instanceId: string) => Promise<void>;
  };
  onWidgetStateChange: (callback: (state: any) => void) => void;
}

declare global {
  interface Window {
    managerAPI: ManagerAPI;
  }
}
