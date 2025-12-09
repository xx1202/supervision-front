<template>
  <div class="inspection-statistics">
    <div class="page-content">
      <div class="statistics-container">
        <!-- 搜索和过滤区域 -->
        <div class="search-section">
          <el-form :model="searchForm" inline style="display: flex; align-items: center; justify-content: space-between;">
            <el-form-item label="统计周期">
              <el-select v-model="searchForm.statisticsPeriod" placeholder="选择周期" @change="handleSearch">
                <el-option label="周" value="week" />
                <el-option label="月" value="month" />
                <el-option label="学期" value="semester" />
              </el-select>
            </el-form-item>
            <el-form-item label="学期">
              <el-select v-model="searchForm.semester" placeholder="选择学期" @change="handleSearch">
                <el-option label="全部" value="" />
                <el-option label="2024-2025学年第一学期" value="2024-1" />
                <el-option label="2024-2025学年第二学期" value="2024-2" />
              </el-select>
            </el-form-item>
            <el-form-item label="教研室">
              <el-select v-model="searchForm.department" placeholder="选择教研室" @change="handleSearch">
                <el-option label="全部" value="" />
                <el-option label="计算机系" value="计算机系" />
                <el-option label="软件工程系" value="软件工程系" />
                <el-option label="网络工程系" value="网络工程系" />
              </el-select>
            </el-form-item>
            <el-form-item>
              <el-button type="primary" @click="handleSearch">搜索</el-button>
              <el-button @click="resetSearch">重置</el-button>
            </el-form-item>
            <el-form-item style="margin-left: auto;">
              <el-button type="success" @click="exportStatistics">
                <el-icon><Download /></el-icon>
                导出统计
              </el-button>
            </el-form-item>
          </el-form>
        </div>

        <!-- 统计概览卡片 -->
        <div class="statistics-overview">
          <el-row :gutter="20">
            <el-col :span="6">
              <el-card class="overview-card">
                <div class="card-content">
                  <div class="card-icon building-safety">
                    <el-icon><House /></el-icon>
                  </div>
                  <div class="card-info">
                    <div class="card-title">房屋安全</div>
                    <div class="card-value">{{ overviewData.buildingSafetyScore }}/40</div>
                    <div class="card-trend">
                      <span :class="overviewData.buildingSafetyTrend >= 0 ? 'trend-up' : 'trend-down'">
                        {{ overviewData.buildingSafetyTrend >= 0 ? '+' : '' }}{{ overviewData.buildingSafetyTrend }}%
                      </span>
                      较上期
                    </div>
                  </div>
                </div>
              </el-card>
            </el-col>
            <el-col :span="6">
              <el-card class="overview-card">
                <div class="card-content">
                  <div class="card-icon power-safety">
                    <el-icon><Lightning /></el-icon>
                  </div>
                  <div class="card-info">
                    <div class="card-title">电源安全</div>
                    <div class="card-value">{{ overviewData.powerSafetyScore }}/30</div>
                    <div class="card-trend">
                      <span :class="overviewData.powerSafetyTrend >= 0 ? 'trend-up' : 'trend-down'">
                        {{ overviewData.powerSafetyTrend >= 0 ? '+' : '' }}{{ overviewData.powerSafetyTrend }}%
                      </span>
                      较上期
                    </div>
                  </div>
                </div>
              </el-card>
            </el-col>
            <el-col :span="6">
              <el-card class="overview-card">
                <div class="card-content">
                  <div class="card-icon cleanliness">
                    <el-icon><Brush /></el-icon>
                  </div>
                  <div class="card-info">
                    <div class="card-title">内务整理</div>
                    <div class="card-value">{{ overviewData.cleanlinessScore }}/30</div>
                    <div class="card-trend">
                      <span :class="overviewData.cleanlinessTrend >= 0 ? 'trend-up' : 'trend-down'">
                        {{ overviewData.cleanlinessTrend >= 0 ? '+' : '' }}{{ overviewData.cleanlinessTrend }}%
                      </span>
                      较上期
                    </div>
                  </div>
                </div>
              </el-card>
            </el-col>
            <el-col :span="6">
              <el-card class="overview-card">
                <div class="card-content">
                  <div class="card-icon total-score">
                    <el-icon><Star /></el-icon>
                  </div>
                  <div class="card-info">
                    <div class="card-title">总评分</div>
                    <div class="card-value">{{ overviewData.totalScore }}/100</div>
                    <div class="card-trend">
                      <span :class="overviewData.totalTrend >= 0 ? 'trend-up' : 'trend-down'">
                        {{ overviewData.totalTrend >= 0 ? '+' : '' }}{{ overviewData.totalTrend }}%
                      </span>
                      较上期
                    </div>
                  </div>
                </div>
              </el-card>
            </el-col>
          </el-row>
        </div>

        <!-- 图表区域 -->
        <div class="charts-section">
          <el-row :gutter="20">
            <el-col :span="12">
              <el-card class="chart-card">
                <template #header>
                  <div class="card-header">
                    <span>各维度评分趋势</span>
                  </div>
                </template>
                <div class="chart-container">
                  <div ref="trendChart" class="chart"></div>
                </div>
              </el-card>
            </el-col>
            <el-col :span="12">
              <el-card class="chart-card">
                <template #header>
                  <div class="card-header">
                    <span>教研室评分对比</span>
                  </div>
                </template>
                <div class="chart-container">
                  <div ref="comparisonChart" class="chart"></div>
                </div>
              </el-card>
            </el-col>
          </el-row>
        </div>

        <!-- 详细统计表格 -->
        <div class="statistics-table">
          <el-card class="table-card">
            <template #header>
              <div class="card-header">
                <span>详细统计数据</span>
                <el-button type="primary" size="small" @click="refreshTable">刷新</el-button>
              </div>
            </template>
            
            <el-table 
              :data="statisticsList" 
              style="width: 100%" 
              height="400"
              v-loading="tableLoading"
              fit
              border 
            >
              <el-table-column prop="semester" label="学期" width="180" />
              <el-table-column prop="department" label="教研室" width="120" />
              <el-table-column prop="inspectionCount" label="巡查次数" width="100" />
              <el-table-column prop="buildingSafetyScore" label="房屋安全" width="100">
                <template #default="scope">
                  <span :class="getScoreClass(scope.row.buildingSafetyScore)">
                    {{ scope.row.buildingSafetyScore }}/40
                  </span>
                </template>
              </el-table-column>
              <el-table-column prop="powerSafetyScore" label="电源安全" width="100">
                <template #default="scope">
                  <span :class="getScoreClass(scope.row.powerSafetyScore)">
                    {{ scope.row.powerSafetyScore }}/30
                  </span>
                </template>
              </el-table-column>
              <el-table-column prop="cleanlinessScore" label="内务整理" width="100">
                <template #default="scope">
                  <span :class="getScoreClass(scope.row.cleanlinessScore)">
                    {{ scope.row.cleanlinessScore }}/30
                  </span>
                </template>
              </el-table-column>
              <el-table-column prop="totalScore" label="总评分" width="100">
                <template #default="scope">
                  <span :class="getScoreClass(scope.row.totalScore)">
                    {{ scope.row.totalScore }}/100
                  </span>
                </template>
              </el-table-column>
              <el-table-column prop="averageScore" label="平均分" width="100">
                <template #default="scope">
                  <span :class="getScoreClass(scope.row.averageScore)">
                    {{ scope.row.averageScore.toFixed(1) }}
                  </span>
                </template>
              </el-table-column>
              <el-table-column prop="rank" label="排名" width="80">
                <template #default="scope">
                  <el-tag :type="getRankType(scope.row.rank)">
                    {{ scope.row.rank }}
                  </el-tag>
                </template>
              </el-table-column>
            </el-table>
          </el-card>
        </div>

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
</template>

