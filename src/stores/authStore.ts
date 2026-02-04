import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { getStoredToken, setStoredToken, clearStoredToken } from '../api/client'

interface AuthState {
  // 已完成签名验证的地址
  signedAddress: string | null
  // JWT Token
  token: string | null
  // 加载状态
  isLoading: boolean
  // 钱包切换标志（用于通知其他组件需要重新登录）
  walletSwitched: boolean

  // 设置已签名地址和 token（登录成功后调用）
  setAuth: (address: string, token: string) => void
  // 清除签名状态（登出时调用）
  clearAuth: () => void
  // 设置加载状态
  setLoading: (loading: boolean) => void
  // 标记钱包已切换
  setWalletSwitched: (switched: boolean) => void
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      signedAddress: null,
      token: null,
      isLoading: false,
      walletSwitched: false,

      setAuth: (address: string, token: string) => {
        // 同步存储 token 到 localStorage（供 API client 使用）
        setStoredToken(token)

        set({
          signedAddress: address.toLowerCase(),
          token,
          isLoading: false,
          walletSwitched: false,
        })
      },

      clearAuth: () => {
        // 清除 localStorage 中的 token
        clearStoredToken()

        set({
          signedAddress: null,
          token: null,
          isLoading: false,
        })
      },

      setLoading: (loading: boolean) => {
        set({ isLoading: loading })
      },

      setWalletSwitched: (switched: boolean) => {
        set({ walletSwitched: switched })
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
      // 只持久化必要的字段（不持久化 walletSwitched）
      partialize: (state) => ({
        signedAddress: state.signedAddress,
        token: state.token,
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
