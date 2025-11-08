# Molecool Widget Container

The Electron-based desktop application that manages and runs widgets on your desktop.

## Project Structure

```
widget-container/
├── src/
│   ├── main/           # Main process (Node.js)
│   │   └── main.ts     # Application entry point
│   ├── preload/        # Preload scripts (security bridge)
│   │   ├── manager-preload.ts
│   │   └── widget-preload.ts
│   └── renderer/       # Renderer process (UI)
│       ├── manager.html
│       └── manager.js
├── dist/               # Compiled TypeScript output
├── package.json
└── tsconfig.json
```

## Development

### Prerequisites

- Node.js 18+ 
- npm or yarn

### Installation

```bash
npm install
```

### Running in Development Mode

```bash
# Compile TypeScript and start Electron
npm run dev

# Or just start (if already compiled)
npm start
```

### Building

```bash
# Compile TypeScript
npm run build
```

### Packaging for Distribution

Create installers for Windows and macOS:

```bash
# Verify packaging configuration
npm run package:verify

# Package for Windows (creates .exe installer)
npm run package:win

# Package for macOS (creates .dmg)
npm run package:mac

# Generate placeholder icons
npm run icons
```

**Output:** Installers are created in `dist-build/` directory.

See [PACKAGING.md](./PACKAGING.md) for detailed packaging guide and [docs/building-and-packaging.md](./docs/building-and-packaging.md) for comprehensive documentation.

### Testing

#### Automated Tests

**Unit Tests**

Run all unit tests with Jest:

```bash
npm test
```

Run specific test suites:

```bash
# Widget Manager tests (14 tests)
npm test -- widget-manager.test.ts

# Error handling tests (11 tests)
npm test -- error-handling.test.ts

# Permissions system tests (30+ tests) ✨
npm test -- permissions.test.ts

# Security tests (20 tests)
npm test -- security.test.ts

# IPC integration tests (20 tests)
npm test -- ipc-integration.test.ts
```

**Test Coverage:** 155+ automated tests across all components

**Recent Test Additions (2025-11-07):**
- **Permissions System Tests**: Comprehensive test suite with 30+ tests covering permission dialogs, granting/denial, rate limiting, and unauthorized access prevention (Task 37.2 ✅)

**Recent Test Improvements:**
- **Performance Monitor**: Enhanced error handling test reliability by mocking Electron API responses instead of throwing during setup phase
- **Permissions System**: Added comprehensive test suite (30+ tests) covering all permission flows, rate limiting, and security validation (Task 37.2 ✅)

#### Manual Testing

**Preparation Script**

Before starting manual testing, use the preparation script to verify all components are built:

```bash
npm run test:manual
```

This script checks:
- Widget Container build status
- Example widgets build status (Clock, System Monitor, Weather)
- Widget SDK build status
- Documentation availability

The script will:
- ✅ Show which components are ready
- ❌ List missing builds with commands to fix them
- Provide quick start commands for testing
- Display paths to testing documentation

**Quick Commands:**
```bash
# Check if ready for manual testing
npm run test:manual

# Build all components (if needed)
npm run build:all

# Start testing
npm start

# Clear all data (reset state)
# Windows:
rmdir /s /q %APPDATA%\widget-container
# macOS/Linux:
rm -rf ~/Library/Application\ Support/widget-container
```

See `docs/MANUAL_TESTING_GUIDE.md` for detailed test cases and procedures.

#### Integration Tests

**IPC Integration Tests** (`__tests__/ipc-integration.test.ts`)

Comprehensive integration tests covering the complete IPC communication flow with storage, permissions, and system APIs. Tests 20 scenarios including:

**Storage API Integration:**
- Complete storage flow: set → get → remove
- Complex data types (nested objects, arrays, null values)
- Error handling with invalid keys
- Storage isolation between widgets

**System API with Permissions:**
- Permission request dialogs on first access
- Permission denial handling
- Permission persistence (no re-prompting)
- Separate permissions for CPU and memory
- Rate limiting enforcement (10 calls/second)

**Settings API:**
- Settings retrieval (get and getAll)
- Non-existent settings handling

**UI API:**
- Window resize operations
- Dimension validation (min: 100x100, max: 2000x2000)
- Window position changes
- Position persistence to storage
- Window bounds retrieval

**Error Handling:**
- Window not found errors
- Invalid input type validation
- Standardized error response format

