<template>
  <el-config-provider 
    :locale="locale" 
    :size="globalSize" 
    :button="buttonConfig"
    :z-index="3000"
  >
    <router-view></router-view>
  </el-config-provider>
</template>

<script setup lang="ts">
import { onMounted, onUnmounted, nextTick, computed, ref, watch } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useUserStore } from '@/store/modules/user'
import { useThemeStore } from '@/store/theme'
import tokenManager from '@/utils/token-manager'
import { initializeNotificationPermission } from '@/utils/notification'
import zhCn from 'element-plus/dist/locale/zh-cn.mjs'

const router = useRouter()
const route = useRoute()
const userStore = useUserStore()
const themeStore = useThemeStore()

// Element Plus 配置
const locale = zhCn // 中文语言包

// 窗口宽度
const windowWidth = ref(window.innerWidth)

// 全局组件尺寸配置 - 响应式调整
const globalSize = computed(() => {
  // 优先使用主题配置的尺寸
  if (themeStore.themeConfig.componentSize) {
    return themeStore.themeConfig.componentSize
  }
  
  // 根据屏幕宽度自动调整
  if (windowWidth.value < 768) return 'small'
  if (windowWidth.value > 1600) return 'large'
  return 'default'
})

// 按钮配置：自动插入空格（中文环境下推荐）
const buttonConfig = {
  autoInsertSpace: true
}

// 监听窗口大小变化
const handleResize = () => {
  windowWidth.value = window.innerWidth
}

// 监听全局尺寸变化，同步到主题配置
watch(globalSize, (newSize) => {
  if (themeStore.themeConfig.componentSize !== newSize) {
    // 只在自动调整时更新，避免覆盖用户手动设置
    if (!themeStore.themeConfig.componentSize) {
      themeStore.setComponentSize(newSize)
    }
  }
})

// 全局错误处理
const handleGlobalError = (event: ErrorEvent) => {
  console.error('全局错误:', event.error)
  // 可以在这里添加错误上报逻辑
}

// 全局未处理的Promise拒绝
const handleUnhandledRejection = (event: PromiseRejectionEvent) => {
  console.error('未处理的Promise拒绝:', event.reason)
  // 可以在这里添加错误上报逻辑
}

onMounted(async () => {
  // 添加全局错误监听
  window.addEventListener('error', handleGlobalError)
  window.addEventListener('unhandledrejection', handleUnhandledRejection)
  
  // 添加窗口大小监听
  window.addEventListener('resize', handleResize)
  
  // 初始化通知权限（优先使用浏览器原生 Notification API）
  await initializeNotificationPermission()
  
  // 初始化用户信息
  await userStore.initializeUser()
  
  // 等待下一个tick，确保路由完全初始化
  await nextTick()
  
  // 检查自动登录状态
  // if (tokenManager.isAutoLoginEnabled() && tokenManager.getToken()) {
  //   // 验证token是否真的有效
  //   try {
  //     const isValid = await tokenManager.validateToken()
  //     if (isValid && route.path !== '/dashboard') {
  //       // 使用replace避免在历史记录中留下多余的条目
  //       if (route.path === '/login' || route.path === '/') {
  //         router.replace('/dashboard')
  //       }
  //     } else if (!isValid) {
  //       tokenManager.clearTokens()
  //     }
  //   } catch (error) {
  //     console.error('自动登录验证失败:', error)
  //     tokenManager.clearTokens()
  //   }
  // }
})

onUnmounted(() => {
  // 清理全局错误监听
  window.removeEventListener('error', handleGlobalError)
  window.removeEventListener('unhandledrejection', handleUnhandledRejection)
  
  // 清理窗口大小监听
  window.removeEventListener('resize', handleResize)
  
  // 清理token管理器的定时器
  tokenManager.clearAutoRefresh()
})
</script>

<style scoped></style>

