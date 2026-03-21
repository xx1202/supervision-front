<template>
  <header class="app-header">
    <!-- 左侧区域 -->
    <div class="header-left">
      <slot name="left">
        <div class="left-content">
          <!-- 折叠按钮 -->
          <el-button 
            v-if="showCollapse"
            type="text" 
            class="collapse-btn"
            @click="$emit('toggle-collapse')"
          >
            <el-icon :size="20">
              <Expand v-if="collapsed" />
              <Fold v-else />
            </el-icon>
          </el-button>
          
          <!-- 标准布局标题 -->
          <div v-if="isStandardLayout" class="system-title">
            督导管理系统
          </div>
          
          <!-- 面包屑导航 -->
           <el-breadcrumb 
             v-if="breadcrumbs.length && !isTopLayout" 
             separator="/"
             class="breadcrumb-nav"
           >
             <el-breadcrumb-item 
               v-for="(item, index) in breadcrumbs" 
               :key="item.path"
               :to="index === breadcrumbs.length - 1 ? undefined : item.path"
               :class="{ 'is-current': index === breadcrumbs.length - 1 }"
             >
               <el-icon v-if="item.meta?.icon" class="breadcrumb-icon">
                 <component :is="item.meta.icon" />
               </el-icon>
               {{ item.meta?.title }}
             </el-breadcrumb-item>
           </el-breadcrumb>
           
           <!-- 顶部布局Logo和标题 -->
           <!-- <div v-if="isTopLayout" class="top-logo-section">
             <img src="/college-logo.png" alt="学院Logo" class="header-logo" />
             <div class="header-title">
               <h1>督导管理系统</h1>
             </div>
           </div> -->
           
             <!-- 顶部布局导航菜单 -->
            <div v-if="isTopLayout" class="top-nav-menu">
              <el-menu
                mode="horizontal"
                :default-active="activeMenu"
                class="horizontal-menu"
                background-color="transparent"
                text-color="var(--text-color)"
                active-text-color="var(--primary-color)"
                router
              >
                <el-menu-item index="/dashboard">
                  <el-icon><Monitor /></el-icon>
                  <span>仪表板</span>
                </el-menu-item>
                
                <!-- 督导管理 -->
                <el-sub-menu index="supervision">
                  <template #title>
                    <el-icon><View /></el-icon>
                    <span>督导管理</span>
                  </template>
                  
                  <!-- 日常教学督导 -->
                  <el-sub-menu index="module1">
                    <template #title>日常教学督导</template>
                    <el-menu-item index="/supervision/module1/schedule">
                      <el-icon><Calendar /></el-icon>
                      <template #title>督导安排</template>
                    </el-menu-item>
                    <el-menu-item index="/supervision/module1/record">
                      <el-icon><Document /></el-icon>
                      <template #title>督导记录</template>
                    </el-menu-item>
                    <el-menu-item index="/supervision/module1/statistics">
                      <el-icon><PieChart /></el-icon>
                      <template #title>督导统计</template>
                    </el-menu-item>
                    <el-menu-item index="/supervision/module1/document">
                      <el-icon><Files /></el-icon>
                      <template #title>督导文档</template>
                    </el-menu-item>
                  </el-sub-menu>
                  
                  <!-- 行政坐班 -->
                  <el-sub-menu index="module2">
                    <template #title>行政坐班</template>
                    <el-menu-item index="/supervision/module2/schedule">
                      <el-icon><Calendar /></el-icon>
                      <template #title>坐班安排</template>
                    </el-menu-item>
                    <el-menu-item index="/supervision/module2/attendance">
                      <el-icon><User /></el-icon>
                      <template #title>考勤记录</template>
                    </el-menu-item>
                    <el-menu-item index="/supervision/module2/activity">
                      <el-icon><Edit /></el-icon>
                      <template #title>教研室活动</template>
                    </el-menu-item>
                    <el-menu-item index="/supervision/module2/movement">
                      <el-icon><Location /></el-icon>
                      <template #title>人员异动</template>
                    </el-menu-item>
                  </el-sub-menu>
                  
                  <!-- 教室巡查 -->
                  <el-sub-menu index="module3">
                    <template #title>教室巡查</template>
                    <el-menu-item index="/supervision/module3/plan">
                      <el-icon><Calendar /></el-icon>
                      <template #title>巡查计划</template>
                    </el-menu-item>
                    <el-menu-item index="/supervision/module3/record">
                      <el-icon><Document /></el-icon>
                      <template #title>巡查记录</template>
                    </el-menu-item>
                    <el-menu-item index="/supervision/module3/item">
                      <el-icon><List /></el-icon>
                      <template #title>巡查项目</template>
                    </el-menu-item>
                    <el-menu-item index="/supervision/module3/statistics">
                      <el-icon><PieChart /></el-icon>
                      <template #title>巡查统计</template>
                    </el-menu-item>
                  </el-sub-menu>
                </el-sub-menu>
                
                <!-- 基础数据管理 -->
                <el-sub-menu index="basic-data">
                  <template #title>
                    <el-icon><DataAnalysis /></el-icon>
                    <span>基础数据</span>
                  </template>
                  <el-menu-item index="/basic-data/classes">
                    <el-icon><School /></el-icon>
                    <template #title>班级管理</template>
                  </el-menu-item>
                  <el-menu-item index="/basic-data/classrooms">
                    <el-icon><House /></el-icon>
                    <template #title>教室管理</template>
                  </el-menu-item>
                  <el-menu-item index="/basic-data/courses">
                    <el-icon><Reading /></el-icon>
                    <template #title>课程管理</template>
                  </el-menu-item>
                  <el-menu-item index="/basic-data/offices">
                    <el-icon><OfficeBuilding /></el-icon>
                    <template #title>办公室管理</template>
                  </el-menu-item>
                </el-sub-menu>
                
                <!-- 统计分析 -->
                <el-sub-menu index="statistics">
                  <template #title>
                    <el-icon><PieChart /></el-icon>
                    <span>统计分析</span>
                  </template>
                  <el-menu-item index="/statistics/overview">
                    <el-icon><DataBoard /></el-icon>
                    <template #title>统计概览</template>
                  </el-menu-item>
                  <el-menu-item index="/statistics/reports">
                    <el-icon><Document /></el-icon>
                    <template #title>报表管理</template>
                  </el-menu-item>
                  <el-menu-item index="/statistics/export">
                    <el-icon><Download /></el-icon>
                    <template #title>数据导出</template>
                  </el-menu-item>
                </el-sub-menu>
                
                <!-- 系统管理 -->
                <el-sub-menu index="system">
                  <template #title>
                    <el-icon><Setting /></el-icon>
                    <span>系统管理</span>
                  </template>
                  <el-menu-item index="/system/users">
                    <el-icon><User /></el-icon>
                    <template #title>用户管理</template>
                  </el-menu-item>
                  <el-menu-item index="/system/roles">
                    <el-icon><UserFilled /></el-icon>
                    <template #title>角色管理</template>
                  </el-menu-item>
                  <el-menu-item index="/system/permissions">
                    <el-icon><Lock /></el-icon>
                    <template #title>权限管理</template>
                  </el-menu-item>
                </el-sub-menu>
              </el-menu>
            </div>
        </div>
      </slot>
    </div>
    
    <!-- 右侧区域 -->
    <div class="header-right">
      <slot name="right">
        <div class="right-content">
          <!-- 搜索框 -->
          <div class="search-container">
            <el-autocomplete
              v-model="searchKeyword"
              :fetch-suggestions="querySearch"
              :trigger-on-focus="false"
              placeholder="搜索..."
              class="search-input"
              clearable
              popper-class="search-suggestions"
              @select="handleSelect"
              @keyup.enter="handleEnter"
            >
              <template #prefix>
                <el-icon><Search /></el-icon>
              </template>
              <template #default="{ item }">
                <div class="search-item">
                  <el-icon v-if="item.icon" class="search-item-icon">
                    <component :is="item.icon" />
                  </el-icon>
                  <div class="search-item-content">
                    <div class="search-item-title">{{ item.title }}</div>
                    <div class="search-item-path">{{ item.path }}</div>
                  </div>
                </div>
              </template>
            </el-autocomplete>
          </div>
          
          <!-- 视图模式切换 -->
          <ViewModeSwitch 
            v-if="showViewModeSwitch"
            v-model="currentViewMode"
            @change="handleViewModeChange"
          />
          
          <!-- 通知中心 -->
          <NotificationBell />
          
          <!-- 全屏按钮 -->
          <el-button
            type="text"
            class="fullscreen-btn"
            @click="toggleFullscreen"
          >
            <el-icon :size="20">
              <FullScreen v-if="!isFullscreen" />
              <Aim v-else />
            </el-icon>
          </el-button>
          
          <!-- 主题设置按钮 -->
          <el-button
            type="text"
            class="theme-btn"
            @click="$emit('open-theme-settings')"
          >
            <el-icon :size="20"><Setting /></el-icon>
          </el-button>
          
          <!-- 用户信息 -->
          <el-dropdown class="user-dropdown" trigger="click">
            <div class="user-info">
              <el-avatar 
                :size="32" 
                :src="userAvatar || '/src/assets/default-avatar.svg'" 
                class="user-avatar"
              />
              <div class="user-details">
                <span class="username">{{ username }}</span>
                <span class="user-role">{{ userRole }}</span>
              </div>
              <el-icon class="dropdown-arrow"><ArrowDown /></el-icon>
            </div>
            <template #dropdown>
              <el-dropdown-menu class="user-menu">
                <el-dropdown-item @click="$emit('profile')">
                  <el-icon><User /></el-icon>
                  <span>个人中心</span>
                </el-dropdown-item>
                <el-dropdown-item @click="$emit('settings')">
                  <el-icon><Setting /></el-icon>
                  <span>系统设置</span>
                </el-dropdown-item>
                <el-dropdown-item divided @click="$emit('logout')">
                  <el-icon><SwitchButton /></el-icon>
                  <span>退出登录</span>
                </el-dropdown-item>
              </el-dropdown-menu>
            </template>
          </el-dropdown>
        </div>
      </slot>
    </div>
  </header>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import { 
  Search, 
  Bell, 
  ArrowDown, 
  User, 
  Setting, 
  SwitchButton,
  Message,
  Warning,
  CircleCheck,
  FullScreen,
  Aim,
  Monitor,
  TrendCharts,
  QuestionFilled,
  Expand,
  Fold,
  View,
  Calendar,
  Document,
  PieChart,
  Files,
  Edit,
  Location,
  List,
  DataAnalysis,
  School,
  House,
  Reading,
  OfficeBuilding,
  DataBoard,
  Download,
  UserFilled,
  Lock
} from '@element-plus/icons-vue'
import NotificationBell from './NotificationBell.vue'
import ViewModeSwitch from './ViewModeSwitch.vue'
import { useViewModeStore } from '@/store/modules/viewMode'
import type { ViewMode } from '@/hooks/useViewMode'

