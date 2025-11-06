# Design Document

## Overview

Molecule 是一個現代化的桌面 Widget 平台，採用 Electron + React 技術棧構建。系統由四個主要部分組成：

1. **Widget Container** - Electron 桌面應用，負責 Widget 生命週期管理和安全沙盒
2. **Widget SDK** - React 元件庫和 API，提供開發者友好的 Widget 開發體驗
3. **Example Widgets** - 三個範例 Widget（時鐘、系統監控、天氣）展示平台能力
4. **Marketplace** - Next.js 網站，提供 Widget 發現和分發功能

### 設計原則

- **安全第一**: 所有 Widget 在沙盒環境中運行，使用 Context Isolation 和 CSP
- **開發者友好**: 提供簡潔的 React API 和完整的 TypeScript 支援
- **性能優化**: 多 Widget 並行運行時保持低記憶體和 CPU 使用
- **視覺美觀**: 毛玻璃效果和現代化 UI 設計

## Architecture

### 系統架構圖

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


## Components and Interfaces

### 1. Widget Container (Electron Application)

#### 1.1 Main Process Components

##### Widget Manager (`widget-manager.js`)

負責 Widget 的生命週期管理。

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
  
  // 載入已安裝的 Widget
  async loadInstalledWidgets(): Promise<WidgetConfig[]>;
  
  // 創建 Widget 視窗
  async createWidget(widgetId: string): Promise<string>;
  
  // 關閉 Widget
  async closeWidget(instanceId: string): Promise<void>;
  
  // 獲取所有運行中的 Widget
  getRunningWidgets(): WidgetInstance[];
  
  // 儲存 Widget 狀態（位置、大小）
  async saveWidgetState(instanceId: string): Promise<void>;
  
  // 恢復上次的 Widget 狀態
  async restoreWidgets(): Promise<void>;
}
```

##### Window Controller (`window-controller.js`)

管理 BrowserWindow 的創建和配置。

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
  // 創建 Widget 視窗
  createWidgetWindow(options: WindowOptions, preloadPath: string): BrowserWindow;
  
  // 創建 Manager 視窗
  createManagerWindow(): BrowserWindow;
  
  // 應用毛玻璃效果
  applyGlassEffect(window: BrowserWindow): void;
  
  // 設置視窗可拖曳
  enableDragging(window: BrowserWindow): void;
}
```

##### System API (`system-api.js`)

提供系統資訊查詢功能。

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
  // 獲取 CPU 使用率
  async getCPUUsage(): Promise<number>;
  
  // 獲取記憶體資訊
  getMemoryInfo(): SystemInfo['memory'];
  
  // 獲取完整系統資訊
  getSystemInfo(): SystemInfo;
}
```

##### Permissions Manager (`permissions.js`)

管理 Widget 權限請求和授權。

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
  // 請求權限（顯示對話框）
  async requestPermission(request: PermissionRequest): Promise<boolean>;
  
  // 檢查權限
  hasPermission(widgetId: string, permission: string): boolean;
  
  // 儲存權限決定
  savePermission(widgetId: string, permission: string, granted: boolean): void;
  
  // 獲取 Widget 的所有權限
  getPermissions(widgetId: string): PermissionSet;
  
  // 實施 API 速率限制
  checkRateLimit(widgetId: string, apiName: string): boolean;
}
```

##### Storage Manager (`storage.js`)

使用 electron-store 實現數據持久化。

```typescript
class StorageManager {
  private store: ElectronStore;
  
  // Widget 數據儲存
  setWidgetData(widgetId: string, key: string, value: any): void;
  getWidgetData(widgetId: string, key: string): any;
  deleteWidgetData(widgetId: string, key: string): void;
  
  // Widget 狀態儲存
  saveWidgetState(widgetId: string, state: WidgetState): void;
  getWidgetState(widgetId: string): WidgetState | null;
  
  // 權限儲存
  savePermissions(widgetId: string, permissions: PermissionSet): void;
  getPermissions(widgetId: string): PermissionSet | null;
}
```

##### IPC Handlers (`ipc-handlers.js`)

處理所有 IPC 通訊。

