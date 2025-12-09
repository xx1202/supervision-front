<template>
  <div class="permissions-management">
    <div class="page-content">
      <div class="permissions-container">
        <!-- 搜索和过滤区域 -->
        <div class="search-section">
          <el-form :model="searchForm" inline style="display: flex; align-items: center; justify-content: space-between;">
            <el-form-item label="权限名称">
              <el-input v-model="searchForm.permissionName" placeholder="输入权限名称" @keyup.enter="handleSearch" />
            </el-form-item>
            <el-form-item label="权限代码">
              <el-input v-model="searchForm.permissionCode" placeholder="输入权限代码" @keyup.enter="handleSearch" />
            </el-form-item>
            <el-form-item label="权限类型">
              <el-select v-model="searchForm.permissionType" placeholder="选择权限类型" @change="handleSearch">
                <el-option label="全部" value="" />
                <el-option label="菜单" :value="1" />
                <el-option label="按钮" :value="2" />
                <el-option label="接口" :value="3" />
              </el-select>
            </el-form-item>
            <el-form-item label="状态">
              <el-select v-model="searchForm.status" placeholder="选择状态" @change="handleSearch">
                <el-option label="全部" value="" />
                <el-option label="正常" :value="1" />
                <el-option label="禁用" :value="2" />
              </el-select>
            </el-form-item>
            <el-form-item>
              <el-button type="primary" @click="handleSearch">搜索</el-button>
              <el-button @click="resetSearch">重置</el-button>
            </el-form-item>
            <el-form-item style="margin-left: auto;">
              <el-button type="primary" @click="showCreateDialog">
                <el-icon><Plus /></el-icon>
                新增权限
              </el-button>
              <el-button @click="showPermissionTree">
                <el-icon><Share /></el-icon>
                权限树
              </el-button>
            </el-form-item>
          </el-form>
        </div>
        
        <div class="permissions-table">
          <el-table 
            :data="permissionsList" 
            style="width: 100%" 
            height="100%"
            v-loading="loading"
            fit
            table-layout="fixed"
            border 
            @selection-change="handleSelectionChange"
          >
            <el-table-column v-if="showSelection" type="selection" width="55" />
            <el-table-column prop="permissionName" label="权限名称" width="150" />
            <el-table-column prop="permissionCode" label="权限代码" width="150" />
            <el-table-column prop="permissionType" label="权限类型" width="100">
              <template #default="scope">
                <el-tag :type="getPermissionTypeTag(scope.row.permissionType)">
                  {{ scope.row.permissionTypeName }}
                </el-tag>
              </template>
            </el-table-column>
            <el-table-column prop="path" label="路径" width="150" />
            <el-table-column prop="component" label="组件" width="120" />
            <el-table-column prop="roleCount" label="角色数" width="100">
              <template #default="scope">
                {{ scope.row.roleCount }}个
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
            <el-table-column label="操作" min-width="250" fixed="right">
              <template #default="scope">
                <el-button size="small" @click="viewPermission(scope.row)">查看</el-button>
                <el-button size="small" type="primary" @click="editPermission(scope.row)">编辑</el-button>
                <el-button 
                  size="small" 
                  :type="scope.row.status === 'active' ? 'danger' : 'success'"
                  @click="togglePermissionStatus(scope.row)"
                >
                  {{ scope.row.status === 'active' ? '禁用' : '启用' }}
                </el-button>
                <el-button size="small" type="danger" @click="deletePermission(scope.row)">删除</el-button>
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
                :disabled="selectedPermissions.length === 0"
                @click="batchDeletePermissions"
              >
                确认删除 ({{ selectedPermissions.length }})
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

    <!-- 权限详情对话框 -->
    <el-dialog
      title="权限详情"
      v-model="detailVisible"
      width="700px"
      :append-to-body="true"
      :lock-scroll="true"
      :close-on-click-modal="false"
    >
      <div v-if="currentPermission" class="permission-detail">
        <el-descriptions :column="2" border>
          <el-descriptions-item label="权限名称">
            {{ currentPermission.permissionName }}
          </el-descriptions-item>
          <el-descriptions-item label="权限代码">
            {{ currentPermission.permissionCode }}
          </el-descriptions-item>
          <el-descriptions-item label="权限类型">
            <el-tag :type="getPermissionTypeTag(currentPermission.permissionType)">
              {{ currentPermission.permissionTypeName }}
            </el-tag>
          </el-descriptions-item>
          <el-descriptions-item label="状态">
            <el-tag :type="getStatusType(currentPermission.status)">
              {{ currentPermission.statusName }}
            </el-tag>
          </el-descriptions-item>
          <el-descriptions-item label="路径" :span="2">
            {{ currentPermission.path || '未设置' }}
          </el-descriptions-item>
          <el-descriptions-item label="组件" :span="2">
            {{ currentPermission.component || '未设置' }}
          </el-descriptions-item>
          <el-descriptions-item label="图标" :span="2">
            {{ currentPermission.icon || '未设置' }}
          </el-descriptions-item>
          <el-descriptions-item label="排序" :span="2">
            {{ currentPermission.sortOrder }}
          </el-descriptions-item>
          <el-descriptions-item label="角色数" :span="2">
            {{ currentPermission.roleCount }}个
          </el-descriptions-item>
          <el-descriptions-item label="创建时间" :span="2">
            {{ formatDateTime(currentPermission.createdTime) }}
          </el-descriptions-item>
          <el-descriptions-item label="更新时间" :span="2">
            {{ formatDateTime(currentPermission.updatedTime) }}
          </el-descriptions-item>
        </el-descriptions>

        <!-- 角色信息 -->
        <div v-if="currentPermission.roleCodes && currentPermission.roleCodes.length > 0" class="role-info">
          <h4>关联角色：</h4>
          <el-tag 
            v-for="(roleName, index) in currentPermission.roleNames" 
            :key="index"
            style="margin-right: 8px; margin-bottom: 8px"
          >
            {{ roleName }}
          </el-tag>
        </div>

        <!-- 子权限 -->
        <div v-if="currentPermission.children && currentPermission.children.length > 0" class="children-info">
          <h4>子权限：</h4>
          <el-table :data="currentPermission.children" border style="width: 100%">
            <el-table-column prop="permissionName" label="权限名称" />
            <el-table-column prop="permissionCode" label="权限代码" />
            <el-table-column prop="permissionTypeName" label="权限类型" />
          </el-table>
        </div>
      </div>
    </el-dialog>

    <!-- 权限表单对话框 -->
    <el-dialog
      :title="isEdit ? '编辑权限' : '新增权限'"
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
        <el-form-item label="父权限">
          <div class="parent-permission-selector">
                         <el-input
               v-model="selectedParentName"
               :placeholder="isEdit ? '选择父权限（已排除当前权限及其子权限）' : '选择父权限'"
               readonly
               @click="showParentSelector = true"
               style="width: 100%"
             >
               <template #append>
                 <el-button @click="showParentSelector = true">
                   <el-icon><ArrowDown /></el-icon>
                 </el-button>
                 <el-button v-if="selectedParentName" @click="clearParentPermission">
                   <el-icon><Close /></el-icon>
                 </el-button>
               </template>
             </el-input>
            
            <!-- 父权限选择对话框 -->
            <el-dialog
              title="选择父权限"
              v-model="showParentSelector"
              width="500px"
              :append-to-body="true"
              :lock-scroll="true"
              :close-on-click-modal="false"
            >
                             <div class="parent-permission-tree">
                 <!-- 无父权限选项 -->
                 <div 
                   class="no-parent-option"
                   :class="{ 'selected': tempSelectedParent?.id === 'no-parent' }"
                   @click="handleParentSelect({ id: 'no-parent', permissionName: '无父权限（顶级权限）' })"
                 >
                   <el-icon style="color: #909399; margin-right: 8px;">
                     <FolderOpened />
                   </el-icon>
                   <span>无父权限（顶级权限）</span>
                   <el-icon v-if="tempSelectedParent?.id === 'no-parent'" style="color: #409eff; margin-left: 8px;">
                     <Check />
                   </el-icon>
                 </div>
                 
                 <el-divider content-position="left">选择现有权限作为父级</el-divider>
                 
                 <el-tree
                   :data="isEdit ? filteredPermissionTreeData : permissionTreeData"
                   :props="{ label: 'permissionName', children: 'children' }"
                   node-key="id"
                   :highlight-current="true"
                   :current-node-key="tempSelectedParent?.id"
                   @node-click="handleParentSelect"
                   default-expand-all
                 >
                   <template #default="{ data }">
                     <span class="custom-tree-node" @click.stop="handleParentSelect(data)">
                       <el-tag :type="getPermissionTypeTag(data.permissionType)" size="small">
                         {{ data.permissionTypeName }}
                       </el-tag>
                       <span>{{ data.permissionName }}</span>
                       <span class="permission-code">({{ data.permissionCode }})</span>
                       <el-icon v-if="tempSelectedParent?.id === data.id" style="color: #409eff; margin-left: 8px;">
                         <Check />
                       </el-icon>
                     </span>
                   </template>
                 </el-tree>
               </div>
              <div v-if="isEdit" style="font-size: 12px; color: #999; margin-top: 8px;">
                注意：编辑时已自动排除当前权限及其子权限，避免循环引用
              </div>
                             <template #footer>
                 <el-button @click="cancelParentSelect">取消</el-button>
                 <el-button type="primary" @click="confirmParentSelect" :disabled="!tempSelectedParent">确定</el-button>
               </template>
            </el-dialog>
          </div>
        </el-form-item>
        <el-form-item label="权限名称" prop="permissionName">
          <el-input v-model="formData.permissionName" placeholder="请输入权限名称" />
        </el-form-item>
        <el-form-item label="权限代码" prop="permissionCode">
          <el-input v-model="formData.permissionCode" placeholder="请输入权限代码" @blur="checkPermissionCode" />
        </el-form-item>
        <el-form-item label="权限类型" prop="permissionType">
          <el-select v-model="formData.permissionType" placeholder="请选择权限类型" style="width: 100%">
            <el-option label="菜单" :value="1" />
            <el-option label="按钮" :value="2" />
            <el-option label="接口" :value="3" />
          </el-select>
        </el-form-item>
        <el-form-item label="路径" prop="path">
          <el-input v-model="formData.path" placeholder="请输入路径" />
        </el-form-item>
        <el-form-item label="组件" prop="component">
          <el-input v-model="formData.component" placeholder="请输入组件名称" />
        </el-form-item>
        <el-form-item label="图标" prop="icon">
          <el-input v-model="formData.icon" placeholder="请输入图标名称" />
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

    <!-- 权限树对话框 -->
    <el-dialog
      title="权限树"
      v-model="treeVisible"
      width="800px"
      :append-to-body="true"
      :lock-scroll="true"
      :close-on-click-modal="false"
    >
      <div class="permission-tree">
        <el-tree
          :data="permissionTreeData"
          :props="{ label: 'permissionName', children: 'children' }"
          node-key="id"
          default-expand-all
        >
          <template #default="{ data }">
            <span class="custom-tree-node">
              <el-tag :type="getPermissionTypeTag(data.permissionType)" size="small">
                {{ data.permissionTypeName }}
              </el-tag>
              <span>{{ data.permissionName }}</span>
              <span class="permission-code">({{ data.permissionCode }})</span>
            </span>
          </template>
        </el-tree>
      </div>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { Plus, Share, ArrowDown, Check, Close, FolderOpened } from '@element-plus/icons-vue'
