// 收益列表页面 - 二级页面

import { Box, Flex, Text, VStack, HStack, Spinner } from '@chakra-ui/react'
import { motion } from 'framer-motion'
import { useEffect, useCallback, useRef } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { SecondaryPageHeader } from '../components/layout'
import { usePayFiStore } from '../stores/payfiStore'
import type { RewardType } from '../types/payfi'
import {
  HiOutlineBolt,
  HiOutlineUserGroup,
  HiOutlineBuildingLibrary,
  HiOutlineScale,
  HiOutlineGlobeAlt,
} from 'react-icons/hi2'

const MotionBox = motion.create(Box)

// 奖励类型图标映射 - 统一使用灰白配色
const REWARD_ICONS: Record<RewardType, React.ReactNode> = {
  static: <HiOutlineBolt size={20} color="#8A8A90" />,
  referral: <HiOutlineUserGroup size={20} color="#8A8A90" />,
  node: <HiOutlineBuildingLibrary size={20} color="#8A8A90" />,
  same_level: <HiOutlineScale size={20} color="#8A8A90" />,
  global: <HiOutlineGlobeAlt size={20} color="#8A8A90" />,
}

const REWARD_COLORS: Record<RewardType, string> = {
  static: '#FFFFFF',
  referral: '#FFFFFF',
  node: '#FFFFFF',
  same_level: '#FFFFFF',
  global: '#FFFFFF',
}

export function RewardListPage() {
  const { t } = useTranslation()
  const { type } = useParams<{ type: string }>()
  const navigate = useNavigate()
  const {
    rewardListState,
    fetchRewardRecordsByType,
    loadMoreRewards,
    resetRewardList,
  } = usePayFiStore()
  const observerRef = useRef<IntersectionObserver | null>(null)
  const loadMoreRef = useRef<HTMLDivElement>(null)

  // 验证类型是否有效
  const validTypes: RewardType[] = ['static', 'referral', 'node', 'same_level', 'global']
  const rewardType = validTypes.includes(type as RewardType) ? (type as RewardType) : null

  // 初始加载
  useEffect(() => {
    if (rewardType) {
      // 重置列表状态，加载第一页
      resetRewardList()
      fetchRewardRecordsByType(rewardType, 1, 20)
    }
    // 组件卸载时清理
    return () => {
      resetRewardList()
    }
  }, [rewardType, fetchRewardRecordsByType, resetRewardList])

  // 滚动加载更多
  const handleLoadMore = useCallback(() => {
    // 确保第一次加载完成（currentPage > 0）后才能触发加载更多
    if (rewardType && rewardListState.currentPage > 0 && rewardListState.hasMore && !rewardListState.isLoadingMore) {
      loadMoreRewards(rewardType)
    }
  }, [rewardType, rewardListState.currentPage, rewardListState.hasMore, rewardListState.isLoadingMore, loadMoreRewards])

  // 设置 Intersection Observer 实现滚动加载
  useEffect(() => {
    if (observerRef.current) {
      observerRef.current.disconnect()
    }

    observerRef.current = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          handleLoadMore()
        }
      },
      { threshold: 0.1 }
    )

    if (loadMoreRef.current) {
      observerRef.current.observe(loadMoreRef.current)
    }

    return () => {
      if (observerRef.current) {
        observerRef.current.disconnect()
      }
    }
  }, [handleLoadMore])

  if (!rewardType) {
    // 无效类型，返回上一页
    navigate(-1)
    return null
  }

  // 使用后端返回的汇总数据（不在前端重复计算）
  const { records, totalAmount, totalCount, hasMore, isLoadingMore } = rewardListState

  const rewardTypeName = t(`reward_type.${rewardType}`)

  return (
    <Box minH="100vh" bg="#111111">
      <SecondaryPageHeader title={rewardTypeName} />

      <VStack gap="4" p="4" align="stretch">
        {/* 总收益统计 - 使用后端返回的汇总数据 */}
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
              {t('reward_list.total_records', { count: totalCount })}
            </Text>
          </Flex>
        </MotionBox>

        {/* 记录列表 */}
        {records.length === 0 && !isLoadingMore ? (
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
            {records.map((record, index) => (
              <MotionBox
                key={record.id}
                w="full"
                bg="#17171C"
                borderRadius="xl"
                p="4"
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: Math.min(index * 0.03, 0.3) }}
              >
                <Flex justify="space-between" align="center">
                  <Box>
                    <Text fontSize="md" fontWeight="600" color="white">
                      +${record.usdtValue.toFixed(2)}
                    </Text>
                    <Text fontSize="xs" color="whiteAlpha.500">
                      {new Date(record.createdAt).toLocaleString()}
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

            {/* 加载更多触发器 */}
            <Box ref={loadMoreRef} h="4" w="full" />

            {/* 加载中指示器 */}
            {isLoadingMore && (
              <Flex justify="center" py="4">
                <Spinner size="sm" color="whiteAlpha.500" />
              </Flex>
            )}

            {/* 没有更多数据 */}
            {!hasMore && records.length > 0 && (
              <Text fontSize="xs" color="whiteAlpha.400" textAlign="center" py="4">
                {t('reward_list.no_more')}
              </Text>
            )}
          </VStack>
        )}

        {/* 底部间距 */}
        <Box h="8" />
      </VStack>
    </Box>
  )
}
