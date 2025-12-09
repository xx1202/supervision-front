<template>
  <div
    class="notification-item"
    :class="{ 'is-unread': !notification.isRead }"
    @click="handleClick"
  >
    <!-- 通知图标 -->
    <div class="notification-icon" :style="{ backgroundColor: iconColor }">
      <el-icon :size="20">
        <component :is="iconComponent" />
      </el-icon>
    </div>

    <!-- 通知内容 -->
    <div class="notification-content">
      <div class="notification-header">
        <span class="notification-title">{{ notification.title }}</span>
        <el-tag v-if="!notification.isRead" type="danger" size="small" effect="dark">
          未读
        </el-tag>
      </div>
      
      <div class="notification-body">
        {{ notification.content }}
      </div>
      
      <div class="notification-footer">
        <span class="notification-time">{{ formatTime(notification.createdTime) }}</span>
        <div class="notification-actions">
          <el-button
            v-if="!notification.isRead"
            text
            size="small"
            type="primary"
            @click.stop="handleMarkAsRead"
          >
            标记已读
          </el-button>
          <el-button
            text
            size="small"
            type="danger"
            @click.stop="handleDelete"
          >
            删除
          </el-button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import {
  Bell,
  Document,
  User,
  Warning,
  ChatDotRound
} from '@element-plus/icons-vue'
import type { Notification, NotificationType } from '@/types/notification'
import { formatDistanceToNow } from 'date-fns'
import { zhCN } from 'date-fns/locale'

interface Props {
  notification: Notification
}

const props = defineProps<Props>()

const emit = defineEmits<{
  read: [id: string]
  delete: [id: string]
}>()

// 通知类型图标映射
const iconMap: Record<NotificationType, any> = {
  SUPERVISION_TASK: Document,
  APPROVAL_REMINDER: Bell,
  LEAVE_NOTICE: User,
  MOVEMENT_NOTICE: Warning,
  SYSTEM_ANNOUNCEMENT: ChatDotRound
}

// 通知类型颜色映射
const colorMap: Record<NotificationType, string> = {
  SUPERVISION_TASK: '#409EFF',
  APPROVAL_REMINDER: '#E6A23C',
  LEAVE_NOTICE: '#67C23A',
  MOVEMENT_NOTICE: '#F56C6C',
  SYSTEM_ANNOUNCEMENT: '#909399'
}

// 计算属性
const iconComponent = computed(() => iconMap[props.notification.type] || Bell)
const iconColor = computed(() => colorMap[props.notification.type] || '#909399')

// 方法
const formatTime = (time: string) => {
  try {
    return formatDistanceToNow(new Date(time), {
      addSuffix: true,
      locale: zhCN
    })
  } catch {
    return time
  }
}

const handleClick = () => {
  // 点击通知项时，如果未读则标记为已读
  if (!props.notification.isRead) {
    emit('read', props.notification.id)
  }
  
  // 可以在这里添加跳转到相关页面的逻辑
  // 例如：根据 relatedType 和 relatedId 跳转
}

const handleMarkAsRead = () => {
  emit('read', props.notification.id)
}

const handleDelete = () => {
  emit('delete', props.notification.id)
}
</script>

<style scoped lang="scss">
.notification-item {
  display: flex;
  gap: 12px;
  padding: 12px;
  border-radius: 8px;
  background-color: var(--el-bg-color);
  border: 1px solid var(--el-border-color-light);
  cursor: pointer;
  transition: all 0.3s;

  &:hover {
    background-color: var(--el-fill-color-light);
    border-color: var(--el-border-color);
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  }

  &.is-unread {
    background-color: var(--el-color-primary-light-9);
    border-color: var(--el-color-primary-light-7);

    .notification-title {
      font-weight: 600;
    }
  }

  .notification-icon {
    flex-shrink: 0;
    width: 40px;
    height: 40px;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    color: white;
  }

  .notification-content {
    flex: 1;
    min-width: 0;

    .notification-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      margin-bottom: 8px;

      .notification-title {
        font-size: 14px;
        color: var(--el-text-color-primary);
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
      }
    }

    .notification-body {
      font-size: 13px;
      color: var(--el-text-color-regular);
      line-height: 1.5;
      margin-bottom: 8px;
      display: -webkit-box;
      -webkit-line-clamp: 2;
      -webkit-box-orient: vertical;
      overflow: hidden;
      text-overflow: ellipsis;
    }

    .notification-footer {
      display: flex;
      align-items: center;
      justify-content: space-between;

      .notification-time {
        font-size: 12px;
        color: var(--el-text-color-secondary);
      }

      .notification-actions {
        display: flex;
        gap: 8px;
      }
    }
  }
}
</style>
