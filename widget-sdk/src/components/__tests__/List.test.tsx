/**
 * List Components Tests
 */

import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { List, ListItem } from '../List';

describe('List', () => {
  it('should render list with items', () => {
    render(
      <List>
        <ListItem>Item 1</ListItem>
        <ListItem>Item 2</ListItem>
        <ListItem>Item 3</ListItem>
      </List>
    );
    
    expect(screen.getByText('Item 1')).toBeDefined();
    expect(screen.getByText('Item 2')).toBeDefined();
    expect(screen.getByText('Item 3')).toBeDefined();
  });
});

describe('ListItem', () => {
  it('should render list item content', () => {
    render(<ListItem>Test Item</ListItem>);
    expect(screen.getByText('Test Item')).toBeDefined();
  });

  it('should render with icon', () => {
    render(<ListItem icon={<span>📄</span>}>Document</ListItem>);
    expect(screen.getByText('📄')).toBeDefined();
    expect(screen.getByText('Document')).toBeDefined();
  });

  it('should call onClick when clicked', () => {
    const handleClick = vi.fn();
    render(<ListItem onClick={handleClick}>Clickable Item</ListItem>);
    
    fireEvent.click(screen.getByText('Clickable Item'));
    expect(handleClick).toHaveBeenCalledTimes(1);
  });

  it('should render with active state', () => {
    const { container } = render(<ListItem active>Active Item</ListItem>);
    const listItemElement = container.querySelector('.listItemActive');
    expect(listItemElement).toBeDefined();
  });
});
