<template>
  <div class="supervision-statistics">  
    <!-- 筛选条件 -->
    <div class="filter-section">
      <el-form :model="filterForm" inline>
        <el-form-item label="时间范围">
          <el-date-picker
            v-model="filterForm.dateRange"
            type="daterange"
            range-separator="至"
            start-placeholder="开始日期"
            end-placeholder="结束日期"
            format="YYYY-MM-DD"
            value-format="YYYY-MM-DD"
            :shortcuts="dateShortcuts"
            @change="handleDateChange"
          />
        </el-form-item>
        <el-form-item label="部门">
          <el-select
            v-model="filterForm.department"
            placeholder="选择部门"
            clearable
            @change="handleFilterChange"
          >
            <el-option
              v-for="dept in departmentOptions"
              :key="dept.value"
              :label="dept.label"
              :value="dept.value"
            />
          </el-select>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="loadStatistics">
            <el-icon><Search /></el-icon>
            查询
          </el-button>
          <el-button @click="resetFilter">
            <el-icon><Refresh /></el-icon>
            重置
          </el-button>
        </el-form-item>
      </el-form>
    </div>
    
    <div class="page-content">
      <!-- 统计卡片 -->
      <div class="statistics-cards">
        <div class="stat-card">
          <div class="stat-icon">
            <el-icon><Calendar /></el-icon>
          </div>
          <div class="stat-content">
            <div class="stat-number">{{ statistics.totalRecords || 0 }}</div>
            <div class="stat-label">总督导次数</div>
          </div>
        </div>
        
        <div class="stat-card">
          <div class="stat-icon">
            <el-icon><Check /></el-icon>
          </div>
          <div class="stat-content">
            <div class="stat-number">{{ statistics.completedRecords || 0 }}</div>
            <div class="stat-label">已完成次数</div>
          </div>
        </div>
        
        <div class="stat-card">
          <div class="stat-icon">
            <el-icon><Star /></el-icon>
          </div>
          <div class="stat-content">
            <div class="stat-number">{{ (statistics.averageTeachingScore || 0).toFixed(1) }}</div>
            <div class="stat-label">教学平均分</div>
          </div>
        </div>
        
        <div class="stat-card">
          <div class="stat-icon">
            <el-icon><User /></el-icon>
          </div>
          <div class="stat-content">
            <div class="stat-number">{{ (statistics.averageLearningScore || 0).toFixed(1) }}</div>
            <div class="stat-label">学习平均分</div>
          </div>
        </div>
        
        <div class="stat-card">
          <div class="stat-icon">
            <el-icon><TrendCharts /></el-icon>
          </div>
          <div class="stat-content">
            <div class="stat-number">{{ 
              (() => {
                const rate = statistics.averageAttendanceRate || 0
                return (rate > 1 ? rate : rate * 100).toFixed(1)
              })()
            }}%</div>
            <div class="stat-label">平均到课率</div>
          </div>
        </div>
      </div>
      
      <!-- 图表区域 -->
      <div class="charts-container">
        <div class="chart-card">
          <h3>教学评分分布</h3>
          <div ref="teachingScoreChart" class="chart-container"></div>
        </div>
        
        <div class="chart-card">
          <h3>学习评分分布</h3>
          <div ref="learningScoreChart" class="chart-container"></div>
        </div>
        
        <div class="chart-card">
          <h3>到课率分布</h3>
          <div ref="attendanceChart" class="chart-container"></div>
        </div>
        
        <div class="chart-card trend-chart-card">
          <h3>月度督导趋势</h3>
          <div ref="trendChart" class="chart-container trend-chart-container"></div>
        </div>
      </div>
      
      <!-- 详细统计表格 -->
      <div class="statistics-table">
        <div class="table-header">
          <h3>督导详细统计</h3>
          <div class="table-actions">
            <el-button type="success" @click="exportStatistics">
              <el-icon><Download /></el-icon>
              导出统计
            </el-button>
            <el-button type="primary" @click="showTeacherDetail">
              <el-icon><View /></el-icon>
              教师详情
            </el-button>
          </div>
        </div>
        
        <el-table :data="statistics.byTeacher || []" style="width: 100%">
          <el-table-column prop="teacherName" label="教师姓名" width="120" />
          <el-table-column prop="recordCount" label="督导次数" width="100" />
          <el-table-column prop="averageTeachingScore" label="教学平均分" width="120">
            <template #default="scope">
              {{ (scope.row.averageTeachingScore || 0).toFixed(1) }}
            </template>
          </el-table-column>
          <el-table-column prop="averageLearningScore" label="学习平均分" width="120">
            <template #default="scope">
              {{ (scope.row.averageLearningScore || 0).toFixed(1) }}
            </template>
          </el-table-column>
          <el-table-column prop="averageAttendanceRate" label="平均到课率" width="120">
            <template #default="scope">
              {{ 
                (() => {
                  const rate = scope.row.averageAttendanceRate || 0
                  return (rate > 1 ? rate : rate * 100).toFixed(1)
                })()
              }}%
            </template>
          </el-table-column>
          <el-table-column label="操作" width="120">
            <template #default="scope">
              <el-button type="text" @click="viewTeacherDetail(scope.row)">
                查看详情
              </el-button>
            </template>
          </el-table-column>
        </el-table>
      </div>
    </div>

    <!-- 教师详情对话框 -->
    <el-dialog
      v-model="teacherDetailVisible"
      title="教师督导详情"
      width="800px"
      :before-close="handleCloseTeacherDetail"
      :append-to-body="true"
    >
      <div v-if="selectedTeacher" class="teacher-detail">
        <div class="teacher-info">
          <h4>{{ selectedTeacher.teacherName }}</h4>
          <p>督导次数：{{ selectedTeacher.recordCount }}</p>
        </div>
        
        <div class="detail-charts">
          <div ref="teacherScoreChart" class="detail-chart"></div>
        </div>
        
        <div class="detail-table">
          <h5>评分趋势</h5>
          <el-table :data="selectedTeacher.scoreTrend || []" size="small">
            <el-table-column prop="date" label="日期" width="100" />
            <el-table-column prop="teachingScore" label="教学评分" width="100" />
            <el-table-column prop="learningScore" label="学习评分" width="100" />
            <el-table-column prop="attendanceRate" label="到课率" width="100">
              <template #default="scope">
                {{ 
                  (() => {
                    const rate = scope.row.attendanceRate || 0
                    return (rate > 1 ? rate : rate * 100).toFixed(1)
                  })()
                }}%
              </template>
            </el-table-column>
          </el-table>
        </div>
      </div>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, nextTick, onUnmounted } from 'vue'
