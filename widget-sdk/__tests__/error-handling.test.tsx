/**
 * Error Handling Tests
 * Tests for WidgetError class, ErrorBoundary, and error propagation
 */

import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import React from 'react';
import {
  WidgetError,
  WidgetErrorType,
  isWidgetError,
  toWidgetError,
  ErrorBoundary
} from '../src';

describe('WidgetError', () => {
  it('should create a WidgetError with type and message', () => {
    const error = new WidgetError(
      WidgetErrorType.PERMISSION_DENIED,
      'Permission denied'
    );
    
    expect(error).toBeInstanceOf(Error);
    expect(error).toBeInstanceOf(WidgetError);
    expect(error.name).toBe('WidgetError');
    expect(error.type).toBe(WidgetErrorType.PERMISSION_DENIED);
    expect(error.message).toBe('Permission denied');
    expect(error.timestamp).toBeInstanceOf(Date);
  });

  it('should include widgetId when provided', () => {
    const error = new WidgetError(
      WidgetErrorType.STORAGE_ERROR,
      'Storage failed',
      'test-widget'
    );
    
    expect(error.widgetId).toBe('test-widget');
  });

  it('should convert to JSON', () => {
    const error = new WidgetError(
      WidgetErrorType.RATE_LIMIT_EXCEEDED,
      'Too many requests',
      'test-widget'
    );
    
    const json = error.toJSON();
    
    expect(json.name).toBe('WidgetError');
    expect(json.type).toBe(WidgetErrorType.RATE_LIMIT_EXCEEDED);
    expect(json.message).toBe('Too many requests');
    expect(json.widgetId).toBe('test-widget');
    expect(json.timestamp).toBeDefined();
    expect(json.stack).toBeDefined();
  });

  it('should provide user-friendly messages', () => {
    const permissionError = new WidgetError(
      WidgetErrorType.PERMISSION_DENIED,
      'Permission denied'
    );
    expect(permissionError.getUserMessage()).toContain('Permission denied');
    
    const rateLimitError = new WidgetError(
      WidgetErrorType.RATE_LIMIT_EXCEEDED,
      'Too many requests'
    );
    expect(rateLimitError.getUserMessage()).toContain('Too many requests');
    
    const storageError = new WidgetError(
      WidgetErrorType.STORAGE_ERROR,
      'Storage failed'
    );
    expect(storageError.getUserMessage()).toContain('Storage error');
  });
});

describe('isWidgetError', () => {
  it('should return true for WidgetError instances', () => {
    const error = new WidgetError(
      WidgetErrorType.WIDGET_CRASHED,
      'Widget crashed'
    );
    
    expect(isWidgetError(error)).toBe(true);
  });

  it('should return false for regular errors', () => {
    const error = new Error('Regular error');
    
    expect(isWidgetError(error)).toBe(false);
  });

  it('should return true for error-like objects with type and name', () => {
    const errorLike = {
      name: 'WidgetError',
      type: WidgetErrorType.NETWORK_ERROR,
      message: 'Network failed'
    };
    
    expect(isWidgetError(errorLike)).toBe(true);
  });
});

describe('toWidgetError', () => {
  it('should return WidgetError as-is', () => {
    const error = new WidgetError(
      WidgetErrorType.INVALID_CONFIG,
      'Invalid config'
    );
    
    const converted = toWidgetError(error);
    
    expect(converted).toBe(error);
  });

  it('should convert error with type property', () => {
    const error = {
      type: WidgetErrorType.PERMISSION_DENIED,
      message: 'Permission denied'
    };
    
    const converted = toWidgetError(error, 'test-widget');
    
    expect(converted).toBeInstanceOf(WidgetError);
    expect(converted.type).toBe(WidgetErrorType.PERMISSION_DENIED);
    expect(converted.message).toBe('Permission denied');
    expect(converted.widgetId).toBe('test-widget');
  });

  it('should convert generic errors to WIDGET_CRASHED', () => {
    const error = new Error('Something went wrong');
    
    const converted = toWidgetError(error, 'test-widget');
    
    expect(converted).toBeInstanceOf(WidgetError);
    expect(converted.type).toBe(WidgetErrorType.WIDGET_CRASHED);
    expect(converted.message).toBe('Something went wrong');
    expect(converted.widgetId).toBe('test-widget');
  });

  it('should handle non-error values', () => {
    const converted = toWidgetError('String error', 'test-widget');
    
    expect(converted).toBeInstanceOf(WidgetError);
    expect(converted.type).toBe(WidgetErrorType.WIDGET_CRASHED);
    expect(converted.message).toBe('String error');
  });
});

describe('ErrorBoundary', () => {
  // Component that throws an error
  const ThrowError: React.FC<{ message: string }> = ({ message }) => {
    throw new Error(message);
  };

  // Component that works fine
  const WorkingComponent: React.FC = () => {
    return <div>Working component</div>;
  };

  it('should render children when no error occurs', () => {
    render(
      <ErrorBoundary>
        <WorkingComponent />
      </ErrorBoundary>
    );
    
    expect(screen.getByText('Working component')).toBeInTheDocument();
  });

  it('should catch errors and display fallback UI', () => {
    // Suppress console.error for this test
    const consoleError = vi.spyOn(console, 'error').mockImplementation(() => {});
    
    render(
      <ErrorBoundary>
        <ThrowError message="Test error" />
      </ErrorBoundary>
    );
    
    expect(screen.getByText('Widget Error')).toBeInTheDocument();
    expect(screen.getByText(/widget encountered an error/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /try again/i })).toBeInTheDocument();
    
    consoleError.mockRestore();
  });

  it('should call onError callback when error occurs', () => {
    const consoleError = vi.spyOn(console, 'error').mockImplementation(() => {});
    const onError = vi.fn();
    
    render(
      <ErrorBoundary onError={onError}>
        <ThrowError message="Test error" />
      </ErrorBoundary>
    );
    
    expect(onError).toHaveBeenCalledTimes(1);
    expect(onError).toHaveBeenCalledWith(
      expect.any(WidgetError),
      expect.objectContaining({
        componentStack: expect.any(String)
      })
    );
    
    consoleError.mockRestore();
  });

  it('should render custom fallback when provided', () => {
    const consoleError = vi.spyOn(console, 'error').mockImplementation(() => {});
    
    render(
      <ErrorBoundary
        fallback={(error, reset) => (
          <div>
            <h1>Custom Error: {error.message}</h1>
            <button onClick={reset}>Reset</button>
          </div>
        )}
      >
        <ThrowError message="Custom error message" />
      </ErrorBoundary>
    );
    
    expect(screen.getByText(/Custom Error:/)).toBeInTheDocument();
    expect(screen.getByText(/Custom error message/)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /reset/i })).toBeInTheDocument();
    
    consoleError.mockRestore();
  });

  it('should reset error state when reset is called', () => {
    const consoleError = vi.spyOn(console, 'error').mockImplementation(() => {});
    
    const { rerender } = render(
      <ErrorBoundary>
        <ThrowError message="Test error" />
      </ErrorBoundary>
    );
    
    // Error UI should be visible
    expect(screen.getByText('Widget Error')).toBeInTheDocument();
    
    // Click try again button
    const tryAgainButton = screen.getByRole('button', { name: /try again/i });
    tryAgainButton.click();
    
    // Re-render with working component
    rerender(
      <ErrorBoundary>
        <WorkingComponent />
      </ErrorBoundary>
    );
    
    // Working component should be visible
    expect(screen.getByText('Working component')).toBeInTheDocument();
    
    consoleError.mockRestore();
  });
});
