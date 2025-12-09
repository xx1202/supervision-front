// 用户角色类型
export type UserRole = 
  | 'ADMIN_OFFICE_DIRECTOR'    // 政务办主任 - 系统管理员
  | 'ACADEMIC_ADMIN'           // 教务办主任 - 教务管理
  | 'STUDENT_ADMIN'            // 学管办主任 - 学生管理
  | 'TRAINING_ADMIN'           // 实训教研室主任 - 实训管理
  | 'SUPERVISOR'               // 督导组成员 - 督导管理
  | 'TRAINING_TEACHER'         // 实训教研室老师 - 实训操作
  | 'STUDENT_SUPERVISOR'       // 学生督导员 - 学生督导
  | 'VISITOR'                  // 访客 - 只读访问

// 后端API响应格式
export interface LoginResponse {
  code: number
  message: string
  data: {
    token: string
    refreshToken: string
    tokenType: string
    expiresIn: number
    userInfo: {
      id: string
      username: string
      realName: string
      roles: string[]
      permissions: string[]
    }
  }
  timestamp: number
}

// 用户信息接口（匹配后端响应）
export interface UserInfo {
  id: string
  username: string
  realName: string
  roles: string[]
  permissions: string[]
  token?: string
  refreshToken?: string
  tokenType?: string
  expiresIn?: number
}

// 页面权限配置
export interface PagePermission {
  path: string
  roles: UserRole[]
  description: string
} 