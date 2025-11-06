/**
 * Layout Components Tests
 */

import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { Grid, Divider, Header } from '../Layout';

describe('Layout Components', () => {
  describe('Grid', () => {
    it('should render children in grid', () => {
      render(
        <Grid>
          <div>Item 1</div>
          <div>Item 2</div>
        </Grid>
      );
      
      expect(screen.getByText('Item 1')).toBeDefined();
      expect(screen.getByText('Item 2')).toBeDefined();
    });

    it('should apply default 2 columns', () => {
      const { container } = render(
        <Grid>
          <div>Item</div>
        </Grid>
      );
      
      const gridElement = container.firstChild as HTMLElement;
      expect(gridElement.style.gridTemplateColumns).toBe('repeat(2, 1fr)');
    });

    it('should apply custom columns', () => {
      const { container } = render(
        <Grid columns={3}>
          <div>Item</div>
        </Grid>
      );
      
      const gridElement = container.firstChild as HTMLElement;
      expect(gridElement.style.gridTemplateColumns).toBe('repeat(3, 1fr)');
    });

    it('should apply custom gap', () => {
      const { container } = render(
        <Grid gap={20}>
          <div>Item</div>
        </Grid>
      );
      
      const gridElement = container.firstChild as HTMLElement;
      expect(gridElement.style.gap).toBe('20px');
    });
  });

  describe('Divider', () => {
    it('should render divider', () => {
      const { container } = render(<Divider />);
      const dividerElement = container.firstChild as HTMLElement;
      expect(dividerElement).toBeDefined();
      expect(dividerElement.className).toBeTruthy();
    });

    it('should apply custom className', () => {
      const { container } = render(<Divider className="custom-divider" />);
      const dividerElement = container.firstChild as HTMLElement;
      expect(dividerElement.className).toContain('custom-divider');
    });
  });

  describe('Header', () => {
    it('should render header text', () => {
      render(<Header>Section Header</Header>);
      expect(screen.getByText('Section Header')).toBeDefined();
    });

    it('should apply custom className', () => {
      const { container } = render(<Header className="custom-header">Header</Header>);
      const headerElement = container.firstChild as HTMLElement;
      expect(headerElement.className).toContain('custom-header');
    });
  });
});
