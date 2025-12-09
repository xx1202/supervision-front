/**
 * 通知管理 API
 */

import { $get, $put, $delete } from '@/utils/request'
import type {
  Notification,
  NotificationQueryParams,
  NotificationListResponse,
  UnreadCountResponse,
  MarkAsReadResponse,
  DeleteNotificationResponse
} from '@/types/notification'

export const notificationAPI = {
  /**
   * 获取通知历史（分页查询）
   */
  getNotifications: async (params: NotificationQueryParams): Promise<NotificationListResponse> => {
    return $get('/v1/notifications', params as Record<string, unknown>)
  },

  /**
   * 获取未读通知数量
   */
  getUnreadCount: async (): Promise<UnreadCountResponse> => {
    return $get('/v1/notifications/unread-count', {})
  },

  /**
   * 标记通知为已读
   */
  markAsRead: async (id: string): Promise<MarkAsReadResponse> => {
    return $put(`/v1/notifications/${id}/read`, {})
  },

  /**
   * 批量标记为已读
   */
  markAllAsRead: async (): Promise<MarkAsReadResponse> => {
    return $put('/v1/notifications/read-all', {})
  },

  /**
   * 删除通知
   */
  deleteNotification: async (id: string): Promise<DeleteNotificationResponse> => {
    return $delete(`/v1/notifications/${id}`, {})
  },

  /**
   * 批量删除通知
   */
  batchDeleteNotifications: async (ids: string[]): Promise<DeleteNotificationResponse> => {
    return $delete('/v1/notifications/batch', { ids })
  }
}
