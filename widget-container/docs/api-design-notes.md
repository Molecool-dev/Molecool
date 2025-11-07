# API Design Notes

This document explains key design decisions in the Widget Container API.

## System API

### CPU Usage API

**Main Process (`system-api.ts`)**
- Returns: `{ usage: number, cores: number }`
- Provides complete CPU information including core count

**Preload Bridge (`widget-preload.ts`)**
- Returns: `number` (just the usage percentage)
- Extracts only the `usage` field from the main process response

**Rationale:**
- The Widget SDK's `useSystemInfo('cpu')` hook expects a simple number for CPU usage
- Core count is static information that doesn't need to be polled repeatedly
- Simplifies the widget developer experience by providing the most commonly needed value
- Reduces data transfer between processes
- Maintains consistency with the SDK's API contract

**Implementation:**
```typescript
// In widget-preload.ts
system: {
  getCPU: async () => {
    const result = await handleIPCResponse<{ usage: number; cores: number }>(
      ipcRenderer.invoke('system:getCPU')
    );
    // SDK expects just the usage number, not the full object
    return result.usage;
  }
}
```

**Widget Usage:**
```typescript
// Widgets receive a simple number
const cpuUsage = useSystemInfo('cpu', 2000); // Returns: 45.23
```

### Memory Info API

**Main Process and Preload:**
- Both return: `{ total, used, free, usagePercent }`
- No transformation needed as the object structure is useful for widgets

**Rationale:**
- Memory information is more complex and widgets often need multiple fields
- Returning an object allows widgets to choose which metrics to display
- Common use cases include showing both absolute values (GB) and percentages

## Future Considerations

If widgets need access to CPU core count:
1. Add a separate `getSystemInfo()` API that returns static system information
2. Or extend the `useSystemInfo` hook to accept `'cpu-detailed'` type
3. Avoid polling static information repeatedly

## Related Files

- `widget-container/src/main/system-api.ts` - Main process implementation
- `widget-container/src/preload/widget-preload.ts` - Preload bridge
- `widget-sdk/src/hooks/useSystemInfo.ts` - Widget SDK hook