import { 
  Calendar, 
  User, 
  Star, 
  Check, 
  TrendCharts, 
  Download, 
  Search, 
  Refresh,
  View
} from '@element-plus/icons-vue'
import { ElMessageBox } from 'element-plus'
import { showSuccessMessage, showErrorMessage, handleApiError } from '@/utils/error-handler'
import { 
  init as echartsInit,
  type ECharts,
  type EChartsOption
} from 'echarts'
import { statisticsAPI } from '../../../api'
import { logger } from '@/utils/logger'
import type { 
  DailyTeachingStatistics, 
  TeachingScoresStatistics, 
  LearningScoresStatistics, 
  AttendanceRatesStatistics,
  TeacherDetailStatistics
} from '../../../types/api'

// 响应式数据
const statistics = ref<DailyTeachingStatistics>({
  totalRecords: 0,
  completedRecords: 0,
  averageTeachingScore: 0,
  averageLearningScore: 0,
  averageAttendanceRate: 0,
  byWeek: [],
  byTeacher: []
})

// 违规类型配置
const violationTypes = ref<Array<{code: string, name: string, description: string}>>([])
const violationTypeNames = ref<string[]>([])

const filterForm = ref({
  dateRange: [] as string[],
  department: ''
})

const departmentOptions = ref([
  { label: '计算机学院', value: 'computer' },
  { label: '数学学院', value: 'math' },
  { label: '物理学院', value: 'physics' },
  { label: '化学学院', value: 'chemistry' }
])

