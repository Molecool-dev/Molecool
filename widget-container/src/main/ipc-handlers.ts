import { ipcMain, BrowserWindow } from 'electron';
import { StorageManager } from './storage';
import { WidgetErrorType, WidgetConfig } from '../types';
import { WidgetManager } from './widget-manager';
import { WindowController } from './window-controller';
import { SystemAPI } from './system-api';
import { PermissionsManager } from './permissions';

/**
 * Standard IPC response format
 */
interface IPCResponse<T = any> {
  success: boolean;
  data?: T;
  error?: {
    type: WidgetErrorType;
    message: string;
  };
}

/**
 * IPC Handlers
 * Handles all IPC communication between renderer and main process
 * Implements secure communication bridge with error handling
 */

export class IPCHandlers {
  private storageManager: StorageManager;
  private widgetManager: WidgetManager | null = null;
  private systemAPI: SystemAPI;
  private permissionsManager: PermissionsManager;

  constructor(
    storageManager: StorageManager,
    systemAPI?: SystemAPI,
    permissionsManager?: PermissionsManager
  ) {
    this.storageManager = storageManager;
    this.systemAPI = systemAPI || new SystemAPI();
    this.permissionsManager = permissionsManager || new PermissionsManager(storageManager);
  }

  /**
   * Set the widget manager instance
   * This is called after the widget manager is created in main.ts
   */
  setWidgetManager(widgetManager: WidgetManager): void {
    this.widgetManager = widgetManager;
  }

  /**
   * Clean up resources
   * Should be called when the app is shutting down
   */
  destroy(): void {
    this.permissionsManager.destroy();
  }

  /**
   * Register all IPC handlers
   * Sets up all communication channels between renderer and main process
   */
  registerHandlers(): void {
    // Storage handlers
    ipcMain.handle('storage:get', this.handleStorageGet.bind(this));
    ipcMain.handle('storage:set', this.handleStorageSet.bind(this));
    ipcMain.handle('storage:remove', this.handleStorageRemove.bind(this));

    // Settings handlers
    ipcMain.handle('settings:get', this.handleSettingsGet.bind(this));
    ipcMain.handle('settings:getAll', this.handleSettingsGetAll.bind(this));

    // System handlers (placeholders for Task 15)
    ipcMain.handle('system:getCPU', this.handleSystemGetCPU.bind(this));
    ipcMain.handle('system:getMemory', this.handleSystemGetMemory.bind(this));

    // UI handlers
    ipcMain.handle('ui:resize', this.handleUIResize.bind(this));
    ipcMain.handle('ui:setPosition', this.handleUISetPosition.bind(this));
    ipcMain.handle('ui:getBounds', this.handleUIGetBounds.bind(this));
    ipcMain.handle('ui:savePosition', this.handleUISavePosition.bind(this));

    // Widget management handlers (placeholders for Task 11)
    ipcMain.handle('widgets:getInstalled', this.handleWidgetsGetInstalled.bind(this));
    ipcMain.handle('widgets:getRunning', this.handleWidgetsGetRunning.bind(this));
    ipcMain.handle('widgets:create', this.handleWidgetsCreate.bind(this));
    ipcMain.handle('widgets:close', this.handleWidgetsClose.bind(this));

    console.log('✓ IPC handlers registered successfully');
  }

  /**
   * Get the widget ID from the event sender
   * Extracts the widget ID from the window that sent the IPC message
   */
  private getWidgetIdFromEvent(event: Electron.IpcMainInvokeEvent): string {
    const window = this.getWindowFromEvent(event);
    
    if (!window || !this.widgetManager) {
      // Fallback for testing or when widget manager is not initialized
      return 'test-widget';
    }

    // Find the widget instance that owns this window
    const runningWidgets = this.widgetManager.getRunningWidgets();
    const widget = runningWidgets.find(w => w.window === window);
    
    if (widget) {
      return widget.widgetId;
    }

    // Fallback if widget not found
    console.warn('Could not determine widget ID from event, using fallback');
    return 'test-widget';
  }

