// 提现钩子 - 处理完整的提现流程
// 1. 创建订单 → 2. 获取交易数据 → 3. 发送交易 → 4. 验证领取结果

import { useState, useCallback } from 'react'
import { useSendTransaction } from 'wagmi'
import { type Hex, parseTransaction } from 'viem'
import { waitForTransactionReceipt } from '@wagmi/core'
import { config as wagmiConfig } from '../config/wagmi'
import { withdrawApi, ApiError } from '../api'
import type { TokenType, WithdrawSource } from '../api/types'
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

/**
 * 手动解析 EIP-155 未签名交易 hex 字符串
 * 后端格式：rlp([nonce, gasPrice, gasLimit, to, value, data, chainId, 0, 0])
 *
 * 注意：viem 的 parseTransaction 是为已签名交易设计的，
 * 但 EIP-155 未签名交易的格式 [chainId, 0, 0] 会被误解析。
 * 我们只需要提取 to 和 data 字段，让钱包重新处理其他参数。
 */
function parseUnsignedTransactionManual(unsignedTxHex: string): {
  to: Hex
  data: Hex
  value: bigint
} | null {
  try {
    // 确保有 0x 前缀
    const hexData = unsignedTxHex.startsWith('0x')
      ? unsignedTxHex
      : `0x${unsignedTxHex}`

    console.log('[Withdraw] 开始解析交易数据，长度:', hexData.length)

    // 尝试使用 viem 的 parseTransaction
    // 对于 EIP-155 未签名交易，它可能会将 chainId 误解析为 v
    // 但 to 和 data 字段应该能正确提取
    try {
      const parsed = parseTransaction(hexData as Hex)
      console.log('[Withdraw] viem 解析结果:', {
        to: parsed.to,
        value: parsed.value?.toString(),
        dataLength: parsed.data?.length,
        nonce: parsed.nonce,
        chainId: parsed.chainId,
      })

      if (parsed.to) {
        return {
          to: parsed.to,
          data: parsed.data || '0x',
          value: parsed.value || BigInt(0),
        }
      }
    } catch (viemError) {
      console.log('[Withdraw] viem 解析失败，尝试手动解析:', viemError)
    }

    // 手动解析 RLP 数据
    // RLP 格式: f8 XX [items...]
    // 跳过 RLP list 前缀，直接查找关键字段
    const bytes = hexToBytes(hexData)
    console.log('[Withdraw] 交易字节数:', bytes.length)

    // 解码 RLP list
    const decoded = decodeRlpList(bytes)
    if (!decoded || decoded.length < 6) {
      console.error('[Withdraw] RLP 解码失败或字段不足')
      return null
    }

    console.log('[Withdraw] RLP 解码成功，字段数:', decoded.length)

    // 提取字段: [nonce, gasPrice, gasLimit, to, value, data, ...]
    const toBytes = decoded[3]
    const valueBytes = decoded[4]
    const dataBytes = decoded[5]

    const to = bytesToHex(toBytes) as Hex
    const data = bytesToHex(dataBytes) as Hex
    const value = bytesToBigInt(valueBytes)

    console.log('[Withdraw] 手动解析结果:', {
      to,
      dataLength: data.length,
      value: value.toString(),
    })

    if (!to || to.length !== 42) {
      console.error('[Withdraw] 无效的 to 地址:', to)
      return null
    }

    return { to, data, value }
  } catch (error) {
    console.error('[Withdraw] 解析未签名交易失败:', error)
    return null
  }
}

// 辅助函数：hex 转字节数组
function hexToBytes(hex: string): Uint8Array {
  const cleanHex = hex.startsWith('0x') ? hex.slice(2) : hex
  const bytes = new Uint8Array(cleanHex.length / 2)
  for (let i = 0; i < bytes.length; i++) {
    bytes[i] = parseInt(cleanHex.slice(i * 2, i * 2 + 2), 16)
  }
  return bytes
}

// 辅助函数：字节数组转 hex
function bytesToHex(bytes: Uint8Array): string {
  if (bytes.length === 0) return '0x'
  return '0x' + Array.from(bytes).map(b => b.toString(16).padStart(2, '0')).join('')
}

// 辅助函数：字节数组转 BigInt
function bytesToBigInt(bytes: Uint8Array): bigint {
  if (bytes.length === 0) return BigInt(0)
  return BigInt(bytesToHex(bytes))
}

