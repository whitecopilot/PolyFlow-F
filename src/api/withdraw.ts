// 提现相关 API

import { get, post } from './client'
import type {
  CreateWithdrawRequest,
  CreateWithdrawResponse,
  WithdrawOrder,
  CreateWithdrawTransactionRequest,
  CreateWithdrawTransactionResponse,
  ClaimResultCheckRequest,
  PaginatedData,
} from './types'

// 创建提现订单
export async function createWithdrawOrder(data: CreateWithdrawRequest): Promise<CreateWithdrawResponse> {
  return post<CreateWithdrawResponse>('/withdraw', data)
}

// 获取提现订单列表
export async function getWithdrawOrders(
  state?: string,
  page: number = 1,
  pageSize: number = 10
): Promise<PaginatedData<WithdrawOrder> & { amountWithdrawn: string }> {
  return get<PaginatedData<WithdrawOrder> & { amountWithdrawn: string }>('/withdraw', {
    state,
    page,
    pageSize,
  })
}

// 获取提现订单详情
export async function getWithdrawOrderDetail(orderId: number): Promise<WithdrawOrder> {
  return get<WithdrawOrder>(`/withdraw/${orderId}`)
}

// 创建提现交易数据（用于链上领取）
export async function createWithdrawTransaction(
  orderId: number,
  data?: CreateWithdrawTransactionRequest
): Promise<CreateWithdrawTransactionResponse> {
  return post<CreateWithdrawTransactionResponse>(`/withdraw/${orderId}/transaction`, data)
}

// 领取结果校验
export async function checkClaimResult(data: ClaimResultCheckRequest): Promise<{ message: string }> {
  return post<{ message: string }>('/withdraw/claim', data)
}

// 导出提现 API
export const withdrawApi = {
  createWithdrawOrder,
  getWithdrawOrders,
  getWithdrawOrderDetail,
  createWithdrawTransaction,
  checkClaimResult,
}

export default withdrawApi
