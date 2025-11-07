# Performance Optimization Guide

This document describes the performance optimizations implemented in the Molecule Widget Platform to ensure smooth operation with multiple widgets running simultaneously.

## Overview

The platform implements several performance optimizations to meet the following requirements:
- **Requirement 15.1**: Keep total memory usage below 500MB with 5+ widgets
- **Requirement 15.2**: Maintain rendering at 30+ FPS
- **Requirement 15.3**: Monitor and warn about high CPU usage (>20%)
- **Requirement 15.4**: Implement API rate limiting (10 calls/second per widget)

## 1. BrowserWindow Performance Settings

### Hardware Acceleration

All widget windows are configured with optimized performance settings:

```typescript
webPreferences: {
  // Performance settings
  offscreen: false,        // Use hardware acceleration
  v8CacheOptions: 'code',  // Cache compiled JavaScript
  webgl: false,            // Disable WebGL (not needed for widgets)
  plugins: false           // Disable plugins
}
```

**Benefits:**
- Hardware acceleration improves rendering performance
- V8 code caching reduces JavaScript compilation overhead
- Disabling unused features (WebGL, plugins) reduces memory footprint

### Implementation Location
- `widget-container/src/main/window-controller.ts` - `createWidgetWindow()` method

## 2. Widget Limit Enforcement

The platform enforces a maximum of 10 concurrent widgets to prevent resource exhaustion.

```typescript
const maxWidgets = this.storageManager.getAppSetting('maxWidgets') ?? 10;
if (this.widgets.size >= maxWidgets) {
  throw new WidgetError(
    WidgetErrorType.INVALID_CONFIG,
    `Maximum widget limit reached (${maxWidgets})`
  );
}
```

**Configuration:**
- Default limit: 10 widgets
- Configurable via `appSettings.maxWidgets` in storage
- Prevents memory and CPU overload

### Implementation Location
- `widget-container/src/main/widget-manager.ts` - `createWidget()` method

## 3. Resource Cleanup

### Event Listener Cleanup

When widgets are closed, all event listeners are properly removed to prevent memory leaks:

```typescript
private cleanupWidget(instanceId: string): void {
  const widget = this.widgets.get(instanceId);
  
  if (widget) {
    // Remove all event listeners from window
    if (widget.window && !widget.window.isDestroyed()) {
      widget.window.removeAllListeners();
      widget.window.webContents.removeAllListeners();
    }
    
    // Clear performance metrics
    this.performanceMonitor.clearMetrics(instanceId);
    
    // Remove from widgets map
    this.widgets.delete(instanceId);
  }
}
```

**Benefits:**
- Prevents memory leaks from orphaned event listeners
- Cleans up performance monitoring data
- Ensures proper garbage collection

### Implementation Location
- `widget-container/src/main/widget-manager.ts` - `cleanupWidget()` method

## 4. CPU Usage Monitoring

### Performance Monitor

The `PerformanceMonitor` class continuously monitors widget CPU and memory usage:

```typescript
const performanceMonitor = new PerformanceMonitor({
  cpuWarningPercent: 20,      // Warn if CPU > 20%
  memoryWarningMB: 100,       // Warn if memory > 100MB
  checkIntervalMs: 5000       // Check every 5 seconds
});
```

**Features:**
- Monitors CPU usage percentage per widget
- Monitors memory usage in MB per widget
- Logs warnings when thresholds are exceeded
- Maintains metrics history for analysis
- Asynchronous metric collection for accurate measurements
- Prevents overlapping checks to avoid race conditions

### Warning Output

When a widget exceeds thresholds, warnings are logged:

```
⚠️  Widget "System Monitor" (abc-123) high CPU usage: 25.3% (threshold: 20%)
⚠️  Widget "Weather" (def-456) high memory usage: 120.5 MB (threshold: 100 MB)
```

### Async Implementation

The performance monitoring system uses asynchronous metric collection to ensure accurate measurements:

```typescript
// Metrics are collected asynchronously
private async checkWidgetPerformance(widgets: WidgetInstance[]): Promise<void> {
  this.isChecking = true;
  
  try {
    for (const widget of widgets) {
      const metrics = await this.collectMetrics(widget);
      this.storeMetrics(widget.instanceId, metrics);
      this.checkThresholds(widget, metrics);
    }
  } finally {
    this.isChecking = false;
  }
}
```

**Benefits:**
- Prevents overlapping performance checks
- Ensures accurate metric collection timing
- Handles errors gracefully without blocking monitoring
- Properly cleans up metrics for removed widgets

### Implementation Location
- `widget-container/src/main/performance-monitor.ts` - Complete implementation
- `widget-container/src/main/widget-manager.ts` - Integration

### Usage

```typescript
// Get performance monitor instance
const monitor = widgetManager.getPerformanceMonitor();

// Get metrics for a specific widget
const metrics = monitor.getMetricsHistory(instanceId);

// Get average metrics
const avgMetrics = monitor.getAverageMetrics(instanceId);

// Update thresholds
monitor.updateThresholds({
  cpuWarningPercent: 30,
  memoryWarningMB: 150
});
```

