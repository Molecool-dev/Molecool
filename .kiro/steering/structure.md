---
inclusion: always
---

# Code Structure & Conventions

## Naming Conventions

- **Components:** PascalCase (`WidgetProvider`, `Widget.Container`)
- **Hooks:** camelCase with `use` prefix (`useWidgetAPI`, `useInterval`)
- **Types/Interfaces:** PascalCase (`WidgetConfig`, `SystemMemoryInfo`)
- **Constants:** UPPER_SNAKE_CASE (`SDK_VERSION`)
- **Files:** `.ts` or `.tsx`, tests in `__tests__/*.test.ts(x)`, types in `*.d.ts`

## Electron Security Architecture

**Security Configuration (Non-Negotiable):**
- Context isolation: ENABLED
- Node integration: DISABLED
- Renderer sandbox: ENABLED

**Communication Pattern:**
- Main process: Node.js APIs, app lifecycle, IPC handlers
- Preload scripts: Expose APIs via `contextBridge.exposeInMainWorld()`
- Renderer process: Sandboxed UI, NO Node.js access
- IPC flow: `ipcRenderer` (renderer) ↔ `ipcMain` (main)

## Widget SDK Patterns

**Provider Pattern:**
- `WidgetProvider` wraps app, provides context via React Context
- Single entry point: `src/index.ts` exports all public APIs

**Compound Components:**
- Use dot notation: `Widget.Container`, `Widget.LargeText`

**Custom Hooks:**
- Encapsulate API access and state management
- Always use `use` prefix

**Type Extensions:**
- Extend global `Window` interface in `types/window.d.ts`

## Widget Dragging

- Hybrid approach: Renderer calculates positions, main process moves windows
- Use screen coordinates with delta-based positioning
- Debounce auto-save by 500ms minimum
- Skip dragging on interactive elements (buttons, inputs, links, selects)

## Code Style

- TypeScript strict mode required
- Functional components and hooks only (NO class components)
- React 18+ as peer dependency (NEVER bundle React/ReactDOM)
- State management: React Context + custom hooks
