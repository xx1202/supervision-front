<template>
  <div class="supervision-record">
    <div class="page-content">
      <div class="record-container">
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

          <!-- 汇总记录视图（选择督导安排后显示） -->
          <div v-else style="flex: 1; display: flex; flex-direction: column; min-height: 0;">
            <!-- 搜索和过滤区域 -->
            <div class="search-section">
              <el-form :model="searchForm" inline style="display: flex; align-items: center; justify-content: space-between;">
                <div style="display: flex; align-items: center; gap: 20px;">
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
                  <el-form-item>
                    <el-button type="primary" @click="handleSearch">搜索</el-button>
                    <el-button @click="resetSearch">重置</el-button>
                  </el-form-item>
                </div>

                <!-- 表格类型切换 -->
                <div class="table-type-switch">
                  <el-select v-model="currentTableType" placeholder="选择表格类型" @change="handleTableTypeChange" style="width: 150px;">
                    <el-option label="汇总表" value="summary" />
                    <el-option label="教师评价记录表" value="teacher" />
                    <el-option label="学生记录表" value="student" />
                  </el-select>
                </div>
              </el-form>
            </div>

        <div class="record-table">
          <!-- 汇总表 -->
          <el-table
              v-if="currentTableType === 'summary'"
              :data="recordList"
              style="width: 100%"
              height="100%"
              v-loading="loading"
              fit
              table-layout="fixed"
              border
              @selection-change="handleSelectionChange"
          >
            <el-table-column v-if="showSelection" type="selection" width="55" />
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
            <el-table-column label="班级人数" width="100">
              <template #default="scope">
                <div v-if="scope.row.classInfo">
                  {{ getClassInfo(scope.row.classInfo, 'studentCountDetail') }}
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
              <el-table-column label="到课率(%)" width="70">
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
                    {{ getTeachingEvaluationInfo(scope.row.teachingEvaluation, 'teachingAttitude') }}
                  </div>
                </template>
              </el-table-column>
              <el-table-column label="教学方法" width="60">
                <template #default="scope">
                  <div v-if="scope.row.teachingEvaluation">
                    {{ getTeachingEvaluationInfo(scope.row.teachingEvaluation, 'teachingMethod') }}
                  </div>
                </template>
              </el-table-column>
              <el-table-column label="就坐情况" width="60">
                <template #default="scope">
                  <div v-if="scope.row.teachingEvaluation">
                    {{ getTeachingEvaluationInfo(scope.row.teachingEvaluation, 'seatingArrangement') }}
                  </div>
                </template>
              </el-table-column>
              <el-table-column label="综合效果" width="60">
                <template #default="scope">
                  <div v-if="scope.row.teachingEvaluation">
                    {{ getTeachingEvaluationInfo(scope.row.teachingEvaluation, 'comprehensiveEffect') }}
                  </div>
                </template>
              </el-table-column>
              <el-table-column label="得分" width="60">
                <template #default="scope">
                  <div v-if="scope.row.teachingEvaluation">
                    {{ getTeachingEvaluationInfo(scope.row.teachingEvaluation, '  score') }}
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
              <el-table-column label="违纪率(%)" width="70">
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

            <el-table-column label="审核状态" width="90" fixed="right" v-if="hasRole(['ADMIN_OFFICE_DIRECTOR'])">
              <template #default="scope">
                <el-tag :type="getReviewStatusType(scope.row.reviewStatus)">
                  {{ scope.row.reviewStatusName }}
                </el-tag>
              </template>
            </el-table-column>

            <el-table-column label="操作" min-width="120" fixed="right" v-if="hasRole(['ADMIN_OFFICE_DIRECTOR'])">
              <template #default="scope">
                <el-button
                    size="small"
                    type="warning"
                    @click="exportRecord(scope.row)"
                >
                  导出
                </el-button>
              </template>
            </el-table-column>
          </el-table>

          <!-- 教师评价记录表 -->
          <el-table
              v-if="currentTableType === 'teacher'"
              :data="recordList"
              style="width: 100%"
              height="100%"
              v-loading="loading"
              fit
              table-layout="fixed"
              border
              @selection-change="handleSelectionChange"
          >
            <el-table-column v-if="showSelection" type="selection" width="55" />
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
                  {{ getTeachingEvaluationInfo(scope.row.teachingEvaluation, 'teachingMethod') }}
                </div>
              </template>
            </el-table-column>
            <el-table-column label="就坐情况" width="80">
              <template #default="scope">
                <div v-if="scope.row.teachingEvaluation">
                  {{ getTeachingEvaluationInfo(scope.row.teachingEvaluation, 'seatingArrangement') }}
                </div>
              </template>
            </el-table-column>
            <el-table-column label="综合效果" width="80">
              <template #default="scope">
                <div v-if="scope.row.teachingEvaluation">
                  {{ getTeachingEvaluationInfo(scope.row.teachingEvaluation, 'comprehensiveEffect') }}
                </div>
              </template>
            </el-table-column>
            <el-table-column label="得分" min-width="80">
              <template #default="scope">
                <div v-if="scope.row.teachingEvaluation">
                  {{ getTeachingEvaluationInfo(scope.row.teachingEvaluation, 'score') }}
                </div>
              </template>
            </el-table-column>
            <el-table-column label="备注" width="200" v-if="hasRole(['ADMIN_OFFICE_DIRECTOR'])">
              <template #default="scope">
                {{ scope.row.notes }}
              </template>
            </el-table-column>
            <el-table-column label="审核状态" width="90" fixed="right" v-if="hasRole(['ADMIN_OFFICE_DIRECTOR'])">
              <template #default="scope">
                <el-tag :type="getReviewStatusType(scope.row.reviewStatus)">
                  {{ scope.row.reviewStatusName }}
                </el-tag>
              </template>
            </el-table-column>
            <el-table-column label="操作" min-width="120" fixed="right" v-if="hasRole(['ADMIN_OFFICE_DIRECTOR'])">
              <template #default="scope">
                <el-button
                    size="small"
                    type="warning"
                    @click="exportRecord(scope.row)"
                >
                  导出
                </el-button>
              </template>
            </el-table-column>
          </el-table>

          <!-- 学生记录表 -->
          <el-table
              v-if="currentTableType === 'student'"
              :data="recordList"
              style="width: 100%"
              height="100%"
              v-loading="loading"
              fit
              table-layout="fixed"
              border
              @selection-change="handleSelectionChange"
          >
            <el-table-column v-if="showSelection" type="selection" width="55" />
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
              <el-table-column label="到课率(%)" width="70">
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
              <el-table-column label="违纪率(%)" width="70">
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

            <el-table-column label="审核状态" width="90" fixed="right" v-if="hasRole(['ADMIN_OFFICE_DIRECTOR'])">
              <template #default="scope">
                <el-tag :type="getReviewStatusType(scope.row.reviewStatus)">
                  {{ scope.row.reviewStatusName }}
                </el-tag>
              </template>
            </el-table-column>

            <el-table-column label="操作" min-width="120" fixed="right" v-if="hasRole(['ADMIN_OFFICE_DIRECTOR'])">
              <template #default="scope">
                <el-button
                    size="small"
                    type="warning"
                    @click="exportRecord(scope.row)"
                >
                  导出
                </el-button>
              </template>
            </el-table-column>
          </el-table>
            </div>

            <!-- 分页 -->
            <div class="pagination-wrapper">
              <el-button
                  v-if="!showSelection"
                  type="warning"
                  @click="startBatchExport"
              >
                批量导出
              </el-button>
              <div v-else style="display: flex; gap: 10px; align-items: center;">
                <el-button
                    type="warning"
                    :disabled="selectedRecords.length === 0"
                    @click="batchExportRecords"
                >
                  确认导出 ({{ selectedRecords.length }})
                </el-button>
                <el-button
                    @click="cancelBatchExport"
                >
                  取消
                </el-button>
              </div>
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
        
        <!-- 全部记录查看模式 -->
        <div v-if="viewMode === 'allRecords'" style="flex: 1; display: flex; flex-direction: column; min-height: 0;">
          <!-- 搜索和过滤区域 -->
          <div class="search-section">
            <el-form :model="searchForm" inline style="display: flex; align-items: center; justify-content: space-between;">
              <div style="display: flex; align-items: center; gap: 20px;">
                <el-form-item>
                  <el-radio-group v-model="viewMode" @change="handleViewModeChange" size="default">
                    <el-radio-button value="bySchedule">按督导安排查看</el-radio-button>
                    <el-radio-button value="allRecords">全部记录查看</el-radio-button>
                  </el-radio-group>
                </el-form-item>
                <el-form-item label="时间范围">
                  <el-date-picker
                      v-model="searchForm.timeRange"
                      type="datetimerange"
                      range-separator="至"
                      start-placeholder="开始时间"
                      end-placeholder="结束时间"
                      format="YYYY-MM-DD HH:mm:ss"
                      value-format="YYYY-MM-DD HH:mm:ss"
                      @change="handleSearch"
                  />
                </el-form-item>
                <el-form-item label="督导安排" style="width: 180px">
                  <el-select
                      v-model="searchForm.supervisionScheduleId"
                      placeholder="选择安排"
                      clearable
                      @change="handleSearch"
                  >
                    <el-option
                        v-for="supervisionSchedule in supervisionScheduleList"
                        :key="supervisionSchedule.id"
                        :label=" supervisionSchedule.supervisionDate + ' ' + supervisionSchedule.weekDay + ' ' + supervisionSchedule.period + '节' "
                        :value="supervisionSchedule.id"
                    />
                  </el-select>
                </el-form-item>
                <el-form-item>
                  <el-button type="primary" @click="handleSearch">搜索</el-button>
                  <el-button @click="resetSearch">重置</el-button>
                </el-form-item>
              </div>

              <!-- 表格类型切换 -->
              <div class="table-type-switch">
                <el-select v-model="currentTableType" placeholder="选择表格类型" @change="handleTableTypeChange" style="width: 150px;">
                  <el-option label="汇总表" value="summary" />
                  <el-option label="教师评价记录表" value="teacher" />
                  <el-option label="学生记录表" value="student" />
                </el-select>
              </div>
            </el-form>
          </div>

          <div class="record-table">
            <!-- 汇总表 -->
            <el-table
                v-if="currentTableType === 'summary'"
                :data="recordList"
                style="width: 100%"
                height="100%"
                v-loading="loading"
                fit
                table-layout="fixed"
                border
                @selection-change="handleSelectionChange"
            >
              <el-table-column v-if="showSelection" type="selection" width="55" />
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
              <el-table-column label="班级人数" width="100">
                <template #default="scope">
                  <div v-if="scope.row.classInfo">
                    {{ getClassInfo(scope.row.classInfo, 'studentCountDetail') }}
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
                <el-table-column label="到课率(%)" width="70">
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
                      {{ getTeachingEvaluationInfo(scope.row.teachingEvaluation, 'teachingAttitude') }}
                    </div>
                  </template>
                </el-table-column>
                <el-table-column label="教学方法" width="60">
                  <template #default="scope">
                    <div v-if="scope.row.teachingEvaluation">
                      {{ getTeachingEvaluationInfo(scope.row.teachingEvaluation, 'teachingMethod') }}
                    </div>
                  </template>
                </el-table-column>
                <el-table-column label="就坐情况" width="60">
                  <template #default="scope">
                    <div v-if="scope.row.teachingEvaluation">
                      {{ getTeachingEvaluationInfo(scope.row.teachingEvaluation, 'seatingArrangement') }}
                    </div>
                  </template>
                </el-table-column>
                <el-table-column label="综合效果" width="60">
                  <template #default="scope">
                    <div v-if="scope.row.teachingEvaluation">
                      {{ getTeachingEvaluationInfo(scope.row.teachingEvaluation, 'comprehensiveEffect') }}
                    </div>
                  </template>
                </el-table-column>
                <el-table-column label="得分" width="60">
                  <template #default="scope">
                    <div v-if="scope.row.teachingEvaluation">
                      {{ getTeachingEvaluationInfo(scope.row.teachingEvaluation, 'score') }}
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
                <el-table-column label="违纪率(%)" width="70">
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

              <el-table-column label="审核状态" width="90" fixed="right" v-if="hasRole(['ADMIN_OFFICE_DIRECTOR'])">
                <template #default="scope">
                  <el-tag :type="getReviewStatusType(scope.row.reviewStatus)">
                    {{ scope.row.reviewStatusName }}
                  </el-tag>
                </template>
              </el-table-column>

              <el-table-column label="操作" min-width="120" fixed="right" v-if="hasRole(['ADMIN_OFFICE_DIRECTOR'])">
                <template #default="scope">
                  <el-button
                      size="small"
                      type="warning"
                      @click="exportRecord(scope.row)"
                  >
                    导出
                  </el-button>
                </template>
              </el-table-column>
            </el-table>

            <!-- 教师评价记录表 -->
            <el-table
                v-if="currentTableType === 'teacher'"
                :data="recordList"
                style="width: 100%"
                height="100%"
                v-loading="loading"
                fit
                table-layout="fixed"
                border
                @selection-change="handleSelectionChange"
            >
              <el-table-column v-if="showSelection" type="selection" width="55" />
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
                    {{ getTeachingEvaluationInfo(scope.row.teachingEvaluation, 'teachingAttitude') }}
                  </div>
                </template>
              </el-table-column>
              <el-table-column label="教学方法" width="80">
                <template #default="scope">
                  <div v-if="scope.row.teachingEvaluation">
                    {{ getTeachingEvaluationInfo(scope.row.teachingEvaluation, 'teachingMethod') }}
                  </div>
                </template>
              </el-table-column>
              <el-table-column label="就坐情况" width="80">
                <template #default="scope">
                  <div v-if="scope.row.teachingEvaluation">
                    {{ getTeachingEvaluationInfo(scope.row.teachingEvaluation, 'seatingArrangement') }}
                  </div>
                </template>
              </el-table-column>
              <el-table-column label="综合效果" width="80">
                <template #default="scope">
                  <div v-if="scope.row.teachingEvaluation">
                    {{ getTeachingEvaluationInfo(scope.row.teachingEvaluation, 'comprehensiveEffect') }}
                  </div>
                </template>
              </el-table-column>
              <el-table-column label="得分" min-width="80">
                <template #default="scope">
                  <div v-if="scope.row.teachingEvaluation">
                    {{ getTeachingEvaluationInfo(scope.row.teachingEvaluation, 'score') }}
                  </div>
                </template>
              </el-table-column>
              <el-table-column label="备注" width="200" v-if="hasRole(['ADMIN_OFFICE_DIRECTOR'])">
                <template #default="scope">
                  {{ scope.row.notes }}
                </template>
              </el-table-column>
              <el-table-column label="审核状态" width="90" fixed="right" v-if="hasRole(['ADMIN_OFFICE_DIRECTOR'])">
                <template #default="scope">
                  <el-tag :type="getReviewStatusType(scope.row.reviewStatus)">
                    {{ scope.row.reviewStatusName }}
                  </el-tag>
                </template>
              </el-table-column>
              <el-table-column label="操作" min-width="120" fixed="right" v-if="hasRole(['ADMIN_OFFICE_DIRECTOR'])">
                <template #default="scope">
                  <el-button
                      size="small"
                      type="warning"
                      @click="exportRecord(scope.row)"
                  >
                    导出
                  </el-button>
                </template>
              </el-table-column>
            </el-table>

            <!-- 学生记录表 -->
            <el-table
                v-if="currentTableType === 'student'"
                :data="recordList"
                style="width: 100%"
                height="100%"
                v-loading="loading"
                fit
                table-layout="fixed"
                border
                @selection-change="handleSelectionChange"
            >
              <el-table-column v-if="showSelection" type="selection" width="55" />
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
                <el-table-column label="到课率(%)" width="70">
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
                <el-table-column label="违纪率(%)" width="70">
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

              <el-table-column label="审核状态" width="90" fixed="right" v-if="hasRole(['ADMIN_OFFICE_DIRECTOR'])">
                <template #default="scope">
                  <el-tag :type="getReviewStatusType(scope.row.reviewStatus)">
                    {{ scope.row.reviewStatusName }}
                  </el-tag>
                </template>
              </el-table-column>

              <el-table-column label="操作" min-width="120" fixed="right" v-if="hasRole(['ADMIN_OFFICE_DIRECTOR'])">
                <template #default="scope">
                  <el-button
                      size="small"
                      type="warning"
                      @click="exportRecord(scope.row)"
                  >
                    导出
                  </el-button>
                </template>
              </el-table-column>
            </el-table>
          </div>

          <!-- 分页 -->
          <div class="pagination-wrapper">
            <el-button
                v-if="!showSelection"
                type="warning"
                @click="startBatchExport"
            >
              批量导出
            </el-button>
            <div v-else style="display: flex; gap: 10px; align-items: center;">
              <el-button
                  type="warning"
                  :disabled="selectedRecords.length === 0"
                  @click="batchExportRecords"
              >
                确认导出 ({{ selectedRecords.length }})
              </el-button>
              <el-button
                  @click="cancelBatchExport"
              >
                取消
              </el-button>
            </div>
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
</template>

