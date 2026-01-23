import { Box, Text, Flex } from '@chakra-ui/react'
import { motion } from 'framer-motion'

const MotionBox = motion.create(Box)

interface StatCardProps {
  label: string
  value: string
  unit?: string
  subValue?: string
  icon?: React.ReactNode
  color?: string
  delay?: number
}

export function StatCard({
  label,
  value,
  unit,
  subValue,
  icon,
  color = 'brand.primary',
  delay = 0,
}: StatCardProps) {
  return (
    <MotionBox
      p="4"
      bg="bg.card"
      borderRadius="16px"
      border="1px solid"
      borderColor="border.default"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay }}
    >
      <Flex justify="space-between" align="flex-start" mb="2">
        <Text fontSize="xs" color="text.muted" fontWeight="500">
          {label}
        </Text>
        {icon && (
          <Box color={color} opacity={0.8}>
            {icon}
          </Box>
        )}
      </Flex>
      <Flex align="baseline" gap="1">
        <Text
          fontSize="xl"
          fontWeight="700"
          color="text.primary"
          fontFamily="heading"
        >
          {value}
        </Text>
        {unit && (
          <Text fontSize="sm" color="text.secondary" fontWeight="500">
            {unit}
          </Text>
        )}
      </Flex>
      {subValue && (
        <Text fontSize="xs" color={color} mt="1">
          {subValue}
        </Text>
      )}
    </MotionBox>
  )
}
