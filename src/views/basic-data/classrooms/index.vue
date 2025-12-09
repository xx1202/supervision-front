<template>
  <div class="classrooms-management">
    <div class="page-content">
      <div class="classrooms-container">
        <!-- 搜索和过滤区域 -->
        <div class="search-section">
          <el-form :model="searchForm" inline style="display: flex; align-items: center; justify-content: space-between;">
            <el-form-item label="教室号">
              <el-input
                v-model="searchForm.roomNumber"
                placeholder="请输入教室号"
                clearable
                @keyup.enter="handleSearch"
                style="width: 200px"
              />
            </el-form-item>
            <el-form-item label="教室类型">
              <el-select v-model="searchForm.type" placeholder="选择类型" @change="handleSearch">
                <el-option label="全部" value="" />
                <el-option 
                  v-for="(label, type) in CLASSROOM_TYPE_MAP" 
                  :key="type" 
                  :label="label" 
                  :value="type" 
                />
              </el-select>
            </el-form-item>
            <el-form-item label="楼层">
              <el-select v-model="searchForm.floor" placeholder="选择楼层" @change="handleSearch">
                <el-option label="全部" value="" />
                <el-option label="1层" value="1" />
                <el-option label="2层" value="2" />
                <el-option label="3层" value="3" />
                <el-option label="4层" value="4" />
                <el-option label="5层" value="5" />
              </el-select>
            </el-form-item>
            <el-form-item label="方位">
              <el-select v-model="searchForm.location" placeholder="选择方位" @change="handleSearch">
                <el-option label="全部" value="" />
                <el-option 
                  v-for="(label, location) in CLASSROOM_LOCATION_MAP" 
                  :key="location" 
                  :label="label" 
                  :value="location" 
                />
              </el-select>
            </el-form-item>
            <el-form-item label="状态">
              <el-select v-model="searchForm.status" placeholder="选择状态" @change="handleSearch">
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
                新增教室
              </el-button>
            </el-form-item>
          </el-form>
        </div>
        
        <div class="classrooms-table">
          <el-table 
            :data="classroomsList" 
            style="width: 100%" 
            height="100%"
            v-loading="loading"
            fit
            table-layout="fixed"
            border 
          >
            <el-table-column prop="roomNumber" label="教室号" width="150" />
            <el-table-column prop="type" label="教室类型" width="120">
              <template #default="scope">
                <el-tag :type="getTypeTagType(scope.row.type)">
                  {{ getTypeName(scope.row.type) }}
                </el-tag>
              </template>
            </el-table-column>
            <el-table-column prop="floor" label="楼层" width="80">
              <template #default="scope">
                {{ scope.row.floor }}层
              </template>
            </el-table-column>
            <el-table-column prop="location" label="方位" width="80">
              <template #default="scope">
                <el-tag :type="getLocationTagType(scope.row.location)">
                  {{ getLocationName(scope.row.location) }}
                </el-tag>
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
            <el-table-column prop="createdTime" label="创建时间" width="160">
              <template #default="scope">
                {{ formatDateTime(scope.row.createdTime) }}
              </template>
            </el-table-column>
            <el-table-column label="操作" min-width="200" fixed="right">
              <template #default="scope">
                <el-button size="small" @click="viewClassroom(scope.row)">查看</el-button>
                <el-button 
                  size="small" 
                  type="primary" 
                  @click="editClassroom(scope.row)"
                >
                  编辑
                </el-button>
                <el-button 
                  size="small" 
                  type="danger" 
                  @click="deleteClassroom(scope.row)"
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

    <!-- 教室对话框 -->
    <el-dialog
      :title="isEdit ? '编辑教室' : '新增教室'"
      v-model="dialogVisible"
      width="600px"
      :append-to-body="true"
      :lock-scroll="true"
      :close-on-click-modal="false"
    >
      <el-form
        ref="classroomFormRef"
        :model="classroomForm"
        :rules="classroomRules"
        label-width="100px"
      >
        <el-form-item label="教室号" prop="roomNumber">
          <el-input v-model="classroomForm.roomNumber" placeholder="请输入教室号" />
        </el-form-item>
        <el-form-item label="教室类型" prop="type">
          <el-select v-model="classroomForm.type" placeholder="请选择教室类型" style="width: 100%">
            <el-option 
              v-for="(label, type) in CLASSROOM_TYPE_MAP" 
              :key="type" 
              :label="label" 
              :value="type" 
            />
          </el-select>
        </el-form-item>
        <el-form-item label="楼层" prop="floor">
          <el-input-number 
            v-model="classroomForm.floor" 
            :min="1" 
            :max="100" 
            placeholder="请输入楼层"
            style="width: 100%"
          />
        </el-form-item>
        <el-form-item label="方位" prop="location">
          <el-select v-model="classroomForm.location" placeholder="请选择方位" style="width: 100%">
            <el-option label="东侧" value="east" />
            <el-option label="西侧" value="west" />
          </el-select>
        </el-form-item>
        <el-form-item label="容纳人数" prop="capacity">
          <el-input-number 
            v-model="classroomForm.capacity" 
            :min="1" 
            :max="1000" 
            placeholder="请输入容纳人数"
            style="width: 100%"
          />
        </el-form-item>
        <el-form-item label="状态" prop="status">
          <el-radio-group v-model="classroomForm.status">
            <el-radio :label="1">启用</el-radio>
            <el-radio :label="0">禁用</el-radio>
          </el-radio-group>
        </el-form-item>
      </el-form>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="dialogVisible = false">取消</el-button>
          <el-button type="primary" @click="submitClassroom">确定</el-button>
        </span>
      </template>
    </el-dialog>

    <!-- 教室详情对话框 -->
    <el-dialog
      title="教室详情"
      v-model="detailVisible"
      width="600px"
      :append-to-body="true"
      :lock-scroll="true"
      :close-on-click-modal="false"
    >
      <div v-if="currentClassroom" class="classroom-detail">
        <el-descriptions :column="2" border>
          <el-descriptions-item label="教室号">
            {{ currentClassroom.roomNumber }}
          </el-descriptions-item>
          <el-descriptions-item label="教室类型">
            <el-tag :type="getTypeTagType(currentClassroom.type)">
              {{ getTypeName(currentClassroom.type) || '未知' }}
            </el-tag>
          </el-descriptions-item>
          <el-descriptions-item label="楼层">
            {{ currentClassroom.floor }}层
          </el-descriptions-item>
          <el-descriptions-item label="方位">
            <el-tag :type="getLocationTagType(currentClassroom.location)">
              {{ getLocationName(currentClassroom.location) }}
            </el-tag>
          </el-descriptions-item>
          <el-descriptions-item label="容纳人数">
            {{ currentClassroom.capacity }}人
          </el-descriptions-item>
          <el-descriptions-item label="状态">
            <el-tag :type="getStatusType(currentClassroom.status)">
              {{ getStatusName(currentClassroom.status) }}
            </el-tag>
          </el-descriptions-item>
          <el-descriptions-item label="创建人">
            {{ currentClassroom.createdBy }}
          </el-descriptions-item>
          <el-descriptions-item label="创建时间">
            {{ formatDateTime(currentClassroom.createdTime) }}
          </el-descriptions-item>
          <el-descriptions-item label="更新人">
            {{ currentClassroom.updatedBy }}
          </el-descriptions-item>
          <el-descriptions-item label="更新时间">
            {{ formatDateTime(currentClassroom.updatedTime) }}
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
import { showSuccessMessage, showErrorMessage, handleApiError } from '@/utils/error-handler'
import type { FormInstance, FormRules } from 'element-plus'
import { classroomAPI } from '../../../api'
import type { Classroom, ClassroomCreateParams, ClassroomUpdateParams } from '../../../types/api'
import { 
  CLASSROOM_TYPE,
  CLASSROOM_TYPE_MAP,
  CLASSROOM_LOCATION,
  CLASSROOM_LOCATION_MAP
} from '@/constants'
import { 
  COMMON_STATUS,
  COMMON_STATUS_MAP
} from '@/constants/common'