<script setup lang="ts">
import { ref, reactive, onMounted, nextTick } from 'vue'
import { Download, House, Lightning, Brush, Star } from '@element-plus/icons-vue'
import { ElMessageBox } from 'element-plus'
import { showSuccessMessage, handleApiError } from '@/utils/error-handler'
import * as echarts from 'echarts'

// 搜索表单
const searchForm = reactive({
  statisticsPeriod: 'semester',
  semester: '',
  department: ''
})

// 分页信息
const pagination = reactive({
  current: 1,
  size: 10,
  total: 0
})

// 统计数据
const statisticsList = ref<any[]>([])
const tableLoading = ref(false)

// 概览数据
const overviewData = reactive({
  buildingSafetyScore: 38,
  buildingSafetyTrend: 2.5,
  powerSafetyScore: 28,
  powerSafetyTrend: -1.2,
  cleanlinessScore: 27,
  cleanlinessTrend: 3.1,
  totalScore: 93,
  totalTrend: 1.8
})

// 图表引用
const trendChart = ref<HTMLElement>()
const comparisonChart = ref<HTMLElement>()

// 获取分数样式类
const getScoreClass = (score: number) => {
  if (score >= 90) return 'score-excellent'
  if (score >= 80) return 'score-good'
  if (score >= 70) return 'score-average'
  if (score >= 60) return 'score-poor'
  return 'score-fail'
}

