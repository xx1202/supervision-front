<template>
  <div class="roles-management">
    <div class="page-content">
      <div class="roles-container">
        <!-- 搜索和过滤区域 -->
        <div class="search-section">
          <el-form :model="searchForm" inline style="display: flex; align-items: center; justify-content: space-between;">
            <el-form-item label="角色名称">
              <el-input v-model="searchForm.roleName" placeholder="输入角色名称" @keyup.enter="handleSearch" />
            </el-form-item>
            <el-form-item label="角色代码">
              <el-input v-model="searchForm.roleCode" placeholder="输入角色代码" @keyup.enter="handleSearch" />
            </el-form-item>
            <el-form-item label="状态">
              <el-select v-model="searchForm.status" placeholder="选择状态" @change="handleSearch">
                <el-option label="全部" value="" />
                <el-option label="正常" value="active" />
                <el-option label="禁用" value="inactive" />
              </el-select>
            </el-form-item>
            <el-form-item>
              <el-button type="primary" @click="handleSearch">搜索</el-button>
              <el-button @click="resetSearch">重置</el-button>
            </el-form-item>
            <el-form-item style="margin-left: auto;">
              <el-button type="primary" @click="showCreateDialog">
                <el-icon><Plus /></el-icon>
                新增角色
              </el-button>
            </el-form-item>
          </el-form>
        </div>
        
        <div class="roles-table">
          <el-table 
            :data="rolesList" 
            style="width: 100%" 
            height="100%"
            v-loading="loading"
            fit
            table-layout="fixed"
            border 
            @selection-change="handleSelectionChange"
          >
            <el-table-column v-if="showSelection" type="selection" width="55" />
            <el-table-column prop="roleName" label="角色名称" width="150" />
            <el-table-column prop="roleCode" label="角色代码" width="150" />
            <el-table-column prop="description" label="描述" width="200" />
            <el-table-column prop="userCount" label="用户数" width="100">
              <template #default="scope">
                {{ scope.row.userCount }}人
              </template>
            </el-table-column>
            <el-table-column prop="permissionCount" label="权限数" width="100">
              <template #default="scope">
                {{ scope.row.permissionCount }}个
              </template>
            </el-table-column>
            <el-table-column prop="status" label="状态" width="100">
              <template #default="scope">
                <el-tag :type="getStatusType(scope.row.status)">
                  {{ scope.row.statusName }}
                </el-tag>
              </template>
            </el-table-column>
            <el-table-column prop="createdTime" label="创建时间" width="160">
              <template #default="scope">
                {{ formatDateTime(scope.row.createdTime) }}
              </template>
            </el-table-column>
            <el-table-column label="操作" min-width="300" fixed="right">
              <template #default="scope">
                <el-button size="small" @click="viewRole(scope.row)">查看</el-button>
                <el-button size="small" type="primary" @click="editRole(scope.row)">编辑</el-button>
                <el-button size="small" type="warning" @click="editPermissions(scope.row)">编辑权限</el-button>
                <el-button 
                  size="small" 
                  :type="scope.row.status === 'active' ? 'danger' : 'success'"
                  @click="toggleRoleStatus(scope.row)"
                >
                  {{ scope.row.status === 'active' ? '禁用' : '启用' }}
                </el-button>
                <el-button size="small" type="danger" @click="deleteRole(scope.row)">删除</el-button>
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
                :disabled="selectedRoles.length === 0"
                @click="batchDeleteRoles"
              >
                确认删除 ({{ selectedRoles.length }})
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

    <!-- 角色详情对话框 -->
    <el-dialog
      title="角色详情"
      v-model="detailVisible"
      width="700px"
      :append-to-body="true"
      :lock-scroll="true"
      :close-on-click-modal="false"
    >
      <div v-if="currentRole" class="role-detail">
        <el-descriptions :column="2" border>
          <el-descriptions-item label="角色名称">
            {{ currentRole.roleName }}
          </el-descriptions-item>
          <el-descriptions-item label="角色代码">
            {{ currentRole.roleCode }}
          </el-descriptions-item>
          <el-descriptions-item label="状态">
            <el-tag :type="getStatusType(currentRole.status)">
              {{ currentRole.statusName }}
            </el-tag>
          </el-descriptions-item>
          <el-descriptions-item label="排序">
            {{ currentRole.sortOrder }}
          </el-descriptions-item>
          <el-descriptions-item label="用户数" :span="2">
            {{ currentRole.userCount }}人
          </el-descriptions-item>
          <el-descriptions-item label="权限数" :span="2">
            {{ currentRole.permissionCount }}个
          </el-descriptions-item>
          <el-descriptions-item label="描述" :span="2">
            {{ currentRole.description || '暂无描述' }}
          </el-descriptions-item>
          <el-descriptions-item label="创建时间" :span="2">
            {{ formatDateTime(currentRole.createdTime) }}
          </el-descriptions-item>
          <el-descriptions-item label="更新时间" :span="2">
            {{ formatDateTime(currentRole.updatedTime) }}
          </el-descriptions-item>
        </el-descriptions>

        <!-- 权限信息 -->
        <div v-if="currentRole.permissionNames && currentRole.permissionNames.length > 0" class="permission-info">
          <h4>关联权限：</h4>
          <el-tag 
            v-for="(permissionName, index) in currentRole.permissionNames" 
            :key="index"
            style="margin-right: 8px; margin-bottom: 8px"
            type="info"
            size="small"
          >
            {{ permissionName }}
          </el-tag>
        </div>
      </div>
    </el-dialog>

    <!-- 角色表单对话框 -->
    <el-dialog
      :title="isEdit ? '编辑角色' : '新增角色'"
      v-model="formVisible"
      width="500px"
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
        <el-form-item label="角色名称" prop="roleName">
          <el-input v-model="formData.roleName" placeholder="请输入角色名称" />
        </el-form-item>
        <el-form-item label="角色代码" prop="roleCode">
          <el-input v-model="formData.roleCode" placeholder="请输入角色代码" @blur="checkRoleCode" />
        </el-form-item>
        <el-form-item label="描述" prop="description">
          <el-input 
            v-model="formData.description" 
            type="textarea" 
            :rows="3"
            placeholder="请输入角色描述" 
          />
        </el-form-item>
        <el-form-item label="排序" prop="sortOrder">
          <el-input-number v-model="formData.sortOrder" :min="0" :max="999" style="width: 100%" />
        </el-form-item>
        <el-form-item label="状态" prop="status">
          <el-radio-group v-model="formData.status">
            <el-radio :label="1">启用</el-radio>
            <el-radio :label="2">禁用</el-radio>
          </el-radio-group>
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="handleFormClose">取消</el-button>
        <el-button type="primary" @click="submitForm" :loading="submitLoading">确定</el-button>
      </template>
    </el-dialog>

    <!-- 权限设置对话框 -->
    <el-dialog
      title="编辑角色权限"
      v-model="permissionVisible"
      width="800px"
      :append-to-body="true"
      :lock-scroll="true"
      :close-on-click-modal="false"
      @open="onPermissionDialogOpen"
    >
      <div v-if="currentRole" class="permission-setting">
        <div class="role-info">
          <h4>角色信息：{{ currentRole.roleName }} ({{ currentRole.roleCode }})</h4>
        </div>
        
                 <div class="permission-tree-container">
           <div class="permission-tree-header">
             <h4>权限列表：</h4>
             <div class="mode-switcher">
               <el-radio-group v-model="strictMode" @change="onModeChange" size="small">
                 <el-radio-button :label="false">
                   <el-icon><Connection /></el-icon>
                   关联模式
                 </el-radio-button>
                 <el-radio-button :label="true">
                   <el-icon><Aim /></el-icon>
                   精确模式
                 </el-radio-button>
               </el-radio-group>
               <el-tooltip 
                 :content="strictMode ? '父子节点选择独立，可精确选择最小权限' : '选择父级自动选中子级，半选中的父级不会被保存'" 
                 placement="top"
               >
                 <el-icon class="help-icon"><QuestionFilled /></el-icon>
               </el-tooltip>
             </div>
           </div>
           
           <div class="quick-actions">
             <el-button size="small" @click="expandAll">
               <el-icon><Expand /></el-icon>
               展开全部
             </el-button>
             <el-button size="small" @click="collapseAll">
               <el-icon><Fold /></el-icon>
               折叠全部
             </el-button>
             <el-button size="small" @click="selectAll">
               <el-icon><Select /></el-icon>
               全选
             </el-button>
             <el-button size="small" @click="clearAll">
               <el-icon><Delete /></el-icon>
               清空
             </el-button>
             <div class="permission-stats">
               <el-tag type="info" size="small">
                 已选择: {{ getSelectedCount() }} 个权限
               </el-tag>
               <el-tag type="success" size="small">
                 总计: {{ getTotalCount() }} 个权限
               </el-tag>
             </div>
           </div>
           <el-tree
             ref="permissionTreeRef"
             :key="`tree-${currentRole?.id || 'new'}-${strictMode}`"
             :data="permissionTreeData"
             :props="{ label: 'permissionName', children: 'children' }"
             node-key="id"
             show-checkbox
             :check-strictly="strictMode"
             default-expand-all
             :default-checked-keys="selectedPermissionIds"
           >
            <template #default="{ data }">
              <span class="permission-tree-node">
                <el-tag :type="getPermissionTypeTag(data.permissionType)" size="small">
                  {{ data.permissionTypeName }}
                </el-tag>
                <span>{{ data.permissionName }}</span>
                <span class="permission-code">({{ data.permissionCode }})</span>
              </span>
            </template>
          </el-tree>
        </div>
      </div>
      <template #footer>
        <el-button @click="permissionVisible = false">关闭</el-button>
        <el-button type="primary" @click="savePermissions" :loading="permissionLoading">保存权限</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted, nextTick } from 'vue'
