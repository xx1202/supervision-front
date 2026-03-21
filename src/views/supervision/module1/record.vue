<template>
  <div class="supervision-audit">
    <div class="page-content">
      <div class="audit-container">
        <!-- 按督导安排查看模式 -->
        <div v-if="viewMode === 'bySchedule'" style="flex: 1; display: flex; flex-direction: column; min-height: 0;">
          <!-- 督导安排选择视图 -->
          <div v-if="!selectedScheduleId" style="flex: 1; display: flex; flex-direction: column; min-height: 0;">
            <!-- 搜索和过滤区域 -->
            <div class="search-section">
              <el-form :model="scheduleSearchForm" inline style="display: flex; align-items: center; justify-content: space-between;">
                <el-form-item>
                  <el-radio-group v-model="viewMode" @change="handleViewModeChange" size="default">
                    <el-radio-button value="bySchedule">按督导安排查看</el-radio-button>
                    <el-radio-button value="allRecords">全部记录查看</el-radio-button>
                  </el-radio-group>
                </el-form-item>
                <el-form-item label="日期范围">
                  <el-date-picker
                    v-model="scheduleSearchForm.dateRange"
                    type="daterange"
                    range-separator="至"
                    start-placeholder="开始日期"
                    end-placeholder="结束日期"
                    format="YYYY-MM-DD"
                    value-format="YYYY-MM-DD"
                    @change="handleScheduleSearch"
                  />
                </el-form-item>
                <el-form-item label="状态">
                  <el-select v-model="scheduleSearchForm.status" placeholder="选择状态" @change="handleScheduleSearch" clearable>
                    <el-option label="全部" value="" />
                    <el-option label="待开始" value="pending" />
                    <el-option label="进行中" value="in_progress" />
                    <el-option label="已完成" value="completed" />
                  </el-select>
                </el-form-item>
              </el-form>
            </div>
            
            <div class="schedule-table">
              <el-table 
                :data="filteredScheduleList" 
                style="width: 100%" 
                height="100%"
                v-loading="scheduleLoading"
                highlight-current-row
                @row-click="handleScheduleRowClick"
                :row-class-name="getScheduleRowClassName"
                fit
                table-layout="fixed"
                border
              >
                <el-table-column type="index" label="序号" width="60" align="center" />
                <el-table-column prop="supervisionDate" label="督导日期" width="120" align="center">
                  <template #default="scope">
                    {{ formatDate(scope.row.supervisionDate) }}
                  </template>
                </el-table-column>
                <el-table-column prop="period" label="节次" width="100" align="center">
                  <template #default="scope">
                    第{{ scope.row.period }}节
                  </template>
                </el-table-column>
                <el-table-column prop="leaderName" label="负责人" width="120" align="center" />
                <el-table-column prop="memberCount" label="成员数" width="100" align="center">
                  <template #default="scope">
                    {{ scope.row.memberCount || 0 }}人
                  </template>
                </el-table-column>
                <el-table-column prop="status" label="状态" width="120" align="center">
                  <template #default="scope">
                    <el-tag :type="getScheduleStatusType(scope.row.status)" size="small">
                      {{ getScheduleStatusName(scope.row.status) }}
                    </el-tag>
                  </template>
                </el-table-column>
                <el-table-column prop="notes" label="备注" min-width="150" show-overflow-tooltip />
                <el-table-column label="操作" width="120" align="center" fixed="right">
                  <template #default="scope">
                    <el-button 
                      type="primary" 
                      link 
                      size="small"
                      @click.stop="selectSchedule(scope.row.id)"
                    >
                      {{ selectedScheduleId === scope.row.id ? '已选择' : '选择' }}
                    </el-button>
                  </template>
                </el-table-column>
              </el-table>

              <!-- 督导安排分页 -->
              <div class="pagination-wrapper">
                <el-pagination
                  v-model:current-page="schedulePagination.current"
                  v-model:page-size="schedulePagination.size"
                  :page-sizes="PAGINATION.PAGE_SIZES"
                  :total="schedulePagination.total"
                  layout="total, sizes, prev, pager, next, jumper"
                  @size-change="handleScheduleSizeChange"
                  @current-change="handleScheduleCurrentChange"
                />
              </div>
            </div>
          </div>

          <!-- 督导记录视图（选择督导安排后显示） -->
          <div v-else style="flex: 1; display: flex; flex-direction: column; min-height: 0;">
            <!-- 搜索和过滤区域 -->
            <div class="search-section">
              <el-form :model="searchForm" inline style="display: flex; align-items: center; justify-content: space-between;">
                <el-form-item>
                  <el-button 
                    text 
                    type="primary" 
                    size="small"
                    @click="clearScheduleSelection"
                  >
                    <el-icon><ArrowLeft /></el-icon>
                    返回选择督导安排
                  </el-button>
                  <span class="schedule-title" v-if="selectedSchedule" style="margin-left: 16px;">
                    督导安排：{{ formatDate(selectedSchedule.supervisionDate) }} 第{{ selectedSchedule.period }}节
                  </span>
                </el-form-item>
                <el-form-item label="状态">
                  <el-select v-model="searchForm.status" placeholder="选择状态" @change="handleSearch" clearable>
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
            
            <div class="audit-table">
          <el-table
              :data="auditList"
              style="width: 100%"
              height="100%"
              v-loading="loading"
              fit
              table-layout="fixed"
              border
          >
            <el-table-column prop="createdTime" label="创建时间" width="160">
              <template #default="scope">
                {{ formatDateTime(scope.row.createdTime) }}
              </template>
            </el-table-column>
            <el-table-column prop="classroomNumber" label="教室" width="120" />
            <el-table-column prop="className" label="班级" width="150" />
            <el-table-column prop="courseName" label="课程" width="120" />
            <el-table-column prop="teacher" label="任课教师" width="120" />
            <el-table-column prop="supervisorName" label="督导员" width="120">
              <template #default="scope">
                {{ scope.row.supervisorName || '-' }}
              </template>
            </el-table-column>
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
            <el-table-column label="操作" min-width="200" fixed="right">
              <template #default="scope">
                <el-button size="small" @click="viewRecord(scope.row)">查看</el-button>
                <el-button
                    v-if="scope.row.status === SUPERVISION_RECORD_STATUS.SUBMITTED"
                    size="small"
                    type="success"
                    @click="approveRecord(scope.row)"
                >
                  通过
                </el-button>
                <el-button
                    v-if="scope.row.status === SUPERVISION_RECORD_STATUS.SUBMITTED"
                    size="small"
                    type="danger"
                    @click="rejectRecord(scope.row)"
                >
                  拒绝
                </el-button>
                <el-button
                    v-if="scope.row.status === SUPERVISION_RECORD_STATUS.REJECTED"
                    size="small"
                    type="warning"
                    @click="resubmitRecord(scope.row)"
                >
                  重新提交
                </el-button>
              </template>
            </el-table-column>
          </el-table>

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
        
        <!-- 全部记录查看模式 -->
        <div v-if="viewMode === 'allRecords'" style="flex: 1; display: flex; flex-direction: column; min-height: 0;">
          <!-- 搜索和过滤区域 -->
          <div class="search-section">
            <el-form :model="searchForm" inline style="display: flex; align-items: center; justify-content: space-between;">
              <el-form-item>
                <el-radio-group v-model="viewMode" @change="handleViewModeChange" size="default">
                  <el-radio-button value="bySchedule">按督导安排查看</el-radio-button>
                  <el-radio-button value="allRecords">全部记录查看</el-radio-button>
                </el-radio-group>
              </el-form-item>
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
              <el-form-item label="督导安排">
                <el-select v-model="searchForm.scheduleId" placeholder="选择督导安排" @change="handleSearch" clearable>
                  <el-option label="全部" value="" />
                  <el-option 
                    v-for="schedule in scheduleList" 
                    :key="schedule.id" 
                    :label="`${formatDate(schedule.supervisionDate)} 第${schedule.period}节`" 
                    :value="schedule.id" 
                  />
                </el-select>
              </el-form-item>
              <el-form-item label="状态">
                <el-select v-model="searchForm.status" placeholder="选择状态" @change="handleSearch" clearable>
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
                <el-input
                  v-model="searchForm.supervisorName"
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
            <el-table
              :data="auditList"
              style="width: 100%"
              height="100%"
              v-loading="loading"
              fit
              table-layout="fixed"
              border
            >
              <el-table-column prop="createdTime" label="创建时间" width="160">
                <template #default="scope">
                  {{ formatDateTime(scope.row.createdTime) }}
                </template>
              </el-table-column>
              <el-table-column prop="classroomNumber" label="教室" width="120" />
              <el-table-column prop="className" label="班级" width="150" />
              <el-table-column prop="courseName" label="课程" width="120" />
              <el-table-column prop="teacher" label="任课教师" width="120" />
              <el-table-column prop="supervisorName" label="督导员" width="120">
                <template #default="scope">
                  {{ scope.row.supervisorName || '-' }}
                </template>
              </el-table-column>
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
              <el-table-column label="操作" min-width="200" fixed="right">
                <template #default="scope">
                  <el-button size="small" @click="viewRecord(scope.row)">查看</el-button>
                  <el-button
                    v-if="scope.row.status === SUPERVISION_RECORD_STATUS.SUBMITTED"
                    size="small"
                    type="success"
                    @click="approveRecord(scope.row)"
                  >
                    通过
                  </el-button>
                  <el-button
                    v-if="scope.row.status === SUPERVISION_RECORD_STATUS.SUBMITTED"
                    size="small"
                    type="danger"
                    @click="rejectRecord(scope.row)"
                  >
                    拒绝
                  </el-button>
                  <el-button
                    v-if="scope.row.status === SUPERVISION_RECORD_STATUS.REJECTED"
                    size="small"
                    type="warning"
                    @click="resubmitRecord(scope.row)"
                  >
                    重新提交
                  </el-button>
                </template>
              </el-table-column>
            </el-table>

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
              {{ getTeachingEvaluationValue(currentRecord.teachingEvaluation, 'overallEffect') }}
            </el-descriptions-item>
            <el-descriptions-item label="座位安排">
              {{ getTeachingEvaluationValue(currentRecord.teachingEvaluation, 'seatingArrangement') }}
            </el-descriptions-item>
            <el-descriptions-item label="课堂氛围">
              {{ getTeachingEvaluationValue(currentRecord.teachingEvaluation, 'teachingMethod') }}
            </el-descriptions-item>
            <el-descriptions-item label="学生参与">
              {{ getTeachingEvaluationValue(currentRecord.teachingEvaluation, 'teachingAttitude') }}
            </el-descriptions-item>
            <el-descriptions-item label="教学评分">
              {{ getTeachingEvaluationValue(currentRecord.teachingEvaluation, 'teachingScore') }}分
            </el-descriptions-item>
            <el-descriptions-item label="备注">
              {{ currentRecord.notes }}
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
import { ref, reactive, onMounted, computed, watch } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { showSuccessMessage, showErrorMessage, handleApiError } from '@/utils/error-handler'
import { supervisionRecordAPI, supervisionScheduleAPI } from '@/api'
import { Document, ArrowLeft } from '@element-plus/icons-vue'
import { 
  SUPERVISION_RECORD_STATUS,
  SUPERVISION_RECORD_STATUS_MAP
} from '@/constants'
import { PAGINATION } from '@/constants/common'
import { approvalAPI } from '../../../api'

