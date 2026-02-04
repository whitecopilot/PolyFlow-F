// 管理员数据页面 - 运营数据展示

import { Box, Flex, HStack, SimpleGrid, Spinner, Text, VStack } from '@chakra-ui/react'
import { motion } from 'framer-motion'
import { useCallback, useEffect, useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'
import {
  HiOutlineBanknotes,
  HiOutlineChartBar,
  HiOutlineCheckCircle,
  HiOutlineClock,
  HiOutlineCog6Tooth,
  HiOutlineCpuChip,
  HiOutlineCurrencyDollar,
  HiOutlineFire,
  HiOutlineQueueList,
  HiOutlineShoppingCart,
  HiOutlineSignal,
  HiOutlineXCircle,
} from 'react-icons/hi2'
import { adminApi } from '../api'
import type { CacheStatusResponse, MonitoringStatusResponse } from '../api/types'
import { SecondaryPageHeader } from '../components/layout'

const MotionBox = motion.create(Box)

// 格式化数字，保留 2 位小数，添加千分位
const formatNumber = (value: number, decimals = 2) => {
  return value.toLocaleString(undefined, {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  })
}

// 状态指示器组件
const StatusIndicator = ({ isOk, label }: { isOk: boolean; label: string }) => (
  <HStack gap={1}>
    {isOk ? (
      <HiOutlineCheckCircle size={14} color="#22C55E" />
    ) : (
      <HiOutlineXCircle size={14} color="#EF4444" />
    )}
    <Text fontSize="xs" color={isOk ? '#22C55E' : '#EF4444'}>
      {label}
    </Text>
  </HStack>
)

// Tab 类型
type TabType = 'cache' | 'monitoring'

export function AdminDataPage() {
  const { t } = useTranslation()
  const [activeTab, setActiveTab] = useState<TabType>('monitoring')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [cacheStatus, setCacheStatus] = useState<CacheStatusResponse | null>(null)
  const [monitoringStatus, setMonitoringStatus] = useState<MonitoringStatusResponse | null>(null)
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null)
  const refreshIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null)

  // 获取缓存数据
  const fetchCacheData = useCallback(async () => {
    try {
      const data = await adminApi.getCacheStatus()
      setCacheStatus(data)
      setLastUpdated(new Date())
    } catch (err) {
      console.error('获取缓存状态失败:', err)
    }
  }, [])

  // 获取监控数据
  const fetchMonitoringData = useCallback(async () => {
    try {
      const data = await adminApi.getMonitoringStatus()
      setMonitoringStatus(data)
      setLastUpdated(new Date())
    } catch (err) {
      console.error('获取监控状态失败:', err)
    }
  }, [])

  // 初始加载
  useEffect(() => {
    const fetchInitialData = async () => {
      try {
        setLoading(true)
        setError(null)
        await Promise.all([fetchCacheData(), fetchMonitoringData()])
      } catch (err) {
        console.error('初始化数据失败:', err)
        setError(err instanceof Error ? err.message : '获取数据失败')
      } finally {
        setLoading(false)
      }
    }

    fetchInitialData()
  }, [fetchCacheData, fetchMonitoringData])

  // 监控 Tab 自动刷新（10 秒）
  useEffect(() => {
    if (activeTab === 'monitoring') {
      // 清除可能存在的旧 interval
      if (refreshIntervalRef.current) {
        clearInterval(refreshIntervalRef.current)
      }

      // 设置新的自动刷新
      refreshIntervalRef.current = setInterval(() => {
        fetchMonitoringData()
      }, 10000) // 10 秒刷新一次

      return () => {
        if (refreshIntervalRef.current) {
          clearInterval(refreshIntervalRef.current)
          refreshIntervalRef.current = null
        }
      }
    }
  }, [activeTab, fetchMonitoringData])

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
  const { webSocket, taskDispatcher, taskCoordinator, eventQueues } = monitoringStatus || {}

  return (
    <Box minH="100vh" bg="#111111">
      <SecondaryPageHeader title={t('admin.title')} />

      <VStack gap="4" p="4" align="stretch">
        {/* Tab 切换 */}
        <HStack gap={2} bg="#17171C" borderRadius="lg" p="1">
          <Box
            flex={1}
            py="2"
            px="3"
            borderRadius="md"
            textAlign="center"
            cursor="pointer"
            bg={activeTab === 'monitoring' ? 'whiteAlpha.200' : 'transparent'}
            onClick={() => setActiveTab('monitoring')}
          >
            <HStack gap={1} justify="center">
              <HiOutlineSignal size={14} color={activeTab === 'monitoring' ? 'white' : '#8A8A90'} />
              <Text fontSize="sm" color={activeTab === 'monitoring' ? 'white' : 'whiteAlpha.600'}>
                {t('admin.monitoring')}
              </Text>
            </HStack>
          </Box>
          <Box
            flex={1}
            py="2"
            px="3"
            borderRadius="md"
            textAlign="center"
            cursor="pointer"
            bg={activeTab === 'cache' ? 'whiteAlpha.200' : 'transparent'}
            onClick={() => setActiveTab('cache')}
          >
            <HStack gap={1} justify="center">
              <HiOutlineChartBar size={14} color={activeTab === 'cache' ? 'white' : '#8A8A90'} />
              <Text fontSize="sm" color={activeTab === 'cache' ? 'white' : 'whiteAlpha.600'}>
                {t('admin.cache_data')}
              </Text>
            </HStack>
          </Box>
        </HStack>

        {/* 最后更新时间 */}
        {lastUpdated && (
          <Flex justify="flex-end" px="1">
            <Text fontSize="xs" color="whiteAlpha.400">
              {t('admin.last_updated')}: {lastUpdated.toLocaleTimeString()}
              {activeTab === 'monitoring' && ` (${t('admin.auto_refresh')} 10s)`}
            </Text>
          </Flex>
        )}

        {/* 监控 Tab 内容 */}
        {activeTab === 'monitoring' && (
          <>
            {/* WebSocket 状态 */}
            <Box>
              <Text fontSize="sm" fontWeight="600" color="whiteAlpha.600" mb="3">
                {t('admin.ws_status')}
              </Text>

              <MotionBox
                bg="#17171C"
                borderRadius="xl"
                p="4"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
              >
                <Flex justify="space-between" align="center" mb={3}>
                  <HStack gap={2}>
                    <HiOutlineSignal size={16} color="#8A8A90" />
                    <Text fontSize="xs" color="whiteAlpha.600">{t('admin.chain_event_ws')}</Text>
                  </HStack>
                  <StatusIndicator
                    isOk={webSocket?.isConnected ?? false}
                    label={webSocket?.isConnected ? t('admin.connected') : t('admin.disconnected')}
                  />
                </Flex>

                <SimpleGrid columns={2} gap={3}>
                  <Box>
                    <Text fontSize="xs" color="whiteAlpha.500">{t('admin.service_running')}</Text>
                    <StatusIndicator isOk={webSocket?.isRunning ?? false} label={webSocket?.isRunning ? 'Yes' : 'No'} />
                  </Box>
                  <Box>
                    <Text fontSize="xs" color="whiteAlpha.500">{t('admin.last_block')}</Text>
                    <Text fontSize="sm" color="white">{webSocket?.lastBlockNumber?.toLocaleString() || '-'}</Text>
                  </Box>
                  <Box>
                    <Text fontSize="xs" color="whiteAlpha.500">{t('admin.usdt_monitor')}</Text>
                    <StatusIndicator isOk={webSocket?.usdtMonitorEnabled ?? false} label={webSocket?.usdtMonitorEnabled ? t('admin.enabled') : t('admin.disabled')} />
                  </Box>
                  <Box>
                    <Text fontSize="xs" color="whiteAlpha.500">{t('admin.pic_burn_monitor')}</Text>
                    <StatusIndicator isOk={webSocket?.picBurnMonitorEnabled ?? false} label={webSocket?.picBurnMonitorEnabled ? t('admin.enabled') : t('admin.disabled')} />
                  </Box>
                </SimpleGrid>
              </MotionBox>
            </Box>

            {/* 任务调度器状态 */}
            <Box>
              <Text fontSize="sm" fontWeight="600" color="whiteAlpha.600" mb="3">
                {t('admin.dispatcher_status')}
              </Text>

              <MotionBox
                bg="#17171C"
                borderRadius="xl"
                p="4"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.05 }}
              >
                <Flex justify="space-between" align="center" mb={3}>
                  <HStack gap={2}>
                    <HiOutlineCpuChip size={16} color="#8A8A90" />
                    <Text fontSize="xs" color="whiteAlpha.600">{t('admin.event_dispatcher')}</Text>
                  </HStack>
                  <StatusIndicator
                    isOk={taskDispatcher?.isRunning ?? false}
                    label={taskDispatcher?.isRunning ? t('admin.running') : t('admin.stopped')}
                  />
                </Flex>

                <SimpleGrid columns={2} gap={3}>
                  <Box>
                    <Text fontSize="xs" color="whiteAlpha.500">{t('admin.queue_usage')}</Text>
                    <Text fontSize="sm" color="white">
                      {taskDispatcher?.queueLength ?? 0} / {taskDispatcher?.queueCapacity ?? 0}
                    </Text>
                  </Box>
                  <Box>
                    <Text fontSize="xs" color="whiteAlpha.500">{t('admin.pending_tasks')}</Text>
                    <Text fontSize="sm" color="white">{taskDispatcher?.pendingTasks ?? 0}</Text>
                  </Box>
                  <Box>
                    <Text fontSize="xs" color="whiteAlpha.500">{t('admin.worker_count')}</Text>
                    <Text fontSize="sm" color="white">{taskDispatcher?.workerCount ?? 0}</Text>
                  </Box>
                  <Box>
                    <Text fontSize="xs" color="whiteAlpha.500">{t('admin.registered_types')}</Text>
                    <Text fontSize="sm" color="white">{taskDispatcher?.registeredTypes?.length ?? 0}</Text>
                  </Box>
                </SimpleGrid>
              </MotionBox>
            </Box>

            {/* 定时任务协调器状态 */}
            <Box>
              <Text fontSize="sm" fontWeight="600" color="whiteAlpha.600" mb="3">
                {t('admin.coordinator_status')}
              </Text>

              <MotionBox
                bg="#17171C"
                borderRadius="xl"
                p="4"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
              >
                <HStack gap={2} mb={3}>
                  <HiOutlineCog6Tooth size={16} color="#8A8A90" />
                  <Text fontSize="xs" color="whiteAlpha.600">{t('admin.scheduled_tasks')}</Text>
                </HStack>

                <SimpleGrid columns={2} gap={3}>
                  <Box>
                    <Text fontSize="xs" color="whiteAlpha.500">{t('admin.total_executed')}</Text>
                    <Text fontSize="sm" color="white">{taskCoordinator?.totalTasks ?? 0}</Text>
                  </Box>
                  <Box>
                    <Text fontSize="xs" color="whiteAlpha.500">{t('admin.success_rate')}</Text>
                    <Text fontSize="sm" color={
                      (taskCoordinator?.successRate ?? 0) >= 95 ? '#22C55E' :
                      (taskCoordinator?.successRate ?? 0) >= 80 ? '#F59E0B' : '#EF4444'
                    }>
                      {formatNumber(taskCoordinator?.successRate ?? 0, 1)}%
                    </Text>
                  </Box>
                  <Box>
                    <Text fontSize="xs" color="whiteAlpha.500">{t('admin.avg_wait_time')}</Text>
                    <Text fontSize="sm" color="white">{taskCoordinator?.avgWaitTime || '-'}</Text>
                  </Box>
                  <Box>
                    <Text fontSize="xs" color="whiteAlpha.500">{t('admin.avg_exec_time')}</Text>
                    <Text fontSize="sm" color="white">{taskCoordinator?.avgExecutionTime || '-'}</Text>
                  </Box>
                  <Box>
                    <Text fontSize="xs" color="whiteAlpha.500">{t('admin.current_task')}</Text>
                    <Text fontSize="sm" color="white" truncate>{taskCoordinator?.currentTask || '-'}</Text>
                  </Box>
                  <Box>
                    <Text fontSize="xs" color="whiteAlpha.500">{t('admin.queue_length')}</Text>
                    <Text fontSize="sm" color="white">{taskCoordinator?.queueLength ?? 0}</Text>
                  </Box>
                </SimpleGrid>
              </MotionBox>
            </Box>

            {/* 事件队列状态 */}
            {eventQueues && Object.keys(eventQueues).length > 0 && (
              <Box>
                <Text fontSize="sm" fontWeight="600" color="whiteAlpha.600" mb="3">
                  {t('admin.event_queues')}
                </Text>

                <MotionBox
                  bg="#17171C"
                  borderRadius="xl"
                  p="4"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.15 }}
                >
                  <HStack gap={2} mb={3}>
                    <HiOutlineQueueList size={16} color="#8A8A90" />
                    <Text fontSize="xs" color="whiteAlpha.600">{t('admin.queue_stats')}</Text>
                  </HStack>

                  <VStack gap={2} align="stretch">
                    {Object.entries(eventQueues).map(([queueName, stats]) => (
                      <Flex
                        key={queueName}
                        justify="space-between"
                        align="center"
                        py="2"
                        borderBottom="1px solid"
                        borderColor="whiteAlpha.100"
                      >
                        <Text fontSize="sm" color="whiteAlpha.700">{queueName}</Text>
                        <HStack gap={4}>
                          <Text fontSize="xs" color="#22C55E">
                            {t('admin.processed')}: {stats.totalProcessed}
                          </Text>
                          <Text fontSize="xs" color={stats.currentActive > 0 ? '#3B82F6' : 'whiteAlpha.500'}>
                            {t('admin.running')}: {stats.currentActive}
                          </Text>
                        </HStack>
                      </Flex>
                    ))}
                  </VStack>
                </MotionBox>
              </Box>
            )}
          </>
        )}

        {/* 缓存 Tab 内容 */}
        {activeTab === 'cache' && (
          <>
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
          </>
        )}

        {/* 底部间距 */}
        <Box h="8" />
      </VStack>
    </Box>
  )
}
