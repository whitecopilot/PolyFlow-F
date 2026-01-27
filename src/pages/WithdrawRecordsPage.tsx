// 提现记录页面 - 二级页面

import { Box, Flex, Text, VStack, HStack } from '@chakra-ui/react'
import { motion } from 'framer-motion'
import { useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { SecondaryPageHeader } from '../components/layout'
import { ProgressBar } from '../components/common'
import { usePayFiStore } from '../stores/payfiStore'
import {
  HiOutlineBanknotes,
  HiOutlineCheckCircle,
  HiOutlineClock,
} from 'react-icons/hi2'

const MotionBox = motion.create(Box)

export function WithdrawRecordsPage() {
  const { t } = useTranslation()
  const { withdrawRecords, fetchWithdrawRecords } = usePayFiStore()

  useEffect(() => {
    fetchWithdrawRecords()
  }, [fetchWithdrawRecords])

  // 计算总提现
  const totalWithdrawn = withdrawRecords.reduce((sum, record) => sum + record.totalAmount, 0)
  const completedCount = withdrawRecords.filter((r) => r.status === 'completed').length
  const processingCount = withdrawRecords.filter((r) => r.status === 'processing').length

  return (
    <Box minH="100vh" bg="black">
      <SecondaryPageHeader title={t('withdraw_records.title')} />

      <VStack gap="4" p="4" align="stretch">
        {/* 提现统计 */}
        <MotionBox
          bg="#17171C"
          borderRadius="xl"
          p="4"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <Flex justify="space-between" align="center">
            <HStack gap={3}>
              <Flex
                w="12"
                h="12"
                borderRadius="xl"
                bg="rgba(34, 197, 94, 0.15)"
                align="center"
                justify="center"
              >
                <HiOutlineBanknotes size={20} color="#22C55E" />
              </Flex>
              <Box>
                <Text fontSize="sm" color="whiteAlpha.600">
                  {t('withdraw_records.total_withdrawn')}
                </Text>
                <Text fontSize="xl" fontWeight="bold" color="#22C55E">
                  {totalWithdrawn.toFixed(2)} PIC
                </Text>
              </Box>
            </HStack>
            <VStack align="end" gap={0}>
              <Text fontSize="xs" color="whiteAlpha.500">
                {t('withdraw_records.completed_count', { count: completedCount })}
              </Text>
              {processingCount > 0 && (
                <Text fontSize="xs" color="#EAB308">
                  {t('withdraw_records.releasing_count', { count: processingCount })}
                </Text>
              )}
            </VStack>
          </Flex>
        </MotionBox>

        {/* 记录列表 */}
        {withdrawRecords.length === 0 ? (
          <Flex
            direction="column"
            align="center"
            justify="center"
            py="16"
            color="whiteAlpha.400"
          >
            <HiOutlineBanknotes size={48} />
            <Text mt="4" fontSize="sm">
              {t('withdraw_records.no_records')}
            </Text>
          </Flex>
        ) : (
          <VStack gap={3}>
            {withdrawRecords.map((record, index) => (
              <MotionBox
                key={record.id}
                w="full"
                bg="#17171C"
                borderRadius="xl"
                p="4"
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.05 }}
              >
                <Flex justify="space-between" mb="2">
                  <HStack gap={2}>
                    {record.status === 'completed' ? (
                      <HiOutlineCheckCircle size={18} color="#22C55E" />
                    ) : (
                      <HiOutlineClock size={18} color="#EAB308" />
                    )}
                    <Text fontSize="md" fontWeight="600" color="white">
                      {record.totalAmount.toFixed(2)} PIC
                    </Text>
                  </HStack>
                  <Text
                    fontSize="sm"
                    color={record.status === 'completed' ? '#22C55E' : '#EAB308'}
                  >
                    {record.status === 'completed' ? t('withdraw_records.completed') : t('withdraw_records.releasing')}
                  </Text>
                </Flex>

                {record.status === 'processing' && (
                  <Box mb="3">
                    <ProgressBar
                      value={record.linearReleased}
                      max={record.linearAmount}
                      label={t('withdraw_records.linear_progress')}
                      height={6}
                      colorScheme="yellow"
                      showPercentage
                    />
                  </Box>
                )}

                <HStack gap={4} pt="2" borderTop="1px solid" borderColor="whiteAlpha.100">
                  <Box>
                    <Text fontSize="xs" color="whiteAlpha.400">{t('withdraw_records.instant_release')}</Text>
                    <Text fontSize="sm" color="#22C55E">${record.instantAmount.toFixed(2)}</Text>
                  </Box>
                  <Box>
                    <Text fontSize="xs" color="whiteAlpha.400">{t('withdraw_records.linear_release')}</Text>
                    <Text fontSize="sm" color="#EAB308">${record.linearAmount.toFixed(2)}</Text>
                  </Box>
                  <Box flex={1} textAlign="right">
                    <Text fontSize="xs" color="whiteAlpha.400">{t('withdraw_records.withdraw_time')}</Text>
                    <Text fontSize="sm" color="whiteAlpha.600">
                      {new Date(record.createdAt).toLocaleDateString()}
                    </Text>
                  </Box>
                </HStack>
              </MotionBox>
            ))}
          </VStack>
        )}

        {/* 底部间距 */}
        <Box h="8" />
      </VStack>
    </Box>
  )
}
