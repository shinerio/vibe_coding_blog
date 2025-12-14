import React, { useState, useEffect } from 'react'
import { 
  Typography, 
  Card, 
  Form, 
  Input, 
  Select, 
  Button, 
  Space, 
  Row, 
  Col, 
  message,
  Spin,
  Tag
} from 'antd'
import { SaveOutlined, SendOutlined, EyeOutlined } from '@ant-design/icons'
import { useParams, useNavigate } from 'react-router-dom'
import { MarkdownEditorWithPreview } from '../components/editor'
import { ArticleService } from '../services/articleService'
import { Article, CreateArticleRequest, UpdateArticleRequest } from '../types/api'

const { Title } = Typography
const { TextArea } = Input
const { Option } = Select

interface ArticleFormData {
  title: string
  slug: string
  summary: string
  status: 'DRAFT' | 'PUBLISHED'
  tags: string[]
  content: string
}

const ArticleEditorPage: React.FC = () => {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const isEditing = Boolean(id)
  
  const [form] = Form.useForm()
  const [loading, setLoading] = useState(false)
  const [saving, setSaving] = useState(false)
  const [article, setArticle] = useState<Article | null>(null)
  const [content, setContent] = useState('')
  const [availableTags] = useState(['技术', '生活', '随笔', '教程', '思考', '项目'])

  // 加载文章数据
  useEffect(() => {
    if (isEditing && id) {
      loadArticle(parseInt(id))
    }
  }, [id, isEditing])

  const loadArticle = async (articleId: number) => {
    try {
      setLoading(true)
      const [articleData, contentData] = await Promise.all([
        ArticleService.getArticle(articleId),
        ArticleService.getArticleContent(articleId)
      ])
      
      setArticle(articleData)
      setContent(contentData)
      
      // 填充表单
      form.setFieldsValue({
        title: articleData.title,
        slug: articleData.slug,
        summary: articleData.summary || '',
        status: articleData.status,
        tags: articleData.tags
      })
    } catch (error) {
      message.error('加载文章失败')
      console.error('Load article error:', error)
    } finally {
      setLoading(false)
    }
  }

  // 生成slug
  const generateSlug = (title: string) => {
    return title
      .toLowerCase()
      .replace(/[^\w\s-]/g, '')
      .replace(/[\s_-]+/g, '-')
      .replace(/^-+|-+$/g, '')
  }

  // 处理标题变化
  const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const title = e.target.value
    form.setFieldValue('title', title)
    
    // 如果是新建文章且slug为空，自动生成slug
    if (!isEditing && !form.getFieldValue('slug')) {
      form.setFieldValue('slug', generateSlug(title))
    }
  }

  // 保存文章
  const handleSave = async (status: 'DRAFT' | 'PUBLISHED' = 'DRAFT') => {
    try {
      setSaving(true)
      const formData = await form.validateFields()
      
      const articleData: CreateArticleRequest | UpdateArticleRequest = {
        ...formData,
        content,
        status
      }

      let savedArticle: Article
      
      if (isEditing && id) {
        savedArticle = await ArticleService.updateArticle(parseInt(id), {
          ...articleData,
          id: parseInt(id)
        })
        // 保存内容
        await ArticleService.saveArticleContent(parseInt(id), content)
      } else {
        savedArticle = await ArticleService.createArticle(articleData)
        // 保存内容
        await ArticleService.saveArticleContent(savedArticle.id, content)
      }

      setArticle(savedArticle)
      
      if (status === 'PUBLISHED') {
        message.success('文章发布成功！')
      } else {
        message.success('文章保存成功！')
      }

      // 如果是新建文章，跳转到编辑页面
      if (!isEditing) {
        navigate(`/editor/${savedArticle.id}`, { replace: true })
      }
    } catch (error) {
      message.error('保存失败，请重试')
      console.error('Save article error:', error)
    } finally {
      setSaving(false)
    }
  }

  // 预览文章
  const handlePreview = () => {
    if (article?.id) {
      window.open(`/article/${article.id}`, '_blank')
    } else {
      message.warning('请先保存文章后再预览')
    }
  }

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: '50px' }}>
        <Spin size="large" />
      </div>
    )
  }

  return (
    <div style={{ padding: '24px' }}>
      <div style={{ marginBottom: '24px' }}>
        <Title level={2}>{isEditing ? '编辑文章' : '写文章'}</Title>
        
        <Space style={{ marginBottom: '16px' }}>
          <Button
            type="primary"
            icon={<SaveOutlined />}
            loading={saving}
            onClick={() => handleSave('DRAFT')}
          >
            保存草稿
          </Button>
          <Button
            type="primary"
            icon={<SendOutlined />}
            loading={saving}
            onClick={() => handleSave('PUBLISHED')}
            style={{ backgroundColor: '#52c41a', borderColor: '#52c41a' }}
          >
            发布文章
          </Button>
          {article?.id && (
            <Button
              icon={<EyeOutlined />}
              onClick={handlePreview}
            >
              预览
            </Button>
          )}
        </Space>
      </div>

      <Row gutter={24}>
        <Col span={8}>
          <Card title="文章信息" style={{ marginBottom: '24px' }}>
            <Form
              form={form}
              layout="vertical"
              initialValues={{
                status: 'DRAFT',
                tags: []
              }}
            >
              <Form.Item
                name="title"
                label="标题"
                rules={[{ required: true, message: '请输入文章标题' }]}
              >
                <Input
                  placeholder="请输入文章标题"
                  onChange={handleTitleChange}
                />
              </Form.Item>

              <Form.Item
                name="slug"
                label="URL别名"
                rules={[
                  { required: true, message: '请输入URL别名' },
                  { pattern: /^[a-z0-9-]+$/, message: 'URL别名只能包含小写字母、数字和连字符' }
                ]}
              >
                <Input placeholder="url-friendly-name" />
              </Form.Item>

              <Form.Item
                name="summary"
                label="摘要"
              >
                <TextArea
                  rows={3}
                  placeholder="请输入文章摘要（可选）"
                  maxLength={200}
                  showCount
                />
              </Form.Item>

              <Form.Item
                name="status"
                label="状态"
              >
                <Select>
                  <Option value="DRAFT">草稿</Option>
                  <Option value="PUBLISHED">已发布</Option>
                </Select>
              </Form.Item>

              <Form.Item
                name="tags"
                label="标签"
              >
                <Select
                  mode="tags"
                  placeholder="选择或输入标签"
                  style={{ width: '100%' }}
                >
                  {availableTags.map(tag => (
                    <Option key={tag} value={tag}>
                      <Tag color="blue">{tag}</Tag>
                    </Option>
                  ))}
                </Select>
              </Form.Item>
            </Form>
          </Card>
        </Col>

        <Col span={16}>
          <Card title="文章内容" bodyStyle={{ padding: 0 }}>
            <MarkdownEditorWithPreview
              value={content}
              onChange={setContent}
              height={600}
            />
          </Card>
        </Col>
      </Row>
    </div>
  )
}

export default ArticleEditorPage