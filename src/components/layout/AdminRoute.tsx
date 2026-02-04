import { useEffect, useState } from 'react'
import { Navigate, useLocation } from 'react-router-dom'
import { useAuth } from '../../hooks/useAuth'
import { payfiApi } from '../../api'
import { AdminType } from '../../api/types'

interface AdminRouteProps {
  children: React.ReactNode
  /** 需要的最低管理员类型，默认为超级管理员 */
  requiredAdminType?: number
}

type VerificationState = 'pending' | 'authorized' | 'unauthorized' | 'error'

/**
 * 管理员路由守卫（强制后端验证）
 *
 * 安全特性：
 * 1. 每次进入页面都从后端获取最新用户信息（不依赖本地缓存）
 * 2. 在验证完成前不显示任何页面内容
 * 3. 防止用户通过修改本地存储绑过权限检查
 */
export function AdminRoute({
  children,
  requiredAdminType = AdminType.SuperAdmin
}: AdminRouteProps) {
  const { isAuthenticated } = useAuth()
  const location = useLocation()

  // 验证状态：pending | authorized | unauthorized | error
  const [verificationState, setVerificationState] = useState<VerificationState>('pending')

  // 每次进入页面时强制从后端验证权限
  useEffect(() => {
    let isMounted = true

    async function verifyAdminAccess() {
      if (!isAuthenticated) {
        setVerificationState('unauthorized')
        return
      }

      try {
        // 强制从后端获取最新用户信息（不使用缓存）
        const userAssets = await payfiApi.getUserAssets()

        if (!isMounted) return

        // 检查管理员权限
        const userAdminType = userAssets.adminType ?? AdminType.Normal
        if (userAdminType >= requiredAdminType) {
          setVerificationState('authorized')
        } else {
          setVerificationState('unauthorized')
        }
      } catch (error) {
        console.error('Admin verification failed:', error)
        if (isMounted) {
          setVerificationState('error')
        }
      }
    }

    // 重置状态并开始验证
    setVerificationState('pending')
    verifyAdminAccess()

    return () => {
      isMounted = false
    }
  }, [isAuthenticated, requiredAdminType, location.pathname])

  // 未认证 -> 登录页
  if (!isAuthenticated) {
    const loginUrl = location.search ? `/login${location.search}` : '/login'
    return <Navigate to={loginUrl} state={{ from: location }} replace />
  }

  // 验证中 -> 显示空白（或可添加 loading 组件）
  if (verificationState === 'pending') {
    return null
  }

  // 验证失败或无权限 -> 重定向到首页
  if (verificationState === 'unauthorized' || verificationState === 'error') {
    return <Navigate to="/" replace />
  }

  // 验证通过 -> 显示页面内容
  return <>{children}</>
}