// 搜索表单
const searchForm = reactive({
  roomNumber: '',
  type: '',
  floor: '',
  location: '',
  status: ''
})

// 分页信息
const pagination = reactive({
  current: 1,
  size: 10,
  total: 0
})

// 教室数据
const classroomsList = ref<Classroom[]>([])
const loading = ref(false)

// 对话框状态
const dialogVisible = ref(false)
const detailVisible = ref(false)
const isEdit = ref(false)
const currentClassroom = ref<Classroom | null>(null)
const classroomFormRef = ref<FormInstance>()

// 教室表单
const classroomForm = reactive<ClassroomCreateParams>({
  roomNumber: '',
  type: CLASSROOM_TYPE.THEORY,
  floor: 1,
  location: 'east',
  capacity: 50,
  status: COMMON_STATUS.ENABLED
})

// 表单验证规则
const classroomRules: FormRules = {
  roomNumber: [
    { required: true, message: '请输入教室号', trigger: 'blur' }
  ],
  type: [
    { required: true, message: '请选择教室类型', trigger: 'change' }
  ],
  floor: [
    { required: true, message: '请输入楼层', trigger: 'blur' },
    { type: 'number', min: 1, max: 100, message: '楼层必须在1-100之间', trigger: 'blur' }
  ],
  location: [
    { required: true, message: '请选择方位', trigger: 'change' }
  ],
  capacity: [
    { required: true, message: '请输入容纳人数', trigger: 'blur' },
    { type: 'number', min: 1, max: 1000, message: '容纳人数必须在1-1000之间', trigger: 'blur' }
  ],
  status: [
    { required: true, message: '请选择状态', trigger: 'change' }
  ]
}

