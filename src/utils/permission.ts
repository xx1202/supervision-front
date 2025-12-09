import type { UserInfo, UserRole, PagePermission } from '@/types/permission'

/**
 * 用户角色常量 - 统一管理所有角色编码
 */
export const USER_ROLES = {
  /** 政务办主任 - 系统管理员 */
  ADMIN_OFFICE_DIRECTOR: 'ADMIN_OFFICE_DIRECTOR',
  /** 教务办主任 - 教务管理 */
  ACADEMIC_ADMIN: 'ACADEMIC_ADMIN',
  /** 学管办主任 - 学生管理 */
  STUDENT_ADMIN: 'STUDENT_ADMIN',
  /** 实训教研室主任 - 实训管理 */
  TRAINING_ADMIN: 'TRAINING_ADMIN',
  /** 督导组成员 - 督导管理 */
  SUPERVISOR: 'SUPERVISOR',
  /** 实训教研室老师 - 实训操作 */
  TRAINING_TEACHER: 'TRAINING_TEACHER',
  /** 学生督导员 - 学生督导 */
  STUDENT_SUPERVISOR: 'STUDENT_SUPERVISOR',
  /** 访客 - 只读访问 */
  VISITOR: 'VISITOR'
} as const

/**
 * 角色组合常量 - 常用角色组合
 */
export const ROLE_GROUPS = {
  /** 所有角色 */
  ALL: Object.values(USER_ROLES) as UserRole[],
  /** 管理员角色组 */
  ADMINS: [
    USER_ROLES.ADMIN_OFFICE_DIRECTOR,
    USER_ROLES.ACADEMIC_ADMIN,
    USER_ROLES.STUDENT_ADMIN,
    USER_ROLES.TRAINING_ADMIN
  ] as UserRole[],
  /** 督导相关角色 */
  SUPERVISORS: [
    USER_ROLES.ADMIN_OFFICE_DIRECTOR,
    USER_ROLES.ACADEMIC_ADMIN,
    USER_ROLES.STUDENT_ADMIN,
    USER_ROLES.SUPERVISOR,
    USER_ROLES.STUDENT_SUPERVISOR
  ] as UserRole[],
  /** 实训相关角色 */
  TRAINING: [
    USER_ROLES.ADMIN_OFFICE_DIRECTOR,
    USER_ROLES.TRAINING_ADMIN,
    USER_ROLES.TRAINING_TEACHER,
    USER_ROLES.STUDENT_SUPERVISOR
  ] as UserRole[]
} as const

