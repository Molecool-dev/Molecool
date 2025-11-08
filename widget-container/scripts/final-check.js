/**
 * Final System Check Script
 * Verifies all requirements and identifies critical bugs
 */

const fs = require('fs');
const path = require('path');

// ANSI color codes
const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m'
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

function checkmark() {
  return `${colors.green}✓${colors.reset}`;
}

function crossmark() {
  return `${colors.red}✗${colors.reset}`;
}

function warning() {
  return `${colors.yellow}⚠${colors.reset}`;
}

// Check results storage
const results = {
  passed: [],
  failed: [],
  warnings: []
};

function pass(message) {
  results.passed.push(message);
  log(`${checkmark()} ${message}`, 'green');
}

function fail(message) {
  results.failed.push(message);
  log(`${crossmark()} ${message}`, 'red');
}

function warn(message) {
  results.warnings.push(message);
  log(`${warning()} ${message}`, 'yellow');
}

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

/**
 * Safely read file content with error handling
 */
function readFileSafe(filePath) {
  try {
    return fs.readFileSync(filePath, 'utf8');
  } catch (error) {
    return null;
  }
}

/**
 * Check if file exists and contains specific methods/strings
 */
function checkFileContains(filePath, checks, fileDescription) {
  if (!fs.existsSync(filePath)) {
    fail(`${fileDescription} not found`);
    return false;
  }
  
  pass(`${fileDescription} exists`);
  
  const content = readFileSafe(filePath);
  if (!content) {
    fail(`Failed to read ${fileDescription}`);
    return false;
  }
  
  checks.forEach(check => {
    if (content.includes(check.pattern)) {
      pass(check.successMsg);
    } else {
      fail(check.failMsg);
    }
  });
  
  return true;
}

// ============================================================================
// REQUIREMENT CHECKS
// ============================================================================

function checkRequirement1() {
  log('\n=== Requirement 1: Widget Creation and Display ===', 'cyan');
  
  const managerPath = path.join(__dirname, '../src/main/widget-manager.ts');
  checkFileContains(managerPath, [
    { pattern: 'createWidget', successMsg: 'createWidget method implemented', failMsg: 'createWidget method not found' },
    { pattern: 'closeWidget', successMsg: 'closeWidget method implemented', failMsg: 'closeWidget method not found' },
    { pattern: 'getRunningWidgets', successMsg: 'getRunningWidgets method implemented', failMsg: 'getRunningWidgets method not found' }
  ], 'Widget Manager');
}

function checkRequirement2() {
  log('\n=== Requirement 2: Sandbox Security ===', 'cyan');
  
  const windowControllerPath = path.join(__dirname, '../src/main/window-controller.ts');
  checkFileContains(windowControllerPath, [
    { pattern: 'sandbox: true', successMsg: 'Sandbox mode enabled', failMsg: 'Sandbox mode not enabled' },
    { pattern: 'nodeIntegration: false', successMsg: 'Node integration disabled', failMsg: 'Node integration not disabled' },
    { pattern: 'contextIsolation: true', successMsg: 'Context isolation enabled', failMsg: 'Context isolation not enabled' }
  ], 'Window Controller');
  
  const securityPath = path.join(__dirname, '../src/main/security.ts');
  checkFileContains(securityPath, [
    { pattern: 'Content-Security-Policy', successMsg: 'CSP implementation found', failMsg: 'CSP implementation not found' }
  ], 'Security manager');
}

function checkRequirement3() {
  log('\n=== Requirement 3: Permission System ===', 'cyan');
  
  const permissionsPath = path.join(__dirname, '../src/main/permissions.ts');
  checkFileContains(permissionsPath, [
    { pattern: 'requestPermission', successMsg: 'requestPermission method implemented', failMsg: 'requestPermission method not found' },
    { pattern: 'hasPermission', successMsg: 'hasPermission method implemented', failMsg: 'hasPermission method not found' },
    { pattern: 'checkRateLimit', successMsg: 'Rate limiting implemented', failMsg: 'Rate limiting not found' }
  ], 'Permissions manager');
}

