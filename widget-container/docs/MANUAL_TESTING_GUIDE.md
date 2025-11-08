# Manual Testing Guide

This guide provides step-by-step instructions for manually testing all features of the Molecool Desktop Widget Platform.

## Prerequisites

Before starting manual testing, ensure all components are built and ready.

### Quick Check

Run the preparation script to verify everything is ready:

```bash
cd widget-container
npm run test:manual
```

This script will:
- ✅ Check if Widget Container is built
- ✅ Check if all example widgets are built
- ✅ Check if Widget SDK is built
- ✅ Verify documentation exists
- ❌ Show commands to build missing components
- Display quick start instructions

### Manual Setup

If the preparation script shows missing components, build them:

1. **Widget Container:** `cd widget-container && npm run build`
2. **Example Widgets:**
   - `cd examples/clock && npm run build`
   - `cd examples/system-monitor && npm run build`
   - `cd examples/weather && npm run build`
3. **Widget SDK (if needed):** `cd widget-sdk && npm run build`

### Start Testing

Once all checks pass:

```bash
cd widget-container
npm start
```

## Test Suite 37.1: Widget 生命週期測試

### Test Case 37.1.1: Widget 創建測試

**Objective:** 驗證 Widget 可以正常創建

**Steps:**
1. Launch Widget Container application
2. Widget Manager window should appear automatically
3. Click on "Clock Widget" in the widget list
4. Click "Create Widget" button

**Expected Results:**
- ✅ A new frameless, transparent window appears on desktop
- ✅ Clock widget displays current time in HH:MM format
- ✅ Clock widget displays current date
- ✅ Widget window is always on top of other windows
- ✅ Widget has glassmorphism effect (semi-transparent with blur)
- ✅ Widget Manager shows the widget as "Running"

**Requirements Verified:** 1.1, 1.2

---

### Test Case 37.1.2: Widget 關閉測試

**Objective:** 驗證 Widget 可以正常關閉

**Steps:**
1. With a widget running from Test Case 37.1.1
2. In Widget Manager, find the running widget
3. Click "Close" button next to the widget

**Expected Results:**
- ✅ Widget window closes immediately
- ✅ Widget disappears from desktop
- ✅ Widget Manager updates to show widget as "Not Running"
- ✅ No error messages appear
- ✅ Other widgets (if any) continue running normally

**Requirements Verified:** 1.5

---

### Test Case 37.1.3: Widget 拖曳測試

**Objective:** 驗證 Widget 可以拖曳

**Steps:**
1. Create a Clock Widget (Test Case 37.1.1)
2. Click and hold on the widget window (not on buttons/interactive elements)
3. Drag the widget to different positions on screen
4. Release mouse button
5. Try dragging from different areas of the widget

**Expected Results:**
- ✅ Widget follows mouse cursor smoothly during drag
- ✅ Widget position updates in real-time
- ✅ No flickering or jumping during drag
- ✅ Widget can be moved to any position on screen
- ✅ Widget stays within screen boundaries
- ✅ Dragging works from any non-interactive area

**Requirements Verified:** 1.3

---

### Test Case 37.1.4: Widget 位置持久化測試

**Objective:** 驗證 Widget 位置在重啟後保持

**Steps:**
1. Create a Clock Widget
2. Drag widget to a specific position (e.g., top-right corner)
3. Wait 1 second for auto-save (500ms debounce + buffer)
4. Close Widget Container completely (File → Exit or system tray → Exit)
5. Restart Widget Container

**Expected Results:**
- ✅ Widget automatically recreates on startup
- ✅ Widget appears at the same position as before restart
- ✅ Widget size remains the same
- ✅ Widget state (running/not running) is preserved
- ✅ Multiple widgets all restore to correct positions

**Requirements Verified:** 1.4

---

### Test Case 37.1.5: 多個 Widget 同時運行

**Objective:** 驗證多個 Widget 可以同時運行

**Steps:**
1. Create Clock Widget
2. Create System Monitor Widget
3. Create Weather Widget (if available)
4. Drag each widget to different positions
5. Observe all widgets simultaneously

