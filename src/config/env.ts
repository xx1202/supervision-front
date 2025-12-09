/**
 * 环境配置
 * 统一管理应用配置信息
 */

interface AppConfig {
  // API 配置
  api: {
    baseURL: string
    timeout: number
    uploadTimeout: number
  }
  
  // 应用信息
  app: {
    name: string
    version: string
  }
  
  // 功能开关
  features: {
    debugMode: boolean
    enableLog: boolean
    enableCache: boolean
    enableMock: boolean
  }
  
  // 业务配置
  business: {
    // 考勤自动计时（分钟）
    attendanceAutoAbsentMinutes: number
    // 分页默认大小
    defaultPageSize: number
    // 文件上传大小限制（MB）
    maxUploadSize: number
  }
}

/**
 * 获取配置
 */
export const getConfig = (): AppConfig => {
  const isDev = import.meta.env.DEV
  
  return {
    api: {
      baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080/api',
      timeout: Number(import.meta.env.VITE_API_TIMEOUT) || 10000,
      uploadTimeout: Number(import.meta.env.VITE_UPLOAD_TIMEOUT) || 60000
    },
    
    app: {
      name: '督导管理系统',
      version: '2.2.0'
    },
    
    features: {
      debugMode: isDev || import.meta.env.VITE_DEBUG_MODE === 'true',
      enableLog: import.meta.env.VITE_ENABLE_LOG !== 'false',
      enableCache: import.meta.env.VITE_ENABLE_CACHE !== 'false',
      enableMock: import.meta.env.VITE_ENABLE_MOCK === 'true'
    },
    
    business: {
      attendanceAutoAbsentMinutes: 30,
      defaultPageSize: 10,
      maxUploadSize: 100
    }
  }
}

/**
 * 导出配置实例
 */
export const config = getConfig()

/**
 * 判断是否为开发环境
 */
export const isDev = import.meta.env.DEV

/**
 * 判断是否为生产环境
 */
export const isProd = import.meta.env.PROD

