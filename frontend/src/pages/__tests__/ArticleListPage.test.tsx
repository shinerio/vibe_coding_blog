import React from 'react'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { BrowserRouter } from 'react-router-dom'
import { ConfigProvider } from 'antd'
import zhCN from 'antd/locale/zh_CN'
import ArticleListPage from '../ArticleListPage'
import { ArticleService } from '../../services/articleService'

// Mock services
jest.mock('../../services/articleService')
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => jest.fn()
}))

const mockArticles = [
  {
    id: 1,
    title: '测试文章1',
    summary: '这是第一篇测试文章',
    status: 'PUBLISHED',
    tags: ['技术', '前端'],
    createdAt: '2024-01-01T10:00:00Z',
    updatedAt: '2024-01-01T10:00:00Z',
    publishedAt: '2024-01-01T10:00:00Z'
  },
  {
    id: 2,
    title: '测试文章2',
    summary: '这是第二篇测试文章',
    status: 'DRAFT',
    tags: ['后端', 'Java'],
    createdAt: '2024-01-02T10:00:00Z',
    updatedAt: '2024-01-02T10:00:00Z'
  }
]

const mockPaginatedResponse = {
  content: mockArticles,
  totalElements: 2,
  totalPages: 1,
  size: 10,
  number: 0
}

const renderWithProviders = (component: React.ReactElement) => {
  return render(
    <ConfigProvider locale={zhCN}>
      <BrowserRouter>
        {component}
      </BrowserRouter>
    </ConfigProvider>
  )
}

describe('ArticleListPage', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    ;(ArticleService.getArticles as jest.Mock).mockResolvedValue(mockPaginatedResponse)
  })

  test('应该正确渲染文章列表页面', async () => {
    renderWithProviders(<ArticleListPage />)

    // 检查页面标题
    expect(screen.getByText('文章管理')).toBeInTheDocument()

    // 等待文章列表加载
    await waitFor(() => {
      expect(screen.getByText('测试文章1')).toBeInTheDocument()
      expect(screen.getByText('测试文章2')).toBeInTheDocument()
    })
  })

  test('应该显示搜索和筛选控件', () => {
    renderWithProviders(<ArticleListPage />)

    // 检查搜索输入框
    expect(screen.getByPlaceholderText('搜索文章标题')).toBeInTheDocument()

    // 检查状态筛选下拉框
    expect(screen.getByText('文章状态')).toBeInTheDocument()

    // 检查按钮
    expect(screen.getByText('搜索')).toBeInTheDocument()
    expect(screen.getByText('重置')).toBeInTheDocument()
    expect(screen.getByText('新建文章')).toBeInTheDocument()
  })

  test('应该正确处理搜索功能', async () => {
    renderWithProviders(<ArticleListPage />)

    const searchInput = screen.getByPlaceholderText('搜索文章标题')
    const searchButton = screen.getByText('搜索')

    // 输入搜索条件
    fireEvent.change(searchInput, { target: { value: '测试' } })

    // 点击搜索按钮
    fireEvent.click(searchButton)

    await waitFor(() => {
      expect(ArticleService.getArticles).toHaveBeenCalledWith(
        expect.objectContaining({
          title: '测试',
          page: 0,
          size: 10
        })
      )
    })
  })

  test('应该正确处理状态筛选', async () => {
    renderWithProviders(<ArticleListPage />)

    // 找到状态筛选下拉框并选择
    const statusSelect = screen.getByText('文章状态').closest('.ant-select')
    if (statusSelect) {
      fireEvent.mouseDown(statusSelect.querySelector('.ant-select-selector')!)
    }

    // 选择"已发布"选项
    const publishedOption = await screen.findByText('已发布')
    fireEvent.click(publishedOption)

    await waitFor(() => {
      expect(ArticleService.getArticles).toHaveBeenCalledWith(
        expect.objectContaining({
          status: 'PUBLISHED',
          page: 0,
          size: 10
        })
      )
    })
  })

  test('应该正确处理重置功能', async () => {
    renderWithProviders(<ArticleListPage />)

    const searchInput = screen.getByPlaceholderText('搜索文章标题')
    const resetButton = screen.getByText('重置')

    // 输入搜索条件
    fireEvent.change(searchInput, { target: { value: '测试' } })

    // 点击重置按钮
    fireEvent.click(resetButton)

    // 检查搜索输入框是否被清空
    await waitFor(() => {
      expect(searchInput).toHaveValue('')
    })
  })

  test('应该正确显示分页信息', async () => {
    renderWithProviders(<ArticleListPage />)

    await waitFor(() => {
      expect(screen.getByText('共 2 篇文章')).toBeInTheDocument()
    })
  })

  test('应该正确处理空数据状态', async () => {
    ;(ArticleService.getArticles as jest.Mock).mockResolvedValue({
      content: [],
      totalElements: 0,
      totalPages: 0,
      size: 10,
      number: 0
    })

    renderWithProviders(<ArticleListPage />)

    await waitFor(() => {
      expect(screen.getByText('暂无文章数据')).toBeInTheDocument()
      expect(screen.getByText('创建第一篇文章')).toBeInTheDocument()
    })
  })

  test('应该正确处理加载状态', () => {
    // Mock a pending promise
    ;(ArticleService.getArticles as jest.Mock).mockImplementation(() => new Promise(() => {}))

    renderWithProviders(<ArticleListPage />)

    // 检查是否显示加载状态
    expect(screen.getByTestId('loading-card') || document.querySelector('.ant-skeleton')).toBeInTheDocument()
  })

  test('应该正确处理错误状态', async () => {
    ;(ArticleService.getArticles as jest.Mock).mockRejectedValue(new Error('网络错误'))

    // Mock console.error to avoid noise in test output
    const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {})

    renderWithProviders(<ArticleListPage />)

    await waitFor(() => {
      // 验证错误被正确处理
      expect(consoleSpy).toHaveBeenCalledWith('获取文章列表失败:', expect.any(Error))
    })

    consoleSpy.mockRestore()
  })
})