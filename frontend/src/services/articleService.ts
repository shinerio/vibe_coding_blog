import { apiRequest } from './api'
import { 
  Article, 
  CreateArticleRequest, 
  UpdateArticleRequest, 
  PaginatedResponse,
  PaginationParams 
} from '../types/api'

export class ArticleService {
  // 获取文章列表
  static async getArticles(params?: PaginationParams & {
    title?: string
    status?: string
    tags?: string[]
  }): Promise<PaginatedResponse<Article>> {
    const response = await apiRequest.get<PaginatedResponse<Article>>('/articles', { params })
    return response.data
  }

  // 获取文章详情
  static async getArticle(id: number): Promise<Article> {
    const response = await apiRequest.get<Article>(`/articles/${id}`)
    return response.data
  }

  // 创建文章
  static async createArticle(data: CreateArticleRequest): Promise<Article> {
    const response = await apiRequest.post<Article>('/articles', data, {
      showSuccessMessage: true,
      successMessage: '文章创建成功',
    })
    return response.data
  }

  // 更新文章
  static async updateArticle(id: number, data: UpdateArticleRequest): Promise<Article> {
    const response = await apiRequest.put<Article>(`/articles/${id}`, data, {
      showSuccessMessage: true,
      successMessage: '文章更新成功',
    })
    return response.data
  }

  // 删除文章
  static async deleteArticle(id: number): Promise<void> {
    await apiRequest.delete(`/articles/${id}`, {
      showSuccessMessage: true,
      successMessage: '文章删除成功',
    })
  }

  // 获取文章Markdown内容
  static async getArticleContent(id: number): Promise<string> {
    const response = await apiRequest.get<string>(`/files/markdown/${id}`)
    return response.data
  }

  // 保存文章Markdown内容
  static async saveArticleContent(id: number, content: string): Promise<void> {
    await apiRequest.put(`/files/markdown/${id}`, content, {
      headers: {
        'Content-Type': 'text/plain',
      },
      showSuccessMessage: true,
      successMessage: '文章内容保存成功',
    })
  }

  // 发布文章
  static async publishArticle(id: number): Promise<Article> {
    const response = await apiRequest.patch<Article>(`/articles/${id}/publish`, {}, {
      showSuccessMessage: true,
      successMessage: '文章发布成功',
    })
    return response.data
  }

  // 取消发布文章
  static async unpublishArticle(id: number): Promise<Article> {
    const response = await apiRequest.patch<Article>(`/articles/${id}/unpublish`, {}, {
      showSuccessMessage: true,
      successMessage: '文章已设为草稿',
    })
    return response.data
  }

  // 批量删除文章
  static async batchDeleteArticles(ids: number[]): Promise<void> {
    await apiRequest.delete('/articles/batch', {
      data: { ids },
      showSuccessMessage: true,
      successMessage: `成功删除 ${ids.length} 篇文章`,
    })
  }
}

export default ArticleService