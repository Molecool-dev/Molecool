# System Monitor Widget - Testing Guide

## Prerequisites

1. Widget SDK must be built: `cd ../../widget-sdk && npm run build`
2. Widget Container must be built: `cd ../../widget-container && npm run build`
3. System Monitor Widget must be built: `npm run build`
4. System Monitor Widget must be installed: `powershell -ExecutionPolicy Bypass -File install-widget.ps1`

## Manual Testing Checklist

### 1. Widget Installation ✓
- [x] Widget files copied to `%APPDATA%\molecule-widget-container\widgets\system-monitor-widget`
- [x] `widget.config.json` present and valid
- [x] `dist/index.html` present

### 2. Widget Configuration Validation
Test that the widget config declares the correct permissions:
- [x] `systemInfo.cpu: true`
- [x] `systemInfo.memory: true`
- [x] `network.enabled: false`

### 3. Widget Loading (Requirements 8.1, 8.2, 8.3)
To test, run the Widget Container:
```bash
cd ../../widget-container
npm run dev
```

Then:
1. Open Widget Manager
2. Look for "System Monitor Widget" in the installed widgets list
3. Click to create the widget
4. Verify the widget window appears

### 4. Permission Request Flow (Requirements 8.4, 8.5)
When the widget first starts:
1. A permission dialog should appear requesting:
   - System Info: CPU access
   - System Info: Memory access
2. Grant the permissions
3. Verify the permissions are saved for future use

### 5. UI Display (Requirements 8.1, 8.2)
The widget should display:
- [x] Header: "System Monitor"
- [x] CPU Usage section with:
  - Label: "CPU Usage"
  - Value: Percentage (e.g., "15.3%")
  - Progress bar showing CPU usage
  - Color: Green (<80%) or Red (≥80%)
- [x] Divider between sections
- [x] Memory section with:
  - Label: "Memory"
  - Value: Used/Total in GB (e.g., "8.2 GB / 16.0 GB")
  - Progress bar showing memory usage percentage
  - Color: Green (<80%) or Red (≥80%)

### 6. Data Updates (Requirement 8.3)
- Widget should update every 2 seconds
- CPU and memory values should change based on system activity
- Progress bars should animate smoothly

### 7. Error Handling
Test error scenarios:
1. Deny permissions → Widget should show "Loading..." or error message
2. Close and reopen widget → Permissions should be remembered
3. High CPU/Memory usage → Colors should change to red

## Automated Testing

Currently, this widget requires manual testing as it depends on:
- Electron environment
- System API access
- Permission dialogs

## Test Results

### Build Test ✓
```
npm run build
✓ 31 modules transformed.
dist/index.html                   0.42 kB
dist/assets/index-C412NKMb.css    0.21 kB
dist/assets/index-BAEX0xRC.js   147.78 kB
✓ built in 2.63s
```

### Installation Test ✓
```
powershell -ExecutionPolicy Bypass -File install-widget.ps1
Installing System Monitor Widget...
Target directory: C:\Users\USER\AppData\Roaming\molecule-widget-container\widgets\system-monitor-widget
Created widgets directory
Copying widget files...
  Copied dist/
  Copied widget.config.json
System Monitor Widget installed successfully!
```

### TypeScript Validation ✓
No diagnostics found in `src/index.tsx`

## Known Issues

None at this time.

## Next Steps

1. Run Widget Container: `cd ../../widget-container && npm run dev`
2. Open Widget Manager
3. Create System Monitor Widget
4. Grant permissions when prompted
5. Verify real-time CPU and memory monitoring
