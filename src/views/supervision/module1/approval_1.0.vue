<template>
  <div class="supervision-approval">
    <div class="page-content">
      <div class="approval-container">
        <!-- 表格类型切换 -->
        <div class="table-type-switch">
          <el-radio-group v-model="currentTableType" @change="handleTableTypeChange">
            <el-radio-button label="summary">汇总表</el-radio-button>
            <el-radio-button label="teacher">教师评价记录表</el-radio-button>
            <el-radio-button label="student">学生记录表</el-radio-button>
          </el-radio-group>
        </div>

        <!-- 审核结果列表 -->
        <div class="approval-list">
          <!-- 汇总表 -->
          <el-table
              v-if="currentTableType === 'summary'"
              :data="approvalResults"
              style="width: 100%"
              v-loading="loading"
              border
          >
            <el-table-column label="班级" width="100">
              <template #default="scope">
                <div v-if="scope.row.classInfo">
                  {{ getClassInfo(scope.row.classInfo, 'className') }}
                </div>
              </template>
            </el-table-column>
            <el-table-column label="课程名称" width="140">
              <template #default="scope">
                <div v-if="scope.row.classInfo">
                  {{ getClassInfo(scope.row.classInfo, 'courseName') }}
                </div>
              </template>
            </el-table-column>
            <el-table-column label="课程性质" width="80">
              <template #default="scope">
                <div v-if="scope.row.classInfo">
                  {{ getClassInfo(scope.row.classInfo, 'courseType') || '理论/实践' }}
                </div>
              </template>
            </el-table-column>
            <el-table-column label="任课教师" width="80">
              <template #default="scope">
                <div v-if="scope.row.classInfo">
                  {{ getClassInfo(scope.row.classInfo, 'teacher') }}
                </div>
              </template>
            </el-table-column>
            <el-table-column label="辅导员/班主任" width="100">
              <template #default="scope">
                <div v-if="scope.row.classInfo">
                  {{ getClassInfo(scope.row.classInfo, 'counselor') }}
                </div>
              </template>
            </el-table-column>
            <el-table-column label="班级人数" width="80">
              <template #default="scope">
                <div v-if="scope.row.classInfo">
                  {{ getClassInfo(scope.row.classInfo, 'totalStudents') }}
                </div>
              </template>
            </el-table-column>

            <!-- 考勤情况（20分） -->
            <el-table-column label="考勤情况（20分）" width="250">
              <el-table-column label="请假人数" width="60">
                <template #default="scope">
                  <div v-if="scope.row.attendanceInfo">
                    {{ getAttendanceInfo(scope.row.attendanceInfo, 'leaveCount') }}
                  </div>
                </template>
              </el-table-column>
              <el-table-column label="旷课人数" width="60">
                <template #default="scope">
                  <div v-if="scope.row.attendanceInfo">
                    {{ getAttendanceInfo(scope.row.attendanceInfo, 'absentCount') }}
                  </div>
                </template>
              </el-table-column>
              <el-table-column label="实到人数" width="60">
                <template #default="scope">
                  <div v-if="scope.row.attendanceInfo">
                    {{ getAttendanceInfo(scope.row.attendanceInfo, 'actualCount') }}
                  </div>
                </template>
              </el-table-column>
              <el-table-column label="到课率(%)" width="90">
                <template #default="scope">
                  <div v-if="scope.row.attendanceInfo">
                    {{ formatPercentage(getAttendanceInfo(scope.row.attendanceInfo, 'attendanceRate')) }}
                  </div>
                </template>
              </el-table-column>
              <el-table-column label="得分" width="60">
                <template #default="scope">
                  <div v-if="scope.row.attendanceInfo">
                    {{ getAttendanceInfo(scope.row.attendanceInfo, 'score') }}
                  </div>
                </template>
              </el-table-column>
            </el-table-column>

            <!-- 督教情况（60分） -->
            <el-table-column label="督教情况（60分）" width="250">
              <el-table-column label="教学态度" width="60">
                <template #default="scope">
                  <div v-if="scope.row.teachingEvaluation">
                    {{ getTeachingEvaluationInfo(scope.row.teachingEvaluation, 'teachingScore.teachingAttitude') }}
                  </div>
                </template>
              </el-table-column>
              <el-table-column label="教学方法" width="60">
                <template #default="scope">
                  <div v-if="scope.row.teachingEvaluation">
                    {{ getTeachingEvaluationInfo(scope.row.teachingEvaluation, 'teachingScore.teachingMethod') }}
                  </div>
                </template>
              </el-table-column>
              <el-table-column label="就坐情况" width="60">
                <template #default="scope">
                  <div v-if="scope.row.teachingEvaluation">
                    {{ getTeachingEvaluationInfo(scope.row.teachingEvaluation, 'teachingScore.seatingArrangement') }}
                  </div>
                </template>
              </el-table-column>
              <el-table-column label="综合效果" width="60">
                <template #default="scope">
                  <div v-if="scope.row.teachingEvaluation">
                    {{ getTeachingEvaluationInfo(scope.row.teachingEvaluation, 'teachingScore.comprehensiveEffect') }}
                  </div>
                </template>
              </el-table-column>
              <el-table-column label="得分" width="60">
                <template #default="scope">
                  <div v-if="scope.row.teachingEvaluation">
                    {{ getTeachingEvaluationInfo(scope.row.teachingEvaluation, 'teachingScore.score') }}
                  </div>
                </template>
              </el-table-column>
            </el-table-column>

            <!-- 督学情况（20分） -->
            <el-table-column label="督学情况（20分）" width="180">
              <el-table-column label="违纪人数" width="60">
                <template #default="scope">
                  <div v-if="scope.row.learningEvaluation">
                    {{ getLearningEvaluationInfo(scope.row.learningEvaluation, 'violationCount') }}
                  </div>
                </template>
              </el-table-column>
              <el-table-column label="违纪率(%)" width="90">
                <template #default="scope">
                  <div v-if="scope.row.learningEvaluation">
                    {{ formatPercentage(getLearningEvaluationInfo(scope.row.learningEvaluation, 'violationRate')) }}
                  </div>
                </template>
              </el-table-column>
              <el-table-column label="得分" width="60">
                <template #default="scope">
                  <div v-if="scope.row.learningEvaluation">
                    {{ getLearningEvaluationInfo(scope.row.learningEvaluation, 'score') }}
                  </div>
                </template>
              </el-table-column>
            </el-table-column>

            <el-table-column label="总分" width="60">
              <template #default="scope">
                <span class="total-score">{{ scope.row.totalScore }}</span>
              </template>
            </el-table-column>

            <el-table-column label="备注" width="100">
              <template #default="scope">
                {{ scope.row.notes }}
              </template>
            </el-table-column>

            <el-table-column label="审核状态" width="80" fixed="right">
              <template #default="scope">
                <el-tag :type="getReviewStatusType(scope.row.reviewStatus)">
                  {{ scope.row.reviewStatusName }}
                </el-tag>
              </template>
            </el-table-column>

            <el-table-column label="操作" width="160" fixed="right">
              <template #default="scope">
                <el-button size="small" @click="viewOriginalRecords(scope.row)">查看原始记录</el-button>
                <el-button
                    v-if="scope.row.reviewStatus === 'pending'"
                    size="small"
                    type="primary"
                    @click="reviewApproval(scope.row)"
                >
                  审核
                </el-button>
              </template>
            </el-table-column>
          </el-table>

          <!-- 教师评价记录表 -->
          <el-table
              v-if="currentTableType === 'teacher'"
              :data="approvalResults"
              style="width: 100%"
              v-loading="loading"
              border
          >
            <el-table-column type="index" label="序号" width="60" />
            <el-table-column label="任课教师" width="100">
              <template #default="scope">
                <div v-if="scope.row.classInfo">
                  {{ getClassInfo(scope.row.classInfo, 'teacher') }}
                </div>
              </template>
            </el-table-column>
            <el-table-column label="班级" width="120">
              <template #default="scope">
                <div v-if="scope.row.classInfo">
                  {{ getClassInfo(scope.row.classInfo, 'className') }}
                </div>
              </template>
            </el-table-column>
            <el-table-column label="课程名称" width="180">
              <template #default="scope">
                <div v-if="scope.row.classInfo">
                  {{ getClassInfo(scope.row.classInfo, 'courseName') }}
                </div>
              </template>
            </el-table-column>
            <el-table-column label="教室" width="100">
              <template #default="scope">
                {{ scope.row.classroomName }}
              </template>
            </el-table-column>
            <el-table-column label="教学态度" width="80">
              <template #default="scope">
                <div v-if="scope.row.teachingEvaluation">
                  {{ getTeachingEvaluationInfo(scope.row.teachingEvaluation, 'teachingScore.teachingAttitude') }}
                </div>
              </template>
            </el-table-column>
            <el-table-column label="教学方法" width="80">
              <template #default="scope">
                <div v-if="scope.row.teachingEvaluation">
                  {{ getTeachingEvaluationInfo(scope.row.teachingEvaluation, 'teachingScore.teachingMethod') }}
                </div>
              </template>
            </el-table-column>
            <el-table-column label="就坐情况" width="80">
              <template #default="scope">
                <div v-if="scope.row.teachingEvaluation">
                  {{ getTeachingEvaluationInfo(scope.row.teachingEvaluation, 'teachingScore.seatingArrangement') }}
                </div>
              </template>
            </el-table-column>
            <el-table-column label="综合效果" width="80">
              <template #default="scope">
                <div v-if="scope.row.teachingEvaluation">
                  {{ getTeachingEvaluationInfo(scope.row.teachingEvaluation, 'teachingScore.comprehensiveEffect') }}
                </div>
              </template>
            </el-table-column>
            <el-table-column label="得分" width="80">
              <template #default="scope">
                <div v-if="scope.row.teachingEvaluation">
                  {{ getTeachingEvaluationInfo(scope.row.teachingEvaluation, 'teachingScore.score') }}
                </div>
              </template>
            </el-table-column>
            <el-table-column label="备注" width="200">
              <template #default="scope">
                {{ scope.row.notes }}
              </template>
            </el-table-column>
            <el-table-column label="审核状态" width="80" fixed="right">
              <template #default="scope">
                <el-tag :type="getReviewStatusType(scope.row.reviewStatus)">
                  {{ scope.row.reviewStatusName }}
                </el-tag>
              </template>
            </el-table-column>
            <el-table-column label="操作" width="160" fixed="right">
              <template #default="scope">
                <el-button size="small" @click="viewOriginalRecords(scope.row)">查看原始记录</el-button>
                <el-button
                    v-if="scope.row.reviewStatus === 'pending'"
                    size="small"
                    type="primary"
                    @click="reviewApproval(scope.row)"
                >
                  审核
                </el-button>
              </template>
            </el-table-column>
          </el-table>

          <!-- 学生记录表 -->
          <el-table
              v-if="currentTableType === 'student'"
              :data="approvalResults"
              style="width: 100%"
              v-loading="loading"
              border
          >
            <el-table-column type="index" label="序号" width="60" />
            <el-table-column label="任课教师" width="100">
              <template #default="scope">
                <div v-if="scope.row.classInfo">
                  {{ getClassInfo(scope.row.classInfo, 'teacher') }}
                </div>
              </template>
            </el-table-column>
            <el-table-column label="班级" width="120">
              <template #default="scope">
                <div v-if="scope.row.classInfo">
                  {{ getClassInfo(scope.row.classInfo, 'className') }}
                </div>
              </template>
            </el-table-column>
            <el-table-column label="教室" width="100">
              <template #default="scope">
                {{ scope.row.classroomName }}
              </template>
            </el-table-column>
            <el-table-column label="班级人数" width="100">
              <template #default="scope">
                <div v-if="scope.row.classInfo">
                  {{ getClassInfo(scope.row.classInfo, 'totalStudents') }}
                </div>
              </template>
            </el-table-column>

            <!-- 考勤情况（20分） -->
            <el-table-column label="考勤情况（20分）" width="250">
              <el-table-column label="请假人数" width="60">
                <template #default="scope">
                  <div v-if="scope.row.attendanceInfo">
                    {{ getAttendanceInfo(scope.row.attendanceInfo, 'leaveCount') }}
                  </div>
                </template>
              </el-table-column>
              <el-table-column label="旷课人数" width="60">
                <template #default="scope">
                  <div v-if="scope.row.attendanceInfo">
                    {{ getAttendanceInfo(scope.row.attendanceInfo, 'absentCount') }}
                  </div>
                </template>
              </el-table-column>
              <el-table-column label="实到人数" width="60">
                <template #default="scope">
                  <div v-if="scope.row.attendanceInfo">
                    {{ getAttendanceInfo(scope.row.attendanceInfo, 'actualCount') }}
                  </div>
                </template>
              </el-table-column>
              <el-table-column label="到课率(%)" width="90">
                <template #default="scope">
                  <div v-if="scope.row.attendanceInfo">
                    {{ formatPercentage(getAttendanceInfo(scope.row.attendanceInfo, 'attendanceRate')) }}
                  </div>
                </template>
              </el-table-column>
              <el-table-column label="得分" width="60">
                <template #default="scope">
                  <div v-if="scope.row.attendanceInfo">
                    {{ getAttendanceInfo(scope.row.attendanceInfo, 'score') }}
                  </div>
                </template>
              </el-table-column>
            </el-table-column>

            <!-- 督学情况（20分） -->
            <el-table-column label="督学情况（20分）" width="300">
              <el-table-column label="玩手机" width="60">
                <template #default="scope">
                  <div v-if="scope.row.learningEvaluation">
                    {{ getLearningEvaluationInfo(scope.row.learningEvaluation, 'phonePlayingCount') || 0 }}
                  </div>
                </template>
              </el-table-column>
              <el-table-column label="睡觉" width="60">
                <template #default="scope">
                  <div v-if="scope.row.learningEvaluation">
                    {{ getLearningEvaluationInfo(scope.row.learningEvaluation, 'sleepingCount') || 0 }}
                  </div>
                </template>
              </el-table-column>
              <el-table-column label="未带教材" width="60">
                <template #default="scope">
                  <div v-if="scope.row.learningEvaluation">
                    {{ getLearningEvaluationInfo(scope.row.learningEvaluation, 'noMaterialsCount') || 0 }}
                  </div>
                </template>
              </el-table-column>
              <el-table-column label="违纪总人数" width="60">
                <template #default="scope">
                  <div v-if="scope.row.learningEvaluation">
                    {{ getLearningEvaluationInfo(scope.row.learningEvaluation, 'violationCount') }}
                  </div>
                </template>
              </el-table-column>
              <el-table-column label="违纪率(%)" width="90">
                <template #default="scope">
                  <div v-if="scope.row.learningEvaluation">
                    {{ formatPercentage(getLearningEvaluationInfo(scope.row.learningEvaluation, 'violationRate')) }}
                  </div>
                </template>
              </el-table-column>
              <el-table-column label="得分" width="60">
                <template #default="scope">
                  <div v-if="scope.row.learningEvaluation">
                    {{ getLearningEvaluationInfo(scope.row.learningEvaluation, 'score') }}
                  </div>
                </template>
              </el-table-column>
            </el-table-column>

            <el-table-column label="审核状态" width="80" fixed="right">
              <template #default="scope">
                <el-tag :type="getReviewStatusType(scope.row.reviewStatus)">
                  {{ scope.row.reviewStatusName }}
                </el-tag>
              </template>
            </el-table-column>

            <el-table-column label="操作" width="160" fixed="right">
              <template #default="scope">
                <el-button size="small" @click="viewOriginalRecords(scope.row)">查看原始记录</el-button>
                <el-button
                    v-if="scope.row.reviewStatus === 'pending'"
                    size="small"
                    type="primary"
                    @click="reviewApproval(scope.row)"
                >
                  审核
                </el-button>
              </template>
            </el-table-column>
          </el-table>
        </div>
      </div>
    </div>

    <!-- 原始记录详情对话框 -->
    <el-dialog
        v-model="originalRecordsVisible"
        width="1200px"
        :close-on-click-modal="false"
        :append-to-body="true"
        :lock-scroll="true"
        top="10vh"
    >
      <div v-if="originalRecordsData" class="original-records">
        <div class="summary-info">
          <h4>汇总信息</h4>
          <el-descriptions :column="2" border>
            <el-descriptions-item label="教室">{{ originalRecordsData.approvalResult.classroomName }}</el-descriptions-item>
            <el-descriptions-item label="总评分">{{ originalRecordsData.approvalResult.totalScore }}分</el-descriptions-item>
          </el-descriptions>
        </div>

        <div class="records-list">
          <h4>原始记录列表</h4>
          <div class="table-container">
            <el-table
                :data="originalRecordsData.originalRecords"
                border
                height="300"
                style="width: 100%"
            >
              <el-table-column prop="supervisorName" label="督导员" width="120" fixed="left" />
              <el-table-column prop="supervisorRole" label="角色" width="120" />
              <el-table-column label="督教情况（60分）" min-width="200">
                <template #default="scope">
                  <div v-if="scope.row.teachingEvaluation">
                    <div v-for="(value, key) in parseJsonSafely(scope.row.teachingEvaluation)" :key="key">
                      {{ key }}: {{ value }}分
                    </div>
                  </div>
                </template>
              </el-table-column>
              <el-table-column label="督学情况（20分）" min-width="150">
                <template #default="scope">
                  <div v-if="scope.row.learningEvaluation">
                    <div v-for="(value, key) in parseJsonSafely(scope.row.learningEvaluation)" :key="key">
                      {{ key }}: {{ value }}
                    </div>
                  </div>
                </template>
              </el-table-column>
              <el-table-column label="考勤情况（20分）" width="120">
                <template #default="scope">
                  <div v-if="scope.row.attendanceEvaluation">
                    <div v-for="(value, key) in parseJsonSafely(scope.row.attendanceEvaluation)" :key="key">
                      {{ key }}: {{ value }}
                    </div>
                  </div>
                </template>
              </el-table-column>
              <el-table-column prop="notes" label="备注" width="150" />
              <el-table-column label="照片" width="100">
                <template #default="scope">
                  <div v-if="scope.row.photos && scope.row.photos.length > 0">
                    <el-button
                        size="small"
                        type="primary"
                        @click="viewPhotos(scope.row.photos)"
                    >
                      查看照片 ({{ scope.row.photos.length }})
                    </el-button>
                  </div>
                  <span v-else style="color: #999;">无照片</span>
                </template>
              </el-table-column>
              <el-table-column prop="createdTime" label="创建时间" width="160" />
            </el-table>
          </div>
        </div>
      </div>
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

    <!-- 审核对话框 -->
    <el-dialog
        v-model="reviewDialogVisible"
        width="1000px"
        :close-on-click-modal="false"
        :append-to-body="true"
        :lock-scroll="true"
        top="10vh"
    >
      <div v-if="currentApprovalResult" class="review-form">
        <div class="approval-summary">
          <h4>审核汇总</h4>
          <el-descriptions :column="2" border>
            <el-descriptions-item label="教室">{{ currentApprovalResult.classroomName }}</el-descriptions-item>
            <el-descriptions-item label="总评分">{{ currentApprovalResult.totalScore }}分</el-descriptions-item>
          </el-descriptions>
        </div>

        <div class="score-adjustment">
          <h4>评分调整</h4>
          <el-form :model="reviewForm" label-width="120px">
            <el-form-item label="教学态度">
              <el-input-number
                  v-model="reviewForm.adjustedScores.teachingEvaluation.teachingAttitude"
                  :min="0"
                  :max="20"
                  placeholder="原值"
                  controls-position="right"
              />
            </el-form-item>
            <el-form-item label="教学方法">
              <el-input-number
                  v-model="reviewForm.adjustedScores.teachingEvaluation.teachingMethod"
                  :min="0"
                  :max="20"
                  placeholder="原值"
                  controls-position="right"
              />
            </el-form-item>
            <el-form-item label="座位安排">
              <el-input-number
                  v-model="reviewForm.adjustedScores.teachingEvaluation.seatingArrangement"
                  :min="0"
                  :max="20"
                  placeholder="原值"
                  controls-position="right"
              />
            </el-form-item>
            <el-form-item label="综合效果">
              <el-input-number
                  v-model="reviewForm.adjustedScores.teachingEvaluation.comprehensiveEffect"
                  :min="0"
                  :max="20"
                  placeholder="原值"
                  controls-position="right"
              />
            </el-form-item>
            <el-form-item label="违规次数">
              <el-input-number
                  v-model="reviewForm.adjustedScores.learningEvaluation.violationCount"
                  :min="0"
                  placeholder="原值"
                  controls-position="right"
              />
            </el-form-item>
            <el-form-item label="审核备注">
              <el-input
                  v-model="reviewForm.approvalNote"
                  type="textarea"
                  :rows="3"
                  placeholder="请输入审核备注"
              />
            </el-form-item>
          </el-form>
        </div>

        <div class="review-actions">
          <el-button @click="reviewDialogVisible = false">取消</el-button>
          <el-button type="danger" @click="handleReview('reject')">拒绝</el-button>
          <el-button type="warning" @click="handleReview('adjust')">调整</el-button>
          <el-button type="primary" @click="handleReview('approve')">通过</el-button>
        </div>
      </div>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import { showSuccessMessage, showErrorMessage, handleApiError } from '@/utils/error-handler'