import { ElMessageBox } from 'element-plus'
import { showSuccessMessage, showErrorMessage, handleApiError } from '@/utils/error-handler'
import { permissionAPI } from '../../../api'

// 搜索表单
const searchForm = reactive({
  permissionName: '',
  permissionCode: '',
  permissionType: '',
  status: ''
})

// 分页信息
const pagination = reactive({
  current: 1,
  size: 10,
  total: 0
})

// 权限数据
const permissionsList = ref<any[]>([])
const loading = ref(false)
const selectedPermissions = ref<any[]>([])
// 控制是否显示选择列
const showSelection = ref(false)

// 对话框状态
const detailVisible = ref(false)
const formVisible = ref(false)
const treeVisible = ref(false)
const currentPermission = ref<any>(null)
const isEdit = ref(false)

// 表单数据
const formRef = ref()
const submitLoading = ref(false)
const formData = reactive({
  parentId: '' as string | undefined,
  permissionName: '',
  permissionCode: '',
  permissionType: 1,
  path: '',
  component: '',
  icon: '',
  sortOrder: 0,
  status: undefined as number | undefined
})

// 表单验证规则
const formRules = {
  permissionName: [
    { required: true, message: '请输入权限名称', trigger: 'blur' }
  ],
  permissionCode: [
    { required: true, message: '请输入权限代码', trigger: 'blur' },
    { pattern: /^[A-Z_]+$/, message: '权限代码只能包含大写字母和下划线', trigger: 'blur' }
  ],
  permissionType: [
    { required: true, message: '请选择权限类型', trigger: 'change' }
  ],
  status: [
    { required: true, message: '请选择状态', trigger: 'change' }
  ]
}

