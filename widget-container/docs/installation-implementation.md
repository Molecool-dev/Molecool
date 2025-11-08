# Widget Installation Implementation - Task 30

## Overview

Task 30 implements the complete widget download and installation system for the Molecool Widget Platform. This allows users to install widgets directly from the Marketplace using the `widget://install/{widgetId}` protocol.

## Implementation Summary

### Files Modified

1. **widget-container/src/main/widget-manager.ts**
   - Added `installWidget()` method - main installation orchestrator
   - Added `fetchWidgetMetadata()` - fetches widget info from Marketplace API
   - Added `downloadWidget()` - downloads widget package with redirect support
   - Added `extractWidget()` - extracts zip package using adm-zip
   - Added `incrementDownloadCount()` - updates download statistics (fire-and-forget)
   - Added `removeDirectory()` - recursive directory cleanup utility

2. **widget-container/src/main/main.ts**
   - Updated `handleWidgetInstall()` to call the actual installation method
   - Added progress and success/error dialogs
   - Integrated with existing protocol handler

3. **widget-container/package.json**
   - Added `adm-zip` dependency for zip extraction
   - Added `@types/adm-zip` for TypeScript support

### Files Created

1. **widget-marketplace/app/api/widgets/route.ts**
   - GET endpoint to fetch all widgets

2. **widget-marketplace/app/api/widgets/[id]/route.ts**
   - GET endpoint to fetch single widget metadata

3. **widget-marketplace/app/api/widgets/[id]/download/route.ts**
   - POST endpoint to increment download count

4. **widget-container/docs/widget-installation.md**
   - Comprehensive documentation of the installation system

5. **widget-container/docs/testing-installation.md**
   - Testing guide with scenarios and checklists

6. **widget-container/docs/installation-implementation.md**
   - This implementation summary

7. **widget-container/scripts/create-test-widget.js**
   - Utility script to create test widget packages

## Installation Flow

```
User clicks "Install" in Marketplace
         ↓
widget://install/{widgetId} URL opened
         ↓
Protocol handler validates widget ID
         ↓
Confirmation dialog shown to user
         ↓
User confirms installation
         ↓
widgetManager.installWidget(widgetId) called
         ↓
┌─────────────────────────────────────┐
│ 1. Fetch widget metadata from API  │
│    - GET /api/widgets/{id}          │
│    - Validate response              │
└─────────────────────────────────────┘
         ↓
┌─────────────────────────────────────┐
│ 2. Download widget package          │
│    - Download .widget zip file      │
│    - Handle redirects               │
│    - Save to temp directory         │
└─────────────────────────────────────┘
         ↓
┌─────────────────────────────────────┐
│ 3. Extract widget package           │
│    - Extract to widgets directory   │
│    - Preserve directory structure   │
└─────────────────────────────────────┘
         ↓
┌─────────────────────────────────────┐
│ 4. Validate widget.config.json      │
│    - Check required fields          │
│    - Verify widget ID matches       │
│    - Validate permissions structure │
└─────────────────────────────────────┘
         ↓
┌─────────────────────────────────────┐
│ 5. Clean up temporary files         │
│    - Delete downloaded zip          │
└─────────────────────────────────────┘
         ↓
┌─────────────────────────────────────┐
│ 6. Increment download count         │
│    - POST /api/widgets/{id}/download│
│    - Fire and forget (non-blocking) │
└─────────────────────────────────────┘
         ↓
Success dialog shown to user
```

## Key Features

### 1. Robust Error Handling

- Network errors (timeout, connection failure)
- Invalid widget packages
- Missing or invalid configuration
- Widget ID mismatch
- Automatic cleanup on failure

### 2. Security

- Widget ID validation (alphanumeric + hyphens/underscores only)
- HTTPS enforcement for downloads
- Comprehensive config validation
- Path traversal prevention
- Sandboxed widget execution

### 3. User Experience

- Clear confirmation dialogs
- Progress indication
- Detailed error messages
- Automatic cleanup of failed installations

### 4. Reliability

- Redirect support for download URLs
- Timeout handling (30s for metadata, 60s for download)
- Graceful degradation (download count increment is optional)
- Cleanup of partial installations

## API Endpoints

### GET /api/widgets/{id}

Fetches widget metadata including download URL.

**Response:**
```json
{
  "widget_id": "clock-widget",
  "name": "clock",
  "display_name": "Clock Widget",
  "download_url": "https://example.com/clock-widget.widget",
  "version": "1.0.0",
  "permissions": {...},
  "sizes": {...}
}
```

