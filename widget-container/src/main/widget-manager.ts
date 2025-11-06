import { BrowserWindow, app } from 'electron';
import * as path from 'path';
import * as fs from 'fs';
import * as crypto from 'crypto';
import { WidgetConfig, WidgetInstance, WidgetState, WidgetError, WidgetErrorType } from '../types';
import { WindowController } from './window-controller';
import { StorageManager } from './storage';

/**
 * Widget Manager
 * Manages widget lifecycle (creation, closing, state management)
 */

export class WidgetManager {
  private widgets: Map<string, WidgetInstance> = new Map();
  private windowController: WindowController;
  private storageManager: StorageManager;
  private widgetsDirectory: string;

  constructor(windowController: WindowController, storageManager: StorageManager) {
    this.windowController = windowController;
    this.storageManager = storageManager;
    
    // Set widgets directory path (in user data directory)
    this.widgetsDirectory = path.join(app.getPath('userData'), 'widgets');
    
    // Ensure widgets directory exists
    this.ensureWidgetsDirectory();
  }

  /**
   * Ensure the widgets directory exists
   */
  private ensureWidgetsDirectory(): void {
    if (!fs.existsSync(this.widgetsDirectory)) {
      fs.mkdirSync(this.widgetsDirectory, { recursive: true });
      console.log(`Created widgets directory at: ${this.widgetsDirectory}`);
    }
  }

  /**
   * Load installed widgets from the widgets directory
   * Scans the widgets directory and reads widget.config.json from each subdirectory
   */
  async loadInstalledWidgets(): Promise<WidgetConfig[]> {
    const installedWidgets: WidgetConfig[] = [];

    try {
      // Check if widgets directory exists
      if (!fs.existsSync(this.widgetsDirectory)) {
        console.log('Widgets directory does not exist yet');
        return installedWidgets;
      }

      // Read all subdirectories in the widgets directory
      const entries = fs.readdirSync(this.widgetsDirectory, { withFileTypes: true });
      
      for (const entry of entries) {
        if (entry.isDirectory()) {
          const widgetPath = path.join(this.widgetsDirectory, entry.name);
          const configPath = path.join(widgetPath, 'widget.config.json');

          // Check if widget.config.json exists
          if (fs.existsSync(configPath)) {
            try {
              // Read and parse widget.config.json
              const configContent = fs.readFileSync(configPath, 'utf-8');
              const config: WidgetConfig = JSON.parse(configContent);

              // Validate config (basic validation)
              if (this.validateWidgetConfig(config)) {
                installedWidgets.push(config);
                console.log(`Loaded widget: ${config.displayName} (${config.id})`);
              } else {
                console.warn(`Invalid widget config at: ${configPath}`);
              }
            } catch (error) {
              console.error(`Failed to load widget config from ${configPath}:`, error);
            }
          }
        }
      }

      console.log(`Loaded ${installedWidgets.length} installed widgets`);
      return installedWidgets;
    } catch (error) {
      console.error('Failed to load installed widgets:', error);
      throw new WidgetError(
        WidgetErrorType.INVALID_CONFIG,
        'Failed to load installed widgets'
      );
    }
  }

  /**
   * Validate widget configuration
   * Comprehensive validation of widget.config.json structure
   * Requirements: 5.1, 5.2, 5.3, 5.4, 5.5
   */
  private validateWidgetConfig(config: any): config is WidgetConfig {
    // Check if config is an object
    if (!config || typeof config !== 'object') {
      console.error('Widget config must be an object');
      return false;
    }

    // Validate required string fields (5.1, 5.2)
    const requiredStringFields = ['id', 'name', 'displayName', 'version', 'entryPoint'];
    for (const field of requiredStringFields) {
      if (typeof config[field] !== 'string' || config[field].trim() === '') {
        console.error(`Widget config missing or invalid required field: ${field}`);
        return false;
      }
    }

    // Validate optional description field
    if (config.description !== undefined && typeof config.description !== 'string') {
      console.error('Widget config description must be a string');
      return false;
    }

    // Validate author field (5.2)
    if (config.author !== undefined) {
      if (typeof config.author !== 'object') {
        console.error('Widget config author must be an object');
        return false;
      }
      if (config.author.name !== undefined && typeof config.author.name !== 'string') {
        console.error('Widget config author.name must be a string');
        return false;
      }
      if (config.author.email !== undefined && typeof config.author.email !== 'string') {
        console.error('Widget config author.email must be a string');
        return false;
      }
    }

    // Validate permissions structure (5.3)
    if (!this.validatePermissions(config.permissions)) {
      return false;
    }

    // Validate sizes structure (5.4)
    if (!this.validateSizes(config.sizes)) {
      return false;
    }

    return true;
  }

