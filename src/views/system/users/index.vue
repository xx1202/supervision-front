<template>
  <div class="users-management">
    <div class="page-content">
      <div class="users-container">
        <!-- 搜索和过滤区域 -->
        <div class="search-section">
          <el-form :model="searchForm" inline style="display: flex; align-items: center; justify-content: space-between;">
            <el-form-item label="用户名">
              <el-input v-model="searchForm.username" placeholder="输入用户名" @keyup.enter="handleSearch" />
            </el-form-item>
            <el-form-item label="真实姓名">
              <el-input v-model="searchForm.realName" placeholder="输入真实姓名" @keyup.enter="handleSearch" />
            </el-form-item>
            <el-form-item label="部门">
              <el-input v-model="searchForm.department" placeholder="输入部门名称" @keyup.enter="handleSearch" />
            </el-form-item>
                         <el-form-item label="状态">
               <el-select v-model="searchForm.status" placeholder="选择状态" @change="handleSearch">
                 <el-option label="全部" value="" />
                 <el-option label="正常" :value="1" />
                 <el-option label="禁用" :value="0" />
               </el-select>
             </el-form-item>
            <el-form-item>
              <el-button type="primary" @click="handleSearch">搜索</el-button>
              <el-button @click="resetSearch">重置</el-button>
            </el-form-item>
            <el-form-item style="margin-left: auto;">
              <el-button type="primary" @click="showCreateDialog">
                <el-icon><Plus /></el-icon>
                新增用户
              </el-button>
            </el-form-item>
          </el-form>
        </div>
        
        <div class="users-table">
          <el-table 
            :data="usersList" 
            style="width: 100%" 
            height="100%"
            v-loading="loading"
            fit
            table-layout="fixed"
            border 
            @selection-change="handleSelectionChange"
          >
            <el-table-column v-if="showSelection" type="selection" width="55" />
            <el-table-column prop="username" label="用户名" width="120" />
            <el-table-column prop="realName" label="真实姓名" width="120" />
            <el-table-column prop="department" label="部门" width="120" />
            <el-table-column prop="roleNames" label="角色" width="150">
              <template #default="scope">
                <el-tag 
                  v-for="roleName in scope.row.roleNames" 
                  :key="roleName"
                  style="margin-right: 4px; margin-bottom: 4px"
                  size="small"
                >
                  {{ roleName }}
                </el-tag>
              </template>
            </el-table-column>
            <el-table-column prop="status" label="状态" width="100">
              <template #default="scope">
                <el-tag :type="getStatusType(scope.row.status)">
                  {{ getStatusName(scope.row.status) }}
                </el-tag>
              </template>
            </el-table-column>
            <el-table-column prop="lastLoginTime" label="最后登录" width="160">
              <template #default="scope">
                {{ formatDateTime(scope.row.lastLoginTime) || '未登录' }}
              </template>
            </el-table-column>
            <el-table-column prop="createdTime" label="创建时间" width="160">
              <template #default="scope">
                {{ formatDateTime(scope.row.createdTime) }}
              </template>
            </el-table-column>
                         <el-table-column label="操作" min-width="250" fixed="right">
               <template #default="scope">
                 <el-button size="small" @click="viewUser(scope.row)">查看</el-button>
                 <el-button size="small" type="primary" @click="editUser(scope.row)">编辑</el-button>
                 <el-button size="small" type="warning" @click="resetPassword(scope.row)">重置密码</el-button>
                 
                 <!-- 根据状态显示不同的操作按钮 -->
                 <template v-if="Number(scope.row.status) === 1">
                   <!-- 正常状态：显示禁用按钮 -->
                   <el-button 
                     size="small" 
                     type="danger"
                     @click="disableUser(scope.row)"
                   >
                     禁用
                   </el-button>
                 </template>
                 <template v-else-if="Number(scope.row.status) === 0">
                   <!-- 禁用状态：显示启用按钮 -->
                   <el-button 
                     size="small" 
                     type="success"
                     @click="enableUser(scope.row)"
                   >
                     启用
                   </el-button>
                 </template>
                 
                 <el-button size="small" type="danger" @click="deleteUser(scope.row)">删除</el-button>
               </template>
             </el-table-column>
          </el-table>

          <!-- 分页 -->
          <div class="pagination-wrapper">
            <el-button 
              v-if="!showSelection"
              type="danger" 
              @click="startBatchDelete"
            >
              批量删除
            </el-button>
            <div v-else style="display: flex; gap: 10px; align-items: center;">
              <el-button 
                type="danger" 
                :disabled="selectedUsers.length === 0"
                @click="batchDeleteUsers"
              >
                确认删除 ({{ selectedUsers.length }})
              </el-button>
              <el-button 
                @click="cancelBatchDelete"
              >
                取消
              </el-button>
            </div>
            <el-pagination
              v-model:current-page="pagination.current"
              v-model:page-size="pagination.size"
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

    <!-- 用户详情对话框 -->
    <el-dialog
      title="用户详情"
      v-model="detailVisible"
      width="700px"
      :append-to-body="true"
      :lock-scroll="true"
      :close-on-click-modal="false"
    >
      <div v-if="currentUser" class="user-detail">
        <el-descriptions :column="2" border>
          <el-descriptions-item label="用户名">
            {{ currentUser.username }}
          </el-descriptions-item>
          <el-descriptions-item label="真实姓名">
            {{ currentUser.realName }}
          </el-descriptions-item>
          <el-descriptions-item label="部门">
            {{ currentUser.department }}
          </el-descriptions-item>
          <el-descriptions-item label="状态">
            <el-tag :type="getStatusType(currentUser.status)">
              {{ getStatusName(currentUser.status) }}
            </el-tag>
          </el-descriptions-item>
          <el-descriptions-item label="邮箱" :span="2">
            {{ currentUser.email || '未设置' }}
          </el-descriptions-item>
          <el-descriptions-item label="手机号" :span="2">
            {{ currentUser.phone || '未设置' }}
          </el-descriptions-item>
          <el-descriptions-item label="办公室" :span="2">
            {{ currentUser.office || '未设置' }}
          </el-descriptions-item>
          <el-descriptions-item label="最后登录时间" :span="2">
            {{ formatDateTime(currentUser.lastLoginTime) || '未登录' }}
          </el-descriptions-item>
          <el-descriptions-item label="最后登录IP" :span="2">
            {{ currentUser.lastLoginIp || '未登录' }}
          </el-descriptions-item>
          <el-descriptions-item label="创建时间" :span="2">
            {{ formatDateTime(currentUser.createdTime) }}
          </el-descriptions-item>
          <el-descriptions-item label="更新时间" :span="2">
            {{ formatDateTime(currentUser.updatedTime) }}
          </el-descriptions-item>
        </el-descriptions>

        <!-- 角色信息 -->
        <div v-if="currentUser.roleNames && currentUser.roleNames.length > 0" class="role-info">
          <h4>关联角色：</h4>
          <el-tag 
            v-for="roleName in currentUser.roleNames" 
            :key="roleName"
            style="margin-right: 8px; margin-bottom: 8px"
          >
            {{ roleName }}
          </el-tag>
        </div>

        <!-- 权限信息 -->
        <div v-if="currentUser.permissionCodes && currentUser.permissionCodes.length > 0" class="permission-info">
          <h4>拥有权限：</h4>
          <el-tag 
            v-for="permissionCode in currentUser.permissionCodes" 
            :key="permissionCode"
            style="margin-right: 8px; margin-bottom: 8px"
            type="info"
            size="small"
          >
            {{ permissionCode }}
          </el-tag>
        </div>
      </div>
    </el-dialog>

    <!-- 用户表单对话框 -->
    <el-dialog
      :title="isEdit ? '编辑用户' : '新增用户'"
      v-model="formVisible"
      width="600px"
      :append-to-body="true"
      :lock-scroll="true"
      :close-on-click-modal="false"
      @close="handleFormClose"
      @update:model-value="handleDialogUpdate"
    >
      <el-form 
        ref="formRef"
        :model="formData"
        :rules="formRules"
        label-width="100px"
      >
        <el-form-item label="用户名" prop="username">
          <el-input v-model="formData.username" placeholder="请输入用户名" @blur="checkUsername" />
        </el-form-item>
        <el-form-item label="密码" prop="password" v-if="!isEdit">
          <el-input v-model="formData.password" type="password" placeholder="请输入密码" show-password />
        </el-form-item>
        <el-form-item label="真实姓名" prop="realName">
          <el-input v-model="formData.realName" placeholder="请输入真实姓名" />
        </el-form-item>
        <el-form-item label="邮箱" prop="email">
          <el-input v-model="formData.email" placeholder="请输入邮箱" @blur="checkEmail" />
        </el-form-item>
        <el-form-item label="手机号" prop="phone">
          <el-input v-model="formData.phone" placeholder="请输入手机号" @blur="checkPhone" />
        </el-form-item>
        <el-form-item label="部门" prop="department">
          <el-input v-model="formData.department" placeholder="请输入部门" />
        </el-form-item>
        <el-form-item label="办公室" prop="office">
          <el-input v-model="formData.office" placeholder="请输入办公室" />
        </el-form-item>
          <el-form-item label="状态" prop="status">
           <el-radio-group v-model="formData.status">
             <el-radio :label="1">启用</el-radio>
             <el-radio :label="0">禁用</el-radio>
           </el-radio-group>
         </el-form-item>
        <el-form-item label="角色" prop="roleIds">
          <el-select 
            v-model="formData.roleIds" 
            multiple 
            placeholder="请选择角色"
            style="width: 100%"
          >
            <el-option 
              v-for="role in availableRoles" 
              :key="role.id" 
              :label="role.roleName" 
              :value="role.id"
            />
          </el-select>
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="handleFormClose">取消</el-button>
        <el-button type="primary" @click="submitForm" :loading="submitLoading">确定</el-button>
      </template>
    </el-dialog>

    <!-- 重置密码对话框 -->
    <el-dialog
      title="重置密码"
      v-model="passwordVisible"
      width="400px"
      :append-to-body="true"
      :lock-scroll="true"
      :close-on-click-modal="false"
    >
      <el-form 
        ref="passwordFormRef"
        :model="passwordForm"
        :rules="passwordRules"
        label-width="100px"
      >
        <el-form-item label="新密码" prop="newPassword">
          <el-input 
            v-model="passwordForm.newPassword" 
            type="password" 
            placeholder="请输入新密码" 
            show-password 
          />
        </el-form-item>
        <el-form-item label="确认密码" prop="confirmPassword">
          <el-input 
            v-model="passwordForm.confirmPassword" 
            type="password" 
            placeholder="请再次输入新密码" 
            show-password 
          />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="passwordVisible = false">取消</el-button>
        <el-button type="primary" @click="submitPasswordReset" :loading="passwordLoading">确定</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted, nextTick } from 'vue'
