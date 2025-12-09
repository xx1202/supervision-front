<template>
  <div class="supervision-approval">
    <div class="page-content">
      <div class="approval-container">
        <!-- 搜索和过滤区域 -->
        <div class="search-section">
          <el-form :model="searchForm" inline style="display: flex; align-items: center; justify-content: space-between;">
            <el-form-item label="教室"  style="width: 150px">
              <el-select 
                v-model="searchForm.classroomId"
                placeholder="选择教室" 
                clearable
                @change="handleSearch"
              >
                <el-option
                  v-for="classroom in classroomList"
                  :key="classroom.id"
                  :label="classroom.roomNumber"
                  :value="classroom.id"
                />
              </el-select>
            </el-form-item>
            <el-form-item label="状态"   style="width: 150px">
              <el-select v-model="searchForm.status" placeholder="选择状态" @change="handleSearch">
                <el-option label="全部" value="" />
                <el-option 
                  v-for="(statusInfo, status) in SUPERVISION_RECORD_STATUS_MAP" 
                  :key="status" 
                  :label="statusInfo.label" 
                  :value="status" 
                />
              </el-select>
            </el-form-item>
            <el-form-item>
              <el-button type="primary" @click="handleSearch">搜索</el-button>
              <el-button @click="resetSearch">重置</el-button>
            </el-form-item>
          </el-form>
         </div>

        <div class="approval-table">
           <el-table 
            :data="recordList"
             style="width: 100%" 
            height="100%"
             v-loading="loading"
            fit
            table-layout="fixed"
             border
            :span-method="handleSpanMethod"
           >
            <el-table-column prop="createdTime" label="创建时间" width="140">
                <template #default="scope">
                {{ formatDateTime(scope.row.createdTime) }}
                </template>
              </el-table-column>
            <el-table-column prop="classroomNumber" label="教室" width="100" />
            <el-table-column prop="className" label="班级" width="130" />
            <el-table-column prop="courseName" label="课程" width="120" />
            <el-table-column prop="teacher" label="任课教师" width="100" />
            <el-table-column prop="supervisorName" label="督导员" width="100">
                <template #default="scope">
                {{ scope.row.supervisorName || '-' }}
                </template>
              </el-table-column>
             <el-table-column prop="evaluationTypeName" label="任务类型" width="100" />
            <el-table-column prop="status" label="状态" width="100">
                <template #default="scope">
                <el-tag :type="getStatusType(scope.row.status)">
                  {{ scope.row.statusName }}
                </el-tag>
                </template>
              </el-table-column>
            <el-table-column prop="submittedAt" label="提交时间" width="160">
                <template #default="scope">
                {{ formatDateTime(scope.row.submittedAt) }}
                </template>
              </el-table-column>
            <el-table-column label="汇总" width="100" align="center">
                <template #default="scope">
                  <el-button 
                  v-if="isFirstRecordInClassroom(scope.row)"
                    size="small" 
                  type="warning"
                  @click="handleClassroomSummary(scope.row)"
                  :disabled="!canSummaryClassroom(scope.row)"
                  >
                  汇总
                  </el-button>
                  <el-button
                      v-if="scope.row.summaryStatus === 'summarized'"
                      size="small"
                      type="info"
                      disabled
                  >
                    已汇总
                  </el-button>
                </template>

              </el-table-column>
            <el-table-column label="操作" min-width="200" fixed="right">
                <template #default="scope">
                <el-button size="small" @click="viewRecordDetail(scope.row)">查看</el-button>
                  <el-button 
                  v-if="scope.row.status === SUPERVISION_RECORD_STATUS.SUBMITTED"
                    size="small" 
                  type="success"
                  @click="approveRecord(scope.row, 'approve')"
                  >
                  通过
                  </el-button>
                <el-button
                  v-if="scope.row.status === SUPERVISION_RECORD_STATUS.SUBMITTED"
                  size="small"
                  type="danger"
                  @click="approveRecord(scope.row, 'reject')"
                >
                  拒绝
                </el-button>
                  <el-button 
                  v-if="scope.row.status === SUPERVISION_RECORD_STATUS.REJECTED"
                    size="small" 
                  type="warning"
                  @click="resubmitRecord(scope.row)"
                  disabled
                >
                  重新提交
                </el-button>
                <el-button
                  v-if="scope.row.status === SUPERVISION_RECORD_STATUS.APPROVED"
                  size="small"
                  type="info"
                  disabled
                >
                  已通过
                  </el-button>
                </template>
              </el-table-column>
            </el-table>

          <!-- 分页 -->
          <div class="pagination-wrapper">
            <el-pagination
              v-model:current-page="pagination.page"
              v-model:page-size="pagination.size"
              :page-sizes="[50, 10, 20, 100]"
              :total="pagination.total"
              layout="total, sizes, prev, pager, next, jumper"
              @size-change="handleSizeChange"
              @current-change="handleCurrentChange"
            />
          </div>
          </div>
      </div>
    </div>

    <!-- 督导记录详情对话框 -->
    <el-dialog
      title="督导记录详情"
      v-model="detailVisible"
      width="800px"
      :append-to-body="true"
      :lock-scroll="true"
      :close-on-click-modal="false"
    >
      <div v-if="currentRecord" class="record-detail">
          <el-descriptions :column="2" border>
          <el-descriptions-item label="教室">
            {{ currentRecord.classroomNumber }}
          </el-descriptions-item>
          <el-descriptions-item label="班级">
            {{ currentRecord.className }}
          </el-descriptions-item>
          <el-descriptions-item label="课程">
            {{ currentRecord.courseName }}
          </el-descriptions-item>
          <el-descriptions-item label="任课教师">
            {{ currentRecord.teacher }}
          </el-descriptions-item>
          <el-descriptions-item label="督导员">
            {{ currentRecord.supervisorName || '-' }}
          </el-descriptions-item>
          <el-descriptions-item label="状态">
            <el-tag :type="getStatusType(currentRecord.status)">
              {{ currentRecord.statusName }}
            </el-tag>
          </el-descriptions-item>
          <el-descriptions-item label="创建时间">
            {{ formatDateTime(currentRecord.createdTime) }}
          </el-descriptions-item>
          <el-descriptions-item label="提交时间">
            {{ formatDateTime(currentRecord.submittedAt) }}
          </el-descriptions-item>
        </el-descriptions>

        <!-- 教学评价 - 学生评价记录不显示 -->
        <div v-if="currentRecord.evaluationTypeName !== '学生评价'" class="evaluation-section">
          <h4>教学评价</h4>
          <el-descriptions :column="2" border>
            <el-descriptions-item label="教学态度">
              {{ getEvaluationValue(currentRecord.teachingEvaluation, 'teachingAttitude') }}
            </el-descriptions-item>
            <el-descriptions-item label="教学方法">
              {{ getEvaluationValue(currentRecord.teachingEvaluation, 'teachingMethod') }}
            </el-descriptions-item>
            <el-descriptions-item label="就坐情况">
              {{ getEvaluationValue(currentRecord.teachingEvaluation, 'seatingArrangement') }}
            </el-descriptions-item>
            <el-descriptions-item label="综合效果">
              {{ getEvaluationValue(currentRecord.teachingEvaluation, 'overallEffect') }}
            </el-descriptions-item>
            <el-descriptions-item label="教学评分">
              {{ getEvaluationValue(currentRecord.teachingEvaluation, 'teachingScore') }}分
            </el-descriptions-item>
            <el-descriptions-item label="备注" :rowspan="2">
              {{ getEvaluationValue(currentRecord.teachingEvaluation, 'note') }}
            </el-descriptions-item>
          </el-descriptions>
        </div>

        <!-- 学习评价 - 教师评价记录不显示 -->
        <div v-if="currentRecord.evaluationTypeName !== '教师评价'" class="evaluation-section">
          <h4>学习评价</h4>
          <el-descriptions :column="2" border>
            <el-descriptions-item label="玩手机人数">
              {{ getEvaluationValue(currentRecord.learningEvaluation, 'mobilePhoneUsageCount') }}人
            </el-descriptions-item>
            <el-descriptions-item label="睡觉人数">
              {{ getEvaluationValue(currentRecord.learningEvaluation, 'sleepingCount') }}人
            </el-descriptions-item>
            <el-descriptions-item label="未带教材">
              {{ getEvaluationValue(currentRecord.learningEvaluation, 'noMaterialsCount') }}人
            </el-descriptions-item>
            <el-descriptions-item label="违纪总人数">
              {{ getEvaluationValue(currentRecord.learningEvaluation, 'violationCount') }}人
            </el-descriptions-item>
            <el-descriptions-item label="违纪率">
              {{ getEvaluationValue(currentRecord.learningEvaluation, 'violationRate') }}%
            </el-descriptions-item>
            <el-descriptions-item label="得分">
              {{ getEvaluationValue(currentRecord.learningEvaluation, 'learningEvaluationScore') }}分
            </el-descriptions-item>
            <el-descriptions-item label="备注">
              {{ getEvaluationValue(currentRecord.learningEvaluation, 'notes') }}
            </el-descriptions-item>
          </el-descriptions>
        </div>

        <!-- 考勤情况 - 教师评价记录不显示 -->
        <div v-if="currentRecord.evaluationTypeName !== '教师评价'" class="evaluation-section">
          <h4>考勤情况</h4>
          <el-descriptions :column="2" border>
            <el-descriptions-item label="请假人数">
              {{ getEvaluationValue(currentRecord.attendanceEvaluation, 'leaveCount') }}人
            </el-descriptions-item>
            <el-descriptions-item label="旷课人数">
              {{ getEvaluationValue(currentRecord.attendanceEvaluation, 'absentCount') }}人
            </el-descriptions-item>
            <el-descriptions-item label="应到人数">
              {{ getEvaluationValue(currentRecord.attendanceEvaluation, 'shouldAttend') }}人
            </el-descriptions-item>
            <el-descriptions-item label="实到人数">
              {{ getEvaluationValue(currentRecord.attendanceEvaluation, 'actualAttend') }}人
            </el-descriptions-item>
            <el-descriptions-item label="到课率">
              {{ getEvaluationValue(currentRecord.attendanceEvaluation, 'attendanceRate') }}%
            </el-descriptions-item>
            <el-descriptions-item label="得分">
              {{ getEvaluationValue(currentRecord.attendanceEvaluation, 'attendanceScore') }}
            </el-descriptions-item>
          </el-descriptions>
        </div>

        <!-- 备注信息 -->
        <div v-if="currentRecord.remarks" class="remarks-section">
          <h4>备注信息</h4>
          <p>{{ currentRecord.remarks }}</p>
        </div>

        <div v-if="currentRecord.photos && currentRecord.photos.length > 0">
                    <el-button 
                      size="small" 
                      type="primary" 
            @click="viewPhotos(currentRecord.photos)"
                    >
            查看照片 ({{ currentRecord.photos.length }})
                    </el-button>
                  </div>
        <span v-else style="color: #999;">无照片 </span>

        <!-- 审核信息 -->
        <div v-if="currentRecord.status === SUPERVISION_RECORD_STATUS.APPROVED || currentRecord.status === SUPERVISION_RECORD_STATUS.REJECTED" class="audit-info-section">
          <h4>审核信息</h4>
          <el-descriptions :column="1" border>
            <el-descriptions-item label="审核时间">
              {{ formatDateTime(currentRecord.approvedAt) }}
            </el-descriptions-item>
            <el-descriptions-item label="审核意见">
              {{ currentRecord.approvalNote || '-' }}
            </el-descriptions-item>
          </el-descriptions>
          </div>
        </div>
    </el-dialog>

    <!-- 汇总审核对话框 -->
    <el-dialog
      title="汇总审核"
      v-model="summaryVisible"
      width="600px"
      :close-on-click-modal="false"
      :append-to-body="true"
    >
      <div class="summary-content">
        <el-alert
          :title="`正在对教室 ${summaryForm.classroomName} 进行汇总审核`"
          type="info"
          :closable="false"
          style="margin-bottom: 20px;"
        />
        
        <el-form :model="summaryForm" label-width="100px">
          
          <el-form-item label="审核意见">
            <el-input
              v-model="summaryForm.approvalNote"
              type="textarea"
              :rows="4"
              placeholder="请输入审核意见"
            />
          </el-form-item>
        </el-form>
      </div>
      
      <template #footer>
        <el-button @click="summaryVisible = false">取消</el-button>
        <el-button type="primary" @click="confirmSummary" :loading="summaryLoading">
          确认汇总
        </el-button>
      </template>
    </el-dialog>

    <!-- 照片查看对话框 -->
    <el-dialog
      v-model="photosDialogVisible"
      title="查看照片"
      width="800px"
      :close-on-click-modal="false"
      :append-to-body="true"
      :lock-scroll="true"
    >
      <div v-if="currentPhotos && currentPhotos.length > 0" class="photos-viewer">
        <el-carousel 
          :interval="0" 
          indicator-position="outside"
          height="400px"
          v-model="currentPhotoIndex"
        >
          <el-carousel-item v-for="(photo, index) in currentPhotos" :key="index">
             <div class="photo-container">
               <!-- 图片显示 -->
               <img 
                 v-if="getFileType(photo) === 'image'"
                 :src="photoUrls.get(photo) || ''" 
                 :alt="`图片 ${index + 1}`"
                 class="photo-image"
                 @click="previewPhoto(photo)"
                 @error="handleImageError"
               />
               <!-- 视频显示 -->
               <video 
                 v-else-if="getFileType(photo) === 'video'"
                 :src="photoUrls.get(photo) || ''" 
                 :alt="`视频 ${index + 1}`"
                 class="photo-image"
                 controls
                 @error="handleImageError"
               />
               <!-- 未知文件类型 -->
               <div 
                 v-else
                 class="unknown-file"
                 @click="previewPhoto(photo)"
               >
                 <el-icon><Document /></el-icon>
                 <span>未知文件类型</span>
               </div>
               <div class="photo-info">
                 <span>{{ getFileType(photo) === 'image' ? '图片' : getFileType(photo) === 'video' ? '视频' : '文件' }} {{ index + 1 }} / {{ currentPhotos.length }}</span>
               </div>
             </div>
           </el-carousel-item>
        </el-carousel>
      </div>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted, computed } from 'vue'
