<template>
  <div
      class="ai-chat-container"
      :style="{ left: pos.x + 'px', top: pos.y + 'px' }"
  >
    <transition name="zoom-fade">
      <div v-show="isOpen" class="chat-window">
        <div class="chat-header">
          <div class="header-content">
            <div class="avatar-robot-glow">
              <span class="robot-icon">🤖</span>
            </div>
            <div class="header-text">
              <span class="title">AI 智能助手</span>
              <span class="subtitle">Online | Spring Boot Core</span>
            </div>
          </div>
          <button class="close-btn" @click.stop="toggleChat">
            <svg viewBox="0 0 24 24" width="20" height="20" stroke="currentColor" stroke-width="2" fill="none" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
          </button>
        </div>

        <div class="chat-messages" ref="messagesContainer">
          <div
              v-for="(msg, index) in messages"
              :key="index"
              :class="['message-row', msg.role === 'user' ? 'user-row' : 'ai-row']"
          >
            <div v-if="msg.role === 'ai'" class="message-avatar">🤖</div>
            <div v-if="msg.role === 'user'" class="user-avatar">Me</div>
            <div class="message-bubble">
              <span v-html="formatMessage(msg.content)"></span>
            </div>
          </div>

          <div v-if="isThinking" class="message-row ai-row">
            <div class="message-avatar">🤖</div>
            <div class="message-bubble typing-bubble">
              <div class="typing-dot"></div>
              <div class="typing-dot"></div>
              <div class="typing-dot"></div>
            </div>
          </div>
        </div>

        <div class="chat-input-area">
          <input
              v-model="inputContent"
              @keyup.enter="sendMessage"
              type="text"
              placeholder="输入您的问题..."
          />
          <button class="send-btn" @click="sendMessage" :disabled="!inputContent.trim() || isThinking">
            <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="22" y1="2" x2="11" y2="13"></line><polygon points="22 2 15 22 11 13 2 9 22 2"></polygon></svg>
          </button>
        </div>
      </div>
    </transition>

    <div
        class="float-btn"
        :class="{ 'btn-active': isOpen }"
        @mousedown="startDrag"
    >
      <span v-if="!isOpen" class="icon-pulse">🤖</span>
      <span v-else class="icon-close">✖</span>
    </div>
  </div>
</template>

<script setup>
import { ref, nextTick, reactive, onUnmounted } from 'vue';
import { aiAPI } from '@/api';

// --- 状态管理 ---
const isOpen = ref(false);
const inputContent = ref('');
const isThinking = ref(false);
const messagesContainer = ref(null);
const messages = ref([
  { role: 'ai', content: '您好，我是您的专属 AI 助手。' }
]);

// --- 拖拽逻辑 ---
// 初始位置设定在右下角 (假设屏幕宽高，这里给个初始值，你可以根据 mounted 计算)
const pos = reactive({ x: window.innerWidth - 100, y: window.innerHeight - 150 });
let isDragging = false;
let hasMoved = false; // 用于区分是“点击”还是“拖拽”
let dragOffset = { x: 0, y: 0 };

const startDrag = (e) => {
  // 只允许左键拖拽
  if (e.button !== 0) return;

  isDragging = true;
  hasMoved = false;

  // 计算鼠标点击点相对于元素左上角的偏移
  dragOffset.x = e.clientX - pos.x;
  dragOffset.y = e.clientY - pos.y;

  // 绑定全局移动和松开事件
  document.addEventListener('mousemove', onDrag);
  document.addEventListener('mouseup', stopDrag);
};

const onDrag = (e) => {
  if (!isDragging) return;
  hasMoved = true; // 标记已经移动过了

  // 计算新位置
  let newX = e.clientX - dragOffset.x;
  let newY = e.clientY - dragOffset.y;

  // (可选) 边界限制：不让它拖出屏幕
  const maxX = window.innerWidth - 60; // 60是球的宽
  const maxY = window.innerHeight - 60;
  if (newX < 0) newX = 0;
  if (newY < 0) newY = 0;
  if (newX > maxX) newX = maxX;
  if (newY > maxY) newY = maxY;

  pos.x = newX;
  pos.y = newY;
};

const stopDrag = () => {
  isDragging = false;
  document.removeEventListener('mousemove', onDrag);
  document.removeEventListener('mouseup', stopDrag);

  // 如果没有发生移动（只是点击），则触发开关
  if (!hasMoved) {
    toggleChat();
  }
};

