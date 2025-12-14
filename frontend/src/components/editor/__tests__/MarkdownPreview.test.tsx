import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import MarkdownPreview from '../MarkdownPreview'

// Mock marked
vi.mock('marked', () => ({
  marked: vi.fn((content: string) => {
    // Simple mock implementation
    if (content.startsWith('# ')) {
      return `<h1>${content.slice(2)}</h1>`
    }
    if (content.startsWith('## ')) {
      return `<h2>${content.slice(3)}</h2>`
    }
    if (content.includes('**')) {
      return content.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
    }
    return `<p>${content}</p>`
  }),
  setOptions: vi.fn()
}))

describe('MarkdownPreview', () => {
  it('renders markdown content as HTML', () => {
    const content = '# Test Header'

    render(<MarkdownPreview content={content} />)

    const preview = screen.getByText('Test Header')
    expect(preview).toBeInTheDocument()
  })

  it('renders with custom className', () => {
    const content = 'Test content'
    const customClass = 'custom-preview'

    render(<MarkdownPreview content={content} className={customClass} />)

    const preview = document.querySelector('.custom-preview')
    expect(preview).toBeInTheDocument()
  })

  it('renders with custom styles', () => {
    const content = 'Test content'
    const customStyle = { backgroundColor: 'red' }

    render(<MarkdownPreview content={content} style={customStyle} />)

    const preview = document.querySelector('.markdown-preview')
    expect(preview).toHaveStyle('background-color: red')
  })

  it('handles empty content', () => {
    render(<MarkdownPreview content="" />)

    const preview = document.querySelector('.markdown-preview')
    expect(preview).toBeInTheDocument()
  })

  it('handles bold text markdown', () => {
    const content = '**Bold text**'

    render(<MarkdownPreview content={content} />)

    const boldText = screen.getByText('Bold text')
    expect(boldText).toBeInTheDocument()
  })

  it('handles header markdown', () => {
    const content = '## Section Header'

    render(<MarkdownPreview content={content} />)

    const header = screen.getByText('Section Header')
    expect(header).toBeInTheDocument()
  })

  it('applies default styles', () => {
    const content = 'Test content'

    render(<MarkdownPreview content={content} />)

    const preview = document.querySelector('.markdown-preview')
    expect(preview).toHaveClass('markdown-preview')
    expect(preview).toHaveStyle('padding: 16px')
    expect(preview).toHaveStyle('background-color: #fff')
  })
})