import { useRoute } from 'vue-router'
import { ElMessageBox } from 'element-plus'
import { showSuccessMessage, showErrorMessage, handleApiError } from '@/utils/error-handler'
import { Search, Document } from '@element-plus/icons-vue'
import {supervisionRecordAPI, classroomAPI, approvalAPI, supervisionScheduleAPI, summaryAPI} from '@/api'
import { showSuccessMessage, showErrorMessage, handleApiError } from '@/utils/error-handler'
import { logger } from '@/utils/logger'
import { 
  SUPERVISION_RECORD_STATUS,
  SUPERVISION_RECORD_STATUS_MAP,
  APPROVAL_STATUS,
  APPROVAL_STATUS_MAP
} from '@/constants'

// 照片查看相关
const currentPhotos = ref<string[]>([])
const currentPhotoIndex = ref(0)
const photoUrls = ref<Map<string, string>>(new Map())
const photosDialogVisible = ref(false)

// 路由参数
const route = useRoute()
const scheduleId = computed(() => route.query.scheduleId as string)

// 格式化日期时间
const formatDateTime = (datetime: string) => {
  if (!datetime) return '-'
  const date = new Date(datetime)
  return date.toLocaleString('zh-CN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit'
  })
}

// 响应式数据
const loading = ref(false)
const recordList = ref([])
const classroomList = ref([])
const taskInfo = ref(null)
const detailVisible = ref(false)
const currentRecord = ref(null)
const summaryVisible = ref(false)
const summaryLoading = ref(false)

