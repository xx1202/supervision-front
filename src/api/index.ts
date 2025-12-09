import { $get, $post, $put, $delete } from '@/utils/request'
import request from '@/utils/request'
import type { 
  // 基础类型
  ApiResponse, 
  PageResponse, 
  BooleanResponse,
  
  // 认证相关类型
  LoginRequest,
  LoginData,
  LoginResponse,
  RefreshTokenRequest,
  RefreshTokenResponse,
  ChangePasswordRequest,
  ChangePasswordResponse,
  UpdateProfileRequest,
  UpdateProfileResponse,
  LogoutResponse,
  
  // 督导安排管理类型
  SupervisionSchedule, 
  SupervisionScheduleParams,
  SupervisionScheduleQueryParams,
  ScheduleStatusParams,
  AvailableTime, 
  TimeConflictCheck,
  AvailableTimesResponse,
  TimeConflictCheckResponse,
  SupervisionScheduleResponse,
  SupervisionScheduleListResponse,
  SupervisionScheduleCreateResponse,
  SupervisionScheduleUpdateResponse,
  SupervisionScheduleDeleteResponse,
  ScheduleStatusUpdateResponse,
  ClassroomInspectionSchedule,
  ClassroomInspectionScheduleParams,
  ClassroomInspectionScheduleResponse,
  ClassroomInspectionScheduleListResponse,
  ClassroomInspectionScheduleCreateResponse,
  ClassroomInspectionScheduleUpdateResponse,
  ClassroomInspectionScheduleDeleteResponse,
  FloorInspectionCount,
  PeriodInspectionCount,
  ClassroomInspectionStatisticsVO,
  FloorStatisticsResponse,
  
  // 督导记录管理类型
  SupervisionRecord,
  SupervisionRecordParams,
  SupervisionRecordQueryParams,
  SupervisionRecordGroupQueryParams,
  TeachingEvaluation,
  LearningEvaluation,
  AttendanceEvaluation,
  EvaluationSummary,
  SupervisionRecordResponse,
  SupervisionRecordListResponse,
  SupervisionRecordCreateResponse,
  SupervisionRecordUpdateResponse,
  SupervisionRecordDeleteResponse,
  TeachingEvaluationSubmitResponse,
  LearningEvaluationSubmitResponse,
  AttendanceEvaluationSubmitResponse,
  EvaluationSummaryResponse,
  RecordSubmitResponse,
  RecordApproveResponse,
  
  // 用户管理类型
  User, 
  UserCreateParams,
  UserUpdateParams,
  UserQueryParams,
  UserProfileVO,
  UserResponse,
  UserListResponse,
  UserCreateResponse,
  UserUpdateResponse,
  UserDeleteResponse,
  UserBatchDeleteResponse,
  UserStatusUpdateResponse,
  UserPasswordResetResponse,
  ActiveUsersResponse,
  UsersByDepartmentResponse,
  UsersByRoleResponse,
  UsernameCheckResponse,
  EmailCheckResponse,
  PhoneCheckResponse,
  UserProfileResponse,
  
  // 角色管理类型
  Role,
  RoleCreateParams,
  RoleUpdateParams,
  RoleQueryParams,
  RoleResponse,
  RoleListResponse,
  RoleCreateResponse,
  RoleUpdateResponse,
  RoleDeleteResponse,
  RoleBatchDeleteResponse,
  RoleStatusUpdateResponse,
  ActiveRolesResponse,
  RoleCodeCheckResponse,
  RolePermissionsResponse,
  RolePermissionsUpdateResponse,
  
  // 权限管理类型
  Permission,
  PermissionCreateParams,
  PermissionUpdateParams,
  PermissionQueryParams,
  PermissionTreeNode,
  PermissionResponse,
  PermissionListResponse,
  PermissionCreateResponse,
  PermissionUpdateResponse,
  PermissionDeleteResponse,
  PermissionBatchDeleteResponse,
  PermissionStatusUpdateResponse,
  PermissionTreeResponse,
  PermissionChildrenResponse,
  ActivePermissionsResponse,
  PermissionCodeCheckResponse,
  
  // 请假记录管理类型
  LeaveRecord,
  LeaveRecordCreateParams,
  LeaveRecordUpdateParams,
  LeaveRecordQueryParams,
  LeaveRecordApprovalParams,
  LeaveRecordResponse,
  LeaveRecordListResponse,
  LeaveRecordCreateResponse,
  LeaveRecordUpdateResponse,
  LeaveRecordDeleteResponse,
  LeaveRecordApproveResponse,
  PendingLeaveRecordsResponse,
  LeaveRecordStatisticsResponse,
  ExpectedCountResponse,
  ExpectedCountConfirmResponse,
  
  // 课表管理类型
  Schedule,
  ScheduleCreateParams,
  ScheduleUpdateParams,
  ScheduleQueryParams,
  ScheduleListItemVO,
  ScheduleDetailVO,
  ScheduleRequest,
  ScheduleByDateVO,
  ScheduleByClassroomVO,
  ScheduleByTeacherVO,
  ScheduleResponse,
  ScheduleListResponse,
  ScheduleCreateResponse,
  ScheduleUpdateResponse,
  ScheduleDeleteResponse,
  ScheduleByDateResponse,
  ScheduleByClassroomResponse,
  ScheduleByTeacherResponse,
  
  // 文件管理类型
  FileInfo,
  FileCategory,
  FileUploadQueryParams,
  FileUploadResponse,
  FileListResponse,
  FileDeleteResponse,
  FileCategoriesResponse,
  FilesByCategoryResponse,

  
  // 办公室管理类型
  Office,
  OfficeCreateParams,
  OfficeUpdateParams,
  OfficeQueryParams,
  OfficeResponse,
  OfficeListResponse,
  OfficeCreateResponse,
  OfficeUpdateResponse,
  OfficeDeleteResponse,
  OfficeBatchDeleteResponse,
  
  // 班级管理类型
  Class,
  ClassCreateParams,
  ClassUpdateParams,
  ClassQueryParams,
  ClassResponse,
  ClassListResponse,
  ClassCreateResponse,
  ClassUpdateResponse,
  ClassDeleteResponse,
  ClassBatchDeleteResponse,
  ClassStatusUpdateResponse,
  ClassNameCheckResponse,
  
  // 统计分析类型
  DailyTeachingStatistics,
  WeeklyStatistics,
  TeacherStatistics,
  TeacherDetailStatistics,
  ClassStatistics,
  ScoreTrend,
  ImprovementTrend,
  TeachingScoresStatistics,
  LearningScoresStatistics,
  AttendanceRatesStatistics,
  ClassAttendanceStatistics,
  TeacherAttendanceStatistics,
  DailyTeachingStatisticsResponse,
  TeacherStatisticsResponse,
  ClassStatisticsResponse,
  TeachingScoresStatisticsResponse,
  LearningScoresStatisticsResponse,
  AttendanceRatesStatisticsResponse,
  
  // 审核管理类型
  SupervisionApprovalResultVO,
  PageResultSupervisionApprovalResultVO,
  ApprovalResultsByScheduleResponse,
  ReviewApprovalResponse,
  OriginalRecordsResponse,
  ApprovedRecordsResponse,
  MediaFileResponse,
  
  // 教室管理类型
  Classroom,
  ClassroomCreateParams,
  ClassroomUpdateParams,
  ClassroomQueryParams,
  ClassroomResponse,
  ClassroomListResponse,
  ClassroomCreateResponse,
  ClassroomUpdateResponse,
  ClassroomDeleteResponse,

  // 课程管理类型
  Course,
  CourseCreateParams,
  CourseUpdateParams,
  CourseQueryParams,
  CourseResponse,
  CourseListResponse,
  CourseCreateResponse,
  CourseUpdateResponse,
  CourseDeleteResponse,
  
  // 报表管理类型
  ReportGenerateRequest,
  ReportRecordVO,
  ReportRecordQueryParams,
  ReportGenerateResponse,
  ReportRecordListResponse,
  ReportRecordDeleteResponse,
  ReportPreviewResponse,
  
  // 模块二：行政坐班及教研室活动日督导类型
  ResearchActivity,
  ResearchActivityRequest,
  ResearchActivityResponse,
  ResearchActivityListResponse,
  ResearchActivityCreateResponse,
  ResearchActivityUpdateResponse,
  ResearchActivityDeleteResponse,
  StaffMovement,
  StaffMovementRequest,
  StaffMovementApprovalRequest,
  StaffMovementResponse,
  StaffMovementListResponse,
  StaffMovementCreateResponse,
  StaffMovementUpdateResponse,
  StaffMovementDeleteResponse,
  StaffMovementApproveResponse,
  StaffAttendance,
  StaffAttendanceRequest,
  StaffAttendanceResponse,
  StaffAttendanceListResponse,
  StaffAttendanceCreateResponse,
  StaffAttendanceUpdateResponse,
  StaffAttendanceDeleteResponse,
  AttendanceStatusOption,
  AttendanceStatusListResponse
} from '@/types/api'
import type {AxiosResponse} from "axios";

