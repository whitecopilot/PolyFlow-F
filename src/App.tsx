import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { ChakraProvider } from '@chakra-ui/react'
import { system } from './theme'
import { Web3Provider } from './providers/Web3Provider'
import { MobileLayout, ProtectedRoute } from './components/layout'
import {
  LoginPage,
  HomePage,
  StakingPage,
  RewardsPage,
  TeamPage,
  InvitePage,
  MintPage,
} from './pages'

function App() {
  return (
    <Web3Provider>
      <ChakraProvider value={system}>
        <BrowserRouter>
          <Routes>
            {/* 公开路由 - 登录页 */}
            <Route path="/login" element={<LoginPage />} />

            {/* 受保护路由 - 需要登录 */}
            <Route
              element={
                <ProtectedRoute>
                  <MobileLayout />
                </ProtectedRoute>
              }
            >
              <Route path="/" element={<HomePage />} />
              <Route path="/staking" element={<StakingPage />} />
              <Route path="/rewards" element={<RewardsPage />} />
              <Route path="/team" element={<TeamPage />} />
              <Route path="/invite" element={<InvitePage />} />
              <Route path="/mint" element={<MintPage />} />
            </Route>

            {/* 404 重定向到首页 */}
            <Route path="*" element={<LoginPage />} />
          </Routes>
        </BrowserRouter>
      </ChakraProvider>
    </Web3Provider>
  )
}

export default App