<script setup lang="ts">
import { ref, reactive, onMounted, computed, watch } from 'vue'
import { ElMessageBox } from 'element-plus'
import { showSuccessMessage, showErrorMessage, handleApiError } from '@/utils/error-handler'
import { approvalAPI, supervisionScheduleAPI } from '../../../api'
import type { SupervisionApprovalResultVO } from '../../../types/api'
import { getUserInfo } from '../../../utils/permission'
import * as XLSX from 'xlsx'
import { ArrowLeft } from '@element-plus/icons-vue'
import { PAGINATION } from '@/constants/common'

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

// 督导安排列表
const scheduleList = ref<any[]>([])
const scheduleLoading = ref(false)

// 过滤后的督导安排列表（用于显示，后端已分页，这里只做前端过滤）
const filteredScheduleList = computed(() => {
  return scheduleList.value
})

// 任务数据列表（用于全部记录查看模式的下拉框）
const supervisionScheduleList = ref([])

// 督导安排分页信息
const schedulePagination = reactive({
  current: 1,
  size: 10,
  total: 0,
  pages: 0
})

// 搜索表单
const searchForm = reactive({
  timeRange: [] as string[],
  classroomName: '',
  supervisionScheduleId: '',
})

// 分页信息
const pagination = reactive({
  current: 1,
  size: 10,
  total: 0
})

