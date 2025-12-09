<template>
  <div class="classroom-inspection-record">
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
                    {{ scope.row.period }}
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

          <!-- 巡查记录视图（选择督导安排后显示） -->
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
                    督导安排：{{ formatDate(selectedSchedule.supervisionDate) }} {{ selectedSchedule.period }}
                  </span>
                </el-form-item>
                <el-form-item label="教室">
                  <el-select v-model="searchForm.classroomId" placeholder="选择教室" @change="handleSearch" clearable>
                    <el-option label="全部" value="" />
                    <el-option 
                      v-for="classroom in classroomList" 
                      :key="classroom.id" 
                      :label="classroom.roomNumber" 
                      :value="classroom.id" 
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
                  <el-button type="primary" @click="handleSearch">搜索</el-button>
                  <el-button @click="resetSearch">重置</el-button>
                </el-form-item>
                <el-form-item style="margin-left: auto;">
                  <el-button type="primary" @click="showCreateDialog">
                    <el-icon><Plus /></el-icon>
                    新增巡查记录
                  </el-button>
                </el-form-item>
              </el-form>
            </div>
            
            <div class="record-table">
              <el-table 
                :data="recordList" 
                style="width: 100%" 
                height="100%"
                v-loading="loading"
                fit
                table-layout="fixed"
                border 
              >
                <el-table-column prop="classroomNumber" label="教室" width="100" fixed="left">
                  <template #default="scope">
                    {{ scope.row.classroomNumber }}
                  </template>
                </el-table-column>
                <el-table-column label="巡查日期" width="120" fixed="left">
                  <template #default="scope">
                    {{ getInspectionDateTime(scope.row) }}
                  </template>
                </el-table-column>
                
                <!-- 房屋安全 -->
                <el-table-column label="房屋安全" align="center">
                  <el-table-column label="前门" width="60" align="center">
                    <template #default="scope">
                      {{ getInspectionResult(scope.row, '前门关闭') }}
                    </template>
                  </el-table-column>
                  <el-table-column label="后门" width="60" align="center">
                    <template #default="scope">
                      {{ getInspectionResult(scope.row, '后门关闭') }}
                    </template>
                  </el-table-column>
                  <el-table-column label="窗户" width="60" align="center">
                    <template #default="scope">
                      {{ getInspectionResult(scope.row, '窗户关闭') }}
                    </template>
                  </el-table-column>
                  <el-table-column label="空调" width="60" align="center">
                    <template #default="scope">
                      {{ getInspectionResult(scope.row, '空调关闭') }}
                    </template>
                  </el-table-column>
                </el-table-column>
                
                <!-- 电源安全 -->
                <el-table-column label="电源安全" align="center">
                  <el-table-column label="功放设备" width="80" align="center">
                    <template #default="scope">
                      {{ getInspectionResult(scope.row, '功放设备关闭') }}
                    </template>
                  </el-table-column>
                  <el-table-column label="照明电闸" width="80" align="center">
                    <template #default="scope">
                      {{ getInspectionResult(scope.row, '照明电闸关闭') }}
                    </template>
                  </el-table-column>
                  <el-table-column label="动力电闸" width="80" align="center">
                    <template #default="scope">
                      {{ getInspectionResult(scope.row, '动力电闸关闭') }}
                    </template>
                  </el-table-column>
                </el-table-column>
                
                <!-- 内务整理 -->
                <el-table-column label="内务整理" align="center">
                  <el-table-column label="桌面整洁" width="80" align="center">
                    <template #default="scope">
                      {{ getInspectionResult(scope.row, '桌面整洁') }}
                    </template>
                  </el-table-column>
                  <el-table-column label="地面整洁" width="80" align="center">
                    <template #default="scope">
                      {{ getInspectionResult(scope.row, '地面整洁') }}
                    </template>
                  </el-table-column>
                  <el-table-column label="桌椅整齐" width="80" align="center">
                    <template #default="scope">
                      {{ getInspectionResult(scope.row, '桌椅整齐') }}
                    </template>
                  </el-table-column>
                  <el-table-column label="黑板干净" width="80" align="center">
                    <template #default="scope">
                      {{ getInspectionResult(scope.row, '黑板清洁') }}
                    </template>
                  </el-table-column>
                </el-table-column>
                
                <el-table-column prop="supervisorName" label="责任人" width="100" />
                <el-table-column prop="notes" label="备注" width="120" />
                <el-table-column label="操作" min-width="210" fixed="right">
                  <template #default="scope">
                    <el-button size="small" @click="viewRecord(scope.row)">查看</el-button>
                    <el-button 
                      v-if="scope.row.status === SUPERVISION_RECORD_STATUS.DRAFT"
                      size="small" 
                      type="primary" 
                      @click="editRecord(scope.row)"
                    >
                      编辑
                    </el-button>
                    <el-button 
                      v-if="scope.row.status === SUPERVISION_RECORD_STATUS.DRAFT"
                      size="small" 
                      type="success" 
                      @click="submitRecord(scope.row)"
                    >
                      提交
                    </el-button>
                    <el-button 
                      v-if="scope.row.status === SUPERVISION_RECORD_STATUS.DRAFT"
                      size="small" 
                      type="danger" 
                      @click="deleteRecord(scope.row)"
                    >
                      删除
                    </el-button>
                  </template>
                </el-table-column>
              </el-table>

              <!-- 分页 -->
              <div class="pagination-wrapper">
                <el-pagination
                  :current-page="pagination.current"
                  :page-size="pagination.size"
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
                <el-select v-model="searchForm.supervisionScheduleId" placeholder="选择督导安排" @change="handleSearchScheduleChange" clearable>
                  <el-option label="全部" value="" />
                  <el-option 
                    v-for="schedule in scheduleList" 
                    :key="schedule.id" 
                    :label="`${formatDate(schedule.supervisionDate)} ${schedule.period}`" 
                    :value="schedule.id" 
                  />
                </el-select>
              </el-form-item>
              <el-form-item label="教室">
                <el-select v-model="searchForm.classroomId" placeholder="选择教室" @change="handleSearch" clearable>
                  <el-option label="全部" value="" />
                  <el-option 
                    v-for="classroom in classroomList" 
                    :key="classroom.id" 
                    :label="classroom.roomNumber" 
                    :value="classroom.id" 
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
                <el-button type="primary" @click="handleSearch">搜索</el-button>
                <el-button @click="resetSearch">重置</el-button>
              </el-form-item>
              <el-form-item style="margin-left: auto;">
                <el-button type="primary" @click="showCreateDialog">
                  <el-icon><Plus /></el-icon>
                  新增巡查记录
                </el-button>
              </el-form-item>
            </el-form>
          </div>
          
          <div class="record-table">
            <el-table 
              :data="recordList" 
              style="width: 100%" 
              height="100%"
              v-loading="loading"
              fit
              table-layout="fixed"
              border 
            >
              <el-table-column prop="classroomNumber" label="教室" width="100" fixed="left">
                <template #default="scope">
                  {{ scope.row.classroomNumber }}
                </template>
              </el-table-column>
              <el-table-column label="巡查日期" width="120" fixed="left">
                <template #default="scope">
                  {{ getInspectionDateTime(scope.row) }}
                </template>
              </el-table-column>
              
              <!-- 房屋安全 -->
              <el-table-column label="房屋安全" align="center">
                <el-table-column label="前门" width="60" align="center">
                  <template #default="scope">
                    {{ getInspectionResult(scope.row, '前门关闭') }}
                  </template>
                </el-table-column>
                <el-table-column label="后门" width="60" align="center">
                  <template #default="scope">
                    {{ getInspectionResult(scope.row, '后门关闭') }}
                  </template>
                </el-table-column>
                <el-table-column label="窗户" width="60" align="center">
                  <template #default="scope">
                    {{ getInspectionResult(scope.row, '窗户关闭') }}
                  </template>
                </el-table-column>
                <el-table-column label="空调" width="60" align="center">
                  <template #default="scope">
                    {{ getInspectionResult(scope.row, '空调关闭') }}
                  </template>
                </el-table-column>
              </el-table-column>
              
              <!-- 电源安全 -->
              <el-table-column label="电源安全" align="center">
                <el-table-column label="功放设备" width="80" align="center">
                  <template #default="scope">
                    {{ getInspectionResult(scope.row, '功放设备关闭') }}
                  </template>
                </el-table-column>
                <el-table-column label="照明电闸" width="80" align="center">
                  <template #default="scope">
                    {{ getInspectionResult(scope.row, '照明电闸关闭') }}
                  </template>
                </el-table-column>
                <el-table-column label="动力电闸" width="80" align="center">
                  <template #default="scope">
                    {{ getInspectionResult(scope.row, '动力电闸关闭') }}
                  </template>
                </el-table-column>
              </el-table-column>
              
              <!-- 内务整理 -->
              <el-table-column label="内务整理" align="center">
                <el-table-column label="桌面整洁" width="80" align="center">
                  <template #default="scope">
                    {{ getInspectionResult(scope.row, '桌面整洁') }}
                  </template>
                </el-table-column>
                <el-table-column label="地面整洁" width="80" align="center">
                  <template #default="scope">
                    {{ getInspectionResult(scope.row, '地面整洁') }}
                  </template>
                </el-table-column>
                <el-table-column label="桌椅整齐" width="80" align="center">
                  <template #default="scope">
                    {{ getInspectionResult(scope.row, '桌椅整齐') }}
                  </template>
                </el-table-column>
                <el-table-column label="黑板干净" width="80" align="center">
                  <template #default="scope">
                    {{ getInspectionResult(scope.row, '黑板清洁') }}
                  </template>
                </el-table-column>
              </el-table-column>
              
              <el-table-column prop="supervisorName" label="责任人" width="100" />
              <el-table-column prop="notes" label="备注" width="120" />
              <el-table-column label="操作" min-width="210" fixed="right">
                <template #default="scope">
                  <el-button size="small" @click="viewRecord(scope.row)">查看</el-button>
                  <el-button 
                    v-if="scope.row.status === SUPERVISION_RECORD_STATUS.DRAFT"
                    size="small" 
                    type="primary" 
                    @click="editRecord(scope.row)"
                  >
                    编辑
                  </el-button>
                  <el-button 
                    v-if="scope.row.status === SUPERVISION_RECORD_STATUS.DRAFT"
                    size="small" 
                    type="success" 
                    @click="submitRecord(scope.row)"
                  >
                    提交
                  </el-button>
                  <el-button 
                    v-if="scope.row.status === SUPERVISION_RECORD_STATUS.DRAFT"
                    size="small" 
                    type="danger" 
                    @click="deleteRecord(scope.row)"
                  >
                    删除
                  </el-button>
                </template>
              </el-table-column>
            </el-table>

            <!-- 分页 -->
            <div class="pagination-wrapper">
              <el-pagination
                :current-page="pagination.current"
                :page-size="pagination.size"
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

    <!-- 新增/编辑巡查记录对话框 -->
    <el-dialog
      :title="isEdit ? '编辑巡查记录' : '新增巡查记录'"
      v-model="dialogVisible"
      width="1200px"
      :append-to-body="true"
      :lock-scroll="true"
      :close-on-click-modal="false"
    >
      <el-form :model="recordForm" :rules="rules" ref="recordFormRef" label-width="120px">
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="督导安排" prop="supervisionScheduleId">
              <el-select 
                v-model="recordForm.supervisionScheduleId" 
                placeholder="选择督导安排" 
                style="width: 100%"
                @change="handleScheduleChange"
              >
                <el-option 
                  v-for="schedule in scheduleList" 
                  :key="schedule.id" 
                  :label="`${schedule.supervisionDate} ${schedule.period}`" 
                  :value="schedule.id" 
                />
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="教室" prop="classroomId">
              <el-select 
                v-model="recordForm.classroomId" 
                placeholder="选择教室" 
                style="width: 100%"
                :disabled="!recordForm.supervisionScheduleId"
              >
                <el-option 
                  v-for="classroom in availableClassrooms" 
                  :key="classroom.id" 
                  :label="`${classroom.roomNumber} (${classroom.floor}楼${classroom.location})`" 
                  :value="classroom.id" 
                />
              </el-select>
            </el-form-item>
          </el-col>
        </el-row>
        
        <el-form-item label="备注">
          <el-input 
            v-model="recordForm.notes" 
            type="textarea" 
            :rows="3"
            placeholder="请输入备注信息"
            style="width: 100%"
          />
        </el-form-item>
        
        <!-- 巡查评分配置 -->
        <el-form-item label="巡查评分">
          <div class="inspection-scores-section">
            <div 
              v-for="category in groupedInspectionItems" 
              :key="category.name"
              class="inspection-category"
            >
              <div class="category-header">
                <h4>{{ category.name }}</h4>
              </div>
              
              <div class="category-items">
                <div 
                  v-for="item in category.items" 
                  :key="item.itemIndex"
                  class="inspection-item-simple"
                >
                  <div class="item-info">
                    <span class="item-name">{{ item.itemName }}</span>
                    <span class="item-type">{{ recordForm.inspectionScores[item.itemIndex]?.itemType === 'boolean' ? '布尔型' : '评分型' }}</span>
                  </div>
                  
                  <div class="item-score">
                    <!-- 布尔类型使用开关控件 -->
                    <template v-if="recordForm.inspectionScores[item.itemIndex]?.itemType === 'boolean'">
                      <el-switch 
                        v-model="recordForm.inspectionScores[item.itemIndex].actualScore" 
                        :active-value="1" 
                        :inactive-value="0"
                        @change="calculateItemScore(item.itemIndex)"
                      />
                      <span style="margin-left: 8px; color: #666;">
                        {{ (recordForm.inspectionScores[item.itemIndex]?.actualScore || 0) > 0 ? '合格' : '不合格' }}
                      </span>
                    </template>
                    <!-- 分数类型使用数字输入框 -->
                    <template v-else>
                      <el-input-number 
                        v-model="recordForm.inspectionScores[item.itemIndex].actualScore" 
                        :min="0" 
                        :max="recordForm.inspectionScores[item.itemIndex]?.maxScore"
                        :step="1"
                        :precision="0"
                        @change="calculateItemScore(item.itemIndex)"
                        style="width: 120px"
                        placeholder="输入分数"
                      />
                      <span class="score-divider">/</span>
                      <span class="max-score">{{ recordForm.inspectionScores[item.itemIndex]?.maxScore }}</span>
                      <span style="margin-left: 8px; color: #666; font-size: 12px;">
                        (0-{{ recordForm.inspectionScores[item.itemIndex]?.maxScore }}分)
                      </span>
                    </template>
                  </div>
                  
                  <div class="item-remark">
                    <el-input 
                      v-model="recordForm.inspectionScores[item.itemIndex].remark" 
                      placeholder="备注"
                      style="width: 200px"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </el-form-item>
      </el-form>
      
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="dialogVisible = false">取消</el-button>
          <el-button type="primary" @click="submitRecordForm">确定</el-button>
        </span>
      </template>
    </el-dialog>

    <!-- 巡查记录详情对话框 -->
    <el-dialog
      title="巡查记录详情"
      v-model="detailVisible"
      width="1000px"
      :append-to-body="true"
      :lock-scroll="true"
      :close-on-click-modal="false"
    >
      <div v-if="currentRecord" class="record-detail">
        <el-descriptions :column="2" border>
          <el-descriptions-item label="督导日期">
            {{ currentRecord.supervisionDate }}
          </el-descriptions-item>
          <el-descriptions-item label="节次">
            {{ currentRecord.period }}
          </el-descriptions-item>
          <el-descriptions-item label="教室">
            {{ currentRecord.classroomNumber }} ({{ currentRecord.floor }}楼{{ currentRecord.location }})
          </el-descriptions-item>
          <el-descriptions-item label="总评分">
            {{ currentRecord.totalScore }}分
          </el-descriptions-item>
          <el-descriptions-item label="状态">
            <el-tag :type="getStatusType(currentRecord.status)">
              {{ currentRecord.statusName }}
            </el-tag>
          </el-descriptions-item>
          <el-descriptions-item label="督导员">
            {{ currentRecord.supervisorName }}
          </el-descriptions-item>
          <el-descriptions-item label="提交时间">
            {{ formatDateTime(currentRecord.submittedAt) }}
          </el-descriptions-item>
          <el-descriptions-item label="创建时间">
            {{ formatDateTime(currentRecord.createdTime) }}
          </el-descriptions-item>
        </el-descriptions>

        <div v-if="currentRecord.notes" class="record-notes">
          <h4>备注信息：</h4>
          <p>{{ currentRecord.notes }}</p>
        </div>

        <div v-if="currentRecord.inspectionScores && currentRecord.inspectionScores.length > 0" class="inspection-scores-detail">
          <h4>巡查评分详情：</h4>
          <el-table :data="currentRecord.inspectionScores" border style="width: 100%">
            <el-table-column prop="itemName" label="项目名称" />
            <el-table-column prop="itemCategory" label="分类" width="120">
              <template #default="scope">
                {{ getCategoryName(scope.row.itemCategory) }}
              </template>
            </el-table-column>
            <el-table-column label="状态/得分" width="120">
              <template #default="scope">
                <span v-if="scope.row.itemType === 'boolean'">
                  {{ scope.row.actualScore > 0 ? '合格' : '不合格' }}
                </span>
                <span v-else>
                  {{ scope.row.actualScore }}/{{ scope.row.maxScore }}
                </span>
              </template>
            </el-table-column>
            <el-table-column prop="itemType" label="类型" width="100">
              <template #default="scope">
                {{ scope.row.itemType === 'boolean' ? '布尔型' : '评分型' }}
              </template>
            </el-table-column>
            <el-table-column prop="remark" label="备注" />
          </el-table>
        </div>
      </div>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted, computed, watch } from 'vue'
