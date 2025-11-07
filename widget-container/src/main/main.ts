import { app, BrowserWindow, dialog, Tray, Menu, nativeImage, NativeImage } from 'electron';
import * as path from 'path';
import { WindowController } from './window-controller';
import { StorageManager } from './storage';
import { IPCHandlers } from './ipc-handlers';
import { WidgetManager } from './widget-manager';
import { SecurityManager } from './security';

/**
 * Main entry point for the Molecule Widget Container
 * This is the Electron main process that manages the application lifecycle
 */

// Flag to track if app is quitting
let isQuitting = false;

let mainWindow: BrowserWindow | null = null;
let tray: Tray | null = null;
const windowController = new WindowController();
const storageManager = new StorageManager();
const securityManager = new SecurityManager();
const widgetManager = new WidgetManager(windowController, storageManager);
const ipcHandlers = new IPCHandlers(storageManager);

// Connect widget manager to IPC handlers
ipcHandlers.setWidgetManager(widgetManager);

/**
 * Validate widget ID format
 * Widget IDs should be alphanumeric with hyphens/underscores only
 */
function isValidWidgetId(widgetId: string): boolean {
  return /^[a-zA-Z0-9_-]+$/.test(widgetId) && widgetId.length > 0 && widgetId.length <= 100;
}

/**
 * Handle widget:// protocol URLs
 * Parses widget://install/{widgetId} URLs and triggers widget installation
 * Requirement: 6.5
 */
async function handleProtocolUrl(url: string): Promise<void> {
  console.log('Received protocol URL:', url);
  
  // Wait for app to be ready before showing dialogs
  if (!app.isReady()) {
    console.log('App not ready yet, waiting...');
    await app.whenReady();
  }
  
  try {
    // Parse the URL
    const urlObj = new URL(url);
    
    // Check if it's a widget:// protocol
    if (urlObj.protocol !== 'widget:') {
      console.warn('Invalid protocol:', urlObj.protocol);
      return;
    }
    
    // Extract the action and widget ID
    // Format: widget://install/{widgetId}
    // For custom protocols: host becomes action, pathname becomes /widgetId
    const fullPath = urlObj.host + urlObj.pathname;
    const pathParts = fullPath.split('/').filter(part => part.length > 0);
    
    if (pathParts.length < 2) {
      console.warn('Invalid widget URL format:', url);
      await dialog.showMessageBox({
        type: 'error',
        title: 'Invalid Widget URL',
        message: 'The widget installation URL is invalid.',
        detail: 'Expected format: widget://install/{widgetId}'
      });
      return;
    }
    
    const action = pathParts[0];
    const widgetId = pathParts[1];
    
    // Validate widget ID format
    if (!isValidWidgetId(widgetId)) {
      console.warn('Invalid widget ID format:', widgetId);
      await dialog.showMessageBox({
        type: 'error',
        title: 'Invalid Widget ID',
        message: 'The widget ID contains invalid characters.',
        detail: 'Widget IDs must be alphanumeric with hyphens or underscores only.'
      });
      return;
    }
    
    console.log(`Protocol action: ${action}, Widget ID: ${widgetId}`);
    
    // Handle different actions
    if (action === 'install') {
      await handleWidgetInstall(widgetId);
    } else {
      console.warn('Unknown protocol action:', action);
      await dialog.showMessageBox({
        type: 'error',
        title: 'Unknown Action',
        message: `The action "${action}" is not supported.`,
        detail: 'Only "install" is currently supported.'
      });
    }
  } catch (error) {
    console.error('Failed to handle protocol URL:', error);
    const message = error instanceof Error ? error.message : 'Unknown error';
    await dialog.showMessageBox({
      type: 'error',
      title: 'Protocol Handler Error',
      message: 'Failed to process widget URL.',
      detail: message
    });
  }
}

/**
 * Handle widget installation
 * Shows confirmation dialog and triggers installation
 */
