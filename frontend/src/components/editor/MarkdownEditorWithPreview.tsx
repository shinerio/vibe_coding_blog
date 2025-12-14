import React, { useState } from 'react'
import { Card, Button, Space, Row, Col } from 'antd'
import { EyeOutlined, EditOutlined, ColumnWidthOutlined } from '@ant-design/icons'
import MarkdownEditor from './MarkdownEditor'
import MarkdownPreview from './MarkdownPreview'

interface MarkdownEditorWithPreviewProps {
  value: string
  onChange: (value: string) => void
  height?: string | number
  theme?: 'light' | 'dark'
}

type ViewMode = 'edit' | 'preview' | 'split'

const MarkdownEditorWithPreview: React.FC<MarkdownEditorWithPreviewProps> = ({
  value,
  onChange,
  height = '500px',
  theme = 'light'
}) => {
  const [viewMode, setViewMode] = useState<ViewMode>('split')

  const renderToolbar = () => (
    <div style={{ 
      padding: '8px 16px', 
      borderBottom: '1px solid #f0f0f0',
      backgroundColor: '#fafafa'
    }}>
      <Space>
        <Button
          type={viewMode === 'edit' ? 'primary' : 'default'}
          icon={<EditOutlined />}
          size="small"
          onClick={() => setViewMode('edit')}
        >
          编辑
        </Button>
        <Button
          type={viewMode === 'preview' ? 'primary' : 'default'}
          icon={<EyeOutlined />}
          size="small"
          onClick={() => setViewMode('preview')}
        >
          预览
        </Button>
        <Button
          type={viewMode === 'split' ? 'primary' : 'default'}
          icon={<ColumnWidthOutlined />}
          size="small"
          onClick={() => setViewMode('split')}
        >
          分屏
        </Button>
      </Space>
    </div>
  )

  const renderContent = () => {
    const containerStyle = {
      height: typeof height === 'number' ? `${height}px` : height,
      overflow: 'hidden'
    }

    switch (viewMode) {
      case 'edit':
        return (
          <div style={containerStyle}>
            <MarkdownEditor
              value={value}
              onChange={onChange}
              height="100%"
              theme={theme}
            />
          </div>
        )
      
      case 'preview':
        return (
          <div style={containerStyle}>
            <MarkdownPreview
              content={value}
              style={{ 
                height: '100%',
                border: 'none',
                borderRadius: 0
              }}
            />
          </div>
        )
      
      case 'split':
        return (
          <Row style={containerStyle}>
            <Col span={12} style={{ height: '100%', borderRight: '1px solid #f0f0f0' }}>
              <MarkdownEditor
                value={value}
                onChange={onChange}
                height="100%"
                theme={theme}
              />
            </Col>
            <Col span={12} style={{ height: '100%' }}>
              <MarkdownPreview
                content={value}
                style={{ 
                  height: '100%',
                  border: 'none',
                  borderRadius: 0
                }}
              />
            </Col>
          </Row>
        )
      
      default:
        return null
    }
  }

  return (
    <Card 
      bodyStyle={{ padding: 0 }}
      style={{ 
        border: '1px solid #d9d9d9',
        borderRadius: '6px',
        overflow: 'hidden'
      }}
    >
      {renderToolbar()}
      {renderContent()}
    </Card>
  )
}

export default MarkdownEditorWithPreview