import { useRoute } from 'vue-router'
import { Plus, ArrowLeft } from '@element-plus/icons-vue'
import { ElMessageBox } from 'element-plus'
import { classroomInspectionRecordAPI, classroomInspectionScheduleAPI } from '../../../api/index'
import { showSuccessMessage, showErrorMessage, handleApiError } from '@/utils/error-handler'
import { debug, error as logError } from '@/utils/logger'
import { 
  SUPERVISION_RECORD_STATUS,
  SUPERVISION_RECORD_STATUS_MAP
} from '@/constants'
import { PAGINATION } from '@/constants/common'
import type { 
  ClassroomInspectionRecord, 
  ClassroomInspectionRecordParams,
  ClassroomInspectionRecordQueryParams,
  SupervisionSchedule,
  ClassroomInfo,
  InspectionItemForRecord,
  InspectionScoreItem
} from '../../../types/api'

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
  supervisionScheduleId: '',
  dateRange: [] as string[],
  classroomId: '',
  status: ''
})

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

// 巡查记录数据
const recordList = ref<ClassroomInspectionRecord[]>([])
const loading = ref(false)
const scheduleLoading = ref(false)

// 对话框状态
const dialogVisible = ref(false)
const detailVisible = ref(false)
const isEdit = ref(false)
const currentRecord = ref<ClassroomInspectionRecord | null>(null)
const recordFormRef = ref()