interface Props {
  username?: string
  userRole?: string
  userAvatar?: string
  layout?: string
  collapsed?: boolean
  showCollapse?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  username: '管理员',
  userRole: '超级管理员',
  userAvatar: '',
  layout: 'default',
  collapsed: false,
  showCollapse: true
})

const emit = defineEmits<{
  'logout': []
  'profile': []
  'settings': []
  'open-theme-settings': []
  'toggle-collapse': []
}>()

const route = useRoute()
const router = useRouter()
const searchKeyword = ref('')
const isFullscreen = ref(false)
const viewModeStore = useViewModeStore()

// 可搜索的路由列表
interface SearchRoute {
  path: string
  title: string
  fullTitle: string
  icon?: any
}

const searchRoutes = ref<SearchRoute[]>([])

// 生成可搜索的路由列表
const generateSearchRoutes = (routes: any[], basePath = '', prefixTitle: string[] = []): SearchRoute[] => {
  const result: SearchRoute[] = []
  
  for (const routeItem of routes) {
    // 跳过隐藏的路由
    if (routeItem.meta?.hidden) {
      continue
    }
    
    // 构建当前路径
    let currentPath = ''
    if (routeItem.path.startsWith('/')) {
      // 绝对路径
      currentPath = routeItem.path
    } else if (basePath) {
      // 相对路径，需要拼接
      currentPath = basePath.endsWith('/') 
        ? `${basePath}${routeItem.path}` 
        : `${basePath}/${routeItem.path}`
    } else {
      currentPath = `/${routeItem.path}`
    }
    
    // 确保路径以/开头
    if (!currentPath.startsWith('/')) {
      currentPath = `/${currentPath}`
    }
    
    // 构建标题
    const currentTitle = routeItem.meta?.title 
      ? [...prefixTitle, routeItem.meta.title] 
      : prefixTitle
    
    // 如果有标题且有组件，添加到搜索结果（排除重定向路由）
    if (routeItem.meta?.title && routeItem.component && !routeItem.redirect) {
      result.push({
        path: currentPath,
        title: routeItem.meta.title,
        fullTitle: currentTitle.join(' > '),
        icon: routeItem.meta.icon
      })
    }
    
    // 递归处理子路由
    if (routeItem.children && routeItem.children.length > 0) {
      const childRoutes = generateSearchRoutes(routeItem.children, currentPath, currentTitle)
      result.push(...childRoutes)
    }
  }
  
  return result
}

