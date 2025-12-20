import React from 'react'
import { Card, Tag, Space, Typography, Button } from 'antd'
import { EditOutlined, EyeOutlined, DeleteOutlined } from '@ant-design/icons'
import { Article } from '../../types/api'

const { Title, Text } = Typography

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

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('zh-CN')
  }

  return (
    <Card
      hoverable
      title={
        <Title level={4} style={{ margin: 0 }}>
          {article.title}
        </Title>
      }
      extra={
        <Tag color={getStatusColor(article.status)}>
          {article.status === 'PUBLISHED' ? '已发布' : '草稿'}
        </Tag>
      }
      actions={[
        <Button 
          type="text" 
          icon={<EyeOutlined />} 
          onClick={() => onPreview(article.id)}
          key="preview"
        >
          预览
        </Button>,
        <Button 
          type="text" 
          icon={<EditOutlined />} 
          onClick={() => onEdit(article.id)}
          key="edit"
        >
          编辑
        </Button>,
        <Button 
          type="text" 
          danger 
          icon={<DeleteOutlined />} 
          onClick={() => onDelete(article.id)}
          key="delete"
        >
          删除
        </Button>,
      ]}
    >
      {article.summary && (
        <Text type="secondary" style={{ display: 'block', marginBottom: 12 }}>
          {article.summary}
        </Text>
      )}
      
      <Space wrap>
        {article.tags.map(tag => (
          <Tag key={tag}>{tag}</Tag>
        ))}
      </Space>
      
      <div style={{ marginTop: 16, fontSize: '12px', color: '#999' }}>
        <div>创建时间: {formatDate(article.createdAt)}</div>
        <div>更新时间: {formatDate(article.updatedAt)}</div>
        {article.publishedAt && (
          <div>发布时间: {formatDate(article.publishedAt)}</div>
        )}
      </div>
    </Card>
  )
}

export default ArticleCard