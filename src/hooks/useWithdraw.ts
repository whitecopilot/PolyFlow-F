// 提现钩子 - 处理完整的提现流程
// 1. 创建订单 → 2. 获取交易数据 → 3. 发送交易 → 4. 验证领取结果

import { useState, useCallback } from 'react'
import { useSendTransaction } from 'wagmi'
import { type Hex } from 'viem'
import { waitForTransactionReceipt } from '@wagmi/core'
import { config as wagmiConfig } from '../config/wagmi'
import { withdrawApi, ApiError } from '../api'
import type { TokenType, WithdrawSource, WalletTransactionParams } from '../api/types'
import { TokenTypeCode, WithdrawSourceCode } from '../api/types'

// 提现步骤枚举
export type WithdrawStep =
  | 'idle'           // 空闲
  | 'creating'       // 创建订单中
  | 'getting_tx'     // 获取交易数据中
  | 'signing'        // 等待钱包签名
  | 'confirming'     // 等待链上确认
  | 'verifying'      // 验证领取结果中
  | 'success'        // 成功
  | 'error'          // 失败

export interface WithdrawState {
  step: WithdrawStep
  error: string | null
  orderId: number | null
  txHash: string | null
}

export function useWithdraw() {
  const [state, setState] = useState<WithdrawState>({
    step: 'idle',
    error: null,
    orderId: null,
    txHash: null,
  })

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

  // 创建提现订单
  const createOrder = useCallback(async (
    amount: number,
    tokenType: TokenType = 'PID',
    source?: WithdrawSource
  ): Promise<{ orderId: number; transactionParams?: WalletTransactionParams } | null> => {
    setState(s => ({ ...s, step: 'creating', error: null }))

    try {
      // 将字符串类型转换为后端需要的数字类型
      const typeCodeMap: Record<string, number> = {
        PID: TokenTypeCode.PID,
        PIC: TokenTypeCode.PIC,
        USDT: TokenTypeCode.USDT,
        USDC: TokenTypeCode.USDC,
      }
      const typeCode = typeCodeMap[tokenType] ?? TokenTypeCode.PID
      const sourceCodeMap: Record<string, number> = {
        balance: WithdrawSourceCode.balance,
        released: WithdrawSourceCode.released,
        swap: WithdrawSourceCode.swap,
      }
      const sourceCode = source ? sourceCodeMap[source] : undefined

      const response = await withdrawApi.createWithdrawOrder({
        amount,
        type: typeCode,
        source: sourceCode,
      })

      setState(s => ({
        ...s,
        step: 'idle',
        orderId: response.orderId,
      }))

      return {
        orderId: response.orderId,
        transactionParams: response.transactionParams,
      }
    } catch (error) {
      const message = error instanceof ApiError ? error.message : '创建提现订单失败'
      setState(s => ({ ...s, step: 'error', error: message }))
      return null
    }
  }, [])

  // 领取提现（链上交易）- 可用于新订单或重新提取失败的订单
  const claimWithdraw = useCallback(async (orderId: number): Promise<boolean> => {
    setState(s => ({ ...s, step: 'getting_tx', error: null, orderId }))

    try {
      // 步骤 1: 获取交易参数
      console.log('[Withdraw] 获取交易参数, orderId:', orderId)
      const txParams = await withdrawApi.createWithdrawTransaction(orderId)
      console.log('[Withdraw] 交易参数:', txParams)

      setState(s => ({ ...s, step: 'signing' }))

      // 步骤 2: 发送交易（钱包处理 gas 等）
      let txHash: string
      try {
        const result = await sendTransactionAsync({
          to: txParams.to as Hex,
          data: txParams.data as Hex,
          value: BigInt(txParams.value || '0'),
        })
        txHash = result
        console.log('[Withdraw] 交易已发送, txHash:', txHash)
      } catch (error) {
        console.error('[Withdraw] 发送交易失败:', error)
        setState(s => ({ ...s, step: 'error', error: '交易被拒绝或失败' }))
        return false
      }

      setState(s => ({ ...s, txHash, step: 'confirming' }))

      // 步骤 3: 等待交易确认
      try {
        console.log('[Withdraw] 等待交易确认...')
        await waitForTransactionReceipt(wagmiConfig, {
          hash: txHash as Hex,
          confirmations: 1,
        })
        console.log('[Withdraw] 交易已确认')
      } catch (error) {
        console.error('[Withdraw] 等待交易确认失败:', error)
        setState(s => ({ ...s, step: 'error', error: '交易确认失败' }))
        return false
      }

      setState(s => ({ ...s, step: 'verifying' }))

      // 步骤 4: 验证领取结果
      try {
        console.log('[Withdraw] 验证领取结果...')
        await withdrawApi.checkClaimResult({
          orderId,
          transactionHash: txHash,
        })
        console.log('[Withdraw] 验证成功')
      } catch (error) {
        const message = error instanceof ApiError ? error.message : '验证领取结果失败'
        setState(s => ({ ...s, step: 'error', error: message }))
        return false
      }

      setState(s => ({ ...s, step: 'success' }))
      return true
    } catch (error) {
      const message = error instanceof ApiError ? error.message : '领取失败'
      setState(s => ({
        ...s,
        step: 'error',
        error: message,
      }))
      return false
    }
  }, [sendTransactionAsync])

  // 使用已有的交易参数直接领取（用于创建订单时返回了 transactionParams 的情况）
  const claimWithdrawWithTx = useCallback(async (orderId: number, txParams: WalletTransactionParams): Promise<boolean> => {
    setState(s => ({ ...s, step: 'signing', error: null, orderId }))

    try {
      // 发送交易（钱包处理 gas 等）
      let txHash: string
      try {
        const result = await sendTransactionAsync({
          to: txParams.to as Hex,
          data: txParams.data as Hex,
          value: BigInt(txParams.value || '0'),
        })
        txHash = result
        console.log('[Withdraw] 交易已发送, txHash:', txHash)
      } catch (error) {
        console.error('[Withdraw] 发送交易失败:', error)
        setState(s => ({ ...s, step: 'error', error: '交易被拒绝或失败' }))
        return false
      }

      setState(s => ({ ...s, txHash, step: 'confirming' }))

      // 等待交易确认
      try {
        console.log('[Withdraw] 等待交易确认...')
        await waitForTransactionReceipt(wagmiConfig, {
          hash: txHash as Hex,
          confirmations: 1,
        })
        console.log('[Withdraw] 交易已确认')
      } catch (error) {
        console.error('[Withdraw] 等待交易确认失败:', error)
        setState(s => ({ ...s, step: 'error', error: '交易确认失败' }))
        return false
      }

      setState(s => ({ ...s, step: 'verifying' }))

      // 验证领取结果
      try {
        console.log('[Withdraw] 验证领取结果...')
        await withdrawApi.checkClaimResult({
          orderId,
          transactionHash: txHash,
        })
        console.log('[Withdraw] 验证成功')
      } catch (error) {
        const message = error instanceof ApiError ? error.message : '验证领取结果失败'
        setState(s => ({ ...s, step: 'error', error: message }))
        return false
      }

      setState(s => ({ ...s, step: 'success' }))
      return true
    } catch (error) {
      const message = error instanceof ApiError ? error.message : '领取失败'
      setState(s => ({ ...s, step: 'error', error: message }))
      return false
    }
  }, [sendTransactionAsync])

  // 完整的提现流程：创建订单 + 领取
  const withdraw = useCallback(async (
    amount: number,
    tokenType: TokenType = 'PID',
    source?: WithdrawSource
  ): Promise<boolean> => {
    // 创建订单
    const result = await createOrder(amount, tokenType, source)
    if (!result) return false

    // 如果返回了交易参数，直接使用它进行交易
    if (result.transactionParams) {
      return claimWithdrawWithTx(result.orderId, result.transactionParams)
    }

    // 否则走原来的流程：获取交易数据再提交
    return claimWithdraw(result.orderId)
  }, [createOrder, claimWithdraw, claimWithdrawWithTx])

  const isLoading = state.step !== 'idle' && state.step !== 'success' && state.step !== 'error'

  // 获取当前步骤描述
  const getStatusText = useCallback(() => {
    switch (state.step) {
      case 'creating':
        return '创建提现订单中...'
      case 'getting_tx':
        return '获取交易数据中...'
      case 'signing':
        return '请在钱包中确认交易...'
      case 'confirming':
        return '等待链上确认...'
      case 'verifying':
        return '验证领取结果中...'
      case 'success':
        return '提现成功'
      case 'error':
        return state.error || '提现失败'
      default:
        return ''
    }
  }, [state.step, state.error])

  return {
    ...state,
    isLoading,
    createOrder,
    claimWithdraw,
    withdraw,
    reset,
    getStatusText,
  }
}
