// AuthGuard - 处理全局认证状态和 Token 失效跳转

import { useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { setOnUnauthorizedCallback } from '../../api/client'
import { useAuthStore } from '../../stores/authStore'
import { usePayFiStore } from '../../stores/payfiStore'

interface AuthGuardProps {
  children: React.ReactNode
}

export function AuthGuard({ children }: AuthGuardProps) {
  const navigate = useNavigate()
  const clearAuth = useAuthStore((state) => state.clearAuth)
  const resetPayFiStore = usePayFiStore((state) => state.reset)

  // 使用 ref 存储最新的函数引用，避免重复设置回调
  const clearAuthRef = useRef(clearAuth)
  const resetPayFiStoreRef = useRef(resetPayFiStore)
  const navigateRef = useRef(navigate)
  const isSetupRef = useRef(false)

  // 更新 ref 以保持最新引用
  useEffect(() => {
    clearAuthRef.current = clearAuth
    resetPayFiStoreRef.current = resetPayFiStore
    navigateRef.current = navigate
  }, [clearAuth, resetPayFiStore, navigate])

  useEffect(() => {
    // 只设置一次回调
    if (isSetupRef.current) return
    isSetupRef.current = true

    // 设置未授权回调
    setOnUnauthorizedCallback(() => {
      console.log('[AuthGuard] Token 失效，清除认证状态并跳转登录页')

      // 清除认证状态
      clearAuthRef.current()

      // 清除 PayFi store 数据
      resetPayFiStoreRef.current()

      // 清除持久化存储
      try {
        localStorage.removeItem('payfi-storage')
      } catch {
        // 忽略错误
      }

      // 跳转到登录页（使用当前 URL 的查询参数）
      const currentSearch = window.location.search
      const loginUrl = currentSearch ? `/login${currentSearch}` : '/login'
      navigateRef.current(loginUrl, { replace: true })
    })
  }, [])

  return <>{children}</>
}
