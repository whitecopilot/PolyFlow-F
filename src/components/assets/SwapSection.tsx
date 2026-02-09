import { Box, Button, Flex, HStack, Input, Text } from '@chakra-ui/react'
import { motion } from 'framer-motion'
import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { HiOutlineArrowPath } from 'react-icons/hi2'
import { ActionButton, PicLogo, PolyFlowLogo } from '../common'
import { usePayFiStore } from '../../stores/payfiStore'

const MotionBox = motion.create(Box)

export function SwapSection() {
  const { t } = useTranslation()
  const { userAssets, priceInfo } = usePayFiStore()

  const [swapAmount, setSwapAmount] = useState('')
  const [isSwapping, setIsSwapping] = useState(false)

  const isStakingEnabled = userAssets?.featureFlags?.pidStakingEnabled ?? false

  const swapFromPrice = priceInfo?.picPrice || 0
  const swapToPrice = priceInfo?.pidPrice || 0
  const swapFromBalance = userAssets?.picBalance || 0
  const swapAmountNum = parseFloat(swapAmount) || 0
  const swapUsdtValue = swapAmountNum * swapFromPrice
  const swapFee = swapUsdtValue * 0.03
  const swapReceiveUsdt = swapUsdtValue - swapFee
  const swapReceiveAmount = swapToPrice > 0 ? swapReceiveUsdt / swapToPrice : 0
  const isValidSwapAmount = swapAmountNum > 0 && swapAmountNum <= swapFromBalance

  const handleSwap = async () => {
    if (!isValidSwapAmount || isSwapping) return
    setIsSwapping(true)
    // TODO: 后端功能暂不实现
    await new Promise(resolve => setTimeout(resolve, 500))
    setIsSwapping(false)
  }

  return (
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
  )
}
