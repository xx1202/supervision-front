/**
 * WebSocket 服务
 * 使用 STOMP 协议管理 WebSocket 连接
 */

import { Client } from '@stomp/stompjs'
import type { StompSubscription, Message } from '@stomp/stompjs'
import SockJS from 'sockjs-client'
import tokenManager from './token-manager'
import { config } from '@/config/env'
import { logger } from './logger'

export type NotificationCallback = (message: any) => void

class WebSocketService {
  private static instance: WebSocketService
  private client: Client | null = null
  private subscriptions: Map<string, StompSubscription> = new Map()
  private reconnectAttempts = 0
  private maxReconnectAttempts = 5
  private reconnectDelay = 3000
  private isConnecting = false
  private messageCallbacks: NotificationCallback[] = []

  private constructor() {}

  public static getInstance(): WebSocketService {
    if (!WebSocketService.instance) {
      WebSocketService.instance = new WebSocketService()
    }
    return WebSocketService.instance
  }

  /**
   * 获取 WebSocket URL
   * 注意：SockJS 需要使用 http:// 或 https:// 协议，而不是 ws:// 或 wss://
   * SockJS 会在内部处理 WebSocket 连接的降级
   */
  private getWebSocketURL(): string {
    // 使用统一的配置，SockJS 需要使用 HTTP/HTTPS 协议
    const baseURL = config.api.baseURL
    // 直接使用 baseURL，不转换协议（SockJS 需要 http/https）
    return `${baseURL}/ws/notification`
  }

  /**
   * 建立 WebSocket 连接
   */
  public connect(): Promise<void> {
    return new Promise((resolve, reject) => {
      // 如果已经连接或正在连接，直接返回
      if (this.client?.connected) {
        logger.debug('WebSocket 已连接')
        resolve()
        return
      }

      if (this.isConnecting) {
        logger.debug('WebSocket 正在连接中...')
        return
      }

      this.isConnecting = true

      // 获取 token
      const token = tokenManager.getToken()
      if (!token) {
        console.error('无法连接 WebSocket: 未找到认证 token')
        this.isConnecting = false
        reject(new Error('未找到认证 token'))
        return
      }

      // 创建 STOMP 客户端
      this.client = new Client({
        webSocketFactory: () => new SockJS(this.getWebSocketURL()),
        connectHeaders: {
          Authorization: `Bearer ${token}`
        },
        debug: (str) => {
          logger.debug('STOMP Debug:', str)
        },
        reconnectDelay: this.reconnectDelay,
        heartbeatIncoming: 4000,
        heartbeatOutgoing: 4000,

        onConnect: (frame) => {
          logger.debug('WebSocket 连接成功')
          logger.debug('连接信息:', frame)
          logger.debug('当前订阅列表:', Array.from(this.subscriptions.keys()))
          this.isConnecting = false
          this.reconnectAttempts = 0
          resolve()
        },

        onStompError: (frame) => {
          console.error('STOMP 错误:', frame.headers['message'])
          console.error('详细信息:', frame.body)
          this.isConnecting = false
          reject(new Error(frame.headers['message']))
        },

        onWebSocketError: (event) => {
          console.error('WebSocket 错误:', event)
          this.isConnecting = false
        },

        onDisconnect: () => {
          logger.debug('WebSocket 断开连接')
          this.isConnecting = false
          this.handleDisconnect()
        }
      })

      // 激活连接
      this.client.activate()
    })
  }

  /**
   * 处理断开连接
   */
  private handleDisconnect(): void {
    // 清除所有订阅
    this.subscriptions.clear()

    // 尝试重连
    if (this.reconnectAttempts < this.maxReconnectAttempts) {
      this.reconnectAttempts++
      logger.debug(`尝试重连 (${this.reconnectAttempts}/${this.maxReconnectAttempts})...`)
      
      setTimeout(() => {
        this.connect().catch((error) => {
          console.error('重连失败:', error)
        })
      }, this.reconnectDelay * this.reconnectAttempts)
    } else {
      console.error('达到最大重连次数，停止重连')
    }
  }

  /**
   * 断开 WebSocket 连接
   */
  public disconnect(): void {
    if (this.client) {
      // 取消所有订阅
      this.subscriptions.forEach((subscription) => {
        subscription.unsubscribe()
      })
      this.subscriptions.clear()

      // 断开连接
      this.client.deactivate()
      this.client = null
      this.reconnectAttempts = 0
      logger.debug('WebSocket 已断开')
    }
  }

  /**
   * 订阅用户通知频道
   * 注意：Spring WebSocket 的用户目标前缀机制
   * - 后端使用 convertAndSendToUser(username, "/queue/notifications", message) 推送
   * - 前端应该订阅 "/user/queue/notifications"，Spring 会自动将其转换为 "/user/{username}/queue/notifications"
   * - 不需要在订阅路径中包含 username
   */
  public subscribe(username: string, callback: NotificationCallback): void {
    if (!this.client?.connected) {
      console.error('WebSocket 未连接，无法订阅')
      return
    }

    // Spring WebSocket 的用户目标前缀机制：
    // 前端订阅 "/user/queue/notifications"，Spring 会自动将其转换为 "/user/{username}/queue/notifications"
    // 其中 username 是 WebSocket 连接时认证的 Principal name
    const destination = `/user/queue/notifications`

    // 如果已经订阅过，先取消订阅
    if (this.subscriptions.has(destination)) {
      this.unsubscribe(destination)
    }

    // 订阅频道
    const subscription = this.client.subscribe(destination, (message: Message) => {
      try {
        logger.debug('收到WebSocket消息:', {
          destination: message.headers.destination,
          body: message.body,
          headers: message.headers
        })
        const notification = JSON.parse(message.body)
        logger.debug('解析后的通知:', notification)
        
        // 调用回调函数
        callback(notification)
        
        // 调用所有注册的回调
        this.messageCallbacks.forEach(cb => cb(notification))
      } catch (error) {
        console.error('解析通知消息失败:', error, message.body)
      }
    })

    this.subscriptions.set(destination, subscription)
    logger.debug(`✓ 已订阅通知频道: ${destination} (Spring会自动转换为 /user/${username}/queue/notifications)`)
    logger.debug(`当前所有订阅:`, Array.from(this.subscriptions.keys()))
  }

  /**
   * 取消订阅
   */
  public unsubscribe(destination: string): void {
    const subscription = this.subscriptions.get(destination)
    if (subscription) {
      subscription.unsubscribe()
      this.subscriptions.delete(destination)
      logger.debug(`已取消订阅: ${destination}`)
    }
  }

  /**
   * 注册消息回调
   */
  public onMessage(callback: NotificationCallback): void {
    this.messageCallbacks.push(callback)
  }

  /**
   * 移除消息回调
   */
  public offMessage(callback: NotificationCallback): void {
    const index = this.messageCallbacks.indexOf(callback)
    if (index > -1) {
      this.messageCallbacks.splice(index, 1)
    }
  }

  /**
   * 检查连接状态
   */
  public isConnected(): boolean {
    return this.client?.connected || false
  }

  /**
   * 发送消息（可选功能）
   */
  public send(destination: string, body: any): void {
    if (!this.client?.connected) {
      console.error('WebSocket 未连接，无法发送消息')
      return
    }

    this.client.publish({
      destination,
      body: JSON.stringify(body)
    })
  }
}

export default WebSocketService.getInstance()