// 视图模式：'bySchedule' - 按督导安排查看, 'allRecords' - 全部记录查看
const viewMode = ref<'bySchedule' | 'allRecords'>('bySchedule')

// 选中的督导安排ID
const selectedScheduleId = ref<string>('')
const selectedSchedule = computed(() => {
  return scheduleList.value.find(s => s.id === selectedScheduleId.value)
})

// 督导安排搜索表单
const scheduleSearchForm = reactive({
  dateRange: [] as string[],
  status: ''
})

// 过滤后的督导安排列表（用于显示，后端已分页，这里只做前端过滤）
const filteredScheduleList = computed(() => {
  return scheduleList.value
})

// 搜索表单
const searchForm = reactive({
  dateRange: [] as string[],
  scheduleId: '',
  status: '',
  supervisorName: ''
})

// 督导安排列表
const scheduleList = ref<any[]>([])
const scheduleLoading = ref(false)

// 分页信息
const pagination = reactive({
  current: 1,
  size: 10,
  total: 0
})

// 督导安排分页信息
const schedulePagination = reactive({
  current: 1,
  size: 10,
  total: 0,
  pages: 0
})

const currentPhotos = ref<string[]>([])
const currentPhotoIndex = ref(0)
const photoUrls = ref<Map<string, string>>(new Map())
const photosDialogVisible = ref(false)

