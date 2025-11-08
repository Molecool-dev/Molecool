# Implementation Plan

## Phase 1: Core Infrastructure

- [x] 1. Set up Widget Container project structure
  - Initialize Electron project, configure TypeScript and basic package.json
  - Create src/main, src/renderer, src/preload directory structure
  - Configure electron-builder for packaging
  - Install core dependencies: electron, electron-store
  - _Requirements: 1.1, 1.2_

- [x] 2. Implement basic window system
  - Create window-controller.js, implement createWidgetWindow and createManagerWindow methods
  - Configure BrowserWindow security options (nodeIntegration: false, contextIsolation: true, sandbox: true)
  - Implement glassmorphism effect and transparent background
  - Create frameless, always-on-top widget windows
  - _Requirements: 1.2, 2.1, 2.2, 12.1, 12.2, 12.3, 12.4_

- [x] 3. Establish IPC communication foundation
  - Create ipc-handlers.js, set up basic ipcMain.handle structure
  - Implement widget-preload.js, expose secure API using contextBridge
  - Implement manager-preload.js, provide API for Manager
  - Test basic renderer → main → renderer communication flow
  - _Requirements: 1.3, 2.4, 14.1, 14.2, 14.3, 14.4, 14.5_

- [x] 4. Implement data persistence
  - Create storage.js, initialize electron-store
  - Implement setWidgetData, getWidgetData, deleteWidgetData methods
  - Implement saveWidgetState and getWidgetState methods
  - Add storage:get, storage:set, storage:delete handlers in IPC handlers
  - _Requirements: 1.4, 4.4_

- [x] 5. Implement widget window dragging functionality
  - Implement enableDragging method in window-controller.ts
  - Listen to window move events, update widget position
  - Implement automatic position saving to storage (500ms debounce)
  - Smart detection of interactive elements to avoid drag conflicts
  - Use delta-based positioning to avoid drift
  - Test dragging functionality and position persistence
  - _Requirements: 1.3, 1.4_

## Phase 2: Widget SDK Core

- [x] 6. Set up Widget SDK project
  - Initialize React + TypeScript + Vite project
  - Configure package.json, set to library mode
  - Configure vite.config.ts, set build.lib options
  - Set up TypeScript type definition exports
  - _Requirements: 4.1, 11.5_

- [x] 7. Implement core API interfaces
  - Create core/WidgetAPI.ts, define WidgetAPIContext, StorageAPI, SettingsAPI, SystemAPI, UIAPI interfaces
  - Implement WidgetProvider component, create React Context
  - Implement development mode mock API (createMockAPI)
  - Implement API bridging with window.widgetAPI
  - _Requirements: 4.1, 4.2, 11.4_

- [x] 8. Implement basic React Hooks
  - Create hooks/useWidgetAPI.ts
  - Create hooks/useInterval.ts, implement timer Hook
  - Create hooks/useStorage.ts, implement reactive storage Hook
  - Create hooks/useSettings.ts
  - _Requirements: 4.3_

- [x] 9. Implement basic UI components (first batch of 8)
  - Create components/Widget.tsx, implement Container component
  - Create components/Typography.tsx, implement Title, LargeText, SmallText components
  - Create components/Buttons.tsx, implement Button component
  - Create components/Layout.tsx, implement Grid, Divider, Header components
  - Add CSS Modules styles for all components, apply glassmorphism effect
  - _Requirements: 4.2, 12.5_

- [x] 10. Implement advanced UI components (second batch of 7)
  - Create components/DataDisplay.tsx, implement Stat, ProgressBar components
  - Create components/Forms.tsx, implement Input, Select components
  - Create components/List.tsx, implement List, ListItem components
  - Create components/Badge.tsx and Link.tsx
  - Add TypeScript type definitions and styles for all components
  - _Requirements: 4.2_

## Phase 3: Widget Manager and Lifecycle

