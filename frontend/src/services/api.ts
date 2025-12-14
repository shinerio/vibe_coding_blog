import axios, { AxiosInstance, AxiosResponse, AxiosError, AxiosRequestConfig } from 'axios'
import { message } from 'antd'

// API基础配置
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '/api/v1'

// 请求配置接口
interface RequestConfig extends AxiosRequestConfig {
  skipErrorHandler?: boolean
  showSuccessMessage?: boolean
  successMessage?: string
}

// 创建axios实例
const apiClient: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000, // 30秒超时
  headers: {
    'Content-Type': 'application/json',
  },
})

// 请求计数器，用于显示全局loading
let requestCount = 0
const updateLoadingState = (isLoading: boolean) => {
  if (isLoading) {
    requestCount++
  } else {
    requestCount = Math.max(0, requestCount - 1)
  }
  
  // 可以在这里触发全局loading状态更新
  // 例如：store.dispatch(setGlobalLoading(requestCount > 0))
}

// 请求拦截器
apiClient.interceptors.request.use(
  (config: RequestConfig) => {
    // 显示loading
    updateLoadingState(true)
    
    // 添加请求时间戳，用于缓存控制
    if (config.method === 'get') {
      config.params = {
        ...config.params,
        _t: Date.now(),
      }
    }
    
    // 添加认证token
    const token = localStorage.getItem('auth_token')
    if (token) {
      config.headers = {
        ...config.headers,
        Authorization: `Bearer ${token}`,
      }
    }
    
    // 添加请求ID用于追踪
    config.headers = {
      ...config.headers,
      'X-Request-ID': `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    }
    
    return config
  },
  (error) => {
    updateLoadingState(false)
    return Promise.reject(error)
  }
)

// 响应拦截器
apiClient.interceptors.response.use(
  (response: AxiosResponse) => {
    updateLoadingState(false)
    
    const config = response.config as RequestConfig
    
    // 显示成功消息
    if (config.showSuccessMessage) {
      message.success(config.successMessage || '操作成功')
    }
    
    return response
  },
  (error: AxiosError) => {
    updateLoadingState(false)
    
    const config = error.config as RequestConfig
    
    // 如果配置了跳过错误处理，直接抛出错误
    if (config?.skipErrorHandler) {
      return Promise.reject(error)
    }
    
    // 统一错误处理
    if (error.response) {
      const { status, data } = error.response
      
      switch (status) {
        case 400:
          message.error(data?.error?.message || '请求参数错误')
          break
        case 401:
          message.error('登录已过期，请重新登录')
          // 清除本地token
          localStorage.removeItem('auth_token')
          // 可以在这里跳转到登录页
          // window.location.href = '/login'
          break
        case 403:
          message.error('权限不足，无法执行此操作')
          break
        case 404:
          message.error('请求的资源不存在')
          break
        case 409:
          message.error(data?.error?.message || '数据冲突')
          break
        case 422:
          message.error(data?.error?.message || '数据验证失败')
          break
        case 429:
          message.error('请求过于频繁，请稍后再试')
          break
        case 500:
          message.error('服务器内部错误，请稍后重试')
          break
        case 502:
        case 503:
        case 504:
          message.error('服务暂时不可用，请稍后重试')
          break
        default:
          message.error(data?.error?.message || `请求失败 (${status})`)
      }
    } else if (error.request) {
      if (error.code === 'ECONNABORTED') {
        message.error('请求超时，请检查网络连接')
      } else {
        message.error('网络连接失败，请检查网络')
      }
    } else {
      message.error('请求配置错误')
    }
    
    return Promise.reject(error)
  }
)

// API辅助函数
export const apiUtils = {
  // 获取当前请求数量
  getRequestCount: () => requestCount,
  
  // 设置认证token
  setAuthToken: (token: string) => {
    localStorage.setItem('auth_token', token)
  },
  
  // 清除认证token
  clearAuthToken: () => {
    localStorage.removeItem('auth_token')
  },
  
  // 获取认证token
  getAuthToken: () => {
    return localStorage.getItem('auth_token')
  },
  
  // 检查是否已认证
  isAuthenticated: () => {
    return Boolean(localStorage.getItem('auth_token'))
  },
}

// 扩展的请求方法
export const apiRequest = {
  // GET请求
  get: <T = any>(url: string, config?: RequestConfig) => 
    apiClient.get<T>(url, config),
  
  // POST请求
  post: <T = any>(url: string, data?: any, config?: RequestConfig) => 
    apiClient.post<T>(url, data, config),
  
  // PUT请求
  put: <T = any>(url: string, data?: any, config?: RequestConfig) => 
    apiClient.put<T>(url, data, config),
  
  // DELETE请求
  delete: <T = any>(url: string, config?: RequestConfig) => 
    apiClient.delete<T>(url, config),
  
  // PATCH请求
  patch: <T = any>(url: string, data?: any, config?: RequestConfig) => 
    apiClient.patch<T>(url, data, config),
  
  // 文件上传
  upload: <T = any>(url: string, formData: FormData, config?: RequestConfig) => 
    apiClient.post<T>(url, formData, {
      ...config,
      headers: {
        ...config?.headers,
        'Content-Type': 'multipart/form-data',
      },
    }),
}

export default apiClient