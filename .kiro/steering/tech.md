---
inclusion: always
---

# Technology Stack

## Monorepo Structure
Two independent packages with separate dependencies and build processes:
- `widget-container/` - Electron app (CommonJS, Node.js APIs)
- `widget-sdk/` - React library (ESNext modules, browser-only)

## Widget Container (Electron App)
- Electron 28.0.0, TypeScript 5.3.3 (CommonJS, ES2020), electron-store 8.1.0
- Build: `tsc` → `dist/`, `electron-builder` → `dist-build/`
- Structure: `src/main/` (Node.js), `src/preload/` (contextBridge), `src/renderer/` (sandboxed UI)
- Commands: `npm run dev` (build + start), `npm run build` (compile only)

## Widget SDK (React Library)
- React 18.3.1, TypeScript 5.6.3 (ESNext, ES2020), Vite 5.4.10, Vitest 3.2.4
- Build: Vite library mode with vite-plugin-dts → ES module + types + source maps
- Structure: `src/core/` (APIs), `src/hooks/`, `src/components/`, `src/index.ts` (single entry)
- React 18+ is peer dependency (not bundled)
- Commands: `npm run build`, `npm test -- --run` (never use watch mode)

## Key Rules
- TypeScript strict mode in both packages
- Widget Container: CommonJS with Node types
- Widget SDK: ESNext modules, React JSX, no emit (Vite handles compilation)
- Testing: Vitest + @testing-library/react, setup in `src/test-setup.ts`
- Always use `--run` flag for tests (avoid watch mode in automation)
