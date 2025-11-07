# Molecule Widget SDK

A React component library and API for creating desktop widgets that run in the Molecule Widget Container.

## Installation

```bash
npm install @molecule/widget-sdk react react-dom
```

## Quick Start

### Simple Clock Widget

```tsx
import React from 'react';
import { WidgetProvider, Widget, useInterval } from '@molecule/widget-sdk';

function ClockWidget() {
  const [time, setTime] = React.useState(new Date());
  
  useInterval(() => {
    setTime(new Date());
  }, 1000);
  
  return (
    <Widget.Container>
      <Widget.LargeText>
        {time.toLocaleTimeString()}
      </Widget.LargeText>
    </Widget.Container>
  );
}

export default function App() {
  return (
    <WidgetProvider>
      <ClockWidget />
    </WidgetProvider>
  );
}
```

### System Monitor Widget

```tsx
import React from 'react';
import { WidgetProvider, Widget, Stat, ProgressBar, useSystemInfo } from '@molecule/widget-sdk';

function SystemMonitor() {
  const memoryInfo = useSystemInfo('memory', 2000);
  
  if (!memoryInfo) return <Widget.SmallText>Loading...</Widget.SmallText>;
  
  const usagePercent = (memoryInfo.used / memoryInfo.total) * 100;
  
  return (
    <Widget.Container>
      <Widget.Header>System Monitor</Widget.Header>
      <Stat 
        label="Memory Used" 
        value={`${(memoryInfo.used / 1024 / 1024 / 1024).toFixed(1)} GB`}
        color="#3b82f6"
      />
      <ProgressBar value={usagePercent} color="#10b981" />
    </Widget.Container>
  );
}

export default function App() {
  return (
    <WidgetProvider>
      <SystemMonitor />
    </WidgetProvider>
  );
}
```

## Features

- **React-based**: Build widgets using familiar React patterns
- **TypeScript Support**: Full type definitions included
- **Pre-built Components**: 15+ UI components with glassmorphism design
- **Secure APIs**: Safe access to system information and storage
- **Development Mode**: Test widgets in the browser before deployment

## Development

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build library
npm run build

# Type check
npm run type-check
```

## Error Handling

The Widget SDK provides comprehensive error handling with standardized error types and user-friendly messages. See the [Error Handling Guide](./docs/error-handling.md) for detailed documentation.

### Quick Example

```tsx
import { useWidgetAPI, isWidgetError, WidgetErrorType } from '@molecule/widget-sdk';

function MyWidget() {
  const { storage } = useWidgetAPI();
  
  const saveData = async () => {
    try {
      await storage.set('myKey', 'myValue');
    } catch (error) {
      if (isWidgetError(error)) {
        console.error('Error type:', error.type);
        console.error('User message:', error.getUserMessage());
      }
    }
  };
  
  return <button onClick={saveData}>Save</button>;
}
```

### Error Types

- `PERMISSION_DENIED` - Permission required for operation
- `RATE_LIMIT_EXCEEDED` - Too many API calls
- `INVALID_CONFIG` - Invalid configuration or parameters
- `WIDGET_CRASHED` - Widget encountered an error
- `NETWORK_ERROR` - Network request failed
- `STORAGE_ERROR` - Storage operation failed

## API Reference

### Components

#### Widget.Container

The main container component for all widgets with glassmorphism effect.

```tsx
import { Widget } from '@molecule/widget-sdk';

<Widget.Container className="custom-class">
  {/* Your widget content */}
</Widget.Container>
```

**Props:**
- `children: React.ReactNode` - Widget content
- `className?: string` - Optional CSS class for custom styling

**Features:**
- Glassmorphism effect with backdrop blur
- Rounded corners (12px border radius)
- Semi-transparent background with border
- Fade-in animation on mount
- Box shadow for depth

#### Stat

Display a labeled statistic with optional icon and color.

```tsx
import { Stat } from '@molecule/widget-sdk';

<Stat 
  label="CPU Usage" 
  value="45%" 
  color="#3b82f6"
  icon={<CpuIcon />}
/>
```

**Props:**
- `label: string` - The label for the statistic
- `value: string | number` - The value to display
- `color?: string` - Optional color for the value text
- `icon?: React.ReactNode` - Optional icon to display
- `className?: string` - Optional CSS class for custom styling

#### ProgressBar

Display a progress bar with percentage value.

```tsx
import { ProgressBar } from '@molecule/widget-sdk';

<ProgressBar 
  value={75} 
  color="#10b981"
  showLabel={true}
/>
```

**Props:**
- `value: number` - Progress value (0-100)
- `color?: string` - Bar color (default: '#3b82f6')
- `showLabel?: boolean` - Show percentage label (default: true)
- `className?: string` - Optional CSS class for custom styling

**Features:**
- Automatically clamps value between 0-100
- Smooth visual transitions
- Customizable colors
- Optional percentage label

#### List and ListItem

Display lists of items with smooth animations and hover effects.

```tsx
import { Widget } from '@molecule/widget-sdk';

<Widget.List>
  <Widget.ListItem>Item 1</Widget.ListItem>
  <Widget.ListItem onClick={() => console.log('clicked')}>
    Clickable Item
  </Widget.ListItem>
  <Widget.ListItem active={true}>Active Item</Widget.ListItem>
  <Widget.ListItem icon={<Icon />}>Item with Icon</Widget.ListItem>