const dateShortcuts = [
  {
    text: '最近一周',
    value: () => {
      const end = new Date()
      const start = new Date()
      start.setTime(start.getTime() - 3600 * 1000 * 24 * 7)
      return [start, end]
    }
  },
  {
    text: '最近一个月',
    value: () => {
      const end = new Date()
      const start = new Date()
      start.setTime(start.getTime() - 3600 * 1000 * 24 * 30)
      return [start, end]
    }
  },
  {
    text: '最近三个月',
    value: () => {
      const end = new Date()
      const start = new Date()
      start.setTime(start.getTime() - 3600 * 1000 * 24 * 90)
      return [start, end]
    }
  }
]

// 图表相关
const teachingScoreChart = ref<HTMLElement>()
const learningScoreChart = ref<HTMLElement>()
const attendanceChart = ref<HTMLElement>()
const trendChart = ref<HTMLElement>()
const teacherScoreChart = ref<HTMLElement>()

let teachingScoreChartInstance: ECharts | null = null
let learningScoreChartInstance: ECharts | null = null
let attendanceChartInstance: ECharts | null = null
let trendChartInstance: ECharts | null = null
let teacherScoreChartInstance: ECharts | null = null

// 教师详情相关
const teacherDetailVisible = ref(false)
const selectedTeacher = ref<TeacherDetailStatistics | null>(null)

// 初始化日期范围
const initDateRange = () => {
  const end = new Date()
  const start = new Date()
  start.setTime(start.getTime() - 3600 * 1000 * 24 * 30) // 默认最近一个月
  filterForm.value.dateRange = [
    start.toISOString().split('T')[0],
    end.toISOString().split('T')[0]
  ]
}

// 加载违规类型配置
const loadViolationTypes = async () => {
  try {
    const response = await statisticsAPI.getViolationTypes() as any
    if (response?.data?.types) {
      violationTypes.value = response.data.types
      violationTypeNames.value = response.data.names
    }
  } catch (error) {
    console.error('加载违规类型配置失败:', error)
    // 使用默认配置
    violationTypes.value = [
      { code: 'gamePlayingCount', name: '玩游戏', description: '上课期间打游戏' },
      { code: 'irrelevantVideoCount', name: '看无关视频', description: '看与上课无关的视频' },
      { code: 'sleepingCount', name: '睡觉', description: '上课期间睡觉（非身体原因）' },
      { code: 'noMaterialsCount', name: '无学习材料', description: '未携带相关教材或学习用品' }
    ]
    violationTypeNames.value = violationTypes.value.map(type => type.name)
  }
}

// 加载统计数据
const loadStatistics = async () => {
  if (!filterForm.value.dateRange || filterForm.value.dateRange.length !== 2) {
    ElMessageBox.warning('请选择时间范围', '提示')
    return
  }

  try {
    const [startDate, endDate] = filterForm.value.dateRange
    const params = {
      startDate,
      endDate,
      department: filterForm.value.department || undefined
    }

    // 并行加载所有统计数据
    const [dailyStats, teachingScores, learningScores, attendanceRates] = await Promise.all([
      (await statisticsAPI.getDailyTeachingStatistics(params)) as any,
      (await statisticsAPI.getTeachingScoresStatistics({ startDate, endDate })) as any,
      (await statisticsAPI.getLearningScoresStatistics({ startDate, endDate })) as any,
      (await statisticsAPI.getAttendanceRatesStatistics({ startDate, endDate })) as any
    ])

    // 处理统计数据
    if (dailyStats?.data) {
      statistics.value = dailyStats.data as unknown as DailyTeachingStatistics
    }
    
    // 等待DOM更新后渲染图表
    await nextTick()
    
    // 延迟渲染图表，确保容器已准备好
    setTimeout(() => {
      if (teachingScores?.data) {
        renderTeachingScoreChart(teachingScores.data as unknown as TeachingScoresStatistics)
      }
      if (learningScores?.data) {
        renderLearningScoreChart(learningScores.data as unknown as LearningScoresStatistics)
      }
      if (attendanceRates?.data) {
        renderAttendanceChart(attendanceRates.data as unknown as AttendanceRatesStatistics)
      }
      renderTrendChart()
    }, 100)

    // 统计数据加载成功，不需要显示消息（数据已显示）
  } catch (error) {
    console.error('加载统计数据失败:', error)
    handleApiError(error, '加载统计数据失败')
  }
}

