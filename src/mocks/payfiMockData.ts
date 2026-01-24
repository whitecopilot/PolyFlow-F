// PayFi Mock 数据生成

import type {
  PriceInfo,
  UserAssets,
  TeamStats,
  EarningsStats,
  PIDReleasePlan,
  PICBurnRecord,
  RewardRecord,
  WithdrawRecord,
  TeamMember,
  SystemStats,
  RewardType,
  NFTLevel,
  NodeLevel,
} from '../types/payfi';
import { PAYFI_CONFIG } from './payfiConfig';

// 系统启动日期（用于计算价格）
const SYSTEM_START_DATE = new Date('2024-01-01');

// 计算自启动以来的天数
function getDaysSinceStart(): number {
  const now = new Date();
  const diff = now.getTime() - SYSTEM_START_DATE.getTime();
  return Math.floor(diff / (1000 * 60 * 60 * 24));
}

// 计算 PID 价格（单利）
export function calculatePIDPrice(): number {
  const days = getDaysSinceStart();
  return PAYFI_CONFIG.PID_INIT_PRICE + days * PAYFI_CONFIG.PID_DAILY_INCREMENT;
}

// 计算 PIC 价格（复利）
export function calculatePICPrice(): number {
  const days = getDaysSinceStart();
  return PAYFI_CONFIG.PIC_INIT_PRICE * Math.pow(1 + PAYFI_CONFIG.PIC_DAILY_RATE, days);
}

// 生成价格信息
export function getMockPriceInfo(): PriceInfo {
  return {
    pidPrice: calculatePIDPrice(),
    picPrice: calculatePICPrice(),
    pidChange: PAYFI_CONFIG.PID_DAILY_INCREMENT,
    picChange: PAYFI_CONFIG.PIC_DAILY_RATE * calculatePICPrice(),
    lastUpdated: new Date(),
  };
}

// 生成用户资产 Mock 数据
export function getMockUserAssets(): UserAssets {
  return {
    currentNFTLevel: 'N3',
    nftCoefficient: 0.9,
    powerFromNFT: 1000,
    powerFromBurn: 500,
    totalPower: 1500,
    nftStaked: false,  // 默认未质押，用于测试质押功能
    nftStakeTime: null,

    totalNFTInvest: 1000,
    totalPICBurnUsdt: 500,
    totalInvest: 1500,

    exitFromNFT: 2000,      // 1000 * 2.0
    exitFromBurn: 1500,     // 500 * 3.0
    totalExitLimit: 3500,
    earnedRewards: 1200,
    remainingLimit: 2300,

    pidTotalLocked: 408.16,  // 1000 / 2.45
    pidReleased: 48.98,      // 3个月释放
    pidBalance: 48.98,
    picBalance: 850.00,
  };
}

// 生成团队统计 Mock 数据
export function getMockTeamStats(): TeamStats {
  return {
    directCount: 12,
    teamCount: 156,
    teamPerformance: 450000,
    maxLinePerf: 280000,
    smallAreaPerf: 170000,
    nodeLevel: 'P3',
  };
}

// 生成收益统计 Mock 数据
export function getMockEarningsStats(): EarningsStats {
  return {
    totalStaticEarned: 2100,
    totalReferralEarned: 1200,
    totalNodeEarned: 680,
    totalSameLevelEarned: 320,
    totalGlobalEarned: 280,
    todayEarnings: 45.20,
    withdrawableAmount: 380,
  };
}

// 生成 PID 释放计划 Mock 数据
export function getMockPIDReleasePlans(): PIDReleasePlan[] {
  const startDate = new Date('2024-06-15');
  const endDate = new Date(startDate);
  endDate.setMonth(endDate.getMonth() + 25);

  return [
    {
      id: 1,
      totalAmount: 408.16,
      releasedAmount: 48.98,
      startDate,
      endDate,
      dailyAmount: 0.544,  // 408.16 * 0.04 / 30
      status: 'active',
      monthsTotal: 25,
      monthsCompleted: 3,
    },
  ];
}

// 生成 PIC 销毁记录 Mock 数据
export function getMockBurnRecords(): PICBurnRecord[] {
  return [
    {
      id: 1,
      picAmount: 156.25,
      picPrice: 1.28,
      usdtValue: 200,
      nftLevelAtBurn: 'N3',
      exitMultiplier: 3.0,
      powerAdded: 200,
      exitAdded: 600,
      createdAt: new Date('2024-07-10'),
    },
    {
      id: 2,
      picAmount: 234.38,
      picPrice: 1.28,
      usdtValue: 300,
      nftLevelAtBurn: 'N3',
      exitMultiplier: 3.0,
      powerAdded: 300,
      exitAdded: 900,
      createdAt: new Date('2024-08-05'),
    },
  ];
}

