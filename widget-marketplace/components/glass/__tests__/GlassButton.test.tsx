import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { GlassButton } from '../GlassButton';
import { describe, it, expect, vi } from 'vitest';

describe('GlassButton', () => {
  it('renders children correctly', () => {
    render(<GlassButton>Click me</GlassButton>);
    expect(screen.getByRole('button', { name: 'Click me' })).toBeInTheDocument();
  });

  it('applies primary variant styles by default', () => {
    render(<GlassButton>Primary</GlassButton>);
    const button = screen.getByRole('button');
    expect(button).toHaveClass('from-cyan-500', 'to-blue-500');
  });

  it('applies secondary variant styles when specified', () => {
    render(<GlassButton variant="secondary">Secondary</GlassButton>);
    const button = screen.getByRole('button');
    expect(button).toHaveClass('bg-white/10', 'backdrop-blur-sm');
  });

  it('forwards size prop to base Button', () => {
    render(<GlassButton size="lg">Large</GlassButton>);
    const button = screen.getByRole('button');
    expect(button).toHaveClass('h-10', 'px-8');
  });

  it('calls onClick handler when clicked', () => {
    const handleClick = vi.fn();
    render(<GlassButton onClick={handleClick}>Click</GlassButton>);
    
    fireEvent.click(screen.getByRole('button'));
    expect(handleClick).toHaveBeenCalledTimes(1);
  });

  it('creates ripple effect on click', () => {
    render(<GlassButton>Ripple</GlassButton>);
    const button = screen.getByRole('button');
    
    fireEvent.click(button);
    
    // Check that a ripple span was created
    const ripples = button.querySelectorAll('span.absolute.rounded-full');
    expect(ripples.length).toBeGreaterThan(0);
  });

  it('does not create ripple when disabled', () => {
    render(<GlassButton disabled>Disabled</GlassButton>);
    const button = screen.getByRole('button');
    
    fireEvent.click(button);
    
    // No ripples should be created
    const ripples = button.querySelectorAll('span.absolute.rounded-full');
    expect(ripples.length).toBe(0);
  });

  it('removes ripple after animation completes', async () => {
    render(<GlassButton>Ripple</GlassButton>);
    const button = screen.getByRole('button');
    
    fireEvent.click(button);
    
    // Ripple should exist initially
    expect(button.querySelectorAll('span.absolute.rounded-full').length).toBeGreaterThan(0);
    
    // Wait for ripple to be removed (600ms)
    await waitFor(() => {
      expect(button.querySelectorAll('span.absolute.rounded-full').length).toBe(0);
    }, { timeout: 700 });
  });

  it('merges custom className with variant styles', () => {
    render(<GlassButton className="custom-class">Custom</GlassButton>);
    const button = screen.getByRole('button');
    expect(button).toHaveClass('custom-class');
    expect(button).toHaveClass('from-cyan-500'); // Still has variant styles
  });

  it('respects disabled state', () => {
    const handleClick = vi.fn();
    render(<GlassButton disabled onClick={handleClick}>Disabled</GlassButton>);
    const button = screen.getByRole('button');
    
    expect(button).toBeDisabled();
    fireEvent.click(button);
    expect(handleClick).not.toHaveBeenCalled();
  });

  it('cleans up timeouts on unmount', () => {
    const { unmount } = render(<GlassButton>Cleanup</GlassButton>);
    const button = screen.getByRole('button');
    
    // Create multiple ripples
    fireEvent.click(button);
    fireEvent.click(button);
    fireEvent.click(button);
    
    // Unmount should not cause any errors
    expect(() => unmount()).not.toThrow();
  });
});
