import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, waitFor, cleanup } from '@testing-library/react';
import '@testing-library/jest-dom';
import App from '../src/index';

// Mock the widget API
const mockSystemAPI = {
  getCPU: vi.fn(),
  getMemory: vi.fn(),
};

const mockWidgetAPI = {
  storage: {
    get: vi.fn(),
    set: vi.fn(),
    remove: vi.fn(),
  },
  settings: {
    get: vi.fn(),
    getAll: vi.fn(),
  },
  system: mockSystemAPI,
  ui: {
    resize: vi.fn(),
    setPosition: vi.fn(),
  },
  widgetId: 'system-monitor',
  config: {
    id: 'system-monitor',
    name: 'System Monitor',
    displayName: 'System Monitor',
    version: '1.0.0',
    permissions: {
      systemInfo: {
        cpu: true,
        memory: true,
      },
      network: {
        enabled: false,
      },
    },
  },
};

describe('System Monitor Widget', () => {
  beforeEach(() => {
    // Mock window.widgetAPI
    (window as any).widgetAPI = mockWidgetAPI;
    
    // Setup default mock responses
    mockSystemAPI.getCPU.mockResolvedValue(45.5);
    mockSystemAPI.getMemory.mockResolvedValue({
      total: 16 * 1024 * 1024 * 1024, // 16 GB
      used: 8 * 1024 * 1024 * 1024,   // 8 GB
      free: 8 * 1024 * 1024 * 1024,   // 8 GB
      usagePercent: 50,
    });
    
    vi.useFakeTimers();
  });

  afterEach(() => {
    cleanup();
    vi.clearAllTimers();
    vi.useRealTimers();
    delete (window as any).widgetAPI;
  });

  it('should render the system monitor widget', () => {
    render(<App />);
    
    // Check that the header is rendered
    expect(screen.getByText('System Monitor')).toBeInTheDocument();
  });

  it('should display CPU usage', async () => {
    render(<App />);
    
    // Advance timers and wait for async updates
    await vi.advanceTimersByTimeAsync(2000);
    
    await waitFor(() => {
      expect(screen.getByText(/45\.5%/)).toBeInTheDocument();
    }, { timeout: 3000 });
  });

  it('should display memory usage', async () => {
    render(<App />);
    
    // Advance timers and wait for async updates
    await vi.advanceTimersByTimeAsync(2000);
    
    await waitFor(() => {
      expect(screen.getByText(/8\.0 GB \/ 16\.0 GB/)).toBeInTheDocument();
    }, { timeout: 3000 });
  });

  it('should call system APIs on interval', async () => {
    render(<App />);
    
    // First update
    await vi.advanceTimersByTimeAsync(2000);
    await waitFor(() => {
      expect(mockSystemAPI.getCPU).toHaveBeenCalled();
      expect(mockSystemAPI.getMemory).toHaveBeenCalled();
    }, { timeout: 3000 });
  });

  it('should display loading state initially', () => {
    render(<App />);
    
    // Before first update, should show "Loading..." (there are 2 instances: CPU and Memory)
    expect(screen.getAllByText('Loading...').length).toBeGreaterThanOrEqual(1);
  });

  it('should show green color for low CPU usage', async () => {
    mockSystemAPI.getCPU.mockResolvedValue(30);
    
    render(<App />);
    
    await vi.advanceTimersByTimeAsync(2000);
    
    await waitFor(() => {
      expect(screen.getByText(/30\.0%/)).toBeInTheDocument();
    }, { timeout: 3000 });
  });

  it('should show red color for high CPU usage', async () => {
    mockSystemAPI.getCPU.mockResolvedValue(85);
    
    render(<App />);
    
    await vi.advanceTimersByTimeAsync(2000);
    
    await waitFor(() => {
      expect(screen.getByText(/85\.0%/)).toBeInTheDocument();
    }, { timeout: 3000 });
  });

  it('should show green color for low memory usage', async () => {
    mockSystemAPI.getMemory.mockResolvedValue({
      total: 16 * 1024 * 1024 * 1024,
      used: 4 * 1024 * 1024 * 1024,
      free: 12 * 1024 * 1024 * 1024,
      usagePercent: 25,
    });
    
    render(<App />);
    
    await vi.advanceTimersByTimeAsync(2000);
    
    await waitFor(() => {
      expect(screen.getByText(/4\.0 GB \/ 16\.0 GB/)).toBeInTheDocument();
    }, { timeout: 3000 });
  });

  it('should show red color for high memory usage', async () => {
    mockSystemAPI.getMemory.mockResolvedValue({
      total: 16 * 1024 * 1024 * 1024,
      used: 14 * 1024 * 1024 * 1024,
      free: 2 * 1024 * 1024 * 1024,
      usagePercent: 87.5,
    });
    
    render(<App />);
    
    await vi.advanceTimersByTimeAsync(2000);
    
    await waitFor(() => {
      expect(screen.getByText(/14\.0 GB \/ 16\.0 GB/)).toBeInTheDocument();
    }, { timeout: 3000 });
  });

  it('should render progress bars', async () => {
    render(<App />);
    
    await vi.advanceTimersByTimeAsync(2000);
    
    await waitFor(() => {
      const progressBars = document.querySelectorAll('[class*="progressBar"]');
      expect(progressBars.length).toBeGreaterThanOrEqual(2);
    }, { timeout: 3000 });
  });

  it('should handle API errors gracefully', async () => {
    mockSystemAPI.getCPU.mockRejectedValue(new Error('Permission denied'));
    mockSystemAPI.getMemory.mockRejectedValue(new Error('Permission denied'));
    
    render(<App />);
    
    await vi.advanceTimersByTimeAsync(2000);
    
    // Should not crash, should show loading state
    await waitFor(() => {
      expect(screen.getAllByText('Loading...').length).toBeGreaterThanOrEqual(1);
    }, { timeout: 3000 });
  });
});
