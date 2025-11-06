/**
 * Type definitions for the Widget API exposed by the Electron preload script
 * via contextBridge.
 */

export interface WidgetConfig {
  id: string;
  name: string;
  displayName: string;
  version: string;
  description: string;
  author: {
    name: string;
    email: string;
  };
  permissions: {
    systemInfo: {
      cpu: boolean;
      memory: boolean;
    };
    network: {
      enabled: boolean;
      allowedDomains?: string[];
    };
  };
  sizes: {
    default: {
      width: number;
      height: number;
    };
    min?: {
      width: number;
      height: number;
    };
    max?: {
      width: number;
      height: number;
    };
  };
  entryPoint: string;
}

export interface SystemMemoryInfo {
  total: number;
  used: number;
  free: number;
  usagePercent: number;
}

export interface WidgetAPIBridge {
  storage: {
    get: (key: string) => Promise<any>;
    set: (key: string, value: any) => Promise<void>;
    remove: (key: string) => Promise<void>;
  };
  settings: {
    get: (key: string) => Promise<any>;
    getAll: () => Promise<Record<string, any>>;
  };
  system: {
    getCPU: () => Promise<number>;
    getMemory: () => Promise<SystemMemoryInfo>;
  };
  ui: {
    resize: (width: number, height: number) => Promise<void>;
    setPosition: (x: number, y: number) => Promise<void>;
  };
  widgetId: string;
  widgetConfig: WidgetConfig;
}

declare global {
  interface Window {
    widgetAPI?: WidgetAPIBridge;
  }
}

export {};
