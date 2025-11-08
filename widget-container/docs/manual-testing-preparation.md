# Manual Testing Preparation Script

The `prepare-manual-testing.js` script helps ensure your environment is ready for manual testing by checking all required builds and providing helpful instructions.

## Usage

```bash
cd widget-container
npm run test:manual
```

Or run directly:

```bash
node scripts/prepare-manual-testing.js
```

## What It Checks

The script performs the following checks:

### 1. Widget Container Build
- **Path:** `widget-container/dist/`
- **Required:** Yes
- **Build Command:** `cd widget-container && npm run build`

### 2. Example Widgets
- **Clock Widget:** `examples/clock/dist/`
- **System Monitor Widget:** `examples/system-monitor/dist/`
- **Weather Widget:** `examples/weather/dist/`
- **Build Commands:**
  ```bash
  cd examples/clock && npm run build
  cd examples/system-monitor && npm run build
  cd examples/weather && npm run build
  ```

### 3. Widget SDK
- **Path:** `widget-sdk/dist/`
- **Required:** Yes (dependency for example widgets)
- **Build Command:** `cd widget-sdk && npm run build`

### 4. Documentation
- **Manual Testing Guide:** `widget-container/docs/MANUAL_TESTING_GUIDE.md`
- **Test Execution Report:** `widget-container/docs/TEST_EXECUTION_REPORT.md`

## Output

### All Checks Pass ✅

```
=== Molecool Manual Testing Preparation ===

Checking Widget Container...
  ✓ Widget Container dist/

Checking Example Widgets...
  ✓ Clock Widget dist/
  ✓ System Monitor Widget dist/
  ✓ Weather Widget dist/

Checking Widget SDK...
  ✓ Widget SDK dist/

Checking Documentation...
  ✓ Manual Testing Guide
  ✓ Test Execution Report

=== Summary ===

✓ All checks passed! Ready for manual testing.

To start manual testing:
  1. cd widget-container && npm start
  2. Open docs/MANUAL_TESTING_GUIDE.md
  3. Follow the test cases step by step
  4. Record results in docs/TEST_EXECUTION_REPORT.md

=== Quick Commands ===

Build all components:
  npm run build:all

Start Widget Container:
  cd widget-container && npm start

Start Marketplace (optional):
  cd widget-marketplace && npm run dev

Clear all data (reset state):
  rmdir /s /q %APPDATA%\widget-container

=== Documentation ===

Manual Testing Guide:
  widget-container/docs/MANUAL_TESTING_GUIDE.md

Test Execution Report:
  widget-container/docs/TEST_EXECUTION_REPORT.md
```

### Some Checks Fail ❌

```
=== Molecool Manual Testing Preparation ===

Checking Widget Container...
  ✓ Widget Container dist/

Checking Example Widgets...
  ✗ Clock Widget dist/
  ✓ System Monitor Widget dist/
  ✗ Weather Widget dist/

Checking Widget SDK...
  ✓ Widget SDK dist/

Checking Documentation...
  ✓ Manual Testing Guide
  ✓ Test Execution Report

=== Summary ===

✗ Some checks failed. Please build missing components:

  Clock Widget Build:
    cd examples/clock && npm run build

  Weather Widget Build:
    cd examples/weather && npm run build

=== Quick Commands ===
...
```

## Exit Codes

- **0:** All checks passed, ready for testing
- **1:** Some checks failed, build required components

## Integration with CI/CD

You can use this script in CI/CD pipelines to verify builds before running manual tests:

```bash
# In CI/CD pipeline
npm run test:manual
if [ $? -eq 0 ]; then
  echo "Ready for manual testing"
else
  echo "Build missing components first"
  exit 1
fi
```

## Workflow

### Typical Testing Workflow

1. **Check Readiness:**
   ```bash
   npm run test:manual
   ```

2. **Build Missing Components:**
   If any checks fail, run the suggested build commands.

3. **Verify Again:**
   ```bash
   npm run test:manual
   ```

4. **Start Testing:**
   ```bash
   npm start
   ```

5. **Follow Test Guide:**
   Open `docs/MANUAL_TESTING_GUIDE.md` and execute test cases.

6. **Record Results:**
   Document findings in `docs/TEST_EXECUTION_REPORT.md`.

### Reset Testing Environment

To start fresh with clean state:

**Windows:**
```bash
rmdir /s /q %APPDATA%\widget-container
```

**macOS/Linux:**
```bash
rm -rf ~/Library/Application\ Support/widget-container
```

This removes all saved widget states, permissions, and configurations.

## Troubleshooting

### Script Shows False Negatives

If the script reports missing builds but you've built them:

1. Check the exact paths the script is looking for
2. Ensure TypeScript compilation completed successfully
3. Verify `dist/` folders contain compiled files, not just empty directories

### Build Commands Fail

If suggested build commands fail:

1. Ensure all dependencies are installed: `npm install`
2. Check for TypeScript errors: `npm run build`
3. Verify Node.js version is 18+ 
4. Check for missing peer dependencies in example widgets

### Script Doesn't Run

If `npm run test:manual` fails:

1. Ensure you're in the `widget-container` directory
2. Check that `scripts/prepare-manual-testing.js` exists
3. Verify Node.js is installed and in PATH
4. Try running directly: `node scripts/prepare-manual-testing.js`

## Customization

You can modify the script to check additional components or change paths:

**Location:** `widget-container/scripts/prepare-manual-testing.js`

**Add New Check:**
```javascript
const myComponentDist = path.join(__dirname, '..', '..', 'my-component', 'dist');
const myComponentBuilt = checkDirectoryExists(myComponentDist);
checks.push({
  name: 'My Component Build',
  status: myComponentBuilt,
  path: myComponentDist,
  command: 'cd my-component && npm run build'
});
log(`  ${myComponentBuilt ? '✓' : '✗'} My Component dist/`, myComponentBuilt ? 'green' : 'red');
```

## Related Documentation

- [Manual Testing Guide](./MANUAL_TESTING_GUIDE.md) - Detailed test cases and procedures
- [Test Execution Report](./TEST_EXECUTION_REPORT.md) - Template for recording test results
- [README.md](../README.md) - Main project documentation

## Script Features

### Color-Coded Output
- **Green (✓):** Check passed
- **Red (✗):** Check failed
- **Blue:** Section headers
- **Yellow:** Commands and instructions
- **Cyan:** Main headers

### Platform-Specific Commands
The script detects your platform and shows appropriate commands:
- Windows: Uses `rmdir /s /q` for cleanup
- macOS/Linux: Uses `rm -rf` for cleanup

### Comprehensive Checks
- Verifies build outputs exist
- Checks documentation availability
- Provides actionable fix commands
- Shows complete workflow instructions

## Benefits

1. **Time Saving:** Quickly verify all components are ready
2. **Error Prevention:** Catch missing builds before testing
3. **Guidance:** Provides exact commands to fix issues
4. **Documentation:** Links to relevant testing guides
5. **Automation:** Can be integrated into CI/CD pipelines
6. **Consistency:** Ensures all testers follow same preparation steps
