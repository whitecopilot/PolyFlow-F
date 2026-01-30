import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  // 加载环境变量
  const env = loadEnv(mode, process.cwd(), '')

  return {
    plugins: [react()],
    server: {
      proxy: {
        '/api': {
          // 开发环境代理目标，支持环境变量配置
          target: env.VITE_DEV_PROXY_TARGET || 'http://localhost:9099',
          changeOrigin: true,
          secure: false,
        },
      },
    },
  }
})
