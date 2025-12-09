<template>
  <div class="administrative-schedule">
    <div class="page-content">
      <div class="schedule-container">
        <!-- 搜索和过滤区域 -->
        <div class="search-section">
          <el-form :model="searchForm" inline style="display: flex; align-items: center; justify-content: space-between;">
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
            <el-form-item label="状态">
              <el-select v-model="searchForm.status" placeholder="选择状态" @change="handleSearch">
                <el-option label="全部" value="" />
                <el-option 
                  v-for="(statusInfo, status) in SUPERVISION_STATUS_MAP" 
                  :key="status" 
                  :label="statusInfo.label" 
                  :value="status" 
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
                新增安排
              </el-button>
            </el-form-item>
          </el-form>
        </div>
        
        <!-- 卡片视图 -->
        <div v-if="viewMode === 'card'" class="schedule-cards-container" v-loading="loading">
          <div v-if="scheduleList.length === 0 && !loading" class="empty-state">
            <el-empty description="暂无坐班安排" />
          </div>
          
          <div v-else class="schedule-cards">
            <div 
              v-for="schedule in scheduleList" 
              :key="schedule.id" 
              class="schedule-card"
              :class="{ 'schedule-card--completed': schedule.status === SUPERVISION_STATUS.COMPLETED }"
            >
              <div class="schedule-card__header">
                <div class="schedule-card__title">
                  <h3>{{ formatDate(schedule.supervisionDate) }} {{ schedule.weekDay }}</h3>
                  <span class="schedule-card__period">第{{ schedule.period }}节</span>
                </div>
                <div class="schedule-card__status">
                  <el-tag :type="getStatusType(schedule.status)" size="large">
                    {{ getStatusName(schedule.status) }}
                  </el-tag>
                </div>
              </div>

              <div class="schedule-card__content">
                <div class="schedule-card__info">
                  <div class="info-item">
                    <el-icon><User /></el-icon>
                    <span>带队领导：{{ schedule.leaderName }}</span>
                  </div>
                  <div class="info-item">
                    <el-icon><User /></el-icon>
                    <span>参与人数：{{ schedule.memberCount || 0 }}人</span>
                  </div>
                  <div class="info-item">
                    <el-icon><Calendar /></el-icon>
                    <span>创建时间：{{ formatDateTime(schedule.createdTime) }}</span>
                  </div>
                </div>
              </div>

              <div class="schedule-card__actions">
                <el-button @click="viewSchedule(schedule)" size="small">
                  <el-icon><View /></el-icon>
                  查看
                </el-button>
                <el-button 
                  v-if="schedule.status === SUPERVISION_STATUS.PENDING" 
                  @click="editSchedule(schedule)"
                  size="small" 
                  type="primary"
                  v-role="['ADMIN_OFFICE_DIRECTOR']"
                >
                  <el-icon><Edit /></el-icon>
                  编辑
                </el-button>
                <el-button 
                  v-if="schedule.status === SUPERVISION_STATUS.PENDING" 
                  @click="startSchedule(schedule)"
                  size="small" 
                  type="success"
                  v-role="['ADMIN_OFFICE_DIRECTOR']"
                >
                  <el-icon><VideoPlay /></el-icon>
                  开始
                </el-button>
                <el-button 
                  @click="goToAttendance(schedule)"
                  size="small" 
                  type="warning"
                  v-role="['ADMIN_OFFICE_DIRECTOR']"
                >
                  <el-icon><Document /></el-icon>
                  考勤记录
                </el-button>
              </div>
            </div>
          </div>
        </div>

        <!-- 表格视图 -->
        <div v-if="viewMode === 'table'" class="schedule-table">
          <el-table 
            :data="scheduleList" 
            style="width: 100%" 
            height="100%"
            v-loading="loading"
            fit
            table-layout="fixed"
            border 
          >
            <el-table-column prop="supervisionDate" label="安排日期" width="120">
              <template #default="scope">
                {{ formatDate(scope.row.supervisionDate) }}
              </template>
            </el-table-column>
            <el-table-column prop="weekDay" label="星期" width="80">
              <template #default="scope">
                {{ scope.row.weekDay }}
              </template>
            </el-table-column>
            <el-table-column prop="period" label="节次" width="80">
              <template #default="scope">
                <el-tag :type="getStatusType(scope.row.status)">
                  {{ scope.row.period }}节
                </el-tag>
              </template>
            </el-table-column>
            <el-table-column prop="leaderName" label="带队领导" width="120" />
            <el-table-column prop="memberCount" label="参与人数" width="100">
              <template #default="scope">
                {{ scope.row.memberCount || 0 }}人
              </template>
            </el-table-column>
            <el-table-column prop="statusName" label="状态" width="100">
              <template #default="scope">
                <el-tag :type="getStatusType(scope.row.status)">
                  {{ getStatusName(scope.row.status) }}
                </el-tag>
              </template>
            </el-table-column>
            <el-table-column prop="createdTime" label="创建时间" width="160">
              <template #default="scope">
                {{ formatDateTime(scope.row.createdTime) }}
              </template>
            </el-table-column>
            <el-table-column label="操作" min-width="200" fixed="right">
              <template #default="scope">
                <el-button size="small" @click="viewSchedule(scope.row)">查看</el-button>
                <el-button 
                  v-if="scope.row.status === SUPERVISION_STATUS.PENDING" 
                  size="small" 
                  type="primary" 
                  @click="editSchedule(scope.row)"
                  v-role="['ADMIN_OFFICE_DIRECTOR']"
                >
                  编辑
                </el-button>
                <el-button 
                  v-if="scope.row.status === SUPERVISION_STATUS.PENDING" 
                  size="small" 
                  type="danger" 
                  @click="deleteSchedule(scope.row)"
                  v-role="['ADMIN_OFFICE_DIRECTOR']"
                >
                  删除
                </el-button>
                <el-button 
                  v-if="scope.row.status === SUPERVISION_STATUS.PENDING" 
                  size="small" 
                  type="success" 
                  @click="startSchedule(scope.row)"
                  v-role="['ADMIN_OFFICE_DIRECTOR']"
                >
                  开始
                </el-button>
                <el-button 
                  size="small" 
                  type="warning" 
                  @click="goToAttendance(scope.row)"
                  v-role="['ADMIN_OFFICE_DIRECTOR']"
                >
                  考勤记录
                </el-button>
              </template>
            </el-table-column>
          </el-table>

          <!-- 分页 -->
          <div class="pagination-wrapper">
            <el-pagination
              v-model:current-page="pagination.current"
              v-model:page-size="pagination.size"
              :page-sizes="pageSizes"
              :total="pagination.total"
              layout="total, sizes, prev, pager, next, jumper"
              @size-change="handleSizeChange"
              @current-change="handleCurrentChange"
            />
          </div>
        </div>
        
        <!-- 分页（卡片视图） -->
        <div v-if="viewMode === 'card' && scheduleList.length > 0" class="pagination-wrapper">
          <el-pagination
            v-model:current-page="pagination.current"
            v-model:page-size="pagination.size"
            :page-sizes="[6, 12, 24, 48]"
            :total="pagination.total"
            layout="total, sizes, prev, pager, next, jumper"
            @size-change="handleSizeChange"
            @current-change="handleCurrentChange"
          />
        </div>
      </div>
    </div>

    <!-- 坐班安排对话框 -->
    <el-dialog
      :title="isEdit ? '编辑安排' : '新增安排'"
      v-model="dialogVisible"
      width="800px"
      :append-to-body="true"
      :lock-scroll="true"
      :close-on-click-modal="false"
    >
      <el-form :model="formData" :rules="formRules" ref="formRef" label-width="120px">
        <el-form-item label="督导日期" prop="supervisionDate">
          <el-date-picker
            v-model="formData.supervisionDate"
            type="date"
            placeholder="选择督导日期"
            format="YYYY-MM-DD"
            value-format="YYYY-MM-DD"
            style="width: 100%"
          />
        </el-form-item>
        
        <el-form-item label="星期" prop="weekDay">
          <el-select v-model="formData.weekDay" placeholder="选择星期" style="width: 100%">
            <el-option
              v-for="item in weekDayOptions"
              :key="item.value"
              :label="item.label"
              :value="item.value"
            />
          </el-select>
        </el-form-item>
        
        <el-form-item label="节次" prop="period">
          <el-select v-model="formData.period" placeholder="选择节次" style="width: 100%">
            <el-option
              v-for="item in periodOptions"
              :key="item.value"
              :label="item.label"
              :value="item.value"
            />
          </el-select>
        </el-form-item>
        
        <el-form-item label="带队领导" prop="leader">
          <el-select v-model="formData.leader" placeholder="选择带队领导" style="width: 100%">
            <el-option
              v-for="item in staffList"
              :key="item.id"
              :label="item.name"
              :value="item.id"
            />
          </el-select>
        </el-form-item>
        
        <el-form-item label="督导成员" prop="members">
          <el-select
            v-model="formData.members"
            multiple
            filterable
            placeholder="选择督导成员"
            style="width: 100%"
          >
            <el-option
              v-for="item in staffList"
              :key="item.id"
              :label="item.name"
              :value="item.id"
            />
          </el-select>
        </el-form-item>
        
        <el-form-item label="备注" prop="notes">
          <el-input
            v-model="formData.notes"
            type="textarea"
            :rows="3"
            placeholder="请输入备注信息"
          />
        </el-form-item>
      </el-form>
      
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="dialogVisible = false">取消</el-button>
          <el-button type="primary" @click="submitForm" :loading="submitLoading">
            {{ isEdit ? '更新' : '创建' }}
          </el-button>
        </span>
      </template>
    </el-dialog>

    <!-- 安排详情对话框 -->
    <el-dialog
      title="安排详情"
      v-model="detailVisible"
      width="600px"
      :append-to-body="true"
      :lock-scroll="true"
      :close-on-click-modal="false"
    >
      <div v-if="currentSchedule" class="schedule-detail">
        <el-descriptions :column="2" border>
          <el-descriptions-item label="安排日期">
            {{ formatDate(currentSchedule.supervisionDate) }}
          </el-descriptions-item>
          <el-descriptions-item label="星期">
            {{ currentSchedule.weekDay }}
          </el-descriptions-item>
          <el-descriptions-item label="节次">
            <el-tag :type="getStatusType(currentSchedule.status)">
              {{ currentSchedule.period }}节
            </el-tag>
          </el-descriptions-item>
          <el-descriptions-item label="带队领导">
            {{ currentSchedule.leaderName }}
          </el-descriptions-item>
          <el-descriptions-item label="参与人数">
            {{ currentSchedule.memberCount || 0 }}人
          </el-descriptions-item>
          <el-descriptions-item label="状态">
            <el-tag :type="getStatusType(currentSchedule.status)">
              {{ getStatusName(currentSchedule.status) }}
            </el-tag>
          </el-descriptions-item>
          <el-descriptions-item label="创建时间" :span="2">
            {{ formatDateTime(currentSchedule.createdTime) }}
          </el-descriptions-item>
        </el-descriptions>

        <div v-if="currentSchedule.notes" class="notes-section">
          <h4>备注：</h4>
          <p>{{ currentSchedule.notes }}</p>
        </div>

        <div v-if="currentSchedule.memberNames && currentSchedule.memberNames.length > 0" class="member-list">
          <h4>督导成员：</h4>
          <el-tag 
            v-for="member in currentSchedule.memberNames" 
            :key="member"
            style="margin-right: 8px; margin-bottom: 8px"
          >
            {{ member }}
          </el-tag>
        </div>
      </div>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, onMounted, onUnmounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { Plus, User, Calendar, View, Edit, VideoPlay, Document } from '@element-plus/icons-vue'
