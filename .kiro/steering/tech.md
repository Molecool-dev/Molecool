---
inclusion: always
---

# Technology Stack

## Package Module Systems (CRITICAL)

**widget-container/** (Electron app)
- MUST use CommonJS: `require()` and `module.exports`
- ES modules (`import`/`export`) will fail at runtime
- Exception: Type-only imports allowed (`import type { ... } from 'node:...'`)
- TypeScript config: `module: "commonjs"`, `target: "ES2020"`
- Structure: `src/main/` (Node.js/IPC), `src/preload/` (bridge), `src/renderer/` (UI)

**widget-sdk/** (React library)
- MUST use ES modules: `import` and `export`
- NEVER use `require()` or `module.exports`
- NEVER import Electron APIs (browser-only runtime)
- TypeScript config: `module: "ESNext"`, `noEmit: true`
- React 18+ is peer dependency - NEVER bundle React/ReactDOM
- Single entry point: `src/index.ts` exports all public APIs
- Extend `Window` interface in `types/window.d.ts`

**widget-marketplace/** (Next.js 15)
- MUST use ES modules: `import` and `export`
- App Router architecture
- Runtime: Node.js (server) + Browser (client)

## Data Persistence

- Use `electron-store` for persistent data (positions, configs, preferences)
- NEVER use `localStorage` in main process
- Debounce all writes by minimum 500ms
- Renderer `localStorage` only for ephemeral UI state

## IPC Communication

- Main process: `ipcMain.handle()` or `ipcMain.on()`
- Preload script: `contextBridge.exposeInMainWorld('api', { ... })`
- Renderer process: `window.api.methodName()`

## Testing

- Framework: Vitest + @testing-library/react
- Location: `__tests__/*.test.ts(x)` co-located with source
- Run single execution: `npm test -- --run` (NEVER `--watch`)
- Mock `window.api` in widget-sdk, mock Electron APIs in widget-container