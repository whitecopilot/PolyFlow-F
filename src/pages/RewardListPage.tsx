// 收益列表页面 - 二级页面

import { Box, Flex, Text, VStack, HStack } from '@chakra-ui/react'
import { motion } from 'framer-motion'
import { useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { SecondaryPageHeader } from '../components/layout'
import { usePayFiStore } from '../stores/payfiStore'
import { getRewardTypeName } from '../mocks/payfiConfig'
import type { RewardType } from '../types/payfi'
import {
  HiOutlineBolt,
  HiOutlineUserGroup,
  HiOutlineBuildingLibrary,
  HiOutlineScale,
  HiOutlineGlobeAlt,
} from 'react-icons/hi2'

const MotionBox = motion.create(Box)

// 奖励类型图标映射
const REWARD_ICONS: Record<RewardType, React.ReactNode> = {
  static: <HiOutlineBolt size={20} color="#292FE1" />,
  referral: <HiOutlineUserGroup size={20} color="#D811F0" />,
  node: <HiOutlineBuildingLibrary size={20} color="#22C55E" />,
  same_level: <HiOutlineScale size={20} color="#EAB308" />,
  global: <HiOutlineGlobeAlt size={20} color="#06B6D4" />,
}

const REWARD_COLORS: Record<RewardType, string> = {
  static: '#292FE1',
  referral: '#D811F0',
  node: '#22C55E',
  same_level: '#EAB308',
  global: '#06B6D4',
}

export function RewardListPage() {
  const { t } = useTranslation()
  const { type } = useParams<{ type: string }>()
  const navigate = useNavigate()
  const { rewardRecords, fetchRewardRecordsByType } = usePayFiStore()

  // 验证类型是否有效
  const validTypes: RewardType[] = ['static', 'referral', 'node', 'same_level', 'global']
  const rewardType = validTypes.includes(type as RewardType) ? (type as RewardType) : null

  useEffect(() => {
    if (rewardType) {
      fetchRewardRecordsByType(rewardType)
    }
  }, [rewardType, fetchRewardRecordsByType])

  if (!rewardType) {
    // 无效类型，返回上一页
    navigate(-1)
    return null
  }

  // 记录已通过 API 按类型筛选，直接使用
  const filteredRecords = rewardRecords

  // 计算总收益
  const totalAmount = filteredRecords.reduce((sum, record) => sum + record.usdtValue, 0)

  const rewardTypeName = getRewardTypeName(rewardType)

  return (
    <Box minH="100vh" bg="#111111">
      <SecondaryPageHeader title={rewardTypeName} />

      <VStack gap="4" p="4" align="stretch">
        {/* 总收益统计 */}
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
                bg={`${REWARD_COLORS[rewardType]}15`}
                align="center"
                justify="center"
              >
                {REWARD_ICONS[rewardType]}
              </Flex>
              <Box>
                <Text fontSize="sm" color="whiteAlpha.600">
                  {t('reward_list.total_reward', { type: rewardTypeName })}
                </Text>
                <Text fontSize="xl" fontWeight="bold" color={REWARD_COLORS[rewardType]}>
                  ${totalAmount.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                </Text>
              </Box>
            </HStack>
            <Text fontSize="sm" color="whiteAlpha.500">
              {t('reward_list.total_records', { count: filteredRecords.length })}
            </Text>
          </Flex>
        </MotionBox>

        {/* 记录列表 */}
        {filteredRecords.length === 0 ? (
          <Flex
            direction="column"
            align="center"
            justify="center"
            py="16"
            color="whiteAlpha.400"
          >
            {REWARD_ICONS[rewardType]}
            <Text mt="4" fontSize="sm">
              {t('reward_list.no_records', { type: rewardTypeName })}
            </Text>
          </Flex>
        ) : (
          <VStack gap={2}>
            {filteredRecords.map((record, index) => (
              <MotionBox
                key={record.id}
                w="full"
                bg="#17171C"
                borderRadius="xl"
                p="4"
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.03 }}
              >
                <Flex justify="space-between" align="center">
                  <Box>
                    <Text fontSize="md" fontWeight="600" color="white">
                      +${record.usdtValue.toFixed(2)}
                    </Text>
                    <Text fontSize="xs" color="whiteAlpha.500">
                      {new Date(record.rewardDate).toLocaleString()}
                    </Text>
                    {record.sourceAddress && (
                      <Text fontSize="xs" color="whiteAlpha.400" mt="1">
                        {t('reward_list.from')} {record.sourceAddress}
                      </Text>
                    )}
                  </Box>
                  <VStack align="end" gap={0}>
                    <Text fontSize="sm" color={REWARD_COLORS[rewardType]}>
                      {record.picAmount.toFixed(2)} PIC
                    </Text>
                  </VStack>
                </Flex>
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
