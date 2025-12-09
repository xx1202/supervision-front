/**
 * 主题管理器 - 简化版
 * 只负责逻辑，CSS变量由SCSS文件管理
 */

import { logger } from './logger'

// 应用主题
export const applyTheme = async (useCustom: boolean) => {
  try {
    if (useCustom) {
      // 导入自定义主题样式 - CSS变量由SCSS文件自动设置
      await import('../styles/element-custom-theme.scss')
      logger.debug('✅ 已应用自定义主题')
    } else {
      // 恢复到默认主题 - 重新加载页面清除自定义样式
      logger.debug('✅ 已恢复默认主题')
    }
  } catch (error) {
    console.error('❌ 主题切换失败:', error)
    // 如果切换失败，自动回退到默认主题
    localStorage.setItem('use-custom-theme', 'false')
  }
}

// 获取当前主题状态
export const getCurrentTheme = () => localStorage.getItem('use-custom-theme') === 'true'

// 初始化主题
export const initTheme = async () => {
  const useCustom = getCurrentTheme()
  logger.debug('🎨 当前主题:', useCustom ? '自定义' : '默认')
  await applyTheme(useCustom)
}