## 5. Throttling Hook (Widget SDK)

### useThrottle Hook

The Widget SDK provides a `useThrottle` hook to help developers optimize their widgets:

```typescript
import { useThrottle } from '@molecule/widget-sdk';

function SystemMonitor() {
  const cpuUsage = useSystemInfo('cpu', 100); // Updates every 100ms
  const throttledCPU = useThrottle(cpuUsage, 1000); // Display updates every 1s
  
  return <div>CPU: {throttledCPU}%</div>;
}
```

**Benefits:**
- Reduces unnecessary re-renders
- Limits update frequency for expensive operations
- Improves overall widget performance

**Use Cases:**
- Throttling system info updates
- Throttling search input
- Throttling scroll events
- Throttling resize events

### Implementation Location
- `widget-sdk/src/hooks/useThrottle.ts` - Hook implementation
- `widget-sdk/src/hooks/__tests__/useThrottle.test.ts` - Tests

## 6. API Rate Limiting

API rate limiting is implemented in the permissions system to prevent widget abuse:

```typescript
// Maximum 10 API calls per second per widget
const RATE_LIMIT = 10;
const RATE_LIMIT_WINDOW = 1000; // 1 second
```

**Implementation:**
- Tracks API calls per widget per second
- Throws `RATE_LIMIT_EXCEEDED` error when limit is reached
- Automatically cleans up old rate limit records to prevent memory leaks

### Implementation Location
- `widget-container/src/main/permissions.ts` - Rate limiting logic

## Performance Best Practices for Widget Developers

### 1. Use Throttling for Frequent Updates

```typescript
// ❌ Bad: Updates every 100ms
const cpuUsage = useSystemInfo('cpu', 100);

// ✅ Good: Fetches every 100ms, displays every 1s
const cpuUsage = useSystemInfo('cpu', 100);
const throttledCPU = useThrottle(cpuUsage, 1000);
```

### 2. Minimize Re-renders

```typescript
// ❌ Bad: Creates new object every render
<Widget.Container style={{ padding: 16 }}>

// ✅ Good: Memoize style object
const containerStyle = useMemo(() => ({ padding: 16 }), []);
<Widget.Container style={containerStyle}>
```

### 3. Use Appropriate Update Intervals

```typescript
// ❌ Bad: Updates too frequently
useInterval(() => fetchWeather(), 1000); // Every second

// ✅ Good: Reasonable update interval
useInterval(() => fetchWeather(), 600000); // Every 10 minutes
```

### 4. Clean Up Resources

```typescript
useEffect(() => {
  const subscription = subscribeToData();
  
  // ✅ Always clean up
  return () => subscription.unsubscribe();
}, []);
```

## Monitoring Performance

### Development Mode

In development, you can monitor widget performance in the console:

```
Widget "Clock" (abc-123) created
Performance monitor started (check interval: 5000ms)
Widget "Clock" (abc-123) - CPU: 2.3%, Memory: 45.2 MB
Widget "System Monitor" (def-456) - CPU: 5.1%, Memory: 62.8 MB
```

### Production Mode

In production, performance warnings are logged to help identify problematic widgets:

```
⚠️  Widget "Heavy Widget" high CPU usage: 25.3% (threshold: 20%)
```

## Shutdown and Cleanup

The widget manager properly cleans up all resources on shutdown:

```typescript
// Called when app is closing
widgetManager.destroy();
```

This ensures:
- Performance monitoring is stopped
- All widgets are closed properly
- All event listeners are removed
- All resources are freed

## Performance Metrics

Expected performance with 5 widgets running:

| Metric | Target | Typical |
|--------|--------|---------|
| Total Memory | < 500 MB | 250-350 MB |
| FPS | > 30 FPS | 60 FPS |
| CPU per Widget | < 20% | 2-10% |
| API Calls | < 10/sec | 1-5/sec |

## Troubleshooting

### High CPU Usage

If a widget shows high CPU usage:

1. Check for infinite loops or excessive re-renders
2. Use `useThrottle` to reduce update frequency
3. Optimize expensive calculations with `useMemo`
4. Reduce API call frequency

### High Memory Usage

If a widget shows high memory usage:

1. Check for memory leaks (event listeners, subscriptions)
2. Limit data storage (don't store large datasets)
3. Clean up resources in `useEffect` cleanup functions
4. Avoid creating large objects in render

### Performance Degradation

If overall performance degrades:

1. Check number of running widgets (limit to 10)
2. Review performance monitor logs
3. Identify problematic widgets
4. Close unused widgets
5. Restart the application

## Future Enhancements

Potential future optimizations:

1. **Widget Suspension**: Suspend inactive widgets to save resources
2. **Lazy Loading**: Load widget code only when needed
3. **Worker Threads**: Move heavy computations to worker threads
4. **Memory Limits**: Enforce per-widget memory limits
5. **Performance Profiling**: Built-in profiling tools for developers
