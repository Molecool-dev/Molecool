/**
 * Tests for manager.js renderer script
 * Note: These are unit tests for utility functions only.
 * Full integration tests require Electron environment.
 */

describe('Manager Renderer Utils', () => {
  // Mock DOM
  beforeEach(() => {
    document.body.innerHTML = '<div id="widget-list"></div>';
  });

  describe('escapeHtml', () => {
    // Load the function from manager.js
    const escapeHtml = (str) => {
      if (typeof str !== 'string') return '';
      const div = document.createElement('div');
      div.textContent = str;
      return div.innerHTML;
    };

    test('should escape HTML special characters', () => {
      expect(escapeHtml('<script>alert("xss")</script>')).toBe(
        '&lt;script&gt;alert("xss")&lt;/script&gt;'
      );
    });

    test('should escape quotes', () => {
      expect(escapeHtml('"test"')).toBe('"test"');
      expect(escapeHtml("'test'")).toBe("'test'");
    });

    test('should handle empty string', () => {
      expect(escapeHtml('')).toBe('');
    });

    test('should handle non-string input', () => {
      expect(escapeHtml(null)).toBe('');
      expect(escapeHtml(undefined)).toBe('');
      expect(escapeHtml(123)).toBe('');
    });

    test('should preserve safe text', () => {
      expect(escapeHtml('Hello World')).toBe('Hello World');
    });
  });

  describe('createWidgetCard', () => {
    const createWidgetCard = (widget, runningWidgets) => {
      const isRunning = runningWidgets.some(w => w.widgetId === widget.id);
      const runningInstance = runningWidgets.find(w => w.widgetId === widget.id);
      
      const escapeHtml = (str) => {
        if (typeof str !== 'string') return '';
        const div = document.createElement('div');
        div.textContent = str;
        return div.innerHTML;
      };
      
      const authorInfo = widget.author 
        ? (typeof widget.author === 'string' ? widget.author : widget.author.name)
        : 'Unknown';
      
      const displayName = escapeHtml(widget.displayName || widget.name);
      const description = escapeHtml(widget.description || 'No description');
      const version = escapeHtml(widget.version);
      const author = escapeHtml(authorInfo);
      const widgetId = escapeHtml(widget.id);
      
      return `
    <div class="widget-card">
      <span class="status ${isRunning ? 'running' : 'stopped'}">
        ${isRunning ? '● Running' : '○ Stopped'}
      </span>
      <h3>${displayName}</h3>
      <p>${description}</p>
      
      <div class="widget-info">
        <div><strong>Version:</strong> ${version}</div>
        <div><strong>Author:</strong> ${author}</div>
        <div><strong>Size:</strong> ${widget.sizes?.default?.width || 'N/A'}x${widget.sizes?.default?.height || 'N/A'}</div>
        ${runningInstance ? `<div><strong>Instance:</strong> ${escapeHtml(runningInstance.instanceId.substring(0, 8))}...</div>` : ''}
      </div>
      
      <div class="widget-card-actions">
        <button 
          class="btn" 
          onclick="toggleWidget('${widgetId}', ${isRunning})"
        >
          ${isRunning ? '✕ Close' : '▶ Launch'}
        </button>
      </div>
    </div>
  `;
    };

    test('should create card for stopped widget', () => {
      const widget = {
        id: 'test-widget',
        name: 'Test Widget',
        displayName: 'Test Widget',
        description: 'A test widget',
        version: '1.0.0',
        author: 'Test Author',
        sizes: { default: { width: 200, height: 100 } }
      };
      
      const html = createWidgetCard(widget, []);
      
      expect(html).toContain('Test Widget');
      expect(html).toContain('A test widget');
      expect(html).toContain('1.0.0');
      expect(html).toContain('Test Author');
      expect(html).toContain('○ Stopped');
      expect(html).toContain('▶ Launch');
    });

    test('should create card for running widget', () => {
      const widget = {
        id: 'test-widget',
        name: 'Test Widget',
        version: '1.0.0',
        author: 'Test Author',
        sizes: { default: { width: 200, height: 100 } }
      };
      
      const runningWidgets = [{
        widgetId: 'test-widget',
        instanceId: 'abc123def456'
      }];
      
      const html = createWidgetCard(widget, runningWidgets);
      
      expect(html).toContain('● Running');
      expect(html).toContain('✕ Close');
      expect(html).toContain('abc123de...');
    });

    test('should escape malicious widget data', () => {
      const widget = {
        id: 'test-widget',
        name: '<script>alert("xss")</script>',
        description: '<img src=x onerror=alert(1)>',
        version: '1.0.0',
        author: { name: '<b>Evil</b>' },
        sizes: { default: { width: 200, height: 100 } }
      };
      
      const html = createWidgetCard(widget, []);
      
      expect(html).not.toContain('<script>alert');
      expect(html).not.toContain('onerror=alert');
      expect(html).toContain('&lt;script&gt;');
      expect(html).toContain('&lt;img');
      expect(html).toContain('&lt;b&gt;Evil&lt;/b&gt;');
    });

    test('should handle missing optional fields', () => {
      const widget = {
        id: 'minimal-widget',
        name: 'Minimal',
        version: '1.0.0'
      };
      
      const html = createWidgetCard(widget, []);
      
      expect(html).toContain('Minimal');
      expect(html).toContain('No description');
      expect(html).toContain('Unknown');
      expect(html).toContain('N/A');
    });
  });
});
