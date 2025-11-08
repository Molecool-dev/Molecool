# Design Document

## Overview

Molecool is a modern desktop widget platform built with Electron + React technology stack. The system consists of four main components:

1. **Widget Container** - Electron desktop application responsible for widget lifecycle management and security sandboxing
2. **Widget SDK** - React component library and API providing a developer-friendly widget development experience
3. **Example Widgets** - Three example widgets (Clock, System Monitor, Weather) demonstrating platform capabilities
4. **Marketplace** - Next.js website providing widget discovery and distribution

### Design Principles

- **Security First**: All widgets run in a sandboxed environment using Context Isolation and CSP
- **Developer Friendly**: Provides clean React APIs and complete TypeScript support
- **Performance Optimized**: Maintains low memory and CPU usage when multiple widgets run concurrently
- **Visually Beautiful**: Glassmorphism effects and modern UI design

## Architecture

### System Architecture Diagram

```
┌─────────────────────────────────────────────────────────────┐
│                     Widget Container (Electron)              │
│  ┌──────────────────────────────────────────────────────┐   │
│  │              Main Process (Node.js)                   │   │
│  │  ┌──────────────┐  ┌──────────────┐  ┌────────────┐ │   │
│  │  │Widget Manager│  │System API    │  │Storage     │ │   │
│  │  │              │  │              │  │(electron-  │ │   │
│  │  │              │  │              │  │ store)     │ │   │
│  │  └──────────────┘  └──────────────┘  └────────────┘ │   │
│  │  ┌──────────────┐  ┌──────────────┐  ┌────────────┐ │   │
│  │  │Window        │  │Permissions   │  │IPC Handlers│ │   │
│  │  │Controller    │  │Manager       │  │            │ │   │
│  │  └──────────────┘  └──────────────┘  └────────────┘ │   │
│  └──────────────────────────────────────────────────────┘   │
│                            ↕ IPC                             │
│  ┌──────────────────────────────────────────────────────┐   │
│  │           Renderer Processes (Chromium)              │   │
│  │  ┌────────────────┐  ┌──────────────────────────┐   │   │
│  │  │Widget Manager  │  │Widget Windows (Multiple) │   │   │
│  │  │UI              │  │                          │   │   │
│  │  │                │  │  ┌────────────────────┐  │   │   │
│  │  │                │  │  │Preload Script      │  │   │   │
│  │  │                │  │  │(Security Bridge)   │  │   │   │
│  │  │                │  │  └────────────────────┘  │   │   │
│  │  │                │  │  ┌────────────────────┐  │   │   │
│  │  │                │  │  │Widget Content      │  │   │   │
│  │  │                │  │  │(React App)         │  │   │   │
│  │  │                │  │  └────────────────────┘  │   │   │
│  │  └────────────────┘  └──────────────────────────┘   │   │
│  └──────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│                    Widget SDK (React Library)                │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐      │
│  │Core APIs     │  │UI Components │  │React Hooks   │      │
│  │- storage     │  │- Container   │  │- useWidgetAPI│      │
│  │- settings    │  │- Typography  │  │- useStorage  │      │
│  │- system      │  │- Buttons     │  │- useInterval │      │
│  │- ui          │  │- Forms       │  │- useSettings │      │
│  └──────────────┘  └──────────────┘  └──────────────┘      │
└─────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│              Marketplace (Next.js + Supabase)                │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐      │
│  │Widget Gallery│  │Widget Details│  │Supabase DB   │      │
│  │Page          │  │Page          │  │              │      │
│  └──────────────┘  └──────────────┘  └──────────────┘      │
└─────────────────────────────────────────────────────────────┘
```

**Architecture Rationale:**

- **Process Isolation**: Each widget runs in a separate BrowserWindow with its own renderer process, ensuring that a crash in one widget doesn't affect others (Requirement 15.5)
- **Security Layers**: The preload script acts as a security bridge, exposing only necessary APIs through contextBridge while maintaining context isolation (Requirements 2.1, 2.2, 2.4)
- **Centralized Management**: Widget Manager in the main process controls all widget lifecycles, permissions, and state persistence (Requirements 1.1, 1.4, 3.2)
- **IPC Communication**: All widget-to-system communication flows through IPC handlers with permission checks and rate limiting (Requirements 3.3, 3.4, 14.1-14.5)


## Components and Interfaces

### 1. Widget Container (Electron Application)

#### 1.1 Main Process Components

##### Widget Manager (`widget-manager.js`)

Responsible for widget lifecycle management.

```typescript
interface WidgetInstance {
  id: string;
  configPath: string;
  config: WidgetConfig;
  window: BrowserWindow | null;
  position: { x: number; y: number };
  size: { width: number; height: number };
  permissions: PermissionSet;
}

class WidgetManager {
  private widgets: Map<string, WidgetInstance>;
  
  // Load installed widgets
  async loadInstalledWidgets(): Promise<WidgetConfig[]>;
  
  // Create widget window
  async createWidget(widgetId: string): Promise<string>;
  
  // Close widget
  async closeWidget(instanceId: string): Promise<void>;
  
  // Get all running widgets
  getRunningWidgets(): WidgetInstance[];
  
  // Save widget state (position, size)
  async saveWidgetState(instanceId: string): Promise<void>;
  
  // Restore widgets from last session
  async restoreWidgets(): Promise<void>;
}
```

**Design Rationale**: The WidgetManager maintains a Map of widget instances to enable O(1) lookups and efficient state management. Each widget instance tracks its BrowserWindow, configuration, and permissions separately to ensure proper isolation (Requirements 1.1, 1.4, 1.5).

##### Window Controller (`window-controller.js`)

Manages BrowserWindow creation and configuration.

