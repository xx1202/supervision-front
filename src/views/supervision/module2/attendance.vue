<template>
  <div class="administrative-attendance">
    <div class="page-content">
      <div class="attendance-container">
        <!-- 按督导安排查看模式 -->
        <div v-if="viewMode === 'bySchedule'" style="flex: 1; display: flex; flex-direction: column; min-height: 0;">
          <!-- 督导安排选择视图 -->
          <div v-if="!selectedScheduleId" style="flex: 1; display: flex; flex-direction: column; min-height: 0;">
            <!-- 搜索和过滤区域 -->
            <div class="search-section">
              <el-form :model="scheduleSearchForm" inline style="display: flex; align-items: center; justify-content: space-between;">
                <el-form-item>
                  <el-radio-group v-model="viewMode" @change="handleViewModeChange" size="default">
                    <el-radio-button value="bySchedule">按督导安排查看</el-radio-button>
                    <el-radio-button value="allRecords">全部记录查看</el-radio-button>
                  </el-radio-group>
                </el-form-item>
                <el-form-item label="日期范围">
                  <el-date-picker
                    v-model="scheduleSearchForm.dateRange"
                    type="daterange"
                    range-separator="至"
                    start-placeholder="开始日期"
                    end-placeholder="结束日期"
                    format="YYYY-MM-DD"
                    value-format="YYYY-MM-DD"
                    @change="handleScheduleSearch"
                  />
                </el-form-item>
                <el-form-item label="状态">
                  <el-select v-model="scheduleSearchForm.status" placeholder="选择状态" @change="handleScheduleSearch" clearable>
                    <el-option label="全部" value="" />
                    <el-option label="待开始" value="pending" />
                    <el-option label="进行中" value="in_progress" />
                    <el-option label="已完成" value="completed" />
                  </el-select>
                </el-form-item>
              </el-form>
            </div>
            
            <div class="schedule-table">
              <el-table 
                :data="filteredScheduleList" 
                style="width: 100%" 
                height="100%"
                v-loading="scheduleLoading"
                highlight-current-row
                @row-click="handleScheduleRowClick"
                :row-class-name="getScheduleRowClassName"
                fit
                table-layout="fixed"
                border
              >
                <el-table-column type="index" label="序号" width="60" align="center" />
                <el-table-column prop="supervisionDate" label="督导日期" width="120" align="center">
                  <template #default="scope">
                    {{ formatDate(scope.row.supervisionDate) }}
                  </template>
                </el-table-column>
                <el-table-column prop="period" label="节次" width="100" align="center">
                  <template #default="scope">
                    第{{ scope.row.period }}节
                  </template>
                </el-table-column>
                <el-table-column prop="leaderName" label="负责人" width="120" align="center" />
                <el-table-column prop="memberCount" label="成员数" width="100" align="center">
                  <template #default="scope">
                    {{ scope.row.memberCount || 0 }}人
                  </template>
                </el-table-column>
                <el-table-column prop="status" label="状态" width="120" align="center">
                  <template #default="scope">
                    <el-tag :type="getScheduleStatusType(scope.row.status)" size="small">
                      {{ getScheduleStatusName(scope.row.status) }}
                    </el-tag>
                  </template>
                </el-table-column>
                <el-table-column prop="notes" label="备注" min-width="150" show-overflow-tooltip />
                <el-table-column label="操作" width="120" align="center" fixed="right">
                  <template #default="scope">
                    <el-button 
                      type="primary" 
                      link 
                      size="small"
                      @click.stop="selectSchedule(scope.row.id)"
                    >
                      {{ selectedScheduleId === scope.row.id ? '已选择' : '选择' }}
                    </el-button>
                  </template>
                </el-table-column>
              </el-table>

              <!-- 督导安排分页 -->
              <div class="pagination-wrapper">
                <el-pagination
                  v-model:current-page="schedulePagination.current"
                  v-model:page-size="schedulePagination.size"
                  :page-sizes="PAGINATION.PAGE_SIZES"
                  :total="schedulePagination.total"
                  layout="total, sizes, prev, pager, next, jumper"
                  @size-change="handleScheduleSizeChange"
                  @current-change="handleScheduleCurrentChange"
                />
              </div>
            </div>
          </div>

          <!-- 考勤记录视图（选择督导安排后显示） -->
          <div v-else style="flex: 1; display: flex; flex-direction: column; min-height: 0;">
            <!-- 搜索和过滤区域 -->
            <div class="search-section">
              <el-form :model="searchForm" inline style="display: flex; align-items: center; justify-content: space-between;">
                <el-form-item>
                  <el-button 
                    text 
                    type="primary" 
                    size="small"
                    @click="clearScheduleSelection"
                  >
                    <el-icon><ArrowLeft /></el-icon>
                    返回选择督导安排
                  </el-button>
                  <span class="schedule-title" v-if="selectedSchedule" style="margin-left: 16px;">
                    督导安排：{{ formatDate(selectedSchedule.supervisionDate) }} 第{{ selectedSchedule.period }}节
                  </span>
                </el-form-item>
                <el-form-item label="考勤状态">
                  <el-select v-model="searchForm.attendanceStatus" placeholder="选择状态" @change="handleSearch" clearable>
                    <el-option label="全部" value="" />
                    <el-option 
                      v-for="option in statusOptions" 
                      :key="option.value" 
                      :label="option.label" 
                      :value="option.value" 
                    />
                  </el-select>
                </el-form-item>
                <el-form-item>
                  <el-button type="primary" @click="handleSearch">搜索</el-button>
                  <el-button @click="resetSearch">重置</el-button>
                </el-form-item>
                <el-form-item style="margin-left: auto;">
                  <el-button type="primary" @click="showCreateDialog">
                    <el-icon><Plus /></el-icon>
                    新增考勤记录
                  </el-button>
                </el-form-item>
              </el-form>
            </div>
            
            <div class="attendance-table">
              <el-table 
                :data="attendanceList" 
                style="width: 100%" 
                height="100%"
                v-loading="loading"
                fit
                table-layout="fixed"
                border 
              >
            <el-table-column prop="supervisionDate" label="督导日期" width="120">
              <template #default="scope">
                {{ formatDate(scope.row.supervisionDate) }}
              </template>
            </el-table-column>
            <el-table-column prop="period" label="节次" width="80">
              <template #default="scope">
                第{{ scope.row.period }}节
              </template>
            </el-table-column>
            <el-table-column prop="officeName" label="办公室" width="120" />
            <el-table-column prop="staffName" label="教职工" width="120" />
            <el-table-column prop="attendanceStatus" label="考勤状态" width="120">
              <template #default="scope">
                <el-tag :type="getStatusType(scope.row.attendanceStatus)">
                  {{ getStatusName(scope.row.attendanceStatus) }}
                </el-tag>
              </template>
            </el-table-column>
            <el-table-column prop="checkTime" label="检查时间" width="160">
              <template #default="scope">
                {{ formatDateTime(scope.row.checkTime) }}
              </template>
            </el-table-column>
            <el-table-column prop="temporaryAbsentDuration" label="暂不在岗时长" width="140">
              <template #default="scope">
                <span v-if="scope.row.attendanceStatus === ATTENDANCE_STATUS.TEMPORARY_ABSENT">
                  {{ calculateAbsentDuration(scope.row.temporaryAbsentStart, scope.row.temporaryAbsentEnd) }}
                </span>
                <span v-else>-</span>
              </template>
            </el-table-column>
            <el-table-column prop="notes" label="备注" min-width="150" show-overflow-tooltip />
            <el-table-column label="操作" min-width="250" fixed="right">
              <template #default="scope">
                <el-button size="small" @click="viewAttendance(scope.row)">查看</el-button>
                <el-button 
                  v-if="scope.row.attendanceStatus === ATTENDANCE_STATUS.ABSENT" 
                  size="small" 
                  type="primary" 
                  @click="sendAttendanceReminder(scope.row)"
                  v-role="[USER_ROLES.ADMIN_OFFICE_DIRECTOR, USER_ROLES.SUPERVISOR]"
                >
                  通知上岗
                </el-button>
                <el-button 
                  v-if="scope.row.attendanceStatus === ATTENDANCE_STATUS.TEMPORARY_ABSENT" 
                  size="small" 
                  type="success" 
                  @click="confirmPresent(scope.row)"
                  v-role="[USER_ROLES.ADMIN_OFFICE_DIRECTOR, USER_ROLES.SUPERVISOR]"
                >
                  确认在岗
                </el-button>
                <el-button 
                  size="small" 
                  type="warning" 
                  @click="editAttendance(scope.row)"
                  v-role="[USER_ROLES.ADMIN_OFFICE_DIRECTOR, USER_ROLES.SUPERVISOR]"
                >
                  编辑
                </el-button>
                <el-button 
                  size="small" 
                  type="danger" 
                  @click="deleteAttendance(scope.row)"
                  v-role="[USER_ROLES.ADMIN_OFFICE_DIRECTOR]"
                >
                  删除
                </el-button>
              </template>
            </el-table-column>
          </el-table>

          <!-- 分页 -->
          <div class="pagination-wrapper">
            <el-pagination
              v-model:current-page="pagination.current"
              v-model:page-size="pagination.size"
              :page-sizes="PAGINATION.PAGE_SIZES"
              :total="pagination.total"
              layout="total, sizes, prev, pager, next, jumper"
              @size-change="handleSizeChange"
              @current-change="handleCurrentChange"
            />
          </div>
        </div>
        </div>
        </div>
        <!-- 全部记录查看模式 -->
        <div v-if="viewMode === 'allRecords'" style="flex: 1; display: flex; flex-direction: column; min-height: 0;">
          <!-- 搜索和过滤区域 -->
          <div class="search-section">
            <el-form :model="searchForm" inline style="display: flex; align-items: center; justify-content: space-between;">
              <el-form-item>
                <el-radio-group v-model="viewMode" @change="handleViewModeChange" size="default">
                  <el-radio-button value="bySchedule">按督导安排查看</el-radio-button>
                  <el-radio-button value="allRecords">全部记录查看</el-radio-button>
                </el-radio-group>
              </el-form-item>
              <el-form-item label="日期范围">
                <el-date-picker
                  v-model="searchForm.dateRange"
                  type="daterange"
                  range-separator="至"
                  start-placeholder="开始日期"
                  end-placeholder="结束日期"
                  format="YYYY-MM-DD"
                  value-format="YYYY-MM-DD"
                  @change="handleSearch"
                />
              </el-form-item>
              <el-form-item label="督导安排">
                <el-select v-model="searchForm.scheduleId" placeholder="选择督导安排" @change="handleSearch" clearable>
                  <el-option label="全部" value="" />
                  <el-option 
                    v-for="schedule in scheduleList" 
                    :key="schedule.id" 
                    :label="`${schedule.supervisionDate} 第${schedule.period}节`" 
                    :value="schedule.id" 
                  />
                </el-select>
              </el-form-item>
              <el-form-item label="考勤状态">
                <el-select v-model="searchForm.attendanceStatus" placeholder="选择状态" @change="handleSearch" clearable>
                  <el-option label="全部" value="" />
                  <el-option 
                    v-for="option in statusOptions" 
                    :key="option.value" 
                    :label="option.label" 
                    :value="option.value" 
                  />
                </el-select>
              </el-form-item>
              <el-form-item>
                <el-button type="primary" @click="handleSearch">搜索</el-button>
                <el-button @click="resetSearch">重置</el-button>
              </el-form-item>
              <el-form-item style="margin-left: auto;">
                <el-button type="primary" @click="showCreateDialog">
                  <el-icon><Plus /></el-icon>
                  新增考勤记录
                </el-button>
              </el-form-item>
            </el-form>
          </div>
          
          <!-- 考勤记录表格 -->
          <div class="attendance-table">
            <el-table 
              :data="attendanceList" 
              style="width: 100%" 
              height="100%"
              v-loading="loading"
              fit
              table-layout="fixed"
              border 
            >
              <el-table-column prop="supervisionDate" label="督导日期" width="120">
                <template #default="scope">
                  {{ formatDate(scope.row.supervisionDate) }}
                </template>
              </el-table-column>
              <el-table-column prop="period" label="节次" width="80">
                <template #default="scope">
                  第{{ scope.row.period }}节
                </template>
              </el-table-column>
              <el-table-column prop="officeName" label="办公室" width="120" />
              <el-table-column prop="staffName" label="教职工" width="120" />
              <el-table-column prop="attendanceStatus" label="考勤状态" width="120">
                <template #default="scope">
                  <el-tag :type="getStatusType(scope.row.attendanceStatus)">
                    {{ getStatusName(scope.row.attendanceStatus) }}
                  </el-tag>
                </template>
              </el-table-column>
              <el-table-column prop="checkTime" label="检查时间" width="160">
                <template #default="scope">
                  {{ formatDateTime(scope.row.checkTime) }}
                </template>
              </el-table-column>
              <el-table-column prop="temporaryAbsentDuration" label="暂不在岗时长" width="140">
                <template #default="scope">
                  <span v-if="scope.row.attendanceStatus === ATTENDANCE_STATUS.TEMPORARY_ABSENT">
                    {{ calculateAbsentDuration(scope.row.temporaryAbsentStart, scope.row.temporaryAbsentEnd) }}
                  </span>
                  <span v-else>-</span>
                </template>
              </el-table-column>
              <el-table-column prop="notes" label="备注" min-width="150" show-overflow-tooltip />
              <el-table-column label="操作" min-width="250" fixed="right">
                <template #default="scope">
                  <el-button size="small" @click="viewAttendance(scope.row)">查看</el-button>
                  <el-button 
                    v-if="scope.row.attendanceStatus === ATTENDANCE_STATUS.ABSENT" 
                    size="small" 
                    type="primary" 
                    @click="sendAttendanceReminder(scope.row)"
                    v-role="[USER_ROLES.ADMIN_OFFICE_DIRECTOR, USER_ROLES.SUPERVISOR]"
                  >
                    通知上岗
                  </el-button>
                  <el-button 
                    v-if="scope.row.attendanceStatus === ATTENDANCE_STATUS.TEMPORARY_ABSENT" 
                    size="small" 
                    type="success" 
                    @click="confirmPresent(scope.row)"
                    v-role="[USER_ROLES.ADMIN_OFFICE_DIRECTOR, USER_ROLES.SUPERVISOR]"
                  >
                    确认在岗
                  </el-button>
                  <el-button 
                    size="small" 
                    type="warning" 
                    @click="editAttendance(scope.row)"
                    v-role="[USER_ROLES.ADMIN_OFFICE_DIRECTOR, USER_ROLES.SUPERVISOR]"
                  >
                    编辑
                  </el-button>
                  <el-button 
                    size="small" 
                    type="danger" 
                    @click="deleteAttendance(scope.row)"
                    v-role="[USER_ROLES.ADMIN_OFFICE_DIRECTOR]"
                  >
                    删除
                  </el-button>
                </template>
            </el-table-column>
          </el-table>

          <!-- 分页 -->
          <div class="pagination-wrapper">
            <el-pagination
              v-model:current-page="pagination.current"
              v-model:page-size="pagination.size"
              :page-sizes="PAGINATION.PAGE_SIZES"
              :total="pagination.total"
              layout="total, sizes, prev, pager, next, jumper"
              @size-change="handleSizeChange"
              @current-change="handleCurrentChange"
            />
          </div>
        </div>
      </div>
    </div>

    <!-- 考勤记录对话框 -->
    <el-dialog
      :title="isEdit ? '编辑考勤记录' : '新增考勤记录'"
      v-model="dialogVisible"
      width="600px"
      :append-to-body="true"
      :lock-scroll="true"
      :close-on-click-modal="false"
    >
      <el-form :model="attendanceForm" :rules="rules" ref="attendanceFormRef" label-width="120px">
        <el-form-item label="督导安排" prop="supervisionScheduleId">
          <el-select v-model="attendanceForm.supervisionScheduleId" placeholder="选择督导安排" style="width: 100%">
            <el-option 
              v-for="schedule in scheduleList" 
              :key="schedule.id" 
              :label="`${schedule.supervisionDate} 第${schedule.period}节`" 
              :value="schedule.id" 
            />
          </el-select>
        </el-form-item>
        <el-form-item label="办公室" prop="officeId">
          <el-select v-model="attendanceForm.officeId" placeholder="选择办公室" style="width: 100%">
            <el-option 
              v-for="office in officeList" 
              :key="office.id" 
              :label="`${office.officeName} (${office.officeNumber})`" 
              :value="office.id" 
            />
          </el-select>
        </el-form-item>
        <el-form-item label="教职工" prop="staffId">
          <el-select v-model="attendanceForm.staffId" placeholder="选择教职工" style="width: 100%">
            <el-option 
              v-for="staff in staffList" 
              :key="staff.id" 
              :label="staff.realName" 
              :value="staff.id" 
            />
          </el-select>
        </el-form-item>
        <el-form-item label="考勤状态" prop="attendanceStatus">
          <el-select v-model="attendanceForm.attendanceStatus" placeholder="选择考勤状态" style="width: 100%">
            <el-option 
              v-for="option in statusOptions" 
              :key="option.value" 
              :label="option.label" 
              :value="option.value" 
            />
          </el-select>
        </el-form-item>
        <el-form-item label="备注" prop="notes">
          <el-input 
            v-model="attendanceForm.notes" 
            type="textarea" 
            :rows="3" 
            placeholder="请输入备注信息"
          />
        </el-form-item>
      </el-form>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="dialogVisible = false">取消</el-button>
          <el-button type="primary" @click="submitAttendance">确定</el-button>
        </span>
      </template>
    </el-dialog>

    <!-- 考勤记录详情对话框 -->
    <el-dialog
      title="考勤记录详情"
      v-model="detailVisible"
      width="600px"
      :append-to-body="true"
      :lock-scroll="true"
      :close-on-click-modal="false"
    >
      <div v-if="currentAttendance" class="attendance-detail">
        <el-descriptions :column="2" border>
          <el-descriptions-item label="督导日期">
            {{ formatDate(currentAttendance.supervisionDate) }}
          </el-descriptions-item>
          <el-descriptions-item label="节次">
            第{{ currentAttendance.period }}节
          </el-descriptions-item>
          <el-descriptions-item label="办公室">
            {{ currentAttendance.officeName }}
          </el-descriptions-item>
          <el-descriptions-item label="教职工">
            {{ currentAttendance.staffName }}
          </el-descriptions-item>
          <el-descriptions-item label="考勤状态">
            <el-tag :type="getStatusType(currentAttendance.attendanceStatus)">
              {{ getStatusName(currentAttendance.attendanceStatus) }}
            </el-tag>
          </el-descriptions-item>
          <el-descriptions-item label="检查时间">
            {{ formatDateTime(currentAttendance.checkTime) }}
          </el-descriptions-item>
          <el-descriptions-item label="备注" :span="2">
            {{ currentAttendance.notes || '无' }}
          </el-descriptions-item>
        </el-descriptions>
      </div>
    </el-dialog>
  </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted, onUnmounted, computed, watch, nextTick } from 'vue'
