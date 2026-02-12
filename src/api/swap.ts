// 代币兑换相关 API

import { get, post } from './client'
import type {
  CreateSwapOrderRequest,
  CreateSwapOrderResponse,
  SubmitSwapPaymentRequest,
  SwapOrder,
  PaginatedData,
  SwapConfigResponse,
} from './types'

// 创建兑换订单
export async function createSwapOrder(data: CreateSwapOrderRequest): Promise<CreateSwapOrderResponse> {
  return post<CreateSwapOrderResponse>('/swap/orders', data)
}

// 提交兑换支付信息
export async function submitSwapPayment(data: SubmitSwapPaymentRequest): Promise<void> {
  return post<void>('/swap/orders/payment', data)
}

// 获取用户兑换订单列表
export async function getSwapOrders(
  page: number = 1,
  pageSize: number = 10
): Promise<PaginatedData<SwapOrder>> {
  return get<PaginatedData<SwapOrder>>('/swap/orders', { page, pageSize })
}

// 获取兑换订单详情
export async function getSwapOrderDetail(orderId: number): Promise<SwapOrder> {
  return get<SwapOrder>(`/swap/orders/${orderId}`)
}

// 获取兑换配置
export async function getSwapConfig(): Promise<SwapConfigResponse> {
  return get<SwapConfigResponse>('/swap/config')
}

// 导出 Swap API
export const swapApi = {
  createSwapOrder,
  submitSwapPayment,
  getSwapOrders,
  getSwapOrderDetail,
  getSwapConfig,
}

export default swapApi
