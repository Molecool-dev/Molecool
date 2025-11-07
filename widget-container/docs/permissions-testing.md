# Permissions System Testing

## Overview

Comprehensive test suite for the permissions management system, covering permission dialogs, granting/denial, rate limiting, and unauthorized access prevention.

**Test File:** `widget-container/src/main/__tests__/permissions.test.ts`  
**Test Count:** 30+ tests  
**Status:** ✅ All tests passing

## Test Coverage

### 1. Permission Dialog Display (3 tests)

Tests that permission request dialogs are shown correctly with proper information.

**Test Cases:**
- ✅ Shows dialog with correct widget name and permission information
- ✅ Displays custom reason when provided
- ✅ Uses correct permission labels (CPU, memory, network)

**What's Tested:**
- Dialog type, title, and message format
- Widget name display
- Permission type descriptions
- Optional reason text
- Button labels ("Allow" / "Deny")

### 2. Permission Granting (4 tests)

Tests the flow when users grant permissions to widgets.

**Test Cases:**
- ✅ Grants permission when user clicks "Allow"
- ✅ Saves permission decision persistently
- ✅ Skips dialog if permission already granted
- ✅ Handles multiple permissions independently

**What's Tested:**
- Permission grant flow
- Storage persistence via `StorageManager.savePermissions()`
- Avoiding redundant dialogs
- Independent permission tracking

### 3. Permission Denial (4 tests)

Tests the flow when users deny permissions to widgets.

**Test Cases:**
- ✅ Denies permission when user clicks "Deny"
- ✅ Saves denial decision persistently
- ✅ Shows dialog again for previously denied permissions
- ✅ Blocks API access when permission is denied

**What's Tested:**
- Permission denial flow
- Persistent denial storage
- Re-prompting behavior for denied permissions
- API access blocking via `hasPermission()`

### 4. Rate Limiting (7 tests)

Tests the rate limiting system that prevents API abuse.

**Test Cases:**
- ✅ Allows up to 10 calls per second
- ✅ Blocks calls exceeding limit
- ✅ Throws error when `throwOnExceed=true`
- ✅ Resets rate limit after 1 second
- ✅ Tracks limits per widget independently
- ✅ Tracks limits per API independently
- ✅ Cleans up expired rate limit entries

**What's Tested:**
- Rate limit enforcement (10 calls/second)
- Blocking behavior
- Error throwing mode
- Time-based reset
- Per-widget isolation
- Per-API isolation
- Memory leak prevention

### 5. Unauthorized API Access (5 tests)

Tests that unauthorized API access is properly blocked.

**Test Cases:**
- ✅ Blocks access when no permissions exist
- ✅ Blocks access when specific permission not granted
- ✅ Validates permission format
- ✅ Rejects invalid permission strings
- ✅ Accepts valid permission strings

**What's Tested:**
- Access control enforcement
- Permission validation
- Format checking
- Invalid input rejection
- Valid input acceptance

### 6. Additional Coverage (7+ tests)

Tests for edge cases, resource management, and advanced scenarios.

**Test Cases:**
- ✅ Preserves existing permissions when adding new ones
- ✅ Handles network permissions correctly
- ✅ Cleans up resources on destroy
- ✅ Allows multiple destroy calls safely
- ✅ Handles concurrent permission requests
- ✅ Handles empty widget ID
- ✅ Clears rate limits for specific widget
- ✅ Resets all rate limits

**What's Tested:**
- Permission merging
- Network permission handling
- Resource cleanup
- Idempotent cleanup
- Concurrent operations
- Edge cases
- Manual rate limit management

## Running Tests

### Run All Permission Tests

```bash
cd widget-container
npm test -- permissions.test.ts
```

### Run Specific Test Suite

```bash
# Permission dialog tests
npm test -- permissions.test.ts -t "Permission Dialog Display"

# Rate limiting tests
npm test -- permissions.test.ts -t "Rate Limiting"

# Unauthorized access tests
npm test -- permissions.test.ts -t "Unauthorized API Access"
```

### Run Single Test

```bash
npm test -- permissions.test.ts -t "should show permission dialog with correct information"
```

## Test Architecture

### Mocking Strategy

