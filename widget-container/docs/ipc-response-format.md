# IPC Response Format Guide

## Standard Response Format

All IPC handlers now return a consistent response format:

```typescript
interface IPCResponse<T = any> {
  success: boolean;
  data?: T;
  error?: {
    type: WidgetErrorType;
    message: string;
  };
}
```

## Success Response

When an operation succeeds:

```typescript
{
  success: true,
  data: <result>  // Optional, depends on the operation
}
```

### Examples

```typescript
// Storage get
{
  success: true,
  data: "stored-value"
}

// Storage set
{
  success: true
}

// System CPU (from main process)
{
  success: true,
  data: {
    usage: 45.23,
    cores: 8
  }
}

// System CPU (exposed to widgets via preload)
// Note: Preload extracts only the usage number
{
  success: true,
  data: 45.23  // Just the usage percentage
}

// Widget list
{
  success: true,
  data: [
    { instanceId: "...", widgetId: "...", ... },
    { instanceId: "...", widgetId: "...", ... }
  ]
}
```

## Error Response

When an operation fails:

```typescript
{
  success: false,
  error: {
    type: WidgetErrorType,
    message: "Human-readable error message"
  }
}
```

### Error Types

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

### Examples

```typescript
// Permission denied
{
  success: false,
  error: {
    type: "PERMISSION_DENIED",
    message: "CPU access permission denied by user"
  }
}

// Rate limit exceeded
{
  success: false,
  error: {
    type: "RATE_LIMIT_EXCEEDED",
    message: "Too many requests. Please slow down."
  }
}

// Invalid input
{
  success: false,
  error: {
    type: "INVALID_CONFIG",
    message: "Window dimensions must be at least 100x100"
  }
}

// Storage error
{
  success: false,
  error: {
    type: "STORAGE_ERROR",
    message: "Invalid key: must be a non-empty string"
  }
}
```

## Handling Responses in Renderer

### Basic Pattern

```typescript
const response = await window.widgetAPI.storage.get('myKey');

if (response.success) {
  console.log('Value:', response.data);
} else {
  console.error('Error:', response.error.message);
  
  // Handle specific error types
  switch (response.error.type) {
    case 'PERMISSION_DENIED':
      // Show permission request UI
      break;
    case 'RATE_LIMIT_EXCEEDED':
      // Slow down requests
      break;
    case 'STORAGE_ERROR':
      // Handle storage error
      break;
  }
}
```

### With TypeScript

```typescript
interface MyData {
  count: number;
  lastUpdate: string;
}

const response = await window.widgetAPI.storage.get<MyData>('myData');

if (response.success && response.data) {
  // TypeScript knows response.data is MyData
  console.log('Count:', response.data.count);
}
```

### Error Handling Helper

```typescript
function handleIPCError(error: { type: string; message: string }): void {
  switch (error.type) {
    case 'PERMISSION_DENIED':
      showNotification('Permission denied. Please grant access in settings.');
      break;
    case 'RATE_LIMIT_EXCEEDED':
      showNotification('Too many requests. Please wait a moment.');
      break;
    case 'INVALID_CONFIG':
      showNotification('Invalid configuration: ' + error.message);
      break;
    default:
      showNotification('An error occurred: ' + error.message);
  }
}

// Usage
const response = await window.widgetAPI.system.getCPU();
if (!response.success) {
  handleIPCError(response.error);
}
```

## Input Validation Rules

### Storage Operations
- **Key**: Must be non-empty string
- **Value**: Any JSON-serializable value

### UI Operations
- **Width/Height**: 
  - Must be numbers
  - Must be finite (not NaN or Infinity)
  - Range: 100-2000 pixels
- **X/Y Coordinates**:
  - Must be numbers
  - Must be finite (not NaN or Infinity)

### Widget Operations
- **Widget ID**: Must be non-empty string
- **Instance ID**: Must be non-empty string

## Migration Guide

If you have existing code that doesn't check the response format:

### Before
```typescript
// Unsafe - assumes success
const value = await window.widgetAPI.storage.get('key');
console.log(value);
```

### After
```typescript
// Safe - checks response
const response = await window.widgetAPI.storage.get('key');
if (response.success) {
  console.log(response.data);
} else {
  console.error('Failed to get value:', response.error.message);
}
```

## Testing

The IPC response format is thoroughly tested in the integration test suite:

**Test File**: `widget-container/__tests__/ipc-integration.test.ts`

**Coverage**: 20 test scenarios including:
- Storage API success and error responses
- System API with permission flows
- Settings API responses
- UI API validation and error handling
- Cross-API integration scenarios

**Run Tests**:
```bash
npm test -- ipc-integration.test.ts
```

**Key Test Scenarios**:
- ✅ Success responses include `success: true` and `data` field
- ✅ Error responses include `success: false` and `error` object
- ✅ Error objects contain `type` and `message` fields
- ✅ Error types match `WidgetErrorType` enum values
- ✅ Validation errors return appropriate error types
- ✅ Permission flows integrate correctly with response format
- ✅ Rate limiting returns `RATE_LIMIT_EXCEEDED` error type

## Best Practices

1. **Always check `success` field** before accessing `data`
2. **Handle errors gracefully** - show user-friendly messages
3. **Use TypeScript generics** for type-safe data access
4. **Log errors** for debugging but don't expose technical details to users
5. **Implement retry logic** for rate limit errors
6. **Cache data** to reduce IPC calls and avoid rate limits

## Common Pitfalls

❌ **Don't assume success**
```typescript
const value = response.data; // Might be undefined!
```

✅ **Check success first**
```typescript
const value = response.success ? response.data : null;
```

❌ **Don't ignore error types**
```typescript
if (!response.success) {
  alert(response.error.message); // Generic handling
}
```

✅ **Handle specific error types**
```typescript
if (!response.success) {
  switch (response.error.type) {
    case 'PERMISSION_DENIED':
      // Request permission
      break;
    case 'RATE_LIMIT_EXCEEDED':
      // Implement backoff
      break;
    default:
      alert(response.error.message);
  }
}
```
