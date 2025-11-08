# Security Configuration

This document describes the security features implemented in the Molecool Widget Container, including Content Security Policy (CSP) and network filtering.

## Overview

The SecurityManager (`src/main/security.ts`) implements two key security features:

1. **Content Security Policy (CSP)** - Restricts what resources widgets can load
2. **Network Filtering** - Enforces HTTPS-only connections

The SecurityManager is initialized at app startup and must be active before any widget windows are created to ensure all security policies are enforced from the beginning.

## Content Security Policy (CSP)

### Base CSP Configuration

All widget windows have a strict CSP applied by default:

```
default-src 'none';
script-src 'self';
style-src 'self' 'unsafe-inline';
img-src 'self' data: https:;
font-src 'self';
connect-src 'self'
```

### CSP Directives Explained

- **default-src 'none'**: Blocks all resources by default
- **script-src 'self'**: Only allows scripts from the widget's own origin
- **style-src 'self' 'unsafe-inline'**: Allows styles from widget origin and inline styles (needed for dynamic styling)
- **img-src 'self' data: https:**: Allows images from widget origin, data URLs, and HTTPS sources
- **font-src 'self'**: Only allows fonts from widget origin
- **connect-src 'self'**: Only allows network requests to widget origin (modified dynamically)

### Dynamic CSP Based on Widget Permissions

When a widget declares network permissions in its `widget.config.json`, the SecurityManager dynamically adds allowed domains to the `connect-src` directive:

```json
{
  "permissions": {
    "network": {
      "enabled": true,
      "allowedDomains": [
        "https://api.openweathermap.org",
        "api.example.com"
      ]
    }
  }
}
```

The SecurityManager automatically normalizes domains:
- Domains without protocol are prefixed with `https://`
- HTTP domains are rejected for security
- Only HTTPS domains are added to CSP

This results in:

```
connect-src 'self' https://api.openweathermap.org https://api.example.com
```

**Note**: The current implementation adds allowed domains from all registered widgets to the CSP. In a more sophisticated implementation, CSP could be scoped per-widget window.

### How CSP is Applied

1. SecurityManager registers a `webRequest.onHeadersReceived` listener
2. For each HTTP response, it builds a CSP string based on registered widgets
3. The CSP header is injected into the response headers
4. The browser enforces the CSP, blocking unauthorized resources

## Network Filtering (HTTPS Only)

### Purpose

Prevents widgets from making insecure HTTP requests, enforcing HTTPS-only connections.

### Implementation

The SecurityManager registers a `webRequest.onBeforeRequest` listener that:

1. Parses the URL of each outgoing request
2. Blocks HTTP requests (except localhost for development)
3. Allows HTTPS, file://, data:, and devtools protocols
4. Logs blocked requests for debugging

### Allowed Protocols

- **https://**: Secure HTTP connections (allowed)
- **file://**: Local widget files (allowed)
- **data:**: Inline data URLs (allowed)
- **devtools://**: Chrome DevTools (allowed)
- **http://localhost**: Development server (allowed)
- **http://127.0.0.1**: Development server (allowed)
- **http://**: Insecure HTTP (blocked)

### Example

```javascript
// ✅ Allowed
fetch('https://api.example.com/data');

// ❌ Blocked (unless localhost)
fetch('http://api.example.com/data');
```

## Usage

### Initialization

The SecurityManager is initialized in `main.ts` when the app starts:

```typescript
import { SecurityManager } from './security';

const securityManager = new SecurityManager();

app.whenReady().then(() => {
  // Initialize security first
  securityManager.initialize();
  
  // ... rest of app initialization
});
```

### Widget Registration

When a widget is created, register it with the SecurityManager to include its allowed domains in CSP:

```typescript
// In WidgetManager.createWidget()
if (this.securityManager) {
  this.securityManager.registerWidget(config.id, config);
}
```

The SecurityManager stores the widget configuration and uses it to build dynamic CSP headers.

### Widget Unregistration

When a widget is closed, unregister it to clean up:

```typescript
// In WidgetManager.closeWidget()
if (this.securityManager) {
  this.securityManager.unregisterWidget(widget.widgetId);
}
```

This removes the widget's configuration from the SecurityManager's internal map.

### Cleanup

On app shutdown, the SecurityManager is cleaned up:

```typescript
app.on('will-quit', () => {
  securityManager.destroy();
});
```

## Security Best Practices

### For Widget Developers

1. **Declare all network domains**: List all external APIs in `widget.config.json`
2. **Use HTTPS only**: Never use HTTP URLs (except localhost for dev)
3. **Minimize permissions**: Only request network access if needed
4. **Validate data**: Always validate data from external APIs
5. **Avoid inline scripts**: Use external script files when possible

### For Platform Developers

