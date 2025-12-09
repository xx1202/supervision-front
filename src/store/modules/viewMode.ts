/**
 * 视图模式状态管理
 * 用于全局存储和管理各页面的视图模式偏好
 */
import { defineStore } from 'pinia'
import { ref } from 'vue'

export type ViewMode = 'card' | 'table'

export const useViewModeStore = defineStore('viewMode', () => {
  // 存储各页面的视图模式偏好，key 为页面标识，value 为视图模式
  const viewModes = ref<Record<string, ViewMode>>({})

  /**
   * 获取指定页面的视图模式
   * @param pageKey 页面唯一标识
   */
  const getViewMode = (pageKey: string): ViewMode | null => {
    // 优先从 localStorage 读取（持久化）
    const stored = localStorage.getItem(`viewMode_${pageKey}`)
    if (stored && (stored === 'card' || stored === 'table')) {
      viewModes.value[pageKey] = stored as ViewMode
      return stored as ViewMode
    }
    // 从内存读取
    return viewModes.value[pageKey] || null
  }

  /**
   * 设置指定页面的视图模式
   * @param pageKey 页面唯一标识
   * @param mode 视图模式
   */
  const setViewMode = (pageKey: string, mode: ViewMode) => {
    viewModes.value[pageKey] = mode
    // 持久化到 localStorage
    localStorage.setItem(`viewMode_${pageKey}`, mode)
  }

  /**
   * 清除指定页面的视图模式偏好
   * @param pageKey 页面唯一标识
   */
  const clearViewMode = (pageKey: string) => {
    delete viewModes.value[pageKey]
    localStorage.removeItem(`viewMode_${pageKey}`)
  }

  /**
   * 清除所有页面的视图模式偏好
   */
  const clearAllViewModes = () => {
    viewModes.value = {}
    // 清除所有相关的 localStorage 项
    Object.keys(localStorage).forEach(key => {
      if (key.startsWith('viewMode_')) {
        localStorage.removeItem(key)
      }
    })
  }

  return {
    viewModes,
    getViewMode,
    setViewMode,
    clearViewMode,
    clearAllViewModes
  }
})

