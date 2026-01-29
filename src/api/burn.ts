// PIC 销毁相关 API

import { get, post } from './client'
import type {
  BurnPICRequest,
  BurnPICResponse,
  BurnRecord,
  PaginatedData,
} from './types'

// 销毁 PIC
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

// 导出销毁 API
export const burnApi = {
  burnPIC,
  getBurnHistory,
}

export default burnApi
