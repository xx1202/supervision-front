/**
 * 统一错误处理工具
 * 用于统一处理 API 错误、业务错误等
 * 优先使用后端响应的 message
 */
import { ElMessage, ElMessageBox } from 'element-plus'
import type { AxiosError } from 'axios'
import type { ApiResponse } from '@/types/api'

/**
 * API 错误响应接口
 */
interface ApiErrorResponse {
  code?: number
  message?: string
  data?: {
    message?: string
  }
}

/**
 * 处理 API 错误
 * @param error 错误对象
 * @param defaultMessage 默认错误消息
 * @param showMessage 是否显示消息提示，默认为 true
 */
export const handleApiError = (
  error: unknown,
  defaultMessage = '操作失败，请稍后重试',
  showMessage = true
): string => {
  let message = defaultMessage

  // 处理 Axios 错误
  if (typeof error === 'object' && error !== null) {
    const axiosError = error as AxiosError<ApiErrorResponse>
    
    // 网络错误
    if (axiosError.message === 'Network Error') {
      message = '网络连接失败，请检查网络设置'
    }
    // 超时错误
    else if (axiosError.message?.includes('timeout')) {
      message = '请求超时，请稍后重试'
    }
    // 后端返回的错误
    else if (axiosError.response?.data) {
      const errorData = axiosError.response.data
      message = 
        errorData.message || 
        errorData.data?.message || 
        axiosError.response.statusText || 
        defaultMessage
    }
    // 其他错误
    else if (axiosError.message) {
      message = axiosError.message
    }
  }
  // 处理 Error 对象
  else if (error instanceof Error) {
    message = error.message || defaultMessage
  }
  // 处理字符串错误
  else if (typeof error === 'string') {
    message = error
  }

  // 记录错误日志（开发环境）
  if (import.meta.env.DEV) {
    console.error('API错误:', error)
  }

  // 显示错误提示
  if (showMessage) {
    ElMessage.error(message)
  }

  return message
}

/**
 * 处理业务错误（需要用户确认或特殊处理）
 * @param error 错误对象
 * @param title 错误标题
 * @param onConfirm 确认回调
 */
export const handleBusinessError = (
  error: unknown,
  title = '操作失败',
  onConfirm?: () => void
): void => {
  const message = handleApiError(error, '操作失败', false)
  
  ElMessageBox.alert(message, title, {
    type: 'error',
    confirmButtonText: '确定'
  }).then(() => {
    onConfirm?.()
  }).catch(() => {
    // 用户取消或关闭
  })
}

/**
 * 处理表单验证错误
 * @param error 验证错误对象
 */
export const handleValidationError = (error: unknown): void => {
  if (error instanceof Error) {
    ElMessage.warning(error.message || '表单验证失败，请检查输入')
  } else {
    ElMessage.warning('表单验证失败，请检查输入')
  }
}

/**
 * 处理权限错误
 * @param error 错误对象
 */
export const handlePermissionError = (error?: unknown): void => {
  if (error) {
    handleApiError(error, '权限不足', false)
  }
  ElMessage.warning('您没有执行此操作的权限')
}

/**
 * 处理网络错误（离线检测）
 */
export const handleNetworkError = (): void => {
  if (!navigator.onLine) {
    ElMessage.error('网络连接已断开，请检查网络设置')
  } else {
    ElMessage.error('网络请求失败，请稍后重试')
  }
}

/**
 * 错误消息映射（根据错误码返回友好提示）
 */
const ERROR_MESSAGE_MAP: Record<number | string, string> = {
  400: '请求参数错误',
  401: '未登录或登录已过期，请重新登录',
  403: '权限不足，无法执行此操作',
  404: '请求的资源不存在',
  500: '服务器内部错误，请稍后重试',
  502: '网关错误',
  503: '服务暂时不可用，请稍后重试',
  504: '请求超时，请稍后重试',
  'Network Error': '网络连接失败，请检查网络设置',
  'timeout': '请求超时，请稍后重试'
}

/**
 * 根据错误码获取友好提示
 * @param code 错误码
 * @returns 友好提示消息
 */
export const getErrorMessage = (code: number | string): string => {
  return ERROR_MESSAGE_MAP[code] || '操作失败，请稍后重试'
}

/**
 * 从 API 响应中提取消息（优先使用后端响应的 message）
 * @param response API 响应对象
 * @param defaultMessage 默认消息（当响应中没有 message 时使用）
 * @returns 消息字符串
 */
export const getResponseMessage = <T = any>(
  response: ApiResponse<T> | any,
  defaultMessage?: string
): string => {
  // 优先使用后端响应的 message
  if (response?.message) {
    return response.message
  }
  
  // 如果没有 message，使用默认消息
  return defaultMessage || '操作成功'
}

/**
 * 显示成功消息（优先使用后端响应的 message）
 * @param response API 响应对象
 * @param defaultMessage 默认成功消息
 */
export const showSuccessMessage = <T = any>(
  response: ApiResponse<T> | any,
  defaultMessage = '操作成功'
): void => {
  const message = getResponseMessage(response, defaultMessage)
  ElMessage.success(message)
}

/**
 * 显示错误消息（优先使用后端响应的 message）
 * @param error 错误对象或响应对象
 * @param defaultMessage 默认错误消息
 */
export const showErrorMessage = (
  error: unknown,
  defaultMessage = '操作失败，请稍后重试'
): void => {
  // 如果是 API 响应对象（code !== 200）
  if (typeof error === 'object' && error !== null) {
    const response = error as any
    if (response?.code !== undefined && response?.message) {
      ElMessage.error(response.message)
      return
    }
  }
  
  // 使用统一的错误处理
  handleApiError(error, defaultMessage, true)
}

