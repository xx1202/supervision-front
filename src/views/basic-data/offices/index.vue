<template>
  <div class="offices-management">
    <div class="page-content">
      <div class="offices-container">
        <!-- 搜索和过滤区域 -->
        <div class="search-section">
          <el-form :model="searchForm" inline style="display: flex; align-items: center; justify-content: space-between;">
            <el-form-item label="办公室号">
              <el-input
                v-model="searchForm.officeNumber"
                placeholder="请输入办公室号"
                clearable
                @keyup.enter="handleSearch"
              />
            </el-form-item>
            <el-form-item label="部门">
              <el-input
                v-model="searchForm.department"
                placeholder="请输入部门名称"
                clearable
                @keyup.enter="handleSearch"
              />
            </el-form-item>
            <el-form-item label="楼层">
              <el-select v-model="searchForm.floor" placeholder="选择楼层" clearable>
                <el-option label="全部" value="" />
                <el-option
                  v-for="floor in 20"
                  :key="floor"
                  :label="`${floor}层`"
                  :value="floor"
                />
              </el-select>
            </el-form-item>
            <el-form-item label="状态">
              <el-select v-model="searchForm.status" placeholder="选择状态" clearable>
                <el-option label="全部" value="" />
                <el-option 
                  v-for="(statusInfo, status) in COMMON_STATUS_MAP" 
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
                新增办公室
              </el-button>
            </el-form-item>
          </el-form>
        </div>
        
        <div class="offices-table">
          <el-table 
            :data="officesList" 
            style="width: 100%" 
            height="100%"
            v-loading="loading"
            fit
            table-layout="fixed"
            border 
            @selection-change="handleSelectionChange"
          >
            <el-table-column type="selection" width="55" />
            <el-table-column prop="officeNumber" label="办公室号" width="120" />
            <el-table-column prop="officeName" label="办公室名称" width="150" />
            <el-table-column prop="department" label="所属部门" width="150" />
            <el-table-column prop="floor" label="楼层" width="80">
              <template #default="scope">
                {{ scope.row.floor }}层
              </template>
            </el-table-column>
            <el-table-column prop="location" label="方位" width="80">
              <template #default="scope">
                {{ getLocationName(scope.row.location) }}
              </template>
            </el-table-column>
            <el-table-column prop="capacity" label="容纳人数" width="100">
              <template #default="scope">
                {{ scope.row.capacity }}人
              </template>
            </el-table-column>
            <el-table-column prop="status" label="状态" width="100">
              <template #default="scope">
                <el-tag :type="getStatusType(scope.row.status)">
                  {{ getStatusName(scope.row.status) }}
                </el-tag>
              </template>
            </el-table-column>
            <el-table-column label="操作" min-width="250" fixed="right">
              <template #default="scope">
                <el-button size="small" @click="viewOffice(scope.row)">查看</el-button>
                <el-button 
                  size="small" 
                  type="primary" 
                  @click="editOffice(scope.row)"
                  v-role="['ADMIN_OFFICE_DIRECTOR','ACADEMIC_ADMIN', 'STUDENT_ADMIN']"
                >
                  编辑
                </el-button>
                
                <!-- 根据状态显示不同的操作按钮 -->
                <template v-if="Number(scope.row.status) === COMMON_STATUS.ENABLED">
                  <!-- 启用状态：显示禁用按钮 -->
                  <el-button 
                    size="small" 
                    type="warning"
                    @click="disableOffice(scope.row)"
                    v-role="['ADMIN_OFFICE_DIRECTOR','ACADEMIC_ADMIN', 'STUDENT_ADMIN']"
                  >
                    禁用
                  </el-button>
                </template>
                <template v-else-if="Number(scope.row.status) === COMMON_STATUS.DISABLED">
                  <!-- 禁用状态：显示启用按钮 -->
                  <el-button 
                    size="small" 
                    type="success"
                    @click="enableOffice(scope.row)"
                    v-role="['ADMIN_OFFICE_DIRECTOR','ACADEMIC_ADMIN', 'STUDENT_ADMIN']"
                  >
                    启用
                  </el-button>
                </template>
                
                <el-button 
                  size="small" 
                  type="danger" 
                  @click="deleteOffice(scope.row)"
                  v-role="['ADMIN_OFFICE_DIRECTOR','ACADEMIC_ADMIN', 'STUDENT_ADMIN']"
                >
                  删除
                </el-button>
              </template>
            </el-table-column>
          </el-table>

          <!-- 分页 -->
          <div class="pagination-wrapper">
            <el-button 
              type="danger" 
              :disabled="selectedOffices.length === 0"
              @click="batchDeleteOffices"
            >
              批量删除 ({{ selectedOffices.length }})
            </el-button>
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

    <!-- 办公室编辑对话框 -->
    <OfficeDialog
      v-model:modelValue ="dialogVisible"
      :is-edit="isEdit"
      :office-data="currentOffice"
      @success="handleDialogSuccess"
    />

    <!-- 办公室详情对话框 -->
    <el-dialog
      title="办公室详情"
      v-model="detailVisible"
      width="700px"
      :append-to-body="true"
      :lock-scroll="true"
      :close-on-click-modal="false"
    >
      <div v-if="currentOffice" class="office-detail">
        <el-descriptions :column="2" border>
          <el-descriptions-item label="办公室号">
            {{ currentOffice.officeNumber }}
          </el-descriptions-item>
          <el-descriptions-item label="办公室名称">
            {{ currentOffice.officeName }}
          </el-descriptions-item>
          <el-descriptions-item label="所属部门">
            {{ currentOffice.department }}
          </el-descriptions-item>
          <el-descriptions-item label="楼层">
            {{ currentOffice.floor }}层
          </el-descriptions-item>
          <el-descriptions-item label="方位">
            {{ getLocationName(currentOffice.location) }}
          </el-descriptions-item>
          <el-descriptions-item label="容纳人数">
            {{ currentOffice.capacity }}人
          </el-descriptions-item>
          <el-descriptions-item label="状态">
            <el-tag :type="getStatusType(currentOffice.status)">
              {{ getStatusName(currentOffice.status) }}
            </el-tag>
          </el-descriptions-item>
        </el-descriptions>

        <div v-if="currentOffice.staffList && currentOffice.staffList.length > 0" class="staff-list">
          <h4>员工列表：</h4>
          <el-tag 
            v-for="staff in currentOffice.staffList" 
            :key="staff.id"
            style="margin-right: 8px; margin-bottom: 8px"
          >
            {{ staff.realName }} ({{ staff.statusName }})
          </el-tag>
        </div>
        
        <div v-else class="staff-list">
          <h4>员工列表：</h4>
          <el-empty description="暂无员工信息" :image-size="60" />
        </div>
      </div>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { Plus } from '@element-plus/icons-vue'
