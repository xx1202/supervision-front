<template>
  <div class="inspection-item-config">
    <div class="page-content">
      <div class="item-container">
        <!-- 标签页切换 -->
        <el-tabs v-model="activeTab" @tab-change="handleTabChange">
          <!-- 分类管理标签页 -->
          <el-tab-pane label="分类管理" name="categories">
            <div class="category-section">
              <div class="search-section">
                <div style="display: flex; align-items: center; justify-content: space-between;">
                  <span class="section-title">项目分类列表</span>
                  <el-button type="primary" @click="showCreateCategoryDialog">
                    <el-icon><Plus /></el-icon>
                    新增分类
                  </el-button>
                </div>
              </div>
              
              <div class="category-table">
                <el-table 
                  :data="categoryList" 
                  style="width: 100%" 
                  height="100%"
                  v-loading="categoryLoading"
                  fit
                  table-layout="fixed"
                  border 
                >
                  <el-table-column prop="itemName" label="分类名称" width="200" />
                  <el-table-column label="项目数量" width="100">
                    <template #default="scope">
                      {{ getSubItemCount(scope.row.id) }}个
                    </template>
                  </el-table-column>
                  <el-table-column label="操作" min-width="150" fixed="right">
                    <template #default="scope">
                      <el-button size="small" @click="editCategory(scope.row)">编辑</el-button>
                      <el-button 
                        size="small" 
                        type="danger" 
                        @click="deleteCategory(scope.row)"
                        :disabled="getSubItemCount(scope.row.id) > 0"
                      >
                        删除
                      </el-button>
                    </template>
                  </el-table-column>
                </el-table>
              </div>
            </div>
          </el-tab-pane>

          <!-- 项目管理标签页 -->
          <el-tab-pane label="项目管理" name="items">
            <div class="item-section">
              <!-- 搜索和过滤区域 -->
              <div class="search-section">
                <el-form :model="searchForm" inline style="display: flex; align-items: center; justify-content: space-between;">
                  <el-form-item label="项目分类">
                    <el-select v-model="searchForm.parentCategoryId" placeholder="选择分类" @change="handleSearch">
                      <el-option label="全部" value="" />
                      <el-option 
                        v-for="category in categoryList" 
                        :key="category.id"
                        :label="category.itemName" 
                        :value="category.id" 
                      />
                    </el-select>
                  </el-form-item>
                  <el-form-item label="状态">
                    <el-select v-model="searchForm.status" placeholder="选择状态" @change="handleSearch">
                      <el-option label="全部" value="" />
                      <el-option label="启用" value="1" />
                      <el-option label="禁用" value="0" />
                    </el-select>
                  </el-form-item>
                  <el-form-item>
                    <el-button type="primary" @click="handleSearch">搜索</el-button>
                    <el-button @click="resetSearch">重置</el-button>
                  </el-form-item>
                  <el-form-item style="margin-left: auto;">
                    <el-button type="primary" @click="showCreateDialog">
                      <el-icon><Plus /></el-icon>
                      新增巡查项目
                    </el-button>
                  </el-form-item>
                </el-form>
              </div>
            </div>
          </el-tab-pane>
        </el-tabs>

        <!-- 项目表格（只在项目管理标签页显示） -->
        <div class="item-table" v-show="activeTab === 'items'">
          <el-table 
            :data="treeItemList" 
            style="width: 100%" 
            height="100%"
            v-loading="loading"
            fit
            table-layout="fixed"
            border 
            row-key="id"
            :tree-props="{ children: 'children', hasChildren: 'hasChildren' }"
            :default-expand-all="true"
          >
            <el-table-column prop="itemName" label="项目名称" min-width="150" show-overflow-tooltip />
            <el-table-column label="分类信息" width="120">
              <template #default="{ row }">
                <el-tag v-if="row.level === 1" type="success">
                  一级分类
                </el-tag>
                <el-tag v-else type="primary">
                  {{ row.parentCategoryName || '未分类' }}
                </el-tag>
              </template>
            </el-table-column>
            <el-table-column prop="maxScore" label="最高分" width="100">
              <template #default="scope">
                <span class="score-display" v-if="scope.row.itemType === 'score'">{{ scope.row.maxScore }}分</span>
                <span v-else>-</span>
              </template>
            </el-table-column>
            <el-table-column label="项目类型" width="100">
              <template #default="scope">
                <el-tag :type="scope.row.itemType === 'boolean' ? 'warning' : scope.row.itemType === 'category' ? 'info' : 'success'">
                  {{ scope.row.itemType === 'boolean' ? '布尔型' : scope.row.itemType === 'category' ? '分类' : '分数型' }}
                </el-tag>
              </template>
            </el-table-column>
            <el-table-column label="层级" width="80">
              <template #default="scope">
                <el-tag :type="scope.row.level === 1 ? 'success' : 'primary'">
                  {{ scope.row.level === 1 ? '一级' : '二级' }}
                </el-tag>
              </template>
            </el-table-column>
            <el-table-column prop="sortOrder" label="排序" width="80" />
            <el-table-column prop="status" label="状态" width="100">
              <template #default="scope">
                <el-tag :type="scope.row.status === 1 ? 'success' : 'danger'">
                  {{ scope.row.status === 1 ? '启用' : '禁用' }}
                </el-tag>
              </template>
            </el-table-column>
            <el-table-column prop="createdTime" label="创建时间" width="160">
              <template #default="scope">
                {{ formatDateTime(scope.row.createdTime) }}
              </template>
            </el-table-column>
            <el-table-column label="操作" min-width="200" fixed="right">
              <template #default="scope">
                <el-button size="small" @click="viewItem(scope.row)">查看</el-button>
                <el-button 
                  size="small" 
                  type="primary" 
                  @click="editItem(scope.row)"
                >
                  编辑
                </el-button>
                <el-button 
                  size="small" 
                  type="warning" 
                  @click="toggleStatus(scope.row)"
                >
                  {{ scope.row.status === 1 ? '禁用' : '启用' }}
                </el-button>
                <el-button 
                  size="small" 
                  type="danger" 
                  @click="deleteItem(scope.row)"
                >
                  删除
                </el-button>
              </template>
            </el-table-column>
          </el-table>

          <!-- 分页 - 树形结构显示时隐藏分页 -->
          <div class="pagination-wrapper" v-if="false">
            <el-pagination
              :current-page="pagination.current"
              :page-size="pagination.size"
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

    <!-- 巡查项目对话框 -->
    <el-dialog
      :title="isEdit ? '编辑巡查项目' : '新增巡查项目'"
      v-model="dialogVisible"
      width="800px"
      :append-to-body="true"
      :lock-scroll="true"
      :close-on-click-modal="false"
    >
      <el-form :model="itemForm" :rules="rules" ref="itemFormRef" label-width="120px">
        <el-form-item label="项目名称" prop="itemName">
          <el-input 
            v-model="itemForm.itemName" 
            placeholder="请输入项目名称"
            style="width: 100%"
          />
        </el-form-item>
        <el-form-item label="层级" prop="level">
          <el-select v-model="itemForm.level" placeholder="选择层级" style="width: 100%" @change="handleLevelChange">
            <el-option label="一级分类" :value="1" />
            <el-option label="二级项目" :value="2" />
          </el-select>
        </el-form-item>
        <el-form-item label="父分类" prop="parentCategoryId" v-if="itemForm.level === 2">
          <el-select 
            v-model="itemForm.parentCategoryId" 
            placeholder="选择父分类" 
            style="width: 100%"
            :loading="categoryLoading"
            @focus="ensureCategoryListLoaded"
          >
            <el-option 
              v-for="category in categoryList.filter(cat => cat.level === 1)" 
              :key="category.id"
              :label="category.itemName" 
              :value="category.id" 
            />
          </el-select>
        </el-form-item>
        <el-form-item label="项目类型" prop="itemType" v-if="itemForm.level === 2">
          <el-select v-model="itemForm.itemType" placeholder="选择项目类型" style="width: 100%" @change="handleItemTypeChange">
            <el-option label="分数型" value="score" />
            <el-option label="布尔型" value="boolean" />
          </el-select>
        </el-form-item>
        <el-form-item label="最高分" prop="maxScore" v-if="itemForm.itemType === 'score'">
          <el-input-number 
            v-model="itemForm.maxScore" 
            :min="itemForm.level === 1 ? 0 : 1" 
            :max="100"
            placeholder="请输入最高分"
            style="width: 100%"
          />
        </el-form-item>
        <el-form-item label="排序" prop="sortOrder">
          <el-input-number 
            v-model="itemForm.sortOrder" 
            :min="0" 
            :max="999"
            placeholder="请输入排序值"
            style="width: 100%"
          />
        </el-form-item>
        <el-form-item label="状态" prop="status">
          <el-radio-group v-model="itemForm.status">
            <el-radio :label="1">启用</el-radio>
            <el-radio :label="0">禁用</el-radio>
          </el-radio-group>
        </el-form-item>
        
      </el-form>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="dialogVisible = false">取消</el-button>
          <el-button type="primary" @click="submitItem">确定</el-button>
        </span>
      </template>
    </el-dialog>

    <!-- 巡查项目详情对话框 -->
    <el-dialog
      title="巡查项目详情"
      v-model="detailVisible"
      width="700px"
      :append-to-body="true"
      :lock-scroll="true"
      :close-on-click-modal="false"
    >
      <div v-if="currentItem" class="item-detail">
        <el-descriptions :column="2" border>
          <el-descriptions-item label="项目名称">
            {{ currentItem.itemName }}
          </el-descriptions-item>
          <el-descriptions-item label="项目分类">
            <el-tag type="primary">
              {{ currentItem.parentCategoryName || '未分类' }}
            </el-tag>
          </el-descriptions-item>
          <el-descriptions-item label="层级">
            <el-tag :type="currentItem.level === 1 ? 'success' : 'primary'">
              {{ currentItem.level === 1 ? '一级' : '二级' }}
            </el-tag>
          </el-descriptions-item>
          <el-descriptions-item label="最高分">
            {{ currentItem.maxScore }}分
          </el-descriptions-item>
          <el-descriptions-item label="排序">
            {{ currentItem.sortOrder }}
          </el-descriptions-item>
          <el-descriptions-item label="状态">
            <el-tag :type="currentItem.status === 1 ? 'success' : 'danger'">
              {{ currentItem.status === 1 ? '启用' : '禁用' }}
            </el-tag>
          </el-descriptions-item>
          <el-descriptions-item label="创建时间">
            {{ formatDateTime(currentItem.createdTime) }}
          </el-descriptions-item>
        </el-descriptions>

      </div>
    </el-dialog>

    <!-- 分类管理对话框 -->
    <el-dialog
      :title="isEditCategory ? '编辑分类' : '新增分类'"
      v-model="categoryDialogVisible"
      width="500px"
      :append-to-body="true"
      :lock-scroll="true"
      :close-on-click-modal="false"
    >
      <el-form :model="categoryForm" :rules="categoryRules" ref="categoryFormRef" label-width="120px">
        <el-form-item label="分类名称" prop="categoryName">
          <el-input 
            v-model="categoryForm.categoryName" 
            placeholder="请输入分类名称"
            style="width: 100%"
          />
        </el-form-item>
      </el-form>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="categoryDialogVisible = false">取消</el-button>
          <el-button type="primary" @click="submitCategory">确定</el-button>
        </span>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { Plus } from '@element-plus/icons-vue'
