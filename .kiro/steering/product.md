---
inclusion: always
---

# Molecule Desktop Widget Platform

Three-package monorepo:
- `widget-container/` - Electron app hosting widgets
- `widget-sdk/` - React library for building widgets
- `widget-marketplace/` - Next.js web app for widget discovery

## Security Architecture (NON-NEGOTIABLE)

Electron security:
- Context isolation: ALWAYS enabled
- Node integration: ALWAYS disabled
- Renderer sandbox: ALWAYS enabled
- ALL Node.js/Electron APIs exposed via `contextBridge.exposeInMainWorld()` in preload
- Communication: Renderer → IPC → Preload → Main

SDK isolation:
- Widget SDK MUST NEVER import Electron APIs (browser-only runtime)
- Bridge pattern: SDK → `window.api` → preload → main
- SDK runs in browser (dev) and Electron renderer (production)

## Widget Architecture

Each widget is:
- Independent Electron BrowserWindow
- Isolated renderer process
- Persists state via `electron-store` across restarts
- Supports drag, resize, free desktop positioning

## Visual Design

Platform-native effects:
- Windows 11: Mica/Acrylic blur
- macOS: Vibrancy effects
- Frameless windows with custom title bars
- Glassmorphism: Semi-transparent backgrounds with backdrop blur, subtle borders

## Performance

- Debounce frequent operations (saves, updates) by 500ms minimum
- Minimize IPC calls between processes
- Batch `electron-store` updates when possible