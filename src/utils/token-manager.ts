/**
 * Token 管理工具
 * 负责 token 的存储、刷新、过期检查等
 */

import { config } from '@/config/env'
import { logger } from './logger'

export interface TokenInfo {
  token: string
  refreshToken: string
  tokenType: string
  expiresIn: number
  issuedAt: number
}

export interface RefreshResponse {
  code: number
  message: string
  data: {
    accessToken: string        // 改为 accessToken，与后端一致
    refreshToken: string
    tokenType: string
    expiresIn: number
  }
}

class TokenManager {
  private static instance: TokenManager
  private refreshPromise: Promise<string> | null = null
  private refreshCallbacks: Array<(token: string) => void> = []
  private autoRefreshTimer: number | null = null  // 添加定时器引用

  private constructor() {}

  public static getInstance(): TokenManager {
    if (!TokenManager.instance) {
      TokenManager.instance = new TokenManager()
    }
    return TokenManager.instance
  }

  /**
   * 获取后端基础URL
   */
  private getBaseURL(): string {
    // 使用统一的配置，与 request.ts 保持一致
    return config.api.baseURL
  }

  /**
   * 保存 token 信息，支持自动登录
   */
  public saveToken(tokenInfo: TokenInfo, rememberMe: boolean = false): void {
    const tokenData = {
      ...tokenInfo,
      issuedAt: Date.now()
    }
    
    // 根据是否记住我选择存储方式
    const storage = rememberMe ? localStorage : sessionStorage
    
    storage.setItem('token', tokenData.token)
    storage.setItem('refreshToken', tokenData.refreshToken)
    storage.setItem('tokenInfo', JSON.stringify(tokenData))
    
    // 保存自动登录设置
    if (rememberMe) {
      localStorage.setItem('autoLogin', 'true')
    } else {
      localStorage.removeItem('autoLogin')
    }
  }

  /**
   * 获取当前 token（优先从localStorage获取，支持自动登录）
   */
  public getToken(): string | null {
    return localStorage.getItem('token') || sessionStorage.getItem('token')
  }

  /**
   * 获取 refresh token（优先从localStorage获取，支持自动登录）
   */
  public getRefreshToken(): string | null {
    return localStorage.getItem('refreshToken') || sessionStorage.getItem('refreshToken')
  }

  /**
   * 检查是否启用了自动登录
   */
  public isAutoLoginEnabled(): boolean {
    return localStorage.getItem('autoLogin') === 'true'
  }

  /**
   * 检查 token 是否即将过期（提前5分钟刷新）
   */
  public isTokenExpiringSoon(): boolean {
    // 优先从localStorage获取（支持自动登录），然后从sessionStorage获取
    const tokenInfoStr = localStorage.getItem('tokenInfo') || sessionStorage.getItem('tokenInfo')
    if (!tokenInfoStr) return true

    try {
      const tokenInfo: TokenInfo = JSON.parse(tokenInfoStr)
      const now = Date.now()
      const expiresAt = tokenInfo.issuedAt + (tokenInfo.expiresIn * 1000)
      const fiveMinutes = 5 * 60 * 1000

      return (expiresAt - now) < fiveMinutes
    } catch {
      return true
    }
  }

  /**
   * 检查 token 是否已过期
   */
  public isTokenExpired(): boolean {
    // 优先从localStorage获取（支持自动登录），然后从sessionStorage获取
    const tokenInfoStr = localStorage.getItem('tokenInfo') || sessionStorage.getItem('tokenInfo')
    if (!tokenInfoStr) return true

    try {
      const tokenInfo: TokenInfo = JSON.parse(tokenInfoStr)
      const now = Date.now()
      const expiresAt = tokenInfo.issuedAt + (tokenInfo.expiresIn * 1000)

      return now >= expiresAt
    } catch {
      return true
    }
  }

  /**
   * 刷新 token
   */
  public async refreshToken(): Promise<string> {
    // 如果已经在刷新中，返回现有的 promise
    if (this.refreshPromise) {
      return this.refreshPromise
    }

    this.refreshPromise = this.performRefresh()
    
    try {
      const newToken = await this.refreshPromise
      // 通知所有等待的调用者
      this.refreshCallbacks.forEach(callback => callback(newToken))
      this.refreshCallbacks = []
      return newToken
    } finally {
      this.refreshPromise = null
    }
  }

