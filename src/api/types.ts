// API 响应类型定义

// 统一响应格式
export interface ApiResponse<T = unknown> {
  code: number
  msg: string
  data: T
  errorCode?: number
}

// 分页响应数据
export interface PaginatedData<T> {
  items: T[]
  total: number
  page: number
  page_size: number
  total_pages: number
}

// 业务错误码
export const ErrorCodes = {
  Success: 0,
  InvalidParams: 10001,
  Unauthorized: 10002,
  NotFound: 10003,
  Conflict: 10004,
  BusinessLogic: 10005,
  InternalServer: 10006,
  ServiceUnavailable: 10007,
  InsufficientBalance: 10008,
  InvalidState: 10009,
  DuplicateRecord: 10010,
  ChainEventNotReady: 10011,
} as const

// 认证相关错误消息标识（与后端 i18n key 对应）
export const AuthErrorMessages = {
  NeedInviteCode: 'NEED_INVITE_CODE',
  InvalidInviteCode: 'INVALID_INVITE_CODE',
  InviteCodeUsed: 'INVITE_CODE_USED',
  InviteCodeExpired: 'INVITE_CODE_EXPIRED',
  InviterNoNft: 'INVITER_NO_NFT',
  InviterNotInvested: 'INVITER_NOT_INVESTED',
} as const

// ================================
// 认证相关
// ================================

export interface NonceResponse {
  nonce: string
}

export interface LoginRequest {
  address: string
  signature: string
  invite_code?: string
  fingerprint_hash?: string
  user_agent?: string
  local_storage_id?: string
}

export interface LoginResponse {
  token: string
  loginType: string
  user_id: number
  address: string
}

export interface BindInviterRequest {
  inviter_address: string
}

// ================================
// 用户相关
// ================================

export interface UserProfile {
  id: number
  userAddress: string
  state: string
  referrerId?: number
  referrerAddr?: string
  createdAt: string
}

export interface UserOverview {
  id: number
  address: string
  state: string
  level: number
  nodeLevel: number
  referrerAddress?: string
  inviteCode?: string
  hasInviter: boolean
  createdAt: string
}

export interface CreateInviteCodeResponse {
  code: string
}

export interface UserRelation {
  address: string
  referrerAddress: string
  createdAt: string
  level: number
  state: number
  collected: boolean
}

// ================================
// PayFi 相关
// ================================

export interface PriceInfo {
  pidPrice: number
  picPrice: number
  usdtPrice: number
  // 前端计算或展示用字段
  pidChange?: number
  picChange?: number
  lastUpdated?: Date
}

export interface RewardSummary {
  totalStaticProfit: number
  totalInviteProfit: number
  totalProfit: number
  todayStaticProfit: number
  todayInviteProfit: number
  todayProfit: number
}

export interface ReleaseSummary {
  totalReleased: number
  totalLocked: number
  availableToRelease: number
  todayReleased: number
}

export interface UserAssets {
  prices?: PriceInfo
  rewards?: RewardSummary
  release?: ReleaseSummary
  currentNftLevel?: string     // 用户当前 NFT 等级（如 "N1", "N2" 等，质押后才有）
  picBalance?: number          // PIC 可用余额（首次产出，提现有手续费）
  picReleasedBalance?: number  // PIC 线性释放已解锁余额（提现无手续费）
}

export interface TeamStatsResponse {
  directPerformance: string   // 邀请业绩 (USDT)
  directCount: number         // 邀请人数
  directOrderCount: number    // 邀请单数
  teamPerformance: string     // 团队总业绩 (USDT)
  stakingPerformance: string  // 质押业绩 (USDT)
  maxLinePerf: string         // 大区业绩 (USDT)
  smallAreaPerf: string       // 小区业绩 (USDT)
  teamCount: number           // 团队总人数
  teamOrderCount: number      // 团队总单数
  nodeLevel: string           // 节点等级
}

