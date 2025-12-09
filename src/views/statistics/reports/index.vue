<template>
  <div class="reports-management">
    <div class="page-header">
      <h1>报表管理</h1>
      <p>管理和生成各类统计报表</p>
    </div>
    
    <div class="page-content">
      <div class="reports-container">
        <!-- 操作栏 -->
        <div class="operation-bar">
          <el-button type="primary" @click="createReport">
            <el-icon><Plus /></el-icon>
            创建报表
          </el-button>
          <el-button @click="batchOperation">
            <el-icon><Operation /></el-icon>
            批量操作
          </el-button>
          <el-button @click="refreshData">
            <el-icon><Refresh /></el-icon>
            刷新
          </el-button>
        </div>
        
        <!-- 筛选条件 -->
        <div class="filter-section">
          <el-form :inline="true" :model="filterForm">
            <el-form-item label="报表类型">
              <el-select v-model="filterForm.reportType" placeholder="全部">
                <el-option label="全部" value="" />
                <el-option label="督导通报" value="supervision_bulletin" />
                <el-option label="统计报表" value="statistics_report" />
              </el-select>
            </el-form-item>
            <el-form-item label="状态">
              <el-select v-model="filterForm.status" placeholder="全部">
                <el-option label="全部" value="" />
                <el-option 
                  v-for="(statusInfo, status) in REPORT_STATUS_MAP" 
                  :key="status" 
                  :label="statusInfo.label" 
                  :value="status" 
                />
              </el-select>
            </el-form-item>
            <el-form-item>
              <el-button type="primary" @click="searchData">查询</el-button>
              <el-button @click="resetFilter">重置</el-button>
            </el-form-item>
          </el-form>
        </div>
        
        <!-- 数据表格 -->
        <div class="table-section">
          <el-table :data="reportsList" style="width: 100%" v-loading="loading">
            <el-table-column prop="reportName" label="报表名称" width="250" />
            <el-table-column prop="reportType" label="报表类型" width="150">
              <template #default="scope">
                {{ scope.row.reportType === 'supervision_bulletin' ? '督导通报' : '统计报表' }}
              </template>
            </el-table-column>
            <el-table-column prop="createdTime" label="创建时间" width="180">
              <template #default="scope">
                {{ scope.row.createdTime ? new Date(scope.row.createdTime).toLocaleString() : '-' }}
              </template>
            </el-table-column>
            <el-table-column prop="fileSizeFormatted" label="文件大小" width="120" />
            <el-table-column prop="status" label="状态" width="100">
              <template #default="scope">
                <el-tag :type="getStatusType(scope.row.status)">
                  {{ getStatusText(scope.row.status) }}
                </el-tag>
              </template>
            </el-table-column>
            <el-table-column label="操作" width="280">
              <template #default="scope">
                <el-button size="small" type="primary" @click="viewReport(scope.row)">
                  <el-icon><View /></el-icon>
                  查看
                </el-button>
                <el-button 
                  size="small" 
                  type="success" 
                  @click="downloadReport(scope.row)"
                  :disabled="scope.row.status !== 'completed'">
                  <el-icon><Download /></el-icon>
                  下载
                </el-button>
                <el-button size="small" type="danger" @click="deleteReport(scope.row)">
                  <el-icon><Delete /></el-icon>
                  删除
                </el-button>
              </template>
            </el-table-column>
          </el-table>
        </div>
        
        <!-- 分页器 -->
        <div class="pagination-section">
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

    <!-- 创建报表对话框 -->
    <el-dialog v-model="createDialogVisible" title="创建报表" width="600px" :before-close="() => createDialogVisible = false">
      <el-form :model="createForm" label-width="100px">
        <el-form-item label="报表名称" required>
          <el-input v-model="createForm.reportName" placeholder="请输入报表名称" />
        </el-form-item>
        <el-form-item label="报表类型">
          <el-select v-model="createForm.reportType" style="width: 100%">
            <el-option label="督导通报" value="supervision_bulletin" />
            <el-option label="统计报表" value="statistics_report" />
          </el-select>
        </el-form-item>
        <el-form-item label="开始日期" required>
          <el-date-picker
            v-model="createForm.startDate"
            type="date"
            placeholder="选择开始日期"
            style="width: 100%"
            format="YYYY-MM-DD"
            value-format="YYYY-MM-DD"
          />
        </el-form-item>
        <el-form-item label="结束日期" required>
          <el-date-picker
            v-model="createForm.endDate"
            type="date"
            placeholder="选择结束日期"
            style="width: 100%"
            format="YYYY-MM-DD"
            value-format="YYYY-MM-DD"
          />
        </el-form-item>
        <el-form-item label="通报期数">
          <el-input v-model="createForm.bulletinNumber" placeholder="如：第10次" />
        </el-form-item>
        <el-form-item label="通报周期">
          <el-input v-model="createForm.bulletinPeriod" placeholder="如：第15-16周" />
        </el-form-item>
        <el-form-item label="通报日期">
          <el-date-picker
            v-model="createForm.bulletinDate"
            type="date"
            placeholder="选择通报日期"
            style="width: 100%"
            format="YYYY-MM-DD"
            value-format="YYYY-MM-DD"
          />
        </el-form-item>
        
        <!-- 新增：基于安排生成报表 -->
        <el-divider content-position="left">报表数据来源</el-divider>
        <el-form-item label="数据来源">
          <el-radio-group v-model="reportDataSource">
            <el-radio label="date">按日期范围</el-radio>
            <el-radio label="schedule">按督导安排</el-radio>
          </el-radio-group>
        </el-form-item>
        
        <div v-if="reportDataSource === 'schedule'">
          <el-form-item label="选择安排" required>
            <div style="max-height: 300px; overflow-y: auto; border: 1px solid #dcdfe6; border-radius: 4px; padding: 10px;">
              <el-checkbox-group v-model="createForm.scheduleIds" v-loading="scheduleLoading">
                <div v-for="schedule in schedulesList" :key="schedule.id" style="margin-bottom: 8px;">
                  <el-checkbox :label="schedule.id">
                    <span style="font-weight: bold; color: #409eff;">{{ schedule.moduleTypeName }}</span>
                    <span style="margin-left: 8px;">{{ schedule.supervisionDate }} {{ schedule.weekDay }} 第{{ schedule.period }}节</span>
                    <span style="margin-left: 8px; color: #666;">({{ schedule.memberCount }}人)</span>
                  </el-checkbox>
                </div>
                <div v-if="schedulesList.length === 0 && !scheduleLoading" style="text-align: center; color: #999; padding: 20px;">
                  暂无可用安排
                </div>
              </el-checkbox-group>
            </div>
            <div style="margin-top: 8px; font-size: 12px; color: #999;">
              已选择 {{ createForm.scheduleIds.length }} 个安排，将汇总这些安排的督导数据生成报表
            </div>
          </el-form-item>
        </div>
      </el-form>
      
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="createDialogVisible = false">取消</el-button>
          <el-button type="primary" @click="submitCreateReport" :loading="submitting">
            确定
          </el-button>
        </span>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { Plus, Operation, Refresh, Document, Download, Delete, View } from '@element-plus/icons-vue'
