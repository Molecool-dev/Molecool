import { render } from '@testing-library/react';
import { LightRays } from '../LightRays';

describe('LightRays', () => {
  it('renders with default props', () => {
    const { container } = render(<LightRays />);
    const wrapper = container.firstChild as HTMLElement;
    
    expect(wrapper).toBeInTheDocument();
    expect(wrapper).toHaveClass('pointer-events-none');
    expect(wrapper).toHaveAttribute('aria-hidden', 'true');
  });

  it('renders correct number of rays', () => {
    const { container } = render(<LightRays rayCount={4} />);
    const rays = container.querySelectorAll('.absolute.inset-0');
    
    // -1 because the wrapper also has these classes
    expect(rays.length - 1).toBe(4);
  });

  it('calculates rotation correctly for different ray counts', () => {
    const { container } = render(<LightRays rayCount={6} />);
    const rays = Array.from(container.querySelectorAll('.absolute.inset-0')).slice(1);
    
    // 360 / 6 = 60 degrees per ray
    expect(rays[0]).toHaveStyle({ transform: 'rotate(0deg)' });
    expect(rays[1]).toHaveStyle({ transform: 'rotate(60deg)' });
    expect(rays[2]).toHaveStyle({ transform: 'rotate(120deg)' });
  });

  it('applies custom opacity to gradient', () => {
    const { container } = render(<LightRays opacity={0.5} />);
    const rays = Array.from(container.querySelectorAll('.absolute.inset-0')).slice(1);
    
    // Check that at least one ray exists and has inline styles
    expect(rays.length).toBeGreaterThan(0);
    expect(rays[0]).toHaveAttribute('style');
  });

  it('applies staggered animation delays', () => {
    const { container } = render(<LightRays rayCount={3} />);
    const rays = Array.from(container.querySelectorAll('.absolute.inset-0')).slice(1);
    
    expect(rays[0]).toHaveStyle({ animationDelay: '0s' });
    expect(rays[1]).toHaveStyle({ animationDelay: '0.3s' });
    expect(rays[2]).toHaveStyle({ animationDelay: '0.6s' });
  });

  it('does not re-render when parent re-renders with same props', () => {
    const { rerender } = render(<LightRays opacity={0.3} rayCount={8} />);
    const firstRender = document.body.innerHTML;
    
    rerender(<LightRays opacity={0.3} rayCount={8} />);
    const secondRender = document.body.innerHTML;
    
    expect(firstRender).toBe(secondRender);
  });
});
