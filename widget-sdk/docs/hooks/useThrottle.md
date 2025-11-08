# useThrottle Hook

A React hook that throttles a value, only updating it at most once per specified delay. This is essential for performance optimization when dealing with frequently changing values.

## Import

```tsx
import { useThrottle } from '@Molecool/widget-sdk';
```

## Signature

```tsx
function useThrottle<T>(value: T, delay: number): T
```

## Parameters

- `value: T` - The value to throttle (can be any type)
- `delay: number` - Minimum delay in milliseconds between updates

## Returns

- `T` - The throttled value (same type as input)

## How It Works

The `useThrottle` hook ensures that a value updates at most once per specified delay period:

1. **Immediate Update**: If enough time has passed since the last update, the value updates immediately
2. **Scheduled Update**: If not enough time has passed, the update is scheduled for later
3. **Memory Safe**: Automatically cleans up timeouts to prevent memory leaks

## Use Cases

### 1. System Monitoring

Fetch data frequently for accuracy, but update display less often for performance:

```tsx
import { useThrottle, useSystemInfo } from '@Molecool/widget-sdk';

function SystemMonitor() {
  // Fetch CPU usage every 100ms for accurate data
  const cpuUsage = useSystemInfo('cpu', 100);
  
  // But only update the display every 1 second
  const throttledCPU = useThrottle(cpuUsage, 1000);
  
  return (
    <Widget.Container>
      <Stat label="CPU Usage" value={`${throttledCPU}%`} />
    </Widget.Container>
  );
}
```

**Benefits:**
- Accurate data collection (100ms intervals)
- Smooth UI updates (1s intervals)
- Reduced re-renders (10x fewer)

### 2. Search Input

Throttle search queries to reduce API calls:

```tsx
import { useState, useEffect } from 'react';
import { useThrottle } from '@Molecool/widget-sdk';

function SearchWidget() {
  const [searchTerm, setSearchTerm] = useState('');
  const throttledSearchTerm = useThrottle(searchTerm, 500);
  
  useEffect(() => {
    // This only runs at most once every 500ms
    if (throttledSearchTerm) {
      performSearch(throttledSearchTerm);
    }
  }, [throttledSearchTerm]);
  
  return (
    <Widget.Container>
      <Input
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        placeholder="Search..."
      />
    </Widget.Container>
  );
}
```

### 3. Real-time Data Display

Throttle rapidly changing values for better readability:

```tsx
import { useThrottle } from '@Molecool/widget-sdk';

function StockTicker({ stockPrice }: { stockPrice: number }) {
  // Stock price updates every 50ms, but display updates every 2s
  const throttledPrice = useThrottle(stockPrice, 2000);
  
  return (
    <Widget.Container>
      <Widget.LargeText>${throttledPrice.toFixed(2)}</Widget.LargeText>
    </Widget.Container>
  );
}
```

### 4. Scroll Position Tracking

Throttle scroll events to improve performance:

```tsx
import { useState, useEffect } from 'react';
import { useThrottle } from '@Molecool/widget-sdk';

function ScrollWidget() {
  const [scrollY, setScrollY] = useState(0);
  const throttledScrollY = useThrottle(scrollY, 200);
  
  useEffect(() => {
    const handleScroll = () => setScrollY(window.scrollY);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);
  
  return (
    <Widget.Container>
      <Widget.SmallText>Scroll: {throttledScrollY}px</Widget.SmallText>
    </Widget.Container>
  );
}
```

## Performance Comparison

### Without Throttling

```tsx
// Updates every 100ms = 10 updates/second = 600 updates/minute
const cpuUsage = useSystemInfo('cpu', 100);
return <div>CPU: {cpuUsage}%</div>;
```

**Impact:**
- 600 re-renders per minute
- High CPU usage from React reconciliation
- Potential UI jank

### With Throttling

