/**
 * Data Display Components Tests
 */

import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { Stat, ProgressBar } from '../DataDisplay';

describe('Stat', () => {
  it('should render label and value', () => {
    render(<Stat label="CPU Usage" value="45%" />);
    expect(screen.getByText('CPU Usage')).toBeDefined();
    expect(screen.getByText('45%')).toBeDefined();
  });

  it('should render with custom color', () => {
    render(<Stat label="Memory" value="8GB" color="#ff0000" />);
    expect(screen.getByText('Memory')).toBeDefined();
    expect(screen.getByText('8GB')).toBeDefined();
  });

  it('should render with icon', () => {
    render(<Stat label="Status" value="Active" icon={<span>🔥</span>} />);
    expect(screen.getByText('🔥')).toBeDefined();
  });
});

describe('ProgressBar', () => {
  it('should render with correct value', () => {
    render(<ProgressBar value={75} />);
    expect(screen.getByText('75%')).toBeDefined();
  });

  it('should clamp value between 0 and 100', () => {
    const { rerender } = render(<ProgressBar value={150} />);
    expect(screen.getByText('100%')).toBeDefined();
    
    rerender(<ProgressBar value={-10} />);
    expect(screen.getByText('0%')).toBeDefined();
  });

  it('should hide label when showLabel is false', () => {
    render(<ProgressBar value={50} showLabel={false} />);
    expect(screen.queryByText('50%')).toBeNull();
  });

  it('should render with custom color', () => {
    render(<ProgressBar value={60} color="#00ff00" />);
    expect(screen.getByText('60%')).toBeDefined();
  });
});
