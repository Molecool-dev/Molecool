import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { WidgetCard } from '../WidgetCard';
import type { Widget } from '@/lib/database.types';

const mockWidget: Widget = {
  id: '1',
  widget_id: 'clock-widget',
  name: 'clock',
  display_name: 'Clock Widget',
  description: 'A simple clock widget that displays time',
  author_name: 'John Doe',
  author_email: 'john@example.com',
  version: '1.0.0',
  downloads: 1234,
  permissions: {
    systemInfo: { cpu: false, memory: false },
    network: { enabled: false },
  },
  sizes: {
    default: { width: 200, height: 100 },
  },
  icon_url: null,
  download_url: 'https://example.com/clock.widget',
  created_at: '2024-01-01T00:00:00Z',
  updated_at: '2024-01-01T00:00:00Z',
};

describe('WidgetCard', () => {
  it('should render widget display name', () => {
    render(<WidgetCard widget={mockWidget} />);
    
    expect(screen.getByText('Clock Widget')).toBeInTheDocument();
  });

  it('should render widget description', () => {
    render(<WidgetCard widget={mockWidget} />);
    
    expect(screen.getByText(/simple clock widget/i)).toBeInTheDocument();
  });

  it('should render author name', () => {
    render(<WidgetCard widget={mockWidget} />);
    
    expect(screen.getByText(/john doe/i)).toBeInTheDocument();
  });

  it('should render download count', () => {
    render(<WidgetCard widget={mockWidget} />);
    
    expect(screen.getByText(/1,234/)).toBeInTheDocument();
  });

  it('should link to widget detail page', () => {
    render(<WidgetCard widget={mockWidget} />);
    
    const link = screen.getByRole('link');
    expect(link).toHaveAttribute('href', '/widgets/clock-widget');
  });

  it('should render fallback icon when no icon_url provided', () => {
    render(<WidgetCard widget={mockWidget} />);
    
    const fallbackIcon = screen.getByText('C');
    expect(fallbackIcon).toBeInTheDocument();
  });

  it('should handle widget with icon_url', () => {
    const widgetWithIcon = {
      ...mockWidget,
      icon_url: 'https://example.com/icon.png',
    };
    
    render(<WidgetCard widget={widgetWithIcon} />);
    
    // Next.js Image with empty alt has role="presentation"
    const image = screen.getByRole('presentation');
    expect(image).toBeInTheDocument();
    expect(image).toHaveAttribute('src');
  });

  it('should format large download numbers', () => {
    const popularWidget = {
      ...mockWidget,
      downloads: 1234567,
    };
    
    render(<WidgetCard widget={popularWidget} />);
    
    expect(screen.getByText(/1,234,567/)).toBeInTheDocument();
  });
});
