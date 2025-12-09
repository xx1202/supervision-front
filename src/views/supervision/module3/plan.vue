<template>
  <div class="inspection-plan">
    <div class="page-content">
      <div class="plan-container">
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
            <el-form-item label="巡查节次">
              <el-select v-model="searchForm.period" placeholder="选择节次" @change="handleSearch">
                <el-option label="全部" value="" />
                <el-option label="第4节" value="4" />
                <el-option label="第8节" value="8" />
              </el-select>
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
                新增巡查计划
              </el-button>
            </el-form-item>
          </el-form>
        </div>
        
        <!-- 卡片视图 -->
        <div v-if="viewMode === 'card'" class="plan-cards-container" v-loading="loading">
          <div v-if="planList.length === 0 && !loading" class="empty-state">
            <el-empty description="暂无巡查计划" />
          </div>
          
          <div v-else class="plan-cards">
            <div 
              v-for="plan in planList" 
              :key="plan.id" 
              class="plan-card"
              :class="{ 'plan-card--completed': plan.status === SUPERVISION_STATUS.COMPLETED }"
            >
              <div class="plan-card__header">
                <div class="plan-card__title">
                  <h3>{{ formatDate(plan.supervisionDate) }} {{ plan.weekDay }}</h3>
                  <span class="plan-card__period">第{{ plan.period }}节</span>
                </div>
                <div class="plan-card__status">
                  <el-tag :type="getStatusType(plan.status)" size="large">
                    {{ plan.statusName }}
                  </el-tag>
                </div>
              </div>

              <div class="plan-card__content">
                <div class="plan-card__info">
                  <div class="info-item">
                    <el-icon><Location /></el-icon>
                    <span>巡查楼层：{{ plan.floorRange }}</span>
                  </div>
                  <div class="info-item">
                    <el-icon><House /></el-icon>
                    <span>教室数量：{{ plan.classroomCount }}间</span>
                  </div>
                  <div class="info-item">
                    <el-icon><User /></el-icon>
                    <span>巡查员：{{ plan.memberNames?.length || 0 }}人</span>
                  </div>
                  <div class="info-item">
                    <el-icon><Calendar /></el-icon>
                    <span>创建时间：{{ formatDateTime(plan.createdTime) }}</span>
                  </div>
                </div>
              </div>

              <div class="plan-card__actions">
                <el-button @click="viewPlan(plan)" size="small">
                  <el-icon><View /></el-icon>
                  查看
                </el-button>
                <el-button 
                  v-if="plan.status === SUPERVISION_STATUS.PENDING" 
                  @click="editPlan(plan)"
                  size="small" 
                  type="primary"
                >
                  <el-icon><Edit /></el-icon>
                  编辑
                </el-button>
                <el-button 
                  v-if="plan.status === SUPERVISION_STATUS.PENDING" 
                  @click="startInspection(plan)"
                  size="small" 
                  type="success"
                >
                  <el-icon><VideoPlay /></el-icon>
                  开始
                </el-button>
                <el-button 
                  @click="goToRecord(plan)"
                  size="small" 
                  type="warning"
                >
                  <el-icon><Document /></el-icon>
                  巡查记录
                </el-button>
              </div>
            </div>
          </div>
        </div>

        <!-- 表格视图 -->
        <div v-if="viewMode === 'table'" class="plan-table">
          <el-table 
            :data="planList" 
            style="width: 100%" 
            height="100%"
            v-loading="loading"
            fit
            table-layout="fixed"
            border 
          >
            <el-table-column prop="supervisionDate" label="计划日期" width="120">
              <template #default="scope">
                {{ formatDate(scope.row.supervisionDate) }}
              </template>
            </el-table-column>
            <el-table-column prop="weekDay" label="星期" width="80" />
            <el-table-column prop="period" label="巡查节次" width="100">
              <template #default="scope">
                第{{ scope.row.period }}节
              </template>
            </el-table-column>
            <el-table-column prop="floorRange" label="巡查楼层" width="120" />
            <el-table-column prop="classroomCount" label="教室数量" width="100">
              <template #default="scope">
                {{ scope.row.classroomCount }}间
              </template>
            </el-table-column>
            <el-table-column prop="memberNames" label="巡查员" width="150">
              <template #default="scope">
                <el-tag 
                  v-for="member in scope.row.memberNames" 
                  :key="member" 
                  size="small" 
                  style="margin-right: 4px; margin-bottom: 4px"
                >
                  {{ member }}
                </el-tag>
              </template>
            </el-table-column>
            <el-table-column prop="status" label="状态" width="100">
              <template #default="scope">
                <el-tag :type="getStatusType(scope.row.status)">
                  {{ scope.row.statusName }}
                </el-tag>
              </template>
            </el-table-column>
            <el-table-column prop="createdByName" label="创建人" width="120" >
              <template #default="scope">
                {{ scope.row.createdBy }}
              </template>
            </el-table-column>
            <el-table-column prop="createdTime" label="创建时间" width="160">
              <template #default="scope">
                {{ formatDateTime(scope.row.createdTime) }}
              </template>
            </el-table-column>
            <el-table-column label="操作" min-width="200" fixed="right">
              <template #default="scope">
                <el-button size="small" @click="viewPlan(scope.row)">查看</el-button>
                <el-button 
                  v-if="scope.row.status === SUPERVISION_STATUS.PENDING" 
                  size="small" 
                  type="primary" 
                  @click="editPlan(scope.row)"
                >
                  编辑
                </el-button>
                <el-button 
                  v-if="scope.row.status === SUPERVISION_STATUS.PENDING" 
                  size="small" 
                  type="success" 
                  @click="startInspection(scope.row)"
                >
                  开始巡查
                </el-button>
                <el-button 
                  v-if="scope.row.status === SUPERVISION_STATUS.IN_PROGRESS" 
                  size="small" 
                  type="warning" 
                  @click="endInspection(scope.row)"
                >
                  结束巡查
                </el-button>
                <el-button 
                  size="small" 
                  type="danger" 
                  @click="deletePlan(scope.row)"
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
              :page-sizes="pageSizes"
              :total="pagination.total"
              layout="total, sizes, prev, pager, next, jumper"
              @size-change="handleSizeChange"
              @current-change="handleCurrentChange"
            />
          </div>
        </div>
        
        <!-- 分页（卡片视图） -->
        <div v-if="viewMode === 'card' && planList.length > 0" class="pagination-wrapper">
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

    <!-- 巡查计划对话框 -->
    <el-dialog
      :title="isEdit ? '编辑巡查计划' : '新增巡查计划'"
      v-model="dialogVisible"
      width="800px"
      :append-to-body="true"
      :lock-scroll="true"
      :close-on-click-modal="false"
    >
      <el-form :model="planForm" :rules="rules" ref="planFormRef" label-width="120px">
        <el-form-item label="计划日期" prop="supervisionDate">
          <el-date-picker
            v-model="planForm.supervisionDate"
            type="date"
            placeholder="选择计划日期"
            format="YYYY-MM-DD"
            value-format="YYYY-MM-DD"
            style="width: 100%"
            @change="handleDateChange"
          />
        </el-form-item>
        <el-form-item label="星期" prop="weekDay">
          <el-input v-model="planForm.weekDay" placeholder="星期" disabled style="width: 100%" />
        </el-form-item>
        <el-form-item label="巡查节次" prop="period">
          <el-select v-model="planForm.period" placeholder="选择巡查节次" style="width: 100%">
            <el-option label="第4节" value="4" />
            <el-option label="第8节" value="8" />
          </el-select>
        </el-form-item>
        <el-form-item label="巡查楼层" prop="floorRange">
          <div class="floor-selection">
            <div class="floor-options">
                <div class="floor-tags">
                  <el-tag
                    v-for="floor in availableFloors"
                    :key="floor.floorNumber"
                    :type="isFloorSelected(floor.floorNumber) ? 'primary' : getFloorSelectionType(floor.floorNumber)"
                    :class="{ 'floor-tag': true, 'selected': isFloorSelected(floor.floorNumber) }"
                    :data-type="getFloorSelectionType(floor.floorNumber)"
                    @click="toggleFloorSelection(floor.floorNumber)"
                  >
                    {{ floor.floorNumber }}楼（{{ floor.inspectionCount }}次）
                  </el-tag>
                </div>
            </div>
          
          </div>
        </el-form-item>
        <el-form-item label="巡查员" prop="members">
          <el-select
            v-model="planForm.members"
            multiple
            filterable
            placeholder="选择巡查员"
            style="width: 100%"
          >
            <el-option 
              v-for="inspector in inspectorList" 
              :key="inspector.id" 
              :label="`${inspector.realName} (${inspector.username})`"
              :value="inspector.id" 
            >
              <span>{{ inspector.realName }}</span>
              <span style="float: right; color: #8492a6; font-size: 13px">
                {{ inspector.username }} - {{ inspector.department }}
              </span>
            </el-option>
          </el-select>
          <div class="form-tip">可选择实训教师和学生督导员</div>
        </el-form-item>
        <el-form-item label="备注" prop="notes">
          <el-input 
            v-model="planForm.notes" 
            type="textarea" 
            :rows="3" 
            placeholder="请输入备注信息"
          />
        </el-form-item>
      </el-form>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="dialogVisible = false">取消</el-button>
          <el-button type="primary" @click="submitPlan">确定</el-button>
        </span>
      </template>
    </el-dialog>

    <!-- 巡查计划详情对话框 -->
    <el-dialog
      title="巡查计划详情"
      v-model="detailVisible"
      width="700px"
      :append-to-body="true"
      :lock-scroll="true"
      :close-on-click-modal="false"
    >
      <div v-if="currentPlan" class="plan-detail">
        <el-descriptions :column="2" border>
          <el-descriptions-item label="计划日期">
            {{ formatDate(currentPlan.supervisionDate) }}
          </el-descriptions-item>
          <el-descriptions-item label="星期">
            {{ currentPlan.weekDay }}
          </el-descriptions-item>
          <el-descriptions-item label="巡查节次">
            第{{ currentPlan.period }}节
          </el-descriptions-item>
          <el-descriptions-item label="巡查楼层">
            {{ currentPlan.floorRange }}
          </el-descriptions-item>
          <el-descriptions-item label="教室数量">
            {{ currentPlan.classroomCount }}间
          </el-descriptions-item>
          <el-descriptions-item label="状态">
            <el-tag :type="getStatusType(currentPlan.status)">
              {{ currentPlan.statusName }}
            </el-tag>
          </el-descriptions-item>
          <el-descriptions-item label="创建人">
            {{ currentPlan.createdBy || '未知' }}
          </el-descriptions-item>
          <el-descriptions-item label="创建时间">
            {{ formatDateTime(currentPlan.createdTime) }}
          </el-descriptions-item>
        </el-descriptions>

        <div v-if="currentPlan.memberNames && currentPlan.memberNames.length > 0" class="member-section">
          <h4>巡查员列表：</h4>
          <el-tag 
            v-for="member in currentPlan.memberNames" 
            :key="member"
            style="margin-right: 8px; margin-bottom: 8px"
          >
            {{ member }}
          </el-tag>
        </div>

        <div v-if="currentPlan.notes" class="notes-section">
          <h4>备注信息：</h4>
          <p>{{ currentPlan.notes }}</p>
        </div>
      </div>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted, onUnmounted, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { Plus, User, Calendar, View, Edit, VideoPlay, Document, Location, House } from '@element-plus/icons-vue'