import { Plus, Connection, Aim, QuestionFilled, Expand, Fold, Select, Delete } from '@element-plus/icons-vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { showSuccessMessage, showErrorMessage, handleApiError } from '@/utils/error-handler'
import { roleAPI, permissionAPI } from '../../../api'
import { logger } from '@/utils/logger'

// 搜索表单
const searchForm = reactive({
  roleName: '',
  roleCode: '',
  status: ''
})

// 分页信息
const pagination = reactive({
  current: 1,
  size: 10,
  total: 0
})

// 角色数据
const rolesList = ref<any[]>([])
const loading = ref(false)
const selectedRoles = ref<any[]>([])
// 控制是否显示选择列
const showSelection = ref(false)

// 对话框状态
const detailVisible = ref(false)
const formVisible = ref(false)
const permissionVisible = ref(false)
const currentRole = ref<any>(null)
const isEdit = ref(false)

// 表单数据
const formRef = ref()
const submitLoading = ref(false)
const formData = reactive({
  roleName: '',
  roleCode: '',
  description: '',
  sortOrder: 0,
  status: undefined as number | undefined
})

// 表单验证规则
const formRules = {
  roleName: [
    { required: true, message: '请输入角色名称', trigger: 'blur' }
  ],
  roleCode: [
    { required: true, message: '请输入角色代码', trigger: 'blur' },
    { pattern: /^[A-Z_]+$/, message: '角色代码只能包含大写字母和下划线', trigger: 'blur' }
  ],
  status: [
    { required: true, message: '请选择状态', trigger: 'change' }
  ]
}

