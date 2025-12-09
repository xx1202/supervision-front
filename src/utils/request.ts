/**
 * axios封装 - 请求拦截、响应拦截、错误统一处理
 */
import axios from 'axios'
import type { AxiosInstance, AxiosRequestConfig, AxiosResponse, InternalAxiosRequestConfig } from 'axios'
import type { LoginResponse } from '@/types/permission'
import tokenManager from './token-manager'
import { config, isDev, isProd } from '@/config/env'

// 根据环境配置后端地址（使用统一配置）
const getBaseURL = () => {
  // 优先使用环境变量配置
  const baseURL = config.api.baseURL
  
  // 如果没有配置，根据运行模式自动选择
  if (baseURL && baseURL !== 'http://localhost:8080/api') {
    return baseURL
  }
  
  // 开发环境默认地址
  if (isDev) {
    return 'http://localhost:8080/api'
  }
  
  // 生产环境默认地址
  return 'http://localhost:8080/api' 
}

// 创建axios实例
const request: AxiosInstance = axios.create({
  baseURL: getBaseURL(),
  timeout: config.api.timeout,
  headers: {
    'Content-Type': 'application/json'
  }
})

// 开发环境输出当前配置信息
import { logger } from './logger'
if (isDev) {
  logger.debug('🔧 当前环境配置:', {
    mode: import.meta.env.MODE,
    isDev,
    isProd,
    baseURL: getBaseURL(),
    timeout: config.api.timeout
  })
}

// 请求队列管理
let isRefreshing = false
let failedQueue: Array<{
  resolve: (value?: unknown) => void
  reject: (error?: unknown) => void
  config: AxiosRequestConfig
}> = []

// 队列大小限制
const MAX_QUEUE_SIZE = 50

// 处理队列中的请求
const processQueue = (error: unknown, token: string | null = null) => {
  failedQueue.forEach(({ resolve, reject, config }) => {
    if (error) {
      reject(error)
    } else {
      if (config.headers) {
        config.headers.Authorization = `Bearer ${token}`
      }
      resolve(request(config))
    }
  })
  
  // 清空队列
  failedQueue = []
}

// 添加请求到队列
const addToQueue = (resolve: (value?: unknown) => void, reject: (error?: unknown) => void, config: AxiosRequestConfig) => {
  // 限制队列大小，防止内存泄漏
  if (failedQueue.length >= MAX_QUEUE_SIZE) {
    console.warn('请求队列已满，移除最旧的请求')
    failedQueue.shift() // 移除最旧的请求
  }
  
  failedQueue.push({ resolve, reject, config })
}

// 验证 token 是否有效
const isValidToken = (token: string | null): boolean => {
  if (!token) return false
  if (token === 'null' || token === 'undefined') return false
  if (token.trim() === '') return false
  if (token.length < 10) return false // JWT 至少应该有10个字符
  
  // 检查是否包含两个点号（JWT 标准格式：header.payload.signature）
  const dotCount = (token.match(/\./g) || []).length
  return dotCount === 2
}

// 刷新token的函数 - 使用 tokenManager
const refreshToken = async (): Promise<string | null> => {
  try {
    logger.debug('🔄 开始刷新 token...')
    const newToken = await tokenManager.refreshToken()
    logger.debug('✅ Token 刷新成功:', newToken ? newToken.substring(0, 20) + '...' : 'null')
    return newToken
  } catch (error) {
    console.error('❌ 刷新token失败:', error)
    // tokenManager 会自动清理 token，这里不需要手动清理
    throw error
  }
}

// 请求拦截器
request.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    // 登录和刷新token接口不需要验证token
    if (config.url?.includes('/auth/login') || config.url?.includes('/auth/refresh')) {
      logger.debug('🔐 登录/刷新接口，跳过token验证')
      return config
    }
    
    const token = tokenManager.getToken()
    
    // 如果有token就使用，没有token也不阻止请求（让后端返回401，然后自动刷新）
    if (token && isValidToken(token)) {
      logger.debug('📤 发送请求，使用 token:', token.substring(0, 20) + '...')
      
      if (config.headers) {
        config.headers.Authorization = `Bearer ${token}`
      }
    } else {
      logger.debug('⚠️ Token 无效或不存在，发送请求让后端处理')
    }
    
    return config
  },
  (error) => {
    console.error('❌ 请求拦截器错误:', error)
    return Promise.reject(error)
  }
)