// 基础数据
const scheduleList = ref<SupervisionSchedule[]>([])
const classroomList = ref<ClassroomInfo[]>([])
const availableClassrooms = ref<ClassroomInfo[]>([])
const inspectionItems = ref<InspectionItemForRecord[]>([])

// 巡查记录表单
const recordForm = reactive<ClassroomInspectionRecordParams>({
  supervisionScheduleId: '',
  classroomId: '',
  inspectionScores: [],
  notes: ''
})

// 表单验证规则
const rules = {
  supervisionScheduleId: [{ required: true, message: '请选择督导安排', trigger: 'change' }],
  classroomId: [{ required: true, message: '请选择教室', trigger: 'change' }]
}

// 获取状态类型标签样式
const getStatusType = (status: string) => {
  return SUPERVISION_RECORD_STATUS_MAP[status]?.type || 'info'
}

// 获取分类名称
const getCategoryName = (category: string) => {
  // 如果已经是中文，直接返回
  if (category === '房屋安全' || category === '电源安全' || category === '内务整理') {
    return category
  }
  
  // 兼容英文键值的情况
  switch (category) {
    case 'building_safety':
      return '房屋安全'
    case 'power_safety':
      return '电源安全'
    case 'cleanliness':
      return '内务整理'
    default:
      return category || '未知'
  }
}

