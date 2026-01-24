// PayFi 经济系统状态管理

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
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
  NFTLevel,
} from '../types/payfi';
import {
  getMockPriceInfo,
  getMockUserAssets,
  getMockTeamStats,
  getMockEarningsStats,
  getMockPIDReleasePlans,
  getMockBurnRecords,
  getMockRewardRecords,
  getMockWithdrawRecords,
  getMockTeamMembers,
  getMockSystemStats,
  simulateBurnPIC,
  simulateWithdraw,
} from '../mocks/payfiMockData';
import { getNFTConfig, calculateUpgradeCost } from '../mocks/payfiConfig';

interface PayFiState {
  // 数据状态
  priceInfo: PriceInfo | null;
  userAssets: UserAssets | null;
  teamStats: TeamStats | null;
  earningsStats: EarningsStats | null;
  pidReleasePlans: PIDReleasePlan[];
  burnRecords: PICBurnRecord[];
  rewardRecords: RewardRecord[];
  withdrawRecords: WithdrawRecord[];
  teamMembers: TeamMember[];
  systemStats: SystemStats | null;

  // 加载状态
  isLoading: boolean;
  error: string | null;

  // 邀请信息
  inviteCode: string;
  inviteLink: string;

  // Actions
  fetchAllData: () => Promise<void>;
  fetchPriceInfo: () => Promise<void>;
  fetchUserAssets: () => Promise<void>;
  fetchTeamStats: () => Promise<void>;
  fetchEarningsStats: () => Promise<void>;
  fetchPIDReleasePlans: () => Promise<void>;
  fetchRewardRecords: () => Promise<void>;
  fetchWithdrawRecords: () => Promise<void>;
  fetchTeamMembers: () => Promise<void>;

  // 业务操作
  purchaseNFT: (level: NFTLevel) => Promise<boolean>;
  upgradeNFT: (targetLevel: NFTLevel) => Promise<boolean>;
  burnPIC: (amount: number) => Promise<boolean>;
  withdraw: (picAmount: number) => Promise<boolean>;
  claimRewards: () => Promise<boolean>;

  // 工具方法
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  reset: () => void;
}

// 模拟延迟
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

