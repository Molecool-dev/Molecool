/**
 * Window Controller Tests
 * Tests window creation, glass effects, dragging, and resource cleanup
 */

import { BrowserWindow } from 'electron';
import { WindowController, WindowType, WindowOptions } from '../window-controller';

// Mock Electron BrowserWindow
jest.mock('electron', () => ({
  BrowserWindow: jest.fn().mockImplementation(() => ({
    setBackgroundColor: jest.fn(),
    setOpacity: jest.fn(),
    setBackgroundMaterial: jest.fn(),
    setVibrancy: jest.fn(),
    loadFile: jest.fn(),
    getPosition: jest.fn().mockReturnValue([100, 100]),
    isDestroyed: jest.fn().mockReturnValue(false),
    webContents: {
      openDevTools: jest.fn(),
      insertCSS: jest.fn(),
      executeJavaScript: jest.fn(),
      send: jest.fn(),
      on: jest.fn()
    },
    on: jest.fn(),
    once: jest.fn(),
    removeListener: jest.fn()
  }))
}));

describe('WindowController', () => {
  let controller: WindowController;
  let mockWindow: any;

  beforeEach(() => {
    controller = new WindowController();
    jest.clearAllMocks();
    
    // Reset platform
    Object.defineProperty(process, 'platform', {
      value: 'win32',
      writable: true
    });
  });

  describe('createWidgetWindow', () => {
    it('should create window with correct options', () => {
      const options: WindowOptions = {
        width: 300,
        height: 200,
        x: 100,
        y: 100,
        transparent: true,
        frame: false,
        alwaysOnTop: true
      };

      const preloadPath = '/path/to/preload.js';
      const window = controller.createWidgetWindow(options, preloadPath);

      expect(BrowserWindow).toHaveBeenCalledWith(
        expect.objectContaining({
          width: 300,
          height: 200,
          x: 100,
          y: 100,
          transparent: true,
          frame: false,
          alwaysOnTop: true,
          resizable: false,
          skipTaskbar: true,
          hasShadow: true,
          webPreferences: expect.objectContaining({
            nodeIntegration: false,
            contextIsolation: true,
            sandbox: true,
            preload: preloadPath
          })
        })
      );
    });

    it('should mark window as widget type', () => {
      const options: WindowOptions = {
        width: 300,
        height: 200,
        transparent: true,
        frame: false,
        alwaysOnTop: true
      };

      const window = controller.createWidgetWindow(options, '/preload.js');
      
      expect(WindowController.isWidgetWindow(window)).toBe(true);
      expect(WindowController.isManagerWindow(window)).toBe(false);
    });

    it('should register cleanup on window close', () => {
      const options: WindowOptions = {
        width: 300,
        height: 200,
        transparent: true,
        frame: false,
        alwaysOnTop: true
      };

      const window = controller.createWidgetWindow(options, '/preload.js');
      
      expect(window.once).toHaveBeenCalledWith('closed', expect.any(Function));
    });
  });

  describe('createManagerWindow', () => {
    it('should create manager window with correct settings', () => {
      const window = controller.createManagerWindow();

      expect(BrowserWindow).toHaveBeenCalledWith(
        expect.objectContaining({
          width: 800,
          height: 600,
          minWidth: 600,
          minHeight: 400,
          transparent: false,
          frame: true,
          alwaysOnTop: false,
          webPreferences: expect.objectContaining({
            nodeIntegration: false,
            contextIsolation: true,
            sandbox: true
          })
        })
      );
    });

    it('should mark window as manager type', () => {
      const window = controller.createManagerWindow();
      
      expect(WindowController.isManagerWindow(window)).toBe(true);
      expect(WindowController.isWidgetWindow(window)).toBe(false);
    });

    it('should load manager HTML', () => {
      const window = controller.createManagerWindow();
      
      expect(window.loadFile).toHaveBeenCalledWith(
        expect.stringContaining('manager.html')
      );
    });

    it('should open DevTools in development mode', () => {
      const originalEnv = process.env.NODE_ENV;
      process.env.NODE_ENV = 'development';

      const window = controller.createManagerWindow();
      
      expect(window.webContents.openDevTools).toHaveBeenCalled();

      process.env.NODE_ENV = originalEnv;
    });

    it('should not open DevTools in production mode', () => {
      const originalEnv = process.env.NODE_ENV;
      process.env.NODE_ENV = 'production';

      const window = controller.createManagerWindow();
      
      expect(window.webContents.openDevTools).not.toHaveBeenCalled();

      process.env.NODE_ENV = originalEnv;
    });
  });

  describe('applyGlassEffect', () => {
    beforeEach(() => {
      mockWindow = new BrowserWindow();
    });

    it('should set transparent background', () => {
      controller.applyGlassEffect(mockWindow);
      
      expect(mockWindow.setBackgroundColor).toHaveBeenCalledWith('#00000000');
    });

    it('should start with opacity 0', () => {
      controller.applyGlassEffect(mockWindow);
      
      expect(mockWindow.setOpacity).toHaveBeenCalledWith(0);
    });

    it('should apply mica effect on Windows 11', () => {
      Object.defineProperty(process, 'platform', { value: 'win32' });
      
      controller.applyGlassEffect(mockWindow);
      
      expect(mockWindow.setBackgroundMaterial).toHaveBeenCalledWith('mica');
    });

    it('should fallback to acrylic if mica fails', () => {
      Object.defineProperty(process, 'platform', { value: 'win32' });
      mockWindow.setBackgroundMaterial.mockImplementationOnce(() => {
        throw new Error('Mica not supported');
      });
      
      controller.applyGlassEffect(mockWindow);
      
      expect(mockWindow.setBackgroundMaterial).toHaveBeenCalledWith('acrylic');
    });

    it('should apply vibrancy on macOS', () => {
      Object.defineProperty(process, 'platform', { value: 'darwin' });
      
      controller.applyGlassEffect(mockWindow);
      
      expect(mockWindow.setVibrancy).toHaveBeenCalledWith('under-window');
    });

    it('should inject CSS on did-finish-load', () => {
      controller.applyGlassEffect(mockWindow);
      
      expect(mockWindow.webContents.on).toHaveBeenCalledWith(
        'did-finish-load',
        expect.any(Function)
      );
    });
  });

  describe('fadeOutWindow', () => {
    beforeEach(() => {
      mockWindow = new BrowserWindow();
      jest.useFakeTimers();
    });

    afterEach(() => {
      jest.useRealTimers();
    });

    it('should fade out window smoothly', async () => {
      const fadePromise = controller.fadeOutWindow(mockWindow);
      
      // Fast-forward through animation
      jest.advanceTimersByTime(250);
      
      await fadePromise;
      
      expect(mockWindow.setOpacity).toHaveBeenCalled();
    });

    it('should handle destroyed window gracefully', async () => {
      mockWindow.isDestroyed.mockReturnValue(true);
      
      const fadePromise = controller.fadeOutWindow(mockWindow);
      
      jest.advanceTimersByTime(250);
      
      await expect(fadePromise).resolves.toBeUndefined();
    });

    it('should handle setOpacity errors', async () => {
      mockWindow.setOpacity.mockImplementation(() => {
        throw new Error('Window destroyed');
      });
      
      const fadePromise = controller.fadeOutWindow(mockWindow);
      
      jest.advanceTimersByTime(250);
      
      await expect(fadePromise).resolves.toBeUndefined();
    });
  });

  describe('enableDragging', () => {
    beforeEach(() => {
      mockWindow = new BrowserWindow();
      jest.useFakeTimers();
    });

    afterEach(() => {
      jest.useRealTimers();
    });

    it('should inject dragging script on did-finish-load', () => {
      controller.enableDragging(mockWindow);
      
      expect(mockWindow.webContents.on).toHaveBeenCalledWith(
        'did-finish-load',
        expect.any(Function)
      );
    });

    it('should register move event listener', () => {
      controller.enableDragging(mockWindow);
      
      expect(mockWindow.on).toHaveBeenCalledWith('move', expect.any(Function));
    });

    it('should register cleanup on window close', () => {
      controller.enableDragging(mockWindow);
      
      expect(mockWindow.once).toHaveBeenCalledWith('closed', expect.any(Function));
    });

    it('should debounce position saves', () => {
      controller.enableDragging(mockWindow);
      
      // Get the move handler
      const moveHandler = mockWindow.on.mock.calls.find(
        (call: any) => call[0] === 'move'
      )?.[1];
      
      if (moveHandler) {
        // Trigger multiple moves
        moveHandler();
        moveHandler();
        moveHandler();
        
        // Should not send immediately
        expect(mockWindow.webContents.send).not.toHaveBeenCalled();
        
        // Fast-forward past debounce
        jest.advanceTimersByTime(500);
        
        // Should send once
        expect(mockWindow.webContents.send).toHaveBeenCalledTimes(1);
        expect(mockWindow.webContents.send).toHaveBeenCalledWith(
          'window-position-changed',
          { x: 100, y: 100 }
        );
      }
    });

    it('should handle destroyed window in move handler', () => {
      controller.enableDragging(mockWindow);
      
      const moveHandler = mockWindow.on.mock.calls.find(
        (call: any) => call[0] === 'move'
      )?.[1];
      
      if (moveHandler) {
        moveHandler();
        
        // Mark window as destroyed
        mockWindow.isDestroyed.mockReturnValue(true);
        
        // Fast-forward
        jest.advanceTimersByTime(500);
        
        // Should not crash
        expect(mockWindow.webContents.send).not.toHaveBeenCalled();
      }
    });

    it('should cleanup timers on window close', () => {
      controller.enableDragging(mockWindow);
      
      const moveHandler = mockWindow.on.mock.calls.find(
        (call: any) => call[0] === 'move'
      )?.[1];
      const closeHandler = mockWindow.once.mock.calls.find(
        (call: any) => call[0] === 'closed'
      )?.[1];
      
      if (moveHandler && closeHandler) {
        // Trigger move
        moveHandler();
        
        // Close window
        closeHandler();
        
        // Fast-forward
        jest.advanceTimersByTime(500);
        
        // Should not send after close
        expect(mockWindow.webContents.send).not.toHaveBeenCalled();
      }
    });
  });

  describe('Window Type Checks', () => {
    it('should correctly identify widget windows', () => {
      const options: WindowOptions = {
        width: 300,
        height: 200,
        transparent: true,
        frame: false,
        alwaysOnTop: true
      };

      const window = controller.createWidgetWindow(options, '/preload.js');
      
      expect(WindowController.isWidgetWindow(window)).toBe(true);
      expect(WindowController.isManagerWindow(window)).toBe(false);
    });

    it('should correctly identify manager windows', () => {
      const window = controller.createManagerWindow();
      
      expect(WindowController.isManagerWindow(window)).toBe(true);
      expect(WindowController.isWidgetWindow(window)).toBe(false);
    });

    it('should return false for unmarked windows', () => {
      const window = new BrowserWindow();
      
      expect(WindowController.isWidgetWindow(window)).toBe(false);
      expect(WindowController.isManagerWindow(window)).toBe(false);
    });
  });

  describe('Resource Cleanup', () => {
    beforeEach(() => {
      jest.useFakeTimers();
    });

    afterEach(() => {
      jest.useRealTimers();
    });

    it('should cleanup all timers on window close', () => {
      const options: WindowOptions = {
        width: 300,
        height: 200,
        transparent: true,
        frame: false,
        alwaysOnTop: true
      };

      const window = controller.createWidgetWindow(options, '/preload.js');
      
      // Get close handler
      const closeHandler = (window.once as any).mock.calls.find(
        (call: any) => call[0] === 'closed'
      )?.[1];
      
      expect(closeHandler).toBeDefined();
      
      // Should not throw when called
      expect(() => closeHandler()).not.toThrow();
    });
  });
});
