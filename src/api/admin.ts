// 管理员相关 API
import { get } from './client'
import type { CacheStatusResponse, MonitoringStatusResponse } from './types'

/**
 * 获取缓存状态（仅超级管理员可访问）
 */
export async function getCacheStatus(): Promise<CacheStatusResponse> {
  return get<CacheStatusResponse>('/super-admin/cache/status')
}

/**
 * 获取系统监控状态（仅超级管理员可访问）
 * 包含 WebSocket、任务调度器、定时任务协调器、事件队列等状态
 */
export async function getMonitoringStatus(): Promise<MonitoringStatusResponse> {
  return get<MonitoringStatusResponse>('/super-admin/monitoring/status')
}

export const adminApi = {
  getCacheStatus,
  getMonitoringStatus,
}
