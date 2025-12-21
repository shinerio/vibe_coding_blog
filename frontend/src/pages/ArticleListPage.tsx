import React, { useState, useEffect } from 'react'
import { Typography, Row, Col, Card, Input, Select, Button, Space, message, Modal, Pagination } from 'antd'
import { PlusOutlined, SearchOutlined, FileTextOutlined } from '@ant-design/icons'
import { useNavigate } from 'react-router-dom'
import ArticleCard from '../components/article/ArticleCard'
import { ArticleService } from '../services/articleService'
import { Article } from '../types/api'

const { Title, Paragraph } = Typography
const { Option } = Select

const ArticleListPage: React.FC = () => {
  const navigate = useNavigate()
  const [articles, setArticles] = useState<Article[]>([])
  const [loading, setLoading] = useState(false)
  
  // 搜索和筛选状态
  const [searchTitle, setSearchTitle] = useState('')
  const [filterStatus, setFilterStatus] = useState<string | undefined>(undefined)
  
  // 分页状态
  const [currentPage, setCurrentPage] = useState(1)
  const [pageSize, setPageSize] = useState(10)
  const [total, setTotal] = useState(0)

  const fetchArticles = async () => {
    setLoading(true)
    try {
      const params: any = {
        page: currentPage - 1,
        size: pageSize
      }
      
      if (searchTitle) {
        params.title = searchTitle
      }
      
      if (filterStatus) {
        params.status = filterStatus
      }
      
      const response = await ArticleService.getArticles(params)
      setArticles(response.content)
      setTotal(response.totalElements)
    } catch (error) {
      console.error('获取文章列表失败:', error)
      message.error('获取文章列表失败')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchArticles()
  }, [currentPage, pageSize, searchTitle, filterStatus])

  const handleCreateArticle = () => {
    navigate('/editor')
  }

  const handleEdit = (id: number) => {
    navigate(`/editor/${id}`)
  }

  const handlePreview = (id: number) => {
    navigate(`/articles/${id}`)
  }

  const handleDelete = (id: number) => {
    Modal.confirm({
      title: '确认删除',
      content: '确定要删除这篇文章吗？此操作不可恢复。',
      okText: '确认',
      cancelText: '取消',
      onOk: async () => {
        try {
          await ArticleService.deleteArticle(id)
          message.success('文章删除成功')
          fetchArticles() // 重新加载文章列表
        } catch (error) {
          console.error('删除文章失败:', error)
          message.error('删除文章失败')
        }
      }
    })
  }

  const handleSearch = () => {
    setCurrentPage(1) // 重置到第一页
    fetchArticles()
  }

  const handleReset = () => {
    setSearchTitle('')
    setFilterStatus(undefined)
    setCurrentPage(1)
  }

  const handlePageChange = (page: number, size?: number) => {
    setCurrentPage(page)
    if (size) {
      setPageSize(size)
    }
  }

  return (
    <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '0 24px' }}>
      {/* Header */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '32px',
        flexDirection: window.innerWidth < 768 ? 'column' : 'row',
        gap: window.innerWidth < 768 ? '16px' : '0'
      }}>
        <Title
          level={1}
          style={{
            margin: 0,
            fontSize: '2rem',
            fontWeight: 600,
            color: '#1a1a1a'
          }}
        >
          文章管理
        </Title>
        <Button
          type="primary"
          icon={<PlusOutlined />}
          onClick={handleCreateArticle}
          size="large"
          style={{
            borderRadius: '8px',
            height: '40px',
            padding: '0 24px',
            fontSize: '14px',
            fontWeight: 500
          }}
        >
          新建文章
        </Button>
      </div>

      {/* 搜索和筛选区域 */}
      <Card
        style={{
          marginBottom: '24px',
          borderRadius: '12px',
          border: '1px solid #f0f0f0',
          boxShadow: '0 2px 8px rgba(0,0,0,0.06)'
        }}
        bodyStyle={{ padding: '20px 24px' }}
      >
        <div style={{
          display: 'flex',
          gap: '12px',
          flexWrap: 'wrap',
          alignItems: 'center'
        }}>
          <Input
            placeholder="搜索文章标题"
            value={searchTitle}
            onChange={(e) => setSearchTitle(e.target.value)}
            style={{
              width: window.innerWidth < 576 ? '100%' : '240px',
              borderRadius: '8px',
              height: '40px'
            }}
            allowClear
          />
          <Select
            placeholder="文章状态"
            value={filterStatus}
            onChange={setFilterStatus}
            style={{
              width: window.innerWidth < 576 ? '100%' : '140px',
              borderRadius: '8px'
            }}
            allowClear
          >
            <Option value="DRAFT">草稿</Option>
            <Option value="PUBLISHED">已发布</Option>
          </Select>
          <Button
            type="primary"
            icon={<SearchOutlined />}
            onClick={handleSearch}
            style={{
              borderRadius: '8px',
              height: '40px',
              padding: '0 20px'
            }}
          >
            搜索
          </Button>
          <Button
            onClick={handleReset}
            style={{
              borderRadius: '8px',
              height: '40px',
              padding: '0 20px'
            }}
          >
            重置
          </Button>
        </div>
      </Card>

      {/* 文章列表 */}
      <Row gutter={[24, 24]}>
        {loading ? (
          <Col span={24}>
            {[1, 2, 3].map((i) => (
              <Col xs={24} sm={12} md={8} lg={6} key={i} style={{ marginBottom: '24px' }}>
                <Card loading style={{ height: '280px', borderRadius: '12px' }} />
              </Col>
            ))}
          </Col>
        ) : articles.length > 0 ? (
          articles.map(article => (
            <Col xs={24} sm={12} md={8} key={article.id}>
              <ArticleCard
                article={article}
                onEdit={handleEdit}
                onPreview={handlePreview}
                onDelete={handleDelete}
              />
            </Col>
          ))
        ) : (
          <Col span={24}>
            <Card
              style={{
                textAlign: 'center',
                borderRadius: '12px',
                border: '1px solid #f0f0f0',
                boxShadow: '0 2px 8px rgba(0,0,0,0.06)'
              }}
              bodyStyle={{ padding: '60px 24px' }}
            >
              <div style={{ textAlign: 'center' }}>
                <div style={{
                  fontSize: '64px',
                  color: '#d9d9d9',
                  marginBottom: '24px',
                  lineHeight: 1
                }}>
                  <FileTextOutlined />
                </div>
                <Title level={3} style={{ color: '#666', marginBottom: '16px', fontWeight: 400 }}>
                  暂无文章数据
                </Title>
                <Paragraph style={{ color: '#999', marginBottom: '24px', fontSize: '16px' }}>
                  {searchTitle || filterStatus
                    ? '没有找到匹配的文章，试试调整搜索条件'
                    : '开始创建你的第一篇博客文章吧'
                  }
                </Paragraph>
                <Button
                  type="primary"
                  icon={<PlusOutlined />}
                  onClick={handleCreateArticle}
                  size="large"
                  style={{
                    borderRadius: '8px',
                    height: '48px',
                    padding: '0 32px',
                    fontSize: '16px'
                  }}
                >
                  创建第一篇文章
                </Button>
              </div>
            </Card>
          </Col>
        )}
      </Row>

      {/* 分页 */}
      {total > 0 && (
        <div style={{
          marginTop: '40px',
          textAlign: 'center',
          padding: '20px 0',
          borderTop: '1px solid #f0f0f0'
        }}>
          <Pagination
            current={currentPage}
            pageSize={pageSize}
            total={total}
            onChange={handlePageChange}
            showSizeChanger
            showQuickJumper
            showTotal={(total, range) =>
              `第 ${range[0]}-${range[1]} 篇，共 ${total} 篇文章`
            }
            pageSizeOptions={['6', '12', '24', '48']}
            style={{
              display: 'inline-flex',
              alignItems: 'center'
            }}
          />
        </div>
      )}
    </div>
  )
}

export default ArticleListPage