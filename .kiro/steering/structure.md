---
inclusion: always
---

# Code Structure & Conventions

## Naming Conventions

- **Components**: PascalCase (`WidgetProvider`, `Widget.Container`)
- **Hooks**: camelCase with `use` prefix (`useWidgetAPI`, `useInterval`)
- **Types/Interfaces**: PascalCase (`WidgetConfig`, `SystemMemoryInfo`)
- **Constants**: UPPER_SNAKE_CASE (`SDK_VERSION`)
- **Files**: `.ts` or `.tsx` | Tests: `__tests__/*.test.ts(x)` | Types: `*.d.ts`

## Electron Security (NON-NEGOTIABLE)

**Required Settings**:
- Context isolation: ENABLED
- Node integration: DISABLED
- Renderer sandbox: ENABLED

**Communication Flow**: Renderer → `ipcRenderer` → Preload (`contextBridge`) → `ipcMain` → Main

**Critical Rule**: Renderer processes have ZERO direct Node.js/Electron access. All system APIs must flow through IPC bridge.

## React Patterns

- Functional components + hooks only (NO class components)
- Provider pattern: `WidgetProvider` wraps app, exposes React Context
- Compound components: Dot notation exports (`Widget.Container`, `Widget.LargeText`)
- Custom hooks: Prefix `use`, encapsulate API calls and state logic
- State management: React Context + custom hooks
- Single entry point: `src/index.ts` exports all public APIs
- TypeScript strict mode required

## Widget Dragging Implementation

- Renderer calculates position delta → sends to main → main moves BrowserWindow
- Use screen coordinates with delta-based positioning
- Skip drag on interactive elements: `button`, `input`, `a`, `select`, `textarea`
- Debounce position saves by minimum 500ms