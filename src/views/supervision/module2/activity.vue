<template>
  <div class="research-office-activity">
    <div class="page-content">
      <div class="activity-container">
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
            <el-form-item label="教研室">
              <el-select v-model="searchForm.officeId" placeholder="选择教研室" @change="handleSearch">
                <el-option label="全部" value="" />
                <el-option 
                  v-for="office in officeList" 
                  :key="office.id" 
                  :label="office.officeName" 
                  :value="office.id" 
                />
              </el-select>
            </el-form-item>
            <el-form-item label="活动状态">
              <el-select v-model="searchForm.status" placeholder="选择状态" @change="handleSearch">
                <el-option label="全部" value="" />
                <el-option 
                  v-for="(statusInfo, status) in RESEARCH_ACTIVITY_STATUS_MAP" 
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
                新增活动安排
              </el-button>
            </el-form-item>
          </el-form>
        </div>
        
        <div class="activity-table">
          <el-table 
            :data="activityList" 
            style="width: 100%" 
            height="100%"
            v-loading="loading"
            fit
            table-layout="fixed"
            border 
          >
            <el-table-column prop="activityDate" label="活动日期" width="120">
              <template #default="scope">
                {{ formatDate(scope.row.activityDate) }}
              </template>
            </el-table-column>
            <el-table-column prop="officeName" label="教研室" width="150" />
            <el-table-column prop="activityTheme" label="活动主题" min-width="200" show-overflow-tooltip />
            <el-table-column prop="expectedParticipants" label="预期参与人数" width="120">
              <template #default="scope">
                {{ scope.row.expectedParticipants ? scope.row.expectedParticipants.length : 0 }}人
              </template>
            </el-table-column>
            <el-table-column prop="status" label="状态" width="100">
              <template #default="scope">
                <el-tag :type="getStatusType(scope.row.status)">
                  {{ getStatusName(scope.row.status) }}
                </el-tag>
              </template>
            </el-table-column>
            <el-table-column prop="createdBy" label="创建人" width="120" />
            <el-table-column prop="createdTime" label="创建时间" width="160">
              <template #default="scope">
                {{ formatDateTime(scope.row.createdTime) }}
              </template>
            </el-table-column>
            <el-table-column label="操作" min-width="200" fixed="right">
              <template #default="scope">
                <el-button size="small" @click="viewActivity(scope.row)">查看</el-button>
                <el-button 
                  v-if="scope.row.status === RESEARCH_ACTIVITY_STATUS.PLANNED" 
                  size="small" 
                  type="primary" 
                  @click="editActivity(scope.row)"
                  v-role="['ADMIN_OFFICE_DIRECTOR']"
                >
                  编辑
                </el-button>
                <el-button 
                  v-if="scope.row.status === RESEARCH_ACTIVITY_STATUS.PLANNED" 
                  size="small" 
                  type="success" 
                  @click="completeActivity(scope.row)"
                  v-role="['ADMIN_OFFICE_DIRECTOR', 'SUPERVISOR']"
                >
                  完成活动
                </el-button>
                <el-button 
                  size="small" 
                  type="danger" 
                  @click="deleteActivity(scope.row)"
                  v-role="['ADMIN_OFFICE_DIRECTOR']"
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

    <!-- 活动安排对话框 -->
    <el-dialog
      :title="isEdit ? '编辑活动安排' : '新增活动安排'"
      v-model="dialogVisible"
      width="800px"
      :append-to-body="true"
      :lock-scroll="true"
      :close-on-click-modal="false"
    >
      <el-form :model="activityForm" :rules="rules" ref="activityFormRef" label-width="120px">
        <el-form-item label="活动日期" prop="activityDate">
          <el-date-picker
            v-model="activityForm.activityDate"
            type="date"
            placeholder="选择活动日期"
            format="YYYY-MM-DD"
            value-format="YYYY-MM-DD"
            style="width: 100%"
          />
        </el-form-item>
        <el-form-item label="教研室" prop="officeId">
          <el-select v-model="activityForm.officeId" placeholder="选择教研室" style="width: 100%">
            <el-option 
              v-for="office in officeList" 
              :key="office.id" 
              :label="office.officeName" 
              :value="office.id" 
            />
          </el-select>
        </el-form-item>
        <el-form-item label="活动主题" prop="activityTheme">
          <el-input 
            v-model="activityForm.activityTheme" 
            placeholder="请输入活动主题"
            style="width: 100%"
          />
        </el-form-item>
        <el-form-item label="活动内容" prop="activityContent">
          <el-input 
            v-model="activityForm.activityContent" 
            type="textarea" 
            :rows="4" 
            placeholder="请详细描述活动内容"
          />
        </el-form-item>
        <el-form-item label="预期参与人员" prop="expectedParticipants">
          <el-select
            v-model="activityForm.expectedParticipants"
            multiple
            filterable
            placeholder="选择预期参与人员"
            style="width: 100%"
          >
            <el-option 
              v-for="staff in staffList" 
              :key="staff.id" 
              :label="`${staff.realName} (${staff.department})`" 
              :value="staff.id" 
            />
          </el-select>
        </el-form-item>
      </el-form>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="dialogVisible = false">取消</el-button>
          <el-button type="primary" @click="submitActivity">确定</el-button>
        </span>
      </template>
    </el-dialog>

    <!-- 活动详情对话框 -->
    <el-dialog
      title="活动详情"
      v-model="detailVisible"
      width="700px"
      :append-to-body="true"
      :lock-scroll="true"
      :close-on-click-modal="false"
    >
      <div v-if="currentActivity" class="activity-detail">
        <el-descriptions :column="2" border>
          <el-descriptions-item label="活动日期">
            {{ formatDate(currentActivity.activityDate) }}
          </el-descriptions-item>
          <el-descriptions-item label="教研室">
            {{ currentActivity.officeName }}
          </el-descriptions-item>
          <el-descriptions-item label="活动主题" :span="2">
            {{ currentActivity.activityTheme }}
          </el-descriptions-item>
          <el-descriptions-item label="活动内容" :span="2">
            {{ currentActivity.activityContent || '无' }}
          </el-descriptions-item>
          <el-descriptions-item label="状态">
            <el-tag :type="getStatusType(currentActivity.status)">
              {{ getStatusName(currentActivity.status) }}
            </el-tag>
          </el-descriptions-item>
          <el-descriptions-item label="创建人">
            {{ currentActivity.createdBy }}
          </el-descriptions-item>
          <el-descriptions-item label="创建时间" :span="2">
            {{ formatDateTime(currentActivity.createdTime) }}
          </el-descriptions-item>
        </el-descriptions>

        <div v-if="currentActivity.expectedParticipants && currentActivity.expectedParticipants.length > 0" class="participants-section">
          <h4>预期参与人员：</h4>
          <el-tag 
            v-for="participant in currentActivity.expectedParticipants" 
            :key="participant"
            style="margin-right: 8px; margin-bottom: 8px"
          >
            {{ participant }}
          </el-tag>
        </div>

      </div>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { Plus } from '@element-plus/icons-vue'