import { Plus, Document, ArrowLeft } from '@element-plus/icons-vue'
import { ElMessageBox } from 'element-plus'
import { staffAttendanceAPI, administrativeScheduleAPI, userAPI, officeAPI, smsAPI } from '@/api'
import { 
  ATTENDANCE_STATUS
} from '@/constants'
import { PAGINATION } from '@/constants/common'
import { USER_ROLES } from '@/utils/permission'
import { config } from '@/config/env'
import { logger } from '@/utils/logger'
import { useAttendanceStatus } from '@/hooks/useAttendanceStatus'
import { handleApiError, showSuccessMessage, showErrorMessage } from '@/utils/error-handler'

// 考勤状态管理
const {
  statusOptions,
  getStatusName,
  getStatusType,
  loadStatusList
} = useAttendanceStatus()

// 视图模式：'bySchedule' - 按督导安排查看, 'allRecords' - 全部记录查看
const viewMode = ref<'bySchedule' | 'allRecords'>('bySchedule')

// 选中的督导安排ID
const selectedScheduleId = ref<string>('')
const selectedSchedule = computed(() => {
  return scheduleList.value.find(s => s.id === selectedScheduleId.value)
})

// 督导安排搜索表单
const scheduleSearchForm = reactive({
  dateRange: [] as string[],
  status: ''
})

