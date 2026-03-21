<template>
  <div class="data-export">
    <!-- <div class="page-header">
      <h1>数据导出</h1>
      <p>导出各类数据到Excel、PDF等格式</p>
    </div> -->
    
    <div class="page-content">
      <div class="export-container">
        <!-- 操作栏 -->
        <div class="operation-bar">
          <el-button type="primary" :loading="exporting" @click="startExport">
            <el-icon><Download /></el-icon>
            导出选中安排
          </el-button>
          <el-button :loading="scheduleLoading" @click="loadSchedules">
            <el-icon><Refresh /></el-icon>
            刷新安排
          </el-button>
        </div>

        <el-alert
          type="info"
          :closable="false"
          class="tips"
          title="导出条件说明"
          description="请先选中要导出的督导安排，再执行导出。导出的数据将基于所选安排关联的审核记录生成。"
        />

        <!-- 导出配置 -->
        <div class="export-config">
          <el-form :model="exportForm" label-width="120px">
            <el-form-item label="数据类型">
              <el-select v-model="exportForm.dataType" placeholder="请选择数据类型" style="width: 240px">
                <el-option
                  label="日常教学督导（汇总）"
                  :value="DAILY_EXPORT_TYPE.SUMMARY"
                />
                <el-option
                  label="日常教学督导（原始）-教师评价"
                  :value="DAILY_EXPORT_TYPE.ORIGINAL_TEACHER"
                />
                <el-option
                  label="日常教学督导（原始）-学生评价"
                  :value="DAILY_EXPORT_TYPE.ORIGINAL_STUDENT"
                />
              </el-select>
            </el-form-item>

            <el-form-item label="导出格式">
              <el-radio-group v-model="exportForm.format">
                <el-radio label="excel">Excel</el-radio>
                <el-radio label="word">Word</el-radio>
              </el-radio-group>
            </el-form-item>

            <el-form-item label="模块类型">
              <el-checkbox-group v-model="exportForm.moduleTypes" @change="loadSchedules">
                <el-checkbox :label="MODULE_TYPE.DAILY_TEACHING">
                  日常教学督导
                </el-checkbox>
                <el-checkbox
                  :label="MODULE_TYPE.ADMINISTRATIVE"
                  :disabled="exportForm.dataType !== DAILY_EXPORT_TYPE.SUMMARY"
                >
                  行政坐班督导
                </el-checkbox>
                <el-checkbox
                  :label="MODULE_TYPE.CLASSROOM_INSPECTION"
                  :disabled="exportForm.dataType !== DAILY_EXPORT_TYPE.SUMMARY"
                >
                  教室巡查督导
                </el-checkbox>
              </el-checkbox-group>
            </el-form-item>

            <el-form-item label="督导日期">
              <el-date-picker
                v-model="exportForm.dateRange"
                type="daterange"
                range-separator="至"
                start-placeholder="开始日期"
                end-placeholder="结束日期"
                format="YYYY-MM-DD"
                value-format="YYYY-MM-DD"
                @change="handleDateRangeChange"
              />
            </el-form-item>
          </el-form>
        </div>

        <!-- 安排列表 -->
        <div class="schedule-list">
          <div class="schedule-list__header">
            <h3>督导安排（按模块选择后加载，支持多选）</h3>
            <el-button text size="small" :loading="scheduleLoading" @click="loadSchedules">重新获取</el-button>
          </div>

          <el-table
            v-loading="scheduleLoading"
            :data="displayedSchedules"
            style="width: 100%"
            border
            @selection-change="handleScheduleSelection"
            :row-key="row => row.id"
            reserve-selection
          >
            <el-table-column type="selection" width="60" />
            <el-table-column prop="moduleTypeName" label="模块" width="140" />
            <el-table-column prop="supervisionDate" label="督导日期" width="140" />
            <el-table-column prop="period" label="节次/时段" width="120" />
            <el-table-column prop="leaderName" label="带队/负责人" width="160" />
            <el-table-column prop="statusName" label="状态" width="120">
              <template #default="scope">
                <el-tag v-if="scope.row.statusName" size="small">{{ scope.row.statusName }}</el-tag>
                <span v-else>-</span>
              </template>
            </el-table-column>
            <el-table-column prop="classroomCount" label="教室数" width="90" />
            <el-table-column prop="memberCount" label="人员数" width="90" />
            <el-table-column prop="progressRate" label="进度" width="120">
              <template #default="scope">
                <el-progress
                  v-if="scope.row.progressRate !== undefined && scope.row.progressRate !== null"
                  :percentage="Math.round(scope.row.progressRate)"
                  :stroke-width="10"
                  :show-text="false"
                />
                <span v-else>-</span>
              </template>
            </el-table-column>
            <el-table-column prop="notes" label="备注" min-width="160" />
          </el-table>

          <div class="pagination-wrapper">
            <el-pagination
              :current-page="schedulePagination.page"
              :page-size="schedulePagination.size"
              :page-sizes="[10, 20, 50, 100]"
              layout="total, sizes, prev, pager, next, jumper"
              :total="schedulePagination.total"
              @current-change="handleSchedulePageChange"
              @size-change="handleScheduleSizeChange"
            />
          </div>
        </div>

        <!-- 导出历史（保留占位，可接入后端记录） -->
        <div class="export-history">
          <h3>导出历史</h3>
          <el-table :data="exportHistory" style="width: 100%">
            <el-table-column prop="fileName" label="文件名" width="240" />
            <el-table-column prop="dataType" label="数据类型" width="120" />
            <el-table-column prop="format" label="格式" width="80" />
            <el-table-column prop="fileSize" label="文件大小" width="100" />
            <el-table-column prop="createTime" label="创建时间" width="170" />
            <el-table-column prop="status" label="状态" width="110">
              <template #default="scope">
                <el-tag :type="getStatusType(scope.row.status)">
                  {{ scope.row.status }}
                </el-tag>
              </template>
            </el-table-column>
            <el-table-column label="操作" width="180">
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
import { computed, onMounted, reactive, ref, watch } from 'vue'
import { Download, Refresh } from '@element-plus/icons-vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { approvalAPI, reportAPI } from '@/api'
import { handleApiError, showSuccessMessage, showErrorMessage } from '@/utils/error-handler'
import { MODULE_TYPE } from '@/constants/supervision'
import type { SupervisionApprovalResultVO } from '@/types/api'
import * as XLSX from 'xlsx'

