import { useState, useEffect } from 'react'
import { message } from 'antd'

interface UseApiState<T> {
  data: T | null
  loading: boolean
  error: Error | null
}

interface UseApiOptions {
  immediate?: boolean
  onSuccess?: (data: any) => void
  onError?: (error: Error) => void
}

export function useApi<T>(
  apiFunction: () => Promise<T>,
  options: UseApiOptions = {}
) {
  const { immediate = true, onSuccess, onError } = options
  
  const [state, setState] = useState<UseApiState<T>>({
    data: null,
    loading: false,
    error: null,
  })

  const execute = async () => {
    setState(prev => ({ ...prev, loading: true, error: null }))
    
    try {
      const result = await apiFunction()
      setState({ data: result, loading: false, error: null })
      onSuccess?.(result)
      return result
    } catch (error) {
      const err = error as Error
      setState(prev => ({ ...prev, loading: false, error: err }))
      onError?.(err)
      throw error
    }
  }

  useEffect(() => {
    if (immediate) {
      execute()
    }
  }, [immediate])

  return {
    ...state,
    execute,
    refetch: execute,
  }
}

export function useAsyncOperation() {
  const [loading, setLoading] = useState(false)

  const execute = async <T>(
    operation: () => Promise<T>,
    options?: {
      successMessage?: string
      errorMessage?: string
      onSuccess?: (data: T) => void
      onError?: (error: Error) => void
    }
  ): Promise<T | null> => {
    setLoading(true)
    
    try {
      const result = await operation()
      
      if (options?.successMessage) {
        message.success(options.successMessage)
      }
      
      options?.onSuccess?.(result)
      return result
    } catch (error) {
      const err = error as Error
      
      if (options?.errorMessage) {
        message.error(options.errorMessage)
      }
      
      options?.onError?.(err)
      return null
    } finally {
      setLoading(false)
    }
  }

  return { loading, execute }
}