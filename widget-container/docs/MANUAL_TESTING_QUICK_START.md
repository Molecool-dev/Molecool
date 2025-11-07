# Manual Testing Quick Start

**⚡ Get started with manual testing in 3 steps**

---

## Step 1: Verify Environment ✅

```bash
cd widget-container
node scripts/prepare-manual-testing.js
```

**Expected Output:**
```
✓ Widget Container dist/
✓ Clock Widget dist/
✓ System Monitor Widget dist/
✓ Weather Widget dist/
✓ Widget SDK dist/
✓ Manual Testing Guide
✓ Test Execution Report

✓ All checks passed! Ready for manual testing.
```

If any checks fail, run the suggested build commands.

---

## Step 2: Start Application 🚀

```bash
cd widget-container
npm start
```

**What to expect:**
- Widget Manager window opens
- System tray icon appears
- No error messages in console

---

## Step 3: Execute Tests 📋

1. **Open Testing Guide:**
   - File: `widget-container/docs/MANUAL_TESTING_GUIDE.md`
   - Contains 27 detailed test cases

2. **Open Execution Report:**
   - File: `widget-container/docs/TEST_EXECUTION_REPORT.md`
   - Record your results here

3. **Follow Test Cases:**
   - Start with Test Suite 37.1 (Widget 生命週期)
   - Execute each test step-by-step
   - Check off expected results
   - Record pass/fail status

---

## Test Suites Overview

| Suite | Tests | Focus | Time |
|-------|-------|-------|------|
| 37.1 | 5 | Widget lifecycle | 20 min |
| 37.2 | 5 | Permissions | 20 min |
| 37.3 | 7 | Example widgets | 30 min |
| 37.4 | 5 | Marketplace | 20 min |
| Extra | 5 | Performance & Security | 20 min |
| **Total** | **27** | **All features** | **~2 hours** |

---

## Quick Commands

### Start Testing
```bash
cd widget-container && npm start
```

### Start Marketplace (for Suite 37.4)
```bash
cd widget-marketplace && npm run dev
```

### Clear All Data (reset state)
```bash
# Windows
rmdir /s /q %APPDATA%\widget-container

# macOS/Linux
rm -rf ~/Library/Application\ Support/widget-container
```

### Rebuild Everything
```bash
# Widget Container
cd widget-container && npm run build

# Example Widgets
cd examples/clock && npm run build
cd ../system-monitor && npm run build
cd ../weather && npm run build
```

---

## First Test Example

**Test Case 37.1.1: Widget 創建測試**

1. Launch Widget Container (should auto-open)
2. Click "Clock Widget" in the list
3. Click "Create Widget" button

**Expected:**
- ✅ New transparent window appears
- ✅ Shows current time (HH:MM format)
- ✅ Shows current date
- ✅ Window is always on top
- ✅ Has glassmorphism effect

**Record Result:**
- Open `TEST_EXECUTION_REPORT.md`
- Find "37.1.1: Widget 創建測試"
- Mark as Pass/Fail
- Add notes if needed

---

## Common Issues

### Issue: "Widget Container dist/ not found"
**Solution:**
```bash
cd widget-container
npm run build
```

### Issue: "Example widget not appearing"
**Solution:**
```bash
cd examples/clock
npm run build
```

### Issue: "Permission dialog not showing"
**Solution:**
```bash
# Clear permissions
rmdir /s /q %APPDATA%\widget-container
# Restart app
cd widget-container && npm start
```

---

## Documentation Files

| File | Purpose |
|------|---------|
| `MANUAL_TESTING_GUIDE.md` | Detailed test cases (READ THIS) |
| `TEST_EXECUTION_REPORT.md` | Record results here |
| `MANUAL_TESTING_README.md` | Complete overview |
| `testing.md` | All testing approaches |
| `MANUAL_TESTING_QUICK_START.md` | This file |

---

## Tips for Success

1. **Test in Order:** Follow test suites sequentially (37.1 → 37.2 → 37.3 → 37.4)
2. **Record Immediately:** Fill in results right after each test
3. **Take Screenshots:** Capture any unexpected behavior
4. **Check Console:** Keep DevTools open for errors
5. **Monitor Performance:** Keep Task Manager open
6. **Test Thoroughly:** Don't rush, verify all expected results

---

## Success Criteria

Testing is complete when:
- ✅ All 27 test cases executed
- ✅ Results recorded in TEST_EXECUTION_REPORT.md
- ✅ All bugs documented with reproduction steps
- ✅ Overall assessment completed
- ✅ Report signed off

---

## Need Help?

1. **Check Documentation:**
   - `MANUAL_TESTING_README.md` - Comprehensive guide
   - `MANUAL_TESTING_GUIDE.md` - Detailed test cases

2. **Run Verification:**
   ```bash
   node scripts/prepare-manual-testing.js
   ```

3. **Review Common Issues:**
   - See "Common Issues" section above
   - Check `MANUAL_TESTING_README.md` for more solutions

---

## Next Steps After Testing

1. **Complete Report:**
   - Fill in all test results
   - Document all bugs found
   - Add overall assessment
   - Sign off

2. **Share Results:**
   - Send `TEST_EXECUTION_REPORT.md` to team
   - Discuss critical bugs
   - Prioritize fixes

3. **Bug Fixing:**
   - Create GitHub issues for bugs
   - Fix critical issues first
   - Re-run affected tests

---

**Ready to start? Run the verification script and begin testing! 🚀**

```bash
cd widget-container
node scripts/prepare-manual-testing.js
npm start
```
