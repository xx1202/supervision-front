<template>
  <div class="statistics-overview">
    <div class="page-header">
      <h1>统计概览</h1>
      <p>查看督导管理系统的整体统计数据</p>
    </div>
    
    <div class="page-content">
      <div class="overview-container">
        <!-- 操作栏 -->
        <div class="operation-bar">
          <el-button type="primary" @click="generateReport">
            <el-icon><Document /></el-icon>
            生成报表
          </el-button>
          <el-button @click="exportExcel">
            <el-icon><Download /></el-icon>
            导出Excel
          </el-button>
          <el-button @click="exportPDF">
            <el-icon><Document /></el-icon>
            导出PDF
          </el-button>
          <el-button @click="refreshData">
            <el-icon><Refresh /></el-icon>
            刷新
          </el-button>
          <el-button @click="printReport">
            <el-icon><Printer /></el-icon>
            打印
          </el-button>
        </div>
        
        <!-- 筛选条件 -->
        <div class="filter-section">
          <el-form :inline="true" :model="filterForm">
            <el-form-item label="统计周期">
              <el-select v-model="filterForm.period" placeholder="本周">
                <el-option label="本周" value="本周" />
                <el-option label="本月" value="本月" />
                <el-option label="本学期" value="本学期" />
                <el-option label="自定义" value="自定义" />
              </el-select>
            </el-form-item>
            <el-form-item label="模块">
              <el-select v-model="filterForm.module" placeholder="全部">
                <el-option label="全部" value="" />
                <el-option label="模块一" value="模块一" />
                <el-option label="模块二" value="模块二" />
                <el-option label="模块三" value="模块三" />
              </el-select>
            </el-form-item>
            <el-form-item>
              <el-button type="primary" @click="searchData">查询</el-button>
              <el-button @click="resetFilter">重置</el-button>
            </el-form-item>
          </el-form>
        </div>
        
        <!-- 统计概览 -->
        <div class="overview-section">
          <el-row :gutter="20">
            <el-col :span="6">
              <div class="stat-card">
                <div class="stat-title">总督导次数</div>
                <div class="stat-value">150次</div>
                <div class="stat-trend">↑ 12%</div>
              </div>
            </el-col>
            <el-col :span="6">
              <div class="stat-card">
                <div class="stat-title">平均得分</div>
                <div class="stat-value">85.6分</div>
                <div class="stat-trend">↑ 3.2%</div>
              </div>
            </el-col>
            <el-col :span="6">
              <div class="stat-card">
                <div class="stat-title">到课率</div>
                <div class="stat-value">92.3%</div>
                <div class="stat-trend">↑ 1.5%</div>
              </div>
            </el-col>
            <el-col :span="6">
              <div class="stat-card">
                <div class="stat-title">问题教室数</div>
                <div class="stat-value">8间</div>
                <div class="stat-trend">↓ 25%</div>
              </div>
            </el-col>
          </el-row>
        </div>
        
        <!-- 图表展示 -->
        <div class="chart-section">
          <el-row :gutter="20">
            <el-col :span="12">
              <div class="chart-card">
                <h3>得分趋势图</h3>
                <div class="chart-placeholder">
                  <el-empty description="图表区域" />
                </div>
              </div>
            </el-col>
            <el-col :span="12">
              <div class="chart-card">
                <h3>到课率统计</h3>
                <div class="chart-placeholder">
                  <el-empty description="图表区域" />
                </div>
              </div>
            </el-col>
          </el-row>
          <el-row :gutter="20" style="margin-top: 20px;">
            <el-col :span="12">
              <div class="chart-card">
                <h3>问题分布图</h3>
                <div class="chart-placeholder">
                  <el-empty description="图表区域" />
                </div>
              </div>
            </el-col>
            <el-col :span="12">
              <div class="chart-card">
                <h3>排名统计</h3>
                <div class="chart-placeholder">
                  <el-empty description="图表区域" />
                </div>
              </div>
            </el-col>
          </el-row>
        </div>
        
        <!-- 详细数据 -->
        <div class="detail-section">
          <h3>详细数据</h3>
          <el-table :data="detailList" style="width: 100%">
            <el-table-column prop="date" label="日期" width="120" />
            <el-table-column prop="classroom" label="教室" width="100" />
            <el-table-column prop="inspector" label="督导员" width="120" />
            <el-table-column prop="score" label="得分" width="100" />
            <el-table-column prop="attendanceRate" label="到课率" width="100" />
            <el-table-column prop="issues" label="问题" width="200" />
            <el-table-column prop="status" label="状态" width="100">
              <template #default="scope">
                <el-tag :type="getStatusType(scope.row.status)">
                  {{ scope.row.status }}
                </el-tag>
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
import { Document, Download, Refresh, Printer } from '@element-plus/icons-vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { showSuccessMessage } from '@/utils/error-handler'