```typescript
class IPCHandlers {
  // 註冊所有 IPC handlers
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

#### 1.2 Preload Scripts

##### Widget Preload (`widget-preload.js`)

為 Widget 提供安全的 API 橋接。

```typescript
// 通過 contextBridge 暴露的 API
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
  
  // Widget 元數據
  widgetId: string;
  widgetConfig: WidgetConfig;
}
```

##### Manager Preload (`manager-preload.js`)

為 Widget Manager 提供管理功能。

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

主要的 API 介面，通過 React Context 提供。

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

提供 API Context 的 Provider 元件。

```typescript
export const WidgetProvider: React.FC<{
  children: React.ReactNode;
}> = ({ children }) => {
  const api = useMemo(() => {
    // 檢查是否在 Electron 環境中
    if (typeof window !== 'undefined' && window.widgetAPI) {
      return window.widgetAPI;
    }
    
    // 開發模式：返回模擬 API
    return createMockAPI();
  }, []);
  
  return (
    <WidgetAPIContext.Provider value={api}>
      {children}
    </WidgetAPIContext.Provider>
  );
};
```

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

所有 UI 元件使用 TypeScript 和 CSS Modules 構建，支援毛玻璃效果主題。

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

完整的 UI 元件列表（至少 15 個）：
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


### 3. Example Widgets

#### 3.1 Clock Widget

簡單的時鐘 Widget，展示基本的 UI 元件和定時更新。

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

展示系統資訊 API 和權限請求。

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

展示網路 API 調用和設定管理。

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
      // 實際應用中應該使用真實的天氣 API
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
  }, 600000); // 每 10 分鐘更新
  
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

### 4. Marketplace (Next.js Website)

#### 4.1 Database Schema (Supabase)

```sql
-- widgets 表
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

-- 索引
CREATE INDEX idx_widgets_widget_id ON widgets(widget_id);
CREATE INDEX idx_widgets_downloads ON widgets(downloads DESC);
```

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

每個 Widget 必須包含的配置文件。

```typescript
interface WidgetConfig {
  id: string;                    // 唯一識別符，如 "clock-widget"
  name: string;                  // 內部名稱，如 "clock"
  displayName: string;           // 顯示名稱，如 "Clock Widget"
  version: string;               // 版本號，如 "1.0.0"
  description: string;           // 描述
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
  entryPoint: string;            // 入口文件，如 "dist/index.html"
}
```

### Widget State

Widget Container 儲存的 Widget 狀態。

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

electron-store 的數據結構。

```typescript
interface StoreSchema {
  // Widget 狀態
  widgetStates: {
    [instanceId: string]: WidgetState;
  };
  
  // Widget 數據
  widgetData: {
    [widgetId: string]: {
      [key: string]: any;
    };
  };
  
  // 權限
  permissions: {
    [widgetId: string]: PermissionSet;
  };
  
  // 應用設定
  appSettings: {
    autoRestore: boolean;
    maxWidgets: number;
  };
}
```

## Error Handling

### 錯誤類型

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

### 錯誤處理策略

#### Main Process

1. **Widget 崩潰隔離**: 使用 `BrowserWindow` 的 `crashed` 事件監聽，單個 Widget 崩潰不影響其他 Widget
2. **IPC 錯誤處理**: 所有 IPC handler 使用 try-catch，返回標準化錯誤響應
3. **日誌記錄**: 使用 electron-log 記錄所有錯誤

```typescript
// 範例：IPC handler 錯誤處理
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

#### Renderer Process (Widget SDK)

1. **API 錯誤處理**: 所有 API 調用返回 Promise，使用 reject 傳遞錯誤
2. **React Error Boundary**: 在 WidgetProvider 中包裹 Error Boundary
3. **用戶友好提示**: 顯示錯誤訊息給用戶

