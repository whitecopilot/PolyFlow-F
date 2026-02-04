// 管理员相关 API
import { get } from './client'
import type { CacheStatusResponse } from './types'

/**
 * 获取缓存状态（仅超级管理员可访问）
 */
export async function getCacheStatus(): Promise<CacheStatusResponse> {
  return get<CacheStatusResponse>('/super-admin/cache/status')
}

export const adminApi = {
  getCacheStatus,
}
