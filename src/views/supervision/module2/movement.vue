<template>
  <div class="staff-movement">
    <div class="page-content">
      <div class="movement-container">
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
            <el-form-item label="异动类型">
              <el-select v-model="searchForm.movementType" placeholder="选择类型" @change="handleSearch">
                <el-option label="全部" value="" />
                <el-option 
                  v-for="(label, type) in MOVEMENT_TYPE_MAP" 
                  :key="type" 
                  :label="label" 
                  :value="type" 
                />
              </el-select>
            </el-form-item>
            <el-form-item label="审批状态">
              <el-select v-model="searchForm.approvalStatus" placeholder="选择状态" @change="handleSearch">
                <el-option label="全部" value="" />
                <el-option 
                  v-for="(statusInfo, status) in APPROVAL_STATUS_MAP" 
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
                新增异动申请
              </el-button>
            </el-form-item>
          </el-form>
        </div>
        
        <div class="movement-table">
          <el-table 
            :data="movementList" 
            style="width: 100%" 
            height="100%"
            v-loading="loading"
            fit
            table-layout="fixed"
            border 
          >
            <el-table-column prop="staffName" label="教职工" width="120" />
            <el-table-column prop="movementType" label="异动类型" width="100">
              <template #default="scope">
                <el-tag :type="getMovementTypeTag(scope.row.movementType)">
                  {{ getMovementTypeName(scope.row.movementType) }}
                </el-tag>
              </template>
            </el-table-column>
            <el-table-column prop="startDate" label="开始日期" width="120">
              <template #default="scope">
                {{ formatDate(scope.row.startDate) }}
              </template>
            </el-table-column>
            <el-table-column prop="endDate" label="结束日期" width="120">
              <template #default="scope">
                {{ formatDate(scope.row.endDate) }}
              </template>
            </el-table-column>
            <el-table-column prop="duration" label="时长" width="100">
              <template #default="scope">
                {{ calculateDuration(scope.row.startDate, scope.row.endDate) }}
              </template>
            </el-table-column>
            <el-table-column prop="reason" label="异动原因" min-width="200" show-overflow-tooltip />
            <el-table-column prop="approvalStatus" label="审批状态" width="100">
              <template #default="scope">
                <el-tag :type="getApprovalStatusType(scope.row.approvalStatus)">
                  {{ getApprovalStatusName(scope.row.approvalStatus) }}
                </el-tag>
              </template>
            </el-table-column>
            <el-table-column prop="approvedBy" label="审批人" width="120" />
            <el-table-column prop="approvedAt" label="审批时间" width="160">
              <template #default="scope">
                {{ scope.row.approvedAt ? formatDateTime(scope.row.approvedAt) : '-' }}
              </template>
            </el-table-column>
            <el-table-column label="操作" min-width="300" fixed="right">
              <template #default="scope">
                <el-button size="small" @click="viewMovement(scope.row)">查看</el-button>
                <el-button 
                  v-if="scope.row.approvalStatus === 'pending'" 
                  size="small" 
                  type="primary" 
                  @click="editMovement(scope.row)"
                  v-role="['ADMIN_OFFICE_DIRECTOR', 'STUDENT_ADMIN']"
                >
                  编辑
                </el-button>
                <el-button 
                  v-if="scope.row.approvalStatus === 'pending'" 
                  size="small" 
                  type="success" 
                  @click="approveMovement(scope.row)"
                  v-role="['ADMIN_OFFICE_DIRECTOR', 'STUDENT_ADMIN']"
                >
                  审批
                </el-button>
                <el-button 
                  size="small" 
                  type="danger" 
                  @click="deleteMovement(scope.row)"
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
              :page-sizes="[10, 20, 50, 100]"
              :total="pagination.total"
              layout="total, sizes, prev, pager, next, jumper"
              @size-change="handleSizeChange"
              @current-change="handleCurrentChange"
            />
          </div>
        </div>
      </div>
    </div>

    <!-- 异动申请对话框 -->
    <el-dialog
      :title="isEdit ? '编辑异动申请' : '新增异动申请'"
      v-model="dialogVisible"
      width="700px"
      :append-to-body="true"
      :lock-scroll="true"
      :close-on-click-modal="false"
    >
      <el-form :model="movementForm" :rules="rules" ref="movementFormRef" label-width="120px">
        <el-form-item label="教职工" prop="staffId">
          <el-select v-model="movementForm.staffId" placeholder="选择教职工" style="width: 100%">
            <el-option 
              v-for="staff in staffList" 
              :key="staff.id" 
              :label="`${staff.realName} (${staff.department})`" 
              :value="staff.id" 
            />
          </el-select>
        </el-form-item>
        <el-form-item label="异动类型" prop="movementType">
          <el-select v-model="movementForm.movementType" placeholder="选择异动类型" style="width: 100%">
            <el-option label="出差" value="business_trip" />
            <el-option label="请假" value="leave" />
            <el-option label="轮休" value="rotation" />
          </el-select>
        </el-form-item>
        <el-form-item label="时间范围" prop="dateRange">
          <el-date-picker
            v-model="movementForm.dateRange"
            type="daterange"
            range-separator="至"
            start-placeholder="开始日期"
            end-placeholder="结束日期"
            format="YYYY-MM-DD"
            value-format="YYYY-MM-DD"
            style="width: 100%"
          />
        </el-form-item>
        <el-form-item label="异动原因" prop="reason">
          <el-input 
            v-model="movementForm.reason" 
            type="textarea" 
            :rows="4" 
            placeholder="请详细说明异动原因"
          />
        </el-form-item>
        <el-form-item label="附件" prop="attachments">
          <el-upload
            action="#"
            :auto-upload="false"
            :on-change="handleFileChange"
            :file-list="fileList"
            multiple
          >
            <el-button type="primary">选择文件</el-button>
            <template #tip>
              <div class="el-upload__tip">
                支持jpg/png/pdf/doc/docx格式，单个文件不超过10MB
              </div>
            </template>
          </el-upload>
        </el-form-item>
      </el-form>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="dialogVisible = false">取消</el-button>
          <el-button type="primary" @click="submitMovement">确定</el-button>
        </span>
      </template>
    </el-dialog>

    <!-- 审批对话框 -->
    <el-dialog
      title="异动申请审批"
      v-model="approvalDialogVisible"
      width="500px"
      :append-to-body="true"
      :lock-scroll="true"
      :close-on-click-modal="false"
    >
      <el-form :model="approvalForm" :rules="approvalRules" ref="approvalFormRef" label-width="100px">
        <el-form-item label="审批结果" prop="approvalResult">
          <el-radio-group v-model="approvalForm.approvalResult">
            <el-radio :value="APPROVAL_STATUS.APPROVED">批准</el-radio>
            <el-radio :value="APPROVAL_STATUS.REJECTED">拒绝</el-radio>
          </el-radio-group>
        </el-form-item>
        <el-form-item label="审批备注" prop="approvalNote">
          <el-input 
            v-model="approvalForm.approvalNote" 
            type="textarea" 
            :rows="3" 
            placeholder="请输入审批意见"
          />
        </el-form-item>
      </el-form>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="approvalDialogVisible = false">取消</el-button>
          <el-button type="primary" @click="submitApproval">确定</el-button>
        </span>
      </template>
    </el-dialog>

    <!-- 异动申请详情对话框 -->
    <el-dialog
      title="异动申请详情"
      v-model="detailVisible"
      width="600px"
      :append-to-body="true"
      :lock-scroll="true"
      :close-on-click-modal="false"
    >
      <div v-if="currentMovement" class="movement-detail">
        <el-descriptions :column="2" border>
          <el-descriptions-item label="教职工">
            {{ currentMovement.staffName }}
          </el-descriptions-item>
          <el-descriptions-item label="异动类型">
            <el-tag :type="getMovementTypeTag(currentMovement.movementType)">
              {{ getMovementTypeName(currentMovement.movementType) }}
            </el-tag>
          </el-descriptions-item>
          <el-descriptions-item label="开始日期">
            {{ formatDate(currentMovement.startDate) }}
          </el-descriptions-item>
          <el-descriptions-item label="结束日期">
            {{ formatDate(currentMovement.endDate) }}
          </el-descriptions-item>
          <el-descriptions-item label="时长">
            {{ calculateDuration(currentMovement.startDate, currentMovement.endDate) }}
          </el-descriptions-item>
          <el-descriptions-item label="审批状态">
            <el-tag :type="getApprovalStatusType(currentMovement.approvalStatus)">
              {{ getApprovalStatusName(currentMovement.approvalStatus) }}
            </el-tag>
          </el-descriptions-item>
          <el-descriptions-item label="异动原因" :span="2">
            {{ currentMovement.reason }}
          </el-descriptions-item>
          <el-descriptions-item label="审批人" v-if="currentMovement.approvedBy">
            {{ currentMovement.approvedBy }}
          </el-descriptions-item>
          <el-descriptions-item label="审批时间" v-if="currentMovement.approvedAt">
            {{ formatDateTime(currentMovement.approvedAt) }}
          </el-descriptions-item>
          <el-descriptions-item label="审批备注" :span="2" v-if="currentMovement.approvalNote">
            {{ currentMovement.approvalNote }}
          </el-descriptions-item>
        </el-descriptions>
      </div>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { Plus } from '@element-plus/icons-vue'