// 日常教学督导导出类型
const DAILY_EXPORT_TYPE = {
  SUMMARY: 'daily_summary',
  ORIGINAL_TEACHER: 'daily_original_teacher',
  ORIGINAL_STUDENT: 'daily_original_student'
} as const

// 导出表单
const exportForm = reactive({
  // 数据类型：日常教学督导汇总 / 原始（教师评价 / 学生评价）
  dataType: DAILY_EXPORT_TYPE.SUMMARY,
  format: 'excel',
  moduleTypes: [
    MODULE_TYPE.DAILY_TEACHING,
    MODULE_TYPE.ADMINISTRATIVE,
    MODULE_TYPE.CLASSROOM_INSPECTION
  ] as string[],
  dateRange: [] as string[]
})

// 导出历史（保留示例数据，后续可接后端）
const exportHistory = ref([
  {
    id: 1,
    fileName: '督导数据-示例.xlsx',
    dataType: '督导数据',
    format: 'Excel',
    fileSize: '2.5MB',
    createTime: '2024-01-15 10:30:00',
    status: '已完成'
  }
])

const schedules = ref<any[]>([])
const scheduleLoading = ref(false)
const selectedSchedules = ref<any[]>([])
const exporting = ref(false)
const schedulePagination = reactive({
  page: 1,
  size: 10,
  total: 0
})
const displayedSchedules = computed(() => {
  // 最新时间在前
  const sorted = [...schedules.value].sort((a, b) => {
    const aTime = new Date(a.supervisionDate || 0).getTime()
    const bTime = new Date(b.supervisionDate || 0).getTime()
    return bTime - aTime
  })
  const start = (schedulePagination.page - 1) * schedulePagination.size
  const end = start + schedulePagination.size
  return sorted.slice(start, end)
})

