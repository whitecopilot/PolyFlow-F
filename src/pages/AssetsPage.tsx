// 资产页面 - 数字金库（一级页面）

import { Box, Button, Flex, HStack, Input, SimpleGrid, Spinner, Text, VStack } from '@chakra-ui/react'
import { AnimatePresence, motion } from 'framer-motion'
import { CheckCircle } from '@phosphor-icons/react'
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
  HiOutlineXMark,
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
import { usePICBurn, type BurnStep } from '../hooks/usePICBurn'
import { usePayFiStore } from '../stores/payfiStore'

const MotionBox = motion.create(Box)

// 销毁进度蒙版组件
interface BurnOverlayProps {
  step: BurnStep
  statusText: string
  onClose?: () => void
}

function BurnOverlay({ step, statusText, onClose }: BurnOverlayProps) {
  const { t } = useTranslation()

  // 计算当前进度（1-4）
  const getProgress = () => {
    switch (step) {
      case 'preparing': return 1
      case 'signing': return 2
      case 'confirming': return 3
      case 'submitting': return 4
      case 'success': return 4
      case 'error': return 0
      default: return 0
    }
  }

  const progress = getProgress()
  const isSuccess = step === 'success'
  const isError = step === 'error'

  return (
    <MotionBox
      position="fixed"
      inset={0}
      bg="blackAlpha.800"
      zIndex={1000}
      display="flex"
      alignItems="center"
      justifyContent="center"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      <VStack
        gap={6}
        p={8}
        bg="rgba(23, 23, 28, 0.95)"
        borderRadius="2xl"
        borderWidth={1}
        borderColor="whiteAlpha.100"
        maxW={isError ? '90%' : '320px'}
        w="90%"
        maxH="80vh"
      >
        {/* 状态图标 */}
        {isSuccess ? (
          <MotionBox
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: 'spring', damping: 10 }}
          >
            <CheckCircle size={64} weight="fill" color="#FFFFFF" />
          </MotionBox>
        ) : isError ? (
          <Box
            w={16}
            h={16}
            borderRadius="full"
            bg="rgba(156, 163, 175, 0.2)"
            display="flex"
            alignItems="center"
            justifyContent="center"
            flexShrink={0}
          >
            <HiOutlineXMark size={32} color="#9CA3AF" />
          </Box>
        ) : (
          <Spinner
            color="whiteAlpha.700"
            w={16}
            h={16}
            borderWidth="4px"
          />
        )}

        {/* 状态文本 */}
        <Box w="full" overflow={isError ? 'auto' : 'visible'} maxH={isError ? '50vh' : 'none'}>
          <Text
            fontSize={isError ? 'sm' : 'lg'}
            fontWeight="bold"
            color={isError ? 'whiteAlpha.600' : 'white'}
            textAlign="center"
            wordBreak="break-word"
            whiteSpace="pre-wrap"
          >
            {statusText}
          </Text>

          {/* 进度提示 */}
          {!isSuccess && !isError && (
            <Text fontSize="sm" color="whiteAlpha.600" textAlign="center" mt={2}>
              {t('mint.step')} {progress}/4
            </Text>
          )}
        </Box>

        {/* 进度指示器 */}
        {!isSuccess && !isError && (
          <HStack gap={2}>
            {[1, 2, 3, 4].map((i) => (
              <Box
                key={i}
                w={2}
                h={2}
                borderRadius="full"
                bg={i <= progress ? 'white' : 'whiteAlpha.200'}
                transition="background-color 0.3s"
              />
            ))}
          </HStack>
        )}

        {/* 钱包确认提示 */}
        {step === 'signing' && (
          <Text fontSize="xs" color="whiteAlpha.500" textAlign="center">
            {t('mint.wallet_confirm_hint')}
          </Text>
        )}

        {/* 关闭按钮 - 仅在成功或错误时显示 */}
        {(isSuccess || isError) && onClose && (
          <Box w="full" mt={2} flexShrink={0}>
            <ActionButton
              variant={isSuccess ? 'primary' : 'secondary'}
              size="md"
              onClick={onClose}
              w="full"
            >
              {t('common.close')}
            </ActionButton>
          </Box>
        )}
      </VStack>
    </MotionBox>
  )
}

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
    nftLevelConfigs,
    systemConfig,
    fetchUserAssets,
    fetchPIDReleasePlans,
    fetchNFTLevelConfigs,
    fetchSystemConfig,
  } = usePayFiStore()

  // 链上销毁 hook
  const {
    isLoading: isBurnLoading,
    step: burnStep,
    burnPIC: executeBurn,
    reset: resetBurn,
    getStatusText: getBurnStatusText,
  } = usePICBurn()

  // 根据等级获取 NFT 配置
  const getNFTConfig = (level: string | null) => {
    if (!level || nftLevelConfigs.length === 0) return null
    return nftLevelConfigs.find(c => c.level === level) || null
  }

  // 销毁金额（USDT）
  const [burnUsdtAmount, setBurnUsdtAmount] = useState('')
  const [burnError, setBurnError] = useState<string | null>(null)

  // 质押相关状态
  const [stakeAmount, setStakeAmount] = useState('')
  const [selectedStakePeriod, setSelectedStakePeriod] = useState('m3')
  const [isStaking, setIsStaking] = useState(false)
  const [stakeError, setStakeError] = useState<string | null>(null)

  // 兑换相关状态（仅支持 PIC -> PID）
  const [swapAmount, setSwapAmount] = useState('')
  const [isSwapping, setIsSwapping] = useState(false)

  // 质押功能是否启用（由后端配置控制）
  const isStakingEnabled = userAssets?.featureFlags?.pidStakingEnabled ?? false

  // 是否显示销毁蒙版
  const showBurnOverlay = burnStep !== 'idle'

  // 滚动穿透修复
  useEffect(() => {
    if (showBurnOverlay) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = ''
    }
    return () => {
      document.body.style.overflow = ''
    }
  }, [showBurnOverlay])

  useEffect(() => {
    fetchUserAssets()
    fetchPIDReleasePlans()
    fetchNFTLevelConfigs()
    fetchSystemConfig()
  }, [fetchUserAssets, fetchPIDReleasePlans, fetchNFTLevelConfigs, fetchSystemConfig])

  // 计算销毁预估（基于 USDT 金额输入）
  const burnUsdtValue = burnUsdtAmount ? parseFloat(burnUsdtAmount) : 0
  const isValidBurnAmount = burnUsdtValue >= 100 && burnUsdtValue % 100 === 0
  const estimatedPicAmount = burnUsdtValue && priceInfo?.picPrice ? burnUsdtValue / priceInfo.picPrice : 0

  const currentNFTConfig = getNFTConfig(userAssets?.currentNFTLevel || null)
  const burnMultiplier = currentNFTConfig?.burnExitMultiplier || 3.0

  const estimatedPowerAdded = isValidBurnAmount ? burnUsdtValue : 0
  const estimatedExitAdded = isValidBurnAmount ? burnUsdtValue * burnMultiplier : 0

  // 检查钱包余额是否足够
  const hasEnoughBalance = estimatedPicAmount <= (userAssets?.walletPicBalance || 0)

  // 处理链上销毁
  const handleBurn = async () => {
    if (!burnUsdtAmount || !isValidBurnAmount || isBurnLoading) return

    // 检查钱包余额是否足够
    if (!hasEnoughBalance) {
      setBurnError(t('assets.insufficient_pic_balance'))
      return
    }

    setBurnError(null)
    resetBurn()

    try {
      const usdtAmount = parseFloat(burnUsdtAmount)
      const success = await executeBurn(usdtAmount)
      if (success) {
        setBurnUsdtAmount('')
        // 刷新用户资产
        await fetchUserAssets()
      }
    } catch {
      setBurnError(t('assets.burn_failed'))
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

  // 兑换计算（仅支持 PIC -> PID）
  const swapFromPrice = priceInfo?.picPrice || 0
  const swapToPrice = priceInfo?.pidPrice || 0
  const swapFromBalance = userAssets?.picBalance || 0
  const swapAmountNum = parseFloat(swapAmount) || 0
  const swapUsdtValue = swapAmountNum * swapFromPrice
  const swapFee = swapUsdtValue * 0.03 // 3% 服务费
  const swapReceiveUsdt = swapUsdtValue - swapFee
  const swapReceiveAmount = swapToPrice > 0 ? swapReceiveUsdt / swapToPrice : 0
  const isValidSwapAmount = swapAmountNum > 0 && swapAmountNum <= swapFromBalance

  // 处理兑换（暂不实现）
  const handleSwap = async () => {
    if (!isValidSwapAmount || isSwapping) return
    setIsSwapping(true)
    // TODO: 后端功能暂不实现
    await new Promise(resolve => setTimeout(resolve, 500))
    setIsSwapping(false)
  }

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
                      {((systemConfig?.pidMonthlyRate ?? 0.04) * 100).toFixed(0)}%
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
                {t('assets.burn_usdt_label')}
              </Text>
              <Input
                disabled={!isStakingEnabled}
                type="number"
                min="100"
                step="100"
                placeholder={t('assets.enter_burn_usdt')}
                value={burnUsdtAmount}
                autoComplete="off"
                onChange={(e) => {
                  setBurnUsdtAmount(e.target.value)
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
                  {t('assets.wallet_balance')}: {userAssets?.walletPicBalance?.toFixed(2) || '0.00'} PIC
                </Text>
                {burnUsdtAmount && (
                  <Text
                    fontSize="xs"
                    color={isValidBurnAmount && hasEnoughBalance ? '#22C55E' : 'red.400'}
                  >
                    ≈ {estimatedPicAmount.toFixed(2)} PIC
                    {!isValidBurnAmount && burnUsdtValue > 0 && ` (${t('assets.must_be_100u')})`}
                    {isValidBurnAmount && !hasEnoughBalance && ` (${t('assets.insufficient_pic_balance')})`}
                  </Text>
                )}
              </Flex>
            </Box>

            {/* 快捷金额 */}
            <HStack gap={2} mb="4">
              {quickAmounts.map((amount) => {
                const isSelected = burnUsdtAmount === String(amount)
                return (
                  <ActionButton
                    key={amount}
                    variant={isSelected ? 'primary' : 'outline'}
                    size="sm"
                    flex={1}
                    disabled={!isStakingEnabled}
                    onClick={() => setBurnUsdtAmount(String(amount))}
                    bg={isSelected ? 'whiteAlpha.200' : undefined}
                  >
                    ${amount}
                  </ActionButton>
                )
              })}
            </HStack>

            {/* 预估结果 */}
            {isValidBurnAmount && (
              <Box bg="whiteAlpha.50" borderRadius="lg" p="3" mb="4">
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
            {(burnError || burnStep === 'error') && (
              <Text fontSize="sm" color="red.400" mb="3">
                {burnError || getBurnStatusText()}
              </Text>
            )}

            {/* 销毁状态提示 */}
            {isBurnLoading && (
              <Text fontSize="sm" color="whiteAlpha.600" mb="3" textAlign="center">
                {getBurnStatusText()}
              </Text>
            )}

            {/* 销毁按钮 */}
            <ActionButton
              variant="primary"
              w="full"
              onClick={handleBurn}
              disabled={!isStakingEnabled || isBurnLoading || !isValidBurnAmount || !hasEnoughBalance}
            >
              {isBurnLoading ? t('assets.processing') : t('assets.confirm_burn')}
            </ActionButton>

            {!userAssets?.currentNFTLevel && (
              <Text fontSize="xs" color="whiteAlpha.400" textAlign="center" mt="2">
                {t('assets.need_nft_to_burn')}
              </Text>
            )}
          </MotionBox>
        </Box>

        {/* PID/PIC 兑换区域 */}
        <Box>
          <HStack gap={2} mb="3">
            <HiOutlineArrowPath size={18} color="#8A8A90" />
            <Text fontSize="sm" fontWeight="600" color="whiteAlpha.600">
              {t('assets.swap_title')}
            </Text>
          </HStack>

          <MotionBox
            bg="#17171C"
            borderRadius="xl"
            p="4"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.22 }}
          >
            {/* 支付代币 (PIC) */}
            <Box mb="3">
              <Text fontSize="xs" color="whiteAlpha.500" mb="2">
                {t('assets.swap_from')}
              </Text>
              <Box position="relative">
                <Input
                  disabled={!isStakingEnabled}
                  type="number"
                  min="0"
                  placeholder={t('assets.enter_swap_amount')}
                  value={swapAmount}
                  autoComplete="off"
                  onChange={(e) => setSwapAmount(e.target.value)}
                  bg="whiteAlpha.50"
                  border="1px solid"
                  borderColor="whiteAlpha.200"
                  borderRadius="xl"
                  color="white"
                  fontSize="lg"
                  h="12"
                  pl="4"
                  pr="24"
                  _placeholder={{ color: 'whiteAlpha.400' }}
                  _focus={{
                    borderColor: 'whiteAlpha.600',
                    boxShadow: '0 0 0 1px rgba(255, 255, 255, 0.5)',
                  }}
                />
                <HStack
                  position="absolute"
                  right="3"
                  top="50%"
                  transform="translateY(-50%)"
                  zIndex={2}
                  gap={2}
                >
                  <Button
                    disabled={!isStakingEnabled}
                    size="xs"
                    bg="whiteAlpha.200"
                    color="whiteAlpha.800"
                    _hover={{ bg: 'whiteAlpha.300' }}
                    onClick={() => setSwapAmount(swapFromBalance.toString())}
                  >
                    ALL
                  </Button>
                  <HStack gap={1}>
                    <Box
                      w="16px"
                      h="16px"
                      borderRadius="full"
                      bg="white"
                      display="flex"
                      alignItems="center"
                      justifyContent="center"
                    >
                      <PicLogo size={12} />
                    </Box>
                    <Text fontSize="sm" fontWeight="600" color="white">
                      PIC
                    </Text>
                  </HStack>
                </HStack>
              </Box>
              <Text fontSize="xs" color="whiteAlpha.400" mt="1">
                {t('assets.available')}: {swapFromBalance.toFixed(2)} PIC
              </Text>
            </Box>

            {/* 兑换箭头 */}
            <Flex justify="center" my="2">
              <Box
                w="8"
                h="8"
                borderRadius="full"
                bg="whiteAlpha.100"
                display="flex"
                alignItems="center"
                justifyContent="center"
              >
                <Text fontSize="lg" color="whiteAlpha.600">↓</Text>
              </Box>
            </Flex>

            {/* 获得代币 */}
            <Box mb="4">
              <Text fontSize="xs" color="whiteAlpha.500" mb="2">
                {t('assets.swap_to')}
              </Text>
              <Box
                bg="whiteAlpha.50"
                border="1px solid"
                borderColor="whiteAlpha.200"
                borderRadius="xl"
                h="12"
                px="4"
                display="flex"
                alignItems="center"
                justifyContent="space-between"
              >
                <Text fontSize="lg" fontWeight="600" color={swapReceiveAmount > 0 ? 'white' : 'whiteAlpha.400'}>
                  {swapReceiveAmount > 0 ? swapReceiveAmount.toFixed(4) : '0.00'}
                </Text>
                <HStack gap={1}>
                  <Box
                    w="16px"
                    h="16px"
                    borderRadius="full"
                    bg="white"
                    display="flex"
                    alignItems="center"
                    justifyContent="center"
                  >
                    <PolyFlowLogo size={12} />
                  </Box>
                  <Text fontSize="sm" fontWeight="600" color="white">
                    PID
                  </Text>
                </HStack>
              </Box>
            </Box>

            {/* 兑换信息 */}
            {swapAmountNum > 0 && (
              <Box bg="whiteAlpha.50" borderRadius="lg" p="3" mb="4">
                <HStack justify="space-between" mb="2">
                  <Text fontSize="xs" color="whiteAlpha.500">
                    {t('assets.swap_rate')}
                  </Text>
                  <Text fontSize="xs" color="white">
                    1 PIC = {swapToPrice > 0 ? (swapFromPrice / swapToPrice).toFixed(4) : '0'} PID
                  </Text>
                </HStack>
                <HStack justify="space-between" mb="2">
                  <Text fontSize="xs" color="whiteAlpha.500">
                    {t('assets.swap_value')}
                  </Text>
                  <Text fontSize="xs" color="white">
                    ${swapUsdtValue.toFixed(2)} USDT
                  </Text>
                </HStack>
                <HStack justify="space-between">
                  <Text fontSize="xs" color="whiteAlpha.500">
                    {t('assets.swap_fee')} (3%)
                  </Text>
                  <Text fontSize="xs" color="whiteAlpha.500">
                    -${swapFee.toFixed(2)} USDT
                  </Text>
                </HStack>
              </Box>
            )}

            {/* 兑换按钮 */}
            <ActionButton
              variant="primary"
              w="full"
              onClick={handleSwap}
              disabled={!isStakingEnabled || !isValidSwapAmount}
            >
              {isSwapping ? t('assets.processing') : t('assets.confirm_swap')}
            </ActionButton>

            <Text fontSize="xs" color="whiteAlpha.400" textAlign="center" mt="2">
              {t('assets.swap_hint')}
            </Text>
          </MotionBox>
        </Box>

        {/* 底部间距 */}
        <Box h="8" />
      </VStack>

      {/* 销毁进度蒙版 */}
      <AnimatePresence>
        {showBurnOverlay && (
          <BurnOverlay
            step={burnStep}
            statusText={getBurnStatusText()}
            onClose={() => {
              resetBurn()
              if (burnStep === 'success') {
                setBurnUsdtAmount('')
                fetchUserAssets()
              }
            }}
          />
        )}
      </AnimatePresence>
    </Box>
  )
}
