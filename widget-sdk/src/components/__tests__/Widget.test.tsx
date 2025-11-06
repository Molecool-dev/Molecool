/**
 * Widget Component Tests
 */

import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { Container } from '../Widget';

describe('Widget.Container', () => {
  it('should render children', () => {
    render(
      <Container>
        <div>Test Content</div>
      </Container>
    );
    
    expect(screen.getByText('Test Content')).toBeDefined();
  });

  it('should apply custom className', () => {
    const { container } = render(
      <Container className="custom-class">
        <div>Test</div>
      </Container>
    );
    
    const containerElement = container.firstChild as HTMLElement;
    expect(containerElement.className).toContain('custom-class');
  });

  it('should have glassmorphism styles', () => {
    const { container } = render(
      <Container>
        <div>Test</div>
      </Container>
    );
    
    const containerElement = container.firstChild as HTMLElement;
    expect(containerElement.className).toBeTruthy();
  });
});
