/**
 * 表格数据管理组合式函数
 * 用于统一管理表格的加载、分页等逻辑
 */
import { ref, reactive } from 'vue'
import type { ApiResponse, PageResponse } from '@/types/api'
import { handleApiError } from '@/utils/error-handler'

/**
 * 分页参数接口
 */
export interface PaginationParams {
  current: number
  size: number
}

/**
 * 使用表格组合式函数
 * @param fetchFn 获取数据的函数
 * @param initialParams 初始查询参数
 */
export function useTable<T>(
  fetchFn: (params: any) => Promise<ApiResponse<PageResponse<T>>>,
  initialParams: Record<string, any> = {}
) {
  const loading = ref(false)
  const tableData = ref<T[]>([])
  const pagination = reactive({
    current: 1,
    size: 10,
    total: 0,
    pages: 0
  })

  // 查询参数
  const queryParams = ref<Record<string, any>>(initialParams)

  /**
   * 加载数据
   */
  const loadData = async (params?: Record<string, any>) => {
    loading.value = true
    try {
      const requestParams = {
        page: pagination.current,
        size: pagination.size,
        ...queryParams.value,
        ...params
      }
      
      const response = await fetchFn(requestParams)
      
      if (response.code === 200 && response.data) {
        tableData.value = response.data.records || []
        pagination.total = response.data.total || 0
        pagination.pages = response.data.pages || 0
      } else {
        handleApiError(response, '加载数据失败')
      }
    } catch (error) {
      handleApiError(error, '加载数据失败')
    } finally {
      loading.value = false
    }
  }

  /**
   * 搜索
   */
  const handleSearch = (params?: Record<string, any>) => {
    if (params) {
      queryParams.value = { ...queryParams.value, ...params }
    }
    pagination.current = 1
    loadData()
  }

  /**
   * 重置搜索
   */
  const resetSearch = () => {
    queryParams.value = { ...initialParams }
    pagination.current = 1
    loadData()
  }

  /**
   * 分页大小改变
   */
  const handleSizeChange = (size: number) => {
    pagination.size = size
    pagination.current = 1
    loadData()
  }

  /**
   * 当前页改变
   */
  const handleCurrentChange = (current: number) => {
    pagination.current = current
    loadData()
  }

  return {
    loading,
    tableData,
    pagination,
    queryParams,
    loadData,
    handleSearch,
    resetSearch,
    handleSizeChange,
    handleCurrentChange
  }
}