// 响应拦截器
request.interceptors.response.use(
  (response: AxiosResponse) => {
    const { data } = response
    
    // 如果是blob响应，直接返回整个response对象
    if (response.config.responseType === 'blob') {
      return response
    }
    
    // 如果是登录接口，使用 tokenManager 保存 token
    if (response.config.url?.includes('/auth/login')) {
      const loginData = data as LoginResponse
      if (loginData.code === 200 && loginData.data) {
        logger.debug('🔐 登录成功，保存 token 信息')
        
        // 使用 tokenManager 保存 token 信息
        const tokenInfo = {
          token: loginData.data.token,
          refreshToken: loginData.data.refreshToken,
          tokenType: loginData.data.tokenType,
          expiresIn: loginData.data.expiresIn,
          issuedAt: Date.now()
        }
        
        // 检查是否启用了自动登录（从localStorage检查）
        const rememberMe = localStorage.getItem('autoLogin') === 'true'
        tokenManager.saveToken(tokenInfo, rememberMe)
        
        logger.debug('💾 Token 已保存到 tokenManager')
      }
    }
    
    return data
  },
  async (error) => {
    const originalRequest = error.config

    if (error.response) {
      const { status } = error.response
      
      logger.debug(`📥 收到响应，状态码: ${status}`)
      
      // 401 未授权，尝试刷新token
      if (status === 401 && !originalRequest._retry) {
        logger.debug('🔑 收到 401 错误，尝试刷新 token...')
        
        if (isRefreshing) {
          logger.debug('⏳ Token 正在刷新中，将请求加入队列')
          // 如果正在刷新，将请求加入队列
          return new Promise((resolve, reject) => {
            addToQueue(resolve, reject, originalRequest)
          })
        }

        originalRequest._retry = true
        isRefreshing = true

        try {
          const newToken = await refreshToken()
          isRefreshing = false
          
          if (!isValidToken(newToken)) {
            console.error('❌ 刷新后的 token 仍然无效')
            throw new Error('刷新后的 token 无效')
          }
          
          logger.debug('🔄 处理队列中的请求...')
          // 处理队列中的请求
          processQueue(null, newToken)
          
          // 重试原始请求
          logger.debug('🔄 重试原始请求...')
          originalRequest.headers.Authorization = `Bearer ${newToken}`
          return request(originalRequest)
        } catch (refreshError) {
          isRefreshing = false
          console.error('❌ Token 刷新失败:', refreshError)
          
          // 处理队列中的请求（全部失败）
          processQueue(refreshError, null)
          
          // 不跳转登录页，让用户继续使用（refreshToken可能还没过期）
          logger.debug('⚠️ Token 刷新失败，但不跳转登录页，让用户继续使用')
          return Promise.reject(refreshError)
        }
      }
      
      // 403 禁止访问
      if (status === 403) {
        console.error('🚫 权限不足')
      }
    }
    
    return Promise.reject(error)
  }
)

// 封装GET请求
export const $get = <T = unknown>(url: string, params?: Record<string, unknown>): Promise<T> => {
  return request.get(url, { params })
}

// 封装POST请求
export const $post = <T = unknown>(
    url: string,
    data?: unknown,
    config?: AxiosRequestConfig
): Promise<T> => {
    // 确保 headers 不会被默认值覆盖
    const mergedConfig = {
        ...config,
        headers: {
            ...config?.headers,
            // 如果 data 是 FormData，强制设置 Content-Type
            'Content-Type': data instanceof FormData
                ? 'multipart/form-data'
                : 'application/json',
        },
    };

    // 确保 responseType 不被覆盖
    if (config?.responseType) {
        mergedConfig.responseType = config.responseType;
    }
    return request.post(url, data, mergedConfig);
};

// 封装PUT请求
export const $put = <T = unknown>(url: string, data?: unknown): Promise<T> => {
  return request.put(url, data)
}

// 封装DELETE请求
export const $delete = <T = unknown>(url: string, data?: unknown): Promise<T> => {
  return request.delete(url, { data })
}

export default request
