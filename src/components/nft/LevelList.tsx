import { Box, Flex, HStack, Text, VStack } from '@chakra-ui/react'
import { motion } from 'framer-motion'
import { useTranslation } from 'react-i18next'
import { HiOutlineCheck, HiOutlineQueueList } from 'react-icons/hi2'
import { useNavigate } from 'react-router-dom'
import { LazyVideo } from '../common'
import { usePayFiStore } from '../../stores/payfiStore'
import type { NFTLevel } from '../../types/payfi'

const MotionBox = motion.create(Box)

const NFT_VIDEO_BASE_URL = 'https://static.polyflow.global/'
const getNFTVideoUrl = (level: string) => `${NFT_VIDEO_BASE_URL}${level.toLowerCase()}.mp4`

function NFTCardSkeleton({ index }: { index: number }) {
  return (
    <MotionBox
      w="full"
      bg="#17171C"
      borderRadius="xl"
      p="4"
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: index * 0.05 }}
    >
      <Flex justify="space-between" align="center">
        <HStack gap={3}>
          <Box w="56px" h="56px" borderRadius="lg" bg="#2A2A30" />
          <VStack align="start" gap={1}>
            <Box h="14px" w="80px" borderRadius="md" bg="#2A2A30" />
            <Box h="12px" w="120px" borderRadius="md" bg="#2A2A30" />
          </VStack>
        </HStack>
        <Box h="12px" w="40px" borderRadius="md" bg="#2A2A30" />
      </Flex>
    </MotionBox>
  )
}

interface LevelListProps {
  onSelectLevel: (level: NFTLevel) => void
}

export function LevelList({ onSelectLevel }: LevelListProps) {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const { userAssets, nftLevelConfigs, nftHoldingStats } = usePayFiStore()

  const currentLevel = userAssets?.currentNFTLevel ?? null
  const currentLevelIndex = currentLevel
    ? nftLevelConfigs.findIndex(c => c.level === currentLevel)
    : -1

  return (
    <Box>
      <Flex justify="space-between" align="center" mb="3">
        <Text fontSize="sm" fontWeight="600" color="whiteAlpha.600">
          {t('nft.all_levels')}
        </Text>
        <HStack
          gap={1}
          cursor="pointer"
          onClick={() => navigate('/nft-list')}
          _hover={{ opacity: 0.8 }}
        >
          <HiOutlineQueueList size={14} color="rgba(255, 255, 255, 0.6)" />
          <Text fontSize="sm" fontWeight="600" color="whiteAlpha.600">
            {t('nft.mint_list')}
          </Text>
        </HStack>
      </Flex>
      <VStack gap={2}>
        {nftLevelConfigs.length === 0 ? (
          <>
            {[0, 1, 2, 3, 4].map((index) => (
              <NFTCardSkeleton key={index} index={index} />
            ))}
          </>
        ) : (
          nftLevelConfigs.map((config, index) => {
            const isOwned = currentLevelIndex >= index
            const isCurrent = currentLevel === config.level

            return (
              <MotionBox
                key={config.level}
                w="full"
                bg={isCurrent ? 'rgba(74, 74, 80, 0.15)' : '#17171C'}
                borderRadius="xl"
                p="4"
                borderWidth={isCurrent ? 1 : 0}
                borderColor="#4A4A50"
                cursor="pointer"
                onClick={() => onSelectLevel(config.level as NFTLevel)}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.05 }}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <Flex justify="space-between" align="center">
                  <HStack gap={3}>
                    <LazyVideo
                      src={getNFTVideoUrl(config.level)}
                      width="56px"
                      height="56px"
                      borderRadius="lg"
                    />
                    <VStack align="start" gap={0}>
                      <Text fontSize="sm" fontWeight="600" color="white">
                        {config.level} {t(`nft_level.${config.level}`)}
                      </Text>
                      <Text fontSize="xs" color="whiteAlpha.500">
                        ${config.price.toLocaleString()} · {t('nft.power')} {config.power}
                      </Text>
                    </VStack>
                  </HStack>

                  <HStack gap={2}>
                    <Text fontSize="xs" color="whiteAlpha.500">
                      {t('nft.holding_count', { count: config.level ? (nftHoldingStats?.byType?.[config.level] ?? 0) : 0 })}
                    </Text>
                    {isCurrent && (
                      <Box px="2" py="0.5" bg="#4A4A50" borderRadius="full">
                        <Text fontSize="xs" color="white" fontWeight="bold">
                          {t('nft.current')}
                        </Text>
                      </Box>
                    )}
                    {isOwned && !isCurrent && (
                      <HiOutlineCheck size={20} color="#22C55E" />
                    )}
                  </HStack>
                </Flex>
              </MotionBox>
            )
          })
        )}
      </VStack>
    </Box>
  )
}