// 渲染教学评分分布图表
const renderTeachingScoreChart = (data: TeachingScoresStatistics) => {
  if (!teachingScoreChart.value) return

  // 销毁现有实例
  if (teachingScoreChartInstance) {
    teachingScoreChartInstance.dispose()
  }

  teachingScoreChartInstance = echartsInit(teachingScoreChart.value)

  // 检查数据是否存在，如果不存在则使用默认值
  const scoreDistribution = data?.scoreDistribution || {
    'A+': 0,
    'A': 0,
    'B': 0,
    'C': 0,
    'D': 0
  }

  const option: EChartsOption = {
    tooltip: {
      trigger: 'item',
      formatter: '{a} <br/>{b}: {c} ({d}%)'
    },
    legend: {
      orient: 'vertical',
      left: 'left',
      data: ['A+', 'A', 'B', 'C', 'D']
    },
    series: [
      {
        name: '评分分布',
        type: 'pie',
        radius: '50%',
        data: [
          { value: scoreDistribution['A+'] || 0, name: 'A+' },
          { value: scoreDistribution['A'] || 0, name: 'A' },
          { value: scoreDistribution['B'] || 0, name: 'B' },
          { value: scoreDistribution['C'] || 0, name: 'C' },
          { value: scoreDistribution['D'] || 0, name: 'D' }
        ],
        emphasis: {
          itemStyle: {
            shadowBlur: 10,
            shadowOffsetX: 0,
            shadowColor: 'rgba(0, 0, 0, 0.5)'
          }
        }
      }
    ]
  }

  teachingScoreChartInstance.setOption(option, true)
}

// 渲染学习评分分布图表
const renderLearningScoreChart = (data: LearningScoresStatistics) => {
  if (!learningScoreChart.value) return

  // 销毁现有实例
  if (learningScoreChartInstance) {
    learningScoreChartInstance.dispose()
  }

  learningScoreChartInstance = echartsInit(learningScoreChart.value)

  // 检查数据是否存在，如果不存在则使用默认值
  const violationStatistics = data?.violationStatistics || {
    gamePlayingCount: 0,
    irrelevantVideoCount: 0,
    sleepingCount: 0,
    noMaterialsCount: 0
  }

  // 动态构建图表数据
  const chartData = violationTypeNames.value.map(name => {
    const type = violationTypes.value.find(t => t.name === name)
    return violationStatistics[type?.code || ''] || 0
  })

  const option: EChartsOption = {
    tooltip: {
      trigger: 'axis',
      axisPointer: {
        type: 'shadow'
      },
      formatter: (params: any) => {
        const dataIndex = params[0].dataIndex
        const type = violationTypes.value[dataIndex]
        return `${type?.name || ''}: ${params[0].value}次<br/>${type?.description || ''}`
      }
    },
    xAxis: {
      type: 'category',
      data: violationTypeNames.value
    },
    yAxis: {
      type: 'value'
    },
    series: [
      {
        name: '违规次数',
        type: 'bar',
        data: chartData,
        itemStyle: {
          color: '#91cc75'
        }
      }
    ]
  }

  learningScoreChartInstance.setOption(option, true)
}

