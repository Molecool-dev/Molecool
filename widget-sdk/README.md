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

const memoryInfo = useSystemInfo('memory', 2000); // Update every 2 seconds
```

### Provider

#### WidgetProvider

Wrap your widget app with this provider to enable API access.

```tsx
import { WidgetProvider } from '@molecule/widget-sdk';

<WidgetProvider>
  <YourWidget />
</WidgetProvider>
```

## Documentation

Full documentation will be available after implementation is complete.

## License

MIT