// --- 组件卸载时清理事件 ---
onUnmounted(() => {
  document.removeEventListener('mousemove', onDrag);
  document.removeEventListener('mouseup', stopDrag);
});


// --- 聊天功能 ---
const toggleChat = () => {
  isOpen.value = !isOpen.value;
  if (isOpen.value) {
    // 打开时，根据悬浮球位置智能调整窗口位置 (默认在球的上方偏左)
    // 这里CSS已经处理了 relative 定位，窗口会跟随父级 div 移动
    scrollToBottom();
  }
};

const scrollToBottom = async () => {
  await nextTick();
  if (messagesContainer.value) {
    messagesContainer.value.scrollTop = messagesContainer.value.scrollHeight;
  }
};

// 简单的换行处理
const formatMessage = (text) => {
  return text.replace(/\n/g, '<br>');
};

const sendMessage = async () => {
  const text = inputContent.value.trim();
  if (!text) return;

  messages.value.push({ role: 'user', content: text });
  inputContent.value = '';
  isThinking.value = true;
  scrollToBottom();

  try {
    const aiReplyText = await aiAPI.chat(text);
    console.log('收到AI回复:', aiReplyText);
    messages.value.push({ role: 'ai', content: aiReplyText || "（收到空回复）" });
  } catch (error) {
    console.error('AI 聊天请求失败:', error);
    const errorMsg = error?.response?.data?.message || error?.message || '未知错误';
    messages.value.push({ role: 'ai', content: `🔴 网络连接异常：${errorMsg}` });
  } finally {
    isThinking.value = false;
    scrollToBottom();
  }
};
</script>

<style scoped>
/* --- 容器 & 布局 --- */
.ai-chat-container {
  position: fixed;
  z-index: 9999;
  /* 禁止选中文字，优化拖拽体验 */
  user-select: none;
  /* 初始定位由 style 动态控制，这里设个默认防止闪烁 */
}

