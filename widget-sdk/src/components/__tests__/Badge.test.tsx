/**
 * Badge Component Tests
 */

import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { Badge } from '../Badge';

describe('Badge', () => {
  it('should render badge text', () => {
    render(<Badge>New</Badge>);
    expect(screen.getByText('New')).toBeDefined();
  });

  it('should render with default variant', () => {
    const { container } = render(<Badge>Default</Badge>);
    const badgeElement = container.querySelector('.badge-default');
    expect(badgeElement).toBeDefined();
  });

  it('should render with primary variant', () => {
    const { container } = render(<Badge variant="primary">Primary</Badge>);
    const badgeElement = container.querySelector('.badge-primary');
    expect(badgeElement).toBeDefined();
  });

  it('should render with success variant', () => {
    const { container } = render(<Badge variant="success">Success</Badge>);
    const badgeElement = container.querySelector('.badge-success');
    expect(badgeElement).toBeDefined();
  });

  it('should render with warning variant', () => {
    const { container } = render(<Badge variant="warning">Warning</Badge>);
    const badgeElement = container.querySelector('.badge-warning');
    expect(badgeElement).toBeDefined();
  });

  it('should render with danger variant', () => {
    const { container } = render(<Badge variant="danger">Danger</Badge>);
    const badgeElement = container.querySelector('.badge-danger');
    expect(badgeElement).toBeDefined();
  });
});
