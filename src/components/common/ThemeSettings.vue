<template>
  <div class="theme-settings">
    <el-drawer
      v-model="visible"
      title="主题设置"
      direction="rtl"
      size="400px"
      :with-header="true"
      :before-close="handleClose"
    >
      <div class="settings-content">
        <!-- 主题模式 -->
        <div class="setting-section">
          <h3 class="section-title">主题模式</h3>
          <div class="theme-modes">
            <div
              v-for="mode in themeModes"
              :key="mode.value"
              class="theme-mode-item"
              :class="{ active: themeConfig.mode === mode.value }"
              @click="toggleThemeMode(mode.value)"
            >
              <div class="mode-preview" :class="mode.value">
                <div class="preview-header"></div>
                <div class="preview-sidebar"></div>
                <div class="preview-content"></div>
              </div>
              <span class="mode-label">{{ mode.label }}</span>
            </div>
          </div>
        </div>

        <!-- 布局设置 -->
        <div class="setting-section">
          <h3 class="section-title">布局设置</h3>
          <div class="layout-options">
            <div class="layout-preview">
              <div
                v-for="layout in layoutOptions"
                :key="layout.value"
                class="layout-item"
                :class="{ active: themeConfig.layout === layout.value }"
                @click="toggleLayout(layout.value)"
              >
                <div class="layout-preview-box" :class="layout.value">
                  <div class="preview-sidebar"></div>
                  <div class="preview-header"></div>
                  <div class="preview-content"></div>
                </div>
                <span class="layout-label">{{ layout.label }}</span>
              </div>
            </div>
          </div>
        </div>

        <!-- 主色调 -->
        <div class="setting-section">
          <h3 class="section-title">主色调</h3>
          
          <!-- Element Plus主题切换 -->
          <div class="element-theme-toggle">
            <div class="toggle-title">Element Plus主题</div>
            <div class="toggle-options">
              <el-switch
                v-model="useCustomElementTheme"
                active-text="自定义主题"
                inactive-text="默认主题"
                @change="toggleElementTheme"
              />
            </div>
            <div class="toggle-description">
              {{ useCustomElementTheme ? '使用自定义配色方案' : '使用Element Plus默认配色' }}
            </div>
          </div>
          
          <!-- 预设颜色 -->
          <div class="color-presets">
            <div class="preset-title">预设颜色</div>
            <div class="color-palette">
              <div
                v-for="color in colorOptions"
                :key="color.value"
                class="color-item"
                :class="{ active: themeConfig.primaryColor === color.value }"
                :style="{ backgroundColor: color.value }"
                @click="setPrimaryColor(color.value)"
              >
                <el-icon v-if="themeConfig.primaryColor === color.value" class="check-icon">
                  <Check />
                </el-icon>
              </div>
            </div>
          </div>
          
          <!-- 自定义颜色 -->
          <div class="custom-color">
            <div class="custom-title">自定义颜色</div>
            <div class="color-picker-container">
              <el-color-picker
                v-model="customColor"
                :show-alpha="false"
                :predefine="predefineColors"
                @change="handleCustomColorChange"
                size="large"
              />
              <div class="current-color-info">
                <div class="color-preview" :style="{ backgroundColor: themeConfig.primaryColor }"></div>
                <span class="color-value">{{ themeConfig.primaryColor }}</span>
              </div>
            </div>
          </div>
        </div>

        <!-- 组件尺寸 -->
        <div class="setting-section">
          <h3 class="section-title">组件尺寸</h3>
          <div class="size-options">
            <el-radio-group v-model="componentSize" @change="handleComponentSizeChange">
              <el-radio-button label="small">小</el-radio-button>
              <el-radio-button label="default">默认</el-radio-button>
              <el-radio-button label="large">大</el-radio-button>
            </el-radio-group>
            <div class="size-description">
              全局组件尺寸，影响按钮、输入框等所有组件
            </div>
          </div>
        </div>

        <!-- 侧边栏设置 -->
        <div class="setting-section">
          <h3 class="section-title">侧边栏设置</h3>
          <div class="sidebar-settings">
            <div class="setting-item">
              <span class="setting-label">侧边栏颜色</span>
              <div class="sidebar-color-picker">
                <el-color-picker
                  v-model="sidebarColor"
                  :show-alpha="false"
                  :predefine="sidebarColorPresets"
                  @change="handleSidebarColorChange"
                  size="default"
                />
                <div class="current-sidebar-color-info">
                  <div class="color-preview" :style="{ backgroundColor: sidebarColor }"></div>
                  <span class="color-value">{{ sidebarColor }}</span>
                </div>
              </div>
            </div>
            
            <div class="setting-item">
              <span class="setting-label">侧边栏宽度</span>
              <div class="sidebar-width-control">
                <el-slider
                  v-model="sidebarWidth"
                  :min="160"
                  :max="320"
                  :step="10"
                  :show-tooltip="true"
                  :format-tooltip="formatWidthTooltip"
                  @change="handleSidebarWidthChange"
                />
                <div class="width-value">{{ sidebarWidth }}px</div>
              </div>
            </div>
            
          </div>
        </div>

        <!-- 重置按钮 -->
        <div class="setting-section">
          <el-button type="primary" @click="resetSettings" block>
            重置设置
          </el-button>
        </div>
      </div>
    </el-drawer>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { Check } from '@element-plus/icons-vue'