// 格式化日期时间
const formatDateTime = (datetime: string) => {
  if (!datetime) return ''
  return new Date(datetime).toLocaleString('zh-CN')
}

// 获取巡查日期时间（格式：X月X日 上午/下午）
const getInspectionDateTime = (record: ClassroomInspectionRecord) => {
  if (!record.supervisionDate) return ''
  
  try {
    const date = new Date(record.supervisionDate)
    const month = date.getMonth() + 1
    const day = date.getDate()
    
    // 根据节次判断上午/下午
    let timePeriod = ''
    if (record.period) {
      if (record.period.includes('第1节') || record.period.includes('第2节') || record.period.includes('1') || record.period.includes('2')) {
        timePeriod = '上午'
      } else if (record.period.includes('第3节') || record.period.includes('第4节') || record.period.includes('3') || record.period.includes('4')) {
        timePeriod = '下午'
      }
    }
    
    return `${month}.${day} ${timePeriod}`.trim()
  } catch (err) {
    logError('日期格式化错误:', err)
    return record.supervisionDate
  }
}

// 获取巡查结果（返回 √、× 或空）
const getInspectionResult = (record: ClassroomInspectionRecord, itemName: string) => {
  if (!record.inspectionScores || record.inspectionScores.length === 0) {
    return ''
  }
  
  // 定义项目名称映射，因为数据库中的名称可能和界面显示的不完全一样
  const nameMapping: { [key: string]: string[] } = {
    '前门关闭': ['前门', '前门关闭'],
    '后门关闭': ['后门', '后门关闭'],
    '窗户关闭': ['窗户', '窗户关闭'],
    '空调关闭': ['空调', '空调关闭'],
    '功放设备关闭': ['功放设备', '功放设备关闭'],
    '照明电闸关闭': ['照明电闸', '照明电闸关闭'],
    '动力电闸关闭': ['动力电闸', '动力电闸关闭'],
    '桌面整洁': ['桌面整洁'],
    '地面整洁': ['地面整洁'],
    '桌椅整齐': ['桌椅整齐'],
    '黑板清洁': ['黑板干净', '黑板清洁']
  }
  
  // 查找对应的评分项 - 现在使用扁平化结构
  for (const item of record.inspectionScores) {
    // 检查项目名称是否匹配
    const possibleNames = nameMapping[itemName] || [itemName]
    const isMatch = possibleNames.some(name => 
      item.itemName.includes(name) || 
      name.includes(item.itemName) ||
      item.itemName === name
    )
    
    if (isMatch) {
      // 根据实际得分判断状态
      if (item.itemType === 'boolean') {
        // 布尔型：1表示好（√），0表示差（×）
        return item.actualScore > 0 ? '√' : '×'
      } else {
        // 评分型：满分显示√，0分显示×，中间值显示√
        if (item.actualScore >= item.maxScore && item.maxScore > 0) {
          return '√' // 满分显示√
        } else if (item.actualScore === 0) {
          return '×' // 0分显示×
        } else if (item.actualScore > 0) {
          return '√' // 中间值显示√
        }
      }
    }
  }
  
  return ''
}