// 渲染到课率分布图表
const renderAttendanceChart = (data: AttendanceRatesStatistics) => {
  if (!attendanceChart.value) return

  // 销毁现有实例
  if (attendanceChartInstance) {
    attendanceChartInstance.dispose()
  }

  attendanceChartInstance = echartsInit(attendanceChart.value)

  // 检查数据是否存在，如果不存在则使用默认值
  const rateDistribution = data?.rateDistribution || {
    '0.9-1.0': 0,
    '0.8-0.9': 0,
    '0.7-0.8': 0,
    '0.6-0.7': 0
  }

  const option: EChartsOption = {
    tooltip: {
      trigger: 'item',
      formatter: '{a} <br/>{b}: {c} ({d}%)'
    },
    legend: {
      orient: 'vertical',
      left: 'left',
      data: ['90%-100%', '80%-90%', '70%-80%', '60%-70%']
    },
    series: [
      {
        name: '到课率分布',
        type: 'pie',
        radius: '50%',
        data: [
          { value: rateDistribution['0.9-1.0'] || 0, name: '90%-100%' },
          { value: rateDistribution['0.8-0.9'] || 0, name: '80%-90%' },
          { value: rateDistribution['0.7-0.8'] || 0, name: '70%-80%' },
          { value: rateDistribution['0.6-0.7'] || 0, name: '60%-70%' }
        ],
        emphasis: {
          itemStyle: {
            shadowBlur: 10,
            shadowOffsetX: 0,
            shadowColor: 'rgba(0, 0, 0, 0.5)'
          }
        }
      }
    ]
  }

  attendanceChartInstance.setOption(option, true)
}

// 渲染趋势图表
const renderTrendChart = () => {
  if (!trendChart.value) return

  // 销毁现有实例
  if (trendChartInstance) {
    trendChartInstance.dispose()
  }

  trendChartInstance = echartsInit(trendChart.value)

  const weeklyData = statistics.value.byWeek || []
  
  // 解析星期格式：2025-W38 -> 2025年第38周 (9月16日-9月22日)
  const parseWeekFormat = (weekStr: string) => {
    if (!weekStr) return ''
    
    // 匹配格式：2025-W38
    const match = weekStr.match(/^(\d{4})-W(\d{1,2})$/)
    if (match) {
      const year = parseInt(match[1])
      const week = parseInt(match[2])
      
      // 计算该周的开始日期
      const firstDayOfYear = new Date(year, 0, 1)
      const daysToFirstMonday = (8 - firstDayOfYear.getDay()) % 7
      const firstMonday = new Date(year, 0, 1 + daysToFirstMonday)
      
      // 计算目标周的周一
      const targetMonday = new Date(firstMonday)
      targetMonday.setDate(firstMonday.getDate() + (week - 1) * 7)
      
      // 计算该周的周日
      const targetSunday = new Date(targetMonday)
      targetSunday.setDate(targetMonday.getDate() + 6)
      
      // 格式化日期
      const formatDate = (date: Date) => {
        const month = date.getMonth() + 1
        const day = date.getDate()
        return `${month}月${day}日`
      }
      
      return `${year}年第${week}周\n(${formatDate(targetMonday)}-${formatDate(targetSunday)})`
    }
    
    // 如果不是标准格式，直接返回原字符串
    return weekStr
  }
  
  const weeks = weeklyData.map(item => parseWeekFormat(item.week || ''))
  const scores = weeklyData.map(item => item.averageTeachingScore || 0)
  // 后端返回的到课率已经是百分比格式，不需要再乘以100
  const attendanceRates = weeklyData.map(item => {
    const rate = item.averageAttendanceRate || 0
    // 如果值大于1，说明已经是百分比格式，直接使用
    // 如果值小于等于1，说明是小数格式，需要乘以100
    return rate > 1 ? rate : rate * 100
  })
  
  // 如果没有数据，使用默认数据测试
  if (weeks.length === 0) {
    weeks.push('2025年第38周\n(9月16日-9月22日)', '2025年第39周\n(9月23日-9月29日)')
    scores.push(85, 90)
    attendanceRates.push(95, 98)
  }

  const option: EChartsOption = {
    tooltip: {
      trigger: 'axis'
    },
    legend: {
      data: ['平均评分', '到课率(%)'],
      top: 30
    },
    xAxis: {
      type: 'category',
      data: weeks,
      axisLabel: {
        interval: 0, // 显示所有标签
        rotate: 0,   // 不旋转标签
        formatter: function(value: any) {
          // 处理换行符，确保正确显示
          return String(value).replace(/\\n/g, '\n')
        }
      }
    },
    yAxis: [
      {
        type: 'value',
        name: '评分',
        min: 0,
        max: 100
      },
      {
        type: 'value',
        name: '到课率(%)',
        min: 0,
        max: 100
      }
    ],
    series: [
      {
        name: '平均评分',
        type: 'line',
        data: scores,
        yAxisIndex: 0,
        itemStyle: {
          color: '#5470c6'
        }
      },
      {
        name: '到课率(%)',
        type: 'line',
        data: attendanceRates,
        yAxisIndex: 1,
        itemStyle: {
          color: '#91cc75'
        }
      }
    ]
  }

  trendChartInstance.setOption(option, true)
}

