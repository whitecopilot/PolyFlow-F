import { useAccount, useDisconnect, useSignMessage } from 'wagmi'
import { useAuthStore, shortenAddress } from '../stores/authStore'
import { useCallback, useMemo, useEffect } from 'react'
import { authApi, ApiError } from '../api'
import { AuthErrorMessages } from '../api/types'

// 登录结果类型
export interface SignInResult {
  success: boolean
  needsInviteCode?: boolean
  errorMessage?: string
}

// 注意：后端返回的 nonce 本身就是要签名的消息
// 格式如："The verification code:12345678 is required to log in to PayFi."
// 前端需要直接对这个 nonce 签名，不能修改消息内容

// 获取浏览器指纹（简化版本）
const getBrowserFingerprint = (): string => {
  const canvas = document.createElement('canvas')
  const ctx = canvas.getContext('2d')
  if (ctx) {
    ctx.textBaseline = 'top'
    ctx.font = '14px Arial'
    ctx.fillText('PolyFlow', 2, 2)
  }
  const canvasHash = canvas.toDataURL().slice(-50)

  const info = [
    navigator.userAgent,
    navigator.language,
    screen.width,
    screen.height,
    new Date().getTimezoneOffset(),
    canvasHash,
  ].join('|')

  // 简单哈希
  let hash = 0
  for (let i = 0; i < info.length; i++) {
    const char = info.charCodeAt(i)
    hash = ((hash << 5) - hash) + char
    hash = hash & hash
  }
  return Math.abs(hash).toString(36)
}

// 获取或生成本地存储 ID
const getLocalStorageId = (): string => {
  const key = 'polyflow-device-id'
  let id = localStorage.getItem(key)
  if (!id) {
    id = Math.random().toString(36).substring(2, 15) + Date.now().toString(36)
    localStorage.setItem(key, id)
  }
  return id
}

export function useAuth() {
  const { address, isConnected, isConnecting } = useAccount()
  const { disconnect: wagmiDisconnect } = useDisconnect()
  const { signMessageAsync, isPending: isSigning } = useSignMessage()
  const {
    signedAddress,
    token,
    user,
    isLoading,
    setAuth,
    setUser,
    clearAuth,
    setLoading,
  } = useAuthStore()

  // 用户是否已完成签名认证
  const isAuthenticated = useMemo(() => {
    if (!isConnected || !address || !signedAddress || !token) return false
    return address.toLowerCase() === signedAddress.toLowerCase()
  }, [isConnected, address, signedAddress, token])

  // 是否需要绑定邀请人
  const needsBindInviter = useMemo(() => {
    return isAuthenticated && user && !user.hasInviter
  }, [isAuthenticated, user])

  // 缩短的地址
  const shortAddress = useMemo(() => {
    return address ? shortenAddress(address) : ''
  }, [address])

  // 签名登录
  const signIn = useCallback(async (inviteCode?: string): Promise<SignInResult> => {
    if (!address) return { success: false, errorMessage: 'No wallet address' }

    setLoading(true)
    try {
      // 1. 从后端获取 nonce（nonce 本身就是要签名的消息）
      const { nonce } = await authApi.getNonce(address)

      // 2. 直接对 nonce 签名（后端会验证签名是否匹配 nonce）
      const signature = await signMessageAsync({ message: nonce })

      if (!signature) {
        setLoading(false)
        return { success: false, errorMessage: 'Signature cancelled' }
      }

      // 4. 调用登录 API
      const loginResponse = await authApi.login({
        address,
        signature,
        invite_code: inviteCode,
        fingerprint_hash: getBrowserFingerprint(),
        user_agent: navigator.userAgent,
        local_storage_id: getLocalStorageId(),
      })

      // 5. 保存认证状态
      setAuth(loginResponse.address, loginResponse.token)

      // 6. 获取用户详细信息
      try {
        const userInfo = await authApi.getMe()
        setUser(userInfo)
      } catch (error) {
        console.warn('获取用户信息失败:', error)
      }

      return { success: true }
    } catch (error) {
      console.error('登录失败:', error)
      setLoading(false)

      // 如果是 API 错误，检查是否需要邀请码
      if (error instanceof ApiError) {
        const errorMsg = error.message
        // 检查是否是需要邀请码的错误（匹配后端 i18n 消息）
        const needsInviteCode = errorMsg.includes('invitation code') ||
                                errorMsg.includes('邀请码') ||
                                errorMsg.includes(AuthErrorMessages.NeedInviteCode)

        return {
          success: false,
          needsInviteCode,
          errorMessage: errorMsg
        }
      }

      return { success: false, errorMessage: 'Unknown error' }
    }
  }, [address, signMessageAsync, setAuth, setUser, setLoading])

  // 绑定邀请人
  const bindInviter = useCallback(async (inviterAddress: string) => {
    if (!isAuthenticated) return false

    try {
      await authApi.bindInviter({ inviter_address: inviterAddress })

      // 刷新用户信息
      const userInfo = await authApi.getMe()
      setUser(userInfo)

      return true
    } catch (error) {
      console.error('绑定邀请人失败:', error)
      return false
    }
  }, [isAuthenticated, setUser])

  // 刷新用户信息
  const refreshUser = useCallback(async () => {
    if (!isAuthenticated) return

    try {
      const userInfo = await authApi.getMe()
      setUser(userInfo)
    } catch (error) {
      console.error('刷新用户信息失败:', error)
      // 如果获取失败可能是 token 过期，清除认证
      if (error instanceof ApiError && error.isUnauthorized) {
        clearAuth()
      }
    }
  }, [isAuthenticated, setUser, clearAuth])

  // 断开连接并清除认证
  const disconnect = useCallback(() => {
    clearAuth()
    wagmiDisconnect()
  }, [clearAuth, wagmiDisconnect])

  // 当钱包地址变化时，检查是否需要重新登录
  useEffect(() => {
    if (address && signedAddress && address.toLowerCase() !== signedAddress.toLowerCase()) {
      // 地址变了，清除认证状态
      clearAuth()
    }
  }, [address, signedAddress, clearAuth])

  return {
    // 钱包状态
    address,
    shortAddress,
    isConnected,
    isConnecting,

    // 认证状态
    isAuthenticated,
    isLoading: isLoading || isSigning,
    user,
    needsBindInviter,

    // 操作
    signIn,
    disconnect,
    bindInviter,
    refreshUser,
  }
}
