/**
 * Tests for useWidgetAPI hook
 */

import { describe, it, expect } from 'vitest';
import { renderHook } from '@testing-library/react';
import React from 'react';
import { useWidgetAPI } from '../useWidgetAPI';
import { WidgetProvider } from '../../core/WidgetAPI';

describe('useWidgetAPI', () => {
  it('should return the Widget API context', () => {
    const { result } = renderHook(() => useWidgetAPI(), {
      wrapper: ({ children }) => <WidgetProvider>{children}</WidgetProvider>,
    });

    expect(result.current).toBeDefined();
    expect(result.current.storage).toBeDefined();
    expect(result.current.settings).toBeDefined();
    expect(result.current.system).toBeDefined();
    expect(result.current.ui).toBeDefined();
    expect(result.current.widgetId).toBe('mock-widget-dev');
    expect(result.current.config).toBeDefined();
  });

  it('should throw error when used outside WidgetProvider', () => {
    // Suppress console.error for this test
    const originalError = console.error;
    console.error = () => {};

    expect(() => {
      renderHook(() => useWidgetAPI());
    }).toThrow('useWidgetAPI must be used within a WidgetProvider');

    console.error = originalError;
  });

  it('should provide access to storage API', () => {
    const { result } = renderHook(() => useWidgetAPI(), {
      wrapper: ({ children }) => <WidgetProvider>{children}</WidgetProvider>,
    });

    expect(result.current.storage.get).toBeDefined();
    expect(result.current.storage.set).toBeDefined();
    expect(result.current.storage.remove).toBeDefined();
  });

  it('should provide access to settings API', () => {
    const { result } = renderHook(() => useWidgetAPI(), {
      wrapper: ({ children }) => <WidgetProvider>{children}</WidgetProvider>,
    });

    expect(result.current.settings.get).toBeDefined();
    expect(result.current.settings.getAll).toBeDefined();
  });

  it('should provide access to system API', () => {
    const { result } = renderHook(() => useWidgetAPI(), {
      wrapper: ({ children }) => <WidgetProvider>{children}</WidgetProvider>,
    });

    expect(result.current.system.getCPU).toBeDefined();
    expect(result.current.system.getMemory).toBeDefined();
  });

  it('should provide access to UI API', () => {
    const { result } = renderHook(() => useWidgetAPI(), {
      wrapper: ({ children }) => <WidgetProvider>{children}</WidgetProvider>,
    });

    expect(result.current.ui.resize).toBeDefined();
    expect(result.current.ui.setPosition).toBeDefined();
  });
});