import { ElMessageBox } from 'element-plus'
import { administrativeScheduleAPI, userAPI } from '../../../api'
import { showSuccessMessage, showErrorMessage, handleApiError } from '@/utils/error-handler'
import { 
  SUPERVISION_STATUS,
  SUPERVISION_STATUS_MAP
} from '@/constants/supervision'
import { PAGINATION } from '@/constants/common'
import { useViewMode } from '@/hooks/useViewMode'
import { useViewModeStore } from '@/store/modules/viewMode'

// 行政坐班督导安排类型定义
interface AdministrativeSchedule {
  id: string
  supervisionDate: string
  weekDay: string
  period: number
  leader: string
  leaderName: string
  members: string[]
  memberNames: string[]
  memberCount: number
  status: string
  statusName: string
  notes?: string
  createdTime: string
  updatedTime?: string
}

// 创建行政坐班督导安排参数
interface CreateScheduleParams {
  supervisionDate: string
  weekDay: string
  period: number
  leader: string
  members: string[]
  notes?: string
}

// 路由
const route = useRoute()
const router = useRouter()
const viewModeStore = useViewModeStore()

// 使用全局视图模式
const { viewMode } = useViewMode(
  route.path,
  'card',
  (mode) => {
    // 视图模式切换时的回调
    if (mode === 'table') {
      pagination.size = 10
    } else {
      pagination.size = 6
    }
    pagination.current = 1
    loadScheduleList()
  }
)

