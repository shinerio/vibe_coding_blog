import React, { useRef, useState } from 'react'
import Editor from '@monaco-editor/react'
import * as monaco from 'monaco-editor'
import { Button, Modal, Space } from 'antd'
import { PictureOutlined } from '@ant-design/icons'
import ImageUpload from '../image/ImageUpload'
import { Image as ApiImage } from '../../types/api'

interface MarkdownEditorProps {
  value: string
  onChange: (value: string) => void
  height?: string | number
  theme?: 'light' | 'dark'
  readOnly?: boolean
}

const MarkdownEditor: React.FC<MarkdownEditorProps> = ({
  value,
  onChange,
  height = '400px',
  theme = 'light',
  readOnly = false
}) => {
  const editorRef = useRef<monaco.editor.IStandaloneCodeEditor | null>(null)
  const [isImageModalVisible, setIsImageModalVisible] = useState(false)

  // 处理图片上传完成
  const handleImageUploaded = (image: ApiImage) => {
    if (editorRef.current) {
      // 插入Markdown图片语法
      const imageMarkdown = `\n![${image.originalName}](/api/v1/images/${image.id})\n`

      // 获取当前光标位置
      const position = editorRef.current.getPosition()
      if (position) {
        // 插入图片Markdown到光标位置
        editorRef.current.executeEdits('insert-image', [{
          range: {
            startLineNumber: position.lineNumber,
            startColumn: position.column,
            endLineNumber: position.lineNumber,
            endColumn: position.column
          },
          text: imageMarkdown
        }])

        // 移动光标到插入内容之后
        const newPosition = {
          lineNumber: position.lineNumber + 2,
          column: 1
        }
        editorRef.current.setPosition(newPosition)
        editorRef.current.focus()
      }
    }

    // 关闭模态框
    setIsImageModalVisible(false)
  }

  const handleEditorDidMount = (editor: monaco.editor.IStandaloneCodeEditor) => {
    editorRef.current = editor

    // Configure editor options
    editor.updateOptions({
      wordWrap: 'on',
      minimap: { enabled: false },
      scrollBeyondLastLine: false,
      fontSize: 14,
      lineHeight: 22,
      padding: { top: 16, bottom: 16 },
      folding: true,
      lineNumbers: 'on',
      renderLineHighlight: 'line',
      selectOnLineNumbers: true,
      automaticLayout: true
    })

    // Add Markdown-specific configurations
    monaco.languages.setLanguageConfiguration('markdown', {
      wordPattern: /(-?\d*\.\d\w*)|([^\`\~\!\@\#\%\^\&\*\(\)\-\=\+\[\{\]\}\\\|\;\:\'\"\,\.\<\>\/\?\s]+)/g,
      brackets: [
        ['[', ']'],
        ['(', ')'],
        ['{', '}']
      ],
      autoClosingPairs: [
        { open: '[', close: ']' },
        { open: '(', close: ')' },
        { open: '{', close: '}' },
        { open: '`', close: '`' },
        { open: '*', close: '*' },
        { open: '_', close: '_' },
        { open: '**', close: '**' },
        { open: '__', close: '__' }
      ],
      surroundingPairs: [
        { open: '[', close: ']' },
        { open: '(', close: ')' },
        { open: '{', close: '}' },
        { open: '`', close: '`' },
        { open: '*', close: '*' },
        { open: '_', close: '_' },
        { open: '"', close: '"' },
        { open: "'", close: "'" }
      ]
    })

    // Add Markdown snippets and auto-completion
    monaco.languages.registerCompletionItemProvider('markdown', {
      provideCompletionItems: (model, position) => {
        const suggestions = [
          {
            label: 'header1',
            kind: monaco.languages.CompletionItemKind.Snippet,
            insertText: '# ${1:Header}',
            insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
            documentation: 'Insert H1 header'
          },
          {
            label: 'header2',
            kind: monaco.languages.CompletionItemKind.Snippet,
            insertText: '## ${1:Header}',
            insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
            documentation: 'Insert H2 header'
          },
          {
            label: 'header3',
            kind: monaco.languages.CompletionItemKind.Snippet,
            insertText: '### ${1:Header}',
            insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
            documentation: 'Insert H3 header'
          },
          {
            label: 'bold',
            kind: monaco.languages.CompletionItemKind.Snippet,
            insertText: '**${1:text}**',
            insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
            documentation: 'Bold text'
          },
          {
            label: 'italic',
            kind: monaco.languages.CompletionItemKind.Snippet,
            insertText: '*${1:text}*',
            insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
            documentation: 'Italic text'
          },
          {
            label: 'code',
            kind: monaco.languages.CompletionItemKind.Snippet,
            insertText: '`${1:code}`',
            insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
            documentation: 'Inline code'
          },
          {
            label: 'codeblock',
            kind: monaco.languages.CompletionItemKind.Snippet,
            insertText: '```${1:language}\n${2:code}\n```',
            insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
            documentation: 'Code block'
          },
          {
            label: 'link',
            kind: monaco.languages.CompletionItemKind.Snippet,
            insertText: '[${1:text}](${2:url})',
            insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
            documentation: 'Link'
          },
          {
            label: 'image',
            kind: monaco.languages.CompletionItemKind.Snippet,
            insertText: '![${1:alt}](${2:url})',
            insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
            documentation: 'Image'
          },
          {
            label: 'table',
            kind: monaco.languages.CompletionItemKind.Snippet,
            insertText: '| ${1:Header 1} | ${2:Header 2} |\n|-------------|-------------|\n| ${3:Cell 1}  | ${4:Cell 2}  |',
            insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
            documentation: 'Table'
          }
        ]
        
        return { suggestions }
      }
    })
  }

  const handleEditorChange = (value: string | undefined) => {
    if (value !== undefined) {
      onChange(value)
    }
  }

  return (
    <>
      {/* 图片上传按钮 */}
      {!readOnly && (
        <div style={{
          padding: '8px 12px',
          borderBottom: '1px solid #f0f0f0',
          backgroundColor: '#fafafa'
        }}>
          <Space>
            <Button
              icon={<PictureOutlined />}
              onClick={() => setIsImageModalVisible(true)}
              size="small"
            >
              插入图片
            </Button>
          </Space>
        </div>
      )}

      <Editor
        height={height}
        defaultLanguage="markdown"
        value={value}
        theme={theme === 'dark' ? 'vs-dark' : 'vs'}
        onChange={handleEditorChange}
        onMount={handleEditorDidMount}
        options={{
          readOnly,
          wordWrap: 'on',
          minimap: { enabled: false },
          scrollBeyondLastLine: false,
          fontSize: 14,
          lineHeight: 22,
          padding: { top: 16, bottom: 16 }
        }}
      />

      {/* 图片上传模态框 */}
      <Modal
        title="上传图片"
        open={isImageModalVisible}
        onCancel={() => setIsImageModalVisible(false)}
        footer={null}
        width={600}
      >
        <ImageUpload
          onImageUploaded={handleImageUploaded}
          maxSize={10}
          acceptedFormats={['image/jpeg', 'image/png', 'image/gif', 'image/webp']}
          showPreview={true}
          multiple={false}
        />
      </Modal>
    </>
  )
}

export default MarkdownEditor