  /**
   * Get widget name from widget ID
   * Used for permission dialogs
   */
  private getWidgetNameFromId(widgetId: string): string {
    if (!this.widgetManager) {
      return widgetId;
    }

    const runningWidgets = this.widgetManager.getRunningWidgets();
    const widget = runningWidgets.find(w => w.widgetId === widgetId);
    
    return widget?.config.displayName || widgetId;
  }

  /**
   * Get the BrowserWindow from the event
   */
  private getWindowFromEvent(event: Electron.IpcMainInvokeEvent): BrowserWindow | null {
    return BrowserWindow.fromWebContents(event.sender);
  }

  // ============================================================================
  // Storage Handlers
  // ============================================================================

  /**
   * Handle storage:get - Retrieve data from storage
   */
  private async handleStorageGet(event: Electron.IpcMainInvokeEvent, key: string): Promise<IPCResponse> {
    try {
      if (!key || typeof key !== 'string') {
        throw new Error('Invalid key: must be a non-empty string');
      }

      const widgetId = this.getWidgetIdFromEvent(event);
      const value = this.storageManager.getWidgetData(widgetId, key);
      
      return {
        success: true,
        data: value
      };
    } catch (error: any) {
      console.error('Storage get failed:', error);
      return {
        success: false,
        error: {
          type: WidgetErrorType.STORAGE_ERROR,
          message: error.message
        }
      };
    }
  }

  /**
   * Handle storage:set - Store data
   */
  private async handleStorageSet(event: Electron.IpcMainInvokeEvent, key: string, value: any): Promise<IPCResponse> {
    try {
      if (!key || typeof key !== 'string') {
        throw new Error('Invalid key: must be a non-empty string');
      }

      const widgetId = this.getWidgetIdFromEvent(event);
      this.storageManager.setWidgetData(widgetId, key, value);
      
      return {
        success: true
      };
    } catch (error: any) {
      console.error('Storage set failed:', error);
      return {
        success: false,
        error: {
          type: WidgetErrorType.STORAGE_ERROR,
          message: error.message
        }
      };
    }
  }

  /**
   * Handle storage:remove - Delete data from storage
   */
  private async handleStorageRemove(event: Electron.IpcMainInvokeEvent, key: string): Promise<IPCResponse> {
    try {
      if (!key || typeof key !== 'string') {
        throw new Error('Invalid key: must be a non-empty string');
      }

      const widgetId = this.getWidgetIdFromEvent(event);
      this.storageManager.deleteWidgetData(widgetId, key);
      
      return {
        success: true
      };
    } catch (error: any) {
      console.error('Storage remove failed:', error);
      return {
        success: false,
        error: {
          type: WidgetErrorType.STORAGE_ERROR,
          message: error.message
        }
      };
    }
  }

  // ============================================================================
  // Settings Handlers
  // ============================================================================

  /**
   * Handle settings:get - Get a specific setting
   * Settings are read-only for widgets
   */
  private async handleSettingsGet(event: Electron.IpcMainInvokeEvent, key: string): Promise<IPCResponse> {
    try {
      if (!key || typeof key !== 'string') {
        throw new Error('Invalid key: must be a non-empty string');
      }

      const widgetId = this.getWidgetIdFromEvent(event);
      // Settings are stored in the same storage as widget data
      // but in a special 'settings' namespace
      const value = this.storageManager.getWidgetData(widgetId, `settings.${key}`);
      
      return {
        success: true,
        data: value
      };
    } catch (error: any) {
      console.error('Settings get failed:', error);
      return {
        success: false,
        error: {
          type: WidgetErrorType.STORAGE_ERROR,
          message: error.message
        }
      };
    }
  }

