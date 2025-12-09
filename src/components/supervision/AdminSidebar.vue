  <template>
  <div
    class="admin-sidebar"
    :class="{
      'is-mobile': isMobile,
      'is-collapsed': collapsed
    }"
  >
    <!-- 移动端遮罩层 -->
    <div
      v-if="isMobile"
      class="sidebar-overlay"
      @click="handleOverlayClick"
    ></div>

    <div class="sidebar-content">
      <!-- Logo区域 -->
      <div class="logo-section" :class="{ 'hide-in-standard': isStandardLayout }">
        <div class="logo-container" :class="{ 'logo-collapsed': collapsed }">
          <!-- <img
            src="@/assets/logo.png"
            alt="Logo"
            class="logo"
          > -->
          <span v-if="!collapsed && !isStandardLayout" class="logo-text">
            督导管理系统
          </span>
        </div>
      </div>

      <!-- 导航菜单 -->
      <div class="menu-section">
        <el-scrollbar class="menu-scrollbar">
          <el-menu
            :default-active="activeMenu"
            :collapse="collapsed"
            :collapse-transition="true"
            :unique-opened="false"
            router
            class="sidebar-menu"
          >
            <!-- 仪表板 - 所有用户可见 -->
            <el-menu-item index="/dashboard" class="menu-item">
              <el-icon><Monitor /></el-icon>
              <template #title>
                <span class="menu-text">仪表板</span>
              </template>
            </el-menu-item>

            <!-- 督导管理 - 所有用户可见 -->
            <el-sub-menu index="/supervision" class="submenu">
              <template #title>
                <el-icon><View /></el-icon>
                <span class="menu-text">督导管理</span>
              </template>

              <!-- 日常教学督导 -->
              <el-sub-menu index="/supervision/module1" class="submenu">
                <template #title>日常教学督导</template>

                <el-menu-item v-role="[USER_ROLES.ADMIN_OFFICE_DIRECTOR, USER_ROLES.ACADEMIC_ADMIN, USER_ROLES.SUPERVISOR]" index="/supervision/module1/schedule" class="submenu-item">
                  <el-icon><Calendar /></el-icon>
                  <template #title>督导安排</template>
                </el-menu-item>

                <el-menu-item v-role="[USER_ROLES.ADMIN_OFFICE_DIRECTOR, USER_ROLES.ACADEMIC_ADMIN]" index="/supervision/module1/audit" class="submenu-item">
                  <el-icon><DocumentChecked /></el-icon>
                  <template #title>督导审核</template>
                </el-menu-item>

                <el-menu-item v-role="[USER_ROLES.ADMIN_OFFICE_DIRECTOR, USER_ROLES.ACADEMIC_ADMIN, USER_ROLES.SUPERVISOR, USER_ROLES.STUDENT_SUPERVISOR, USER_ROLES.VISITOR]" index="/supervision/module1/approval_record" class="submenu-item">
                  <el-icon><PieChart /></el-icon>
                  <template #title>汇总记录</template>
                </el-menu-item>

                <el-menu-item v-role="[USER_ROLES.ADMIN_OFFICE_DIRECTOR, USER_ROLES.ACADEMIC_ADMIN, USER_ROLES.SUPERVISOR, USER_ROLES.STUDENT_SUPERVISOR]" index="/supervision/module1/record" class="submenu-item">
                  <el-icon><Document /></el-icon>
                  <template #title>督导记录</template>
                </el-menu-item>

                <el-menu-item v-role="[USER_ROLES.ADMIN_OFFICE_DIRECTOR, USER_ROLES.ACADEMIC_ADMIN, USER_ROLES.SUPERVISOR, USER_ROLES.STUDENT_SUPERVISOR, USER_ROLES.VISITOR]" index="/supervision/module1/statistics" class="submenu-item">
                  <el-icon><Histogram /></el-icon>
                  <template #title>督导统计</template>
                </el-menu-item>

                <el-menu-item v-role="[USER_ROLES.ADMIN_OFFICE_DIRECTOR, USER_ROLES.ACADEMIC_ADMIN, USER_ROLES.SUPERVISOR]" index="/supervision/module1/document" class="submenu-item">
                  <el-icon><Files /></el-icon>
                  <template #title>督导文档</template>
                </el-menu-item>


              </el-sub-menu>

              <!-- 行政坐班 -->
              <el-sub-menu index="/supervision/module2" class="submenu">
                <template #title>行政坐班</template>

                <el-menu-item v-role="[USER_ROLES.ADMIN_OFFICE_DIRECTOR, USER_ROLES.ACADEMIC_ADMIN, USER_ROLES.STUDENT_ADMIN]" index="/supervision/module2/schedule" class="submenu-item">
                  <el-icon><Calendar /></el-icon>
                  <template #title>坐班安排</template>
                </el-menu-item>

                <el-menu-item v-role="[USER_ROLES.ADMIN_OFFICE_DIRECTOR, USER_ROLES.ACADEMIC_ADMIN, USER_ROLES.STUDENT_ADMIN, USER_ROLES.SUPERVISOR]" index="/supervision/module2/attendance" class="submenu-item">
                  <el-icon><User /></el-icon>
                  <template #title>考勤记录</template>
                </el-menu-item>

                <el-menu-item v-role="[USER_ROLES.ADMIN_OFFICE_DIRECTOR, USER_ROLES.ACADEMIC_ADMIN, USER_ROLES.STUDENT_ADMIN, USER_ROLES.SUPERVISOR]" index="/supervision/module2/activity" class="submenu-item">
                  <el-icon><Edit /></el-icon>
                  <template #title>教研室活动</template>
                </el-menu-item>

                <el-menu-item v-role="[USER_ROLES.ADMIN_OFFICE_DIRECTOR, USER_ROLES.ACADEMIC_ADMIN, USER_ROLES.STUDENT_ADMIN]" index="/supervision/module2/movement" class="submenu-item">
                  <el-icon><Location /></el-icon>
                  <template #title>人员异动</template>
                </el-menu-item>
              </el-sub-menu>

              <!-- 教室巡查 -->
              <el-sub-menu index="/supervision/module3" class="submenu">
                <template #title>教室巡查</template>

                <el-menu-item v-role="[USER_ROLES.ADMIN_OFFICE_DIRECTOR, USER_ROLES.TRAINING_ADMIN]" index="/supervision/module3/plan" class="submenu-item">
                  <el-icon><Calendar /></el-icon>
                  <template #title>巡查计划</template>
                </el-menu-item>

                <el-menu-item v-role="[USER_ROLES.ADMIN_OFFICE_DIRECTOR, USER_ROLES.TRAINING_ADMIN, USER_ROLES.TRAINING_TEACHER, USER_ROLES.STUDENT_SUPERVISOR]" index="/supervision/module3/record" class="submenu-item">
                  <el-icon><Document /></el-icon>
                  <template #title>巡查记录</template>
                </el-menu-item>

                <el-menu-item v-role="[USER_ROLES.ADMIN_OFFICE_DIRECTOR, USER_ROLES.TRAINING_ADMIN]" index="/supervision/module3/item" class="submenu-item">
                  <el-icon><List /></el-icon>
                  <template #title>巡查项目</template>
                </el-menu-item>

                <el-menu-item v-role="[USER_ROLES.ADMIN_OFFICE_DIRECTOR, USER_ROLES.TRAINING_ADMIN, USER_ROLES.TRAINING_TEACHER, USER_ROLES.STUDENT_SUPERVISOR, USER_ROLES.VISITOR]" index="/supervision/module3/statistics" class="submenu-item">
                  <el-icon><PieChart /></el-icon>
                  <template #title>巡查统计</template>
                </el-menu-item>
              </el-sub-menu>
            </el-sub-menu>

            <!-- 基础数据 - 管理员角色可见 -->
            <el-sub-menu v-role="[USER_ROLES.ADMIN_OFFICE_DIRECTOR, USER_ROLES.ACADEMIC_ADMIN, USER_ROLES.STUDENT_ADMIN, USER_ROLES.TRAINING_ADMIN]" index="/basic-data" class="submenu">
              <template #title>
                <el-icon><DataAnalysis /></el-icon>
                <span class="menu-text">基础数据</span>
              </template>

              <el-menu-item v-role="[USER_ROLES.ADMIN_OFFICE_DIRECTOR, USER_ROLES.ACADEMIC_ADMIN, USER_ROLES.STUDENT_ADMIN]" index="/basic-data/classes" class="submenu-item">
                <el-icon><School /></el-icon>
                <template #title>班级管理</template>
              </el-menu-item>

              <el-menu-item v-role="[USER_ROLES.ADMIN_OFFICE_DIRECTOR, USER_ROLES.ACADEMIC_ADMIN, USER_ROLES.TRAINING_ADMIN]" index="/basic-data/classrooms" class="submenu-item">
                <el-icon><House /></el-icon>
                <template #title>教室管理</template>
              </el-menu-item>

              <el-menu-item v-role="[USER_ROLES.ADMIN_OFFICE_DIRECTOR, USER_ROLES.ACADEMIC_ADMIN]" index="/basic-data/courses" class="submenu-item">
                <el-icon><Reading /></el-icon>
                <template #title>课程管理</template>
              </el-menu-item>

              <el-menu-item v-role="[USER_ROLES.ADMIN_OFFICE_DIRECTOR, USER_ROLES.ACADEMIC_ADMIN, USER_ROLES.STUDENT_ADMIN, USER_ROLES.TRAINING_ADMIN]" index="/basic-data/offices" class="submenu-item">
                <el-icon><OfficeBuilding /></el-icon>
                <template #title>办公室管理</template>
              </el-menu-item>

              <el-menu-item v-role="[USER_ROLES.ADMIN_OFFICE_DIRECTOR, USER_ROLES.ACADEMIC_ADMIN, USER_ROLES.STUDENT_ADMIN, USER_ROLES.TRAINING_ADMIN]" index="/basic-data/schedules" class="submenu-item">
                <el-icon><OfficeBuilding /></el-icon>
                <template #title>课表管理</template>
              </el-menu-item>
            </el-sub-menu>

            <!-- 统计分析 - 所有用户可见 -->
            <el-sub-menu index="/statistics" class="submenu">
              <template #title>
                <el-icon><PieChart /></el-icon>
                <span class="menu-text">统计分析</span>
              </template>

              <el-menu-item index="/statistics/overview" class="submenu-item">
                <el-icon><DataBoard /></el-icon>
                <template #title>统计概览</template>
              </el-menu-item>

              <el-menu-item v-role="[USER_ROLES.ADMIN_OFFICE_DIRECTOR, USER_ROLES.ACADEMIC_ADMIN, USER_ROLES.STUDENT_ADMIN, USER_ROLES.TRAINING_ADMIN, USER_ROLES.SUPERVISOR]" index="/statistics/reports" class="submenu-item">
                <el-icon><Document /></el-icon>
                <template #title>报表管理</template>
              </el-menu-item>

              <el-menu-item v-role="[USER_ROLES.ADMIN_OFFICE_DIRECTOR, USER_ROLES.ACADEMIC_ADMIN, USER_ROLES.STUDENT_ADMIN, USER_ROLES.TRAINING_ADMIN]" index="/statistics/export" class="submenu-item">
                <el-icon><Download /></el-icon>
                <template #title>数据导出</template>
              </el-menu-item>
            </el-sub-menu>

            <!-- 系统管理 - 只有政务办主任可见 -->
            <el-sub-menu v-role="[USER_ROLES.ADMIN_OFFICE_DIRECTOR]" index="/system" class="submenu">
              <template #title>
                <el-icon><Setting /></el-icon>
                <!-- <el-icon><Tools /></el-icon> -->
                <span class="menu-text">系统管理</span>
              </template>

              <el-menu-item index="/system/users" class="submenu-item">
                <el-icon><User /></el-icon>
                <template #title>用户管理</template>
              </el-menu-item>

              <el-menu-item index="/system/roles" class="submenu-item">
                <el-icon><UserFilled /></el-icon>
                <template #title>角色管理</template>
              </el-menu-item>

              <el-menu-item index="/system/permissions" class="submenu-item">
                <el-icon><Lock /></el-icon>
                <template #title>权限管理</template>
              </el-menu-item>
            </el-sub-menu>
          </el-menu>
        </el-scrollbar>
      </div>

      <!-- 侧边栏底部 -->
      <div class="sidebar-footer">
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { useRoute } from 'vue-router'
import { useThemeStore } from '../../store/theme'
import { useUserStore } from '../../store/modules/user'
import { USER_ROLES } from '@/utils/permission'
import {
  Monitor,
  View,
  Calendar,
  Document,
  PieChart,
  Files,
  User,
  Edit,
  Location,
  List,
  DataAnalysis,
  School,
  House,
  Reading,
  OfficeBuilding,
  DataBoard,
  Download,
  Setting,
  UserFilled,
  Lock,
  DocumentChecked,
  Histogram,
  Tools,
} from '@element-plus/icons-vue'