import { Plus } from '@element-plus/icons-vue'
import { ElMessageBox } from 'element-plus'
import { showSuccessMessage, showErrorMessage, handleApiError } from '@/utils/error-handler'
import { userAPI, roleAPI } from '../../../api'

// 搜索表单
const searchForm = reactive({
  username: '',
  realName: '',
  department: '',
  status: ''
})

// 分页信息
const pagination = reactive({
  current: 1,
  size: 10,
  total: 0
})

// 用户数据
const usersList = ref<any[]>([])
const loading = ref(false)
const selectedUsers = ref<any[]>([])
// 控制是否显示选择列
const showSelection = ref(false)

// 对话框状态
const detailVisible = ref(false)
const formVisible = ref(false)
const passwordVisible = ref(false)
const currentUser = ref<any>(null)
const isEdit = ref(false)

// 表单数据
const formRef = ref()
const submitLoading = ref(false)
const formData = reactive({
  username: '',
  password: '',
  realName: '',
  email: '',
  phone: '',
  department: '',
  office: '',
  status: undefined as number | undefined, // 不设置默认值
  roleIds: [] as string[]
})

// 表单验证规则
const formRules = {
  username: [
    { required: true, message: '请输入用户名', trigger: 'blur' },
    { min: 3, max: 20, message: '用户名长度在 3 到 20 个字符', trigger: 'blur' }
  ],
  password: [
    { required: true, message: '请输入密码', trigger: 'blur' },
    { min: 6, max: 20, message: '密码长度在 6 到 20 个字符', trigger: 'blur' }
  ],
  realName: [
    { required: true, message: '请输入真实姓名', trigger: 'blur' }
  ],
  email: [
    { type: 'email', message: '请输入正确的邮箱地址', trigger: 'blur' }
  ],
  phone: [
    { pattern: /^1[3-9]\d{9}$/, message: '请输入正确的手机号', trigger: 'blur' }
  ],
  status: [
    { 
      required: true, 
      validator: (rule: any, value: any) => {
        if (value === undefined || value === null || value === '') {
          return Promise.reject(new Error('请选择状态'))
        } else {
          return Promise.resolve()
        }
      }, 
      trigger: 'change' 
    }
  ]
}