// 督导记录数据
const recordList = ref<SupervisionApprovalResultVO[]>([])
const loading = ref(false)

// 表格类型切换
const currentTableType = ref('summary')

// 批量导出选中的记录
const selectedRecords = ref<SupervisionApprovalResultVO[]>([])
// 控制是否显示选择列
const showSelection = ref(false)

// 权限检查函数
const hasRole = (roles: string[]) => {
  const user = getUserInfo()
  if (!user) return false
  return user.roles.some(role => roles.includes(role))
}

// 处理表格类型切换
const handleTableTypeChange = (type: string) => {
  currentTableType.value = type
  // 切换表格类型时重置选择状态
  showSelection.value = false
  selectedRecords.value = []
}

// 处理表格选中变化
const handleSelectionChange = (selection: SupervisionApprovalResultVO[]) => {
  selectedRecords.value = selection
}

// 获取状态类型
const getStatusType = (status: string) => {
  switch (status) {
    case 'approved':
      return 'success'
    case 'pending':
      return 'warning'
    case 'rejected':
      return 'danger'
    default:
      return 'info'
  }
}

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

// 格式化日期时间
const formatDateTime = (datetime: string) => {
  if (!datetime) return ''
  return new Date(datetime).toLocaleString('zh-CN')
}

// 评分样式
const getScoreClass = (score: number) => {
  if (score >= 90) return 'score-excellent'
  if (score >= 80) return 'score-good'
  if (score >= 70) return 'score-average'
  return 'score-poor'
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

// 格式化百分比
const formatPercentage = (value: number) => {
  if (value === null || value === undefined) return '0%'
  return (value).toFixed(1) + '%'
}

// 格式化日期
const formatDate = (date: string) => {
  if (!date) return ''
  return new Date(date).toLocaleDateString('zh-CN')
}

// 加载督导记录列表
const loadRecordList = async () => {
  loading.value = true
  try {
    const params: any = {
      page: pagination.current,
      size: pagination.size
    }

    // 按督导安排查看模式：必须选择督导安排
    if (viewMode.value === 'bySchedule') {
      if (!selectedScheduleId.value) {
        recordList.value = []
        pagination.total = 0
        loading.value = false
        return
      }
      params.supervisionScheduleId = selectedScheduleId.value
    } else {
      // 全部记录查看模式：可选督导安排筛选
      if (searchForm.supervisionScheduleId) {
        params.supervisionScheduleId = searchForm.supervisionScheduleId
      }
      // 处理时间范围
      if (searchForm.timeRange && searchForm.timeRange.length === 2) {
        params.startTime = searchForm.timeRange[0]
        params.endTime = searchForm.timeRange[1]
      }
    }

    if (searchForm.classroomName) {
      params.classroomName = searchForm.classroomName
    }

    const response: any = await approvalAPI.getApprovedRecords(params)
    if (response && response.code === 200) {
      recordList.value = response.data.records || []
      pagination.total = response.data.total || 0
    }
  } catch (error: any) {
    handleApiError(error, '加载督导记录列表失败')
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
      
      // 在全部记录查看模式下，也更新 supervisionScheduleList 用于下拉框
      if (viewMode.value === 'allRecords') {
        supervisionScheduleList.value = response.data.records || []
      }
    }
  } catch (error: any) {
    console.error('加载督导安排列表失败:', error)
    handleApiError(error, '加载督导安排列表失败')
  } finally {
    scheduleLoading.value = false
  }
}

