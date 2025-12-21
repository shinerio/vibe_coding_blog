import { useState, useEffect } from 'react'
import { ArticleService } from '../services/articleService'
import { ImageService } from '../services/imageService'

export interface DashboardStats {
  totalArticles: number
  publishedArticles: number
  draftArticles: number
  totalImages: number
}

export const useDashboardStats = () => {
  const [stats, setStats] = useState<DashboardStats>({
    totalArticles: 0,
    publishedArticles: 0,
    draftArticles: 0,
    totalImages: 0,
  })
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchStats = async () => {
      try {
        setLoading(true)
        setError(null)

        // 获取文章总数
        const articlesResponse = await ArticleService.getArticles({ page: 0, size: 1 })
        const totalArticles = articlesResponse.totalElements

        // 获取已发布文章数量
        const publishedResponse = await ArticleService.getArticles({
          page: 0,
          size: 1,
          status: 'PUBLISHED'
        })
        const publishedArticles = publishedResponse.totalElements

        // 获取草稿数量
        const draftResponse = await ArticleService.getArticles({
          page: 0,
          size: 1,
          status: 'DRAFT'
        })
        const draftArticles = draftResponse.totalElements

        // 获取图片数量（先尝试获取图片列表，如果失败则设为0）
        let totalImages = 0
        try {
          const imagesResponse = await ImageService.getImages({ page: 0, size: 1 })
          totalImages = imagesResponse.totalElements
        } catch (imageError) {
          console.warn('无法获取图片数量:', imageError)
          totalImages = 0
        }

        setStats({
          totalArticles,
          publishedArticles,
          draftArticles,
          totalImages,
        })
      } catch (err) {
        console.error('获取统计数据失败:', err)
        setError('获取统计数据失败')
      } finally {
        setLoading(false)
      }
    }

    fetchStats()
  }, [])

  return { stats, loading, error }
}