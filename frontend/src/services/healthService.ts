import { apiRequest } from './api'

export interface HealthStatus {
  status: 'UP' | 'DOWN'
  timestamp: string
  details?: {
    database?: {
      status: 'UP' | 'DOWN'
      details?: string
    }
    diskSpace?: {
      status: 'UP' | 'DOWN'
      total: number
      free: number
      threshold: number
    }
  }
}

export class HealthService {
  // 检查系统健康状态
  static async checkHealth(): Promise<HealthStatus> {
    const response = await apiRequest.get<HealthStatus>('/actuator/health', {
      skipErrorHandler: true, // 健康检查失败时不显示错误消息
    })
    return response.data
  }

  // 检查数据库连接
  static async checkDatabase(): Promise<boolean> {
    try {
      const health = await this.checkHealth()
      return health.details?.database?.status === 'UP'
    } catch {
      return false
    }
  }

  // 获取系统信息
  static async getSystemInfo(): Promise<any> {
    const response = await apiRequest.get('/actuator/info', {
      skipErrorHandler: true,
    })
    return response.data
  }
}

export default HealthService