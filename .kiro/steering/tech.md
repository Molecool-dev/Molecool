---
inclusion: always
---

---
inclusion: always
---

# Technology Stack

## Package Architecture

This monorepo contains three independent packages with distinct module systems and runtimes:

**widget-container/** - Electron desktop application
- Module system: CommonJS (`require`, `module.exports`)
- Runtime: Node.js + Electron APIs
- TypeScript config: `module: "commonjs"`, `target: "ES2020"`
- Build output: `dist/` (compiled JS), `dist-build/` (packaged app)

**widget-sdk/** - React component library for building widgets
- Module system: ESNext (`import`, `export`)
- Runtime: Browser only (NO Electron dependencies)
- TypeScript config: `module: "ESNext"`, `noEmit: true` (Vite compiles)
- Build output: `dist/` (ES modules + type declarations)

**widget-marketplace/** - Next.js web application
- Module system: ESNext
- Runtime: Node.js (server) + Browser (client)
- Framework: Next.js 15 with App Router

## Widget Container (Electron App)

**Directory Structure:**
- `src/main/` - Main process (Node.js APIs, app lifecycle, IPC handlers)
- `src/preload/` - Preload scripts (bridge between main and renderer)
- `src/renderer/` - Renderer process (sandboxed UI, no Node.js access)

**Module System Rules:**
- ALWAYS use CommonJS: `const x = require('module')` and `module.exports = x`
- NEVER use ES modules (`import`/`export`) - they will fail at runtime
- Import Node.js types: `import type { ... } from 'node:...'` (type-only imports are safe)

**Persistence:**
- Use `electron-store` for ALL persistent data (widget positions, configs, preferences)
- NEVER use `localStorage` in main process
- Debounce writes by minimum 500ms to reduce disk I/O

**IPC Communication:**
- Main process: Register handlers with `ipcMain.handle()` or `ipcMain.on()`
- Preload: Expose APIs via `contextBridge.exposeInMainWorld('api', { ... })`
- Renderer: Call exposed APIs via `window.api.methodName()`

## Widget SDK (React Library)

**Directory Structure:**
- `src/core/` - Core APIs and utilities
- `src/hooks/` - Custom React hooks (prefix with `use`)
- `src/components/` - React components
- `src/index.ts` - Single public entry point (exports all public APIs)

**Module System Rules:**
- ALWAYS use ES modules: `import` and `export`
- NEVER use CommonJS (`require`/`module.exports`)

**Critical Constraints:**
- NEVER import Electron APIs (must work in standalone browser)
- React 18+ and ReactDOM are peer dependencies (NEVER bundle them in library builds)
- Extend `Window` interface in `types/window.d.ts` for global APIs
- All public APIs must be exported from `src/index.ts`

**Development vs Production:**
- Development: Runs in browser with mock APIs
- Production: Runs in Electron renderer with real APIs via `window.api`

## TypeScript Configuration

**Shared Settings:**
- Strict mode enabled
- Target: ES2020
- Lib: ES2020

**Package-Specific:**
- widget-container: `module: "commonjs"`, includes `@types/node`
- widget-sdk: `module: "ESNext"`, `noEmit: true`, includes DOM types and React JSX
- widget-marketplace: Next.js defaults

## Testing

**Framework:** Vitest + @testing-library/react

**Test Files:**
- Location: `__tests__/*.test.ts` or `__tests__/*.test.tsx`
- Co-locate tests with source code when possible

**Running Tests:**
- Single run: `npm test -- --run`
- NEVER use watch mode (`--watch`) in automation or CI
- Use `vitest.config.ts` for test configuration

**Mocking:**
- Mock Electron APIs in widget-container tests
- Mock `window.api` in widget-sdk tests for browser compatibility