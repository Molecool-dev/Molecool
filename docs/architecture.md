# Molecule Architecture Documentation

Comprehensive technical architecture guide for the Molecule Desktop Widget Platform.

## Table of Contents

- [System Overview](#system-overview)
- [Architecture Diagram](#architecture-diagram)
- [Component Details](#component-details)
- [IPC Communication](#ipc-communication)
- [Security Architecture](#security-architecture)
- [Data Flow](#data-flow)
- [Performance Considerations](#performance-considerations)

## System Overview

Molecule is a desktop widget platform built on Electron and React, consisting of four main components:

1. **Widget Container** - Electron application managing widget lifecycle
2. **Widget SDK** - React library for building widgets
3. **Example Widgets** - Reference implementations
4. **Marketplace** - Next.js web application for widget discovery

### Technology Stack

| Component | Technologies |
|-----------|-------------|
| Widget Container | Electron, TypeScript, Node.js, electron-store |
| Widget SDK | React 18, TypeScript, Vite |
| Example Widgets | React, Widget SDK |
| Marketplace | Next.js 15, Supabase, Tailwind CSS |

### Design Principles

1. **Security First** - All widgets run in sandboxed environments
2. **Developer Friendly** - Simple React API with TypeScript support
3. **Performance Optimized** - Low memory and CPU usage
4. **Visual Excellence** - Modern glassmorphism UI design

## Architecture Diagram

### High-Level Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                        Molecule Platform                         │
└─────────────────────────────────────────────────────────────────┘
                                │
                ┌───────────────┼───────────────┐
                │               │               │
                ▼               ▼               ▼
    ┌──────────────────┐ ┌──────────┐ ┌──────────────────┐
    │ Widget Container │ │ Widget   │ │   Marketplace    │
    │   (Electron)     │ │   SDK    │ │   (Next.js)      │
    └──────────────────┘ └──────────┘ └──────────────────┘
                │            │                  │
                │            │                  │
                └────────────┴──────────────────┘
                             │
                             ▼
                    ┌─────────────────┐
                    │ Example Widgets │
                    │ (Clock, System  │
                    │  Monitor, etc.) │
                    └─────────────────┘
```

### Widget Container Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                  Widget Container (Electron)                 │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  ┌────────────────────────────────────────────────────┐    │
│  │              Main Process (Node.js)                 │    │
│  │                                                      │    │
│  │  ┌──────────────┐  ┌──────────────┐  ┌──────────┐ │    │
│  │  │   Widget     │  │   Window     │  │  System  │ │    │
│  │  │   Manager    │  │  Controller  │  │   API    │ │    │
│  │  └──────────────┘  └──────────────┘  └──────────┘ │    │
│  │                                                      │    │
│  │  ┌──────────────┐  ┌──────────────┐  ┌──────────┐ │    │
│  │  │ Permissions  │  │   Storage    │  │   IPC    │ │    │
│  │  │   Manager    │  │   Manager    │  │ Handlers │ │    │
│  │  └──────────────┘  └──────────────┘  └──────────┘ │    │
│  │                                                      │    │
│  │  ┌──────────────┐  ┌──────────────┐                │    │
│  │  │   Security   │  │   Protocol   │                │    │
│  │  │   Manager    │  │   Handler    │                │    │
│  │  └──────────────┘  └──────────────┘                │    │
│  └────────────────────────────────────────────────────┘    │
│                            ▲                                 │
│                            │ IPC                             │
│                            ▼                                 │
│  ┌────────────────────────────────────────────────────┐    │
│  │         Renderer Processes (Chromium)              │    │
│  │                                                      │    │
│  │  ┌──────────────┐  ┌──────────────────────────┐   │    │
│  │  │   Widget     │  │   Widget Windows         │   │    │
│  │  │   Manager    │  │   (Multiple Instances)   │   │    │
│  │  │     UI       │  │                          │   │    │
│  │  │              │  │  ┌────────────────────┐  │   │    │
│  │  │              │  │  │ Preload Script     │  │   │    │
│  │  │              │  │  │ (Security Bridge)  │  │   │    │
│  │  │              │  │  └────────────────────┘  │   │    │
│  │  │              │  │  ┌────────────────────┐  │   │    │
│  │  │              │  │  │ Widget Content     │  │   │    │
│  │  │              │  │  │ (React App)        │  │   │    │
│  │  │              │  │  └────────────────────┘  │   │    │
│  │  └──────────────┘  └──────────────────────────┘   │    │
│  └────────────────────────────────────────────────────┘    │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

## Component Details

### 1. Widget Container

#### Main Process Components

##### Widget Manager

Manages widget lifecycle and state.

**Responsibilities:**
- Load installed widgets from filesystem
- Create and destroy widget windows
- Track running widget instances
- Save and restore widget state
- Validate widget configurations

**Key Methods:**
```typescript
class WidgetManager {
  async loadInstalledWidgets(): Promise<WidgetConfig[]>
  async createWidget(widgetId: string): Promise<string>
  async closeWidget(instanceId: string): Promise<void>
  getRunningWidgets(): WidgetInstance[]
  async saveWidgetState(instanceId: string): Promise<void>
  async restoreWidgets(): Promise<void>
}
```

##### Window Controller

Creates and configures BrowserWindows with advanced lifecycle management.

**Responsibilities:**
- Create widget windows with security settings
- Create manager window
- Apply glassmorphism effects with smooth animations
- Enable window dragging with delta-based positioning
- Configure window properties and performance settings
- Track window types (widget vs manager)
- Manage timer lifecycle and cleanup

**Window Type Tracking:**
```typescript
enum WindowType {
  WIDGET = 'widget',
  MANAGER = 'manager'
}

// Check window type
WindowController.isWidgetWindow(window);  // boolean
WindowController.isManagerWindow(window); // boolean
```

**Timer Management:**
- Automatic timer tracking per window using WeakMap
- Cleanup on window close to prevent memory leaks
- Fade-in/fade-out animations with managed intervals

**Security Configuration:**
```typescript
{
  webPreferences: {
    nodeIntegration: false,        // Disable Node.js in renderer
    contextIsolation: true,        // Isolate contexts
    sandbox: true,                 // Enable sandbox
    preload: path.join(__dirname, 'preload.js'),
    // Performance settings
    v8CacheOptions: 'code',        // Enable V8 code caching
    webgl: false,                  // Disable WebGL for widgets
    plugins: false                 // Disable plugins
  }
}
```

**Animation System:**
```typescript
// Smooth fade-in (300ms, 20 steps)
private fadeInWindow(window: BrowserWindow): void {
  // Gradually increases opacity from 0 to 1
  // Automatic cleanup on completion or window destruction
}

// Smooth fade-out (250ms, 15 steps)
fadeOutWindow(window: BrowserWindow): Promise<void> {
  // Returns promise that resolves when animation completes
  // Used before closing widgets for smooth transitions
}
```

##### System API

Provides system information.

**Responsibilities:**
- Calculate CPU usage
- Retrieve memory information
- Monitor system resources

**Implementation:**
```typescript
class SystemAPI {
  async getCPUUsage(): Promise<number> {
    // Delta-based CPU calculation
    const startUsage = process.cpuUsage();
    await new Promise(resolve => setTimeout(resolve, 100));
    const endUsage = process.cpuUsage(startUsage);
    
    const totalUsage = endUsage.user + endUsage.system;
    const totalTime = 100000; // 100ms in microseconds
    
    return (totalUsage / totalTime) * 100;
  }
  
  getMemoryInfo(): MemoryInfo {
    const total = os.totalmem();
    const free = os.freemem();
    const used = total - free;
    
    return {
      total,
      used,
      free,
      usagePercent: (used / total) * 100
    };
  }
}
```

##### Permissions Manager

Handles permission requests and enforcement.

**Responsibilities:**
- Request permissions from users
- Store permission decisions
- Validate API access
- Enforce rate limits
- Clean up expired rate limit records

**Permission Flow:**
```
Widget API Call
      ↓
Check Permission
      ↓
   Granted? ──No──→ Request Permission
      │                    ↓
     Yes              User Decision
      ↓                    ↓
Check Rate Limit      Save Decision
      ↓                    ↓
   Allow API Call ←───────┘
```

##### Storage Manager

Persistent data storage using electron-store.

**Responsibilities:**
- Store widget data
- Store widget state (position, size)
- Store permissions
- Store app settings

**Data Structure:**
```typescript
interface StoreSchema {
  widgetStates: {
    [instanceId: string]: WidgetState;
  };
  widgetData: {
    [widgetId: string]: {
      [key: string]: any;
    };
  };
  permissions: {
    [widgetId: string]: PermissionSet;
  };
  appSettings: {
    autoRestore: boolean;
    maxWidgets: number;
  };
}
```

##### Security Manager

Enforces Content Security Policy and network restrictions.

**Responsibilities:**
- Set CSP headers dynamically
- Filter network requests
- Validate allowed domains
- Prevent HTTP requests (HTTPS only)

**CSP Configuration:**
```typescript
const csp = [
  "default-src 'none'",
  "script-src 'self' 'wasm-unsafe-eval'",
  "style-src 'self' 'unsafe-inline'",
  `connect-src ${allowedDomains.join(' ')}`,
  "img-src 'self' data: https:",
  "font-src 'self'"
].join('; ');
```

#### Preload Scripts

##### Widget Preload

Exposes safe APIs to widget renderer processes.

**Exposed APIs:**
```typescript
contextBridge.exposeInMainWorld('widgetAPI', {
  storage: {
    get: (key) => ipcRenderer.invoke('storage:get', key),
    set: (key, value) => ipcRenderer.invoke('storage:set', key, value),
    remove: (key) => ipcRenderer.invoke('storage:remove', key)
  },
  settings: {
    get: (key) => ipcRenderer.invoke('settings:get', key),
    getAll: () => ipcRenderer.invoke('settings:getAll')
  },
  system: {
    getCPU: () => ipcRenderer.invoke('system:getCPU'),
    getMemory: () => ipcRenderer.invoke('system:getMemory')
  },
  ui: {
    resize: (w, h) => ipcRenderer.invoke('ui:resize', w, h),
    setPosition: (x, y) => ipcRenderer.invoke('ui:setPosition', x, y)
  },
  widgetId: WIDGET_ID,
  widgetConfig: WIDGET_CONFIG
});
```

### 2. Widget SDK

React library for building widgets.

#### Core API

**WidgetProvider:**
- Provides API context to widget components
- Detects Electron vs browser environment
- Provides mock APIs in development

**API Interfaces:**
- StorageAPI - Persistent key-value storage
- SettingsAPI - Read-only user settings
- SystemAPI - System information access
- UIAPI - Window control

#### React Hooks

**useWidgetAPI:**
- Access all widget APIs
- Get widget metadata

**useStorage:**
- Reactive storage with automatic state sync
- Returns [value, setValue, removeValue]

**useInterval:**
- Safe interval with automatic cleanup
- Prevents memory leaks

**useSystemInfo:**
- Fetch system info with auto-refresh
- Handles permission errors

**useThrottle:**
- Throttle rapid value changes
- Prevents excessive API calls

#### UI Components

15+ pre-built components with glassmorphism styling:
- Container, Title, LargeText, SmallText
- Button, ProgressBar, Stat
- Grid, Divider, Header
- List, ListItem, Input, Select
- Badge, Link

### 3. Marketplace

Next.js application for widget discovery.

**Features:**
- Browse widgets
- Search functionality
- Widget details page
- Install via custom protocol

**Database Schema (Supabase):**
```sql
CREATE TABLE widgets (
  id UUID PRIMARY KEY,
  widget_id VARCHAR(255) UNIQUE,
  name VARCHAR(255),
  display_name VARCHAR(255),
  description TEXT,
  author_name VARCHAR(255),
  version VARCHAR(50),
  downloads INTEGER,
  permissions JSONB,
  download_url TEXT,
  created_at TIMESTAMP,
  updated_at TIMESTAMP
);
```

## IPC Communication

### Communication Flow

```
┌─────────────────┐         ┌─────────────────┐         ┌─────────────────┐
│     Widget      │         │     Preload     │         │      Main       │
│   (Renderer)    │         │     Script      │         │     Process     │
└─────────────────┘         └─────────────────┘         └─────────────────┘
        │                           │                           │
        │  window.widgetAPI.        │                           │
        │  storage.get('key')       │                           │
        ├──────────────────────────>│                           │
        │                           │                           │
        │                           │  ipcRenderer.invoke(      │
        │                           │  'storage:get', 'key')    │
        │                           ├──────────────────────────>│
        │                           │                           │
        │                           │                           │ Check
        │                           │                           │ Permissions
        │                           │                           │
        │                           │                           │ Check
        │                           │                           │ Rate Limit
        │                           │                           │
        │                           │                           │ Get Data
        │                           │                           │ from Store
        │                           │                           │
        │                           │  { success: true,         │
        │                           │    data: value }          │
        │                           │<──────────────────────────┤
        │                           │                           │
        │  Promise resolves         │                           │
        │  with value               │                           │
        │<──────────────────────────┤                           │
        │                           │                           │
```

### IPC Handlers

All IPC handlers follow a standard pattern:

```typescript
ipcMain.handle('api:method', async (event, ...args) => {
  try {
    // 1. Get widget ID from event
    const widgetId = getWidgetIdFromEvent(event);
    
    // 2. Check permissions
    if (!permissionsManager.hasPermission(widgetId, 'permission')) {
      const granted = await permissionsManager.requestPermission({
        widgetId,
        permission: 'permission'
      });
      
      if (!granted) {
        return {
          success: false,
          error: {
            type: 'PERMISSION_DENIED',
            message: 'Permission denied'
          }
        };
      }
    }
    
    // 3. Check rate limit
    if (!permissionsManager.checkRateLimit(widgetId, 'api:method')) {
      return {
        success: false,
        error: {
          type: 'RATE_LIMIT_EXCEEDED',
          message: 'Too many requests'
        }
      };
    }
    
    // 4. Execute operation
    const result = await performOperation(...args);
    
    // 5. Return success response
    return {
      success: true,
      data: result
    };
  } catch (error) {
    // 6. Return error response
    return {
      success: false,
      error: {
        type: 'INTERNAL_ERROR',
        message: error.message
      }
    };
  }
});
```

### Response Format

All IPC responses follow this format:

```typescript
// Success
{
  success: true,
  data: any
}

// Error
{
  success: false,
  error: {
    type: 'PERMISSION_DENIED' | 'RATE_LIMIT_EXCEEDED' | 'STORAGE_ERROR' | ...,
    message: string
  }
}
```

## Security Architecture

### Multi-Layer Security

```
┌─────────────────────────────────────────────────────────┐
│                    Security Layers                       │
├─────────────────────────────────────────────────────────┤
│                                                          │
│  Layer 1: Electron Security                             │
│  ├─ Context Isolation (ENABLED)                         │
│  ├─ Node Integration (DISABLED)                         │
│  └─ Sandbox Mode (ENABLED)                              │
│                                                          │
│  Layer 2: Content Security Policy                       │
│  ├─ Strict CSP headers                                  │
│  ├─ No inline scripts                                   │
│  └─ Domain whitelist                                    │
│                                                          │
│  Layer 3: Permission System                             │
│  ├─ User consent required                               │
│  ├─ Granular permissions                                │
│  └─ Permission persistence                              │
│                                                          │
│  Layer 4: Rate Limiting                                 │
│  ├─ 10 calls/second per widget                          │
│  ├─ Automatic cleanup                                   │
│  └─ Memory leak prevention                              │
│                                                          │
│  Layer 5: Network Security                              │
│  ├─ HTTPS only                                          │
│  ├─ Domain whitelist                                    │
│  └─ No wildcard domains                                 │
│                                                          │
│  Layer 6: Data Isolation                                │
│  ├─ Widget-specific storage                             │
│  ├─ No cross-widget access                              │
│  └─ Encrypted storage (electron-store)                  │
│                                                          │
└─────────────────────────────────────────────────────────┘
```

### Security Best Practices

#### 1. Context Isolation

**Why:** Prevents widgets from accessing Node.js APIs directly.

**Implementation:**
```typescript
webPreferences: {
  contextIsolation: true,
  nodeIntegration: false
}
```

#### 2. Preload Script Bridge

**Why:** Provides controlled API access.

**Implementation:**
```typescript
// ✅ Good: Controlled API
contextBridge.exposeInMainWorld('api', {
  getData: () => ipcRenderer.invoke('get-data')
});

// ❌ Bad: Direct IPC access
contextBridge.exposeInMainWorld('ipc', ipcRenderer);
```

#### 3. Content Security Policy

**Why:** Prevents XSS and code injection.

**Implementation:**
```typescript
session.defaultSession.webRequest.onHeadersReceived((details, callback) => {
  callback({
    responseHeaders: {
      ...details.responseHeaders,
      'Content-Security-Policy': [cspString]
    }
  });
});
```

#### 4. Permission Validation

**Why:** Ensures widgets only access authorized APIs.

**Implementation:**
```typescript
if (!hasPermission(widgetId, 'systemInfo.cpu')) {
  throw new WidgetError('PERMISSION_DENIED', 'CPU access denied');
}
```

#### 5. Rate Limiting

**Why:** Prevents API abuse and DoS attacks.

**Implementation:**
```typescript
const rateLimits = new Map<string, number[]>();

function checkRateLimit(widgetId: string, api: string): boolean {
  const key = `${widgetId}:${api}`;
  const now = Date.now();
  const calls = rateLimits.get(key) || [];
  
  // Remove calls older than 1 second
  const recentCalls = calls.filter(time => now - time < 1000);
  
  if (recentCalls.length >= 10) {
    return false; // Rate limit exceeded
  }
  
  recentCalls.push(now);
  rateLimits.set(key, recentCalls);
  return true;
}
```

## Data Flow

### Widget Lifecycle

```
┌─────────────────────────────────────────────────────────┐
│                   Widget Lifecycle                       │
└─────────────────────────────────────────────────────────┘

1. User clicks "Create Widget" in Manager
         ↓
2. Widget Manager validates widget.config.json
         ↓
3. Window Controller creates BrowserWindow
         ↓
4. Preload script loads and exposes APIs
         ↓
5. Widget HTML/JS loads in renderer
         ↓
6. Widget initializes and renders
         ↓
7. Widget makes API calls via IPC
         ↓
8. Main process handles requests
         ↓
9. Widget updates UI with data
         ↓
10. User drags widget (position saved)
         ↓
11. User closes widget
         ↓
12. Widget state saved to storage
         ↓
13. BrowserWindow destroyed
         ↓
14. Resources cleaned up
```

### Storage Data Flow

```
Widget Component
      ↓
useStorage Hook
      ↓
window.widgetAPI.storage.set()
      ↓
Preload Script
      ↓
ipcRenderer.invoke('storage:set')
      ↓
IPC Handler
      ↓
Storage Manager
      ↓
electron-store
      ↓
Disk (JSON file)
```

### Permission Request Flow

```
Widget calls system.getCPU()
      ↓
Preload forwards to main
      ↓
IPC Handler checks permission
      ↓
Permission not granted
      ↓
Permissions Manager shows dialog
      ↓
User grants/denies
      ↓
Decision saved to storage
      ↓
If granted: API call proceeds
If denied: Error returned
```

## Performance Considerations

### Memory Optimization

1. **Widget Limit:** Maximum 10 widgets running simultaneously
2. **Resource Cleanup:** All event listeners and timers removed on widget close
3. **Timer Management:** WeakMap-based timer tracking prevents memory leaks
4. **V8 Cache:** Enabled for faster script execution
5. **Lazy Loading:** Components loaded on demand
6. **Automatic Cleanup:** Window destruction triggers cleanup of all associated resources

### CPU Optimization

1. **Throttling:** useThrottle hook for frequent updates
2. **Debouncing:** Position saves debounced by 500ms
3. **Monitoring:** CPU usage tracked per widget
4. **Warnings:** Alerts when widget exceeds 20% CPU

### Network Optimization

1. **HTTPS Only:** Faster and more secure
2. **Domain Whitelist:** Reduces attack surface
3. **Request Batching:** Combine multiple API calls

### Storage Optimization

1. **Debounced Writes:** Minimum 500ms between writes
2. **Batch Operations:** Store multiple values at once
3. **Compression:** electron-store handles compression

### Rendering Optimization

1. **Hardware Acceleration:** Enabled by default
2. **CSS Transforms:** Use for animations
3. **React Optimization:** useMemo, useCallback
4. **Virtual Lists:** For long lists

## Deployment Architecture

### Widget Container Distribution

```
Source Code
      ↓
TypeScript Compilation
      ↓
Electron Builder
      ↓
Platform-Specific Packages
      ├─ Windows: NSIS Installer (.exe)
      ├─ macOS: DMG (.dmg)
      └─ Linux: AppImage (.appimage)
```

### Widget SDK Distribution

```
Source Code
      ↓
Vite Build (Library Mode)
      ↓
npm Package
      ├─ dist/index.js (ES modules)
      ├─ dist/index.d.ts (TypeScript types)
      └─ dist/style.css (Component styles)
```

### Marketplace Deployment

```
Next.js Application
      ↓
Vercel Build
      ↓
Edge Network Distribution
      ├─ Static Assets (CDN)
      ├─ API Routes (Serverless)
      └─ Database (Supabase)
```

## Monitoring and Debugging

### Logging

```typescript
// Main process
import log from 'electron-log';

log.info('Widget created:', widgetId);
log.error('Failed to load widget:', error);

// Renderer process
console.log('Widget initialized');
console.error('API call failed:', error);
```

### DevTools

```typescript
// Enable DevTools in development
if (process.env.NODE_ENV === 'development') {
  window.webContents.openDevTools();
}
```

### Performance Monitoring

```typescript
// CPU monitoring
setInterval(() => {
  widgets.forEach((widget, id) => {
    const usage = process.getCPUUsage();
    if (usage.percentCPUUsage > 20) {
      log.warn(`Widget ${id} high CPU: ${usage.percentCPUUsage}%`);
    }
  });
}, 5000);

// Memory monitoring
setInterval(() => {
  const memory = process.memoryUsage();
  log.info('Memory usage:', {
    rss: `${(memory.rss / 1024 / 1024).toFixed(2)} MB`,
    heapUsed: `${(memory.heapUsed / 1024 / 1024).toFixed(2)} MB`
  });
}, 30000);
```

## Future Architecture Enhancements

### Phase 2 Features

1. **Widget Communication**
   - Inter-widget messaging
   - Shared state management
   - Event bus system

2. **Cloud Sync**
   - Widget settings sync
   - Cross-device state
   - Backup and restore

3. **Plugin System**
   - Extend platform capabilities
   - Third-party integrations
   - Custom API providers

4. **Advanced Security**
   - Code signing
   - Widget sandboxing levels
   - Security audit logs

5. **Performance**
   - Worker threads for heavy tasks
   - Shared memory for data
   - GPU acceleration

## Conclusion

The Molecule architecture is designed for:

- **Security:** Multi-layer protection with sandboxing and permissions
- **Performance:** Optimized for multiple concurrent widgets
- **Scalability:** Modular design allows easy extension
- **Developer Experience:** Simple APIs with TypeScript support

This architecture provides a solid foundation for a modern desktop widget platform while maintaining security and performance standards.

---

**For more information:**
- [Developer Guide](developer-guide.md)
- [API Reference](api-reference.md)
- [Security Best Practices](security.md)
