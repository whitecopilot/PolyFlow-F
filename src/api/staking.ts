// 质押相关 API

import { get, post } from './client'
import type {
  StakingStatus,
  StakedNFT,
  PaginatedData,
  CreateStakeTransactionRequest,
  CreateStakeTransactionResponse,
  SubmitStakingRequest,
  SubmitStakingResponse,
} from './types'

// 创建质押交易数据（未签名）
export async function createStakeTransaction(
  data: CreateStakeTransactionRequest
): Promise<CreateStakeTransactionResponse> {
  return post<CreateStakeTransactionResponse>('/nft/stake/transaction', data)
}

// 提交质押请求（交易已发送后）
export async function submitStaking(
  data: SubmitStakingRequest
): Promise<SubmitStakingResponse> {
  return post<SubmitStakingResponse>('/nft/stake', data)
}

// 获取质押状态
export async function getStakingStatus(): Promise<StakingStatus> {
  return get<StakingStatus>('/nft/stake/status')
}

// 获取已质押 NFT 列表
export async function getStakedNFTs(
  page: number = 1,
  pageSize: number = 10
): Promise<PaginatedData<StakedNFT>> {
  return get<PaginatedData<StakedNFT>>('/nft/stakes', { page, pageSize })
}

// 导出质押 API
export const stakingApi = {
  createStakeTransaction,
  submitStaking,
  getStakingStatus,
  getStakedNFTs,
}

export default stakingApi