async function handleWidgetInstall(widgetId: string): Promise<void> {
  // Show confirmation dialog
  const result = await dialog.showMessageBox({
    type: 'question',
    buttons: ['Install', 'Cancel'],
    defaultId: 0,
    cancelId: 1,
    title: 'Install Widget',
    message: `Do you want to install the widget "${widgetId}"?`,
    detail: 'This will download and install the widget from the Marketplace.'
  });
  
  if (result.response === 0) {
    // User clicked "Install"
    console.log(`Installing widget: ${widgetId}`);
    
    try {
      // Note: Progress dialog removed as it's not awaited and causes unused variable warning
      // In production, consider implementing a proper progress window
      
      // Install the widget
      await widgetManager.installWidget(widgetId);
      
      // Show success message
      await dialog.showMessageBox({
        type: 'info',
        title: 'Installation Complete',
        message: `Widget "${widgetId}" has been installed successfully!`,
        detail: 'You can now create an instance of this widget from the Widget Manager.'
      });
      
      console.log(`Widget ${widgetId} installed successfully`);
    } catch (error) {
      console.error('Widget installation failed:', error);
      
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      await dialog.showMessageBox({
        type: 'error',
        title: 'Installation Failed',
        message: `Failed to install widget "${widgetId}"`,
        detail: errorMessage
      });
    }
  } else {
    console.log('Widget installation cancelled by user');
  }
}

/**
 * Create the main manager window
 */
function createManagerWindow(): void {
  mainWindow = windowController.createManagerWindow();

  // Hide window instead of closing when user clicks X
  // This keeps the app running in the system tray
  mainWindow.on('close', (e) => {
    if (!isQuitting) {
      e.preventDefault();
      mainWindow?.hide();
    }
  });

  mainWindow.on('closed', () => {
    mainWindow = null;
  });
}

/**
 * Show or focus the manager window
 * If the window doesn't exist, create it
 * If it's hidden, show it
 * If it's minimized, restore it
 * If it's visible, focus it
 */
function showManagerWindow(): void {
  if (!mainWindow) {
    createManagerWindow();
  } else if (!mainWindow.isVisible()) {
    mainWindow.show();
  } else if (mainWindow.isMinimized()) {
    mainWindow.restore();
  } else {
    mainWindow.focus();
  }
}

/**
 * Create a fallback tray icon programmatically
 * Creates a simple 16x16 icon with white center and blue border
 */
function createFallbackTrayIcon(): NativeImage {
  const size = 16;
  const canvas = Buffer.alloc(size * size * 4);
  
  // Fill with a simple pattern (white square with blue border)
  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      const idx = (y * size + x) * 4;
      // Border pixels (blue)
      if (x === 0 || x === size - 1 || y === 0 || y === size - 1) {
        canvas[idx] = 59;      // R
        canvas[idx + 1] = 130; // G
        canvas[idx + 2] = 246; // B
        canvas[idx + 3] = 255; // A
      } else {
        // Inner pixels (white)
        canvas[idx] = 255;     // R
        canvas[idx + 1] = 255; // G
        canvas[idx + 2] = 255; // B
        canvas[idx + 3] = 255; // A
      }
    }
  }
  
  return nativeImage.createFromBuffer(canvas, {
    width: size,
    height: size
  });
}

/**
 * Create system tray icon and menu
 * Requirements: 10.1, 10.2, 10.3
 */
function createTray(): void {
  // Try to load icon from assets folder
  const iconPath = path.join(__dirname, '../../assets/tray-icon.png');
  let trayIcon: NativeImage;
  
  try {
    const loadedIcon = nativeImage.createFromPath(iconPath);
    if (!loadedIcon.isEmpty()) {
      trayIcon = loadedIcon;
    } else {
      trayIcon = createFallbackTrayIcon();
    }
  } catch (error) {
    console.error('Failed to load tray icon, using fallback:', error);
    trayIcon = createFallbackTrayIcon();
  }
  
  tray = new Tray(trayIcon);
  
  // Set tooltip
  tray.setToolTip('Molecule Widget Platform');
  
  // Create context menu
  const contextMenu = Menu.buildFromTemplate([
    {
      label: 'Open Manager',
      click: () => {
        showManagerWindow();
      }
    },
    {
      type: 'separator'
    },
    {
      label: 'Exit',
      click: () => {
        quitApplication();
      }
    }
  ]);
  
  // Set context menu
  tray.setContextMenu(contextMenu);
  
  // Double-click to open manager (Windows/Linux)
  tray.on('double-click', () => {
    showManagerWindow();
  });
  
  console.log('System tray created');
}

