// 应用常量
export const APP_CONFIG = {
  TITLE: '个人博客系统',
  VERSION: '1.0.0',
  DESCRIPTION: '基于React和Spring Boot的个人博客管理系统',
}

// 文章状态
export const ARTICLE_STATUS = {
  DRAFT: 'DRAFT',
  PUBLISHED: 'PUBLISHED',
} as const

export const ARTICLE_STATUS_LABELS = {
  [ARTICLE_STATUS.DRAFT]: '草稿',
  [ARTICLE_STATUS.PUBLISHED]: '已发布',
}

// 支持的图片格式
export const SUPPORTED_IMAGE_TYPES = [
  'image/jpeg',
  'image/jpg',
  'image/png',
  'image/gif',
  'image/webp',
]

// 文件大小限制 (5MB)
export const MAX_FILE_SIZE = 5 * 1024 * 1024

// 分页配置
export const PAGINATION_CONFIG = {
  DEFAULT_PAGE_SIZE: 10,
  PAGE_SIZE_OPTIONS: ['10', '20', '50', '100'],
  SHOW_SIZE_CHANGER: true,
  SHOW_QUICK_JUMPER: true,
}

// API错误码
export const API_ERROR_CODES = {
  VALIDATION_ERROR: 'VALIDATION_ERROR',
  ARTICLE_NOT_FOUND: 'ARTICLE_NOT_FOUND',
  IMAGE_UPLOAD_FAILED: 'IMAGE_UPLOAD_FAILED',
  FILE_SAVE_ERROR: 'FILE_SAVE_ERROR',
  DATABASE_ERROR: 'DATABASE_ERROR',
} as const