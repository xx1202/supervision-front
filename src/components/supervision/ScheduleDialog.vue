<template>
  <el-dialog
    :title="isEdit ? '编辑督导安排' : '创建督导安排'"
    :model-value="visible"
    @update:model-value="$emit('update:visible', $event)"
    width="800px"
    :close-on-click-modal="false"
    :append-to-body="true"
    :lock-scroll="true"
    class="schedule-dialog"
  >
    <el-form
      ref="formRef"
      :model="formData"
      :rules="formRules"
      label-width="120px"
      class="schedule-form"
    >
      <!-- 督导时间选择 -->
      <el-form-item label="督导日期" prop="supervisionDate">
        <el-date-picker
          v-model="formData.supervisionDate"
          type="date"
          placeholder="选择督导日期"
          format="YYYY-MM-DD"
          value-format="YYYY-MM-DD"
          :disabled-date="disabledDate"
          @change="onDateChange"
          style="width: 100%"
        />
      </el-form-item>

<!--      <el-form-item label="星期" prop="weekDay">-->
<!--        <el-select v-model="formData.weekDay" placeholder="选择星期" style="width: 100%">-->
<!--          <el-option label="星期一" value="星期一" />-->
<!--          <el-option label="星期二" value="星期二" />-->
<!--          <el-option label="星期三" value="星期三" />-->
<!--          <el-option label="星期四" value="星期四" />-->
<!--          <el-option label="星期五" value="星期五" />-->
<!--        </el-select>-->
<!--      </el-form-item>-->

      <el-form-item label="节次" prop="period">
        <el-select v-model="formData.period" placeholder="选择节次" style="width: 100%">
          <el-option label="第1-2节" value="1-2"  />
          <el-option label="第3-4节" value="3-4" />
          <el-option label="第5-6节" value="5-6" />
          <el-option label="第7-8节" value="7-8" />
<!--          <el-option label="第7-8节" :value="5" />-->
<!--          <el-option label="第6节" :value="6" />-->
<!--          <el-option label="第7节" :value="7" />-->
<!--          <el-option label="第8节" :value="8" />-->
        </el-select>
      </el-form-item>

      <!-- 可用时间提示 -->
<!--      <el-alert-->
<!--        v-if="availableTimes.length > 0"-->
<!--        title="可用时间提示"-->
<!--        type="info"-->
<!--        :closable="false"-->
<!--        style="margin-bottom: 20px"-->
<!--      >-->
<!--        <template #default>-->
<!--          <div>-->
<!--            <p>以下时间可用：</p>-->
<!--            <ul>-->
<!--              <li v-for="time in availableTimes" :key="time.date">-->
<!--                {{ time.date }} ({{ time.weekDay }}) - 节次: {{ time.availablePeriods.join(', ') }}-->
<!--              </li>-->
<!--            </ul>-->
<!--          </div>-->
<!--        </template>-->
<!--      </el-alert>-->

      <!-- 时间冲突提示 -->
      <el-alert
        v-if="timeConflict"
        title="时间冲突"
        type="warning"
        :closable="false"
        style="margin-bottom: 20px"
      >
        <template #default>
          <p>{{ timeConflict }}</p>
        </template>
      </el-alert>

      <!-- 带队领导选择 -->
      <el-form-item label="带队领导" prop="leader">
        <el-select
          v-model="formData.leader"
          placeholder="选择带队领导"
          filterable
          style="width: 100%"
          @change="onLeaderChange"
        >
                     <el-option
             v-for="leader in leaderOptions"
             :key="leader.id"
             :label="`${leader.realName} (${leader.username})`"
             :value="leader.id"
           >
             <span>{{ leader.realName }}</span>
             <span style="float: right; color: #8492a6; font-size: 13px">
               {{ leader.username }} - {{ leader.department }}
             </span>
           </el-option>
        </el-select>
      </el-form-item>

      <!-- 督导成员选择 -->
      <el-form-item label="督导成员" prop="members">
        <el-select
          v-model="formData.members"
          multiple
          placeholder="选择督导成员"
          filterable
          style="width: 100%"
        >
          <el-option
             v-for="member in memberOptions"
             :key="member.id"
             :label="`${member.realName} (${member.username})`"
             :value="member.id"
           >
             <span>{{ member.realName }}</span>
             <span style="float: right; color: #8492a6; font-size: 13px">
               {{ member.username }} - {{ member.department }}
             </span>
           </el-option>
        </el-select>
        <div class="form-tip">可选择督导员和学生督导员</div>
      </el-form-item>

      <!-- 备注信息 -->
      <el-form-item label="备注" prop="notes">
        <el-input
          v-model="formData.notes"
          type="textarea"
          :rows="3"
          placeholder="请输入备注信息"
        />
      </el-form-item>
    </el-form>

    <template #footer>
      <div class="dialog-footer">
        <el-button @click="$emit('update:visible', false)">取消</el-button>
        <el-button type="primary" @click="handleSubmit" :loading="loading">
          {{ isEdit ? '更新' : '创建' }}
        </el-button>
      </div>
    </template>
  </el-dialog>
