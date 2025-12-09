import type { RouteRecordRaw } from 'vue-router'

const statisticsRoutes: RouteRecordRaw[] = [
  {
    path: '/statistics',
    name: 'Statistics',
    redirect: '/statistics/overview',
    meta: {
      title: '统计分析',
      requiresAuth: true
    },
    children: [
      {
        path: 'overview',
        name: 'StatisticsOverview',
        component: () => import('@/views/statistics/overview/index.vue'),
        meta: {
          title: '统计概览',
          requiresAuth: true
        }
      },
      {
        path: 'reports',
        name: 'StatisticsReports',
        component: () => import('@/views/statistics/reports/index.vue'),
        meta: {
          title: '报表管理',
          requiresAuth: true
        }
      },
      {
        path: 'export',
        name: 'StatisticsExport',
        component: () => import('@/views/statistics/export/index.vue'),
        meta: {
          title: '数据导出',
          requiresAuth: true
        }
      }
    ]
  }
]

export default statisticsRoutes 