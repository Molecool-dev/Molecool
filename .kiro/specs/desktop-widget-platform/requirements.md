# Requirements Document

## Introduction

molecool is a desktop widget platform that aims to revive the Windows 7/Vista gadget experience using modern web technologies (Electron + React) while addressing the original security concerns. The platform allows users to place customizable widgets on their desktop, enables developers to create widgets using React, runs all widgets in a secure sandbox environment, and provides a Marketplace for users to discover and install new widgets.

## Glossary

- **Widget Container**: Electron-based desktop application responsible for managing and running all widgets
- **Widget SDK**: React component library and API for developers to create widgets
- **Widget**: Small applications displayed on the desktop (e.g., clock, weather, system monitor)
- **Marketplace**: Next.js website for showcasing and distributing widgets
- **Main Process**: Electron main process responsible for system-level operations and window management
- **Renderer Process**: Electron renderer process responsible for UI display
- **Preload Script**: Script running in the renderer process that provides secure IPC bridging
- **Sandbox**: Isolated environment that restricts widget access to system resources
- **IPC**: Inter-Process Communication mechanism
- **Widget Manager**: Main interface of Widget Container for managing installed widgets
- **CSP**: Content Security Policy

## Requirements

### Requirement 1

**User Story:** As a user, I want to create and display widgets on my desktop so that I can quickly view information

#### Acceptance Criteria

1. WHEN the user launches Widget Container, THE Widget Container SHALL display the Widget Manager main window
2. WHEN the user selects a widget from Widget Manager, THE Widget Container SHALL create a frameless, transparent, always-on-top floating window to display that widget
3. WHEN the user drags a widget window, THE Widget Container SHALL update the widget's position and display it in real-time
4. WHEN the user closes Widget Container and restarts it, THE Widget Container SHALL redisplay all widgets at their last saved positions
5. WHEN the user closes a widget window, THE Widget Container SHALL remove that widget and update the Widget Manager's display state

### Requirement 2

**User Story:** As a user, I want widgets to run in a sandbox environment to ensure system security

#### Acceptance Criteria

1. THE Widget Container SHALL enable Electron sandbox mode in all widget windows
2. THE Widget Container SHALL set nodeIntegration to false and contextIsolation to true
3. THE Widget Container SHALL configure Content Security Policy for all widget windows to prohibit execution of unauthorized scripts
4. WHEN a widget attempts to access system APIs, THE Widget Container SHALL communicate through the secure bridge provided by the Preload Script
5. THE Widget Container SHALL prevent widgets from directly accessing Node.js APIs or Electron APIs

### Requirement 3

**User Story:** As a user, I want to control widget permissions to protect my privacy and system security

#### Acceptance Criteria

1. WHEN a widget first requests sensitive permissions (such as system information or network access), THE Widget Container SHALL display a permission request dialog
2. WHEN the user grants or denies permission, THE Widget Container SHALL save the user's choice and automatically apply it in subsequent requests
3. WHEN a widget attempts to use an unauthorized API, THE Widget Container SHALL reject the request and return an error message
4. THE Widget Container SHALL implement rate limiting for each API to prevent widgets from abusing system resources
5. WHEN the user views widget details, THE Widget Container SHALL display all permission requirements declared in widget.config.json for that widget

### Requirement 4

**User Story:** As a developer, I want to create widgets using React and simple APIs to quickly develop features

#### Acceptance Criteria

1. THE Widget SDK SHALL provide a WidgetAPI interface containing four namespaces: storage, settings, ui, and system
2. THE Widget SDK SHALL provide at least 15 pre-built UI components (such as Container, Title, Button, ProgressBar, etc.)
3. THE Widget SDK SHALL provide React Hooks including useWidgetAPI, useStorage, useSettings, useInterval, and useSystemInfo
4. WHEN a developer calls storage.set(key, value), THE Widget SDK SHALL store the data in Widget Container's persistent storage via IPC
5. WHEN a developer calls system.getCPU(), THE Widget SDK SHALL retrieve the current CPU usage from Widget Container via IPC

### Requirement 5

**User Story:** As a developer, I want to declare widget metadata and permissions in widget.config.json so that the system can properly load and manage widgets

#### Acceptance Criteria

1. THE Widget SDK SHALL require each widget to include a widget.config.json file
2. THE widget.config.json SHALL contain fields: id, name, displayName, version, description, author, and permissions
3. THE widget.config.json SHALL declare systemInfo and network permission requirements in the permissions field
4. THE widget.config.json SHALL define the widget's default width and height in the sizes field
5. WHEN Widget Container loads a widget, THE Widget Container SHALL validate the widget.config.json format and reject invalid configurations

### Requirement 6

**User Story:** As a user, I want to discover and install new widgets from the Marketplace to extend platform functionality

#### Acceptance Criteria