// 密码重置表单
const passwordFormRef = ref()
const passwordLoading = ref(false)
const passwordForm = reactive({
  newPassword: '',
  confirmPassword: ''
})

// 密码验证规则
const passwordRules = {
  newPassword: [
    { required: true, message: '请输入新密码', trigger: 'blur' },
    { min: 6, max: 20, message: '密码长度在 6 到 20 个字符', trigger: 'blur' }
  ],
  confirmPassword: [
    { required: true, message: '请确认密码', trigger: 'blur' },
    {
      validator: (rule: any, value: string) => {
        if (value !== passwordForm.newPassword) {
          return Promise.reject(new Error('两次输入密码不一致'))
        } else {
          return Promise.resolve()
        }
      },
      trigger: 'blur'
    }
  ]
}

// 可用角色列表
const availableRoles = ref<any[]>([])

// 获取状态类型
const getStatusType = (status: string | number) => {
  // 统一转换为数字进行比较
  const statusNum = Number(status)
  
  switch (statusNum) {
    case 1:
      return 'success'
    case 0:
      return 'danger'
    default:
      return 'info'
  }
}

// 获取状态名称
const getStatusName = (status: string | number) => {
  // 统一转换为数字进行比较
  const statusNum = Number(status)
  
  switch (statusNum) {
    case 1:
      return '正常'
    case 0:
      return '禁用'
    default:
      return '未知'
  }
}

