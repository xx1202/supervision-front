<template>
  <div class="user-home">
    <div class="page-header">
      <h1 class="page-title">用户中心</h1>
      <p class="page-description">欢迎回来，{{ userInfo.realName || userInfo.username }}</p>
    </div>

    <!-- 用户信息卡片 -->
    <div class="user-info-card">
      <div class="user-avatar">
        <img
            :src="avatarUrl || '/src/assets/default-avatar.svg'"
            :alt="userInfo.realName || userInfo.username"
        />
      </div>
      <div class="user-details">
        <h2 class="user-name">{{ userInfo.realName || userInfo.username }}</h2>
        <p class="user-role">{{ userInfo.role || '用户' }}</p>
        <p class="user-department">{{ userInfo.department || '未设置部门' }}</p>
        <div class="user-stats">
          <div class="stat-item">
            <span class="stat-label">用户名</span>
            <span class="stat-value">{{ userInfo.username }}</span>
          </div>
          <div class="stat-item">
            <span class="stat-label">邮箱</span>
            <span class="stat-value">{{ userInfo.email || '未设置' }}</span>
          </div>
          <div class="stat-item">
            <span class="stat-label">电话</span>
            <span class="stat-value">{{ userInfo.phone || '未设置' }}</span>
          </div>
          <div class="stat-item">
            <span class="stat-label">办公室</span>
            <span class="stat-value">{{ userInfo.office || '未设置' }}</span>
          </div>
        </div>
      </div>
      <div class="user-actions">
        <button class="action-btn primary" @click="editProfile">
          <i class="el-icon-edit"></i>
          编辑资料
        </button>
        <button class="action-btn secondary" @click="changePassword">
          <i class="el-icon-key"></i>
          修改密码
        </button>
      </div>
    </div>

    <!-- 快速功能 -->
    <div class="quick-functions">
      <h2 class="section-title">快速功能</h2>
      <div class="function-grid">
        <div class="function-card" @click="viewSchedule">
          <div class="function-icon">
            <i class="el-icon-date"></i>
          </div>
          <div class="function-title">我的安排</div>
          <div class="function-desc">查看个人工作安排</div>
        </div>
        
        <div class="function-card" @click="viewAttendance">
          <div class="function-icon">
            <i class="el-icon-user"></i>
          </div>
          <div class="function-title">考勤记录</div>
          <div class="function-desc">查看个人考勤情况</div>
        </div>
        
        <div class="function-card" @click="viewReports">
          <div class="function-icon">
            <i class="el-icon-document"></i>
          </div>
          <div class="function-title">我的报告</div>
          <div class="function-desc">查看提交的报告</div>
        </div>
        
        <div class="function-card" @click="viewNotifications">
          <div class="function-icon">
            <i class="el-icon-bell"></i>
          </div>
          <div class="function-title">消息通知</div>
          <div class="function-desc">查看系统通知</div>
        </div>
      </div>
    </div>

    <!-- 最近活动 -->
    <div class="recent-activities">
      <h2 class="section-title">最近活动</h2>
      <div class="activity-list">
        <div v-for="activity in recentActivities" :key="activity.id" class="activity-item">
          <div class="activity-icon" :class="activity.type">
            <i :class="activity.icon"></i>
          </div>
          <div class="activity-content">
            <div class="activity-title">{{ activity.title }}</div>
            <div class="activity-time">{{ activity.time }}</div>
          </div>
          <div class="activity-status" :class="activity.status">
            {{ activity.statusText }}
          </div>
        </div>
      </div>
    </div>

    <!-- 统计概览 -->
    <div class="statistics-overview">
      <h2 class="section-title">本月统计</h2>
      <div class="stats-grid">
        <div class="stat-card">
          <div class="stat-header">
            <div class="stat-title">出勤天数</div>
            <div class="stat-icon">
              <i class="el-icon-date"></i>
            </div>
          </div>
          <div class="stat-number">{{ monthlyStats.attendanceDays }}</div>
          <div class="stat-trend positive">
            <i class="el-icon-arrow-up"></i>
            +2 天
          </div>
        </div>
        
        <div class="stat-card">
          <div class="stat-header">
            <div class="stat-title">完成任务</div>
            <div class="stat-icon">
              <i class="el-icon-check"></i>
            </div>
          </div>
          <div class="stat-number">{{ monthlyStats.completedTasks }}</div>
          <div class="stat-trend positive">
            <i class="el-icon-arrow-up"></i>
            +5 个
          </div>
        </div>
        
        <div class="stat-card">
          <div class="stat-header">
            <div class="stat-title">请假天数</div>
            <div class="stat-icon">
              <i class="el-icon-time"></i>
            </div>
          </div>
          <div class="stat-number">{{ monthlyStats.leaveDays }}</div>
          <div class="stat-trend neutral">
            <i class="el-icon-minus"></i>
            无变化
          </div>
        </div>
        
        <div class="stat-card">
          <div class="stat-header">
            <div class="stat-title">工作效率</div>
            <div class="stat-icon">
              <i class="el-icon-data-analysis"></i>
            </div>
          </div>
          <div class="stat-number">{{ monthlyStats.efficiency }}%</div>
          <div class="stat-trend positive">
            <i class="el-icon-arrow-up"></i>
            +3%
          </div>
        </div>
      </div>
    </div>

    <!-- 修改资料对话框 -->
    <ProfileDialog
      v-model="profileDialogVisible"
      :user-info="userInfo"
      @success="handleProfileSuccess"
    />

    <!-- 修改密码对话框 -->
    <PasswordDialog
      v-model="passwordDialogVisible"
      @success="handlePasswordSuccess"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, defineAsyncComponent } from 'vue'
