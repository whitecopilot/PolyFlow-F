import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { getStoredToken, setStoredToken, clearStoredToken } from '../api/client'
import type { UserOverview } from '../api/types'

interface AuthState {
  // 已完成签名验证的地址
  signedAddress: string | null
  // JWT Token
  token: string | null
  // 用户信息
  user: UserOverview | null
  // 加载状态
  isLoading: boolean

  // 设置已签名地址和 token（登录成功后调用）
  setAuth: (address: string, token: string, user?: UserOverview) => void
  // 更新用户信息
  setUser: (user: UserOverview) => void
  // 清除签名状态（登出时调用）
  clearAuth: () => void
  // 设置加载状态
  setLoading: (loading: boolean) => void
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      signedAddress: null,
      token: null,
      user: null,
      isLoading: false,

      setAuth: (address: string, token: string, user?: UserOverview) => {
        // 同步存储 token 到 localStorage（供 API client 使用）
        setStoredToken(token)

        set({
          signedAddress: address.toLowerCase(),
          token,
          user: user || null,
          isLoading: false,
        })
      },

      setUser: (user: UserOverview) => {
        set({ user })
      },

      clearAuth: () => {
        // 清除 localStorage 中的 token
        clearStoredToken()

        set({
          signedAddress: null,
          token: null,
          user: null,
          isLoading: false,
        })
      },

      setLoading: (loading: boolean) => {
        set({ isLoading: loading })
      },
    }),
    {
      name: 'polyflow-auth',
      // 持久化时同步 token 到 localStorage
      onRehydrateStorage: () => (state) => {
        if (state?.token) {
          setStoredToken(state.token)
        }
      },
      // 只持久化必要的字段
      partialize: (state) => ({
        signedAddress: state.signedAddress,
        token: state.token,
        user: state.user,
      }),
    }
  )
)

// 检查 token 是否有效（简单检查是否存在）
export function isTokenValid(): boolean {
  const token = getStoredToken()
  return !!token
}

// 工具函数：缩短地址显示
export const shortenAddress = (address: string): string => {
  if (!address || address.length <= 10) return address
  return `${address.slice(0, 6)}...${address.slice(-4)}`
}
