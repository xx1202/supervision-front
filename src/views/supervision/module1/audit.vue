<template>
  <div class="supervision-audit">
    <div class="page-content">
      <div class="audit-container">
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
            <el-form-item label="带队领导">
              <el-input
                v-model="searchForm.leaderName"
                placeholder="输入带队领导姓名"
                clearable
                @keyup.enter="handleSearch"
              />
            </el-form-item>
            <el-form-item>
              <el-button type="primary" @click="handleSearch">搜索</el-button>
              <el-button @click="resetSearch">重置</el-button>
            </el-form-item>
          </el-form>
        </div>

        <!-- 卡片视图 -->
        <div v-if="viewMode === 'card'" class="task-cards-container" v-loading="loading">
          <div v-if="auditList.length === 0 && !loading" class="empty-state">
            <el-empty description="暂无督导任务" />
          </div>
          
          <div v-else class="task-cards">
            <div 
              v-for="task in auditList" 
              :key="task.id" 
              class="task-card"
              :class="{ 'task-card--completed': task.status === SUPERVISION_STATUS.COMPLETED }"
            >
              <div class="task-card__header">
                <div class="task-card__title">
                  <h3>{{ formatDate(task.supervisionDate) }} {{ task.weekDay }}</h3>
                  <span class="task-card__period">第{{ task.period }}节</span>
                </div>
                <div class="task-card__status">
                  <el-tag :type="getStatusType(task.status)" size="large">
                    {{ getStatusName(task.status) }}
                  </el-tag>
                </div>
              </div>

              <div class="task-card__content">
                <div class="task-card__info">
                  <div class="info-item">
                    <el-icon><User /></el-icon>
                    <span>带队领导：{{ task.leaderName }}</span>
                  </div>
                  <div class="info-item">
                    <el-icon><User /></el-icon>
                    <span>督导成员：{{ task.memberCount }}人</span>
                  </div>
                  <div class="info-item">
                    <el-icon><Calendar /></el-icon>
                    <span>创建时间：{{ formatDateTime(task.createdTime) }}</span>
                  </div>
                </div>

                <div class="task-card__progress">
                  <div class="progress-info">
                    <span>汇总进度：</span>
                    <span class="progress-text">{{ task.completedClassrooms }} / {{ task.totalClassrooms }}</span>
                  </div>
                  <el-progress 
                    :percentage="getProgressPercentage(task.completedClassrooms, task.totalClassrooms)"
                    :color="getProgressColor(task.completedClassrooms, task.totalClassrooms)"
                    :show-text="false"
                  />
                </div>
              </div>

              <div class="task-card__actions">
                <el-button @click="viewSchedule(task)" size="small">
                  <el-icon><View /></el-icon>
                  查看详情
                </el-button>
                <el-button 
                  v-if="task.status === 'in_progress' || task.status === 'completed'" 
                  @click="goToApproval(task)"
                  size="small" 
                  type="success"
                  v-role="['ADMIN_OFFICE_DIRECTOR','ACADEMIC_ADMIN', 'STUDENT_ADMIN']"
                >
                  <el-icon><Check /></el-icon>
                  审核任务
                </el-button>
              </div>
            </div>
          </div>
        </div>

        <!-- 表格视图 -->
        <div v-if="viewMode === 'table'" class="task-table-container" v-loading="loading">
          <el-table
            :data="auditList"
            style="width: 100%"
            height="100%"
            fit
            table-layout="fixed"
            border
          >
            <el-table-column prop="supervisionDate" label="督导日期" width="120">
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
                <el-tag :type="getStatusType(scope.row.status)" size="large">
                  {{ getStatusName(scope.row.status) }}
                </el-tag>
              </template>
            </el-table-column>
            <el-table-column label="汇总进度" width="180">
              <template #default="scope">
                <div style="display: flex; align-items: center; gap: 8px;">
                  <span>{{ scope.row.completedClassrooms }} / {{ scope.row.totalClassrooms }}</span>
                  <el-progress 
                    :percentage="getProgressPercentage(scope.row.completedClassrooms, scope.row.totalClassrooms)"
                    :color="getProgressColor(scope.row.completedClassrooms, scope.row.totalClassrooms)"
                    :show-text="false"
                    style="flex: 1; min-width: 80px;"
                  />
                </div>
              </template>
            </el-table-column>
            <el-table-column prop="createdTime" label="创建时间" width="160">
              <template #default="scope">
                {{ formatDateTime(scope.row.createdTime) }}
              </template>
            </el-table-column>
            <el-table-column label="操作" min-width="200" fixed="right">
              <template #default="scope">
                <el-button @click="viewSchedule(scope.row)" size="small">
                  <el-icon><View /></el-icon>
                  查看详情
                </el-button>
                <el-button 
                  v-if="scope.row.status === 'in_progress' || scope.row.status === 'completed'" 
                  @click="goToApproval(scope.row)"
                  size="small" 
                  type="success"
                  v-role="['ADMIN_OFFICE_DIRECTOR','ACADEMIC_ADMIN', 'STUDENT_ADMIN']"
                >
                  <el-icon><Check /></el-icon>
                  审核任务
                </el-button>
              </template>
            </el-table-column>
          </el-table>
        </div>

        <!-- 分页 -->
        <div class="pagination-wrapper" v-if="auditList.length > 0">
          <el-pagination
            v-model:current-page="pagination.current"
            v-model:page-size="pagination.size"
              :page-sizes="viewMode === 'card' ? [6, 12, 24, 48] : [10, 20, 50, 100]"
            :total="pagination.total"
            layout="total, sizes, prev, pager, next, jumper"
            @size-change="handleSizeChange"
            @current-change="handleCurrentChange"
          />
        </div>
      </div>
    </div>

    <!-- 督导任务详情对话框 -->
    <el-dialog
      title="督导任务详情"
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
import { ref, reactive, onMounted, onUnmounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { ElMessageBox } from 'element-plus'
import { handleApiError } from '@/utils/error-handler'
import { User, Calendar, View, Check } from '@element-plus/icons-vue'
import { supervisionScheduleAPI } from '@/api'
import { 
  SUPERVISION_STATUS,
  SUPERVISION_STATUS_MAP
} from '@/constants'
import { useViewMode } from '@/hooks/useViewMode'
import { useViewModeStore } from '@/store/modules/viewMode'

// 搜索表单
const searchForm = reactive({
  dateRange: [] as string[],
  status: '',
  leaderName: ''
})

// 分页信息
const pagination = reactive({
  current: 1,
  size: 6, // 改为6，适合卡片布局
  total: 0
})

// 督导任务数据
const auditList = ref<any[]>([])
const loading = ref(false)

// 对话框状态
const detailVisible = ref(false)
const currentSchedule = ref<any>(null)

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
    loadAuditList()
  }
)

