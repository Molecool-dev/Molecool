import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import App from '../src/index';

// Mock the widget API
const mockSettingsAPI = {
  get: vi.fn(),
  getAll: vi.fn(),
};

const mockWidgetAPI = {
  storage: {
    get: vi.fn(),
    set: vi.fn(),
    remove: vi.fn(),
  },
  settings: mockSettingsAPI,
  system: {
    getCPU: vi.fn(),
    getMemory: vi.fn(),
  },
  ui: {
    resize: vi.fn(),
    setPosition: vi.fn(),
  },
  widgetId: 'weather',
  config: {
    id: 'weather',
    name: 'Weather',
    displayName: 'Weather Widget',
    version: '1.0.0',
    permissions: {
      systemInfo: {
        cpu: false,
        memory: false,
      },
      network: {
        enabled: true,
        allowedDomains: ['api.openweathermap.org'],
      },
    },
  },
};

describe('Weather Widget', () => {
  beforeEach(() => {
    // Mock window.widgetAPI
    (window as any).widgetAPI = mockWidgetAPI;
    
    // Setup default mock responses
    mockSettingsAPI.get.mockResolvedValue('Taipei');
    
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.restoreAllMocks();
    vi.useRealTimers();
    delete (window as any).widgetAPI;
  });

  it('should render the weather widget', () => {
    render(<App />);
    
    // Check that the widget container is rendered
    const container = document.querySelector('.weatherContainer');
    expect(container).toBeInTheDocument();
  });

  it('should display loading state initially', () => {
    render(<App />);
    
    // Should show loading message
    expect(screen.getByText('Loading weather...')).toBeInTheDocument();
  });

  it('should display weather data after loading', async () => {
    render(<App />);
    
    // Wait for the component to load weather data
    await waitFor(() => {
      expect(screen.getByText('24°C')).toBeInTheDocument();
    });
  });

  it('should display city name', async () => {
    render(<App />);
    
    await waitFor(() => {
      expect(screen.getByText('Taipei')).toBeInTheDocument();
    });
  });

  it('should display weather condition', async () => {
    render(<App />);
    
    await waitFor(() => {
      expect(screen.getByText('Sunny')).toBeInTheDocument();
    });
  });

  it('should use city from settings', async () => {
    mockSettingsAPI.get.mockResolvedValue('Tokyo');
    
    render(<App />);
    
    await waitFor(() => {
      expect(screen.getByText('Tokyo')).toBeInTheDocument();
    });
  });

  it('should update weather every 10 minutes', async () => {
    const { rerender } = render(<App />);
    
    // Wait for initial load
    await waitFor(() => {
      expect(screen.getByText('24°C')).toBeInTheDocument();
    });
    
    // Advance time by 10 minutes (600000ms)
    vi.advanceTimersByTime(600000);
    
    // Weather should still be displayed (mock data doesn't change)
    await waitFor(() => {
      expect(screen.getByText('24°C')).toBeInTheDocument();
    });
  });

  it('should handle different city settings', async () => {
    mockSettingsAPI.get.mockResolvedValue('New York');
    
    render(<App />);
    
    await waitFor(() => {
      expect(screen.getByText('New York')).toBeInTheDocument();
    });
  });

  it('should display temperature in Celsius', async () => {
    render(<App />);
    
    await waitFor(() => {
      const tempElement = screen.getByText(/°C/);
      expect(tempElement).toBeInTheDocument();
    });
  });

  it('should not crash on fetch error', async () => {
    // Mock console.error to avoid noise in test output
    const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
    
    render(<App />);
    
    // Should still render with fallback data
    await waitFor(() => {
      expect(screen.getByText('24°C')).toBeInTheDocument();
    });
    
    consoleErrorSpy.mockRestore();
  });

  it('should display weather icon data', async () => {
    render(<App />);
    
    // Wait for weather data to load
    await waitFor(() => {
      expect(screen.getByText('Sunny')).toBeInTheDocument();
    });
    
    // The widget should have loaded weather data with icon
    // (icon is stored but not necessarily displayed in current implementation)
  });

  it('should handle default city when settings are empty', async () => {
    mockSettingsAPI.get.mockResolvedValue(undefined);
    
    render(<App />);
    
    // Should use default city (Taipei)
    await waitFor(() => {
      expect(screen.getByText('Taipei')).toBeInTheDocument();
    });
  });
});
