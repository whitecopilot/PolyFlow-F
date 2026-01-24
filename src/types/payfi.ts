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
  pidChange: number;  // 24h变化
  picChange: number;
  lastUpdated: Date;
}

// 用户资产信息
export interface UserAssets {
  // NFT & 算力
  currentNFTLevel: NFTLevel;
  nftCoefficient: number;
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
  earnedRewards: number;       // 已领取奖励总额(USDT)
  remainingLimit: number;      // 剩余额度

  // 代币余额
  pidTotalLocked: number;      // PID锁仓总量
  pidReleased: number;         // PID已释放量
  pidBalance: number;          // PID可用余额
  picBalance: number;          // PIC可用余额
}

// 团队统计
export interface TeamStats {
  directCount: number;         // 直推人数
  teamCount: number;           // 团队总人数
  teamPerformance: number;     // 团队总业绩(USDT)
  maxLinePerf: number;         // 最大单线业绩(USDT)
  smallAreaPerf: number;       // 小区业绩
  nodeLevel: NodeLevel;        // 节点等级
}

// 收益统计
export interface EarningsStats {
  totalStaticEarned: number;      // 累计静态收益
  totalReferralEarned: number;    // 累计推荐奖励
  totalNodeEarned: number;        // 累计节点奖励
  totalSameLevelEarned: number;   // 累计平级奖励
  totalGlobalEarned: number;      // 累计全网加权分成
  todayEarnings: number;          // 今日收益
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

// 提现记录
export interface WithdrawRecord {
  id: number;
  totalAmount: number;      // 提现总量(PIC)
  feeAmount: number;        // 手续费(PIC)
  instantAmount: number;    // 即时到账(80%)
  linearAmount: number;     // 线性释放(20%)
  linearReleased: number;   // 已释放的线性部分
  status: 'pending' | 'processing' | 'completed';
  createdAt: Date;
}

// 团队成员
export interface TeamMember {
  id: number;
  address: string;
  nftLevel: NFTLevel;
  nodeLevel: NodeLevel;
  performance: number;      // 业绩
  joinedAt: Date;
  isDirectReferral: boolean;
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