// 获取排名样式类型
const getRankType = (rank: number) => {
  if (rank === 1) return 'success'
  if (rank === 2) return 'warning'
  if (rank === 3) return 'info'
  return ''
}

// 加载统计数据列表
const loadStatisticsList = async () => {
  tableLoading.value = true
  try {
    // 模拟API调用
    await new Promise(resolve => setTimeout(resolve, 1000))
    
    // 模拟数据
    statisticsList.value = [
      {
        id: '1',
        semester: '2024-2025学年第一学期',
        department: '计算机系',
        inspectionCount: 45,
        buildingSafetyScore: 38,
        powerSafetyScore: 28,
        cleanlinessScore: 27,
        totalScore: 93,
        averageScore: 92.5,
        rank: 1
      },
      {
        id: '2',
        semester: '2024-2025学年第一学期',
        department: '软件工程系',
        inspectionCount: 42,
        buildingSafetyScore: 36,
        powerSafetyScore: 27,
        cleanlinessScore: 26,
        totalScore: 89,
        averageScore: 88.8,
        rank: 2
      },
      {
        id: '3',
        semester: '2024-2025学年第一学期',
        department: '网络工程系',
        inspectionCount: 40,
        buildingSafetyScore: 35,
        powerSafetyScore: 26,
        cleanlinessScore: 25,
        totalScore: 86,
        averageScore: 85.2,
        rank: 3
      }
    ]
    pagination.total = statisticsList.value.length
  } catch (error: any) {
    handleApiError(error, '加载统计数据失败')
  } finally {
    tableLoading.value = false
  }
}

// 搜索处理
const handleSearch = () => {
  pagination.current = 1
  loadStatisticsList()
  // 重新渲染图表
  nextTick(() => {
    renderTrendChart()
    renderComparisonChart()
  })
}

// 重置搜索
const resetSearch = () => {
  searchForm.statisticsPeriod = 'semester'
  searchForm.semester = ''
  searchForm.department = ''
  handleSearch()
}

// 分页处理
const handleSizeChange = (size: number) => {
  pagination.size = size
  pagination.current = 1
  loadStatisticsList()
}

const handleCurrentChange = (current: number) => {
  pagination.current = current
  loadStatisticsList()
}

// 刷新表格
const refreshTable = () => {
  loadStatisticsList()
}

// 导出统计
const exportStatistics = () => {
  const response: any = { code: 200, message: '统计数据导出成功' }
  showSuccessMessage(response, '统计数据导出成功')
}

