<template>
  <div class="login-container">
    <!-- 顶部Header -->
    <header class="login-header">
      <div class="header-left">
        <div class="logo-section">
          <img src="/college-logo.png" alt="学院Logo" class="college-logo" />
          <div class="logo-text">
            <h1>督导管理系统</h1>
          </div>
        </div>
      </div>

    </header>

    <!-- 登录区域 -->
    <div class="login-overlay">
      <div class="login-section">
        <div class="login-box">
          <!-- 登录表单 -->
          <div class="login-form-container">
            <div class="form-header">
              <h2>账号登录</h2>
            </div>
            
            <el-form 
              ref="loginFormRef"
              :model="loginForm" 
              :rules="loginRules"
              @submit.prevent="handleLogin"
              class="login-form"
            >
              <el-form-item prop="username">
                <el-input
                  v-model="loginForm.username"
                  placeholder="用户名"
                  size="large"
                  :prefix-icon="User"
                  clearable
                />
              </el-form-item>
              
              <el-form-item prop="password">
                <el-input
                  v-model="loginForm.password"
                  type="password"
                  placeholder="密码"
                  size="large"
                  :prefix-icon="Lock"
                  show-password
                  clearable
                  @keyup.enter="handleLogin"
                />
              </el-form-item>
              
              <div class="form-options">
                <el-checkbox v-model="autoLogin">一周内免登录</el-checkbox>
                <el-link type="primary" class="forgot-password">忘记密码?</el-link>
              </div>
              
              <el-form-item>
                <el-button
                  type="primary"
                  size="large"
                  :loading="loading"
                  @click="handleLogin"
                  class="login-button"
                >
                  {{ loading ? '登录中...' : '账号登录' }}
                </el-button>
              </el-form-item>
            </el-form>
          </div>
        </div>
      </div>
    </div>

    <!-- 测试用户区域 -->
<!--    <div class="test-users-overlay">-->
<!--      <div class="test-users-section">-->
<!--        <div class="test-users-title">测试用户</div>-->
<!--        <div class="user-grid">-->
<!--          <div-->
<!--            v-for="user in testUsers"-->
<!--            :key="user.username"-->
<!--            class="test-user-item"-->
<!--            @click="fillTestUser(user)"-->
<!--          >-->
<!--            <div class="user-avatar">-->
<!--              {{ user.realName.charAt(0) }}-->
<!--            </div>-->
<!--            <div class="user-info">-->
<!--              <div class="user-name">{{ user.realName }}</div>-->
<!--              <div class="user-role">{{ user.roles.join(', ') }}</div>-->
<!--            </div>-->
<!--          </div>-->
<!--        </div>-->
<!--      </div>-->
<!--    </div>-->

    <!-- 底部Footer -->
    <footer class="login-footer">
      <div class="footer-left">
        <span>信息工程学院版权所有 Copyright@2025</span>
      </div>
      <div class="footer-right">
        <span>服务邮箱: admin@college.edu.cn</span>
      </div>
    </footer>

    <!-- 登录成功动画 -->
    <div v-if="showSuccessAnimation" class="success-animation">
      <div class="success-content">
        <el-icon class="success-icon"><CircleCheckFilled /></el-icon>
        <div class="success-text">登录成功</div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive } from 'vue'
import { useRouter } from 'vue-router'
import { ElForm, ElFormItem, ElInput, ElButton, ElCard, ElDivider, ElAvatar, ElIcon, ElCheckbox, ElLink, ElCollapse, ElCollapseItem } from 'element-plus'
import { showErrorMessage, handleApiError } from '@/utils/error-handler'
import { User, Lock, Right, Monitor, CircleCheckFilled } from '@element-plus/icons-vue'
import { useUserStore } from '@/store/modules/user'

const router = useRouter()
const userStore = useUserStore()
const loading = ref(false)
const showSuccessAnimation = ref(false)
const loginFormRef = ref()
const autoLogin = ref(false)


const loginForm = reactive({
  username: '',
  password: '',
  clientType: 'web' as const
})

// 表单验证规则
const loginRules = {
  username: [
    { required: true, message: '请输入用户名', trigger: 'blur' },
    { min: 2, max: 30, message: '用户名长度在 2 到 20 个字符', trigger: 'blur' }
  ],
  password: [
    { required: true, message: '请输入密码', trigger: 'blur' },
    { min: 6, max: 20, message: '密码长度在 6 到 20 个字符', trigger: 'blur' }
  ]
}

