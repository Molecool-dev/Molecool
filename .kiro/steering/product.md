---
inclusion: always
---

# Product Context

Molecule is a desktop widget platform: Electron container app + React SDK for building widgets.

## Core Principles

### Security First
- Context isolation enabled, node integration disabled, renderer sandboxed
- APIs exposed only via `contextBridge` in preload scripts
- All main-renderer communication through IPC
- Widget SDK must remain independent of Electron APIs (use bridge pattern)

### Data Persistence
- Use electron-store for all persistent data
- Debounce writes (500ms) to prevent excessive I/O
- Store: widget positions, configurations, user preferences

### Visual Design
- Platform-native glass effects: Mica/Acrylic (Windows), Vibrancy (macOS)
- Glassmorphism: transparent backgrounds, blur effects, subtle borders

## Development Rules
- Maintain strict security boundaries between Electron processes
- Widget SDK must work in both browser (dev) and Electron (prod) environments
- TypeScript strict mode required
- React patterns: hooks, functional components, compound components
- Never bundle React/ReactDOM in SDK (peer dependencies only)
