// API响应基础类型
export interface ApiResponse<T = any> {
  code: number
  message: string
  data: T
  timestamp: number
}

// 分页响应类型
export interface PageResponse<T = any> {
  records: T[]
  total: number
  size: number
  current: number
  pages: number
}

// 通用响应类型
export interface BooleanResponse extends ApiResponse<boolean> {}
export interface StringResponse extends ApiResponse<string> {}
export interface NumberResponse extends ApiResponse<number> {}

// ==================== 认证相关类型 ====================

// 登录请求参数
export interface LoginRequest extends Record<string, unknown> {
  username: string
  password: string
  clientType: 'web' | 'mobile'
}

// 登录响应数据
export interface LoginData {
  token: string
  refreshToken: string
  tokenType: string
  expiresIn: number
  userInfo: UserProfileVO
}

// 登录响应
export interface LoginResponse extends ApiResponse<LoginData> {}

// 刷新token请求参数
export interface RefreshTokenRequest extends Record<string, unknown> {
  refreshToken: string
}

// 刷新token响应
export interface RefreshTokenResponse extends ApiResponse<{ token: string; expiresIn: number }> {}

// 修改密码请求参数
export interface ChangePasswordRequest extends Record<string, unknown> {
  currentPassword: string
  newPassword: string
  confirmPassword: string
}

// 修改密码响应
export interface ChangePasswordResponse extends BooleanResponse {}

// 修改用户资料请求参数
export interface UpdateProfileRequest extends Record<string, unknown> {
  realName?: string
  email?: string
  phone?: string
  avatar?: string
  department?: string
  office?: string
}

// 修改用户资料响应
export interface UpdateProfileResponse extends BooleanResponse {}

// 登出响应
export interface LogoutResponse extends BooleanResponse {}

// ==================== 督导安排管理类型 ====================

// 督导安排类型
export interface SupervisionSchedule {
  id: string
  supervisionDate: string
  weekDay: string
  period: number
  leader: string
  leaderName: string
  members: string[]
  memberNames: string[]
  memberCount: number
  status: 'pending' | 'in_progress' | 'completed' | 'cancelled'
  statusName: string
  notes?: string
  createdTime: string
  updatedTime?: string
}

// 理论教室巡查督导安排类型
export interface ClassroomInspectionSchedule {
  id: string
  supervisionDate: string
  weekDay: string
  period: number
  members: string[]
  memberNames: string[]
  floorRange: string
  classroomCount: number
  status: 'pending' | 'in_progress' | 'completed' | 'cancelled'
  statusName: string
  notes?: string
  createdBy?: string
  createdByName?: string
  createdTime: string
  updatedBy?: string
  updatedByName?: string
  updatedTime?: string
}

// 督导安排创建参数
export interface SupervisionScheduleParams extends Record<string, unknown> {
  supervisionDate: string
  period: number
  leader: string
  members: string[]
  notes?: string
}

// 理论教室巡查督导安排创建参数
export interface ClassroomInspectionScheduleParams extends Record<string, unknown> {
  supervisionDate: string
  weekDay: string
  period: number
  members: string[]
  floorRange: string
  notes?: string
}

// 督导安排状态更新参数
export interface ScheduleStatusParams extends Record<string, unknown> {
  status: string
  action: string
}

// 督导安排列表查询参数
export interface SupervisionScheduleQueryParams extends Record<string, unknown> {
  page?: number
  size?: number
  startDate?: string
  endDate?: string
  status?: string
  moduleType?: string // daily_teaching, administrative, classroom_inspection
}

// 可用时间类型
export interface AvailableTime {
  date: string
  weekDay: string
  availablePeriods: number[]
}

// 时间冲突检查类型
export interface TimeConflictCheck {
  hasConflict: boolean
  conflictDetails?: string
}

// 督导安排相关响应
export interface AvailableTimesResponse extends ApiResponse<AvailableTime[]> {}
export interface TimeConflictCheckResponse extends ApiResponse<TimeConflictCheck> {}
export interface SupervisionScheduleResponse extends ApiResponse<SupervisionSchedule> {}
export interface SupervisionScheduleListResponse extends ApiResponse<PageResponse<SupervisionSchedule>> {}
export interface SupervisionScheduleCreateResponse extends BooleanResponse {}
export interface SupervisionScheduleUpdateResponse extends BooleanResponse {}
export interface SupervisionScheduleDeleteResponse extends BooleanResponse {}
export interface ScheduleStatusUpdateResponse extends BooleanResponse {}

// 理论教室巡查督导安排相关响应
export interface ClassroomInspectionScheduleResponse extends ApiResponse<ClassroomInspectionSchedule> {}
export interface ClassroomInspectionScheduleListResponse extends ApiResponse<PageResponse<ClassroomInspectionSchedule>> {}
export interface ClassroomInspectionScheduleCreateResponse extends ApiResponse<{ id: string; supervisionDate: string; weekDay: string; period: number; status: string; floorRange: string; classroomCount: number }> {}
export interface ClassroomInspectionScheduleUpdateResponse extends BooleanResponse {}
export interface ClassroomInspectionScheduleDeleteResponse extends BooleanResponse {}

