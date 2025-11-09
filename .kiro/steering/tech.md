---
inclusion: always
---

# Technology Stack

## Module Systems (CRITICAL)

**widget-container/** (Electron)
- CommonJS only: `require()` and `module.exports`
- Type-only imports allowed: `import type { ... } from 'node:...'`
- Config: `module: "commonjs"`, `target: "ES2020"`

**widget-sdk/** (React library)
- ES modules only: `import` and `export`
- NEVER import Electron APIs (browser-only)
- React 18+ is peer dependency - NEVER bundle React/ReactDOM
- Config: `module: "ESNext"`, `noEmit: true`

**widget-marketplace/** (Next.js 15)
- ES modules only: `import` and `export`
- App Router architecture

## Data Persistence

- `electron-store` for persistent data (positions, configs, preferences)
- NEVER `localStorage` in main process
- Debounce writes by 500ms minimum
- Renderer `localStorage` only for ephemeral UI state

## IPC Pattern

- Main: `ipcMain.handle()` or `ipcMain.on()`
- Preload: `contextBridge.exposeInMainWorld('api', { ... })`
- Renderer: `window.api.methodName()`

## Testing

- Vitest + @testing-library/react
- Location: `__tests__/*.test.ts(x)` co-located with source
- Run: `npm test -- --run` (NEVER `--watch`)
- Mock `window.api` in widget-sdk, mock Electron in widget-container