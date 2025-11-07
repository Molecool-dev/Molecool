import { dialog } from 'electron';
import { PermissionSet, WidgetErrorType, WidgetError } from '../types';
import { StorageManager } from './storage';

/**
 * Permission request interface
 */
export interface PermissionRequest {
  widgetId: string;
  widgetName: string;
  permission: string; // e.g., 'systemInfo.cpu', 'systemInfo.memory', 'network'
  reason?: string;
}

/**
 * Rate limit tracking
 */
interface RateLimitEntry {
  count: number;
  resetTime: number;
}

/**
 * Parsed permission structure
 */
interface ParsedPermission {
  category: 'systemInfo' | 'network';
  subPermission?: 'cpu' | 'memory';
}

/**
 * Valid permission strings
 */
const VALID_PERMISSIONS = [
  'systemInfo.cpu',
  'systemInfo.memory',
  'network'
] as const;

type ValidPermission = typeof VALID_PERMISSIONS[number];

/**
 * Permissions Manager
 * Manages widget permissions, requests, and rate limiting
 */
export class PermissionsManager {
  private storage: StorageManager;
  private rateLimits: Map<string, Map<string, RateLimitEntry>>;
  private readonly RATE_LIMIT_WINDOW = 1000; // 1 second
  private readonly RATE_LIMIT_MAX_CALLS = 10; // 10 calls per second
  private cleanupInterval: NodeJS.Timeout | null = null;

  constructor(storage: StorageManager) {
    this.storage = storage;
    this.rateLimits = new Map();
    this.startCleanupTimer();
  }

  /**
   * Start periodic cleanup of expired rate limit entries
   * Prevents memory leaks from accumulating rate limit data
   */
  private startCleanupTimer(): void {
    // Clean up every 5 minutes
    this.cleanupInterval = setInterval(() => {
      this.cleanupExpiredRateLimits();
    }, 5 * 60 * 1000);
  }

  /**
   * Clean up expired rate limit entries
   */
  private cleanupExpiredRateLimits(): void {
    const now = Date.now();
    
    for (const [widgetId, widgetLimits] of this.rateLimits.entries()) {
      for (const [apiName, entry] of widgetLimits.entries()) {
        if (now >= entry.resetTime) {
          widgetLimits.delete(apiName);
        }
      }
      
      // Remove widget entry if no API limits remain
      if (widgetLimits.size === 0) {
        this.rateLimits.delete(widgetId);
      }
    }
  }

  /**
   * Stop cleanup timer (call when shutting down)
   */
  destroy(): void {
    if (this.cleanupInterval) {
      clearInterval(this.cleanupInterval);
      this.cleanupInterval = null;
    }
  }

  /**
   * Request permission from user
   * Shows a dialog asking the user to grant or deny permission
   */
  async requestPermission(request: PermissionRequest): Promise<boolean> {
    const { widgetId, widgetName, permission, reason } = request;

    // Check if permission was already granted
    // Note: We only skip the dialog if permission is granted (true)
    // If permission is false, it might be the default value (never requested)
    // rather than an explicit denial, so we show the dialog
    const existingPermissions = this.getPermissions(widgetId);
    if (existingPermissions && this.hasPermission(widgetId, permission)) {
      return true;
    }

    // Show permission dialog
    const permissionLabel = this.getPermissionLabel(permission);
    const message = reason
      ? `${widgetName} wants to access ${permissionLabel}.\n\nReason: ${reason}`
      : `${widgetName} wants to access ${permissionLabel}.`;

    const result = await dialog.showMessageBox({
      type: 'question',
      title: 'Permission Request',
      message: message,
      buttons: ['Allow', 'Deny'],
      defaultId: 0,
      cancelId: 1
    });

    const granted = result.response === 0;

    // Save the permission decision
    this.savePermission(widgetId, permission, granted);

    return granted;
  }

