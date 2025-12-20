import React from 'react'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { BrowserRouter, MemoryRouter } from 'react-router-dom'
import { ConfigProvider } from 'antd'
import zhCN from 'antd/locale/zh_CN'
import ArticleDetailPage from '../ArticleDetailPage'
import { ArticleService } from '../../services/articleService'

// Mock services
jest.mock('../../services/articleService')
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => jest.fn(),
  useParams: () => ({ id: '1' })
}))

// Mock window.open
const mockOpen = jest.fn()
Object.defineProperty(window, 'open', {
  writable: true,
  value: mockOpen
})

const mockArticle = {
  id: 1,
  title: '测试文章标题',
  summary: '这是一篇测试文章的摘要，用于测试文章详情页面的显示效果。',
  status: 'PUBLISHED',
  tags: ['技术', '前端', 'React', '测试'],
  createdAt: '2024-01-01T10:00:00Z',
  updatedAt: '2024-01-02T15:30:00Z',
  publishedAt: '2024-01-01T12:00:00Z'
}

const mockArticleContent = `
# 测试文章

这是一篇测试文章的内容。

## 子标题

这里是一些**粗体**和*斜体*文本。

\`\`\`javascript
console.log('Hello, World!');
\`\`\`

- 列表项1
- 列表项2
- 列表项3
`

const renderWithProviders = (component: React.ReactElement, initialEntries = ['/']) => {
  return render(
    <ConfigProvider locale={zhCN}>
      <MemoryRouter initialEntries={initialEntries}>
        {component}
      </MemoryRouter>
    </ConfigProvider>
  )
}

