/**
 * Build Script for Molecool Widget Container
 * 
 * This script handles the complete build process:
 * 1. Clean previous builds
 * 2. Compile TypeScript
 * 3. Copy renderer files
 * 4. Verify build output
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const ROOT_DIR = path.join(__dirname, '..');
const DIST_DIR = path.join(ROOT_DIR, 'dist');

console.log('🚀 Starting Molecool Widget Container build...\n');

// Step 1: Clean previous builds
console.log('1️⃣  Cleaning previous builds...');
try {
  if (fs.existsSync(DIST_DIR)) {
    fs.rmSync(DIST_DIR, { recursive: true, force: true });
    console.log('   ✓ Removed dist directory');
  }
} catch (error) {
  console.error('   ✗ Failed to clean:', error.message);
  process.exit(1);
}

// Step 2: Compile TypeScript
console.log('\n2️⃣  Compiling TypeScript...');
try {
  execSync('tsc', { cwd: ROOT_DIR, stdio: 'inherit' });
  console.log('   ✓ TypeScript compilation complete');
} catch (error) {
  console.error('   ✗ TypeScript compilation failed');
  process.exit(1);
}

// Step 3: Copy renderer files
console.log('\n3️⃣  Copying renderer files...');
try {
  const srcRenderer = path.join(ROOT_DIR, 'src', 'renderer');
  const distRenderer = path.join(DIST_DIR, 'renderer');
  
  if (!fs.existsSync(distRenderer)) {
    fs.mkdirSync(distRenderer, { recursive: true });
  }
  
  // Copy HTML and CSS files
  const files = fs.readdirSync(srcRenderer);
  let copiedCount = 0;
  
  files.forEach(file => {
    if (file.endsWith('.html') || file.endsWith('.css')) {
      const srcPath = path.join(srcRenderer, file);
      const destPath = path.join(distRenderer, file);
      fs.copyFileSync(srcPath, destPath);
      copiedCount++;
    }
  });
  
  console.log(`   ✓ Copied ${copiedCount} renderer files`);
} catch (error) {
  console.error('   ✗ Failed to copy renderer files:', error.message);
  process.exit(1);
}

// Step 4: Verify build output
console.log('\n4️⃣  Verifying build output...');
const requiredFiles = [
  'main/main.js',
  'main/window-controller.js',
  'main/widget-manager.js',
  'main/ipc-handlers.js',
  'preload/widget-preload.js',
  'preload/manager-preload.js',
  'renderer/manager.html'
];

let allFilesExist = true;
requiredFiles.forEach(file => {
  const filePath = path.join(DIST_DIR, file);
  if (fs.existsSync(filePath)) {
    console.log(`   ✓ ${file}`);
  } else {
    console.log(`   ✗ ${file} (missing)`);
    allFilesExist = false;
  }
});

if (!allFilesExist) {
  console.error('\n❌ Build verification failed: Some required files are missing');
  process.exit(1);
}

console.log('\n✅ Build completed successfully!\n');
console.log('📦 Output directory: dist/');
console.log('🚀 Run "npm start" to launch the application');
console.log('📦 Run "npm run package:win" or "npm run package:mac" to create installers\n');