// 监听全局视图模式变化事件
const handleViewModeChange = (event: CustomEvent) => {
  if (event.detail.path === route.path) {
    viewMode.value = event.detail.mode
  }
}


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

// 计算进度百分比
const getProgressPercentage = (completed: number, total: number) => {
  if (total === 0) return 0
  return Math.round((completed / total) * 100)
}

// 获取进度条颜色
const getProgressColor = (completed: number, total: number) => {
  const percentage = getProgressPercentage(completed, total)
  if (percentage === 100) return '#67c23a'
  if (percentage >= 50) return '#e6a23c'
  return '#f56c6c'
}

// 加载督导任务列表
const loadAuditList = async () => {
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

    if (searchForm.leaderName) {
      params.leaderName = searchForm.leaderName
    }

    const response: any = await supervisionScheduleAPI.getScheduleList(params)
    if (response && response.code === 200) {
      auditList.value = response.data.records || []
      pagination.total = response.data.total || 0
    }
  } catch (error: any) {
    handleApiError(error, '加载督导任务列表失败')
  } finally {
    loading.value = false
  }
}


// 搜索处理
const handleSearch = () => {
  pagination.current = 1
  loadAuditList()
}

// 重置搜索
const resetSearch = () => {
  searchForm.dateRange = []
  searchForm.status = ''
  searchForm.leaderName = ''
  handleSearch()
}

