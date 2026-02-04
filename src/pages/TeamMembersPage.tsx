// 团队成员页面 - 二级页面

import { Box, Flex, HStack, SimpleGrid, Text, VStack } from '@chakra-ui/react'
import { AnimatePresence, motion } from 'framer-motion'
import { useEffect, useRef, useState, useCallback } from 'react'
import {
  HiOutlineCalendarDays,
  HiOutlineChartBar,
  HiOutlineChevronRight,
  HiOutlineUserGroup,
  HiXMark,
} from 'react-icons/hi2'
import { useTranslation } from 'react-i18next'
import { CombinedBadges, MobileDatePicker } from '../components/common'
import { SecondaryPageHeader } from '../components/layout'
import { usePayFiStore } from '../stores/payfiStore'
import { getUserStateDisplay, type TeamMember } from '../types/payfi'
import { getDirectMemberPerformance } from '../api/payfi'
import type { DirectMemberPerformanceResponse } from '../api/types'

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

export function TeamMembersPage() {
  const { t } = useTranslation()
  const { teamStats, teamMembers, fetchTeamMembers } = usePayFiStore()
  const [activeTab, setActiveTab] = useState<'all' | 'direct'>('all')
  const fetchedRef = useRef(false)

  // 直推用户业绩查询相关状态
  const [selectedMember, setSelectedMember] = useState<TeamMember | null>(null)
  const [showPerformanceDrawer, setShowPerformanceDrawer] = useState(false)
  const [performanceResult, setPerformanceResult] = useState<DirectMemberPerformanceResponse | null>(null)
  const [isLoadingPerformance, setIsLoadingPerformance] = useState(false)
  const [tempTimeRange, setTempTimeRange] = useState<TimeRange>('all')
  const [tempStartDate, setTempStartDate] = useState('')
  const [tempEndDate, setTempEndDate] = useState('')
  const [showStartDatePicker, setShowStartDatePicker] = useState(false)
  const [showEndDatePicker, setShowEndDatePicker] = useState(false)

  useEffect(() => {
    // 防止 React Strict Mode 双重调用
    if (fetchedRef.current) return
    fetchedRef.current = true
    fetchTeamMembers()
  }, [fetchTeamMembers])

  // 抽屉打开时禁止背景滚动
  useEffect(() => {
    if (showPerformanceDrawer) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = ''
    }
    return () => {
      document.body.style.overflow = ''
    }
  }, [showPerformanceDrawer])

  // 查询直推用户业绩
  const fetchMemberPerformance = useCallback(async (memberId: number, range: TimeRange, customStart?: string, customEnd?: string) => {
    setIsLoadingPerformance(true)
    try {
      const dateRange = getDateRange(range, customStart, customEnd)
      const result = await getDirectMemberPerformance({
        targetUserId: memberId,
        ...dateRange,
      })
      setPerformanceResult(result)
    } catch (error) {
      console.error('获取直推用户业绩失败:', error)
      setPerformanceResult(null)
    } finally {
      setIsLoadingPerformance(false)
    }
  }, [])

  // 打开业绩查询抽屉
  const openPerformanceDrawer = (member: TeamMember) => {
    setSelectedMember(member)
    setTempTimeRange('all')
    setTempStartDate('')
    setTempEndDate('')
    setPerformanceResult(null)
    setShowPerformanceDrawer(true)
    fetchMemberPerformance(member.id, 'all')
  }

  // 应用筛选
  const applyFilter = () => {
    if (selectedMember) {
      fetchMemberPerformance(selectedMember.id, tempTimeRange, tempStartDate, tempEndDate)
    }
  }

  // 重置筛选
  const resetFilter = () => {
    setTempTimeRange('all')
    setTempStartDate('')
    setTempEndDate('')
  }

  const filteredMembers =
    activeTab === 'direct'
      ? teamMembers.filter((m) => m.isDirectReferral)
      : teamMembers

  // 使用 teamStats 中的统计数据（从 API 获取，更准确）
  const directCount = teamStats?.directCount ?? teamMembers.filter((m) => m.isDirectReferral).length

  return (
    <Box minH="100vh" bg="#111111">
      <SecondaryPageHeader title={t('team_members.title')} />

      <VStack gap="4" p="4" align="stretch">
        {/* 统计摘要 */}
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
                bg="whiteAlpha.100"
                align="center"
                justify="center"
              >
                <HiOutlineUserGroup size={20} color="#8A8A90" />
              </Flex>
              <Box>
                <Text fontSize="sm" color="whiteAlpha.600">
                  {t('team_members.team_count')}
                </Text>
                <Text fontSize="xl" fontWeight="bold" color="white">
                  {teamStats?.teamCount || teamMembers.length} {t('team_members.people')}
                </Text>
              </Box>
            </HStack>
            <VStack align="end" gap={0}>
              <Text fontSize="sm" color="white">
                {t('team_members.invite_count', { count: directCount })}
              </Text>
            </VStack>
          </Flex>
        </MotionBox>

        {/* 筛选标签 */}
        <HStack gap={2}>
          <FilterTab
            active={activeTab === 'all'}
            onClick={() => setActiveTab('all')}
            label={`${t('team_members.all')} (${teamStats?.teamCount || teamMembers.length})`}
          />
          <FilterTab
            active={activeTab === 'direct'}
            onClick={() => setActiveTab('direct')}
            label={`${t('team_members.invite')} (${directCount})`}
          />
        </HStack>

        {/* 成员列表 */}
        {filteredMembers.length === 0 ? (
          <EmptyState activeTab={activeTab} />
        ) : (
          <VStack gap={2} align="stretch">
            {filteredMembers
              .filter((member) => member && member.address) // 过滤掉空数据
              .map((member, index) => (
                <TeamMemberItem
                  key={member.id}
                  member={member}
                  delay={index * 0.03}
                  onClick={member.isDirectReferral ? () => openPerformanceDrawer(member) : undefined}
                />
              ))}
          </VStack>
        )}

        {/* 底部间距 */}
        <Box h="8" />
      </VStack>

      {/* 直推用户业绩查询抽屉 */}
      <AnimatePresence mode="wait">
        {showPerformanceDrawer && selectedMember && (
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
              onClick={() => setShowPerformanceDrawer(false)}
            />

            {/* 抽屉内容 - 从底部弹出 */}
            <MotionBox
              position="fixed"
              left={0}
              right={0}
              bottom={0}
              maxH="80vh"
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
                  <VStack align="start" gap={0}>
                    <Text fontSize="lg" fontWeight="600" color="white">
                      {t('team_members.performance_title')}
                    </Text>
                    <Text fontSize="xs" color="whiteAlpha.500" fontFamily="mono">
                      {formatAddress(selectedMember.address)}
                    </Text>
                  </VStack>
                  <Box
                    p="2"
                    cursor="pointer"
                    color="whiteAlpha.600"
                    _hover={{ color: 'white' }}
                    onClick={() => setShowPerformanceDrawer(false)}
                  >
                    <HiXMark size={20} />
                  </Box>
                </Flex>

                {/* 查询结果卡片 */}
                <MotionBox
                  bg="whiteAlpha.100"
                  borderRadius="xl"
                  p="4"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                >
                  {isLoadingPerformance ? (
                    <Flex justify="center" py={4}>
                      <Text fontSize="sm" color="whiteAlpha.500">
                        {t('common.loading')}
                      </Text>
                    </Flex>
                  ) : performanceResult ? (
                    <VStack gap={3} align="stretch">
                      <HStack gap={2}>
                        <Flex
                          w="10"
                          h="10"
                          borderRadius="lg"
                          bg="whiteAlpha.100"
                          align="center"
                          justify="center"
                        >
                          <HiOutlineChartBar size={18} color="#8A8A90" />
                        </Flex>
                        <Box flex={1}>
                          <Text fontSize="xs" color="whiteAlpha.500">
                            {t('team_members.sales_amount')}
                          </Text>
                          <Text fontSize="2xl" fontWeight="bold" color="white">
                            ${(performanceResult.totalAmount || 0).toLocaleString()}
                          </Text>
                        </Box>
                      </HStack>
                      <Flex justify="space-between" align="center" pt={2} borderTop="1px solid" borderColor="whiteAlpha.100">
                        <Text fontSize="xs" color="whiteAlpha.500">
                          {t('team_members.order_count')}
                        </Text>
                        <Text fontSize="sm" fontWeight="600" color="white">
                          {performanceResult.orderCount || 0} {t('team_performance.records_unit')}
                        </Text>
                      </Flex>
                    </VStack>
                  ) : (
                    <Flex justify="center" py={4}>
                      <Text fontSize="sm" color="whiteAlpha.500">
                        {t('team_members.no_data')}
                      </Text>
                    </Flex>
                  )}
                </MotionBox>

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

interface TeamMemberItemProps {
  member: TeamMember
  delay: number
  onClick?: () => void
}

function TeamMemberItem({ member, delay, onClick }: TeamMemberItemProps) {
  const { t } = useTranslation()

  // 确保成员数据有效
  if (!member || !member.address) {
    return null
  }

  const isClickable = member.isDirectReferral && onClick

  return (
    <MotionBox
      bg="#17171C"
      borderRadius="xl"
      p="4"
      initial={{ opacity: 0, x: -10 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay }}
      cursor={isClickable ? 'pointer' : 'default'}
      onClick={onClick}
      _hover={isClickable ? { bg: '#1f1f26' } : undefined}
    >
      <Flex justify="space-between" align="center">
        <HStack gap={3}>
          <Flex
            w="44px"
            h="44px"
            borderRadius="xl"
            bg="whiteAlpha.100"
            align="center"
            justify="center"
            flexShrink={0}
          >
            <HiOutlineUserGroup size={22} color="#71717A" />
          </Flex>
          <Box flex="1" minW="0">
            <Text fontSize="sm" fontWeight="600" color="white" fontFamily="mono">
              {formatAddress(member.address)}
            </Text>
            <HStack gap={2} mt={1}>
              <CombinedBadges
                nftLevel={member.nftLevel}
                nodeLevel={member.nodeLevel}
                size="sm"
              />
              {member.isDirectReferral && (
                <Text fontSize="10px" color="#D811F0" fontWeight="600">
                  {/* {t('team_members.invite')} */}
                </Text>
              )}
            </HStack>
          </Box>
        </HStack>
        <HStack gap={2} flexShrink={0}>
          <VStack align="end" gap={0}>
            {(() => {
              const stateInfo = getUserStateDisplay(member.state)
              return (
                <Text
                  fontSize="sm"
                  fontWeight="600"
                  color={stateInfo.isActive ? 'white' : 'whiteAlpha.500'}
                >
                  {t(`team_members.${stateInfo.display}`)}
                </Text>
              )
            })()}
            <Text fontSize="xs" color="whiteAlpha.500">
              {member.joinedAt ? formatDate(member.joinedAt) : '-'}
            </Text>
          </VStack>
          {isClickable && (
            <Box color="whiteAlpha.400">
              <HiOutlineChevronRight size={16} />
            </Box>
          )}
        </HStack>
      </Flex>
    </MotionBox>
  )
}

function EmptyState({ activeTab }: { activeTab: 'all' | 'direct' }) {
  const { t } = useTranslation()
  return (
    <Flex
      direction="column"
      align="center"
      justify="center"
      py="16"
      color="whiteAlpha.400"
    >
      <HiOutlineUserGroup size={48} />
      <Text mt="4" fontSize="sm">
        {activeTab === 'direct' ? t('team_members.no_direct') : t('team_members.no_members')}
      </Text>
      <Text fontSize="xs" color="whiteAlpha.300" mt="1">
        {t('team_members.invite_friends')}
      </Text>
    </Flex>
  )
}

function formatDate(date: Date): string {
  const d = new Date(date)
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
}

// 格式化地址，显示前6位和后4位，中间用省略号
function formatAddress(address: string): string {
  if (!address || address.length < 12) return address
  return `${address.slice(0, 6)}...${address.slice(-4)}`
}
