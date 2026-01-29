// NFT 购买相关 API

import { get, post } from './client'
import type {
  CreateNFTOrderRequest,
  CreateNFTOrderResponse,
  SubmitPaymentRequest,
  NFTOrder,
  PaginatedData,
  UserNFTItem,
  NFTHoldingStats,
} from './types'

// 创建 NFT 购买订单
export async function createNFTOrder(data: CreateNFTOrderRequest): Promise<CreateNFTOrderResponse> {
  return post<CreateNFTOrderResponse>('/nft/orders', data)
}

// 提交支付信息
export async function submitPayment(data: SubmitPaymentRequest): Promise<NFTOrder> {
  return post<NFTOrder>('/nft/orders/payment', data)
}

// 获取用户 NFT 订单列表
export async function getNFTOrders(
  page: number = 1,
  pageSize: number = 10
): Promise<PaginatedData<NFTOrder>> {
  return get<PaginatedData<NFTOrder>>('/nft/orders', { page, pageSize })
}

// 获取 NFT 订单详情
export async function getNFTOrderDetail(orderId: number): Promise<NFTOrder> {
  return get<NFTOrder>(`/nft/orders/${orderId}`)
}

// 获取用户所有 NFT 列表
export async function getUserNFTList(
  page: number = 1,
  pageSize: number = 10
): Promise<PaginatedData<UserNFTItem>> {
  return get<PaginatedData<UserNFTItem>>('/nft/holdings', { page, pageSize })
}

// 获取用户 NFT 统计信息
export async function getUserNFTStats(): Promise<NFTHoldingStats> {
  return get<NFTHoldingStats>('/nft/holdings/stats')
}

// 导出 NFT API
export const nftApi = {
  createNFTOrder,
  submitPayment,
  getNFTOrders,
  getNFTOrderDetail,
  getUserNFTList,
  getUserNFTStats,
}

export default nftApi
