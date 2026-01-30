/// <reference types="vite/client" />

interface ImportMetaEnv {
  // API 配置
  readonly VITE_API_BASE_URL?: string
  readonly VITE_DEV_PROXY_TARGET?: string

  // 网络配置
  readonly VITE_NETWORK_ENV?: 'testnet' | 'mainnet'
  readonly VITE_XLAYER_TESTNET_RPC?: string
  readonly VITE_BSC_MAINNET_RPC?: string

  // WalletConnect
  readonly VITE_WALLETCONNECT_PROJECT_ID?: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
