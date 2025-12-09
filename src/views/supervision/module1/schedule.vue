<template>
  <div class="supervision-schedule">
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
            <el-form-item label="状态" style="width: 150px">
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
            <el-empty description="暂无督导安排" />
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
                    <span>督导成员：{{ schedule.memberCount }}人</span>
                  </div>
                  <div class="info-item">
                    <el-icon><Calendar /></el-icon>
                    <span>创建时间：{{ formatDateTime(schedule.createdTime) }}</span>
                  </div>
                </div>

                <div class="schedule-card__progress">
                  <div class="progress-info">
                    <span>汇总状态：</span>
                    <el-tag :type="getProgressStatusType(schedule.progressStatus)" size="small">
                      {{ schedule.progressStatus }}
                      <span v-if="schedule.progressStatus != '未开始'">
                        ({{ schedule.completedClassrooms }}/{{ schedule.totalClassrooms }})
                      </span>
                    </el-tag>
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
                  v-role="['ADMIN_OFFICE_DIRECTOR','ACADEMIC_ADMIN', 'STUDENT_ADMIN']"
                >
                  <el-icon><Edit /></el-icon>
                  编辑
                </el-button>
                <el-button 
                  v-if="schedule.status === SUPERVISION_STATUS.PENDING" 
                  @click="startSchedule(schedule)"
                  size="small" 
                  type="success"
                  v-role="['ADMIN_OFFICE_DIRECTOR','ACADEMIC_ADMIN', 'STUDENT_ADMIN']"
                >
                  <el-icon><VideoPlay /></el-icon>
                  开始
                </el-button>
                <el-button 
                  @click="goToApproval(schedule)"
                  size="small" 
                  type="warning"
                  v-role="['ADMIN_OFFICE_DIRECTOR','ACADEMIC_ADMIN', 'STUDENT_ADMIN']"
                >
                  <el-icon><Document /></el-icon>
                  审核记录
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
            <el-table-column  prop="supervisionDate" label="督导日期" width="120">
              <template #default="scope">
                {{ formatDate(scope.row.supervisionDate) }}
              </template>
            </el-table-column>
            <el-table-column prop="weekDay" label="星期" width="80" />
            <el-table-column prop="period" label="节次" width="80">
              <template #default="scope">
                第{{ scope.row.period }}节
              </template>
            </el-table-column>
            <el-table-column prop="leaderName" label="带队领导" width="120" />
            <el-table-column prop="memberCount" label="督导成员" width="100">
              <template #default="scope">
                {{ scope.row.memberCount }}人
              </template>
            </el-table-column>
            <el-table-column prop="status" label="状态" width="100">
              <template #default="scope">
                <el-tag :type="getStatusType(scope.row.status)">
                  {{ getStatusName(scope.row.status) }}
                </el-tag>
              </template>
            </el-table-column>
            <el-table-column prop="progressStatus" label="汇总状态" width="120">
              <template #default="scope">
                <el-tag :type="getProgressStatusType(scope.row.progressStatus)">
                  {{ scope.row.progressStatus }}
                  <span v-if="scope.row.progressStatus != '未开始'  ">
                    ({{ scope.row.completedClassrooms }}/{{ scope.row.totalClassrooms }})
                  </span>
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
                  v-role="['ADMIN_OFFICE_DIRECTOR','ACADEMIC_ADMIN', 'STUDENT_ADMIN']"
                >
                  编辑
                </el-button>
                <el-button 
                  v-if="scope.row.status === SUPERVISION_STATUS.PENDING" 
                  size="small" 
                  type="danger" 
                  @click="deleteSchedule(scope.row)"
                  v-role="['ADMIN_OFFICE_DIRECTOR','ACADEMIC_ADMIN', 'STUDENT_ADMIN']"
                >
                  删除
                </el-button>
                <el-button 
                  v-if="scope.row.status === SUPERVISION_STATUS.PENDING" 
                  size="small" 
                  type="success" 
                  @click="startSchedule(scope.row)"
                  v-role="['ADMIN_OFFICE_DIRECTOR','ACADEMIC_ADMIN', 'STUDENT_ADMIN']"
                >
                  开始
                </el-button>
                <el-button 
                  size="small" 
                  type="warning" 
                  @click="goToApproval(scope.row)"
                  v-role="['ADMIN_OFFICE_DIRECTOR','ACADEMIC_ADMIN', 'STUDENT_ADMIN']"
                >
                  审核记录
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

    <!-- 督导安排对话框 -->
    <ScheduleDialog
      v-model:visible="dialogVisible"
      :is-edit="isEdit"
      :schedule-data="currentSchedule"
      @success="handleDialogSuccess"
    />

    <!-- 督导安排详情对话框 -->
    <el-dialog
      title="督导安排详情"
      v-model="detailVisible"
      width="600px"
      :append-to-body="true"
      :lock-scroll="true"
      :close-on-click-modal="false"
    >
      <div v-if="currentSchedule" class="schedule-detail">
        <el-descriptions :column="2" border>
          <el-descriptions-item label="督导日期">
            {{ formatDate(currentSchedule.supervisionDate) }}
          </el-descriptions-item>
          <el-descriptions-item label="星期">
            {{ currentSchedule.weekDay }}
          </el-descriptions-item>
          <el-descriptions-item label="节次">
            第{{ currentSchedule.period }}节
          </el-descriptions-item>
          <el-descriptions-item label="状态">
            <el-tag :type="getStatusType(currentSchedule.status)">
              {{ getStatusName(currentSchedule.status) }}
            </el-tag>
          </el-descriptions-item>
          <el-descriptions-item label="带队领导">
            {{ currentSchedule.leaderName }}
          </el-descriptions-item>
          <el-descriptions-item label="督导成员">
            {{ currentSchedule.memberCount || (currentSchedule.memberNames ? currentSchedule.memberNames.length : 0) }}人
          </el-descriptions-item>
          <el-descriptions-item label="创建时间" :span="2">
            {{ formatDateTime(currentSchedule.createdTime) }}
          </el-descriptions-item>
        </el-descriptions>

        <div v-if="currentSchedule.memberNames && currentSchedule.memberNames.length > 0" class="member-list">
          <h4>督导成员列表：</h4>
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
import { showSuccessMessage, showErrorMessage, handleApiError } from '@/utils/error-handler'
import { supervisionScheduleAPI } from '@/api'
import ScheduleDialog from '@/components/supervision/ScheduleDialog.vue'
import { 
  SUPERVISION_STATUS,
  SUPERVISION_STATUS_MAP
} from '@/constants'
import { PAGINATION } from '@/constants/common'
import { useViewMode } from '@/hooks/useViewMode'
import { useViewModeStore } from '@/store/modules/viewMode'

