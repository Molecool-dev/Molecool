# Manual Testing Documentation

This directory contains comprehensive documentation for manually testing the Molecool Desktop Widget Platform.

## Quick Start

1. **Prepare Environment:**
   ```bash
   cd widget-container
   node scripts/prepare-manual-testing.js
   ```

2. **Read Testing Guide:**
   Open `MANUAL_TESTING_GUIDE.md` for detailed test cases

3. **Execute Tests:**
   Follow test cases and record results in `TEST_EXECUTION_REPORT.md`

## Documents Overview

### 📋 MANUAL_TESTING_GUIDE.md
**Purpose:** Comprehensive step-by-step testing instructions

**Contents:**
- 27 detailed test cases across 4 test suites
- Expected results for each test
- Performance and security tests
- Bug reporting template
- Testing tips and best practices

**When to use:** During manual testing execution

---

### 📊 TEST_EXECUTION_REPORT.md
**Purpose:** Track test execution progress and results

**Contents:**
- Test execution summary table
- Individual test case results
- Bug tracking section
- Overall assessment and sign-off

**When to use:** While executing tests to record results

---

### 🔧 prepare-manual-testing.js
**Purpose:** Automated environment verification script

**What it does:**
- Checks if Widget Container is built
- Verifies example widgets are built
- Confirms Widget SDK is built
- Provides build commands for missing components

**How to run:**
```bash
node scripts/prepare-manual-testing.js
```

---

## Test Suites Overview

### Test Suite 37.1: Widget 生命週期 (5 tests)
Tests widget creation, closing, dragging, position persistence, and multi-widget scenarios.

**Key Requirements:** 1.1, 1.2, 1.3, 1.4, 1.5

---

### Test Suite 37.2: 權限系統 (5 tests)
Tests permission dialogs, granting/denying permissions, rate limiting, and unauthorized access.

**Key Requirements:** 3.1, 3.2, 3.3, 3.4

---

### Test Suite 37.3: 範例 Widgets (7 tests)
Tests Clock, System Monitor, and Weather widgets for functionality and permissions.

**Key Requirements:** 7.1-7.5, 8.1-8.5, 9.1-9.5

---

### Test Suite 37.4: Marketplace (5 tests)
Tests Marketplace homepage, search, widget details, install protocol, and error handling.

**Key Requirements:** 6.1, 6.2, 6.3, 6.4, 13.3, 13.4

---

## Testing Workflow

```
┌─────────────────────────────────────────────────────────────┐
│ 1. PREPARATION                                              │
│    - Run prepare-manual-testing.js                          │
│    - Build all components                                   │
│    - Clear previous test data (optional)                    │
└─────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────┐
│ 2. SETUP                                                    │
│    - Start Widget Container                                 │
│    - Start Marketplace (if testing 37.4)                    │
│    - Open MANUAL_TESTING_GUIDE.md                           │
│    - Open TEST_EXECUTION_REPORT.md                          │
└─────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────┐
│ 3. EXECUTION                                                │
│    - Follow test cases in order                             │
│    - Perform each step carefully                            │
│    - Verify expected results                                │
│    - Record results in TEST_EXECUTION_REPORT.md             │
│    - Take screenshots of bugs                               │
└─────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────┐
│ 4. REPORTING                                                │
│    - Complete TEST_EXECUTION_REPORT.md                      │
│    - Document all bugs found                                │
│    - Provide overall assessment                             │
│    - Sign off on testing                                    │
└─────────────────────────────────────────────────────────────┘
```

---

## Prerequisites

Before starting manual testing, ensure:

### Software Requirements
- ✅ Node.js 18+ installed
- ✅ npm installed
- ✅ All dependencies installed (`npm install` in each package)

### Build Requirements
- ✅ Widget Container built (`cd widget-container && npm run build`)
- ✅ Widget SDK built (`cd widget-sdk && npm run build`)
- ✅ Clock Widget built (`cd examples/clock && npm run build`)
- ✅ System Monitor Widget built (`cd examples/system-monitor && npm run build`)
- ✅ Weather Widget built (`cd examples/weather && npm run build`)

### Optional (for Marketplace testing)
- ✅ Marketplace dependencies installed (`cd widget-marketplace && npm install`)
- ✅ Supabase configured (`.env.local` file)

---

## Environment Setup

### Clean State Testing
To test from a clean state (recommended for first-time testing):

**Windows:**
```cmd
rmdir /s /q %APPDATA%\widget-container
```