```typescript
interface WindowOptions {
  width: number;
  height: number;
  x?: number;
  y?: number;
  transparent: boolean;
  frame: boolean;
  alwaysOnTop: boolean;
}

class WindowController {
  // Create widget window
  createWidgetWindow(options: WindowOptions, preloadPath: string): BrowserWindow;
  
  // Create manager window
  createManagerWindow(): BrowserWindow;
  
  // Apply glassmorphism effect
  applyGlassEffect(window: BrowserWindow): void;
  
  // Enable window dragging
  enableDragging(window: BrowserWindow): void;
}
```

**Design Rationale**: WindowController centralizes all BrowserWindow configuration to ensure consistent security settings (sandbox, contextIsolation, nodeIntegration: false) across all windows. The glassmorphism effect is applied at the window level for platform-native rendering (Requirements 1.2, 2.1, 2.2, 12.1-12.4).

##### System API (`system-api.js`)

Provides system information query functionality.

```typescript
interface SystemInfo {
  cpu: {
    usage: number; // 0-100
    cores: number;
  };
  memory: {
    total: number; // bytes
    used: number;  // bytes
    free: number;  // bytes
    usagePercent: number; // 0-100
  };
}

class SystemAPI {
  // Get CPU usage percentage
  async getCPUUsage(): Promise<number>;
  
  // Get memory information
  getMemoryInfo(): SystemInfo['memory'];
  
  // Get complete system information
  getSystemInfo(): SystemInfo;
}
```

**Design Rationale**: SystemAPI uses Node.js `os` module for cross-platform system information. CPU usage is calculated using delta-based measurement to provide accurate real-time data. All methods include zero-division protection and error handling (Requirements 4.5, 8.1, 8.2).

##### Permissions Manager (`permissions.js`)

Manages widget permission requests and authorization.

```typescript
interface PermissionRequest {
  widgetId: string;
  permission: string; // 'systemInfo.cpu' | 'systemInfo.memory' | 'network'
  reason?: string;
}

interface PermissionSet {
  systemInfo: {
    cpu: boolean;
    memory: boolean;
  };
  network: {
    enabled: boolean;
    allowedDomains?: string[];
  };
}

class PermissionsManager {
  // Request permission (show dialog)
  async requestPermission(request: PermissionRequest): Promise<boolean>;
  
  // Check permission
  hasPermission(widgetId: string, permission: string): boolean;
  
  // Save permission decision
  savePermission(widgetId: string, permission: string, granted: boolean): void;
  
  // Get all permissions for a widget
  getPermissions(widgetId: string): PermissionSet;
  
  // Enforce API rate limiting
  checkRateLimit(widgetId: string, apiName: string): boolean;
}
```

**Design Rationale**: PermissionsManager implements a two-tier security model:
1. **Permission-based access control**: Widgets must declare and request permissions before accessing sensitive APIs (Requirements 3.1, 3.2, 3.3)
2. **Rate limiting**: Prevents resource abuse by limiting API calls to 10 per second per widget (Requirements 3.4, 15.4)

The manager includes memory leak protection with automatic cleanup of expired rate limit records.

##### Storage Manager (`storage.js`)

Implements data persistence using electron-store.

```typescript
class StorageManager {
  private store: ElectronStore;
  
  // Widget data storage
  setWidgetData(widgetId: string, key: string, value: any): void;
  getWidgetData(widgetId: string, key: string): any;
  deleteWidgetData(widgetId: string, key: string): void;
  
  // Widget state storage
  saveWidgetState(widgetId: string, state: WidgetState): void;
  getWidgetState(widgetId: string): WidgetState | null;
  
  // Permission storage
  savePermissions(widgetId: string, permissions: PermissionSet): void;
  getPermissions(widgetId: string): PermissionSet | null;
}
```

**Design Rationale**: StorageManager uses electron-store for persistent, encrypted storage with automatic JSON serialization. All widget data is namespaced by widgetId to ensure isolation. Position updates are debounced by 500ms minimum to reduce disk I/O (Requirements 1.4, 4.4).

##### IPC Handlers (`ipc-handlers.js`)

Handles all IPC communication.

```typescript
class IPCHandlers {
  // Register all IPC handlers
  registerHandlers(): void;
  
  // Storage API handlers
  private handleStorageGet(event, widgetId: string, key: string): any;
  private handleStorageSet(event, widgetId: string, key: string, value: any): void;
  private handleStorageDelete(event, widgetId: string, key: string): void;
  
  // System API handlers
  private handleSystemGetCPU(event, widgetId: string): Promise<number>;
  private handleSystemGetMemory(event, widgetId: string): Promise<SystemInfo['memory']>;
  
  // UI API handlers
  private handleUIResize(event, width: number, height: number): void;
  private handleUISetPosition(event, x: number, y: number): void;
  
  // Settings API handlers
  private handleSettingsGet(event, widgetId: string, key: string): any;
  private handleSettingsGetAll(event, widgetId: string): any;
}
```

**Design Rationale**: All IPC handlers use try-catch blocks and return standardized responses `{ success: boolean, data?: any, error?: { type, message } }`. This ensures consistent error handling across the platform and enables proper error propagation to widgets (Requirements 14.1, 14.4, 14.5).

#### 1.2 Preload Scripts

##### Widget Preload (`widget-preload.js`)

Provides secure API bridging for widgets.

```typescript
// API exposed through contextBridge
interface WidgetAPI {
  storage: {
    get: (key: string) => Promise<any>;
    set: (key: string, value: any) => Promise<void>;
    remove: (key: string) => Promise<void>;
  };
  
  settings: {
    get: (key: string) => Promise<any>;
    getAll: () => Promise<Record<string, any>>;
  };
  
  system: {
    getCPU: () => Promise<number>;
    getMemory: () => Promise<SystemInfo['memory']>;
  };
  
  ui: {
    resize: (width: number, height: number) => Promise<void>;
    setPosition: (x: number, y: number) => Promise<void>;
  };
  
  // Widget metadata
  widgetId: string;
  widgetConfig: WidgetConfig;
}
```

