// 管理员数据页面 - 运营数据展示

import { Box, Flex, HStack, SimpleGrid, Spinner, Text, VStack } from '@chakra-ui/react'
import { motion } from 'framer-motion'
import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import {
  HiOutlineBanknotes,
  HiOutlineChartBar,
  HiOutlineClock,
  HiOutlineCurrencyDollar,
  HiOutlineFire,
  HiOutlineShoppingCart,
} from 'react-icons/hi2'
import { adminApi } from '../api'
import type { CacheStatusResponse } from '../api/types'
import { SecondaryPageHeader } from '../components/layout'

const MotionBox = motion.create(Box)

// 格式化数字，保留 2 位小数，添加千分位
const formatNumber = (value: number, decimals = 2) => {
  return value.toLocaleString(undefined, {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  })
}

export function AdminDataPage() {
  const { t } = useTranslation()
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [cacheStatus, setCacheStatus] = useState<CacheStatusResponse | null>(null)

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true)
        setError(null)
        const data = await adminApi.getCacheStatus()
        setCacheStatus(data)
      } catch (err) {
        console.error('获取缓存状态失败:', err)
        setError(err instanceof Error ? err.message : '获取数据失败')
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [])

  if (loading) {
    return (
      <Box minH="100vh" bg="#111111">
        <SecondaryPageHeader title={t('admin.title')} />
        <Flex justify="center" align="center" h="60vh">
          <Spinner size="lg" color="orange.500" />
        </Flex>
      </Box>
    )
  }

  if (error) {
    return (
      <Box minH="100vh" bg="#111111">
        <SecondaryPageHeader title={t('admin.title')} />
        <Flex justify="center" align="center" h="60vh">
          <Text color="red.400">{error}</Text>
        </Flex>
      </Box>
    )
  }

  const { globalStats, dailyFees, systemInfo } = cacheStatus || {}

  return (
    <Box minH="100vh" bg="#111111">
      <SecondaryPageHeader title={t('admin.title')} />

      <VStack gap="5" p="4" align="stretch">
        {/* 系统信息 */}
        <MotionBox
          bg="#17171C"
          borderRadius="xl"
          p="4"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <HStack gap={2} mb={3}>
            <HiOutlineClock size={16} color="#8A8A90" />
            <Text fontSize="xs" color="whiteAlpha.600">{t('admin.system_info')}</Text>
          </HStack>
          <SimpleGrid columns={2} gap={3}>
            <Box>
              <Text fontSize="xs" color="whiteAlpha.500">{t('admin.current_time')}</Text>
              <Text fontSize="sm" color="white">{systemInfo?.currentTime}</Text>
            </Box>
            <Box>
              <Text fontSize="xs" color="whiteAlpha.500">{t('admin.timezone')}</Text>
              <Text fontSize="sm" color="white">{systemInfo?.timezone}</Text>
            </Box>
          </SimpleGrid>
        </MotionBox>

        {/* 全局统计 */}
        <Box>
          <Text fontSize="sm" fontWeight="600" color="whiteAlpha.600" mb="3">
            {t('admin.global_stats')}
          </Text>

          <SimpleGrid columns={2} gap="3">
            {/* NFT 销售总额 */}
            <MotionBox
              bg="#17171C"
              borderRadius="xl"
              p="4"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.05 }}
            >
              <HStack gap={2} mb={2}>
                <HiOutlineShoppingCart size={16} color="#22C55E" />
                <Text fontSize="xs" color="whiteAlpha.600">{t('admin.nft_sales')}</Text>
              </HStack>
              <Text fontSize="xl" fontWeight="bold" color="#22C55E">
                ${formatNumber(globalStats?.totalNFTSales || 0)}
              </Text>
            </MotionBox>

            {/* PIC 铸造总量 */}
            <MotionBox
              bg="#17171C"
              borderRadius="xl"
              p="4"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
            >
              <HStack gap={2} mb={2}>
                <HiOutlineCurrencyDollar size={16} color="#3B82F6" />
                <Text fontSize="xs" color="whiteAlpha.600">{t('admin.pic_minted')}</Text>
              </HStack>
              <Text fontSize="xl" fontWeight="bold" color="#3B82F6">
                {formatNumber(globalStats?.totalPICMinted || 0)}
              </Text>
            </MotionBox>

            {/* PIC 销毁总量 */}
            <MotionBox
              bg="#17171C"
              borderRadius="xl"
              p="4"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.15 }}
            >
              <HStack gap={2} mb={2}>
                <HiOutlineFire size={16} color="#F97316" />
                <Text fontSize="xs" color="whiteAlpha.600">{t('admin.pic_burned')}</Text>
              </HStack>
              <Text fontSize="xl" fontWeight="bold" color="#F97316">
                {formatNumber(globalStats?.totalPICBurned || 0)}
              </Text>
            </MotionBox>

            {/* 累计手续费 */}
            <MotionBox
              bg="#17171C"
              borderRadius="xl"
              p="4"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
            >
              <HStack gap={2} mb={2}>
                <HiOutlineBanknotes size={16} color="#A855F7" />
                <Text fontSize="xs" color="whiteAlpha.600">{t('admin.total_fees')}</Text>
              </HStack>
              <Text fontSize="xl" fontWeight="bold" color="#A855F7">
                ${formatNumber(globalStats?.totalFees || 0)}
              </Text>
            </MotionBox>
          </SimpleGrid>
        </Box>

        {/* 每日手续费 */}
        <Box>
          <Text fontSize="sm" fontWeight="600" color="whiteAlpha.600" mb="3">
            {t('admin.daily_fees')}
          </Text>

          <MotionBox
            bg="#17171C"
            borderRadius="xl"
            p="4"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.25 }}
          >
            <HStack gap={2} mb={3}>
              <HiOutlineChartBar size={16} color="#8A8A90" />
              <Text fontSize="xs" color="whiteAlpha.600">{t('admin.recent_fees')}</Text>
            </HStack>

            <VStack gap={2} align="stretch">
              {dailyFees && dailyFees.length > 0 ? (
                dailyFees.map((item, index) => (
                  <Flex
                    key={item.date}
                    justify="space-between"
                    align="center"
                    py="2"
                    borderBottom={index < dailyFees.length - 1 ? '1px solid' : 'none'}
                    borderColor="whiteAlpha.100"
                  >
                    <Text fontSize="sm" color="whiteAlpha.700">{item.date}</Text>
                    <Text fontSize="sm" fontWeight="600" color={item.fees > 0 ? '#22C55E' : 'whiteAlpha.500'}>
                      ${formatNumber(item.fees)}
                    </Text>
                  </Flex>
                ))
              ) : (
                <Text fontSize="sm" color="whiteAlpha.500" textAlign="center" py="4">
                  {t('admin.no_data')}
                </Text>
              )}
            </VStack>
          </MotionBox>
        </Box>

        {/* 底部间距 */}
        <Box h="8" />
      </VStack>
    </Box>
  )
}