import { ElMessageBox } from 'element-plus'
import { classroomInspectionScheduleAPI, statisticsAPI, userAPI } from '@/api'
import { showSuccessMessage, showErrorMessage, handleApiError } from '@/utils/error-handler'
import { debug } from '@/utils/logger'
import { 
  SUPERVISION_STATUS,
  SUPERVISION_STATUS_MAP
} from '@/constants'
import { PAGINATION } from '@/constants/common'
import { useViewMode } from '@/hooks/useViewMode'
import { useViewModeStore } from '@/store/modules/viewMode'
import type { 
  ClassroomInspectionSchedule, 
  ClassroomInspectionScheduleParams,
  ScheduleStatusParams,
  ClassroomInspectionStatisticsVO
} from '@/types/api'

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
    loadPlanList()
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
  period: '',
  status: ''
})

// 分页信息
const pagination = reactive({
  current: 1,
  size: 6, // 默认卡片视图的分页大小
  total: 0
})

// 巡查计划数据
const planList = ref<ClassroomInspectionSchedule[]>([])
const inspectorList = ref<any[]>([])
const loading = ref(false)

// 楼层统计数据
const floorStatistics = ref<ClassroomInspectionStatisticsVO | null>(null)
const floorStatisticsLoading = ref(false)

// 可用楼层列表
const availableFloors = ref<Array<{ floorNumber: string; inspectionCount: number }>>([])