  /**
   * Validate permissions structure
   * Ensures permissions object has the correct structure
   * Requirement: 5.3
   */
  private validatePermissions(permissions: any): boolean {
    if (!permissions || typeof permissions !== 'object') {
      console.error('Widget config permissions must be an object');
      return false;
    }

    // Validate systemInfo permissions
    if (permissions.systemInfo !== undefined) {
      if (typeof permissions.systemInfo !== 'object') {
        console.error('Widget config permissions.systemInfo must be an object');
        return false;
      }

      if (permissions.systemInfo.cpu !== undefined && typeof permissions.systemInfo.cpu !== 'boolean') {
        console.error('Widget config permissions.systemInfo.cpu must be a boolean');
        return false;
      }

      if (permissions.systemInfo.memory !== undefined && typeof permissions.systemInfo.memory !== 'boolean') {
        console.error('Widget config permissions.systemInfo.memory must be a boolean');
        return false;
      }
    }

    // Validate network permissions
    if (permissions.network !== undefined) {
      if (typeof permissions.network !== 'object') {
        console.error('Widget config permissions.network must be an object');
        return false;
      }

      if (permissions.network.enabled !== undefined && typeof permissions.network.enabled !== 'boolean') {
        console.error('Widget config permissions.network.enabled must be a boolean');
        return false;
      }

      if (permissions.network.allowedDomains !== undefined) {
        if (!Array.isArray(permissions.network.allowedDomains)) {
          console.error('Widget config permissions.network.allowedDomains must be an array');
          return false;
        }

        // Validate each domain is a string
        for (const domain of permissions.network.allowedDomains) {
          if (typeof domain !== 'string' || domain.trim() === '') {
            console.error('Widget config permissions.network.allowedDomains must contain only non-empty strings');
            return false;
          }
        }
      }
    }

    return true;
  }

  /**
   * Validate sizes structure
   * Ensures sizes object has the correct structure with default dimensions
   * Requirement: 5.4
   */
  private validateSizes(sizes: any): boolean {
    if (!sizes || typeof sizes !== 'object') {
      console.error('Widget config sizes must be an object');
      return false;
    }

    // Validate default size (required)
    if (!this.validateSizeObject(sizes.default, 'sizes.default', true)) {
      return false;
    }

    // Validate optional min size
    if (sizes.min !== undefined && !this.validateSizeObject(sizes.min, 'sizes.min', false)) {
      return false;
    }

    // Validate optional max size
    if (sizes.max !== undefined && !this.validateSizeObject(sizes.max, 'sizes.max', false)) {
      return false;
    }

    return true;
  }

  /**
   * Helper method to validate a size object (width and height)
   */
  private validateSizeObject(sizeObj: any, fieldName: string, required: boolean): boolean {
    if (required && (!sizeObj || typeof sizeObj !== 'object')) {
      console.error(`Widget config ${fieldName} must be an object`);
      return false;
    }

    if (!sizeObj || typeof sizeObj !== 'object') {
      console.error(`Widget config ${fieldName} must be an object`);
      return false;
    }

    if (typeof sizeObj.width !== 'number' || sizeObj.width <= 0) {
      console.error(`Widget config ${fieldName}.width must be a positive number`);
      return false;
    }

    if (typeof sizeObj.height !== 'number' || sizeObj.height <= 0) {
      console.error(`Widget config ${fieldName}.height must be a positive number`);
      return false;
    }

    return true;
  }

  /**
   * Create a new widget instance
   * Creates a BrowserWindow and loads the widget content
   */
  async createWidget(widgetId: string): Promise<string> {
    try {
      // Check widget limit
      const maxWidgets = this.storageManager.getAppSetting('maxWidgets') ?? 10;
      if (this.widgets.size >= maxWidgets) {
        throw new WidgetError(
          WidgetErrorType.INVALID_CONFIG,
          `Maximum widget limit reached (${maxWidgets})`
        );
      }

      // Find widget config
      const installedWidgets = await this.loadInstalledWidgets();
      const config = installedWidgets.find(w => w.id === widgetId);

      if (!config) {
        throw new WidgetError(
          WidgetErrorType.INVALID_CONFIG,
          `Widget not found: ${widgetId}`
        );
      }

      // Generate unique instance ID
      const instanceId = crypto.randomUUID();

      // Get saved position or use default
      const savedPosition = this.storageManager.getSavedPosition(widgetId);
      const position = savedPosition || {
        x: Math.floor(Math.random() * 200) + 100, // Random position
        y: Math.floor(Math.random() * 200) + 100
      };

      // Get saved size or use default from config
      const savedSize = this.storageManager.getSavedSize(widgetId);
      const size = savedSize || config.sizes.default;

      // Create widget window
      const preloadPath = path.join(__dirname, '../preload/widget-preload.js');
      const window = this.windowController.createWidgetWindow(
        {
          width: size.width,
          height: size.height,
          x: position.x,
          y: position.y,
          transparent: true,
          frame: false,
          alwaysOnTop: true
        },
        preloadPath
      );

      // Create widget instance
      const widgetInstance: WidgetInstance = {
        instanceId,
        widgetId: config.id,
        configPath: path.join(this.widgetsDirectory, widgetId, 'widget.config.json'),
        config,
        window,
        position,
        size,
        permissions: config.permissions,
        createdAt: new Date()
      };

      // Store widget instance
      this.widgets.set(instanceId, widgetInstance);

      // Load widget content
      const widgetPath = path.join(this.widgetsDirectory, widgetId);
      const entryPointPath = path.join(widgetPath, config.entryPoint);

      if (!fs.existsSync(entryPointPath)) {
        throw new WidgetError(
          WidgetErrorType.INVALID_CONFIG,
          `Widget entry point not found: ${entryPointPath}`
        );
      }

      // Load the widget HTML file
      await window.loadFile(entryPointPath);

      // Set up window event handlers
      this.setupWindowEventHandlers(instanceId, window);

      console.log(`Created widget instance: ${config.displayName} (${instanceId})`);
      return instanceId;
    } catch (error) {
      console.error('Failed to create widget:', error);
      if (error instanceof WidgetError) {
        throw error;
      }
      const message = error instanceof Error ? error.message : 'Unknown error';
      throw new WidgetError(
        WidgetErrorType.WIDGET_CRASHED,
        `Failed to create widget: ${message}`
      );
    }
  }

