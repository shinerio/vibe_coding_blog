import React from 'react'
import { render, screen, fireEvent } from '@testing-library/react'
import { ConfigProvider } from 'antd'
import zhCN from 'antd/locale/zh_CN'
import ArticleCard from '../ArticleCard'

const mockArticle = {
  id: 1,
  title: '测试文章标题',
  summary: '这是一篇测试文章的摘要',
  status: 'PUBLISHED',
  tags: ['技术', '前端', 'React'],
  createdAt: '2024-01-01T10:00:00Z',
  updatedAt: '2024-01-01T10:00:00Z',
  publishedAt: '2024-01-01T10:00:00Z'
}

const renderWithProviders = (component: React.ReactElement) => {
  return render(
    <ConfigProvider locale={zhCN}>
      {component}
    </ConfigProvider>
  )
}

describe('ArticleCard', () => {
  const mockOnEdit = jest.fn()
  const mockOnPreview = jest.fn()
  const mockOnDelete = jest.fn()

  beforeEach(() => {
    jest.clearAllMocks()
  })

  test('应该正确渲染文章卡片', () => {
    renderWithProviders(
      <ArticleCard
        article={mockArticle}
        onEdit={mockOnEdit}
        onPreview={mockOnPreview}
        onDelete={mockOnDelete}
      />
    )

    // 检查文章标题
    expect(screen.getByText('测试文章标题')).toBeInTheDocument()

    // 检查文章摘要
    expect(screen.getByText('这是一篇测试文章的摘要')).toBeInTheDocument()

    // 检查文章状态
    expect(screen.getByText('已发布')).toBeInTheDocument()

    // 检查标签
    expect(screen.getByText('技术')).toBeInTheDocument()
    expect(screen.getByText('前端')).toBeInTheDocument()
    expect(screen.getByText('React')).toBeInTheDocument()

    // 检查操作按钮
    expect(screen.getByText('预览')).toBeInTheDocument()
    expect(screen.getByText('编辑')).toBeInTheDocument()
    expect(screen.getByText('删除')).toBeInTheDocument()
  })

  test('应该正确显示草稿状态', () => {
    const draftArticle = { ...mockArticle, status: 'DRAFT' }

    renderWithProviders(
      <ArticleCard
        article={draftArticle}
        onEdit={mockOnEdit}
        onPreview={mockOnPreview}
        onDelete={mockOnDelete}
      />
    )

    expect(screen.getByText('草稿')).toBeInTheDocument()
  })

  test('应该正确处理没有摘要的文章', () => {
    const articleWithoutSummary = { ...mockArticle, summary: undefined }

    renderWithProviders(
      <ArticleCard
        article={articleWithoutSummary}
        onEdit={mockOnEdit}
        onPreview={mockOnPreview}
        onDelete={mockOnDelete}
      />
    )

    // 确保摘要区域不存在
    expect(screen.queryByText('这是一篇测试文章的摘要')).not.toBeInTheDocument()
  })

  test('应该正确处理没有标签的文章', () => {
    const articleWithoutTags = { ...mockArticle, tags: [] }

    renderWithProviders(
      <ArticleCard
        article={articleWithoutTags}
        onEdit={mockOnEdit}
        onPreview={mockOnPreview}
        onDelete={mockOnDelete}
      />
    )

    // 确保标签不存在
    expect(screen.queryByText('技术')).not.toBeInTheDocument()
    expect(screen.queryByText('前端')).not.toBeInTheDocument()
    expect(screen.queryByText('React')).not.toBeInTheDocument()
  })

  test('应该正确处理没有发布时间的文章', () => {
    const articleWithoutPublishedDate = { ...mockArticle, publishedAt: undefined }

    renderWithProviders(
      <ArticleCard
        article={articleWithoutPublishedDate}
        onEdit={mockOnEdit}
        onPreview={mockOnPreview}
        onDelete={mockOnDelete}
      />
    )

    // 确保发布时间不存在
    expect(screen.queryByText(/发布时间/)).not.toBeInTheDocument()

    // 但创建时间和更新时间应该存在
    expect(screen.getByText(/创建时间/)).toBeInTheDocument()
    expect(screen.getByText(/更新时间/)).toBeInTheDocument()
  })

  test('应该正确处理预览按钮点击', () => {
    renderWithProviders(
      <ArticleCard
        article={mockArticle}
        onEdit={mockOnEdit}
        onPreview={mockOnPreview}
        onDelete={mockOnDelete}
      />
    )

    const previewButton = screen.getByText('预览')
    fireEvent.click(previewButton)

    expect(mockOnPreview).toHaveBeenCalledWith(1)
  })

  test('应该正确处理编辑按钮点击', () => {
    renderWithProviders(
      <ArticleCard
        article={mockArticle}
        onEdit={mockOnEdit}
        onPreview={mockOnPreview}
        onDelete={mockOnDelete}
      />
    )

    const editButton = screen.getByText('编辑')
    fireEvent.click(editButton)

    expect(mockOnEdit).toHaveBeenCalledWith(1)
  })

  test('应该正确处理删除按钮点击', () => {
    renderWithProviders(
      <ArticleCard
        article={mockArticle}
        onEdit={mockOnEdit}
        onPreview={mockOnPreview}
        onDelete={mockOnDelete}
      />
    )

    const deleteButton = screen.getByText('删除')
    fireEvent.click(deleteButton)

    expect(mockOnDelete).toHaveBeenCalledWith(1)
  })

  test('应该正确格式化日期', () => {
    renderWithProviders(
      <ArticleCard
        article={mockArticle}
        onEdit={mockOnEdit}
        onPreview={mockOnPreview}
        onDelete={mockOnDelete}
      />
    )

    // 检查日期格式是否正确（中文格式）
    expect(screen.getByText(/创建时间:/)).toBeInTheDocument()
    expect(screen.getByText(/更新时间:/)).toBeInTheDocument()
    expect(screen.getByText(/发布时间:/)).toBeInTheDocument()

    // 验证日期包含正确的年月日格式
    const dateElements = screen.getAllByText(/\d{4}\/\d{1,2}\/\d{1,2}/)
    expect(dateElements.length).toBeGreaterThanOrEqual(2) // 至少有创建和更新时间
  })

  test('应该正确处理未知状态', () => {
    const articleWithUnknownStatus = { ...mockArticle, status: 'UNKNOWN' }

    renderWithProviders(
      <ArticleCard
        article={articleWithUnknownStatus}
        onEdit={mockOnEdit}
        onPreview={mockOnPreview}
        onDelete={mockOnDelete}
      />
    )

    // 未知状态应该显示为默认状态
    const statusTag = screen.getByText('UNKNOWN')
    expect(statusTag).toBeInTheDocument()
    expect(statusTag.closest('.ant-tag')).toHaveClass('ant-tag-default')
  })
})