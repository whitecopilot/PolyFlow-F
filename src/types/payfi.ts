// PayFi 经济系统类型定义

// NFT 等级枚举
export type NFTLevel = 'N1' | 'N2' | 'N3' | 'N4' | 'N5' | null;

// 节点等级枚举
export type NodeLevel = 'P0' | 'P1' | 'P2' | 'P3' | 'P4' | 'P5' | 'P6' | 'P7' | 'P8' | 'P9';

// 奖励类型
export type RewardType = 'static' | 'referral' | 'node' | 'same_level' | 'global';

// 用户状态
export type UserStatus = 'active' | 'exited';

// NFT 等级配置
export interface NFTLevelConfig {
  level: NFTLevel;
  name: string;
  price: number;        // USDT
  power: number;        // 基础算力
  coefficient: number;  // 算力系数
  nftExitMultiplier: number;  // NFT出局倍数
  burnExitMultiplier: number; // 销毁出局倍数
  enable: boolean;      // 是否开启销售
}

// 节点等级配置
export interface NodeLevelConfig {
  level: NodeLevel;
  name: string;
  smallAreaReq: number;   // 小区业绩要求（万U）
  totalReq: number;       // 总业绩要求（万U）
  sharePercent: number;   // 级差分成%
  globalSharePercent: number; // 全网加权%
}

// 价格信息
export interface PriceInfo {
  pidPrice: number;
  picPrice: number;
  dailyRate: number;  // 当日产出率（日化率）
  pidChange: number;  // 24h变化
  picChange: number;
  lastUpdated: Date;
}

// 功能开关
export interface FeatureFlags {
  pidStakingEnabled: boolean;  // PID 质押功能是否启用
  nftSalesEnabled: boolean;    // NFT 销售功能是否启用
}

// 用户资产信息
export interface UserAssets {
  // 用户状态（原 /me 接口字段，合并到 /assets 接口减少请求）
  is_active?: boolean;   // 是否为激活状态（可生成邀请码、访问邀请页面）
  hasInviter?: boolean;  // 是否已绑定邀请人
  adminType?: number;    // 管理员类型: 0=普通用户, 1=普通管理员, 2=超级管理员

  // 功能开关
  featureFlags?: FeatureFlags;

  // 总资产估值
  totalAssetValueUSDT?: number;  // 总资产估值 (USDT)，按当前价格计算

  // 钱包 ERC20 余额
  usdtBalance?: number;  // 用户钱包持有的 USDT 数量
  usdcBalance?: number;  // 用户钱包持有的 USDC 数量

  // NFT & 算力
  currentNFTLevel: NFTLevel;
  nftCoefficient: number;
  picBurnExitMultiplier: number;  // PIC 销毁出局倍数（与质押最高等级挂钩）
  powerFromNFT: number;
  powerFromBurn: number;
  totalPower: number;
  nftStaked: boolean;
  nftStakeTime: Date | null;

  // 投入统计
  totalNFTInvest: number;      // 累计NFT投入(USDT)
  totalPICBurnUsdt: number;    // 累计销毁PIC对应(USDT)
  totalInvest: number;         // 总投入

  // 出局机制
  exitFromNFT: number;         // NFT出局额度
  exitFromBurn: number;        // 销毁出局额度
  totalExitLimit: number;      // 总出局额度
  earnedRewards: number;       // 已领取奖励总额(USDT)，历史价值
  remainingLimit: number;      // 剩余额度

  // 代币余额
  pidTotalLocked: number;      // PID锁仓总量
  pidReleased: number;         // PID已释放量
  pidBalance: number;          // PID可用余额
  picBalance: number;          // PIC可用余额（首次产出，提现有手续费）
  picReleasedBalance: number;  // PIC线性释放已解锁余额（提现无手续费）
  walletPicBalance: number;    // 钱包 PIC 余额（链上实时查询，用于链上销毁功能）
}

// 团队统计（使用质押业绩）
export interface TeamStats {
  directPerformance: number;   // 邀请业绩(USDT)
  directCount: number;         // 直推人数
  directOrderCount: number;    // 直推单数
  teamCount: number;           // 团队总人数
  teamOrderCount: number;      // 团队总单数
  teamPerformance: number;     // 团队总业绩 - 质押业绩(USDT)
  maxLinePerf: number;         // 大区业绩 - 质押业绩(USDT)
  smallAreaPerf: number;       // 小区业绩 - 质押业绩
  nodeLevel: NodeLevel;        // 节点等级
  todayStakingAmount: number;  // 日新增算力值 (USDT)
  todayStakingCount: number;   // 今日质押笔数
}