**Design Rationale**: The preload script uses `contextBridge.exposeInMainWorld()` to expose only necessary APIs, never exposing raw `ipcRenderer` or Node.js APIs. This maintains the security boundary while providing widgets with required functionality (Requirements 2.4, 2.5, 14.3).

##### Manager Preload (`manager-preload.js`)

Provides management functionality for Widget Manager.

```typescript
interface ManagerAPI {
  widgets: {
    getInstalled: () => Promise<WidgetConfig[]>;
    getRunning: () => Promise<WidgetInstance[]>;
    create: (widgetId: string) => Promise<string>;
    close: (instanceId: string) => Promise<void>;
  };
  
  onWidgetStateChange: (callback: (state: any) => void) => void;
}
```


### 2. Widget SDK (React Library)

#### 2.1 Core API

##### WidgetAPI Interface (`core/WidgetAPI.ts`)

Primary API interface provided through React Context.

```typescript
export interface WidgetAPIContext {
  storage: StorageAPI;
  settings: SettingsAPI;
  system: SystemAPI;
  ui: UIAPI;
  widgetId: string;
  config: WidgetConfig;
}

// Storage API
export interface StorageAPI {
  get<T = any>(key: string): Promise<T | undefined>;
  set<T = any>(key: string, value: T): Promise<void>;
  remove(key: string): Promise<void>;
}

// Settings API (read-only)
export interface SettingsAPI {
  get<T = any>(key: string): Promise<T | undefined>;
  getAll(): Promise<Record<string, any>>;
}

// System API
export interface SystemAPI {
  getCPU(): Promise<number>;
  getMemory(): Promise<{
    total: number;
    used: number;
    free: number;
    usagePercent: number;
  }>;
}

// UI API
export interface UIAPI {
  resize(width: number, height: number): Promise<void>;
  setPosition(x: number, y: number): Promise<void>;
}
```

##### WidgetProvider (`core/WidgetAPI.ts`)

Provider component that supplies API Context.

```typescript
export const WidgetProvider: React.FC<{
  children: React.ReactNode;
}> = ({ children }) => {
  const api = useMemo(() => {
    // Check if running in Electron environment
    if (typeof window !== 'undefined' && window.widgetAPI) {
      return window.widgetAPI;
    }
    
    // Development mode: return mock API
    return createMockAPI();
  }, []);
  
  return (
    <WidgetAPIContext.Provider value={api}>
      {children}
    </WidgetAPIContext.Provider>
  );
};
```

**Design Rationale**: WidgetProvider automatically detects the runtime environment (Electron vs browser) and provides appropriate API implementation. In development mode, it returns a mock API for browser-based testing without requiring Widget Container (Requirement 11.1, 11.4).

#### 2.2 React Hooks

##### useWidgetAPI (`hooks/useWidgetAPI.ts`)

```typescript
export function useWidgetAPI(): WidgetAPIContext {
  const context = useContext(WidgetAPIContext);
  if (!context) {
    throw new Error('useWidgetAPI must be used within WidgetProvider');
  }
  return context;
}
```

##### useStorage (`hooks/useStorage.ts`)

```typescript
export function useStorage<T = any>(
  key: string,
  defaultValue?: T
): [T | undefined, (value: T) => Promise<void>, () => Promise<void>] {
  const { storage } = useWidgetAPI();
  const [value, setValue] = useState<T | undefined>(defaultValue);
  
  useEffect(() => {
    storage.get<T>(key).then(v => {
      if (v !== undefined) setValue(v);
    });
  }, [key]);
  
  const updateValue = useCallback(async (newValue: T) => {
    await storage.set(key, newValue);
    setValue(newValue);
  }, [key, storage]);
  
  const removeValue = useCallback(async () => {
    await storage.remove(key);
    setValue(undefined);
  }, [key, storage]);
  
  return [value, updateValue, removeValue];
}
```

##### useInterval (`hooks/useInterval.ts`)

```typescript
export function useInterval(callback: () => void, delay: number | null) {
  const savedCallback = useRef(callback);
  
  useEffect(() => {
    savedCallback.current = callback;
  }, [callback]);
  
  useEffect(() => {
    if (delay === null) return;
    
    const id = setInterval(() => savedCallback.current(), delay);
    return () => clearInterval(id);
  }, [delay]);
}
```

##### useSystemInfo (`hooks/useSystemInfo.ts`)

```typescript
export function useSystemInfo(
  type: 'cpu' | 'memory',
  refreshInterval: number = 2000
): number | SystemInfo['memory'] | null {
  const { system } = useWidgetAPI();
  const [data, setData] = useState<any>(null);
  
  useInterval(async () => {
    try {
      const result = type === 'cpu' 
        ? await system.getCPU()
        : await system.getMemory();
      setData(result);
    } catch (error) {
      console.error('Failed to fetch system info:', error);
    }
  }, refreshInterval);
  
  return data;
}
```

#### 2.3 UI Components

All UI components are built with TypeScript and CSS Modules, supporting glassmorphism theme.

##### Widget.Container (`components/Widget.tsx`)

```typescript
export const Container: React.FC<{
  children: React.ReactNode;
  className?: string;
}> = ({ children, className }) => {
  return (
    <div className={`widget-container ${className || ''}`}>
      {children}
    </div>
  );
};
```

##### Widget.Title, Widget.Text (`components/Typography.tsx`)

```typescript
export const Title: React.FC<{
  children: React.ReactNode;
  size?: 'small' | 'medium' | 'large';
}> = ({ children, size = 'medium' }) => {
  return <h1 className={`widget-title widget-title-${size}`}>{children}</h1>;
};

export const LargeText: React.FC<{ children: React.ReactNode }>;
export const SmallText: React.FC<{ children: React.ReactNode }>;
```

##### Widget.Button (`components/Buttons.tsx`)