// 过滤后的督导安排列表（用于显示，后端已分页，这里只做前端过滤）
const filteredScheduleList = computed(() => {
  return scheduleList.value
})

// 搜索表单
const searchForm = reactive({
  dateRange: [] as string[],
  scheduleId: '',
  attendanceStatus: ''
})

// 考勤记录分页信息
const pagination = reactive({
  current: 1,
  size: 10,
  total: 0,
  pages: 0
})

// 督导安排分页信息
const schedulePagination = reactive({
  current: 1,
  size: 10,
  total: 0,
  pages: 0
})

// 考勤记录数据
const attendanceList = ref<any[]>([])
const scheduleList = ref<any[]>([])
const officeList = ref<any[]>([])
const staffList = ref<any[]>([])
const loading = ref(false)
const scheduleLoading = ref(false)

// 定时器管理：暂不在岗30分钟自动设为缺岗
const temporaryAbsentTimers = new Map<string, ReturnType<typeof setTimeout>>()

// 对话框状态
const dialogVisible = ref(false)
const detailVisible = ref(false)
const isEdit = ref(false)
const currentAttendance = ref<any>(null)
const attendanceFormRef = ref()

// 考勤表单
const attendanceForm = reactive({
  supervisionScheduleId: '',
  officeId: '',
  staffId: '',
  attendanceStatus: '',
  checkTime: '',
  notes: ''
})

