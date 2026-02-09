import { Box, HStack, SimpleGrid, Text } from '@chakra-ui/react'
import { useTranslation } from 'react-i18next'
import { HiOutlineArrowPath, HiOutlineLockClosed } from 'react-icons/hi2'
import { GradientBorderCard, PicLogo, PolyFlowLogo } from '../common'
import { usePayFiStore } from '../../stores/payfiStore'

interface AssetCardProps {
  type: 'PID' | 'PIC'
}

export function AssetCard({ type }: AssetCardProps) {
  const { t } = useTranslation()
  const { userAssets, priceInfo } = usePayFiStore()

  const isPID = type === 'PID'
  const Logo = isPID ? PolyFlowLogo : PicLogo
  const price = isPID ? priceInfo?.pidPrice : priceInfo?.picPrice

  const locked = isPID ? userAssets?.pidTotalLocked || 0 : 0
  const released = isPID ? userAssets?.pidReleased || 0 : userAssets?.picReleasedBalance || 0
  const available = isPID ? userAssets?.pidBalance || 0 : userAssets?.picBalance || 0

  const totalValue = isPID
    ? ((userAssets?.pidTotalLocked || 0) + (userAssets?.pidBalance || 0)) * (priceInfo?.pidPrice || 0)
    : ((userAssets?.picBalance || 0) + (userAssets?.picReleasedBalance || 0)) * (priceInfo?.picPrice || 0)

  return (
    <GradientBorderCard glowIntensity="low" staticBorder>
      <Box p="4">
        <HStack justify="space-between" mb="3">
          <HStack gap={2}>
            <Box
              w="7"
              h="7"
              borderRadius="full"
              bg="white"
              display="flex"
              alignItems="center"
              justifyContent="center"
            >
              <Logo size={22} />
            </Box>
            <Text fontSize="md" fontWeight="600" color="white">
              {type}
            </Text>
          </HStack>
          <Text fontSize="xs" color="whiteAlpha.500">
            ${price?.toFixed(4) || '0.00'}
          </Text>
        </HStack>

        <SimpleGrid columns={3} gap={3} mb="4">
          <Box>
            <HStack gap={1} mb={1}>
              <HiOutlineLockClosed size={12} color="#71717A" />
              <Text fontSize="xs" color="whiteAlpha.500">
                {t('assets.locked')}
              </Text>
            </HStack>
            <Text fontSize="lg" fontWeight="bold" color="whiteAlpha.600">
              {isPID ? locked.toFixed(2) : '0.00'}
            </Text>
          </Box>
          <Box>
            <HStack gap={1} mb={1}>
              <HiOutlineArrowPath size={12} color="#8A8A90" />
              <Text fontSize="xs" color="whiteAlpha.500">
                {t('assets.released')}
              </Text>
            </HStack>
            <Text fontSize="lg" fontWeight="bold" color="white">
              {released.toFixed(2)}
            </Text>
          </Box>
          <Box>
            <HStack gap={1} mb={1}>
              <Box
                w="14px"
                h="14px"
                borderRadius="sm"
                bg="white"
                display="flex"
                alignItems="center"
                justifyContent="center"
              >
                <Logo size={10} />
              </Box>
              <Text fontSize="xs" color="whiteAlpha.500">
                {t('assets.available')}
              </Text>
            </HStack>
            <Text fontSize="lg" fontWeight="bold" color="white">
              {available.toFixed(2)}
            </Text>
          </Box>
        </SimpleGrid>

        <Text fontSize="xs" color="whiteAlpha.400">
          ≈ ${totalValue.toFixed(2)} USDT
        </Text>
      </Box>
    </GradientBorderCard>
  )
}