// 对话框状态
const dialogVisible = ref(false)
const detailVisible = ref(false)
const isEdit = ref(false)
const currentPlan = ref<ClassroomInspectionSchedule | null>(null)
const planFormRef = ref()

// 巡查计划表单
const planForm = reactive<ClassroomInspectionScheduleParams>({
  supervisionDate: '',
  weekDay: '',
  period: 4,
  members: [],
  floorRange: '',
  notes: ''
})

// 表单验证规则
const rules = {
  supervisionDate: [{ required: true, message: '请选择计划日期', trigger: 'change' }],
  period: [{ required: true, message: '请选择巡查节次', trigger: 'change' }],
  floorRange: [{ 
    required: true, 
    validator: (rule: any, value: string, callback: any) => {
      if (!value) {
        callback(new Error('请选择巡查楼层'))
      } else {
        const floors = value.split(',').filter(f => f.trim())
        if (floors.length < 2) {
          callback(new Error('请至少选择2层楼'))
        } else {
          callback()
        }
      }
    }, 
    trigger: 'change' 
  }],
  members: [{ required: true, message: '请选择巡查员', trigger: 'change' }]
}

// 获取状态类型
const getStatusType = (status: string) => {
  return SUPERVISION_STATUS_MAP[status]?.type || 'info'
}

