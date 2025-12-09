<template>
  <div class="courses-management">
    <div class="page-content">
      <div class="courses-container">
        <!-- 搜索和过滤区域 -->
        <div class="search-section">
          <el-form :model="filterForm" inline style="display: flex; align-items: center; justify-content: space-between;">
            <el-form-item label="课程名称">
              <el-input
                v-model="filterForm.courseName"
                placeholder="请输入课程名称"
                clearable
                @keyup.enter="searchData"
                style="width: 200px"
              />
            </el-form-item>
            <el-form-item label="课程类型">
              <el-select v-model="filterForm.courseType" placeholder="选择类型" @change="searchData">
                <el-option label="全部" value="" />
                <el-option 
                  v-for="(label, type) in COURSE_TYPE_MAP" 
                  :key="type" 
                  :label="label" 
                  :value="type" 
                />
              </el-select>
            </el-form-item>
            <el-form-item label="所属部门">
              <el-input
                v-model="filterForm.department"
                placeholder="请输入所属部门"
                clearable
                style="width: 200px"
              />
            </el-form-item>
            <el-form-item label="任课教师">
              <el-input
                v-model="filterForm.teacher"
                placeholder="请输入任课教师"
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
              <div style="display: flex; gap: 7px;">
                <el-button type="primary" @click="searchData">搜索</el-button>
                <el-button @click="resetFilter">重置</el-button>
              </div>
            </el-form-item>
            <el-form-item style="margin-left: auto;">
              <el-button type="primary" @click="addCourse">
                <el-icon><Plus /></el-icon>
                新增课程
              </el-button>
            </el-form-item>
          </el-form>
        </div>
        
        <div class="courses-table">
          <el-table 
            :data="coursesList" 
            style="width: 100%"
            height="100%"
            v-loading="loading"
            fit
            table-layout="fixed"
            border
          >
            <el-table-column prop="courseName" label="课程名称" width="200" />
            <el-table-column prop="courseType" label="课程类型" width="120">
              <template #default="scope">
                <el-tag :type="getCourseTypeTagType(scope.row.courseType)">
                  {{ getCourseTypeName(scope.row.courseType) }}
                </el-tag>
              </template>
            </el-table-column>
            <el-table-column prop="department" label="所属部门" width="200" />
            <el-table-column prop="teacher" label="任课教师" width="120" />
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
                <el-button size="small" @click="viewCourse(scope.row)">查看</el-button>
                <el-button size="small" type="primary" @click="editCourse(scope.row)">编辑</el-button>
                <el-button 
                  size="small" 
                  :type="scope.row.status === COMMON_STATUS.ENABLED ? 'warning' : 'success'"
                  @click="toggleStatus(scope.row)"
                >
                  {{ scope.row.status === COMMON_STATUS.ENABLED ? '禁用' : '启用' }}
                </el-button>
                <el-button size="small" type="danger" @click="deleteCourse(scope.row)">删除</el-button>
              </template>
            </el-table-column>
          </el-table>

          <!-- 分页 -->
          <div class="pagination-wrapper">
            <el-pagination
              v-model:current-page="currentPage"
              v-model:page-size="pageSize"
              :page-sizes="[10, 20, 50, 100]"
              :total="total"
              layout="total, sizes, prev, pager, next, jumper"
              @size-change="handleSizeChange"
              @current-change="handleCurrentChange"
            />
          </div>
        </div>
      </div>
    </div>

    <!-- 课程详情对话框 -->
    <CourseDialog
      v-model:modelValue="dialogVisible"
      :course-data="currentCourse"
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
import { courseAPI } from '@/api'
import { 
  COURSE_TYPE,
  COURSE_TYPE_MAP
} from '@/constants'
import { 
  COMMON_STATUS,
  COMMON_STATUS_MAP
} from '@/constants/common'
import type { Course, CourseQueryParams } from '@/types/api'
import CourseDialog from '@/components/basic-data/CourseDialog.vue'

// 筛选表单
const filterForm = reactive<CourseQueryParams>({
  courseName: '',
  courseType: undefined,
  department: '',
  teacher: '',
  status: undefined
})

// 分页数据
const currentPage = ref(1)
const pageSize = ref(10)
const total = ref(0)