// 初始化搜索路由列表
onMounted(() => {
  // 获取所有路由
  const allRoutes = router.getRoutes()
  searchRoutes.value = generateSearchRoutes(allRoutes)
})

// 搜索建议
const querySearch = (queryString: string, cb: (results: any[]) => void) => {
  if (!queryString || queryString.trim() === '') {
    cb([])
    return
  }
  
  const keyword = queryString.toLowerCase().trim()
  const results = searchRoutes.value
    .filter(route => {
      // 搜索标题和路径
      const titleMatch = route.title.toLowerCase().includes(keyword) || 
                        route.fullTitle.toLowerCase().includes(keyword)
      const pathMatch = route.path.toLowerCase().includes(keyword)
      return titleMatch || pathMatch
    })
    .map(route => ({
      value: route.fullTitle,
      path: route.path,
      title: route.title,
      fullTitle: route.fullTitle,
      icon: route.icon
    }))
    .slice(0, 10) // 限制最多显示10个结果
  
  cb(results)
}

// 处理选择
const handleSelect = (item: any) => {
  if (item.path) {
    router.push(item.path)
    searchKeyword.value = ''
  }
}

// 处理回车键
const handleEnter = () => {
  if (searchKeyword.value.trim()) {
    // 如果只有一个结果，直接跳转
    const keyword = searchKeyword.value.toLowerCase().trim()
    const matches = searchRoutes.value.filter(route => {
      const titleMatch = route.title.toLowerCase().includes(keyword) || 
                        route.fullTitle.toLowerCase().includes(keyword)
      const pathMatch = route.path.toLowerCase().includes(keyword)
      return titleMatch || pathMatch
    })
    
    if (matches.length === 1) {
      router.push(matches[0].path)
      searchKeyword.value = ''
    } else if (matches.length > 1) {
      // 多个结果时，跳转到第一个
      router.push(matches[0].path)
      searchKeyword.value = ''
    }
  }
}