import { ElMessageBox } from 'element-plus'
import { showSuccessMessage, showErrorMessage, handleApiError } from '@/utils/error-handler'
import { officeAPI } from '@/api'
import OfficeDialog from '@/components/basic-data/OfficeDialog.vue'
import { logger } from '@/utils/logger'
import { 
  COMMON_STATUS,
  COMMON_STATUS_MAP
} from '@/constants/common'
import { 
  ATTENDANCE_STATUS
} from '@/constants'

// 搜索表单
const searchForm = reactive({
  officeNumber: '',
  department: '',
  floor: '',
  status: ''
})

// 分页信息
const pagination = reactive({
  current: 1,
  size: 10,
  total: 0
})

// 办公室数据
const officesList = ref<any[]>([])
const loading = ref(false)
const selectedOffices = ref<any[]>([])

// 对话框状态
const dialogVisible = ref(false)
const detailVisible = ref(false)
const isEdit = ref(false)
const currentOffice = ref<any>(null)

// 获取状态类型
const getStatusType = (status: number) => {
  return COMMON_STATUS_MAP[status]?.type || 'info'
}

// 获取状态名称
const getStatusName = (status: number) => {
  return COMMON_STATUS_MAP[status]?.label || '未知'
}

// 获取方位名称
const getLocationName = (location: string) => {
  switch (location) {
    case 'east':
      return '东侧'
    case 'west':
      return '西侧'
    default:
      return location
  }
}

// 加载办公室列表
const loadOfficesList = async () => {
  loading.value = true
  logger.debug('开始加载办公室列表...')
  try {
    const params: any = {
      page: pagination.current,
      size: pagination.size
    }

    if (searchForm.officeNumber) {
      params.officeNumber = searchForm.officeNumber
    }

    if (searchForm.department) {
      params.department = searchForm.department
    }

    if (searchForm.floor) {
      params.floor = searchForm.floor
    }

    if (searchForm.status !== '') {
      params.status = searchForm.status
    }

    logger.debug('请求参数:', params)
    const response: any = await officeAPI.getOfficeList(params)
    logger.debug('API响应:', response)
    
    if (response && response.code === 200) {
      officesList.value = response.data.records || []
      pagination.total = response.data.total || 0
      logger.debug('成功加载数据:', officesList.value)
    } else {
      // 如果API调用失败，使用模拟数据
      console.warn('API调用失败，使用模拟数据')
      loadMockData()
    }
  } catch (error: any) {
    console.warn('API调用异常，使用模拟数据:', error)
    // 使用模拟数据
    loadMockData()
  } finally {
    loading.value = false
  }
}

