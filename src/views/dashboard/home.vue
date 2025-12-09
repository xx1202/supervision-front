<template>
  <div class="user-home">
    <h1>用户首页</h1>
    <p>欢迎回来，{{ username }}！</p>
    <nav>
      <router-link to="/user/profile">个人资料</router-link>
    </nav>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'

const username = ref(localStorage.getItem('username') || '用户')
</script>

<style scoped>
.user-home {
  padding: 20px;
}
</style>