### POST /api/widgets/{id}/download

Increments the download count for analytics.

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

Widget packages are zip files with `.widget` extension:

```
widget-name.widget/
├── widget.config.json    # Required: Widget configuration
├── dist/                 # Required: Built widget files
│   ├── index.html       # Required: Entry point
│   ├── assets/          # Optional: JS/CSS/images
│   │   ├── index.js
│   │   └── index.css
└── icon.png             # Optional: Widget icon
```

## Configuration

### Environment Variables

- `MARKETPLACE_URL`: Marketplace base URL (default: https://Molecool-marketplace.vercel.app)

### File Locations

- **Widgets Directory**: `%APPDATA%/Molecool-widget-container/widgets/`
- **Temp Downloads**: `%TEMP%/{widgetId}.widget`

### Timeouts

- Metadata fetch: 30 seconds
- Package download: 60 seconds
- Download count: 5 seconds (fire-and-forget)

## Testing

### Manual Testing

1. Run the test widget creation script:
   ```bash
   node scripts/create-test-widget.js
   ```

2. Upload the generated package to a web server

3. Add the widget to the Marketplace database

4. Test installation via Marketplace or protocol URL

### Test Scenarios

- ✅ Successful installation
- ✅ Widget not found (404)
- ✅ Network error
- ✅ Invalid package format
- ✅ Widget ID mismatch
- ✅ Installation cancellation
- ✅ Duplicate installation (overwrite)

See `docs/testing-installation.md` for detailed test cases.

## Dependencies

### New Dependencies

- **adm-zip** (^0.5.10): ZIP file extraction
- **@types/adm-zip** (^0.5.5): TypeScript definitions

### Built-in Modules Used

- `https`: HTTPS requests
- `http`: HTTP requests (for redirects)
- `fs`: File system operations
- `path`: Path manipulation
- `crypto`: UUID generation (existing)

## Error Types

All errors are wrapped in `WidgetError` with appropriate types:

- `INVALID_CONFIG`: Invalid or missing configuration
- `NETWORK_ERROR`: Network/download failures
- `STORAGE_ERROR`: File system errors

## Future Enhancements

1. **Progress Indicators**: Real-time download progress
2. **Update Mechanism**: Check for and install updates
3. **Dependency Management**: Handle widget dependencies
4. **Signature Verification**: Verify package authenticity
5. **Rollback**: Restore previous version on failure
6. **Batch Installation**: Install multiple widgets at once
7. **Offline Mode**: Cache packages for offline installation
8. **Delta Updates**: Download only changed files

## Requirements Satisfied

This implementation satisfies **Requirement 6.5**:

> WHEN Widget Container接收到安裝協議請求，THE Widget Container SHALL 下載、解壓並安裝該 Widget

All acceptance criteria are met:
- ✅ Downloads widget from Marketplace API
- ✅ Extracts .widget zip file
- ✅ Validates widget.config.json
- ✅ Adds to installed widgets list
- ✅ Handles errors gracefully

## Integration Points

### With Protocol Handler (Task 29)

The installation system integrates seamlessly with the existing protocol handler:

```typescript
// main.ts
async function handleWidgetInstall(widgetId: string) {
  // ... confirmation dialog ...
  await widgetManager.installWidget(widgetId);
  // ... success dialog ...
}
```

### With Widget Manager

Installed widgets are immediately available:

```typescript
// After installation
const installedWidgets = await widgetManager.loadInstalledWidgets();
// New widget appears in the list
```

### With Marketplace

The Marketplace provides:
- Widget metadata via API
- Download URLs for packages
- Download count tracking

## Performance Considerations

- **Memory**: Streams are used for downloads to minimize memory usage
- **Disk I/O**: Temporary files are cleaned up immediately
- **Network**: Timeouts prevent hanging on slow connections
- **Concurrency**: Multiple installations can run simultaneously (if needed in future)

## Security Considerations

1. **Input Validation**: Widget IDs are validated before processing
2. **Path Safety**: All file operations use safe path joining
3. **Config Validation**: Comprehensive validation prevents malicious configs
4. **Cleanup**: Failed installations are fully cleaned up
5. **Sandboxing**: Installed widgets run in Electron sandbox

## Conclusion

Task 30 is now complete with a robust, secure, and user-friendly widget installation system. The implementation includes comprehensive error handling, security measures, and documentation for testing and future maintenance.