  /**
   * Set up event handlers for widget window
   */
  private setupWindowEventHandlers(instanceId: string, window: BrowserWindow): void {
    // Handle window close
    window.on('closed', () => {
      console.log(`Widget window closed: ${instanceId}`);
      this.cleanupWidget(instanceId);
    });

    // Handle window crash
    window.webContents.on('render-process-gone', (event, details) => {
      console.error(`Widget render process gone: ${instanceId}`, details);
      this.cleanupWidget(instanceId);
    });

    // Handle position changes (for auto-save)
    window.on('move', () => {
      const widget = this.widgets.get(instanceId);
      if (widget && widget.window && !widget.window.isDestroyed()) {
        const [x, y] = widget.window.getPosition();
        widget.position = { x, y };
        
        // Debounced save will be handled by window-controller
        // We just update the in-memory position here
      }
    });

    // Handle window position save request from renderer
    window.webContents.on('ipc-message', (event, channel, ...args) => {
      if (channel === 'save-position') {
        const widget = this.widgets.get(instanceId);
        if (widget) {
          const [x, y] = window.getPosition();
          this.storageManager.setWidgetData(widget.widgetId, 'position', { x, y });
          console.log(`Saved position for widget ${widget.widgetId}: (${x}, ${y})`);
        }
      }
    });
  }

  /**
   * Close a widget instance
   * Closes the window and cleans up resources
   */
  async closeWidget(instanceId: string): Promise<void> {
    try {
      const widget = this.widgets.get(instanceId);

      if (!widget) {
        console.warn(`Widget instance not found: ${instanceId}`);
        return;
      }

      console.log(`Closing widget: ${widget.config.displayName} (${instanceId})`);

      // Save widget state before closing
      await this.saveWidgetState(instanceId);

      // Mark widget as not running in the saved state
      const savedState = this.storageManager.getWidgetState(instanceId);
      if (savedState) {
        savedState.isRunning = false;
        savedState.lastActive = new Date().toISOString();
        this.storageManager.saveWidgetState(instanceId, savedState);
      }

      // Save final position to widget data for next creation
      if (widget.window && !widget.window.isDestroyed()) {
        const [x, y] = widget.window.getPosition();
        const [width, height] = widget.window.getSize();
        this.storageManager.setWidgetData(widget.widgetId, 'position', { x, y });
        this.storageManager.setWidgetData(widget.widgetId, 'size', { width, height });
        
        // Close the window
        widget.window.close();
      }

      // Clean up
      this.cleanupWidget(instanceId);
    } catch (error) {
      console.error('Failed to close widget:', error);
      const message = error instanceof Error ? error.message : 'Unknown error';
      throw new WidgetError(
        WidgetErrorType.WIDGET_CRASHED,
        `Failed to close widget: ${message}`
      );
    }
  }

  /**
   * Clean up widget resources
   * Removes event listeners and deletes from widgets map
   */
  private cleanupWidget(instanceId: string): void {
    const widget = this.widgets.get(instanceId);

    if (widget) {
      // Remove all event listeners from window
      if (widget.window && !widget.window.isDestroyed()) {
        widget.window.removeAllListeners();
        widget.window.webContents.removeAllListeners();
      }

      // Remove from widgets map
      this.widgets.delete(instanceId);
      console.log(`Cleaned up widget: ${instanceId}`);
    }
  }