```typescript
// Widget SDK 錯誤處理範例
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

1. **API 錯誤**: 使用 Next.js 的錯誤處理機制
2. **404 處理**: Widget 不存在時顯示友好的 404 頁面
3. **網路錯誤**: 顯示重試按鈕

## Testing Strategy

### Unit Tests

#### Widget Container (Main Process)

使用 Jest 測試核心邏輯。

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

使用 Vitest 和 React Testing Library。

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

測試 IPC 通訊和完整流程。

```typescript
// __tests__/integration/ipc.test.ts
describe('IPC Communication', () => {
  test('should handle storage operations', async () => {
    // 模擬 renderer 調用
    const result = await ipcRenderer.invoke('storage:set', 'widget-1', 'key', 'value');
    expect(result.success).toBe(true);
    
    const getValue = await ipcRenderer.invoke('storage:get', 'widget-1', 'key');
    expect(getValue.data).toBe('value');
  });
});
```

### E2E Tests

使用 Playwright 測試完整的用戶流程。

```typescript
// e2e/widget-lifecycle.spec.ts
test('should create and close widget', async ({ page }) => {
  await page.goto('app://./manager.html');
  
  // 點擊創建 Widget
  await page.click('[data-widget-id="clock-widget"]');
  
  // 驗證 Widget 視窗出現
  const widgetWindow = await page.waitForSelector('.widget-window');
  expect(widgetWindow).toBeTruthy();
  
  // 關閉 Widget
  await page.click('.widget-close-button');
  
  // 驗證 Widget 視窗消失
  await page.waitForSelector('.widget-window', { state: 'hidden' });
});
```

### Manual Testing Checklist

- [ ] Widget 可以正常創建和顯示
- [ ] Widget 可以拖曳到不同位置
- [ ] Widget 位置在重啟後保持
- [ ] 權限對話框正常顯示
- [ ] 系統資訊 API 返回正確數據
- [ ] Storage API 正常儲存和讀取
- [ ] 多個 Widget 同時運行不卡頓
- [ ] Widget 崩潰不影響其他 Widget
- [ ] Marketplace 可以正常瀏覽和搜索
- [ ] Install 按鈕觸發自訂協議


## Security Considerations

### Electron Security Best Practices

#### 1. Context Isolation

所有 BrowserWindow 必須啟用 `contextIsolation`。

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

為所有 Widget 視窗設置嚴格的 CSP。

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

#### 3. Preload Script 安全

只暴露必要的 API，不直接暴露 `ipcRenderer`。

```typescript
// ❌ 不安全
contextBridge.exposeInMainWorld('electron', {
  ipcRenderer: ipcRenderer
});

// ✅ 安全
contextBridge.exposeInMainWorld('widgetAPI', {
  storage: {
    get: (key) => ipcRenderer.invoke('storage:get', key),
    set: (key, value) => ipcRenderer.invoke('storage:set', key, value)
  }
});
```

#### 4. 權限驗證

所有敏感 API 調用前檢查權限。

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

#### 5. Widget 隔離

每個 Widget 在獨立的 BrowserWindow 中運行，數據隔離。

```typescript
// Widget A 無法訪問 Widget B 的數據
storageManager.getWidgetData('widget-a', 'key'); // 只返回 widget-a 的數據
```

### Network Security

#### 1. 白名單域名

只允許 Widget 訪問在 `widget.config.json` 中聲明的域名。

```typescript
// 在 CSP 中動態設置
const allowedDomains = widget.config.permissions.network.allowedDomains || [];
const connectSrc = ['https:'].concat(allowedDomains).join(' ');
```

#### 2. HTTPS Only

強制所有網路請求使用 HTTPS。

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

### 記憶體管理

#### 1. Widget 視窗優化

```typescript
const window = new BrowserWindow({
  webPreferences: {
    // 啟用硬體加速
    offscreen: false,
    // 限制記憶體
    v8CacheOptions: 'code',
    // 禁用不需要的功能
    webgl: false,
    plugins: false
  }
});
```

#### 2. 資源清理

Widget 關閉時清理資源。

```typescript
async closeWidget(instanceId: string) {
  const widget = this.widgets.get(instanceId);
  
  if (widget?.window) {
    // 清理事件監聽器
    widget.window.removeAllListeners();
    
    // 關閉視窗
    widget.window.close();
    widget.window = null;
  }
  
  // 清理數據
  this.widgets.delete(instanceId);
}
```

#### 3. 限制 Widget 數量

```typescript
const MAX_WIDGETS = 10;