// 课程数据
const coursesList = ref<Course[]>([])
const loading = ref(false)

// 对话框相关
const dialogVisible = ref(false)
const currentCourse = ref<Course>()
const dialogMode = ref<'create' | 'edit' | 'view'>('create')

// 获取课程列表
const fetchCourses = async () => {
  try {
    loading.value = true
    const params: CourseQueryParams = {
      page: currentPage.value,
      size: pageSize.value,
      ...filterForm
    }
    
    // 过滤空值
    Object.keys(params).forEach(key => {
      if (params[key as keyof CourseQueryParams] === '' || params[key as keyof CourseQueryParams] === undefined) {
        delete params[key as keyof CourseQueryParams]
      }
    })
    
    const response: any = await courseAPI.getCourseList(params)
    coursesList.value = response.data.records
    total.value = response.data.total
  } catch (error: any) {
    handleApiError(error, '获取课程列表失败')
  } finally {
    loading.value = false
  }
}

// 获取课程类型标签类型
const getCourseTypeTagType = (courseType: string) => {
  const tagMap: Record<string, string> = {
    [COURSE_TYPE.THEORY]: 'primary',
    [COURSE_TYPE.TRAINING]: 'success'
  }
  return tagMap[courseType] || 'info'
}

// 获取课程类型名称
const getCourseTypeName = (courseType: string) => {
  return COURSE_TYPE_MAP[courseType] || courseType
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

// 新增课程
const addCourse = () => {
  currentCourse.value = undefined
  dialogMode.value = 'create'
  dialogVisible.value = true
}

// 编辑课程
const editCourse = (row: Course) => {
  currentCourse.value = row
  dialogMode.value = 'edit'
  dialogVisible.value = true
}

// 查看课程
const viewCourse = (row: Course) => {
  currentCourse.value = row
  dialogMode.value = 'view'
  dialogVisible.value = true
}

// 切换状态
const toggleStatus = async (row: Course) => {
  try {
    const newStatus = row.status === 1 ? 0 : 1
    const actionText = newStatus === 1 ? '启用' : '禁用'
    
    await ElMessageBox.confirm(
      `确定要${actionText}课程"${row.courseName}"吗？`,
      '确认操作',
      {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }
    )
    
    const response: any = await courseAPI.updateCourse(row.id, { ...row, status: newStatus })
    showSuccessMessage(response, `${actionText}成功`)
    fetchCourses()
  } catch (error: any) {
    if (error !== 'cancel') {
      handleApiError(error, '操作失败')
    }
  }
}

// 删除课程
const deleteCourse = async (row: Course) => {
  try {
    await ElMessageBox.confirm(
      `确定要删除课程"${row.courseName}"吗？此操作不可恢复！`,
      '确认删除',
      {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }
    )
    
    const response: any = await courseAPI.deleteCourse(row.id)
    showSuccessMessage(response, '删除成功')
    fetchCourses()
  } catch (error: any) {
    if (error !== 'cancel') {
      handleApiError(error, '删除失败')
    }
  }
}

// 搜索数据
const searchData = () => {
  currentPage.value = 1
  fetchCourses()
}

// 重置筛选
const resetFilter = () => {
  Object.assign(filterForm, {
    courseName: '',
    courseType: undefined,
    department: '',
    teacher: '',
    status: undefined
  })
  currentPage.value = 1
  fetchCourses()
}

// 分页处理
const handleSizeChange = (val: number) => {
  pageSize.value = val
  currentPage.value = 1
  fetchCourses()
}

const handleCurrentChange = (val: number) => {
  currentPage.value = val
  fetchCourses()
}

// 对话框成功回调
const handleDialogSuccess = () => {
  fetchCourses()
}

// 页面加载时获取数据
onMounted(() => {
  fetchCourses()
})
</script>

<style scoped>
.courses-management {
  padding: 3px 3px 3px 3px;
  display: flex;
  flex-direction: column;
}

.courses-container {
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

.courses-table {
  margin-top: 3px;
  flex: 1;
  display: flex;
  flex-direction: column;
  min-height: 0; /* 重要：允许flex子元素收缩 */
}

.courses-table :deep(.el-table__footer-wrapper) {
  margin-bottom: 0;
}

.courses-table :deep(.el-table__fixed-footer-wrapper) {
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