// 认证相关接口
export const authAPI = {
  // 用户登录
  login: (data: LoginRequest): Promise<LoginResponse> => {
    return $post('/v1/auth/login', data)
  },

  // 获取用户信息
  getUserInfo: (): Promise<UserProfileResponse> => {
    return $get('/v1/auth/user-info', {})
  },

  // 获取当前用户信息
  getCurrentUser: (): Promise<UserProfileResponse> => {
    return $get('/v1/auth/current-user', {})
  },

  // 修改用户密码
  changePassword: (data: ChangePasswordRequest): Promise<ChangePasswordResponse> => {
    return $put('/v1/auth/password', data)
  },

  // 修改用户资料
  updateProfile: (data: UpdateProfileRequest): Promise<UpdateProfileResponse> => {
    return $put('/v1/auth/profile', data)
  },

  // 刷新token
  refreshToken: (refreshToken: string): Promise<RefreshTokenResponse> => {
    return $post('/v1/auth/refresh', { refreshToken })
  },

  // 用户登出
  logout: (): Promise<LogoutResponse> => {
    return $post('/v1/auth/logout', {})
  }
}

// 督导安排管理接口
export const supervisionScheduleAPI = {
  // 获取可用督导时间
  getAvailableTimes: async (params: { startDate: string; endDate: string }) => {
    return $get('/v1/supervision/schedule/daily-teaching/available-times', params)
  },

  // 检查督导时间冲突
  checkConflict: async (data: { supervisionDate: string; period: number }) => {
    return $post('/v1/supervision/schedule/daily-teaching/check-conflict', data)
  },

  // 创建督导安排
  createSchedule: async (data: SupervisionScheduleParams) => {
    return $post('/v1/supervision/schedule/daily-teaching', data)
  },

  // 获取督导安排列表
  getScheduleList: async (params: {
    current?: number
    size?: number
    startDate?: string
    endDate?: string
    status?: string
  }) => {
    return $get('/v1/supervision/schedule/daily-teaching/list', params)
  },

  // 获取督导安排详情
  getScheduleDetail: async (id: string) => {
    return $get(`/v1/supervision/schedule/daily-teaching/${id}`, {})
  },

  // 更新督导安排
  updateSchedule: async (id: string, data: SupervisionScheduleParams) => {
    return $put(`/v1/supervision/schedule/daily-teaching/${id}`, data)
  },

  // 删除督导安排
  deleteSchedule: async (id: string) => {
    return $delete(`/v1/supervision/schedule/daily-teaching/${id}`, {})
  },

  // 更新督导状态
  updateScheduleStatus: async (id: string, data: ScheduleStatusParams) => {
    return $put(`/v1/supervision/schedule/daily-teaching/${id}/status`, data)
  }
}

// 理论教室巡查督导安排管理接口
export const classroomInspectionScheduleAPI = {
  // 创建理论教室巡查督导安排
  createClassroomInspectionSchedule: async (data: ClassroomInspectionScheduleParams) => {
    return $post('/v1/supervision/schedule/classroom-inspection', data)
  },

  // 获取理论教室巡查督导安排列表
  getClassroomInspectionScheduleList: async (params: {
    page?: number
    size?: number
    startDate?: string
    endDate?: string
    status?: string
  }) => {
    return $get('/v1/supervision/schedule/classroom-inspection/list', params)
  },

  // 获取理论教室巡查督导安排详情
  getClassroomInspectionScheduleDetail: async (id: string) => {
    return $get(`/v1/supervision/schedule/classroom-inspection/${id}`, {})
  },

  // 更新理论教室巡查督导安排
  updateClassroomInspectionSchedule: async (id: string, data: ClassroomInspectionScheduleParams) => {
    return $put(`/v1/supervision/schedule/classroom-inspection/${id}`, data)
  },

  // 删除理论教室巡查督导安排
  deleteClassroomInspectionSchedule: async (id: string) => {
    return $delete(`/v1/supervision/schedule/classroom-inspection/${id}`, {})
  },

  // 更新理论教室巡查督导状态
  updateClassroomInspectionScheduleStatus: async (id: string, data: ScheduleStatusParams) => {
    return $put(`/v1/supervision/schedule/classroom-inspection/${id}/status`, data)
  }
}

