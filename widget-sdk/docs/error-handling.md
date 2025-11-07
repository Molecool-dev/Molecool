# Widget SDK Error Handling Guide

## Overview

The Widget SDK provides comprehensive error handling to help you build robust widgets. All API errors are converted to `WidgetError` instances with additional context and user-friendly messages.

## WidgetError Class

The `WidgetError` class extends the standard JavaScript `Error` with additional properties:

```typescript
class WidgetError extends Error {
  type: WidgetErrorType;      // Error type enum
  widgetId?: string;           // Widget ID (if available)
  timestamp: Date;             // When the error occurred
  
  getUserMessage(): string;    // Get user-friendly message
  toJSON(): object;            // Convert to JSON for logging
}
```

### Creating WidgetError

```typescript
import { WidgetError, WidgetErrorType } from '@molecule/widget-sdk';

// Basic error
const error = new WidgetError(
  WidgetErrorType.STORAGE_ERROR,
  'Failed to save preferences'
);

// Error with widget ID
const error = new WidgetError(
  WidgetErrorType.PERMISSION_DENIED,
  'CPU access denied',
  'system-monitor-widget'
);

// Access properties
console.log(error.type);        // 'STORAGE_ERROR'
console.log(error.message);     // 'Failed to save preferences'
console.log(error.widgetId);    // 'system-monitor-widget'
console.log(error.timestamp);   // Date object
```

## Error Types

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

## Using Error Handling

### Basic Error Handling

```typescript
import { useWidgetAPI, isWidgetError } from '@molecule/widget-sdk';

function MyWidget() {
  const { storage } = useWidgetAPI();
  
  const saveData = async () => {
    try {
      await storage.set('myKey', 'myValue');
      console.log('Data saved successfully');
    } catch (error) {
      if (isWidgetError(error)) {
        console.error('Widget error:', error.type);
        console.error('Message:', error.getUserMessage());
      } else {
        console.error('Unexpected error:', error);
      }
    }
  };
  
  return <button onClick={saveData}>Save</button>;
}
```

### Handling Specific Error Types

```typescript
import { useWidgetAPI, WidgetErrorType, isWidgetError } from '@molecule/widget-sdk';

function SystemMonitor() {
  const { system } = useWidgetAPI();
  const [error, setError] = useState<string | null>(null);
  
  const fetchCPU = async () => {
    try {
      const cpuUsage = await system.getCPU();
      console.log('CPU:', cpuUsage);
      setError(null);
    } catch (err) {
      if (isWidgetError(err)) {
        switch (err.type) {
          case WidgetErrorType.PERMISSION_DENIED:
            setError('Permission denied. Please grant CPU access.');
            break;
          case WidgetErrorType.RATE_LIMIT_EXCEEDED:
            setError('Too many requests. Please wait a moment.');
            break;
          default:
            setError(err.getUserMessage());
        }
      } else {
        setError('An unexpected error occurred');
      }
    }
  };
  
  return (
    <div>
      <button onClick={fetchCPU}>Get CPU</button>
      {error && <div className="error">{error}</div>}
    </div>
  );
}
```

## ErrorBoundary Component

The `ErrorBoundary` component catches React rendering errors:

### Basic Usage

```tsx
import { ErrorBoundary } from '@molecule/widget-sdk';

function App() {
  return (
    <ErrorBoundary>
      <MyWidget />
    </ErrorBoundary>
  );
}
```

### Custom Fallback UI

```tsx
import { ErrorBoundary, WidgetError } from '@molecule/widget-sdk';

function App() {
  return (
    <ErrorBoundary
      fallback={(error: WidgetError, reset: () => void) => (
        <div className="error-container">
          <h2>Oops! Something went wrong</h2>
          <p>{error.getUserMessage()}</p>
          <button onClick={reset}>Try Again</button>
        </div>
      )}
    >
      <MyWidget />
    </ErrorBoundary>
  );
}
```

### Error Logging

