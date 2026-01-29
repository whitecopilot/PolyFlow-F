// NFT 质押钩子 - 处理完整的质押流程
// 1. 获取交易数据 → 2. 发送交易 → 3. 等待链上确认 → 4. 提交验证（同步验证）

import { useState, useCallback } from 'react'
import { useAccount, useSendTransaction } from 'wagmi'
import { type Hex } from 'viem'
import { waitForTransactionReceipt } from '@wagmi/core'
import { config as wagmiConfig } from '../config/wagmi'
import { stakingApi, ApiError } from '../api'
import type { UserNFTItem } from '../api/types'

// 质押状态枚举
export type StakeStep =
  | 'idle'           // 空闲
  | 'preparing'      // 准备交易数据
  | 'signing'        // 等待钱包签名
  | 'confirming'     // 等待链上确认
  | 'submitting'     // 提交验证（同步）
  | 'success'        // 成功
  | 'error'          // 失败

export interface NFTStakeState {
  step: StakeStep
  error: string | null
  txHash: string | null
  tokenId: number | null
  stakeId: string | null
  stakeTime: string | null
}

export function useNFTStake() {
  const [state, setState] = useState<NFTStakeState>({
    step: 'idle',
    error: null,
    txHash: null,
    tokenId: null,
    stakeId: null,
    stakeTime: null,
  })

  const { address, isConnected } = useAccount()
  const { sendTransactionAsync } = useSendTransaction()

  // 重置状态
  const reset = useCallback(() => {
    setState({
      step: 'idle',
      error: null,
      txHash: null,
      tokenId: null,
      stakeId: null,
      stakeTime: null,
    })
  }, [])

  // 设置错误
  const setError = useCallback((error: string) => {
    setState(s => ({ ...s, step: 'error', error }))
  }, [])

  // 质押 NFT 完整流程
  const stakeNFT = useCallback(
    async (nft: UserNFTItem): Promise<boolean> => {
      console.log('[NFTStake] ========== 开始质押流程 ==========')
      console.log('[NFTStake] NFT:', nft)
      console.log('[NFTStake] 钱包状态:', { address, isConnected })

      if (!nft || !nft.tokenId) {
        console.error('[NFTStake] 错误: 无效的 NFT')
        setError('请选择要质押的 NFT')
        return false
      }

      if (!isConnected || !address) {
        console.error('[NFTStake] 错误: 钱包未连接')
        setError('请先连接钱包')
        return false
      }

      if (nft.isStaked) {
        console.error('[NFTStake] 错误: NFT 已质押')
        setError('该 NFT 已经质押')
        return false
      }

      setState(s => ({ ...s, tokenId: nft.tokenId }))

      try {
        // ========== 步骤 1: 获取交易数据 ==========
        console.log('[NFTStake] 步骤 1: 获取质押交易数据...')
        setState(s => ({ ...s, step: 'preparing', error: null }))

        let txResponse
        try {
          txResponse = await stakingApi.createStakeTransaction({
            tokenId: nft.tokenId,
          })
          console.log('[NFTStake] 交易数据获取成功:', txResponse)
        } catch (error) {
          console.error('[NFTStake] 获取交易数据失败:', error)
          const message = error instanceof ApiError ? error.message : '获取交易数据失败'
          setError(message)
          return false
        }

        setState(s => ({ ...s, step: 'signing' }))

        // ========== 步骤 2: 发送交易 ==========
        console.log('[NFTStake] 步骤 2: 请求钱包签名...')
        let txHash: string
        try {
          const result = await sendTransactionAsync({
            to: txResponse.contractAddress as Hex,
            data: txResponse.unsignedTx as Hex,
            value: BigInt(0), // stake 不需要发送 ETH
          })
          txHash = result
          console.log('[NFTStake] 交易已发送, hash:', txHash)
        } catch (error: unknown) {
          console.error('[NFTStake] 发送交易失败:', error)
          const err = error as { name?: string; message?: string; code?: number }
          if (err.name === 'UserRejectedRequestError' ||
              err.message?.includes('rejected') ||
              err.message?.includes('denied') ||
              err.code === 4001) {
            setError('交易被用户取消')
          } else {
            setError(err.message || '交易失败')
          }
          return false
        }

        setState(s => ({
          ...s,
          txHash,
          step: 'confirming',
        }))

        // ========== 步骤 3: 等待交易确认 ==========
        console.log('[NFTStake] 步骤 3: 等待交易确认...')
        try {
          const receipt = await waitForTransactionReceipt(wagmiConfig, {
            hash: txHash as Hex,
            confirmations: 1,
          })
          console.log('[NFTStake] 交易已确认, status:', receipt.status)

          if (receipt.status === 'reverted') {
            setError('交易在链上执行失败')
            return false
          }
        } catch (error: unknown) {
          console.error('[NFTStake] 等待交易确认失败:', error)
          const err = error as { message?: string }
          setError(err.message || '等待交易确认失败')
          return false
        }

        setState(s => ({ ...s, step: 'submitting' }))

        // ========== 步骤 4: 提交质押验证（同步验证） ==========
        console.log('[NFTStake] 步骤 4: 提交质押验证（同步）...')
        try {
          const verifyResult = await stakingApi.submitStaking({
            tokenId: nft.tokenId,
            transactionHash: txHash,
          })
          console.log('[NFTStake] 验证结果:', verifyResult)

          // 检查验证结果
          if (verifyResult.status === 'confirmed') {
            // 验证成功
            console.log('[NFTStake] ========== 质押成功 ==========')
            setState(s => ({
              ...s,
              step: 'success',
              stakeId: verifyResult.stakeId || null,
              stakeTime: verifyResult.stakeTime || null,
            }))
            return true
          } else if (verifyResult.status === 'failed') {
            // 验证失败
            setError(verifyResult.errorMessage || '质押验证失败')
            return false
          } else {
            // pending 状态 - 后台任务会继续处理，可以认为提交成功
            console.log('[NFTStake] 质押请求已提交，后台验证中...')
            setState(s => ({ ...s, step: 'success' }))
            return true
          }
        } catch (error) {
          console.error('[NFTStake] 提交质押验证失败:', error)
          const message = error instanceof ApiError ? error.message : '提交质押验证失败'
          setError(message)
          return false
        }
      } catch (error) {
        console.error('[NFTStake] 质押流程异常:', error)
        setError('质押流程失败')
        return false
      }
    },
    [address, isConnected, sendTransactionAsync, setError]
  )

  const isLoading = state.step !== 'idle' && state.step !== 'success' && state.step !== 'error'

  // 获取当前步骤描述
  const getStatusText = useCallback(() => {
    switch (state.step) {
      case 'preparing': return '准备交易数据...'
      case 'signing': return '请在钱包中确认交易...'
      case 'confirming': return '等待链上确认...'
      case 'submitting': return '验证质押状态...'
      case 'success': return '质押成功!'
      case 'error': return state.error || '质押失败'
      default: return ''
    }
  }, [state.step, state.error])

  return {
    ...state,
    isLoading,
    stakeNFT,
    reset,
    getStatusText,
  }
}
