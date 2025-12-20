import React, { useState, useEffect } from 'react'
import { Typography, Card, Button, Space, Tag, Spin, message } from 'antd'
import { useParams, useNavigate } from 'react-router-dom'
import { EditOutlined, ArrowLeftOutlined, EyeOutlined } from '@ant-design/icons'
import { ArticleService } from '../services/articleService'
import { Article } from '../types/api'
import MarkdownPreview from '../components/editor/MarkdownPreview'

const { Title, Paragraph, Text } = Typography

const ArticleDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const [article, setArticle] = useState<Article | null>(null)
  const [content, setContent] = useState<string>('')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchArticleData = async () => {
      if (!id) return

      setLoading(true)
      try {
        // 并行获取文章信息和内容
        const [articleData, articleContent] = await Promise.all([
          ArticleService.getArticle(Number(id)),
          ArticleService.getArticleContent(Number(id))
        ])

        setArticle(articleData)
        setContent(articleContent)
      } catch (error) {
        console.error('获取文章详情失败:', error)
        message.error('获取文章详情失败')
      } finally {
        setLoading(false)
      }
    }

    fetchArticleData()
  }, [id])

  const handleEdit = () => {
    navigate(`/editor/${id}`)
  }

  const handleBack = () => {
    navigate('/articles')
  }

  const handlePreview = () => {
    // 在新标签页中打开预览
    window.open(`/articles/${id}/preview`, '_blank')
  }

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

  const getStatusText = (status: string) => {
    switch (status) {
      case 'PUBLISHED':
        return '已发布'
      case 'DRAFT':
        return '草稿'
      default:
        return '未知'
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('zh-CN')
  }

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: '50px' }}>
        <Spin size="large" />
        <div style={{ marginTop: 16 }}>加载文章详情中...</div>
      </div>
    )
  }

  if (!article) {
    return (
      <div>
        <Space style={{ marginBottom: 16 }}>
          <Button icon={<ArrowLeftOutlined />} onClick={handleBack}>
            返回列表
          </Button>
        </Space>
        <Card>
          <Title level={3}>文章不存在</Title>
          <Paragraph>抱歉，您访问的文章不存在或已被删除。</Paragraph>
        </Card>
      </div>
    )
  }

  return (
    <div>
      {/* 操作按钮区域 */}
      <Space style={{ marginBottom: 16 }}>
        <Button icon={<ArrowLeftOutlined />} onClick={handleBack}>
          返回列表
        </Button>
        <Button type="primary" icon={<EditOutlined />} onClick={handleEdit}>
          编辑文章
        </Button>
        <Button icon={<EyeOutlined />} onClick={handlePreview}>
          新窗口预览
        </Button>
      </Space>

      {/* 文章标题和状态 */}
      <div style={{ marginBottom: 24 }}>
        <Space align="start">
          <Title level={2} style={{ margin: 0 }}>
            {article.title}
          </Title>
          <Tag color={getStatusColor(article.status)} style={{ marginTop: 8 }}>
            {getStatusText(article.status)}
          </Tag>
        </Space>
      </div>

      {/* 文章元信息 */}
      <Card style={{ marginBottom: 16 }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px' }}>
          <div>
            <Text type="secondary">创建时间：</Text>
            <Text>{formatDate(article.createdAt)}</Text>
          </div>
          <div>
            <Text type="secondary">更新时间：</Text>
            <Text>{formatDate(article.updatedAt)}</Text>
          </div>
          {article.publishedAt && (
            <div>
              <Text type="secondary">发布时间：</Text>
              <Text>{formatDate(article.publishedAt)}</Text>
            </div>
          )}
        </div>

        {article.summary && (
          <div style={{ marginTop: 16 }}>
            <Text type="secondary">文章摘要：</Text>
            <Paragraph style={{ marginTop: 8, marginBottom: 0 }}>
              {article.summary}
            </Paragraph>
          </div>
        )}

        {article.tags && article.tags.length > 0 && (
          <div style={{ marginTop: 16 }}>
            <Text type="secondary">标签：</Text>
            <div style={{ marginTop: 8 }}>
              <Space wrap>
                {article.tags.map(tag => (
                  <Tag key={tag}>{tag}</Tag>
                ))}
              </Space>
            </div>
          </div>
        )}
      </Card>

      {/* 文章内容 */}
      <Card title="文章内容">
        <MarkdownPreview
          content={content}
          style={{
            minHeight: '300px',
            maxHeight: '600px',
            overflow: 'auto'
          }}
        />
      </Card>
    </div>
  )
}

export default ArticleDetailPage