import { useThemeStore } from '../../store/theme'
import { logger } from '@/utils/logger'

interface Props {
  modelValue: boolean
}

const props = defineProps<Props>()
const emit = defineEmits<{
  'update:modelValue': [value: boolean]
}>()

const themeStore = useThemeStore()

// 可见性控制
const visible = computed({
  get: () => props.modelValue,
  set: (value) => emit('update:modelValue', value)
})

// 主题配置
const themeConfig = computed(() => themeStore.themeConfig)

// 自定义颜色
const customColor = ref(themeConfig.value.primaryColor)

// 侧边栏颜色
const sidebarColor = ref(themeConfig.value.sidebarColor)

// 侧边栏宽度
const sidebarWidth = ref(themeConfig.value.sidebarWidth)

// 组件尺寸
const componentSize = ref(themeConfig.value.componentSize || 'default')

// Element Plus主题切换
const useCustomElementTheme = ref(localStorage.getItem('use-custom-theme') === 'true')

// 预定义颜色 - 基于 #d32f2f 深红色的配色方案
const predefineColors = [
  '#d32f2f', // 主色：深红色
  '#e53e3e', // 浅红色
  '#ef4444', // 亮红色
  '#f87171', // 粉红色
  '#fca5a5', // 浅粉红
  '#fecaca', // 极浅粉红
  '#fee2e2', // 超浅粉红
  '#fef2f2', // 最浅粉红
  '#2e7d32', // 深绿色
  '#388e3c', // 绿色
  '#4caf50', // 亮绿色
  '#66bb6a', // 浅绿色
  '#ed6c02', // 橙色
  '#f57c00', // 深橙色
  '#ff9800', // 亮橙色
  '#ffb74d', // 浅橙色
  '#1976d2', // 蓝色
  '#2196f3', // 亮蓝色
  '#42a5f5', // 浅蓝色
  '#64b5f6'  // 极浅蓝色
]

// 侧边栏颜色预设
const sidebarColorPresets = [
  '#667eea', // 蓝色
  '#52c41a', // 绿色
  '#fa8c16', // 橙色
  '#f5222d', // 红色
  '#722ed1', // 紫色
  '#13c2c2', // 青色
  '#eb2f96', // 粉色
  '#faad14', // 黄色
  '#333333', // 深色
  '#ffffff'  // 浅色
]

// 主题模式选项
const themeModes = [
  { value: 'light' as const, label: '浅色' },
  { value: 'dark' as const, label: '深色' },
  { value: 'auto' as const, label: '跟随系统' }
]

// 布局选项
const layoutOptions = [
  { value: 'default' as const, label: '默认' },
  { value: 'standard' as const, label: '标准' },
  { value: 'top' as const, label: '顶部' },
  { value: 'right' as const, label: '右侧' }
]

// 颜色选项 - 基于 #d32f2f 深红色的配色方案
const colorOptions = [
  { value: '#d32f2f', label: '深红色' },      // 主色
  { value: '#2e7d32', label: '深绿色' },      // 成功色
  { value: '#ed6c02', label: '橙色' },        // 警告色
  { value: '#1976d2', label: '蓝色' },        // 信息色
  { value: '#7b1fa2', label: '紫色' },       // 辅助色1
  { value: '#f57c00', label: '深橙色' },      // 辅助色2
  { value: '#388e3c', label: '绿色' },        // 辅助色3
  { value: '#1565c0', label: '深蓝色' }       // 辅助色4
]