// 加载全部记录查看模式下的督导安排列表（用于下拉框）
const loadsupervisionScheduleList = async () => {
  try {
    // 获取本周日期范围
    const getThisWeekRange = () => {
      const today = new Date();
      const dayOfWeek = today.getDay(); // 0=周日, 1=周一, ..., 6=周六
      // 计算本周周一（假设周一开始）
      const monday = new Date(today);
      monday.setDate(today.getDate() - dayOfWeek + (dayOfWeek === 0 ? -6 : 1));
      // 计算本周周日
      const sunday = new Date(monday);
      sunday.setDate(monday.getDate() + 12);
      return {
        startDate: monday.toISOString().split('T')[0],
        endDate: sunday.toISOString().split('T')[0]
      };
    };

    const { startDate, endDate } = getThisWeekRange();

    const params: any = {
      current: 1,
      size: 100, // 获取更多数据用于下拉框
      startDate: startDate,
      endDate: endDate,
    }

    const response: any = await supervisionScheduleAPI.getScheduleList(params)
    if (response.code != 200) {
      showErrorMessage(response, "获取督导安排失败")
    }
    supervisionScheduleList.value = response.data.records || []
  } catch (error) {
    console.error('加载督导安排列表失败:', error)
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
    loadRecordList()
  }
})