// 页面权限配置 - 控制用户能访问哪些页面
const pagePermissions: PagePermission[] = [
  // 仪表板 - 所有用户都可以访问
  {
    path: '/dashboard',
    roles: ROLE_GROUPS.ALL,
    description: '仪表板'
  },
  {
    path: '/user/home',
    roles: ROLE_GROUPS.ALL,
    description: '个人中心'
  },

  // 系统管理 - 只有政务办主任
  {
    path: '/system',
    roles: [USER_ROLES.ADMIN_OFFICE_DIRECTOR],
    description: '系统管理'
  },
  {
    path: '/system/users',
    roles: [USER_ROLES.ADMIN_OFFICE_DIRECTOR],
    description: '用户管理'
  },
  {
    path: '/system/roles',
    roles: [USER_ROLES.ADMIN_OFFICE_DIRECTOR],
    description: '角色管理'
  },
  {
    path: '/system/permissions',
    roles: [USER_ROLES.ADMIN_OFFICE_DIRECTOR],
    description: '权限管理'
  },
  
  // 基础数据管理 - 管理员角色
  {
    path: '/basic-data',
    roles: ROLE_GROUPS.ADMINS,
    description: '基础数据管理'
  },
  {
    path: '/basic-data/classes',
    roles: [
      USER_ROLES.ADMIN_OFFICE_DIRECTOR,
      USER_ROLES.ACADEMIC_ADMIN,
      USER_ROLES.STUDENT_ADMIN
    ],
    description: '班级管理'
  },
  {
    path: '/basic-data/classrooms',
    roles: [
      USER_ROLES.ADMIN_OFFICE_DIRECTOR,
      USER_ROLES.ACADEMIC_ADMIN,
      USER_ROLES.TRAINING_ADMIN
    ],
    description: '教室管理'
  },
  {
    path: '/basic-data/courses',
    roles: [
      USER_ROLES.ADMIN_OFFICE_DIRECTOR,
      USER_ROLES.ACADEMIC_ADMIN
    ],
    description: '课程管理'
  },
  {
    path: '/basic-data/offices',
    roles: ROLE_GROUPS.ADMINS,
    description: '办公室管理'
  },
  
  // 督导管理 - 所有用户都可以查看
  {
    path: '/supervision',
    roles: ROLE_GROUPS.ALL,
    description: '督导管理'
  },
  
  // 模块一 - 日常教学督导
  {
    path: '/supervision/module1',
    roles: [
      USER_ROLES.ADMIN_OFFICE_DIRECTOR,
      USER_ROLES.ACADEMIC_ADMIN,
      USER_ROLES.STUDENT_ADMIN,
      USER_ROLES.SUPERVISOR,
      USER_ROLES.STUDENT_SUPERVISOR,
      USER_ROLES.VISITOR
    ],
    description: '模块一：日常教学督导'
  },
  {
    path: '/supervision/module1/schedule',
    roles: [
      USER_ROLES.ADMIN_OFFICE_DIRECTOR,
      USER_ROLES.ACADEMIC_ADMIN,
      USER_ROLES.SUPERVISOR
    ],
    description: '督导安排'
  },
  {
    path: '/supervision/module1/record',
    roles: [
      USER_ROLES.ADMIN_OFFICE_DIRECTOR,
      USER_ROLES.ACADEMIC_ADMIN,
      USER_ROLES.SUPERVISOR,
      USER_ROLES.STUDENT_SUPERVISOR
    ],
    description: '督导记录'
  },
  {
    path: '/supervision/module1/statistics',
    roles: [
      USER_ROLES.ADMIN_OFFICE_DIRECTOR,
      USER_ROLES.ACADEMIC_ADMIN,
      USER_ROLES.SUPERVISOR,
      USER_ROLES.STUDENT_SUPERVISOR,
      USER_ROLES.VISITOR
    ],
    description: '督导统计'
  },
  {
    path: '/supervision/module1/document',
    roles: [
      USER_ROLES.ADMIN_OFFICE_DIRECTOR,
      USER_ROLES.ACADEMIC_ADMIN,
      USER_ROLES.SUPERVISOR
    ],
    description: '督导文档'
  },
  {
    path: '/supervision/module1/approval_record',
    roles: ROLE_GROUPS.ALL,
    description: '汇总记录'
  },
  // 模块二 - 行政坐班
  {
    path: '/supervision/module2',
    roles: [
      USER_ROLES.ADMIN_OFFICE_DIRECTOR,
      USER_ROLES.ACADEMIC_ADMIN,
      USER_ROLES.STUDENT_ADMIN,
      USER_ROLES.SUPERVISOR,
      USER_ROLES.VISITOR
    ],
    description: '模块二：行政坐班'
  },
  {
    path: '/supervision/module2/schedule',
    roles: [
      USER_ROLES.ADMIN_OFFICE_DIRECTOR,
      USER_ROLES.ACADEMIC_ADMIN,
      USER_ROLES.STUDENT_ADMIN
    ],
    description: '坐班安排'
  },
  {
    path: '/supervision/module2/attendance',
    roles: [
      USER_ROLES.ADMIN_OFFICE_DIRECTOR,
      USER_ROLES.ACADEMIC_ADMIN,
      USER_ROLES.STUDENT_ADMIN,
      USER_ROLES.SUPERVISOR
    ],
    description: '考勤记录'
  },
  {
    path: '/supervision/module2/activity',
    roles: [
      USER_ROLES.ADMIN_OFFICE_DIRECTOR,
      USER_ROLES.ACADEMIC_ADMIN,
      USER_ROLES.STUDENT_ADMIN,
      USER_ROLES.SUPERVISOR
    ],
    description: '教研室活动'
  },
  {
    path: '/supervision/module2/movement',
    roles: [
      USER_ROLES.ADMIN_OFFICE_DIRECTOR,
      USER_ROLES.ACADEMIC_ADMIN,
      USER_ROLES.STUDENT_ADMIN
    ],
    description: '人员异动'
  },
  {
    path: '/supervision/module2/index',
    roles: [
      USER_ROLES.ADMIN_OFFICE_DIRECTOR,
      USER_ROLES.ACADEMIC_ADMIN,
      USER_ROLES.STUDENT_ADMIN,
      USER_ROLES.SUPERVISOR,
      USER_ROLES.VISITOR
    ],
    description: '行政坐班首页'
  },
  
  // 模块三 - 理论教室巡查
  {
    path: '/supervision/module3',
    roles: [
      ...ROLE_GROUPS.TRAINING,
      USER_ROLES.VISITOR
    ],
    description: '模块三：理论教室巡查'
  },
  {
    path: '/supervision/module3/plan',
    roles: [
      USER_ROLES.ADMIN_OFFICE_DIRECTOR,
      USER_ROLES.TRAINING_ADMIN
    ],
    description: '巡查计划'
  },
  {
    path: '/supervision/module3/record',
    roles: [
      USER_ROLES.ADMIN_OFFICE_DIRECTOR,
      USER_ROLES.TRAINING_ADMIN,
      USER_ROLES.TRAINING_TEACHER,
      USER_ROLES.STUDENT_SUPERVISOR
    ],
    description: '巡查记录'
  },
  {
    path: '/supervision/module3/item',
    roles: [
      USER_ROLES.ADMIN_OFFICE_DIRECTOR,
      USER_ROLES.TRAINING_ADMIN
    ],
    description: '巡查项目'
  },
  {
    path: '/supervision/module3/statistics',
    roles: [
      USER_ROLES.ADMIN_OFFICE_DIRECTOR,
      USER_ROLES.TRAINING_ADMIN,
      USER_ROLES.TRAINING_TEACHER,
      USER_ROLES.STUDENT_SUPERVISOR,
      USER_ROLES.VISITOR
    ],
    description: '巡查统计'
  },
  
  // 统计分析 - 所有用户都可以查看
  {
    path: '/statistics',
    roles: ROLE_GROUPS.ALL,
    description: '统计分析'
  },
  {
    path: '/statistics/overview',
    roles: ROLE_GROUPS.ALL,
    description: '统计概览'
  },
  {
    path: '/statistics/reports',
    roles: [
      USER_ROLES.ADMIN_OFFICE_DIRECTOR,
      USER_ROLES.ACADEMIC_ADMIN,
      USER_ROLES.STUDENT_ADMIN,
      USER_ROLES.TRAINING_ADMIN,
      USER_ROLES.SUPERVISOR
    ],
    description: '统计报告'
  },
  {
    path: '/statistics/export',
    roles: ROLE_GROUPS.ADMINS,
    description: '数据导出'
  }
]

