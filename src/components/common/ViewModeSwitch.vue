<template>
  <el-button-group>
    <el-button 
      :type="viewMode === 'card' ? 'primary' : ''" 
      size="small"
      @click="handleCardClick"
      :title="'卡片视图'"
    >
      <el-icon><Menu /></el-icon>
    </el-button>
    <el-button 
      :type="viewMode === 'table' ? 'primary' : ''" 
      size="small"
      @click="handleTableClick"
      :title="'表格视图'"
    >
      <el-icon><Grid /></el-icon>
    </el-button>
  </el-button-group>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { Menu, Grid } from '@element-plus/icons-vue'
import type { ViewMode } from '@/hooks/useViewMode'

interface Props {
  modelValue: ViewMode
}

interface Emits {
  (e: 'update:modelValue', value: ViewMode): void
  (e: 'change', value: ViewMode): void
}

const props = defineProps<Props>()
const emit = defineEmits<Emits>()

const viewMode = computed({
  get: () => props.modelValue,
  set: (value: ViewMode) => {
    emit('update:modelValue', value)
    emit('change', value)
  }
})

const handleCardClick = () => {
  viewMode.value = 'card'
}

const handleTableClick = () => {
  viewMode.value = 'table'
}
</script>

<style scoped>
.el-button-group {
  display: inline-flex;
}
</style>

