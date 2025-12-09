<template>
  <div class="breadcrumb-tabs">
    <div class="left-section">
      <el-button 
        type="text" 
        class="back-button"
        @click="goBack"
        v-if="canGoBack"
      >
        <el-icon><ArrowLeft /></el-icon>
        <span>返回</span>
      </el-button>
      <span class="main-title">{{ currentPage?.title }}</span>
    </div>

    <!-- 右侧标签页 -->
    <div class="tabs-section">
      <div class="tabs-container">
        <!-- 所有标签，包括当前激活的 -->
        <div 
          v-for="tab in allTabs" 
          :key="tab.path"
          class="tab-item"
          :class="{ active: tab.path === currentPath }"
          :style="{ 
            backgroundColor: tab.path === currentPath ? computedActiveTabColor : '',
            borderColor: tab.path === currentPath ? computedActiveTabColor : ''
          }"
          @click="switchTab(tab)"
        >
          <el-icon 
            v-if="tab.path === currentPath" 
            class="tab-icon"
          >
            <CircleCheck />
          </el-icon>
          <span class="tab-text">{{ tab.title }}</span>
          <el-icon 
            class="close-icon"
            @click.stop="closeTab(tab)"
            v-if="tab.closable !== false"
          >
            <Close />
          </el-icon>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { ArrowLeft, CircleCheck, Close } from '@element-plus/icons-vue'
import { useThemeStore } from '../../store/theme'
import { useRouter } from 'vue-router'

interface TabItem {
  path: string
  title: string
  closable?: boolean
}

interface Props {
  currentPath: string
  tabs: TabItem[]
  activeTabColor?: string
  maxTabs?: number // 最大标签数量，超过此数量时自动删除前面的标签
}

const props = withDefaults(defineProps<Props>(), {
  activeTabColor: '',
  maxTabs: 10 // 默认最多显示10个标签
})

const emit = defineEmits<{
  'switch-tab': [tab: TabItem]
  'close-tab': [tab: TabItem]
}>()

// 获取主题存储和路由
const themeStore = useThemeStore()
const router = useRouter()

// 动态计算激活标签的颜色
const computedActiveTabColor = computed(() => {
  // 如果props中指定了颜色，优先使用
  if (props.activeTabColor) {
    return props.activeTabColor
  }
  
  // 否则使用CSS变量中的主题色
  const root = document.documentElement
  const cssPrimaryColor = getComputedStyle(root).getPropertyValue('--primary-color')
  
  // 如果CSS变量存在且有效，使用它
  if (cssPrimaryColor && cssPrimaryColor.trim() !== '') {
    return cssPrimaryColor.trim()
  }
  
  // 否则使用主题存储中的颜色
  return themeStore.themeConfig.primaryColor
})

// 当前页面
const currentPage = computed(() => {
  return props.tabs.find(tab => tab.path === props.currentPath)
})

// 所有标签页（包括当前激活的）
// 当标签数量超过 maxTabs 时，自动删除前面的标签，只保留最后 maxTabs 个
// 确保当前激活的标签始终可见
const allTabs = computed(() => {
  const tabs = props.tabs
  const maxTabs = props.maxTabs
  
  // 如果标签数量不超过限制，直接返回所有标签
  if (tabs.length <= maxTabs) {
    return tabs
  }
  
  // 找到当前激活标签的索引
  const activeIndex = tabs.findIndex(tab => tab.path === props.currentPath)
  
  // 如果未找到激活标签，返回最后 maxTabs 个
  if (activeIndex === -1) {
    return tabs.slice(-maxTabs)
  }
  
  // 优先显示最后 maxTabs 个标签（删除前面的标签）
  const lastTabs = tabs.slice(-maxTabs)
  
  // 如果激活标签已经在最后 maxTabs 个中，直接返回
  if (activeIndex >= tabs.length - maxTabs) {
    return lastTabs
  }
  
  // 如果激活标签不在最后 maxTabs 个中，需要确保它被包含
  // 显示从激活标签开始往后的 maxTabs 个标签（这样激活标签会显示在最前面）
  const startIndex = activeIndex
  const endIndex = Math.min(tabs.length, startIndex + maxTabs)
  return tabs.slice(startIndex, endIndex)
})

// 是否可以返回
const canGoBack = computed(() => {
  return router.options.history.state.back !== null
})

// 返回上一个页面
const goBack = () => {
  router.back()
}

// 切换标签
const switchTab = (tab: TabItem) => {
  emit('switch-tab', tab)
}

// 关闭标签
const closeTab = (tab: TabItem) => {
  if (tab.closable !== false) {
    emit('close-tab', tab)
  }
}
</script>

<style scoped lang="scss">
.breadcrumb-tabs {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 12px;
  height: 36px;
  background: var(--breadcrumb-bg, #ffffff);
  border-bottom: 1px solid var(--breadcrumb-border, #f0f0f0);
  
  .left-section {
    display: flex;
    align-items: center;
    gap: 12px;
    
    .back-button {
      display: flex;
      align-items: center;
      gap: 4px;
      padding: 6px 8px;
      border-radius: 4px;
      color: var(--breadcrumb-text, #333);
      font-size: 12px;
      
      &:hover {
        background: var(--breadcrumb-hover, #f5f5f5);
      }
      
      .el-icon {
        font-size: 12px;
      }
    }
    
    .main-title {
      font-size: 14px;
      font-weight: 500;
      color: var(--breadcrumb-text-secondary, #666);
    }
  }
  
  .tabs-section {
    flex: 1;
    margin-left: 16px;
    
    .tabs-container {
      display: flex;
      align-items: center;
      gap: 6px;
      overflow-x: auto;
      
      &::-webkit-scrollbar {
        height: 4px;
      }
      
      &::-webkit-scrollbar-track {
        background: #f1f1f1;
        border-radius: 2px;
      }
      
      &::-webkit-scrollbar-thumb {
        background: #c1c1c1;
        border-radius: 2px;
      }
      
      .tab-item {
        display: flex;
        align-items: center;
        gap: 4px;
        padding: 4px 8px;
        background: var(--tab-bg, #ffffff);
        border: 1px solid var(--tab-border, #e8e8e8);
        border-radius: 4px;
        cursor: pointer;
        transition: all 0.2s ease;
        white-space: nowrap;
        min-width: 0;
        
        &:hover {
          border-color: var(--tab-hover-border, #d9d9d9);
          background: var(--tab-hover-bg, #fafafa);
        }
        
        &.active {
          color: #ffffff;
          border-color: transparent;
          
          .tab-icon {
            color: #ffffff;
            font-size: 10px;
          }
          
          .tab-text {
            color: #ffffff;
            font-weight: 500;
          }
        }
        
        .tab-icon {
          color: var(--primary-color, #52c41a);
          font-size: 10px;
        }
        
        .tab-text {
          font-size: 12px;
          color: var(--tab-text, #333);
          font-weight: 400;
        }
        
        .close-icon {
          color: var(--tab-close, #999);
          font-size: 10px;
          margin-left: 2px;
          padding: 1px;
          border-radius: 2px;
          transition: all 0.2s ease;
          
          &:hover {
            color: var(--tab-close-hover, #666);
            background: var(--tab-close-hover-bg, rgba(0, 0, 0, 0.1));
          }
        }
      }
    }
  }
}

// 深色主题适配 - 使用CSS变量，无需额外选择器
</style> 