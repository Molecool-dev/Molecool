# Molecule Widget Container

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

# Build for Windows
npm run build:win

# Build for macOS
npm run build:mac
```

### Testing

#### Dragging Storage Test

A standalone test script is available to verify position persistence without running the full Electron app:

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
- Creates and manages BrowserWindow instances
- Handles widget windows and manager window creation
- Implements platform-specific glass effects and dragging

**WidgetManager**
- Manages widget lifecycle (load, create, close)
- Tracks running widget instances
- Handles state persistence and restoration
- Depends on WindowController and StorageManager

**IPCHandlers**
- Registers all IPC communication channels
- Bridges renderer process requests to main process functionality
- Has reference to StorageManager (constructor) and WidgetManager (via `setWidgetManager()`)
- Enables renderer to access widget management and storage operations

### Component Initialization

The components are initialized in `main.ts` in the following order:

1. `WindowController` - No dependencies
2. `StorageManager` - No dependencies
3. `WidgetManager` - Requires WindowController and StorageManager
4. `IPCHandlers` - Requires StorageManager, then WidgetManager is set via `setWidgetManager()`

This initialization order ensures all dependencies are available when needed while maintaining clean separation of concerns.

### Security Features

- Context Isolation enabled
- Node Integration disabled
- Sandbox mode enabled
- Content Security Policy enforced
- Limited API exposure through preload scripts

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

Widgets feature a modern glass/blur effect:
- **Windows 11**: Mica material effect
- **Windows 10**: Acrylic material effect  
- **macOS**: Vibrancy effect with 'under-window' style
- **Fallback**: CSS backdrop-filter for cross-platform compatibility

## Widget Management

### Widget Lifecycle

The Widget Manager handles the complete lifecycle of widgets:

**Loading Widgets**
- Scans the widgets directory (`userData/widgets/`) for installed widgets
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

## Next Steps

The following components will be implemented in subsequent tasks:

1. Widget Manager UI (Task 13)
2. Config validation enhancements (Task 14)
3. System API integration and permissions (Tasks 15-20)

## License

MIT