**Expected Results:**
- ✅ All widgets display correctly
- ✅ Each widget updates independently
- ✅ No performance degradation
- ✅ All widgets can be dragged independently
- ✅ Closing one widget doesn't affect others

**Requirements Verified:** 1.1, 1.5, 15.1

---

## Test Suite 37.2: 權限系統測試

### Test Case 37.2.1: 權限對話框顯示測試

**Objective:** 驗證權限對話框正常顯示

**Steps:**
1. Ensure System Monitor Widget has never been run (clear permissions if needed)
2. Create System Monitor Widget
3. Widget will request systemInfo permissions

**Expected Results:**
- ✅ Permission dialog appears immediately
- ✅ Dialog shows widget name "System Monitor"
- ✅ Dialog lists requested permissions: "systemInfo.cpu" and "systemInfo.memory"
- ✅ Dialog has "Allow" and "Deny" buttons
- ✅ Dialog is modal (blocks interaction with other windows)
- ✅ Dialog text is clear and understandable

**Requirements Verified:** 3.1

---

### Test Case 37.2.2: 權限授予測試

**Objective:** 驗證權限授予功能

**Steps:**
1. Trigger permission dialog (Test Case 37.2.1)
2. Click "Allow" button

**Expected Results:**
- ✅ Dialog closes
- ✅ Widget starts displaying system information
- ✅ CPU usage shows as percentage (0-100%)
- ✅ Memory usage shows as GB values
- ✅ Permission decision is saved
- ✅ Restarting widget doesn't show dialog again

**Requirements Verified:** 3.2

---

### Test Case 37.2.3: 權限拒絕測試

**Objective:** 驗證權限拒絕功能

**Steps:**
1. Clear System Monitor Widget permissions
2. Create System Monitor Widget
3. Click "Deny" button in permission dialog

**Expected Results:**
- ✅ Dialog closes
- ✅ Widget displays error message or "Permission Denied"
- ✅ Widget doesn't show system information
- ✅ Widget doesn't crash
- ✅ Permission decision is saved
- ✅ Restarting widget doesn't show dialog again (stays denied)

**Requirements Verified:** 3.3

---

### Test Case 37.2.4: 速率限制測試

**Objective:** 驗證速率限制功能

**Steps:**
1. Create System Monitor Widget with permissions granted
2. Observe widget behavior over 10 seconds
3. Check console for any rate limit warnings

**Expected Results:**
- ✅ Widget updates normally (every 2 seconds)
- ✅ No rate limit errors appear
- ✅ Widget doesn't freeze or crash
- ✅ System remains responsive

**Manual Rate Limit Test (Advanced):**
- Modify widget to call system API rapidly (>10 times/second)
- Expected: Rate limit error appears after 10 calls/second

**Requirements Verified:** 3.4, 15.4

---

### Test Case 37.2.5: 未授權 API 訪問測試

**Objective:** 驗證未授權 API 被阻止

**Steps:**
1. Create Clock Widget (no system permissions)
2. Open DevTools (if available in development mode)
3. Try to call system API from console: `window.widgetAPI.system.getCPU()`

**Expected Results:**
- ✅ API call is rejected
- ✅ Error message indicates permission denied
- ✅ Widget doesn't crash
- ✅ Error is logged appropriately

**Requirements Verified:** 3.3

---

## Test Suite 37.3: 範例 Widgets 測試

### Test Case 37.3.1: Clock Widget 顯示測試

**Objective:** 驗證 Clock Widget 正常顯示

**Steps:**
1. Create Clock Widget
2. Observe widget for 2 minutes

**Expected Results:**
- ✅ Current time displays in HH:MM format
- ✅ Time updates every second
- ✅ Time is accurate (matches system time)
- ✅ Current date displays below time
- ✅ Date format is readable (e.g., "November 7, 2025")
- ✅ Text is white and readable on transparent background
- ✅ No flickering during updates

**Requirements Verified:** 7.1, 7.2, 7.3, 7.4

---

