import type { RouteRecordRaw } from 'vue-router'

const dashboardRoutes: RouteRecordRaw[] = [
  {
    path: '/dashboard',
    name: 'Dashboard',
    component: () => import('@/views/dashboard/index.vue'),
    meta: {
      title: '仪表板',
      requiresAuth: true
    }
  },
  {
    path: '/dashboard/home',
    name: 'DashboardHome',
    component: () => import('@/views/dashboard/home.vue'),
    meta: {
      title: '首页',
      requiresAuth: true
    }
  }
]

export default dashboardRoutes 