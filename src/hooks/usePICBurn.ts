// PIC 链上销毁钩子 - 处理完整的链上销毁流程
// 1. 准备订单 → 2. 发送交易（使用后端返回的交易数据） → 3. 提交交易哈希

import { waitForTransactionReceipt } from '@wagmi/core'
import { useCallback, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { type Hex } from 'viem'
import { useAccount, useSendTransaction } from 'wagmi'
import { ApiError, burnApi } from '../api'
import type { PreparePICBurnResponse } from '../api/types'
import { config as wagmiConfig } from '../config/wagmi'

// 销毁状态枚举
export type BurnStep =
  | 'idle'           // 空闲
  | 'preparing'      // 准备订单中
  | 'signing'        // 等待钱包签名
  | 'confirming'     // 等待链上确认
  | 'submitting'     // 提交交易哈希
  | 'success'        // 成功
  | 'error'          // 失败

export interface PICBurnState {
  step: BurnStep
  error: string | null
  burnId: number | null
  txHash: string | null
  prepareResponse: PreparePICBurnResponse | null
}

export function usePICBurn() {
  const { t } = useTranslation()
  const [state, setState] = useState<PICBurnState>({
    step: 'idle',
    error: null,
    burnId: null,
    txHash: null,
    prepareResponse: null,
  })

  const { address, isConnected } = useAccount()
  const { sendTransactionAsync } = useSendTransaction()

  // 重置状态
  const reset = useCallback(() => {
    setState({
      step: 'idle',
      error: null,
      burnId: null,
      txHash: null,
      prepareResponse: null,
    })
  }, [])

  // 设置错误
  const setError = useCallback((error: string) => {
    setState(s => ({ ...s, step: 'error', error }))
  }, [])

  // 销毁 PIC 完整流程（传入 USDT 金额）
  const burnPIC = useCallback(
    async (usdtAmount: number): Promise<boolean> => {
      console.log('[PICBurn] ========== 开始链上销毁流程 ==========')
      console.log('[PICBurn] 参数:', { usdtAmount })
      console.log('[PICBurn] 钱包状态:', { address, isConnected })

      if (!usdtAmount || usdtAmount < 100) {
        console.error('[PICBurn] 错误: 无效的销毁金额')
        setError(t('assets.burn_invalid_amount'))
        return false
      }

      // 验证是否是 100 的整数倍
      if (usdtAmount % 100 !== 0) {
        console.error('[PICBurn] 错误: 金额必须是 100 的整数倍')
        setError(t('assets.must_be_100u'))
        return false
      }

      if (!isConnected || !address) {
        console.error('[PICBurn] 错误: 钱包未连接')
        setError(t('purchase.error_wallet_not_connected'))
        return false
      }

      try {
        // ========== 步骤 1: 准备订单 ==========
        console.log('[PICBurn] 步骤 1: 准备销毁订单...')
        setState(s => ({ ...s, step: 'preparing', error: null }))

        let prepareResponse: PreparePICBurnResponse
        try {
          prepareResponse = await burnApi.preparePICBurn({ usdtAmount })
          console.log('[PICBurn] 订单准备成功:', prepareResponse)
        } catch (error) {
          console.error('[PICBurn] 准备订单失败:', error)
          const message = error instanceof ApiError ? error.message : t('assets.burn_prepare_failed')
          setError(message)
          return false
        }

        setState(s => ({
          ...s,
          burnId: prepareResponse.burnId,
          prepareResponse,
          step: 'signing',
        }))

        // ========== 步骤 2: 发送交易（钱包自动处理 gas 和 nonce）==========
        console.log('[PICBurn] 步骤 2: 准备交易数据...')

        if (!prepareResponse.transactionParams) {
          console.error('[PICBurn] 错误: 后端未返回 transactionParams')
          setError(t('purchase.error_no_tx_data'))
          return false
        }

        const txParams = prepareResponse.transactionParams
        console.log('[PICBurn] 交易参数:', {
          to: txParams.to,
          value: txParams.value,
          dataLength: txParams.data.length,
          chainId: txParams.chainId,
        })

        // 发送交易（钱包自动处理 nonce、gasPrice、gasLimit）
        console.log('[PICBurn] 步骤 2.5: 请求钱包签名...')
        let txHash: string
        try {
          const result = await sendTransactionAsync({
            to: txParams.to as Hex,
            data: txParams.data as Hex,
            value: BigInt(txParams.value),
          })
          txHash = result
          console.log('[PICBurn] 交易已发送, hash:', txHash)
        } catch (error: any) {
          console.error('[PICBurn] 发送交易失败:', error)
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

        setState(s => ({
          ...s,
          txHash,
          step: 'confirming',
        }))

        // ========== 步骤 3: 等待交易被区块链确认 ==========
        console.log('[PICBurn] 步骤 3: 等待交易确认...')
        try {
          const receipt = await waitForTransactionReceipt(wagmiConfig, {
            hash: txHash as Hex,
            confirmations: 1,
          })
          console.log('[PICBurn] 交易已确认, status:', receipt.status)

          if (receipt.status === 'reverted') {
            setError(t('assets.burn_tx_reverted'))
            return false
          }
        } catch (error: any) {
          console.error('[PICBurn] 等待交易确认失败:', error)
          setError(error.message || t('purchase.error_wait_confirmation'))
          return false
        }

        setState(s => ({
          ...s,
          step: 'submitting',
        }))

        // ========== 步骤 4: 提交交易哈希 ==========
        console.log('[PICBurn] 步骤 4: 提交交易哈希...')
        try {
          await burnApi.submitPICBurn({
            burnId: prepareResponse.burnId,
            transactionHash: txHash,
          })
          console.log('[PICBurn] 交易哈希提交成功')
        } catch (error) {
          console.error('[PICBurn] 提交交易哈希失败:', error)
          // 即使提交失败，链上交易已经成功，WebSocket 会捕获
          console.log('[PICBurn] 链上交易已成功，后端会通过 WebSocket 处理')
        }

        // ========== 成功 ==========
        console.log('[PICBurn] ========== 销毁成功 ==========')
        setState(s => ({ ...s, step: 'success' }))
        return true
      } catch (error) {
        console.error('[PICBurn] 销毁流程异常:', error)
        setError(t('assets.burn_failed'))
        return false
      }
    },
    [address, isConnected, sendTransactionAsync, setError, t]
  )

  const isLoading = state.step !== 'idle' && state.step !== 'success' && state.step !== 'error'

  // 获取当前步骤描述
  const getStatusText = useCallback(() => {
    switch (state.step) {
      case 'preparing': return t('assets.burn_status_preparing')
      case 'signing': return t('assets.burn_status_signing')
      case 'confirming': return t('assets.burn_status_confirming')
      case 'submitting': return t('assets.burn_status_submitting')
      case 'success': return t('assets.burn_status_success')
      case 'error': return state.error || t('assets.burn_failed')
      default: return ''
    }
  }, [state.step, state.error, t])

  return {
    ...state,
    isLoading,
    burnPIC,
    reset,
    getStatusText,
  }
}