// 格式化日期时间
const formatDateTime = (datetime: string) => {
  if (!datetime) return ''
  return new Date(datetime).toLocaleString('zh-CN')
}

// 加载用户列表
const loadUsersList = async () => {
  loading.value = true
  try {
    const params: any = {
      page: pagination.current,
      size: pagination.size
    }

    if (searchForm.username) {
      params.username = searchForm.username
    }

    if (searchForm.realName) {
      params.realName = searchForm.realName
    }

    if (searchForm.department) {
      params.department = searchForm.department
    }

    if (searchForm.status) {
      params.status = searchForm.status
    }

    const response: any = await userAPI.getUserList(params)
    if (response && response.code === 200) {
      usersList.value = response.data.records || []
      pagination.total = response.data.total || 0
    } else {
      showErrorMessage(response, '加载用户列表失败')
    }
  } catch (error: any) {
    handleApiError(error, '加载用户列表失败')
  } finally {
    loading.value = false
  }
}

// 加载可用角色
const loadAvailableRoles = async () => {
  try {
    const response: any = await roleAPI.getActiveRoles()
    if (response && response.code === 200) {
      availableRoles.value = response.data || []
    }
  } catch (error: any) {
    console.error('加载角色列表失败:', error)
  }
}

// 搜索处理
const handleSearch = () => {
  pagination.current = 1
  loadUsersList()
}