</template>

<script setup lang="ts">
import { ref, reactive, watch, computed } from 'vue'
import { ElMessageBox } from 'element-plus'
import { showSuccessMessage, showErrorMessage, handleApiError } from '@/utils/error-handler'
import { supervisionScheduleAPI, userAPI } from '../../api'

// 定义组件属性
interface Props {
  visible: boolean
  isEdit?: boolean
  scheduleData?: any
}

const props = withDefaults(defineProps<Props>(), {
  isEdit: false,
  scheduleData: () => ({})
})

// 定义事件
const emit = defineEmits<{
  'update:visible': [value: boolean]
  'success': []
}>()

// 表单引用
const formRef = ref()

// 加载状态
const loading = ref(false)

// 表单数据
const formData = reactive({
  supervisionDate: '',
  period: undefined as number | undefined,
  leader: '',
  members: [] as string[],
  notes: ''
})

// 表单验证规则
const formRules = {
  supervisionDate: [
    { required: true, message: '请选择督导日期', trigger: 'change' }
  ],
  period: [
    { required: true, message: '请选择节次', trigger: 'change' }
  ],
  leader: [
    { required: true, message: '请选择带队领导', trigger: 'change' }
  ],
  members: [
    { required: true, message: '请选择督导成员', trigger: 'change' },
    { type: 'array', min: 1, message: '至少选择一个督导成员', trigger: 'change' }
  ]
}

// 可用时间数据
const availableTimes = ref<any[]>([])
const timeConflict = ref('')

// 用户选项数据
const leaderOptions = ref<any[]>([])
const memberOptions = ref<any[]>([])

// 计算属性：获取当前周的日期范围
const getWeekRange = computed(() => {
  if (!formData.supervisionDate) return { startDate: '', endDate: '' }
  
  const date = new Date(formData.supervisionDate)
  const dayOfWeek = date.getDay()
  const startOfWeek = new Date(date)
  startOfWeek.setDate(date.getDate() - dayOfWeek + 1)
  
  const endOfWeek = new Date(startOfWeek)
  endOfWeek.setDate(startOfWeek.getDate() + 6)
  
  return {
    startDate: startOfWeek.toISOString().split('T')[0],
    endDate: endOfWeek.toISOString().split('T')[0]
  }
})

// 禁用日期（周末）
const disabledDate = (time: Date) => {
  return time.getDay() === 0 || time.getDay() === 6
}

// 日期变化处理
const onDateChange = async () => {
  if (formData.supervisionDate) {
    await loadAvailableTimes()
    await checkTimeConflict()
  }
}

// 带队领导变化处理
const onLeaderChange = () => {
  // 如果带队领导在督导成员中，需要移除
  const index = formData.members.indexOf(formData.leader)
  if (index > -1) {
    formData.members.splice(index, 1)
  }
}

// 加载可用时间
const loadAvailableTimes = async () => {
  try {
    const { startDate, endDate } = getWeekRange.value
    if (!startDate || !endDate) return
    
    const response: any = await supervisionScheduleAPI.getAvailableTimes({ startDate, endDate })
    if (response.code === 200) {
      availableTimes.value = response.data || []
    }
  } catch (error) {
    console.error('加载可用时间失败:', error)
  }
}

// 检查时间冲突
const checkTimeConflict = async () => {
  if (!formData.supervisionDate || !formData.period) {
    timeConflict.value = ''
    return
  }
  
  // 编辑模式下不检查时间冲突，因为自己的时间肯定被占用
  if (props.isEdit) {
    timeConflict.value = ''
    return
  }
  
  try {
    const response: any = await supervisionScheduleAPI.checkConflict({
      supervisionDate: formData.supervisionDate,
      period: formData.period
    })
    
    if (response.code === 200) {
      if (response.data.hasConflict) {
        timeConflict.value = response.data.conflictInfo || '该时间段已有督导安排'
      } else {
        timeConflict.value = ''
      }
    }
  } catch (error) {
    console.error('检查时间冲突失败:', error)
  }
}

