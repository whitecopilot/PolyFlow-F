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
import {
  ActionButton,
  GradientBorderCard,
  PageHeader
} from '../components/common'
import { PAYFI_CONFIG, REWARD_TYPE_NAMES, getNodeConfig } from '../mocks/payfiConfig'
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
  const navigate = useNavigate()
  const {
    userAssets,
    priceInfo,
    earningsStats,
    teamStats,
    withdraw,
    fetchEarningsStats,
  } = usePayFiStore()

  const [withdrawAmount, setWithdrawAmount] = useState('')
  const [isProcessing, setIsProcessing] = useState(false)
  const [showWithdrawModal, setShowWithdrawModal] = useState(false)

  useEffect(() => {
    fetchEarningsStats()
  }, [fetchEarningsStats])

  // 计算提现预估
  const withdrawPicAmount = parseFloat(withdrawAmount) || 0
  const withdrawUsdtValue = withdrawPicAmount * (priceInfo?.picPrice || 0)
  const withdrawFee = withdrawUsdtValue * PAYFI_CONFIG.WITHDRAW_FEE_RATE
  const netAmount = withdrawUsdtValue - withdrawFee
  const instantAmount = netAmount * PAYFI_CONFIG.INSTANT_RELEASE_RATE
  const linearAmount = netAmount * (1 - PAYFI_CONFIG.INSTANT_RELEASE_RATE)

  // 处理提现
  const handleWithdraw = async () => {
    if (!withdrawAmount || isProcessing) return

    setIsProcessing(true)
    try {
      const amount = parseFloat(withdrawAmount)
      const success = await withdraw(amount)
      if (success) {
        setWithdrawAmount('')
        setShowWithdrawModal(false)
      }
    } finally {
      setIsProcessing(false)
    }
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
  const nodeConfig = getNodeConfig(teamStats?.nodeLevel || 'P0')

  return (
    <Box minH="100vh" bg="black">
      <PageHeader title="我的收益" />

      <VStack gap="5" p="4" align="stretch">
        {/* 收益总览卡片 */}
        <GradientBorderCard glowIntensity="high">
          <MotionBox
            p="5"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            {/* 标题行带提现记录入口 */}
            <Flex justify="space-between" align="center" mb="3">
              <Text fontSize="sm" color="whiteAlpha.600">
                累计收益
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
                <Text fontSize="xs">提现记录</Text>
              </Flex>
            </Flex>

            <Flex direction="column" align="center" mb="4">
              <Text fontSize="3xl" fontWeight="bold" color="white">
                ${totalEarnings.toLocaleString(undefined, { minimumFractionDigits: 2 })}
              </Text>
              <HStack gap={2} mt="2">
                <Text fontSize="sm" color="whiteAlpha.500">
                  可提现:
                </Text>
                <Text fontSize="sm" fontWeight="bold" color="#22C55E">
                  {userAssets?.picBalance.toFixed(2) || '0.00'} PIC
                </Text>
              </HStack>
            </Flex>

            <ActionButton
              variant="primary"
              w="full"
              onClick={() => setShowWithdrawModal(true)}
              disabled={(userAssets?.picBalance || 0) <= 0}
            >
              <HStack gap={2}>
                <HiOutlineBanknotes size={20} />
                <Text>立即提取</Text>
              </HStack>
            </ActionButton>
          </MotionBox>
        </GradientBorderCard>

        {/* 节点等级信息 */}
        {/* <MotionBox
          bg="#17171C"
          borderRadius="xl"
          p="4"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <Flex justify="space-between" align="center">
            <HStack gap={3}>
              <NodeBadge level={teamStats?.nodeLevel || 'P0'} size="lg" showName />
            </HStack>
            <VStack align="end" gap={0}>
              <Text fontSize="sm" color="white">
                级差 {nodeConfig.sharePercent}%
              </Text>
              <Text fontSize="xs" color="whiteAlpha.500">
                全网 {nodeConfig.globalSharePercent}%
              </Text>
            </VStack>
          </Flex>
        </MotionBox> */}

        {/* 收益明细 */}
        <Box>
          <Text fontSize="sm" fontWeight="600" color="whiteAlpha.600" mb="3">
            收益明细
          </Text>
          <VStack gap={2}>
            {/* 静态收益 */}
            <RewardTypeCard
              type="static"
              amount={earningsStats?.totalStaticEarned || 0}
              todayAmount={earningsStats?.todayEarnings || 0}
              description="基于算力的每日挖矿收益"
              delay={0.15}
              onClick={() => navigate('/rewards/static')}
            />

            {/* 推荐奖励 */}
            <RewardTypeCard
              type="referral"
              amount={earningsStats?.totalReferralEarned || 0}
              description={`一代 ${PAYFI_CONFIG.REFERRAL_L1_RATE * 100}% · 二代 ${PAYFI_CONFIG.REFERRAL_L2_RATE * 100}%`}
              delay={0.2}
              onClick={() => navigate('/rewards/referral')}
            />

            {/* 节点级差 */}
            <RewardTypeCard
              type="node"
              amount={earningsStats?.totalNodeEarned || 0}
              description={`当前等级 ${teamStats?.nodeLevel || 'P0'} 分成 ${nodeConfig.sharePercent}%`}
              delay={0.25}
              onClick={() => navigate('/rewards/node')}
            />

            {/* 平级奖励 */}
            <RewardTypeCard
              type="same_level"
              amount={earningsStats?.totalSameLevelEarned || 0}
              description={`同级下级节点奖励的 ${PAYFI_CONFIG.SAME_LEVEL_RATE * 100}%`}
              delay={0.3}
              onClick={() => navigate('/rewards/same_level')}
            />

            {/* 全网分成 */}
            <RewardTypeCard
              type="global"
              amount={earningsStats?.totalGlobalEarned || 0}
              description={`全网手续费加权分成 ${nodeConfig.globalSharePercent}%`}
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
              提现 PIC
            </Text>

            {/* 输入框 */}
            <Box mb="4">
              <Flex justify="space-between" mb="2">
                <Text fontSize="sm" color="whiteAlpha.600">提现数量</Text>
                <Text
                  fontSize="sm"
                  color="#D811F0"
                  cursor="pointer"
                  onClick={() => setWithdrawAmount(userAssets?.picBalance.toString() || '')}
                >
                  全部 {userAssets?.picBalance.toFixed(2)}
                </Text>
              </Flex>
              <Input
                type="number"
                placeholder="输入提现数量"
                value={withdrawAmount}
                onChange={(e) => setWithdrawAmount(e.target.value)}
                bg="whiteAlpha.50"
                border="1px solid"
                borderColor="whiteAlpha.200"
                borderRadius="xl"
                color="white"
                fontSize="lg"
                h="12"
                _placeholder={{ color: 'whiteAlpha.400' }}
                _focus={{
                  borderColor: '#D811F0',
                  boxShadow: '0 0 0 1px #D811F0',
                }}
              />
            </Box>

            {/* 提现预估 */}
            {withdrawPicAmount > 0 && (
              <Box bg="whiteAlpha.50" borderRadius="lg" p="3" mb="4">
                <SimpleGrid columns={2} gap={3}>
                  <Box>
                    <Text fontSize="xs" color="whiteAlpha.500">提现价值</Text>
                    <Text fontSize="sm" color="white">${withdrawUsdtValue.toFixed(2)}</Text>
                  </Box>
                  <Box>
                    <Text fontSize="xs" color="whiteAlpha.500">手续费 (3%)</Text>
                    <Text fontSize="sm" color="red.400">-${withdrawFee.toFixed(2)}</Text>
                  </Box>
                  <Box>
                    <Text fontSize="xs" color="whiteAlpha.500">即时到账 (80%)</Text>
                    <Text fontSize="sm" color="#22C55E">${instantAmount.toFixed(2)}</Text>
                  </Box>
                  <Box>
                    <Text fontSize="xs" color="whiteAlpha.500">线性释放 (20%)</Text>
                    <Text fontSize="sm" color="#EAB308">${linearAmount.toFixed(2)}</Text>
                  </Box>
                </SimpleGrid>
                <Text fontSize="xs" color="whiteAlpha.400" mt="2">
                  线性部分将在 {PAYFI_CONFIG.LINEAR_RELEASE_DAYS} 天内逐步释放
                </Text>
              </Box>
            )}

            {/* 提现按钮 */}
            <ActionButton
              variant="primary"
              w="full"
              onClick={handleWithdraw}
              disabled={!withdrawPicAmount || withdrawPicAmount > (userAssets?.picBalance || 0) || isProcessing}
            >
              {isProcessing ? '处理中...' : '确认提现'}
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
  description,
  delay = 0,
  onClick,
}: {
  type: RewardType
  amount: number
  todayAmount?: number
  description: string
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
            {REWARD_TYPE_NAMES[type]}
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
          {description}
        </Text>
        {todayAmount !== undefined && todayAmount > 0 && (
          <Text fontSize="xs" color="#22C55E">
            今日 +${todayAmount.toFixed(2)}
          </Text>
        )}
      </Flex>
    </MotionBox>
  )
}
