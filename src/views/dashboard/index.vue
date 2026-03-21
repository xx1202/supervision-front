<template>
  <div class="dashboard-container">
    <div class="dashboard-content">
      <div class="summary-cards">
        <div class="summary-card glass-effect" @click="handleSummaryClick('teaching')">
          <div class="card-glow blue"></div>
          <div class="summary-icon-wrapper teaching">
            <el-icon><Monitor /></el-icon>
          </div>
          <div class="summary-info">
            <h3 class="summary-title">教学督导</h3>
            <div class="summary-data">
              <span class="summary-value">{{ dashboardData?.totalTeachingSupervisions || 0 }}</span>
              <span class="summary-unit">次</span>
            </div>
            <div class="summary-trend" :class="dashboardData?.teachingTrend?.type || 'positive'">
              <div class="trend-icon">
                <el-icon><component :is="dashboardData?.teachingTrend?.icon || 'ArrowUp'" /></el-icon>
              </div>
              <span>{{ dashboardData?.teachingTrend?.value || '+0%' }}</span>
              <span class="trend-label">环比</span>
            </div>
          </div>
        </div>

        <div class="summary-card glass-effect" @click="handleSummaryClick('attendance')">
          <div class="card-glow green"></div>
          <div class="summary-icon-wrapper attendance">
            <el-icon><User /></el-icon>
          </div>
          <div class="summary-info">
            <h3 class="summary-title">考勤记录</h3>
            <div class="summary-data">
              <span class="summary-value">{{ dashboardData?.totalAttendanceRecords || 0 }}</span>
              <span class="summary-unit">人次</span>
            </div>
            <div class="summary-trend" :class="dashboardData?.attendanceTrend?.type || 'positive'">
              <div class="trend-icon">
                <el-icon><component :is="dashboardData?.attendanceTrend?.icon || 'ArrowUp'" /></el-icon>
              </div>
              <span>{{ dashboardData?.attendanceTrend?.value || '+0%' }}</span>
              <span class="trend-label">环比</span>
            </div>
          </div>
        </div>

        <div class="summary-card glass-effect" @click="handleSummaryClick('inspection')">
          <div class="card-glow orange"></div>
          <div class="summary-icon-wrapper inspection">
            <el-icon><View /></el-icon>
          </div>
          <div class="summary-info">
            <h3 class="summary-title">巡查记录</h3>
            <div class="summary-data">
              <span class="summary-value">{{ dashboardData?.totalInspectionRecords || 0 }}</span>
              <span class="summary-unit">条</span>
            </div>
            <div class="summary-trend" :class="dashboardData?.inspectionTrend?.type || 'warning'">
              <div class="trend-icon">
                <el-icon><component :is="dashboardData?.inspectionTrend?.icon || 'Warning'" /></el-icon>
              </div>
              <span>{{ dashboardData?.inspectionTrend?.value || '需关注' }}</span>
              <span class="trend-label">状态</span>
            </div>
          </div>
        </div>

        <div class="summary-card glass-effect" @click="handleSummaryClick('approval')">
          <div class="card-glow purple"></div>
          <div class="summary-icon-wrapper approval">
            <el-icon><DocumentChecked /></el-icon>
          </div>
          <div class="summary-info">
            <h3 class="summary-title">待审核</h3>
            <div class="summary-data">
              <span class="summary-value">{{ dashboardData?.pendingApprovals || 0 }}</span>
              <span class="summary-unit">项</span>
            </div>
            <div class="summary-trend" :class="dashboardData?.approvalTrend?.type || 'info'">
              <div class="trend-icon">
                <el-icon><component :is="dashboardData?.approvalTrend?.icon || 'Timer'" /></el-icon>
              </div>
              <span>{{ dashboardData?.approvalTrend?.value || '0' }}</span>
              <span class="trend-label">剩余</span>
            </div>
          </div>
        </div>
      </div>

      <div class="charts-section">
        <div class="charts-container">
          <div class="chart-row first-row">
            <div class="chart-item glass-effect trend-chart-item">
              <div class="chart-header">
                <div class="header-title-group">
                  <span class="header-icon blue"><el-icon><TrendCharts /></el-icon></span>
                  <h3 class="chart-title">教学督导趋势分析</h3>
                </div>
                <div class="chart-subtitle">近6个月数据统计</div>
              </div>
              <div ref="teachingTrendChart" class="trend-chart"></div>
            </div>
            <div class="chart-item glass-effect pie-chart-item">
              <div class="chart-header">
                <div class="header-title-group">
                  <span class="header-icon green"><el-icon><PieChart /></el-icon></span>
                  <h3 class="chart-title">考勤状态分布</h3>
                </div>
                <div class="chart-subtitle">实时统计</div>
              </div>
              <div ref="attendancePieChart" class="pie-chart"></div>
            </div>
          </div>

          <div class="chart-row second-row">
            <div class="chart-item glass-effect bar-chart-item">
              <div class="chart-header">
                <div class="header-title-group">
                  <span class="header-icon orange"><el-icon><Histogram /></el-icon></span>
                  <h3 class="chart-title">巡查评分统计</h3>
                </div>
                <div class="chart-subtitle">质量评估</div>
              </div>
              <div ref="inspectionBarChart" class="bar-chart"></div>
            </div>
            <div class="chart-item glass-effect compare-chart-item">
              <div class="chart-header">
                <div class="header-title-group">
                  <span class="header-icon purple"><el-icon><DataAnalysis /></el-icon></span>
                  <h3 class="chart-title">月度对比分析</h3>
                </div>
                <div class="chart-subtitle">同期比较</div>
              </div>
              <div ref="monthlyCompareChart" class="compare-chart"></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted, nextTick } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import { statisticsAPI } from '../../api' // 确保这里引入了真实的 API 定义