// 方法
const toggleThemeMode = (mode: 'light' | 'dark' | 'auto') => {
  themeStore.toggleThemeMode(mode)
}

const toggleLayout = (layout: 'default' | 'top' | 'right' | 'standard') => {
  themeStore.toggleLayout(layout)
}

const setPrimaryColor = (color: string) => {
  themeStore.setPrimaryColor(color)
  customColor.value = color
}

const handleCustomColorChange = (color: string) => {
  if (color) {
    themeStore.setPrimaryColor(color)
  }
}

const handleSidebarColorChange = (color: string) => {
  if (color) {
    themeStore.setSidebarColor(color)
    sidebarColor.value = color
  }
}

const handleSidebarWidthChange = (width: number) => {
  themeStore.setSidebarWidth(width)
}

const formatWidthTooltip = (value: number) => {
  return `${value}px`
}

const handleComponentSizeChange = (size: 'large' | 'default' | 'small') => {
  themeStore.setComponentSize(size)
}

const toggleElementTheme = () => {
  logger.debug('🔄 切换Element Plus主题:', useCustomElementTheme.value ? '自定义主题' : '默认主题')
  localStorage.setItem('use-custom-theme', useCustomElementTheme.value.toString())
  
  // 调用全局主题切换函数
  const globalApp = (window as any).$app
  if (globalApp && globalApp.$switchTheme) {
    logger.debug('✅ 调用全局主题切换函数')
    globalApp.$switchTheme(useCustomElementTheme.value)
  } else {
    logger.debug('⚠️ 全局函数未找到，尝试直接调用主题管理器')
    // 尝试直接调用主题管理器
    const themeManager = (window as any).$themeManager
    if (themeManager && themeManager.switchTheme) {
      themeManager.switchTheme(useCustomElementTheme.value)
    } else {
      logger.debug('⚠️ 主题管理器也未找到，使用页面重载')
      // 如果都没有找到，则重新加载页面
      location.reload()
    }
  }
}

const resetSettings = () => {
  themeStore.themeConfig = {
    mode: 'light',
    primaryColor: '#1890ff',
    layout: 'default',
    sidebarCollapsed: false,
    sidebarWidth: 160,
    headerHeight: 64,
    sidebarColor: '#667eea', // 默认侧边栏颜色
    componentSize: 'default'
  }
  customColor.value = '#1890ff'
  sidebarColor.value = '#667eea'
  sidebarWidth.value = 160
  componentSize.value = 'default'
  themeStore.applyTheme()
}

const handleClose = () => {
  visible.value = false
}
</script>

