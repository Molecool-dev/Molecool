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

## Electron Security (NON-NEGOTIABLE)

- Context isolation: ALWAYS ENABLED
- Node integration: ALWAYS DISABLED
- Renderer sandbox: ALWAYS ENABLED
- Communication flow: Renderer → `ipcRenderer` → Preload (`contextBridge`) → `ipcMain` → Main
- Renderer has ZERO direct Node.js access

## React Patterns

- Functional components and hooks only (NO class components)
- Provider pattern: `WidgetProvider` wraps app, provides React Context
- Compound components: Dot notation (`Widget.Container`, `Widget.LargeText`)
- Custom hooks: Prefix with `use`, encapsulate API access and state
- State management: React Context + custom hooks
- Single entry point: Export all public APIs from `src/index.ts`
- TypeScript strict mode enabled

## Widget Dragging

- Renderer calculates position delta, main process moves BrowserWindow
- Use screen coordinates with delta-based positioning
- Skip drag on interactive elements: `button`, `input`, `a`, `select`
- Debounce position auto-save by 500ms minimum