// 定义支持视图模式的页面路径
const VIEW_MODE_PAGES = [
  '/supervision/module1/audit',
  '/supervision/module1/schedule',
  '/supervision/module2/schedule',
  '/supervision/module3/plan',
  // 添加其他需要视图模式切换的页面
]

// 是否显示视图模式切换
const showViewModeSwitch = computed(() => {
  return VIEW_MODE_PAGES.includes(route.path)
})

// 当前视图模式的响应式引用
const currentViewMode = ref<ViewMode>('card')

// 更新当前视图模式
const updateViewMode = () => {
  if (showViewModeSwitch.value) {
    const mode = viewModeStore.getViewMode(route.path) || 'card'
    currentViewMode.value = mode
  } else {
    currentViewMode.value = 'card'
  }
}

// 初始化视图模式
updateViewMode()

// 监听路由变化，更新视图模式
watch(() => route.path, () => {
  updateViewMode()
})

// 监听 store 的 viewModes 变化
watch(() => viewModeStore.viewModes, () => {
  updateViewMode()
}, { deep: true })

// 处理视图模式变化
const handleViewModeChange = (mode: ViewMode) => {
  if (showViewModeSwitch.value) {
    viewModeStore.setViewMode(route.path, mode)
    currentViewMode.value = mode
    // 触发全局事件，让页面组件响应
    window.dispatchEvent(new CustomEvent('view-mode-change', { 
      detail: { mode, path: route.path } 
    }))
  }
}

// 面包屑导航
const breadcrumbs = computed(() => {
  return route.matched
    .filter(item => item.meta?.title)
    .map(item => ({
      path: item.path,
      meta: item.meta
    }))
})

// 是否为顶部布局
const isTopLayout = computed(() => props.layout === 'top')
const isStandardLayout = computed(() => props.layout === 'standard')

// 当前激活的菜单
const activeMenu = computed(() => route.path)