// 清除督导安排选择
const clearScheduleSelection = () => {
  selectedScheduleId.value = ''
  recordList.value = []
  pagination.total = 0
}

// 处理视图模式切换
const handleViewModeChange = () => {
  // 切换模式时重置搜索条件
  if (viewMode.value === 'bySchedule') {
    // 切换到按督导安排查看模式：清空记录，等待选择督导安排
    searchForm.supervisionScheduleId = ''
    searchForm.timeRange = []
    selectedScheduleId.value = ''
    recordList.value = []
    pagination.total = 0
    pagination.current = 1
    // 重置督导安排分页
    schedulePagination.current = 1
    loadScheduleList()
  } else {
    // 切换到全部记录查看模式：加载督导安排列表（用于筛选）和记录
    selectedScheduleId.value = ''
    pagination.current = 1
    // 加载督导安排列表（用于全部记录模式下的筛选下拉框）
    loadsupervisionScheduleList()
    // 加载记录
    loadRecordList()
  }
}

// 监听视图模式变化
watch(viewMode, () => {
  handleViewModeChange()
}, { immediate: false })

// 搜索处理
const handleSearch = () => {
  pagination.current = 1
  loadRecordList()
}

// 重置搜索
const resetSearch = () => {
  if (viewMode.value === 'bySchedule') {
    // 按督导安排查看模式：只重置状态（如果有的话）
    // 这里可以添加其他需要重置的字段
  } else {
    // 全部记录查看模式：重置所有条件
    searchForm.timeRange = []
    searchForm.classroomName = ''
    searchForm.supervisionScheduleId = ''
  }
  handleSearch()
}