// 加载巡查记录列表
const loadRecordList = async () => {
  loading.value = true
  try {
    const params: ClassroomInspectionRecordQueryParams = {
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
      // 处理日期范围
      if (searchForm.dateRange && searchForm.dateRange.length === 2) {
        // 注意：教室巡查记录的API可能不支持日期范围参数，这里先预留
      }
    }
    
    if (searchForm.classroomId) {
      params.classroomId = searchForm.classroomId
    }
    if (searchForm.status) {
      params.status = searchForm.status
    }
    
    const response: any = await classroomInspectionRecordAPI.getInspectionRecordList(params)
    if (response && response.code === 200) {
      const data = response.data
      recordList.value = data.list || []
      pagination.total = data.total || 0
      pagination.current = data.current || 1
      pagination.size = data.size || 10
    } else {
      showErrorMessage(response, '加载巡查记录列表失败')
    }
  } catch (error: any) {
    handleApiError(error, '加载巡查记录列表失败')
  } finally {
    loading.value = false
  }
}

// 加载督导安排列表
const loadScheduleList = async () => {
  scheduleLoading.value = true
  try {
    const params: any = { 
      page: schedulePagination.current, 
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
    
    const response: any = await classroomInspectionScheduleAPI.getClassroomInspectionScheduleList(params)
    if (response.code === 200 && response.data) {
      scheduleList.value = response.data.records || []
      schedulePagination.total = response.data.total || 0
      schedulePagination.pages = response.data.pages || 0
    } else {
      handleApiError(new Error(response.message || '加载督导安排列表失败'), '加载督导安排列表失败')
    }
  } catch (error: any) {
    handleApiError(error, '加载督导安排列表失败')
  } finally {
    scheduleLoading.value = false
  }
}

// 加载教室列表（用于搜索筛选）
const loadClassroomList = async () => {
  try {
    // 根据视图模式决定使用哪个督导安排ID
    const scheduleId = viewMode.value === 'bySchedule' ? selectedScheduleId.value : searchForm.supervisionScheduleId
    
    if (!scheduleId) {
      classroomList.value = []
      return
    }
    
    const response: any = await classroomInspectionRecordAPI.getAvailableClassrooms(scheduleId)
    if (response.code === 200) {
      classroomList.value = response.data
    } else {
      handleApiError(new Error(response.message || '加载教室列表失败'), '加载教室列表失败')
      classroomList.value = []
    }
  } catch (error: any) {
    handleApiError(error, '加载教室列表失败')
    classroomList.value = []
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
    // 加载教室列表
    loadClassroomList()
    // 加载巡查记录
    loadRecordList()
  }
})

