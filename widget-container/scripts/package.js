/**
 * Package Script for Molecule Widget Container
 * 
 * This script handles packaging the application for distribution:
 * 1. Verify build exists
 * 2. Check for icons
 * 3. Run electron-builder
 * 4. Verify package output
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const ROOT_DIR = path.join(__dirname, '..');
const DIST_DIR = path.join(ROOT_DIR, 'dist');
const ASSETS_DIR = path.join(ROOT_DIR, 'assets');
const DIST_BUILD_DIR = path.join(ROOT_DIR, 'dist-build');

// Get platform from command line args
const args = process.argv.slice(2);
const platform = args[0] || 'win'; // Default to Windows

console.log(`📦 Packaging Molecule Widget Container for ${platform === 'win' ? 'Windows' : 'macOS'}...\n`);

// Step 1: Verify build exists
console.log('1️⃣  Verifying build...');
if (!fs.existsSync(DIST_DIR)) {
  console.error('   ✗ Build not found. Run "npm run build" first.');
  process.exit(1);
}

const mainJs = path.join(DIST_DIR, 'main', 'main.js');
if (!fs.existsSync(mainJs)) {
  console.error('   ✗ Main process not found. Run "npm run build" first.');
  process.exit(1);
}
console.log('   ✓ Build verified');

// Step 2: Check for icons
console.log('\n2️⃣  Checking icons...');
const iconFile = platform === 'win' ? 'icon.ico' : 'icon.icns';
const iconPath = path.join(ASSETS_DIR, iconFile);

if (!fs.existsSync(ASSETS_DIR)) {
  console.log('   ⚠️  Assets directory not found. Creating placeholder icons...');
  try {
    execSync('node scripts/generate-icons.js', { cwd: ROOT_DIR, stdio: 'inherit' });
  } catch (error) {
    console.error('   ✗ Failed to generate icons');
  }
}

if (!fs.existsSync(iconPath)) {
  console.log(`   ⚠️  ${iconFile} not found. Using placeholder.`);
  console.log('   📝 For production, create proper icons in assets/ directory');
} else {
  console.log(`   ✓ ${iconFile} found`);
}

// Step 3: Run electron-builder
console.log('\n3️⃣  Running electron-builder...');
try {
  const builderCmd = platform === 'win' 
    ? 'electron-builder --win --x64'
    : 'electron-builder --mac';
  
  console.log(`   Command: ${builderCmd}`);
  execSync(builderCmd, { cwd: ROOT_DIR, stdio: 'inherit' });
  console.log('   ✓ Packaging complete');
} catch (error) {
  console.error('   ✗ Packaging failed');
  process.exit(1);
}

// Step 4: Verify package output
console.log('\n4️⃣  Verifying package output...');
if (!fs.existsSync(DIST_BUILD_DIR)) {
  console.error('   ✗ Package output not found');
  process.exit(1);
}

const files = fs.readdirSync(DIST_BUILD_DIR);
const installers = files.filter(f => 
  f.endsWith('.exe') || f.endsWith('.dmg') || f.endsWith('.zip')
);

if (installers.length === 0) {
  console.error('   ✗ No installer files found');
  process.exit(1);
}

console.log('   ✓ Package files created:');
installers.forEach(file => {
  const filePath = path.join(DIST_BUILD_DIR, file);
  const stats = fs.statSync(filePath);
  const sizeMB = (stats.size / 1024 / 1024).toFixed(2);
  console.log(`     - ${file} (${sizeMB} MB)`);
});

console.log('\n✅ Packaging completed successfully!\n');
console.log(`📦 Output directory: dist-build/`);
console.log(`🎉 Installer ready for distribution\n`);

// Print installation instructions
if (platform === 'win') {
  console.log('📝 Windows Installation:');
  console.log('   1. Run the .exe installer');
  console.log('   2. Follow the installation wizard');
  console.log('   3. Launch Molecule from Start Menu or Desktop shortcut\n');
} else {
  console.log('📝 macOS Installation:');
  console.log('   1. Open the .dmg file');
  console.log('   2. Drag Molecule to Applications folder');
  console.log('   3. Launch from Applications or Launchpad\n');
}
