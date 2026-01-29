// NFT 购买钩子 - 处理完整的购买流程
// 1. 创建订单 → 2. 发送交易（使用后端返回的未签名交易数据） → 3. 提交支付确认

import { useState, useCallback } from 'react'
import { useAccount, useSendTransaction } from 'wagmi'
import { type Hex, parseTransaction } from 'viem'
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

    console.log('[NFTPurchase] 开始解析交易数据，长度:', hexData.length)

    // 尝试使用 viem 的 parseTransaction
    // 对于 EIP-155 未签名交易，它可能会将 chainId 误解析为 v
    // 但 to 和 data 字段应该能正确提取
    try {
      const parsed = parseTransaction(hexData as Hex)
      console.log('[NFTPurchase] viem 解析结果:', {
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
      console.log('[NFTPurchase] viem 解析失败，尝试手动解析:', viemError)
    }

    // 手动解析 RLP 数据
    // RLP 格式: f8 XX [items...]
    // 跳过 RLP list 前缀，直接查找关键字段
    const bytes = hexToBytes(hexData)
    console.log('[NFTPurchase] 交易字节数:', bytes.length)

    // 解码 RLP list
    const decoded = decodeRlpList(bytes)
    if (!decoded || decoded.length < 6) {
      console.error('[NFTPurchase] RLP 解码失败或字段不足')
      return null
    }

    console.log('[NFTPurchase] RLP 解码成功，字段数:', decoded.length)

    // 提取字段: [nonce, gasPrice, gasLimit, to, value, data, ...]
    const toBytes = decoded[3]
    const valueBytes = decoded[4]
    const dataBytes = decoded[5]

    const to = bytesToHex(toBytes) as Hex
    const data = bytesToHex(dataBytes) as Hex
    const value = bytesToBigInt(valueBytes)

    console.log('[NFTPurchase] 手动解析结果:', {
      to,
      dataLength: data.length,
      value: value.toString(),
    })

    if (!to || to.length !== 42) {
      console.error('[NFTPurchase] 无效的 to 地址:', to)
      return null
    }

    return { to, data, value }
  } catch (error) {
    console.error('[NFTPurchase] 解析未签名交易失败:', error)
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
    console.error('[NFTPurchase] 不是有效的 RLP list')
    return []
  }

  // 解析 list 中的每个元素
  const items: Uint8Array[] = []
  let pos = offset
  const endPos = offset + listLength

  while (pos < endPos) {
    const itemByte = data[pos]
    let itemOffset = 0
    let itemLength = 0

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
      itemLength = itemByte - 0x80
      itemOffset = 1
    } else if (itemByte <= 0xbf) {
      // 长字符串: 0xb7 + (length of length)
      const lengthOfLength = itemByte - 0xb7
      itemLength = 0
      for (let i = 0; i < lengthOfLength; i++) {
        itemLength = itemLength * 256 + data[pos + 1 + i]
      }
      itemOffset = 1 + lengthOfLength
    } else {
      // 嵌套 list - 简单跳过
      console.warn('[NFTPurchase] 遇到嵌套 list，跳过')
      break
    }

    const item = data.slice(pos + itemOffset, pos + itemOffset + itemLength)
    items.push(item)
    pos += itemOffset + itemLength
  }

  return items
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

        // ========== 步骤 2: 解析并发送交易 ==========
        console.log('[NFTPurchase] 步骤 2: 解析交易数据...')
        console.log('[NFTPurchase] unsignedTx:', orderResponse.unsignedTx?.substring(0, 100) + '...')

        if (!orderResponse.unsignedTx) {
          console.error('[NFTPurchase] 错误: 后端未返回 unsignedTx')
          setError('服务器未返回交易数据')
          return false
        }

        const txParams = parseUnsignedTransactionManual(orderResponse.unsignedTx)
        if (!txParams) {
          console.error('[NFTPurchase] 错误: 无法解析交易数据')
          setError('无法解析交易数据')
          return false
        }

        console.log('[NFTPurchase] 交易参数:', {
          to: txParams.to,
          value: txParams.value.toString(),
          dataLength: txParams.data.length,
        })

        // 发送交易
        console.log('[NFTPurchase] 步骤 2.5: 请求钱包签名...')
        let txHash: string
        try {
          const result = await sendTransactionAsync({
            to: txParams.to,
            data: txParams.data,
            value: txParams.value,
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
