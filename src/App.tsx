import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { ChakraProvider } from '@chakra-ui/react'
import { system } from './theme'
import { Web3Provider } from './providers/Web3Provider'
import { MobileLayout, SecondaryLayout, ProtectedRoute } from './components/layout'
import {
  LoginPage,
  HomePage,
  RewardsPage,
  TeamPage,
  InvitePage,
  NFTPage,
  AssetsPage,
  BurnRecordsPage,
  RewardListPage,
  WithdrawRecordsPage,
  TeamMembersPage,
} from './pages'

function App() {
  return (
    <Web3Provider>
      <ChakraProvider value={system}>
        <BrowserRouter>
          <Routes>
            {/* 公开路由 - 登录页 */}
            <Route path="/login" element={<LoginPage />} />

            {/* 受保护路由 - 一级页面（带底部导航） */}
            <Route
              element={
                <ProtectedRoute>
                  <MobileLayout />
                </ProtectedRoute>
              }
            >
              <Route path="/" element={<HomePage />} />
              <Route path="/rewards" element={<RewardsPage />} />
              <Route path="/team" element={<TeamPage />} />
              <Route path="/nft" element={<NFTPage />} />
              <Route path="/assets" element={<AssetsPage />} />
              {/* 旧路由重定向 */}
              <Route path="/staking" element={<Navigate to="/assets" replace />} />
              <Route path="/mint" element={<Navigate to="/nft" replace />} />
            </Route>

            {/* 受保护路由 - 二级页面（无底部导航） */}
            <Route
              element={
                <ProtectedRoute>
                  <SecondaryLayout />
                </ProtectedRoute>
              }
            >
              <Route path="/invite" element={<InvitePage />} />
              <Route path="/burn-records" element={<BurnRecordsPage />} />
              <Route path="/rewards/:type" element={<RewardListPage />} />
              <Route path="/withdraw-records" element={<WithdrawRecordsPage />} />
              <Route path="/team-members" element={<TeamMembersPage />} />
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
