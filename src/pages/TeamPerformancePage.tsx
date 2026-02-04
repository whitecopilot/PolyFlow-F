// 团队业绩页面 - 二级页面

import { Box, Flex, HStack, SimpleGrid, Text, VStack } from '@chakra-ui/react'
import { AnimatePresence, motion } from 'framer-motion'
import { useEffect, useRef, useState, useCallback } from 'react'
import {
  HiOutlineAdjustmentsHorizontal,
  HiOutlineCalendarDays,
  HiOutlineChartBar,
  HiOutlineFire,
  HiXMark,
} from 'react-icons/hi2'
import { useTranslation } from 'react-i18next'
import { SecondaryPageHeader } from '../components/layout'
import { MobileDatePicker } from '../components/common'
import { usePayFiStore } from '../stores/payfiStore'
import type { TeamPerformanceItem } from '../api/types'

const MotionBox = motion.create(Box)

// 时间范围选项
type TimeRange = 'all' | 'today' | 'week' | 'month' | 'custom'

// 获取日期范围
function getDateRange(range: TimeRange, customStart?: string, customEnd?: string): { startDate?: string; endDate?: string } {
  if (range === 'all') return {}
  if (range === 'custom') {
    return { startDate: customStart, endDate: customEnd }
  }

  const now = new Date()
  const endDate = now.toISOString().split('T')[0]
  let startDate: string

  switch (range) {
    case 'today':
      startDate = endDate
      break
    case 'week':
      const weekAgo = new Date(now)
      weekAgo.setDate(weekAgo.getDate() - 7)
      startDate = weekAgo.toISOString().split('T')[0]
      break
    case 'month':
      const monthAgo = new Date(now)
      monthAgo.setMonth(monthAgo.getMonth() - 1)
      startDate = monthAgo.toISOString().split('T')[0]
      break
    default:
      return {}
  }

  return { startDate, endDate }
}

// 获取时间范围的显示文本
function getTimeRangeLabel(range: TimeRange, t: (key: string) => string, customStart?: string, customEnd?: string): string {
  switch (range) {
    case 'all':
      return t('team_performance.time_all')
    case 'today':
      return t('team_performance.time_today')
    case 'week':
      return t('team_performance.time_week')
    case 'month':
      return t('team_performance.time_month')
    case 'custom':
      if (customStart && customEnd) {
        return `${customStart} ~ ${customEnd}`
      }
      return t('team_performance.time_custom')
    default:
      return t('team_performance.time_all')
  }
}

