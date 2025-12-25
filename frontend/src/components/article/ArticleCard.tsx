import React from 'react'
import { Card, Tag, Space, Typography, Button, Tooltip } from 'antd'
import { EditOutlined, EyeOutlined, DeleteOutlined, CalendarOutlined, ClockCircleOutlined } from '@ant-design/icons'
import { Article } from '../../types/api'

const { Title, Paragraph } = Typography

interface ArticleCardProps {
  article: Article
  onEdit: (id: number) => void
  onPreview: (id: number) => void
  onDelete: (id: number) => void
}

const ArticleCard: React.FC<ArticleCardProps> = ({ article, onEdit, onPreview, onDelete }) => {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'PUBLISHED':
        return 'green'
      case 'DRAFT':
        return 'orange'
      default:
        return 'default'
    }
  }

  const formatDate = (dateString: string | any) => {
    // 处理 publishedAt 返回 {"present":true} 的情况
    if (typeof dateString === 'object' && dateString.present) {
      return '已发布'
    }

    // 处理空值或无效值
    if (!dateString || dateString === '') {
      return '未设置'
    }

    // 处理字符串日期
    if (typeof dateString === 'string') {
      const date = new Date(dateString)
      if (isNaN(date.getTime())) {
        return 'Invalid Date'
      }
      // 返回完整的日期时间格式
      return date.toLocaleString('zh-CN', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit'
      })
    }

    // 其他情况返回 Invalid Date
    return 'Invalid Date'
  }

  return (
    <Card
      hoverable
      style={{
        borderRadius: '12px',
        border: '1px solid #f0f0f0',
        boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
        transition: 'all 0.3s ease',
        height: '100%',
        display: 'flex',
        flexDirection: 'column'
      }}
      bodyStyle={{
        padding: '24px',
        display: 'flex',
        flexDirection: 'column',
        height: '100%'
      }}
    >
      {/* Header with title and status */}
      <div style={{ marginBottom: '16px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px' }}>
          <Title
            level={4}
            style={{
              margin: 0,
              fontSize: '18px',
              fontWeight: 600,
              color: '#1a1a1a',
              lineHeight: 1.4,
              flex: 1,
              marginRight: '12px'
            }}
            ellipsis={{ rows: 2, tooltip: article.title }}
          >
            {article.title}
          </Title>
          <Tag
            color={getStatusColor(article.status)}
            style={{
              borderRadius: '12px',
              padding: '2px 8px',
              fontSize: '12px',
              lineHeight: '20px',
              whiteSpace: 'nowrap'
            }}
          >
            {article.status === 'PUBLISHED' ? '已发布' : '草稿'}
          </Tag>
        </div>
      </div>

      {/* Summary */}
      {article.summary && (
        <Paragraph
          ellipsis={{ rows: 3, tooltip: article.summary }}
          style={{
            margin: '0 0 16px 0',
            color: '#666',
            fontSize: '14px',
            lineHeight: 1.6,
            flex: 1,
            minHeight: '60px'
          }}
        >
          {article.summary}
        </Paragraph>
      )}

      {/* Tags */}
      {article.tags && article.tags.length > 0 && (
        <div style={{ marginBottom: '16px' }}>
          <Space wrap size={[4, 4]}>
            {article.tags.slice(0, 3).map(tag => (
              <Tag
                key={tag}
                style={{
                  borderRadius: '4px',
                  border: '1px solid #e8e8e8',
                  background: '#fafafa',
                  color: '#666',
                  fontSize: '12px',
                  padding: '2px 8px',
                  lineHeight: '20px'
                }}
              >
                {tag}
              </Tag>
            ))}
            {article.tags.length > 3 && (
              <Tag
                style={{
                  borderRadius: '4px',
                  border: '1px solid #e8e8e8',
                  background: '#fafafa',
                  color: '#999',
                  fontSize: '12px',
                  padding: '2px 8px',
                  lineHeight: '20px'
                }}
              >
                +{article.tags.length - 3}
              </Tag>
            )}
          </Space>
        </div>
      )}

      {/* Date information */}
      <div style={{
        marginTop: 'auto',
        paddingTop: '16px',
        borderTop: '1px solid #f5f5f5',
        fontSize: '12px',
        color: '#999',
        lineHeight: '1.5'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', marginBottom: '4px' }}>
          <CalendarOutlined style={{ marginRight: '6px', fontSize: '11px' }} />
          创建: {formatDate(article.createdAt)}
        </div>
        {article.updatedAt !== article.createdAt && (
          <div style={{ display: 'flex', alignItems: 'center', marginBottom: '4px' }}>
            <ClockCircleOutlined style={{ marginRight: '6px', fontSize: '11px' }} />
            更新: {formatDate(article.updatedAt)}
          </div>
        )}
        {article.publishedAt && typeof article.publishedAt === 'string' && (
          <div style={{ display: 'flex', alignItems: 'center' }}>
            <CalendarOutlined style={{ marginRight: '6px', fontSize: '11px' }} />
            发布: {formatDate(article.publishedAt)}
          </div>
        )}
      </div>

      {/* Action buttons */}
      <div style={{
        marginTop: '16px',
        paddingTop: '16px',
        borderTop: '1px solid #f5f5f5',
        display: 'flex',
        gap: '8px',
        flexWrap: 'wrap'
      }}>
        <Tooltip title="预览文章">
          <Button
            type="text"
            icon={<EyeOutlined />}
            onClick={() => onPreview(article.id)}
            style={{
              flex: 1,
              borderRadius: '6px',
              height: '32px',
              border: '1px solid #e8e8e8',
              color: '#666'
            }}
          >
            预览
          </Button>
        </Tooltip>
        <Tooltip title="编辑文章">
          <Button
            type="text"
            icon={<EditOutlined />}
            onClick={() => onEdit(article.id)}
            style={{
              flex: 1,
              borderRadius: '6px',
              height: '32px',
              border: '1px solid #e8e8e8',
              color: '#666'
            }}
          >
            编辑
          </Button>
        </Tooltip>
        <Tooltip title="删除文章">
          <Button
            type="text"
            danger
            icon={<DeleteOutlined />}
            onClick={() => onDelete(article.id)}
            style={{
              flex: 1,
              borderRadius: '6px',
              height: '32px',
              border: '1px solid #ffccc7',
              color: '#ff4d4f'
            }}
          >
            删除
          </Button>
        </Tooltip>
      </div>
    </Card>
  )
}

export default ArticleCard