- [x] 11. Implement Widget Manager core logic
  - Create widget-manager.js, define WidgetInstance interface
  - Implement loadInstalledWidgets method, scan widgets directory
  - Implement createWidget method, create widget window and load content
  - Implement closeWidget method, clean up resources
  - Implement getRunningWidgets method
  - _Requirements: 1.1, 1.5_

- [x] 12. Implement widget state management
  - Implement saveWidgetState method in widget-manager.js
  - Implement restoreWidgets method, restore widgets from last session on app startup
  - Automatically save state when widget closes
  - Test widget position and state restoration after restart
  - _Requirements: 1.4, 1.5_

- [x] 13. Create Widget Manager UI
  - Create src/renderer/manager.html, design Manager interface
  - Create src/renderer/manager.js, implement widget list display
  - Implement "Create Widget" button, call IPC to create widget
  - Implement "Close Widget" functionality
  - Display running widget list
  - _Requirements: 1.1, 1.5_

- [x] 14. Implement widget.config.json validation
  - Add validateConfig method in widget-manager.js
  - Validate required fields: id, name, displayName, version, permissions, sizes
  - Validate permissions structure
  - Reject loading of invalid widget configurations
  - _Requirements: 5.1, 5.2, 5.3, 5.4, 5.5_

## Phase 4: System API and Permissions

- [x] 15. Implement system information API
  - Create system-api.ts, use Node.js os module
  - Implement getCPUUsage method, calculate CPU usage (delta-based calculation)
  - Implement getMemoryInfo method, return memory information
  - Implement getSystemInfo method, return complete system information
  - Integrate into IPC handlers, implement system:getCPU and system:getMemory
  - Add zero-division protection and error handling
  - _Requirements: 4.5, 8.1, 8.2_

- [x] 16. Implement permission management system ✨ ENHANCED
  - Create permissions.ts, define PermissionSet interface
  - Implement hasPermission method, check widget permissions (with validation)
  - Implement savePermission and getPermissions methods (with validation)
  - Add permission storage functionality in storage.ts
  - ✨ New: Permission format validation and error handling
  - ✨ New: Memory leak protection (automatic cleanup of expired rate limit records)
  - ✨ New: Enhanced rate limiting (support for throwing error option)
  - ✨ New: Resource cleanup method (destroy)
  - _Requirements: 3.2, 3.3, 8.4_

- [x] 17. Implement permission request dialog ✅ COMPLETE
  - Implement requestPermission method in permissions.js
  - Use Electron dialog to display permission request dialog
  - Display widget name and requested permissions
  - Save user's authorization decision
  - ✅ Testing complete: All tests passing
  - ✅ Documentation updated: permissions-api.md
  - _Requirements: 3.1, 3.5_

- [x] 18. Implement API rate limiting ✅ COMPLETE
  - Implement checkRateLimit method in permissions.js
  - Use Map to track API call count for each widget
  - Set limit of maximum 10 calls per second
  - Throw RATE_LIMIT_EXCEEDED error when limit exceeded
  - ✅ Includes memory leak protection and automatic cleanup
  - _Requirements: 3.4, 15.4_

- [x] 19. Integrate system API into IPC handlers
  - Add system:getCPU and system:getMemory handlers in ipc-handlers.js
  - Call permission checks and rate limiting in handlers
  - Expose system API in widget-preload.js
  - Test permission request flow
  - _Requirements: 4.5, 8.4, 8.5_

- [x] 20. Implement useSystemInfo Hook
  - Create hooks/useSystemInfo.ts
  - Use useInterval to periodically fetch system information
  - Handle permission denied errors
  - Support both CPU and memory types
  - _Requirements: 4.3, 8.3_

## Phase 5: Example Widgets