**macOS/Linux:**
```bash
rm -rf ~/Library/Application\ Support/widget-container
```

### Development Mode
For testing with DevTools access:

1. Set `NODE_ENV=development`
2. Start Widget Container: `npm start`
3. DevTools will be available in widget windows

---

## Test Execution Tips

### 1. Systematic Approach
- Execute tests in order (37.1 → 37.2 → 37.3 → 37.4)
- Complete all sub-tests in a suite before moving to next
- Don't skip tests unless blocked

### 2. Documentation
- Record results immediately after each test
- Take screenshots of unexpected behavior
- Note any deviations from expected results

### 3. Bug Reporting
- Use the bug report template in MANUAL_TESTING_GUIDE.md
- Include clear reproduction steps
- Assign appropriate severity level

### 4. Performance Monitoring
- Keep Task Manager / Activity Monitor open
- Monitor memory and CPU usage continuously
- Note any performance degradation

### 5. Edge Cases
- Test with multiple widgets (5+)
- Test rapid interactions (fast clicking, dragging)
- Test with network disconnected (for Weather Widget)
- Test with low system resources

---

## Common Issues and Solutions

### Issue: Widget Container won't start
**Solution:**
1. Check if build is complete: `ls widget-container/dist`
2. Rebuild: `cd widget-container && npm run build`
3. Check console for errors

### Issue: Example widgets not appearing
**Solution:**
1. Verify widgets are built: `ls examples/*/dist`
2. Check widget.config.json exists in each widget
3. Rebuild widgets: `cd examples/[widget-name] && npm run build`

### Issue: Permission dialogs not showing
**Solution:**
1. Clear permissions: Delete `%APPDATA%/widget-container`
2. Restart Widget Container
3. Create widget again

### Issue: Marketplace not loading
**Solution:**
1. Check if dev server is running: `cd widget-marketplace && npm run dev`
2. Verify Supabase configuration in `.env.local`
3. Check browser console for errors

---

## Test Data Management

### Clearing Test Data

**All data:**
```bash
# Windows
rmdir /s /q %APPDATA%\widget-container

# macOS/Linux
rm -rf ~/Library/Application\ Support/widget-container
```

**Specific data:**
- Widget positions: Delete `widgetStates` from electron-store
- Permissions: Delete `permissions` from electron-store
- Widget data: Delete `widgetData` from electron-store

### Backup Test Data

Before major testing sessions:
```bash
# Windows
xcopy %APPDATA%\widget-container %APPDATA%\widget-container-backup /E /I

# macOS/Linux
cp -r ~/Library/Application\ Support/widget-container ~/widget-container-backup
```

---

## Success Criteria

Manual testing is considered successful when:

1. ✅ All 27 test cases pass (or documented failures are acceptable)
2. ✅ No critical or high-severity bugs found
3. ✅ Performance metrics meet requirements:
   - Memory usage < 500MB with 5 widgets
   - CPU usage < 20% per widget
   - Frame rate > 30 FPS
4. ✅ Security tests pass (sandbox isolation, CSP)
5. ✅ All example widgets function correctly
6. ✅ TEST_EXECUTION_REPORT.md is complete

---

## Next Steps After Testing

1. **Review Results:**
   - Analyze TEST_EXECUTION_REPORT.md
   - Prioritize bugs by severity
   - Identify patterns in failures

2. **Bug Fixing:**
   - Create GitHub issues for each bug
   - Assign priority and milestone
   - Fix critical bugs first

3. **Regression Testing:**
   - Re-run failed tests after fixes
   - Verify fixes don't break other features
   - Update test documentation if needed

4. **Sign-off:**
   - Complete overall assessment in TEST_EXECUTION_REPORT.md
   - Get stakeholder approval
   - Proceed to next phase (deployment/release)

---

## Contact and Support

If you encounter issues during manual testing:

1. Check this documentation first
2. Review MANUAL_TESTING_GUIDE.md for detailed instructions
3. Check existing GitHub issues
4. Create new issue with bug report template

---

## Version History

| Version | Date | Changes |
|---------|------|---------|
| 1.0.0 | 2025-11-07 | Initial manual testing documentation |

---

## Additional Resources

- **Architecture Documentation:** `widget-container/docs/architecture.md`
- **API Documentation:** `widget-sdk/docs/api.md`
- **Security Documentation:** `widget-container/docs/security.md`
- **Development Guide:** `README.md` in root directory

---

**Happy Testing! 🧪**
