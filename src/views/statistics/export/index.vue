<template>
  <div class="data-export">
    <div class="page-header">
      <h1>数据导出</h1>
      <p>导出各类数据到Excel、PDF等格式</p>
    </div>
    
    <div class="page-content">
      <div class="export-container">
        <!-- 操作栏 -->
        <div class="operation-bar">
          <el-button type="primary" @click="batchExport">
            <el-icon><Download /></el-icon>
            批量导出
          </el-button>
          <el-button @click="refreshData">
            <el-icon><Refresh /></el-icon>
            刷新
          </el-button>
        </div>
        
        <!-- 导出配置 -->
        <div class="export-config">
          <el-form :model="exportForm" label-width="120px">
            <el-form-item label="数据类型">
              <el-select v-model="exportForm.dataType" placeholder="请选择数据类型">
                <el-option label="督导数据" value="supervision" />
                <el-option label="考勤数据" value="attendance" />
                <el-option label="巡查数据" value="inspection" />
                <el-option label="用户数据" value="user" />
                <el-option label="系统日志" value="log" />
              </el-select>
            </el-form-item>
            
            <el-form-item label="导出格式">
              <el-radio-group v-model="exportForm.format">
                <el-radio label="excel">Excel</el-radio>
                <el-radio label="pdf">PDF</el-radio>
                <el-radio label="csv">CSV</el-radio>
              </el-radio-group>
            </el-form-item>
            
            <el-form-item label="时间范围">
              <el-date-picker
                v-model="exportForm.dateRange"
                type="daterange"
                range-separator="至"
                start-placeholder="开始日期"
                end-placeholder="结束日期"
                format="YYYY-MM-DD"
                value-format="YYYY-MM-DD"
              />
            </el-form-item>
            
            <el-form-item label="筛选条件">
              <el-input
                v-model="exportForm.filter"
                type="textarea"
                :rows="3"
                placeholder="请输入筛选条件（可选）"
              />
            </el-form-item>
            
            <el-form-item>
              <el-button type="primary" @click="startExport">开始导出</el-button>
              <el-button @click="resetForm">重置</el-button>
            </el-form-item>
          </el-form>
        </div>
        
        <!-- 导出历史 -->
        <div class="export-history">
          <h3>导出历史</h3>
          <el-table :data="exportHistory" style="width: 100%">
            <el-table-column prop="fileName" label="文件名" width="200" />
            <el-table-column prop="dataType" label="数据类型" width="120" />
            <el-table-column prop="format" label="格式" width="80" />
            <el-table-column prop="fileSize" label="文件大小" width="100" />
            <el-table-column prop="createTime" label="创建时间" width="150" />
            <el-table-column prop="status" label="状态" width="100">
              <template #default="scope">
                <el-tag :type="getStatusType(scope.row.status)">
                  {{ scope.row.status }}
                </el-tag>
              </template>
            </el-table-column>
            <el-table-column label="操作" width="150">
              <template #default="scope">
                <el-button size="small" @click="downloadFile(scope.row)">下载</el-button>
                <el-button size="small" type="danger" @click="deleteFile(scope.row)">删除</el-button>
              </template>
            </el-table-column>
          </el-table>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive } from 'vue'
import { Download, Refresh } from '@element-plus/icons-vue'
import { ElMessageBox } from 'element-plus'
import { showSuccessMessage } from '@/utils/error-handler'

// 导出表单
const exportForm = reactive({
  dataType: '',
  format: 'excel',
  dateRange: [],
  filter: ''
})

// 导出历史
const exportHistory = ref([
  {
    id: 1,
    fileName: '督导数据-2024年1月.xlsx',
    dataType: '督导数据',
    format: 'Excel',
    fileSize: '2.5MB',
    createTime: '2024-01-15 10:30:00',
    status: '已完成'
  },
  {
    id: 2,
    fileName: '考勤数据-2024年1月.pdf',
    dataType: '考勤数据',
    format: 'PDF',
    fileSize: '1.8MB',
    createTime: '2024-01-15 11:00:00',
    status: '已完成'
  },
  {
    id: 3,
    fileName: '巡查数据-2024年1月.csv',
    dataType: '巡查数据',
    format: 'CSV',
    fileSize: '0.5MB',
    createTime: '2024-01-15 11:30:00',
    status: '处理中'
  }
])

// 获取状态类型
const getStatusType = (status: string) => {
  switch (status) {
    case '已完成':
      return 'success'
    case '处理中':
      return 'warning'
    case '失败':
      return 'danger'
    default:
      return 'info'
  }
}

// 批量导出
const batchExport = () => {
  ElMessageBox.info('批量导出功能', '提示')
}

// 刷新数据
const refreshData = () => {
  const response: any = { code: 200, message: '数据刷新成功' }
  showSuccessMessage(response, '数据刷新成功')
}

// 开始导出
const startExport = () => {
  if (!exportForm.dataType) {
    ElMessageBox.warning('请选择数据类型', '提示')
    return
  }
  
  const response: any = { code: 200, message: '导出任务已提交，请稍后查看导出历史' }
  showSuccessMessage(response, '导出任务已提交，请稍后查看导出历史')
}

// 重置表单
const resetForm = () => {
  exportForm.dataType = ''
  exportForm.format = 'excel'
  exportForm.dateRange = []
  exportForm.filter = ''
  ElMessageBox.info('表单已重置', '提示')
}

// 下载文件
const downloadFile = (row: any) => {
  const response: any = { code: 200, message: `下载文件：${row.fileName}` }
  showSuccessMessage(response, `下载文件：${row.fileName}`)
}

// 删除文件
const deleteFile = (row: any) => {
  ElMessageBox.warning(`删除文件：${row.fileName}`, '提示')
}
</script>

<style scoped>
.data-export {
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

.export-container {
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

.export-config {
  margin-bottom: 30px;
  padding: 20px;
  background: #f8f9fa;
  border-radius: 8px;
  border: 1px solid #e9ecef;
}

.export-history {
  margin-top: 20px;
}

.export-history h3 {
  margin: 0 0 16px 0;
  color: #333;
  font-size: 16px;
}
</style> 