export function TeamPerformancePage() {
  const { t } = useTranslation()
  const {
    teamPerformanceState,
    fetchTeamPerformance,
    loadMoreTeamPerformance,
    resetTeamPerformance,
  } = usePayFiStore()
  const [activeTab, setActiveTab] = useState<'all' | 'stake' | 'burn'>('all')
  const [timeRange, setTimeRange] = useState<TimeRange>('all')
  const [customStartDate, setCustomStartDate] = useState('')
  const [customEndDate, setCustomEndDate] = useState('')
  const [showFilterDrawer, setShowFilterDrawer] = useState(false)
  const [tempTimeRange, setTempTimeRange] = useState<TimeRange>('all')
  const [tempStartDate, setTempStartDate] = useState('')
  const [tempEndDate, setTempEndDate] = useState('')
  const [showStartDatePicker, setShowStartDatePicker] = useState(false)
  const [showEndDatePicker, setShowEndDatePicker] = useState(false)
  const fetchedRef = useRef(false)

  // 根据时间范围获取数据
  const fetchWithTimeRange = useCallback((range: TimeRange, customStart?: string, customEnd?: string) => {
    const dateRange = getDateRange(range, customStart, customEnd)
    fetchTeamPerformance(dateRange)
  }, [fetchTeamPerformance])

  useEffect(() => {
    if (fetchedRef.current) return
    fetchedRef.current = true
    fetchWithTimeRange(timeRange)

    return () => {
      resetTeamPerformance()
    }
  }, [fetchWithTimeRange, resetTeamPerformance, timeRange])

  // 抽屉打开时禁止背景滚动
  useEffect(() => {
    if (showFilterDrawer) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = ''
    }
    return () => {
      document.body.style.overflow = ''
    }
  }, [showFilterDrawer])

  // 打开筛选抽屉
  const openFilterDrawer = () => {
    setTempTimeRange(timeRange)
    setTempStartDate(customStartDate)
    setTempEndDate(customEndDate)
    setShowFilterDrawer(true)
  }

  // 应用筛选
  const applyFilter = () => {
    setTimeRange(tempTimeRange)
    setCustomStartDate(tempStartDate)
    setCustomEndDate(tempEndDate)
    setShowFilterDrawer(false)
    resetTeamPerformance()
    fetchedRef.current = true
    fetchWithTimeRange(tempTimeRange, tempStartDate, tempEndDate)
  }

  // 重置筛选
  const resetFilter = () => {
    setTempTimeRange('all')
    setTempStartDate('')
    setTempEndDate('')
  }

  // 按类型过滤
  const filteredItems =
    activeTab === 'all'
      ? teamPerformanceState.items
      : teamPerformanceState.items.filter((item) => item.type === activeTab)

  const stakeCount = teamPerformanceState.items.filter((item) => item.type === 'stake').length
  const burnCount = teamPerformanceState.items.filter((item) => item.type === 'burn').length

  // 处理滚动加载更多
  const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
    const { scrollTop, scrollHeight, clientHeight } = e.currentTarget
    if (scrollHeight - scrollTop - clientHeight < 100 && teamPerformanceState.hasMore && !teamPerformanceState.isLoadingMore) {
      loadMoreTeamPerformance()
    }
  }

  // 是否有筛选条件
  const hasFilter = timeRange !== 'all'

  return (
    <Box minH="100vh" bg="#111111" onScroll={handleScroll} overflowY="auto">
      <SecondaryPageHeader title={t('team_performance.title')} />

      <VStack gap="4" p="4" align="stretch">
        {/* 汇总卡片 */}
        <SimpleGrid columns={2} gap="3">
          <MotionBox
            bg="#17171C"
            borderRadius="xl"
            p="4"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <HStack gap={2} mb={2}>
              <Flex
                w="8"
                h="8"
                borderRadius="lg"
                bg="whiteAlpha.100"
                align="center"
                justify="center"
              >
                <HiOutlineChartBar size={16} color="#8A8A90" />
              </Flex>
              <Text fontSize="xs" color="whiteAlpha.600">
                {t('team_performance.total_stake')}
              </Text>
            </HStack>
            <Text fontSize="xl" fontWeight="bold" color="white">
              ${(teamPerformanceState.summary?.totalStakeAmount || 0).toLocaleString()}
            </Text>
            <Text fontSize="xs" color="whiteAlpha.500" mt={1}>
              {teamPerformanceState.summary?.stakeCount || 0} {t('team_performance.records_unit')}
            </Text>
          </MotionBox>

          <MotionBox
            bg="#17171C"
            borderRadius="xl"
            p="4"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.05 }}
          >
            <HStack gap={2} mb={2}>
              <Flex
                w="8"
                h="8"
                borderRadius="lg"
                bg="whiteAlpha.100"
                align="center"
                justify="center"
              >
                <HiOutlineFire size={16} color="#8A8A90" />
              </Flex>
              <Text fontSize="xs" color="whiteAlpha.600">
                {t('team_performance.total_burn')}
              </Text>
            </HStack>
            <Text fontSize="xl" fontWeight="bold" color="white">
              ${(teamPerformanceState.summary?.totalBurnAmount || 0).toLocaleString()}
            </Text>
            <Text fontSize="xs" color="whiteAlpha.500" mt={1}>
              {teamPerformanceState.summary?.burnCount || 0} {t('team_performance.records_unit')}
            </Text>
          </MotionBox>
        </SimpleGrid>

        {/* 类型筛选标签 + 筛选按钮 */}
        <Flex justify="space-between" align="center">
          <HStack gap={2}>
            <FilterTab
              active={activeTab === 'all'}
              onClick={() => setActiveTab('all')}
              label={`${t('team_performance.all')} (${teamPerformanceState.items.length})`}
            />
            <FilterTab
              active={activeTab === 'stake'}
              onClick={() => setActiveTab('stake')}
              label={`${t('team_performance.type_stake')} (${stakeCount})`}
            />
            <FilterTab
              active={activeTab === 'burn'}
              onClick={() => setActiveTab('burn')}
              label={`${t('team_performance.type_burn')} (${burnCount})`}
            />
          </HStack>

          {/* 筛选按钮 */}
          <Flex
            w="36px"
            h="36px"
            borderRadius="lg"
            bg={hasFilter ? 'white' : 'whiteAlpha.100'}
            color={hasFilter ? 'black' : 'whiteAlpha.600'}
            align="center"
            justify="center"
            cursor="pointer"
            onClick={openFilterDrawer}
            transition="all 0.2s"
            _hover={{ bg: hasFilter ? 'whiteAlpha.900' : 'whiteAlpha.200' }}
          >
            <HiOutlineAdjustmentsHorizontal size={18} />
          </Flex>
        </Flex>

        {/* 当前筛选条件提示 */}
        {hasFilter && (
          <HStack gap={2} px={1}>
            <Text fontSize="xs" color="whiteAlpha.500">
              {t('team_performance.filter_active')}:
            </Text>
            <Text fontSize="xs" color="white" fontWeight="500">
              {getTimeRangeLabel(timeRange, t, customStartDate, customEndDate)}
            </Text>
          </HStack>
        )}

        {/* 记录列表 */}
        {filteredItems.length === 0 ? (
          <EmptyState />
        ) : (
          <VStack gap={2} align="stretch">
            {filteredItems.map((item) => (
              <PerformanceItem key={`${item.type}-${item.id}`} item={item} />
            ))}
          </VStack>
        )}

        {/* 加载更多提示 */}
        {teamPerformanceState.isLoadingMore && (
          <Flex justify="center" py={4}>
            <Text fontSize="sm" color="whiteAlpha.500">
              {t('common.loading')}
            </Text>
          </Flex>
        )}

        {/* 底部间距 */}
        <Box h="8" />
      </VStack>

      {/* 筛选抽屉 */}
      <AnimatePresence mode="wait">
        {showFilterDrawer && (
          <>
            {/* 遮罩层 */}
            <MotionBox
              position="fixed"
              inset={0}
              bg="blackAlpha.700"
              zIndex={100}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowFilterDrawer(false)}
            />

            {/* 抽屉内容 - 从底部弹出 */}
            <MotionBox
              position="fixed"
              left={0}
              right={0}
              bottom={0}
              maxH="70vh"
              bg="#17171C"
              borderTopRadius="2xl"
              zIndex={101}
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            >
              <VStack p="5" gap={4} align="stretch">
                {/* 顶部拖动条 */}
                <Flex justify="center">
                  <Box w="40px" h="4px" bg="whiteAlpha.300" borderRadius="full" />
                </Flex>

                {/* 标题栏 */}
                <Flex justify="space-between" align="center">
                  <Text fontSize="lg" fontWeight="600" color="white">
                    {t('team_performance.filter_title')}
                  </Text>
                  <Box
                    p="2"
                    cursor="pointer"
                    color="whiteAlpha.600"
                    _hover={{ color: 'white' }}
                    onClick={() => setShowFilterDrawer(false)}
                  >
                    <HiXMark size={20} />
                  </Box>
                </Flex>

                {/* 快捷时间选项 */}
                <Box>
                  <Text fontSize="sm" color="whiteAlpha.500" mb={3}>
                    {t('team_performance.quick_select')}
                  </Text>
                  <SimpleGrid columns={4} gap={2}>
                    <QuickTimeOption
                      active={tempTimeRange === 'all'}
                      onClick={() => {
                        setTempTimeRange('all')
                        setTempStartDate('')
                        setTempEndDate('')
                      }}
                      label={t('team_performance.time_all')}
                    />
                    <QuickTimeOption
                      active={tempTimeRange === 'today'}
                      onClick={() => {
                        const today = new Date().toISOString().split('T')[0]
                        setTempTimeRange('today')
                        setTempStartDate(today)
                        setTempEndDate(today)
                      }}
                      label={t('team_performance.time_today')}
                    />
                    <QuickTimeOption
                      active={tempTimeRange === 'week'}
                      onClick={() => {
                        const now = new Date()
                        const endDate = now.toISOString().split('T')[0]
                        const weekAgo = new Date(now)
                        weekAgo.setDate(weekAgo.getDate() - 7)
                        const startDate = weekAgo.toISOString().split('T')[0]
                        setTempTimeRange('week')
                        setTempStartDate(startDate)
                        setTempEndDate(endDate)
                      }}
                      label={t('team_performance.time_week')}
                    />
                    <QuickTimeOption
                      active={tempTimeRange === 'month'}
                      onClick={() => {
                        const now = new Date()
                        const endDate = now.toISOString().split('T')[0]
                        const monthAgo = new Date(now)
                        monthAgo.setMonth(monthAgo.getMonth() - 1)
                        const startDate = monthAgo.toISOString().split('T')[0]
                        setTempTimeRange('month')
                        setTempStartDate(startDate)
                        setTempEndDate(endDate)
                      }}
                      label={t('team_performance.time_month')}
                    />
                  </SimpleGrid>
                </Box>

                {/* 自定义日期范围 */}
                <Box>
                  <Text fontSize="sm" color="whiteAlpha.500" mb={3}>
                    {t('team_performance.custom_range')}
                  </Text>
                  <HStack gap={3}>
                    <Box flex={1}>
                      <Text fontSize="xs" color="whiteAlpha.400" mb={1}>
                        {t('team_performance.start_date')}
                      </Text>
                      <Flex
                        bg="whiteAlpha.100"
                        borderRadius="lg"
                        px={3}
                        h="44px"
                        align="center"
                        justify="space-between"
                        cursor="pointer"
                        _hover={{ bg: 'whiteAlpha.150' }}
                        onClick={() => setShowStartDatePicker(true)}
                      >
                        <Text
                          fontSize="sm"
                          color={tempStartDate ? 'white' : 'whiteAlpha.400'}
                        >
                          {tempStartDate || t('team_performance.select_date')}
                        </Text>
                        <HiOutlineCalendarDays size={18} color="rgba(255,255,255,0.4)" />
                      </Flex>
                    </Box>
                    <Text color="whiteAlpha.400" pt={5}>~</Text>
                    <Box flex={1}>
                      <Text fontSize="xs" color="whiteAlpha.400" mb={1}>
                        {t('team_performance.end_date')}
                      </Text>
                      <Flex
                        bg="whiteAlpha.100"
                        borderRadius="lg"
                        px={3}
                        h="44px"
                        align="center"
                        justify="space-between"
                        cursor="pointer"
                        _hover={{ bg: 'whiteAlpha.150' }}
                        onClick={() => setShowEndDatePicker(true)}
                      >
                        <Text
                          fontSize="sm"
                          color={tempEndDate ? 'white' : 'whiteAlpha.400'}
                        >
                          {tempEndDate || t('team_performance.select_date')}
                        </Text>
                        <HiOutlineCalendarDays size={18} color="rgba(255,255,255,0.4)" />
                      </Flex>
                    </Box>
                  </HStack>
                </Box>

                {/* 操作按钮 */}
                <HStack gap={3} pt={2}>
                  <Box
                    flex={1}
                    py={3}
                    textAlign="center"
                    borderRadius="xl"
                    bg="whiteAlpha.100"
                    color="whiteAlpha.700"
                    fontSize="sm"
                    fontWeight="600"
                    cursor="pointer"
                    _hover={{ bg: 'whiteAlpha.200' }}
                    onClick={resetFilter}
                  >
                    {t('team_performance.reset')}
                  </Box>
                  <Box
                    flex={2}
                    py={3}
                    textAlign="center"
                    borderRadius="xl"
                    bg="white"
                    color="black"
                    fontSize="sm"
                    fontWeight="600"
                    cursor="pointer"
                    _hover={{ bg: 'whiteAlpha.900' }}
                    onClick={applyFilter}
                  >
                    {t('common.confirm')}
                  </Box>
                </HStack>

                {/* 安全区域间距 */}
                <Box h="env(safe-area-inset-bottom, 20px)" />
              </VStack>
            </MotionBox>
          </>
        )}
      </AnimatePresence>

      {/* 开始日期选择器 */}
      <MobileDatePicker
        isOpen={showStartDatePicker}
        onClose={() => setShowStartDatePicker(false)}
        value={tempStartDate}
        title={t('team_performance.start_date')}
        onConfirm={(date) => {
          setTempStartDate(date)
          setTempTimeRange('custom')
        }}
      />

      {/* 结束日期选择器 */}
      <MobileDatePicker
        isOpen={showEndDatePicker}
        onClose={() => setShowEndDatePicker(false)}
        value={tempEndDate}
        title={t('team_performance.end_date')}
        onConfirm={(date) => {
          setTempEndDate(date)
          setTempTimeRange('custom')
        }}
      />
    </Box>
  )
}

