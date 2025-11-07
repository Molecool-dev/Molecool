/**
 * Unit tests for WidgetManager
 * Tests widget lifecycle, validation, and installation
 */

import { WidgetManager } from '../widget-manager';
import { WindowController } from '../window-controller';
import { StorageManager } from '../storage';
import { WidgetConfig } from '../../types';
import { jest, describe, it, expect, beforeEach } from '@jest/globals';
import * as fs from 'fs';

// Mock dependencies
jest.mock('electron', () => ({
  app: {
    getPath: jest.fn(() => '/mock/user/data'),
    whenReady: jest.fn(() => Promise.resolve()),
    isPackaged: false
  },
  BrowserWindow: jest.fn()
}));

jest.mock('fs');
jest.mock('../window-controller');
jest.mock('../storage');

describe('WidgetManager', () => {
  let widgetManager: WidgetManager;
  let mockWindowController: jest.Mocked<WindowController>;
  let mockStorageManager: jest.Mocked<StorageManager>;

  beforeEach(() => {
    // Reset mocks
    jest.clearAllMocks();

    // Create mock instances
    mockWindowController = new WindowController() as jest.Mocked<WindowController>;
    mockStorageManager = new StorageManager() as jest.Mocked<StorageManager>;

    // Mock fs.existsSync to return true for widgets directory
    (fs.existsSync as jest.Mock).mockReturnValue(true);
    (fs.mkdirSync as jest.Mock).mockReturnValue(undefined);

    // Create widget manager instance
    widgetManager = new WidgetManager(mockWindowController, mockStorageManager);
  });

  describe('validateWidgetConfig', () => {
    it('should validate a correct widget config', () => {
      const validConfig: WidgetConfig = {
        id: 'test-widget',
        name: 'test-widget',
        displayName: 'Test Widget',
        version: '1.0.0',
        description: 'A test widget',
        author: {
          name: 'Test Author',
          email: 'test@example.com'
        },
        permissions: {
          systemInfo: {
            cpu: false,
            memory: false
          },
          network: {
            enabled: false
          }
        },
        sizes: {
          default: {
            width: 300,
            height: 200
          }
        },
        entryPoint: 'index.html'
      };

      // Access private method through any cast for testing
      const result = (widgetManager as any).validateWidgetConfig(validConfig);
      expect(result).toBe(true);
    });

    it('should reject config with missing required fields', () => {
      const invalidConfig = {
        id: 'test-widget',
        // missing name, displayName, version, etc.
      };

      const result = (widgetManager as any).validateWidgetConfig(invalidConfig);
      expect(result).toBe(false);
    });

    it('should reject config with invalid permissions structure', () => {
      const invalidConfig = {
        id: 'test-widget',
        name: 'test-widget',
        displayName: 'Test Widget',
        version: '1.0.0',
        entryPoint: 'index.html',
        permissions: 'invalid', // should be object
        sizes: {
          default: { width: 300, height: 200 }
        }
      };

      const result = (widgetManager as any).validateWidgetConfig(invalidConfig);
      expect(result).toBe(false);
    });

    it('should reject config with invalid sizes', () => {
      const invalidConfig = {
        id: 'test-widget',
        name: 'test-widget',
        displayName: 'Test Widget',
        version: '1.0.0',
        entryPoint: 'index.html',
        permissions: {
          systemInfo: { cpu: false, memory: false },
          network: { enabled: false }
        },
        sizes: {
          default: { width: -100, height: 200 } // negative width
        }
      };

      const result = (widgetManager as any).validateWidgetConfig(invalidConfig);
      expect(result).toBe(false);
    });
  });

  describe('loadInstalledWidgets', () => {
    it('should load widgets from directory', async () => {
      const mockConfig: WidgetConfig = {
        id: 'test-widget',
        name: 'test-widget',
        displayName: 'Test Widget',
        version: '1.0.0',
        description: 'Test',
        author: { name: 'Test', email: 'test@test.com' },
        permissions: {
          systemInfo: { cpu: false, memory: false },
          network: { enabled: false }
        },
        sizes: {
          default: { width: 300, height: 200 }
        },
        entryPoint: 'index.html'
      };

      (fs.readdirSync as jest.Mock).mockReturnValue([
        { name: 'test-widget', isDirectory: () => true }
      ]);
      (fs.readFileSync as jest.Mock).mockReturnValue(JSON.stringify(mockConfig));

      const widgets = await widgetManager.loadInstalledWidgets();

      expect(widgets).toHaveLength(1);
      expect(widgets[0].id).toBe('test-widget');
    });

    it('should handle empty widgets directory', async () => {
      (fs.readdirSync as jest.Mock).mockReturnValue([]);

      const widgets = await widgetManager.loadInstalledWidgets();

      expect(widgets).toHaveLength(0);
    });

    it('should skip invalid widget configs', async () => {
      (fs.readdirSync as jest.Mock).mockReturnValue([
        { name: 'invalid-widget', isDirectory: () => true }
      ]);
      (fs.readFileSync as jest.Mock).mockReturnValue('invalid json');

      const widgets = await widgetManager.loadInstalledWidgets();

      expect(widgets).toHaveLength(0);
    });
  });

  describe('safeDeleteFile', () => {
    it('should delete existing file without throwing', () => {
      (fs.existsSync as jest.Mock).mockReturnValue(true);
      (fs.unlinkSync as jest.Mock).mockReturnValue(undefined);

      // Should not throw
      expect(() => {
        (widgetManager as any).safeDeleteFile('/test/file.txt');
      }).not.toThrow();

      expect(fs.unlinkSync).toHaveBeenCalledWith('/test/file.txt');
    });

    it('should handle non-existent file gracefully', () => {
      (fs.existsSync as jest.Mock).mockReturnValue(false);

      // Should not throw
      expect(() => {
        (widgetManager as any).safeDeleteFile('/test/nonexistent.txt');
      }).not.toThrow();

      expect(fs.unlinkSync).not.toHaveBeenCalled();
    });

    it('should handle deletion errors gracefully', () => {
      (fs.existsSync as jest.Mock).mockReturnValue(true);
      (fs.unlinkSync as jest.Mock).mockImplementation(() => {
        throw new Error('Permission denied');
      });

      // Should not throw
      expect(() => {
        (widgetManager as any).safeDeleteFile('/test/file.txt');
      }).not.toThrow();
    });
  });

  describe('removeDirectory', () => {
    it('should remove directory using modern fs.rmSync', () => {
      (fs.existsSync as jest.Mock).mockReturnValue(true);
      (fs.rmSync as jest.Mock).mockReturnValue(undefined);

      (widgetManager as any).removeDirectory('/test/dir');

      expect(fs.rmSync).toHaveBeenCalledWith('/test/dir', {
        recursive: true,
        force: true
      });
    });

    it('should handle non-existent directory', () => {
      (fs.existsSync as jest.Mock).mockReturnValue(false);

      // Should not throw
      expect(() => {
        (widgetManager as any).removeDirectory('/test/nonexistent');
      }).not.toThrow();

      expect(fs.rmSync).not.toHaveBeenCalled();
    });
  });

  describe('getRunningWidgets', () => {
    it('should return empty array when no widgets running', () => {
      const widgets = widgetManager.getRunningWidgets();
      expect(widgets).toEqual([]);
    });
  });

  describe('getWidgetsDirectory', () => {
    it('should return widgets directory path', () => {
      const dir = widgetManager.getWidgetsDirectory();
      expect(dir).toContain('widgets');
    });
  });

  describe('resolveWidgetsDirectory', () => {
    it('should use project widgets directory in development when it exists', () => {
      // Mock development environment
      const originalEnv = process.env.NODE_ENV;
      process.env.NODE_ENV = 'development';
      
      // Mock fs to simulate project directory exists
      (fs.existsSync as jest.Mock).mockReturnValue(true);
      (fs.accessSync as jest.Mock).mockReturnValue(undefined);
      (fs.mkdirSync as jest.Mock).mockReturnValue(undefined);

      const manager = new WidgetManager(mockWindowController, mockStorageManager);
      const dir = manager.getWidgetsDirectory();

      // Should contain 'widgets' and be a resolved path
      expect(dir).toContain('widgets');
      
      // Restore environment
      process.env.NODE_ENV = originalEnv;
    });

    it('should fallback to user data directory when project directory does not exist', () => {
      // Mock development environment
      const originalEnv = process.env.NODE_ENV;
      process.env.NODE_ENV = 'development';
      
      // Mock fs to simulate project directory does not exist
      let callCount = 0;
      (fs.existsSync as jest.Mock).mockImplementation(() => {
        callCount++;
        // First call (project dir check) returns false
        // Second call (user data dir check) returns true
        return callCount > 1;
      });
      (fs.mkdirSync as jest.Mock).mockReturnValue(undefined);

      const manager = new WidgetManager(mockWindowController, mockStorageManager);
      const dir = manager.getWidgetsDirectory();

      // Should use user data directory (check for path components, not exact path due to Windows)
      expect(dir).toContain('widgets');
      expect(dir).toContain('mock');
      expect(dir).toContain('user');
      expect(dir).toContain('data');
      
      // Restore environment
      process.env.NODE_ENV = originalEnv;
    });

    it('should use user data directory in production', () => {
      // Mock production environment
      const originalEnv = process.env.NODE_ENV;
      process.env.NODE_ENV = 'production';
      
      // Mock app.isPackaged
      const { app } = require('electron');
      app.isPackaged = true;
      
      (fs.existsSync as jest.Mock).mockReturnValue(true);
      (fs.mkdirSync as jest.Mock).mockReturnValue(undefined);

      const manager = new WidgetManager(mockWindowController, mockStorageManager);
      const dir = manager.getWidgetsDirectory();

      // Should use user data directory (check for path components, not exact path due to Windows)
      expect(dir).toContain('widgets');
      expect(dir).toContain('mock');
      expect(dir).toContain('user');
      expect(dir).toContain('data');
      
      // Restore environment
      process.env.NODE_ENV = originalEnv;
      app.isPackaged = false;
    });

    it('should handle inaccessible project directory gracefully', () => {
      // Mock development environment
      const originalEnv = process.env.NODE_ENV;
      process.env.NODE_ENV = 'development';
      
      // Mock fs to simulate project directory exists but is not accessible
      let callCount = 0;
      (fs.existsSync as jest.Mock).mockImplementation(() => {
        callCount++;
        return true; // Directory exists
      });
      (fs.accessSync as jest.Mock).mockImplementation(() => {
        throw new Error('Permission denied');
      });
      (fs.mkdirSync as jest.Mock).mockReturnValue(undefined);

      const manager = new WidgetManager(mockWindowController, mockStorageManager);
      const dir = manager.getWidgetsDirectory();

      // Should fallback to user data directory (check for path components, not exact path due to Windows)
      expect(dir).toContain('widgets');
      expect(dir).toContain('mock');
      expect(dir).toContain('user');
      expect(dir).toContain('data');
      
      // Restore environment
      process.env.NODE_ENV = originalEnv;
    });
  });
});
