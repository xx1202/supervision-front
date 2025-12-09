import { ref, computed } from 'vue'
import { staffAttendanceAPI } from '@/api'
import type { AttendanceStatusOption } from '@/types/api'
import { handleApiError, showErrorMessage } from '@/utils/error-handler'

/**
 * 考勤状态管理 Hook
 * 用于获取和管理考勤状态列表
 */
export function useAttendanceStatus() {
  // 状态列表
  const statusList = ref<AttendanceStatusOption[]>([])
  const loading = ref(false)

  // 状态映射（code -> name）
  const statusMap = computed(() => {
    const map: Record<string, string> = {}
    statusList.value.forEach(status => {
      map[status.code] = status.name
    })
    return map
  })

  // 状态选项映射（用于下拉框）
  const statusOptions = computed(() => {
    return statusList.value.map(status => ({
      label: status.name,
      value: status.code
    }))
  })

  // 状态类型映射（用于标签颜色）
  const statusTypeMap = computed(() => {
    const map: Record<string, 'success' | 'danger' | 'warning' | 'info'> = {}
    statusList.value.forEach(status => {
      // 根据状态编码设置标签类型
      switch (status.code) {
        case 'present':
        case 'present_class':
          map[status.code] = 'success'
          break
        case 'absent':
          map[status.code] = 'danger'
          break
        case 'temporary_absent':
          map[status.code] = 'warning'
          break
        case 'leave':
        case 'leave_business_trip':
        case 'leave_rotation':
          map[status.code] = 'info'
          break
        default:
          map[status.code] = 'info'
      }
    })
    return map
  })

  // 获取状态名称
  const getStatusName = (code: string): string => {
    return statusMap.value[code] || '未知'
  }

  // 获取状态类型（用于标签）
  const getStatusType = (code: string): 'success' | 'danger' | 'warning' | 'info' => {
    return statusTypeMap.value[code] || 'info'
  }

  // 加载状态列表
  const loadStatusList = async () => {
    if (loading.value) return
    if (statusList.value.length > 0) return // 已加载过，直接返回

    try {
      loading.value = true
      const response = await staffAttendanceAPI.getAttendanceStatusList()
      if (response.code === 200 && response.data) {
        statusList.value = response.data
      } else {
        showErrorMessage(response, '获取考勤状态列表失败')
      }
    } catch (error: any) {
      handleApiError(error, '获取考勤状态列表失败')
    } finally {
      loading.value = false
    }
  }

  // 强制刷新状态列表
  const refreshStatusList = async () => {
    statusList.value = []
    await loadStatusList()
  }

  return {
    statusList,
    statusMap,
    statusOptions,
    statusTypeMap,
    loading,
    getStatusName,
    getStatusType,
    loadStatusList,
    refreshStatusList
  }
}