1. THE Marketplace SHALL display all available widgets in a grid format on the homepage
2. WHEN the user clicks on a widget card, THE Marketplace SHALL navigate to that widget's detail page
3. THE widget detail page SHALL display name, description, author, version, download count, and permission requirements
4. WHEN the user clicks the Install button, THE Marketplace SHALL open a custom URL protocol (widget://install/xxx)
5. WHEN Widget Container receives an installation protocol request, THE Widget Container SHALL download, extract, and install that widget

### Requirement 7

**User Story:** As a user, I want to use a Clock widget to view the current time for quick time information

#### Acceptance Criteria

1. THE Clock Widget SHALL display the current time in HH:MM format
2. THE Clock Widget SHALL display the current date
3. THE Clock Widget SHALL automatically update the displayed time every second
4. THE Clock Widget SHALL use UI components provided by the Widget SDK for layout
5. THE Clock Widget SHALL declare no special permissions required in widget.config.json

### Requirement 8

**User Story:** As a user, I want to use a System Monitor widget to view CPU and memory usage to monitor system performance

#### Acceptance Criteria

1. THE System Monitor Widget SHALL display current CPU usage (percentage number and progress bar)
2. THE System Monitor Widget SHALL display current memory usage (used/total)
3. THE System Monitor Widget SHALL update system information every 2 seconds
4. WHEN System Monitor Widget first launches, THE System Monitor Widget SHALL request systemInfo permissions
5. THE System Monitor Widget SHALL declare requirements for systemInfo.cpu and systemInfo.memory permissions in widget.config.json

### Requirement 9

**User Story:** As a user, I want to use a Weather widget to view current weather to understand the external environment

#### Acceptance Criteria

1. THE Weather Widget SHALL fetch and display current temperature from a weather API
2. THE Weather Widget SHALL display weather conditions (such as sunny, cloudy, rainy)
3. WHEN the user configures city settings, THE Weather Widget SHALL use the settings API to store and retrieve city preferences
4. WHEN Weather Widget first launches, THE Weather Widget SHALL request network permissions
5. THE Weather Widget SHALL declare requirement for network.enabled permission in widget.config.json

### Requirement 10

**User Story:** As a user, I want to quickly access Widget Manager through the system tray for convenient widget management

#### Acceptance Criteria

1. WHEN Widget Container launches, THE Widget Container SHALL display an icon in the system tray
2. WHEN the user right-clicks the tray icon, THE Widget Container SHALL display a menu containing "Open Manager" and "Exit" options
3. WHEN the user selects "Open Manager", THE Widget Container SHALL show or focus the Widget Manager window
4. WHEN the user selects "Exit", THE Widget Container SHALL close all widget windows and exit the application
5. WHEN the user closes the Widget Manager window, THE Widget Container SHALL hide the window but keep the application running in the tray

### Requirement 11

**User Story:** As a developer, I want to develop and test widgets locally to improve development efficiency

#### Acceptance Criteria

1. THE Widget SDK SHALL provide a development mode allowing developers to preview widgets in a browser
2. WHEN a developer runs npm run dev, THE widget project SHALL start a Vite development server and automatically reload changes
3. WHEN a developer runs npm run build, THE widget project SHALL package the widget into a distributable format
4. THE Widget SDK SHALL provide a mocked WidgetAPI in development mode without needing to connect to Widget Container
5. THE Widget SDK SHALL provide TypeScript type definitions to support IDE auto-completion for developers

### Requirement 12

**User Story:** As a user, I want widgets to have beautiful glassmorphism effects to enhance the visual experience

#### Acceptance Criteria

1. THE Widget Container SHALL apply glassmorphism background effects to all widget windows (backdrop-filter: blur(10px))
2. THE Widget Container SHALL set widget window backgrounds to semi-transparent (rgba(255, 255, 255, 0.1))
3. THE Widget Container SHALL add 12px border radius to widget windows
4. THE Widget Container SHALL add shadow effects to widget windows (0 8px 32px rgba(0, 0, 0, 0.3))
5. THE UI components provided by Widget SDK SHALL use white text (rgba(255, 255, 255, 0.9)) to ensure readability on transparent backgrounds

### Requirement 13

**User Story:** As a platform administrator, I want to store widget information in the Marketplace database to support dynamic content management

#### Acceptance Criteria

1. THE Marketplace SHALL use Supabase PostgreSQL database to store widget information
2. THE widgets table SHALL contain fields: id, name, description, author, version, downloads, and permissions
3. WHEN a user visits the Marketplace homepage, THE Marketplace SHALL query and display all widgets from the database
4. WHEN a user searches for widgets, THE Marketplace SHALL filter on the frontend based on name and description
5. THE Marketplace SHALL pre-populate the database with demo data for at least 5 widgets

### Requirement 14

**User Story:** As a developer, I want Widget Container to provide a complete IPC communication system to enable secure interaction between widgets and the main process

#### Acceptance Criteria

1. THE Widget Container SHALL implement ipc-handlers.js in the Main Process to handle all IPC messages from the Renderer Process
2. THE Widget Container SHALL provide manager-preload.js to offer secure API bridging for Widget Manager
3. THE Widget Container SHALL provide widget-preload.js to offer secure API bridging for widget windows
4. WHEN a widget calls the storage API, THE widget-preload.js SHALL send messages to the Main Process via ipcRenderer.invoke
5. WHEN the Main Process completes the request, THE Main Process SHALL return results to the Renderer Process via IPC

### Requirement 15

**User Story:** As a user, I want Widget Container to maintain good performance when multiple widgets are running simultaneously to ensure a smooth experience

#### Acceptance Criteria

1. WHEN 5 or more widgets are running simultaneously, THE Widget Container SHALL maintain total memory usage below 500MB
2. WHEN a widget updates its UI, THE Widget Container SHALL ensure rendering frame rate is not lower than 30 FPS
3. THE Widget Container SHALL set up CPU usage monitoring for each widget and issue a warning when a single widget continuously exceeds 20% CPU usage
4. THE Widget Container SHALL implement API rate limiting, allowing each widget to call system APIs at most 10 times per second
5. THE Widget Container SHALL isolate errors when a widget crashes, not affecting other widgets or the main application's operatio