import { ElMessageBox } from 'element-plus'
import { showSuccessMessage, showErrorMessage, handleApiError } from '@/utils/error-handler'
import { inspectionItemConfigAPI } from '../../../api/index'
import type { 
  InspectionItemConfig, 
  InspectionItemConfigParams,
  InspectionSubItem 
} from '../../../types/api'

// 搜索表单
const searchForm = reactive({
  parentCategoryId: '',
  status: ''
})

// 分页信息
const pagination = reactive({
  current: 1,
  size: 10,
  total: 0
})

// 巡查项目数据
const itemList = ref<InspectionItemConfig[]>([])
const treeItemList = ref<any[]>([])
const loading = ref(false)

// 对话框状态
const dialogVisible = ref(false)
const detailVisible = ref(false)
const isEdit = ref(false)
const currentItem = ref<any>(null)
const itemFormRef = ref()

// 标签页状态
const activeTab = ref('items')

// 分类管理相关
const categoryList = ref<any[]>([])
const categoryLoading = ref(false)
const categoryDialogVisible = ref(false)
const isEditCategory = ref(false)
const currentCategory = ref<any>(null)
const categoryFormRef = ref()

// 分类表单
const categoryForm = reactive({
  categoryName: ''
})

// 巡查项目表单
const itemForm = reactive<any>({
  itemName: '',
  parentCategoryId: '',
  level: 2,
  maxScore: 10,
  itemType: 'score' as 'category' | 'score' | 'boolean',
  sortOrder: 0,
  status: 1
})

