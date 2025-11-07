# System Monitor Widget

A system monitor widget that displays real-time CPU and memory usage information.

## Features

- Real-time CPU usage monitoring
- Memory usage display (used/total)
- Visual progress bars for both metrics
- Color-coded indicators (green for normal, red for high usage)
- Updates every 2 seconds

## Permissions

This widget requires the following permissions:
- `systemInfo.cpu` - To read CPU usage information
- `systemInfo.memory` - To read memory usage information

## Development

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build
```

### Build Configuration

The widget uses Vite for building with the following configuration:
- **Output directory**: `dist/`
- **Base path**: `./` (relative paths for Electron compatibility)
- **Source maps**: Enabled for debugging
- **React plugin**: Enabled for JSX/TSX support

The build output is a bundled JavaScript application that can be loaded by the Widget Container.

## Installation

### Manual Installation

1. Build the widget:
   ```bash
   npm run build
   ```

2. Run the installation script (Windows):
   ```powershell
   .\install-widget.ps1
   ```
   
   This copies the built widget to `%APPDATA%\molecule-widget-container\widgets\system-monitor-widget\`

3. Open the Widget Manager and create a new System Monitor widget instance

### Through Widget Manager

Alternatively, install the widget directly through the Widget Manager interface (when available).

## Usage

1. Grant the required system information permissions when prompted
2. The widget will display CPU and memory usage in real-time
3. Drag the widget to reposition it on your desktop
