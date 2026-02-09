import { Box, Flex, HStack, SimpleGrid, Text, VStack } from '@chakra-ui/react'
import { motion } from 'framer-motion'
import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import {
  HiOutlineArrowUp,
  HiOutlineBolt,
  HiOutlineExclamationCircle,
  HiOutlinePlay,
  HiOutlineShieldCheck,
  HiOutlineShoppingCart,
  HiOutlineSparkles,
} from 'react-icons/hi2'
import type { PaymentCurrency } from '../../api/types'
import { usePayFiStore } from '../../stores/payfiStore'
import type { NFTLevel } from '../../types/payfi'
import { ActionButton, GradientBorderCard, LazyVideo } from '../common'

const MotionBox = motion.create(Box)

const NFT_VIDEO_BASE_URL = 'https://static.polyflow.global/'
const getNFTVideoUrl = (level: string) => `${NFT_VIDEO_BASE_URL}${level.toLowerCase()}.mp4`

interface PurchaseCardProps {
  selectedLevel: NFTLevel
  onSelectLevel: (level: NFTLevel) => void
  onOpenNFTSelector: (level: string) => void
  isStakingLoading: boolean
  isPurchasing: boolean
  onPurchase: (level: NFTLevel, isUpgrade: boolean, currency: PaymentCurrency) => void
}