/* --- 炫酷悬浮球 --- */
.float-btn {
  width: 64px;
  height: 64px;
  border-radius: 50%;
  /* 使用系统主题色 */
  background: var(--primary-color, #1890ff);
  color: white;
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.15);
  cursor: grab;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 32px;
  transition: transform 0.2s, box-shadow 0.2s, background 0.2s;
  position: relative;
  border: 2px solid rgba(255,255,255,0.2);
}
.float-btn:active {
  cursor: grabbing;
  transform: scale(0.95);
  background: var(--primary-active, #096dd9);
}
.float-btn:hover {
  background: var(--primary-hover, #40a9ff);
  box-shadow: 0 15px 35px rgba(0, 0, 0, 0.2);
}
.btn-active {
  background: var(--primary-active, #096dd9);
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.2);
}

/* 呼吸灯动画 */
.icon-pulse {
  animation: pulse 2s infinite;
}
@keyframes pulse {
  0% { transform: scale(1); }
  50% { transform: scale(1.1); }
  100% { transform: scale(1); }
}

/* --- 聊天窗口 (加大号 + 毛玻璃) --- */
.chat-window {
  position: absolute;
  bottom: 80px; /* 在球的上方 */
  right: 0;
  width: 400px;  /* 宽度加大 */
  height: 600px; /* 高度加大 */
  background: var(--card-bg, #fff);
  backdrop-filter: blur(10px); /* 毛玻璃 */
  border-radius: 20px;
  box-shadow: 0 20px 50px var(--shadow-color, rgba(0, 0, 0, 0.2));
  display: flex;
  flex-direction: column;
  overflow: hidden;
  border: 1px solid var(--border-color, #e8e8e8);
  transform-origin: bottom right;
}

/* --- 顶部栏 --- */
.chat-header {
  padding: 20px;
  background: var(--primary-color, #1890ff);
  color: white;
  display: flex;
  justify-content: space-between;
  align-items: center;
}
.header-content {
  display: flex;
  align-items: center;
  gap: 12px;
}
.avatar-robot-glow {
  width: 40px;
  height: 40px;
  background: rgba(255,255,255,0.2);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 24px;
  box-shadow: 0 0 15px rgba(255,255,255,0.3);
}
.header-text {
  display: flex;
  flex-direction: column;
}
.title { font-weight: 700; font-size: 18px; letter-spacing: 0.5px; }
.subtitle { font-size: 12px; opacity: 0.8; }
.close-btn {
  background: rgba(255,255,255,0.2);
  border: none;
  border-radius: 50%;
  width: 32px;
  height: 32px;
  color: white;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: background 0.2s;
}
.close-btn:hover { 
  background: rgba(255,255,255,0.4); 
}

/* --- 消息列表 --- */
.chat-messages {
  flex: 1;
  padding: 20px;
  overflow-y: auto;
  background: var(--bg-color, #f5f7fa);
  display: flex;
  flex-direction: column;
  gap: 20px;
}
/* 滚动条美化 */
.chat-messages::-webkit-scrollbar { width: 6px; }
.chat-messages::-webkit-scrollbar-thumb { 
  background: var(--border-color, #cbd5e0); 
  border-radius: 3px; 
}
.chat-messages::-webkit-scrollbar-thumb:hover {
  background: var(--text-secondary, #999);
}

.message-row { 
  display: flex; 
  align-items: flex-start; 
  gap: 12px; 
}
.ai-row {
  justify-content: flex-start;
}
.user-row { 
  flex-direction: row-reverse;
  justify-content: flex-start;
}

.message-avatar, .user-avatar {
  width: 36px;
  height: 36px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  font-size: 14px;
  font-weight: bold;
}
.message-avatar { 
  background: var(--card-bg, #fff); 
  border: 1px solid var(--border-color, #e8e8e8); 
  color: var(--primary-color, #1890ff); 
  box-shadow: 0 2px 5px var(--shadow-color, rgba(0,0,0,0.05)); 
}
.user-avatar { 
  background: var(--primary-color, #1890ff); 
  color: white; 
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.15); 
}

.message-bubble {
  max-width: 75%;
  padding: 12px 16px;
  border-radius: 16px;
  font-size: 15px;
  line-height: 1.6;
  position: relative;
  box-shadow: 0 2px 5px var(--shadow-color, rgba(0,0,0,0.05));
}
.ai-row .message-bubble {
  background: var(--card-bg, #fff);
  color: var(--text-color, #333);
  border-top-left-radius: 2px;
}
.user-row .message-bubble {
  background: var(--primary-color, #1890ff);
  color: white;
  border-top-right-radius: 2px;
}

/* --- 输入框区域 --- */
.chat-input-area {
  padding: 15px;
  background: var(--card-bg, #fff);
  border-top: 1px solid var(--border-color, #e8e8e8);
  display: flex;
  gap: 12px;
  align-items: center;
}
.chat-input-area input {
  flex: 1;
  padding: 12px 16px;
  border: 2px solid var(--border-color, #e8e8e8);
  border-radius: 25px;
  outline: none;
  font-size: 15px;
  transition: border-color 0.2s;
  background: var(--card-bg, #fff);
  color: var(--text-color, #333);
}
.chat-input-area input:focus {
  border-color: var(--primary-color, #1890ff);
}
.chat-input-area input::placeholder {
  color: var(--text-secondary, #666);
}
.send-btn {
  width: 44px;
  height: 44px;
  background: var(--primary-color, #1890ff);
  color: white;
  border: none;
  border-radius: 50%;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}
.send-btn:hover:not(:disabled) {
  transform: translateY(-2px);
  background: var(--primary-hover, #40a9ff);
}
.send-btn:disabled {
  background: var(--border-color, #cbd5e0);
  cursor: not-allowed;
  box-shadow: none;
}

/* --- 思考中动画 --- */
.typing-bubble {
  display: flex;
  align-items: center;
  gap: 4px;
  padding: 16px 20px !important;
}
.typing-dot {
  width: 6px;
  height: 6px;
  background: var(--text-secondary, #666);
  border-radius: 50%;
  animation: typing 1.4s infinite ease-in-out both;
}
.typing-dot:nth-child(1) { animation-delay: -0.32s; }
.typing-dot:nth-child(2) { animation-delay: -0.16s; }
@keyframes typing {
  0%, 80%, 100% { transform: scale(0); }
  40% { transform: scale(1); }
}

/* --- 窗口开关过渡动画 --- */
.zoom-fade-enter-active, .zoom-fade-leave-active {
  transition: all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
}
.zoom-fade-enter-from, .zoom-fade-leave-to {
  opacity: 0;
  transform: scale(0.8) translateY(20px);
}
</style>