import { ChakraProvider } from '@chakra-ui/react'
import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import { AuthGuard, MobileLayout, ProtectedRoute, SecondaryLayout } from './components/layout'
import {
  AssetsPage,
  BurnRecordsPage,
  HomePage,
  InvitePage,
  LoginPage,
  NFTListPage,
  NFTPage,
  RewardListPage,
  RewardsPage,
  StakeRecordsPage,
  TeamMembersPage,
  TeamPage,
  TeamPerformancePage,
  WithdrawRecordsPage,
} from './pages'
import { Web3Provider } from './providers/Web3Provider'
import { TestI18n } from './test-i18n'
import { system } from './theme'

function App() {
  return (
    <Web3Provider>
      <ChakraProvider value={system}>
        <BrowserRouter>
          <AuthGuard>
          <Routes>
            {/* 测试路由 */}
            <Route path="/test-i18n" element={<TestI18n />} />

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
              <Route path="/stake-records" element={<StakeRecordsPage />} />
              <Route path="/rewards/:type" element={<RewardListPage />} />
              <Route path="/withdraw-records" element={<WithdrawRecordsPage />} />
              <Route path="/team-members" element={<TeamMembersPage />} />
              <Route path="/team-performance" element={<TeamPerformancePage />} />
              <Route path="/nft-list" element={<NFTListPage />} />
            </Route>

            {/* 404 重定向到首页 */}
            <Route path="*" element={<LoginPage />} />
          </Routes>
          </AuthGuard>
        </BrowserRouter>
      </ChakraProvider>
    </Web3Provider>
  )
}

export default App
