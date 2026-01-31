import { type Chain } from 'viem'
import { createConfig, http } from 'wagmi'
import { injected } from 'wagmi/connectors'

// BSC Testnet 链配置
const bscTestnet: Chain = {
  id: 97,
  name: 'BSC Testnet',
  nativeCurrency: {
    name: 'BNB',
    symbol: 'BNB',
    decimals: 18,
  },
  rpcUrls: {
    default: {
      http: [import.meta.env.VITE_BSC_TESTNET_RPC || 'https://bsc-testnet-dataseed.bnbchain.org'],
    },
  },
  blockExplorers: {
    default: {
      name: 'BSC Testnet Explorer',
      url: 'https://testnet.bscscan.com',
    },
  },
  testnet: true,
}

// BSC Mainnet 链配置
const bscMainnet: Chain = {
  id: 56,
  name: 'BNB Smart Chain',
  nativeCurrency: {
    name: 'BNB',
    symbol: 'BNB',
    decimals: 18,
  },
  rpcUrls: {
    default: {
      http: [import.meta.env.VITE_BSC_MAINNET_RPC || 'https://bsc-dataseed.bnbchain.org'],
    },
  },
  blockExplorers: {
    default: {
      name: 'BscScan',
      url: 'https://bscscan.com',
    },
  },
  testnet: false,
}

// 根据环境变量选择网络
const networkEnv = import.meta.env.VITE_NETWORK_ENV || 'testnet'
const isTestnet = networkEnv === 'testnet'

// 当前使用的链
export const currentChain = isTestnet ? bscTestnet : bscMainnet

// 获取 RPC URL（使用环境变量配置的 RPC，避免使用 wagmi 默认的公共节点）
const getRpcUrl = () => {
  if (isTestnet) {
    return import.meta.env.VITE_BSC_TESTNET_RPC || 'https://bsc-testnet-dataseed.bnbchain.org'
  }
  return import.meta.env.VITE_BSC_MAINNET_RPC || 'https://bsc-dataseed.bnbchain.org'
}

// DApp 在钱包内置浏览器中运行，直接使用钱包注入的 provider
// 不需要 WalletConnect 或其他外部连接器
export const config = createConfig({
  chains: [currentChain],
  connectors: [
    // 仅使用 injected 连接器，自动检测钱包注入的 provider
    injected({
      shimDisconnect: true,
    }),
  ],
  transports: {
    // 使用环境变量配置的 RPC URL
    [currentChain.id]: http(getRpcUrl()),
  },
})

declare module 'wagmi' {
  interface Register {
    config: typeof config
  }
}
