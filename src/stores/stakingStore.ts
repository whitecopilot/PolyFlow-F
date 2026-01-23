import { create } from 'zustand'

export interface NFTItem {
  id: string
  name: string
  category: 'bronze' | 'silver' | 'gold' | 'platinum' | 'diamond'
  imageUrl: string
  isStaked: boolean
  stakedAt?: number
}

export interface StakingInfo {
  tokenStaked: string
  nftStaked: number
  totalRewards: string
  pendingRewards: string
  dailyRewards: string
  apr: string
}

export interface TeamMember {
  address: string
  shortAddress: string
  level: number
  contribution: string
  joinedAt: number
}

export interface TeamStats {
  totalMembers: number
  directMembers: number
  teamVolume: string
  teamRewards: string
  rank: string
}

interface StakingState {
  // 用户资产
  tokenBalance: string
  nfts: NFTItem[]

  // 质押信息
  stakingInfo: StakingInfo

  // 团队数据
  teamStats: TeamStats
  teamMembers: TeamMember[]

  // 邀请码
  inviteCode: string
  inviteLink: string

  // Actions
  setTokenBalance: (balance: string) => void
  setNFTs: (nfts: NFTItem[]) => void
  setStakingInfo: (info: Partial<StakingInfo>) => void
  setTeamStats: (stats: Partial<TeamStats>) => void
  setTeamMembers: (members: TeamMember[]) => void
  stakeToken: (amount: string) => void
  unstakeToken: (amount: string) => void
  stakeNFT: (nftId: string) => void
  unstakeNFT: (nftId: string) => void
  claimRewards: () => void
}

// 模拟数据
const mockNFTs: NFTItem[] = [
  { id: '1', name: 'PolyFlow #001', category: 'gold', imageUrl: '/nft-gold.png', isStaked: false },
  { id: '2', name: 'PolyFlow #002', category: 'silver', imageUrl: '/nft-silver.png', isStaked: true, stakedAt: Date.now() - 86400000 * 7 },
  { id: '3', name: 'PolyFlow #003', category: 'bronze', imageUrl: '/nft-bronze.png', isStaked: false },
]

export const useStakingStore = create<StakingState>()((set) => ({
  tokenBalance: '10000.00',
  nfts: mockNFTs,

  stakingInfo: {
    tokenStaked: '5000.00',
    nftStaked: 1,
    totalRewards: '1234.56',
    pendingRewards: '89.12',
    dailyRewards: '12.34',
    apr: '36.5',
  },

  teamStats: {
    totalMembers: 156,
    directMembers: 23,
    teamVolume: '1,234,567.89',
    teamRewards: '12,345.67',
    rank: 'Gold',
  },

  teamMembers: [
    { address: '0x1234...5678', shortAddress: '0x12...78', level: 1, contribution: '5,000.00', joinedAt: Date.now() - 86400000 * 30 },
    { address: '0x2345...6789', shortAddress: '0x23...89', level: 1, contribution: '3,500.00', joinedAt: Date.now() - 86400000 * 25 },
    { address: '0x3456...7890', shortAddress: '0x34...90', level: 2, contribution: '2,800.00', joinedAt: Date.now() - 86400000 * 20 },
  ],

  inviteCode: 'PF2024ABC',
  inviteLink: 'https://polyflow.app/i/PF2024ABC',

  setTokenBalance: (balance) => set({ tokenBalance: balance }),
  setNFTs: (nfts) => set({ nfts }),
  setStakingInfo: (info) => set((state) => ({ stakingInfo: { ...state.stakingInfo, ...info } })),
  setTeamStats: (stats) => set((state) => ({ teamStats: { ...state.teamStats, ...stats } })),
  setTeamMembers: (members) => set({ teamMembers: members }),

  stakeToken: (amount) => set((state) => ({
    tokenBalance: (parseFloat(state.tokenBalance) - parseFloat(amount)).toFixed(2),
    stakingInfo: {
      ...state.stakingInfo,
      tokenStaked: (parseFloat(state.stakingInfo.tokenStaked) + parseFloat(amount)).toFixed(2),
    },
  })),

  unstakeToken: (amount) => set((state) => ({
    tokenBalance: (parseFloat(state.tokenBalance) + parseFloat(amount)).toFixed(2),
    stakingInfo: {
      ...state.stakingInfo,
      tokenStaked: (parseFloat(state.stakingInfo.tokenStaked) - parseFloat(amount)).toFixed(2),
    },
  })),

  stakeNFT: (nftId) => set((state) => ({
    nfts: state.nfts.map((nft) =>
      nft.id === nftId ? { ...nft, isStaked: true, stakedAt: Date.now() } : nft
    ),
    stakingInfo: {
      ...state.stakingInfo,
      nftStaked: state.stakingInfo.nftStaked + 1,
    },
  })),

  unstakeNFT: (nftId) => set((state) => ({
    nfts: state.nfts.map((nft) =>
      nft.id === nftId ? { ...nft, isStaked: false, stakedAt: undefined } : nft
    ),
    stakingInfo: {
      ...state.stakingInfo,
      nftStaked: state.stakingInfo.nftStaked - 1,
    },
  })),

  claimRewards: () => set((state) => ({
    tokenBalance: (parseFloat(state.tokenBalance) + parseFloat(state.stakingInfo.pendingRewards)).toFixed(2),
    stakingInfo: {
      ...state.stakingInfo,
      totalRewards: (parseFloat(state.stakingInfo.totalRewards) + parseFloat(state.stakingInfo.pendingRewards)).toFixed(2),
      pendingRewards: '0.00',
    },
  })),
}))