interface Props {
  activeMenu?: string
  collapsed?: boolean
  layout?: string
}

const props = withDefaults(defineProps<Props>(), {
  activeMenu: '',
  collapsed: false,
  layout: 'default'
})

const emit = defineEmits<{
  'toggle-collapse': []
}>()

const route = useRoute()
const themeStore = useThemeStore()
const userStore = useUserStore()

// 响应式状态
const isMobile = ref(false)

// 是否为标准布局
const isStandardLayout = computed(() => props.layout === 'standard')



// 计算属性
const activeMenu = computed(() => {
  return props.activeMenu || route.path
})

// 方法
const toggleCollapse = () => {
  emit('toggle-collapse')
}

const handleOverlayClick = () => {
  if (isMobile.value) {
    emit('toggle-collapse')
  }
}

// 检查是否为移动端
const checkMobile = () => {
  isMobile.value = window.innerWidth < 768
}

// 监听窗口大小变化
watch(() => window.innerWidth, checkMobile, { immediate: true })

// 监听路由变化，在移动端自动关闭侧边栏
watch(() => route.path, () => {
  if (isMobile.value) {
    emit('toggle-collapse')
  }
})
</script>

<style scoped lang="scss">
.admin-sidebar {
  position: relative;
  height: 100vh;
  background: var(--sidebar-bg, #667eea);
  box-shadow: 2px 0 8px rgba(0, 0, 0, 0.1);
  transition: all 0.3s cubic-bezier(0.645, 0.045, 0.355, 1);
  z-index: 1000;
  overflow: hidden;

  // 默认宽度 - 使用主题配置
  width: var(--sidebar-width, 160px);
  min-width: 160px;
  max-width: 320px;
  
  // 收缩状态
  &.is-collapsed {
    width: 64px;
    min-width: 64px;
    
    .logo-section {
      padding: 20px 8px;
      
      .logo-text {
        opacity: 0;
        width: 0;
        overflow: hidden;
      }
    }
    
    .sidebar-footer {
      padding: 16px 8px;
    }
  }


  // 移动端样式
  &.is-mobile {
    position: fixed;
    top: 0;
    left: 0;
    z-index: 2000;

    .sidebar-overlay {
      position: fixed;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background: rgba(0, 0, 0, 0.5);
      z-index: -1;
    }
  }
}

.sidebar-content {
  height: 100%;
  display: flex;
  flex-direction: column;
}

.logo-section {
  padding: 20px 16px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
  display: flex;
  align-items: center;
  justify-content: space-between;
  min-height: 60px;
  box-sizing: border-box;
  transition: all 0.3s cubic-bezier(0.645, 0.045, 0.355, 1);

  &.hide-in-standard {
    display: none;
    padding: 0;
    min-height: 0;
    height: 0;
    border-bottom: none;
    overflow: hidden;
  }

  .logo-container {
    display: flex;
    align-items: center;
    gap: 12px;
    overflow: hidden;

    .logo {
      width: 32px;
      height: 32px;
      border-radius: 6px;
      flex-shrink: 0;
      transition: all 0.3s cubic-bezier(0.645, 0.045, 0.355, 1);
    }

    .logo-text {
      font-size: 18px;
      font-weight: 600;
      color: #ffffff;
      white-space: nowrap;
      transition: all 0.3s cubic-bezier(0.645, 0.045, 0.355, 1);
      overflow: hidden;
    }
  }

  .close-btn {
    color: #ffffff;

    &:hover {
      background: rgba(255, 255, 255, 0.1);
    }
  }
}

.menu-section {
  flex: 1;
  overflow: hidden;

  .menu-scrollbar {
    height: 100%;

    .sidebar-menu {
      border: none;
      background-color: transparent;
      
      // 使用 Element Plus 的 CSS 变量
      --el-menu-bg-color: transparent;
      --el-menu-text-color: #ffffff;
      --el-menu-hover-bg-color: rgba(255, 255, 255, 0.1);
      --el-menu-active-color: #ffffff;
      
      // 优化 Element Plus Menu 的折叠动画
      :deep(.el-menu--collapse) {
        .el-menu-item,
        .el-sub-menu__title {
          span,
          .el-sub-menu__icon-arrow {
            transition: opacity 0.2s cubic-bezier(0.645, 0.045, 0.355, 1),
                        width 0.2s cubic-bezier(0.645, 0.045, 0.355, 1);
          }
        }
      }
      
      :deep(.el-menu-item),
      :deep(.el-sub-menu__title) {
        margin: 4px 8px;
        border-radius: 8px;
        color: var(--el-menu-text-color);
        transition: all 0.3s cubic-bezier(0.645, 0.045, 0.355, 1);
        
        &:hover {
          background-color: var(--el-menu-hover-bg-color);
        }
        
        &.is-active {
          background: rgba(255, 255, 255, 0.2);
          color: var(--el-menu-active-color);
        }
      }
      
      :deep(.el-sub-menu .el-menu-item) {
        margin: 2px 8px;
        border-radius: 6px;
        transition: all 0.3s cubic-bezier(0.645, 0.045, 0.355, 1);
        
        &:hover {
          background-color: var(--el-menu-hover-bg-color);
        }
        
        &.is-active {
          background: rgba(255, 255, 255, 0.2);
        }
      }

      .menu-text {
        font-size: 14px;
        font-weight: 500;
        transition: opacity 0.2s cubic-bezier(0.645, 0.045, 0.355, 1);
      }
    }
  }
}

.sidebar-footer {
  padding: 16px;
  border-top: 1px solid rgba(255, 255, 255, 0.1);
  display: flex;
  justify-content: center;
  transition: all 0.3s cubic-bezier(0.645, 0.045, 0.355, 1);

  .collapse-btn {
    color: #ffffff;
    width: 32px;
    height: 32px;
    border-radius: 6px;
    transition: all 0.3s cubic-bezier(0.645, 0.045, 0.355, 1);

    &:hover {
      background: rgba(255, 255, 255, 0.1);
    }
  }
}

// 深色主题适配
body.theme-dark {
  .admin-sidebar {
    background: var(--sidebar-bg, #2c3e50);
  }
}

// 响应式设计
@media (max-width: 1200px) {
  .admin-sidebar {
    width: var(--sidebar-width, 160px);
    min-width: 160px;
    max-width: 200px;

    &.is-collapsed {
      width: var(--sidebar-collapsed-width, 64px);
      min-width: 64px;
      max-width: 64px;
    }
  }
}

@media (max-width: 768px) {
  .admin-sidebar {
    width: var(--sidebar-width, 160px);
    min-width: 160px;
    max-width: 200px;
    transform: translateX(-100%);

    &.is-collapsed {
      transform: translateX(0);
      width: var(--sidebar-collapsed-width, 64px);
      min-width: 64px;
      max-width: 64px;
    }
  }
}

@media (min-width: 1600px) {
  .admin-sidebar {
    width: var(--sidebar-width, 160px);
    min-width: 160px;
    max-width: 240px;

    &.is-collapsed {
      width: var(--sidebar-collapsed-width, 64px);
      min-width: 64px;
      max-width: 64px;
    }
  }
}
</style>
