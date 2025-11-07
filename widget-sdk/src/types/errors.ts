/**
 * Widget Error Types and Classes
 * Provides standardized error handling for the Widget SDK
 */

/**
 * Error types that can occur in widget operations
 */
export enum WidgetErrorType {
  PERMISSION_DENIED = 'PERMISSION_DENIED',
  RATE_LIMIT_EXCEEDED = 'RATE_LIMIT_EXCEEDED',
  INVALID_CONFIG = 'INVALID_CONFIG',
  WIDGET_CRASHED = 'WIDGET_CRASHED',
  NETWORK_ERROR = 'NETWORK_ERROR',
  STORAGE_ERROR = 'STORAGE_ERROR'
}

/**
 * Custom error class for widget-related errors
 * Extends the standard Error class with additional context
 */
export class WidgetError extends Error {
  /**
   * The type of error that occurred
   */
  public readonly type: WidgetErrorType;
  
  /**
   * Optional widget ID associated with the error
   */
  public readonly widgetId?: string;
  
  /**
   * Timestamp when the error occurred
   */
  public readonly timestamp: Date;

  constructor(
    type: WidgetErrorType,
    message: string,
    widgetId?: string
  ) {
    super(message);
    this.name = 'WidgetError';
    this.type = type;
    this.widgetId = widgetId;
    this.timestamp = new Date();
    
    // Maintains proper stack trace for where our error was thrown (only available on V8)
    if ('captureStackTrace' in Error && typeof (Error as any).captureStackTrace === 'function') {
      (Error as any).captureStackTrace(this, WidgetError);
    }
  }

  /**
   * Convert error to a plain object for logging or serialization
   */
  toJSON(): {
    name: string;
    type: WidgetErrorType;
    message: string;
    widgetId?: string;
    timestamp: string;
    stack?: string;
  } {
    return {
      name: this.name,
      type: this.type,
      message: this.message,
      widgetId: this.widgetId,
      timestamp: this.timestamp.toISOString(),
      stack: this.stack
    };
  }

  /**
   * Get a user-friendly error message
   */
  getUserMessage(): string {
    switch (this.type) {
      case WidgetErrorType.PERMISSION_DENIED:
        return 'Permission denied. This widget needs additional permissions to perform this action.';
      case WidgetErrorType.RATE_LIMIT_EXCEEDED:
        return 'Too many requests. Please wait a moment and try again.';
      case WidgetErrorType.INVALID_CONFIG:
        return 'Invalid configuration. Please check the widget settings.';
      case WidgetErrorType.WIDGET_CRASHED:
        return 'The widget encountered an error and needs to restart.';
      case WidgetErrorType.NETWORK_ERROR:
        return 'Network error. Please check your internet connection.';
      case WidgetErrorType.STORAGE_ERROR:
        return 'Storage error. Failed to save or retrieve data.';
      default:
        return 'An unexpected error occurred.';
    }
  }
}

/**
 * Type guard to check if an error is a WidgetError
 */
export function isWidgetError(error: unknown): error is WidgetError {
  return error instanceof WidgetError || (
    error !== null &&
    typeof error === 'object' &&
    'type' in error &&
    'name' in error &&
    (error as any).name === 'WidgetError' &&
    Object.values(WidgetErrorType).includes((error as any).type)
  );
}

/**
 * Convert a generic error to a WidgetError
 */
export function toWidgetError(error: unknown, widgetId?: string): WidgetError {
  if (isWidgetError(error)) {
    return error;
  }
  
  // Check if error has a valid type property (from IPC response)
  if (
    error !== null &&
    typeof error === 'object' &&
    'type' in error &&
    Object.values(WidgetErrorType).includes((error as any).type)
  ) {
    return new WidgetError(
      (error as any).type as WidgetErrorType,
      (error as any).message || 'Unknown error',
      widgetId
    );
  }
  
  // Convert generic error
  const message = error instanceof Error 
    ? error.message 
    : typeof error === 'string'
    ? error
    : 'Unknown error';
    
  return new WidgetError(
    WidgetErrorType.WIDGET_CRASHED,
    message,
    widgetId
  );
}