**Electron Dialog:**
```typescript
jest.mock('electron', () => ({
  dialog: {
    showMessageBox: jest.fn()
  }
}));
```

**Storage Manager:**
```typescript
storageManager = {
  savePermissions: jest.fn(),
  getPermissions: jest.fn().mockReturnValue(null)
} as any;
```

### Test Setup

Each test:
1. Creates mock `StorageManager`
2. Initializes `PermissionsManager` with mock
3. Resets dialog mock
4. Runs test
5. Cleans up via `destroy()`

### Assertions

Tests verify:
- Function return values
- Mock function calls
- Call arguments
- Error throwing
- State changes
- Timing behavior

## Integration with Manual Testing

These automated tests complement the manual testing in Task 37.2:

**Automated Tests Cover:**
- ✅ Permission dialog content and format
- ✅ Permission storage and retrieval
- ✅ Rate limiting logic
- ✅ Access control enforcement
- ✅ Edge cases and error conditions

**Manual Tests Cover:**
- Visual appearance of dialogs
- User interaction flow
- Cross-platform behavior
- Real widget integration
- Performance under load

See `docs/MANUAL_TESTING_GUIDE.md` for manual test procedures.

## Key Features Tested

### Permission Validation

```typescript
// Valid permissions
'systemInfo.cpu'
'systemInfo.memory'
'network'

// Invalid permissions (rejected)
'systemInfo'
'systemInfo.invalid'
'network.enabled'
```

### Rate Limiting

- **Limit:** 10 calls per second per widget per API
- **Tracking:** Per-widget, per-API isolation
- **Reset:** Automatic after 1 second
- **Cleanup:** Expired entries removed every 5 minutes
- **Manual:** `clearRateLimits()` and `resetAllRateLimits()`

### Resource Management

```typescript
// Automatic cleanup
permissionsManager.destroy();

// Safe multiple calls
permissionsManager.destroy();
permissionsManager.destroy(); // No error
```

### Error Handling

```typescript
// Permission denied
{ success: false, error: { type: 'PERMISSION_DENIED', message: '...' } }

// Rate limit exceeded
{ success: false, error: { type: 'RATE_LIMIT_EXCEEDED', message: '...' } }

// Invalid config
{ success: false, error: { type: 'INVALID_CONFIG', message: '...' } }
```

## Test Maintenance

### Adding New Tests

1. Add test case to appropriate `describe` block
2. Follow existing naming convention
3. Use proper setup/teardown
4. Update test count in documentation

### Updating Tests

When modifying `PermissionsManager`:
1. Update affected tests
2. Add tests for new functionality
3. Verify all tests pass
4. Update documentation

### Test Quality

All tests follow best practices:
- ✅ Clear, descriptive names
- ✅ Single responsibility
- ✅ Independent execution
- ✅ Proper cleanup
- ✅ Fast execution (< 100ms each)
- ✅ Meaningful assertions

## Related Documentation

- [Permissions API Guide](./permissions-api.md) - API usage and integration
- [Testing Guide](./testing.md) - Overall testing strategy
- [Manual Testing Guide](./MANUAL_TESTING_GUIDE.md) - Manual test procedures
- [IPC Integration Tests](./ipc-integration.md) - IPC communication tests

## Troubleshooting

### Tests Failing

**Check:**
1. Mock setup is correct
2. Async operations are awaited
3. Cleanup is called
4. No test interdependencies

**Debug:**
```bash
# Run with verbose output
npm test -- permissions.test.ts --verbose

# Run single test
npm test -- permissions.test.ts -t "test name"
```

### Rate Limit Tests Flaky

Rate limit tests use timing:
- Wait 1100ms for reset (1000ms + buffer)
- Cleanup between tests prevents interference
- Tests are isolated per widget/API

### Mock Not Working

Verify mock is:
- Defined before imports
- Reset in `beforeEach`
- Configured correctly for test case

## Future Enhancements

Potential additions:
- [ ] Permission revocation tests
- [ ] Permission expiration tests
- [ ] Bulk permission operations
- [ ] Permission migration tests
- [ ] Performance benchmarks

---

**Last Updated:** 2025-11-07  
**Test File:** `src/main/__tests__/permissions.test.ts`  
**Status:** ✅ Complete (30+ tests passing)
