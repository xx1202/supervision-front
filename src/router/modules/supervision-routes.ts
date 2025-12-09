import type { RouteRecordRaw } from 'vue-router'

const supervisionRoutes: RouteRecordRaw[] = [
  {
    path: '/supervision',
    name: 'Supervision',
    redirect: '/supervision/module1',
    meta: {
      title: '督导管理',
      requiresAuth: true
    },
    children: [
      // 模块一：日常教学督导
      {
        path: 'module1',
        name: 'SupervisionModule1',
        redirect: '/supervision/module1/schedule',
        meta: {
          title: '日常教学督导',
          requiresAuth: true
        },
        children: [
          {
            path: 'schedule',
            name: 'SupervisionSchedule',
            component: () => import('@/views/supervision/module1/schedule.vue'),
            meta: {
              title: '督导安排',
              requiresAuth: true
            }
          },
          {
            path: 'record',
            name: 'SupervisionRecord',
            component: () => import('@/views/supervision/module1/record.vue'),
            meta: {
              title: '督导记录',
              requiresAuth: true
            }
          },
          {
            path: 'statistics',
            name: 'SupervisionStatistics',
            component: () => import('@/views/supervision/module1/statistics.vue'),
            meta: {
              title: '督导统计',
              requiresAuth: true
            }
          },
          {
            path: 'document',
            name: 'SupervisionDocument',
            component: () => import('@/views/supervision/module1/document.vue'),
            meta: {
              title: '督导文档',
              requiresAuth: true
            }
          },
          {
            path: 'audit',
            name: 'SupervisionAudit',
            component: () => import('@/views/supervision/module1/audit.vue'),
            meta: {
              title: '督导审核',
              requiresAuth: true
            }
          },
          {
            path: 'approval',
            name: 'SupervisionApproval',
            component: () => import('@/views/supervision/module1/approval.vue'),
            meta: {
              title: '督导审核记录',
              requiresAuth: true
            }
          },
          {
            path: 'approval_record',
            name: 'SupervisionApprovalRecord',
            component: () => import('@/views/supervision/module1/approval_record.vue'),
            meta: {
                title: '通过审核记录',
                requiresAuth: true
            }
          },
        ]
      },
      
      // 模块二：行政坐班
      {
        path: 'module2',
        name: 'SupervisionModule2',
        redirect: '/supervision/module2/schedule',
        meta: {
          title: '行政坐班',
          requiresAuth: true
        },
        children: [
          {
            path: 'schedule',
            name: 'AdministrativeSchedule',
            component: () => import('@/views/supervision/module2/schedule.vue'),
            meta: {
              title: '坐班安排',
              requiresAuth: true
            }
          },
          {
            path: 'attendance',
            name: 'AdministrativeAttendance',
            component: () => import('@/views/supervision/module2/attendance.vue'),
            meta: {
              title: '考勤记录',
              requiresAuth: true
            }
          },
          {
            path: 'activity',
            name: 'AdministrativeActivity',
            component: () => import('@/views/supervision/module2/activity.vue'),
            meta: {
              title: '教研室活动',
              requiresAuth: true
            }
          },
          {
            path: 'movement',
            name: 'AdministrativeMovement',
            component: () => import('@/views/supervision/module2/movement.vue'),
            meta: {
              title: '人员异动',
              requiresAuth: true
            }
          },
          {
            path: 'index',
            name: 'AdministrativeIndex',
            component: () => import('@/views/supervision/module2/index.vue'),
            meta: {
              title: '行政坐班首页',
              requiresAuth: true
            }
          }
        ]
      },
      
      // 模块三：教室巡查
      {
        path: 'module3',
        name: 'SupervisionModule3',
        redirect: '/supervision/module3/plan',
        meta: {
          title: '教室巡查',
          requiresAuth: true
        },
        children: [
          {
            path: 'plan',
            name: 'InspectionPlan',
            component: () => import('@/views/supervision/module3/plan.vue'),
            meta: {
              title: '巡查计划',
              requiresAuth: true
            }
          },
          {
            path: 'record',
            name: 'InspectionRecord',
            component: () => import('@/views/supervision/module3/record.vue'),
            meta: {
              title: '巡查记录',
              requiresAuth: true
            }
          },
          {
            path: 'item',
            name: 'InspectionItem',
            component: () => import('@/views/supervision/module3/item.vue'),
            meta: {
              title: '巡查项目',
              requiresAuth: true
            }
          },
          {
            path: 'statistics',
            name: 'InspectionStatistics',
            component: () => import('@/views/supervision/module3/statistics.vue'),
            meta: {
              title: '巡查统计',
              requiresAuth: true
            }
          }
        ]
      }
    ]
  }
]

export default supervisionRoutes 