  /**
   * Parse and validate permission string
   * @throws {WidgetError} if permission format is invalid
   */
  private parsePermission(permission: string): ParsedPermission {
    // Validate permission format
    if (!VALID_PERMISSIONS.includes(permission as ValidPermission)) {
      throw new WidgetError(
        WidgetErrorType.INVALID_CONFIG,
        `Invalid permission format: ${permission}. Valid permissions are: ${VALID_PERMISSIONS.join(', ')}`
      );
    }

    const parts = permission.split('.');
    
    if (parts.length === 1 && parts[0] === 'network') {
      return { category: 'network' };
    }
    
    if (parts.length === 2 && parts[0] === 'systemInfo') {
      const subPermission = parts[1];
      if (subPermission === 'cpu' || subPermission === 'memory') {
        return { category: 'systemInfo', subPermission };
      }
    }

    // This should never happen due to VALID_PERMISSIONS check above
    throw new WidgetError(
      WidgetErrorType.INVALID_CONFIG,
      `Invalid permission format: ${permission}`
    );
  }

  /**
   * Check if widget has a specific permission
   * @throws {WidgetError} if permission format is invalid
   */
  hasPermission(widgetId: string, permission: string): boolean {
    const permissions = this.getPermissions(widgetId);
    
    if (!permissions) {
      return false;
    }

    const parsed = this.parsePermission(permission);
    
    if (parsed.category === 'network') {
      return permissions.network.enabled;
    }
    
    if (parsed.category === 'systemInfo' && parsed.subPermission) {
      return permissions.systemInfo[parsed.subPermission] === true;
    }

    return false;
  }

  /**
   * Save permission decision
   * @throws {WidgetError} if permission format is invalid
   */
  savePermission(widgetId: string, permission: string, granted: boolean): void {
    // Get existing permissions or create default
    let permissions = this.getPermissions(widgetId);
    
    if (!permissions) {
      permissions = {
        systemInfo: {
          cpu: false,
          memory: false
        },
        network: {
          enabled: false,
          allowedDomains: []
        }
      };
    }

    const parsed = this.parsePermission(permission);
    
    if (parsed.category === 'network') {
      permissions.network.enabled = granted;
    } else if (parsed.category === 'systemInfo' && parsed.subPermission) {
      permissions.systemInfo[parsed.subPermission] = granted;
    }

    // Save to storage
    this.storage.savePermissions(widgetId, permissions);
  }

  /**
   * Get all permissions for a widget
   */
  getPermissions(widgetId: string): PermissionSet | null {
    return this.storage.getPermissions(widgetId);
  }

  /**
   * Check rate limit for API calls
   * @returns true if the call is allowed, false if rate limit exceeded
   * @throws {WidgetError} if rate limit is exceeded (when throwOnExceed is true)
   */
  checkRateLimit(widgetId: string, apiName: string, throwOnExceed = false): boolean {
    const now = Date.now();
    
    // Get or create widget rate limit map
    if (!this.rateLimits.has(widgetId)) {
      this.rateLimits.set(widgetId, new Map());
    }
    
    const widgetLimits = this.rateLimits.get(widgetId)!;
    
    // Get or create API rate limit entry
    let entry = widgetLimits.get(apiName);
    
    if (!entry || now >= entry.resetTime) {
      // Create new entry or reset expired entry
      entry = {
        count: 1,
        resetTime: now + this.RATE_LIMIT_WINDOW
      };
      widgetLimits.set(apiName, entry);
      return true;
    }
    
    // Check if limit exceeded
    if (entry.count >= this.RATE_LIMIT_MAX_CALLS) {
      if (throwOnExceed) {
        throw new WidgetError(
          WidgetErrorType.RATE_LIMIT_EXCEEDED,
          `Rate limit exceeded for ${apiName}. Maximum ${this.RATE_LIMIT_MAX_CALLS} calls per ${this.RATE_LIMIT_WINDOW}ms.`,
          widgetId
        );
      }
      return false;
    }
    
    // Increment count
    entry.count++;
    return true;
  }

  /**
   * Get human-readable permission label
   */
  private getPermissionLabel(permission: string): string {
    const labels: Record<string, string> = {
      'systemInfo.cpu': 'CPU usage information',
      'systemInfo.memory': 'memory usage information',
      'network': 'network access',
      'network.enabled': 'network access'
    };

    return labels[permission] || permission;
  }

  /**
   * Clear rate limits for a widget (useful for testing or cleanup)
   */
  clearRateLimits(widgetId: string): void {
    this.rateLimits.delete(widgetId);
  }

  /**
   * Reset all rate limits
   */
  resetAllRateLimits(): void {
    this.rateLimits.clear();
  }
}