  /**
   * Handle settings:getAll - Get all settings
   */
  private async handleSettingsGetAll(_event: Electron.IpcMainInvokeEvent): Promise<IPCResponse<Record<string, any>>> {
    try {
      // For now, return empty object
      // In a full implementation, we'd scan all keys with 'settings.' prefix
      
      return {
        success: true,
        data: {}
      };
    } catch (error: any) {
      console.error('Settings getAll failed:', error);
      return {
        success: false,
        error: {
          type: WidgetErrorType.STORAGE_ERROR,
          message: error.message
        }
      };
    }
  }

  // ============================================================================
  // System Handlers
  // ============================================================================

  /**
   * Handle system:getCPU - Get CPU usage
   * Returns CPU usage information including usage percentage and core count
   * Implements permission checking and rate limiting
   * Requirements: 4.5, 8.4, 8.5
   */
  private async handleSystemGetCPU(event: Electron.IpcMainInvokeEvent): Promise<IPCResponse> {
    try {
      const widgetId = this.getWidgetIdFromEvent(event);
      const widgetName = this.getWidgetNameFromId(widgetId);
      
      // Check if widget has permission
      if (!this.permissionsManager.hasPermission(widgetId, 'systemInfo.cpu')) {
        // Request permission from user
        const granted = await this.permissionsManager.requestPermission({
          widgetId,
          widgetName,
          permission: 'systemInfo.cpu',
          reason: 'This widget needs access to CPU usage information to display system monitoring data.'
        });
        
        if (!granted) {
          return {
            success: false,
            error: {
              type: WidgetErrorType.PERMISSION_DENIED,
              message: 'CPU access permission denied by user'
            }
          };
        }
      }
      
      // Check rate limit
      if (!this.permissionsManager.checkRateLimit(widgetId, 'system:getCPU')) {
        return {
          success: false,
          error: {
            type: WidgetErrorType.RATE_LIMIT_EXCEEDED,
            message: 'Too many requests. Please slow down.'
          }
        };
      }
      
      // Get CPU usage (return just the percentage, not the full object)
      const cpuUsage = await this.systemAPI.getCPUUsage();
      const cpuPercent = Math.round(cpuUsage * 100) / 100;
      
      return {
        success: true,
        data: cpuPercent
      };
    } catch (error: any) {
      console.error('System getCPU failed:', error);
      return {
        success: false,
        error: {
          type: error.type || WidgetErrorType.PERMISSION_DENIED,
          message: error.message
        }
      };
    }
  }

  /**
   * Handle system:getMemory - Get memory info
   * Returns memory usage information including total, used, free, and usage percentage
   * Implements permission checking and rate limiting
   * Requirements: 4.5, 8.4, 8.5
   */
  private async handleSystemGetMemory(event: Electron.IpcMainInvokeEvent): Promise<IPCResponse> {
    try {
      const widgetId = this.getWidgetIdFromEvent(event);
      const widgetName = this.getWidgetNameFromId(widgetId);
      
      // Check if widget has permission
      if (!this.permissionsManager.hasPermission(widgetId, 'systemInfo.memory')) {
        // Request permission from user
        const granted = await this.permissionsManager.requestPermission({
          widgetId,
          widgetName,
          permission: 'systemInfo.memory',
          reason: 'This widget needs access to memory usage information to display system monitoring data.'
        });
        
        if (!granted) {
          return {
            success: false,
            error: {
              type: WidgetErrorType.PERMISSION_DENIED,
              message: 'Memory access permission denied by user'
            }
          };
        }
      }
      
      // Check rate limit
      if (!this.permissionsManager.checkRateLimit(widgetId, 'system:getMemory')) {
        return {
          success: false,
          error: {
            type: WidgetErrorType.RATE_LIMIT_EXCEEDED,
            message: 'Too many requests. Please slow down.'
          }
        };
      }
      
      // Get memory info
      const memoryInfo = this.systemAPI.getMemoryInfo();
      
      return {
        success: true,
        data: memoryInfo
      };
    } catch (error: any) {
      console.error('System getMemory failed:', error);
      return {
        success: false,
        error: {
          type: error.type || WidgetErrorType.PERMISSION_DENIED,
          message: error.message
        }
      };
    }
  }