import { authAPI, approvalAPI } from '../../api'
import type { UserProfileVO } from '../../types/api'
import { ElMessage, ElMessageBox } from 'element-plus'
import { showSuccessMessage } from '@/utils/error-handler'
import { logger } from '@/utils/logger'
import type { ApiResponse } from '../../types/api'
// 动态导入组件
const ProfileDialog = defineAsyncComponent(() => import('../../components/user/ProfileDialog.vue'))
const PasswordDialog = defineAsyncComponent(() => import('../../components/user/PasswordDialog.vue'))

// 用户信息
const userInfo = ref<UserProfileVO>({
  id: '',
  username: '',
  realName: '',
  email: '',
  phone: '',
  avatar: '',
  department: '',
  office: '',
  role: '',
  permissions: [],
  lastLoginTime: ''
})

// 定义 props 类型
const props = defineProps<{
  userInfo: {
    avatar?: string
    realName?: string
    username?: string
  }
}>()

// 响应式变量存储头像URL
const avatarUrl = ref<string | null>(null)
let blobUrl: string | null = null // 用于存储创建的blob URL


// 对话框状态
const profileDialogVisible = ref(false)
const passwordDialogVisible = ref(false)

// 最近活动
const recentActivities = ref([
  {
    id: 1,
    title: '提交了周报',
    time: '2024-01-15 17:30',
    type: 'report',
    icon: 'el-icon-document',
    status: 'success',
    statusText: '已提交'
  },
  {
    id: 2,
    title: '参加了教研室会议',
    time: '2024-01-15 14:00',
    type: 'meeting',
    icon: 'el-icon-user',
    status: 'info',
    statusText: '已完成'
  },
  {
    id: 3,
    title: '请假申请已审批',
    time: '2024-01-14 10:30',
    type: 'leave',
    icon: 'el-icon-time',
    status: 'success',
    statusText: '已通过'
  },
  {
    id: 4,
    title: '更新了个人信息',
    time: '2024-01-13 16:45',
    type: 'profile',
    icon: 'el-icon-edit',
    status: 'info',
    statusText: '已更新'
  }
])

// 本月统计
const monthlyStats = ref({
  attendanceDays: 18,
  completedTasks: 12,
  leaveDays: 1,
  efficiency: 95
})

// 获取用户信息
const loadUserInfo = async () => {
  try {
    const response = await authAPI.getCurrentUser()
    if (response && response.code === 200 && response.data) {
      userInfo.value = response.data
    }
  } catch (error: unknown) {
    if (error instanceof Error) {
      console.error('加载用户信息失败:', error.message)
    } else {
      console.error('加载用户信息失败:', error)
    }
  }
}

// 方法
const editProfile = () => {
  profileDialogVisible.value = true
}

const changePassword = () => {
  passwordDialogVisible.value = true
}

const viewSchedule = () => {
  logger.debug('查看安排')
  ElMessage.info('查看安排功能开发中...')
}

const viewAttendance = () => {
  logger.debug('查看考勤')
  ElMessage.info('查看考勤功能开发中...')
}

