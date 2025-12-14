import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import MarkdownEditorWithPreview from '../MarkdownEditorWithPreview'

// Mock the child components
vi.mock('../MarkdownEditor', () => ({
  default: vi.fn(({ value, onChange }) => (
    <textarea
      data-testid="markdown-editor"
      value={value}
      onChange={(e) => onChange?.(e.target.value)}
    />
  ))
}))

vi.mock('../MarkdownPreview', () => ({
  default: vi.fn(({ content }) => (
    <div data-testid="markdown-preview">{content}</div>
  ))
}))

describe('MarkdownEditorWithPreview', () => {
  it('renders with default split view mode', () => {
    const mockOnChange = vi.fn()
    const testValue = '# Test Content'

    render(
      <MarkdownEditorWithPreview
        value={testValue}
        onChange={mockOnChange}
      />
    )

    expect(screen.getByTestId('markdown-editor')).toBeInTheDocument()
    expect(screen.getByTestId('markdown-preview')).toBeInTheDocument()
    expect(screen.getByText('分屏')).toHaveClass('ant-btn-primary')
  })

  it('switches to edit mode when edit button is clicked', async () => {
    const user = userEvent.setup()
    const mockOnChange = vi.fn()

    render(
      <MarkdownEditorWithPreview
        value="# Test"
        onChange={mockOnChange}
      />
    )

    const editButton = screen.getByText('编辑')
    await user.click(editButton)

    expect(editButton).toHaveClass('ant-btn-primary')
    expect(screen.getByTestId('markdown-editor')).toBeInTheDocument()
    expect(screen.queryByTestId('markdown-preview')).not.toBeInTheDocument()
  })

  it('switches to preview mode when preview button is clicked', async () => {
    const user = userEvent.setup()
    const mockOnChange = vi.fn()

    render(
      <MarkdownEditorWithPreview
        value="# Test"
        onChange={mockOnChange}
      />
    )

    const previewButton = screen.getByText('预览')
    await user.click(previewButton)

    expect(previewButton).toHaveClass('ant-btn-primary')
    expect(screen.queryByTestId('markdown-editor')).not.toBeInTheDocument()
    expect(screen.getByTestId('markdown-preview')).toBeInTheDocument()
  })

  it('switches back to split mode when split button is clicked', async () => {
    const user = userEvent.setup()
    const mockOnChange = vi.fn()

    render(
      <MarkdownEditorWithPreview
        value="# Test"
        onChange={mockOnChange}
      />
    )

    // First switch to edit mode
    await user.click(screen.getByText('编辑'))
    
    // Then switch back to split mode
    const splitButton = screen.getByText('分屏')
    await user.click(splitButton)

    expect(splitButton).toHaveClass('ant-btn-primary')
    expect(screen.getByTestId('markdown-editor')).toBeInTheDocument()
    expect(screen.getByTestId('markdown-preview')).toBeInTheDocument()
  })

  it('calls onChange when editor content changes', async () => {
    const user = userEvent.setup()
    const mockOnChange = vi.fn()

    render(
      <MarkdownEditorWithPreview
        value="# Initial"
        onChange={mockOnChange}
      />
    )

    const editor = screen.getByTestId('markdown-editor')
    await user.clear(editor)
    await user.type(editor, '# New Content')

    expect(mockOnChange).toHaveBeenCalledWith('# New Content')
  })

  it('renders with custom height', () => {
    const mockOnChange = vi.fn()

    render(
      <MarkdownEditorWithPreview
        value="# Test"
        onChange={mockOnChange}
        height="800px"
      />
    )

    expect(screen.getByTestId('markdown-editor')).toBeInTheDocument()
    expect(screen.getByTestId('markdown-preview')).toBeInTheDocument()
  })

  it('renders with custom theme', () => {
    const mockOnChange = vi.fn()

    render(
      <MarkdownEditorWithPreview
        value="# Test"
        onChange={mockOnChange}
        theme="dark"
      />
    )

    expect(screen.getByTestId('markdown-editor')).toBeInTheDocument()
  })

  it('displays toolbar with all mode buttons', () => {
    const mockOnChange = vi.fn()

    render(
      <MarkdownEditorWithPreview
        value="# Test"
        onChange={mockOnChange}
      />
    )

    expect(screen.getByText('编辑')).toBeInTheDocument()
    expect(screen.getByText('预览')).toBeInTheDocument()
    expect(screen.getByText('分屏')).toBeInTheDocument()
  })

  it('updates preview content when value changes', () => {
    const mockOnChange = vi.fn()
    const initialValue = '# Initial Content'
    const newValue = '# Updated Content'

    const { rerender } = render(
      <MarkdownEditorWithPreview
        value={initialValue}
        onChange={mockOnChange}
      />
    )

    expect(screen.getByText(initialValue)).toBeInTheDocument()

    rerender(
      <MarkdownEditorWithPreview
        value={newValue}
        onChange={mockOnChange}
      />
    )

    expect(screen.getByText(newValue)).toBeInTheDocument()
  })
})