// 楼层巡查统计类型
export interface FloorInspectionCount {
  floorNumber: number
  inspectionCount: number
  inspectionDates: string[]
  periodStatistics: PeriodInspectionCount[]
}

export interface PeriodInspectionCount {
  period: number
  inspectionCount: number
  inspectionDates: string[]
}

export interface ClassroomInspectionStatisticsVO {
  month: string
  floorStatistics: FloorInspectionCount[]
  totalInspectionCount: number
  totalFloorCount: number
}

export interface FloorStatisticsResponse extends ApiResponse<ClassroomInspectionStatisticsVO> {}

// ==================== 督导记录管理类型 ====================

// 督导记录类型
export interface SupervisionRecord {
  id: string
  supervisionScheduleId: string
  classroomId: string
  classroomName: string
  classId: string
  className: string
  courseName: string
  teacher: string
  expectedCount: number
  actualCount: number
  teachingScore: number
  learningScore: number
  attendanceScore: number
  totalScore: number
  status: 'draft' | 'submitted' | 'approved' | 'rejected'
  statusName: string
  createdTime: string
  updatedTime?: string
}

// 督导记录创建参数
export interface SupervisionRecordParams extends Record<string, unknown> {
  supervisionScheduleId: string
  classroomId: string
  classId: string
  courseName: string
  teacher: string
  expectedCount: number
  actualCount: number
}

// 督导记录查询参数
export interface SupervisionRecordQueryParams extends Record<string, unknown> {
  current?: number
  size?: number
  supervisionScheduleId?: string
  classroomId?: string
  status?: string
  startDate?: string
  endDate?: string
}

// 按任务分组的记录查询
export interface SupervisionRecordGroupQueryParams extends Record<string, unknown> {
    page?: number
    size?: number
    supervisionScheduleId?: string
    classroomId?: string
    status?: string
    startDate?: string
    endDate?: string
}

// 督导评价类型
export interface TeachingEvaluation extends Record<string, unknown> {
  teachingAttitude: string
  classroomAtmosphere: string
  studentParticipation: string
  seatingArrangement: string
  notes?: string
  photos?: string[]
}

export interface LearningEvaluation extends Record<string, unknown> {
  gamePlayingCount: number
  irrelevantVideoCount: number
  sleepingCount: number
  noMaterialsCount: number
  notes?: string
  photos?: string[]
}

export interface AttendanceEvaluation extends Record<string, unknown> {
  actualCount: number
  attendanceRate: number
  notes?: string
}

// 评价汇总类型
export interface EvaluationSummary {
  teachingEvaluation: TeachingEvaluation & { score: number }
  learningEvaluation: LearningEvaluation & { score: number }
  attendanceEvaluation: AttendanceEvaluation & { score: number }
  totalScore: number
}

// 督导记录相关响应
export interface SupervisionRecordResponse extends ApiResponse<SupervisionRecord> {}
export interface SupervisionRecordListResponse extends ApiResponse<PageResponse<SupervisionRecord>> {}
export interface SupervisionRecordCreateResponse extends BooleanResponse {}
export interface SupervisionRecordUpdateResponse extends BooleanResponse {}
export interface SupervisionRecordDeleteResponse extends BooleanResponse {}
export interface TeachingEvaluationSubmitResponse extends BooleanResponse {}
export interface LearningEvaluationSubmitResponse extends BooleanResponse {}
export interface AttendanceEvaluationSubmitResponse extends BooleanResponse {}
export interface EvaluationSummaryResponse extends ApiResponse<EvaluationSummary> {}
export interface RecordSubmitResponse extends BooleanResponse {}
export interface RecordApproveResponse extends BooleanResponse {}

// ==================== 用户管理类型 ====================

// 用户类型
export interface User {
  id: string
  username: string
  realName: string
  email?: string
  phone?: string
  avatar?: string
  department: string
  office?: string
  roleCodes: string[]
  roleNames: string[]
  status: 'active' | 'inactive'
  statusName: string
  createdTime: string
}

// 用户创建参数
export interface UserCreateParams extends Record<string, unknown> {
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
}

// 用户更新参数
export interface UserUpdateParams extends Record<string, unknown> {
  username: string
  realName: string
  email?: string
  phone?: string
  avatar?: string
  department?: string
  office?: string
  status?: number
  roleIds?: string[]
}

// 用户查询参数
export interface UserQueryParams extends Record<string, unknown> {
  page?: number
  size?: number
  username?: string
  realName?: string
  department?: string
  status?: number
}

// 用户资料类型
export interface UserProfileVO {
  id: string
  username: string
  realName: string
  email: string
  phone: string
  avatar: string
  department: string
  office: string
  role: string
  permissions: string[]
  lastLoginTime: string
}