// 清除督导安排选择
const clearScheduleSelection = () => {
  selectedScheduleId.value = ''
  recordList.value = []
  pagination.total = 0
  classroomList.value = []
}

// 处理视图模式切换
const handleViewModeChange = () => {
  // 切换模式时重置搜索条件
  if (viewMode.value === 'bySchedule') {
    // 切换到按督导安排查看模式：清空巡查记录，等待选择督导安排
    searchForm.supervisionScheduleId = ''
    searchForm.dateRange = []
    searchForm.classroomId = ''
    selectedScheduleId.value = ''
    recordList.value = []
    pagination.total = 0
    pagination.current = 1
    // 重置督导安排分页
    schedulePagination.current = 1
    loadScheduleList()
  } else {
    // 切换到全部记录查看模式：加载督导安排列表（用于筛选）和巡查记录
    selectedScheduleId.value = ''
    pagination.current = 1
    // 加载督导安排列表（用于全部记录模式下的筛选下拉框）
    loadScheduleList()
    // 加载巡查记录
    loadRecordList()
  }
}

// 监听视图模式变化
watch(viewMode, () => {
  handleViewModeChange()
}, { immediate: false })

// 搜索督导安排变化处理
const handleSearchScheduleChange = async () => {
  // 清空教室选择
  searchForm.classroomId = ''
  // 加载教室列表
  await loadClassroomList()
  // 重新搜索
  handleSearch()
}

// 格式化日期
const formatDate = (date: string) => {
  if (!date) return ''
  return new Date(date).toLocaleDateString('zh-CN')
}

// 搜索处理
const handleSearch = () => {
  pagination.current = 1
  loadRecordList()
}