// 渲染教师评分趋势图表
const renderTeacherScoreChart = (teacher: TeacherDetailStatistics) => {
  if (!teacherScoreChart.value) return

  // 销毁现有实例
  if (teacherScoreChartInstance) {
    teacherScoreChartInstance.dispose()
  }

  teacherScoreChartInstance = echartsInit(teacherScoreChart.value)

  const scoreTrend = teacher.scoreTrend || []
  const dates = scoreTrend.map(item => item.date || '')
  const teachingScores = scoreTrend.map(item => item.teachingScore || 0)
  const learningScores = scoreTrend.map(item => item.learningScore || 0)
  const attendanceRates = scoreTrend.map(item => {
    const rate = item.attendanceRate || 0
    return rate > 1 ? rate : rate * 100
  })

  const option: EChartsOption = {
    tooltip: {
      trigger: 'axis'
    },
    legend: {
      data: ['教学评分', '学习评分', '到课率(%)'],
      top: 30
    },
    xAxis: {
      type: 'category',
      data: dates
    },
    yAxis: [
      {
        type: 'value',
        name: '评分',
        min: 0,
        max: 100
      },
      {
        type: 'value',
        name: '到课率(%)',
        min: 0,
        max: 100
      }
    ],
    series: [
      {
        name: '教学评分',
        type: 'line',
        data: teachingScores,
        yAxisIndex: 0,
        itemStyle: {
          color: '#5470c6'
        }
      },
      {
        name: '学习评分',
        type: 'line',
        data: learningScores,
        yAxisIndex: 0,
        itemStyle: {
          color: '#ee6666'
        }
      },
      {
        name: '到课率(%)',
        type: 'line',
        data: attendanceRates,
        yAxisIndex: 1,
        itemStyle: {
          color: '#91cc75'
        }
      }
    ]
  }

  teacherScoreChartInstance.setOption(option, true)
}

// 查看教师详情
const viewTeacherDetail = async (teacher: any) => {
  try {
    logger.debug('查看教师详情，教师数据:', teacher)
    
    // 如果没有teacherId，直接显示基本信息
    if (!teacher.teacherId) {
      logger.debug('没有teacherId，使用基本信息')
      selectedTeacher.value = {
        teacherId: teacher.teacherId || '',
        teacherName: teacher.teacherName,
        recordCount: teacher.recordCount,
        averageTeachingScore: teacher.averageTeachingScore,
        averageLearningScore: teacher.averageLearningScore,
        averageAttendanceRate: teacher.averageAttendanceRate,
        scoreTrend: []
      }
      teacherDetailVisible.value = true
      return
    }

    const [startDate, endDate] = filterForm.value.dateRange
    logger.debug('调用教师统计API，参数:', { teacherId: teacher.teacherId, startDate, endDate })
    
    const response = await statisticsAPI.getTeacherStatistics(teacher.teacherId, {
      startDate,
      endDate
    })

    logger.debug('教师统计API响应:', response)

    // 处理教师详情数据
    const responseData = response as any
    let teacherData = responseData?.data || responseData
    
    // 字段映射：后端字段名 -> 前端字段名
    selectedTeacher.value = {
      teacherId: teacherData.teacherId || '',
      teacherName: teacherData.teacherName || '',
      recordCount: teacherData.totalRecords || 0, // 后端是totalRecords，前端是recordCount
      averageTeachingScore: Number(teacherData.averageTeachingScore) || 0,
      averageLearningScore: Number(teacherData.averageLearningScore) || 0,
      averageAttendanceRate: Number(teacherData.averageAttendanceRate) || 0,
      scoreTrend: (teacherData.scoreTrend || []).map((item: any) => ({
        date: item.date || '',
        teachingScore: Number(item.teachingScore) || 0,
        learningScore: Number(item.learningScore) || 0,
        attendanceRate: Number(item.attendanceRate) || 0
      }))
    }
    
    logger.debug('映射后的教师数据:', selectedTeacher.value)
    
    teacherDetailVisible.value = true
    logger.debug('设置selectedTeacher:', selectedTeacher.value)
    
    nextTick(() => {
      if (selectedTeacher.value) {
        logger.debug('渲染教师评分图表')
        renderTeacherScoreChart(selectedTeacher.value)
      }
    })
  } catch (error) {
    console.error('获取教师详情失败:', error)
    handleApiError(error, '获取教师详情失败')
  }
}