// 用户相关响应
export interface UserResponse extends ApiResponse<User> {}
export interface UserListResponse extends ApiResponse<PageResponse<User>> {}
export interface UserCreateResponse extends BooleanResponse {}
export interface UserUpdateResponse extends BooleanResponse {}
export interface UserDeleteResponse extends BooleanResponse {}
export interface UserBatchDeleteResponse extends BooleanResponse {}
export interface UserStatusUpdateResponse extends BooleanResponse {}
export interface UserPasswordResetResponse extends BooleanResponse {}
export interface ActiveUsersResponse extends ApiResponse<User[]> {}
export interface UsersByDepartmentResponse extends ApiResponse<User[]> {}
export interface UsersByRoleResponse extends ApiResponse<PageResponse<User>> {}
export interface UsernameCheckResponse extends BooleanResponse {}
export interface EmailCheckResponse extends BooleanResponse {}
export interface PhoneCheckResponse extends BooleanResponse {}
export interface UserProfileResponse extends ApiResponse<UserProfileVO> {}

// ==================== 角色管理类型 ====================

// 角色类型
export interface Role {
  id: string
  roleName: string
  roleCode: string
  description?: string
  status: number
  sortOrder?: number
  createdTime: string
  updatedTime?: string
}

// 角色创建参数
export interface RoleCreateParams extends Record<string, unknown> {
  roleName: string
  roleCode: string
  description?: string
  status?: number
  sortOrder?: number
}

// 角色更新参数
export interface RoleUpdateParams extends Record<string, unknown> {
  roleName: string
  roleCode: string
  description?: string
  status?: number
  sortOrder?: number
}

// 角色查询参数
export interface RoleQueryParams extends Record<string, unknown> {
  page?: number
  size?: number
  roleName?: string
  roleCode?: string
  status?: string
}

// 角色相关响应
export interface RoleResponse extends ApiResponse<Role> {}
export interface RoleListResponse extends ApiResponse<PageResponse<Role>> {}
export interface RoleCreateResponse extends BooleanResponse {}
export interface RoleUpdateResponse extends BooleanResponse {}
export interface RoleDeleteResponse extends BooleanResponse {}
export interface RoleBatchDeleteResponse extends BooleanResponse {}
export interface RoleStatusUpdateResponse extends BooleanResponse {}
export interface ActiveRolesResponse extends ApiResponse<Role[]> {}
export interface RoleCodeCheckResponse extends BooleanResponse {}
export interface RolePermissionsResponse extends ApiResponse<string[]> {}
export interface RolePermissionsUpdateResponse extends BooleanResponse {}

// ==================== 权限管理类型 ====================

// 权限类型
export interface Permission {
  id: string
  parentId?: string
  permissionName: string
  permissionCode: string
  permissionType: number
  path?: string
  component?: string
  icon?: string
  sortOrder?: number
  status: number
  createdTime: string
  updatedTime?: string
}

// 权限创建参数
export interface PermissionCreateParams extends Record<string, unknown> {
  parentId?: string
  permissionName: string
  permissionCode: string
  permissionType: number
  path?: string
  component?: string
  icon?: string
  sortOrder?: number
  status?: number
}

// 权限更新参数
export interface PermissionUpdateParams extends Record<string, unknown> {
  parentId?: string
  permissionName: string
  permissionCode: string
  permissionType: number
  path?: string
  component?: string
  icon?: string
  sortOrder?: number
  status?: number
}

// 权限查询参数
export interface PermissionQueryParams extends Record<string, unknown> {
  page?: number
  size?: number
  permissionName?: string
  permissionCode?: string
  permissionType?: number
  status?: number
}

// 权限树节点类型
export interface PermissionTreeNode extends Permission {
  children?: PermissionTreeNode[]
}

// 权限相关响应
export interface PermissionResponse extends ApiResponse<Permission> {}
export interface PermissionListResponse extends ApiResponse<PageResponse<Permission>> {}
export interface PermissionCreateResponse extends BooleanResponse {}
export interface PermissionUpdateResponse extends BooleanResponse {}
export interface PermissionDeleteResponse extends BooleanResponse {}
export interface PermissionBatchDeleteResponse extends BooleanResponse {}
export interface PermissionStatusUpdateResponse extends BooleanResponse {}
export interface PermissionTreeResponse extends ApiResponse<PermissionTreeNode[]> {}
export interface PermissionChildrenResponse extends ApiResponse<Permission[]> {}
export interface ActivePermissionsResponse extends ApiResponse<Permission[]> {}
export interface PermissionCodeCheckResponse extends BooleanResponse {}

// ==================== 请假记录管理类型 ====================

// 请假记录类型
export interface LeaveRecord {
  id: string
  studentName: string
  classId: string
  className?: string
  leaveType: string
  leaveReason: string
  leaveDate: string
  period: number
  status: 'pending' | 'approved' | 'rejected'
  statusName: string
  approvalNote?: string
  createdTime: string
  updatedTime?: string
}

// 请假记录创建参数
export interface LeaveRecordCreateParams extends Record<string, unknown> {
  studentName: string
  classId: string
  leaveType: string
  leaveReason: string
  leaveDate: string
  period: number
}

// 请假记录更新参数
export interface LeaveRecordUpdateParams extends Record<string, unknown> {
  studentName?: string
  classId?: string
  leaveType?: string
  leaveReason?: string
  leaveDate?: string
  period?: number
}

// 请假记录查询参数
export interface LeaveRecordQueryParams extends Record<string, unknown> {
  page?: number
  size?: number
  classId?: string
  leaveDate?: string
  status?: string
}