// 行政坐班督导安排管理接口
export const administrativeScheduleAPI = {
  // 创建行政坐班督导安排
  createAdministrativeSchedule: async (data: {
    supervisionDate: string
    weekDay: string
    period: number
    leader: string
    members: string[]
    notes?: string
  }) => {
    return $post('/v1/supervision/schedule/administrative', data)
  },

  // 获取行政坐班督导安排列表
  getAdministrativeScheduleList: async (params: {
    page?: number
    size?: number
    startDate?: string
    endDate?: string
    status?: string
  }) => {
    return $get('/v1/supervision/schedule/administrative/list', params)
  },

  // 获取行政坐班督导安排详情
  getAdministrativeScheduleDetail: async (id: string) => {
    return $get(`/v1/supervision/schedule/administrative/${id}`, {})
  },

  // 更新行政坐班督导安排
  updateAdministrativeSchedule: async (id: string, data: {
    supervisionDate: string
    weekDay: string
    period: number
    leader: string
    members: string[]
    notes?: string
  }) => {
    return $put(`/v1/supervision/schedule/administrative/${id}`, data)
  },

  // 删除行政坐班督导安排
  deleteAdministrativeSchedule: async (id: string) => {
    return $delete(`/v1/supervision/schedule/administrative/${id}`, {})
  },

  // 更新行政坐班督导状态
  updateAdministrativeScheduleStatus: async (id: string, data: {
    status: string
    action: string
  }) => {
    return $put(`/v1/supervision/schedule/administrative/${id}/status`, data)
  }
}

// 用户管理接口
export const userAPI = {
  // 获取用户列表
  getUserList: async (params: {
    page?: number
    size?: number
    username?: string
    realName?: string
    department?: string
    status?: number // 1: 正常 2: 禁用
  }) => {
    return $get('/v1/system/user/list', params)
  },

  // 根据角色获取用户列表
  getUsersByRole: async (roleCode: string, params: { page?: number; size?: number }) => {
    return $get(`/v1/system/user/by-role/${roleCode}`, params)
  },

  // 获取用户详情
  getUserDetail: async (id: string) => {
    return $get(`/v1/system/user/${id}`, {})
  },

  // 创建用户
  createUser: async (data: {
    username: string
    password: string
    realName: string
    email?: string
    phone?: string
    avatar?: string
    department?: string
    office?: string
    status?: number
    roleIds?: string[]
  }) => {
    return $post('/v1/system/user', data)
  },

  // 更新用户
  updateUser: async (id: string, data: {
    username: string
    realName: string
    email?: string
    phone?: string
    avatar?: string
    department?: string
    office?: string
    status?: number
    roleIds?: string[]
  }) => {
    return $put(`/v1/system/user/${id}`, data)
  },

  // 删除用户
  deleteUser: async (id: string) => {
    return $delete(`/v1/system/user/${id}`, {})
  },

  // 批量删除用户
  batchDeleteUser: async (ids: string[]) => {
    return $delete('/v1/system/user/batch', { ids })
  },

  // 启用/禁用用户
  updateUserStatus: async (id: string, status: number) => {
    return $put(`/v1/system/user/${id}/status?status=${status}`, {})
  },

  // 重置用户密码
  resetUserPassword: async (id: string, newPassword: string) => {
    return $put(`/v1/system/user/${id}/password?newPassword=${newPassword}`, {})
  },

  // 获取所有启用的用户
  getActiveUsers: async () => {
    return $get('/v1/system/user/active', {})
  },

  // 根据部门获取用户列表
  getUsersByDepartment: async (department: string) => {
    return $get(`/v1/system/user/by-department/${department}`, {})
  },

  // 检查用户名是否存在
  checkUsername: async (username: string, excludeId?: string) => {
    const params: { username: string; excludeId?: string } = { username }
    if (excludeId) {
      params.excludeId = excludeId
    }
    return $get('/v1/system/user/check-username', params)
  },

  // 检查邮箱是否存在
  checkEmail: async (email: string, excludeId?: string) => {
    const params: { email: string; excludeId?: string } = { email }
    if (excludeId) {
      params.excludeId = excludeId
    }
    return $get('/v1/system/user/check-email', params)
  },

  // 检查手机号是否存在
  checkPhone: async (phone: string, excludeId?: string) => {
    const params: { phone: string; excludeId?: string } = { phone }
    if (excludeId) {
      params.excludeId = excludeId
    }
    return $get('/v1/system/user/check-phone', params)
  },

  // 修改上传用户头像
    uploadAvatar: async (file: File) => {
        // 1. 创建 FormData 对象
        const formData = new FormData();
        formData.append('file', file); // 'file' 是后端接收的参数名
        const response = await request.post('/v1/system/user/upload-avatar', formData, {
            headers:{
                'Content-Type': 'multipart/form-data'
            }
        })
    },

}

// 角色管理接口
export const roleAPI = {
  // 获取角色列表
  getRoleList: async (params: {
    page?: number
    size?: number
    roleName?: string
    roleCode?: string
    status?: string // active: 正常 inactive: 禁用
  }) => {
    return $get('/v1/system/role/list', params)
  },

  // 获取角色详情
  getRoleDetail: async (id: string) => {
    return $get(`/v1/system/role/${id}`, {})
  },

  // 创建角色
  createRole: async (data: {
    roleName: string
    roleCode: string
    description?: string
    status?: number
    sortOrder?: number
  }) => {
    return $post('/v1/system/role', data)
  },

  // 更新角色
  updateRole: async (id: string, data: {
    roleName: string
    roleCode: string
    description?: string
    status?: number
    sortOrder?: number
  }) => {
    return $put(`/v1/system/role/${id}`, data)
  },

  // 删除角色
  deleteRole: async (id: string) => {
    return $delete(`/v1/system/role/${id}`, {})
  },

  // 批量删除角色
  batchDeleteRole: async (ids: string[]) => {
    return $delete('/v1/system/role/batch', { ids })
  },

  // 启用/禁用角色
  updateRoleStatus: async (id: string, status: number) => {
    return $put(`/v1/system/role/${id}/status?status=${status}`, {})
  },

  // 获取所有启用的角色
  getActiveRoles: async () => {
    return $get('/v1/system/role/active', {})
  },

  // 检查角色编码是否存在
  checkRoleCode: async (roleCode: string, excludeId?: string) => {
    const params: { roleCode: string; excludeId?: string } = { roleCode }
    if (excludeId) {
      params.excludeId = excludeId
    }
    return $get('/v1/system/role/check-code', params)
  },

  // 获取角色权限
  getRolePermissions: async (roleId: string) => {
    return $get(`/v1/system/role/${roleId}/permissions`, {})
  },

  // 更新角色权限
  updateRolePermissions: async (roleId: string, permissionIds: string[]) => {
    return $put(`/v1/system/role/${roleId}/permissions`, permissionIds)
  }
}