// 计算分页大小选项
const pageSizes = computed(() => {
  return viewMode.value === 'card' ? [6, 12, 24, 48] : PAGINATION.PAGE_SIZES
})

// 监听全局视图模式变化事件
const handleViewModeChange = (event: CustomEvent) => {
  if (event.detail.path === route.path) {
    viewMode.value = event.detail.mode
  }
}

// 搜索表单
const searchForm = reactive({
  dateRange: [] as string[],
  status: ''
})

// 分页信息
const pagination = reactive({
  current: 1,
  size: 10,
  total: 0
})

// 坐班安排数据
const scheduleList = ref<AdministrativeSchedule[]>([])
const loading = ref(false)

// 对话框状态
const dialogVisible = ref(false)
const detailVisible = ref(false)
const isEdit = ref(false)
const currentSchedule = ref<AdministrativeSchedule | null>(null)
const submitLoading = ref(false)
const formRef = ref()

// 表单数据
const formData = reactive<CreateScheduleParams>({
  supervisionDate: '',
  weekDay: '',
  period: 1,
  leader: '',
  members: [],
  notes: ''
})

// 表单规则
const formRules = {
  supervisionDate: [{ required: true, message: '请选择督导日期', trigger: 'change' }],
  weekDay: [{ required: true, message: '请选择星期', trigger: 'change' }],
  period: [{ required: true, message: '请选择节次', trigger: 'change' }],
  leader: [{ required: true, message: '请选择带队领导', trigger: 'change' }],
  members: [{ required: true, message: '请选择督导成员', trigger: 'change' }]
}