// 请假记录审核参数
export interface LeaveRecordApprovalParams extends Record<string, unknown> {
  action: 'approve' | 'reject'
  approvalNote?: string
}

// 请假记录相关响应
export interface LeaveRecordResponse extends ApiResponse<LeaveRecord> {}
export interface LeaveRecordListResponse extends ApiResponse<PageResponse<LeaveRecord>> {}
export interface LeaveRecordCreateResponse extends BooleanResponse {}
export interface LeaveRecordUpdateResponse extends BooleanResponse {}
export interface LeaveRecordDeleteResponse extends BooleanResponse {}
export interface LeaveRecordApproveResponse extends BooleanResponse {}
export interface PendingLeaveRecordsResponse extends ApiResponse<PageResponse<LeaveRecord>> {}
export interface LeaveRecordStatisticsResponse extends ApiResponse<Record<string, number>> {}
export interface ExpectedCountResponse extends ApiResponse<number> {}
export interface ExpectedCountConfirmResponse extends BooleanResponse {}

// ==================== 课表管理类型 ====================

// 课表类型
export interface Schedule {
  id: string
  semester: string
  weekDay: string
  period: string
  teacher: string
  teacherName?: string
  courseName: string
  className?: string
  classroomId?: string
  classroomName?: string
  createdTime: string
  updatedTime?: string
}

// 课表创建参数
export interface ScheduleCreateParams extends Record<string, unknown> {
  semester: string
  weekDay: string
  period: string
  teacher: string
  courseName: string
  className?: string
  classroomId?: string
}

// 课表更新参数
export interface ScheduleUpdateParams extends Record<string, unknown> {
  semester?: string
  weekDay?: string
  period?: string
  teacher?: string
  courseName?: string
  className?: string
  classroomId?: string
}

// 课表查询参数
export interface ScheduleQueryParams extends Record<string, unknown> {
  page?: number
  size?: number
  semester?: string
  weekDay?: string
  teacher?: string
}

// 课表列表项VO（用于列表显示）
export interface ScheduleListItemVO {
  id: string
  semester: string
  weekDay: string
  period: string
  teacher: string
  courseName: string
  className?: string
  classroomId?: string
  classroomName?: string
  createdTime: string
}

// 课表详情VO（用于详情显示）
export interface ScheduleDetailVO {
  id: string
  semester: string
  weekDay: string
  period: string
  teacher: string
  courseName: string
  className?: string
  classroomId?: string
  classroomName?: string
  createdTime: string
  updatedTime?: string
}

// 课表请求参数（用于创建和更新）
export interface ScheduleRequest {
  semester: string
  weekDay: string
  period: string
  teacher: string
  courseName: string
  className?: string
  classroomId?: string
}

// 按日期和节次查询的课表VO
export interface ScheduleByDateVO {
  id: string
  semester: string
  weekDay: string
  period: string
  teacher: string
  courseName: string
  className?: string
  classroomId?: string
  classroomName?: string
}

// 按教室和日期查询的课表VO
export interface ScheduleByClassroomVO {
  id: string
  semester: string
  weekDay: string
  period: string
  teacher: string
  courseName: string
  className?: string
}

// 按教师和日期查询的课表VO
export interface ScheduleByTeacherVO {
  id: string
  semester: string
  weekDay: string
  period: string
  courseName: string
  className?: string
  classroomId?: string
  classroomName?: string
}

// 课表相关响应
export interface ScheduleResponse extends ApiResponse<Schedule> {}
export interface ScheduleListResponse extends ApiResponse<PageResponse<Schedule>> {}
export interface ScheduleCreateResponse extends BooleanResponse {}
export interface ScheduleUpdateResponse extends BooleanResponse {}
export interface ScheduleDeleteResponse extends BooleanResponse {}
export interface ScheduleImportResponse extends BooleanResponse {}
export interface ScheduleByDateResponse extends ApiResponse<Schedule[]> {}
export interface ScheduleByClassroomResponse extends ApiResponse<Schedule[]> {}
export interface ScheduleByTeacherResponse extends ApiResponse<Schedule[]> {}

// ==================== 文件管理类型 ====================

// 文件信息类型
export interface FileInfo {
  id: string
  fileName: string
  filePath: string
  fileSize: number
  fileType: string
  category: string
  recordId: string
  uploadedBy: string
  uploadedAt: string
}
// 文件上传
export interface FileUploadQueryParams {
    supervisionRecordId: string; // 必需
    fileCategory: 'avatar' | 'photo' | 'document'; // 必需，限定类型
}

// 文件分类类型
export interface FileCategory {
  id: string
  name: string
  code: string
  description?: string
}

// 文件相关响应
export interface FileUploadResponse extends ApiResponse<FileInfo> {}
export interface FileListResponse extends ApiResponse<FileInfo[]> {}
export interface FileDeleteResponse extends BooleanResponse {}
export interface FileCategoriesResponse extends ApiResponse<FileCategory[]> {}
export interface FilesByCategoryResponse extends ApiResponse<FileInfo[]> {}

// ==================== 办公室管理类型 ====================