import { ElMessageBox } from 'element-plus'
import { showSuccessMessage, showErrorMessage, handleApiError } from '@/utils/error-handler'
import { reportAPI } from '@/api'
import { 
  MODULE_TYPE,
  MODULE_TYPE_MAP
} from '@/constants'
import { 
  REPORT_STATUS,
  REPORT_STATUS_MAP
} from '@/constants/system'

// 筛选表单
const filterForm = reactive({
  reportType: '',
  status: ''
})

// 分页数据
const currentPage = ref(1)
const pageSize = ref(10)
const total = ref(0)

// 报表数据
const reportsList = ref([])
const loading = ref(false)
const submitting = ref(false)

// 创建报表对话框
const createDialogVisible = ref(false)
const createForm = reactive({
  reportName: '',
  reportType: 'supervision_bulletin',
  startDate: '',
  endDate: '',
  bulletinNumber: '',
  bulletinPeriod: '',
  bulletinDate: '',
  // 新增：基于安排生成报表的字段
  scheduleIds: [] as string[],
  moduleTypes: [] as string[]
})

// 安排相关的响应式数据
const schedulesList = ref([])
const scheduleLoading = ref(false)
const selectedModuleTypes = ref<string[]>([
  MODULE_TYPE.DAILY_TEACHING, 
  MODULE_TYPE.ADMINISTRATIVE, 
  MODULE_TYPE.CLASSROOM_INSPECTION
])
const reportDataSource = ref('date') // 报表数据来源：date 或 schedule