```tsx
import { ErrorBoundary, WidgetError } from '@molecule/widget-sdk';

function App() {
  const handleError = (error: WidgetError) => {
    // Send to error tracking service
    console.error('Widget crashed:', error.toJSON());
    
    // You could send to Sentry, LogRocket, etc.
    // Sentry.captureException(error);
  };
  
  return (
    <ErrorBoundary onError={handleError}>
      <MyWidget />
    </ErrorBoundary>
  );
}
```

## WidgetProvider with Error Handling

The `WidgetProvider` automatically includes an `ErrorBoundary`:

```tsx
import { WidgetProvider } from '@molecule/widget-sdk';

function App() {
  return (
    <WidgetProvider
      onError={(error) => {
        console.error('Widget error:', error.toJSON());
      }}
    >
      <MyWidget />
    </WidgetProvider>
  );
}
```

## Utility Functions

### isWidgetError

Check if an error is a `WidgetError`:

```typescript
import { isWidgetError } from '@molecule/widget-sdk';

try {
  await someOperation();
} catch (error) {
  if (isWidgetError(error)) {
    // Handle WidgetError
    console.log('Error type:', error.type);
  } else {
    // Handle other errors
    console.error('Unknown error:', error);
  }
}
```

### toWidgetError

Convert any error to a `WidgetError`:

```typescript
import { toWidgetError } from '@molecule/widget-sdk';

try {
  await someOperation();
} catch (error) {
  const widgetError = toWidgetError(error, 'my-widget-id');
  console.error(widgetError.toJSON());
}
```

## User-Friendly Messages

Each error type has a user-friendly message:

```typescript
const error = new WidgetError(
  WidgetErrorType.PERMISSION_DENIED,
  'CPU access denied'
);

console.log(error.getUserMessage());
// Output: "Permission denied. This widget needs additional permissions to perform this action."
```

### All User Messages

- **PERMISSION_DENIED**: "Permission denied. This widget needs additional permissions to perform this action."
- **RATE_LIMIT_EXCEEDED**: "Too many requests. Please wait a moment and try again."
- **INVALID_CONFIG**: "Invalid configuration. Please check the widget settings."
- **WIDGET_CRASHED**: "The widget encountered an error and needs to restart."
- **NETWORK_ERROR**: "Network error. Please check your internet connection."
- **STORAGE_ERROR**: "Storage error. Failed to save or retrieve data."

## Best Practices

### 1. Always Handle Errors

```typescript
// ❌ Bad: No error handling
const saveData = async () => {
  await storage.set('key', 'value');
};

// ✅ Good: Proper error handling
const saveData = async () => {
  try {
    await storage.set('key', 'value');
  } catch (error) {
    console.error('Failed to save:', error);
  }
};
```

### 2. Show User-Friendly Messages

```typescript
// ❌ Bad: Technical error message
catch (error) {
  alert(error.message); // "Invalid key: must be a non-empty string"
}

// ✅ Good: User-friendly message
catch (error) {
  if (isWidgetError(error)) {
    alert(error.getUserMessage()); // "Storage error. Failed to save or retrieve data."
  }
}
```

### 3. Log Errors for Debugging

```typescript
// ✅ Good: Log full error details
catch (error) {
  if (isWidgetError(error)) {
    console.error('Error details:', error.toJSON());
    alert(error.getUserMessage());
  }
}
```

### 4. Handle Rate Limiting

```typescript
// ✅ Good: Implement backoff for rate limits
const fetchWithRetry = async (fn: () => Promise<any>, retries = 3) => {
  try {
    return await fn();
  } catch (error) {
    if (isWidgetError(error) && error.type === WidgetErrorType.RATE_LIMIT_EXCEEDED) {
      if (retries > 0) {
        await new Promise(resolve => setTimeout(resolve, 1000));
        return fetchWithRetry(fn, retries - 1);
      }
    }
    throw error;
  }
};
```

### 5. Use ErrorBoundary

```typescript
// ✅ Good: Wrap your widget in ErrorBoundary
function App() {
  return (
    <ErrorBoundary>
      <MyWidget />
    </ErrorBoundary>
  );
}
```

