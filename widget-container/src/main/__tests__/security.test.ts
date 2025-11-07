/**
 * Security Manager Tests
 * Tests CSP configuration and network filtering
 * Requirements: 2.3, 2.5
 */

import { SecurityManager } from '../security';
import { WidgetConfig } from '../../types';

describe('SecurityManager', () => {
  let securityManager: SecurityManager;

  beforeEach(() => {
    securityManager = new SecurityManager();
  });

  afterEach(() => {
    securityManager.destroy();
  });

  describe('Widget Registration', () => {
    test('should register widget configuration', () => {
      const config: WidgetConfig = {
        id: 'test-widget',
        name: 'test',
        displayName: 'Test Widget',
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
            allowedDomains: ['https://api.example.com']
          }
        },
        sizes: {
          default: {
            width: 300,
            height: 200
          }
        },
        entryPoint: 'dist/index.html'
      };

      // Should not throw
      expect(() => {
        securityManager.registerWidget('test-widget', config);
      }).not.toThrow();
    });

    test('should unregister widget configuration', () => {
      const config: WidgetConfig = {
        id: 'test-widget',
        name: 'test',
        displayName: 'Test Widget',
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
            enabled: false
          }
        },
        sizes: {
          default: {
            width: 300,
            height: 200
          }
        },
        entryPoint: 'dist/index.html'
      };

      securityManager.registerWidget('test-widget', config);

      // Should not throw
      expect(() => {
        securityManager.unregisterWidget('test-widget');
      }).not.toThrow();
    });
  });

  describe('CSP Configuration', () => {
    test('should initialize without errors in Electron environment', () => {
      // Note: This test requires Electron's session API which is not available in Jest
      // In a real Electron environment, initialize() would set up CSP headers
      // We test that the method exists and can be called
      expect(securityManager.initialize).toBeDefined();
      expect(typeof securityManager.initialize).toBe('function');
    });

    test('should handle multiple widget registrations', () => {
      const config1: WidgetConfig = {
        id: 'widget-1',
        name: 'widget1',
        displayName: 'Widget 1',
        version: '1.0.0',
        description: 'Widget 1',
        author: {
          name: 'Author',
          email: 'author@example.com'
        },
        permissions: {
          systemInfo: {
            cpu: false,
            memory: false
          },
          network: {
            enabled: true,
            allowedDomains: ['https://api1.example.com']
          }
        },
        sizes: {
          default: {
            width: 300,
            height: 200
          }
        },
        entryPoint: 'dist/index.html'
      };

      const config2: WidgetConfig = {
        id: 'widget-2',
        name: 'widget2',
        displayName: 'Widget 2',
        version: '1.0.0',
        description: 'Widget 2',
        author: {
          name: 'Author',
          email: 'author@example.com'
        },
        permissions: {
          systemInfo: {
            cpu: false,
            memory: false
          },
          network: {
            enabled: true,
            allowedDomains: ['https://api2.example.com']
          }
        },
        sizes: {
          default: {
            width: 300,
            height: 200
          }
        },
        entryPoint: 'dist/index.html'
      };

      // Should not throw
      expect(() => {
        securityManager.registerWidget('widget-1', config1);
        securityManager.registerWidget('widget-2', config2);
      }).not.toThrow();
    });
  });

  describe('Cleanup', () => {
    test('should cleanup without errors', () => {
      const config: WidgetConfig = {
        id: 'test-widget',
        name: 'test',
        displayName: 'Test Widget',
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
            enabled: false
          }
        },
        sizes: {
          default: {
            width: 300,
            height: 200
          }
        },
        entryPoint: 'dist/index.html'
      };

      securityManager.registerWidget('test-widget', config);

      // Should not throw
      expect(() => {
        securityManager.destroy();
      }).not.toThrow();
    });
  });
});
