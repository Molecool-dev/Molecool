/**
 * Error Handling Tests for Widget Container
 * Tests IPC error handling and error response format
 */

import { describe, it, expect, beforeEach, afterEach, jest } from '@jest/globals';

// Mock electron module BEFORE importing anything that uses it
jest.mock('electron', () => ({
  BrowserWindow: {
    fromWebContents: jest.fn()
  }
}));

import { IPCHandlers } from '../ipc-handlers';
import { StorageManager } from '../storage';
import { SystemAPI } from '../system-api';
import { PermissionsManager } from '../permissions';
import { WidgetErrorType } from '../../types';
import { BrowserWindow } from 'electron';

describe('IPC Error Handling', () => {
  let ipcHandlers: IPCHandlers;
  let storageManager: StorageManager;
  let systemAPI: SystemAPI;
  let permissionsManager: PermissionsManager;

  beforeEach(() => {
    storageManager = new StorageManager();
    systemAPI = new SystemAPI();
    permissionsManager = new PermissionsManager(storageManager);
    ipcHandlers = new IPCHandlers(storageManager, systemAPI, permissionsManager);
    
    // Reset mocks
    jest.clearAllMocks();
  });

  afterEach(() => {
    ipcHandlers.destroy();
  });

  describe('Storage Error Handling', () => {
    it('should return error response for invalid key type', async () => {
      const mockEvent = {
        sender: {
          getOwnerBrowserWindow: () => null
        }
      } as any;

      // @ts-ignore - accessing private method for testing
      const response = await ipcHandlers.handleStorageGet(mockEvent, null as any);

      expect(response.success).toBe(false);
      expect(response.error).toBeDefined();
      expect(response.error?.type).toBe(WidgetErrorType.STORAGE_ERROR);
      expect(response.error?.message).toContain('Invalid key');
    });

    it('should return error response for empty key', async () => {
      const mockEvent = {
        sender: {
          getOwnerBrowserWindow: () => null
        }
      } as any;

      // @ts-ignore - accessing private method for testing
      const response = await ipcHandlers.handleStorageGet(mockEvent, '');

      expect(response.success).toBe(false);
      expect(response.error).toBeDefined();
      expect(response.error?.type).toBe(WidgetErrorType.STORAGE_ERROR);
    });

    it('should return success response for valid storage operations', async () => {
      // Create a mock window
      const mockWindow = {
        id: 1,
        webContents: { id: 1 }
      } as any;

      const mockEvent = {
        sender: {
          id: 1
        }
      } as any;

      // Mock BrowserWindow.fromWebContents to return our mock window
      (BrowserWindow.fromWebContents as jest.Mock).mockReturnValue(mockWindow);

      // Mock the widgetManager to return a widget instance
      const mockWidgetManager = {
        getRunningWidgets: () => [
          {
            instanceId: 'test-instance-id',
            widgetId: 'test-widget',
            window: mockWindow,
            config: { id: 'test-widget', name: 'Test Widget', displayName: 'Test' }
          }
        ]
      };

      // @ts-ignore - set widget manager for testing
      ipcHandlers.setWidgetManager(mockWidgetManager as any);

      // Set a value
      // @ts-ignore - accessing private method for testing
      const setResponse = await ipcHandlers.handleStorageSet(mockEvent, 'test-key', 'test-value');
      expect(setResponse.success).toBe(true);

      // Get the value
      // @ts-ignore - accessing private method for testing
      const getResponse = await ipcHandlers.handleStorageGet(mockEvent, 'test-key');
      expect(getResponse.success).toBe(true);
      expect(getResponse.data).toBe('test-value');
    });
  });

  describe('UI Error Handling', () => {
    it('should return error for invalid resize dimensions', async () => {
      const mockEvent = {
        sender: {
          getOwnerBrowserWindow: () => null
        }
      } as any;

      // @ts-ignore - accessing private method for testing
      const response = await ipcHandlers.handleUIResize(mockEvent, 'invalid' as any, 200);

      expect(response.success).toBe(false);
      expect(response.error).toBeDefined();
      expect(response.error?.type).toBe(WidgetErrorType.INVALID_CONFIG);
      expect(response.error?.message).toContain('must be numbers');
    });

    it('should return error for dimensions too small', async () => {
      // Create a mock window with setSize method
      const mockWindow = {
        id: 1,
        webContents: { id: 1 },
        setSize: jest.fn()
      } as any;

      const mockEvent = {
        sender: { id: 1 }
      } as any;

      // Mock BrowserWindow.fromWebContents to return our mock window
      (BrowserWindow.fromWebContents as jest.Mock).mockReturnValue(mockWindow);

      // @ts-ignore - accessing private method for testing
      const response = await ipcHandlers.handleUIResize(mockEvent, 50, 50);

      expect(response.success).toBe(false);
      expect(response.error).toBeDefined();
      expect(response.error?.type).toBe(WidgetErrorType.INVALID_CONFIG);
      expect(response.error?.message).toContain('at least 100x100');
    });

    it('should return error for dimensions too large', async () => {
      // Create a mock window with setSize method
      const mockWindow = {
        id: 1,
        webContents: { id: 1 },
        setSize: jest.fn()
      } as any;

      const mockEvent = {
        sender: { id: 1 }
      } as any;

      // Mock BrowserWindow.fromWebContents to return our mock window
      (BrowserWindow.fromWebContents as jest.Mock).mockReturnValue(mockWindow);

      // @ts-ignore - accessing private method for testing
      const response = await ipcHandlers.handleUIResize(mockEvent, 3000, 3000);

      expect(response.success).toBe(false);
      expect(response.error).toBeDefined();
      expect(response.error?.type).toBe(WidgetErrorType.INVALID_CONFIG);
      expect(response.error?.message).toContain('must not exceed 2000x2000');
    });

    it('should return error for non-finite numbers', async () => {
      const mockEvent = {
        sender: {
          getOwnerBrowserWindow: () => null
        }
      } as any;

      // @ts-ignore - accessing private method for testing
      const response = await ipcHandlers.handleUIResize(mockEvent, Infinity, 200);

      expect(response.success).toBe(false);
      expect(response.error).toBeDefined();
      expect(response.error?.type).toBe(WidgetErrorType.INVALID_CONFIG);
      expect(response.error?.message).toContain('finite numbers');
    });
  });

  describe('Error Response Format', () => {
    it('should return standardized error response format', async () => {
      const mockEvent = {
        sender: {
          getOwnerBrowserWindow: () => null
        }
      } as any;

      // @ts-ignore - accessing private method for testing
      const response = await ipcHandlers.handleStorageGet(mockEvent, null as any);

      // Verify response structure
      expect(response).toHaveProperty('success');
      expect(response).toHaveProperty('error');
      expect(response.success).toBe(false);
      
      // Verify error structure
      expect(response.error).toHaveProperty('type');
      expect(response.error).toHaveProperty('message');
      expect(typeof response.error?.type).toBe('string');
      expect(typeof response.error?.message).toBe('string');
    });

    it('should return standardized success response format', async () => {
      // Create a mock window
      const mockWindow = {
        id: 1,
        webContents: { id: 1 }
      } as any;

      const mockEvent = {
        sender: { id: 1 }
      } as any;

      // Mock BrowserWindow.fromWebContents to return our mock window
      (BrowserWindow.fromWebContents as jest.Mock).mockReturnValue(mockWindow);

      // Mock the widgetManager
      const mockWidgetManager = {
        getRunningWidgets: () => [
          {
            instanceId: 'test-instance-id',
            widgetId: 'test-widget',
            window: mockWindow,
            config: { id: 'test-widget', name: 'Test Widget', displayName: 'Test' }
          }
        ]
      };

      // @ts-ignore - set widget manager for testing
      ipcHandlers.setWidgetManager(mockWidgetManager as any);

      // @ts-ignore - accessing private method for testing
      const response = await ipcHandlers.handleStorageSet(mockEvent, 'test-key', 'test-value');

      // Verify response structure
      expect(response).toHaveProperty('success');
      expect(response.success).toBe(true);
      expect(response.error).toBeUndefined();
    });

    it('should include data in success response when applicable', async () => {
      // Create a mock window
      const mockWindow = {
        id: 1,
        webContents: { id: 1 }
      } as any;

      const mockEvent = {
        sender: { id: 1 }
      } as any;

      // Mock BrowserWindow.fromWebContents to return our mock window
      (BrowserWindow.fromWebContents as jest.Mock).mockReturnValue(mockWindow);

      // Mock the widgetManager
      const mockWidgetManager = {
        getRunningWidgets: () => [
          {
            instanceId: 'test-instance-id',
            widgetId: 'test-widget',
            window: mockWindow,
            config: { id: 'test-widget', name: 'Test Widget', displayName: 'Test' }
          }
        ]
      };

      // @ts-ignore - set widget manager for testing
      ipcHandlers.setWidgetManager(mockWidgetManager as any);

      // Set a value first
      // @ts-ignore
      await ipcHandlers.handleStorageSet(mockEvent, 'test-key', { foo: 'bar' });

      // Get the value
      // @ts-ignore
      const response = await ipcHandlers.handleStorageGet(mockEvent, 'test-key');

      expect(response).toHaveProperty('success');
      expect(response).toHaveProperty('data');
      expect(response.success).toBe(true);
      expect(response.data).toEqual({ foo: 'bar' });
    });
  });

  describe('WidgetError Class', () => {
    it('should have all required error types', () => {
      expect(WidgetErrorType.PERMISSION_DENIED).toBe('PERMISSION_DENIED');
      expect(WidgetErrorType.RATE_LIMIT_EXCEEDED).toBe('RATE_LIMIT_EXCEEDED');
      expect(WidgetErrorType.INVALID_CONFIG).toBe('INVALID_CONFIG');
      expect(WidgetErrorType.WIDGET_CRASHED).toBe('WIDGET_CRASHED');
      expect(WidgetErrorType.NETWORK_ERROR).toBe('NETWORK_ERROR');
      expect(WidgetErrorType.STORAGE_ERROR).toBe('STORAGE_ERROR');
    });
  });
});