// 搜索表单
const searchForm = reactive({
  classroomId: '',
  status: ''
})

// 分页
const pagination = reactive({
  page: 1,
  size: 50,
  total: 0
})

// 汇总表单
const summaryForm = reactive({
  classroomId: '',
  classroomName: '',
  action: APPROVAL_STATUS.APPROVED,
  approvalNote: ''
})

// 计算属性 - 按教室分组的记录
const groupedRecords = computed(() => {
  const groups = {}
  recordList.value.forEach(record => {
    const key = record.classroomId
    if (!groups[key]) {
      groups[key] = {
        classroomId: record.classroomId,
        classroomName: record.classroomNumber,
        records: []
      }
    }
    groups[key].records.push(record)
  })
  return Object.values(groups)
})

// 行合并方法
const handleSpanMethod = ({ row, column, rowIndex, columnIndex }) => {
  // 需要合并的列：教室(1)、班级(2)、课程(3)、任课教师(4)、汇总(9)
  const mergeColumns = [1, 2, 3, 4, 9]
  
  if (mergeColumns.includes(columnIndex)) {
    const classroomId = row.classroomId
    let rowspan = 1
    
    // 向前查找相同教室的记录
    for (let i = rowIndex - 1; i >= 0; i--) {
      if (recordList.value[i].classroomId === classroomId) {
        return { rowspan: 0, colspan: 0 }
      }
    }
    
    // 向后查找相同教室的记录
    for (let i = rowIndex + 1; i < recordList.value.length; i++) {
      if (recordList.value[i].classroomId === classroomId) {
        rowspan++
      } else {
        break
      }
    }
    
    return { rowspan, colspan: 1 }
  }
  
  return { rowspan: 1, colspan: 1 }
}