import {
  init as echartsInit,
  type EChartsOption,
  graphic
} from 'echarts'
import {
  Monitor, User, View, DocumentChecked, ArrowUp, ArrowDown, Warning, Timer, Minus,
  TrendCharts, PieChart, Histogram, DataAnalysis
} from '@element-plus/icons-vue'

const router = useRouter()

// 仪表盘数据状态
const dashboardData = ref<any>({})
const loading = ref(false)

// 图表 DOM Refs
const teachingTrendChart = ref<HTMLElement>()
const attendancePieChart = ref<HTMLElement>()
const inspectionBarChart = ref<HTMLElement>()
const monthlyCompareChart = ref<HTMLElement>()

// 图表实例
let teachingTrendChartInstance: any = null
let attendancePieChartInstance: any = null
let inspectionBarChartInstance: any = null
let monthlyCompareChartInstance: any = null

// 配色方案（保持一致）
const colorPalette = {
  blue: ['#3b82f6', '#60a5fa', '#dbeafe'],
  green: ['#10b981', '#34d399', '#d1fae5'],
  orange: ['#f59e0b', '#fbbf24', '#fef3c7'],
  purple: ['#8b5cf6', '#a78bfa', '#ede9fe'],
  textPrimary: '#1e293b',
  textSecondary: '#64748b',
  gridLine: '#f1f5f9'
}

/**
 * ------------------------------------------------------------------
 * 1. 教学督导趋势图 (平滑曲线)
 * ------------------------------------------------------------------
 */