// 重置搜索
const resetSearch = () => {
  searchForm.username = ''
  searchForm.realName = ''
  searchForm.department = ''
  searchForm.status = ''
  handleSearch()
}

// 分页处理
const handleSizeChange = (size: number) => {
  pagination.size = size
  pagination.current = 1
  loadUsersList()
}

const handleCurrentChange = (current: number) => {
  pagination.current = current
  loadUsersList()
}

// 选择变化处理
const handleSelectionChange = (selection: any[]) => {
  selectedUsers.value = selection
}

// 显示创建对话框
const showCreateDialog = () => {
  isEdit.value = false
  // 清空表单数据，状态默认为启用
  Object.assign(formData, {
    username: '',
    password: '',
    realName: '',
    email: '',
    phone: '',
    department: '',
    office: '',
    status: 1, // 默认启用
    roleIds: []
  })
  if (formRef.value) {
    formRef.value.resetFields()
  }
  currentUser.value = null
  formVisible.value = true
}

// 查看用户详情
const viewUser = async (row: any) => {
  try {
    const response: any = await userAPI.getUserDetail(row.id)
    if (response && response.code === 200) {
      currentUser.value = response.data
      detailVisible.value = true
    }
  } catch (error: any) {
    handleApiError(error, '获取用户详情失败')
  }
}

// 编辑用户
const editUser = async (row: any) => {
  isEdit.value = true
  currentUser.value = row // 设置当前编辑的用户
  
  // 确保角色列表已加载
  if (availableRoles.value.length === 0) {
    await loadAvailableRoles()
  }
  
  // 根据用户的roleCodes找到对应的角色ID
  const userRoleIds: string[] = []
  
  // 方法1：通过roleCodes匹配
  if (row.roleCodes && Array.isArray(row.roleCodes) && availableRoles.value.length > 0) {
    row.roleCodes.forEach((roleCode: string) => {
      const role = availableRoles.value.find(r => r.roleCode === roleCode)
      if (role) {
        userRoleIds.push(role.id)
      }
    })
  }
  
  // 方法2：如果roleCodes为空，尝试通过roleNames匹配
  if (userRoleIds.length === 0 && row.roleNames && Array.isArray(row.roleNames) && availableRoles.value.length > 0) {
    row.roleNames.forEach((roleName: string) => {
      const role = availableRoles.value.find(r => r.roleName === roleName)
      if (role) {
        userRoleIds.push(role.id)
      }
    })
  }
  
  // 先设置表单数据
  Object.assign(formData, {
    username: row.username,
    password: '',
    realName: row.realName,
    email: row.email || '',
    phone: row.phone || '',
    department: row.department || '',
    office: row.office || '',
    status: Number(row.status), // 确保状态是数字类型
    roleIds: userRoleIds // 设置当前用户的角色ID
  })
  
  // 打开对话框
  formVisible.value = true
  
  // 使用 nextTick 确保 DOM 更新后再设置角色
  await nextTick()
}

// 删除用户
const deleteUser = async (row: any) => {
  try {
    await ElMessageBox.confirm(
      `确定要删除用户"${row.realName}"吗？`,
      '确认删除',
      {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }
    )

    const response: any = await userAPI.deleteUser(row.id)
    if (response && response.code === 200) {
      showSuccessMessage(response, '删除用户成功')
      loadUsersList()
    } else {
      showErrorMessage(response, '删除用户失败')
    }
  } catch (error: any) {
    if (error !== 'cancel') {
      handleApiError(error, '删除用户失败')
    }
  }
}

