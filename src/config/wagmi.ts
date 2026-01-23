import { http, createConfig } from 'wagmi'
import { polygon, polygonAmoy, mainnet } from 'wagmi/chains'
import { injected, walletConnect, coinbaseWallet } from 'wagmi/connectors'

// WalletConnect projectId - 生产环境需替换为自己的 projectId
// 从 https://cloud.walletconnect.com 获取
const projectId = import.meta.env.VITE_WALLETCONNECT_PROJECT_ID || 'demo-project-id'

export const config = createConfig({
  chains: [polygon, polygonAmoy, mainnet],
  connectors: [
    injected(),
    walletConnect({ projectId }),
    coinbaseWallet({ appName: 'PolyFlow' }),
  ],
  transports: {
    [polygon.id]: http(),
    [polygonAmoy.id]: http(),
    [mainnet.id]: http(),
  },
})

declare module 'wagmi' {
  interface Register {
    config: typeof config
  }
}
