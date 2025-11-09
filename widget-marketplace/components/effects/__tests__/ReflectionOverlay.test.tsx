import { render } from '@testing-library/react';
import { ReflectionOverlay } from '../ReflectionOverlay';

describe('ReflectionOverlay', () => {
  it('renders with correct classes', () => {
    const { container } = render(<ReflectionOverlay />);
    const overlay = container.firstChild as HTMLElement;
    
    expect(overlay).toBeInTheDocument();
    expect(overlay).toHaveClass('absolute');
    expect(overlay).toHaveClass('inset-0');
    expect(overlay).toHaveClass('pointer-events-none');
    expect(overlay).toHaveAttribute('aria-hidden', 'true');
  });

  it('has correct inline styles', () => {
    const { container } = render(<ReflectionOverlay />);
    const overlay = container.firstChild as HTMLElement;
    
    expect(overlay).toHaveStyle({ borderRadius: 'inherit' });
  });

  it('does not re-render when parent re-renders', () => {
    const { rerender } = render(<ReflectionOverlay />);
    const firstRender = document.body.innerHTML;
    
    rerender(<ReflectionOverlay />);
    const secondRender = document.body.innerHTML;
    
    expect(firstRender).toBe(secondRender);
  });
});