// 权限管理接口
export const permissionAPI = {
  // 获取权限列表
  getPermissionList: async (params: {
    page?: number
    size?: number
    permissionName?: string
    permissionCode?: string
    permissionType?: number // 1: 菜单 2: 按钮 3: 接口
    status?: number // 1: 正常 2: 禁用
  }) => {
    return $get('/v1/system/permission/list', params)
  },

  // 获取权限详情
  getPermissionDetail: async (id: string) => {
    return $get(`/v1/system/permission/${id}`, {})
  },

  // 创建权限
  createPermission: async (data: {
    parentId?: string
    permissionName: string
    permissionCode: string
    permissionType: number
    path?: string
    component?: string
    icon?: string
    sortOrder?: number
    status?: number
  }) => {
    return $post('/v1/system/permission', data)
  },

  // 更新权限
  updatePermission: async (id: string, data: {
    parentId?: string
    permissionName: string
    permissionCode: string
    permissionType: number
    path?: string
    component?: string
    icon?: string
    sortOrder?: number
    status?: number
  }) => {
    return $put(`/v1/system/permission/${id}`, data)
  },

  // 删除权限
  deletePermission: async (id: string) => {
    return $delete(`/v1/system/permission/${id}`, {})
  },

  // 批量删除权限
  batchDeletePermission: async (ids: string[]) => {
    return $delete('/v1/system/permission/batch', { ids })
  },

  // 启用/禁用权限
  updatePermissionStatus: async (id: string, status: number) => {
    return $put(`/v1/system/permission/${id}/status?status=${status}`, {})
  },

  // 获取权限树
  getPermissionTree: async () => {
    return $get('/v1/system/permission/tree', {})
  },

  // 根据父权限ID获取子权限
  getPermissionChildren: async (parentId: string) => {
    return $get(`/v1/system/permission/${parentId}/children`, {})
  },

  // 获取所有启用的权限
  getActivePermissions: async () => {
    return $get('/v1/system/permission/active', {})
  },

  // 检查权限编码是否存在
  checkPermissionCode: async (permissionCode: string, excludeId?: string) => {
    const params: { permissionCode: string; excludeId?: string } = { permissionCode }
    if (excludeId) {
      params.excludeId = excludeId
    }
    return $get('/v1/system/permission/check-code', params)
  }
}

// 督导记录管理接口
export const supervisionRecordAPI = {
  // 创建督导记录
  createRecord: async (data: SupervisionRecordParams) => {
    return $post('/v1/supervision/record', data)
  },

  // 获取督导记录列表
  getRecordList: async (params: SupervisionRecordQueryParams) => {
    return $get('/v1/supervision/record/list', params)
  },
  // 获取按任务分组的记录列表
  getRecordGroupByTask: async (params: SupervisionRecordGroupQueryParams) => {
      return $get('/v1/supervision/record/group-by-task', params)
  },

  // 获取督导记录详情
  getRecordDetail: async (id: string) => {
    return $get(`/v1/supervision/record/${id}`, {})
  },

  // 更新督导记录
  updateRecord: async (id: string, data: SupervisionRecordParams) => {
    return $put(`/v1/supervision/record/${id}`, data)
  },

  // 删除督导记录
  deleteRecord: async (id: string) => {
    return $post(`/v1/supervision/record/${id}`, {})
  },

  // 提交教学评价
  submitTeachingEvaluation: async (id: string, data: TeachingEvaluation) => {
    return $post(`/v1/supervision/record/${id}/teaching-evaluation`, data)
  },

  // 提交学习评价
  submitLearningEvaluation: async (id: string, data: LearningEvaluation) => {
    return $post(`/v1/supervision/record/${id}/learning-evaluation`, data)
  },

  // 提交到课情况评价
  submitAttendanceEvaluation: async (id: string, data: AttendanceEvaluation) => {
    return $post(`/v1/supervision/record/${id}/attendance-evaluation`, data)
  },

  // 获取评价汇总
  getEvaluationSummary: async (id: string) => {
    return $get(`/v1/supervision/record/${id}/evaluation-summary`, {})
  },

  // 提交督导记录
  submitRecord: async (id: string) => {
    return $put(`/v1/supervision/record/${id}/submit`, {})
  },

  // 审核督导记录
  approveRecord: async (id: string, data: { action: string; approvalNote?: string }) => {
    return $put(`/v1/supervision/record/${id}/approve`, data)
  },

  // --------------------------------------------------教室巡查------------------------------------------------
  // 获取获取教室巡查记录列表
  getClassroomPatrolRecordList: async (params: SupervisionRecordQueryParams) => {
      return $get('/v1/supervision/record/classroom-patrol/list', params)
  }
}

// 请假记录管理接口
export const leaveRecordAPI = {
  // 创建请假记录
  createLeaveRecord: async (data: LeaveRecordCreateParams) => {
    return $post('/v1/leave-record', data)
  },

  // 获取请假记录列表
  getLeaveRecordList: async (params: LeaveRecordQueryParams) => {
    return $get('/v1/leave-record/list', params)
  },

  // 获取请假记录详情
  getLeaveRecordDetail: async (id: string) => {
    return $get(`/v1/leave-record/${id}`, {})
  },

  // 更新请假记录
  updateLeaveRecord: async (id: string, data: LeaveRecordUpdateParams) => {
    return $put(`/v1/leave-record/${id}`, data)
  },

  // 删除请假记录
  deleteLeaveRecord: async (id: string) => {
    return $post(`/v1/leave-record/${id}`, {})
  },

  // 审核请假记录
  approveLeaveRecord: async (id: string, data: LeaveRecordApprovalParams) => {
    return $put(`/v1/leave-record/${id}/approve`, data)
  },

  // 获取待审核请假记录
  getPendingLeaveRecords: async (params: {
    page?: number
    size?: number
  }) => {
    return $get('/v1/leave-record/pending', params)
  },

  // 获取请假统计信息
  getLeaveRecordStatistics: async (params: {
    startDate: string
    endDate: string
    classId?: string
  }) => {
    return $get('/v1/leave-record/statistics', params)
  },

  // 获取班级应到人数
  getExpectedCount: async (classId: string, date: string, period: number) => {
    return $get(`/v1/leave-record/expected-count/${classId}/${date}/${period}`, {})
  },

  // 确认应到人数
  confirmExpectedCount: async (data: {
    classId: string
    date: string
    period: number
    expectedCount: number
  }) => {
    return $put('/v1/leave-record/expected-count/confirm', data)
  }
}

