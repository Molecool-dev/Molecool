---
inclusion: always
---

# Molecool Desktop Widget Platform

Desktop widget platform with three packages:
- `widget-container/` - Electron app that hosts and manages widgets
- `widget-sdk/` - React library for building custom widgets
- `widget-marketplace/` - Next.js web app for discovering and sharing widgets

## Core Product Principles

**Security First**: Electron security model is NON-NEGOTIABLE. Renderer processes are fully sandboxed with zero direct Node.js access. All system APIs flow through IPC → preload bridge → main process.

**Widget Isolation**: Each widget runs in its own BrowserWindow with isolated renderer process. Widgets persist state across app restarts and support free desktop positioning, dragging, and resizing.

**Cross-Platform**: SDK must work in both browser (development) and Electron (production). NEVER import Electron APIs in widget-sdk - use `window.api` bridge pattern instead.

## Visual Design Language

**Platform-Native Effects**:
- Windows 11: Mica/Acrylic blur backgrounds
- macOS: Vibrancy effects
- Frameless windows with custom title bars
- Glassmorphism aesthetic: semi-transparent backgrounds, backdrop blur, subtle borders

**Widget Behavior**:
- Always-on-top, draggable, resizable
- Persist position and size across sessions
- Smooth animations and transitions
- Minimal chrome, maximum content

## Performance Guidelines

- Debounce frequent operations (position saves, config updates) by 500ms minimum
- Minimize IPC round-trips between renderer and main processes
- Batch `electron-store` writes when possible
- Widgets should feel lightweight and responsive