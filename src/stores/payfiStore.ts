// PayFi 经济系统状态管理
// 此 Store 接入后端 API

import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import {
  payfiApi,
  authApi,
  nftApi,
  withdrawApi,
  burnApi,
  userApi,
  UserRelationType,
  ApiError,
} from '../api'
import type {
  PriceInfo as ApiPriceInfo,
  NFTOrder,
  WithdrawOrder as ApiWithdrawOrder,
  BurnRecord as ApiBurnRecord,
  UserRelation,
  CreateWithdrawRequest,
  CreateNFTOrderResponse,
  UserNFTItem,
  NFTHoldingStats,
  RewardRecordResponse,
  RewardType as ApiRewardType,
  NFTLevelConfigItem,
  NodeLevelConfigItem,
  SystemConfig,
} from '../api/types'
import { TokenTypeCode } from '../api/types'
import type {
  NFTLevel,
  NodeLevel,
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
} from '../types/payfi'

// 重新导出类型供页面使用
export type {
  NFTLevel,
  NodeLevel,
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
}

// 奖励列表分页状态
interface RewardListState {
  records: RewardRecord[]
  currentPage: number
  totalPages: number
  totalCount: number
  totalAmount: number
  hasMore: boolean
  isLoadingMore: boolean
}

// Store 状态
interface PayFiState {
  // 数据状态
  priceInfo: PriceInfo | null
  userAssets: UserAssets | null
  teamStats: TeamStats | null
  earningsStats: EarningsStats | null
  pidReleasePlans: PIDReleasePlan[]
  burnRecords: PICBurnRecord[]
  rewardRecords: RewardRecord[]
  rewardListState: RewardListState  // 奖励列表分页状态
  withdrawRecords: WithdrawRecord[]
  teamMembers: TeamMember[]
  systemStats: SystemStats | null
  nftOrders: NFTOrder[]

  // NFT 持有相关
  nftHoldings: UserNFTItem[]
  nftHoldingStats: NFTHoldingStats | null

  // NFT 等级配置（从后端获取）
  nftLevelConfigs: NFTLevelConfigItem[]

  // 节点等级配置（从后端获取）
  nodeLevelConfigs: NodeLevelConfigItem[]

  // 系统配置（从后端获取）
  systemConfig: SystemConfig | null

  // 加载状态
  isLoading: boolean
  error: string | null

  // 邀请信息
  inviteCode: string
  inviteLink: string

  // Actions - 数据获取
  fetchHomeData: () => Promise<void>
  fetchAllData: () => Promise<void>
  fetchPriceInfo: () => Promise<void>
  fetchUserAssets: () => Promise<void>
  fetchTeamStats: () => Promise<void>
  fetchEarningsStats: () => Promise<void>
  fetchPIDReleasePlans: () => Promise<void>
  fetchRewardRecords: () => Promise<void>
  fetchRewardRecordsByType: (type: RewardType, page?: number, pageSize?: number) => Promise<void>
  loadMoreRewards: (type: RewardType) => Promise<void>  // 加载更多奖励
  resetRewardList: () => void  // 重置奖励列表状态
  fetchWithdrawRecords: () => Promise<void>
  fetchTeamMembers: () => Promise<void>
  fetchInviteCode: () => Promise<void>
  fetchNFTOrders: () => Promise<void>
  fetchUserNFTList: (page?: number, pageSize?: number) => Promise<void>
  fetchUserNFTStats: () => Promise<void>
  fetchNFTLevelConfigs: () => Promise<void>
  fetchNodeLevelConfigs: () => Promise<void>
  fetchSystemConfig: () => Promise<void>

  // Actions - 业务操作
  purchaseNFT: (level: NFTLevel) => Promise<CreateNFTOrderResponse | null>
  upgradeNFT: (targetLevel: NFTLevel) => Promise<boolean>
  stakeNFT: () => Promise<boolean>
  unstakeNFT: () => Promise<boolean>
  burnPIC: (amount: number) => Promise<boolean>
  withdraw: (amount: number, tokenType?: 'PID' | 'PIC') => Promise<boolean>
  createWithdrawOrder: (data: CreateWithdrawRequest) => Promise<boolean>
  claimRewards: () => Promise<boolean>