</Widget.List>
```

**List Props:**
- `children: React.ReactNode` - List items
- `className?: string` - Optional CSS class for custom styling

**ListItem Props:**
- `children: React.ReactNode` - Item content
- `onClick?: () => void` - Optional click handler (makes item clickable)
- `active?: boolean` - Highlight as active/selected
- `icon?: React.ReactNode` - Optional icon to display
- `className?: string` - Optional CSS class for custom styling

**Features:**
- Staggered fade-in animations (50ms delay per item, up to 6 items)
- Smooth hover effects with transform (translateX + scale) and shadow
- Active state styling with blue accent and glow
- Icon support with scale and rotate animation on hover
- Glassmorphism design with backdrop blur
- Smooth transitions using cubic-bezier easing

### Hooks

#### useInterval

Execute a callback function at regular intervals.

```tsx
import { useInterval } from '@molecule/widget-sdk';

useInterval(() => {
  // Your code here
}, 1000); // Run every 1000ms
```

#### useStorage

Access persistent storage for your widget.

```tsx
import { useStorage } from '@molecule/widget-sdk';

const [value, setValue, removeValue] = useStorage<string>('myKey', 'defaultValue');
```

#### useSettings

Access widget settings.

```tsx
import { useSettings } from '@molecule/widget-sdk';

const city = useSettings<string>('city', 'New York');
```

#### useSystemInfo

Access system information (requires permissions).

```tsx
import { useSystemInfo } from '@molecule/widget-sdk';

const cpuUsage = useSystemInfo('cpu', 2000); // Returns number (0-100)
const memoryInfo = useSystemInfo('memory', 2000); // Returns memory object
```

**Return Types:**
- `'cpu'`: Returns `number` - CPU usage percentage (0-100)
- `'memory'`: Returns `{ total: number, used: number, free: number, usagePercent: number }`

**Parameters:**
- `type`: `'cpu' | 'memory'` - Type of system information to retrieve
- `interval`: `number` - Update interval in milliseconds (minimum 100ms recommended)

#### useThrottle

Throttle a value to limit update frequency (performance optimization).

```tsx
import { useThrottle, useSystemInfo } from '@molecule/widget-sdk';

// Fetch every 100ms but display every 1s
const cpuUsage = useSystemInfo('cpu', 100);
const throttledCPU = useThrottle(cpuUsage, 1000);
```

**Benefits:**
- Reduces re-renders and improves performance
- Limits expensive operations
- Maintains data accuracy while optimizing display updates

See the [useThrottle documentation](./docs/hooks/useThrottle.md) for detailed usage examples.

### Provider

#### WidgetProvider

Wrap your widget app with this provider to enable API access.

```tsx
import { WidgetProvider } from '@molecule/widget-sdk';

<WidgetProvider>
  <YourWidget />
</WidgetProvider>
```

### Error Handling

#### WidgetError

Custom error class with additional context.

```tsx
import { WidgetError, WidgetErrorType } from '@molecule/widget-sdk';

const error = new WidgetError(
  WidgetErrorType.STORAGE_ERROR,
  'Failed to save data',
  'my-widget-id'
);

console.log(error.getUserMessage()); // User-friendly message
console.log(error.toJSON()); // Full error details
```

#### isWidgetError

Type guard to check if an error is a WidgetError.

```tsx
import { isWidgetError } from '@molecule/widget-sdk';

try {
  await someOperation();
} catch (error) {
  if (isWidgetError(error)) {
    console.log('Widget error:', error.type);
  }
}
```

#### toWidgetError

Convert any error to a WidgetError.

```tsx
import { toWidgetError } from '@molecule/widget-sdk';

try {
  await someOperation();
} catch (error) {
  const widgetError = toWidgetError(error, 'my-widget-id');
  console.error(widgetError.toJSON());
}
```

## Performance Optimization

The Widget SDK includes several features to help you build performant widgets:

### 1. Throttling Hook

Use `useThrottle` to limit how often values update:

```tsx
import { useThrottle, useSystemInfo } from '@molecule/widget-sdk';

function SystemMonitor() {
  // Fetch data every 100ms for accuracy
  const cpuUsage = useSystemInfo('cpu', 100);
  
  // But only update display every 1 second
  const throttledCPU = useThrottle(cpuUsage, 1000);
  
  return <div>CPU: {throttledCPU}%</div>;
}
```

### 2. Optimize Update Intervals

Choose appropriate intervals for different use cases:

```tsx
// ✅ Good: Reasonable intervals
useSystemInfo('cpu', 2000);      // Every 2 seconds
useInterval(fetchWeather, 600000); // Every 10 minutes

// ❌ Bad: Too frequent
useSystemInfo('cpu', 100);       // Every 100ms (too fast for display)
useInterval(fetchWeather, 1000); // Every second (unnecessary)
```

### 3. Memoize Expensive Calculations

```tsx
import { useMemo } from 'react';

function DataWidget() {
  const data = useStorage('data');
  
  // Memoize expensive calculation
  const processedData = useMemo(() => {
    return expensiveProcessing(data);
  }, [data]);
  
  return <div>{processedData}</div>;
}
```

### 4. Clean Up Resources

Always clean up subscriptions and timers:

```tsx
useEffect(() => {
  const subscription = subscribeToData();
  
  return () => subscription.unsubscribe();
}, []);
```

### Performance Best Practices

- Use `useThrottle` for high-frequency updates
- Choose appropriate update intervals (1-2s for system info, 10min for weather)
- Memoize expensive calculations with `useMemo`
- Clean up resources in `useEffect` cleanup functions
- Avoid creating objects in render (use `useMemo` or move outside component)
- Limit API calls (max 10 per second per widget)

See the [Performance Optimization Guide](../widget-container/docs/performance-optimization.md) for more details.

## Documentation

- [Error Handling Guide](./docs/error-handling.md) - Comprehensive error handling documentation
- [useThrottle Hook](./docs/hooks/useThrottle.md) - Detailed throttling documentation
- Full API documentation will be available after implementation is complete.

## License

MIT