// 表单验证规则
const rules = {
  supervisionScheduleId: [{ required: true, message: '请选择督导安排', trigger: 'change' }],
  officeId: [{ required: true, message: '请选择办公室', trigger: 'change' }],
  staffId: [{ required: true, message: '请选择教职工', trigger: 'change' }],
  attendanceStatus: [{ required: true, message: '请选择考勤状态', trigger: 'change' }]
}

// 状态类型和名称获取函数已从useAttendanceStatus hook中获取

// 格式化日期
const formatDate = (date: string) => {
  if (!date) return ''
  return new Date(date).toLocaleDateString('zh-CN')
}

// 格式化日期时间
const formatDateTime = (datetime: string) => {
  if (!datetime) return ''
  return new Date(datetime).toLocaleString('zh-CN')
}

// 计算暂不在岗时长
const calculateAbsentDuration = (startTime?: string, endTime?: string) => {
  if (!startTime) return '计时中...'
  if (!endTime) return '计时中...'
  const start = new Date(startTime)
  const end = new Date(endTime)
  const diffTime = Math.abs(end.getTime() - start.getTime())
  const diffMinutes = Math.ceil(diffTime / (1000 * 60))
  if (diffMinutes < 60) {
    return `${diffMinutes}分钟`
  } else {
    const hours = Math.floor(diffMinutes / 60)
    const minutes = diffMinutes % 60
    return minutes > 0 ? `${hours}小时${minutes}分钟` : `${hours}小时`
  }
}