interface FilterTabProps {
  active: boolean
  onClick: () => void
  label: string
}

function FilterTab({ active, onClick, label }: FilterTabProps) {
  return (
    <Box
      px="4"
      py="2"
      borderRadius="full"
      bg={active ? 'whiteAlpha.300' : 'whiteAlpha.100'}
      color={active ? 'white' : 'whiteAlpha.600'}
      fontSize="sm"
      fontWeight="600"
      cursor="pointer"
      transition="all 0.2s"
      onClick={onClick}
      _hover={!active ? { bg: 'whiteAlpha.200' } : undefined}
    >
      {label}
    </Box>
  )
}

interface QuickTimeOptionProps {
  active: boolean
  onClick: () => void
  label: string
}

function QuickTimeOption({ active, onClick, label }: QuickTimeOptionProps) {
  return (
    <Box
      py={2}
      textAlign="center"
      borderRadius="lg"
      bg={active ? 'white' : 'whiteAlpha.100'}
      color={active ? 'black' : 'whiteAlpha.600'}
      fontSize="sm"
      fontWeight={active ? '600' : '500'}
      cursor="pointer"
      transition="all 0.2s"
      onClick={onClick}
      _hover={!active ? { bg: 'whiteAlpha.200' } : undefined}
    >
      {label}
    </Box>
  )
}