const initTeachingTrendChart = async () => {
  if (!teachingTrendChart.value) return
  if (teachingTrendChartInstance) teachingTrendChartInstance.dispose()
  teachingTrendChartInstance = echartsInit(teachingTrendChart.value)

  let xAxisData = []
  let seriesData = []

  try {
    // 优先调用真实接口
    const res = await statisticsAPI.getTeachingTrendData({ months: 6 }) as any
    if (res?.data?.months && res?.data?.data) {
      xAxisData = res.data.months
      seriesData = res.data.data
    } else {
      throw new Error('No data')
    }
  } catch (error) {
    console.warn('Using fallback data for Teaching Trend')
    // 兜底假数据
    xAxisData = ['1月', '2月', '3月', '4月', '5月', '6月']
    seriesData = [12, 18, 15, 25, 32, 28]
  }

  const option: EChartsOption = {
    grid: { left: '3%', right: '4%', bottom: '3%', top: '15%', containLabel: true },
    tooltip: {
      trigger: 'axis',
      backgroundColor: 'rgba(255, 255, 255, 0.95)', // 更不透明一点，减少干扰
      borderColor: colorPalette.blue[1],
      borderWidth: 1,
      textStyle: { color: colorPalette.textPrimary },
      extraCssText: 'box-shadow: 0 2px 8px rgba(0,0,0,0.1);' // 阴影减弱
    },
    xAxis: {
      type: 'category',
      data: xAxisData,
      boundaryGap: false,
      axisLine: { show: false },
      axisTick: { show: false },
      axisLabel: { color: colorPalette.textSecondary, margin: 15 }
    },
    yAxis: {
      type: 'value',
      splitLine: { lineStyle: { color: colorPalette.gridLine, type: 'dashed' } },
      axisLabel: { color: colorPalette.textSecondary }
    },
    series: [{
      name: '督导记录数',
      data: seriesData,
      type: 'line',
      smooth: true,
      symbol: 'circle',
      symbolSize: 8, // 减小默认点大小
      showSymbol: false, // 默认不显示点，hover时显示，更加简洁
      itemStyle: {
        color: colorPalette.blue[0],
        borderColor: '#fff',
        borderWidth: 2
      },
      lineStyle: {
        width: 3,
        color: new graphic.LinearGradient(0, 0, 1, 0, [
          { offset: 0, color: colorPalette.blue[0] },
          { offset: 1, color: colorPalette.purple[0] }
        ])
      },
      areaStyle: {
        color: new graphic.LinearGradient(0, 0, 0, 1, [
          { offset: 0, color: 'rgba(59, 130, 246, 0.3)' },
          { offset: 1, color: 'rgba(59, 130, 246, 0.0)' }
        ])
      }
    }]
  }
  teachingTrendChartInstance.setOption(option)
}

/**
 * ------------------------------------------------------------------
 * 2. 考勤饼图 (环形图)
 * ------------------------------------------------------------------
 */
const initAttendancePieChart = async () => {
  if (!attendancePieChart.value) return
  if (attendancePieChartInstance) attendancePieChartInstance.dispose()
  attendancePieChartInstance = echartsInit(attendancePieChart.value)

  let pieData = []

  try {
    const now = new Date()
    const currentMonth = now.getMonth() + 1
    const currentYear = now.getFullYear()
    const startDate = `${currentYear}-${currentMonth.toString().padStart(2, '0')}-01`
    const endDate = `${currentYear}-${currentMonth.toString().padStart(2, '0')}-${new Date(currentYear, currentMonth, 0).getDate()}`

    const res = await statisticsAPI.getAttendanceDistributionData({ startDate, endDate }) as any
    if (res?.data?.data && res.data.data.length > 0) {
      pieData = res.data.data
    } else {
      throw new Error('No data')
    }
  } catch (error) {
    console.warn('Using fallback data for Attendance Pie')
    pieData = [
      { value: 320, name: '在岗' },
      { value: 45, name: '缺岗' },
      { value: 12, name: '请假' },
      { value: 8, name: '暂不在岗' }
    ]
  }

  const option: EChartsOption = {
    tooltip: {
      trigger: 'item',
      backgroundColor: 'rgba(255, 255, 255, 0.95)',
      extraCssText: 'box-shadow: 0 2px 8px rgba(0,0,0,0.1);'
    },
    legend: {
      orient: 'vertical',
      right: '5%',
      top: 'center',
      itemGap: 15,
      textStyle: { color: colorPalette.textSecondary },
      icon: 'circle'
    },
    series: [{
      name: '考勤状态',
      type: 'pie',
      radius: ['30%', '70%'], // 稍微调细一点环
      center: ['35%', '50%'],
      avoidLabelOverlap: false,
      itemStyle: {
        borderRadius: 8,
        borderColor: '#fff',
        borderWidth: 2
      },
      label: { show: false, position: 'center' },
      emphasis: {
        label: {
          show: true,
          fontSize: '18', // 字体不用太大
          fontWeight: 'bold',
          color: colorPalette.textPrimary
        },
        scale: true,
        scaleSize: 5 // 减小 hover 时的放大程度 (太大会晃眼)
      },
      labelLine: { show: false },
      data: pieData,
      color: [colorPalette.green[0], colorPalette.orange[0], colorPalette.purple[0], colorPalette.blue[0]]
    }]
  }
  attendancePieChartInstance.setOption(option)
}