// 分页处理
const handleSizeChange = (size: number) => {
  pagination.size = size
  pagination.current = 1
  loadRecordList()
}

const handleCurrentChange = (current: number) => {
  pagination.current = current
  loadRecordList()
}

// 前端导出功能 - 生成汇总表数据
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
    getClassInfo(row.classInfo, 'className'),
    getClassInfo(row.classInfo, 'courseName'),
    getClassInfo(row.classInfo, 'courseType') || '理论/实践',
    getClassInfo(row.classInfo, 'teacher'),
    getClassInfo(row.classInfo, 'counselor'),
    getClassInfo(row.classInfo, 'studentCountDetail'),
    getAttendanceInfo(row.attendanceInfo, 'leaveCount'),
    getAttendanceInfo(row.attendanceInfo, 'absentCount'),
    getAttendanceInfo(row.attendanceInfo, 'actualCount'),
    formatPercentage(getAttendanceInfo(row.attendanceInfo, 'attendanceRate')),
    getAttendanceInfo(row.attendanceInfo, 'score'),
    getTeachingEvaluationInfo(row.teachingEvaluation, 'teachingScore.teachingAttitude'),
    getTeachingEvaluationInfo(row.teachingEvaluation, 'teachingScore.teachingMethod'),
    getTeachingEvaluationInfo(row.teachingEvaluation, 'teachingScore.seatingArrangement'),
    getTeachingEvaluationInfo(row.teachingEvaluation, 'teachingScore.comprehensiveEffect'),
    getTeachingEvaluationInfo(row.teachingEvaluation, 'teachingScore.score'),
    getLearningEvaluationInfo(row.learningEvaluation, 'violationCount'),
    formatPercentage(getLearningEvaluationInfo(row.learningEvaluation, 'violationRate')),
    getLearningEvaluationInfo(row.learningEvaluation, 'score'),
    row.totalScore,
    row.notes || ''
  ])

  return [...headers, ...rows]
}