```typescript
export const Button: React.FC<{
  children: React.ReactNode;
  onClick?: () => void;
  variant?: 'primary' | 'secondary' | 'danger';
  disabled?: boolean;
}> = ({ children, onClick, variant = 'primary', disabled = false }) => {
  return (
    <button 
      className={`widget-button widget-button-${variant}`}
      onClick={onClick}
      disabled={disabled}
    >
      {children}
    </button>
  );
};
```

##### Widget.ProgressBar (`components/DataDisplay.tsx`)

```typescript
export const ProgressBar: React.FC<{
  value: number; // 0-100
  color?: string;
  showLabel?: boolean;
}> = ({ value, color = '#3b82f6', showLabel = true }) => {
  return (
    <div className="widget-progress-bar">
      <div 
        className="widget-progress-bar-fill"
        style={{ width: `${value}%`, backgroundColor: color }}
      />
      {showLabel && <span className="widget-progress-bar-label">{value}%</span>}
    </div>
  );
};
```

##### Widget.Stat (`components/DataDisplay.tsx`)

```typescript
export const Stat: React.FC<{
  label: string;
  value: string | number;
  color?: string;
  icon?: React.ReactNode;
}> = ({ label, value, color, icon }) => {
  return (
    <div className="widget-stat">
      {icon && <div className="widget-stat-icon">{icon}</div>}
      <div className="widget-stat-content">
        <div className="widget-stat-label">{label}</div>
        <div className="widget-stat-value" style={{ color }}>
          {value}
        </div>
      </div>
    </div>
  );
};
```

Complete UI component list (minimum 15):
1. Container
2. Title
3. LargeText
4. SmallText
5. Button
6. ProgressBar
7. Stat
8. Grid
9. Divider
10. Header
11. List / ListItem
12. Input
13. Select
14. Badge
15. Link

**Design Rationale**: The SDK provides 15+ pre-built components to accelerate widget development. All components use white text (rgba(255, 255, 255, 0.9)) for readability on transparent backgrounds and include hover/transition animations for polish (Requirements 4.2, 12.5).

### 3. Example Widgets

#### 3.1 Clock Widget

Simple clock widget demonstrating basic UI components and timed updates.

```typescript
// examples/clock/src/index.tsx
import React, { useState } from 'react';
import { WidgetProvider, Widget, useInterval } from 'widget-sdk';

const ClockWidget: React.FC = () => {
  const [time, setTime] = useState(new Date());
  
  useInterval(() => {
    setTime(new Date());
  }, 1000);
  
  const hours = time.getHours().toString().padStart(2, '0');
  const minutes = time.getMinutes().toString().padStart(2, '0');
  const date = time.toLocaleDateString('zh-TW', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
  
  return (
    <Widget.Container>
      <Widget.LargeText>{hours}:{minutes}</Widget.LargeText>
      <Widget.SmallText>{date}</Widget.SmallText>
    </Widget.Container>
  );
};

export default function App() {
  return (
    <WidgetProvider>
      <ClockWidget />
    </WidgetProvider>
  );
}
```

#### 3.2 System Monitor Widget

Demonstrates system information API and permission requests.

```typescript
// examples/system-monitor/src/index.tsx
import React from 'react';
import { WidgetProvider, Widget, useSystemInfo } from 'widget-sdk';

const SystemMonitorWidget: React.FC = () => {
  const cpuUsage = useSystemInfo('cpu', 2000);
  const memoryInfo = useSystemInfo('memory', 2000);
  
  return (
    <Widget.Container>
      <Widget.Header>System Monitor</Widget.Header>
      
      <Widget.Stat
        label="CPU Usage"
        value={cpuUsage ? `${cpuUsage.toFixed(1)}%` : 'Loading...'}
        color={cpuUsage > 80 ? '#ef4444' : '#10b981'}
      />
      <Widget.ProgressBar 
        value={cpuUsage || 0}
        color={cpuUsage > 80 ? '#ef4444' : '#3b82f6'}
      />
      
      <Widget.Divider />
      
      <Widget.Stat
        label="Memory"
        value={memoryInfo 
          ? `${(memoryInfo.used / 1024 / 1024 / 1024).toFixed(1)} GB / ${(memoryInfo.total / 1024 / 1024 / 1024).toFixed(1)} GB`
          : 'Loading...'
        }
        color={memoryInfo?.usagePercent > 80 ? '#ef4444' : '#10b981'}
      />
      <Widget.ProgressBar 
        value={memoryInfo?.usagePercent || 0}
        color={memoryInfo?.usagePercent > 80 ? '#ef4444' : '#3b82f6'}
      />
    </Widget.Container>
  );
};

export default function App() {
  return (
    <WidgetProvider>
      <SystemMonitorWidget />
    </WidgetProvider>
  );
}
```

#### 3.3 Weather Widget

Demonstrates network API calls and settings management.

```typescript
// examples/weather/src/index.tsx
import React, { useState, useEffect } from 'react';
import { WidgetProvider, Widget, useSettings, useInterval } from 'widget-sdk';

interface WeatherData {
  temperature: number;
  condition: string;
  icon: string;
}

const WeatherWidget: React.FC = () => {
  const [city] = useSettings<string>('city', 'Taipei');
  const [weather, setWeather] = useState<WeatherData | null>(null);
  const [loading, setLoading] = useState(true);
  
  const fetchWeather = async () => {
    try {
      // In production, use real weather API
      const response = await fetch(
        `https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=YOUR_API_KEY&units=metric`
      );
      const data = await response.json();
      
      setWeather({
        temperature: Math.round(data.main.temp),
        condition: data.weather[0].main,
        icon: data.weather[0].icon
      });
      setLoading(false);
    } catch (error) {
      console.error('Failed to fetch weather:', error);
      setLoading(false);
    }
  };
  
  useEffect(() => {
    fetchWeather();
  }, [city]);
  
  useInterval(() => {
    fetchWeather();
  }, 600000); // Update every 10 minutes
  
  if (loading) {
    return (
      <Widget.Container>
        <Widget.SmallText>Loading...</Widget.SmallText>
      </Widget.Container>
    );
  }
  
  return (
    <Widget.Container>
      <Widget.SmallText>{city}</Widget.SmallText>
      <Widget.LargeText>{weather?.temperature}°C</Widget.LargeText>
      <Widget.SmallText>{weather?.condition}</Widget.SmallText>
    </Widget.Container>
  );
};

export default function App() {
  return (
    <WidgetProvider>
      <WeatherWidget />
    </WidgetProvider>
  );
}
```