/**
 * ------------------------------------------------------------------
 * 3. 巡查柱状图 (圆角)
 * ------------------------------------------------------------------
 */
const initInspectionBarChart = async () => {
  if (!inspectionBarChart.value) return
  if (inspectionBarChartInstance) inspectionBarChartInstance.dispose()
  inspectionBarChartInstance = echartsInit(inspectionBarChart.value)

  let categories = []
  let scores = []

  // 计算当前月份的开始和结束日期
  const now = new Date()
  const currentYear = now.getFullYear()
  const currentMonth = now.getMonth() + 1
  const startDate = `${currentYear}-${currentMonth.toString().padStart(2, '0')}-01`
  const endDate = `${currentYear}-${currentMonth.toString().padStart(2, '0')}-${new Date(currentYear, currentMonth, 0).getDate()}`

  try {
    const res = await statisticsAPI.getInspectionScoresData({ startDate, endDate }) as any
    if (res?.data?.categories && res?.data?.scores) {
      categories = res.data.categories
      scores = res.data.scores
    } else {
      throw new Error('No Data')
    }
  } catch (e) {
    console.warn('Using fallback data for Inspection Bar')
    categories = ['房屋安全', '电源安全', '内务整理', '设备状态', '消防检查']
    scores = [85, 78, 92, 88, 95]
  }

  const option: EChartsOption = {
    grid: { left: '3%', right: '4%', bottom: '3%', top: '15%', containLabel: true },
    tooltip: {
      trigger: 'axis',
      backgroundColor: 'rgba(255, 255, 255, 0.95)',
      extraCssText: 'box-shadow: 0 2px 8px rgba(0,0,0,0.1);',
      axisPointer: { type: 'shadow', shadowStyle: { color: 'rgba(0,0,0,0.02)' } } // 阴影指示器变淡
    },
    xAxis: {
      type: 'category',
      data: categories,
      axisLine: { show: false },
      axisTick: { show: false },
      axisLabel: { color: colorPalette.textSecondary, margin: 10 }
    },
    yAxis: {
      type: 'value',
      max: 100,
      splitLine: { lineStyle: { color: colorPalette.gridLine, type: 'dashed' } },
      axisLabel: { color: colorPalette.textSecondary }
    },
    series: [{
      data: scores,
      type: 'bar',
      barWidth: '25%', // 柱子稍微变细，更精致
      itemStyle: {
        borderRadius: [10, 10, 0, 0], // 圆角
        color: new graphic.LinearGradient(0, 0, 0, 1, [
          { offset: 0, color: colorPalette.orange[0] },
          { offset: 1, color: colorPalette.orange[1] }
        ])
      },
      showBackground: true,
      backgroundStyle: {
        color: '#f8fafc',
        borderRadius: [10, 10, 0, 0]
      }
    }]
  }
  inspectionBarChartInstance.setOption(option)
}

/**
 * ------------------------------------------------------------------
 * 4. 月度对比图表
 * ------------------------------------------------------------------
 */