// 权限相关
const permissionTreeRef = ref()
const permissionTreeData = ref<any[]>([])
const selectedPermissionIds = ref<string[]>([])
const permissionLoading = ref(false)
const strictMode = ref(false) // 精确模式开关

// 获取状态类型
const getStatusType = (status: string) => {
  switch (status) {
    case 'active':
      return 'success'
    case 'inactive':
      return 'danger'
    default:
      return 'info'
  }
}

// 获取权限类型标签
const getPermissionTypeTag = (type: number) => {
  switch (type) {
    case 1:
      return 'primary' // 菜单
    case 2:
      return 'warning' // 按钮
    case 3:
      return 'info' // 接口
    default:
      return 'info'
  }
}

// 格式化日期时间
const formatDateTime = (datetime: string) => {
  if (!datetime) return ''
  return new Date(datetime).toLocaleString('zh-CN')
}

// 加载角色列表
const loadRolesList = async () => {
  loading.value = true
  try {
    const params: any = {
      page: pagination.current,
      size: pagination.size
    }

    if (searchForm.roleName) {
      params.roleName = searchForm.roleName
    }

    if (searchForm.roleCode) {
      params.roleCode = searchForm.roleCode
    }

    if (searchForm.status) {
      params.status = searchForm.status
    }

    const response: any = await roleAPI.getRoleList(params)
    if (response && response.code === 200) {
      rolesList.value = response.data.records || []
      pagination.total = response.data.total || 0
    }
  } catch (error: any) {
    handleApiError(error, '加载角色列表失败')
  } finally {
    loading.value = false
  }
}

// 加载权限树
const loadPermissionTree = async () => {
  try {
    const response: any = await permissionAPI.getPermissionTree()
    if (response && response.code === 200) {
      permissionTreeData.value = response.data || []
    }
  } catch (error: any) {
    handleApiError(error, '加载权限树失败')
  }
}