**Cross-API Integration:**
- Complete widget lifecycle simulation
- Storage + permissions + system API + UI coordination
- State persistence verification

Run integration tests:
```bash
npm test -- ipc-integration.test.ts
```

#### Standalone Test Scripts

**Dragging Storage Test**

Verify position persistence without running the full Electron app:

```bash
node test-dragging.js
```

This test verifies:
- Saving widget positions and sizes to storage
- Retrieving saved positions correctly
- Updating positions (simulating drag operations)
- Managing multiple widget positions simultaneously
- Storage cleanup

The test uses `electron-store` directly to validate the storage layer that powers the auto-save functionality in the dragging system.

## Architecture

The Widget Container is built with Electron and follows security best practices:

- **Main Process**: Manages application lifecycle, window creation, and system APIs
- **Preload Scripts**: Secure bridge between renderer and main process using `contextBridge`
- **Renderer Process**: UI for the Widget Manager and individual widgets

### Core Components

**StorageManager**
- Handles all persistent data storage using `electron-store`
- Manages widget states, widget data, and app settings
- Provides methods for saving/loading positions, sizes, and configurations

**WindowController**
- Creates and manages BrowserWindow instances with advanced lifecycle management
- Handles widget windows and manager window creation
- Implements platform-specific glass effects with smooth fade-in/fade-out animations
- Enables delta-based dragging with automatic position persistence
- Tracks window types (widget vs manager) for proper handling
- Manages timer lifecycle with automatic cleanup to prevent memory leaks
- Configures performance optimizations (V8 caching, WebGL disabled for widgets)

**WidgetManager**
- Manages widget lifecycle (load, create, close)
- Tracks running widget instances
- Handles state persistence and restoration
- Depends on WindowController and StorageManager

**IPCHandlers**
- Registers all IPC communication channels
- Bridges renderer process requests to main process functionality
- Has reference to StorageManager (constructor) and WidgetManager (via `setWidgetManager()`)
- Automatically initializes PermissionsManager and SystemAPI with dependency injection support
- Enables renderer to access widget management, storage operations, and system APIs with permission checks
- Provides `destroy()` method for proper resource cleanup on app shutdown

**SecurityManager**
- Enforces Content Security Policy (CSP) for all widget windows
- Dynamically configures CSP based on widget permissions
- Blocks insecure HTTP requests (HTTPS-only enforcement)
- Registers/unregisters widgets for CSP configuration
- Provides `destroy()` method for cleanup on app shutdown

### Component Initialization

The components are initialized in `main.ts` in the following order:

1. `SecurityManager` - No dependencies (must be initialized before creating windows)
2. `WindowController` - No dependencies
3. `StorageManager` - No dependencies
4. `WidgetManager` - Requires WindowController, StorageManager, and optionally SecurityManager
5. `IPCHandlers` - Requires StorageManager, automatically creates SystemAPI and PermissionsManager instances
6. WidgetManager is connected to IPCHandlers via `setWidgetManager()`

This initialization order ensures all dependencies are available when needed while maintaining clean separation of concerns. SecurityManager must be initialized first to ensure CSP and network filtering are active before any windows are created.

**Dependency Injection**: IPCHandlers supports optional dependency injection for testing:
```typescript
// Production (automatic initialization)
const ipcHandlers = new IPCHandlers(storageManager);

// Testing (with mocks)
const ipcHandlers = new IPCHandlers(storageManager, mockSystemAPI, mockPermissionsManager);
```

### Security Features

- Context Isolation enabled
- Node Integration disabled
- Sandbox mode enabled
- Content Security Policy (CSP) dynamically enforced based on widget permissions
- HTTPS-only network requests (HTTP blocked except localhost)
- Limited API exposure through preload scripts
- SecurityManager handles CSP headers and network filtering

See `docs/security.md` for detailed security documentation.

### Widget Window Features

#### Dragging System

Widgets can be freely dragged around the desktop with an intelligent dragging system:

- **Smart Element Detection**: Dragging is disabled on interactive elements (buttons, inputs, selects, textareas, links) to prevent conflicts with user interactions
- **Smooth Position Tracking**: Uses delta-based positioning for accurate movement without drift or jitter
- **Debounced Auto-Save**: Widget positions are automatically saved to storage 500ms after dragging stops, preventing excessive writes
- **Visual Feedback**: Cursor changes to 'move' during drag operations, with user-select disabled to prevent text selection
- **Cross-Platform**: Works consistently on Windows and macOS
- **Edge Case Handling**: Properly handles mouse leaving the window and cleanup on window close

