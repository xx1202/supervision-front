/**
 * 通知相关类型定义
 */

import type { ApiResponse, PageResponse } from './api'

// 通知类型枚举
export enum NotificationType {
  SUPERVISION_TASK = 'SUPERVISION_TASK',      // 督导任务
  APPROVAL_REMINDER = 'APPROVAL_REMINDER',    // 审批提醒
  LEAVE_NOTICE = 'LEAVE_NOTICE',              // 请假通知
  MOVEMENT_NOTICE = 'MOVEMENT_NOTICE',        // 异动通知
  SYSTEM_ANNOUNCEMENT = 'SYSTEM_ANNOUNCEMENT' // 系统公告
}

// 通知实体
export interface Notification {
  id: string
  userId: string
  type: NotificationType
  title: string
  content: string
  relatedId?: string
  relatedType?: string
  isRead: boolean
  createdTime: string
  readTime?: string
}

// 通知查询参数
export interface NotificationQueryParams {
  page?: number
  size?: number
  type?: NotificationType
  isRead?: boolean
  startDate?: string
  endDate?: string
}

// 通知响应类型
export interface NotificationResponse extends ApiResponse<Notification> {}
export interface NotificationListResponse extends ApiResponse<PageResponse<Notification>> {}
export interface UnreadCountResponse extends ApiResponse<number> {}
export interface MarkAsReadResponse extends ApiResponse<boolean> {}
export interface DeleteNotificationResponse extends ApiResponse<boolean> {}

/**
 * 将后端返回的通知类型字符串转换为前端枚举值
 * 后端格式: supervision_task, approval_reminder, leave_notice, movement_notice, system_announcement
 * 前端格式: SUPERVISION_TASK, APPROVAL_REMINDER, LEAVE_NOTICE, MOVEMENT_NOTICE, SYSTEM_ANNOUNCEMENT
 */
export function convertNotificationType(backendType: string): NotificationType {
  const typeMap: Record<string, NotificationType> = {
    'supervision_task': NotificationType.SUPERVISION_TASK,
    'approval_reminder': NotificationType.APPROVAL_REMINDER,
    'leave_notice': NotificationType.LEAVE_NOTICE,
    'movement_notice': NotificationType.MOVEMENT_NOTICE,
    'system_announcement': NotificationType.SYSTEM_ANNOUNCEMENT
  }
  
  // 如果已经是前端格式（枚举值），直接返回
  const frontendTypes = Object.values(NotificationType) as string[]
  if (frontendTypes.includes(backendType)) {
    return backendType as NotificationType
  }
  
  // 转换为前端格式
  return typeMap[backendType] || NotificationType.SYSTEM_ANNOUNCEMENT
}

/**
 * 转换通知对象，将后端格式转换为前端格式
 */
export function convertNotification(notification: any): Notification {
  return {
    ...notification,
    type: convertNotificationType(notification.type),
    isRead: notification.isRead === 1 || notification.isRead === true,
    createdTime: notification.createdTime || notification.created_time,
    readTime: notification.readTime || notification.readAt || notification.read_time
  }
}