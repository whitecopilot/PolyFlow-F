// 资产页面 - 数字金库（一级页面）

import { Box, Button, Flex, HStack, Input, SimpleGrid, Text, VStack } from '@chakra-ui/react'
import { motion } from 'framer-motion'
import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import {
  HiOutlineArrowPath,
  HiOutlineBolt,
  HiOutlineCalendarDays,
  HiOutlineClipboardDocumentList,
  HiOutlineFire,
  HiOutlineLockClosed,
  HiOutlineShieldCheck,
} from 'react-icons/hi2'
import { useNavigate } from 'react-router-dom'
import {
  ActionButton,
  GradientBorderCard,
  PageHeader,
  PicLogo,
  PolyFlowLogo,
  ProgressBar,
} from '../components/common'
import { getNFTConfig, PAYFI_CONFIG } from '../mocks/payfiConfig'
import { usePayFiStore } from '../stores/payfiStore'

const MotionBox = motion.create(Box)

const STAKE_OPTIONS = [
  { id: 'm3', labelKey: 'assets.stake_period_m3', duration: 90, apy: 0.00, minAmount: 0 },
  { id: 'm6', labelKey: 'assets.stake_period_m6', duration: 180, apy: 0.00, minAmount: 0 },
  { id: 'm12', labelKey: 'assets.stake_period_m12', duration: 360, apy: 0.00, minAmount: 0 },
]