// 获取教室类型标签类型
const getTypeTagType = (type: string) => {
  const tagMap: Record<string, string> = {
    [CLASSROOM_TYPE.THEORY]: 'primary',
    [CLASSROOM_TYPE.TRAINING]: 'success'
  }
  return tagMap[type] || 'info'
}

// 获取教室类型名称
const getTypeName = (type: string) => {
  return CLASSROOM_TYPE_MAP[type] || type
}

// 获取方位标签类型
const getLocationTagType = (location: string) => {
  const tagMap: Record<string, string> = {
    [CLASSROOM_LOCATION.EAST]: 'warning',
    [CLASSROOM_LOCATION.WEST]: 'info'
  }
  return tagMap[location] || 'info'
}

// 获取方位名称
const getLocationName = (location: string) => {
  return CLASSROOM_LOCATION_MAP[location] || '未知'
}

// 获取状态类型
const getStatusType = (status: number) => {
  return COMMON_STATUS_MAP[status]?.type || 'info'
}

// 获取状态名称
const getStatusName = (status: number) => {
  return COMMON_STATUS_MAP[status]?.label || '未知'
}

// 格式化日期时间
const formatDateTime = (datetime: string) => {
  if (!datetime) return ''
  return new Date(datetime).toLocaleString('zh-CN')
}

// 加载教室列表
const loadClassroomsList = async () => {
  loading.value = true
  try {
    // 构建查询参数
    const params: any = {
      page: pagination.current,
      size: pagination.size
    }
    
    if (searchForm.roomNumber) {
      params.roomNumber = searchForm.roomNumber
    }
    if (searchForm.type) {
      params.type = searchForm.type
    }
    if (searchForm.floor) {
      params.floor = parseInt(searchForm.floor)
    }
    if (searchForm.location) {
      params.location = searchForm.location
    }
    if (searchForm.status) {
      params.status = parseInt(searchForm.status)
    }
    
    const response: any = await classroomAPI.getClassroomList(params)
    
    if (response.code === 200 && response.data) {
      classroomsList.value = response.data.records || []
      pagination.total = response.data.total || 0
      pagination.current = response.data.current || 1
      pagination.size = response.data.size || 10
    } else {
      showErrorMessage(response, '加载教室列表失败')
    }
  } catch (error: any) {
    handleApiError(error, '加载教室列表失败')
  } finally {
    loading.value = false
  }
}