// 课表管理接口
export const scheduleAPI = {
  // 获取课表列表
  getScheduleList: async (params: ScheduleQueryParams) => {
    return $get('/v1/schedule/list', params)
  },

  // 获取课表详情
  getScheduleDetail: async (id: string) => {
    return $get(`/v1/schedule/${id}`, {})
  },

  // 创建课表
  createSchedule: async (data: ScheduleRequest) => {
    return $post('/v1/schedule', data)
  },

  // 更新课表
  updateSchedule: async (id: string, data: ScheduleRequest) => {
    return $put(`/v1/schedule/${id}`, data)
  },

  // 删除课表
  deleteSchedule: async (id: string) => {
    return $delete(`/v1/schedule/${id}`, {})
  },

  // 根据日期和节次获取课表
  getScheduleByDate: async (date: string, period: string) => {
    return $get(`/v1/schedule/by-date/${date}/${period}`, {})
  },

  // 根据教室获取课表
  getScheduleByClassroom: async (classroomId: string, date: string) => {
    return $get(`/v1/schedule/by-classroom/${classroomId}/${date}`, {})
  },

  // 根据教师获取课表
  getScheduleByTeacher: async (teacher: string, date: string) => {
    return $get(`/v1/schedule/by-teacher/${teacher}/${date}`, {})
  }
}

// 文件管理接口
export const fileAPI = {
  // 上传督导相关文件
    uploadFile: async (
        file: File,
        supervisionRecordId: string,
        fileCategory: 'photo' | 'video' | 'document',
        description?: string
    ): Promise<ApiResponse<FileUploadResponse>> => {
        const formData = new FormData();
        formData.append('file', file);
        formData.append('supervisionRecordId', supervisionRecordId);
        formData.append('fileCategory', fileCategory);
        if (description) {
            formData.append('description', description);
        }
        return $post<ApiResponse<FileUploadResponse>>('/v1/supervision/file/upload', formData, {
            headers: {
                'Content-Type': 'multipart/form-data',
            },
        });
    },

  // 获取督导记录相关文件
  getFileList: async (recordId: string) => {
    return $get(`/v1/supervision/file/list/${recordId}`, {})
  },

  // 删除文件
  deleteFile: async (id: string) => {
    return $post(`/v1/supervision/file/${id}`, {})
  },

  // 获取文件分类列表
  getFileCategories: async () => {
    return $get('/v1/supervision/file/categories', {})
  },

  // 根据分类获取文件
  getFilesByCategory: async (recordId: string, category: string) => {
    return $get(`/v1/supervision/file/by-category/${recordId}/${category}`, {})
  },

  // 浏览文件
  getView: async (url: string): Promise<Blob> => {
    if (!url) throw new Error('URL is required');
    const fullUrl = url.startsWith('http')
        ? url
        : `${import.meta.env.VITE_API_BASE_URL}${url.startsWith('/') ? url : `/${url}`}`;
    try {
        // 强制指定 $get 返回 AxiosResponse<Blob>，然后取 .data
        const response = await $get<AxiosResponse<Blob>>(fullUrl, {
            responseType: 'blob',
        });
        return response.data; // 现在 response.data 是 Blob 类型
        } catch (error) {
        console.error('Failed to fetch image:', error);
        throw error;
    }
  }
}

// 办公室管理接口
export const officeAPI = {
  // 获取办公室列表
  getOfficeList: async (params: OfficeQueryParams) => {
    return $get('/v1/offices', params)
  },

  // 获取办公室详情
  getOfficeDetail: async (id: string) => {
    return $get(`/v1/offices/${id}`, {})
  },

  // 创建办公室
  createOffice: async (data: OfficeCreateParams) => {
    return $post('/v1/offices', data)
  },

  // 更新办公室
  updateOffice: async (id: string, data: OfficeUpdateParams) => {
    return $put(`/v1/offices/${id}`, data)
  },

  // 删除办公室
  deleteOffice: async (id: string) => {
    return $delete(`/v1/offices/${id}`, {})
  },

  // 批量删除办公室
  batchDeleteOffice: async (ids: string[]) => {
    return $delete('/v1/offices/batch', {ids: ids})
  }
}

// 统计查询接口
export const statisticsAPI = {
  // 获取日常教学督导统计
  getDailyTeachingStatistics: async (params: {
    startDate: string
    endDate: string
    department?: string
  }) => {
    return $get('/v1/supervision/statistics/daily-teaching', params)
  },

  // 获取教师督导统计
  getTeacherStatistics: async (teacherId: string, params: {
    startDate: string
    endDate: string
  }) => {
    return $get(`/v1/supervision/statistics/by-teacher/${teacherId}`, params)
  },

  // 获取班级督导统计
  getClassStatistics: async (classId: string, params: {
    startDate: string
    endDate: string
  }) => {
    return $get(`/v1/supervision/statistics/by-class/${classId}`, params)
  },

  // 获取教学评分统计
  getTeachingScoresStatistics: async (params: {
    startDate: string
    endDate: string
  }) => {
    return $get('/v1/supervision/statistics/teaching-scores', params)
  },

  // 获取学习评分统计
  getLearningScoresStatistics: async (params: {
    startDate: string
    endDate: string
  }) => {
    return $get('/v1/supervision/statistics/learning-scores', params)
  },

  // 获取到课率统计
  getAttendanceRatesStatistics: async (params: {
    startDate: string
    endDate: string
  }) => {
    return $get('/v1/supervision/statistics/attendance-rates', params)
  },

  // 获取理论教室巡查楼层统计
  getFloorStatistics: async (data: { month: string; includeCancelled?: boolean }) => {
    return $post('/v1/supervision/statistics/classroom-inspection/floor-statistics', data)
  },

  // ==================== 仪表盘数据接口 ====================

  // 获取仪表盘汇总数据
  getDashboardSummary: async (params: {
    startDate: string
    endDate: string
  }) => {
    return $get('/v1/supervision/statistics/dashboard/summary', params)
  },

  // 获取教学督导趋势数据
  getTeachingTrendData: async (params: {
    months?: number
  }) => {
    return $get('/v1/supervision/statistics/dashboard/teaching-trend', params)
  },

  // 获取考勤状态分布数据
  getAttendanceDistributionData: async (params: {
    startDate: string
    endDate: string
  }) => {
    return $get('/v1/supervision/statistics/dashboard/attendance-distribution', params)
  },

  // 获取巡查评分统计数据
  getInspectionScoresData: async (params: {
    startDate: string
    endDate: string
  }) => {
    return $get('/v1/supervision/statistics/dashboard/inspection-scores', params)
  },

  // 获取月度对比数据
  getMonthlyComparisonData: async (params: {
    currentMonth: string
    compareMonth: string
  }) => {
    return $get('/v1/supervision/statistics/dashboard/monthly-comparison', params)
  },

  // 获取仪表盘完整数据
  getDashboardCompleteData: async (params: {
    startDate: string
    endDate: string
  }) => {
    return $get('/v1/supervision/statistics/dashboard/complete', params)
  },

  // ==================== 趋势分析接口 ====================

  // 获取督导记录趋势分析
  getSupervisionRecordsTrend: async (params: {
    startDate: string
    endDate: string
    dimension?: string
  }) => {
    return $get('/v1/supervision/statistics/trends/supervision-records', params)
  },

  // 获取评分趋势分析
  getScoresTrend: async (params: {
    startDate: string
    endDate: string
    scoreType?: string
  }) => {
    return $get('/v1/supervision/statistics/trends/scores', params)
  },

  // 获取考勤率趋势分析
  getAttendanceRatesTrend: async (params: {
    startDate: string
    endDate: string
  }) => {
    return $get('/v1/supervision/statistics/trends/attendance-rates', params)
  },

  // ==================== 分布统计接口 ====================

  // 获取部门分布统计
  getDepartmentDistribution: async (params: {
    startDate: string
    endDate: string
  }) => {
    return $get('/v1/supervision/statistics/distribution/departments', params)
  },

  // 获取教师分布统计
  getTeacherDistribution: async (params: {
    startDate: string
    endDate: string
    limit?: number
  }) => {
    return $get('/v1/supervision/statistics/distribution/teachers', params)
  },

  // 获取班级分布统计
  getClassDistribution: async (params: {
    startDate: string
    endDate: string
    limit?: number
  }) => {
    return $get('/v1/supervision/statistics/distribution/classes', params)
  },

  // ==================== 对比分析接口 ====================

  // 获取年度对比数据
  getYearlyComparison: async (params: {
    currentYear: string
    compareYear: string
  }) => {
    return $get('/v1/supervision/statistics/comparison/yearly', params)
  },

  // 获取部门对比数据
  getDepartmentComparison: async (params: {
    startDate: string
    endDate: string
  }) => {
    return $get('/v1/supervision/statistics/comparison/departments', params)
  },

  // ==================== 图表数据接口 ====================

  // 获取热力图数据
  getHeatmapData: async (params: {
    startDate: string
    endDate: string
  }) => {
    return $get('/v1/supervision/statistics/charts/heatmap', params)
  },

  // 获取雷达图数据
  getRadarData: async (params: {
    startDate: string
    endDate: string
    teacherId?: string
  }) => {
    return $get('/v1/supervision/statistics/charts/radar', params)
  },

  // 获取违规类型配置
  getViolationTypes: async () => {
    return $get('/v1/supervision/statistics/violation-types', {})
  },

}

