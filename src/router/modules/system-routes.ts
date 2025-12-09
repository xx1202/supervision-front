import type { RouteRecordRaw } from 'vue-router'

const systemRoutes: RouteRecordRaw[] = [
  {
    path: '/system',
    name: 'System',
    redirect: '/system/users',
    meta: {
      title: '系统管理',
      requiresAuth: true
    },
    children: [
      {
        path: 'users',
        name: 'Users',
        component: () => import('@/views/system/users/index.vue'),
        meta: {
          title: '用户管理',
          requiresAuth: true
        }
      },
      {
        path: 'roles',
        name: 'Roles',
        component: () => import('@/views/system/roles/index.vue'),
        meta: {
          title: '角色管理',
          requiresAuth: true
        }
      },
      {
        path: 'permissions',
        name: 'Permissions',
        component: () => import('@/views/system/permissions/index.vue'),
        meta: {
          title: '权限管理',
          requiresAuth: true
        }
      }
    ]
  }
]

export default systemRoutes 