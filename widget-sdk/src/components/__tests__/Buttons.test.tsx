/**
 * Button Component Tests
 */

import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { Button } from '../Buttons';

describe('Button', () => {
  it('should render button text', () => {
    render(<Button>Click Me</Button>);
    expect(screen.getByText('Click Me')).toBeDefined();
  });

  it('should call onClick when clicked', () => {
    const handleClick = vi.fn();
    render(<Button onClick={handleClick}>Click Me</Button>);
    
    fireEvent.click(screen.getByText('Click Me'));
    expect(handleClick).toHaveBeenCalledTimes(1);
  });

  it('should not call onClick when disabled', () => {
    const handleClick = vi.fn();
    render(<Button onClick={handleClick} disabled>Click Me</Button>);
    
    fireEvent.click(screen.getByText('Click Me'));
    expect(handleClick).not.toHaveBeenCalled();
  });

  it('should render with primary variant by default', () => {
    const { container } = render(<Button>Primary</Button>);
    const buttonElement = container.querySelector('button');
    expect(buttonElement?.className).toContain('button-primary');
  });

  it('should render with secondary variant', () => {
    const { container } = render(<Button variant="secondary">Secondary</Button>);
    const buttonElement = container.querySelector('button');
    expect(buttonElement?.className).toContain('button-secondary');
  });

  it('should render with danger variant', () => {
    const { container } = render(<Button variant="danger">Danger</Button>);
    const buttonElement = container.querySelector('button');
    expect(buttonElement?.className).toContain('button-danger');
  });

  it('should be disabled when disabled prop is true', () => {
    render(<Button disabled>Disabled</Button>);
    const buttonElement = screen.getByText('Disabled') as HTMLButtonElement;
    expect(buttonElement.disabled).toBe(true);
  });
});
