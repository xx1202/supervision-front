import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

// https://vite.dev/config/
import { resolve } from 'path'
export default defineConfig({
  plugins: [vue()],
  base: '/', // 使用绝对路径，避免路由路径影响资源加载
  resolve: {
    alias: {
      '@': resolve(__dirname, './src')
    },
    //extensions: [".ts", ".js", ".vue", ".json", ".mjs"],
    extensions: [".mjs", ".js", ".ts", ".jsx", ".tsx", ".json", ".vue"]
  },
  // 开发服务器配置
  server: {
    allowedHosts: true, // 允许所有外部域名（包括 ngrok）访问
    host: '0.0.0.0',
    port: 3000,
    proxy: {
      // 代理 /api 开头的请求到后端服务器
      '/api': {
        target: 'http://localhost:8080',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api/, '/api')
      }
    },
  },
  // 预览服务器配置（打包后运行 npm run preview 时的端口）
  preview: {
    port: 3000, // 可以修改为你想要的端口，例如 8080、3000 等
    host: true, // 允许外部访问
    open: true, // 自动打开浏览器
    proxy: {
      // 代理 /api 开头的请求到后端服务器
      '/api': {
        target: 'http://localhost:8080',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api/, '/api')
      }
    },
  },
  // 定义全局变量以支持 sockjs-client
  define: {
    global: 'globalThis'
  }
})  
