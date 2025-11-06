/**
 * Test script for Widget State Management (Task 12)
 * 
 * This script tests the saveWidgetState and restoreWidgets functionality
 * Run with: node test-state-management.js
 */

const { app, BrowserWindow } = require('electron');
const path = require('path');
const fs = require('fs');

// Import the classes we need to test
const { WindowController } = require('./dist/main/window-controller');
const { StorageManager } = require('./dist/main/storage');
const { WidgetManager } = require('./dist/main/widget-manager');

let testResults = [];

function log(message, isError = false) {
  const prefix = isError ? '❌ ERROR:' : '✅';
  console.log(`${prefix} ${message}`);
  testResults.push({ message, isError });
}

async function runTests() {
  console.log('\n=== Widget State Management Tests ===\n');

  try {
    // Initialize components
    const windowController = new WindowController();
    const storageManager = new StorageManager();
    const widgetManager = new WidgetManager(windowController, storageManager);

    // Test 1: Check if methods exist
    console.log('Test 1: Verify methods exist');
    if (typeof widgetManager.saveWidgetState === 'function') {
      log('saveWidgetState method exists');
    } else {
      log('saveWidgetState method missing', true);
    }

    if (typeof widgetManager.restoreWidgets === 'function') {
      log('restoreWidgets method exists');
    } else {
      log('restoreWidgets method missing', true);
    }

    if (typeof widgetManager.saveAllWidgetStates === 'function') {
      log('saveAllWidgetStates method exists');
    } else {
      log('saveAllWidgetStates method missing', true);
    }

    // Test 2: Check storage structure
    console.log('\nTest 2: Verify storage structure');
    const store = storageManager['store'];
    const widgetStates = store.get('widgetStates', {});
    const appSettings = store.get('appSettings', {});
    
    log(`Storage initialized with widgetStates: ${typeof widgetStates === 'object'}`);
    log(`Auto-restore setting: ${appSettings.autoRestore}`);
    log(`Max widgets setting: ${appSettings.maxWidgets}`);

    // Test 3: Test restoreWidgets with no saved state
    console.log('\nTest 3: Test restoreWidgets with no saved widgets');
    try {
      await widgetManager.restoreWidgets();
      log('restoreWidgets completed without errors (no widgets to restore)');
    } catch (error) {
      log(`restoreWidgets failed: ${error.message}`, true);
    }

    // Test 4: Test saveAllWidgetStates with no running widgets
    console.log('\nTest 4: Test saveAllWidgetStates with no running widgets');
    try {
      await widgetManager.saveAllWidgetStates();
      log('saveAllWidgetStates completed without errors (no running widgets)');
    } catch (error) {
      log(`saveAllWidgetStates failed: ${error.message}`, true);
    }

    // Test 5: Check widgets directory
    console.log('\nTest 5: Verify widgets directory');
    const widgetsDir = widgetManager.getWidgetsDirectory();
    log(`Widgets directory: ${widgetsDir}`);
    
    if (fs.existsSync(widgetsDir)) {
      log('Widgets directory exists');
      
      // Check for test widgets
      const testWidgetPath = path.join(widgetsDir, 'test-clock');
      if (fs.existsSync(testWidgetPath)) {
        log('Test widget (test-clock) found');
        
        // Test 6: Try to create and save a widget
        console.log('\nTest 6: Create widget and test state saving');
        try {
          const instanceId = await widgetManager.createWidget('test-clock');
          log(`Widget created with instance ID: ${instanceId}`);
          
          // Save the widget state
          await widgetManager.saveWidgetState(instanceId);
          log('Widget state saved successfully');
          
          // Verify state was saved
          const savedState = storageManager.getWidgetState(instanceId);
          if (savedState) {
            log('Saved state retrieved successfully');
            log(`  - Widget ID: ${savedState.widgetId}`);
            log(`  - Position: (${savedState.position.x}, ${savedState.position.y})`);
            log(`  - Size: ${savedState.size.width}x${savedState.size.height}`);
            log(`  - Is Running: ${savedState.isRunning}`);
          } else {
            log('Failed to retrieve saved state', true);
          }
          
          // Close the widget
          await widgetManager.closeWidget(instanceId);
          log('Widget closed successfully');
          
          // Verify state was updated
          const closedState = storageManager.getWidgetState(instanceId);
          if (closedState && !closedState.isRunning) {
            log('Widget state correctly marked as not running');
          } else {
            log('Widget state not correctly updated after close', true);
          }
        } catch (error) {
          log(`Widget creation/state test failed: ${error.message}`, true);
        }
      } else {
        log('Test widget not found - skipping widget creation test');
        log('To run full tests, copy test-widgets/test-clock to the widgets directory');
      }
    } else {
      log('Widgets directory does not exist yet (will be created on first use)');
    }

    // Print summary
    console.log('\n=== Test Summary ===\n');
    const passed = testResults.filter(r => !r.isError).length;
    const failed = testResults.filter(r => r.isError).length;
    console.log(`Passed: ${passed}`);
    console.log(`Failed: ${failed}`);
    console.log(`Total: ${testResults.length}`);

    if (failed === 0) {
      console.log('\n✅ All tests passed!\n');
    } else {
      console.log('\n❌ Some tests failed. See details above.\n');
    }

  } catch (error) {
    console.error('Test suite failed:', error);
  }

  // Quit the app
  app.quit();
}

// Run tests when app is ready
app.whenReady().then(runTests);

// Handle errors
app.on('window-all-closed', () => {
  // Don't quit on window close during tests
});

process.on('unhandledRejection', (error) => {
  console.error('Unhandled rejection:', error);
  app.quit();
});
