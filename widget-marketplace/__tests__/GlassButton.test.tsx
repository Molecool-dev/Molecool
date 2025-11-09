import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { GlassButton } from '@/components/glass/GlassButton'

describe('GlassButton component', () => {
  it('should render children correctly', () => {
    render(<GlassButton>Click me</GlassButton>)
    expect(screen.getByText('Click me')).toBeInTheDocument()
  })

  it('should apply primary variant styles by default', () => {
    const { container } = render(<GlassButton>Primary Button</GlassButton>)
    const button = container.querySelector('button')
    expect(button).toHaveClass('from-cyan-500')
    expect(button).toHaveClass('to-blue-500')
  })

  it('should apply secondary variant styles', () => {
    const { container } = render(
      <GlassButton variant="secondary">Secondary Button</GlassButton>
    )
    const button = container.querySelector('button')
    expect(button).toHaveClass('bg-white/10')
    expect(button).toHaveClass('backdrop-blur-sm')
  })

  it('should trigger ripple effect on click', () => {
    const { container } = render(<GlassButton>Click me</GlassButton>)
    const button = screen.getByText('Click me')

    fireEvent.click(button, { clientX: 50, clientY: 50 })

    const ripple = container.querySelector('.animate-\\[ripple_0\\.6s_ease-out\\]')
    expect(ripple).toBeInTheDocument()
  })

  it('should call onClick handler when clicked', () => {
    const handleClick = vi.fn()
    render(<GlassButton onClick={handleClick}>Click me</GlassButton>)

    const button = screen.getByText('Click me')
    fireEvent.click(button)

    expect(handleClick).toHaveBeenCalledTimes(1)
  })

  it('should merge custom className prop', () => {
    const { container } = render(
      <GlassButton className="custom-class">Button</GlassButton>
    )
    const button = container.querySelector('button')
    expect(button).toHaveClass('custom-class')
  })

  it('should be disabled when disabled prop is passed', () => {
    render(<GlassButton disabled>Disabled Button</GlassButton>)
    const button = screen.getByText('Disabled Button')
    expect(button).toBeDisabled()
  })
})
