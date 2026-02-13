// PayFi 经济系统 API

import { get } from './client'
import type {
  PriceInfo,
  UserAssets,
  RewardSummary,
  DailyReward,
  PaginatedData,
  PaginatedDataWithSummary,
  TeamStatsResponse,
  RewardType,
  RewardRecordResponse,
  NFTLevelConfigItem,
  NodeLevelConfigItem,
  SystemConfig,
  TeamPerformanceRequest,
  TeamPerformanceResponse,
  DirectMemberPerformanceRequest,
  DirectMemberPerformanceResponse,
} from './types'

// 获取价格信息（公开接口）
export async function getPriceInfo(): Promise<PriceInfo> {
  return get<PriceInfo>('/price', undefined, { skipAuth: true })
}

// 获取 NFT 等级配置列表（公开接口）
export async function getNFTLevelConfigs(): Promise<NFTLevelConfigItem[]> {
  return get<NFTLevelConfigItem[]>('/config/nft-levels', undefined, { skipAuth: true })
}

// 获取节点等级配置列表（公开接口）
export async function getNodeLevelConfigs(): Promise<NodeLevelConfigItem[]> {
  return get<NodeLevelConfigItem[]>('/config/node-levels', undefined, { skipAuth: true })
}

// 获取系统配置（公开接口）
export async function getSystemConfig(): Promise<SystemConfig> {
  return get<SystemConfig>('/config/system', undefined, { skipAuth: true })
}

// 获取用户资产详情
export async function getUserAssets(): Promise<UserAssets> {
  return get<UserAssets>('/assets')
}

// 钱包链上余额响应
export interface WalletBalancesResponse {
  usdtBalance: number
  usdcBalance: number
  walletPicBalance: number
  walletPidBalance: number
}

// 获取钱包链上余额（独立接口，避免拖慢 /assets）
export async function getWalletBalances(): Promise<WalletBalancesResponse> {
  return get<WalletBalancesResponse>('/wallet-balances')
}

// 获取奖励汇总
export async function getRewardSummary(): Promise<RewardSummary> {
  return get<RewardSummary>('/rewards/summary')
}

// 获取每日奖励明细
export async function getDailyRewards(
  page: number = 1,
  pageSize: number = 10
): Promise<PaginatedData<DailyReward>> {
  return get<PaginatedData<DailyReward>>('/rewards/daily', { page, pageSize })
}

// 获取团队统计
export async function getTeamStats(): Promise<TeamStatsResponse> {
  return get<TeamStatsResponse>('/team/stats')
}

// 根据类型获取奖励记录（带汇总数据）
export async function getRewardsByType(
  type: RewardType,
  page: number = 1,
  pageSize: number = 20
): Promise<PaginatedDataWithSummary<RewardRecordResponse>> {
  return get<PaginatedDataWithSummary<RewardRecordResponse>>(`/rewards/${type}`, { page, pageSize })
}

// 获取团队质押业绩数据
export async function getTeamStakingPerformance(
  params?: TeamPerformanceRequest
): Promise<TeamPerformanceResponse> {
  return get<TeamPerformanceResponse>('/team/staking-performance', params as Record<string, string | number | boolean | undefined>)
}

// 获取直推用户业绩
export async function getDirectMemberPerformance(
  params: DirectMemberPerformanceRequest
): Promise<DirectMemberPerformanceResponse> {
  const queryParams: Record<string, string | number | boolean | undefined> = {
    targetUserId: params.targetUserId,
    startDate: params.startDate,
    endDate: params.endDate,
  }
  return get<DirectMemberPerformanceResponse>('/team/direct-member-performance', queryParams)
}

// 导出 PayFi API
export const payfiApi = {
  getPriceInfo,
  getNFTLevelConfigs,
  getNodeLevelConfigs,
  getSystemConfig,
  getUserAssets,
  getWalletBalances,
  getRewardSummary,
  getDailyRewards,
  getTeamStats,
  getRewardsByType,
  getTeamStakingPerformance,
  getDirectMemberPerformance,
}

export default payfiApi
