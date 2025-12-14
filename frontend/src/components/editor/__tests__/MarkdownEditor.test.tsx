import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import MarkdownEditor from '../MarkdownEditor'

describe('MarkdownEditor', () => {
  it('renders Monaco Editor with correct props', () => {
    const mockOnChange = vi.fn()
    const testValue = '# Test Markdown'

    render(
      <MarkdownEditor
        value={testValue}
        onChange={mockOnChange}
        height="400px"
      />
    )

    const editor = screen.getByTestId('monaco-editor')
    expect(editor).toBeInTheDocument()
    expect(editor).toHaveValue(testValue)
  })

  it('calls onChange when content changes', async () => {
    const user = userEvent.setup()
    const mockOnChange = vi.fn()
    const initialValue = '# Initial'

    render(
      <MarkdownEditor
        value={initialValue}
        onChange={mockOnChange}
      />
    )

    const editor = screen.getByTestId('monaco-editor')
    
    await user.clear(editor)
    await user.type(editor, '# New Content')

    expect(mockOnChange).toHaveBeenCalledWith('# New Content')
  })

  it('renders with custom height', () => {
    const mockOnChange = vi.fn()

    render(
      <MarkdownEditor
        value=""
        onChange={mockOnChange}
        height="600px"
      />
    )

    const editor = screen.getByTestId('monaco-editor')
    expect(editor).toBeInTheDocument()
  })

  it('handles readOnly mode', () => {
    const mockOnChange = vi.fn()

    render(
      <MarkdownEditor
        value="Read only content"
        onChange={mockOnChange}
        readOnly={true}
      />
    )

    const editor = screen.getByTestId('monaco-editor')
    expect(editor).toBeInTheDocument()
  })

  it('handles empty content', () => {
    const mockOnChange = vi.fn()

    render(
      <MarkdownEditor
        value=""
        onChange={mockOnChange}
      />
    )

    const editor = screen.getByTestId('monaco-editor')
    expect(editor).toHaveValue('')
  })

  it('handles theme changes', () => {
    const mockOnChange = vi.fn()

    const { rerender } = render(
      <MarkdownEditor
        value="# Test"
        onChange={mockOnChange}
        theme="light"
      />
    )

    let editor = screen.getByTestId('monaco-editor')
    expect(editor).toBeInTheDocument()

    rerender(
      <MarkdownEditor
        value="# Test"
        onChange={mockOnChange}
        theme="dark"
      />
    )

    editor = screen.getByTestId('monaco-editor')
    expect(editor).toBeInTheDocument()
  })
})