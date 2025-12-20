import React, { useState, useEffect } from 'react'
import { Typography, Row, Col, Card, Input, Select, Button, Space, message, Modal, Pagination } from 'antd'
import { PlusOutlined, SearchOutlined } from '@ant-design/icons'
import { useNavigate } from 'react-router-dom'
import ArticleCard from '../components/article/ArticleCard'
import { ArticleService } from '../services/articleService'
import { Article } from '../types/api'

const { Title } = Typography
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
    <div>
      <Title level={2}>文章管理</Title>
      
      {/* 搜索和筛选区域 */}
      <Card style={{ marginBottom: 16 }}>
        <Space wrap>
          <Input
            placeholder="搜索文章标题"
            value={searchTitle}
            onChange={(e) => setSearchTitle(e.target.value)}
            style={{ width: 200 }}
            allowClear
          />
          <Select
            placeholder="文章状态"
            value={filterStatus}
            onChange={setFilterStatus}
            style={{ width: 120 }}
            allowClear
          >
            <Option value="DRAFT">草稿</Option>
            <Option value="PUBLISHED">已发布</Option>
          </Select>
          <Button type="primary" icon={<SearchOutlined />} onClick={handleSearch}>
            搜索
          </Button>
          <Button onClick={handleReset}>
            重置
          </Button>
          <Button type="primary" icon={<PlusOutlined />} onClick={handleCreateArticle}>
            新建文章
          </Button>
        </Space>
      </Card>
      
      {/* 文章列表 */}
      <Row gutter={[16, 16]}>
        {loading ? (
          <Col span={24}>
            <Card loading={true} style={{ height: 200 }} />
          </Col>
        ) : articles.length > 0 ? (
          articles.map(article => (
            <Col xs={24} sm={12} md={8} lg={6} key={article.id}>
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
            <Card>
              <div style={{ textAlign: 'center', padding: '40px 0' }}>
                <p>暂无文章数据</p>
                <Button type="primary" onClick={handleCreateArticle}>
                  创建第一篇文章
                </Button>
              </div>
            </Card>
          </Col>
        )}
      </Row>
      
      {/* 分页 */}
      <div style={{ marginTop: 16, textAlign: 'right' }}>
        <Pagination
          current={currentPage}
          pageSize={pageSize}
          total={total}
          onChange={handlePageChange}
          showSizeChanger
          showQuickJumper
          showTotal={(total) => `共 ${total} 篇文章`}
        />
      </div>
    </div>
  )
}

export default ArticleListPage