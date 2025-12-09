/**
 * 基础数据相关常量
 */

/**
 * 课程类型枚举
 */
export const COURSE_TYPE = {
  /** 理论课 */
  THEORY: 'theory',
  /** 实训课 */
  TRAINING: 'training'
} as const

/**
 * 课程类型标签映射
 */
export const COURSE_TYPE_MAP: Record<string, string> = {
  [COURSE_TYPE.THEORY]: '理论课',
  [COURSE_TYPE.TRAINING]: '实训课'
}

/**
 * 教室类型枚举
 */
export const CLASSROOM_TYPE = {
  /** 理论教室 */
  THEORY: 'theory',
  /** 实训室 */
  TRAINING: 'training'
} as const

/**
 * 教室类型标签映射
 */
export const CLASSROOM_TYPE_MAP: Record<string, string> = {
  [CLASSROOM_TYPE.THEORY]: '理论教室',
  [CLASSROOM_TYPE.TRAINING]: '实训室'
}

/**
 * 教室位置枚举
 */
export const CLASSROOM_LOCATION = {
  /** 东区 */
  EAST: 'east',
  /** 西区 */
  WEST: 'west'
} as const

/**
 * 教室位置标签映射
 */
export const CLASSROOM_LOCATION_MAP: Record<string, string> = {
  [CLASSROOM_LOCATION.EAST]: '东区',
  [CLASSROOM_LOCATION.WEST]: '西区'
}

/**
 * 班级状态枚举
 */
export const CLASS_STATUS = {
  /** 禁用 */
  DISABLED: 0,
  /** 启用 */
  ENABLED: 1
} as const

/**
 * 班级状态标签映射
 */
export const CLASS_STATUS_MAP: Record<number, {
  label: string
  type: 'success' | 'danger'
}> = {
  [CLASS_STATUS.DISABLED]: {
    label: '禁用',
    type: 'danger'
  },
  [CLASS_STATUS.ENABLED]: {
    label: '启用',
    type: 'success'
  }
}

/**
 * 课表节次
 */
export const PERIODS = [
  1, 2, 3, 4, 5, 6, 7, 8, 9, 10
] as const

/**
 * 课表节次标签映射
 */
export const PERIOD_LABEL_MAP: Record<number, string> = {
  1: '第1节',
  2: '第2节',
  3: '第3节',
  4: '第4节',
  5: '第5节',
  6: '第6节',
  7: '第7节',
  8: '第8节',
  9: '第9节',
  10: '第10节'
}

/**
 * 星期枚举
 */
export const WEEK_DAY = {
  MONDAY: 1,
  TUESDAY: 2,
  WEDNESDAY: 3,
  THURSDAY: 4,
  FRIDAY: 5,
  SATURDAY: 6,
  SUNDAY: 7
} as const

/**
 * 星期标签映射
 */
export const WEEK_DAY_LABEL_MAP: Record<number, string> = {
  [WEEK_DAY.MONDAY]: '星期一',
  [WEEK_DAY.TUESDAY]: '星期二',
  [WEEK_DAY.WEDNESDAY]: '星期三',
  [WEEK_DAY.THURSDAY]: '星期四',
  [WEEK_DAY.FRIDAY]: '星期五',
  [WEEK_DAY.SATURDAY]: '星期六',
  [WEEK_DAY.SUNDAY]: '星期日'
}

/**
 * 星期短标签映射
 */
export const WEEK_DAY_SHORT_MAP: Record<number, string> = {
  [WEEK_DAY.MONDAY]: '周一',
  [WEEK_DAY.TUESDAY]: '周二',
  [WEEK_DAY.WEDNESDAY]: '周三',
  [WEEK_DAY.THURSDAY]: '周四',
  [WEEK_DAY.FRIDAY]: '周五',
  [WEEK_DAY.SATURDAY]: '周六',
  [WEEK_DAY.SUNDAY]: '周日'
}