// 判断是否为教室中的第一条记录
const isFirstRecordInClassroom = (record) => {
  if (record.summaryStatus === 'summarized') return false
  const index = recordList.value.findIndex(r => r.id === record.id)
  if (index === 0) return true
  
  const prevRecord = recordList.value[index - 1]
  return prevRecord.classroomId !== record.classroomId
}

// 判断教室中的记录是否满足汇总条件
// 规则：
// - 若该教室只有一条记录：该条记录审核完成（approved/rejected）即可汇总
// - 若该教室有多条记录：必须全部记录审核完成（approved/rejected）方可汇总
const canSummaryClassroom = (record) => {
  const classroomId = record.classroomId
  const classroomRecords = recordList.value.filter(r => r.classroomId === classroomId)

  if (classroomRecords.length === 0) return false

  const isAudited = (r) => r.status === 'approved' || r.status === 'rejected'

  if (classroomRecords.length === 1) {
    return isAudited(classroomRecords[0])
  }

  return classroomRecords.every(isAudited)
}

// 获取状态类型
const getStatusType = (status: string) => {
  return SUPERVISION_RECORD_STATUS_MAP[status]?.type || 'info'
}

// 加载任务信息
const loadTaskInfo = async () => {
  logger.debug('scheduleId:', scheduleId.value)
  if (!scheduleId.value) {
    logger.debug('scheduleId为空，跳过加载任务信息')
    return
  }
  
  try {
    logger.debug('开始加载任务信息，scheduleId:', scheduleId.value)
    const response = await supervisionScheduleAPI.getScheduleDetail(scheduleId.value)
    taskInfo.value = (response as any).data
    logger.debug('任务信息加载成功:', taskInfo.value)
  } catch (error) {
    handleApiError(error, '加载任务信息失败')
  }
}