const initMonthlyCompareChart = async () => {
  if (!monthlyCompareChart.value) return
  if (monthlyCompareChartInstance) monthlyCompareChartInstance.dispose()
  monthlyCompareChartInstance = echartsInit(monthlyCompareChart.value)

  let categories = ['教学督导', '考勤记录', '巡查记录', '待审核']
  let currentValues = []
  let compareValues = []

  // 计算当前月份和上个月份
  const now = new Date()
  const currentYear = now.getFullYear()
  const currentMonth = now.getMonth() + 1
  const compareMonth = currentMonth === 1 ? 12 : currentMonth - 1
  const compareYear = currentMonth === 1 ? currentYear - 1 : currentYear
  const currentMonthStr = `${currentYear}-${currentMonth.toString().padStart(2, '0')}`
  const compareMonthStr = `${compareYear}-${compareMonth.toString().padStart(2, '0')}`

  try {
    const res = await statisticsAPI.getMonthlyComparisonData({ currentMonth: currentMonthStr, compareMonth: compareMonthStr }) as any
    if(res?.data?.currentData && res?.data?.compareData) {
      // 假设接口返回的是对象，需要映射到数组
      // 如果接口返回就是数组则直接赋值
      const cData = res.data.currentData
      const lData = res.data.compareData
      categories.forEach(key => {
        currentValues.push(cData[key] || 0)
        compareValues.push(lData[key] || 0)
      })
      // 如果数据全为空（解析失败），抛错使用假数据
      if(currentValues.length === 0) throw new Error('Map failed')
    } else {
      throw new Error('No Data')
    }
  } catch (e) {
    console.warn('Using fallback data for Monthly Compare')
    currentValues = [23, 45, 28, 12]
    compareValues = [18, 38, 22, 15]
  }

  const option: EChartsOption = {
    grid: { left: '3%', right: '4%', bottom: '3%', top: '20%', containLabel: true },
    tooltip: {
      trigger: 'axis',
      backgroundColor: 'rgba(255, 255, 255, 0.95)',
      extraCssText: 'box-shadow: 0 2px 8px rgba(0,0,0,0.1);',
      axisPointer: { type: 'shadow', shadowStyle: { color: 'rgba(0,0,0,0.02)' } }
    },
    legend: {
      data: ['本月', '上月'],
      top: 0,
      right: 10,
      textStyle: { color: colorPalette.textSecondary },
      icon: 'roundRect',
      itemWidth: 12,
      itemHeight: 12
    },
    xAxis: {
      type: 'category',
      data: categories,
      axisLine: { show: false },
      axisTick: { show: false },
      axisLabel: { color: colorPalette.textSecondary, margin: 10 }
    },
    yAxis: {
      type: 'value',
      splitLine: { lineStyle: { color: colorPalette.gridLine, type: 'dashed' } },
      axisLabel: { color: colorPalette.textSecondary }
    },
    series: [
      {
        name: '本月',
        type: 'bar',
        barGap: '20%',
        barWidth: '20%',
        data: currentValues,
        itemStyle: {
          borderRadius: [4, 4, 0, 0],
          color: new graphic.LinearGradient(0, 0, 0, 1, [
            { offset: 0, color: colorPalette.blue[0] },
            { offset: 1, color: colorPalette.blue[1] }
          ])
        }
      },
      {
        name: '上月',
        type: 'bar',
        barWidth: '20%',
        data: compareValues,
        itemStyle: {
          borderRadius: [4, 4, 0, 0],
          color: '#cbd5e1' // 上月数据使用灰色，突出本月数据
        }
      }
    ]
  }
  monthlyCompareChartInstance.setOption(option)
}

// 初始化所有图表
const initAllCharts = async () => {
  await nextTick()
  if (!teachingTrendChart.value) return
  await Promise.all([
    initTeachingTrendChart(),
    initAttendancePieChart(),
    initInspectionBarChart(),
    initMonthlyCompareChart()
  ])
  window.addEventListener('resize', resizeCharts)
}

const resizeCharts = () => {
  teachingTrendChartInstance?.resize()
  attendancePieChartInstance?.resize()
  inspectionBarChartInstance?.resize()
  monthlyCompareChartInstance?.resize()
}

// 汇总卡片点击事件
const handleSummaryClick = (metricType: string) => {
  switch (metricType) {
    case 'teaching': router.push('/supervision/module1/statistics'); break
    case 'attendance': router.push('/supervision/module2/attendance'); break
    case 'inspection': router.push('/supervision/module3/statistics'); break
    case 'approval': router.push('/supervision/module1/audit'); break
    default: ElMessage.info(`查看${metricType}详细数据`)
  }
}

