import { useAccount, useDisconnect, useSignMessage } from 'wagmi'
import { useAuthStore, shortenAddress } from '../stores/authStore'
import { useCallback, useMemo } from 'react'

// 生成签名消息
const generateSignMessage = (address: string, nonce: string) => {
  return `欢迎使用 PolyFlow！

请签名此消息以验证您的钱包所有权。

钱包地址: ${address}
Nonce: ${nonce}
时间: ${new Date().toISOString()}`
}

export function useAuth() {
  const { address, isConnected, isConnecting } = useAccount()
  const { disconnect: wagmiDisconnect } = useDisconnect()
  const { signMessageAsync, isPending: isSigning } = useSignMessage()
  const { signedAddress, isLoading, setSignedAddress, clearAuth, setLoading } = useAuthStore()

  // 用户是否已完成签名认证
  const isAuthenticated = useMemo(() => {
    if (!isConnected || !address || !signedAddress) return false
    return address.toLowerCase() === signedAddress.toLowerCase()
  }, [isConnected, address, signedAddress])

  // 缩短的地址
  const shortAddress = useMemo(() => {
    return address ? shortenAddress(address) : ''
  }, [address])

  // 签名登录
  const signIn = useCallback(async () => {
    if (!address) return false

    setLoading(true)
    try {
      const nonce = Math.random().toString(36).substring(2, 15)
      const message = generateSignMessage(address, nonce)

      // 请求用户签名
      const signature = await signMessageAsync({ message })

      if (signature) {
        // 签名成功，保存认证状态
        setSignedAddress(address)
        return true
      }
      return false
    } catch (error) {
      console.error('签名失败:', error)
      setLoading(false)
      return false
    }
  }, [address, signMessageAsync, setSignedAddress, setLoading])

  // 断开连接并清除认证
  const disconnect = useCallback(() => {
    clearAuth()
    wagmiDisconnect()
  }, [clearAuth, wagmiDisconnect])

  return {
    // 钱包状态
    address,
    shortAddress,
    isConnected,
    isConnecting,

    // 认证状态
    isAuthenticated,
    isLoading: isLoading || isSigning,

    // 操作
    signIn,
    disconnect,
  }
}