// 收益统计
export interface EarningsStats {
  totalStaticEarned: number;      // 累计静态收益
  totalReferralEarned: number;    // 累计推荐奖励
  totalNodeEarned: number;        // 累计节点奖励
  totalSameLevelEarned: number;   // 累计平级奖励
  totalGlobalEarned: number;      // 累计全网加权分成
  todayEarnings: number;          // 今日总收益
  // 今日各类型收益
  todayStaticEarned: number;      // 今日静态收益
  todayReferralEarned: number;    // 今日推荐奖励
  todayNodeEarned: number;        // 今日节点奖励
  todaySameLevelEarned: number;   // 今日平级奖励
  todayGlobalEarned: number;      // 今日全网分成
  withdrawableAmount: number;     // 可提现金额
}

// PID释放计划
export interface PIDReleasePlan {
  id: number;
  totalAmount: number;
  releasedAmount: number;
  startDate: Date;
  endDate: Date;
  dailyAmount: number;
  status: 'active' | 'completed';
  monthsTotal: number;
  monthsCompleted: number;
}

// PIC销毁记录
export interface PICBurnRecord {
  id: number;
  picAmount: number;
  picPrice: number;
  usdtValue: number;
  nftLevelAtBurn: NFTLevel;
  exitMultiplier: number;
  powerAdded: number;
  exitAdded: number;
  createdAt: Date;
}

// 奖励记录
export interface RewardRecord {
  id: number;
  rewardType: RewardType;
  sourceUserId: number | null;
  sourceAddress: string | null;
  picAmount: number;
  usdtValue: number;
  picPrice: number;
  rewardDate: Date;
  createdAt: Date;
}

// 提现订单状态
export type WithdrawStatus = 'submit' | 'cheque' | 'received';

// 提现来源类型
export type WithdrawSourceType = 'balance' | 'released';

// 提现记录
export interface WithdrawRecord {
  id: number;
  orderNum: string;         // 订单编号
  tokenType: 'PID' | 'PIC'; // 代币类型
  amount: number;           // 实际到账金额
  servicedFee: number;      // 手续费
  source: WithdrawSourceType; // 来源类型
  status: WithdrawStatus;   // 订单状态
  transactionHash?: string; // 交易哈希
  createdAt: Date;          // 创建时间
  claimedAt?: Date;         // 领取时间
}

// 团队成员
// 用户状态枚举（与后端对应）
export const UserStateEnum = {
  UnInvested: 0,      // 未投资
  Invested: 1,        // 已投资
  TransIn: 2,         // 转入
  FullTransOut: 3,    // 所有NFT已完全转出
  Out: 4,             // 已出局
  OutReTransIn: 5,    // 出局后转入激活
  ReInvested: 6,      // 已复投
  Banned: 7,          // 已封禁
} as const

// 判断用户是否已激活（已投资）
export function isUserActivated(state: number): boolean {
  const activatedStates: number[] = [
    UserStateEnum.Invested,
    UserStateEnum.TransIn,
    UserStateEnum.OutReTransIn,
    UserStateEnum.ReInvested,
  ]
  return activatedStates.includes(state)
}

// 用户状态显示类型
export type UserStateDisplay = 'activated' | 'not_activated' | 'reinvested' | 'transferred_out' | 'exited'

// 获取用户状态显示信息
// 返回值: { display: 显示类型, isActive: 是否算作激活状态 }
export function getUserStateDisplay(state: number): { display: UserStateDisplay; isActive: boolean } {
  switch (state) {
    case UserStateEnum.Invested:     // 1 - 已投资
    case UserStateEnum.TransIn:      // 2 - 转入
    case UserStateEnum.OutReTransIn: // 5 - 出局后转入激活
      return { display: 'activated', isActive: true }
    case UserStateEnum.ReInvested:   // 6 - 已复投
      return { display: 'reinvested', isActive: true }
    case UserStateEnum.FullTransOut: // 3 - 已转出
      return { display: 'transferred_out', isActive: false }
    case UserStateEnum.Out:          // 4 - 已出局
      return { display: 'exited', isActive: false }
    case UserStateEnum.UnInvested:   // 0 - 未投资
    case UserStateEnum.Banned:       // 7 - 已封禁
    default:
      return { display: 'not_activated', isActive: false }
  }
}

export interface TeamMember {
  id: number;
  address: string;
  nftLevel: NFTLevel;
  nodeLevel: NodeLevel;
  performance: number;      // 业绩
  joinedAt: Date;
  isDirectReferral: boolean;
  state: number;            // 用户状态
}

// 全局系统状态
export interface SystemStats {
  systemStartDate: Date;
  totalNFTSales: number;
  totalPICMinted: number;
  totalPICBurned: number;
  totalFees: number;
  dailyRate: number;        // 当日日化率
  nodeCount: Record<NodeLevel, number>;
}
