<template>
  <div class="supervision-audit">
    <div class="page-content">
      <div class="audit-container">

        <!-- 搜索和过滤区域 -->
        <div class="search-section">
          <el-form :model="searchForm" inline style="display: flex; align-items: center; justify-content: space-between;">
            <el-form-item label="日期范围">
              <el-date-picker
                  v-model="searchForm.dateRange"
                  type="daterange"
                  range-separator="至"
                  start-placeholder="开始日期"
                  end-placeholder="结束日期"
                  format="YYYY-MM-DD"
                  value-format="YYYY-MM-DD"
                  @change="handleSearch"
              />
            </el-form-item>
            <el-form-item label="状态">
              <el-select v-model="searchForm.status" placeholder="选择状态" @change="handleSearch">
                <el-option label="全部" value="" />
                <el-option label="草稿" value="draft" />
                <el-option label="已提交" value="submitted" />
                <el-option label="已拒绝" value="rejected" />
                <el-option label="已通过" value="approved" />
              </el-select>
            </el-form-item>
            <el-form-item label="督导员">
              <el-input
                  v-model="searchForm.supervisionScheduleId"
                  placeholder="输入督导员姓名"
                  clearable
                  @keyup.enter="handleSearch"
              />
            </el-form-item>
            <el-form-item>
              <el-button type="primary" @click="handleSearch">搜索</el-button>
              <el-button @click="resetSearch">重置</el-button>
            </el-form-item>
          </el-form>
        </div>

        <div class="audit-table">

          <!-- 分页 -->
          <!--          <div class="pagination-wrapper">-->
          <!--            <el-pagination-->
          <!--              v-model:current-page="pagination.current"-->
          <!--              v-model:page-size="pagination.size"-->
          <!--              :page-sizes="[10, 20, 50, 100]"-->
          <!--              :total="pagination.total"-->
          <!--              layout="total, sizes, prev, pager, next, jumper"-->
          <!--              @size-change="handleSizeChange"-->
          <!--              @current-change="handleCurrentChange"-->
          <!--            />-->
          <!--          </div>-->
        </div>

        <div v-for="group in groupList" :key="group.supervisionScheduleId" class="group-item">
          <!-- 分组头部：督导任务信息 -->
          <div class="group-header">
            <div class="group-info">
              <span class="group-date">{{ formatDate(group.supervisionDate) }}</span>
              <span class="group-weekday">{{ group.weekDay }}</span>
              <span class="group-period">第{{ group.period }}节</span>
              <span class="group-module">{{ getModuleTypeName(group.moduleType) }}</span>
              <el-tag :type="getStatusType(group.status)" size="small">
                {{ getStatusName(group.status) }}
              </el-tag>
            </div>
            <div class="group-leader">带队领导: {{ group.leader }}</div>
          </div>

          <!-- 分组内容：督导记录列表 -->
          <el-table
              :data="group.records"
              style="width: 100%"
              v-loading="loading"
              border
          >
            <el-table-column prop="createdTime" label="创建时间" width="160">
              <template #default="scope">
                {{ formatDateTime(scope.row.createdTime) }}
              </template>
            </el-table-column>
            <el-table-column prop="classroomId" label="教室" width="120" />
            <el-table-column prop="classId" label="班级" width="150" />
            <el-table-column prop="courseName" label="课程" width="120" />
            <el-table-column prop="teacher" label="任课教师" width="120" />
            <el-table-column prop="supervisor" label="督导员" width="120">
              <template #default="scope">
                {{ scope.row.supervisor || '-' }}
              </template>
            </el-table-column>
            <el-table-column prop="status" label="状态" width="100">
              <template #default="scope">
                <el-tag :type="getStatusType(scope.row.status)">
                  {{ getStatusName(scope.row.status) }}
                </el-tag>
              </template>
            </el-table-column>
            <el-table-column prop="submittedAt" label="提交时间" width="160">
              <template #default="scope">
                {{ formatDateTime(scope.row.submittedAt) }}
              </template>
            </el-table-column>
            <el-table-column label="操作" min-width="200" fixed="right">
              <template #default="scope">
                <el-button size="small" @click="viewRecord(scope.row)">查看</el-button>
                <el-button
                    v-if="scope.row.status === 'submitted'"
                    size="small"
                    type="success"
                    @click="approveRecord(scope.row)"
                >
                  通过
                </el-button>
                <el-button
                    v-if="scope.row.status === 'submitted'"
                    size="small"
                    type="danger"
                    @click="rejectRecord(scope.row)"
                >
                  拒绝
                </el-button>
                <el-button
                    v-if="scope.row.status === 'rejected'"
                    size="small"
                    type="warning"
                    @click="resubmitRecord(scope.row)"
                >
                  重新提交
                </el-button>
              </template>
            </el-table-column>
          </el-table>

        </div>
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

        <!-- 教学评价 -->
        <div class="evaluation-section">
          <h4>教学评价</h4>
          <el-descriptions :column="2" border>
            <el-descriptions-item label="教学态度">
              {{ getTeachingEvaluationValue(currentRecord.teachingEvaluation, 'teachingAttitude') }}
            </el-descriptions-item>
            <el-descriptions-item label="座位安排">
              {{ getTeachingEvaluationValue(currentRecord.teachingEvaluation, 'seatingArrangement') }}
            </el-descriptions-item>
            <el-descriptions-item label="课堂氛围">
              {{ getTeachingEvaluationValue(currentRecord.teachingEvaluation, 'classroomAtmosphere') }}
            </el-descriptions-item>
            <el-descriptions-item label="学生参与">
              {{ getTeachingEvaluationValue(currentRecord.teachingEvaluation, 'studentParticipation') }}
            </el-descriptions-item>
            <el-descriptions-item label="教学评分">
              {{ currentRecord.teachingScore || 0 }}分
            </el-descriptions-item>
            <el-descriptions-item label="备注">
              {{ getTeachingEvaluationValue(currentRecord.teachingEvaluation, '测试') }}
            </el-descriptions-item>
          </el-descriptions>
        </div>
        <!-- 学习评价 -->
        <div class="evaluation-section">
          <h4>学习评价</h4>
          <el-descriptions :column="2" border>
            <el-descriptions-item label="睡觉人数">
              {{ getLearningEvaluationValue(currentRecord.learningEvaluation, 'sleepingCount') }}人
            </el-descriptions-item>
            <el-descriptions-item label="玩游戏人数">
              {{ getLearningEvaluationValue(currentRecord.learningEvaluation, 'gamePlayingCount') }}人
            </el-descriptions-item>
            <el-descriptions-item label="无材料人数">
              {{ getLearningEvaluationValue(currentRecord.learningEvaluation, 'noMaterialsCount') }}人
            </el-descriptions-item>
            <el-descriptions-item label="无关视频人数">
              {{ getLearningEvaluationValue(currentRecord.learningEvaluation, 'irrelevantVideoCount') }}人
            </el-descriptions-item>
            <el-descriptions-item label="学习评分">
              {{ currentRecord.learningScore || 0 }}分
            </el-descriptions-item>
            <el-descriptions-item label="备注">
              {{ getLearningEvaluationValue(currentRecord.learningEvaluation, 'notes') }}
            </el-descriptions-item>
          </el-descriptions>
        </div>

        <!-- 到课情况 -->
        <div class="evaluation-section">
          <h4>到课情况</h4>
          <el-descriptions :column="2" border>
            <el-descriptions-item label="应到人数">
              {{ currentRecord.expectedCount || 0 }}人
            </el-descriptions-item>
            <el-descriptions-item label="实到人数">
              {{ currentRecord.actualCount || 0 }}人
            </el-descriptions-item>
            <el-descriptions-item label="到课率">
              {{ currentRecord.expectedCount ? Math.round((currentRecord.actualCount / currentRecord.expectedCount) * 100) : 0 }}%
            </el-descriptions-item>
            <el-descriptions-item label="总分">
              {{ currentRecord.totalScore || 0 }}分
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
        <span v-else style="color: #999;">无照片 </span><!-- 审核信息 -->
        <div v-if="currentRecord.status === 'approved' || currentRecord.status === 'rejected'" class="audit-info-section">
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

    <!-- 审核对话框 -->
    <el-dialog
        :title="auditDialogTitle"
        v-model="auditDialogVisible"
        width="500px"
        :append-to-body="true"
        :lock-scroll="true"
        :close-on-click-modal="false"
    >
      <el-form :model="auditForm" label-width="100px">
        <el-form-item label="审核意见" required>
          <el-input
              v-model="auditForm.note"
              type="textarea"
              :rows="4"
              placeholder="请输入审核意见"
          />
        </el-form-item>
      </el-form>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="auditDialogVisible = false">取消</el-button>
          <el-button type="primary" @click="confirmAudit">确定</el-button>
        </span>
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
import { ElMessageBox } from 'element-plus'
import { showSuccessMessage, showErrorMessage, handleApiError } from '@/utils/error-handler'
import { supervisionRecordAPI } from '@/api'
import {Document} from "@element-plus/icons-vue";


