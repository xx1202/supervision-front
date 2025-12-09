<template>
  <div v-if="hasPermission">
    <slot />
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { getUserInfo } from '../../utils/permission'

interface Props {
  roles?: string[]
  permissions?: string[]
}

const props = withDefaults(defineProps<Props>(), {
  roles: () => [],
  permissions: () => []
})

const hasPermission = computed(() => {
  const user = getUserInfo()
  if (!user) return false
  
  // 检查角色权限
  if (props.roles.length > 0) {
    const hasRole = props.roles.some(role => user.roles.includes(role))
    if (!hasRole) return false
  }
  
  // 检查功能权限
  if (props.permissions.length > 0) {
    const hasPermission = props.permissions.some(permission => 
      user.permissions.includes('*') || user.permissions.includes(permission)
    )
    if (!hasPermission) return false
  }
  
  return true
})
</script>
