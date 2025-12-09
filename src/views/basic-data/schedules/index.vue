<template>
  <div class="schedules-management">
    <div class="page-content">
      <div class="schedules-container">
        <!-- 搜索和过滤区域 -->
        <div class="search-section">
          <el-form :model="filterForm" inline style="display: flex; align-items: center; justify-content: space-between;">
            <el-form-item label="学期">
              <el-input
                v-model="filterForm.semester"
                placeholder="请输入学期（如：2024-2025-1）"
                clearable
                @keyup.enter="searchData"
                style="width: 200px"
              />
            </el-form-item>
            <el-form-item label="星期">
              <el-select v-model="filterForm.weekDay" placeholder="选择星期" @change="searchData" clearable>
                <el-option label="星期一" value="星期一" />
                <el-option label="星期二" value="星期二" />
                <el-option label="星期三" value="星期三" />
                <el-option label="星期四" value="星期四" />
                <el-option label="星期五" value="星期五" />
                <el-option label="星期六" value="星期六" />
                <el-option label="星期日" value="星期日" />
              </el-select>
            </el-form-item>
            <el-form-item label="教师">
              <el-input
                v-model="filterForm.teacher"
                placeholder="请输入教师姓名"
                clearable
                @keyup.enter="searchData"
                style="width: 150px"
              />
            </el-form-item>
            <el-form-item>
              <div style="display: flex; gap: 7px;">
                <el-button type="primary" @click="searchData">搜索</el-button>
                <el-button @click="resetFilter">重置</el-button>
              </div>
            </el-form-item>
            <el-form-item style="margin-left: auto;">
              <el-button type="primary" @click="addSchedule">
                <el-icon><Plus /></el-icon>
                新增课表
              </el-button>
            </el-form-item>
          </el-form>
        </div>
        
        <div class="schedules-table">
          <el-table 
            :data="schedulesList" 
            style="width: 100%"
            height="100%"
            v-loading="loading"
            fit
            table-layout="fixed"
            border
          >
            <el-table-column prop="semester" label="学期" width="120" />
            <el-table-column prop="weekDay" label="星期" width="80" />
            <el-table-column prop="period" label="节次" width="80" />
            <el-table-column prop="teacher" label="教师" width="120" />
            <el-table-column prop="courseName" label="课程名称" width="200" />
            <el-table-column prop="className" label="班级" width="120" />
            <el-table-column prop="classroomName" label="教室" width="120" />
            <el-table-column prop="createdTime" label="创建时间" width="160">
              <template #default="scope">
                {{ formatDate(scope.row.createdTime) }}
              </template>
            </el-table-column>
            <el-table-column label="操作" min-width="200" fixed="right">
              <template #default="scope">
                <el-button size="small" @click="viewSchedule(scope.row)">查看</el-button>
                <el-button size="small" type="primary" @click="editSchedule(scope.row)">编辑</el-button>
                <el-button size="small" type="danger" @click="deleteSchedule(scope.row)">删除</el-button>
              </template>
            </el-table-column>
          </el-table>

          <!-- 分页 -->
          <div class="pagination-wrapper">
            <el-pagination
              v-model:current-page="currentPage"
              v-model:page-size="pageSize"
              :page-sizes="pageSizes"
              :total="total"
              layout="total, sizes, prev, pager, next, jumper"
              @size-change="handleSizeChange"
              @current-change="handleCurrentChange"
            />
          </div>
        </div>
      </div>
    </div>

    <!-- 课表详情对话框 -->
    <ScheduleDialog
      v-model:modelValue="dialogVisible"
      :schedule-data="currentSchedule"
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
import { scheduleAPI } from '@/api'
import type { ScheduleListItemVO, ScheduleQueryParams } from '@/types/api'
import ScheduleDialog from '@/components/basic-data/ScheduleDialog.vue'
import { PAGINATION } from '@/constants/common'

// 分页配置
const pageSizes = PAGINATION.PAGE_SIZES

// 筛选表单
const filterForm = reactive<ScheduleQueryParams>({
  semester: '',
  weekDay: '',
  teacher: ''
})

// 分页数据
const currentPage = ref(1)
const pageSize = ref(10)
const total = ref(0)

// 课表数据
const schedulesList = ref<ScheduleListItemVO[]>([])
const loading = ref(false)

// 对话框相关
const dialogVisible = ref(false)
const currentSchedule = ref<ScheduleListItemVO>()
const dialogMode = ref<'create' | 'edit' | 'view'>('create')

// 获取课表列表
const fetchSchedules = async () => {
  try {
    loading.value = true
    const params: ScheduleQueryParams = {
      page: currentPage.value,
      size: pageSize.value,
      ...filterForm
    }
    
    // 过滤空值
    Object.keys(params).forEach(key => {
      if (params[key as keyof ScheduleQueryParams] === '' || params[key as keyof ScheduleQueryParams] === undefined) {
        delete params[key as keyof ScheduleQueryParams]
      }
    })
    
    const response: any = await scheduleAPI.getScheduleList(params)
    schedulesList.value = response.data.records
    total.value = response.data.total
  } catch (error: any) {
    handleApiError(error, '获取课表列表失败')
  } finally {
    loading.value = false
  }
}

// 格式化日期
const formatDate = (dateStr: string) => {
  if (!dateStr) return '-'
  return new Date(dateStr).toLocaleString('zh-CN')
}

// 新增课表
const addSchedule = () => {
  currentSchedule.value = undefined
  dialogMode.value = 'create'
  dialogVisible.value = true
}

// 编辑课表
const editSchedule = (row: ScheduleListItemVO) => {
  currentSchedule.value = row
  dialogMode.value = 'edit'
  dialogVisible.value = true
}

// 查看课表
const viewSchedule = (row: ScheduleListItemVO) => {
  currentSchedule.value = row
  dialogMode.value = 'view'
  dialogVisible.value = true
}

// 删除课表
const deleteSchedule = async (row: ScheduleListItemVO) => {
  try {
    await ElMessageBox.confirm(
      `确定要删除课表"${row.courseName}"吗？此操作不可恢复！`,
      '确认删除',
      {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }
    )
    
    const response: any = await scheduleAPI.deleteSchedule(row.id)
    showSuccessMessage(response, '删除成功')
    fetchSchedules()
  } catch (error: any) {
    if (error !== 'cancel') {
      handleApiError(error, '删除失败')
    }
  }
}

// 搜索数据
const searchData = () => {
  currentPage.value = 1
  fetchSchedules()
}

// 重置筛选
const resetFilter = () => {
  Object.assign(filterForm, {
    semester: '',
    weekDay: '',
    teacher: ''
  })
  currentPage.value = 1
  fetchSchedules()
}

// 分页处理
const handleSizeChange = (val: number) => {
  pageSize.value = val
  currentPage.value = 1
  fetchSchedules()
}

const handleCurrentChange = (val: number) => {
  currentPage.value = val
  fetchSchedules()
}

// 对话框成功回调
const handleDialogSuccess = () => {
  fetchSchedules()
}

// 页面加载时获取数据
onMounted(() => {
  fetchSchedules()
})
</script>

<style scoped>
.schedules-management {
  padding: 3px 3px 3px 3px;
  display: flex;
  flex-direction: column;
}

.schedules-container {
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

.schedules-table {
  margin-top: 3px;
  flex: 1;
  display: flex;
  flex-direction: column;
  min-height: 0; /* 重要：允许flex子元素收缩 */
}

.schedules-table :deep(.el-table__footer-wrapper) {
  margin-bottom: 0;
}

.schedules-table :deep(.el-table__fixed-footer-wrapper) {
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