// 搜索处理
const handleSearch = () => {
  pagination.current = 1
  loadRolesList()
}

// 重置搜索
const resetSearch = () => {
  searchForm.roleName = ''
  searchForm.roleCode = ''
  searchForm.status = ''
  handleSearch()
}

// 分页处理
const handleSizeChange = (size: number) => {
  pagination.size = size
  pagination.current = 1
  loadRolesList()
}

const handleCurrentChange = (current: number) => {
  pagination.current = current
  loadRolesList()
}

// 选择变化处理
const handleSelectionChange = (selection: any[]) => {
  selectedRoles.value = selection
}

// 显示创建对话框
const showCreateDialog = () => {
  isEdit.value = false
  // 清空表单数据，状态默认为启用
  Object.assign(formData, {
    roleName: '',
    roleCode: '',
    description: '',
    sortOrder: 0,
    status: 1 // 默认启用
  })
  if (formRef.value) {
    formRef.value.resetFields()
  }
  formVisible.value = true
}

// 查看角色详情
const viewRole = async (row: any) => {
  try {
    const response: any = await roleAPI.getRoleDetail(row.id)
    if (response && response.code === 200) {
      currentRole.value = response.data
      detailVisible.value = true
    }
  } catch (error: any) {
    handleApiError(error, '获取角色详情失败')
  }
}

// 编辑角色
const editRole = (row: any) => {
  isEdit.value = true
  currentRole.value = row // 设置当前编辑的角色
  Object.assign(formData, {
    roleName: row.roleName,
    roleCode: row.roleCode,
    description: row.description || '',
    sortOrder: row.sortOrder || 0,
    status: row.status === 'active' ? 1 : 2
  })
  formVisible.value = true
}

// 删除角色
const deleteRole = async (row: any) => {
  try {
    await ElMessageBox.confirm(
      `确定要删除角色"${row.roleName}"吗？`,
      '确认删除',
      {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }
    )

    const response: any = await roleAPI.deleteRole(row.id)
    if (response && response.code === 200) {
      showSuccessMessage(response, '删除角色成功')
      loadRolesList()
    } else {
      showErrorMessage(response, '删除角色失败')
    }
  } catch (error: any) {
    if (error !== 'cancel') {
      handleApiError(error, '删除角色失败')
    }
  }
}

// 批量删除角色
const batchDeleteRoles = async () => {
  if (selectedRoles.value.length === 0) {
    ElMessage.warning('请选择要删除的角色')
    return
  }

  try {
    await ElMessageBox.confirm(
      `确定要删除选中的 ${selectedRoles.value.length} 个角色吗？`,
      '确认批量删除',
      {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }
    )

    const ids = selectedRoles.value.map(item => item.id)
    const response: any = await roleAPI.batchDeleteRole(ids)
    if (response && response.code === 200) {
      showSuccessMessage(response, '批量删除角色成功')
      selectedRoles.value = []
      showSelection.value = false // 隐藏选择列
      loadRolesList()
    } else {
      showErrorMessage(response, '批量删除角色失败')
    }
  } catch (error: any) {
    if (error !== 'cancel') {
      handleApiError(error, '批量删除角色失败')
    }
  }
}

// 编辑权限
const editPermissions = async (row: any) => {
  currentRole.value = row
  await loadPermissionTree()
  
  // 获取角色权限
  try {
    const response: any = await roleAPI.getRolePermissions(row.id)
    if (response && response.code === 200) {
      // 接口直接返回权限ID数组
      selectedPermissionIds.value = response.data || []
      logger.debug('角色权限数据:', response.data)
      logger.debug('选中的权限ID:', selectedPermissionIds.value)
    }
  } catch (error: any) {
    console.error('获取角色权限失败:', error)
    // 如果专门的权限接口不存在，回退到使用角色详情接口
    try {
      const detailResponse: any = await roleAPI.getRoleDetail(row.id)
      if (detailResponse && detailResponse.code === 200) {
        const roleDetail = detailResponse.data
        selectedPermissionIds.value = roleDetail.permissionCodes || []
        logger.debug('使用角色详情获取权限:', roleDetail)
      }
    } catch (detailError: any) {
      console.error('获取角色详情失败:', detailError)
    }
  }
  
  // 先设置数据，再打开对话框
  permissionVisible.value = true
}