**Design Rationale**: The three example widgets demonstrate progressively complex features:
- Clock: Basic UI and timing (Requirements 7.1-7.5)
- System Monitor: System APIs and permissions (Requirements 8.1-8.5)
- Weather: Network access and settings (Requirements 9.1-9.5)

### 4. Marketplace (Next.js Website)

#### 4.1 Database Schema (Supabase)

```sql
-- widgets table
CREATE TABLE widgets (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  widget_id VARCHAR(255) UNIQUE NOT NULL,
  name VARCHAR(255) NOT NULL,
  display_name VARCHAR(255) NOT NULL,
  description TEXT,
  author_name VARCHAR(255),
  author_email VARCHAR(255),
  version VARCHAR(50) NOT NULL,
  downloads INTEGER DEFAULT 0,
  permissions JSONB,
  sizes JSONB,
  icon_url TEXT,
  download_url TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_widgets_widget_id ON widgets(widget_id);
CREATE INDEX idx_widgets_downloads ON widgets(downloads DESC);
```

**Design Rationale**: The database schema uses JSONB for flexible storage of permissions and sizes, allowing widgets to declare complex permission requirements without schema changes. Indexes on widget_id and downloads optimize common queries (Requirements 13.1, 13.2).

#### 4.2 API Routes

##### Get All Widgets (`app/api/widgets/route.ts`)

```typescript
export async function GET() {
  const supabase = createClient();
  
  const { data, error } = await supabase
    .from('widgets')
    .select('*')
    .order('downloads', { ascending: false });
  
  if (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
  
  return Response.json(data);
}
```

##### Get Widget by ID (`app/api/widgets/[id]/route.ts`)

```typescript
export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  const supabase = createClient();
  
  const { data, error } = await supabase
    .from('widgets')
    .select('*')
    .eq('widget_id', params.id)
    .single();
  
  if (error) {
    return Response.json({ error: error.message }, { status: 404 });
  }
  
  return Response.json(data);
}
```

#### 4.3 Pages

##### Home Page (`app/page.tsx`)

```typescript
import { WidgetCard } from '@/components/WidgetCard';
import { SearchBar } from '@/components/SearchBar';

export default async function HomePage() {
  const widgets = await fetchWidgets();
  
  return (
    <main className="container mx-auto px-4 py-8">
      <h1 className="text-4xl font-bold mb-8">Widget Marketplace</h1>
      
      <SearchBar />
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-8">
        {widgets.map(widget => (
          <WidgetCard key={widget.id} widget={widget} />
        ))}
      </div>
    </main>
  );
}
```

##### Widget Detail Page (`app/widgets/[id]/page.tsx`)

```typescript
export default async function WidgetDetailPage({
  params
}: {
  params: { id: string }
}) {
  const widget = await fetchWidget(params.id);
  
  return (
    <main className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl font-bold mb-4">{widget.display_name}</h1>
        <p className="text-gray-600 mb-8">{widget.description}</p>
        
        <div className="bg-white rounded-lg shadow p-6 mb-8">
          <h2 className="text-2xl font-semibold mb-4">Details</h2>
          <dl className="space-y-2">
            <div>
              <dt className="font-medium">Version</dt>
              <dd>{widget.version}</dd>
            </div>
            <div>
              <dt className="font-medium">Author</dt>
              <dd>{widget.author_name}</dd>
            </div>
            <div>
              <dt className="font-medium">Downloads</dt>
              <dd>{widget.downloads.toLocaleString()}</dd>
            </div>
          </dl>
        </div>
        
        <div className="bg-white rounded-lg shadow p-6 mb-8">
          <h2 className="text-2xl font-semibold mb-4">Permissions</h2>
          <PermissionsList permissions={widget.permissions} />
        </div>
        
        <button
          onClick={() => {
            window.location.href = `widget://install/${widget.widget_id}`;
          }}
          className="w-full bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700"
        >
          Install Widget
        </button>
      </div>
    </main>
  );
}
```


## Data Models

### Widget Configuration (`widget.config.json`)

Configuration file required for each widget.

```typescript
interface WidgetConfig {
  id: string;                    // Unique identifier, e.g. "clock-widget"
  name: string;                  // Internal name, e.g. "clock"
  displayName: string;           // Display name, e.g. "Clock Widget"
  version: string;               // Version number, e.g. "1.0.0"
  description: string;           // Description
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
      allowedDomains?: string[];
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
  entryPoint: string;            // Entry file, e.g. "dist/index.html"
}
```

**Design Rationale**: widget.config.json serves as the widget manifest, declaring all metadata, permissions, and size constraints upfront. This enables Widget Container to validate widgets before loading and display permission requirements to users (Requirements 5.1-5.5).

### Widget State

Widget state stored by Widget Container.

```typescript
interface WidgetState {
  widgetId: string;
  instanceId: string;
  position: {
    x: number;
    y: number;
  };
  size: {
    width: number;
    height: number;
  };
  isRunning: boolean;
  lastActive: string;            // ISO timestamp
  permissions: PermissionSet;
}
```

### Storage Schema

Data structure for electron-store.

```typescript
interface StoreSchema {
  // Widget states
  widgetStates: {
    [instanceId: string]: WidgetState;
  };
  
  // Widget data
  widgetData: {
    [widgetId: string]: {
      [key: string]: any;
    };
  };
  
  // Permissions
  permissions: {
    [widgetId: string]: PermissionSet;
  };
  
