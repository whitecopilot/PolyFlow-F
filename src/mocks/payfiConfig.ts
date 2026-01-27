// PayFi 系统配置常量和配置表

import i18n from '../i18n/config';
import type { NFTLevelConfig, NodeLevel, NodeLevelConfig } from '../types/payfi';

// 系统参数配置
export const PAYFI_CONFIG = {
  // 价格参数
  PID_INIT_PRICE: 2.0,
  PID_DAILY_INCREMENT: 0.01095,
  PIC_INIT_PRICE: 1.0,
  PIC_DAILY_RATE: 0.0016,

  // 收益参数
  BASE_MINING_RATE: 0.005,      // 基础挖矿日化(0.5%)
  NFT_SALES_BONUS_RATE: 0.002,  // NFT销售加成(0.2%)
  NFT_SALES_CAP: 2000000000,    // NFT销售额上限(20亿)
  PIC_BURN_BONUS_RATE: 0.002,   // PIC销毁加成(0.2%)

  // 手续费
  WITHDRAW_FEE_RATE: 0.03,      // 提现手续费(3%)
  SWAP_FEE_RATE: 0.03,          // 兑换手续费(3%)

  // 释放参数
  INSTANT_RELEASE_RATE: 0.80,   // 即时释放比例(80%)
  LINEAR_RELEASE_DAYS: 90,      // 线性释放天数
  PID_RELEASE_MONTHS: 25,       // PID释放周期(月)
  PID_MONTHLY_RATE: 0.04,       // PID每月释放比例(4%)

  // 推荐奖励
  REFERRAL_L1_RATE: 0.10,       // 一代推荐奖励(10%)
  REFERRAL_L2_RATE: 0.05,       // 二代推荐奖励(5%)
  SAME_LEVEL_RATE: 0.10,        // 平级奖励(10%)
};

// NFT 等级配置表
export const NFT_LEVEL_CONFIGS: NFTLevelConfig[] = [
  {
    level: 'N1',
    name: 'Starter',
    price: 100,
    power: 100,
    coefficient: 0.7,
    nftExitMultiplier: 2.0,
    burnExitMultiplier: 3.0,
  },
  {
    level: 'N2',
    name: 'Bronze',
    price: 500,
    power: 500,
    coefficient: 0.8,
    nftExitMultiplier: 2.0,
    burnExitMultiplier: 3.0,
  },
  {
    level: 'N3',
    name: 'Silver',
    price: 1000,
    power: 1000,
    coefficient: 0.9,
    nftExitMultiplier: 2.0,
    burnExitMultiplier: 3.0,
  },
  {
    level: 'N4',
    name: 'Gold',
    price: 3000,
    power: 3000,
    coefficient: 1.0,
    nftExitMultiplier: 2.0,
    burnExitMultiplier: 3.5,
  },
  {
    level: 'N5',
    name: 'Diamond',
    price: 10000,
    power: 10000,
    coefficient: 1.1,
    nftExitMultiplier: 2.0,
    burnExitMultiplier: 4.0,
  },
];

// 节点等级配置表
export const NODE_LEVEL_CONFIGS: NodeLevelConfig[] = [
  { level: 'P0', name: '普通用户', smallAreaReq: 0, totalReq: 0, sharePercent: 0, globalSharePercent: 0 },
  { level: 'P1', name: '初级节点', smallAreaReq: 1, totalReq: 3, sharePercent: 10, globalSharePercent: 1.00 },
  { level: 'P2', name: '铜牌节点', smallAreaReq: 5, totalReq: 10, sharePercent: 20, globalSharePercent: 0.70 },
  { level: 'P3', name: '银牌节点', smallAreaReq: 15, totalReq: 30, sharePercent: 30, globalSharePercent: 0.50 },
  { level: 'P4', name: '金牌节点', smallAreaReq: 50, totalReq: 100, sharePercent: 40, globalSharePercent: 0.30 },
  { level: 'P5', name: '白金节点', smallAreaReq: 150, totalReq: 300, sharePercent: 50, globalSharePercent: 0.20 },
  { level: 'P6', name: '钻石节点', smallAreaReq: 350, totalReq: 700, sharePercent: 60, globalSharePercent: 0.13 },
  { level: 'P7', name: '皇冠节点', smallAreaReq: 800, totalReq: 1600, sharePercent: 70, globalSharePercent: 0.08 },
  { level: 'P8', name: '至尊节点', smallAreaReq: 1600, totalReq: 3200, sharePercent: 80, globalSharePercent: 0.05 },
  { level: 'P9', name: '传奇节点', smallAreaReq: 3000, totalReq: 6400, sharePercent: 90, globalSharePercent: 0.04 },
];

// 获取 NFT 配置
export function getNFTConfig(level: string | null): NFTLevelConfig | null {
  if (!level) return null;
  return NFT_LEVEL_CONFIGS.find(c => c.level === level) || null;
}

// 获取节点配置
export function getNodeConfig(level: NodeLevel): NodeLevelConfig {
  return NODE_LEVEL_CONFIGS.find(c => c.level === level) || NODE_LEVEL_CONFIGS[0];
}

// 获取下一个 NFT 等级
export function getNextNFTLevel(currentLevel: string | null): NFTLevelConfig | null {
  if (!currentLevel) return NFT_LEVEL_CONFIGS[0];
  const currentIndex = NFT_LEVEL_CONFIGS.findIndex(c => c.level === currentLevel);
  if (currentIndex === -1 || currentIndex >= NFT_LEVEL_CONFIGS.length - 1) return null;
  return NFT_LEVEL_CONFIGS[currentIndex + 1];
}

// 获取下一个节点等级
export function getNextNodeLevel(currentLevel: NodeLevel): NodeLevelConfig | null {
  const currentIndex = NODE_LEVEL_CONFIGS.findIndex(c => c.level === currentLevel);
  if (currentIndex === -1 || currentIndex >= NODE_LEVEL_CONFIGS.length - 1) return null;
  return NODE_LEVEL_CONFIGS[currentIndex + 1];
}

// 计算升级所需差价
export function calculateUpgradeCost(currentLevel: string | null, targetLevel: string): number {
  const currentConfig = getNFTConfig(currentLevel);
  const targetConfig = getNFTConfig(targetLevel);
  if (!targetConfig) return 0;
  const currentPrice = currentConfig?.price || 0;
  return targetConfig.price - currentPrice;
}

// 奖励类型显示名称
export const REWARD_TYPE_NAMES: Record<string, string> = {
  static: '挖矿收益',
  referral: '邀请奖励',
  node: '节点奖励',
  same_level: '协助奖励',
  global: '空投奖励',
};

// 奖励类型图标
export const REWARD_TYPE_ICONS: Record<string, string> = {
  static: '⚡',
  referral: '👥',
  node: '🏛️',
  same_level: '⚖️',
  global: '🌐',
};

// 获取 NFT 等级名称（翻译）
export function getNFTLevelName(level: string): string {
  return i18n.t(`nft_level.${level}`) || level;
}

// 获取节点等级名称（翻译）
export function getNodeLevelName(level: NodeLevel): string {
  return i18n.t(`node_level.${level}`) || level;
}

// 获取奖励类型名称（翻译）
export function getRewardTypeName(type: string): string {
  return i18n.t(`reward_type.${type}`) || type;
}
