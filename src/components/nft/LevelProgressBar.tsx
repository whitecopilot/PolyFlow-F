import { Box, HStack, Skeleton, Text, VStack } from '@chakra-ui/react'
import { motion } from 'framer-motion'
import { HiOutlineCheck } from 'react-icons/hi2'
import { usePayFiStore } from '../../stores/payfiStore'
import type { NFTLevel } from '../../types/payfi'

const MotionBox = motion.create(Box)

interface LevelProgressBarProps {
  selectedLevel: NFTLevel
  onSelectLevel: (level: NFTLevel) => void
}

export function LevelProgressBar({ selectedLevel, onSelectLevel }: LevelProgressBarProps) {
  const { userAssets, nftLevelConfigs } = usePayFiStore()

  const currentLevel = userAssets?.currentNFTLevel ?? null
  const currentLevelIndex = currentLevel
    ? nftLevelConfigs.findIndex(c => c.level === currentLevel)
    : -1

  return (
    <Box px="2">
      {nftLevelConfigs.length === 0 ? (
        <HStack justify="space-between" position="relative">
          <Box
            position="absolute"
            top="20px"
            left="8%"
            right="8%"
            h="2px"
            bg="whiteAlpha.200"
          />
          {[0, 1, 2, 3, 4].map((index) => (
            <VStack key={index} gap={1} zIndex={1}>
              <Skeleton w={8} h={8} borderRadius="full" />
              <Skeleton h="10px" w="20px" borderRadius="md" />
            </VStack>
          ))}
        </HStack>
      ) : (
        <HStack justify="space-between" position="relative">
          <Box
            position="absolute"
            top="20px"
            left="8%"
            right="8%"
            h="2px"
            bg="whiteAlpha.200"
          />

          <MotionBox
            position="absolute"
            top="20px"
            left="8%"
            h="2px"
            bg="linear-gradient(90deg, #4A4A50 0%, #8A8A90 100%)"
            initial={{ width: 0 }}
            animate={{
              width: currentLevelIndex >= 0 && nftLevelConfigs.length > 1
                ? `${(currentLevelIndex / (nftLevelConfigs.length - 1)) * 84}%`
                : '0%',
            }}
            transition={{ duration: 0.8 }}
          />

          {nftLevelConfigs.map((config, index) => {
            const isOwned = currentLevelIndex >= index
            const isCurrent = currentLevel === config.level
            const isSelected = selectedLevel === config.level

            return (
              <VStack
                key={config.level}
                gap={1}
                zIndex={1}
                cursor="pointer"
                onClick={() => onSelectLevel(config.level as NFTLevel)}
              >
                <MotionBox
                  w={isCurrent || isSelected ? 10 : 8}
                  h={isCurrent || isSelected ? 10 : 8}
                  borderRadius="full"
                  bg={isOwned ? '#5A5A60' : isSelected ? '#8A8A90' : 'whiteAlpha.200'}
                  display="flex"
                  alignItems="center"
                  justifyContent="center"
                  borderWidth={isSelected ? 2 : 0}
                  borderColor="#9A9A9F"
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.95 }}
                >
                  {isOwned ? (
                    <HiOutlineCheck size={16} color="white" />
                  ) : (
                    <Text fontSize="xs" color="white" fontWeight="bold">
                      {config.level}
                    </Text>
                  )}
                </MotionBox>
              </VStack>
            )
          })}
        </HStack>
      )}
    </Box>
  )
}
