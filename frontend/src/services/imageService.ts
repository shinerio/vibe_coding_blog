import { apiRequest } from './api'
import { Image as ApiImage, UploadImageRequest, PaginatedResponse, PaginationParams } from '../types/api'

export class ImageService {
  // 上传图片
  static async uploadImage(data: UploadImageRequest): Promise<ApiImage> {
    const formData = new FormData()
    formData.append('file', data.file)

    if (data.base64Content) {
      formData.append('base64Content', data.base64Content)
    }

    const response = await apiRequest.upload<ApiImage>('/images', formData, {
      showSuccessMessage: true,
      successMessage: '图片上传成功',
      timeout: 60000, // 图片上传超时时间设为60秒
    })
    return response.data
  }

  // 获取图片列表
  static async getImages(params?: PaginationParams): Promise<PaginatedResponse<ApiImage>> {
    const response = await apiRequest.get<PaginatedResponse<ApiImage>>('/images', { params })
    return response.data
  }

  // 获取图片详情
  static async getImage(id: number): Promise<ApiImage> {
    const response = await apiRequest.get<ApiImage>(`/images/${id}`)
    return response.data
  }

  // 删除图片
  static async deleteImage(id: number): Promise<void> {
    await apiRequest.delete(`/images/${id}`, {
      showSuccessMessage: true,
      successMessage: '图片删除成功',
    })
  }

  // 批量删除图片
  static async batchDeleteImages(ids: number[]): Promise<void> {
    await apiRequest.delete('/images/batch', {
      data: { ids },
      showSuccessMessage: true,
      successMessage: `成功删除 ${ids.length} 张图片`,
    })
  }

  // 将文件转换为Base64
  static fileToBase64(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader()
      reader.readAsDataURL(file)
      reader.onload = () => {
        const result = reader.result as string
        // 移除data:image/xxx;base64,前缀
        const base64 = result.split(',')[1]
        resolve(base64)
      }
      reader.onerror = (error) => reject(error)
    })
  }

  // 压缩图片
  static compressImage(file: File, quality: number = 0.8): Promise<File> {
    return new Promise((resolve, reject) => {
      const canvas = document.createElement('canvas')
      const ctx = canvas.getContext('2d')
      const img = new Image()
      
      img.onload = () => {
        // 计算压缩后的尺寸
        const maxWidth = 1920
        const maxHeight = 1080
        let { width, height } = img
        
        if (width > maxWidth || height > maxHeight) {
          const ratio = Math.min(maxWidth / width, maxHeight / height)
          width *= ratio
          height *= ratio
        }
        
        canvas.width = width
        canvas.height = height
        
        // 绘制压缩后的图片
        ctx?.drawImage(img, 0, 0, width, height)
        
        canvas.toBlob(
          (blob) => {
            if (blob) {
              const compressedFile = new File([blob], file.name, {
                type: file.type,
                lastModified: Date.now(),
              })
              resolve(compressedFile)
            } else {
              reject(new Error('图片压缩失败'))
            }
          },
          file.type,
          quality
        )
      }
      
      img.onerror = () => reject(new Error('图片加载失败'))
      img.src = URL.createObjectURL(file)
    })
  }

  // 获取图片预览URL
  static getImagePreviewUrl(image: Image): string {
    if (image.base64Content) {
      return `data:${image.mimeType};base64,${image.base64Content}`
    }
    return `/api/v1/images/${image.id}/preview`
  }
}

export default ImageService