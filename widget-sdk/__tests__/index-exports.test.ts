/**
 * Test that all expected exports are available from the main index
 */
import { describe, it, expect } from 'vitest';
import * as SDK from '../src/index';

describe('SDK Exports', () => {
  it('should export core API types and functions', () => {
    expect(SDK.WidgetProvider).toBeDefined();
    expect(SDK.WidgetContext).toBeDefined();
    expect(SDK.createMockAPI).toBeDefined();
    expect(SDK.SDK_VERSION).toBeDefined();
  });

  it('should export all hooks', () => {
    expect(SDK.useWidgetAPI).toBeDefined();
    expect(SDK.useInterval).toBeDefined();
    expect(SDK.useStorage).toBeDefined();
    expect(SDK.useSettings).toBeDefined();
    expect(SDK.useAllSettings).toBeDefined();
    expect(SDK.useSystemInfo).toBeDefined();
    expect(SDK.useThrottle).toBeDefined();
  });

  it('should export Widget compound component', () => {
    expect(SDK.Widget).toBeDefined();
    expect(SDK.Widget.Container).toBeDefined();
    expect(SDK.Widget.Title).toBeDefined();
    expect(SDK.Widget.LargeText).toBeDefined();
    expect(SDK.Widget.SmallText).toBeDefined();
    expect(SDK.Widget.Button).toBeDefined();
  });

  it('should export all individual components', () => {
    // Task 9 components
    expect(SDK.Container).toBeDefined();
    expect(SDK.Title).toBeDefined();
    expect(SDK.LargeText).toBeDefined();
    expect(SDK.SmallText).toBeDefined();
    expect(SDK.Button).toBeDefined();
    expect(SDK.Grid).toBeDefined();
    expect(SDK.Divider).toBeDefined();
    expect(SDK.Header).toBeDefined();
    
    // Task 10 components
    expect(SDK.Stat).toBeDefined();
    expect(SDK.ProgressBar).toBeDefined();
    expect(SDK.Input).toBeDefined();
    expect(SDK.Select).toBeDefined();
    expect(SDK.List).toBeDefined();
    expect(SDK.ListItem).toBeDefined();
    expect(SDK.Badge).toBeDefined();
    expect(SDK.Link).toBeDefined();
  });

  it('should export error handling', () => {
    expect(SDK.ErrorBoundary).toBeDefined();
    expect(SDK.WidgetError).toBeDefined();
    expect(SDK.WidgetErrorType).toBeDefined();
    expect(SDK.isWidgetError).toBeDefined();
    expect(SDK.toWidgetError).toBeDefined();
  });

  it('should not have duplicate exports', () => {
    const exports = Object.keys(SDK);
    const uniqueExports = new Set(exports);
    expect(exports.length).toBe(uniqueExports.size);
  });
});
