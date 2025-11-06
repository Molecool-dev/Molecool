/**
 * Tests for WidgetProvider component
 */

import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import React, { useContext } from 'react';
import { WidgetProvider, WidgetContext } from '../WidgetAPI';

// Test component that uses the Widget API
function TestWidget() {
  const api = useContext(WidgetContext);

  if (!api) {
    return <div>No API</div>;
  }

  return (
    <div>
      <div data-testid="widget-id">{api.widgetId}</div>
      <div data-testid="widget-name">{api.config.displayName}</div>
      <div data-testid="has-storage">{api.storage ? 'yes' : 'no'}</div>
      <div data-testid="has-settings">{api.settings ? 'yes' : 'no'}</div>
      <div data-testid="has-system">{api.system ? 'yes' : 'no'}</div>
      <div data-testid="has-ui">{api.ui ? 'yes' : 'no'}</div>
    </div>
  );
}

describe('WidgetProvider', () => {
  it('should provide API context to children', () => {
    render(
      <WidgetProvider>
        <TestWidget />
      </WidgetProvider>
    );

    expect(screen.getByTestId('widget-id')).toHaveTextContent('mock-widget-dev');
    expect(screen.getByTestId('widget-name')).toHaveTextContent('Mock Widget (Development)');
    expect(screen.getByTestId('has-storage')).toHaveTextContent('yes');
    expect(screen.getByTestId('has-settings')).toHaveTextContent('yes');
    expect(screen.getByTestId('has-system')).toHaveTextContent('yes');
    expect(screen.getByTestId('has-ui')).toHaveTextContent('yes');
  });

  it('should render children correctly', () => {
    render(
      <WidgetProvider>
        <div data-testid="child">Test Child</div>
      </WidgetProvider>
    );

    expect(screen.getByTestId('child')).toHaveTextContent('Test Child');
  });

  it('should use mock API in test environment', () => {
    render(
      <WidgetProvider>
        <TestWidget />
      </WidgetProvider>
    );

    // In test environment, window.widgetAPI is undefined, so it should use mock
    expect(screen.getByTestId('widget-id')).toHaveTextContent('mock-widget-dev');
  });
});
