<template>
  <div class="classes-management">
    <div class="page-content">
      <div class="classes-container">
        <!-- 搜索和过滤区域 -->
        <div class="search-section">
          <el-form :model="filterForm" inline style="display: flex; align-items: center; justify-content: space-between;">
            <el-form-item label="班级名称">
              <el-input
                v-model="filterForm.className"
                placeholder="请输入班级名称"
                clearable
                @keyup.enter="searchData"
                style="width: 200px"
              />
            </el-form-item>
<!--            <el-form-item label="所属部门">-->
<!--              <el-input-->
<!--                v-model="filterForm.department"-->
<!--                placeholder="请输入所属部门"-->
<!--                clearable-->
<!--                style="width: 200px"-->
<!--              />-->
<!--            </el-form-item>-->
            <el-form-item label="辅导员">
              <el-input
                v-model="filterForm.counselor"
                placeholder="请输入辅导员姓名"
                clearable
                style="width: 150px"
              />
            </el-form-item>
            <el-form-item label="状态">
              <el-select v-model="filterForm.status" placeholder="选择状态" @change="searchData">
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
              <el-button type="primary" @click="searchData">搜索</el-button>
              <el-button @click="resetFilter">重置</el-button>
            </el-form-item>
            <el-form-item style="margin-left: auto;">
              <el-button type="primary" @click="addClass">
                <el-icon><Plus /></el-icon>
                新增班级
              </el-button>
            </el-form-item>
          </el-form>
        </div>
        
        <div class="classes-table">
          <el-table 
            :data="classesList" 
            style="width: 100%"
            height="100%"
            v-loading="loading"
            fit
            table-layout="fixed"
            border
          >
            <el-table-column prop="className" label="班级名称" width="200" />
            <el-table-column prop="department" label="所属部门" width="200" />
            <el-table-column prop="studentCount" label="人数" width="100">
              <template #default="scope">
                {{ scope.row.studentCount }}人
              </template>
            </el-table-column>
            <el-table-column prop="counselor" label="辅导员" width="120" />
            <el-table-column prop="partTimeTeacher" label="兼职班主任" width="120" />
            <el-table-column prop="status" label="状态" width="100">
              <template #default="scope">
                <el-tag :type="getStatusType(scope.row.status)">
                  {{ getStatusText(scope.row.status) }}
                </el-tag>
              </template>
            </el-table-column>
            <el-table-column prop="createdTime" label="创建时间" width="160">
              <template #default="scope">
                {{ formatDate(scope.row.createdTime) }}
              </template>
            </el-table-column>
            <el-table-column label="操作" min-width="200" fixed="right">
              <template #default="scope">
                <el-button size="small" @click="viewClass(scope.row)">查看</el-button>
                <el-button size="small" type="primary" @click="editClass(scope.row)">编辑</el-button>
                <el-button 
                  size="small" 
                  :type="scope.row.status === COMMON_STATUS.ENABLED ? 'warning' : 'success'"
                  @click="toggleStatus(scope.row)"
                >
                  {{ scope.row.status === COMMON_STATUS.ENABLED ? '禁用' : '启用' }}
                </el-button>
                <el-button size="small" type="danger" @click="deleteClass(scope.row)">删除</el-button>
              </template>
            </el-table-column>
          </el-table>

          <!-- 分页 -->
          <div class="pagination-wrapper">
            <el-pagination
              v-model:current-page="currentPage"
              v-model:page-size="pageSize"
              :page-sizes="PAGINATION.PAGE_SIZES"
              :total="total"
              layout="total, sizes, prev, pager, next, jumper"
              @size-change="handleSizeChange"
              @current-change="handleCurrentChange"
            />
          </div>
        </div>
      </div>
    </div>

    <!-- 班级详情对话框 -->
    <ClassDialog
      v-model:visible="dialogVisible"
      :class-data="currentClass"
      :mode="dialogMode"
      @success="handleDialogSuccess"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { Plus } from '@element-plus/icons-vue'
import { ElMessageBox } from 'element-plus'
import { showSuccessMessage, showErrorMessage, handleApiError } from '@/utils/error-handler'
import { classAPI } from '@/api'
import type { Class, ClassQueryParams } from '@/types/api'
import ClassDialog from '@/components/basic-data/ClassDialog.vue'
import { 
  COMMON_STATUS,
  COMMON_STATUS_MAP,
  PAGINATION
} from '@/constants/common'

