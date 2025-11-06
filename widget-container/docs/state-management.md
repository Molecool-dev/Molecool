# Widget State Management

## Overview

The Widget Container implements automatic state persistence and restoration for widgets, allowing them to maintain their position, size, and running status across application restarts.

## Features

### Automatic State Saving

Widget state is automatically saved in the following scenarios:

1. **On Widget Close**: When a widget is closed, its final state is persisted
2. **On Position Change**: Position updates are debounced (500ms) and saved automatically
3. **On App Exit**: All running widget states are saved before the application closes

### State Restoration

When the application starts:

1. Checks if auto-restore is enabled (`appSettings.autoRestore`, default: `true`)
2. Loads all saved widget states from storage
3. Filters for widgets that were running when the app closed
4. Validates that each widget still exists in the widgets directory
5. Recreates each widget with its saved position and size
6. Updates state with new instance IDs
7. Cleans up old state entries

### State Structure

Each widget state includes:

```typescript
interface WidgetState {
  widgetId: string;        // Widget type identifier
  instanceId: string;      // Unique instance identifier
  position: { x: number; y: number };
  size: { width: number; height: number };
  isRunning: boolean;      // Whether widget was running
  lastActive: string;      // ISO timestamp of last activity
  permissions: object;     // Widget permissions
}
```

## Storage

Widget states are stored in `electron-store` under the `widgetStates` key:

```javascript
{
  "widgetStates": {
    "instance-uuid-1": { /* WidgetState */ },
    "instance-uuid-2": { /* WidgetState */ }
  }
}
```

## API Methods

### `saveWidgetState(instanceId: string): Promise<void>`

Saves the current state of a specific widget instance.

**Behavior:**
- Retrieves widget from running widgets map
- Gets current window position and size
- Creates state object with current data
- Persists to storage via StorageManager
- Logs success or throws WidgetError on failure

**Error Handling:**
- Warns if widget instance not found
- Throws `WidgetError` with type `STORAGE_ERROR` on save failure

### `restoreWidgets(): Promise<void>`

Restores all widgets that were running when the app was last closed.

**Behavior:**
- Checks if auto-restore is enabled
- Loads all saved widget states
- Filters for running widgets
- Validates widget existence
- Creates widgets with saved positions/sizes
- Updates states with new instance IDs
- Cleans up old state entries
- Continues on individual widget failures

**Error Handling:**
- Logs warnings for missing widgets
- Logs errors for failed restorations
- Never throws - app continues even if restoration fails

### `saveAllWidgetStates(): Promise<void>`

Saves state for all currently running widgets.

**Usage:**
- Called before app exit
- Can be called manually for backup

## Configuration

### Auto-Restore Setting

Control automatic widget restoration:

```javascript
// Disable auto-restore
storageManager.store.set('appSettings.autoRestore', false);

// Enable auto-restore (default)
storageManager.store.set('appSettings.autoRestore', true);
```

## Testing

Run the state management test suite:

```bash
node test-state-management.js
```

The test verifies:
- Method existence
- Storage structure
- Restore with no saved state
- Save with no running widgets
- Widget creation and state saving
- State updates after widget close

## Implementation Details

### Position Restoration

When restoring widgets:
1. Saved position/size is temporarily stored in widget data
2. `createWidget()` reads these values during window creation
3. Window is created at the saved position
4. State is updated with new instance ID

### Instance ID Management

- Each widget instance gets a unique UUID v4 identifier
- Instance IDs change on restoration (new window = new instance)
- Old state entries are cleaned up after successful restoration
- Widget ID (type) remains constant across restarts

### Graceful Degradation

The system handles edge cases gracefully:
- Missing widgets are skipped with warnings
- Individual restoration failures don't block other widgets
- Storage errors are logged but don't crash the app
- Invalid states are ignored

## Future Enhancements

Potential improvements for future versions:
- Widget-specific state data (not just position/size)
- State versioning for migration support
- Configurable restoration delay
- Selective restoration (restore specific widgets)
- State export/import for backup
