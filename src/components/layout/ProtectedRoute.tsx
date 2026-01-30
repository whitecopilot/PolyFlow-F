import { useEffect, useRef } from 'react'
import { Navigate, useLocation } from 'react-router-dom'
import { useAuth } from '../../hooks/useAuth'

interface ProtectedRouteProps {
  children: React.ReactNode
}

export function ProtectedRoute({ children }: ProtectedRouteProps) {
  const { isAuthenticated, refreshUser } = useAuth()
  const location = useLocation()
  const refreshedRef = useRef(false)

  // 进入受保护页面时刷新用户信息（确保数据同步）
  useEffect(() => {
    if (isAuthenticated && !refreshedRef.current) {
      refreshedRef.current = true
      refreshUser()
    }
  }, [isAuthenticated, refreshUser])

  // 未认证则重定向到登录页，保留原始 URL 的查询参数（如邀请码）
  if (!isAuthenticated) {
    // 构建登录页 URL，保留原始查询参数
    const loginUrl = location.search ? `/login${location.search}` : '/login'
    return <Navigate to={loginUrl} state={{ from: location }} replace />
  }

  return <>{children}</>
}
