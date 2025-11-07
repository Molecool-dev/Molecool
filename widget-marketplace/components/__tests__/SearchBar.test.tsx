import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { SearchBar } from '../SearchBar';

describe('SearchBar', () => {
  it('should render search input', () => {
    render(<SearchBar value="" onChange={() => {}} />);
    
    const input = screen.getByRole('textbox');
    expect(input).toBeInTheDocument();
  });

  it('should display placeholder text', () => {
    render(<SearchBar value="" onChange={() => {}} placeholder="Search widgets..." />);
    
    const input = screen.getByPlaceholderText('Search widgets...');
    expect(input).toBeInTheDocument();
  });

  it('should display current value', () => {
    render(<SearchBar value="clock" onChange={() => {}} />);
    
    const input = screen.getByRole('textbox') as HTMLInputElement;
    expect(input.value).toBe('clock');
  });

  it('should call onChange when typing', async () => {
    const user = userEvent.setup();
    const handleChange = vi.fn();
    render(<SearchBar value="" onChange={handleChange} />);
    
    const input = screen.getByRole('textbox');
    await user.type(input, 'weather');
    
    expect(handleChange).toHaveBeenCalled();
  });

  it('should update value on input change', async () => {
    const user = userEvent.setup();
    const handleChange = vi.fn();
    render(<SearchBar value="" onChange={handleChange} />);
    
    const input = screen.getByRole('textbox');
    await user.type(input, 'w');
    
    expect(handleChange).toHaveBeenCalledWith('w');
  });

  it('should be keyboard accessible', async () => {
    const user = userEvent.setup();
    render(<SearchBar value="" onChange={() => {}} />);
    
    const input = screen.getByRole('textbox');
    await user.tab();
    
    expect(input).toHaveFocus();
  });

  it('should allow clearing the input', async () => {
    const user = userEvent.setup();
    const handleChange = vi.fn();
    render(<SearchBar value="test" onChange={handleChange} />);
    
    const input = screen.getByRole('textbox');
    await user.clear(input);
    
    expect(handleChange).toHaveBeenCalled();
  });
});