The dragging implementation uses a hybrid approach:
1. **Renderer Process**: Injected JavaScript handles mousedown/mousemove/mouseup events and calculates new positions using screen coordinates
2. **IPC Communication**: Position updates are sent to main process via `widgetAPI.ui.setPosition()`
3. **Main Process**: Receives position updates and moves the window using Electron's BrowserWindow API
4. **Auto-Save**: Position changes are debounced (500ms) and saved via `widgetAPI.ui.savePosition()`
5. **Persistence**: On restart, widgets restore to their last saved positions from storage

**Implementation Details:**
- Uses `window.webContents.executeJavaScript()` to inject dragging logic after page load
- Tracks initial window position and mouse position on mousedown
- Calculates delta movement and applies to window position
- Prevents dragging when clicking on interactive elements using element tag checks and `closest()` queries
- Emits `window-position-changed` events for widget manager to track state

#### Glass Effect

Widgets feature a modern glass/blur effect with smooth animations:
- **Windows 11**: Mica material effect
- **Windows 10**: Acrylic material effect  
- **macOS**: Vibrancy effect with 'under-window' style
- **Fallback**: CSS backdrop-filter for cross-platform compatibility
- **Fade-In Animation**: Smooth 300ms fade-in on widget creation (20 steps)
- **Fade-Out Animation**: Smooth 250ms fade-out before widget close (15 steps)
- **Memory Safe**: All animation timers tracked and cleaned up automatically
- **Crash Resistant**: Handles window destruction during animation gracefully

## Widget Management

### Widget Lifecycle

The Widget Manager handles the complete lifecycle of widgets:

**Loading Widgets**
- Scans the widgets directory for installed widgets
  - Development: `project-root/widgets/`
  - Production: `userData/widgets/`
- Reads and validates `widget.config.json` from each widget subdirectory
- Validates required fields: id, name, displayName, version, entryPoint, permissions, sizes

**Creating Widgets**
- Generates unique instance IDs using UUID v4
- Enforces widget limit (default: 10 concurrent widgets)
- Restores saved position and size from storage, or uses defaults
- Creates BrowserWindow with widget configuration
- Loads widget entry point (HTML file)
- Sets up event handlers for window lifecycle

**Widget State**
- Tracks position changes automatically on window move
- Debounced auto-save for positions (500ms)
- Saves final position on widget close
- Maintains in-memory map of running widget instances

**Closing Widgets**
- Saves final position before closing
- Cleans up event listeners and resources
- Removes from running widgets map
- Handles window crashes gracefully

**State Persistence**
- Automatically saves widget state including position, size, and running status
- State is saved when widgets are closed or app exits
- Includes last active timestamp and permission settings
- Debounced writes prevent excessive storage operations

**Auto-Restore on Startup**
- Automatically restores widgets that were running when app was closed
- Validates that widgets still exist before restoration
- Restores saved positions and sizes
- Can be disabled via `appSettings.autoRestore` setting
- Gracefully handles restoration failures without blocking app startup

### Widget Directory Structure

The widgets directory location depends on the environment:

**Development Mode** (`NODE_ENV=development` or `app.isPackaged=false`):
```
project-root/widgets/
├── clock-widget/
│   ├── widget.config.json
│   ├── index.html
│   └── ...
└── system-monitor/
    ├── widget.config.json
    ├── index.html
    └── ...
```

**Production Mode** (packaged app):
```
userData/widgets/
├── clock-widget/
│   ├── widget.config.json
│   ├── index.html
│   └── ...
└── system-monitor/
    ├── widget.config.json
    ├── index.html
    └── ...
```

This allows developers to work with widgets directly in the project directory during development, while production users have widgets installed in their user data directory.

### Widget Configuration

Each widget requires a `widget.config.json` with:
- `id`: Unique widget identifier
- `name`: Internal name
- `displayName`: User-facing name
- `version`: Semantic version
- `entryPoint`: Path to HTML entry file
- `permissions`: Permission requirements object
- `sizes.default`: Default width and height

## Storage

The Widget Container uses `electron-store` for persistent data storage:

**Widget States** (`widgetStates`)
- Stores state for each widget instance by instance ID
- Includes: widgetId, instanceId, position, size, isRunning, lastActive, permissions
- Automatically cleaned up when widgets are removed