function checkRequirement4() {
  log('\n=== Requirement 4: Widget SDK APIs ===', 'cyan');
  
  const sdkPath = path.join(__dirname, '../../widget-sdk/src/index.ts');
  if (fs.existsSync(sdkPath)) {
    pass('Widget SDK entry point exists');
    
    const content = fs.readFileSync(sdkPath, 'utf8');
    
    const requiredExports = [
      'WidgetProvider',
      'useWidgetAPI',
      'useStorage',
      'useSettings',
      'useInterval',
      'useSystemInfo'
    ];
    
    requiredExports.forEach(exportName => {
      if (content.includes(exportName)) {
        pass(`${exportName} exported`);
      } else {
        fail(`${exportName} not exported`);
      }
    });
  } else {
    fail('Widget SDK not found');
  }
  
  // Check UI components
  const componentsPath = path.join(__dirname, '../../widget-sdk/src/components');
  if (fs.existsSync(componentsPath)) {
    const files = fs.readdirSync(componentsPath);
    const componentFiles = files.filter(f => f.endsWith('.tsx'));
    
    if (componentFiles.length >= 5) {
      pass(`${componentFiles.length} UI component files found`);
    } else {
      warn(`Only ${componentFiles.length} UI component files found (expected 5+)`);
    }
  } else {
    fail('Components directory not found');
  }
}

function checkRequirement5() {
  log('\n=== Requirement 5: Widget Configuration ===', 'cyan');
  
  const managerPath = path.join(__dirname, '../src/main/widget-manager.ts');
  const content = readFileSafe(managerPath);
  if (content && (content.includes('validateWidgetConfig') || content.includes('validateConfig'))) {
    pass('Widget config validation implemented');
  } else if (content) {
    fail('Widget config validation not found');
  }
  
  // Check example widget configs
  const clockConfigPath = path.join(__dirname, '../../examples/clock/widget.config.json');
  if (!fs.existsSync(clockConfigPath)) {
    warn('Clock widget config not found');
    return;
  }
  
  pass('Clock widget config exists');
  
  try {
    const configContent = readFileSafe(clockConfigPath);
    if (!configContent) {
      fail('Failed to read clock widget config');
      return;
    }
    
    const config = JSON.parse(configContent);
    const requiredFields = ['id', 'name', 'displayName', 'version', 'permissions', 'sizes'];
    
    requiredFields.forEach(field => {
      if (config[field] !== undefined) {
        pass(`Config has ${field} field`);
      } else {
        fail(`Config missing ${field} field`);
      }
    });
  } catch (e) {
    fail(`Clock widget config is invalid JSON: ${e.message}`);
  }
}

function checkRequirement7() {
  log('\n=== Requirement 7: Clock Widget ===', 'cyan');
  
  const clockPath = path.join(__dirname, '../../examples/clock/src/index.tsx');
  if (fs.existsSync(clockPath)) {
    pass('Clock widget source exists');
    
    const content = fs.readFileSync(clockPath, 'utf8');
    
    if (content.includes('useInterval') || content.includes('setInterval')) {
      pass('Clock updates implemented');
    } else {
      fail('Clock update mechanism not found');
    }
    
    if (content.includes('Widget.Container') || content.includes('Container')) {
      pass('Uses Widget SDK components');
    } else {
      fail('Not using Widget SDK components');
    }
  } else {
    fail('Clock widget not found');
  }
  
  // Check if built
  const clockDistPath = path.join(__dirname, '../../examples/clock/dist');
  if (fs.existsSync(clockDistPath)) {
    pass('Clock widget built');
  } else {
    warn('Clock widget not built yet');
  }
}

function checkRequirement8() {
  log('\n=== Requirement 8: System Monitor Widget ===', 'cyan');
  
  const monitorPath = path.join(__dirname, '../../examples/system-monitor/src/index.tsx');
  if (fs.existsSync(monitorPath)) {
    pass('System Monitor widget source exists');
    
    const content = fs.readFileSync(monitorPath, 'utf8');
    
    if (content.includes('useSystemInfo')) {
      pass('Uses useSystemInfo hook');
    } else {
      fail('useSystemInfo hook not used');
    }
    
    if (content.includes('cpu') || content.includes('CPU')) {
      pass('Displays CPU information');
    } else {
      fail('CPU display not found');
    }
    
    if (content.includes('memory') || content.includes('Memory')) {
      pass('Displays memory information');
    } else {
      fail('Memory display not found');
    }
  } else {
    warn('System Monitor widget not found (optional)');
  }
}