- [x] 21. Create Clock Widget ✅ COMPLETE + TESTED
  - ✅ Initialize examples/clock project, install Widget SDK
  - ✅ Create widget.config.json, declare no special permissions required
  - ✅ Create src/index.tsx, implement clock UI
  - ✅ Use useState and useInterval to implement per-second updates
  - ✅ Display time in HH:MM format and date
  - ✅ Use Widget.Container, Widget.LargeText, Widget.SmallText components
  - ✅ Configure Vite bundling
  - ✅ Testing complete: 7/7 tests all passing (ClockWidget.test.tsx)
    - Render test (1/1 passing)
    - Time display test (1/1 passing)
    - Date display test (1/1 passing)
    - Time update test (1/1 passing)
    - Zero-padding test (1/1 passing)
    - Edge case tests (2/2 passing: midnight and noon)
  - ✅ Documentation updated: README.md includes testing instructions
  - _Requirements: 7.1, 7.2, 7.3, 7.4, 7.5_

- [x] 22. Create System Monitor Widget
  - Initialize examples/system-monitor project
  - Create widget.config.json, declare requirements for systemInfo.cpu and systemInfo.memory permissions
  - Create src/index.tsx, implement system monitor UI
  - Use useSystemInfo Hook to fetch CPU and memory information
  - Use Widget.Stat and Widget.ProgressBar to display data
  - Update data every 2 seconds
  - Test permission request flow
  - _Requirements: 8.1, 8.2, 8.3, 8.4, 8.5_

- [x] 23. Create Weather Widget
  - Initialize examples/weather project
  - Create widget.config.json, declare network permission requirement and allowed weather API domains
  - Create src/index.tsx, implement weather UI
  - Use useSettings Hook to read city settings
  - Implement fetchWeather function, call weather API
  - Use useInterval to update weather every 10 minutes
  - Display temperature and weather conditions
  - _Requirements: 9.1, 9.2, 9.3, 9.4, 9.5_

## Phase 6: Marketplace Foundation

- [x] 24. Set up Marketplace project
  - Initialize Next.js 15 project (App Router)
  - Install and configure Tailwind CSS
  - Set up Supabase client (lib/supabase.ts)
  - Configure environment variables (NEXT_PUBLIC_SUPABASE_URL, NEXT_PUBLIC_SUPABASE_ANON_KEY)
  - _Requirements: 13.1_

- [x] 25. Create Supabase database schema
  - Create widgets table in Supabase
  - Define fields: id, widget_id, name, display_name, description, author_name, author_email, version, downloads, permissions, sizes, icon_url, download_url, created_at, updated_at
  - Create indexes: idx_widgets_widget_id, idx_widgets_downloads
  - Populate with 5-10 example widget data
  - _Requirements: 13.2, 13.5_

- [x] 26. Implement Marketplace homepage
  - Create app/page.tsx, implement homepage layout
  - Query all widgets from Supabase
  - Create components/WidgetCard.tsx, display widget cards
  - Use Grid layout to display widget list
  - Display widget name, description, download count
  - _Requirements: 6.1, 13.3_

- [x] 27. Implement search functionality
  - Create components/SearchBar.tsx
  - Implement frontend search, filter by name and description
  - Use useState to manage search state
  - Update search results in real-time
  - _Requirements: 13.4_

- [x] 28. Implement widget detail page
  - Create app/widgets/[id]/page.tsx
  - Query single widget from Supabase
  - Display complete widget information (name, description, author, version, download count)
  - Create components/PermissionsList.tsx, display permission requirements
  - Implement Install button, open widget://install/xxx protocol
  - Handle widget not found case (404)
  - _Requirements: 6.2, 6.3, 6.4_

## Phase 7: Widget Installation Mechanism

- [x] 29. Implement custom URL protocol ✅ COMPLETE + ENHANCED





  - Register widget:// protocol in Widget Container
  - Use app.setAsDefaultProtocolClient('widget')
  - Listen to open-url event (macOS) and second-instance event (Windows)
  - Parse widget://install/xxx URL, extract Widget ID
  - ✅ Enhancement: Widget ID format validation (prevent path traversal and XSS)
  - ✅ Enhancement: Use dialog.showMessageBox instead of showErrorBox (non-blocking)
  - ✅ Enhancement: Wait for app.whenReady() to avoid race conditions
  - ✅ Enhancement: Extract handleWidgetInstall function for better maintainability
  - ✅ Enhancement: Correct URL parsing (host + pathname combination)
  - ✅ Testing: 19 test cases all passing (verify-protocol-handler.js)
  - ✅ Documentation: README.md and docs/ updated
  - _Requirements: 6.5_