// 加载考勤记录列表
const loadAttendanceList = async () => {
  loading.value = true
  try {
    const params: any = {
      page: pagination.current,
      size: pagination.size
    }
    
    // 按督导安排查看模式：必须选择督导安排
    if (viewMode.value === 'bySchedule') {
      if (!selectedScheduleId.value) {
        attendanceList.value = []
        pagination.total = 0
        pagination.pages = 0
        loading.value = false
        return
      }
      params.supervisionScheduleId = selectedScheduleId.value
    } else {
      // 全部记录查看模式：可选督导安排筛选
      if (searchForm.scheduleId) {
        params.supervisionScheduleId = searchForm.scheduleId
      }
      // 处理日期范围
      if (searchForm.dateRange && searchForm.dateRange.length === 2) {
        params.startDate = searchForm.dateRange[0]
        params.endDate = searchForm.dateRange[1]
      }
    }
    
    if (searchForm.attendanceStatus) {
      params.attendanceStatus = searchForm.attendanceStatus
    }
    
    const response = await staffAttendanceAPI.getAttendanceList(params)
    if (response.code === 200 && response.data) {
      attendanceList.value = response.data.records || []
      pagination.total = response.data.total || 0
      pagination.pages = response.data.pages || 0
      
      // 调试信息
      logger.debug('考勤记录数据加载成功:', {
        records: attendanceList.value.length,
        total: pagination.total,
        viewMode: viewMode.value
      })
      
      // 为暂不在岗的记录启动定时器
      setupTemporaryAbsentTimers()
    } else {
      // 如果响应不成功，清空列表
      attendanceList.value = []
      pagination.total = 0
      pagination.pages = 0
    }
  } catch (error: any) {
    handleApiError(error, '加载考勤记录列表失败')
  } finally {
    loading.value = false
  }
}

// 设置暂不在岗定时器
const setupTemporaryAbsentTimers = () => {
  // 清除所有现有定时器
  clearAllTimers()
  
  // 为每个暂不在岗的记录设置定时器
  attendanceList.value.forEach(record => {
    if (record.attendanceStatus === ATTENDANCE_STATUS.TEMPORARY_ABSENT && record.id) {
      setTemporaryAbsentTimer(record.id, record.temporaryAbsentStart || record.checkTime)
    }
  })
}

