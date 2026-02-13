// 收益页面 - 收益矩阵

import { Box, Flex, HStack, Input, SimpleGrid, Text, VStack } from '@chakra-ui/react'
import { motion } from 'framer-motion'
import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import {
  HiOutlineBanknotes,
  HiOutlineBolt,
  HiOutlineBuildingLibrary,
  HiOutlineClipboardDocumentList,
  HiOutlineGlobeAlt,
  HiOutlineScale,
  HiOutlineUserGroup,
} from 'react-icons/hi2'
import { formatCompactNumber } from '../utils/format'
import { useNavigate } from 'react-router-dom'
import {
  ActionButton,
  GradientBorderCard,
  PageHeader,
  WithdrawOverlay,
} from '../components/common'
import { usePayFiStore } from '../stores/payfiStore'
import { useWithdraw } from '../hooks/useWithdraw'
import type { RewardType } from '../types/payfi'
import type { WithdrawSource } from '../api/types'

const MotionBox = motion.create(Box)

// 奖励类型图标映射
const REWARD_ICONS: Record<RewardType, React.ReactNode> = {
  static: <HiOutlineBolt size={18} color="#8A8A90" />,
  referral: <HiOutlineUserGroup size={18} color="#8A8A90" />,
  node: <HiOutlineBuildingLibrary size={18} color="#8A8A90" />,
  same_level: <HiOutlineScale size={18} color="#8A8A90" />,
  global: <HiOutlineGlobeAlt size={18} color="#8A8A90" />,
}