// 表单验证规则
const rules = {
  itemName: [{ required: true, message: '请输入项目名称', trigger: 'blur' }],
  parentCategoryId: [
    { 
      validator: (rule: any, value: any, callback: any) => {
        if (itemForm.level === 2 && !value) {
          callback(new Error('二级项目必须选择父分类'))
        } else {
          callback()
        }
      }, 
      trigger: 'change' 
    }
  ],
  level: [{ required: true, message: '请选择层级', trigger: 'change' }],
  maxScore: [
    { 
      validator: (rule: any, value: any, callback: any) => {
        // 如果选择布尔型或分类型，不验证分数
        if (itemForm.itemType === 'boolean' || itemForm.itemType === 'category') {
          callback()
          return
        }
        
        if (value === null || value === undefined) {
          callback(new Error('请输入最高分'))
        } else if (itemForm.level === 1 && value < 0) {
          callback(new Error('一级分类分数不能为负数'))
        } else if (itemForm.level === 2 && value < 1) {
          callback(new Error('二级项目分数不能小于1'))
        } else if (value > 100) {
          callback(new Error('分数不能超过100'))
        } else {
          callback()
        }
      }, 
      trigger: 'blur' 
    }
  ],
  sortOrder: [{ required: true, message: '请输入排序值', trigger: 'blur' }]
}

