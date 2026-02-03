// 等级徽章组件 - NFT 和节点等级显示

import { Box, HStack, Text } from '@chakra-ui/react'
import { useTranslation } from 'react-i18next'
import type { NFTLevel, NodeLevel } from '../../types/payfi'

// NFT 等级徽章
interface NFTBadgeProps {
  level: NFTLevel
  size?: 'sm' | 'md' | 'lg'
  showName?: boolean
}

const NFT_COLORS: Record<string, { bg: string; border: string; glow: string }> = {
  N1: { bg: '#2A2A2E', border: '#3A3A40', glow: 'rgba(60, 60, 65, 0.3)' },
  N2: { bg: '#3A3A40', border: '#4A4A50', glow: 'rgba(80, 80, 85, 0.3)' },
  N3: { bg: '#4A4A50', border: '#5A5A60', glow: 'rgba(100, 100, 105, 0.3)' },
  N4: { bg: '#5A5A60', border: '#6A6A70', glow: 'rgba(120, 120, 125, 0.3)' },
  N5: {
    bg: 'linear-gradient(135deg, #1A1A1E 0%, #3A3A40 50%, #5A5A60 100%)',
    border: '#7A7A80',
    glow: 'rgba(140, 140, 145, 0.4)',
  },
}

const NFT_NAMES: Record<string, string> = {
  N1: 'Starter',
  N2: 'Bronze',
  N3: 'Silver',
  N4: 'Gold',
  N5: 'Diamond',
}

export function NFTBadge({ level, size = 'md', showName = false }: NFTBadgeProps) {
  const { t } = useTranslation()
  
  if (!level) {
    return (
      <Box px={size === 'sm' ? 2 : 3} py={size === 'sm' ? 0.5 : 1} bg="whiteAlpha.100" borderRadius="full">
        <Text fontSize={size === 'sm' ? 'xs' : 'sm'} color="whiteAlpha.500">
          {t('nft_level_badge.none')}
        </Text>
      </Box>
    )
  }

  const colors = NFT_COLORS[level] || NFT_COLORS.N1
  const name = t(`nft_level.${level}`) || NFT_NAMES[level]

  const sizeStyles = {
    sm: { px: 2, py: 0.5, fontSize: 'xs' },
    md: { px: 3, py: 1, fontSize: 'sm' },
    lg: { px: 4, py: 1.5, fontSize: 'md' },
  }

  const styles = sizeStyles[size]

  return (
    <Box
      display="inline-flex"
      alignItems="center"
      gap={1}
      px={styles.px}
      py={styles.py}
      bg={colors.bg}
      borderWidth="1px"
      borderColor={colors.border}
      borderRadius="full"
      boxShadow={`0 0 12px ${colors.glow}`}
      transition="transform 0.2s"
      _hover={{ transform: 'scale(1.05)' }}
    >
      <Text fontSize={styles.fontSize} fontWeight="bold" color="white">
        {level}
      </Text>
      {showName && (
        <Text fontSize={styles.fontSize} color="whiteAlpha.800">
          {name}
        </Text>
      )}
    </Box>
  )
}

// 节点等级徽章
interface NodeBadgeProps {
  level: NodeLevel
  size?: 'sm' | 'md' | 'lg'
  showName?: boolean
}

const NODE_COLORS: Record<NodeLevel, { bg: string; border: string }> = {
  P0: { bg: '#2A2A2E', border: '#3A3A40' },
  P1: { bg: '#2A2A2E', border: '#3A3A40' },
  P2: { bg: '#32323A', border: '#42424A' },
  P3: { bg: '#3A3A42', border: '#4A4A52' },
  P4: { bg: '#42424A', border: '#52525A' },
  P5: { bg: '#4A4A52', border: '#5A5A62' },
  P6: { bg: '#52525A', border: '#62626A' },
  P7: { bg: '#5A5A62', border: '#6A6A72' },
  P8: { bg: '#62626A', border: '#72727A' },
  P9: { bg: 'linear-gradient(135deg, #1A1A1E 0%, #3A3A40 50%, #5A5A60 100%)', border: '#7A7A80' },
}

const NODE_NAMES: Record<NodeLevel, string> = {
  P0: 'node',
  P1: 'node',
  P2: 'node',
  P3: 'node',
  P4: 'node',
  P5: 'node',
  P6: 'node',
  P7: 'node',
  P8: 'node',
  P9: 'node',
}

export function NodeBadge({ level, size = 'md', showName = false }: NodeBadgeProps) {
  const { t } = useTranslation()
  const colors = NODE_COLORS[level]
  const name = t(`node_level.${level}`) || NODE_NAMES[level]

  const sizeStyles = {
    sm: { px: 2, py: 0.5, fontSize: 'xs' },
    md: { px: 3, py: 1, fontSize: 'sm' },
    lg: { px: 4, py: 1.5, fontSize: 'md' },
  }

  const styles = sizeStyles[size]

  return (
    <Box
      display="inline-flex"
      alignItems="center"
      gap={1}
      px={styles.px}
      py={styles.py}
      bg={colors.bg}
      borderWidth="1px"
      borderColor={colors.border}
      borderRadius="full"
      transition="transform 0.2s"
      _hover={{ transform: 'scale(1.05)' }}
    >
      <Text fontSize={styles.fontSize} fontWeight="bold" color="white">
        {level}
      </Text>
      {showName && (
        <Text fontSize={styles.fontSize} color="whiteAlpha.800">
          {name}
        </Text>
      )}
    </Box>
  )
}

// 组合徽章显示（NFT + 节点）
export function CombinedBadges({
  nftLevel,
  nodeLevel,
  size = 'sm',
}: {
  nftLevel: NFTLevel
  nodeLevel: NodeLevel
  size?: 'sm' | 'md'
}) {
  return (
    <HStack gap={1}>
      <NFTBadge level={nftLevel} size={size} />
      <NodeBadge level={nodeLevel} size={size} />
    </HStack>
  )
}

export default NFTBadge