// 前端导出功能 - 生成教师评价记录表数据
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
    getClassInfo(row.classInfo, 'teacher'),
    getClassInfo(row.classInfo, 'className'),
    getClassInfo(row.classInfo, 'courseName'),
    row.classroomName,
    getTeachingEvaluationInfo(row.teachingEvaluation, 'teachingAttitude'),
    getTeachingEvaluationInfo(row.teachingEvaluation, ''),
    getTeachingEvaluationInfo(row.teachingEvaluation, 'seatingArrangement'),
    getTeachingEvaluationInfo(row.teachingEvaluation, 'comprehensiveEffect'),
    getTeachingEvaluationInfo(row.teachingEvaluation, 'score'),
    row.notes || ''
  ])

  return [...headers, ...rows]
}

// 前端导出功能 - 生成学生记录表数据
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
    getClassInfo(row.classInfo, 'teacher'),
    getClassInfo(row.classInfo, 'className'),
    row.classroomName,
    getClassInfo(row.classInfo, 'totalStudents'),
    getAttendanceInfo(row.attendanceInfo, 'leaveCount'),
    getAttendanceInfo(row.attendanceInfo, 'absentCount'),
    getAttendanceInfo(row.attendanceInfo, 'actualCount'),
    formatPercentage(getAttendanceInfo(row.attendanceInfo, 'attendanceRate')),
    getAttendanceInfo(row.attendanceInfo, 'score'),
    getLearningEvaluationInfo(row.learningEvaluation, 'phonePlayingCount') || 0,
    getLearningEvaluationInfo(row.learningEvaluation, 'sleepingCount') || 0,
    getLearningEvaluationInfo(row.learningEvaluation, 'noMaterialsCount') || 0,
    getLearningEvaluationInfo(row.learningEvaluation, 'violationCount'),
    formatPercentage(getLearningEvaluationInfo(row.learningEvaluation, 'violationRate')),
    getLearningEvaluationInfo(row.learningEvaluation, 'score')
  ])

  return [...headers, ...rows]
}

// 前端导出功能 - 根据表格类型生成数据
const generateTableData = (data: SupervisionApprovalResultVO[], tableType: string) => {
  switch (tableType) {
    case 'summary':
      return generateSummaryTableData(data)
    case 'teacher':
      return generateTeacherTableData(data)
    case 'student':
      return generateStudentTableData(data)
    default:
      return generateSummaryTableData(data)
  }
}

