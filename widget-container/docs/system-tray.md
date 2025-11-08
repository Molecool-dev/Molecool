# System Tray Implementation

## Overview

The Molecool Widget Container now includes system tray functionality that allows the application to run in the background even when all windows are closed.

## Features

### 1. System Tray Icon (Requirement 10.1)

The application displays an icon in the system tray (Windows notification area / macOS menu bar).

**Current Implementation:**
- Uses a programmatically generated 16x16 icon as a fallback
- Can be replaced with a custom icon by placing `tray-icon.png` in the `assets/` folder

**To add a custom tray icon:**

1. Create an `assets` folder in the `widget-container` directory
2. Add a `tray-icon.png` file (recommended size: 16x16 or 32x32 pixels)
3. The icon should be simple and recognizable at small sizes
4. Use a transparent background for best results

### 2. Context Menu (Requirement 10.2)

Right-clicking the tray icon shows a context menu with the following options:

- **Open Manager**: Opens or focuses the Widget Manager window
- **Exit**: Closes all widgets and quits the application

### 3. Open Manager Functionality (Requirement 10.3)

The "Open Manager" option (and double-clicking the tray icon on Windows/Linux) will:

- Create the manager window if it doesn't exist
- Show the window if it's hidden
- Restore the window if it's minimized
- Focus the window if it's already visible

### 4. Exit Functionality (Requirement 10.4)

The "Exit" option will:

1. Set the `isQuitting` flag to allow window closing
2. Close all running widget windows
3. Close the manager window
4. Save all widget states
5. Clean up resources (shortcuts, IPC handlers, tray icon)
6. Quit the application

### 5. Hide on Close (Requirement 10.5)

When the user closes the Manager window (by clicking the X button):

- The window is hidden instead of being destroyed
- The application continues running in the system tray
- Widgets continue to run in the background
- The window can be reopened from the tray menu

## Technical Details

### Window Close Behavior

The manager window's `close` event is intercepted:

```typescript
mainWindow.on('close', (event) => {
  if (!isQuitting) {
    event.preventDefault();
    mainWindow?.hide();
  }
});
```

This prevents the window from closing unless the app is actually quitting.

### App Lifecycle

The `window-all-closed` event no longer quits the app:

```typescript
app.on('window-all-closed', () => {
  // Don't quit - keep running in tray
  console.log('All windows closed, app continues in system tray');
});
```

### Tray Icon Creation

The tray icon is created in `createTray()`:

1. Attempts to load `assets/tray-icon.png`
2. Falls back to a programmatically generated icon if not found
3. Sets up the context menu
4. Registers double-click handler (Windows/Linux)

### Cleanup

The tray icon is properly destroyed when the app quits:

```typescript
if (tray) {
  tray.destroy();
  tray = null;
}
```

## Platform Differences

### Windows
- Tray icon appears in the notification area (bottom-right)
- Double-click opens the manager window
- Right-click shows the context menu

### macOS
- Tray icon appears in the menu bar (top-right)
- Click shows the context menu
- The app also responds to dock icon clicks via the `activate` event

### Linux
- Tray icon appears in the system tray
- Behavior similar to Windows

## Testing

To test the system tray functionality:

1. Start the application: `npm start`
2. Verify the tray icon appears
3. Close the manager window - it should hide, not quit
4. Right-click the tray icon and select "Open Manager" - window should reappear
5. Right-click the tray icon and select "Exit" - app should quit completely

## Future Enhancements

Possible improvements for the system tray:

- Show running widget count in tooltip
- Add quick actions to create widgets from tray menu
- Show notifications for widget events
- Add "Show All Widgets" / "Hide All Widgets" options
- Custom icon for different states (idle, active, error)
