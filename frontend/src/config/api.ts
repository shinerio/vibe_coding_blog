// API端点配置
export const API_ENDPOINTS = {
  // 文章相关
  ARTICLES: '/articles',
  ARTICLE_DETAIL: (id: number | string) => `/articles/${id}`,
  ARTICLE_PUBLISH: (id: number | string) => `/articles/${id}/publish`,
  ARTICLE_UNPUBLISH: (id: number | string) => `/articles/${id}/unpublish`,
  ARTICLES_BATCH: '/articles/batch',
  
  // 文件相关
  MARKDOWN_FILE: (id: number | string) => `/files/markdown/${id}`,
  
  // 图片相关
  IMAGES: '/images',
  IMAGE_DETAIL: (id: number | string) => `/images/${id}`,
  IMAGE_PREVIEW: (id: number | string) => `/images/${id}/preview`,
  IMAGES_BATCH: '/images/batch',
  
  // 系统相关
  HEALTH: '/actuator/health',
  INFO: '/actuator/info',
} as const

// 请求配置
export const REQUEST_CONFIG = {
  // 默认超时时间
  DEFAULT_TIMEOUT: 30000,
  
  // 文件上传超时时间
  UPLOAD_TIMEOUT: 60000,
  
  // 重试次数
  RETRY_COUNT: 3,
  
  // 重试延迟 (毫秒)
  RETRY_DELAY: 1000,
} as const

// 缓存配置
export const CACHE_CONFIG = {
  // 文章列表缓存时间 (5分钟)
  ARTICLES_CACHE_TIME: 5 * 60 * 1000,
  
  // 图片列表缓存时间 (10分钟)
  IMAGES_CACHE_TIME: 10 * 60 * 1000,
  
  // 文章详情缓存时间 (2分钟)
  ARTICLE_DETAIL_CACHE_TIME: 2 * 60 * 1000,
} as const