  // ============================================================================
  // UI Handlers
  // ============================================================================

  /**
   * Handle ui:resize - Resize the widget window
   */
  private async handleUIResize(event: Electron.IpcMainInvokeEvent, width: number, height: number): Promise<IPCResponse> {
    try {
      // Validate input types
      if (typeof width !== 'number' || typeof height !== 'number') {
        throw new Error('Width and height must be numbers');
      }

      if (!Number.isFinite(width) || !Number.isFinite(height)) {
        throw new Error('Width and height must be finite numbers');
      }

      const window = this.getWindowFromEvent(event);
      
      if (!window) {
        throw new Error('Window not found');
      }

      // Validate dimensions
      if (width < 100 || height < 100) {
        throw new Error('Window dimensions must be at least 100x100');
      }

      if (width > 2000 || height > 2000) {
        throw new Error('Window dimensions must not exceed 2000x2000');
      }

      window.setSize(Math.round(width), Math.round(height));
      
      return {
        success: true
      };
    } catch (error: any) {
      console.error('UI resize failed:', error);
      return {
        success: false,
        error: {
          type: WidgetErrorType.INVALID_CONFIG,
          message: error.message
        }
      };
    }
  }

  /**
   * Handle ui:setPosition - Move the widget window
   */
  private async handleUISetPosition(event: Electron.IpcMainInvokeEvent, x: number, y: number): Promise<IPCResponse> {
    try {
      // Validate input types
      if (typeof x !== 'number' || typeof y !== 'number') {
        throw new Error('X and Y must be numbers');
      }

      if (!Number.isFinite(x) || !Number.isFinite(y)) {
        throw new Error('X and Y must be finite numbers');
      }

      const window = this.getWindowFromEvent(event);
      
      if (!window) {
        throw new Error('Window not found');
      }

      window.setPosition(Math.round(x), Math.round(y));
      
      return {
        success: true
      };
    } catch (error: any) {
      console.error('UI setPosition failed:', error);
      return {
        success: false,
        error: {
          type: WidgetErrorType.INVALID_CONFIG,
          message: error.message
        }
      };
    }
  }

  /**
   * Handle ui:getBounds - Get current window bounds
   */
  private async handleUIGetBounds(event: Electron.IpcMainInvokeEvent): Promise<IPCResponse> {
    try {
      const window = this.getWindowFromEvent(event);
      
      if (!window) {
        throw new Error('Window not found');
      }

      const bounds = window.getBounds();
      
      return {
        success: true,
        data: bounds
      };
    } catch (error: any) {
      console.error('UI getBounds failed:', error);
      return {
        success: false,
        error: {
          type: WidgetErrorType.INVALID_CONFIG,
          message: error.message
        }
      };
    }
  }

  /**
   * Handle ui:savePosition - Save widget position to storage
   * This is called after dragging stops to persist the new position
   */
  private async handleUISavePosition(event: Electron.IpcMainInvokeEvent): Promise<IPCResponse> {
    try {
      const window = this.getWindowFromEvent(event);
      
      if (!window) {
        throw new Error('Window not found');
      }

      const widgetId = this.getWidgetIdFromEvent(event);
      const bounds = window.getBounds();
      
      // For now, we'll save the position using a simple key-value approach
      // In Task 11-12, this will be integrated with proper widget state management
      this.storageManager.setWidgetData(widgetId, 'position', {
        x: bounds.x,
        y: bounds.y
      });
      
      this.storageManager.setWidgetData(widgetId, 'size', {
        width: bounds.width,
        height: bounds.height
      });
      
      console.log(`Saved widget position: (${bounds.x}, ${bounds.y})`);
      
      return {
        success: true
      };
    } catch (error: any) {
      console.error('UI savePosition failed:', error);
      return {
        success: false,
        error: {
          type: WidgetErrorType.STORAGE_ERROR,
          message: error.message
        }
      };
    }
  }