async createWidget(widgetId: string) {
  if (this.widgets.size >= MAX_WIDGETS) {
    throw new Error('Maximum widget limit reached');
  }
  
  // 創建 Widget...
}
```

### CPU 優化

#### 1. 節流更新

在 Widget SDK 中提供節流工具。

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

#### 2. 監控 CPU 使用

```typescript
// 定期檢查 Widget 的 CPU 使用
setInterval(() => {
  this.widgets.forEach((widget, instanceId) => {
    const cpuUsage = process.getCPUUsage();
    
    if (cpuUsage.percentCPUUsage > 20) {
      logger.warn(`Widget ${instanceId} high CPU usage: ${cpuUsage.percentCPUUsage}%`);
      
      // 可選：暫停或警告用戶
    }
  });
}, 5000);
```

### 打包優化

#### 1. Code Splitting

Widget SDK 使用動態導入。

```typescript
// 延遲載入圖表元件
export const LineChart = lazy(() => import('./components/LineChart'));
```

#### 2. Tree Shaking

確保 Vite 配置支援 tree shaking。

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

### 視覺設計規範

#### 毛玻璃效果

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

#### 顏色系統

```css
:root {
  /* 主要顏色 */
  --color-primary: #3b82f6;
  --color-primary-hover: #2563eb;
  
  /* 狀態顏色 */
  --color-success: #10b981;
  --color-warning: #f59e0b;
  --color-danger: #ef4444;
  
  /* 文字顏色 */
  --color-text-primary: rgba(255, 255, 255, 0.9);
  --color-text-secondary: rgba(255, 255, 255, 0.6);
  
  /* 背景 */
  --color-bg-widget: rgba(255, 255, 255, 0.1);
  --color-bg-hover: rgba(255, 255, 255, 0.15);
}
```

#### 字體系統

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

### 動畫和過渡

```css
/* Widget 出現動畫 */
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

/* 按鈕 hover 效果 */
.widget-button {
  transition: all 0.2s ease;
}

.widget-button:hover {
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
}
```

### 響應式設計

Widget 應該支援不同的尺寸。

```typescript
// Widget 可以定義多個尺寸預設
sizes: {
  small: { width: 150, height: 150 },
  medium: { width: 250, height: 200 },
  large: { width: 400, height: 300 }
}
```

## Deployment and Distribution

### Widget Container 打包

使用 electron-builder 打包桌面應用。

```json
// package.json
{
  "build": {
    "appId": "com.molecule.widget-platform",
    "productName": "Molecule",
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

### Widget SDK 發布

發布到 npm。

```json
// package.json
{
  "name": "@molecule/widget-sdk",
  "version": "1.0.0",
  "main": "dist/index.js",
  "types": "dist/index.d.ts",
  "files": [
    "dist"
  ]
}
```

### Marketplace 部署

部署到 Vercel。

```bash
# 安裝 Vercel CLI
npm i -g vercel

# 部署
cd widget-marketplace
vercel --prod
```

### Widget 分發

Widget 打包為 `.widget` 文件（實際上是 zip）。

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

### 開發環境設置

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

### 開發新 Widget

```bash
# 1. 創建新 Widget 專案
mkdir examples/my-widget
cd examples/my-widget

# 2. 初始化專案
npm init -y
npm install @molecule/widget-sdk react react-dom

# 3. 創建 widget.config.json
# 4. 創建 src/index.tsx
# 5. 開發和測試
npm run dev

# 6. 打包
npm run build
```

## Future Enhancements

### Phase 5+ 功能（黑客松後）

1. **Widget 商店內購買**: 支援付費 Widget
2. **Widget 主題系統**: 允許用戶自訂 Widget 外觀
3. **Widget 通訊**: Widget 之間可以互相通訊
4. **雲端同步**: 同步 Widget 配置和數據到雲端
5. **Widget 更新機制**: 自動檢查和更新 Widget
6. **更多系統 API**: 
   - 檔案系統訪問（受限）
   - 剪貼簿訪問
   - 通知 API
7. **Widget 分析**: 收集使用數據（需用戶同意）
8. **多語言支援**: i18n 支援
9. **無障礙功能**: ARIA 標籤和鍵盤導航
10. **Widget 開發者工具**: 內建的調試工具

## Conclusion

這個設計文檔提供了 Molecule 桌面 Widget 平台的完整技術架構。核心設計原則是：

1. **安全**: 使用 Electron 的最佳實踐，確保 Widget 在沙盒中安全運行
2. **簡單**: 提供簡潔的 React API，降低開發門檻
3. **高效**: 優化性能，支援多 Widget 並行運行
4. **美觀**: 現代化的毛玻璃 UI 設計

通過這個設計，我們可以在一個月內完成 MVP，並為未來的擴展留下空間。
