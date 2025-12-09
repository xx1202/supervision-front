<template>
  <div class="not-found">
    <h1>404 - 页面不存在</h1>
    <p>您访问的页面不存在或已被移除</p>
    <router-link to="/login">返回登录页</router-link>
  </div>
</template>

<script setup lang="ts">
// 纯展示页面，无需逻辑
</script>

<style scoped>
.not-found {
  text-align: center;
  margin-top: 50px;
}
</style>