// 显示教师详情
const showTeacherDetail = () => {
  if (!statistics.value.byTeacher || statistics.value.byTeacher.length === 0) {
    ElMessageBox.warning('暂无教师数据', '提示')
    return
  }
  viewTeacherDetail(statistics.value.byTeacher[0])
}

// 关闭教师详情
const handleCloseTeacherDetail = () => {
  teacherDetailVisible.value = false
  selectedTeacher.value = null
}

// 导出统计
const exportStatistics = async () => {
  try {
    await ElMessageBox.confirm('确定要导出统计数据吗？', '导出确认', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'info'
    })

    // 这里可以调用导出接口
    const response: any = { code: 200, message: '统计报告导出成功' }
    showSuccessMessage(response, '统计报告导出成功')
  } catch {
    // 用户取消导出
  }
}

// 筛选条件变化处理
const handleDateChange = () => {
  // 日期变化时自动加载数据
  if (filterForm.value.dateRange && filterForm.value.dateRange.length === 2) {
    loadStatistics()
  }
}

const handleFilterChange = () => {
  // 部门变化时重新加载数据
  if (filterForm.value.dateRange && filterForm.value.dateRange.length === 2) {
    loadStatistics()
  }
}

// 重置筛选条件
const resetFilter = () => {
  filterForm.value.department = ''
  initDateRange()
  loadStatistics()
}


// 初始化所有图表
const initAllCharts = async () => {
  await nextTick()
  
  // 延迟初始化图表，确保DOM完全渲染
  setTimeout(() => {
    // 强制重新渲染图表
    if (teachingScoreChartInstance) {
      teachingScoreChartInstance.resize()
    }
    if (learningScoreChartInstance) {
      learningScoreChartInstance.resize()
    }
    if (attendanceChartInstance) {
      attendanceChartInstance.resize()
    }
    if (trendChartInstance) {
      trendChartInstance.resize()
    }
    if (teacherScoreChartInstance) {
      teacherScoreChartInstance.resize()
    }
  }, 200)
}

// 窗口大小变化时重新调整图表
const handleResize = () => {
  teachingScoreChartInstance?.resize()
  learningScoreChartInstance?.resize()
  attendanceChartInstance?.resize()
  trendChartInstance?.resize()
  teacherScoreChartInstance?.resize()
}

// 组件挂载
onMounted(async () => {
  initDateRange()
  await loadViolationTypes() // 先加载违规类型配置
  await loadStatistics()
  await initAllCharts()
  window.addEventListener('resize', handleResize)
})

// 组件卸载
onUnmounted(() => {
  window.removeEventListener('resize', handleResize)
  teachingScoreChartInstance?.dispose()
  learningScoreChartInstance?.dispose()
  attendanceChartInstance?.dispose()
  trendChartInstance?.dispose()
  teacherScoreChartInstance?.dispose()
})
</script>

<style scoped>
.supervision-statistics {
  padding: 20px;
}

