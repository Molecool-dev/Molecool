# System API with Permissions - Integration Guide

## Overview

Task 19 integrates the System API with the permissions system and rate limiting. This document describes the implementation and how to test it.

## Implementation Details

### 1. IPC Handlers Integration

The `IPCHandlers` class now includes:

- **Permission Manager**: Instantiated in the constructor with dependency injection support. If not provided, creates a new instance with `StorageManager` dependency
- **Widget ID Extraction**: `getWidgetIdFromEvent()` properly extracts the widget ID from the IPC event by finding the widget instance that owns the window
- **Widget Name Extraction**: `getWidgetNameFromId()` gets the display name for permission dialogs
- **Cleanup**: `destroy()` method to clean up resources on app shutdown

**Constructor Signature**:
```typescript
constructor(
  storageManager: StorageManager,
  systemAPI?: SystemAPI,
  permissionsManager?: PermissionsManager
)
```

This design allows for:
- Easy testing with mock dependencies
- Flexible initialization in production
- Proper resource management through the `destroy()` lifecycle method

### 2. System API Handlers with Permissions

Both `handleSystemGetCPU` and `handleSystemGetMemory` now implement:

1. **Permission Checking**: Checks if the widget has the required permission
2. **Permission Request**: If not granted, shows a dialog to request permission from the user
3. **Rate Limiting**: Enforces a limit of 10 calls per second per widget
4. **Error Handling**: Returns appropriate error types for permission denial and rate limit exceeded

### 3. Permission Flow

```
Widget calls system.getCPU()
    ↓
IPC: system:getCPU
    ↓
handleSystemGetCPU()
    ↓
Check permission (systemInfo.cpu)
    ↓
    ├─ Has permission → Continue
    └─ No permission → Request from user
        ↓
        ├─ User grants → Save & continue
        └─ User denies → Return error
    ↓
Check rate limit (10 calls/sec)
    ↓
    ├─ Within limit → Continue
    └─ Exceeded → Return error
    ↓
Call SystemAPI.getCPUUsage()
    ↓
Return result to widget
```

## Testing the Integration

### Automated Tests

**Location:** `widget-container/src/main/__tests__/permissions.test.ts`

**Test Coverage (30+ tests):**

1. **Permission Dialog Display (3 tests)**
   - Shows dialog with correct widget name and permission information
   - Displays custom reason when provided
   - Uses correct permission labels (CPU, memory, network)

2. **Permission Granting (4 tests)**
   - Grants permission when user clicks "Allow"
   - Saves permission decision persistently
   - Skips dialog if permission already granted
   - Handles multiple permissions independently

3. **Permission Denial (4 tests)**
   - Denies permission when user clicks "Deny"
   - Saves denial decision persistently
   - Shows dialog again for previously denied permissions
   - Blocks API access when permission is denied

4. **Rate Limiting (7 tests)**
   - Allows up to 10 calls per second
   - Blocks calls exceeding limit
   - Throws error when `throwOnExceed=true`
   - Resets rate limit after 1 second
   - Tracks limits per widget independently
   - Tracks limits per API independently
   - Cleans up expired rate limit entries

5. **Unauthorized API Access (5 tests)**
   - Blocks access when no permissions exist
   - Blocks access when specific permission not granted
   - Validates permission format
   - Rejects invalid permission strings
   - Accepts valid permission strings

6. **Additional Coverage (7+ tests)**
   - Permission persistence across multiple grants
   - Network permission handling
   - Resource cleanup on destroy
   - Concurrent permission requests
   - Edge cases (empty widget ID, rate limit clearing)

**Run Tests:**
```bash
cd widget-container
npm test -- --run permissions
```

### Manual Testing Steps

1. **Start the Widget Container**
   ```bash
   cd widget-container
   npm run dev
   ```

2. **Create a Test Widget** that calls the system API:
   ```javascript
   // In widget code
   async function testSystemAPI() {
     try {
       // First call - should trigger permission dialog
       const cpuInfo = await window.widgetAPI.system.getCPU();
       console.log('CPU Info:', cpuInfo);
       
       const memoryInfo = await window.widgetAPI.system.getMemory();
       console.log('Memory Info:', memoryInfo);
     } catch (error) {
       console.error('System API error:', error);
     }
   }
   ```

3. **Test Permission Request**:
   - First call to `getCPU()` should show a permission dialog
   - Click "Allow" to grant permission
   - Subsequent calls should not show the dialog
   - Permission is saved and persists across app restarts