// 搜索表单
const searchForm = reactive({
  dateRange: [] as string[],
  status: ''
})

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

// 分页信息
const pagination = reactive({
  current: 1,
  size: 6, // 默认卡片视图的分页大小
  total: 0
})

// 督导安排数据
const scheduleList = ref<any[]>([])
const loading = ref(false)

// 对话框状态
const dialogVisible = ref(false)
const detailVisible = ref(false)
const isEdit = ref(false)
const currentSchedule = ref<any>(null)

// 获取状态类型
const getStatusType = (status: string) => {
  return SUPERVISION_STATUS_MAP[status]?.type || 'info'
}

// 获取合并状态类型
const getProgressStatusType = (progressStatus: string) => {
  switch (progressStatus) {
    case '未开始':
      return 'info'
    case '汇总中':
      return 'warning'
    case '已完成':
      return 'success'
    case '手动触发':
      return 'danger'
    default:
      return 'info'
  }
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

// 加载督导安排列表
const loadScheduleList = async () => {
  loading.value = true
  try {
    const params: any = {
      current: pagination.current,
      size: pagination.size
    }

    if (searchForm.dateRange && searchForm.dateRange.length === 2) {
      params.startDate = searchForm.dateRange[0]
      params.endDate = searchForm.dateRange[1]
    }

    if (searchForm.status) {
      params.status = searchForm.status
    }

    const response: any = await supervisionScheduleAPI.getScheduleList(params)
    if (response && response.code === 200) {
      scheduleList.value = response.data.records || []
      pagination.total = response.data.total || 0
    }
  } catch (error: any) {
    handleApiError(error, '加载督导安排列表失败')
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
  currentSchedule.value = null
  dialogVisible.value = true
}

// 编辑督导安排
const editSchedule = (row: any) => {
  isEdit.value = true
  currentSchedule.value = { ...row }
  dialogVisible.value = true
}

// 查看督导安排详情
const viewSchedule = async (row: any) => {
  try {
    const response: any = await supervisionScheduleAPI.getScheduleDetail(row.id)
    if (response && response.code === 200) {
      currentSchedule.value = response.data
      detailVisible.value = true
    }
  } catch (error: any) {
    handleApiError(error, '获取督导安排详情失败')
  }
}

// 删除督导安排
const deleteSchedule = async (row: any) => {
  try {
    await ElMessageBox.confirm(
      `确定要删除督导安排吗？\n日期：${formatDate(row.supervisionDate)}\n星期：${row.weekDay}\n节次：第${row.period}节`,
      '确认删除',
      {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }
    )

    const response: any = await supervisionScheduleAPI.deleteSchedule(row.id)
    if (response && response.code === 200) {
      showSuccessMessage(response, '删除成功')
    } else {
      showErrorMessage(response, '删除失败')
    }
    loadScheduleList()
  } catch (error: any) {
    if (error !== 'cancel') {
      handleApiError(error, '删除失败')
    }
  }
}

// 开始督导
const startSchedule = async (row: any) => {
  try {
    await ElMessageBox.confirm(
      `确定要开始督导吗？\n日期：${formatDate(row.supervisionDate)}\n星期：${row.weekDay}\n节次：第${row.period}节`,
      '确认开始',
      {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }
    )

    const response: any = await supervisionScheduleAPI.updateScheduleStatus(row.id, {
      status: 'in_progress',
      action: 'start'
    })
    if (response && response.code === 200) {
      showSuccessMessage(response, '督导已开始')
    } else {
      showErrorMessage(response, '开始督导失败')
    }
    loadScheduleList()
  } catch (error: any) {
    if (error !== 'cancel') {
      handleApiError(error, '开始督导失败')
    }
  }
}

// 跳转到审核页面
const goToApproval = (row: any) => {
  // 使用路由跳转到审核页面，携带督导安排ID
  router.push({
    name: 'SupervisionApproval',
    query: { scheduleId: row.id }
  })
}

// 对话框成功回调
const handleDialogSuccess = () => {
  loadScheduleList()
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
})

// 组件卸载时移除事件监听
onUnmounted(() => {
  window.removeEventListener('view-mode-change', handleViewModeChange as EventListener)
})
</script>

<style scoped>
.supervision-schedule {
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
  min-height: 0; /* 重要：允许flex子元素收缩 */
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

.member-list {
  margin-top: 20px;
  padding-top: 20px;
  border-top: 1px solid #f0f0f0;
}

.member-list h4 {
  margin-bottom: 12px;
  color: #333;
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

.schedule-card__progress {
  background: #f8f9fa;
  padding: 11px;
  border-radius: 8px;
  border: 1px solid #e9ecef;
}

.progress-info {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 13px;
  color: #606266;
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