// 分类表单验证规则
const categoryRules = {
  categoryName: [{ required: true, message: '请输入分类名称', trigger: 'blur' }]
}

// 获取分类类型标签样式
const getCategoryType = (category: string) => {
  switch (category) {
    case 'building_safety':
      return 'primary'
    case 'power_safety':
      return 'warning'
    case 'cleanliness':
      return 'success'
    default:
      return 'info'
  }
}

// 获取分类名称
const getCategoryName = (categoryId: string) => {
  if (!categoryId) return '未知'
  const foundCategory = categoryList.value.find(cat => cat.id === categoryId)
  return foundCategory ? foundCategory.itemName : '未知'
}

// 获取子项目数量
const getSubItemCount = (categoryId: string) => {
  if (!categoryId) return 0
  return itemList.value.filter((item: any) => item.parentCategoryId === categoryId).length
}

// 构建树形列表
const buildTreeList = () => {
  // 获取一级分类
  const parentCategories = itemList.value.filter(item => item.level === 1)
    .sort((a, b) => (a.sortOrder || 0) - (b.sortOrder || 0))
  
  // 获取二级项目
  const childItems = itemList.value.filter(item => item.level === 2)
  
  // 构建树形结构
  treeItemList.value = parentCategories.map(parent => {
    const children = childItems
      .filter(item => item.parentCategoryId === parent.id)
      .sort((a, b) => (a.sortOrder || 0) - (b.sortOrder || 0))
    
    return {
      ...parent,
      children: children,
      hasChildren: children.length > 0
    }
  })
}

// 格式化日期时间
const formatDateTime = (datetime: string) => {
  if (!datetime) return ''
  return new Date(datetime).toLocaleString('zh-CN')
}