// 监听数据类型切换
watch(
  () => exportForm.dataType,
  (val) => {
    // 原始数据仅支持日常教学督导模块
    if (val !== DAILY_EXPORT_TYPE.SUMMARY) {
      exportForm.moduleTypes = [MODULE_TYPE.DAILY_TEACHING]
      // 重新加载仅包含日常教学督导的安排
      loadSchedules()
    }
  }
)

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

const normalizeSchedule = (schedule: any, moduleType: string) => {
  return {
    id: schedule.id,
    moduleType,
    moduleTypeName: moduleType === MODULE_TYPE.DAILY_TEACHING
      ? '日常教学督导'
      : moduleType === MODULE_TYPE.ADMINISTRATIVE
        ? '行政坐班督导'
        : '教室巡查督导',
    supervisionDate: schedule.supervisionDate || schedule.inspectionDate || schedule.date || '',
    period: schedule.period || schedule.timeSlot || '',
    leaderName: schedule.leaderName || schedule.leader || schedule.inChargeName || '',
    status: schedule.status || '', // 保留原始状态字段
    statusName: schedule.statusName || schedule.status || '',
    classroomCount: schedule.classroomCount ?? schedule.totalClassrooms ?? schedule.completedClassrooms ?? '-',
    memberCount: schedule.memberCount ?? (schedule.memberNames?.length ?? 0) ?? '-',
    progressRate: (() => {
      if (schedule.progressRate === undefined || schedule.progressRate === null) return undefined
      const raw = Number(schedule.progressRate)
      return raw <= 1 ? raw * 100 : raw
    })(),
    notes: schedule.notes || ''
  }
}

// 加载安排列表
const loadSchedules = async () => {
  if (!exportForm.moduleTypes.length) {
    schedules.value = []
    selectedSchedules.value = []
    return
  }

  scheduleLoading.value = true
  const all: any[] = []

  try {
    for (const moduleType of exportForm.moduleTypes) {
      const resp = await reportAPI.getSchedulesForReport({
        page: 1,
        size: 200,
        moduleType,
        startDate: exportForm.dateRange?.[0],
        endDate: exportForm.dateRange?.[1]
      })

      if (resp.code === 200 && resp.data?.records) {
        // 先过滤，只保留"进行中"和"已完成"状态的安排
        const filtered = resp.data.records.filter((item: any) => {
          const status = item.status || ''
          return status === 'in_progress' || status === 'completed'
        })
        // 然后映射
        const mapped = filtered.map((item: any) => normalizeSchedule(item, moduleType))
        all.push(...mapped)
      } else {
        showErrorMessage(resp, '获取督导安排失败')
      }
    }

    schedules.value = all
    selectedSchedules.value = []
    schedulePagination.total = schedules.value.length
    schedulePagination.page = 1
  } catch (error) {
    console.error('加载督导安排失败', error)
    handleApiError(error, '加载督导安排失败')
  } finally {
    scheduleLoading.value = false
  }
}

const handleScheduleSelection = (rows: any[]) => {
  selectedSchedules.value = rows
}

const handleDateRangeChange = () => {
  schedulePagination.page = 1
  loadSchedules()
}

// 翻页
const handleSchedulePageChange = (page: number) => {
  schedulePagination.page = page
}

// 每页条数变化
const handleScheduleSizeChange = (size: number) => {
  schedulePagination.size = size
  schedulePagination.page = 1
}

const downloadBlob = (data: Blob, fileName: string) => {
  const url = window.URL.createObjectURL(data)
  const link = document.createElement('a')
  link.href = url
  link.download = fileName
  link.style.display = 'none'
  document.body.appendChild(link)
  link.click()
  window.URL.revokeObjectURL(url)
  document.body.removeChild(link)
}

