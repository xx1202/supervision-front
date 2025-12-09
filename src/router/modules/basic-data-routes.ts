import type { RouteRecordRaw } from 'vue-router'

const basicDataRoutes: RouteRecordRaw[] = [
  {
    path: '/basic-data',
    name: 'BasicData',
    redirect: '/basic-data/classes',
    meta: {
      title: '基础数据管理',
      requiresAuth: true
    },
    children: [
      {
        path: 'classes',
        name: 'Classes',
        component: () => import('@/views/basic-data/classes/index.vue'),
        meta: {
          title: '班级管理',
          requiresAuth: true
        }
      },
      {
        path: 'classrooms',
        name: 'Classrooms',
        component: () => import('@/views/basic-data/classrooms/index.vue'),
        meta: {
          title: '教室管理',
          requiresAuth: true
        }
      },
      {
        path: 'courses',
        name: 'Courses',
        component: () => import('@/views/basic-data/courses/index.vue'),
        meta: {
          title: '课程管理',
          requiresAuth: true
        }
      },
      {
        path: 'offices',
        name: 'Offices',
        component: () => import('@/views/basic-data/offices/index.vue'),
        meta: {
          title: '办公室管理',
          requiresAuth: true
        }
      },
      {
        path: 'schedules',
        name: 'Schedules',
        component: () => import('@/views/basic-data/schedules/index.vue'),
        meta: {
          title: '课表管理',
          requiresAuth: true
        }
      }
    ]
  }
]

export default basicDataRoutes 