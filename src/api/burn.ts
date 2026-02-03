// PIC 销毁相关 API

import { get, post } from './client'
import type {
  BurnPICRequest,
  BurnPICResponse,
  BurnRecord,
  PaginatedData,
  PreparePICBurnRequest,
  PreparePICBurnResponse,
  SubmitPICBurnRequest,
  SubmitPICBurnResponse,
} from './types'

// 销毁 PIC（系统内销毁 - 扣减余额）
export async function burnPIC(data: BurnPICRequest): Promise<BurnPICResponse> {
  return post<BurnPICResponse>('/pic/burn', data)
}

// 获取销毁历史
export async function getBurnHistory(
  page: number = 1,
  pageSize: number = 10
): Promise<PaginatedData<BurnRecord>> {
  return get<PaginatedData<BurnRecord>>('/pic/burns', { page, pageSize })
}

// ================================
// 链上销毁 API（钱包销毁）
// ================================

// 准备链上销毁 - 获取交易参数
export async function preparePICBurn(data: PreparePICBurnRequest): Promise<PreparePICBurnResponse> {
  return post<PreparePICBurnResponse>('/pic/onchain-burn/prepare', data)
}

// 提交链上销毁 - 发送交易哈希
export async function submitPICBurn(data: SubmitPICBurnRequest): Promise<SubmitPICBurnResponse> {
  return post<SubmitPICBurnResponse>('/pic/onchain-burn/submit', data)
}

// 导出销毁 API
export const burnApi = {
  burnPIC,
  getBurnHistory,
  preparePICBurn,
  submitPICBurn,
}

export default burnApi