// 审核管理接口
export const approvalAPI = {
  // 获取督导安排的所有审核结果
  getApprovalResultsBySchedule: async (scheduleId: string) => {
    return $get('/v1/supervision/approval/list', {
      supervisionScheduleId: scheduleId,
      classroomId: '',
      status: '',
      reviewStatus: ''
    })
  },

  // 审核汇总数据
  reviewApproval: async (approvalResultId: string, data: {
    action: 'approved' | 'rejected' | 'adjust'
    approvalNote?: string
    adjustedScores?: {
      teachingEvaluation?: {
        teachingAttitude?: number
        teachingMethod?: number
        seatingArrangement?: number
        comprehensiveEffect?: number
      }
      learningEvaluation?: {
        violationCount?: number
      }
    }
  }) => {
    return $post(`/v1/supervision/approval/review/${approvalResultId}`, data)
  },

  // 查看原始记录（汇总前数据）
  getOriginalRecords: async (approvalResultId: string) => {
    return $get(`/v1/supervision/approval/original-records/${approvalResultId}`, {})
  },

  // 分页获取通过审核的督导数据
  getApprovedRecords: async (params: {
    page?: number
    size?: number
    supervisionScheduleId?: string
    classroomId?: string
    classroomName?: string
    startTime?: string
    endTime?: string
  }) => {
    return $get('/v1/supervision/approval/approved/page', params)
  },

  // 获取媒体文件（图片/视频）
  getMediaFile: async (filePath: string) => {
    // 使用request实例获取blob数据
    const response = await request.get(`/v1/supervision/files/${filePath}`, {
      responseType: 'blob'
    })
    // 对于blob响应，返回response.data
    return response.data
  },

  // 批量导出通过汇总审核的记录
  batchExportRecords: async (data: {
    ids: string[]
  }): Promise<Blob> => {
      return $post('/v1/supervision/approval/batch-export', data, {
          responseType: 'blob',
          headers: {
              'Content-Type': 'application/json'
          }
      })
  }
}

// 班级管理接口
export const classAPI = {
  // 获取班级列表
  getClassList: async (params: ClassQueryParams) => {
    return $get('/v1/classes', params)
  },

  // 获取班级详情
  getClassDetail: async (id: string) => {
    return $get(`/v1/classes/${id}`, {})
  },

  // 创建班级
  createClass: async (data: ClassCreateParams) => {
    return $post('/v1/classes', data)
  },

  // 更新班级
  updateClass: async (id: string, data: ClassUpdateParams) => {
    return $put(`/v1/classes/${id}`, data)
  },

  // 删除班级
  deleteClass: async (id: string) => {
    return $delete(`/v1/classes/${id}`, {})
  },

  // 批量删除班级
  batchDeleteClass: async (ids: string[]) => {
    return $delete('/v1/classes/batch', { ids })
  },

  // 启用/禁用班级
  updateClassStatus: async (id: string, status: number) => {
    return $put(`/v1/classes/${id}/status?status=${status}`, {})
  },

  // 检查班级名称是否存在
  checkClassName: async (className: string, excludeId?: string) => {
    const params: { className: string; excludeId?: string } = { className }
    if (excludeId) {
      params.excludeId = excludeId
    }
    return $get('/v1/classes/check-name', params)
  }
}