4. **Test Permission Denial**:
   - Close the widget and restart
   - Clear permissions: Delete the widget's permission data from storage
   - Call `getCPU()` again
   - Click "Deny" in the permission dialog
   - The API call should fail with `PERMISSION_DENIED` error

5. **Test Rate Limiting**:
   ```javascript
   // Make rapid calls to test rate limiting
   async function testRateLimit() {
     for (let i = 0; i < 15; i++) {
       try {
         const cpuInfo = await window.widgetAPI.system.getCPU();
         console.log(`Call ${i + 1}: Success`, cpuInfo);
       } catch (error) {
         console.error(`Call ${i + 1}: Failed`, error.message);
       }
     }
   }
   ```
   - First 10 calls should succeed
   - Calls 11-15 should fail with `RATE_LIMIT_EXCEEDED` error
   - Wait 1 second and try again - should work

### Expected Behavior

#### Permission Dialog
- **Title**: "Permission Request"
- **Message**: "[Widget Name] wants to access [permission type].\n\nReason: [reason text]"
- **Buttons**: "Allow" and "Deny"

#### API Response Format

**Success Response**:
```javascript
{
  success: true,
  data: {
    usage: 25.5,  // CPU usage percentage
    cores: 8      // Number of CPU cores
  }
}
```

**Permission Denied**:
```javascript
{
  success: false,
  error: {
    type: 'PERMISSION_DENIED',
    message: 'CPU access permission denied by user'
  }
}
```

**Rate Limit Exceeded**:
```javascript
{
  success: false,
  error: {
    type: 'RATE_LIMIT_EXCEEDED',
    message: 'Too many requests. Please slow down.'
  }
}
```

## API Reference

### System API Methods

#### `system.getCPU()`
Returns CPU usage information.

**Returns**: `Promise<{ usage: number, cores: number }>`
- `usage`: CPU usage percentage (0-100)
- `cores`: Number of CPU cores

**Requires Permission**: `systemInfo.cpu`

**Rate Limit**: 10 calls per second

**Example**:
```javascript
const cpuInfo = await window.widgetAPI.system.getCPU();
console.log(`CPU Usage: ${cpuInfo.usage}%`);
console.log(`CPU Cores: ${cpuInfo.cores}`);
```

#### `system.getMemory()`
Returns memory usage information.

**Returns**: `Promise<{ total: number, used: number, free: number, usagePercent: number }>`
- `total`: Total memory in bytes
- `used`: Used memory in bytes
- `free`: Free memory in bytes
- `usagePercent`: Memory usage percentage (0-100)

**Requires Permission**: `systemInfo.memory`

**Rate Limit**: 10 calls per second

**Example**:
```javascript
const memoryInfo = await window.widgetAPI.system.getMemory();
const totalGB = (memoryInfo.total / 1024 / 1024 / 1024).toFixed(2);
const usedGB = (memoryInfo.used / 1024 / 1024 / 1024).toFixed(2);
console.log(`Memory: ${usedGB} GB / ${totalGB} GB (${memoryInfo.usagePercent.toFixed(1)}%)`);
```

## Widget Configuration

Widgets must declare required permissions in `widget.config.json`:

```json
{
  "id": "system-monitor",
  "name": "system-monitor",
  "displayName": "System Monitor",
  "version": "1.0.0",
  "permissions": {
    "systemInfo": {
      "cpu": true,
      "memory": true
    }
  },
  "sizes": {
    "default": {
      "width": 300,
      "height": 200
    }
  },
  "entryPoint": "dist/index.html"
}
```

## Security Considerations

1. **Permission Persistence**: Permissions are saved per widget ID and persist across app restarts
2. **Rate Limiting**: Prevents widgets from overwhelming the system with API calls
3. **User Control**: Users can grant or deny permissions at runtime
4. **Memory Safety**: Rate limit entries are automatically cleaned up to prevent memory leaks
5. **Error Isolation**: Permission errors don't crash the widget or main process

## Troubleshooting

### Permission Dialog Not Showing
- Check that the widget doesn't already have the permission granted
- Clear permissions from storage and try again
- Check console for error messages

### Rate Limit Errors
- Reduce the frequency of API calls
- Use `useInterval` hook with appropriate delay (recommended: 2000ms for system monitoring)
- Implement exponential backoff for retries

### Widget ID Not Found
- Ensure the widget is created through `WidgetManager.createWidget()`
- Check that the widget window is properly registered
- Verify the widget instance exists in the running widgets map

## Next Steps

After Task 19, the next task (Task 20) will implement the `useSystemInfo` hook in the Widget SDK, which will provide a convenient React hook for accessing system information with automatic polling and error handling.
