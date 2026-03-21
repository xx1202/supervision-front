<template>
  <el-dialog
    v-model="visible"
    title="编辑个人资料"
    width="500px"
    :close-on-click-modal="false"
    @close="handleClose"
    append-to-body="true"
  >
    <el-form
      ref="formRef"
      :model="form"
      :rules="rules"
      label-width="100px"
      @submit.prevent
    >
      <el-form-item label="真实姓名" prop="realName">
        <el-input
          v-model="form.realName"
          placeholder="请输入真实姓名"
          clearable
        />
      </el-form-item>

      <el-form-item label="邮箱" prop="email">
        <el-input
          v-model="form.email"
          placeholder="请输入邮箱地址"
          clearable
        />
      </el-form-item>

      <el-form-item label="手机号" prop="phone">
        <el-input
          v-model="form.phone"
          placeholder="请输入手机号"
          clearable
        />
      </el-form-item>

      <el-form-item label="所属部门" prop="department">
        <el-input
          v-model="form.department"
          placeholder="请输入所属部门"
          clearable
        />
      </el-form-item>

      <el-form-item label="办公室" prop="office">
        <el-input
          v-model="form.office"
          placeholder="请输入办公室"
          clearable
        />
      </el-form-item>

      <el-form-item label="头像" prop="avatar">
        <div class="avatar-input">
          <el-upload
              class="avatar-uploader"
              :http-request="customUpload"
              :show-file-list="false"
              :before-upload="beforeUpload"
              accept="image/*"
          >
            <el-button size="small" type="primary">上传头像</el-button>
          </el-upload>
          <div class="avatar-preview" v-if="form.avatar">
            <img :src="getAvatarUrl(form.avatar)" class="preview-image" />
            <el-button
                size="small"
                type="danger"
                circle
                @click.stop="form.avatar = ''"
                class="delete-avatar"
            >
              <el-icon><Delete /></el-icon>
            </el-button>
          </div>
        </div>
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
import {ref, reactive, watch, computed} from 'vue'
import type { FormInstance, FormRules, UploadFile } from 'element-plus'
import { showSuccessMessage, showErrorMessage, handleApiError } from '@/utils/error-handler'
import {authAPI, fileAPI, userAPI} from '../../api'
import type { UserProfileVO } from '../../types/api'

interface Props {
  modelValue: boolean
  userInfo: UserProfileVO
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
  realName: '',
  email: '',
  phone: '',
  department: '',
  office: '',
  avatar: '',
  avatarUrl: '',
})

// 表单验证规则
const rules: FormRules = {
  email: [
    { type: 'email', message: '请输入正确的邮箱格式', trigger: 'blur' }
  ],
  phone: [
    { pattern: /^1[3-9]\d{9}$/, message: '请输入正确的手机号格式', trigger: 'blur' }
  ]
}

// 监听visible变化
watch(() => props.modelValue, (val) => {
  visible.value = val
  if (val) {
    initForm()
  }
})

// 监听visible变化，同步到父组件
watch(visible, (val) => {
  emit('update:modelValue', val)
})

// 初始化表单数据
const initForm = () => {
  form.realName = props.userInfo.realName || ''
  form.email = props.userInfo.email || ''
  form.phone = props.userInfo.phone || ''
  form.department = props.userInfo.department || ''
  form.office = props.userInfo.office || ''
  form.avatar = props.userInfo.avatar || ''
}

// 关闭对话框
const handleClose = () => {
  visible.value = false
  formRef.value?.resetFields()
}

// 提交表单
const handleSubmit = async () => {
  if (!formRef.value) return

  try {
    await formRef.value.validate()
    loading.value = true

    const response: any = await authAPI.updateProfile(form)
    if (response && response.code === 200) {
      showSuccessMessage(response, '个人资料修改成功')
      emit('success')
      handleClose()
    } else {
      showErrorMessage(response, '修改失败')
    }
  } catch (error: any) {
    console.error('修改个人资料失败:', error)
    handleApiError(error, '修改失败，请重试')
  } finally {
    loading.value = false
  }
}
// 获取头像URL（处理本地路径或网络路径）
const getAvatarUrl = (path: string): string => {
  if (!path) return '';
  if (path.startsWith('http://') || path.startsWith('https://')) {
    return path;
  }
  // 从环境变量获取 API 基础路径（如 VITE_API_BASE_URL）
  const baseUrl = 'http://localhost:8080';
  return `${baseUrl}${path.startsWith('/') ? path : `/${path}`}`;
};

// 自定义图片上传方法
const customUpload = async (uploadFile: { file: File }) => {
  try {
    if (!uploadFile?.file) {
      throw new Error('文件对象无效')
    }

    // 这里假设userAPI.uploadAvatar返回的是包含avatar字段的对象
    const response: any = await userAPI.uploadAvatar(uploadFile.file)

    if (response && response.code === 200) {
      // 假设返回数据中包含avatar字段，可能是文件路径或URL
      form.avatar = response.data.fileUrl || response.data.url || ''
      showSuccessMessage(response, '头像上传成功')
    } else {
      throw new Error(response?.message || '上传失败')
    }
  } catch (error) {
    handleApiError(error, '上传失败')
    console.error('上传错误:', error)
    throw error // 抛出错误让el-upload捕获
  }
}

// 限制上传文件的大小及类型
const beforeUpload = (file: File) => {
  const isImage = file.type.startsWith('image/');
  const isLt2M = file.size / 1024 / 1024 < 2;

  if (!isImage) {
    handleApiError('上传头像只能是图片文件!', '上传失败')
  }
  if (!isLt2M) {
    handleApiError('上传头像大小不能超过 2MB!', '上传失败')
  }

  return isImage && isLt2M;
}
</script>

<style scoped>
.dialog-footer {
  text-align: right;
}

.avatar-input {
  display: flex;
  align-items: flex-start;
  gap: 12px;
}

.avatar-preview {
  flex-shrink: 0;
}

.preview-image {
  width: 60px;
  height: 60px;
  border-radius: 50%;
  object-fit: cover;
  border: 2px solid #e4e7ed;
}
</style>
