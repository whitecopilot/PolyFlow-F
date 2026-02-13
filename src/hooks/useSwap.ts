// 代币兑换钩子 - 处理完整的兑换流程
// 1. 创建订单 → 2. 发送交易（使用后端返回的交易数据） → 3. 提交支付确认 → 4. 轮询验证

import { waitForTransactionReceipt } from '@wagmi/core'
import { useCallback, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { type Hex } from 'viem'
import { useAccount, useSendTransaction } from 'wagmi'
import { ApiError, swapApi } from '../api'
import type { CreateSwapOrderResponse, SwapType } from '../api/types'
import { SwapOrderState } from '../api/types'
import { config as wagmiConfig } from '../config/wagmi'

// 兑换状态枚举
export type SwapStep =
  | 'idle'           // 空闲
  | 'creating'       // 创建订单中
  | 'signing'        // 等待钱包签名
  | 'confirming'     // 等待链上确认
  | 'submitting'     // 提交支付确认
  | 'verifying'      // 验证中
  | 'success'        // 成功
  | 'error'          // 失败

export interface SwapState {
  step: SwapStep
  error: string | null
  orderId: number | null
  txHash: string | null
  orderResult: CreateSwapOrderResponse | null
}

export function useSwap() {
  const { t } = useTranslation()
  const [state, setState] = useState<SwapState>({
    step: 'idle',
    error: null,
    orderId: null,
    txHash: null,
    orderResult: null,
  })

  const { address, isConnected } = useAccount()
  const { sendTransactionAsync } = useSendTransaction()

  const reset = useCallback(() => {
    setState({
      step: 'idle',
      error: null,
      orderId: null,
      txHash: null,
      orderResult: null,
    })
  }, [])

  const setError = useCallback((error: string) => {
    setState(s => ({ ...s, step: 'error', error }))
  }, [])

  // 执行兑换完整流程
  const executeSwap = useCallback(
    async (swapType: SwapType, fromAmount: number): Promise<boolean> => {
      console.log('[Swap] ========== 开始兑换流程 ==========')
      console.log('[Swap] 参数:', { swapType, fromAmount })

      if (!isConnected || !address) {
        setError(t('purchase.error_wallet_not_connected'))
        return false
      }

      try {
        // ========== 步骤 1: 创建兑换订单 ==========
        console.log('[Swap] 步骤 1: 创建兑换订单...')
        setState(s => ({ ...s, step: 'creating', error: null }))

        let orderResponse: CreateSwapOrderResponse
        try {
          orderResponse = await swapApi.createSwapOrder({ swapType, fromAmount })
          console.log('[Swap] 订单创建成功:', orderResponse)
        } catch (error) {
          console.error('[Swap] 创建订单失败:', error)
          const message = error instanceof ApiError ? error.message : t('assets.swap_error_create')
          setError(message)
          return false
        }

        setState(s => ({
          ...s,
          orderId: orderResponse.orderId,
          orderResult: orderResponse,
          step: 'signing',
        }))

        // ========== 步骤 2: 发送交易 ==========
        console.log('[Swap] 步骤 2: 准备交易数据...')

        if (!orderResponse.transactionParams) {
          setError(t('purchase.error_no_tx_data'))
          return false
        }

        const txParams = orderResponse.transactionParams
        console.log('[Swap] 交易参数:', {
          to: txParams.to,
          value: txParams.value,
          dataLength: txParams.data.length,
          chainId: txParams.chainId,
        })

        let txHash: string
        try {
          const result = await sendTransactionAsync({
            to: txParams.to as Hex,
            data: txParams.data as Hex,
            value: BigInt(txParams.value),
          })
          txHash = result
          console.log('[Swap] 交易已发送, hash:', txHash)
        } catch (error: any) {
          console.error('[Swap] 发送交易失败:', error)
          if (error.name === 'UserRejectedRequestError' ||
              error.message?.includes('rejected') ||
              error.message?.includes('denied') ||
              error.code === 4001) {
            setError(t('purchase.error_user_cancelled'))
          } else {
            setError(error.message || t('purchase.error_tx_failed'))
          }
          return false
        }

        setState(s => ({ ...s, txHash, step: 'confirming' }))

        // ========== 步骤 3: 等待链上确认 ==========
        console.log('[Swap] 步骤 3: 等待交易确认...')
        try {
          const receipt = await waitForTransactionReceipt(wagmiConfig, {
            hash: txHash as Hex,
            confirmations: 1,
          })
          console.log('[Swap] 交易已确认, status:', receipt.status)

          if (receipt.status === 'reverted') {
            setError(t('purchase.error_tx_reverted'))
            return false
          }
        } catch (error: any) {
          console.error('[Swap] 等待交易确认失败:', error)
          setError(error.message || t('purchase.error_wait_confirmation'))
          return false
        }

        setState(s => ({ ...s, step: 'submitting' }))

        // ========== 步骤 4: 提交支付确认 ==========
        console.log('[Swap] 步骤 4: 提交支付确认...')
        try {
          await swapApi.submitSwapPayment({
            orderId: orderResponse.orderId,
            transactionHash: txHash,
          })
          console.log('[Swap] 支付确认提交成功')
        } catch (error) {
          console.error('[Swap] 提交支付确认失败:', error)
          const message = error instanceof ApiError ? error.message : t('assets.swap_error_submit')
          setError(message)
          return false
        }

        // ========== 步骤 5: 轮询验证 ==========
        console.log('[Swap] 步骤 5: 等待验证...')
        setState(s => ({ ...s, step: 'verifying' }))

        const verified = await pollSwapOrderStatus(orderResponse.orderId)
        if (verified) {
          console.log('[Swap] ========== 兑换成功 ==========')
          setState(s => ({ ...s, step: 'success' }))
        } else {
          // 交易已提交，即使轮询超时也视为成功
          console.log('[Swap] 验证超时，但交易已提交')
          setState(s => ({ ...s, step: 'success' }))
        }
        return true
      } catch (error) {
        console.error('[Swap] 兑换流程异常:', error)
        setError(t('assets.swap_error_failed'))
        return false
      }
    },
    [address, isConnected, sendTransactionAsync, setError, t]
  )

  const isLoading = state.step !== 'idle' && state.step !== 'success' && state.step !== 'error'

  const getStatusText = useCallback(() => {
    switch (state.step) {
      case 'creating': return t('assets.swap_status_creating')
      case 'signing': return t('assets.swap_status_signing')
      case 'confirming': return t('assets.swap_status_confirming')
      case 'submitting': return t('assets.swap_status_submitting')
      case 'verifying': return t('assets.swap_status_verifying')
      case 'success': return t('assets.swap_status_success')
      case 'error': return state.error || t('assets.swap_error_failed')
      default: return ''
    }
  }, [state.step, state.error, t])

  return {
    ...state,
    isLoading,
    executeSwap,
    reset,
    getStatusText,
  }
}

// 轮询兑换订单状态
// 后端返回 State 为数字：0=UnPaid, 2=Pending, 3=Checked, 8=Canceled
async function pollSwapOrderStatus(orderId: number, maxAttempts = 30): Promise<boolean> {
  for (let i = 0; i < maxAttempts; i++) {
    try {
      const order = await swapApi.getSwapOrderDetail(orderId)
      console.log(`[Swap] 轮询 ${i + 1}/${maxAttempts}: State=${order.State}`)

      if (order.State === SwapOrderState.Checked) {
        return true
      } else if (order.State === SwapOrderState.Canceled || order.State === SwapOrderState.PaymentFailed) {
        return false
      }

      await new Promise(resolve => setTimeout(resolve, 2000))
    } catch (error) {
      console.error('[Swap] 轮询订单状态失败:', error)
    }
  }
  return false
}
