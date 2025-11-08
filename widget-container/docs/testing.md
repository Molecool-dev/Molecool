# Testing Documentation

This document provides an overview of all testing approaches for the Molecool Desktop Widget Platform.

## Testing Strategy

The platform uses a multi-layered testing approach:

1. **Unit Tests** - Test individual functions and components in isolation
2. **Integration Tests** - Test IPC communication and cross-component interactions
3. **Manual Tests** - Test user workflows and visual/UX aspects

---

## 1. Unit Tests

### Widget Container (Jest)

**Location:** `widget-container/src/main/__tests__/*.test.ts`

**Coverage:**
- Widget Manager logic (validation, lifecycle)
- Storage operations
- Permission management (dialog, granting, denial, rate limiting)
- System API functions
- Error handling
- Security (CSP, domain validation)

**Run Tests:**
```bash
cd widget-container
npm test -- --run
```

**Example Test Files:**
- `widget-manager.test.ts` - Widget lifecycle and validation (14 tests)
- `error-handling.test.ts` - Error handling across APIs (11 tests)
- `security.test.ts` - Security manager and CSP (20 tests)
- `permissions.test.ts` - Permission system functionality (30+ tests) ✨
- `performance-monitor.test.ts` - Performance monitoring (18 tests) ✨ Enhanced error handling

### Widget SDK (Vitest)

**Location:** `widget-sdk/__tests__/*.test.tsx`

**Coverage:**
- React hooks (useStorage, useInterval, useSystemInfo, useThrottle)
- API interfaces
- Component rendering

**Run Tests:**
```bash
cd widget-sdk
npm test -- --run
```

**Example Test Files:**
- `useStorage.test.tsx` - Storage hook functionality
- `useInterval.test.tsx` - Interval hook behavior
- `useThrottle.test.tsx` - Throttle hook with memory leak protection (17 tests)

---

## 2. Integration Tests

### IPC Communication Tests

**Location:** `widget-container/__tests__/ipc-integration.test.ts`

**Coverage:**
- Storage API end-to-end flow
- System API with permission checks
- Settings API
- UI API
- Error handling across IPC boundary
- Cross-API integration

**Run Tests:**
```bash
cd widget-container
npm test -- --run ipc-integration
```

**Test Count:** 20 tests covering all IPC handlers

---

## 3. Manual Tests

### Overview

Manual testing covers aspects that cannot be easily automated:
- Visual appearance and animations
- User interactions (dragging, clicking)
- Cross-platform behavior
- Performance under real-world conditions
- Security isolation

### Documentation

**Main Guide:** `docs/MANUAL_TESTING_GUIDE.md`
- 27 detailed test cases
- Step-by-step instructions
- Expected results for each test
- Bug reporting template

**Execution Report:** `docs/TEST_EXECUTION_REPORT.md`
- Track test execution progress
- Record pass/fail status
- Document bugs found
- Overall assessment

**Quick Start:** `docs/MANUAL_TESTING_README.md`
- Overview of manual testing process
- Prerequisites and setup
- Testing workflow
- Common issues and solutions

### Test Suites

#### 37.1: Widget 生命週期 (5 tests)
- Widget creation and closing
- Dragging functionality
- Position persistence across restarts
- Multi-widget scenarios

#### 37.2: 權限系統 (5 tests)
- Permission dialog display
- Granting and denying permissions
- Rate limiting
- Unauthorized access prevention

#### 37.3: 範例 Widgets (7 tests)
- Clock Widget functionality
- System Monitor Widget with system APIs
- Weather Widget with network access
- Permission requirements for each

#### 37.4: Marketplace (5 tests)
- Homepage and widget listing
- Search functionality
- Widget detail pages
- Install protocol handling

### Preparation

**Automated Check:**
```bash
cd widget-container
node scripts/prepare-manual-testing.js
```

This script verifies:
- ✅ Widget Container is built
- ✅ Example widgets are built
- ✅ Widget SDK is built
- ✅ Documentation is present

### Execution

1. **Prepare Environment:**
   ```bash
   node scripts/prepare-manual-testing.js
   ```

2. **Start Application:**
   ```bash
   cd widget-container
   npm start
   ```

3. **Follow Test Cases:**
   Open `docs/MANUAL_TESTING_GUIDE.md` and execute tests sequentially

4. **Record Results:**
   Fill in `docs/TEST_EXECUTION_REPORT.md` as you test

---

## Test Coverage Summary

| Component | Unit Tests | Integration Tests | Manual Tests | Total |
|-----------|------------|-------------------|--------------|-------|
| Widget Container | 75+ | 20 | 12 | 107+ |
| Widget SDK | 30+ | - | - | 30+ |
| Example Widgets | - | - | 7 | 7 |
| Marketplace | - | - | 5 | 5 |
| Performance | - | - | 3 | 3 |
| Security | 20 | - | 2 | 22 |
| Permissions | 30+ | - | - | 30+ |
| **TOTAL** | **155+** | **20** | **29** | **204+** |

---

## Running All Tests

### Automated Tests Only
```bash
# Widget Container
cd widget-container && npm test -- --run

# Widget SDK
cd widget-sdk && npm test -- --run
```

### Full Test Suite (Automated + Manual)
```bash
# 1. Run automated tests
cd widget-container && npm test -- --run
cd ../widget-sdk && npm test -- --run

# 2. Prepare for manual testing
cd ../widget-container
node scripts/prepare-manual-testing.js

# 3. Execute manual tests
npm start
# Follow docs/MANUAL_TESTING_GUIDE.md
```

---

## Continuous Integration

### Automated Tests in CI