// 加载巡查项目列表
const loadItemList = async () => {
  loading.value = true
  try {
    // 确保分类列表已加载，用于填充 parentCategoryName
    if (categoryList.value.length === 0) {
      await loadCategoryList()
    }
    
    // 获取所有数据（不分页）
    const params: { 
      parentCategoryId?: string; 
      status?: string;
    } = {}
    
    if (searchForm.parentCategoryId) {
      params.parentCategoryId = searchForm.parentCategoryId
    }
    if (searchForm.status) {
      params.status = searchForm.status
    }
    
    const response: any = await inspectionItemConfigAPI.getInspectionItemConfigList({
      ...params,
      page: 1,
      size: 1000 // 获取大量数据，实际项目中可能需要修改后端API支持获取所有数据
    })
    if (response && response.code === 200) {
      const data = response.data
      
      // 填充父分类名称
      const itemsWithCategoryName = (data.list || []).map((item: any) => {
        if (item.level === 2 && item.parentCategoryId) {
          const parentCategory = categoryList.value.find(cat => cat.id === item.parentCategoryId)
          item.parentCategoryName = parentCategory ? parentCategory.itemName : '未知分类'
        }
        return item
      })
      
      itemList.value = itemsWithCategoryName
      pagination.total = data.total || 0
      
      // 构建树形结构
      buildTreeList()
    } else {
      showErrorMessage(response, '加载巡查项目列表失败')
    }
  } catch (error: any) {
    handleApiError(error, '加载巡查项目列表失败')
  } finally {
    loading.value = false
  }
}

// 搜索处理
const handleSearch = () => {
  pagination.current = 1
  loadItemList()
}

// 重置搜索
const resetSearch = () => {
  searchForm.parentCategoryId = ''
  searchForm.status = ''
  handleSearch()
}

// 分页处理
const handleSizeChange = (size: number) => {
  pagination.size = size
  pagination.current = 1
  loadItemList()
}

const handleCurrentChange = (current: number) => {
  pagination.current = current
  loadItemList()
}

// 层级变化处理
const handleLevelChange = async (level: number) => {
  if (level === 1) {
    // 一级分类不需要父分类，默认为category类型，分数为0
    itemForm.parentCategoryId = ''
    itemForm.itemType = 'category'
    itemForm.maxScore = 0
  } else if (level === 2) {
    // 二级项目：确保分类列表已加载，根据当前类型设置分数
    if (categoryList.value.length === 0) {
      await loadCategoryList()
    }
    
    if (itemForm.itemType === 'boolean') {
      itemForm.maxScore = 0  // 布尔型分数为0
    } else if (itemForm.maxScore === 0) {
      itemForm.maxScore = 1
    }
  }
}

// 项目类型变化处理
const handleItemTypeChange = (itemType: string) => {
  if (itemType === 'category') {
    // 分类型：分数固定为0
    itemForm.maxScore = 0
  } else if (itemType === 'boolean') {
    // 布尔型：不设置分数，固定为0
    itemForm.maxScore = 0
  } else if (itemType === 'score') {
    // 分数型：一级分类分数为0，二级项目分数至少为1
    if (itemForm.level === 2 && itemForm.maxScore < 1) {
      itemForm.maxScore = 1
    }
  }
}

// 显示创建对话框
const showCreateDialog = async () => {
  // 确保分类列表已加载（从数据库获取所有一级分类）
  await loadCategoryList()
  
  isEdit.value = false
  Object.assign(itemForm, {
    itemName: '',
    parentCategoryId: '',
    level: 1, // 默认选择一级分类
    maxScore: 0, // 一级分类默认分数为0
    itemType: 'category', // 一级分类默认为category类型
    sortOrder: 0,
    status: 1
  })
  dialogVisible.value = true
}

// 编辑巡查项目
const editItem = (row: InspectionItemConfig) => {
  isEdit.value = true
  currentItem.value = row
  Object.assign(itemForm, {
    itemName: row.itemName,
    parentCategoryId: (row as any).parentCategoryId || '',
    level: row.level || 2,
    maxScore: row.maxScore,
    itemType: (row as any).itemType || (row.level === 1 ? 'category' : 'score'),
    sortOrder: row.sortOrder,
    status: row.status
  })
  dialogVisible.value = true
}

// 查看巡查项目详情
const viewItem = (row: InspectionItemConfig) => {
  currentItem.value = row
  detailVisible.value = true
}

