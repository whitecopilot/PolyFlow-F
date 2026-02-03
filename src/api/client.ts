// HTTP 客户端配置

import type { ApiResponse } from './types'
import { ErrorCodes } from './types'

// 未授权回调函数类型
type UnauthorizedCallback = () => void

// 未授权回调（在应用初始化时设置）
let onUnauthorizedCallback: UnauthorizedCallback | null = null

// 设置未授权回调
export function setOnUnauthorizedCallback(callback: UnauthorizedCallback): void {
  onUnauthorizedCallback = callback
}

// API 基础路径（支持环境变量配置）
// VITE_API_BASE_URL: 完整的 API 地址，如 https://api.example.com/api/v1
// 如果未配置，默认使用相对路径 /api/v1
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '/api/v1'

// Token 存储键
const TOKEN_STORAGE_KEY = 'polyflow-token'
// Auth Store 存储键（zustand persist）
const AUTH_STORE_KEY = 'polyflow-auth'

// 获取存储的 token
export function getStoredToken(): string | null {
  try {
    return localStorage.getItem(TOKEN_STORAGE_KEY)
  } catch {
    return null
  }
}

// 获取存储的钱包地址（从 zustand persist 中读取）
export function getStoredAddress(): string | null {
  try {
    const authData = localStorage.getItem(AUTH_STORE_KEY)
    if (authData) {
      const parsed = JSON.parse(authData)
      return parsed.state?.signedAddress || null
    }
    return null
  } catch {
    return null
  }
}

// 存储 token
export function setStoredToken(token: string): void {
  try {
    localStorage.setItem(TOKEN_STORAGE_KEY, token)
  } catch {
    console.error('Failed to store token')
  }
}

// 清除 token
export function clearStoredToken(): void {
  try {
    localStorage.removeItem(TOKEN_STORAGE_KEY)
  } catch {
    console.error('Failed to clear token')
  }
}

// API 错误类
export class ApiError extends Error {
  code: number
  errorCode?: number

  constructor(message: string, code: number, errorCode?: number) {
    super(message)
    this.name = 'ApiError'
    this.code = code
    this.errorCode = errorCode
  }

  // 是否未授权
  get isUnauthorized(): boolean {
    return this.code === 401 || this.errorCode === ErrorCodes.Unauthorized
  }

  // 是否余额不足
  get isInsufficientBalance(): boolean {
    return this.errorCode === ErrorCodes.InsufficientBalance
  }
}

// 请求配置
interface RequestOptions extends RequestInit {
  params?: Record<string, string | number | boolean | undefined>
  skipAuth?: boolean
}

// 构建 URL（带查询参数）
function buildUrl(path: string, params?: Record<string, string | number | boolean | undefined>): string {
  // 判断 API_BASE_URL 是否为绝对路径
  const isAbsoluteUrl = API_BASE_URL.startsWith('http://') || API_BASE_URL.startsWith('https://')
  const baseUrl = isAbsoluteUrl ? API_BASE_URL : window.location.origin + API_BASE_URL
  // 移除路径前导斜杠，避免被 URL 构造函数解释为绝对路径
  const normalizedPath = path.startsWith('/') ? path.slice(1) : path
  const url = new URL(normalizedPath, baseUrl + '/')

  if (params) {
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        url.searchParams.append(key, String(value))
      }
    })
  }

  return url.toString()
}

// 统一请求方法
async function request<T>(
  path: string,
  options: RequestOptions = {}
): Promise<T> {
  const { params, skipAuth = false, ...fetchOptions } = options

  // 构建 headers
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
    ...(fetchOptions.headers as Record<string, string>),
  }

  // 添加认证 token 和钱包地址
  if (!skipAuth) {
    const token = getStoredToken()
    if (token) {
      headers['Authorization'] = `Bearer ${token}`
    }

    // 添加钱包地址（后端 AuthMiddleware 要求）
    const address = getStoredAddress()
    if (address) {
      headers['X-Wallet-Address'] = address
    }
  }

  // 添加语言头
  const lang = localStorage.getItem('i18nextLng') || 'zh-Hans'
  headers['Accept-Language'] = lang

  const url = buildUrl(path, params)

  try {
    const response = await fetch(url, {
      ...fetchOptions,
      headers,
    })

    // 解析响应
    const data: ApiResponse<T> = await response.json()

    // 检查 HTTP 状态
    if (!response.ok) {
      throw new ApiError(
        data.msg || `HTTP Error: ${response.status}`,
        response.status,
        data.errorCode
      )
    }

    // 检查业务状态码
    if (data.code !== 200) {
      throw new ApiError(
        data.msg || 'Unknown error',
        data.code,
        data.errorCode
      )
    }

    return data.data
  } catch (error) {
    if (error instanceof ApiError) {
      // 如果是未授权错误，清除 token 并触发回调
      if (error.isUnauthorized) {
        clearStoredToken()
        // 触发未授权回调（用于清除认证状态并跳转登录页）
        if (onUnauthorizedCallback) {
          onUnauthorizedCallback()
        }
      }
      throw error
    }

    // 网络错误或其他错误
    throw new ApiError(
      error instanceof Error ? error.message : 'Network error',
      0
    )
  }
}

// GET 请求
export async function get<T>(
  path: string,
  params?: Record<string, string | number | boolean | undefined>,
  options?: Omit<RequestOptions, 'method' | 'body' | 'params'>
): Promise<T> {
  return request<T>(path, {
    ...options,
    method: 'GET',
    params,
  })
}

// POST 请求
export async function post<T>(
  path: string,
  body?: unknown,
  options?: Omit<RequestOptions, 'method' | 'body'>
): Promise<T> {
  return request<T>(path, {
    ...options,
    method: 'POST',
    body: body ? JSON.stringify(body) : undefined,
  })
}

// PUT 请求
export async function put<T>(
  path: string,
  body?: unknown,
  options?: Omit<RequestOptions, 'method' | 'body'>
): Promise<T> {
  return request<T>(path, {
    ...options,
    method: 'PUT',
    body: body ? JSON.stringify(body) : undefined,
  })
}

// DELETE 请求
export async function del<T>(
  path: string,
  options?: Omit<RequestOptions, 'method'>
): Promise<T> {
  return request<T>(path, {
    ...options,
    method: 'DELETE',
  })
}

// 导出默认客户端
export const apiClient = {
  get,
  post,
  put,
  delete: del,
}

export default apiClient
