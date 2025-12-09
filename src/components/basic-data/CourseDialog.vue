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
      ref="courseFormRef"
      :model="courseForm"
      :rules="courseRules"
      label-width="100px"
    >
      <el-form-item label="课程名称" prop="courseName">
        <el-input 
          v-model="courseForm.courseName" 
          placeholder="请输入课程名称"
          :disabled="mode === 'view'"
        />
      </el-form-item>
      
      <el-form-item label="课程类型" prop="courseType">
        <el-select 
          v-model="courseForm.courseType" 
          placeholder="请选择课程类型"
          style="width: 100%"
          :disabled="mode === 'view'"
        >
          <el-option label="理论课" value="theory" />
          <el-option label="实训课" value="training" />
        </el-select>
      </el-form-item>
      
      <el-form-item label="所属部门" prop="department">
        <el-input 
          v-model="courseForm.department" 
          placeholder="请输入所属部门"
          :disabled="mode === 'view'"
        />
      </el-form-item>
      
      <el-form-item label="任课教师" prop="teacher">
        <el-input 
          v-model="courseForm.teacher" 
          placeholder="请输入任课教师"
          :disabled="mode === 'view'"
        />
      </el-form-item>
      
      <el-form-item v-if="mode !== 'create'" label="状态" prop="status">
        <el-radio-group v-model="courseForm.status" :disabled="mode === 'view'">
          <el-radio :label="1">启用</el-radio>
          <el-radio :label="0">禁用</el-radio>
        </el-radio-group>
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
import { ref, reactive, watch, computed } from 'vue'
import type { FormInstance, FormRules } from 'element-plus'
import { courseAPI } from '@/api'
import type { Course, CourseCreateParams, CourseUpdateParams } from '@/types/api'
import { showSuccessMessage, showErrorMessage, handleApiError } from '@/utils/error-handler'

// 组件属性
interface Props {
  modelValue: boolean
  courseData?: Course
  mode: 'create' | 'edit' | 'view'
}

// 组件事件
interface Emits {
  (e: 'update:modelValue', value: boolean): void
  (e: 'success'): void
}

const props = withDefaults(defineProps<Props>(), {
  courseData: undefined,
  mode: 'create'
})

const emit = defineEmits<Emits>()

// 表单引用
const courseFormRef = ref<FormInstance>()
const submitting = ref(false)

// 对话框显示状态
const dialogVisible = computed({
  get: () => props.modelValue,
  set: (value) => emit('update:modelValue', value)
})

// 表单数据
const courseForm = reactive<CourseCreateParams & { status?: number }>({
  courseName: '',
  courseType: 'theory',
  department: '',
  teacher: '',
  status: 1
})

// 表单验证规则
const courseRules: FormRules = {
  courseName: [
    { required: true, message: '请输入课程名称', trigger: 'blur' },
    { min: 2, max: 50, message: '课程名称长度在 2 到 50 个字符', trigger: 'blur' }
  ],
  courseType: [
    { required: true, message: '请选择课程类型', trigger: 'change' }
  ],
  department: [
    { required: true, message: '请输入所属部门', trigger: 'blur' }
  ],
  teacher: [
    { required: true, message: '请输入任课教师', trigger: 'blur' }
  ]
}

// 获取对话框标题
const getDialogTitle = () => {
  switch (props.mode) {
    case 'create':
      return '新增课程'
    case 'edit':
      return '编辑课程'
    case 'view':
      return '查看课程详情'
    default:
      return '课程信息'
  }
}

// 重置表单
const resetForm = () => {
  courseForm.courseName = ''
  courseForm.courseType = 'theory'
  courseForm.department = ''
  courseForm.teacher = ''
  courseForm.status = 1
  courseFormRef.value?.clearValidate()
}

// 填充表单数据
const fillForm = (data: Course) => {
  courseForm.courseName = data.courseName
  courseForm.courseType = data.courseType
  courseForm.department = data.department
  courseForm.teacher = data.teacher
  courseForm.status = data.status
}

// 监听对话框显示状态和数据变化
watch(
  () => [props.modelValue, props.courseData, props.mode],
  ([visible, courseData, mode]) => {
    if (visible) {
      if (mode === 'create') {
        resetForm()
      } else if (courseData && typeof courseData === 'object' && 'courseName' in courseData) {
        // 确保 courseData 是 Course 类型
        fillForm(courseData as Course)
      }
    }
  },
  { immediate: true }
)

// 提交表单
const handleSubmit = async () => {
  if (!courseFormRef.value) return
  
  try {
    await courseFormRef.value.validate()
    submitting.value = true
    
    if (props.mode === 'create') {
      // 创建课程
      const response: any = await courseAPI.createCourse(courseForm)
      if (response.code === 200) {
        showSuccessMessage(response, '课程创建成功')
        handleClose()
        emit('success')
      } else {
        showErrorMessage(response, '创建失败')
      }
    } else if (props.mode === 'edit' && props.courseData) {
      // 更新课程
      const updateData: CourseUpdateParams = {
        courseName: courseForm.courseName,
        courseType: courseForm.courseType,
        department: courseForm.department,
        teacher: courseForm.teacher,
        status: courseForm.status
      }
      
      const response: any = await courseAPI.updateCourse(props.courseData.id, updateData)
      if (response.code === 200) {
        showSuccessMessage(response, '课程更新成功')
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
</script>

<style scoped>
.dialog-footer {
  text-align: right;
}
</style>