const viewReports = () => {
  logger.debug('查看报告')
  ElMessage.info('查看报告功能开发中...')
}

const viewNotifications = () => {
  logger.debug('查看通知')
  ElMessage.info('查看通知功能开发中...')
}

// 处理修改资料成功
const handleProfileSuccess = () => {
  // 重新获取用户信息
  loadUserInfo()
}

// 处理修改密码成功
const handlePasswordSuccess = () => {
  // 密码修改成功后，可以提示用户重新登录
  const response: any = { code: 200, message: '密码修改成功，建议重新登录以确保安全' }
  showSuccessMessage(response, '密码修改成功，建议重新登录以确保安全')
}
// 处理文件路径格式
const formatPhotoPath = (filePath: string) => {
  // 将 /api/v1/supervision/files/2025/08/07/20250807_180118_003.jpg 格式
  // 转换为 2025/08/07/20250807_184448_030.jpg 格式
  if (filePath.startsWith('/api/v1/supervision/files/')) {
    return filePath.replace('/api/v1/supervision/files/', '')
  }
  // 如果已经是相对路径格式，直接返回
  if (filePath.includes('/') && !filePath.startsWith('/api/')) {
    return filePath
  }
  return filePath
}
// 获取媒体文件URL（使用blob）
const getPhotoUrl = async (filePath: string) => {
  try {
    const formattedPath = formatPhotoPath(filePath)
    const blob = await approvalAPI.getMediaFile(formattedPath)
    const objectUrl = URL.createObjectURL(blob)
    return objectUrl
  } catch (error) {
    console.error('获取媒体文件失败:', error)
    // 返回占位图片
    return 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjZjVmNWY1Ii8+PHRleHQgeD0iNTAlIiB5PSI1MCUiIGZvbnQtZmFtaWx5PSJBcmlhbCwgc2Fucy1zZXJpZiIgZm9udC1zaXplPSIxNCIgZmlsbD0iIzk5OSIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZHk9Ii4zZW0iPuekuuS+i+WbvueJhzwvdGV4dD48L3N2Zz4='
  }
}
onMounted(() => {
  // 获取用户数据
  loadUserInfo()
  logger.debug('用户首页加载完成')
})
</script>

<style scoped lang="scss">
.user-home {
  padding: 24px;
  background-color: #f5f7fa;
  min-height: 100vh;
}

.page-header {
  margin-bottom: 24px;
  
  .page-title {
    font-size: 28px;
    font-weight: 600;
    color: #303133;
    margin: 0 0 8px 0;
  }
  
  .page-description {
    font-size: 14px;
    color: #909399;
    margin: 0;
  }
}

.user-info-card {
  background: white;
  border-radius: 12px;
  padding: 32px;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
  display: flex;
  align-items: center;
  margin-bottom: 32px;
  
  .user-avatar {
    width: 80px;
    height: 80px;
    border-radius: 50%;
    overflow: hidden;
    margin-right: 24px;
    
    img {
      width: 100%;
      height: 100%;
      object-fit: cover;
    }
  }
  
  .user-details {
    flex: 1;
    
    .user-name {
      font-size: 24px;
      font-weight: 600;
      color: #303133;
      margin: 0 0 8px 0;
    }
    
    .user-role {
      font-size: 16px;
      color: #409eff;
      margin: 0 0 4px 0;
    }
    
    .user-department {
      font-size: 14px;
      color: #909399;
      margin: 0 0 16px 0;
    }
    
    .user-stats {
      display: flex;
      gap: 24px;
      
      .stat-item {
        .stat-label {
          font-size: 12px;
          color: #909399;
          display: block;
          margin-bottom: 4px;
        }
        
        .stat-value {
          font-size: 14px;
          color: #303133;
          font-weight: 500;
        }
      }
    }
  }
  
  .user-actions {
    display: flex;
    flex-direction: column;
    gap: 12px;
    
    .action-btn {
      padding: 8px 16px;
      border-radius: 6px;
      border: none;
      cursor: pointer;
      font-size: 14px;
      display: flex;
      align-items: center;
      gap: 8px;
      transition: all 0.3s ease;
      
      &.primary {
        background: #409eff;
        color: white;
        
        &:hover {
          background: #337ecc;
        }
      }
      
      &.secondary {
        background: #f5f7fa;
        color: #606266;
        border: 1px solid #dcdfe6;
        
        &:hover {
          background: #ecf5ff;
          color: #409eff;
          border-color: #409eff;
        }
      }
    }
  }
}