// 星期选项
const weekDayOptions = [
  { label: '星期一', value: '星期一' },
  { label: '星期二', value: '星期二' },
  { label: '星期三', value: '星期三' },
  { label: '星期四', value: '星期四' },
  { label: '星期五', value: '星期五' },
  { label: '星期六', value: '星期六' },
  { label: '星期日', value: '星期日' }
]

// 节次选项
const periodOptions = [
  { label: '第1节', value: 1 },
  { label: '第2节', value: 2 },
  { label: '第3节', value: 3 },
  { label: '第4节', value: 4 },
  { label: '第5节', value: 5 },
  { label: '第6节', value: 6 },
  { label: '第7节', value: 7 },
  { label: '第8节', value: 8 }
]

// 员工列表
interface StaffItem {
  id: string
  name: string
  realName?: string
}

const staffList = ref<StaffItem[]>([])

// 加载员工列表
const loadStaffList = async () => {
  try {
    const response: any = await userAPI.getActiveUsers()
    if (response.code === 200 && response.data) {
      staffList.value = (Array.isArray(response.data) ? response.data : []).map((user: any) => ({
        id: user.id,
        name: user.realName || user.username,
        realName: user.realName
      }))
    }
  } catch (error: any) {
    handleApiError(error, '加载员工列表失败')
  }
}