// 开始导出
const startExport = async () => {
  if (!selectedSchedules.value.length) {
    ElMessage.warning('请先选择要导出的督导安排')
    return
  }

  // 日常教学督导原始数据仅支持“日常教学督导”模块
  if (
    exportForm.dataType !== DAILY_EXPORT_TYPE.SUMMARY &&
    selectedSchedules.value.some(item => item.moduleType !== MODULE_TYPE.DAILY_TEACHING)
  ) {
    ElMessage.warning('“日常教学督导（原始）”仅支持日常教学督导安排，请只勾选日常教学安排')
    return
  }

  exporting.value = true
  try {
    const scheduleIds = selectedSchedules.value.map(item => item.id)

    // 情况一：日常教学督导（汇总）
    if (exportForm.dataType === DAILY_EXPORT_TYPE.SUMMARY) {
      // Word 格式：使用后端导出
      if (exportForm.format === 'word') {
        const hasNonDaily = selectedSchedules.value.some(item => item.moduleType !== MODULE_TYPE.DAILY_TEACHING)
        if (hasNonDaily) {
          ElMessage.warning('Word 导出仅支持日常教学督导，请仅勾选日常教学安排')
          exporting.value = false
          return
        }

        const blob: any = await approvalAPI.batchExportRecords({
          scheduleIds,
          format: exportForm.format
        })

        if (blob && blob.type === 'application/json') {
          const text = await blob.text()
          const parsed = JSON.parse(text || '{}')
          showErrorMessage(parsed, parsed.message || '导出失败')
          return
        }

        if (!(blob instanceof Blob)) {
          throw new Error('导出响应不是文件流')
        }

        const moduleTypes = new Set(selectedSchedules.value.map(item => item.moduleType))
        let fileNamePrefix = '督导数据（汇总）'
        
        if (moduleTypes.size === 1) {
          const moduleType = Array.from(moduleTypes)[0]
          if (moduleType === MODULE_TYPE.DAILY_TEACHING) {
            fileNamePrefix = '日常教学督导（汇总）'
          } else if (moduleType === MODULE_TYPE.ADMINISTRATIVE) {
            fileNamePrefix = '行政坐班督导（汇总）'
          } else if (moduleType === MODULE_TYPE.CLASSROOM_INSPECTION) {
            fileNamePrefix = '教室巡查督导（汇总）'
          }
        } else if (moduleTypes.size > 1) {
          fileNamePrefix = '综合督导数据（汇总）'
        }
        
        downloadBlob(blob, `${fileNamePrefix}_${new Date().getTime()}.docx`)
        const response: any = { code: 200, message: '导出成功' }
        showSuccessMessage(response, '导出成功')
        return
      }

      // Excel 格式：根据模块类型选择导出方式
      const moduleTypes = new Set(selectedSchedules.value.map(item => item.moduleType))
      
      // 日常教学督导：使用前端导出（格式已定制）
      if (moduleTypes.size === 1 && Array.from(moduleTypes)[0] === MODULE_TYPE.DAILY_TEACHING) {
        const allRecords: SupervisionApprovalResultVO[] = []
        for (const scheduleId of scheduleIds) {
          const resp: any = await approvalAPI.getApprovedRecords({
            page: 1,
            size: 1000,
            supervisionScheduleId: scheduleId
          })
          if (resp && resp.code === 200 && resp.data?.records) {
            allRecords.push(...resp.data.records)
          }
        }

        if (!allRecords.length) {
          const resp: any = { code: 400, message: '未找到可导出的记录' }
          showErrorMessage(resp, '未找到可导出的记录')
          return
        }

        const tableData = generateSummaryTableData(allRecords)
        downloadExcel(tableData, `日常教学督导（汇总）_${new Date().getTime()}.xlsx`)
        const response: any = { code: 200, message: '导出成功' }
        showSuccessMessage(response, '导出成功')
        return
      }

      // 其他模块（行政坐班、教室巡查）或混合模块：使用后端导出
      const blob: any = await approvalAPI.batchExportRecords({
        scheduleIds,
        format: 'excel'
      })

      if (blob && blob.type === 'application/json') {
        const text = await blob.text()
        const parsed = JSON.parse(text || '{}')
        showErrorMessage(parsed, parsed.message || '导出失败')
        return
      }

      if (!(blob instanceof Blob)) {
        throw new Error('导出响应不是文件流')
      }

      let fileNamePrefix = '督导数据（汇总）'
      
      if (moduleTypes.size === 1) {
        const moduleType = Array.from(moduleTypes)[0]
        if (moduleType === MODULE_TYPE.ADMINISTRATIVE) {
          fileNamePrefix = '行政坐班督导（汇总）'
        } else if (moduleType === MODULE_TYPE.CLASSROOM_INSPECTION) {
          fileNamePrefix = '教室巡查督导（汇总）'
        }
      } else if (moduleTypes.size > 1) {
        fileNamePrefix = '综合督导数据（汇总）'
      }
      
      downloadBlob(blob, `${fileNamePrefix}_${new Date().getTime()}.xlsx`)
      const response: any = { code: 200, message: '导出成功' }
      showSuccessMessage(response, '导出成功')
      return
    }

    // 情况二：日常教学督导（原始）
    // 2.1 原始 + Word：调用后端统一生成 Word
    if (exportForm.format === 'word') {
      const dataType =
        exportForm.dataType === DAILY_EXPORT_TYPE.ORIGINAL_TEACHER
          ? 'original_teacher'
          : 'original_student'

      const blob: any = await approvalAPI.batchExportRecords({
        scheduleIds,
        format: 'word',
        dataType
      })

      if (blob && blob.type === 'application/json') {
        const text = await blob.text()
        const parsed = JSON.parse(text || '{}')
        showErrorMessage(parsed, parsed.message || '导出失败')
        return
      }

      if (!(blob instanceof Blob)) {
        throw new Error('导出响应不是文件流')
      }

      const fileNamePrefix =
        exportForm.dataType === DAILY_EXPORT_TYPE.ORIGINAL_TEACHER
          ? '日常教学督导（原始）-教师评价'
          : '日常教学督导（原始）-学生评价'

      downloadBlob(blob, `${fileNamePrefix}_${new Date().getTime()}.docx`)
      const response: any = { code: 200, message: '导出成功' }
      showSuccessMessage(response, '导出成功')
      return
    }

    // 2.2 原始 + Excel：前端生成 Excel（保持现有功能）
    const allRecords: SupervisionApprovalResultVO[] = []
    for (const scheduleId of scheduleIds) {
      // 一次性拉取该安排下的通过审核记录（最大 1000 条）
      const resp: any = await approvalAPI.getApprovedRecords({
        page: 1,
        size: 1000,
        supervisionScheduleId: scheduleId
      })
      if (resp && resp.code === 200 && resp.data?.records) {
        allRecords.push(...resp.data.records)
      }
    }

    if (!allRecords.length) {
      const resp: any = { code: 400, message: '未找到可导出的记录' }
      showErrorMessage(resp, '未找到可导出的记录')
      return
    }

    const isTeacher = exportForm.dataType === DAILY_EXPORT_TYPE.ORIGINAL_TEACHER
    const tableData = isTeacher
      ? generateTeacherTableData(allRecords)
      : generateStudentTableData(allRecords)

    const fileNamePrefix = isTeacher
      ? '日常教学督导（原始）-教师评价'
      : '日常教学督导（原始）-学生评价'

    downloadExcel(tableData, `${fileNamePrefix}_${new Date().getTime()}.xlsx`)
    const response: any = { code: 200, message: '导出成功' }
    showSuccessMessage(response, '导出成功')
  } catch (error: any) {
    handleApiError(error, '导出失败')
  } finally {
    exporting.value = false
  }
}

