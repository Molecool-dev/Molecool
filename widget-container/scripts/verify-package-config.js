/**
 * Verify Package Configuration
 * 
 * This script verifies that all packaging requirements are met
 * without actually building the installer (which can be slow).
 */

const fs = require('fs');
const path = require('path');

const ROOT_DIR = path.join(__dirname, '..');
const DIST_DIR = path.join(ROOT_DIR, 'dist');
const ASSETS_DIR = path.join(ROOT_DIR, 'assets');

console.log('🔍 Verifying package configuration...\n');

let hasErrors = false;
let hasWarnings = false;

// Check 1: Build exists
console.log('1️⃣  Checking build...');
if (!fs.existsSync(DIST_DIR)) {
  console.log('   ✗ Build not found. Run "npm run build" first.');
  hasErrors = true;
} else {
  const mainJs = path.join(DIST_DIR, 'main', 'main.js');
  if (!fs.existsSync(mainJs)) {
    console.log('   ✗ Main process not found.');
    hasErrors = true;
  } else {
    console.log('   ✓ Build exists');
  }
}

// Check 2: package.json configuration
console.log('\n2️⃣  Checking package.json...');
const packageJson = require(path.join(ROOT_DIR, 'package.json'));

if (!packageJson.build) {
  console.log('   ✗ No build configuration found');
  hasErrors = true;
} else {
  console.log('   ✓ Build configuration exists');
  
  // Check required fields
  const required = ['appId', 'productName', 'directories'];
  required.forEach(field => {
    if (!packageJson.build[field]) {
      console.log(`   ✗ Missing build.${field}`);
      hasErrors = true;
    } else {
      console.log(`   ✓ build.${field} configured`);
    }
  });
}

// Check 3: Icons
console.log('\n3️⃣  Checking icons...');
const icons = [
  { file: 'icon.ico', platform: 'Windows' },
  { file: 'icon.icns', platform: 'macOS' },
  { file: 'icon.png', platform: 'Linux' }
];

icons.forEach(({ file, platform }) => {
  const iconPath = path.join(ASSETS_DIR, file);
  if (!fs.existsSync(iconPath)) {
    console.log(`   ⚠️  ${file} not found (${platform})`);
    hasWarnings = true;
  } else {
    const stats = fs.statSync(iconPath);
    if (stats.size < 1000) {
      console.log(`   ⚠️  ${file} is a placeholder (${platform})`);
      hasWarnings = true;
    } else {
      console.log(`   ✓ ${file} exists (${platform})`);
    }
  }
});

// Check 4: electron-builder dependency
console.log('\n4️⃣  Checking electron-builder...');
if (!packageJson.devDependencies || !packageJson.devDependencies['electron-builder']) {
  console.log('   ✗ electron-builder not installed');
  hasErrors = true;
} else {
  console.log(`   ✓ electron-builder ${packageJson.devDependencies['electron-builder']}`);
}

// Check 5: Protocol registration
console.log('\n5️⃣  Checking protocol registration...');
if (!packageJson.build.protocols || packageJson.build.protocols.length === 0) {
  console.log('   ⚠️  No custom protocols registered');
  hasWarnings = true;
} else {
  packageJson.build.protocols.forEach(protocol => {
    console.log(`   ✓ Protocol: ${protocol.schemes.join(', ')}`);
  });
}

// Check 6: Platform-specific configuration
console.log('\n6️⃣  Checking platform configurations...');

// Windows
if (packageJson.build.win) {
  console.log('   ✓ Windows configuration exists');
  if (packageJson.build.win.target) {
    console.log(`     - Target: ${JSON.stringify(packageJson.build.win.target)}`);
  }
  if (packageJson.build.nsis) {
    console.log('     - NSIS installer configured');
  }
} else {
  console.log('   ⚠️  No Windows configuration');
  hasWarnings = true;
}

// macOS
if (packageJson.build.mac) {
  console.log('   ✓ macOS configuration exists');
  if (packageJson.build.mac.target) {
    console.log(`     - Target: ${JSON.stringify(packageJson.build.mac.target)}`);
  }
  if (packageJson.build.dmg) {
    console.log('     - DMG configuration exists');
  }
} else {
  console.log('   ⚠️  No macOS configuration');
  hasWarnings = true;
}

// Check 7: Extra resources
console.log('\n7️⃣  Checking extra resources...');
if (packageJson.build.extraResources) {
  console.log('   ✓ Extra resources configured');
  packageJson.build.extraResources.forEach(resource => {
    const resourcePath = path.join(ROOT_DIR, resource.from);
    if (fs.existsSync(resourcePath)) {
      console.log(`     ✓ ${resource.from} → ${resource.to}`);
    } else {
      console.log(`     ⚠️  ${resource.from} not found`);
      hasWarnings = true;
    }
  });
} else {
  console.log('   ℹ️  No extra resources configured');
}

// Summary
console.log('\n' + '='.repeat(60));
if (hasErrors) {
  console.log('❌ Configuration has errors. Fix them before packaging.');
  process.exit(1);
} else if (hasWarnings) {
  console.log('⚠️  Configuration has warnings. Review before packaging.');
  console.log('\n📝 Recommendations:');
  console.log('   - Replace placeholder icons with professional designs');
  console.log('   - Test on target platforms before distribution');
  console.log('   - Consider code signing for production builds');
  process.exit(0);
} else {
  console.log('✅ Configuration looks good!');
  console.log('\n📦 Ready to package:');
  console.log('   - Windows: npm run package:win');
  console.log('   - macOS:   npm run package:mac');
  process.exit(0);
}