// 加载模拟数据
const loadMockData = () => {
  logger.debug('加载模拟数据...')
  const mockData = [
    {
      id: "office-001",
      officeNumber: "敏行楼101",
      officeName: "教务办",
      department: "信息工程学院",
      floor: 1,
      location: "east",
      capacity: 10,
      status: 1
    },
    {
      id: "office-002",
      officeNumber: "敏行楼102",
      officeName: "学管办",
      department: "信息工程学院",
      floor: 1,
      location: "east",
      capacity: 8,
      status: 1
    },
    {
      id: "office-003",
      officeNumber: "敏行楼103",
      officeName: "政务办",
      department: "信息工程学院",
      floor: 1,
      location: "east",
      capacity: 12,
      status: 1
    },
    {
      id: "office-004",
      officeNumber: "敏行楼201",
      officeName: "实训教研室",
      department: "信息工程学院",
      floor: 2,
      location: "east",
      capacity: 15,
      status: 1
    },
    {
      id: "office-005",
      officeNumber: "敏行楼202",
      officeName: "软件教研室",
      department: "信息工程学院",
      floor: 2,
      location: "west",
      capacity: 12,
      status: 0
    }
  ]
  
  officesList.value = mockData
  pagination.total = mockData.length
  logger.debug('模拟数据加载完成:', mockData)
}

// 搜索处理
const handleSearch = () => {
  pagination.current = 1
  loadOfficesList()
}

// 重置搜索
const resetSearch = () => {
  searchForm.officeNumber = ''
  searchForm.department = ''
  searchForm.floor = ''
  searchForm.status = ''
  handleSearch()
}

// 分页处理
const handleSizeChange = (size: number) => {
  pagination.size = size
  pagination.current = 1
  loadOfficesList()
}

const handleCurrentChange = (current: number) => {
  pagination.current = current
  loadOfficesList()
}

// 选择变化处理
const handleSelectionChange = (selection: any[]) => {
  selectedOffices.value = selection
}

// 显示创建对话框
const showCreateDialog = () => {
  isEdit.value = false
  currentOffice.value = null
  dialogVisible.value = true
}

// 编辑办公室
const editOffice = (row: any) => {
  isEdit.value = true
  currentOffice.value = { ...row }
  dialogVisible.value = true
}

// 查看办公室详情
const viewOffice = async (row: any) => {
  try {
    const response: any = await officeAPI.getOfficeDetail(row.id)
    if (response && response.code === 200) {
      currentOffice.value = response.data
      detailVisible.value = true
    } else {
      // 如果API调用失败，使用模拟数据
      console.warn('获取详情失败，使用模拟数据')
      loadMockDetailData(row)
    }
  } catch (error: any) {
    console.warn('获取详情异常，使用模拟数据:', error)
    // 使用模拟数据
    loadMockDetailData(row)
  }
}

// 加载模拟详情数据
const loadMockDetailData = (row: any) => {
  // 根据办公室ID生成模拟的员工数据
  const mockStaffData: Record<string, Array<{
    id: string
    username: string
    realName: string
    department: string
    status: string
    statusName: string
  }>> = {
    "office-001": [
      {
        id: "user-001",
        username: "academic_admin",
        realName: "教务管理员",
        department: "教务办",
        status: ATTENDANCE_STATUS.PRESENT,
        statusName: "在岗"
      }
    ],
    "office-002": [
      {
        id: "user-002",
        username: "student_admin",
        realName: "学管办主任",
        department: "学管办",
        status: ATTENDANCE_STATUS.PRESENT,
        statusName: "在岗"
      }
    ],
    "office-003": [
      {
        id: "user-003",
        username: "student_affairs_director",
        realName: "政务办主任",
        department: "政务办",
        status: ATTENDANCE_STATUS.PRESENT,
        statusName: "在岗"
      }
    ],
    "office-004": [
      {
        id: "user-004",
        username: "teacher_001",
        realName: "实训教师",
        department: "实训教研室",
        status: ATTENDANCE_STATUS.PRESENT,
        statusName: "在岗"
      }
    ],
    "office-005": []
  }
  
  currentOffice.value = {
    ...row,
    staffList: mockStaffData[row.id] || []
  }
  detailVisible.value = true
}

