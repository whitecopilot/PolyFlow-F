// 收益页面 - 收益矩阵

import { Box, Flex, HStack, Input, SimpleGrid, Text, VStack } from '@chakra-ui/react'
import { motion } from 'framer-motion'
import { useEffect, useState } from 'react'
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
import { useTranslation } from 'react-i18next'
import {
  ActionButton,
  GradientBorderCard,
  PageHeader
} from '../components/common'
import { PAYFI_CONFIG, getRewardTypeName } from '../mocks/payfiConfig'
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

const REWARD_COLORS: Record<RewardType, string> = {
  static: '#292FE1',
  referral: '#D811F0',
  node: '#22C55E',
  same_level: '#EAB308',
  global: '#06B6D4',
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
  } = usePayFiStore()

  const [withdrawAmount, setWithdrawAmount] = useState('')
  const [isProcessing, setIsProcessing] = useState(false)
  const [showWithdrawModal, setShowWithdrawModal] = useState(false)

  // 新增：Token 类型和来源选择
  const [tokenType, setTokenType] = useState<'PIC' | 'PID'>('PIC')
  const [withdrawSource, setWithdrawSource] = useState<'balance' | 'released'>('balance')

  useEffect(() => {
    fetchEarningsStats()
  }, [fetchEarningsStats])

  // 计算提现预估 - 根据不同类型和来源
  const withdrawTokenAmount = parseFloat(withdrawAmount) || 0

  // 获取可用余额
  const getAvailableBalance = () => {
    if (!userAssets) return 0
    if (tokenType === 'PIC') {
      if (withdrawSource === 'balance') {
        return userAssets.picBalance || 0
      } else {
        // 释放余额从提现记录的线性释放部分计算
        return 0 // 简化处理，实际应从 withdrawRecords 计算
      }
    } else {
      return userAssets.pidBalance || 0
    }
  }

  const availableBalance = getAvailableBalance()

  // 计算价值和费用
  const withdrawUsdtValue = withdrawTokenAmount * (tokenType === 'PIC' ? (priceInfo?.picPrice || 0) : (priceInfo?.pidPrice || 0))

  // 计算手续费和到账金额
  let hasFee = false
  let instantAmount = 0
  let linearAmount = 0

  if (tokenType === 'PIC' && withdrawSource === 'balance') {
    // PIC 余额提现：有手续费，80% 立即 + 20% 线性
    hasFee = true
    const feeRate = 0.03
    const fee = withdrawUsdtValue * feeRate
    const netAmount = withdrawUsdtValue - fee
    instantAmount = netAmount * 0.80
    linearAmount = netAmount * 0.20
  } else {
    // PID 提现或 PIC 释放提现：无手续费，100% 到账
    hasFee = false
    instantAmount = withdrawUsdtValue
    linearAmount = 0
  }

  // 处理提现
  const handleWithdraw = async () => {
    if (!withdrawAmount || isProcessing) return

    setIsProcessing(true)
    try {
      const amount = parseFloat(withdrawAmount)
      // 注意：这里需要调用后端 API，传递 tokenType 和 source 参数
      // 暂时使用现有的 withdraw 方法，只支持 PIC
      const success = await withdraw(amount)
      if (success) {
        setWithdrawAmount('')
        setShowWithdrawModal(false)
      }
    } finally {
      setIsProcessing(false)
    }
  }

  // 重置选择
  const handleOpenModal = () => {
    setWithdrawAmount('')
    setTokenType('PIC')
    setWithdrawSource('balance')
    setShowWithdrawModal(true)
  }

  // 总收益
  const totalEarnings = earningsStats
    ? earningsStats.totalStaticEarned +
      earningsStats.totalReferralEarned +
      earningsStats.totalNodeEarned +
      earningsStats.totalSameLevelEarned +
      earningsStats.totalGlobalEarned
    : 0

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

            <Flex direction="column" align="center" mb="4">
              <Text fontSize="3xl" fontWeight="bold" color="white">
                ${totalEarnings.toLocaleString(undefined, { minimumFractionDigits: 2 })}
              </Text>
              <HStack gap={2} mt="2">
                <Text fontSize="sm" color="whiteAlpha.500">
                  {t('rewards.withdrawable')}
                </Text>
                <Text fontSize="sm" fontWeight="bold" color="#22C55E">
                  {userAssets?.picBalance.toFixed(2) || '0.00'} PIC
                </Text>
              </HStack>
            </Flex>

            <ActionButton
              variant="primary"
              w="full"
              onClick={handleOpenModal}
              disabled={(userAssets?.picBalance || 0) <= 0}
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
              {tokenType === 'PIC' ? t('rewards.withdraw_pic') : t('rewards.withdraw_pid')}
            </Text>

            {/* Token 类型选择 */}
            <HStack gap="2" mb="4">
              <TokenSelector
                active={tokenType === 'PIC'}
                onClick={() => {
                  setTokenType('PIC')
                  setWithdrawSource('balance')
                  setWithdrawAmount('')
                }}
                label="PIC"
              />
              <TokenSelector
                active={tokenType === 'PID'}
                onClick={() => {
                  setTokenType('PID')
                  setWithdrawAmount('')
                }}
                label="PID"
              />
            </HStack>

            {/* 来源选择 - 仅 PIC 时显示 */}
            {tokenType === 'PIC' && (
              <HStack gap="2" mb="4">
                <SourceSelector
                  active={withdrawSource === 'balance'}
                  onClick={() => {
                    setWithdrawSource('balance')
                    setWithdrawAmount('')
                  }}
                  label={t('rewards.source_balance')}
                />
                <SourceSelector
                  active={withdrawSource === 'released'}
                  onClick={() => {
                    setWithdrawSource('released')
                    setWithdrawAmount('')
                  }}
                  label={t('rewards.source_released')}
                />
              </HStack>
            )}

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

                {tokenType === 'PIC' && withdrawSource === 'balance' && (
                  <Text fontSize="xs" color="whiteAlpha.400" mt="2">
                    {t('rewards.linear_release_notice')} {PAYFI_CONFIG.LINEAR_RELEASE_DAYS} {t('rewards.releases_days')}
                  </Text>
                )}
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

// Token 类型选择器
interface TokenSelectorProps {
  active: boolean
  onClick: () => void
  label: string
}

function TokenSelector({ active, onClick, label }: TokenSelectorProps) {
  return (
    <Box
      px="4"
      py="2"
      borderRadius="full"
      bg={active ? '#292FE1' : 'whiteAlpha.100'}
      color={active ? 'white' : 'whiteAlpha.600'}
      fontSize="sm"
      fontWeight="600"
      cursor="pointer"
      transition="all 0.2s"
      onClick={onClick}
      _hover={!active ? { bg: 'whiteAlpha.200' } : undefined}
    >
      {label}
    </Box>
  )
}

// 来源选择器
interface SourceSelectorProps {
  active: boolean
  onClick: () => void
  label: string
}

function SourceSelector({ active, onClick, label }: SourceSelectorProps) {
  return (
    <Box
      px="4"
      py="2"
      borderRadius="full"
      bg={active ? '#22C55E' : 'whiteAlpha.100'}
      color={active ? 'white' : 'whiteAlpha.600'}
      fontSize="sm"
      fontWeight="600"
      cursor="pointer"
      transition="all 0.2s"
      onClick={onClick}
      _hover={!active ? { bg: 'whiteAlpha.200' } : undefined}
    >
      {label}
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
          <Text fontSize="lg" fontWeight="bold" color={REWARD_COLORS[type]}>
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
