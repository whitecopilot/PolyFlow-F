// 提现钩子 - 处理完整的提现流程
// 1. 创建订单 → 2. 获取交易数据 → 3. 发送交易 → 4. 验证领取结果

import { useState, useCallback } from 'react'
import { useSendTransaction } from 'wagmi'
import { type Hex } from 'viem'
import { withdrawApi, ApiError } from '../api'
import type { TokenType, WithdrawSource } from '../api/types'

export interface WithdrawState {
  isCreatingOrder: boolean
  isGettingTx: boolean
  isSendingTx: boolean
  isVerifying: boolean
  error: string | null
  orderId: number | null
  txHash: string | null
}

export function useWithdraw() {
  const [state, setState] = useState<WithdrawState>({
    isCreatingOrder: false,
    isGettingTx: false,
    isSendingTx: false,
    isVerifying: false,
    error: null,
    orderId: null,
    txHash: null,
  })

  const { sendTransactionAsync } = useSendTransaction()

  // 重置状态
  const reset = useCallback(() => {
    setState({
      isCreatingOrder: false,
      isGettingTx: false,
      isSendingTx: false,
      isVerifying: false,
      error: null,
      orderId: null,
      txHash: null,
    })
  }, [])

  // 创建提现订单（不涉及链上交易）
  const createOrder = useCallback(async (
    amount: number,
    tokenType: TokenType = 'PID',
    source?: WithdrawSource
  ): Promise<number | null> => {
    setState(s => ({ ...s, isCreatingOrder: true, error: null }))

    try {
      const response = await withdrawApi.createWithdrawOrder({
        amount,
        type: tokenType,
        source,
      })

      setState(s => ({
        ...s,
        isCreatingOrder: false,
        orderId: response.orderId,
      }))

      return response.orderId
    } catch (error) {
      const message = error instanceof ApiError ? error.message : '创建提现订单失败'
      setState(s => ({ ...s, isCreatingOrder: false, error: message }))
      return null
    }
  }, [])

  // 领取提现（链上交易）
  const claimWithdraw = useCallback(async (orderId: number): Promise<boolean> => {
    setState(s => ({ ...s, isGettingTx: true, error: null, orderId }))

    try {
      // 步骤 1: 获取交易数据
      const txData = await withdrawApi.createWithdrawTransaction(orderId)

      setState(s => ({ ...s, isGettingTx: false, isSendingTx: true }))

      // 步骤 2: 发送交易
      let txHash: string
      try {
        // 使用返回的交易数据发送交易
        const result = await sendTransactionAsync({
          data: txData.tx as Hex,
        })
        txHash = result
      } catch (error) {
        console.error('发送交易失败:', error)
        setState(s => ({ ...s, isSendingTx: false, error: '交易被拒绝或失败' }))
        return false
      }

      setState(s => ({ ...s, isSendingTx: false, txHash, isVerifying: true }))

      // 步骤 3: 验证领取结果
      try {
        await withdrawApi.checkClaimResult({
          orderId,
          transactionHash: txHash,
        })
      } catch (error) {
        const message = error instanceof ApiError ? error.message : '验证领取结果失败'
        setState(s => ({ ...s, isVerifying: false, error: message }))
        return false
      }

      setState(s => ({ ...s, isVerifying: false }))
      return true
    } catch (error) {
      const message = error instanceof ApiError ? error.message : '领取失败'
      setState(s => ({
        ...s,
        isGettingTx: false,
        isSendingTx: false,
        isVerifying: false,
        error: message,
      }))
      return false
    }
  }, [sendTransactionAsync])

  const isLoading = state.isCreatingOrder || state.isGettingTx || state.isSendingTx || state.isVerifying

  // 获取当前步骤描述
  const getStatusText = useCallback(() => {
    if (state.isCreatingOrder) return '创建提现订单中...'
    if (state.isGettingTx) return '获取交易数据中...'
    if (state.isSendingTx) return '请在钱包中确认交易...'
    if (state.isVerifying) return '验证领取结果中...'
    return ''
  }, [state])

  return {
    ...state,
    isLoading,
    createOrder,
    claimWithdraw,
    reset,
    getStatusText,
  }
}
