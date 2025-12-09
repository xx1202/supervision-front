<template>
  <div class="notification-bell">
    <el-badge :value="unreadCount" :hidden="!hasUnread" :max="99">
      <el-button
        :icon="Bell"
        circle
        @click="toggleNotificationList"
        :class="{ 'has-unread': hasUnread }"
      />
    </el-badge>

    <!-- 通知列表弹出框 -->
    <el-drawer
      v-model="drawerVisible"
      title="通知中心"
      direction="rtl"
      size="400px"
      :before-close="handleClose"
    >
      <NotificationList @close="drawerVisible = false" />
    </el-drawer>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { Bell } from '@element-plus/icons-vue'
import { useNotificationStore } from '@/store'
import NotificationList from './NotificationList.vue'

const notificationStore = useNotificationStore()

// 状态
const drawerVisible = ref(false)

// 计算属性
const unreadCount = computed(() => notificationStore.unreadCount)
const hasUnread = computed(() => notificationStore.hasUnread)

// 方法
const toggleNotificationList = () => {
  drawerVisible.value = !drawerVisible.value
}

const handleClose = (done: () => void) => {
  drawerVisible.value = false
  done()
}
</script>

<style scoped lang="scss">
.notification-bell {
  display: inline-block;
  margin-left: 16px;

  :deep(.el-badge__content) {
    border: 2px solid var(--el-bg-color);
  }

  .el-button {
    transition: all 0.3s;

    &.has-unread {
      animation: ring 2s ease-in-out infinite;
    }

    &:hover {
      color: var(--el-color-primary);
      background-color: var(--el-color-primary-light-9);
    }
  }
}

@keyframes ring {
  0%, 100% {
    transform: rotate(0deg);
  }
  10%, 30% {
    transform: rotate(-10deg);
  }
  20%, 40% {
    transform: rotate(10deg);
  }
  50% {
    transform: rotate(0deg);
  }
}
</style>