  /**
   * Get all running widgets
   * Returns an array of all currently running widget instances
   */
  getRunningWidgets(): WidgetInstance[] {
    return Array.from(this.widgets.values());
  }

  /**
   * Get widget instance by ID
   */
  getWidgetInstance(instanceId: string): WidgetInstance | undefined {
    return this.widgets.get(instanceId);
  }

  /**
   * Get widgets directory path
   */
  getWidgetsDirectory(): string {
    return this.widgetsDirectory;
  }

  /**
   * Save all running widget states
   * Useful for periodic backups or before app quit
   */
  async saveAllWidgetStates(): Promise<void> {
    const runningWidgets = this.getRunningWidgets();
    
    for (const widget of runningWidgets) {
      try {
        await this.saveWidgetState(widget.instanceId);
      } catch (error) {
        console.error(`Failed to save state for widget ${widget.instanceId}:`, error);
      }
    }
    
    console.log(`Saved states for ${runningWidgets.length} running widgets`);
  }

  /**
   * Save widget state
   * Persists the current state of a widget instance to storage
   */
  async saveWidgetState(instanceId: string): Promise<void> {
    const widget = this.widgets.get(instanceId);

    if (!widget) {
      console.warn(`Cannot save state: Widget instance not found: ${instanceId}`);
      return;
    }

    try {
      // Get current window position and size
      if (widget.window && !widget.window.isDestroyed()) {
        const [x, y] = widget.window.getPosition();
        const [width, height] = widget.window.getSize();

        widget.position = { x, y };
        widget.size = { width, height };
      }

      // Create widget state object
      const state: WidgetState = {
        widgetId: widget.widgetId,
        instanceId: widget.instanceId,
        position: widget.position,
        size: widget.size,
        isRunning: widget.window !== null && !widget.window.isDestroyed(),
        lastActive: new Date().toISOString(),
        permissions: widget.permissions
      };

      // Save to storage
      this.storageManager.saveWidgetState(instanceId, state);
      console.log(`Saved state for widget ${widget.config.displayName} (${instanceId})`);
    } catch (error) {
      console.error('Failed to save widget state:', error);
      const message = error instanceof Error ? error.message : 'Unknown error';
      throw new WidgetError(
        WidgetErrorType.STORAGE_ERROR,
        `Failed to save widget state: ${message}`
      );
    }
  }

  /**
   * Restore widgets from saved state
   * Recreates widgets that were running when the app was last closed
   */
  async restoreWidgets(): Promise<void> {
    try {
      // Check if auto-restore is enabled
      const autoRestore = this.storageManager.getAppSetting('autoRestore');
      
      if (!autoRestore) {
        console.log('Auto-restore is disabled, skipping widget restoration');
        return;
      }

      // Get all saved widget states
      const widgetStates = this.storageManager.getAllWidgetStates();
      const statesToRestore = Object.values(widgetStates).filter(
        (state) => state.isRunning
      );

      if (statesToRestore.length === 0) {
        console.log('No widgets to restore');
        return;
      }

      console.log(`Restoring ${statesToRestore.length} widgets...`);

      // Load installed widgets once (optimization)
      const installedWidgets = await this.loadInstalledWidgets();
      const installedWidgetIds = new Set(installedWidgets.map(w => w.id));

      // Restore each widget
      for (const state of statesToRestore) {
        try {
          // Check if widget still exists
          if (!installedWidgetIds.has(state.widgetId)) {
            console.warn(`Widget ${state.widgetId} no longer exists, skipping restoration`);
            // Clean up orphaned state
            this.storageManager.deleteWidgetState(state.instanceId);
            continue;
          }

          // Save position and size for this widget
          this.storageManager.setWidgetData(state.widgetId, 'position', state.position);
          this.storageManager.setWidgetData(state.widgetId, 'size', state.size);

          // Create the widget (it will use the saved position and size)
          const newInstanceId = await this.createWidget(state.widgetId);
          
          console.log(`Restored widget ${state.widgetId} with new instance ID: ${newInstanceId}`);

          // Update the widget state with the new instance ID
          const updatedState: WidgetState = {
            ...state,
            instanceId: newInstanceId,
            lastActive: new Date().toISOString()
          };
          this.storageManager.saveWidgetState(newInstanceId, updatedState);

          // Clean up old state entry if instance ID changed
          if (state.instanceId !== newInstanceId) {
            this.storageManager.deleteWidgetState(state.instanceId);
          }
        } catch (error) {
          console.error(`Failed to restore widget ${state.widgetId}:`, error);
          // Continue with other widgets even if one fails
        }
      }

      console.log(`Widget restoration complete. ${this.widgets.size} widgets running.`);
    } catch (error) {
      console.error('Failed to restore widgets:', error);
      // Don't throw error - app should continue even if restoration fails
    }
  }
}