// 获取楼层标签类型（根据巡查次数）
const getFloorTagType = (inspectionCount: number) => {
  if (inspectionCount === 0) return 'success' // 未巡查过
  if (inspectionCount <= 2) return 'warning'  // 巡查次数较少
  return 'danger' // 巡查次数较多
}

// 获取楼层选择类型（根据巡查次数）
const getFloorSelectionType = (floorNumber: string) => {
  const floor = floorStatistics.value?.floorStatistics.find((f: any) => f.floorNumber.toString() === floorNumber)
  if (floor) {
    if (floor.inspectionCount === 0) return 'success' // 未巡查过
    if (floor.inspectionCount <= 2) return 'warning' // 巡查次数较少
    return 'danger' // 巡查次数较多
  }
  return 'info' // 未知楼层
}

// 获取已选择的楼层列表
const selectedFloors = computed(() => {
  if (!planForm.floorRange || !planForm.floorRange.trim()) return []
  return planForm.floorRange.split(',').map(f => f.trim()).filter(f => f !== '')
})

// 判断楼层是否已选择
const isFloorSelected = (floorNumber: string) => {
  if (!planForm.floorRange || !planForm.floorRange.trim()) return false
  
  const floors = planForm.floorRange.split(',').map(f => f.trim()).filter(f => f !== '')
  return floors.includes(floorNumber)
}

