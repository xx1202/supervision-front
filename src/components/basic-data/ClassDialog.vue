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
      ref="formRef"
      :model="form"
      :rules="isViewMode ? {} : rules"
      label-width="100px"
      style="padding: 20px 0"
    >
      <el-form-item label="班级名称" prop="className">
        <el-input
          v-model="form.className"
          placeholder="请输入班级名称"
          maxlength="100"
          show-word-limit
          :readonly="isViewMode"
        />
      </el-form-item>

<!--      <el-form-item label="所属部门" prop="department">-->
<!--        <el-input-->
<!--          v-model="form.department"-->
<!--          placeholder="请输入所属部门"-->
<!--          maxlength="100"-->
<!--          show-word-limit-->
<!--          :readonly="isViewMode"-->
<!--        />-->
<!--      </el-form-item>-->

      <el-row :gutter="20">
        <el-col :span="12">
          <el-form-item label="学生人数" prop="studentCount">
            <el-input-number
              v-model="form.studentCount"
              :min="0"
              :max="200"
              placeholder="学生人数"
              style="width: 100%"
              :disabled="isViewMode"
            />
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="状态" prop="status">
            <el-select v-model="form.status" placeholder="选择状态" style="width: 100%" :disabled="isViewMode">
              <el-option label="启用" :value="1" />
              <el-option label="禁用" :value="0" />
            </el-select>
          </el-form-item>
        </el-col>
      </el-row>

      <el-row :gutter="20">
        <el-col :span="12">
          <el-form-item label="辅导员" prop="counselor">
            <el-input
              v-model="form.counselor"
              placeholder="请输入辅导员姓名"
              maxlength="50"
              :readonly="isViewMode"
            />
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="兼职班主任" prop="partTimeTeacher">
            <el-input
              v-model="form.partTimeTeacher"
              placeholder="请输入兼职班主任姓名"
              maxlength="50"
              :readonly="isViewMode"
            />
          </el-form-item>
        </el-col>
      </el-row>

      <!-- 查看模式下的额外信息 -->
      <template v-if="isViewMode && currentClass">
        <el-divider content-position="left">管理信息</el-divider>
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="创建时间">
              <span>{{ formatDate(currentClass.createdTime) }}</span>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="最后更新">
              <span>{{ formatDate(currentClass.updatedTime) }}</span>
            </el-form-item>
          </el-col>
        </el-row>
        <el-row :gutter="20" v-if="currentClass.lastVerifiedAt">
          <el-col :span="12">
            <el-form-item label="最后核实时间">
              <span>{{ formatDate(currentClass.lastVerifiedAt) }}</span>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="核实备注">
              <span>{{ currentClass.verificationNote || '-' }}</span>
            </el-form-item>
          </el-col>
        </el-row>
      </template>
    </el-form>

    <template #footer>
      <div class="dialog-footer">
        <el-button @click="handleClose">
          {{ isViewMode ? '关闭' : '取消' }}
        </el-button>
        <el-button 
          v-if="!isViewMode"
          type="primary" 
          @click="handleSubmit" 
          :loading="loading"
        >
          {{ isEdit ? '更新' : '创建' }}
        </el-button>
      </div>
    </template>
  </el-dialog>
</template>

<script setup lang="ts">
import { ref, reactive, watch, computed } from 'vue'
import type { FormInstance, FormRules } from 'element-plus'
import { classAPI } from '@/api'
import type { Class, ClassCreateParams, ClassUpdateParams } from '@/types/api'
import { showSuccessMessage, showErrorMessage, handleApiError } from '@/utils/error-handler'

interface Props {
  visible: boolean
  classData?: Class
  mode?: 'create' | 'edit' | 'view'
}

interface Emits {
  (e: 'update:visible', value: boolean): void
  (e: 'success'): void
}

const props = withDefaults(defineProps<Props>(), {
  mode: 'create'
})

const emit = defineEmits<Emits>()

const dialogVisible = ref(false)
const loading = ref(false)
const formRef = ref<FormInstance>()

const form = reactive<ClassCreateParams>({
  className: '',
  department: '信息工程学院',
  studentCount: 0,
  counselor: '',
  partTimeTeacher: '',
  status: 1
})

const rules: FormRules = {
  className: [
    { required: true, message: '请输入班级名称', trigger: 'blur' },
    { min: 2, max: 100, message: '班级名称长度在 2 到 100 个字符', trigger: 'blur' }
  ],
  studentCount: [
    { required: true, message: '请输入学生人数', trigger: 'blur' },
    { type: 'number', min: 0, max: 200, message: '学生人数必须在 0 到 200 之间', trigger: 'blur' }
  ],
  status: [
    { required: true, message: '请选择状态', trigger: 'change' }
  ]
}

const currentClass = computed(() => props.classData)
const isEdit = computed(() => props.mode === 'edit')
const isViewMode = computed(() => props.mode === 'view')

// 获取对话框标题
const getDialogTitle = () => {
  switch (props.mode) {
    case 'create':
      return '新增班级'
    case 'edit':
      return '编辑班级'
    case 'view':
      return '班级详情'
    default:
      return '班级管理'
  }
}

// 格式化日期
const formatDate = (dateStr: string) => {
  if (!dateStr) return '-'
  return new Date(dateStr).toLocaleString('zh-CN')
}

// 监听visible变化
watch(() => props.visible, (val) => {
  dialogVisible.value = val
  if (val) {
    resetForm()
    if (props.classData) {
      Object.assign(form, props.classData)
    }
  }
})

// 监听对话框关闭
watch(dialogVisible, (val) => {
  emit('update:visible', val)
})

// 重置表单
const resetForm = () => {
  Object.assign(form, {
    className: '',
    department: '信息工程学院',
    studentCount: 0,
    counselor: '',
    partTimeTeacher: '',
    status: 1
  })
  formRef.value?.clearValidate()
}

// 关闭对话框
const handleClose = () => {
  dialogVisible.value = false
}

// 提交表单
const handleSubmit = async () => {
  if (!formRef.value) return
  
  try {
    await formRef.value.validate()
    loading.value = true
    
    if (isEdit.value && props.classData) {
      // 编辑模式
      const response: any = await classAPI.updateClass(props.classData.id, form as ClassUpdateParams)
      if (response.code === 200) {
        showSuccessMessage(response, '班级信息更新成功')
      } else {
        showErrorMessage(response, '更新失败')
      }

    } else {
      // 新增模式
      const response: any = await classAPI.createClass(form)
      if (response.code === 200) {
        showSuccessMessage(response, '班级信息创建成功')
      } else {
        showErrorMessage(response, '创建失败')
      }
    }
    
    emit('success')
    handleClose()
  } catch (error: any) {
    if (error.code === 409) {
      showErrorMessage(error, '班级名称已存在，请使用其他名称')
    } else {
      handleApiError(error, '操作失败')
    }
  } finally {
    loading.value = false
  }
}
</script>

<style scoped>
.dialog-footer {
  text-align: right;
}
</style>