// 设置单个暂不在岗定时器
const setTemporaryAbsentTimer = (attendanceId: string, startTime?: string) => {
  // 如果已有定时器，先清除
  clearTimer(attendanceId)
  
  if (!startTime) {
    return
  }
  
  const start = new Date(startTime).getTime()
  const now = Date.now()
  const elapsed = now - start
  const autoAbsentMinutes = config.business.attendanceAutoAbsentMinutes
  const remainingTime = (autoAbsentMinutes * 60 * 1000) - elapsed
  
  // 如果已经超过30分钟，立即设为缺岗
  if (remainingTime <= 0) {
    autoSetAbsent(attendanceId)
    return
  }
  
  // 设置定时器
  const timer = setTimeout(async () => {
    await autoSetAbsent(attendanceId)
    temporaryAbsentTimers.delete(attendanceId)
  }, remainingTime)
  
  temporaryAbsentTimers.set(attendanceId, timer)
}

// 自动设为缺岗
const autoSetAbsent = async (attendanceId: string) => {
  try {
    const record = attendanceList.value.find(r => r.id === attendanceId)
    if (!record || record.attendanceStatus !== ATTENDANCE_STATUS.TEMPORARY_ABSENT) {
      return
    }
    
    const formData: any = {
      supervisionScheduleId: record.supervisionScheduleId,
      staffId: record.staffId,
      officeId: record.officeId,
      attendanceStatus: ATTENDANCE_STATUS.ABSENT,
      checkTime: record.checkTime,
      notes: record.notes || ''
    }
    
    const response: any = await staffAttendanceAPI.updateAttendance(attendanceId, formData)
    ElMessageBox.warning(`教职工 ${record.staffName} 暂不在岗超过${config.business.attendanceAutoAbsentMinutes}分钟，已自动设为缺岗`, '自动缺岗提醒')
    
    // 重新加载列表
    await loadAttendanceList()
  } catch (error: any) {
    console.error('自动设为缺岗失败:', error)
  }
}

// 清除单个定时器
const clearTimer = (attendanceId: string) => {
  const timer = temporaryAbsentTimers.get(attendanceId)
  if (timer) {
    clearTimeout(timer)
    temporaryAbsentTimers.delete(attendanceId)
  }
}

// 清除所有定时器
const clearAllTimers = () => {
  temporaryAbsentTimers.forEach(timer => clearTimeout(timer))
  temporaryAbsentTimers.clear()
}

// 加载督导安排列表
const loadScheduleList = async () => {
  scheduleLoading.value = true
  try {
    const params: any = { 
      page: schedulePagination.current, 
      size: schedulePagination.size 
    }
    
    // 如果有日期范围筛选
    if (scheduleSearchForm.dateRange && scheduleSearchForm.dateRange.length === 2) {
      params.startDate = scheduleSearchForm.dateRange[0]
      params.endDate = scheduleSearchForm.dateRange[1]
    }
    
    // 如果有状态筛选
    if (scheduleSearchForm.status) {
      params.status = scheduleSearchForm.status
    }
    
    const response: any = await administrativeScheduleAPI.getAdministrativeScheduleList(params)
    if (response.code === 200 && response.data) {
      scheduleList.value = response.data.records || []
      schedulePagination.total = response.data.total || 0
      schedulePagination.pages = response.data.pages || 0
    }
  } catch (error: any) {
    handleApiError(error, '加载督导安排列表失败')
  } finally {
    scheduleLoading.value = false
  }
}

// 督导安排搜索处理
const handleScheduleSearch = () => {
  schedulePagination.current = 1
  loadScheduleList()
}

// 督导安排分页处理
const handleScheduleSizeChange = (size: number) => {
  schedulePagination.size = size
  schedulePagination.current = 1
  loadScheduleList()
}

const handleScheduleCurrentChange = (current: number) => {
  schedulePagination.current = current
  loadScheduleList()
}

// 获取督导安排状态名称
const getScheduleStatusName = (status: string) => {
  const statusMap: Record<string, string> = {
    'pending': '待开始',
    'in_progress': '进行中',
    'completed': '已完成',
    'cancelled': '已取消'
  }
  return statusMap[status] || '未知'
}

// 获取督导安排状态类型（用于标签颜色）
const getScheduleStatusType = (status: string) => {
  const typeMap: Record<string, string> = {
    'pending': 'info',
    'in_progress': 'primary',
    'completed': 'success',
    'cancelled': 'danger'
  }
  return typeMap[status] || 'info'
}

// 获取表格行类名（用于高亮选中的行）
const getScheduleRowClassName = ({ row }: { row: any }) => {
  if (row.id === selectedScheduleId.value) {
    return 'selected-row'
  }
  return ''
}

// 处理表格行点击
const handleScheduleRowClick = (row: any) => {
  selectSchedule(row.id)
}

// 选择督导安排
const selectSchedule = (scheduleId: string) => {
  selectedScheduleId.value = scheduleId
  // 选择后自动加载考勤记录（watch 会自动触发）
  // 页面会自动切换到考勤记录视图
}

// 监听督导安排选择变化
watch(selectedScheduleId, (newScheduleId) => {
  if (newScheduleId && viewMode.value === 'bySchedule') {
    pagination.current = 1
    loadAttendanceList()
  }
})