// 测试用户数据（用于快速填充表单）
const testUsers = [
  {
    username: 'admin_office_director',
    password: '123456',
    realName: '政务办主任',
    roles: ['ADMIN_OFFICE_DIRECTOR']
  },
  {
    username: 'academic_office_director',
    password: '123456',
    realName: '教务办主任',
    roles: ['ACADEMIC_ADMIN']
  },
  {
    username: 'student_affairs_director',
    password: '123456',
    realName: '学管办主任',
    roles: ['STUDENT_ADMIN']
  },
  {
    username: 'training_director',
    password: '123456',
    realName: '实训教研室主任',
    roles: ['TRAINING_ADMIN']
  },
  {
    username: 'supervision_member',
    password: '123456',
    realName: '督导组成员',
    roles: ['SUPERVISOR']
  },
  {
    username: 'training_teacher',
    password: '123456',
    realName: '实训教师',
    roles: ['TRAINING_TEACHER']
  },
  {
    username: 'student_supervisor',
    password: 'admin123',
    realName: '学生督导员',
    roles: ['STUDENT_SUPERVISOR']
  },
  {
    username: 'visitor',
    password: '123456',
    realName: '访客',
    roles: ['VISITOR']
  }
]

const handleLogin = async () => {
  try {
    // 表单验证
    const valid = await loginFormRef.value?.validate()
    if (!valid) return
    
    loading.value = true
    
    // 使用store进行登录，传递自动登录选项
    const result = await userStore.login(loginForm.username, loginForm.password, autoLogin.value)
    
    if (result.success) {
      // 显示成功动画
      showSuccessAnimation.value = true
      
      // 等待动画完成
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      // 跳转到首页
      router.push('/dashboard')
    } else {
      showErrorMessage(result, '登录失败')
    }
  } catch (error) {
    console.error('登录失败:', error)
    handleApiError(error, '登录失败，请检查网络连接')
  } finally {
    loading.value = false
  }
}

const fillTestUser = (user: any) => {
  loginForm.username = user.username
  loginForm.password = user.password
}
</script>

<style scoped lang="scss">
.login-container {
  height: 100vh;
  display: flex;
  flex-direction: column;
  background: url('/campus-background.jpg') no-repeat center center;
  background-size: cover;
  position: relative;
  overflow: hidden;
}

// 顶部Header
.login-header {
  position: absolute;
  top: -10%;
  left: 0;
  right: 0;
  z-index: 10;
  display: flex;
  justify-content: flex-start;
  align-items: center;
  padding: 0.3rem 2rem;
  
  .header-left {
    .logo-section {
      display: flex;
      align-items: center;
      gap: 1.5rem;
      
      .college-logo {
        width: 252px;
        height: 252px;
        object-fit: contain;
        filter: drop-shadow(0 2px 4px rgba(0, 0, 0, 0.1));
      }
      
      .logo-text {
        h1 {
          margin: 0;
          font-size: 1.62rem;
          font-weight: 600;
          color: #d32f2f;
          text-shadow: 0 2px 4px rgba(0, 0, 0, 0.3);
        }
      }
    }
  }
  

}

// 登录覆盖层 - 固定在屏幕中央
.login-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 5;
}

// 登录区域
.login-section {
  width: 340px;
  height: 300px;
  padding: 1.5rem;
  background: rgba(255, 255, 255, 0.92);
  border-radius: 8px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
  margin-left: 30%;
  
  .login-box {
    width: 100%;
    height: 100%;
    display: flex;
    flex-direction: column;
    justify-content: space-between;
  }
}

// 测试用户覆盖层
.test-users-overlay {
  position: absolute;
  top: 0;
  right: 0;
  z-index: 10;
  pointer-events: none;
  
  .test-users-section {
    pointer-events: auto;
    margin-top: 2rem;
    margin-right: 2rem;
  }
}

// 登录表单容器
.login-form-container {
  flex: 1;
  display: flex;
  flex-direction: column;
  justify-content: center;
  
  .form-header {
    text-align: center;
    margin-bottom: 1.2rem;
    
    h2 {
      margin: 0;
      font-size: 1.4rem;
      font-weight: 600;
      color: #666;
    }
  }
}