export const usePayFiStore = create<PayFiState>()(
  persist(
    (set, get) => ({
      // 初始状态
      priceInfo: null,
      userAssets: null,
      teamStats: null,
      earningsStats: null,
      pidReleasePlans: [],
      burnRecords: [],
      rewardRecords: [],
      withdrawRecords: [],
      teamMembers: [],
      systemStats: null,
      isLoading: false,
      error: null,
      inviteCode: 'PF2024XY',
      inviteLink: '', // 在组件中基于当前域名动态生成

      // 获取所有数据
      fetchAllData: async () => {
        set({ isLoading: true, error: null });
        try {
          await delay(500); // 模拟网络延迟

          set({
            priceInfo: getMockPriceInfo(),
            userAssets: getMockUserAssets(),
            teamStats: getMockTeamStats(),
            earningsStats: getMockEarningsStats(),
            pidReleasePlans: getMockPIDReleasePlans(),
            burnRecords: getMockBurnRecords(),
            rewardRecords: getMockRewardRecords(),
            withdrawRecords: getMockWithdrawRecords(),
            teamMembers: getMockTeamMembers(),
            systemStats: getMockSystemStats(),
            isLoading: false,
          });
        } catch (error) {
          set({ error: '获取数据失败', isLoading: false });
        }
      },

      // 获取价格信息
      fetchPriceInfo: async () => {
        try {
          await delay(200);
          set({ priceInfo: getMockPriceInfo() });
        } catch (error) {
          console.error('获取价格失败', error);
        }
      },

      // 获取用户资产
      fetchUserAssets: async () => {
        try {
          await delay(300);
          set({ userAssets: getMockUserAssets() });
        } catch (error) {
          console.error('获取资产失败', error);
        }
      },

      // 获取团队统计
      fetchTeamStats: async () => {
        try {
          await delay(300);
          set({ teamStats: getMockTeamStats() });
        } catch (error) {
          console.error('获取团队统计失败', error);
        }
      },

      // 获取收益统计
      fetchEarningsStats: async () => {
        try {
          await delay(300);
          set({ earningsStats: getMockEarningsStats() });
        } catch (error) {
          console.error('获取收益统计失败', error);
        }
      },

      // 获取 PID 释放计划
      fetchPIDReleasePlans: async () => {
        try {
          await delay(200);
          set({ pidReleasePlans: getMockPIDReleasePlans() });
        } catch (error) {
          console.error('获取释放计划失败', error);
        }
      },

      // 获取奖励记录
      fetchRewardRecords: async () => {
        try {
          await delay(300);
          set({ rewardRecords: getMockRewardRecords() });
        } catch (error) {
          console.error('获取奖励记录失败', error);
        }
      },

      // 获取提现记录
      fetchWithdrawRecords: async () => {
        try {
          await delay(200);
          set({ withdrawRecords: getMockWithdrawRecords() });
        } catch (error) {
          console.error('获取提现记录失败', error);
        }
      },

      // 获取团队成员
      fetchTeamMembers: async () => {
        try {
          await delay(400);
          set({ teamMembers: getMockTeamMembers() });
        } catch (error) {
          console.error('获取团队成员失败', error);
        }
      },

      // 购买 NFT
      purchaseNFT: async (level: NFTLevel) => {
        set({ isLoading: true });
        try {
          await delay(1000);

          const config = getNFTConfig(level);
          if (!config) {
            set({ error: '无效的NFT等级', isLoading: false });
            return false;
          }

          const { priceInfo, userAssets } = get();
          if (!priceInfo || !userAssets) {
            set({ error: '数据未加载', isLoading: false });
            return false;
          }

          // 计算获得的 PID
          const pidAmount = config.price / priceInfo.pidPrice;

          // 更新用户资产（模拟）
          set({
            userAssets: {
              ...userAssets,
              currentNFTLevel: level,
              nftCoefficient: config.coefficient,
              powerFromNFT: config.power,
              totalPower: config.power + userAssets.powerFromBurn,
              totalNFTInvest: config.price,
              totalInvest: config.price + userAssets.totalPICBurnUsdt,
              exitFromNFT: config.price * config.nftExitMultiplier,
              totalExitLimit: config.price * config.nftExitMultiplier + userAssets.exitFromBurn,
              remainingLimit: config.price * config.nftExitMultiplier + userAssets.exitFromBurn - userAssets.earnedRewards,
              pidTotalLocked: userAssets.pidTotalLocked + pidAmount,
            },
            isLoading: false,
          });

          return true;
        } catch (error) {
          set({ error: '购买失败', isLoading: false });
          return false;
        }
      },

      // 升级 NFT
      upgradeNFT: async (targetLevel: NFTLevel) => {
        set({ isLoading: true });
        try {
          await delay(1000);

          const { userAssets, priceInfo } = get();
          if (!userAssets || !priceInfo) {
            set({ error: '数据未加载', isLoading: false });
            return false;
          }

          if (!targetLevel) {
            set({ error: '请选择目标等级', isLoading: false });
            return false;
          }

          const targetConfig = getNFTConfig(targetLevel);
          if (!targetConfig) {
            set({ error: '无效的目标等级', isLoading: false });
            return false;
          }

          const upgradeCost = calculateUpgradeCost(userAssets.currentNFTLevel, targetLevel);
          if (upgradeCost <= 0) {
            set({ error: '只能升级到更高等级', isLoading: false });
            return false;
          }

          // 计算新增 PID
          const newPidAmount = upgradeCost / priceInfo.pidPrice;
          const newTotalInvest = userAssets.totalNFTInvest + upgradeCost;

          // 更新用户资产
          set({
            userAssets: {
              ...userAssets,
              currentNFTLevel: targetLevel,
              nftCoefficient: targetConfig.coefficient,
              powerFromNFT: targetConfig.power,
              totalPower: targetConfig.power + userAssets.powerFromBurn,
              totalNFTInvest: newTotalInvest,
              totalInvest: newTotalInvest + userAssets.totalPICBurnUsdt,
              exitFromNFT: newTotalInvest * targetConfig.nftExitMultiplier,
              totalExitLimit: newTotalInvest * targetConfig.nftExitMultiplier + userAssets.exitFromBurn,
              remainingLimit: newTotalInvest * targetConfig.nftExitMultiplier + userAssets.exitFromBurn - userAssets.earnedRewards,
              pidTotalLocked: userAssets.pidTotalLocked + newPidAmount,
            },
            isLoading: false,
          });

          return true;
        } catch (error) {
          set({ error: '升级失败', isLoading: false });
          return false;
        }
      },

      // 销毁 PIC
      burnPIC: async (amount: number) => {
        set({ isLoading: true });
        try {
          await delay(800);

          const { userAssets, priceInfo, burnRecords } = get();
          if (!userAssets || !priceInfo) {
            set({ error: '数据未加载', isLoading: false });
            return false;
          }

          if (amount > userAssets.picBalance) {
            set({ error: 'PIC余额不足', isLoading: false });
            return false;
          }

          const result = simulateBurnPIC(amount, userAssets.currentNFTLevel, priceInfo.picPrice);
          if (!result) {
            set({ error: '销毁金额必须是100U的整数倍', isLoading: false });
            return false;
          }

          // 创建销毁记录
          const newRecord: PICBurnRecord = {
            id: burnRecords.length + 1,
            picAmount: amount,
            picPrice: priceInfo.picPrice,
            usdtValue: result.usdtValue,
            nftLevelAtBurn: userAssets.currentNFTLevel,
            exitMultiplier: result.exitAdded / result.usdtValue,
            powerAdded: result.powerAdded,
            exitAdded: result.exitAdded,
            createdAt: new Date(),
          };

          // 更新用户资产
          set({
            userAssets: {
              ...userAssets,
              picBalance: userAssets.picBalance - amount,
              totalPICBurnUsdt: userAssets.totalPICBurnUsdt + result.usdtValue,
              totalInvest: userAssets.totalInvest + result.usdtValue,
              powerFromBurn: userAssets.powerFromBurn + result.powerAdded,
              totalPower: userAssets.totalPower + result.powerAdded,
              exitFromBurn: userAssets.exitFromBurn + result.exitAdded,
              totalExitLimit: userAssets.totalExitLimit + result.exitAdded,
              remainingLimit: userAssets.remainingLimit + result.exitAdded,
            },
            burnRecords: [newRecord, ...burnRecords],
            isLoading: false,
          });

          return true;
        } catch (error) {
          set({ error: '销毁失败', isLoading: false });
          return false;
        }
      },

      // 提现
      withdraw: async (picAmount: number) => {
        set({ isLoading: true });
        try {
          await delay(1000);

          const { userAssets, priceInfo, withdrawRecords } = get();
          if (!userAssets || !priceInfo) {
            set({ error: '数据未加载', isLoading: false });
            return false;
          }

          if (picAmount > userAssets.picBalance) {
            set({ error: 'PIC余额不足', isLoading: false });
            return false;
          }

          const result = simulateWithdraw(picAmount, priceInfo.picPrice);

          // 创建提现记录
          const newRecord: WithdrawRecord = {
            id: withdrawRecords.length + 1,
            totalAmount: picAmount,
            feeAmount: result.fee / priceInfo.picPrice,
            instantAmount: result.instantAmount,
            linearAmount: result.linearAmount,
            linearReleased: 0,
            status: 'processing',
            createdAt: new Date(),
          };

          // 更新用户资产
          set({
            userAssets: {
              ...userAssets,
              picBalance: userAssets.picBalance - picAmount,
            },
            withdrawRecords: [newRecord, ...withdrawRecords],
            isLoading: false,
          });

          return true;
        } catch (error) {
          set({ error: '提现失败', isLoading: false });
          return false;
        }
      },

      // 领取奖励
      claimRewards: async () => {
        set({ isLoading: true });
        try {
          await delay(500);
          // Mock: 领取成功后更新可提现金额
          const { earningsStats } = get();
          if (earningsStats) {
            set({
              earningsStats: {
                ...earningsStats,
                withdrawableAmount: 0,
              },
              isLoading: false,
            });
          }
          return true;
        } catch (error) {
          set({ error: '领取失败', isLoading: false });
          return false;
        }
      },

      // 工具方法
      setLoading: (loading) => set({ isLoading: loading }),
      setError: (error) => set({ error }),
      reset: () => set({
        priceInfo: null,
        userAssets: null,
        teamStats: null,
        earningsStats: null,
        pidReleasePlans: [],
        burnRecords: [],
        rewardRecords: [],
        withdrawRecords: [],
        teamMembers: [],
        systemStats: null,
        isLoading: false,
        error: null,
      }),
    }),
    {
      name: 'payfi-storage',
      partialize: (state) => ({
        inviteCode: state.inviteCode,
        inviteLink: state.inviteLink,
      }),
    }
  )
);
