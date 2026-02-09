import { Box, Flex, SimpleGrid, Text, HStack } from '@chakra-ui/react'
import { motion } from 'framer-motion'
import { useTranslation } from 'react-i18next'
import { HiOutlineCalendarDays } from 'react-icons/hi2'
import { ProgressBar } from '../common'
import { usePayFiStore } from '../../stores/payfiStore'

const MotionBox = motion.create(Box)

export function PIDReleaseCard() {
  const { t } = useTranslation()
  const { pidReleasePlans, systemConfig } = usePayFiStore()

  if (pidReleasePlans.length === 0) return null

  return (
    <Box>
      <HStack gap={2} mb="3">
        <HiOutlineCalendarDays size={18} color="#8A8A90" />
        <Text fontSize="sm" fontWeight="600" color="whiteAlpha.600">
          {t('assets.pid_release_plans')}
        </Text>
      </HStack>

      {pidReleasePlans.map((plan, index) => (
        <MotionBox
          key={plan.id}
          bg="#17171C"
          borderRadius="xl"
          p="4"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 + index * 0.05 }}
        >
          <Flex justify="space-between" mb="3">
            <Text fontSize="sm" color="whiteAlpha.700">
              {t('assets.release_progress')}
            </Text>
            <Text fontSize="sm" color="white" fontWeight="medium">
              {plan.monthsCompleted}/{plan.monthsTotal} {t('assets.months')}
            </Text>
          </Flex>

          <ProgressBar
            value={plan.releasedAmount}
            max={plan.totalAmount}
            showPercentage
            colorScheme="brand"
            height={8}
          />

          <SimpleGrid columns={2} gap={3} mt="3">
            <Box>
              <Text fontSize="xs" color="whiteAlpha.500">
                {t('assets.total_amount')}
              </Text>
              <Text fontSize="sm" fontWeight="medium" color="white">
                {plan.totalAmount.toFixed(2)} PID
              </Text>
            </Box>
            <Box>
              <Text fontSize="xs" color="whiteAlpha.500">
                {t('assets.released')}
              </Text>
              <Text fontSize="sm" fontWeight="medium" color="white">
                {plan.releasedAmount.toFixed(2)} PID
              </Text>
            </Box>
            <Box>
              <Text fontSize="xs" color="whiteAlpha.500">
                {t('assets.daily_release')}
              </Text>
              <Text fontSize="sm" fontWeight="medium" color="white">
                {plan.dailyAmount.toFixed(4)} PID
              </Text>
            </Box>
            <Box>
              <Text fontSize="xs" color="whiteAlpha.500">
                {t('assets.monthly_rate')}
              </Text>
              <Text fontSize="sm" fontWeight="medium" color="white">
                {((systemConfig?.pidMonthlyRate ?? 0.04) * 100).toFixed(0)}%
              </Text>
            </Box>
          </SimpleGrid>
        </MotionBox>
      ))}
    </Box>
  )
}
