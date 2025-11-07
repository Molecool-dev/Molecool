# Error Handling Documentation

## Overview

The Widget Container implements comprehensive error handling across all IPC handlers and system APIs. All errors are caught, logged, and returned in a standardized format to ensure consistent error handling throughout the application.

## Error Types

The system defines six error types in `WidgetErrorType` enum:

```typescript
enum WidgetErrorType {
  PERMISSION_DENIED = 'PERMISSION_DENIED',
  RATE_LIMIT_EXCEEDED = 'RATE_LIMIT_EXCEEDED',
  INVALID_CONFIG = 'INVALID_CONFIG',
  WIDGET_CRASHED = 'WIDGET_CRASHED',
  NETWORK_ERROR = 'NETWORK_ERROR',
  STORAGE_ERROR = 'STORAGE_ERROR'
}
```

### Error Type Descriptions

- **PERMISSION_DENIED**: Widget attempted to access a system API without proper permissions
- **RATE_LIMIT_EXCEEDED**: Widget exceeded the API rate limit (10 calls per second)
- **INVALID_CONFIG**: Widget configuration is malformed or contains invalid values
- **WIDGET_CRASHED**: Widget encountered an unexpected error during execution
- **NETWORK_ERROR**: Network request failed (connection error, timeout, etc.)
- **STORAGE_ERROR**: Data persistence operation failed

## IPC Response Format

All IPC handlers return responses in a standardized format:

### Success Response

```typescript
{
  success: true,
  data?: any  // Optional data payload
}
```

### Error Response

```typescript
{
  success: false,
  error: {
    type: WidgetErrorType,
    message: string
  }
}
```

## Implementation Details

### Main Process (IPC Handlers)

All IPC handlers are wrapped in try-catch blocks:

```typescript
private async handleStorageGet(event: Electron.IpcMainInvokeEvent, key: string): Promise<IPCResponse> {
  try {
    // Validate input
    if (!key || typeof key !== 'string') {
      throw new Error('Invalid key: must be a non-empty string');
    }

    // Perform operation
    const widgetId = this.getWidgetIdFromEvent(event);
    const value = this.storageManager.getWidgetData(widgetId, key);
    
    return {
      success: true,
      data: value
    };
  } catch (error: any) {
    console.error('Storage get failed:', error);
    return {
      success: false,
      error: {
        type: WidgetErrorType.STORAGE_ERROR,
        message: error.message
      }
    };
  }
}
```

### Preload Script

The preload script includes a helper function to handle IPC responses:

```typescript
async function handleIPCResponse<T>(promise: Promise<any>): Promise<T> {
  const response = await promise;
  
  if (response.success === false && response.error) {
    const error = new Error(response.error.message);
    (error as any).type = response.error.type;
    throw error;
  }
  
  return response.data !== undefined ? response.data : response;
}
```

This converts error responses into thrown errors that can be caught by the Widget SDK.

### Widget SDK

The Widget SDK provides:

1. **WidgetError Class**: Custom error class with additional context
2. **Error Conversion**: Converts IPC errors to WidgetError instances
3. **ErrorBoundary Component**: React error boundary to catch rendering errors

```typescript
// Using the API with error handling
try {
  await storage.set('key', 'value');
} catch (error) {
  if (isWidgetError(error)) {
    console.error('Widget error:', error.type, error.message);
    // Show user-friendly message
    alert(error.getUserMessage());
  }
}
```

## Error Boundary

The `ErrorBoundary` component catches React errors and displays a fallback UI:

```tsx
import { WidgetProvider, ErrorBoundary } from '@molecule/widget-sdk';

function App() {
  return (
    <WidgetProvider>
      <ErrorBoundary
        onError={(error) => {
          // Log to error tracking service
          console.error('Widget error:', error.toJSON());
        }}
      >
        <MyWidget />
      </ErrorBoundary>
    </WidgetProvider>
  );
}
```

