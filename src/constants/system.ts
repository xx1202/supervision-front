/**
 * 系统相关常量
 */

/**
 * 报表类型枚举
 */
export const REPORT_TYPE = {
  /** 督导通报 */
  SUPERVISION_BULLETIN: 'supervision_bulletin',
  /** 统计报表 */
  STATISTICS_REPORT: 'statistics_report',
  /** 汇总报表 */
  SUMMARY_REPORT: 'summary_report'
} as const

/**
 * 报表类型标签映射
 */
export const REPORT_TYPE_MAP: Record<string, string> = {
  [REPORT_TYPE.SUPERVISION_BULLETIN]: '督导通报',
  [REPORT_TYPE.STATISTICS_REPORT]: '统计报表',
  [REPORT_TYPE.SUMMARY_REPORT]: '汇总报表'
}

/**
 * 报表状态枚举
 */
export const REPORT_STATUS = {
  /** 生成中 */
  GENERATING: 'generating',
  /** 已完成 */
  COMPLETED: 'completed',
  /** 失败 */
  FAILED: 'failed'
} as const

/**
 * 报表状态标签映射
 */
export const REPORT_STATUS_MAP: Record<string, {
  label: string
  type: 'warning' | 'success' | 'danger'
}> = {
  [REPORT_STATUS.GENERATING]: {
    label: '生成中',
    type: 'warning'
  },
  [REPORT_STATUS.COMPLETED]: {
    label: '已完成',
    type: 'success'
  },
  [REPORT_STATUS.FAILED]: {
    label: '失败',
    type: 'danger'
  }
}

/**
 * 文件格式枚举
 */
export const FILE_FORMAT = {
  /** Excel */
  EXCEL: 'xlsx',
  /** PDF */
  PDF: 'pdf',
  /** Word */
  WORD: 'docx',
  /** CSV */
  CSV: 'csv'
} as const

/**
 * 文件格式标签映射
 */
export const FILE_FORMAT_MAP: Record<string, string> = {
  [FILE_FORMAT.EXCEL]: 'Excel',
  [FILE_FORMAT.PDF]: 'PDF',
  [FILE_FORMAT.WORD]: 'Word',
  [FILE_FORMAT.CSV]: 'CSV'
}

/**
 * HTTP 方法枚举
 */
export const HTTP_METHOD = {
  GET: 'GET',
  POST: 'POST',
  PUT: 'PUT',
  DELETE: 'DELETE',
  PATCH: 'PATCH'
} as const

