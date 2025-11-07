import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, waitFor, cleanup } from '@testing-library/react';
import '@testing-library/jest-dom';
import App from '../src/index';

describe('Clock Widget', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    cleanup();
    vi.clearAllTimers();
    vi.useRealTimers();
  });

  it('should render the clock widget', () => {
    render(<App />);
    
    // Check that the widget container is rendered
    const container = document.querySelector('.clockContainer');
    expect(container).toBeInTheDocument();
  });

  it('should display current time in HH:MM format', () => {
    const mockDate = new Date('2024-01-15T14:30:00');
    vi.setSystemTime(mockDate);
    
    render(<App />);
    
    // Should display 14:30
    expect(screen.getByText('14:30')).toBeInTheDocument();
  });

  it('should display current date', () => {
    const mockDate = new Date('2024-01-15T14:30:00');
    vi.setSystemTime(mockDate);
    
    render(<App />);
    
    // Check that date element exists with expected format
    // The widget uses zh-TW locale, so we check for year and month
    const dateText = screen.getByText(/2024年/);
    expect(dateText).toBeInTheDocument();
  });

  it('should render different times correctly', () => {
    // Test that the component correctly formats and displays different times
    // The useInterval hook is tested separately in the SDK
    const testTimes = [
      { time: new Date('2024-01-15T14:30:00'), expected: '14:30' },
      { time: new Date('2024-01-15T14:31:00'), expected: '14:31' },
      { time: new Date('2024-01-15T23:59:00'), expected: '23:59' }
    ];

    testTimes.forEach(({ time, expected }) => {
      vi.setSystemTime(time);
      const { unmount } = render(<App />);
      expect(screen.getByText(expected)).toBeInTheDocument();
      unmount();
    });
  });

  it('should pad single digit hours and minutes with zero', () => {
    const mockDate = new Date('2024-01-15T09:05:00');
    vi.setSystemTime(mockDate);
    
    render(<App />);
    
    // Should display 09:05, not 9:5
    expect(screen.getByText('09:05')).toBeInTheDocument();
  });

  it('should handle midnight correctly', () => {
    const mockDate = new Date('2024-01-15T00:00:00');
    vi.setSystemTime(mockDate);
    
    render(<App />);
    
    // Should display 00:00
    expect(screen.getByText('00:00')).toBeInTheDocument();
  });

  it('should handle noon correctly', () => {
    const mockDate = new Date('2024-01-15T12:00:00');
    vi.setSystemTime(mockDate);
    
    render(<App />);
    
    // Should display 12:00
    expect(screen.getByText('12:00')).toBeInTheDocument();
  });
});
