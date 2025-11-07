import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { WidgetGallery } from '../WidgetGallery';
import type { Widget } from '@/lib/database.types';

const mockWidgets: Widget[] = [
  {
    id: '1',
    widget_id: 'clock-widget',
    name: 'clock',
    display_name: 'Clock Widget',
    description: 'A simple clock widget',
    author_name: 'John Doe',
    author_email: 'john@example.com',
    version: '1.0.0',
    downloads: 100,
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
  },
  {
    id: '2',
    widget_id: 'weather-widget',
    name: 'weather',
    display_name: 'Weather Widget',
    description: 'Shows current weather',
    author_name: 'Jane Smith',
    author_email: 'jane@example.com',
    version: '1.0.0',
    downloads: 200,
    permissions: {
      systemInfo: { cpu: false, memory: false },
      network: { enabled: true, allowedDomains: ['api.weather.com'] },
    },
    sizes: {
      default: { width: 300, height: 200 },
    },
    icon_url: null,
    download_url: 'https://example.com/weather.widget',
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-01-01T00:00:00Z',
  },
  {
    id: '3',
    widget_id: 'system-monitor',
    name: 'system-monitor',
    display_name: 'System Monitor',
    description: 'Monitor CPU and memory usage',
    author_name: 'Bob Johnson',
    author_email: 'bob@example.com',
    version: '1.0.0',
    downloads: 150,
    permissions: {
      systemInfo: { cpu: true, memory: true },
      network: { enabled: false },
    },
    sizes: {
      default: { width: 250, height: 150 },
    },
    icon_url: null,
    download_url: 'https://example.com/system-monitor.widget',
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-01-01T00:00:00Z',
  },
];

describe('WidgetGallery', () => {
  it('should render all widgets', () => {
    render(<WidgetGallery widgets={mockWidgets} />);
    
    expect(screen.getByText('Clock Widget')).toBeInTheDocument();
    expect(screen.getByText('Weather Widget')).toBeInTheDocument();
    expect(screen.getByText('System Monitor')).toBeInTheDocument();
  });

  it('should display search bar', () => {
    render(<WidgetGallery widgets={mockWidgets} />);
    
    const searchInput = screen.getByPlaceholderText(/search widgets/i);
    expect(searchInput).toBeInTheDocument();
  });

  it('should filter widgets by name', async () => {
    const user = userEvent.setup();
    render(<WidgetGallery widgets={mockWidgets} />);
    
    const searchInput = screen.getByPlaceholderText(/search widgets/i);
    await user.type(searchInput, 'clock');
    
    expect(screen.getByText('Clock Widget')).toBeInTheDocument();
    expect(screen.queryByText('Weather Widget')).not.toBeInTheDocument();
    expect(screen.queryByText('System Monitor')).not.toBeInTheDocument();
  });

  it('should filter widgets by description', async () => {
    const user = userEvent.setup();
    render(<WidgetGallery widgets={mockWidgets} />);
    
    const searchInput = screen.getByPlaceholderText(/search widgets/i);
    await user.type(searchInput, 'weather');
    
    expect(screen.getByText('Weather Widget')).toBeInTheDocument();
    expect(screen.queryByText('Clock Widget')).not.toBeInTheDocument();
  });

  it('should filter widgets by author', async () => {
    const user = userEvent.setup();
    render(<WidgetGallery widgets={mockWidgets} />);
    
    const searchInput = screen.getByPlaceholderText(/search widgets/i);
    await user.type(searchInput, 'jane');
    
    expect(screen.getByText('Weather Widget')).toBeInTheDocument();
    expect(screen.queryByText('Clock Widget')).not.toBeInTheDocument();
  });

  it('should show results count when searching', async () => {
    const user = userEvent.setup();
    render(<WidgetGallery widgets={mockWidgets} />);
    
    const searchInput = screen.getByPlaceholderText(/search widgets/i);
    await user.type(searchInput, 'widget');
    
    // Check for the results count text
    expect(screen.getByText(/Found 2 widgets matching "widget"/i)).toBeInTheDocument();
  });

  it('should show no results message when no widgets match', async () => {
    const user = userEvent.setup();
    render(<WidgetGallery widgets={mockWidgets} />);
    
    const searchInput = screen.getByPlaceholderText(/search widgets/i);
    await user.type(searchInput, 'nonexistent');
    
    expect(screen.getByText(/no widgets found matching/i)).toBeInTheDocument();
  });

  it('should be case insensitive when searching', async () => {
    const user = userEvent.setup();
    render(<WidgetGallery widgets={mockWidgets} />);
    
    const searchInput = screen.getByPlaceholderText(/search widgets/i);
    await user.type(searchInput, 'CLOCK');
    
    expect(screen.getByText('Clock Widget')).toBeInTheDocument();
  });

  it('should show empty state when no widgets provided', () => {
    render(<WidgetGallery widgets={[]} />);
    
    expect(screen.getByText(/no widgets available/i)).toBeInTheDocument();
  });

  it('should clear filter when search is cleared', async () => {
    const user = userEvent.setup();
    render(<WidgetGallery widgets={mockWidgets} />);
    
    const searchInput = screen.getByPlaceholderText(/search widgets/i);
    await user.type(searchInput, 'clock');
    
    expect(screen.queryByText('Weather Widget')).not.toBeInTheDocument();
    
    await user.clear(searchInput);
    
    expect(screen.getByText('Clock Widget')).toBeInTheDocument();
    expect(screen.getByText('Weather Widget')).toBeInTheDocument();
    expect(screen.getByText('System Monitor')).toBeInTheDocument();
  });
});