**Widget Data** (`widgetData`)
- Per-widget persistent storage accessible via Widget SDK
- Organized by widget ID and key-value pairs
- Used for widget-specific settings and data

**App Settings** (`appSettings`)
- `autoRestore`: Enable/disable automatic widget restoration on startup (default: true)

## System API

The Widget Container provides system information APIs that widgets can access through the Widget SDK:

### SystemAPI Class

Located in `src/main/system-api.ts`, provides methods to query system metrics:

**CPU Usage**
- `getCPUUsage()`: Returns CPU usage percentage (0-100)
- Uses delta-based calculation between measurements for accuracy
- Automatically handles first-call initialization with 100ms delay
- Prevents division by zero with safety checks
- Clamps results to 0-100 range

**Memory Information**
- `getMemoryInfo()`: Returns memory statistics
  - `total`: Total system memory in bytes
  - `used`: Used memory in bytes
  - `free`: Free memory in bytes
  - `usagePercent`: Memory usage percentage (0-100)
- Rounded to 2 decimal places for consistency

**Complete System Info**
- `getSystemInfo()`: Returns combined CPU and memory information
- Includes CPU core count
- All values rounded to 2 decimal places

### IPC Integration

System APIs are exposed to widgets through IPC handlers:

- `system:getCPU` - Returns CPU usage percentage as a number (0-100)
- `system:getMemory` - Returns memory statistics object

Both handlers include error handling and return standardized response format:
```typescript
{
  success: boolean,
  data?: any,
  error?: { type: WidgetErrorType, message: string }
}
```

**Note**: The `system:getCPU` handler returns the full object `{ usage: number, cores: number }` from the main process, but the preload script extracts and returns only the `usage` number to match the Widget SDK's expected API.

### Usage in Widgets

Widgets access system information through the Widget SDK's `useSystemInfo` hook:

```typescript
const cpuUsage = useSystemInfo('cpu', 2000); // Returns number (0-100)
const memoryInfo = useSystemInfo('memory', 2000); // Returns memory object
```

**Return Types:**
- `cpu`: Returns `number` - CPU usage percentage (0-100)
- `memory`: Returns `{ total, used, free, usagePercent }` - Memory statistics object

## Permissions System

The Widget Container includes a comprehensive permissions management system to control widget access to sensitive APIs.

### PermissionsManager Class

Located in `src/main/permissions.ts`, manages all permission-related functionality:

**Permission Types**
- `systemInfo.cpu` - Access to CPU usage information
- `systemInfo.memory` - Access to memory usage information
- `network` - Network access capabilities

**Core Features**

**Permission Validation**
- Validates permission format against whitelist of valid permissions
- Throws `WidgetError` with `INVALID_CONFIG` type for invalid permissions
- Prevents typos and malformed permission strings

**Permission Storage**
- Persists permission decisions using StorageManager
- Supports per-widget permission sets
- Tracks both systemInfo and network permissions separately

**Permission Checking**
- `hasPermission(widgetId, permission)` - Check if widget has specific permission
- `getPermissions(widgetId)` - Get all permissions for a widget
- `savePermission(widgetId, permission, granted)` - Save permission decision

**User Permission Requests**
- `requestPermission(request)` - Shows dialog to request permission from user
- Displays widget name, permission type, and optional reason
- Returns boolean indicating if permission was granted
- Automatically saves user's decision

**Rate Limiting**
- Prevents API abuse with configurable rate limits (default: 10 calls/second)
- `checkRateLimit(widgetId, apiName, throwOnExceed)` - Check if call is allowed
- Per-widget, per-API tracking using sliding window algorithm
- Optional error throwing mode for strict enforcement
- Throws `WidgetError` with `RATE_LIMIT_EXCEEDED` type when limit exceeded

**Memory Management**
- Automatic cleanup of expired rate limit entries every 5 minutes
- Prevents memory leaks from accumulating rate limit data
- `clearRateLimits(widgetId)` - Manual cleanup for specific widget
- `resetAllRateLimits()` - Clear all rate limit data
- `destroy()` - Stop cleanup timer on shutdown

**Error Handling**
- Uses `WidgetError` class for consistent error reporting
- Error types: `INVALID_CONFIG`, `RATE_LIMIT_EXCEEDED`
- Includes widget ID in errors for better debugging
- All errors include descriptive messages