// 加载报表列表
const loadReports = async () => {
  loading.value = true
  try {
    const response = await reportAPI.getReportRecords({
      page: currentPage.value,
      size: pageSize.value,
      reportType: filterForm.reportType || undefined,
      status: filterForm.status || undefined
    })
    
    if (response.code === 200) {
      reportsList.value = response.data || []
      // 注意：这里需要根据实际后端返回的数据结构调整
      // 如果后端返回的是分页数据，可能需要调整 total 的获取方式
      total.value = (response as any).total || response.data?.length || 0
    } else {
      showErrorMessage(response, '获取报表列表失败')
    }
  } catch (error) {
    console.error('获取报表列表失败:', error)
    handleApiError(error, '获取报表列表失败')
  } finally {
    loading.value = false
  }
}

// 获取状态类型
const getStatusType = (status: string) => {
  return REPORT_STATUS_MAP[status]?.type || 'info'
}

// 获取状态文本
const getStatusText = (status: string) => {
  return REPORT_STATUS_MAP[status]?.label || status
}

// 创建报表
const createReport = () => {
  createDialogVisible.value = true
  // 设置默认值
  const now = new Date()
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1)
  const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0)
  
  createForm.startDate = startOfMonth.toISOString().split('T')[0]
  createForm.endDate = endOfMonth.toISOString().split('T')[0]
  createForm.bulletinDate = now.toISOString().split('T')[0]
  createForm.bulletinNumber = '第' + (now.getMonth() + 1) + '次'
  createForm.bulletinPeriod = '第' + Math.ceil(now.getDate() / 7) + '周'
  createForm.reportName = `督导通报_${now.getFullYear()}年${now.getMonth() + 1}月`
  
  // 加载安排列表
  loadSchedulesList()
}

// 加载安排列表
const loadSchedulesList = async () => {
  scheduleLoading.value = true
  try {
    // 获取所有类型的安排
    const allSchedules: any[] = []
    
    for (const moduleType of selectedModuleTypes.value) {
      const response = await reportAPI.getSchedulesForReport({
        page: 1,
        size: 1000, // 获取足够多的数据
        moduleType: moduleType
      })
      
      if (response.code === 200 && response.data?.records) {
        const schedules = response.data.records.map((schedule: any) => ({
          ...schedule,
          moduleType: moduleType,
          moduleTypeName: getModuleTypeName(moduleType)
        }))
        allSchedules.push(...schedules)
      }
    }
    
    schedulesList.value = allSchedules
  } catch (error) {
    console.error('加载安排列表失败:', error)
    handleApiError(error, '加载安排列表失败')
  } finally {
    scheduleLoading.value = false
  }
}

// 获取模块类型名称
const getModuleTypeName = (moduleType: string) => {
  return MODULE_TYPE_MAP[moduleType] || moduleType
}

