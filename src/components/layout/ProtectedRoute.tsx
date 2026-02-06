import { useEffect, useRef } from 'react'
import { Navigate, useLocation } from 'react-router-dom'
import { useAuth } from '../../hooks/useAuth'
import { usePayFiStore } from '../../stores/payfiStore'

interface ProtectedRouteProps {
  children: React.ReactNode
}

export function ProtectedRoute({ children }: ProtectedRouteProps) {
  const { isAuthenticated, refreshUser } = useAuth()
  const location = useLocation()
  const refreshedRef = useRef(false)
  const fetchNFTLevelConfigs = usePayFiStore((state) => state.fetchNFTLevelConfigs)
  const fetchNodeLevelConfigs = usePayFiStore((state) => state.fetchNodeLevelConfigs)

  // 进入受保护页面时刷新用户信息并预加载配置数据
  useEffect(() => {
    if (isAuthenticated && !refreshedRef.current) {
      refreshedRef.current = true
      refreshUser()
      // 预加载等级配置（stale-while-revalidate：缓存数据立即可用，同时静默更新）
      fetchNFTLevelConfigs()
      fetchNodeLevelConfigs()
    }
  }, [isAuthenticated, refreshUser, fetchNFTLevelConfigs, fetchNodeLevelConfigs])

  // 未认证则重定向到登录页，保留原始 URL 的查询参数（如邀请码）
  if (!isAuthenticated) {
    // 构建登录页 URL，保留原始查询参数
    const loginUrl = location.search ? `/login${location.search}` : '/login'
    return <Navigate to={loginUrl} state={{ from: location }} replace />
  }

  return <>{children}</>
}