// 获取状态类型
const getStatusType = (status: string) => {
  return SUPERVISION_STATUS_MAP[status]?.type || 'info'
}

// 获取状态名称
const getStatusName = (status: string) => {
  return SUPERVISION_STATUS_MAP[status]?.label || '未知'
}

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

// 加载坐班安排列表
const loadScheduleList = async () => {
  loading.value = true
  try {
    const params = {
      page: pagination.current,
      size: pagination.size,
      startDate: searchForm.dateRange[0] || undefined,
      endDate: searchForm.dateRange[1] || undefined,
      status: searchForm.status || undefined
    }
    
    const response: any = await administrativeScheduleAPI.getAdministrativeScheduleList(params)
    if (response.code === 200 && response.data) {
      scheduleList.value = response.data.records || []
      pagination.total = response.data.total || 0
    } else {
      handleApiError(new Error(response.message || '加载坐班安排列表失败'), '加载坐班安排列表失败')
    }
  } catch (error: any) {
    handleApiError(error, '加载坐班安排列表失败')
  } finally {
    loading.value = false
  }
}

// 搜索处理
const handleSearch = () => {
  pagination.current = 1
  loadScheduleList()
}

// 重置搜索
const resetSearch = () => {
  searchForm.dateRange = []
  searchForm.status = ''
  handleSearch()
}

// 分页处理
const handleSizeChange = (size: number) => {
  pagination.size = size
  pagination.current = 1
  loadScheduleList()
}

const handleCurrentChange = (current: number) => {
  pagination.current = current
  loadScheduleList()
}

// 显示创建对话框
const showCreateDialog = () => {
  isEdit.value = false
  Object.assign(formData, {
    supervisionDate: '',
    weekDay: '',
    period: 1,
    leader: '',
    members: [],
    notes: ''
  })
  dialogVisible.value = true
}

// 编辑坐班安排
const editSchedule = (row: AdministrativeSchedule) => {
  isEdit.value = true
  Object.assign(formData, {
    supervisionDate: row.supervisionDate,
    weekDay: row.weekDay,
    period: row.period,
    leader: row.leader,
    members: row.members,
    notes: row.notes || ''
  })
  dialogVisible.value = true
}

// 查看坐班安排详情
const viewSchedule = (row: AdministrativeSchedule) => {
  currentSchedule.value = { ...row }
  detailVisible.value = true
}

// 删除坐班安排
const deleteSchedule = async (row: AdministrativeSchedule) => {
  try {
    await ElMessageBox.confirm(
      `确定要删除这个安排吗？\n日期：${formatDate(row.supervisionDate)}\n星期：${row.weekDay}\n节次：第${row.period}节`,
      '确认删除',
      {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }
    )

    const response: any = await administrativeScheduleAPI.deleteAdministrativeSchedule(row.id)
    if (response.code === 200) {
      showSuccessMessage(response, '删除成功')
      loadScheduleList()
    } else {
      showErrorMessage(response, '删除失败')
    }
  } catch (error: any) {
    if (error !== 'cancel') {
      handleApiError(error, '删除失败')
    }
  }
}

// 开始坐班安排
const startSchedule = async (row: AdministrativeSchedule) => {
  try {
    await ElMessageBox.confirm(
      `确定要开始这个安排吗？\n日期：${formatDate(row.supervisionDate)}\n星期：${row.weekDay}\n节次：第${row.period}节`,
      '确认开始',
      {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }
    )

    const response: any = await administrativeScheduleAPI.updateAdministrativeScheduleStatus(row.id, {
      status: SUPERVISION_STATUS.IN_PROGRESS,
      action: 'start'
    })
    
    if (response.code === 200) {
      showSuccessMessage(response, '安排已开始')
      loadScheduleList()
    } else {
      showErrorMessage(response, '开始安排失败')
    }
  } catch (error: any) {
    if (error !== 'cancel') {
      handleApiError(error, '开始安排失败')
    }
  }
}

// 跳转到考勤页面
const goToAttendance = (row: AdministrativeSchedule) => {
  router.push({
    name: 'AdministrativeAttendance',
    query: { scheduleId: row.id }
  })
}