### Test Case 37.3.2: Clock Widget 權限測試

**Objective:** 驗證 Clock Widget 不需要特殊權限

**Steps:**
1. Check Clock Widget's widget.config.json
2. Create Clock Widget

**Expected Results:**
- ✅ No permission dialog appears
- ✅ Widget works immediately
- ✅ widget.config.json shows all permissions as false

**Requirements Verified:** 7.5

---

### Test Case 37.3.3: System Monitor Widget 顯示測試

**Objective:** 驗證 System Monitor Widget 顯示正確的系統資訊

**Steps:**
1. Create System Monitor Widget
2. Grant permissions
3. Observe widget for 30 seconds
4. Open Task Manager (Windows) or Activity Monitor (macOS) for comparison

**Expected Results:**
- ✅ CPU usage displays as percentage (0-100%)
- ✅ CPU usage updates every 2 seconds
- ✅ CPU values are reasonable (match Task Manager approximately)
- ✅ Progress bar reflects CPU percentage visually
- ✅ Memory usage shows "X GB / Y GB" format
- ✅ Memory values are accurate (match Task Manager)
- ✅ Memory progress bar reflects usage percentage
- ✅ High usage (>80%) shows in red color
- ✅ Normal usage shows in blue/green color

**Requirements Verified:** 8.1, 8.2, 8.3

---

### Test Case 37.3.4: System Monitor Widget 權限測試

**Objective:** 驗證 System Monitor Widget 權限請求

**Steps:**
1. Clear System Monitor permissions
2. Create System Monitor Widget
3. Check permission dialog

**Expected Results:**
- ✅ Permission dialog appears
- ✅ Dialog requests "systemInfo.cpu" permission
- ✅ Dialog requests "systemInfo.memory" permission
- ✅ widget.config.json declares these permissions

**Requirements Verified:** 8.4, 8.5

---

### Test Case 37.3.5: Weather Widget 顯示測試

**Objective:** 驗證 Weather Widget 可以獲取天氣數據

**Steps:**
1. Create Weather Widget
2. Grant network permissions
3. Wait for weather data to load (up to 10 seconds)

**Expected Results:**
- ✅ Loading indicator appears initially
- ✅ City name displays (default: Taipei)
- ✅ Temperature displays in °C format
- ✅ Weather condition displays (e.g., "Clear", "Cloudy")
- ✅ Weather icon displays (if implemented)
- ✅ Data updates every 10 minutes
- ✅ No errors if API is unavailable (graceful degradation)

**Requirements Verified:** 9.1, 9.2

---

### Test Case 37.3.6: Weather Widget 設定測試

**Objective:** 驗證 Weather Widget 使用 settings API

**Steps:**
1. Check Weather Widget's settings configuration
2. Modify city setting (if UI available)
3. Restart widget

**Expected Results:**
- ✅ Widget reads city from settings
- ✅ Settings persist across restarts
- ✅ Weather data updates for new city

**Requirements Verified:** 9.3

---

### Test Case 37.3.7: Weather Widget 權限測試

**Objective:** 驗證 Weather Widget 網路權限

**Steps:**
1. Clear Weather Widget permissions
2. Create Weather Widget
3. Check permission dialog

**Expected Results:**
- ✅ Permission dialog appears
- ✅ Dialog requests "network" permission
- ✅ widget.config.json declares network.enabled = true
- ✅ widget.config.json lists allowed domains

**Requirements Verified:** 9.4, 9.5

---

## Test Suite 37.4: Marketplace 測試

### Test Case 37.4.1: Marketplace 首頁測試

**Objective:** 驗證首頁顯示 Widget 列表

**Steps:**
1. Start Marketplace development server: `cd widget-marketplace && npm run dev`
2. Open browser to http://localhost:3000
3. Observe homepage

**Expected Results:**
- ✅ Page loads without errors
- ✅ Widget cards display in grid layout
- ✅ Each card shows widget name
- ✅ Each card shows widget description
- ✅ Each card shows download count
- ✅ Each card shows widget icon (if available)
- ✅ At least 5 widgets are visible
- ✅ Layout is responsive

