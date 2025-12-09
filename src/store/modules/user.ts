import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { authAPI } from '../../api/index'
import tokenManager, { type TokenInfo } from '../../utils/token-manager'
import { logger } from '@/utils/logger'

// 用户信息类型
interface UserInfo {
  id: string
  username: string
  realName: string
  roles: string[]
  permissions: string[]
}

// 登录状态类型
interface LoginState {
  token: string | null
  refreshToken: string | null
  userInfo: UserInfo | null
  isAuthenticated: boolean
}

export const useUserStore = defineStore('user', () => {
  // 状态
  const token = ref<string | null>(tokenManager.getToken())
  const refreshToken = ref<string | null>(tokenManager.getRefreshToken())
  const userInfo = ref<UserInfo | null>(null)
  const loading = ref(false)

  // 计算属性
  const isAuthenticated = computed(() => {
    return !!(token.value && userInfo.value)
  })

  const userRole = computed(() => {
    return userInfo.value?.roles?.[0] || null
  })

  const userPermissions = computed(() => {
    return userInfo.value?.permissions || []
  })

  // 初始化用户信息（支持自动登录）
  const initializeUser = async () => {
    // 优先从localStorage获取（自动登录）
    let storedUserInfo = localStorage.getItem('userInfo') || sessionStorage.getItem('userInfo')
    
    if (storedUserInfo) {
      try {
        userInfo.value = JSON.parse(storedUserInfo)
        
        // 如果有token，验证是否有效
        if (tokenManager.getToken()) {
          logger.debug('自动登录成功，用户信息已恢复')
        }
      } catch (error) {
        console.error('解析用户信息失败:', error)
        clearUser()
      }
    }
    
    // 设置自动刷新
    tokenManager.setupAutoRefresh()
  }

  // 登录
  const login = async (username: string, password: string, rememberMe: boolean = false) => {
    loading.value = true
    try {
      const response = await authAPI.login({
        username,
        password,
        clientType: 'web'
      }) as any

      if (response.code === 200) {
        // 存储认证信息
        token.value = response.data.token
        refreshToken.value = response.data.refreshToken
        userInfo.value = response.data.userInfo

        // 使用 token 管理器保存，支持自动登录
        const tokenInfo: TokenInfo = {
          token: response.data.token,
          refreshToken: response.data.refreshToken,
          tokenType: response.data.tokenType,
          expiresIn: response.data.expiresIn,
          issuedAt: Date.now()
        }
        tokenManager.saveToken(tokenInfo, rememberMe)

        // 保存用户信息到对应存储
        const storage = rememberMe ? localStorage : sessionStorage
        storage.setItem('userInfo', JSON.stringify(response.data.userInfo))

        return { success: true, message: '登录成功' }
      } else {
        return { success: false, message: response.message || '登录失败' }
      }
    } catch (error: any) {
      console.error('登录失败:', error)
      return { success: false, message: error.message || '登录过程中发生错误' }
    } finally {
      loading.value = false
    }
  }

  // 登出
  const logout = async () => {
    try {
      if (token.value) {
        await authAPI.logout()
      }
    } catch (error) {
      console.error('登出请求失败:', error)
    } finally {
      clearUser()
    }
  }

  // 清除用户信息
  const clearUser = () => {
    token.value = null
    refreshToken.value = null
    userInfo.value = null
    
    // 使用tokenManager清除所有存储（包括自动登录设置）
    tokenManager.clearTokens()
  }

  // 刷新token
  const refreshUserToken = async () => {
    try {
      const newToken = await tokenManager.refreshToken()
      
      // 更新 store 状态
      token.value = newToken
      refreshToken.value = tokenManager.getRefreshToken()
      
      return true
    } catch (error) {
      console.error('刷新token失败:', error)
      clearUser()
      throw error
    }
  }

  // 检查权限
  const hasPermission = (permission: string): boolean => {
    if (!userInfo.value) return false
    return userInfo.value.permissions.includes('*') || 
           userInfo.value.permissions.includes(permission)
  }

  // 检查角色
  const hasRole = (role: string): boolean => {
    if (!userInfo.value) return false
    return userInfo.value.roles.includes(role)
  }

  // 获取 token 剩余时间
  const getTokenTimeRemaining = () => {
    return tokenManager.getTokenTimeRemaining()
  }

  // 检查 token 是否即将过期
  const isTokenExpiringSoon = () => {
    return tokenManager.isTokenExpiringSoon()
  }

  // 检查 token 是否已过期
  const isTokenExpired = () => {
    return tokenManager.isTokenExpired()
  }

  return {
    // 状态
    token,
    refreshToken,
    userInfo,
    loading,
    
    // 计算属性
    isAuthenticated,
    userRole,
    userPermissions,
    
    // 方法
    initializeUser,
    login,
    logout,
    clearUser,
    refreshUserToken,
    hasPermission,
    hasRole,
    getTokenTimeRemaining,
    isTokenExpiringSoon,
    isTokenExpired
  }
})