// 切换状态
const toggleStatus = async (row: InspectionItemConfig) => {
  try {
    const action = row.status === 1 ? '禁用' : '启用'
    await ElMessageBox.confirm(
      `确定要${action}巡查项目"${row.itemName}"吗？`,
      `确认${action}`,
      {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }
    )

    // 调用API更新状态
    const newStatus = row.status === 1 ? 0 : 1
    const response: any = await inspectionItemConfigAPI.updateInspectionItemConfig(row.id, {
      itemName: row.itemName,
      parentCategoryId: (row as any).parentCategoryId,
      level: Number(row.level), // 确保是数字类型
      maxScore: Number(row.level === 1 || (row as any).itemType === 'boolean' || (row as any).itemType === 'category' ? 0 : row.maxScore), // 确保是数字类型
      itemType: (row as any).itemType || (row.level === 1 ? 'category' : 'score'),
      sortOrder: Number(row.sortOrder || 0), // 确保是数字类型
      status: Number(newStatus) // 确保是数字类型
    })
    
    if (response && response.code === 200) {
      showSuccessMessage(response, `${action}成功`)
      loadItemList()
    } else {
      showErrorMessage(response, '操作失败')
    }
  } catch (error: any) {
    if (error !== 'cancel') {
      handleApiError(error, '操作失败')
    }
  }
}

// 删除巡查项目
const deleteItem = async (row: InspectionItemConfig) => {
  try {
    await ElMessageBox.confirm(
      `确定要删除巡查项目"${row.itemName}"吗？\n删除后不可恢复！`,
      '确认删除',
      {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }
    )

    const response: any = await inspectionItemConfigAPI.deleteInspectionItemConfig(row.id)
    if (response && response.code === 200) {
      showSuccessMessage(response, '删除成功')
      loadItemList()
    } else {
      showErrorMessage(response, '删除失败')
    }
  } catch (error: any) {
    if (error !== 'cancel') {
      handleApiError(error, '删除失败')
    }
  }
}

// 提交巡查项目
const submitItem = async () => {
  try {
    await itemFormRef.value.validate()
    
    // 准备提交数据，确保数据类型正确
    const submitData = {
      itemName: itemForm.itemName,
      parentCategoryId: itemForm.level === 1 ? null : itemForm.parentCategoryId,
      level: Number(itemForm.level), // 确保是数字类型
      maxScore: Number(itemForm.level === 1 || itemForm.itemType === 'category' || itemForm.itemType === 'boolean' ? 0 : itemForm.maxScore), // 确保是数字类型
      itemType: itemForm.level === 1 ? 'category' : itemForm.itemType,
      sortOrder: Number(itemForm.sortOrder || 0), // 确保是数字类型
      status: Number(itemForm.status) // 确保是数字类型
    }
    
    if (isEdit.value && currentItem.value) {
      // 编辑模式
      const response: any = await inspectionItemConfigAPI.updateInspectionItemConfig(
        currentItem.value.id, 
        submitData
      )
      
      if (response && response.code === 200) {
        showSuccessMessage(response, '编辑成功')
        dialogVisible.value = false
        loadItemList()
      } else {
        showErrorMessage(response, '编辑失败')
      }
    } else {
      // 新增模式
      const response: any = await inspectionItemConfigAPI.createInspectionItemConfig(submitData)
      
      if (response && response.code === 200) {
        showSuccessMessage(response, '新增成功')
        dialogVisible.value = false
        loadItemList()
      } else {
        showErrorMessage(response, '新增失败')
      }
    }
  } catch (error: any) {
    handleApiError(error, '提交失败，请检查表单')
  }
}

// 加载分类列表
const loadCategoryList = async () => {
  // 避免重复加载
  if (categoryLoading.value) {
    return
  }
  
  categoryLoading.value = true
  try {
    const response: any = await inspectionItemConfigAPI.getAllCategories()
    if (response && response.code === 200) {
      categoryList.value = response.data || []
    } else {
      showErrorMessage(response, '加载分类列表失败')
    }
  } catch (error: any) {
    handleApiError(error, '加载分类列表失败')
  } finally {
    categoryLoading.value = false
  }
}

// 确保分类列表已加载
const ensureCategoryListLoaded = async () => {
  if (categoryList.value.length === 0 && !categoryLoading.value) {
    await loadCategoryList()
  }
}

