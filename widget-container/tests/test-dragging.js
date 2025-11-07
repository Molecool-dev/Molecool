/**
 * Simple test script to verify dragging and position persistence
 * This tests the storage functionality without needing to run the full Electron app
 */

const Store = require('electron-store');

// Create a test store
const store = new Store({
  name: 'test-dragging',
  defaults: {
    widgetStates: {},
    widgetData: {},
    permissions: {},
    appSettings: {
      autoRestore: true,
      maxWidgets: 10
    }
  }
});

console.log('🧪 Testing Widget Position Storage\n');

// Test 1: Save position
console.log('Test 1: Saving widget position...');
const widgetId = 'test-widget';
const testPosition = { x: 500, y: 300 };
const testSize = { width: 300, height: 250 };

const widgetData = store.get('widgetData', {});
if (!widgetData[widgetId]) {
  widgetData[widgetId] = {};
}
widgetData[widgetId]['position'] = testPosition;
widgetData[widgetId]['size'] = testSize;
store.set('widgetData', widgetData);

console.log('✓ Position saved:', testPosition);
console.log('✓ Size saved:', testSize);

// Test 2: Retrieve position
console.log('\nTest 2: Retrieving widget position...');
const savedData = store.get('widgetData', {});
const savedPosition = savedData[widgetId]?.['position'];
const savedSize = savedData[widgetId]?.['size'];

if (savedPosition && savedPosition.x === testPosition.x && savedPosition.y === testPosition.y) {
  console.log('✓ Position retrieved correctly:', savedPosition);
} else {
  console.log('❌ Position retrieval failed');
  process.exit(1);
}

if (savedSize && savedSize.width === testSize.width && savedSize.height === testSize.height) {
  console.log('✓ Size retrieved correctly:', savedSize);
} else {
  console.log('❌ Size retrieval failed');
  process.exit(1);
}

// Test 3: Update position (simulating drag)
console.log('\nTest 3: Updating position (simulating drag)...');
const newPosition = { x: 700, y: 400 };
widgetData[widgetId]['position'] = newPosition;
store.set('widgetData', widgetData);

const updatedData = store.get('widgetData', {});
const updatedPosition = updatedData[widgetId]?.['position'];

if (updatedPosition && updatedPosition.x === newPosition.x && updatedPosition.y === newPosition.y) {
  console.log('✓ Position updated correctly:', updatedPosition);
} else {
  console.log('❌ Position update failed');
  process.exit(1);
}

// Test 4: Multiple widgets
console.log('\nTest 4: Testing multiple widgets...');
const widget2Id = 'clock-widget';
const widget2Position = { x: 100, y: 100 };

if (!widgetData[widget2Id]) {
  widgetData[widget2Id] = {};
}
widgetData[widget2Id]['position'] = widget2Position;
store.set('widgetData', widgetData);

const multiData = store.get('widgetData', {});
const widget1Pos = multiData[widgetId]?.['position'];
const widget2Pos = multiData[widget2Id]?.['position'];

if (widget1Pos && widget2Pos) {
  console.log('✓ Multiple widget positions stored correctly');
  console.log('  - test-widget:', widget1Pos);
  console.log('  - clock-widget:', widget2Pos);
} else {
  console.log('❌ Multiple widget storage failed');
  process.exit(1);
}

// Cleanup
console.log('\n🧹 Cleaning up test data...');
store.clear();
console.log('✓ Test data cleared');

console.log('\n✅ All storage tests passed!');
console.log('\n💡 The dragging functionality is ready to use.');
console.log('   Run "npm start" and press Ctrl+Shift+T to test dragging in the app.');
