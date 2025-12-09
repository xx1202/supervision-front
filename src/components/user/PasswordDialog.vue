<template>
  <el-dialog
    v-model="visible"
    title="修改密码"
    width="500px"
    :close-on-click-modal="false"
    @close="handleClose"
    append-to-body="true"
  >
    <el-form
      ref="formRef"
      :model="form"
      :rules="rules"
      label-width="120px"
      @submit.prevent
    >
      <el-form-item label="当前密码" prop="currentPassword">
        <el-input
          v-model="form.currentPassword"
          type="password"
          placeholder="请输入当前密码"
          show-password
          clearable
        />
      </el-form-item>
      
      <el-form-item label="新密码" prop="newPassword">
        <el-input
          v-model="form.newPassword"
          type="password"
          placeholder="请输入新密码"
          show-password
          clearable
        />
        <div class="password-tips">
          <p>密码要求：</p>
          <ul>
            <li>至少8位字符</li>
            <li>包含字母和数字</li>
            <li>可包含特殊字符：@$!%*?&</li>
          </ul>
        </div>
      </el-form-item>
      
      <el-form-item label="确认新密码" prop="confirmPassword">
        <el-input
          v-model="form.confirmPassword"
          type="password"
          placeholder="请再次输入新密码"
          show-password
          clearable
        />
      </el-form-item>
    </el-form>
    
    <template #footer>
      <div class="dialog-footer">
        <el-button @click="handleClose">取消</el-button>
        <el-button type="primary" :loading="loading" @click="handleSubmit">
          确定
        </el-button>
      </div>
    </template>
  </el-dialog>
</template>

<script setup lang="ts">
import { ref, reactive, watch } from 'vue'
import type { FormInstance, type FormRules } from 'element-plus'
import { authAPI } from '../../api'
import { showSuccessMessage, showErrorMessage, handleApiError } from '@/utils/error-handler'

interface Props {
  modelValue: boolean
}

interface Emits {
  (e: 'update:modelValue', value: boolean): void
  (e: 'success'): void
}

const props = defineProps<Props>()
const emit = defineEmits<Emits>()

const visible = ref(false)
const loading = ref(false)
const formRef = ref<FormInstance>()

// 表单数据
const form = reactive({
  currentPassword: '',
  newPassword: '',
  confirmPassword: ''
})

// 密码验证规则
const validatePassword = (_rule: unknown, value: string, callback: (error?: Error) => void) => {
  if (value === '') {
    callback(new Error('请输入密码'))
  } else if (value.length < 6) {
    callback(new Error('密码长度不能少于6位'))
  } else {
    callback()
  }
}

// 确认密码验证规则
const validateConfirmPassword = (_rule: unknown, value: string, callback: (error?: Error) => void) => {
  if (value === '') {
    callback(new Error('请再次输入密码'))
  } else if (value !== form.newPassword) {
    callback(new Error('两次输入密码不一致'))
  } else {
    callback()
  }
}

// 表单验证规则
const rules: FormRules = {
  currentPassword: [
    { required: true, message: '请输入当前密码', trigger: 'blur' }
  ],
  newPassword: [
    { required: true, validator: validatePassword, trigger: 'blur' }
  ],
  confirmPassword: [
    { required: true, validator: validateConfirmPassword, trigger: 'blur' }
  ]
}

// 监听visible变化
watch(() => props.modelValue, (val) => {
  visible.value = val
})

// 监听visible变化，同步到父组件
watch(visible, (val) => {
  emit('update:modelValue', val)
})

// 关闭对话框
const handleClose = () => {
  visible.value = false
  formRef.value?.resetFields()
  // 清空表单数据
  form.currentPassword = ''
  form.newPassword = ''
  form.confirmPassword = ''
}

// 提交表单
const handleSubmit = async () => {
  try {
    await formRef.value?.validate()
    
    const response: any = await authAPI.changePassword({
      currentPassword: form.currentPassword,
      newPassword: form.newPassword,
      confirmPassword: form.confirmPassword
    })
    
    // 由于响应拦截器已经处理了数据，这里直接使用response
    if (response && response.code === 200) {
      showSuccessMessage(response, '密码修改成功')
      emit('success')
      visible.value = false
      handleClose()
    } else {
      showErrorMessage(response, '密码修改失败')
    }
  } catch (error: unknown) {
    handleApiError(error, '密码修改失败，请稍后重试')
  }
}
</script>

<style scoped>
.dialog-footer {
  text-align: right;
}

.password-tips {
  margin-top: 8px;
  font-size: 12px;
  color: #909399;
}

.password-tips p {
  margin: 0 0 4px 0;
  font-weight: 500;
}

.password-tips ul {
  margin: 0;
  padding-left: 16px;
}

.password-tips li {
  margin: 2px 0;
}
</style>
