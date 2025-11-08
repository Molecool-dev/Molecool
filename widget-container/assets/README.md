# Application Icons

## Current Status

This directory contains placeholder icons for the Molecool Widget Platform.

## Icon Files

- `icon.svg` - Source SVG icon (512x512)
- `icon.ico` - Windows icon (generated from SVG)
- `icon.icns` - macOS icon (generated from SVG)
- `icon.png` - PNG icon for various uses (512x512)

## Generating Production Icons

For production builds, you should create professional icons using design tools like:
- Adobe Illustrator
- Figma
- Sketch
- Inkscape (free)

### Recommended Icon Sizes

**Windows (.ico):**
- 256x256, 128x128, 64x64, 48x48, 32x32, 16x16

**macOS (.icns):**
- 1024x1024, 512x512, 256x256, 128x128, 64x64, 32x32, 16x16

### Tools for Icon Conversion

**Windows:**
- Use online tools like CloudConvert or IcoFX
- Or use ImageMagick: `magick convert icon.png -define icon:auto-resize=256,128,64,48,32,16 icon.ico`

**macOS:**
- Use `iconutil` (built-in macOS tool)
- Or use online tools like CloudConvert

### Quick Generation with electron-icon-builder

```bash
npm install -g electron-icon-builder
electron-icon-builder --input=./icon.png --output=./
```

## Design Guidelines

- Use simple, recognizable shapes
- Ensure visibility at small sizes (16x16)
- Use platform-appropriate styles (flat for Windows 11, depth for macOS)
- Test on both light and dark backgrounds
- Maintain consistent branding across platforms
