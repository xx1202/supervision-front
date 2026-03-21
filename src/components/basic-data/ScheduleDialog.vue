<template>
  <el-dialog
    :title="getDialogTitle()"
    v-model="dialogVisible"
    width="600px"
    :append-to-body="true"
    :lock-scroll="true"
    :close-on-click-modal="false"
    @close="handleClose"
  >
    <el-form
      ref="scheduleFormRef"
      :model="scheduleForm"
      :rules="scheduleRules"
      label-width="100px"
    >
      <el-form-item label="学期" prop="semester">
        <el-input 
          v-model="scheduleForm.semester" 
          placeholder="请输入学期（如：2026-1）"
          :disabled="mode === 'view'"
        />
      </el-form-item>
      
      <el-form-item label="星期" prop="weekDay">
        <el-select 
          v-model="scheduleForm.weekDay" 
          placeholder="请选择星期"
          style="width: 100%"
          :disabled="mode === 'view'"
        >
          <el-option label="星期一" value="1" />
          <el-option label="星期二" value="2" />
          <el-option label="星期三" value="3" />
          <el-option label="星期四" value="4" />
          <el-option label="星期五" value="5" />
          <el-option label="星期六" value="6" />
          <el-option label="星期日" value="7" />
        </el-select>
      </el-form-item>
      
      <el-form-item label="节次" prop="period">
        <el-select
          v-model="scheduleForm.period"
          placeholder="请选择节次"
          style="width: 100%"
          :disabled="mode === 'view'"
        >
          <el-option label="1-2节" value="1-2" />
          <el-option label="3-4节" value="3-4" />
          <el-option label="5-6节" value="5-6" />
          <el-option label="7-8节" value="7-8" />
          <el-option label="9-10节" value="9-10" />
          <el-option label="1节" value="1" />
          <el-option label="2节" value="2" />
          <el-option label="3节" value="3" />
          <el-option label="4节" value="4" />
          <el-option label="5节" value="5" />
          <el-option label="6节" value="6" />
          <el-option label="7节" value="7" />
          <el-option label="8节" value="8" />
          <el-option label="9节" value="9" />
          <el-option label="10节" value="10" />
        </el-select>
      </el-form-item>
      
      <el-form-item label="教师" prop="teacher">
        <el-input 
          v-model="scheduleForm.teacher" 
          placeholder="请输入教师姓名"
          :disabled="mode === 'view'"
        />
      </el-form-item>
      
      <el-form-item label="课程名称" prop="courseId">
        <el-select
          v-model="scheduleForm.courseId"
          placeholder="请选择课程"
          style="width: 100%"
          filterable
          remote
          :remote-method="handleCourseSearch"
          :loading="courseLoading"
          :disabled="mode === 'view'"
          @change="handleCourseChange"
        >
          <el-option
            v-for="course in courses"
            :key="course.id"
            :label="course.courseName"
            :value="course.id"
          />
        </el-select>
      </el-form-item>
      
      <el-form-item label="班级" prop="classId">
        <el-select
          v-model="scheduleForm.classId"
          placeholder="请选择班级"
          style="width: 100%"
          filterable
          remote
          :remote-method="handleClassSearch"
          :loading="classLoading"
          :disabled="mode === 'view'"
        >
          <el-option
            v-for="cls in classes"
            :key="cls.id"
            :label="cls.className"
            :value="cls.id"
          />
        </el-select>
      </el-form-item>
      
      <el-form-item label="教室" prop="classroomId">
        <el-select
          v-model="scheduleForm.classroomId"
          placeholder="请选择教室"
          style="width: 100%"
          filterable
          remote
          :remote-method="handleClassroomSearch"
          :loading="classroomLoading"
          :disabled="mode === 'view'"
        >
          <el-option
            v-for="classroom in classrooms"
            :key="classroom.id"
            :label="`${classroom.roomNumber} (${classroom.type === 'theory' ? '理论' : '实训'})`"
            :value="classroom.id"
          />
        </el-select>
      </el-form-item>
    </el-form>
    
    <template #footer>
      <span class="dialog-footer">
        <el-button @click="handleClose">取消</el-button>
        <el-button 
          v-if="mode !== 'view'" 
          type="primary" 
          @click="handleSubmit"
          :loading="submitting"
        >
          确定
        </el-button>
      </span>
    </template>
  </el-dialog>