### Integration with IPC Handlers

The PermissionsManager is automatically initialized by IPCHandlers and integrated into all system API calls:

**Automatic Permission Flow**:
1. Widget calls system API (e.g., `system.getCPU()`)
2. IPC handler checks if permission is granted
3. If not granted, shows permission request dialog to user
4. User's decision is saved and applied
5. Rate limiting is enforced (10 calls/second per widget)
6. API call proceeds if permission granted and rate limit not exceeded

**Example from `ipc-handlers.ts`**:
```typescript
// Check permission
if (!this.permissionsManager.hasPermission(widgetId, 'systemInfo.cpu')) {
  const granted = await this.permissionsManager.requestPermission({
    widgetId,
    widgetName,
    permission: 'systemInfo.cpu',
    reason: 'This widget needs access to CPU usage information.'
  });
  
  if (!granted) {
    return { success: false, error: { type: 'PERMISSION_DENIED', message: '...' } };
  }
}

// Check rate limit
if (!this.permissionsManager.checkRateLimit(widgetId, 'system:getCPU')) {
  return { success: false, error: { type: 'RATE_LIMIT_EXCEEDED', message: '...' } };
}
```

Rate limiting is enforced on all system API calls to prevent abuse.

### Testing

Two test scripts are available:

**Basic Tests** (`test-permissions.js`)
- Permission storage and retrieval
- Permission granting and denial
- Rate limiting (10 calls per second)
- Data persistence across instances

**Enhanced Tests** (`test-permissions-enhanced.js`)
- Permission format validation
- Error throwing with proper types
- Rate limit error with throwOnExceed option
- Memory cleanup functionality
- Resource cleanup on destroy
- Edge cases and isolation

Run tests:
```bash
node test-permissions.js
node test-permissions-enhanced.js
```

## Protocol Handler

The Widget Container registers a custom `widget://` protocol for deep linking from the Marketplace.

### Protocol Registration

**Windows**: Registered using `app.setAsDefaultProtocolClient('widget')`
- Development mode: Registers with electron executable path
- Production mode: Registers normally
- Handles protocol URLs via `second-instance` event

**macOS**: Registered using `app.setAsDefaultProtocolClient('widget')`
- Handles protocol URLs via `open-url` event

### Single Instance Lock

The application enforces a single instance using `app.requestSingleInstanceLock()`:
- If another instance is running, new instances quit immediately
- Protocol URLs are forwarded to the existing instance
- Main window is focused when protocol URL is received

### Protocol URL Format

```
widget://install/{widgetId}
```

**Example**: `widget://install/clock-widget`

### Protocol Flow

1. User clicks "Install" button on Marketplace website
2. Browser opens `widget://install/{widgetId}` URL
3. Operating system launches Widget Container (or focuses existing instance)
4. Protocol handler parses URL and extracts widget ID
5. Confirmation dialog is shown to user
6. If confirmed, widget installation begins (Task 30)

### Implementation Details

**URL Parsing**
- Validates protocol is `widget://`
- Extracts action (e.g., "install") and widget ID from path
- Handles malformed URLs with error dialogs

**User Confirmation**
- Shows `dialog.showMessageBox` with Install/Cancel buttons
- Displays widget ID and installation details
- Only proceeds if user clicks "Install"

**Error Handling**
- Invalid protocol: Logs warning and returns silently
- Invalid URL format: Shows error dialog with expected format
- Unknown action: Shows error dialog listing supported actions
- Parse errors: Shows error dialog with error message

**Security Considerations**
- URL validation prevents malformed input
- User confirmation required before any action
- Error messages are user-friendly and informative

### Testing

Test the protocol handler:

1. **Windows**: Create a test HTML file with a link:
   ```html
   <a href="widget://install/test-widget">Install Test Widget</a>
   ```

2. **macOS**: Open Terminal and run:
   ```bash
   open widget://install/test-widget
   ```

3. Verify:
   - Widget Container launches or focuses
   - Confirmation dialog appears
   - Widget ID is correctly displayed
   - Canceling works as expected

### Future Enhancements (Task 30)

The protocol handler currently shows a placeholder message. Task 30 will implement:
- Downloading widget from Marketplace API
- Extracting widget files to widgets directory
- Validating widget.config.json
- Adding widget to installed widgets list
- Automatic widget creation after installation

## System Tray