// 清除督导安排选择
const clearScheduleSelection = () => {
  selectedScheduleId.value = ''
  attendanceList.value = []
  pagination.total = 0
}

// 处理视图模式切换
const handleViewModeChange = () => {
  // 切换模式时重置搜索条件
  if (viewMode.value === 'bySchedule') {
    // 切换到按督导安排查看模式：清空考勤记录，等待选择督导安排
    searchForm.scheduleId = ''
    searchForm.dateRange = []
    selectedScheduleId.value = ''
    attendanceList.value = []
    pagination.total = 0
    pagination.pages = 0
    pagination.current = 1
    // 重置督导安排分页
    schedulePagination.current = 1
    loadScheduleList()
  } else {
    // 切换到全部记录查看模式：加载督导安排列表（用于筛选）和考勤记录
    selectedScheduleId.value = ''
    pagination.current = 1
    // 加载督导安排列表（用于全部记录模式下的筛选下拉框）
    loadScheduleList()
    // 加载考勤记录
    loadAttendanceList()
  }
}

// 监听视图模式变化
watch(viewMode, () => {
  handleViewModeChange()
}, { immediate: false })

// 加载办公室列表
const loadOfficeList = async () => {
  try {
    const response: any = await officeAPI.getOfficeList({ page: 1, size: 1000 })
    if (response.code === 200 && response.data) {
      officeList.value = response.data.records || []
    }
  } catch (error: any) {
    handleApiError(error, '加载办公室列表失败')
  }
}

// 加载教职工列表
const loadStaffList = async () => {
  try {
    const response: any = await userAPI.getActiveUsers()
    if (response.code === 200 && response.data) {
      staffList.value = response.data || []
    }
  } catch (error: any) {
    handleApiError(error, '加载教职工列表失败')
  }
}

// 搜索处理
const handleSearch = () => {
  pagination.current = 1
  loadAttendanceList()
}

// 重置搜索
const resetSearch = () => {
  if (viewMode.value === 'bySchedule') {
    // 按督导安排查看模式：只重置考勤状态
    searchForm.attendanceStatus = ''
  } else {
    // 全部记录查看模式：重置所有条件
    searchForm.dateRange = []
    searchForm.scheduleId = ''
    searchForm.attendanceStatus = ''
  }
  handleSearch()
}

// 分页处理
const handleSizeChange = (size: number) => {
  pagination.size = size
  pagination.current = 1
  loadAttendanceList()
}

const handleCurrentChange = (current: number) => {
  pagination.current = current
  loadAttendanceList()
}

// 显示创建对话框
const showCreateDialog = () => {
  isEdit.value = false
  Object.assign(attendanceForm, {
    supervisionScheduleId: '',
    officeId: '',
    staffId: '',
    attendanceStatus: '',
    notes: ''
  })
  dialogVisible.value = true
}

// 编辑考勤记录
const editAttendance = (row: any) => {
  isEdit.value = true
  currentAttendance.value = row
  Object.assign(attendanceForm, {
    supervisionScheduleId: row.supervisionScheduleId || row.id,
    officeId: row.officeId,
    staffId: row.staffId,
    attendanceStatus: row.attendanceStatus,
    notes: row.notes
  })
  dialogVisible.value = true
}

// 查看考勤记录详情
const viewAttendance = (row: any) => {
  currentAttendance.value = row
  detailVisible.value = true
}

// 确认在岗
const confirmPresent = async (row: any) => {
  try {
    await ElMessageBox.confirm(
      `确认教职工 ${row.staffName} 现在在岗吗？`,
      '确认在岗',
      {
        confirmButtonText: '确认',
        cancelButtonText: '取消',
        type: 'warning'
      }
    )

    const formData: any = {
      supervisionScheduleId: row.supervisionScheduleId,
      staffId: row.staffId,
      officeId: row.officeId,
      attendanceStatus: ATTENDANCE_STATUS.PRESENT,
      checkTime: new Date().toISOString(),
      temporaryAbsentEnd: new Date().toISOString()
    }
    
    const response: any = await staffAttendanceAPI.updateAttendance(row.id, formData)
    showSuccessMessage(response, '已确认在岗')
    loadAttendanceList()
  } catch (error: any) {
    if (error !== 'cancel') {
      handleApiError(error, '确认在岗失败')
    }
  }
}

// 发送提醒上岗短信
const sendAttendanceReminder = async (row: any) => {
  try {
    await ElMessageBox.confirm(
      `确定要向教职工 ${row.staffName} 发送提醒上岗短信吗？`,
      '发送提醒短信',
      {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'info'
      }
    )

    // 使用考勤记录ID发送短信
    const response = await smsAPI.sendAttendanceReminder({ attendanceId: row.id })
    if (response.code === 200) {
      showSuccessMessage(response, '短信发送成功')
    } else {
      showErrorMessage(response, '短信发送失败')
    }
  } catch (error: any) {
    if (error !== 'cancel') {
      handleApiError(error, '短信发送失败')
    }
  }
}

// 删除考勤记录
const deleteAttendance = async (row: any) => {
  try {
    await ElMessageBox.confirm(
      `确定要删除考勤记录吗？\n教职工：${row.staffName}\n日期：${formatDate(row.supervisionDate)}`,
      '确认删除',
      {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }
    )

    const response: any = await staffAttendanceAPI.deleteAttendance(row.id)
    showSuccessMessage(response, '删除成功')
    loadAttendanceList()
  } catch (error: any) {
    if (error !== 'cancel') {
      handleApiError(error, '删除失败')
    }
  }
}