  // ============================================================================
  // Widget Management Handlers (Placeholders for Task 11)
  // ============================================================================

  /**
   * Handle widgets:getInstalled - Get list of installed widgets
   */
  private async handleWidgetsGetInstalled(_event: Electron.IpcMainInvokeEvent): Promise<IPCResponse<WidgetConfig[]>> {
    try {
      if (!this.widgetManager) {
        throw new Error('Widget manager not initialized');
      }

      const installedWidgets = await this.widgetManager.loadInstalledWidgets();
      
      return {
        success: true,
        data: installedWidgets
      };
    } catch (error: any) {
      console.error('Failed to get installed widgets:', error);
      return {
        success: false,
        error: {
          type: WidgetErrorType.STORAGE_ERROR,
          message: error.message
        }
      };
    }
  }

  /**
   * Handle widgets:getRunning - Get list of running widgets
   */
  private async handleWidgetsGetRunning(_event: Electron.IpcMainInvokeEvent): Promise<IPCResponse> {
    try {
      if (!this.widgetManager) {
        throw new Error('Widget manager not initialized');
      }

      const runningWidgets = this.widgetManager.getRunningWidgets();
      
      // Convert to a serializable format (remove window reference)
      const serializedWidgets = runningWidgets.map(widget => ({
        instanceId: widget.instanceId,
        widgetId: widget.widgetId,
        config: widget.config,
        position: widget.position,
        size: widget.size,
        permissions: widget.permissions,
        createdAt: widget.createdAt
      }));
      
      return {
        success: true,
        data: serializedWidgets
      };
    } catch (error: any) {
      console.error('Failed to get running widgets:', error);
      return {
        success: false,
        error: {
          type: WidgetErrorType.STORAGE_ERROR,
          message: error.message
        }
      };
    }
  }

  /**
   * Handle widgets:create - Create a new widget instance
   */
  private async handleWidgetsCreate(_event: Electron.IpcMainInvokeEvent, widgetId: string): Promise<IPCResponse<string>> {
    try {
      if (!widgetId || typeof widgetId !== 'string') {
        throw new Error('Invalid widgetId: must be a non-empty string');
      }

      if (!this.widgetManager) {
        throw new Error('Widget manager not initialized');
      }

      const instanceId = await this.widgetManager.createWidget(widgetId);
      
      // Notify all manager windows about the state change
      this.notifyWidgetStateChange();
      
      return {
        success: true,
        data: instanceId
      };
    } catch (error: any) {
      console.error('Failed to create widget:', error);
      return {
        success: false,
        error: {
          type: WidgetErrorType.WIDGET_CRASHED,
          message: error.message
        }
      };
    }
  }

  /**
   * Handle widgets:close - Close a widget instance
   */
  private async handleWidgetsClose(_event: Electron.IpcMainInvokeEvent, instanceId: string): Promise<IPCResponse> {
    try {
      if (!instanceId || typeof instanceId !== 'string') {
        throw new Error('Invalid instanceId: must be a non-empty string');
      }

      if (!this.widgetManager) {
        throw new Error('Widget manager not initialized');
      }

      await this.widgetManager.closeWidget(instanceId);
      
      // Notify all manager windows about the state change
      this.notifyWidgetStateChange();
      
      return {
        success: true
      };
    } catch (error: any) {
      console.error('Failed to close widget:', error);
      return {
        success: false,
        error: {
          type: WidgetErrorType.WIDGET_CRASHED,
          message: error.message
        }
      };
    }
  }

  /**
   * Notify all manager windows about widget state changes
   */
  private notifyWidgetStateChange(): void {
    const allWindows = BrowserWindow.getAllWindows();
    
    for (const window of allWindows) {
      // Only send to manager windows (not widget windows)
      if (WindowController.isManagerWindow(window)) {
        window.webContents.send('widget:stateChanged', {
          timestamp: new Date().toISOString()
        });
      }
    }
  }
}