import { ElMessageBox } from 'element-plus'
import { researchActivityAPI, officeAPI, userAPI } from '@/api'
import { showSuccessMessage, showErrorMessage, handleApiError } from '@/utils/error-handler'
import { 
  RESEARCH_ACTIVITY_STATUS,
  RESEARCH_ACTIVITY_STATUS_MAP
} from '@/constants/supervision'
import { PAGINATION } from '@/constants/common'

// 搜索表单
const searchForm = reactive({
  dateRange: [] as string[],
  officeId: '',
  status: ''
})

// 分页信息
const pagination = reactive({
  current: 1,
  size: 10,
  total: 0,
  pages: 0
})

// 活动记录数据
const activityList = ref<any[]>([])
const officeList = ref<any[]>([])
const staffList = ref<any[]>([])
const loading = ref(false)

// 对话框状态
const dialogVisible = ref(false)
const detailVisible = ref(false)
const isEdit = ref(false)
const currentActivity = ref<any>(null)
const activityFormRef = ref()

// 活动表单
const activityForm = reactive({
  activityDate: '',
  officeId: '',
  activityTheme: '',
  activityContent: '',
  expectedParticipants: [] as string[]
})

// 表单验证规则
const rules = {
  activityDate: [{ required: true, message: '请选择活动日期', trigger: 'change' }],
  officeId: [{ required: true, message: '请选择教研室', trigger: 'change' }],
  activityTheme: [{ required: true, message: '请输入活动主题', trigger: 'blur' }],
  expectedParticipants: [{ required: true, message: '请选择预期参与人员', trigger: 'change' }]
}

// 获取状态类型
const getStatusType = (status: string) => {
  return RESEARCH_ACTIVITY_STATUS_MAP[status]?.type || 'info'
}

