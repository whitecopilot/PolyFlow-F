import { Box, HStack, Text, VStack } from '@chakra-ui/react'
import { motion } from 'framer-motion'
import { useTranslation } from 'react-i18next'
import { HiOutlineXMark } from 'react-icons/hi2'
import { ActionButton, NFTBadge } from '../common'
import type { NFTLevel } from '../../types/payfi'
import type { UserNFTItem } from '../../api/types'

const MotionBox = motion.create(Box)

interface NFTSelectorOverlayProps {
  nfts: UserNFTItem[]
  filterLevel?: string | null
  onSelect: (nft: UserNFTItem) => void
  onClose: () => void
}

export function NFTSelectorOverlay({ nfts, filterLevel, onSelect, onClose }: NFTSelectorOverlayProps) {
  const { t } = useTranslation()

  return (
    <MotionBox
      position="fixed"
      inset={0}
      bg="blackAlpha.800"
      zIndex={1000}
      display="flex"
      alignItems="center"
      justifyContent="center"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onClick={onClose}
    >
      <VStack
        gap={4}
        p={6}
        bg="rgba(23, 23, 28, 0.95)"
        borderRadius="2xl"
        borderWidth={1}
        borderColor="whiteAlpha.100"
        maxW="340px"
        w="90%"
        maxH="70vh"
        onClick={(e) => e.stopPropagation()}
      >
        <HStack w="full" justify="space-between" align="center">
          <HStack gap={2}>
            <Text fontSize="lg" fontWeight="bold" color="white">
              {t('nft.select_nft_to_stake')}
            </Text>
            {filterLevel && (
              <Box px={2} py={0.5} bg="rgba(138, 138, 144, 0.2)" borderRadius="full">
                <Text fontSize="xs" color="#8A8A90" fontWeight="bold">
                  {filterLevel}
                </Text>
              </Box>
            )}
          </HStack>
          <Box
            as="button"
            p={1}
            borderRadius="md"
            _hover={{ bg: 'whiteAlpha.100' }}
            onClick={onClose}
          >
            <HiOutlineXMark size={20} color="white" />
          </Box>
        </HStack>

        <Text fontSize="sm" color="whiteAlpha.600" w="full">
          {t('nft.select_nft_hint')}
        </Text>

        <VStack
          w="full"
          gap={2}
          maxH="45vh"
          overflowY="auto"
          css={{
            '&::-webkit-scrollbar': { width: '4px' },
            '&::-webkit-scrollbar-track': { background: 'transparent' },
            '&::-webkit-scrollbar-thumb': { background: 'rgba(255,255,255,0.2)', borderRadius: '2px' },
          }}
        >
          {nfts.map((nft) => (
            <Box
              key={nft.id}
              w="full"
              p={3}
              bg="whiteAlpha.50"
              borderRadius="lg"
              cursor="pointer"
              _hover={{ bg: 'whiteAlpha.100' }}
              onClick={() => onSelect(nft)}
            >
              <HStack justify="space-between" align="center">
                <HStack gap={3}>
                  <NFTBadge level={nft.nftLevel as NFTLevel} size="sm" />
                  <VStack align="start" gap={0}>
                    <Text fontSize="sm" fontWeight="600" color="white">
                      Token #{nft.tokenId}
                    </Text>
                    <Text fontSize="xs" color="whiteAlpha.500">
                      {t('nft.power')} {nft.power}
                    </Text>
                  </VStack>
                </HStack>
                <Box px={2} py={0.5} bg="rgba(138, 138, 144, 0.2)" borderRadius="full">
                  <Text fontSize="xs" color="#8A8A90" fontWeight="bold">
                    {nft.nftLevel}
                  </Text>
                </Box>
              </HStack>
            </Box>
          ))}
        </VStack>

        <ActionButton variant="secondary" size="md" onClick={onClose} w="full">
          {t('common.cancel')}
        </ActionButton>
      </VStack>
    </MotionBox>
  )
}
