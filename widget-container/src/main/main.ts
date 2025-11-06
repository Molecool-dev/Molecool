import { app, BrowserWindow } from 'electron';
import { WindowController } from './window-controller';
import { StorageManager } from './storage';
import { IPCHandlers } from './ipc-handlers';
import { WidgetManager } from './widget-manager';

/**
 * Main entry point for the Molecule Widget Container
 * This is the Electron main process that manages the application lifecycle
 */

let mainWindow: BrowserWindow | null = null;
const windowController = new WindowController();
const storageManager = new StorageManager();
const widgetManager = new WidgetManager(windowController, storageManager);
const ipcHandlers = new IPCHandlers(storageManager);

// Connect widget manager to IPC handlers
ipcHandlers.setWidgetManager(widgetManager);

/**
 * Create the main manager window
 */
function createManagerWindow(): void {
  mainWindow = windowController.createManagerWindow();

  mainWindow.on('closed', () => {
    mainWindow = null;
  });
}

/**
 * Create a test widget window for demonstration
 * This is a temporary function to test the window system
 * Demonstrates position persistence by loading saved position
 */
function createTestWidget(): void {
  const path = require('path');
  
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
 * App lifecycle events
 */

// When Electron has finished initialization
app.whenReady().then(async () => {
  // Initialize IPC handlers first
  ipcHandlers.registerHandlers();
  
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
  globalShortcut.register('CommandOrControl+Shift+T', () => {
    console.log('Creating test widget...');
    createTestWidget();
  });
  
  // Ctrl+Shift+W: Test Widget Manager
  globalShortcut.register('CommandOrControl+Shift+W', () => {
    console.log('Testing Widget Manager...');
    testWidgetManager();
  });

  // On macOS, re-create window when dock icon is clicked
  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createManagerWindow();
    }
  });
});

// Quit when all windows are closed (except on macOS)
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
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
    console.log('Application shutting down...');
    
    // Now actually quit
    app.exit(0);
  }
});
