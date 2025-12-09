/**
 * 视图模式管理组合式函数
 * 用于统一管理页面视图模式的切换（卡片/表格）
 */
import { ref, watch } from 'vue'
import { useViewModeStore } from '@/store/modules/viewMode'

export type ViewMode = 'card' | 'table'

/**
 * 使用视图模式
 * @param pageKey 页面唯一标识，用于区分不同页面的视图模式偏好
 * @param defaultMode 默认视图模式
 * @param onModeChange 视图模式切换回调函数
 */
export function useViewMode(
  pageKey: string,
  defaultMode: ViewMode = 'card',
  onModeChange?: (mode: ViewMode) => void
) {
  const viewModeStore = useViewModeStore()
  
  // 从 store 获取或使用默认值
  const storedMode = viewModeStore.getViewMode(pageKey)
  const initialMode = storedMode || defaultMode
  
  // 如果 store 中没有值，立即保存默认值
  if (!storedMode) {
    viewModeStore.setViewMode(pageKey, defaultMode)
  }
  
  const viewMode = ref<ViewMode>(initialMode)

  // 监听视图模式变化，保存到 store
  watch(viewMode, (newMode) => {
    viewModeStore.setViewMode(pageKey, newMode)
    onModeChange?.(newMode)
  }, { immediate: false })

  /**
   * 切换视图模式
   */
  const handleViewModeChange = (mode: ViewMode) => {
    viewMode.value = mode
  }

  /**
   * 重置视图模式
   */
  const resetViewMode = () => {
    viewMode.value = defaultMode
    viewModeStore.setViewMode(pageKey, defaultMode)
  }

  return {
    viewMode,
    handleViewModeChange,
    resetViewMode
  }
}