</template>

<script setup lang="ts">
import { ref, reactive, watch, computed, onMounted } from 'vue'
import type { FormInstance, FormRules } from 'element-plus'
import { scheduleAPI, classroomAPI, courseAPI, classAPI } from '@/api'
import type { ScheduleDetailVO, ScheduleRequest, Classroom, Course, CourseQueryParams, Class, ClassQueryParams, ClassroomQueryParams } from '@/types/api'
import { showSuccessMessage, showErrorMessage, handleApiError } from '@/utils/error-handler'

// 组件属性
interface Props {
  modelValue: boolean
  scheduleData?: ScheduleDetailVO
  mode: 'create' | 'edit' | 'view'
}

// 组件事件
interface Emits {
  (e: 'update:modelValue', value: boolean): void
  (e: 'success'): void
}

const props = withDefaults(defineProps<Props>(), {
  scheduleData: undefined,
  mode: 'create'
})

const emit = defineEmits<Emits>()

// 表单引用
const scheduleFormRef = ref<FormInstance>()
const submitting = ref(false)

// 对话框显示状态
const dialogVisible = computed({
  get: () => props.modelValue,
  set: (value) => emit('update:modelValue', value)
})

// 教室列表
const classrooms = ref<Classroom[]>([])
const classroomLoading = ref(false)

// 课程列表（用于搜索选择）
const courses = ref<Course[]>([])
const courseLoading = ref(false)

// 班级列表（用于搜索选择）
const classes = ref<Class[]>([])
const classLoading = ref(false)

// 表单数据
const scheduleForm = reactive<ScheduleRequest>({
  semester: '',
  weekDay: '',
  period: '1-2',
  classId: '',
  courseId: '',
  classroomId: '',
  teacher: '',
  courseType: undefined
})

// 表单验证规则
const scheduleRules: FormRules = {
  semester: [
    { required: true, message: '请输入学期', trigger: 'blur' },
    { pattern: /^\d{4}-\d$/, message: '学期格式应为：2026-1（年份-学期）', trigger: 'blur' }
  ],
  weekDay: [
    { required: true, message: '请选择星期', trigger: 'change' }
  ],
  period: [
    { required: true, message: '请选择节次', trigger: 'change' }
  ],
  teacher: [
    { required: true, message: '请输入教师姓名', trigger: 'blur' }
  ],
  courseId: [
    { required: true, message: '请选择课程', trigger: 'change' }
  ],
  classId: [
    { required: true, message: '请选择班级', trigger: 'change' }
  ],
  classroomId: [
    { required: true, message: '请选择教室', trigger: 'change' }
  ]
}

// 获取对话框标题
const getDialogTitle = () => {
  switch (props.mode) {
    case 'create':
      return '新增课表'
    case 'edit':
      return '编辑课表'
    case 'view':
      return '查看课表详情'
    default:
      return '课表信息'
  }
}

// 获取教室列表（支持按教室号搜索）
const fetchClassrooms = async (keyword = '') => {
  try {
    classroomLoading.value = true
    const params: ClassroomQueryParams = {
      page: 1,
      size: 50
    }
    if (keyword) {
      params.roomNumber = keyword
    }
    const response: any = await classroomAPI.getClassroomList(params)
    classrooms.value = response.data.records || []
  } catch (error: any) {
    console.error('获取教室列表失败:', error)
  } finally {
    classroomLoading.value = false
  }
}

// 获取课程列表（支持按名称搜索）
const fetchCourses = async (keyword = '') => {
  try {
    courseLoading.value = true
    const params: CourseQueryParams = {
      page: 1,
      size: 20,
      status: 1
    }
    if (keyword) {
      params.courseName = keyword
    }
    const response: any = await courseAPI.getCourseList(params)
    courses.value = response.data.records || []
  } catch (error: any) {
    console.error('获取课程列表失败:', error)
  } finally {
    courseLoading.value = false
  }
}