// 简单的 RLP list 解码器
function decodeRlpList(data: Uint8Array): Uint8Array[] {
  if (data.length === 0) return []

  const firstByte = data[0]
  let offset = 0
  let listLength = 0

  // 解析 list 前缀
  if (firstByte >= 0xf8) {
    // 长 list: 0xf8 + (length of length) + length bytes + data
    const lengthOfLength = firstByte - 0xf7
    offset = 1 + lengthOfLength
    listLength = 0
    for (let i = 0; i < lengthOfLength; i++) {
      listLength = listLength * 256 + data[1 + i]
    }
  } else if (firstByte >= 0xc0) {
    // 短 list: 0xc0 + length + data
    listLength = firstByte - 0xc0
    offset = 1
  } else {
    console.error('[Withdraw] 不是有效的 RLP list')
    return []
  }

  // 解析 list 中的每个元素
  const items: Uint8Array[] = []
  let pos = offset
  const endPos = offset + listLength

  while (pos < endPos) {
    const itemByte = data[pos]

    if (itemByte < 0x80) {
      // 单字节值
      items.push(new Uint8Array([itemByte]))
      pos += 1
      continue
    } else if (itemByte === 0x80) {
      // 空字节
      items.push(new Uint8Array([]))
      pos += 1
      continue
    } else if (itemByte <= 0xb7) {
      // 短字符串: 0x80 + length
      const itemLength = itemByte - 0x80
      const item = data.slice(pos + 1, pos + 1 + itemLength)
      items.push(item)
      pos += 1 + itemLength
    } else if (itemByte <= 0xbf) {
      // 长字符串: 0xb7 + (length of length)
      const lengthOfLength = itemByte - 0xb7
      let itemLength = 0
      for (let i = 0; i < lengthOfLength; i++) {
        itemLength = itemLength * 256 + data[pos + 1 + i]
      }
      const item = data.slice(pos + 1 + lengthOfLength, pos + 1 + lengthOfLength + itemLength)
      items.push(item)
      pos += 1 + lengthOfLength + itemLength
    } else {
      // 嵌套 list - 简单跳过
      console.warn('[Withdraw] 遇到嵌套 list，跳过')
      break
    }
  }

  return items
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
  ): Promise<{ orderId: number; tx?: string } | null> => {
    setState(s => ({ ...s, step: 'creating', error: null }))

    try {
      // 将字符串类型转换为后端需要的数字类型
      const typeCode = tokenType === 'PID' ? TokenTypeCode.PID : TokenTypeCode.PIC
      const sourceCode = source
        ? (source === 'balance' ? WithdrawSourceCode.balance : WithdrawSourceCode.released)
        : undefined

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
        tx: response.tx,
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
      // 步骤 1: 获取交易数据
      console.log('[Withdraw] 获取交易数据, orderId:', orderId)
      const txData = await withdrawApi.createWithdrawTransaction(orderId)
      console.log('[Withdraw] 交易数据:', txData)

      setState(s => ({ ...s, step: 'signing' }))

      // 步骤 2: 解析并发送交易
      let txHash: string
      try {
        // 解析后端返回的交易数据
        const parsedTx = parseUnsignedTransactionManual(txData.tx)

        if (!parsedTx) {
          throw new Error('无法解析交易数据')
        }

        console.log('[Withdraw] 解析后的交易:', parsedTx)

        // 使用解析后的数据发送交易
        const result = await sendTransactionAsync({
          to: parsedTx.to,
          data: parsedTx.data,
          value: parsedTx.value,
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

  // 使用已有的交易数据直接领取（用于创建订单时返回了 tx 的情况）
  const claimWithdrawWithTx = useCallback(async (orderId: number, txHex: string): Promise<boolean> => {
    setState(s => ({ ...s, step: 'signing', error: null, orderId }))

    try {
      // 解析并发送交易
      let txHash: string
      try {
        const parsedTx = parseUnsignedTransactionManual(txHex)

        if (!parsedTx) {
          throw new Error('无法解析交易数据')
        }

        console.log('[Withdraw] 解析后的交易:', parsedTx)

        const result = await sendTransactionAsync({
          to: parsedTx.to,
          data: parsedTx.data,
          value: parsedTx.value,
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

    // 如果返回了 tx 数据，直接使用它进行交易
    if (result.tx) {
      return claimWithdrawWithTx(result.orderId, result.tx)
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