## Common Error Scenarios

### Permission Denied

```typescript
try {
  const cpuUsage = await system.getCPU();
} catch (error) {
  if (isWidgetError(error) && error.type === WidgetErrorType.PERMISSION_DENIED) {
    // Show permission request UI
    showPermissionDialog('CPU access is required for this feature');
  }
}
```

### Rate Limit Exceeded

```typescript
try {
  const data = await system.getCPU();
} catch (error) {
  if (isWidgetError(error) && error.type === WidgetErrorType.RATE_LIMIT_EXCEEDED) {
    // Slow down requests
    console.warn('Rate limit exceeded, slowing down...');
    await new Promise(resolve => setTimeout(resolve, 1000));
  }
}
```

### Storage Error

```typescript
try {
  await storage.set('preferences', preferences);
} catch (error) {
  if (isWidgetError(error) && error.type === WidgetErrorType.STORAGE_ERROR) {
    // Show error to user
    showNotification('Failed to save preferences. Please try again.');
  }
}
```

## Development vs Production

### Development Mode

In development, the `ErrorBoundary` shows detailed error information:

```tsx
<details>
  <summary>Error Details (Development Only)</summary>
  <pre>{JSON.stringify(error.toJSON(), null, 2)}</pre>
</details>
```

### Production Mode

In production, only user-friendly messages are shown. Make sure to:

1. Log errors to a tracking service
2. Show user-friendly messages
3. Provide recovery options (retry, reset, etc.)

## Testing Error Handling

```typescript
import { render, screen } from '@testing-library/react';
import { ErrorBoundary, WidgetError, WidgetErrorType } from '@molecule/widget-sdk';

it('should catch and display errors', () => {
  const ThrowError = () => {
    throw new WidgetError(WidgetErrorType.WIDGET_CRASHED, 'Test error');
  };
  
  render(
    <ErrorBoundary>
      <ThrowError />
    </ErrorBoundary>
  );
  
  expect(screen.getByText(/widget error/i)).toBeInTheDocument();
});
```

## IPC Error Responses

When the Widget Container's IPC handlers encounter errors, they return standardized error responses:

### Response Format

**Success:**
```typescript
{
  success: true,
  data?: any  // Optional data payload
}
```

**Error:**
```typescript
{
  success: false,
  error: {
    type: WidgetErrorType,  // Error type enum
    message: string         // Error description
  }
}
```

### Automatic Conversion

The Widget SDK automatically converts IPC error responses to `WidgetError` instances:

```typescript
// IPC returns error response
{
  success: false,
  error: {
    type: 'STORAGE_ERROR',
    message: 'Invalid key: must be a non-empty string'
  }
}

// SDK converts to WidgetError
const error = new WidgetError(
  WidgetErrorType.STORAGE_ERROR,
  'Invalid key: must be a non-empty string'
);

// You can catch it normally
try {
  await storage.set('', 'value');
} catch (error) {
  if (isWidgetError(error)) {
    console.log(error.type); // 'STORAGE_ERROR'
  }
}
```

### Common IPC Errors

**Storage Operations:**
- Empty or invalid keys → `STORAGE_ERROR`
- Non-serializable values → `STORAGE_ERROR`

**UI Operations:**
- Invalid dimensions → `INVALID_CONFIG`
- Dimensions too small/large → `INVALID_CONFIG`
- Non-finite numbers → `INVALID_CONFIG`

**System API:**
- Missing permissions → `PERMISSION_DENIED`
- Too many requests → `RATE_LIMIT_EXCEEDED`

## Summary

- Use `WidgetError` for all widget-related errors
- Wrap API calls in try-catch blocks
- Use `ErrorBoundary` to catch React errors
- Show user-friendly messages with `getUserMessage()`
- Log errors for debugging with `toJSON()`
- Handle specific error types appropriately
- Test error handling thoroughly
- IPC errors are automatically converted to `WidgetError` instances
