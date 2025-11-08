# Widget API Core

This directory contains the core Widget API implementation for the Molecool Widget SDK.

## Overview

The Widget API provides a secure bridge between widgets (React applications) and the Widget Container (Electron application). It includes:

- **Storage API**: Persistent key-value storage
- **Settings API**: Read-only widget configuration
- **System API**: Access to system information (CPU, memory)
- **UI API**: Window management (resize, position)

## Usage

### Basic Setup

Wrap your widget application with `WidgetProvider`:

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

### Accessing the API

Use the `useWidgetAPI` hook (Task 8) or access the context directly:

```tsx
import { useContext } from 'react';
import { WidgetContext } from '@Molecool/widget-sdk';

function MyWidget() {
  const api = useContext(WidgetContext);
  
  // Use the API
  const handleSave = async () => {
    await api.storage.set('myKey', 'myValue');
  };
  
  return <button onClick={handleSave}>Save</button>;
}
```

## Development Mode

The SDK automatically detects the environment:

- **Electron**: Uses `window.widgetAPI` bridge from preload script
- **Browser/Development**: Uses mock API with simulated data

This allows you to develop widgets in a browser without the Electron container.

## API Reference

### StorageAPI

```typescript
interface StorageAPI {
  get<T>(key: string): Promise<T | undefined>;
  set<T>(key: string, value: T): Promise<void>;
  remove(key: string): Promise<void>;
}
```

### SettingsAPI

```typescript
interface SettingsAPI {
  get<T>(key: string): Promise<T | undefined>;
  getAll(): Promise<Record<string, any>>;
}
```

### SystemAPI

```typescript
interface SystemAPI {
  getCPU(): Promise<number>;  // 0-100
  getMemory(): Promise<SystemMemoryInfo>;
}
```

### UIAPI

```typescript
interface UIAPI {
  resize(width: number, height: number): Promise<void>;
  setPosition(x: number, y: number): Promise<void>;
}
```

## Testing

The core API includes comprehensive tests:

```bash
npm test
```

Tests cover:
- Mock API functionality
- Storage operations
- Settings access
- System information
- UI operations
- React Provider integration