// 全屏切换
const toggleFullscreen = () => {
  if (!document.fullscreenElement) {
    // 进入全屏
    document.documentElement.requestFullscreen().then(() => {
      isFullscreen.value = true
      ElMessage.success('已进入全屏模式')
    }).catch(err => {
      console.error('全屏失败:', err)
      ElMessage.error('全屏失败')
    })
  } else {
    // 退出全屏
    document.exitFullscreen().then(() => {
      isFullscreen.value = false
      ElMessage.success('已退出全屏模式')
    }).catch(err => {
      console.error('退出全屏失败:', err)
      ElMessage.error('退出全屏失败')
    })
  }
}

// 监听全屏状态变化
onMounted(() => {
  document.addEventListener('fullscreenchange', () => {
    isFullscreen.value = !!document.fullscreenElement
  })
})
</script>

<style scoped lang="scss">
.app-header {
  height: 64px;
  background: #fff;
  border-bottom: 1px solid #f0f0f0;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 24px;
  box-shadow: 0 1px 4px rgba(0, 21, 41, 0.08);
  position: relative;
  z-index: 100;
  
  .header-left {
    display: flex;
    align-items: center;
    flex: 1;
    
    .left-content {
      display: flex;
      align-items: center;
      gap: 20px;
      
      .collapse-btn {
        padding: 8px;
        border-radius: 6px;
        color: #666;
        transition: all 0.3s ease;
        
        &:hover {
          background: #f5f5f5;
          color: #1890ff;
        }
      }
      
      .system-title {
        font-size: 18px;
        font-weight: 600;
        color: var(--text-color, #333);
        margin-left: 16px;
        white-space: nowrap;
      }
      
      .breadcrumb-nav {
        :deep(.el-breadcrumb__item) {
          .el-breadcrumb__inner {
            color: #666;
            font-weight: 500;
            
            &.is-current {
              color: #1890ff;
              font-weight: 600;
            }
          }
          
          .breadcrumb-icon {
            margin-right: 4px;
            vertical-align: middle;
          }
        }
      }
    }
  }
  
  .header-right {
    display: flex;
    align-items: center;
    
    .right-content {
      display: flex;
      align-items: center;
      gap: 16px;
      
      // 搜索框
      .search-container {
        .search-input {
          width: 240px;
          
          // el-autocomplete 内部结构：el-autocomplete > el-input > el-input__wrapper
          // 使用 :deep() 穿透 scoped 样式
          :deep(.el-input) {
            .el-input__wrapper {
              border-radius: 20px !important;
              box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1) !important;
              transition: all 0.3s ease !important;
              
              &:hover {
                box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15) !important;
              }
              
              &.is-focus {
                box-shadow: 0 0 0 2px rgba(24, 144, 255, 0.2) !important;
              }
            }
          }
          
          // 直接选择器（双重保险）
          :deep(.el-input__wrapper) {
            border-radius: 20px !important;
            box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1) !important;
            transition: all 0.3s ease !important;
            
            &:hover {
              box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15) !important;
            }
            
            &.is-focus {
              box-shadow: 0 0 0 2px rgba(24, 144, 255, 0.2) !important;
            }
          }
          
          // 前缀图标样式
          :deep(.el-input__prefix) {
            .el-icon {
              color: #909399;
            }
          }
        }
      }
      
      // 通知下拉菜单
      .notification-dropdown {
        .notification-btn {
          padding: 8px;
          border-radius: 6px;
          color: #666;
          transition: all 0.3s ease;
          
          &:hover {
            background: #f5f5f5;
            color: #1890ff;
          }
        }
        
        .notification-menu {
          width: 320px;
          padding: 0;
          
          .notification-header {
            display: flex;
            align-items: center;
            justify-content: space-between;
            padding: 12px 16px;
            border-bottom: 1px solid #f0f0f0;
            
            .notification-title {
              font-weight: 600;
              color: #333;
            }
          }
          
          .notification-item {
            padding: 12px 16px;
            border-bottom: 1px solid #f5f5f5;
            
            &.is-unread {
              background: #f6ffed;
              
              .notification-content {
                .notification-message {
                  font-weight: 600;
                }
              }
            }
            
            .notification-content {
              display: flex;
              align-items: flex-start;
              gap: 12px;
              
              .notification-icon {
                flex-shrink: 0;
                width: 32px;
                height: 32px;
                border-radius: 50%;
                background: #f0f0f0;
                display: flex;
                align-items: center;
                justify-content: center;
                color: #666;
              }
              
              .notification-text {
                flex: 1;
                min-width: 0;
                
                .notification-message {
                  color: #333;
                  font-size: 14px;
                  line-height: 1.4;
                  margin-bottom: 4px;
                }
                
                .notification-time {
                  color: #999;
                  font-size: 12px;
                }
              }
            }
          }
          
          .notification-footer {
            padding: 12px 16px;
            text-align: center;
            border-top: 1px solid #f0f0f0;
          }
        }
      }
      
             // 全屏按钮
       .fullscreen-btn {
         padding: 8px;
         border-radius: 6px;
         color: #666;
         transition: all 0.3s ease;
         
         &:hover {
           background: #f5f5f5;
           color: #1890ff;
         }
       }
       
       // 主题设置按钮
       .theme-btn {
         padding: 8px;
         border-radius: 6px;
         color: #666;
         transition: all 0.3s ease;
         
         &:hover {
           background: #f5f5f5;
           color: #1890ff;
         }
       }
       
       // 用户下拉菜单
       .user-dropdown {
        .user-info {
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 8px 12px;
          border-radius: 8px;
          cursor: pointer;
          transition: all 0.3s ease;
          
          &:hover {
            background: #f5f5f5;
          }
          
          .user-avatar {
            border: 2px solid #f0f0f0;
          }
          
          .user-details {
            display: flex;
            flex-direction: column;
            line-height: 1.2;
            
            .username {
              font-weight: 600;
              color: #333;
              font-size: 14px;
            }
            
            .user-role {
              color: #999;
              font-size: 12px;
            }
          }
          
          .dropdown-arrow {
            color: #999;
            font-size: 12px;
            transition: transform 0.3s ease;
          }
        }
        
        .user-menu {
          min-width: 160px;
          
          .el-dropdown-menu__item {
            display: flex;
            align-items: center;
            gap: 8px;
            padding: 12px 16px;
            
            .el-icon {
              font-size: 16px;
            }
          }
        }
      }
    }
  }
}