// 批量删除用户
const batchDeleteUsers = async () => {
  if (selectedUsers.value.length === 0) {
    ElMessageBox.warning('请选择要删除的用户', '提示')
    return
  }

  try {
    await ElMessageBox.confirm(
      `确定要删除选中的 ${selectedUsers.value.length} 个用户吗？`,
      '确认批量删除',
      {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }
    )

    const ids = selectedUsers.value.map(item => item.id)
    const response: any = await userAPI.batchDeleteUser(ids)
    if (response && response.code === 200) {
      showSuccessMessage(response, '批量删除用户成功')
      selectedUsers.value = []
      showSelection.value = false // 隐藏选择列
      loadUsersList()
    } else {
      showErrorMessage(response, '批量删除用户失败')
    }
  } catch (error: any) {
    if (error !== 'cancel') {
      handleApiError(error, '批量删除用户失败')
    }
  }
}

// 开始批量删除
const startBatchDelete = () => {
  showSelection.value = true
  selectedUsers.value = [] // 清空已选中的用户
  ElMessageBox.info('请在表格中选择要批量删除的用户', '提示')
}

// 取消批量删除
const cancelBatchDelete = () => {
  showSelection.value = false
  selectedUsers.value = []
  ElMessageBox.info('已取消批量删除', '提示')
}

// 重置密码
const resetPassword = (row: any) => {
  currentUser.value = row
  passwordForm.newPassword = ''
  passwordForm.confirmPassword = ''
  passwordVisible.value = true
}

// 提交密码重置
const submitPasswordReset = async () => {
  if (!passwordFormRef.value) return
  
  try {
    await passwordFormRef.value.validate()
    passwordLoading.value = true
    
    const response: any = await userAPI.resetUserPassword(currentUser.value.id, passwordForm.newPassword)
    if (response && response.code === 200) {
      showSuccessMessage(response, '重置密码成功')
      passwordVisible.value = false
    } else {
      showErrorMessage(response, '重置密码失败')
    }
  } catch (error: any) {
    handleApiError(error, '重置密码失败，请重试')
  } finally {
    passwordLoading.value = false
  }
}

// 禁用用户
const disableUser = async (row: any) => {
  try {
    await ElMessageBox.confirm(
      `确定要禁用用户"${row.realName}"吗？`,
      '确认禁用',
      {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }
    )

    const response: any = await userAPI.updateUserStatus(row.id, 0)
    if (response && response.code === 200) {
      showSuccessMessage(response, '禁用用户成功')
      loadUsersList()
    } else {
      showErrorMessage(response, '禁用用户失败')
    }
  } catch (error: any) {
    if (error !== 'cancel') {
      handleApiError(error, '禁用用户失败')
    }
  }
}

// 启用用户
const enableUser = async (row: any) => {
  try {
    await ElMessageBox.confirm(
      `确定要启用用户"${row.realName}"吗？`,
      '确认启用',
      {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }
    )

    const response: any = await userAPI.updateUserStatus(row.id, 1)
    if (response && response.code === 200) {
      showSuccessMessage(response, '启用用户成功')
      loadUsersList()
    } else {
      showErrorMessage(response, '启用用户失败')
    }
  } catch (error: any) {
    if (error !== 'cancel') {
      handleApiError(error, '启用用户失败')
    }
  }
}

// 检查用户名
const checkUsername = async () => {
  if (!formData.username) return
  
  try {
    const excludeId = isEdit.value && currentUser.value ? currentUser.value.id : undefined
    const response: any = await userAPI.checkUsername(formData.username, excludeId)
    if (response && response.code === 200 && response.data) {
      ElMessageBox.warning('用户名已存在', '提示')
    }
  } catch (error: any) {
    console.error('检查用户名失败:', error)
  }
}