// 权限对话框打开时的处理
const onPermissionDialogOpen = () => {
  logger.debug('权限对话框打开，准备设置选中状态')
  logger.debug('当前选中的权限ID:', selectedPermissionIds.value)
  // 对话框打开后，设置权限树的选中状态
  setTimeout(() => {
    if (permissionTreeRef.value && selectedPermissionIds.value.length > 0) {
      logger.debug('设置权限树选中状态:', selectedPermissionIds.value)
      permissionTreeRef.value.setCheckedKeys(selectedPermissionIds.value)
    } else {
      logger.debug('权限树引用不存在或没有选中的权限ID')
    }
  }, 50)
}

// 模式切换处理
const onModeChange = () => {
  // 模式切换时重新设置选中状态
  setTimeout(() => {
    if (permissionTreeRef.value && selectedPermissionIds.value.length > 0) {
      permissionTreeRef.value.setCheckedKeys(selectedPermissionIds.value)
    }
  }, 100)
}

// 快速操作方法
const expandAll = () => {
  if (permissionTreeRef.value) {
    permissionTreeRef.value.expandAll()
  }
}

const collapseAll = () => {
  if (permissionTreeRef.value) {
    permissionTreeRef.value.collapseAll()
  }
}

const selectAll = () => {
  if (permissionTreeRef.value) {
    const allKeys = getAllPermissionKeys(permissionTreeData.value)
    permissionTreeRef.value.setCheckedKeys(allKeys)
  }
}

const clearAll = () => {
  if (permissionTreeRef.value) {
    permissionTreeRef.value.setCheckedKeys([])
  }
}

// 获取所有权限节点的key
const getAllPermissionKeys = (nodes: any[]): string[] => {
  const keys: string[] = []
  const traverse = (nodeList: any[]) => {
    nodeList.forEach(node => {
      keys.push(node.id)
      if (node.children && node.children.length > 0) {
        traverse(node.children)
      }
    })
  }
  traverse(nodes)
  return keys
}

// 获取已选择的权限数量
const getSelectedCount = () => {
  if (!permissionTreeRef.value) return 0
  // 只统计完全选中的权限，不包含半选中的
  const checkedKeys = permissionTreeRef.value.getCheckedKeys()
  return checkedKeys.length
}

// 获取总权限数量
const getTotalCount = () => {
  return getAllPermissionKeys(permissionTreeData.value).length
}

// 智能处理关联模式下的权限选择
const getSmartSelectedPermissions = () => {
  if (!permissionTreeRef.value) return []
  
  const checkedKeys = permissionTreeRef.value.getCheckedKeys()
  const halfCheckedKeys = permissionTreeRef.value.getHalfCheckedKeys()
  
  if (strictMode.value) {
    // 精确模式：只返回完全选中的节点
    return checkedKeys
  } else {
    // 关联模式：只保存完全选中的节点，忽略半选中的节点
    // 这样用户可以精确控制权限，半选中的父级不会被保存
    return checkedKeys
  }
}

// 根据ID查找节点
const findNodeById = (nodes: any[], id: string): any => {
  for (const node of nodes) {
    if (node.id === id) {
      return node
    }
    if (node.children) {
      const found = findNodeById(node.children, id)
      if (found) return found
    }
  }
  return null
}

// 保存权限
const savePermissions = async () => {
  if (!permissionTreeRef.value || !currentRole.value) return
  
  try {
    permissionLoading.value = true
    
    // 获取当前选择状态
    const checkedKeys = permissionTreeRef.value.getCheckedKeys()
    const halfCheckedKeys = permissionTreeRef.value.getHalfCheckedKeys()
    
    // 使用智能处理方法获取权限
    const allSelectedKeys = getSmartSelectedPermissions()
    
    logger.debug('=== 权限保存详情 ===')
    logger.debug('当前模式:', strictMode.value ? '精确模式' : '关联模式')
    logger.debug('完全选中的权限:', checkedKeys)
    logger.debug('半选中的权限:', halfCheckedKeys)
    logger.debug('最终保存的权限:', allSelectedKeys)
    logger.debug('==================')
    
    // 调用API保存角色权限
    const response: any = await roleAPI.updateRolePermissions(currentRole.value.id, allSelectedKeys)
    if (response && response.code === 200) {
      showSuccessMessage(response, '角色权限更新成功')
      permissionVisible.value = false
      loadRolesList() // 重新加载角色列表以更新权限数量显示
    } else {
      showErrorMessage(response, '更新角色权限失败')
    }
  } catch (error: any) {
    handleApiError(error, '更新角色权限失败')
  } finally {
    permissionLoading.value = false
  }
}