// 加载教室列表
const loadClassroomList = async () => {
  try {
    const response = await classroomAPI.getClassroomList({})
    classroomList.value = (response as any).data.records || []
  } catch (error) {
    handleApiError(error, '加载教室列表失败', false)
  }
}

// 加载记录列表
const loadRecordList = async () => {
  logger.debug('loadRecordList - scheduleId:', scheduleId.value)
  if (!scheduleId.value) {
    logger.debug('scheduleId为空，跳过加载记录列表')
    return
  }
  
  loading.value = true
  try {
    const params = {
      supervisionScheduleId: scheduleId.value,
      classroomId: searchForm.classroomId || '',
      status: searchForm.status || '',
      current: pagination.page,
      size: pagination.size
    }
    
    logger.debug('开始加载记录列表，参数:', params)
    const response = await supervisionRecordAPI.getRecordList(params)
    recordList.value = (response as any).data.records || []
    pagination.total = (response as any).data.total || 0
    logger.debug('记录列表加载成功，记录数:', recordList.value.length)
  } catch (error) {
    handleApiError(error, '加载记录列表失败')
  } finally {
    loading.value = false
  }
}

// 搜索
const handleSearch = () => {
  pagination.page = 1
  loadRecordList()
}

// 重置搜索
const resetSearch = () => {
  searchForm.classroomId = ''
  searchForm.status = ''
  handleSearch()
}

// 分页处理
const handleSizeChange = (size) => {
  pagination.size = size
  pagination.page = 1
  loadRecordList()
}

