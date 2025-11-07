#!/usr/bin/env node

/**
 * Prepare Manual Testing Script
 * 
 * This script helps prepare the environment for manual testing by:
 * 1. Checking if all required builds are present
 * 2. Verifying example widgets are built
 * 3. Providing instructions for manual testing
 */

const fs = require('fs');
const path = require('path');

const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m',
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

function checkFileExists(filePath) {
  try {
    return fs.existsSync(filePath) && fs.statSync(filePath).isFile();
  } catch (error) {
    return false;
  }
}

function checkDirectoryExists(dirPath) {
  try {
    return fs.existsSync(dirPath) && fs.statSync(dirPath).isDirectory();
  } catch (error) {
    return false;
  }
}

function checkComponent(name, distPath, buildCommand) {
  const status = checkDirectoryExists(distPath);
  log(`  ${status ? '✓' : '✗'} ${name}`, status ? 'green' : 'red');
  return { name, status, path: distPath, command: buildCommand };
}

function main() {
  log('\n=== Molecule Manual Testing Preparation ===\n', 'cyan');

  const rootDir = path.join(__dirname, '..', '..');
  const checks = [];

  // Check Widget Container build
  log('Checking Widget Container...', 'blue');
  checks.push(checkComponent(
    'Widget Container Build',
    path.join(__dirname, '..', 'dist'),
    'cd widget-container && npm run build'
  ));

  // Check Example Widgets
  log('\nChecking Example Widgets...', 'blue');
  checks.push(checkComponent(
    'Clock Widget Build',
    path.join(rootDir, 'examples', 'clock', 'dist'),
    'cd examples/clock && npm run build'
  ));
  checks.push(checkComponent(
    'System Monitor Widget Build',
    path.join(rootDir, 'examples', 'system-monitor', 'dist'),
    'cd examples/system-monitor && npm run build'
  ));
  checks.push(checkComponent(
    'Weather Widget Build',
    path.join(rootDir, 'examples', 'weather', 'dist'),
    'cd examples/weather && npm run build'
  ));

  // Check Widget SDK
  log('\nChecking Widget SDK...', 'blue');
  checks.push(checkComponent(
    'Widget SDK Build',
    path.join(rootDir, 'widget-sdk', 'dist'),
    'cd widget-sdk && npm run build'
  ));

  // Check documentation (optional - don't fail if missing)
  log('\nChecking Documentation...', 'blue');
  const docsDir = path.join(__dirname, '..', 'docs');
  const manualTestingGuide = path.join(docsDir, 'MANUAL_TESTING_GUIDE.md');
  const guideExists = checkFileExists(manualTestingGuide);
  log(`  ${guideExists ? '✓' : '✗'} Manual Testing Guide`, guideExists ? 'green' : 'yellow');

  const testReport = path.join(docsDir, 'TEST_EXECUTION_REPORT.md');
  const reportExists = checkFileExists(testReport);
  log(`  ${reportExists ? '✓' : '✗'} Test Execution Report`, reportExists ? 'green' : 'yellow');

  // Summary
  log('\n=== Summary ===\n', 'cyan');
  const allPassed = checks.every(check => check.status);
  
  if (allPassed) {
    log('✓ All checks passed! Ready for manual testing.', 'green');
    log('\nTo start manual testing:', 'blue');
    log('  1. cd widget-container && npm start', 'yellow');
    log('  2. Open docs/MANUAL_TESTING_GUIDE.md', 'yellow');
    log('  3. Follow the test cases step by step', 'yellow');
    log('  4. Record results in docs/TEST_EXECUTION_REPORT.md', 'yellow');
  } else {
    log('✗ Some checks failed. Please build missing components:', 'red');
    checks.filter(check => !check.status).forEach(check => {
      log(`\n  ${check.name}:`, 'yellow');
      log(`    ${check.command}`, 'cyan');
    });
  }

  // Additional instructions
  log('\n=== Quick Commands ===\n', 'cyan');
  log('Build all components:', 'blue');
  log('  npm run build:all', 'yellow');
  log('\nStart Widget Container:', 'blue');
  log('  cd widget-container && npm start', 'yellow');
  log('\nStart Marketplace (optional):', 'blue');
  log('  cd widget-marketplace && npm run dev', 'yellow');
  log('\nClear all data (reset state):', 'blue');
  if (process.platform === 'win32') {
    log('  rmdir /s /q %APPDATA%\\widget-container', 'yellow');
  } else {
    log('  rm -rf ~/Library/Application\\ Support/widget-container', 'yellow');
  }

  log('\n=== Documentation ===\n', 'cyan');
  log('Manual Testing Guide:', 'blue');
  log('  widget-container/docs/MANUAL_TESTING_GUIDE.md', 'yellow');
  log('\nTest Execution Report:', 'blue');
  log('  widget-container/docs/TEST_EXECUTION_REPORT.md', 'yellow');

  log('\n');
  process.exit(allPassed ? 0 : 1);
}

main();