const currentPhotos = ref<string[]>([])
const currentPhotoIndex = ref(0)
const photoUrls = ref<Map<string, string>>(new Map())
const photosDialogVisible = ref(false)
import { approvalAPI } from '../../../api'
// 搜索表单
const searchForm = reactive({
  dateRange: [] as string[],
  status: '',
  supervisor: '', // 改为supervisor（督导员ID）
  classroomId: '', // 添加教室ID搜索
  supervisionScheduleId: '' // 添加督导安排ID搜索
})


// 分页信息
const pagination = reactive({
  current: 1,
  size: 10,
  total: 0
})

// 审核记录数据
const groupList  = ref<any[]>([])
const loading = ref(false)

// 对话框状态
const detailVisible = ref(false)
const auditDialogVisible = ref(false)
const currentRecord = ref<any>(null)
const auditAction = ref<'approved' | 'rejected'>('approved')

// 审核表单
const auditForm = reactive({
  note: ''
})

// 审核对话框标题
const auditDialogTitle = computed(() => {
  return auditAction.value === 'approved' ? '审核通过' : '审核拒绝'
})

// 获取状态类型
const getStatusType = (status: string) => {
  switch (status) {
    case 'draft':
      return 'info'
    case 'submitted':
      return 'warning'
    case 'approved':
      return 'success'
    case 'rejected':
      return 'danger'
    default:
      return 'info'
  }
}

