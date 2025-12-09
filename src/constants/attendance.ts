/**
 * 考勤相关常量
 */
import { USER_ROLES } from '@/utils/permission'

/**
 * 考勤状态枚举
 */
export const ATTENDANCE_STATUS = {
  /** 在岗 */
  PRESENT: 'present',
  /** 缺岗 */
  ABSENT: 'absent',
  /** 暂不在岗 */
  TEMPORARY_ABSENT: 'temporary_absent',
  /** 请假 */
  LEAVE: 'leave',
  /** 在岗（上课） */
  PRESENT_CLASS: 'present_class',
  /** 请假（出差） */
  LEAVE_BUSINESS_TRIP: 'leave_business_trip',
  /** 请假（轮休） */
  LEAVE_ROTATION: 'leave_rotation'
} as const

/**
 * 考勤状态标签映射
 */
export const ATTENDANCE_STATUS_MAP: Record<string, {
  label: string
  type: 'success' | 'danger' | 'warning' | 'info'
}> = {
  [ATTENDANCE_STATUS.PRESENT]: {
    label: '在岗',
    type: 'success'
  },
  [ATTENDANCE_STATUS.ABSENT]: {
    label: '缺岗',
    type: 'danger'
  },
  [ATTENDANCE_STATUS.TEMPORARY_ABSENT]: {
    label: '暂不在岗',
    type: 'warning'
  },
  [ATTENDANCE_STATUS.LEAVE]: {
    label: '请假',
    type: 'info'
  },
  [ATTENDANCE_STATUS.PRESENT_CLASS]: {
    label: '在岗（上课）',
    type: 'success'
  },
  [ATTENDANCE_STATUS.LEAVE_BUSINESS_TRIP]: {
    label: '请假（出差）',
    type: 'info'
  },
  [ATTENDANCE_STATUS.LEAVE_ROTATION]: {
    label: '请假（轮休）',
    type: 'info'
  }
}

/**
 * 异动类型枚举
 */
export const MOVEMENT_TYPE = {
  /** 出差 */
  BUSINESS_TRIP: 'business_trip',
  /** 请假 */
  LEAVE: 'leave',
  /** 轮休 */
  ROTATION: 'rotation'
} as const

/**
 * 异动类型标签映射
 */
export const MOVEMENT_TYPE_MAP: Record<string, string> = {
  [MOVEMENT_TYPE.BUSINESS_TRIP]: '出差',
  [MOVEMENT_TYPE.LEAVE]: '请假',
  [MOVEMENT_TYPE.ROTATION]: '轮休'
}

/**
 * 审批状态枚举
 */
export const APPROVAL_STATUS = {
  /** 待审批 */
  PENDING: 'pending',
  /** 已批准 */
  APPROVED: 'approved',
  /** 已拒绝 */
  REJECTED: 'rejected'
} as const

/**
 * 审批状态标签映射
 */
export const APPROVAL_STATUS_MAP: Record<string, {
  label: string
  type: 'warning' | 'success' | 'danger'
}> = {
  [APPROVAL_STATUS.PENDING]: {
    label: '待审批',
    type: 'warning'
  },
  [APPROVAL_STATUS.APPROVED]: {
    label: '已批准',
    type: 'success'
  },
  [APPROVAL_STATUS.REJECTED]: {
    label: '已拒绝',
    type: 'danger'
  }
}

/**
 * 考勤管理权限角色
 */
export const ATTENDANCE_ROLES = {
  /** 可以查看考勤 */
  VIEW: [
    USER_ROLES.ADMIN_OFFICE_DIRECTOR,
    USER_ROLES.ACADEMIC_ADMIN,
    USER_ROLES.STUDENT_ADMIN,
    USER_ROLES.SUPERVISOR,
    USER_ROLES.VISITOR
  ],
  /** 可以编辑考勤 */
  EDIT: [
    USER_ROLES.ADMIN_OFFICE_DIRECTOR,
    USER_ROLES.ACADEMIC_ADMIN,
    USER_ROLES.STUDENT_ADMIN,
    USER_ROLES.SUPERVISOR
  ],
  /** 可以删除考勤 */
  DELETE: [
    USER_ROLES.ADMIN_OFFICE_DIRECTOR
  ]
} as const