// 搜索处理
const handleSearch = () => {
  pagination.current = 1
  loadClassroomsList()
}

// 重置搜索
const resetSearch = () => {
  searchForm.roomNumber = ''
  searchForm.type = ''
  searchForm.floor = ''
  searchForm.location = ''
  searchForm.status = ''
  handleSearch()
}

// 分页处理
const handleSizeChange = (size: number) => {
  pagination.size = size
  pagination.current = 1
  loadClassroomsList()
}

const handleCurrentChange = (current: number) => {
  pagination.current = current
  loadClassroomsList()
}

// 显示创建对话框
const showCreateDialog = () => {
  isEdit.value = false
  currentClassroom.value = null
  resetClassroomForm()
  dialogVisible.value = true
}

// 重置教室表单
const resetClassroomForm = () => {
  classroomForm.roomNumber = ''
  classroomForm.type = 'theory'
  classroomForm.floor = 1
  classroomForm.location = 'east'
  classroomForm.capacity = 50
  classroomForm.status = 1
}

// 编辑教室
const editClassroom = (row: Classroom) => {
  isEdit.value = true
  currentClassroom.value = { ...row }
  Object.assign(classroomForm, row)
  dialogVisible.value = true
}

  // 查看教室详情
  const viewClassroom = async (row: Classroom) => {
    try {
      const response:any = await classroomAPI.getClassroomDetail(row.id)
      if (response.code === 200 && response.data) {
        currentClassroom.value = response.data
        detailVisible.value = true
      } else {
        showErrorMessage(response, '获取教室详情失败')
      }
    } catch (error: any) {
      handleApiError(error, '获取教室详情失败')
    }
  }

// 提交教室表单
const submitClassroom = async () => {
  if (!classroomFormRef.value) return
  
  try {
    await classroomFormRef.value.validate()
    
    if (isEdit.value && currentClassroom.value) {
      // 更新教室
      const response: any = await classroomAPI.updateClassroom(currentClassroom.value.id, classroomForm)
      if (response.code === 200) {
        showSuccessMessage(response, '教室信息更新成功')
        dialogVisible.value = false
        loadClassroomsList()
      } else {
        showErrorMessage(response, '更新失败')
      }
    } else {
      // 创建教室
      const response: any = await classroomAPI.createClassroom(classroomForm)
      if (response.code === 200) {
        showSuccessMessage(response, '教室创建成功')
        dialogVisible.value = false
        loadClassroomsList()
      } else {
        showErrorMessage(response, '创建失败')
      }
    }
  } catch (error: any) {
    handleApiError(error, '操作失败')
  }
}

// 删除教室
const deleteClassroom = async (row: Classroom) => {
  try {
    await ElMessageBox.confirm(
      `确定要删除教室吗？\n教室号：${row.roomNumber}`,
      '确认删除',
      {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }
    )

    const response: any = await classroomAPI.deleteClassroom(row.id)
    if (response.code === 200) {
      showSuccessMessage(response, '删除成功')
      loadClassroomsList()
    } else {
      showErrorMessage(response, '删除失败')
    }
  } catch (error: any) {
    if (error !== 'cancel') {
      handleApiError(error, '删除失败')
    }
  }
}

// 组件挂载时加载数据
onMounted(() => {
  loadClassroomsList()
})
</script>

<style scoped>
.classrooms-management {
  padding: 3px 3px 3px 3px;
  display: flex;
  flex-direction: column;
}

.classrooms-container {
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

.classrooms-table {
  margin-top: 3px;
  flex: 1;
  display: flex;
  flex-direction: column;
  min-height: 0; /* 重要：允许flex子元素收缩 */
}

.classrooms-table :deep(.el-table__footer-wrapper) {
  margin-bottom: 0;
}

.classrooms-table :deep(.el-table__fixed-footer-wrapper) {
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

.classroom-detail {
  padding: 20px 0;
}

.dialog-footer {
  text-align: right;
}
</style> 