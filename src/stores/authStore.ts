import { create } from 'zustand'
import { persist } from 'zustand/middleware'

interface AuthState {
  // 已完成签名验证的地址
  signedAddress: string | null
  isLoading: boolean
  // 设置已签名地址（登录成功后调用）
  setSignedAddress: (address: string) => void
  // 清除签名状态（登出时调用）
  clearAuth: () => void
  setLoading: (loading: boolean) => void
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      signedAddress: null,
      isLoading: false,
      setSignedAddress: (address: string) => {
        set({
          signedAddress: address.toLowerCase(),
          isLoading: false,
        })
      },
      clearAuth: () => {
        set({
          signedAddress: null,
          isLoading: false,
        })
      },
      setLoading: (loading: boolean) => {
        set({ isLoading: loading })
      },
    }),
    {
      name: 'polyflow-auth',
    }
  )
)

// 工具函数：缩短地址显示
export const shortenAddress = (address: string): string => {
  if (!address || address.length <= 10) return address
  return `${address.slice(0, 6)}...${address.slice(-4)}`
}