  // App settings
  appSettings: {
    autoRestore: boolean;
    maxWidgets: number;
  };
}
```

## Error Handling

### Error Types

```typescript
enum WidgetErrorType {
  PERMISSION_DENIED = 'PERMISSION_DENIED',
  RATE_LIMIT_EXCEEDED = 'RATE_LIMIT_EXCEEDED',
  INVALID_CONFIG = 'INVALID_CONFIG',
  WIDGET_CRASHED = 'WIDGET_CRASHED',
  NETWORK_ERROR = 'NETWORK_ERROR',
  STORAGE_ERROR = 'STORAGE_ERROR'
}

class WidgetError extends Error {
  constructor(
    public type: WidgetErrorType,
    message: string,
    public widgetId?: string
  ) {
    super(message);
    this.name = 'WidgetError';
  }
}
```

### Error Handling Strategy

#### Main Process

1. **Widget Crash Isolation**: Listen to `BrowserWindow` `crashed` event; single widget crash doesn't affect others
2. **IPC Error Handling**: All IPC handlers use try-catch, return standardized error responses
3. **Logging**: Use electron-log to record all errors

```typescript
// Example: IPC handler error handling
ipcMain.handle('storage:get', async (event, widgetId, key) => {
  try {
    const value = storageManager.getWidgetData(widgetId, key);
    return { success: true, data: value };
  } catch (error) {
    logger.error('Storage get failed:', error);
    return { 
      success: false, 
      error: {
        type: WidgetErrorType.STORAGE_ERROR,
        message: error.message
      }
    };
  }
});
```

**Design Rationale**: Standardized error responses `{ success, data?, error? }` enable consistent error handling across IPC boundaries. All errors include a type enum for programmatic handling and user-friendly messages (Requirement 15.5).

#### Renderer Process (Widget SDK)

1. **API Error Handling**: All API calls return Promises, use reject to propagate errors
2. **React Error Boundary**: Wrap WidgetProvider with Error Boundary
3. **User-Friendly Messages**: Display error messages to users

```typescript
// Widget SDK error handling example
export const storage = {
  async get<T>(key: string): Promise<T | undefined> {
    try {
      const result = await window.widgetAPI.storage.get(key);
      if (!result.success) {
        throw new WidgetError(
          result.error.type,
          result.error.message
        );
      }
      return result.data;
    } catch (error) {
      console.error('Storage get failed:', error);
      throw error;
    }
  }
};
```

#### Marketplace

1. **API Errors**: Use Next.js error handling mechanisms
2. **404 Handling**: Display friendly 404 page when widget doesn't exist
3. **Network Errors**: Show retry button

## Testing Strategy

### Unit Tests

#### Widget Container (Main Process)

Use Jest to test core logic.

```typescript
// __tests__/widget-manager.test.ts
describe('WidgetManager', () => {
  let manager: WidgetManager;
  
  beforeEach(() => {
    manager = new WidgetManager();
  });
  
  test('should create widget instance', async () => {
    const instanceId = await manager.createWidget('clock-widget');
    expect(instanceId).toBeDefined();
    expect(manager.getRunningWidgets()).toHaveLength(1);
  });
  
  test('should close widget', async () => {
    const instanceId = await manager.createWidget('clock-widget');
    await manager.closeWidget(instanceId);
    expect(manager.getRunningWidgets()).toHaveLength(0);
  });
});
```

#### Widget SDK

Use Vitest and React Testing Library.

```typescript
// __tests__/useStorage.test.tsx
import { renderHook, act } from '@testing-library/react';
import { useStorage } from '../hooks/useStorage';

describe('useStorage', () => {
  test('should get and set value', async () => {
    const { result } = renderHook(() => useStorage('test-key', 'default'));
    
    expect(result.current[0]).toBe('default');
    
    await act(async () => {
      await result.current[1]('new-value');
    });
    
    expect(result.current[0]).toBe('new-value');
  });
});
```

### Integration Tests

Test IPC communication and complete flows.

```typescript
// __tests__/integration/ipc.test.ts
describe('IPC Communication', () => {
  test('should handle storage operations', async () => {
    // Simulate renderer call
    const result = await ipcRenderer.invoke('storage:set', 'widget-1', 'key', 'value');
    expect(result.success).toBe(true);
    
    const getValue = await ipcRenderer.invoke('storage:get', 'widget-1', 'key');
    expect(getValue.data).toBe('value');
  });
});
```

### E2E Tests

Use Playwright to test complete user flows.

```typescript
// e2e/widget-lifecycle.spec.ts
test('should create and close widget', async ({ page }) => {
  await page.goto('app://./manager.html');
  
  // Click create widget
  await page.click('[data-widget-id="clock-widget"]');
  
  // Verify widget window appears
  const widgetWindow = await page.waitForSelector('.widget-window');
  expect(widgetWindow).toBeTruthy();
  
  // Close widget
  await page.click('.widget-close-button');
  
  // Verify widget window disappears
  await page.waitForSelector('.widget-window', { state: 'hidden' });
});
```

### Manual Testing Checklist

- [ ] Widget can be created and displayed normally
- [ ] Widget can be dragged to different positions
- [ ] Widget position persists after restart
- [ ] Permission dialog displays correctly
- [ ] System info API returns correct data
- [ ] Storage API saves and retrieves correctly
- [ ] Multiple widgets run smoothly simultaneously
- [ ] Widget crash doesn't affect other widgets
- [ ] Marketplace can be browsed and searched normally
- [ ] Install button triggers custom protocol


## Security Considerations

### Electron Security Best Practices

#### 1. Context Isolation

All BrowserWindows must enable `contextIsolation`.

```typescript
const window = new BrowserWindow({
  webPreferences: {
    nodeIntegration: false,
    contextIsolation: true,
    sandbox: true,
    preload: path.join(__dirname, 'preload.js')
  }
});
```

#### 2. Content Security Policy

Set strict CSP for all widget windows.

```typescript
session.defaultSession.webRequest.onHeadersReceived((details, callback) => {
  callback({
    responseHeaders: {
      ...details.responseHeaders,
      'Content-Security-Policy': [
        "default-src 'none';",
        "script-src 'self' 'wasm-unsafe-eval';",
        "style-src 'self' 'unsafe-inline';",
        "connect-src https://api.openweathermap.org;",
        "img-src 'self' data: https:;",
        "font-src 'self';"
      ].join(' ')
    }
  });
});
```

#### 3. Preload Script Security

Only expose necessary APIs, never expose `ipcRenderer` directly.

```typescript
// ❌ Insecure
contextBridge.exposeInMainWorld('electron', {
  ipcRenderer: ipcRenderer
});