describe('ArticleDetailPage', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    ;(ArticleService.getArticle as jest.Mock).mockResolvedValue(mockArticle)
    ;(ArticleService.getArticleContent as jest.Mock).mockResolvedValue(mockArticleContent)
  })

  test('应该正确渲染文章详情页面', async () => {
    renderWithProviders(<ArticleDetailPage />)

    // 等待文章加载
    await waitFor(() => {
      expect(screen.getByText('测试文章标题')).toBeInTheDocument()
    })

    // 检查文章状态
    expect(screen.getByText('已发布')).toBeInTheDocument()

    // 检查文章摘要
    expect(screen.getByText('这是一篇测试文章的摘要，用于测试文章详情页面的显示效果。')).toBeInTheDocument()

    // 检查标签
    expect(screen.getByText('技术')).toBeInTheDocument()
    expect(screen.getByText('前端')).toBeInTheDocument()
    expect(screen.getByText('React')).toBeInTheDocument()
    expect(screen.getByText('测试')).toBeInTheDocument()

    // 检查操作按钮
    expect(screen.getByText('返回列表')).toBeInTheDocument()
    expect(screen.getByText('编辑文章')).toBeInTheDocument()
    expect(screen.getByText('新窗口预览')).toBeInTheDocument()
  })

  test('应该正确显示文章元信息', async () => {
    renderWithProviders(<ArticleDetailPage />)

    await waitFor(() => {
      // 检查时间信息
      expect(screen.getByText(/创建时间：/)).toBeInTheDocument()
      expect(screen.getByText(/更新时间：/)).toBeInTheDocument()
      expect(screen.getByText(/发布时间：/)).toBeInTheDocument()
    })
  })

  test('应该正确处理草稿状态的文章', async () => {
    const draftArticle = { ...mockArticle, status: 'DRAFT', publishedAt: undefined }
    ;(ArticleService.getArticle as jest.Mock).mockResolvedValue(draftArticle)

    renderWithProviders(<ArticleDetailPage />)

    await waitFor(() => {
      expect(screen.getByText('草稿')).toBeInTheDocument()
    })

    // 草稿文章不应该显示发布时间
    expect(screen.queryByText(/发布时间：/)).not.toBeInTheDocument()
  })

  test('应该正确处理没有摘要的文章', async () => {
    const articleWithoutSummary = { ...mockArticle, summary: undefined }
    ;(ArticleService.getArticle as jest.Mock).mockResolvedValue(articleWithoutSummary)

    renderWithProviders(<ArticleDetailPage />)

    await waitFor(() => {
      expect(screen.getByText('测试文章标题')).toBeInTheDocument()
    })

    // 不应该显示摘要相关的内容
    expect(screen.queryByText(/文章摘要：/)).not.toBeInTheDocument()
  })

  test('应该正确处理没有标签的文章', async () => {
    const articleWithoutTags = { ...mockArticle, tags: [] }
    ;(ArticleService.getArticle as jest.Mock).mockResolvedValue(articleWithoutTags)

    renderWithProviders(<ArticleDetailPage />)

    await waitFor(() => {
      expect(screen.getByText('测试文章标题')).toBeInTheDocument()
    })

    // 不应该显示标签相关的内容
    expect(screen.queryByText(/标签：/)).not.toBeInTheDocument()
  })

  test('应该正确处理加载状态', () => {
    // Mock a pending promise
    ;(ArticleService.getArticle as jest.Mock).mockImplementation(() => new Promise(() => {}))
    ;(ArticleService.getArticleContent as jest.Mock).mockImplementation(() => new Promise(() => {}))

    renderWithProviders(<ArticleDetailPage />)

    // 检查加载状态
    expect(screen.getByText('加载文章详情中...')).toBeInTheDocument()
    expect(screen.getByTestId('loading-spinner') || document.querySelector('.ant-spin')).toBeInTheDocument()
  })

  test('应该正确处理文章不存在的情况', async () => {
    ;(ArticleService.getArticle as jest.Mock).mockRejectedValue(new Error('文章不存在'))
    ;(ArticleService.getArticleContent as jest.Mock).mockRejectedValue(new Error('文章不存在'))

    // Mock console.error to avoid noise in test output
    const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {})

    renderWithProviders(<ArticleDetailPage />)

    await waitFor(() => {
      expect(screen.getByText('文章不存在')).toBeInTheDocument()
      expect(screen.getByText('抱歉，您访问的文章不存在或已被删除。')).toBeInTheDocument()
    })

    consoleSpy.mockRestore()
  })

  test('应该正确处理无效ID的情况', async () => {
    // 使用无效的ID参数
    const ArticleDetailPageWithInvalidId = () => {
      const MockedParams = jest.requireMock('react-router-dom')
      MockedParams.useParams = () => ({ id: undefined })

      return <ArticleDetailPage />
    }

    renderWithProviders(<ArticleDetailPageWithInvalidId />)

    // 应该不会调用服务
    await waitFor(() => {
      expect(ArticleService.getArticle).not.toHaveBeenCalled()
      expect(ArticleService.getArticleContent).not.toHaveBeenCalled()
    })
  })

  test('应该正确渲染Markdown内容', async () => {
    renderWithProviders(<ArticleDetailPage />)

    await waitFor(() => {
      // 检查Markdown内容是否被正确渲染
      expect(screen.getByText('测试文章')).toBeInTheDocument()
      expect(screen.getByText('子标题')).toBeInTheDocument()
      expect(screen.getByText('这里是一些粗体和斜体文本。')).toBeInTheDocument()
    })

    // 检查代码块是否存在
    const codeBlock = document.querySelector('pre code')
    expect(codeBlock).toBeInTheDocument()
    expect(codeBlock?.textContent).toContain("console.log('Hello, World!')")

    // 检查列表项
    expect(screen.getByText('列表项1')).toBeInTheDocument()
    expect(screen.getByText('列表项2')).toBeInTheDocument()
    expect(screen.getByText('列表项3')).toBeInTheDocument()
  })

  test('应该正确处理空内容', async () => {
    ;(ArticleService.getArticleContent as jest.Mock).mockResolvedValue('')

    renderWithProviders(<ArticleDetailPage />)

    await waitFor(() => {
      expect(screen.getByText('测试文章标题')).toBeInTheDocument()
    })

    // 检查文章内容区域是否存在，即使内容为空
    expect(screen.getByText('文章内容')).toBeInTheDocument()
  })

  test('应该正确处理Markdown解析错误', async () => {
    // 模拟无效的Markdown内容
    const invalidMarkdown = '# 标题\n\`\`\`invalid\n```'
    ;(ArticleService.getArticleContent as jest.Mock).mockResolvedValue(invalidMarkdown)

    // Mock console.error to capture parsing errors
    const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {})

    renderWithProviders(<ArticleDetailPage />)

    await waitFor(() => {
      expect(screen.getByText('测试文章标题')).toBeInTheDocument()
    })

    consoleSpy.mockRestore()
  })
})