# Protocol Handler Improvements

## Overview
This document describes the critical improvements made to the `widget://` protocol handler in `main.ts`.

## Critical Improvements Implemented

### 1. Security: Widget ID Validation
**Problem**: Original code didn't validate widget ID format, allowing potential path traversal and injection attacks.

**Solution**: Added `isValidWidgetId()` function with strict validation:
- Only alphanumeric characters, hyphens, and underscores allowed
- Maximum length of 100 characters
- Rejects path traversal attempts (`../`, `..\\`)
- Rejects special characters that could be used for injection

**Implementation**:
```typescript
function isValidWidgetId(widgetId: string): boolean {
  return /^[a-zA-Z0-9_-]+$/.test(widgetId) && widgetId.length > 0 && widgetId.length <= 100;
}
```

**Impact**: Prevents malicious widget IDs from being processed.

### 2. Non-Blocking Error Dialogs
**Problem**: Original code used `dialog.showErrorBox()` which blocks the main process and can freeze the UI.

**Solution**: Replaced all `dialog.showErrorBox()` calls with `dialog.showMessageBox()`:
- Non-blocking, returns a Promise
- Better user experience
- Prevents UI freezing
- Consistent async/await pattern throughout

**Example**:
```typescript
await dialog.showMessageBox({
  type: 'error',
  title: 'Invalid Widget ID',
  message: 'The widget ID contains invalid characters.',
  detail: 'Widget IDs must be alphanumeric with hyphens or underscores only.'
});
```

**Impact**: Improved responsiveness and user experience.

### 3. Race Condition Prevention
**Problem**: Protocol handler could be called before app is ready, causing crashes.

**Solution**: Added `app.whenReady()` check at the start of `handleProtocolUrl()`:
```typescript
if (!app.isReady()) {
  console.log('App not ready yet, waiting...');
  await app.whenReady();
}
```

**Impact**: Prevents crashes when protocol URLs are opened during app startup.

### 4. Correct URL Parsing
**Problem**: Original code didn't account for how custom protocols parse URLs.

**Solution**: Updated URL parsing to combine host and pathname:
```typescript
// For custom protocols: widget://install/clock
// urlObj.host = "install"
// urlObj.pathname = "/clock"
const fullPath = urlObj.host + urlObj.pathname;
const pathParts = fullPath.split('/').filter(part => part.length > 0);
```

**Impact**: Correctly extracts action and widget ID from protocol URLs.

### 5. Code Organization
**Problem**: Original code had all logic in one large function.

**Solution**: Extracted `handleWidgetInstall()` function:
- Separates concerns (URL parsing vs. installation logic)
- Easier to test and maintain
- Prepares for Task 30 implementation

**Impact**: Improved code maintainability and readability.

### 6. Better Error Messages
**Problem**: Generic error messages didn't help users understand what went wrong.

**Solution**: Added specific error messages for each failure case:
- Invalid protocol
- Invalid URL format
- Invalid widget ID format
- Unknown action
- General parsing errors

**Impact**: Better user experience and easier debugging.

## Testing

Created `verify-protocol-handler.js` with 19 test cases:
- 8 widget ID validation tests
- 11 URL parsing tests
- All tests passing ✅

Test coverage includes:
- Valid widget IDs (alphanumeric, hyphens, underscores)
- Invalid widget IDs (spaces, special chars, path traversal)
- Valid protocol URLs
- Invalid protocols
- Malformed URLs
- Security attack patterns (XSS, path traversal)

## Security Considerations

### Prevented Attack Vectors:
1. **Path Traversal**: `../../../etc/passwd` → Rejected by validation
2. **XSS Attempts**: `<script>alert("xss")</script>` → Rejected by validation
3. **Command Injection**: `widget; rm -rf /` → Rejected by validation
4. **Directory Traversal**: `..\\..\\windows\\system32` → Rejected by validation

### Defense in Depth:
1. Widget ID validation (first line of defense)
2. URL parsing normalization (second line)
3. File system operations will use path.join() (third line)

## Future Enhancements (Task 30)

The protocol handler is now ready for Task 30 implementation:
```typescript
// TODO in handleWidgetInstall():
await widgetManager.installWidget(widgetId);
```

The `installWidget()` method should:
1. Fetch widget metadata from Marketplace API
2. Download widget package (.zip)
3. Verify package integrity
4. Extract to widgets directory
5. Validate widget.config.json
6. Show success/failure dialog

## Performance

- Non-blocking dialogs prevent UI freezing
- Validation happens early (fail fast)
- Minimal overhead (regex validation is fast)

## Compatibility

- Works on Windows (second-instance event)
- Works on macOS (open-url event)
- Handles both development and production modes

## References

- Task 29: Implement custom URL protocol
- Task 30: Implement widget download and installation (next)
- Requirement 6.5: Deep linking from Marketplace