// 办公室类型
export interface Office {
  id: string
  officeNumber: string
  officeName: string
  department: string
  floor: number
  location: string
  capacity: number
  status: number
  createdTime: string
  updatedTime?: string
}

// 办公室创建参数
export interface OfficeCreateParams extends Record<string, unknown> {
  officeNumber: string
  officeName: string
  department: string
  floor: number
  location: string
  capacity: number
  status?: number
}

// 办公室更新参数
export interface OfficeUpdateParams extends Record<string, unknown> {
  officeNumber: string
  officeName: string
  department: string
  floor: number
  location: string
  capacity: number
  status?: number
}

// 办公室查询参数
export interface OfficeQueryParams extends Record<string, unknown> {
  page?: number
  size?: number
  officeNumber?: string
  department?: string
  floor?: number
  status?: number
}

// 办公室相关响应
export interface OfficeResponse extends ApiResponse<Office> {}
export interface OfficeListResponse extends ApiResponse<PageResponse<Office>> {}
export interface OfficeCreateResponse extends BooleanResponse {}
export interface OfficeUpdateResponse extends BooleanResponse {}
export interface OfficeDeleteResponse extends BooleanResponse {}
export interface OfficeBatchDeleteResponse extends BooleanResponse {}

// ==================== 班级管理类型 ====================

// 班级类型
export interface Class {
  id: string
  className: string
  department: string
  studentCount: number
  counselor?: string
  partTimeTeacher?: string
  status: number
  lastVerifiedAt?: string
  verificationNote?: string
  createdBy?: string
  createdTime: string
  updatedBy?: string
  updatedTime: string
}

// 班级创建参数
export interface ClassCreateParams extends Record<string, unknown> {
  className: string
  department: string
  studentCount: number
  counselor?: string
  partTimeTeacher?: string
  status?: number
}

// 班级更新参数
export interface ClassUpdateParams extends Record<string, unknown> {
  className: string
  department: string
  studentCount: number
  counselor?: string
  partTimeTeacher?: string
  status?: number
}

// 班级查询参数
export interface ClassQueryParams extends Record<string, unknown> {
  page?: number
  size?: number
  className?: string
  department?: string
  counselor?: string
  status?: number
}

// 班级相关响应
export interface ClassResponse extends ApiResponse<Class> {}
export interface ClassListResponse extends ApiResponse<PageResponse<Class>> {}
export interface ClassCreateResponse extends BooleanResponse {}
export interface ClassUpdateResponse extends BooleanResponse {}
export interface ClassDeleteResponse extends BooleanResponse {}
export interface ClassBatchDeleteResponse extends BooleanResponse {}
export interface ClassStatusUpdateResponse extends BooleanResponse {}
export interface ClassNameCheckResponse extends BooleanResponse {}

// ==================== 统计分析类型 ====================

// 日常教学督导统计
export interface DailyTeachingStatistics {
  totalRecords: number
  completedRecords: number
  averageTeachingScore: number
  averageLearningScore: number
  averageAttendanceRate: number
  byWeek: WeeklyStatistics[]
  byTeacher: TeacherStatistics[]
}

// 周统计
export interface WeeklyStatistics {
  week: string
  recordCount: number
  averageTeachingScore: number
  averageLearningScore: number
  averageAttendanceRate: number
}

// 教师统计
export interface TeacherStatistics {
  teacherId?: string
  teacherName: string
  recordCount: number
  averageTeachingScore: number
  averageLearningScore: number
  averageAttendanceRate: number
}

// 教师详情统计
export interface TeacherDetailStatistics {
  teacherId?: string
  teacherName: string
  recordCount: number
  averageTeachingScore: number
  averageLearningScore: number
  averageAttendanceRate: number
  scoreTrend: ScoreTrend[]
}

// 班级统计
export interface ClassStatistics {
  classId: string
  className: string
  totalRecords: number
  averageTeachingScore: number
  averageLearningScore: number
  averageAttendanceRate: number
  improvementTrend: ImprovementTrend[]
}

// 评分趋势
export interface ScoreTrend {
  date: string
  teachingScore: number
  learningScore: number
  attendanceRate: number
}

// 改进趋势
export interface ImprovementTrend {
  date: string
  teachingScore: number
  learningScore: number
  attendanceRate: number
  improvement: number
}

// 教学评分统计
export interface TeachingScoresStatistics {
  averageScore: number
  scoreDistribution: {
    'A+': number
    'A': number
    'B': number
    'C': number
    'D': number
  }
  dimensionScores: {
    teachingAttitude: number
    classroomAtmosphere: number
    studentParticipation: number
    seatingArrangement: number
  }
}

// 学习评分统计
export interface LearningScoresStatistics {
  averageScore: number
  violationStatistics: {
    gamePlayingCount: number
    irrelevantVideoCount: number
    sleepingCount: number
    noMaterialsCount: number
  }
  improvementTrend: ScoreTrend[]
}

// 到课率统计
export interface AttendanceRatesStatistics {
  averageRate: number
  rateDistribution: {
    '0.9-1.0': number
    '0.8-0.9': number
    '0.7-0.8': number
    '0.6-0.7': number
  }
  byClass: ClassAttendanceStatistics[]
  byTeacher: TeacherAttendanceStatistics[]
}