// 检查邮箱
const checkEmail = async () => {
  if (!formData.email) return
  
  try {
    const excludeId = isEdit.value && currentUser.value ? currentUser.value.id : undefined
    const response: any = await userAPI.checkEmail(formData.email, excludeId)
    if (response && response.code === 200 && !response.data) {
      ElMessageBox.warning('邮箱已存在', '提示')
    }
  } catch (error: any) {
    console.error('检查邮箱失败:', error)
  }
}

// 检查手机号
const checkPhone = async () => {
  if (!formData.phone) return
  
  try {
    const excludeId = isEdit.value && currentUser.value ? currentUser.value.id : undefined
    const response: any = await userAPI.checkPhone(formData.phone, excludeId)
    if (response && response.code === 200 && !response.data) {
      ElMessageBox.warning('手机号已存在', '提示')
    }
  } catch (error: any) {
    console.error('检查手机号失败:', error)
  }
}

// 处理表单对话框关闭
const handleFormClose = () => {
  resetForm()
  formVisible.value = false
}

// 处理对话框状态更新
const handleDialogUpdate = (val: boolean) => {
  if (!val) {
    handleFormClose()
  }
}

// 重置表单
const resetForm = () => {
  Object.assign(formData, {
    username: '',
    password: '',
    realName: '',
    email: '',
    phone: '',
    department: '',
    office: '',
    status: undefined, // 不设置默认值
    roleIds: []
  })
  if (formRef.value) {
    formRef.value.resetFields()
  }
  // 重置当前用户
  currentUser.value = null
  // 重置编辑状态
  isEdit.value = false
}

// 提交表单
const submitForm = async () => {
  if (!formRef.value) return
  
  try {
    await formRef.value.validate()
    submitLoading.value = true
    
    if (isEdit.value) {
      if (!currentUser.value || !currentUser.value.id) {
        showErrorMessage('用户信息不完整，无法更新', '操作失败')
        return
      }
      const response: any = await userAPI.updateUser(currentUser.value.id, formData)
      if (response && response.code === 200) {
        showSuccessMessage(response, '更新用户成功')
        handleFormClose()
        loadUsersList()
      } else {
        showErrorMessage(response, '更新用户失败')
      }
    } else {
      const response: any = await userAPI.createUser(formData)
      if (response && response.code === 200) {
        showSuccessMessage(response, '创建用户成功')
        handleFormClose()
        loadUsersList()
      } else {
        showErrorMessage(response, '创建用户失败')
      }
    }
  } catch (error: any) {
    handleApiError(error, '操作失败，请重试')
  } finally {
    submitLoading.value = false
  }
}

// 组件挂载时加载数据
onMounted(() => {
  loadUsersList()
  loadAvailableRoles()
})
</script>

<style scoped>
.users-management {
  padding: 3px 3px 3px 3px;
  display: flex;
  flex-direction: column;
}

.users-container {
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

.users-table {
  margin-top: 3px;
  flex: 1;
  display: flex;
  flex-direction: column;
  min-height: 0; /* 重要：允许flex子元素收缩 */
}

.users-table :deep(.el-table__footer-wrapper) {
  margin-bottom: 0;
}

.users-table :deep(.el-table__fixed-footer-wrapper) {
  margin-bottom: 0;
}

.pagination-wrapper {
  margin-top: 8px;
  margin-bottom: 0;
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-shrink: 0;
}

.pagination-wrapper :deep(.el-pagination) {
  margin-bottom: 0;
}

.user-detail {
  padding: 20px 0;
}

.role-info {
  margin-top: 20px;
  padding-top: 20px;
  border-top: 1px solid #f0f0f0;
}

.role-info h4 {
  margin-bottom: 12px;
  color: #333;
}

.permission-info {
  margin-top: 20px;
  padding-top: 20px;
  border-top: 1px solid #f0f0f0;
}

.permission-info h4 {
  margin-bottom: 12px;
  color: #333;
}
</style>