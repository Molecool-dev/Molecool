/**
 * Script to create a test widget package for installation testing
 * Usage: node scripts/create-test-widget.js
 */

const fs = require('fs');
const path = require('path');
const AdmZip = require('adm-zip');

// Test widget configuration
const widgetConfig = {
  id: 'test-installation-widget',
  name: 'test-installation',
  displayName: 'Test Installation Widget',
  version: '1.0.0',
  description: 'A test widget for testing the installation system',
  author: {
    name: 'Test Author',
    email: 'test@example.com'
  },
  permissions: {
    systemInfo: {
      cpu: false,
      memory: false
    },
    network: {
      enabled: false
    }
  },
  sizes: {
    default: {
      width: 250,
      height: 200
    },
    min: {
      width: 200,
      height: 150
    },
    max: {
      width: 400,
      height: 300
    }
  },
  entryPoint: 'dist/index.html'
};

// HTML content for the test widget
const htmlContent = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Test Installation Widget</title>
  <style>
    body {
      margin: 0;
      padding: 20px;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      background: rgba(255, 255, 255, 0.1);
      backdrop-filter: blur(10px);
      -webkit-backdrop-filter: blur(10px);
      border-radius: 12px;
      border: 1px solid rgba(255, 255, 255, 0.2);
      color: rgba(255, 255, 255, 0.9);
      text-align: center;
    }
    h1 {
      font-size: 24px;
      margin: 0 0 10px 0;
    }
    p {
      font-size: 14px;
      margin: 5px 0;
      color: rgba(255, 255, 255, 0.7);
    }
    .status {
      margin-top: 20px;
      padding: 10px;
      background: rgba(16, 185, 129, 0.2);
      border-radius: 8px;
      font-weight: 600;
    }
  </style>
</head>
<body>
  <h1>✅ Installation Test</h1>
  <p>This widget was successfully installed!</p>
  <div class="status">
    Installation system is working correctly
  </div>
  <p style="margin-top: 20px; font-size: 12px;">
    Version: ${widgetConfig.version}
  </p>
</body>
</html>`;

// Create temporary directory structure
const tempDir = path.join(__dirname, '../temp-widget-build');
const distDir = path.join(tempDir, 'dist');

console.log('Creating test widget package...');

// Clean up if exists
if (fs.existsSync(tempDir)) {
  fs.rmSync(tempDir, { recursive: true });
}

// Create directories
fs.mkdirSync(tempDir, { recursive: true });
fs.mkdirSync(distDir, { recursive: true });

// Write widget.config.json
fs.writeFileSync(
  path.join(tempDir, 'widget.config.json'),
  JSON.stringify(widgetConfig, null, 2)
);
console.log('✓ Created widget.config.json');

// Write index.html
fs.writeFileSync(
  path.join(distDir, 'index.html'),
  htmlContent
);
console.log('✓ Created dist/index.html');

// Create zip package
const zip = new AdmZip();
zip.addLocalFolder(tempDir);

const outputPath = path.join(__dirname, '../test-installation-widget.widget');
zip.writeZip(outputPath);
console.log(`✓ Created widget package: ${outputPath}`);

// Clean up temp directory
fs.rmSync(tempDir, { recursive: true });
console.log('✓ Cleaned up temporary files');

console.log('\nTest widget package created successfully!');
console.log('\nTo test installation:');
console.log('1. Upload this package to a web server or use a local file server');
console.log('2. Add the widget to the Marketplace database with the download URL');
console.log('3. Click "Install" in the Marketplace or use: widget://install/test-installation-widget');
console.log('\nPackage location:', outputPath);