// 重置表单
const resetForm = () => {
  exportForm.dataType = DAILY_EXPORT_TYPE.SUMMARY
  exportForm.format = 'excel'
  exportForm.moduleTypes = [
    MODULE_TYPE.DAILY_TEACHING,
    MODULE_TYPE.ADMINISTRATIVE,
    MODULE_TYPE.CLASSROOM_INSPECTION
  ]
  selectedSchedules.value = []
  schedulePagination.page = 1
  exportForm.dateRange = []
  loadSchedules()
  ElMessage.info('已重置条件')
}

// 下载文件
const downloadFile = (row: any) => {
  const response: any = { code: 200, message: `下载文件：${row.fileName}` }
  showSuccessMessage(response, `下载文件：${row.fileName}`)
}

// 删除文件
const deleteFile = (row: any) => {
  ElMessageBox.confirm(`确认删除 ${row.fileName} ?`, '提示', {
    type: 'warning'
  }).then(() => {
    const response: any = { code: 200, message: '删除成功（示例）' }
    showSuccessMessage(response, '删除成功')
  }).catch(() => {})
}

onMounted(() => {
  loadSchedules()
})

// ---------------- 日常教学督导原始数据导出：表格生成工具 ----------------

// 解析班级信息
const getClassInfo = (classInfo: string, key: string) => {
  try {
    const info = JSON.parse(classInfo || '{}')
    return info[key] || ''
  } catch {
    return ''
  }
}

