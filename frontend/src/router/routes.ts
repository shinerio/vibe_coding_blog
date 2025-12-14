// 路由配置
export const ROUTES = {
  HOME: '/',
  ARTICLES: '/articles',
  ARTICLE_DETAIL: '/articles/:id',
  EDITOR: '/editor',
  EDITOR_WITH_ID: '/editor/:id',
  IMAGES: '/images',
  NOT_FOUND: '/404',
} as const

// 路由标题映射
export const ROUTE_TITLES: Record<string, string> = {
  [ROUTES.HOME]: '首页',
  [ROUTES.ARTICLES]: '文章管理',
  [ROUTES.EDITOR]: '写文章',
  [ROUTES.IMAGES]: '图片管理',
  [ROUTES.NOT_FOUND]: '页面未找到',
}

// 生成路由路径的辅助函数
export const generatePath = {
  articleDetail: (id: number | string) => `/articles/${id}`,
  editArticle: (id: number | string) => `/editor/${id}`,
}

// 检查当前路由的辅助函数
export const isCurrentRoute = (pathname: string, route: string): boolean => {
  if (route.includes(':')) {
    // 处理动态路由
    const routePattern = route.replace(/:[^/]+/g, '[^/]+')
    const regex = new RegExp(`^${routePattern}$`)
    return regex.test(pathname)
  }
  return pathname === route
}