// 重置搜索
const resetSearch = () => {
  if (viewMode.value === 'bySchedule') {
    // 按督导安排查看模式：只重置教室和状态
    searchForm.classroomId = ''
    searchForm.status = ''
  } else {
    // 全部记录查看模式：重置所有条件
    searchForm.dateRange = []
    searchForm.supervisionScheduleId = ''
    searchForm.classroomId = ''
    searchForm.status = ''
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

// 显示创建对话框
const showCreateDialog = () => {
  isEdit.value = false
  Object.assign(recordForm, {
    supervisionScheduleId: '',
    classroomId: '',
    inspectionScores: [],
    notes: ''
  })
  dialogVisible.value = true
}

// 编辑巡查记录
const editRecord = async (row: ClassroomInspectionRecord) => {
  isEdit.value = true
  currentRecord.value = row
  
  // 先设置基本表单数据
  Object.assign(recordForm, {
    supervisionScheduleId: row.supervisionScheduleId,
    classroomId: row.classroomId,
    notes: row.notes || ''
  })
  
  try {
    // 重新加载巡查项目配置和可选择的教室
    await handleScheduleChange(row.supervisionScheduleId)
    
    // 如果有已保存的巡查评分数据，则合并到新的数据结构中
    if (row.inspectionScores && row.inspectionScores.length > 0) {
      // 将已保存的数据映射到新的配置结构中
      const savedScoresMap = new Map()
      row.inspectionScores.forEach(savedItem => {
        savedScoresMap.set(savedItem.itemId, savedItem)
      })
      
      // 更新recordForm中的评分数据
      recordForm.inspectionScores = recordForm.inspectionScores.map(item => {
        const savedData = savedScoresMap.get(item.itemId)
        if (savedData) {
          return {
            ...item,
            actualScore: savedData.actualScore,
            remark: savedData.remark || ''
          }
        }
        return item
      })
    }
  } catch (error: any) {
    handleApiError(error, '加载编辑数据失败')
  }
  
  dialogVisible.value = true
}

// 查看巡查记录详情
const viewRecord = (row: ClassroomInspectionRecord) => {
  currentRecord.value = row
  detailVisible.value = true
}

// 提交巡查记录
const submitRecord = async (row: ClassroomInspectionRecord) => {
  try {
    await ElMessageBox.confirm(
      `确定要提交巡查记录吗？\n提交后将无法修改！`,
      '确认提交',
      {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }
    )

    const response: any = await classroomInspectionRecordAPI.submitInspectionRecord(row.id)
    if (response && response.code === 200) {
      showSuccessMessage(response, '提交成功')
      loadRecordList()
    } else {
      showErrorMessage(response, '提交失败')
    }
  } catch (error: any) {
    if (error !== 'cancel') {
      handleApiError(error, '提交失败')
    }
  }
}

// 删除巡查记录
const deleteRecord = async (row: ClassroomInspectionRecord) => {
  try {
    await ElMessageBox.confirm(
      `确定要删除巡查记录吗？\n删除后不可恢复！`,
      '确认删除',
      {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }
    )

    const response: any = await classroomInspectionRecordAPI.deleteInspectionRecord(row.id)
    if (response && response.code === 200) {
      showSuccessMessage(response, '删除成功')
      loadRecordList()
    } else {
      showErrorMessage(response, '删除失败')
    }
  } catch (error: any) {
    if (error !== 'cancel') {
      handleApiError(error, '删除失败')
    }
  }
}

// 处理督导安排变化
const handleScheduleChange = async (scheduleId: string) => {
  if (!scheduleId) {
    availableClassrooms.value = []
    inspectionItems.value = []
    recordForm.classroomId = ''
    recordForm.inspectionScores = []
    return
  }

  try {
    // 获取可巡查的教室列表
    const classroomResponse: any = await classroomInspectionRecordAPI.getAvailableClassrooms(scheduleId)
    if (classroomResponse && classroomResponse.code === 200) {
      availableClassrooms.value = classroomResponse.data || []
    }

    // 获取巡查项目配置
    const itemResponse: any = await classroomInspectionRecordAPI.getInspectionItems(scheduleId)
    if (itemResponse && itemResponse.code === 200) {
      inspectionItems.value = itemResponse.data || []
      debug('获取到的巡查项目数据:', inspectionItems.value)
      
      // 初始化巡查评分数据 - 现在使用扁平化结构，直接映射每个项目
      recordForm.inspectionScores = inspectionItems.value
        .map((item: any) => {
          const itemType = item.type || 'score'
          // 布尔类型初始值设为0（不合格），分数类型也设为0
          const initialScore = 0
          
          return {
            itemId: item.id,
            itemName: item.itemName,
            itemCategory: item.itemCategory || '',
            parentCategoryId: item.parentCategoryId || '',
            level: item.level || 2,
            itemType: itemType,
            maxScore: item.maxScore || 0,
            actualScore: initialScore,
            remark: '',
            sortOrder: item.sortOrder || 0, // 保留排序字段
            categorySortOrder: item.categorySortOrder || 0 // 保留分类排序字段
          }
        })
        .sort((a: any, b: any) => {
          // 先按分类sortOrder排序，再按项目sortOrder排序
          const aCategoryOrder = a.categorySortOrder || 0
          const bCategoryOrder = b.categorySortOrder || 0
          
          if (aCategoryOrder !== bCategoryOrder) {
            return aCategoryOrder - bCategoryOrder
          }
          // 同一分类内按sortOrder排序
          return (a.sortOrder || 0) - (b.sortOrder || 0)
        })
      
      debug('初始化后的评分数据:', recordForm.inspectionScores)
    }
  } catch (error: any) {
    handleApiError(error, '加载数据失败')
  }
}

// 计算项目总分
const calculateItemScore = (itemIndex: number) => {
  // 在新的扁平化结构中，每个item直接包含actualScore，不需要计算totalScore
  // 这个方法现在主要用于触发响应式更新
  const item = recordForm.inspectionScores[itemIndex]
  if (!item) return
  // 由于现在结构扁平化，不需要额外的计算逻辑
}

// 按分类分组巡查项目 - 使用计算属性确保响应式更新
const groupedInspectionItems = computed(() => {
  const categoryMap = new Map()
  
  recordForm.inspectionScores.forEach((item, itemIndex) => {
    const categoryName = getCategoryName(item.itemCategory)
    
    if (!categoryMap.has(categoryName)) {
      categoryMap.set(categoryName, {
        name: categoryName,
        categorySortOrder: item.categorySortOrder || 0, // 存储分类排序信息
        items: []
      })
    }
    
    // 直接使用原始数据的引用，这样可以确保数据绑定正常工作
    categoryMap.get(categoryName).items.push({
      itemIndex,
      ...item
    })
  })
  
  // 按分类的categorySortOrder排序，并对每个分类内的项目按sortOrder排序
  return Array.from(categoryMap.values())
    .sort((a: any, b: any) => {
      // 先按分类sortOrder排序
      return (a.categorySortOrder || 0) - (b.categorySortOrder || 0)
    })
    .map(category => {
      // 对分类内的项目按sortOrder排序
      category.items.sort((a: any, b: any) => {
        const aOrder = a.sortOrder || 0
        const bOrder = b.sortOrder || 0
        return aOrder - bOrder
      })
      return category
    })
})

// 提交巡查记录表单
const submitRecordForm = async () => {
  try {
    await recordFormRef.value.validate()
    
    // 验证巡查评分数据
    if (!recordForm.inspectionScores || recordForm.inspectionScores.length === 0) {
      ElMessageBox.warning('请配置巡查评分项目', '提示')
      return
    }
    
    for (let i = 0; i < recordForm.inspectionScores.length; i++) {
      const item = recordForm.inspectionScores[i]
      
      // 处理布尔类型项目或maxScore为0的项目
      if (item.itemType === 'boolean' || item.maxScore === 0) {
        // 布尔类型：actualScore只能是0或1
        if (item.actualScore !== 0 && item.actualScore !== 1) {
          ElMessageBox.warning(`${item.itemName} 的评分值不正确，只能是0或1`, '验证失败')
          return
        }
      } else {
        // 分数类型：actualScore在0到maxScore之间
        if (item.actualScore < 0 || item.actualScore > item.maxScore) {
          ElMessageBox.warning(`${item.itemName} 的得分必须在0-${item.maxScore}之间`, '验证失败')
          return
        }
      }
    }
    
    if (isEdit.value && currentRecord.value) {
      // 编辑模式
      const response: any = await classroomInspectionRecordAPI.updateInspectionRecord(
        currentRecord.value.id, 
        recordForm
      )
      
      if (response && response.code === 200) {
        showSuccessMessage(response, '编辑成功')
        dialogVisible.value = false
        loadRecordList()
      } else {
        showErrorMessage(response, '编辑失败')
      }
    } else {
      // 新增模式
      const response: any = await classroomInspectionRecordAPI.createInspectionRecord(recordForm)
      
      if (response && response.code === 200) {
        showSuccessMessage(response, '新增成功')
        dialogVisible.value = false
        loadRecordList()
      } else {
        showErrorMessage(response, '新增失败')
      }
    }
  } catch (error: any) {
    handleApiError(error, '提交失败，请检查表单')
  }
}

// 路由
const route = useRoute()

// 组件挂载时加载数据
onMounted(async () => {
  // 加载督导安排列表
  await loadScheduleList()
  
  // 检查路由参数中是否有 scheduleId
  const scheduleIdFromQuery = route.query.scheduleId as string
  if (scheduleIdFromQuery && viewMode.value === 'bySchedule') {
    // 如果存在 scheduleId 参数，自动选中对应的计划
    selectedScheduleId.value = scheduleIdFromQuery
    // 确保计划在列表中
    const scheduleExists = scheduleList.value.some(s => s.id === scheduleIdFromQuery)
    if (!scheduleExists) {
      // 如果计划不在当前列表中，可能需要重新加载或提示
      ElMessageBox.warning('指定的巡查计划不在当前列表中', '提示')
    }
  } else {
    // 只有在全部记录查看模式下才自动加载巡查记录
    // 按督导安排查看模式下，需要先选择督导安排
    if (viewMode.value === 'allRecords') {
      loadRecordList()
    } else {
      // 按督导安排查看模式：初始状态清空巡查记录列表
      recordList.value = []
      pagination.total = 0
    }
  }
})
</script>

<style scoped>
.classroom-inspection-record {
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

.record-table {
  margin-top: 3px;
  flex: 1;
  display: flex;
  flex-direction: column;
  min-height: 0; /* 重要：允许flex子元素收缩 */
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
}

.pagination-wrapper :deep(.el-pagination) {
  margin-bottom: 0;
}

.score-display {
  font-weight: 600;
  color: #409eff;
}

.inspection-scores-section {
  border: 1px solid #e4e7ed;
  border-radius: 4px;
  padding: 16px;
  background: #fafafa;
  max-height: 400px;
  overflow-y: auto;
}

.inspection-item {
  margin-bottom: 20px;
  padding: 16px;
  background: white;
  border-radius: 4px;
  border: 1px solid #e4e7ed;
}

.inspection-item:last-child {
  margin-bottom: 0;
}

.item-header {
  display: flex;
  align-items: center;
  margin-bottom: 16px;
  padding-bottom: 8px;
  border-bottom: 1px solid #f0f0f0;
}

.item-header h4 {
  margin: 0;
  margin-right: 16px;
  color: #333;
}

.item-category {
  background: #f0f9ff;
  color: #1890ff;
  padding: 2px 8px;
  border-radius: 4px;
  font-size: 12px;
  margin-right: 16px;
}

.item-total-score {
  margin-left: auto;
  font-weight: 600;
  color: #52c41a;
}

.sub-items {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.sub-item-row {
  display: flex;
  align-items: center;
  padding: 12px;
  background: #fafafa;
  border-radius: 4px;
  border: 1px solid #f0f0f0;
}

.sub-item-info {
  flex: 1;
  display: flex;
  align-items: center;
  gap: 12px;
}

.sub-item-name {
  font-weight: 500;
  color: #333;
}

.sub-item-type {
  background: #fff7e6;
  color: #fa8c16;
  padding: 2px 6px;
  border-radius: 4px;
  font-size: 12px;
}

.sub-item-score {
  display: flex;
  align-items: center;
  gap: 8px;
  margin: 0 16px;
}

.score-divider {
  color: #999;
}

.max-score {
  color: #999;
  font-size: 14px;
}

.sub-item-remark {
  flex: 1;
}

.record-detail {
  padding: 20px 0;
}

.record-notes {
  margin-top: 20px;
  padding-top: 20px;
  border-top: 1px solid #f0f0f0;
}

.record-notes h4 {
  margin-bottom: 16px;
  color: #333;
}

.inspection-scores-detail {
  margin-top: 20px;
  padding-top: 20px;
  border-top: 1px solid #f0f0f0;
}

.inspection-scores-detail h4 {
  margin-bottom: 16px;
  color: #333;
}

.inspection-item-detail {
  margin-bottom: 20px;
  padding: 16px;
  background: #fafafa;
  border-radius: 4px;
  border: 1px solid #e4e7ed;
}

.inspection-item-detail:last-child {
  margin-bottom: 0;
}

.dialog-footer {
  text-align: right;
}

/* 督导安排表格 */
.schedule-table {
  margin-top: 3px;
  flex: 1;
  display: flex;
  flex-direction: column;
  min-height: 0; /* 重要：允许flex子元素收缩 */
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