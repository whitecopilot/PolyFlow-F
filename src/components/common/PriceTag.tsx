// 价格标签组件 - 显示价格和涨跌

import { HStack, Text } from '@chakra-ui/react'

interface PriceTagProps {
  label: string
  price: number
  change?: number
  decimals?: number
  showChange?: boolean
  size?: 'sm' | 'md' | 'lg'
}

export function PriceTag({
  label,
  price,
  change = 0,
  decimals = 2,
  showChange = true,
  size = 'md',
}: PriceTagProps) {
  const isPositive = change >= 0

  const sizeStyles = {
    sm: { labelSize: 'xs', priceSize: 'sm', changeSize: 'xs' },
    md: { labelSize: 'sm', priceSize: 'md', changeSize: 'sm' },
    lg: { labelSize: 'md', priceSize: 'lg', changeSize: 'md' },
  }

  const styles = sizeStyles[size]

  return (
    <HStack gap={2} align="center">
      <Text color="whiteAlpha.600" fontSize={styles.labelSize}>
        {label}
      </Text>
      <Text color="white" fontWeight="semibold" fontSize={styles.priceSize}>
        ${price.toFixed(decimals)}
      </Text>
      {showChange && (
        <Text color={isPositive ? 'green.400' : 'red.400'} fontSize={styles.changeSize} fontWeight="medium">
          {isPositive ? '↑' : '↓'}
          {Math.abs(change).toFixed(4)}
        </Text>
      )}
    </HStack>
  )
}

// 紧凑版价格显示
export function PriceCompact({
  label,
  price,
  change,
  showChange = true,
}: {
  label: string
  price: number
  change?: number
  showChange?: boolean
}) {
  const isPositive = (change ?? 0) >= 0

  return (
    <HStack gap={1} fontSize="xs">
      <Text color="whiteAlpha.500">{label}</Text>
      <Text color="white" fontWeight="medium">
        ${price.toFixed(4)}
      </Text>
      {showChange && change !== undefined && (
        <Text color="whiteAlpha.500">
          {isPositive ? '+' : ''}
          {(change * 100).toFixed(2)}%
        </Text>
      )}
    </HStack>
  )
}

export default PriceTag