// 解析到课信息
const getAttendanceInfo = (attendanceInfo: string, key: string) => {
  try {
    const info = JSON.parse(attendanceInfo || '{}')
    return info[key] || 0
  } catch {
    return 0
  }
}

// 获取教学评价信息
const getTeachingEvaluationInfo = (teachingEvaluation: string, key: string) => {
  try {
    const evaluation = JSON.parse(teachingEvaluation || '{}')
    // 支持嵌套路径，如 'teachingScore.teachingAttitude'
    if (key.includes('.')) {
      const keys = key.split('.')
      let value = evaluation
      for (const k of keys) {
        value = value?.[k]
        if (value === undefined) return 0
      }
      return value || 0
    }
    return evaluation[key] || 0
  } catch {
    return 0
  }
}

// 获取学习评价信息
const getLearningEvaluationInfo = (learningEvaluation: string, key: string) => {
  try {
    const evaluation = JSON.parse(learningEvaluation || '{}')
    return evaluation[key] || 0
  } catch {
    return 0
  }
}

// 格式化百分比
const formatPercentage = (value: number) => {
  if (value === null || value === undefined) return '0%'
  return (value).toFixed(1) + '%'
}

// 前端导出功能 - 生成汇总表数据（多级表头）
const generateSummaryTableData = (data: SupervisionApprovalResultVO[]) => {
  // 第一行：主标题
  const headerRow1 = [
    '班级',
    '课程名称', 
    '课程性质',
    '任课教师',
    '辅导员/班主任',
    '班级人数',
    '考勤情况（20分）',
    '', '', '', '', // 考勤情况的子列
    '督教情况（60分）',
    '', '', '', '', // 督教情况的子列
    '督学情况（20分）',
    '', '', // 督学情况的子列
    '总分',
    '备注'
  ]

  // 第二行：子标题
  const headerRow2 = [
    '班级',
    '课程名称', 
    '课程性质',
    '任课教师',
    '辅导员/班主任',
    '班级人数',
    '请假人数',
    '旷课人数', 
    '实到人数',
    '到课率(%)',
    '得分',
    '教学态度',
    '教学方法',
    '就坐情况',
    '综合效果',
    '得分',
    '违纪人数',
    '违纪率(%)',
    '得分',
    '总分',
    '备注'
  ]

  const headers = [headerRow1, headerRow2]

  const rows = data.map(row => [
    getClassInfo(row.classInfo as any, 'className'),
    getClassInfo(row.classInfo as any, 'courseName'),
    getClassInfo(row.classInfo as any, 'courseType') || '理论/实践',
    getClassInfo(row.classInfo as any, 'teacher'),
    getClassInfo(row.classInfo as any, 'counselor'),
    getClassInfo(row.classInfo as any, 'studentCountDetail'),
    getAttendanceInfo(row.attendanceInfo as any, 'leaveCount'),
    getAttendanceInfo(row.attendanceInfo as any, 'absentCount'),
    getAttendanceInfo(row.attendanceInfo as any, 'actualCount'),
    formatPercentage(getAttendanceInfo(row.attendanceInfo as any, 'attendanceRate')),
    getAttendanceInfo(row.attendanceInfo as any, 'score'),
    getTeachingEvaluationInfo(row.teachingEvaluation as any, 'teachingScore.teachingAttitude'),
    getTeachingEvaluationInfo(row.teachingEvaluation as any, 'teachingScore.teachingMethod'),
    getTeachingEvaluationInfo(row.teachingEvaluation as any, 'teachingScore.seatingArrangement'),
    getTeachingEvaluationInfo(row.teachingEvaluation as any, 'teachingScore.comprehensiveEffect'),
    getTeachingEvaluationInfo(row.teachingEvaluation as any, 'teachingScore.score'),
    getLearningEvaluationInfo(row.learningEvaluation as any, 'violationCount'),
    formatPercentage(getLearningEvaluationInfo(row.learningEvaluation as any, 'violationRate')),
    getLearningEvaluationInfo(row.learningEvaluation as any, 'score'),
    row.totalScore,
    (row as any).notes || ''
  ])

  return [...headers, ...rows]
}

