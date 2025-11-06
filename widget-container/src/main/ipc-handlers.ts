import { ipcMain, BrowserWindow } from 'electron';
import { StorageManager } from './storage';
import { WidgetErrorType } from '../types';
import { WidgetManager } from './widget-manager';
import { WindowController } from './window-controller';

/**
 * IPC Handlers
 * Handles all IPC communication between renderer and main process
 * Implements secure communication bridge with error handling
 */

export class IPCHandlers {
  private storageManager: StorageManager;
  private widgetManager: WidgetManager | null = null;

  constructor(storageManager: StorageManager) {
    this.storageManager = storageManager;
  }

  /**
   * Set the widget manager instance
   * This is called after the widget manager is created in main.ts
   */
  setWidgetManager(widgetManager: WidgetManager): void {
    this.widgetManager = widgetManager;
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
   * This will be properly implemented when we have widget instances
   */
  private getWidgetIdFromEvent(event: Electron.IpcMainInvokeEvent): string {
    // For now, return a test widget ID
    // In Task 11, this will extract the actual widget ID from the window
    return 'test-widget';
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
  private async handleStorageGet(event: Electron.IpcMainInvokeEvent, key: string): Promise<any> {
    try {
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
  private async handleStorageSet(event: Electron.IpcMainInvokeEvent, key: string, value: any): Promise<void> {
    try {
      const widgetId = this.getWidgetIdFromEvent(event);
      this.storageManager.setWidgetData(widgetId, key, value);
      
      return {
        success: true
      } as any;
    } catch (error: any) {
      console.error('Storage set failed:', error);
      return {
        success: false,
        error: {
          type: WidgetErrorType.STORAGE_ERROR,
          message: error.message
        }
      } as any;
    }
  }

  /**
   * Handle storage:remove - Delete data from storage
   */
  private async handleStorageRemove(event: Electron.IpcMainInvokeEvent, key: string): Promise<void> {
    try {
      const widgetId = this.getWidgetIdFromEvent(event);
      this.storageManager.deleteWidgetData(widgetId, key);
      
      return {
        success: true
      } as any;
    } catch (error: any) {
      console.error('Storage remove failed:', error);
      return {
        success: false,
        error: {
          type: WidgetErrorType.STORAGE_ERROR,
          message: error.message
        }
      } as any;
    }
  }

  // ============================================================================
  // Settings Handlers
  // ============================================================================

  /**
   * Handle settings:get - Get a specific setting
   * Settings are read-only for widgets
   */
  private async handleSettingsGet(event: Electron.IpcMainInvokeEvent, key: string): Promise<any> {
    try {
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
  private async handleSettingsGetAll(event: Electron.IpcMainInvokeEvent): Promise<Record<string, any>> {
    try {
      const widgetId = this.getWidgetIdFromEvent(event);
      // For now, return empty object
      // In a full implementation, we'd scan all keys with 'settings.' prefix
      
      return {
        success: true,
        data: {}
      } as any;
    } catch (error: any) {
      console.error('Settings getAll failed:', error);
      return {
        success: false,
        error: {
          type: WidgetErrorType.STORAGE_ERROR,
          message: error.message
        }
      } as any;
    }
  }

  // ============================================================================
  // System Handlers (Placeholders for Task 15)
  // ============================================================================

  /**
   * Handle system:getCPU - Get CPU usage
   * Will be fully implemented in Task 15
   */
  private async handleSystemGetCPU(event: Electron.IpcMainInvokeEvent): Promise<number> {
    // Placeholder implementation
    return {
      success: false,
      error: {
        type: WidgetErrorType.PERMISSION_DENIED,
        message: 'System API not yet implemented - will be available in Task 15'
      }
    } as any;
  }

  /**
   * Handle system:getMemory - Get memory info
   * Will be fully implemented in Task 15
   */
  private async handleSystemGetMemory(event: Electron.IpcMainInvokeEvent): Promise<any> {
    // Placeholder implementation
    return {
      success: false,
      error: {
        type: WidgetErrorType.PERMISSION_DENIED,
        message: 'System API not yet implemented - will be available in Task 15'
      }
    };
  }

  // ============================================================================
  // UI Handlers
  // ============================================================================

  /**
   * Handle ui:resize - Resize the widget window
   */
  private async handleUIResize(event: Electron.IpcMainInvokeEvent, width: number, height: number): Promise<void> {
    try {
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

      window.setSize(width, height);
      
      return {
        success: true
      } as any;
    } catch (error: any) {
      console.error('UI resize failed:', error);
      return {
        success: false,
        error: {
          type: WidgetErrorType.INVALID_CONFIG,
          message: error.message
        }
      } as any;
    }
  }

  /**
   * Handle ui:setPosition - Move the widget window
   */
  private async handleUISetPosition(event: Electron.IpcMainInvokeEvent, x: number, y: number): Promise<void> {
    try {
      const window = this.getWindowFromEvent(event);
      
      if (!window) {
        throw new Error('Window not found');
      }

      window.setPosition(Math.round(x), Math.round(y));
      
      return {
        success: true
      } as any;
    } catch (error: any) {
      console.error('UI setPosition failed:', error);
      return {
        success: false,
        error: {
          type: WidgetErrorType.INVALID_CONFIG,
          message: error.message
        }
      } as any;
    }
  }

  /**
   * Handle ui:getBounds - Get current window bounds
   */
  private async handleUIGetBounds(event: Electron.IpcMainInvokeEvent): Promise<any> {
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
  private async handleUISavePosition(event: Electron.IpcMainInvokeEvent): Promise<void> {
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
      } as any;
    } catch (error: any) {
      console.error('UI savePosition failed:', error);
      return {
        success: false,
        error: {
          type: WidgetErrorType.STORAGE_ERROR,
          message: error.message
        }
      } as any;
    }
  }

  // ============================================================================
  // Widget Management Handlers (Placeholders for Task 11)
  // ============================================================================

  /**
   * Handle widgets:getInstalled - Get list of installed widgets
   */
  private async handleWidgetsGetInstalled(event: Electron.IpcMainInvokeEvent): Promise<any[]> {
    try {
      if (!this.widgetManager) {
        throw new Error('Widget manager not initialized');
      }

      const installedWidgets = await this.widgetManager.loadInstalledWidgets();
      
      return {
        success: true,
        data: installedWidgets
      } as any;
    } catch (error: any) {
      console.error('Failed to get installed widgets:', error);
      return {
        success: false,
        error: {
          type: WidgetErrorType.STORAGE_ERROR,
          message: error.message
        }
      } as any;
    }
  }

  /**
   * Handle widgets:getRunning - Get list of running widgets
   */
  private async handleWidgetsGetRunning(event: Electron.IpcMainInvokeEvent): Promise<any[]> {
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
      } as any;
    } catch (error: any) {
      console.error('Failed to get running widgets:', error);
      return {
        success: false,
        error: {
          type: WidgetErrorType.STORAGE_ERROR,
          message: error.message
        }
      } as any;
    }
  }

  /**
   * Handle widgets:create - Create a new widget instance
   */
  private async handleWidgetsCreate(event: Electron.IpcMainInvokeEvent, widgetId: string): Promise<string> {
    try {
      if (!this.widgetManager) {
        throw new Error('Widget manager not initialized');
      }

      const instanceId = await this.widgetManager.createWidget(widgetId);
      
      // Notify all manager windows about the state change
      this.notifyWidgetStateChange();
      
      return {
        success: true,
        data: instanceId
      } as any;
    } catch (error: any) {
      console.error('Failed to create widget:', error);
      return {
        success: false,
        error: {
          type: WidgetErrorType.WIDGET_CRASHED,
          message: error.message
        }
      } as any;
    }
  }

  /**
   * Handle widgets:close - Close a widget instance
   */
  private async handleWidgetsClose(event: Electron.IpcMainInvokeEvent, instanceId: string): Promise<void> {
    try {
      if (!this.widgetManager) {
        throw new Error('Widget manager not initialized');
      }

      await this.widgetManager.closeWidget(instanceId);
      
      // Notify all manager windows about the state change
      this.notifyWidgetStateChange();
      
      return {
        success: true
      } as any;
    } catch (error: any) {
      console.error('Failed to close widget:', error);
      return {
        success: false,
        error: {
          type: WidgetErrorType.WIDGET_CRASHED,
          message: error.message
        }
      } as any;
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
