// 销毁记录页面 - 二级页面

import { Box, Flex, HStack, Text, VStack } from '@chakra-ui/react'
import { motion } from 'framer-motion'
import { useEffect } from 'react'
import { HiOutlineFire } from 'react-icons/hi2'
import { SecondaryPageHeader } from '../components/layout'
import { usePayFiStore } from '../stores/payfiStore'

const MotionBox = motion.create(Box)

export function BurnRecordsPage() {
  const { burnRecords, fetchAllData } = usePayFiStore()

  useEffect(() => {
    // 如果没有数据，重新加载
    if (burnRecords.length === 0) {
      fetchAllData()
    }
  }, [burnRecords.length, fetchAllData])

  return (
    <Box minH="100vh" bg="black">
      <SecondaryPageHeader title="销毁记录" />

      <VStack gap="3" p="4" align="stretch">
        {burnRecords.length === 0 ? (
          <Flex
            direction="column"
            align="center"
            justify="center"
            py="16"
            color="whiteAlpha.400"
          >
            <HiOutlineFire size={48} />
            <Text mt="4" fontSize="sm">
              暂无销毁记录
            </Text>
          </Flex>
        ) : (
          burnRecords.map((record, index) => (
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
                    bg="rgba(216, 17, 240, 0.15)"
                    align="center"
                    justify="center"
                  >
                    <HiOutlineFire size={20} color="#D811F0" />
                  </Flex>
                  <Box>
                    <Text fontSize="md" fontWeight="600" color="white">
                      {record.picAmount.toFixed(2)} PIC
                    </Text>
                    <Text fontSize="xs" color="whiteAlpha.500">
                      {new Date(record.createdAt).toLocaleString()}
                    </Text>
                  </Box>
                </HStack>
                <VStack align="end" gap={0}>
                  <Text fontSize="sm" fontWeight="600" color="#22C55E">
                    +{record.powerAdded.toLocaleString()} 算力值
                  </Text>
                  <Text fontSize="xs" color="whiteAlpha.500">
                    +${record.exitAdded.toLocaleString()} 矿池量
                  </Text>
                </VStack>
              </Flex>

              <HStack gap={4} mt="3" pt="3" borderTop="1px solid" borderColor="whiteAlpha.100">
                <Box>
                  <Text fontSize="xs" color="whiteAlpha.400">USDT 价值</Text>
                  <Text fontSize="sm" color="white">${record.usdtValue.toFixed(2)}</Text>
                </Box>
                <Box>
                  <Text fontSize="xs" color="whiteAlpha.400">矿池倍数</Text>
                  <Text fontSize="sm" color="white">{record.exitMultiplier}x</Text>
                </Box>
              </HStack>
            </MotionBox>
          ))
        )}

        {/* 底部间距 */}
        <Box h="8" />
      </VStack>
    </Box>
  )
}
