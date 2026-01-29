// 用户相关 API

import { get } from './client'
import type { PaginatedData, UserRelation } from './types'

// 用户关系类型
export const UserRelationType = {
  All: 0,
  Direct: 1,
  Indirect: 2,
} as const

export type UserRelationType = typeof UserRelationType[keyof typeof UserRelationType]

// 获取用户的推荐关系列表
export async function getUserRelations(
  relationType: UserRelationType = UserRelationType.All,
  page: number = 1,
  pageSize: number = 10
): Promise<PaginatedData<UserRelation>> {
  return get<PaginatedData<UserRelation>>('/me/relation', {
    relation: relationType,
    page,
    pageSize,
  })
}

// 导出用户 API
export const userApi = {
  getUserRelations,
}

export default userApi