import { Document } from '@element-plus/icons-vue'
import { approvalAPI } from '../../../api'
import { logger } from '@/utils/logger'

const route = useRoute()

// 获取URL参数中的scheduleId
const getScheduleIdFromUrl = () => {
  return route.query.scheduleId as string
}

// 数据状态
const loading = ref(false)
const approvalResults = ref<any[]>([])
const scheduleInfo = ref<any>(null)

// 表格类型切换
const currentTableType = ref('summary')

// 处理表格类型切换
const handleTableTypeChange = (type: string) => {
  currentTableType.value = type
}

// 对话框状态
const originalRecordsVisible = ref(false)
const reviewDialogVisible = ref(false)
const photosDialogVisible = ref(false)
const originalRecordsData = ref<any>(null)
const currentApprovalResult = ref<any>(null)
const currentPhotos = ref<string[]>([])
const currentPhotoIndex = ref(0)
const photoUrls = ref<Map<string, string>>(new Map())

// 审核表单
const reviewForm = reactive({
  approvalResultId: '',
  action: 'approve' as 'approve' | 'reject' | 'adjust',
  approvalNote: '',
  adjustedScores: {
    teachingEvaluation: {
      teachingAttitude: 0,
      teachingMethod: 0,
      seatingArrangement: 0,
      comprehensiveEffect: 0
    },
    learningEvaluation: {
      violationCount: 0
    }
  }
})

