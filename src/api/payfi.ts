// PayFi 经济系统 API

import { get } from './client'
import type {
  PriceInfo,
  UserAssets,
  RewardSummary,
  ReleaseSummary,
  DailyReward,
  PaginatedData,
  TeamStatsResponse,
  RewardType,
  RewardRecordResponse,
  NFTLevelConfigItem,
} from './types'

// 获取价格信息（公开接口）
export async function getPriceInfo(): Promise<PriceInfo> {
  return get<PriceInfo>('/price', undefined, { skipAuth: true })
}

// 获取 NFT 等级配置列表（公开接口）
export async function getNFTLevelConfigs(): Promise<NFTLevelConfigItem[]> {
  return get<NFTLevelConfigItem[]>('/config/nft-levels', undefined, { skipAuth: true })
}

// 获取用户资产详情
export async function getUserAssets(): Promise<UserAssets> {
  return get<UserAssets>('/assets')
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

// 获取释放汇总
export async function getReleaseSummary(): Promise<ReleaseSummary> {
  return get<ReleaseSummary>('/release')
}

// 获取团队统计
export async function getTeamStats(): Promise<TeamStatsResponse> {
  return get<TeamStatsResponse>('/team/stats')
}

// 根据类型获取奖励记录
export async function getRewardsByType(
  type: RewardType,
  page: number = 1,
  pageSize: number = 20
): Promise<PaginatedData<RewardRecordResponse>> {
  return get<PaginatedData<RewardRecordResponse>>(`/rewards/${type}`, { page, pageSize })
}

// 导出 PayFi API
export const payfiApi = {
  getPriceInfo,
  getNFTLevelConfigs,
  getUserAssets,
  getRewardSummary,
  getDailyRewards,
  getReleaseSummary,
  getTeamStats,
  getRewardsByType,
}

export default payfiApi
