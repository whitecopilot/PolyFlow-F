// 资产页面 - 数字金库（一级页面）

import { Box, Flex, HStack, Input, SimpleGrid, Text, VStack } from '@chakra-ui/react'
import { motion } from 'framer-motion'
import { useEffect, useState } from 'react'
import {
  HiOutlineArrowPath,
  HiOutlineBolt,
  HiOutlineCalendarDays,
  HiOutlineClipboardDocumentList,
  HiOutlineFire,
  HiOutlineLockClosed,
  HiOutlineShieldCheck,
  HiOutlineSparkles,
} from 'react-icons/hi2'
import { useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import {
  ActionButton,
  GradientBorderCard,
  PageHeader,
  ProgressBar,
} from '../components/common'
import { getNFTConfig, PAYFI_CONFIG } from '../mocks/payfiConfig'
import { usePayFiStore } from '../stores/payfiStore'

const MotionBox = motion.create(Box)

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

  // 快捷金额按钮
  const quickAmounts = [100, 500, 1000, 3000, 10000]

  return (
    <Box minH="100vh" bg="black">
      {/* 一级页面顶部导航 */}
      <PageHeader title={t('assets.title')} />

      <VStack gap="5" p="4" align="stretch">
        {/* PID 卡片 */}
        <GradientBorderCard glowIntensity="low">
          <Box p="4">
            <HStack justify="space-between" mb="3">
              <HStack gap={2}>
                <Box
                  w="8"
                  h="8"
                  borderRadius="lg"
                  bg="rgba(41, 47, 225, 0.2)"
                  display="flex"
                  alignItems="center"
                  justifyContent="center"
                >
                  <HiOutlineSparkles size={18} color="#292FE1" />
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
                  <HiOutlineArrowPath size={12} color="#22C55E" />
                  <Text fontSize="xs" color="whiteAlpha.500">
                    {t('assets.released')}
                  </Text>
                </HStack>
                <Text fontSize="lg" fontWeight="bold" color="#22C55E">
                  {userAssets?.pidReleased.toFixed(2) || '0.00'}
                </Text>
              </Box>
              <Box>
                <HStack gap={1} mb={1}>
                  <HiOutlineSparkles size={12} color="#292FE1" />
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
              {((userAssets?.pidBalance || 0) * (priceInfo?.pidPrice || 0)).toFixed(2)}{' '}
              USDT
            </Text>
          </Box>
        </GradientBorderCard>

        {/* PIC 卡片 */}
        <MotionBox
          bg="#17171C"
          borderRadius="xl"
          p="4"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <HStack justify="space-between" mb="3">
            <HStack gap={2}>
              <Box
                w="8"
                h="8"
                borderRadius="lg"
                bg="rgba(216, 17, 240, 0.2)"
                display="flex"
                alignItems="center"
                justifyContent="center"
              >
                <HiOutlineFire size={18} color="#D811F0" />
              </Box>
              <Text fontSize="md" fontWeight="600" color="white">
                PIC
              </Text>
            </HStack>
            <Text fontSize="xs" color="whiteAlpha.500">
              ${priceInfo?.picPrice.toFixed(4) || '0.00'}
            </Text>
          </HStack>

          <Text fontSize="2xl" fontWeight="bold" color="white" mb="1">
            {userAssets?.picBalance.toFixed(2) || '0.00'} PIC
          </Text>
          <Text fontSize="sm" color="whiteAlpha.500">
            ≈ $
            {((userAssets?.picBalance || 0) * (priceInfo?.picPrice || 0)).toFixed(2)}{' '}
            USDT
          </Text>
        </MotionBox>

        {/* PID 释放计划 */}
        {pidReleasePlans.length > 0 && (
          <Box>
            <HStack gap={2} mb="3">
              <HiOutlineCalendarDays size={18} color="#292FE1" />
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
                    <Text fontSize="sm" fontWeight="medium" color="#22C55E">
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

        {/* PIC 销毁区域 */}
        <Box>
          <Flex justify="space-between" align="center" mb="3">
            <HStack gap={2}>
              <HiOutlineFire size={18} color="#D811F0" />
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
              _hover={{ color: '#D811F0' }}
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
                type="number"
                placeholder={t('assets.enter_burn_amount')}
                value={burnAmount}
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
                  borderColor: '#D811F0',
                  boxShadow: '0 0 0 1px #D811F0',
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
                    <HiOutlineBolt size={16} color="#292FE1" />
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
                    <HiOutlineShieldCheck size={16} color="#22C55E" />
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
              disabled={
                !isValidBurnAmount || isProcessing || !userAssets?.currentNFTLevel
              }
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
