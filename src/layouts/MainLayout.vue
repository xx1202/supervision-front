<template>
  <div class="main-layout" :class="[layoutClass, { 'logout-animation': isLoggingOut }]">
    <!-- 侧边栏 -->
    <AdminSidebar
      :active-menu="currentRoute"
      :collapsed="sidebarCollapsed"
      :layout="themeStore.themeConfig.layout"
      @toggle-collapse="toggleSidebar"
    />
    
    <!-- 主内容区域 -->
    <div class="main-container" :class="{ 'sidebar-collapsed': sidebarCollapsed }">
      <!-- 头部 -->
      <AppHeader 
        :username="userInfo.username"
        :user-role="userInfo.role"
        :user-avatar="userInfo.avatar"
        :layout="themeStore.themeConfig.layout"
        :collapsed="sidebarCollapsed"
        :show-collapse="themeStore.themeConfig.layout !== 'top'"
        @logout="handleLogout"
        @profile="handleProfile"
        @settings="handleSettings"
        @open-theme-settings="themeSettingsVisible = true"
        @toggle-collapse="toggleSidebar"
      />
      
      <!-- 面包屑标签导航 -->
      <div class="breadcrumb-tabs-wrapper">
        <BreadcrumbTabs
          :current-path="currentRoute"
          :tabs="tabs"
          @toggle-menu="toggleSidebar"
          @switch-tab="handleSwitchTab"
          @close-tab="handleCloseTab"
        />
      </div>
      
      <!-- 主内容 -->
      <main class="content-area">
        <div class="content-wrapper">
          <router-view v-slot="{ Component, route }">
            <transition 
              name="page-transition" 
              mode="out-in"
              @before-enter="beforeEnter"
              @enter="enter"
              @leave="leave"
            >
              <component 
                :is="Component" 
                :key="route.path"
                class="page-component"
              />
            </transition>
          </router-view>
        </div>
      </main>
    </div>
    
    <!-- 全局加载状态 -->
    <div v-if="loading" class="global-loading">
      <div class="loading-content">
        <div class="loading-spinner">
          <div class="spinner-circle"></div>
        </div>
        <span class="loading-text">{{ isLoggingOut ? '正在退出...' : '加载中...' }}</span>
      </div>
    </div>
    
    <!-- 退出动画遮罩 -->
    <div v-if="isLoggingOut" class="logout-overlay">
      <div class="logout-content">
        <div class="logout-spinner">
          <div class="spinner-circle"></div>
        </div>
        <div class="logout-text">正在安全退出...</div>
      </div>
    </div>
    
    <!-- 主题设置 -->
    <ThemeSettings v-model="themeSettingsVisible" />
    
    <!-- 页面进度条 -->
    <PageProgress />
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch, onMounted, onUnmounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { ElMessageBox, ElNotification } from 'element-plus'
import { showSuccessMessage, handleApiError } from '@/utils/error-handler'
import AdminSidebar from '@/components/supervision/AdminSidebar.vue'
import AppHeader from '@/components/common/AppHeader.vue'
import BreadcrumbTabs from '@/components/common/BreadcrumbTabs.vue'
import ThemeSettings from '@/components/common/ThemeSettings.vue'
import PageProgress from '@/components/common/PageProgress.vue'
import { useThemeStore } from '@/store/theme'
import { useUserStore } from '@/store/modules/user'
import { useNotificationStore } from '@/store/modules/notification'
import { logger } from '@/utils/logger'

interface TabItem {
  path: string
  title: string
  closable?: boolean
}

// 路由相关
const router = useRouter()
const route = useRoute()

// 主题管理
const themeStore = useThemeStore()

// 用户管理
const userStore = useUserStore()

// 通知管理
const notificationStore = useNotificationStore()

// 响应式状态
const sidebarCollapsed = ref(false)
const loading = ref(false)
const windowWidth = ref(window.innerWidth)
const themeSettingsVisible = ref(false)
const isLoggingOut = ref(false)