// 筛选表单
const filterForm = reactive({
  period: '本周',
  module: ''
})

// 详细数据
const detailList = ref([
  {
    id: 1,
    date: '2024-01-15',
    classroom: '101',
    inspector: '张老师',
    score: '83.9',
    attendanceRate: '91.4%',
    issues: '无',
    status: '已审核'
  },
  {
    id: 2,
    date: '2024-01-15',
    classroom: '102',
    inspector: '李老师',
    score: '87.2',
    attendanceRate: '88.6%',
    issues: '桌面不整洁',
    status: '已审核'
  }
])

// 获取状态类型
const getStatusType = (status: string) => {
  switch (status) {
    case '已审核':
      return 'success'
    case '待审核':
      return 'warning'
    default:
      return 'info'
  }
}

// 生成报表
const generateReport = () => {
  const response: any = { code: 200, message: '报表生成成功' }
  showSuccessMessage(response, '报表生成成功')
}

// 导出Excel
const exportExcel = () => {
  const response: any = { code: 200, message: 'Excel导出成功' }
  showSuccessMessage(response, 'Excel导出成功')
}

// 导出PDF
const exportPDF = () => {
  const response: any = { code: 200, message: 'PDF导出成功' }
  showSuccessMessage(response, 'PDF导出成功')
}

// 刷新数据
const refreshData = () => {
  const response: any = { code: 200, message: '数据刷新成功' }
  showSuccessMessage(response, '数据刷新成功')
}

// 打印报表
const printReport = () => {
  ElMessage.info('打印功能')
}

// 搜索数据
const searchData = () => {
  ElMessage.info('搜索统计数据')
}

// 重置筛选
const resetFilter = () => {
  filterForm.period = '本周'
  filterForm.module = ''
  ElMessage.info('重置筛选条件')
}
</script>

<style scoped>
.statistics-overview {
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

.overview-container {
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

.overview-section {
  margin-bottom: 30px;
}

.stat-card {
  background: #f8f9fa;
  border-radius: 8px;
  padding: 20px;
  text-align: center;
  border: 1px solid #e9ecef;
}

.stat-title {
  color: #666;
  font-size: 14px;
  margin-bottom: 8px;
}

.stat-value {
  color: #333;
  font-size: 24px;
  font-weight: bold;
  margin-bottom: 4px;
}

.stat-trend {
  font-size: 12px;
  color: #52c41a;
}

.chart-section {
  margin-bottom: 30px;
}

.chart-card {
  background: #f8f9fa;
  border-radius: 8px;
  padding: 20px;
  border: 1px solid #e9ecef;
}

.chart-card h3 {
  margin: 0 0 16px 0;
  color: #333;
  font-size: 16px;
}

.chart-placeholder {
  height: 200px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.detail-section {
  margin-top: 20px;
}

.detail-section h3 {
  margin: 0 0 16px 0;
  color: #333;
  font-size: 16px;
}
</style> 