// 顶部布局Logo和标题样式
.top-logo-section {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-right: 24px;
  
  .header-logo {
    width: 200px;
    height: 200px;
    object-fit: contain;
    filter: drop-shadow(0 1px 2px rgba(0, 0, 0, 0.1));
  }
  
  .header-title {
    h1 {
      margin: 0;
      font-size: 18px;
      font-weight: 600;
      color: #b71b1e;
      text-shadow: 0 1px 2px rgba(0, 0, 0, 0.1);
      white-space: nowrap;
    }
  }
}

// 顶部布局样式
.top-nav-menu {
  flex: 1;
  display: flex;
  justify-content: center;
  
  .horizontal-menu {
    border: none;
    background: transparent;
    
    :deep(.el-menu-item),
    :deep(.el-sub-menu__title) {
      height: 64px;
      line-height: 64px;
      color: var(--text-color);
      border-bottom: 2px solid transparent;
      font-weight: 500;
      padding: 0 16px;
      
      &:hover {
        background: var(--hover-bg);
        color: var(--primary-color);
        font-weight: 600;
      }
      
      .el-icon {
        color: inherit;
        margin-right: 4px;
      }
    }
    
    :deep(.el-menu-item.is-active) {
      color: var(--primary-color);
      border-bottom-color: var(--primary-color);
      background: var(--active-bg-light);
      font-weight: 600;
      
      .el-icon {
        color: inherit;
      }
    }
    
    // 子菜单样式
    :deep(.el-sub-menu) {
      .el-sub-menu__title {
        display: flex;
        align-items: center;
        
        .el-icon {
          margin-right: 4px;
        }
      }
    }
    
    // 下拉菜单样式
    :deep(.el-menu--popup) {
      .el-menu-item {
        height: 40px;
        line-height: 40px;
        padding: 0 16px;
        
        .el-icon {
          margin-right: 8px;
        }
      }
      
      .el-sub-menu__title {
        height: 40px;
        line-height: 40px;
        padding: 0 16px;
        
        .el-icon {
          margin-right: 8px;
        }
      }
    }
  }
}