const handleCurrentChange = (page) => {
  pagination.page = page
  loadRecordList()
}

// 查看记录详情
const viewRecordDetail = async (record) => {
  try {
    const response = await supervisionRecordAPI.getRecordDetail(record.id)
    if (response && (response as any).data) {
      if (typeof (response as any).data.photos === 'string') {
        (response as any).data.photos = JSON.parse((response as any).data.photos)
      }
      currentRecord.value = (response as any).data
      detailVisible.value = true
    }
  } catch (error) {
    handleApiError(error, '获取督导记录详情失败')
  }
}

// 审核记录
const approveRecord = async (record, action) => {
  try {
    await ElMessageBox.confirm(
      `确定要${action === 'approve' ? '通过' : '拒绝'}这条记录吗？`,
      '确认审核',
      {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }
    )
    
    const response: any = await supervisionRecordAPI.approveRecord(record.id, { action })
    showSuccessMessage(response, '审核成功')
    loadRecordList()
  } catch (error) {
    if (error !== 'cancel') {
      handleApiError(error, '审核失败')
    }
  }
}

// 重新提交记录（与 audit_1.0.vue 行为一致）
const resubmitRecord = async (row) => {
  try {
    await ElMessageBox.confirm(
      `确定要重新提交该督导记录吗？\n班级：${row.className}\n课程：${row.courseName}\n督导员：${row.supervisorName || '-'}`,
      '确认重新提交',
      {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }
    )
    const res: any = await supervisionRecordAPI.submitRecord(row.id)
    if (res && res.code === 200) {
      showSuccessMessage(res, '重新提交成功')
      loadRecordList()
    } else {
      showErrorMessage(res, '重新提交失败')
    }
  } catch (error) {
    if (error !== 'cancel') {
      handleApiError(error, '重新提交失败')
    }
  }
}

// 教室汇总审核
const handleClassroomSummary = (record) => {
  summaryForm.classroomId = record.classroomId
  summaryForm.classroomName = record.classroomNumber
  summaryForm.action = 'approved'
  summaryForm.approvalNote = ''
  summaryVisible.value = true
}

// 确认汇总审核
const confirmSummary = async () => {
  if (!summaryForm.classroomId) {
    ElMessageBox.warning('请选择要汇总的教室', '提示')
    return
  }

  summaryLoading.value = true
  try {
    // 获取该任务的审核结果
    // const approvalResponse = await approvalAPI.getApprovalResultsBySchedule(scheduleId.value)
    //
    // // 找到对应教室的审核结果
    // const targetApproval = (approvalResponse as any).data.find(
    //   approval => approval.classroomId === summaryForm.classroomId
    // )
    //
    // if (!targetApproval) {
    //   ElMessage.error('未找到该教室的审核结果')
    //   return
    // }
    
    // 调用汇总审核API
    const summarizeData = {
      "supervisionScheduleId": scheduleId.value,
      "classroomId": summaryForm.classroomId
    }
    
    const response: any = await summaryAPI.manualSummarize(summarizeData)
    if (response && response.code === 200) {
      showSuccessMessage(response, '汇总审核成功')
    } else {
      showErrorMessage(response, '汇总失败')
    }

    summaryVisible.value = false
    loadRecordList()
  } catch (error) {
    handleApiError(error, '汇总审核失败')
  } finally {
    summaryLoading.value = false
  }
}

// // 解析教学评价数据
// const getTeachingEvaluationValue = (evaluation, key) => {
//   if (!evaluation) return '-'
//   try {
//     const data = JSON.parse(evaluation)
//     return data[key] || '-'
//   } catch (error) {
//     return '-'
//   }
// }

// 解析评价数据
const getEvaluationValue = (evaluation, key) => {
  if (!evaluation) return 0
  try {
    const data = JSON.parse(evaluation)
    return data[key] || 0
      } catch (error) {
    return 0
  }
}

// 获取教学评价信息（参考 record.vue）
const getTeachingEvaluationInfo = (teachingEvaluation, key) => {
  try {
    const evaluation = JSON.parse(teachingEvaluation)
    return evaluation[key] || 0
  } catch {
    return 0
  }
}