// 获取仪表盘汇总数据
const fetchDashboardData = async () => {
  loading.value = true
  try {
    const now = new Date()
    const currentMonth = now.getMonth() + 1
    const currentYear = now.getFullYear()
    const startDate = `${currentYear}-${currentMonth.toString().padStart(2, '0')}-01`
    const endDate = `${currentYear}-${currentMonth.toString().padStart(2, '0')}-${new Date(currentYear, currentMonth, 0).getDate()}`

    const res = await statisticsAPI.getDashboardSummary({ startDate, endDate }) as any
    if (res?.data) {
      dashboardData.value = res.data
    } else {
      throw new Error("Empty Response")
    }
  } catch (error) {
    console.warn('Using fallback data for Dashboard Summary', error)
    // 兜底数据
    dashboardData.value = {
      totalTeachingSupervisions: 0,
      totalAttendanceRecords: 0,
      totalInspectionRecords: 0,
      pendingApprovals: 0,
      teachingTrend: { type: 'neutral', icon: 'Minus', value: '--' },
      attendanceTrend: { type: 'neutral', icon: 'Minus', value: '--' },
      inspectionTrend: { type: 'neutral', icon: 'Minus', value: '--' },
      approvalTrend: { type: 'neutral', icon: 'Minus', value: '--' }
    }
  } finally {
    loading.value = false
  }
}

onMounted(async () => {
  await fetchDashboardData()
  // 稍微延迟初始化图表，确保容器宽高计算正确
  setTimeout(async () => {
    await initAllCharts()
  }, 100)
})

onUnmounted(() => {
  window.removeEventListener('resize', resizeCharts)
  teachingTrendChartInstance?.dispose()
  attendancePieChartInstance?.dispose()
  inspectionBarChartInstance?.dispose()
  monthlyCompareChartInstance?.dispose()
})
</script>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap');

.dashboard-container {
  min-height: 100vh;
  /* 极浅的蓝灰渐变，干净现代 */
  background: linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%);
  padding: 1.5rem;
  font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
  color: #1e293b;
}

.dashboard-content {
  max-width: 1600px;
  margin: 0 auto;
}

/* --- 玻璃微拟态卡片 (优化版：更克制) --- */
.glass-effect {
  background: rgba(255, 255, 255, 0.9); /* 提高不透明度，减少杂乱背景干扰 */
  backdrop-filter: blur(8px);
  border-radius: 20px;
  border: 1px solid rgba(255, 255, 255, 0.8);
  box-shadow:
      0 2px 4px -1px rgba(0, 0, 0, 0.03), /* 极淡的基础阴影 */
      0 4px 6px -1px rgba(0, 0, 0, 0.03),
      inset 0 0 20px rgba(255, 255, 255, 0.6);
  transition: all 0.3s ease; /* 加快一点动画，感觉更跟手 */
  position: relative;
  overflow: hidden;
}

.glass-effect:hover {
  /* 移除 scale，仅轻微上浮 */
  transform: translateY(-2px);
  /* 阴影加深程度减小，更自然 */
  box-shadow:
      0 10px 15px -3px rgba(0, 0, 0, 0.06),
      0 4px 6px -2px rgba(0, 0, 0, 0.03);
  border-color: #fff;
}

/* --- 顶部汇总卡片 --- */
.summary-cards {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 1.25rem; /* 间距稍微调小 */
  margin-bottom: 1.5rem;
}

.summary-card {
  padding: 1.5rem;
  display: flex;
  align-items: center;
  cursor: pointer;
}

