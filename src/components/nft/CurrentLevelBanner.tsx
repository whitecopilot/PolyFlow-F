import { Box, HStack, Skeleton, Text, VStack } from '@chakra-ui/react'
import { motion } from 'framer-motion'
import { Sparkle } from '@phosphor-icons/react'
import { useTranslation } from 'react-i18next'
import { GradientBorderCard, NFTBadge } from '../common'
import { usePayFiStore } from '../../stores/payfiStore'

const MotionBox = motion.create(Box)

export function CurrentLevelBanner() {
  const { t } = useTranslation()
  const { userAssets, nftLevelConfigs, nftHoldingStats } = usePayFiStore()

  const currentLevel = userAssets?.currentNFTLevel ?? null
  const currentConfig = currentLevel
    ? nftLevelConfigs.find(c => c.level === currentLevel) || null
    : null
  const hasNFTHoldings = (nftHoldingStats?.totalCount ?? 0) > 0

  return (
    <GradientBorderCard glowIntensity={currentLevel ? 'medium' : 'low'} staticBorder>
      <MotionBox
        p="4"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
      >
        {nftLevelConfigs.length === 0 ? (
          <HStack justify="space-between" align="center">
            <VStack align="start" gap={2}>
              <Skeleton h="14px" w="80px" borderRadius="md" />
              <Skeleton h="24px" w="120px" borderRadius="md" />
            </VStack>
          </HStack>
        ) : (
          <HStack justify="space-between" align="center">
            <VStack align="start" gap={1}>
              <HStack gap={1}>
                <Sparkle size={14} weight="fill" color="#8A8A90" />
                <Text fontSize="sm" color="whiteAlpha.600">{t('nft.current_level')}</Text>
              </HStack>
              {currentLevel ? (
                <HStack gap={2}>
                  <NFTBadge level={currentLevel} size="lg" showName />
                </HStack>
              ) : hasNFTHoldings ? (
                <Text fontSize="lg" fontWeight="bold" color="white">
                  {t('nft.not_staked_hint')}
                </Text>
              ) : (
                <Text fontSize="lg" fontWeight="bold" color="whiteAlpha.400">
                  {t('nft.no_nft')}
                </Text>
              )}
            </VStack>

            {currentConfig && (
              <VStack align="end" gap={0}>
                <Text fontSize="xs" color="whiteAlpha.500">
                  {t('nft.power_coefficient')} {currentConfig.coefficient}x
                </Text>
                <Text fontSize="xs" color="whiteAlpha.500">
                  {t('nft.pool_multiplier')} {currentConfig.nftExitMultiplier}x
                </Text>
                <Text fontSize="xs" color="whiteAlpha.500">
                  {t('nft.pic_burn_multiplier')} {userAssets?.picBurnExitMultiplier ?? 0}x
                </Text>
              </VStack>
            )}
          </HStack>
        )}
      </MotionBox>
    </GradientBorderCard>
  )
}
