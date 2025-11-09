import { render, screen } from '@testing-library/react';
import { GlassBadge } from '../GlassBadge';

describe('GlassBadge', () => {
  it('renders children correctly', () => {
    render(<GlassBadge>Test Badge</GlassBadge>);
    expect(screen.getByText('Test Badge')).toBeInTheDocument();
  });

  it('renders with icon when provided', () => {
    render(
      <GlassBadge icon={<span data-testid="test-icon">🔥</span>}>
        With Icon
      </GlassBadge>
    );
    expect(screen.getByTestId('test-icon')).toBeInTheDocument();
    expect(screen.getByText('With Icon')).toBeInTheDocument();
  });

  it('applies custom className', () => {
    const { container } = render(
      <GlassBadge className="custom-class">Custom</GlassBadge>
    );
    const badge = container.querySelector('.custom-class');
    expect(badge).toBeInTheDocument();
  });

  it('forwards ref correctly', () => {
    const ref = { current: null };
    render(<GlassBadge ref={ref}>Ref Test</GlassBadge>);
    expect(ref.current).toBeInstanceOf(HTMLDivElement);
  });

  it('applies glass styling classes', () => {
    const { container } = render(<GlassBadge>Glass</GlassBadge>);
    const badge = container.firstChild;
    expect(badge).toHaveClass('bg-white/10');
    expect(badge).toHaveClass('border-white/30');
  });
});
