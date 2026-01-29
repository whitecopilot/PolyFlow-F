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
import { useNavigate } from 'react-router-dom'
import {
  ActionButton,
  GradientBorderCard,
  PageHeader
} from '../components/common'
import { getRewardTypeName } from '../mocks/payfiConfig'
import { usePayFiStore } from '../stores/payfiStore'
import type { RewardType } from '../types/payfi'

const MotionBox = motion.create(Box)

// 奖励类型图标映射
const REWARD_ICONS: Record<RewardType, React.ReactNode> = {
  static: <HiOutlineBolt size={18} color="#292FE1" />,
  referral: <HiOutlineUserGroup size={18} color="#D811F0" />,
  node: <HiOutlineBuildingLibrary size={18} color="#22C55E" />,
  same_level: <HiOutlineScale size={18} color="#EAB308" />,
  global: <HiOutlineGlobeAlt size={18} color="#06B6D4" />,
}

export function RewardsPage() {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const {
    userAssets,
    priceInfo,
    earningsStats,
    withdraw,
    fetchEarningsStats,
    fetchUserAssets,
    fetchPriceInfo,
  } = usePayFiStore()

  const [withdrawAmount, setWithdrawAmount] = useState('')
  const [isProcessing, setIsProcessing] = useState(false)
  const [showWithdrawModal, setShowWithdrawModal] = useState(false)

  // Phase 1: 只支持 PID 提现，不支持 PIC

  useEffect(() => {
    // 只获取收益页面需要的数据
    fetchEarningsStats()
    fetchUserAssets()
    fetchPriceInfo()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // 计算提现预估 - 根据不同类型和来源
  const withdrawTokenAmount = parseFloat(withdrawAmount) || 0

  // Phase 1: 只支持 PID 提现
  const getAvailableBalance = () => {
    if (!userAssets) return 0
    // Phase 1: 只返回 PID 可用余额
    return userAssets.pidBalance || 0
  }

  const availableBalance = getAvailableBalance()

  // Phase 1: PID 提现，使用 PID 价格
  const withdrawUsdtValue = withdrawTokenAmount * (priceInfo?.pidPrice || 0)

  // Phase 1: PID 提现无手续费，100% 到账
  const hasFee = false
  const instantAmount = withdrawUsdtValue
  const linearAmount = 0

  // 处理提现 - Phase 1 只支持 PID
  const handleWithdraw = async () => {
    if (!withdrawAmount || isProcessing) return

    setIsProcessing(true)
    try {
      const amount = parseFloat(withdrawAmount)
      // Phase 1: 只支持 PID 提现
      const success = await withdraw(amount, 'PID')
      if (success) {
        setWithdrawAmount('')
        setShowWithdrawModal(false)
      }
    } finally {
      setIsProcessing(false)
    }
  }

  // 打开提现弹窗
  const handleOpenModal = () => {
    setWithdrawAmount('')
    setShowWithdrawModal(true)
  }

  // 总收益（添加 || 0 防止 NaN）
  const totalEarnings = earningsStats
    ? (earningsStats.totalStaticEarned || 0) +
      (earningsStats.totalReferralEarned || 0) +
      (earningsStats.totalNodeEarned || 0) +
      (earningsStats.totalSameLevelEarned || 0) +
      (earningsStats.totalGlobalEarned || 0)
    : 0

  // 三种可提现余额
  const pidWithdrawable = userAssets?.pidBalance || 0
  const picWithdrawable = userAssets?.picBalance || 0
  const picReleased = userAssets?.picReleasedBalance || 0
  const hasWithdrawable = pidWithdrawable > 0 || picWithdrawable > 0 || picReleased > 0

  // 节点配置
  // const nodeConfig = getNodeConfig(teamStats?.nodeLevel || 'P0')

  return (
    <Box minH="100vh" bg="black">
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

            {/* 累计收益金额 */}
            <Text fontSize="2xl" fontWeight="bold" color="white" textAlign="center" mb="4">
              ${totalEarnings.toLocaleString(undefined, { minimumFractionDigits: 2 })}
            </Text>

            {/* 三列可提现余额 */}
            <SimpleGrid columns={3} gap={3} mb="4">
              {/* PID 可提现 */}
              <Box textAlign="center">
                <Text fontSize="xs" color="whiteAlpha.500" mb="1">
                  {t('rewards.pid_available')}
                </Text>
                <Text fontSize="lg" fontWeight="bold" color="white">
                  {pidWithdrawable.toFixed(2)}
                </Text>
                <Text fontSize="xs" color="#22C55E">
                  {t('rewards.no_fee')}
                </Text>
              </Box>

              {/* PIC 可提现（首次产出） */}
              <Box textAlign="center">
                <Text fontSize="xs" color="whiteAlpha.500" mb="1">
                  {t('rewards.pic_available')}
                </Text>
                <Text fontSize="lg" fontWeight="bold" color="white">
                  {picWithdrawable.toFixed(2)}
                </Text>
                <Text fontSize="xs" color="#EAB308">
                  3% {t('rewards.withdraw_fee').replace(' (3%)', '')}
                </Text>
              </Box>

              {/* PIC 已释放（线性释放） */}
              <Box textAlign="center">
                <Text fontSize="xs" color="whiteAlpha.500" mb="1">
                  {t('rewards.pic_released')}
                </Text>
                <Text fontSize="lg" fontWeight="bold" color="white">
                  {picReleased.toFixed(2)}
                </Text>
                <Text fontSize="xs" color="#22C55E">
                  {t('rewards.no_fee')}
                </Text>
              </Box>
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
              todayAmount={earningsStats?.todayEarnings || 0}
              // description="基于算力的每日挖矿收益"
              delay={0.15}
              onClick={() => navigate('/rewards/static')}
            />

            {/* 推荐奖励 */}
            <RewardTypeCard
              type="referral"
              amount={earningsStats?.totalReferralEarned || 0}
              // description={`一代 ${PAYFI_CONFIG.REFERRAL_L1_RATE * 100}% · 二代 ${PAYFI_CONFIG.REFERRAL_L2_RATE * 100}%`}
              delay={0.2}
              onClick={() => navigate('/rewards/referral')}
            />

            {/* 节点级差 */}
            <RewardTypeCard
              type="node"
              amount={earningsStats?.totalNodeEarned || 0}
              // description={`当前等级 ${teamStats?.nodeLevel || 'P0'} 分成 ${nodeConfig.sharePercent}%`}
              delay={0.25}
              onClick={() => navigate('/rewards/node')}
            />

            {/* 平级奖励 */}
            <RewardTypeCard
              type="same_level"
              amount={earningsStats?.totalSameLevelEarned || 0}
              // description={`同级下级节点奖励的 ${PAYFI_CONFIG.SAME_LEVEL_RATE * 100}%`}
              delay={0.3}
              onClick={() => navigate('/rewards/same_level')}
            />

            {/* 全网分成 */}
            <RewardTypeCard
              type="global"
              amount={earningsStats?.totalGlobalEarned || 0}
              // description={`全网手续费加权分成 ${nodeConfig.globalSharePercent}%`}
              delay={0.35}
              onClick={() => navigate('/rewards/global')}
            />
          </VStack>
        </Box>

        {/* 底部间距 */}
        <Box h="24" />
      </VStack>

      {/* 提现弹窗 */}
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
              {t('rewards.withdraw_pid')}
            </Text>

            {/* Phase 1: Token 类型选择已禁用，只支持 PID */}
            <Box
              bg="rgba(41, 47, 225, 0.1)"
              borderRadius="lg"
              p="3"
              mb="4"
            >
              <Text fontSize="xs" color="whiteAlpha.600">
                {t('rewards.phase1_pid_only')}
              </Text>
            </Box>

            {/* 输入框 */}
            <Box mb="4">
              <Flex justify="space-between" mb="2">
                <Text fontSize="sm" color="whiteAlpha.600">{t('rewards.withdraw_amount')}</Text>
                <Text
                  fontSize="sm"
                  color="#D811F0"
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
                  borderColor: '#D811F0',
                  boxShadow: '0 0 0 1px #D811F0',
                }}
              />
            </Box>

            {/* 提现预估 */}
            {withdrawTokenAmount > 0 && (
              <Box bg="whiteAlpha.50" borderRadius="lg" p="3" mb="4">
                <SimpleGrid columns={2} gap={3}>
                  <Box>
                    <Text fontSize="xs" color="whiteAlpha.500">{t('rewards.withdraw_value')}</Text>
                    <Text fontSize="sm" color="white">${withdrawUsdtValue.toFixed(2)}</Text>
                  </Box>

                  {hasFee ? (
                    <Box>
                      <Text fontSize="xs" color="whiteAlpha.500">{t('rewards.withdraw_fee')}</Text>
                      <Text fontSize="sm" color="red.400">-{(withdrawUsdtValue * 0.03).toFixed(2)} USDT</Text>
                    </Box>
                  ) : (
                    <Box>
                      <Text fontSize="xs" color="whiteAlpha.500">{t('rewards.withdraw_fee')}</Text>
                      <Text fontSize="sm" color="#22C55E">{t('rewards.no_fee')}</Text>
                    </Box>
                  )}

                  <Box>
                    <Text fontSize="xs" color="whiteAlpha.500">{t('rewards.instant_release')}</Text>
                    <Text fontSize="sm" color="#22C55E">${instantAmount.toFixed(2)} USDT</Text>
                  </Box>

                  {linearAmount > 0 ? (
                    <Box>
                      <Text fontSize="xs" color="whiteAlpha.500">{t('rewards.linear_release')}</Text>
                      <Text fontSize="sm" color="#EAB308">${linearAmount.toFixed(2)} USDT</Text>
                    </Box>
                  ) : (
                    <Box>
                      <Text fontSize="xs" color="whiteAlpha.500">{t('rewards.linear_release')}</Text>
                      <Text fontSize="sm" color="#22C55E">{t('rewards.full_release')}</Text>
                    </Box>
                  )}
                </SimpleGrid>

                {/* Phase 1: PID 提现无线性释放说明 */}
              </Box>
            )}

            {/* 提现按钮 */}
            <ActionButton
              variant="primary"
              w="full"
              onClick={handleWithdraw}
              disabled={!withdrawTokenAmount || withdrawTokenAmount > availableBalance || isProcessing}
            >
              {isProcessing ? t('common.processing') : t('rewards.confirm_withdraw')}
            </ActionButton>
          </MotionBox>
        </Box>
      )}
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
            {getRewardTypeName(type)}
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
          <Text fontSize="xs" color="#22C55E">
            today +${todayAmount.toFixed(2)}
          </Text>
        )}
      </Flex>
    </MotionBox>
  )
}