// 获取学习评价信息
const getLearningEvaluationInfo = (learningEvaluation, key) => {
  try {
    const evaluation = JSON.parse(learningEvaluation)
    return evaluation[key] || 0
  } catch {
    return 0
  }
}

// 获取考勤评价信息
const getAttendanceEvaluationInfo = (attendanceEvaluation, key) => {
  try {
    const evaluation = JSON.parse(attendanceEvaluation)
    return evaluation[key] || 0
  } catch {
    return 0
  }
}

// 格式化百分比
const formatPercentage = (value) => {
  if (value === null || value === undefined) return '0%'
  return (value).toFixed(1) + '%'
}

// 获取详情页面标题
const getDetailTitle = () => {
  if (!currentRecord.value) return '督导记录详情'
  
  return currentRecord.value.evaluationTypeName + '详情' || '督导记录详情'
}

// 处理文件路径格式
const formatPhotoPath = (filePath) => {
  // 将 /api/v1/supervision/files/2025/08/07/20250807_180118_003.jpg 格式
  // 转换为 2025/08/07/20250807_184448_030.jpg 格式
  if (filePath.startsWith('/api/v1/supervision/files/')) {
    return filePath.replace('/api/v1/supervision/files/', '')
  }
  // 如果已经是相对路径格式，直接返回
  if (filePath.includes('/') && !filePath.startsWith('/api/')) {
    return filePath
  }
  return filePath
}

// 检测文件类型
const getFileType = (filePath) => {
  const extension = filePath.toLowerCase().split('.').pop()
  if (['mp4', 'avi', 'mov', 'wmv', 'flv', 'webm'].includes(extension || '')) {
    return 'video'
  }
  if (['jpg', 'jpeg', 'png', 'gif', 'bmp', 'webp'].includes(extension || '')) {
    return 'image'
  }
  return 'unknown'
}

// 获取媒体文件URL（使用blob）
const getPhotoUrl = async (filePath) => {
  try {
    const formattedPath = formatPhotoPath(filePath)
    const blob = await approvalAPI.getMediaFile(formattedPath)
    const objectUrl = URL.createObjectURL(blob)
    return objectUrl
  } catch (error) {
    console.error('获取媒体文件失败:', error)
    // 返回占位图片
    return 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjZjVmNWY1Ii8+PHRleHQgeD0iNTAlIiB5PSI1MCUiIGZvbnQtZmFtaWx5PSJBcmlhbCwgc2Fucy1zZXJpZiIgZm9udC1zaXplPSIxNCIgZmlsbD0iIzk5OSIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZHk9Ii4zZW0iPuekuuS+i+WbvueJhzwvdGV4dD48L3N2Zz4='
  }
}

// 预览媒体文件
const previewPhoto = async (filePath) => {
  try {
    const url = await getPhotoUrl(filePath)
    window.open(url, '_blank')
  } catch (error) {
    handleApiError(error, '预览媒体文件失败')
  }
}