export function PurchaseCard({
  selectedLevel,
  onOpenNFTSelector,
  isStakingLoading,
  isPurchasing,
  onPurchase,
}: PurchaseCardProps) {
  const { t } = useTranslation()
  const { userAssets, priceInfo, nftLevelConfigs, nftHoldings } = usePayFiStore()

  const [paymentCurrency, setPaymentCurrency] = useState<PaymentCurrency>('USDT')

  const currentLevel = userAssets?.currentNFTLevel ?? null
  const currentLevelIndex = currentLevel
    ? nftLevelConfigs.findIndex(c => c.level === currentLevel)
    : -1
  const selectedLevelIndex = selectedLevel
    ? nftLevelConfigs.findIndex(c => c.level === selectedLevel)
    : -1
  const isUpgradeAction = currentLevelIndex >= 0 && selectedLevelIndex > currentLevelIndex

  const selectedConfig = selectedLevel
    ? nftLevelConfigs.find(c => c.level === selectedLevel) || null
    : null

  const selectedPrice = selectedConfig?.price ?? 0
  const isSelectedLevelEnabled = selectedConfig?.enable ?? true
  const isStakingEnabled = userAssets?.featureFlags?.pidStakingEnabled ?? false

  const selectedBalance = paymentCurrency === 'USDC'
    ? (userAssets?.usdcBalance ?? 0)
    : (userAssets?.usdtBalance ?? 0)
  const hasInsufficientBalance = !!selectedLevel && selectedBalance < selectedPrice

  const allUnstakedNFTs = nftHoldings.filter(nft => !nft.isStaked)
  const hasUnstakedForLevel = selectedLevel
    ? allUnstakedNFTs.filter(n => n.nftLevel === selectedLevel).length > 0
    : false

  const handlePurchaseOrUpgrade = () => {
    if (!selectedLevel || isPurchasing) return
    onPurchase(selectedLevel, isUpgradeAction, paymentCurrency)
  }

  if (!selectedConfig) return null

  return (
    <MotionBox
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <GradientBorderCard glowIntensity="high">
        <Box p="5">
          <HStack justify="space-between" mb="4">
            <VStack align="start" gap={1}>
              <HStack gap={2}>
                <Text fontSize="xl" fontWeight="bold" color="white">
                  {selectedConfig.level}
                </Text>
                <Text fontSize="lg" color="whiteAlpha.700">
                  {t(`nft_level.${selectedConfig.level}`)}
                </Text>
              </HStack>
              {isUpgradeAction && (
                <HStack gap={1}>
                  <HiOutlineArrowUp size={14} color="#9CA3AF" />
                  <Text fontSize="sm" color="#9CA3AF">
                    {t('nft.upgrade_from', { from: currentLevel })}
                  </Text>
                </HStack>
              )}
            </VStack>
          </HStack>

          {/* 属性网格 */}
          <SimpleGrid columns={2} gap={3} mb="4">
            <Box bg="whiteAlpha.50" borderRadius="lg" p="3">
              <HStack gap={1} mb={1}>
                <Text fontSize="xs" color="whiteAlpha.500">{t('nft.price')}</Text>
              </HStack>
              <Text fontSize="lg" fontWeight="bold" color="white">
                ${selectedConfig.price.toLocaleString()}
              </Text>
            </Box>

            <Box bg="whiteAlpha.50" borderRadius="lg" p="3">
              <HStack gap={1} mb={1}>
                <HiOutlineBolt size={12} color="#9A9A9F" />
                <Text fontSize="xs" color="whiteAlpha.500">{t('nft.base_power')}</Text>
              </HStack>
              <Text fontSize="lg" fontWeight="bold" color="white">
                {selectedConfig.power.toLocaleString()}
              </Text>
            </Box>

            <Box bg="whiteAlpha.50" borderRadius="lg" p="3">
              <HStack gap={1} mb={1}>
                <HiOutlineSparkles size={12} color="#8A8A90" />
                <Text fontSize="xs" color="whiteAlpha.500">{t('nft.power_coefficient')}</Text>
              </HStack>
              <Text fontSize="lg" fontWeight="bold" color="white">
                {selectedConfig.coefficient}x
              </Text>
            </Box>

            <Box bg="whiteAlpha.50" borderRadius="lg" p="3">
              <HStack gap={1} mb={1}>
                <HiOutlineShieldCheck size={12} color="#8A8A90" />
                <Text fontSize="xs" color="whiteAlpha.500">{t('nft.pool_multiplier')}</Text>
              </HStack>
              <Text fontSize="lg" fontWeight="bold" color="white">
                NFT {selectedConfig.nftExitMultiplier}x
              </Text>
              <Text fontSize="xs" color="whiteAlpha.500">
                {t('nft.burn_pic')} {selectedConfig.burnExitMultiplier}x
              </Text>
            </Box>
          </SimpleGrid>

          {/* 获得 PID 预估 */}
          {priceInfo && priceInfo.pidPrice > 0 && (
            <Flex
              bg="rgba(74, 74, 80, 0.15)"
              borderRadius="lg"
              p="3"
              mb="4"
              justify="space-between"
              align="center"
            >
              <Box>
                <Text fontSize="xs" color="whiteAlpha.600" mb="1">
                  {t('nft.estimated_pid')}
                </Text>
                <Text fontSize="xl" fontWeight="bold" color="#9A9A9F">
                  {(selectedConfig.price / priceInfo.pidPrice).toFixed(2)} PID
                </Text>
                <Text fontSize="xs" color="whiteAlpha.500">
                  {t('nft.current_pid_price')}: ${priceInfo.pidPrice.toFixed(4)}
                </Text>
              </Box>
              <LazyVideo
                src={getNFTVideoUrl(selectedConfig.level)}
                width="72px"
                height="72px"
                borderRadius="lg"
                rootMargin="50px 0px"
              />
            </Flex>
          )}

          {/* 暂未开放提示 */}
          {!isSelectedLevelEnabled && (
            <Box
              bg="rgba(156, 163, 175, 0.1)"
              borderRadius="lg"
              p="3"
              mb="4"
              borderWidth={1}
              borderColor="rgba(156, 163, 175, 0.3)"
            >
              <HStack gap={2}>
                <HiOutlineExclamationCircle size={18} color="#9CA3AF" />
                <Text fontSize="sm" color="#9CA3AF" fontWeight="600">
                  {t('nft.level_not_available_hint')}
                </Text>
              </HStack>
            </Box>
          )}

          {/* 余额不足警告 */}
          {isSelectedLevelEnabled && hasInsufficientBalance && (
            <Box
              bg="rgba(239, 68, 68, 0.1)"
              borderRadius="lg"
              p="3"
              mb="4"
              borderWidth={1}
              borderColor="rgba(239, 68, 68, 0.3)"
            >
              <HStack gap={2}>
                <HiOutlineExclamationCircle size={18} color="#EF4444" />
                <VStack align="start" gap={0}>
                  <Text fontSize="sm" color="#EF4444" fontWeight="600">
                    {t('nft.insufficient_balance')}
                  </Text>
                  <Text fontSize="xs" color="whiteAlpha.500">
                    {t('nft.balance_hint', {
                      balance: selectedBalance.toFixed(2),
                      required: selectedPrice.toFixed(2),
                      currency: paymentCurrency,
                    })}
                  </Text>
                </VStack>
              </HStack>
            </Box>
          )}

          {/* 币种选择 */}
          <HStack gap={2} w="full" justify="center" mb={2}>
            <Text fontSize="xs" color="whiteAlpha.500" flexShrink={0}>
              {t('nft.payment_method')}
            </Text>
            {(['USDT', 'USDC'] as PaymentCurrency[]).map((currency) => (
              <Box
                key={currency}
                as="button"
                px={4}
                py={1.5}
                borderRadius="full"
                fontSize="sm"
                fontWeight="600"
                cursor="pointer"
                transition="all 0.2s"
                bg={paymentCurrency === currency ? 'rgba(255,255,255,0.15)' : 'rgba(255,255,255,0.05)'}
                color={paymentCurrency === currency ? 'white' : 'whiteAlpha.600'}
                borderWidth={1}
                borderColor={paymentCurrency === currency ? 'rgba(255,255,255,0.3)' : 'transparent'}
                onClick={() => setPaymentCurrency(currency)}
                _hover={{ bg: paymentCurrency === currency ? 'rgba(255,255,255,0.2)' : 'rgba(255,255,255,0.1)' }}
              >
                {currency}
              </Box>
            ))}
          </HStack>

          {/* 质押 + 购买/升级按钮 */}
          <HStack gap={3} w="full">
            {hasUnstakedForLevel && (
              <ActionButton
                variant="secondary"
                flex={1}
                size="lg"
                onClick={() => onOpenNFTSelector(selectedLevel!)}
                disabled={isStakingLoading || !isStakingEnabled}
              >
                <HStack gap={2} justify="center">
                  {isStakingLoading ? (
                    <Text>{t('nft.staking')}</Text>
                  ) : (
                    <>
                      <HiOutlinePlay size={18} />
                      <Text>{t('nft.stake')}</Text>
                    </>
                  )}
                </HStack>
              </ActionButton>
            )}

            <ActionButton
              variant="primary"
              flex={1}
              size="lg"
              onClick={handlePurchaseOrUpgrade}
              disabled={isPurchasing || hasInsufficientBalance || !isSelectedLevelEnabled}
            >
              <HStack gap={2} justify="center">
                {isPurchasing ? (
                  <Text>{t('common.processing')}</Text>
                ) : !isSelectedLevelEnabled ? (
                  <Text>{t('nft.not_available')}</Text>
                ) : isUpgradeAction ? (
                  <Text>{t('nft.upgrade_to', { level: selectedConfig.level })}</Text>
                ) : (
                  <>
                    <HiOutlineShoppingCart size={18} />
                    <Text>{t('nft.purchase_level', { level: selectedConfig.level })}</Text>
                  </>
                )}
              </HStack>
            </ActionButton>
          </HStack>

          {!hasInsufficientBalance && (
            <Flex justify="center" mt="3">
              <Text fontSize="xs" color="whiteAlpha.500">
                {t('nft.wallet_balance')}: {selectedBalance.toFixed(2)} {paymentCurrency}
              </Text>
            </Flex>
          )}
        </Box>
      </GradientBorderCard>
    </MotionBox>
  )
}