// 响应式设计
@media (max-width: 1200px) {
  .app-header {
    padding: 0 16px;
    
    .header-left {
      .left-content {
        gap: 16px;
        
        .breadcrumb-nav {
          display: none;
        }
        
        .top-logo-section {
          gap: 8px;
          margin-right: 16px;
          
          .header-logo {
            width: 32px;
            height: 32px;
          }
          
          .header-title {
            h1 {
              font-size: 16px;
            }
          }
        }
        
        .top-nav-menu {
          .horizontal-menu {
            :deep(.el-menu-item),
            :deep(.el-sub-menu__title) {
              padding: 0 12px;
              font-size: 14px;
            }
          }
        }
      }
    }
    
    .header-right {
      .right-content {
        gap: 12px;
        
        .search-container {
          .search-input {
            width: 180px;
          }
        }
      }
    }
  }
}

@media (max-width: 768px) {
  .app-header {
    padding: 0 12px;
    
    .header-left {
      .left-content {
        gap: 12px;
        
        .top-logo-section {
          gap: 6px;
          margin-right: 12px;
          
          .header-logo {
            width: 28px;
            height: 28px;
          }
          
          .header-title {
            h1 {
              font-size: 14px;
            }
          }
        }
        
        .top-nav-menu {
          display: none; // 在小屏幕上隐藏顶部导航菜单
        }
      }
    }
    
    .header-right {
      .right-content {
        gap: 8px;
        
        .search-container {
          display: none;
        }
        
        .user-dropdown {
          .user-info {
            .user-details {
              display: none;
            }
            
            .dropdown-arrow {
              display: none;
            }
          }
        }
      }
    }
  }
}

// 深色主题适配
body.theme-dark {
  .app-header {
    background: var(--header-bg);
    border-bottom-color: var(--border-color);
    
    .header-left {
      .left-content {
        // 系统标题深色模式适配
        .system-title {
          color: var(--text-color, #e8e8e8);
        }
        
        // 面包屑导航深色模式适配
        .breadcrumb-nav {
          :deep(.el-breadcrumb__item) {
            .el-breadcrumb__inner {
              color: var(--text-color-secondary);
              
              &.is-current {
                color: var(--primary-color);
              }
            }
            
            .breadcrumb-icon {
              color: inherit;
            }
          }
        }
      }
    }
    
    .header-right {
      .right-content {
        .fullscreen-btn {
          color: var(--text-color-secondary);
          font-weight: 500;
          
          &:hover {
            background: var(--hover-bg);
            color: var(--primary-color);
            font-weight: 600;
          }
          
          .el-icon {
            color: inherit;
          }
        }
        
        .theme-btn {
          color: var(--text-color-secondary);
          font-weight: 500;
          
          &:hover {
            background: var(--hover-bg);
            color: var(--primary-color);
            font-weight: 600;
          }
          
          .el-icon {
            color: inherit;
          }
        }
        
        .notification-dropdown {
          .notification-btn {
            color: var(--text-color-secondary);
            font-weight: 500;
            
            &:hover {
              background: var(--hover-bg);
              color: var(--primary-color);
              font-weight: 600;
            }
            
            .el-icon {
              color: inherit;
            }
          }
          
          .notification-menu {
            .notification-item {
              .notification-content {
                .notification-icon {
                  .el-icon {
                    color: var(--text-color-secondary);
                  }
                }
              }
            }
          }
        }
        
        .user-dropdown {
          .user-info {
            &:hover {
              background: var(--hover-bg);
            }
            
            .user-details {
              .username {
                color: var(--text-color);
                font-weight: 600;
              }
              
              .role {
                color: var(--text-color-secondary);
                font-weight: 500;
              }
            }
            
            .dropdown-arrow {
              color: var(--text-color-secondary);
            }
          }
          
          .user-menu {
            .el-dropdown-menu__item {
              .el-icon {
                color: inherit;
              }
            }
          }
        }
        
        // 深色模式下确保所有文字和图标都可见
        .collapse-btn {
          color: var(--text-color-secondary);
          font-weight: 500;
          
          &:hover {
            background: var(--hover-bg);
            color: var(--primary-color);
            font-weight: 600;
          }
          
          .el-icon {
            color: inherit;
          }
        }
        
        .search-container {
          .search-input {
            :deep(.el-input__wrapper) {
              .el-input__inner {
                color: var(--text-color);
                
                &::placeholder {
                  color: var(--text-color-placeholder);
                }
              }
            }
          }
        }
        
        .notification-dropdown {
          .notification-menu {
            .notification-header {
              .notification-title {
                color: var(--text-color);
              }
            }
            
            .notification-item {
              .notification-content {
                .notification-text {
                  .notification-message {
                    color: var(--text-color);
                  }
                  
                  .notification-time {
                    color: var(--text-color-secondary);
                  }
                }
              }
            }
          }
        }
        
        // 顶部Logo和标题深色主题适配
        .top-logo-section {
          .header-title {
            h1 {
              color: var(--primary-color);
            }
          }
        }
        
        // 顶部导航菜单深色主题适配
        .top-nav-menu {
          .horizontal-menu {
            :deep(.el-menu-item),
            :deep(.el-sub-menu__title) {
              color: var(--text-color);
              
              &:hover {
                background: var(--hover-bg);
                color: var(--primary-color);
              }
              
              .el-icon {
                color: inherit;
              }
            }
            
            :deep(.el-menu-item.is-active) {
              color: var(--primary-color);
              border-bottom-color: var(--primary-color);
              background: var(--active-bg-light);
              
              .el-icon {
                color: inherit;
              }
            }
            
            :deep(.el-menu--popup) {
              background: var(--bg-color);
              border: 1px solid var(--border-color);
              
              .el-menu-item {
                color: var(--text-color);
                
                &:hover {
                  background: var(--hover-bg);
                  color: var(--primary-color);
                }
                
                .el-icon {
                  color: inherit;
                }
              }
              
              .el-sub-menu__title {
                color: var(--text-color);
                
                &:hover {
                  background: var(--hover-bg);
                  color: var(--primary-color);
                }
                
                .el-icon {
                  color: inherit;
                }
              }
            }
          }
        }
      }
    }
  }
}

</style>

<style lang="scss">
// 搜索框样式（全局样式，确保优先级）
// el-autocomplete 的 DOM 结构：<div class="el-autocomplete search-input"> <div class="el-input"> <div class="el-input__wrapper"> ...
// 使用更通用的选择器确保样式生效 - 直接选择 .search-input 下的所有 .el-input__wrapper
.app-header .header-right .right-content .search-container .search-input .el-input__wrapper {
  border-radius: 20px !important;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1) !important;
  transition: all 0.3s ease !important;
  
  &:hover {
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15) !important;
  }
  
  &.is-focus {
    box-shadow: 0 0 0 2px rgba(24, 144, 255, 0.2) !important;
  }
}