// 分页处理
const handleSizeChange = (size: number) => {
  pagination.size = size
  pagination.current = 1
  loadAuditList()
}

const handleCurrentChange = (current: number) => {
  pagination.current = current
  loadAuditList()
}

// 查看督导任务详情
const viewSchedule = async (row: any) => {
  try {
    const response: any = await supervisionScheduleAPI.getScheduleDetail(row.id)
    if (response && response.code === 200) {
      currentSchedule.value = response.data
      detailVisible.value = true
    }
  } catch (error: any) {
    handleApiError(error, '获取督导任务详情失败')
  }
}

// 跳转到审核页面
const goToApproval = (row: any) => {
  // 使用路由跳转到审核页面，携带督导任务ID
  router.push({
    name: 'SupervisionApproval',
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
  
  loadAuditList()
})

// 组件卸载时移除事件监听
onUnmounted(() => {
  window.removeEventListener('view-mode-change', handleViewModeChange as EventListener)
})
</script>

<style scoped>
.supervision-audit {
  padding: 3px 3px 3px 3px;
  display: flex;
  flex-direction: column;
}

.audit-container {
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

.audit-table {
  margin-top: 3px;
  flex: 1;
  display: flex;
  flex-direction: column;
  min-height: 0; /* 重要：允许flex子元素收缩 */
}

.audit-table :deep(.el-table__footer-wrapper) {
  margin-bottom: 0;
}

.task-table-container {
  margin-top: 3px;
  flex: 1;
  display: flex;
  flex-direction: column;
  min-height: 0;
}

.task-table-container :deep(.el-table__footer-wrapper) {
  margin-bottom: 0;
}

.audit-table :deep(.el-table__fixed-footer-wrapper) {
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

.record-detail {
  padding: 20px 0;
}

.evaluation-section {
  margin-top: 20px;
  padding-top: 20px;
  border-top: 1px solid #f0f0f0;
}

.evaluation-section h4 {
  margin-bottom: 12px;
  color: #333;
  font-weight: 600;
}

.remarks-section {
  margin-top: 20px;
  padding-top: 20px;
  border-top: 1px solid #f0f0f0;
}

.remarks-section h4 {
  margin-bottom: 12px;
  color: #333;
  font-weight: 600;
}

.remarks-section p {
  margin: 0;
  color: #666;
  line-height: 1.6;
}

.audit-info-section {
  margin-top: 20px;
  padding-top: 20px;
  border-top: 1px solid #f0f0f0;
}

.audit-info-section h4 {
  margin-bottom: 12px;
  color: #333;
  font-weight: 600;
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

/* 任务卡片样式 */
.task-cards-container {
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

.task-cards {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(400px, 1fr));
  gap: 16px;
  padding: 0 8px;
}

.task-card {
  background: white;
  border: 1px solid #e4e7ed;
  border-radius: 12px;
  padding: 18px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
  transition: all 0.3s ease;
  position: relative;
  overflow: hidden;
}

.task-card:hover {
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.12);
  transform: translateY(-2px);
}

.task-card--completed {
  border-left: 4px solid #67c23a;
}

.task-card__header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 14px;
}

.task-card__title h3 {
  margin: 0 0 4px 0;
  font-size: 17px;
  font-weight: 600;
  color: #303133;
}

.task-card__period {
  font-size: 14px;
  color: #909399;
  background: #f5f7fa;
  padding: 2px 8px;
  border-radius: 4px;
}

.task-card__status {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: 4px;
}

.task-card__content {
  margin-bottom: 14px;
}

.task-card__info {
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

.task-card__progress {
  background: #f8f9fa;
  padding: 11px;
  border-radius: 8px;
  border: 1px solid #e9ecef;
}

.progress-info {
  display: flex;
  justify-content: space-between;
  margin-bottom: 7px;
  font-size: 13px;
  color: #606266;
}

.progress-text {
  font-weight: 600;
  color: #303133;
}

.task-card__actions {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
  margin-top: 4px;
}

.task-card__actions .el-button {
  flex: 1;
  min-width: 80px;
}
</style>