```tsx
// Fetches every 100ms, displays every 1000ms = 1 update/second = 60 updates/minute
const cpuUsage = useSystemInfo('cpu', 100);
const throttledCPU = useThrottle(cpuUsage, 1000);
return <div>CPU: {throttledCPU}%</div>;
```

**Impact:**
- 60 re-renders per minute (10x reduction)
- Lower CPU usage
- Smooth, readable UI
- Still accurate data collection

## Best Practices

### 1. Choose Appropriate Delays

```tsx
// ✅ Good: Reasonable delays for different use cases
useThrottle(cpuUsage, 1000);      // System info: 1 second
useThrottle(searchTerm, 500);     // Search: 500ms
useThrottle(scrollY, 200);        // Scroll: 200ms
useThrottle(stockPrice, 2000);    // Stock price: 2 seconds

// ❌ Bad: Too short (no benefit)
useThrottle(cpuUsage, 10);        // Too fast, defeats purpose

// ❌ Bad: Too long (poor UX)
useThrottle(searchTerm, 5000);    // 5 seconds is too slow for search
```

### 2. Combine with Other Hooks

```tsx
import { useThrottle, useSystemInfo, useStorage } from '@Molecool/widget-sdk';

function AdvancedMonitor() {
  // Fetch frequently
  const cpuUsage = useSystemInfo('cpu', 100);
  const memoryInfo = useSystemInfo('memory', 100);
  
  // Display less frequently
  const throttledCPU = useThrottle(cpuUsage, 1000);
  const throttledMemory = useThrottle(memoryInfo, 1000);
  
  // Store historical data
  const [history, setHistory] = useStorage('history', []);
  
  useEffect(() => {
    // Only save to storage when throttled value changes
    setHistory([...history, { cpu: throttledCPU, time: Date.now() }]);
  }, [throttledCPU]);
  
  return (
    <Widget.Container>
      <Stat label="CPU" value={`${throttledCPU}%`} />
      <Stat label="Memory" value={`${throttledMemory?.used} MB`} />
    </Widget.Container>
  );
}
```

### 3. Don't Throttle User Input Directly

```tsx
// ❌ Bad: Throttling the input value creates laggy typing
const [text, setText] = useState('');
const throttledText = useThrottle(text, 500);
return <input value={throttledText} onChange={e => setText(e.target.value)} />;

// ✅ Good: Keep input responsive, throttle the side effect
const [text, setText] = useState('');
const throttledText = useThrottle(text, 500);

useEffect(() => {
  // Only the search is throttled, not the typing
  performSearch(throttledText);
}, [throttledText]);

return <input value={text} onChange={e => setText(e.target.value)} />;
```

### 4. Memory Leak Prevention

The hook automatically cleans up timeouts, but ensure you don't create new hooks in loops:

```tsx
// ✅ Good: Single hook instance
function MyWidget() {
  const value = useThrottle(data, 1000);
  return <div>{value}</div>;
}

// ❌ Bad: Creating hooks in loops
function MyWidget({ items }) {
  return items.map(item => {
    const throttled = useThrottle(item.value, 1000); // ❌ Violates Rules of Hooks
    return <div>{throttled}</div>;
  });
}
```

## Throttle vs Debounce

### Throttle (useThrottle)

- **Guarantees** updates at regular intervals
- First call executes immediately
- Subsequent calls are limited to one per delay period
- **Use for:** Continuous updates (system monitoring, scroll tracking)

```tsx
// Updates at most once per second
const throttled = useThrottle(value, 1000);
// Timeline: 0ms ✓, 500ms ✗, 1000ms ✓, 1500ms ✗, 2000ms ✓
```

### Debounce (not included in SDK)

- **Delays** execution until activity stops
- Resets timer on each call
- Only executes after quiet period
- **Use for:** One-time actions after user stops (search after typing stops)

```tsx
// Only updates after user stops typing for 1 second
const debounced = useDebounce(value, 1000);
// Timeline: 0ms ✗, 500ms ✗, 1000ms ✗, 1500ms ✗, 2500ms ✓ (if no more changes)
```

