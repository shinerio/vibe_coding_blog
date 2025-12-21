// API响应基础类型
export interface ApiResponse<T = any> {
  data: T
  message?: string
  success: boolean
}

// 错误响应类型
export interface ApiError {
  error: {
    code: string
    message: string
    details?: string
    timestamp: string
    path: string
  }
}

// 分页参数类型
export interface PaginationParams {
  page?: number
  size?: number
  sort?: string
}

// 分页响应类型
export interface PaginatedResponse<T> {
  content: T[]
  totalElements: number
  totalPages: number
  size: number
  number: number
  first: boolean
  last: boolean
}

// 文章相关类型
export interface Article {
  id: number
  title: string
  slug: string
  summary?: string
  contentPath: string
  status: 'DRAFT' | 'PUBLISHED'
  tags: string[]
  createdAt: string
  updatedAt: string
  publishedAt?: string | { present: boolean }
}

export interface CreateArticleRequest {
  title: string
  slug: string
  summary?: string
  content: string
  status?: 'DRAFT' | 'PUBLISHED'
  tags?: string[]
}

export interface UpdateArticleRequest extends Partial<CreateArticleRequest> {
  id: number
}

// 图片相关类型
export interface Image {
  id: number
  filename: string
  originalName: string
  filePath: string
  fileSize: number
  mimeType: string
  base64Content?: string
  createdAt: string;
}

export interface UploadImageRequest {
  file: File
  base64Content?: string
}