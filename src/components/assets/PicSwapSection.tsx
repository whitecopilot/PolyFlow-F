import { Box, Button, Flex, HStack, Input, Text } from '@chakra-ui/react'
import { motion } from 'framer-motion'
import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { HiOutlineArrowPath } from 'react-icons/hi2'
import { ActionButton, PicLogo } from '../common'
import { usePayFiStore } from '../../stores/payfiStore'

const MotionBox = motion.create(Box)

export function PicSwapSection() {
  const { t } = useTranslation()
  const { userAssets, priceInfo } = usePayFiStore()

  const [picSwapAmount, setPicSwapAmount] = useState('')
  const [isPicSwapping, setIsPicSwapping] = useState(false)
  const [picSwapTargetToken, setPicSwapTargetToken] = useState<'USDT' | 'USDC'>('USDT')

  const isStakingEnabled = userAssets?.featureFlags?.pidStakingEnabled ?? false

  const swapFromPrice = priceInfo?.picPrice || 0
  const picSwapFromBalance = userAssets?.picBalance || 0
  const picSwapAmountNum = parseFloat(picSwapAmount) || 0
  const picSwapUsdtValue = picSwapAmountNum * swapFromPrice
  const picSwapFee = picSwapUsdtValue * 0.03
  const picSwapReceiveAmount = picSwapUsdtValue - picSwapFee
  const isValidPicSwapAmount = picSwapAmountNum > 0 && picSwapAmountNum <= picSwapFromBalance

  const handlePicSwap = async () => {
    if (!isValidPicSwapAmount || isPicSwapping) return
    setIsPicSwapping(true)
    // TODO: 后端功能暂不实现
    await new Promise(resolve => setTimeout(resolve, 500))
    setIsPicSwapping(false)
  }

  return (
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
              disabled={!isStakingEnabled}
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
                disabled={!isStakingEnabled}
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
          <Text fontSize="xs" color="whiteAlpha.400" mt="1">
            {t('assets.available')}: {picSwapFromBalance.toFixed(2)} PIC
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
                1 PIC = {swapFromPrice > 0 ? swapFromPrice.toFixed(4) : '0'} {picSwapTargetToken}
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
                {t('assets.swap_fee')} (3%)
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
          disabled={!isStakingEnabled || !isValidPicSwapAmount}
        >
          {isPicSwapping ? t('assets.processing') : t('assets.confirm_swap')}
        </ActionButton>

        <Text fontSize="xs" color="whiteAlpha.400" textAlign="center" mt="2">
          {t('assets.swap_hint')}
        </Text>
      </MotionBox>
    </Box>
  )
}