The Widget Container includes system tray functionality that allows the application to run in the background.

### Features

**Tray Icon** (Requirement 10.1)
- Displays in Windows notification area or macOS menu bar
- Uses custom icon from `assets/tray-icon.png` if available
- Falls back to programmatically generated icon

**Context Menu** (Requirement 10.2)
- Right-click shows menu with "Open Manager" and "Exit" options
- Double-click opens manager window (Windows/Linux)

**Open Manager** (Requirement 10.3)
- Creates window if it doesn't exist
- Shows window if hidden
- Restores window if minimized
- Focuses window if already visible

**Exit Application** (Requirement 10.4)
- Closes all running widgets
- Saves widget states
- Cleans up resources
- Quits application completely

**Hide on Close** (Requirement 10.5)
- Closing manager window hides it instead of quitting
- Application continues running in system tray
- Widgets continue running in background
- Window can be reopened from tray menu

### Adding a Custom Tray Icon

1. Create `assets` folder in `widget-container` directory
2. Add `tray-icon.png` (recommended: 16x16 or 32x32 pixels)
3. Use simple, recognizable design at small sizes
4. Use transparent background for best results

See `docs/system-tray.md` for detailed documentation.

## Error Handling

The Widget Container implements comprehensive error handling across all IPC communication channels.

### Error Response Format

All IPC handlers return standardized responses:

**Success Response:**
```typescript
{
  success: true,
  data?: any  // Optional data payload
}
```

**Error Response:**
```typescript
{
  success: false,
  error: {
    type: WidgetErrorType,  // Error type enum
    message: string         // Error description
  }
}
```

### Error Types

The system uses the `WidgetErrorType` enum from the Widget SDK:

- `PERMISSION_DENIED` - Permission required for operation
- `RATE_LIMIT_EXCEEDED` - Too many API calls (10/second limit)
- `INVALID_CONFIG` - Invalid configuration or parameters
- `WIDGET_CRASHED` - Widget encountered an error
- `NETWORK_ERROR` - Network request failed
- `STORAGE_ERROR` - Storage operation failed

### IPC Error Handling

All IPC handlers include try-catch blocks and return standardized error responses:

```typescript
// Example from ipc-handlers.ts
try {
  const value = this.storageManager.getWidgetData(widgetId, key);
  return { success: true, data: value };
} catch (error) {
  return {
    success: false,
    error: {
      type: WidgetErrorType.STORAGE_ERROR,
      message: error instanceof Error ? error.message : String(error)
    }
  };
}
```

### Validation Examples

**Storage Operations:**
- Key must be a non-empty string
- Value must be JSON-serializable
- Returns `STORAGE_ERROR` for invalid operations

**UI Operations:**
- Dimensions must be finite numbers
- Minimum size: 100x100 pixels
- Maximum size: 2000x2000 pixels
- Returns `INVALID_CONFIG` for invalid dimensions

**System API:**
- Permission checks before access
- Rate limiting (10 calls/second per widget)
- Returns `PERMISSION_DENIED` or `RATE_LIMIT_EXCEEDED` as appropriate

### Testing

Error handling is tested in `src/main/__tests__/error-handling.test.ts`:

```bash
npm test -- error-handling.test.ts
```

Tests cover:
- Invalid parameter validation
- Error response format consistency
- Storage error handling
- UI operation validation
- Error type correctness

## Next Steps

The following components will be implemented in subsequent tasks:

1. Widget installation mechanism (Task 30)
2. Performance optimizations (Task 33)

## Documentation

### Core Documentation
- [Error Handling Guide](./docs/error-handling.md) - Comprehensive error handling documentation
- [IPC Response Format](./docs/ipc-response-format.md) - Standard IPC communication format
- [API Design Notes](./docs/api-design-notes.md) - Key API design decisions and rationale

### Feature Documentation
- [Security](./docs/security.md) - Security architecture and CSP configuration
- [Permissions API](./docs/permissions-api.md) - Permission management system
- [System Tray](./docs/system-tray.md) - System tray functionality
- [Protocol Handler](./docs/protocol-handler.md) - Custom URL protocol handling
- [Performance Optimization](./docs/performance-optimization.md) - Performance best practices

### Testing Documentation
- [Testing Guide](./docs/testing.md) - Automated testing documentation
- [Manual Testing Guide](./docs/MANUAL_TESTING_GUIDE.md) - Manual testing procedures

## License

MIT
