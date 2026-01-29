import { type Chain } from 'viem'
import { createConfig, http } from 'wagmi'
import { coinbaseWallet, injected, walletConnect } from 'wagmi/connectors'

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

// WalletConnect projectId
const projectId = import.meta.env.VITE_WALLETCONNECT_PROJECT_ID || 'demo-project-id'

// 获取 RPC URL
const getRpcUrl = () => {
  if (isTestnet) {
    return import.meta.env.VITE_BSC_TESTNET_RPC || 'https://bsc-testnet-dataseed.bnbchain.org'
  }
  return import.meta.env.VITE_BSC_MAINNET_RPC || 'https://bsc-dataseed.bnbchain.org'
}

export const config = createConfig({
  chains: [currentChain],
  connectors: [
    injected(),
    walletConnect({ projectId }),
    coinbaseWallet({ appName: 'PolyFlow' }),
  ],
  transports: {
    [currentChain.id]: http(getRpcUrl()),
  },
})

declare module 'wagmi' {
  interface Register {
    config: typeof config
  }
}
