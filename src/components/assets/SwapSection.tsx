import { Box, Flex, HStack, Input, Text } from '@chakra-ui/react'
import { Button } from '@chakra-ui/react'
import { AnimatePresence, motion } from 'framer-motion'
import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { HiOutlineArrowPath } from 'react-icons/hi2'
import { ActionButton, PicLogo, PolyFlowLogo } from '../common'
import { ProgressOverlay } from '../nft'
import { usePayFiStore } from '../../stores/payfiStore'
import { useSwap } from '../../hooks/useSwap'
import { swapApi } from '../../api'
import type { SwapConfigResponse } from '../../api/types'

const MotionBox = motion.create(Box)

export function SwapSection() {
  const { t } = useTranslation()
  const { userAssets, fetchUserAssets } = usePayFiStore()

  const [swapAmount, setSwapAmount] = useState('')
  const [swapConfig, setSwapConfig] = useState<SwapConfigResponse | null>(null)

  const { isLoading, step, executeSwap, reset, getStatusText } = useSwap()

  const isStakingEnabled = userAssets?.featureFlags?.pidStakingEnabled ?? false
  const showSwapOverlay = step !== 'idle'

  // 加载兑换配置
  useEffect(() => {
    swapApi.getSwapConfig().then(setSwapConfig).catch(console.error)
  }, [])

  // 滚动穿透修复
  useEffect(() => {
    if (showSwapOverlay) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = ''
    }
    return () => {
      document.body.style.overflow = ''
    }
  }, [showSwapOverlay])

  // PIC → PID 兑换：用钱包持有的 PIC（链上余额）
  const feeRate = swapConfig?.picToPidFeeRate ?? 0
  const pidPrice = swapConfig?.pidPrice ?? 0
  const picPrice = swapConfig?.picPrice ?? 0
  const swapFromBalance = userAssets?.walletPicBalance || 0
  const swapAmountNum = parseFloat(swapAmount) || 0
  const swapUsdtValue = swapAmountNum * picPrice
  const swapFee = swapUsdtValue * feeRate
  const swapReceiveUsdt = swapUsdtValue - swapFee
  const swapReceiveAmount = pidPrice > 0 ? swapReceiveUsdt / pidPrice : 0
  const minAmount = swapConfig?.minSwapAmount ?? 10
  const isValidSwapAmount = swapAmountNum >= minAmount && swapAmountNum <= swapFromBalance
  const isBelowMin = swapAmountNum > 0 && swapAmountNum < minAmount
  const isAboveBalance = swapAmountNum > swapFromBalance && swapFromBalance > 0

  const getSwapProgress = () => {
    switch (step) {
      case 'creating': return 1
      case 'signing': return 2
      case 'confirming': return 3
      case 'submitting': return 4
      case 'verifying': return 5
      case 'success': return 5
      case 'error': return 0
      default: return 0
    }
  }

  const handleSwap = async () => {
    if (!isValidSwapAmount || isLoading) return
    const success = await executeSwap('PIC_TO_PID', swapAmountNum)
    if (success) {
      setSwapAmount('')
      await fetchUserAssets()
    }
  }

  return (
    <>
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
                disabled={!isStakingEnabled || isLoading}
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
                  disabled={!isStakingEnabled || isLoading}
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
            <Flex justify="space-between" mt="1">
              <Text fontSize="xs" color="whiteAlpha.400">
                {t('assets.available')}: {swapFromBalance.toFixed(2)} PIC
              </Text>
              <Text fontSize="xs" color="whiteAlpha.400">
                {t('assets.min_swap_amount', { amount: minAmount })}
              </Text>
            </Flex>
            {isBelowMin && (
              <Text fontSize="xs" color="red.400" mt="1">
                {t('assets.swap_below_min', { amount: minAmount })}
              </Text>
            )}
            {isAboveBalance && (
              <Text fontSize="xs" color="red.400" mt="1">
                {t('assets.swap_insufficient_balance')}
              </Text>
            )}
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
              <Text fontSize="lg" color="whiteAlpha.600">{'\u2193'}</Text>
            </Box>
          </Flex>

          {/* 获得代币 (PID) */}
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
                  1 PIC = {pidPrice > 0 ? (picPrice / pidPrice).toFixed(4) : '0'} PID
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
              {feeRate > 0 && (
                <HStack justify="space-between">
                  <Text fontSize="xs" color="whiteAlpha.500">
                    {t('assets.swap_fee')} ({(feeRate * 100).toFixed(0)}%)
                  </Text>
                  <Text fontSize="xs" color="whiteAlpha.500">
                    -${swapFee.toFixed(2)} USDT
                  </Text>
                </HStack>
              )}
            </Box>
          )}

          {/* 兑换按钮 */}
          <ActionButton
            variant="primary"
            w="full"
            onClick={handleSwap}
            disabled={!isStakingEnabled || !isValidSwapAmount || isLoading}
          >
            {t('assets.confirm_swap')}
          </ActionButton>

          <Text fontSize="xs" color="whiteAlpha.400" textAlign="center" mt="2">
            {t('assets.swap_hint')}
          </Text>
        </MotionBox>
      </Box>

      {/* 兑换进度蒙版 */}
      <AnimatePresence>
        {showSwapOverlay && (
          <ProgressOverlay
            progress={getSwapProgress()}
            totalSteps={5}
            isSuccess={step === 'success'}
            isError={step === 'error'}
            isSigningStep={step === 'signing'}
            statusText={getStatusText()}
            onClose={() => {
              reset()
              if (step === 'success') {
                setSwapAmount('')
                fetchUserAssets()
              }
            }}
          />
        )}
      </AnimatePresence>
    </>
  )
}