// 提交表单
const submitForm = async () => {
  if (!formRef.value) return
  
  try {
    await formRef.value.validate()
    submitLoading.value = true
    
    let response: any
    if (isEdit.value && currentSchedule.value) {
      response = await administrativeScheduleAPI.updateAdministrativeSchedule(currentSchedule.value.id, formData)
    } else {
      response = await administrativeScheduleAPI.createAdministrativeSchedule(formData)
    }
    
    if (response.code === 200) {
      showSuccessMessage(response, isEdit.value ? '更新成功' : '创建成功')
      dialogVisible.value = false
      loadScheduleList()
    } else {
      showErrorMessage(response, '操作失败')
    }
  } catch (error: any) {
    if (error !== false) { // 表单验证失败不显示错误
      handleApiError(error, '操作失败')
    }
  } finally {
    submitLoading.value = false
  }
}

// 组件挂载时加载数据
onMounted(() => {
  // 监听全局视图模式变化事件
  window.addEventListener('view-mode-change', handleViewModeChange as EventListener)
  
  // 确保视图模式已保存到 store（useViewMode 已经处理了，这里确保同步）
  const storedMode = viewModeStore.getViewMode(route.path)
  if (storedMode && storedMode !== viewMode.value) {
    viewMode.value = storedMode
  }
  
  // 根据当前视图模式设置分页大小
  if (viewMode.value === 'table') {
    pagination.size = 10
  } else {
    pagination.size = 6
  }
  
  loadScheduleList()
  loadStaffList()
})

// 组件卸载时移除事件监听
onUnmounted(() => {
  window.removeEventListener('view-mode-change', handleViewModeChange as EventListener)
})
</script>

<style scoped>
.administrative-schedule {
  padding: 3px 3px 3px 3px;
  display: flex;
  flex-direction: column;
}

.schedule-container {
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

.pagination-wrapper {
  margin-top: 8px;
  margin-bottom: 0;
  text-align: right;
  flex-shrink: 0;
}

.pagination-wrapper :deep(.el-pagination) {
  margin-bottom: 0;
}

.schedule-detail {
  padding: 20px 0;
}

.content-section,
.participant-list,
.notes-section,
.member-list {
  margin-top: 20px;
  padding-top: 20px;
  border-top: 1px solid #f0f0f0;
}

.content-section h4,
.participant-list h4,
.notes-section h4,
.member-list h4 {
  margin-bottom: 12px;
  color: #333;
}

.dialog-footer {
  text-align: right;
}

/* 卡片视图样式 */
.schedule-cards-container {
  flex: 1;
  overflow-y: auto;
  padding: 16px 0;
}

.empty-state {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 300px;
}

.schedule-cards {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(400px, 1fr));
  gap: 16px;
  padding: 0 8px;
}

.schedule-card {
  background: white;
  border: 1px solid #e4e7ed;
  border-radius: 12px;
  padding: 18px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
  transition: all 0.3s ease;
  position: relative;
  overflow: hidden;
}

.schedule-card:hover {
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.12);
  transform: translateY(-2px);
}

.schedule-card--completed {
  border-left: 4px solid #67c23a;
}

.schedule-card__header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 14px;
}

.schedule-card__title h3 {
  margin: 0 0 4px 0;
  font-size: 17px;
  font-weight: 600;
  color: #303133;
}

.schedule-card__period {
  font-size: 14px;
  color: #909399;
  background: #f5f7fa;
  padding: 2px 8px;
  border-radius: 4px;
}

.schedule-card__status {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: 4px;
}

.schedule-card__content {
  margin-bottom: 14px;
}

.schedule-card__info {
  margin-bottom: 14px;
}

.info-item {
  display: flex;
  align-items: center;
  margin-bottom: 7px;
  font-size: 13px;
  color: #606266;
}

.info-item .el-icon {
  margin-right: 8px;
  color: #909399;
}

.schedule-card__actions {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
  margin-top: 4px;
}

.schedule-card__actions .el-button {
  flex: 1;
  min-width: 80px;
}
</style> 