/**
 * Tests for PerformanceMonitor
 */

import { PerformanceMonitor } from '../performance-monitor';
import { WidgetInstance } from '../../types';

// Mock Electron
jest.mock('electron', () => ({
  app: {
    getAppMetrics: jest.fn()
  },
  BrowserWindow: jest.fn()
}));

describe('PerformanceMonitor', () => {
  let monitor: PerformanceMonitor;
  let mockWidgets: WidgetInstance[];
  let mockWindow: any;
  let mockApp: any;

  beforeEach(() => {
    jest.clearAllMocks();
    jest.useFakeTimers();

    monitor = new PerformanceMonitor();

    // Get mock app reference once
    mockApp = require('electron').app;

    // Create mock window
    mockWindow = {
      isDestroyed: jest.fn().mockReturnValue(false),
      webContents: {
        getOSProcessId: jest.fn().mockReturnValue(1234)
      }
    };

    // Create mock widgets
    mockWidgets = [
      {
        instanceId: 'widget-1',
        widgetId: 'test-widget',
        configPath: '/mock/path/widget.config.json',
        window: mockWindow as any,
        position: { x: 0, y: 0 },
        size: { width: 200, height: 200 },
        permissions: {
          systemInfo: { cpu: false, memory: false },
          network: { enabled: false, allowedDomains: [] }
        },
        createdAt: new Date(),
        config: {
          id: 'test-widget',
          name: 'test-widget',
          displayName: 'Test Widget',
          description: 'Test widget for performance monitoring',
          version: '1.0.0',
          author: { name: 'Test', email: 'test@test.com' },
          entryPoint: 'index.html',
          permissions: {
            systemInfo: { cpu: false, memory: false },
            network: { enabled: false, allowedDomains: [] }
          },
          sizes: { default: { width: 200, height: 200 } }
        }
      }
    ];

    // Mock app.getAppMetrics with default values
    mockApp.getAppMetrics.mockReturnValue([
      {
        pid: 1234,
        type: 'Renderer',
        cpu: { percentCPUUsage: 10 },
        memory: { workingSetSize: 50 * 1024 } // 50 MB
      }
    ]);
  });

  afterEach(() => {
    monitor.stop();
    jest.useRealTimers();
  });

  describe('start() and stop()', () => {
    it('should start monitoring', () => {
      const getWidgets = jest.fn().mockReturnValue(mockWidgets);
      monitor.start(getWidgets);

      expect(getWidgets).not.toHaveBeenCalled();

      // Fast-forward time
      jest.advanceTimersByTime(5000);

      expect(getWidgets).toHaveBeenCalled();
    });

    it('should not start if already running', () => {
      const consoleWarn = jest.spyOn(console, 'warn').mockImplementation();
      const getWidgets = jest.fn().mockReturnValue(mockWidgets);

      monitor.start(getWidgets);
      monitor.start(getWidgets);

      expect(consoleWarn).toHaveBeenCalledWith('Performance monitor already running');
      consoleWarn.mockRestore();
    });

    it('should stop monitoring', () => {
      const getWidgets = jest.fn().mockReturnValue(mockWidgets);
      monitor.start(getWidgets);
      monitor.stop();

      const callCount = getWidgets.mock.calls.length;
      jest.advanceTimersByTime(10000);

      expect(getWidgets).toHaveBeenCalledTimes(callCount);
    });
  });

  describe('metrics collection', () => {
    it('should collect metrics for widgets', async () => {
      const getWidgets = jest.fn().mockReturnValue(mockWidgets);
      monitor.start(getWidgets);

      // Wait for async operations
      jest.advanceTimersByTime(5000);
      await Promise.resolve();

      const history = monitor.getMetricsHistory('widget-1');
      expect(history.length).toBeGreaterThan(0);
      expect(history[0]).toMatchObject({
        instanceId: 'widget-1',
        widgetId: 'test-widget',
        cpuUsage: 10,
        memoryUsage: 50
      });
    });

    it('should skip destroyed windows', async () => {
      mockWindow.isDestroyed.mockReturnValue(true);
      const getWidgets = jest.fn().mockReturnValue(mockWidgets);
      
      monitor.start(getWidgets);
      jest.advanceTimersByTime(5000);
      await Promise.resolve();

      const history = monitor.getMetricsHistory('widget-1');
      expect(history.length).toBe(0);
    });

    it('should handle collection errors gracefully', async () => {
      const consoleError = jest.spyOn(console, 'error').mockImplementation();
      
      // Mock getAppMetrics to return non-array to trigger error
      mockApp.getAppMetrics.mockReturnValue({} as any);

      const getWidgets = jest.fn().mockReturnValue(mockWidgets);
      monitor.start(getWidgets);
      
      jest.advanceTimersByTime(5000);
      await Promise.resolve();

      expect(consoleError).toHaveBeenCalled();
      expect(consoleError).toHaveBeenCalledWith(
        expect.stringContaining('Failed to collect metrics for widget widget-1'),
        expect.any(Error)
      );
      consoleError.mockRestore();
    });
  });

  describe('memory leak prevention', () => {
    it('should clean up metrics for removed widgets', async () => {
      // Manually add metrics for widget-2
      const fakeMetrics = {
        instanceId: 'widget-2',
        widgetId: 'test-widget-2',
        cpuUsage: 15,
        memoryUsage: 60,
        timestamp: new Date()
      };
      
      // Access private method through any cast for testing
      (monitor as any).storeMetrics('widget-2', fakeMetrics);

      expect(monitor.getMetricsHistory('widget-1').length).toBe(0);
      expect(monitor.getMetricsHistory('widget-2').length).toBe(1);

      // Now run a check with only widget-1 - should clean up widget-2
      const getWidgets = jest.fn().mockReturnValue(mockWidgets);
      monitor.start(getWidgets);

      jest.advanceTimersByTime(5000);
      await Promise.resolve();

      // widget-2 should be cleaned up
      expect(monitor.getMetricsHistory('widget-2').length).toBe(0);
      // widget-1 should have metrics now
      expect(monitor.getMetricsHistory('widget-1').length).toBeGreaterThan(0);
    });

    it('should limit history size per widget', async () => {
      const getWidgets = jest.fn().mockReturnValue(mockWidgets);
      monitor.start(getWidgets);

      // Collect more than MAX_HISTORY_SIZE metrics
      for (let i = 0; i < 25; i++) {
        jest.advanceTimersByTime(5000);
        await Promise.resolve();
      }

      const history = monitor.getMetricsHistory('widget-1');
      expect(history.length).toBeLessThanOrEqual(20);
    });
  });

  describe('overlapping check prevention', () => {
    it('should skip check if previous check is still running', async () => {
      const consoleWarn = jest.spyOn(console, 'warn').mockImplementation();
      const consoleError = jest.spyOn(console, 'error').mockImplementation();
      
      // Make checkWidgetPerformance slow by adding a delay
      let checkInProgress = false;
      const originalCheck = (monitor as any).checkWidgetPerformance.bind(monitor);
      jest.spyOn(monitor as any, 'checkWidgetPerformance').mockImplementation(async function(this: any, getWidgets: any) {
        if (checkInProgress) {
          console.warn('Skipping performance check - previous check still running');
          return;
        }
        checkInProgress = true;
        await new Promise(resolve => setTimeout(resolve, 100));
        checkInProgress = false;
      });

      const getWidgets = jest.fn().mockReturnValue(mockWidgets);
      monitor.start(getWidgets);

      // Start first check
      jest.advanceTimersByTime(5000);
      
      // Try to start second check before first completes
      jest.advanceTimersByTime(5000);

      // Wait for async operations
      await Promise.resolve();
      await Promise.resolve();

      expect(consoleWarn).toHaveBeenCalledWith(
        'Skipping performance check - previous check still running'
      );
      
      consoleWarn.mockRestore();
      consoleError.mockRestore();
    });
  });

  describe('threshold checking', () => {
    it('should warn on high CPU usage', async () => {
      const consoleWarn = jest.spyOn(console, 'warn').mockImplementation();
      
      mockApp.getAppMetrics.mockReturnValue([
        {
          pid: 1234,
          type: 'Renderer',
          cpu: { percentCPUUsage: 25 }, // Above 20% threshold
          memory: { workingSetSize: 50 * 1024 }
        }
      ]);

      const getWidgets = jest.fn().mockReturnValue(mockWidgets);
      monitor.start(getWidgets);

      jest.advanceTimersByTime(5000);
      await Promise.resolve();

      expect(consoleWarn).toHaveBeenCalledWith(
        expect.stringContaining('high CPU usage: 25.0%')
      );
      
      consoleWarn.mockRestore();
    });

    it('should warn on high memory usage', async () => {
      const consoleWarn = jest.spyOn(console, 'warn').mockImplementation();
      
      mockApp.getAppMetrics.mockReturnValue([
        {
          pid: 1234,
          type: 'Renderer',
          cpu: { percentCPUUsage: 10 },
          memory: { workingSetSize: 150 * 1024 } // Above 100 MB threshold
        }
      ]);

      const getWidgets = jest.fn().mockReturnValue(mockWidgets);
      monitor.start(getWidgets);

      jest.advanceTimersByTime(5000);
      await Promise.resolve();

      expect(consoleWarn).toHaveBeenCalledWith(
        expect.stringContaining('high memory usage: 150.0 MB')
      );
      
      consoleWarn.mockRestore();
    });
  });

  describe('metrics history', () => {
    it('should return empty array for unknown widget', () => {
      const history = monitor.getMetricsHistory('unknown');
      expect(history).toEqual([]);
    });

    it('should calculate average metrics', async () => {
      const getWidgets = jest.fn().mockReturnValue(mockWidgets);
      monitor.start(getWidgets);

      // Collect multiple metrics
      for (let i = 0; i < 3; i++) {
        jest.advanceTimersByTime(5000);
        await Promise.resolve();
      }

      const avg = monitor.getAverageMetrics('widget-1');
      expect(avg).not.toBeNull();
      expect(avg?.cpuUsage).toBe(10);
      expect(avg?.memoryUsage).toBe(50);
    });

    it('should return null for unknown widget average', () => {
      const avg = monitor.getAverageMetrics('unknown');
      expect(avg).toBeNull();
    });

    it('should clear metrics for specific widget', async () => {
      const getWidgets = jest.fn().mockReturnValue(mockWidgets);
      monitor.start(getWidgets);

      jest.advanceTimersByTime(5000);
      await Promise.resolve();

      expect(monitor.getMetricsHistory('widget-1').length).toBeGreaterThan(0);
      
      monitor.clearMetrics('widget-1');
      
      expect(monitor.getMetricsHistory('widget-1').length).toBe(0);
    });

    it('should clear all metrics', async () => {
      const getWidgets = jest.fn().mockReturnValue(mockWidgets);
      monitor.start(getWidgets);

      jest.advanceTimersByTime(5000);
      await Promise.resolve();

      expect(monitor.getMetricsHistory('widget-1').length).toBeGreaterThan(0);
      
      monitor.clearAllMetrics();
      
      expect(monitor.getMetricsHistory('widget-1').length).toBe(0);
    });
  });

  describe('threshold management', () => {
    it('should use custom thresholds', () => {
      const customMonitor = new PerformanceMonitor({
        cpuWarningPercent: 30,
        memoryWarningMB: 200
      });

      const thresholds = customMonitor.getThresholds();
      expect(thresholds.cpuWarningPercent).toBe(30);
      expect(thresholds.memoryWarningMB).toBe(200);
    });

    it('should update thresholds', () => {
      monitor.updateThresholds({ cpuWarningPercent: 15 });
      
      const thresholds = monitor.getThresholds();
      expect(thresholds.cpuWarningPercent).toBe(15);
      expect(thresholds.memoryWarningMB).toBe(100); // Unchanged
    });
  });
});
