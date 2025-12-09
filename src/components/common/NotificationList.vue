<template>
  <div class="notification-list">
    <!-- 操作栏 -->
    <div class="notification-actions">
      <el-button
        text
        size="small"
        @click="handleMarkAllAsRead"
        :disabled="!hasUnread"
      >
        全部已读
      </el-button>
      <el-button
        text
        size="small"
        type="danger"
        @click="handleClearAll"
        :disabled="notifications.length === 0"
      >
        清空通知
      </el-button>
    </div>

    <!-- 筛选标签 -->
    <div class="notification-filters">
      <el-radio-group v-model="filterType" size="small" @change="handleFilterChange">
        <el-radio-button label="all">全部</el-radio-button>
        <el-radio-button label="unread">未读</el-radio-button>
        <el-radio-button label="read">已读</el-radio-button>
      </el-radio-group>
    </div>

    <!-- 通知列表 -->
    <div v-loading="loading" class="notification-content">
      <el-empty
        v-if="displayNotifications.length === 0"
        description="暂无通知"
        :image-size="100"
      />
      
      <div v-else class="notification-items">
        <NotificationItem
          v-for="notification in displayNotifications"
          :key="notification.id"
          :notification="notification"
          @read="handleRead"
          @delete="handleDelete"
        />
      </div>

      <!-- 分页 -->
      <div v-if="total > pageSize" class="notification-pagination">
        <el-pagination
          v-model:current-page="currentPage"
          v-model:page-size="pageSize"
          :total="total"
          :page-sizes="[10, 20, 50]"
          layout="total, sizes, prev, pager, next"
          small
          @current-change="handlePageChange"
          @size-change="handleSizeChange"
        />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { ElMessageBox } from 'element-plus'
import { useNotificationStore } from '@/store'
import NotificationItem from './NotificationItem.vue'
import type { Notification } from '@/types/notification'

const emit = defineEmits<{
  close: []
}>()

const notificationStore = useNotificationStore()

// 状态
const filterType = ref<'all' | 'unread' | 'read'>('all')

// 计算属性
const loading = computed(() => notificationStore.loading)
const notifications = computed(() => notificationStore.notifications)
const unreadNotifications = computed(() => notificationStore.unreadNotifications)
const readNotifications = computed(() => notificationStore.readNotifications)
const hasUnread = computed(() => notificationStore.hasUnread)
const total = computed(() => notificationStore.total)
const currentPage = computed({
  get: () => notificationStore.currentPage,
  set: (val) => notificationStore.currentPage = val
})
const pageSize = computed({
  get: () => notificationStore.pageSize,
  set: (val) => notificationStore.pageSize = val
})

const displayNotifications = computed(() => {
  switch (filterType.value) {
    case 'unread':
      return unreadNotifications.value
    case 'read':
      return readNotifications.value
    default:
      return notifications.value
  }
})

// 方法
const handleFilterChange = () => {
  loadNotifications()
}

const handlePageChange = (page: number) => {
  loadNotifications()
}

const handleSizeChange = (size: number) => {
  loadNotifications()
}

const loadNotifications = () => {
  const params: any = {
    page: currentPage.value,
    size: pageSize.value
  }

  if (filterType.value === 'unread') {
    params.isRead = false
  } else if (filterType.value === 'read') {
    params.isRead = true
  }

  notificationStore.fetchNotifications(params)
}

const handleRead = (id: string) => {
  notificationStore.markAsRead(id)
}

const handleDelete = (id: string) => {
  ElMessageBox.confirm('确定要删除这条通知吗？', '提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(() => {
    notificationStore.deleteNotification(id)
  }).catch(() => {
    // 取消删除
  })
}

const handleMarkAllAsRead = () => {
  ElMessageBox.confirm('确定要将所有通知标记为已读吗？', '提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'info'
  }).then(() => {
    notificationStore.markAllAsRead()
  }).catch(() => {
    // 取消操作
  })
}

const handleClearAll = () => {
  ElMessageBox.confirm('确定要清空所有通知吗？此操作不可恢复！', '警告', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(() => {
    const ids = notifications.value.map(n => n.id)
    notificationStore.batchDeleteNotifications(ids)
  }).catch(() => {
    // 取消操作
  })
}

onMounted(() => {
  loadNotifications()
})
</script>

<style scoped lang="scss">
.notification-list {
  display: flex;
  flex-direction: column;
  height: 100%;

  .notification-actions {
    display: flex;
    justify-content: flex-end;
    gap: 8px;
    padding: 12px 0;
    border-bottom: 1px solid var(--el-border-color-light);
  }

  .notification-filters {
    padding: 12px 0;
    border-bottom: 1px solid var(--el-border-color-light);

    .el-radio-group {
      width: 100%;
      display: flex;

      :deep(.el-radio-button) {
        flex: 1;

        .el-radio-button__inner {
          width: 100%;
        }
      }
    }
  }

  .notification-content {
    flex: 1;
    overflow-y: auto;
    padding: 12px 0;

    .notification-items {
      display: flex;
      flex-direction: column;
      gap: 8px;
    }

    .notification-pagination {
      margin-top: 16px;
      display: flex;
      justify-content: center;
    }
  }
}
</style>
