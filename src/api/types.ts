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

// 带汇总数据的分页响应（用于奖励列表）
export interface PaginatedDataWithSummary<T> extends PaginatedData<T> {
  total_amount: number  // 总金额 (USDT)
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
  is_active: boolean // 是否为激活状态（可生成邀请码、访问邀请页面）
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
  // 累计奖励
  totalStaticProfit: number
  totalInviteProfit: number
  totalNodeProfit: number
  totalSameLevelProfit: number
  totalGlobalProfit: number
  totalProfit: number
  // 今日奖励
  todayStaticProfit: number
  todayInviteProfit: number
  todayNodeProfit: number
  todaySameLevelProfit: number
  todayGlobalProfit: number
  todayProfit: number
}

export interface ReleaseSummary {
  totalReleased: number
  totalLocked: number
  availableToRelease: number
  todayReleased: number
}

// NFT 资产响应
export interface NFTAssetsResponse {
  stakedLevel: string    // 已质押的最高 NFT 等级
  stakedCount: number    // 已质押 NFT 数量
  totalInvest: number    // NFT 总投入 (USDT)
  totalPower: number     // NFT 总算力
  exitLimit: number      // NFT 产生的出局额度
  coefficient: number    // 质押系数
  picBurnExitMultiplier?: number  // PIC 销毁倍数
}

// 代币余额响应
export interface TokenBalanceResponse {
  totalLocked: number        // 总锁仓量
  released: number           // 已释放量
  available: number          // 可用余额
  currentPrice: number       // 当前价格
  totalValueUSDT: number     // 总价值 (USDT)
  availableValueUSDT: number // 可用价值 (USDT)
}

// PIC 余额响应
export interface PICBalanceResponse extends TokenBalanceResponse {
  releasedBalance: number // 线性释放已解锁余额
}

// 收益概览响应
export interface EarningsOverviewResponse {
  earnedRewardsUSDT: number  // 累计收益 (USDT)，历史价值
  picHoldings: number        // PIC 持有总量
  picCurrentValue: number    // PIC 当前估值 (USDT)
  totalExitLimit: number     // 总出局额度
  remainingLimit: number     // 剩余出局额度
}

// 功能开关响应
export interface FeatureFlags {
  pidStakingEnabled: boolean  // PID 质押功能是否启用
  nftSalesEnabled: boolean    // NFT 销售功能是否启用
}

export interface UserAssets {
  // 价格信息
  prices?: PriceInfo

  // 功能开关
  featureFlags?: FeatureFlags

  // 资产汇总
  totalAssetValueUSDT?: number  // 总资产估值 (USDT)
  usdtBalance?: number  // 用户钱包持有的 USDT 数量

  // NFT 资产
  nft?: NFTAssetsResponse

  // PID 资产
  pid?: TokenBalanceResponse

  // PIC 资产
  pic?: PICBalanceResponse

  // 收益概览
  earnings?: EarningsOverviewResponse

  // 释放信息
  release?: ReleaseSummary

  // 兼容旧字段
  rewards?: RewardSummary
  currentNftLevel?: string
  pidBalance?: number
  picBalance?: number
  picReleasedBalance?: number
}