// 提交考勤记录
const submitAttendance = async () => {
  try {
    await attendanceFormRef.value.validate()
    
    const formData: any = {
      supervisionScheduleId: attendanceForm.supervisionScheduleId,
      staffId: attendanceForm.staffId,
      officeId: attendanceForm.officeId,
      attendanceStatus: attendanceForm.attendanceStatus,
      checkTime: attendanceForm.checkTime || new Date().toISOString(),
      notes: attendanceForm.notes
    }
    
    // 如果是编辑且状态改为暂不在岗，记录开始时间
    if (isEdit.value && currentAttendance.value) {
      const oldRecord = currentAttendance.value
      
      // 如果状态从其他改为暂不在岗，记录开始时间
      if (formData.attendanceStatus === ATTENDANCE_STATUS.TEMPORARY_ABSENT && 
          oldRecord.attendanceStatus !== ATTENDANCE_STATUS.TEMPORARY_ABSENT) {
        formData.temporaryAbsentStart = new Date().toISOString()
      }
      
      // 如果状态从暂不在岗改为其他，清除定时器
      if (oldRecord.attendanceStatus === ATTENDANCE_STATUS.TEMPORARY_ABSENT && 
          formData.attendanceStatus !== ATTENDANCE_STATUS.TEMPORARY_ABSENT) {
        clearTimer(oldRecord.id)
        formData.temporaryAbsentEnd = new Date().toISOString()
      }
      
      const response: any = await staffAttendanceAPI.updateAttendance(currentAttendance.value.id, formData)
      showSuccessMessage(response, '编辑成功')
    } else {
      // 新建暂不在岗记录，记录开始时间
      if (formData.attendanceStatus === ATTENDANCE_STATUS.TEMPORARY_ABSENT) {
        formData.temporaryAbsentStart = new Date().toISOString()
      }
      
      const response: any = await staffAttendanceAPI.createAttendance(formData)
      showSuccessMessage(response, '新增成功')
    }
    
    dialogVisible.value = false
    await loadAttendanceList()
  } catch (error: any) {
    handleApiError(error, '提交失败，请检查表单')
  }
}

// 组件挂载时加载数据
onMounted(() => {
  // 加载考勤状态列表
  loadStatusList()
  // 加载督导安排列表
  loadScheduleList()
  // 加载办公室和教职工列表（用于新增考勤记录）
  loadOfficeList()
  loadStaffList()
  
  // 只有在全部记录查看模式下才自动加载考勤记录
  // 按督导安排查看模式下，需要先选择督导安排
  if (viewMode.value === 'allRecords') {
    loadAttendanceList()
  } else {
    // 按督导安排查看模式：初始状态清空考勤记录列表
    attendanceList.value = []
    pagination.total = 0
    pagination.pages = 0
  }
})

// 组件卸载时清除所有定时器
onUnmounted(() => {
  clearAllTimers()
})
</script>

<style scoped>
.administrative-attendance {
  padding: 3px 3px 3px 3px;
  display: flex;
  flex-direction: column;
}

.attendance-container {
  background: white;
  border-radius: 7px;
  padding: 24px 24px 8px 24px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  flex: 1;
  display: flex;
  flex-direction: column;
  height: calc(100vh - 150px);
}

.search-section {
  padding-bottom: 8px;
}

.attendance-table {
  margin-top: 3px;
  flex: 1;
  display: flex;
  flex-direction: column;
  min-height: 0;
}


.attendance-table :deep(.el-table__footer-wrapper) {
  margin-bottom: 0;
}

.attendance-table :deep(.el-table__fixed-footer-wrapper) {
  margin-bottom: 0;
}

.pagination-wrapper {
  margin-top: 8px;
  margin-bottom: 0;
  text-align: right;
  flex-shrink: 0;
}

.pagination-wrapper :deep(.el-pagination) {
  margin-bottom: 0;
}

.attendance-detail {
  padding: 20px 0;
}

.dialog-footer {
  text-align: right;
}

/* 督导安排表格 */
.schedule-table {
  margin-top: 3px;
  flex: 1;
  display: flex;
  flex-direction: column;
  min-height: 0;
}

.schedule-table :deep(.el-table__footer-wrapper) {
  margin-bottom: 0;
}

.schedule-table :deep(.el-table__fixed-footer-wrapper) {
  margin-bottom: 0;
}

/* 选中行的样式 */
.schedule-table :deep(.el-table .selected-row) {
  background-color: #ecf5ff;
}

.schedule-table :deep(.el-table .selected-row:hover > td) {
  background-color: #d9ecff !important;
}

.schedule-table :deep(.el-table tbody tr) {
  cursor: pointer;
}

.schedule-table :deep(.el-table tbody tr:hover) {
  background-color: #f5f7fa;
}

.header-left {
  display: flex;
  align-items: center;
  gap: 16px;
}

.schedule-title {
  font-size: 16px;
  font-weight: 600;
  color: #303133;
}
</style> 