// 登录表单
.login-form {
  .form-options {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 1rem;
    
    .forgot-password {
      font-size: 0.75rem;
    }
    
    :deep(.el-checkbox) {
      .el-checkbox__label {
        font-size: 0.75rem;
      }
    }
  }
  
  :deep(.el-input) {
    .el-input__wrapper {
      border-radius: 3px;
      border: 1px solid #dcdfe6;
      transition: all 0.3s ease;
      
      &:hover {
        border-color: #d32f2f;
      }
      
      &.is-focus {
        border-color: #d32f2f;
        box-shadow: 0 0 0 2px rgba(211, 47, 47, 0.2);
      }
    }
  }
  
  .login-button {
    width: 100%;
    height: 2.5rem;
    border-radius: 6px;
    font-size: 0.95rem;
    font-weight: 500;
    background: #d32f2f;
    border: none;
    transition: all 0.3s ease;
    
    &:hover:not(:disabled) {
      background: #e53935;
      transform: translateY(-1px);
      box-shadow: 0 4px 12px rgba(211, 47, 47, 0.3);
    }
    
    &:active {
      transform: translateY(0);
    }
  }
}

// 测试用户区域
.test-users-section {
  position: relative;
  background: white;
  border: 1px solid #e4e7ed;
  border-radius: 4px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  padding: 0.8rem;
  width: 320px;
  
  .test-users-title {
    font-size: 0.9rem;
    font-weight: 500;
    color: #666;
    margin-bottom: 0.5rem;
    text-align: center;
  }
  
  .user-grid {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: 0.3rem;
  }
  
  .test-user-item {
    display: flex;
    align-items: center;
    gap: 0.3rem;
    padding: 0.3rem;
    background: #f8f9fa;
    border-radius: 4px;
    cursor: pointer;
    transition: all 0.3s ease;
    border: 1px solid transparent;
    
    &:hover {
      background: #fff;
      border-color: #d32f2f;
      transform: translateY(-1px);
      box-shadow: 0 2px 6px rgba(0, 0, 0, 0.1);
    }
  }
  
  .user-avatar {
    width: 24px;
    height: 24px;
    border-radius: 50%;
    background: #d32f2f;
    color: white;
    display: flex;
    align-items: center;
    justify-content: center;
    font-weight: 600;
    font-size: 0.7rem;
  }
  
  .user-info {
    flex: 1;
    min-width: 0;
  }
  
  .user-name {
    font-size: 0.7rem;
    font-weight: 600;
    color: #333;
    margin-bottom: 0.1rem;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }
  
  .user-role {
    font-size: 0.6rem;
    color: #666;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }
}

// 底部Footer
.login-footer {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  z-index: 10;
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem 2rem;
  font-size: 0.8rem;
  color: rgba(255, 255, 255, 0.9);
  
  .footer-left, .footer-right {
    span {
      font-size: 0.8rem;
      text-shadow: 0 1px 2px rgba(0, 0, 0, 0.3);
    }
  }
}

// 成功动画
.success-animation {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(255, 255, 255, 0.95);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 9999;
  animation: successFadeIn 0.5s ease-out;
  
  .success-content {
    text-align: center;
    animation: successScaleIn 0.6s ease-out 0.2s both;
  }
  
  .success-icon {
    font-size: 4rem;
    color: #67c23a;
    margin-bottom: 1rem;
    animation: successBounce 0.8s ease-out 0.4s both;
  }
  
  .success-text {
    font-size: 1.5rem;
    color: #333;
    font-weight: 600;
  }
}

@keyframes successFadeIn {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}

@keyframes successScaleIn {
  from {
    transform: scale(0.5);
    opacity: 0;
  }
  to {
    transform: scale(1);
    opacity: 1;
  }
}

@keyframes successBounce {
  0% {
    transform: scale(0.3);
  }
  50% {
    transform: scale(1.2);
  }
  100% {
    transform: scale(1);
  }
}

// 响应式设计
@media (max-width: 1200px) {
  .login-section {
    width: 320px;
    height: 250px;
  }
}

@media (max-width: 768px) {
  .login-header {
    padding: 0.3rem 1rem;
    
    .header-left .logo-section {
      .college-logo {
        width: 180px;
        height: 180px;
      }
      
      .logo-text h1 {
        font-size: 1.08rem;
      }
    }
  }
  
  .login-section {
    width: 90%;
    max-width: 320px;
    height: 250px;
    margin: 0 1rem;
  }
  
  .user-grid {
    grid-template-columns: 1fr !important;
  }
  
  .login-footer {
    flex-direction: column;
    gap: 0.5rem;
    text-align: center;
  }
}

// 深色主题适配
@media (prefers-color-scheme: dark) {
  .login-section {
    background: rgba(30, 30, 30, 0.95);
    border-color: rgba(255, 255, 255, 0.1);
  }
  
  .test-user-item {
    background: rgba(255, 255, 255, 0.05) !important;
    
    &:hover {
      background: rgba(255, 255, 255, 0.1) !important;
    }
  }
  
  .success-animation {
    background: rgba(0, 0, 0, 0.9);
    
    .success-text {
      color: #fff;
    }
  }
}
</style>