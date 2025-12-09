import { createApp } from 'vue'
import './style.css'
import App from './App.vue'

const app = createApp(App)

import './common.scss'

import router from './router'
app.use(router)

import { createPinia } from 'pinia'
app.use(createPinia())

import ElementPlus from 'element-plus'
import 'element-plus/dist/index.css'

// 导入主题管理器
import { initTheme, applyTheme } from './utils/theme-manager'

// 导入自定义的Element Plus深色主题样式
import './styles/element-dark.scss'
// 注意：Element Plus 的语言配置已移至 App.vue 中的 el-config-provider
app.use(ElementPlus)

// 注册权限指令
import { registerPermissionDirectives } from './directives/permission'
registerPermissionDirectives(app)

// 将主题切换函数挂载到全局
import { logger } from './utils/logger'
app.config.globalProperties.$switchTheme = async (useCustom: boolean) => {
  logger.debug('🔄 切换主题:', useCustom ? '自定义' : '默认')
  await applyTheme(useCustom)
  setTimeout(() => location.reload(), 100)
}

// 挂载应用
app.mount('#app')

// 应用挂载后初始化主题
initTheme()