export interface TeamStatsResponse {
  directPerformance: string   // 邀请业绩 (USDT)
  directCount: number         // 邀请人数
  directOrderCount: number    // 邀请单数
  teamPerformance: string     // 团队总业绩 - 质押业绩 (USDT)
  maxLinePerf: string         // 大区业绩 - 质押业绩 (USDT)
  smallAreaPerf: string       // 小区业绩 - 质押业绩 (USDT)
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

// 奖励类型
export type RewardType = 'static' | 'referral' | 'node' | 'same_level' | 'global'

// 奖励记录（后端返回格式）
export interface RewardRecordResponse {
  ID: number
  CreatedAt: string
  UpdatedAt: string
  UserID: number
  RewardType: RewardType
  SourceUserID: number | null
  SourceID: number
  PICAmount: number
  USDTValue: number
  PICPrice: number
  RewardDate: string
}

// ================================
// NFT 相关
// ================================

export type NFTLevel = 'N1' | 'N2' | 'N3' | 'N4' | 'N5'

// NFT 等级配置（从后端获取）
export interface NFTLevelConfigItem {
  level: string              // N1, N2, N3, N4, N5
  price: number              // 价格（USDT）
  power: number              // 基础算力
  coefficient: number        // 挖矿系数
  nftExitMultiplier: number  // NFT 出局倍数
  burnExitMultiplier: number // PIC 销毁出局倍数
  enable: boolean            // 是否开启销售
}

// 节点等级配置（从后端获取）
export interface NodeLevelConfigItem {
  level: number              // P0-P9
  smallAreaReq: number       // 小区业绩要求（万U）
  totalReq: number           // 总业绩要求（万U）
  sharePercent: number       // 极差分成比例
  globalSharePercent: number // 全网加权比例
  specialCondition?: string  // 特殊条件描述（可选）
}

// 系统配置（从后端获取）
export interface SystemConfig {
  // 价格相关
  pidInitPrice: number       // PID初始价格
  pidDailyIncrement: number  // PID每日涨幅(单利)
  picInitPrice: number       // PIC初始价格
  picDailyRate: number       // PIC每日涨幅(复利)

  // 挖矿收益率
  baseMiningRate: number     // 基础挖矿日化
  nftSalesBonusRate: number  // NFT销售加成
  nftSalesCap: number        // NFT销售额上限
  picBurnBonusRate: number   // PIC销毁加成

  // 手续费率
  withdrawFeeRate: number    // 提现手续费率
  swapFeeRate: number        // 兑换手续费率

  // 释放参数
  instantReleaseRate: number // 即时释放比例
  linearReleaseDays: number  // 线性释放天数
  pidReleaseMonths: number   // PID释放周期(月)
  pidMonthlyRate: number     // PID每月释放比例

  // 奖励比例
  referralL1Rate: number     // 一代推荐奖励
  referralL2Rate: number     // 二代推荐奖励
  sameLevelRate: number      // 平级奖励
}

export interface CreateNFTOrderRequest {
  nftLevel: NFTLevel
  isUpgrade?: boolean
}

// 钱包交易参数（由钱包处理 gas 和签名）
export interface WalletTransactionParams {
  to: string      // 目标合约地址
  value: string   // 转账金额（wei），ERC20 代币转账为 "0"
  data: string    // 编码后的合约调用数据（hex 格式，带 0x 前缀）
  chainId: number // 链 ID
}

export interface CreateNFTOrderResponse {
  orderId: number
  nftLevel: string
  priceUsdt: number
  pidPrice: number
  pidAmount: number
  toAddress: string
  randomNumber: string
  transactionParams: WalletTransactionParams // 交易参数（由钱包处理 gas 和签名）
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

// 后端 TokenType 常量映射
export const TokenTypeCode = {
  USDT: 1,
  PID: 2,
  PIC: 3,
} as const

// 后端 WithdrawSource 常量映射
export const WithdrawSourceCode = {
  AWT: 1,
  balance: 2,
  released: 3,
} as const

export interface CreateWithdrawRequest {
  amount: number
  type: number  // 使用 TokenTypeCode 的值
  source?: number  // 使用 WithdrawSourceCode 的值
  remark?: string
}

export interface CreateWithdrawResponse {
  orderId: number
  orderNum: string
  state: number
  // 交易数据（订单签名完成后返回）
  tx?: string
  tokenType?: string
}

// 提现订单状态
export const WithdrawState = {
  Submit: 1,    // 已提交，等待签名
  Cheque: 2,    // 已发放支票（可提取）
  Received: 3,  // 已领取
} as const;

// 提现来源
export const WithdrawSourceType = {
  AWT: 1,       // AWT 提现
  Balance: 2,   // 余额提现
  Released: 3,  // 释放提现
} as const;

export interface WithdrawOrder {
  id: number
  orderNum: string
  tokenType: string
  amount: string           // 实际到账金额
  total?: string           // 用户扣除的总额
  servicedFee: string      // 手续费
  source: number           // 来源类型
  state: number            // 订单状态
  transactionHash?: string
  createdAt: string
  claimedAt?: string       // 领取时间
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
