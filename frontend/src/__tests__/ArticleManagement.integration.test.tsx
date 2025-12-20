import React from 'react'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { BrowserRouter, MemoryRouter, Routes, Route } from 'react-router-dom'
import { ConfigProvider, message } from 'antd'
import zhCN from 'antd/locale/zh_CN'
import ArticleListPage from '../pages/ArticleListPage'
import ArticleDetailPage from '../pages/ArticleDetailPage'
import { ArticleService } from '../services/articleService'

// Mock services
jest.mock('../services/articleService')
jest.mock('antd', () => {
  const actualAntd = jest.requireActual('antd')
  return {
    ...actualAntd,
    message: {
      ...actualAntd.message,
      error: jest.fn(),
      success: jest.fn()
    }
  }
})

const mockArticles = [
  {
    id: 1,
    title: '前端开发最佳实践',
    summary: '介绍现代前端开发的最佳实践和方法',
    status: 'PUBLISHED',
    tags: ['前端', '最佳实践', 'React'],
    createdAt: '2024-01-01T10:00:00Z',
    updatedAt: '2024-01-01T10:00:00Z',
    publishedAt: '2024-01-01T12:00:00Z'
  },
  {
    id: 2,
    title: '后端架构设计',
    summary: '探讨微服务架构的设计原则和实践',
    status: 'DRAFT',
    tags: ['后端', '架构', '微服务'],
    createdAt: '2024-01-02T10:00:00Z',
    updatedAt: '2024-01-02T10:00:00Z'
  },
  {
    id: 3,
    title: 'Docker容器化部署',
    summary: '详细介绍Docker在项目部署中的应用',
    status: 'PUBLISHED',
    tags: ['Docker', '部署', '运维'],
    createdAt: '2024-01-03T10:00:00Z',
    updatedAt: '2024-01-03T10:00:00Z',
    publishedAt: '2024-01-03T12:00:00Z'
  }
]

const mockArticleContent = `
# 前端开发最佳实践

## 代码规范

- 使用ESLint和Prettier保持代码风格一致
- 遵循组件化开发原则
- 合理使用TypeScript增强类型安全

## 性能优化

- 使用React.memo优化组件渲染
- 实现虚拟滚动处理大量数据
- 合理使用懒加载和代码分割
`

const renderWithRouter = (component: React.ReactElement, initialEntries = ['/']) => {
  return render(
    <ConfigProvider locale={zhCN}>
      <MemoryRouter initialEntries={initialEntries}>
        {component}
      </MemoryRouter>
    </ConfigProvider>
  )
}

