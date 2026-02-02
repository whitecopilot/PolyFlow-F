import { useAccount, useDisconnect, useSignMessage } from 'wagmi'
import { useAuthStore, shortenAddress } from '../stores/authStore'
import { usePayFiStore } from '../stores/payfiStore'
import { useCallback, useMemo, useEffect, useRef } from 'react'
import { authApi, ApiError } from '../api'

// 登录结果类型
export interface SignInResult {
  success: boolean
  needsInviteCode?: boolean      // 新用户需要提供邀请码
  invalidInviteCode?: boolean    // 邀请码无效（包括不存在、已使用、已过期等）
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
    isLoading,
    walletSwitched,
    setAuth,
    clearAuth,
    setLoading,
    setWalletSwitched,
  } = useAuthStore()

  // 获取 payfiStore 的 reset 方法和 userAssets 用于用户状态
  const resetPayFiStore = usePayFiStore((state) => state.reset)
  const userAssets = usePayFiStore((state) => state.userAssets)
  const fetchUserAssets = usePayFiStore((state) => state.fetchUserAssets)

  // 用于追踪上一个连接的地址，检测钱包切换
  const previousAddressRef = useRef<string | null>(null)

  // 用户是否已完成签名认证
  const isAuthenticated = useMemo(() => {
    if (!isConnected || !address || !signedAddress || !token) return false
    return address.toLowerCase() === signedAddress.toLowerCase()
  }, [isConnected, address, signedAddress, token])

  // 是否需要绑定邀请人（从 userAssets 获取，已合并到 /assets 接口）
  const needsBindInviter = useMemo(() => {
    return isAuthenticated && userAssets && !userAssets.hasInviter
  }, [isAuthenticated, userAssets])

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

      // 6. 获取用户资产信息（包含 is_active 和 hasInviter 状态）
      try {
        await fetchUserAssets()
      } catch (error) {
        console.warn('获取用户资产失败:', error)
      }

      return { success: true }
    } catch (error) {
      console.error('登录失败:', error)
      setLoading(false)

      // 如果是 API 错误，检查具体错误类型
      if (error instanceof ApiError) {
        const errorMsg = error.message

        // 检查是否是新用户需要邀请码的错误
        // 匹配多语言消息：英文 "must provide", 中文 "必须提供"
        const needsInviteCode =
          errorMsg.includes('must provide') ||
          errorMsg.includes('必须提供') ||
          errorMsg.includes('제공해야') // 韩文

        // 检查是否是邀请码无效的错误（不存在、已使用、已过期、邀请人问题等）
        const invalidInviteCode =
          errorMsg.includes('Invalid') ||
          errorMsg.includes('无效') ||
          errorMsg.includes('已被使用') ||
          errorMsg.includes('has been used') ||
          errorMsg.includes('已过期') ||
          errorMsg.includes('expired') ||
          errorMsg.includes('未投资') ||
          errorMsg.includes('not invested') ||
          errorMsg.includes('INVITER') ||
          errorMsg.includes('잘못된') // 韩文 "无效"

        return {
          success: false,
          needsInviteCode,
          invalidInviteCode,
          errorMessage: errorMsg
        }
      }

      return { success: false, errorMessage: 'Unknown error' }
    }
  }, [address, signMessageAsync, setAuth, setLoading, fetchUserAssets])

  // 绑定邀请人
  const bindInviter = useCallback(async (inviterAddress: string) => {
    if (!isAuthenticated) return false

    try {
      await authApi.bindInviter({ inviter_address: inviterAddress })

      // 刷新用户资产信息（包含 hasInviter 状态）
      await fetchUserAssets()

      return true
    } catch (error) {
      console.error('绑定邀请人失败:', error)
      return false
    }
  }, [isAuthenticated, fetchUserAssets])

  // 刷新用户信息（通过 userAssets 接口）
  const refreshUser = useCallback(async () => {
    if (!isAuthenticated) return

    try {
      await fetchUserAssets()
    } catch (error) {
      console.error('刷新用户信息失败:', error)
      // 如果获取失败可能是 token 过期，清除认证
      if (error instanceof ApiError && error.isUnauthorized) {
        clearAuth()
      }
    }
  }, [isAuthenticated, fetchUserAssets, clearAuth])

  // 清除所有用户数据（认证状态 + PayFi 数据）
  const clearAllUserData = useCallback(() => {
    // 清除认证状态
    clearAuth()
    // 清除 PayFi store 中的用户数据
    resetPayFiStore()
    // 清除可能存在的其他用户相关缓存
    try {
      // 清除 payfi-storage（虽然 reset 会清理内存状态，但持久化存储也需要清理）
      localStorage.removeItem('payfi-storage')
    } catch {
      // 忽略 localStorage 错误
    }
  }, [clearAuth, resetPayFiStore])

  // 断开连接并清除认证
  const disconnect = useCallback(() => {
    clearAllUserData()
    wagmiDisconnect()
  }, [clearAllUserData, wagmiDisconnect])

  // 监听钱包地址变化 - 增强版
  useEffect(() => {
    const currentAddress = address?.toLowerCase() || null
    const prevAddress = previousAddressRef.current

    // 更新 ref 以追踪当前地址
    previousAddressRef.current = currentAddress

    // 如果是首次设置地址（从 null 到有值），不触发切换逻辑
    if (prevAddress === null && currentAddress !== null) {
      return
    }

    // 检测钱包切换：之前有地址，现在地址变了（包括变成不同地址或断开连接）
    if (prevAddress !== null && currentAddress !== prevAddress) {
      console.log('[useAuth] 检测到钱包切换:', prevAddress, '->', currentAddress)

      // 清除所有用户数据
      clearAllUserData()

      // 如果用户切换到了新地址（不是断开连接），标记需要重新登录
      if (currentAddress !== null) {
        setWalletSwitched(true)
      }
    }
  }, [address, clearAllUserData, setWalletSwitched])

  // 额外的安全检查：如果当前连接地址与已签名地址不匹配，清除认证
  useEffect(() => {
    if (address && signedAddress && address.toLowerCase() !== signedAddress.toLowerCase()) {
      console.log('[useAuth] 地址不匹配，清除认证状态')
      clearAllUserData()
      setWalletSwitched(true)
    }
  }, [address, signedAddress, clearAllUserData, setWalletSwitched])

  // 清除钱包切换标志
  const clearWalletSwitchedFlag = useCallback(() => {
    setWalletSwitched(false)
  }, [setWalletSwitched])

  return {
    // 钱包状态
    address,
    shortAddress,
    isConnected,
    isConnecting,

    // 认证状态
    isAuthenticated,
    isLoading: isLoading || isSigning,
    needsBindInviter,

    // 钱包切换状态
    walletSwitched,
    clearWalletSwitchedFlag,

    // 操作
    signIn,
    disconnect,
    bindInviter,
    refreshUser,
    clearAllUserData,
  }
}