**Requirements Verified:** 6.1, 13.3

---

### Test Case 37.4.2: Marketplace 搜索測試

**Objective:** 驗證搜索功能

**Steps:**
1. On Marketplace homepage
2. Locate search bar
3. Type "clock" in search bar
4. Observe results

**Expected Results:**
- ✅ Search bar is visible and functional
- ✅ Results filter in real-time as you type
- ✅ Only matching widgets display
- ✅ Search matches widget name
- ✅ Search matches widget description
- ✅ Search is case-insensitive
- ✅ Clearing search shows all widgets again

**Requirements Verified:** 13.4

---

### Test Case 37.4.3: Widget 詳情頁測試

**Objective:** 驗證詳情頁顯示完整資訊

**Steps:**
1. On Marketplace homepage
2. Click on any widget card
3. Observe detail page

**Expected Results:**
- ✅ Page navigates to /widgets/[id]
- ✅ Widget name displays prominently
- ✅ Full description displays
- ✅ Author name displays
- ✅ Author email displays (if available)
- ✅ Version number displays
- ✅ Download count displays
- ✅ Permissions list displays
- ✅ Each permission is clearly labeled
- ✅ Install button is visible and prominent

**Requirements Verified:** 6.2, 6.3

---

### Test Case 37.4.4: Install 按鈕協議測試

**Objective:** 驗證 Install 按鈕觸發協議

**Steps:**
1. On widget detail page
2. Click "Install Widget" button
3. Observe browser behavior

**Expected Results:**
- ✅ Browser attempts to open widget:// protocol
- ✅ URL format is widget://install/[widget-id]
- ✅ If Widget Container is running, it receives the protocol
- ✅ If Widget Container is not running, browser shows protocol handler dialog
- ✅ No JavaScript errors in console

**Requirements Verified:** 6.4, 6.5

---

### Test Case 37.4.5: Marketplace 404 測試

**Objective:** 驗證不存在的 Widget 處理

**Steps:**
1. Navigate to http://localhost:3000/widgets/non-existent-widget
2. Observe page

**Expected Results:**
- ✅ 404 page displays (or error message)
- ✅ User-friendly error message
- ✅ Link back to homepage
- ✅ No application crash

**Requirements Verified:** 6.2

---

## Performance Testing

### Test Case P1: 記憶體使用測試

**Steps:**
1. Open Task Manager / Activity Monitor
2. Start Widget Container
3. Create 5 widgets
4. Monitor memory usage for 5 minutes

**Expected Results:**
- ✅ Total memory usage < 500MB
- ✅ No memory leaks (usage stays stable)
- ✅ Memory doesn't grow continuously

**Requirements Verified:** 15.1

---

### Test Case P2: CPU 使用測試

**Steps:**
1. Create 5 widgets
2. Monitor CPU usage in Task Manager
3. Observe for 2 minutes

**Expected Results:**
- ✅ Idle CPU usage < 5%
- ✅ No single widget uses > 20% CPU continuously
- ✅ System remains responsive

**Requirements Verified:** 15.3

---

### Test Case P3: 渲染性能測試

**Steps:**
1. Create multiple widgets with animations
2. Drag widgets around screen
3. Observe smoothness

**Expected Results:**
- ✅ Animations are smooth (no stuttering)
- ✅ Dragging is responsive
- ✅ Frame rate stays above 30 FPS

**Requirements Verified:** 15.2

---

## Security Testing

### Test Case S1: 沙盒隔離測試

**Steps:**
1. Open DevTools in widget window (development mode)
2. Try to access Node.js APIs: `require('fs')`
3. Try to access Electron APIs: `require('electron')`

**Expected Results:**
- ✅ `require` is not defined
- ✅ Node.js APIs are not accessible
- ✅ Only `window.widgetAPI` is available
- ✅ Console shows security errors for unauthorized access

**Requirements Verified:** 2.1, 2.2, 2.5

---

### Test Case S2: CSP 測試

