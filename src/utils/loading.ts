/**
 * 统一 Loading 管理工具
 * 用于统一管理全屏加载状态
 */
import { ElLoading } from 'element-plus'

let loadingInstance: ReturnType<typeof ElLoading.service> | null = null

/**
 * 显示加载状态
 * @param text 加载提示文本
 */
export const showLoading = (text = '加载中...') => {
  if (!loadingInstance) {
    loadingInstance = ElLoading.service({
      lock: true,
      text,
      background: 'rgba(0, 0, 0, 0.7)'
    })
  } else {
    // 如果已存在，更新文本
    loadingInstance.setText?.(text)
  }
}

/**
 * 隐藏加载状态
 */
export const hideLoading = () => {
  if (loadingInstance) {
    loadingInstance.close()
    loadingInstance = null
  }
}

/**
 * 使用异步函数包装器（自动显示/隐藏加载）
 * @param fn 异步函数
 * @param loadingText 加载提示文本
 */
export const withLoading = async <T>(
  fn: () => Promise<T>,
  loadingText = '加载中...'
): Promise<T> => {
  showLoading(loadingText)
  try {
    const result = await fn()
    return result
  } finally {
    hideLoading()
  }
}

