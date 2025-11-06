/**
 * Link Component Tests
 */

import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { Link } from '../Link';

describe('Link', () => {
  it('should render link text', () => {
    render(<Link href="#">Click here</Link>);
    expect(screen.getByText('Click here')).toBeDefined();
  });

  it('should render with href attribute', () => {
    render(<Link href="https://example.com">Example</Link>);
    const linkElement = screen.getByText('Example') as HTMLAnchorElement;
    expect(linkElement.href).toBe('https://example.com/');
  });

  it('should render with default variant', () => {
    const { container } = render(<Link href="#">Default Link</Link>);
    const linkElement = container.querySelector('.link-default');
    expect(linkElement).toBeDefined();
  });

  it('should render with subtle variant', () => {
    const { container } = render(<Link href="#" variant="subtle">Subtle Link</Link>);
    const linkElement = container.querySelector('.link-subtle');
    expect(linkElement).toBeDefined();
  });

  it('should render with target attribute', () => {
    render(<Link href="https://example.com" target="_blank">External</Link>);
    const linkElement = screen.getByText('External') as HTMLAnchorElement;
    expect(linkElement.target).toBe('_blank');
  });
});