  /**
   * 执行实际的刷新操作
   */
  private async performRefresh(): Promise<string> {
    const refreshToken = this.getRefreshToken()
    if (!refreshToken) {
      throw new Error('没有可用的刷新token')
    }

    try {
      const response = await fetch(`${this.getBaseURL()}/v1/auth/refresh`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ refreshToken })
      })

      const data: RefreshResponse = await response.json()

      if (data.code === 200 && data.data) {
        const newTokenInfo: TokenInfo = {
          token: data.data.accessToken, // 使用 accessToken
          refreshToken: data.data.refreshToken,
          tokenType: data.data.tokenType,
          expiresIn: data.data.expiresIn,
          issuedAt: Date.now()
        }

        // 保持原有的存储策略（自动登录设置）
        const rememberMe = this.isAutoLoginEnabled()
        this.saveToken(newTokenInfo, rememberMe)
        return newTokenInfo.token
      } else {
        throw new Error(data.message || '刷新token失败')
      }
    } catch (error) {
      this.clearTokens()
      throw error
    }
  }

  /**
   * 等待 token 刷新完成
   */
  public waitForRefresh(): Promise<string> {
    return new Promise((resolve, reject) => {
      if (this.refreshPromise) {
        this.refreshPromise
          .then(resolve)
          .catch(reject)
      } else {
        // 如果没有在刷新，直接尝试刷新
        this.refreshToken()
          .then(resolve)
          .catch(reject)
      }
    })
  }

  /**
   * 设置定时刷新（可选）
   */
  public setupAutoRefresh(): void {
    // 如果已经有定时器在运行，先清理
    this.clearAutoRefresh()
    
    // 每分钟检查一次 token 状态
    this.autoRefreshTimer = setInterval(() => {
      if (this.isTokenExpiringSoon() && !this.isTokenExpired()) {
        logger.debug('Token即将过期，自动刷新...')
        this.refreshToken().catch(error => {
          console.error('自动刷新token失败:', error)
        })
      }
    }, 60000) // 1分钟检查一次
  }

  /**
   * 清理自动刷新定时器
   */
  public clearAutoRefresh(): void {
    if (this.autoRefreshTimer) {
      clearInterval(this.autoRefreshTimer)
      this.autoRefreshTimer = null
    }
  }

  /**
   * 清除所有 token（包括自动登录设置）
   */
  public clearTokens(): void {
    // 清理定时器
    this.clearAutoRefresh()
    
    // 清除所有存储
    sessionStorage.removeItem('token')
    sessionStorage.removeItem('refreshToken')
    sessionStorage.removeItem('tokenInfo')
    sessionStorage.removeItem('userInfo')
    
    localStorage.removeItem('token')
    localStorage.removeItem('refreshToken')
    localStorage.removeItem('tokenInfo')
    localStorage.removeItem('userInfo')
    localStorage.removeItem('autoLogin')
  }

  /**
   * 获取 token 的剩余有效期（毫秒）
   */
  public getTokenTimeRemaining(): number {
    // 优先从localStorage获取（支持自动登录），然后从sessionStorage获取
    const tokenInfoStr = localStorage.getItem('tokenInfo') || sessionStorage.getItem('tokenInfo')
    if (!tokenInfoStr) return 0

    try {
      const tokenInfo: TokenInfo = JSON.parse(tokenInfoStr)
      const now = Date.now()
      const expiresAt = tokenInfo.issuedAt + (tokenInfo.expiresIn * 1000)
      
      return Math.max(0, expiresAt - now)
    } catch {
      return 0
    }
  }

  /**
   * 验证token是否有效
   */
  public async validateToken(): Promise<boolean> {
    const token = this.getToken()
    if (!token) return false
    
    // 检查token是否过期
    if (this.isTokenExpired()) {
      // 如果过期了，尝试刷新
      try {
        await this.refreshToken()
        return true
      } catch (error) {
        console.error('Token验证失败，刷新也失败:', error)
        return false
      }
    }
    
    // 检查是否即将过期
    if (this.isTokenExpiringSoon()) {
      // 如果即将过期，主动刷新
      try {
        await this.refreshToken()
        return true
      } catch (error) {
        console.error('Token即将过期，刷新失败:', error)
        return false
      }
    }
    
    return true
  }
}

export default TokenManager.getInstance()
