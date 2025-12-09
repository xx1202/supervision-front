/**
 * 用户和角色相关常量
 */
import { USER_ROLES } from '@/utils/permission'

/**
 * 用户状态枚举
 */
export const USER_STATUS = {
  /** 激活 */
  ACTIVE: 'active',
  /** 未激活 */
  INACTIVE: 'inactive'
} as const

/**
 * 用户状态标签映射
 */
export const USER_STATUS_MAP: Record<string, {
  label: string
  type: 'success' | 'danger'
}> = {
  [USER_STATUS.ACTIVE]: {
    label: '激活',
    type: 'success'
  },
  [USER_STATUS.INACTIVE]: {
    label: '未激活',
    type: 'danger'
  }
}

/**
 * 用户状态枚举（数字类型）
 */
export const USER_STATUS_NUMBER = {
  /** 禁用 */
  DISABLED: 0,
  /** 启用 */
  ENABLED: 1
} as const

/**
 * 用户状态数字标签映射
 */
export const USER_STATUS_NUMBER_MAP: Record<number, {
  label: string
  type: 'success' | 'danger'
}> = {
  [USER_STATUS_NUMBER.DISABLED]: {
    label: '禁用',
    type: 'danger'
  },
  [USER_STATUS_NUMBER.ENABLED]: {
    label: '启用',
    type: 'success'
  }
}

/**
 * 角色代码映射（用于显示角色名称）
 */
export const ROLE_CODE_NAME_MAP: Record<string, string> = {
  [USER_ROLES.ADMIN_OFFICE_DIRECTOR]: '政务办主任',
  [USER_ROLES.ACADEMIC_ADMIN]: '教务办主任',
  [USER_ROLES.STUDENT_ADMIN]: '学管办主任',
  [USER_ROLES.TRAINING_ADMIN]: '实训教研室主任',
  [USER_ROLES.SUPERVISOR]: '督导组成员',
  [USER_ROLES.TRAINING_TEACHER]: '实训教研室老师',
  [USER_ROLES.STUDENT_SUPERVISOR]: '学生督导员',
  [USER_ROLES.VISITOR]: '访客'
}

/**
 * 权限类型枚举
 */
export const PERMISSION_TYPE = {
  /** 菜单 */
  MENU: 1,
  /** 按钮 */
  BUTTON: 2,
  /** 数据 */
  DATA: 3
} as const

/**
 * 权限类型标签映射
 */
export const PERMISSION_TYPE_MAP: Record<number, string> = {
  [PERMISSION_TYPE.MENU]: '菜单',
  [PERMISSION_TYPE.BUTTON]: '按钮',
  [PERMISSION_TYPE.DATA]: '数据'
}

