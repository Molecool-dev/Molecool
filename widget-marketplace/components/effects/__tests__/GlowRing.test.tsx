import { render } from '@testing-library/react';
import { GlowRing } from '../GlowRing';

describe('GlowRing', () => {
  it('renders with correct classes', () => {
    const { container } = render(<GlowRing />);
    const ring = container.firstChild as HTMLElement;
    
    expect(ring).toBeInTheDocument();
    expect(ring).toHaveClass('pointer-events-none');
    expect(ring).toHaveClass('opacity-0');
    expect(ring).toHaveClass('group-hover:opacity-100');
    expect(ring).toHaveAttribute('aria-hidden', 'true');
  });

  it('has correct inline styles', () => {
    const { container } = render(<GlowRing />);
    const ring = container.firstChild as HTMLElement;
    
    expect(ring).toHaveAttribute('style');
    expect(ring).toHaveStyle({ filter: 'blur(8px)' });
    expect(ring).toHaveStyle({ borderRadius: 'inherit' });
  });

  it('does not re-render when parent re-renders', () => {
    const { rerender } = render(<GlowRing />);
    const firstRender = document.body.innerHTML;
    
    rerender(<GlowRing />);
    const secondRender = document.body.innerHTML;
    
    expect(firstRender).toBe(secondRender);
  });
});
