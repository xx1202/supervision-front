<template>
  <div class="module2-container">
    <h2>模块二：行政坐班管理</h2>
    
    <!-- 查看功能 - 所有相关角色都可以查看 -->
    <div class="section">
      <h3>坐班记录</h3>
      <div class="record-list">
        <div v-for="record in records" :key="record.id" class="record-item">
          <span>{{ record.date }}</span>
          <span>{{ record.teacher }}</span>
          <span>{{ record.status }}</span>
        </div>
      </div>
    </div>
    
    <!-- 编辑功能 - 只有管理员可以编辑 -->
    <div class="section">
      <h3>管理功能</h3>
      
      <!-- 使用权限指令控制按钮显示 -->
      <button v-permission="'module2:edit'" @click="addRecord" class="btn btn-primary">
        添加记录
      </button>
      
      <button v-permission="'module2:edit'" @click="editRecord" class="btn btn-secondary">
        编辑记录
      </button>
      
      <!-- 使用角色指令控制 -->
      <button v-role="'ADMIN_OFFICE_DIRECTOR'" @click="systemSettings" class="btn btn-danger">
        系统设置
      </button>
      
      <!-- 使用权限包装组件 -->
      <PermissionWrapper permission="module2:edit">
        <button @click="exportData" class="btn btn-success">
          导出数据
        </button>
      </PermissionWrapper>
    </div>
    
    <!-- 编程式权限检查示例 -->
    <div class="section" v-if="canManageRecords">
      <h3>高级管理</h3>
      <button @click="batchOperation" class="btn btn-warning">
        批量操作
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { getUserInfo, checkComponentPermission } from '@/utils/permission'
import PermissionWrapper from '@/components/common/PermissionWrapper.vue'
import { logger } from '@/utils/logger'

// 模拟数据
const records = ref([
  { id: 1, date: '2024-01-15', teacher: '张老师', status: '正常' },
  { id: 2, date: '2024-01-16', teacher: '李老师', status: '请假' },
  { id: 3, date: '2024-01-17', teacher: '王老师', status: '正常' }
])

// 编程式权限检查
const canManageRecords = computed(() => {
  const user = getUserInfo()
  if (!user) return false
  return checkComponentPermission('module2:edit', user)
})

// 功能方法
const addRecord = () => {
  logger.debug('添加记录')
  // 具体操作由后端控制权限
}

const editRecord = () => {
  logger.debug('编辑记录')
  // 具体操作由后端控制权限
}

const systemSettings = () => {
  logger.debug('系统设置')
  // 只有政务办主任可以执行
}

const exportData = () => {
  logger.debug('导出数据')
  // 具体操作由后端控制权限
}

const batchOperation = () => {
  logger.debug('批量操作')
  // 只有有编辑权限的用户才能执行
}
</script>

<style scoped>
.module2-container {
  padding: 20px;
}

.section {
  margin-bottom: 30px;
  padding: 20px;
  border: 1px solid #eee;
  border-radius: 8px;
}

.record-list {
  margin-top: 15px;
}

.record-item {
  display: flex;
  justify-content: space-between;
  padding: 10px;
  border-bottom: 1px solid #f0f0f0;
}

.btn {
  margin-right: 10px;
  padding: 8px 16px;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 14px;
}

.btn-primary {
  background-color: #007bff;
  color: white;
}

.btn-secondary {
  background-color: #6c757d;
  color: white;
}

.btn-success {
  background-color: #28a745;
  color: white;
}

.btn-warning {
  background-color: #ffc107;
  color: #212529;
}

.btn-danger {
  background-color: #dc3545;
  color: white;
}

.btn:hover {
  opacity: 0.8;
}
</style> 