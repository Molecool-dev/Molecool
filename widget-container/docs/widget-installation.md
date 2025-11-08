# Widget Installation System

## Overview

The widget installation system allows users to install widgets from the Marketplace directly into the Widget Container application using the `widget://install/{widgetId}` protocol.

## Installation Flow

1. **User clicks "Install" button** in the Marketplace
   - Opens `widget://install/{widgetId}` URL
   - Widget Container receives the protocol URL

2. **Protocol Handler** (`main.ts`)
   - Validates the widget ID format
   - Shows confirmation dialog to user
   - Calls `widgetManager.installWidget(widgetId)`

3. **Widget Manager** (`widget-manager.ts`)
   - Fetches widget metadata from Marketplace API
   - Downloads the widget package (.widget zip file)
   - Extracts the package to the widgets directory
   - Validates the widget.config.json
   - Cleans up temporary files
   - Increments download count (optional)

## API Endpoints

### GET /api/widgets/[id]

Fetches widget metadata from the Marketplace.

**Response:**
```json
{
  "id": "uuid",
  "widget_id": "clock-widget",
  "name": "clock",
  "display_name": "Clock Widget",
  "description": "A simple clock widget",
  "author_name": "John Doe",
  "author_email": "john@example.com",
  "version": "1.0.0",
  "downloads": 42,
  "permissions": {
    "systemInfo": {
      "cpu": false,
      "memory": false
    },
    "network": {
      "enabled": false
    }
  },
  "sizes": {
    "default": {
      "width": 200,
      "height": 200
    }
  },
  "icon_url": "https://example.com/icon.png",
  "download_url": "https://example.com/widgets/clock-widget.widget",
  "created_at": "2024-01-01T00:00:00Z",
  "updated_at": "2024-01-01T00:00:00Z"
}
```

### POST /api/widgets/[id]/download

Increments the download count for a widget.

**Request:**
```json
{
  "widgetId": "clock-widget"
}
```

**Response:**
```json
{
  "success": true
}
```

## Widget Package Format

Widget packages are zip files with the `.widget` extension containing:

```
clock-widget.widget/
├── widget.config.json    # Widget configuration
├── dist/                 # Built widget files
│   ├── index.html       # Entry point
│   ├── assets/
│   │   ├── index.js     # Bundled JavaScript
│   │   └── index.css    # Bundled CSS
└── icon.png             # Widget icon (optional)
```

## Error Handling

The installation system handles various error scenarios:

- **Widget not found**: Returns 404 from API
- **Network errors**: Timeout, connection failures
- **Invalid package**: Missing or invalid widget.config.json
- **Widget ID mismatch**: Config ID doesn't match requested ID
- **Extraction errors**: Corrupted zip file

All errors are displayed to the user via dialog boxes.

## Security Considerations

1. **Widget ID Validation**: Only alphanumeric characters, hyphens, and underscores allowed
2. **HTTPS Only**: All downloads must use HTTPS (enforced by Marketplace)
3. **Config Validation**: Comprehensive validation of widget.config.json
4. **Sandboxed Execution**: Widgets run in Electron sandbox with limited permissions
5. **Cleanup on Failure**: Failed installations are automatically cleaned up

## Environment Variables

- `MARKETPLACE_URL`: URL of the Marketplace (default: https://Molecool-marketplace.vercel.app)

## Testing

To test widget installation:

1. Start the Widget Container: `npm run dev`
2. Open a browser and navigate to: `widget://install/clock-widget`
3. Confirm the installation dialog
4. Check the widgets directory: `%APPDATA%/Molecool-widget-container/widgets/`

## Implementation Details

### Dependencies

- `adm-zip`: For extracting widget packages
- `https`/`http`: Node.js built-in modules for downloading

### File Locations

- **Widgets Directory**: `%APPDATA%/Molecool-widget-container/widgets/`
- **Temp Downloads**: `%TEMP%/{widgetId}.widget`

### Download Timeout

- Metadata fetch: 30 seconds
- Package download: 60 seconds
- Download count increment: 5 seconds (fire and forget)

## Future Enhancements

1. **Progress Indicators**: Show download progress to user
2. **Update Mechanism**: Check for and install widget updates
3. **Dependency Management**: Handle widget dependencies
4. **Signature Verification**: Verify widget packages are signed
5. **Rollback**: Ability to rollback failed installations
6. **Batch Installation**: Install multiple widgets at once