// 班级到课统计
export interface ClassAttendanceStatistics {
  classId: string
  className: string
  averageRate: number
  recordCount: number
}

// 教师到课统计
export interface TeacherAttendanceStatistics {
  teacherId: string
  teacherName: string
  averageRate: number
  recordCount: number
}

// 统计相关响应
export interface DailyTeachingStatisticsResponse extends ApiResponse<DailyTeachingStatistics> {}
export interface TeacherStatisticsResponse extends ApiResponse<TeacherStatistics[]> {}
export interface ClassStatisticsResponse extends ApiResponse<ClassStatistics[]> {}
export interface TeachingScoresStatisticsResponse extends ApiResponse<TeachingScoresStatistics> {}
export interface LearningScoresStatisticsResponse extends ApiResponse<LearningScoresStatistics> {}
export interface AttendanceRatesStatisticsResponse extends ApiResponse<AttendanceRatesStatistics> {}

// ==================== 审核管理类型 ====================

// 督导审核结果
export interface SupervisionApprovalResultVO {
  id: string
  supervisionScheduleId: string
  classroomId: string
  classroomName: string
  classInfo: string
  attendanceInfo: string
  teachingEvaluation: string
  learningEvaluation: string
  totalScore: number
  notes: string
  approverId: string
  approverName: string
  approvedAt: string
  approvalNote: string
  status: string
  statusName: string
  reviewStatus: string
  reviewStatusName: string
  adjustmentCount: number
  lastAdjustmentTime: string
  createdTime: string
  updatedTime: string
}

// 审核结果分页
export interface PageResultSupervisionApprovalResultVO {
  records: SupervisionApprovalResultVO[]
  total: number
  current: number
  size: number
  pages: number
}

// 审核相关响应
export interface ApprovalResultsByScheduleResponse extends ApiResponse<SupervisionApprovalResultVO[]> {}
export interface ReviewApprovalResponse extends BooleanResponse {}
export interface OriginalRecordsResponse extends ApiResponse<SupervisionRecord[]> {}
export interface ApprovedRecordsResponse extends ApiResponse<PageResponse<SupervisionApprovalResultVO>> {}
export interface MediaFileResponse extends Blob {}

// ==================== 通用查询参数类型 ====================

// 基础查询参数
export interface BaseQueryParams extends Record<string, unknown> {
  page?: number
  size?: number
}

// 日期范围参数
export interface DateRangeParams extends Record<string, unknown> {
  startDate: string
  endDate: string
}

// 部门参数
export interface DepartmentParams extends Record<string, unknown> {
  department?: string
}

// 组合查询参数类型
export type QueryParamsWithDateRange = BaseQueryParams & DateRangeParams
export type QueryParamsWithDepartment = BaseQueryParams & DepartmentParams
export type QueryParamsWithDateAndDepartment = BaseQueryParams & DateRangeParams & DepartmentParams

// ==================== 响应类型别名 ====================

// 为了保持向后兼容性，保留原有的类型别名
export interface ClassListResponse extends ApiResponse<PageResponse<Class>> {}
export interface ClassDetailResponse extends ApiResponse<Class> {}
export interface ClassCreateResponse extends ApiResponse<boolean> {}
export interface ClassUpdateResponse extends ApiResponse<boolean> {}
export interface ClassDeleteResponse extends ApiResponse<boolean> {}

// ==================== 巡查项目配置类型 ====================

// 巡查项目子项类型
export interface InspectionSubItem {
  id?: string
  name: string
  score: number
  type: 'boolean' | 'score'
  description?: string
}

// 巡查项目配置类型
export interface InspectionItemConfig {
  id: string
  itemName: string
  parentCategoryId?: string
  parentCategoryName?: string
  level: number
  maxScore: number
  itemType: 'category' | 'score' | 'boolean'
  sortOrder: number
  status: number
  createdTime: string
  updatedTime: string
}

// 巡查项目创建/更新参数
export interface InspectionItemConfigParams {
  itemName: string
  parentCategoryId?: string
  level?: number
  maxScore: number
  itemType: 'category' | 'score' | 'boolean'
  sortOrder: number
  status: number
}

// 巡查项目查询参数
export interface InspectionItemConfigQueryParams {
  parentCategoryId?: string
  status?: string
}

// 巡查项目相关响应
export interface InspectionItemConfigListResponse extends ApiResponse<InspectionItemConfig[]> {}
export interface InspectionItemConfigByCategoryResponse extends ApiResponse<InspectionItemConfig[]> {}
export interface InspectionItemConfigUpdateResponse extends ApiResponse<boolean> {}

// ==================== 教室管理类型 ====================

// 教室类型
export interface Classroom {
  id: string
  roomNumber: string
  type: 'theory' | 'training'
  floor: number
  location: 'east' | 'west'
  capacity: number
  status: number // 0: 禁用, 1: 启用
  createdBy: string
  createdTime: string
  updatedBy: string
  updatedTime: string
}

// 教室创建参数
export interface ClassroomCreateParams {
  roomNumber: string
  type: 'theory' | 'training'
  floor: number
  location: 'east' | 'west'
  capacity: number
  status: number
}

