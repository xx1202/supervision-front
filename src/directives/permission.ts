import type { Directive, DirectiveBinding } from 'vue'
import { checkComponentPermission, getUserInfo } from '@/utils/permission'

/**
 * 权限指令
 * 用法：v-permission="'supervision:create'"
 * 用法：v-permission="['supervision:create', 'supervision:edit']"
 */
export const permission: Directive = {
  mounted(el: HTMLElement, binding: DirectiveBinding) {
    const { value } = binding
    
    if (!value) {
      return
    }
    
    const user = getUserInfo()
    if (!user) {
      el.style.display = 'none'
      return
    }
    
    let hasPermission = false
    
    if (Array.isArray(value)) {
      // 多个权限，只要有一个满足即可
      hasPermission = value.some(permission => 
        checkComponentPermission(permission, user)
      )
    } else {
      // 单个权限
      hasPermission = checkComponentPermission(value, user)
    }
    
    if (!hasPermission) {
      el.style.display = 'none'
    }
  },
  
  updated(el: HTMLElement, binding: DirectiveBinding) {
    const { value } = binding
    
    if (!value) {
      el.style.display = ''
      return
    }
    
    const user = getUserInfo()
    if (!user) {
      el.style.display = 'none'
      return
    }
    
    let hasPermission = false
    
    if (Array.isArray(value)) {
      hasPermission = value.some(permission => 
        checkComponentPermission(permission, user)
      )
    } else {
      hasPermission = checkComponentPermission(value, user)
    }
    
    el.style.display = hasPermission ? '' : 'none'
  }
}

/**
 * 角色指令
 * 用法：v-role="'ADMIN_OFFICE_DIRECTOR'"
 * 用法：v-role="['ADMIN_OFFICE_DIRECTOR', 'ACADEMIC_ADMIN']"
 */
export const role: Directive = {
  mounted(el: HTMLElement, binding: DirectiveBinding) {
    const { value } = binding
    
    if (!value) {
      return
    }
    
    const user = getUserInfo()
    if (!user) {
      el.style.display = 'none'
      return
    }
    
    let hasRole = false
    
    if (Array.isArray(value)) {
      hasRole = value.some(role => user.roles.includes(role))
    } else {
      hasRole = user.roles.includes(value)
    }
    

    
    if (!hasRole) {
      el.style.display = 'none'
    }
  },
  
  updated(el: HTMLElement, binding: DirectiveBinding) {
    const { value } = binding
    
    if (!value) {
      el.style.display = ''
      return
    }
    
    const user = getUserInfo()
    if (!user) {
      el.style.display = 'none'
      return
    }
    
    let hasRole = false
    
    if (Array.isArray(value)) {
      hasRole = value.some(role => user.roles.includes(role))
    } else {
      hasRole = user.roles.includes(value)
    }
    

    
    el.style.display = hasRole ? '' : 'none'
  }
}



/**
 * 注册所有权限指令
 */
export const registerPermissionDirectives = (app: { directive: (name: string, directive: any) => void }) => {
  app.directive('permission', permission)
  app.directive('role', role)
} 