## TypeScript Support

The hook is fully typed and works with any data type:

```tsx
// Primitives
const throttledNumber = useThrottle<number>(42, 1000);
const throttledString = useThrottle<string>('hello', 1000);
const throttledBoolean = useThrottle<boolean>(true, 1000);

// Objects
interface SystemInfo {
  cpu: number;
  memory: number;
}
const throttledInfo = useThrottle<SystemInfo>(info, 1000);

// Arrays
const throttledArray = useThrottle<number[]>([1, 2, 3], 1000);

// Type inference works automatically
const cpuUsage = useSystemInfo('cpu', 100); // number | null
const throttled = useThrottle(cpuUsage, 1000); // number | null (inferred)
```

## Common Patterns

### Pattern 1: Dual-Rate System Monitoring

```tsx
function DualRateMonitor() {
  // Fast collection for accuracy
  const fastCPU = useSystemInfo('cpu', 100);
  
  // Slow display for performance
  const displayCPU = useThrottle(fastCPU, 1000);
  
  // Medium rate for logging
  const logCPU = useThrottle(fastCPU, 5000);
  
  useEffect(() => {
    console.log('CPU log:', logCPU);
  }, [logCPU]);
  
  return <Stat label="CPU" value={`${displayCPU}%`} />;
}
```

### Pattern 2: Conditional Throttling

```tsx
function AdaptiveMonitor() {
  const [isActive, setIsActive] = useState(true);
  const cpuUsage = useSystemInfo('cpu', 100);
  
  // Throttle more aggressively when inactive
  const throttleDelay = isActive ? 1000 : 5000;
  const throttledCPU = useThrottle(cpuUsage, throttleDelay);
  
  return (
    <Widget.Container>
      <Stat label="CPU" value={`${throttledCPU}%`} />
      <Button onClick={() => setIsActive(!isActive)}>
        {isActive ? 'Pause' : 'Resume'}
      </Button>
    </Widget.Container>
  );
}
```

### Pattern 3: Multi-Value Throttling

```tsx
function MultiMetricMonitor() {
  const cpu = useSystemInfo('cpu', 100);
  const memory = useSystemInfo('memory', 100);
  
  // Throttle both with same delay
  const throttledCPU = useThrottle(cpu, 1000);
  const throttledMemory = useThrottle(memory, 1000);
  
  return (
    <Widget.Container>
      <Stat label="CPU" value={`${throttledCPU}%`} />
      <Stat label="Memory" value={`${throttledMemory?.used} MB`} />
    </Widget.Container>
  );
}
```

## Troubleshooting

### Issue: Value not updating

**Problem:** The throttled value seems stuck.

**Solution:** Check that the input value is actually changing:

```tsx
// Debug by logging both values
console.log('Original:', value);
console.log('Throttled:', throttledValue);
```

### Issue: Updates too slow

**Problem:** The delay feels too long.

**Solution:** Reduce the delay parameter:

```tsx
// Try shorter delays
const throttled = useThrottle(value, 500); // Instead of 1000
```

### Issue: Too many re-renders

**Problem:** Component still re-renders too often.

**Solution:** Ensure you're throttling the right value:

```tsx
// ❌ Wrong: Throttling after expensive operation
const processed = expensiveOperation(data);
const throttled = useThrottle(processed, 1000);

// ✅ Right: Throttle before expensive operation
const throttled = useThrottle(data, 1000);
const processed = expensiveOperation(throttled);
```

## Related Hooks

- [`useInterval`](./useInterval.md) - Execute callbacks at regular intervals
- [`useSystemInfo`](./useSystemInfo.md) - Fetch system information
- [`useStorage`](./useStorage.md) - Persistent storage access

## See Also

- [Performance Optimization Guide](../../widget-container/docs/performance-optimization.md)
- [Widget SDK API Reference](../README.md)
- [Error Handling Guide](../error-handling.md)

