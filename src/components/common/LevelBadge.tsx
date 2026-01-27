// 等级徽章组件 - NFT 和节点等级显示

import { Box, HStack, Text } from '@chakra-ui/react'
import {
  Crown,
  Cube,
  Diamond,
  DiamondsFour,
  Hexagon,
  Octagon,
  Pentagon,
  Star,
  Trophy,
} from '@phosphor-icons/react'
import type { NFTLevel, NodeLevel } from '../../types/payfi'

// NFT 等级徽章
interface NFTBadgeProps {
  level: NFTLevel
  size?: 'sm' | 'md' | 'lg'
  showName?: boolean
}

const NFT_COLORS: Record<string, { bg: string; border: string; glow: string }> = {
  N1: { bg: '#3D4A5C', border: '#5A6B7D', glow: 'rgba(90, 107, 125, 0.3)' },
  N2: { bg: '#CD7F32', border: '#DDA15E', glow: 'rgba(205, 127, 50, 0.3)' },
  N3: { bg: '#C0C0C0', border: '#E8E8E8', glow: 'rgba(192, 192, 192, 0.3)' },
  N4: { bg: '#FFD700', border: '#FFF8DC', glow: 'rgba(255, 215, 0, 0.4)' },
  N5: {
    bg: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    border: '#A78BFA',
    glow: 'rgba(167, 139, 250, 0.5)',
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
  if (!level) {
    return (
      <Box px={size === 'sm' ? 2 : 3} py={size === 'sm' ? 0.5 : 1} bg="whiteAlpha.100" borderRadius="full">
        <Text fontSize={size === 'sm' ? 'xs' : 'sm'} color="whiteAlpha.500">
          无
        </Text>
      </Box>
    )
  }

  const colors = NFT_COLORS[level] || NFT_COLORS.N1
  const name = NFT_NAMES[level]

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

const NODE_COLORS: Record<NodeLevel, { bg: string; border: string; Icon: React.ComponentType<{ size?: number; weight?: 'thin' | 'light' | 'regular' | 'bold' | 'fill' | 'duotone' }> | null }> = {
  P0: { bg: '#2D3748', border: '#4A5568', Icon: null },
  P1: { bg: '#2C5282', border: '#3182CE', Icon: DiamondsFour },
  P2: { bg: '#9C4221', border: '#DD6B20', Icon: Hexagon },
  P3: { bg: '#6B7280', border: '#9CA3AF', Icon: Octagon },
  P4: { bg: '#B7791F', border: '#ECC94B', Icon: Star },
  P5: { bg: '#5B21B6', border: '#8B5CF6', Icon: Diamond },
  P6: { bg: '#0891B2', border: '#22D3EE', Icon: Cube },
  P7: { bg: '#BE185D', border: '#F472B6', Icon: Pentagon },
  P8: { bg: '#7C3AED', border: '#A78BFA', Icon: Crown },
  P9: {
    bg: 'linear-gradient(135deg, #F59E0B 0%, #EF4444 50%, #8B5CF6 100%)',
    border: '#FCD34D',
    Icon: Trophy,
  },
}

const NODE_NAMES: Record<NodeLevel, string> = {
  P0: '节点',
  P1: '节点',
  P2: '节点',
  P3: '节点',
  P4: '节点',
  P5: '节点',
  P6: '节点',
  P7: '节点',
  P8: '节点',
  P9: '节点',
}

export function NodeBadge({ level, size = 'md', showName = false }: NodeBadgeProps) {
  const colors = NODE_COLORS[level]
  const name = NODE_NAMES[level]

  const sizeStyles = {
    sm: { px: 2, py: 0.5, fontSize: 'xs', iconSize: '10px' },
    md: { px: 3, py: 1, fontSize: 'sm', iconSize: '12px' },
    lg: { px: 4, py: 1.5, fontSize: 'md', iconSize: '14px' },
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
      {colors.Icon && <colors.Icon size={parseInt(styles.iconSize)} weight="fill" />}
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