```yaml
# Example GitHub Actions workflow
name: Tests
on: [push, pull_request]
jobs:
  test:
    runs-on: windows-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '18'
      
      # Widget Container tests
      - name: Test Widget Container
        run: |
          cd widget-container
          npm install
          npm test -- --run
      
      # Widget SDK tests
      - name: Test Widget SDK
        run: |
          cd widget-sdk
          npm install
          npm test -- --run
```

### Manual Tests in CI

Manual tests should be executed:
- Before major releases
- After significant feature additions
- When automated tests cannot cover the scenario
- As part of QA process

---

## Test Maintenance

### Adding New Tests

**Unit Tests:**
1. Create test file in `__tests__/` directory
2. Follow existing naming convention: `*.test.ts` or `*.test.tsx`
3. Use Jest (Container) or Vitest (SDK)
4. Focus on core functionality

**Integration Tests:**
1. Add to `ipc-integration.test.ts` or create new file
2. Test cross-component interactions
3. Verify IPC communication flows

**Manual Tests:**
1. Add test case to `MANUAL_TESTING_GUIDE.md`
2. Update `TEST_EXECUTION_REPORT.md` template
3. Update test count in summary tables

### Updating Tests

When code changes:
1. Update affected test cases
2. Verify all tests still pass
3. Update expected results if behavior changed intentionally
4. Document breaking changes

**Recent Test Improvements (2025-11-07):**
- **Performance Monitor Error Handling**: Improved test reliability by mocking `app.getAppMetrics()` to return invalid data instead of throwing during setup. This tests the actual error handling path in the metric collection logic rather than Jest's error handling.

---

## Test Quality Guidelines

### Good Tests Should:
- ✅ Test one thing at a time
- ✅ Have clear, descriptive names
- ✅ Be independent (no test order dependencies)
- ✅ Be repeatable (same result every time)
- ✅ Be fast (unit tests < 100ms each)
- ✅ Have clear assertions
- ✅ Clean up after themselves

### Avoid:
- ❌ Testing implementation details
- ❌ Overly complex test setup
- ❌ Mocking everything (test real behavior when possible)
- ❌ Flaky tests (random failures)
- ❌ Tests that depend on external services
- ❌ Tests without assertions

---

## Debugging Failed Tests

### Unit Test Failures

1. **Read the error message carefully**
   - What assertion failed?
   - What was expected vs actual?

2. **Run single test:**
   ```bash
   npm test -- --run -t "test name"
   ```

3. **Add debug output:**
   ```typescript
   console.log('Debug:', variable);
   ```

4. **Check test isolation:**
   - Does test pass when run alone?
   - Does it fail when run with others?

### Integration Test Failures

1. **Check IPC communication:**
   - Are handlers registered?
   - Are events being emitted?

2. **Verify mock setup:**
   - Are mocks configured correctly?
   - Are they being called as expected?

3. **Check async timing:**
   - Are promises resolved?
   - Are callbacks executed?

### Manual Test Failures

1. **Verify prerequisites:**
   - Is everything built?
   - Is data cleared if needed?

2. **Check environment:**
   - Correct OS version?
   - Required permissions granted?

3. **Document thoroughly:**
   - Exact steps to reproduce
   - Screenshots/videos
   - System information

---

## Performance Testing

### Automated Performance Tests

Currently limited. Consider adding:
- Memory leak detection
- CPU usage monitoring
- Render performance benchmarks

### Manual Performance Tests

Included in manual testing suite:
- **P1:** Memory usage < 500MB with 5 widgets
- **P2:** CPU usage < 20% per widget
- **P3:** Frame rate > 30 FPS

---

## Security Testing

### Automated Security Tests

**Location:** `widget-container/__tests__/security.test.ts`

**Coverage:**
- CSP header configuration
- Domain validation
- Network request filtering
- Security manager initialization
- Widget registration/unregistration

**Test Count:** 20 tests

### Manual Security Tests

**Location:** `docs/MANUAL_TESTING_GUIDE.md` (Security section)

**Coverage:**
- **S1:** Sandbox isolation (Node.js API access blocked)
- **S2:** CSP enforcement (inline scripts blocked)

---

## Future Testing Improvements

### Short Term
- [ ] Add E2E tests with Playwright
- [ ] Increase unit test coverage to 90%+
- [ ] Add visual regression testing
- [ ] Automate performance benchmarks

### Long Term
- [ ] Implement mutation testing
- [ ] Add fuzz testing for security
- [ ] Create test data generators
- [ ] Build automated UI testing framework

---

## Resources

### Documentation
- [Manual Testing Guide](./MANUAL_TESTING_GUIDE.md) - Detailed manual test procedures
- [Manual Testing README](./MANUAL_TESTING_README.md) - Quick start for manual testing
- [Test Execution Report](./TEST_EXECUTION_REPORT.md) - Test results tracking
- [Permissions Testing](./permissions-testing.md) - Permissions system test suite (30+ tests) ✨
- [IPC Integration](./ipc-permissions-integration.md) - IPC and permissions integration
- [Permissions API](./permissions-api.md) - Permission system API guide

### Tools
- [Jest](https://jestjs.io/) - Unit testing framework (Container)
- [Vitest](https://vitest.dev/) - Unit testing framework (SDK)
- [React Testing Library](https://testing-library.com/react) - React component testing

### Best Practices
- [Testing Best Practices](https://testingjavascript.com/)
- [Electron Testing Guide](https://www.electronjs.org/docs/latest/tutorial/automated-testing)
- [React Testing Patterns](https://kentcdodds.com/blog/common-mistakes-with-react-testing-library)

---

**Last Updated:** 2025-11-07  
**Version:** 1.0.0
