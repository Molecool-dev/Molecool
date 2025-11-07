# Widget Developer Guide

Complete guide to building widgets for the Molecule platform.

## Table of Contents

- [Getting Started](#getting-started)
- [Widget SDK API Reference](#widget-sdk-api-reference)
- [Widget Configuration](#widget-configuration)
- [Permission System](#permission-system)
- [UI Components](#ui-components)
- [React Hooks](#react-hooks)
- [Best Practices](#best-practices)
- [Testing](#testing)
- [Publishing](#publishing)

## Getting Started

### Prerequisites

- Node.js 18+
- npm or yarn
- Basic knowledge of React and TypeScript

### Project Setup

#### 1. Create Widget Project

```bash
mkdir my-widget
cd my-widget
npm init -y
```

#### 2. Install Dependencies

```bash
# Core dependencies
npm install @molecule/widget-sdk react react-dom

# Development dependencies
npm install -D vite @vitejs/plugin-react typescript @types/react @types/react-dom
```

#### 3. Configure TypeScript

Create `tsconfig.json`:

```json
{
  "compilerOptions": {
    "target": "ES2020",
    "lib": ["ES2020", "DOM", "DOM.Iterable"],
    "module": "ESNext",
    "moduleResolution": "bundler",
    "jsx": "react-jsx",
    "strict": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "resolveJsonModule": true
  },
  "include": ["src"]
}
```

#### 4. Configure Vite

Create `vite.config.ts`:

```typescript
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  build: {
    outDir: 'dist',
    rollupOptions: {
      input: {
        main: './index.html'
      }
    }
  }
});
```

#### 5. Create Entry HTML

Create `index.html`:

```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>My Widget</title>
</head>
<body>
  <div id="root"></div>
  <script type="module" src="/src/index.tsx"></script>
</body>
</html>
```

#### 6. Create Widget Component

Create `src/index.tsx`:

```tsx
import React from 'react';
import { createRoot } from 'react-dom/client';
import { WidgetProvider, Widget } from '@molecule/widget-sdk';

const MyWidget: React.FC = () => {
  return (
    <Widget.Container>
      <Widget.Title>Hello Widget</Widget.Title>
      <Widget.SmallText>My first widget</Widget.SmallText>
    </Widget.Container>
  );
};

const root = createRoot(document.getElementById('root')!);
root.render(
  <WidgetProvider>
    <MyWidget />
  </WidgetProvider>
);
```

#### 7. Add Build Scripts

Update `package.json`:

```json
{
  "scripts": {
    "dev": "vite",
    "build": "vite build",
    "preview": "vite preview"
  }
}
```

#### 8. Create Widget Configuration

Create `widget.config.json` (see [Widget Configuration](#widget-configuration) section).

### Development Workflow

```bash
# Start development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

The development server runs at `http://localhost:5173` with hot reload enabled.

## Widget SDK API Reference

### Core APIs

The Widget SDK provides four main API namespaces accessible through hooks:

#### Storage API

Persistent key-value storage for widget data.

```typescript
interface StorageAPI {
  get<T = any>(key: string): Promise<T | undefined>;
  set<T = any>(key: string, value: T): Promise<void>;
  remove(key: string): Promise<void>;
}
```

**Example:**

```tsx
import { useWidgetAPI } from '@molecule/widget-sdk';

const MyWidget = () => {
  const { storage } = useWidgetAPI();
  
  const saveData = async () => {
    await storage.set('myKey', { value: 42 });
  };
  
  const loadData = async () => {
    const data = await storage.get('myKey');
    console.log(data); // { value: 42 }
  };
  
  return <button onClick={saveData}>Save</button>;
};
```

#### Settings API

Read-only access to widget settings (configured by users).

```typescript
interface SettingsAPI {
  get<T = any>(key: string): Promise<T | undefined>;
  getAll(): Promise<Record<string, any>>;
}
```

**Example:**

```tsx
const MyWidget = () => {
  const { settings } = useWidgetAPI();
  
  useEffect(() => {
    settings.get('city').then(city => {
      console.log('User city:', city);
    });
  }, []);
};
```

#### System API

Access to system information (requires permissions).

```typescript
interface SystemAPI {
  getCPU(): Promise<number>;
  getMemory(): Promise<{
    total: number;
    used: number;
    free: number;
    usagePercent: number;
  }>;
}
```

**Example:**

```tsx
const SystemMonitor = () => {
  const { system } = useWidgetAPI();
  const [cpu, setCpu] = useState(0);
  
  useInterval(async () => {
    const usage = await system.getCPU();
    setCpu(usage);
  }, 2000);
  
  return <div>CPU: {cpu.toFixed(1)}%</div>;
};
```

#### UI API

Control widget window appearance.

```typescript
interface UIAPI {
  resize(width: number, height: number): Promise<void>;
  setPosition(x: number, y: number): Promise<void>;
}
```

**Example:**

```tsx
const MyWidget = () => {
  const { ui } = useWidgetAPI();
  
  const expandWidget = () => {
    ui.resize(400, 300);
  };
  
  return <button onClick={expandWidget}>Expand</button>;
};
```

## Widget Configuration

Every widget must include a `widget.config.json` file in the root directory.

### Configuration Schema

```typescript
interface WidgetConfig {
  id: string;                    // Unique identifier (kebab-case)
  name: string;                  // Internal name
  displayName: string;           // Display name shown to users
  version: string;               // Semantic version (e.g., "1.0.0")
  description: string;           // Short description
  author: {
    name: string;
    email: string;
  };
  permissions: {
    systemInfo: {
      cpu: boolean;              // CPU usage access
      memory: boolean;           // Memory info access
    };
    network: {
      enabled: boolean;          // Network access
      allowedDomains?: string[]; // Whitelist of domains
    };
  };
  sizes: {
    default: {
      width: number;
      height: number;
    };
    min?: {
      width: number;
      height: number;
    };
    max?: {
      width: number;
      height: number;
    };
  };
  entryPoint: string;            // Path to built HTML file
}
```

### Example Configuration

```json
{
  "id": "weather-widget",
  "name": "weather",
  "displayName": "Weather Widget",
  "version": "1.0.0",
  "description": "Display current weather conditions",
  "author": {
    "name": "John Doe",
    "email": "john@example.com"
  },
  "permissions": {
    "systemInfo": {
      "cpu": false,
      "memory": false
    },
    "network": {
      "enabled": true,
      "allowedDomains": [
        "https://api.openweathermap.org"
      ]
    }
  },
  "sizes": {
    "default": {
      "width": 250,
      "height": 200
    },
    "min": {
      "width": 200,
      "height": 150
    },
    "max": {
      "width": 400,
      "height": 300
    }
  },
  "entryPoint": "dist/index.html"
}
```

### Configuration Guidelines

1. **ID**: Use kebab-case, must be unique across all widgets
2. **Version**: Follow semantic versioning (major.minor.patch)
3. **Permissions**: Only request permissions you actually need
4. **Sizes**: Provide reasonable defaults that work on most screens
5. **Domains**: Use HTTPS URLs only, be specific (no wildcards)

## Permission System

Widgets must declare required permissions in `widget.config.json`. Users are prompted to grant permissions on first use.

### Available Permissions

#### System Information

```json
{
  "permissions": {
    "systemInfo": {
      "cpu": true,      // Access CPU usage data
      "memory": true    // Access memory information
    }
  }
}
```

**Use cases:**
- System monitoring widgets
- Performance dashboards
- Resource usage alerts

#### Network Access

```json
{
  "permissions": {
    "network": {
      "enabled": true,
      "allowedDomains": [
        "https://api.example.com",
        "https://cdn.example.com"
      ]
    }
  }
}
```

**Use cases:**
- Weather widgets
- News feeds
- API integrations

### Permission Flow

1. Widget declares permissions in `widget.config.json`
2. On first API call, user sees permission dialog
3. User grants or denies permission
4. Decision is saved and applied to future requests
5. Denied permissions throw `PERMISSION_DENIED` error

### Handling Permission Errors

```tsx
const SystemMonitor = () => {
  const { system } = useWidgetAPI();
  const [error, setError] = useState<string | null>(null);
  
  useEffect(() => {
    system.getCPU()
      .catch(err => {
        if (err.type === 'PERMISSION_DENIED') {
          setError('Permission denied. Please grant system info access.');
        }
      });
  }, []);
  
  if (error) {
    return <div className="error">{error}</div>;
  }
  
  // ... render widget
};
```

### Rate Limiting

All API calls are rate-limited to 10 requests per second per widget. Exceeding this limit throws `RATE_LIMIT_EXCEEDED` error.

```tsx
// ❌ Bad: Too many rapid calls
for (let i = 0; i < 100; i++) {
  await storage.set(`key${i}`, i);
}

// ✅ Good: Batch operations
const data = {};
for (let i = 0; i < 100; i++) {
  data[`key${i}`] = i;
}
await storage.set('batchData', data);
```

## UI Components

The Widget SDK provides 15+ pre-built components with glassmorphism styling.

### Container

Main wrapper for widget content.

```tsx
<Widget.Container className="custom-class">
  {/* Widget content */}
</Widget.Container>
```

### Typography

```tsx
// Title (h1)
<Widget.Title size="small | medium | large">
  Widget Title
</Widget.Title>

// Large text (for primary data)
<Widget.LargeText>42°C</Widget.LargeText>

// Small text (for labels/descriptions)
<Widget.SmallText>Temperature</Widget.SmallText>
```

### Buttons

```tsx
<Widget.Button
  variant="primary | secondary | danger"
  onClick={() => console.log('clicked')}
  disabled={false}
>
  Click Me
</Widget.Button>
```

### Data Display

```tsx
// Stat component
<Widget.Stat
  label="CPU Usage"
  value="45%"
  color="#3b82f6"
  icon={<CpuIcon />}
/>

// Progress bar
<Widget.ProgressBar
  value={75}
  color="#10b981"
  showLabel={true}
/>
```

### Layout

```tsx
// Grid layout
<Widget.Grid columns={2} gap={16}>
  <div>Item 1</div>
  <div>Item 2</div>
</Widget.Grid>

// Divider
<Widget.Divider />

// Header
<Widget.Header>Section Title</Widget.Header>
```

### Forms

```tsx
// Input
<Widget.Input
  value={value}
  onChange={(e) => setValue(e.target.value)}
  placeholder="Enter text"
/>

// Select
<Widget.Select
  value={selected}
  onChange={(e) => setSelected(e.target.value)}
  options={[
    { value: 'option1', label: 'Option 1' },
    { value: 'option2', label: 'Option 2' }
  ]}
/>
```

### Lists

Display lists of items with smooth animations and hover effects.

```tsx
<Widget.List>
  <Widget.ListItem>Item 1</Widget.ListItem>
  <Widget.ListItem onClick={() => console.log('clicked')}>
    Clickable Item
  </Widget.ListItem>
  <Widget.ListItem active={true}>Active Item</Widget.ListItem>
</Widget.List>
```

**ListItem Props:**
- `children: React.ReactNode` - Item content
- `onClick?: () => void` - Optional click handler (makes item clickable)
- `active?: boolean` - Highlight as active/selected
- `icon?: React.ReactNode` - Optional icon to display
- `className?: string` - Optional CSS class

**Features:**
- Staggered fade-in animations (50ms delay per item)
- Smooth hover effects with transform and shadow
- Active state styling with blue accent
- Icon support with scale animation on hover
- Glassmorphism design with backdrop blur

### Other Components

```tsx
// Badge
<Widget.Badge color="blue">New</Widget.Badge>

// Link
<Widget.Link href="https://example.com">
  Learn More
</Widget.Link>
```

### Custom Styling

All components accept `className` prop for custom styling:

```tsx
<Widget.Container className="my-custom-widget">
  <Widget.Title className="custom-title">Title</Widget.Title>
</Widget.Container>
```

```css
/* Custom styles */
.my-custom-widget {
  padding: 24px;
}

.custom-title {
  color: #ff6b6b;
}
```

## React Hooks

### useWidgetAPI

Access all widget APIs.

```tsx
import { useWidgetAPI } from '@molecule/widget-sdk';

const MyWidget = () => {
  const { storage, settings, system, ui, widgetId, config } = useWidgetAPI();
  
  // Use APIs...
};
```

### useStorage

Reactive storage hook with automatic state management.

```tsx
import { useStorage } from '@molecule/widget-sdk';

const MyWidget = () => {
  const [count, setCount, removeCount] = useStorage('count', 0);
  
  return (
    <div>
      <p>Count: {count}</p>
      <button onClick={() => setCount(count + 1)}>Increment</button>
      <button onClick={removeCount}>Reset</button>
    </div>
  );
};
```

### useSettings

Reactive settings hook.

```tsx
import { useSettings } from '@molecule/widget-sdk';

const WeatherWidget = () => {
  const [city] = useSettings('city', 'Taipei');
  
  // city updates automatically when user changes settings
  return <div>Weather for {city}</div>;
};
```

### useInterval

Safe interval hook with automatic cleanup.

```tsx
import { useInterval } from '@molecule/widget-sdk';

const ClockWidget = () => {
  const [time, setTime] = useState(new Date());
  
  useInterval(() => {
    setTime(new Date());
  }, 1000); // Update every second
  
  return <div>{time.toLocaleTimeString()}</div>;
};
```

### useSystemInfo

Fetch system information with automatic refresh.

```tsx
import { useSystemInfo } from '@molecule/widget-sdk';

const SystemMonitor = () => {
  const cpuUsage = useSystemInfo('cpu', 2000); // Refresh every 2s
  const memoryInfo = useSystemInfo('memory', 2000);
  
  return (
    <div>
      <div>CPU: {cpuUsage?.toFixed(1)}%</div>
      <div>Memory: {memoryInfo?.usagePercent.toFixed(1)}%</div>
    </div>
  );
};
```

### useThrottle

Throttle rapid value changes.

```tsx
import { useThrottle } from '@molecule/widget-sdk';

const SearchWidget = () => {
  const [query, setQuery] = useState('');
  const throttledQuery = useThrottle(query, 500);
  
  useEffect(() => {
    // Only runs when throttledQuery changes (max once per 500ms)
    performSearch(throttledQuery);
  }, [throttledQuery]);
  
  return <input value={query} onChange={e => setQuery(e.target.value)} />;
};
```

## Best Practices

### Performance

1. **Use throttling for frequent updates**
   ```tsx
   const throttledValue = useThrottle(value, 500);
   ```

2. **Batch storage operations**
   ```tsx
   // ❌ Bad
   await storage.set('key1', value1);
   await storage.set('key2', value2);
   
   // ✅ Good
   await storage.set('data', { key1: value1, key2: value2 });
   ```

3. **Optimize re-renders**
   ```tsx
   const memoizedValue = useMemo(() => expensiveCalculation(data), [data]);
   ```

### Security

1. **Validate user input**
   ```tsx
   const handleInput = (value: string) => {
     if (value.length > 100) return;
     setValue(value);
   };
   ```

2. **Use HTTPS for all network requests**
   ```tsx
   // ❌ Bad
   fetch('http://api.example.com/data');
   
   // ✅ Good
   fetch('https://api.example.com/data');
   ```

3. **Sanitize displayed data**
   ```tsx
   import DOMPurify from 'dompurify';
   
   <div dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(html) }} />
   ```

### Error Handling

1. **Handle API errors gracefully**
   ```tsx
   const [error, setError] = useState<string | null>(null);
   
   useEffect(() => {
     system.getCPU()
       .then(setCpuUsage)
       .catch(err => setError(err.message));
   }, []);
   
   if (error) return <div>Error: {error}</div>;
   ```

2. **Provide fallback UI**
   ```tsx
   const [data, setData] = useState(null);
   
   if (!data) return <div>Loading...</div>;
   return <div>{data.value}</div>;
   ```

### Accessibility

1. **Use semantic HTML**
   ```tsx
   <button onClick={handleClick}>Click</button>
   // Not: <div onClick={handleClick}>Click</div>
   ```

2. **Add ARIA labels**
   ```tsx
   <button aria-label="Close widget" onClick={onClose}>
     ×
   </button>
   ```

3. **Support keyboard navigation**
   ```tsx
   <div
     tabIndex={0}
     onKeyDown={(e) => e.key === 'Enter' && handleAction()}
   >
     Interactive element
   </div>
   ```

## Testing

### Unit Tests

Use Vitest and React Testing Library:

```tsx
// MyWidget.test.tsx
import { render, screen } from '@testing-library/react';
import { WidgetProvider } from '@molecule/widget-sdk';
import MyWidget from './MyWidget';

describe('MyWidget', () => {
  it('renders widget title', () => {
    render(
      <WidgetProvider>
        <MyWidget />
      </WidgetProvider>
    );
    
    expect(screen.getByText('My Widget')).toBeInTheDocument();
  });
});
```

### Integration Tests

Test API interactions:

```tsx
import { renderHook } from '@testing-library/react';
import { useStorage } from '@molecule/widget-sdk';

describe('useStorage', () => {
  it('stores and retrieves values', async () => {
    const { result } = renderHook(() => useStorage('test', 'default'));
    
    expect(result.current[0]).toBe('default');
    
    await act(async () => {
      await result.current[1]('new value');
    });
    
    expect(result.current[0]).toBe('new value');
  });
});
```

### Running Tests

```bash
npm test -- --run
```

### Testing Best Practices

**Widget SDK Tests:**
- Test components in isolation
- Mock Widget Container APIs
- Use React Testing Library for component tests
- Test hooks with `renderHook`

**Widget Container Tests:**
- Test permission flows (30+ automated tests available)
- Test IPC communication (20+ integration tests)
- Test error handling and edge cases
- Use Jest for Node.js environment

See the [Testing Guide](../widget-container/docs/testing.md) for comprehensive testing documentation.

## Publishing

### 1. Build Widget

```bash
npm run build
```

### 2. Package Widget

Create a `.widget` file (zip archive):

```bash
# Create package directory
mkdir -p package
cp -r dist package/
cp widget.config.json package/
cp icon.png package/

# Create zip
cd package
zip -r ../my-widget.widget .
```

### 3. Upload to Marketplace

1. Go to Marketplace dashboard
2. Click "Upload Widget"
3. Upload `.widget` file
4. Fill in metadata
5. Submit for review

### 4. Distribution

Once approved, your widget will be available at:
```
widget://install/my-widget
```

Users can install it by clicking the Install button on the Marketplace.

## Examples

### Clock Widget

```tsx
import React, { useState } from 'react';
import { WidgetProvider, Widget, useInterval } from '@molecule/widget-sdk';

const ClockWidget = () => {
  const [time, setTime] = useState(new Date());
  
  useInterval(() => setTime(new Date()), 1000);
  
  const hours = time.getHours().toString().padStart(2, '0');
  const minutes = time.getMinutes().toString().padStart(2, '0');
  const date = time.toLocaleDateString();
  
  return (
    <Widget.Container>
      <Widget.LargeText>{hours}:{minutes}</Widget.LargeText>
      <Widget.SmallText>{date}</Widget.SmallText>
    </Widget.Container>
  );
};

export default () => (
  <WidgetProvider>
    <ClockWidget />
  </WidgetProvider>
);
```

### Counter Widget with Storage

```tsx
import React from 'react';
import { WidgetProvider, Widget, useStorage } from '@molecule/widget-sdk';

const CounterWidget = () => {
  const [count, setCount] = useStorage('count', 0);
  
  return (
    <Widget.Container>
      <Widget.Title>Counter</Widget.Title>
      <Widget.LargeText>{count}</Widget.LargeText>
      <Widget.Button onClick={() => setCount(count + 1)}>
        Increment
      </Widget.Button>
    </Widget.Container>
  );
};

export default () => (
  <WidgetProvider>
    <CounterWidget />
  </WidgetProvider>
);
```

## Troubleshooting

### Widget not loading

- Check `widget.config.json` is valid JSON
- Verify `entryPoint` path is correct
- Check browser console for errors

### Permission denied errors

- Ensure permissions are declared in `widget.config.json`
- Check user has granted permissions
- Verify API calls match declared permissions

### Storage not persisting

- Use `useStorage` hook instead of direct API calls
- Check widget ID is consistent
- Verify storage keys are strings

### High CPU usage

- Use `useThrottle` for frequent updates
- Avoid expensive calculations in render
- Use `useMemo` and `useCallback`

## Support

- 📖 [API Reference](api-reference.md)
- 🏗️ [Architecture Guide](architecture.md)
- 💬 [Community Forum](https://forum.molecule-widgets.com)
- 🐛 [Report Issues](https://github.com/your-org/molecule/issues)

---

**Happy widget building! 🎉**