// 获取状态名称
const getStatusName = (status: string) => {
  return RESEARCH_ACTIVITY_STATUS_MAP[status]?.label || '未知'
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

// 加载活动记录列表
const loadActivityList = async () => {
  loading.value = true
  try {
    const params: any = {
      page: pagination.current,
      size: pagination.size
    }
    
    if (searchForm.dateRange && searchForm.dateRange.length === 2) {
      params.startDate = searchForm.dateRange[0]
      params.endDate = searchForm.dateRange[1]
    }
    if (searchForm.officeId) {
      params.officeId = searchForm.officeId
    }
    if (searchForm.status) {
      params.status = searchForm.status
    }
    
    const response = await researchActivityAPI.getActivityList(params)
    if (response.code === 200 && response.data) {
      activityList.value = response.data.records || []
      pagination.total = response.data.total || 0
      pagination.pages = response.data.pages || 0
    }
  } catch (error: any) {
    handleApiError(error, '加载活动记录列表失败')
  } finally {
    loading.value = false
  }
}

// 加载教研室列表
const loadOfficeList = async () => {
  try {
    const response: any = await officeAPI.getOfficeList({ page: 1, size: 1000 })
    if (response.code === 200 && response.data) {
      officeList.value = response.data.records || []
    }
  } catch (error: any) {
    handleApiError(error, '加载教研室列表失败')
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
  loadActivityList()
}

// 重置搜索
const resetSearch = () => {
  searchForm.dateRange = []
  searchForm.officeId = ''
  searchForm.status = ''
  handleSearch()
}

// 分页处理
const handleSizeChange = (size: number) => {
  pagination.size = size
  pagination.current = 1
  loadActivityList()
}

const handleCurrentChange = (current: number) => {
  pagination.current = current
  loadActivityList()
}

// 显示创建对话框
const showCreateDialog = () => {
  isEdit.value = false
  Object.assign(activityForm, {
    activityDate: '',
    officeId: '',
    activityTheme: '',
    activityContent: '',
    expectedParticipants: []
  })
  dialogVisible.value = true
}

// 编辑活动安排
const editActivity = (row: any) => {
  isEdit.value = true
  currentActivity.value = row
  Object.assign(activityForm, {
    activityDate: row.activityDate,
    officeId: row.officeId,
    activityTheme: row.activityTheme,
    activityContent: row.activityContent,
    expectedParticipants: row.expectedParticipants || []
  })
  dialogVisible.value = true
}

// 查看活动详情
const viewActivity = (row: any) => {
  currentActivity.value = row
  detailVisible.value = true
}

// 完成活动
const completeActivity = async (row: any) => {
  try {
    await ElMessageBox.confirm(
      `确定要完成活动吗？\n主题：${row.activityTheme}\n日期：${formatDate(row.activityDate)}`,
      '确认完成',
      {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }
    )

    const response: any = await researchActivityAPI.updateActivityStatus(row.id, { status: RESEARCH_ACTIVITY_STATUS.COMPLETED })
    showSuccessMessage(response, '活动已完成')
    loadActivityList()
  } catch (error: any) {
    if (error !== 'cancel') {
      handleApiError(error, '操作失败')
    }
  }
}

// 删除活动安排
const deleteActivity = async (row: any) => {
  try {
    await ElMessageBox.confirm(
      `确定要删除活动安排吗？\n主题：${row.activityTheme}\n日期：${formatDate(row.activityDate)}`,
      '确认删除',
      {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }
    )

    const response: any = await researchActivityAPI.deleteActivity(row.id)
    showSuccessMessage(response, '删除成功')
    loadActivityList()
  } catch (error: any) {
    if (error !== 'cancel') {
      handleApiError(error, '删除失败')
    }
  }
}

// 提交活动安排
const submitActivity = async () => {
  try {
    await activityFormRef.value.validate()
    
    if (isEdit.value && currentActivity.value) {
      const response: any = await researchActivityAPI.updateActivity(currentActivity.value.id, activityForm)
      showSuccessMessage(response, '编辑成功')
    } else {
      const response: any = await researchActivityAPI.createActivity(activityForm)
      showSuccessMessage(response, '新增成功')
    }
    dialogVisible.value = false
    loadActivityList()
  } catch (error: any) {
    handleApiError(error, '提交失败，请检查表单')
  }
}

// 组件挂载时加载数据
onMounted(() => {
  loadActivityList()
  loadOfficeList()
  loadStaffList()
})
</script>

<style scoped>
.research-office-activity {
  padding: 3px 3px 3px 3px;
  display: flex;
  flex-direction: column;
}

.activity-container {
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

.activity-table {
  margin-top: 3px;
  flex: 1;
  display: flex;
  flex-direction: column;
  min-height: 0;
}

.activity-table :deep(.el-table__footer-wrapper) {
  margin-bottom: 0;
}

.activity-table :deep(.el-table__fixed-footer-wrapper) {
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

.activity-detail {
  padding: 20px 0;
}

.participants-section {
  margin-top: 20px;
  padding-top: 20px;
  border-top: 1px solid #f0f0f0;
}

.participants-section h4 {
  margin-bottom: 12px;
  color: #333;
}

.dialog-footer {
  text-align: right;
}
</style> 