import { ElMessageBox } from 'element-plus'
import { staffMovementAPI, userAPI } from '@/api'
import { showSuccessMessage, showErrorMessage, handleApiError } from '@/utils/error-handler'
import { 
  MOVEMENT_TYPE, 
  MOVEMENT_TYPE_MAP,
  APPROVAL_STATUS,
  APPROVAL_STATUS_MAP
} from '@/constants'

// 搜索表单
const searchForm = reactive({
  dateRange: [] as string[],
  movementType: '',
  approvalStatus: ''
})

// 分页信息
const pagination = reactive({
  current: 1,
  size: 10,
  total: 0,
  pages: 0
})

// 异动记录数据
const movementList = ref<any[]>([])
const staffList = ref<any[]>([])
const loading = ref(false)

// 对话框状态
const dialogVisible = ref(false)
const approvalDialogVisible = ref(false)
const detailVisible = ref(false)
const isEdit = ref(false)
const currentMovement = ref<any>(null)
const movementFormRef = ref()
const approvalFormRef = ref()

// 异动表单
const movementForm = reactive({
  staffId: '',
  movementType: '',
  dateRange: [] as string[],
  reason: ''
})

// 审批表单
const approvalForm = reactive({
  approvalResult: '',
  approvalNote: ''
})

// 文件列表
const fileList = ref<any[]>([])

