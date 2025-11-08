# Building and Packaging Guide

This guide covers how to build and package the Molecool Widget Container for distribution.

## Prerequisites

- Node.js 18+ installed
- npm or yarn package manager
- For Windows builds: Windows 10/11
- For macOS builds: macOS 10.13+ with Xcode Command Line Tools

## Quick Start

### Development Build

```bash
# Install dependencies
npm install

# Build the application
npm run build

# Run the application
npm start
```

### Production Package

```bash
# Package for Windows (creates installer)
npm run package:win

# Package for macOS (creates DMG)
npm run package:mac
```

## Build Process

### 1. Clean Build

Remove previous build artifacts:

```bash
npm run clean
```

This removes:
- `dist/` - Compiled TypeScript output
- `dist-build/` - Packaged installers

### 2. Compile Application

```bash
npm run build
```

This script (`scripts/build.js`) performs:
1. Cleans previous builds
2. Compiles TypeScript to JavaScript
3. Copies renderer HTML/CSS files
4. Verifies all required files exist

### 3. Generate Icons (Optional)

```bash
npm run icons
```

Creates placeholder icons in `assets/` directory. For production, replace with professional icons.

## Packaging

### Windows Packaging

```bash
npm run package:win
```

Creates:
- `Molecool-Setup-{version}.exe` - NSIS installer
- Supports x64 architecture
- Includes desktop and start menu shortcuts
- Registers `widget://` protocol handler

**Installer Features:**
- Custom installation directory
- Desktop shortcut option
- Start menu integration
- Automatic uninstaller
- Protocol registration

### macOS Packaging

```bash
npm run package:mac
```

Creates:
- `Molecool-{version}-x64.dmg` - Intel Macs
- `Molecool-{version}-arm64.dmg` - Apple Silicon
- Universal binary support

**DMG Features:**
- Drag-to-Applications installer
- Custom background and icon
- Code signing ready (requires certificate)
- Notarization ready

## Build Configuration

### electron-builder Settings

Configuration is in `package.json` under the `build` key:

```json
{
  "build": {
    "appId": "com.Molecool.widget-platform",
    "productName": "Molecool",
    "directories": {
      "output": "dist-build"
    }
  }
}
```

### Key Configuration Options

**Common:**
- `appId` - Unique application identifier
- `productName` - Display name
- `protocols` - Custom URL protocol registration
- `files` - Files to include in package
- `extraResources` - Additional resources (example widgets)

**Windows:**
- `target: nsis` - NSIS installer format
- `icon` - Application icon (.ico)
- `publisherName` - Publisher information

**macOS:**
- `target: dmg` - DMG disk image format
- `icon` - Application icon (.icns)
- `category` - App Store category
- `hardenedRuntime` - Security hardening
- `entitlements` - macOS permissions

## Icon Requirements

### Windows (.ico)

Required sizes: 256x256, 128x128, 64x64, 48x48, 32x32, 16x16

Create using:
- Online tools (CloudConvert, ConvertICO)
- ImageMagick: `magick convert icon.png -define icon:auto-resize icon.ico`
- IcoFX (Windows app)

### macOS (.icns)

Required sizes: 1024x1024, 512x512, 256x256, 128x128, 64x64, 32x32, 16x16

Create using:
- `iconutil` (macOS built-in)
- Online tools (CloudConvert)
- Electron Icon Builder: `npm install -g electron-icon-builder`

### Icon Design Guidelines

- Use simple, recognizable shapes
- Ensure visibility at 16x16 pixels
- Test on light and dark backgrounds
- Follow platform design guidelines
- Maintain consistent branding

## Output Files

After packaging, find installers in `dist-build/`:

**Windows:**
```
dist-build/
  └── Molecool-Setup-1.0.0.exe
```

**macOS:**
```
dist-build/
  ├── Molecool-1.0.0-x64.dmg
  └── Molecool-1.0.0-arm64.dmg
```

## Testing Installers

### Windows Testing

1. Run the `.exe` installer
2. Follow installation wizard
3. Verify desktop shortcut created
4. Launch from Start Menu
5. Test `widget://` protocol
6. Verify uninstaller works

### macOS Testing

1. Open the `.dmg` file
2. Drag app to Applications
3. Launch from Applications folder
4. Verify app runs without errors
5. Test `widget://` protocol
6. Check app permissions

## Code Signing (Production)

### Windows Code Signing

Requires a code signing certificate:

```bash
# Set environment variables
set CSC_LINK=path/to/certificate.pfx
set CSC_KEY_PASSWORD=your_password

# Package with signing
npm run package:win
```

### macOS Code Signing

Requires Apple Developer account:

```bash
# Set environment variables
export APPLE_ID=your@email.com
export APPLE_ID_PASSWORD=app-specific-password

# Package with signing and notarization
npm run package:mac
```

## Troubleshooting

### Build Fails

**Issue:** TypeScript compilation errors
**Solution:** Run `npm run build` and fix TypeScript errors

**Issue:** Missing dependencies
**Solution:** Run `npm install` to install all dependencies

### Packaging Fails

**Issue:** Icon files not found
**Solution:** Run `npm run icons` or create proper icon files

**Issue:** electron-builder errors
**Solution:** Check `electron-builder` version and update if needed

### Installer Issues

**Issue:** Windows SmartScreen warning
**Solution:** Code sign the installer with a valid certificate

**Issue:** macOS Gatekeeper blocks app
**Solution:** Code sign and notarize the app with Apple

## CI/CD Integration

### GitHub Actions Example

```yaml
name: Build and Release

on:
  push:
    tags:
      - 'v*'

jobs:
  build-windows:
    runs-on: windows-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '18'
      - run: npm install
      - run: npm run package:win
      - uses: actions/upload-artifact@v3
        with:
          name: windows-installer
          path: dist-build/*.exe

  build-macos:
    runs-on: macos-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '18'
      - run: npm install
      - run: npm run package:mac
      - uses: actions/upload-artifact@v3
        with:
          name: macos-installer
          path: dist-build/*.dmg
```

## Performance Optimization

### Reduce Package Size

1. Remove unnecessary dependencies
2. Use `asar` archive (enabled by default)
3. Exclude dev dependencies from package
4. Compress assets

### Faster Builds

1. Use incremental TypeScript compilation
2. Cache `node_modules` in CI
3. Parallelize builds for multiple platforms
4. Use local electron cache

## Distribution

### Direct Distribution

- Host installers on your website
- Provide download links
- Include installation instructions
- Offer checksums for verification

### Auto-Update

Configure electron-updater for automatic updates:

```json
{
  "publish": {
    "provider": "github",
    "owner": "your-org",
    "repo": "Molecool"
  }
}
```

### App Stores

- **Microsoft Store:** Package as MSIX
- **Mac App Store:** Additional entitlements required
- **Snap Store:** Create snap package

## Resources

- [electron-builder Documentation](https://www.electron.build/)
- [Electron Packaging Guide](https://www.electronjs.org/docs/latest/tutorial/application-distribution)
- [Code Signing Guide](https://www.electron.build/code-signing)
- [Icon Guidelines](https://www.electron.build/icons)