// 渲染趋势图表
const renderTrendChart = () => {
  if (!trendChart.value) return
  
  const chart = echarts.init(trendChart.value)
  const option = {
    tooltip: {
      trigger: 'axis'
    },
    legend: {
      data: ['房屋安全', '电源安全', '内务整理', '总评分']
    },
    xAxis: {
      type: 'category',
      data: ['第1周', '第2周', '第3周', '第4周', '第5周', '第6周', '第7周', '第8周']
    },
    yAxis: {
      type: 'value',
      max: 100
    },
    series: [
      {
        name: '房屋安全',
        type: 'line',
        data: [38, 39, 37, 40, 38, 39, 40, 38],
        smooth: true
      },
      {
        name: '电源安全',
        type: 'line',
        data: [28, 29, 27, 30, 28, 29, 30, 28],
        smooth: true
      },
      {
        name: '内务整理',
        type: 'line',
        data: [27, 28, 26, 29, 27, 28, 29, 27],
        smooth: true
      },
      {
        name: '总评分',
        type: 'line',
        data: [93, 96, 90, 99, 93, 96, 99, 93],
        smooth: true
      }
    ]
  }
  chart.setOption(option)
}

// 渲染对比图表
const renderComparisonChart = () => {
  if (!comparisonChart.value) return
  
  const chart = echarts.init(comparisonChart.value)
  const option = {
    tooltip: {
      trigger: 'axis',
      axisPointer: {
        type: 'shadow'
      }
    },
    legend: {
      data: ['房屋安全', '电源安全', '内务整理']
    },
    xAxis: {
      type: 'category',
      data: ['计算机系', '软件工程系', '网络工程系']
    },
    yAxis: {
      type: 'value',
      max: 50
    },
    series: [
      {
        name: '房屋安全',
        type: 'bar',
        data: [38, 36, 35]
      },
      {
        name: '电源安全',
        type: 'bar',
        data: [28, 27, 26]
      },
      {
        name: '内务整理',
        type: 'bar',
        data: [27, 26, 25]
      }
    ]
  }
  chart.setOption(option)
}

// 组件挂载时加载数据和渲染图表
onMounted(() => {
  loadStatisticsList()
  nextTick(() => {
    renderTrendChart()
    renderComparisonChart()
  })
})
</script>

<style scoped>
.inspection-statistics {
  padding: 3px 3px 3px 3px;
  display: flex;
  flex-direction: column;
}

.statistics-container {
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
  padding-bottom: 16px;
}

.statistics-overview {
  margin-bottom: 24px;
}

.overview-card {
  height: 120px;
}

.card-content {
  display: flex;
  align-items: center;
  height: 100%;
}

.card-icon {
  width: 60px;
  height: 60px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-right: 16px;
  font-size: 24px;
  color: white;
}

.building-safety {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
}

.power-safety {
  background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
}

.cleanliness {
  background: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%);
}

.total-score {
  background: linear-gradient(135deg, #43e97b 0%, #38f9d7 100%);
}

.card-info {
  flex: 1;
}

.card-title {
  font-size: 14px;
  color: #666;
  margin-bottom: 8px;
}

.card-value {
  font-size: 24px;
  font-weight: 600;
  color: #333;
  margin-bottom: 8px;
}

.card-trend {
  font-size: 12px;
  color: #999;
}

.trend-up {
  color: #67c23a;
  font-weight: 600;
}

.trend-down {
  color: #f56c6c;
  font-weight: 600;
}

.charts-section {
  margin-bottom: 24px;
}

.chart-card {
  height: 400px;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.chart-container {
  height: 320px;
}

.chart {
  width: 100%;
  height: 100%;
}

.statistics-table {
  margin-bottom: 16px;
}

.table-card {
  flex: 1;
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

/* 分数样式 */
.score-excellent {
  color: #67c23a;
  font-weight: 600;
}

.score-good {
  color: #409eff;
  font-weight: 600;
}

.score-average {
  color: #e6a23c;
  font-weight: 600;
}

.score-poor {
  color: #f56c6c;
  font-weight: 600;
}

.score-fail {
  color: #f56c6c;
  font-weight: 600;
}
</style> 