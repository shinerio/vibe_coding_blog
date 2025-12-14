import '@testing-library/jest-dom'
import { vi } from 'vitest'
import React from 'react'

// Mock Monaco Editor
vi.mock('@monaco-editor/react', () => ({
  default: vi.fn(({ value, onChange }) => {
    return React.createElement('textarea', {
      'data-testid': 'monaco-editor',
      value: value,
      onChange: (e: any) => onChange?.(e.target.value)
    })
  })
}))

// Mock highlight.js
vi.mock('highlight.js', () => ({
  default: {
    highlight: vi.fn(() => ({ value: 'highlighted code' })),
    highlightAuto: vi.fn(() => ({ value: 'highlighted code' })),
    getLanguage: vi.fn(() => true)
  }
}))

// Mock CSS imports
vi.mock('highlight.js/styles/github.css', () => ({}))
vi.mock('../components/editor/MarkdownPreview.css', () => ({}))