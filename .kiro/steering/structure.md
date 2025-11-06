---
inclusion: always
---

# Code Structure & Conventions

## Naming Conventions
- Components: PascalCase (`WidgetProvider`, `Widget.Container`)
- Hooks: camelCase with `use` prefix (`useWidgetAPI`, `useInterval`)
- Types/Interfaces: PascalCase (`WidgetConfig`, `SystemMemoryInfo`)
- Constants: UPPER_SNAKE_CASE (`SDK_VERSION`)
- Files: `.ts` or `.tsx`, tests in `__tests__/*.test.ts(x)`, types in `*.d.ts`

## Architecture Patterns

### Electron Security (Widget Container)
- Context isolation enabled, node integration disabled, sandbox enabled
- Preload scripts expose APIs via `contextBridge.exposeInMainWorld()`
- IPC: `ipcRenderer` (renderer) ↔ `ipcMain` (main)
- Main process: Node.js APIs, app lifecycle
- Renderer process: Sandboxed, no Node.js access
- Compiled output preserves source structure in `dist/`

### Widget SDK Patterns
- Provider Pattern: `WidgetProvider` wraps app, provides context via React Context
- Compound Components: `Widget.Container`, `Widget.LargeText`, etc.
- Custom Hooks: Encapsulate API access and state management
- Single entry point: `src/index.ts` exports all public APIs
- Window types: Extend global `Window` interface in `types/window.d.ts`
- React/ReactDOM are peer dependencies (never bundle)

### Widget Dragging
- Hybrid approach: Renderer calculates positions, main process moves windows
- Screen coordinates with delta-based positioning
- 500ms debounced auto-save for positions
- Smart element detection: Skip dragging on buttons, inputs, links, selects

## Build Artifacts
- Widget Container: `dist/` (compiled TS), `dist-build/` (installers)
- Widget SDK: `dist/` (ES module + types + source maps), published as `@molecule/widget-sdk`