// 审核记录数据
const auditList = ref<any[]>([])
const loading = ref(false)

// 对话框状态
const detailVisible = ref(false)
const auditDialogVisible = ref(false)
const currentRecord = ref<any>(null)
const auditAction = ref<'approve' | 'reject'>('approve')

// 审核表单
const auditForm = reactive({
  note: ''
})

// 审核对话框标题
const auditDialogTitle = computed(() => {
  return auditAction.value === 'approve' ? '审核通过' : '审核拒绝'
})

// 获取状态类型
const getStatusType = (status: string) => {
  return SUPERVISION_RECORD_STATUS_MAP[status]?.type || 'info'
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
const loadAuditList = async () => {
  loading.value = true
  try {
    const params: any = {
      current: pagination.current,
      size: pagination.size
    }
    
    // 按督导安排查看模式：必须选择督导安排
    if (viewMode.value === 'bySchedule') {
      if (!selectedScheduleId.value) {
        auditList.value = []
        pagination.total = 0
        loading.value = false
        return
      }
      params.supervisionScheduleId = selectedScheduleId.value
    } else {
      // 全部记录查看模式：可选督导安排筛选
      if (searchForm.scheduleId) {
        params.supervisionScheduleId = searchForm.scheduleId
      }
      // 处理日期范围
      if (searchForm.dateRange && searchForm.dateRange.length === 2) {
        params.startDate = searchForm.dateRange[0]
        params.endDate = searchForm.dateRange[1]
      }
    }
    
    if (searchForm.status) {
      params.status = searchForm.status
    }
    
    if (searchForm.supervisorName) {
      params.supervisorName = searchForm.supervisorName
    }

    const response: any = await supervisionRecordAPI.getRecordList(params)
    if (response && response.code === 200) {
      auditList.value = response.data.records || []
      pagination.total = response.data.total || 0
    }
  } catch (error: any) {
    handleApiError(error, '加载审核记录列表失败')
  } finally {
    loading.value = false
  }
}

// 加载督导安排列表
const loadScheduleList = async () => {
  scheduleLoading.value = true
  try {
    const params: any = { 
      current: schedulePagination.current, 
      size: schedulePagination.size 
    }
    
    // 如果有日期范围筛选
    if (scheduleSearchForm.dateRange && scheduleSearchForm.dateRange.length === 2) {
      params.startDate = scheduleSearchForm.dateRange[0]
      params.endDate = scheduleSearchForm.dateRange[1]
    }
    
    // 如果有状态筛选
    if (scheduleSearchForm.status) {
      params.status = scheduleSearchForm.status
    }
    
    const response: any = await supervisionScheduleAPI.getScheduleList(params)
    if (response.code === 200 && response.data) {
      scheduleList.value = response.data.records || []
      schedulePagination.total = response.data.total || 0
      schedulePagination.pages = response.data.pages || 0
    }
  } catch (error: any) {
    console.error('加载督导安排列表失败:', error)
    handleApiError(error, '加载督导安排列表失败')
  } finally {
    scheduleLoading.value = false
  }
}

// 督导安排搜索处理
const handleScheduleSearch = () => {
  schedulePagination.current = 1
  loadScheduleList()
}

// 督导安排分页处理
const handleScheduleSizeChange = (size: number) => {
  schedulePagination.size = size
  schedulePagination.current = 1
  loadScheduleList()
}

const handleScheduleCurrentChange = (current: number) => {
  schedulePagination.current = current
  loadScheduleList()
}

// 获取督导安排状态名称
const getScheduleStatusName = (status: string) => {
  const statusMap: Record<string, string> = {
    'pending': '待开始',
    'in_progress': '进行中',
    'completed': '已完成',
    'cancelled': '已取消'
  }
  return statusMap[status] || '未知'
}

// 获取督导安排状态类型（用于标签颜色）
const getScheduleStatusType = (status: string) => {
  const typeMap: Record<string, string> = {
    'pending': 'info',
    'in_progress': 'primary',
    'completed': 'success',
    'cancelled': 'danger'
  }
  return typeMap[status] || 'info'
}

// 获取表格行类名（用于高亮选中的行）
const getScheduleRowClassName = ({ row }: { row: any }) => {
  if (row.id === selectedScheduleId.value) {
    return 'selected-row'
  }
  return ''
}

// 处理表格行点击
const handleScheduleRowClick = (row: any) => {
  selectSchedule(row.id)
}

// 选择督导安排
const selectSchedule = (scheduleId: string) => {
  selectedScheduleId.value = scheduleId
}

// 监听督导安排选择变化
watch(selectedScheduleId, (newScheduleId) => {
  if (newScheduleId && viewMode.value === 'bySchedule') {
    pagination.current = 1
    loadAuditList()
  }
})

// 清除督导安排选择
const clearScheduleSelection = () => {
  selectedScheduleId.value = ''
  auditList.value = []
  pagination.total = 0
}

// 处理视图模式切换
const handleViewModeChange = () => {
  // 切换模式时重置搜索条件
  if (viewMode.value === 'bySchedule') {
    // 切换到按督导安排查看模式：清空审核记录，等待选择督导安排
    searchForm.scheduleId = ''
    searchForm.dateRange = []
    selectedScheduleId.value = ''
    auditList.value = []
    pagination.total = 0
    pagination.current = 1
    // 重置督导安排分页
    schedulePagination.current = 1
    loadScheduleList()
  } else {
    // 切换到全部记录查看模式：加载督导安排列表（用于筛选）和审核记录
    selectedScheduleId.value = ''
    pagination.current = 1
    // 加载督导安排列表（用于全部记录模式下的筛选下拉框）
    loadScheduleList()
    // 加载审核记录
    loadAuditList()
  }
}

// 监听视图模式变化
watch(viewMode, () => {
  handleViewModeChange()
}, { immediate: false })

// 搜索处理
const handleSearch = () => {
  pagination.current = 1
  loadAuditList()
}

// 重置搜索
const resetSearch = () => {
  if (viewMode.value === 'bySchedule') {
    // 按督导安排查看模式：只重置状态
    searchForm.status = ''
  } else {
    // 全部记录查看模式：重置所有条件
    searchForm.dateRange = []
    searchForm.scheduleId = ''
    searchForm.status = ''
    searchForm.supervisorName = ''
  }
  handleSearch()
}

// 分页处理
const handleSizeChange = (size: number) => {
  pagination.size = size
  pagination.current = 1
  loadAuditList()
}

const handleCurrentChange = (current: number) => {
  pagination.current = current
  loadAuditList()
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
  auditAction.value = 'approve'
  currentRecord.value = row
  auditForm.note = ''
  auditDialogVisible.value = true
}

// 审核拒绝
const rejectRecord = (row: any) => {
  auditAction.value = 'reject'
  currentRecord.value = row
  auditForm.note = ''
  auditDialogVisible.value = true
}

// 确认审核
const confirmAudit = async () => {
  if (!auditForm.note.trim()) {
    ElMessage.warning('请输入审核意见')
    return
  }

  try {
    if (auditAction.value === 'approve') {
      const response: any = await supervisionRecordAPI.approveRecord(currentRecord.value.id, {
        action: 'approve',
        approvalNote: auditForm.note
      })
      if (response && response.code === 200) {
        showSuccessMessage(response, '审核通过成功')
        auditDialogVisible.value = false
        loadAuditList()
      } else {
        showErrorMessage(response, '审核通过失败')
      }
    } else {
      const response: any = await supervisionRecordAPI.approveRecord(currentRecord.value.id, {
        action: 'reject',
        approvalNote: auditForm.note
      })
      if (response && response.code === 200) {
        showSuccessMessage(response, '审核拒绝成功')
        auditDialogVisible.value = false
        loadAuditList()
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
      loadAuditList()
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
    handleApiError(error, '预览媒体文件失败')
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
  // 加载督导安排列表
  loadScheduleList()
  
  // 只有在全部记录查看模式下才自动加载审核记录
  // 按督导安排查看模式下，需要先选择督导安排
  if (viewMode.value === 'allRecords') {
    loadAuditList()
  } else {
    // 按督导安排查看模式：初始状态清空审核记录列表
    auditList.value = []
    pagination.total = 0
  }
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

/* 督导安排表格 */
.schedule-table {
  margin-top: 3px;
  flex: 1;
  display: flex;
  flex-direction: column;
  min-height: 0;
}

.schedule-table :deep(.el-table__footer-wrapper) {
  margin-bottom: 0;
}

.schedule-table :deep(.el-table__fixed-footer-wrapper) {
  margin-bottom: 0;
}

/* 选中行的样式 */
.schedule-table :deep(.el-table .selected-row) {
  background-color: #ecf5ff;
}

.schedule-table :deep(.el-table .selected-row:hover > td) {
  background-color: #d9ecff !important;
}

.schedule-table :deep(.el-table tbody tr) {
  cursor: pointer;
}

.schedule-table :deep(.el-table tbody tr:hover) {
  background-color: #f5f7fa;
}

.schedule-title {
  font-size: 16px;
  font-weight: 600;
  color: #303133;
}
</style>