1. **Keep CSP strict**: Don't relax CSP directives without careful consideration
2. **Audit widget configs**: Review widget permissions before approval
3. **Monitor blocked requests**: Check logs for suspicious activity
4. **Update security policies**: Keep up with security best practices
5. **Test thoroughly**: Verify CSP and network filtering work correctly

## API Reference

### SecurityManager Class

```typescript
class SecurityManager {
  // Initialize security policies (CSP and network filtering)
  initialize(): void;
  
  // Register a widget configuration for CSP
  registerWidget(widgetId: string, config: WidgetConfig): void;
  
  // Unregister a widget configuration
  unregisterWidget(widgetId: string): void;
  
  // Clean up security manager (removes listeners)
  destroy(): void;
}
```

### Internal Methods

```typescript
// Set up CSP headers via webRequest.onHeadersReceived
private setupCSP(): void;

// Build CSP string based on registered widgets
private buildCSP(details: OnHeadersReceivedListenerDetails): string;

// Get allowed domains for a specific request
private getAllowedDomainsForRequest(details: OnHeadersReceivedListenerDetails): string[];

// Set up network filtering via webRequest.onBeforeRequest
private setupNetworkFiltering(): void;

// Determine if a request should be blocked
private shouldBlockRequest(details: OnBeforeRequestListenerDetails): boolean;
```

## Testing

### Unit Tests

Security tests are located in `src/main/__tests__/security.test.ts`:

```bash
npm test -- security.test.ts
```

The test suite includes 20 comprehensive tests covering:
- CSP initialization and header injection
- Dynamic CSP based on widget permissions
- Domain normalization (adding https://)
- HTTP domain rejection
- Network filtering (HTTPS-only)
- Protocol allowlist (file://, data://, devtools://)
- Localhost exception for development
- Widget registration and unregistration
- Cleanup and resource management
- Error handling for malformed URLs

### Manual Testing

1. **Test CSP blocking**:
   - Create a widget that tries to load an unauthorized script
   - Verify it's blocked by CSP
   - Check browser console for CSP violations

2. **Test network filtering**:
   - Create a widget that makes an HTTP request
   - Verify it's blocked (unless localhost)
   - Check logs for blocked request messages

3. **Test allowed domains**:
   - Create a widget with network permissions
   - Make requests to allowed domains
   - Verify they succeed

## Troubleshooting

### CSP Violations

If you see CSP violations in the console:

1. Check the widget's `widget.config.json` for missing permissions
2. Verify the domain is listed in `allowedDomains`
3. Ensure the domain uses HTTPS (not HTTP)
4. Check if the resource type is allowed by CSP

### Blocked Requests

If network requests are blocked:

1. Check if the URL uses HTTPS
2. Verify the domain is in the widget's `allowedDomains`
3. Check the SecurityManager logs for details
4. For development, use localhost or 127.0.0.1

### CSP Not Applied

If CSP doesn't seem to be working:

1. Verify SecurityManager is initialized before creating widgets
2. Check that widgets are registered with SecurityManager
3. Look for errors in the main process logs
4. Ensure Electron's session API is available

## Requirements Satisfied

This implementation satisfies the following requirements:

- **Requirement 2.3**: Content Security Policy configuration
- **Requirement 2.5**: HTTPS-only network requests

## Implementation Notes

### Memory Management

The SecurityManager maintains an internal `Map<string, WidgetConfig>` to track registered widgets. This map is automatically cleaned up when:
- Widgets are closed (via `unregisterWidget()`)
- The app shuts down (via `destroy()`)

### Electron Limitations

Electron's `webRequest` API doesn't provide a way to remove individual listeners. All listeners are automatically cleaned up when the session is destroyed (on app quit).

### CSP Scope

The current implementation applies CSP globally to all widgets. This means:
- All registered widgets' allowed domains are included in every CSP header
- A widget can potentially access domains allowed by other widgets
- This is a trade-off for simplicity and performance

For stricter isolation, future versions could:
- Track which window made each request
- Apply per-widget CSP based on the requesting window
- Use separate sessions for each widget

## Future Enhancements

Potential improvements for future versions:

1. **Per-widget CSP**: Different CSP for each widget window based on its specific permissions
2. **CSP reporting**: Collect and analyze CSP violations using report-uri directive
3. **Stricter policies**: Remove 'unsafe-inline' from style-src (requires refactoring widget styles)
4. **Certificate pinning**: Pin certificates for critical APIs
5. **Request logging**: Log all network requests for security audit
6. **Domain-specific rate limiting**: Limit requests per widget per domain (in addition to API rate limiting)
7. **Subresource Integrity**: Verify integrity of external resources using SRI hashes
8. **Separate sessions**: Use separate Electron sessions for each widget for complete isolation
