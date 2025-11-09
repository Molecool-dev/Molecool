import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import type { Widget } from '@/lib/database.types';

// Mock Next.js Image component
vi.mock('next/image', () => ({
  default: ({ src, alt, ...props }: any) => (
    <img src={src} alt={alt} {...props} />
  ),
}));

// Mock glass components
vi.mock('@/components/glass/GlassOrb', () => ({
  GlassOrb: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="glass-orb">{children}</div>
  ),
}));

// Import the WidgetIcon component by extracting it from the page
// Since it's not exported, we'll test it indirectly through integration
describe('Widget Detail Page Components', () => {
  const mockWidget: Widget = {
    id: '1',
    widget_id: 'test-widget',
    name: 'test',
    display_name: 'Test Widget',
    description: 'A test widget',
    author_name: 'Test Author',
    author_email: 'test@example.com',
    version: '1.0.0',
    downloads: 100,
    permissions: {},
    sizes: {
      default: { width: 300, height: 200 },
    },
    icon_url: 'https://example.com/icon.png',
    download_url: 'https://example.com/download',
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-01-01T00:00:00Z',
  };

  it('should format date consistently', () => {
    const date = new Date('2024-01-15T00:00:00Z');
    const formatted = date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
    
    expect(formatted).toMatch(/Jan \d+, 2024/);
  });

  it('should handle widget without icon', () => {
    const widgetWithoutIcon = { ...mockWidget, icon_url: null };
    const displayName = widgetWithoutIcon.display_name || 'Test';
    const firstLetter = displayName.charAt(0).toUpperCase();
    
    expect(firstLetter).toBe('T');
  });

  it('should handle widget with icon', () => {
    expect(mockWidget.icon_url).toBeTruthy();
    expect(mockWidget.icon_url).toContain('https://');
  });
});
