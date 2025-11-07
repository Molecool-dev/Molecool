/**
 * Enhanced test script for permissions management system
 * Tests new features: validation, error handling, memory cleanup
 */

const { StorageManager } = require('./dist/main/storage');
const { PermissionsManager } = require('./dist/main/permissions');
const { WidgetError, WidgetErrorType } = require('./dist/types');

console.log('=== Testing Enhanced Permissions Features ===\n');

// Initialize storage and permissions manager
const storage = new StorageManager();
const permissions = new PermissionsManager(storage);

const testWidgetId = 'test-widget-enhanced';
let testsPassed = 0;
let testsFailed = 0;

// Helper to check if error is WidgetError
function isWidgetError(error) {
  return error && error.type && error.name === 'WidgetError';
}

function test(name, fn) {
  try {
    console.log(`Testing: ${name}`);
    fn();
    console.log('   ✓ PASSED\n');
    testsPassed++;
  } catch (error) {
    console.log(`   ✗ FAILED: ${error.message}\n`);
    testsFailed++;
  }
}

// Test 1: Invalid permission format should throw error
test('Invalid permission format throws WidgetError', () => {
  try {
    permissions.hasPermission(testWidgetId, 'invalid.permission');
    throw new Error('Should have thrown WidgetError');
  } catch (error) {
    if (!isWidgetError(error)) {
      throw new Error(`Expected WidgetError instance, got: ${error.constructor.name}`);
    }
    if (error.type !== WidgetErrorType.INVALID_CONFIG) {
      throw new Error(`Expected INVALID_CONFIG error type, got: ${error.type}`);
    }
  }
});

// Test 2: Invalid permission in savePermission should throw error
test('Invalid permission in savePermission throws WidgetError', () => {
  try {
    permissions.savePermission(testWidgetId, 'bad.format', true);
    throw new Error('Should have thrown WidgetError');
  } catch (error) {
    if (!isWidgetError(error)) {
      throw new Error('Expected WidgetError instance');
    }
  }
});

// Test 3: Valid permissions should work
test('Valid permissions work correctly', () => {
  permissions.savePermission(testWidgetId, 'systemInfo.cpu', true);
  const hasCpu = permissions.hasPermission(testWidgetId, 'systemInfo.cpu');
  if (!hasCpu) {
    throw new Error('Expected CPU permission to be granted');
  }
});

// Test 4: Rate limit with throwOnExceed option
test('Rate limit with throwOnExceed throws error', () => {
  const testWidget2 = 'test-widget-ratelimit';
  
  // Use up the rate limit
  for (let i = 0; i < 10; i++) {
    permissions.checkRateLimit(testWidget2, 'test:api', false);
  }
  
  // Next call should throw
  try {
    permissions.checkRateLimit(testWidget2, 'test:api', true);
    throw new Error('Should have thrown rate limit error');
  } catch (error) {
    if (!isWidgetError(error)) {
      throw new Error('Expected WidgetError instance');
    }
    if (error.type !== WidgetErrorType.RATE_LIMIT_EXCEEDED) {
      throw new Error('Expected RATE_LIMIT_EXCEEDED error type');
    }
    if (!error.widgetId || error.widgetId !== testWidget2) {
      throw new Error('Expected widgetId in error');
    }
  }
});

// Test 5: Memory cleanup doesn't break functionality
test('Memory cleanup works correctly', () => {
  const testWidget3 = 'test-widget-cleanup';
  
  // Create some rate limit entries
  permissions.checkRateLimit(testWidget3, 'api1', false);
  permissions.checkRateLimit(testWidget3, 'api2', false);
  
  // Clear rate limits
  permissions.clearRateLimits(testWidget3);
  
  // Should be able to make calls again
  const allowed = permissions.checkRateLimit(testWidget3, 'api1', false);
  if (!allowed) {
    throw new Error('Expected call to be allowed after cleanup');
  }
});

// Test 6: All valid permission formats
test('All valid permission formats work', () => {
  const testWidget4 = 'test-widget-formats';
  
  const validPermissions = [
    'systemInfo.cpu',
    'systemInfo.memory',
    'network'
  ];
  
  for (const perm of validPermissions) {
    permissions.savePermission(testWidget4, perm, true);
    const has = permissions.hasPermission(testWidget4, perm);
    if (!has) {
      throw new Error(`Expected ${perm} to be granted`);
    }
  }
});

// Test 7: Destroy method cleans up resources
test('Destroy method cleans up resources', () => {
  const pm = new PermissionsManager(storage);
  pm.destroy();
  // If no error thrown, cleanup worked
});

// Test 8: Edge case - empty widget ID
test('Empty widget ID handling', () => {
  const perms = permissions.getPermissions('');
  if (perms !== null) {
    throw new Error('Expected null for empty widget ID');
  }
});

// Test 9: Permission persistence after multiple saves
test('Permission persistence after multiple saves', () => {
  const testWidget5 = 'test-widget-persist';
  
  // Save multiple times
  permissions.savePermission(testWidget5, 'systemInfo.cpu', true);
  permissions.savePermission(testWidget5, 'systemInfo.cpu', false);
  permissions.savePermission(testWidget5, 'systemInfo.cpu', true);
  
  const hasCpu = permissions.hasPermission(testWidget5, 'systemInfo.cpu');
  if (!hasCpu) {
    throw new Error('Expected final permission state to be true');
  }
});

// Test 10: Rate limit per API isolation
test('Rate limits are isolated per API', () => {
  const testWidget6 = 'test-widget-isolation';
  
  // Max out api1
  for (let i = 0; i < 10; i++) {
    permissions.checkRateLimit(testWidget6, 'api1', false);
  }
  
  // api2 should still work
  const allowed = permissions.checkRateLimit(testWidget6, 'api2', false);
  if (!allowed) {
    throw new Error('Expected api2 to be allowed');
  }
  
  // api1 should be blocked
  const blocked = permissions.checkRateLimit(testWidget6, 'api1', false);
  if (blocked) {
    throw new Error('Expected api1 to be blocked');
  }
});

// Cleanup
permissions.destroy();

console.log('=== Test Summary ===');
console.log(`Total: ${testsPassed + testsFailed}`);
console.log(`Passed: ${testsPassed}`);
console.log(`Failed: ${testsFailed}`);

if (testsFailed === 0) {
  console.log('\n✓ All enhanced tests passed!');
  console.log('\nNew features verified:');
  console.log('  ✓ Permission format validation');
  console.log('  ✓ Error throwing with proper types');
  console.log('  ✓ Rate limit error with throwOnExceed');
  console.log('  ✓ Memory cleanup functionality');
  console.log('  ✓ Resource cleanup on destroy');
  process.exit(0);
} else {
  console.log('\n✗ Some tests failed');
  process.exit(1);
}