// 教室更新参数
export interface ClassroomUpdateParams extends ClassroomCreateParams {}

// 教室查询参数
export interface ClassroomQueryParams extends BaseQueryParams {
  roomNumber?: string
  type?: 'theory' | 'training'
  floor?: number
  location?: 'east' | 'west'
  status?: number
}

// 教室相关响应
export interface ClassroomResponse extends ApiResponse<Classroom> {}
export interface ClassroomListResponse extends ApiResponse<PageResponse<Classroom>> {}
export interface ClassroomCreateResponse extends ApiResponse<boolean> {}
export interface ClassroomUpdateResponse extends ApiResponse<boolean> {}
export interface ClassroomDeleteResponse extends ApiResponse<boolean> {}

// ==================== 课程管理类型 ====================

// 课程类型
export interface Course {
  id: string
  courseName: string
  courseType: 'theory' | 'training'
  department: string
  teacher: string
  status: number // 0: 禁用, 1: 启用
  createdBy?: string
  createdTime: string
  updatedBy?: string
  updatedTime?: string
}

// 课程创建参数
export interface CourseCreateParams {
  courseName: string
  courseType?: 'theory' | 'training'
  department?: string
  teacher?: string
  status?: number
}

// 课程更新参数
export interface CourseUpdateParams extends CourseCreateParams {}

// 课程查询参数
export interface CourseQueryParams extends BaseQueryParams {
  courseName?: string
  courseType?: 'theory' | 'training'
  department?: string
  teacher?: string
  status?: number
}

// 课程相关响应
export interface CourseResponse extends ApiResponse<Course> {}
export interface CourseListResponse extends ApiResponse<PageResponse<Course>> {}
export interface CourseCreateResponse extends ApiResponse<boolean> {}
export interface CourseUpdateResponse extends ApiResponse<boolean> {}
export interface CourseDeleteResponse extends ApiResponse<boolean> {}

// ==================== 教室巡查记录类型 ====================

// 教室巡查记录类型
export interface ClassroomInspectionRecord {
  id: string
  supervisionScheduleId: string
  supervisionDate: string
  period: string
  classroomId: string
  classroomNumber: string
  floor: number
  location: string
  inspectionScores: InspectionScoreItem[]
  totalScore: number
  status: string
  statusName: string
  supervisor: string
  supervisorName: string
  submittedAt?: string
  approvedAt?: string
  approvalNote?: string
  notes?: string
  createdTime: string
  updatedTime: string
}

// 巡查评分项类型
export interface InspectionScoreItem {
  itemId: string
  itemName: string
  itemCategory?: string
  parentCategoryId?: string
  level?: number
  itemType: 'category' | 'score' | 'boolean'
  maxScore: number
  actualScore: number
  remark?: string
  sortOrder?: number
  categorySortOrder?: number
}


// 教室巡查记录创建/更新参数
export interface ClassroomInspectionRecordParams {
  supervisionScheduleId: string
  classroomId: string
  inspectionScores: InspectionScoreItem[]
  notes?: string
}

// 教室巡查记录查询参数
export interface ClassroomInspectionRecordQueryParams {
  supervisionScheduleId?: string
  classroomId?: string
  status?: string
  page?: number
  size?: number
}

// 教室信息类型
export interface ClassroomInfo {
  id: string
  roomNumber: string
  floor: number
  location: string
  capacity: number
}

// 巡查项目配置类型（用于巡查记录）
export interface InspectionItemForRecord {
  id: string
  itemName: string
  itemCategory: string
  maxScore: number
  subItems: InspectionSubItemForRecord[]
}

// 巡查项目子项类型（用于巡查记录）
export interface InspectionSubItemForRecord {
  name: string
  maxScore: number
  type: 'boolean' | 'score'
  description?: string
}

// 教室巡查记录相关响应
export interface ClassroomInspectionRecordResponse extends ApiResponse<ClassroomInspectionRecord> {}
export interface ClassroomInspectionRecordListResponse extends ApiResponse<PageResponse<ClassroomInspectionRecord>> {}
export interface ClassroomInspectionRecordCreateResponse extends ApiResponse<string> {}
export interface ClassroomInspectionRecordUpdateResponse extends ApiResponse<boolean> {}
export interface ClassroomInspectionRecordDeleteResponse extends ApiResponse<boolean> {}
export interface ClassroomInspectionRecordSubmitResponse extends ApiResponse<boolean> {}
export interface AvailableClassroomsResponse extends ApiResponse<ClassroomInfo[]> {}
export interface InspectionItemsResponse extends ApiResponse<InspectionItemForRecord[]> {}

// ==================== 报表管理类型 ====================

// 报表生成请求参数
export interface ReportGenerateRequest {
  templateId: string
  reportName: string
  reportType: string
  startDate: string
  endDate: string
  bulletinNumber?: string
  bulletinPeriod?: string
  bulletinDate?: string
  otherParams?: string
  // 新增：基于安排生成报表
  scheduleIds?: string[] // 督导安排ID列表
  moduleTypes?: string[] // 模块类型列表（daily_teaching, administrative, classroom_inspection）
}