The `WidgetProvider` automatically includes an `ErrorBoundary`, so you don't need to add one manually unless you want custom error handling.

## Best Practices

### For Widget Developers

1. **Always handle errors**: Wrap API calls in try-catch blocks
2. **Use WidgetError**: Check if errors are WidgetError instances for better handling
3. **Show user-friendly messages**: Use `error.getUserMessage()` for display
4. **Log errors**: Always log errors for debugging

```typescript
import { useWidgetAPI, isWidgetError } from '@molecule/widget-sdk';

function MyWidget() {
  const { storage } = useWidgetAPI();
  
  const saveData = async () => {
    try {
      await storage.set('myKey', 'myValue');
    } catch (error) {
      if (isWidgetError(error)) {
        // Handle specific error types
        if (error.type === 'RATE_LIMIT_EXCEEDED') {
          console.warn('Slow down! Too many requests.');
        } else {
          console.error('Error:', error.getUserMessage());
        }
      } else {
        console.error('Unexpected error:', error);
      }
    }
  };
  
  return <button onClick={saveData}>Save</button>;
}
```

### For Container Developers

1. **Validate inputs**: Always validate IPC handler inputs before processing
2. **Use try-catch**: Wrap all handler logic in try-catch blocks
3. **Return standardized responses**: Always use the IPCResponse format
4. **Log errors**: Use console.error for error logging
5. **Choose appropriate error types**: Select the most specific error type

## Error Logging

All errors are logged to the console with context:

```
console.error('Storage get failed:', error);
console.error('UI resize failed:', error);
console.error('System getCPU failed:', error);
```

In production, these logs can be captured by error tracking services like Sentry or LogRocket.

## Testing Error Handling

The error handling system is thoroughly tested in `widget-container/src/main/__tests__/error-handling.test.ts`.

### Test Setup

Tests use Jest with mocked Electron APIs:

```typescript
import { describe, it, expect, beforeEach, afterEach, jest } from '@jest/globals';

// Mock electron module BEFORE importing anything that uses it
jest.mock('electron', () => ({
  BrowserWindow: {
    fromWebContents: jest.fn()
  }
}));

import { IPCHandlers } from '../ipc-handlers';
import { BrowserWindow } from 'electron';
```

**Important**: The Electron module must be mocked before importing any modules that depend on it. This prevents runtime errors when running tests in Node.js environment.

### Test Coverage

The test suite covers:

1. **Storage Error Handling** (3 tests)
   - Invalid key type validation
   - Empty key validation
   - Successful storage operations

2. **UI Error Handling** (4 tests)
   - Invalid resize dimensions (non-numeric)
   - Dimensions too small (< 100x100)
   - Dimensions too large (> 2000x2000)
   - Non-finite numbers (Infinity, NaN)

3. **Error Response Format** (3 tests)
   - Standardized error response structure
   - Standardized success response structure
   - Data inclusion in success responses

4. **WidgetError Class** (1 test)
   - All error types are defined

### Example Test

```typescript
it('should return error for invalid input', async () => {
  const mockEvent = {
    sender: {
      getOwnerBrowserWindow: () => null
    }
  } as any;

  const response = await ipcHandlers.handleStorageGet(mockEvent, null);
  
  expect(response.success).toBe(false);
  expect(response.error).toBeDefined();
  expect(response.error.type).toBe(WidgetErrorType.STORAGE_ERROR);
  expect(response.error.message).toContain('Invalid key');
});
```

### Running Tests

```bash
cd widget-container
npm test -- --run
```

All 11 tests pass successfully, ensuring robust error handling across the system.

## Future Enhancements

1. **Error Tracking Integration**: Integrate with Sentry or similar service
2. **Error Recovery**: Implement automatic retry logic for transient errors
3. **Error Analytics**: Track error frequency and patterns
4. **User Notifications**: Show toast notifications for errors
5. **Error Reporting**: Allow users to report errors with context
