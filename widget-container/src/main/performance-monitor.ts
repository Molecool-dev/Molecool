/**
 * Performance Monitor
 * 
 * Monitors widget performance metrics including CPU usage and memory consumption.
 * Logs warnings when widgets exceed performance thresholds.
 */

import { BrowserWindow, app } from 'electron';
import { WidgetInstance } from '../types';

export interface PerformanceMetrics {
  instanceId: string;
  widgetId: string;
  cpuUsage: number;
  memoryUsage: number;
  timestamp: Date;
}

export interface PerformanceThresholds {
  cpuWarningPercent: number;
  memoryWarningMB: number;
  checkIntervalMs: number;
}

const DEFAULT_THRESHOLDS: PerformanceThresholds = {
  cpuWarningPercent: 20,
  memoryWarningMB: 100,
  checkIntervalMs: 5000
};

export class PerformanceMonitor {
  private monitorInterval: NodeJS.Timeout | null = null;
  private thresholds: PerformanceThresholds;
  private metricsHistory: Map<string, PerformanceMetrics[]> = new Map();
  private readonly MAX_HISTORY_SIZE = 20; // Keep last 20 measurements per widget
  private isChecking = false; // Prevent overlapping checks

  constructor(thresholds: Partial<PerformanceThresholds> = {}) {
    this.thresholds = { ...DEFAULT_THRESHOLDS, ...thresholds };
  }

  /**
   * Start monitoring widget performance
   */
  start(getWidgets: () => WidgetInstance[]): void {
    if (this.monitorInterval) {
      console.warn('Performance monitor already running');
      return;
    }

    console.log(`Starting performance monitor (check interval: ${this.thresholds.checkIntervalMs}ms)`);

    this.monitorInterval = setInterval(() => {
      // Prevent overlapping checks
      if (this.isChecking) {
        console.warn('Skipping performance check - previous check still running');
        return;
      }
      
      this.checkWidgetPerformance(getWidgets()).catch(error => {
        console.error('Performance check failed:', error);
      });
    }, this.thresholds.checkIntervalMs);
  }

  /**
   * Stop monitoring
   */
  stop(): void {
    if (this.monitorInterval) {
      clearInterval(this.monitorInterval);
      this.monitorInterval = null;
      console.log('Performance monitor stopped');
    }
  }

  /**
   * Check performance of all running widgets
   */
  private async checkWidgetPerformance(widgets: WidgetInstance[]): Promise<void> {
    this.isChecking = true;
    
    try {
      // Clean up metrics for widgets that no longer exist
      const activeInstanceIds = new Set(widgets.map(w => w.instanceId));
      for (const instanceId of this.metricsHistory.keys()) {
        if (!activeInstanceIds.has(instanceId)) {
          this.metricsHistory.delete(instanceId);
        }
      }

      // Collect metrics for all active widgets
      for (const widget of widgets) {
        if (!widget.window || widget.window.isDestroyed()) {
          continue;
        }

        try {
          const metrics = await this.collectMetrics(widget);
          this.storeMetrics(widget.instanceId, metrics);
          this.checkThresholds(widget, metrics);
        } catch (error) {
          console.error(`Failed to collect metrics for widget ${widget.instanceId}:`, error);
        }
      }
    } finally {
      this.isChecking = false;
    }
  }

  /**
   * Collect performance metrics for a widget
   */
  private async collectMetrics(widget: WidgetInstance): Promise<PerformanceMetrics> {
    const window = widget.window as BrowserWindow;
    
    // Get app-level metrics
    const appMetrics = app.getAppMetrics();
    
    // Validate that appMetrics is an array
    if (!Array.isArray(appMetrics)) {
      throw new Error('app.getAppMetrics() did not return an array');
    }
    
    // Find the metrics for this window's process
    const windowPid = window.webContents.getOSProcessId();
    const processMetric = appMetrics.find(m => m.pid === windowPid);
    
    // Calculate memory usage in MB (using working set memory)
    const memoryUsageMB = processMetric 
      ? processMetric.memory.workingSetSize / 1024 
      : 0;

    // Get CPU usage
    const cpuUsage = processMetric 
      ? processMetric.cpu.percentCPUUsage 
      : 0;

    return {
      instanceId: widget.instanceId,
      widgetId: widget.widgetId,
      cpuUsage,
      memoryUsage: memoryUsageMB,
      timestamp: new Date()
    };
  }



  /**
   * Store metrics in history
   */
  private storeMetrics(instanceId: string, metrics: PerformanceMetrics): void {
    let history = this.metricsHistory.get(instanceId);
    
    if (!history) {
      history = [];
      this.metricsHistory.set(instanceId, history);
    }

    history.push(metrics);

    // Keep only the last N measurements
    if (history.length > this.MAX_HISTORY_SIZE) {
      history.shift();
    }
  }

  /**
   * Check if metrics exceed thresholds and log warnings
   */
  private checkThresholds(widget: WidgetInstance, metrics: PerformanceMetrics): void {
    // Check CPU usage
    if (metrics.cpuUsage > this.thresholds.cpuWarningPercent) {
      console.warn(
        `⚠️  Widget "${widget.config.displayName}" (${widget.instanceId}) ` +
        `high CPU usage: ${metrics.cpuUsage.toFixed(1)}% ` +
        `(threshold: ${this.thresholds.cpuWarningPercent}%)`
      );
    }

    // Check memory usage
    if (metrics.memoryUsage > this.thresholds.memoryWarningMB) {
      console.warn(
        `⚠️  Widget "${widget.config.displayName}" (${widget.instanceId}) ` +
        `high memory usage: ${metrics.memoryUsage.toFixed(1)} MB ` +
        `(threshold: ${this.thresholds.memoryWarningMB} MB)`
      );
    }
  }

  /**
   * Get metrics history for a widget
   */
  getMetricsHistory(instanceId: string): PerformanceMetrics[] {
    return this.metricsHistory.get(instanceId) || [];
  }

  /**
   * Get average metrics for a widget over the history
   */
  getAverageMetrics(instanceId: string): PerformanceMetrics | null {
    const history = this.metricsHistory.get(instanceId);
    
    if (!history || history.length === 0) {
      return null;
    }

    const avgCPU = history.reduce((sum, m) => sum + m.cpuUsage, 0) / history.length;
    const avgMemory = history.reduce((sum, m) => sum + m.memoryUsage, 0) / history.length;

    return {
      instanceId,
      widgetId: history[0].widgetId,
      cpuUsage: avgCPU,
      memoryUsage: avgMemory,
      timestamp: new Date()
    };
  }

  /**
   * Clear metrics history for a widget
   */
  clearMetrics(instanceId: string): void {
    this.metricsHistory.delete(instanceId);
  }

  /**
   * Clear all metrics history
   */
  clearAllMetrics(): void {
    this.metricsHistory.clear();
  }

  /**
   * Get current thresholds
   */
  getThresholds(): PerformanceThresholds {
    return { ...this.thresholds };
  }

  /**
   * Update thresholds
   */
  updateThresholds(thresholds: Partial<PerformanceThresholds>): void {
    this.thresholds = { ...this.thresholds, ...thresholds };
    console.log('Performance thresholds updated:', this.thresholds);
  }
}
