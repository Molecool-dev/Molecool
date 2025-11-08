# Widget SDK Hooks

React hooks for building widgets with the Molecool platform.

## Available Hooks

### useWidgetAPI

Access the complete Widget API context.

```tsx
import { useWidgetAPI } from '@Molecool/widget-sdk';

function MyWidget() {
  const api = useWidgetAPI();
  
  // Access storage
  await api.storage.set('key', 'value');
  
  // Access settings
  const setting = await api.settings.get('city');
  
  // Access system info
  const cpuUsage = await api.system.getCPU();
  
  // Control UI
  await api.ui.resize(400, 300);
}
```

### useInterval

Declarative interval hook with automatic cleanup.

```tsx
import { useInterval } from '@Molecool/widget-sdk';

function Clock() {
  const [time, setTime] = useState(new Date());
  
  // Update every second
  useInterval(() => {
    setTime(new Date());
  }, 1000);
  
  return <div>{time.toLocaleTimeString()}</div>;
}
```

Pass `null` as the delay to pause the interval:

```tsx
function PausableTimer() {
  const [isPaused, setIsPaused] = useState(false);
  
  useInterval(() => {
    // This runs only when not paused
  }, isPaused ? null : 1000);
}
```

### useStorage

Reactive storage hook with automatic state synchronization.

```tsx
import { useStorage } from '@Molecool/widget-sdk';

function Counter() {
  const [count, setCount, removeCount] = useStorage<number>('count', 0);
  
  return (
    <div>
      <div>Count: {count}</div>
      <button onClick={() => setCount((count || 0) + 1)}>
        Increment
      </button>
      <button onClick={removeCount}>
        Reset
      </button>
    </div>
  );
}
```

### useSettings

Access widget settings (read-only).

```tsx
import { useSettings, useAllSettings } from '@Molecool/widget-sdk';

function WeatherWidget() {
  const city = useSettings<string>('city', 'Taipei');
  const refreshInterval = useSettings<number>('refreshInterval', 60000);
  
  return (
    <div>
      <div>City: {city}</div>
      <div>Refresh every {refreshInterval / 1000}s</div>
    </div>
  );
}

function SettingsDisplay() {
  const allSettings = useAllSettings();
  
  return <pre>{JSON.stringify(allSettings, null, 2)}</pre>;
}
```

### useSystemInfo

Access system information with automatic refresh.

```tsx
import { useSystemInfo } from '@Molecool/widget-sdk';

function CPUMonitor() {
  const cpuUsage = useSystemInfo('cpu', 2000); // Refresh every 2s
  
  if (cpuUsage === null) {
    return <div>Loading...</div>;
  }
  
  return (
    <div>
      <div>CPU Usage: {cpuUsage.toFixed(1)}%</div>
      <ProgressBar value={cpuUsage} />
    </div>
  );
}

function MemoryMonitor() {
  const memoryInfo = useSystemInfo('memory', 2000);
  
  if (!memoryInfo) {
    return <div>Loading...</div>;
  }
  
  const usedGB = (memoryInfo.used / 1024 / 1024 / 1024).toFixed(1);
  const totalGB = (memoryInfo.total / 1024 / 1024 / 1024).toFixed(1);
  
  return (
    <div>
      <div>Memory: {usedGB} GB / {totalGB} GB</div>
      <ProgressBar value={memoryInfo.usagePercent} />
    </div>
  );
}
```

## Requirements

All hooks must be used within a `WidgetProvider`:

```tsx
import { WidgetProvider } from '@Molecool/widget-sdk';

function App() {
  return (
    <WidgetProvider>
      <MyWidget />
    </WidgetProvider>
  );
}
```

## Permissions

Some hooks require specific permissions in your `widget.config.json`:

- `useSystemInfo('cpu')` requires `systemInfo.cpu` permission
- `useSystemInfo('memory')` requires `systemInfo.memory` permission

Example configuration:

```json
{
  "permissions": {
    "systemInfo": {
      "cpu": true,
      "memory": true
    }
  }
}
```

## Development Mode

All hooks work in development mode (browser) using mock APIs. This allows you to develop and test widgets without running the Electron container.

## Testing

All hooks are fully tested. See the `__tests__` directory for examples of how to test components that use these hooks.
