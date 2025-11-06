import { BrowserWindow } from 'electron';
import * as path from 'path';

/**
 * Window Controller
 * Manages BrowserWindow creation and configuration
 */

export interface WindowOptions {
  width: number;
  height: number;
  x?: number;
  y?: number;
  transparent: boolean;
  frame: boolean;
  alwaysOnTop: boolean;
}

// Window type metadata key
const WINDOW_TYPE_KEY = 'moleculeWindowType';

export enum WindowType {
  WIDGET = 'widget',
  MANAGER = 'manager'
}

export class WindowController {
  /**
   * Create a widget window with security settings and glass effect
   */
  createWidgetWindow(options: WindowOptions, preloadPath: string): BrowserWindow {
    const window = new BrowserWindow({
      width: options.width,
      height: options.height,
      x: options.x,
      y: options.y,
      transparent: options.transparent,
      frame: options.frame,
      alwaysOnTop: options.alwaysOnTop,
      resizable: false,
      skipTaskbar: true,
      hasShadow: true,
      webPreferences: {
        // Security settings
        nodeIntegration: false,
        contextIsolation: true,
        sandbox: true,
        preload: preloadPath,
        // Performance settings
        offscreen: false,
        v8CacheOptions: 'code',
        webgl: false,
        plugins: false
      }
    });

    // Mark as widget window
    (window as any)[WINDOW_TYPE_KEY] = WindowType.WIDGET;

    // Apply glass effect
    this.applyGlassEffect(window);

    // Enable dragging
    this.enableDragging(window);

    return window;
  }

  /**
   * Check if a window is a manager window
   */
  static isManagerWindow(window: BrowserWindow): boolean {
    return (window as any)[WINDOW_TYPE_KEY] === WindowType.MANAGER;
  }

  /**
   * Check if a window is a widget window
   */
  static isWidgetWindow(window: BrowserWindow): boolean {
    return (window as any)[WINDOW_TYPE_KEY] === WindowType.WIDGET;
  }

  /**
   * Create the manager window
   */
  createManagerWindow(): BrowserWindow {
    const preloadPath = path.join(__dirname, '../preload/manager-preload.js');
    
    const window = new BrowserWindow({
      width: 800,
      height: 600,
      minWidth: 600,
      minHeight: 400,
      transparent: false,
      frame: true,
      alwaysOnTop: false,
      webPreferences: {
        // Security settings
        nodeIntegration: false,
        contextIsolation: true,
        sandbox: true,
        preload: preloadPath,
        // Performance settings
        v8CacheOptions: 'code'
      }
    });

    // Mark as manager window
    (window as any)[WINDOW_TYPE_KEY] = WindowType.MANAGER;

    // Load the manager UI
    window.loadFile(path.join(__dirname, '../renderer/manager.html'));

    // Open DevTools in development
    if (process.env.NODE_ENV === 'development') {
      window.webContents.openDevTools();
    }

    return window;
  }

  /**
   * Apply glass effect to window
   * Sets the window background to transparent with blur effect
   */
  applyGlassEffect(window: BrowserWindow): void {
    // Set background color to transparent
    window.setBackgroundColor('#00000000');

    // On Windows, enable acrylic/mica effect if available
    if (process.platform === 'win32') {
      try {
        // Try to set Windows 11 mica effect
        window.setBackgroundMaterial('mica');
      } catch (error) {
        // Fallback to acrylic for Windows 10
        try {
          window.setBackgroundMaterial('acrylic');
        } catch (fallbackError) {
          // If neither works, just use transparent background
          console.log('Glass effect not available on this Windows version');
        }
      }
    }

    // On macOS, enable vibrancy effect
    if (process.platform === 'darwin') {
      window.setVibrancy('under-window');
    }

    // Inject CSS for glass effect (cross-platform fallback)
    window.webContents.on('did-finish-load', () => {
      window.webContents.insertCSS(`
        body {
          background: rgba(255, 255, 255, 0.1) !important;
          backdrop-filter: blur(10px) !important;
          -webkit-backdrop-filter: blur(10px) !important;
        }
        
        .widget-container {
          background: rgba(255, 255, 255, 0.1);
          backdrop-filter: blur(10px);
          -webkit-backdrop-filter: blur(10px);
          border-radius: 12px;
          border: 1px solid rgba(255, 255, 255, 0.2);
          box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);
          padding: 16px;
        }
      `);
    });
  }

