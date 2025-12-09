/**
 * 统一日志管理工具
 * 根据环境变量控制日志输出
 */
import { config } from '@/config/env'

/**
 * 日志级别
 */
enum LogLevel {
  DEBUG = 'debug',
  INFO = 'info',
  WARN = 'warn',
  ERROR = 'error'
}

/**
 * 日志输出函数
 */
class Logger {
  /**
   * Debug日志（仅开发环境）
   */
  debug(...args: any[]) {
    if (config.features.debugMode) {
      console.log('[DEBUG]', ...args)
    }
  }

  /**
   * Info日志（仅开发环境）
   */
  info(...args: any[]) {
    if (config.features.enableLog && config.features.debugMode) {
      console.log('[INFO]', ...args)
    }
  }

  /**
   * Warning日志
   */
  warn(...args: any[]) {
    console.warn('[WARN]', ...args)
  }

  /**
   * Error日志
   */
  error(...args: any[]) {
    console.error('[ERROR]', ...args)
  }

  /**
   * 分组日志（仅开发环境）
   */
  group(label: string) {
    if (config.features.debugMode) {
      console.group(label)
    }
  }

  /**
   * 结束分组（仅开发环境）
   */
  groupEnd() {
    if (config.features.debugMode) {
      console.groupEnd()
    }
  }

  /**
   * 表格日志（仅开发环境）
   */
  table(data: any) {
    if (config.features.debugMode) {
      console.table(data)
    }
  }
}

/**
 * 导出单例
 */
export const logger = new Logger()

/**
 * 便捷导出
 */
export const log = logger.info.bind(logger)
export const debug = logger.debug.bind(logger)
export const warn = logger.warn.bind(logger)
export const error = logger.error.bind(logger)