  // 工具方法
  setLoading: (loading: boolean) => void
  setError: (error: string | null) => void
  reset: () => void
}

// ================================
// 默认值和工具函数
// ================================

const getDefaultUserAssets = (): UserAssets => ({
  totalAssetValueUSDT: 0,
  usdtBalance: 0,
  currentNFTLevel: null,
  nftCoefficient: 0,
  picBurnExitMultiplier: 0,
  nftStaked: false,
  nftStakeTime: null,
  powerFromNFT: 0,
  powerFromBurn: 0,
  totalPower: 0,
  totalNFTInvest: 0,
  totalPICBurnUsdt: 0,
  totalInvest: 0,
  exitFromNFT: 0,
  exitFromBurn: 0,
  totalExitLimit: 0,
  earnedRewards: 0,
  remainingLimit: 0,
  pidTotalLocked: 0,
  pidReleased: 0,
  pidBalance: 0,
  picBalance: 0,
  picReleasedBalance: 0,
})

const getDefaultTeamStats = (): TeamStats => ({
  nodeLevel: 'P0',
  directPerformance: 0,
  directCount: 0,
  directOrderCount: 0,
  teamCount: 0,
  teamOrderCount: 0,
  teamPerformance: 0,
  smallAreaPerf: 0,
  maxLinePerf: 0,
})

// 转换 API PriceInfo
const convertPriceInfo = (apiPrice: ApiPriceInfo): PriceInfo => ({
  pidPrice: apiPrice.pidPrice,
  picPrice: apiPrice.picPrice,
  pidChange: apiPrice.pidChange || 0,
  picChange: apiPrice.picChange || 0,
  lastUpdated: new Date(),
})

// 转换 API UserRelation 到 TeamMember
const convertToTeamMember = (relation: UserRelation, index: number, isDirectReferral: boolean): TeamMember => {
  // 安全解析日期
  let joinedAt: Date
  try {
    joinedAt = relation.createdAt ? new Date(relation.createdAt) : new Date()
    // 检查日期是否有效
    if (isNaN(joinedAt.getTime())) {
      joinedAt = new Date()
    }
  } catch {
    joinedAt = new Date()
  }

  return {
    id: index + 1,
    address: relation.address,
    nftLevel: null, // 第一阶段都是 null
    nodeLevel: 'P0', // 第一阶段都是 P0
    performance: 0, // 第一阶段都是 0
    isDirectReferral,
    joinedAt,
    state: relation.state,
  }
}

// 转换 API WithdrawOrder 到 WithdrawRecord
// 后端状态: 1=Submit(等待签名), 2=Cheque(可提取), 3=Received(已领取)
// 后端来源: 1=AWT, 2=Balance, 3=Released
const convertToWithdrawRecord = (order: ApiWithdrawOrder): WithdrawRecord => {
  // 状态映射
  const stateMap: Record<number, WithdrawRecord['status']> = {
    1: 'submit',
    2: 'cheque',
    3: 'received',
  }
  // 来源映射
  const sourceMap: Record<number, WithdrawRecord['source']> = {
    1: 'balance', // AWT 视为 balance
    2: 'balance',
    3: 'released',
  }

  return {
    id: order.id,
    orderNum: order.orderNum,
    tokenType: order.tokenType as 'PID' | 'PIC',
    amount: parseFloat(order.amount),
    servicedFee: parseFloat(order.servicedFee || '0'),
    source: sourceMap[order.source] || 'balance',
    status: stateMap[order.state] || 'submit',
    transactionHash: order.transactionHash,
    createdAt: new Date(order.createdAt),
    claimedAt: order.claimedAt ? new Date(order.claimedAt) : undefined,
  }
}

// 转换 API BurnRecord 到 PICBurnRecord
const convertToBurnRecord = (record: ApiBurnRecord): PICBurnRecord => ({
  id: record.id,
  picAmount: record.picAmount,
  picPrice: record.picPrice,
  usdtValue: record.usdtValue,
  nftLevelAtBurn: record.nftLevelAtBurn as NFTLevel,
  exitMultiplier: record.exitMultiplier,
  powerAdded: record.powerAdded,
  exitAdded: record.exitAdded,
  createdAt: new Date(record.createdAt),
})