/**
 * Quit the application
 * Closes all widgets and exits
 * Requirements: 10.4, 10.5
 */
function quitApplication(): void {
  console.log('Quitting application...');
  
  // Set flag to allow window closing
  isQuitting = true;
  
  // Close all widget windows
  const runningWidgets = widgetManager.getRunningWidgets();
  console.log(`Closing ${runningWidgets.length} running widgets...`);
  
  for (const widget of runningWidgets) {
    try {
      widgetManager.closeWidget(widget.instanceId);
    } catch (error) {
      console.error(`Failed to close widget ${widget.instanceId}:`, error);
    }
  }
  
  // Close manager window
  if (mainWindow) {
    mainWindow.close();
  }
  
  // Quit the app
  app.quit();
}

/**
 * Create a test widget window for demonstration
 * This is a temporary function to test the window system
 * Demonstrates position persistence by loading saved position
 */
function createTestWidget(): void {
  // Try to load saved position for test widget
  const widgetId = 'test-widget';
  const savedPosition = storageManager.getSavedPosition(widgetId);
  const savedSize = storageManager.getSavedSize(widgetId);
  
  // Use saved position/size if available, otherwise use defaults
  const windowOptions = {
    width: savedSize?.width || 300,
    height: savedSize?.height || 250,
    x: savedPosition?.x,
    y: savedPosition?.y,
    transparent: true,
    frame: false,
    alwaysOnTop: true
  };
  
  console.log('Creating test widget with options:', windowOptions);
  if (savedPosition) {
    console.log(`Restoring widget to saved position: (${savedPosition.x}, ${savedPosition.y})`);
  }
  
  const testWidget = windowController.createWidgetWindow(
    windowOptions,
    path.join(__dirname, '../preload/widget-preload.js')
  );

  testWidget.loadFile(path.join(__dirname, '../renderer/test-widget.html'));

  testWidget.on('closed', () => {
    console.log('Test widget closed');
  });
}

/**
 * Test the Widget Manager by loading and creating a widget
 */
async function testWidgetManager(): Promise<void> {
  try {
    console.log('Testing Widget Manager...');
    
    // Load installed widgets
    const installedWidgets = await widgetManager.loadInstalledWidgets();
    console.log(`Found ${installedWidgets.length} installed widgets:`, installedWidgets.map(w => w.displayName));
    
    // If we have any widgets, create the first one
    if (installedWidgets.length > 0) {
      const widgetId = installedWidgets[0].id;
      console.log(`Creating widget: ${widgetId}`);
      const instanceId = await widgetManager.createWidget(widgetId);
      console.log(`Widget created with instance ID: ${instanceId}`);
      
      // Log running widgets
      const runningWidgets = widgetManager.getRunningWidgets();
      console.log(`Running widgets: ${runningWidgets.length}`);
    } else {
      console.log('No widgets found. Please install a widget first.');
      console.log(`Widgets directory: ${widgetManager.getWidgetsDirectory()}`);
    }
  } catch (error) {
    console.error('Failed to test widget manager:', error);
  }
}

/**
 * Protocol registration and handling
 * Register widget:// protocol for deep linking from Marketplace
 * Requirements: 6.5
 */

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

// Handle protocol on macOS (open-url event)
app.on('open-url', (event, url) => {
  event.preventDefault();
  console.log('macOS open-url event:', url);
  handleProtocolUrl(url);
});

