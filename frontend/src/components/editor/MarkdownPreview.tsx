import React, { useMemo, useEffect } from 'react'
import { marked } from 'marked'
import hljs from 'highlight.js'
import 'highlight.js/styles/github.css'
import './MarkdownPreview.css'

interface MarkdownPreviewProps {
  content: string
  className?: string
  style?: React.CSSProperties
}

const MarkdownPreview: React.FC<MarkdownPreviewProps> = ({
  content,
  className = '',
  style = {}
}) => {
  // Configure marked options
  useEffect(() => {
    marked.setOptions({
      highlight: (code, lang) => {
        if (lang && hljs.getLanguage(lang)) {
          try {
            return hljs.highlight(code, { language: lang }).value
          } catch (err) {
            console.warn('Highlight.js error:', err)
          }
        }
        return hljs.highlightAuto(code).value
      },
      langPrefix: 'hljs language-',
      breaks: true,
      gfm: true
    })
  }, [])

  const htmlContent = useMemo(() => {
    try {
      return marked(content || '')
    } catch (error) {
      console.error('Markdown parsing error:', error)
      return '<p>Markdown 解析错误</p>'
    }
  }, [content])

  return (
    <div
      className={`markdown-preview ${className}`}
      style={{
        padding: '16px',
        backgroundColor: '#fff',
        border: '1px solid #d9d9d9',
        borderRadius: '6px',
        minHeight: '400px',
        overflow: 'auto',
        ...style
      }}
      dangerouslySetInnerHTML={{ __html: htmlContent }}
    />
  )
}

export default MarkdownPreview