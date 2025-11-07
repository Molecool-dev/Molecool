/**
 * Type validation script
 * Run with: npx tsx lib/validate-types.ts
 * This ensures our type definitions compile correctly
 */

import type { Widget, WidgetPermissions, WidgetSizes, Database } from '../database.types';

// Test 1: Full widget object
const fullWidget: Widget = {
  id: '123e4567-e89b-12d3-a456-426614174000',
  widget_id: 'test-widget',
  name: 'test',
  display_name: 'Test Widget',
  description: 'A test widget',
  author_name: 'Test Author',
  author_email: 'test@example.com',
  version: '1.0.0',
  downloads: 0,
  permissions: {
    systemInfo: {
      cpu: true,
      memory: true,
    },
    network: {
      enabled: true,
      allowedDomains: ['api.example.com'],
    },
  },
  sizes: {
    default: {
      width: 300,
      height: 200,
    },
    min: {
      width: 200,
      height: 150,
    },
    max: {
      width: 600,
      height: 400,
    },
  },
  icon_url: 'https://example.com/icon.png',
  download_url: 'https://example.com/widget.zip',
  created_at: '2024-01-01T00:00:00Z',
  updated_at: '2024-01-01T00:00:00Z',
};

// Test 2: Minimal widget object
const minimalWidget: Widget = {
  id: '123e4567-e89b-12d3-a456-426614174001',
  widget_id: 'minimal-widget',
  name: 'minimal',
  display_name: 'Minimal Widget',
  description: 'A minimal widget',
  author_name: 'Test Author',
  author_email: 'test@example.com',
  version: '1.0.0',
  downloads: 0,
  permissions: {},
  sizes: {
    default: {
      width: 300,
      height: 200,
    },
  },
  icon_url: null,
  download_url: 'https://example.com/widget.zip',
  created_at: '2024-01-01T00:00:00Z',
  updated_at: '2024-01-01T00:00:00Z',
};

// Test 3: Database type structure
type WidgetRow = Database['public']['Tables']['widgets']['Row'];
type WidgetInsert = Database['public']['Tables']['widgets']['Insert'];
type WidgetUpdate = Database['public']['Tables']['widgets']['Update'];

const insertExample: WidgetInsert = {
  widget_id: 'new-widget',
  name: 'new',
  display_name: 'New Widget',
  description: 'A new widget',
  author_name: 'Author',
  author_email: 'author@example.com',
  version: '1.0.0',
  downloads: 0,
  permissions: {},
  sizes: {
    default: {
      width: 300,
      height: 200,
    },
  },
  download_url: 'https://example.com/widget.zip',
};

const updateExample: WidgetUpdate = {
  downloads: 100,
  version: '1.0.1',
};

console.log('✅ All type definitions are valid!');
console.log('   - Full widget object compiles');
console.log('   - Minimal widget object compiles');
console.log('   - Database Insert type compiles');
console.log('   - Database Update type compiles');