// 加载带队领导选项
const loadLeaderOptions = async () => {
  try {
    const response: any = await userAPI.getUserList({
      page: 1,
      size: 100,
      status: 1  // 1表示启用状态
    })
    
    if (response && response.data) {
      leaderOptions.value = response.data.records || []
    }
  } catch (error) {
    console.error('加载带队领导选项失败:', error)
  }
}

// 加载督导成员选项
const loadMemberOptions = async () => {
  try {
    // 获取督导员
    const supervisorResponse = await userAPI.getUsersByRole('SUPERVISOR', {
      page: 1,
      size: 100
    })
    
    // 获取学生督导员
    const studentResponse = await userAPI.getUsersByRole('STUDENT_SUPERVISOR', {
      page: 1,
      size: 100
    })
    
    const supervisors = (supervisorResponse as any)?.data?.records || []
    const students = (studentResponse as any)?.data?.records || []
    
    memberOptions.value = [...supervisors, ...students]
  } catch (error) {
    console.error('加载督导成员选项失败:', error)
  }
}

// 提交表单
const handleSubmit = async () => {
  if (!formRef.value) return
  
  try {
    await formRef.value.validate()
    
    // 只有在创建模式下才检查时间冲突
    if (!props.isEdit && timeConflict.value) {
      ElMessageBox.warning('请解决时间冲突后再提交', '提示')
      return
    }
    
    loading.value = true
    
    if (props.isEdit) {
      // 更新督导安排
      const params = {
        ...formData,
        period: formData.period || 0
      }
      const response: any = await supervisionScheduleAPI.updateSchedule(props.scheduleData.id, params)
      if (response.code === 200) {
        showSuccessMessage(response, '督导安排更新成功')
      } else {
        showErrorMessage(response, '督导安排更新失败')
      }
    } else {
      // 创建督导安排
      const params = {
        ...formData,
        period: formData.period || 0
      }
      const response: any = await supervisionScheduleAPI.createSchedule(params)
      if (response && response.data) {
        showSuccessMessage(response, '督导安排创建成功')
      } else {
        showErrorMessage(response, '督导安排创建失败')
      }
    }
    
    emit('update:visible', false)
    emit('success')
  } catch (error: any) {
    handleApiError(error, '操作失败，请重试')
  } finally {
    loading.value = false
  }
}

// 重置表单
const resetForm = () => {
  if (formRef.value) {
    formRef.value.resetFields()
  }
  
  Object.assign(formData, {
    supervisionDate: '',
    period: undefined,
    leader: '',
    members: [],
    notes: ''
  })
  
  availableTimes.value = []
  timeConflict.value = ''
}

// 初始化数据
const initData = () => {
  if (props.isEdit && props.scheduleData) {
    Object.assign(formData, {
      supervisionDate: props.scheduleData.supervisionDate || '',
      weekDay: props.scheduleData.weekDay || '',
      period: props.scheduleData.period,
      leader: props.scheduleData.leader || '',
      members: props.scheduleData.members || [],
      notes: props.scheduleData.notes || ''
    })
  } else {
    resetForm()
  }
}

// 监听对话框显示状态
watch(() => props.visible, (newVal) => {
  if (newVal) {
    initData()
    loadLeaderOptions()
    loadMemberOptions()
    if (formData.supervisionDate) {
      loadAvailableTimes()
      checkTimeConflict()
    }
  }
})

// 监听编辑数据变化
watch(() => props.scheduleData, () => {
  if (props.visible) {
    initData()
  }
}, { deep: true })
</script>

<style scoped>
.schedule-form {
  padding: 20px 0;
}

.form-tip {
  font-size: 12px;
  color: #909399;
  margin-top: 4px;
}

.dialog-footer {
  text-align: right;
}

:deep(.el-select) {
  width: 100%;
}

:deep(.el-date-picker) {
  width: 100%;
}
</style>

<style>

.schedule-dialog .el-dialog {
  background-color: #fff;
  border-radius: 8px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.3);
}

.schedule-dialog .el-dialog__header {
  background-color: #f5f7fa;
  border-bottom: 1px solid #e4e7ed;
  border-radius: 8px 8px 0 0;
  padding: 20px;
}

.schedule-dialog .el-dialog__body {
  padding: 0;
}

.schedule-dialog .el-dialog__footer {
  background-color: #f5f7fa;
  border-top: 1px solid #e4e7ed;
  border-radius: 0 0 8px 8px;
  padding: 15px 20px;
}
</style> 