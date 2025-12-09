import  type { RouteRecordRaw } from 'vue-router'
import Login from '@/views/public/login.vue'

const publicRoutes: RouteRecordRaw[] = [
  {
    path: '/',
    redirect: '/login'
  },
  {
    name: 'login',
    path: '/login',
    component: Login,
    meta: { 
      requiresAuth: false,
      title: '系统登录'
    }
  },
  {
    path: '/404',
    name: 'not-found',
    component: () => import('@/views/public/404.vue'),
    meta: { 
      requiresAuth: false,
      title: '页面不存在'
    }
  }
]

export default publicRoutes