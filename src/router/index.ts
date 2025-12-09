import { createRouter, createWebHistory } from 'vue-router'
import type { RouteRecordRaw } from 'vue-router'

// 导入模块路由
import loginRoutes from './modules/login-routes'
import dashboardRoutes from './modules/dashboard-routes'
import supervisionRoutes from './modules/supervision-routes'
import basicDataRoutes from './modules/basic-data-routes'
import systemRoutes from './modules/system-routes'
import statisticsRoutes from './modules/statistics-routes'
import userRoutes from './modules/user-routes'

// 导入路由守卫
import { authGuard } from './guards/auth-guard'
import { permissionGuard } from './guards/permission-guard'

const routes: RouteRecordRaw[] = [
  // 根路径重定向到仪表板
  {
    path: '/',
    redirect: '/dashboard'
  },
  
  // 登录页面（不需要布局）
  ...loginRoutes,
  
  // 主布局路由
  {
    path: '/dashboard',  // 改为具体路径，避免冲突
    component: () => import('@/layouts/MainLayout.vue'),
    children: [
      // 仪表板
      ...dashboardRoutes,
      
      // 督导管理
      ...supervisionRoutes,
      
      // 基础数据管理
      ...basicDataRoutes,
      
      // 系统管理
      ...systemRoutes,
      
      // 统计分析
      ...statisticsRoutes,
      
      // 用户页面
      ...userRoutes
    ]
  },
  
  // 404页面（不需要布局）
  {
    path: '/:pathMatch(.*)*',
    name: 'NotFound',
    component: () => import('@/views/common/404.vue')
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

// 注册路由守卫 - 确保认证检查在权限检查之前
router.beforeEach(authGuard)      // 先执行认证检查
router.beforeEach(permissionGuard) // 后执行权限检查

export default router