// 标签页切换
const handleTabChange = (tabName: string) => {
  if (tabName === 'categories') {
    loadCategoryList()
  } else if (tabName === 'items') {
    loadItemList()
  }
}

// 显示新增分类对话框
const showCreateCategoryDialog = () => {
  isEditCategory.value = false
  categoryForm.categoryName = ''
  categoryDialogVisible.value = true
}

// 编辑分类
const editCategory = (row: any) => {
  isEditCategory.value = true
  currentCategory.value = row
  categoryForm.categoryName = row.itemName
  categoryDialogVisible.value = true
}

// 删除分类
const deleteCategory = async (row: any) => {
  try {
    await ElMessageBox.confirm(
      `确定要删除分类"${row.itemName}"吗？\n删除后不可恢复！`,
      '确认删除',
      {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }
    )

    const response: any = await inspectionItemConfigAPI.deleteCategory(row.id)
    if (response && response.code === 200) {
      showSuccessMessage(response, '删除成功')
      loadCategoryList()
    } else {
      showErrorMessage(response, '删除失败')
    }
  } catch (error: any) {
    if (error !== 'cancel') {
      handleApiError(error, '删除失败')
    }
  }
}

// 提交分类表单
const submitCategory = async () => {
  try {
    await categoryFormRef.value.validate()
    
    if (isEditCategory.value && currentCategory.value) {
      // 编辑模式
      const response: any = await inspectionItemConfigAPI.updateCategory(
        currentCategory.value.id, 
        { categoryName: categoryForm.categoryName }
      )
      
      if (response && response.code === 200) {
        showSuccessMessage(response, '编辑成功')
        categoryDialogVisible.value = false
        loadCategoryList()
      } else {
        showErrorMessage(response, '编辑失败')
      }
    } else {
      // 新增模式
      const response: any = await inspectionItemConfigAPI.createCategory({
        categoryName: categoryForm.categoryName
      })
      
      if (response && response.code === 200) {
        showSuccessMessage(response, '新增成功')
        categoryDialogVisible.value = false
        loadCategoryList()
      } else {
        showErrorMessage(response, '新增失败')
      }
    }
  } catch (error: any) {
    handleApiError(error, '提交失败，请检查表单')
  }
}

// 组件挂载时加载数据
onMounted(() => {
  loadItemList()
  loadCategoryList()
})
</script>

<style scoped>
.inspection-item-config {
  padding: 3px 3px 3px 3px;
  display: flex;
  flex-direction: column;
}

.item-container {
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

.item-table {
  margin-top: 3px;
  flex: 1;
  display: flex;
  flex-direction: column;
  min-height: 0;
}

.item-table :deep(.el-table__footer-wrapper) {
  margin-bottom: 0;
}

.item-table :deep(.el-table__fixed-footer-wrapper) {
  margin-bottom: 0;
}

.pagination-wrapper {
  margin-top: 8px;
  margin-bottom: 0;
  text-align: right;
  flex-shrink: 0;
}

.pagination-wrapper :deep(.el-pagination) {
  margin-bottom: 0;
}

.score-display {
  font-weight: 600;
  color: #409eff;
}

.sub-items-section {
  border: 1px solid #e4e7ed;
  border-radius: 4px;
  padding: 16px;
  background: #fafafa;
}

.sub-items-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
}

.sub-items-title {
  font-weight: 600;
  color: #333;
}

.sub-items-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.sub-item-row {
  display: flex;
  align-items: center;
  margin-bottom: 12px;
  padding: 12px;
  background: white;
  border-radius: 4px;
  border: 1px solid #e4e7ed;
}

.sub-item-row:last-child {
  margin-bottom: 0;
}

.no-sub-items {
  text-align: center;
  padding: 20px;
}

.item-detail {
  padding: 20px 0;
}

.sub-items-detail {
  margin-top: 20px;
  padding-top: 20px;
  border-top: 1px solid #f0f0f0;
}

.sub-items-detail h4 {
  margin-bottom: 16px;
  color: #333;
}

.dialog-footer {
  text-align: right;
}
</style> 