**Steps:**
1. Open DevTools in widget window
2. Check Network tab for CSP headers
3. Try to execute inline script from console

**Expected Results:**
- ✅ CSP headers are present
- ✅ Inline scripts are blocked (if not whitelisted)
- ✅ Only allowed domains can be accessed

**Requirements Verified:** 2.3

---

## Test Execution Checklist

Use this checklist to track your manual testing progress:

### Widget 生命週期 (37.1)
- [ ] 37.1.1: Widget 創建測試
- [ ] 37.1.2: Widget 關閉測試
- [ ] 37.1.3: Widget 拖曳測試
- [ ] 37.1.4: Widget 位置持久化測試
- [ ] 37.1.5: 多個 Widget 同時運行

### 權限系統 (37.2)
- [ ] 37.2.1: 權限對話框顯示測試
- [ ] 37.2.2: 權限授予測試
- [ ] 37.2.3: 權限拒絕測試
- [ ] 37.2.4: 速率限制測試
- [ ] 37.2.5: 未授權 API 訪問測試

### 範例 Widgets (37.3)
- [ ] 37.3.1: Clock Widget 顯示測試
- [ ] 37.3.2: Clock Widget 權限測試
- [ ] 37.3.3: System Monitor Widget 顯示測試
- [ ] 37.3.4: System Monitor Widget 權限測試
- [ ] 37.3.5: Weather Widget 顯示測試
- [ ] 37.3.6: Weather Widget 設定測試
- [ ] 37.3.7: Weather Widget 權限測試

### Marketplace (37.4)
- [ ] 37.4.1: Marketplace 首頁測試
- [ ] 37.4.2: Marketplace 搜索測試
- [ ] 37.4.3: Widget 詳情頁測試
- [ ] 37.4.4: Install 按鈕協議測試
- [ ] 37.4.5: Marketplace 404 測試

### Performance & Security
- [ ] P1: 記憶體使用測試
- [ ] P2: CPU 使用測試
- [ ] P3: 渲染性能測試
- [ ] S1: 沙盒隔離測試
- [ ] S2: CSP 測試

---

## Bug Reporting Template

When you find a bug during manual testing, use this template:

```markdown
## Bug Report

**Test Case:** [Test case number and name]
**Severity:** [Critical / High / Medium / Low]
**Status:** [New / In Progress / Fixed]

**Description:**
[Clear description of the bug]

**Steps to Reproduce:**
1. [Step 1]
2. [Step 2]
3. [Step 3]

**Expected Result:**
[What should happen]

**Actual Result:**
[What actually happened]

**Screenshots:**
[Attach screenshots if applicable]

**Environment:**
- OS: [Windows 11 / macOS / Linux]
- Widget Container Version: [Version]
- Widget SDK Version: [Version]

**Additional Notes:**
[Any other relevant information]
```

---

## Testing Tips

1. **Clear State Between Tests:** Delete `%APPDATA%/widget-container` folder to reset all data
2. **Check Console Logs:** Always check DevTools console for errors
3. **Test Edge Cases:** Try extreme values, rapid clicks, network failures
4. **Cross-Platform:** Test on both Windows and macOS if possible
5. **Document Everything:** Take screenshots of bugs and unexpected behavior
6. **Performance Monitoring:** Keep Task Manager open during testing
7. **Network Conditions:** Test with slow/no internet for Weather Widget

---

## Quick Start Commands

```bash
# Check if ready for manual testing
cd widget-container
npm run test:manual

# Build everything (if needed)
cd widget-container && npm run build
cd ../examples/clock && npm run build
cd ../system-monitor && npm run build
cd ../weather && npm run build

# Start Widget Container
cd widget-container && npm start

# Start Marketplace (separate terminal)
cd widget-marketplace && npm run dev

# Clear all data (reset state)
# Windows:
rmdir /s /q %APPDATA%\widget-container

# macOS/Linux:
rm -rf ~/Library/Application\ Support/widget-container
```

---

## Success Criteria

All test cases should pass with ✅ for the manual testing phase to be considered complete. Any failures should be documented as bugs and prioritized for fixing.
