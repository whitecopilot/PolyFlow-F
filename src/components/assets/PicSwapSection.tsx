import { Box, Button, Flex, HStack, Input, Text } from '@chakra-ui/react'
import { AnimatePresence, motion } from 'framer-motion'
import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { HiOutlineArrowPath } from 'react-icons/hi2'
import { ActionButton, PicLogo } from '../common'
import { ProgressOverlay } from '../nft'
import { usePayFiStore } from '../../stores/payfiStore'
import { useSwap } from '../../hooks/useSwap'
import { swapApi } from '../../api'
import type { SwapConfigResponse, SwapType } from '../../api/types'

const MotionBox = motion.create(Box)

export function PicSwapSection() {
  const { t } = useTranslation()
  const { userAssets, fetchUserAssets } = usePayFiStore()

  const [picSwapAmount, setPicSwapAmount] = useState('')
  const [picSwapTargetToken, setPicSwapTargetToken] = useState<'USDT' | 'USDC'>('USDT')
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

  const feeRate = swapConfig?.picToStableFeeRate ?? 0.03
  const picPrice = swapConfig?.picPrice ?? 0
  const picSwapFromBalance = userAssets?.walletPicBalance || 0
  const picSwapAmountNum = parseFloat(picSwapAmount) || 0
  const picSwapUsdtValue = picSwapAmountNum * picPrice
  const picSwapFee = picSwapUsdtValue * feeRate
  const picSwapReceiveAmount = picSwapUsdtValue - picSwapFee
  const minAmount = swapConfig?.minSwapAmount ?? 10
  const isValidPicSwapAmount = picSwapAmountNum >= minAmount && picSwapAmountNum <= picSwapFromBalance
  const isBelowMin = picSwapAmountNum > 0 && picSwapAmountNum < minAmount
  const isAboveBalance = picSwapAmountNum > picSwapFromBalance && picSwapFromBalance > 0

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

  const handlePicSwap = async () => {
    if (!isValidPicSwapAmount || isLoading) return
    const swapType: SwapType = picSwapTargetToken === 'USDT' ? 'PIC_TO_USDT' : 'PIC_TO_USDC'
    const success = await executeSwap(swapType, picSwapAmountNum)
    if (success) {
      setPicSwapAmount('')
      await fetchUserAssets()
    }
  }

  return (
    <>
      <Box>
        <HStack gap={2} mb="3">
          <HiOutlineArrowPath size={18} color="#8A8A90" />
          <Text fontSize="sm" fontWeight="600" color="whiteAlpha.600">
            {t('assets.pic_swap_title')}
          </Text>
        </HStack>

        <MotionBox
          bg="#17171C"
          borderRadius="xl"
          p="4"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.24 }}
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
                value={picSwapAmount}
                autoComplete="off"
                onChange={(e) => setPicSwapAmount(e.target.value)}
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
                  onClick={() => setPicSwapAmount(picSwapFromBalance.toString())}
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
                {t('assets.available')}: {picSwapFromBalance.toFixed(2)} PIC
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

          {/* 获得代币 (USDT/USDC 可切换) */}
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
              <Text fontSize="lg" fontWeight="600" color={picSwapReceiveAmount > 0 ? 'white' : 'whiteAlpha.400'}>
                {picSwapReceiveAmount > 0 ? picSwapReceiveAmount.toFixed(4) : '0.00'}
              </Text>
              <HStack gap={1}>
                <Box
                  w="16px"
                  h="16px"
                  borderRadius="full"
                  bg={picSwapTargetToken === 'USDT' ? '#26A17B' : '#2775CA'}
                  display="flex"
                  alignItems="center"
                  justifyContent="center"
                >
                  <Text fontSize="8px" fontWeight="800" color="white">$</Text>
                </Box>
                <HStack gap={0}>
                  <Button
                    size="xs"
                    variant="ghost"
                    color={picSwapTargetToken === 'USDT' ? 'white' : 'whiteAlpha.400'}
                    fontWeight={picSwapTargetToken === 'USDT' ? '700' : '500'}
                    px="1"
                    minW="auto"
                    h="auto"
                    _hover={{ color: 'white' }}
                    onClick={() => setPicSwapTargetToken('USDT')}
                    disabled={isLoading}
                  >
                    USDT
                  </Button>
                  <Text fontSize="xs" color="whiteAlpha.300">/</Text>
                  <Button
                    size="xs"
                    variant="ghost"
                    color={picSwapTargetToken === 'USDC' ? 'white' : 'whiteAlpha.400'}
                    fontWeight={picSwapTargetToken === 'USDC' ? '700' : '500'}
                    px="1"
                    minW="auto"
                    h="auto"
                    _hover={{ color: 'white' }}
                    onClick={() => setPicSwapTargetToken('USDC')}
                    disabled={isLoading}
                  >
                    USDC
                  </Button>
                </HStack>
              </HStack>
            </Box>
          </Box>

          {/* 兑换信息 */}
          {picSwapAmountNum > 0 && (
            <Box bg="whiteAlpha.50" borderRadius="lg" p="3" mb="4">
              <HStack justify="space-between" mb="2">
                <Text fontSize="xs" color="whiteAlpha.500">
                  {t('assets.swap_rate')}
                </Text>
                <Text fontSize="xs" color="white">
                  1 PIC = {picPrice > 0 ? picPrice.toFixed(4) : '0'} {picSwapTargetToken}
                </Text>
              </HStack>
              <HStack justify="space-between" mb="2">
                <Text fontSize="xs" color="whiteAlpha.500">
                  {t('assets.swap_value')}
                </Text>
                <Text fontSize="xs" color="white">
                  {picSwapUsdtValue.toFixed(2)} {picSwapTargetToken}
                </Text>
              </HStack>
              <HStack justify="space-between">
                <Text fontSize="xs" color="whiteAlpha.500">
                  {t('assets.swap_fee')} ({(feeRate * 100).toFixed(0)}%)
                </Text>
                <Text fontSize="xs" color="whiteAlpha.500">
                  -{picSwapFee.toFixed(2)} {picSwapTargetToken}
                </Text>
              </HStack>
            </Box>
          )}

          {/* 兑换按钮 */}
          <ActionButton
            variant="primary"
            w="full"
            onClick={handlePicSwap}
            disabled={!isStakingEnabled || !isValidPicSwapAmount || isLoading}
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
                setPicSwapAmount('')
                fetchUserAssets()
              }
            }}
          />
        )}
      </AnimatePresence>
    </>
  )
}
