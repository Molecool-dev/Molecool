/**
 * Typography Components Tests
 */

import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { Title, LargeText, SmallText } from '../Typography';

describe('Typography Components', () => {
  describe('Title', () => {
    it('should render with default medium size', () => {
      render(<Title>Test Title</Title>);
      expect(screen.getByText('Test Title')).toBeDefined();
    });

    it('should render with small size', () => {
      const { container } = render(<Title size="small">Small Title</Title>);
      const titleElement = container.querySelector('h1');
      expect(titleElement?.className).toContain('title-small');
    });

    it('should render with large size', () => {
      const { container } = render(<Title size="large">Large Title</Title>);
      const titleElement = container.querySelector('h1');
      expect(titleElement?.className).toContain('title-large');
    });
  });

  describe('LargeText', () => {
    it('should render large text', () => {
      render(<LargeText>42</LargeText>);
      expect(screen.getByText('42')).toBeDefined();
    });

    it('should apply custom className', () => {
      const { container } = render(<LargeText className="custom">Text</LargeText>);
      const textElement = container.firstChild as HTMLElement;
      expect(textElement.className).toContain('custom');
    });
  });

  describe('SmallText', () => {
    it('should render small text', () => {
      render(<SmallText>Small text content</SmallText>);
      expect(screen.getByText('Small text content')).toBeDefined();
    });

    it('should apply custom className', () => {
      const { container } = render(<SmallText className="custom">Text</SmallText>);
      const textElement = container.firstChild as HTMLElement;
      expect(textElement.className).toContain('custom');
    });
  });
});