// 标签页管理
const tabs = ref<TabItem[]>([
  { path: '/dashboard', title: '仪表板', closable: false },
  { path: '/supervision', title: '督导管理', closable: false }
])

// 用户信息
const userInfo = ref({
  username: '管理员',
  role: '超级管理员',
  avatar: ''
})

// 获取用户信息
const getUserInfo = () => {
  try {
    // 优先从localStorage获取（支持自动登录），然后从sessionStorage获取
    const userInfoStr = localStorage.getItem('userInfo') || sessionStorage.getItem('userInfo')
    if (userInfoStr) {
      const user = JSON.parse(userInfoStr)  
      logger.debug('获取到用户信息:', user);
      
      userInfo.value = {
        username: user.realName || user.username || '管理员',
        role: user.roles?.[0] || '超级管理员',
        avatar: user.avatar || ''
      }
      ElNotification({
        title: '欢迎回来',
        message: `欢迎回来，${userInfo.value.username}！`,
        type: 'success',
        duration: 3000,
        position: 'top-right',
        offset: 20,
        showClose: true,
        dangerouslyUseHTMLString: false
      })
    } else {
      ElMessageBox.warning('未找到用户信息，使用默认设置', '提示')
    }
  } catch (error) {
    console.error('获取用户信息失败:', error)
    handleApiError(error, '获取用户信息失败，使用默认设置')
  }
}

// 计算属性
const currentRoute = computed(() => route.path)
const pageTitle = computed(() => route.meta?.title as string)
const layoutClass = computed(() => `layout-${themeStore.themeConfig.layout}`)

// 响应式调整侧边栏
const handleResize = () => {
  windowWidth.value = window.innerWidth
  
  // 根据屏幕宽度自动调整侧边栏状态
  if (windowWidth.value < 1200) {
    sidebarCollapsed.value = true
  } else if (windowWidth.value > 1600) {
    sidebarCollapsed.value = false
  }
  
  // 根据屏幕宽度动态调整侧边栏宽度
  // 统一使用默认宽度160px
  document.documentElement.style.setProperty('--sidebar-width', `${themeStore.themeConfig.sidebarWidth}px`)
}

// 切换侧边栏
const toggleSidebar = () => {
  sidebarCollapsed.value = !sidebarCollapsed.value
}

// 标签页切换
const handleSwitchTab = (tab: TabItem) => {
  router.push(tab.path)
}

// 标签页关闭
const handleCloseTab = (tab: TabItem) => {
  const index = tabs.value.findIndex(t => t.path === tab.path)
  if (index > -1) {
    tabs.value.splice(index, 1)
    
    // 如果关闭的是当前标签，切换到前一个标签
    if (currentRoute.value === tab.path) {
      const newIndex = Math.max(0, index - 1)
      router.push(tabs.value[newIndex].path)
    }
  }
}

// 添加新标签页
const addTab = (path: string, title: string, closable: boolean = true) => {
  // 检查是否已存在
  const existingTab = tabs.value.find(tab => tab.path === path)
  if (!existingTab) {
    tabs.value.push({ path, title, closable })
  }
}

// 页面过渡动画
const beforeEnter = (el: Element) => {
  const target = el as HTMLElement
  target.style.opacity = '0'
  target.style.transform = 'translateY(20px)'
}

const enter = (el: Element, done: () => void) => {
  const target = el as HTMLElement
  target.style.transition = 'all 0.3s ease'
  
  setTimeout(() => {
    target.style.opacity = '1'
    target.style.transform = 'translateY(0)'
    done()
  }, 50)
}

const leave = (el: Element) => {
  const target = el as HTMLElement
  target.style.opacity = '0'
  target.style.transform = 'translateY(-20px)'
}

