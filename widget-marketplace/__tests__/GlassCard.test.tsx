import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { GlassCard } from '@/components/glass/GlassCard'

describe('GlassCard component', () => {
  it('should render children correctly', () => {
    render(
      <GlassCard>
        <div>Test content</div>
      </GlassCard>
    )
    expect(screen.getByText('Test content')).toBeInTheDocument()
  })

  it('should apply glass-surface styling', () => {
    const { container } = render(
      <GlassCard>
        <div>Test content</div>
      </GlassCard>
    )
    const card = container.querySelector('.glass-surface')
    expect(card).toBeInTheDocument()
  })

  it('should render reflection overlay', () => {
    const { container } = render(
      <GlassCard>
        <div>Test content</div>
      </GlassCard>
    )
    const reflection = container.querySelector('.glass-reflection')
    expect(reflection).toBeInTheDocument()
    expect(reflection).toHaveAttribute('aria-hidden', 'true')
  })

  it('should apply warning variant with yellow border', () => {
    const { container } = render(
      <GlassCard variant="warning">
        <div>Warning content</div>
      </GlassCard>
    )
    const card = container.querySelector('.glass-surface')
    expect(card).toHaveClass('border-yellow-500/50')
  })

  it('should merge custom className prop', () => {
    const { container } = render(
      <GlassCard className="custom-class">
        <div>Test content</div>
      </GlassCard>
    )
    const card = container.querySelector('.glass-surface')
    expect(card).toHaveClass('custom-class')
  })

  it('should apply default variant when no variant specified', () => {
    const { container } = render(
      <GlassCard>
        <div>Test content</div>
      </GlassCard>
    )
    const card = container.querySelector('.glass-surface')
    expect(card).not.toHaveClass('border-yellow-500/50')
  })
})