interface PerformanceItemProps {
  item: TeamPerformanceItem
}

function PerformanceItem({ item }: PerformanceItemProps) {
  const { t } = useTranslation()
  const isStake = item.type === 'stake'

  return (
    <MotionBox
      bg="#17171C"
      borderRadius="xl"
      p="4"
      initial={{ opacity: 0, x: -10 }}
      animate={{ opacity: 1, x: 0 }}
    >
      <Flex justify="space-between" align="center">
        <HStack gap={3}>
          <Flex
            w="40px"
            h="40px"
            borderRadius="xl"
            bg="whiteAlpha.100"
            align="center"
            justify="center"
            flexShrink={0}
          >
            {isStake ? (
              <HiOutlineChartBar size={18} color="#71717A" />
            ) : (
              <HiOutlineFire size={18} color="#71717A" />
            )}
          </Flex>
          <Box flex="1" minW="0">
            <Text fontSize="sm" fontWeight="600" color="white" fontFamily="mono">
              {formatAddress(item.userAddress)}
            </Text>
            <HStack gap={2} mt={1}>
              <Text fontSize="10px" color="whiteAlpha.500">
                {isStake ? t('team_performance.type_stake') : t('team_performance.type_burn')}
              </Text>
              <Text fontSize="10px" color="whiteAlpha.400">
                {formatDate(item.createdAt)}
              </Text>
            </HStack>
          </Box>
        </HStack>
        <Text fontSize="sm" fontWeight="600" color="white">
          ${(item.amount || 0).toLocaleString()}
        </Text>
      </Flex>
    </MotionBox>
  )
}

function EmptyState() {
  const { t } = useTranslation()
  return (
    <Flex
      direction="column"
      align="center"
      justify="center"
      py="16"
      color="whiteAlpha.400"
    >
      <HiOutlineChartBar size={48} />
      <Text mt="4" fontSize="sm">
        {t('team_performance.no_records')}
      </Text>
      <Text fontSize="xs" color="whiteAlpha.300" mt="1">
        {t('team_performance.invite_hint')}
      </Text>
    </Flex>
  )
}

function formatAddress(address: string): string {
  if (!address || address.length < 12) return address || '-'
  return `${address.slice(0, 6)}...${address.slice(-4)}`
}

function formatDate(dateStr: string): string {
  if (!dateStr) return '-'
  // 简化显示日期
  return dateStr.split(' ')[0] || dateStr
}
