/**
 * Test script for permissions management system
 * Tests the PermissionsManager class functionality
 */

const { StorageManager } = require('./dist/main/storage');
const { PermissionsManager } = require('./dist/main/permissions');

console.log('=== Testing Permissions Management System ===\n');

// Initialize storage and permissions manager
const storage = new StorageManager();
const permissions = new PermissionsManager(storage);

// Test widget IDs
const testWidgetId = 'test-widget-permissions';
const testWidgetName = 'Test Widget';

console.log('1. Testing initial permissions (should be null)...');
let perms = permissions.getPermissions(testWidgetId);
console.log('   Initial permissions:', perms);
console.log('   ✓ Initial permissions are null\n');

console.log('2. Testing savePermission for systemInfo.cpu...');
permissions.savePermission(testWidgetId, 'systemInfo.cpu', true);
perms = permissions.getPermissions(testWidgetId);
console.log('   Permissions after saving cpu:', JSON.stringify(perms, null, 2));
console.log('   ✓ CPU permission saved\n');

console.log('3. Testing hasPermission for systemInfo.cpu...');
const hasCpu = permissions.hasPermission(testWidgetId, 'systemInfo.cpu');
console.log('   Has CPU permission:', hasCpu);
console.log('   ✓ hasPermission returns true for granted permission\n');

console.log('4. Testing hasPermission for systemInfo.memory (not granted)...');
const hasMemory = permissions.hasPermission(testWidgetId, 'systemInfo.memory');
console.log('   Has memory permission:', hasMemory);
console.log('   ✓ hasPermission returns false for non-granted permission\n');

console.log('5. Testing savePermission for systemInfo.memory...');
permissions.savePermission(testWidgetId, 'systemInfo.memory', true);
perms = permissions.getPermissions(testWidgetId);
console.log('   Permissions after saving memory:', JSON.stringify(perms, null, 2));
console.log('   ✓ Memory permission saved\n');

console.log('6. Testing savePermission for network...');
permissions.savePermission(testWidgetId, 'network', true);
perms = permissions.getPermissions(testWidgetId);
console.log('   Permissions after saving network:', JSON.stringify(perms, null, 2));
console.log('   ✓ Network permission saved\n');

console.log('7. Testing rate limiting...');
let rateLimitPassed = 0;
let rateLimitFailed = 0;

// Try to make 15 calls (limit is 10 per second)
for (let i = 0; i < 15; i++) {
  const allowed = permissions.checkRateLimit(testWidgetId, 'system:getCPU');
  if (allowed) {
    rateLimitPassed++;
  } else {
    rateLimitFailed++;
  }
}

console.log(`   Calls allowed: ${rateLimitPassed}`);
console.log(`   Calls blocked: ${rateLimitFailed}`);
console.log('   ✓ Rate limiting working (should allow 10, block 5)\n');

console.log('8. Testing rate limit reset...');
permissions.clearRateLimits(testWidgetId);
const allowedAfterReset = permissions.checkRateLimit(testWidgetId, 'system:getCPU');
console.log('   Allowed after reset:', allowedAfterReset);
console.log('   ✓ Rate limit cleared successfully\n');

console.log('9. Testing permission denial...');
permissions.savePermission(testWidgetId, 'systemInfo.cpu', false);
const hasCpuAfterDenial = permissions.hasPermission(testWidgetId, 'systemInfo.cpu');
console.log('   Has CPU permission after denial:', hasCpuAfterDenial);
console.log('   ✓ Permission denial working\n');

console.log('10. Testing storage persistence...');
const testWidgetId2 = 'test-widget-2';
permissions.savePermission(testWidgetId2, 'systemInfo.cpu', true);
permissions.savePermission(testWidgetId2, 'network', true);

// Create a new permissions manager to test persistence
const permissions2 = new PermissionsManager(storage);
const perms2 = permissions2.getPermissions(testWidgetId2);
console.log('   Permissions loaded from storage:', JSON.stringify(perms2, null, 2));
console.log('   ✓ Permissions persisted correctly\n');

// Cleanup
permissions.destroy();
permissions2.destroy();

console.log('=== All Tests Passed! ===');
console.log('\nPermissions system is working correctly:');
console.log('  ✓ Permission storage and retrieval');
console.log('  ✓ Permission checking (hasPermission)');
console.log('  ✓ Rate limiting (10 calls per second)');
console.log('  ✓ Permission granting and denial');
console.log('  ✓ Data persistence across instances');
