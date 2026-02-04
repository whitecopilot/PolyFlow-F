// 认证相关 API

import { get, post, setStoredToken } from './client'
import type {
  NonceResponse,
  LoginRequest,
  LoginResponse,
  BindInviterRequest,
  CreateInviteCodeResponse,
} from './types'

// 获取签名随机数
export async function getNonce(address: string): Promise<NonceResponse> {
  return get<NonceResponse>('/nonce', { address }, { skipAuth: true })
}

// 登录（带指纹）
export async function login(data: LoginRequest): Promise<LoginResponse> {
  const response = await post<LoginResponse>('/auth', data, { skipAuth: true })

  // 存储 token
  if (response.token) {
    setStoredToken(response.token)
  }

  return response
}

// 生成邀请码
export async function createInviteCode(): Promise<CreateInviteCodeResponse> {
  return get<CreateInviteCodeResponse>('/me/invite')
}

// 绑定邀请人
export async function bindInviter(data: BindInviterRequest): Promise<{ message: string }> {
  return post<{ message: string }>('/me/bind-inviter', data)
}

// 导出所有认证 API
export const authApi = {
  getNonce,
  login,
  createInviteCode,
  bindInviter,
}

export default authApi
