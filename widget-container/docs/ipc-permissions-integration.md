# IPC Handlers and Permissions Manager Integration

## Overview

This document describes the integration of `PermissionsManager` into the `IPCHandlers` class, completed as part of Task 19.

## Changes Made

### Constructor Enhancement

The `IPCHandlers` constructor now properly initializes the `PermissionsManager`:

```typescript
constructor(
  storageManager: StorageManager,
  systemAPI?: SystemAPI,
  permissionsManager?: PermissionsManager
) {
  this.storageManager = storageManager;
  this.systemAPI = systemAPI || new SystemAPI();
  this.permissionsManager = permissionsManager || new PermissionsManager(storageManager);
}
```

**Key Features**:
- **Dependency Injection**: Accepts optional `PermissionsManager` instance for testing
- **Automatic Initialization**: Creates default instance if not provided
- **Proper Dependencies**: Passes `StorageManager` to `PermissionsManager` for permission persistence

### Resource Management

The `destroy()` method ensures proper cleanup:

```typescript
destroy(): void {
  this.permissionsManager.destroy();
}
```

This is called in `main.ts` during app shutdown to:
- Stop the rate limit cleanup timer
- Prevent memory leaks
- Ensure graceful shutdown

## Integration Flow

### 1. Initialization (main.ts)

```typescript
const storageManager = new StorageManager();
const ipcHandlers = new IPCHandlers(storageManager);
// PermissionsManager is automatically created with storageManager dependency
```

### 2. System API Calls with Permissions

When a widget calls a system API:

```
Widget → IPC → handleSystemGetCPU/Memory
  ↓
Check permission (hasPermission)
  ↓
  ├─ Granted → Continue
  └─ Not granted → Request permission (requestPermission)
      ↓
      ├─ User allows → Save & continue
      └─ User denies → Return error
  ↓
Check rate limit (checkRateLimit)
  ↓
  ├─ Within limit → Continue
  └─ Exceeded → Return error
  ↓
Call SystemAPI method
  ↓
Return result to widget
```

### 3. Cleanup (app shutdown)

```typescript
app.on('will-quit', async (event) => {
  // ... save widget states ...
  
  // Cleanup IPC handlers (includes permissions manager)
  ipcHandlers.destroy();
  
  app.exit(0);
});
```

## Benefits

### Testability
- Easy to mock `PermissionsManager` for unit tests
- No tight coupling to concrete implementations
- Clear dependency graph

### Maintainability
- Single responsibility: IPCHandlers manages IPC, PermissionsManager manages permissions
- Proper resource lifecycle management
- Clear initialization order

### Security
- All system API calls go through permission checks
- Rate limiting prevents API abuse
- User consent required for sensitive operations

## Usage Example

### Production Code
```typescript
// Automatic initialization
const ipcHandlers = new IPCHandlers(storageManager);
ipcHandlers.registerHandlers();
```

### Test Code
```typescript
// With mocks
const mockPermissions = {
  hasPermission: jest.fn().mockReturnValue(true),
  checkRateLimit: jest.fn().mockReturnValue(true),
  destroy: jest.fn()
};

const ipcHandlers = new IPCHandlers(
  storageManager,
  mockSystemAPI,
  mockPermissions
);
```

## Related Documentation

- [Permissions API Guide](./permissions-api.md) - Complete permissions system documentation
- [IPC Handlers Improvements](./ipc-handlers-improvements.md) - All IPC handler enhancements
- [System API](../README.md#system-api) - System information APIs

## Requirements Satisfied

- **Requirement 3.2**: Permission checking before API access
- **Requirement 3.4**: Rate limiting implementation
- **Requirement 14.1**: IPC handler implementation
- **Requirement 15.5**: Error handling and resource management

## Next Steps

- **Task 20**: Implement `useSystemInfo` hook in Widget SDK
- **Task 22**: Create System Monitor Widget example
- Add automated unit tests for IPC handlers with permission checks
