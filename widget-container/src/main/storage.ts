import Store from 'electron-store';
import { StoreSchema, WidgetState, PermissionSet } from '../types';

/**
 * Storage Manager
 * Handles data persistence using electron-store
 * 
 * This file will be fully implemented in Task 4
 */

export class StorageManager {
  private store: Store<StoreSchema>;

  constructor() {
    // Initialize electron-store with schema
    this.store = new Store<StoreSchema>({
      defaults: {
        widgetStates: {},
        widgetData: {},
        permissions: {},
        appSettings: {
          autoRestore: true,
          maxWidgets: 10
        }
      }
    });
  }

  /**
   * Set widget data
   * Stores data for a specific widget in isolated storage
   */
  setWidgetData(widgetId: string, key: string, value: any): void {
    const widgetData = this.store.get('widgetData', {});
    
    // Initialize widget data object if it doesn't exist
    if (!widgetData[widgetId]) {
      widgetData[widgetId] = {};
    }
    
    // Set the value
    widgetData[widgetId][key] = value;
    
    // Save back to store
    this.store.set('widgetData', widgetData);
  }

  /**
   * Get widget data
   * Retrieves data for a specific widget from isolated storage
   */
  getWidgetData(widgetId: string, key: string): any {
    const widgetData = this.store.get('widgetData', {});
    
    // Return undefined if widget or key doesn't exist
    if (!widgetData[widgetId]) {
      return undefined;
    }
    
    return widgetData[widgetId][key];
  }

  /**
   * Delete widget data
   * Removes a specific key from widget's storage
   */
  deleteWidgetData(widgetId: string, key: string): void {
    const widgetData = this.store.get('widgetData', {});
    
    // Check if widget data exists
    if (widgetData[widgetId] && widgetData[widgetId][key] !== undefined) {
      delete widgetData[widgetId][key];
      this.store.set('widgetData', widgetData);
    }
  }

  /**
   * Save widget state
   * Persists widget window state (position, size, etc.)
   */
  saveWidgetState(instanceId: string, state: WidgetState): void {
    const widgetStates = this.store.get('widgetStates', {});
    widgetStates[instanceId] = state;
    this.store.set('widgetStates', widgetStates);
  }

  /**
   * Get widget state
   * Retrieves saved widget window state
   */
  getWidgetState(instanceId: string): WidgetState | null {
    const widgetStates = this.store.get('widgetStates', {});
    return widgetStates[instanceId] || null;
  }

  /**
   * Get saved widget position
   * Returns the last saved position for a widget, or null if not found
   */
  getSavedPosition(widgetId: string): { x: number; y: number } | null {
    const position = this.getWidgetData(widgetId, 'position');
    return position || null;
  }

  /**
   * Get saved widget size
   * Returns the last saved size for a widget, or null if not found
   */
  getSavedSize(widgetId: string): { width: number; height: number } | null {
    const size = this.getWidgetData(widgetId, 'size');
    return size || null;
  }

  /**
   * Get all widget states
   * Returns all saved widget states
   */
  getAllWidgetStates(): Record<string, WidgetState> {
    return this.store.get('widgetStates', {});
  }

  /**
   * Delete widget state
   * Removes a widget state entry
   */
  deleteWidgetState(instanceId: string): void {
    const widgetStates = this.store.get('widgetStates', {});
    delete widgetStates[instanceId];
    this.store.set('widgetStates', widgetStates);
  }

  /**
   * Get app setting
   * Retrieves an application setting
   */
  getAppSetting<K extends keyof StoreSchema['appSettings']>(
    key: K
  ): StoreSchema['appSettings'][K] {
    return this.store.get(`appSettings.${key}` as any);
  }

  /**
   * Save permissions
   * Persists widget permissions to storage
   */
  savePermissions(widgetId: string, permissions: PermissionSet): void {
    const allPermissions = this.store.get('permissions', {});
    allPermissions[widgetId] = permissions;
    this.store.set('permissions', allPermissions);
  }

  /**
   * Get permissions
   * Retrieves saved widget permissions
   */
  getPermissions(widgetId: string): PermissionSet | null {
    const allPermissions = this.store.get('permissions', {});
    return allPermissions[widgetId] || null;
  }
}