function checkRequirement15() {
  log('\n=== Requirement 15: Performance Optimization ===', 'cyan');
  
  const managerPath = path.join(__dirname, '../src/main/widget-manager.ts');
  if (fs.existsSync(managerPath)) {
    const content = fs.readFileSync(managerPath, 'utf8');
    
    if (content.includes('MAX_WIDGETS') || content.includes('maxWidgets')) {
      pass('Widget limit implemented');
    } else {
      warn('Widget limit not found');
    }
  }
  
  // Check for useThrottle hook
  const sdkHooksPath = path.join(__dirname, '../../widget-sdk/src/hooks');
  if (fs.existsSync(sdkHooksPath)) {
    const files = fs.readdirSync(sdkHooksPath);
    if (files.some(f => f.includes('Throttle') || f.includes('throttle'))) {
      pass('Throttle hook implemented');
    } else {
      warn('Throttle hook not found');
    }
  }
  
  const windowControllerPath = path.join(__dirname, '../src/main/window-controller.ts');
  if (fs.existsSync(windowControllerPath)) {
    const content = fs.readFileSync(windowControllerPath, 'utf8');
    
    if (content.includes('v8CacheOptions')) {
      pass('V8 cache optimization enabled');
    } else {
      warn('V8 cache optimization not found');
    }
  }
}

// ============================================================================
// CRITICAL BUG CHECKS
// ============================================================================

