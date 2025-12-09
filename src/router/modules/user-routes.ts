import type { RouteRecordRaw } from 'vue-router' 

const userRoutes: RouteRecordRaw[] = [
  {
    name: 'user-home',
    path: '/user/home',
    component: () => import('@/views/user/home.vue'),
    meta: { 
      requiresAuth: true,
      role: 'user',
      title: '用户首页'
    }
  }
]

export default userRoutes