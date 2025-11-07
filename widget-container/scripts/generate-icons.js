/**
 * Icon Generation Script
 * 
 * This script creates placeholder icon files for the application.
 * For production, replace these with professionally designed icons.
 * 
 * Icon Requirements:
 * - Windows (.ico): 256x256, 128x128, 64x64, 48x48, 32x32, 16x16
 * - macOS (.icns): 1024x1024, 512x512, 256x256, 128x128, 64x64, 32x32, 16x16
 */

const fs = require('fs');
const path = require('path');

const assetsDir = path.join(__dirname, '..', 'assets');

/**
 * Main execution function
 */
function main() {
  try {
    createAssetsDirectory();
    createSVGIcon();
    createIconReadme();
    printSuccessMessage();
  } catch (error) {
    console.error('❌ Icon generation failed:', error.message);
    process.exit(1);
  }
}

/**
 * Create assets directory if it doesn't exist
 */
function createAssetsDirectory() {
  if (!fs.existsSync(assetsDir)) {
    fs.mkdirSync(assetsDir, { recursive: true });
    console.log('✓ Created assets directory');
  }
}

/**
 * Create SVG icon placeholder
 */
function createSVGIcon() {
  const svgIcon = `<?xml version="1.0" encoding="UTF-8"?>
<svg width="512" height="512" viewBox="0 0 512 512" xmlns="http://www.w3.org/2000/svg">
  <!-- Background gradient -->
  <defs>
    <linearGradient id="grad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" style="stop-color:#667eea;stop-opacity:1" />
      <stop offset="100%" style="stop-color:#764ba2;stop-opacity:1" />
    </linearGradient>
  </defs>
  
  <!-- Rounded square background -->
  <rect width="512" height="512" rx="100" fill="url(#grad)"/>
  
  <!-- Widget symbol (3 rounded squares) -->
  <rect x="80" y="80" width="140" height="140" rx="20" fill="white" opacity="0.9"/>
  <rect x="260" y="80" width="172" height="140" rx="20" fill="white" opacity="0.9"/>
  <rect x="80" y="260" width="352" height="172" rx="20" fill="white" opacity="0.9"/>
  
  <!-- Letter M in the center -->
  <text x="256" y="380" font-family="Arial, sans-serif" font-size="180" font-weight="bold" 
        fill="#667eea" text-anchor="middle">M</text>
</svg>`;

  const svgPath = path.join(assetsDir, 'icon.svg');
  fs.writeFileSync(svgPath, svgIcon);
  console.log('✓ Created icon.svg');
}

/**
 * Create README with icon generation instructions
 */
function createIconReadme() {
  const iconReadme = `# Application Icons

## Current Status

This directory contains placeholder icons for the Molecule Widget Platform.

## Icon Files

- \`icon.svg\` - Source SVG icon (512x512)
- \`icon.ico\` - Windows icon (generated from SVG)
- \`icon.icns\` - macOS icon (generated from SVG)
- \`icon.png\` - PNG icon for various uses (512x512)

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
- Or use ImageMagick: \`magick convert icon.png -define icon:auto-resize=256,128,64,48,32,16 icon.ico\`

**macOS:**
- Use \`iconutil\` (built-in macOS tool)
- Or use online tools like CloudConvert

### Quick Generation with electron-icon-builder

\`\`\`bash
npm install -g electron-icon-builder
electron-icon-builder --input=./icon.png --output=./
\`\`\`

## Design Guidelines

- Use simple, recognizable shapes
- Ensure visibility at small sizes (16x16)
- Use platform-appropriate styles (flat for Windows 11, depth for macOS)
- Test on both light and dark backgrounds
- Maintain consistent branding across platforms
`;

  fs.writeFileSync(path.join(assetsDir, 'README.md'), iconReadme);
  console.log('✓ Created assets/README.md');
}

/**
 * Print success message
 */
function printSuccessMessage() {
  console.log('\n📝 Note: Placeholder icons created. For production builds, replace with professional icons.');
  console.log('   See assets/README.md for icon generation guidelines.\n');
}

// Run main function
main();