export function AssetsPage() {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const {
    userAssets,
    priceInfo,
    pidReleasePlans,
    burnPIC,
    fetchUserAssets,
    fetchPIDReleasePlans,
  } = usePayFiStore()

  const [burnAmount, setBurnAmount] = useState('')
  const [isProcessing, setIsProcessing] = useState(false)
  const [burnError, setBurnError] = useState<string | null>(null)

  // 质押相关状态
  const [stakeAmount, setStakeAmount] = useState('')
  const [selectedStakePeriod, setSelectedStakePeriod] = useState('m3')
  const [isStaking, setIsStaking] = useState(false)
  const [stakeError, setStakeError] = useState<string | null>(null)

  // 质押功能是否启用（由后端配置控制）
  const isStakingEnabled = userAssets?.featureFlags?.pidStakingEnabled ?? false

  useEffect(() => {
    fetchUserAssets()
    fetchPIDReleasePlans()
  }, [fetchUserAssets, fetchPIDReleasePlans])

  // 计算销毁预估
  const burnUsdtValue =
    burnAmount && priceInfo ? parseFloat(burnAmount) * priceInfo.picPrice : 0

  const isValidBurnAmount = burnUsdtValue > 0 && burnUsdtValue % 100 === 0

  const currentNFTConfig = getNFTConfig(userAssets?.currentNFTLevel || null)
  const burnMultiplier = currentNFTConfig?.burnExitMultiplier || 3.0

  const estimatedPowerAdded = isValidBurnAmount ? burnUsdtValue : 0
  const estimatedExitAdded = isValidBurnAmount ? burnUsdtValue * burnMultiplier : 0

  // 处理销毁
  const handleBurn = async () => {
    if (!burnAmount || !isValidBurnAmount || isProcessing) return

    setBurnError(null)
    setIsProcessing(true)

    try {
      const amount = parseFloat(burnAmount)
      const success = await burnPIC(amount)
      if (success) {
        setBurnAmount('')
      } else {
        setBurnError(t('assets.burn_failed'))
      }
    } catch {
      setBurnError(t('assets.burn_failed'))
    } finally {
      setIsProcessing(false)
    }
  }

  // 处理质押
  const currentStakeOption = STAKE_OPTIONS.find(o => o.id === selectedStakePeriod) || STAKE_OPTIONS[0]
  const isValidStakeAmount =
    stakeAmount &&
    !isNaN(parseFloat(stakeAmount)) &&
    parseFloat(stakeAmount) >= currentStakeOption.minAmount &&
    parseFloat(stakeAmount) <= (userAssets?.pidBalance || 0)

  const handleStake = async () => {
    if (!stakeAmount || !isValidStakeAmount || isStaking) return

    setStakeError(null)
    setIsStaking(true)

    try {
      // 模拟 API 调用
      await new Promise(resolve => setTimeout(resolve, 1000))
      setStakeAmount('')
      await fetchUserAssets()
    } catch {
      setStakeError(t('assets.stake_failed'))
    } finally {
      setIsStaking(false)
    }
  }

  // 快捷金额按钮
  const quickAmounts = [100, 500, 1000, 3000, 10000]

  return (
    <Box minH="100vh" bg="#111111">
      {/* 一级页面顶部导航 */}
      <PageHeader title={t('assets.title')} />

      <VStack gap="5" p="4" align="stretch">
        {/* PID 卡片 */}
        <GradientBorderCard glowIntensity="low" staticBorder>
          <Box p="4">
            <HStack justify="space-between" mb="3">
              <HStack gap={2}>
                <Box
                  w="7"
                  h="7"
                  borderRadius="full"
                  bg="white"
                  display="flex"
                  alignItems="center"
                  justifyContent="center"
                >
                  <PolyFlowLogo size={22} />
                </Box>
                <Text fontSize="md" fontWeight="600" color="white">
                  PID
                </Text>
              </HStack>
              <Text fontSize="xs" color="whiteAlpha.500">
                ${priceInfo?.pidPrice.toFixed(4) || '0.00'}
              </Text>
            </HStack>

            <SimpleGrid columns={3} gap={3} mb="4">
              <Box>
                <HStack gap={1} mb={1}>
                  <HiOutlineLockClosed size={12} color="#71717A" />
                  <Text fontSize="xs" color="whiteAlpha.500">
                    {t('assets.locked')}
                  </Text>
                </HStack>
                <Text fontSize="lg" fontWeight="bold" color="whiteAlpha.600">
                  {userAssets?.pidTotalLocked.toFixed(2) || '0.00'}
                </Text>
              </Box>
              <Box>
                <HStack gap={1} mb={1}>
                  <HiOutlineArrowPath size={12} color="#8A8A90" />
                  <Text fontSize="xs" color="whiteAlpha.500">
                    {t('assets.released')}
                  </Text>
                </HStack>
                <Text fontSize="lg" fontWeight="bold" color="white">
                  {userAssets?.pidReleased.toFixed(2) || '0.00'}
                </Text>
              </Box>
              <Box>
                <HStack gap={1} mb={1}>
                  <Box
                    w="14px"
                    h="14px"
                    borderRadius="sm"
                    bg="white"
                    display="flex"
                    alignItems="center"
                    justifyContent="center"
                  >
                    <PolyFlowLogo size={10} />
                  </Box>
                  <Text fontSize="xs" color="whiteAlpha.500">
                    {t('assets.available')}
                  </Text>
                </HStack>
                <Text fontSize="lg" fontWeight="bold" color="white">
                  {userAssets?.pidBalance.toFixed(2) || '0.00'}
                </Text>
              </Box>
            </SimpleGrid>

            <Text fontSize="xs" color="whiteAlpha.400">
              ≈ $
              {(((userAssets?.pidTotalLocked || 0) + (userAssets?.pidBalance || 0)) * (priceInfo?.pidPrice || 0)).toFixed(2)}{' '}
              USDT
            </Text>
          </Box>
        </GradientBorderCard>

        {/* PIC 卡片 */}
        <GradientBorderCard glowIntensity="low" staticBorder>
          <Box p="4">
            <HStack justify="space-between" mb="3">
              <HStack gap={2}>
                <Box
                  w="7"
                  h="7"
                  borderRadius="full"
                  bg="white"
                  display="flex"
                  alignItems="center"
                  justifyContent="center"
                >
                  <PicLogo size={22} />
                </Box>
                <Text fontSize="md" fontWeight="600" color="white">
                  PIC
                </Text>
              </HStack>
              <Text fontSize="xs" color="whiteAlpha.500">
                ${priceInfo?.picPrice.toFixed(4) || '0.00'}
              </Text>
            </HStack>

            <SimpleGrid columns={3} gap={3} mb="4">
              <Box>
                <HStack gap={1} mb={1}>
                  <HiOutlineLockClosed size={12} color="#71717A" />
                  <Text fontSize="xs" color="whiteAlpha.500">
                    {t('assets.locked')}
                  </Text>
                </HStack>
                <Text fontSize="lg" fontWeight="bold" color="whiteAlpha.600">
                  {/* PIC 锁仓 = 总获取 - 可用 - 已释放 */}
                  0.00
                </Text>
              </Box>
              <Box>
                <HStack gap={1} mb={1}>
                  <HiOutlineArrowPath size={12} color="#8A8A90" />
                  <Text fontSize="xs" color="whiteAlpha.500">
                    {t('assets.released')}
                  </Text>
                </HStack>
                <Text fontSize="lg" fontWeight="bold" color="white">
                  {userAssets?.picReleasedBalance?.toFixed(2) || '0.00'}
                </Text>
              </Box>
              <Box>
                <HStack gap={1} mb={1}>
                  <Box
                    w="14px"
                    h="14px"
                    borderRadius="sm"
                    bg="white"
                    display="flex"
                    alignItems="center"
                    justifyContent="center"
                  >
                    <PicLogo size={10} />
                  </Box>
                  <Text fontSize="xs" color="whiteAlpha.500">
                    {t('assets.available')}
                  </Text>
                </HStack>
                <Text fontSize="lg" fontWeight="bold" color="white">
                  {userAssets?.picBalance?.toFixed(2) || '0.00'}
                </Text>
              </Box>
            </SimpleGrid>

            <Text fontSize="xs" color="whiteAlpha.400">
              ≈ $
              {(((userAssets?.picBalance || 0) + (userAssets?.picReleasedBalance || 0)) * (priceInfo?.picPrice || 0)).toFixed(2)}{' '}
              USDT
            </Text>
          </Box>
        </GradientBorderCard>

        {/* PID 释放计划 */}
        {pidReleasePlans.length > 0 && (
          <Box>
            <HStack gap={2} mb="3">
              <HiOutlineCalendarDays size={18} color="#8A8A90" />
              <Text fontSize="sm" fontWeight="600" color="whiteAlpha.600">
                {t('assets.pid_release_plans')}
              </Text>
            </HStack>

            {pidReleasePlans.map((plan, index) => (
              <MotionBox
                key={plan.id}
                bg="#17171C"
                borderRadius="xl"
                p="4"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.15 + index * 0.05 }}
              >
                <Flex justify="space-between" mb="3">
                  <Text fontSize="sm" color="whiteAlpha.700">
                    📅 {t('assets.release_progress')}
                  </Text>
                  <Text fontSize="sm" color="white" fontWeight="medium">
                    {plan.monthsCompleted}/{plan.monthsTotal} {t('assets.months')}
                  </Text>
                </Flex>

                <ProgressBar
                  value={plan.releasedAmount}
                  max={plan.totalAmount}
                  showPercentage
                  colorScheme="brand"
                  height={8}
                />

                <SimpleGrid columns={2} gap={3} mt="3">
                  <Box>
                    <Text fontSize="xs" color="whiteAlpha.500">
                      {t('assets.total_amount')}
                    </Text>
                    <Text fontSize="sm" fontWeight="medium" color="white">
                      {plan.totalAmount.toFixed(2)} PID
                    </Text>
                  </Box>
                  <Box>
                    <Text fontSize="xs" color="whiteAlpha.500">
                      {t('assets.released')}
                    </Text>
                    <Text fontSize="sm" fontWeight="medium" color="white">
                      {plan.releasedAmount.toFixed(2)} PID
                    </Text>
                  </Box>
                  <Box>
                    <Text fontSize="xs" color="whiteAlpha.500">
                      {t('assets.daily_release')}
                    </Text>
                    <Text fontSize="sm" fontWeight="medium" color="white">
                      {plan.dailyAmount.toFixed(4)} PID
                    </Text>
                  </Box>
                  <Box>
                    <Text fontSize="xs" color="whiteAlpha.500">
                      {t('assets.monthly_rate')}
                    </Text>
                    <Text fontSize="sm" fontWeight="medium" color="white">
                      {(PAYFI_CONFIG.PID_MONTHLY_RATE * 100).toFixed(0)}%
                    </Text>
                  </Box>
                </SimpleGrid>
              </MotionBox>
            ))}
          </Box>
        )}

        {/* PID 质押区域 */}
        <Box>
          <Flex justify="space-between" align="center" mb="3">
            <HStack gap={2}>
              <HiOutlineLockClosed size={18} color="#8A8A90" />
              <Text fontSize="sm" fontWeight="600" color="whiteAlpha.600">
                {t('assets.stake_pid_title')}
              </Text>
            </HStack>
            {/* 质押记录入口 */}
            <Flex
              align="center"
              gap="1"
              color="whiteAlpha.500"
              cursor="pointer"
              onClick={() => navigate('/stake-records')}
              _hover={{ color: '#5A5A60' }}
              transition="color 0.2s"
            >
              <HiOutlineClipboardDocumentList size={16} />
              <Text fontSize="xs">{t('assets.records')}</Text>
            </Flex>
          </Flex>

          <MotionBox
            bg="#17171C"
            borderRadius="xl"
            p="4"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.18 }}
          >
            {/* 周期选择 */}
            <HStack mb="4" bg="black" p="1" borderRadius="lg">
              {STAKE_OPTIONS.map((option) => (
                <Button
                  disabled={!isStakingEnabled}
                  key={option.id}
                  flex={1}
                  size="sm"
                  variant={selectedStakePeriod === option.id ? 'solid' : 'ghost'}
                  bg={selectedStakePeriod === option.id ? 'whiteAlpha.200' : 'transparent'}
                  color={selectedStakePeriod === option.id ? 'white' : 'whiteAlpha.500'}
                  _hover={{ bg: selectedStakePeriod === option.id ? 'whiteAlpha.200' : 'whiteAlpha.50' }}
                  onClick={() => setSelectedStakePeriod(option.id)}
                >
                  {t(option.labelKey)}
                </Button>
              ))}
            </HStack>

            {/* 输入框 */}
            <Box position="relative" mb="3">
              <Input
                disabled={!isStakingEnabled}
                type="number"
                min="0"
                placeholder={t('assets.enter_stake_amount')}
                value={stakeAmount}
                autoComplete="off"
                onChange={(e) => {
                  setStakeAmount(e.target.value)
                  setStakeError(null)
                }}
                bg="whiteAlpha.50"
                border="1px solid"
                borderColor="whiteAlpha.200"
                borderRadius="xl"
                color="white"
                fontSize="lg"
                h="12"
                pl="4"
                pr="20"
                _placeholder={{ color: 'whiteAlpha.400' }}
                _focus={{
                  borderColor: 'whiteAlpha.600',
                  boxShadow: '0 0 0 1px rgba(255, 255, 255, 0.5)',
                }}
              />
              <Button
                  disabled={!isStakingEnabled}
                  size="xs"
                position="absolute"
                right="3"
                top="50%"
                transform="translateY(-50%)"
                zIndex={2}
                bg="whiteAlpha.200"
                color="whiteAlpha.800"
                _hover={{ bg: 'whiteAlpha.300' }}
                onClick={() => setStakeAmount(userAssets?.pidBalance.toString() || '0')}
              >
                ALL
              </Button>
            </Box>

            <Flex justify="space-between" mb="4">
               <Text fontSize="xs" color="whiteAlpha.400">
                  {t('assets.available')}: {userAssets?.pidBalance.toFixed(2) || '0.00'} PID
               </Text>
            </Flex>

            {/* 信息展示 */}
            <Box mb="4">
              <HStack justify="space-between" mb="2">
                <Text fontSize="sm" color="whiteAlpha.600">
                   {t('assets.lock_period')}
                </Text>
                <Text fontSize="sm" color="white">
                  {currentStakeOption.duration} {t('assets.stake_days')}
                </Text>
              </HStack>
              <HStack justify="space-between">
                <Text fontSize="sm" color="whiteAlpha.600">
                   {t('assets.apy')}
                </Text>
                <Text fontSize="sm" color="white">
                  {(currentStakeOption.apy * 100).toFixed(0)}%
                </Text>
              </HStack>
            </Box>

             {/* 错误提示 */}
            {stakeError && (
              <Text fontSize="sm" color="red.400" mb="3">
                {stakeError}
              </Text>
            )}

            {/* 确认按钮 */}
            <ActionButton
              variant="primary"
              w="full"
              onClick={handleStake}
              disabled={!isStakingEnabled}
            >
              {isStaking ? t('assets.processing') : t('assets.confirm_stake')}
            </ActionButton>

             <Text fontSize="xs" color="whiteAlpha.400" textAlign="center" mt="2">
                {t('assets.min_stake_amount', { amount: currentStakeOption.minAmount })}
              </Text>

          </MotionBox>
        </Box>

        {/* PIC 销毁区域 */}
        <Box>
          <Flex justify="space-between" align="center" mb="3">
            <HStack gap={2}>
              <HiOutlineFire size={18} color="#8A8A90" />
              <Text fontSize="sm" fontWeight="600" color="whiteAlpha.600">
                {t('assets.burn_pic_title')}
              </Text>
            </HStack>
            {/* 销毁记录入口 */}
            <Flex
              align="center"
              gap="1"
              color="whiteAlpha.500"
              cursor="pointer"
              onClick={() => navigate('/burn-records')}
              _hover={{ color: '#5A5A60' }}
              transition="color 0.2s"
            >
              <HiOutlineClipboardDocumentList size={16} />
              <Text fontSize="xs">{t('assets.records')}</Text>
            </Flex>
          </Flex>

          <MotionBox
            bg="#17171C"
            borderRadius="xl"
            p="4"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            {/* 输入框 */}
            <Box mb="3">
              <Text fontSize="xs" color="whiteAlpha.500" mb="2">
                {t('assets.burn_amount_label')}
              </Text>
              <Input
                disabled={!isStakingEnabled}
                type="number"
                min="0"
                placeholder={t('assets.enter_burn_amount')}
                value={burnAmount}
                autoComplete="off"
                onChange={(e) => {
                  setBurnAmount(e.target.value)
                  setBurnError(null)
                }}
                bg="whiteAlpha.50"
                border="1px solid"
                borderColor="whiteAlpha.200"
                borderRadius="xl"
                color="white"
                fontSize="lg"
                h="12"
                pl="4"
                _placeholder={{ color: 'whiteAlpha.400' }}
                _focus={{
                  borderColor: 'whiteAlpha.600',
                  boxShadow: '0 0 0 1px rgba(255, 255, 255, 0.5)',
                }}
              />
              <Flex justify="space-between" mt="1">
                <Text fontSize="xs" color="whiteAlpha.400">
                  {t('assets.available')}: {userAssets?.picBalance.toFixed(2) || '0.00'} PIC
                </Text>
                {burnAmount && (
                  <Text
                    fontSize="xs"
                    color={isValidBurnAmount ? '#22C55E' : 'red.400'}
                  >
                    ≈ ${burnUsdtValue.toFixed(2)}{' '}
                    {!isValidBurnAmount && burnUsdtValue > 0 && `(${t('assets.must_be_100u')})`}
                  </Text>
                )}
              </Flex>
            </Box>

            {/* 快捷金额 */}
            <HStack gap={2} mb="4">
              {quickAmounts.map((amount) => {
                const picAmount = priceInfo ? amount / priceInfo.picPrice : 0
                return (
                  <ActionButton
                    key={amount}
                    variant="outline"
                    size="sm"
                    flex={1}
                    disabled={!isStakingEnabled}
                    onClick={() => setBurnAmount(picAmount.toFixed(2))}
                  >
                    ${amount}
                  </ActionButton>
                )
              })}
            </HStack>

            {/* 预估结果 */}
            {isValidBurnAmount && (
              <Box bg="rgba(216, 17, 240, 0.1)" borderRadius="lg" p="3" mb="4">
                <Text fontSize="xs" color="whiteAlpha.600" mb="2">
                  {t('assets.estimated_increase')}
                </Text>
                <SimpleGrid columns={2} gap={3}>
                  <HStack>
                    <HiOutlineBolt size={16} color="#8A8A90" />
                    <Box>
                      <Text fontSize="xs" color="whiteAlpha.500">
                        {t('assets.power')}
                      </Text>
                      <Text fontSize="md" fontWeight="bold" color="white">
                        +{estimatedPowerAdded.toLocaleString()}
                      </Text>
                    </Box>
                  </HStack>
                  <HStack>
                    <HiOutlineShieldCheck size={16} color="#8A8A90" />
                    <Box>
                      <Text fontSize="xs" color="whiteAlpha.500">
                        {t('assets.exit_limit')}
                      </Text>
                      <Text fontSize="md" fontWeight="bold" color="white">
                        +${estimatedExitAdded.toLocaleString()}
                      </Text>
                    </Box>
                  </HStack>
                </SimpleGrid>
                <Text fontSize="xs" color="whiteAlpha.400" mt="2">
                  {t('assets.current_level')} {userAssets?.currentNFTLevel || 'N/A'} {t('assets.burn_multiplier')}:{' '}
                  {burnMultiplier}x
                </Text>
              </Box>
            )}

            {/* 错误提示 */}
            {burnError && (
              <Text fontSize="sm" color="red.400" mb="3">
                {burnError}
              </Text>
            )}

            {/* 销毁按钮 */}
            <ActionButton
              variant="primary"
              w="full"
              onClick={handleBurn}
              disabled={!isStakingEnabled}
            >
              {isProcessing ? t('assets.processing') : t('assets.confirm_burn')}
            </ActionButton>

            {!userAssets?.currentNFTLevel && (
              <Text fontSize="xs" color="whiteAlpha.400" textAlign="center" mt="2">
                {t('assets.need_nft_to_burn')}
              </Text>
            )}
          </MotionBox>
        </Box>

        {/* 底部间距 */}
        <Box h="8" />
      </VStack>
    </Box>
  )
}