// Handle protocol on Windows (second-instance event)
// Windows opens a second instance when a protocol URL is clicked
const gotTheLock = app.requestSingleInstanceLock();

if (!gotTheLock) {
  // Another instance is already running, quit this one
  console.log('Another instance is already running, quitting...');
  app.quit();
} else {
  // This is the first instance, handle second-instance events
  app.on('second-instance', (_event, commandLine) => {
    console.log('Windows second-instance event');
    console.log('Command line:', commandLine);
    
    // Protocol URL is passed as a command line argument on Windows
    // Find the widget:// URL in the command line arguments
    const protocolUrl = commandLine.find(arg => arg.startsWith('widget://'));
    
    if (protocolUrl) {
      console.log('Found protocol URL in command line:', protocolUrl);
      handleProtocolUrl(protocolUrl);
    }
    
    // Focus the main window if it exists
    if (mainWindow) {
      if (mainWindow.isMinimized()) {
        mainWindow.restore();
      }
      mainWindow.focus();
    }
  });
}

/**
 * App lifecycle events
 */

// When Electron has finished initialization
app.whenReady().then(async () => {
  // Initialize security manager first (CSP and network filtering)
  securityManager.initialize();
  
  // Connect security manager to widget manager for dynamic CSP
  widgetManager.setSecurityManager(securityManager);
  
  // Initialize IPC handlers
  ipcHandlers.registerHandlers();
  
  // Create system tray
  createTray();
  
  createManagerWindow();

  // Restore widgets from previous session
  try {
    console.log('Restoring widgets from previous session...');
    await widgetManager.restoreWidgets();
  } catch (error) {
    console.error('Failed to restore widgets:', error);
  }

  // Register global shortcuts
  const { globalShortcut } = require('electron');
  
  // Ctrl+Shift+T: Create test widget (old method)
  const shortcut1 = globalShortcut.register('CommandOrControl+Shift+T', () => {
    console.log('Creating test widget...');
    createTestWidget();
  });
  
  if (!shortcut1) {
    console.warn('Failed to register CommandOrControl+Shift+T shortcut');
  }
  
  // Ctrl+Shift+W: Test Widget Manager
  const shortcut2 = globalShortcut.register('CommandOrControl+Shift+W', () => {
    console.log('Testing Widget Manager...');
    testWidgetManager();
  });
  
  if (!shortcut2) {
    console.warn('Failed to register CommandOrControl+Shift+W shortcut');
  }

  // On macOS, re-create window when dock icon is clicked
  app.on('activate', () => {
    showManagerWindow();
  });
});

// Don't quit when all windows are closed - keep running in tray
// This is the key change for system tray behavior
app.on('window-all-closed', () => {
  // Don't quit the app, just hide all windows
  // The app will continue running in the system tray
  console.log('All windows closed, app continues in system tray');
});

// Handle app quit
app.on('will-quit', async (event) => {
  // Prevent immediate quit to allow state saving
  event.preventDefault();
  
  try {
    // Save all running widget states
    console.log('Saving widget states before quit...');
    const runningWidgets = widgetManager.getRunningWidgets();
    
    for (const widget of runningWidgets) {
      try {
        await widgetManager.saveWidgetState(widget.instanceId);
      } catch (error) {
        console.error(`Failed to save state for widget ${widget.instanceId}:`, error);
      }
    }
    
    console.log(`Saved ${runningWidgets.length} widget states`);
  } catch (error) {
    console.error('Error saving widget states:', error);
  } finally {
    // Cleanup resources
    const { globalShortcut } = require('electron');
    globalShortcut.unregisterAll();
    
    // Cleanup IPC handlers (permissions manager cleanup)
    ipcHandlers.destroy();
    
    // Cleanup security manager
    securityManager.destroy();
    
    // Destroy tray icon
    if (tray) {
      tray.destroy();
      tray = null;
    }
    
    console.log('Application shutting down...');
    
    // Now actually quit
    app.exit(0);
  }
});