.section-title {
  font-size: 20px;
  font-weight: 600;
  color: #303133;
  margin: 0 0 20px 0;
}

.quick-functions {
  margin-bottom: 32px;
}

.function-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 20px;
}

.function-card {
  background: white;
  border-radius: 8px;
  padding: 24px;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
  cursor: pointer;
  transition: all 0.3s ease;
  
  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 20px 0 rgba(0, 0, 0, 0.15);
  }
  
  .function-icon {
    width: 48px;
    height: 48px;
    border-radius: 8px;
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    display: flex;
    align-items: center;
    justify-content: center;
    margin-bottom: 16px;
    
    i {
      font-size: 24px;
      color: white;
    }
  }
  
  .function-title {
    font-size: 18px;
    font-weight: 600;
    color: #303133;
    margin-bottom: 8px;
  }
  
  .function-desc {
    font-size: 14px;
    color: #909399;
    line-height: 1.5;
  }
}

.recent-activities {
  background: white;
  border-radius: 8px;
  padding: 24px;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
  margin-bottom: 32px;
}

.activity-list {
  .activity-item {
    display: flex;
    align-items: center;
    padding: 16px 0;
    border-bottom: 1px solid #ebeef5;
    
    &:last-child {
      border-bottom: none;
    }
    
    .activity-icon {
      width: 40px;
      height: 40px;
      border-radius: 8px;
      display: flex;
      align-items: center;
      justify-content: center;
      margin-right: 16px;
      
      &.report {
        background: #e1f3d8;
        color: #67c23a;
      }
      
      &.meeting {
        background: #fdf6ec;
        color: #e6a23c;
      }
      
      &.leave {
        background: #f0f9ff;
        color: #409eff;
      }
      
      &.profile {
        background: #f4f4f5;
        color: #909399;
      }
      
      i {
        font-size: 18px;
      }
    }
    
    .activity-content {
      flex: 1;
      
      .activity-title {
        font-size: 14px;
        font-weight: 500;
        color: #303133;
        margin-bottom: 4px;
      }
      
      .activity-time {
        font-size: 12px;
        color: #909399;
      }
    }
    
    .activity-status {
      padding: 4px 8px;
      border-radius: 4px;
      font-size: 12px;
      font-weight: 500;
      
      &.success {
        background: #f0f9ff;
        color: #67c23a;
      }
      
      &.info {
        background: #f4f4f5;
        color: #909399;
      }
    }
  }
}

.statistics-overview {
  background: white;
  border-radius: 8px;
  padding: 24px;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 20px;
}

.stat-card {
  padding: 20px;
  border-radius: 8px;
  background: #f8f9fa;
  
  .stat-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 12px;
    
    .stat-title {
      font-size: 14px;
      color: #909399;
    }
    
    .stat-icon {
      width: 32px;
      height: 32px;
      border-radius: 6px;
      background: #409eff;
      display: flex;
      align-items: center;
      justify-content: center;
      
      i {
        font-size: 16px;
        color: white;
      }
    }
  }
  
  .stat-number {
    font-size: 28px;
    font-weight: 600;
    color: #303133;
    margin-bottom: 8px;
  }
  
  .stat-trend {
    font-size: 12px;
    display: flex;
    align-items: center;
    gap: 4px;
    
    &.positive {
      color: #67c23a;
    }
    
    &.negative {
      color: #f56c6c;
    }
    
    &.neutral {
      color: #909399;
    }
  }
}

@media (max-width: 768px) {
  .user-home {
    padding: 16px;
  }
  
  .user-info-card {
    flex-direction: column;
    text-align: center;
    
    .user-avatar {
      margin-right: 0;
      margin-bottom: 16px;
    }
    
    .user-actions {
      margin-top: 16px;
      flex-direction: row;
    }
  }
  
  .function-grid {
    grid-template-columns: 1fr;
  }
  
  .stats-grid {
    grid-template-columns: 1fr;
  }
  
  .activity-item {
    flex-direction: column;
    align-items: flex-start;
    
    .activity-icon {
      margin-bottom: 8px;
    }
    
    .activity-content {
      margin-bottom: 8px;
    }
  }
}
</style> 