---
inclusion: always
---

# Molecule Desktop Widget Platform

Desktop widget platform with two independent packages: Electron container app (`widget-container/`) and React SDK (`widget-sdk/`) for building widgets.

## Security Architecture (Non-Negotiable)

**Electron Security Model:**
- Context isolation: ENABLED (always)
- Node integration: DISABLED (always)
- Renderer sandbox: ENABLED (always)
- All Node.js/Electron APIs must be exposed via `contextBridge.exposeInMainWorld()` in preload scripts
- Communication: Main process ↔ Preload ↔ Renderer via IPC (`ipcMain`/`ipcRenderer`)

**SDK Isolation:**
- Widget SDK must NEVER import Electron APIs directly
- Bridge pattern: SDK calls window APIs → preload exposes APIs → main process handles
- SDK must work in both browser (development) and Electron (production) environments

## Data Persistence

- Use `electron-store` for ALL persistent storage (widget positions, configurations, user preferences)
- Debounce all write operations by minimum 500ms to prevent excessive disk I/O
- NEVER use `localStorage` in main process (use `electron-store` instead)
- Renderer process can use `localStorage` for non-persistent UI state only

## Visual Design

**Platform-Native Effects:**
- Windows 11: Mica/Acrylic blur effects
- macOS: Vibrancy effects
- Frameless windows with custom title bars

**Glassmorphism Style:**
- Semi-transparent backgrounds with backdrop blur
- Subtle borders for depth
- Smooth animations and transitions

## Widget Lifecycle

- Widgets are independent Electron BrowserWindows
- Each widget runs in isolated renderer process
- Widget state persists across app restarts via `electron-store`
- Widgets can be dragged, resized, and positioned freely on desktop