// 切换角色状态
const toggleRoleStatus = async (row: any) => {
  try {
    const action = row.status === 'active' ? '禁用' : '启用'
    await ElMessageBox.confirm(
      `确定要${action}角色"${row.roleName}"吗？`,
      `确认${action}`,
      {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }
    )

    const newStatus = row.status === 'active' ? 2 : 1
    const response: any = await roleAPI.updateRoleStatus(row.id, newStatus)
    if (response && response.code === 200) {
      showSuccessMessage(response, `${action}角色成功`)
      loadRolesList()
    } else {
      showErrorMessage(response, `${action}角色失败`)
    }
  } catch (error: any) {
    if (error !== 'cancel') {
      handleApiError(error, '操作失败')
    }
  }
}

// 检查角色代码
const checkRoleCode = async () => {
  if (!formData.roleCode) return
  
  try {
    const excludeId = isEdit.value ? currentRole.value?.id : undefined
    const response: any = await roleAPI.checkRoleCode(formData.roleCode, excludeId)
    if (response && response.code === 200 && !response.data) {
      ElMessage.warning('角色代码已存在')
    }
  } catch (error: any) {
    console.error('检查角色代码失败:', error)
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
    roleName: '',
    roleCode: '',
    description: '',
    sortOrder: 0,
    status: undefined // 不设置默认值
  })
  if (formRef.value) {
    formRef.value.resetFields()
  }
  // 重置当前角色
  currentRole.value = null
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
      if (!currentRole.value || !currentRole.value.id) {
        showErrorMessage('角色信息不完整，无法更新', '操作失败')
        return
      }
      const response: any = await roleAPI.updateRole(currentRole.value.id, formData)
      if (response && response.code === 200) {
        showSuccessMessage(response, '更新角色成功')
        handleFormClose()
        loadRolesList()
      } else {
        showErrorMessage(response, '更新角色失败')
      }
    } else {
      const response: any = await roleAPI.createRole(formData)
      if (response && response.code === 200) {
        showSuccessMessage(response, '创建角色成功')
        handleFormClose()
        loadRolesList()
      } else {
        showErrorMessage(response, '创建角色失败')
      }
    }
  } catch (error: any) {
    handleApiError(error, '操作失败，请重试')
  } finally {
    submitLoading.value = false
  }
}

// 开始批量删除
const startBatchDelete = () => {
  showSelection.value = true
  ElMessage.success('已开启批量删除模式')
}

// 取消批量删除
const cancelBatchDelete = () => {
  showSelection.value = false
  selectedRoles.value = []
  ElMessage.info('已取消批量删除模式')
}

// 组件挂载时加载数据
onMounted(() => {
  loadRolesList()
})
</script>

<style scoped>
.roles-management {
  padding: 3px 3px 3px 3px;
  display: flex;
  flex-direction: column;
}

.roles-container {
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

.roles-table {
  margin-top: 3px;
  flex: 1;
  display: flex;
  flex-direction: column;
  min-height: 0; /* 重要：允许flex子元素收缩 */
}

.roles-table :deep(.el-table__footer-wrapper) {
  margin-bottom: 0;
}

.roles-table :deep(.el-table__fixed-footer-wrapper) {
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

.role-detail {
  padding: 20px 0;
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

.permission-setting {
  padding: 20px 0;
}

.role-info {
  margin-bottom: 20px;
  padding-bottom: 15px;
  border-bottom: 1px solid #f0f0f0;
}

.role-info h4 {
  margin: 0;
  color: #333;
}

.permission-tree-container {
  max-height: 400px;
  overflow-y: auto;
}

.permission-tree-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 15px;
}

.permission-tree-header h4 {
  margin: 0;
  color: #333;
}

.mode-switcher {
  display: flex;
  align-items: center;
  gap: 8px;
}

.help-icon {
  color: #909399;
  cursor: help;
  font-size: 16px;
}

.help-icon:hover {
  color: #409eff;
}

.quick-actions {
  margin-bottom: 15px;
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
  align-items: center;
}

.permission-stats {
  margin-left: auto;
  display: flex;
  gap: 8px;
}

.permission-tree-container h4 {
  margin-bottom: 15px;
  color: #333;
}

.permission-tree-node {
  display: flex;
  align-items: center;
  gap: 8px;
}

.permission-code {
  color: #999;
  font-size: 12px;
}
</style> 