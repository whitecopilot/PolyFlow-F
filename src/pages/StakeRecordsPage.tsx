
import { Box, Flex, HStack, Text, VStack, Badge } from '@chakra-ui/react'
import { motion } from 'framer-motion'
import { HiOutlineLockClosed } from 'react-icons/hi2'
import { useTranslation } from 'react-i18next'
import { SecondaryPageHeader } from '../components/layout'

const MotionBox = motion.create(Box)

// 暂时定义本地类型，后续如果有 API 再移到 types 目录
interface StakeRecord {
  id: number
  amount: number
  duration: number // months
  apy: number
  status: 'active' | 'completed'
  createdAt: string
}

export function StakeRecordsPage() {
  const { t } = useTranslation()
  // 暂时使用空数组，后续对接 API
  const stakeRecords: StakeRecord[] = []

  return (
    <Box minH="100vh" bg="#111111">
      <SecondaryPageHeader title={t('stake_records.title')} />

      <VStack gap="3" p="4" align="stretch">
        {stakeRecords.length === 0 ? (
          <Flex
            direction="column"
            align="center"
            justify="center"
            py="16"
            color="whiteAlpha.400"
          >
            <HiOutlineLockClosed size={48} />
            <Text mt="4" fontSize="sm">
              {t('stake_records.no_records')}
            </Text>
          </Flex>
        ) : (
          stakeRecords.map((record, index) => (
            <MotionBox
              key={record.id}
              bg="#17171C"
              borderRadius="xl"
              p="4"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.03 }}
            >
              <Flex justify="space-between" align="center">
                <HStack gap={3}>
                  <Flex
                    w="10"
                    h="10"
                    borderRadius="xl"
                    bg="rgba(41, 47, 225, 0.15)"
                    align="center"
                    justify="center"
                  >
                    <HiOutlineLockClosed size={20} color="#292FE1" />
                  </Flex>
                  <Box>
                    <Text fontSize="md" fontWeight="600" color="white">
                      {record.amount.toFixed(2)} PID
                    </Text>
                    <Text fontSize="xs" color="whiteAlpha.500">
                      {new Date(record.createdAt).toLocaleString()}
                    </Text>
                  </Box>
                </HStack>
                <VStack align="end" gap={0}>
                  <Badge
                    colorScheme={record.status === 'active' ? 'green' : 'gray'}
                    variant="solid"
                    fontSize="xs"
                    px="2"
                    borderRadius="full"
                  >
                    {record.status === 'active' ? t('stake_records.status_active') : t('stake_records.status_completed')}
                  </Badge>
                  <Text fontSize="xs" color="whiteAlpha.500" mt="1">
                    {record.duration} {t('assets.months')} / {record.apy}% APY
                  </Text>
                </VStack>
              </Flex>
            </MotionBox>
          ))
        )}

        {/* 底部间距 */}
        <Box h="8" />
      </VStack>
    </Box>
  )
}
