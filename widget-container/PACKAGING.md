# Packaging Guide

Quick reference for building and packaging Molecool Widget Container.

## Quick Commands

```bash
# Verify configuration
npm run package:verify

# Build application
npm run build

# Package for Windows
npm run package:win

# Package for macOS
npm run package:mac

# Generate placeholder icons
npm run icons
```

## Prerequisites

- Node.js 18+
- All dependencies installed (`npm install`)
- Completed build (`npm run build`)

## Step-by-Step Packaging

### 1. Verify Configuration

```bash
npm run package:verify
```

This checks:
- Build exists and is valid
- package.json configuration is correct
- Icons are present
- electron-builder is installed
- Platform configurations are set

### 2. Build Application

```bash
npm run build
```

Compiles TypeScript and prepares distribution files in `dist/`.

### 3. Package for Target Platform

**Windows:**
```bash
npm run package:win
```

Creates: `dist-build/Molecool-Setup-{version}.exe`

**macOS:**
```bash
npm run package:mac
```

Creates: `dist-build/Molecool-{version}-{arch}.dmg`

## Output Files

After packaging, installers are in `dist-build/`:

```
dist-build/
├── Molecool-Setup-1.0.0.exe          # Windows installer
├── Molecool-1.0.0-x64.dmg            # macOS Intel
└── Molecool-1.0.0-arm64.dmg          # macOS Apple Silicon
```

## Icon Requirements

### Current Status
Placeholder icons are included for development. For production:

1. Create professional icons (512x512 PNG recommended)
2. Convert to platform formats:
   - Windows: `.ico` (256x256, 128, 64, 48, 32, 16)
   - macOS: `.icns` (1024x1024, 512, 256, 128, 64, 32, 16)
3. Place in `assets/` directory

### Icon Tools
- Online: CloudConvert, ConvertICO
- CLI: ImageMagick, iconutil (macOS)
- NPM: electron-icon-builder

## Testing Installers

### Windows
1. Run `.exe` installer
2. Complete installation wizard
3. Launch from Start Menu
4. Test widget functionality
5. Verify protocol handler (`widget://`)

### macOS
1. Open `.dmg` file
2. Drag to Applications
3. Launch application
4. Grant necessary permissions
5. Test widget functionality

## Troubleshooting

### Build Fails
- Check TypeScript errors: `npm run build`
- Verify dependencies: `npm install`

### Package Fails
- Run verification: `npm run package:verify`
- Check electron-builder logs
- Ensure icons exist in `assets/`

### Installer Issues
- Windows SmartScreen: Code sign with certificate
- macOS Gatekeeper: Code sign and notarize

## Code Signing (Production)

### Windows
```bash
set CSC_LINK=path/to/cert.pfx
set CSC_KEY_PASSWORD=password
npm run package:win
```

### macOS
```bash
export APPLE_ID=your@email.com
export APPLE_ID_PASSWORD=app-password
npm run package:mac
```

## Distribution Checklist

- [ ] Replace placeholder icons
- [ ] Update version in package.json
- [ ] Test on target platforms
- [ ] Code sign installers
- [ ] Create release notes
- [ ] Upload to distribution platform
- [ ] Update download links

## Resources

- Full guide: `docs/building-and-packaging.md`
- electron-builder: https://www.electron.build/
- Icon guidelines: `assets/README.md`