// 格式化日期
const formatDate = (date: string) => {
  if (!date) return ''
  return new Date(date).toLocaleDateString('zh-CN')
}

// 格式化日期时间
const formatDateTime = (datetime: string) => {
  if (!datetime) return ''
  return new Date(datetime).toLocaleString('zh-CN')
}

// 解析教学评价数据
const getTeachingEvaluationValue = (evaluation: string, key: string) => {
  if (!evaluation) return '-'
  try {
    const data = JSON.parse(evaluation)
    return data[key] || '-'
  } catch (error) {
    return '-'
  }
}

// 解析学习评价数据
const getLearningEvaluationValue = (evaluation: string, key: string) => {
  if (!evaluation) return 0
  try {
    const data = JSON.parse(evaluation)
    return data[key] || 0
  } catch (error) {
    return 0
  }
}

// 加载审核记录列表
const loadGroupList  = async () => {
  loading.value = true
  try {
    const params: any = {
      page: pagination.current,
      size: pagination.size
    }

    // 构建查询参数
    if (searchForm.dateRange && searchForm.dateRange.length === 2) {
      params.startDate = searchForm.dateRange[0]
      params.endDate = searchForm.dateRange[1]
    }

    if (searchForm.status) {
      params.status = searchForm.status
    }

    if (searchForm.supervisor) {
      params.supervisor = searchForm.supervisor
    }

    if (searchForm.classroomId) {
      params.classroomId = searchForm.classroomId
    }

    if (searchForm.supervisionScheduleId) {
      params.supervisionScheduleId = searchForm.supervisionScheduleId
    }

    // 使用新的分组API
    const response: any = await supervisionRecordAPI.getRecordGroupByTask(params)
    if (response && response.code === 200) {
      groupList.value = response.data.records || []
      pagination.total = response.data.total || 0
    }
  } catch (error: any) {
    handleApiError(error, '加载分组记录列表失败')
  } finally {
    loading.value = false
  }
}

// 搜索处理
const handleSearch = () => {
  pagination.current = 1
  loadGroupList()
}

// 重置搜索
const resetSearch = () => {
  searchForm.dateRange = []
  searchForm.status = ''
  searchForm.supervisor = ''
  searchForm.classroomId = ''
  searchForm.supervisionScheduleId = ''
  handleSearch()
}

// 分页处理
const handleSizeChange = (size: number) => {
  pagination.size = size
  pagination.current = 1
  handleSearch()
}

const handleCurrentChange = (current: number) => {
  pagination.current = current
  handleSearch()
}

// 获取模块类型名称
const getModuleTypeName = (moduleType: string) => {
  const map: Record<string, string> = {
    'daily_teaching': '日常教学',
    'administrative': '行政坐班',
    'classroom_inspection': '教室巡查'
  }
  return map[moduleType] || moduleType
}

// 获取状态名称
const getStatusName = (status: string) => {
  const map: Record<string, string> = {
    'draft': '草稿',
    'submitted': '已提交',
    'approved': '已通过',
    'rejected': '已拒绝',
    'pending': '待开始',
    'in_progress': '进行中',
    'completed': '已完成',
    'cancelled': '已取消'
  }
  return map[status] || status
}