function checkCriticalBugs() {
  log('\n=== Critical Bug Checks ===', 'cyan');
  
  const checks = [
    {
      path: path.join(__dirname, '../src/main/permissions.ts'),
      patterns: ['clearOldEntries', 'cleanup'],
      successMsg: 'Rate limit cleanup implemented (prevents memory leak)',
      failMsg: 'Rate limit cleanup not found (potential memory leak)',
      isWarning: true
    },
    {
      path: path.join(__dirname, '../src/main/widget-manager.ts'),
      patterns: ['removeAllListeners', 'cleanup'],
      successMsg: 'Resource cleanup implemented',
      failMsg: 'Resource cleanup not found (potential memory leak)',
      isWarning: true
    },
    {
      path: path.join(__dirname, '../src/main/window-controller.ts'),
      patterns: ['debounce', 'setTimeout'],
      successMsg: 'Debounced position saves (prevents excessive I/O)',
      failMsg: 'Position saves not debounced (potential performance issue)',
      isWarning: true
    }
  ];
  
  checks.forEach(check => {
    const content = readFileSafe(check.path);
    if (!content) return;
    
    const found = check.patterns.some(pattern => content.includes(pattern));
    if (found) {
      pass(check.successMsg);
    } else if (check.isWarning) {
      warn(check.failMsg);
    } else {
      fail(check.failMsg);
    }
  });
  
  // Check for proper error handling in IPC
  const ipcPath = path.join(__dirname, '../src/main/ipc-handlers.ts');
  const ipcContent = readFileSafe(ipcPath);
  if (ipcContent) {
    const tryCount = (ipcContent.match(/try\s*{/g) || []).length;
    const catchCount = (ipcContent.match(/catch\s*\(/g) || []).length;
    
    if (tryCount > 0 && tryCount === catchCount) {
      pass(`Error handling in IPC (${tryCount} try-catch blocks)`);
    } else {
      warn('Inconsistent error handling in IPC');
    }
  }
}

// ============================================================================
// TEST COVERAGE CHECK
// ============================================================================

function checkTestCoverage() {
  log('\n=== Test Coverage ===', 'cyan');
  
  const testDirs = [
    path.join(__dirname, '../src/main/__tests__'),
    path.join(__dirname, '../../widget-sdk/__tests__'),
    path.join(__dirname, '../../examples/clock/__tests__')
  ];
  
  let totalTests = 0;
  
  testDirs.forEach(dir => {
    if (fs.existsSync(dir)) {
      const files = fs.readdirSync(dir);
      const testFiles = files.filter(f => f.endsWith('.test.ts') || f.endsWith('.test.tsx'));
      totalTests += testFiles.length;
      
      if (testFiles.length > 0) {
        pass(`${testFiles.length} test files in ${path.basename(path.dirname(dir))}`);
      }
    }
  });
  
  if (totalTests >= 10) {
    pass(`Total: ${totalTests} test files`);
  } else {
    warn(`Only ${totalTests} test files found (recommended: 10+)`);
  }
}

// ============================================================================
// BUILD CHECK
// ============================================================================

function checkBuilds() {
  log('\n=== Build Status ===', 'cyan');
  
  // Check widget-container build
  const containerDist = path.join(__dirname, '../dist');
  if (fs.existsSync(containerDist)) {
    pass('Widget Container built');
  } else {
    warn('Widget Container not built');
  }
  
  // Check widget-sdk build
  const sdkDist = path.join(__dirname, '../../widget-sdk/dist');
  if (fs.existsSync(sdkDist)) {
    pass('Widget SDK built');
    
    // Check for type declarations
    const files = fs.readdirSync(sdkDist);
    if (files.some(f => f.endsWith('.d.ts'))) {
      pass('TypeScript declarations generated');
    } else {
      fail('TypeScript declarations missing');
    }
  } else {
    warn('Widget SDK not built');
  }
  
  // Check example widgets
  const examplesDir = path.join(__dirname, '../../examples');
  if (fs.existsSync(examplesDir)) {
    const examples = fs.readdirSync(examplesDir);
    examples.forEach(example => {
      const distPath = path.join(examplesDir, example, 'dist');
      if (fs.existsSync(distPath)) {
        pass(`${example} widget built`);
      } else {
        warn(`${example} widget not built`);
      }
    });
  }
}

// ============================================================================
// DOCUMENTATION CHECK
// ============================================================================

function checkDocumentation() {
  log('\n=== Documentation ===', 'cyan');
  
  const docs = [
    { path: '../../README.md', name: 'Main README' },
    { path: '../README.md', name: 'Widget Container README' },
    { path: '../../widget-sdk/README.md', name: 'Widget SDK README' },
    { path: '../../docs/architecture.md', name: 'Architecture docs' },
    { path: '../../docs/developer-guide.md', name: 'Developer guide' }
  ];
  
  docs.forEach(doc => {
    const fullPath = path.join(__dirname, doc.path);
    if (fs.existsSync(fullPath)) {
      pass(`${doc.name} exists`);
    } else {
      warn(`${doc.name} not found`);
    }
  });
}

// ============================================================================
// MAIN EXECUTION
// ============================================================================

function main() {
  log('\n╔════════════════════════════════════════════════════════════╗', 'blue');
  log('║         Molecool PLATFORM - FINAL SYSTEM CHECK            ║', 'blue');
  log('╚════════════════════════════════════════════════════════════╝', 'blue');
  
  // Run all checks
  checkRequirement1();
  checkRequirement2();
  checkRequirement3();
  checkRequirement4();
  checkRequirement5();
  checkRequirement7();
  checkRequirement8();
  checkRequirement15();
  checkCriticalBugs();
  checkTestCoverage();
  checkBuilds();
  checkDocumentation();
  
  // Summary
  log('\n╔════════════════════════════════════════════════════════════╗', 'blue');
  log('║                      SUMMARY                               ║', 'blue');
  log('╚════════════════════════════════════════════════════════════╝', 'blue');
  
  log(`\n${colors.green}Passed: ${results.passed.length}${colors.reset}`);
  log(`${colors.yellow}Warnings: ${results.warnings.length}${colors.reset}`);
  log(`${colors.red}Failed: ${results.failed.length}${colors.reset}`);
  
  if (results.failed.length > 0) {
    log('\n❌ CRITICAL ISSUES FOUND:', 'red');
    results.failed.forEach(msg => log(`  • ${msg}`, 'red'));
  }
  
  if (results.warnings.length > 0) {
    log('\n⚠️  WARNINGS:', 'yellow');
    results.warnings.forEach(msg => log(`  • ${msg}`, 'yellow'));
  }
  
  // Overall status
  log('\n' + '='.repeat(60), 'blue');
  if (results.failed.length === 0) {
    log('✅ SYSTEM READY FOR DEPLOYMENT', 'green');
  } else if (results.failed.length <= 3) {
    log('⚠️  SYSTEM MOSTLY READY - FIX CRITICAL ISSUES', 'yellow');
  } else {
    log('❌ SYSTEM NOT READY - MULTIPLE CRITICAL ISSUES', 'red');
  }
  log('='.repeat(60) + '\n', 'blue');
  
  // Exit code
  process.exit(results.failed.length > 0 ? 1 : 0);
}

main();
