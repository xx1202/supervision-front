<template>
  <div class="document-page">
    <div class="page-header">
      <h1>系统文档</h1>
      <p>这里是系统的使用文档和说明</p>
    </div>
    
    <div class="document-content">
      <el-card class="doc-card">
        <template #header>
          <div class="card-header">
            <span>快速开始</span>
          </div>
        </template>
        <div class="doc-section">
          <h3>面包屑标签导航</h3>
          <p>本系统集成了面包屑标签导航功能，具有以下特性：</p>
          <ul>
            <li>自动记录用户访问的页面</li>
            <li>支持标签页之间的快速切换</li>
            <li>可以关闭不需要的标签页</li>
            <li>响应式设计，适配各种屏幕尺寸</li>
            <li>支持深色主题模式</li>
          </ul>
        </div>
      </el-card>
      
      <el-card class="doc-card">
        <template #header>
          <div class="card-header">
            <span>功能说明</span>
          </div>
        </template>
        <div class="doc-section">
          <h3>如何使用标签页</h3>
          <ol>
            <li>点击左侧菜单或页面中的链接访问新页面</li>
            <li>新页面会自动添加到标签页中</li>
            <li>点击标签页可以快速切换到对应页面</li>
            <li>点击标签页右侧的 X 按钮可以关闭标签页</li>
            <li>关闭当前标签页会自动切换到前一个标签页</li>
          </ol>
        </div>
      </el-card>
      
      <el-card class="doc-card">
        <template #header>
          <div class="card-header">
            <span>测试链接</span>
          </div>
        </template>
        <div class="doc-section">
          <h3>测试标签页功能</h3>
          <p>点击下面的按钮来测试标签页功能：</p>
          <div class="test-buttons">
            <el-button type="primary" @click="navigateTo('/admin/settings')">
              系统设置
            </el-button>
            <el-button type="success" @click="navigateTo('/admin/users')">
              用户管理
            </el-button>
            <el-button type="warning" @click="navigateTo('/admin/analytics')">
              数据分析
            </el-button>
          </div>
        </div>
      </el-card>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useRouter } from 'vue-router'

const router = useRouter()

const navigateTo = (path: string) => {
  router.push(path)
}
</script>

<style scoped lang="scss">
.document-page {
  .page-header {
    margin-bottom: 32px;
    
    h1 {
      font-size: 28px;
      color: #333;
      margin-bottom: 8px;
    }
    
    p {
      color: #666;
      font-size: 16px;
    }
  }
  
  .document-content {
    display: flex;
    flex-direction: column;
    gap: 24px;
    
    .doc-card {
      .card-header {
        font-weight: 600;
        color: #333;
      }
      
      .doc-section {
        h3 {
          color: #333;
          margin-bottom: 16px;
          font-size: 18px;
        }
        
        p {
          color: #666;
          line-height: 1.6;
          margin-bottom: 16px;
        }
        
        ul, ol {
          color: #666;
          line-height: 1.6;
          padding-left: 20px;
          
          li {
            margin-bottom: 8px;
          }
        }
        
        .test-buttons {
          display: flex;
          gap: 12px;
          flex-wrap: wrap;
        }
      }
    }
  }
}

// 深色主题适配
body.theme-dark {
  .document-page {
    .page-header {
      h1 {
        color: var(--text-color, #ffffff);
      }
      
      p {
        color: var(--text-color-secondary, #cccccc);
      }
    }
    
    .document-content {
      .doc-card {
        // 确保卡片本身使用Element Plus的深色主题样式
        background-color: #1f1f1f !important;
        border-color: #303030 !important;
        color: #ffffff !important;
        box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.3) !important;
        
        .card-header {
          color: #ffffff !important;
        }
        
        .doc-section {
          h3 {
            color: #ffffff !important;
          }
          
          p {
            color: #cccccc !important;
          }
          
          ul, ol {
            color: #cccccc !important;
          }
        }
      }
    }
  }
}

// 响应式设计
@media (max-width: 768px) {
  .document-page {
    .page-header {
      h1 {
        font-size: 24px;
      }
    }
    
    .document-content {
      .doc-card {
        .doc-section {
          .test-buttons {
            flex-direction: column;
            
            .el-button {
              width: 100%;
            }
          }
        }
      }
    }
  }
}
</style> 