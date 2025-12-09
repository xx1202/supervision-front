# 常量使用说明

本项目采用统一的常量管理系统，所有常量按模块分类，便于维护和使用。

## 📁 文件结构

```
constants/
├── index.ts          # 统一导出所有常量
├── common.ts         # 通用常量（状态、客户端类型等）
├── supervision.ts    # 督导相关常量
├── attendance.ts     # 考勤相关常量
├── user.ts           # 用户和角色常量
├── basic-data.ts     # 基础数据常量
└── system.ts         # 系统常量（报表、文件等）
```

## 🚀 快速开始

### 导入常量

```typescript
// 方式一：从统一入口导入
import { 
  ATTENDANCE_STATUS, 
  ATTENDANCE_STATUS_MAP,
  SUPERVISION_STATUS,
  COURSE_TYPE
} from '@/constants'

// 方式二：从具体文件导入
import { ATTENDANCE_STATUS } from '@/constants/attendance'
```

## 📚 常量分类

### 1. 通用常量 (`common.ts`)

#### 通用状态（数字）
```typescript
import { COMMON_STATUS, COMMON_STATUS_MAP } from '@/constants'

// 使用
const status = COMMON_STATUS.ENABLED // 1
const statusInfo = COMMON_STATUS_MAP[status] // { label: '启用', type: 'success' }
```

#### 通用状态（字符串）
```typescript
import { COMMON_STATUS_STRING, COMMON_STATUS_STRING_MAP } from '@/constants'

const status = COMMON_STATUS_STRING.ACTIVE // 'active'
```

#### 客户端类型
```typescript
import { CLIENT_TYPE, CLIENT_TYPE_MAP } from '@/constants'

const clientType = CLIENT_TYPE.WEB // 'web'
const label = CLIENT_TYPE_MAP[clientType] // 'Web端'
```

### 2. 督导常量 (`supervision.ts`)

#### 督导状态
```typescript
import { SUPERVISION_STATUS, SUPERVISION_STATUS_MAP } from '@/constants'

// 使用
const status = SUPERVISION_STATUS.PENDING // 'pending'
const statusInfo = SUPERVISION_STATUS_MAP[status] 
// { label: '待开始', type: 'info' }
```

#### 督导记录状态
```typescript
import { SUPERVISION_RECORD_STATUS, SUPERVISION_RECORD_STATUS_MAP } from '@/constants'

const status = SUPERVISION_RECORD_STATUS.DRAFT // 'draft'
const statusInfo = SUPERVISION_RECORD_STATUS_MAP[status]
// { label: '草稿', type: 'info' }
```

#### 模块类型
```typescript
import { MODULE_TYPE, MODULE_TYPE_MAP } from '@/constants'

const moduleType = MODULE_TYPE.DAILY_TEACHING // 'daily_teaching'
const label = MODULE_TYPE_MAP[moduleType] // '日常教学督导'
```

### 3. 考勤常量 (`attendance.ts`)

#### 考勤状态
```typescript
import { ATTENDANCE_STATUS, ATTENDANCE_STATUS_MAP } from '@/constants'

const status = ATTENDANCE_STATUS.PRESENT // 'present'
const statusInfo = ATTENDANCE_STATUS_MAP[status]
// { label: '在岗', type: 'success' }
```

#### 异动类型
```typescript
import { MOVEMENT_TYPE, MOVEMENT_TYPE_MAP } from '@/constants'

const type = MOVEMENT_TYPE.BUSINESS_TRIP // 'business_trip'
const label = MOVEMENT_TYPE_MAP[type] // '出差'
```

#### 审批状态
```typescript
import { APPROVAL_STATUS, APPROVAL_STATUS_MAP } from '@/constants'

const status = APPROVAL_STATUS.PENDING // 'pending'
const statusInfo = APPROVAL_STATUS_MAP[status]
// { label: '待审批', type: 'warning' }
```

### 4. 用户常量 (`user.ts`)

#### 用户状态
```typescript
import { USER_STATUS, USER_STATUS_MAP } from '@/constants'

const status = USER_STATUS.ACTIVE // 'active'
const statusInfo = USER_STATUS_MAP[status]
// { label: '激活', type: 'success' }
```

#### 角色名称映射
```typescript
import { ROLE_CODE_NAME_MAP } from '@/constants'
import { USER_ROLES } from '@/utils/permission'

const roleName = ROLE_CODE_NAME_MAP[USER_ROLES.ADMIN_OFFICE_DIRECTOR]
// '政务办主任'
```

### 5. 基础数据常量 (`basic-data.ts`)

#### 课程/教室类型
```typescript
import { COURSE_TYPE, COURSE_TYPE_MAP } from '@/constants'

const type = COURSE_TYPE.THEORY // 'theory'
const label = COURSE_TYPE_MAP[type] // '理论课'
```