// 课程搜索方法（供 el-select remote 使用）
const handleCourseSearch = (query: string) => {
  fetchCourses(query.trim())
}

// 课程选择变化时，同步课程类型到表单（用于后端保存）
const handleCourseChange = (courseId: string) => {
  const course = courses.value.find(c => c.id === courseId)
  scheduleForm.courseType = course?.courseType
}

// 获取班级列表（支持按名称搜索）
const fetchClasses = async (keyword = '') => {
  try {
    classLoading.value = true
    const params: ClassQueryParams = {
      page: 1,
      size: 50
    }
    if (keyword) {
      params.className = keyword
    }
    const response: any = await classAPI.getClassList(params)
    classes.value = response.data.records || []
  } catch (error: any) {
    console.error('获取班级列表失败:', error)
  } finally {
    classLoading.value = false
  }
}

// 班级搜索方法
const handleClassSearch = (query: string) => {
  fetchClasses(query.trim())
}

// 教室搜索方法
const handleClassroomSearch = (query: string) => {
  fetchClassrooms(query.trim())
}

// 重置表单
const resetForm = () => {
  scheduleForm.semester = ''
  scheduleForm.weekDay = ''
  scheduleForm.period = '1-2'
  scheduleForm.classId = ''
  scheduleForm.courseId = ''
  scheduleForm.teacher = ''
  scheduleForm.classroomId = ''
  scheduleForm.courseType = undefined
  scheduleFormRef.value?.clearValidate()
}

// 填充表单数据
const fillForm = (data: ScheduleDetailVO) => {
  scheduleForm.semester = data.semester
  scheduleForm.weekDay = data.weekDay
  scheduleForm.period = data.period
  scheduleForm.classId = data.classId
  scheduleForm.courseId = data.courseId
  scheduleForm.teacher = data.teacher
  scheduleForm.classroomId = data.classroomId || ''
  scheduleForm.courseType = data.courseType
}

// 监听对话框显示状态和数据变化
watch(
  () => [props.modelValue, props.scheduleData, props.mode],
  ([visible, scheduleData, mode]) => {
    if (visible) {
      if (mode === 'create') {
        resetForm()
        fetchCourses()
        fetchClasses()
        fetchClassrooms()
      } else if (scheduleData && typeof scheduleData === 'object') {
        fillForm(scheduleData)
        fetchCourses(scheduleData.courseName)
        fetchClasses(scheduleData.className || '')
        fetchClassrooms(scheduleData.classroomName || '')
      }
    }
  },
  { immediate: true }
)

// 提交表单
const handleSubmit = async () => {
  if (!scheduleFormRef.value) return
  
  try {
    await scheduleFormRef.value.validate()
    submitting.value = true
    
    if (props.mode === 'create') {
      // 创建课表
      const response: any = await scheduleAPI.createSchedule(scheduleForm)
      if (response.code === 200) {
        showSuccessMessage(response, '课表创建成功')
        handleClose()
        emit('success')
      } else {
        showErrorMessage(response, '创建失败')
      }
    } else if (props.mode === 'edit' && props.scheduleData) {
      // 更新课表
      const updateData: ScheduleRequest = {
        semester: scheduleForm.semester,
        weekDay: scheduleForm.weekDay,
        period: scheduleForm.period,
        classId: scheduleForm.classId,
        courseId: scheduleForm.courseId,
        classroomId: scheduleForm.classroomId,
        teacher: scheduleForm.teacher,
        courseType: scheduleForm.courseType
      }
      
      const response: any = await scheduleAPI.updateSchedule(props.scheduleData.id, updateData)
      if (response.code === 200) {
        showSuccessMessage(response, '课表更新成功')
        handleClose()
        emit('success')
      } else {
        showErrorMessage(response, '更新失败')
      }
    }
  } catch (error: any) {
    handleApiError(error, '操作失败')
  } finally {
    submitting.value = false
  }
}

// 关闭对话框
const handleClose = () => {
  dialogVisible.value = false
}

// 组件挂载时获取教室列表
onMounted(() => {
  fetchClassrooms()
})
</script>

<style scoped>
.dialog-footer {
  text-align: right;
}
</style>