export function RewardsPage() {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const {
    userAssets,
    earningsStats,
    fetchEarningsStats,
    fetchUserAssets,
    fetchPriceInfo,
    fetchWithdrawRecords,
  } = usePayFiStore()

  // 使用提现 hook
  const {
    step,
    isLoading,
    withdraw,
    reset,
    getStatusText,
  } = useWithdraw()

  const [withdrawAmount, setWithdrawAmount] = useState('')
  const [showWithdrawModal, setShowWithdrawModal] = useState(false)
  const [selectedTokenType, setSelectedTokenType] = useState<'PID' | 'PIC' | 'PIC_RELEASED' | 'USDT_USDC'>('PID')

  useEffect(() => {
    // 只获取收益页面需要的数据
    fetchEarningsStats()
    fetchUserAssets()
    fetchPriceInfo()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // 计算提现预估 - 根据不同类型和来源
  const withdrawTokenAmount = parseFloat(withdrawAmount) || 0

  // 根据选择的代币类型获取可用余额
  const getAvailableBalance = () => {
    if (!userAssets) return 0
    switch (selectedTokenType) {
      case 'PID':
        return userAssets.pidBalance || 0
      case 'PIC':
        return userAssets.picBalance || 0
      case 'PIC_RELEASED':
        return userAssets.picReleasedBalance || 0
      case 'USDT_USDC':
        return userAssets.stablecoinSwapBalance || 0
      default:
        return 0
    }
  }

  const availableBalance = getAvailableBalance()

  // 可选的代币类型（只显示余额大于 0 的）
  const availableTokenTypes = [
    { type: 'PID' as const, balance: userAssets?.pidBalance || 0, label: 'PID', fee: false },
    { type: 'PIC' as const, balance: userAssets?.picBalance || 0, label: 'PIC', fee: true },
    { type: 'PIC_RELEASED' as const, balance: userAssets?.picReleasedBalance || 0, label: t('rewards.pic_released_short'), fee: false },
    { type: 'USDT_USDC' as const, balance: userAssets?.stablecoinSwapBalance || 0, label: 'USDT/USDC', fee: false },
  ].filter(t => t.balance > 0)

  // 处理提现
  const handleWithdraw = async () => {
    if (!withdrawAmount || isLoading) return

    const amount = parseFloat(withdrawAmount)
    // 关闭输入弹窗
    setShowWithdrawModal(false)

    // 根据选择的代币类型进行提现
    let tokenType: 'PID' | 'PIC' | 'USDT' | 'USDC'
    let source: WithdrawSource | undefined
    switch (selectedTokenType) {
      case 'PIC_RELEASED':
        tokenType = 'PIC'
        source = 'released'
        break
      case 'PIC':
        tokenType = 'PIC'
        source = 'balance'
        break
      case 'USDT_USDC':
        tokenType = 'USDT' // 默认使用 USDT，后端根据兑换记录处理
        source = 'swap'
        break
      default:
        tokenType = 'PID'
        source = undefined
    }
    const success = await withdraw(amount, tokenType, source)

    // 无论提现是否成功都刷新余额（订单创建后后端已扣款）
    setWithdrawAmount('')
    await Promise.all([fetchUserAssets(), fetchWithdrawRecords()])

    // 忽略 success 变量的 lint 警告
    void success
  }

  // 处理遮罩关闭
  const handleOverlayClose = () => {
    reset()
    // 如果失败了，跳转到提现记录页面
    if (step === 'error') {
      navigate('/withdraw-records')
    }
  }

  // 处理重试
  const handleRetry = () => {
    if (withdrawAmount) {
      handleWithdraw()
    }
  }

  // 打开提现弹窗
  const handleOpenModal = () => {
    setWithdrawAmount('')
    // 默认选择第一个有余额的代币类型
    if (availableTokenTypes.length > 0) {
      setSelectedTokenType(availableTokenTypes[0].type)
    }
    setShowWithdrawModal(true)
  }

  // 累计收益：使用 userAssets.earnedRewards（历史 USDT 价值，不受价格波动影响）
  const totalEarnings = userAssets?.earnedRewards || 0

  // 四种可提现余额
  const pidWithdrawable = userAssets?.pidBalance || 0
  const picWithdrawable = userAssets?.picBalance || 0
  const picReleased = userAssets?.picReleasedBalance || 0
  const stablecoinSwap = userAssets?.stablecoinSwapBalance || 0
  const hasWithdrawable = pidWithdrawable > 0 || picWithdrawable > 0 || picReleased > 0 || stablecoinSwap > 0

  // 节点配置
  // const nodeConfig = getNodeConfig(teamStats?.nodeLevel || 'P0')

  return (
    <Box minH="100vh" bg="#111111">
      <PageHeader title={t('rewards.title')} />

      <VStack gap="5" p="4" align="stretch">
        {/* 收益总览卡片 */}
        <GradientBorderCard glowIntensity="high">
          <MotionBox
            p="5"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            {/* 标题行带rewards.withdraw_records入口 */}
            <Flex justify="space-between" align="center" mb="3">
              <Text fontSize="sm" color="whiteAlpha.600">
                {t('rewards.cumulative_earnings')}
              </Text>
              <Flex
                align="center"
                gap="1"
                color="whiteAlpha.500"
                cursor="pointer"
                onClick={() => navigate('/withdraw-records')}
                _hover={{ color: '#22C55E' }}
                transition="color 0.2s"
              >
                <HiOutlineClipboardDocumentList size={16} />
                <Text fontSize="xs">{t('rewards.withdraw_records')}</Text>
              </Flex>
            </Flex>

            {/* 累计收益金额（历史 USDT 价值） */}
            <Text fontSize="2xl" fontWeight="bold" color="white" textAlign="center" mb="4">
              ${totalEarnings.toLocaleString(undefined, { minimumFractionDigits: 2 })}
            </Text>

            {/* 可提现余额 */}
            <SimpleGrid columns={stablecoinSwap > 0 ? 4 : 3} gap={3} mb="4">
              {/* PID 可提现 */}
              <Box textAlign="center">
                <Text fontSize="xs" color="whiteAlpha.500" mb="1">
                  {t('rewards.pid_available')}
                </Text>
                <Text fontSize="lg" fontWeight="bold" color="white">
                  {formatCompactNumber(pidWithdrawable)}
                </Text>
                <Text fontSize="xs" color="white">
                  {t('rewards.no_fee')}
                </Text>
              </Box>

              {/* PIC 可提现（首次产出） */}
              <Box textAlign="center">
                <Text fontSize="xs" color="whiteAlpha.500" mb="1">
                  {t('rewards.pic_available')}
                </Text>
                <Text fontSize="lg" fontWeight="bold" color="white">
                  {formatCompactNumber(picWithdrawable)}
                </Text>
                <Text fontSize="xs" color="whiteAlpha.600">
                  3% {t('rewards.fee_label')}
                </Text>
              </Box>

              {/* PIC 已释放（线性释放） */}
              <Box textAlign="center">
                <Text fontSize="xs" color="whiteAlpha.500" mb="1">
                  {t('rewards.pic_released')}
                </Text>
                <Text fontSize="lg" fontWeight="bold" color="white">
                  {formatCompactNumber(picReleased)}
                </Text>
                <Text fontSize="xs" color="white">
                  {t('rewards.no_fee')}
                </Text>
              </Box>

              {/* USDT/USDC 兑换余额 */}
              {stablecoinSwap > 0 && (
                <Box textAlign="center">
                  <Text fontSize="xs" color="whiteAlpha.500" mb="1">
                    {t('rewards.stablecoin_swap_balance')}
                  </Text>
                  <Text fontSize="lg" fontWeight="bold" color="white">
                    {formatCompactNumber(stablecoinSwap)}
                  </Text>
                  <Text fontSize="xs" color="white">
                    {t('rewards.no_fee')}
                  </Text>
                </Box>
              )}
            </SimpleGrid>

            <ActionButton
              variant="primary"
              w="full"
              onClick={handleOpenModal}
              disabled={!hasWithdrawable}
            >
              <HStack gap={2}>
                <HiOutlineBanknotes size={20} />
                <Text>{t('rewards.withdraw_now')}</Text>
              </HStack>
            </ActionButton>
          </MotionBox>
        </GradientBorderCard>

        {/* rewards.earnings_details */}
        <Box>
          <Text fontSize="sm" fontWeight="600" color="whiteAlpha.600" mb="3">
            {t('rewards.earnings_details')}
          </Text>
          <VStack gap={2}>
            {/* 静态收益 */}
            <RewardTypeCard
              type="static"
              amount={earningsStats?.totalStaticEarned || 0}
              todayAmount={earningsStats?.todayStaticEarned || 0}
              delay={0.15}
              onClick={() => navigate('/rewards/static')}
            />

            {/* 推荐奖励 */}
            <RewardTypeCard
              type="referral"
              amount={earningsStats?.totalReferralEarned || 0}
              todayAmount={earningsStats?.todayReferralEarned || 0}
              delay={0.2}
              onClick={() => navigate('/rewards/referral')}
            />

            {/* 节点级差 */}
            <RewardTypeCard
              type="node"
              amount={earningsStats?.totalNodeEarned || 0}
              todayAmount={earningsStats?.todayNodeEarned || 0}
              delay={0.25}
              onClick={() => navigate('/rewards/node')}
            />

            {/* 平级奖励 */}
            <RewardTypeCard
              type="same_level"
              amount={earningsStats?.totalSameLevelEarned || 0}
              todayAmount={earningsStats?.todaySameLevelEarned || 0}
              delay={0.3}
              onClick={() => navigate('/rewards/same_level')}
            />

            {/* 全网分成 */}
            <RewardTypeCard
              type="global"
              amount={earningsStats?.totalGlobalEarned || 0}
              todayAmount={earningsStats?.todayGlobalEarned || 0}
              delay={0.35}
              onClick={() => navigate('/rewards/global')}
            />
          </VStack>
        </Box>

        {/* 底部间距 */}
        <Box h="24" />
      </VStack>

      {/* 提现输入弹窗 */}
      {showWithdrawModal && (
        <Box
          position="fixed"
          inset={0}
          bg="blackAlpha.800"
          zIndex={100}
          display="flex"
          alignItems="flex-end"
          onClick={() => setShowWithdrawModal(false)}
        >
          <MotionBox
            w="full"
            bg="#17171C"
            borderTopRadius="2xl"
            p="5"
            pb="8"
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            transition={{ type: 'spring', damping: 25 }}
            onClick={(e) => e.stopPropagation()}
          >
            <Text fontSize="lg" fontWeight="bold" color="white" mb="4">
              {t('rewards.withdraw_title')}
            </Text>

            {/* 代币类型选择 - 只显示余额大于 0 的选项 */}
            {availableTokenTypes.length > 1 && (
              <Flex gap={2} mb="4" flexWrap="wrap">
                {availableTokenTypes.map((token) => (
                  <Box
                    key={token.type}
                    px="4"
                    py="2"
                    borderRadius="lg"
                    cursor="pointer"
                    bg={selectedTokenType === token.type ? 'rgba(255, 255, 255, 0.15)' : 'whiteAlpha.100'}
                    border="1px solid"
                    borderColor={selectedTokenType === token.type ? 'whiteAlpha.400' : 'transparent'}
                    onClick={() => {
                      setSelectedTokenType(token.type)
                      setWithdrawAmount('')
                    }}
                  >
                    <Text fontSize="sm" fontWeight="500" color="white">
                      {token.label}
                    </Text>
                    <Text fontSize="xs" color="whiteAlpha.600">
                      {token.balance.toFixed(2)}
                    </Text>
                  </Box>
                ))}
              </Flex>
            )}

            {/* 输入框 */}
            <Box mb="4">
              <Flex justify="space-between" mb="2">
                <Text fontSize="sm" color="whiteAlpha.600">{t('rewards.withdraw_amount')}</Text>
                <Text
                  fontSize="sm"
                  color="#8A8A90"
                  cursor="pointer"
                  onClick={() => setWithdrawAmount(availableBalance.toString())}
                >
                  {t('rewards.all')} {availableBalance.toFixed(2)}
                </Text>
              </Flex>
              <Input
                type="number"
                placeholder={t('rewards.enter_withdraw_amount')}
                value={withdrawAmount}
                onChange={(e) => setWithdrawAmount(e.target.value)}
                bg="whiteAlpha.50"
                border="1px solid"
                borderColor="whiteAlpha.200"
                borderRadius="xl"
                color="white"
                fontSize="lg"
                h="12"
                px="4"
                _placeholder={{ color: 'whiteAlpha.400', paddingLeft: '16px' }}
                _focus={{
                  borderColor: 'whiteAlpha.600',
                  boxShadow: '0 0 0 1px rgba(255, 255, 255, 0.5)',
                }}
              />
            </Box>

            {/* 提现预估 - 根据代币类型显示不同信息 */}
            {withdrawTokenAmount > 0 && (
              <Box bg="whiteAlpha.50" borderRadius="lg" p="3" mb="4">
                <VStack gap={2} align="stretch">
                  {/* PIC (首次产出) - 有手续费，80% 即时 + 20% 线性 */}
                  {selectedTokenType === 'PIC' && (
                    <>
                      <Flex justify="space-between" align="center">
                        <Text fontSize="sm" color="whiteAlpha.600">{t('rewards.withdraw_fee')}</Text>
                        <Text fontSize="sm" color="whiteAlpha.600">
                          -{(withdrawTokenAmount * 0.03).toFixed(2)} PIC
                        </Text>
                      </Flex>
                      <Flex justify="space-between" align="center">
                        <Text fontSize="sm" color="whiteAlpha.600">{t('rewards.instant_release')}</Text>
                        <Text fontSize="sm" fontWeight="bold" color="white">
                          {(withdrawTokenAmount * 0.97 * 0.8).toFixed(2)} PIC
                        </Text>
                      </Flex>
                      <Flex justify="space-between" align="center">
                        <Text fontSize="sm" color="whiteAlpha.600">{t('rewards.linear_release')}</Text>
                        <Text fontSize="sm" color="whiteAlpha.400">
                          {(withdrawTokenAmount * 0.97 * 0.2).toFixed(2)} PIC
                        </Text>
                      </Flex>
                    </>
                  )}

                  {/* PID / PIC 已释放 / USDT_USDC - 无手续费，100% 即时到账 */}
                  {(selectedTokenType === 'PID' || selectedTokenType === 'PIC_RELEASED' || selectedTokenType === 'USDT_USDC') && (
                    <>
                      <Flex justify="space-between" align="center">
                        <HStack gap={2}>
                          <Text fontSize="sm" color="whiteAlpha.600">{t('rewards.instant_arrival')}</Text>
                          <Text fontSize="xs" color="white">({t('rewards.no_fee')})</Text>
                        </HStack>
                        <Text fontSize="lg" fontWeight="bold" color="white">
                          {withdrawTokenAmount.toFixed(2)} {selectedTokenType === 'PIC_RELEASED' ? 'PIC' : selectedTokenType === 'USDT_USDC' ? 'USDT' : 'PID'}
                        </Text>
                      </Flex>
                    </>
                  )}
                </VStack>
              </Box>
            )}

            {/* 提现按钮 */}
            <ActionButton
              variant="primary"
              w="full"
              onClick={handleWithdraw}
              disabled={!withdrawTokenAmount || withdrawTokenAmount > availableBalance || isLoading}
            >
              {t('rewards.confirm_withdraw')}
            </ActionButton>
          </MotionBox>
        </Box>
      )}

      {/* 提现流程遮罩 */}
      <WithdrawOverlay
        step={step}
        statusText={getStatusText()}
        onClose={handleOverlayClose}
        onRetry={handleRetry}
      />
    </Box>
  )
}

// 收益类型卡片组件
function RewardTypeCard({
  type,
  amount,
  todayAmount,
  // description,
  delay = 0,
  onClick,
}: {
  type: RewardType
  amount: number
  todayAmount?: number
  // description: string
  delay?: number
  onClick?: () => void
}) {
  const { t } = useTranslation()

  return (
    <MotionBox
      w="full"
      bg="#17171C"
      borderRadius="xl"
      p="4"
      initial={{ opacity: 0, x: -10 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay }}
      cursor={onClick ? 'pointer' : 'default'}
      onClick={onClick}
      _hover={onClick ? { bg: '#1f1f26' } : undefined}
    >
      <Flex justify="space-between" align="center" mb="2">
        <HStack gap={2}>
          {REWARD_ICONS[type]}
          <Text fontSize="sm" fontWeight="medium" color="white">
            {t(`reward_type.${type}`)}
          </Text>
        </HStack>
        <HStack gap={2}>
          <Text fontSize="lg" fontWeight="bold" color="whiteAlpha.500">
            ${amount.toLocaleString(undefined, { minimumFractionDigits: 2 })}
          </Text>
          {onClick && (
            <Box color="whiteAlpha.400">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                <path d="M9 18L15 12L9 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </Box>
          )}
        </HStack>
      </Flex>
      <Flex justify="space-between" align="center">
        <Text fontSize="xs" color="whiteAlpha.500">
          {/* {description} */}
        </Text>
        {todayAmount !== undefined && todayAmount > 0 && (
          <Text fontSize="xs" color="white">
            {t('rewards.today_plus', { amount: todayAmount.toFixed(2) })}
          </Text>
        )}
      </Flex>
    </MotionBox>
  )
}
