import type { NavigationGuardNext, RouteLocationNormalized } from 'vue-router'
import { logger } from '@/utils/logger'

export const authGuard = (
  to: RouteLocationNormalized,
  from: RouteLocationNormalized,
  next: NavigationGuardNext
) => {
  // 设置页面标题
  if (to.meta.title) {
    document.title = `${to.meta.title} | 督导管理系统`
  }

  // 防止无限重定向
  if (to.path === from.path) {
    logger.debug('🚫 检测到相同路径重定向，阻止无限循环')
    next(false)
    return
  }

  // 认证逻辑 - 优先检查localStorage（自动登录）
  const token = localStorage.getItem('token') || sessionStorage.getItem('token')
  const userInfo = localStorage.getItem('userInfo') || sessionStorage.getItem('userInfo')
  
  const isAuthenticated = !!(token && userInfo)
  
  logger.debug(`🔐 认证检查：路径=${to.path}, 已认证=${isAuthenticated}, token=${!!token}, userInfo=${!!userInfo}`)
  
  // 检查是否需要认证
  if (to.meta.requiresAuth && !isAuthenticated) {
    logger.debug('🚫 需要认证但用户未登录，重定向到登录页')
    next('/login')
  } else if (to.path === '/login' && isAuthenticated) {
    // 已登录用户访问登录页，重定向到仪表板
    logger.debug('🔄 已登录用户访问登录页，重定向到仪表板')
    next('/dashboard')
  } else {
    next()
  }
} 