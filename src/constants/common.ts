/**
 * 通用常量
 * 适用于整个系统的通用状态、类型等常量
 */

/**
 * 通用状态枚举（数字类型）
 */
export const COMMON_STATUS = {
  /** 禁用 */
  DISABLED: 0,
  /** 启用 */
  ENABLED: 1
} as const

/**
 * 通用状态标签映射
 */
export const COMMON_STATUS_MAP: Record<number, {
  label: string
  type: 'success' | 'danger'
}> = {
  [COMMON_STATUS.DISABLED]: {
    label: '禁用',
    type: 'danger'
  },
  [COMMON_STATUS.ENABLED]: {
    label: '启用',
    type: 'success'
  }
}

/**
 * 通用状态枚举（字符串类型）
 */
export const COMMON_STATUS_STRING = {
  /** 激活 */
  ACTIVE: 'active',
  /** 未激活 */
  INACTIVE: 'inactive'
} as const

/**
 * 通用状态字符串标签映射
 */
export const COMMON_STATUS_STRING_MAP: Record<string, {
  label: string
  type: 'success' | 'danger'
}> = {
  [COMMON_STATUS_STRING.ACTIVE]: {
    label: '激活',
    type: 'success'
  },
  [COMMON_STATUS_STRING.INACTIVE]: {
    label: '未激活',
    type: 'danger'
  }
}

/**
 * 客户端类型枚举
 */
export const CLIENT_TYPE = {
  /** Web端 */
  WEB: 'web',
  /** 移动端 */
  MOBILE: 'mobile'
} as const

/**
 * 客户端类型标签映射
 */
export const CLIENT_TYPE_MAP: Record<string, string> = {
  [CLIENT_TYPE.WEB]: 'Web端',
  [CLIENT_TYPE.MOBILE]: '移动端'
}

/**
 * 分页默认配置
 */
export const PAGINATION = {
  /** 默认页码 */
  DEFAULT_CURRENT: 1,
  /** 默认每页数量 */
  DEFAULT_SIZE: 10,
  /** 每页数量选项 */
  PAGE_SIZES: [10, 20, 50, 100]
} as const

/**
 * 日期时间格式
 */
export const DATE_FORMAT = {
  /** 日期格式 */
  DATE: 'YYYY-MM-DD',
  /** 时间格式 */
  TIME: 'HH:mm:ss',
  /** 日期时间格式 */
  DATETIME: 'YYYY-MM-DD HH:mm:ss',
  /** 日期时间格式（不含秒） */
  DATETIME_MINUTE: 'YYYY-MM-DD HH:mm'
} as const

/**
 * 文件大小单位
 */
export const FILE_SIZE_UNIT = {
  /** 字节 */
  BYTE: 1,
  /** KB */
  KB: 1024,
  /** MB */
  MB: 1024 * 1024,
  /** GB */
  GB: 1024 * 1024 * 1024
} as const

/**
 * 响应码
 */
export const RESPONSE_CODE = {
  /** 成功 */
  SUCCESS: 200,
  /** 错误 */
  ERROR: 500,
  /** 未授权 */
  UNAUTHORIZED: 401,
  /** 禁止访问 */
  FORBIDDEN: 403,
  /** 未找到 */
  NOT_FOUND: 404
} as const

