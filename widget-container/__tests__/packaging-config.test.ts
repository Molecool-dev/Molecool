/**
 * Packaging Configuration Tests
 * 
 * Verifies that the electron-builder configuration is valid
 * and all required files for packaging exist.
 */

import * as fs from 'fs';
import * as path from 'path';

const ROOT_DIR = path.join(__dirname, '..');
const PACKAGE_JSON_PATH = path.join(ROOT_DIR, 'package.json');
const ASSETS_DIR = path.join(ROOT_DIR, 'assets');

describe('Packaging Configuration', () => {
  let packageJson: any;

  beforeAll(() => {
    packageJson = JSON.parse(fs.readFileSync(PACKAGE_JSON_PATH, 'utf-8'));
  });

  describe('package.json build configuration', () => {
    test('should have build configuration', () => {
      expect(packageJson.build).toBeDefined();
    });

    test('should have required build fields', () => {
      expect(packageJson.build.appId).toBe('com.molecule.widget-platform');
      expect(packageJson.build.productName).toBe('Molecule');
      expect(packageJson.build.directories).toBeDefined();
      expect(packageJson.build.directories.output).toBe('dist-build');
    });

    test('should have protocol registration', () => {
      expect(packageJson.build.protocols).toBeDefined();
      expect(Array.isArray(packageJson.build.protocols)).toBe(true);
      expect(packageJson.build.protocols.length).toBeGreaterThan(0);
      
      const widgetProtocol = packageJson.build.protocols.find(
        (p: any) => p.schemes.includes('widget')
      );
      expect(widgetProtocol).toBeDefined();
    });

    test('should have files configuration', () => {
      expect(packageJson.build.files).toBeDefined();
      expect(Array.isArray(packageJson.build.files)).toBe(true);
      expect(packageJson.build.files).toContain('dist/**/*');
      expect(packageJson.build.files).toContain('node_modules/**/*');
      expect(packageJson.build.files).toContain('package.json');
    });
  });

  describe('Windows configuration', () => {
    test('should have Windows build configuration', () => {
      expect(packageJson.build.win).toBeDefined();
    });

    test('should target NSIS installer', () => {
      expect(packageJson.build.win.target).toBeDefined();
      const targets = Array.isArray(packageJson.build.win.target)
        ? packageJson.build.win.target
        : [packageJson.build.win.target];
      
      const nsisTarget = targets.find((t: any) => 
        typeof t === 'string' ? t === 'nsis' : t.target === 'nsis'
      );
      expect(nsisTarget).toBeDefined();
    });

    test('should have icon path configured', () => {
      expect(packageJson.build.win.icon).toBe('assets/icon.ico');
    });

    test('should have NSIS configuration', () => {
      expect(packageJson.build.nsis).toBeDefined();
      expect(packageJson.build.nsis.oneClick).toBe(false);
      expect(packageJson.build.nsis.allowToChangeInstallationDirectory).toBe(true);
      expect(packageJson.build.nsis.createDesktopShortcut).toBe(true);
    });
  });

  describe('macOS configuration', () => {
    test('should have macOS build configuration', () => {
      expect(packageJson.build.mac).toBeDefined();
    });

    test('should target DMG', () => {
      expect(packageJson.build.mac.target).toBeDefined();
      const targets = Array.isArray(packageJson.build.mac.target)
        ? packageJson.build.mac.target
        : [packageJson.build.mac.target];
      
      const dmgTarget = targets.find((t: any) => 
        typeof t === 'string' ? t === 'dmg' : t.target === 'dmg'
      );
      expect(dmgTarget).toBeDefined();
    });

    test('should have icon path configured', () => {
      expect(packageJson.build.mac.icon).toBe('assets/icon.icns');
    });

    test('should have category configured', () => {
      expect(packageJson.build.mac.category).toBe('public.app-category.utilities');
    });

    test('should have DMG configuration', () => {
      expect(packageJson.build.dmg).toBeDefined();
      expect(packageJson.build.dmg.contents).toBeDefined();
      expect(Array.isArray(packageJson.build.dmg.contents)).toBe(true);
    });
  });

  describe('Build scripts', () => {
    test('should have build script', () => {
      expect(packageJson.scripts.build).toBeDefined();
      expect(packageJson.scripts.build).toContain('build.js');
    });

    test('should have package scripts', () => {
      expect(packageJson.scripts['package:win']).toBeDefined();
      expect(packageJson.scripts['package:mac']).toBeDefined();
      expect(packageJson.scripts['package:verify']).toBeDefined();
    });

    test('should have icons script', () => {
      expect(packageJson.scripts.icons).toBeDefined();
      expect(packageJson.scripts.icons).toContain('generate-icons.js');
    });
  });

  describe('Dependencies', () => {
    test('should have electron-builder as dev dependency', () => {
      expect(packageJson.devDependencies['electron-builder']).toBeDefined();
    });

    test('should have electron as dev dependency', () => {
      expect(packageJson.devDependencies.electron).toBeDefined();
    });
  });

  describe('Assets directory', () => {
    test('should have assets directory', () => {
      expect(fs.existsSync(ASSETS_DIR)).toBe(true);
    });

    test('should have README in assets', () => {
      const readmePath = path.join(ASSETS_DIR, 'README.md');
      expect(fs.existsSync(readmePath)).toBe(true);
    });

    test('should have icon files (or placeholders)', () => {
      const iconIco = path.join(ASSETS_DIR, 'icon.ico');
      const iconIcns = path.join(ASSETS_DIR, 'icon.icns');
      const iconPng = path.join(ASSETS_DIR, 'icon.png');
      
      // At least one icon file should exist
      const hasIcons = fs.existsSync(iconIco) || 
                      fs.existsSync(iconIcns) || 
                      fs.existsSync(iconPng);
      expect(hasIcons).toBe(true);
    });
  });

  describe('Build scripts exist', () => {
    test('should have build.js script', () => {
      const buildScript = path.join(ROOT_DIR, 'scripts', 'build.js');
      expect(fs.existsSync(buildScript)).toBe(true);
    });

    test('should have package.js script', () => {
      const packageScript = path.join(ROOT_DIR, 'scripts', 'package.js');
      expect(fs.existsSync(packageScript)).toBe(true);
    });

    test('should have verify-package-config.js script', () => {
      const verifyScript = path.join(ROOT_DIR, 'scripts', 'verify-package-config.js');
      expect(fs.existsSync(verifyScript)).toBe(true);
    });

    test('should have generate-icons.js script', () => {
      const iconsScript = path.join(ROOT_DIR, 'scripts', 'generate-icons.js');
      expect(fs.existsSync(iconsScript)).toBe(true);
    });
  });

  describe('Documentation', () => {
    test('should have PACKAGING.md', () => {
      const packagingDoc = path.join(ROOT_DIR, 'PACKAGING.md');
      expect(fs.existsSync(packagingDoc)).toBe(true);
    });

    test('should have building-and-packaging.md', () => {
      const buildingDoc = path.join(ROOT_DIR, 'docs', 'building-and-packaging.md');
      expect(fs.existsSync(buildingDoc)).toBe(true);
    });
  });
});
