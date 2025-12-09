/**
 * 通知工具函数
 * 优先使用浏览器原生 Notification API，如果不可用则降级到 ElNotification
 */

import { ElNotification } from 'element-plus'
import { logger } from './logger'

/**
 * 检查浏览器是否支持原生 Notification API
 */
export function isNotificationSupported(): boolean {
  return 'Notification' in window
}

/**
 * 获取当前通知权限状态
 */
export function getNotificationPermission(): NotificationPermission {
  if (!isNotificationSupported()) {
    return 'denied'
  }
  return Notification.permission
}

/**
 * 请求通知权限
 * @returns Promise<boolean> 是否获得权限
 */
export async function requestNotificationPermission(): Promise<boolean> {
  if (!isNotificationSupported()) {
    console.warn('浏览器不支持原生 Notification API')
    return false
  }

  // 如果已经有权限，直接返回
  if (Notification.permission === 'granted') {
    return true
  }

  // 如果已经被拒绝，无法再次请求
  if (Notification.permission === 'denied') {
    console.warn('通知权限已被拒绝，无法再次请求')
    return false
  }

  try {
    // 请求权限
    const permission = await Notification.requestPermission()
    return permission === 'granted'
  } catch (error) {
    console.error('请求通知权限失败:', error)
    return false
  }
}

/**
 * 扩展的NotificationOptions类型，包含自定义属性
 */
interface ExtendedNotificationOptions extends NotificationOptions {
  body: string
  timestamp?: number
  duration?: number
}

/**
 * 显示浏览器原生通知
 */
function showNativeNotification(
  title: string,
  options: ExtendedNotificationOptions
): Notification | null {
  if (!isNotificationSupported()) {
    return null
  }

  if (Notification.permission !== 'granted') {
    return null
  }

  try {
    // 提取标准NotificationOptions属性
    const { timestamp, duration, ...standardOptions } = options
    const notification = new Notification(title, {
      icon: standardOptions.icon || '/favicon.ico',
      badge: standardOptions.badge || '/favicon.ico',
      body: standardOptions.body,
      tag: standardOptions.tag, // 相同 tag 的通知会被替换
      requireInteraction: standardOptions.requireInteraction || false,
      silent: standardOptions.silent || false,
      ...standardOptions
    })

    // 自动关闭通知（默认 5 秒）
    const notificationDuration = duration || 5000
    if (notificationDuration > 0) {
      setTimeout(() => {
        notification.close()
      }, notificationDuration)
    }

    return notification
  } catch (error) {
    console.error('显示原生通知失败:', error)
    return null
  }
}

/**
 * 显示通知（优先使用原生 Notification，降级到 ElNotification）
 * @param title 通知标题
 * @param message 通知内容
 * @param options 通知选项
 */
export async function showNotification(
  title: string,
  message: string,
  options: {
    type?: 'success' | 'warning' | 'info' | 'error'
    duration?: number
    onClick?: () => void
    icon?: string
    tag?: string
  } = {}
): Promise<void> {
  const {
    type = 'info',
    duration = 5000,
    onClick,
    icon,
    tag
  } = options

  // 尝试使用原生 Notification
  if (isNotificationSupported()) {
    // 检查权限
    let hasPermission = Notification.permission === 'granted'
    
    // 如果没有权限，尝试请求
    if (!hasPermission && Notification.permission === 'default') {
      hasPermission = await requestNotificationPermission()
    }

    // 如果有权限，使用原生通知
    if (hasPermission) {
      const notification = showNativeNotification(title, {
        body: message,
        icon: icon || '/favicon.ico',
        tag: tag || `notification-${Date.now()}`,
        timestamp: Date.now(),
        duration,
        requireInteraction: false,
        silent: false
      })

      // 如果原生通知创建成功，设置点击事件
      if (notification && onClick) {
        notification.onclick = (event) => {
          event.preventDefault()
          onClick()
          notification.close()
          // 聚焦到窗口
          window.focus()
        }
      }

      // 原生通知创建成功，直接返回
      if (notification) {
        logger.debug('✓ 使用浏览器原生 Notification API 显示通知')
        return
      }
    }
  }

  // 降级到 ElNotification
  logger.debug('降级到 ElNotification 显示通知')
  ElNotification({
    title,
    message,
    type,
    duration,
    position: 'top-right',
    onClick: onClick
  })
}

/**
 * 初始化通知权限（在应用启动时调用）
 * 可以提前请求权限，避免在显示通知时延迟
 */
export async function initializeNotificationPermission(): Promise<void> {
  if (!isNotificationSupported()) {
    logger.debug('浏览器不支持原生 Notification API，将使用 ElNotification')
    return
  }

  // 如果权限是 default，可以提前请求
  if (Notification.permission === 'default') {
    logger.debug('检测到通知权限未设置，尝试请求权限...')
    const granted = await requestNotificationPermission()
    if (granted) {
      logger.debug('✓ 通知权限已授予')
    } else {
      logger.debug('通知权限未授予，将使用 ElNotification 作为降级方案')
    }
  } else if (Notification.permission === 'granted') {
    logger.debug('✓ 通知权限已授予')
  } else {
    logger.debug('通知权限已被拒绝，将使用 ElNotification 作为降级方案')
  }
}

