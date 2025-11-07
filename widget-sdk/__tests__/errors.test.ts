/**
 * Tests for Widget Error Types and Classes
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { WidgetError, WidgetErrorType, isWidgetError, toWidgetError } from '../src/types/errors';

describe('WidgetErrorType', () => {
  it('should have all expected error types', () => {
    expect(WidgetErrorType.PERMISSION_DENIED).toBe('PERMISSION_DENIED');
    expect(WidgetErrorType.RATE_LIMIT_EXCEEDED).toBe('RATE_LIMIT_EXCEEDED');
    expect(WidgetErrorType.INVALID_CONFIG).toBe('INVALID_CONFIG');
    expect(WidgetErrorType.WIDGET_CRASHED).toBe('WIDGET_CRASHED');
    expect(WidgetErrorType.NETWORK_ERROR).toBe('NETWORK_ERROR');
    expect(WidgetErrorType.STORAGE_ERROR).toBe('STORAGE_ERROR');
  });
});

describe('WidgetError', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2024-01-01T00:00:00.000Z'));
  });

  it('should create error with type and message', () => {
    const error = new WidgetError(
      WidgetErrorType.PERMISSION_DENIED,
      'Test error message'
    );

    expect(error).toBeInstanceOf(Error);
    expect(error).toBeInstanceOf(WidgetError);
    expect(error.name).toBe('WidgetError');
    expect(error.type).toBe(WidgetErrorType.PERMISSION_DENIED);
    expect(error.message).toBe('Test error message');
    expect(error.widgetId).toBeUndefined();
    expect(error.timestamp).toBeInstanceOf(Date);
  });

  it('should create error with widget ID', () => {
    const error = new WidgetError(
      WidgetErrorType.STORAGE_ERROR,
      'Storage failed',
      'widget-123'
    );

    expect(error.widgetId).toBe('widget-123');
  });

  it('should capture stack trace', () => {
    const error = new WidgetError(
      WidgetErrorType.NETWORK_ERROR,
      'Network failed'
    );

    expect(error.stack).toBeDefined();
    expect(error.stack).toContain('WidgetError');
  });

  describe('toJSON', () => {
    it('should serialize to JSON with all properties', () => {
      const error = new WidgetError(
        WidgetErrorType.INVALID_CONFIG,
        'Config error',
        'widget-456'
      );

      const json = error.toJSON();

      expect(json).toEqual({
        name: 'WidgetError',
        type: WidgetErrorType.INVALID_CONFIG,
        message: 'Config error',
        widgetId: 'widget-456',
        timestamp: '2024-01-01T00:00:00.000Z',
        stack: expect.any(String)
      });
    });

    it('should serialize without widgetId if not provided', () => {
      const error = new WidgetError(
        WidgetErrorType.WIDGET_CRASHED,
        'Crash error'
      );

      const json = error.toJSON();

      expect(json.widgetId).toBeUndefined();
    });

    it('should be JSON.stringify compatible', () => {
      const error = new WidgetError(
        WidgetErrorType.NETWORK_ERROR,
        'Network error'
      );

      const jsonString = JSON.stringify(error);
      const parsed = JSON.parse(jsonString);

      expect(parsed.name).toBe('WidgetError');
      expect(parsed.type).toBe(WidgetErrorType.NETWORK_ERROR);
      expect(parsed.message).toBe('Network error');
    });
  });

  describe('getUserMessage', () => {
    it('should return user-friendly message for PERMISSION_DENIED', () => {
      const error = new WidgetError(WidgetErrorType.PERMISSION_DENIED, 'Test');
      expect(error.getUserMessage()).toBe(
        'Permission denied. This widget needs additional permissions to perform this action.'
      );
    });

    it('should return user-friendly message for RATE_LIMIT_EXCEEDED', () => {
      const error = new WidgetError(WidgetErrorType.RATE_LIMIT_EXCEEDED, 'Test');
      expect(error.getUserMessage()).toBe(
        'Too many requests. Please wait a moment and try again.'
      );
    });

    it('should return user-friendly message for INVALID_CONFIG', () => {
      const error = new WidgetError(WidgetErrorType.INVALID_CONFIG, 'Test');
      expect(error.getUserMessage()).toBe(
        'Invalid configuration. Please check the widget settings.'
      );
    });

    it('should return user-friendly message for WIDGET_CRASHED', () => {
      const error = new WidgetError(WidgetErrorType.WIDGET_CRASHED, 'Test');
      expect(error.getUserMessage()).toBe(
        'The widget encountered an error and needs to restart.'
      );
    });

    it('should return user-friendly message for NETWORK_ERROR', () => {
      const error = new WidgetError(WidgetErrorType.NETWORK_ERROR, 'Test');
      expect(error.getUserMessage()).toBe(
        'Network error. Please check your internet connection.'
      );
    });

    it('should return user-friendly message for STORAGE_ERROR', () => {
      const error = new WidgetError(WidgetErrorType.STORAGE_ERROR, 'Test');
      expect(error.getUserMessage()).toBe(
        'Storage error. Failed to save or retrieve data.'
      );
    });
  });
});

describe('isWidgetError', () => {
  it('should return true for WidgetError instance', () => {
    const error = new WidgetError(WidgetErrorType.PERMISSION_DENIED, 'Test');
    expect(isWidgetError(error)).toBe(true);
  });

  it('should return true for WidgetError-like object with valid type', () => {
    const errorLike = {
      name: 'WidgetError',
      type: WidgetErrorType.NETWORK_ERROR,
      message: 'Test'
    };
    expect(isWidgetError(errorLike)).toBe(true);
  });

  it('should return false for object with invalid type', () => {
    const errorLike = {
      name: 'WidgetError',
      type: 'INVALID_TYPE',
      message: 'Test'
    };
    expect(isWidgetError(errorLike)).toBe(false);
  });

  it('should return false for regular Error', () => {
    const error = new Error('Test');
    expect(isWidgetError(error)).toBe(false);
  });

  it('should return false for null', () => {
    expect(isWidgetError(null)).toBe(false);
  });

  it('should return false for undefined', () => {
    expect(isWidgetError(undefined)).toBe(false);
  });

  it('should return false for string', () => {
    expect(isWidgetError('error')).toBe(false);
  });

  it('should return false for number', () => {
    expect(isWidgetError(123)).toBe(false);
  });

  it('should return false for object without type', () => {
    expect(isWidgetError({ name: 'WidgetError', message: 'Test' })).toBe(false);
  });

  it('should return false for object without name', () => {
    expect(isWidgetError({ type: WidgetErrorType.NETWORK_ERROR, message: 'Test' })).toBe(false);
  });
});

describe('toWidgetError', () => {
  it('should return same error if already WidgetError', () => {
    const error = new WidgetError(WidgetErrorType.PERMISSION_DENIED, 'Test');
    const result = toWidgetError(error);
    expect(result).toBe(error);
  });

  it('should convert IPC error object with valid type', () => {
    const ipcError = {
      type: WidgetErrorType.RATE_LIMIT_EXCEEDED,
      message: 'Rate limit exceeded'
    };
    const result = toWidgetError(ipcError, 'widget-123');

    expect(result).toBeInstanceOf(WidgetError);
    expect(result.type).toBe(WidgetErrorType.RATE_LIMIT_EXCEEDED);
    expect(result.message).toBe('Rate limit exceeded');
    expect(result.widgetId).toBe('widget-123');
  });

  it('should use default message for IPC error without message', () => {
    const ipcError = {
      type: WidgetErrorType.STORAGE_ERROR
    };
    const result = toWidgetError(ipcError);

    expect(result.message).toBe('Unknown error');
  });

  it('should convert standard Error to WidgetError', () => {
    const error = new Error('Standard error');
    const result = toWidgetError(error, 'widget-456');

    expect(result).toBeInstanceOf(WidgetError);
    expect(result.type).toBe(WidgetErrorType.WIDGET_CRASHED);
    expect(result.message).toBe('Standard error');
    expect(result.widgetId).toBe('widget-456');
  });

  it('should convert string to WidgetError', () => {
    const result = toWidgetError('Error string');

    expect(result).toBeInstanceOf(WidgetError);
    expect(result.type).toBe(WidgetErrorType.WIDGET_CRASHED);
    expect(result.message).toBe('Error string');
  });

  it('should convert null to WidgetError', () => {
    const result = toWidgetError(null);

    expect(result).toBeInstanceOf(WidgetError);
    expect(result.type).toBe(WidgetErrorType.WIDGET_CRASHED);
    expect(result.message).toBe('Unknown error');
  });

  it('should convert undefined to WidgetError', () => {
    const result = toWidgetError(undefined);

    expect(result).toBeInstanceOf(WidgetError);
    expect(result.type).toBe(WidgetErrorType.WIDGET_CRASHED);
    expect(result.message).toBe('Unknown error');
  });

  it('should convert number to WidgetError', () => {
    const result = toWidgetError(404);

    expect(result).toBeInstanceOf(WidgetError);
    expect(result.type).toBe(WidgetErrorType.WIDGET_CRASHED);
    expect(result.message).toBe('Unknown error');
  });

  it('should convert object without valid type to WidgetError', () => {
    const obj = { type: 'INVALID', message: 'Test' };
    const result = toWidgetError(obj);

    expect(result).toBeInstanceOf(WidgetError);
    expect(result.type).toBe(WidgetErrorType.WIDGET_CRASHED);
    expect(result.message).toBe('Unknown error');
  });

  it('should preserve widgetId when converting', () => {
    const error = new Error('Test');
    const result = toWidgetError(error, 'widget-789');

    expect(result.widgetId).toBe('widget-789');
  });
});