// 表单验证规则
const rules = {
  staffId: [{ required: true, message: '请选择教职工', trigger: 'change' }],
  movementType: [{ required: true, message: '请选择异动类型', trigger: 'change' }],
  dateRange: [{ required: true, message: '请选择时间范围', trigger: 'change' }],
  reason: [{ required: true, message: '请输入异动原因', trigger: 'blur' }]
}

// 审批表单验证规则
const approvalRules = {
  approvalResult: [{ required: true, message: '请选择审批结果', trigger: 'change' }],
  approvalNote: [{ required: true, message: '请输入审批备注', trigger: 'blur' }]
}

// 获取异动类型标签样式
const getMovementTypeTag = (type: string) => {
  const tagMap: Record<string, string> = {
    [MOVEMENT_TYPE.BUSINESS_TRIP]: 'primary',
    [MOVEMENT_TYPE.LEAVE]: 'warning',
    [MOVEMENT_TYPE.ROTATION]: 'info'
  }
  return tagMap[type] || 'info'
}

// 获取异动类型名称
const getMovementTypeName = (type: string) => {
  return MOVEMENT_TYPE_MAP[type] || '未知'
}

// 获取审批状态类型
const getApprovalStatusType = (status: string) => {
  return APPROVAL_STATUS_MAP[status]?.type || 'info'
}

