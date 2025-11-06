/**
 * Type definitions for the Widget Container
 * These types will be used throughout the application
 */

/**
 * Widget configuration from widget.config.json
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
  permissions: PermissionSet;
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

/**
 * Permission set for a widget
 */
export interface PermissionSet {
  systemInfo: {
    cpu: boolean;
    memory: boolean;
  };
  network: {
    enabled: boolean;
    allowedDomains?: string[];
  };
}

/**
 * Widget instance (running widget)
 */
export interface WidgetInstance {
  instanceId: string;
  widgetId: string;
  configPath: string;
  config: WidgetConfig;
  window: Electron.BrowserWindow | null;
  position: {
    x: number;
    y: number;
  };
  size: {
    width: number;
    height: number;
  };
  permissions: PermissionSet;
  createdAt: Date;
}

/**
 * Widget state for persistence
 */
export interface WidgetState {
  widgetId: string;
  instanceId: string;
  position: {
    x: number;
    y: number;
  };
  size: {
    width: number;
    height: number;
  };
  isRunning: boolean;
  lastActive: string;
  permissions: PermissionSet;
}

/**
 * System information
 */
export interface SystemInfo {
  cpu: {
    usage: number;
    cores: number;
  };
  memory: {
    total: number;
    used: number;
    free: number;
    usagePercent: number;
  };
}

/**
 * Storage schema for electron-store
 */
export interface StoreSchema {
  widgetStates: {
    [instanceId: string]: WidgetState;
  };
  widgetData: {
    [widgetId: string]: {
      [key: string]: any;
    };
  };
  permissions: {
    [widgetId: string]: PermissionSet;
  };
  appSettings: {
    autoRestore: boolean;
    maxWidgets: number;
  };
}

/**
 * Error types
 */
export enum WidgetErrorType {
  PERMISSION_DENIED = 'PERMISSION_DENIED',
  RATE_LIMIT_EXCEEDED = 'RATE_LIMIT_EXCEEDED',
  INVALID_CONFIG = 'INVALID_CONFIG',
  WIDGET_CRASHED = 'WIDGET_CRASHED',
  NETWORK_ERROR = 'NETWORK_ERROR',
  STORAGE_ERROR = 'STORAGE_ERROR'
}

/**
 * Widget error class
 */
export class WidgetError extends Error {
  constructor(
    public type: WidgetErrorType,
    message: string,
    public widgetId?: string
  ) {
    super(message);
    this.name = 'WidgetError';
  }
}
