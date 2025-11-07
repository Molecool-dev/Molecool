# Widget Protocol Handler Implementation

## Overview

The Widget Container implements a custom URL protocol handler (`widget://`) that enables deep linking from the Marketplace website to the desktop application. This allows users to install widgets by clicking "Install" buttons on the Marketplace, which triggers the Widget Container to handle the installation.

**Requirement**: 6.5 - Widget installation via custom URL protocol

## Protocol Format

```
widget://install/{widgetId}
```

**Examples**:
- `widget://install/clock-widget`
- `widget://install/system-monitor`
- `widget://install/weather-widget`

## Implementation Details

### 1. Protocol Registration

The protocol is registered in `src/main/main.ts` before the app is ready:

```typescript
// Register protocol before app is ready (required for Windows)
if (process.defaultApp) {
  // Development mode: register with electron executable
  if (process.argv.length >= 2) {
    app.setAsDefaultProtocolClient('widget', process.execPath, [process.argv[1]]);
  }
} else {
  // Production mode: register normally
  app.setAsDefaultProtocolClient('widget');
}
```

**Development Mode**: Registers with the Electron executable and main script path
**Production Mode**: Registers with the built application

### 2. Platform-Specific Handling

#### macOS: `open-url` Event

```typescript
app.on('open-url', (event, url) => {
  event.preventDefault();
  console.log('macOS open-url event:', url);
  handleProtocolUrl(url);
});
```

On macOS, the OS sends an `open-url` event to the running application when a protocol URL is clicked.

#### Windows: `second-instance` Event

```typescript
const gotTheLock = app.requestSingleInstanceLock();

if (!gotTheLock) {
  app.quit();
} else {
  app.on('second-instance', (event, commandLine, workingDirectory) => {
    const protocolUrl = commandLine.find(arg => arg.startsWith('widget://'));
    
    if (protocolUrl) {
      handleProtocolUrl(protocolUrl);
    }
    
    // Focus the main window
    if (mainWindow) {
      if (mainWindow.isMinimized()) {
        mainWindow.restore();
      }
      mainWindow.focus();
    }
  });
}
```

On Windows, clicking a protocol URL attempts to launch a second instance. The single instance lock ensures only one instance runs, and the protocol URL is extracted from command line arguments.

### 3. URL Parsing and Handling

The `handleProtocolUrl()` function processes the protocol URL:

```typescript
async function handleProtocolUrl(url: string): Promise<void> {
  // Parse the URL
  const urlObj = new URL(url);
  
  // Validate protocol
  if (urlObj.protocol !== 'widget:') {
    console.warn('Invalid protocol:', urlObj.protocol);
    return;
  }
  
  // Extract action and widget ID
  const pathParts = urlObj.pathname.split('/').filter(part => part.length > 0);
  
  if (pathParts.length < 2) {
    // Show error dialog for invalid format
    return;
  }
  
  const action = pathParts[0];
  const widgetId = pathParts[1];
  
  // Handle different actions
  if (action === 'install') {
    // Show confirmation dialog
    // Proceed with installation (Task 30)
  }
}
```

### 4. User Confirmation

Before installing a widget, the user is shown a confirmation dialog:

```typescript
const result = await dialog.showMessageBox({
  type: 'question',
  buttons: ['Install', 'Cancel'],
  defaultId: 0,
  title: 'Install Widget',
  message: `Do you want to install the widget "${widgetId}"?`,
  detail: 'This will download and install the widget from the Marketplace.'
});

if (result.response === 0) {
  // User clicked "Install"
  // TODO: Implement actual installation in Task 30
}
```

### 5. Error Handling

The implementation includes comprehensive error handling:

- **Invalid Protocol**: Silently ignores non-`widget://` URLs
- **Invalid Format**: Shows error dialog explaining expected format
- **Unknown Action**: Shows error dialog listing supported actions
- **Parse Errors**: Catches and displays any URL parsing errors

## electron-builder Configuration

The protocol is registered in `package.json` for production builds:

```json
{
  "build": {
    "protocols": [
      {
        "name": "Molecule Widget Protocol",
        "schemes": ["widget"]
      }
    ]
  }
}
```

This ensures the protocol is registered with the operating system when the app is installed.

## Testing

### Manual Testing

1. **Start the app**: `npm run dev` in the widget-container directory
2. **Open test page**: Open `test-protocol.html` in a browser
3. **Click test links**: Try various protocol URLs
4. **Verify behavior**: Check dialogs and console output

### Test Cases

See `src/main/__tests__/protocol-handler-manual-test.md` for detailed test cases.

### Quick Test

Create an HTML file with this link:

```html
<a href="widget://install/clock-widget">Install Clock Widget</a>
```

Click it and verify the confirmation dialog appears.

## Integration with Marketplace

The Marketplace (Task 28) will use this protocol in the Install button:

```typescript
// In widget detail page
<button
  onClick={() => {
    window.location.href = `widget://install/${widget.widget_id}`;
  }}
>
  Install Widget
</button>
```

When clicked:
1. Browser attempts to open `widget://install/{widgetId}`
2. OS launches or focuses the Widget Container
3. Widget Container shows confirmation dialog
4. If confirmed, downloads and installs the widget (Task 30)

## Security Considerations

1. **User Confirmation**: Always show confirmation dialog before installation
2. **URL Validation**: Validate protocol and URL format
3. **Single Instance**: Prevent multiple app instances
4. **Error Handling**: Gracefully handle malformed URLs

## Future Enhancements

Potential future actions that could be supported:

- `widget://uninstall/{widgetId}` - Uninstall a widget
- `widget://update/{widgetId}` - Update a widget
- `widget://configure/{widgetId}` - Open widget settings
- `widget://open/{widgetId}` - Open/create a widget instance

## Troubleshooting

### Protocol Not Registered

**Symptom**: Clicking `widget://` links does nothing

**Solutions**:
- In development: Ensure app is running with `npm run dev`
- In production: Reinstall the app to register the protocol
- On Windows: Check Windows Registry for protocol registration
- On macOS: Check Info.plist for protocol registration

### Multiple Instances on Windows

**Symptom**: Multiple app windows open when clicking links

**Solution**: Verify single instance lock is working:
```typescript
const gotTheLock = app.requestSingleInstanceLock();
```

### Protocol URL Not Received

**Symptom**: App opens but doesn't handle the URL

**Solutions**:
- Check console for log messages
- Verify event handlers are registered before app is ready
- On Windows: Check command line arguments in `second-instance` event
- On macOS: Check `open-url` event is firing

## References

- [Electron Protocol Documentation](https://www.electronjs.org/docs/latest/api/protocol)
- [Electron app.setAsDefaultProtocolClient](https://www.electronjs.org/docs/latest/api/app#appsetasdefaultprotocolclientprotocol-path-args)
- [electron-builder Protocol Configuration](https://www.electron.build/configuration/configuration#Configuration-protocols)

## Related Tasks

- **Task 28**: Marketplace Widget Detail Page (implements Install button)
- **Task 30**: Widget Download and Installation (implements actual installation logic)
- **Task 6.5**: Requirement for custom URL protocol support