// 权限树数据
const permissionTreeData = ref<any[]>([])
const filteredPermissionTreeData = ref<any[]>([])

// 父权限选择相关
const showParentSelector = ref(false)
const selectedParentName = ref('')
const tempSelectedParent = ref<any>(null)

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

// 加载权限列表
const loadPermissionsList = async () => {
  loading.value = true
  try {
    const params: any = {
      page: pagination.current,
      size: pagination.size
    }

    if (searchForm.permissionName) {
      params.permissionName = searchForm.permissionName
    }

    if (searchForm.permissionCode) {
      params.permissionCode = searchForm.permissionCode
    }

    if (searchForm.permissionType) {
      params.permissionType = searchForm.permissionType
    }

    if (searchForm.status) {
      params.status = searchForm.status
    }

    const response: any = await permissionAPI.getPermissionList(params)
    if (response && response.code === 200) {
      permissionsList.value = response.data.records || []
      pagination.total = response.data.total || 0
    }
  } catch (error: any) {
    handleApiError(error, '加载权限列表失败')
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

// 过滤权限树，移除指定权限及其子权限
const filterPermissionTree = (treeData: any[], excludeId: string): any[] => {
  return treeData.filter(node => {
    if (node.id === excludeId) {
      return false // 排除当前权限
    }
    
    // 递归过滤子权限
    if (node.children && node.children.length > 0) {
      node.children = filterPermissionTree(node.children, excludeId)
    }
    
    return true
  })
}

// 搜索处理
const handleSearch = () => {
  pagination.current = 1
  loadPermissionsList()
}

// 重置搜索
const resetSearch = () => {
  searchForm.permissionName = ''
  searchForm.permissionCode = ''
  searchForm.permissionType = ''
  searchForm.status = ''
  handleSearch()
}

// 分页处理
const handleSizeChange = (size: number) => {
  pagination.size = size
  pagination.current = 1
  loadPermissionsList()
}

const handleCurrentChange = (current: number) => {
  pagination.current = current
  loadPermissionsList()
}

// 选择变化处理
const handleSelectionChange = (selection: any[]) => {
  selectedPermissions.value = selection
}

// 显示创建对话框
const showCreateDialog = async () => {
  isEdit.value = false
  
  // 确保权限树数据已加载
  if (permissionTreeData.value.length === 0) {
    await loadPermissionTree()
  }
  
  // 重置过滤后的数据为完整数据
  filteredPermissionTreeData.value = permissionTreeData.value
  
  // 清空表单数据，状态默认为启用
  Object.assign(formData, {
    parentId: '',
    permissionName: '',
    permissionCode: '',
    permissionType: 1,
    path: '',
    component: '',
    icon: '',
    sortOrder: 0,
    status: 1 // 默认启用
  })
  
  // 重置父权限选择
  selectedParentName.value = ''
  tempSelectedParent.value = null
  
  if (formRef.value) {
    formRef.value.resetFields()
  }
  formVisible.value = true
}

// 显示权限树
const showPermissionTree = async () => {
  if (permissionTreeData.value.length === 0) {
    await loadPermissionTree()
  }
  treeVisible.value = true
}

// 查看权限详情
const viewPermission = async (row: any) => {
  try {
    const response: any = await permissionAPI.getPermissionDetail(row.id)
    if (response && response.code === 200) {
      currentPermission.value = response.data
      detailVisible.value = true
    }
  } catch (error: any) {
    handleApiError(error, '获取权限详情失败')
  }
}

// 编辑权限
const editPermission = async (row: any) => {
  isEdit.value = true
  currentPermission.value = row // 设置当前编辑的权限
  
  // 确保权限树数据已加载
  if (permissionTreeData.value.length === 0) {
    await loadPermissionTree()
  }
  
  // 过滤掉当前权限及其子权限，避免循环引用
  filteredPermissionTreeData.value = filterPermissionTree(permissionTreeData.value, row.id)
  
  Object.assign(formData, {
    parentId: row.parentId && row.parentId.trim() !== '' ? row.parentId : undefined,
    permissionName: row.permissionName,
    permissionCode: row.permissionCode,
    permissionType: row.permissionType,
    path: row.path || '',
    component: row.component || '',
    icon: row.icon || '',
    sortOrder: row.sortOrder || 0,
    status: row.status === 'active' ? 1 : 2
  })
  
  // 设置父权限名称和临时选择
  if (row.parentId && row.parentId.trim() !== '') {
    selectedParentName.value = row.parentName || ''
    // 在过滤后的树中查找父权限
    const findParentInTree = (tree: any[], parentId: string): any => {
      for (const node of tree) {
        if (node.id === parentId) {
          return node
        }
        if (node.children && node.children.length > 0) {
          const found = findParentInTree(node.children, parentId)
          if (found) return found
        }
      }
      return null
    }
    tempSelectedParent.value = findParentInTree(filteredPermissionTreeData.value, row.parentId)
  } else {
    selectedParentName.value = '无父权限（顶级权限）'
    tempSelectedParent.value = { id: 'no-parent', permissionName: '无父权限（顶级权限）' }
  }
  
  formVisible.value = true
}

// 删除权限
const deletePermission = async (row: any) => {
  try {
    await ElMessageBox.confirm(
      `确定要删除权限"${row.permissionName}"吗？`,
      '确认删除',
      {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }
    )

    const response: any = await permissionAPI.deletePermission(row.id)
    if (response && response.code === 200) {
      showSuccessMessage(response, '删除权限成功')
      // 重新加载权限列表和权限树
      await Promise.all([
        loadPermissionsList(),
        loadPermissionTree()
      ])
    } else {
      showErrorMessage(response, '删除权限失败')
    }
  } catch (error: any) {
    if (error !== 'cancel') {
      handleApiError(error, '删除权限失败')
    }
  }
}

// 批量删除权限
const batchDeletePermissions = async () => {
  if (selectedPermissions.value.length === 0) {
    ElMessageBox.warning('请选择要删除的权限', '提示')
    return
  }

  try {
    await ElMessageBox.confirm(
      `确定要删除选中的 ${selectedPermissions.value.length} 个权限吗？`,
      '确认批量删除',
      {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }
    )

    const ids = selectedPermissions.value.map(item => item.id)
    const response: any = await permissionAPI.batchDeletePermission(ids)
    if (response && response.code === 200) {
      showSuccessMessage(response, '批量删除权限成功')
      selectedPermissions.value = []
      showSelection.value = false // 隐藏选择列
      // 重新加载权限列表和权限树
      await Promise.all([
        loadPermissionsList(),
        loadPermissionTree()
      ])
    } else {
      showErrorMessage(response, '批量删除权限失败')
    }
  } catch (error: any) {
    if (error !== 'cancel') {
      handleApiError(error, '批量删除权限失败')
    }
  }
}

// 切换权限状态
const togglePermissionStatus = async (row: any) => {
  try {
    const action = row.status === 'active' ? '禁用' : '启用'
    await ElMessageBox.confirm(
      `确定要${action}权限"${row.permissionName}"吗？`,
      `确认${action}`,
      {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }
    )

    const newStatus = row.status === 'active' ? 2 : 1
    const response: any = await permissionAPI.updatePermissionStatus(row.id, newStatus)
    if (response && response.code === 200) {
      showSuccessMessage(response, `${action}权限成功`)
      // 重新加载权限列表和权限树
      await Promise.all([
        loadPermissionsList(),
        loadPermissionTree()
      ])
    } else {
      showErrorMessage(response, `${action}权限失败`)
    }
  } catch (error: any) {
    if (error !== 'cancel') {
      handleApiError(error, '操作失败')
    }
  }
}

// 检查权限代码
const checkPermissionCode = async () => {
  if (!formData.permissionCode) return
  
  try {
    const excludeId = isEdit.value ? currentPermission.value?.id : undefined
    const response: any = await permissionAPI.checkPermissionCode(formData.permissionCode, excludeId)
    if (response && response.code === 200 && !response.data) {
      ElMessageBox.warning('权限代码已存在', '提示')
    }
  } catch (error: any) {
    console.error('检查权限代码失败:', error)
  }
}

// 处理父权限选择
const handleParentSelect = (data: any) => {
  tempSelectedParent.value = data
}

// 确认父权限选择
const confirmParentSelect = () => {
  if (tempSelectedParent.value) {
    if (tempSelectedParent.value.id === 'no-parent') {
      formData.parentId = '' // 空字符串表示无父权限，会被发送到后端
      selectedParentName.value = '无父权限（顶级权限）'
    } else {
      formData.parentId = tempSelectedParent.value.id
      selectedParentName.value = tempSelectedParent.value.permissionName
    }
  }
  showParentSelector.value = false
}

// 取消父权限选择
const cancelParentSelect = () => {
  tempSelectedParent.value = null
  showParentSelector.value = false
}

// 清除父权限
const clearParentPermission = () => {
  formData.parentId = ''
  selectedParentName.value = ''
  tempSelectedParent.value = null
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
    parentId: '',
    permissionName: '',
    permissionCode: '',
    permissionType: 1,
    path: '',
    component: '',
    icon: '',
    sortOrder: 0,
    status: undefined // 不设置默认值
  })
  if (formRef.value) {
    formRef.value.resetFields()
  }
  // 重置当前权限
  currentPermission.value = null
  // 重置编辑状态
  isEdit.value = false
  // 重置过滤后的数据
  filteredPermissionTreeData.value = []
  // 重置父权限选择
  selectedParentName.value = ''
  tempSelectedParent.value = null
  showParentSelector.value = false
}