// 巡查项目配置管理接口
export const inspectionItemConfigAPI = {
  // 获取巡查项目配置列表
  getInspectionItemConfigList: async (params: {
    parentCategoryId?: string
    status?: string
    page?: number
    size?: number
  }) => {
    return $get('/v1/inspection-item-config/list', params)
  },

  // 根据父分类ID获取巡查项目配置
  getInspectionItemConfigByParentId: async (parentId: string) => {
    return $get(`/v1/inspection-item-config/by-parent/${parentId}`, {})
  },

  // 创建巡查项目配置
  createInspectionItemConfig: async (data: {
    itemName: string
    parentCategoryId?: string
    level?: number
    maxScore: number
    itemType: 'category' | 'score' | 'boolean'
    sortOrder: number
    status: number
  }) => {
    return $post('/v1/inspection-item-config', data)
  },

  // 更新巡查项目配置
  updateInspectionItemConfig: async (id: string, data: {
    itemName: string
    parentCategoryId?: string
    level?: number
    maxScore: number
    itemType: 'category' | 'score' | 'boolean'
    sortOrder: number
    status: number
  }) => {
    return $put(`/v1/inspection-item-config/${id}`, data)
  },

  // 删除巡查项目配置
  deleteInspectionItemConfig: async (id: string) => {
    return $delete(`/v1/inspection-item-config/${id}`)
  },

  // 获取所有分类
  getAllCategories: async () => {
    return $get('/v1/inspection-item-config/categories', {})
  },

  // 创建新分类
  createCategory: async (data: {
    categoryName: string
  }) => {
    const params = new URLSearchParams()
    params.append('categoryName', data.categoryName)
    return $post(`/v1/inspection-item-config/categories?${params.toString()}`, {})
  },

  // 更新分类
  updateCategory: async (id: string, data: {
    categoryName: string
  }) => {
    const params = new URLSearchParams()
    params.append('categoryName', data.categoryName)
    return $put(`/v1/inspection-item-config/categories/${id}?${params.toString()}`, {})
  },

  // 删除分类
  deleteCategory: async (id: string) => {
    return $delete(`/v1/inspection-item-config/categories/${id}`)
  }
}

// 教室巡查记录管理接口
export const classroomInspectionRecordAPI = {
  // 创建教室巡查记录
  createInspectionRecord: async (data: {
    supervisionScheduleId: string
    classroomId: string
    inspectionScores: Array<{
      itemId: string
      itemName: string
      itemCategory?: string
      parentCategoryId?: string
      level?: number
      itemType: 'category' | 'score' | 'boolean'
      maxScore: number
      actualScore: number
      remark?: string
    }>
    notes?: string
  }) => {
    return $post('/v1/classroom-inspection-record', data)
  },

  // 获取教室巡查记录列表
  getInspectionRecordList: async (params: {
    supervisionScheduleId?: string
    classroomId?: string
    status?: string
    page?: number
    size?: number
  }) => {
    return $get('/v1/classroom-inspection-record/list', params)
  },

  // 获取教室巡查记录详情
  getInspectionRecordById: async (id: string) => {
    return $get(`/v1/classroom-inspection-record/${id}`)
  },

  // 更新教室巡查记录
  updateInspectionRecord: async (id: string, data: {
    supervisionScheduleId: string
    classroomId: string
    inspectionScores: Array<{
      itemId: string
      itemName: string
      itemCategory?: string
      parentCategoryId?: string
      level?: number
      itemType: 'category' | 'score' | 'boolean'
      maxScore: number
      actualScore: number
      remark?: string
    }>
    notes?: string
  }) => {
    return $put(`/v1/classroom-inspection-record/${id}`, data)
  },

  // 删除教室巡查记录
  deleteInspectionRecord: async (id: string) => {
    return $delete(`/v1/classroom-inspection-record/${id}`)
  },

  // 提交教室巡查记录
  submitInspectionRecord: async (id: string) => {
    return $post(`/v1/classroom-inspection-record/${id}/submit`)
  },

  // 获取可巡查的教室列表
  getAvailableClassrooms: async (supervisionScheduleId: string) => {
    return $get('/v1/classroom-inspection-record/available-classrooms', { supervisionScheduleId })
  },

  // 获取巡查项目配置
  getInspectionItems: async (supervisionScheduleId: string) => {
    return $get('/v1/classroom-inspection-record/inspection-items', { supervisionScheduleId })
  },

  // 获取所有督导安排列表（仅开发环境使用）
  // 注意：此接口仅用于开发调试，生产环境应移除或添加权限控制
  // getAllSchedules: async () => {
  //   if (import.meta.env.DEV) {
  //     return $get('/v1/classroom-inspection-record/debug/schedules')
  //   } else {
  //     throw new Error('此接口仅在开发环境可用')
  //   }
  // }
}

// 教室管理接口
export const classroomAPI = {
  // 获取教室列表
  getClassroomList: async (params: ClassroomQueryParams) => {
    return $get('/v1/classrooms', params)
  },

  // 获取教室详情
  getClassroomDetail: async (id: string) => {
    return $get(`/v1/classrooms/${id}`, {})
  },

  // 创建教室
  createClassroom: async (data: ClassroomCreateParams) => {
    return $post('/v1/classrooms', data)
  },

  // 更新教室
  updateClassroom: async (id: string, data: ClassroomUpdateParams) => {
    return $put(`/v1/classrooms/${id}`, data)
  },

  // 删除教室
  deleteClassroom: async (id: string) => {
    return $delete(`/v1/classrooms/${id}`, {})
  }
}

// 课程管理接口
export const courseAPI = {
  // 获取课程列表
  getCourseList: async (params: CourseQueryParams) => {
    return $get('/v1/courses', params)
  },

  // 获取课程详情
  getCourseDetail: async (id: string) => {
    return $get(`/v1/courses/${id}`, {})
  },

  // 创建课程
  createCourse: async (data: CourseCreateParams) => {
    return $post('/v1/courses', data)
  },

  // 更新课程
  updateCourse: async (id: string, data: CourseUpdateParams) => {
    return $put(`/v1/courses/${id}`, data)
  },

  // 删除课程
  deleteCourse: async (id: string) => {
    return $delete(`/v1/courses/${id}`, {})
  }
}

// 督导汇总管理接口
export const summaryAPI = {
    manualSummarize: async (data: {
        supervisionScheduleId: string,
        classroomId: string
    }) => $post('/v1/supervision/summary/manual-summarize', data)
}

// 模块二：教研室活动日安排管理接口
export const researchActivityAPI = {
  // 创建教研室活动日安排
  createActivity: async (data: ResearchActivityRequest): Promise<ResearchActivityCreateResponse> => {
    return $post('/v1/research-office-activity', data)
  },

  // 获取教研室活动日安排列表
  getActivityList: async (params: {
    page?: number
    size?: number
    officeId?: string
    startDate?: string
    endDate?: string
    status?: string
  }): Promise<ResearchActivityListResponse> => {
    return $get('/v1/research-office-activity/list', params)
  },

  // 获取教研室活动日安排详情
  getActivityDetail: async (id: string): Promise<ResearchActivityResponse> => {
    return $get(`/v1/research-office-activity/${id}`, {})
  },

  // 更新教研室活动日安排
  updateActivity: async (id: string, data: ResearchActivityRequest): Promise<ResearchActivityUpdateResponse> => {
    return $put(`/v1/research-office-activity/${id}`, data)
  },

  // 删除教研室活动日安排
  deleteActivity: async (id: string): Promise<ResearchActivityDeleteResponse> => {
    return $delete(`/v1/research-office-activity/${id}`, {})
  },

  // 更新活动状态
  updateActivityStatus: async (id: string, data: { status: string; notes?: string }): Promise<ResearchActivityUpdateResponse> => {
    return $put(`/v1/research-office-activity/${id}/status`, data)
  }
}