- [x] 30. Implement widget download and installation
  - Implement installWidget method in widget-manager.js
  - Get widget download URL from Marketplace API
  - Download widget file (.widget zip)
  - Extract to widgets directory
  - Validate widget.config.json
  - Add to installed widget list
  - _Requirements: 6.5_

## Phase 8: System Tray and Optimization

- [x] 31. Implement system tray
  - Create Tray instance in main process
  - Set tray icon
  - Create context menu (Open Manager, Exit)
  - Implement "Open Manager" functionality, show or focus Manager window
  - Implement "Exit" functionality, close all widgets and exit application
  - Hide Manager window instead of exiting when closed
  - _Requirements: 10.1, 10.2, 10.3, 10.4, 10.5_

- [x] 32. Implement error handling ✅ COMPLETE
  - ✅ Create WidgetError class and WidgetErrorType enum (widget-sdk/src/types/errors.ts)
  - ✅ Add try-catch in all IPC handlers (widget-container/src/main/ipc-handlers.ts)
  - ✅ Return standardized error response { success: false, error: { type, message } }
  - ✅ Handle errors in Widget SDK, throw WidgetError
  - ✅ Add Error Boundary in WidgetProvider
  - ✅ Testing complete: 11/11 tests all passing ✨ (error-handling.test.ts)
    - Storage error handling tests (3/3 passing)
    - UI error handling tests (4/4 passing)
    - Error response format tests (3/3 passing)
    - WidgetError class tests (1/1 passing)
  - ✅ Documentation updated: README.md and docs/error-handling.md
  - ✅ New features:
    - getUserMessage() - User-friendly error messages
    - toJSON() - Error serialization for logging
    - isWidgetError() - Type guard function
    - toWidgetError() - Error conversion utility
    - Complete error type system (6 error types)
    - Standardized IPC error response format
  - _Requirements: 15.5_

- [x] 33. Implement performance optimization ✅ COMPLETE
  - ✅ Enable hardware acceleration and v8 cache in BrowserWindow configuration
  - ✅ Implement widget count limit (maximum 10)
  - ✅ Clean up event listeners and resources in closeWidget
  - ✅ Monitor widget CPU usage, log warning when exceeding 20%
  - ✅ Provide useThrottle Hook in Widget SDK
  - ✅ Testing complete: 17/17 tests all passing (useThrottle.test.tsx + useThrottle.test.ts)
  - ✅ Exported to SDK public API (src/index.ts)
  - ✅ Includes memory leak protection (timeout cleanup)
  - ✅ Supports generic types (applicable to any data type)
  - ✅ Documentation updated: README.md and docs/hooks/useThrottle.md
  - _Requirements: 15.1, 15.2, 15.3, 15.4_

