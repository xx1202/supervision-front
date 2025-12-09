import { defineStore } from 'pinia'
import { ref, watch } from 'vue'
import { colord } from 'colord'

export interface ThemeConfig {
  mode: 'light' | 'dark' | 'auto'
  primaryColor: string
  sidebarColor: string
  layout: 'default' | 'top' | 'right' | 'standard'
  sidebarCollapsed: boolean
  sidebarWidth: number
  headerHeight: number
  componentSize?: 'large' | 'default' | 'small'
}

export const useThemeStore = defineStore('theme', () => {
  // 主题配置
  const themeConfig = ref<ThemeConfig>({
    mode: 'light',
    primaryColor: '#1890ff',
    sidebarColor: '#667eea',
    layout: 'default',
    sidebarCollapsed: false,
    sidebarWidth: 160,
    headerHeight: 64,
    componentSize: 'default'
  })

  // 当前主题模式
  const currentMode = ref<'light' | 'dark'>('light')

  // 初始化主题
  const initTheme = () => {
    // 从localStorage读取配置
    const savedConfig = localStorage.getItem('theme-config')
    if (savedConfig) {
      try {
        const config = JSON.parse(savedConfig)
        themeConfig.value = { ...themeConfig.value, ...config }
      } catch (error) {
        console.error('Failed to parse theme config:', error)
      }
    }

    // 应用主题
    applyTheme()
  }

  // 应用主题
  const applyTheme = () => {
    const { mode, primaryColor, sidebarColor } = themeConfig.value
    
    // 设置主题模式
    if (mode === 'auto') {
      currentMode.value = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
    } else {
      currentMode.value = mode
    }

    // 设置CSS变量
    const root = document.documentElement
    root.style.setProperty('--primary-color', primaryColor)
    root.style.setProperty('--sidebar-color', sidebarColor)
    root.style.setProperty('--sidebar-bg', sidebarColor)
    root.style.setProperty('--sidebar-width', `${themeConfig.value.sidebarWidth}px`)
    root.style.setProperty('--theme-mode', currentMode.value)
    
    // 设置Element Plus主题色
    root.style.setProperty('--el-color-primary', primaryColor)
    
    // 设置面包屑标签组件的CSS变量
    if (currentMode.value === 'dark') {
      // 面包屑和标签页 - 优化配色
      root.style.setProperty('--breadcrumb-bg', '#1e1e1e')
      root.style.setProperty('--breadcrumb-border', '#3a3a3a')
      root.style.setProperty('--breadcrumb-text', '#e8e8e8')
      root.style.setProperty('--breadcrumb-text-secondary', '#b0b0b0')
      root.style.setProperty('--breadcrumb-hover', '#2a2a2a')
      root.style.setProperty('--tab-bg', '#252525')
      root.style.setProperty('--tab-border', '#3a3a3a')
      root.style.setProperty('--tab-hover-border', primaryColor)
      root.style.setProperty('--tab-hover-bg', '#2d2d2d')
      root.style.setProperty('--tab-text', '#e8e8e8')
      root.style.setProperty('--tab-close', '#a8a8a8')
      root.style.setProperty('--tab-close-hover', '#e8e8e8')
      root.style.setProperty('--tab-close-hover-bg', 'rgba(255, 255, 255, 0.12)')
      
      // 主内容区域 - 优化配色
      root.style.setProperty('--bg-color', '#181818')
      root.style.setProperty('--text-color', '#e8e8e8')
      root.style.setProperty('--text-color-secondary', '#b0b0b0')
      root.style.setProperty('--text-color-placeholder', '#808080')
      root.style.setProperty('--border-color', '#3a3a3a')
      root.style.setProperty('--hover-bg', '#2a2a2a')
      root.style.setProperty('--active-bg-light', 'rgba(255, 255, 255, 0.1)')
      root.style.setProperty('--fill-color', '#252525')
      root.style.setProperty('--mask-color', 'rgba(0, 0, 0, 0.75)')
    } else {
      // 面包屑和标签页
      root.style.setProperty('--breadcrumb-bg', '#ffffff')
      root.style.setProperty('--breadcrumb-border', '#f0f0f0')
      root.style.setProperty('--breadcrumb-text', '#333333')
      root.style.setProperty('--breadcrumb-text-secondary', '#666666')
      root.style.setProperty('--breadcrumb-hover', '#f5f5f5')
      root.style.setProperty('--tab-bg', '#ffffff')
      root.style.setProperty('--tab-border', '#e8e8e8')
      root.style.setProperty('--tab-hover-border', primaryColor)
      root.style.setProperty('--tab-hover-bg', '#fafafa')
      root.style.setProperty('--tab-text', '#333333')
      root.style.setProperty('--tab-close', '#999999')
      root.style.setProperty('--tab-close-hover', '#666666')
      root.style.setProperty('--tab-close-hover-bg', 'rgba(0, 0, 0, 0.1)')
      
      // 主内容区域
      root.style.setProperty('--bg-color', '#f5f7fa')
      root.style.setProperty('--text-color', '#333333')
      root.style.setProperty('--text-color-secondary', '#666666')
      root.style.setProperty('--text-color-placeholder', '#999999')
      root.style.setProperty('--border-color', '#e8e8e8')
      root.style.setProperty('--hover-bg', '#f5f5f5')
      root.style.setProperty('--active-bg-light', 'rgba(24, 144, 255, 0.1)')
      root.style.setProperty('--fill-color', '#ffffff')
      root.style.setProperty('--mask-color', 'rgba(255, 255, 255, 0.9)')
    }
    
    // 根据主题色生成Element Plus的渐变色
    const color = colord(primaryColor)
    const lightColors = [3, 5, 7, 8, 9].map(level => color.lighten(level * 0.1).toHex())
    const darkColor = color.darken(0.2).toHex()
    
    root.style.setProperty('--el-color-primary-light-3', lightColors[0])
    root.style.setProperty('--el-color-primary-light-5', lightColors[1])
    root.style.setProperty('--el-color-primary-light-7', lightColors[2])
    root.style.setProperty('--el-color-primary-light-8', lightColors[3])
    root.style.setProperty('--el-color-primary-light-9', lightColors[4])
    root.style.setProperty('--el-color-primary-dark-2', darkColor)
    
    // 设置Element Plus深色主题变量 - 优化配色，提升可读性
    if (currentMode.value === 'dark') {
      // 提升背景色亮度，减少视觉疲劳
      root.style.setProperty('--el-bg-color', '#1e1e1e')
      root.style.setProperty('--el-bg-color-page', '#181818')
      root.style.setProperty('--el-bg-color-overlay', '#252525')
      // 提升文字对比度
      root.style.setProperty('--el-text-color-primary', '#e8e8e8')
      root.style.setProperty('--el-text-color-regular', '#d0d0d0')
      root.style.setProperty('--el-text-color-secondary', '#a8a8a8')
      root.style.setProperty('--el-text-color-placeholder', '#808080')
      // 提升边框可见度
      root.style.setProperty('--el-border-color', '#3a3a3a')
      root.style.setProperty('--el-border-color-light', '#404040')
      root.style.setProperty('--el-border-color-lighter', '#484848')
      root.style.setProperty('--el-border-color-extra-light', '#505050')
      // 优化填充色，增加层次感
      root.style.setProperty('--el-fill-color', '#252525')
      root.style.setProperty('--el-fill-color-light', '#2d2d2d')
      root.style.setProperty('--el-fill-color-lighter', '#353535')
      root.style.setProperty('--el-fill-color-extra-light', '#3d3d3d')
      root.style.setProperty('--el-fill-color-dark', '#1e1e1e')
      root.style.setProperty('--el-fill-color-darker', '#181818')
      root.style.setProperty('--el-mask-color', 'rgba(0, 0, 0, 0.75)')
      root.style.setProperty('--el-mask-color-extra-light', 'rgba(0, 0, 0, 0.4)')
    } else {
      root.style.setProperty('--el-bg-color', '#ffffff')
      root.style.setProperty('--el-bg-color-page', '#f5f7fa')
      root.style.setProperty('--el-bg-color-overlay', '#ffffff')
      root.style.setProperty('--el-text-color-primary', '#303133')
      root.style.setProperty('--el-text-color-regular', '#606266')
      root.style.setProperty('--el-text-color-secondary', '#909399')
      root.style.setProperty('--el-text-color-placeholder', '#c0c4cc')
      root.style.setProperty('--el-border-color', '#dcdfe6')
      root.style.setProperty('--el-border-color-light', '#e4e7ed')
      root.style.setProperty('--el-border-color-lighter', '#ebeef5')
      root.style.setProperty('--el-border-color-extra-light', '#f2f6fc')
      root.style.setProperty('--el-fill-color', '#f0f2f5')
      root.style.setProperty('--el-fill-color-light', '#f5f7fa')
      root.style.setProperty('--el-fill-color-lighter', '#fafafa')
      root.style.setProperty('--el-fill-color-extra-light', '#fafcff')
      root.style.setProperty('--el-fill-color-dark', '#ebedf0')
      root.style.setProperty('--el-fill-color-darker', '#e6e8eb')
      root.style.setProperty('--el-mask-color', 'rgba(255, 255, 255, 0.9)')
      root.style.setProperty('--el-mask-color-extra-light', 'rgba(255, 255, 255, 0.3)')
    }
    
    // 设置body类名
    document.body.className = `theme-${currentMode.value}`
    
    // 保存配置
    localStorage.setItem('theme-config', JSON.stringify(themeConfig.value))
    
    // 强制重新应用主题色（确保深色模式下也能生效）
    setTimeout(() => {
      root.style.setProperty('--primary-color', primaryColor)
      root.style.setProperty('--el-color-primary', primaryColor)
      root.style.setProperty('--el-color-primary-light-3', lightColors[0])
      root.style.setProperty('--el-color-primary-light-5', lightColors[1])
      root.style.setProperty('--el-color-primary-light-7', lightColors[2])
      root.style.setProperty('--el-color-primary-light-8', lightColors[3])
      root.style.setProperty('--el-color-primary-light-9', lightColors[4])
      root.style.setProperty('--el-color-primary-dark-2', darkColor)
    }, 0)
  }

  // 切换主题模式
  const toggleThemeMode = (mode: 'light' | 'dark' | 'auto') => {
    themeConfig.value.mode = mode
    applyTheme()
  }

  // 切换布局
  const toggleLayout = (layout: 'default' | 'top' | 'right' | 'standard') => {
    themeConfig.value.layout = layout
    
    // 根据布局调整侧边栏宽度
    switch (layout) {
      case 'top':
        themeConfig.value.sidebarWidth = 240
        break
      case 'right':
        themeConfig.value.sidebarWidth = 240
        break
      case 'standard':
        themeConfig.value.sidebarWidth = 240
        break
      default:
        themeConfig.value.sidebarWidth = 240
    }
    
    applyTheme()
  }

  // 切换侧边栏状态
  const toggleSidebar = () => {
    themeConfig.value.sidebarCollapsed = !themeConfig.value.sidebarCollapsed
    applyTheme()
  }

  // 设置主色调
  const setPrimaryColor = (color: string) => {
    themeConfig.value.primaryColor = color
    applyTheme()
  }

  // 设置侧边栏颜色
  const setSidebarColor = (color: string) => {
    themeConfig.value.sidebarColor = color
    applyTheme()
  }

  // 设置侧边栏宽度
  const setSidebarWidth = (width: number) => {
    themeConfig.value.sidebarWidth = width
    applyTheme()
  }

  // 设置组件尺寸
  const setComponentSize = (size: 'large' | 'default' | 'small') => {
    themeConfig.value.componentSize = size
    applyTheme()
  }

  // 监听系统主题变化
  const watchSystemTheme = () => {
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)')
    mediaQuery.addEventListener('change', (e) => {
      if (themeConfig.value.mode === 'auto') {
        currentMode.value = e.matches ? 'dark' : 'light'
        applyTheme()
      }
    })
  }

  // 初始化
  initTheme()
  watchSystemTheme()

  return {
    themeConfig,
    currentMode,
    toggleThemeMode,
    toggleLayout,
    toggleSidebar,
    setPrimaryColor,
    setSidebarColor,
    setSidebarWidth,
    setComponentSize,
    applyTheme
  }
}) 