// 前端导出功能 - 生成教师评价记录表数据（多级表头）
const generateTeacherTableData = (data: SupervisionApprovalResultVO[]) => {
  // 第一行：主标题
  const headerRow1 = [
    '序号',
    '任课教师',
    '班级',
    '课程名称',
    '教室',
    '教学态度',
    '教学方法',
    '就坐情况',
    '综合效果',
    '得分',
    '备注'
  ]

  // 第二行：子标题（与第一行相同）
  const headerRow2 = [
    '序号',
    '任课教师',
    '班级',
    '课程名称',
    '教室',
    '教学态度',
    '教学方法',
    '就坐情况',
    '综合效果',
    '得分',
    '备注'
  ]

  const headers = [headerRow1, headerRow2]

  const rows = data.map((row, index) => [
    index + 1,
    getClassInfo(row.classInfo as any, 'teacher'),
    getClassInfo(row.classInfo as any, 'className'),
    getClassInfo(row.classInfo as any, 'courseName'),
    (row as any).classroomName || '',
    getTeachingEvaluationInfo(row.teachingEvaluation as any, 'teachingAttitude'),
    getTeachingEvaluationInfo(row.teachingEvaluation as any, 'teachingMethod'),
    getTeachingEvaluationInfo(row.teachingEvaluation as any, 'seatingArrangement'),
    getTeachingEvaluationInfo(row.teachingEvaluation as any, 'comprehensiveEffect'),
    getTeachingEvaluationInfo(row.teachingEvaluation as any, 'score'),
    (row as any).notes || ''
  ])

  return [...headers, ...rows]
}

// 前端导出功能 - 生成学生记录表数据（多级表头）
const generateStudentTableData = (data: SupervisionApprovalResultVO[]) => {
  // 第一行：主标题
  const headerRow1 = [
    '序号',
    '任课教师',
    '班级',
    '教室',
    '班级人数',
    '考勤情况（20分）',
    '', '', '', '', // 考勤情况的子列
    '督学情况（20分）',
    '', '', '', '', '', '' // 督学情况的子列
  ]

  // 第二行：子标题
  const headerRow2 = [
    '序号',
    '任课教师',
    '班级',
    '教室',
    '班级人数',
    '请假人数',
    '旷课人数',
    '实到人数',
    '到课率(%)',
    '得分',
    '玩手机',
    '睡觉',
    '未带教材',
    '违纪总人数',
    '违纪率(%)',
    '得分'
  ]

  const headers = [headerRow1, headerRow2]

  const rows = data.map((row, index) => [
    index + 1,
    getClassInfo(row.classInfo as any, 'teacher'),
    getClassInfo(row.classInfo as any, 'className'),
    (row as any).classroomName || '',
    getClassInfo(row.classInfo as any, 'totalStudents'),
    getAttendanceInfo(row.attendanceInfo as any, 'leaveCount'),
    getAttendanceInfo(row.attendanceInfo as any, 'absentCount'),
    getAttendanceInfo(row.attendanceInfo as any, 'actualCount'),
    formatPercentage(getAttendanceInfo(row.attendanceInfo as any, 'attendanceRate')),
    getAttendanceInfo(row.attendanceInfo as any, 'score'),
    getLearningEvaluationInfo(row.learningEvaluation as any, 'phonePlayingCount') || 0,
    getLearningEvaluationInfo(row.learningEvaluation as any, 'sleepingCount') || 0,
    getLearningEvaluationInfo(row.learningEvaluation as any, 'noMaterialsCount') || 0,
    getLearningEvaluationInfo(row.learningEvaluation as any, 'violationCount'),
    formatPercentage(getLearningEvaluationInfo(row.learningEvaluation as any, 'violationRate')),
    getLearningEvaluationInfo(row.learningEvaluation as any, 'score')
  ])

  return [...headers, ...rows]
}

