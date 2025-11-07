# Permission Request Dialog Usage

## Overview

The Permission Request Dialog is implemented in the `PermissionsManager` class and provides a user-friendly way to request permissions from users when widgets need access to sensitive system resources.

## Implementation Details

### Location
- **File**: `src/main/permissions.ts`
- **Class**: `PermissionsManager`
- **Method**: `requestPermission(request: PermissionRequest): Promise<boolean>`

### Features

1. **User-Friendly Dialog**: Shows a native Electron dialog with clear information
2. **Widget Identification**: Displays the widget's display name
3. **Permission Description**: Shows human-readable permission labels
4. **Optional Reason**: Supports optional reason text for transparency
5. **Persistent Decisions**: Saves user's choice for future requests
6. **Smart Caching**: Skips dialog if permission already granted

## Usage Example

```typescript
import { PermissionsManager } from './permissions';
import { StorageManager } from './storage';

// Initialize
const storage = new StorageManager();
const permissions = new PermissionsManager(storage);

// Request permission
const request = {
  widgetId: 'my-widget-id',
  widgetName: 'My Awesome Widget',
  permission: 'systemInfo.cpu',
  reason: 'To display CPU usage in real-time' // Optional
};

const granted = await permissions.requestPermission(request);

if (granted) {
  // Permission granted - proceed with API call
  const cpuUsage = await systemAPI.getCPU();
} else {
  // Permission denied - show error or fallback UI
  console.log('User denied CPU access');
}
```

## Supported Permissions

### System Information
- `systemInfo.cpu` - CPU usage information
- `systemInfo.memory` - Memory usage information

### Network
- `network` - Network access

## Dialog Behavior

### First Request
When a widget requests a permission for the first time:
1. Dialog is shown with widget name and permission description
2. User clicks "Allow" or "Deny"
3. Decision is saved to persistent storage
4. Method returns `true` (allowed) or `false` (denied)

### Subsequent Requests
When the same widget requests the same permission again:
1. Checks saved permissions
2. If already granted, returns `true` immediately (no dialog)
3. If previously denied, returns `false` immediately (no dialog)

## Dialog Content

### With Reason
```
Title: Permission Request
Message: [Widget Name] wants to access [Permission Label].

Reason: [Custom reason text]

Buttons: [Allow] [Deny]
```

### Without Reason
```
Title: Permission Request
Message: [Widget Name] wants to access [Permission Label].

Buttons: [Allow] [Deny]
```

## Integration with IPC Handlers

The permission request dialog will be integrated with IPC handlers in Task 19. The typical flow will be:

```typescript
// In IPC handler for system API
ipcMain.handle('system:getCPU', async (event, widgetId) => {
  // Check if permission is granted
  if (!permissions.hasPermission(widgetId, 'systemInfo.cpu')) {
    // Request permission from user
    const granted = await permissions.requestPermission({
      widgetId,
      widgetName: getWidgetName(widgetId),
      permission: 'systemInfo.cpu',
      reason: 'To monitor system performance'
    });
    
    if (!granted) {
      throw new WidgetError(
        WidgetErrorType.PERMISSION_DENIED,
        'User denied CPU access'
      );
    }
  }
  
  // Permission granted - proceed with API call
  return await systemAPI.getCPU();
});
```

## Testing

Run the test script to verify the permission dialog:

```bash
npm run build
npx electron test-permission-dialog.js
```

The test covers:
- ✓ Dialog display with widget name and permission
- ✓ Allow response handling
- ✓ Deny response handling
- ✓ Permission persistence
- ✓ Skipping dialog for already granted permissions
- ✓ With and without reason text
- ✓ Correct permission labels

## Requirements Satisfied

This implementation satisfies the following requirements:

- **Requirement 3.1**: Shows permission request dialog when widget requests sensitive permissions
- **Requirement 3.5**: Displays widget name and requested permissions in the dialog

## Next Steps

- **Task 18**: Implement API rate limiting
- **Task 19**: Integrate system API with IPC handlers and permission checks
- **Task 20**: Implement useSystemInfo Hook in Widget SDK
