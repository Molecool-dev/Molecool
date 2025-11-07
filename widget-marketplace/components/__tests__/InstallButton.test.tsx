import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { InstallButton } from '../InstallButton';

describe('InstallButton', () => {
  beforeEach(() => {
    // Mock window.location.href
    delete (window as any).location;
    window.location = { href: '' } as any;
  });

  it('should render install button', () => {
    render(<InstallButton widgetId="clock-widget" />);
    
    const button = screen.getByRole('button', { name: /install widget/i });
    expect(button).toBeInTheDocument();
  });

  it('should trigger widget protocol when clicked', async () => {
    const user = userEvent.setup();
    render(<InstallButton widgetId="clock-widget" />);
    
    const button = screen.getByRole('button', { name: /install widget/i });
    await user.click(button);
    
    expect(window.location.href).toBe('widget://install/clock-widget');
  });

  it('should use correct widget ID in protocol URL', async () => {
    const user = userEvent.setup();
    render(<InstallButton widgetId="weather-widget" />);
    
    const button = screen.getByRole('button', { name: /install widget/i });
    await user.click(button);
    
    expect(window.location.href).toBe('widget://install/weather-widget');
  });

  it('should have accessible label', () => {
    render(<InstallButton widgetId="system-monitor" />);
    
    const button = screen.getByRole('button', { name: /install widget system-monitor/i });
    expect(button).toBeInTheDocument();
  });

  it('should be keyboard accessible', async () => {
    const user = userEvent.setup();
    render(<InstallButton widgetId="clock-widget" />);
    
    const button = screen.getByRole('button', { name: /install widget/i });
    button.focus();
    
    expect(button).toHaveFocus();
    
    await user.keyboard('{Enter}');
    
    expect(window.location.href).toBe('widget://install/clock-widget');
  });
});