// 前缀图标样式
.app-header .header-right .right-content .search-container .search-input .el-input__prefix .el-icon {
  color: #909399 !important;
}

// 深色主题下的搜索框样式
body.theme-dark .app-header .header-right .right-content .search-container .search-input .el-input__wrapper {
  background: var(--fill-color) !important;
  border-color: var(--border-color) !important;
  
  .el-input__inner {
    color: var(--text-color) !important;
    
    &::placeholder {
      color: var(--text-color-placeholder) !important;
    }
  }
}

// 搜索建议下拉菜单样式（全局样式，因为el-autocomplete的popper挂载在body上）
.search-suggestions {
  .el-autocomplete-suggestion__list {
    padding: 8px 0;
    
    .search-item {
      display: flex;
      align-items: center;
      gap: 12px;
      padding: 12px 16px;
      cursor: pointer;
      transition: background-color 0.2s;
      
      &:hover {
        background-color: #f5f7fa;
      }
      
      .search-item-icon {
        font-size: 18px;
        color: #909399;
        flex-shrink: 0;
      }
      
      .search-item-content {
        flex: 1;
        min-width: 0;
        
        .search-item-title {
          font-size: 14px;
          color: #303133;
          font-weight: 500;
          margin-bottom: 4px;
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
        }
        
        .search-item-path {
          font-size: 12px;
          color: #909399;
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
        }
      }
    }
  }
}

// 深色主题下的搜索建议样式
body.theme-dark {
  .search-suggestions {
    background: var(--bg-color);
    border: 1px solid var(--border-color);
    
    .el-autocomplete-suggestion__list {
      .search-item {
        &:hover {
          background-color: var(--hover-bg);
        }
        
        .search-item-icon {
          color: var(--text-color-secondary);
        }
        
        .search-item-content {
          .search-item-title {
            color: var(--text-color);
          }
          
          .search-item-path {
            color: var(--text-color-secondary);
          }
        }
      }
    }
  }
}
</style>