#### 星期
```typescript
import { WEEK_DAY, WEEK_DAY_LABEL_MAP } from '@/constants'

const day = WEEK_DAY.MONDAY // 1
const label = WEEK_DAY_LABEL_MAP[day] // '星期一'
```

### 6. 系统常量 (`system.ts`)

#### 报表类型
```typescript
import { REPORT_TYPE, REPORT_TYPE_MAP } from '@/constants'

const type = REPORT_TYPE.SUPERVISION_BULLETIN // 'supervision_bulletin'
const label = REPORT_TYPE_MAP[type] // '督导通报'
```

## 💡 使用示例

### 示例 1：在表格中显示状态标签

```vue
<template>
  <el-table-column label="状态">
    <template #default="scope">
      <el-tag :type="getStatusType(scope.row.status)">
        {{ getStatusLabel(scope.row.status) }}
      </el-tag>
    </template>
  </el-table-column>
</template>

<script setup lang="ts">
import { ATTENDANCE_STATUS_MAP } from '@/constants'

const getStatusType = (status: string) => {
  return ATTENDANCE_STATUS_MAP[status]?.type || 'info'
}

const getStatusLabel = (status: string) => {
  return ATTENDANCE_STATUS_MAP[status]?.label || status
}
</script>
```

### 示例 2：在表单中使用常量

```vue
<script setup lang="ts">
import { ATTENDANCE_STATUS, ATTENDANCE_STATUS_MAP } from '@/constants'

const statusOptions = Object.keys(ATTENDANCE_STATUS_MAP).map(key => ({
  label: ATTENDANCE_STATUS_MAP[key].label,
  value: key
}))
</script>
```

### 示例 3：状态判断

```typescript
import { ATTENDANCE_STATUS } from '@/constants'

const isPresent = (status: string) => {
  return status === ATTENDANCE_STATUS.PRESENT
}

const isAbsentOrTemporary = (status: string) => {
  return status === ATTENDANCE_STATUS.ABSENT || 
         status === ATTENDANCE_STATUS.TEMPORARY_ABSENT
}
```

### 示例 4：使用常量进行比较

```typescript
import { SUPERVISION_STATUS } from '@/constants'

if (schedule.status === SUPERVISION_STATUS.COMPLETED) {
  // 已完成，不允许编辑
  return false
}
```

## 🔍 查找常量

### 根据用途查找

- **状态类常量**：查找 `*_STATUS` 或 `*_STATUS_MAP`
- **类型类常量**：查找 `*_TYPE` 或 `*_TYPE_MAP`
- **权限类常量**：查找 `*_ROLES` 或 `*_PERMISSIONS`

### 常用常量索引

| 用途 | 常量名称 | 文件 |
|------|---------|------|
| 考勤状态 | `ATTENDANCE_STATUS` | `attendance.ts` |
| 督导状态 | `SUPERVISION_STATUS` | `supervision.ts` |
| 记录状态 | `SUPERVISION_RECORD_STATUS` | `supervision.ts` |
| 审批状态 | `APPROVAL_STATUS` | `attendance.ts` |
| 用户状态 | `USER_STATUS` | `user.ts` |
| 课程类型 | `COURSE_TYPE` | `basic-data.ts` |
| 模块类型 | `MODULE_TYPE` | `supervision.ts` |

## ⚠️ 注意事项

1. **不要硬编码字符串**：始终使用常量而不是字符串字面量
2. **使用类型安全**：常量使用 `as const` 确保类型推断
3. **统一导入**：从 `@/constants` 统一导入，避免重复导入
4. **标签映射**：使用 `*_MAP` 获取显示标签，不要手动拼接

## 🔄 更新常量

如果需要添加新常量：

1. 在对应的常量文件中添加
2. 在 `index.ts` 中导出（如果需要）
3. 更新本文档
4. 确保所有使用的地方都使用新常量

## 📝 最佳实践

1. ✅ **使用常量而非字符串**
   ```typescript
   // ✅ 好
   if (status === ATTENDANCE_STATUS.PRESENT) { ... }
   
   // ❌ 不好
   if (status === 'present') { ... }
   ```

2. ✅ **使用标签映射获取显示文本**
   ```typescript
   // ✅ 好
   const label = ATTENDANCE_STATUS_MAP[status]?.label
   
   // ❌ 不好
   const label = status === 'present' ? '在岗' : '缺岗'
   ```

3. ✅ **在类型定义中使用常量类型**
   ```typescript
   type AttendanceStatus = typeof ATTENDANCE_STATUS[keyof typeof ATTENDANCE_STATUS]
   ```