  /**
   * Enable window dragging
   * Allows the widget window to be dragged by clicking anywhere
   * Automatically saves position to storage when dragging stops
   */
  enableDragging(window: BrowserWindow): void {
    // Track dragging timeout for debouncing position saves
    let dragTimeout: NodeJS.Timeout | null = null;

    // Listen for mouse events from the renderer
    window.webContents.on('did-finish-load', () => {
      // Inject dragging script into the renderer process
      window.webContents.executeJavaScript(`
        (function() {
          let isDragging = false;
          let startX = 0;
          let startY = 0;
          let initialWindowX = 0;
          let initialWindowY = 0;

          document.addEventListener('mousedown', async (e) => {
            // Only drag if not clicking on interactive elements
            if (e.target.tagName !== 'BUTTON' && 
                e.target.tagName !== 'INPUT' && 
                e.target.tagName !== 'SELECT' &&
                e.target.tagName !== 'TEXTAREA' &&
                e.target.tagName !== 'A' &&
                !e.target.closest('button') &&
                !e.target.closest('input') &&
                !e.target.closest('select') &&
                !e.target.closest('textarea') &&
                !e.target.closest('a')) {
              
              isDragging = true;
              startX = e.screenX;
              startY = e.screenY;
              
              // Get initial window position
              try {
                const bounds = await window.widgetAPI.getCurrentBounds();
                initialWindowX = bounds.x;
                initialWindowY = bounds.y;
              } catch (error) {
                console.error('Failed to get window bounds:', error);
              }
              
              document.body.style.cursor = 'move';
              document.body.style.userSelect = 'none';
            }
          });

          document.addEventListener('mousemove', async (e) => {
            if (isDragging) {
              const deltaX = e.screenX - startX;
              const deltaY = e.screenY - startY;
              
              const newX = initialWindowX + deltaX;
              const newY = initialWindowY + deltaY;
              
              try {
                if (window.widgetAPI && window.widgetAPI.ui) {
                  await window.widgetAPI.ui.setPosition(newX, newY);
                }
              } catch (error) {
                console.error('Failed to set position:', error);
              }
            }
          });

          document.addEventListener('mouseup', async () => {
            if (isDragging) {
              isDragging = false;
              document.body.style.cursor = 'default';
              document.body.style.userSelect = '';
              
              // Save position to storage after dragging stops
              try {
                if (window.widgetAPI && window.widgetAPI.ui) {
                  await window.widgetAPI.ui.savePosition();
                  console.log('Widget position saved to storage');
                }
              } catch (error) {
                console.error('Failed to save position:', error);
              }
            }
          });

          // Prevent text selection during drag
          document.addEventListener('selectstart', (e) => {
            if (isDragging) {
              e.preventDefault();
            }
          });

          // Handle drag leaving the window
          document.addEventListener('mouseleave', () => {
            if (isDragging) {
              isDragging = false;
              document.body.style.cursor = 'default';
              document.body.style.userSelect = '';
            }
          });
        })();
      `);
    });

    // Listen for window move events
    // Debounce position saves to avoid excessive storage writes
    window.on('move', () => {
      // Clear existing timeout
      if (dragTimeout) {
        clearTimeout(dragTimeout);
      }

      // Set new timeout to save position after dragging stops
      dragTimeout = setTimeout(() => {
        const [x, y] = window.getPosition();
        
        // Emit event that can be caught by widget manager to save state
        window.webContents.send('window-position-changed', { x, y });
        
        console.log(`Widget window moved to position: (${x}, ${y})`);
      }, 500); // Save 500ms after last move event
    });

    // Clean up timeout when window is closed
    window.on('closed', () => {
      if (dragTimeout) {
        clearTimeout(dragTimeout);
      }
    });
  }
}