// ================================
// 请求防抖机制
// ================================

// 存储正在进行的请求 Promise，避免重复请求
const pendingRequests = new Map<string, Promise<void>>()

// 已完成请求的时间戳，用于防止 React Strict Mode 双重调用
const completedRequests = new Map<string, number>()

// 防抖请求包装函数
async function dedupeRequest(key: string, requestFn: () => Promise<void>): Promise<void> {
  // 如果已有相同请求在进行，返回现有的 Promise
  const existing = pendingRequests.get(key)
  if (existing) {
    return existing
  }

  // 检查是否刚完成（100ms 内），防止 React Strict Mode 双重调用
  const completedAt = completedRequests.get(key)
  if (completedAt && Date.now() - completedAt < 100) {
    return Promise.resolve()
  }

  // 创建新请求
  const promise = requestFn().finally(() => {
    // 请求完成后从 Map 中移除，并记录完成时间
    pendingRequests.delete(key)
    completedRequests.set(key, Date.now())
  })

  pendingRequests.set(key, promise)
  return promise
}

// ================================
// Store 实现
// ================================

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
      rewardListState: {
        records: [],
        currentPage: 0,
        totalPages: 0,
        totalCount: 0,
        totalAmount: 0,
        hasMore: true,
        isLoadingMore: false,
      },
      withdrawRecords: [],
      teamMembers: [],
      systemStats: null,
      nftOrders: [],
      nftHoldings: [],
      nftHoldingStats: null,
      nftLevelConfigs: [],
      nodeLevelConfigs: [],
      systemConfig: null,
      isLoading: false,
      error: null,
      inviteCode: '',
      inviteLink: '',

      // ================================
      // 数据获取
      // ================================

      // 首页数据加载：只加载首页需要的数据
      fetchHomeData: async () => {
        return dedupeRequest('homeData', async () => {
          set({ isLoading: true, error: null })
          try {
            const store = get()
            await Promise.all([
              store.fetchPriceInfo(),
              store.fetchUserAssets(),
              store.fetchEarningsStats(),
            ])
            set({ isLoading: false })
          } catch (error) {
            console.error('获取首页数据失败:', error)
            set({ error: '获取数据失败', isLoading: false })
          }
        })
      },

      // 保留 fetchAllData 用于需要全部数据的场景，但一般不推荐使用
      fetchAllData: async () => {
        set({ isLoading: true, error: null })
        try {
          const store = get()
          await Promise.all([
            store.fetchPriceInfo(),
            store.fetchUserAssets(),
            store.fetchTeamStats(),
            store.fetchEarningsStats(),
            store.fetchInviteCode(),
          ])
          set({ isLoading: false })
        } catch (error) {
          console.error('获取数据失败:', error)
          set({ error: '获取数据失败', isLoading: false })
        }
      },

      fetchPriceInfo: async () => {
        return dedupeRequest('priceInfo', async () => {
          try {
            const apiPrice = await payfiApi.getPriceInfo()
            const priceInfo = convertPriceInfo(apiPrice)
            set({ priceInfo })
          } catch (error) {
            console.error('获取价格失败:', error)
          }
        })
      },

      fetchUserAssets: async () => {
        return dedupeRequest('userAssets', async () => {
          try {
            const apiAssets = await payfiApi.getUserAssets()

            // 从新 API 结构提取数据
            const nft = apiAssets.nft
            const pid = apiAssets.pid
            const pic = apiAssets.pic
            const earnings = apiAssets.earnings

            // 解析 NFT 等级
            const nftLevel = (nft?.stakedLevel || apiAssets.currentNftLevel) as NFTLevel || null

            // 从 API 响应构建用户资产
            const userAssets: UserAssets = {
              ...getDefaultUserAssets(),
              // 用户状态（原 /me 接口字段，合并到 /assets 接口）
              is_active: apiAssets.is_active,
              hasInviter: apiAssets.hasInviter,
              // 功能开关（直接使用 API 返回的值）
              featureFlags: apiAssets.featureFlags,
              // NFT 相关
              currentNFTLevel: nftLevel,
              nftCoefficient: nft?.coefficient || 0,
              picBurnExitMultiplier: nft?.picBurnExitMultiplier || 0,
              nftStaked: !!nftLevel,
              powerFromNFT: nft?.totalPower || 0,
              totalNFTInvest: nft?.totalInvest || 0,
              exitFromNFT: nft?.exitLimit || 0,

              // PID 相关（使用 ?? 而非 ||，避免 0 被当作 falsy 值）
              pidTotalLocked: pid?.totalLocked ?? apiAssets.release?.totalLocked ?? 0,
              pidReleased: pid?.released ?? apiAssets.release?.totalReleased ?? 0,
              pidBalance: pid?.available ?? 0, // 可用余额：已释放且可提取的 PID

              // PIC 相关
              picBalance: pic?.available ?? apiAssets.picBalance ?? 0,
              picReleasedBalance: pic?.releasedBalance ?? apiAssets.picReleasedBalance ?? 0,

              // 收益和出局相关
              earnedRewards: earnings?.earnedRewardsUSDT ?? 0,
              totalExitLimit: earnings?.totalExitLimit ?? 0,
              remainingLimit: earnings?.remainingLimit ?? 0,

              // 总算力（NFT + 销毁）
              totalPower: (nft?.totalPower || 0),

              // 总资产估值
              totalAssetValueUSDT: apiAssets.totalAssetValueUSDT || 0,

              // 钱包 USDT 余额
              usdtBalance: apiAssets.usdtBalance || 0,
            }

            // 同时从 assets API 提取价格信息
            const updates: Partial<PayFiState> = { userAssets }
            if (apiAssets.prices) {
              updates.priceInfo = convertPriceInfo(apiAssets.prices)
            }
            set(updates)
          } catch (error) {
            console.error('获取用户资产失败:', error)
            if (error instanceof ApiError && error.isUnauthorized) {
              set({ error: '请先登录' })
            }
          }
        })
      },

      fetchTeamStats: async () => {
        return dedupeRequest('teamStats', async () => {
          try {
            const apiStats = await payfiApi.getTeamStats()
            const teamStats: TeamStats = {
              ...getDefaultTeamStats(),
              directPerformance: parseFloat(apiStats.directPerformance) || 0,
              directCount: apiStats.directCount || 0,
              directOrderCount: apiStats.directOrderCount || 0,
              teamCount: apiStats.teamCount || 0,
              teamOrderCount: apiStats.teamOrderCount || 0,
              teamPerformance: parseFloat(apiStats.teamPerformance) || 0,
              maxLinePerf: parseFloat(apiStats.maxLinePerf) || 0,
              smallAreaPerf: parseFloat(apiStats.smallAreaPerf) || 0,
              nodeLevel: (apiStats.nodeLevel as TeamStats['nodeLevel']) || 'P0',
            }
            set({ teamStats })
          } catch (error) {
            console.error('获取团队统计失败:', error)
          }
        })
      },

      fetchEarningsStats: async () => {
        return dedupeRequest('earningsStats', async () => {
          try {
            const summary = await payfiApi.getRewardSummary()
            const earningsStats: EarningsStats = {
              // 累计收益
              totalStaticEarned: summary.totalStaticProfit,
              totalReferralEarned: summary.totalInviteProfit,
              totalNodeEarned: summary.totalNodeProfit || 0,
              totalSameLevelEarned: summary.totalSameLevelProfit || 0,
              totalGlobalEarned: summary.totalGlobalProfit || 0,
              // 今日收益
              todayEarnings: summary.todayProfit,
              todayStaticEarned: summary.todayStaticProfit || 0,
              todayReferralEarned: summary.todayInviteProfit || 0,
              todayNodeEarned: summary.todayNodeProfit || 0,
              todaySameLevelEarned: summary.todaySameLevelProfit || 0,
              todayGlobalEarned: summary.todayGlobalProfit || 0,
              withdrawableAmount: summary.totalProfit,
            }
            set({ earningsStats })
          } catch (error) {
            console.error('获取收益统计失败:', error)
          }
        })
      },

      fetchPIDReleasePlans: async () => {
        return dedupeRequest('pidReleasePlans', async () => {
          try {
            const releaseSummary = await payfiApi.getReleaseSummary()
            const totalLocked = releaseSummary.totalLocked || 0
            const totalReleased = releaseSummary.totalReleased || 0

            // 如果没有锁仓，返回空数组
            if (totalLocked <= 0) {
              set({ pidReleasePlans: [] })
              return
            }

            // 生成释放计划（25 个月线性释放）
            const monthsTotal = 25
            const dailyAmount = totalLocked / (monthsTotal * 30)
            const monthlyAmount = totalLocked / monthsTotal
            const monthsCompleted = Math.min(
              Math.floor(totalReleased / monthlyAmount),
              monthsTotal
            )

            const startDate = new Date()
            startDate.setMonth(startDate.getMonth() - monthsCompleted)

            const endDate = new Date(startDate)
            endDate.setMonth(endDate.getMonth() + monthsTotal)

            const plan: PIDReleasePlan = {
              id: 1,
              totalAmount: totalLocked,
              releasedAmount: totalReleased,
              startDate,
              endDate,
              dailyAmount,
              status: totalReleased >= totalLocked ? 'completed' : 'active',
              monthsTotal,
              monthsCompleted,
            }

            set({ pidReleasePlans: [plan] })
          } catch (error) {
            console.error('获取释放计划失败:', error)
          }
        })
      },

      fetchRewardRecords: async () => {
        // 保留用于向后兼容，具体类型请使用 fetchRewardRecordsByType
        set({ rewardRecords: [] })
      },

      fetchRewardRecordsByType: async (type: RewardType, page = 1, pageSize = 20) => {
        return dedupeRequest(`rewardRecords-${type}-${page}`, async () => {
          try {
            const result = await payfiApi.getRewardsByType(type as ApiRewardType, page, pageSize)
            // 转换后端响应格式到前端类型
            const records: RewardRecord[] = (result.items || []).map((item: RewardRecordResponse) => ({
              id: item.ID,
              rewardType: item.RewardType as RewardType,
              sourceUserId: item.SourceUserID,
              sourceAddress: null, // 后端暂未返回地址
              picAmount: item.PICAmount,
              usdtValue: item.USDTValue,
              picPrice: item.PICPrice,
              rewardDate: new Date(item.RewardDate),
              createdAt: new Date(item.CreatedAt),
            }))
            // 更新分页状态
            set({
              rewardRecords: records,
              rewardListState: {
                records,
                currentPage: page,
                totalPages: result.total_pages,
                totalCount: result.total,
                totalAmount: result.total_amount || 0,
                hasMore: page < result.total_pages,
                isLoadingMore: false,
              },
            })
          } catch (error) {
            console.error('获取奖励记录失败:', error)
            set({
              rewardRecords: [],
              rewardListState: {
                records: [],
                currentPage: 0,
                totalPages: 0,
                totalCount: 0,
                totalAmount: 0,
                hasMore: false,
                isLoadingMore: false,
              },
            })
          }
        })
      },

      loadMoreRewards: async (type: RewardType) => {
        const state = get()
        const { rewardListState } = state

        // 如果正在加载或没有更多数据，直接返回
        if (rewardListState.isLoadingMore || !rewardListState.hasMore) {
          return
        }

        const nextPage = rewardListState.currentPage + 1

        // 设置加载中状态
        set({
          rewardListState: {
            ...rewardListState,
            isLoadingMore: true,
          },
        })

        try {
          const result = await payfiApi.getRewardsByType(type as ApiRewardType, nextPage, 20)
          // 转换后端响应格式到前端类型
          const newRecords: RewardRecord[] = (result.items || []).map((item: RewardRecordResponse) => ({
            id: item.ID,
            rewardType: item.RewardType as RewardType,
            sourceUserId: item.SourceUserID,
            sourceAddress: null,
            picAmount: item.PICAmount,
            usdtValue: item.USDTValue,
            picPrice: item.PICPrice,
            rewardDate: new Date(item.RewardDate),
            createdAt: new Date(item.CreatedAt),
          }))

          // 追加新记录（不重复添加）
          const existingIds = new Set(rewardListState.records.map(r => r.id))
          const uniqueNewRecords = newRecords.filter(r => !existingIds.has(r.id))
          const allRecords = [...rewardListState.records, ...uniqueNewRecords]

          set({
            rewardRecords: allRecords,
            rewardListState: {
              records: allRecords,
              currentPage: nextPage,
              totalPages: result.total_pages,
              totalCount: result.total,
              totalAmount: result.total_amount || 0,  // 使用后端返回的总金额，不重复计算
              hasMore: nextPage < result.total_pages,
              isLoadingMore: false,
            },
          })
        } catch (error) {
          console.error('加载更多奖励记录失败:', error)
          set({
            rewardListState: {
              ...get().rewardListState,
              isLoadingMore: false,
            },
          })
        }
      },

      resetRewardList: () => {
        set({
          rewardRecords: [],
          rewardListState: {
            records: [],
            currentPage: 0,
            totalPages: 0,
            totalCount: 0,
            totalAmount: 0,
            hasMore: true,
            isLoadingMore: false,
          },
        })
      },

      fetchWithdrawRecords: async () => {
        try {
          const result = await withdrawApi.getWithdrawOrders(undefined, 1, 50)
          const records = (result.items || []).map(convertToWithdrawRecord)
          set({ withdrawRecords: records })
        } catch (error) {
          console.error('获取提现记录失败:', error)
        }
      },

      fetchTeamMembers: async () => {
        return dedupeRequest('teamMembers', async () => {
          try {
            // 先获取直推，再获取间推
            const [directResult, indirectResult] = await Promise.all([
              userApi.getUserRelations(UserRelationType.Direct, 1, 50),
              userApi.getUserRelations(UserRelationType.Indirect, 1, 50),
            ])

            const directMembers = (directResult.items || []).map((r, i) =>
              convertToTeamMember(r, i, true)
            )
            const indirectMembers = (indirectResult.items || []).map((r, i) =>
              convertToTeamMember(r, directMembers.length + i, false)
            )

            // 合并并按地址去重，直推优先
            const allMembers = [...directMembers, ...indirectMembers]
            const uniqueMembers = allMembers.filter((member, index, self) =>
              index === self.findIndex((m) => m.address.toLowerCase() === member.address.toLowerCase())
            )

            set({ teamMembers: uniqueMembers })
          } catch (error) {
            console.error('获取团队成员失败:', error)
          }
        })
      },

      fetchInviteCode: async () => {
        return dedupeRequest('inviteCode', async () => {
          try {
            const result = await authApi.createInviteCode()
            const code = result.code
            const baseUrl = typeof window !== 'undefined' ? window.location.origin : ''
            set({ inviteCode: code, inviteLink: `${baseUrl}/?ref=${code}` })
          } catch (error) {
            console.error('获取邀请码失败:', error)
          }
        })
      },

      fetchNFTOrders: async () => {
        try {
          const result = await nftApi.getNFTOrders(1, 50)
          set({ nftOrders: result.items || [] })
        } catch (error) {
          console.error('获取NFT订单失败:', error)
        }
      },

      fetchUserNFTList: async (page = 1, pageSize = 50) => {
        return dedupeRequest(`nftList-${page}-${pageSize}`, async () => {
          try {
            const result = await nftApi.getUserNFTList(page, pageSize)
            set({ nftHoldings: result.items || [] })
          } catch (error) {
            console.error('获取用户NFT列表失败:', error)
          }
        })
      },

      fetchUserNFTStats: async () => {
        return dedupeRequest('nftStats', async () => {
          try {
            const stats = await nftApi.getUserNFTStats()
            set({ nftHoldingStats: stats })
          } catch (error) {
            console.error('获取用户NFT统计失败:', error)
          }
        })
      },

      fetchNFTLevelConfigs: async () => {
        return dedupeRequest('nftLevelConfigs', async () => {
          try {
            const configs = await payfiApi.getNFTLevelConfigs()
            set({ nftLevelConfigs: configs })
          } catch (error) {
            console.error('获取NFT等级配置失败:', error)
          }
        })
      },

      fetchNodeLevelConfigs: async () => {
        return dedupeRequest('nodeLevelConfigs', async () => {
          try {
            const configs = await payfiApi.getNodeLevelConfigs()
            set({ nodeLevelConfigs: configs })
          } catch (error) {
            console.error('获取节点等级配置失败:', error)
          }
        })
      },

      fetchSystemConfig: async () => {
        return dedupeRequest('systemConfig', async () => {
          try {
            const config = await payfiApi.getSystemConfig()
            set({ systemConfig: config })
          } catch (error) {
            console.error('获取系统配置失败:', error)
          }
        })
      },

      // ================================
      // 业务操作
      // ================================

      purchaseNFT: async (level: NFTLevel) => {
        if (!level) return null
        set({ isLoading: true, error: null })
        try {
          const result = await nftApi.createNFTOrder({
            nftLevel: level,
            isUpgrade: false,
          })
          set({ isLoading: false })
          return result
        } catch (error) {
          console.error('创建NFT订单失败:', error)
          set({
            error: error instanceof ApiError ? error.message : '创建订单失败',
            isLoading: false,
          })
          return null
        }
      },

      upgradeNFT: async (targetLevel: NFTLevel) => {
        if (!targetLevel) return false
        set({ isLoading: true, error: null })
        try {
          await nftApi.createNFTOrder({
            nftLevel: targetLevel,
            isUpgrade: true,
          })
          set({ isLoading: false })
          return true
        } catch (error) {
          console.error('升级NFT失败:', error)
          set({
            error: error instanceof ApiError ? error.message : '升级失败',
            isLoading: false,
          })
          return false
        }
      },

      // 第一阶段禁用质押功能
      stakeNFT: async () => {
        set({ error: '第一阶段暂未开放质押功能' })
        return false
      },

      unstakeNFT: async () => {
        set({ error: '第一阶段暂未开放质押功能' })
        return false
      },

      burnPIC: async (amount: number) => {
        set({ isLoading: true, error: null })
        try {
          const response = await burnApi.burnPIC({ amount })
          // 转换并添加到记录
          const record = convertToBurnRecord({
            id: response.id,
            picAmount: response.picAmount,
            picPrice: 0, // API 响应中没有这个字段
            usdtValue: response.usdtValue,
            nftLevelAtBurn: 'N1', // 默认值
            exitMultiplier: 0,
            powerAdded: response.powerAdded,
            exitAdded: response.exitAdded,
            createdAt: response.createdAt,
          })
          set((state) => ({
            burnRecords: [record, ...state.burnRecords],
            isLoading: false,
          }))
          await get().fetchUserAssets()
          return true
        } catch (error) {
          console.error('销毁PIC失败:', error)
          set({
            error: error instanceof ApiError ? error.message : '销毁失败',
            isLoading: false,
          })
          return false
        }
      },

      withdraw: async (amount: number, tokenType: 'PID' | 'PIC' = 'PID') => {
        set({ isLoading: true, error: null })
        try {
          const typeCode = tokenType === 'PID' ? TokenTypeCode.PID : TokenTypeCode.PIC
          await withdrawApi.createWithdrawOrder({
            amount,
            type: typeCode,
          })
          await Promise.all([
            get().fetchWithdrawRecords(),
            get().fetchUserAssets(),
          ])
          set({ isLoading: false })
          return true
        } catch (error) {
          console.error('提现失败:', error)
          set({
            error: error instanceof ApiError ? error.message : '提现失败',
            isLoading: false,
          })
          return false
        }
      },

      createWithdrawOrder: async (data: CreateWithdrawRequest) => {
        set({ isLoading: true, error: null })
        try {
          await withdrawApi.createWithdrawOrder(data)
          await Promise.all([
            get().fetchWithdrawRecords(),
            get().fetchUserAssets(),
          ])
          set({ isLoading: false })
          return true
        } catch (error) {
          console.error('创建提现订单失败:', error)
          set({
            error: error instanceof ApiError ? error.message : '创建提现订单失败',
            isLoading: false,
          })
          return false
        }
      },

      claimRewards: async () => {
        // 第一阶段暂无领取功能
        return true
      },

      // ================================
      // 工具方法
      // ================================

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
        rewardListState: {
          records: [],
          currentPage: 0,
          totalPages: 0,
          totalCount: 0,
          totalAmount: 0,
          hasMore: true,
          isLoadingMore: false,
        },
        withdrawRecords: [],
        teamMembers: [],
        systemStats: null,
        nftOrders: [],
        nftHoldings: [],
        nftHoldingStats: null,
        nftLevelConfigs: [],
        isLoading: false,
        error: null,
        inviteCode: '',
        inviteLink: '',
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
)