// 事件处理
const handleLogout = async () => {
  try {
    // 显示确认对话框
    await ElMessageBox.confirm(
      '确定要退出登录吗？',
      '退出确认',
      {
        confirmButtonText: '确定退出',
        cancelButtonText: '取消',
        type: 'warning'
      }
    )
    
    isLoggingOut.value = true
    loading.value = true
    
    // 等待退出动画完成
    await new Promise(resolve => setTimeout(resolve, 1000))
    
    // 断开 WebSocket 连接
    notificationStore.disconnect()
    
    // 调用用户store的logout方法
    await userStore.logout()
    
    const response: any = { code: 200, message: '已安全退出' }
    showSuccessMessage(response, '已安全退出')
    router.push('/login')
  } catch (error) {
    if (error !== 'cancel') {
      handleApiError(error, '退出失败，请重试')
    }
  } finally {
    loading.value = false
    isLoggingOut.value = false
  }
}

const handleProfile = () => {
  router.push('/user/home')
}

const handleSettings = () => {
  router.push('/system/users')
}

// 监听路由变化
watch(() => route.path, (newPath) => {
  // 在小屏幕上自动折叠侧边栏
  if (windowWidth.value < 1200) {
    sidebarCollapsed.value = true
  }
  
  // 自动添加新标签页
  const title = route.meta?.title as string
  if (title && newPath) {
    addTab(newPath, title)
  }
  
  // 更新页面标题
  document.title = `${pageTitle.value || '督导管理系统'} - 管理后台`
}, { immediate: true })

// 生命周期
onMounted(async () => {
  handleResize()
  window.addEventListener('resize', handleResize)
  
  // 获取用户信息
  getUserInfo()
  
  // 初始化侧边栏宽度
  handleResize()
  
  // 初始化 WebSocket 连接和通知服务
  if (userStore.userInfo?.id) {
    try {
      await notificationStore.initializeNotifications(userStore.userInfo.id)
      logger.debug('通知服务已初始化')
    } catch (error) {
      console.error('初始化通知服务失败:', error)
    }
  }
})

onUnmounted(() => {
  window.removeEventListener('resize', handleResize)
  
  // 断开 WebSocket 连接
  notificationStore.disconnect()
})
</script>