// 前端导出功能 - 下载Excel文件（带合并单元格和样式）
const downloadExcel = (data: any[][], fileName: string) => {
  const ws = XLSX.utils.aoa_to_sheet(data)
  const wb = XLSX.utils.book_new()
  XLSX.utils.book_append_sheet(wb, ws, 'Sheet1')
  
  // 设置列宽
  const colWidths = data[0].map(() => ({ wch: 15 }))
  ws['!cols'] = colWidths
  
  // 如果是多级表头，设置合并单元格
  if (data.length > 1) {
    const merges = []
    
    // 汇总表的多级表头合并
    if (fileName.includes('汇总')) {
      // 基础信息列合并（第1-6列，索引0-5）
      for (let i = 0; i < 6; i++) {
        merges.push({ s: { r: 0, c: i }, e: { r: 1, c: i } })
      }
      // 考勤情况（20分）合并：第7-11列（索引6-10）
      merges.push({ s: { r: 0, c: 6 }, e: { r: 0, c: 10 } })
      // 督教情况（60分）合并：第12-16列（索引11-15）
      merges.push({ s: { r: 0, c: 11 }, e: { r: 0, c: 15 } })
      // 督学情况（20分）合并：第17-19列（索引16-18）
      merges.push({ s: { r: 0, c: 16 }, e: { r: 0, c: 18 } })
      // 总分和备注列合并（第20-21列，索引19-20）
      for (let i = 19; i < 21; i++) {
        merges.push({ s: { r: 0, c: i }, e: { r: 1, c: i } })
      }
    }
    // 学生记录表的多级表头合并
    else if (fileName.includes('学生评价')) {
      // 基础信息列合并（第1-5列，索引0-4）
      for (let i = 0; i < 5; i++) {
        merges.push({ s: { r: 0, c: i }, e: { r: 1, c: i } })
      }
      // 考勤情况（20分）合并：第6-10列（索引5-9）
      merges.push({ s: { r: 0, c: 5 }, e: { r: 0, c: 9 } })
      // 督学情况（20分）合并：第11-16列（索引10-15）
      merges.push({ s: { r: 0, c: 10 }, e: { r: 0, c: 15 } })
    }
    // 教师评价记录表的多级表头合并
    else if (fileName.includes('教师评价')) {
      // 所有列都合并两行
      for (let i = 0; i < data[0].length; i++) {
        merges.push({ s: { r: 0, c: i }, e: { r: 1, c: i } })
      }
    }
    
    if (merges.length > 0) {
      ws['!merges'] = merges
    }
  }
  
  // 设置表头样式（加粗、居中）
  const headerRowCount = data.length > 1 ? 2 : 1
  for (let r = 0; r < headerRowCount; r++) {
    for (let c = 0; c < data[r].length; c++) {
      const cellRef = XLSX.utils.encode_cell({ r, c })
      if (!ws[cellRef]) continue
      if (!ws[cellRef].s) ws[cellRef].s = {}
      ws[cellRef].s.font = { bold: true }
      ws[cellRef].s.alignment = { horizontal: 'center', vertical: 'center' }
    }
  }
  
  // 设置数据行样式（居中）
  for (let r = headerRowCount; r < data.length; r++) {
    for (let c = 0; c < data[r].length; c++) {
      const cellRef = XLSX.utils.encode_cell({ r, c })
      if (!ws[cellRef]) continue
      if (!ws[cellRef].s) ws[cellRef].s = {}
      ws[cellRef].s.alignment = { horizontal: 'center', vertical: 'center' }
    }
  }
  
  XLSX.writeFile(wb, fileName)
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

.tips {
  margin-bottom: 16px;
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

.schedule-list {
  margin-bottom: 24px;
}

.schedule-list__header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
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