- [x] 34. Implement CSP and security configuration ✅ COMPLETE + ENHANCED
  - ✅ Set CSP in session.defaultSession.webRequest.onHeadersReceived
  - ✅ Configure default-src 'none', script-src 'self', style-src 'self' 'unsafe-inline'
  - ✅ Dynamically set connect-src whitelist based on widget configuration
  - ✅ Block HTTP requests in onBeforeRequest, only allow HTTPS
  - ✅ Testing complete: 20/20 tests all passing (security.test.ts)
  - ✅ Enhanced features:
    - Prevent duplicate initialization (avoid memory leaks)
    - Domain format validation (prevent XSS and path traversal)
    - Reject HTTP domains (HTTPS only)
    - Reject wildcards and malicious patterns
    - Error handling (CSP and network filtering)
    - Image source restrictions (img-src 'self' data: https:)
    - Domain normalization (automatically add https://)
  - ✅ Documentation updated: README.md and docs/security.md
  - ✅ SecurityManager class implementation complete (src/main/security.ts)
  - ✅ Includes initialize(), registerWidget(), unregisterWidget(), destroy() methods
  - ✅ Dynamic CSP based on registered widget configuration
  - ✅ Supports localhost development environment (HTTP exception)
  - _Requirements: 2.3, 2.5_

## Phase 9: Testing and Documentation

- [x] 35. Write unit tests
  - [x] 35.1 Write Jest tests for widget-manager.js ✅ COMPLETE
    - ✅ Test validateWidgetConfig method (4 test cases)
    - ✅ Test loadInstalledWidgets method (3 test cases)
    - ✅ Test safeDeleteFile method (3 test cases)
    - ✅ Test removeDirectory method (2 test cases)
    - ✅ Test getRunningWidgets and getWidgetsDirectory methods
    - ✅ All 14 tests passing
    - ✅ Jest configuration complete (jest.config.js)
    - ✅ TypeScript type support complete
    - _Requirements: 1.1, 1.5_
  
  - [x] 35.2 Write Vitest tests for Widget SDK Hooks
    - Test useStorage Hook get/set/remove functionality
    - Test useInterval Hook
    - Use React Testing Library
    - _Requirements: 4.3_

- [x] 36. Write integration tests ✅ COMPLETE
  - [x] 36.1 Test IPC communication ✅ COMPLETE (20/20 tests passing)
    - ✅ Test storage API complete flow (4 tests)
    - ✅ Test system API permission checks (6 tests)
    - ✅ Test settings API (2 tests)
    - ✅ Test UI API (5 tests)
    - ✅ Test error handling (2 tests)
    - ✅ Test cross-API integration (1 test)
    - ✅ Includes type safety improvements
    - ✅ Includes rate limit cleanup to prevent test interference
    - ✅ Documentation updated: README.md, docs/testing.md, docs/ipc-response-format.md
    - _Requirements: 14.4, 14.5_

- [x] 37. Execute manual testing ✅ PREPARATION COMPLETE
  - [x] 37.0 Prepare manual testing environment ✅ COMPLETE
    - ✅ Create prepare-manual-testing.js script
    - ✅ Check Widget Container build status
    - ✅ Check example widgets build status
    - ✅ Check Widget SDK build status
    - ✅ Check documentation availability
    - ✅ Provide build commands and quick start instructions
    - ✅ Add npm run test:manual script
    - ✅ Update README.md and MANUAL_TESTING_GUIDE.md
    - ✅ Create manual-testing-preparation.md documentation
    - _Requirements: All (preparation)_

  - [x] 37.1 Test widget lifecycle
    - Verify widgets can be created and closed normally
    - Verify widgets can be dragged
    - Verify widget position persists after restart
    - _Requirements: 1.1, 1.3, 1.4_

  - [x] 37.2 Test permission system ✅ COMPLETE (30+ tests)
    - ✅ Verify permission dialog displays correctly (3 tests)
    - ✅ Verify permission grant and deny functionality (8 tests)
    - ✅ Verify rate limiting (7 tests)
    - ✅ Verify unauthorized API access blocking (5 tests)
    - ✅ Permission persistence and resource cleanup (7+ tests)
    - ✅ Test file: `widget-container/src/main/__tests__/permissions.test.ts`
    - ✅ Documentation updated: README.md, testing.md, permissions-api.md
    - _Requirements: 3.1, 3.2, 3.3, 3.4_

  - [x] 37.3 Test example widgets



    - Verify Clock Widget displays and updates correctly
    - Verify System Monitor Widget displays correct system information
    - Verify Weather Widget can fetch weather data
    - _Requirements: 7.1, 7.2, 7.3, 8.1, 8.2, 9.1, 9.2_
  
  - [x] 37.4 Test Marketplace
    - Verify homepage displays widget list
    - Verify search functionality
    - Verify detail page displays complete information
    - Verify Install button triggers protocol
    - _Requirements: 6.1, 6.2, 6.3, 6.4_

- [x] 38. Write documentation
  - [x] 38.1 Create README.md
    - Project overview and feature introduction
    - Installation and running guide
    - Development environment setup
    - _Requirements: All_
  
  - [x] 38.2 Create widget developer documentation
    - Widget SDK API reference
    - Tutorial for creating new widgets
    - widget.config.json configuration instructions
    - Permission system explanation
    - _Requirements: 4.1, 4.2, 4.3, 5.1, 5.2, 5.3_
  
  - [x] 38.3 Create architecture documentation
    - System architecture diagram
    - IPC communication flow
    - Security mechanism explanation
    - _Requirements: 2.1, 2.2, 2.3, 2.4, 2.5_

## Phase 10: Final Integration and Deployment

- [x] 39. UI/UX polish
  - Add transition animations to all UI components (fadeIn, hover effects)
  - Optimize glassmorphism visual presentation
  - Ensure all text is readable on transparent backgrounds
  - Add widget appearance and disappearance animations
  - Optimize Manager UI layout and styling
  - _Requirements: 12.1, 12.2, 12.3, 12.4, 12.5_

- [ ] 40. Cross-platform testing
  - Test all functionality on Windows 10/11
  - Test system tray behavior on Windows
  - Test custom protocol registration on Windows
  - Test on macOS if possible
  - Fix platform-specific issues
  - _Requirements: All_

- [x] 41. Packaging and building
  - Configure electron-builder for Windows and macOS targets
  - Set up application icons (icon.ico and icon.icns)
  - Build Windows installer (NSIS)
  - Build macOS DMG (if possible)
  - Test installers
  - _Requirements: All_

- [ ] 42. Deploy Marketplace
  - Configure Vercel project
  - Set up environment variables (Supabase connection)
  - Deploy to production environment
  - Test production environment functionality
  - Configure custom domain (optional)
  - _Requirements: 6.1, 6.2, 6.3, 6.4, 13.1, 13.2, 13.3, 13.4, 13.5_

- [ ] 43. Prepare demonstration
  - Create demonstration script showcasing core features
  - Prepare demonstration of 3 example widgets
  - Prepare Marketplace demonstration
  - Prepare installation and usage flow demonstration
  - Record demonstration video (optional)
  - _Requirements: All_

- [x] 44. Final checks and bug fixes
  - Execute complete functional test checklist
  - Fix all discovered critical bugs
  - Optimize performance bottlenecks
  - Ensure all requirements are implemented
  - _Requirements: All_

## Notes

### Development Priorities

1. **Phase 1-3**: Core infrastructure and SDK (Week 1) - Highest priority
2. **Phase 4-5**: System API and example widgets (Week 2) - High priority
3. **Phase 6-7**: Marketplace and installation mechanism (Week 3) - Medium priority
4. **Phase 8-10**: Optimization and deployment (Week 4) - Final stage

### MVP Definition

Minimum viable product must include:
- ✅ Electron app can launch and create widget windows
- ✅ Widget SDK works properly
- ✅ At least 1 runnable example widget (Clock)
- ✅ Widgets can be dragged and position saved
- ✅ Basic sandbox security mechanism
- ✅ Storage API works properly

With these, the project can be demonstrated properly. Other features are bonuses.

### Optional Features (Can be skipped if time is limited)

- System Tray (Task 31)
- Weather Widget (Task 23)
- Widget Installation Mechanism (Task 29-30)
- All tasks marked with * for testing and documentation

### Technical Debt Tracking

During development, if you encounter areas that need future optimization, record them in TODO comments:

```typescript
// TODO: Implement more accurate CPU usage calculation
// TODO: Add widget update mechanism
// TODO: Support widget theme customization
```

These can be refined after the hackathon.