// 切换楼层选择
const toggleFloorSelection = (floorNumber: string) => {
  let floors: string[] = []
  
  // 处理楼层范围字符串，过滤掉空字符串
  if (planForm.floorRange && planForm.floorRange.trim()) {
    floors = planForm.floorRange.split(',').map(f => f.trim()).filter(f => f !== '')
  }
  
  if (floors.includes(floorNumber)) {
    // 如果已选择，则移除
    floors = floors.filter(f => f !== floorNumber)
  } else {
    // 如果未选择，则添加
    floors.push(floorNumber)
  }
  
  // 更新楼层范围
  planForm.floorRange = floors.join(', ')
  
  // 调试信息（仅开发环境）
  debug('选择的楼层:', floors)
  debug('楼层范围:', planForm.floorRange)
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

// 根据日期获取星期
const getWeekDay = (date: string) => {
  if (!date) return ''
  const weekDays = ['星期日', '星期一', '星期二', '星期三', '星期四', '星期五', '星期六']
  const day = new Date(date).getDay()
  return weekDays[day]
}

// 处理日期变化
const handleDateChange = (date: string) => {
  if (date) {
    planForm.weekDay = getWeekDay(date)
    // 当日期变化时，自动加载对应月份的楼层统计
    loadFloorStatistics(date)
  }
}

// 加载楼层统计
const loadFloorStatistics = async (date: string) => {
  if (!date) return
  
  const month = date.substring(0, 7) // 提取年月，如 "2025-01"
  floorStatisticsLoading.value = true
  
  try {
    const response: any = await statisticsAPI.getFloorStatistics({
      month,
      includeCancelled: false
    })
    
    if (response.code === 200) {
      floorStatistics.value = response.data
      // 根据统计数据更新可用楼层列表，默认1-5楼
      const defaultFloors = ['1', '2', '3', '4', '5']
      const responseFloors = response.data.floorStatistics || []
      
      availableFloors.value = defaultFloors.map(floorNumber => {
        const responseFloor = responseFloors.find((f: any) => f.floorNumber.toString() === floorNumber)
        return {
          floorNumber,
          inspectionCount: responseFloor ? responseFloor.inspectionCount : 0
        }
      })
    } else {
      // 如果API调用失败，使用默认楼层列表
      setDefaultFloors()
      ElMessageBox.warning('获取楼层统计失败，使用默认楼层列表', '提示')
    }
  } catch (error: any) {
    // 如果出现错误，使用默认楼层列表
    setDefaultFloors()
    ElMessageBox.warning('获取楼层统计失败，使用默认楼层列表', '提示')
  } finally {
    floorStatisticsLoading.value = false
  }
}

// 设置默认楼层列表
const setDefaultFloors = () => {
  const defaultFloors = ['1', '2', '3', '4', '5']
  availableFloors.value = defaultFloors.map(floorNumber => ({
    floorNumber,
    inspectionCount: 0
  }))
  
  // 设置默认的楼层统计数据
  floorStatistics.value = {
    month: new Date().toISOString().substring(0, 7),
    floorStatistics: defaultFloors.map(floorNumber => ({
      floorNumber: parseInt(floorNumber),
      inspectionCount: 0,
      inspectionDates: [],
      periodStatistics: []
    })),
    totalInspectionCount: 0,
    totalFloorCount: defaultFloors.length
  }
}

// 显示楼层统计
const showFloorStatistics = async () => {
  if (planForm.supervisionDate) {
    await loadFloorStatistics(planForm.supervisionDate)
  } else {
    // 如果没有选择日期，使用当前月份
    const now = new Date()
    const currentMonth = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`
    await loadFloorStatistics(currentMonth)
  }
  
  // 如果没有楼层数据，设置默认楼层
  if (!availableFloors.value || availableFloors.value.length === 0) {
    setDefaultFloors()
  }
}

// 加载巡查计划列表
const loadPlanList = async () => {
  loading.value = true
  try {
    const params = {
      page: pagination.current,
      size: pagination.size,
      startDate: searchForm.dateRange[0] || undefined,
      endDate: searchForm.dateRange[1] || undefined,
      status: searchForm.status || undefined
    }
    
    const response: any = await classroomInspectionScheduleAPI.getClassroomInspectionScheduleList(params)
    if (response.code === 200) {
      planList.value = response.data.records
      pagination.total = response.data.total
    } else {
      handleApiError(new Error(response.message || '加载巡查计划列表失败'), '加载巡查计划列表失败')
    }
  } catch (error: any) {
    handleApiError(error, '加载巡查计划列表失败')
  } finally {
    loading.value = false
  }
}

// 加载巡查员列表
const loadInspectorList = async () => {
  try {
    // 获取实训教师
    const teacherResponse = await userAPI.getUsersByRole('TRAINING_TEACHER', {
      page: 1,
      size: 100
    })
    
    // 获取学生督导员
    const studentResponse = await userAPI.getUsersByRole('STUDENT_SUPERVISOR', {
      page: 1,
      size: 100
    })
    
    const teachers = (teacherResponse as any)?.data?.records || []
    const students = (studentResponse as any)?.data?.records || []
    
    inspectorList.value = [...teachers, ...students]
  } catch (error) {
    handleApiError(error, '加载巡查员列表失败')
  }
}

// 搜索处理
const handleSearch = () => {
  pagination.current = 1
  loadPlanList()
}

// 重置搜索
const resetSearch = () => {
  searchForm.dateRange = []
  searchForm.period = ''
  searchForm.status = ''
  handleSearch()
}

// 分页处理
const handleSizeChange = (size: number) => {
  pagination.size = size
  pagination.current = 1
  loadPlanList()
}

const handleCurrentChange = (current: number) => {
  pagination.current = current
  loadPlanList()
}

// 显示创建对话框
const showCreateDialog = () => {
  isEdit.value = false
  Object.assign(planForm, {
    supervisionDate: '',
    weekDay: '',
    period: 4,
    members: [],
    floorRange: '',
    notes: ''
  })
  dialogVisible.value = true
  
  // 自动加载当前月份的楼层统计
  const now = new Date()
  const currentMonth = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`
  loadFloorStatistics(currentMonth)
}

// 编辑巡查计划
const editPlan = async (row: ClassroomInspectionSchedule) => {
  isEdit.value = true
  currentPlan.value = row
  
  // 先加载楼层统计，再设置表单数据
  if (row.supervisionDate) {
    await loadFloorStatistics(row.supervisionDate)
  }
  
  Object.assign(planForm, {
    supervisionDate: row.supervisionDate,
    weekDay: row.weekDay,
    period: row.period,
    members: row.members || [],
    floorRange: row.floorRange,
    notes: row.notes || ''
  })
  
  dialogVisible.value = true
}

// 查看巡查计划详情
const viewPlan = async (row: ClassroomInspectionSchedule) => {
  try {
    const response: any = await classroomInspectionScheduleAPI.getClassroomInspectionScheduleDetail(row.id)
    if (response.code === 200) {
      currentPlan.value = response.data
      detailVisible.value = true
    } else {
      handleApiError(new Error(response.message || '获取巡查计划详情失败'), '获取巡查计划详情失败')
    }
  } catch (error: any) {
    handleApiError(error, '获取巡查计划详情失败')
  }
}

// 开始巡查
const startInspection = async (row: ClassroomInspectionSchedule) => {
  try {
    await ElMessageBox.confirm(
      `确定要开始巡查吗？\n日期：${formatDate(row.supervisionDate)}\n节次：第${row.period}节`,
      '确认开始',
      {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }
    )

    const data: ScheduleStatusParams = {
      status: 'in_progress',
      action: 'start'
    }
    
    const response: any = await classroomInspectionScheduleAPI.updateClassroomInspectionScheduleStatus(row.id, data)
    if (response.code === 200) {
      showSuccessMessage(response, '巡查已开始')
      loadPlanList()
    } else {
      showErrorMessage(response, '开始巡查失败')
    }
  } catch (error: any) {
    if (error !== 'cancel') {
      handleApiError(error, '开始巡查失败')
    }
  }
}

// 结束巡查
const endInspection = async (row: ClassroomInspectionSchedule) => {
  try {
    await ElMessageBox.confirm(
      `确定要结束巡查吗？\n日期：${formatDate(row.supervisionDate)}\n节次：第${row.period}节`,
      '确认结束',
      {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }
    )

    const data: ScheduleStatusParams = {
      status: 'completed',
      action: 'end'
    }
    
    const response: any = await classroomInspectionScheduleAPI.updateClassroomInspectionScheduleStatus(row.id, data)
    if (response.code === 200) {
      showSuccessMessage(response, '巡查已结束')
      loadPlanList()
    } else {
      showErrorMessage(response, '结束巡查失败')
    }
  } catch (error: any) {
    if (error !== 'cancel') {
      handleApiError(error, '结束巡查失败')
    }
  }
}

// 删除巡查计划
const deletePlan = async (row: ClassroomInspectionSchedule) => {
  try {
    await ElMessageBox.confirm(
      `确定要删除巡查计划吗？\n日期：${formatDate(row.supervisionDate)}\n节次：第${row.period}节`,
      '确认删除',
      {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }
    )

    const response: any = await classroomInspectionScheduleAPI.deleteClassroomInspectionSchedule(row.id)
    if (response.code === 200) {
      showSuccessMessage(response, '删除成功')
      loadPlanList()
    } else {
      showErrorMessage(response, '删除失败')
    }
  } catch (error: any) {
    if (error !== 'cancel') {
      handleApiError(error, '删除失败')
    }
  }
}

// 提交巡查计划
const submitPlan = async () => {
  try {
    // 编辑模式下，如果数据没有变化，直接提交
    if (isEdit.value && currentPlan.value) {
      const hasChanges = 
        planForm.supervisionDate !== currentPlan.value.supervisionDate ||
        planForm.weekDay !== currentPlan.value.weekDay ||
        planForm.period !== currentPlan.value.period ||
        JSON.stringify(planForm.members) !== JSON.stringify(currentPlan.value.members) ||
        planForm.floorRange !== currentPlan.value.floorRange ||
        planForm.notes !== currentPlan.value.notes
      
      if (!hasChanges) {
        ElMessageBox.info('数据未发生变化', '提示')
        return
      }
    }
    
    await planFormRef.value.validate()
    
    if (isEdit.value) {
      // 编辑巡查计划
      const response: any = await classroomInspectionScheduleAPI.updateClassroomInspectionSchedule(
        currentPlan.value!.id, 
        planForm
      )
      if (response.code === 200) {
        showSuccessMessage(response, '编辑成功')
        dialogVisible.value = false
        loadPlanList()
      } else {
        showErrorMessage(response, '编辑失败')
      }
    } else {
      // 创建巡查计划
      const response: any = await classroomInspectionScheduleAPI.createClassroomInspectionSchedule(planForm)
      if (response.code === 200) {
        showSuccessMessage(response, '新增成功')
        dialogVisible.value = false
        loadPlanList()
      } else {
        handleApiError(new Error(response.message || '新增失败'), '新增失败')
      }
    }
  } catch (error: any) {
    if (error.message && error.message !== '') {
      handleApiError(error, '提交失败，请检查表单')
    } else {
      handleApiError(error, '提交失败，请检查表单')
    }
  }
}

// 重置表单
const resetForm = () => {
  if (planFormRef.value) {
    planFormRef.value.resetFields()
  }
  
  Object.assign(planForm, {
    supervisionDate: '',
    weekDay: '',
    period: 4,
    members: [],
    floorRange: '',
    notes: ''
  })
  
  // 重置楼层相关数据
  availableFloors.value = []
  floorStatistics.value = null
}

// 初始化数据
const initData = () => {
  if (isEdit.value && currentPlan.value) {
    Object.assign(planForm, {
      supervisionDate: currentPlan.value.supervisionDate || '',
      weekDay: currentPlan.value.weekDay || '',
      period: currentPlan.value.period,
      members: currentPlan.value.members || [],
      floorRange: currentPlan.value.floorRange || '',
      notes: currentPlan.value.notes || ''
    })
    
    // 如果有日期，加载对应的楼层统计
    if (currentPlan.value.supervisionDate) {
      loadFloorStatistics(currentPlan.value.supervisionDate)
    }
  } else {
    resetForm()
  }
}

// 跳转到巡查记录页面
const goToRecord = (row: any) => {
  router.push({
    name: 'InspectionRecord',
    query: { scheduleId: row.id }
  })
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
  
  loadPlanList()
  loadInspectorList()
  initData() // Call initData here to set form data based on currentPlan
})

// 组件卸载时移除事件监听
onUnmounted(() => {
  window.removeEventListener('view-mode-change', handleViewModeChange as EventListener)
})
</script>

<style scoped>
.inspection-plan {
  padding: 3px 3px 3px 3px;
  display: flex;
  flex-direction: column;
}

.plan-container {
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

.plan-table {
  margin-top: 3px;
  flex: 1;
  display: flex;
  flex-direction: column;
  min-height: 0;
}

.plan-table :deep(.el-table__footer-wrapper) {
  margin-bottom: 0;
}

.plan-table :deep(.el-table__fixed-footer-wrapper) {
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

.plan-detail {
  padding: 20px 0;
}

.member-section {
  margin-top: 20px;
  padding-top: 20px;
  border-top: 1px solid #f0f0f0;
}

.member-section h4 {
  margin-bottom: 12px;
  color: #333;
}

.notes-section {
  margin-top: 20px;
  padding-top: 20px;
  border-top: 1px solid #f0f0f0;
}

.notes-section h4 {
  margin-bottom: 12px;
  color: #333;
}

.notes-section p {
  margin: 0;
  color: #666;
  line-height: 1.6;
}

.floor-selection {
  width: 100%;
}

.floor-options {
  margin-bottom: 12px;
}

.floor-hint {
  font-size: 14px;
  color: #555;
  margin-bottom: 16px;
  font-weight: 500;
}

.floor-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
}

.floor-tag {
  cursor: pointer;
  transition: all 0.2s ease;
  border-radius: 8px;
  padding: 8px 16px;
  font-size: 14px;
  font-weight: 500;
  border: 2px solid transparent;
  background: #f5f7fa;
  color: #606266;
  min-width: 80px;
  text-align: center;
}

.floor-tag:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.floor-tag.selected {
  background: #409eff;
  color: white;
  border-color: #409eff;
  box-shadow: 0 4px 12px rgba(64, 158, 255, 0.3);
}

/* 根据巡查次数设置不同的边框颜色 */
.floor-tag[data-type="success"] {
  border-color: #67c23a;
}

.floor-tag[data-type="warning"] {
  border-color: #e6a23c;
}

.floor-tag[data-type="danger"] {
  border-color: #f56c6c;
}

.floor-tag[data-type="info"] {
  border-color: #909399;
}

/* 选中状态覆盖顶部颜色 */
.floor-tag.selected::before {
  background: linear-gradient(90deg, #1890ff, #409eff) !important;
}

/* 移除复杂的样式，保持简洁 */
.selected-floors,
.selected-hint,
.warning-hint {
  display: none;
}

/* 简化响应式设计 */
@media (max-width: 768px) {
  .floor-tags {
    gap: 8px;
  }
  
  .floor-tag {
    min-width: 70px;
    padding: 6px 12px;
    font-size: 13px;
  }
}

/* 移除不必要的状态样式 */
.floor-tag:focus,
.floor-tag:active,
.floor-tag.loading,
.floor-tag.disabled {
  /* 使用默认样式 */
}

/* 简化调试信息 */
.debug-info {
  margin-top: 12px;
  padding: 8px 12px;
  background: #f5f5f5;
  border-radius: 4px;
  font-size: 12px;
  color: #666;
}

.debug-info p {
  margin: 2px 0;
}

/* 添加提示信息样式 */
.form-tip {
  font-size: 12px;
  color: #909399;
  margin-top: 4px;
}

.dialog-footer {
  text-align: right;
}

/* 卡片视图样式 */
.plan-cards-container {
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

.plan-cards {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(400px, 1fr));
  gap: 16px;
  padding: 0 8px;
}

.plan-card {
  background: white;
  border: 1px solid #e4e7ed;
  border-radius: 12px;
  padding: 18px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
  transition: all 0.3s ease;
  position: relative;
  overflow: hidden;
}

.plan-card:hover {
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.12);
  transform: translateY(-2px);
}

.plan-card--completed {
  border-left: 4px solid #67c23a;
}

.plan-card__header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 14px;
}

.plan-card__title h3 {
  margin: 0 0 4px 0;
  font-size: 17px;
  font-weight: 600;
  color: #303133;
}

.plan-card__period {
  font-size: 14px;
  color: #909399;
  background: #f5f7fa;
  padding: 2px 8px;
  border-radius: 4px;
}

.plan-card__status {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: 4px;
}

.plan-card__content {
  margin-bottom: 14px;
}

.plan-card__info {
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

.plan-card__actions {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
  margin-top: 4px;
}

.plan-card__actions .el-button {
  flex: 1;
  min-width: 80px;
}
</style> 