// 提交创建报表
const submitCreateReport = async () => {
  if (!createForm.reportName || !createForm.startDate || !createForm.endDate) {
    ElMessageBox.warning('请填写必要信息', '提示')
    return
  }
  
  submitting.value = true
  try {
    const response = await reportAPI.generateReport({
      templateId: '1', // 默认使用督导通报模板
      reportName: createForm.reportName,
      reportType: createForm.reportType,
      startDate: createForm.startDate,
      endDate: createForm.endDate,
      bulletinNumber: createForm.bulletinNumber,
      bulletinPeriod: createForm.bulletinPeriod,
      bulletinDate: createForm.bulletinDate,
      // 新增：基于安排生成报表的参数
      scheduleIds: createForm.scheduleIds.length > 0 ? createForm.scheduleIds : undefined,
      moduleTypes: createForm.moduleTypes.length > 0 ? createForm.moduleTypes : undefined
    })
    
    if (response.code === 200) {
      showSuccessMessage(response, '报表生成任务已启动')
      createDialogVisible.value = false
      loadReports() // 刷新列表
    } else {
      showErrorMessage(response, '创建报表失败')
    }
  } catch (error) {
    console.error('创建报表失败:', error)
    handleApiError(error, '创建报表失败')
  } finally {
    submitting.value = false
  }
}

// 批量操作
const batchOperation = () => {
  ElMessageBox.info('批量操作功能待开发', '提示')
}

// 刷新数据
const refreshData = () => {
  loadReports()
  const response: any = { code: 200, message: '数据刷新成功' }
  showSuccessMessage(response, '数据刷新成功')
}

// 搜索数据
const searchData = () => {
  currentPage.value = 1
  loadReports()
}

// 重置筛选
const resetFilter = () => {
  filterForm.reportType = ''
  filterForm.status = ''
  searchData()
}

// 查看报表
const viewReport = (row: any) => {
  // 预览报表数据
  window.open(`/v1/supervision/reports/preview?startDate=${row.startDate}&endDate=${row.endDate}&bulletinNumber=${row.bulletinNumber}`, '_blank')
}

// 下载报表
const downloadReport = async (row: any) => {
  if (row.status !== 'completed') {
    ElMessageBox.warning('报表还未生成完成，无法下载', '提示')
    return
  }
  
  try {
    loading.value = true
    const blob = await reportAPI.downloadReport(row.id)
    
    // 检查blob是否有效
    if (!blob || blob.size === 0) {
      throw new Error('下载的文件为空或无效')
    }
    
    // 创建下载链接
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `${row.reportName || 'report'}.${row.fileFormat || 'pdf'}`
    a.style.display = 'none'
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    window.URL.revokeObjectURL(url)
    
    const response: any = { code: 200, message: '下载成功' }
    showSuccessMessage(response, '下载成功')
  } catch (error: any) {
    console.error('下载报表失败:', error)
    handleApiError(error, '下载报表失败')
  } finally {
    loading.value = false
  }
}

// 删除报表
const deleteReport = async (row: any) => {
  try {
    await ElMessageBox.confirm('确定要删除这个报表吗？', '确认删除', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    })
    
    const response: any = await reportAPI.deleteReportRecord(row.id)
    
    if (response.code === 200) {
      showSuccessMessage(response, '删除成功')
      loadReports()
    } else {
      showErrorMessage(response, '删除失败')
    }
  } catch (error) {
    if (error !== 'cancel') {
      console.error('删除报表失败:', error)
      handleApiError(error, '删除报表失败')
    }
  }
}

// 分页处理
const handleSizeChange = (val: number) => {
  pageSize.value = val
  currentPage.value = 1
  loadReports()
}

const handleCurrentChange = (val: number) => {
  currentPage.value = val
  loadReports()
}

// 组件挂载时加载数据
onMounted(() => {
  loadReports()
})
</script>

<style scoped>
.reports-management {
  padding: 20px;
}

.page-header {
  margin-bottom: 30px;
}

.page-header h1 {
  color: #333;
  margin-bottom: 8px;
}

.page-header p {
  color: #666;
  font-size: 14px;
}

.reports-container {
  background: white;
  border-radius: 8px;
  padding: 24px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.operation-bar {
  margin-bottom: 20px;
  padding-bottom: 16px;
  border-bottom: 1px solid #eee;
}

.operation-bar .el-button {
  margin-right: 12px;
}

.filter-section {
  margin-bottom: 20px;
  padding: 16px;
  background: #f5f5f5;
  border-radius: 6px;
}

.table-section {
  margin-bottom: 20px;
}

.pagination-section {
  display: flex;
  justify-content: center;
  margin-top: 20px;
}
</style> 