<style scoped lang="scss">
.theme-settings {
  .settings-content {
    padding: 20px;
    
    .setting-section {
      margin-bottom: 32px;
      
      .section-title {
        font-size: 18px;
        font-weight: 600;
        color: #333;
        margin: 0 0 20px 0;
      }
      
      // 主题模式
      .theme-modes {
        display: grid;
        grid-template-columns: repeat(3, 1fr);
        gap: 12px;
        
        .theme-mode-item {
          text-align: center;
          cursor: pointer;
          padding: 12px;
          border-radius: 8px;
          border: 2px solid transparent;
          transition: all 0.3s ease;
          
          &:hover {
            background: #f5f5f5;
          }
          
          &.active {
            border-color: var(--primary-color);
            background: rgba(24, 144, 255, 0.1);
          }
          
          // 深色模式下的悬停和激活状态
          body.theme-dark & {
            &:hover {
              background: #3a3a3a !important;
            }
            
            &.active {
              background: rgba(0, 120, 212, 0.2) !important;
            }
          }
          
          .mode-preview {
            width: 60px;
            height: 40px;
            margin: 0 auto 8px;
            border-radius: 4px;
            position: relative;
            overflow: hidden;
            
            &.light {
              background: #fff;
              border: 1px solid #e8e8e8;
              
              .preview-header {
                background: #fff;
                border-bottom: 1px solid #e8e8e8;
              }
              
              .preview-sidebar {
                background: #fafafa;
                border-right: 1px solid #e8e8e8;
              }
              
              .preview-content {
                background: #fff;
              }
            }
            
            &.dark {
              background: #141414;
              border: 1px solid #303030;
              
              .preview-header {
                background: #1f1f1f;
                border-bottom: 1px solid #303030;
              }
              
              .preview-sidebar {
                background: #141414;
                border-right: 1px solid #303030;
              }
              
              .preview-content {
                background: #1f1f1f;
              }
            }
            
            &.auto {
              background: linear-gradient(45deg, #fff 50%, #141414 50%);
              border: 1px solid #e8e8e8;
            }
            
            .preview-header {
              height: 8px;
              width: 100%;
            }
            
            .preview-sidebar {
              position: absolute;
              left: 0;
              top: 8px;
              width: 20px;
              height: 32px;
            }
            
            .preview-content {
              position: absolute;
              left: 20px;
              top: 8px;
              right: 0;
              height: 32px;
            }
          }
          
          .mode-label {
            font-size: 14px;
            color: #666;
            font-weight: 500;
          }
          
          // 深色模式下的标签颜色
          body.theme-dark & .mode-label {
            color: #ffffff;
          }
        }
      }
      
             // 组件尺寸
      .size-options {
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
        
        .size-description {
          margin-top: 12px;
          font-size: 12px;
          color: #999;
          line-height: 1.5;
        }
      }
      
      // 布局选项
       .layout-options {
         .layout-preview {
           display: grid;
           grid-template-columns: repeat(2, 1fr);
           gap: 16px;
           
           .layout-item {
             text-align: center;
             cursor: pointer;
             padding: 12px;
             border-radius: 8px;
             border: 2px solid transparent;
             transition: all 0.3s ease;
             
             &:hover {
               background: #f5f5f5;
             }
             
             &.active {
               border-color: var(--primary-color);
               background: rgba(24, 144, 255, 0.1);
             }
             
             // 深色模式下的悬停和激活状态
             body.theme-dark & {
               &:hover {
                 background: #3a3a3a !important;
               }
               
               &.active {
                 background: rgba(0, 120, 212, 0.2) !important;
               }
             }
             
             .layout-preview-box {
               width: 80px;
               height: 60px;
               margin: 0 auto 8px;
               border-radius: 4px;
               border: 1px solid #e8e8e8;
               position: relative;
               overflow: hidden;
               background: #fff;
               
               &.default {
                 .preview-sidebar {
                   position: absolute;
                   left: 0;
                   top: 0;
                   width: 20px;
                   height: 100%;
                   background: #667eea;
                 }
                 
                 .preview-header {
                   position: absolute;
                   left: 20px;
                   top: 0;
                   right: 0;
                   height: 8px;
                   background: #f0f0f0;
                 }
                 
                 .preview-content {
                   position: absolute;
                   left: 20px;
                   top: 8px;
                   right: 0;
                   bottom: 0;
                   background: #fff;
                 }
               }
               
               &.top {
                 .preview-sidebar {
                   position: absolute;
                   left: 0;
                   top: 0;
                   right: 0;
                   height: 12px;
                   background: #667eea;
                 }
                 
                 .preview-header {
                   position: absolute;
                   left: 0;
                   top: 12px;
                   right: 0;
                   height: 8px;
                   background: #f0f0f0;
                 }
                 
                 .preview-content {
                   position: absolute;
                   left: 0;
                   top: 20px;
                   right: 0;
                   bottom: 0;
                   background: #fff;
                 }
               }
               
               
               
                               &.right {
                  .preview-sidebar {
                    position: absolute;
                    right: 0;
                    top: 0;
                    width: 20px;
                    height: 100%;
                    background: #667eea;
                  }
                  
                  .preview-header {
                    position: absolute;
                    left: 0;
                    top: 0;
                    right: 20px;
                    height: 8px;
                    background: #f0f0f0;
                  }
                  
                  .preview-content {
                    position: absolute;
                    left: 0;
                    top: 8px;
                    right: 20px;
                    bottom: 0;
                    background: #fff;
                  }
                }
                
                &.standard {
                  .preview-sidebar {
                    position: absolute;
                    left: 0;
                    top: 8px;
                    width: 20px;
                    height: calc(100% - 8px);
                    background: #667eea;
                  }
                  
                  .preview-header {
                    position: absolute;
                    left: 0;
                    top: 0;
                    right: 0;
                    height: 8px;
                    background: #f0f0f0;
                  }
                  
                  .preview-content {
                    position: absolute;
                    left: 20px;
                    top: 8px;
                    right: 0;
                    bottom: 0;
                    background: #fff;
                  }
                }
             }
             
                           .layout-label {
                font-size: 14px;
                color: #666;
                font-weight: 500;
              }
              
              // 深色模式下的标签颜色
              body.theme-dark & {
                color: #ffffff;
              }
           }
         }
       }
      
      // 预设颜色
      .color-presets {
        margin-bottom: 24px;
        
        .preset-title {
          font-size: 16px;
          font-weight: 600;
          color: #666;
          margin-bottom: 16px;
        }
        
        .color-palette {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 12px;
          
          .color-item {
            width: 40px;
            height: 40px;
            border-radius: 8px;
            cursor: pointer;
            border: 2px solid transparent;
            display: flex;
            align-items: center;
            justify-content: center;
            transition: all 0.3s ease;
            position: relative;
            
            &:hover {
              transform: scale(1.1);
            }
            
            &.active {
              border-color: #333;
              
              .check-icon {
                color: #fff;
                font-size: 16px;
              }
            }
          }
        }
      }
      
             // 自定义颜色
       .custom-color {
                   .custom-title {
            font-size: 16px;
            font-weight: 600;
            color: #666;
            margin-bottom: 16px;
          }
         
         .color-picker-container {
           display: flex;
           align-items: center;
           gap: 16px;
           
           .current-color-info {
             display: flex;
             align-items: center;
             gap: 8px;
             
             .color-preview {
               width: 24px;
               height: 24px;
               border-radius: 4px;
               border: 1px solid #e8e8e8;
             }
             
             .color-value {
               font-family: 'Courier New', monospace;
               font-size: 12px;
               color: #666;
               background: #f5f5f5;
               padding: 2px 6px;
               border-radius: 3px;
             }
           }
         }
       }
       
       // 侧边栏设置
       .sidebar-settings {
         .setting-item {
           display: flex;
           flex-direction: column;
           align-items: flex-start;
           padding: 16px 0;
           border-bottom: 1px solid #f0f0f0;
           
           &:last-child {
             border-bottom: none;
           }
           
           .setting-label {
             font-size: 16px;
             color: #333;
             font-weight: 500;
             margin-bottom: 12px;
             width: 100%;
           }
           
           .sidebar-color-picker {
             display: flex;
             align-items: center;
             gap: 16px;
             width: 100%;
             
             .current-sidebar-color-info {
               display: flex;
               align-items: center;
               gap: 8px;
               
               .color-preview {
                 width: 24px;
                 height: 24px;
                 border-radius: 4px;
                 border: 1px solid #e8e8e8;
               }
               
               .color-value {
                 font-family: 'Courier New', monospace;
                 font-size: 12px;
                 color: #666;
                 background: #f5f5f5;
                 padding: 2px 6px;
                 border-radius: 3px;
               }
             }
           }
           
           .sidebar-width-control {
             display: flex;
             align-items: center;
             gap: 16px;
             width: 100%;
             
             :deep(.el-slider) {
               flex: 1;
             }
             
             .width-value {
               font-family: 'Courier New', monospace;
               font-size: 14px;
               font-weight: 600;
               color: #333;
               background: #f5f5f5;
               padding: 4px 12px;
               border-radius: 4px;
               min-width: 60px;
               text-align: center;
             }
           }
           
         }
       }
    }
  }
}

/* Element Plus主题切换 */
.element-theme-toggle {
  margin-bottom: 20px;
  padding: 16px;
  background: var(--el-fill-color-light);
  border-radius: 8px;
  border: 1px solid var(--el-border-color-light);
}

.toggle-title {
  font-size: 14px;
  font-weight: 500;
  color: var(--el-text-color-primary);
  margin-bottom: 12px;
}

.toggle-options {
  margin-bottom: 8px;
}

.toggle-description {
  font-size: 12px;
  color: var(--el-text-color-secondary);
  line-height: 1.4;
}

// 深色模式下的 Element Plus 主题切换区域
body.theme-dark {
  .element-theme-toggle {
    background: #2d2d30 !important;
    border-color: #3a3a3a !important;
  }
  
  .toggle-title {
    color: #ffffff !important;
  }
  
  .toggle-description {
    color: #cccccc !important;
  }
}

// 深色主题适配 - Windows 深色模式风格
body.theme-dark {
  .theme-settings {
    .el-drawer {
      background-color: #202020 !important;
      
      .el-drawer__header {
        background-color: #202020 !important;
        border-bottom-color: #3a3a3a !important;
        color: #ffffff !important;
      }
      
      .el-drawer__body {
        background-color: #202020 !important;
        color: #ffffff !important;
      }
      
      .el-drawer__title {
        color: #ffffff !important;
        font-weight: 600 !important;
      }
    }
  }
  
  .settings-content {
    background-color: #202020 !important;
    color: #ffffff !important;
    
    .setting-section {
      .section-title {
        color: #ffffff !important;
        font-weight: 600 !important;
        font-size: 18px !important;
      }
      
      .size-options {
        .size-description {
          color: #cccccc !important;
        }
        
        :deep(.el-radio-group) {
          .el-radio-button {
            .el-radio-button__inner {
              background-color: #2d2d30 !important;
              border-color: #3a3a3a !important;
              color: #ffffff !important;
              
              &:hover {
                color: var(--primary-color, #0078d4) !important;
              }
            }
            
            &.is-active {
              .el-radio-button__inner {
                background-color: var(--primary-color, #0078d4) !important;
                border-color: var(--primary-color, #0078d4) !important;
                color: #ffffff !important;
              }
            }
          }
        }
      }
      
      .theme-modes {
        .theme-mode-item {
          background-color: #2d2d30 !important;
          border: 1px solid #3a3a3a !important;
          
          &:hover {
            background: #3a3a3a !important;
            border-color: var(--primary-color, #0078d4) !important;
          }
          
          &.active {
            background: rgba(0, 120, 212, 0.2) !important;
            border-color: var(--primary-color, #0078d4) !important;
            box-shadow: 0 0 0 1px var(--primary-color, #0078d4) !important;
          }
          
          .mode-label {
            color: #ffffff !important;
            font-weight: 400 !important;
            font-size: 14px !important;
          }
          
          // 深色模式下的预览框样式
          .mode-preview {
            &.light {
              background: #fff !important;
              border-color: #3a3a3a !important;
            }
            
            &.dark {
              background: #141414 !important;
              border-color: #3a3a3a !important;
            }
            
            &.auto {
              background: linear-gradient(45deg, #fff 50%, #141414 50%) !important;
              border-color: #3a3a3a !important;
            }
          }
        }
      }
      
      .layout-options {
        .layout-preview {
          .layout-item {
            background-color: #2d2d30 !important;
            border: 1px solid #3a3a3a !important;
            
            &:hover {
              background: #3a3a3a !important;
              border-color: var(--primary-color, #0078d4) !important;
            }
            
            &.active {
              background: rgba(0, 120, 212, 0.2) !important;
              border-color: var(--primary-color, #0078d4) !important;
              box-shadow: 0 0 0 1px var(--primary-color, #0078d4) !important;
            }
            
            .layout-label {
              color: #ffffff !important;
              font-weight: 400 !important;
              font-size: 14px !important;
            }
            
            // 深色模式下的布局预览框
            .layout-preview-box {
              border-color: #3a3a3a !important;
              background: #1f1f1f !important;
              
              .preview-header {
                background: #2d2d30 !important;
              }
              
              .preview-content {
                background: #1f1f1f !important;
              }
            }
          }
        }
      }
      
      .color-presets {
        .preset-title {
          color: #ffffff !important;
          font-weight: 600 !important;
          font-size: 16px !important;
        }
        
        .color-palette {
          .color-item {
            border: 2px solid #3a3a3a !important;
            
            &:hover {
              border-color: var(--primary-color, #0078d4) !important;
              transform: scale(1.05) !important;
            }
            
            &.active {
              border-color: var(--primary-color, #0078d4) !important;
              box-shadow: 0 0 0 2px var(--primary-color, #0078d4) !important;
            }
            
            .check-icon {
              color: #ffffff !important;
              font-size: 16px !important;
              font-weight: bold !important;
            }
          }
        }
      }
      
      .custom-color {
        .custom-title {
          color: #ffffff !important;
          font-weight: 600 !important;
          font-size: 16px !important;
        }
        
        .color-picker-container {
          .current-color-info {
            .color-preview {
              border: 1px solid #3a3a3a !important;
              box-shadow: 0 1px 3px rgba(0, 0, 0, 0.2) !important;
            }
            
            .color-value {
              color: #ffffff !important;
              background: #2d2d30 !important;
              border: 1px solid #3a3a3a !important;
              font-weight: 400 !important;
              padding: 4px 8px !important;
            }
          }
        }
      }
      
      .sidebar-settings {
        .setting-item {
          background-color: #2d2d30 !important;
          border: 1px solid #3a3a3a !important;
          border-radius: 4px !important;
          padding: 16px !important;
          margin-bottom: 8px !important;
          
          &:last-child {
            border-bottom: 1px solid #3a3a3a !important;
          }
          
          .setting-label {
            color: #ffffff !important;
            font-weight: 400 !important;
            font-size: 14px !important;
            margin-bottom: 12px !important;
          }
          
          .sidebar-color-picker {
            .current-sidebar-color-info {
              .color-preview {
                border: 1px solid #3a3a3a !important;
                box-shadow: 0 1px 3px rgba(0, 0, 0, 0.2) !important;
              }
              
              .color-value {
                color: #ffffff !important;
                background: #2d2d30 !important;
                border: 1px solid #3a3a3a !important;
                font-weight: 400 !important;
                padding: 4px 8px !important;
              }
            }
          }
          
          .sidebar-width-control {
            .width-value {
              color: #ffffff !important;
              background: #2d2d30 !important;
              border: 1px solid #3a3a3a !important;
              font-weight: 600 !important;
            }
            
            :deep(.el-slider) {
              .el-slider__runway {
                background-color: #3a3a3a !important;
              }
              
              .el-slider__bar {
                background-color: var(--primary-color, #0078d4) !important;
              }
              
              .el-slider__button {
                border-color: var(--primary-color, #0078d4) !important;
              }
            }
          }
          
        }
      }
      
      // Element Plus 组件深色主题样式 - Windows 风格
      :deep(.el-switch) {
        .el-switch__label {
          color: #ffffff !important;
          font-weight: 400 !important;
          font-size: 14px !important;
        }
        
        .el-switch__core {
          background-color: #3a3a3a !important;
          border-color: #3a3a3a !important;
          
          .el-switch__action {
            background-color: #ffffff !important;
          }
        }
      }
      
      :deep(.el-button) {
        &.el-button--primary {
          background: #0078d4 !important;
          border: 1px solid #0078d4 !important;
          color: #ffffff !important;
          font-weight: 600 !important;
          font-size: 14px !important;
          padding: 8px 16px !important;
          border-radius: 4px !important;
          
          &:hover {
            background: #106ebe !important;
            border-color: #106ebe !important;
          }
          
          &:active {
            background: #005a9e !important;
            border-color: #005a9e !important;
          }
        }
      }
      
      :deep(.el-color-picker) {
        .el-color-picker__trigger {
          border: 1px solid #3a3a3a !important;
          border-radius: 4px !important;
          box-shadow: 0 1px 3px rgba(0, 0, 0, 0.2) !important;
          
          &:hover {
            border-color: #0078d4 !important;
          }
        }
      }
      
      // 全局文字颜色优化 - 只针对文本元素，不包含颜色块等
      :deep(p),
      :deep(span:not(.color-item):not(.el-color-picker__color)),
      :deep(div:not(.color-item):not(.el-color-picker__color)),
      :deep(h1),
      :deep(h2),
      :deep(h3),
      :deep(h4),
      :deep(h5),
      :deep(h6),
      :deep(label) {
        color: #ffffff !important;
      }
      
      // 确保颜色选择器的颜色块不被影响
      :deep(.color-item),
      :deep(.el-color-picker__color),
      :deep(.el-color-picker__trigger) {
        color: inherit !important;
      }
      
      :deep(.check-icon) {
        color: #ffffff !important;
      }
      
      // Windows 风格的预览框
      :deep(.mode-preview),
      :deep(.layout-preview-box) {
        border: 1px solid #3a3a3a !important;
        box-shadow: 0 1px 3px rgba(0, 0, 0, 0.2) !important;
      }
    }
  }
}
</style> 