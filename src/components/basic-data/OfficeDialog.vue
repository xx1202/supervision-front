<template>
  <el-dialog
    :title="isEdit ? '编辑办公室' : '新增办公室'"
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
      :rules="rules"
      label-width="100px"
      style="padding: 20px 0"
    >
      <el-form-item label="办公室号" prop="officeNumber">
        <el-input
          v-model="form.officeNumber"
          placeholder="请输入办公室号"
          maxlength="50"
          show-word-limit
        />
      </el-form-item>

      <el-form-item label="办公室名称" prop="officeName">
        <el-input
          v-model="form.officeName"
          placeholder="请输入办公室名称"
          maxlength="100"
          show-word-limit
        />
      </el-form-item>

      <el-row :gutter="20">
        <el-col :span="12">
          <el-form-item label="楼层" prop="floor">
            <el-input-number
              v-model="form.floor"
              :min="1"
              :max="100"
              placeholder="楼层"
              style="width: 100%"
            />
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="方位" prop="location">
            <el-select v-model="form.location" placeholder="选择方位" style="width: 100%">
              <el-option label="东侧" value="east" />
              <el-option label="西侧" value="west" />
            </el-select>
          </el-form-item>
        </el-col>
      </el-row>

      <el-row :gutter="20">
        <el-col :span="12">
          <el-form-item label="容纳人数" prop="capacity">
            <el-input-number
              v-model="form.capacity"
              :min="1"
              :max="1000"
              placeholder="容纳人数"
              style="width: 100%"
            />
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="状态" prop="status">
            <el-select v-model="form.status" placeholder="选择状态" style="width: 100%">
              <el-option label="启用" :value="1" />
              <el-option label="禁用" :value="0" />
            </el-select>
          </el-form-item>
        </el-col>
      </el-row>
    </el-form>

    <template #footer>
      <div class="dialog-footer">
        <el-button @click="handleClose">取消</el-button>
        <el-button type="primary" @click="handleSubmit" :loading="loading">
          {{ isEdit ? '更新' : '创建' }}
        </el-button>
      </div>
    </template>
  </el-dialog>
</template>

<script setup lang="ts">
import { ref, reactive, computed, watch, nextTick } from 'vue'
import type { FormInstance, FormRules } from 'element-plus'
import { officeAPI } from '../../api'
import type { Office } from '../../types/api'
import { showSuccessMessage, showErrorMessage, handleApiError } from '@/utils/error-handler'

interface Props {
  modelValue: boolean
  officeData?: Office
}

interface Emits {
  (e: 'update:modelValue', value: boolean): void
  (e: 'success'): void
}

const props = defineProps<Props>()
const emit = defineEmits<Emits>()

// 表单引用
const formRef = ref<FormInstance>()

// 加载状态
const loading = ref(false)

// 表单数据
const form = reactive({
  officeNumber: '',
  officeName: '',
  department: '信息工程学院',
  floor: 1,
  location: 'east',
  capacity: 10,
  status: 1
})

// 表单验证规则
const rules: FormRules = {
  officeNumber: [
    { required: true, message: '请输入办公室号', trigger: 'blur' },
    { min: 1, max: 50, message: '长度在 1 到 50 个字符', trigger: 'blur' }
  ],
  officeName: [
    { required: true, message: '请输入办公室名称', trigger: 'blur' },
    { min: 1, max: 100, message: '长度在 1 到 100 个字符', trigger: 'blur' }
  ],
  department: [
    { required: true, message: '请输入所属部门', trigger: 'blur' },
    { min: 1, max: 100, message: '长度在 1 到 100 个字符', trigger: 'blur' }
  ],
  floor: [
    { required: true, message: '请选择楼层', trigger: 'change' },
    { type: 'number', min: 1, max: 100, message: '楼层必须在 1 到 100 之间', trigger: 'change' }
  ],
  location: [
    { required: true, message: '请选择方位', trigger: 'change' }
  ],
  capacity: [
    { required: true, message: '请输入容纳人数', trigger: 'change' },
    { type: 'number', min: 1, max: 1000, message: '容纳人数必须在 1 到 1000 之间', trigger: 'change' }
  ],
  status: [
    { required: true, message: '请选择状态', trigger: 'change' }
  ]
}

// 计算属性
const dialogVisible = computed({
  get: () => props.modelValue,
  set: (value) => emit('update:modelValue', value)
})

const isEdit = computed(() => !!props.officeData)

// 初始化表单数据
const initForm = () => {
  if (props.officeData) {
    // 编辑模式，填充现有数据
    form.officeNumber = props.officeData.officeNumber
    form.officeName = props.officeData.officeName
    form.department = props.officeData.department
    form.floor = props.officeData.floor
    form.location = props.officeData.location
    form.capacity = props.officeData.capacity
    form.status = props.officeData.status
  } else {
    // 新增模式，清空表单
    form.officeNumber = ''
    form.officeName = ''
    form.department = '信息工程学院'
    form.floor = 1
    form.location = ''
    form.capacity = 1
    form.status = 1
  }
}

// 监听props变化
watch(() => props.officeData, () => {
  initForm()
}, { immediate: true })

// 监听visible变化
watch(() => props.modelValue, (val) => {
  if (val) {
    initForm()
  }
})

// 重置表单
const resetForm = () => {
  Object.assign(form, {
    officeNumber: '',
    officeName: '',
    department: '信息工程学院',
    floor: 1,
    location: 'east',
    capacity: 10,
    status: 1
  })
  
  nextTick(() => {
    formRef.value?.clearValidate()
  })
}

// 关闭对话框
const handleClose = () => {
  dialogVisible.value = false
  resetForm()
}

// 提交表单
const handleSubmit = async () => {
  try {
    await formRef.value?.validate()
    
    if (props.officeData) {
      // 编辑模式
      const response: any = await officeAPI.updateOffice(props.officeData.id, form)
      if (response && response.code === 200) {
        showSuccessMessage(response, '办公室信息更新成功')
        emit('success')
        dialogVisible.value = false
      } else {
        showErrorMessage(response, '更新失败')
      }
    } else {
      // 新增模式
      const response: any = await officeAPI.createOffice(form)
      if (response && response.code === 200) {
        showSuccessMessage(response, '办公室信息创建成功')
        emit('success')
        dialogVisible.value = false
      } else {
        showErrorMessage(response, '创建失败')
      }
    }
  } catch (error: unknown) {
    handleApiError(error, '操作失败，请稍后重试')
  }
}
</script>

<style scoped>
.dialog-footer {
  text-align: right;
}
</style>
