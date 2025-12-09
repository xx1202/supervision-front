<template>
  <div 
    v-show="loading" 
    class="page-progress"
    :class="{ 'is-loading': loading }"
  >
    <div class="progress-bar">
      <div 
        class="progress-fill"
        :style="{ width: progress + '%' }"
      ></div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, watch, onMounted, onUnmounted } from 'vue'
import { useRoute } from 'vue-router'

// 定义组件名称
defineOptions({
  name: 'PageProgress'
})

const route = useRoute()
const loading = ref(false)
const progress = ref(0)
let progressTimer: number | null = null

// 开始加载
const startLoading = () => {
  loading.value = true
  progress.value = 0
  
  // 模拟进度增长
  progressTimer = window.setInterval(() => {
    if (progress.value < 90) {
      progress.value += Math.random() * 15 + 5
    }
  }, 100)
}

// 完成加载
const finishLoading = () => {
  progress.value = 100
  
  setTimeout(() => {
    loading.value = false
    progress.value = 0
    if (progressTimer) {
      clearInterval(progressTimer)
      progressTimer = null
    }
  }, 200)
}

// 监听路由变化
watch(() => route.path, () => {
  startLoading()
  
  // 模拟加载完成
  setTimeout(() => {
    finishLoading()
  }, 800)
}, { immediate: false })

// 监听页面加载事件
const handlePageLoading = () => {
  startLoading()
  
  // 模拟加载完成
  setTimeout(() => {
    finishLoading()
  }, 800)
}

onMounted(() => {
  window.addEventListener('page-loading', handlePageLoading)
})

onUnmounted(() => {
  window.removeEventListener('page-loading', handlePageLoading)
})

// 暴露方法给父组件
defineExpose({
  startLoading,
  finishLoading
})
</script>

<style scoped lang="scss">
.page-progress {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  height: 3px;
  z-index: 9999;
  pointer-events: none;
  
  .progress-bar {
    width: 100%;
    height: 100%;
    background: rgba(24, 144, 255, 0.1);
    overflow: hidden;
    
    .progress-fill {
      height: 100%;
      background: linear-gradient(90deg, #1890ff, #40a9ff, #69c0ff);
      transition: width 0.3s ease;
      position: relative;
      
      &::after {
        content: '';
        position: absolute;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.4), transparent);
        animation: shimmer 1.5s infinite;
      }
    }
  }
  
  &.is-loading {
    .progress-bar {
      .progress-fill {
        animation: pulse 2s infinite;
      }
    }
  }
}

@keyframes shimmer {
  0% {
    transform: translateX(-100%);
  }
  100% {
    transform: translateX(100%);
  }
}

@keyframes pulse {
  0%, 100% {
    opacity: 1;
  }
  50% {
    opacity: 0.8;
  }
}

// 深色主题适配
body.theme-dark {
  .page-progress {
    .progress-bar {
      background: rgba(24, 144, 255, 0.2);
    }
  }
}
</style> 