// 提交表单
const submitForm = async () => {
  if (!formRef.value) return
  
  try {
    await formRef.value.validate()
    submitLoading.value = true
    
    if (isEdit.value) {
      if (!currentPermission.value || !currentPermission.value.id) {
        showErrorMessage('权限信息不完整，无法更新', '操作失败')
        return
      }
      const response: any = await permissionAPI.updatePermission(currentPermission.value.id, formData)
      if (response && response.code === 200) {
        showSuccessMessage(response, '更新权限成功')
        handleFormClose()
        // 重新加载权限列表和权限树
        await Promise.all([
          loadPermissionsList(),
          loadPermissionTree()
        ])
      } else {
        showErrorMessage(response, '更新权限失败')
      }
    } else {
      const response: any = await permissionAPI.createPermission(formData)
      if (response && response.code === 200) {
        showSuccessMessage(response, '创建权限成功')
        handleFormClose()
        // 重新加载权限列表和权限树
        await Promise.all([
          loadPermissionsList(),
          loadPermissionTree()
        ])
      } else {
        showErrorMessage(response, '创建权限失败')
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
  selectedPermissions.value = [] // 清空已选中的权限
  ElMessageBox.info('请选择要批量删除的权限', '提示')
}

// 取消批量删除
const cancelBatchDelete = () => {
  showSelection.value = false
  selectedPermissions.value = []
  ElMessageBox.info('已取消批量删除', '提示')
}

// 组件挂载时加载数据
onMounted(async () => {
  loadPermissionsList()
  await loadPermissionTree()
  // 初始化过滤后的数据为完整数据
  filteredPermissionTreeData.value = permissionTreeData.value
})
</script>

<style scoped>
.permissions-management {
  padding: 3px 3px 3px 3px;
  display: flex;
  flex-direction: column;
}

.permissions-container {
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

.permissions-table {
  margin-top: 3px;
  flex: 1;
  display: flex;
  flex-direction: column;
  min-height: 0; /* 重要：允许flex子元素收缩 */
}

.permissions-table :deep(.el-table__footer-wrapper) {
  margin-bottom: 0;
}

.permissions-table :deep(.el-table__fixed-footer-wrapper) {
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

.permission-detail {
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

.children-info {
  margin-top: 20px;
  padding-top: 20px;
  border-top: 1px solid #f0f0f0;
}

.children-info h4 {
  margin-bottom: 12px;
  color: #333;
}

.permission-tree {
  max-height: 500px;
  overflow-y: auto;
}

.custom-tree-node {
  display: flex;
  align-items: center;
  gap: 8px;
  cursor: pointer;
  padding: 4px 8px;
  border-radius: 4px;
  transition: background-color 0.2s;
}

.custom-tree-node:hover {
  background-color: #f5f7fa;
}

.permission-code {
  color: #999;
  font-size: 12px;
}

.parent-permission-selector {
  width: 100%;
}

.parent-permission-tree {
  max-height: 400px;
  overflow-y: auto;
  border: 1px solid #dcdfe6;
  border-radius: 4px;
  padding: 8px;
}

.no-parent-option {
  display: flex;
  align-items: center;
  padding: 8px 12px;
  border-radius: 4px;
  cursor: pointer;
  transition: background-color 0.2s;
  margin-bottom: 8px;
  border: 1px solid #e4e7ed;
}

.no-parent-option:hover {
  background-color: #f5f7fa;
}

.no-parent-option.selected {
  background-color: #ecf5ff;
  border-color: #409eff;
}
</style> 