.filter-section {
  background: white;
  border-radius: 8px;
  padding: 20px;
  margin-bottom: 20px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.statistics-cards {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 20px;
  margin-bottom: 30px;
}

.stat-card {
  background: white;
  border-radius: 8px;
  padding: 20px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  display: flex;
  align-items: center;
}

.stat-icon {
  width: 50px;
  height: 50px;
  border-radius: 50%;
  background: linear-gradient(135deg, var(--primary-color, #667eea) 0%, var(--el-color-primary-light-3, #764ba2) 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  margin-right: 16px;
}

.stat-icon .el-icon {
  font-size: 20px;
  color: white;
}

.stat-content {
  flex: 1;
}

.stat-number {
  font-size: 24px;
  font-weight: bold;
  color: #333;
  margin-bottom: 4px;
}

.stat-label {
  color: #666;
  font-size: 14px;
}

.charts-container {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(400px, 1fr));
  gap: 20px;
  margin-bottom: 30px;
}

.chart-card {
  background: white;
  border-radius: 8px;
  padding: 20px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.chart-card h3 {
  color: #333;
  margin-bottom: 20px;
  margin-top: 0;
  text-align: center;
}

.chart-container {
  height: 300px;
  width: 100%;
}

/* 月度督导趋势图特殊样式 */
.trend-chart-card {
  grid-column: span 2;
}

.trend-chart-container {
  height: 350px;
}

@media (max-width: 1200px) {
  .trend-chart-card {
    grid-column: span 1;
  }
}

.statistics-table {
  background: white;
  border-radius: 8px;
  padding: 20px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.table-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.table-header h3 {
  color: #333;
  margin: 0;
}

.table-actions {
  display: flex;
  gap: 10px;
}

.teacher-detail {
  padding: 20px 0;
}

.teacher-info {
  text-align: center;
  margin-bottom: 20px;
  padding-bottom: 20px;
  border-bottom: 1px solid #eee;
}

.teacher-info h4 {
  margin: 0 0 10px 0;
  color: #333;
}

.teacher-info p {
  margin: 0;
  color: #666;
}

.detail-charts {
  margin-bottom: 20px;
}

.detail-chart {
  height: 300px;
  width: 100%;
}

.detail-table h5 {
  margin: 0 0 15px 0;
  color: #333;
}

/* 主题色图标样式 */
.el-button .el-icon {
  color: inherit;
}

.el-button--primary .el-icon {
  color: #ffffff;
}

.el-button--default .el-icon {
  color: var(--el-text-color-regular, #606266);
}

.el-button--default:hover .el-icon {
  color: var(--primary-color, #1890ff);
}

/* 深色主题适配 */
body.theme-dark .stat-card {
  background: var(--el-bg-color, #1f1f1f);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.3);
}

body.theme-dark .stat-number {
  color: var(--el-text-color-primary, #ffffff);
}

body.theme-dark .stat-label {
  color: var(--el-text-color-secondary, #cccccc);
}

body.theme-dark .chart-card {
  background: var(--el-bg-color, #1f1f1f);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.3);
}

body.theme-dark .chart-card h3 {
  color: var(--el-text-color-primary, #ffffff);
}

body.theme-dark .statistics-table {
  background: var(--el-bg-color, #1f1f1f);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.3);
}

body.theme-dark .table-header h3 {
  color: var(--el-text-color-primary, #ffffff);
}

body.theme-dark .teacher-info h4 {
  color: var(--el-text-color-primary, #ffffff);
}

body.theme-dark .teacher-info p {
  color: var(--el-text-color-secondary, #cccccc);
}

body.theme-dark .detail-table h5 {
  color: var(--el-text-color-primary, #ffffff);
}

/* 响应式设计 */
@media (max-width: 768px) {
  .statistics-cards {
    grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
  }
  
  .charts-container {
    grid-template-columns: 1fr;
  }
  
  .filter-section .el-form {
    display: flex;
    flex-direction: column;
  }
  
  .filter-section .el-form-item {
    margin-bottom: 15px;
  }
}
</style> 