// 查看照片和视频
const viewPhotos = async (photos) => {
  currentPhotos.value = photos
  currentPhotoIndex.value = 0
  photosDialogVisible.value = true

  // 预加载所有媒体文件
  for (const photo of photos) {
    if (!photoUrls.value.has(photo)) {
      try {
        const url = await getPhotoUrl(photo)
        photoUrls.value.set(photo, url)
      } catch (error) {
        // 静默处理预加载失败，使用占位图
        photoUrls.value.set(photo, 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjZjVmNWY1Ii8+PHRleHQgeD0iNTAlIiB5PSI1MCUiIGZvbnQtZmFtaWx5PSJBcmlhbCwgc2Fucy1zZXJpZiIgZm9udC1zaXplPSIxNCIgZmlsbD0iIzk5OSIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZHk9Ii4zZW0iPuekuuS+i+WbvueJhzwvdGV4dD48L3N2Zz4=')
      }
    }
  }
}

// 处理图片加载错误
const handleImageError = (event) => {
  const img = event.target as HTMLImageElement
  // 使用base64编码的占位图片，避免404错误
  img.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjZjVmNWY1Ii8+PHRleHQgeD0iNTAlIiB5PSI1MCUiIGZvbnQtZmFtaWx5PSJBcmlhbCwgc2Fucy1zZXJpZiIgZm9udC1zaXplPSIxNCIgZmlsbD0iIzk5OSIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZHk9Ii4zZW0iPuekuuS+i+WbvueJhzwvdGV4dD48L3N2Zz4='
}

// 初始化
onMounted(() => {
  loadTaskInfo()
  loadClassroomList()
  loadRecordList()
})
</script>

<style scoped>
.supervision-approval {
  padding: 3px 3px 3px 3px;
  display: flex;
  flex-direction: column;
}

.approval-container {
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

.approval-table {
  margin-top: 3px;
  flex: 1;
  display: flex;
  flex-direction: column;
  min-height: 0; /* 重要：允许flex子元素收缩 */
}

.approval-table :deep(.el-table__footer-wrapper) {
  margin-bottom: 0;
}

.approval-table :deep(.el-table__fixed-footer-wrapper) {
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

.record-detail {
  padding: 20px 0;
}

.evaluation-section {
  margin-top: 20px;
  padding-top: 20px;
  border-top: 1px solid #f0f0f0;
}

.evaluation-section h4 {
  margin-bottom: 12px;
  color: #333;
  font-weight: 600;
}

.remarks-section {
  margin-top: 20px;
  padding-top: 20px;
  border-top: 1px solid #f0f0f0;
}

.remarks-section h4 {
  margin-bottom: 12px;
  color: #333;
  font-weight: 600;
}

.remarks-section p {
  margin: 0;
  color: #666;
  line-height: 1.6;
}

.audit-info-section {
  margin-top: 20px;
  padding-top: 20px;
  border-top: 1px solid #f0f0f0;
}

.audit-info-section h4 {
  margin-bottom: 12px;
  color: #333;
  font-weight: 600;
}

.summary-content {
  padding: 20px 0;
}

.photos-viewer {
  text-align: center;
}

.photo-container {
  position: relative;
  height: 400px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.photo-image {
  max-width: 100%;
  max-height: 100%;
  object-fit: contain;
  cursor: pointer;
}

.unknown-file {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 200px;
  border: 2px dashed #ddd;
  border-radius: 8px;
  cursor: pointer;
  color: #999;
}

.unknown-file .el-icon {
  font-size: 48px;
  margin-bottom: 8px;
}

.photo-info {
  position: absolute;
  bottom: 10px;
  left: 50%;
  transform: translateX(-50%);
  background: rgba(0, 0, 0, 0.7);
  color: white;
  padding: 4px 8px;
  border-radius: 4px;
  font-size: 12px;
}

/* 详情页面样式 */
.basic-info-section {
  margin-bottom: 20px;
  padding-bottom: 20px;
  border-bottom: 1px solid #f0f0f0;
}

.basic-info-section h4 {
  margin-bottom: 12px;
  color: #333;
  font-weight: 600;
}

.student-evaluation-detail,
.teacher-evaluation-detail,
.summary-evaluation-detail {
  margin-bottom: 20px;
}

.student-evaluation-detail h4,
.teacher-evaluation-detail h4,
.summary-evaluation-detail h4 {
  margin-bottom: 16px;
  color: #333;
  font-weight: 600;
  font-size: 16px;
}

.evaluation-section h5 {
  margin-bottom: 12px;
  color: #666;
  font-weight: 500;
  font-size: 14px;
}

.total-score-display {
  text-align: center;
  padding: 20px;
  background: #f8f9fa;
  border-radius: 8px;
  border: 1px solid #e9ecef;
}

.total-score {
  font-size: 24px;
  font-weight: bold;
  color: #409eff;
}

.photos-section {
  margin-top: 20px;
  padding-top: 20px;
  border-top: 1px solid #f0f0f0;
}

.photos-section h4 {
  margin-bottom: 12px;
  color: #333;
  font-weight: 600;
}

/* 默认详情样式 */
.default-evaluation-detail {
  margin-bottom: 20px;
  padding: 20px;
  background: #f8f9fa;
  border-radius: 8px;
  border: 1px solid #e9ecef;
}

.default-evaluation-detail h4 {
  margin-bottom: 16px;
  color: #333;
  font-weight: 600;
  font-size: 16px;
}

.default-evaluation-detail p {
  margin: 0;
  color: #666;
  line-height: 1.6;
}
</style> 