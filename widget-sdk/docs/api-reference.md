# Widget SDK API Reference

Complete reference for all exports from `@Molecool/widget-sdk`.

## Table of Contents

- [Core API](#core-api)
- [React Hooks](#react-hooks)
- [UI Components](#ui-components)
- [Error Handling](#error-handling)
- [TypeScript Types](#typescript-types)

## Core API

### WidgetProvider

Provider component that wraps your widget application and provides access to the Widget API.

```tsx
import { WidgetProvider } from '@Molecool/widget-sdk';

function App() {
  return (
    <WidgetProvider>
      <YourWidget />
    </WidgetProvider>
  );
}
```

**Props:**
- `children: React.ReactNode` - Your widget components
- `mockAPI?: boolean` - Use mock API for development (default: auto-detected)

### WidgetContext

React context for accessing the Widget API directly.

```tsx
import { WidgetContext } from '@Molecool/widget-sdk';

function MyComponent() {
  const api = useContext(WidgetContext);
  // Use api.storage, api.settings, api.ui, api.system
}
```

### createMockAPI

Creates a mock Widget API for testing and development.

```tsx
import { createMockAPI } from '@Molecool/widget-sdk';

const mockAPI = createMockAPI();
// Use in tests or development mode
```

## React Hooks

### useWidgetAPI

Access the complete Widget API.

```tsx
import { useWidgetAPI } from '@Molecool/widget-sdk';

function MyWidget() {
  const { storage, settings, ui, system } = useWidgetAPI();
  
  // Use any API namespace
}
```

**Returns:** `WidgetAPIContext` with four namespaces:
- `storage` - Persistent data storage
- `settings` - Widget configuration
- `ui` - UI interactions
- `system` - System information

### useStorage

Manage persistent storage with React state.

```tsx
import { useStorage } from '@Molecool/widget-sdk';

function MyWidget() {
  const [value, setValue, removeValue] = useStorage<string>('key', 'default');
  
  return (
    <button onClick={() => setValue('new value')}>
      Update: {value}
    </button>
  );
}
```

**Parameters:**
- `key: string` - Storage key
- `defaultValue: T` - Default value if key doesn't exist

**Returns:** `[value, setValue, removeValue]`

### useSettings

Access a single widget setting.

```tsx
import { useSettings } from '@Molecool/widget-sdk';

function MyWidget() {
  const city = useSettings<string>('city', 'New York');
  
  return <div>City: {city}</div>;
}
```

**Parameters:**
- `key: string` - Setting key
- `defaultValue: T` - Default value

**Returns:** `T` - Setting value

### useAllSettings

Access all widget settings at once.

```tsx
import { useAllSettings } from '@Molecool/widget-sdk';

function MyWidget() {
  const settings = useAllSettings();
  
  return <div>Settings: {JSON.stringify(settings)}</div>;
}
```

**Returns:** `Record<string, any>` - All settings

### useInterval

Execute a callback at regular intervals.

```tsx
import { useInterval } from '@Molecool/widget-sdk';

function Clock() {
  const [time, setTime] = useState(new Date());
  
  useInterval(() => {
    setTime(new Date());
  }, 1000);
  
  return <div>{time.toLocaleTimeString()}</div>;
}
```

**Parameters:**
- `callback: () => void` - Function to execute
- `delay: number` - Interval in milliseconds

### useSystemInfo

Access system information with automatic updates.

```tsx
import { useSystemInfo } from '@Molecool/widget-sdk';

function SystemMonitor() {
  const cpuUsage = useSystemInfo('cpu', 2000);
  const memoryInfo = useSystemInfo('memory', 2000);
  
  return (
    <div>
      <div>CPU: {cpuUsage}%</div>
      <div>Memory: {memoryInfo?.usagePercent}%</div>
    </div>
  );
}
```

**Parameters:**
- `type: 'cpu' | 'memory'` - Type of system info
- `interval: number` - Update interval in milliseconds

**Returns:**
- For `'cpu'`: `number | null` - CPU usage percentage (0-100)
- For `'memory'`: `SystemMemoryInfo | null` - Memory information object

### useThrottle

Throttle a value to limit update frequency.

```tsx
import { useThrottle, useSystemInfo } from '@Molecool/widget-sdk';

function SystemMonitor() {
  // Fetch every 100ms for accuracy
  const cpuUsage = useSystemInfo('cpu', 100);
  
  // Display every 1 second to reduce re-renders
  const throttledCPU = useThrottle(cpuUsage, 1000);
  
  return <div>CPU: {throttledCPU}%</div>;
}
```

**Parameters:**
- `value: T` - Value to throttle
- `delay: number` - Throttle delay in milliseconds

**Returns:** `T` - Throttled value

## UI Components

### Layout Components

#### Container

Main container for widgets with glassmorphism effect.

```tsx
import { Widget } from '@Molecool/widget-sdk';

<Widget.Container className="custom-class">
  {/* Content */}
</Widget.Container>
```

#### Grid

Grid layout container.

```tsx
import { Grid } from '@Molecool/widget-sdk';

<Grid columns={2} gap={16}>
  <div>Item 1</div>
  <div>Item 2</div>
</Grid>
```

#### Divider

Horizontal divider line.

```tsx
import { Divider } from '@Molecool/widget-sdk';

<Divider />
```

#### Header

Section header with larger text.

```tsx
import { Header } from '@Molecool/widget-sdk';

<Header>Section Title</Header>
```

### Typography Components

#### Title

Large heading text.

```tsx
import { Widget } from '@Molecool/widget-sdk';

<Widget.Title>Widget Title</Widget.Title>
```

#### LargeText

Large body text for primary content.

```tsx
import { Widget } from '@Molecool/widget-sdk';

<Widget.LargeText>12:34 PM</Widget.LargeText>
```

#### SmallText

Small body text for secondary content.

```tsx
import { Widget } from '@Molecool/widget-sdk';

<Widget.SmallText>Additional info</Widget.SmallText>
```

#### Link

Hyperlink component.

```tsx
import { Link } from '@Molecool/widget-sdk';

<Link href="https://example.com">Visit Site</Link>
```

### Interactive Components

#### Button

Interactive button with hover effects.

```tsx
import { Button } from '@Molecool/widget-sdk';

<Button onClick={() => console.log('clicked')}>
  Click Me
</Button>
```

#### Input

Text input field.

```tsx
import { Input } from '@Molecool/widget-sdk';

<Input 
  value={value}
  onChange={(e) => setValue(e.target.value)}
  placeholder="Enter text"
/>
```

#### Select

Dropdown select component.

```tsx
import { Select } from '@Molecool/widget-sdk';

<Select
  value={selected}
  onChange={(e) => setSelected(e.target.value)}
  options={[
    { value: 'option1', label: 'Option 1' },
    { value: 'option2', label: 'Option 2' }
  ]}
/>
```

### Display Components

#### Stat

Display a labeled statistic.

```tsx
import { Stat } from '@Molecool/widget-sdk';

<Stat 
  label="CPU Usage"
  value="45%"
  color="#3b82f6"
  icon={<CpuIcon />}
/>
```

#### ProgressBar

Progress indicator with percentage.

```tsx
import { ProgressBar } from '@Molecool/widget-sdk';

<ProgressBar 
  value={75}
  color="#10b981"
  showLabel={true}
/>
```

#### Badge

Status badge component.

```tsx
import { Badge } from '@Molecool/widget-sdk';

<Badge variant="success">Active</Badge>
<Badge variant="warning">Pending</Badge>
<Badge variant="error">Error</Badge>
```

#### List & ListItem

List container with animated items.

```tsx
import { Widget } from '@Molecool/widget-sdk';

<Widget.List>
  <Widget.ListItem>Item 1</Widget.ListItem>
  <Widget.ListItem onClick={() => {}}>Clickable</Widget.ListItem>
  <Widget.ListItem active={true}>Active Item</Widget.ListItem>
  <Widget.ListItem icon={<Icon />}>With Icon</Widget.ListItem>
</Widget.List>
```

## Error Handling

### ErrorBoundary

React error boundary component.

```tsx
import { ErrorBoundary } from '@Molecool/widget-sdk';

<ErrorBoundary>
  <YourWidget />
</ErrorBoundary>
```

### WidgetError

Custom error class with additional context.

```tsx
import { WidgetError, WidgetErrorType } from '@Molecool/widget-sdk';

throw new WidgetError(
  WidgetErrorType.STORAGE_ERROR,
  'Failed to save data',
  'my-widget-id'
);
```

**Constructor:**
- `type: WidgetErrorType` - Error type
- `message: string` - Error message
- `widgetId?: string` - Widget identifier
- `details?: any` - Additional error details

**Methods:**
- `getUserMessage(): string` - Get user-friendly error message
- `toJSON(): object` - Serialize error to JSON

### isWidgetError

Type guard to check if an error is a WidgetError.

```tsx
import { isWidgetError } from '@Molecool/widget-sdk';

try {
  await operation();
} catch (error) {
  if (isWidgetError(error)) {
    console.log('Widget error:', error.type);
  }
}
```

### toWidgetError

Convert any error to a WidgetError.

```tsx
import { toWidgetError } from '@Molecool/widget-sdk';

try {
  await operation();
} catch (error) {
  const widgetError = toWidgetError(error, 'my-widget-id');
  console.error(widgetError.toJSON());
}
```

## TypeScript Types

### WidgetAPIContext

```typescript
interface WidgetAPIContext {
  storage: StorageAPI;
  settings: SettingsAPI;
  ui: UIAPI;
  system: SystemAPI;
}
```

### StorageAPI

```typescript
interface StorageAPI {
  get<T>(key: string): Promise<T | null>;
  set<T>(key: string, value: T): Promise<void>;
  remove(key: string): Promise<void>;
  clear(): Promise<void>;
}
```

### SettingsAPI

```typescript
interface SettingsAPI {
  get<T>(key: string): Promise<T | null>;
  getAll(): Promise<Record<string, any>>;
  set<T>(key: string, value: T): Promise<void>;
}
```

### SystemAPI

```typescript
interface SystemAPI {
  getCPU(): Promise<number>;
  getMemory(): Promise<SystemMemoryInfo>;
}
```

### SystemMemoryInfo

```typescript
interface SystemMemoryInfo {
  total: number;      // Total memory in bytes
  used: number;       // Used memory in bytes
  free: number;       // Free memory in bytes
  usagePercent: number; // Usage percentage (0-100)
}
```

### UIAPI

```typescript
interface UIAPI {
  setSize(width: number, height: number): Promise<void>;
  close(): Promise<void>;
}
```

### WidgetConfig

```typescript
interface WidgetConfig {
  id: string;
  name: string;
  displayName: string;
  version: string;
  description: string;
  author: {
    name: string;
    email: string;
  };
  permissions: {
    systemInfo: {
      cpu: boolean;
      memory: boolean;
    };
    network: {
      enabled: boolean;
      domains?: string[];
    };
  };
  sizes: {
    default: {
      width: number;
      height: number;
    };
  };
  entryPoint: string;
}
```

### WidgetErrorType

```typescript
enum WidgetErrorType {
  PERMISSION_DENIED = 'PERMISSION_DENIED',
  RATE_LIMIT_EXCEEDED = 'RATE_LIMIT_EXCEEDED',
  INVALID_CONFIG = 'INVALID_CONFIG',
  WIDGET_CRASHED = 'WIDGET_CRASHED',
  NETWORK_ERROR = 'NETWORK_ERROR',
  STORAGE_ERROR = 'STORAGE_ERROR',
  UNKNOWN = 'UNKNOWN'
}
```

## Constants

### SDK_VERSION

Current version of the Widget SDK.

```tsx
import { SDK_VERSION } from '@Molecool/widget-sdk';

console.log('SDK Version:', SDK_VERSION); // "1.0.0"
```

---

For more detailed documentation, see:
- [Error Handling Guide](./error-handling.md)
- [useThrottle Hook](./hooks/useThrottle.md)
- [Main README](../README.md)