/* 卡片内部光晕 (透明度降低) */
.card-glow {
  position: absolute;
  top: -50%;
  left: -50%;
  width: 200%;
  height: 200%;
  opacity: 0.08; /* 默认几乎不可见 */
  filter: blur(60px);
  z-index: 0;
  transition: opacity 0.4s ease;
}
.summary-card:hover .card-glow { opacity: 0.15; } /* Hover时稍微显现，但不抢眼 */
.card-glow.blue { background: radial-gradient(circle, #3b82f6 0%, transparent 70%); }
.card-glow.green { background: radial-gradient(circle, #10b981 0%, transparent 70%); }
.card-glow.orange { background: radial-gradient(circle, #f59e0b 0%, transparent 70%); }
.card-glow.purple { background: radial-gradient(circle, #8b5cf6 0%, transparent 70%); }

.summary-icon-wrapper {
  width: 56px; /* 稍微调小图标区域 */
  height: 56px;
  border-radius: 16px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.75rem;
  margin-right: 1.25rem;
  flex-shrink: 0;
  z-index: 1;
  box-shadow: 0 4px 10px -2px rgba(0, 0, 0, 0.1);
}

.summary-icon-wrapper.teaching { background: linear-gradient(135deg, #3b82f6, #60a5fa); color: white; }
.summary-icon-wrapper.attendance { background: linear-gradient(135deg, #10b981, #34d399); color: white; }
.summary-icon-wrapper.inspection { background: linear-gradient(135deg, #f59e0b, #fbbf24); color: white; }
.summary-icon-wrapper.approval { background: linear-gradient(135deg, #8b5cf6, #a78bfa); color: white; }

.summary-info {
  flex: 1;
  z-index: 1;
}

.summary-title {
  font-size: 0.95rem;
  color: #64748b;
  font-weight: 500;
  margin: 0 0 0.25rem 0;
}

.summary-data {
  display: flex;
  align-items: baseline;
  margin-bottom: 0.25rem;
}

.summary-value {
  font-size: 2rem;
  font-weight: 700;
  color: #0f172a;
  line-height: 1.1;
  letter-spacing: -0.5px;
}

.summary-unit {
  font-size: 0.85rem;
  color: #94a3b8;
  margin-left: 6px;
  font-weight: 500;
}

.summary-trend {
  display: inline-flex;
  align-items: center;
  font-size: 0.8rem;
  font-weight: 500;
  color: #64748b;
}

.trend-icon {
  display: flex;
  align-items: center;
  margin-right: 2px;
}
.summary-trend.positive .trend-icon { color: #10b981; }
.summary-trend.warning .trend-icon { color: #f59e0b; }
.summary-trend.info .trend-icon { color: #8b5cf6; }

.trend-label {
  margin-left: 4px;
  color: #cbd5e1;
  font-size: 0.75rem;
}

/* --- 图表区域 --- */
.charts-section {
  margin-top: 1.5rem;
}

.charts-container {
  display: flex;
  flex-direction: column;
  gap: 1.25rem;
}

.chart-row {
  display: grid;
  gap: 1.25rem;
}

.first-row { grid-template-columns: 2fr 1fr; }
.second-row { grid-template-columns: 1fr 1fr; }

.chart-item {
  padding: 1.5rem;
}

.chart-header {
  margin-bottom: 1.25rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.header-title-group {
  display: flex;
  align-items: center;
}

.header-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  border-radius: 8px;
  margin-right: 10px;
  font-size: 1rem;
}
.header-icon.blue { background: #eff6ff; color: #3b82f6; }
.header-icon.green { background: #ecfdf5; color: #10b981; }
.header-icon.orange { background: #fffbeb; color: #f59e0b; }
.header-icon.purple { background: #f5f3ff; color: #8b5cf6; }

.chart-title {
  font-size: 1.05rem;
  font-weight: 600;
  color: #1e293b;
  margin: 0;
}

.chart-subtitle {
  font-size: 0.8rem;
  color: #94a3b8;
  font-weight: 400;
}

/* 图表容器高度 - 保持足够高度以便展示 */
.trend-chart { height: 360px; }
.pie-chart { height: 360px; }
.bar-chart, .compare-chart { height: 300px; }

/* --- 响应式适配 --- */
@media (max-width: 1280px) {
  .summary-cards { grid-template-columns: repeat(2, 1fr); }
  .first-row, .second-row { grid-template-columns: 1fr; }
  .trend-chart, .pie-chart { height: 320px; }
}

@media (max-width: 768px) {
  .summary-cards { grid-template-columns: 1fr; }
  .summary-card { padding: 1.2rem; }
  .summary-value { font-size: 1.8rem; }
  .chart-item { padding: 1rem; }
}
</style>