# 教学督导管理前端（supervision-front）

基于 Vue 3 + TypeScript + Vite 构建的教学督导管理系统前端，涵盖督导安排、督导记录、统计分析、基础数据、系统与用户管理等模块，支持权限控制与主题切换（含深色主题）。

---

## 技术栈
- Vue 3 (`^3.5.17`)
- TypeScript (`~5.8.3`)
- Vite (`^7.0.4`)
- Vue Router (`^4.5.1`)
- Pinia (`^3.0.3`)
- Element Plus (`^2.10.4`)
- Axios (`^1.11.0`)
- ECharts (`^6.0.0`)
- Sass (`^1.89.2`)

## 运行环境要求
- Node.js >= 18.18（推荐 LTS）
- 包管理器：npm（或 pnpm/yarn，本文以 npm 为例）

## 快速开始
```bash
# 安装依赖
npm install

# 开发模式启动（默认 3000 端口）
npm run dev

# 生产构建
npm run build

# 本地预览构建产物
npm run preview
```

启动后访问：`http://localhost:3000`

> 后端接口默认代理至 `http://localhost:8080`，前端请求基础路径为 `/api`（详见下文环境与代理配置）。

## 环境与代理配置
- Vite 开发服务器端口：`3000`
- 路由历史模式：`createWebHistory()`
- 路由根路径重定向：`/ -> /dashboard`
- 别名：`@ -> ./src`
- 代理规则（`vite.config.ts`）：
  - 以 `/api` 开头的请求，代理到 `http://localhost:8080`，并保持 `/api` 前缀
- 请求基础地址（`src/utils/request.ts`）：
  - 开发/生产默认均为：`http://localhost:8080/api`

如需切换后端地址：
- 开发环境：修改 `vite.config.ts` 中 `server.proxy['/api'].target`
- 运行时请求：调整 `src/utils/request.ts` 中的 `getBaseURL()` 返回值

## 认证与权限
- 认证：登录成功后由拦截器保存 `token/refreshToken`（`src/utils/request.ts` + `src/utils/token-manager.ts`）
- 刷新 Token：收到 401 时自动排队刷新，刷新成功后重放失败请求
- 权限：
  - 路由守卫：`src/router/guards/auth-guard.ts`、`src/router/guards/permission-guard.ts`
  - 指令：`v-permission`（`src/directives/permission.ts`）用于按钮/区域级权限控制

## 主题与样式
- 全局样式：`src/common.scss`、`src/style.css`
- 主题管理：`src/utils/theme-manager.ts`，全局注入 `$switchTheme(useCustom: boolean)`
- 深色主题：`src/styles/element-dark.scss`
- Element Plus 样式：`element-plus/dist/index.css`

## 主要功能模块（路由）
- 仪表板：`/dashboard`（`src/router/modules/dashboard-routes.ts`）
- 督导管理：安排、巡查、记录、审批与汇总（`src/router/modules/supervision-routes.ts`）
- 基础数据：课程、班级、教室、办公室等（`src/router/modules/basic-data-routes.ts`）
- 统计分析：教师、班级、出勤、教学/学习评分等（`src/router/modules/statistics-routes.ts`）
- 系统管理：角色、权限、菜单（`src/router/modules/system-routes.ts`）
- 用户中心：资料、密码、头像等（`src/router/modules/user-routes.ts`）
- 登录与 404：`/login`、`/:pathMatch(.*)*`

对应 API 见 `src/api/index.ts`，已按领域拆分导出，如 `authAPI`、`userAPI`、`courseAPI` 等。

## 目录结构（简要）
```
supervision-front_2.2/
├─ dist/                 # 生产构建产物
├─ public/               # 静态资源
├─ src/
│  ├─ api/               # 后端接口封装（集中在 index.ts）
│  ├─ assets/            # 前端资源（图标等）
│  ├─ components/        # 业务组件（含基础数据对话框、通用组件等）
│  ├─ directives/        # 自定义指令（权限）
│  ├─ layouts/           # 布局组件（MainLayout）
│  ├─ router/            # 路由与路由守卫
│  ├─ store/             # Pinia 状态管理
│  ├─ styles/            # 主题与变量样式
│  ├─ utils/             # 工具（request、token、theme 等）
│  ├─ views/             # 页面视图（按模块划分）
│  ├─ App.vue            # 根组件
│  └─ main.ts            # 入口文件
├─ vite.config.ts        # Vite 配置（别名、代理、扩展名）
├─ package.json          # 脚本与依赖
└─ tsconfig*.json        # TS 配置
```

## 常见问题（FAQ）
- 构建后静态资源 404？
  - 本项目 `base: './'`，确保部署路径下相对资源可访问；若部署在子路径，请保持此设置或在服务器正确配置静态资源根路径。
- 接口 404 或跨域？
  - 开发环境：确认后端运行在 `http://localhost:8080`，或修改 `vite.config.ts` 代理目标。
  - 生产环境：`request.ts` 默认直连 `http://localhost:8080/api`，按需改为真实线上地址。
- Token 过期导致的请求失败？
  - 已内置刷新机制；若持续失败，请检查后端刷新接口与返回格式，或清除本地存储后重新登录。

## 代码风格与约定
- 使用 TypeScript，类型定义集中在 `src/types/`
- 组件与函数命名语义化，避免过度缩写
- 避免深层嵌套，优先早返回与错误优先处理
- 保持与项目现有格式风格一致

## 许可证
内部项目，未明确开源许可证。如需开源或分发，请先补充 LICENSE 并遵循相应条款。