// 报表记录VO
export interface ReportRecordVO {
  id: string
  reportName: string
  reportType: string
  templateId: string
  status: string
  filePath?: string
  fileSize?: number
  fileSizeFormatted?: string
  fileFormat?: string
  generateStartTime?: string
  generateEndTime?: string
  generateDuration?: number
  errorMessage?: string
  createdBy?: string
  createdTime: string
}

// 报表记录列表查询参数
export interface ReportRecordQueryParams extends Record<string, unknown> {
  page?: number
  size?: number
  reportType?: string
  status?: string
}

// 报表管理相关响应
export interface ReportGenerateResponse extends ApiResponse<string> {}
export interface ReportRecordListResponse extends ApiResponse<ReportRecordVO[]> {
  total?: number // 总数，用于分页
}
export interface ReportRecordDeleteResponse extends ApiResponse<boolean> {}
export interface ReportPreviewResponse extends ApiResponse<any> {}

// ==================== 模块二：行政坐班及教研室活动日督导类型 ====================

// 教研室活动日安排
export interface ResearchActivity {
  id: string
  officeId: string
  officeName?: string
  activityDate: string
  activityTheme: string
  activityContent?: string
  expectedParticipants?: string[]
  actualParticipants?: string[]
  status: 'planned' | 'completed' | 'cancelled'
  statusName?: string
  notes?: string
  createdBy?: string
  createdTime: string
}

// 教研室活动请求参数
export interface ResearchActivityRequest extends Record<string, unknown> {
  officeId: string
  activityDate: string
  activityTheme: string
  activityContent?: string
  expectedParticipants?: string[]
  notes?: string
}

// 教研室活动响应
export interface ResearchActivityResponse extends ApiResponse<ResearchActivity> {}
export interface ResearchActivityListResponse extends ApiResponse<PageResponse<ResearchActivity>> {}
export interface ResearchActivityCreateResponse extends ApiResponse<{ id: string; status: string }> {}
export interface ResearchActivityUpdateResponse extends BooleanResponse {}
export interface ResearchActivityDeleteResponse extends BooleanResponse {}

// 教职工异动记录
export interface StaffMovement {
  id: string
  staffId: string
  staffName?: string
  movementType: 'business_trip' | 'leave' | 'rotation'
  movementTypeName?: string
  startDate: string
  endDate: string
  reason: string
  approvalStatus: 'pending' | 'approved' | 'rejected'
  approvalStatusName?: string
  approvedBy?: string
  approverName?: string
  approvedAt?: string
  approvalNote?: string
  createdBy?: string
  createdTime: string
}

// 教职工异动请求参数
export interface StaffMovementRequest extends Record<string, unknown> {
  staffId: string
  movementType: 'business_trip' | 'leave' | 'rotation'
  startDate: string
  endDate: string
  reason: string
}

// 教职工异动审批请求参数
export interface StaffMovementApprovalRequest extends Record<string, unknown> {
  action: 'approved' | 'rejected'
  approvalNote?: string
}

// 教职工异动响应
export interface StaffMovementResponse extends ApiResponse<StaffMovement> {}
export interface StaffMovementListResponse extends ApiResponse<PageResponse<StaffMovement>> {}
export interface StaffMovementCreateResponse extends ApiResponse<{ id: string; approvalStatus: string }> {}
export interface StaffMovementUpdateResponse extends BooleanResponse {}
export interface StaffMovementDeleteResponse extends BooleanResponse {}
export interface StaffMovementApproveResponse extends BooleanResponse {}

// 在岗状态记录
export interface StaffAttendance {
  id: string
  supervisionScheduleId: string
  supervisionDate?: string
  period?: string
  staffId: string
  staffName?: string
  officeId: string
  officeName?: string
  attendanceStatus: 'present' | 'absent' | 'temporary_absent' | 'leave'
  attendanceStatusName?: string
  checkTime: string
  temporaryAbsentStart?: string
  temporaryAbsentEnd?: string
  temporaryAbsentDuration?: string
  notes?: string
  createdTime: string
}

// 在岗状态请求参数
export interface StaffAttendanceRequest extends Record<string, unknown> {
  supervisionScheduleId: string
  staffId: string
  officeId: string
  attendanceStatus: 'present' | 'absent' | 'temporary_absent' | 'leave'
  checkTime: string
  temporaryAbsentStart?: string
  temporaryAbsentEnd?: string
  notes?: string
}

// 在岗状态响应
export interface StaffAttendanceResponse extends ApiResponse<StaffAttendance> {}
export interface StaffAttendanceListResponse extends ApiResponse<PageResponse<StaffAttendance>> {}
export interface StaffAttendanceCreateResponse extends ApiResponse<{ id: string; attendanceStatus: string }> {}
export interface StaffAttendanceUpdateResponse extends BooleanResponse {}
export interface StaffAttendanceDeleteResponse extends BooleanResponse {}

// 考勤状态选项
export interface AttendanceStatusOption {
  code: string
  name: string
}

// 考勤状态列表响应
export interface AttendanceStatusListResponse extends ApiResponse<AttendanceStatusOption[]> {} 