// 生成奖励记录 Mock 数据
export function getMockRewardRecords(): RewardRecord[] {
  const records: RewardRecord[] = [];
  const types: RewardType[] = ['static', 'referral', 'node', 'same_level', 'global'];
  const now = new Date();

  for (let i = 0; i < 20; i++) {
    const date = new Date(now);
    date.setDate(date.getDate() - i);
    const type = types[Math.floor(Math.random() * types.length)];

    records.push({
      id: i + 1,
      rewardType: type,
      sourceUserId: type !== 'static' && type !== 'global' ? Math.floor(Math.random() * 100) + 1 : null,
      sourceAddress: type !== 'static' && type !== 'global' ? `0x${Math.random().toString(16).slice(2, 10)}...` : null,
      picAmount: Math.random() * 50 + 10,
      usdtValue: Math.random() * 60 + 12,
      picPrice: 1.28,
      rewardDate: date,
      createdAt: date,
    });
  }

  return records;
}

// 生成提现记录 Mock 数据
export function getMockWithdrawRecords(): WithdrawRecord[] {
  return [
    {
      id: 1,
      totalAmount: 100,
      feeAmount: 3,
      instantAmount: 77.6,  // (100-3) * 0.8
      linearAmount: 19.4,   // (100-3) * 0.2
      linearReleased: 19.4,
      status: 'completed',
      createdAt: new Date('2024-07-20'),
    },
    {
      id: 2,
      totalAmount: 200,
      feeAmount: 6,
      instantAmount: 155.2,
      linearAmount: 38.8,
      linearReleased: 25.87, // 65% 已释放
      status: 'processing',
      createdAt: new Date('2024-08-15'),
    },
  ];
}

// 生成团队成员 Mock 数据
export function getMockTeamMembers(): TeamMember[] {
  const levels: NFTLevel[] = ['N1', 'N2', 'N3', 'N4', 'N5'];
  const nodeLevels: NodeLevel[] = ['P0', 'P1', 'P2', 'P3'];
  const members: TeamMember[] = [];

  for (let i = 0; i < 25; i++) {
    const isDirectReferral = i < 12;
    members.push({
      id: i + 1,
      address: `0x${Math.random().toString(16).slice(2, 6)}...${Math.random().toString(16).slice(2, 6)}`,
      nftLevel: levels[Math.floor(Math.random() * levels.length)],
      nodeLevel: nodeLevels[Math.floor(Math.random() * nodeLevels.length)],
      performance: Math.floor(Math.random() * 50000) + 1000,
      joinedAt: new Date(Date.now() - Math.random() * 180 * 24 * 60 * 60 * 1000),
      isDirectReferral,
    });
  }

  // 按业绩排序
  members.sort((a, b) => b.performance - a.performance);
  return members;
}

// 生成系统统计 Mock 数据
export function getMockSystemStats(): SystemStats {
  return {
    systemStartDate: SYSTEM_START_DATE,
    totalNFTSales: 125000000,
    totalPICMinted: 8500000,
    totalPICBurned: 2100000,
    totalFees: 380000,
    dailyRate: 0.0072, // 0.72%
    nodeCount: {
      P0: 15000,
      P1: 2500,
      P2: 800,
      P3: 250,
      P4: 80,
      P5: 25,
      P6: 8,
      P7: 3,
      P8: 1,
      P9: 0,
    },
  };
}

// 计算当日日化率
export function calculateDailyRate(systemStats: SystemStats): number {
  const nftSalesBonus = PAYFI_CONFIG.NFT_SALES_BONUS_RATE *
    Math.min(systemStats.totalNFTSales / PAYFI_CONFIG.NFT_SALES_CAP, 1);

  const burnRatio = systemStats.totalPICMinted > 0
    ? systemStats.totalPICBurned / systemStats.totalPICMinted
    : 0;
  const burnBonus = PAYFI_CONFIG.PIC_BURN_BONUS_RATE * Math.min(burnRatio, 1);

  return PAYFI_CONFIG.BASE_MINING_RATE + nftSalesBonus + burnBonus;
}

// 模拟销毁 PIC
export function simulateBurnPIC(
  amount: number,
  currentNFTLevel: NFTLevel,
  picPrice: number
): { powerAdded: number; exitAdded: number; usdtValue: number } | null {
  if (!currentNFTLevel) return null;

  const usdtValue = amount * picPrice;

  // 必须是100U整数倍
  if (usdtValue % 100 !== 0) return null;

  const burnMultipliers: Record<string, number> = {
    N1: 3.0, N2: 3.0, N3: 3.0, N4: 3.5, N5: 4.0,
  };

  const multiplier = burnMultipliers[currentNFTLevel] || 3.0;
  const powerAdded = usdtValue;
  const exitAdded = usdtValue * multiplier;

  return { powerAdded, exitAdded, usdtValue };
}

// 模拟提现
export function simulateWithdraw(picAmount: number, picPrice: number): {
  totalUsdt: number;
  fee: number;
  instantAmount: number;
  linearAmount: number;
} {
  const totalUsdt = picAmount * picPrice;
  const fee = totalUsdt * PAYFI_CONFIG.WITHDRAW_FEE_RATE;
  const netAmount = totalUsdt - fee;
  const instantAmount = netAmount * PAYFI_CONFIG.INSTANT_RELEASE_RATE;
  const linearAmount = netAmount * (1 - PAYFI_CONFIG.INSTANT_RELEASE_RATE);

  return { totalUsdt, fee, instantAmount, linearAmount };
}
