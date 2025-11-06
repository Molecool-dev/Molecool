/**
 * Form Components Tests
 */

import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { Input, Select } from '../Forms';

describe('Input', () => {
  it('should render input with label', () => {
    render(<Input label="Username" />);
    expect(screen.getByText('Username')).toBeDefined();
  });

  it('should render input with placeholder', () => {
    render(<Input placeholder="Enter your name" />);
    const inputElement = screen.getByPlaceholderText('Enter your name');
    expect(inputElement).toBeDefined();
  });

  it('should call onChange when value changes', () => {
    const handleChange = vi.fn();
    render(<Input onChange={handleChange} />);
    
    const inputElement = screen.getByRole('textbox');
    fireEvent.change(inputElement, { target: { value: 'test' } });
    expect(handleChange).toHaveBeenCalled();
  });

  it('should render error message', () => {
    render(<Input error="This field is required" />);
    expect(screen.getByText('This field is required')).toBeDefined();
  });

  it('should be disabled when disabled prop is true', () => {
    render(<Input disabled />);
    const inputElement = screen.getByRole('textbox') as HTMLInputElement;
    expect(inputElement.disabled).toBe(true);
  });
});

describe('Select', () => {
  const options = [
    { value: 'option1', label: 'Option 1' },
    { value: 'option2', label: 'Option 2' },
    { value: 'option3', label: 'Option 3' },
  ];

  it('should render select with label', () => {
    render(<Select label="Choose option" options={options} />);
    expect(screen.getByText('Choose option')).toBeDefined();
  });

  it('should render all options', () => {
    render(<Select options={options} />);
    expect(screen.getByText('Option 1')).toBeDefined();
    expect(screen.getByText('Option 2')).toBeDefined();
    expect(screen.getByText('Option 3')).toBeDefined();
  });

  it('should call onChange when selection changes', () => {
    const handleChange = vi.fn();
    render(<Select options={options} onChange={handleChange} />);
    
    const selectElement = screen.getByRole('combobox');
    fireEvent.change(selectElement, { target: { value: 'option2' } });
    expect(handleChange).toHaveBeenCalled();
  });

  it('should render error message', () => {
    render(<Select options={options} error="Please select an option" />);
    expect(screen.getByText('Please select an option')).toBeDefined();
  });
});