// 查看督导记录详情
const viewRecord = async (row: any) => {
  try {
    const response: any = await supervisionRecordAPI.getRecordDetail(row.id)
    if (response && response.data) {
      if (typeof response.data.photos === 'string') {
        response.data.photos = JSON.parse(response.data.photos)
      }
      currentRecord.value = response.data
      detailVisible.value = true
    }
  } catch (error: any) {
    handleApiError(error, '获取督导记录详情失败')
  }
}

// 审核通过
const approveRecord = (row: any) => {
  auditAction.value = 'approved'
  currentRecord.value = row
  auditForm.note = ''
  auditDialogVisible.value = true
}

// 审核拒绝
const rejectRecord = (row: any) => {
  auditAction.value = 'rejected'
  currentRecord.value = row
  auditForm.note = ''
  auditDialogVisible.value = true
}

// 确认审核
const confirmAudit = async () => {
  if (!auditForm.note.trim()) {
    ElMessageBox.warning('请输入审核意见', '提示')
    return
  }

  try {
    if (auditAction.value === 'approved') {
      const response: any = await supervisionRecordAPI.approveRecord(currentRecord.value.id, {
        action: 'approved',
        approvalNote: auditForm.note
      })
      if (response && response.code === 200) {
        showSuccessMessage(response, '审核通过成功')
        auditDialogVisible.value = false
        handleSearch()
      } else {
        showErrorMessage(response, '审核通过失败')
      }
    } else {
      const response: any = await supervisionRecordAPI.approveRecord(currentRecord.value.id, {
        action: 'rejected',
        approvalNote: auditForm.note
      })
      if (response && response.code === 200) {
        showSuccessMessage(response, '审核拒绝成功')
        auditDialogVisible.value = false
        handleSearch()
      } else {
        showErrorMessage(response, '审核拒绝失败')
      }
    }
  } catch (error: any) {
    handleApiError(error, '审核操作失败')
  }
}

// 重新提交
const resubmitRecord = async (row: any) => {
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
      handleSearch()
    } else {
      showErrorMessage(res, '重新提交失败')
    }
  } catch (error: any) {
    if (error !== 'cancel') {
      handleApiError(error, '重新提交失败')
    }
  }
}

// 处理文件路径格式
const formatPhotoPath = (filePath: string) => {
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
const getFileType = (filePath: string) => {
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
const getPhotoUrl = async (filePath: string) => {
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
const previewPhoto = async (filePath: string) => {
  try {
    const url = await getPhotoUrl(filePath)
    window.open(url, '_blank')
  } catch (error) {
    console.error('预览媒体文件失败:', error)
    ElMessageBox.error('预览媒体文件失败', '错误')
  }
}
// 查看照片和视频
const viewPhotos = async (photos: string[]) => {
  currentPhotos.value = photos;
  currentPhotoIndex.value = 0
  photosDialogVisible.value = true

  // 预加载所有媒体文件
  for (const photo of photos) {
    if (!photoUrls.value.has(photo)) {
      try {
        const url = await getPhotoUrl(photo)
        photoUrls.value.set(photo, url)
      } catch (error) {
        console.error('预加载媒体文件失败:', error)
        photoUrls.value.set(photo, 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjZjVmNWY1Ii8+PHRleHQgeD0iNTAlIiB5PSI1MCUiIGZvbnQtZmFtaWx5PSJBcmlhbCwgc2Fucy1zZXJpZiIgZm9udC1zaXplPSIxNCIgZmlsbD0iIzk5OSIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZHk9Ii4zZW0iPuekuuS+i+WbvueJhzwvdGV4dD48L3N2Zz4=')
      }
    }
  }
}
// 处理图片加载错误
const handleImageError = (event: Event) => {
  const img = event.target as HTMLImageElement
  // 使用base64编码的占位图片，避免404错误
  img.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjZjVmNWY1Ii8+PHRleHQgeD0iNTAlIiB5PSI1MCUiIGZvbnQtZmFtaWx5PSJBcmlhbCwgc2Fucy1zZXJpZiIgZm9udC1zaXplPSIxNCIgZmlsbD0iIzk5OSIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZHk9Ii4zZW0iPuekuuS+i+WbvueJhzwvdGV4dD48L3N2Zz4='
}

// 组件挂载时加载数据
onMounted(() => {
  handleSearch()
})
</script>

<style scoped>
.supervision-audit {
  padding: 3px 3px 3px 3px;
  display: flex;
  flex-direction: column;
}

.audit-container {
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

.audit-table {
  margin-top: 3px;
  flex: 1;
  display: flex;
  flex-direction: column;
  min-height: 0; /* 重要：允许flex子元素收缩 */
}

.audit-table :deep(.el-table__footer-wrapper) {
  margin-bottom: 0;
}

.audit-table :deep(.el-table__fixed-footer-wrapper) {
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
</style>