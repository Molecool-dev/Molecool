/**
 * Type safety tests for Supabase types
 * These tests verify that our type definitions are correct
 */

import type { Widget, WidgetPermissions, WidgetSizes, Database } from '../database.types';

describe('Database Types', () => {
  it('should have correct Widget type structure', () => {
    const widget: Widget = {
      id: '123e4567-e89b-12d3-a456-426614174000',
      widget_id: 'test-widget',
      name: 'test',
      display_name: 'Test Widget',
      description: 'A test widget',
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

    expect(widget).toBeDefined();
  });

  it('should support optional permission fields', () => {
    const permissions: WidgetPermissions = {
      systemInfo: {
        cpu: true,
        memory: true,
      },
      network: {
        enabled: true,
        allowedDomains: ['api.example.com'],
      },
    };

    expect(permissions).toBeDefined();
  });

  it('should support minimal permissions', () => {
    const permissions: WidgetPermissions = {};
    expect(permissions).toBeDefined();
  });

  it('should support widget sizes with optional min/max', () => {
    const sizes: WidgetSizes = {
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
    };

    expect(sizes).toBeDefined();
  });

  it('should support minimal sizes', () => {
    const sizes: WidgetSizes = {
      default: {
        width: 300,
        height: 200,
      },
    };

    expect(sizes).toBeDefined();
  });

  it('should have correct Database type structure', () => {
    type WidgetRow = Database['public']['Tables']['widgets']['Row'];
    type WidgetInsert = Database['public']['Tables']['widgets']['Insert'];
    type WidgetUpdate = Database['public']['Tables']['widgets']['Update'];

    // These type checks will fail at compile time if the structure is wrong
    const row: WidgetRow = {} as WidgetRow;
    const insert: WidgetInsert = {} as WidgetInsert;
    const update: WidgetUpdate = {} as WidgetUpdate;

    expect(row).toBeDefined();
    expect(insert).toBeDefined();
    expect(update).toBeDefined();
  });
});