// ✅ Secure
contextBridge.exposeInMainWorld('widgetAPI', {
  storage: {
    get: (key) => ipcRenderer.invoke('storage:get', key),
    set: (key, value) => ipcRenderer.invoke('storage:set', key, value)
  }
});
```

**Design Rationale**: Never expose raw IPC or Node.js APIs to renderer. The preload script acts as a security boundary, exposing only specific, validated methods (Requirements 2.4, 2.5).

#### 4. Permission Verification

Check permissions before all sensitive API calls.

```typescript
ipcMain.handle('system:getCPU', async (event) => {
  const widgetId = getWidgetIdFromEvent(event);
  
  // 檢查權限
  if (!permissionsManager.hasPermission(widgetId, 'systemInfo.cpu')) {
    // 請求權限
    const granted = await permissionsManager.requestPermission({
      widgetId,
      permission: 'systemInfo.cpu'
    });
    
    if (!granted) {
      throw new WidgetError(
        WidgetErrorType.PERMISSION_DENIED,
        'CPU access denied'
      );
    }
  }
  
  // 檢查速率限制
  if (!permissionsManager.checkRateLimit(widgetId, 'system:getCPU')) {
    throw new WidgetError(
      WidgetErrorType.RATE_LIMIT_EXCEEDED,
      'Too many requests'
    );
  }
  
  return systemAPI.getCPUUsage();
});
```

#### 5. Widget Isolation

Each widget runs in an independent BrowserWindow with data isolation.

```typescript
// Widget A cannot access Widget B's data
storageManager.getWidgetData('widget-a', 'key'); // Only returns widget-a's data
```

**Design Rationale**: Process-level isolation ensures that a compromised widget cannot access other widgets' data or affect their operation (Requirement 15.5).

### Network Security

#### 1. Domain Whitelist

Only allow widgets to access domains declared in `widget.config.json`.

```typescript
// Dynamically set in CSP
const allowedDomains = widget.config.permissions.network.allowedDomains || [];
const connectSrc = ['https:'].concat(allowedDomains).join(' ');
```

#### 2. HTTPS Only

Force all network requests to use HTTPS.

```typescript
session.defaultSession.webRequest.onBeforeRequest((details, callback) => {
  const url = new URL(details.url);
  
  if (url.protocol === 'http:') {
    callback({ cancel: true });
    return;
  }
  
  callback({ cancel: false });
});
```

## Performance Optimization

### Memory Management

#### 1. Widget Window Optimization

```typescript
const window = new BrowserWindow({
  webPreferences: {
    // Enable hardware acceleration
    offscreen: false,
    // Limit memory
    v8CacheOptions: 'code',
    // Disable unnecessary features
    webgl: false,
    plugins: false
  }
});
```

#### 2. Resource Cleanup

Clean up resources when widget closes.

```typescript
async closeWidget(instanceId: string) {
  const widget = this.widgets.get(instanceId);
  
  if (widget?.window) {
    // Clean up event listeners
    widget.window.removeAllListeners();
    
    // Close window
    widget.window.close();
    widget.window = null;
  }
  
  // Clean up data
  this.widgets.delete(instanceId);
}
```

**Design Rationale**: Proper resource cleanup prevents memory leaks when widgets are closed. All event listeners must be removed before destroying windows (Requirement 15.1).

#### 3. Limit Widget Count

```typescript
const MAX_WIDGETS = 10;

async createWidget(widgetId: string) {
  if (this.widgets.size >= MAX_WIDGETS) {
    throw new Error('Maximum widget limit reached');
  }
  
  // Create widget...
}
```

### CPU Optimization

#### 1. Throttle Updates

Provide throttling utilities in Widget SDK.

```typescript
export function useThrottle<T>(value: T, delay: number): T {
  const [throttledValue, setThrottledValue] = useState(value);
  
  useEffect(() => {
    const handler = setTimeout(() => {
      setThrottledValue(value);
    }, delay);
    
    return () => clearTimeout(handler);
  }, [value, delay]);
  
  return throttledValue;
}
```

#### 2. Monitor CPU Usage

```typescript
// Periodically check widget CPU usage
setInterval(() => {
  this.widgets.forEach((widget, instanceId) => {
    const cpuUsage = process.getCPUUsage();
    
    if (cpuUsage.percentCPUUsage > 20) {
      logger.warn(`Widget ${instanceId} high CPU usage: ${cpuUsage.percentCPUUsage}%`);
      
      // Optional: pause or warn user
    }
  });
}, 5000);
```

**Design Rationale**: CPU monitoring helps identify misbehaving widgets. The 20% threshold triggers warnings but doesn't automatically kill widgets, giving users control (Requirement 15.3).

### Build Optimization

#### 1. Code Splitting

Widget SDK uses dynamic imports.

```typescript
// Lazy load chart components
export const LineChart = lazy(() => import('./components/LineChart'));
```

#### 2. Tree Shaking

Ensure Vite configuration supports tree shaking.

```typescript
// vite.config.ts
export default defineConfig({
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          'react-vendor': ['react', 'react-dom']
        }
      }
    }
  }
});
```

## UI/UX Design

### Visual Design Specifications

#### Glassmorphism Effect

```css
.widget-container {
  background: rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(10px);
  -webkit-backdrop-filter: blur(10px);
  border-radius: 12px;
  border: 1px solid rgba(255, 255, 255, 0.2);
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);
}
```

#### Color System

```css
:root {
  /* Primary colors */
  --color-primary: #3b82f6;
  --color-primary-hover: #2563eb;
  
  /* State colors */
  --color-success: #10b981;
  --color-warning: #f59e0b;
  --color-danger: #ef4444;
  
  /* Text colors */
  --color-text-primary: rgba(255, 255, 255, 0.9);
  --color-text-secondary: rgba(255, 255, 255, 0.6);
  
  /* Backgrounds */
  --color-bg-widget: rgba(255, 255, 255, 0.1);
  --color-bg-hover: rgba(255, 255, 255, 0.15);
}
```

#### Typography System

```css
.widget-title-large {
  font-size: 2rem;
  font-weight: 700;
  line-height: 1.2;
}

