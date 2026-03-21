import type { NavigationGuardNext, RouteLocationNormalized } from 'vue-router'
import type { NavigationGuard } from 'vue-router'
import { checkPagePermission, getUserInfo } from '@/utils/permission'
import { ElMessage, ElMessageBox } from 'element-plus'
import tokenManager from '@/utils/token-manager'
import { logger } from '@/utils/logger'

export const permissionGuard: NavigationGuard = async (to, from) => {
  if (!to.meta.requiresAuth) {
    return true
  }

  const user = getUserInfo()
  
  if (!user) {
    logger.debug('🚫 权限检查：用户未登录，交给auth-guard处理')
    return true
  }

  try {
    const hasPagePermission = checkPagePermission(to.path, user)
    
    if (!hasPagePermission) {
      logger.debug(`🚫 用户 ${user.realName} 没有访问权限`)
      ElMessage.error('抱歉，您没有权限访问此页面。')
      return false
    }
    
    logger.debug(`✅ 用户 ${user.realName} 通过权限检查`)
    return true
  } catch (error) {
    console.error('权限检查失败:', error)
    tokenManager.clearTokens()
    return '/login'
  }
}