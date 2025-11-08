# Molecool - Desktop Widget Platform

<div align="center">

![Molecool Logo](docs/images/logo.svg)

**A modern desktop widget platform built with Electron and React**

Bring back the joy of desktop widgets with modern web technologies and enterprise-grade security.

[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue)](https://www.typescriptlang.org/)
[![Electron](https://img.shields.io/badge/Electron-Latest-47848F)](https://www.electronjs.org/)
[![React](https://img.shields.io/badge/React-18-61DAFB)](https://reactjs.org/)

</div>

---

## 📖 Overview

Molecool is a desktop widget platform that revives the Windows 7/Vista gadget experience using modern web technologies. It provides:

- 🎨 **Beautiful Glassmorphism UI** - Modern frosted glass effects with smooth animations
- 🔒 **Secure Sandbox Environment** - All widgets run in isolated, sandboxed processes
- ⚛️ **React-Based Development** - Build widgets with familiar React components and hooks
- 🚀 **Easy Distribution** - Marketplace for discovering and installing widgets
- 🎯 **Developer Friendly** - Simple API with TypeScript support
- ✨ **Polished UX** - Smooth animations, enhanced readability, and delightful interactions

## ✨ Features

### For Users

- **Customizable Desktop** - Place widgets anywhere on your desktop
- **Drag & Drop** - Easily reposition widgets with smooth animations and delta-based positioning
- **Smooth Transitions** - Fade-in/fade-out animations for polished user experience
- **Persistent State** - Widget positions and settings saved automatically
- **System Tray Integration** - Quick access to widget manager
- **Permission Control** - Granular control over widget permissions
- **Low Resource Usage** - Optimized for multiple widgets with automatic memory cleanup

### For Developers

- **React Components** - 15 pre-built UI components with glassmorphism styling
- **Custom Hooks** - 7 React hooks: `useWidgetAPI`, `useStorage`, `useSettings`, `useAllSettings`, `useInterval`, `useSystemInfo`, `useThrottle`
- **TypeScript Support** - Full type definitions for better DX
- **Error Handling** - Comprehensive error types and boundaries
- **Hot Reload** - Fast development with Vite
- **Simple API** - Clean, intuitive API for storage, settings, and system info
- **Mock Environment** - Develop and test in browser without Electron

## 🏗️ Architecture

```
┌─────────────────────────────────────────────────────────┐
│                  Molecool Platform                       │
├─────────────────────────────────────────────────────────┤
│                                                          │
│  ┌──────────────────┐  ┌──────────────────────────┐   │
│  │ Widget Container │  │    Widget Marketplace     │   │
│  │   (Electron)     │  │      (Next.js)           │   │
│  └──────────────────┘  └──────────────────────────┘   │
│           │                                              │
│           │ uses                                         │
│           ▼                                              │
│  ┌──────────────────┐                                   │
│  │   Widget SDK     │                                   │
│  │    (React)       │                                   │
│  └──────────────────┘                                   │
│                                                          │
└─────────────────────────────────────────────────────────┘
```

### Components

1. **Widget Container** (`widget-container/`) - Electron desktop application that manages widget lifecycle
2. **Widget SDK** (`widget-sdk/`) - React component library for building widgets
3. **Example Widgets** (`examples/`) - Sample widgets (Clock, System Monitor, Weather)
4. **Marketplace** (`widget-marketplace/`) - Next.js web app for widget discovery

## 🚀 Quick Start

### Prerequisites

- Node.js 18+ and npm
- Windows 10/11 or macOS 10.15+

### Installation

```bash
# Clone the repository
git clone https://github.com/your-org/Molecool.git
cd Molecool

# Install dependencies for all packages
npm install
```

### Running the Platform

#### 1. Start Widget Container

```bash
cd widget-container
npm install
npm start
```

This launches the Electron app with the Widget Manager.

#### 2. Build Example Widgets

```bash
# Clock Widget
cd examples/clock
npm install
npm run build

# System Monitor Widget
cd ../system-monitor
npm install
npm run build

# Weather Widget
cd ../weather
npm install
npm run build
```

#### 3. Start Marketplace (Optional)

```bash
cd widget-marketplace
npm install
npm run dev
```

Visit `http://localhost:3000` to browse widgets.

## 📦 Project Structure

```
Molecool/
├── widget-container/          # Electron desktop application
│   ├── src/
│   │   ├── main/             # Main process (Node.js)
│   │   ├── preload/          # Preload scripts (IPC bridge)
│   │   └── renderer/         # Renderer process (UI)
│   └── package.json
│
├── widget-sdk/               # React component library
│   ├── src/
│   │   ├── core/            # Core APIs
│   │   ├── hooks/           # React hooks
│   │   ├── components/      # UI components
│   │   └── index.ts         # Public API
│   └── package.json
│
├── examples/                 # Example widgets
│   ├── clock/               # Simple clock widget
│   ├── system-monitor/      # CPU/Memory monitor
│   └── weather/             # Weather widget
│
├── widget-marketplace/       # Next.js marketplace
│   ├── app/                 # App Router pages
│   ├── components/          # React components
│   └── lib/                 # Utilities
│
└── docs/                    # Documentation
    ├── developer-guide.md
    ├── architecture.md
    └── api-reference.md
```

## 🎯 Creating Your First Widget

### 1. Initialize Widget Project

```bash
mkdir my-widget
cd my-widget
npm init -y
npm install @Molecool/widget-sdk react react-dom
npm install -D vite @vitejs/plugin-react typescript
```

### 2. Create `widget.config.json`

```json
{
  "id": "my-widget",
  "name": "my-widget",
  "displayName": "My Widget",
  "version": "1.0.0",
  "description": "My awesome widget",
  "author": {
    "name": "Your Name",
    "email": "your.email@example.com"
  },
  "permissions": {
    "systemInfo": {
      "cpu": false,
      "memory": false
    },
    "network": {
      "enabled": false
    }
  },
  "sizes": {
    "default": {
      "width": 250,
      "height": 200
    }
  },
  "entryPoint": "dist/index.html"
}
```

### 3. Create `src/index.tsx`

```tsx
import React, { useState } from 'react';
import { createRoot } from 'react-dom/client';
import { WidgetProvider, Widget, useInterval } from '@Molecool/widget-sdk';

const MyWidget: React.FC = () => {
  const [count, setCount] = useState(0);
  
  useInterval(() => {
    setCount(c => c + 1);
  }, 1000);
  
  return (
    <Widget.Container>
      <Widget.Title>My Widget</Widget.Title>
      <Widget.LargeText>{count}</Widget.LargeText>
      <Widget.SmallText>seconds elapsed</Widget.SmallText>
    </Widget.Container>
  );
};

const root = createRoot(document.getElementById('root')!);
root.render(
  <WidgetProvider>
    <MyWidget />
  </WidgetProvider>
);
```

### 4. Build and Test

```bash
npm run build
```

Copy the built widget to `widget-container/widgets/my-widget/` and restart the Widget Container.

📚 **See [Developer Guide](docs/developer-guide.md) for detailed instructions.**

## 🔧 Development

### Widget Container Development

```bash
cd widget-container
npm run dev        # Start in development mode
npm run build      # Build for production
npm test           # Run tests
```

### Widget SDK Development

```bash
cd widget-sdk
npm run dev        # Start Vite dev server
npm run build      # Build library
npm test           # Run tests
```

### Running Tests

```bash
# Run all tests
npm test -- --run

# Run specific package tests
cd widget-container && npm test -- --run
cd widget-sdk && npm test -- --run

# Run specific test suites
cd widget-container
npm test -- permissions.test.ts    # Permission system (30+ tests)
npm test -- ipc-integration.test.ts # IPC integration (20 tests)
npm test -- security.test.ts        # Security (20 tests)
```

**Test Coverage:** 155+ automated tests across all components

**Recent Test Additions:**
- ✅ Comprehensive permissions system testing (30+ tests covering dialogs, granting/denial, rate limiting)
- ✅ Enhanced List component with smooth animations and hover effects
- ✅ Improved error handling test reliability

## 🔒 Security

Molecool implements multiple security layers:

- **Context Isolation** - Widgets run in isolated contexts
- **Sandbox Mode** - All renderer processes are sandboxed
- **Content Security Policy** - Strict CSP prevents XSS attacks
- **Permission System** - Granular permissions for sensitive APIs
- **Rate Limiting** - Prevents API abuse (10 calls/second per widget)
- **HTTPS Only** - Network requests must use HTTPS
- **Domain Whitelist** - Widgets can only access declared domains

See [Architecture Documentation](docs/architecture.md) for security details.

## 📊 Performance

- **Memory Usage** - < 500MB with 5+ widgets running
- **Memory Management** - Automatic timer cleanup prevents memory leaks
- **CPU Usage** - < 5% idle, < 20% per widget under load
- **Startup Time** - < 2 seconds to launch
- **Widget Load Time** - < 500ms per widget with smooth fade-in
- **Animation Performance** - Hardware-accelerated transitions with V8 code caching

## 🤝 Contributing

We welcome contributions! Please see [CONTRIBUTING.md](CONTRIBUTING.md) for guidelines.

### Development Setup

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License - see [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- Inspired by Windows 7 Desktop Gadgets
- Built with [Electron](https://www.electronjs.org/)
- UI powered by [React](https://reactjs.org/)
- Marketplace built with [Next.js](https://nextjs.org/)

## 📞 Support

- 📖 [Documentation](docs/)
- 🐛 [Issue Tracker](https://github.com/your-org/Molecool/issues)
- 💬 [Discussions](https://github.com/your-org/Molecool/discussions)
- 📧 Email: support@Molecool-widgets.com

## 🗺️ Roadmap

- [x] Core widget platform
- [x] Widget SDK with React components
- [x] Example widgets (Clock, System Monitor, Weather)
- [x] Marketplace website
- [x] Permission system
- [ ] Widget themes
- [ ] Cloud sync
- [ ] Widget marketplace in-app
- [ ] Auto-update mechanism
- [ ] More system APIs

---

<div align="center">

**Made with ❤️ by the Molecool Team**

[Website](https://Molecool-widgets.com) • [Documentation](docs/) • [Marketplace](https://marketplace.Molecool-widgets.com)

</div>