// 启用办公室
const enableOffice = async (row: any) => {
  try {
    await ElMessageBox.confirm(
      `确定要启用办公室吗？\n办公室号：${row.officeNumber}\n办公室名称：${row.officeName}`,
      '确认启用',
      {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }
    )

    const response: any = await officeAPI.updateOffice(row.id, {
      ...row,
      status: 1
    })
    if (response && response.code === 200) {
      showSuccessMessage(response, '启用成功')
    } else {
      showErrorMessage(response, '启用失败')
    }
    loadOfficesList()
  } catch (error: any) {
    if (error !== 'cancel') {
      handleApiError(error, '启用失败')
    }
  }
}

// 禁用办公室
const disableOffice = async (row: any) => {
  try {
    await ElMessageBox.confirm(
      `确定要禁用办公室吗？\n办公室号：${row.officeNumber}\n办公室名称：${row.officeName}`,
      '确认禁用',
      {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }
    )

    const response: any = await officeAPI.updateOffice(row.id, {
      ...row,
      status: 0
    })
    if (response && response.code === 200) {
      showSuccessMessage(response, '禁用成功')
    } else {
      showErrorMessage(response, '禁用失败')
    }
    loadOfficesList()
  } catch (error: any) {
    if (error !== 'cancel') {
      handleApiError(error, '禁用失败')
    }
  }
}

// 删除办公室
const deleteOffice = async (row: any) => {
  try {
    await ElMessageBox.confirm(
      `确定要删除办公室吗？\n办公室号：${row.officeNumber}\n办公室名称：${row.officeName}`,
      '确认删除',
      {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }
    )

    const response: any = await officeAPI.deleteOffice(row.id)
    if (response && response.code === 200) {
      showSuccessMessage(response, '删除成功')
    } else {
      showErrorMessage(response, '删除失败')
    }
    loadOfficesList()
  } catch (error: any) {
    if (error !== 'cancel') {
      handleApiError(error, '删除失败')
    }
  }
}

// 批量删除办公室
const batchDeleteOffices = async () => {
  if (selectedOffices.value.length === 0) {
    ElMessageBox.warning('请选择要删除的办公室', '提示')
    return
  }

  try {
    const officeNames = selectedOffices.value.map(office => office.officeName).join('、')
    await ElMessageBox.confirm(
      `确定要删除选中的 ${selectedOffices.value.length} 个办公室吗？\n办公室：${officeNames}`,
      '确认批量删除',
      {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }
    )

    const ids = selectedOffices.value.map(office => office.id)
    const response: any = await officeAPI.batchDeleteOffice(ids)
    if (response && response.code === 200) {
      showSuccessMessage(response, '批量删除成功')
      selectedOffices.value = []
      loadOfficesList()
    } else {
      showErrorMessage(response, '批量删除失败')
    }
  } catch (error: any) {
    if (error !== 'cancel') {
      handleApiError(error, '批量删除失败')
    }
  }
}

// 对话框成功回调
const handleDialogSuccess = () => {
  loadOfficesList()
}

// 组件挂载时加载数据
onMounted(() => {
  loadOfficesList()
})
</script>

<style scoped>
.offices-management {
  padding: 3px 3px 3px 3px;
  display: flex;
  flex-direction: column;
}

.offices-container {
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

.offices-table {
  margin-top: 3px;
  flex: 1;
  display: flex;
  flex-direction: column;
  min-height: 0; /* 重要：允许flex子元素收缩 */
}

.offices-table :deep(.el-table__footer-wrapper) {
  margin-bottom: 0;
}

.offices-table :deep(.el-table__fixed-footer-wrapper) {
  margin-bottom: 0;
}

.pagination-wrapper {
  margin-top: 8px;
  margin-bottom: 0;
  text-align: right;
  flex-shrink: 0;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.pagination-wrapper :deep(.el-pagination) {
  margin-bottom: 0;
}

.office-detail {
  padding: 20px 0;
}

.staff-list {
  margin-top: 20px;
  padding-top: 20px;
  border-top: 1px solid #f0f0f0;
}

.staff-list h4 {
  margin-bottom: 12px;
  color: #333;
}
</style> 