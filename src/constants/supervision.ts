/**
 * 督导相关常量
 */

/**
 * 督导状态枚举
 */
export const SUPERVISION_STATUS = {
  /** 待开始 */
  PENDING: 'pending',
  /** 进行中 */
  IN_PROGRESS: 'in_progress',
  /** 已完成 */
  COMPLETED: 'completed',
  /** 已取消 */
  CANCELLED: 'cancelled'
} as const

/**
 * 督导状态标签映射
 */
export const SUPERVISION_STATUS_MAP: Record<string, {
  label: string
  type: 'info' | 'warning' | 'success' | 'danger'
}> = {
  [SUPERVISION_STATUS.PENDING]: {
    label: '待开始',
    type: 'info'
  },
  [SUPERVISION_STATUS.IN_PROGRESS]: {
    label: '进行中',
    type: 'warning'
  },
  [SUPERVISION_STATUS.COMPLETED]: {
    label: '已完成',
    type: 'success'
  },
  [SUPERVISION_STATUS.CANCELLED]: {
    label: '已取消',
    type: 'danger'
  }
}

/**
 * 督导记录状态枚举
 */
export const SUPERVISION_RECORD_STATUS = {
  /** 草稿 */
  DRAFT: 'draft',
  /** 已提交 */
  SUBMITTED: 'submitted',
  /** 已审核 */
  APPROVED: 'approved',
  /** 已拒绝 */
  REJECTED: 'rejected'
} as const

/**
 * 督导记录状态标签映射
 */
export const SUPERVISION_RECORD_STATUS_MAP: Record<string, {
  label: string
  type: 'info' | 'warning' | 'success' | 'danger'
}> = {
  [SUPERVISION_RECORD_STATUS.DRAFT]: {
    label: '草稿',
    type: 'info'
  },
  [SUPERVISION_RECORD_STATUS.SUBMITTED]: {
    label: '已提交',
    type: 'warning'
  },
  [SUPERVISION_RECORD_STATUS.APPROVED]: {
    label: '已审核',
    type: 'success'
  },
  [SUPERVISION_RECORD_STATUS.REJECTED]: {
    label: '已拒绝',
    type: 'danger'
  }
}

/**
 * 模块类型枚举
 */
export const MODULE_TYPE = {
  /** 日常教学督导 */
  DAILY_TEACHING: 'daily_teaching',
  /** 行政坐班督导 */
  ADMINISTRATIVE: 'administrative',
  /** 教室巡查督导 */
  CLASSROOM_INSPECTION: 'classroom_inspection'
} as const

/**
 * 模块类型标签映射
 */
export const MODULE_TYPE_MAP: Record<string, string> = {
  [MODULE_TYPE.DAILY_TEACHING]: '日常教学督导',
  [MODULE_TYPE.ADMINISTRATIVE]: '行政坐班督导',
  [MODULE_TYPE.CLASSROOM_INSPECTION]: '教室巡查督导'
}

/**
 * 模块类型短名称映射
 */
export const MODULE_TYPE_SHORT_MAP: Record<string, string> = {
  [MODULE_TYPE.DAILY_TEACHING]: '日常教学',
  [MODULE_TYPE.ADMINISTRATIVE]: '行政坐班',
  [MODULE_TYPE.CLASSROOM_INSPECTION]: '教室巡查'
}

/**
 * 教研室活动状态枚举
 */
export const RESEARCH_ACTIVITY_STATUS = {
  /** 已安排 */
  PLANNED: 'planned',
  /** 已完成 */
  COMPLETED: 'completed',
  /** 已取消 */
  CANCELLED: 'cancelled'
} as const

/**
 * 教研室活动状态标签映射
 */
export const RESEARCH_ACTIVITY_STATUS_MAP: Record<string, {
  label: string
  type: 'info' | 'success' | 'danger'
}> = {
  [RESEARCH_ACTIVITY_STATUS.PLANNED]: {
    label: '已安排',
    type: 'info'
  },
  [RESEARCH_ACTIVITY_STATUS.COMPLETED]: {
    label: '已完成',
    type: 'success'
  },
  [RESEARCH_ACTIVITY_STATUS.CANCELLED]: {
    label: '已取消',
    type: 'danger'
  }
}

/**
 * 评价类型枚举
 */
export const EVALUATION_TYPE = {
  /** 教师评价 */
  TEACHER_EVALUATION: 'teacher_evaluation',
  /** 学生评价 */
  STUDENT_EVALUATION: 'student_evaluation'
} as const

/**
 * 评价类型标签映射
 */
export const EVALUATION_TYPE_MAP: Record<string, string> = {
  [EVALUATION_TYPE.TEACHER_EVALUATION]: '教师评价',
  [EVALUATION_TYPE.STUDENT_EVALUATION]: '学生评价'
}

/**
 * 巡查项目类型枚举
 */
export const INSPECTION_ITEM_TYPE = {
  /** 分类 */
  CATEGORY: 'category',
  /** 评分项 */
  SCORE: 'score',
  /** 布尔项 */
  BOOLEAN: 'boolean'
} as const

/**
 * 巡查项目类型标签映射
 */
export const INSPECTION_ITEM_TYPE_MAP: Record<string, string> = {
  [INSPECTION_ITEM_TYPE.CATEGORY]: '分类',
  [INSPECTION_ITEM_TYPE.SCORE]: '评分项',
  [INSPECTION_ITEM_TYPE.BOOLEAN]: '布尔项'
}

