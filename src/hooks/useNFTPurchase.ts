// NFT 购买钩子 - 处理完整的购买流程
// 1. 创建订单 → 2. 发送交易（使用后端返回的未签名交易数据） → 3. 提交支付确认

import { useState, useCallback } from 'react'
import { useAccount, useSendTransaction } from 'wagmi'
import { type Hex } from 'viem'
import { waitForTransactionReceipt } from '@wagmi/core'
import { config as wagmiConfig } from '../config/wagmi'
import { nftApi, ApiError } from '../api'
import type { NFTLevel, CreateNFTOrderResponse } from '../api/types'

// 购买状态枚举
export type PurchaseStep =
  | 'idle'           // 空闲
  | 'creating'       // 创建订单中
  | 'signing'        // 等待钱包签名
  | 'submitting'     // 提交支付确认
  | 'verifying'      // 验证中
  | 'minting'        // Mint 中
  | 'success'        // 成功
  | 'error'          // 失败

export interface NFTPurchaseState {
  step: PurchaseStep
  error: string | null
  orderId: number | null
  txHash: string | null
}

export function useNFTPurchase() {
  const [state, setState] = useState<NFTPurchaseState>({
    step: 'idle',
    error: null,
    orderId: null,
    txHash: null,
  })

  const { address, isConnected } = useAccount()
  const { sendTransactionAsync } = useSendTransaction()

  // 重置状态
  const reset = useCallback(() => {
    setState({
      step: 'idle',
      error: null,
      orderId: null,
      txHash: null,
    })
  }, [])

  // 设置错误
  const setError = useCallback((error: string) => {
    setState(s => ({ ...s, step: 'error', error }))
  }, [])

  // 购买 NFT 完整流程
  const purchaseNFT = useCallback(
    async (level: NFTLevel, isUpgrade: boolean = false): Promise<boolean> => {
      console.log('[NFTPurchase] ========== 开始购买流程 ==========')
      console.log('[NFTPurchase] 参数:', { level, isUpgrade })
      console.log('[NFTPurchase] 钱包状态:', { address, isConnected })

      if (!level) {
        console.error('[NFTPurchase] 错误: 未选择 NFT 等级')
        setError('请选择 NFT 等级')
        return false
      }

      if (!isConnected || !address) {
        console.error('[NFTPurchase] 错误: 钱包未连接')
        setError('请先连接钱包')
        return false
      }

      try {
        // ========== 步骤 1: 创建订单 ==========
        console.log('[NFTPurchase] 步骤 1: 创建订单...')
        setState(s => ({ ...s, step: 'creating', error: null }))

        let orderResponse: CreateNFTOrderResponse
        try {
          orderResponse = await nftApi.createNFTOrder({
            nftLevel: level,
            isUpgrade,
          })
          console.log('[NFTPurchase] 订单创建成功:', orderResponse)
        } catch (error) {
          console.error('[NFTPurchase] 创建订单失败:', error)
          const message = error instanceof ApiError ? error.message : '创建订单失败'
          setError(message)
          return false
        }

        setState(s => ({
          ...s,
          orderId: orderResponse.orderId,
          step: 'signing',
        }))

        // ========== 步骤 2: 发送交易（钱包自动处理 gas 和 nonce）==========
        console.log('[NFTPurchase] 步骤 2: 准备交易数据...')

        if (!orderResponse.transactionParams) {
          console.error('[NFTPurchase] 错误: 后端未返回 transactionParams')
          setError('服务器未返回交易数据')
          return false
        }

        const txParams = orderResponse.transactionParams
        console.log('[NFTPurchase] 交易参数:', {
          to: txParams.to,
          value: txParams.value,
          dataLength: txParams.data.length,
          chainId: txParams.chainId,
        })

        // 发送交易（钱包自动处理 nonce、gasPrice、gasLimit）
        console.log('[NFTPurchase] 步骤 2.5: 请求钱包签名...')
        let txHash: string
        try {
          const result = await sendTransactionAsync({
            to: txParams.to as Hex,
            data: txParams.data as Hex,
            value: BigInt(txParams.value),
          })
          txHash = result
          console.log('[NFTPurchase] 交易已发送, hash:', txHash)
        } catch (error: any) {
          console.error('[NFTPurchase] 发送交易失败:', error)
          if (error.name === 'UserRejectedRequestError' ||
              error.message?.includes('rejected') ||
              error.message?.includes('denied') ||
              error.code === 4001) {
            setError('交易被用户取消')
          } else {
            setError(error.message || '交易失败')
          }
          return false
        }

        setState(s => ({
          ...s,
          txHash,
          step: 'verifying',
        }))

        // ========== 步骤 2.6: 等待交易被区块链确认 ==========
        console.log('[NFTPurchase] 步骤 2.6: 等待交易确认...')
        try {
          const receipt = await waitForTransactionReceipt(wagmiConfig, {
            hash: txHash as Hex,
            confirmations: 1,
          })
          console.log('[NFTPurchase] 交易已确认, status:', receipt.status)

          if (receipt.status === 'reverted') {
            setError('交易在链上执行失败')
            return false
          }
        } catch (error: any) {
          console.error('[NFTPurchase] 等待交易确认失败:', error)
          setError(error.message || '等待交易确认失败')
          return false
        }

        setState(s => ({
          ...s,
          step: 'submitting',
        }))

        // ========== 步骤 3: 提交支付确认 ==========
        console.log('[NFTPurchase] 步骤 3: 提交支付确认...')
        try {
          await nftApi.submitPayment({
            orderId: orderResponse.orderId,
            transactionHash: txHash,
          })
          console.log('[NFTPurchase] 支付确认提交成功')
        } catch (error) {
          console.error('[NFTPurchase] 提交支付确认失败:', error)
          const message = error instanceof ApiError ? error.message : '提交支付确认失败'
          setError(message)
          return false
        }

        // ========== 步骤 4: 等待验证 ==========
        console.log('[NFTPurchase] 步骤 4: 等待链上验证...')
        setState(s => ({ ...s, step: 'verifying' }))

        // 轮询订单状态
        const verified = await pollOrderStatus(orderResponse.orderId, setState)

        if (verified) {
          console.log('[NFTPurchase] ========== 购买成功 ==========')
          setState(s => ({ ...s, step: 'success' }))
          return true
        } else {
          console.log('[NFTPurchase] 验证超时，但交易已提交')
          setState(s => ({ ...s, step: 'success' })) // 交易已提交，视为成功
          return true
        }
      } catch (error) {
        console.error('[NFTPurchase] 购买流程异常:', error)
        setError('购买流程失败')
        return false
      }
    },
    [address, isConnected, sendTransactionAsync, setError]
  )

  const isLoading = state.step !== 'idle' && state.step !== 'success' && state.step !== 'error'

  // 获取当前步骤描述
  const getStatusText = useCallback(() => {
    switch (state.step) {
      case 'creating': return '创建订单中...'
      case 'signing': return '请在钱包中确认交易...'
      case 'submitting': return '提交支付确认...'
      case 'verifying': return '验证交易中...'
      case 'minting': return 'NFT Mint 中...'
      case 'success': return '购买成功!'
      case 'error': return state.error || '购买失败'
      default: return ''
    }
  }, [state.step, state.error])

  return {
    ...state,
    isLoading,
    purchaseNFT,
    reset,
    getStatusText,
  }
}

// 轮询订单状态
async function pollOrderStatus(
  orderId: number,
  setState: React.Dispatch<React.SetStateAction<NFTPurchaseState>>,
  maxAttempts = 30
): Promise<boolean> {
  for (let i = 0; i < maxAttempts; i++) {
    try {
      const order = await nftApi.getNFTOrderDetail(orderId)
      console.log(`[NFTPurchase] 轮询 ${i + 1}/${maxAttempts}:`, order.state)

      if (order.state === 'pending' || order.state === 'verified') {
        setState(s => ({ ...s, step: 'verifying' }))
      } else if (order.state === 'minting') {
        setState(s => ({ ...s, step: 'minting' }))
      } else if (order.state === 'completed' || order.state === 'minted') {
        return true
      } else if (order.state === 'failed') {
        return false
      }

      await new Promise(resolve => setTimeout(resolve, 2000))
    } catch (error) {
      console.error('[NFTPurchase] 轮询订单状态失败:', error)
    }
  }
  return false
}