// 获取审核状态类型
const getReviewStatusType = (status: string) => {
  switch (status) {
    case 'pending':
      return 'info'
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

// 解析班级信息
const getClassInfo = (classInfo: string, key: string) => {
  try {
    const info = JSON.parse(classInfo)
    return info[key] || ''
  } catch {
    return ''
  }
}

// 解析到课信息
const getAttendanceInfo = (attendanceInfo: string, key: string) => {
  try {
    const info = JSON.parse(attendanceInfo)
    return info[key] || 0
  } catch {
    return 0
  }
}

// 获取教学评价总分
const getTeachingScore = (teachingEvaluation: string) => {
  try {
    const evaluation = JSON.parse(teachingEvaluation)
    return Object.values(evaluation).reduce((sum: number, score: any) => sum + (score || 0), 0)
  } catch {
    return 0
  }
}

// 获取学习评价总分
const getLearningScore = (learningEvaluation: string) => {
  try {
    const evaluation = JSON.parse(learningEvaluation)
    return evaluation.score || 0
  } catch {
    return 0
  }
}

// 获取教学评价标签
const getTeachingEvaluationLabel = (key: string) => {
  const labels: Record<string, string> = {
    teachingAttitude: '教学态度',
    teachingMethod: '教学方法',
    seatingArrangement: '座位安排',
    comprehensiveEffect: '综合效果'
  }
  return labels[key] || key
}

// 获取学习评价标签
const getLearningEvaluationLabel = (key: string) => {
  const labels: Record<string, string> = {
    score: '学习评价',
    violationRate: '违规率',
    violationCount: '违规次数'
  }
  return labels[key] || key
}

// 获取到课情况标签
const getAttendanceLabel = (key: string) => {
  const labels: Record<string, string> = {
    score: '到课评分',
    leaveCount: '请假人数',
    absentCount: '缺勤人数',
    actualCount: '实到人数',
    attendanceRate: '到课率'
  }
  return labels[key] || key
}

// 安全解析JSON数据
const parseJsonSafely = (jsonString: string) => {
  try {
    return JSON.parse(jsonString)
  } catch (error) {
    console.error('JSON解析失败:', error)
    return {}
  }
}

// 格式化百分比
const formatPercentage = (value: number) => {
  if (value === null || value === undefined) return '0%'
  return value.toFixed(2) + '%'
}

// 获取教学评价信息
const getTeachingEvaluationInfo = (teachingEvaluation: string, key: string) => {
  try {
    const evaluation = JSON.parse(teachingEvaluation)
    return evaluation[key] || 0
  } catch {
    return 0
  }
}

// 获取学习评价信息
const getLearningEvaluationInfo = (learningEvaluation: string, key: string) => {
  try {
    const evaluation = JSON.parse(learningEvaluation)
    return evaluation[key] || 0
  } catch {
    return 0
  }
}

// 加载审核结果列表
const loadApprovalResults = async () => {
  const scheduleId = getScheduleIdFromUrl()
  if (!scheduleId) {
    ElMessage.error('缺少督导安排ID')
    return
  }

  loading.value = true
  try {
    const response: any = await approvalAPI.getApprovalResultsBySchedule(scheduleId)
    if (response && response.code === 200) {
      approvalResults.value = response.data
    }
  } catch (error: any) {
    handleApiError(error, '加载审核结果失败')
  } finally {
    loading.value = false
  }
}

// 查看原始记录
const viewOriginalRecords = async (row: any) => {
  try {
    const response: any = await approvalAPI.getOriginalRecords(row.id)
    if (response && response.data) {
      originalRecordsData.value = response.data
      originalRecordsVisible.value = true
    }
  } catch (error: any) {
    handleApiError(error, '获取原始记录失败')
  }
}

// 查看照片和视频
const viewPhotos = async (photos: string[]) => {
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
        console.error('预加载媒体文件失败:', error)
        photoUrls.value.set(photo, 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjZjVmNWY1Ii8+PHRleHQgeD0iNTAlIiB5PSI1MCUiIGZvbnQtZmFtaWx5PSJBcmlhbCwgc2Fucy1zZXJpZiIgZm9udC1zaXplPSIxNCIgZmlsbD0iIzk5OSIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZHk9Ii4zZW0iPuekuuS+i+WbvueJhzwvdGV4dD48L3N2Zz4=')
      }
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
    ElMessage.error('预览媒体文件失败')
  }
}

// 处理图片加载错误
const handleImageError = (event: Event) => {
  const img = event.target as HTMLImageElement
  // 使用base64编码的占位图片，避免404错误
  img.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjZjVmNWY1Ii8+PHRleHQgeD0iNTAlIiB5PSI1MCUiIGZvbnQtZmFtaWx5PSJBcmlhbCwgc2Fucy1zZXJpZiIgZm9udC1zaXplPSIxNCIgZmlsbD0iIzk5OSIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZHk9Ii4zZW0iPuekuuS+i+WbvueJhzwvdGV4dD48L3N2Zz4='
}

// 审核督导记录
const reviewApproval = (row: any) => {
  currentApprovalResult.value = row
  reviewForm.approvalResultId = row.id
  reviewForm.approvalNote = ''

  // 初始化调整分数
  if (row.teachingEvaluation) {
    try {
      const teachingEval = JSON.parse(row.teachingEvaluation)
      reviewForm.adjustedScores.teachingEvaluation = {
        teachingAttitude: teachingEval.teachingAttitude || 0,
        teachingMethod: teachingEval.teachingMethod || 0,
        seatingArrangement: teachingEval.seatingArrangement || 0,
        comprehensiveEffect: teachingEval.comprehensiveEffect || 0
      }
    } catch {
      // 解析失败时使用默认值
    }
  }

  if (row.learningEvaluation) {
    try {
      const learningEval = JSON.parse(row.learningEvaluation)
      reviewForm.adjustedScores.learningEvaluation.violationCount = learningEval.violationCount || 0
    } catch {
      // 解析失败时使用默认值
    }
  }

  reviewDialogVisible.value = true
}

// 处理审核
const handleReview = async (action: 'approve' | 'reject' | 'adjust') => {
  try {
    const requestData: any = {
      action: action,
      approvalNote: reviewForm.approvalNote
    }

    // 只有在调整的情况下才传递调整的分数数据
    if (action === 'adjust') {
      requestData.adjustedScores = reviewForm.adjustedScores
    }
    const response: any = await approvalAPI.reviewApproval(reviewForm.approvalResultId, requestData)
    logger.debug('审核响应:', response)
    if (response.code === 200) {
      showSuccessMessage(response, '审核成功')
      reviewDialogVisible.value = false
      loadApprovalResults() // 重新加载数据
    } else {
      showErrorMessage(response, '审核失败')
    }
  } catch (error: any) {
    handleApiError(error, '审核失败')
  }
}

// 组件挂载时加载数据
onMounted(() => {
  loadApprovalResults()
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
  padding: 24px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  flex: 1;
  display: flex;
  flex-direction: column;
  height: calc(100vh - 170px);
}

.table-type-switch {
  margin-bottom: 20px;
  text-align: center;
}

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
  padding-bottom: 16px;
  border-bottom: 1px solid #f0f0f0;
}

.page-header h2 {
  margin: 0;
  color: #333;
}

.schedule-info {
  display: flex;
  align-items: center;
}

.approval-list {
  flex: 1;
  overflow: auto;
}

.total-score {
  font-weight: bold;
  color: #409eff;
}

.original-records {
  padding: 20px 0;
}

.summary-info {
  margin-bottom: 20px;
}

.summary-info h4 {
  margin-bottom: 12px;
  color: #333;
}

.records-list h4 {
  margin-bottom: 12px;
  color: #333;
}

.review-form {
  padding: 20px 0;
}

.approval-summary {
  margin-bottom: 20px;
}

.approval-summary h4 {
  margin-bottom: 12px;
  color: #333;
}

.score-adjustment h4 {
  margin-bottom: 12px;
  color: #333;
}

.review-actions {
  margin-top: 20px;
  text-align: right;
}

.review-actions .el-button {
  margin-left: 10px;
}

.table-container {
  max-height: 300px;
  overflow: auto;
}

.original-records {
  max-height: 450px;
  overflow-y: auto;
}

.summary-info {
  margin-bottom: 20px;
  padding-bottom: 16px;
  border-bottom: 1px solid #f0f0f0;
}

.records-list {
  flex: 1;
}

.records-list h4 {
  margin-bottom: 16px;
  color: #333;
  font-weight: 600;
}

.photos-viewer {
  padding: 20px 0;
}

.photo-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  height: 100%;
}

.photo-image {
  max-width: 100%;
  max-height: 350px;
  object-fit: contain;
  cursor: pointer;
  border-radius: 4px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  transition: transform 0.2s;
}

.photo-image:hover {
  transform: scale(1.02);
}

.photo-info {
  margin-top: 10px;
  text-align: center;
  color: #666;
  font-size: 14px;
}

.unknown-file {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  width: 200px;
  height: 200px;
  background-color: #f5f5f5;
  border: 2px dashed #ddd;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s;
}

.unknown-file:hover {
  background-color: #e8f4fd;
  border-color: #409eff;
}

.unknown-file .el-icon {
  font-size: 48px;
  color: #999;
  margin-bottom: 10px;
}

.unknown-file span {
  color: #666;
  font-size: 14px;
}
</style>