// 获取审批状态名称
const getApprovalStatusName = (status: string) => {
  return APPROVAL_STATUS_MAP[status]?.label || '未知'
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

// 计算时长
const calculateDuration = (startDate: string, endDate: string) => {
  if (!startDate || !endDate) return ''
  const start = new Date(startDate)
  const end = new Date(endDate)
  const diffTime = Math.abs(end.getTime() - start.getTime())
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
  return `${diffDays}天`
}

// 加载异动记录列表
const loadMovementList = async () => {
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
    if (searchForm.movementType) {
      params.movementType = searchForm.movementType
    }
    if (searchForm.approvalStatus) {
      params.approvalStatus = searchForm.approvalStatus
    }
    
    const response = await staffMovementAPI.getMovementList(params)
    if (response.code === 200 && response.data) {
      movementList.value = response.data.records || []
      pagination.total = response.data.total || 0
      pagination.pages = response.data.pages || 0
    }
  } catch (error: any) {
    handleApiError(error, '加载异动记录列表失败')
  } finally {
    loading.value = false
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
  loadMovementList()
}

// 重置搜索
const resetSearch = () => {
  searchForm.dateRange = []
  searchForm.movementType = ''
  searchForm.approvalStatus = ''
  handleSearch()
}

// 分页处理
const handleSizeChange = (size: number) => {
  pagination.size = size
  pagination.current = 1
  loadMovementList()
}

const handleCurrentChange = (current: number) => {
  pagination.current = current
  loadMovementList()
}

// 显示创建对话框
const showCreateDialog = () => {
  isEdit.value = false
  Object.assign(movementForm, {
    staffId: '',
    movementType: '',
    dateRange: [],
    reason: ''
  })
  fileList.value = []
  dialogVisible.value = true
}

// 编辑异动申请
const editMovement = (row: any) => {
  isEdit.value = true
  currentMovement.value = row
  Object.assign(movementForm, {
    staffId: row.staffId,
    movementType: row.movementType,
    dateRange: [row.startDate, row.endDate],
    reason: row.reason
  })
  dialogVisible.value = true
}

// 查看异动申请详情
const viewMovement = (row: any) => {
  currentMovement.value = row
  detailVisible.value = true
}

// 审批异动申请
const approveMovement = (row: any) => {
  currentMovement.value = row
  Object.assign(approvalForm, {
    approvalResult: '',
    approvalNote: ''
  })
  approvalDialogVisible.value = true
}

// 删除异动申请
const deleteMovement = async (row: any) => {
  try {
    await ElMessageBox.confirm(
      `确定要删除异动申请吗？\n教职工：${row.staffName}\n类型：${getMovementTypeName(row.movementType)}`,
      '确认删除',
      {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }
    )

    const response: any = await staffMovementAPI.deleteMovement(row.id)
    showSuccessMessage(response, '删除成功')
    loadMovementList()
  } catch (error: any) {
    if (error !== 'cancel') {
      handleApiError(error, '删除失败')
    }
  }
}

// 文件上传处理
const handleFileChange = (file: any) => {
  fileList.value.push(file)
}

// 提交异动申请
const submitMovement = async () => {
  try {
    await movementFormRef.value.validate()
    
    const formData: any = {
      staffId: movementForm.staffId,
      movementType: movementForm.movementType,
      startDate: movementForm.dateRange[0],
      endDate: movementForm.dateRange[1],
      reason: movementForm.reason
    }
    
    if (isEdit.value && currentMovement.value) {
      const response: any = await staffMovementAPI.updateMovement(currentMovement.value.id, formData)
      showSuccessMessage(response, '编辑成功')
    } else {
      const response: any = await staffMovementAPI.createMovement(formData)
      showSuccessMessage(response, '申请提交成功')
    }
    dialogVisible.value = false
    loadMovementList()
  } catch (error: any) {
    handleApiError(error, '提交失败，请检查表单')
  }
}

// 提交审批
const submitApproval = async () => {
  try {
    await approvalFormRef.value.validate()
    
    const response: any = await staffMovementAPI.approveMovement(currentMovement.value.id, {
      action: approvalForm.approvalResult as 'approved' | 'rejected',
      approvalNote: approvalForm.approvalNote
    })
    showSuccessMessage(response, '审批提交成功')
    approvalDialogVisible.value = false
    loadMovementList()
  } catch (error: any) {
    handleApiError(error, '审批提交失败，请检查表单')
  }
}

// 组件挂载时加载数据
onMounted(() => {
  loadMovementList()
  loadStaffList()
})
</script>

<style scoped>
.staff-movement {
  padding: 3px 3px 3px 3px;
  display: flex;
  flex-direction: column;
}

.movement-container {
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

.movement-table {
  margin-top: 3px;
  flex: 1;
  display: flex;
  flex-direction: column;
  min-height: 0;
}

.movement-table :deep(.el-table__footer-wrapper) {
  margin-bottom: 0;
}

.movement-table :deep(.el-table__fixed-footer-wrapper) {
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

.movement-detail {
  padding: 20px 0;
}

.dialog-footer {
  text-align: right;
}
</style> 