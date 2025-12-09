/**
 * 通知状态管理
 */

import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { ElNotification } from 'element-plus'
import { notificationAPI } from '@/api/notification'
import websocketService from '@/utils/websocketService'
import { showNotification } from '@/utils/notification'
import type { Notification, NotificationQueryParams, NotificationType } from '@/types/notification'
import { convertNotification } from '@/types/notification'
import { logger } from '@/utils/logger'

export const useNotificationStore = defineStore('notification', () => {
  // 状态
  const notifications = ref<Notification[]>([])
  const unreadCount = ref<number>(0)
  const loading = ref<boolean>(false)
  const total = ref<number>(0)
  const currentPage = ref<number>(1)
  const pageSize = ref<number>(10)

  // 计算属性
  const hasUnread = computed(() => unreadCount.value > 0)
  
  const unreadNotifications = computed(() => 
    notifications.value.filter(n => !n.isRead)
  )

  const readNotifications = computed(() => 
    notifications.value.filter(n => n.isRead)
  )

  /**
   * 初始化通知服务
   * 注意：订阅时需要使用username，因为WebSocket连接时使用的是username
   * @param userId 用户ID（用于查询未读通知等，但订阅时需要使用username）
   */
  const initializeNotifications = async (userId: string) => {
    try {
      // 连接 WebSocket
      await websocketService.connect()
      
      // 从userStore获取username（WebSocket认证时使用的是username）
      const { useUserStore } = await import('./user')
      const userStore = useUserStore()
      const username = userStore.userInfo?.username
      
      logger.debug('通知服务初始化 - 用户信息:', {
        userId: userId,
        username: username,
        userInfo: userStore.userInfo
      })
      
      if (!username) {
        console.error('✗ 无法获取username，通知服务初始化失败')
        return
      }
      
      // 订阅用户通知频道
      // 注意：Spring WebSocket 的用户目标前缀机制
      // - 前端订阅 "/user/queue/notifications"，Spring 会自动将其转换为 "/user/{username}/queue/notifications"
      // - 其中 username 是 WebSocket 连接时认证的 Principal name
      // - 后端使用 convertAndSendToUser(username, "/queue/notifications", message) 推送
      const subscribePath = `/user/queue/notifications`
      logger.debug('准备订阅通知频道:', subscribePath)
      logger.debug('Spring会自动转换为: /user/' + username + '/queue/notifications')
      websocketService.subscribe(username, handleNewNotification)
      
      // 加载未读数量（使用userId）
      await fetchUnreadCount()
      
      // 加载通知历史（使用userId）
      await fetchNotifications({ page: 1, size: pageSize.value })
      
      logger.debug('✓ 通知服务初始化成功')
      logger.debug('订阅路径:', subscribePath)
      logger.debug('实际路由路径: /user/' + username + '/queue/notifications')
      logger.debug('用户ID:', userId)
      logger.debug('用户名:', username)
    } catch (error) {
      console.error('通知服务初始化失败:', error)
    }
  }

  /**
   * 处理新通知
   */
  const handleNewNotification = (notification: any) => {
    // 转换通知格式（后端格式 -> 前端格式）
    const convertedNotification = convertNotification(notification)
    
    // 添加到通知列表
    addNotification(convertedNotification)
    
    // 显示通知弹窗
    showNotificationPopup(convertedNotification)
  }

  /**
   * 添加新通知
   */
  const addNotification = (notification: Notification) => {
    // 检查是否已存在
    const exists = notifications.value.some(n => n.id === notification.id)
    if (!exists) {
      notifications.value.unshift(notification)
      
      // 如果是未读通知，增加未读数量
      if (!notification.isRead) {
        unreadCount.value++
      }
    }
  }

  /**
   * 显示通知弹窗
   * 优先使用浏览器原生 Notification API，如果不可用则降级到 ElNotification
   */
  const showNotificationPopup = async (notification: Notification) => {
    const typeMap: Record<NotificationType, string> = {
      SUPERVISION_TASK: '督导任务',
      APPROVAL_REMINDER: '审批提醒',
      LEAVE_NOTICE: '请假通知',
      MOVEMENT_NOTICE: '异动通知',
      SYSTEM_ANNOUNCEMENT: '系统公告'
    }

    const title = typeMap[notification.type] || '新通知'
    const message = notification.content

    // 使用统一的通知函数，优先使用原生 Notification，降级到 ElNotification
    await showNotification(title, message, {
      type: 'info',
      duration: 5000,
      onClick: () => {
        // 点击通知时标记为已读
        markAsRead(notification.id)
      },
      tag: `notification-${notification.id}` // 使用通知ID作为tag，相同ID的通知会被替换
    })
  }

  /**
   * 获取通知历史
   */
  const fetchNotifications = async (params: NotificationQueryParams = {}) => {
    loading.value = true
    try {
      const response = await notificationAPI.getNotifications({
        page: params.page || currentPage.value,
        size: params.size || pageSize.value,
        ...params
      })

      if (response.code === 200 && response.data) {
        // 转换通知格式（后端格式 -> 前端格式）
        notifications.value = response.data.records.map((n: any) => convertNotification(n))
        total.value = response.data.total
        currentPage.value = response.data.current
        pageSize.value = response.data.size
      }
    } catch (error) {
      console.error('获取通知列表失败:', error)
      ElNotification({
        title: '错误',
        message: '获取通知列表失败',
        type: 'error'
      })
    } finally {
      loading.value = false
    }
  }

  /**
   * 获取未读数量
   */
  const fetchUnreadCount = async () => {
    try {
      const response = await notificationAPI.getUnreadCount()
      if (response.code === 200) {
        unreadCount.value = response.data
      }
    } catch (error) {
      console.error('获取未读数量失败:', error)
    }
  }

  /**
   * 标记为已读
   */
  const markAsRead = async (id: string) => {
    try {
      const response = await notificationAPI.markAsRead(id)
      if (response.code === 200) {
        // 更新本地状态
        const notification = notifications.value.find(n => n.id === id)
        if (notification && !notification.isRead) {
          notification.isRead = true
          notification.readTime = new Date().toISOString()
          unreadCount.value = Math.max(0, unreadCount.value - 1)
        }
      }
    } catch (error) {
      console.error('标记已读失败:', error)
      ElNotification({
        title: '错误',
        message: '标记已读失败',
        type: 'error'
      })
    }
  }

  /**
   * 标记所有为已读
   */
  const markAllAsRead = async () => {
    try {
      const response = await notificationAPI.markAllAsRead()
      if (response.code === 200) {
        // 更新本地状态
        notifications.value.forEach(n => {
          if (!n.isRead) {
            n.isRead = true
            n.readTime = new Date().toISOString()
          }
        })
        unreadCount.value = 0
        
        ElNotification({
          title: '成功',
          message: '已标记所有通知为已读',
          type: 'success'
        })
      }
    } catch (error) {
      console.error('标记所有已读失败:', error)
      ElNotification({
        title: '错误',
        message: '标记所有已读失败',
        type: 'error'
      })
    }
  }

  /**
   * 删除通知
   */
  const deleteNotification = async (id: string) => {
    try {
      const response = await notificationAPI.deleteNotification(id)
      if (response.code === 200) {
        // 从列表中移除
        const index = notifications.value.findIndex(n => n.id === id)
        if (index > -1) {
          const notification = notifications.value[index]
          notifications.value.splice(index, 1)
          
          // 如果是未读通知，减少未读数量
          if (!notification.isRead) {
            unreadCount.value = Math.max(0, unreadCount.value - 1)
          }
          
          total.value = Math.max(0, total.value - 1)
        }
        
        ElNotification({
          title: '成功',
          message: '通知已删除',
          type: 'success'
        })
      }
    } catch (error) {
      console.error('删除通知失败:', error)
      ElNotification({
        title: '错误',
        message: '删除通知失败',
        type: 'error'
      })
    }
  }

  /**
   * 批量删除通知
   */
  const batchDeleteNotifications = async (ids: string[]) => {
    try {
      const response = await notificationAPI.batchDeleteNotifications(ids)
      if (response.code === 200) {
        // 从列表中移除
        ids.forEach(id => {
          const index = notifications.value.findIndex(n => n.id === id)
          if (index > -1) {
            const notification = notifications.value[index]
            notifications.value.splice(index, 1)
            
            // 如果是未读通知，减少未读数量
            if (!notification.isRead) {
              unreadCount.value = Math.max(0, unreadCount.value - 1)
            }
          }
        })
        
        total.value = Math.max(0, total.value - ids.length)
        
        ElNotification({
          title: '成功',
          message: `已删除 ${ids.length} 条通知`,
          type: 'success'
        })
      }
    } catch (error) {
      console.error('批量删除通知失败:', error)
      ElNotification({
        title: '错误',
        message: '批量删除通知失败',
        type: 'error'
      })
    }
  }

  /**
   * 清空通知
   */
  const clearNotifications = () => {
    notifications.value = []
    unreadCount.value = 0
    total.value = 0
    currentPage.value = 1
  }

  /**
   * 断开 WebSocket 连接
   */
  const disconnect = () => {
    websocketService.disconnect()
    clearNotifications()
  }

  return {
    // 状态
    notifications,
    unreadCount,
    loading,
    total,
    currentPage,
    pageSize,
    
    // 计算属性
    hasUnread,
    unreadNotifications,
    readNotifications,
    
    // 方法
    initializeNotifications,
    addNotification,
    fetchNotifications,
    fetchUnreadCount,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    batchDeleteNotifications,
    clearNotifications,
    disconnect
  }
})
