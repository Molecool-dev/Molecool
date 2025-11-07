/**
 * Permissions System Tests (Task 37.2)
 * 
 * This test suite verifies the permission system functionality:
 * - Permission dialog display
 * - Permission granting and denial
 * - Rate limiting
 * - Unauthorized API access blocking
 */

import { PermissionsManager, PermissionRequest } from '../permissions';
import { StorageManager } from '../storage';
import { dialog } from 'electron';

// Mock electron dialog
jest.mock('electron', () => ({
  dialog: {
    showMessageBox: jest.fn()
  }
}));

describe('Permissions System Tests (Task 37.2)', () => {
  let permissionsManager: PermissionsManager;
  let storageManager: StorageManager;

  beforeEach(() => {
    // Create a mock storage manager
    storageManager = {
      savePermissions: jest.fn(),
      getPermissions: jest.fn().mockReturnValue(null)
    } as any;

    permissionsManager = new PermissionsManager(storageManager);
    
    // Reset dialog mock
    (dialog.showMessageBox as jest.Mock).mockReset();
  });

  afterEach(() => {
    // Clean up
    permissionsManager.destroy();
  });

  describe('Test Case 37.2.1: Permission Dialog Display', () => {
    it('should show permission dialog with correct information', async () => {
      // Mock user clicking "Allow"
      (dialog.showMessageBox as jest.Mock).mockResolvedValue({ response: 0 });

      const request: PermissionRequest = {
        widgetId: 'system-monitor',
        widgetName: 'System Monitor',
        permission: 'systemInfo.cpu',
        reason: 'To display CPU usage information'
      };

      await permissionsManager.requestPermission(request);

      // Verify dialog was shown
      expect(dialog.showMessageBox).toHaveBeenCalledTimes(1);
      
      const dialogCall = (dialog.showMessageBox as jest.Mock).mock.calls[0][0];
      
      // Verify dialog properties
      expect(dialogCall.type).toBe('question');
      expect(dialogCall.title).toBe('Permission Request');
      expect(dialogCall.message).toContain('System Monitor');
      expect(dialogCall.message).toContain('CPU usage information');
      expect(dialogCall.message).toContain('To display CPU usage information');
      expect(dialogCall.buttons).toEqual(['Allow', 'Deny']);
      expect(dialogCall.defaultId).toBe(0);
      expect(dialogCall.cancelId).toBe(1);
    });

    it('should show dialog without reason if not provided', async () => {
      (dialog.showMessageBox as jest.Mock).mockResolvedValue({ response: 0 });

      const request: PermissionRequest = {
        widgetId: 'system-monitor',
        widgetName: 'System Monitor',
        permission: 'systemInfo.memory'
      };

      await permissionsManager.requestPermission(request);

      const dialogCall = (dialog.showMessageBox as jest.Mock).mock.calls[0][0];
      expect(dialogCall.message).toContain('System Monitor');
      expect(dialogCall.message).toContain('memory usage information');
      expect(dialogCall.message).not.toContain('Reason:');
    });

    it('should use correct permission labels', async () => {
      (dialog.showMessageBox as jest.Mock).mockResolvedValue({ response: 0 });

      const testCases = [
        { permission: 'systemInfo.cpu', expectedLabel: 'CPU usage information' },
        { permission: 'systemInfo.memory', expectedLabel: 'memory usage information' },
        { permission: 'network', expectedLabel: 'network access' }
      ];

      for (const testCase of testCases) {
        (dialog.showMessageBox as jest.Mock).mockClear();
        
        await permissionsManager.requestPermission({
          widgetId: 'test-widget',
          widgetName: 'Test Widget',
          permission: testCase.permission
        });

        const dialogCall = (dialog.showMessageBox as jest.Mock).mock.calls[0][0];
        expect(dialogCall.message).toContain(testCase.expectedLabel);
      }
    });
  });

  describe('Test Case 37.2.2: Permission Granting', () => {
    it('should grant permission when user clicks Allow', async () => {
      // Mock user clicking "Allow" (response: 0)
      (dialog.showMessageBox as jest.Mock).mockResolvedValue({ response: 0 });

      const request: PermissionRequest = {
        widgetId: 'system-monitor',
        widgetName: 'System Monitor',
        permission: 'systemInfo.cpu'
      };

      const granted = await permissionsManager.requestPermission(request);

      // Verify permission was granted
      expect(granted).toBe(true);
      
      // Verify permission was saved
      expect(storageManager.savePermissions).toHaveBeenCalledWith(
        'system-monitor',
        expect.objectContaining({
          systemInfo: expect.objectContaining({
            cpu: true
          })
        })
      );
    });

    it('should save permission decision persistently', async () => {
      (dialog.showMessageBox as jest.Mock).mockResolvedValue({ response: 0 });

      await permissionsManager.requestPermission({
        widgetId: 'system-monitor',
        widgetName: 'System Monitor',
        permission: 'systemInfo.cpu'
      });

      // Verify savePermissions was called
      expect(storageManager.savePermissions).toHaveBeenCalled();
    });

    it('should not show dialog again if permission already granted', async () => {
      // Mock permission already granted
      (storageManager.getPermissions as jest.Mock).mockReturnValue({
        systemInfo: { cpu: true, memory: false },
        network: { enabled: false, allowedDomains: [] }
      });

      const granted = await permissionsManager.requestPermission({
        widgetId: 'system-monitor',
        widgetName: 'System Monitor',
        permission: 'systemInfo.cpu'
      });

      // Should return true without showing dialog
      expect(granted).toBe(true);
      expect(dialog.showMessageBox).not.toHaveBeenCalled();
    });

    it('should handle multiple permissions independently', async () => {
      (dialog.showMessageBox as jest.Mock).mockResolvedValue({ response: 0 });

      // Grant CPU permission
      await permissionsManager.requestPermission({
        widgetId: 'system-monitor',
        widgetName: 'System Monitor',
        permission: 'systemInfo.cpu'
      });

      // Grant memory permission
      await permissionsManager.requestPermission({
        widgetId: 'system-monitor',
        widgetName: 'System Monitor',
        permission: 'systemInfo.memory'
      });

      // Verify both permissions were saved
      expect(storageManager.savePermissions).toHaveBeenCalledTimes(2);
    });
  });

  describe('Test Case 37.2.3: Permission Denial', () => {
    it('should deny permission when user clicks Deny', async () => {
      // Mock user clicking "Deny" (response: 1)
      (dialog.showMessageBox as jest.Mock).mockResolvedValue({ response: 1 });

      const request: PermissionRequest = {
        widgetId: 'system-monitor',
        widgetName: 'System Monitor',
        permission: 'systemInfo.cpu'
      };

      const granted = await permissionsManager.requestPermission(request);

      // Verify permission was denied
      expect(granted).toBe(false);
      
      // Verify denial was saved
      expect(storageManager.savePermissions).toHaveBeenCalledWith(
        'system-monitor',
        expect.objectContaining({
          systemInfo: expect.objectContaining({
            cpu: false
          })
        })
      );
    });

    it('should save denial decision persistently', async () => {
      (dialog.showMessageBox as jest.Mock).mockResolvedValue({ response: 1 });

      await permissionsManager.requestPermission({
        widgetId: 'system-monitor',
        widgetName: 'System Monitor',
        permission: 'systemInfo.memory'
      });

      // Verify savePermissions was called with false
      const savedPermissions = (storageManager.savePermissions as jest.Mock).mock.calls[0][1];
      expect(savedPermissions.systemInfo.memory).toBe(false);
    });

    it('should show dialog again if permission was previously denied', async () => {
      // Mock permission already denied (false = default/denied)
      (storageManager.getPermissions as jest.Mock).mockReturnValue({
        systemInfo: { cpu: false, memory: false },
        network: { enabled: false, allowedDomains: [] }
      });

      // Mock user denying again
      (dialog.showMessageBox as jest.Mock).mockResolvedValue({ response: 1 });

      const granted = await permissionsManager.requestPermission({
        widgetId: 'system-monitor',
        widgetName: 'System Monitor',
        permission: 'systemInfo.cpu'
      });

      // Should show dialog and return false
      expect(granted).toBe(false);
      expect(dialog.showMessageBox).toHaveBeenCalled();
    });

    it('should block API access when permission is denied', () => {
      // Mock permission denied
      (storageManager.getPermissions as jest.Mock).mockReturnValue({
        systemInfo: { cpu: false, memory: false },
        network: { enabled: false, allowedDomains: [] }
      });

      const hasPermission = permissionsManager.hasPermission('system-monitor', 'systemInfo.cpu');
      
      expect(hasPermission).toBe(false);
    });
  });

  describe('Test Case 37.2.4: Rate Limiting', () => {
    beforeEach(() => {
      // Grant permissions for rate limit tests
      (storageManager.getPermissions as jest.Mock).mockReturnValue({
        systemInfo: { cpu: true, memory: true },
        network: { enabled: true, allowedDomains: [] }
      });
    });

    it('should allow up to 10 calls per second', () => {
      const widgetId = 'system-monitor';
      const apiName = 'system:getCPU';

      // Make 10 calls - all should succeed
      for (let i = 0; i < 10; i++) {
        const allowed = permissionsManager.checkRateLimit(widgetId, apiName);
        expect(allowed).toBe(true);
      }
    });

    it('should block calls exceeding 10 per second', () => {
      const widgetId = 'system-monitor';
      const apiName = 'system:getCPU';

      // Make 10 calls - all should succeed
      for (let i = 0; i < 10; i++) {
        permissionsManager.checkRateLimit(widgetId, apiName);
      }

      // 11th call should be blocked
      const allowed = permissionsManager.checkRateLimit(widgetId, apiName);
      expect(allowed).toBe(false);
    });

    it('should throw error when rate limit exceeded with throwOnExceed=true', () => {
      const widgetId = 'system-monitor';
      const apiName = 'system:getCPU';

      // Make 10 calls
      for (let i = 0; i < 10; i++) {
        permissionsManager.checkRateLimit(widgetId, apiName);
      }

      // 11th call should throw
      expect(() => {
        permissionsManager.checkRateLimit(widgetId, apiName, true);
      }).toThrow();
    });

    it('should reset rate limit after 1 second', async () => {
      const widgetId = 'system-monitor';
      const apiName = 'system:getCPU';

      // Make 10 calls
      for (let i = 0; i < 10; i++) {
        permissionsManager.checkRateLimit(widgetId, apiName);
      }

      // 11th call should be blocked
      expect(permissionsManager.checkRateLimit(widgetId, apiName)).toBe(false);

      // Wait 1 second
      await new Promise(resolve => setTimeout(resolve, 1100));

      // Should be allowed again
      const allowed = permissionsManager.checkRateLimit(widgetId, apiName);
      expect(allowed).toBe(true);
    });

    it('should track rate limits per widget independently', () => {
      const widget1 = 'system-monitor-1';
      const widget2 = 'system-monitor-2';
      const apiName = 'system:getCPU';

      // Widget 1 makes 10 calls
      for (let i = 0; i < 10; i++) {
        permissionsManager.checkRateLimit(widget1, apiName);
      }

      // Widget 1 should be blocked
      expect(permissionsManager.checkRateLimit(widget1, apiName)).toBe(false);

      // Widget 2 should still be allowed
      expect(permissionsManager.checkRateLimit(widget2, apiName)).toBe(true);
    });

    it('should track rate limits per API independently', () => {
      const widgetId = 'system-monitor';
      const api1 = 'system:getCPU';
      const api2 = 'system:getMemory';

      // Make 10 calls to API 1
      for (let i = 0; i < 10; i++) {
        permissionsManager.checkRateLimit(widgetId, api1);
      }

      // API 1 should be blocked
      expect(permissionsManager.checkRateLimit(widgetId, api1)).toBe(false);

      // API 2 should still be allowed
      expect(permissionsManager.checkRateLimit(widgetId, api2)).toBe(true);
    });

    it('should clean up expired rate limit entries', async () => {
      const widgetId = 'system-monitor';
      const apiName = 'system:getCPU';

      // Make some calls
      for (let i = 0; i < 5; i++) {
        permissionsManager.checkRateLimit(widgetId, apiName);
      }

      // Wait for cleanup (1.1 seconds to ensure expiry)
      await new Promise(resolve => setTimeout(resolve, 1100));

      // Trigger cleanup manually (in real scenario, this happens automatically)
      (permissionsManager as any).cleanupExpiredRateLimits();

      // Rate limit should be reset
      const allowed = permissionsManager.checkRateLimit(widgetId, apiName);
      expect(allowed).toBe(true);
    });
  });

  describe('Test Case 37.2.5: Unauthorized API Access', () => {
    it('should block access when no permissions exist', () => {
      (storageManager.getPermissions as jest.Mock).mockReturnValue(null);

      const hasPermission = permissionsManager.hasPermission('clock-widget', 'systemInfo.cpu');
      
      expect(hasPermission).toBe(false);
    });

    it('should block access when specific permission is not granted', () => {
      (storageManager.getPermissions as jest.Mock).mockReturnValue({
        systemInfo: { cpu: false, memory: true },
        network: { enabled: false, allowedDomains: [] }
      });

      const hasCPU = permissionsManager.hasPermission('system-monitor', 'systemInfo.cpu');
      const hasMemory = permissionsManager.hasPermission('system-monitor', 'systemInfo.memory');
      
      expect(hasCPU).toBe(false);
      expect(hasMemory).toBe(true);
    });

    it('should validate permission format', () => {
      // Mock permissions to exist so validation code path is reached
      (storageManager.getPermissions as jest.Mock).mockReturnValue({
        systemInfo: { cpu: true, memory: true },
        network: { enabled: true, allowedDomains: [] }
      });

      expect(() => {
        permissionsManager.hasPermission('test-widget', 'invalid.permission');
      }).toThrow();
    });

    it('should reject invalid permission strings', () => {
      // Mock permissions to exist so validation code path is reached
      (storageManager.getPermissions as jest.Mock).mockReturnValue({
        systemInfo: { cpu: true, memory: true },
        network: { enabled: true, allowedDomains: [] }
      });

      const invalidPermissions = [
        'systemInfo',
        'systemInfo.invalid',
        'network.enabled',
        'invalid',
        'systemInfo.cpu.extra'
      ];

      for (const permission of invalidPermissions) {
        expect(() => {
          permissionsManager.hasPermission('test-widget', permission);
        }).toThrow();
      }
    });

    it('should accept valid permission strings', () => {
      (storageManager.getPermissions as jest.Mock).mockReturnValue({
        systemInfo: { cpu: true, memory: true },
        network: { enabled: true, allowedDomains: [] }
      });

      const validPermissions = [
        'systemInfo.cpu',
        'systemInfo.memory',
        'network'
      ];

      for (const permission of validPermissions) {
        expect(() => {
          permissionsManager.hasPermission('test-widget', permission);
        }).not.toThrow();
      }
    });
  });

  describe('Permission Persistence', () => {
    it('should preserve existing permissions when adding new ones', async () => {
      // Mock existing permissions
      (storageManager.getPermissions as jest.Mock).mockReturnValue({
        systemInfo: { cpu: true, memory: false },
        network: { enabled: false, allowedDomains: [] }
      });

      (dialog.showMessageBox as jest.Mock).mockResolvedValue({ response: 0 });

      // Grant memory permission
      await permissionsManager.requestPermission({
        widgetId: 'system-monitor',
        widgetName: 'System Monitor',
        permission: 'systemInfo.memory'
      });

      // Verify both permissions are preserved
      const savedPermissions = (storageManager.savePermissions as jest.Mock).mock.calls[0][1];
      expect(savedPermissions.systemInfo.cpu).toBe(true);
      expect(savedPermissions.systemInfo.memory).toBe(true);
    });

    it('should handle network permissions correctly', async () => {
      (dialog.showMessageBox as jest.Mock).mockResolvedValue({ response: 0 });

      await permissionsManager.requestPermission({
        widgetId: 'weather-widget',
        widgetName: 'Weather Widget',
        permission: 'network'
      });

      const savedPermissions = (storageManager.savePermissions as jest.Mock).mock.calls[0][1];
      expect(savedPermissions.network.enabled).toBe(true);
    });
  });

  describe('Resource Cleanup', () => {
    it('should clean up resources on destroy', () => {
      const manager = new PermissionsManager(storageManager);
      
      // Verify cleanup interval is set
      expect((manager as any).cleanupInterval).not.toBeNull();
      
      // Destroy
      manager.destroy();
      
      // Verify cleanup interval is cleared
      expect((manager as any).cleanupInterval).toBeNull();
    });

    it('should allow multiple destroy calls safely', () => {
      const manager = new PermissionsManager(storageManager);
      
      expect(() => {
        manager.destroy();
        manager.destroy();
        manager.destroy();
      }).not.toThrow();
    });
  });

  describe('Edge Cases', () => {
    it('should handle concurrent permission requests', async () => {
      (dialog.showMessageBox as jest.Mock).mockResolvedValue({ response: 0 });

      const requests = [
        permissionsManager.requestPermission({
          widgetId: 'widget-1',
          widgetName: 'Widget 1',
          permission: 'systemInfo.cpu'
        }),
        permissionsManager.requestPermission({
          widgetId: 'widget-2',
          widgetName: 'Widget 2',
          permission: 'systemInfo.memory'
        }),
        permissionsManager.requestPermission({
          widgetId: 'widget-3',
          widgetName: 'Widget 3',
          permission: 'network'
        })
      ];

      const results = await Promise.all(requests);
      
      expect(results).toEqual([true, true, true]);
      expect(storageManager.savePermissions).toHaveBeenCalledTimes(3);
    });

    it('should handle empty widget ID', () => {
      expect(() => {
        permissionsManager.hasPermission('', 'systemInfo.cpu');
      }).not.toThrow();
    });

    it('should clear rate limits for specific widget', () => {
      const widgetId = 'system-monitor';
      const apiName = 'system:getCPU';

      // Make 10 calls
      for (let i = 0; i < 10; i++) {
        permissionsManager.checkRateLimit(widgetId, apiName);
      }

      // Should be blocked
      expect(permissionsManager.checkRateLimit(widgetId, apiName)).toBe(false);

      // Clear rate limits
      permissionsManager.clearRateLimits(widgetId);

      // Should be allowed again
      expect(permissionsManager.checkRateLimit(widgetId, apiName)).toBe(true);
    });

    it('should reset all rate limits', () => {
      const widget1 = 'widget-1';
      const widget2 = 'widget-2';
      const apiName = 'system:getCPU';

      // Make 10 calls for each widget
      for (let i = 0; i < 10; i++) {
        permissionsManager.checkRateLimit(widget1, apiName);
        permissionsManager.checkRateLimit(widget2, apiName);
      }

      // Both should be blocked
      expect(permissionsManager.checkRateLimit(widget1, apiName)).toBe(false);
      expect(permissionsManager.checkRateLimit(widget2, apiName)).toBe(false);

      // Reset all
      permissionsManager.resetAllRateLimits();

      // Both should be allowed again
      expect(permissionsManager.checkRateLimit(widget1, apiName)).toBe(true);
      expect(permissionsManager.checkRateLimit(widget2, apiName)).toBe(true);
    });
  });
});