export interface DailyReward {
  date: string
  staticProfit: number
  inviteProfit: number
  totalProfit: number
}

// ================================
// NFT 相关
// ================================

export type NFTLevel = 'N1' | 'N2' | 'N3' | 'N4' | 'N5'

export interface CreateNFTOrderRequest {
  nftLevel: NFTLevel
  isUpgrade?: boolean
}

export interface CreateNFTOrderResponse {
  orderId: number
  nftLevel: string
  priceUsdt: number
  pidPrice: number
  pidAmount: number
  toAddress: string
  randomNumber: string
  unsignedTx: string
}

export interface SubmitPaymentRequest {
  orderId: number
  transactionHash: string
}

export interface NFTOrder {
  id: number
  nftLevel: string
  priceUsdt: number
  pidAmount: number
  state: string
  isUpgrade: boolean
  nftTokenId?: number
  transactionHash?: string
  mintTxHash?: string
  createdAt: string
}

// ================================
// NFT 持有相关
// ================================

export interface UserNFTItem {
  id: number
  tokenId: number
  nftLevel: string         // NFT 类型 (N1-N5)
  power: string        // 算力
  isStaked: boolean    // 是否已质押
  stakeTime: string    // 质押时间
  source: 'purchase' | 'transfer'  // 来源: purchase 购买, transfer 转入
  createdAt: string    // 获得时间
}

export interface NFTHoldingStats {
  totalCount: number
  byType: Record<string, number>
}

// ================================
// 质押相关
// ================================

export interface StakingStatus {
  hasStakedNFT: boolean
  stakedNFTLevel?: string
  stakedAt?: string
  canStake: boolean
  canUnstake: boolean
}

export interface StakedNFT {
  tokenId: number
  level: string
  stakedAt: string
}

// 创建质押交易请求
export interface CreateStakeTransactionRequest {
  tokenId: number
}

// 创建质押交易响应
export interface CreateStakeTransactionResponse {
  unsignedTx: string      // 未签名交易数据（合约调用数据）
  contractAddress: string // NFT 合约地址
  tokenId: number         // Token ID
}

// 提交质押请求
export interface SubmitStakingRequest {
  tokenId: number        // NFT 链上 Token ID
  transactionHash: string // 质押交易哈希
}

// 提交质押响应（同步验证模式）
export interface SubmitStakingResponse {
  requestId: number
  status: string // pending/confirmed/failed
  transactionHash: string
  stakeId?: string // 验证成功时返回
  stakeTime?: string // 验证成功时返回
  errorMessage?: string // 验证失败时返回
}

// ================================
// 提现相关
// ================================

export type TokenType = 'PID' | 'PIC'
export type WithdrawSource = 'balance' | 'released'

export interface CreateWithdrawRequest {
  amount: number
  type: TokenType
  source?: WithdrawSource
  remark?: string
}

export interface CreateWithdrawResponse {
  orderId: number
  orderNum: string
  state: string
}

export interface WithdrawOrder {
  id: number
  orderNum: string
  tokenType: string
  amount: string
  state: string
  transactionHash?: string
  createdAt: string
  confirmedAt?: string
}

export interface CreateWithdrawTransactionRequest {
  orderId: number
}

export interface CreateWithdrawTransactionResponse {
  tx: string
  tokenType: string
}

export interface ClaimResultCheckRequest {
  orderId: number
  transactionHash: string
}

// ================================
// PIC 销毁相关
// ================================

export interface BurnPICRequest {
  amount: number
}

export interface BurnPICResponse {
  id: number
  picAmount: number
  usdtValue: number
  powerAdded: number
  exitAdded: number
  createdAt: string
}

export interface BurnRecord {
  id: number
  picAmount: number
  picPrice: number
  usdtValue: number
  nftLevelAtBurn: string
  exitMultiplier: number
  powerAdded: number
  exitAdded: number
  createdAt: string
}