// 筛选表单
const filterForm = reactive<ClassQueryParams>({
  className: '',
  department: '信息工程学院',
  counselor: '',
  status: undefined
})

// 分页数据
const currentPage = ref(1)
const pageSize = ref(10)
const total = ref(0)

// 班级数据
const classesList = ref<Class[]>([])
const loading = ref(false)

// 对话框相关
const dialogVisible = ref(false)
const currentClass = ref<Class>()
const dialogMode = ref<'create' | 'edit' | 'view'>('create')

// 获取班级列表
const fetchClasses = async () => {
  try {
    loading.value = true
    const params: ClassQueryParams = {
      page: currentPage.value,
      size: pageSize.value,
      ...filterForm
    }
    
    // 过滤空值
    Object.keys(params).forEach(key => {
      if (params[key as keyof ClassQueryParams] === '' || params[key as keyof ClassQueryParams] === undefined) {
        delete params[key as keyof ClassQueryParams]
      }
    })
    
    const response: any = await classAPI.getClassList(params)
    classesList.value = response.data.records
    total.value = response.data.total
  } catch (error: any) {
    handleApiError(error, '获取班级列表失败')
  } finally {
    loading.value = false
  }
}

// 获取状态类型
const getStatusType = (status: number) => {
  return COMMON_STATUS_MAP[status]?.type || 'info'
}

// 获取状态文本
const getStatusText = (status: number) => {
  return COMMON_STATUS_MAP[status]?.label || '未知'
}

// 格式化日期
const formatDate = (dateStr: string) => {
  if (!dateStr) return '-'
  return new Date(dateStr).toLocaleString('zh-CN')
}

// 新增班级
const addClass = () => {
  currentClass.value = undefined
  dialogMode.value = 'create'
  dialogVisible.value = true
}

// 编辑班级
const editClass = (row: Class) => {
  currentClass.value = row
  dialogMode.value = 'edit'
  dialogVisible.value = true
}

// 查看班级
const viewClass = (row: Class) => {
  currentClass.value = row
  dialogMode.value = 'view'
  dialogVisible.value = true
}

// 切换状态
const toggleStatus = async (row: Class) => {
  try {
    const newStatus = row.status === 1 ? 0 : 1
    const actionText = newStatus === 1 ? '启用' : '禁用'
    
    await ElMessageBox.confirm(
      `确定要${actionText}班级"${row.className}"吗？`,
      '确认操作',
      {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }
    )
    
    const response: any = await classAPI.updateClassStatus(row.id, newStatus)
    showSuccessMessage(response, `${actionText}成功`)
    fetchClasses()
  } catch (error: any) {
    if (error !== 'cancel') {
      handleApiError(error, '操作失败')
    }
  }
}

// 删除班级
const deleteClass = async (row: Class) => {
  try {
    await ElMessageBox.confirm(
      `确定要删除班级"${row.className}"吗？此操作不可恢复！`,
      '确认删除',
      {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }
    )
    
    const response: any = await classAPI.deleteClass(row.id)
    showSuccessMessage(response, '删除成功')
    fetchClasses()
  } catch (error: any) {
    if (error !== 'cancel') {
      handleApiError(error, '删除失败')
    }
  }
}

// 搜索数据
const searchData = () => {
  currentPage.value = 1
  fetchClasses()
}

// 重置筛选
const resetFilter = () => {
  Object.assign(filterForm, {
    className: '',
    department: '',
    counselor: '',
    status: undefined
  })
  currentPage.value = 1
  fetchClasses()
}

// 分页处理
const handleSizeChange = (val: number) => {
  pageSize.value = val
  currentPage.value = 1
  fetchClasses()
}

const handleCurrentChange = (val: number) => {
  currentPage.value = val
  fetchClasses()
}

// 对话框成功回调
const handleDialogSuccess = () => {
  fetchClasses()
}

// 页面加载时获取数据
onMounted(() => {
  fetchClasses()
})
</script>

<style scoped>
.classes-management {
  padding: 3px 3px 3px 3px;
  display: flex;
  flex-direction: column;
}

.classes-container {
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

.classes-table {
  margin-top: 3px;
  flex: 1;
  display: flex;
  flex-direction: column;
  min-height: 0; /* 重要：允许flex子元素收缩 */
}

.classes-table :deep(.el-table__footer-wrapper) {
  margin-bottom: 0;
}

.classes-table :deep(.el-table__fixed-footer-wrapper) {
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
</style> 