<style scoped lang="scss">
.main-layout {
  display: flex;
  width: 100%;
  height: 100vh;
  background: var(--bg-color, #f5f7fa);
  position: relative;
  overflow: hidden;
  
  // 默认布局：侧边栏在左侧
  &.layout-default {
    flex-direction: row;
    
    .admin-sidebar {
      transition: all 0.3s cubic-bezier(0.645, 0.045, 0.355, 1);
    }
    
    .main-container {
      flex: 1;
      display: flex;
      flex-direction: column;
      height: 100vh;
      overflow: hidden;
      transition: all 0.3s cubic-bezier(0.645, 0.045, 0.355, 1);
      
      .app-header {
        flex-shrink: 0;
        height: 64px;
        z-index: 100;
      }
      
      .breadcrumb-tabs-wrapper {
        flex-shrink: 0;
        z-index: 10;
      }
      
      .content-area {
        flex: 1;
        display: flex;
        flex-direction: column;
        overflow: hidden;
        
        .content-wrapper {
          flex: 1;
          padding: 3px;
          overflow-y: auto;
          overflow-x: hidden;
        }
      }
    }
  }
  
  // 顶部布局：侧边栏菜单移到头部
  &.layout-top {
    flex-direction: column;
    
    .admin-sidebar {
      display: none; // 隐藏侧边栏
    }
    
    .main-container {
      flex: 1;
      display: flex;
      flex-direction: column;
      height: 100vh;
      overflow: hidden;
      min-height: 0;
      box-sizing: border-box;
      
      .app-header {
        flex: 0 0 64px; // 固定高度，不缩放
        height: 64px;
        min-height: 64px;
        max-height: 64px;
        z-index: 100;
        box-sizing: border-box; // 确保边框计算在高度内
        
        .header-left {
          .left-content {
            .collapse-btn {
              display: none; // 隐藏折叠按钮
            }
          }
        }
      }
      
      .breadcrumb-tabs-wrapper {
        flex: 0 0 36px; // 固定高度，不缩放
        height: 36px;
        min-height: 36px;
        max-height: 36px;
        z-index: 10;
        overflow: hidden;
        box-sizing: border-box; // 确保边框计算在高度内
        
        :deep(.breadcrumb-tabs) {
          height: 36px;
          min-height: 36px;
          max-height: 36px;
          box-sizing: border-box; // 确保边框计算在高度内
        }
      }
      
      .content-area {
        flex: 1;
        display: flex;
        flex-direction: column;
        overflow: hidden;
        min-height: 0;
        
        .content-wrapper {
          flex: 1;
          width: 100%;
          padding: 8px;
          padding-bottom: 9px; // 底部padding增加1px，确保底部内容完全可见
          overflow-y: auto;
          overflow-x: hidden;
          box-sizing: border-box;
          scrollbar-gutter: stable; // 只在一侧预留滚动条空间
        }
      }
    }
  }
  
  // 右侧布局：侧边栏在右侧
  &.layout-right {
    flex-direction: row;
    
    .admin-sidebar {
      order: 2;
      transition: all 0.3s cubic-bezier(0.645, 0.045, 0.355, 1);
    }
    
    .main-container {
      flex: 1;
      display: flex;
      flex-direction: column;
      height: 100vh;
      overflow: hidden;
      transition: all 0.3s cubic-bezier(0.645, 0.045, 0.355, 1);
      
      .app-header {
        flex-shrink: 0;
        height: 64px;
        z-index: 100;
      }
      
      .breadcrumb-tabs-wrapper {
        flex-shrink: 0;
        z-index: 10;
      }
      
      .content-area {
        flex: 1;
        display: flex;
        flex-direction: column;
        overflow: hidden;
        
        .content-wrapper {
          flex: 1;
          padding: 3px;
          overflow-y: auto;
          overflow-x: hidden;
        }
      }
    }
  }
  
  // 标准布局：Header + Aside + Main
  &.layout-standard {
    flex-direction: column;
    
    .admin-sidebar {
      order: 2;
      height: calc(100vh - 64px);
      width: var(--sidebar-width, 240px);
      position: fixed;
      left: 0;
      top: 64px;
      z-index: 100;
      transition: all 0.3s cubic-bezier(0.645, 0.045, 0.355, 1);
      
      &.is-collapsed {
        width: 64px;
      }
    }
    
    .main-container {
      flex: 1;
      display: flex;
      flex-direction: column;
      margin-left: var(--sidebar-width, 240px);
      min-width: 0;
      height: 100vh;
      transition: all 0.3s cubic-bezier(0.645, 0.045, 0.355, 1);
      overflow: hidden;
      
      &.sidebar-collapsed {
        margin-left: 64px;
      }
      
      .app-header {
        position: fixed;
        top: 0;
        left: 0;
        right: 0;
        width: 100%;
        z-index: 200;
        transition: all 0.3s cubic-bezier(0.645, 0.045, 0.355, 1);
      }
      
      .breadcrumb-tabs-wrapper {
        position: fixed;
        top: 64px;
        left: var(--sidebar-width, 240px);
        right: 0;
        z-index: 150;
        transition: all 0.3s cubic-bezier(0.645, 0.045, 0.355, 1);
      }
      
      &.sidebar-collapsed {
        .breadcrumb-tabs-wrapper {
          left: 64px;
        }
      }
      
      .content-area {
        flex: 1;
        display: flex;
        flex-direction: column;
        margin-top: 100px;
        overflow: hidden;
        
        .content-wrapper {
          flex: 1;
          padding: 3px;
          overflow-y: auto;
          overflow-x: hidden;
        }
      }
    }
  }
}

.content-wrapper {
  box-sizing: border-box;
  width: 100%;
}

// 页面过渡动画
.page-transition-enter-active,
.page-transition-leave-active {
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.page-transition-enter-from {
  opacity: 0;
  transform: translateY(20px);
}

.page-transition-leave-to {
  opacity: 0;
  transform: translateY(-20px);
}

// 全局加载状态
.global-loading {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(255, 255, 255, 0.9);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  z-index: 9999;
  
  .loading-content {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    background: rgba(255, 255, 255, 0.95);
    padding: 32px;
    border-radius: 12px;
    box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
    
    .loading-spinner {
      margin-bottom: 16px;
      
      .spinner-circle {
        width: 40px;
        height: 40px;
        border: 3px solid #e4e7ed;
        border-top: 3px solid #409eff;
        border-radius: 50%;
        animation: loadingSpinner 1s linear infinite;
      }
    }
  }
  
  .loading-text {
    margin-top: 0;
    color: #666;
    font-size: 14px;
  }
}

// 退出动画遮罩
.logout-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(255, 255, 255, 0.3);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 10000;
  
  .logout-content {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    background: rgba(255, 255, 255, 0.95);
    padding: 32px;
    border-radius: 12px;
    box-shadow: 0 8px 32px rgba(0, 0, 0, 0.15);
    backdrop-filter: blur(10px);
    
    .logout-spinner {
      margin-bottom: 16px;
      
      .spinner-circle {
        width: 40px;
        height: 40px;
        border: 3px solid #e4e7ed;
        border-top: 3px solid #409eff;
        border-radius: 50%;
        animation: logoutSpinner 1s linear infinite;
      }
    }
    
    .logout-text {
      font-size: 16px;
      color: #333;
      font-weight: 500;
    }
  }
}

@keyframes logoutSpinner {
  0% {
    transform: rotate(0deg);
  }
  100% {
    transform: rotate(360deg);
  }
}

@keyframes loadingSpinner {
  0% {
    transform: rotate(0deg);
  }
  100% {
    transform: rotate(360deg);
  }
}

// 响应式设计
@media (max-width: 1200px) {
  .main-layout {
    &.layout-standard {
      .main-container {
        margin-left: 0;
        width: 100vw;
        
        .breadcrumb-tabs-wrapper {
          left: 0;
        }
      }
    }
    
    // 确保顶部布局在中等屏幕下也正确
    &.layout-top {
      .main-container {
        .content-area {
          flex: 1;
          min-height: 0;
        }
      }
    }
  }
  
  .content-area {
    .content-wrapper {
      padding: 3px;
    }
  }
}

@media (max-width: 768px) {
  .main-layout {
    &.layout-top {
      .main-container {
        .content-area {
          // 在移动端也使用 flex: 1，确保高度正确
          flex: 1;
          min-height: 0;
        }
      }
    }
    
    .main-container {
      .content-area {
        height: calc(100vh - 64px);
        
        .content-wrapper {
          padding: 3px;
        }
      }
    }
  }
}

@media (min-width: 1600px) {
  .content-area {
    .content-wrapper {
      padding: 3px;
    }
  }
}

// 深色主题适配
body.theme-dark {
  .main-layout {
    background: var(--bg-color);
    
    .main-container {
      .content-area {
        .content-wrapper {
          background: var(--bg-color);
          color: var(--text-color);
        }
      }
    }
  }
  
  .global-loading {
    background: var(--mask-color, rgba(0, 0, 0, 0.8));
    
    .loading-content {
      background: var(--fill-color);
      color: var(--text-color);
    }
    
    .loading-text {
      color: var(--text-color-secondary);
    }
  }
}

// 退出动画
.logout-animation {
  opacity: 0.3;
  transition: opacity 0.8s ease-in-out;
}



// 打印样式
@media print {
  .main-layout {
    .main-container {
      margin-left: 0;
    }
    
    .content-area {
      .content-wrapper {
        padding: 0;
      }
    }
  }
}
</style> 