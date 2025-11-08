# Widget Protocol Handler API

## Protocol Format

```
widget://[action]/[widgetId]
```

### Parameters

- **action**: The action to perform (currently only `install` is supported)
- **widgetId**: The unique identifier of the widget (alphanumeric, hyphens, underscores only)

### Examples

Valid URLs:
```
widget://install/clock
widget://install/system-monitor
widget://install/weather_widget
widget://install/Widget-Name-123
```

Invalid URLs:
```
widget://install/widget with spaces    ❌ Spaces not allowed
widget://install/widget.name           ❌ Dots not allowed
widget://install/../../../etc/passwd   ❌ Path traversal blocked
widget://install/<script>alert(1)      ❌ Special chars blocked
```

## Widget ID Requirements

Widget IDs must:
- Be 1-100 characters long
- Contain only: `a-z`, `A-Z`, `0-9`, `-`, `_`
- Not contain: spaces, dots, slashes, or special characters

**Regex**: `/^[a-zA-Z0-9_-]+$/`

## Supported Actions

### `install`
Downloads and installs a widget from the Marketplace.

**Format**: `widget://install/{widgetId}`

**Behavior**:
1. Shows confirmation dialog to user
2. Downloads widget package from Marketplace
3. Extracts and validates widget
4. Installs to widgets directory
5. Shows success/failure notification

**User Flow**:
```
User clicks "Install" on Marketplace
  ↓
Browser opens widget://install/clock
  ↓
Electron app receives protocol URL
  ↓
Shows confirmation dialog
  ↓
User clicks "Install"
  ↓
Downloads and installs widget
  ↓
Shows success notification
```

## Error Handling

The protocol handler validates input and shows appropriate error messages:

| Error | Message |
|-------|---------|
| Invalid protocol | "Invalid protocol: http:" |
| Missing widget ID | "Expected format: widget://install/{widgetId}" |
| Invalid widget ID | "Widget ID contains invalid characters" |
| Unknown action | "The action 'update' is not supported" |
| General error | "Failed to process widget URL: [details]" |

## Platform Support

### Windows
- Protocol registered via `app.setAsDefaultProtocolClient('widget')`
- Handled via `second-instance` event
- Single instance lock ensures only one app instance runs

### macOS
- Protocol registered via `app.setAsDefaultProtocolClient('widget')`
- Handled via `open-url` event
- Native macOS protocol handling

## Security

### Input Validation
All widget IDs are validated before processing:
- Prevents path traversal attacks
- Blocks XSS attempts
- Rejects command injection

### User Confirmation
All installations require explicit user confirmation:
- Shows widget ID in dialog
- User must click "Install" button
- Can cancel at any time

### Sandboxing
Widgets run in sandboxed environment:
- No direct file system access
- Limited network access (whitelist only)
- Permission-based system API access

## Testing

Run the verification script to test protocol handler:
```bash
node verify-protocol-handler.js
```

This runs 19 test cases covering:
- Widget ID validation
- URL parsing
- Security attack patterns
- Error handling

## Integration with Marketplace

The Marketplace website should generate protocol URLs:

```html
<!-- Install button -->
<a href="widget://install/clock">
  Install Widget
</a>

<!-- Or with JavaScript -->
<button onclick="window.location.href='widget://install/clock'">
  Install Widget
</button>
```

## Future Actions (Planned)

- `widget://update/{widgetId}` - Update installed widget
- `widget://uninstall/{widgetId}` - Uninstall widget
- `widget://open/{widgetId}` - Open/activate widget

## Development

### Adding New Actions

1. Add action handler in `handleProtocolUrl()`:
```typescript
if (action === 'newaction') {
  await handleNewAction(widgetId);
}
```

2. Implement handler function:
```typescript
async function handleNewAction(widgetId: string): Promise<void> {
  // Implementation
}
```

3. Update documentation and tests

### Debugging

Enable protocol handler logging:
```typescript
// In main.ts
console.log('Received protocol URL:', url);
console.log('Protocol action:', action);
console.log('Widget ID:', widgetId);
```

Check logs in:
- Development: Console output
- Production: `%APPDATA%/Molecool-widget-container/logs/`

## References

- [Electron Protocol Documentation](https://www.electronjs.org/docs/latest/api/protocol)
- [Custom URL Schemes](https://www.electronjs.org/docs/latest/tutorial/launch-app-from-url-in-another-app)
- Task 29: Implementation details
- Task 30: Widget installation (next phase)