describe('Article Management Integration Tests', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    ;(ArticleService.getArticles as jest.Mock).mockResolvedValue({
      content: mockArticles,
      totalElements: 3,
      totalPages: 1,
      size: 10,
      number: 0
    })
    ;(ArticleService.getArticle as jest.Mock).mockResolvedValue(mockArticles[0])
    ;(ArticleService.getArticleContent as jest.Mock).mockResolvedValue(mockArticleContent)
    ;(ArticleService.deleteArticle as jest.Mock).mockResolvedValue(undefined)
  })

  test('应该支持从文章列表导航到文章详情', async () => {
    renderWithRouter(
      <Routes>
        <Route path="/articles" element={<ArticleListPage />} />
        <Route path="/articles/:id" element={<ArticleDetailPage />} />
      </Routes>,
      ['/articles']
    )

    // 等待文章列表加载
    await waitFor(() => {
      expect(screen.getByText('前端开发最佳实践')).toBeInTheDocument()
      expect(screen.getByText('后端架构设计')).toBeInTheDocument()
      expect(screen.getByText('Docker容器化部署')).toBeInTheDocument()
    })

    // 点击第一篇文章的预览按钮
    const previewButtons = screen.getAllByText('预览')
    fireEvent.click(previewButtons[0])

    // 应该导航到文章详情页面
    await waitFor(() => {
      expect(screen.getByText('前端开发最佳实践')).toBeInTheDocument()
      expect(screen.getByText('文章内容')).toBeInTheDocument()
      expect(screen.getByText('代码规范')).toBeInTheDocument()
    })

    // 验证文章详情页面特有的元素
    expect(screen.getByText('返回列表')).toBeInTheDocument()
    expect(screen.getByText('编辑文章')).toBeInTheDocument()
  })

  test('应该支持搜索和筛选功能', async () => {
    renderWithRouter(<ArticleListPage />)

    // 等待文章列表加载
    await waitFor(() => {
      expect(screen.getByText('前端开发最佳实践')).toBeInTheDocument()
    })

    const searchInput = screen.getByPlaceholderText('搜索文章标题')
    const searchButton = screen.getByText('搜索')

    // 搜索特定文章
    fireEvent.change(searchInput, { target: { value: '前端' } })
    fireEvent.click(searchButton)

    await waitFor(() => {
      expect(ArticleService.getArticles).toHaveBeenCalledWith(
        expect.objectContaining({
          title: '前端',
          page: 0,
          size: 10
        })
      )
    })

    // 测试状态筛选
    const statusSelect = screen.getByText('文章状态').closest('.ant-select')
    if (statusSelect) {
      fireEvent.mouseDown(statusSelect.querySelector('.ant-select-selector')!)
    }

    const publishedOption = await screen.findByText('已发布')
    fireEvent.click(publishedOption)

    await waitFor(() => {
      expect(ArticleService.getArticles).toHaveBeenCalledWith(
        expect.objectContaining({
          title: '前端',
          status: 'PUBLISHED',
          page: 0,
          size: 10
        })
      )
    })
  })

  test('应该支持重置搜索条件', async () => {
    renderWithRouter(<ArticleListPage />)

    await waitFor(() => {
      expect(screen.getByText('前端开发最佳实践')).toBeInTheDocument()
    })

    const searchInput = screen.getByPlaceholderText('搜索文章标题')
    const resetButton = screen.getByText('重置')

    // 输入搜索条件
    fireEvent.change(searchInput, { target: { value: '搜索条件' } })

    // 点击重置按钮
    fireEvent.click(resetButton)

    // 验证搜索条件被清空
    await waitFor(() => {
      expect(searchInput).toHaveValue('')
      expect(ArticleService.getArticles).toHaveBeenCalledWith({
        page: 0,
        size: 10
      })
    })
  })

  test('应该支持删除文章操作', async () => {
    // Mock confirm dialog
    const mockConfirm = jest.fn(() => Promise.resolve())
    jest.mock('antd', () => {
      const actualAntd = jest.requireActual('antd')
      return {
        ...actualAntd,
        Modal: {
          ...actualAntd.Modal,
          confirm: mockConfirm
        }
      }
    })

    renderWithRouter(<ArticleListPage />)

    await waitFor(() => {
      expect(screen.getByText('前端开发最佳实践')).toBeInTheDocument()
    })

    const deleteButtons = screen.getAllByText('删除')
    fireEvent.click(deleteButtons[0])

    // 模拟用户确认删除
    await waitFor(() => {
      expect(ArticleService.deleteArticle).toHaveBeenCalledWith(1)
    })
  })

  test('应该正确处理分页操作', async () => {
    // Mock more articles for pagination testing
    const manyArticles = Array.from({ length: 25 }, (_, i) => ({
      ...mockArticles[0],
      id: i + 1,
      title: `文章标题 ${i + 1}`
    }))

    ;(ArticleService.getArticles as jest.Mock).mockResolvedValue({
      content: manyArticles.slice(0, 10),
      totalElements: 25,
      totalPages: 3,
      size: 10,
      number: 0
    })

    renderWithRouter(<ArticleListPage />)

    await waitFor(() => {
      expect(screen.getByText('共 25 篇文章')).toBeInTheDocument()
    })

    // 测试页面大小改变
    const pageSizeChanger = screen.getByTitle('10 条/页')
    fireEvent.click(pageSizeChanger)

    const pageSizeOption = await screen.findByText('20 条/页')
    fireEvent.click(pageSizeOption)

    await waitFor(() => {
      expect(ArticleService.getArticles).toHaveBeenCalledWith(
        expect.objectContaining({
          page: 0,
          size: 20
        })
      )
    })
  })

  test('应该正确显示文章状态和标签', async () => {
    renderWithRouter(<ArticleListPage />)

    await waitFor(() => {
      // 检查已发布文章
      expect(screen.getByText('已发布')).toBeInTheDocument()
      expect(screen.getByText('前端')).toBeInTheDocument()
      expect(screen.getByText('React')).toBeInTheDocument()

      // 检查草稿文章
      expect(screen.getByText('草稿')).toBeInTheDocument()
      expect(screen.getByText('后端')).toBeInTheDocument()
      expect(screen.getByText('微服务')).toBeInTheDocument()

      // 检查Docker相关文章
      expect(screen.getByText('Docker')).toBeInTheDocument()
      expect(screen.getByText('部署')).toBeInTheDocument()
    })
  })

  test('应该正确处理错误情况', async () => {
    // Mock network error
    ;(ArticleService.getArticles as jest.Mock).mockRejectedValue(new Error('网络连接失败'))

    // Mock console.error
    const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {})

    renderWithRouter(<ArticleListPage />)

    await waitFor(() => {
      expect(consoleSpy).toHaveBeenCalledWith('获取文章列表失败:', expect.any(Error))
      expect(message.error).toHaveBeenCalledWith('获取文章列表失败')
    })

    consoleSpy.mockRestore()
  })

  test('应该正确显示空状态', async () => {
    ;(ArticleService.getArticles as jest.Mock).mockResolvedValue({
      content: [],
      totalElements: 0,
      totalPages: 0,
      size: 10,
      number: 0
    })

    renderWithRouter(<ArticleListPage />)

    await waitFor(() => {
      expect(screen.getByText('暂无文章数据')).toBeInTheDocument()
      expect(screen.getByText('创建第一篇文章')).toBeInTheDocument()
    })
  })
})