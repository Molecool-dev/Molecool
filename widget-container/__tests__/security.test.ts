/**
 * Tests for SecurityManager
 * Requirements: 2.3, 2.5
 */

import { SecurityManager } from '../src/main/security';
import { WidgetConfig, PermissionSet } from '../src/types';

// Mock Electron session
const mockSession = {
  defaultSession: {
    webRequest: {
      onHeadersReceived: jest.fn(),
      onBeforeRequest: jest.fn()
    }
  }
};

jest.mock('electron', () => ({
  session: mockSession
}));

describe('SecurityManager', () => {
  let securityManager: SecurityManager;

  beforeEach(() => {
    securityManager = new SecurityManager();
    jest.clearAllMocks();
  });

  afterEach(() => {
    securityManager.destroy();
  });

  describe('initialize', () => {
    it('should initialize security policies', () => {
      securityManager.initialize();

      expect(mockSession.defaultSession.webRequest.onHeadersReceived).toHaveBeenCalledTimes(1);
      expect(mockSession.defaultSession.webRequest.onBeforeRequest).toHaveBeenCalledTimes(1);
    });

    it('should not initialize twice', () => {
      securityManager.initialize();
      securityManager.initialize();

      // Should only be called once
      expect(mockSession.defaultSession.webRequest.onHeadersReceived).toHaveBeenCalledTimes(1);
      expect(mockSession.defaultSession.webRequest.onBeforeRequest).toHaveBeenCalledTimes(1);
    });
  });

  describe('registerWidget', () => {
    it('should register widget configuration', () => {
      const config: WidgetConfig = createMockConfig('test-widget', ['https://api.example.com']);

      securityManager.registerWidget('test-widget', config);

      // Verify by checking if widget is registered (internal state)
      expect(() => securityManager.registerWidget('test-widget', config)).not.toThrow();
    });

    it('should allow multiple widgets to be registered', () => {
      const config1 = createMockConfig('widget-1', ['https://api1.example.com']);
      const config2 = createMockConfig('widget-2', ['https://api2.example.com']);

      securityManager.registerWidget('widget-1', config1);
      securityManager.registerWidget('widget-2', config2);

      expect(() => securityManager.unregisterWidget('widget-1')).not.toThrow();
      expect(() => securityManager.unregisterWidget('widget-2')).not.toThrow();
    });
  });

  describe('unregisterWidget', () => {
    it('should unregister widget configuration', () => {
      const config = createMockConfig('test-widget', ['https://api.example.com']);

      securityManager.registerWidget('test-widget', config);
      securityManager.unregisterWidget('test-widget');

      // Should not throw
      expect(() => securityManager.unregisterWidget('test-widget')).not.toThrow();
    });
  });

  describe('domain validation', () => {
    it('should normalize domains without protocol', () => {
      const config = createMockConfig('test-widget', ['api.example.com']);
      securityManager.initialize();
      securityManager.registerWidget('test-widget', config);

      // Get the CSP callback
      const cspCallback = mockSession.defaultSession.webRequest.onHeadersReceived.mock.calls[0][0];
      const mockDetails = { responseHeaders: {} };
      let capturedCSP = '';

      cspCallback(mockDetails, (response: any) => {
        capturedCSP = response.responseHeaders['Content-Security-Policy'][0];
      });

      expect(capturedCSP).toContain('https://api.example.com');
    });

    it('should reject HTTP domains', () => {
      const config = createMockConfig('test-widget', ['http://insecure.com']);
      securityManager.initialize();
      securityManager.registerWidget('test-widget', config);

      const cspCallback = mockSession.defaultSession.webRequest.onHeadersReceived.mock.calls[0][0];
      const mockDetails = { responseHeaders: {} };
      let capturedCSP = '';

      cspCallback(mockDetails, (response: any) => {
        capturedCSP = response.responseHeaders['Content-Security-Policy'][0];
      });

      expect(capturedCSP).not.toContain('http://insecure.com');
    });

    it('should reject wildcard domains', () => {
      const config = createMockConfig('test-widget', ['*.example.com']);
      securityManager.initialize();
      securityManager.registerWidget('test-widget', config);

      const cspCallback = mockSession.defaultSession.webRequest.onHeadersReceived.mock.calls[0][0];
      const mockDetails = { responseHeaders: {} };
      let capturedCSP = '';

      cspCallback(mockDetails, (response: any) => {
        capturedCSP = response.responseHeaders['Content-Security-Policy'][0];
      });

      expect(capturedCSP).not.toContain('*.example.com');
    });

    it('should reject XSS patterns', () => {
      const config = createMockConfig('test-widget', ['<script>alert(1)</script>']);
      securityManager.initialize();
      securityManager.registerWidget('test-widget', config);

      const cspCallback = mockSession.defaultSession.webRequest.onHeadersReceived.mock.calls[0][0];
      const mockDetails = { responseHeaders: {} };
      let capturedCSP = '';

      cspCallback(mockDetails, (response: any) => {
        capturedCSP = response.responseHeaders['Content-Security-Policy'][0];
      });

      expect(capturedCSP).not.toContain('<script>');
    });

    it('should handle empty domains', () => {
      const config = createMockConfig('test-widget', ['', '  ']);
      securityManager.initialize();
      securityManager.registerWidget('test-widget', config);

      const cspCallback = mockSession.defaultSession.webRequest.onHeadersReceived.mock.calls[0][0];
      const mockDetails = { responseHeaders: {} };

      expect(() => {
        cspCallback(mockDetails, () => {});
      }).not.toThrow();
    });
  });

  describe('CSP generation', () => {
    it('should generate strict CSP by default', () => {
      securityManager.initialize();

      const cspCallback = mockSession.defaultSession.webRequest.onHeadersReceived.mock.calls[0][0];
      const mockDetails = { responseHeaders: {} };
      let capturedCSP = '';

      cspCallback(mockDetails, (response: any) => {
        capturedCSP = response.responseHeaders['Content-Security-Policy'][0];
      });

      expect(capturedCSP).toContain("default-src 'none'");
      expect(capturedCSP).toContain("script-src 'self'");
      expect(capturedCSP).toContain("style-src 'self' 'unsafe-inline'");
    });

    it('should include allowed domains in CSP', () => {
      const config = createMockConfig('test-widget', ['https://api.example.com']);
      securityManager.initialize();
      securityManager.registerWidget('test-widget', config);

      const cspCallback = mockSession.defaultSession.webRequest.onHeadersReceived.mock.calls[0][0];
      const mockDetails = { responseHeaders: {} };
      let capturedCSP = '';

      cspCallback(mockDetails, (response: any) => {
        capturedCSP = response.responseHeaders['Content-Security-Policy'][0];
      });

      expect(capturedCSP).toContain('https://api.example.com');
      expect(capturedCSP).toContain("connect-src 'self' https://api.example.com");
    });

    it('should handle CSP errors gracefully', () => {
      securityManager.initialize();

      const cspCallback = mockSession.defaultSession.webRequest.onHeadersReceived.mock.calls[0][0];
      const mockDetails = { responseHeaders: null }; // Invalid details
      let capturedCSP = '';

      expect(() => {
        cspCallback(mockDetails, (response: any) => {
          capturedCSP = response.responseHeaders['Content-Security-Policy'][0];
        });
      }).not.toThrow();

      // Should fallback to strict CSP
      expect(capturedCSP).toContain("default-src 'none'");
    });
  });

  describe('network filtering', () => {
    it('should allow HTTPS requests', () => {
      securityManager.initialize();

      const filterCallback = mockSession.defaultSession.webRequest.onBeforeRequest.mock.calls[0][1];
      const mockDetails = { url: 'https://api.example.com/data' };
      let wasCancelled = false;

      filterCallback(mockDetails, (response: any) => {
        wasCancelled = response.cancel;
      });

      expect(wasCancelled).toBe(false);
    });

    it('should block HTTP requests', () => {
      securityManager.initialize();

      const filterCallback = mockSession.defaultSession.webRequest.onBeforeRequest.mock.calls[0][1];
      const mockDetails = { url: 'http://insecure.com/data' };
      let wasCancelled = false;

      filterCallback(mockDetails, (response: any) => {
        wasCancelled = response.cancel;
      });

      expect(wasCancelled).toBe(true);
    });

    it('should allow localhost HTTP for development', () => {
      securityManager.initialize();

      const filterCallback = mockSession.defaultSession.webRequest.onBeforeRequest.mock.calls[0][1];
      const mockDetails = { url: 'http://localhost:3000' };
      let wasCancelled = false;

      filterCallback(mockDetails, (response: any) => {
        wasCancelled = response.cancel;
      });

      expect(wasCancelled).toBe(false);
    });

    it('should allow file:// protocol', () => {
      securityManager.initialize();

      const filterCallback = mockSession.defaultSession.webRequest.onBeforeRequest.mock.calls[0][1];
      const mockDetails = { url: 'file:///path/to/widget.html' };
      let wasCancelled = false;

      filterCallback(mockDetails, (response: any) => {
        wasCancelled = response.cancel;
      });

      expect(wasCancelled).toBe(false);
    });

    it('should allow data: URLs', () => {
      securityManager.initialize();

      const filterCallback = mockSession.defaultSession.webRequest.onBeforeRequest.mock.calls[0][1];
      const mockDetails = { url: 'data:image/png;base64,iVBORw0KGgo=' };
      let wasCancelled = false;

      filterCallback(mockDetails, (response: any) => {
        wasCancelled = response.cancel;
      });

      expect(wasCancelled).toBe(false);
    });

    it('should block unknown protocols', () => {
      securityManager.initialize();

      const filterCallback = mockSession.defaultSession.webRequest.onBeforeRequest.mock.calls[0][1];
      const mockDetails = { url: 'ftp://example.com/file' };
      let wasCancelled = false;

      filterCallback(mockDetails, (response: any) => {
        wasCancelled = response.cancel;
      });

      expect(wasCancelled).toBe(true);
    });

    it('should handle invalid URLs gracefully', () => {
      securityManager.initialize();

      const filterCallback = mockSession.defaultSession.webRequest.onBeforeRequest.mock.calls[0][1];
      const mockDetails = { url: 'not-a-valid-url' };
      let wasCancelled = false;

      expect(() => {
        filterCallback(mockDetails, (response: any) => {
          wasCancelled = response.cancel;
        });
      }).not.toThrow();

      // Should block invalid URLs
      expect(wasCancelled).toBe(true);
    });
  });

  describe('destroy', () => {
    it('should clean up resources', () => {
      const config = createMockConfig('test-widget', ['https://api.example.com']);
      securityManager.initialize();
      securityManager.registerWidget('test-widget', config);

      securityManager.destroy();

      // Should be able to initialize again after destroy
      expect(() => securityManager.initialize()).not.toThrow();
    });
  });
});

// Helper function to create mock widget config
function createMockConfig(id: string, allowedDomains: string[]): WidgetConfig {
  return {
    id,
    name: id,
    displayName: id,
    version: '1.0.0',
    description: 'Test widget',
    author: {
      name: 'Test Author',
      email: 'test@example.com'
    },
    permissions: {
      systemInfo: {
        cpu: false,
        memory: false
      },
      network: {
        enabled: true,
        allowedDomains
      }
    },
    sizes: {
      default: {
        width: 300,
        height: 200
      }
    },
    entryPoint: 'index.html'
  };
}