.widget-title-medium {
  font-size: 1.5rem;
  font-weight: 600;
  line-height: 1.3;
}

.widget-text-large {
  font-size: 3rem;
  font-weight: 700;
  line-height: 1;
}

.widget-text-small {
  font-size: 0.875rem;
  font-weight: 400;
  line-height: 1.4;
}
```

### Animations and Transitions

```css
/* Widget appearance animation */
@keyframes fadeIn {
  from {
    opacity: 0;
    transform: scale(0.95);
  }
  to {
    opacity: 1;
    transform: scale(1);
  }
}

.widget-container {
  animation: fadeIn 0.2s ease-out;
}

/* Button hover effect */
.widget-button {
  transition: all 0.2s ease;
}

.widget-button:hover {
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
}
```

### Responsive Design

Widgets should support different sizes.

```typescript
// Widgets can define multiple size presets
sizes: {
  small: { width: 150, height: 150 },
  medium: { width: 250, height: 200 },
  large: { width: 400, height: 300 }
}
```

## Deployment and Distribution

### Widget Container Packaging

Use electron-builder to package desktop application.

```json
// package.json
{
  "build": {
    "appId": "com.Molecool.widget-platform",
    "productName": "Molecool",
    "directories": {
      "output": "dist"
    },
    "files": [
      "src/**/*",
      "node_modules/**/*"
    ],
    "win": {
      "target": ["nsis"],
      "icon": "assets/icon.ico"
    },
    "mac": {
      "target": ["dmg"],
      "icon": "assets/icon.icns"
    }
  }
}
```

### Widget SDK Publishing

Publish to npm.

```json
// package.json
{
  "name": "@Molecool/widget-sdk",
  "version": "1.0.0",
  "main": "dist/index.js",
  "types": "dist/index.d.ts",
  "files": [
    "dist"
  ]
}
```

### Marketplace Deployment

Deploy to Vercel.

```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
cd widget-marketplace
vercel --prod
```

### Widget Distribution

Widgets are packaged as `.widget` files (actually zip archives).

```
clock-widget.widget/
├── widget.config.json
├── dist/
│   ├── index.html
│   ├── assets/
│   │   ├── index.js
│   │   └── index.css
└── icon.png
```

## Development Workflow

### Development Environment Setup

```bash
# 1. Clone repository
git clone https://github.com/your-org/desktop-widget-platform.git
cd desktop-widget-platform

# 2. Install dependencies
npm install

# 3. Start Widget Container in dev mode
cd widget-container
npm install
npm start

# 4. Start Widget SDK in dev mode (Storybook)
cd ../widget-sdk
npm install
npm run dev

# 5. Start example widget
cd ../examples/clock
npm install
npm run dev

# 6. Start Marketplace
cd ../../widget-marketplace
npm install
npm run dev
```

### Developing New Widgets

```bash
# 1. Create new widget project
mkdir examples/my-widget
cd examples/my-widget

# 2. Initialize project
npm init -y
npm install @Molecool/widget-sdk react react-dom

# 3. Create widget.config.json
# 4. Create src/index.tsx
# 5. Develop and test
npm run dev

# 6. Build
npm run build
```

## Future Enhancements

### Phase 5+ Features (Post-Hackathon)

1. **Widget Store Purchases**: Support paid widgets
2. **Widget Theme System**: Allow users to customize widget appearance
3. **Widget Communication**: Enable inter-widget communication
4. **Cloud Sync**: Sync widget configurations and data to cloud
5. **Widget Update Mechanism**: Automatic widget update checking
6. **Additional System APIs**: 
   - File system access (restricted)
   - Clipboard access
   - Notification API
7. **Widget Analytics**: Collect usage data (with user consent)
8. **Multi-language Support**: i18n support
9. **Accessibility Features**: ARIA labels and keyboard navigation
10. **Widget Developer Tools**: Built-in debugging tools

## Conclusion

This design document provides the complete technical architecture for the Molecool desktop widget platform. The core design principles are:

1. **Security**: Use Electron best practices to ensure widgets run safely in sandboxes
2. **Simplicity**: Provide clean React APIs to lower the development barrier
3. **Efficiency**: Optimize performance to support multiple concurrent widgets
4. **Beauty**: Modern glassmorphism UI design

With this design, we can complete an MVP within one month while leaving room for future expansion.

**Key Design Decisions Summary:**

- **Process Isolation**: Each widget in separate BrowserWindow prevents cascading failures (Requirement 15.5)
- **Permission System**: Two-tier security with permission checks and rate limiting (Requirements 3.1-3.4)
- **IPC Architecture**: Standardized request/response format enables consistent error handling (Requirements 14.1-14.5)
- **Storage Strategy**: electron-store with 500ms debouncing balances persistence and performance (Requirements 1.4, 4.4)
- **Development Experience**: Mock API in SDK enables browser-based development without Container (Requirement 11.1)
- **Security Layers**: Context isolation + CSP + preload bridge creates defense in depth (Requirements 2.1-2.5)
