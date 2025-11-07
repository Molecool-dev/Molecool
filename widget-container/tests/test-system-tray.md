# System Tray Manual Test Checklist

This document provides a comprehensive checklist for manually testing the system tray functionality.

## Prerequisites

1. Build the application: `npm run build`
2. Start the application: `npm start`

## Test Cases

### Test 1: Tray Icon Appears (Requirement 10.1)

**Steps:**
1. Start the application
2. Look for the tray icon in:
   - **Windows**: Notification area (bottom-right, may need to click ^ to show hidden icons)
   - **macOS**: Menu bar (top-right)
   - **Linux**: System tray

**Expected Result:**
- ✅ Tray icon is visible
- ✅ Icon is recognizable (blue border with white center, or custom icon if provided)
- ✅ Hovering shows tooltip: "Molecule Widget Platform"

**Status:** [ ] Pass [ ] Fail

**Notes:**
_______________________________________________________________________

---

### Test 2: Context Menu Displays (Requirement 10.2)

**Steps:**
1. Right-click the tray icon
2. Observe the menu that appears

**Expected Result:**
- ✅ Context menu appears
- ✅ Menu contains "Open Manager" option
- ✅ Menu contains separator line
- ✅ Menu contains "Exit" option
- ✅ Menu items are clickable

**Status:** [ ] Pass [ ] Fail

**Notes:**
_______________________________________________________________________

---

### Test 3: Open Manager - Window Doesn't Exist (Requirement 10.3)

**Steps:**
1. Close the manager window completely (if open)
2. Right-click tray icon
3. Click "Open Manager"

**Expected Result:**
- ✅ Manager window is created and displayed
- ✅ Window is focused and in foreground
- ✅ Window content loads correctly

**Status:** [ ] Pass [ ] Fail

**Notes:**
_______________________________________________________________________

---

### Test 4: Open Manager - Window Hidden (Requirement 10.3)

**Steps:**
1. Close the manager window (click X button)
2. Verify window is hidden but app still running
3. Right-click tray icon
4. Click "Open Manager"

**Expected Result:**
- ✅ Hidden window becomes visible
- ✅ Window is focused and in foreground
- ✅ Window state is preserved (same content as before hiding)

**Status:** [ ] Pass [ ] Fail

**Notes:**
_______________________________________________________________________

---

### Test 5: Open Manager - Window Minimized (Requirement 10.3)

**Steps:**
1. Minimize the manager window
2. Right-click tray icon
3. Click "Open Manager"

**Expected Result:**
- ✅ Window is restored from minimized state
- ✅ Window is focused and in foreground
- ✅ Window returns to previous size and position

**Status:** [ ] Pass [ ] Fail

**Notes:**
_______________________________________________________________________

---

### Test 6: Open Manager - Window Already Visible (Requirement 10.3)

**Steps:**
1. Ensure manager window is visible
2. Click on another application to lose focus
3. Right-click tray icon
4. Click "Open Manager"

**Expected Result:**
- ✅ Window is brought to foreground
- ✅ Window receives focus
- ✅ No duplicate windows are created

**Status:** [ ] Pass [ ] Fail

**Notes:**
_______________________________________________________________________

---

### Test 7: Double-Click Opens Manager (Windows/Linux)

**Steps:**
1. Close or hide the manager window
2. Double-click the tray icon

**Expected Result:**
- ✅ Manager window opens/shows
- ✅ Window is focused

**Status:** [ ] Pass [ ] Fail [ ] N/A (macOS)

**Notes:**
_______________________________________________________________________

---

### Test 8: Hide on Close (Requirement 10.5)

**Steps:**
1. Open the manager window
2. Click the X button (close button) on the window
3. Check if app is still running in tray

**Expected Result:**
- ✅ Window disappears (is hidden)
- ✅ Tray icon remains visible
- ✅ Application continues running
- ✅ Can reopen window from tray menu

**Status:** [ ] Pass [ ] Fail

**Notes:**
_______________________________________________________________________

---

### Test 9: Widgets Continue Running When Manager Hidden

**Steps:**
1. Create a widget (e.g., Clock widget using Ctrl+Shift+W)
2. Verify widget is visible and updating
3. Close the manager window (click X)
4. Observe the widget

**Expected Result:**
- ✅ Widget continues to display
- ✅ Widget continues to update (clock ticks)
- ✅ Widget remains functional
- ✅ Manager window is hidden but app runs in tray

**Status:** [ ] Pass [ ] Fail

**Notes:**
_______________________________________________________________________

---

### Test 10: Exit Closes All Widgets (Requirement 10.4)

**Steps:**
1. Create one or more widgets
2. Verify widgets are running
3. Right-click tray icon
4. Click "Exit"
5. Observe what happens

**Expected Result:**
- ✅ All widget windows close
- ✅ Manager window closes
- ✅ Tray icon disappears
- ✅ Application quits completely
- ✅ No processes remain running

**Status:** [ ] Pass [ ] Fail

**Notes:**
_______________________________________________________________________

---

### Test 11: State Persistence After Exit

**Steps:**
1. Create a widget and move it to a specific position
2. Right-click tray icon and click "Exit"
3. Restart the application
4. Check if widget is restored

**Expected Result:**
- ✅ Widget is restored at the same position
- ✅ Widget state is preserved
- ✅ Application starts with tray icon

**Status:** [ ] Pass [ ] Fail

**Notes:**
_______________________________________________________________________

---

### Test 12: macOS Activate Event

**macOS Only**

**Steps:**
1. Hide or close the manager window
2. Click the Molecule icon in the dock
3. Observe what happens

**Expected Result:**
- ✅ Manager window opens/shows
- ✅ Window is focused

**Status:** [ ] Pass [ ] Fail [ ] N/A (not macOS)

**Notes:**
_______________________________________________________________________

---

### Test 13: Window-All-Closed Behavior

**Steps:**
1. Open manager window
2. Create no widgets (or close all widgets)
3. Close the manager window
4. Check if app is still running

**Expected Result:**
- ✅ Application continues running in tray
- ✅ Tray icon remains visible
- ✅ Can reopen manager from tray

**Status:** [ ] Pass [ ] Fail

**Notes:**
_______________________________________________________________________

---

### Test 14: Cleanup on Exit

**Steps:**
1. Create some widgets
2. Right-click tray icon and click "Exit"
3. Check Task Manager / Activity Monitor

**Expected Result:**
- ✅ All Electron processes terminate
- ✅ No zombie processes remain
- ✅ Memory is released

**Status:** [ ] Pass [ ] Fail

**Notes:**
_______________________________________________________________________

---

## Summary

**Total Tests:** 14
**Passed:** _____
**Failed:** _____
**N/A:** _____

**Overall Status:** [ ] All Pass [ ] Some Failures

**Critical Issues Found:**
_______________________________________________________________________
_______________________________________________________________________
_______________________________________________________________________

**Non-Critical Issues Found:**
_______________________________________________________________________
_______________________________________________________________________
_______________________________________________________________________

**Tested By:** _____________________
**Date:** _____________________
**Platform:** [ ] Windows [ ] macOS [ ] Linux
**Version:** _____________________

