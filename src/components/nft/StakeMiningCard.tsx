import { Box, HStack, Text, VStack } from '@chakra-ui/react'
import { motion } from 'framer-motion'
import { useTranslation } from 'react-i18next'
import { HiOutlineCube } from 'react-icons/hi2'
import { GradientBorderCard } from '../common'
import { usePayFiStore } from '../../stores/payfiStore'

const MotionBox = motion.create(Box)

interface StakeMiningCardProps {
  isStakingLoading: boolean
  onOpenSelector: () => void
}

export function StakeMiningCard({ isStakingLoading, onOpenSelector }: StakeMiningCardProps) {
  const { t } = useTranslation()
  const { userAssets, nftHoldings } = usePayFiStore()

  const isStakingEnabled = userAssets?.featureFlags?.pidStakingEnabled ?? false
  const totalNFTCount = nftHoldings.length
  const stakedNFTCount = nftHoldings.filter(n => n.isStaked).length
  const hasUnstakedNFTs = totalNFTCount - stakedNFTCount > 0

  if (!hasUnstakedNFTs) return null

  return (
    <MotionBox
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.1 }}
    >
      <GradientBorderCard
        glowIntensity={stakedNFTCount > 0 ? 'medium' : 'low'}
        staticBorder
      >
        <Box
          p="4"
          cursor={isStakingEnabled ? 'pointer' : 'not-allowed'}
          opacity={isStakingEnabled ? 1 : 0.5}
          onClick={() => isStakingEnabled && !isStakingLoading && onOpenSelector()}
          _hover={isStakingEnabled ? { bg: 'whiteAlpha.50' } : undefined}
          borderRadius="xl"
          transition="background-color 0.2s"
        >
          <HStack justify="space-between" align="start">
            <HStack gap={2}>
              <Box
                w="8"
                h="8"
                borderRadius="lg"
                bg={stakedNFTCount > 0 ? 'rgba(255, 255, 255, 0.15)' : 'rgba(255, 255, 255, 0.1)'}
                display="flex"
                alignItems="center"
                justifyContent="center"
              >
                <HiOutlineCube size={18} color="white" />
              </Box>
              <VStack align="start" gap={0}>
                <Text fontSize="sm" fontWeight="600" color="white">
                  {t('nft.stake_mining')}
                </Text>
                <Text fontSize="xs" color="whiteAlpha.500">
                  {t('nft.stake_to_mine')}
                </Text>
              </VStack>
            </HStack>

            <Box
              px="2.5"
              py="1"
              borderRadius="full"
              bg={stakedNFTCount > 0 ? 'rgba(255, 255, 255, 0.15)' : 'rgba(255, 255, 255, 0.1)'}
            >
              <Text fontSize="xs" fontWeight="bold" color="white">
                {stakedNFTCount > 0
                  ? t('nft.staked_ratio', { staked: stakedNFTCount, total: totalNFTCount })
                  : t('nft.unstaked_ratio', { staked: stakedNFTCount, total: totalNFTCount })}
              </Text>
            </Box>
          </HStack>
        </Box>
      </GradientBorderCard>
    </MotionBox>
  )
}