/**
 * 获取用户信息
 */
export const getUserInfo = (): UserInfo | null => {
  try {
    // 优先从localStorage获取（支持自动登录），然后从sessionStorage获取
    const userInfo = localStorage.getItem('userInfo') || sessionStorage.getItem('userInfo')
    return userInfo ? JSON.parse(userInfo) : null
  } catch (error) {
    console.error('解析用户信息失败:', error)
    return null
  }
}

/**
 * 检查用户是否有指定角色
 */
export const hasRole = (user: UserInfo, role: string): boolean => {
  return user.roles.includes(role)
}

/**
 * 检查用户是否有指定权限（基于后端返回的权限）
 */
export const hasPermission = (user: UserInfo, permission: string): boolean => {
  // 政务办主任拥有所有权限
  if (user.roles.includes(USER_ROLES.ADMIN_OFFICE_DIRECTOR)) {
    return true
  }
  
  // 检查后端返回的权限
  return user.permissions.includes('*') || user.permissions.includes(permission)
}

/**
 * 检查页面访问权限
 */
export const checkPagePermission = (path: string, user: UserInfo): boolean => {
  // 政务办主任拥有所有权限
  if (user.roles.includes(USER_ROLES.ADMIN_OFFICE_DIRECTOR)) {
    return true
  }
  
  // 查找页面权限配置
  const pagePermission = pagePermissions.find(p => p.path === path)
  
  if (!pagePermission) {
    // 如果没有找到配置，禁止访问（更严格的权限控制）
    console.warn(`页面 ${path} 没有配置权限，禁止访问`)
    return false
  }
  
  // 检查用户角色是否在允许列表中
  return user.roles.some(role => pagePermission.roles.includes(role as UserRole))
}

/**
 * 检查组件权限（用于指令）- 基于后端权限
 */
export const checkComponentPermission = (permission: string, user: UserInfo): boolean => {
  // 政务办主任拥有所有权限
  if (user.roles.includes(USER_ROLES.ADMIN_OFFICE_DIRECTOR)) {
    return true
  }
  
  // 直接检查后端返回的权限
  return hasPermission(user, permission)
}