// 前端导出功能 - 下载Excel文件
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
    if (fileName.includes('汇总表')) {
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
    else if (fileName.includes('学生记录表')) {
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
    else if (fileName.includes('教师评价记录表')) {
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

// 导出记录
const exportRecord = (row: SupervisionApprovalResultVO) => {
  try {
    // 根据当前表格类型确定导出文件名称
    const fileNamePrefix =
      currentTableType.value === 'summary'
        ? '日常教学督导（汇总）'
        : currentTableType.value === 'teacher'
          ? '日常教学督导（原始）-教师评价'
          : '日常教学督导（原始）-学生评价'

    const data = generateTableData([row], currentTableType.value)
    const fileName = `${fileNamePrefix}_${new Date().getTime()}.xlsx`
    downloadExcel(data, fileName)
    const response: any = { code: 200, message: '导出成功' }
    showSuccessMessage(response, '导出成功')
  } catch (error: any) {
    handleApiError(error, '导出失败')
  }
}

// 批量导出
const batchExportRecords = async () => {
  if (selectedRecords.value.length === 0) {
    const response: any = { code: 400, message: '请选择要导出的记录' }
    showErrorMessage(response, '请选择要导出的记录')
    return
  }

  try {
    await ElMessageBox.confirm(
        `确定要导出选中的 ${selectedRecords.value.length} 条记录吗？`,
        '确认批量导出',
        {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        }
    )

    // 前端导出实现
    const fileNamePrefix =
      currentTableType.value === 'summary'
        ? '日常教学督导（汇总）'
        : currentTableType.value === 'teacher'
          ? '日常教学督导（原始）-教师评价'
          : '日常教学督导（原始）-学生评价'

    const data = generateTableData(selectedRecords.value, currentTableType.value)
    const fileName = `${fileNamePrefix}_批量_${new Date().getTime()}.xlsx`
    downloadExcel(data, fileName)
    
    const response: any = { code: 200, message: `批量导出 ${selectedRecords.value.length} 条记录成功` }
    showSuccessMessage(response, `批量导出 ${selectedRecords.value.length} 条记录成功`)
    selectedRecords.value = []
    showSelection.value = false

    /* 后端导出代码 - 已注释
    const ids = selectedRecords.value.map(item => item.id)

    // 调用API - 确保配置了 responseType: 'blob'
    const response = await approvalAPI.batchExportRecords({ ids })

    // 检查响应是否为Blob
    if (response instanceof Blob) {
      // 创建下载链接
      const url = window.URL.createObjectURL(response)
      const link = document.createElement('a')
      link.href = url

      // 尝试从响应头获取文件名，如果没有则使用默认文件名
      let fileName = `督导审核结果_${new Date().getTime()}.xlsx`

      // 创建文件下载
      link.download = fileName
      link.style.display = 'none'

      document.body.appendChild(link)
      link.click()

      // 清理资源
      setTimeout(() => {
        document.body.removeChild(link)
        window.URL.revokeObjectURL(url)
      }, 100)

      ElMessage.success(`批量导出 ${selectedRecords.value.length} 条记录成功`)
      selectedRecords.value = []
      showSelection.value = false
    } else {
      // 如果不是Blob，可能是错误信息
      try {
        const text = await response.text()
        const errorData = JSON.parse(text)
        showErrorMessage(errorData, '导出失败')
      } catch (e) {
        const errorResponse: any = { code: 500, message: '导出失败：服务器返回了无效的数据格式' }
        showErrorMessage(errorResponse, '导出失败')
      }
    }
    */

  } catch (error: any) {
    if (error !== 'cancel') {
      console.error('导出错误:', error)
      handleApiError(error, '批量导出失败')

      /* 后端错误处理代码 - 已注释
      // 处理错误响应
      if (error.response?.data instanceof Blob) {
        try {
          const errorText = await error.response.data.text()
          const errorData = JSON.parse(errorText)
          showErrorMessage(errorData, '批量导出失败')
        } catch (e) {
          const errorResponse: any = { code: 500, message: '导出失败，请稍后重试' }
          showErrorMessage(errorResponse, '导出失败')
        }
      } else {
        ElMessage.error(error.message || '批量导出失败')
      }
      */
    }
  }
}

// 开始批量导出
const startBatchExport = () => {
  showSelection.value = true
  selectedRecords.value = [] // 清空已选中的记录
}

// 取消批量导出
const cancelBatchExport = () => {
  showSelection.value = false
  selectedRecords.value = []
}


// 组件挂载时加载数据
onMounted(() => {
  // 加载督导安排列表
  loadScheduleList()
  
  // 只有在全部记录查看模式下才自动加载记录
  // 按督导安排查看模式下，需要先选择督导安排
  if (viewMode.value === 'allRecords') {
    loadRecordList()
    loadsupervisionScheduleList()
  } else {
    // 按督导安排查看模式：初始状态清空记录列表
    recordList.value = []
    pagination.total = 0
  }
})
</script>

<style scoped>
.supervision-record {
  padding: 3px 3px 3px 3px;
  display: flex;
  flex-direction: column;
}

.record-container {
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

.table-type-switch {
  margin-left: 20px;
  display: flex;
  align-items: center;
}

.record-table {
  margin-top: 3px;
  flex: 1;
  display: flex;
  flex-direction: column;
  min-height: 0;
}

.record-table :deep(.el-table__footer-wrapper) {
  margin-bottom: 0;
}

.record-table :deep(.el-table__fixed-footer-wrapper) {
  margin-bottom: 0;
}

.pagination-wrapper {
  margin-top: 8px;
  margin-bottom: 0;
  text-align: right;
  flex-shrink: 0;
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.pagination-wrapper :deep(.el-pagination) {
  margin-bottom: 0;
}

.total-score {
  font-weight: bold;
  color: #409eff;
}

.score-excellent {
  color: #67c23a;
  font-weight: bold;
}

.score-good {
  color: #409eff;
  font-weight: bold;
}

.score-average {
  color: #e6a23c;
  font-weight: bold;
}

.score-poor {
  color: #f56c6c;
  font-weight: bold;
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