// 模块二：教职工异动记录管理接口
export const staffMovementAPI = {
  // 创建教职工异动记录
  createMovement: async (data: StaffMovementRequest): Promise<StaffMovementCreateResponse> => {
    return $post('/v1/staff-movement-record', data)
  },

  // 获取教职工异动记录列表
  getMovementList: async (params: {
    page?: number
    size?: number
    staffId?: string
    movementType?: string
    startDate?: string
    endDate?: string
    approvalStatus?: string
  }): Promise<StaffMovementListResponse> => {
    return $get('/v1/staff-movement-record/list', params)
  },

  // 获取教职工异动记录详情
  getMovementDetail: async (id: string): Promise<StaffMovementResponse> => {
    return $get(`/v1/staff-movement-record/${id}`, {})
  },

  // 更新教职工异动记录
  updateMovement: async (id: string, data: StaffMovementRequest): Promise<StaffMovementUpdateResponse> => {
    return $put(`/v1/staff-movement-record/${id}`, data)
  },

  // 删除教职工异动记录
  deleteMovement: async (id: string): Promise<StaffMovementDeleteResponse> => {
    return $delete(`/v1/staff-movement-record/${id}`, {})
  },

  // 审批教职工异动记录
  approveMovement: async (id: string, data: StaffMovementApprovalRequest): Promise<StaffMovementApproveResponse> => {
    return $put(`/v1/staff-movement-record/${id}/approve`, data)
  }
}

// 模块二：在岗状态记录管理接口
export const staffAttendanceAPI = {
  // 创建在岗状态记录
  createAttendance: async (data: StaffAttendanceRequest): Promise<StaffAttendanceCreateResponse> => {
    return $post('/v1/staff-attendance-record', data)
  },

  // 获取在岗状态记录列表
  getAttendanceList: async (params: {
    page?: number
    size?: number
    supervisionScheduleId?: string
    staffId?: string
    officeId?: string
    attendanceStatus?: string
  }): Promise<StaffAttendanceListResponse> => {
    return $get('/v1/staff-attendance-record/list', params)
  },

  // 获取在岗状态记录详情
  getAttendanceDetail: async (id: string): Promise<StaffAttendanceResponse> => {
    return $get(`/v1/staff-attendance-record/${id}`, {})
  },

  // 更新在岗状态记录
  updateAttendance: async (id: string, data: StaffAttendanceRequest): Promise<StaffAttendanceUpdateResponse> => {
    return $put(`/v1/staff-attendance-record/${id}`, data)
  },

  // 删除在岗状态记录
  deleteAttendance: async (id: string): Promise<StaffAttendanceDeleteResponse> => {
    return $delete(`/v1/staff-attendance-record/${id}`, {})
  },

  // 获取考勤状态列表
  getAttendanceStatusList: async (): Promise<AttendanceStatusListResponse> => {
    return $get('/v1/staff-attendance-record/status-options', {})
  }
}

// ==================== 短信发送接口 ====================
export const smsAPI = {
  // 发送提醒上岗短信（支持考勤记录ID或教职工ID）
  sendAttendanceReminder: async (params: {
    attendanceId?: string
    staffId?: string
  }): Promise<BooleanResponse> => {
    const queryParams = new URLSearchParams()
    if (params.attendanceId) {
      queryParams.append('attendanceId', params.attendanceId)
    }
    if (params.staffId) {
      queryParams.append('staffId', params.staffId)
    }
    return $post(`/v1/sms/send-attendance-reminder?${queryParams.toString()}`, {})
  },
  
  // 发送提醒上岗短信（通过考勤记录ID，兼容旧接口）
  sendAttendanceReminderByAttendanceId: async (attendanceId: string): Promise<BooleanResponse> => {
    return $post(`/v1/sms/send-attendance-reminder/${attendanceId}`, {})
  }
}

// ==================== 报表管理接口 ====================
export const reportAPI = {
  // 生成报表
  generateReport: async (data: ReportGenerateRequest): Promise<ReportGenerateResponse> => {
    return $post('/v1/supervision/reports/generate', data)
  },

  // 获取报表记录列表
  getReportRecords: async (params: ReportRecordQueryParams): Promise<ReportRecordListResponse> => {
    return $get('/v1/supervision/reports/records', params)
  },

  // 下载报表文件
  downloadReport: async (recordId: string): Promise<Blob> => {
    const response = await request.get(`/v1/supervision/reports/download/${recordId}`, {
      responseType: 'blob'
    })
    // 检查响应是否为错误
    if (response.data instanceof Blob && response.data.size === 0) {
      throw new Error('下载的文件为空')
    }
    return response.data
  },

  // 删除报表记录
  deleteReportRecord: async (recordId: string): Promise<ReportRecordDeleteResponse> => {
    return $delete(`/v1/supervision/reports/records/${recordId}`, {})
  },

  // 预览报表数据
  previewReportData: async (params: {
    startDate: string
    endDate: string
    bulletinNumber?: string
  }): Promise<ReportPreviewResponse> => {
    return $get('/v1/supervision/reports/preview', params)
  },

  // 导出PDF报表
  exportPdfReport: async (params: {
    startDate: string
    endDate: string
    bulletinNumber?: string
  }): Promise<Blob> => {
    const response = await request.get('/v1/supervision/reports/export/pdf', {
      params,
      responseType: 'blob'
    })
    return response.data
  },

  // 导出Word报表
  exportWordReport: async (params: {
    startDate: string
    endDate: string
    bulletinNumber?: string
  }): Promise<Blob> => {
    const response = await request.get('/v1/supervision/reports/export/word', {
      params,
      responseType: 'blob'
    })
    return response.data
  },

  // 获取督导安排列表（用于报表生成选择）
  getSchedulesForReport: async (params: SupervisionScheduleQueryParams): Promise<any> => {
    // 根据模块类型调用不同的API
    if (params.moduleType === 'daily_teaching') {
      return $get('/v1/supervision/schedule/daily-teaching/list', params)
    } else if (params.moduleType === 'administrative') {
      return $get('/v1/supervision/schedule/administrative/list', params)
    } else if (params.moduleType === 'classroom_inspection') {
      return $get('/v1/supervision/schedule/classroom-inspection/list', params)
    } else {
      // 如果没有指定模块类型，返回所有类型的安排
      // 这里需要后端提供一个统一的接口，暂时返回空
      return Promise.resolve({ data: { records: [] } })
    }
  }
}

